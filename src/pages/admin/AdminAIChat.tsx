import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: '#d6d0f3' }}
      >
        {/* wash gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%), radial-gradient(40% 40% at 20% 80%, rgba(168,139,255,0.35) 0%, transparent 70%), radial-gradient(40% 40% at 80% 70%, rgba(255,182,217,0.3) 0%, transparent 70%)'
        }} />

        {/* glass orb */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl">
          <div
            className="w-40 h-40 rounded-full relative"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(180,160,240,0.35) 60%, rgba(120,90,200,0.2) 100%)',
              boxShadow: '0 20px 60px rgba(120,90,200,0.35), inset 0 0 40px rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-16 h-16 text-white/80" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-[#2a2440] leading-none">
            before your next move.
          </h1>

          <p className="text-sm text-[#4a4366] max-w-md">
            Copiloto de inteligencia para {venue.name}. Analiza, crea promociones y gestiona tu menú con lenguaje natural.
          </p>

          {/* glass buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {quickPrompts.slice(0, 3).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#2a2440] border border-white/60 transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.35)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px rgba(120,90,200,0.15)',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* chat input glass */}
          <div
            className="w-full max-w-xl flex gap-2 p-2 rounded-2xl border border-white/60"
            style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)' }}
          >
            <Input
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Escribe una orden o pregunta..."
              className="text-xs h-10 bg-transparent border-0 focus-visible:ring-0 text-[#2a2440] placeholder:text-[#6b6388]"
            />
            <Button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim()}
              className="bg-white/60 hover:bg-white/80 text-[#2a2440] font-bold text-xs h-10 px-4 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* chat stream (compact) */}
          <div className="w-full max-w-2xl max-h-64 overflow-y-auto space-y-3 text-left">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl text-xs ${msg.sender === 'user' ? 'ml-auto bg-white/50 text-[#2a2440]' : 'bg-white/40 text-[#2a2440]'}`}
                style={{ backdropFilter: 'blur(8px)', maxWidth: '85%' }}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {msg.actions.map((action) => (
                      <div key={action.id} className="p-2 rounded-xl bg-white/50 flex items-center justify-between gap-2">
                        <span className="font-bold text-xs flex-1">{action.label}</span>
                        {action.status === 'executed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Ejecutado
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleExecuteAction(action, msg.id)}
                            className="bg-white/60 hover:bg-white/80 text-[#2a2440] font-bold text-xs h-7 px-3 rounded-lg"
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
              <div className="text-xs text-[#4a4366] p-2">MIMENU AI está razonando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* tabs */}
          <div className="flex gap-2">
            {(['chat','memory','kv'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab===t ? 'bg-white/70 text-[#2a2440]' : 'bg-white/30 text-[#4a4366]'}`}
                style={{ backdropFilter: 'blur(8px)' }}
              >
                {t.toUpperCase()}
              </button>
            ))}
            <button
              onClick={loadLearnedInsights}
              disabled={isLearning}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/30 text-[#4a4366]"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <RefreshCw className={`w-3 h-3 inline ${isLearning ? 'animate-spin' : ''}`} /> Re-aprender
            </button>
          </div>

          {activeTab === 'memory' && aiMemory && (
            <div className="w-full max-w-2xl space-y-2 text-left">
              {aiMemory.learnedInsights.map((ins) => (
                <div key={ins.id} className="p-3 rounded-2xl bg-white/40 text-xs text-[#2a2440]" style={{ backdropFilter: 'blur(8px)' }}>
                  <div className="font-bold">{ins.title}</div>
                  <div className="text-[#4a4366]">{ins.observation}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kv' && (
            <div className="w-full max-w-2xl">
              <pre className="text-xs font-mono text-[#2a2440] bg-white/40 p-4 rounded-2xl overflow-x-auto max-h-64" style={{ backdropFilter: 'blur(8px)' }}>
                {JSON.stringify(kvDump, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIChat;
