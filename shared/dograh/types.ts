/**
 * Shared contract for the Dograh-backed concierge.
 *
 * This module is dependency-free so the SPA, Cloudflare Pages Functions and
 * the Node sync script can all import it.
 */

export type ConciergeLang = 'es' | 'en' | 'pt';
export type ConciergeTone = 'cercano' | 'formal' | 'divertido';
export type ConciergeToolScope = 'menu' | 'venue' | 'faq' | 'reservation';

export interface ConciergeFaqEntry {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ConciergeHoursBlock {
  days: string;
  open: string;
  close: string;
  note?: string;
}

/** Tenant-editable concierge configuration stored in KV. */
export interface ConciergeSettings {
  enabled: boolean;
  assistantName: string;
  greeting: string;
  languages: ConciergeLang[];
  tone: ConciergeTone;
  hours: ConciergeHoursBlock[];
  serviceNotes: string;
  reservationEnabled: boolean;
  reservationEmail: string;
  maxPartySize: number;
  whatsapp: string;
  faq: ConciergeFaqEntry[];
  handoffMessage: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

/** Flat, tool-facing view of one menu item. */
export interface VenueMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryKey: string;
  categoryName: string;
  available: boolean;
  featured: boolean;
  tags: string[];
  allergens: string[];
  dietary: string[];
}

export interface VenueMenuCategory {
  key: string;
  name: string;
  itemCount: number;
}

/** Minimal venue data the renderer and the tool endpoints need. */
export interface VenueSnapshot {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  currency: string;
  isActive: boolean;
  /** Absolute URL, or a path the renderer resolves against the public origin. */
  menuUrl: string;
  categories: VenueMenuCategory[];
  items: VenueMenuItem[];
}

export interface ConciergeToolNames {
  menu: string;
  venueInfo: string;
  faq: string;
  reservation: string;
}

export interface RenderedConcierge {
  templateVersion: string;
  configHash: string;
  prompt: string;
  greeting: string;
  menuUrl: string;
  toolNames: ConciergeToolNames;
  venue: VenueSnapshot;
  settings: ConciergeSettings;
}

/** Signed claims carried by a tenant tool token. */
export interface ConciergeToolClaims {
  v: 1;
  slug: string;
  vid: string;
  scope: ConciergeToolScope[];
  exp: number;
}

/** KV record that maps a tenant to its Dograh workflow and public widget. */
export interface ConciergeAgentRecord {
  venueId: string;
  venueSlug: string;
  enabled: boolean;
  workflowId: number;
  workflowUuid: string;
  credentialUuid: string;
  toolUuids: string[];
  embedToken: string;
  embedTokenId: number;
  widgetType: 'chat' | 'voice';
  embedMode: 'floating' | 'inline' | 'headless';
  templateVersion: string;
  configHash: string;
  syncedAt: string;
  syncStatus: 'synced' | 'error';
  error?: string;
}

export interface ConciergeReservation {
  id: string;
  venueId: string;
  venueSlug: string;
  name: string;
  phone: string;
  partySize: number;
  /** ISO date (YYYY-MM-DD) in the venue's local day. */
  date: string;
  /** 24h time (HH:MM). */
  time: string;
  notes: string;
  lang: ConciergeLang;
  status: 'pending';
  source: 'dograh';
  createdAt: string;
}

export interface DograhWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface DograhWorkflowDefinition {
  nodes: DograhWorkflowNode[];
  edges: unknown[];
  viewport: { x: number; y: number; zoom: number };
}

export interface DograhToolParameterSpec {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

/** Payload accepted by `POST /api/v1/tools/` in Dograh. */
export interface DograhHttpToolSpec {
  name: string;
  description: string;
  category: 'http_api';
  definition: {
    type: 'http_api';
    schema_version: 1;
    messages: unknown[];
    config: {
      method: 'GET' | 'POST';
      url: string;
      credential_uuid?: string;
      parameters: DograhToolParameterSpec[];
      timeout_ms: number;
    };
  };
}

/** Raw registry shapes (only the fields the concierge reads). */
export interface RegistryVenueItem {
  id: string;
  name: string;
  name_i18n?: Record<string, string>;
  description?: string;
  description_i18n?: Record<string, string>;
  price: number;
  is_available?: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  allergens?: string[] | null;
  dietary?: string[] | null;
}

export interface RegistryVenueCategory {
  key: string;
  name: string;
  name_i18n?: Record<string, string>;
  items?: RegistryVenueItem[];
}

export interface RegistryVenue {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  currency?: string;
  is_active?: boolean;
  categories?: RegistryVenueCategory[];
}
