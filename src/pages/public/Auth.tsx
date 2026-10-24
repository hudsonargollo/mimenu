import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { listTenantAccounts } from "@/lib/tenantAuth";
import { useLang } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/translations";

// Suppress schema-related toasts
const originalToastError = toast.error;
toast.error = (message: string, ...args: any[]) => {
  if (typeof message === 'string' && message.includes('schema')) {
    return;
  }
  return originalToastError(message, ...args);
};

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  name: z.string().trim().min(2, { message: "El nombre debe tener al menos 2 caracteres" }).max(100),
  role: z.enum(['admin', 'waiter', 'kitchen', 'cashier']).default('admin'),
});

const greetings = [
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido",
  "Bienvenido"
];

const roles = [
  { value: 'admin', label: 'Administrador', icon: User },
  { value: 'waiter', label: 'Mozo', icon: User },
  { value: 'kitchen', label: 'Cocina', icon: User },
  { value: 'cashier', label: 'Cajero', icon: User },
];

const Auth = () => {
  const navigate = useNavigate();
  const { login, redirectToRolePage } = useAuth();
  const { lang } = useLang();
  const tenants = listTenantAccounts(lang as Lang);

  useEffect(() => {
    document.title = "Login | MiMenu - Menú Digital & SaaS";
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'waiter' | 'kitchen' | 'cashier'>('admin');
  // Tenant login: picking a venue scopes the session to that restaurant.
  const [selectedTenant, setSelectedTenant] = useState<string>(tenants[0]?.slug ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({ email, name, role: selectedRole });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Tenant login: the selected venue decides which staff email is used,
      // so the session is bound to that restaurant.
      const tenant = tenants.find((t) => t.slug === selectedTenant);
      if (tenant) {
        await login(tenant.login.email, tenant.login.name, tenant.login.role);
      } else {
        await login(validation.data.email, validation.data.name, validation.data.role);
      }

      console.log('🔵 Login attempt:', { email: validation.data.email, role: validation.data.role });
      console.log('✅ Login successful');
      toast.success("¡Inicio de sesión exitoso!");

      // Redirect based on role
      redirectToRolePage(validation.data.role);
    } catch (error: any) {
      console.error('🔴 Auth exception:', error);
      toast.error("Error al procesar la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1A2B2A] to-[#0F1A19] p-4 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#BC6C25]/10 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#BC6C25]/5 to-transparent blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card with rounded top, sharp bottom */}
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Dark Hero Section */}
          <div className="bg-gradient-to-b from-[#1A2B2A] to-[#2A3B3A] text-center space-y-6 p-8 sm:p-10">
            <div className="flex justify-center">
              {/* MiMenu mark. The SVG is wide (1.58:1) so it gets explicit
                  height + auto width instead of a square box, which would
                  letterbox the glyph. */}
              <img
                src="/mimenu-square.svg"
                alt="MiMenu"
                className="h-16 w-auto drop-shadow-lg"
              />
            </div>
            <div className="space-y-3">
              <p className="text-[#D4A574] tracking-[0.2em] text-xs uppercase font-display font-bold">
                MiMenu - Sistema Digital
              </p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
                Bienvenido
              </h1>
              <p className="text-sm text-gray-300">Accede a tu panel de control</p>
            </div>
          </div>

          {/* White Form Section */}
          <div className="p-8 sm:p-10 bg-white">
            <form onSubmit={handleAuth} className="space-y-6">
              {tenants.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1A2B2A] block mb-2">
                    Restaurante
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.slug}
                        type="button"
                        onClick={() => setSelectedTenant(tenant.slug)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                          selectedTenant === tenant.slug
                            ? 'bg-[#BC6C25] text-white border-[#BC6C25]'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold">{tenant.venueName}</span>
                        <span className={`ml-auto text-[10px] uppercase ${selectedTenant === tenant.slug ? 'text-white/80' : 'text-gray-400'}`}>
                          {tenant.login.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!selectedTenant && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#1A2B2A]">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      className="h-11 text-sm px-4 pt-4 pb-4 pl-10 border border-gray-300 focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] rounded-xl transition-all bg-white text-[#1A2B2A] placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {!selectedTenant && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-[#1A2B2A]">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    className="h-11 text-sm px-4 pr-4 border border-gray-300 focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] rounded-xl transition-all bg-white text-[#1A2B2A] placeholder:text-gray-400"
                  />
                </div>
              )}

              {!selectedTenant && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1A2B2A] block mb-2">
                    Rol
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value as any)}
                          className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                            selectedRole === role.value
                              ? 'bg-[#BC6C25] text-white border-[#BC6C25]'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1" />
                          <span>{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-bold bg-[#BC6C25] hover:bg-[#A85A1F] text-white uppercase tracking-wider rounded-xl border-0 mt-8 transition-colors shadow-md" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  "Acceder al Panel"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Acceso restringido, monitoreado y auditable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;