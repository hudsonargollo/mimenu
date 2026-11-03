/**
 * KV persistence for the Dograh concierge.
 *
 *   concierge:settings:<venueId>   tenant-editable settings
 *   concierge:agent:<venueId>      Dograh workflow / embed-token mapping
 *   concierge:reservation:<venueId>:<reversedTs>:<id>
 *   concierge:reservation:idem:<venueId>:<key>
 */

import { normalizeSettings } from '../../shared/dograh/persona';
import type {
  ConciergeAgentRecord,
  ConciergeSettings,
  ConciergeReservation,
  VenueSnapshot,
} from '../../shared/dograh/types';

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export const settingsKey = (venueId: string) => `concierge:settings:${venueId}`;
export const agentKey = (venueId: string) => `concierge:agent:${venueId}`;
export const reservationKey = (venueId: string, reversedTime: string, id: string) =>
  `concierge:reservation:${venueId}:${reversedTime}:${id}`;
export const reservationIdempotencyKey = (venueId: string, key: string) =>
  `concierge:reservation:idem:${venueId}:${key}`;

export const RESERVATION_TTL_SECONDS = 400 * 24 * 60 * 60;
export const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

export async function readSettings(
  env: { MIMENU_KV?: KVLike },
  venue: VenueSnapshot
): Promise<ConciergeSettings> {
  if (!env.MIMENU_KV) return normalizeSettings(null, venue);
  const raw = await env.MIMENU_KV.get(settingsKey(venue.id));
  if (!raw) return normalizeSettings(null, venue);
  try {
    return normalizeSettings(JSON.parse(raw) as Partial<ConciergeSettings>, venue);
  } catch {
    return normalizeSettings(null, venue);
  }
}

export async function writeSettings(
  env: { MIMENU_KV?: KVLike },
  venue: VenueSnapshot,
  settings: Partial<ConciergeSettings>,
  updatedBy: string
): Promise<ConciergeSettings> {
  if (!env.MIMENU_KV) throw new Error('MIMENU_KV namespace not bound');
  const normalized = normalizeSettings(
    {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy,
    },
    venue
  );
  await env.MIMENU_KV.put(settingsKey(venue.id), JSON.stringify(normalized));
  return normalized;
}

export async function readAgent(
  env: { MIMENU_KV?: KVLike },
  venueId: string
): Promise<ConciergeAgentRecord | null> {
  if (!env.MIMENU_KV) return null;
  const raw = await env.MIMENU_KV.get(agentKey(venueId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConciergeAgentRecord;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeAgent(
  env: { MIMENU_KV?: KVLike },
  record: ConciergeAgentRecord
): Promise<void> {
  if (!env.MIMENU_KV) throw new Error('MIMENU_KV namespace not bound');
  await env.MIMENU_KV.put(agentKey(record.venueId), JSON.stringify(record));
}

export async function storeReservation(
  env: { MIMENU_KV?: KVLike },
  reservation: ConciergeReservation
): Promise<void> {
  if (!env.MIMENU_KV) throw new Error('MIMENU_KV namespace not bound');
  const reversedTime = String(9_999_999_999_999 - Date.now()).padStart(13, '0');
  await env.MIMENU_KV.put(
    reservationKey(reservation.venueId, reversedTime, reservation.id),
    JSON.stringify(reservation),
    { expirationTtl: RESERVATION_TTL_SECONDS }
  );
}
