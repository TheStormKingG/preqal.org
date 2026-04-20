import React from 'react';
import type { CourseModule } from './types';

interface CourseCardProps {
  module: CourseModule;
  onSelect: (module: CourseModule, trigger: HTMLButtonElement) => void;
  revealClassName?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ module, onSelect, revealClassName = '' }) => {
  return (
    <button
      type="button"
      onClick={(e) => onSelect(module, e.currentTarget)}
      className={[
        'group text-left w-full rounded-2xl p-6 sm:p-7',
        'bg-white/60 backdrop-blur-xl border border-white/50',
        'shadow-md shadow-slate-900/5',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/10 hover:ring-1 hover:ring-sky-200/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        revealClassName,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-xs font-semibold tabular-nums text-sky-600 uppercase tracking-wider">Module {module.number}</span>
        {module.comingSoon ? (
          <span className="shrink-0 rounded-full bg-amber-500/12 text-amber-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 ring-1 ring-amber-500/20">
            Soon
          </span>
        ) : null}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight text-balance group-hover:text-slate-950 transition-colors duration-200 mb-2">
        {module.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{module.tagline}</p>
    </button>
  );
};

export default CourseCard;
