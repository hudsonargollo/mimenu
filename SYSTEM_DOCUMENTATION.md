# MiMenu System Documentation

## Overview

MiMenu is a multi-tenant SaaS platform for digital menus, QR code ordering, kitchen display systems (KDS), and delivery management. It operates as a self-hosted solution with **0% transaction fees** - charging only a fixed monthly subscription.

**Live URLs:**
- Production: `mimenu.clubemkt.digital`
- Analytics Demo: `mimenu.clubemkt.online`

## Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vite + React 18 + TypeScript |
| **UI Framework** | Tailwind CSS + Radix UI components |
| **State Management** | React Context (MimenuProvider, CartProvider, AuthProvider) |
| **Styling** | HSL-based design tokens, glassmorphism effects |
| **Backend Runtime** | Cloudflare Pages + Workers Functions |
| **Data Storage** | Cloudflare KV (key-value) |
| **AR/3D Generation** | Meshy.ai API (Image-to-3D) |
| **Payments** | MercadoPago (Pix + Card) |
| **WhatsApp Integration** | Evolution API |

### File Structure

```
mimenu/
├── src/
│   ├── pages/
│   │   ├── public/         # Landing pages (LandingTakeat.tsx, etc.)
│   │   ├── customer/       # Customer-facing (Menu.tsx, Checkout.tsx, etc.)
│   │   ├── admin/          # Administrative dashboard
│   │   ├── staff/          # Cashier/KDS interface
│   │   └── waiter/         # Waiter mobile interface
│   ├── components/
│   │   ├── ARMenuViewer.tsx       # 3D/AR viewer component
│   │   ├── MimenuHeader.tsx       # Dynamic menu header
│   │   ├── CartDrawerExpress.tsx  # Express cart overlay
│   │   └── ui/                      # Radix UI components
│   ├── hooks/
│   │   └── useARModels.ts         # AR data fetching hooks
│   ├── lib/
│   │   └── mimenuContext.tsx        # Core state management
│   └── i18n/
│       └── translations.ts          # Multi-language support
├── functions/                      # Cloudflare Workers Functions
│   ├── api/ar/                     # AR/3D generation endpoints
│   │   ├── generate.ts              # POST /api/ar/generate
│   │   ├── status/[taskId].ts       # GET task status
│   │   ├── menu-items.ts            # GET menu items with AR data
│   │   └── queue.ts                 # Background worker enqueue
│   ├── api/mercadopago/           # Payment processing
│   └── api/whatsapp/              # WhatsApp bot integration
├── supabase/functions/            # Database functions (waiters, payments)
└── data/
    └── mimenuData.ts              # Initial test data
```

## Core Features

### 1. AR Menu (WebAR)

The AR Menu allows customers to view 3D models of food items directly in their browser.

**Technology:**
- `@google/model-viewer` web component
- Meshy.ai Image-to-3D API for generation
- iOS Quick Look (.usdz) and Android Scene Viewer support
- Cloudflare KV storage for AR metadata

**Key Files:**
- `src/components/ARMenuViewer.tsx` - 3D/AR display component
- `src/hooks/useARModels.ts` - AR data fetching
- `functions/api/ar/` - AR generation pipeline

**Workflow:**
1. Admin uploads menu item image
2. POST to `/api/ar/generate` triggers Meshy API
3. Returns task ID for polling
4. Models stored in KV under `menu_item:{id}` records
5. Customer views via "Ver en 3D" button on menu items

```typescript
// ARMenuItemRecord schema
interface ARMenuItemRecord {
  menu_item_id: string;
  ar_status: 'none' | 'generating' | 'ready' | 'failed';
  task_id?: string;
  glb_url?: string;      // For desktop WebGL
  usdz_url?: string;     // For iOS Quick Look
  thumbnail_url?: string;
  error?: string;
  updatedAt: number;
}
```

### 2. Self-Hosted Architecture

**No Transaction Fees** - Only fixed monthly subscription

**Deploy Command:**
```bash
npx wrangler pages deploy out \
  --project-name=mimenu \
  --commit-dirty=true \
  --branch=main
```

**Key Advantages:**
- Fixed costs vs percentage-based platforms
- Data ownership remains with restaurant
- Custom domain support
- No hidden fees on sales

**Infrastructure:**
- Cloudflare KV for real-time data sync
- KV Namespaces: `MIMENU_KV` (id: bfb8ba5a9b72487db588779f42883151)
- Environment variables stored securely in `wrangler.toml`

### 3. Multi-Tenant Menu System

**Venue Registry** (`src/lib/venueRegistry.ts`):
- Resolves tenant by URL slug or QR hash
- Dynamic table generation per venue
- Territory-based delivery fee calculation

**Menu Context** (`src/lib/mimenuContext.tsx`):
- Venue settings (name, currency, address, hours)
- Categories and menu items with images
- Hotness scoring algorithm for popularity
- Cycling offers system (smart upselling)
- Customer CRM with loyalty tiers
- Order management with status tracking

### 4. Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| QR Menu | `/` | Customer-facing menu |
| Admin Dashboard | `/admin` | Central control panel |
| Kitchen KDS | `/kitchen` | Order display for chefs |
| Cashier | `/cashier` | POS and table management |
| Waiter App | `/waiter` | Mobile order taking |
| Settings | `/admin/settings` | Venue configuration |
| Orders | `/orders` | Order management |

## Environment Variables

**Public (VITE_*):**
```bash
VITE_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."
VITE_EVOLUTION_API_URL="http://wppapi.clubemkt.digital"
VITE_EVOLUTION_API_KEY="DD451E404240-..."
VITE_EVOLUTION_INSTANCE_NAME="cocooo"
```

**Server Secrets:**
```bash
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
WHATSAPP_SESSION_ID="coco-loko-main"
WHATSAPP_ENCRYPTION_KEY="a1b2c3d4..."
MESHY_API_KEY="..."  # For AR generation
AR_WORKER_URL="..."   # VPS download worker
```

## API Endpoints

### AR Generation Endpoints

```
POST   /api/ar/generate           # Start 3D generation
GET    /api/ar/status/{taskId}    # Check generation status
GET    /api/ar/menu-items?ids=...  # Get AR records for items
```

### WhatsApp Endpoints

```
POST   /api/whatsapp/webhook      # Receive messages
GET    /api/whatsapp/connection   # Check connection status
POST   /api/whatsapp/send-message # Send message
```

### Payment Endpoints

```
POST   /api/mercadopago/create-payment    # Create Pix payment
POST   /api/mercadopago/create-card-payment # Card tokenization
POST   /api/mercadopago/webhook             # Payment notifications
```

### Waiter Management (Supabase Functions)

```
POST   /functions/v1/create-waiter
GET    /functions/v1/list-waiters       # Admin only
POST   /functions/v1/update-waiter-profile
POST   /functions/v1/delete-waiter
POST   /functions/v1/send-password-reset
```

## Data Models

### Menu Item
```typescript
interface MenuItemDetail {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url: string;
  hotness_score: number;      // 0-5 scale
  velocity_24h: number;       // Orders in last 24h
  baseline_14d: number;       // Average daily baseline
  is_best_seller?: boolean;
  dietary?: string[];         // Vegetarian, Gluten-free, etc.
  allergens?: string[];
  tags?: string[];
  reviews_count?: number;
  average_rating?: number;
}
```

### Order
```typescript
interface MimenuOrder {
  id: string;
  order_number: string;
  venue_id: string;
  fulfillment_type: 'dine_in' | 'delivery' | 'pickup';
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  items: { item_id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_method?: 'pix' | 'card' | 'qr_simple';
  payment_status: 'paid' | 'pending' | 'failed';
  created_at: string;
}
```

### Customer (CRM)
```typescript
interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  first_visit_at: string;
  last_visit_at: string;
  favorite_items: string[];
  loyalty_tier: 'Bronce' | 'Plata' | 'Oro' | 'VIP';
  notes?: string;
}
```

## Translation System

Multi-language support via `src/i18n/translations.ts`:

- **es**: Spanish (default)
- **en**: English
- **pt**: Portuguese

Language toggle in header navigates locale context.

## Testing

```bash
# Unit tests
npm run test:run

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Checklist

1. Run `npm run build` locally
2. Verify `dist/` directory contents
3. Deploy with wrangler: `npx wrangler pages deploy dist`
4. Configure custom domain in Cloudflare dashboard
5. Set secrets via `wrangler secret put KEY`
6. Verify KV namespaces are bound

## Known Issues & Notes

- WhatsApp notification queue disabled (Supabase not integrated)
- Some environment variables may need rotation
- AR generation requires public image URLs
- Hotness algorithm weights: velocity_24h (70%), baseline_14d (30%)