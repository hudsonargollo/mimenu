import React from 'react';
import { useMimenu } from '@/lib/mimenuContext';
import { useLang } from '@/i18n/LanguageProvider';
import { Languages } from 'lucide-react';

const LANGS = [
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
  { id: 'pt', label: 'PT' },
] as const;

interface MenuLangSwitchProps {
  /** `dark` renders on the slate info bar; `light` on the menu surface. */
  tone?: 'light' | 'dark';
}

/**
 * ES / EN / PT switcher for the customer menu. Drives both the UI copy and
 * the localized menu data (`name_i18n` / `description_i18n`).
 */
export const MenuLangSwitch: React.FC<MenuLangSwitchProps> = ({ tone = 'light' }) => {
  const { lang, setLang } = useLang();
  const { venue } = useMimenu();
  const dark = tone === 'dark';

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border p-0.5 ${
        dark ? 'border-white/15 bg-white/10' : 'border-border bg-muted/50'
      }`}
      role="group"
      aria-label="Idioma del menú"
    >
      <Languages
        className={`mx-1.5 h-3 w-3 ${dark ? 'text-slate-400' : 'text-muted-foreground'}`}
        aria-hidden="true"
      />
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase transition-all ${
            lang === l.id
              ? 'bg-amber-500 text-white shadow-xs'
              : dark
                ? 'text-slate-300 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l.label}
        </button>
      ))}
      <span className="sr-only">{venue.name}</span>
    </div>
  );
};

export default MenuLangSwitch;
