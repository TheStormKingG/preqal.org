import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, RotateCcw } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import { quizAckFromStorage, setQuizAck } from './ecourseProgress';
import { MODULE_QUIZ_BANK, type QuizChoiceKey, type QuizQuestion } from './moduleQuizBank.generated';

export interface ModuleQuizPanelProps {
  moduleId: string;
  /** Optional download of the original Word quiz. */
  docxSrc?: string;
  unlocked: boolean;
  onAckChange?: () => void;
}

function scoreAnswers(questions: QuizQuestion[], picks: Record<number, QuizChoiceKey | undefined>) {
  let correct = 0;
  for (const q of questions) {
    if (picks[q.id] === q.correct) correct += 1;
  }
  return { correct, total: questions.length };
}

const ModuleQuizPanel: React.FC<ModuleQuizPanelProps> = ({ moduleId, docxSrc, unlocked, onAckChange }) => {
  const questions = useMemo(() => MODULE_QUIZ_BANK[moduleId] ?? [], [moduleId]);
  const [acked, setAcked] = useState(() => (typeof window !== 'undefined' ? quizAckFromStorage(moduleId) : false));
  const [picks, setPicks] = useState<Record<number, QuizChoiceKey | undefined>>({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAcked(quizAckFromStorage(moduleId));
  }, [moduleId]);

  useEffect(() => {
    setPicks({});
    setChecked(false);
  }, [moduleId]);

  const absDocx = docxSrc ? publicAssetAbsoluteUrl(docxSrc) : null;

  const { correct, total } = useMemo(() => scoreAnswers(questions, picks), [questions, picks]);
  const allAnswered = questions.length > 0 && questions.every((q) => picks[q.id] !== undefined);
  const allCorrect = questions.length > 0 && correct === total;

  const selectChoice = useCallback((questionId: number, key: QuizChoiceKey) => {
    if (acked) return;
    setPicks((prev) => ({ ...prev, [questionId]: key }));
    setChecked(false);
  }, [acked]);

  const checkQuiz = useCallback(() => {
    if (!allAnswered) return;
    setChecked(true);
  }, [allAnswered]);

  const resetQuiz = useCallback(() => {
    setPicks({});
    setChecked(false);
  }, []);

  const markCourseDone = useCallback(() => {
    setQuizAck(moduleId);
    setAcked(true);
    onAckChange?.();
  }, [moduleId, onAckChange]);

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
        <div className="neu-pressed-sm rounded-2xl px-4 py-5 text-sm text-slate-600 space-y-3">
          <p>Interactive quiz data is not available for this module yet.</p>
          {absDocx ? (
            <a
              href={absDocx}
              download
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Download quiz (.docx)
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 shrink-0" aria-label="Module quiz">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Module quiz</p>
        {acked ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 neu-pressed-sm px-2 py-0.5 rounded-full">
            Completed
          </span>
        ) : null}
      </div>
      <div className="neu-pressed-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/50 bg-slate-900/5 space-y-4 p-4 sm:p-5">
        <p className="text-sm text-slate-700 leading-relaxed">
          Answer all {total} questions, then check your results. You need every answer correct to continue the course.
        </p>
        {absDocx ? (
          <a
            href={absDocx}
            download
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all w-fit"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Download original (.docx)
          </a>
        ) : null}

        <ol className="space-y-5 list-none m-0 p-0">
          {questions.map((q, idx) => {
            const chosen = picks[q.id];
            const showResult = checked && chosen !== undefined;
            const isRight = showResult && chosen === q.correct;
            const isWrong = showResult && chosen !== q.correct;
            return (
              <li
                key={q.id}
                className={[
                  'rounded-xl border p-4 sm:p-5',
                  isRight ? 'border-emerald-400/60 bg-emerald-500/5' : '',
                  isWrong ? 'border-red-300/70 bg-red-500/5' : '',
                  !showResult ? 'border-slate-200/80 bg-white/60' : '',
                ].join(' ')}
              >
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Question {idx + 1}</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug mb-3">{q.question}</p>
                <div className="space-y-2" role="radiogroup" aria-label={`Question ${q.id}`}>
                  {q.choices.map((c) => {
                    const id = `quiz-${moduleId}-q${q.id}-${c.key}`;
                    const selected = chosen === c.key;
                    return (
                      <label
                        key={c.key}
                        htmlFor={id}
                        className={[
                          'flex gap-3 items-start rounded-lg px-3 py-2.5 cursor-pointer border transition-colors',
                          selected ? 'border-amber-500/50 bg-amber-500/10' : 'border-transparent hover:bg-white/80',
                          acked ? 'cursor-default opacity-90' : '',
                        ].join(' ')}
                      >
                        <input
                          id={id}
                          type="radio"
                          name={`quiz-${moduleId}-${q.id}`}
                          className="mt-1 shrink-0"
                          checked={selected}
                          disabled={acked}
                          onChange={() => selectChoice(q.id, c.key)}
                        />
                        <span className="text-sm text-slate-800 leading-relaxed">
                          <span className="font-bold text-slate-600">{c.key}.</span> {c.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {showResult && isWrong ? (
                  <p className="mt-2 text-xs font-semibold text-red-700">Correct answer: {q.correct}</p>
                ) : null}
              </li>
            );
          })}
        </ol>

        {!acked ? (
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={checkQuiz}
              disabled={!allAnswered}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-45 disabled:pointer-events-none transition-colors"
            >
              Check answers
            </button>
            <button
              type="button"
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
            {checked ? (
              <p className="text-sm font-bold text-slate-700 sm:ml-auto">
                Score: {correct} / {total}
                {allCorrect ? (
                  <span className="ml-2 text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                    Perfect
                  </span>
                ) : null}
              </p>
            ) : null}
            {checked && allCorrect ? (
              <button
                type="button"
                onClick={markCourseDone}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm transition-colors"
              >
                Continue course
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden />
            Quiz passed. You can reset your answers in the browser if you want to practice again (progress for the course is already saved).
          </p>
        )}
      </div>
    </section>
  );
};

export default ModuleQuizPanel;
