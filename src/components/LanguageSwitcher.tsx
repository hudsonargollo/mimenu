import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";
import type { Lang } from "@/i18n/translations";

function SczFlag() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-3 w-[18px] rounded-[2px] ring-1 ring-black/10">
      <rect width="24" height="16" fill="#ffffff" />
      <rect width="24" height="5.34" fill="#1b7a3d" />
      <rect y="10.66" width="24" height="5.34" fill="#1b7a3d" />
      <circle cx="12" cy="8" r="2.4" fill="#d9a521" stroke="#b3261e" strokeWidth="0.7" />
    </svg>
  );
}

function UsFlag() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-3 w-[18px] rounded-[2px] ring-1 ring-black/10">
      <rect width="24" height="16" fill="#ffffff" />
      {[0, 2.46, 4.92, 7.38, 9.84, 12.3, 14.76].map((y) => (
        <rect key={y} y={y} width="24" height="1.23" fill="#b22234" />
      ))}
      <rect width="10" height="8.62" fill="#3c3b6e" />
      {[
        [1.4, 1.4], [3.4, 1.4], [5.4, 1.4], [7.4, 1.4],
        [2.4, 3.1], [4.4, 3.1], [6.4, 3.1],
        [1.4, 4.8], [3.4, 4.8], [5.4, 4.8], [7.4, 4.8],
        [2.4, 6.5], [4.4, 6.5], [6.4, 6.5],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.45" fill="#ffffff" />
      ))}
    </svg>
  );
}

function BrFlag() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" className="h-3 w-[18px] rounded-[2px] ring-1 ring-black/10">
      <rect width="24" height="16" fill="#009b3a" />
      <path d="M12 2.2 22 8l-10 5.8L2 8Z" fill="#fedf00" />
      <circle cx="12" cy="8" r="3" fill="#002776" />
      <path d="M9.2 7.2c1.7-.6 3.7-.4 5.6.6" stroke="#ffffff" strokeWidth="0.7" fill="none" />
    </svg>
  );
}

const OPTIONS: Array<{ value: Lang; code: string; name: string; Flag: ComponentType }> = [
  { value: "es", code: "ES", name: "Español (Santa Cruz)", Flag: SczFlag },
  { value: "en", code: "EN", name: "English", Flag: UsFlag },
  { value: "pt", code: "PT", name: "Português", Flag: BrFlag },
];

interface LanguageSwitcherProps {
  className?: string;
  /** Stretch the options to fill the row (mobile menu). */
  expand?: boolean;
  ariaLabel?: string;
}

export function LanguageSwitcher({ className, expand = false, ariaLabel }: LanguageSwitcherProps) {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-1",
        expand && "flex w-full",
        className,
      )}
    >
      {OPTIONS.map(({ value, code, name, Flag }) => {
        const active = lang === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLang(value)}
            aria-pressed={active}
            aria-label={name}
            title={name}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold leading-none transition-colors",
              expand && "flex-1",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-primary",
            )}
          >
            <Flag />
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
