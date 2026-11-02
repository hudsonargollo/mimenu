import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Bot,
  LayoutDashboard,
  ChefHat,
  Camera,
  Sparkles,
  Flame,
  QrCode,
  MessageSquare,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  Store,
  Lock,
  X,
  Menu,
  ArrowUpRight,
  ClipboardCheck,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { hasEntitlement, requiredPlanFor, type Entitlement } from '@/lib/plans';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  feature?: Entitlement;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const GROUPS: SidebarGroup[] = [
  {
    title: 'Operación',
    items: [
      { label: 'Panel', icon: <LayoutDashboard />, path: '/admin' },
      { label: 'Cocina y KDS', icon: <ChefHat />, path: '/cashier', feature: 'kds' },
      { label: 'Mesas y QR', icon: <QrCode />, path: '/admin/tables' },
    ],
  },
  {
    title: 'Crecimiento',
    items: [
      { label: 'Ofertas', icon: <Sparkles />, path: '/admin/offers', feature: 'smart_offers' },
      { label: 'Hotness', icon: <Flame />, path: '/admin/analytics', feature: 'analytics' },
      { label: 'Clientes', icon: <Users />, path: '/admin/customers', feature: 'crm' },
      { label: 'Reseñas', icon: <MessageSquare />, path: '/admin/reviews' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'AI Copilot', icon: <Bot />, path: '/admin/ai', badge: 'IA', feature: 'whatsapp_concierge' },
      { label: 'Conserje', icon: <ClipboardCheck />, path: '/admin/concierge', badge: 'QA', feature: 'whatsapp_concierge' },
      { label: 'Ingestor de carta', icon: <Camera />, path: '/admin/ingest-menu', feature: 'photographed_menu' },
      { label: 'Marca', icon: <Palette />, path: '/admin/branding', feature: 'custom_website' },
      { label: 'Configuraciones', icon: <Settings />, path: '/admin/settings' },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { venue } = useMimenu();
  const [isOpen, setIsOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  );

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir navegación"
        className="fixed left-4 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-[4px] border border-border bg-card text-foreground shadow-sm lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="sb-backdrop fixed inset-0 z-40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sb-surface fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'w-[268px] translate-x-0' : 'w-[268px] -translate-x-full lg:w-[76px]'
        }`}
        aria-label="Navegación del panel"
      >
        {/* Wordmark */}
        <div className={`sb-rule flex items-center gap-3 border-b px-4 py-5 ${isOpen ? '' : 'lg:justify-center lg:px-0'}`}>
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-3"
            aria-label="MiMenu — ir al panel"
          >
            <img src="/mimenu.svg" alt="" className="h-7 w-7 shrink-0" />
            {isOpen && (
              <span className="min-w-0">
                <span className="block font-display text-lg leading-none tracking-tight">
                  MiMenu
                </span>
                <span className="sb-40 mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.18em]">
                  {venue?.name ?? 'Panel'}
                </span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar navegación"
            className="sb-50 sb-hover sb-hover-text ml-auto flex h-8 w-8 items-center justify-center rounded-[4px] border-0 bg-transparent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live menu */}
        <div className={isOpen ? 'px-4 pt-4' : 'px-3 pt-4'}>
          <Link
            to="/menu"
            target="_blank"
            className={`sb-rule sb-70 sb-hover-text sb-border-hover group flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[11px] font-semibold transition-colors ${
              isOpen ? 'justify-between' : 'justify-center'
            }`}
            title="Abrir el menú digital"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {isOpen && <span className="uppercase tracking-[0.14em]">Menú digital</span>}
            </span>
            {isOpen && <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />}
          </Link>
        </div>

        {/* Index */}
        <nav className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {GROUPS.map((group) => (
            <div key={group.title}>
              {isOpen && (
                <p className="sb-40 px-3 pb-1.5 pt-5 text-[9px] font-bold uppercase tracking-[0.26em]">
                  {group.title}
                </p>
              )}
              <ul className={isOpen ? 'space-y-px' : 'mt-3 space-y-1'}>
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const locked = item.feature ? !hasEntitlement(venue?.slug, item.feature) : false;
                  const requiredPlan = item.feature && locked ? requiredPlanFor(item.feature) : null;

                  return (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(locked && item.feature ? `/admin/upgrade?feature=${item.feature}` : item.path)
                        }
                        aria-current={active ? 'page' : undefined}
                        title={!isOpen || locked ? item.label : undefined}
                        className={`group relative flex w-full items-center gap-3 rounded-[4px] border-0 py-2.5 text-left transition-colors ${
                          isOpen ? 'pl-3 pr-2' : 'justify-center px-0'
                        } ${
                          active
                            ? 'sb-active'
                            : 'bg-transparent sb-70 sb-hover sb-hover-text'
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-primary" aria-hidden="true" />
                        )}
                        <span
                          className={`shrink-0 [&>svg]:h-[15px] [&>svg]:w-[15px] ${
                            active ? 'sb-active-fg' : locked ? 'sb-35' : ''
                          }`}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>

                        {isOpen && (
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`truncate text-[12.5px] font-medium leading-tight ${
                                  active ? 'sb-active-fg' : locked ? 'sb-40' : ''
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.badge && !locked && (
                                <span
                                  className={`rounded-[2px] px-1 py-px text-[8px] font-bold uppercase tracking-[0.12em] ${
                                    active ? 'sb-badge-active' : 'sb-badge'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            {locked && (
                              <span
                                className={`mt-0.5 block truncate text-[9.5px] uppercase tracking-[0.1em] ${
                                  active ? 'sb-active-45' : 'sb-40'
                                }`}
                              >
                                Plan {requiredPlan?.name}
                              </span>
                            )}
                          </span>
                        )}

                        {isOpen && locked && (
                          <Lock className="sb-30 h-3 w-3 shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-rule border-t px-3 py-3">
          {venue?.plan !== 'custom' && (
            <Link
              to="/admin/upgrade"
              className={`mb-2 flex items-center gap-2 rounded-[4px] border border-primary/40 bg-primary/10 px-3 py-2 transition-colors hover:border-primary/70 hover:bg-primary/15 ${
                isOpen ? 'justify-between' : 'mx-auto justify-center px-0'
              }`}
              title={`Upgrade plan — ${venue?.plan_name ?? 'Basic'}`}
            >
              <span className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 text-[hsl(var(--primary-soft))]" aria-hidden="true" />
                {isOpen && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Upgrade plan</span>
                )}
              </span>
              {isOpen && (
                <span className="sb-45 text-[9px] font-semibold uppercase tracking-[0.12em]">
                  {venue?.plan_name ?? 'Basic'}
                </span>
              )}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
