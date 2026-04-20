import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';

type SlideManifest = {
  slides: string[];
  minDwellSeconds?: number;
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

export interface NativeSlideDeckProps {
  moduleId: string;
  manifestPath: string;
  downloadPptxPath?: string;
  onAllSlidesReadChange?: (complete: boolean) => void;
}

const NativeSlideDeck: React.FC<NativeSlideDeckProps> = ({
  moduleId,
  manifestPath,
  downloadPptxPath,
  onAllSlidesReadChange,
}) => {
  const [manifest, setManifest] = useState<SlideManifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [readFlags, setReadFlags] = useState<boolean[]>([]);
  const [dwellMs, setDwellMs] = useState(0);
  const dwellOriginRef = useRef<number>(0);

  const slideCount = manifest?.slides.length ?? 0;
  const minDwellSeconds = manifest?.minDwellSeconds ?? 9;
  const minDwellMs = minDwellSeconds * 1000;

  const manifestUrl = useMemo(() => publicAssetAbsoluteUrl(manifestPath), [manifestPath]);
  const downloadUrl = useMemo(
    () => (downloadPptxPath ? publicAssetAbsoluteUrl(downloadPptxPath) : null),
    [downloadPptxPath]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setManifest(null);
    fetch(manifestUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load slides (${r.status})`);
        return r.json() as Promise<SlideManifest>;
      })
      .then((data) => {
        if (cancelled) return;
        if (!data?.slides?.length) throw new Error('Invalid slide manifest');
        setManifest(data);
        const flags = loadReadFlags(moduleId, data.slides.length);
        setReadFlags(flags);
        const allDone = flags.every(Boolean);
        onAllSlidesReadChange?.(allDone);
        setSlideIndex(0);
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

  const currentSrc = publicAssetAbsoluteUrl(manifest.slides[slideIndex]);
  const remainingSec = Math.max(0, Math.ceil((minDwellMs - dwellMs) / 1000));

  return (
    <section className="mb-8 shrink-0" aria-label="Lesson slides">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Lesson slides</p>
      <div className="neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5">
        <div className="relative flex items-center justify-center min-h-[min(50vh,520px)] sm:min-h-[480px] bg-slate-100">
          <img
            src={currentSrc}
            alt={`Slide ${slideIndex + 1} of ${slideCount}`}
            className="max-h-[min(50vh,520px)] sm:max-h-[min(70vh,640px)] w-full object-contain"
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-[#e8ecf2] border-t border-slate-200/60">
          <p className="text-xs text-slate-600 tabular-nums" aria-live="polite">
            Slide {slideIndex + 1} of {slideCount}
            {!currentSlideRead && dwellMs < minDwellMs ? (
              <span className="text-slate-500"> · Stay on this slide {remainingSec}s to continue</span>
            ) : null}
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
              disabled={slideIndex >= slideCount - 1 || !canLeaveSlide}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
            >
              Next slide
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        Each slide counts as read after you spend at least {minDwellSeconds} seconds on it. Progress is saved in this
        browser.
      </p>
      {downloadUrl ? (
        <a
          href={downloadUrl}
          download
          className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 transition-all neu-raised-sm"
        >
          Download slides (.pptx)
        </a>
      ) : null}
    </section>
  );
};

export default NativeSlideDeck;
