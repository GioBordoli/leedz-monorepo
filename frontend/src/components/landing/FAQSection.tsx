import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Section from '../common/Section';

const FAQSection: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "How much do Google Places API calls cost?",
      answer: "Google gives you $300 in free credits when you sign up, which covers about 60,000 lead searches. After that, it's approximately $17 per 1,000 places searched. You only pay Google directly - we never markup API costs."
    },
    {
      question: "Do you store or retain my lead data?",
      answer: "Absolutely not. Your leads stream directly from Google Places to your Google Sheets. We never store, access, or retain any of your lead data. This ensures complete privacy and GDPR compliance."
    },
    {
      question: "Are there any rate limits or daily caps?",
      answer: "We limit users to 1,000 leads per day to prevent abuse and ensure fair usage. This is plenty for most agency needs while keeping costs manageable. Google Places API has its own rate limits which we respect."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 60-day money-back guarantee. If you don't generate at least 6,000 qualified leads in your first 60 days following our recommended strategies, we'll refund every penny, no questions asked."
    },
    {
      question: "What counts as a 'qualified' lead?",
      answer: "A qualified lead includes business name, address, phone number (when available), and website (when available). We filter out closed businesses and obvious duplicates to ensure data quality."
    },
    {
      question: "Can I cap my daily usage to control costs?",
      answer: "Yes! You can set daily limits in your dashboard to control how many leads are searched per day. This helps you manage your Google Places API costs and usage according to your budget."
    },
    {
      question: "Which Google Sheets formats are supported?",
      answer: "Leedz works with any Google Sheet. We automatically create a new tab with standardized headers (Name, Address, Phone, Website) and stream leads directly there. No special formatting required."
    },
    {
      question: "What if I need help getting started?",
      answer: "We provide comprehensive onboarding including video tutorials for getting your Google Places API key and setting up your first search. Our support team is available via email for any questions."
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
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Section id="faq" background="light" padding="xl">
      <motion.div
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-dark mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg lg:text-xl text-gray-600">
            Got questions? We've got answers. Can't find what you're looking for? 
            <a href="mailto:support@leedz.online" className="text-mint hover:text-mint-light ml-1">
              Contact us
            </a>
          </p>
        </motion.div>

        <motion.div className="space-y-4" variants={containerVariants}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg border border-border-light shadow-sm overflow-hidden"
              variants={itemVariants}
            >
              <motion.button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                whileHover={{ backgroundColor: "rgb(249 250 251)" }}
              >
                <span className="font-semibold text-text-dark pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openFAQ === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          variants={itemVariants}
        >
          <div className="bg-white rounded-xl border border-mint/20 p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-text-dark mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you get the most out of Leedz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-mint-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-mint/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // TODO: Connect to auth flow
                  console.log('Get started clicked');
                }}
              >
                Get started now
              </motion.button>
              <motion.a
                href="mailto:support@leedz.online"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact support
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default FAQSection; 