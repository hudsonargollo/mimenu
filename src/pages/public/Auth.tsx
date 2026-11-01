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

const HEADLINES = [
  "Menú digital que se actualiza solo y enamora clientes.",
  "Aceptan pedidos por QR sin instalar nada.",
  "Rotá ofertas por horario y aumentá el ticket promedio.",
  "Medí platos estrella y ventas en tiempo real.",
  "Control de meseros integrado sin apps extra.",
  "Reduce errores, demoras y papeles en la operación.",
  "Escaneá tu carta impresa y generá el menú digital en minutos.",
  "Fidelizá con experiencias rápidas y bonitas.",
  "Llevá tu local al siguiente nivel sin fricción.",
  "De la carta física al pedido digital en pocos clics.",
];

const Auth = () => {
  const navigate = useNavigate();
  const { login, redirectToRolePage, user, isLoading } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    document.title = t.nav.admin + " | MiMenu";
  }, [t.nav.admin]);

  const [headlineIndex, setHeadlineIndex] = useState(() => Math.floor(Math.random() * HEADLINES.length));
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      redirectToRolePage(user.role);
    }
  }, [isLoading, user, redirectToRolePage]);

  // Animation sequence: loader first, then text appears
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 1400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % HEADLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mimenu_remember_me');
      const savedIdentifier = localStorage.getItem('mimenu_identifier');
      if (saved === 'true' && savedIdentifier) {
        setRememberMe(true);
        setIdentifier(savedIdentifier);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (rememberMe) {
        localStorage.setItem('mimenu_remember_me', 'true');
        localStorage.setItem('mimenu_identifier', identifier);
      } else {
        localStorage.removeItem('mimenu_remember_me');
        localStorage.removeItem('mimenu_identifier');
      }
    } catch {}
  }, [rememberMe, identifier]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const [{ resolveCredential }, { requestSession, AppSessionError }] = await Promise.all([
        import("@/lib/tenantAuth"),
        import("@/lib/appSession"),
      ]);

      const cred = resolveCredential(identifier, password);

      if (cred) {
        await login(cred.email, cred.name, cred.role, cred.password, cred.tenantSlug, cred.venueName);

        if (cred.role === "admin") {
          try {
            await requestSession(cred.identifier, cred.password);
          } catch (sessionError: any) {
            console.error("🔴 Admin session error:", sessionError);
            toast.warning(
              sessionError?.message ||
                "No se pudo habilitar la gestión de meseros en este inicio de sesión."
            );
          }
        }

        console.log("✅ Login successful", cred.email, cred.tenantSlug);
        toast.success("¡Inicio de sesión exitoso!");
        login(cred.email, cred.name, cred.role, cred.password, cred.tenantSlug, cred.venueName, rememberMe);
        redirectToRolePage(cred.role);
        return;
      }

      try {
        const session = await requestSession(identifier, password);
        await login(session.email, session.name, session.role, password, session.tenantSlug, session.venueName, rememberMe);
        toast.success("¡Inicio de sesión exitoso!");
        redirectToRolePage(session.role);
      } catch (sessionError: any) {
        const invalid =
          sessionError instanceof AppSessionError &&
          (sessionError.status === 401 || sessionError.status === 403);
        toast.error(
          invalid ? "Credenciales inválidas" : sessionError?.message || "No se pudo iniciar sesión"
        );
      }
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
          className="flex flex-col items-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 8 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {/* Logo container */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ width: 130, height: 130 }}
              animate={entered ? { width: 88, height: 88 } : { width: 130, height: 130 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
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
              className="flex items-center text-4xl sm:text-5xl font-extrabold tracking-tight select-none"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: entered ? 1 : 0, x: entered ? 0 : -8 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <span className="text-[hsl(var(--brand-violet))]">Mi</span>
              <span className="text-[hsl(var(--brand-orange))]">Menu</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="h-14 sm:h-16 overflow-hidden w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={headlineIndex}
                initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] sm:text-[16px] leading-snug text-slate-600 font-semibold text-center px-1"
              >
                {HEADLINES[headlineIndex]}
              </motion.p>
            </AnimatePresence>
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

            {/* Remember me */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 16 }}
              animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <span className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-5 w-9 rounded-full border border-white/40 bg-white/40 backdrop-blur-md transition-all peer-checked:bg-white/70 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-white/60" />
                  <span className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full border border-white/60 bg-white/80 shadow-sm transition-all peer-checked:translate-x-[18px]" />
                </span>
                <span className="font-semibold">Mantenerme conectado</span>
              </label>
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