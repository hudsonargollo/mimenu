import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { ChatbotLang, ChatbotSessionState } from '@/lib/chatbot/engine';
import { handleChatTurn, loadSessionState, saveSessionState } from '@/lib/chatbot/service';

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };
const labels: Record<ChatbotLang, { title: string; placeholder: string; welcome: string; error: string }> = {
  es: { title: 'Asistente', placeholder: 'Escribe tu mensaje…', welcome: '¡Hola! Puedo ayudarte con el menú, horarios, ubicación y solicitudes de reserva.', error: 'No pude enviar el mensaje. Inténtalo de nuevo.' },
  en: { title: 'Assistant', placeholder: 'Type a message…', welcome: 'Hi! I can help with the menu, hours, location, and reservation requests.', error: 'I could not send that message. Please try again.' },
  pt: { title: 'Assistente', placeholder: 'Digite sua mensagem…', welcome: 'Olá! Posso ajudar com o cardápio, horários, localização e solicitações de reserva.', error: 'Não consegui enviar a mensagem. Tente novamente.' },
  de: { title: 'Assistent', placeholder: 'Nachricht schreiben…', welcome: 'Hallo! Ich helfe bei Speisekarte, Öffnungszeiten, Anfahrt und Reservierungsanfragen.', error: 'Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.' },
};

export function MenuChatbot() {
  const { venue, categories } = useMimenu();
  const sessionKey = useMemo(() => {
    const storageKey = `mimenu-chatbot-session:${venue.id}`;
    let key = localStorage.getItem(storageKey);
    if (!key) {
      key = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(storageKey, key);
    }
    return key;
  }, [venue.id]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [lang, setLang] = useState<ChatbotLang>('es');
  const [sessionState, setSessionState] = useState<ChatbotSessionState>({ language: 'es', reservationDraft: { step: 'idle' } });
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'assistant', text: labels.es.welcome }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    loadSessionState(venue.id, sessionKey).then(saved => {
      if (!active || !saved) return;
      setSessionState(saved);
      setLang(saved.language || 'es');
    });
    return () => { active = false; };
  }, [venue.id, sessionKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  const menuItems = useMemo(() => categories.flatMap(category => category.items.map(item => {
    const dietary = item.dietary || [];
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: category.name,
      isAvailable: item.is_available,
      isFeatured: item.is_featured,
      isVegetarian: dietary.includes('Vegetariano') || dietary.includes('Vegetarian'),
      isVegan: dietary.includes('Vegano') || dietary.includes('Vegan'),
      isGlutenFree: dietary.includes('Sin Gluten') || dietary.includes('Gluten-Free'),
    };
  })), [categories]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setText('');
    setMessages(current => [...current, { id: `${Date.now()}-user`, role: 'user', text: message }]);
    setBusy(true);
    try {
      const result = await handleChatTurn(message, sessionState, {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        phone: venue.phone,
        openingHours: venue.opening_hours,
      }, menuItems, sessionKey, 'web');
      setSessionState(result.response.nextState);
      setLang(result.response.detectedLang);
      setMessages(current => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: result.response.reply }]);
    } catch (error) {
      console.error('Chatbot turn failed:', error);
      setMessages(current => [...current, { id: `${Date.now()}-error`, role: 'assistant', text: labels[lang].error }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label={labels[lang].title} className="mb-3 flex h-[min(70vh,460px)] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">{labels[lang].title}</p>
              <p className="text-xs text-slate-300">{venue.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <select aria-label="Chat language" value={lang} onChange={event => { const language = event.target.value as ChatbotLang; setLang(language); const updated = { ...sessionState, language }; setSessionState(updated); void saveSessionState(venue.id, sessionKey, updated); }} className="rounded-md border border-white/20 bg-slate-800 px-2 py-1 text-xs text-white">
                <option value="es">ES</option><option value="en">EN</option><option value="pt">PT</option><option value="de">DE</option>
              </select>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
          </header>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {messages.map(message => (
              <div key={message.id} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-amber-500 text-slate-950' : 'bg-muted text-foreground'}`}>
                {message.text}
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />…</div>}
          </div>
          <form onSubmit={submitMessage} className="flex gap-2 border-t border-border p-3">
            <input value={text} onChange={event => setText(event.target.value)} placeholder={labels[lang].placeholder} aria-label={labels[lang].placeholder} disabled={busy} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="submit" disabled={busy || !text.trim()} aria-label="Send message" className="rounded-lg bg-amber-500 px-3 text-slate-950 disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close chat' : 'Open chat'} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xl transition-transform hover:scale-105">
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
