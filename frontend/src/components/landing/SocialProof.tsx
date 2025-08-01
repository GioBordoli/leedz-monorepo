import React from 'react';
import { motion } from 'framer-motion';
import Section from '../common/Section';

const SocialProof: React.FC = () => {
  // Placeholder agency names - will be replaced with actual logos
  const agencies = [
    'Digital Marketing Pro',
    'Growth Agency',
    'Lead Masters',
    'Agency Elite',
    'Scale Solutions',
    'Performance Partners'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Section background="light" padding="md" className="border-y border-border-light">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="text-sm font-medium text-gray-600 mb-8"
          variants={itemVariants}
        >
          Trusted by 500+ agencies worldwide
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {agencies.map((agency, index) => (
            <motion.div
              key={agency}
              className="flex items-center justify-center"
              variants={itemVariants}
            >
              {/* Placeholder logo - will be replaced with actual agency logos */}
              <div className="bg-gray-200 rounded-lg p-4 w-full h-16 flex items-center justify-center transition-all duration-300 hover:bg-gray-300 hover:scale-105">
                <span className="text-xs font-medium text-gray-500 text-center leading-tight">
                  {agency}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 text-sm text-gray-500"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Active users online</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
          <div>
            <span className="font-semibold text-gray-700">2.3M+</span> leads generated this month
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
          <div>
            <span className="font-semibold text-gray-700">99.9%</span> uptime guarantee
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default SocialProof; 