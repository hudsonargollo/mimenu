import { useNavigate } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import { Instagram } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-lg">{t.footer.tagline}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Equipetrol • Santa Cruz de la Sierra, Bolivia
          </p>
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
            href="https://instagram.com/moestaberna.scz"
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
        © {new Date().getFullYear()} Moe's Taberna. {t.footer.rights}
      </div>
    </footer>
  );
}
