# **Freemium Implementation Roadmap**
## **Modular Development Plan for Leedz Lead Generation Platform**

---

## **📋 Overview**

This roadmap breaks down the freemium implementation into discrete, independently testable modules. Each phase can be implemented, tested, and deployed separately, reducing risk and allowing for iterative improvements.

---

## **🎯 Phase 1: Core Backend Logic (Foundation)**
**Estimated Time:** 1.5 hours  
**Dependencies:** None  
**Goal:** Enable free tier users to generate leads without subscription requirement

### **Module 1.1: Remove Subscription Gate** ⏱️ 30 minutes
**Files:** `backend/src/controllers/LeadController.ts`

**Changes:**
- Remove subscription status check in `streamSearch()` method (lines 57-65)
- Remove subscription status check in `startSearch()` method (lines 235-243)

**Testing:**
- Free tier user can access lead generation endpoints
- No regression for existing Pro users

**Acceptance Criteria:**
- [ ] Free tier users can make API calls to `/api/leads/search-stream`
- [ ] No subscription errors for inactive users
- [ ] Pro users continue to work normally

---

### **Module 1.2: Dynamic Usage Limits** ⏱️ 45 minutes
**Files:** `backend/src/models/User.ts`, `backend/src/controllers/LeadController.ts`

**Changes in User.ts:**
```typescript
// Add new method
static async getMonthlyLimitForUser(id: number): Promise<number> {
  const user = await this.findById(id);
  return user && user.subscription_status === 'active' ? 10000 : 1000;
}

// Update existing method
static async hasReachedMonthlyLimit(id: number): Promise<boolean> {
  const limit = await this.getMonthlyLimitForUser(id);
  const usage = await this.getMonthlyUsage(id);
  return usage.count >= limit;
}
```

**Changes in LeadController.ts:**
```typescript
// Replace hardcoded 10000 with dynamic limit
const monthlyLimit = await UserModel.getMonthlyLimitForUser(user.id);

// Update error message to include tier information
if (user.monthly_usage_count >= monthlyLimit) {
  const isFreeTier = user.subscription_status !== 'active';
  res.status(429).json({ 
    error: 'Monthly usage limit reached',
    message: isFreeTier 
      ? `You've used all ${monthlyLimit} free leads this month. Upgrade to Pro for unlimited leads.`
      : `You've reached your monthly limit of ${monthlyLimit} leads.`,
    monthlyLimit,
    currentUsage: user.monthly_usage_count,
    isFreeTier,
    canUpgrade: isFreeTier
  });
  return;
}
```

**Testing:**
- Free tier users hit 1000 lead limit
- Pro users still have 10000 limit
- Error messages are appropriate for each tier

**Acceptance Criteria:**
- [ ] Free tier limit enforced at 1000 leads
- [ ] Pro tier limit remains at 10000 leads
- [ ] Clear error messages for each tier
- [ ] Existing usage tracking continues to work

---

### **Module 1.3: Default User Status Update** ⏱️ 15 minutes
**Files:** `backend/src/models/User.ts`, `backend/migrations/005_implement_freemium_model.sql`

**Migration File:**
```sql
-- Update default subscription status for new users
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- Ensure existing test users are properly set
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status = 'active' 
AND stripe_customer_id IS NULL;
```

**User Model Change:**
Update the create method documentation to reflect new default.

**Testing:**
- New users default to 'inactive' status
- Existing users maintain their current status

**Acceptance Criteria:**
- [ ] New user signups default to free tier
- [ ] Database migration runs successfully
- [ ] No impact on existing users

---

## **🎯 Phase 2: Backend API Enhancement**
**Estimated Time:** 45 minutes  
**Dependencies:** Phase 1 complete  
**Goal:** Provide rich usage information for frontend

### **Module 2.1: Enhanced Billing Status API** ⏱️ 30 minutes
**Files:** `backend/src/controllers/BillingController.ts`

**Changes:**
```typescript
async getBillingStatus(req: AuthenticatedRequest, res: Response) {
  // ... existing code ...

  const monthlyLimit = user.subscription_status === 'active' ? 'unlimited' : 1000;
  const usagePercentage = user.subscription_status === 'active' 
    ? 0 
    : Math.round((user.monthly_usage_count || 0) / 1000 * 100);

  res.json({
    hasSubscription: user.subscription_status === 'active',
    subscriptionStatus: user.subscription_status || 'inactive',
    subscriptionPlan: user.subscription_status === 'active' ? 'Pro' : 'Free',
    hasPaymentMethod: !!user.stripe_customer_id,
    monthlyUsage: {
      used: user.monthly_usage_count || 0,
      limit: monthlyLimit,
      percentage: usagePercentage,
      resetDate: user.usage_reset_month,
      remaining: user.subscription_status === 'active' 
        ? 'unlimited' 
        : Math.max(0, 1000 - (user.monthly_usage_count || 0))
    }
  });
}
```

**Testing:**
- API returns correct usage information
- Free and Pro tiers show different data
- Percentage calculations are accurate

**Acceptance Criteria:**
- [ ] Free tier shows usage out of 1000
- [ ] Pro tier shows unlimited status
- [ ] Usage percentage calculated correctly
- [ ] Reset date information included

---

### **Module 2.2: Usage Statistics Endpoint Update** ⏱️ 15 minutes
**Files:** `backend/src/controllers/UserController.ts`

**Changes:**
```typescript
async getUsageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  // ... existing auth code ...
  
  const user = await UserModel.findById(req.user.id);
  const monthlyLimit = user && user.subscription_status === 'active' ? 10000 : 1000;
  const usage = await UserModel.getMonthlyUsage(req.user.id);
  
  const remainingLeads = user && user.subscription_status === 'active' 
    ? 'unlimited' 
    : Math.max(0, monthlyLimit - usage.count);
  
  res.json({
    success: true,
    usage: {
      monthly_count: usage.count,
      monthly_limit: monthlyLimit,
      remaining_leads: remainingLeads,
      usage_percentage: user && user.subscription_status === 'active' 
        ? 0 
        : Math.round((usage.count / monthlyLimit) * 100),
      reset_month: usage.resetMonth,
      tier: user && user.subscription_status === 'active' ? 'pro' : 'free'
    }
  });
}
```

**Testing:**
- Statistics reflect correct tier limits
- Calculations are accurate for both tiers

**Acceptance Criteria:**
- [ ] Free tier shows statistics out of 1000
- [ ] Pro tier shows unlimited statistics
- [ ] API response includes tier information

---

## **🎯 Phase 3: Frontend Core Updates**
**Estimated Time:** 1 hour  
**Dependencies:** Phase 2 complete  
**Goal:** Update UI to reflect freemium model

### **Module 3.1: Settings Page Billing Card** ⏱️ 30 minutes
**Files:** `frontend/src/components/billing/SubscriptionCard.tsx`

**Changes:**
```typescript
// Update status text
const getStatusText = () => {
  if (!billingStatus) return 'Loading...';
  
  switch (billingStatus.subscriptionStatus) {
    case 'active':
      return 'Pro Plan - Unlimited Leads';
    case 'cancelled':
      return 'Subscription Cancelled';
    case 'inactive':
    default:
      return 'Free Plan - 1,000 leads/month';
  }
};

// Add usage display for free tier
const renderUsageDisplay = () => {
  if (billingStatus?.subscriptionStatus === 'active') return null;
  
  const usage = billingStatus?.monthlyUsage;
  if (!usage) return null;
  
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Monthly Usage</span>
        <span>{usage.used} / {usage.limit} leads</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${usage.percentage >= 95 ? 'bg-red-500' : usage.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(100, usage.percentage)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {usage.remaining} leads remaining this month
      </p>
    </div>
  );
};
```

**Testing:**
- Free tier shows usage bar
- Pro tier shows unlimited status
- Visual indicators work correctly

**Acceptance Criteria:**
- [ ] Free tier displays usage progress
- [ ] Pro tier shows unlimited status
- [ ] Color coding for usage levels (green/yellow/red)
- [ ] Remaining leads calculation correct

---

### **Module 3.2: Dashboard Usage Widget** ⏱️ 30 minutes
**Files:** `frontend/src/components/dashboard/UsageWidget.tsx` (new file)

**Implementation:**
```typescript
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UsageData {
  monthly_count: number;
  monthly_limit: number | string;
  remaining_leads: number | string;
  usage_percentage: number;
  tier: 'free' | 'pro';
}

export const UsageWidget: React.FC = () => {
  const { token } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [token]);

  const fetchUsage = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/user/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsage(data.usage);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  if (!usage) return null;

  const isFreeTier = usage.tier === 'free';
  const shouldShowUpgrade = isFreeTier && usage.usage_percentage >= 95;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Usage This Month</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>
      
      {isFreeTier ? (
        <>
          <div className="text-2xl font-bold mb-2">
            {usage.monthly_count} / {usage.monthly_limit}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full ${shouldShowUpgrade ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, usage.usage_percentage)}%` }}
            />
          </div>
          {shouldShowUpgrade && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                You're almost at your limit! Upgrade to Pro for unlimited leads.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-lg font-semibold text-green-600">Unlimited Leads</p>
          <p className="text-sm text-gray-500">Pro Plan Active</p>
        </div>
      )}
    </div>
  );
};
```

**Integration:**
Add to `frontend/src/pages/Dashboard/Dashboard.tsx`

**Testing:**
- Widget displays correctly for both tiers
- Usage data updates properly
- Upgrade prompt appears at 95%

**Acceptance Criteria:**
- [ ] Free tier shows usage progress
- [ ] Pro tier shows unlimited status
- [ ] Upgrade prompt at 95% usage
- [ ] Widget integrates with dashboard layout

---

### **Module 3.3: Landing Pricing Copy and CTA** ⏱️ 15 minutes
**Files:** `frontend/src/components/landing/PricingSection.tsx`, `frontend/src/components/landing/HeroSection.tsx`

**Changes:**
- Add trust copy above pricing CTA: “Start for free — no credit card required”.
- Change pricing CTA label to “Start free” and route to existing signup (`authService.login()`).
- Optional: ensure hero primary CTA routes to Pricing section or Signup, copy remains “Start now”.

**Testing:**
- Landing page shows trust copy above CTA.
- Sign up button reads “Start free” and launches Google OAuth.

**Acceptance Criteria:**
- [ ] Copy “Start for free — no credit card required” is visible above the primary CTA on pricing card.
- [ ] CTA label updated to “Start free” and triggers `authService.login()`.

---

## **🎯 Phase 4: Enhanced User Experience**
**Estimated Time:** 45 minutes  
**Dependencies:** Phase 3 complete  
**Goal:** Add upgrade prompts and polish

### **Module 4.1: Search Results Upgrade Prompt** ⏱️ 30 minutes
**Files:** `frontend/src/components/leads/SearchResults.tsx`

**Changes:**
```typescript
// Add usage check and upgrade prompt
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

useEffect(() => {
  checkUsageStatus();
}, [searchResult]);

const checkUsageStatus = async () => {
  if (!token) return;
  
  try {
    const response = await fetch('/api/user/usage', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.usage.tier === 'free' && data.usage.usage_percentage >= 95) {
      setShowUpgradePrompt(true);
    }
  } catch (error) {
    console.error('Failed to check usage:', error);
  }
};

// Add upgrade prompt component
const UpgradePrompt = () => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div className="flex items-center space-x-3">
      <div className="bg-blue-100 rounded-full p-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-blue-900">Almost at your limit!</h4>
        <p className="text-sm text-blue-700">
          You've used {Math.round(usage?.usage_percentage || 0)}% of your free leads. 
          Upgrade to Pro for unlimited leads and priority support.
        </p>
      </div>
      <button
        onClick={() => window.location.href = '/settings'}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Upgrade Now
      </button>
    </div>
  </div>
);

// Add to render method
{showUpgradePrompt && <UpgradePrompt />}
```

**Testing:**
- Prompt appears at 95% usage
- Prompt directs to settings page
- No prompt for Pro users

**Acceptance Criteria:**
- [ ] Upgrade prompt shows at 950+ leads
- [ ] Prompt includes usage percentage
- [ ] Button navigates to settings
- [ ] No prompt for Pro users

---

### **Module 4.2: Limit Reached Modal** ⏱️ 15 minutes
**Files:** `frontend/src/components/leads/LimitReachedModal.tsx` (new file)

**Implementation:**
```typescript
import React from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedLeads: number;
  limit: number;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  usedLeads,
  limit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Limit Reached</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-600 mb-2">
            You've used all <strong>{limit} free leads</strong> for this month.
          </p>
          <p className="text-sm text-gray-500">
            Upgrade to Pro for unlimited leads and keep growing your business.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/settings'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Integration:**
Show modal when API returns 429 status with free tier limit error.

**Testing:**
- Modal appears when limit reached
- Navigation to settings works
- Modal can be dismissed

**Acceptance Criteria:**
- [ ] Modal triggered by 429 API response
- [ ] Clear upgrade messaging
- [ ] Functional upgrade button
- [ ] Dismissible modal

---

## **🎯 Phase 5: Testing & Polish**
**Estimated Time:** 30 minutes  
**Dependencies:** All previous phases  
**Goal:** Comprehensive testing and bug fixes

### **Module 5.1: Integration Testing** ⏱️ 20 minutes

**Test Scenarios:**
1. **New User Journey:**
   - Sign up → Free tier → Search leads → Hit limit → Upgrade prompt
2. **Existing User Journey:**
   - Login → Check status → Verify tier-appropriate limits
3. **Usage Tracking:**
   - Verify accurate counting
   - Test monthly reset logic
   - Confirm tier-based limits

**Manual Test Checklist:**
- [ ] New user defaults to free tier (1000 limit)
- [ ] Free user can search up to 1000 leads
- [ ] Hard stop at 1000 with clear error message
- [ ] Upgrade prompt appears at 950 leads
- [ ] Pro users maintain unlimited access
- [ ] Settings page shows correct status and usage
- [ ] Dashboard widget displays properly
- [ ] Monthly reset works (can test with database manipulation)

### **Module 5.2: Performance & Error Handling** ⏱️ 10 minutes

**Performance Checks:**
- [ ] Usage queries perform well
- [ ] No N+1 query issues
- [ ] Frontend components don't cause excessive re-renders

**Error Handling:**
- [ ] Graceful handling of API failures
- [ ] Clear error messages for all scenarios
- [ ] Fallback behavior when usage data unavailable

---

## **📈 Success Metrics & Monitoring**

### **Phase 1 Success:**
- No subscription errors for new users
- Dynamic limits working correctly
- Accurate usage tracking

### **Phase 2 Success:**
- API returns rich usage information
- Frontend can display tier-appropriate data
- No breaking changes to existing functionality

### **Phase 3 Success:**
- UI accurately reflects user's tier and usage
- Smooth user experience across free and pro tiers
- Clear visual indicators for usage levels

### **Phase 4 Success:**
- Effective upgrade prompts increase conversion intent
- Users understand their usage status
- Clear path to upgrade

### **Phase 5 Success:**
- Bug-free implementation
- Performance meets expectations
- Ready for production deployment

---

## **🚀 Deployment Strategy**

### **Development Environment:**
Each phase can be tested independently in the local development environment.

### **Staging Deployment:**
- Deploy Phase 1-2 together (backend foundation)
- Deploy Phase 3-4 together (frontend experience)
- Deploy Phase 5 (final polish)

### **Production Rollout:**
- Feature flag for freemium model
- Gradual rollout to new users first
- Monitor metrics and user feedback
- Full rollout after validation

---

## **⚠️ Risk Mitigation**

### **Technical Risks:**
- **Usage tracking accuracy:** Comprehensive testing of increment logic
- **Performance impact:** Monitor database query performance
- **Frontend state management:** Ensure proper caching and updates

### **Business Risks:**
- **Existing user confusion:** Clear communication about changes
- **Abuse prevention:** Monitor for unusual usage patterns
- **Support burden:** Prepare FAQ and support documentation

### **Rollback Plan:**
Each phase can be independently rolled back:
- Phase 1: Restore subscription checks
- Phase 2: Revert API changes
- Phase 3-4: Hide new UI components
- Phase 5: Address specific issues

---

## **📝 Implementation Notes**

### **Database Schema Changes Required:**
```sql
-- Migration: 005_implement_freemium_model.sql
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- Update existing test users to free tier if they don't have Stripe customer ID
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status = 'active' 
AND stripe_customer_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_monthly_usage ON users(monthly_usage_count);
```

### **Key Files Modified:**

#### **Backend:**
- `backend/src/controllers/LeadController.ts` - Remove subscription gates, add dynamic limits
- `backend/src/models/User.ts` - Add tier-based limit methods
- `backend/src/controllers/BillingController.ts` - Enhanced status API
- `backend/src/controllers/UserController.ts` - Updated usage statistics

#### **Frontend:**
- `frontend/src/components/billing/SubscriptionCard.tsx` - Free tier UI
- `frontend/src/components/dashboard/UsageWidget.tsx` - New usage widget
- `frontend/src/components/leads/SearchResults.tsx` - Upgrade prompts
- `frontend/src/components/leads/LimitReachedModal.tsx` - Limit modal

### **Environment Variables:**
No new environment variables required. All changes use existing infrastructure.

### **API Endpoints:**
No new endpoints required. Enhanced existing endpoints:
- `GET /api/billing/status` - Now includes usage information
- `GET /api/user/usage` - Enhanced with tier information

---

**This roadmap ensures a systematic, low-risk implementation of the freemium model with clear milestones and testable deliverables at each phase.** 