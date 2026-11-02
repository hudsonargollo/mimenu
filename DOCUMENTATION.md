# MiMenu — System Documentation and Change Log

**Status:** Production, verified 2026-11-01
**Production:** https://mimenu-1y0.pages.dev (deployment `e432ca77`, source `8d773fb`)
**Preview:** https://preview-noir.mimenu-1y0.pages.dev
**Source of truth:** `/root/ClubeMkt/mimenu` (VPS). The local workspace copy mirrors it; the VPS repo carries the full git history.

This document describes the system as it runs today and records the changes shipped in the most recent cycle. It is the current reference; older files such as `SYSTEM_DOCUMENTATION.md` may describe retired backends and should not be treated as authoritative.

---

## Table of contents

1. [What MiMenu is](#1-what-mimenu-is)
2. [Architecture](#2-architecture)
3. [Repository layout](#3-repository-layout)
4. [Roles and authentication](#4-roles-and-authentication)
5. [Multi-tenancy and venue resolution](#5-multi-tenancy-and-venue-resolution)
6. [Data storage](#6-data-storage)
7. [Plans and entitlements](#7-plans-and-entitlements)
8. [Functional modules](#8-functional-modules)
9. [Internationalization](#9-internationalization)
10. [HTTP API reference](#10-http-api-reference)
11. [Environment and secrets](#11-environment-and-secrets)
12. [Deployment and operations](#12-deployment-and-operations)
13. [Testing and QA](#13-testing-and-qa)
14. [Latest changes](#14-latest-changes)
15. [Known limitations and follow-ups](#15-known-limitations-and-follow-ups)
16. [Where to look](#16-where-to-look)

---

## 1. What MiMenu is

MiMenu is a multi-tenant SaaS for restaurants, bars and delivery businesses in Bolivia. It covers the guest-facing digital menu and ordering flow, kitchen and floor operations, the admin back office, and growth features. Pricing is a monthly subscription with **0% commission on sales**; the product never takes a cut of orders.

Core capabilities:

- QR digital menu with self-ordering, table context and split-payment support.
- Kitchen Display System (KDS), cashier/POS view and waiter mobile app.
- Own-delivery flow (checkout, payment, order tracking) without marketplace fees.
- AI concierge on the menu: answers guest questions, takes reservations, learns from admin corrections.
- AR/3D dish previews generated from photos.
- Google review capture, CRM, smart offers, analytics and reports.
- Menu ingestion from a photographed menu (OCR/vision).
- Thermal printing through a local print bridge or PrintNode.
- Transactional email through Resend.
- Public marketing site in Spanish, English and Portuguese.

---

## 2. Architecture

### 2.1 Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vite 5, React 18, TypeScript 5, React Router 6 |
| UI | Tailwind CSS 3, shadcn/Radix primitives, lucide-react, framer-motion |
| Client state | React Context (`AuthProvider`, `MimenuProvider`, `CartProvider`, `LanguageProvider`) + TanStack Query |
| Edge runtime | Cloudflare Pages Functions (`functions/`), Workers KV, `worker.ts` for brand domains |
| Storage | Cloudflare Workers KV (`MIMENU_KV`); browser localStorage for per-device app data and caches |
| Auth | Signed HMAC session tokens minted by a Pages Function; static staff credentials plus KV waiter accounts |
| Email | Resend REST API |
| AR/3D | Meshy image-to-3D or a self-hosted TRELLIS.2 worker on the VPS; assets served from the models CDN |
| TTS | VPS edge-tts service behind nginx (`TTS_SERVICE_URL`) |
| Printing | Browser print utilities, local Node print server (`print-server/`), optional PrintNode |
| Deployment | Cloudflare Pages direct upload (`wrangler pages deploy dist`) |

### 2.2 Runtime topology

```
Browser
  │
  ├── Brand domains ──► Worker (worker.ts)
  │                       ├── /api/*  ──► proxy to Pages origin (mimenu-1y0.pages.dev)
  │                       └── assets  ──► ASSETS binding, SPA fallback
  │
  └── Pages origin ───► Pages project "mimenu"
                          ├── static SPA (dist)
                          └── Pages Functions (/api/*)
                                ├── MIMENU_KV (Workers KV)
                                ├── Resend API
                                ├── Meshy API / AR worker
                                └── TTS service
```

- **Pages origin:** `https://mimenu-1y0.pages.dev`. Hosts the built SPA and every `/api/*` Function.
- **Brand worker:** `worker.ts` serves the assets and forwards `/api/*` to the Pages origin, so brand domains keep one public origin.
- **Custom domains:** `mimenu.clubemkt.digital` and `mimenu.clubemkt.online` are declared as custom-domain routes in `wrangler.jsonc`. The Pages project currently reports `mimenu.clubemkt.digital` as an attached domain.
- **Preview:** branch `preview-noir`, alias `preview-noir.mimenu-1y0.pages.dev`.

### 2.3 Configuration gotcha

The repo contains both `wrangler.jsonc` and `wrangler.toml`.

- `wrangler.jsonc` declares the worker entry, assets directory, SPA handling and custom domains.
- `wrangler.toml` declares `pages_build_output_dir` and the `MIMENU_KV` binding.
- During a Pages deploy, `wrangler.jsonc` shadows `wrangler.toml`; wrangler warns that `pages_build_output_dir` is missing and ignores the file. **The KV binding and secrets must therefore exist on the Pages project itself** (dashboard or Pages API). Do not assume the TOML applied them.

---

## 3. Repository layout

```
mimenu/
├── src/
│   ├── pages/
│   │   ├── public/        Landing variants, Auth, Onboarding, Docs, Proposta, Contracts
│   │   ├── customer/      Menu, Checkout, Payment, OrderStatus, QRLanding, LiveMenu, Welcome
│   │   ├── admin/         Dashboard and every back-office screen
│   │   ├── staff/         Cashier / KDS
│   │   ├── waiter/        Waiter app, dashboard, management
│   │   └── debug/         QR redirect helper
│   ├── components/        Shared UI, AR viewer, chatbot, printing, admin chrome
│   ├── lib/               Auth, venue registry, plans, cart, orders, chatbot engine and APIs
│   ├── i18n/              translations.ts and LanguageProvider
│   ├── data/              provisioned_venues.json (generated registry)
│   └── types/             Domain types
├── shared/                Code imported by both SPA and Functions
│   ├── plans.ts           Plan catalog and entitlement matrix
│   ├── concierge.ts       Concierge record types
│   └── app-credentials.ts Static staff account definitions
├── functions/
│   ├── api/               Pages Functions endpoints
│   └── lib/               Edge helpers: KV, plans, sessions, email, concierge, waiters
├── vps-worker/            AR task worker (Node, systemd service)
├── print-server/          Local print bridge (Windows/macOS installers included)
├── docs/                  AR pipeline and multilingual chatbot specs
├── tests/                 Playwright browser tests and exploratory tests
├── worker.ts              Brand-domain worker
├── wrangler.jsonc / wrangler.toml
├── _routes.json / _headers
└── index.html
```

---

## 4. Roles and authentication

### 4.1 Roles

`AppRole` is `'admin' | 'waiter' | 'kitchen' | 'cashier'`.

- **admin** — full back office. A platform admin has `tenantSlug: null` and can review every venue (superadmin). Tenant admins are bound to one venue slug.
- **waiter** — waiter app and dashboard.
- **kitchen** — KDS view.
- **cashier** — cashier/POS view.
- **Guest** — no session; sees the public menu, places orders, uses the concierge.

Static staff accounts live in `shared/app-credentials.ts` (identifiers, roles, tenant scoping). Waiter accounts created from the admin panel live in KV under `waiters:all`; passwords are PBKDF2-SHA-256 with 100,000 iterations and a per-user salt.

### 4.2 Login and session

1. The client posts credentials to `POST /api/auth/session`.
2. The Function checks static credentials first, then waiter accounts by email.
3. On success it mints an HMAC-SHA-256 token (`v1.<payload>.<signature>`) with a **7-day TTL**, signed with `APP_SESSION_SECRET`.
4. The client stores the session in localStorage (`mimenu_app_session`). `adminFetch()` attaches `Authorization: Bearer <token>` and clears the session on 401/403.

There are two client-side layers, by design:

- `AuthProvider` (`mimenu_auth_user`) drives routing and UI role display.
- The signed app session (`mimenu_app_session`) is what the edge actually verifies for privileged endpoints.

**Important caveat:** plan enforcement at the edge trusts the venue slug supplied by the caller (`?venue=`, `x-venue-slug`, or body). Auth is strong for admin-only endpoints, but tenant identity for plan gating is product-level, not cryptographically bound. A signed tenant token is the next hardening step.

### 4.3 Rate limits

In-isolate sliding windows (per Cloudflare isolate, keyed by `CF-Connecting-IP`):

| Action | Limit |
| --- | --- |
| Login attempts | 10 per 15 minutes |
| Concierge turn logging | 120 per 10 minutes |
| Order-confirmation email | 10 per hour |
| Upgrade-request email | 5 per hour |

---

## 5. Multi-tenancy and venue resolution

- The registry `src/data/provisioned_venues.json` is read-only and generated by `scripts/generate-jaleo-venue.ts`. It holds slugs, branding, hero media, categories, tables and featured items.
- `src/lib/venueRegistry.ts` resolves the tenant:
  - `?v=<slug>` or `?venue=<slug>` first;
  - then the first path segment (`/jaleo`);
  - then the first active venue as the default.
- Reserved slugs (app routes such as `admin`, `menu`, `checkout`, `waiter`) are never resolved as venues.
- The QR redirect route `/:tableId` maps a table id back into the menu with table context.
- Plan fields are derived per venue through `planFieldsForVenue()` in `src/lib/plans.ts`, backed by the shared matrix.
- **Jaleo** is the founding tenant and the only venue with a non-default assignment (`premium`, active since 2026-09-24). Every other venue defaults to `basic`.

---

## 6. Data storage

### 6.1 Workers KV (`MIMENU_KV`)

| Key pattern | Contents | Lifetime |
| --- | --- | --- |
| `waiters:all` | JSON array of waiter accounts (PBKDF2 hashes) | Persistent |
| `concierge:t:<venue>:<reversedTime>:<session>:<id>` | One guest turn (message, reply, language, reservation flag) | 90 days |
| `concierge:fb:<venue>:<turnId>` | Admin feedback, optional correction and triggers | Persistent |
| `concierge:learned:<venue>` | Curated answers for the venue (max 200) | Persistent |
| `menu_item:<id>` | AR state and asset URLs for a menu item | Persistent |
| `ar_task:<taskId>` | AR generation task state | Persistent |

Concierge turn keys embed an inverted timestamp so `KV.list()` returns newest-first, which the review screen depends on.

Legacy key prefixes in `functions/lib/kv-storage.ts` (`session_whatsapp_`, `data_orders_`, `data_waiters_`, `data_users_`, `email_link_`) remain in the adapter but are not the active path for orders.

### 6.2 Browser storage

The demo/app layer persists per-device state in localStorage:

| Key | Purpose |
| --- | --- |
| `mimenu-lang` | UI language (`es` default; legacy `pontal-lang` is migrated) |
| `mimenu_orders_v2` | Orders (with `storage` event cross-tab sync) |
| `mimenu_app_session` | Signed edge session |
| `mimenu_auth_user`, `mimenu_auth_user_persist` | UI auth profile and remember-me |
| `mimenu_chatbot_sessions_v1`, `mimenu_chatbot_reservations_v1` | Concierge session state and pending reservations |
| `mimenu_concierge_learned_v1:<venue>` | 10-minute cache of approved answers |
| `mimenu_kv:*` | Client KV wrapper (`src/lib/kvStore.ts`) |
| `print_server_url`, `printnode_api_key`, `printnode_default_printer` | Printing configuration |
| `currentTableId`, `contractData` | Table context and contract drafts |

Orders and catalog edits are currently device-local. There is no relational database: the previous Supabase, MercadoPago and WhatsApp backends were removed. Cross-device behavior relies on the KV-backed features (concierge, AR, waiters, email).

---

## 7. Plans and entitlements

`shared/plans.ts` is the single source of truth for both the SPA and the edge.

| Plan | Price (BOB/month) | Entitlements |
| --- | --- | --- |
| Basic | 180 | `qr_menu` |
| Pro | 340 | Basic + `kds`, `waiter_app`, `whatsapp_concierge`, `analytics`, `crm`, `smart_offers`, `printing` |
| Premium | 680 | Pro + `ar_3d`, `custom_website`, `photographed_menu`, `guided_onboarding` |
| Custom | Quoted | Premium + `multi_branch`, `pos_integration`, `api_webhooks`, `sla_support` |

Resolution rules:

- Unlisted venues default to `basic`; the public QR menu always stays available.
- An assignment grants its plan only while `status` is `active`, `trialing`, or `past_due` inside the grace window; otherwise it falls back to `basic`.
- Client routes use `<PlanGate feature="...">` around premium pages.
- Edge endpoints call `requireEntitlement()` and return:
  - **400** `venue_required` when no venue context is supplied;
  - **402** `plan_required` / `plan_inactive` with the current and required plan, so the UI can show an upgrade prompt.

Gated routes in the SPA:

| Route | Entitlement |
| --- | --- |
| `/admin/ai`, `/admin/concierge` | `whatsapp_concierge` |
| `/admin/ingester`, `/admin/ingest-menu` | `photographed_menu` |
| `/admin/offers` | `smart_offers` |
| `/admin/analytics`, `/reports` | `analytics` |
| `/admin/branding` | `custom_website` |
| `/admin/customers` | `crm` |
| `/print-server-config` | `printing` |
| `/waiter`, `/waiter/dashboard`, `/waiter-dashboard`, `/waiter-management` | `waiter_app` |
| `/kitchen`, `/cashier` | `kds` |

`/admin/upgrade` is intentionally ungated so any admin can request a higher plan.

---

## 8. Functional modules

### 8.1 Public landing (`/`)

`src/pages/public/LandingTakeat.tsx` is the production landing; `/cardapio-digital`, `/saas` and `/takeat` alias it. Alternate and archived variants live under `/old*`, `/landing-genio`, `/plataforma`, `/new` and `/mi-menu-ar`.

Sections, in order:

1. Promo banner
2. Header/navbar with language switcher and mobile menu
3. Hero with fixed headline and animated typewriter subheadline
4. Interactive product showcase (four tabs: QR menu, KDS, digital waiter, POS/manager) with mockups
5. Numbers/results strip on the purple gradient
6. New-capabilities spotlight (AI concierge, AR menu, Google reviews)
7. Core operational pillars
8. Modular power suite
9. ROI calculator (orders volume, ticket, commission comparison)
10. Segment matrix (five restaurant segments)
11. Testimonials
12. FAQ accordion
13. Lead form and contact
14. Footer
15. Sticky mobile CTA

The lead form composes a pre-filled WhatsApp message with the selected segment, name, venue and phone. There is no server-side lead capture. The selected segment is stored as `opt1`–`opt5`; the message uses the same union type, so copy and label cannot drift.

`document.title` is set per language from `t.landing.docTitle`.

### 8.2 Customer menu and ordering

- Entry points: `/:venueSlug`, `/menu`, and the QR redirect `/:tableId`.
- Hero supports an optional video/poster and a hero image; featured dishes render in a 3D flip deck limited to featured items.
- Offers render as a one-at-a-time autoplay slider with a pause control.
- Cart and table context are held in `CartProvider`/`TableSelectorModal`; checkout supports dine-in, pickup and delivery.
- Payment screen supports QR Simple/Banco, card and cash flows without an external gateway integration.
- Orders are persisted locally and exposed to kitchen/waiter views; order status routes are `/order-status/:orderId` and `/order/:orderId`.
- The menu UI is localized in ES/EN/PT; the concierge additionally understands German.

### 8.3 Kitchen, cashier and waiters

- `/kitchen` and `/cashier` render the KDS/cashier experience, gated by `kds`.
- Waiters use `/waiter` and `/waiter/dashboard`; admins manage accounts at `/waiter-management`.
- Waiter APIs enforce an admin session and store accounts in KV.
- Printing flows through `src/lib/printUtils.ts`, the local `print-server/` bridge, or PrintNode settings.

### 8.4 Admin back office

Routes: `/admin` (dashboard), `/admin/upgrade`, `/admin/ai`, `/admin/concierge`, `/admin/ingester`, `/admin/offers`, `/admin/analytics`, `/admin/tables`, `/admin/reviews`, `/admin/branding`, `/admin/products`, `/admin/settings`, `/admin/customers`, `/reports`, `/print-server-config`, `/waiter-management`.

Admin UI copy is Spanish with Bs. pricing. Portuguese strings in admin surfaces are treated as bugs.

### 8.5 AI concierge

**Engine** (`src/lib/chatbot/engine.ts`) is deterministic and dependency-free:

- Language: ES/EN/PT/DE, sticky per session unless the message strongly signals another language.
- Reservation draft steps: `idle → party_size → date → time → name → phone → confirm`.
- A reservation intent expressed before the name is remembered and resumed.
- Questions asked mid-reservation are answered without losing the draft.
- Date and time can be read from the message that supplies the party size.
- Curated answers (learned) are matched before the generic fallback.

**Service layer** (`src/lib/chatbot/service.ts`) persists sessions and pending reservations in localStorage with idempotency keys.

**UI** (`src/components/chatbot/MenuChatbot.tsx`) is a bottom-center sheet docked to the footer: a centered trigger bar at the bottom, and a panel that slides up from the bottom edge with rounded top corners, capped height and a close control. It includes voice input, TTS playback, language selection and retry.

**Tracking and review loop:**

1. After each reply, the widget fire-and-forgets `POST /api/concierge/log` with the venue, session, message, reply, language, optional user name and learned id.
2. Admins open `/admin/concierge` (superadmins see all venues; tenant admins only their own).
3. Turns are grouped by session with 👍/👎 controls.
4. A 👎 with a corrected reply and trigger phrases becomes a curated answer (`concierge:learned:<venue>`), immediately available to guests.
5. Curated answers can be edited, toggled or deleted; the widget caches them for 10 minutes.

**Authorization:** `requireConciergeAdmin()` verifies the signed token, requires role `admin`, and uses the credential's `tenantSlug` to scope access. A `null` tenant is the superadmin.

### 8.6 AR/3D pipeline

- Admin generates a 3D model from a dish photo (`/api/ar/generate`) or registers external GLB/USDZ URLs (`/api/ar/manual`), both gated by `ar_3d`.
- Tasks are stored in KV (`ar_task:*`) and mirrored onto `menu_item:*`.
- Providers: Meshy (`MESHY_API_KEY`) or a self-hosted TRELLIS.2 worker.
- The VPS worker (`vps-worker/index.js`, systemd) polls `/api/ar/queue`, claims tasks, downloads assets, and reports back with `AR_WORKER_TOKEN`.
- Models are served from the models CDN; the customer menu shows AR chips and `@google/model-viewer` renders the asset. Pipeline details: `docs/AR_PIPELINE.md`.

### 8.7 Email

Resend, default sender `MiMenu <no-reply@atencion.clubemkt.digital>` (`RESEND_FROM` overrides).

| Endpoint | Trigger |
| --- | --- |
| `POST /api/email/order-confirmation` | Customer order confirmation (dine-in, pickup or delivery) |
| `POST /api/email/upgrade-request` | Plan upgrade request to sales (`SALES_EMAIL`, default `contato@mimenu.clubemkt.digital`) |
| `POST /api/waiters/send-password-reset` | Admin-issued waiter password reset |

### 8.8 TTS

`POST /api/tts` proxies text (max 500 chars) to the edge-tts service at `TTS_SERVICE_URL` (default `https://tts.clubemkt.online`) and streams MP3 back to the concierge.

---

## 9. Internationalization

### 9.1 Structure

- `src/i18n/translations.ts` exports `{ es, en, pt }`; `Translations` is derived from the Spanish tree.
- `LanguageProvider` defaults to **Spanish**, persists the choice in `mimenu-lang`, migrates legacy `pontal-lang`, and keeps `document.documentElement.lang` in sync (`es-BO`, `en`, `pt`).
- Landing UI, menu UI and chatbot copy are localized. Chatbot language support extends to German.
- Spanish is the default for a first-time visitor: no stored language, `lang="es-BO"`, Spanish title and headline.

### 9.2 Current inventory

- **344 keys per language**, exact parity across ES/EN/PT.
- **310 unique landing keys per language**, including the 48 keys added when the landing was localized.
- Dead landing keys were removed (`eyebrow`, `subtitle`, `ctaSecondary`, `featuresTitle`, `leadSegmentDefault`), so every landing key maps to rendered UI or an intentional fallback.
- Duplicate `footerTagline` entries in EN/PT were removed; the ES tagline was corrected.

### 9.3 Verification methodology

A naive text check produces false negatives because closed accordions and inactive tabs are not in the DOM. The QA harness therefore:

1. Loads the page in ES, EN and PT.
2. Collects text and accessible attributes across a union of interactive states: base, all four showcase tabs, all five segments, every FAQ question, the form success state and the mobile menu (20 states per language).
3. Compares whitespace-normalized strings against the expected key set.
4. Treats `docTitle` and the WhatsApp strings as special cases, verified in `document.title` and inside the encoded `wa.me` URL.
5. Checks console errors, document overflow at 1440×900 and 390×844, typewriter animation, and computed heading colors.

---

## 10. HTTP API reference

All endpoints live in `functions/api/`. "Admin" means a valid signed token with role `admin`; "plan" means the venue must hold the named entitlement.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/session` | Public, rate-limited | Exchange static or waiter credentials for a signed session |
| GET | `/api/health` | Public | Health check |
| GET | `/api/test` | Public | Connectivity probe |
| POST | `/api/tts` | Public | Text-to-speech proxy |
| POST | `/api/waiters/create-waiter` | Admin | Create waiter account |
| GET | `/api/waiters/list-waiters` | Admin | List waiters |
| DELETE | `/api/waiters/delete-waiter` | Admin | Delete waiter |
| POST | `/api/waiters/update-waiter-profile` | Admin | Update waiter profile |
| POST | `/api/waiters/send-password-reset` | Admin | Issue a new waiter password by email |
| POST | `/api/concierge/log` | Public, rate-limited | Record one guest turn |
| GET | `/api/concierge/learned?venue=` | Public | Approved answers for the widget |
| GET | `/api/concierge/conversations?venue=` | Admin, venue-scoped | Sessions, stats and curated answers |
| POST | `/api/concierge/feedback` | Admin, venue-scoped | 👍/👎 and optional correction → curated answer |
| PATCH | `/api/concierge/answers` | Admin, venue-scoped | Edit, enable or disable a curated answer |
| DELETE | `/api/concierge/answers?venue=&id=` | Admin, venue-scoped | Delete a curated answer |
| POST | `/api/ar/generate` | Plan `ar_3d` | Start image-to-3D generation |
| GET | `/api/ar/status/:taskId` | Plan `ar_3d` | Task and provider progress |
| GET | `/api/ar/menu-items?ids=` | Plan `ar_3d` | Batch AR records |
| GET | `/api/ar/menu-item/:id` | Plan `ar_3d` | Single AR record |
| POST | `/api/ar/manual` | Plan `ar_3d` | Register external GLB/USDZ URLs |
| POST | `/api/ar/report` | Bearer `AR_WORKER_TOKEN` | Worker completion/failure callback |
| GET/POST | `/api/ar/queue` | Bearer `AR_WORKER_TOKEN` | Worker pull and task claim |
| POST | `/api/email/order-confirmation` | Public, rate-limited | Send order confirmation |
| POST | `/api/email/upgrade-request` | Public, rate-limited | Send upgrade request to sales |

`functions/_middleware.js` adds CORS headers, a request id (`X-Request-ID`), request/response logging and a JSON error response.

---

## 11. Environment and secrets

Names only — values are configured in the Cloudflare dashboard for the Pages project `mimenu` and must never be committed.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MIMENU_KV` | All KV-backed features | Workers KV namespace binding |
| `APP_SESSION_SECRET` | Auth and admin endpoints | HMAC key for session tokens |
| `RESEND_API_KEY` | Email endpoints | Resend API key |
| `RESEND_FROM` | Email endpoints | Sender override |
| `SALES_EMAIL` | Upgrade requests | Sales inbox |
| `AR_WORKER_URL` | AR pipeline | VPS worker endpoint |
| `AR_WORKER_TOKEN` | AR pipeline | Shared worker/report token |
| `AR_GENERATOR_PROVIDER` | AR pipeline | Provider selection |
| `MESHY_API_KEY` | AR pipeline | Meshy image-to-3D |
| `TTS_SERVICE_URL` | TTS | edge-tts service URL |

Operational rules already in force: do not read or transmit credential stores, do not print secret values, and do not replay OAuth/wrangler tokens. Use the sanctioned wrangler CLI flows.

---

## 12. Deployment and operations

### 12.1 Environment

- Authoritative repo: `/root/ClubeMkt/mimenu` on the VPS (Node 26.x).
- Local source: `mimenu/` in this workspace.
- Build: `npm run build` → Vite output in `dist/`; the build script also attempts to copy `_redirects` and `_routes.json`.
- SPA routing: `wrangler.jsonc` sets `not_found_handling: "single-page-application"`; `worker.ts` also falls back to `index.html`; `_routes.json` excludes static assets from Function invocation.
- Cache policy (`_headers`): HTML and `/` are `no-store`; hashed JS/CSS/assets are immutable for one year.

### 12.2 Standard release flow

```bash
# on the VPS, in /root/ClubeMkt/mimenu
git status -sb                      # must be clean and in sync with origin
npx tsc --noEmit
npx eslint <changed files>
npm run build

# preview
npx wrangler pages deploy dist --project-name=mimenu --branch=preview-noir

# production (branch main is the production branch)
npx wrangler pages deploy dist --project-name=mimenu --branch=main
```

Rules:

- **Push is not deploy.** This is a direct-upload Pages project; every release needs an explicit `wrangler pages deploy`.
- Production deploys use branch `main`; preview uses `preview-noir`.
- Commits and production deploys require explicit confirmation.
- Never force-push. Push only via the configured credential helper or an interactive flow.
- Verify the deployment id and source commit afterwards with `npx wrangler pages deployment list --project-name=mimenu`.

### 12.3 Rollback

Pages keeps prior deployments. Re-deploy the previous `dist` state by checking out the earlier commit on the VPS, rebuilding, and deploying to `main`; or promote the earlier deployment from the Cloudflare dashboard.

### 12.4 Production verification (current release)

- Deployment `e432ca77-4892-4b17-82d5-453f01d3dc49`, Production/`main`, source `8d773fb` (previous production was `07df1968` from `73e83f0`).
- Fresh visitor: Spanish by default, `html lang="es-BO"`, Spanish document title and headline.
- 344/344 keys resolve in ES/EN/PT across all interactive states.
- Language switching, localized titles and `html lang` work in all three languages.
- WhatsApp lead form opens with the correct intro, CTA, segment and field values per language.
- All four showcase headings compute white on the purple panel.
- Zero horizontal overflow at 1440×900 and 390×844; zero console errors.
- Build warning only: several chunks exceed 500 kB (model-viewer, main index, contract management). Consider manual chunking if load time becomes a concern.

---

## 13. Testing and QA

Available commands:

```bash
npm run test        # vitest watch
npm run test:run    # vitest single run
npm run test:ui     # vitest UI
npm run test:e2e:browser   # playwright
```

Coverage highlights:

- Unit: plans and entitlements, chatbot engine, order utilities, phone utilities, commission math, sales contact.
- Component: customer info form, commission cards, order notes, mobile order card, loading fallback, cashier.
- Integration: payment workflow, waiter payment workflow, payment status logic, app smoke.
- Browser: chatbot reservation persistence across reload (`tests/browser/chatbot-reservation-reload.spec.ts`).

The i18n/UX harness used for the current release drives headless Chrome over CDP: it switches languages through the real header control, submits the form with a stubbed `window.open` to inspect the WhatsApp URL, exercises tabs/segments/FAQ/mobile menu, captures screenshots, and reports console errors and document overflow.

---

## 14. Latest changes

### 14.1 Landing rebuild and full localization — `8d773fb`

Commit: *Rebuild the landing with the AI spotlight and localize it in ES/EN/PT.*

- Fixed Spanish headline: **"La evolución digital que tu restaurante necesita hoy."**
- Typewriter subheadline with reduced-motion support.
- New capabilities spotlight: AI concierge chat mock, AR menu, Google review hunter.
- Interactive showcase with four tabs and realistic mockups; the mock copy (table, burger, gin, pizza, KDS, POS metrics) is fully localized and uses the venue currency token.
- ROI/fee calculator, five-segment matrix, testimonials, FAQ, localized lead form and footer badges.
- WhatsApp lead message includes the selected segment (`opt1`–`opt5`) and localized intro/CTA.
- Added 48 landing keys per language; final inventory 344 keys/language, 310 unique landing keys, exact parity.
- Fixed global heading color leaking dark text onto purple panels by forcing `text-white` on the four showcase headings.
- Synced `html lang` per language (`es-BO`/`en`/`pt`).
- Fixed the stale ES footer tagline and removed duplicate `footerTagline` keys in EN/PT.
- Removed dead landing keys so the translation file matches rendered UI.
- Preview deployment: `50bfece4`; production deployment: `e432ca77`.

### 14.2 Concierge docking, tracking and curated answers — `6c5dcff`

Commit: *Dock the concierge and add superadmin answer reviews.*

- The concierge moved from a corner bubble to a bottom-center sheet docked to the footer, with a centered trigger bar and a rounded top panel. Mobile-first sizing with a capped height.
- New KV tracking API:
  - `POST /api/concierge/log` (public, rate-limited, 90-day TTL, newest-first keys).
  - `GET /api/concierge/conversations` (admin, venue-scoped, sessions + stats).
  - `POST /api/concierge/feedback` (admin; 👎 plus correction creates a curated answer).
  - `PATCH`/`DELETE /api/concierge/answers` (admin; edit, toggle, delete).
  - `GET /api/concierge/learned` (public; widget bootstrap with a 10-minute client cache).
- New admin review screen `/admin/concierge`: stats, session grouping, per-turn rating, correction editor with triggers, curated-answer management.
- Learned-answer matching added to the deterministic engine, with `learnedId` propagated into turn logs.
- Authorization: signed admin session, role check, tenant scoping via `APP_CREDENTIALS`; superadmin sees all venues.

### 14.3 Concierge context fixes — `a16f0a7`, `73e83f0`

- Preserve conversation context mid-reservation.
- Read reservation date and time from the message that answers the party-size step.

### 14.4 Earlier changes in this cycle

| Commit | Change |
| --- | --- |
| `69e775d` | Locked Studio Blue admin palette; rebuilt the featured flip deck |
| `2012658` | Reworked the tenant dashboard onto an editorial noir system |
| `b1409f5`, `5381b4d`, `b94b7bb`, `0a19ec5` | Offers slider: autoplay, mobile/desktop tuning, overlapping media, one-at-a-time layout |
| `83aee2b` | Premium menu hero with video and featured-only flip deck |
| `1705788`, `41f4ddb`, `37dc1a9` | Auth loading scene order and remember-me toggle |
| `664f322` | Removed Supabase, MercadoPago and WhatsApp backends; KV + local storage stack |
| `ee413c0` | Waiter admin APIs authenticated with signed sessions |
| `66d3f39` | Resend transactional email |
| `8f4af77`, `0e9d39c` | Admin/product UI translated to Spanish |

### 14.5 Verification record for this release

- Build on the VPS at `8d773fb` completed (`tsc` and changed-file lint clean before build).
- Production deployed and confirmed serving source `8d773fb`.
- Full ES/EN/PT verification passed as described in section 12.4.
- Commit `8d773fb` pushed to `origin/main`; VPS repo in sync.

---

## 15. Known limitations and follow-ups

1. **Plan gating trusts a caller-supplied venue slug.** Admin endpoints are authenticated, but plan entitlement checks are not bound to a signed tenant token. Hardening candidate: mint the tenant into the session and derive it server-side.
2. **Static staff credentials live in the repo** (`shared/app-credentials.ts`) and are compared in plaintext at login. Acceptable for the current demo/sales phase; production hardening should move to hashed accounts and rotation.
3. **Rate limiting is per isolate**, not global. Cloudflare may run several isolates; use Durable Objects or KV counters if stricter limits are needed.
4. **Orders and catalog edits are device-local.** The kitchen, waiter and admin views on different devices do not share order state without a backend store. The KV-backed concierge/AR/waiters are cross-device; orders are not.
5. **Landing leads are WhatsApp-only.** No lead record is stored server-side.
6. **FAQ answers and inactive tabs are absent from the DOM**, so text-based i18n checks must exercise interactive states to avoid false missing-key reports.
7. **`wrangler.jsonc` shadows `wrangler.toml` during Pages deploys.** Keep KV bindings and secrets on the Pages project; the TOML is not the source of truth at deploy time.
8. **Build chunks exceed 500 kB** (model-viewer, main bundle, contract tools). Code-splitting is in place per page but vendor chunks remain large.
9. **AR/TTS depend on VPS services and DNS/CDN setup.** Validate provider secrets and asset domains before enabling AR for a new tenant.
10. **The build script copies `_redirects`**, but no `_redirects` file exists in the repo; routing currently relies on Pages SPA handling, `worker.ts`, and `_routes.json`.

---

## 16. Where to look

| Topic | Path |
| --- | --- |
| Routes and provider composition | `src/App.tsx` |
| Landing page | `src/pages/public/LandingTakeat.tsx` |
| Translations | `src/i18n/translations.ts`, `src/i18n/LanguageProvider.tsx` |
| Plans and entitlements | `shared/plans.ts`, `src/lib/plans.ts`, `src/components/PlanGate.tsx` |
| Venue resolution | `src/lib/venueRegistry.ts`, `src/data/provisioned_venues.json` |
| Auth client | `src/lib/authContext.tsx`, `src/lib/appSession.ts` |
| Session minting | `functions/api/auth/session.ts`, `functions/lib/app-session.ts` |
| Concierge engine | `src/lib/chatbot/engine.ts`, `src/lib/chatbot/service.ts` |
| Concierge UI | `src/components/chatbot/MenuChatbot.tsx` |
| Concierge API | `functions/api/concierge/`, `functions/lib/concierge-*.ts`, `shared/concierge.ts` |
| Concierge review screen | `src/pages/admin/AdminConcierge.tsx` |
| Edge plan enforcement | `functions/lib/plans.ts` |
| AR pipeline | `functions/api/ar/`, `functions/lib/kv-ar.ts`, `vps-worker/`, `docs/AR_PIPELINE.md` |
| Email | `functions/api/email/`, `functions/lib/email.ts` |
| KV adapter | `functions/lib/kv-storage.ts` |
| Brand-domain worker | `worker.ts`, `wrangler.jsonc` |
| Deploy scripts | `scripts/deploy-production.sh`, `scripts/deploy.sh` |
| Printing | `src/lib/printUtils.ts`, `print-server/` |
| Tests | `src/test/`, `src/**/__tests__/`, `tests/browser/` |

---

*Document generated 2026-11-01 for MiMenu release `8d773fb` (production deployment `e432ca77`).*
