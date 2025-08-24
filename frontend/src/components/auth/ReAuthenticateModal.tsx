import React from 'react';
import { X, RefreshCw, ExternalLink, Shield } from 'lucide-react';

interface ReAuthenticateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReAuthenticate: () => void;
  isReAuthenticating?: boolean;
  feature?: string;
}

const ReAuthenticateModal: React.FC<ReAuthenticateModalProps> = ({
  isOpen,
  onClose,
  onReAuthenticate,
  isReAuthenticating = false,
  feature = "Google Sheets export"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Re-authenticate with Google
              </h3>
              <p className="text-sm text-gray-600">
                Required for {feature}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isReAuthenticating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Google Sheets Access Required
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your Google Sheets access has expired or is not set up. 
              To export leads to Google Sheets, you need to re-authenticate with Google.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">What happens next:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll be redirected to Google's secure login</li>
                  <li>• Grant access to Google Sheets</li>
                  <li>• Return to continue with your export</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isReAuthenticating}
            >
              Cancel
            </button>
            <button
              onClick={onReAuthenticate}
              disabled={isReAuthenticating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isReAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Re-authenticate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReAuthenticateModal; 