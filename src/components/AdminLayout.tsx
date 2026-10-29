import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import TenantSwitcher from './TenantSwitcher';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div
      className="flex h-screen relative overflow-hidden"
      style={{ background: 'oklch(0.96 0.04 290)', fontFamily: '"Bricolage Grotesque", "Figtree", system-ui, sans-serif' }}
    >
      {/* wash gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%), radial-gradient(40% 40% at 20% 80%, rgba(168,139,255,0.35) 0%, transparent 70%), radial-gradient(40% 40% at 80% 70%, rgba(255,182,217,0.3) 0%, transparent 70%)'
      }} />
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="flex items-center justify-end gap-3 px-6 md:px-8 pt-5 max-w-7xl mx-auto w-full">
          <TenantSwitcher />
        </div>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
