import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  UtensilsCrossed,
  QrCode,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Flame,
  Wine,
  Rocket,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import type { MenuCategoryDetail } from '@/types/mimenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MenuIntakePanel } from '@/components/MenuIntakePanel';
import PlanPicker from '@/components/PlanPicker';
import OnboardingAssetsStep, {
  EMPTY_ASSETS,
  type OnboardingAssetsForm,
} from '@/components/OnboardingAssetsStep';
import { MENU_PRESETS } from '@/lib/onboardingPresets';
import { PLANS, getPlan, planHas, type BillingCycle, type PlanId } from '@/lib/plans';
import { parseMenuTranscript, type IngestionResult } from '@/lib/menuVisionIngester';
import type { MenuSource } from '@/lib/menuIntake';

const TOTAL_STEPS = 6;

const currencyFor = (code: string) =>
  code === 'USD'
    ? { currency: 'USD', currency_code: 'USD' }
    : code === 'BRL'
      ? { currency: 'R$', currency_code: 'BRL' }
      : { currency: 'Bs.', currency_code: 'BOB' };

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { batchSetupVenue } = useMimenu();

  // Step 1 — plan. `?plan=` deep-links from the pricing table and starts the
  // wizard one step further in, since the plan is already chosen.
  const initialPlan = (() => {
    const fromUrl = searchParams.get('plan');
    return PLANS.some((p) => p.id === fromUrl) ? (fromUrl as PlanId) : 'basic';
  })();
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [step, setStep] = useState<number>(() => (searchParams.get('plan') ? 2 : 1));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const plan = getPlan(planId);

  // Step 2 — identity + brand assets
  const [venueName, setVenueName] = useState('');
  const [venueTagline, setVenueTagline] = useState('');
  const [venueCity, setVenueCity] = useState('Santa Cruz de la Sierra');
  const [venueCurrency, setVenueCurrency] = useState('Bs.');
  const [venuePrimaryColor, setVenuePrimaryColor] = useState('#D97706');
  const [venueTheme, setVenueTheme] = useState<'dark' | 'light'>('dark');
  const [assets, setAssets] = useState<OnboardingAssetsForm>(EMPTY_ASSETS);

  // Step 3 — menu intake
  const [customCategories, setCustomCategories] = useState<MenuCategoryDetail[]>(
    MENU_PRESETS.burger_bar.categories,
  );
  const [rawMenuText, setRawMenuText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [intakeSources, setIntakeSources] = useState<MenuSource[]>([]);
  const [drinksOnly, setDrinksOnly] = useState(false);

  // Step 4 — tables + Google reviews
  const [tableCount, setTableCount] = useState<number>(10);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://maps.google.com');

  // Step 5 — WhatsApp copilot
  const [copilotPhone, setCopilotPhone] = useState('+591 78012345');
  const [copilotTestMsg, setCopilotTestMsg] = useState('Sube la cerveza a 25 Bs');
  const [copilotTestResponse, setCopilotTestResponse] = useState<string | null>(null);

  const totalItems = customCategories.flatMap((c) => c.items).length;

  const handleParseMenuText = () => {
    if (!rawMenuText.trim()) {
      toast.error('Pegá el texto de tu menú o subí una foto/PDF.');
      return;
    }
    setIsParsing(true);
    setTimeout(() => {
      const parsed = parseMenuTranscript(rawMenuText, venueCurrency || 'Bs.');
      if (parsed.categories.length === 0 || parsed.totalItems === 0) {
        toast.error('No se reconocieron platos. Revisá el formato del texto.');
        setIsParsing(false);
        return;
      }
      setCustomCategories(parsed.categories);
      setIsParsing(false);
      toast.success(`${parsed.totalItems} platos estructurados en ${parsed.categories.length} categorías.`);
    }, 500);
  };

  /** Intake result → categories, optionally tagged as the drinks/wine list. */
  const handleIntakeParsed = (categories: IngestionResult['categories'], sources: MenuSource[]) => {
    setIntakeSources(sources);
    if (drinksOnly) {
      const drinks = categories.map((c, i) => ({
        ...c,
        key: `bebidas-${i}-${c.key}`,
        name:
          c.name.toLowerCase().includes('bebida') || c.name.toLowerCase().includes('vino')
            ? c.name
            : `Bebidas & Vinos${i > 0 ? ` ${i + 1}` : ''}`,
      }));
      setCustomCategories((prev) => [...prev, ...drinks]);
      toast.success('Carta de bebidas y vinos agregada como categoría separada.');
      return;
    }
    setCustomCategories((prev) => [...prev, ...categories]);
  };

  const handleTestCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotTestMsg.trim()) return;
    setCopilotTestResponse('Analizando instrucción…');
    setTimeout(() => {
      const hasAi = planHas(plan, 'aiConcierge');
      setCopilotTestResponse(
        hasAi
          ? `Copiloto IA: "Entendido. Actualicé '${copilotTestMsg}' en tu menú digital y ya es visible para los clientes."`
          : `Con el plan ${plan?.name ?? 'Básico'} el Copiloto IA viene desactivado. Este mensaje muestra cómo respondería en un plan Pro o superior.`,
      );
    }, 600);
  };

  const canContinueFromIdentity =
    assets.whatsapp.trim().length > 0 && assets.openingHours.trim().length > 0 && assets.address.trim().length > 0;

  const handleFinishOnboarding = () => {
    const slug =
      venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'mi-restaurante';
    const { currency, currency_code } = currencyFor(venueCurrency);

    batchSetupVenue(
      {
        name: venueName,
        slug,
        tagline: venueTagline,
        city: venueCity,
        address: assets.address,
        currency,
        currency_code,
        phone: assets.whatsapp,
        whatsapp: assets.whatsapp,
        primary_color: venuePrimaryColor,
        background_theme: venueTheme,
        opening_hours: assets.openingHours,
        instagram: assets.instagram || undefined,
        google_review_url: googleReviewUrl,
        is_active: true,
        // Landing + plan data travel with the venue record so the premium
        // one-page landing can be built without a second interview.
        landing_assets: {
          logoFile: assets.logoFile?.name ?? null,
          featuredPhotos: assets.featuredPhotos.map((f) => f.name),
          plan: planId,
          billingCycle,
          hasCustomWebsite: planHas(plan, 'customWebsite'),
          hasCrm: planHas(plan, 'crm'),
          hasAiConcierge: planHas(plan, 'aiConcierge'),
          hasAiAnalytics: planHas(plan, 'aiAnalytics'),
        },
      },
      customCategories,
      tableCount,
    );

    setStep(TOTAL_STEPS);
    toast.success('¡Configuración guardada!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-white">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/mimenu-square.svg" alt="MiMenu" className="h-7 w-7 shrink-0" />
            <span className="font-bold text-base tracking-tight">MiMenu Setup</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span>
              Paso {Math.min(step, TOTAL_STEPS)} de {TOTAL_STEPS}
            </span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* STEP 1: PLAN */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Paso 1: Elegí tu plan
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                ¿Qué nivel de sistema necesitás?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                El plan define qué funciones quedan activas. El Básico es menú digital puro; los demás
                suman IA y, en los altos, un sistema construido a medida.
              </p>
            </div>

            <PlanPicker selected={planId} onSelect={setPlanId} billingCycle={billingCycle} onCycleChange={setBillingCycle} />

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-xs"
              >
                <span>Siguiente: Tu negocio</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY + ASSETS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                Paso 2: Tu negocio y tu marca
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Datos para tu menú {plan?.collectsLandingAssets ? 'y tu web premium' : 'digital'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {plan?.collectsLandingAssets
                  ? 'Con tu plan, estos datos se usan para construir el sitio web de una página: logo, fotos destacadas, Instagram y horarios.'
                  : 'Con el plan Básico estos datos alimentan tu menú digital. Podés subir a un plan con web premium cuando quieras.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nombre del restaurante / bar *</label>
                  <Input
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="ej. Jaleo, Moe's Taberna"
                    className="h-10 rounded-lg text-xs bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Ciudad *</label>
                  <Input
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    className="h-10 rounded-lg text-xs bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Slogan o tagline</label>
                <Input
                  value={venueTagline}
                  onChange={(e) => setVenueTagline(e.target.value)}
                  placeholder="ej. Cocina de autor — Santa Cruz de la Sierra"
                  className="h-10 rounded-lg text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Moneda</label>
                  <select
                    value={venueCurrency}
                    onChange={(e) => setVenueCurrency(e.target.value)}
                    className="h-10 rounded-lg text-xs bg-background border border-border px-3 w-full"
                    aria-label="Moneda"
                  >
                    <option value="Bs.">Bs. (BOB) Bolivianos</option>
                    <option value="USD">USD Dólares</option>
                    <option value="BRL">R$ Reales</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Color primario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={venuePrimaryColor}
                      onChange={(e) => setVenuePrimaryColor(e.target.value)}
                      aria-label="Color primario"
                      className="w-10 h-10 rounded-lg border border-border bg-background cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">{venuePrimaryColor}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tema</label>
                  <div className="flex gap-1.5">
                    {(['light', 'dark'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setVenueTheme(t)}
                        aria-pressed={venueTheme === t}
                        className={`flex-1 h-10 rounded-lg text-xs font-bold border transition-all ${
                          venueTheme === t
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'border-border bg-background text-muted-foreground hover:border-slate-400'
                        }`}
                      >
                        {t === 'dark' ? 'Oscuro' : 'Claro'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <OnboardingAssetsStep plan={plan} value={assets} onChange={setAssets} />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="text-xs h-11 px-6 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>Atrás</span>
              </Button>
              <Button
                onClick={() => {
                  if (!venueName.trim()) {
                    toast.error('El nombre del restaurante es obligatorio.');
                    return;
                  }
                  if (!canContinueFromIdentity) {
                    toast.error('Completá WhatsApp, horario y dirección para continuar.');
                    return;
                  }
                  setStep(3);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-xs"
              >
                <span>Siguiente: Tu menú</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: MENU INTAKE */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />
                Paso 3: Tu carta
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Subí tu menú y revisá lo que leyó el sistema
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fotos o PDF de varias páginas. El OCR corre en tu navegador: revisá y corregí el texto
                antes de importarlo.
              </p>
            </div>

            {/* Drinks / wine list toggle */}
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4">
              <div className="flex items-start gap-3">
                <Wine className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-foreground">¿Esto es la carta de bebidas / vinos?</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Si lo activás, lo que subas se guarda en su propia categoría de bebidas en lugar de
                    mezclarse con los platos. Es sugerido, no obligatorio: si no la tenés ahora, la cargás
                    después.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={drinksOnly}
                aria-label="Marcar como carta de bebidas y vinos"
                onClick={() => setDrinksOnly((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  drinksOnly ? 'bg-rose-500' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    drinksOnly ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <MenuIntakePanel currency={venueCurrency} onParsed={handleIntakeParsed} />

            {/* Manual text fallback */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span>O pegá el texto de tu menú:</span>
              </div>
              <Textarea
                value={rawMenuText}
                onChange={(e) => setRawMenuText(e.target.value)}
                placeholder={'Pegá una línea por plato, ej:\nTAPAS\nGilda (2) - Bs 34\nTortilla Española - Bs 48'}
                rows={4}
                className="text-xs rounded-xl bg-background"
              />
              <Button
                type="button"
                onClick={handleParseMenuText}
                disabled={isParsing}
                variant="outline"
                className="w-full text-xs font-semibold border-amber-500/30 hover:border-amber-500 h-9 rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" aria-hidden="true" />
                {isParsing ? 'Estructurando…' : 'Estructurar texto automáticamente'}
              </Button>
            </div>

            {/* Presets */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <p className="text-xs font-bold text-foreground">¿Preferís arrancar de una plantilla?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(MENU_PRESETS).map(([key, preset]) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setCustomCategories(preset.categories);
                        toast.success(`Plantilla cargada: ${preset.label}`);
                      }}
                      className="p-3 rounded-xl border border-border bg-background hover:border-amber-500/50 text-left transition-all"
                    >
                      <Icon className="w-4 h-4 text-foreground mb-1.5" aria-hidden="true" />
                      <p className="text-[11px] font-bold text-foreground">{preset.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {preset.categories.reduce((n, c) => n + c.items.length, 0)} platos
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Platos listos para publicar:</span>
                <span className="text-amber-500 font-bold tabular-nums">{totalItems} platos</span>
              </div>
              <div className="divide-y divide-border/60 max-h-40 overflow-y-auto">
                {customCategories.flatMap((c) =>
                  c.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.name}</p>
                      </div>
                      <span className="font-bold text-amber-500 tabular-nums shrink-0">
                        {venueCurrency} {item.price}
                      </span>
                    </div>
                  )),
                )}
              </div>
              {intakeSources.length > 0 && (
                <p className="text-[10px] text-muted-foreground pt-1">
                  Fuentes importadas: {intakeSources.map((s) => s.fileName).join(', ')}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="text-xs h-11 px-6 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>Atrás</span>
              </Button>
              <Button
                onClick={() => {
                  if (totalItems === 0) {
                    toast.error('Cargá al menos un plato antes de continuar.');
                    return;
                  }
                  setStep(4);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-xs"
              >
                <span>Siguiente: Mesas & QR</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: TABLES & REVIEWS */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                Paso 4: Mesas & Reseñas Google
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Genera los códigos QR de tus mesas
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cada mesa tendrá un enlace único para pedidos y reseñas en Google Maps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-5 shadow-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <label>Número de mesas en sala / terraza:</label>
                  <span className="text-amber-500 font-bold tabular-nums">{tableCount} Mesas</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  aria-label="Número de mesas"
                  className="w-full accent-amber-500 h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span className="w-3.5 h-3.5 rounded-sm bg-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-500">
                    G
                  </span>
                  <span>Enlace de reseñas de Google Maps</span>
                </div>
                <Input
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/.../review"
                  className="h-10 rounded-lg text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="text-xs h-11 px-6 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>Atrás</span>
              </Button>
              <Button
                onClick={() => setStep(5)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-xs"
              >
                <span>Siguiente: Copiloto</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: WHATSAPP COPILOT */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  planHas(plan, 'aiConcierge')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                Paso 5: Copiloto por WhatsApp
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {planHas(plan, 'aiConcierge') ? 'Conectá tu asistente de gestión' : 'Copiloto IA no incluido en tu plan'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {planHas(plan, 'aiConcierge')
                  ? 'Actualizá precios, pausá platos y consultá ventas desde tu celular.'
                  : `Con el plan ${plan?.name ?? 'Básico'} el Copiloto IA viene desactivado: es exclusivo de Pro y superiores. Podés activarlo subiendo de plan.`}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tu número de WhatsApp autorizado</label>
                <Input
                  value={copilotPhone}
                  onChange={(e) => setCopilotPhone(e.target.value)}
                  placeholder="+591 70000000"
                  className="h-10 rounded-lg text-xs bg-background"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span className="font-semibold text-emerald-400">
                      {planHas(plan, 'aiConcierge') ? 'Simulador de Copiloto' : 'Vista previa (IA desactivada)'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleTestCopilot} className="flex gap-2">
                  <Input
                    value={copilotTestMsg}
                    onChange={(e) => setCopilotTestMsg(e.target.value)}
                    placeholder="ej. Sube la cerveza a 25 Bs"
                    className="h-9 text-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-3 rounded-lg"
                  >
                    Enviar
                  </Button>
                </form>

                {copilotTestResponse && (
                  <div className="p-3 rounded-lg bg-slate-800/80 text-xs text-emerald-300 font-medium border border-slate-700">
                    {copilotTestResponse}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(4)} className="text-xs h-11 px-6 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>Atrás</span>
              </Button>
              <Button
                onClick={handleFinishOnboarding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-xs"
              >
                <span>Activar & Publicar Menú</span>
                <Check className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS */}
        {step === 6 && (
          <div className="space-y-8 text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                ¡{venueName || 'Tu restaurante'} está configurado!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tu menú digital, códigos QR y configuración quedaron guardados.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-2">
              <Rocket className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Plan {plan?.name ?? 'Básico'} · {PLANS.find((p) => p.id === planId)?.tagline}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <p className="text-xs font-bold text-foreground">Menú Digital</p>
                <p className="text-[10px] text-muted-foreground">{totalItems} platos estructurados</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <p className="text-xs font-bold text-foreground">{tableCount} Mesas QR</p>
                <p className="text-[10px] text-muted-foreground">Listas para imprimir</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <p className="text-xs font-bold text-foreground">
                  {planHas(plan, 'aiConcierge') ? 'Copiloto IA activo' : 'Copiloto IA desactivado'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {planHas(plan, 'aiConcierge') ? 'Incluido en tu plan' : 'Exclusivo de Pro y superiores'}
                </p>
              </div>
            </div>

            {planHas(plan, 'customWebsite') && (
              <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 p-4 text-left">
                <p className="text-xs font-bold text-foreground mb-1">Sitio web premium en camino</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Con tu plan, tu landing de una página se construye con el logo, las fotos destacadas y el
                  menú que cargaste. Nuestro equipo lo revisa y te lo entrega listo.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/menu')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-8 py-5 rounded-xl shadow-xs"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Ver Menú Digital (/menu)</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="w-full sm:w-auto font-bold text-sm px-8 py-5 rounded-xl border border-border hover:border-slate-400"
              >
                <Bot className="w-4 h-4 mr-2 text-amber-500" aria-hidden="true" />
                <span>Panel de Administración (/admin)</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
