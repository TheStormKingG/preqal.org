// First-party conversion log — the private funnel dashboard's data source.
//
// GA is the other half of this. It cannot be the only half: reading GA back
// out needs the Data API, which needs a service account and a server-side
// call, and this site is static files behind a CDN. So every event that goes
// to GA is also appended here, where a page we control can read it.
//
// Three rules this file exists to hold:
//  1. Never block and never throw. Analytics failing must not affect a visitor.
//  2. Never carry personal data. The table is anon-writable by necessity
//     (see the migration's security note), so anything written here should be
//     assumed public.
//  3. Never sit in the main bundle. Supabase JS is large, and a page that
//     fires no events should not pay for it — hence the dynamic import.

const SESSION_KEY = 'preqal-analytics-session';

/**
 * An anonymous, per-tab identifier, used only to count distinct sessions in a
 * funnel. It is random, never derived from a person, an email or an address,
 * and it dies with the tab — so it cannot re-identify anyone or follow them
 * across visits.
 */
function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private mode, blocked storage: a one-shot id is still better than none.
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Append one event. Fire-and-forget by design: the returned promise is never
 * awaited by a caller, and every failure path is swallowed, because a visitor
 * must never see an analytics problem.
 *
 * The caller (trackEvent in ga.ts) owns the consent check. This function does
 * not re-check it — one gate, in one place, so the two can never disagree.
 */
export function recordConversion(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  void (async () => {
    try {
      const { supabase } = await import('../../lib/supabaseClient');
      await supabase.from('conversion_events').insert([
        {
          event_name: eventName.slice(0, 64),
          params,
          page_path: window.location.pathname.slice(0, 512),
          session_id: sessionId(),
          // Local runs write too, so the pipeline is verifiable before it
          // ships; the dashboard filters these out unless asked for them.
          env: import.meta.env.DEV ? 'dev' : 'prod',
        },
      ]);
    } catch {
      /* analytics must never surface to a visitor */
    }
  })();
}
