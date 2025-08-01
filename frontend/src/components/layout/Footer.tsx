import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How it works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Demo', href: '#demo' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '#faq' },
        { name: 'Contact Support', href: 'mailto:support@leedz.online' },
        { name: 'API Documentation', href: '#' },
        { name: 'Status Page', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Partners', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'GDPR', href: '#' },
      ]
    }
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

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.startsWith('mailto:')) {
      window.location.href = href;
    }
  };

  return (
    <footer className="bg-ink text-gray-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <h3 className="text-2xl font-display font-bold text-text-light mb-4">
                Leedz
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
                The fastest way to generate qualified leads and stream them directly 
                to your Google Sheets. Built for agencies that need results.
              </p>
              <div className="flex items-center gap-4">
                <motion.a
                  href="mailto:support@leedz.online"
                  className="flex items-center gap-2 text-mint hover:text-mint-light transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">support@leedz.online</span>
                </motion.a>
              </div>
            </motion.div>

            {/* Links Sections */}
            {footerLinks.map((section, index) => (
              <motion.div key={section.title} variants={itemVariants}>
                <h4 className="text-text-light font-semibold mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <motion.button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-text-light transition-colors text-sm flex items-center gap-1"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                        {link.href.startsWith('http') && (
                          <ExternalLink className="w-3 h-3" />
                        )}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-800 py-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2024 Leedz. All rights reserved.
            </div>

            {/* Tagline */}
            <div className="text-sm text-gray-400 font-medium">
              Made for agencies who want results 🚀
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => scrollToSection('#')}
                className="text-gray-500 hover:text-text-light transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => scrollToSection('#')}
                className="text-gray-500 hover:text-text-light transition-colors"
              >
                Terms
              </button>
              <button
                onClick={() => scrollToSection('#')}
                className="text-gray-500 hover:text-text-light transition-colors"
              >
                Cookies
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-mint/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-mint/10 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer; 