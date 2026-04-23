import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import SlideLayerStage, { type SlideLayerFile } from './SlideLayerStage';
import { SlideContentShield } from './SlideContentShield';
import { useFullscreen } from './useFullscreen';

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
    const raw = localStorage.getItem(`${LS_PREFIX}${moduleId}`);
    if (!raw) return Array(len).fill(false);
    return normalizeReadFlags(JSON.parse(raw), len);
  } catch {
    return Array(len).fill(false);
  }
}

function saveReadFlags(moduleId: string, flags: boolean[]) {
  try {
    localStorage.setItem(`${LS_PREFIX}${moduleId}`, JSON.stringify(flags));
  } catch {
    /* ignore quota / private mode */
  }
}

function isSlideRefV2(x: unknown): x is SlideRefV2 {
  return Boolean(x && typeof x === 'object' && typeof (x as SlideRefV2).layers === 'string');
}

export interface NativeSlideDeckProps {
  moduleId: string;
  manifestPath: string;
  onAllSlidesReadChange?: (complete: boolean) => void;
}

const NativeSlideDeck: React.FC<NativeSlideDeckProps> = ({ moduleId, manifestPath, onAllSlidesReadChange }) => {
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

  const currentSlideRead = readFlags[slideIndex] ?? false;
  const canLeaveSlide = currentSlideRead || dwellMs >= minDwellMs;

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
      setDwellMs(elapsed);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrevSlide();
      if (e.key === 'ArrowRight' && canLeaveSlide) goNextSlide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrevSlide, goNextSlide, canLeaveSlide]);

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
  const remainingSec = Math.max(0, Math.ceil((minDwellMs - dwellMs) / 1000));
  const isLastSlide = slideIndex >= slideCount - 1;
  const nextDisabled = isLastSlide || !canLeaveSlide;
  const showNextCountdown = !isLastSlide && !canLeaveSlide;

  return (
    <section className="mb-8 shrink-0" aria-label="Lesson slides">
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
            <button
              type="button"
              onClick={goNextSlide}
              disabled={nextDisabled}
              aria-label={
                showNextCountdown
                  ? `Next slide, available in ${remainingSec} seconds`
                  : isLastSlide
                    ? 'Last slide'
                    : 'Next slide'
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default NativeSlideDeck;
