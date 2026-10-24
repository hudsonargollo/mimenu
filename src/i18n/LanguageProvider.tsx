import * as React from "react";
import { translations, type Lang, type Translations } from "./translations";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = React.createContext<Ctx | null>(null);

const STORAGE_KEY = "mimenu-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("es");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "es" || saved === "en" || saved === "pt") {
        setLangState(saved);
        return;
      }
      // Legacy key from the Brazilian-market era (pt/en only)
      const legacy = localStorage.getItem("pontal-lang") as Lang | null;
      if (legacy === "en" || legacy === "pt") {
        setLangState(legacy);
        return;
      }
      // Spanish (Bolivian market) is the default language
      setLangState("es");
    } catch {
      // ignore
    }
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
