import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveTenantForLogin, type StaffRole, type TenantAccount } from '@/lib/tenantAuth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'waiter' | 'kitchen' | 'cashier';
  createdAt: string;
  /** Tenant this user belongs to (null for the platform/demo account). */
  tenantSlug?: string | null;
  tenantName?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name: string, role?: User['role']) => void;
  /** Tenant resolved from the login email, if the email belongs to one. */
  tenant: TenantAccount | null;
  logout: () => void;
  getUserByEmail: (email: string) => User | null;
  redirectToRolePage: (role: User['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mimenu_auth_user';

// Default users (in production, this would be in KV or a database)
const DEFAULT_USERS: Record<string, User> = {
  'admin@mimenu.com': {
    id: 'user-admin-1',
    email: 'admin@mimenu.com',
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  'kitchen@mimenu.com': {
    id: 'user-kitchen-1',
    email: 'kitchen@mimenu.com',
    name: 'Cozinha',
    role: 'kitchen',
    createdAt: new Date().toISOString()
  },
  'cashier@mimenu.com': {
    id: 'user-cashier-1',
    email: 'cashier@mimenu.com',
    name: 'Balcão',
    role: 'cashier',
    createdAt: new Date().toISOString()
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate stored user
        if (parsedUser.id && parsedUser.email) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading auth from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, name: string, role: User['role'] = 'admin') => {
    // A login that belongs to a registered tenant is bound to that venue;
    // anything else is the platform/demo account.
    const tenant = resolveTenantForLogin(email);
    const effectiveRole: User['role'] = tenant ? tenant.login.role : role;
    const loggedUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: tenant ? tenant.login.name : name,
      role: effectiveRole,
      createdAt: new Date().toISOString(),
      tenantSlug: tenant ? tenant.slug : null,
      tenantName: tenant ? tenant.venueName : null,
    };
    
    setUser(loggedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const getUserByEmail = useCallback((email: string): User | null => {
    return DEFAULT_USERS[email.toLowerCase()] || null;
  }, []);

  const redirectToRolePage = useCallback((role: User['role']) => {
    // Tenant staff land on their venue's panel; the ?v= slug makes the
    // MimenuProvider load that restaurant's menu and tables.
    const slug = user?.tenantSlug;
    const base = role === 'waiter' ? '/waiter-dashboard'
      : role === 'admin' ? '/admin'
      : role === 'kitchen' ? '/kitchen'
      : role === 'cashier' ? '/cashier'
      : '/admin';
    const target = slug ? `${base}?v=${slug}` : base;
    navigate(target, { replace: true });
  }, [navigate, user?.tenantSlug]);

  const tenant = user?.tenantSlug
    ? {
        slug: user.tenantSlug,
        venueName: user.tenantName || user.tenantSlug,
        login: {
          email: user.email,
          name: user.name,
          role: user.role as StaffRole,
        },
      }
    : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getUserByEmail,
    redirectToRolePage,
    tenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};