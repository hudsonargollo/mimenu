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

  useEffect(() => {
    document.title = "Login | MiMenu - Menú Digital & SaaS";
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'waiter' | 'kitchen' | 'cashier'>('admin');
  // Tenant login: picking a venue scopes the session to that restaurant.
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = authSchema.safeParse({ email: identifier || 'x@x.com', name: 'user', role: selectedRole });
    // validation is best-effort; credential check is authoritative

    setLoading(true);

    try {
      // Resolve credentials (supports email OR restaurant slug/username + password).
      const { resolveCredential } = await import('@/lib/tenantAuth');
      const cred = resolveCredential(identifier, password);
      if (!cred) {
        toast.error("Credenciales inválidas");
        return;
      }

      await login(cred.email, cred.name, cred.role, cred.password, cred.tenantSlug, cred.venueName);

      console.log('✅ Login successful', cred.email, cred.tenantSlug);
      toast.success("¡Inicio de sesión exitoso!");

      // Redirect based on role
      redirectToRolePage(cred.role);
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
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold text-[#1A2B2A]">
                  Usuario / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="admin@mimenu.com o jaleo"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    maxLength={255}
                    className="h-11 text-sm px-4 pt-4 pb-4 pl-10 border border-gray-300 focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] rounded-xl transition-all bg-white text-[#1A2B2A] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-[#1A2B2A]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-sm px-4 pr-10 border border-gray-300 focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25] rounded-xl transition-all bg-white text-[#1A2B2A] placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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