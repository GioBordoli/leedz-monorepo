import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/Landing/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Onboarding from './pages/Onboarding/Onboarding';
import Settings from './pages/Settings/Settings';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import AuthSuccess from './pages/Auth/AuthSuccess';
import AuthError from './pages/Auth/AuthError';
import BillingSuccess from './pages/Billing/BillingSuccess';
import BillingCancel from './pages/Billing/BillingCancel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OnboardingPrompt from './components/OnboardingPrompt'; // 🆕 NEW IMPORT
import './App.css';

// Import debug utility for development
import './utils/debugAuth';

// Component to handle post-auth routing logic
const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  
  // 🆕 SERVER-DRIVEN ONBOARDING DECISION (no more localStorage!)
  const needsOnboarding = user?.needsOnboarding || false;
  const isFirstLogin = user?.isFirstLogin || false;
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {needsOnboarding ? (
            isFirstLogin ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <OnboardingPrompt />
            )
          ) : (
            <Dashboard />
          )}
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Billing routes */}
      <Route path="/billing/success" element={
        <ProtectedRoute>
          <BillingSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/billing/cancel" element={
        <ProtectedRoute>
          <BillingCancel />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthenticatedApp />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
