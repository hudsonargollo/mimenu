import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "kitchen" | "cashier" | "waiter";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);

  // Optional: Allow bypass with URL parameter for development
  const urlParams = new URLSearchParams(window.location.search);
  const bypassAuth = urlParams.get('bypass') === 'dev123';
  
  if (bypassAuth) {
    console.log('⚠️ Authentication bypassed for development');
    return <>{children}</>;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && requiredRole) {
        checkRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session && requiredRole) {
          checkRole(session.user.id);
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [requiredRole]);

  const checkRole = async (userId: string) => {
    try {
      // Get user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("❌ Error getting user:", userError);
        setHasRole(false);
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('❌ No user found');
        setHasRole(false);
        setLoading(false);
        return;
      }

      console.log('👤 User email:', user.email);
      console.log('👤 User ID:', user.id);
      
      // Get role from auth metadata
      const userRole = user.user_metadata?.role || user.app_metadata?.role;
      console.log('🔑 User role from auth:', userRole, 'Required role:', requiredRole);
      
      if (userRole === 'admin') {
        console.log('✅ Admin user detected - granting access');
        setHasRole(true);
      } else {
        const hasAccess = userRole === requiredRole;
        console.log('Role check result:', hasAccess);
        setHasRole(hasAccess);
      }
    } catch (error) {
      console.error("Error checking role:", error);
      setHasRole(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && !hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            No tenés permiso para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
