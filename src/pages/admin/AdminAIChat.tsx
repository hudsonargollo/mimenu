import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Sliders,
  DollarSign
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
    recalculateAllHotness,
    approveReview
  } = useMimenu();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `👋 ¡Hola! Soy el **Copiloto de Inteligencia de MIMENU** para **${venue.name}** en Santa Cruz de la Sierra.\n\nEstoy conectado a tu motor de datos en **KV Storage**, analizando pedidos en vivo, popularidad "Hotness" y reseñas de tus clientes.\n\n¿En qué puedo ayudarte hoy? Puedes pedirme desde analizar métricas y crear promociones hasta agregar o modificar platos del menú.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [aiMemory, setAiMemory] = useState<AIMemoryState | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'kv'>('chat');
  const [kvDump, setKvDump] = useState<Record<string, any>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize AI Engine
  const aiEngine = new MimenuAIEngine(venue, categories, cyclingOffers, reviews, orders);

  useEffect(() => {
    document.title = `AI Copilot & Business Intelligence: ${venue.name} | MiMenu`;
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

    // Process through AI Engine
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
        // Add new item into categories and save to KV
        const categoryId = action.payload.category_id || 'cat-cervezas';
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

        const currentCats = await kv.get<any[]>(KV_KEYS.categories(venue.id)) || categories;
        const updatedCats = currentCats.map(cat => {
          if (cat.id === categoryId) {
            return { ...cat, items: [newItem, ...cat.items] };
          }
          return cat;
        });

        await kv.put(KV_KEYS.categories(venue.id), updatedCats);
        toast.success(`¡Plato "${action.payload.name}" agregado y persistido en KV!`);

      } else if (action.type === 'UPDATE_ITEM_PRICE') {
        toast.success(`Precio actualizado a ${venue.currency} ${action.payload.new_price} en KV`);

      } else if (action.type === 'CREATE_CYCLING_OFFER') {
        addCyclingOffer({
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
        });
        toast.success('¡Oferta inteligente creada y activada en el menú digital!');

      } else if (action.type === 'RECALCULATE_HOTNESS') {
        recalculateAllHotness();
        toast.success('Algoritmo Hotness recalculado en tiempo real.');

      } else if (action.type === 'APPROVE_REVIEWS') {
        reviews.filter(r => r.status === 'pending').forEach(r => approveReview(r.id));
        toast.success('Reseñas pendientes aprobadas.');
      }

      // Mark action as executed in chat message state
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
    "Crear oferta 2x1 en Chopp Artesanal para los jueves",
    "¿Qué aspectos destacan las reseñas de las salchipapas?",
    "Agregar Cerveza Artesanal IPA a 28 Bs",
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Copiloto de Inteligencia Artificial (MIMENU AI)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Asistente cognitivo para administradores de {venue.name}. Modifica el menú con lenguaje natural, consulta analítica de negocio y aprende autónomamente sobre tu clientela en Santa Cruz.
            </p>
          </div>

          {/* Storage & Learning Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl">
              <Database className="w-4 h-4" />
              <span>KV Storage Engine Activo</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={loadLearnedInsights}
              disabled={isLearning}
              className="text-xs font-bold gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLearning ? 'animate-spin' : ''}`} />
              <span>Re-aprender</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Chat de Gestión</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-amber-400" />
            <span>Memoria Cognitiva & Aprendizaje ({aiMemory?.learnedInsights.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('kv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'kv'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="w-4 h-4 text-blue-400" />
            <span>Inspeccionar Cloudflare KV</span>
          </button>
        </div>

        {/* Tab 1: Interactive Chat */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Chat Stream */}
            <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs font-medium'
                        : 'bg-muted/40 border border-border/80 p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs text-foreground'
                    }`}>
                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>

                      {/* Data Insights Box if present */}
                      {msg.dataInsights && (
                        <div className="p-3 rounded-xl bg-background/80 border border-border/60 mt-2 space-y-2">
                          <p className="font-bold text-[11px] uppercase tracking-wider text-primary">
                            {msg.dataInsights.title}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {msg.dataInsights.metrics.map((m, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-muted/40">
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                <p className="text-sm font-black text-foreground">{m.value}</p>
                                {m.trend && <p className="text-[9px] text-emerald-500 font-bold">{m.trend}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action proposals if present */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="pt-2 space-y-2">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase">
                            Acciones Autónomas Disponibles:
                          </p>
                          {msg.actions.map((action) => (
                            <div
                              key={action.id}
                              className="p-3 rounded-xl bg-background border-2 border-primary/40 flex items-center justify-between gap-3"
                            >
                              <span className="font-bold text-xs text-foreground flex-1">
                                {action.label}
                              </span>

                              {action.status === 'executed' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                  <CheckCircle2 className="w-4 h-4" /> Ejecutado en KV
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleExecuteAction(action, msg.id)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 px-3 shadow-sm shrink-0"
                                >
                                  Ejecutar Acción
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <span className="text-[9px] opacity-60 block text-right pt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                    <Bot className="w-4 h-4 animate-bounce text-primary" />
                    <span>MIMENU AI está razonando y consultando KV...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="p-2 border-t border-border/60 bg-muted/20 flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="text-[11px] font-semibold bg-background hover:bg-muted border border-border px-3 py-1.5 rounded-full whitespace-nowrap transition-all hover:scale-105 shrink-0 shadow-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-border bg-card flex gap-2"
              >
                <Input
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Escribe una orden o pregunta (ej. 'Sube el precio de la salchipapa monster a 48 Bs' o '¿Cuál es el trago más pedido?')"
                  className="text-xs h-10 bg-background"
                />
                <Button
                  type="submit"
                  disabled={!inputPrompt.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Right Side: Proactive Intelligence Panel */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border border-border/80 bg-card p-4 space-y-3 shadow-xs">
                <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between border-b border-border/60">
                  <CardTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-amber-500" />
                    <span>Aprendizaje Continuo</span>
                  </CardTitle>
                  <span className="text-[10px] font-bold text-emerald-500">En Vivo</span>
                </CardHeader>
                <CardContent className="p-0 space-y-2 text-xs">
                  <p className="text-muted-foreground leading-relaxed">
                    El sistema se autoalimenta con cada pedido y reseña. Actualmente ha identificado:
                  </p>
                  <div className="p-2.5 rounded-xl bg-muted/40 space-y-1">
                    <p className="font-bold text-foreground">Top Combos Cruzados:</p>
                    <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                      <li>Salchipapa Monster + Huari 620ml</li>
                      <li>Balde 5 Paceñas + Nachos Supremos</li>
                      <li>Jarra Fernet 1L + Chopp Artesanal</li>
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 space-y-1">
                    <p className="font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Franja de Mayor Rentabilidad:
                    </p>
                    <p className="text-[11px]">21:00 a 00:30 hrs en Equipetrol SCZ</p>
                  </div>
                </CardContent>
              </Card>

              {/* Fast Action Shortcuts */}
              <Card className="border border-border/80 bg-card p-4 space-y-2 shadow-xs">
                <CardTitle className="text-xs font-black uppercase tracking-wider">
                  Comandos Rápidos Recomendados
                </CardTitle>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSendMessage("Crear una nueva oferta 2x1 para Happy Hour")}
                    className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted text-xs font-semibold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> Activar Promo Happy Hour</span>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => handleSendMessage("Recalcular hotness de todo el menú")}
                    className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted text-xs font-semibold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" /> Recalcular Rotación Real</span>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => handleSendMessage("Analizar qué opinan los clientes en las reseñas")}
                    className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted text-xs font-semibold transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> Analizar Opiniones de Reseñas</span>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </Card>
            </div>

          </div>
        )}

        {/* Tab 2: Memory & Insights */}
        {activeTab === 'memory' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
              Insights Aprendidos Autónomamente del Negocio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiMemory?.learnedInsights.map((ins) => (
                <Card key={ins.id} className="border border-border bg-card p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                      {ins.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      {ins.confidenceScore}% Confianza
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground">{ins.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.observation}</p>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground font-medium flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Acción Sugerida:</strong> {ins.actionRecommendation}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: KV Inspector */}
        {activeTab === 'kv' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Visor de Base de Datos Cloudflare KV
                </h2>
                <p className="text-xs text-muted-foreground">
                  Arquitectura 100% libre de Supabase. Todo el estado está particionado por namespaces KV.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={loadKVData}
                className="text-xs font-bold"
              >
                Refrescar KV
              </Button>
            </div>

            <Card className="border border-border bg-card p-4 overflow-hidden">
              <pre className="text-xs font-mono text-foreground bg-muted/40 p-4 rounded-xl overflow-x-auto max-h-[500px]">
                {JSON.stringify(kvDump, null, 2)}
              </pre>
            </Card>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminAIChat;
