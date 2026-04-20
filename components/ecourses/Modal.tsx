import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CourseModule } from './types';

interface ModalProps {
  module: CourseModule | null;
  onClose: () => void;
  titleId: string;
  /** Element to return focus to when the dialog closes (set from the opening control). */
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h} hr ${m} min` : `~${h} hr`;
}

const Modal: React.FC<ModalProps> = ({ module, onClose, titleId, returnFocusRef }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (module) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [module]);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = !!module;
    if (wasOpen && !module) {
      const el = returnFocusRef.current;
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
    }
  }, [module, returnFocusRef]);

  useEffect(() => {
    if (!module) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [module, onClose]);

  if (!module) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm transition-opacity duration-200"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg max-h-[min(90vh,640px)] sm:max-h-[85vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-sky-900/10 ring-1 ring-sky-100/50 animate-fade-in"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-200/60 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">Module {module.number}</p>
            <h2 id={titleId} className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight text-balance">
              {module.title}
            </h2>
            {module.comingSoon ? (
              <span className="inline-flex mt-2 items-center rounded-full bg-amber-500/15 text-amber-800 text-xs font-semibold px-2.5 py-0.5 ring-1 ring-amber-500/25">
                Coming soon
              </span>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">{module.tagline}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">What you will take away</p>
          <ul className="space-y-2.5 mb-8">
            {module.outcomes.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm text-slate-700 leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/80" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-200/80 text-slate-700">
              <span className="text-slate-500 mr-2">Time</span>
              <span className="font-medium">{formatDuration(module.estimatedMinutes)}</span>
            </span>
            <span className="inline-flex items-center rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-200/80 text-slate-700">
              <span className="text-slate-500 mr-2">Level</span>
              <span className="font-medium">{module.skillLevel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
