import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { useLang } from "@/i18n/LanguageProvider";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  name: z.string().trim().min(2, { message: "El nombre debe tener al menos 2 caracteres" }).max(100),
  role: z.enum(["admin", "waiter", "kitchen", "cashier"]).default("admin"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { login, redirectToRolePage } = useAuth();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    document.title = t.nav.admin + " | MiMenu";
  }, [t.nav.admin]);

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { resolveCredential } = await import("@/lib/tenantAuth");
      const cred = resolveCredential(identifier, password);
      if (!cred) {
        toast.error("Credenciales inválidas");
        return;
      }

      await login(cred.email, cred.name, cred.role, cred.password, cred.tenantSlug, cred.venueName);

      console.log("✅ Login successful", cred.email, cred.tenantSlug);
      toast.success("¡Inicio de sesión exitoso!");

      redirectToRolePage(cred.role);
    } catch (error: any) {
      console.error("🔴 Auth exception:", error);
      toast.error("Error al procesar la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[640px] rounded-full bg-accent/5 blur-[160px]" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Brand */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden border border-border">
              <img src="/mimenu.svg" alt="MiMenu" className="h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground">Mi<span className="text-accent">Menu</span></span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">Área de acceso</span>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
            <div className="mb-6 space-y-1">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Acceso restringido
              </div>
              <p className="text-sm text-muted-foreground">Ingresa con tu usuario y contraseña.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold text-foreground">
                  Usuario / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="su email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    maxLength={255}
                    className="h-11 text-sm pl-10 border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary/80 focus:ring-1 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-sm pl-10 pr-10 border-border bg-background/60 text-foreground placeholder:text-muted-foreground focus:border-primary/80 focus:ring-1 focus:ring-primary/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground uppercase tracking-wider rounded-xl border-0 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  "Acceder al Panel"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Acceso restringido, monitoreado y auditable.
              </p>
            </div>
        </div>
      </div>
    </div>
    );
};

export default Auth;