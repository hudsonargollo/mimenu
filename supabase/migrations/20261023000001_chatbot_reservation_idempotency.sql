-- Ensure a retried confirmation can create at most one reservation per chatbot turn.
ALTER TABLE public.chatbot_reservations
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chatbot_reservations_venue_idempotency
  ON public.chatbot_reservations (venue_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
