# Software Engineering Prompt: Lead Generation SaaS for Agency Owners

You are a senior full-stack software engineer building a high-converting lead generation SaaS platform. This is a desktop web application targeting agency owners who need to generate massive lead lists quickly and efficiently.

## Project Overview
Build a Google Places API lead generation tool that streams leads directly to users' Google Sheets. Users provide their own Google Places API keys, we provide the software infrastructure. Bold, confident positioning: "6000 qualified leads in 2 months for $58 or you don't pay."

## Business Model & User Flow
- **Target Users**: Agency owners who need lead generation at scale
- **Pricing**: $29/month or $99/year (same features, billing difference)
- **User API Keys**: Users provide their own Google Places API keys (first $300 free via Google Cloud credits)
- **No Data Storage**: Leads stream directly to user sheets, never stored on our servers
- **User Limit**: 1000 leads per day per user
- **Authentication**: Google OAuth only (required for Sheets access)

## System Architecture

```
[Agency Owner Browser]
          ↓
[React Frontend - Desktop Optimized]
          ↓
[Node.js API - JWT Auth, Rate Limiting]
          ↓
[User's Google Places API] → [Stream to User's Google Sheets]
          ↓
[PostgreSQL - User data only, no leads]
```

## Application Structure & Pages

### 1. Landing Page (MOST POLISHED)
**Hero Section:**
- Bold headline: "Leads From Coast to Coast - Unlimited Leads"
- Subheadline: "Can you even call all these leads? Leads overload."
- Challenge copy: "6000 qualified leads in 2 months for $58 or you don't pay"
- Large video embed space (screen recording of app generating leads)

**Three Pricing Cards:**
- Monthly: $29/month
- Yearly: $99/year (save $249)
- Same features, just billing difference
- Prominent "Start Generating Leads" CTA buttons

**Design:** 
- White background with translucent green accents
- Bold, confident typography
- Modern, clean layout with generous white space
- Desktop-optimized (mobile responsive but not mobile-first)

### 2. Onboarding Flow (Post-OAuth)
**Step 1: Welcome & API Setup**
- Welcome message
- Embedded video: "How to get your Google Cloud API key + $300 free credits"
- API key input field with guided validation
- "Next: Connect Your Sheets" button

**Step 2: Sheet Configuration**
- Input: "Enter your Google Spreadsheet name"
- Auto-creates new sheet tab named "Leads-[Date]"
- Preview of column headers: Name | Address | Phone | Website
- "Start Generating Leads" button

### 3. Lead Generation Dashboard
**Search Configuration:**
- Business Type Selector (dropdown from Google Places API categories)
- City Name input with autocomplete
- "Start Search" button
- Daily usage counter: "247/1000 leads today"

**Results Stream:**
- Terminal-like scrolling interface
- Auto-streaming results as they're found
- Real-time display: "Found 47 leads... streaming to your sheet..."
- Live data rows showing: Business Name | Address | Phone | Website
- No "Send to Sheet" button - automatic streaming

### 4. Settings Page
- Google Places API key management
- Connected Google Sheets list
- Account settings (billing, subscription)
- Usage statistics dashboard
- Logout option

## Technical Requirements

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── common/           # Button, Input, Modal, LoadingSpinner
│   ├── forms/           # APIKeyForm, SheetConfigForm
│   ├── layout/          # Navbar, Footer, Sidebar
│   └── streaming/       # TerminalStream, LeadRow, UsageCounter
├── pages/
│   ├── Landing/         # Hero, PricingCards, VideoSection
│   ├── Auth/           # GoogleOAuth callback handling
│   ├── Onboarding/     # APISetup, SheetConfig
│   ├── Dashboard/      # SearchConfig, StreamingResults
│   └── Settings/       # APIKey, Billing, Usage
├── hooks/
│   ├── useAuth.ts      # Google OAuth + JWT
│   ├── useStreaming.ts # Real-time lead streaming
│   └── useUsageTracking.ts
├── services/
│   ├── authService.ts  # OAuth flow management
│   ├── placesService.ts # Google Places API calls
│   └── sheetsService.ts # Google Sheets integration
└── types/
    ├── User.ts
    ├── Lead.ts
    └── SearchConfig.ts
```

### Backend (Node.js + Express)
- **Authentication**: Google OAuth 2.0 + JWT sessions (persistent login)
- **Rate Limiting**: 1000 leads/day per user tracking
- **API Proxy**: Secure proxy for user's Google Places API calls
- **Sheets Integration**: Direct streaming to user's sheets
- **No Lead Storage**: Only user account data in PostgreSQL

### Database Schema (PostgreSQL)
```sql
-- Users table only (no leads stored)
users (
  id, 
  email, 
  google_oauth_id, 
  places_api_key_encrypted,
  subscription_status,
  daily_usage_count,
  usage_reset_date,
  created_at, 
  updated_at
)

-- Sheet configurations
sheet_configs (
  id,
  user_id,
  spreadsheet_name,
  sheet_tab_name,
  created_at
)
```

## UI/UX Design System

### Colors & Typography
- **Primary**: Pure white (#FFFFFF)
- **Accent**: Translucent green (rgba(0, 255, 127, 0.2))
- **Text**: Dark gray (#1F2937)
- **Success**: Bright green (#10B981)
- **Font**: Inter, clean sans-serif
- **Tone**: Bold, confident, slightly aggressive ("leads overload")

### Key Components
- **Streaming Terminal**: Dark background, green text, scrolling effect
- **Usage Counter**: Prominent display of daily limit progress
- **CTA Buttons**: Bold, high-contrast, impossible to miss
- **Video Container**: Large, prominent placement on landing page

## Specific Implementation Details

### Lead Streaming Logic
1. User starts search (business type + city)
2. Backend queries Google Places API in batches
3. Real-time WebSocket connection streams results to frontend
4. Each lead immediately written to user's Google Sheet
5. Frontend shows terminal-style scrolling with live updates
6. Usage counter increments in real-time

### Google Places Integration
- Use Google Places API business type categories for dropdown
- Search by text query: "[Business Type] in [City]"
- Extract: name, formatted_address, formatted_phone_number, website
- Handle API rate limits gracefully

### Google Sheets Integration
- OAuth scope: https://www.googleapis.com/auth/spreadsheets
- Auto-create sheet tab: "Leads-YYYY-MM-DD"
- Headers: Name | Address | Phone | Website
- Append rows in real-time as leads are found

## Success Criteria
1. ✅ Landing page converts visitors with bold value proposition
2. ✅ Seamless onboarding with guided API setup
3. ✅ Real-time lead streaming with terminal effect
4. ✅ Direct Google Sheets integration (no manual export)
5. ✅ 1000 leads/day limit enforcement
6. ✅ Desktop-optimized, professional interface
7. ✅ Persistent login sessions
8. ✅ Modular codebase for easy iteration on each page

## Deployment & Security
- Docker containerization
- Environment variables for all secrets
- API key encryption at rest
- Rate limiting and abuse prevention
- HTTPS/SSL certificates
- Subscription billing integration (Stripe)

Build this as a high-converting SaaS that agency owners will love - fast, powerful, and results-focused. The landing page should make them think "I need this NOW" and the app should deliver on that promise with seamless lead generation.