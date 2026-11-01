import { useNavigate } from 'react-router-dom';
import { useMimenu } from '@/lib/mimenuContext';
import { listTenantAccounts } from '@/lib/tenantAuth';
import { useLang } from '@/i18n/LanguageProvider';
import type { Lang } from '@/i18n/translations';
import { Store, ChevronDown } from 'lucide-react';

/**
 * Tenant switcher for the staff panels. Tenants with a registered staff login
 * are listed; picking one navigates to the same panel with ?v=<slug>. The
 * venue resolved from the URL is authoritative (it is what the panels show),
 * and stays in the list even when it has no staff account of its own.
 */
export const TenantSwitcher = () => {
  const navigate = useNavigate();
  const { venue } = useMimenu();
  const { lang } = useLang();
  const tenants = listTenantAccounts(lang as Lang);
  const current = venue.slug;

  if (tenants.length === 0) return null;

  const options = tenants.map(({ slug, venueName }) => ({ slug, venueName }));
  if (current && !options.some((o) => o.slug === current)) {
    options.push({ slug: current, venueName: venue.name });
  }

  const go = (slug: string) => {
    const base = window.location.pathname.replace(/\/+$/, '');
    navigate(`${base}?v=${slug}`, { replace: true });
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-[4px] border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-foreground/30">
        <Store className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="sr-only">Restaurante activo</span>
        <select
          value={current}
          onChange={(e) => go(e.target.value)}
          className="max-w-[12rem] bg-transparent outline-none font-semibold"
          aria-label="Restaurante activo"
        >
          {options.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.venueName}
            </option>
          ))}
        </select>
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      </label>
    </div>
  );
};

export default TenantSwitcher;
