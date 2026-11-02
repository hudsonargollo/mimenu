/** Bootstraps the Google Maps JavaScript API only when a key is configured.
 *
 * The key is expected to be provided as a Cloudflare Pages secret mapped to
 * `VITE_GOOGLE_MAPS_API_KEY` (public, not secret). When no key is present the
 * loader returns early so the public pages keep working with the
 * no-key Google Maps embed/search fallback.
 *
 * Uses a module script so `import.meta.env` is available (Vite replaces
 * `import.meta.env` in ES modules; it is NOT available in classic inline
 * scripts in the HTML).
 */

let loaded = false;
let promise: Promise<boolean> | null = null;

export function getGoogleMapsKey(): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
}

export function loadGoogleMapsScript(): Promise<boolean> {
  if (loaded) {
    return Promise.resolve(true);
  }
  if (promise) {
    return promise;
  }
  promise = new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      loaded = true;
      return resolve(false);
    }
    if (document.getElementById("mimenu-google-maps-script")) {
      loaded = true;
      return resolve(true);
    }

    const key = getGoogleMapsKey();
    if (!key) {
      loaded = true;
      return resolve(false);
    }

    const script = document.createElement("script");
    script.id = "mimenu-google-maps-script";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;

    script.onload = () => {
      loaded = true;
      resolve(true);
    };
    script.onerror = () => {
      loaded = true;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return promise;
}

export function isGoogleMapsScriptLoaded(): boolean {
  return loaded;
}
