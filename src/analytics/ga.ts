// Google Analytics 4 integration
// Only loads if VITE_GA_ID is set AND the visitor has opted in (GDPR/ePrivacy).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const CONSENT_KEY = 'preqal-analytics-consent'; // 'granted' | 'denied'

export const getAnalyticsConsent = (): 'granted' | 'denied' | null => {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
};

export const setAnalyticsConsent = (value: 'granted' | 'denied') => {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  if (value === 'granted') initGA();
};

let gaLoaded = false;

export const initGA = () => {
  // Measurement IDs are public identifiers (they were previously inline in index.html).
  // Fallback keeps analytics working even when the VITE_GA_ID build secret is unset.
  const gaId = import.meta.env.VITE_GA_ID || 'G-NCFNGZR285';

  // Don't load GA in development, without an ID, without opt-in, or twice
  if (!gaId || import.meta.env.DEV || gaLoaded || getAnalyticsConsent() !== 'granted') {
    return;
  }
  gaLoaded = true;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    (window.dataLayer as unknown[]).push(args);
  }
  window.gtag = gtag;

  // Load GA4 script asynchronously
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize GA4 + Google Ads (both consent-gated — nothing loads before opt-in)
  gtag('js', new Date());
  gtag('config', gaId, {
    send_page_view: true
  });
  gtag('config', 'AW-693698781');
};

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * A route change inside the SPA. The initial load is already counted by
 * `send_page_view` in initGA, so the caller must skip the first render or
 * the landing page is counted twice. Re-issuing `config` would also reset
 * the stream's settings on every navigation; a `page_view` event does not.
 */
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title
    });
  }
};

