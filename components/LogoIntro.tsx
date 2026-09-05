import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/* Clicking any Preqal mark takes the reader home and, while they arrive, the
   mark in the top bar plays its short intro — the Q rolls in, the letters
   slide up to it — and settles back into the wordmark. The click and the
   playback live in different components (footer and top bar), so the request
   travels through this small context: `play` arms it, `playing` shows it,
   `stop` clears it once the video ends. */
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

  // A reader who has asked for less motion gets the wordmark, not the roll-in.
  const play = useCallback(() => {
    if (prefersReduced) return;
    setPlaying(true);
  }, [prefersReduced]);
  const stop = useCallback(() => setPlaying(false), []);

  const api = useMemo(() => ({ playing, play, stop }), [playing, play, stop]);
  return <LogoIntroContext.Provider value={api}>{children}</LogoIntroContext.Provider>;
};

/* Chrome, Firefox and Edge play VP9 with an alpha plane; Safari does not, and
   wants HEVC with alpha in a .mov instead. Safari will happily *play* the
   webm — without its alpha, on a white slab — so the choice has to be made
   here rather than left to <source> order. */
const prefersHevc = () =>
  typeof navigator !== 'undefined' &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|chromium|crios|android/i.test(navigator.userAgent);

/** The intro itself, sized and placed exactly where the wordmark sits. */
export const LogoIntroVideo: React.FC<{ className?: string }> = ({ className }) => {
  const { stop } = useLogoIntro();
  const base = import.meta.env.BASE_URL;
  const src = prefersHevc() ? `${base}logo-intro.mov` : `${base}logo-intro.webm`;
  return (
    <video
      src={src}
      className={className}
      width="1012"
      height="248"
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-label="Preqal logo"
      onEnded={stop}
      /* If the browser cannot play it, the wordmark comes straight back. */
      onError={stop}
    />
  );
};
