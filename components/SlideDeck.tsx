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
  /* A slide whose content genuinely cannot fit one screen — a long form, say.
     It scrolls inside itself, and the deck only takes over once that inner
     scroll has run out in the direction of travel. */
  scrollable?: boolean;
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

/** True below `maxWidth` — for pages that only run as a deck on phones. */
export const useBelowWidth = (maxWidth = 1024): boolean => {
  const query = `(max-width: ${maxWidth - 1}px)`;
  const [below, setBelow] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setBelow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return below;
};

const WHEEL_THRESHOLD = 26; // accumulated deltaY that counts as a gesture
const WHEEL_GESTURE_GAP = 120; // ms between events that still belong to one gesture
const QUIET_GAP = 160; // ms of wheel silence required after a slide change
const SWIPE_THRESHOLD = 34; // px of touch travel that counts as a swipe
/* A flick is short but quick. Distance alone would make the deck feel heavy —
   the reader has already committed by the time a fast thumb has moved 16px. */
const FLICK_DISTANCE = 16; // px
const FLICK_VELOCITY = 0.38; // px per ms
const AXIS_DOMINANCE = 1.2; // vertical travel must beat sideways to move the deck
const LINE_HEIGHT = 16; // px per line, for engines that report wheel deltas in lines
/* Big enough that a coasting trackpad is past it by the time a slide lands,
   small enough that one mouse notch clears it on every engine. */
const PUSH_DELTA = 30;
/* A flick is still ramping up when the slide it asked for starts moving, so
   pushes are only counted once that ramp is over. */
const PUSH_GRACE = 200; // ms into a slide before a further push counts as a new one
const UNLOCK_DELAY = 80; // ms cooldown after the transition settles
const SLIDE_MS = 520; // one slide's travel
const PAGE_LOCK_MS = 420; // gesture cooldown while a slide pages inside itself

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
  const lastSizeRef = useRef(Infinity);
  const lockStartRef = useRef(0);
  const queuedRef = useRef<1 | -1 | 0>(0);
  const stepRef = useRef<((dir: 1 | -1) => void) | null>(null);
  const touchYRef = useRef<number | null>(null);
  const touchXRef = useRef(0);
  const touchTimeRef = useRef(0);
  const consumedRef = useRef(false);
  const scrollerRef = useRef<HTMLElement | null>(null);

  const unlockTimerRef = useRef(0);
  const count = slides.length;

  /* The scrollable slide under an event, if any, and whether it still has
     room to scroll the way the reader is going. */
  const innerScroller = useCallback((target: EventTarget | null): HTMLElement | null => {
    let el = target as HTMLElement | null;
    while (el && el !== wrapRef.current) {
      if (el.dataset && el.dataset.deckScrollable === 'true') return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  const hasRoom = (el: HTMLElement, direction: 1 | -1) =>
    direction > 0
      ? Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 1
      : el.scrollTop > 1;

  /* The stops a scrollable slide can rest at: the top, the end, and any
     [data-deck-break] the content declares. A break marks a real boundary in
     the content — the start of a form's second half, say — so a gesture never
     leaves the reader mid-field. Content that declares none is divided into
     even screenfuls instead. */
  const scrollStops = (el: HTMLElement): number[] => {
    const max = el.scrollHeight - el.clientHeight;
    const declared = Array.from(el.querySelectorAll<HTMLElement>('[data-deck-break]')).map(
      (b) => b.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop,
    );
    const pages = Math.max(1, Math.ceil(el.scrollHeight / el.clientHeight) - 1);
    const raw = declared.length
      ? declared
      : Array.from({ length: pages }, (_, i) => ((i + 1) * max) / pages);
    const stops = [0, ...raw.map((v) => Math.max(0, Math.min(max, Math.round(v)))), max];
    return Array.from(new Set(stops)).sort((a, b) => a - b);
  };

  /* A slide that scrolls inside itself moves one stop per gesture rather than
     dragging freely, so a long panel reads as a small run of full views
     instead of an unbounded scroll. */
  const pageScroll = useCallback(
    (el: HTMLElement, direction: 1 | -1) => {
      const stops = scrollStops(el);
      const here = el.scrollTop;
      const target =
        direction > 0
          ? (stops.find((v) => v > here + 4) ?? stops[stops.length - 1])
          : ([...stops].reverse().find((v) => v < here - 4) ?? 0);
      el.scrollTo({ top: target, behavior: prefersReduced ? 'auto' : 'smooth' });
      lockedRef.current = true; // ignore the tail of the same gesture
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(() => { lockedRef.current = false; }, PAGE_LOCK_MS);
    },
    [prefersReduced],
  );

  const releaseLock = useCallback(() => {
    lockedRef.current = false;
    waitQuietRef.current = true;
    accRef.current = 0;
    lastSizeRef.current = Infinity; // nothing to compare the first event against
    const queued = queuedRef.current;
    queuedRef.current = 0;
    if (queued) stepRef.current?.(queued);
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
      lockStartRef.current = performance.now();
      lastSizeRef.current = Infinity;
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
  // releaseLock is defined above step and takes any queued push through this.
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /* Wheel / trackpad: swallow every event, advance once per gesture.
     After a slide lands, a trackpad is usually still coasting, and letting that
     coast through would skip slides. Waiting for the stream to fall silent is
     the wrong cure though — a held mouse wheel and a second deliberate flick
     never go silent either, so the deck used to sit dead through both. What
     separates them is shape, not silence: inertia only ever decays, so a large
     event that is not smaller than the one before it is a real push. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheelRef.current;
      lastWheelRef.current = now;
      // Firefox reports lines and some setups report pages; without this a
      // notch reads as deltaY 3 and the deck needs a dozen of them to move.
      const dy =
        e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT
        : e.deltaMode === 2 ? e.deltaY * el.clientHeight
        : e.deltaY;
      const size = Math.abs(dy);

      /* Asking for the next slide while this one is still travelling is a
         deliberate act, and dropping it is what makes a deck feel deaf. Hold
         one step and take it the moment the slide lands. */
      if (lockedRef.current) {
        const pushing = size >= PUSH_DELTA && size >= lastSizeRef.current;
        lastSizeRef.current = size;
        if (pushing && now - lockStartRef.current >= PUSH_GRACE) queuedRef.current = dy > 0 ? 1 : -1;
        return;
      }

      if (waitQuietRef.current) {
        const pushing = size >= PUSH_DELTA && size >= lastSizeRef.current;
        lastSizeRef.current = size;
        if (gap < QUIET_GAP && !pushing) return;
        waitQuietRef.current = false;
        accRef.current = 0;
      }

      accRef.current = gap < WHEEL_GESTURE_GAP ? accRef.current + dy : dy;
      if (Math.abs(accRef.current) >= WHEEL_THRESHOLD) {
        const dir: 1 | -1 = accRef.current > 0 ? 1 : -1;
        accRef.current = 0;
        const scroller = innerScroller(e.target);
        if (scroller && hasRoom(scroller, dir)) {
          pageScroll(scroller, dir);
          return;
        }
        step(dir);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [step, innerScroller, pageScroll]);

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
      touchXRef.current = e.clientX;
      touchTimeRef.current = performance.now();
      consumedRef.current = false;
      scrollerRef.current = innerScroller(e.target);
    };

    /* Acting here rather than on pointerup is most of what makes the deck feel
       quick: the slide is already moving under the reader's thumb instead of
       waiting for them to lift it. One move per gesture — `consumed` keeps the
       rest of the drag from stacking up more. */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const startY = touchYRef.current;
      if (startY === null || consumedRef.current || lockedRef.current) return;
      const dy = startY - e.clientY;
      const travel = Math.abs(dy);
      // A sideways drag belongs to the router, which moves between pages. Both
      // gestures demand their own axis dominate, so only one can ever fire.
      if (travel < Math.abs(touchXRef.current - e.clientX) * AXIS_DOMINANCE) return;
      const speed = travel / Math.max(1, performance.now() - touchTimeRef.current);
      if (travel < SWIPE_THRESHOLD && !(travel >= FLICK_DISTANCE && speed >= FLICK_VELOCITY)) return;
      consumedRef.current = true;
      const direction: 1 | -1 = dy > 0 ? 1 : -1;
      // Inside a scrollable slide, a swipe turns its next screenful before it
      // is allowed to leave the slide at all.
      const scroller = scrollerRef.current;
      if (scroller && hasRoom(scroller, direction)) {
        pageScroll(scroller, direction);
        return;
      }
      step(direction);
    };

    const onUp = () => {
      touchYRef.current = null;
      scrollerRef.current = null;
      consumedRef.current = false;
    };

    const onCancel = onUp;
    // Belt and braces for engines that still try to pan or rubber-band the
    // page from inside the deck (old iOS Safari quirks, pull-to-refresh).
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault(); // we drive every pan ourselves
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [step, innerScroller, pageScroll]);

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
        /* --deck-slide is the measured height of one slide. Content inside a
           scrollable slide uses it to size itself in whole screenfuls, so the
           slide reads as an exact run of full views rather than a free scroll. */
        style={{
          height: 'calc(100dvh - var(--chrome-top) - var(--chrome-bottom))',
          touchAction: 'none',
          overscrollBehavior: 'none',
          ...({ '--deck-slide': slideH ? `${slideH}px` : '100%' } as React.CSSProperties),
        }}
        /* Focus-triggered auto-scroll would silently offset the hidden-overflow
           wrapper and desync it from the transform — pin it back. */
        onScroll={(e) => {
          e.currentTarget.scrollTop = 0;
        }}
      >
        <motion.div
          className="w-full"
          animate={{ y: slideH ? -index * slideH : 0 }}
          /* Expo-out: nearly all of the travel happens in the first third, so
             the slide answers the gesture instantly and then settles. */
          transition={
            prefersReduced ? { duration: 0 } : { duration: SLIDE_MS / 1000, ease: [0.16, 1, 0.3, 1] }
          }
          onAnimationComplete={unlock}
        >
          {slides.map((s, i) => (
            <motion.section
              key={s.label}
              aria-label={s.label}
              aria-hidden={i !== index}
              data-deck-scrollable={s.scrollable ? 'true' : undefined}
              className={`deck-slide w-full ${s.scrollable ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}`}
              /* Only the slide in focus is at full strength. Its neighbours are
                 seen for a few hundred ms as they pass, and dimming them reads
                 as depth — it is the one accent a deck can afford, since a
                 transform here would move the geometry the wick is measured on. */
              animate={{ opacity: i === index ? 1 : 0.45 }}
              /* Faster than the travel on purpose: an expo-out slide is nearly
                 home in a third of its duration, and a fade still climbing at
                 that point reads as washed out rather than as arriving. */
              transition={prefersReduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
              style={{
                height: slideH || '100%',
                /* touch-action does not inherit: without this the browser
                   pans the slide itself, swallows the gesture at either end,
                   and the deck never sees the swipe that should leave it. */
                ...(s.scrollable ? { touchAction: 'none', overscrollBehavior: 'contain' } : null),
              }}
            >
              {s.node}
            </motion.section>
          ))}
        </motion.div>

      </div>
    </DeckContext.Provider>
  );
};

export default SlideDeck;
