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
}

/**
 * Persists a pending reservation request to public.chatbot_reservations.
 */
export async function saveReservation(
  request: ReservationRequest,
  notes?: string
): Promise<{ success: boolean; data?: PersistedReservationRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('chatbot_reservations')
      .insert({
        venue_id: request.venueId,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        party_size: request.partySize,
        reservation_date: request.reservationDate,
        reservation_time: request.reservationTime,
        source: request.source,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting chatbot reservation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PersistedReservationRecord };
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
      reservationDraft: data.state?.reservationDraft || { step: 'idle' }
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
          reservationDraft: state.reservationDraft || { step: 'idle' }
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

  if (result.actionRequired === 'create_reservation' && result.reservationData) {
    const saveRes = await saveReservation(result.reservationData);
    if (saveRes.success && saveRes.data) {
      reservationSaved = true;
      reservationId = saveRes.data.id;
    }
  }

  let sessionUpdated = false;
  if (sessionKey) {
    sessionUpdated = await saveSessionState(venue.id, sessionKey, result.nextState);
  }

  return {
    response: result,
    reservationSaved,
    reservationId,
    sessionUpdated
  };
}
