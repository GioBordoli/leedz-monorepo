import React, { useState } from 'react';
import { Download, ExternalLink, Phone, Globe, MapPin, Star, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { SearchResult, ExportOptions } from '../../services/leadService';
import leadService from '../../services/leadService';
import SheetSelector from './SheetSelector';
import ReAuthenticateModal from '../auth/ReAuthenticateModal';
import { useAuth } from '../../hooks/useAuth';

interface SearchResultsProps {
  searchResult: SearchResult | null;
  isSearching: boolean;
  onClearResults?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResult, isSearching, onClearResults }) => {
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

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Remove non-digits and format as needed
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (isSearching) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-ink mb-2">Searching for leads...</h3>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  if (!searchResult) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No searches yet</h3>
          <p className="text-gray-600">Start a search above to see your leads here</p>
        </div>
      </div>
    );
  }

  const { results, search, usage } = searchResult;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isCheckingAuth ? 'Checking...' : 'Export to Sheets'}</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-mint text-white px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Business Type</div>
            <div className="font-medium capitalize">{search.businessType.replace(/_/g, ' ')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Location</div>
            <div className="font-medium">{search.location}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600">Results</div>
            <div className="font-medium">{results.length} / {search.requested}</div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              Daily Usage: <strong>{usage.todayCount}</strong> / {usage.dailyLimit}
            </span>
            <span className="text-blue-600">
              <strong>{usage.remaining}</strong> searches remaining
            </span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(usage.todayCount / usage.dailyLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Business</th>
                <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                <th className="text-left p-4 font-medium text-gray-900">Rating</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((lead, index) => (
                <tr key={lead.placeId || index} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-ink">{lead.name}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      {lead.phone && (
                        <div className="text-sm flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          <a 
                            href={`tel:${lead.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {formatPhoneNumber(lead.phone)}
                          </a>
                        </div>
                      )}
                      {lead.website && (
                        <div className="text-sm flex items-center">
                          <Globe className="w-3 h-3 mr-1 text-gray-400" />
                          <a 
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate max-w-32"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      {!lead.phone && !lead.website && (
                        <span className="text-sm text-gray-400">No contact info</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {lead.rating ? (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{lead.rating}</span>
                        {lead.reviewCount && (
                          <span className="text-xs text-gray-500">({lead.reviewCount})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No rating</span>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-mint transition-colors"
                          title="Visit website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-gray-400 hover:text-mint transition-colors"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="text-gray-500">
            No results found for this search. Try adjusting your business type or location.
          </div>
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