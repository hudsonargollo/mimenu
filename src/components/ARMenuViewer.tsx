/**
 * ARMenuViewer — customer/admin 3D preview with native AR support.
 *
 * Wraps <model-viewer> (@google/model-viewer) as a custom element, loaded
 * client-side to avoid SSR/window issues (PRD: components/ARMenuViewer.jsx).
 *
 * - iOS Safari uses Quick Look via `ios-src` (.usdz)
 * - Android Chrome uses Scene Viewer via `ar-modes="scene-viewer"`
 * - Desktop browsers render an in-page 3D sandbox (.glb)
 */

import React, { useEffect, useMemo, useRef } from 'react';

declare global {
  // <model-viewer> custom element (registered by the dynamic import below).
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        alt?: string;
        ar?: boolean | string;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
      };
    }
  }
}

export interface ARMenuViewerProps {
  glbSrc: string;
  iosSrc?: string;
  altText?: string;
  productName?: string;
  /** Height of the sandbox canvas (default 320px) */
  height?: string | number;
  /** autoRotate on by default */
  autoRotate?: boolean;
}

const ARMenuViewer: React.FC<ARMenuViewerProps> = ({
  glbSrc,
  iosSrc,
  altText,
  productName,
  height = 320,
  autoRotate = true,
}) => {
  const loaded = useRef(false);

  useEffect(() => {
    // Dynamic import client-side: model-viewer is a web component that touches
    // window/customElements during registration.
    if (!loaded.current) {
      loaded.current = true;
      void import('@google/model-viewer');
    }
  }, []);

  const style = useMemo(() => ({ width: '100%', height, backgroundColor: '#f3f4f6' }), [height]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden p-4">
      {productName && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{productName}</h3>
      )}

      <model-viewer
        src={glbSrc}
        ios-src={iosSrc || glbSrc}
        alt={altText || productName}
        ar
        ar-modes="scene-viewer quick-look webxr"
        ar-scale="fixed"
        camera-controls
        auto-rotate={autoRotate ? '' : undefined}
        shadow-intensity="1"
        style={style}
      >
        <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 cursor-pointer"
        >
          <span>📦 Ver en tu mesa (AR)</span>
        </button>
      </model-viewer>

      <p className="text-[11px] text-gray-400 mt-2 text-center">
        {_deviceHint()}
      </p>
    </div>
  );
};

function _deviceHint(): string {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'Toca el botón de arriba para abrir en Realidad Aumentada (Quick Look).';
  if (/Android/.test(ua)) return 'Toca el botón de arriba para abrir en Realidad Aumentada (Scene Viewer).';
  return 'En desktop puedes girar el modelo 3D con el mouse. El botón AR se activa en móviles.';
}

export default ARMenuViewer;
