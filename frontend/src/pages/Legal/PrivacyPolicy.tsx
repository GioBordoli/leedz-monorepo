import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-ink transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-semibold text-ink">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            At Leedz, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your information when you use our lead generation service.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Data Security</h3>
            </div>
            <p className="text-blue-800 text-sm">
              We encrypt your API keys and never store your lead data. Your information is protected with industry-standard security measures.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Eye className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Transparency</h3>
            </div>
            <p className="text-green-800 text-sm">
              We're transparent about what data we collect and how we use it. You have full control over your information.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4 flex items-center space-x-2">
              <Database className="w-6 h-6" />
              <span>Information We Collect</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-ink mb-2">Account Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Email address (from Google OAuth)</li>
                  <li>Google account profile information</li>
                  <li>Account creation and login timestamps</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-ink mb-2">API Keys and Configuration</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Google Places API keys (encrypted)</li>
                  <li>Sheet configuration settings</li>
                  <li>Search preferences and filters</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-ink mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Number of searches performed</li>
                  <li>Feature usage analytics</li>
                  <li>Error logs and performance metrics</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4 flex items-center space-x-2">
              <Lock className="w-6 h-6" />
              <span>What We DON'T Collect</span>
            </h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Lead Data:</strong> We never store or access the business data you generate</li>
                <li><strong>Sheet Contents:</strong> We don't read or store your Google Sheets data</li>
                <li><strong>Search Results:</strong> All lead data flows directly from Google to your sheets</li>
                <li><strong>Personal Business Information:</strong> We don't collect information about your business or clients</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">How We Use Your Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-ink mb-2">Service Provision</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Authenticate your account and maintain your session</li>
                  <li>Connect to Google APIs using your credentials</li>
                  <li>Process your lead generation requests</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-ink mb-2">Service Improvement</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Monitor performance and fix bugs</li>
                  <li>Develop new features based on user needs</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Data Security</h2>
            
            <div className="space-y-4 text-gray-600">
              <p>We implement industry-standard security measures to protect your information:</p>
              
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Encryption:</strong> All API keys are encrypted at rest and in transit</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can access your data</li>
                <li><strong>Regular Audits:</strong> We regularly audit our security practices</li>
                <li><strong>Secure Infrastructure:</strong> Our servers are hosted on secure, monitored infrastructure</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Data Sharing and Third Parties</h2>
            
            <div className="space-y-4 text-gray-600">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
              
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Google APIs:</strong> We use your API keys to access Google services on your behalf</li>
                <li><strong>Service Providers:</strong> Trusted partners who help us operate our service (hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Your Rights</h2>
            
            <div className="space-y-4 text-gray-600">
              <p>You have the following rights regarding your personal information:</p>
              
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a standard format</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
              
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@leedz.io" className="text-mint hover:text-mint/80">privacy@leedz.io</a>.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Data Retention</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>We retain your information only as long as necessary to provide our services:</p>
              
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Usage Logs:</strong> Retained for 12 months for analytics and debugging</li>
                <li><strong>API Keys:</strong> Deleted immediately when you remove them or close your account</li>
              </ul>
              
              <p>When you delete your account, we remove all personal information within 30 days.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Changes to This Policy</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              
              <p>
                Significant changes will be communicated via email or through our service notifications.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">Contact Us</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:privacy@leedz.io" className="text-mint hover:text-mint/80">privacy@leedz.io</a></li>
                  <li><strong>Support:</strong> <a href="mailto:support@leedz.io" className="text-mint hover:text-mint/80">support@leedz.io</a></li>
                  <li><strong>Address:</strong> [Your Business Address]</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy; 