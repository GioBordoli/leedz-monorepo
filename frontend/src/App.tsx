import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/Landing/LandingPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <LandingPage />
      </div>
    </AuthProvider>
  );
}

export default App;
