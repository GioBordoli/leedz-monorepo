import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Search, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  Play,
  ExternalLink,
  Database,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Action - Coming Soon */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-mint rounded-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">Lead Generation</h3>
                  <p className="text-sm text-gray-600">Find businesses in your target area</p>
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              This feature will allow you to search for businesses using Google Places API and stream results directly to your Google Sheets.
            </p>
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
            >
              Start Lead Search
            </button>
          </div>

          {/* Settings Quick Access */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-custom-500 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Settings</h3>
                <p className="text-sm text-gray-600">Manage your API keys</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure your Google Places API key and other settings.
            </p>
            <Link 
              to="/settings"
              className="w-full bg-ink text-white py-2 px-4 rounded-lg font-medium hover:bg-ink/90 transition-colors flex items-center justify-center"
            >
              Open Settings
            </Link>
          </div>
        </div>

        {/* Tutorial Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Getting Started Tutorial</h3>
              <p className="text-sm text-gray-600">Learn how to set up your Google Cloud API key</p>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Tutorial Video</p>
                <p className="text-gray-400 text-sm">Coming soon</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Watch this 5-minute tutorial to learn how to get your Google Places API key and start generating leads.
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Watch Tutorial</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Generated</p>
                <p className="text-2xl font-bold text-ink">0</p>
              </div>
              <Database className="w-8 h-8 text-ink" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Search</p>
                <p className="text-2xl font-bold text-gray-400">Never</p>
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