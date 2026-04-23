import { useCallback, useEffect, useRef, useState } from 'react';

function getFullscreenElement(): Element | null {
  const d = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement ?? null;
}

async function exitFullscreen(): Promise<void> {
  const d = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };
  if (document.exitFullscreen) await document.exitFullscreen();
  else if (d.webkitExitFullscreen) await d.webkitExitFullscreen();
  else if (d.msExitFullscreen) await d.msExitFullscreen();
}

async function enterFullscreen(el: HTMLElement): Promise<void> {
  const anyEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };
  if (el.requestFullscreen) await el.requestFullscreen();
  else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen();
  else if (anyEl.msRequestFullscreen) await anyEl.msRequestFullscreen();
}

/** Request / exit fullscreen on a host element (standard + webkit + ms). */
export function useFullscreen<E extends HTMLElement = HTMLElement>() {
  const ref = useRef<E | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => {
      const host = ref.current;
      setActive(Boolean(host && getFullscreenElement() === host));
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    document.addEventListener('MSFullscreenChange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
      document.removeEventListener('MSFullscreenChange', sync);
    };
  }, []);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (getFullscreenElement() === el) await exitFullscreen();
      else await enterFullscreen(el);
    } catch {
      /* user denied or API unsupported */
    }
  }, []);

  return { ref, active, toggle };
}
