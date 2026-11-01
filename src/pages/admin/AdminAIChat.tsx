import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, CheckCircle2, BrainCircuit, RefreshCw } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  MimenuAIEngine,
  AIChatMessage,
  AIChatAction,
  AIMemoryState
} from '@/lib/aiCopilotEngine';
import { kv, KV_KEYS } from '@/lib/kvStore';
import { toast } from 'sonner';

export const AdminAIChat: React.FC = () => {
  const {
    venue,
    categories,
    cyclingOffers,
    reviews,
    orders,
    addCyclingOffer,
    updateCyclingOffer,
    recalculateAllHotness,
    approveReview,
    setCategories,
    updateVenue
  } = useMimenu();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `👋 Hola, soy el Copiloto de MIMENU para ${venue.name}.\n\nEstoy conectado a tu motor de datos: pedidos en vivo, popularidad Hotness y reseñas de tus clientes.\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [aiMemory, setAiMemory] = useState<AIMemoryState | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'kv'>('chat');
  const [kvDump, setKvDump] = useState<Record<string, any>>({});

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const aiEngine = new MimenuAIEngine(venue, categories, cyclingOffers, reviews, orders);

  useEffect(() => {
    document.title = `AI Copilot: ${venue.name} | MiMenu`;
    loadLearnedInsights();
    loadKVData();
  }, [venue.name]);

  useEffect(() => {
    const node = chatScrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadLearnedInsights = async () => {
    setIsLearning(true);
    try {
      const memory = await aiEngine.generateLearnedInsights();
      setAiMemory(memory);
    } catch (err) {
      console.error('Error generating AI insights:', err);
    } finally {
      setIsLearning(false);
    }
  };

  const loadKVData = async () => {
    const dump = await kv.exportAll();
    setKvDump(dump);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const aiResponse = await aiEngine.processUserInput(textToSend);
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Error processing AI turn:', error);
      } finally {
        setIsTyping(false);
      }
    }, 600);
  };

  const handleExecuteAction = async (action: AIChatAction, msgId: string) => {
    try {
      if (action.type === 'ADD_MENU_ITEM') {
        const categoryId = action.payload.category_id || (categories[0]?.id || '');
        const newItem = {
          id: `item-${Date.now()}`,
          venue_id: venue.id,
          category_id: categoryId,
          name: action.payload.name,
          description: action.payload.description,
          price: action.payload.price,
          image_url: action.payload.image_url,
          is_available: true,
          hotness_score: 3 as any,
          velocity_24h: 1,
          baseline_14d: 1.0,
          reviews_count: 0,
          average_rating: 5.0,
          tags: action.payload.tags || ['Novedad'],
        };
        setCategories(prev => {
          const next = prev.map(cat => cat.id === categoryId ? { ...cat, items: [newItem, ...cat.items] } : cat);
          kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
          return next;
        });
        toast.success(`¡Plato "${action.payload.name}" agregado al menú!`);
      } else if (action.type === 'UPDATE_ITEM_PRICE') {
      const { item_id, new_price } = action.payload;
      if (!item_id && new_price === undefined) {
        toast.error('Falta el ítem o el nuevo precio');
        return;
      }
      if (item_id) {
        setCategories(prev => {
          const next = prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => item.id === item_id ? { ...item, price: Number(new_price) } : item)
          }));
          kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
          return next;
        });
        toast.success(`Precio actualizado a ${venue.currency} ${Number(new_price).toFixed(2)}`);
      } else if (action.payload.name) {
        const lowerName = action.payload.name.toLowerCase();
        setCategories(prev => {
          const next = prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => item.name.toLowerCase().includes(lowerName) ? { ...item, price: Number(new_price) } : item)
          }));
          kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
          return next;
        });
        toast.success(`Precio actualizado para "${action.payload.name}" a ${venue.currency} ${Number(new_price).toFixed(2)}`);
      }
    } else if (action.type === 'TOGGLE_ITEM_AVAILABILITY') {
      const { item_id, name, is_available } = action.payload;
      setCategories(prev => {
        const target = item_id || name;
        const next = prev.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
            if (item.id === target || item.name.toLowerCase() === String(target).toLowerCase()) {
              return { ...item, is_available: is_available ?? !item.is_available };
            }
            return item;
          })
        }));
        kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
        return next;
      });
      toast.success(`Disponibilidad actualizada`);
    } else if (action.type === 'CREATE_CYCLING_OFFER') {
      const offer = {
        venue_id: venue.id,
        title: action.payload.title,
        subtitle: action.payload.subtitle,
        description: action.payload.description,
        badge: action.payload.badge,
        original_price: action.payload.original_price,
        discount_price: action.payload.discount_price,
        image_url: action.payload.image_url,
        is_active: true,
        priority_level: 1,
        included_item_names: action.payload.included_item_names,
        schedules: action.payload.schedules,
      };
      addCyclingOffer(offer);
      toast.success('¡Oferta inteligente creada y activada!');
    } else if (action.type === 'TOGGLE_CYCLING_OFFER') {
      const { offer_id, is_active } = action.payload;
      if (offer_id) {
        updateCyclingOffer(offer_id, { is_active: is_active ?? false });
        toast.success('Oferta actualizada');
      }
    } else if (action.type === 'RECALCULATE_HOTNESS') {
      recalculateAllHotness();
      toast.success('Algoritmo Hotness recalculado.');
    } else if (action.type === 'APPROVE_REVIEWS') {
      reviews.filter(r => r.status === 'pending').forEach(r => approveReview(r.id));
      toast.success('Reseñas pendientes aprobadas.');
    } else if (action.type === 'UPDATE_VENUE_INFO') {
      updateVenue(action.payload.venue || {});
      toast.success('Datos del local actualizados');
    } else if (action.type === 'REGENERATE_ITEMS') {
      setCategories(prev => {
        const next = prev.map(cat => ({
          ...cat,
          items: cat.items.map(item => ({
            ...item,
            image_url: item.image_url || `https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80`,
            description: item.description || 'Preparado fresco con ingredientes seleccionados.',
          }))
        }));
        kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
        return next;
      });
      toast.success('Contenido visual y descripciones regenerados');
    } else if (action.type === 'DELETE_MENU_ITEM') {
      const { item_id, name } = action.payload;
      setCategories(prev => {
        const next = prev.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.id !== item_id && item.name !== name)
        }));
        kv.put(KV_KEYS.categories(venue.id), next).catch(() => {});
        return next;
      });
      toast.success('Ítem eliminado del menú');
    }

      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.actions) {
          return {
            ...m,
            actions: m.actions.map(a => a.id === action.id ? { ...a, status: 'executed' } : a)
          };
        }
        return m;
      }));
      loadKVData();
    } catch (err) {
      console.error('Error executing AI action:', err);
      toast.error('Error al ejecutar la acción');
    }
  };

  const quickPrompts = [
    "¿Cuáles son las métricas de venta y ticket promedio?",
    "¿Qué platos tienen mayor rotación según el algoritmo?",
    "Crear oferta 2x1 en PAELLA VALENCIANA para los jueves",
    "¿Qué aspectos destacan las reseñas de los platos?",
    "Agregar nuevo plato de temporada a 50 Bs",
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <AdminPageHeader
          index="08"
          eyebrow="AI Copilot"
          title="AI Copilot"
          description={`Copiloto de inteligencia para ${venue.name}. Analizá, creá promociones y gestioná el menú con lenguaje natural.`}
          actions={
            <button
              onClick={loadLearnedInsights}
              disabled={isLearning}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-foreground px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLearning ? 'animate-spin' : ''}`} aria-hidden="true" />
              Re-aprender
            </button>
          }
          meta={
            <>
              <span className="noir-eyebrow">WhatsApp concierge</span>
              <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden="true" />
              <span className="noir-eyebrow">{messages.length} mensajes</span>
            </>
          }
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Chat column */}
          <div className="flex flex-col border border-border bg-card/70 xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-primary/30 text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] font-bold text-foreground">Asistente</p>
                  <p className="noir-eyebrow">Respuestas accionables</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Online
              </span>
            </div>

            <div ref={chatScrollRef} className="h-[40vh] min-h-[280px] max-h-[420px] flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 text-xs ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-foreground text-background'
                      : 'border border-border bg-muted/40 text-foreground'
                  }`}
                  style={{ maxWidth: '85%' }}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {msg.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between gap-2 border-t border-current/15 pt-2">
                          <span className="flex-1 text-xs font-semibold">{action.label}</span>
                          {action.status === 'executed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Ejecutado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleExecuteAction(action, msg.id)}
                              className="bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background hover:opacity-85"
                            >
                              Ejecutar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="p-2 text-xs text-muted-foreground">MIMENU AI está razonando…</div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Escribí una orden o pregunta…"
                  className="h-10 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className="inline-flex h-10 items-center gap-2 border border-foreground bg-foreground px-4 text-background transition-opacity hover:opacity-85 disabled:opacity-40"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insights column — the one ink block on the page */}
          <div className="sb-surface space-y-4 p-4">
            <div className="sb-rule flex items-center gap-2.5 border-b pb-3">
              <span className="sb-rule-strong flex h-7 w-7 items-center justify-center rounded-[3px] border">
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-bold">Memoria IA</p>
                <p className="sb-45 text-[9px] font-bold uppercase tracking-[0.2em]">Insights aprendidos</p>
              </div>
            </div>
            <div className="space-y-2">
              {isLearning ? (
                <p className="sb-60 text-xs">Aprendiendo…</p>
              ) : aiMemory ? (
                <>
                  <div className="sb-rule space-y-2 border-b pb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="sb-60">Interacciones</span>
                      <span className="noir-num font-bold">{aiMemory.totalInteractions}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="sb-60">Último aprendizaje</span>
                      <span className="noir-num font-bold">{new Date(aiMemory.lastLearnedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {aiMemory.learnedInsights.map((ins) => (
                      <div key={ins.id} className="sb-rule border-b pb-3 last:border-0">
                        <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--primary-soft))]">{ins.category}</div>
                        <div className="mb-1 text-xs font-bold">{ins.title}</div>
                        <div className="sb-60 mb-1.5 text-[11px] leading-relaxed">{ins.observation}</div>
                        <div className="sb-85 text-[11px]">
                          <span className="font-bold">Acción:</span> {ins.actionRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="sb-60 text-xs">Sin insights aún.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIChat;
