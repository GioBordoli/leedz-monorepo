import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Button from '../common/Button';
import Section from '../common/Section';

const FinalCTA: React.FC = () => {
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
    <Section background="dark" padding="xl">
      <motion.div
        className="text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-mint-gradient rounded-full mb-8 shadow-2xl"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ duration: 0.3 }}
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-6xl font-display font-bold text-text-light mb-6 leading-tight"
          variants={itemVariants}
        >
          Ready to flood your pipeline with{' '}
          <span className="text-mint bg-mint-gradient bg-clip-text text-transparent">
            qualified leads?
          </span>
        </motion.h2>

        {/* Subheadline */}
                 <motion.p
           className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
           variants={itemVariants}
         >
           The fastest way to generate qualified leads at scale. 
           Set up takes 2 minutes. Get started today.
         </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto"
          variants={containerVariants}
        >
          <motion.div className="text-center" variants={itemVariants}>
            <div className="text-3xl font-bold text-mint mb-2">2.3M+</div>
            <div className="text-sm text-gray-400">Leads generated</div>
          </motion.div>
          <motion.div className="text-center" variants={itemVariants}>
            <div className="text-3xl font-bold text-mint mb-2">500+</div>
            <div className="text-sm text-gray-400">Happy agencies</div>
          </motion.div>
          <motion.div className="text-center" variants={itemVariants}>
            <div className="text-3xl font-bold text-mint mb-2">99.9%</div>
            <div className="text-sm text-gray-400">Uptime SLA</div>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              const element = document.getElementById('pricing');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xl px-12 py-4 shadow-2xl hover:shadow-mint/30 group"
          >
            Start now
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-gray-400"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>No credit card required</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Cancel anytime</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>60-day guarantee</span>
          </div>
        </motion.div>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-mint/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-mint-light/5 rounded-full blur-3xl"></div>
        </div>
      </motion.div>
    </Section>
  );
};

export default FinalCTA; 