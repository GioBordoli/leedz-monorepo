import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const BillingCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            No worries! Your subscription process was cancelled and no payment was made. 
            You can try again anytime when you're ready.
          </p>

          {/* Why Subscribe Section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Why subscribe to Leedz Pro?
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Generate up to 10,000 leads per month</li>
              <li>• Export directly to Google Sheets</li>
              <li>• Advanced filtering and search options</li>
              <li>• Priority customer support</li>
              <li>• No setup fees or hidden costs</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-blue-800 font-semibold">
                Just $29/month - Cancel anytime
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              as={Link} 
              to="/settings?tab=billing" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Try Again
            </Button>
            
            <Button 
              as={Link} 
              to="/dashboard" 
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <HelpCircle className="w-4 h-4" />
              <span>
                Need help? <a href="mailto:support@leedz.io" className="text-blue-600 hover:underline">Contact Support</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingCancel; 