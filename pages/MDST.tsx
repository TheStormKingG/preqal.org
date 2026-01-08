import React, { useState, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { QUESTIONS } from '../tools/mdst/constants';
import { OptionKey, AssessmentResult } from '../tools/mdst/types';
import { calculateSalaryBand } from '../tools/mdst/scoring';
import { QuestionCard } from '../tools/mdst/components/QuestionCard';
import { ResultScreen } from '../tools/mdst/components/ResultScreen';
import { LeadCaptureForm, LeadInfo } from '../tools/mdst/components/LeadCaptureForm';
import { generatePDFReport } from '../tools/mdst/services/pdfService';
import { BAND_MAP } from '../tools/mdst/constants';

const MDST: React.FC = () => {
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (Object.keys(answers).length === QUESTIONS.length && leadInfo) {
      setIsSubmitting(true);
      const band = calculateSalaryBand(answers);
      const result: AssessmentResult = { band, answers };
      const details = BAND_MAP[band];
      
      // Generate PDF and send emails
      try {
        // Generate PDF and convert to base64 data URL for email
        const pdfBlob = await generatePDFReport(result, details, leadInfo);
        
        // Also trigger browser download
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MD-ST_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Send lead notification to Preqal
        try {
          const leadTemplateId = import.meta.env.VITE_EMAILJS_MDST_LEAD_TEMPLATE_ID || 
                                'template_sijvjd7';
          
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
            leadTemplateId,
            {
              subject: 'Preqal Lead - MD-ST Assessment',
              first_name: leadInfo.firstName,
              last_name: leadInfo.lastName,
              full_name: `${leadInfo.firstName} ${leadInfo.lastName}`,
              email: leadInfo.email,
              company: leadInfo.company,
              job_title: 'Medical Director (Assessment)',
              assessment_band: details.band,
              assessment_range: details.range,
              assessment_title: details.title,
              message: `MD-ST Assessment completed. Band: ${details.band}, Range: ${details.range}`,
              source_page: 'mdst_assessment',
              submitted_at: new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'long',
                timeZone: 'UTC'
              }),
              formatted_data: `
New Lead Submission - MD-ST Assessment

Name: ${leadInfo.firstName} ${leadInfo.lastName}
Email: ${leadInfo.email}
Company: ${leadInfo.company}
Assessment Result: Band ${details.band} (${details.range})
Role Title: ${details.title}
Source: MD-ST Assessment Tool
Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
              `.trim(),
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
          );
        } catch (leadError) {
          console.error('Error sending lead notification:', leadError);
          // Don't block user if lead notification fails
        }

        // Send PDF report email to user with PDF data URL
        try {
          const userTemplateId = import.meta.env.VITE_EMAILJS_MDST_USER_TEMPLATE_ID || 
                                 'template_8rvfoi6';
          
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
            userTemplateId,
            {
              subject: `Your MD-ST Assessment Report - Band ${details.band}`,
              first_name: leadInfo.firstName,
              last_name: leadInfo.lastName,
              full_name: `${leadInfo.firstName} ${leadInfo.lastName}`,
              email: leadInfo.email,
              company: leadInfo.company,
              assessment_band: details.band,
              assessment_range: details.range,
              assessment_title: details.title,
              assessment_description: details.description,
              assessment_responsibilities: details.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n'),
              submitted_at: new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'long',
                timeZone: 'UTC'
              }),
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
          );
        } catch (emailError) {
          console.error('Error sending email to user:', emailError);
          // Don't block user if email fails
        }

        // Set result to show results screen
        setResult(result);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert(`Assessment complete! Your PDF report has been downloaded and sent to ${leadInfo.email}.`);
      } catch (error) {
        console.error('Error generating PDF or sending emails:', error);
        // Still show results even if email fails
        setResult({ band, answers });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('Assessment complete! PDF downloaded. (Email notification failed, but your report is ready.)');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setLeadInfo(null); // Reset lead info on reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeadSubmit = (info: LeadInfo) => {
    setLeadInfo(info);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8 px-4 md:py-12 pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Show lead form first if not submitted */}
        {!leadInfo ? (
          <LeadCaptureForm onSubmit={handleLeadSubmit} />
        ) : !result ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">MD-ST</h1>
              <p className="text-neutral-500 font-medium mt-1">Medical Director Scope Tool</p>
            </div>

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
                    disabled={!isComplete || isSubmitting}
                    className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 ${
                      isComplete && !isSubmitting
                        ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Finalize Assessment'}
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
          </>
        ) : (
          <ResultScreen result={result} leadInfo={leadInfo} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default MDST;
