import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ─── Full-screen slide deck ───
   Replaces free scrolling with one-gesture-one-slide navigation: wheel,
   trackpad, touch swipe, and keyboard all animate the deck to the next or
   previous full-viewport slide. Each slide owns exactly one viewport — no
   partial sections, no cut-off content. */

export interface DeckSlide {
  label: string;
  node: React.ReactNode;
}

interface DeckApi {
  goTo: (i: number) => void;
  index: number;
  count: number;
}

const DeckContext = createContext<DeckApi | null>(null);

/** Slide components can call this to jump the deck (null outside a deck). */
export const useDeck = () => useContext(DeckContext);

/** True when the viewport is wide enough for the slide experience. */
export const useDeckMode = (minWidth = 1024): boolean => {
  const query = `(min-width: ${minWidth}px)`;
  const [deck, setDeck] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setDeck(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return deck;
};

const WHEEL_THRESHOLD = 48; // accumulated deltaY that counts as a gesture
const WHEEL_GESTURE_GAP = 120; // ms between events that still belong to one gesture
const QUIET_GAP = 160; // ms of wheel silence required after a slide change
const SWIPE_THRESHOLD = 60; // px of touch travel that counts as a swipe
const UNLOCK_DELAY = 200; // ms cooldown after the transition settles

const SlideDeck: React.FC<{ slides: DeckSlide[] }> = ({ slides }) => {
  const prefersReduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [slideH, setSlideH] = useState(0);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const accRef = useRef(0);
  const lastWheelRef = useRef(0);
  const waitQuietRef = useRef(false);
  const touchYRef = useRef<number | null>(null);
  const count = slides.length;

  /* Track the wrapper's own height, not just window resizes — mobile URL-bar
     show/hide and browser-chrome changes move 100dvh without a resize event,
     and a stale slide height would let content spill past a slide edge. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSlideH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(count - 1, i));
      if (target === indexRef.current) return;
      lockedRef.current = true;
      indexRef.current = target;
      setIndex(target);
    },
    [count],
  );

  const step = useCallback((dir: 1 | -1) => goTo(indexRef.current + dir), [goTo]);

  /* Wheel / trackpad: swallow every event, advance once per gesture.
     Trackpad inertia keeps firing after a flick, so after each slide change
     we ignore events until the stream pauses (QUIET_GAP). */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheelRef.current;
      lastWheelRef.current = now;
      if (lockedRef.current) return;
      if (waitQuietRef.current) {
        if (gap < QUIET_GAP) return;
        waitQuietRef.current = false;
      }
      accRef.current = gap < WHEEL_GESTURE_GAP ? accRef.current + e.deltaY : e.deltaY;
      if (Math.abs(accRef.current) >= WHEEL_THRESHOLD) {
        const dir: 1 | -1 = accRef.current > 0 ? 1 : -1;
        accRef.current = 0;
        step(dir);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [step]);

  /* Touch swipe (touch laptops / wide tablets). */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (touchYRef.current === null || lockedRef.current) return;
      const dy = touchYRef.current - e.changedTouches[0].clientY;
      touchYRef.current = null;
      if (Math.abs(dy) >= SWIPE_THRESHOLD) step(dy > 0 ? 1 : -1);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [step]);

  /* Keyboard. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
      )
        return;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          step(1);
          break;
        case ' ':
          e.preventDefault();
          step(e.shiftKey ? -1 : 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          step(-1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(count - 1);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, goTo, count]);

  const unlock = useCallback(() => {
    window.setTimeout(() => {
      lockedRef.current = false;
      waitQuietRef.current = true;
      accRef.current = 0;
    }, UNLOCK_DELAY);
  }, []);

  return (
    <DeckContext.Provider value={{ goTo, index, count }}>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100dvh - 5rem)' }}
        /* Focus-triggered auto-scroll would silently offset the hidden-overflow
           wrapper and desync it from the transform — pin it back. */
        onScroll={(e) => {
          e.currentTarget.scrollTop = 0;
        }}
      >
        <motion.div
          className="w-full"
          animate={{ y: slideH ? -index * slideH : 0 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={unlock}
        >
          {slides.map((s, i) => (
            <section
              key={s.label}
              aria-label={s.label}
              aria-hidden={i !== index}
              className="w-full overflow-hidden"
              style={{ height: slideH || '100%' }}
            >
              {s.node}
            </section>
          ))}
        </motion.div>

        {/* Dot navigation */}
        <div className="fixed right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
          {slides.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-label={`Go to ${s.label}`}
              aria-current={i === index ? 'true' : undefined}
              title={s.label}
              onClick={() => goTo(i)}
              className="h-4 w-4 flex items-center justify-center"
            >
              <span
                className="rounded-full transition-all duration-300"
                style={
                  i === index
                    ? {
                        width: 10,
                        height: 10,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 0 10px rgba(245,158,11,0.55)',
                      }
                    : {
                        width: 7,
                        height: 7,
                        background: 'rgba(100,116,139,0.35)',
                      }
                }
              />
            </button>
          ))}
        </div>
      </div>
    </DeckContext.Provider>
  );
};

export default SlideDeck;
