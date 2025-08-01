import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Zap, TrendingUp } from 'lucide-react';
import Section from '../common/Section';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Connect Google',
      description: 'Sign in with Google OAuth to access your Sheets. Secure, instant, no passwords.',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      title: 'Paste Places API key & pick area/filters',
      description: 'Add your Google Places API key (free $300 credit) and select your target location and business type.',
      icon: Key,
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: 3,
      title: 'Leads stream into your Sheet in real time',
      description: 'Watch leads appear live in your Google Sheet as we find them. No CSV exports, no delays.',
      icon: Zap,
      color: 'from-mint to-mint-light',
    },
    {
      number: 4,
      title: 'You make more money quicker',
      description: 'Call leads while they\'re hot. Convert faster with real-time data and beat your competition.',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Section id="how-it-works" background="white" padding="xl">
      <motion.div
        className="text-center mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-dark mb-6"
          variants={itemVariants}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          From sign-up to leads in under 2 minutes. No complex setup, no technical skills required.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              className="relative"
              variants={itemVariants}
            >
              {/* Connection line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 transform -translate-x-4 z-0">
                  <motion.div
                    className="h-full bg-mint-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1 + index * 0.3, duration: 0.8 }}
                  />
                </div>
              )}

              <motion.div
                className="relative bg-white rounded-xl border border-border-light p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step number */}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4 mx-auto group-hover:bg-mint/10 transition-colors">
                  <span className="text-xl font-bold text-gray-700 group-hover:text-mint transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-lg mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-text-dark mb-3 group-hover:text-mint transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-mint-gradient opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="text-center mt-16"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="text-gray-600 mb-6"
          variants={itemVariants}
        >
          Ready to get started?
        </motion.p>
        <motion.button
          className="bg-mint-gradient text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-mint/25 hover:scale-105 transition-all duration-300"
          onClick={() => {
            // TODO: Connect to auth flow
            console.log('Start generating leads clicked');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          Start generating leads →
        </motion.button>
      </motion.div>
    </Section>
  );
};

export default HowItWorks; 