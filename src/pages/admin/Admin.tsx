import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDashboard from "./AdminDashboard";

const Admin = () => {
  useEffect(() => {
    document.title = "Panel de Administración | MiMenu - Menú Digital & SaaS";
  }, []);

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
};

export default Admin;
