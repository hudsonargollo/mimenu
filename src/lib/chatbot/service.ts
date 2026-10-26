import { supabase } from '@/integrations/supabase/client';
import {
  processChatbotMessage,
  ChatbotSessionState,
  ChatbotVenueContext,
  ChatbotMenuItem,
  ChatSource,
  ChatbotResponse,
  ReservationRequest
} from './engine';

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
}

/**
 * Persists a pending reservation request to public.chatbot_reservations.
 */
export async function saveReservation(
  request: ReservationRequest,
  notes?: string
): Promise<{ success: boolean; data?: PersistedReservationRecord; duplicate?: boolean; error?: string }> {
  try {
    if (!request.idempotencyKey) {
      return { success: false, error: 'A reservation idempotency key is required.' };
    }
    const payload = {
      venue_id: request.venueId,
      customer_name: request.customerName,
      customer_phone: request.customerPhone,
      party_size: request.partySize,
      reservation_date: request.reservationDate,
      reservation_time: request.reservationTime,
      source: request.source,
      status: 'pending',
      notes: notes || null,
      idempotency_key: request.idempotencyKey,
    };
    const { data, error } = await supabase
      .from('chatbot_reservations')
      .insert(payload)
      .select()
      .single();

    if (!error && data) return { success: true, data: data as PersistedReservationRecord };

    // Concurrent/replayed confirmation is resolved through the unique DB key.
    if (error?.code === '23505') {
      const existing = await supabase
        .from('chatbot_reservations')
        .select('*')
        .eq('venue_id', request.venueId)
        .eq('idempotency_key', request.idempotencyKey)
        .maybeSingle();
      if (!existing.error && existing.data) {
        return { success: true, data: existing.data as PersistedReservationRecord, duplicate: true };
      }
    }

    console.error('Error inserting chatbot reservation:', error);
    return { success: false, error: error?.message || 'Reservation could not be saved.' };
  } catch (err: any) {
    console.error('Unexpected error saving chatbot reservation:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Loads conversation session state from public.chatbot_sessions.
 */
export async function loadSessionState(
  venueId: string,
  sessionKey: string
): Promise<ChatbotSessionState | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_sessions')
      .select('language, state')
      .eq('venue_id', venueId)
      .eq('session_key', sessionKey)
      .maybeSingle();

    if (error || !data) return null;

    return {
      language: (data.language as any) || 'es',
      userName: data.state?.userName,
      reservationDraft: data.state?.reservationDraft || { step: 'idle' },
      lastReservation: data.state?.lastReservation || undefined
    };
  } catch (err) {
    console.error('Failed to load session state:', err);
    return null;
  }
}

/**
 * Persists conversation session state into public.chatbot_sessions.
 */
export async function saveSessionState(
  venueId: string,
  sessionKey: string,
  state: ChatbotSessionState
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_sessions')
      .upsert({
        venue_id: venueId,
        session_key: sessionKey,
        language: state.language || 'es',
        state: {
          userName: state.userName,
          reservationDraft: state.reservationDraft || { step: 'idle' },
          lastReservation: state.lastReservation || null
        },
        last_interaction: new Date().toISOString()
      }, {
        onConflict: 'venue_id,session_key'
      });

    if (error) {
      console.error('Failed to save session state:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error saving session state:', err);
    return false;
  }
}

/**
 * Executes a full chatbot turn:
 * 1. Computes the engine response.
 * 2. If `create_reservation` is triggered, records it into `chatbot_reservations`.
 * 3. Persists updated session state to `chatbot_sessions` (clearing draft to step: 'idle').
 */
export async function handleChatTurn(
  message: string,
  currentState: ChatbotSessionState,
  venue: ChatbotVenueContext,
  menuItems: ChatbotMenuItem[] = [],
  sessionKey?: string,
  source: ChatSource = 'web'
): Promise<{
  response: ChatbotResponse;
  reservationSaved: boolean;
  reservationId?: string;
  sessionUpdated: boolean;
}> {
  const result = processChatbotMessage(message, currentState, venue, menuItems, source);
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
