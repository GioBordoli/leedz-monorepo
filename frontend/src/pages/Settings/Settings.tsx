import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import userService, { ApiKeyStatus } from '../../services/userService';
import leadService, { SheetsAuthStatus } from '../../services/leadService';
import ReAuthenticateModal from '../../components/auth/ReAuthenticateModal';
import { 
  ArrowLeft,
  Key, 
  User, 
  Shield, 
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TestTube,
  RefreshCw,
  FileSpreadsheet,
  XCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, token } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  
  // Google Sheets authentication state
  const [sheetsAuthStatus, setSheetsAuthStatus] = useState<SheetsAuthStatus | null>(null);
  const [isCheckingSheetsAuth, setIsCheckingSheetsAuth] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [isReAuthenticating, setIsReAuthenticating] = useState(false);

  // Load API key status on component mount
  useEffect(() => {
    const loadApiKeyStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const status = await userService.getApiKeyStatus(token);
        setApiKeyStatus(status);
        
        // Set the preview or empty string
        if (status.api_key_status.has_key && status.api_key_status.key_preview) {
          setApiKey(status.api_key_status.key_preview);
        } else {
          setApiKey('');
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load API key status:', err);
        setError('Failed to load API key status');
      } finally {
        setLoading(false);
      }
    };

    loadApiKeyStatus();
  }, [token]);

  const checkSheetsAuthentication = useCallback(async () => {
    if (!token) return;
    
    setIsCheckingSheetsAuth(true);
    try {
      const authStatus = await leadService.checkSheetsAuthStatus(token);
      setSheetsAuthStatus(authStatus);
    } catch (error) {
      console.error('Failed to check Sheets authentication:', error);
      setSheetsAuthStatus({
        success: false,
        authenticated: false,
        hasRefreshToken: false,
        needsReauth: true,
        message: 'Failed to check authentication status'
      });
    } finally {
      setIsCheckingSheetsAuth(false);
    }
  }, [token]);

  useEffect(() => {
    checkSheetsAuthentication();
  }, [checkSheetsAuthentication]);

  const handleReAuthenticate = () => {
    setIsReAuthenticating(true);
    // Redirect to Google OAuth flow
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/google`;
  };

  const handleSaveApiKey = async () => {
    if (!token || !apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await userService.saveApiKey(token, apiKey.trim());
      setSuccess(result.message);
      
      // Reload API key status
      const status = await userService.getApiKeyStatus(token);
      setApiKeyStatus(status);
      setApiKey(status.api_key_status.key_preview || '');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      setError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!token) return;

    setIsTesting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await userService.testApiKey(token);
      setSuccess(result.message);
      
      // Reload status to get updated validation
      const status = await userService.getApiKeyStatus(token);
      setApiKeyStatus(status);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('API key test failed:', error);
      setError(error instanceof Error ? error.message : 'API key test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const isApiKeyModified = apiKey !== (apiKeyStatus?.api_key_status.key_preview || '');
  const hasApiKey = apiKeyStatus?.api_key_status.has_key || false;
  const isApiKeyValid = apiKeyStatus?.api_key_status.is_valid || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-mint" />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3 text-gray-600 hover:text-ink">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-ink">Settings</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <a href="#api-keys" className="bg-mint/10 text-mint border-r-2 border-mint flex items-center px-3 py-2 text-sm font-medium">
                <Key className="w-4 h-4 mr-3" />
                API Keys
              </a>
              <a href="#security" className="text-gray-600 hover:text-ink hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium">
                <Shield className="w-4 h-4 mr-3" />
                Security
              </a>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* API Keys Section */}
            <section id="api-keys" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-mint rounded-lg">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Google Places API Key</h2>
                  <p className="text-sm text-gray-600">Manage your Google Places API credentials</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Current API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-transparent pr-12"
                      placeholder="Enter your Google Places API key (e.g., AIzaSyExample...)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">Google Cloud Console</a>
                  </p>
                </div>

                {/* API Key Status */}
                {hasApiKey && (
                  <div className={`p-4 rounded-lg border ${isApiKeyValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center space-x-3">
                      {isApiKeyValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                      <div>
                        <p className={`font-medium ${isApiKeyValid ? 'text-green-900' : 'text-yellow-900'}`}>
                          {isApiKeyValid ? 'API Key Active' : 'API Key Status Unknown'}
                        </p>
                        <p className={`text-sm ${isApiKeyValid ? 'text-green-700' : 'text-yellow-700'}`}>
                          {isApiKeyValid 
                            ? 'Your API key is working correctly.'
                            : 'Click "Test API Key" to verify your key is working.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isUpdating || !isApiKeyModified || !apiKey.trim()}
                    className="bg-mint text-white px-6 py-2 rounded-lg font-medium hover:bg-mint/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>

                  {hasApiKey && (
                    <button
                      onClick={handleTestApiKey}
                      disabled={isTesting || isUpdating}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isTesting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4" />
                      )}
                      <span>Test API Key (Optional)</span>
                    </button>
                  )}
                </div>

                {/* Test API Key Info */}
                {hasApiKey && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">💡 About API Key Testing</h3>
                    <p className="text-sm text-blue-800">
                      The test button validates your API key by making a sample request to Google Places API. 
                      If the test fails, you can still use your key for lead generation - the test just helps verify 
                      your key has the right permissions and quotas.
                    </p>
                  </div>
                )}

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">How to get your API key:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable the "Places API" in the API Library</li>
                    <li>Go to "Credentials" and create an API key</li>
                    <li>Restrict the key to "Places API" for security</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Security & Privacy</h2>
                  <p className="text-sm text-gray-600">Your data protection settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-2">Data Privacy</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Your API keys are encrypted and stored securely</li>
                        <li>✓ We never store or access your lead data</li>
                        <li>✓ All searches are processed directly through your API</li>
                        <li>✓ You maintain full ownership of your generated leads</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Authentication</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Google OAuth</p>
                        <p className="text-sm text-gray-600">Signed in via Google</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Sheets Connection Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">Google Sheets Connection</h3>
                        <p className="text-sm text-blue-700">
                          {isCheckingSheetsAuth ? (
                            <span className="flex items-center space-x-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Checking...</span>
                            </span>
                          ) : sheetsAuthStatus?.authenticated ? (
                            <span className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Connected and active</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-600">
                              <XCircle className="w-3 h-3" />
                              <span>Not connected</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {!sheetsAuthStatus?.authenticated && (
                      <button
                        onClick={() => setShowReAuthModal(true)}
                        disabled={isCheckingSheetsAuth}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Connect Sheets
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showReAuthModal && (
        <ReAuthenticateModal
          isOpen={showReAuthModal}
          onClose={() => setShowReAuthModal(false)}
          onReAuthenticate={handleReAuthenticate}
          isReAuthenticating={isReAuthenticating}
          feature="Google Sheets export"
        />
      )}
    </div>
  );
};

export default Settings; 