import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Database, Clock } from 'lucide-react';
import Button from '../common/Button';
import Section from '../common/Section';

const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const mockSheetData = [
    { name: "Joe's Plumbing Company", address: "123 Main St, New York, NY", phone: "(555) 123-4567", website: "joesplumbing.com" },
    { name: "Joe's Cousin's Plumbing Co.", address: "456 Oak Ave, Brooklyn, NY", phone: "(555) 234-5678", website: "joescplumbing.com" },
    { name: "Joe's Cousin's Cousin's Plumbing Co.", address: "789 Pine Rd, Queens, NY", phone: "(555) 345-6789", website: "joesccplumbing.com" },
  ];

  return (
    <Section background="white" padding="xl" className="pt-32 lg:pt-40">
      <motion.div
        className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
      >
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-text-dark leading-tight mb-6"
            variants={itemVariants}
          >
            Find local leads &{' '}
            <span className="text-mint bg-mint-gradient bg-clip-text text-transparent">
              stream them straight
            </span>{' '}
            into Google Sheets.
          </motion.h1>

          <motion.p
            className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            variants={itemVariants}
          >
            Bring your own key. We don't store your data.{' '}
            <strong className="text-text-dark">
              6,000 qualified leads in 60 days for $58—or you don't pay.
            </strong>
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            variants={itemVariants}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const element = document.getElementById('pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group"
            >
              Start now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                const element = document.getElementById('demo');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch 60-sec demo
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-mint" />
              No data stored
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-mint" />
              Google OAuth
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-mint" />
              Cancel anytime
            </div>
          </motion.div>
        </div>

        {/* Right Column - Google Sheets Mock */}
        <motion.div
          className="relative"
          variants={itemVariants}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-border-light overflow-hidden">
            {/* Sheet Header */}
            <div className="bg-gray-50 border-b border-border-light p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-sm font-medium text-gray-700">
                  Leads - New York Plumbers
                </div>
              </div>
            </div>

            {/* Sheet Content */}
            <div className="p-4">
              {/* Column Headers */}
              <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <div className="p-2 bg-gray-50 rounded">Name</div>
                <div className="p-2 bg-gray-50 rounded">Address</div>
                <div className="p-2 bg-gray-50 rounded">Phone</div>
                <div className="p-2 bg-gray-50 rounded">Website</div>
              </div>

              {/* Data Rows */}
              {mockSheetData.map((row, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-4 gap-2 mb-2 text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.3, duration: 0.5 }}
                >
                  <div className="p-2 bg-mint/5 rounded text-gray-800 font-medium">
                    {row.name}
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-gray-600">
                    {row.address}
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-gray-600">
                    {row.phone}
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-mint hover:underline cursor-pointer">
                    {row.website}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <motion.div
                className="grid grid-cols-4 gap-2 mb-2 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
              >
                <div className="p-2 bg-mint/10 rounded flex items-center">
                  <motion.div
                    className="flex space-x-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-1 h-1 bg-mint rounded-full"></div>
                    <div className="w-1 h-1 bg-mint rounded-full"></div>
                    <div className="w-1 h-1 bg-mint rounded-full"></div>
                  </motion.div>
                </div>
                <div className="p-2 bg-gray-50/50 rounded"></div>
                <div className="p-2 bg-gray-50/50 rounded"></div>
                <div className="p-2 bg-gray-50/50 rounded"></div>
              </motion.div>
            </div>
          </div>

          {/* Subtle mint glow */}
          <div className="absolute -inset-1 bg-mint-gradient opacity-20 blur-lg rounded-lg -z-10"></div>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default HeroSection; 