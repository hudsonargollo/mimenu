import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Sparkles,
  Flame,
  TrendingUp,
  CheckCircle2,
  Database,
  BrainCircuit,
  Zap,
  Plus,
  Star,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
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
      text: `👋 ¡Hola! Soy el **Copiloto de Inteligencia de MIMENU** para **${venue.name}**.\\n\\nEstoy conectado a tu motor de datos en **KV Storage**, analizando pedidos en vivo, popularidad "Hotness" y reseñas de tus clientes.\\n\\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [aiMemory, setAiMemory] = useState<AIMemoryState | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'kv'>('chat');
  const [kvDump, setKvDump] = useState<Record<string, any>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiEngine = new MimenuAIEngine(venue, categories, cyclingOffers, reviews, orders);

  useEffect(() => {
    document.title = `AI Copilot: ${venue.name} | MiMenu`;
    loadLearnedInsights();
    loadKVData();
  }, [venue.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Bot className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                AI Copilot
              </h1>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                IA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Copiloto de inteligencia para {venue.name}. Analiza, crea promociones y gestioná el menú con lenguaje natural.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadLearnedInsights}
            disabled={isLearning}
            className="text-xs font-bold gap-1.5 border-border hover:border-amber-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLearning ? 'animate-spin' : ''}`} />
            Re-aprender
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chat column */}
          <div className="xl:col-span-2 rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] flex flex-col">
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/90">Asistente</p>
                  <p className="text-[11px] text-white/65">Respuestas accionables</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                Online
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl text-xs ${msg.sender === 'user' ? 'ml-auto bg-white/15 text-white/90' : 'bg-white/10 text-white/85'}`}
                  style={{ backdropFilter: 'blur(8px)', maxWidth: '85%' }}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {msg.actions.map((action) => (
                        <div key={action.id} className="p-2 rounded-xl bg-white/10 flex items-center justify-between gap-2">
                          <span className="font-bold text-xs flex-1">{action.label}</span>
                          {action.status === 'executed' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Ejecutado
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteAction(action, msg.id)}
                              className="bg-white/15 hover:bg-white/25 text-white/90 font-bold text-xs h-7 px-3 rounded-lg"
                            >
                              Ejecutar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="text-xs text-white/70 p-2">MIMENU AI está razonando...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/20">
              <div className="flex gap-2">
                <Input
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Escribe una orden o pregunta..."
                  className="text-xs h-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim()}
                  className="bg-white/15 hover:bg-white/25 text-white/90 font-bold text-xs h-10 px-4 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/80 border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insights column */}
          <div className="rounded-3xl border border-white/25 bg-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/90">Memoria IA</p>
                <p className="text-[11px] text-white/65">Insights aprendidos</p>
              </div>
            </div>
            <div className="space-y-2">
              {isLearning ? (
                <p className="text-xs text-white/70">Aprendiendo...</p>
              ) : aiMemory ? (
                <>
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/75">Interacciones</span>
                      <span className="text-white/90 font-bold">{aiMemory.totalInteractions}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/75">Último aprendizaje</span>
                      <span className="text-white/90 font-bold">{new Date(aiMemory.lastLearnedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {aiMemory.learnedInsights.map((ins) => (
                      <div key={ins.id} className="p-3 rounded-2xl bg-white/10 border border-white/20">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">{ins.category}</div>
                        <div className="text-xs font-bold text-white/90 mb-1">{ins.title}</div>
                        <div className="text-[11px] text-white/70 mb-2">{ins.observation}</div>
                        <div className="text-[11px] text-white/80">
                          <span className="font-bold">Acción:</span> {ins.actionRecommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/70">Sin insights aún.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIChat;
