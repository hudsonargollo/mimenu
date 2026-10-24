export type FulfillmentType = 'dine_in' | 'pickup' | 'delivery';

export type HotnessLevel = 1 | 2 | 3 | 4 | 5;

/** Plan + asset data collected during onboarding, used to build the premium landing. */
export interface LandingAssets {
  logoFile: string | null;
  featuredPhotos: string[];
  plan: 'basic' | 'pro' | 'premium' | 'custom';
  billingCycle: 'monthly' | 'yearly';
  hasCustomWebsite: boolean;
  hasCrm: boolean;
  hasAiConcierge: boolean;
  hasAiAnalytics: boolean;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  /** Localized venue name, used when the tenant carries translations. */
  name_i18n?: Record<'es' | 'en' | 'pt', string>;
  /** Localized venue tagline, used when the tenant carries translations. */
  tagline_i18n?: Record<'es' | 'en' | 'pt', string>;
  description: string;
  /** Localized venue description, used when the tenant carries translations. */
  description_i18n?: Record<'es' | 'en' | 'pt', string>;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  currency: string; // e.g. "Bs."
  currency_code: string; // e.g. "BOB"
  logo_url: string;
  banner_url: string;
  primary_color: string;
  accent_color: string;
  background_theme: 'dark' | 'light';
  opening_hours: string;
  instagram?: string;
  facebook?: string;
  google_review_url?: string;
  is_active: boolean;
  /** Onboarding-collected plan and landing assets. */
  landing_assets?: LandingAssets;
  delivery_zones?: {
    name: string;
    fee: number;
    estimated_mins: string;
  }[];
}

export interface MenuItemReview {
  id: string;
  item_id: string;
  customer_name: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface MenuItemDetail {
  id: string;
  venue_id: string;
  category_id: string;
  name: string;
  /** Localized names (es / en / pt) when the venue carries them. */
  name_i18n?: Record<'es' | 'en' | 'pt', string>;
  description: string | null;
  /** Localized descriptions (es / en / pt) when the venue carries them. */
  description_i18n?: Record<'es' | 'en' | 'pt', string> | null;
  price: number;
  original_price?: number;
  image_url: string;
  is_available: boolean;
  is_best_seller?: boolean;
  is_featured?: boolean;
  // Hotness Algorithm Metrics
  hotness_score: HotnessLevel; // 1 (Cold) to 5 (On Fire)
  velocity_24h: number; // orders in last 24h
  baseline_14d: number; // daily average over last 14d
  reviews_count: number;
  average_rating: number;
  tags?: string[];
  allergens?: string[]; // e.g. ["Gluten", "Lácteos", "Huevo", "Maní", "Mariscos", "Soja"]
  dietary?: string[]; // e.g. ["Sin Gluten", "Vegetariano", "Vegano", "Picante"]
  options?: {
    name: string;
    choices: { label: string; extra_price: number }[];
  }[];
}

export interface MenuCategoryDetail {
  id: string;
  venue_id: string;
  key: string;
  name: string;
  /** Localized category names (es / en / pt) when the venue carries them. */
  name_i18n?: Record<'es' | 'en' | 'pt', string>;
  description?: string;
  icon?: string;
  order_index: number;
  items: MenuItemDetail[];
}

export interface CyclingOfferSchedule {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday, -1 = Every day
  start_time: string; // "18:00"
  end_time: string; // "21:00"
}

export interface CyclingOfferAnalytics {
  impressions: number;
  clicks: number;
  add_to_carts: number;
  conversions: number;
  revenue_generated: number;
}

export interface CyclingOffer {
  id: string;
  venue_id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  original_price: number;
  discount_price: number;
  image_url: string;
  is_active: boolean;
  priority_level: number;
  included_item_names: string[];
  schedules: CyclingOfferSchedule[];
  analytics: CyclingOfferAnalytics;
}

export interface VenueTable {
  id: string;
  venue_id: string;
  table_number: string; // "1", "2", "VIP 1", "Barra 1"
  label: string;
  qr_code_hash: string;
  zone: 'Principal' | 'Terraza' | 'VIP' | 'Barra';
  is_occupied: boolean;
  is_active: boolean;
}

export interface MerchandiseItem {
  id: string;
  venue_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  sizes?: string[]; // e.g. ["S", "M", "L", "XL"]
  is_available: boolean;
}

export interface MimenuOrder {
  id: string;
  order_number: string;
  venue_id: string;
  fulfillment_type: FulfillmentType;
  table_number?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  delivery_reference?: string;
  delivery_zone?: string;
  delivery_fee?: number;
  pickup_eta?: string;
  customer_notes?: string;
  tip_amount?: number;
  items: {
    item_id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    selected_options?: string[];
  }[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_method: 'cash' | 'qr_simple' | 'card';
  payment_status: 'pending' | 'paid';
  created_at: string;
}

export interface CustomerProfile {
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
