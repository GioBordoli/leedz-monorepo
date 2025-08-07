import express from 'express';
import { BillingController } from '../controllers/BillingController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Apply auth middleware to all billing routes except webhooks
router.use((req, res, next) => {
  // Skip auth for webhook endpoint (it has its own validation)
  if (req.path === '/webhook') {
    return next();
  }
  return authenticateJWT(req, res, next);
});

// GET /api/billing/status - Get user's billing status
router.get('/status', BillingController.getBillingStatus);

// POST /api/billing/create-checkout-session - Create a new checkout session
router.post('/create-checkout-session', BillingController.createCheckoutSession);

// POST /api/billing/create-portal-session - Create customer portal session
router.post('/create-portal-session', BillingController.createPortalSession);

// POST /api/billing/webhook - Handle Stripe webhooks (no auth required)
router.post('/webhook', BillingController.handleWebhook);

export default router; 