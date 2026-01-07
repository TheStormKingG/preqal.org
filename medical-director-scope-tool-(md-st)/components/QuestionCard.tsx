
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
    <div className="bg-white rounded-3xl p-6 md:p-8 apple-shadow border border-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {question.category}
        </span>
        <span className="text-sm font-medium text-gray-400">
          Step {index + 1} of {total}
        </span>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-tight">
        {question.text}
      </h2>

      <div className="space-y-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group flex items-start gap-4 ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10'
                : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
            }`}
          >
            <div className={`mt-1 h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              selectedOption === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {selectedOption === option.id && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <div>
              <p className={`text-lg font-semibold ${selectedOption === option.id ? 'text-blue-700' : 'text-slate-700'}`}>
                {option.label}
              </p>
              <p className={`text-sm mt-1 leading-relaxed ${selectedOption === option.id ? 'text-blue-600/80' : 'text-slate-500'}`}>
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
