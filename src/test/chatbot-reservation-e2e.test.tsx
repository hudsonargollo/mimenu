import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuChatbot } from '@/components/chatbot/MenuChatbot';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/lib/mimenuContext', () => ({
  useMimenu: () => ({
    venue: {
      id: 'venue-e2e-1',
      name: 'Bistro Central',
      address: 'Calle Mayor 12',
      phone: '+591 71234567',
      openingHours: '12:00 - 23:00',
    },
    categories: [
      {
        id: 'cat-1',
        name: 'Platos Principales',
        items: [
          {
            id: 'item-1',
            name: 'Paella Valenciana',
            description: 'Arroz con mariscos y azafrán',
            price: 25,
            is_available: true,
            is_featured: true,
            dietary: ['Sin Gluten'],
          },
        ],
      },
    ],
  }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      from: fromMock,
    },
  };
});

describe('Customer Menu Chatbot E2E - Reservation Confirmation with Simulated Transport Failure & Retry', () => {
  let createdReservations: any[] = [];
  let insertAttempt = 0;
  let simulateTransportFailure = false;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    createdReservations = [];
    insertAttempt = 0;
    simulateTransportFailure = false;

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'chatbot_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
          upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }

      if (table === 'chatbot_reservations') {
        return {
          insert: vi.fn().mockImplementation((payload: any) => {
            insertAttempt++;

            // Check unique constraint violation on venue_id + idempotency_key
            const existing = createdReservations.find(
              (r) => r.venue_id === payload.venue_id && r.idempotency_key === payload.idempotency_key
            );

            if (existing) {
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: {
                      code: '23505',
                      message: 'duplicate key value violates unique constraint',
                    },
                  }),
                }),
              };
            }

            // Simulate transport drop or database timeout right after/during the first write
            if (simulateTransportFailure && insertAttempt === 1) {
              createdReservations.push({
                ...payload,
                id: 'res-db-recorded-001',
                created_at: new Date().toISOString(),
              });
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockRejectedValue(new Error('Failed to fetch: Network request failed')),
                }),
              };
            }

            const record = {
              ...payload,
              id: 'res-db-recorded-001',
              created_at: new Date().toISOString(),
            };
            createdReservations.push(record);

            return {
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: record,
                  error: null,
                }),
              }),
            };
          }),

          select: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation((col1: string, val1: string) => ({
              eq: vi.fn().mockImplementation((col2: string, val2: string) => ({
                maybeSingle: vi.fn().mockImplementation(async () => {
                  const match = createdReservations.find(
                    (r) =>
                      (col1 === 'venue_id' ? r.venue_id === val1 : true) &&
                      (col2 === 'idempotency_key' ? r.idempotency_key === val2 : true)
                  );
                  return { data: match || null, error: null };
                }),
              })),
            })),
          })),
        };
      }

      return {};
    });
  });

  it('completes reservation flow, survives transport failure on confirmation, and retries idempotently with only 1 DB row created', async () => {
    simulateTransportFailure = true;

    render(<MenuChatbot />);

    // Open chat widget
    const toggleButton = screen.getByRole('button', { name: /Open chat|Abrir chat/i });
    fireEvent.click(toggleButton);

    const input = screen.getByPlaceholderText(/Escribe tu mensaje…|Type a message…/i);
    const sendBtn = screen.getByRole('button', { name: /Send message/i });

    const sendUserMessage = async (msg: string) => {
      fireEvent.change(input, { target: { value: msg } });
      fireEvent.click(sendBtn);
      await waitFor(() => expect(screen.getByText(msg)).toBeDefined());
    };

    // Step 1: Initiate reservation
    await sendUserMessage('quiero reservar una mesa');
    await waitFor(() => expect(screen.getByText(/¿Para cuántas personas sería la reserva?/i)).toBeDefined());

    // Step 2: Party size
    await sendUserMessage('4 personas');
    await waitFor(() => expect(screen.getByText(/¿Para qué fecha te gustaría la reserva?/i)).toBeDefined());

    // Step 3: Date
    await sendUserMessage('2026-10-30');
    await waitFor(() => expect(screen.getByText(/¿A qué hora?/i)).toBeDefined());

    // Step 4: Time
    await sendUserMessage('20:30');
    await waitFor(() => expect(screen.getByText(/¿A nombre de quién registramos la solicitud?/i)).toBeDefined());

    // Step 5: Name
    await sendUserMessage('Hudson Argollo');
    await waitFor(() => expect(screen.getByText(/¿A qué número de teléfono te contactamos?/i)).toBeDefined());

    // Step 6: Phone
    await sendUserMessage('+591 71234567');
    await waitFor(() => expect(screen.getByText(/¿Confirmas estos datos para enviar la solicitud?/i)).toBeDefined());

    // Step 7: Confirmation with transport failure
    await sendUserMessage('sí, confirmar');

    // Widget shows the graceful clarification that connection failed and retrying is safe
    await waitFor(() => {
      expect(
        screen.getByText(/No pude confirmar si tu solicitud quedó registrada|No pude guardar la solicitud/i)
      ).toBeDefined();
    });

    expect(createdReservations).toHaveLength(1);
    expect(insertAttempt).toBe(1);

    // Step 8: User retries confirmation after connection restores
    simulateTransportFailure = false;
    await sendUserMessage('sí, confirmar');

    // Widget should complete and confirm or acknowledge receipt
    await waitFor(() => {
      expect(
        screen.getByText(/pendiente de confirmación|Esta solicitud ya fue enviada/i)
      ).toBeDefined();
    });

    // VERIFICATION: Only ONE database reservation record exists
    expect(createdReservations).toHaveLength(1);
    expect(createdReservations[0].customer_name).toBe('Hudson Argollo');
    expect(createdReservations[0].party_size).toBe(4);
    expect(createdReservations[0].status).toBe('pending');
    expect(createdReservations[0].idempotency_key).toBeDefined();
  });
});
