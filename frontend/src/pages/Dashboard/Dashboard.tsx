import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SearchForm from '../../components/leads/SearchForm';
import SearchResults from '../../components/leads/SearchResults';
import leadService, { SearchParams, SearchResult, UsageStats } from '../../services/leadService';
import userService from '../../services/userService';
import { 
  Search, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  Play,
  Database,
  Zap,
  AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load usage stats and API key status on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return; // Wait for token to be available
      
      // Load usage stats (non-critical)
      try {
        const stats = await leadService.getUsageStats(token);
        setUsageStats(stats);
        console.log('🔍 DASHBOARD DEBUG - Usage stats loaded successfully:', stats);
      } catch (err) {
        console.warn('⚠️ Usage stats failed to load, but continuing...', err);
        // Don't fail the whole flow for usage stats
      }
      
      // Load API key status (critical for UI state)
      try {
        const apiKeyStatus = await userService.getApiKeyStatus(token);
        
        // DEBUG: Log what we received
        console.log('🔍 DASHBOARD DEBUG - API key status loaded successfully:', apiKeyStatus);
        console.log('   Extracting has_key:', apiKeyStatus?.api_key_status?.has_key);
        
        setApiKeyConfigured(apiKeyStatus.api_key_status.has_key);
        
        console.log('🔍 DASHBOARD DEBUG - State updated:');
        console.log('   apiKeyConfigured set to:', apiKeyStatus.api_key_status.has_key);
      } catch (err) {
        console.error('❌ Failed to load API key status:', err);
        console.log('🔍 DASHBOARD DEBUG - API key status error, setting apiKeyConfigured to false');
        setApiKeyConfigured(false);
      }
    };

    loadDashboardData();

    // Refresh data when window regains focus (e.g., coming back from Settings)
    const handleWindowFocus = () => {
      loadDashboardData();
    };

    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [token]); // Re-run when token changes

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = async (params: SearchParams) => {
    if (!token) {
      setError('Authentication token not available');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      console.log('🔍 Starting search:', params);
      
      const result = await leadService.searchLeads(params, token);
      setSearchResult(result);
      
      // Update usage stats after successful search
      const updatedStats = await leadService.getUsageStats(token);
      setUsageStats(updatedStats);
      
    } catch (err) {
      console.error('Search failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearResults = () => {
    setSearchResult(null);
    setError(null);
    console.log('✅ Search results cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-ink">
                Leedz
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              
              <Link 
                to="/settings"
                className="p-2 text-gray-600 hover:text-ink transition-colors rounded-lg hover:bg-gray-100"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Ready to generate some qualified leads? Let's get started.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Search Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Main Search Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <SearchForm 
              onSearch={handleSearch}
              isSearching={isSearching}
              apiKeyConfigured={apiKeyConfigured}
            />
            
            {/* API Key Warning */}
            {!apiKeyConfigured && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">API Key Required</p>
                    <p className="text-sm text-yellow-600 mb-2">
                      You need to add your Google Places API key before you can search for leads.
                    </p>
                    <Link 
                      to="/settings"
                      className="text-sm text-yellow-700 font-medium hover:text-yellow-800 underline"
                    >
                      Add API Key in Settings →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
            <SearchResults 
              searchResult={searchResult}
              isSearching={isSearching}
              onClearResults={handleClearResults}
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Settings Quick Access */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-mint rounded-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Settings & API Key</h3>
                <p className="text-sm text-gray-600">Manage your API configuration</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure your Google Places API key and manage your account settings.
            </p>
            <Link 
              to="/settings"
              className="w-full bg-mint text-white py-2 px-4 rounded-lg font-medium hover:bg-mint/90 transition-colors flex items-center justify-center"
            >
              Open Settings
            </Link>
          </div>

          {/* Tutorial Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Getting Started</h3>
                <p className="text-sm text-gray-600">Learn how to use Leedz</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Watch our tutorial to learn how to get your Google Places API key and start generating leads.
            </p>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Watch Tutorial (Coming Soon)</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Status</p>
                <p className={`text-2xl font-bold ${apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
                  {apiKeyConfigured ? 'Configured' : 'Not Set'}
                </p>
              </div>
              <Zap className={`w-8 h-8 ${apiKeyConfigured ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Usage</p>
                <p className="text-2xl font-bold text-ink">
                  {usageStats?.usage.dailyCount || 0} / {usageStats?.usage.dailyLimit || 1000}
                </p>
              </div>
              <Database className="w-8 h-8 text-ink" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Search</p>
                <p className="text-2xl font-bold text-gray-400">
                  {searchResult ? 'Just now' : 'Never'}
                </p>
              </div>
              <Search className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 