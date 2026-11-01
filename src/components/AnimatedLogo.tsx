import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
}

/** Animated MiMenu mark used in the landing hero preview column. */
export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = '' }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className={`relative mx-auto flex w-full max-w-[320px] items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md ${className}`}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg shadow-amber-500/20"
      >
        <img src="/mimenu.svg" alt="MiMenu" className="h-9 w-9" />
      </motion.div>

      <div className="min-w-0 text-left">
        <p className="font-display text-xl leading-none text-white">MiMenu</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/80">
          Menú digital premium
        </p>
      </div>

      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ x: ['0%', '420%'] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedLogo;
