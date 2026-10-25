import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/menu", label: t.nav.menu },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1" aria-label="Primary">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <button
                key={l.to}
                onClick={() => navigate(l.to)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            );
          })}
        </nav>

        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity md:absolute md:left-1/2 md:transform md:-translate-x-1/2" aria-label="MiMenu — Inicio">
          <img src="/mimenu.svg" alt="MiMenu" className="h-8 w-8" />
        </button>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language"
            className="hidden items-center rounded-full border border-border bg-card p-0.5 text-xs sm:flex"
          >
            {(["es", "en", "pt"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium uppercase transition-colors",
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground/70 hover:bg-accent/50 hover:text-foreground transition-colors"
            aria-label="Admin"
          >
            <LogIn className="h-4 w-4" />
            {t.nav.admin}
          </button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 bg-background md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
              {links.map((l) => (
                <button
                  key={l.to}
                  onClick={() => {
                    navigate(l.to);
                    setOpen(false);
                  }}
                  className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent text-left"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate("/auth");
                  setOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent text-left flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {t.nav.admin}
              </button>
              <div className="mt-2 flex items-center gap-2 px-3">
                {(["es", "en", "pt"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium uppercase",
                      lang === l
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
