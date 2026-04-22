import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Undo2 } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import { setVideoComplete, videoCompleteFromStorage } from './ecourseProgress';

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

  const absSrc = publicAssetAbsoluteUrl(src);

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
    const t = Math.max(0, v.currentTime - 10);
    v.currentTime = t;
    if (!complete) {
      maxWatchedRef.current = t;
      saveMaxWatched(moduleId, t);
      onProgress?.();
    }
    setDisplayTime(t);
  }, [complete, moduleId, onProgress, unlocked]);

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
      <div className="neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5">
        {loadError ? (
          <p className="text-sm text-red-700 px-4 py-3">{loadError}</p>
        ) : null}
        <div className="relative bg-black">
          <video
            key={`${moduleId}-${absSrc}`}
            ref={videoRef}
            src={absSrc}
            className="w-full max-h-[min(56vh,520px)] object-contain block mx-auto"
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
            onError={() =>
              setLoadError(
                'Could not load this video. Run npm run sync-qms-media to copy full videos from QMS Module Videos into public/, then rebuild and deploy.',
              )
            }
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 px-4 py-3 bg-[#e8ecf2] border-t border-slate-200/60">
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
        {!complete ? (
          <p className="text-[11px] text-slate-500 px-4 pb-3 -mt-1">
            Watch through to the end without skipping ahead. Rewind is allowed; you cannot drag the playhead forward past what you have already watched.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default GatedModuleVideo;
