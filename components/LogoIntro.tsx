import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/* Clicking any Preqal mark takes the reader home and, while they arrive, the
   mark in the top bar plays its short intro — the Q rolls in, the letters
   slide up to it — and settles back into the wordmark. The click and the
   playback live in different components (footer and top bar), so the request
   travels through this small context: `play` arms it, `playing` shows it,
   `stop` clears it once the intro ends. */
interface LogoIntroApi {
  playing: boolean;
  play: () => void;
  stop: () => void;
}

const LogoIntroContext = createContext<LogoIntroApi>({ playing: false, play: () => {}, stop: () => {} });

export const useLogoIntro = () => useContext(LogoIntroContext);

export const LogoIntroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playing, setPlaying] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return; // never shown, so never fetched
    warmLogoIntro().catch(() => {}); // a miss here just means the first click waits
  }, [prefersReduced]);

  // A reader who has asked for less motion gets the wordmark, not the roll-in.
  const play = useCallback(() => {
    if (prefersReduced) return;
    setPlaying(true);
  }, [prefersReduced]);
  const stop = useCallback(() => setPlaying(false), []);

  const api = useMemo(() => ({ playing, play, stop }), [playing, play, stop]);
  return <LogoIntroContext.Provider value={api}>{children}</LogoIntroContext.Provider>;
};

/* The intro is an animated PNG rather than a video. A video with an alpha
   plane needs one codec for Chromium and Firefox and a different one for
   Safari, chosen by sniffing the browser, and the Safari one played on a black
   slab on an actual iPhone. An APNG decodes with alpha in every engine through
   the ordinary image path, needs no autoplay permission, and can be proven in
   WebKit here. It is authored to play once (acTL plays = 1).

   Two consequences of it being an image. There is no "ended" event, so the
   wordmark comes back on a timer. And a once-only animation that has already
   run will, in WebKit, show its final frame when the same URL is mounted
   again — so each play gets a fresh object URL minted from one cached Blob,
   which restarts the animation without a second download. */
const INTRO_MS = 1700; // 50 frames at 30fps, plus a beat for the decode

let introBlob: Promise<Blob> | null = null;
/** Fetch the intro once and keep it; every play draws on the same bytes. */
export const warmLogoIntro = (): Promise<Blob> =>
  (introBlob ??= fetch(`${import.meta.env.BASE_URL}logo-intro.png`).then((r) => {
    if (!r.ok) throw new Error(`logo-intro.png ${r.status}`);
    return r.blob();
  }));

export const LogoIntroImage: React.FC<{ className?: string }> = ({ className }) => {
  const { stop } = useLogoIntro();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    let url = '';
    warmLogoIntro()
      .then((blob) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(stop);
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [stop]);

  // The clock starts when the frames are in hand, not when the click landed.
  const timer = React.useRef(0);
  const onLoad = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(stop, INTRO_MS);
  }, [stop]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const base = import.meta.env.BASE_URL;
  return (
    <img
      data-logo-intro=""
      /* Until the bytes arrive the static mark holds the slot, so nothing blinks. */
      src={src ?? `${base}Preqal%20Logo%20Sep25-9-400.webp`}
      alt="Preqal logo"
      className={className}
      width="506"
      height="124"
      decoding="sync"
      onLoad={src ? onLoad : undefined}
      /* If the image cannot load, the wordmark comes straight back. */
      onError={stop}
    />
  );
};
