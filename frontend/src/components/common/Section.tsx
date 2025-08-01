import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'light' | 'dark' | 'ink';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  container?: boolean;
  animate?: boolean;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  background = 'white',
  padding = 'lg',
  container = true,
  animate = true,
  id,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const backgroundClasses = {
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-slate-custom',
    ink: 'bg-ink'
  };

  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24'
  };

  const containerClasses = container 
    ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' 
    : '';

  const sectionClasses = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;

  if (!animate) {
    return (
      <section className={sectionClasses} id={id}>
        <div className={containerClasses}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      className={sectionClasses}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }}
    >
      <div className={containerClasses}>
        {children}
      </div>
    </motion.section>
  );
};

export default Section; 