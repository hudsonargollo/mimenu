import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, ChevronUp, Send, X, Loader2, Mic, MicOff, Volume2, VolumeX, Pause } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { ChatbotLang, ChatbotSessionState, LearnedAnswer } from '@/lib/chatbot/engine';
import { handleChatTurn, loadSessionState, saveSessionState } from '@/lib/chatbot/service';
import { fetchLearnedAnswers, logConciergeTurn } from '@/lib/chatbot/conciergeApi';
import { pickLocalText } from '@/lib/venueContext';

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string; inputMode?: 'text' | 'voice' };

const labels: Record<ChatbotLang, { title: string; launcher: string; placeholder: string; welcome: string; error: string; privacy: string }> = {
  es: {
    title: 'Asistente',
    launcher: 'Asistente',
    placeholder: 'Escribe tu mensaje…',
    welcome: '¡Hola! Puedo ayudarte con el menú, horarios, ubicación y solicitudes de reserva.',
    error: 'No pude confirmar si tu solicitud quedó registrada. Vuelve a enviar la misma confirmación; si ya se guardó, no se creará otra reserva.',
    privacy: 'Esta conversación se registra para mejorar el asistente.'
  },
  en: {
    title: 'Assistant',
    launcher: 'Assistant',
    placeholder: 'Type a message…',
    welcome: 'Hi! I can help with the menu, hours, location, and reservation requests.',
    error: 'I could not confirm whether your request was recorded. Send the same confirmation again; if it was already saved, no duplicate request will be created.',
    privacy: 'This conversation is recorded to improve the assistant.'
  },
  pt: {
    title: 'Assistente',
    launcher: 'Assistente',
    placeholder: 'Digite sua mensagem…',
    welcome: 'Olá! Posso ajudar com o cardápio, horários, localização e solicitações de reserva.',
    error: 'Não consegui confirmar se sua solicitação foi registrada. Envie a mesma confirmação novamente; se já tiver sido salva, não será criada outra reserva.',
    privacy: 'Esta conversa é registrada para melhorar o assistente.'
  },
  de: {
    title: 'Assistent',
    launcher: 'Assistent',
    placeholder: 'Nachricht schreiben…',
    welcome: 'Hallo! Ich helfe bei Speisekarte, Öffnungszeiten, Anfahrt und Reservierungsanfragen.',
    error: 'Ich konnte nicht bestätigen, ob Ihre Anfrage gespeichert wurde. Senden Sie dieselbe Bestätigung erneut; falls sie bereits gespeichert ist, wird keine doppelte Anfrage erstellt.',
    privacy: 'Dieses Gespräch wird zur Verbesserung des Assistenten aufgezeichnet.'
  }
};

// Map ChatbotLang to BCP-47 language tags for Web Speech API (speech-to-text)
const LANG_TAGS: Record<ChatbotLang, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
  de: 'de-DE'
};

// Web Speech API type definitions (for speech-to-text input)
interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const W = typeof window !== 'undefined' ? (window as any) : {};
const SpeechRecognitionCtor: (new (opts?: { lang?: string; continuous?: boolean; interimResults?: boolean }) => SpeechRecognitionInstance) | null =
  W.SpeechRecognition || W.webkitSpeechRecognition || null;

export function MenuChatbot() {
  const { venue, categories } = useMimenu();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
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
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [learnedAnswers, setLearnedAnswers] = useState<LearnedAnswer[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const submitRef = useRef<(message: string, inputMode: 'text' | 'voice') => void>(() => {});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string | null>(null); // URL of audio waiting to play after current finishes

  useEffect(() => {
    let active = true;
    loadSessionState(venue.id, sessionKey).then(saved => {
      if (!active || !saved) return;
      setSessionState(saved);
      setLang(saved.language || 'es');
      if (saved.userName) {
        const l = saved.language || 'es';
        const personalized = labels[l].welcome
          .replace('¡Hola!', `¡Hola ${saved.userName}!`)
          .replace('Hello!', `Hi ${saved.userName}!`)
          .replace('Olá!', `Oi ${saved.userName}!`)
          .replace('Hallo!', `Hallo ${saved.userName}!`);
        setMessages([{ id: 'welcome', role: 'assistant', text: personalized }]);
      }
    });
    return () => { active = false; };
  }, [venue.id, sessionKey]);

  useEffect(() => {
    let active = true;
    fetchLearnedAnswers(venue.id).then(answers => {
      if (active) setLearnedAnswers(answers);
    });
    return () => { active = false; };
  }, [venue.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setCurrentlyPlaying(null);
      // Play queued audio if any
      if (audioQueueRef.current) {
        const next = audioQueueRef.current;
        audioQueueRef.current = null;
        setCurrentlyPlaying(next);
        audioRef.current!.src = next;
        audioRef.current!.play().catch(console.error);
      }
    };
    audioRef.current.onerror = () => {
      console.error('Audio playback failed');
      setCurrentlyPlaying(null);
    };
  }, []);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (!SpeechRecognitionCtor) return;
    const rec = new SpeechRecognitionCtor();
    rec.lang = LANG_TAGS[lang];
    rec.continuous = false;
    rec.interimResults = false;
    rec.addEventListener('result', (ev: unknown) => {
      const e = ev as { results: { transcript: string }[][] };
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setVoiceInputActive(false);
        submitRef.current(transcript.trim(), 'voice');
      }
    });
    rec.addEventListener('end', () => setVoiceInputActive(false));
    rec.addEventListener('error', (ev: unknown) => {
      const e = ev as { error: string };
      setVoiceInputActive(false);
      if (e.error === 'no-speech') return;
      console.error('Speech recognition error:', e.error);
    });
    recognitionRef.current = rec;
  }, [lang]);

  const menuItems = useMemo(() => categories.flatMap(category => category.items.map(item => {
    const dietary = item.dietary || [];
    return {
      id: item.id,
      name: pickLocalText(item.name_i18n, lang) || item.name,
      description: pickLocalText(item.description_i18n, lang) || item.description,
      price: item.price,
      category: pickLocalText(category.name_i18n, lang) || category.name,
      isAvailable: item.is_available,
      isFeatured: item.is_featured,
      isVegetarian: dietary.includes('Vegetariano') || dietary.includes('Vegetarian'),
      isVegan: dietary.includes('Vegan') || dietary.includes('Vegano'),
      isGlutenFree: dietary.includes('Sin Gluten') || dietary.includes('Gluten-Free'),
    };
  })), [categories, lang]);

  /** Fetches natural neural-voice audio from the Edge Function and plays it. */
  const playAudioFromTTS = useCallback(async (replyText: string, targetLang: ChatbotLang) => {
    if (!ttsEnabled || !audioRef.current) return;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, lang: targetLang }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('TTS fetch failed:', errorData.error || res.statusText);
        return;
      }
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (currentlyPlaying && audioRef.current.paused === false) {
        // Queue this audio to play after the current one finishes
        audioQueueRef.current = audioUrl;
      } else {
        setCurrentlyPlaying(audioUrl);
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(err => {
          console.error('Audio play error:', err);
          setCurrentlyPlaying(null);
        });
      }
    } catch (error) {
      console.error('TTS playback error:', error);
    }
  }, [ttsEnabled, currentlyPlaying]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentlyPlaying(null);
    audioQueueRef.current = null;
  };

  const handleSubmit = useCallback(async (message: string, inputMode: 'text' | 'voice') => {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    if (inputMode === 'text') setText('');
    setMessages(current => [...current, { id: `${Date.now()}-user`, role: 'user', text: trimmed, inputMode }]);
    setBusy(true);
    try {
      const result = await handleChatTurn(trimmed, sessionState, {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        phone: venue.phone,
        openingHours: venue.opening_hours,
        currency: venue.currency,
      }, menuItems, sessionKey, 'web', learnedAnswers);
      setSessionState(result.response.nextState);
      setLang(result.response.detectedLang);
      setMessages(current => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', text: result.response.reply, inputMode }]);
      logConciergeTurn({
        venueId: venue.id,
        sessionId: sessionKey,
        message: trimmed,
        reply: result.response.reply,
        lang: result.response.detectedLang,
        userName: result.response.nextState.userName,
        learnedId: result.response.learnedId,
        reservationSaved: result.reservationSaved,
      });
      // Speak the response only when the user's last input was via voice
      if (inputMode === 'voice' && ttsEnabled) {
        await playAudioFromTTS(result.response.reply, result.response.detectedLang);
      }
    } catch (error) {
      console.error('Chatbot turn failed:', error);
      setMessages(current => [...current, { id: `${Date.now()}-error`, role: 'assistant', text: labels[lang].error }]);
    } finally {
      setBusy(false);
    }
  }, [busy, sessionState, venue, menuItems, sessionKey, learnedAnswers, lang, ttsEnabled, playAudioFromTTS]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    await handleSubmit(text, 'text');
  };

  useEffect(() => {
    submitRef.current = (message, inputMode) => {
      void handleSubmit(message, inputMode);
    };
  }, [handleSubmit]);

  const toggleVoiceInput = () => {
    if (!SpeechRecognitionCtor) {
      alert('La API de voz no está disponible en este navegador. Prueba con Chrome o Edge.');
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;

    if (voiceInputActive) {
      rec.stop();
      setVoiceInputActive(false);
      return;
    }

    rec.lang = LANG_TAGS[lang];
    setVoiceInputActive(true);
    try {
      rec.start();
    } catch (err) {
      console.warn('SpeechRecognition start failed:', err);
    }
  };

  const toggleTts = () => {
    if (ttsEnabled) {
      stopAudio();
    }
    setTtsEnabled(!ttsEnabled);
  };

  const replayLastVoice = async () => {
    // Find the last assistant message that was triggered by voice input
    const lastVoiceReply = messages
      .slice()
      .reverse()
      .find(m => m.role === 'assistant' && m.inputMode === 'voice');
    if (lastVoiceReply) {
      await playAudioFromTTS(lastVoiceReply.text, lang);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="concierge-sheet"
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Cerrar chat"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={labels[lang].title}
              className="relative flex h-[min(88vh,760px)] w-full flex-col overflow-hidden rounded-t-[28px] border border-b-0 border-border bg-background shadow-[0_-20px_60px_-15px_rgba(2,6,23,0.5)] sm:h-[min(82vh,720px)] sm:max-w-2xl sm:rounded-t-[32px]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <header className="bg-slate-900 px-4 pb-3 pt-2 text-white">
                <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-white/20" aria-hidden="true" />
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">{labels[lang].title}</p>
                    <p className="truncate text-xs text-slate-300">{venue.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {currentlyPlaying && (
                      <button
                        type="button"
                        onClick={stopAudio}
                        aria-label="Detener audio"
                        className="rounded p-1 text-amber-300 hover:bg-white/10"
                        title="Detener audio"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleTts}
                      aria-label={ttsEnabled ? 'Desactivar voz' : 'Activar voz'}
                      className={`rounded p-1 hover:bg-white/10 ${ttsEnabled ? 'text-amber-400' : 'text-slate-500'}`}
                      title={ttsEnabled ? 'Voz natural ON' : 'Voz natural OFF'}
                    >
                      {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                    <select
                      aria-label="Idioma del chat"
                      value={lang}
                      onChange={event => {
                        const language = event.target.value as ChatbotLang;
                        setLang(language);
                        const updated = { ...sessionState, language };
                        setSessionState(updated);
                        void saveSessionState(venue.id, sessionKey, updated);
                      }}
                      className="rounded-md border border-white/20 bg-slate-800 px-2 py-1 text-xs text-white"
                    >
                      <option value="es">ES</option>
                      <option value="en">EN</option>
                      <option value="pt">PT</option>
                      <option value="de">DE</option>
                    </select>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="rounded-md p-1 hover:bg-white/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </header>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      message.role === 'user' ? 'ml-auto bg-amber-500 text-slate-950' : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.text}
                    {message.role === 'assistant' && message.inputMode === 'voice' && (
                      <button
                        type="button"
                        onClick={replayLastVoice}
                        aria-label="Repetir mensaje"
                        className="mt-1 rounded-md p-1 text-muted-foreground hover:bg-muted-foreground/10"
                        title="Repetir voz"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />…</div>}
              </div>
              <form onSubmit={submitMessage} className="border-t border-border px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={event => setText(event.target.value)}
                    placeholder={labels[lang].placeholder}
                    aria-label={labels[lang].placeholder}
                    disabled={busy}
                    className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {SpeechRecognitionCtor && (
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={busy || voiceInputActive}
                      aria-label={voiceInputActive ? 'Detener grabación' : 'Hablar'}
                      title={voiceInputActive ? 'Detener' : 'Hablar (reconocimiento de voz)'}
                      className={`rounded-xl px-2.5 text-slate-950 transition-colors disabled:opacity-50 ${
                        voiceInputActive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-amber-400 hover:bg-amber-500'
                      }`}
                    >
                      {voiceInputActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy || !text.trim()}
                    aria-label="Enviar mensaje"
                    className="rounded-xl bg-amber-500 px-3.5 text-slate-950 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] leading-tight text-muted-foreground">{labels[lang].privacy}</p>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div
          className="fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: `calc(${cartCount > 0 ? '5.5rem' : '1rem'} + env(safe-area-inset-bottom))` }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-slate-900 py-2.5 pl-2.5 pr-4 text-white shadow-xl shadow-slate-950/20 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950">
              <Bot className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">{labels[lang].launcher}</span>
            <ChevronUp className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
