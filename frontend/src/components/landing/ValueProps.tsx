import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Key, Database, Filter } from 'lucide-react';
import Section from '../common/Section';

const ValueProps: React.FC = () => {
  const valueProps = [
    {
      title: 'Real-time streaming',
      description: 'Leads appear in your Google Sheet instantly as we find them. No CSV exports, no manual imports, no delays.',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Live data streaming', 'Instant Sheet updates', 'No file downloads']
    },
    {
      title: 'Bring your own API key',
      description: 'Use your Google Places API key for full control and low costs. Google gives you $300 free credits to start.',
      icon: Key,
      gradient: 'from-purple-500 to-pink-500',
      features: ['Full data control', '$300 free credits', 'Transparent pricing']
    },
    {
      title: 'No data stored',
      description: 'Your leads go directly to your Sheet. We never store, access, or sell your data. Privacy and compliance friendly.',
      icon: Database,
      gradient: 'from-mint to-mint-light',
      features: ['Zero data retention', 'GDPR compliant', 'Complete privacy']
    },
    {
      title: 'De-dupe & filters',
      description: 'Advanced filtering removes duplicates and low-quality leads. Get only the qualified prospects you need.',
      icon: Filter,
      gradient: 'from-orange-500 to-red-500',
      features: ['Smart de-duplication', 'Quality filters', 'Coming soon'],
      comingSoon: true
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
    <Section id="features" background="light" padding="xl">
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
          Why Agencies Choose Leedz
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          Built for professionals who need reliable, high-quality lead generation without the complexity.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {valueProps.map((prop, index) => {
          const Icon = prop.icon;
          return (
            <motion.div
              key={prop.title}
              className={`relative bg-white rounded-xl border border-border-light p-6 shadow-lg hover:shadow-xl transition-all duration-300 group ${
                prop.comingSoon ? 'opacity-90' : ''
              }`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Coming Soon Badge */}
              {prop.comingSoon && (
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  Coming Soon
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${prop.gradient} rounded-lg mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-text-dark mb-4 group-hover:text-mint transition-colors">
                {prop.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {prop.description}
              </p>

              {/* Feature List */}
              <ul className="space-y-2">
                {prop.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full mr-3 flex-shrink-0"></div>
                    <span className={feature === 'Coming soon' ? 'italic text-orange-500' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Hover effect overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center mt-16"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white rounded-xl border border-mint/20 p-8 shadow-lg max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold text-text-dark mb-4">
            Ready to 10x your lead generation?
          </h3>
                     <p className="text-gray-600 mb-6">
             Start generating high-quality leads today with Leedz.
           </p>
                     <motion.button
             className="bg-mint-gradient text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-mint/25 transition-all duration-300"
             onClick={() => {
               const element = document.getElementById('pricing');
               element?.scrollIntoView({ behavior: 'smooth' });
             }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
           >
             Start now →
           </motion.button>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default ValueProps; 