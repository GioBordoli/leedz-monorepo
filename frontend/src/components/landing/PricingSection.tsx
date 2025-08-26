import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, UserPlus } from 'lucide-react';
import authService from '../../services/authService';
import Button from '../common/Button';
import Section from '../common/Section';

const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    'Unlimited searches*',
    'Real-time sync',
    'Premium support',
    'Cancel anytime'
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

  const guaranteeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  return (
    <Section id="pricing" background="white" padding="xl">
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
          Simple, Transparent Pricing
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-12"
          variants={itemVariants}
        >
          Choose the billing frequency that works for you. Same powerful features, just different payment schedules.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-12"
          variants={itemVariants}
        >
          <span className={`font-medium transition-colors ${!isYearly ? 'text-text-dark' : 'text-gray-500'}`}>
            Monthly
          </span>
          <motion.button
            className={`relative w-16 h-8 rounded-full p-1 transition-colors ${
              isYearly ? 'bg-mint' : 'bg-gray-300'
            }`}
            onClick={() => setIsYearly(!isYearly)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: isYearly ? 32 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </motion.button>
          <span className={`font-medium transition-colors ${isYearly ? 'text-text-dark' : 'text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <motion.span
              className="bg-mint text-white text-xs font-semibold px-2 py-1 rounded-full ml-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              Save $249!
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Pricing Card */}
      <motion.div
        className="max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="relative bg-white rounded-2xl border-2 border-mint p-8"
          variants={itemVariants}
          whileHover={{ y: -8 }}
        >
          {/* Most Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-mint-gradient text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </span>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.span
                className="text-5xl font-bold text-text-dark"
                key={isYearly ? 'yearly' : 'monthly'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                ${isYearly ? '99' : '29'}
              </motion.span>
              <span className="text-gray-600 text-lg">
                /{isYearly ? 'year' : 'month'}
              </span>
            </div>
            {isYearly && (
              <motion.p
                className="text-mint font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Equivalent to $8.25/month
              </motion.p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 w-5 h-5 bg-mint rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust copy above CTA */}
          <motion.p
            className="text-sm text-gray-600 text-center mb-3"
            variants={itemVariants}
          >
            Start for free — no credit card required
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Button
              variant="primary"
              size="lg"
              className="w-full mb-4 flex items-center justify-center space-x-2"
              onClick={() => authService.login()}
            >
              <UserPlus className="w-5 h-5" />
              <span>Start free</span>
            </Button>
          </motion.div>


          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-mint-gradient opacity-20 blur-lg rounded-2xl -z-10" />
        </motion.div>
      </motion.div>

      {/* Guarantee Section */}
      <motion.div
        className="text-center mt-16"
        variants={guaranteeVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white border border-mint/20 rounded-xl p-8 max-w-2xl mx-auto"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.05 }}
        >
          <div className="w-16 h-16 bg-mint-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-4">
            Our Iron-Clad Guarantee
          </h3>
          <p className="text-lg text-gray-700 mb-2">
            <strong>6,000 leads in 60 days for $58—or you don't pay.</strong>
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            If you don't generate at least 6,000 qualified leads in your first 60 days using Leedz,
            we'll refund every penny. No questions asked, no fine print.
          </p>
        </motion.div>
      </motion.div>

      {/* Fine Print */}
      <motion.div
        className="text-center mt-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
          * Fair usage policy applies. Unlimited searches within Google Places API rate limits.
          Guarantee based on following our recommended search strategies and having an active Google Places API key.
        </p>
      </motion.div>
    </Section>
  );
};

export default PricingSection; 