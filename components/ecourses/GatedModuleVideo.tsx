import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FastForward, Maximize2, Minimize2, Pause, Play, Undo2, VideoOff } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import { setVideoComplete, videoCompleteFromStorage } from './ecourseProgress';
import { useFullscreen } from './useFullscreen';

const LS_PROGRESS = 'ecourse-video-progress:';
/** Seconds ahead of max-watched that we tolerate (buffer / keyframe jitter). */
const FORWARD_EPS = 1.35;
const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

function loadMaxWatched(moduleId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(`${LS_PROGRESS}${moduleId}`);
    if (!raw) return 0;
    const o = JSON.parse(raw) as { max?: number };
    return typeof o.max === 'number' && Number.isFinite(o.max) ? Math.max(0, o.max) : 0;
  } catch {
    return 0;
  }
}

function saveMaxWatched(moduleId: string, max: number) {
  try {
    window.localStorage.setItem(`${LS_PROGRESS}${moduleId}`, JSON.stringify({ max }));
  } catch {
    /* ignore */
  }
}

export interface GatedModuleVideoProps {
  moduleId: string;
  /** Path from site root, e.g. `/e-courses/modules/ms-really/video.mp4` */
  src: string;
  unlocked: boolean;
  onProgress?: () => void;
  onCompleteChange?: (complete: boolean) => void;
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const GatedModuleVideo: React.FC<GatedModuleVideoProps> = ({ moduleId, src, unlocked, onProgress, onCompleteChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatchedRef = useRef(0);
  const lastSaveRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [duration, setDuration] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [complete, setComplete] = useState(() =>
    typeof window !== 'undefined' ? videoCompleteFromStorage(moduleId) : false,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [skipFloater, setSkipFloater] = useState<{ id: number; text: string } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const dragPointerId = useRef<number | null>(null);
  const skipFloatSeq = useRef(0);
  const { ref: fsRef, active: fsOpen, toggle: toggleFs } = useFullscreen<HTMLDivElement>();

  const absSrc = publicAssetAbsoluteUrl(src);

  const showSkipFloat = useCallback((text: string) => {
    skipFloatSeq.current += 1;
    setSkipFloater({ id: skipFloatSeq.current, text });
  }, []);

  useEffect(() => {
    if (!skipFloater) return;
    const id = skipFloater.id;
    const t = window.setTimeout(() => {
      setSkipFloater((s) => (s?.id === id ? null : s));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [skipFloater]);

  useEffect(() => {
    if (!unlocked) return;
    const v = videoRef.current;
    if (!v) return;
    v.preload = 'auto';
    v.load();
  }, [absSrc, unlocked, moduleId]);

  const bumpComplete = useCallback(
    (done: boolean) => {
      setComplete(done);
      onCompleteChange?.(done);
    },
    [onCompleteChange],
  );

  useEffect(() => {
    const done = videoCompleteFromStorage(moduleId);
    maxWatchedRef.current = done ? Number.POSITIVE_INFINITY : loadMaxWatched(moduleId);
    bumpComplete(done);
  }, [moduleId, bumpComplete]);

  const clampIfNeeded = useCallback(() => {
    const v = videoRef.current;
    if (!v || complete) return;
    const max = maxWatchedRef.current;
    if (!Number.isFinite(max)) return;
    if (v.currentTime > max + FORWARD_EPS) {
      v.currentTime = max;
    }
  }, [complete]);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDisplayTime(v.currentTime);
    if (complete) return;
    clampIfNeeded();
    const max = maxWatchedRef.current;
    if (Number.isFinite(max) && !v.paused) {
      maxWatchedRef.current = Math.max(max, v.currentTime);
      const now = Date.now();
      if (now - lastSaveRef.current > 2000) {
        lastSaveRef.current = now;
        saveMaxWatched(moduleId, maxWatchedRef.current);
        onProgress?.();
      }
    }
  }, [clampIfNeeded, complete, moduleId, onProgress]);

  const onSeeking = useCallback(() => {
    clampIfNeeded();
  }, [clampIfNeeded]);

  const onSeeked = useCallback(() => {
    clampIfNeeded();
    const v = videoRef.current;
    if (v) setDisplayTime(v.currentTime);
  }, [clampIfNeeded]);

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    setLoadError(null);
    if (!complete) {
      const saved = loadMaxWatched(moduleId);
      maxWatchedRef.current = Math.max(saved, 0);
      if (v.currentTime > maxWatchedRef.current + FORWARD_EPS) {
        v.currentTime = maxWatchedRef.current;
      }
    }
  }, [complete, moduleId]);

  const onLoadedData = useCallback(() => {
    setLoadError(null);
  }, []);

  const onEnded = useCallback(() => {
    const v = videoRef.current;
    setPlaying(false);
    setVideoComplete(moduleId);
    saveMaxWatched(moduleId, v?.duration ?? maxWatchedRef.current);
    maxWatchedRef.current = Number.POSITIVE_INFINITY;
    bumpComplete(true);
    onProgress?.();
  }, [moduleId, bumpComplete, onProgress]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const dur = Number.isFinite(v.duration) ? v.duration : 0;
      if (dur > 0 && v.currentTime >= dur - 0.08) {
        v.currentTime = 0;
        if (!complete) {
          maxWatchedRef.current = 0;
          saveMaxWatched(moduleId, 0);
        }
      }
      void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [complete, moduleId]);

  const rewind10 = useCallback(() => {
    const v = videoRef.current;
    if (!v || !unlocked) return;
    showSkipFloat('−10s');
    const t = Math.max(0, v.currentTime - 10);
    v.currentTime = t;
    if (!complete) {
      maxWatchedRef.current = t;
      saveMaxWatched(moduleId, t);
      onProgress?.();
    }
    setDisplayTime(t);
  }, [complete, moduleId, onProgress, unlocked, showSkipFloat]);

  const forward10 = useCallback(() => {
    if (!complete) return;
    const v = videoRef.current;
    if (!v || !unlocked) return;
    showSkipFloat('+10s');
    const dur = Number.isFinite(v.duration) ? v.duration : 0;
    const t = dur > 0 ? Math.min(dur, v.currentTime + 10) : v.currentTime + 10;
    v.currentTime = t;
    setDisplayTime(t);
  }, [complete, unlocked, showSkipFloat]);

  const maxSeekTime = useCallback(() => {
    if (complete) return duration;
    const max = maxWatchedRef.current;
    if (!Number.isFinite(max) || max === Number.POSITIVE_INFINITY) return duration;
    return Math.min(duration, max + FORWARD_EPS);
  }, [complete, duration]);

  const applySeekFromClientX = useCallback(
    (clientX: number) => {
      const v = videoRef.current;
      const bar = progressBarRef.current;
      if (!v || !bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = ratio * duration;
      const cap = maxSeekTime();
      const t = Math.min(raw, cap);
      v.currentTime = t;
      setScrubTime(t);
      setDisplayTime(t);
    },
    [duration, maxSeekTime],
  );

  const endProgressDrag = useCallback(() => {
    dragPointerId.current = null;
    setScrubTime(null);
  }, []);

  const onProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!unlocked || e.button !== 0) return;
      const bar = progressBarRef.current;
      if (!bar || duration <= 0) return;
      dragPointerId.current = e.pointerId;
      try {
        bar.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      applySeekFromClientX(e.clientX);
    },
    [applySeekFromClientX, duration, unlocked],
  );

  const onProgressPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragPointerId.current !== e.pointerId) return;
      applySeekFromClientX(e.clientX);
    },
    [applySeekFromClientX],
  );

  const onProgressPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragPointerId.current !== e.pointerId) return;
      const bar = progressBarRef.current;
      try {
        bar?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      endProgressDrag();
    },
    [endProgressDrag],
  );

  const onProgressLostCapture = useCallback(() => {
    endProgressDrag();
  }, [endProgressDrag]);

  const onProgressKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      if (!v || duration <= 0) return;
      const cap = maxSeekTime();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const t = Math.max(0, v.currentTime - 5);
        v.currentTime = t;
        setDisplayTime(t);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const t = Math.min(cap, v.currentTime + 5);
        v.currentTime = t;
        setDisplayTime(t);
      } else if (e.key === 'Home') {
        e.preventDefault();
        v.currentTime = 0;
        setDisplayTime(0);
      } else if (e.key === 'End' && complete) {
        e.preventDefault();
        v.currentTime = duration;
        setDisplayTime(duration);
      }
    },
    [complete, duration, maxSeekTime],
  );

  const onSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = videoRef.current;
      const r = parseFloat(e.target.value);
      setSpeed(r);
      if (v) v.playbackRate = r;
    },
    [],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed, unlocked, src]);

  if (!unlocked) {
    return (
      <section className="mt-8 shrink-0" aria-label="Module video">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Module video</p>
        <div className="neu-pressed-sm rounded-2xl px-4 py-6 text-center text-sm text-slate-600">
          Finish all slides in this module to unlock the video.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 shrink-0" aria-label="Module video">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Module video</p>
        {complete ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 neu-pressed-sm px-2 py-0.5 rounded-full">
            Watched
          </span>
        ) : null}
      </div>
      <div
        ref={fsRef}
        className={[
          'neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5',
          fsOpen
            ? '[&:fullscreen]:rounded-none [&:fullscreen]:min-h-[100dvh] [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:ring-0'
            : '',
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
        <div
          className={[
            'relative bg-black',
            fsOpen ? 'flex-1 min-h-0 flex items-center justify-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* User-facing video unavailable placeholder — shown instead of the black screen */}
          {loadError ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#1a1f2e] px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700/60">
                <VideoOff className="h-8 w-8 text-slate-400" aria-hidden />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-200">Video coming soon</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  This module video is being prepared and will be available shortly.
                  The slides and quiz are fully accessible in the meantime.
                </p>
              </div>
            </div>
          ) : null}
          <video
            key={`${moduleId}-${absSrc}`}
            ref={videoRef}
            src={absSrc}
            className={
              fsOpen
                ? 'max-h-full max-w-full w-auto h-auto object-contain'
                : 'w-full max-h-[min(56vh,520px)] object-contain block mx-auto'
            }
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            controlsList="nodownload noremoteplayback"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') e.preventDefault();
            }}
            onLoadedMetadata={onLoadedMetadata}
            onLoadedData={onLoadedData}
            onTimeUpdate={onTimeUpdate}
            onSeeking={onSeeking}
            onSeeked={onSeeked}
            onEnded={onEnded}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setLoadError('unavailable')}
          />
          {skipFloater ? (
            <div
              key={skipFloater.id}
              className="animate-ecourse-skip-float pointer-events-none absolute bottom-[20%] left-1/2 z-20 text-xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
              aria-hidden
            >
              {skipFloater.text}
            </div>
          ) : null}
        </div>
        <div className="border-t border-slate-200/60 bg-[#e8ecf2] px-4 pt-3 pb-3 shrink-0">
          <div
            ref={progressBarRef}
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={Math.max(0, Math.floor(duration))}
            aria-valuenow={Math.min(Math.floor(duration), Math.max(0, Math.floor(scrubTime ?? displayTime)))}
            aria-label={complete ? 'Seek video' : 'Seek video (cannot move past watched position until you finish once)'}
            aria-disabled={duration <= 0}
            onPointerDown={onProgressPointerDown}
            onPointerMove={onProgressPointerMove}
            onPointerUp={onProgressPointerUp}
            onPointerCancel={onProgressPointerUp}
            onLostPointerCapture={onProgressLostCapture}
            onKeyDown={onProgressKeyDown}
            className={`relative mb-3 h-3 w-full touch-none rounded-full bg-slate-500/80 outline-none ring-slate-900/10 focus-visible:ring-2 ${
              duration > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
          >
            {duration > 0 ? (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-orange-500"
                  style={{ width: `${Math.min(100, ((scrubTime ?? displayTime) / duration) * 100)}%` }}
                />
                <div
                  className="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md ring-2 ring-white/90"
                  style={{ left: `${Math.min(100, ((scrubTime ?? displayTime) / duration) * 100)}%` }}
                />
              </>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <p className="text-xs text-slate-600 tabular-nums order-last sm:order-none">
              {formatClock(displayTime)} / {formatClock(duration)}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                {playing ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={rewind10}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                aria-label="Rewind 10 seconds"
              >
                <Undo2 className="h-4 w-4" aria-hidden />
                −10s
              </button>
              {complete ? (
                <button
                  type="button"
                  onClick={forward10}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                  aria-label="Forward 10 seconds"
                >
                  <FastForward className="h-4 w-4" aria-hidden />
                  +10s
                </button>
              ) : null}
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                <span className="uppercase tracking-wide">Speed</span>
                <select
                  value={speed}
                  onChange={onSpeedChange}
                  className="text-sm font-bold rounded-lg border border-slate-300/80 bg-white px-2 py-1.5 text-slate-800"
                  aria-label="Playback speed"
                >
                  {SPEEDS.map((s) => (
                    <option key={s} value={s}>
                      {s}×
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
        {!complete ? (
          <p className="text-[11px] text-slate-500 px-4 pb-3 -mt-1">
            Watch through to the end without skipping ahead. The red scrubber cannot move forward past what you have already watched until you finish once; −10s is always available. After you complete the module, you can scrub and skip forward freely (+10s appears).
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default GatedModuleVideo;
