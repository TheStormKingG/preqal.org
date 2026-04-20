import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CourseModule } from './types';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h} hr ${m} min` : `~${h} hr`;
}

interface CourseCardProps {
  module: CourseModule;
  isOpen: boolean;
  onToggle: () => void;
  revealClassName?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ module, isOpen, onToggle, revealClassName = '' }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMaxHeight(`${el.scrollHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div
      className={`neu-card rounded-2xl h-full flex flex-col transition-all duration-300 ${isOpen ? 'neu-raised' : ''} ${revealClassName}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-6 flex flex-col flex-1 min-h-[260px] sm:min-h-[240px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 rounded-2xl"
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
        <div className="mt-4 pt-2 flex justify-end border-t border-transparent">
          <ChevronDown
            className={`h-5 w-5 text-amber-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-400 ease-in-out px-6"
        style={{
          maxHeight,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease-in-out',
        }}
      >
        <div ref={contentRef} className="pb-6 border-t border-slate-200/40 pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">What you will take away</p>
          <ul className="space-y-2 mb-6">
            {module.outcomes.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm text-slate-600 leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <span className="neu-pressed-sm text-xs px-3 py-2 rounded-lg text-slate-600">
              <span className="text-slate-500">Time </span>
              <span className="font-semibold text-slate-800">{formatDuration(module.estimatedMinutes)}</span>
            </span>
            <span className="neu-pressed-sm text-xs px-3 py-2 rounded-lg text-slate-600">
              <span className="text-slate-500">Level </span>
              <span className="font-semibold text-slate-800">{module.skillLevel}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
