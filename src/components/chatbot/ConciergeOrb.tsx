import { motion, useReducedMotion } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

const stateMotion: Record<OrbState, { duration: number; spin: number; glow: [number, number] }> = {
  idle: { duration: 4.4, spin: 10, glow: [0.55, 0.85] },
  listening: { duration: 1.5, spin: 6, glow: [0.8, 1] },
  thinking: { duration: 1.8, spin: 4, glow: [0.6, 0.95] },
  speaking: { duration: 0.85, spin: 5, glow: [0.85, 1] },
};

export function ConciergeOrb({
  size = 48,
  state = 'idle',
  className = '',
}: {
  size?: number;
  state?: OrbState;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const config = stateMotion[state];
  const animated = !reduceMotion;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.span
        className="absolute inset-0 rounded-full blur-[6px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.85) 0%, rgba(236,72,153,0.35) 55%, transparent 72%)',
        }}
        animate={animated ? { scale: [1, 1.18, 1], opacity: config.glow } : undefined}
        transition={{ duration: config.duration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {(state === 'listening' || state === 'speaking') && animated && (
        <>
          {[0, 0.7].map(delay => (
            <motion.span
              key={delay}
              className="absolute inset-0 rounded-full border border-amber-300/70"
              initial={{ scale: 0.82, opacity: 0.7 }}
              animate={{ scale: 1.75, opacity: 0 }}
              transition={{ duration: 1.9, repeat: Infinity, delay, ease: 'easeOut' }}
            />
          ))}
        </>
      )}

      <motion.span
        className="absolute inset-[7%] rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, #fbbf24, #f97316, #ec4899, #8b5cf6, #38bdf8, #fbbf24)',
          opacity: 0.92,
        }}
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: config.spin, repeat: Infinity, ease: 'linear' }}
      />

      <span
        className="absolute inset-[13%] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 26%, #fff7ed 0%, #fde68a 22%, #fbbf24 45%, #f59e0b 62%, #b45309 82%, #78350f 100%)',
          boxShadow:
            'inset 0 -6px 14px rgba(120,53,15,0.55), inset 0 6px 12px rgba(255,255,255,0.45)',
        }}
      />

      <span
        className="absolute rounded-full bg-white/85 blur-[1px]"
        style={{
          width: Math.max(4, size * 0.2),
          height: Math.max(3, size * 0.13),
          top: '21%',
          left: '27%',
          transform: 'rotate(-18deg)',
        }}
      />

      {state === 'speaking' && animated && (
        <span className="absolute inset-0 flex items-center justify-center gap-[2px]">
          {[0, 1, 2, 3].map(index => (
            <motion.span
              key={index}
              className="w-[2.5px] rounded-full bg-slate-950/70"
              animate={{ height: [size * 0.08, size * 0.26, size * 0.1] }}
              transition={{ duration: 0.62, repeat: Infinity, delay: index * 0.09, ease: 'easeInOut' }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
