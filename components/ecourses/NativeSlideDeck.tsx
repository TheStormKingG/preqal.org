import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import SlideLayerStage, { type SlideLayerFile } from './SlideLayerStage';
import { SlideContentShield } from './SlideContentShield';
import { useFullscreen } from './useFullscreen';
import { ECOURSE_RIBBON_SRC } from './EcourseRibbonFlyover';

type SlideRefV2 = { layers: string };

type SlideManifest = {
  slides: (string | SlideRefV2)[];
  minDwellSeconds?: number;
  slideSize?: { cx: number; cy: number };
};

const LS_PREFIX = 'ecourse-slides-read:';

function normalizeReadFlags(raw: unknown, len: number): boolean[] {
  if (!Array.isArray(raw)) return Array(len).fill(false);
  return Array.from({ length: len }, (_, i) => Boolean(raw[i]));
}

function loadReadFlags(moduleId: string, len: number): boolean[] {
  if (typeof window === 'undefined') return Array(len).fill(false);
  try {
    const raw = window.localStorage.getItem(`${LS_PREFIX}${moduleId}`);
    if (!raw) return Array(len).fill(false);
    return normalizeReadFlags(JSON.parse(raw), len);
  } catch {
    return Array(len).fill(false);
  }
}

function saveReadFlags(moduleId: string, flags: boolean[]) {
  try {
    window.localStorage.setItem(`${LS_PREFIX}${moduleId}`, JSON.stringify(flags));
  } catch {
    /* ignore quota / private mode */
  }
}

function isSlideRefV2(x: unknown): x is SlideRefV2 {
  return Boolean(x && typeof x === 'object' && typeof (x as SlideRefV2).layers === 'string');
}

export interface NativeSlideDeckProps {
  moduleId: string;
  /** Course module number for congratulations copy (e.g. 1). */
  moduleNumber: number;
  manifestPath: string;
  /** Bumps when slides are persisted externally so read flags re-sync from storage. */
  slidesReloadToken?: number;
  onAllSlidesReadChange?: (complete: boolean) => void;
  /** After user confirms the slides-complete modal: parent queues ribbon fly; persistence runs when fly ends. */
  onSlidesFinalizeAcknowledged?: (moduleId: string, slideCount: number) => void;
}

const NativeSlideDeck: React.FC<NativeSlideDeckProps> = ({
  moduleId,
  moduleNumber,
  manifestPath,
  slidesReloadToken = 0,
  onAllSlidesReadChange,
  onSlidesFinalizeAcknowledged,
}) => {
  const [manifest, setManifest] = useState<SlideManifest | null>(null);
  const [layerDocs, setLayerDocs] = useState<(SlideLayerFile | null)[]>([]);
  const [rasterUrls, setRasterUrls] = useState<(string | null)[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [readFlags, setReadFlags] = useState<boolean[]>([]);
  const [dwellMs, setDwellMs] = useState(0);
  const dwellOriginRef = useRef<number>(0);
  const fontsLoadedRef = useRef(false);
  const { ref: fsRef, active: fsOpen, toggle: toggleFs } = useFullscreen<HTMLDivElement>();
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const slideCount = manifest?.slides.length ?? 0;
  const minDwellSeconds = manifest?.minDwellSeconds ?? 18;
  const minDwellMs = minDwellSeconds * 1000;

  const manifestUrl = useMemo(() => publicAssetAbsoluteUrl(manifestPath), [manifestPath]);

  useEffect(() => {
    if (fontsLoadedRef.current) return;
    fontsLoadedRef.current = true;
    const href =
      'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Saira:wght@400;500;600;700&display=swap';
    if (!document.querySelector(`link[data-ecourse-slides-fonts="1"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-ecourse-slides-fonts', '1');
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setManifest(null);
    setLayerDocs([]);
    setRasterUrls([]);
    fetch(manifestUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load slides (${r.status})`);
        return r.json() as Promise<SlideManifest>;
      })
      .then(async (data) => {
        if (cancelled) return;
        if (!data?.slides?.length) throw new Error('Invalid slide manifest');
        setManifest(data);
        const flags = loadReadFlags(moduleId, data.slides.length);
        setReadFlags(flags);
        const allDone = flags.every(Boolean);
        onAllSlidesReadChange?.(allDone);
        setSlideIndex(0);

        const layersArr = await Promise.all(
          data.slides.map(async (entry) => {
            if (isSlideRefV2(entry)) {
              const url = publicAssetAbsoluteUrl(entry.layers);
              const lr = await fetch(url);
              if (!lr.ok) throw new Error(`Missing slide layers (${lr.status})`);
              return (await lr.json()) as SlideLayerFile;
            }
            return null;
          })
        );
        const rasters = data.slides.map((entry) => (typeof entry === 'string' ? entry : null));
        if (cancelled) return;
        setLayerDocs(layersArr);
        setRasterUrls(rasters);
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message || 'Failed to load slides');
      });
    return () => {
      cancelled = true;
    };
  }, [manifestUrl, moduleId, onAllSlidesReadChange]);

  useEffect(() => {
    if (!manifest || slideCount === 0) return;
    const flags = loadReadFlags(moduleId, slideCount);
    setReadFlags(flags);
    onAllSlidesReadChange?.(flags.every(Boolean));
  }, [manifest, slideCount, moduleId, slidesReloadToken, onAllSlidesReadChange]);

  const currentSlideRead = readFlags[slideIndex] ?? false;
  const isLastSlide = slideCount > 0 && slideIndex >= slideCount - 1;
  const canLeaveSlide = currentSlideRead || dwellMs >= minDwellMs;
  const lastSlideDwellReady = isLastSlide && dwellMs >= minDwellMs;
  const remainingSec = Math.max(0, Math.ceil((minDwellMs - dwellMs) / 1000));

  useEffect(() => {
    if (!manifest || slideCount === 0) return;
    if (currentSlideRead) {
      setDwellMs(minDwellMs);
      return;
    }
    dwellOriginRef.current = Date.now();
    setDwellMs(0);
    const id = window.setInterval(() => {
      const elapsed = Date.now() - dwellOriginRef.current;
      setDwellMs(Math.min(elapsed, minDwellMs));
      if (slideIndex === slideCount - 1) {
        return;
      }
      if (elapsed >= minDwellMs) {
        setReadFlags((prev) => {
          if (prev[slideIndex]) return prev;
          const next = [...prev];
          next[slideIndex] = true;
          saveReadFlags(moduleId, next);
          const allDone = next.every(Boolean);
          onAllSlidesReadChange?.(allDone);
          return next;
        });
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [
    manifest,
    slideCount,
    slideIndex,
    minDwellMs,
    moduleId,
    onAllSlidesReadChange,
    currentSlideRead,
  ]);

  const goPrevSlide = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNextSlide = useCallback(() => {
    if (!canLeaveSlide) return;
    setSlideIndex((i) => Math.min(slideCount - 1, i + 1));
  }, [canLeaveSlide, slideCount]);

  const openCongratsModal = useCallback(() => {
    if (!lastSlideDwellReady) return;
    setShowCongratsModal(true);
  }, [lastSlideDwellReady]);

  const onModalOk = useCallback(() => {
    setShowCongratsModal(false);
    onSlidesFinalizeAcknowledged?.(moduleId, slideCount);
  }, [moduleId, slideCount, onSlidesFinalizeAcknowledged]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCongratsModal) return;
      if (e.key === 'ArrowLeft') goPrevSlide();
      if (e.key === 'ArrowRight' && canLeaveSlide && !isLastSlide) goNextSlide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrevSlide, goNextSlide, canLeaveSlide, isLastSlide, showCongratsModal]);

  useEffect(() => {
    if (!showCongratsModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showCongratsModal]);

  if (loadError) {
    return (
      <section className="mb-8 shrink-0" aria-label="Lesson slides">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Lesson slides</p>
        <p className="text-sm text-red-700 neu-pressed-sm rounded-xl px-4 py-3">{loadError}</p>
      </section>
    );
  }

  if (!manifest || slideCount === 0) {
    return (
      <section className="mb-8 shrink-0" aria-label="Lesson slides">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Lesson slides</p>
        <p className="text-sm text-slate-600">Loading slides…</p>
      </section>
    );
  }

  const currentLayers = layerDocs[slideIndex];
  const currentRaster = rasterUrls[slideIndex];
  const showNextCountdown = !isLastSlide && !canLeaveSlide;

  const modal =
    showCongratsModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ecourse-slides-done-title"
          >
            <div className="neu-card max-w-md w-full rounded-2xl border border-white/60 bg-[#e8ecf2] p-6 sm:p-8 shadow-neu text-center space-y-5">
              <img
                src={ECOURSE_RIBBON_SRC}
                alt=""
                className="mx-auto h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-xl"
                decoding="async"
              />
              <h2 id="ecourse-slides-done-title" className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                Congratulations, you&apos;ve finished the slides for Module {moduleNumber}
              </h2>
              <p className="text-sm text-slate-600">Tap OK to celebrate and save your progress.</p>
              <button
                type="button"
                onClick={onModalOk}
                className="w-full sm:w-auto min-w-[8rem] px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
              >
                OK
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section className="mb-8 shrink-0" aria-label="Lesson slides">
      {modal}
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Lesson slides</p>
      <div
        ref={fsRef}
        className={[
          'neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5 flex flex-col min-h-0',
          fsOpen ? '[&:fullscreen]:rounded-none [&:fullscreen]:min-h-[100dvh] [&:fullscreen]:ring-0' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex justify-end px-3 py-2 border-b border-slate-200/60 bg-[#e8ecf2] shrink-0">
          <button
            type="button"
            onClick={() => void toggleFs()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
            aria-pressed={fsOpen}
            aria-label={fsOpen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fsOpen ? <Minimize2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            {fsOpen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
        <SlideContentShield
          className={[
            'relative flex items-center justify-center bg-slate-100 p-2 sm:p-3',
            fsOpen ? 'flex-1 min-h-0' : 'min-h-[min(50vh,520px)] sm:min-h-[480px]',
          ].join(' ')}
        >
          {currentLayers?.version === 2 ? (
            <div className={['w-full max-w-[min(100%,1280px)]', fsOpen ? 'max-h-full flex items-center justify-center' : ''].filter(Boolean).join(' ')}>
              <SlideLayerStage data={currentLayers} />
            </div>
          ) : currentRaster ? (
            <img
              src={publicAssetAbsoluteUrl(currentRaster)}
              alt={`Slide ${slideIndex + 1} of ${slideCount}`}
              draggable={false}
              className={
                fsOpen
                  ? 'max-h-full max-w-full w-auto h-auto object-contain'
                  : 'max-h-[min(50vh,520px)] sm:max-h-[min(70vh,640px)] w-full object-contain'
              }
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <p className="text-sm text-slate-600">Loading slide…</p>
          )}
        </SlideContentShield>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-[#e8ecf2] border-t border-slate-200/60 shrink-0">
          <p className="text-xs text-slate-600 tabular-nums">
            Slide {slideIndex + 1} of {slideCount}
          </p>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={goPrevSlide}
              disabled={slideIndex <= 0}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Prev slide
            </button>
            {isLastSlide ? (
              <button
                type="button"
                onClick={openCongratsModal}
                disabled={!lastSlideDwellReady}
                aria-label={
                  lastSlideDwellReady
                    ? 'Complete slides for this module'
                    : `Complete, available in ${remainingSec} seconds`
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm disabled:opacity-90 disabled:pointer-events-none disabled:bg-emerald-600/45 disabled:hover:bg-emerald-600/45 transition-all duration-200"
              >
                <span className="inline-flex items-center gap-1.5">
                  Complete
                  {!lastSlideDwellReady ? (
                    <span className="tabular-nums font-extrabold min-w-[2.25rem] text-center bg-black/15 rounded-lg px-1.5 py-0.5 text-xs">
                      {remainingSec}s
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={goNextSlide}
                disabled={!canLeaveSlide}
                aria-label={
                  showNextCountdown ? `Next slide, available in ${remainingSec} seconds` : 'Next slide'
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-90 disabled:pointer-events-none disabled:bg-amber-500/55 disabled:hover:bg-amber-500/55 transition-all duration-200"
              >
                <span className="inline-flex items-center gap-1.5">
                  Next slide
                  {showNextCountdown ? (
                    <span className="tabular-nums font-extrabold min-w-[2.25rem] text-center bg-black/15 rounded-lg px-1.5 py-0.5 text-xs">
                      {remainingSec}s
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NativeSlideDeck;
