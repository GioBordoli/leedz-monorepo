import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Crown, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import billingService from '../../services/billingService';
import { EnhancedUsageStats, EnhancedBillingStatus } from '../../types/billing';

interface EnhancedUsageCardProps {
  className?: string;
}

const EnhancedUsageCard: React.FC<EnhancedUsageCardProps> = ({ className = '' }) => {
  const [usageStats, setUsageStats] = useState<EnhancedUsageStats | null>(null);
  const [billingStatus, setBillingStatus] = useState<EnhancedBillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [stats, billing] = await Promise.all([
          billingService.getUsageStats(),
          billingService.getEnhancedBillingStatus()
        ]);
        
        setUsageStats(stats);
        setBillingStatus(billing);
      } catch (err) {
        console.error('Failed to load usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !usageStats || !billingStatus) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-ink">Usage Stats</h3>
        </div>
        <p className="text-red-600 text-sm">{error || 'Failed to load usage data'}</p>
      </div>
    );
  }

  const { usage, tier, status, period, recommendations } = usageStats;
  const isFreeTier = tier.current === 'free';
  const usagePercentage = usage.percentage;
  
  // Determine card styling based on usage status
  const getCardStyling = () => {
    if (status.isOverLimit) {
      return 'border-red-300 bg-red-50';
    } else if (status.isNearLimit) {
      return 'border-orange-300 bg-orange-50';
    } else if (status.isApproachingLimit) {
      return 'border-yellow-300 bg-yellow-50';
    }
    return 'border-gray-200';
  };

  const getProgressBarColor = () => {
    if (status.isOverLimit) return 'bg-red-500';
    if (status.isNearLimit) return 'bg-orange-500';
    if (status.isApproachingLimit) return 'bg-yellow-500';
    return 'bg-mint';
  };

  const formatUsageDisplay = () => {
    if (!isFreeTier) {
      return `${usage.current.toLocaleString()} leads this month`;
    }
    return `${usage.current.toLocaleString()} / ${usage.limit?.toLocaleString() || 'unlimited'}`;
  };

  const getRemainingDisplay = () => {
    if (!isFreeTier) return 'Unlimited remaining';
    if (typeof usage.remaining === 'number') {
      return `${usage.remaining.toLocaleString()} remaining`;
    }
    return 'Unlimited';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg hover:shadow-mint/10 hover:border-mint/30 transition-all duration-300 ${getCardStyling()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isFreeTier ? 'bg-blue-100' : 'bg-purple-100'}`}>
            {isFreeTier ? (
              <Database className="w-5 h-5 text-blue-600" />
            ) : (
              <Crown className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Usage Stats</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isFreeTier 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {tier.name} Plan
              </span>
              {status.isOverLimit && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                  Limit Exceeded
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Upgrade Button for Free Tier */}
        {isFreeTier && (
          <button
            onClick={() => billingService.redirectToCheckout('monthly')}
            className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Usage Display */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-bold text-ink">
            {formatUsageDisplay()}
          </div>
          {isFreeTier && (
            <div className="text-sm text-gray-500">
              {usagePercentage}% used
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {isFreeTier && usage.limit && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            ></div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          {getRemainingDisplay()}
        </div>
      </div>

      {/* Status Alerts */}
      {status.isOverLimit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium text-sm">Monthly limit exceeded</p>
              <p className="text-red-700 text-xs">Upgrade to Pro for unlimited leads</p>
            </div>
          </div>
        </div>
      )}

      {status.isNearLimit && !status.isOverLimit && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-orange-800 font-medium text-sm">Nearly at your limit</p>
              <p className="text-orange-700 text-xs">Consider upgrading to avoid interruption</p>
            </div>
          </div>
        </div>
      )}

      {status.isApproachingLimit && !status.isNearLimit && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium text-sm">Approaching monthly limit</p>
              <p className="text-yellow-700 text-xs">You're at {usagePercentage}% of your limit</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Date */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          Resets in {period.daysUntilReset} day{period.daysUntilReset !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-mint" />
            <span className="text-sm font-medium text-ink">Quick Tip</span>
          </div>
          <p className="text-sm text-gray-600">
            {recommendations[0]}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {isFreeTier && (status.isOverLimit || status.isNearLimit) && (
          <button
            onClick={() => billingService.redirectToCheckout('monthly')}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center text-sm"
          >
            Upgrade to Pro
          </button>
        )}
        
        <Link
          to="/settings"
          className={`${isFreeTier && (status.isOverLimit || status.isNearLimit) ? 'flex-1' : 'w-full'} bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-center text-sm`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EnhancedUsageCard; 