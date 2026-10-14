import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // Matches vite `base` so client routing works when the site is served
    // under a sub-path (e.g. GitHub Pages at /<repo>/). Defaults to "/".
    basepath: (import.meta.env["VITE_BASE_PATH"] ?? "/").replace(/\/$/, "") || "/",
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
