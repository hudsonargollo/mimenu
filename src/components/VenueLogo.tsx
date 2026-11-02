import React from 'react';
import { isSafeMediaUrl } from '@/lib/media';
import { toVenueLogoLayout, venueLogoFrameStyle, venueLogoImageStyle } from '@/lib/venueLogo';
import type { Venue } from '@/types/mimenu';

interface VenueLogoProps {
  venue: Venue;
  name: string;
  className?: string;
}

/**
 * Tenant logo rendered exactly as configured in the admin cropper. Falls back
 * to the venue wordmark when no logo has been uploaded yet.
 */
export const VenueLogo: React.FC<VenueLogoProps> = ({ venue, name, className = '' }) => {
  const src = isSafeMediaUrl(venue.logo_url, true) ? venue.logo_url.trim() : '';

  if (!src) {
    return (
      <span
        className={`font-display text-xl font-semibold leading-none tracking-tight text-foreground sm:text-2xl ${className}`}
      >
        {name}
      </span>
    );
  }

  const layout = toVenueLogoLayout(venue);

  return (
    <span
      className={`relative block shrink-0 overflow-hidden [--logo-h:2.4rem] sm:[--logo-h:3.1rem] ${className}`}
      style={venueLogoFrameStyle(layout)}
    >
      <img
        src={src}
        alt={name}
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={venueLogoImageStyle(layout)}
      />
    </span>
  );
};

export default VenueLogo;
