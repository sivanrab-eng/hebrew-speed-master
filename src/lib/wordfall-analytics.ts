type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
let initialized = false;

export function initWordfallAnalytics() {
  const measurementId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY;
  if (typeof window === "undefined" || !measurementId || initialized) return;
  initialized = true;
  const analytics = window as AnalyticsWindow;
  analytics.dataLayer = analytics.dataLayer || [];
  analytics.gtag = function (..._args: unknown[]) {
    analytics.dataLayer?.push(arguments);
  };
  analytics.gtag("set", "developer_id.dZjgwMW", true);
  analytics.gtag("js", new Date());
  analytics.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  analytics.gtag("event", "page_view", { page_path: window.location.pathname, page_title: "Wordfall" });
}

export function trackWordfall(event: "game_start" | "game_complete" | "share" | "install_prompt" | "app_install", details: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  (window as AnalyticsWindow).gtag?.("event", event, { game_name: "Wordfall", ...details });
}