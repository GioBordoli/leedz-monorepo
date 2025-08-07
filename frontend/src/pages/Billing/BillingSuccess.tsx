import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import Button from '../../components/common/Button';

const BillingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small delay to show success state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Leedz Pro! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your subscription has been successfully activated. You now have access to all Pro features including 10,000 monthly lead searches.
          </p>

          {/* Features List */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              What's included in your Pro plan:
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                10,000 lead searches per month
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Google Sheets integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Advanced search filters
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Priority customer support
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              as={Link} 
              to="/dashboard" 
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
            >
              <span>Start Generating Leads</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              as={Link} 
              to="/settings" 
              variant="outline"
              className="w-full"
            >
              Manage Subscription
            </Button>
          </div>

          {/* Session Info (for debugging) */}
          {sessionId && process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Session ID: {sessionId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingSuccess; 