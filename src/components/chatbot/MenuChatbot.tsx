import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Keyboard, Loader2, Mic, MicOff, Pause, Send, Volume2, VolumeX, X } from 'lucide-react';
import { useMimenu } from '@/lib/mimenuContext';
import { useCart } from '@/lib/cartContext';
import { ChatbotLang, ChatbotSessionState, LearnedAnswer } from '@/lib/chatbot/engine';
import { handleChatTurn, loadSessionState, saveSessionState } from '@/lib/chatbot/service';
import { fetchLearnedAnswers, logConciergeTurn } from '@/lib/chatbot/conciergeApi';
import { pickLocalText } from '@/lib/venueContext';
import { ConciergeOrb, OrbState } from './ConciergeOrb';

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string; inputMode?: 'text' | 'voice'; lang?: ChatbotLang };
type ConciergeMode = 'text' | 'voice';

type ChatLabels = {
  title: string;
  launcher: string;
  placeholder: string;
  welcome: string;
  error: string;
  privacy: string;
  modeGroup: string;
  modeText: string;
  modeVoice: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  writeInstead: string;
  playReply: string;
  stopSpeaking: string;
  stopListening: string;
  speakOnce: string;
  noSpeech: string;
  micDenied: string;
  voiceUnsupported: string;
};

const labels: Record<ChatbotLang, ChatLabels> = {
  es: {
    title: 'Asistente',
    launcher: 'Asistente',
    placeholder: 'Escribe tu mensaje…',
    welcome: '¡Hola! Puedo ayudarte con el menú, horarios, ubicación y solicitudes de reserva.',
    error: 'No pude confirmar si tu solicitud quedó registrada. Vuelve a enviar la misma confirmación; si ya se guardó, no se creará otra reserva.',
    privacy: 'Esta conversación se registra para mejorar el asistente.',
    modeGroup: 'Modo de conversación',
    modeText: 'Texto',
    modeVoice: 'Voz',
    tapToSpeak: 'Toca el orbe y habla',
    listening: 'Te escucho…',
    thinking: 'Pensando…',
    speaking: 'Hablando…',
    writeInstead: 'Prefiero escribir',
    playReply: 'Escuchar respuesta',
    stopSpeaking: 'Detener audio',
    stopListening: 'Detener micrófono',
    speakOnce: 'Hablar',
    noSpeech: 'No te escuché. Toca el orbe para intentar de nuevo.',
    micDenied: 'No pude acceder al micrófono. Revisa los permisos del navegador.',
    voiceUnsupported: 'Este navegador no admite conversación por voz. Puedes escribir tu mensaje.'
  },
  en: {
    title: 'Assistant',
    launcher: 'Assistant',
    placeholder: 'Type a message…',
    welcome: 'Hi! I can help with the menu, hours, location, and reservation requests.',
    error: 'I could not confirm whether your request was recorded. Send the same confirmation again; if it was already saved, no duplicate request will be created.',
    privacy: 'This conversation is recorded to improve the assistant.',
    modeGroup: 'Conversation mode',
    modeText: 'Text',
    modeVoice: 'Voice',
    tapToSpeak: 'Tap the orb and speak',
    listening: 'Listening…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
    writeInstead: "I'd rather type",
    playReply: 'Play reply',
    stopSpeaking: 'Stop audio',
    stopListening: 'Stop microphone',
    speakOnce: 'Speak',
    noSpeech: "I didn't catch that. Tap the orb to try again.",
    micDenied: "I couldn't access the microphone. Check your browser permissions.",
    voiceUnsupported: "This browser doesn't support voice conversation. You can type instead."
  },
  pt: {
    title: 'Assistente',
    launcher: 'Assistente',
    placeholder: 'Digite sua mensagem…',
    welcome: 'Olá! Posso ajudar com o cardápio, horários, localização e solicitações de reserva.',
    error: 'Não consegui confirmar se sua solicitação foi registrada. Envie a mesma confirmação novamente; se já tiver sido salva, não será criada outra reserva.',
    privacy: 'Esta conversa é registrada para melhorar o assistente.',
    modeGroup: 'Modo de conversa',
    modeText: 'Texto',
    modeVoice: 'Voz',
    tapToSpeak: 'Toque no orbe e fale',
    listening: 'Estou ouvindo…',
    thinking: 'Pensando…',
    speaking: 'Falando…',
    writeInstead: 'Prefiro digitar',
    playReply: 'Ouvir resposta',
    stopSpeaking: 'Parar áudio',
    stopListening: 'Parar microfone',
    speakOnce: 'Falar',
    noSpeech: 'Não te ouvi. Toque no orbe para tentar de novo.',
    micDenied: 'Não consegui acessar o microfone. Verifique as permissões do navegador.',
    voiceUnsupported: 'Este navegador não oferece conversa por voz. Você pode digitar.'
  },
  de: {
    title: 'Assistent',
    launcher: 'Assistent',
    placeholder: 'Nachricht schreiben…',
    welcome: 'Hallo! Ich helfe bei Speisekarte, Öffnungszeiten, Anfahrt und Reservierungsanfragen.',
    error: 'Ich konnte nicht bestätigen, ob Ihre Anfrage gespeichert wurde. Senden Sie dieselbe Bestätigung erneut; falls sie bereits gespeichert ist, wird keine doppelte Anfrage erstellt.',
    privacy: 'Dieses Gespräch wird zur Verbesserung des Assistenten aufgezeichnet.',
    modeGroup: 'Gesprächsmodus',
    modeText: 'Text',
    modeVoice: 'Stimme',
    tapToSpeak: 'Tippe auf den Orb und sprich',
    listening: 'Ich höre zu…',
    thinking: 'Denke nach…',
    speaking: 'Spreche…',
    writeInstead: 'Lieber tippen',
    playReply: 'Antwort anhören',
    stopSpeaking: 'Audio stoppen',
    stopListening: 'Mikrofon stoppen',
    speakOnce: 'Sprechen',
    noSpeech: 'Ich habe dich nicht verstanden. Tippe auf den Orb.',
    micDenied: 'Kein Zugriff auf das Mikrofon. Prüfe die Browser-Berechtigungen.',
    voiceUnsupported: 'Dieser Browser unterstützt keine Sprachunterhaltung. Du kannst tippen.'
  }
};

// Map ChatbotLang to BCP-47 language tags for Web Speech API
const LANG_TAGS: Record<ChatbotLang, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
  de: 'de-DE'
};

const MODE_STORAGE_KEY = 'mimenu-concierge-mode';

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

interface SpeechResultList {
  isFinal: boolean;
  0?: { transcript?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const W = typeof window !== 'undefined' ? (window as any) : {};
const SpeechRecognitionCtor: (new (opts?: { lang?: string; continuous?: boolean; interimResults?: boolean }) => SpeechRecognitionInstance) | null =
  W.SpeechRecognition || W.webkitSpeechRecognition || null;

const readStoredMode = (): ConciergeMode => {
  if (!SpeechRecognitionCtor) return 'text';
  try {
    return window.localStorage.getItem(MODE_STORAGE_KEY) === 'voice' ? 'voice' : 'text';
  } catch {
    return 'text';
  }
};

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
  const [mode, setMode] = useState<ConciergeMode>(readStoredMode);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [learnedAnswers, setLearnedAnswers] = useState<LearnedAnswer[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const submitRef = useRef<(message: string, inputMode: 'text' | 'voice') => void>(() => {});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const audioResolveRef = useRef<((played: boolean) => void) | null>(null);
  const browserSpeechResolveRef = useRef<(() => void) | null>(null);
  const speechGenerationRef = useRef(0);

  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const busyRef = useRef(false);
  const openRef = useRef(false);
  const modeRef = useRef(mode);
  const langRef = useRef(lang);
  const audioEnabledRef = useRef(ttsEnabled);
  const startListeningRef = useRef<() => void>(() => {});

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
  }, [messages, busy, open, interim]);

  useEffect(() => {
    openRef.current = open;
    if (!open) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      listeningRef.current = false;
      setListening(false);
      setInterim('');
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      if (modeRef.current === 'text') inputRef.current?.focus();
    }, 320);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    audioEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  /** Stops whatever is being spoken (neural MP3 or browser speech). */
  const stopSpeech = useCallback(() => {
    speechGenerationRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
    }
    releaseObjectUrl();
    const resolveAudio = audioResolveRef.current;
    audioResolveRef.current = null;
    resolveAudio?.(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const resolveBrowser = browserSpeechResolveRef.current;
    browserSpeechResolveRef.current = null;
    resolveBrowser?.();
    speakingRef.current = false;
    setSpeaking(false);
    setSpeakingId(null);
  }, [releaseObjectUrl]);

  useEffect(() => {
    if (open) return;
    stopSpeech();
    setVoiceNote(null);
  }, [open, stopSpeech]);

  const fetchTtsAudio = useCallback(async (replyText: string, targetLang: ChatbotLang): Promise<Blob | null> => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, lang: targetLang }),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      return blob.size > 0 ? blob : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }, []);

  const playAudioBlob = useCallback((blob: Blob) => new Promise<boolean>(resolve => {
    const audio = audioRef.current;
    if (!audio) {
      resolve(false);
      return;
    }
    releaseObjectUrl();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    audioResolveRef.current = resolve;
    const settle = (played: boolean) => {
      if (audioResolveRef.current !== resolve) return;
      audioResolveRef.current = null;
      audio.onended = null;
      audio.onerror = null;
      resolve(played);
    };
    audio.onended = () => settle(true);
    audio.onerror = () => settle(false);
    audio.src = url;
    audio.play().catch(() => settle(false));
  }), [releaseObjectUrl]);

  /** Last-resort voice: the browser's own speech engine, no network needed. */
  const speakWithBrowser = useCallback((replyText: string, targetLang: ChatbotLang) => new Promise<void>(resolve => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(replyText);
    utterance.lang = LANG_TAGS[targetLang];
    utterance.rate = 1.02;
    const voices = synth.getVoices();
    const matchedVoice = voices.find(voice => voice.lang?.toLowerCase().startsWith(targetLang));
    if (matchedVoice) utterance.voice = matchedVoice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      browserSpeechResolveRef.current = null;
      resolve();
    };
    browserSpeechResolveRef.current = finish;
    utterance.onend = finish;
    utterance.onerror = finish;
    try {
      synth.speak(utterance);
    } catch {
      finish();
    }
  }), []);

  const resumeListening = useCallback(() => {
    window.setTimeout(() => {
      if (!openRef.current || modeRef.current !== 'voice' || busyRef.current || speakingRef.current || listeningRef.current) return;
      startListeningRef.current();
    }, 380);
  }, []);

  /** Plays a reply, preferring the neural service and falling back to the browser voice. */
  const speakText = useCallback(async (replyText: string, targetLang: ChatbotLang, messageId: string) => {
    stopSpeech();
    const generation = speechGenerationRef.current;
    speakingRef.current = true;
    setSpeaking(true);
    setSpeakingId(messageId);
    try {
      const blob = await fetchTtsAudio(replyText, targetLang);
      if (speechGenerationRef.current !== generation) return;
      if (blob) {
        const played = await playAudioBlob(blob);
        if (speechGenerationRef.current !== generation) return;
        if (played) return;
      }
      await speakWithBrowser(replyText, targetLang);
    } finally {
      if (speechGenerationRef.current === generation) {
        speakingRef.current = false;
        setSpeaking(false);
        setSpeakingId(null);
        if (openRef.current && modeRef.current === 'voice') resumeListening();
      }
    }
  }, [fetchTtsAudio, playAudioBlob, speakWithBrowser, resumeListening, stopSpeech]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setVoiceNote(labels[langRef.current].voiceUnsupported);
      return;
    }
    if (busyRef.current || speakingRef.current || listeningRef.current) return;
    const rec = recognitionRef.current;
    if (!rec) return;
    stopSpeech();
    rec.lang = LANG_TAGS[langRef.current] ?? 'es-ES';
    try {
      rec.start();
      listeningRef.current = true;
      setListening(true);
      setInterim('');
      setVoiceNote(null);
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, [stopSpeech]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    listeningRef.current = false;
    setListening(false);
    setInterim('');
  }, []);

  const changeMode = useCallback((next: ConciergeMode) => {
    if (next === 'voice' && !SpeechRecognitionCtor) {
      setVoiceNote(labels[langRef.current].voiceUnsupported);
      return;
    }
    if (next === 'text') {
      stopListening();
      stopSpeech();
    }
    setMode(next);
  }, [stopListening, stopSpeech]);

  useEffect(() => {
    modeRef.current = mode;
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      /* storage can be disabled */
    }
    if (mode === 'text') {
      stopListening();
      stopSpeech();
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [mode, stopListening, stopSpeech]);

  // Auto-listen when the sheet opens in voice mode, and whenever you switch into it.
  useEffect(() => {
    if (!open || mode !== 'voice' || !SpeechRecognitionCtor) return;
    const timer = window.setTimeout(() => startListeningRef.current(), 520);
    return () => window.clearTimeout(timer);
  }, [open, mode]);

  // Initialize SpeechRecognition once; handlers read live values through refs.
  useEffect(() => {
    if (!SpeechRecognitionCtor) return;
    const rec = new SpeechRecognitionCtor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = LANG_TAGS[langRef.current] ?? 'es-ES';

    rec.addEventListener('result', (ev: unknown) => {
      const e = ev as { results?: ArrayLike<SpeechResultList> };
      const results = e.results;
      if (!results) return;
      let transcript = '';
      let isFinal = false;
      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        transcript += result?.[0]?.transcript ?? '';
        if (result?.isFinal) isFinal = true;
      }
      transcript = transcript.trim();
      if (!transcript) return;
      setInterim(transcript);
      if (!isFinal) return;
      setInterim('');
      listeningRef.current = false;
      setListening(false);
      submitRef.current(transcript, 'voice');
    });

    rec.addEventListener('end', () => {
      listeningRef.current = false;
      setListening(false);
      setInterim('');
    });

    rec.addEventListener('error', (ev: unknown) => {
      const error = (ev as { error?: string }).error ?? '';
      listeningRef.current = false;
      setListening(false);
      setInterim('');
      if (error === 'no-speech') {
        setVoiceNote(labels[langRef.current].noSpeech);
        return;
      }
      if (error === 'aborted') return;
      if (error === 'not-allowed' || error === 'service-not-allowed' || error === 'audio-capture') {
        setVoiceNote(labels[langRef.current].micDenied);
        return;
      }
      console.warn('Speech recognition error:', error);
    });

    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* noop */ }
      recognitionRef.current = null;
    };
  }, []);

  // Free audio resources on unmount.
  useEffect(() => () => {
    speechGenerationRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const menuItems = useMemo(() => {
    // Menu content only ships es/en/pt; German conversations read the Spanish text.
    const contentLang = lang === 'de' ? 'es' : lang;
    return categories.flatMap(category => category.items.map(item => {
      const dietary = item.dietary || [];
      return {
        id: item.id,
        name: pickLocalText(item.name_i18n, contentLang) || item.name,
        description: pickLocalText(item.description_i18n, contentLang) || item.description,
        price: item.price,
        category: pickLocalText(category.name_i18n, contentLang) || category.name,
        isAvailable: item.is_available,
        isFeatured: item.is_featured,
        isVegetarian: dietary.includes('Vegetariano') || dietary.includes('Vegetarian'),
        isVegan: dietary.includes('Vegan') || dietary.includes('Vegano'),
        isGlutenFree: dietary.includes('Sin Gluten') || dietary.includes('Gluten-Free'),
      };
    }));
  }, [categories, lang]);

  const handleSubmit = useCallback(async (message: string, inputMode: 'text' | 'voice') => {
    const trimmed = message.trim();
    if (!trimmed || busyRef.current) return;
    if (listeningRef.current) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      listeningRef.current = false;
      setListening(false);
      setInterim('');
    }
    if (inputMode === 'text') setText('');
    setVoiceNote(null);
    setMessages(current => [...current, { id: `${Date.now()}-user`, role: 'user', text: trimmed, inputMode }]);
    busyRef.current = true;
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
      const replyId = `${Date.now()}-assistant`;
      setMessages(current => [...current, {
        id: replyId,
        role: 'assistant',
        text: result.response.reply,
        inputMode,
        lang: result.response.detectedLang,
      }]);
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
      const shouldSpeak = audioEnabledRef.current && (inputMode === 'voice' || modeRef.current === 'voice');
      if (shouldSpeak) {
        await speakText(result.response.reply, result.response.detectedLang, replyId);
      } else if (modeRef.current === 'voice') {
        resumeListening();
      }
    } catch (error) {
      console.error('Chatbot turn failed:', error);
      const errorId = `${Date.now()}-error`;
      const errorText = labels[langRef.current].error;
      setMessages(current => [...current, { id: errorId, role: 'assistant', text: errorText, lang: langRef.current }]);
      if (modeRef.current === 'voice') {
        await speakText(errorText, langRef.current, errorId);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [sessionState, venue, menuItems, sessionKey, learnedAnswers, speakText, resumeListening]);

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    await handleSubmit(text, 'text');
  };

  useEffect(() => {
    submitRef.current = (message, inputMode) => {
      void handleSubmit(message, inputMode);
    };
  }, [handleSubmit]);

  const toggleTts = () => {
    if (ttsEnabled) stopSpeech();
    setTtsEnabled(!ttsEnabled);
  };

  const handlePlayMessage = (message: ChatMessage) => {
    if (speakingId === message.id && speaking) {
      stopSpeech();
      return;
    }
    void speakText(message.text, message.lang ?? lang, message.id);
  };

  const handleOrbPress = () => {
    if (listening) {
      stopListening();
      return;
    }
    if (speaking) {
      stopSpeech();
    }
    startListening();
  };

  const orbState: OrbState = busy ? 'thinking' : speaking ? 'speaking' : listening ? 'listening' : 'idle';
  const voiceStatus = busy
    ? labels[lang].thinking
    : speaking
      ? labels[lang].speaking
      : listening
        ? labels[lang].listening
        : labels[lang].tapToSpeak;
  const modeToggle = SpeechRecognitionCtor !== null;

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
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              aria-label="Cerrar chat"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#050507]/70 backdrop-blur-md"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={labels[lang].title}
              className="relative flex h-[min(92vh,820px)] w-full flex-col overflow-hidden rounded-t-[32px] border-x border-t border-[#E8C15A]/15 bg-[#0B0B0E] shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.9)] sm:h-[min(85vh,760px)] sm:max-w-xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            >
              <div
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#E8C15A]/70 to-transparent"
                aria-hidden="true"
              />
              <header className="relative bg-gradient-to-b from-[#121217] to-[#0B0B0E] px-5 pb-4 pt-3">
                <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#E8C15A]/30" aria-hidden="true" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ConciergeOrb size={42} state={orbState} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#C8B26A]">
                        Concierge
                      </p>
                      <p className="truncate font-display text-lg leading-tight text-[#F5E7C1]">
                        {labels[lang].title}
                      </p>
                      <p className="truncate text-[11px] text-[#9A9484]">{venue.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar chat"
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-[#C8B26A] transition-colors hover:border-[#E8C15A]/40 hover:text-[#F5D68A]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3.5 flex items-center justify-between gap-2">
                  <div
                    role="group"
                    aria-label={labels[lang].modeGroup}
                    className="flex rounded-full border border-white/10 bg-black/40 p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => changeMode('text')}
                      aria-pressed={mode === 'text'}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        mode === 'text'
                          ? 'bg-gradient-to-b from-[#F5D68A] to-[#D9A93F] text-[#1A1408]'
                          : 'text-[#9A9484] hover:text-[#EDEAE0]'
                      }`}
                    >
                      <Keyboard className="h-3 w-3" aria-hidden="true" />
                      {labels[lang].modeText}
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMode('voice')}
                      aria-pressed={mode === 'voice'}
                      disabled={!modeToggle}
                      title={!modeToggle ? labels[lang].voiceUnsupported : undefined}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        mode === 'voice'
                          ? 'bg-gradient-to-b from-[#F5D68A] to-[#D9A93F] text-[#1A1408]'
                          : 'text-[#9A9484] hover:text-[#EDEAE0]'
                      }`}
                    >
                      <Mic className="h-3 w-3" aria-hidden="true" />
                      {labels[lang].modeVoice}
                    </button>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {speaking && (
                      <button
                        type="button"
                        onClick={stopSpeech}
                        aria-label={labels[lang].stopSpeaking}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-[#F5D68A] transition-colors hover:border-[#E8C15A]/40"
                        title={labels[lang].stopSpeaking}
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleTts}
                      aria-label={ttsEnabled ? 'Desactivar voz' : 'Activar voz'}
                      className={`rounded-full border border-white/10 bg-white/5 p-1.5 transition-colors hover:border-[#E8C15A]/40 ${
                        ttsEnabled ? 'text-[#F5D68A]' : 'text-[#6B6B75]'
                      }`}
                      title={ttsEnabled ? 'Voz ON' : 'Voz OFF'}
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
                      className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-[#EDEAE0] outline-none transition-colors focus:border-[#E8C15A]/50"
                    >
                      <option value="es">ES</option>
                      <option value="en">EN</option>
                      <option value="pt">PT</option>
                      <option value="de">DE</option>
                    </select>
                  </div>
                </div>
              </header>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'ml-auto rounded-2xl rounded-br-md bg-gradient-to-br from-[#F5D68A] via-[#E8C15A] to-[#C9973C] text-[#1A1408] shadow-[0_8px_24px_-10px_rgba(232,193,90,0.45)]'
                        : 'rounded-2xl rounded-bl-md border border-white/5 bg-[#16161C] text-[#EDEAE0]'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="flex items-end gap-2">
                        <span className="min-w-0 flex-1 whitespace-pre-wrap">{message.text}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayMessage(message)}
                          aria-label={
                            speakingId === message.id && speaking
                              ? labels[lang].stopSpeaking
                              : labels[lang].playReply
                          }
                          className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-transparent bg-transparent text-[#C8B26A] transition-colors hover:bg-[#E8C15A]/10 hover:text-[#F5D68A]"
                          title={
                            speakingId === message.id && speaking
                              ? labels[lang].stopSpeaking
                              : labels[lang].playReply
                          }
                        >
                          {speakingId === message.id && speaking ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{message.text}</span>
                    )}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 px-1 text-xs text-[#C8B26A]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />…
                  </div>
                )}
              </div>
              {mode === 'voice' ? (
                <div className="border-t border-white/5 bg-gradient-to-t from-[#08080A] to-[#0B0B0E] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex flex-col items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={handleOrbPress}
                      aria-label={listening ? labels[lang].stopListening : labels[lang].tapToSpeak}
                      title={listening ? labels[lang].stopListening : labels[lang].tapToSpeak}
                      whileTap={{ scale: 0.94 }}
                      className="rounded-full border-transparent bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#E8C15A]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0E]"
                    >
                      <ConciergeOrb size={92} state={orbState} />
                    </motion.button>
                    <p className="font-display text-base text-[#F5E7C1]" aria-live="polite">
                      {voiceStatus}
                    </p>
                    {interim && (
                      <p className="max-w-[90%] truncate font-reel text-sm italic text-[#C8B26A]">
                        “{interim}”
                      </p>
                    )}
                    {voiceNote && (
                      <p className="max-w-[90%] text-center text-[11px] text-[#9A9484]">{voiceNote}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => changeMode('text')}
                      className="border-transparent bg-transparent px-1 py-0.5 text-[11px] font-medium text-[#9A9484] underline decoration-[#E8C15A]/40 underline-offset-2 transition-colors hover:text-[#F5E7C1]"
                    >
                      {labels[lang].writeInstead}
                    </button>
                    <p className="text-center text-[10px] leading-tight text-[#6B6B75]">
                      {labels[lang].privacy}
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={submitMessage}
                  className="border-t border-white/5 bg-[#0B0B0E] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3"
                >
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={event => setText(event.target.value)}
                      placeholder={labels[lang].placeholder}
                      aria-label={labels[lang].placeholder}
                      disabled={busy}
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#14141A] px-4 py-3 text-sm text-[#EDEAE0] outline-none transition-colors placeholder:text-[#6B6B75] focus:border-[#E8C15A]/50 focus:ring-1 focus:ring-[#E8C15A]/40"
                    />
                    {SpeechRecognitionCtor && (
                      <button
                        type="button"
                        onClick={() => (listening ? stopListening() : startListening())}
                        disabled={busy}
                        aria-label={listening ? labels[lang].stopListening : labels[lang].speakOnce}
                        title={listening ? labels[lang].stopListening : labels[lang].speakOnce}
                        className={`rounded-2xl border px-3 transition-colors disabled:opacity-50 ${
                          listening
                            ? 'border-transparent bg-rose-500 text-white hover:bg-rose-600'
                            : 'border-[#E8C15A]/30 bg-[#1C1C23] text-[#F5D68A] hover:bg-[#E8C15A]/10'
                        }`}
                      >
                        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={busy || !text.trim()}
                      aria-label="Enviar mensaje"
                      className="rounded-2xl bg-gradient-to-b from-[#F5D68A] to-[#D9A93F] px-4 text-[#1A1408] shadow-[0_8px_20px_-8px_rgba(232,193,90,0.6)] transition-opacity disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  {listening && (
                    <p className="mt-2 text-center text-[11px] text-[#E8C15A]">
                      {labels[lang].listening}
                    </p>
                  )}
                  {!listening && voiceNote && (
                    <p className="mt-2 text-center text-[11px] text-[#9A9484]">{voiceNote}</p>
                  )}
                  <p className="mt-2 text-center text-[10px] leading-tight text-[#6B6B75]">
                    {labels[lang].privacy}
                  </p>
                </form>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div
          className="fixed inset-x-0 z-40 flex justify-center px-4"
          style={{ bottom: `calc(${cartCount > 0 ? '5.5rem' : '1rem'} + env(safe-area-inset-bottom))` }}
        >
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2.5 rounded-full border border-[#E8C15A]/25 bg-[#0B0B0E]/95 py-1.5 pl-1.5 pr-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),0_0_24px_-6px_rgba(232,193,90,0.35)] backdrop-blur transition-transform hover:-translate-y-0.5"
          >
            <ConciergeOrb size={44} state="idle" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#C8B26A]">
                Concierge
              </span>
              <span className="font-display text-[15px] text-[#F5E7C1]">{labels[lang].launcher}</span>
            </span>
            <ChevronUp
              className="h-4 w-4 text-[#E8C15A] transition-transform group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </motion.button>
        </div>
      )}
    </>
  );
}
