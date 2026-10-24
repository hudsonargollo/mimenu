import React from 'react';
import { useMimenu } from '@/lib/mimenuContext';
import { useLang } from '@/i18n/LanguageProvider';
import { Languages } from 'lucide-react';

const LANGS = [
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
  { id: 'pt', label: 'PT' },
] as const;

/**
 * ES / EN / PT switcher for the customer menu. Drives both the UI copy and
 * the localized menu data (`name_i18n` / `description_i18n`).
 */
export const MenuLangSwitch: React.FC = () => {
  const { lang, setLang } = useLang();
  const { venue } = useMimenu();

  return (
    <div
      className="flex items-center gap-0.5 bg-muted/50 border border-border rounded-full p-0.5"
      role="group"
      aria-label="Idioma del menú"
    >
      <Languages className="w-3 h-3 text-muted-foreground mx-1.5" aria-hidden="true" />
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
            lang === l.id
              ? 'bg-amber-500 text-white shadow-xs'
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
