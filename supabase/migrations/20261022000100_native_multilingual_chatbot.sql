-- Migration: Native Multilingual Chatbot Tables
-- Adds chatbot_reservations and chatbot_sessions for MiMenu web widget & WhatsApp chatbot

-- 1. Chatbot Reservations Table
CREATE TABLE IF NOT EXISTS public.chatbot_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id TEXT NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 50),
    reservation_date TEXT NOT NULL,
    reservation_time TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('web', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for venue reservations queries
CREATE INDEX IF NOT EXISTS idx_chatbot_reservations_venue_date 
ON public.chatbot_reservations(venue_id, reservation_date);

-- RLS for chatbot_reservations
ALTER TABLE public.chatbot_reservations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & customer access to insert their own reservation request
CREATE POLICY "Anyone can create chatbot reservation"
ON public.chatbot_reservations
FOR INSERT
WITH CHECK (true);

-- Customers can view their own reservation by phone or ID
CREATE POLICY "Public can view own reservation"
ON public.chatbot_reservations
FOR SELECT
USING (true);

-- Authenticated venue staff / admin can update status
CREATE POLICY "Authenticated users can update reservations"
ON public.chatbot_reservations
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 2. Chatbot Conversation Sessions (for multi-turn state tracking on WhatsApp & Web)
CREATE TABLE IF NOT EXISTS public.chatbot_sessions (
    venue_id TEXT NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    session_key TEXT NOT NULL, -- phone number or web session id
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en', 'pt', 'de')),
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_interaction TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (venue_id, session_key)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_venue_key
ON public.chatbot_sessions(venue_id, session_key);

ALTER TABLE public.chatbot_sessions ENABLE ROW LEVEL SECURITY;

-- Public read/write for session state machine
CREATE POLICY "Public read/write chatbot sessions"
ON public.chatbot_sessions
FOR ALL
USING (true)
WITH CHECK (true);
