import React, { useState } from 'react';
import { CreditCard, Star, Zap, Shield, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import billingService from '../../services/billingService';

interface SubscriptionPromptProps {
  className?: string;
  onClose?: () => void;
}

export const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ 
  className = '', 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      await billingService.redirectToCheckout();
    } catch (err) {
      console.error('Error starting subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Unlock Leedz Pro
              </h3>
              <p className="text-sm text-gray-600">
                Start generating leads with our premium features
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">10,000 Leads/Month</h4>
                <p className="text-xs text-gray-600">High monthly search limit</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Sheets Integration</h4>
                <p className="text-xs text-gray-600">Export directly to Google Sheets</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Priority Support</h4>
                <p className="text-xs text-gray-600">Get help when you need it</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">Cancel anytime • No setup fees</p>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Most Popular
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Starting subscription...</span>
            ) : (
              <>
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 ml-4"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Trust indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center space-x-1">
            <CreditCard className="w-3 h-3" />
            <span>No hidden fees</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 