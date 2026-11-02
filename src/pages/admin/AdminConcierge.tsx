import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useMimenu } from '@/lib/mimenuContext';
import { getAppSession } from '@/lib/appSession';
import { findVenueIdBySlug, listVenues } from '@/lib/venueRegistry';
import {
  deleteLearnedAnswer,
  fetchConversations,
  rateTurn,
  updateLearnedAnswer,
} from '@/lib/chatbot/conciergeApi';
import type {
  ConciergeConversation,
  ConciergeFeedback,
  ConciergeLang,
  ConciergeLearnedAnswer,
  ConciergeStats,
  ConciergeTurn,
} from '../../../shared/concierge';

type ReviewedTurn = ConciergeTurn & { feedback?: ConciergeFeedback | null };

const EMPTY_STATS: ConciergeStats = { turns: 0, good: 0, bad: 0, unreviewed: 0, learned: 0 };

const LANG_LABEL: Record<ConciergeLang, string> = { es: 'ES', en: 'EN', pt: 'PT', de: 'DE' };

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const StatTile = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
  <div className="border-b border-r border-border p-4">
    <p className="noir-num text-2xl leading-none tracking-tight text-foreground">{value}</p>
    <p className={`mt-2 text-[9px] font-bold uppercase tracking-[0.2em] ${tone ?? 'text-muted-foreground'}`}>
      {label}
    </p>
  </div>
);

const LangBadge = ({ lang }: { lang: ConciergeLang }) => (
  <span className="rounded-[2px] border border-border px-1 py-px text-[8px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
    {LANG_LABEL[lang]}
  </span>
);

const AdminConcierge = () => {
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

  const [venueId, setVenueId] = useState(() => {
    if (venues.some((item) => item.id === venue.id)) return venue.id;
    return venues[0]?.id ?? venue.id;
  });

  const [sessions, setSessions] = useState<ConciergeConversation[]>([]);
  const [stats, setStats] = useState<ConciergeStats>(EMPTY_STATS);
  const [learned, setLearned] = useState<ConciergeLearnedAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [correctingTurnId, setCorrectingTurnId] = useState<string | null>(null);
  const [correctionReply, setCorrectionReply] = useState('');
  const [correctionTriggers, setCorrectionTriggers] = useState('');
  const [busyTurnId, setBusyTurnId] = useState<string | null>(null);
  const [savingCorrection, setSavingCorrection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchConversations(venueId);
      setSessions(payload.sessions);
      setStats(payload.stats);
      setLearned(payload.learned);
      setSelectedSessionId((current) =>
        current && payload.sessions.some((item) => item.sessionId === current)
          ? current
          : payload.sessions[0]?.sessionId ?? null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones.');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    document.title = 'Conserje · QA | MiMenu';
    void load();
  }, [load]);

  const activeSession = useMemo(
    () => sessions.find((item) => item.sessionId === selectedSessionId) ?? sessions[0] ?? null,
    [sessions, selectedSessionId]
  );

  const openCorrection = (turn: ReviewedTurn) => {
    setCorrectingTurnId(turn.id);
    setCorrectionReply('');
    setCorrectionTriggers(turn.message);
  };

  const rate = async (turn: ReviewedTurn, rating: 'good' | 'bad') => {
    setBusyTurnId(turn.id);
    try {
      await rateTurn({ venueId, turnId: turn.id, rating, lang: turn.lang });
      toast.success(rating === 'good' ? 'Respuesta validada.' : 'Respuesta marcada como mala.');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la revisión.');
    } finally {
      setBusyTurnId(null);
    }
  };

  const saveCorrection = async (turn: ReviewedTurn, markOnly = false) => {
    const reply = correctionReply.trim();
    const triggers = correctionTriggers
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length >= 3);

    if (!markOnly) {
      if (reply.length < 2) {
        toast.error('Escribí la respuesta correcta.');
        return;
      }
      if (triggers.length === 0) {
        toast.error('Agregá al menos una frase disparadora de 3 caracteres o más.');
        return;
      }
    }

    setSavingCorrection(true);
    try {
      await rateTurn({
        venueId,
        turnId: turn.id,
        rating: 'bad',
        lang: turn.lang,
        correctedReply: markOnly ? undefined : reply,
        triggers: markOnly ? undefined : triggers,
      });
      toast.success(markOnly ? 'Respuesta marcada como mala.' : 'Corrección guardada: el conserje la reutilizará.');
      setCorrectingTurnId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la corrección.');
    } finally {
      setSavingCorrection(false);
    }
  };

  const toggleLearned = async (answer: ConciergeLearnedAnswer) => {
    try {
      const next = await updateLearnedAnswer(venueId, answer.id, { active: !answer.active });
      setLearned(next);
      toast.success(answer.active ? 'Respuesta desactivada.' : 'Respuesta activada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la respuesta.');
    }
  };

  const removeLearned = async (answer: ConciergeLearnedAnswer) => {
    if (!window.confirm('¿Eliminar esta respuesta aprendida? El conserje dejará de usarla.')) return;
    try {
      const next = await deleteLearnedAnswer(venueId, answer.id);
      setLearned(next);
      toast.success('Respuesta eliminada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar la respuesta.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <AdminPageHeader
          index="08"
          eyebrow="Conserje · QA"
          title="Conversaciones del conserje"
          description="Revisá lo que preguntan los clientes, validá las buenas respuestas y corregí las malas. Las correcciones se convierten en respuestas curadas que el conserje reutiliza."
          meta={
            <>
              <span className="noir-eyebrow">Últimos 90 días</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">
                {isSuperadmin ? 'Acceso superadmin — todas las sedes' : `Sede ${venue.name}`}
              </span>
            </>
          }
          actions={
            <>
              {venues.length > 1 ? (
                <label className="flex items-center gap-2 rounded-[4px] border border-border bg-card px-3 py-1.5 text-[11px] font-semibold">
                  <span className="sr-only">Sede a revisar</span>
                  <select
                    value={venueId}
                    onChange={(event) => setVenueId(event.target.value)}
                    className="max-w-[13rem] bg-transparent font-semibold outline-none"
                    aria-label="Sede a revisar"
                  >
                    {venues.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-[4px] border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Actualizar
              </button>
            </>
          }
        />

        {error ? (
          <div className="flex flex-col items-start gap-3 border border-destructive/40 bg-destructive/5 p-6">
            <p className="flex items-center gap-2 font-display text-lg text-foreground">
              <TriangleAlert className="h-4 w-4 text-destructive" aria-hidden="true" />
              No se pudo abrir el registro
            </p>
            <p className="max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">{error}</p>
            <Link
              to="/auth"
              className="border-b border-foreground pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground"
            >
              Iniciar sesión como administrador
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Turnos" value={stats.turns} />
          <StatTile label="Validadas" value={stats.good} tone="text-emerald-700" />
          <StatTile label="Malas" value={stats.bad} tone="text-destructive" />
          <StatTile label="Sin revisar" value={stats.unreviewed} tone="text-amber-700" />
          <StatTile label="Curadas" value={learned.length || stats.learned} />
        </div>

        {loading && sessions.length === 0 ? (
          <div className="flex items-center gap-2 border border-border p-8 text-[12px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Cargando conversaciones…
          </div>
        ) : sessions.length === 0 ? (
          <div className="border border-border p-8">
            <p className="font-display text-lg text-foreground">Todavía no hay conversaciones</p>
            <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
              Cuando un cliente abra el conserje y escriba, el turno aparecerá acá para revisarlo.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="border border-border">
              <div className="border-b border-border px-4 py-3">
                <p className="noir-eyebrow">Sesiones</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {sessions.length} conversaciones registradas
                </p>
              </div>
              <ul className="max-h-[520px] overflow-y-auto">
                {sessions.map((item) => {
                  const active = item.sessionId === activeSession?.sessionId;
                  const pending = item.turns.filter((turn) => !turn.feedback).length;
                  return (
                    <li key={item.sessionId}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSessionId(item.sessionId);
                          setCorrectingTurnId(null);
                        }}
                        className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors ${
                          active ? 'bg-card' : 'bg-transparent hover:bg-card/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Bot className="h-3 w-3 text-primary" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground">
                            {item.userName || 'Invitado'}
                          </span>
                          <LangBadge lang={item.lang} />
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="noir-num">{formatWhen(item.lastAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {item.turns.length} {item.turns.length === 1 ? 'turno' : 'turnos'}
                          </span>
                          {pending > 0 && (
                            <span className="ml-auto rounded-[2px] bg-amber-500/15 px-1 py-px text-[8px] font-bold uppercase tracking-[0.1em] text-amber-700">
                              {pending} sin revisar
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <section className="min-w-0 border border-border">
              {activeSession ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-display text-base text-foreground">
                        {activeSession.userName || 'Invitado'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Inicio {formatWhen(activeSession.startedAt)} · Último turno{' '}
                        {formatWhen(activeSession.lastAt)}
                      </p>
                    </div>
                    <LangBadge lang={activeSession.lang} />
                  </div>

                  <div className="max-h-[560px] overflow-y-auto">
                    {activeSession.turns.map((turn) => {
                      const feedback = turn.feedback ?? null;
                      const correcting = correctingTurnId === turn.id;
                      const busy = busyTurnId === turn.id;

                      return (
                        <article key={turn.id} className="border-b border-border px-4 py-4 last:border-b-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-foreground">
                              <span className="noir-eyebrow mr-2">Cliente</span>
                              {turn.message}
                            </p>
                            <span className="noir-num shrink-0 text-[10px] text-muted-foreground">
                              {formatWhen(turn.createdAt)}
                            </span>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap border-l border-border pl-3 text-[12.5px] leading-relaxed text-muted-foreground">
                            {turn.reply}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {turn.learnedId && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                                <BookOpen className="h-3 w-3" aria-hidden="true" />
                                Respuesta curada
                              </span>
                            )}
                            {turn.reservationSaved && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Reserva creada
                              </span>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void rate(turn, 'good')}
                                disabled={busy}
                                className={`inline-flex items-center gap-1 rounded-[3px] border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
                                  feedback?.rating === 'good'
                                    ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-700'
                                    : 'border-border bg-transparent text-muted-foreground hover:border-emerald-600/60 hover:text-emerald-700'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                                Buena
                              </button>
                              <button
                                type="button"
                                onClick={() => openCorrection(turn)}
                                disabled={busy}
                                className={`inline-flex items-center gap-1 rounded-[3px] border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
                                  feedback?.rating === 'bad'
                                    ? 'border-destructive/60 bg-destructive/10 text-destructive'
                                    : 'border-border bg-transparent text-muted-foreground hover:border-destructive/60 hover:text-destructive'
                                }`}
                              >
                                <ThumbsDown className="h-3 w-3" aria-hidden="true" />
                                Corregir
                              </button>
                            </div>
                          </div>

                          {feedback?.rating === 'bad' && feedback.correctedReply && !correcting && (
                            <div className="mt-2 border border-emerald-600/30 bg-emerald-500/[0.06] p-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                                Corrección guardada
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/85">
                                {feedback.correctedReply}
                              </p>
                            </div>
                          )}

                          {correcting && (
                            <div className="mt-3 border border-destructive/40 bg-destructive/[0.04] p-3">
                              <label
                                htmlFor={`reply-${turn.id}`}
                                className="text-[9px] font-bold uppercase tracking-[0.14em] text-destructive"
                              >
                                Respuesta correcta
                              </label>
                              <textarea
                                id={`reply-${turn.id}`}
                                value={correctionReply}
                                onChange={(event) => setCorrectionReply(event.target.value)}
                                rows={3}
                                placeholder="Escribí cómo debería haber respondido el conserje…"
                                className="mt-1 w-full resize-y rounded-[3px] border border-border bg-background px-2.5 py-2 text-[12.5px] leading-relaxed text-foreground outline-none focus:border-foreground/40"
                              />

                              <label
                                htmlFor={`triggers-${turn.id}`}
                                className="mt-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                              >
                                Frases que la activan (separadas por coma)
                              </label>
                              <input
                                id={`triggers-${turn.id}`}
                                value={correctionTriggers}
                                onChange={(event) => setCorrectionTriggers(event.target.value)}
                                placeholder="precio del calamar, cuánto cuesta"
                                className="mt-1 w-full rounded-[3px] border border-border bg-background px-2.5 py-2 text-[12.5px] text-foreground outline-none focus:border-foreground/40"
                              />

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void saveCorrection(turn)}
                                  disabled={savingCorrection}
                                  className="inline-flex items-center gap-1.5 rounded-[3px] bg-primary px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                  {savingCorrection && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                                  Guardar y aprender
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void saveCorrection(turn, true)}
                                  disabled={savingCorrection}
                                  className="rounded-[3px] border border-border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive disabled:opacity-50"
                                >
                                  Solo marcar como mala
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCorrectingTurnId(null)}
                                  disabled={savingCorrection}
                                  className="ml-auto rounded-[3px] px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground disabled:opacity-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-8 text-[12px] text-muted-foreground">Elegí una sesión para revisar.</div>
              )}
            </section>
          </div>
        )}

        <section className="border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="flex items-center gap-2 noir-eyebrow">
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                Respuestas curadas
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Se aplican antes que las respuestas genéricas cuando el mensaje coincide con una frase
                disparadora.
              </p>
            </div>
            <span className="noir-num text-[10px] text-muted-foreground">
              {learned.length} {learned.length === 1 ? 'guardada' : 'guardadas'}
            </span>
          </div>

          {learned.length === 0 ? (
            <div className="p-6">
              <p className="text-[12px] text-muted-foreground">
                Todavía no hay respuestas curadas. Marcá un turno con 👎 y escribí la corrección para crear la
                primera.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2">
              {learned.map((answer) => (
                <li
                  key={answer.id}
                  className={`flex flex-col gap-2 border-b border-r border-border p-4 ${
                    answer.active ? '' : 'opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LangBadge lang={answer.lang} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {answer.active ? 'Activa' : 'Desactivada'}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleLearned(answer)}
                        className="rounded-[3px] border border-border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                      >
                        {answer.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeLearned(answer)}
                        aria-label="Eliminar respuesta curada"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[3px] border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[12.5px] leading-relaxed text-foreground/90">{answer.reply}</p>

                  <div className="flex flex-wrap gap-1">
                    {answer.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="rounded-[2px] border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminConcierge;
