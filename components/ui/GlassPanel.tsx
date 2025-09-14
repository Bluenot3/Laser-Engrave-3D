
import React from 'react';
import { motion } from 'framer-motion';

export const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative rounded-[28px] overflow-hidden shadow-2xl shadow-zinc-900/10 ${className}`}
    >
      <div className="absolute inset-0 bg-zinc-100/60 backdrop-blur-xl border border-white/30 rounded-[28px]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grain.png')] opacity-5"></div>
      <div className="prismatic-border">
        <div className="relative text-zinc-800">
            {children}
        </div>
      </div>
    </motion.div>
  );
};
