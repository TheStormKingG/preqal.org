import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Circle, Menu, X } from 'lucide-react';
import SEO from '../components/SEO';
import { COURSE_MODULES } from '../components/ecourses/courseModules';

const COURSE_DISPLAY_TITLE = 'Build Systems That Actually Work';

const ECourseLearn: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => new Set(COURSE_MODULES.map((m) => m.id)));

  const total = COURSE_MODULES.length;
  const current = COURSE_MODULES[activeIndex];
  const courseProgressPct = Math.min(100, Math.round(((activeIndex + 1) / total) * 100));

  const toggleModule = useCallback((id: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  useEffect(() => {
    setExpandedModuleIds((prev) => new Set(prev).add(current.id));
  }, [current.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  const selectLesson = (moduleIndex: number) => {
    setActiveIndex(moduleIndex);
    setSidebarOpen(false);
  };

  const navButtons = useMemo(
    () => (
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex <= 0}
          className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex >= total - 1}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
        >
          Next
        </button>
      </div>
    ),
    [activeIndex, goNext, goPrev, total]
  );

  return (
    <>
      <SEO pageKey="eCourseLearn" />

      <div className="min-h-screen flex flex-col pt-20 pb-40 sm:pb-44">
        {/* Top bar — course title + navigation */}
        <header className="shrink-0 border-b border-slate-200/60 bg-[#e0e5ec]/95 backdrop-blur-md shadow-[0_2px_8px_#a3b1c6]">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="lg:hidden neu-raised-sm p-2.5 rounded-xl text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open course modules"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to="/e-courses"
              className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-600 whitespace-nowrap neu-pressed-sm px-3 py-1.5 rounded-xl transition-colors"
            >
              ← Overview
            </Link>
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 text-center flex-1 min-w-0 order-last lg:order-none w-full lg:w-auto basis-full lg:basis-auto truncate px-1">
              E-Course: {COURSE_DISPLAY_TITLE}
            </h1>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 min-w-0 relative">
          {/* Mobile sidebar overlay */}
          {sidebarOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm lg:hidden"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          {/* Left sidebar — course modules */}
          <aside
            className={[
              'fixed lg:static inset-y-0 left-0 z-[70] lg:z-auto w-[min(100%,20rem)] lg:w-72 shrink-0 flex flex-col pt-0 pb-32 lg:pb-0 lg:max-h-full transition-transform duration-300 ease-out lg:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            <div className="h-full max-h-full min-h-0 flex flex-col m-2 lg:m-4 neu-card rounded-2xl overflow-hidden shadow-neu-sm max-h-[calc(100svh-5rem-12rem)] lg:max-h-[calc(100svh-5rem-4.25rem-12rem)]">
              <div className="flex items-center justify-between gap-2 px-4 py-3 neu-pressed-sm border-b border-slate-200/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Course modules</span>
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-lg text-slate-600 neu-raised-sm"
                  aria-label="Close modules"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Course modules">
                {COURSE_MODULES.map((mod, moduleIndex) => {
                  const expanded = expandedModuleIds.has(mod.id);
                  const isActiveModule = moduleIndex === activeIndex;
                  return (
                    <div key={mod.id} className="rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-bold rounded-lg transition-all ${
                          isActiveModule ? 'bg-amber-500/15 text-slate-900' : 'text-slate-700 hover:bg-white/40'
                        }`}
                        aria-expanded={expanded}
                      >
                        <span className="truncate">
                          Module {mod.number}: {mod.title.split('(')[0].trim()}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-amber-600 transition-transform ${expanded ? 'rotate-90' : ''}`}
                          aria-hidden
                        />
                      </button>
                      {expanded ? (
                        <div className="pb-1 pl-1">
                          <button
                            type="button"
                            onClick={() => selectLesson(moduleIndex)}
                            className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                              isActiveModule
                                ? 'neu-raised-sm bg-amber-100/40 text-slate-900 ring-1 ring-amber-500/30'
                                : 'text-slate-600 hover:bg-white/50'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {moduleIndex < activeIndex ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                              ) : isActiveModule ? (
                                <span className="flex h-4 w-4 items-center justify-center" aria-hidden>
                                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/50 shadow-sm" />
                                </span>
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400" aria-hidden />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-semibold text-slate-800 line-clamp-2 block">{mod.title}</span>
                              <span className="text-xs text-slate-500 mt-0.5 block">
                                ~{mod.estimatedMinutes} min
                                {mod.comingSoon ? ' · Coming soon' : ''}
                              </span>
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main slide area */}
          <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-3 sm:p-5 lg:p-8 flex flex-col">
            <div className="flex-1 flex items-stretch justify-center max-w-5xl w-full mx-auto pb-6 sm:pb-8">
              <div className="neu-card neu-raised rounded-2xl w-full p-6 sm:p-10 lg:p-12 shadow-neu min-h-[min(70vh,36rem)] flex flex-col border border-white/50 mb-2 sm:mb-4">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 flex-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                      Module {current.number}
                    </p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight text-balance">
                      {current.title}
                    </h2>
                    <p className="mt-4 text-lg sm:text-xl font-semibold text-amber-800/90 leading-snug">{current.tagline}</p>
                    <p className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-500">What you will take away</p>
                    <ul className="mt-3 space-y-3">
                      {current.outcomes.map((line) => (
                        <li key={line} className="flex gap-3 text-base text-slate-700 leading-relaxed">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:w-44 shrink-0 flex flex-col gap-3">
                    <div className="neu-pressed-sm rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">~{current.estimatedMinutes} min</p>
                    </div>
                    <div className="neu-pressed-sm rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Level</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{current.skillLevel}</p>
                    </div>
                    {current.comingSoon ? (
                      <p className="text-xs text-center text-amber-800 font-semibold neu-pressed-sm rounded-xl py-2 px-2">
                        This module is coming soon.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Bottom bar — progress + navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-[#e0e5ec]/95 backdrop-blur-md shadow-[0_-4px_12px_#a3b1c6] pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 flex flex-col items-center gap-5">
            <div className="flex justify-center w-full">{navButtons}</div>
            <div className="flex flex-col items-center w-full max-w-md mx-auto gap-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide text-center">
                Course progress
              </p>
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="h-2.5 flex-1 min-w-0 max-w-[280px] neu-pressed-sm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out shadow-inner"
                    style={{ width: `${courseProgressPct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 tabular-nums shrink-0">{courseProgressPct}%</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ECourseLearn;
