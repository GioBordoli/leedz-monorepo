import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SearchForm from '../../components/leads/SearchForm';
import SearchResults from '../../components/leads/SearchResults';
import leadService, { SearchParams, SearchResult, UsageStats, StreamingCallbacks } from '../../services/leadService';
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
  const [streamingBusinessNames, setStreamingBusinessNames] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState<{ found: number; total: number } | undefined>();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load usage stats and API key status on component mount
  const loadUsageStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const stats = await leadService.getUsageStats(token);
      setUsageStats(stats);
      setApiKeyConfigured(stats.apiKey.configured);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      // Don't show error for stats loading failure
    }
  }, [token]);

  useEffect(() => {
    loadUsageStats();
  }, [loadUsageStats]);

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
      setSearchResult(null);
      setStreamingBusinessNames([]);
      setSearchProgress(undefined);
      
      console.log('🔍 Starting streaming search:', params);
      
      const callbacks: StreamingCallbacks = {
        onStart: (businessType, location) => {
          console.log(`🚀 Search started: ${businessType} in ${location}`);
        },
        
        onBusinessFound: (businessName, found, total) => {
          console.log(`🏢 Business found: ${found} ${businessName}!`);
          
          // Add the business name to our streaming list (keep last 10 for UI performance)
          setStreamingBusinessNames(prev => {
            const updated = [...prev, businessName];
            return updated.slice(-10); // Keep only the last 10 names
          });
          
          // Update progress
          setSearchProgress({ found, total });
        },
        
        onComplete: (result) => {
          console.log('✅ Search completed:', result);
          setSearchResult(result);
          setStreamingBusinessNames([]);
          setSearchProgress(undefined);
          
          // Update usage stats after successful search
          loadUsageStats();
        },
        
        onError: (errorMessage) => {
          console.error('❌ Search failed:', errorMessage);
          setError(errorMessage);
          setStreamingBusinessNames([]);
          setSearchProgress(undefined);
        }
      };

      await leadService.searchLeadsStream(params, callbacks, token);
      
    } catch (err) {
      console.error('Search failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setStreamingBusinessNames([]);
      setSearchProgress(undefined);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearResults = () => {
    setSearchResult(null);
    setError(null);
    setStreamingBusinessNames([]);
    setSearchProgress(undefined);
    console.log('✅ Search results cleared');
  };

  // Extract first name from user's full name
  const getFirstName = (fullName: string): string => {
    if (!fullName || fullName.trim() === '') {
      return 'there';
    }
    
    const firstName = fullName.trim().split(' ')[0];
    return firstName || 'there';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-ink">Leedz</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <User className="w-4 h-4" />
                <span>{user?.name || user?.email || 'User'}</span>
              </div>
              
              <Link
                to="/settings"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
        {/* Welcome Section - Centered */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt={user.name || 'User'}
                className="w-12 h-12 rounded-full border-2 border-mint"
              />
            )}
          </div>
          <h1 className="text-4xl font-bold text-ink mb-4">
            Ready for leads, {getFirstName(user?.name || user?.email || '')}? 🎯
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's generate some qualified prospects for your business.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Search Failed</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centered Search Form */}
        <div className="max-w-4xl mx-auto mb-12">
          <SearchForm 
            onSearch={handleSearch}
            isSearching={isSearching}
            apiKeyConfigured={apiKeyConfigured}
          />
          
          {/* API Key Warning */}
          {!apiKeyConfigured && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
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

        {/* Search Results - Full Width */}
        {(searchResult || isSearching) && (
          <div className="mb-12">
            <SearchResults 
              searchResult={searchResult}
              isSearching={isSearching}
              streamingBusinessNames={streamingBusinessNames}
              searchProgress={searchProgress}
              onClearResults={handleClearResults}
            />
          </div>
        )}

        {/* Bottom Status Cards - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* API Configuration Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:shadow-mint/10 hover:border-mint/30 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${apiKeyConfigured ? 'bg-mint' : 'bg-gray-100'}`}>
                <Zap className={`w-5 h-5 ${apiKeyConfigured ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-lg font-semibold text-ink">API Configuration</h3>
            </div>
            
            <div className="mb-4">
              {apiKeyConfigured ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mint rounded-full"></div>
                  <span className="text-mint font-medium">Configured & Ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-500 font-medium">Not Configured</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              {apiKeyConfigured 
                ? 'Your API key is working correctly and ready to search.'
                : 'Add your Google Places API key to start searching for leads.'
              }
            </p>
            
            <Link
              to="/settings"
              className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Manage Settings
            </Link>
          </div>

          {/* Usage Stats Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:shadow-mint/10 hover:border-mint/30 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-ink">This Month's Usage</h3>
            </div>
            
            <div className="mb-2">
              <div className="text-3xl font-bold text-ink">
                {usageStats?.usage.monthlyCount || 0} / {usageStats?.usage.monthlyLimit || 10000}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-mint h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.min(100, ((usageStats?.usage.monthlyCount || 0) / (usageStats?.usage.monthlyLimit || 10000)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Resets: {usageStats?.usage.resetMonth ? 
                new Date(new Date(usageStats.usage.resetMonth).getFullYear(), new Date(usageStats.usage.resetMonth).getMonth() + 1, 1)
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : 'Next month'}
            </p>
            
            {usageStats && usageStats.usage.monthlyCount > 0 && (
              <p className="text-sm text-mint mt-2">
                You're using your quota efficiently. Great job!
              </p>
            )}
          </div>

          {/* Learn & Grow Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:shadow-mint/10 hover:border-mint/30 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Play className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-ink">Learn how to use Leedz</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Watch our tutorial to learn how to get your Google Places API key and start generating leads effectively.
            </p>
            
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mb-3">
              <Play className="w-4 h-4" />
              <span>Watch Tutorial</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 