import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleChatTurn, saveReservation } from './service';
import { supabase } from '@/integrations/supabase/client';
import { ChatbotSessionState, ChatbotVenueContext, processChatbotMessage } from './engine';

vi.mock('@/integrations/supabase/client', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock,
    },
  };
});

describe('Chatbot Reservation Integration & Idempotency', () => {
  const venue: ChatbotVenueContext = {
    id: 'venue-123',
    name: 'Restaurante Central',
    address: 'Av. Libertador 100',
    phone: '+591 70000000',
    openingHours: '12:00 - 23:00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records a new pending reservation on user confirmation', async () => {
    const insertedRecord = {
      id: 'res-abc-001',
      venue_id: 'venue-123',
      customer_name: 'Carlos',
      customer_phone: '+59171234567',
      party_size: 4,
      reservation_date: '2026-10-30',
      reservation_time: '20:00',
      source: 'web',
      status: 'pending',
      idempotency_key: 'idem-key-1',
      created_at: '2026-10-23T05:00:00Z',
    };

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: insertedRecord, error: null }),
      }),
    });

    const upsertSessionMock = vi.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'chatbot_reservations') {
        return { insert: insertMock };
      }
      if (table === 'chatbot_sessions') {
        return { upsert: upsertSessionMock };
      }
      return {};
    });

    const confirmingState: ChatbotSessionState = {
      language: 'es',
      reservationDraft: {
        step: 'confirm',
        partySize: 4,
        date: '2026-10-30',
        time: '20:00',
        name: 'Carlos',
        phone: '+59171234567',
        idempotencyKey: 'idem-key-1',
      },
    };

    const turn = await handleChatTurn('sí, confirmar', confirmingState, venue, [], 'session-user-1', 'web');

    expect(turn.reservationSaved).toBe(true);
    expect(turn.reservationId).toBe('res-abc-001');
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        venue_id: 'venue-123',
        customer_name: 'Carlos',
        idempotency_key: 'idem-key-1',
        status: 'pending',
      })
    );
    expect(turn.response.nextState.lastReservation).toBeDefined();
    expect(turn.response.nextState.lastReservation?.id).toBe('res-abc-001');
    expect(turn.response.nextState.reservationDraft?.step).toBe('idle');
  });

  it('handles retried confirmations idempotently and prevents duplicate inserts', async () => {
    const existingRecord = {
      id: 'res-abc-001',
      venue_id: 'venue-123',
      customer_name: 'Carlos',
      customer_phone: '+59171234567',
      party_size: 4,
      reservation_date: '2026-10-30',
      reservation_time: '20:00',
      source: 'web',
      status: 'pending',
      idempotency_key: 'idem-key-1',
      created_at: '2026-10-23T05:00:00Z',
    };

    let insertCallCount = 0;

    // Simulate PostgreSQL unique constraint violation (code 23505) when retrying
    const insertMock = vi.fn().mockImplementation(() => {
      insertCallCount++;
      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' },
          }),
        }),
      };
    });

    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: existingRecord,
      error: null,
    });

    const eqKeyMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const eqVenueMock = vi.fn().mockReturnValue({ eq: eqKeyMock });
    const selectExistingMock = vi.fn().mockReturnValue({ eq: eqVenueMock });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'chatbot_reservations') {
        return {
          insert: insertMock,
          select: selectExistingMock,
        };
      }
      return { upsert: vi.fn().mockResolvedValue({ data: null, error: null }) };
    });

    const duplicateResult = await saveReservation({
      venueId: 'venue-123',
      customerName: 'Carlos',
      customerPhone: '+59171234567',
      partySize: 4,
      reservationDate: '2026-10-30',
      reservationTime: '20:00',
      source: 'web',
      idempotencyKey: 'idem-key-1',
    });

    expect(duplicateResult.success).toBe(true);
    expect(duplicateResult.duplicate).toBe(true);
    expect(duplicateResult.data?.id).toBe('res-abc-001');
    expect(insertCallCount).toBe(1);
    expect(selectExistingMock).toHaveBeenCalledWith('*');
    expect(eqVenueMock).toHaveBeenCalledWith('venue_id', 'venue-123');
    expect(eqKeyMock).toHaveBeenCalledWith('idempotency_key', 'idem-key-1');
  });

  it('engine suppresses second reservation action on repeated affirmative once confirmed', () => {
    const stateAfterConfirmation: ChatbotSessionState = {
      language: 'es',
      reservationDraft: { step: 'idle' },
      lastReservation: {
        id: 'res-abc-001',
        customerName: 'Carlos',
        customerPhone: '+59171234567',
        partySize: 4,
        reservationDate: '2026-10-30',
        reservationTime: '20:00',
        idempotencyKey: 'idem-key-1',
      },
    };

    const res = processChatbotMessage('sí', stateAfterConfirmation, venue, [], 'web');
    expect(res.actionRequired).toBeUndefined();
    expect(res.reservationData).toBeUndefined();
    expect(res.reply).toContain('ya fue enviada y está pendiente de confirmación');
  });
});
