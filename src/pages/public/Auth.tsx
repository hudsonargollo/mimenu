import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useLang } from "@/i18n/LanguageProvider";

const Auth = () => {
  const navigate = useNavigate();
  const { login, redirectToRolePage } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    document.title = t.nav.admin + " | MiMenu";
  }, [t.nav.admin]);

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  // Animation sequence: loader first, then text appears
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 1400);
    return () => clearTimeout(id);
  }, []);

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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--auth-bg)] relative overflow-hidden">
      {/* Mesh gradient background */}
      <div
        className="pointer-events-none absolute inset-0 gradient-mesh"
      />

      <main className="w-full max-w-[400px] flex flex-col items-center mx-auto py-6 relative z-10">
        {/* Brand mark — loader morphs into static logo */}
        <motion.header
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo container - icon centered, text animates in */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ width: 96, height: 96 }}
            animate={entered ? { width: 56, height: 56 } : { width: 96, height: 96 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            {/* Brand mark with gentle idle float */}
            <motion.div
              className="relative flex items-center justify-center"
              animate={entered ? { y: [0, -4, 0] } : { y: 0 }}
              transition={
                entered
                  ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }
                  : { duration: 0 }
              }
            >
              <motion.img
                src="/mimenu.svg"
                alt="MiMenu"
                className="w-full h-full"
                initial={{ scale: 0.6, opacity: 0.4, rotate: -8 }}
                animate={
                  entered
                    ? { scale: 1, opacity: 1, rotate: 0 }
                    : { scale: 0.85, opacity: 0.7, rotate: 0 }
                }
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center text-3xl font-extrabold tracking-tight select-none"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -8 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <span className="text-[hsl(var(--brand-violet))]">Mi</span>
            <span className="text-[hsl(var(--brand-orange))]">Menu</span>
          </motion.div>
        </motion.header>

        {/* Card scene entrance */}
        <motion.section
          className="w-full bg-[hsl(var(--auth-card-bg)/95)] backdrop-blur-sm rounded-[32px] p-6 sm:p-8 shadow-[0_20px_45px_-10px_rgba(79,70,229,0.08),0_10px_20px_-5px_rgba(0,0,0,0.04)] border border-[hsl(var(--auth-card-border)/80)] flex flex-col"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={
            entered
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 40, scale: 0.96 }
          }
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          {/* Security notice header */}
          <motion.div
            className="mb-7"
            initial={{ opacity: 0, y: 12 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, delay: 0.85 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--auth-security-bg))] border border-[hsl(var(--auth-security-border))] text-[hsl(var(--auth-security-accent))] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-wider uppercase">Acceso Restringido</span>
            </div>
            <h1 className="text-slate-500 font-medium text-[15px] leading-relaxed">
              Ingresa con tu usuario y contraseña.
            </h1>
          </motion.div>

          <form onSubmit={handleAuth} className="space-y-5">
            {/* Field 1: Usuario / Email */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, y: 16 }}
              animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Label htmlFor="identifier" className="block text-sm font-bold text-slate-800 tracking-tight">
                Usuario / Email
              </Label>
              <div className="relative rounded-2xl transition duration-150">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="su email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  maxLength={255}
                  autoComplete="username"
                  className="w-full bg-[hsl(var(--auth-input-bg))] hover:bg-[hsl(var(--auth-input-border))] focus:bg-white text-slate-800 text-[15px] pl-11 pr-4 py-3.5 rounded-2xl border border-[hsl(var(--auth-input-border)/90)] focus:border-[hsl(var(--brand-violet))] focus:ring-4 focus:ring-purple-100 transition-all outline-none h-auto"
                />
              </div>
            </motion.div>

            {/* Field 2: Contraseña */}
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, y: 16 }}
              animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 1.12 }}
            >
              <Label htmlFor="password" className="block text-sm font-bold text-slate-800 tracking-tight">
                Contraseña
              </Label>
              <div className="relative rounded-2xl transition duration-150">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[hsl(var(--auth-input-bg))] hover:bg-[hsl(var(--auth-input-border))] focus:bg-white text-slate-800 text-[15px] pl-11 pr-11 py-3.5 rounded-2xl border border-[hsl(var(--auth-input-border)/90)] focus:border-[hsl(var(--brand-violet))] focus:ring-4 focus:ring-purple-100 transition-all outline-none font-mono h-auto"
                />
                <button
                  type="button"
                  aria-label="Alternar visibilidad de contraseña"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button CTA */}
            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 16 }}
              animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 1.24 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(var(--brand-violet))] hover:bg-[hsl(var(--brand-violet)_/90)] text-white font-bold tracking-wider py-4 px-6 rounded-2xl shadow-sm hover:shadow-[0_8px_20px_-4px_rgba(15,23,42,0.25)] transition-all duration-200 text-[14px] uppercase active:scale-[0.98] select-none flex items-center justify-center gap-2 h-auto"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    <span>Autenticando...</span>
                  </span>
                ) : (
                  "Acceder al Panel"
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.footer
            className="mt-7 pt-5 border-t border-[hsl(var(--auth-card-border)/80)] flex flex-col items-center text-center"
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.36 }}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-normal leading-normal">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Acceso restringido, monitoreado y auditable.</span>
            </div>
          </motion.footer>
        </motion.section>

        {/* Safe area padding for mobile home indicator */}
        <div aria-hidden="true" className="h-6 w-full" />
      </main>
    </div>
  );
};

export default Auth;