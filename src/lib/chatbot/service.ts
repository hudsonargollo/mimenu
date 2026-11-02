import {
  processChatbotMessage,
  ChatbotSessionState,
  ChatbotVenueContext,
  ChatbotMenuItem,
  ChatSource,
  ChatbotResponse,
  ReservationRequest,
  LearnedAnswer
} from './engine';

const RESERVATIONS_KEY = 'mimenu_chatbot_reservations_v1';
const SESSIONS_KEY = 'mimenu_chatbot_sessions_v1';

export interface PersistedReservationRecord {
  id: string;
  venue_id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  source: ChatSource;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  idempotency_key?: string | null;
  notes?: string | null;
}

interface StoredSession {
  language: ChatbotSessionState['language'];
  state: ChatbotSessionState;
  last_interaction: string;
}

const readReservations = (): PersistedReservationRecord[] => {
  try {
    const raw = localStorage.getItem(RESERVATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeReservations = (records: PersistedReservationRecord[]): void => {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(records));
};

const readSessions = (): Record<string, StoredSession> => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeSessions = (sessions: Record<string, StoredSession>): void => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

const sessionStorageKey = (venueId: string, sessionKey: string) =>
  `${venueId}:${sessionKey}`;

/**
 * Persists a pending reservation request in the local chatbot store.
 */
export async function saveReservation(
  request: ReservationRequest,
  notes?: string
): Promise<{ success: boolean; data?: PersistedReservationRecord; duplicate?: boolean; error?: string }> {
  try {
    if (!request.idempotencyKey) {
      return { success: false, error: 'A reservation idempotency key is required.' };
    }

    const reservations = readReservations();
    const existing = reservations.find(
      (record) =>
        record.venue_id === request.venueId &&
        record.idempotency_key === request.idempotencyKey
    );

    if (existing) {
      return { success: true, data: existing, duplicate: true };
    }

    const record: PersistedReservationRecord = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      venue_id: request.venueId,
      customer_name: request.customerName,
      customer_phone: request.customerPhone,
      party_size: request.partySize,
      reservation_date: request.reservationDate,
      reservation_time: request.reservationTime,
      source: request.source,
      status: 'pending',
      created_at: new Date().toISOString(),
      idempotency_key: request.idempotencyKey,
      notes: notes || null,
    };

    writeReservations([record, ...reservations]);
    return { success: true, data: record };
  } catch (err) {
    console.error('Unexpected error saving chatbot reservation:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Loads conversation session state from the local chatbot store.
 */
export async function loadSessionState(
  venueId: string,
  sessionKey: string
): Promise<ChatbotSessionState | null> {
  try {
    const session = readSessions()[sessionStorageKey(venueId, sessionKey)];
    if (!session?.state) return null;

    return {
      language: session.language || 'es',
      userName: session.state.userName,
      reservationDraft: session.state.reservationDraft || { step: 'idle' },
      lastReservation: session.state.lastReservation || undefined,
      pendingIntent: session.state.pendingIntent,
      pendingPartySize: session.state.pendingPartySize,
      pendingDate: session.state.pendingDate,
      pendingTime: session.state.pendingTime,
    };
  } catch (err) {
    console.error('Failed to load session state:', err);
    return null;
  }
}

/**
 * Persists conversation session state in the local chatbot store.
 */
export async function saveSessionState(
  venueId: string,
  sessionKey: string,
  state: ChatbotSessionState
): Promise<boolean> {
  try {
    const sessions = readSessions();
    sessions[sessionStorageKey(venueId, sessionKey)] = {
      language: state.language || 'es',
      state: {
        ...state,
        reservationDraft: state.reservationDraft || { step: 'idle' },
        lastReservation: state.lastReservation || undefined,
      },
      last_interaction: new Date().toISOString(),
    };
    writeSessions(sessions);
    return true;
  } catch (err) {
    console.error('Unexpected error saving session state:', err);
    return false;
  }
}

/**
 * Executes a full chatbot turn:
 * 1. Computes the engine response.
 * 2. If `create_reservation` is triggered, records it in the local reservation store.
 * 3. Persists updated session state, clearing the draft back to step: 'idle'.
 */
export async function handleChatTurn(
  message: string,
  currentState: ChatbotSessionState,
  venue: ChatbotVenueContext,
  menuItems: ChatbotMenuItem[] = [],
  sessionKey?: string,
  source: ChatSource = 'web',
  learnedAnswers: LearnedAnswer[] = []
): Promise<{
  response: ChatbotResponse;
  reservationSaved: boolean;
  reservationId?: string;
  sessionUpdated: boolean;
}> {
  const result = processChatbotMessage(message, currentState, venue, menuItems, source, learnedAnswers);
  let reservationSaved = false;
  let reservationId: string | undefined;
  let nextState = result.nextState;
  let reply = result.reply;

  if (result.actionRequired === 'create_reservation' && result.reservationData) {
    const saveRes = await saveReservation(result.reservationData);
    if (saveRes.success && saveRes.data) {
      reservationSaved = true;
      reservationId = saveRes.data.id;
      nextState = {
        ...result.nextState,
        lastReservation: {
          id: saveRes.data.id,
          customerName: saveRes.data.customer_name,
          customerPhone: saveRes.data.customer_phone,
          partySize: saveRes.data.party_size,
          reservationDate: saveRes.data.reservation_date,
          reservationTime: saveRes.data.reservation_time,
          idempotencyKey: result.reservationData.idempotencyKey!,
        },
      };
    } else {
      // Keep the confirmation step so the customer can safely retry.
      nextState = { ...currentState, reservationDraft: currentState.reservationDraft || result.nextState.reservationDraft };
      const failedReplies: Record<string, string> = {
        es: 'No pude guardar la solicitud. Tus datos siguen aquí; responde “sí” para volver a intentarlo.',
        en: 'I could not save the request. Your details are still here; reply “yes” to retry.',
        pt: 'Não consegui salvar a solicitação. Seus dados continuam aqui; responda “sim” para tentar novamente.',
        de: 'Die Anfrage konnte nicht gespeichert werden. Ihre Angaben sind noch vorhanden; antworten Sie mit „ja“, um es erneut zu versuchen.',
      };
      reply = failedReplies[result.detectedLang];
    }
  }

  let sessionUpdated = false;
  if (sessionKey) sessionUpdated = await saveSessionState(venue.id, sessionKey, nextState);

  return {
    response: { ...result, reply, nextState },
    reservationSaved,
    reservationId,
    sessionUpdated,
  };
}
