import React, { useState } from 'react';
import { Download, MapPin, FileSpreadsheet, CheckCircle, XCircle, Search } from 'lucide-react';
import { SearchResult, ExportOptions } from '../../services/leadService';
import leadService from '../../services/leadService';
import SheetSelector from './SheetSelector';
import ReAuthenticateModal from '../auth/ReAuthenticateModal';
import { useAuth } from '../../hooks/useAuth';

interface SearchResultsProps {
  searchResult: SearchResult | null;
  isSearching: boolean;
  streamingBusinessNames?: string[];
  searchProgress?: { found: number; total: number };
  onClearResults?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResult, 
  isSearching, 
  streamingBusinessNames = [],
  searchProgress,
  onClearResults 
}) => {
  const { token } = useAuth();
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isReAuthenticating, setIsReAuthenticating] = useState(false);
  const [exportStatus, setExportStatus] = useState<'success' | 'error' | null>(null);
  const [exportMessage, setExportMessage] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');

  const exportToCSV = () => {
    if (!searchResult?.results.length) return;

    const headers = ['Name', 'Address', 'Phone', 'Website', 'Rating', 'Reviews'];
    const csvContent = [
      headers.join(','),
      ...searchResult.results.map(lead => [
        `"${lead.name}"`,
        `"${lead.address}"`,
        `"${lead.phone}"`,
        `"${lead.website}"`,
        lead.rating || '',
        lead.reviewCount || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${searchResult.search.businessType}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkSheetsAuthentication = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsCheckingAuth(true);
    try {
      const authStatus = await leadService.checkSheetsAuthStatus(token);
      return authStatus.authenticated;
    } catch (error) {
      console.error('Failed to check Sheets authentication:', error);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleReAuthenticate = () => {
    setIsReAuthenticating(true);
    // Redirect to Google OAuth flow
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/google`;
  };

  const openSheetsExport = async () => {
    const isAuthenticated = await checkSheetsAuthentication();
    
    if (isAuthenticated) {
      setShowSheetSelector(true);
    } else {
      setShowReAuthModal(true);
    }
    
    setExportStatus(null);
  };

  const handleExportToSheets = async (options: ExportOptions) => {
    if (!searchResult?.results.length || !token) return;

    setIsExporting(true);
    setExportStatus(null);
    setShowSheetSelector(false);

    try {
      // Transform lead data to match backend interface (only export essential data)
      const leadsData = searchResult.results.map(lead => ({
        name: lead.name,
        address: lead.address,
        phone: lead.phone || null,
        website: lead.website || null,
        placeId: lead.placeId
      }));

      const result = await leadService.exportToSheets(
        leadsData,
        options,
        searchResult.search.businessType,
        searchResult.search.location,
        token
      );

      setExportStatus('success');
      setExportMessage(result.message);
      setSheetUrl(result.sheetUrl);

      // Clear results after successful export (as requested by user)
      setTimeout(() => {
        if (onClearResults) {
          onClearResults();
        }
      }, 3000); // Give user time to see the success message

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setExportMessage(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const clearExportStatus = () => {
    setExportStatus(null);
    setExportMessage('');
    setSheetUrl('');
  };

  // Show streaming progress during search
  if (isSearching) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint"></div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-ink mb-2">Searching for leads...</h3>
            {searchProgress && (
              <p className="text-sm text-gray-600">
                Just a moment...
              </p>
            )}
          </div>

          {/* Streaming Business Names */}
          {streamingBusinessNames.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium text-ink mb-3">Businesses Found:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {streamingBusinessNames.map((businessName, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-mint/5 border border-mint/20 rounded-lg animate-pulse"
                  >
                    <div className="w-2 h-2 bg-mint rounded-full animate-ping"></div>
                    <span className="text-sm text-gray-700 font-medium">{businessName}</span>
                  </div>
                ))}
              </div>
              
              {streamingBusinessNames.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing latest businesses found...
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              This may take a few moments depending on your search criteria...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no search has been performed yet
  if (!searchResult) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:shadow-mint/10 transition-all duration-300">
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-mint-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-mint/25">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">Ready to find leads</h3>
          <p className="text-gray-600">
            Enter your search criteria and click "Find Leads" to start discovering businesses.
          </p>
        </div>
      </div>
    );
  }

  const { results, search } = searchResult;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:shadow-mint/10 transition-all duration-300">
      {/* Results Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Search Results</h3>
            <p className="text-sm text-gray-600">
              Found {results.length} {search.businessType} businesses in {search.location}
            </p>
          </div>
          
          {results.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={openSheetsExport}
                disabled={isCheckingAuth || isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-mint-gradient hover:shadow-lg hover:shadow-mint/25 hover:scale-[1.01] active:scale-[0.99] text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isCheckingAuth ? 'Checking...' : 'Export to Sheets'}</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gradient-to-r from-mint/5 to-mint-light/5 border border-mint/20 rounded-xl p-3">
            <p className="text-gray-600">Business Type</p>
            <p className="font-medium text-ink capitalize">{search.businessType}</p>
          </div>
          <div className="bg-gradient-to-r from-mint/5 to-mint-light/5 border border-mint/20 rounded-xl p-3">
            <p className="text-gray-600">Location</p>
            <p className="font-medium text-ink">{search.location}</p>
          </div>
          <div className="bg-gradient-to-r from-mint/5 to-mint-light/5 border border-mint/20 rounded-xl p-3">
            <p className="text-gray-600">API Usage</p>
            <p className="font-medium text-mint">{results.length} calls used</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-mint-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-mint/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Leads Secured! 🎯</h3>
          <p className="text-lg text-gray-600 mb-6">
            Successfully found {results.length} qualified {search.businessType} businesses in {search.location}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={openSheetsExport}
              disabled={isCheckingAuth || isExporting}
              className="flex items-center space-x-2 px-6 py-3 bg-mint-gradient hover:shadow-lg hover:shadow-mint/25 hover:scale-[1.01] active:scale-[0.99] text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none font-medium"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{isCheckingAuth ? 'Checking...' : 'Export to Sheets'}</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or searching in a different location.
          </p>
        </div>
      )}

      {/* Export Status Messages */}
      {exportStatus && (
        <div className="p-4 border-t border-gray-200">
          {exportStatus === 'success' ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Export Successful!</p>
                  <p className="text-green-700 text-sm">{exportMessage}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 underline text-sm"
                  >
                    View in Google Sheets
                  </a>
                )}
                <button
                  onClick={clearExportStatus}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Export Failed</p>
                  <p className="text-red-700 text-sm">{exportMessage}</p>
                  <p className="text-red-600 text-xs mt-1">You can try the CSV export as a backup.</p>
                </div>
              </div>
              <button
                onClick={clearExportStatus}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Re-authenticate Modal */}
      <ReAuthenticateModal
        isOpen={showReAuthModal}
        onClose={() => setShowReAuthModal(false)}
        onReAuthenticate={handleReAuthenticate}
        isReAuthenticating={isReAuthenticating}
        feature="Google Sheets export"
      />

      {/* Sheet Selector Modal */}
      {searchResult && (
        <SheetSelector
          isOpen={showSheetSelector}
          onClose={() => setShowSheetSelector(false)}
          onExport={handleExportToSheets}
          businessType={searchResult.search.businessType}
          location={searchResult.search.location}
          leadsCount={searchResult.results.length}
          isExporting={isExporting}
        />
      )}
    </div>
  );
};

export default SearchResults; 