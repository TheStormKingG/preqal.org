import React, { useLayoutEffect, useRef, useState } from 'react';

export const ECOURSE_RIBBON_SRC = '/e-courses/ui/star-ribbon.png';

/** Screen-space rect for the flying ribbon to start from (e.g. modal ribbon `getBoundingClientRect()` clone). */
export type RibbonFlyScreenRect = { left: number; top: number; width: number; height: number };

export type RibbonFlyStep = 'slides' | 'video' | 'quiz';

export function ribbonTargetKey(moduleId: string, step: RibbonFlyStep): string {
  return `${moduleId}-${step}`;
}

export function parseRibbonTargetKey(key: string): { moduleId: string; step: RibbonFlyStep } | null {
  const suf: RibbonFlyStep[] = ['slides', 'video', 'quiz'];
  for (const s of suf) {
    const suffix = `-${s}`;
    if (key.endsWith(suffix)) {
      return { moduleId: key.slice(0, -suffix.length), step: s };
    }
  }
  return null;
}

function centerStyle(): React.CSSProperties {
  if (typeof window === 'undefined') {
    return { position: 'fixed', left: 0, top: 0, width: 140, height: 140, zIndex: 401, transition: 'none', opacity: 1 };
  }
  return {
    position: 'fixed',
    left: window.innerWidth / 2 - 70,
    top: window.innerHeight / 2 - 70,
    width: 140,
    height: 140,
    zIndex: 401,
    transition: 'none',
    opacity: 1,
  };
}

function initialStyleFromRect(origin: RibbonFlyScreenRect | null | undefined): React.CSSProperties {
  if (origin && origin.width >= 8 && origin.height >= 8) {
    return {
      position: 'fixed',
      left: origin.left,
      top: origin.top,
      width: origin.width,
      height: origin.height,
      zIndex: 401,
      transition: 'none',
      opacity: 1,
    };
  }
  return centerStyle();
}

function ConfettiLayer() {
  const colors = ['#f59e0b', '#34d399', '#818cf8', '#f472b6', '#38bdf8'];
  return (
    <div className="pointer-events-none fixed inset-0 z-[400]" aria-hidden>
      {Array.from({ length: 22 }).map((_, i) => {
        const dx = -90 + ((i * 37) % 180);
        const dy = -120 - (i % 5) * 18;
        const rot = (i % 7) * 52;
        return (
          <span
            key={i}
            className="ecourse-confetti-particle absolute rounded-[2px] shadow-sm"
            style={{
              left: '50%',
              top: '44%',
              width: 5 + (i % 3),
              height: 7 + (i % 4),
              marginLeft: -3,
              marginTop: -4,
              background: colors[i % colors.length],
              ['--ec-dx' as string]: `${dx}px`,
              ['--ec-dy' as string]: `${dy}px`,
              ['--ec-rot' as string]: `${rot}deg`,
              animationDelay: `${(i % 8) * 25}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export interface EcourseRibbonFlyoverProps {
  flyKey: string;
  /** When set, the ribbon starts at this rect (modal ribbon) then shrinks into the sidebar target. */
  flyFromRect?: RibbonFlyScreenRect | null;
  onDone: () => void;
}

/**
 * Full-screen celebration: ribbon pops up with confetti, then flies into a sidebar bullet target.
 * Parent should remount with `key={flyKey}` for each celebration.
 */
const EcourseRibbonFlyover: React.FC<EcourseRibbonFlyoverProps> = ({ flyKey, flyFromRect, onDone }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const fromModal = Boolean(flyFromRect && flyFromRect.width >= 8 && flyFromRect.height >= 8);
  const [pop, setPop] = useState(!fromModal);
  const [style, setStyle] = useState<React.CSSProperties>(() => initialStyleFromRect(flyFromRect));
  const finishedRef = useRef(false);

  useLayoutEffect(() => {
    finishedRef.current = false;
    document.body.style.overflow = 'hidden';
    const fromModalOrigin = Boolean(flyFromRect && flyFromRect.width >= 8 && flyFromRect.height >= 8);

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onDone();
    };

    // Schedule initial style setup asynchronously to avoid synchronous setState in effect
    const initRaf = requestAnimationFrame(() => {
      setStyle(initialStyleFromRect(flyFromRect));
      setPop(!fromModalOrigin);
    });

    /* Center path: pop celebration then fly. Modal path: hold at large rect (sidebar can open on mobile) then shrink to target. */
    const preFlyDelayMs = fromModalOrigin ? 320 : 520;

    const flyTimer = window.setTimeout(() => {
      const el = document.querySelector(`[data-ecourse-ribbon-target="${flyKey}"]`) as HTMLElement | null;
      const r = el?.getBoundingClientRect();
      const endW = 18;
      const endH = 18;
      let ex = window.innerWidth / 2 - endW / 2;
      let ey = window.innerHeight * 0.18;
      if (r && r.width > 1 && r.height > 1) {
        ex = r.left + r.width / 2 - endW / 2;
        ey = r.top + r.height / 2 - endH / 2;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle({
            position: 'fixed',
            left: ex,
            top: ey,
            width: endW,
            height: endH,
            zIndex: 401,
            transition:
              'left 0.88s cubic-bezier(0.22, 1, 0.36, 1), top 0.88s cubic-bezier(0.22, 1, 0.36, 1), width 0.88s cubic-bezier(0.22, 1, 0.36, 1), height 0.88s cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: 1,
          });
          setPop(false);
        });
      });
    }, preFlyDelayMs);

    const img = imgRef.current;
    const onTransEnd = (e: TransitionEvent) => {
      if (e.target !== img) return;
      if (!['left', 'top', 'width', 'height'].includes(e.propertyName)) return;
      img.removeEventListener('transitionend', onTransEnd);
      img.removeEventListener('webkitTransitionEnd', onTransEnd as unknown as EventListener);
      window.setTimeout(finish, 30);
    };

    const attach = window.setTimeout(() => {
      img?.addEventListener('transitionend', onTransEnd);
      img?.addEventListener('webkitTransitionEnd', onTransEnd as unknown as EventListener);
    }, preFlyDelayMs + 40);

    const failSafe = window.setTimeout(finish, fromModalOrigin ? 3200 : 2400);

    return () => {
      cancelAnimationFrame(initRaf);
      document.body.style.overflow = '';
      window.clearTimeout(flyTimer);
      window.clearTimeout(attach);
      window.clearTimeout(failSafe);
      img?.removeEventListener('transitionend', onTransEnd);
      img?.removeEventListener('webkitTransitionEnd', onTransEnd as unknown as EventListener);
    };
  }, [flyKey, flyFromRect, onDone]);

  return (
    <>
      <ConfettiLayer />
      <img
        ref={imgRef}
        src={ECOURSE_RIBBON_SRC}
        alt=""
        className={[
          'pointer-events-none object-contain drop-shadow-2xl select-none',
          pop ? 'animate-ecourse-ribbon-pop' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        decoding="async"
      />
    </>
  );
};

export default EcourseRibbonFlyover;
