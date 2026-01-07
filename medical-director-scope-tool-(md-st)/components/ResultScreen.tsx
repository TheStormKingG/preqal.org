
import React from 'react';
import { AssessmentResult, BandDetails } from '../types';
import { QUESTIONS, BAND_MAP } from '../constants';
import { generatePDFReport } from '../services/pdfService';

interface ResultScreenProps {
  result: AssessmentResult;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onReset }) => {
  const details = BAND_MAP[result.band];

  const handleCopySummary = () => {
    const summary = `
MD-ST Salary Assessment
Band: ${details.band}
Range: ${details.range}
Role: ${details.title}
    `.trim();
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl p-8 md:p-12 apple-shadow text-center">
        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-gray-500 font-semibold uppercase tracking-widest text-sm mb-2">Assessment Complete</h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Classified Band {details.band}</h1>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 inline-block border border-slate-100">
          <p className="text-3xl font-bold text-blue-600">{details.range}</p>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-tighter">Approximate Monthly Salary (GYD)</p>
        </div>

        <div className="text-left space-y-6 max-w-xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Role Profile: {details.title}</h3>
            <p className="text-slate-600 leading-relaxed">{details.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Key Responsibilities</h3>
            <ul className="space-y-3">
              {details.responsibilities.map((res, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>{res}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 apple-shadow overflow-hidden">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Summary of Responses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-slate-400 uppercase text-xs">ID</th>
                <th className="pb-4 font-semibold text-slate-400 uppercase text-xs">Question</th>
                <th className="pb-4 font-semibold text-slate-400 uppercase text-xs text-center">Opt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {QUESTIONS.map((q) => (
                <tr key={q.id}>
                  <td className="py-4 text-sm font-bold text-slate-400">{q.id}</td>
                  <td className="py-4 text-sm text-slate-600">{q.text}</td>
                  <td className="py-4 text-center">
                    <span className="inline-block w-8 h-8 leading-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                      {result.answers[q.id]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pb-12">
        <button
          onClick={() => generatePDFReport(result, details)}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          Download PDF Report
        </button>
        <button
          onClick={handleCopySummary}
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-slate-700 border-2 border-gray-100 rounded-2xl font-bold transition-all active:scale-95"
        >
          Copy Summary
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-8 py-4 bg-transparent text-slate-400 hover:text-slate-600 font-semibold transition-all"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
};
