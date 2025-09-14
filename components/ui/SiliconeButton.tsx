
import React from 'react';
import { motion } from 'framer-motion';

export const SiliconeButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; }> = ({ children, onClick, className = '', disabled=false }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95, boxShadow: 'inset 0px 2px 4px rgba(0,0,0,0.2)' }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`px-4 py-2 rounded-full font-semibold text-white bg-zinc-800/80 hover:bg-zinc-800/90 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 flex items-center justify-center gap-2 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};
