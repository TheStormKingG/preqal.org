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
  /** Direction of the move that brought the deck to `index`: 1 down, -1 up. */
  dir: 1 | -1;
}

const DeckContext = createContext<DeckApi | null>(null);

/** Slide components can call this to jump the deck (null outside a deck). */
export const useDeck = () => useContext(DeckContext);

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
  const [dir, setDir] = useState<1 | -1>(1);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const accRef = useRef(0);
  const lastWheelRef = useRef(0);
  const waitQuietRef = useRef(false);
  const touchYRef = useRef<number | null>(null);
  const unlockTimerRef = useRef(0);
  const count = slides.length;

  const releaseLock = useCallback(() => {
    lockedRef.current = false;
    waitQuietRef.current = true;
    accRef.current = 0;
  }, []);

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
      setDir(target > indexRef.current ? 1 : -1);
      indexRef.current = target;
      setIndex(target);
      // onAnimationComplete is the normal way out of the lock, but it never
      // fires if the transition is interrupted or the tab is hidden mid-slide.
      // Without this fallback the deck would stay locked and stop responding.
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(releaseLock, 1600);
    },
    [count, releaseLock],
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

  /* Touch / pen swipe, via Pointer Events.
     The old touchstart/touchend pair silently did nothing on Android: with the
     default touch-action the browser claims a vertical drag as an attempted
     scroll and ends the sequence with touchcancel, so touchend never fired.
     Pointer events + touch-action: none on the wrapper keep the gesture ours
     on both engines. Mouse drags stay excluded — the wheel handles desktop. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      touchYRef.current = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (touchYRef.current === null || lockedRef.current) {
        touchYRef.current = null;
        return;
      }
      const dy = touchYRef.current - e.clientY;
      touchYRef.current = null;
      if (Math.abs(dy) >= SWIPE_THRESHOLD) step(dy > 0 ? 1 : -1);
    };
    const onCancel = () => {
      touchYRef.current = null;
    };
    // Belt and braces for engines that still try to pan or rubber-band the
    // page from inside the deck (old iOS Safari quirks, pull-to-refresh).
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('touchmove', onTouchMove);
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
    window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(releaseLock, UNLOCK_DELAY);
  }, [releaseLock]);

  useEffect(() => () => window.clearTimeout(unlockTimerRef.current), []);

  return (
    <DeckContext.Provider value={{ goTo, index, count, dir }}>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100dvh - 5rem)', touchAction: 'none', overscrollBehavior: 'none' }}
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

      </div>
    </DeckContext.Provider>
  );
};

export default SlideDeck;
