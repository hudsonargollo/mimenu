import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useMimenu } from '@/lib/mimenuContext';
import { adminFetch, getAppSession } from '@/lib/appSession';
import { findVenueIdBySlug, listVenues } from '@/lib/venueRegistry';
import type {
  ConciergeFaqEntry,
  ConciergeHoursBlock,
  ConciergeLang,
  ConciergeSettings,
  ConciergeTone,
} from '../../../shared/dograh/types';

const LANGS: { value: ConciergeLang; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
];
const TONES: { value: ConciergeTone; label: string }[] = [
  { value: 'cercano', label: 'Cercano' },
  { value: 'formal', label: 'Formal' },
  { value: 'divertido', label: 'Divertido' },
];

const inputCls =
  'w-full rounded-[4px] border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary';
const labelCls = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground';

interface AgentInfo {
  workflowId: number;
  syncStatus: string;
  syncedAt: string | null;
  enabled: boolean;
}

const AdminConciergeSettings = () => {
  const { venue } = useMimenu();
  const session = getAppSession();
  const isSuperadmin = session?.role === 'admin' && session.tenantSlug == null;

  const venues = useMemo(() => {
    const all = listVenues().filter((item) => item.isActive);
    if (isSuperadmin) return all;
    if (session?.tenantSlug) {
      const ownId = findVenueIdBySlug(session.tenantSlug);
      const own = all.filter((item) => item.id === ownId || item.slug === session.tenantSlug);
      return own.length ? own : all;
    }
    return all.filter((item) => item.id === venue.id);
  }, [isSuperadmin, session?.tenantSlug, venue.id]);

  const [slug, setSlug] = useState(() => venue.slug);
  const [settings, setSettings] = useState<ConciergeSettings | null>(null);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (target: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/concierge/settings?venue=${encodeURIComponent(target)}`);
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'No se pudo cargar.');
      const data = await res.json();
      setSettings(data.settings);
      setAgent(data.agent ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar.');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(slug);
  }, [slug, load]);

  const patch = (partial: Partial<ConciergeSettings>) =>
    setSettings((prev) => (prev ? { ...prev, ...partial } : prev));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/concierge/settings?venue=${encodeURIComponent(slug)}`, {
        method: 'PUT',
        body: JSON.stringify({ venue: slug, settings }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'No se pudo guardar.');
      const data = await res.json();
      setSettings(data.settings);
      toast.success('Ajustes guardados. Se aplican al agente en la próxima sincronización.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const setHours = (index: number, partial: Partial<ConciergeHoursBlock>) =>
    patch({ hours: settings!.hours.map((h, i) => (i === index ? { ...h, ...partial } : h)) });
  const setFaq = (index: number, partial: Partial<ConciergeFaqEntry>) =>
    patch({ faq: settings!.faq.map((f, i) => (i === index ? { ...f, ...partial } : f)) });

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <AdminPageHeader
          index="09"
          eyebrow="Conserje · Ajustes"
          title="Ajustes del conserje"
          description="Configurá la identidad, el saludo, los horarios, las reservas y las preguntas frecuentes del asistente. Los cambios se guardan y se aplican al agente en la próxima sincronización."
          actions={
            <button
              onClick={() => void save()}
              disabled={!settings || saving || loading}
              className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Guardar
            </button>
          }
          meta={
            agent ? (
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Agente #{agent.workflowId} · {agent.syncStatus}
                {agent.syncedAt ? ` · ${new Date(agent.syncedAt).toLocaleString('es-BO')}` : ''}
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Sin agente sincronizado</span>
            )
          }
        />

        {venues.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {venues.map((item) => (
              <button
                key={item.id}
                onClick={() => setSlug(item.slug)}
                className={`rounded-[4px] border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  slug === item.slug
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando ajustes…
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {settings && !loading && (
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4 rounded-[6px] border border-border p-5">
              <h2 className="font-display text-lg text-foreground">Identidad y saludo</h2>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => patch({ enabled: e.target.checked })}
                />
                Conserje habilitado en la carta
              </label>
              <div>
                <label className={labelCls}>Nombre del asistente</label>
                <input className={inputCls} value={settings.assistantName} onChange={(e) => patch({ assistantName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Saludo inicial ({settings.greeting.length}/240)</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  maxLength={240}
                  value={settings.greeting}
                  onChange={(e) => patch({ greeting: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Tono</label>
                <select className={inputCls} value={settings.tone} onChange={(e) => patch({ tone: e.target.value as ConciergeTone })}>
                  {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Idiomas</label>
                <div className="flex gap-4">
                  {LANGS.map((l) => (
                    <label key={l.value} className="flex items-center gap-1.5 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={settings.languages.includes(l.value)}
                        onChange={(e) =>
                          patch({
                            languages: e.target.checked
                              ? [...settings.languages, l.value]
                              : settings.languages.filter((x) => x !== l.value),
                          })
                        }
                      />
                      {l.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Mensaje de derivación (WhatsApp)</label>
                <textarea className={inputCls} rows={2} value={settings.handoffMessage} onChange={(e) => patch({ handoffMessage: e.target.value })} />
              </div>
            </section>

            <section className="space-y-4 rounded-[6px] border border-border p-5">
              <h2 className="font-display text-lg text-foreground">Reservas y contacto</h2>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={settings.reservationEnabled} onChange={(e) => patch({ reservationEnabled: e.target.checked })} />
                Reservas habilitadas
              </label>
              <div>
                <label className={labelCls}>Email de reservas</label>
                <input type="email" className={inputCls} value={settings.reservationEmail} onChange={(e) => patch({ reservationEmail: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Máximo de personas</label>
                <input type="number" min={1} max={50} className={inputCls} value={settings.maxPartySize} onChange={(e) => patch({ maxPartySize: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input className={inputCls} value={settings.whatsapp} onChange={(e) => patch({ whatsapp: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Notas de servicio</label>
                <textarea className={inputCls} rows={3} value={settings.serviceNotes} onChange={(e) => patch({ serviceNotes: e.target.value })} />
              </div>
            </section>

            <section className="space-y-3 rounded-[6px] border border-border p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-foreground">Horarios</h2>
                <button
                  onClick={() => patch({ hours: [...settings.hours, { days: '', open: '12:00', close: '23:00' }] })}
                  className="inline-flex items-center gap-1 rounded-[4px] border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Añadir
                </button>
              </div>
              {settings.hours.map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                  <input className={inputCls} placeholder="Días (L–J)" value={h.days} onChange={(e) => setHours(i, { days: e.target.value })} />
                  <input type="time" className={inputCls} value={h.open} onChange={(e) => setHours(i, { open: e.target.value })} />
                  <input type="time" className={inputCls} value={h.close} onChange={(e) => setHours(i, { close: e.target.value })} />
                  <button onClick={() => patch({ hours: settings.hours.filter((_, x) => x !== i) })} aria-label="Eliminar horario" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {settings.hours.length === 0 && <p className="text-sm text-muted-foreground">Sin horarios configurados.</p>}
            </section>

            <section className="space-y-3 rounded-[6px] border border-border p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-foreground">Preguntas frecuentes</h2>
                <button
                  onClick={() => patch({ faq: [...settings.faq, { id: `faq-${settings.faq.length + 1}`, question: '', answer: '', tags: [] }] })}
                  className="inline-flex items-center gap-1 rounded-[4px] border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Añadir
                </button>
              </div>
              {settings.faq.map((f, i) => (
                <div key={f.id} className="space-y-2 rounded-[4px] border border-border p-3">
                  <div className="flex items-start gap-2">
                    <input className={inputCls} placeholder="Pregunta" value={f.question} onChange={(e) => setFaq(i, { question: e.target.value })} />
                    <button onClick={() => patch({ faq: settings.faq.filter((_, x) => x !== i) })} aria-label="Eliminar pregunta" className="mt-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea className={inputCls} rows={2} placeholder="Respuesta" value={f.answer} onChange={(e) => setFaq(i, { answer: e.target.value })} />
                </div>
              ))}
              {settings.faq.length === 0 && <p className="text-sm text-muted-foreground">Sin preguntas frecuentes.</p>}
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminConciergeSettings;