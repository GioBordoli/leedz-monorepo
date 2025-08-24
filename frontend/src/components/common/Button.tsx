import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  as?: any; // Allow custom component like Link
  to?: string; // For Link component
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  type = 'button',
  as,
  to,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-mint-gradient text-white hover:shadow-lg hover:shadow-mint/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-text-dark border border-border-light hover:border-mint hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50',
    ghost: 'text-mint hover:text-mint-light hover:bg-mint/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  const buttonContent = (
    <motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center"
    >
      {children}
    </motion.span>
  );
  
  // Handle custom component (like Link)
  if (as && !disabled) {
    const Component = motion(as);
    return (
      <Component
        to={to}
        href={href}
        className={classes}
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        {buttonContent}
      </Component>
    );
  }
  
  if (href && !disabled) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        {buttonContent}
      </motion.a>
    );
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      transition={{ duration: 0.2 }}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button; 