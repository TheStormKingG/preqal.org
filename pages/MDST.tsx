import React, { useState, useCallback } from 'react';
import { QUESTIONS } from '../tools/mdst/constants';
import { OptionKey, AssessmentResult } from '../tools/mdst/types';
import { calculateSalaryBand } from '../tools/mdst/scoring';
import { QuestionCard } from '../tools/mdst/components/QuestionCard';
import { ResultScreen } from '../tools/mdst/components/ResultScreen';

const MDST: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleSelect = useCallback((option: OptionKey) => {
    setAnswers((prev) => ({ ...prev, [QUESTIONS[currentIndex].id]: option }));
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === QUESTIONS.length) {
      const band = calculateSalaryBand(answers);
      setResult({ band, answers });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8 px-4 md:py-12 pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        {!result && (
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">MD-ST</h1>
            <p className="text-neutral-500 font-medium mt-1">Medical Director Scope Tool</p>
          </div>
        )}

        {!result ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden mb-8 backdrop-blur-sm border border-neutral-200">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <QuestionCard
              question={QUESTIONS[currentIndex]}
              selectedOption={answers[QUESTIONS[currentIndex].id] || null}
              onSelect={handleSelect}
              index={currentIndex}
              total={QUESTIONS.length}
            />

            <div className="flex items-center justify-between gap-4 mt-8 sticky bottom-8 sm:relative sm:bottom-0 p-4 sm:p-0 bg-white/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-3xl sm:rounded-none border border-neutral-200 sm:border-none">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-neutral-500 hover:bg-white/50'
                }`}
              >
                Back
              </button>

              {currentIndex === QUESTIONS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isComplete}
                  className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 ${
                    isComplete 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Finalize Assessment
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[QUESTIONS[currentIndex].id]}
                  className={`px-10 py-4 rounded-2xl font-bold transition-all ${
                    answers[QUESTIONS[currentIndex].id]
                      ? 'bg-neutral-800 text-white hover:bg-neutral-900 active:scale-95 shadow-xl shadow-neutral-200'
                      : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              )}
            </div>
            
            <p className="text-center text-xs text-neutral-400 font-medium uppercase tracking-widest pt-4">
              Step {currentIndex + 1} of {QUESTIONS.length}
            </p>
          </div>
        ) : (
          <ResultScreen result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default MDST;
