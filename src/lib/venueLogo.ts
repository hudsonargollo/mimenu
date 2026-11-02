import type { CSSProperties } from 'react';
import type { Venue } from '@/types/mimenu';

/** Visible logo slot ratio (width / height). Horizontal marks read best. */
export const LOGO_ASPECT_MIN = 1;
export const LOGO_ASPECT_MAX = 5;
export const LOGO_ZOOM_MIN = 1;
export const LOGO_ZOOM_MAX = 3;

export const LOGO_ASPECT_PRESETS = [1, 1.5, 2, 3, 4, 5] as const;

export interface VenueLogoLayout {
  /** Visible slot ratio. */
  aspect: number;
  /** Image scale inside the slot. */
  zoom: number;
  /** Pan in % of the slot, clamped so the slot stays covered. */
  x: number;
  y: number;
}

export const DEFAULT_LOGO_LAYOUT: VenueLogoLayout = {
  aspect: 2,
  zoom: LOGO_ZOOM_MIN,
  x: 0,
  y: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export function normalizeLogoAspect(value: number | undefined): number {
  if (!value || !Number.isFinite(value)) return DEFAULT_LOGO_LAYOUT.aspect;
  return round(clamp(value, LOGO_ASPECT_MIN, LOGO_ASPECT_MAX));
}

export function normalizeLogoZoom(value: number | undefined): number {
  if (!value || !Number.isFinite(value)) return DEFAULT_LOGO_LAYOUT.zoom;
  return round(clamp(value, LOGO_ZOOM_MIN, LOGO_ZOOM_MAX));
}

/**
 * Pan range in % of the slot before an edge would show. `sourceAspect` is the
 * uploaded file's own ratio; when the slot is narrower/taller than the file,
 * `object-fit: cover` already crops it, so part of that crop can be panned
 * even at zoom 1.
 */
export function logoPanLimits(
  layout: VenueLogoLayout,
  sourceAspect: number = layout.aspect,
): { x: number; y: number } {
  const source = sourceAspect > 0 && Number.isFinite(sourceAspect) ? sourceAspect : layout.aspect;
  const displayWidth = Math.max(layout.aspect, source) * layout.zoom;
  const displayHeight = displayWidth / source;
  return {
    x: round(Math.max(0, (displayWidth / layout.aspect - 1) * 50)),
    y: round(Math.max(0, (displayHeight - 1) * 50)),
  };
}

export function clampLogoLayout(layout: VenueLogoLayout, sourceAspect?: number): VenueLogoLayout {
  const limits = logoPanLimits(layout, sourceAspect);
  return {
    ...layout,
    x: round(clamp(layout.x, -limits.x, limits.x)),
    y: round(clamp(layout.y, -limits.y, limits.y)),
  };
}

export function toVenueLogoLayout(
  value: Pick<Venue, 'logo_aspect' | 'logo_zoom' | 'logo_x' | 'logo_y' | 'logo_source_aspect'>,
): VenueLogoLayout {
  const layout: VenueLogoLayout = {
    aspect: normalizeLogoAspect(value.logo_aspect),
    zoom: normalizeLogoZoom(value.logo_zoom),
    x: Number.isFinite(value.logo_x) ? Number(value.logo_x) : 0,
    y: Number.isFinite(value.logo_y) ? Number(value.logo_y) : 0,
  };
  const sourceAspect =
    value.logo_source_aspect && Number.isFinite(value.logo_source_aspect)
      ? normalizeLogoAspect(value.logo_source_aspect)
      : layout.aspect;
  return clampLogoLayout(layout, sourceAspect);
}

/** A freshly uploaded image starts uncropped: slot ratio matches the file. */
export function logoLayoutFromSize(width: number, height: number): VenueLogoLayout {
  const aspect = width > 0 && height > 0 ? normalizeLogoAspect(width / height) : DEFAULT_LOGO_LAYOUT.aspect;
  return {
    aspect,
    zoom: LOGO_ZOOM_MIN,
    x: 0,
    y: 0,
  };
}

/** Visible slot; height derives from the CSS custom property `--logo-h`. */
export function venueLogoFrameStyle(layout: VenueLogoLayout): CSSProperties {
  return {
    width: `calc(var(--logo-h, 2.75rem) * ${layout.aspect})`,
    aspectRatio: String(layout.aspect),
    maxWidth: 'min(46vw, 18rem)',
  };
}

/** Same transform in the admin cropper and in the customer header. */
export function venueLogoImageStyle(layout: VenueLogoLayout): CSSProperties {
  return {
    transform: `translate(${layout.x}%, ${layout.y}%) scale(${layout.zoom})`,
  };
}
