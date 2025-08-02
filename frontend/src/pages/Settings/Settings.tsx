import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft,
  Key, 
  User, 
  Shield, 
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('AIzaSyC...existing_key_placeholder');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveApiKey = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement actual API key update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update API key:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setIsUpdating(true);
    try {
      // TODO: Implement actual API key deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApiKey('');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete API key:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-ink transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-semibold text-ink">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <a 
                  href="#api-keys" 
                  className="flex items-center space-x-3 px-4 py-3 text-mint bg-mint/5 border-r-2 border-mint font-medium"
                >
                  <Key className="w-5 h-5" />
                  <span>API Keys</span>
                </a>
                <a 
                  href="#account" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-ink hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </a>
                <a 
                  href="#security" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-ink hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </a>
              </div>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
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
                      placeholder="Enter your Google Places API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* API Key Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">API Key Active</p>
                      <p className="text-sm text-green-700">
                        Your API key is working correctly. Last validated 2 hours ago.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isUpdating}
                    className="bg-mint text-white px-6 py-2 rounded-lg font-medium hover:bg-mint/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSaved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Key</span>
                  </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Delete API Key</h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete your API key? This will disable lead generation until you add a new key.
                      </p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleDeleteApiKey}
                          disabled={isUpdating}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Account Section */}
            <section id="account" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-custom-500 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Account Information</h2>
                  <p className="text-sm text-gray-600">Manage your account details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email is managed through your Google account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="bg-mint text-white px-3 py-1 rounded-full text-sm font-medium">
                      Free Plan
                    </span>
                    <span className="text-gray-600 text-sm">1,000 leads per day</span>
                  </div>
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
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 