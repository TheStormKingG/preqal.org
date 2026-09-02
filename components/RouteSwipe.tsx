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

const RouteSwipe: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const start = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);

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

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', clear);
    document.addEventListener('pointercancel', clear);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', clear);
      document.removeEventListener('pointercancel', clear);
    };
  }, [pathname, navigate]);

  return null;
};

export default RouteSwipe;
