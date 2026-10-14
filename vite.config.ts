// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Base path for static hosting (GitHub Pages serves under /<repo>/).
// Locally and on Lovable hosting it stays "/".
const base = process.env["VITE_BASE_PATH"] ?? "/";

export default defineConfig({
  vite: {
    base,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static prerender for GitHub Pages: the whole app is client-side
    // (vocabulary and game logic are bundled), so "/" is rendered once at
    // build time and served as a static file.
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
    // Declared so the route manifest matches the router's runtime basepath.
    router: { basepath: base === "/" ? "/" : base.replace(/\/$/, "") },
  },
});
