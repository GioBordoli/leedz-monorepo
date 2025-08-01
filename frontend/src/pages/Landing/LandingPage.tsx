import React from 'react';
import { Play } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Leads From Coast to Coast
            <span className="block text-green-bright">Unlimited Leads</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Can you even call all these leads? Leads overload.
          </p>
          <div className="bg-translucent-green border border-green-accent rounded-lg p-6 max-w-2xl mx-auto mb-12">
            <p className="text-lg font-semibold text-gray-800">
              🎯 <strong>6000 qualified leads in 2 months for $58</strong> or you don't pay
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-bright rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                <p className="text-white text-lg">
                  Watch how to generate 1000+ leads in minutes
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Screen recording coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Start Generating Leads Today
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Monthly</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  1000 leads per day
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Direct Google Sheets streaming
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Unlimited business types
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Real-time lead generation
                </li>
              </ul>
              <button className="w-full bg-green-bright text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Start Generating Leads
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-bright relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-bright text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Yearly</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600">/year</span>
                <div className="text-sm text-green-bright font-semibold">
                  Save $249 per year!
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  1000 leads per day
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Direct Google Sheets streaming
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Unlimited business types
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Real-time lead generation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-bright rounded-full mr-3"></span>
                  Priority support
                </li>
              </ul>
              <button className="w-full bg-green-bright text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Start Generating Leads
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Leedz. All rights reserved. | Built for agency owners who want results.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 