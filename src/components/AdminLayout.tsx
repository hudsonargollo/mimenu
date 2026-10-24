import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import TenantSwitcher from './TenantSwitcher';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
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
