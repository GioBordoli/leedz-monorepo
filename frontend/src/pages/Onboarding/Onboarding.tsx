import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Play, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      setValidationError('Please enter your Google Places API key');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // TODO: Implement actual API key validation
      // For now, simulate validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Basic format validation for Google API keys
      if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
        throw new Error('Invalid API key format. Google Places API keys typically start with "AIza" and are around 39 characters long.');
      }

      // 🆕 CALL BACKEND TO COMPLETE ONBOARDING (replaces localStorage)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/user/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Get token from auth context - you may need to update useAuth hook to expose token
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      const result = await response.json();
      console.log('✅ Onboarding completed via API:', result);
      
      // 🚫 REMOVE localStorage - backend now handles this!
      // localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-ink">Leedz</div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">
            🎉 Welcome to Leedz!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            You're just one step away from generating qualified leads
          </p>
          <p className="text-gray-500">
            Let's get your Google Places API key set up so you can start finding businesses
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Account Created</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <span className="text-sm font-medium text-mint">API Setup</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-500">3</span>
              </div>
              <span className="text-sm font-medium text-gray-500">Start Generating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Tutorial Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Setup Tutorial</h2>
                <p className="text-sm text-gray-600">5-minute walkthrough</p>
              </div>
            </div>
            
            {/* Video Placeholder */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Tutorial Video</p>
                  <p className="text-gray-400 text-sm mb-4">Learn how to get your Google Places API key</p>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto">
                    <Play className="w-4 h-4" />
                    <span>Watch Tutorial</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-ink">Quick Steps:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="bg-mint text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>Go to Google Cloud Console</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-mint text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>Enable Google Places API</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-mint text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Create API credentials</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-mint text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <span>Copy your API key</span>
                </div>
              </div>
            </div>

            {/* External Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a 
                href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>Open Google Cloud Console</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* API Key Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-mint rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Enter Your API Key</h2>
                <p className="text-sm text-gray-600">Paste your Google Places API key below</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key Input */}
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Google Places API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSyC..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationError && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-500 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Your API key is secure</p>
                    <p className="text-blue-700">
                      We encrypt and store your API key safely. We never store or have access to your lead data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleApiKeySubmit}
                disabled={isValidating}
                className="w-full bg-mint text-white py-3 px-4 rounded-lg font-medium hover:bg-mint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Validating API Key...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>I've Got My Key - Let's Go!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need help? We're here to support you every step of the way.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a href="mailto:support@leedz.io" className="text-mint hover:text-mint/80 font-medium">
              Email Support
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="text-mint hover:text-mint/80 font-medium">
              Help Center
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="text-mint hover:text-mint/80 font-medium">
              Live Chat
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding; 