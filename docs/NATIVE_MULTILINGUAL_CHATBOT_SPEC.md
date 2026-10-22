# Native Multilingual Chatbot & WhatsApp Integration Specification

**Author / Architect:** Lovable Integration  
**Date:** October 2026  
**Status:** Approved Architecture Draft  
**Branch:** `feature/native-multilingual-chatbot`  
**Target Repository:** `hudsonargollo/mimenu`

---

## 1. Executive Summary & Objective

The objective is to integrate an intelligent restaurant chatbot into **MiMenu** based on the functional concepts of the reference project [`AindriyaBarua/Restaurant-chatbot`](https://github.com/AindriyaBarua/Restaurant-chatbot), but redesigned as a **100% native, zero-external-LLM-cost** TypeScript engine tailored directly for MiMenu's production stack:

- **Frontend & App Engine:** Vite + React + Tailwind CSS + Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL with Row Level Security)
- **Edge / Serverless Runtime:** Cloudflare Pages Functions / Workers
- **Messaging Integration:** Evolution API (WhatsApp Business webhook proxy)

The chatbot serves customers across two unified touchpoints using the exact same underlying logic:
1. **Interactive In-Menu Web Widget:** A floating assistant on the customer menu (`src/pages/customer/Menu.tsx` / `/loja/:slug`).
2. **WhatsApp Bot Webhook:** Seamless webhook handling via `functions/api/whatsapp/webhook.ts` sending replies via `send-message.ts`.

---

## 2. Multilingual Support (Language Hierarchy)

The chatbot and its language selectors prioritize:
1. **Spanish (`es`) — Primary / Default:** Designed for venues like *Moe's Taberna Santa Cruz de la Sierra*.
2. **English (`en`)**
3. **Portuguese (`pt`)**
4. **German (`de`)**

### Language Detection & Selection
- **Web Menu:** Synchronized with the user's selected language or browser locale, with an explicit in-widget dropdown (`ES | EN | PT | DE`).
- **WhatsApp Webhook:** Auto-detects the customer's language on the opening greeting (e.g., *"Hola"*, *"Hello"*, *"Olá"*, *"Guten Tag"*) and persists that language for the duration of the conversation session.

---

## 3. Core Functional Capabilities

| Capability | Rule Engine / Pattern Matching | Database Interaction |
| :--- | :--- | :--- |
| **Greetings & FAQs** | Matches conversational greetings, opening hours inquiries, address/location requests, and Wi-Fi requests. | Reads venue metadata from `public.venues` (`opening_hours`, `address`, `phone`). |
| **Menu Queries & Dietary Filters** | Matches dish names, categories, and dietary tags (`Vegetariano`, `Vegano`, `Sin Gluten`, `Picante`). | Filters active items in `public.menu_items` and formats prices with local currency (`Bs.`). |
| **Daily Specials & Hot Dishes** | Matches *"recomendaciones"*, *"ofertas"*, *"qué me recomiendas"*. | Recommends items where `is_featured = true`, `hotness_score >= 4`, or from `public.cycling_offers`. |
| **Table Reservations** | Multi-turn conversational flow: Party Size -> Date -> Time -> Full Name -> Contact Phone -> Confirmation. | Inserts into a dedicated `public.chatbot_reservations` table with status `'pending'`. |
| **Customer Feedback** | Captures rating (1 to 5 stars) and open text comment. | Inserts into `public.item_reviews` or a dedicated feedback collection. |
| **Order Status** | Matches active orders for the phone number. | Queries `public.orders` where `customer_phone` matches and order is active. |

---

## 4. Architectural Design: Native Core + Dual Channel Hookup

```
                        ┌──────────────────────────────────────────────┐
                        │       src/lib/chatbot/engine.ts              │
                        │  • Deterministic TypeScript rule engine      │
                        │  • Multi-language dictionary (ES, EN, PT, DE)│
                        │  • Intent classifier & entity parser         │
                        │  • State-machine for reservation drafts      │
                        └──────────────────────┬───────────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │     Frontend Web Widget   │                   │    WhatsApp Edge Webhook  │
         │ (src/components/chatbot/  │                   │ (functions/api/whatsapp/  │
         │      MenuChatbot.tsx)     │                   │       webhook.ts)         │
         │                           │                   │                           │
         │ • Embedded in Menu.tsx    │                   │ • Evolution API webhook   │
         │ • Direct Supabase client  │                   │ • Service Role client     │
         │ • LocalStorage session    │                   │ • DB session persistence  │
         └───────────────────────────┘                   └───────────────────────────┘
```

---

## 5. Database Schema Extensions

To support reservations and WhatsApp conversation memory without interfering with existing orders:

```sql
-- 1. Dedicated reservations table
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Conversational session tracking for WhatsApp multi-turn state
CREATE TABLE IF NOT EXISTS public.chatbot_sessions (
    venue_id TEXT NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (venue_id, phone_number)
);
```

---

## 6. Implementation Checklist

- [x] Create dedicated feature branch `feature/native-multilingual-chatbot`.
- [x] Document architecture and technical specification in `docs/NATIVE_MULTILINGUAL_CHATBOT_SPEC.md`.
- [ ] Implement `src/lib/chatbot/engine.ts` (Core deterministic NLP & translation dictionary).
- [ ] Implement `src/components/chatbot/MenuChatbot.tsx` (Floating in-menu customer widget).
- [ ] Mount widget into `src/pages/customer/Menu.tsx`.
- [ ] Update `src/i18n/LanguageProvider.tsx` & `translations.ts` to support `es | en | pt | de`.
- [ ] Update `functions/api/whatsapp/webhook.ts` to route non-order messages through the chatbot engine.
- [ ] Add Supabase migration `supabase/migrations/20261022000100_native_multilingual_chatbot.sql`.
- [ ] Verify build and commit all artifacts to the feature branch.
