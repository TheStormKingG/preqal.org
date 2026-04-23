import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { quizAckFromStorage, setQuizAck } from './ecourseProgress';
import { MODULE_QUIZ_BANK, type QuizChoiceKey, type QuizQuestion } from './moduleQuizBank.generated';
import { useFullscreen } from './useFullscreen';

export interface ModuleQuizPanelProps {
  moduleId: string;
  unlocked: boolean;
  onAckChange?: () => void;
}

const LEAVE_MS = 380;

const ModuleQuizPanel: React.FC<ModuleQuizPanelProps> = ({ moduleId, unlocked, onAckChange }) => {
  const questions = useMemo(() => MODULE_QUIZ_BANK[moduleId] ?? [], [moduleId]);
  const [acked, setAcked] = useState(() => (typeof window !== 'undefined' ? quizAckFromStorage(moduleId) : false));
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [pick, setPick] = useState<QuizChoiceKey | null>(null);
  const [wrongHint, setWrongHint] = useState(false);
  const [finishedRun, setFinishedRun] = useState(false);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const { ref: fsRef, active: fsOpen, toggle: toggleFs } = useFullscreen<HTMLDivElement>();

  useEffect(() => {
    setAcked(quizAckFromStorage(moduleId));
  }, [moduleId]);

  useEffect(() => {
    setPracticeOpen(false);
    setQuestionIndex(0);
    setPick(null);
    setWrongHint(false);
    setFinishedRun(false);
    setPhase('in');
  }, [moduleId]);

  const q: QuizQuestion | undefined = questions[questionIndex];
  const total = questions.length;
  const isLast = total > 0 && questionIndex >= total - 1;

  const resetRunner = useCallback(() => {
    setQuestionIndex(0);
    setPick(null);
    setWrongHint(false);
    setFinishedRun(false);
    setPhase('in');
  }, []);

  const markCourseDone = useCallback(() => {
    setQuizAck(moduleId);
    setAcked(true);
    setPracticeOpen(false);
    resetRunner();
    onAckChange?.();
  }, [moduleId, onAckChange, resetRunner]);

  const submitAnswer = useCallback(() => {
    if (!q || pick === null) return;
    if (pick !== q.correct) {
      setWrongHint(true);
      return;
    }
    setWrongHint(false);
    setPhase('out');
    window.setTimeout(() => {
      if (isLast) {
        setFinishedRun(true);
      } else {
        setQuestionIndex((i) => i + 1);
        setPick(null);
      }
      setPhase('in');
    }, LEAVE_MS);
  }, [isLast, pick, q]);

  const selectChoice = useCallback(
    (key: QuizChoiceKey) => {
      if (acked && !practiceOpen) return;
      if (finishedRun) return;
      setPick(key);
      setWrongHint(false);
    },
    [acked, finishedRun, practiceOpen],
  );

  if (!unlocked) {
    return (
      <section className="mt-8 shrink-0" aria-label="Module quiz">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Module quiz</p>
        <div className="neu-pressed-sm rounded-2xl px-4 py-6 text-center text-sm text-slate-600">
          Watch the full module video to unlock the quiz.
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="mt-8 shrink-0" aria-label="Module quiz">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Module quiz</p>
        <div className="neu-pressed-sm rounded-2xl px-4 py-5 text-sm text-slate-600">
          <p>Interactive quiz data is not available for this module yet.</p>
        </div>
      </section>
    );
  }

  if (acked && !practiceOpen) {
    return (
      <section className="mt-8 shrink-0" aria-label="Module quiz">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Module quiz</p>
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 neu-pressed-sm px-2 py-0.5 rounded-full">
            Completed
          </span>
        </div>
        <div className="neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5 px-4 py-5 sm:p-6 space-y-4">
          <p className="text-sm text-slate-700 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
            <span>Quiz passed. Your course progress is saved.</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setPracticeOpen(true);
              resetRunner();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
            Practice again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 shrink-0" aria-label="Module quiz">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Module quiz</p>
        {acked && practiceOpen ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600 neu-pressed-sm px-2 py-0.5 rounded-full">
            Practice
          </span>
        ) : null}
      </div>
      <div
        ref={fsRef}
        className={[
          'neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5 flex flex-col',
          fsOpen ? '[&:fullscreen]:rounded-none [&:fullscreen]:min-h-[100dvh] [&:fullscreen]:ring-0 [&:fullscreen]:bg-[#e8ecf2]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-slate-200/60 bg-[#e8ecf2]/90 shrink-0">
          {finishedRun ? (
            <p className="text-xs font-bold text-slate-600">Results</p>
          ) : (
            <p className="text-xs font-bold text-slate-600 tabular-nums">
              Question {questionIndex + 1} of {total}
            </p>
          )}
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
            'flex flex-col flex-1 min-h-0 p-4 sm:p-5 space-y-4',
            fsOpen ? 'overflow-y-auto min-h-0 [&:fullscreen]:flex-1' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {!finishedRun && q ? (
            <div
              key={q.id}
              className={[
                'rounded-xl border border-slate-200/80 bg-white/60 p-4 sm:p-5',
                phase === 'out' ? 'animate-ecourse-quiz-out' : 'animate-ecourse-quiz-in',
              ].join(' ')}
            >
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Select one answer</p>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug mb-4">{q.question}</p>
              <div className="space-y-2" role="radiogroup" aria-label={`Question ${q.id}`}>
                {q.choices.map((c) => {
                  const id = `quiz-${moduleId}-q${q.id}-${c.key}`;
                  const selected = pick === c.key;
                  return (
                    <label
                      key={c.key}
                      htmlFor={id}
                      className={[
                        'flex gap-3 items-start rounded-lg px-3 py-2.5 cursor-pointer border transition-colors',
                        selected ? 'border-amber-500/50 bg-amber-500/10' : 'border-transparent hover:bg-white/80',
                      ].join(' ')}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`quiz-${moduleId}-${q.id}`}
                        className="mt-1 shrink-0"
                        checked={selected}
                        onChange={() => selectChoice(c.key)}
                      />
                      <span className="text-sm text-slate-800 leading-relaxed">
                        <span className="font-bold text-slate-600">{c.key}.</span> {c.text}
                      </span>
                    </label>
                  );
                })}
              </div>
              {wrongHint ? (
                <p className="mt-3 text-xs font-semibold text-red-700">Not quite — pick another option and submit again.</p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={pick === null}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-45 disabled:pointer-events-none transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={resetRunner}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Reset
                </button>
              </div>
            </div>
          ) : null}

          {finishedRun ? (
            <div key="summary" className="animate-ecourse-quiz-in rounded-xl border border-emerald-300/60 bg-emerald-500/5 p-5 sm:p-6 text-center space-y-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" aria-hidden />
              <p className="text-base font-bold text-slate-900">All {total} answers correct</p>
              <p className="text-sm text-slate-600">
                {acked
                  ? 'Nice work — your course completion is already on file.'
                  : 'You need every answer correct to continue the course.'}
              </p>
              {!acked ? (
                <button
                  type="button"
                  onClick={markCourseDone}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm transition-colors"
                >
                  Continue course
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPracticeOpen(false);
                    resetRunner();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                >
                  Done practicing
                </button>
              )}
            </div>
          ) : null}

          {!finishedRun ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Answer each question in order. Submit moves you to the next question when your answer is correct.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ModuleQuizPanel;
