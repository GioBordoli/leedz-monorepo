import { Request, Response } from 'express';
import { getStripe, isStripeConfigured, stripeConfig } from '../config/stripe';
import { UserModel } from '../models/User';

export class BillingController {
  /**
   * Create a Stripe Checkout Session for subscription
   */
  static async createCheckoutSession(req: Request, res: Response): Promise<void> {
    console.log('🔵 Creating checkout session...');
    try {
      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        console.log('❌ Stripe not configured');
        res.status(500).json({ 
          error: 'Billing system not configured',
          message: 'Stripe integration is not set up. Please contact support.'
        });
        return;
      }

      const userId = (req as any).user?.id;
      console.log('🔵 User ID:', userId);
      if (!userId) {
        console.log('❌ No user ID found');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Create or get Stripe customer
      let customerId = user.stripe_customer_id;
      
      if (!customerId) {
        const stripe = getStripe();
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: userId.toString(),
          },
        });
        
        customerId = customer.id;
        await UserModel.updateStripeCustomerId(userId, customerId);
      }

      // Create Checkout Session
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: stripeConfig.prices.monthly,
            quantity: 1,
          },
        ],
        success_url: stripeConfig.urls.success,
        cancel_url: stripeConfig.urls.cancel,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        metadata: {
          userId: userId.toString(),
        },
      });

      console.log('✅ Checkout session created:', session.id);
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      console.error('Error details:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * Create a Stripe Customer Portal Session
   */
  static async createPortalSession(req: Request, res: Response): Promise<void> {
    try {
      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        res.status(500).json({ 
          error: 'Billing system not configured',
          message: 'Stripe integration is not set up. Please contact support.'
        });
        return;
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user || !user.stripe_customer_id) {
        res.status(404).json({ error: 'No billing account found' });
        return;
      }

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: stripeConfig.urls.customerPortalReturn,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('❌ Error creating portal session:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'];
      
      if (!sig) {
        res.status(400).send('Missing stripe-signature header');
        return;
      }

      let event;
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, stripeConfig.webhookSecret);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        res.status(400).send('Webhook signature verification failed');
        return;
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          await BillingController.handleCheckoutCompleted(session);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          await BillingController.handleSubscriptionUpdate(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          await BillingController.handleSubscriptionCanceled(subscription);
          break;
        }

        case 'invoice.paid': {
          const invoice = event.data.object as any;
          await BillingController.handleInvoicePaid(invoice);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          await BillingController.handlePaymentFailed(invoice);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handling failed' });
    }
  }

  /**
   * Handle successful checkout completion
   */
  private static async handleCheckoutCompleted(session: any): Promise<void> {
    try {
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      // Find user by customer ID
      const user = await UserModel.findByStripeCustomerId(customerId);
      if (!user) {
        console.error('❌ User not found for customer ID:', customerId);
        return;
      }

      // Update user subscription status
      await UserModel.updateSubscription(user.id, subscriptionId, 'active', 'pro');
      
      console.log('✅ Subscription activated for user:', user.email);
    } catch (error) {
      console.error('❌ Error handling checkout completed:', error);
    }
  }

  /**
   * Handle subscription updates
   */
  private static async handleSubscriptionUpdate(subscription: any): Promise<void> {
    try {
      const customerId = subscription.customer;
      const user = await UserModel.findByStripeCustomerId(customerId);
      
      if (!user) {
        console.error('❌ User not found for customer ID:', customerId);
        return;
      }

      const status = subscription.status === 'active' ? 'active' : 'inactive';
      await UserModel.updateSubscription(user.id, subscription.id, status, 'pro');
      
      console.log('✅ Subscription updated for user:', user.email, 'Status:', status);
    } catch (error) {
      console.error('❌ Error handling subscription update:', error);
    }
  }

  /**
   * Handle subscription cancellation
   */
  private static async handleSubscriptionCanceled(subscription: any): Promise<void> {
    try {
      const customerId = subscription.customer;
      const user = await UserModel.findByStripeCustomerId(customerId);
      
      if (!user) {
        console.error('❌ User not found for customer ID:', customerId);
        return;
      }

      await UserModel.updateSubscription(user.id, subscription.id, 'cancelled', 'basic');
      
      console.log('✅ Subscription cancelled for user:', user.email);
    } catch (error) {
      console.error('❌ Error handling subscription cancellation:', error);
    }
  }

  /**
   * Handle successful invoice payment
   */
  private static async handleInvoicePaid(invoice: any): Promise<void> {
    try {
      const customerId = invoice.customer;
      const user = await UserModel.findByStripeCustomerId(customerId);
      
      if (!user) {
        console.error('❌ User not found for customer ID:', customerId);
        return;
      }

      // Ensure subscription is active when payment succeeds
      if (user.subscription_status !== 'active') {
        await UserModel.update(user.id, { subscription_status: 'active' });
      }
      
      console.log('✅ Invoice paid for user:', user.email);
    } catch (error) {
      console.error('❌ Error handling invoice paid:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(invoice: any): Promise<void> {
    try {
      const customerId = invoice.customer;
      const user = await UserModel.findByStripeCustomerId(customerId);
      
      if (!user) {
        console.error('❌ User not found for customer ID:', customerId);
        return;
      }

      // You might want to send an email notification here
      console.log('⚠️ Payment failed for user:', user.email);
      
      // Don't immediately deactivate - Stripe will retry
      // Consider deactivating after multiple failures or subscription becomes past_due
    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
    }
  }

  /**
   * Get user's billing status
   */
  static async getBillingStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const billingStatus = {
        hasSubscription: !!user.stripe_subscription_id,
        subscriptionStatus: user.subscription_status,
        subscriptionPlan: user.subscription_plan,
        hasPaymentMethod: !!user.stripe_customer_id,
      };

      // If user has a subscription, get more details from Stripe
      if (user.stripe_subscription_id && isStripeConfigured()) {
        try {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
          billingStatus.subscriptionStatus = subscription.status as any;
          
          // Update local status if it differs
          if (subscription.status !== user.subscription_status) {
            await UserModel.update(userId, { 
              subscription_status: subscription.status as 'active' | 'inactive' | 'cancelled'
            });
          }
        } catch (stripeError) {
          console.error('❌ Error fetching subscription from Stripe:', stripeError);
          // Continue with local data
        }
      }

      res.json(billingStatus);
    } catch (error) {
      console.error('❌ Error getting billing status:', error);
      res.status(500).json({ error: 'Failed to get billing status' });
    }
  }
} 