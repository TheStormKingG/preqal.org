import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ChevronRight, Circle, Download, Loader2, Menu, X } from 'lucide-react';
import SEO from '../components/SEO';
import { COURSE_MODULES } from '../components/ecourses/courseModules';
import NativeSlideDeck from '../components/ecourses/NativeSlideDeck';
import GatedModuleVideo from '../components/ecourses/GatedModuleVideo';
import ModuleQuizPanel from '../components/ecourses/ModuleQuizPanel';
import {
  canOpenModuleIndex,
  moduleGateComplete,
  quizDone,
  setSlidesAllComplete,
  slidesDone,
  videoDone,
} from '../components/ecourses/ecourseProgress';
import EcourseRibbonFlyover, {
  ECOURSE_RIBBON_SRC,
  parseRibbonTargetKey,
  ribbonTargetKey,
  type RibbonFlyScreenRect,
} from '../components/ecourses/EcourseRibbonFlyover';
import type { CourseModule } from '../components/ecourses/types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { certVerifyUrl, formatCertDate, generateCertKey } from '../lib/ecourseCertificateConstants';
import { downloadCertificatePdf } from '../lib/ecourseCertificatePdf';

const COURSE_DISPLAY_TITLE = 'Quality Management Systems Foundations';

function ModuleStepStrip({ mod }: { mod: CourseModule }) {
  if (!mod.slidesManifest && !mod.videoSrc && !mod.quizDocxSrc) return null;
  const s1 = slidesDone(mod);
  const s2 = videoDone(mod);
  const s3 = quizDone(mod);
  const steps = [
    { key: 'slides', label: 'Slides', done: s1, optional: !mod.slidesManifest },
    { key: 'video', label: 'Video', done: s2, optional: !mod.videoSrc },
    { key: 'quiz', label: 'Quiz (70%+)', done: s3, optional: !mod.quizDocxSrc },
  ].filter((x) => !x.optional);
  if (steps.length === 0) return null;
  return (
    <ol className="flex flex-wrap items-center gap-2 mb-6" aria-label="Module progress steps">
      {steps.map((step, i) => (
        <li key={step.key} className="flex items-center gap-2 text-xs font-bold text-slate-600">
          {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden /> : null}
          <span
            className={[
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
              step.done ? 'bg-emerald-500/15 text-emerald-800' : 'neu-pressed-sm text-slate-500',
            ].join(' ')}
          >
            {step.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden /> : null}
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function moduleGateSnapshot(): Record<string, { s: boolean; v: boolean; q: boolean }> {
  const o: Record<string, { s: boolean; v: boolean; q: boolean }> = {};
  for (const m of COURSE_MODULES) {
    o[m.id] = { s: slidesDone(m), v: videoDone(m), q: quizDone(m) };
  }
  return o;
}

/** One cert record from Supabase */
interface CertRecord {
  cert_key: string;
  issued_at: string;
}

const ECourseLearn: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => new Set(COURSE_MODULES.map((m) => m.id)));
  const [, bumpGating] = useReducer((x: number) => x + 1, 0);
  const [flyQueue, setFlyQueue] = useState<string[]>([]);
  const prevGateSnapRef = useRef<Record<string, { s: boolean; v: boolean; q: boolean }> | null>(null);
  const pendingSlidesFinalizeRef = useRef<{ moduleId: string; slideCount: number } | null>(null);
  const [deckReloadTick, setDeckReloadTick] = useState(0);
  const [ribbonFlyFromRect, setRibbonFlyFromRect] = useState<RibbonFlyScreenRect | null>(null);

  // ── Certificate state ────────────────────────────────────────────────────
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const [existingCert, setExistingCert] = useState<CertRecord | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [newlyClaimed, setNewlyClaimed] = useState<CertRecord | null>(null);

  const total = COURSE_MODULES.length;
  const current = COURSE_MODULES[activeIndex];
  const courseProgressPct = Math.min(100, Math.round(((activeIndex + 1) / total) * 100));

  const onNativeDeckCompleteChange = useCallback(() => {
    bumpGating();
  }, []);

  const onGatingProgress = useCallback(() => {
    bumpGating();
  }, []);

  // ── Detect full course completion ────────────────────────────────────────
  useEffect(() => {
    const complete = COURSE_MODULES.every((m) => moduleGateComplete(m));
    const raf = requestAnimationFrame(() => {
      setIsCourseComplete(complete);
      if (complete && user) {
        // Load existing cert (if any) so we can show download without re-issuing
        supabase
          .from('ecourse_certificates')
          .select('cert_key, issued_at')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) setExistingCert(data as CertRecord);
          });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [user]);

  // Re-check whenever gating bumps
  useEffect(() => {
    const complete = COURSE_MODULES.every((m) => moduleGateComplete(m));
    const raf = requestAnimationFrame(() => setIsCourseComplete(complete));
    return () => cancelAnimationFrame(raf);
  }, [bumpGating]);

  const handleClaimCert = useCallback(async () => {
    if (!user || !profile) return;
    setCertLoading(true);
    setCertError(null);
    try {
      const activeCert = existingCert ?? newlyClaimed;
      if (activeCert) {
        // Already issued — just download again
        await downloadCertificatePdf({
          recipientName: profile.display_name,
          recipientEmail: profile.email,
          certKey: activeCert.cert_key,
          issuedAt: activeCert.issued_at,
        });
        setCertModalOpen(true);
        return;
      }
      const certKey = generateCertKey();
      const { error } = await supabase.from('ecourse_certificates').insert({
        cert_key: certKey,
        user_id: user.id,
        recipient_name: profile.display_name,
        email: profile.email,
        course_id: 'build-systems-that-actually-work',
        course_title: 'E-Course: Quality Management Systems Foundations',
      });

      if (error) {
        // Unique constraint on (user_id, course_id) — cert already exists, load it
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('ecourse_certificates')
            .select('cert_key, issued_at')
            .eq('user_id', user.id)
            .eq('course_id', 'build-systems-that-actually-work')
            .order('issued_at', { ascending: false })
            .limit(1)
            .single();
          if (existing) {
            const rec = existing as CertRecord;
            setExistingCert(rec);
            await downloadCertificatePdf({
              recipientName: profile.display_name,
              recipientEmail: profile.email,
              certKey: rec.cert_key,
              issuedAt: rec.issued_at,
            });
            setCertModalOpen(true);
            return;
          }
        }
        throw error;
      }

      const rec: CertRecord = { cert_key: certKey, issued_at: new Date().toISOString() };
      setNewlyClaimed(rec);
      await downloadCertificatePdf({
        recipientName: profile.display_name,
        recipientEmail: profile.email,
        certKey: certKey,
        issuedAt: rec.issued_at,
      });
      setCertModalOpen(true);
    } catch (e) {
      setCertError(e instanceof Error ? e.message : 'Could not issue certificate. Please try again.');
    } finally {
      setCertLoading(false);
    }
  }, [user, profile, existingCert, newlyClaimed]);

  const certRecord = newlyClaimed ?? existingCert;

  const toggleModule = useCallback((id: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setExpandedModuleIds((prev) => new Set(prev).add(current.id)));
    return () => cancelAnimationFrame(raf);
  }, [current.id]);

  useEffect(() => {
    if (prevGateSnapRef.current === null) {
      prevGateSnapRef.current = moduleGateSnapshot();
      return;
    }
    const next = moduleGateSnapshot();
    const prev = prevGateSnapRef.current;
    const keys: string[] = [];
    for (const m of COURSE_MODULES) {
      const p = prev[m.id] ?? { s: false, v: false, q: false };
      const n = next[m.id];
      /* Slides ribbon fly is queued from the deck completion modal (OK), not from gating. */
      if (n.v && !p.v) keys.push(ribbonTargetKey(m.id, 'video'));
      if (n.q && !p.q) keys.push(ribbonTargetKey(m.id, 'quiz'));
    }
    prevGateSnapRef.current = next;
    if (keys.length === 0) return;
    const expand = new Set(
      keys.map((k) => parseRibbonTargetKey(k)?.moduleId).filter((id): id is string => Boolean(id)),
    );
    const raf = requestAnimationFrame(() => {
      setExpandedModuleIds((prev) => {
        const n = new Set(prev);
        expand.forEach((id) => n.add(id));
        return n;
      });
      setFlyQueue((q) => [...q, ...keys]);
    });
    return () => cancelAnimationFrame(raf);
  }, [bumpGating]);

  const onSlidesFinalizeAcknowledged = useCallback(
    (moduleId: string, slideCount: number, modalRibbonRect?: RibbonFlyScreenRect) => {
      pendingSlidesFinalizeRef.current = { moduleId, slideCount };
      setRibbonFlyFromRect(modalRibbonRect ?? null);
      setExpandedModuleIds((prev) => new Set(prev).add(moduleId));
      setSidebarOpen(true);
      setFlyQueue((q) => [...q, ribbonTargetKey(moduleId, 'slides')]);
    },
    [],
  );

  const onRibbonFlyDone = useCallback(() => {
    setRibbonFlyFromRect(null);
    setFlyQueue((q) => {
      const doneKey = q[0] ?? null;
      const rest = q.slice(1);
      if (doneKey) {
        const parsed = parseRibbonTargetKey(doneKey);
        const pend = pendingSlidesFinalizeRef.current;
        if (parsed?.step === 'slides' && pend && pend.moduleId === parsed.moduleId) {
          setSlidesAllComplete(pend.moduleId, pend.slideCount);
          pendingSlidesFinalizeRef.current = null;
          requestAnimationFrame(() => {
            setDeckReloadTick((t) => t + 1);
            bumpGating();
          });
        }
      }
      return rest;
    });
  }, [bumpGating]);

  const selectLesson = (moduleIndex: number) => {
    if (moduleIndex > activeIndex && !canOpenModuleIndex(COURSE_MODULES, moduleIndex)) return;
    setActiveIndex(moduleIndex);
    setSidebarOpen(false);
  };

  const canProceedToNextModule =
    activeIndex + 1 < total && canOpenModuleIndex(COURSE_MODULES, activeIndex + 1);

  const onQuizPassContinue = useCallback(() => {
    const next = activeIndex + 1;
    if (next >= total) return;
    if (!canOpenModuleIndex(COURSE_MODULES, next)) return;
    setActiveIndex(next);
    setSidebarOpen(false);
  }, [activeIndex, total]);

  return (
    <>
      <SEO pageKey="eCourseLearn" />

      <div className="min-h-screen flex flex-col pt-20 pb-12 sm:pb-16">
        {/* Top bar — course title, progress, overview */}
        <header className="shrink-0 border-b border-slate-200/60 bg-[#e0e5ec]/95 backdrop-blur-md shadow-[0_2px_8px_#a3b1c6]">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3">
            <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
              <div className="flex items-center gap-3 shrink-0">
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
              </div>
              <div className="flex-1 min-w-0 w-full basis-full lg:basis-0 flex flex-col items-center order-last lg:order-none">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 text-center w-full max-w-3xl px-1">
                  E-Course: {COURSE_DISPLAY_TITLE}
                </h1>
                <div className="mt-3 w-full max-w-md flex flex-col gap-2 items-stretch">
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
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 min-w-0 relative lg:items-stretch">
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
              'fixed lg:static left-0 z-[70] lg:z-auto w-[min(100%,20rem)] lg:w-72 shrink-0 flex flex-col min-h-0 p-2 sm:p-3 lg:p-4',
              'top-20 bottom-6 sm:bottom-8 lg:inset-auto lg:h-full lg:self-stretch',
              'transition-transform duration-300 ease-out lg:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
          >
            <div className="flex-1 min-h-0 w-full h-full flex flex-col neu-card rounded-2xl overflow-hidden shadow-neu-sm">
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
                  const forwardBlocked = moduleIndex > activeIndex && !canOpenModuleIndex(COURSE_MODULES, moduleIndex);
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
                            disabled={forwardBlocked}
                            title={
                              forwardBlocked
                                ? 'Finish slides, video, and quiz (70%+ on quiz) in each earlier module to continue'
                                : undefined
                            }
                            className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                              isActiveModule
                                ? 'neu-raised-sm bg-amber-100/40 text-slate-900 ring-1 ring-amber-500/30'
                                : 'text-slate-600 hover:bg-white/50'
                            } disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {moduleIndex < activeIndex ? (
                                moduleGateComplete(mod) ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                                ) : (
                                  <Circle className="h-4 w-4 text-amber-500" aria-hidden />
                                )
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
                              <ul className="mt-2 space-y-1 pl-0 list-none" aria-label="Module steps">
                                {mod.slidesManifest ? (
                                  <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                                    <span
                                      data-ecourse-ribbon-target={ribbonTargetKey(mod.id, 'slides')}
                                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                                    >
                                      <img
                                        src={ECOURSE_RIBBON_SRC}
                                        alt=""
                                        className={[
                                          'h-4 w-4 object-contain transition-all duration-300',
                                          slidesDone(mod) ? 'opacity-100' : 'opacity-50 grayscale',
                                        ].join(' ')}
                                        decoding="async"
                                      />
                                    </span>
                                    Slides
                                  </li>
                                ) : null}
                                {mod.videoSrc ? (
                                  <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                                    <span
                                      data-ecourse-ribbon-target={ribbonTargetKey(mod.id, 'video')}
                                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                                    >
                                      <img
                                        src={ECOURSE_RIBBON_SRC}
                                        alt=""
                                        className={[
                                          'h-4 w-4 object-contain transition-all duration-300',
                                          videoDone(mod) ? 'opacity-100' : 'opacity-50 grayscale',
                                        ].join(' ')}
                                        decoding="async"
                                      />
                                    </span>
                                    Video
                                  </li>
                                ) : null}
                                {mod.quizDocxSrc ? (
                                  <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                                    <span
                                      data-ecourse-ribbon-target={ribbonTargetKey(mod.id, 'quiz')}
                                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center"
                                    >
                                      <img
                                        src={ECOURSE_RIBBON_SRC}
                                        alt=""
                                        className={[
                                          'h-4 w-4 object-contain transition-all duration-300',
                                          quizDone(mod) ? 'opacity-100' : 'opacity-50 grayscale',
                                        ].join(' ')}
                                        decoding="async"
                                      />
                                    </span>
                                    Quiz
                                  </li>
                                ) : null}
                              </ul>
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

          {/* Main slide area — same vertical inset as sidebar so card bottom aligns with sidebar card */}
          <main className="flex-1 min-w-0 min-h-0 lg:self-stretch flex flex-col p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto">
              <div className="neu-card neu-raised rounded-2xl w-full h-full min-h-0 flex-1 flex flex-col overflow-y-auto border border-white/50 shadow-neu p-6 sm:p-8 lg:p-10">
                {current.slidesManifest ? (
                  <NativeSlideDeck
                    key={current.id}
                    moduleId={current.id}
                    moduleNumber={current.number}
                    manifestPath={current.slidesManifest}
                    slidesReloadToken={deckReloadTick}
                    onAllSlidesReadChange={onNativeDeckCompleteChange}
                    onSlidesFinalizeAcknowledged={onSlidesFinalizeAcknowledged}
                  />
                ) : null}
                <ModuleStepStrip mod={current} />
                {current.videoSrc ? (
                  <GatedModuleVideo
                    key={`video-${current.id}`}
                    moduleId={current.id}
                    src={current.videoSrc}
                    unlocked={slidesDone(current)}
                    onProgress={onGatingProgress}
                    onCompleteChange={onGatingProgress}
                  />
                ) : null}
                {current.quizDocxSrc ? (
                  <ModuleQuizPanel
                    key={`quiz-${current.id}`}
                    moduleId={current.id}
                    moduleNumber={current.number}
                    canProceedToNextModule={canProceedToNextModule}
                    unlocked={videoDone(current)}
                    onAckChange={onGatingProgress}
                    onPassContinue={onQuizPassContinue}
                  />
                ) : null}

                {/* ── Course-complete certificate claim ─────────────────── */}
                {isCourseComplete ? (
                  <section
                    className="mt-8 mb-2 shrink-0 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50/80 to-white/60 neu-raised-sm p-5 sm:p-6 space-y-4"
                    aria-label="Course certificate"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={ECOURSE_RIBBON_SRC}
                        alt=""
                        className="h-14 w-14 object-contain shrink-0 drop-shadow"
                        decoding="async"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-0.5">
                          Course complete
                        </p>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                          Congratulations — you&apos;ve finished the course!
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {certRecord
                            ? `Your certificate (ID: ${certRecord.cert_key}) was issued on ${formatCertDate(certRecord.issued_at)}.`
                            : 'Claim your Preqal certificate of achievement and share it with your network.'}
                        </p>
                      </div>
                    </div>

                    {certError ? (
                      <p className="text-xs text-red-600 neu-pressed-sm rounded-lg px-3 py-2">{certError}</p>
                    ) : null}

                    {user && profile ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleClaimCert()}
                          disabled={certLoading}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-60 disabled:pointer-events-none transition-colors"
                        >
                          {certLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                          ) : certRecord ? (
                            <><Download className="h-4 w-4 shrink-0" /> Download certificate</>
                          ) : (
                            <><Award className="h-4 w-4 shrink-0" /> Claim certificate</>
                          )}
                        </button>
                        {certRecord ? (
                          <a
                            href={certVerifyUrl(certRecord.cert_key)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-700 neu-raised-sm hover:neu-pressed-sm transition-all"
                          >
                            View verification page ↗
                          </a>
                        ) : null}
                      </div>
                    ) : user ? (
                      /* Signed in but profile not yet loaded — retry without leaving the page */
                      <button
                        type="button"
                        onClick={() => void refreshProfile()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
                      </button>
                    ) : (
                      <Link
                        to="/e-courses/register"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                      >
                        Sign in to claim your certificate →
                      </Link>
                    )}
                  </section>
                ) : null}

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 flex-1 min-h-0">
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
      </div>
      {flyQueue[0] ? (
        <EcourseRibbonFlyover
          key={flyQueue[0]}
          flyKey={flyQueue[0]}
          flyFromRect={ribbonFlyFromRect}
          onDone={onRibbonFlyDone}
        />
      ) : null}

      {/* ── Certificate issued modal ─────────────────────────────────────── */}
      {certModalOpen && certRecord && profile
        ? createPortal(
            <div
              className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-modal-title"
            >
              <div className="neu-card max-w-md w-full rounded-2xl border border-white/60 bg-[#e8ecf2] p-6 sm:p-8 shadow-neu text-center space-y-5">
                <img
                  src={ECOURSE_RIBBON_SRC}
                  alt=""
                  className="mx-auto h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-xl"
                  decoding="async"
                />
                <div className="space-y-1">
                  <h2 id="cert-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                    Your certificate is ready!
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A PDF has been downloaded to your device.
                  </p>
                </div>
                <div className="neu-pressed-sm rounded-xl p-3 text-left space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certificate ID</p>
                  <p className="font-mono text-sm font-bold text-amber-700 break-all">{certRecord.cert_key}</p>
                  <p className="text-[10px] text-slate-500">Issued: {formatCertDate(certRecord.issued_at)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void downloadCertificatePdf({
                        recipientName: profile.display_name,
                        recipientEmail: profile.email,
                        certKey: certRecord.cert_key,
                        issuedAt: certRecord.issued_at,
                      });
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden />
                    Download again
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertModalOpen(false)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
                  >
                    Close
                  </button>
                </div>
                <a
                  href={certVerifyUrl(certRecord.cert_key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-amber-700 hover:text-amber-600 underline underline-offset-2"
                >
                  View public verification page ↗
                </a>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default ECourseLearn;
