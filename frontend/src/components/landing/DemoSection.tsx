import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import Section from '../common/Section';

const DemoSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Section id="demo" background="dark" padding="xl">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.2, delayChildren: 0.3 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-light mb-6"
          variants={itemVariants}
        >
          See Leedz in Action
        </motion.h2>
        <motion.p
          className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          variants={itemVariants}
        >
          Watch how we generate and stream 1000+ qualified leads directly to your Google Sheet in real-time.
        </motion.p>

        {/* Video Thumbnail */}
        <motion.div
          className="relative max-w-4xl mx-auto cursor-pointer group"
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Video Container */}
          <div className="relative bg-gradient-to-br from-slate-custom to-ink rounded-xl overflow-hidden shadow-2xl border border-mint/20">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              {/* Play Button */}
              <motion.div
                className="flex items-center justify-center w-20 h-20 bg-mint-gradient rounded-full shadow-lg group-hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.div>

              {/* Background grid effect */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-mint/20"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

            {/* Caption */}
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white text-lg font-semibold mb-2">
                From search to Sheet in under a minute
              </h3>
              <p className="text-gray-300 text-sm">
                Complete walkthrough: Setup → Search → Real-time streaming
              </p>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-1 bg-mint-gradient opacity-20 blur-lg rounded-xl group-hover:opacity-30 transition-opacity" />
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full"></div>
            <span>60-second demo</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full"></div>
            <span>Real data, real results</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full"></div>
            <span>No signup required</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Player */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                {/* Placeholder for actual video */}
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-mint-gradient rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Demo Video Coming Soon</h3>
                  <p className="text-gray-400">
                    We're preparing an amazing demo video to show you Leedz in action.
                  </p>
                </div>
                
                {/* When ready, replace with actual video:
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  poster="/demo-poster.jpg"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default DemoSection; 