import React, { useState } from 'react';
import { Search, MapPin, Building, AlertCircle } from 'lucide-react';
import { SearchParams } from '../../services/leadService';
import { BUSINESS_TYPES } from '../../data/businessTypes';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  apiKeyConfigured?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching, apiKeyConfigured = false }) => {
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessType || !location) {
      setError('Please select a business type and enter a location');
      return;
    }

    if (!apiKeyConfigured) {
      setError('Please add your Google Places API key in Settings before searching');
      return;
    }

    setError(null);
    onSearch({
      businessType,
      location: location.trim(),
      maxResults
    });
  };

  const isFormValid = businessType && location.trim().length > 0;
  const canSubmit = isFormValid && apiKeyConfigured && !isSearching;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-mint rounded-lg">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">Lead Generation Search</h3>
          <p className="text-sm text-gray-600">Find businesses in your target area</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Type Selection */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Business Type
          </label>
          <select
            id="businessType"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={isSearching}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Select a business type...</option>
            {Object.entries(BUSINESS_TYPES).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., San Francisco, CA or 94102"
            disabled={isSearching}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a city, state, ZIP code, or full address
          </p>
        </div>

        {/* Max Results Selection */}
        <div>
          <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Results
          </label>
          <select
            id="maxResults"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            disabled={isSearching}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={10}>10 leads</option>
            <option value={25}>25 leads</option>
            <option value={50}>50 leads</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Higher limits use more of your daily quota
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-mint text-white py-3 px-4 rounded-lg font-medium hover:bg-mint/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Get Leads</span>
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Pro tip:</strong> Try searching for specific business types in well-defined areas for the best results. 
          Each search will find businesses within a 10km radius of your specified location.
        </p>
      </div>
    </div>
  );
};

export default SearchForm; 