import React, { useState, useEffect, useCallback } from 'react';
import leadService from '../../services/leadService';
import { useAuth } from '../../hooks/useAuth';

interface SheetInfo {
  id: string;
  name: string;
  url: string;
}

interface WorksheetInfo {
  id: number;
  name: string;
}

interface SheetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  businessType: string;
  location: string;
  leadsCount: number;
  isExporting: boolean;
}

interface ExportOptions {
  sheetId?: string;
  sheetName?: string;
  worksheetName?: string;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({
  isOpen,
  onClose,
  onExport,
  businessType,
  location,
  leadsCount,
  isExporting
}) => {
  const { token } = useAuth();
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [worksheets, setWorksheets] = useState<WorksheetInfo[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [customSheetName, setCustomSheetName] = useState('');
  const [customWorksheetName, setCustomWorksheetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsReauth, setNeedsReauth] = useState(false);

  // Generate default sheet name
  const defaultSheetName = `${location} ${businessType} Leads`;

  const handleReAuthenticate = () => {
    // Redirect to Google OAuth flow
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/google`;
  };

  const loadSheets = useCallback(async () => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }
    
    setLoading(true);
    setError('');
    setNeedsReauth(false);
    try {
      const response = await leadService.getSheets(token);
      if (response.success) {
        setSheets(response.sheets);
      } else {
        setError('Failed to load your Google Sheets');
      }
    } catch (err) {
      console.error('Error loading sheets:', err);
      
      // Handle re-authentication requirement
      if (err instanceof Error && err.message.includes('REAUTH_REQUIRED:')) {
        const message = err.message.replace('REAUTH_REQUIRED:', '');
        setError(message);
        setNeedsReauth(true);
      } else {
        setError('Failed to load your Google Sheets. Please ensure you\'re authenticated.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadWorksheets = useCallback(async (sheetId: string) => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await leadService.getWorksheets(sheetId, token);
      if (response.success) {
        setWorksheets(response.worksheets);
      } else {
        setError('Failed to load sheet tabs');
      }
    } catch (err) {
      console.error('Error loading worksheets:', err);
      setError('Failed to load sheet tabs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load sheets when modal opens in existing mode
  useEffect(() => {
    if (isOpen && mode === 'existing') {
      loadSheets();
    }
  }, [isOpen, mode, loadSheets]);

  // Load worksheets when sheet is selected
  useEffect(() => {
    if (selectedSheetId && mode === 'existing') {
      loadWorksheets(selectedSheetId);
    }
  }, [selectedSheetId, mode, loadWorksheets]);

  useEffect(() => {
    if (isOpen) {
      setCustomSheetName(defaultSheetName);
      setSelectedSheetId('');
      setWorksheets([]);
      setError('');
    }
  }, [isOpen, defaultSheetName]);

  const handleExport = () => {
    if (isExporting) return;

    const options: ExportOptions = {};

    if (mode === 'existing') {
      if (!selectedSheetId) {
        setError('Please select a sheet');
        return;
      }
      options.sheetId = selectedSheetId;
      
      // Add worksheet name if specified
      if (customWorksheetName.trim()) {
        options.worksheetName = customWorksheetName.trim();
      }
    } else {
      // New sheet mode
      options.sheetName = customSheetName.trim() || defaultSheetName;
      
      // Add worksheet name if specified
      if (customWorksheetName.trim()) {
        options.worksheetName = customWorksheetName.trim();
      }
    }

    onExport(options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Export to Google Sheets
          </h2>
          
          <div className="mb-4 text-sm text-gray-600">
            {leadsCount} leads ready to export
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
              {needsReauth && (
                <button
                  onClick={handleReAuthenticate}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Re-authenticate with Google
                </button>
              )}
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Destination
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="new"
                  checked={mode === 'new'}
                  onChange={(e) => setMode(e.target.value as 'new')}
                  className="mr-2"
                />
                <span className="text-sm">Create new sheet</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="existing"
                  checked={mode === 'existing'}
                  onChange={(e) => setMode(e.target.value as 'existing')}
                  className="mr-2"
                />
                <span className="text-sm">Use existing sheet</span>
              </label>
            </div>
          </div>

          {/* New Sheet Mode */}
          {mode === 'new' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sheet Name
              </label>
              <input
                type="text"
                value={customSheetName}
                onChange={(e) => setCustomSheetName(e.target.value)}
                placeholder={defaultSheetName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use: "{defaultSheetName}"
              </p>
            </div>
          )}

          {/* Existing Sheet Mode */}
          {mode === 'existing' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sheet
              </label>
              {loading && sheets.length === 0 ? (
                <div className="text-sm text-gray-500">Loading your sheets...</div>
              ) : (
                <select
                  value={selectedSheetId}
                  onChange={(e) => setSelectedSheetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a sheet...</option>
                  {sheets.map((sheet) => (
                    <option key={sheet.id} value={sheet.id}>
                      {sheet.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Worksheet/Tab Name (for both modes) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tab Name {mode === 'existing' && worksheets.length > 0 && '(optional)'}
            </label>
            
            {/* Show existing tabs for reference if in existing mode */}
            {mode === 'existing' && worksheets.length > 0 && (
              <div className="mb-2 text-xs text-gray-500">
                Existing tabs: {worksheets.map(ws => ws.name).join(', ')}
              </div>
            )}
            
            <input
              type="text"
              value={customWorksheetName}
              onChange={(e) => setCustomWorksheetName(e.target.value)}
              placeholder={
                mode === 'existing' 
                  ? 'Leave blank to use first tab' 
                  : 'Leave blank for default tab name'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {mode === 'existing' 
                ? 'Will create new tab if name doesn\'t exist'
                : 'Will create tab with this name'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (mode === 'existing' && !selectedSheetId)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export Leads'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetSelector; 