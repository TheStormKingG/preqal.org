import React from 'react';
import { Question, OptionKey } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedOption: OptionKey | null;
  onSelect: (option: OptionKey) => void;
  index: number;
  total: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelect,
  index,
  total
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-neutral-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {question.category}
        </span>
        <span className="text-sm font-medium text-neutral-400">
          Step {index + 1} of {total}
        </span>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4 leading-tight">
        {question.text}
      </h2>
      
      {question.clarification && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
            {question.clarification}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group flex items-start gap-4 ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10'
                : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/30'
            }`}
          >
            <div className={`mt-1 h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              selectedOption === option.id ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'
            }`}>
              {selectedOption === option.id && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className={`text-lg font-semibold ${selectedOption === option.id ? 'text-blue-700' : 'text-neutral-700'}`}>
                {option.label}
              </p>
              <p className={`text-sm mt-1 leading-relaxed ${selectedOption === option.id ? 'text-blue-600/80' : 'text-neutral-500'}`}>
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
