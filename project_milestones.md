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

## 🔐 Milestone 2: Authentication System (Week 2)
**Goal**: Implement Google OAuth authentication with JWT sessions

### Issue 2.1: Google OAuth Setup
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Set up Google OAuth 2.0 for user authentication and Google Sheets access.

**Acceptance Criteria**:
- [ ] Create Google Cloud Console project
- [ ] Configure OAuth 2.0 credentials
- [ ] Set up OAuth consent screen
- [ ] Add required scopes for Sheets API access
- [ ] Store credentials in environment variables

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

## 🗄️ Milestone 3: Database & User Management (Week 3)
**Goal**: Set up PostgreSQL database with user data storage

### Issue 3.1: Database Schema Setup
**Priority**: Critical | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create PostgreSQL database schema for user management.

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

## 🎨 Milestone 4: Landing Page (Week 4)
**Goal**: Create high-converting landing page with pricing

### Issue 4.1: Landing Page Layout
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Build the main landing page with hero section, video space, and pricing cards.

**Acceptance Criteria**:
- [ ] Create responsive hero section
- [ ] Add video embed placeholder (empty div for now)
- [ ] Design pricing cards (2 options: $29/month, $99/year)
- [ ] Implement call-to-action buttons
- [ ] Use white background with translucent green accents

**Page Sections**:
1. **Hero Section**
   - Headline: "Leads From Coast to Coast - Unlimited Leads"
   - Subheadline: "Can you even call all these leads? Leads overload."
   - Challenge: "6000 qualified leads in 2 months for $58 or you don't pay"

2. **Video Section**
   - Large placeholder div for screen recording
   - Play button overlay (non-functional for now)

3. **Pricing Section**
   - Two cards side by side
   - Monthly ($29) vs Yearly ($99) 
   - "Start Generating Leads" buttons

**File**: `frontend/src/pages/Landing/LandingPage.tsx`

### Issue 4.2: Pricing Components
**Priority**: High | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Create reusable pricing card components.

**Acceptance Criteria**:
- [ ] Create `PricingCard` component
- [ ] Implement hover effects and animations
- [ ] Add "Most Popular" badge for yearly plan
- [ ] Connect CTA buttons to authentication flow

**Component Props**:
```typescript
interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}
```

### Issue 4.3: Landing Page Animations
**Priority**: Medium | **Effort**: 3 hours | **Assignee**: Junior Dev

**Description**: Add subtle animations and micro-interactions.

**Acceptance Criteria**:
- [ ] Fade-in animations on scroll
- [ ] Hover effects on pricing cards
- [ ] Smooth scrolling between sections
- [ ] Button hover states with translucent green

**Technical Implementation**:
- Use CSS transitions (300ms ease-in-out)
- Add hover transforms on cards
- Implement scroll-triggered animations

---

## 📊 Milestone 5: Google Places Integration (Week 5-6)
**Goal**: Implement Google Places API search functionality

### Issue 5.1: Places Service Backend
**Priority**: Critical | **Effort**: 10 hours | **Assignee**: Junior Dev

**Description**: Create Google Places API integration service.

**Acceptance Criteria**:
- [ ] Create PlacesService class
- [ ] Implement business type search
- [ ] Add city-based location search
- [ ] Extract required fields (name, address, phone, website)
- [ ] Handle API rate limits and errors

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

## 📋 Milestone 6: Google Sheets Integration (Week 7)
**Goal**: Implement real-time streaming to Google Sheets

### Issue 6.1: Sheets Service Backend
**Priority**: Critical | **Effort**: 10 hours | **Assignee**: Junior Dev

**Description**: Create Google Sheets API integration for writing lead data.

**Acceptance Criteria**:
- [ ] Create SheetsService class
- [ ] Implement sheet creation and selection
- [ ] Add real-time data writing
- [ ] Handle authentication with user's OAuth tokens

**File**: `backend/src/services/SheetsService.js`
```javascript
class SheetsService {
  constructor(userOAuthToken) {
    this.auth = userOAuthToken;
  }
  
  async createLeadSheet(spreadsheetName) {
    // Create new sheet tab with headers
  }
  
  async appendLead(spreadsheetId, sheetName, leadData) {
    // Append single lead to sheet
  }
  
  async batchAppendLeads(spreadsheetId, sheetName, leadsArray) {
    // Append multiple leads efficiently
  }
}
```

### Issue 6.2: Sheet Configuration Frontend
**Priority**: High | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create sheet setup interface in onboarding flow.

**Acceptance Criteria**:
- [ ] Create sheet name input form
- [ ] Add sheet selection dropdown (existing sheets)
- [ ] Implement "Create New Sheet" option
- [ ] Show preview of column headers

**Components**:
- `SheetConfigForm.tsx`
- `SheetSelector.tsx`
- `SheetPreview.tsx`

### Issue 6.3: Real-time Sheet Writing
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Implement streaming leads directly to user's Google Sheets.

**Acceptance Criteria**:
- [ ] Write leads to sheets as they're found
- [ ] Handle batch writing for performance
- [ ] Show real-time confirmation in UI
- [ ] Handle sheet writing errors gracefully

---

## 🖥️ Milestone 7: Dashboard & Search Interface (Week 8-9)
**Goal**: Create the main lead generation dashboard

### Issue 7.1: Dashboard Layout
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Build the main dashboard with search controls and usage stats.

**Acceptance Criteria**:
- [ ] Create dashboard layout with sidebar navigation
- [ ] Add usage counter display (247/1000 leads today)
- [ ] Create search form with business type and city inputs
- [ ] Add "Start Search" button

**Components**:
- `Dashboard.tsx` (main page)
- `UsageCounter.tsx`
- `SearchForm.tsx`
- `Sidebar.tsx`

### Issue 7.2: Search Form Implementation
**Priority**: Critical | **Effort**: 6 hours | **Assignee**: Junior Dev

**Description**: Create the search configuration form.

**Acceptance Criteria**:
- [ ] Business type dropdown with autocomplete
- [ ] City name input with Google Places autocomplete
- [ ] Form validation for required fields
- [ ] Loading states during search

**Form Fields**:
```typescript
interface SearchFormData {
  businessType: string;
  cityName: string;
  radius?: number; // Optional advanced filter
}
```

### Issue 7.3: Usage Tracking Components
**Priority**: High | **Effort**: 4 hours | **Assignee**: Junior Dev

**Description**: Implement daily usage tracking and display.

**Acceptance Criteria**:
- [ ] Real-time usage counter
- [ ] Progress bar showing daily limit
- [ ] Warning when approaching limit
- [ ] Reset timer showing when limit resets

---

## 📡 Milestone 8: Real-time Streaming Interface (Week 10)
**Goal**: Create terminal-style streaming lead display

### Issue 8.1: WebSocket Setup
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Implement WebSocket server for real-time communication.

**Acceptance Criteria**:
- [ ] Set up WebSocket server in backend
- [ ] Create WebSocket client in frontend
- [ ] Handle connection management and reconnection
- [ ] Implement message broadcasting

**Backend**: `backend/src/services/WebSocketServer.js`
**Frontend**: `frontend/src/services/websocketService.ts`

### Issue 8.2: Terminal Streaming UI
**Priority**: Critical | **Effort**: 10 hours | **Assignee**: Junior Dev

**Description**: Create terminal-style interface for displaying streaming leads.

**Acceptance Criteria**:
- [ ] Dark terminal-style container
- [ ] Auto-scrolling lead display
- [ ] Green text with monospace font
- [ ] Real-time lead counter
- [ ] "Streaming to your sheet..." messages

**Component**: `StreamingTerminal.tsx`
```tsx
interface StreamingTerminalProps {
  isActive: boolean;
  leads: Lead[];
  onStop: () => void;
}
```

### Issue 8.3: Lead Streaming Logic
**Priority**: Critical | **Effort**: 8 hours | **Assignee**: Junior Dev

**Description**: Implement the core streaming functionality.

**Acceptance Criteria**:
- [ ] Search Google Places API in batches
- [ ] Stream results via WebSocket
- [ ] Write to Google Sheets simultaneously
- [ ] Update usage counter in real-time
- [ ] Handle stop/start controls

**Flow**:
1. User clicks "Start Search"
2. Backend begins Places API search
3. Each found lead triggers WebSocket message
4. Frontend displays lead in terminal
5. Backend writes lead to user's sheet
6. Usage counter increments

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

**By the end of all milestones:**
- Users can sign up with Google OAuth
- Users can configure their Google Places API key
- Users can connect their Google Sheets
- Users can search for leads by business type and city
- Leads stream in real-time to their sheets
- Users are limited to 1000 leads per day
- Billing system charges $29/month or $99/year
- Landing page converts visitors effectively

**Total Estimated Timeline**: 14 weeks for junior developer
**Total Estimated Effort**: ~200 hours