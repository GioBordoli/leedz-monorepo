import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
            <h1 className="text-xl font-semibold text-ink">Terms of Service</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-4">Terms of Service</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Welcome to Leedz! These Terms of Service govern your use of our lead generation platform. 
            By using our service, you agree to these terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">What You Can Do</h3>
            </div>
            <p className="text-green-800 text-sm">
              Use Leedz to generate business leads, export to Google Sheets, and grow your business legally and ethically.
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-red-900">What You Can't Do</h3>
            </div>
            <p className="text-red-800 text-sm">
              Abuse our service, violate Google's policies, or use leads for spam or illegal activities.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Your Responsibility</h3>
            </div>
            <p className="text-yellow-800 text-sm">
              You're responsible for your API usage, costs, and compliance with applicable laws and regulations.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4 flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>1. Acceptance of Terms</span>
            </h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                By accessing or using Leedz ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">2. Description of Service</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                Leedz is a lead generation platform that helps businesses find potential customers using 
                Google Places API. Our service allows you to:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Search for businesses based on location and criteria</li>
                <li>Stream results directly to your Google Sheets</li>
                <li>Filter and deduplicate lead data</li>
                <li>Manage your API keys and search configurations</li>
              </ul>
              
              <p>
                The Service acts as an interface between you and Google's APIs. We do not store or control 
                the lead data generated through your searches.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">3. User Accounts and Registration</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                To use our Service, you must register for an account using Google OAuth. By registering, you:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Promptly notify us of any unauthorized use</li>
              </ul>
              
              <p>
                You must be at least 18 years old and have the legal capacity to enter into contracts 
                to use our Service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">4. API Keys and Third-Party Services</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                Our Service requires you to provide your own Google Places API key. You are responsible for:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Obtaining and maintaining valid API credentials</li>
                <li>Complying with Google's Terms of Service and API policies</li>
                <li>All costs associated with your API usage</li>
                <li>Monitoring your API usage and quotas</li>
              </ul>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Important Notice</p>
                    <p className="text-yellow-800 text-sm">
                      We are not responsible for any charges, suspensions, or violations related to your 
                      Google API usage. Please review Google's pricing and policies carefully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">5. Acceptable Use Policy</h2>
            
            <div className="text-gray-600 space-y-4">
              <h3 className="text-lg font-medium text-ink mb-2">You agree NOT to:</h3>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                <li>Send spam or unsolicited communications to generated leads</li>
                <li>Attempt to reverse engineer, hack, or compromise our Service</li>
                <li>Violate Google's Terms of Service or API usage policies</li>
                <li>Scrape or collect data in violation of robots.txt or website terms</li>
                <li>Use the Service to compete with or harm our business</li>
                <li>Share your account credentials with others</li>
                <li>Generate excessive API requests that could impact service performance</li>
              </ul>
              
              <h3 className="text-lg font-medium text-ink mb-2 mt-6">Responsible Use Guidelines:</h3>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Respect data protection and privacy laws (GDPR, CCPA, etc.)</li>
                <li>Obtain proper consent before contacting generated leads</li>
                <li>Use lead data ethically and professionally</li>
                <li>Comply with anti-spam laws and regulations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">6. Service Availability and Modifications</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                We strive to provide reliable service, but we cannot guarantee:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>100% uptime or uninterrupted access</li>
                <li>Compatibility with all third-party services</li>
                <li>That the Service will meet your specific requirements</li>
              </ul>
              
              <p>
                We reserve the right to modify, suspend, or discontinue the Service at any time, 
                with or without notice. We may also impose limits on certain features or restrict 
                access to parts of the Service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">7. Payment and Billing</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                Currently, Leedz offers a free tier with usage limits. Future paid plans may include:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Monthly or annual subscription fees</li>
                <li>Usage-based pricing for premium features</li>
                <li>Additional support and customization options</li>
              </ul>
              
              <p>
                Any future billing will be clearly communicated, and you will have the option to 
                upgrade or continue with the free tier.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-ink mb-4">8. Intellectual Property</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by Leedz 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              
              <p>
                You retain ownership of any data you input into the Service and any leads you generate. 
                We do not claim ownership of your data or leads.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">9. Privacy and Data Protection</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
                and protect your information. By using the Service, you agree to the collection 
                and use of information in accordance with our Privacy Policy.
              </p>
              
              <p>
                Key privacy principles:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>We encrypt and secure your API keys</li>
                <li>We do not store or access your lead data</li>
                <li>You maintain full control over your generated leads</li>
                <li>We comply with applicable data protection laws</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">10. Disclaimers and Limitation of Liability</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                <strong>DISCLAIMER:</strong> The Service is provided "as is" without warranties of any kind, 
                either express or implied, including but not limited to warranties of merchantability, 
                fitness for a particular purpose, or non-infringement.
              </p>
              
              <p>
                <strong>LIMITATION OF LIABILITY:</strong> In no event shall Leedz be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including lost profits, data, 
                or business opportunities.
              </p>
              
              <p>
                Our total liability for any claims related to the Service shall not exceed the amount 
                you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">11. Termination</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                You may terminate your account at any time by contacting us or using account deletion 
                features in the Service.
              </p>
              
              <p>
                We may terminate or suspend your account immediately, without prior notice, for any 
                violation of these Terms or for any other reason at our sole discretion.
              </p>
              
              <p>
                Upon termination, your right to use the Service will cease immediately, and we will 
                delete your account data within 30 days.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">12. Changes to Terms</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any 
                changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              
              <p>
                Significant changes will be communicated via email or through Service notifications. 
                Your continued use of the Service after any modifications constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">13. Governing Law and Dispute Resolution</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
              
              <p>
                Any disputes arising from these Terms or the Service shall be resolved through binding 
                arbitration in accordance with [Arbitration Rules], except that you may assert claims 
                in small claims court if they qualify.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-ink mb-4">14. Contact Information</h2>
            
            <div className="text-gray-600 space-y-4">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <ul className="space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:legal@leedz.io" className="text-mint hover:text-mint/80">legal@leedz.io</a></li>
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

export default TermsOfService; 