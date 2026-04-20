import React from 'react';
import { X } from 'lucide-react';
import type { CourseModule } from './types';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h} hr ${m} min` : `~${h} hr`;
}

interface CourseCardProps {
  module: CourseModule;
  /** When true, this module fills the full module grid and shows full detail. */
  isGridExpanded: boolean;
  onToggle: () => void;
  revealClassName?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ module, isGridExpanded, onToggle, revealClassName = '' }) => {
  if (isGridExpanded) {
    return (
      <div
        role="region"
        aria-label={`Module ${module.number} details`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        className={[
          'neu-card neu-raised rounded-2xl w-full text-left p-8 sm:p-10 lg:p-12 relative cursor-pointer',
          'transition-all duration-500 ease-in-out animate-fade-in',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
          revealClassName,
        ].join(' ')}
      >
        <button
          type="button"
          aria-label="Close module"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="absolute top-5 left-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-amber-700 to-orange-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.18)] ring-1 ring-black/15 text-black hover:from-amber-600 hover:to-orange-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec]"
        >
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        </button>
        <div className="max-w-3xl mx-auto pl-10 sm:pl-11">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold tabular-nums text-amber-700 uppercase tracking-wide">Module {module.number}</span>
            {module.comingSoon ? (
              <span className="neu-pressed-sm text-amber-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            ) : null}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance mb-3">{module.title}</h3>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">{module.tagline}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">What you will take away</p>
          <ul className="space-y-3 mb-8">
            {module.outcomes.map((line) => (
              <li key={line} className="flex gap-3 text-base text-slate-700 leading-snug">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <span className="neu-pressed-sm text-sm px-4 py-2 rounded-lg text-slate-600">
              <span className="text-slate-500">Time </span>
              <span className="font-semibold text-slate-800">{formatDuration(module.estimatedMinutes)}</span>
            </span>
            <span className="neu-pressed-sm text-sm px-4 py-2 rounded-lg text-slate-600">
              <span className="text-slate-500">Level </span>
              <span className="font-semibold text-slate-800">{module.skillLevel}</span>
            </span>
          </div>
          <p className="mt-10 text-sm text-slate-500">Click the close control or anywhere on this panel to return to all modules.</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded="false"
      className={[
        'neu-card rounded-2xl w-full h-full min-h-[260px] sm:min-h-[240px] text-left p-6 flex flex-col',
        'transition-all duration-300 hover:neu-raised',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
        revealClassName,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-bold tabular-nums text-amber-700 uppercase tracking-wide">Module {module.number}</span>
        {module.comingSoon ? (
          <span className="shrink-0 neu-pressed-sm text-amber-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
            Soon
          </span>
        ) : null}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-balance line-clamp-3 min-h-[4.5rem] sm:min-h-[5rem] mb-2">
        {module.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 flex-1">{module.tagline}</p>
    </button>
  );
};

export default CourseCard;
