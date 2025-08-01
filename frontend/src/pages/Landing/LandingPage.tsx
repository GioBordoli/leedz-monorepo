import React from 'react';
import Header from '../../components/layout/Header';
import HeroSection from '../../components/landing/HeroSection';
import SocialProof from '../../components/landing/SocialProof';
import HowItWorks from '../../components/landing/HowItWorks';
import ValueProps from '../../components/landing/ValueProps';
import DemoSection from '../../components/landing/DemoSection';
import PricingSection from '../../components/landing/PricingSection';
import FAQSection from '../../components/landing/FAQSection';
import FinalCTA from '../../components/landing/FinalCTA';
import Footer from '../../components/layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof */}
      <SocialProof />

      {/* How It Works */}
      <HowItWorks />

      {/* Core Value Props */}
      <ValueProps />

      {/* Demo Section */}
      <DemoSection />

      {/* Pricing */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage; 