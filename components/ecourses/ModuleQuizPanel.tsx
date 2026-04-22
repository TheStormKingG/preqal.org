import React, { useCallback, useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { publicAssetAbsoluteUrl } from './slideAssetUrl';
import { quizAckFromStorage, setQuizAck } from './ecourseProgress';

export interface ModuleQuizPanelProps {
  moduleId: string;
  /** Path from site root, e.g. `/e-courses/modules/ms-really/quiz.docx` */
  docxSrc: string;
  unlocked: boolean;
  onAckChange?: () => void;
}

const ModuleQuizPanel: React.FC<ModuleQuizPanelProps> = ({ moduleId, docxSrc, unlocked, onAckChange }) => {
  const [acked, setAcked] = useState(() => (typeof window !== 'undefined' ? quizAckFromStorage(moduleId) : false));

  useEffect(() => {
    setAcked(quizAckFromStorage(moduleId));
  }, [moduleId]);

  const absDocx = publicAssetAbsoluteUrl(docxSrc);
  const embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absDocx)}`;

  const markDone = useCallback(() => {
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
        <div className="flex flex-wrap gap-2">
          <a
            href={absDocx}
            download
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Download quiz (.docx)
          </a>
          <a
            href={embedSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 neu-raised-sm hover:neu-pressed-sm transition-all"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            Open in browser (Office)
          </a>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-white min-h-[320px] sm:min-h-[420px]">
          <iframe
            title="Quiz document preview"
            src={embedSrc}
            className="w-full h-[min(50vh,480px)] sm:h-[480px] border-0"
            loading="lazy"
          />
        </div>
        {!acked ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-200/60">
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete the quiz offline or in the preview above, then confirm below to continue the course.
            </p>
            <button
              type="button"
              onClick={markDone}
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm transition-colors"
            >
              I have finished this quiz
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-600">You can revisit the quiz anytime using the links above.</p>
        )}
      </div>
    </section>
  );
};

export default ModuleQuizPanel;
