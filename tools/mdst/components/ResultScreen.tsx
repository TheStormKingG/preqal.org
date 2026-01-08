import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { AssessmentResult, BandDetails } from '../types';
import { QUESTIONS, BAND_MAP } from '../constants';
import { generatePDFReport } from '../services/pdfService';
import { LeadInfo } from './LeadCaptureForm';

interface ResultScreenProps {
  result: AssessmentResult;
  leadInfo: LeadInfo;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, leadInfo, onReset }) => {
  const details = BAND_MAP[result.band];
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-neutral-200 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-neutral-500 font-semibold uppercase tracking-widest text-sm mb-2">Assessment Complete</h2>
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-6">Classified Band {details.band}</h1>
        
        <div className="bg-neutral-50 rounded-2xl p-6 mb-8 inline-block border border-neutral-100">
          <p className="text-3xl font-bold text-blue-600">{details.range}</p>
          <p className="text-sm text-neutral-400 mt-1 uppercase tracking-tighter">Approximate Monthly Salary (GYD)</p>
        </div>

        <div className="text-left space-y-6 max-w-xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Role Profile: {details.title}</h3>
            <p className="text-neutral-600 leading-relaxed">{details.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-neutral-800 mb-3">Key Responsibilities</h3>
            <ul className="space-y-3">
              {details.responsibilities.map((res, i) => (
                <li key={i} className="flex items-start gap-3 text-neutral-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>{res}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border border-neutral-200 overflow-hidden">
        <h3 className="text-xl font-bold text-neutral-800 mb-6">Summary of Responses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="pb-4 font-semibold text-neutral-400 uppercase text-xs">ID</th>
                <th className="pb-4 font-semibold text-neutral-400 uppercase text-xs">Question</th>
                <th className="pb-4 font-semibold text-neutral-400 uppercase text-xs text-center">Opt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {QUESTIONS.map((q) => (
                <tr key={q.id}>
                  <td className="py-4 text-sm font-bold text-neutral-400">{q.id}</td>
                  <td className="py-4 text-sm text-neutral-600">{q.text}</td>
                  <td className="py-4 text-center">
                    <span className="inline-block w-8 h-8 leading-8 rounded-full bg-neutral-100 text-neutral-600 font-bold text-xs">
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
          onClick={async () => {
            try {
              setIsSendingEmail(true);
              
              // Generate PDF and get it as blob/base64 for email
              const pdfBlob = await generatePDFReport(result, details, leadInfo);
              
              // Send lead notification to Preqal
              try {
                await emailjs.send(
                  import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
                  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_t9m3dai',
                  {
                    subject: 'Preqal Lead - MD-ST Assessment',
                    first_name: leadInfo.firstName,
                    last_name: leadInfo.lastName,
                    full_name: `${leadInfo.firstName} ${leadInfo.lastName}`,
                    email: leadInfo.email,
                    company: leadInfo.company,
                    job_title: 'Medical Director (Assessment)',
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

              // Send PDF report email to user via EmailJS
              try {
                // Convert PDF blob to base64 for potential future use
                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = async () => {
                  const base64PDF = reader.result as string;
                  
                  // Send email to user with assessment results
                  await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_t9m3dai',
                    {
                      subject: `Your MD-ST Assessment Report - Band ${details.band}`,
                      first_name: leadInfo.firstName,
                      last_name: leadInfo.lastName,
                      full_name: `${leadInfo.firstName} ${leadInfo.lastName}`,
                      email: leadInfo.email,
                      company: leadInfo.company,
                      message: `Thank you for completing the MD-ST Assessment.

Your Assessment Results:
- Band: ${details.band}
- Salary Range: ${details.range}
- Role Title: ${details.title}

Your PDF report has been downloaded. Please check your downloads folder.

If you have any questions about your assessment results, please don't hesitate to contact us.`,
                      source_page: 'mdst_user_report',
                      submitted_at: new Date().toLocaleString('en-US', { 
                        dateStyle: 'full', 
                        timeStyle: 'long',
                        timeZone: 'UTC'
                      }),
                    },
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
                  );
                };
                
                alert(`PDF report downloaded! A confirmation email has been sent to ${leadInfo.email}.`);
              } catch (emailError) {
                console.error('Error sending email to user:', emailError);
                alert(`PDF report downloaded! (Email notification failed, but your report is ready.)`);
              }
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('Failed to generate PDF. Please try again.');
            } finally {
              setIsSendingEmail(false);
            }
          }}
          disabled={isSendingEmail}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 ${
            isSendingEmail
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSendingEmail ? 'Sending...' : 'Download PDF Report'}
        </button>
        <button
          onClick={handleCopySummary}
          className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 border-2 border-neutral-100 rounded-2xl font-bold transition-all active:scale-95"
        >
          Copy Summary
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-8 py-4 bg-transparent text-neutral-400 hover:text-neutral-600 font-semibold transition-all"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
};
