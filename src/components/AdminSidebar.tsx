import { useState } from 'react';
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
  BarChart3,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Users,
  Store,
  Lock
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { hasEntitlement, requiredPlanFor, type Entitlement } from '@/lib/plans';
import { toast } from 'sonner';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
  badge?: string;
  /** Entitlement the destination requires; locked items still navigate to the upgrade screen. */
  feature?: Entitlement;
}

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { venue } = useMimenu();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems: SidebarItem[] = [
    { label: 'AI Copilot', icon: <Bot className="w-5 h-5" />, path: '/admin/ai', description: 'Chat & Inteligencia', badge: 'IA', feature: 'whatsapp_concierge' },
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin', description: 'Resumen & Kpis' },
    { label: 'Ingestor Carta IA', icon: <Camera className="w-5 h-5" />, path: '/admin/ingest-menu', description: 'OCR & Auto-Tagging', badge: 'Vision', feature: 'photographed_menu' },
    { label: 'Cocina & KDS', icon: <ChefHat className="w-5 h-5" />, path: '/cashier', description: 'Pedidos en vivo', feature: 'kds' },
    { label: 'Ofertas Inteligentes', icon: <Sparkles className="w-5 h-5" />, path: '/admin/offers', description: 'Cycling promos', feature: 'smart_offers' },
    { label: 'Hotness & Métricas', icon: <Flame className="w-5 h-5" />, path: '/admin/analytics', description: 'Velocidad & Ventas', feature: 'analytics' },
    { label: 'Mesas & QR', icon: <QrCode className="w-5 h-5" />, path: '/admin/tables', description: 'Table mapping' },
    { label: 'CRM & Clientes', icon: <Users className="w-5 h-5" />, path: '/admin/customers', description: 'Fidelización & VIP', feature: 'crm' },
    { label: 'Reseñas & Feedback', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/reviews', description: 'Moderación' },
    { label: 'White-Label & Marca', icon: <Palette className="w-5 h-5" />, path: '/admin/branding', description: 'Personalización', feature: 'custom_website' },
    { label: 'Configuraciones', icon: <Settings className="w-5 h-5" />, path: '/admin/settings', description: 'Sistema & Red' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white/60 backdrop-blur-md text-[#3a2f6b] p-2 rounded-xl shadow-lg border border-white/40"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        } md:w-64 md:relative md:translate-x-0 ${!isOpen && 'md:w-20'} flex flex-col`}
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRight: '1px solid rgba(255,255,255,0.5)',
          fontFamily: '"Bricolage Grotesque", "Figtree", system-ui, sans-serif',
        }}
      >
        {/* Logo Section */}
        <div className="p-5 border-b border-white/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/mimenu.svg" alt="MiMenu" className="h-9 w-9 shrink-0" />
            {isOpen && (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-[#2a1f55]">{venue?.name ?? 'MiMenu'}</span>
                  {venue?.plan !== 'custom' ? (
                    <Link
                      to="/admin/upgrade"
                      title="Upgrade plan"
                      className="text-[9px] font-black uppercase bg-white/60 text-[#5b4a9e] px-1 py-0.5 rounded hover:bg-white hover:text-[#2a1f55] transition-colors"
                    >
                      {venue?.plan_name ?? 'Basic'}
                    </Link>
                  ) : (
                    <span className="text-[9px] font-black uppercase bg-white/60 text-[#5b4a9e] px-1 py-0.5 rounded">
                      {venue?.plan_name ?? 'Basic'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Menu Preview Link */}
        <div className="px-3 pt-3">
          <Link
            to="/menu"
            target="_blank"
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all group border"
            style={{
              background: 'rgba(255,255,255,0.45)',
              borderColor: 'rgba(139,92,246,0.25)',
              color: '#5b4a9e',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isOpen && <span>Ver Menú Digital</span>}
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const locked = item.feature ? !hasEntitlement(venue?.slug, item.feature) : false;
            const requiredPlan = item.feature && locked ? requiredPlanFor(item.feature) : null;
            return (
            <button
              key={item.path}
              onClick={() =>
                navigate(locked && item.feature ? `/admin/upgrade?feature=${item.feature}` : item.path)
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'text-white font-bold shadow-md'
                  : 'text-[#3a2f6b] hover:bg-white/40 hover:text-[#2a1f55]'
              }`}
              style={
                isActive(item.path)
                  ? { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
                  : undefined
              }
              title={!isOpen ? item.label : locked ? `Requiere plan ${requiredPlan?.name}` : ''}
            >
              <div className="flex items-center gap-3">
                <span className={`flex-shrink-0 ${locked && !isActive(item.path) ? 'opacity-40' : ''}`}>{item.icon}</span>
                {isOpen && (
                  <div className="text-left">
                    <div className={`text-xs font-bold ${locked && !isActive(item.path) ? 'text-[#3a2f6b]/50' : ''}`}>{item.label}</div>
                    <div className={`text-[10px] ${isActive(item.path) ? 'text-white/80' : 'text-[#5b4a9e]/70 group-hover:text-[#5b4a9e]'}`}>
                      {locked ? `Plan ${requiredPlan?.name}` : item.description}
                    </div>
                  </div>
                )}
              </div>

              {isOpen && locked && (
                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#8b5cf6]" aria-label={`Requiere plan ${requiredPlan?.name}`} />
              )}
              {isOpen && !locked && item.badge && (
                <span className="text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded-full shadow-xs" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                  {item.badge}
                </span>
              )}
            </button>
            );
          })}
        </nav>

        {/* Upgrade CTA — every venue below Custom keeps a direct path up */}
        {venue?.plan !== 'custom' && (
          <div className="px-3 pb-2">
            <Link
              to="/admin/upgrade"
              title={isOpen ? undefined : 'Upgrade plan'}
              className={`flex items-center gap-2 rounded-xl text-white shadow-md transition-opacity hover:opacity-90 ${
                isOpen ? 'justify-between px-3 py-2.5' : 'mx-auto h-10 w-12 justify-center'
              }`}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                {isOpen && (
                  <span className="text-[11px] font-black uppercase tracking-wide">Upgrade plan</span>
                )}
              </span>
              {isOpen && (
                <span className="text-[10px] font-bold text-white/80">{venue?.plan_name}</span>
              )}
            </Link>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-white/40 text-[11px] text-[#5b4a9e] flex items-center justify-between">
          {isOpen && (
            <span className="text-[10px]">MIMENU KV • SCZ</span>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-[11px] font-bold flex items-center gap-1 text-[#5b4a9e] hover:text-[#2a1f55]"
          >
            <Store className="w-3.5 h-3.5" />
            {isOpen && <span>Landing Page</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;