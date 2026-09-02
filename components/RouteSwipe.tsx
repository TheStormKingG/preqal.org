import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BOTTOM_NAV_ROUTES } from './BottomNav';

/* Swiping sideways moves between the three pages, the way the bottom bar's
   tabs are ordered. It listens on the document rather than on any one page so
   it works the same whether the page under it is a deck or an ordinary scroll.
   The deck's own vertical swipe and this one cannot both fire: each requires
   its axis to dominate the gesture. */
const SWIPE_DISTANCE = 56; // px — deliberately longer than the deck's vertical
const AXIS_DOMINANCE = 1.4; // sideways travel must clearly beat vertical
const EDGE_GUARD = 24; // px — leave the OS its back-swipe from screen edges
const LINE_HEIGHT = 16; // px per line, for engines reporting wheel deltas in lines
/* A desktop trackpad reports a sideways swipe as wheel deltaX, and it coasts
   the same way a vertical one does. One page per gesture: navigate on the
   first crossing, then stay shut until the stream has actually stopped. */
const WHEEL_DISTANCE = 90; // px of sideways travel that counts as a swipe
const WHEEL_GESTURE_GAP = 120; // ms between events still belonging to one gesture
const WHEEL_SETTLE = 320; // ms of stillness that ends a gesture

/** A horizontally scrollable ancestor with room left to travel, if any. */
const horizontalScroller = (target: EventTarget | null, direction: number): boolean => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const style = getComputedStyle(el).overflowX;
      if (style === 'auto' || style === 'scroll') {
        const room =
          direction > 0
            ? Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 1
            : el.scrollLeft > 1;
        if (room) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
};

const RouteSwipe: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const start = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);
  const wheelAcc = useRef(0);
  const wheelAt = useRef(0);
  const wheelDone = useRef(false);
  const settleTimer = useRef(0);

  useEffect(() => {
    const index = BOTTOM_NAV_ROUTES.indexOf(pathname as (typeof BOTTOM_NAV_ROUTES)[number]);
    if (index < 0) return; // a page outside the tab order swipes nowhere

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (e.clientX < EDGE_GUARD || e.clientX > window.innerWidth - EDGE_GUARD) return;
      start.current = { x: e.clientX, y: e.clientY };
      done.current = false;
    };

    const onMove = (e: PointerEvent) => {
      const from = start.current;
      if (!from || done.current) return;
      const dx = from.x - e.clientX;
      const dy = from.y - e.clientY;
      if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * AXIS_DOMINANCE) return;
      const next = index + (dx > 0 ? 1 : -1);
      done.current = true;
      start.current = null;
      if (next < 0 || next >= BOTTOM_NAV_ROUTES.length) return; // no wrap at the ends
      navigate(BOTTOM_NAV_ROUTES[next]);
    };

    const clear = () => {
      start.current = null;
      done.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaMode === 1 ? e.deltaX * LINE_HEIGHT : e.deltaX;
      const dy = e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT : e.deltaY;
      // Anything with vertical intent belongs to the page or the deck.
      if (Math.abs(dx) <= Math.abs(dy) * AXIS_DOMINANCE) {
        wheelAcc.current = 0;
        return;
      }
      // A table or carousel that can still scroll sideways keeps its gesture.
      if (horizontalScroller(e.target, dx)) return;
      // Otherwise it is ours, and the browser must not also walk its history.
      e.preventDefault();

      const now = performance.now();
      const gap = now - wheelAt.current;
      wheelAt.current = now;
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        wheelDone.current = false;
        wheelAcc.current = 0;
      }, WHEEL_SETTLE);
      if (wheelDone.current) return;

      wheelAcc.current = gap < WHEEL_GESTURE_GAP ? wheelAcc.current + dx : dx;
      if (Math.abs(wheelAcc.current) < WHEEL_DISTANCE) return;
      const next = index + (wheelAcc.current > 0 ? 1 : -1);
      wheelDone.current = true;
      wheelAcc.current = 0;
      if (next < 0 || next >= BOTTOM_NAV_ROUTES.length) return;
      navigate(BOTTOM_NAV_ROUTES[next]);
    };

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', clear);
    document.addEventListener('pointercancel', clear);
    document.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', clear);
      document.removeEventListener('pointercancel', clear);
      document.removeEventListener('wheel', onWheel);
      window.clearTimeout(settleTimer.current);
    };
  }, [pathname, navigate]);

  return null;
};

export default RouteSwipe;
