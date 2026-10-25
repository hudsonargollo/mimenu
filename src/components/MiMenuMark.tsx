import React from 'react';

interface MiMenuMarkProps {
  /** Rendered height in px. Width follows the mark's 1.58:1 aspect. */
  size?: number;
  /** Extra classes on the <img>. */
  className?: string;
  /** Light chip behind the mark — use on dark backgrounds so the purple reads. */
  onDark?: boolean;
  alt?: string;
}

/**
 * The MiMenu mark.
 *
 * Renders /mimenu.svg with proper sizing.
 */
export const MiMenuMark: React.FC<MiMenuMarkProps> = ({
  size = 28,
  className = '',
  onDark = false,
  alt = 'MiMenu',
}) => {
  if (onDark) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-white overflow-hidden ${className}`}
        style={{ height: size, width: size }}
      >
        <img src="/mimenu.svg" alt={alt} style={{ height: size * 0.76, width: size * 0.76 }} />
      </span>
    );
  }

  return (
    <img
      src="/mimenu.svg"
      alt={alt}
      style={{ height: size, width: size }}
      className={className}
    />
  );
};

export default MiMenuMark;
