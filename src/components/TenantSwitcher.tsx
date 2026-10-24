import { useNavigate } from 'react-router-dom';
import { useMimenu } from '@/lib/mimenuContext';
import { useAuth } from '@/lib/authContext';
import { listTenantAccounts } from '@/lib/tenantAuth';
import { useLang } from '@/i18n/LanguageProvider';
import type { Lang } from '@/i18n/translations';
import { Store, ChevronDown } from 'lucide-react';

/**
 * Tenant switcher for the staff panels. Only tenants with a registered staff
 * login are listed; picking one navigates to the same panel with ?v=<slug>.
 */
export const TenantSwitcher = () => {
  const navigate = useNavigate();
  const { venue } = useMimenu();
  const { user } = useAuth();
  const { lang } = useLang();
  const tenants = listTenantAccounts(lang as Lang);
  const current = user?.tenantSlug || venue.slug;

  if (tenants.length === 0) return null;

  const go = (slug: string) => {
    const base = window.location.pathname.replace(/\/+$/, '');
    navigate(`${base}?v=${slug}`, { replace: true });
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
        <Store className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
        <span className="sr-only">Restaurante activo</span>
        <select
          value={current}
          onChange={(e) => go(e.target.value)}
          className="bg-transparent outline-none font-semibold max-w-[12rem]"
          aria-label="Restaurante activo"
        >
          {tenants.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.venueName}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />
      </label>
    </div>
  );
};

export default TenantSwitcher;
