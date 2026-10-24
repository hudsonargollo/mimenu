import { createContext, useContext } from 'react';
import type { Lang } from '@/i18n/translations';

/** Localized text as stored on provisioned venue data. */
export type LocalText = Record<Lang, string>;

export interface VenueResolution {
  /** The slug that was requested in the URL, or null when the app defaulted. */
  requestedSlug: string | null;
  /** True when a `?v=`/`?venue=` slug was present but not found in the registry. */
  notFound: boolean;
}

interface ActiveVenueContextValue {
  slug: string;
  resolution: VenueResolution;
}

const ActiveVenueContext = createContext<ActiveVenueContextValue | undefined>(undefined);

export const ActiveVenueProvider = ActiveVenueContext.Provider;

/**
 * The venue the current session is bound to, as requested in the URL.
 * Defaults to `jaleo`, the first MiMenu customer tenant.
 */
export function useActiveVenue(): ActiveVenueContextValue {
  const ctx = useContext(ActiveVenueContext);
  if (!ctx) throw new Error('useActiveVenue must be used within ActiveVenueProvider');
  return ctx;
}

/** Localized text lookup that always falls back to a readable value. */
export function pickLocalText(text: LocalText | null | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] || text.es || '';
}
