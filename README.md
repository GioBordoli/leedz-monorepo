# 🎯 Leedz - Lead Generation SaaS

**Leads From Coast to Coast - Unlimited Leads**

A powerful lead generation SaaS platform that helps agency owners generate massive lead lists using Google Places API and stream them directly to Google Sheets in real-time.

## 🚀 Features

- **Real-time Lead Generation**: Stream 1000+ leads per day directly to your Google Sheets
- **Google Places Integration**: Search by business type and location
- **No Data Storage**: Leads go directly to your sheets, never stored on our servers
- **Bring Your Own API Key**: Use your Google Places API key (first $300 free from Google)
- **Bold Value Proposition**: 6000 qualified leads in 2 months for $58 or you don't pay

## 💰 Pricing

- **Monthly**: $29/month
- **Yearly**: $99/year (save $249!)

Same features, just billing difference. No hidden fees.

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Docker** containerization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Google APIs** (OAuth, Places, Sheets)
- **JWT** authentication
- **Docker** containerization

### Infrastructure
- **Google Cloud Platform**
  - Cloud Run (Frontend & Backend)
  - Cloud SQL (PostgreSQL)
  - Cloud Storage
  - Cloud Build
- **GitHub Actions** CI/CD
- **Docker** containers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Cloud account
- Google Places API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/GioBordoli/leedz-monorepo.git
   cd leedz-monorepo
   ```

2. **Set up environment variables**
   ```bash
   cp environment.example .env
   # Edit .env with your actual values
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Manual Setup (Development)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🗂️ Project Structure

```
leedz-monorepo/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── config/         # Configuration
│   ├── Dockerfile
│   └── tsconfig.json
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Local development
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/leedz_db
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://leedz.online/auth/callback
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_ENVIRONMENT=development
```

## 🚀 Deployment

### Google Cloud Platform

1. **Set up GCP Project**
   - Project ID: `leedz-467700`
   - Enable Cloud Run, Cloud SQL, Cloud Build APIs

2. **Deploy with GitHub Actions**
   - Push to `main` branch triggers automatic deployment
   - Requires `GCP_SA_KEY` secret in GitHub repository

3. **Manual Deployment**
   ```bash
   # Build and push images
   docker build -t gcr.io/leedz-467700/leedz-backend ./backend
   docker build -t gcr.io/leedz-467700/leedz-frontend ./frontend
   
   docker push gcr.io/leedz-467700/leedz-backend
   docker push gcr.io/leedz-467700/leedz-frontend
   
   # Deploy to Cloud Run
   gcloud run deploy leedz-backend --image gcr.io/leedz-467700/leedz-backend
   gcloud run deploy leedz-frontend --image gcr.io/leedz-467700/leedz-frontend
   ```

## 📊 Development Roadmap

See our detailed [Project Milestones](project_milestones.md) for the complete 14-week development plan:

- ✅ **Milestone 1**: Project Foundation & Setup
- 🔄 **Milestone 2**: Authentication System (Google OAuth)
- ⏳ **Milestone 3**: Database & User Management
- ⏳ **Milestone 4**: Landing Page
- ⏳ **Milestone 5**: Google Places Integration
- ⏳ **Milestone 6**: Google Sheets Integration
- ⏳ **Milestone 7**: Dashboard & Search Interface
- ⏳ **Milestone 8**: Real-time Streaming Interface
- ⏳ **Milestone 9**: Settings & API Management
- ⏳ **Milestone 10**: Billing Integration (Stripe)
- ⏳ **Milestone 11**: Testing & Quality Assurance
- ⏳ **Milestone 12**: Deployment & Launch

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is proprietary software. All rights reserved.

## 🎯 Business Model

- **Target Market**: Agency owners who need lead generation at scale
- **Value Proposition**: 6000 qualified leads in 2 months for $58
- **Revenue Model**: SaaS subscription ($29/month or $99/year)
- **Unique Advantage**: No data storage, direct streaming, bring-your-own API key

## 🔗 Links

- **Domain**: [leedz.online](https://leedz.online)
- **Repository**: [GitHub](https://github.com/GioBordoli/leedz-monorepo)
- **Google Cloud Project**: leedz-467700

---

Built for agency owners who want results. 🚀 