import { useNavigate } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import { Instagram } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="text-amber-400"
            >
              <rect width="32" height="32" rx="8" fill="#0B0A09" />
              <path
                d="M9 8h14v5a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8z"
                fill="#3F127A"
              />
              <path
                d="M7 8a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8z"
                fill="#0B0A09"
              />
              <path
                d="M16 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                fill="#3F127A"
              />
              <path
                d="M8 18h2M22 18h2"
                stroke="#3F127A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16 22h4"
                stroke="#3F127A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 26h12"
                stroke="#3F127A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg text-white font-black tracking-tight">MiMenu</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Gastronomic OS</p>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">{t.nav.menu}</p>
          <ul className="space-y-1 text-muted-foreground">
            <li><button onClick={() => navigate("/menu")} className="hover:text-foreground">{t.nav.menu}</button></li>
            <li><button onClick={() => navigate("/")} className="hover:text-foreground">{t.nav.home}</button></li>
            <li><button onClick={() => navigate("/auth")} className="hover:text-foreground">{t.nav.admin}</button></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">{t.contact.hours}</p>
          <p className="text-muted-foreground">18:00 – 03:00</p>
        </div>
        <div className="text-sm">
          <a
            href="https://instagram.com/mimenu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Instagram className="h-4 w-4" />
            {t.footer.followUs}
          </a>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MiMenu. {t.footer.rights}
      </div>
    </footer>
  );
}
