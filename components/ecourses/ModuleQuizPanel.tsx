import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Maximize2, Minimize2, RotateCcw, XCircle } from 'lucide-react';
import { quizAckFromStorage, quizScoreMeetsPassMark, setQuizAck } from './ecourseProgress';
import { MODULE_QUIZ_BANK, type QuizChoiceKey, type QuizQuestion } from './moduleQuizBank.generated';
import { useFullscreen } from './useFullscreen';

export interface ModuleQuizPanelProps {
  moduleId: string;
  unlocked: boolean;
  onAckChange?: () => void;
}

const LEAVE_MS = 380;

function countCorrect(questions: QuizQuestion[], responses: Partial<Record<number, QuizChoiceKey>>) {
  return questions.filter((q) => responses[q.id] === q.correct).length;
}

const ModuleQuizPanel: React.FC<ModuleQuizPanelProps> = ({ moduleId, unlocked, onAckChange }) => {
  const questions = useMemo(() => MODULE_QUIZ_BANK[moduleId] ?? [], [moduleId]);
  const [acked, setAcked] = useState(() => (typeof window !== 'undefined' ? quizAckFromStorage(moduleId) : false));
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [pick, setPick] = useState<QuizChoiceKey | null>(null);
  const [responses, setResponses] = useState<Partial<Record<number, QuizChoiceKey>>>({});
  const [showGrading, setShowGrading] = useState(false);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const { ref: fsRef, active: fsOpen, toggle: toggleFs } = useFullscreen<HTMLDivElement>();

  useEffect(() => {
    setAcked(quizAckFromStorage(moduleId));
  }, [moduleId]);

  useEffect(() => {
    setPracticeOpen(false);
    setQuestionIndex(0);
    setPick(null);
    setResponses({});
    setShowGrading(false);
    setPhase('in');
  }, [moduleId]);

  const q: QuizQuestion | undefined = questions[questionIndex];
  const total = questions.length;
  const isLast = total > 0 && questionIndex >= total - 1;
  const correctCount = useMemo(() => countCorrect(questions, responses), [questions, responses]);
  const allCorrect = total > 0 && correctCount === total;
  const passedCourse = total > 0 && quizScoreMeetsPassMark(correctCount, total);

  const resetRunner = useCallback(() => {
    setQuestionIndex(0);
    setPick(null);
    setResponses({});
    setShowGrading(false);
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
    setResponses((prev) => ({ ...prev, [q.id]: pick }));
    setPhase('out');
    window.setTimeout(() => {
      if (isLast) {
        setShowGrading(true);
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
      if (showGrading) return;
      setPick(key);
    },
    [acked, practiceOpen, showGrading],
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
          {showGrading ? (
            <p className="text-xs font-bold text-slate-600 tabular-nums">
              Results · {correctCount} / {total} correct
              {passedCourse ? <span className="ml-2 text-emerald-700">· Pass</span> : <span className="ml-2 text-amber-800">· Below 70%</span>}
            </p>
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
          {!showGrading && q ? (
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
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={pick === null}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-45 disabled:pointer-events-none transition-colors"
                >
                  {isLast ? 'Submit for grading' : 'Submit'}
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

          {showGrading ? (
            <div key="grading" className="animate-ecourse-quiz-in space-y-8 pb-2">
              <p className="text-sm text-slate-700">
                Review each question below. Correct choices are marked with a check; your incorrect selections are marked with an X. The answer key from the module materials follows each question.
              </p>
              {questions.map((question, idx) => {
                const userPick = responses[question.id];
                return (
                  <article
                    key={question.id}
                    className="rounded-xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 scroll-mt-4"
                    aria-labelledby={`quiz-review-${moduleId}-q-${question.id}`}
                  >
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Question {idx + 1}</p>
                    <h3 id={`quiz-review-${moduleId}-q-${question.id}`} className="text-sm sm:text-base font-semibold text-slate-900 leading-snug mb-4">
                      {question.question}
                    </h3>
                    <div className="space-y-2" role="list">
                      {question.choices.map((c) => {
                        const isCorrect = c.key === question.correct;
                        const isUserPick = userPick === c.key;
                        const userWrong = isUserPick && !isCorrect;
                        return (
                          <div
                            key={c.key}
                            role="listitem"
                            className={[
                              'flex gap-3 items-start rounded-lg px-3 py-2.5 border',
                              isCorrect ? 'border-emerald-500/70 bg-emerald-500/10' : '',
                              userWrong ? 'border-red-500/75 bg-red-500/10' : '',
                              !isCorrect && !userWrong ? 'border-slate-200/70 bg-slate-50/80' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden>
                              {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
                              {userWrong ? <XCircle className="h-5 w-5 text-red-600" /> : null}
                              {!isCorrect && !userWrong ? <span className="block h-5 w-5" /> : null}
                            </span>
                            <div className="text-sm text-slate-800 leading-relaxed min-w-0">
                              <span className="font-bold text-slate-600">{c.key}.</span> {c.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200/80 p-3 sm:p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">Answer key</p>
                      <p className="text-sm font-semibold text-slate-800">
                        Correct answer: <span className="text-emerald-800">{question.correct}</span>
                      </p>
                      {question.explanation?.trim() ? (
                        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{question.explanation.trim()}</p>
                      ) : (
                        <p className="text-sm text-slate-500 mt-2 italic">No additional explanation was provided in the source document for this item.</p>
                      )}
                    </div>
                  </article>
                );
              })}

              <div className="rounded-xl border border-slate-200/80 bg-[#e8ecf2]/80 p-4 sm:p-5 space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  Score: <span className="tabular-nums">{correctCount}</span> / {total}
                </p>
                {!passedCourse && !acked ? (
                  <p className="text-sm text-slate-600">
                    You need at least <strong>70%</strong> correct to continue the course (unlimited attempts). Review the answer key above, then try again.
                  </p>
                ) : null}
                {!passedCourse && acked ? (
                  <p className="text-sm text-slate-600">
                    Review the answer key above. Try again for practice — your course completion is already saved.
                  </p>
                ) : null}
                {passedCourse && !acked ? (
                  <p className="text-sm text-emerald-900 font-semibold">
                    {allCorrect ? 'Perfect score.' : 'You met the 70% pass mark.'} You can continue the course.
                  </p>
                ) : null}
                {passedCourse && acked ? (
                  <p className="text-sm text-slate-600">Great practice run. You can close when you are ready.</p>
                ) : null}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetRunner}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                    Try again
                  </button>
                  {passedCourse && !acked ? (
                    <button
                      type="button"
                      onClick={markCourseDone}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm transition-colors"
                    >
                      Continue course
                    </button>
                  ) : null}
                  {passedCourse && acked ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPracticeOpen(false);
                        resetRunner();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
                    >
                      Done practicing
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {!showGrading ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose an answer for each question and submit. You can change your mind before submitting. The last question uses &quot;Submit for grading&quot; to show your full results and the answer key.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ModuleQuizPanel;
