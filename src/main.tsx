import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Bootstraps the Google Maps JS API (only when VITE_GOOGLE_MAPS_API_KEY is
// provided as a Cloudflare Pages public secret). No-op when no key is set.
void (async () => {
  await import("./lib/googleMaps.ts");
})();

createRoot(document.getElementById("root")!).render(<App />);
