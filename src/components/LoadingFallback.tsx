import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingFallback Component
 *
 * A loading fallback component used with React.Suspense for lazy-loaded routes.
 * Displays the MiMenu square mark animated with a framer-motion loading bar.
 */
export const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="bg-card px-8 py-6 rounded-2xl shadow-lg border border-border flex flex-col items-center gap-4">
        <motion.img
          src="/mimenu-square.svg"
          alt="MiMenu"
          className="w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        <div className="w-40 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
