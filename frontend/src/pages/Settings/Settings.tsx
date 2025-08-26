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
  XCircle,
  Webhook,
  CreditCard
} from 'lucide-react';
import { SubscriptionCard } from '../../components/billing/SubscriptionCard';

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
  const [activeSection, setActiveSection] = useState('api-keys');
  
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

  const navigationItems = [
    {
      section: 'CONFIGURATION',
      items: [
        { id: 'api-keys', label: 'API Keys', icon: Key },
        { id: 'security-privacy', label: 'Security & Privacy', icon: Shield }
      ]
    },
    {
      section: 'INTEGRATIONS',
      items: [
        { id: 'google-sheets', label: 'Google Sheets', icon: FileSpreadsheet },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook }
      ]
    },
    {
      section: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Billing', icon: CreditCard }
      ]
    }
  ];

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

  const renderContent = () => {
    switch (activeSection) {
      case 'api-keys':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-mint rounded-lg">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">API Keys</h2>
                <p className="text-sm text-gray-600">Manage your API credentials and external service connections</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Google Places API Key Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Google Places API Key</h3>
                <p className="text-sm text-gray-600 mb-4">Configure your Google Places API credentials for lead generation</p>
                
                <div className="space-y-4">
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
                        placeholder="••••••••••••••••••••••••••••••••••••••••••••"
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
                            {isApiKeyValid ? '✓ API Key Active - Your API key is working correctly' : 'API Key Status Unknown'}
                          </p>
                          {!isApiKeyValid && (
                            <p className="text-sm text-yellow-700">
                              Click "Test API Key" to verify your key is working.
                            </p>
                          )}
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
                        <span>Test API Key</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Help Section */}
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
        );

      case 'security-privacy':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Security & Privacy</h2>
                <p className="text-sm text-gray-600">Control how your data is protected and processed</p>
              </div>
            </div>

            <div className="space-y-6">
                             {/* Encrypt API Keys */}
               <div className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-gray-900">Encrypt API Keys</h3>
                     <p className="text-sm text-gray-600">Your API keys are encrypted and stored securely</p>
                   </div>
                   <label className="toggle-switch">
                     <input type="checkbox" checked disabled className="toggle-checkbox" />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
               </div>

               {/* Data Retention */}
               <div className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-gray-900">Data Retention</h3>
                     <p className="text-sm text-gray-600">We never store or access your lead data</p>
                   </div>
                   <label className="toggle-switch">
                     <input type="checkbox" checked disabled className="toggle-checkbox" />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
               </div>

               {/* Direct API Processing */}
               <div className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-gray-900">Direct API Processing</h3>
                     <p className="text-sm text-gray-600">All searches are processed directly through your API</p>
                   </div>
                   <label className="toggle-switch">
                     <input type="checkbox" checked disabled className="toggle-checkbox" />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
               </div>

               {/* Lead Ownership */}
               <div className="border border-gray-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="font-medium text-gray-900">Lead Ownership</h3>
                     <p className="text-sm text-gray-600">You maintain full ownership of your generated leads</p>
                   </div>
                   <label className="toggle-switch">
                     <input type="checkbox" checked disabled className="toggle-checkbox" />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
               </div>
            </div>
          </section>
        );

      case 'google-sheets':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-600 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Connected Services</h2>
                <p className="text-sm text-gray-600">Manage your external service connections</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Google OAuth */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Google OAuth</h3>
                      <p className="text-sm text-gray-600">Connected and active</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Manage
                  </span>
                </div>
              </div>

              {/* Google Sheets Connection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Google Sheets Connection</h3>
                      <p className="text-sm text-gray-600">
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
                  {!sheetsAuthStatus?.authenticated ? (
                    <button
                      onClick={() => setShowReAuthModal(true)}
                      disabled={isCheckingSheetsAuth}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Configure
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Configure
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'webhooks':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Webhook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Webhooks</h2>
                <p className="text-sm text-gray-600">Configure webhook endpoints for real-time notifications</p>
              </div>
            </div>

            <div className="text-center py-12">
              <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Webhooks Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Get real-time notifications when new leads are found and exported to your sheets.
              </p>
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 inline-block">
                <p className="text-sm text-orange-800 font-medium">
                  🚀 This feature is under development and will be available soon!
                </p>
              </div>
            </div>
          </section>
        );

      case 'profile':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Profile</h2>
                <p className="text-sm text-gray-600">Manage your account information and preferences</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    📝 Profile editing features coming soon! Your account is managed through Google OAuth for security.
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-ink">Billing & Subscription</h2>
                <p className="text-sm text-gray-600">Manage your subscription and billing information</p>
              </div>
            </div>
            
            <SubscriptionCard />
          </div>
        );

      default:
        return null;
    }
  };

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
            <nav className="space-y-6">
              {navigationItems.map((section) => (
                <div key={section.section}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.section}
                  </h3>
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? 'bg-mint/10 text-mint border-r-2 border-mint'
                              : 'text-gray-600 hover:text-ink hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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

            {/* Dynamic Content */}
            {renderContent()}
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