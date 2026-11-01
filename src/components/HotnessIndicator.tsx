import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { HotnessLevel } from '@/types/mimenu';
import { getHotnessLabel } from '@/data/mimenuData';

interface HotnessIndicatorProps {
  score: HotnessLevel;
  velocity24h?: number;
  showThermometer?: boolean;
  compact?: boolean;
}

export const HotnessIndicator: React.FC<HotnessIndicatorProps> = ({
  score,
  velocity24h,
  showThermometer = true,
  compact = false,
}) => {
  const { label, color, flameCount } = getHotnessLabel(score);

  if (compact) {
    if (score <= 1) return null;
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Flame
          className={`h-3 w-3 ${
            score === 5 ? 'fill-rose-500 text-rose-500' : 'fill-amber-500 text-amber-500'
          }`}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border shadow-xs ${color}`}>
          <div className="flex items-center">
            {Array.from({ length: Math.max(1, flameCount) }).map((_, i) => (
              <Flame
                key={i}
                className={`w-3.5 h-3.5 ${
                  score === 5
                    ? 'text-rose-500 fill-rose-500'
                    : score === 4
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-amber-500 fill-amber-500'
                } ${i > 0 ? '-ml-1' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="tracking-tight">{label}</span>
        </div>

        {velocity24h !== undefined && velocity24h > 10 && (
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 tabular-nums">
            <TrendingUp className="w-3 h-3 text-emerald-500" aria-hidden="true" />
            <span>+{velocity24h} pedidos hoy</span>
          </span>
        )}
      </div>

      {showThermometer && (
        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              score === 5
                ? 'bg-rose-500'
                : score === 4
                ? 'bg-amber-500'
                : score === 3
                ? 'bg-amber-400'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
