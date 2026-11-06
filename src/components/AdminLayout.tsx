import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import TenantSwitcher from './TenantSwitcher';

interface AdminLayoutProps {
  children: ReactNode;
}

const SECTION_LABELS: Record<string, string> = {
  '/admin': 'Panel',
  '/admin/ai': 'AI Copilot',
  '/admin/concierge': 'Conserje · QA',
  '/admin/concierge-settings': 'Conserje · Ajustes',
  '/admin/ingest-menu': 'Ingestor de carta',
  '/admin/offers': 'Ofertas',
  '/admin/analytics': 'Hotness',
  '/admin/tables': 'Mesas y QR',
  '/admin/customers': 'Clientes',
  '/admin/reviews': 'Reseñas',
  '/admin/branding': 'Marca',
  '/admin/settings': 'Configuraciones',
  '/admin/upgrade': 'Plan',
  '/admin/products': 'Carta',
  '/cashier': 'Cocina y KDS',
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { pathname } = useLocation();
  const section = SECTION_LABELS[pathname] ?? 'Panel';

  useEffect(() => {
    document.documentElement.classList.add('admin-noir');
    return () => document.documentElement.classList.remove('admin-noir');
  }, []);

  return (
    <div className="admin-noir flex h-screen overflow-hidden bg-background text-foreground">
      <AdminSidebar />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="noir-paper pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

        <header className="relative z-20 shrink-0 border-b border-border/80 bg-background/85 backdrop-blur-[2px]">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 py-3 pl-20 pr-5 md:pl-20 md:pr-10 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:inline">
                MiMenu
              </span>
              <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden="true" />
              <span className="truncate font-display text-sm text-foreground/90">{section}</span>
            </div>
            <TenantSwitcher />
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-8 md:px-10 md:py-10">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
