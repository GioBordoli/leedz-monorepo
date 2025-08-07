# Lead Generation SaaS - Development Roadmap

## 🎯 Milestone 1: Project Foundation & Setup (Week 1)
**Goal**: Set up development environment and basic project structure

### Issue 1.1: Initialize Project Structure
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create the basic monorepo structure with frontend and backend applications.

**Acceptance Criteria**:
- [ ] Create root directory with `frontend/` and `backend/` folders
- [ ] Initialize React app in `frontend/` with TypeScript template
- [ ] Initialize Node.js project in `backend/` with Express
- [ ] Create `.gitignore` files for both projects
- [ ] Set up package.json with correct dependencies

**Technical Requirements**:
```bash
# Frontend dependencies
npm create react-app frontend --template typescript
cd frontend && npm install @types/react @types/react-dom tailwindcss lucide-react

# Backend dependencies  
cd ../backend && npm init -y
npm install express cors helmet dotenv jsonwebtoken bcryptjs
npm install -D @types/node @types/express nodemon typescript ts-node
```

**Folder Structure**:
```
lead-gen-saas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
└── README.md
```

### Issue 1.2: Setup Tailwind CSS
**Priority**: High | **Effort**: 2 hours | **Assignee**: Junior Dev

**Description**: Configure Tailwind CSS for the white and translucent green design system.

**Acceptance Criteria**:
- [ ] Install and configure Tailwind CSS in React app
- [ ] Create custom color palette with translucent green
- [ ] Test with a simple component to verify styling works
- [ ] Configure Inter font family

**Technical Steps**:
1. Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
2. Initialize config: `npx tailwindcss init -p`
3. Add to `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'translucent-green': 'rgba(0, 255, 127, 0.2)',
        'green-accent': 'rgba(0, 255, 127, 0.3)',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
```

### Issue 1.3: Docker Configuration
**Priority**: Medium | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Create Docker setup for easy development and deployment.

**Acceptance Criteria**:
- [ ] Create Dockerfile for frontend (React build)
- [ ] Create Dockerfile for backend (Node.js)
- [ ] Create docker-compose.yml with all services
- [ ] Verify containers start correctly

**Files to Create**:
- `frontend/Dockerfile`
- `backend/Dockerfile` 
- `docker-compose.yml` (root level)
- `.dockerignore` files

---

## 🔐 Milestone 2: Authentication System (Week 2) ✅ **COMPLETED - January 27, 2025**
**Goal**: Implement Google OAuth authentication with JWT sessions

### Issue 2.1: Google OAuth Setup ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Set up Google OAuth 2.0 for user authentication and Google Sheets access.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create Google Cloud Console project
- [x] Configure OAuth 2.0 credentials
- [x] Set up OAuth consent screen
- [x] Add required scopes for Sheets API access
- [x] Store credentials in environment variables

**Implementation Notes**:
- OAuth working perfectly with smart session management (no re-authorization needed)
- ⚡ **IMPROVEMENT NEEDED**: Add more structured login page where user feels in control and sees clear "Sign in with Google" option with better UX

**Required Scopes**:
```
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/spreadsheets
```

**Environment Variables**:
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Issue 2.2: Backend Auth Controller
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Create authentication endpoints for Google OAuth flow.

**Acceptance Criteria**:
- [ ] Create `AuthController` class with OAuth methods
- [ ] Implement `/auth/google` redirect endpoint
- [ ] Implement `/auth/callback` token exchange endpoint
- [ ] Generate and return JWT tokens
- [ ] Store user data in database (when ready)

**File**: `backend/src/controllers/AuthController.js`
```javascript
class AuthController {
  // Method: redirectToGoogle()
  // Method: handleCallback(req, res)
  // Method: generateJWT(user)
  // Method: refreshToken(req, res)
}
```

**API Endpoints**:
- `GET /auth/google` - Redirect to Google OAuth
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

### Issue 2.3: Frontend Auth Service
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create React authentication service and context.

**Acceptance Criteria**:
- [ ] Create `AuthContext` with login/logout state
- [ ] Create `useAuth` custom hook
- [ ] Implement Google OAuth button component
- [ ] Handle OAuth redirect flow
- [ ] Store JWT tokens securely (memory only, no localStorage)

**Files to Create**:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/services/authService.ts`
- `frontend/src/components/auth/GoogleLoginButton.tsx`

### Issue 2.4: Protected Routes
**Priority**: High | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Implement route protection and authentication guards.

**Acceptance Criteria**:
- [ ] Create `ProtectedRoute` component
- [ ] Redirect unauthenticated users to login
- [ ] Handle JWT token expiration
- [ ] Create loading states during auth checks

**File**: `frontend/src/components/auth/ProtectedRoute.tsx`

---

## 🗄️ Milestone 3: Database & User Management (Week 3) 🔄 **IN PROGRESS**
**Goal**: Set up PostgreSQL database with user data storage

🚨 **CRITICAL UPDATE**: Database is currently working locally but NOT persistent. We MUST connect to hosted database (PostgreSQL on Google Cloud/AWS) BEFORE deployment for proper testing and data persistence.

### Issue 3.1: Database Schema Setup 🟡 **PARTIALLY COMPLETE**
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create PostgreSQL database schema for user management.

**⚡ URGENT REQUIREMENT**: Set up persistent/hosted database connection to enable proper testing and prevent data loss between sessions.

**Acceptance Criteria**:
- [ ] Install PostgreSQL (or use Docker)
- [ ] Create database migration files
- [ ] Implement user table with required fields
- [ ] Create sheet_configs table for user's sheet settings

**SQL Schema**:
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  google_oauth_id VARCHAR(255) UNIQUE NOT NULL,
  places_api_key TEXT,
  subscription_status VARCHAR(50) DEFAULT 'active',
  daily_usage_count INTEGER DEFAULT 0,
  usage_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sheet_configs table
CREATE TABLE sheet_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  spreadsheet_name VARCHAR(255) NOT NULL,
  sheet_tab_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issue 3.2: Database Connection & ORM
**Priority**: Critical | **Effort**: 5 hours | **Assignee**: Junior Dev

**Description**: Set up database connection and create data access layer.

**Acceptance Criteria**:
- [ ] Install and configure database driver (pg for PostgreSQL)
- [ ] Create database connection module
- [ ] Create User model with CRUD operations
- [ ] Create SheetConfig model
- [ ] Test database operations

**Files to Create**:
- `backend/src/config/database.js`
- `backend/src/models/User.js`
- `backend/src/models/SheetConfig.js`

### Issue 3.3: User Controller & Routes
**Priority**: High | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create user management endpoints and controllers.

**Acceptance Criteria**:
- [ ] Create UserController with CRUD operations
- [ ] Implement user profile endpoints
- [ ] Create API key storage endpoints (encrypted)
- [ ] Add usage tracking methods

**API Endpoints**:
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile  
- `POST /api/user/api-key` - Store Google Places API key
- `GET /api/user/usage` - Get daily usage stats

---

## 🎨 Milestone 4: Landing Page (Week 4) ✅ **COMPLETED - August 2, 2025**
**Goal**: Create high-converting landing page with pricing

### Issue 4.1: Landing Page Layout ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Build the main landing page with hero section, video space, and pricing cards.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create responsive hero section
- [x] Add video embed placeholder (empty div for now)
- [x] Design pricing cards (2 options: $29/month, $99/year)
- [x] Implement call-to-action buttons
- [x] Use white background with translucent green accents

**Implementation Notes**:
- Complete landing page with 8 sections: Hero, How It Works, Value Props, Demo, Pricing, FAQ, Final CTA, Footer
- Responsive design with Framer Motion animations
- Professional pricing section with yearly/monthly toggle and $249 savings badge

### Issue 4.2: Pricing Components ✅ **COMPLETED**
**Priority**: High | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create reusable pricing card components.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create `PricingCard` component
- [x] Implement hover effects and animations
- [x] Add "Most Popular" badge for yearly plan
- [x] Connect CTA buttons to authentication flow

**Implementation Notes**:
- Sophisticated pricing component with Framer Motion animations
- Toggle between monthly ($29) and yearly ($99) pricing
- Integrated with authentication service for seamless signup flow

### Issue 4.3: Landing Page Animations ✅ **COMPLETED**
**Priority**: Medium | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Add subtle animations and micro-interactions.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Fade-in animations on scroll
- [x] Hover effects on pricing cards
- [x] Smooth scrolling between sections
- [x] Button hover states with translucent green

**Implementation Notes**:
- Framer Motion integration with staggered animations
- Professional hover effects and micro-interactions
- Smooth section transitions and mint color hover states

---

## 🚀 Milestone 4.5: Essential Platform UI & Onboarding (Week 4.5) ✅ **COMPLETED - August 2, 2025**
**Goal**: Create post-auth user journey and essential platform structure

### Issue 4.5.1: Router Setup and Navigation Structure ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Set up React Router and create the foundational navigation structure for the platform.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Install and configure React Router v6
- [x] Create protected route wrapper for authenticated areas
- [x] Set up main layout component with header and navigation
- [x] Implement logout functionality in header
- [x] Create route structure for dashboard, settings, onboarding

**Implementation Notes**:
- Comprehensive routing with protected routes
- Smart authentication-based navigation
- Clean header and layout components

### Issue 4.5.2: Post-Auth Onboarding Flow ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create onboarding flow for new users to set up their Google Places API key.

**Acceptance Criteria**: ✅ ALL COMPLETE (ENHANCED)
- [x] Create multi-step onboarding page
- [x] Add welcome message and platform explanation
- [x] Include video placeholder for API key setup tutorial
- [x] Implement API key input field with validation
- [x] Add "Test API Key" functionality to verify key works
- [x] Redirect to dashboard only after successful API key validation
- [x] Store onboarding completion status

**🚀 MAJOR ENHANCEMENT**: Implemented **backend-driven user state management**:
- ✅ Database migration for onboarding tracking (`has_completed_onboarding`, `onboarding_completed_at`)
- ✅ Enhanced AuthController with new vs returning user detection
- ✅ Smart routing: new users see required onboarding, returning users get optional onboarding
- ✅ Eliminated localStorage dependency for production-grade state management
- ✅ OnboardingPrompt component for returning users who haven't completed setup

### Issue 4.5.3: Dashboard Shell with User Navigation ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Build the main dashboard layout and navigation structure.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create dashboard layout with sidebar navigation
- [x] Add user profile section in header (name, email, logout)
- [x] Implement navigation menu (Dashboard, Settings)
- [x] Add welcome message for first-time dashboard visitors
- [x] Include video placeholder for platform tutorial
- [x] Show "Coming Soon" messages for features not yet built
- [x] Add usage counter placeholder (0/1000 leads today)

**Implementation Notes**:
- Professional dashboard with comprehensive navigation
- User profile integration with Google OAuth data
- Clear status indicators for upcoming features

### Issue 4.5.4: Settings Page with API Key Management ✅ **COMPLETED**
**Priority**: High | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Create settings page for users to manage their API keys and account information.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create tabbed settings interface
- [x] Implement "API Configuration" tab with key management
- [x] Add ability to update/change Google Places API key
- [x] Mask API key display (show only last 4 characters)
- [x] Include API key testing functionality
- [x] Add "Account Information" tab with user profile
- [x] Show account creation date and basic stats

**Implementation Notes**:
- Full settings page with API key management
- Secure key masking and validation
- User profile management interface

### Issue 4.5.5: Legal Pages (Privacy & Terms) ✅ **COMPLETED**
**Priority**: Medium | **Effort**: 2 hours | **Assignee**: Junior Dev

**Description**: Create required legal pages for production Google OAuth compliance.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create Privacy Policy page with Google OAuth disclosures
- [x] Create Terms of Service page
- [x] Add footer component with links to legal pages
- [x] Ensure pages are accessible without authentication
- [x] Include proper contact information and company details
- [x] Make pages responsive and well-formatted

**Implementation Notes**:
- Complete legal compliance for Google OAuth production approval
- Professional legal pages with proper disclosures
- Accessible footer navigation

---

## 📊 Milestone 5: Google Places Integration (Week 5-6) ✅ **COMPLETED - August 3, 2025**
**Goal**: Implement Google Places API search functionality

### Issue 5.1: Places Service Backend ✅ **COMPLETED**
**Priority**: Critical | **Effort**: 10 hours | **Assignee**: Junior Dev

**Description**: Create Google Places API integration service.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Create PlacesService class
- [x] Implement business type search
- [x] Add city-based location search
- [x] Extract required fields (name, address, phone, website)
- [x] Handle API rate limits and errors

**🔥 IMPLEMENTATION NOTES**:
- Complete end-to-end lead generation working!
- Real business data being returned (Como, Italy restaurants tested)
- Usage tracking and limits implemented
- Professional search progress indicators
- Error handling and graceful degradation

**File**: `backend/src/services/PlacesService.js`
```javascript
class PlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  
  async searchBusinesses(businessType, cityName, radius = 10000) {
    // Implementation here
  }
  
  async getPlaceDetails(placeId) {
    // Get additional details
  }
  
  formatLeadData(place) {
    return {
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || '',
      website: place.website || ''
    };
  }
}
```

### Issue 5.2: Lead Controller
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Create lead generation controller and endpoints.

**Acceptance Criteria**:
- [ ] Create LeadController class
- [ ] Implement search orchestration
- [ ] Add usage tracking and daily limits
- [ ] Handle real-time streaming setup

**API Endpoints**:
- `POST /api/leads/search` - Start lead search
- `GET /api/leads/business-types` - Get available business categories
- `GET /api/leads/usage` - Check daily usage limits

### Issue 5.3: Business Types Configuration
**Priority**: Medium | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Create business type dropdown options from Google Places categories.

**Acceptance Criteria**:
- [ ] Research Google Places API business types
- [ ] Create curated list of common business categories
- [ ] Store in configuration file
- [ ] Create API endpoint to return categories

**Categories to Include**:
```javascript
const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'retail_store', label: 'Retail Stores' },
  { value: 'real_estate_agency', label: 'Real Estate Agencies' },
  { value: 'law_firm', label: 'Law Firms' },
  { value: 'dentist', label: 'Dentists' },
  { value: 'gym', label: 'Gyms & Fitness' },
  // ... more categories
];
```

---

## 📋 Milestone 6: Google Sheets Integration (Week 7) ✅ **COMPLETED - January 27, 2025**
**Goal**: Implement real-time streaming to Google Sheets

🎉 **MAJOR MILESTONE ACHIEVED**: Complete Google Sheets integration with advanced authentication management!

### Issue 6.1: Sheets Service Backend ✅ **COMPLETED & ENHANCED**
**Priority**: Critical | **Effort**: 10 hours | **Assignee**: Junior Dev

**Description**: Create Google Sheets API integration for writing lead data.

**Acceptance Criteria**: ✅ ALL COMPLETE + BONUS FEATURES
- [x] Create SheetsService class
- [x] Implement sheet creation and selection
- [x] Add real-time data writing
- [x] Handle authentication with user's OAuth tokens
- [x] **BONUS**: Proactive authentication checking endpoint
- [x] **BONUS**: Advanced error handling and token refresh
- [x] **BONUS**: Comprehensive OAuth token management

**🔥 IMPLEMENTATION NOTES**:
- **File**: `backend/src/services/SheetsService.ts` - Production-ready service
- **Enhanced Features**:
  - Smart authentication validation with proactive checking
  - Comprehensive error handling for expired tokens
  - Advanced OAuth token management and refresh capability
  - Enterprise-grade security and error recovery

```javascript
class SheetsService {
  constructor(userOAuthToken) {
    this.auth = userOAuthToken;
  }
  
  async createLeadSheet(spreadsheetName) {
    // ✅ Create new sheet tab with headers
  }
  
  async appendLead(spreadsheetId, sheetName, leadData) {
    // ✅ Append single lead to sheet
  }
  
  async batchAppendLeads(spreadsheetId, sheetName, leadsArray) {
    // ✅ Append multiple leads efficiently
  }
  
  // ✅ BONUS: Advanced authentication management
  async listSpreadsheets() { ... }
  async getWorksheets(spreadsheetId) { ... }
  async checkAuthenticationStatus() { ... }
}
```

### Issue 6.2: Sheet Configuration Frontend ✅ **COMPLETED & ENHANCED**
**Priority**: High | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create sheet setup interface in export flow.

**Acceptance Criteria**: ✅ ALL COMPLETE + MAJOR ENHANCEMENTS
- [x] Create sheet name input form
- [x] Add sheet selection dropdown (existing sheets)
- [x] Implement "Create New Sheet" option
- [x] Show preview of column headers
- [x] **BONUS**: Real-time authentication checking
- [x] **BONUS**: Seamless re-authentication modal
- [x] **BONUS**: Settings page integration

**🚀 MAJOR ENHANCEMENTS**:
- **File**: `frontend/src/components/leads/SheetSelector.tsx`
- **File**: `frontend/src/components/auth/ReAuthenticateModal.tsx`
- **Enhanced Features**:
  - Professional modal interface with existing/new sheet options
  - Real-time authentication verification before sheet access
  - One-click re-authentication with Google OAuth
  - Settings page integration for connection status

**Components Delivered**:
- ✅ `SheetSelector.tsx` - Complete sheet selection interface
- ✅ `ReAuthenticateModal.tsx` - Professional re-auth modal
- ✅ Settings integration with Google Sheets status indicator

### Issue 6.3: Real-time Sheet Writing ✅ **COMPLETED PERFECTLY**
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Implement streaming leads directly to user's Google Sheets.

**Acceptance Criteria**: ✅ ALL COMPLETE
- [x] Write leads to sheets as they're found
- [x] Handle batch writing for performance
- [x] Show real-time confirmation in UI
- [x] Handle sheet writing errors gracefully
- [x] **BONUS**: Proactive authentication flow prevents errors
- [x] **BONUS**: Advanced error recovery and user guidance

**🎯 PERFECT IMPLEMENTATION**:
- Complete end-to-end export functionality working flawlessly
- Users can export search results directly to Google Sheets
- Smart sheet creation with auto-generated names
- Professional success notifications with direct Google Sheets links
- Results clear automatically after successful export

**User Journey Achievement**:
1. ✅ Search for leads → Results displayed
2. ✅ Click "Export to Sheets" → Authentication verified proactively  
3. ✅ Select sheet options → Professional modal interface
4. ✅ Export completes → Direct link to Google Sheets opens
5. ✅ Results cleared → Ready for next search

---

## 🚀 Milestone 7: Market-Ready Polish & Essential Fixes (Week 8-9) 🔄 **CURRENT PRIORITY**
**Goal**: Get core product to market with essential improvements only - NO SCOPE CREEP
**Duration**: 2-3 weeks | **Status**: Ready to start

🎯 **PM ALIGNMENT**: Based on overachievements in Milestones 5-6, focus ONLY on launch-critical items to get to market quickly.

### Issue 7.1: Business Name Streaming ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Developer

**PM Requirement**: "I would like to see the names appearing one by one, it would be pretty cool to see all the businesses names I am about to get phone number of as a user!"

**Acceptance Criteria**:
- [ ] Show business names appearing progressively during search
- [ ] Simple text-based streaming (not complex terminal UI)
- [ ] Update search progress: "Found: Business Name 1... Business Name 2..."
- [ ] Maintain all existing functionality

**Files to Modify**:
- `backend/src/controllers/LeadController.ts`
- `frontend/src/components/leads/SearchResults.tsx`
- `frontend/src/services/leadService.ts`

### Issue 7.2: User Profile Integration ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 3 hours | **Assignee**: Developer

**PM Requirement**: "Yes, I want the dashboard to say something like 'Ready for leads, {first name}?'"

**Acceptance Criteria**:
- [ ] Extract first name from Google OAuth user data
- [ ] Update dashboard header from "Welcome back! 👋" to "Ready for leads, {firstName}?"
- [ ] Add user profile picture to header (optional enhancement)
- [ ] Maintain all existing auth functionality

**Files to Modify**:
- `frontend/src/pages/Dashboard/Dashboard.tsx`
- `frontend/src/contexts/AuthContext.tsx`

### Issue 7.3: Visual Consistency (Mint Theme) ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Developer

**PM Requirement**: "Yes, this is paramount, the whole platform should be coherent in visuals and UI"

**Acceptance Criteria**:
- [ ] Apply mint green theme consistently across dashboard
- [ ] Match landing page's professional design feel
- [ ] Update buttons, accents, and color scheme to mint green
- [ ] Maintain current functionality, just improve styling

**Files to Modify**:
- `frontend/src/pages/Dashboard/Dashboard.tsx`
- `frontend/src/components/leads/SearchForm.tsx`
- `frontend/src/components/leads/SearchResults.tsx`

### Issue 7.4: API Limits Correction ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Developer

**PM Requirement**: "The api key limits are for 10'000 api call a month, so that should be the measure we show users, instead of 1000 a day!"

**Acceptance Criteria**:
- [ ] Update usage tracking from daily (1000/day) to monthly (10,000/month)
- [ ] Fix both frontend display and backend logic
- [ ] Update progress bars and usage statistics
- [ ] Fix usage reset logic to monthly cycle

**Files to Modify**:
- `backend/src/controllers/LeadController.ts`
- `backend/src/models/User.ts`
- `frontend/src/pages/Dashboard/Dashboard.tsx`

### Issue 7.5: Duplicate Prevention ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Developer

**PM Requirement**: "We should think of a strategy to avoid scraping the same leads multiple times if someone calls the search on the same business type on the same city"

**Acceptance Criteria**:
- [ ] Create simple cache table for searched combinations
- [ ] Track: user_id + city + business_type + place_id
- [ ] Skip already-found leads in subsequent searches
- [ ] Implement cache cleanup (7-day expiry)

**Files to Create/Modify**:
- `backend/migrations/005_create_search_cache.sql`
- `backend/src/services/PlacesService.ts`
- `backend/src/controllers/LeadController.ts`

### Issue 7.6: Custom Lead Count Input ⚡ **CRITICAL**
**Priority**: Critical | **Effort**: 3 hours | **Assignee**: Developer

**PM Requirement**: "We should allow users to decide how many leads they want to get from a city without setting predefined options like {10-25-50}"

**Acceptance Criteria**:
- [ ] Replace preset options with number input field
- [ ] Allow any number (with reasonable max limit)
- [ ] Show warning: "Results may vary based on city size and population"
- [ ] Set reasonable bounds (min: 5, max: 100 per search)

**Files to Modify**:
- `frontend/src/components/leads/SearchForm.tsx`
- `backend/src/controllers/LeadController.ts`

**🚫 SCOPE DISCIPLINE**: NO additional features beyond these 6 items. Everything else is post-launch.

---

## 📡 Milestone 8: Post-Launch Enhancements (FUTURE) 🔮 **DEFERRED**
**Goal**: Advanced features after successful market launch
**Status**: ⏸️ **PAUSED - Focus on Milestone 7 launch**

🎯 **PM DECISION**: "Everything else is extra in my opinion and should be avoided to stay in scope and budget!"

### Future Considerations (Post-Launch Only):
- Advanced search filters (rating, phone availability)
- Complex terminal-style streaming interface
- Search history and saved searches
- Usage analytics and insights
- Mobile responsiveness
- Performance optimizations
- Enhanced export options

**Note**: These features will be reconsidered ONLY after successful market launch and user feedback.

---

## ⚙️ Milestone 9: Settings & API Management (Week 11)
**Goal**: Create user settings and API key management

### Issue 9.1: Settings Page Layout
**Priority**: High | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create settings page with tabs for different configurations.

**Acceptance Criteria**:
- [ ] Tabbed interface for different settings
- [ ] API key management section
- [ ] Connected sheets display
- [ ] Account information section

**Tabs**:
- API Configuration
- Google Sheets
- Account & Billing
- Usage Statistics

### Issue 9.2: API Key Management
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Implement secure API key storage and management.

**Acceptance Criteria**:
- [ ] API key input form with validation
- [ ] Encrypted storage in database
- [ ] API key testing functionality
- [ ] Masking of stored keys in UI

**Security Requirements**:
- Encrypt API keys before database storage
- Never expose full keys in API responses
- Validate API keys before saving

### Issue 9.3: Onboarding Video Integration
**Priority**: Medium | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Add video tutorial for API key setup.

**Acceptance Criteria**:
- [ ] Embed video player in onboarding
- [ ] Video controls and responsive design
- [ ] Progress tracking through onboarding steps
- [ ] Skip option for experienced users

---

## 💳 Milestone 10: Billing Integration (Week 12)
**Goal**: Integrate Stripe for subscription management

### Issue 10.1: Stripe Setup
**Priority**: High | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Set up Stripe integration for subscription billing.

**Acceptance Criteria**:
- [ ] Create Stripe account and get API keys
- [ ] Set up subscription products ($29/month, $99/year)
- [ ] Configure webhooks for subscription events
- [ ] Test in Stripe's test mode

### Issue 10.2: Billing Controller
**Priority**: High | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Create billing endpoints and subscription management.

**Acceptance Criteria**:
- [ ] Create subscription creation endpoints
- [ ] Handle subscription status updates
- [ ] Implement webhook handlers
- [ ] Add subscription checks to protected routes

**API Endpoints**:
- `POST /api/billing/create-subscription` - Create new subscription
- `POST /api/billing/cancel-subscription` - Cancel subscription
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `GET /api/billing/status` - Get subscription status

### Issue 10.3: Billing UI Components
**Priority**: Medium | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create billing management interface.

**Acceptance Criteria**:
- [ ] Subscription status display
- [ ] Plan upgrade/downgrade options
- [ ] Billing history
- [ ] Payment method management

---

## 🧪 Milestone 11: Testing & Quality Assurance (Week 13)
**Goal**: Implement testing and ensure code quality

### Issue 11.1: Unit Tests - Backend
**Priority**: High | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Write unit tests for backend controllers and services.

**Acceptance Criteria**:
- [ ] Test all controller methods
- [ ] Test Places API integration
- [ ] Test Sheets API integration
- [ ] Test authentication flows

**Testing Framework**: Jest + Supertest

### Issue 11.2: Component Tests - Frontend
**Priority**: High | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Write tests for React components.

**Acceptance Criteria**:
- [ ] Test authentication components
- [ ] Test search form functionality
- [ ] Test streaming terminal component
- [ ] Test settings page components

**Testing Framework**: Jest + React Testing Library

### Issue 11.3: Integration Tests
**Priority**: Medium | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create end-to-end integration tests.

**Acceptance Criteria**:
- [ ] Test complete user signup flow
- [ ] Test lead generation process
- [ ] Test Google Sheets integration
- [ ] Test error handling scenarios

---

## 🚀 Milestone 12: Deployment & Launch (Week 14)
**Goal**: Deploy application and prepare for launch

### Issue 12.1: Production Environment Setup
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Set up production deployment configuration.

**Acceptance Criteria**:
- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Configure Redis for production
- [ ] Set up SSL certificates

### Issue 12.2: Docker Production Build
**Priority**: High | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Optimize Docker configuration for production.

**Acceptance Criteria**:
- [ ] Multi-stage Docker builds
- [ ] Optimize image sizes
- [ ] Configure production docker-compose
- [ ] Set up health checks

### Issue 12.3: Performance Optimization
**Priority**: Medium | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Optimize application performance for production.

**Acceptance Criteria**:
- [ ] Optimize React bundle size
- [ ] Implement API response caching
- [ ] Optimize database queries
- [ ] Add rate limiting to prevent abuse

### Issue 12.4: Launch Checklist
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Final pre-launch verification and testing.

**Acceptance Criteria**:
- [ ] Test all user flows in production environment
- [ ] Verify Google OAuth integration works
- [ ] Test Stripe billing integration
- [ ] Confirm Google Sheets streaming works
- [ ] Monitor error logs and performance

---

## 📋 Definition of Done for Each Issue

**Every issue must meet these criteria before being marked complete:**

1. ✅ **Functionality**: Feature works as described in acceptance criteria
2. ✅ **Code Review**: Code follows project standards and best practices
3. ✅ **Testing**: Appropriate tests written and passing
4. ✅ **Documentation**: Code is well-commented and documented
5. ✅ **Error Handling**: Proper error handling and user feedback
6. ✅ **Responsive Design**: UI works on desktop (mobile optional)
7. ✅ **Performance**: No significant performance regressions
8. ✅ **Security**: No security vulnerabilities introduced

## 🎯 Success Metrics

**By the end of Milestone 4.5:**
- Users complete onboarding flow after signup
- Zero users get "lost" after authentication  
- Users successfully set up Google Places API keys
- Dashboard provides clear navigation and next steps
- Settings allow API key management and updates
- Legal pages ensure production compliance

**By the end of all milestones:**
- Users can sign up with Google OAuth
- Users can configure their Google Places API key
- Users can connect their Google Sheets
- Users can search for leads by business type and city
- Leads stream in real-time to their sheets
- Users are limited to 1000 leads per day
- Billing system charges $29/month or $99/year
- Landing page converts visitors effectively

**Total Estimated Timeline**: 14.5 weeks for junior developer
**Total Estimated Effort**: ~215 hours

**Updated Milestone Sequence**:
- Week 1: Project Foundation & Setup
- Week 2: Authentication System  
- Week 3: Database & User Management
- Week 4: Landing Page
- **Week 4.5: Essential Platform UI & Onboarding** ✨ *NEW*
- Week 5-6: Google Places Integration
- Week 7: Google Sheets Integration
- Week 8-9: Dashboard & Search Interface
- Week 10: Real-time Streaming Interface
- Week 11: Settings & API Management
- Week 12: Billing Integration
- Week 13: Testing & Quality Assurance
- Week 14: Deployment & Launch