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
    <div className="min-h-screen flex items-center justify-center bg-[#08090C] text-slate-100 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[640px] rounded-full bg-orange-600/5 blur-[160px]" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Brand + language */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden">
              <img src="/mimenu.svg" alt="MiMenu" className="h-7 w-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white">Mi<span className="text-amber-400">Menu</span></span>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5">Área de acceso</span>
            </div>
          </div>

          <div
            role="group"
            aria-label="Language"
            className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs"
          >
            {(["es", "en", "pt"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 font-medium uppercase transition-colors ${
                  lang === l ? "bg-amber-500 text-black" : "text-slate-300 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-1 shadow-2xl shadow-black/60 backdrop-blur-md">
          <div className="rounded-[22px] bg-[#0D0E15] p-6 sm:p-8">
            <div className="mb-6 space-y-1">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Acceso restringido
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">{t.nav.admin}</h1>
              <p className="text-sm text-slate-400">Ingresa con tu usuario y contraseña.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold text-slate-200">
                  Usuario / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="admin@mimenu.com o jaleo"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    maxLength={255}
                    className="h-11 text-sm pl-10 border-white/10 bg-white/[0.04] text-slate-100 placeholder:text-slate-500 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-200">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-sm pl-10 pr-10 border-white/10 bg-white/[0.04] text-slate-100 placeholder:text-slate-500 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black uppercase tracking-wider rounded-xl border-0 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-black" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  "Acceder al Panel"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
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