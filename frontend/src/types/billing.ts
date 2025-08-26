/**
 * Enhanced Billing Types for Freemium Model
 * Matches backend API structure for type safety
 */

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean;
  tier: SubscriptionTier;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface UsageInfo {
  current: number;
  limit: number | null;
  remaining: number | null | 'unlimited';
  percentage: number;
  resetDate: string;
  isUnlimited: boolean;
}

export interface FeatureSet {
  monthlyLeads: number | 'unlimited';
  exportFormats: string[];
  supportLevel: string;
  apiAccess: boolean;
  customIntegrations: boolean;
  prioritySupport: boolean;
  advancedFilters: boolean;
}

export interface UsageLimits {
  leads: number | 'unlimited';
  exports: 'unlimited';
  searches: 'unlimited';
}

export interface BillingFlags {
  canUpgrade: boolean;
  needsUpgrade: boolean;
  approachingLimit: boolean;
  nearLimit: boolean;
  hasPaymentMethod: boolean;
}

export interface BillingActions {
  upgradeUrl: string | null;
  manageUrl: string | null;
  pricingUrl: string;
}

export interface EnhancedBillingStatus {
  subscription: SubscriptionInfo;
  usage: UsageInfo;
  features: FeatureSet;
  flags: BillingFlags;
  actions: BillingActions;
}

export interface BillingStatusResponse {
  success: boolean;
  data: EnhancedBillingStatus;
  timestamp: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: FeatureSet;
  limits: UsageLimits;
  popular: boolean;
  current: boolean;
  stripeProductId?: string;
}

export interface PlansResponse {
  success: boolean;
  data: {
    plans: PlanInfo[];
    currentPlan: SubscriptionTier;
    currency: string;
  };
  timestamp: string;
}

// Enhanced Usage Statistics Types
export interface PeriodInfo {
  resetDate: string;
  nextResetDate: string;
  daysUntilReset: number;
  currentMonth: string;
}

export interface TierInfo {
  current: SubscriptionTier;
  name: string;
  canUpgrade: boolean;
}

export interface UsageStatus {
  isNearLimit: boolean;
  isApproachingLimit: boolean;
  isOverLimit: boolean;
  needsUpgrade: boolean;
  hasApiKey: boolean;
}

export interface ApiKeyInfo {
  configured: boolean;
  lastUpdated: string;
  isRequired: boolean;
}

export interface EnhancedUsageStats {
  usage: UsageInfo;
  period: PeriodInfo;
  tier: TierInfo;
  status: UsageStatus;
  apiKey: ApiKeyInfo;
  recommendations: string[];
}

export interface UsageStatsResponse {
  success: boolean;
  data: EnhancedUsageStats;
  timestamp: string;
}

// Legacy interfaces for backward compatibility
export interface BillingStatus {
  hasSubscription: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string;
  hasPaymentMethod: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PortalSession {
  url: string;
} 