import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

const OnboardingPrompt: React.FC = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleStart = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-mint rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            You're almost ready to start generating leads. Complete your setup to unlock all features.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-mint" />
            <div>
              <p className="text-sm font-medium text-ink">Quick Setup</p>
              <p className="text-xs text-gray-600">Takes about 2 minutes</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={handleStart}
            className="w-full bg-mint text-white py-3 px-4 rounded-lg font-medium hover:bg-mint/90 transition-colors"
          >
            Complete Setup Now
          </button>
          <button 
            onClick={handleSkip}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Skip for now
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can complete this setup anytime from your settings
        </p>
      </div>
    </div>
  );
};

export default OnboardingPrompt; 