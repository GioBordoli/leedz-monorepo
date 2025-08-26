import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import billingService from '../../services/billingService';
import { BillingStatus } from '../../types/billing';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionCardProps {
  className?: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ className = '' }) => {
  const { isAuthenticated, token } = useAuth();
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingStatus = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const status = await billingService.getBillingStatus();
      setBillingStatus(status);
    } catch (err) {
      setError('Failed to load billing status');
      console.error('Error fetching billing status:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBillingStatus();
    }
  }, [isAuthenticated, token, fetchBillingStatus]);

  const handleSubscribe = async () => {
    if (!isAuthenticated || !token) {
      setError('Please log in to subscribe');
      return;
    }

    try {
      setActionLoading(true);
      await billingService.redirectToCheckout();
    } catch (err) {
      setError('Failed to start subscription process');
      console.error('Error starting subscription:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!isAuthenticated || !token) {
      setError('Please log in to manage billing');
      return;
    }

    try {
      setActionLoading(true);
      await billingService.redirectToPortal();
    } catch (err) {
      setError('Failed to open billing portal');
      console.error('Error opening billing portal:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!billingStatus) return null;

    switch (billingStatus.subscriptionStatus) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'inactive':
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!billingStatus) return 'Loading...';

    switch (billingStatus.subscriptionStatus) {
      case 'active':
        return 'Active Subscription';
      case 'cancelled':
        return 'Subscription Cancelled';
      case 'inactive':
      default:
        return 'No Active Subscription';
    }
  };

  const getStatusColor = () => {
    if (!billingStatus) return 'text-gray-500';

    switch (billingStatus.subscriptionStatus) {
      case 'active':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'inactive':
      default:
        return 'text-yellow-600';
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        </div>
        <p className="text-gray-600 mb-4">Please log in to view your subscription status.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
        </div>
        {getStatusIcon()}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {billingStatus && (
            <div className="text-sm text-gray-600">
              <p>Plan: <span className="font-medium capitalize">{billingStatus.subscriptionPlan}</span></p>
              {billingStatus.subscriptionStatus === 'active' && (
                <p className="text-green-600 mt-1">
                  ✓ 10,000 API calls per month included
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          {billingStatus?.subscriptionStatus === 'active' ? (
            <div className="space-y-3">
              <Button
                onClick={handleManageBilling}
                disabled={actionLoading}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Manage Billing</span>
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Update payment methods, view invoices, and manage your subscription
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? 'Loading...' : 'Subscribe to Leedz Pro'}
              </Button>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Leedz Pro includes:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• 10,000 lead searches per month</li>
                  <li>• Google Sheets integration</li>
                  <li>• Advanced search filters</li>
                  <li>• Priority support</li>
                </ul>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  $29/month
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 