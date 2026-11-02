import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // The @google/model-viewer chunk is a heavy prebuilt web component that
    // ships at ~1 MB; exempt it from the 500 kB warning instead of forcing a
    // code-split that would break the embedded 3D viewer.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep the 3D viewer chunk isolated so it doesn't drag the main
          // entry bundle over the budget.
          "vendor-model-viewer": ["@google/model-viewer"],
        },
      },
    },
  },
}));
