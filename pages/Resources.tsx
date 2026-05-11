import React, { useState, useRef } from 'react';
import { Download, Loader2, CheckCircle2, FileText, ShieldCheck, ClipboardList, AlertTriangle, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const TEMPLATES = [
  { icon: <FileText className="h-4 w-4 text-amber-600" />,       label: 'Document Masterlist' },
  { icon: <ShieldCheck className="h-4 w-4 text-amber-600" />,    label: 'QHSE Policy' },
  { icon: <ClipboardList className="h-4 w-4 text-amber-600" />,  label: 'Document Control Procedure' },
  { icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,  label: 'Risk Register' },
  { icon: <GraduationCap className="h-4 w-4 text-amber-600" />,  label: 'Training & Competency Register' },
];

const Resources: React.FC = () => {
  const jobTitles = ['Quality Manager','Quality Assurance Manager','Quality Control Manager','Compliance Manager','QHSE Manager','HSE Manager','Operations Manager','Production Manager','Quality Engineer','Quality Assurance Engineer','Compliance Officer','Quality Analyst','Quality Specialist','Regulatory Affairs Manager','Director of Quality','VP of Quality','Chief Quality Officer','Other'];
  const qualityProblems = ['Inconsistent process execution','Poor document & change control','Unsafe behaviors + weak supervision','Inadequate risk assessments/controls','Training/competency gaps','Cash flow instability','Weak financial controls','Inventory and material flow issues','Lack of strategic alignment','Other'];

  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', company: '', job_title: '', custom_job_title: '', phone: '', country_iso: 'gy', dial_code: '+592', most_pressing_quality_problem: '', custom_quality_problem: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
  const [showCustomQualityProblem, setShowCustomQualityProblem] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'job_title') {
      setShowCustomJobTitle(value === 'Other');
      setFormData({ ...formData, job_title: value, custom_job_title: value === 'Other' ? '' : formData.custom_job_title });
    } else if (name === 'most_pressing_quality_problem') {
      setShowCustomQualityProblem(value === 'Other');
      setFormData({ ...formData, most_pressing_quality_problem: value, custom_quality_problem: value === 'Other' ? '' : formData.custom_quality_problem });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) { setError('First name is required'); return false; }
    if (!formData.last_name.trim()) { setError('Last name is required'); return false; }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email'); return false; }
    if (!formData.company.trim()) { setError('Company is required'); return false; }
    if (!formData.job_title.trim()) { setError('Job title is required'); return false; }
    if (formData.job_title === 'Other' && !formData.custom_job_title.trim()) { setError('Please enter your job title'); return false; }
    if (!formData.phone.trim()) { setError('Phone number is required'); return false; }
    if (!formData.most_pressing_quality_problem.trim()) { setError('Quality problem is required'); return false; }
    if (formData.most_pressing_quality_problem === 'Other' && !formData.custom_quality_problem.trim()) { setError('Please describe your quality problem'); return false; }
    if (!acceptPrivacy) { setError('Please accept the Privacy Policy to continue'); return false; }
    if (!acceptTerms) { setError('Please accept the Terms of Service to continue'); return false; }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) { setError('Please complete the reCAPTCHA verification'); return false; }
    return true;
  };

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = '/premium-templates.zip';
    link.download = 'premium-templates.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const jobTitle = formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim();
      const qualityProblem = formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim();

      const { error: insertError } = await supabase.from('template_leads').insert({
        first_name: formData.first_name.trim(), last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(), company: formData.company.trim(),
        job_title: jobTitle, phone_number: formData.phone.trim(),
        country_iso: formData.country_iso, dial_code: formData.dial_code,
        most_pressing_quality_problem: qualityProblem, source_page: 'resource_download',
      });
      if (insertError) throw insertError;

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_t9m3dai',
          {
            subject: 'Preqal Lead', first_name: formData.first_name.trim(), last_name: formData.last_name.trim(),
            full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`, email: formData.email.trim().toLowerCase(),
            company: formData.company.trim(), job_title: jobTitle, phone_number: formData.phone.trim(),
            formatted_phone: `${formData.dial_code} ${formData.phone.trim()}`, dial_code: formData.dial_code,
            country_iso: formData.country_iso.toUpperCase(), most_pressing_quality_problem: qualityProblem,
            message: formData.message.trim() || 'N/A', source_page: 'resource_download',
            submitted_at: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC' }),
            formatted_data: `New Lead\n\nName: ${formData.first_name.trim()} ${formData.last_name.trim()}\nEmail: ${formData.email.trim().toLowerCase()}\nCompany: ${formData.company.trim()}\nJob Title: ${jobTitle}\nPhone: ${formData.dial_code} ${formData.phone.trim()} (${formData.country_iso.toUpperCase()})\nQuality Problem: ${qualityProblem}\nMessage: ${formData.message.trim() || 'N/A'}\nSource: Resource Download\nSubmitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
        );
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
      }

      triggerDownload();
      setSuccess(true);
      setFormData({ first_name: '', last_name: '', email: '', company: '', job_title: '', custom_job_title: '', phone: '', country_iso: 'gy', dial_code: '+592', most_pressing_quality_problem: '', custom_quality_problem: '', message: '' });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);
      setRecaptchaToken(null);
      setAcceptPrivacy(false);
      setAcceptTerms(false);
      recaptchaRef.current?.reset();
    } catch (err: unknown) {
      console.error('Error saving lead:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 text-sm"
    + " bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]"
    + " focus:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]";

  return (
    <>
      <SEO pageKey="resources" />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="pt-20 pb-14 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)', transform: 'translate(25%, -30%)' }}
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.p
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            >
              Free resource package
            </motion.p>
            <motion.h1
              className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Start building before<br />
              <em style={{ color: '#d97706' }}>you spend a penny.</em>
            </motion.h1>
            <motion.p
              className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
            >
              Five professional templates — yours instantly, completely free. You don't have to start from scratch. Consider it your first step forward.
            </motion.p>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal yFrom={20}>
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '10px 12px 28px rgba(163,177,198,0.50), -6px -6px 20px rgba(255,255,255,0.92)',
                border: '1.5px solid rgba(255,255,255,0.92)',
              }}
            >
              {/* Amber top bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />

              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/50">

                {/* ── Left panel: what's inside ── */}
                <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0"
                    style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85), 0 0 18px rgba(245,158,11,0.14)' }}
                  >
                    <Download className="h-6 w-6 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Download Your Templates</h2>
                  <p className="text-sm text-slate-500 mb-7 leading-relaxed">Fill in your details and your download starts instantly.</p>

                  {/* Template list */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {TEMPLATES.map((t, i) => (
                      <motion.div
                        key={t.label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.35 + i * 0.07 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                        >
                          {t.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{t.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Trust line */}
                  <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(163,177,198,0.25)' }}>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Used by businesses across Guyana and the Caribbean. Same foundation our consultants install on day one.
                    </p>
                  </div>
                </div>

                {/* ── Right panel: form ── */}
                <div className="lg:col-span-3 p-8 lg:p-10">
                  {success ? (
                    <motion.div
                      className="flex flex-col items-center justify-center h-full text-center py-12"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85)' }}
                      >
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Your download has started!</h3>
                      <p className="text-slate-600 mb-2 text-sm">Check your downloads folder for <strong>premium-templates.zip</strong>.</p>
                      <p className="text-sm text-slate-500 mb-6">
                        Didn't get it?{' '}
                        <button onClick={triggerDownload} className="text-amber-600 font-semibold hover:text-amber-500 underline">
                          Click here to download again
                        </button>.
                      </p>
                      <button
                        onClick={() => setSuccess(false)}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Back to form
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">First Name *</label>
                          <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Last Name *</label>
                          <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="name@company.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company *</label>
                        <input type="text" name="company" required value={formData.company} onChange={handleChange} className={inputClass} placeholder="Company Name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Job Title *</label>
                        <select name="job_title" required value={formData.job_title} onChange={handleChange} className={inputClass}>
                          <option value="">Select a job title</option>
                          {jobTitles.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {showCustomJobTitle && (
                          <input type="text" name="custom_job_title" required value={formData.custom_job_title} onChange={handleChange} className={`${inputClass} mt-3`} placeholder="Enter your job title" />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                        <PhoneInput
                          defaultCountry="gy"
                          value={formData.phone}
                          onChange={(phone, { country, dialCode }) => { setFormData({ ...formData, phone, country_iso: country?.iso2?.toLowerCase() || 'gy', dial_code: dialCode || '+592' }); setError(''); }}
                          className="w-full"
                          inputClassName={inputClass}
                          countrySelectorStyleProps={{ buttonClassName: "px-3 py-3 rounded-l-xl bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff]" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Most Pressing Quality Problem *</label>
                        <select name="most_pressing_quality_problem" required value={formData.most_pressing_quality_problem} onChange={handleChange} className={inputClass}>
                          <option value="">Select a quality problem</option>
                          {qualityProblems.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {showCustomQualityProblem && (
                          <textarea name="custom_quality_problem" required rows={3} value={formData.custom_quality_problem} onChange={handleChange} className={`${inputClass} mt-3 resize-none`} placeholder="Describe your most pressing quality or compliance challenge..." />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Message <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                        <textarea name="message" rows={3} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Tell us about your project or how we can help..." />
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-3 pt-1">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-amber-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                            I have read and accept the{' '}
                            <Link to="/privacy-policy" target="_blank" className="text-amber-600 hover:text-amber-500 underline font-medium">Privacy Policy</Link> *
                          </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-amber-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                            I have read and accept the{' '}
                            <Link to="/terms-of-service" target="_blank" className="text-amber-600 hover:text-amber-500 underline font-medium">Terms of Service</Link> *
                          </span>
                        </label>
                      </div>

                      {/* reCAPTCHA */}
                      {RECAPTCHA_SITE_KEY && (
                        <div className="flex justify-center pt-1">
                          <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setRecaptchaToken(token)} onExpired={() => setRecaptchaToken(null)} />
                        </div>
                      )}

                      {/* Error */}
                      {error && (
                        <div
                          className="px-4 py-3 rounded-xl text-red-600 text-sm"
                          style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)' }}
                        >
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '5px 5px 14px rgba(217,119,6,0.38), -2px -2px 8px rgba(255,255,255,0.6)' }}
                      >
                        {isSubmitting
                          ? <><Loader2 className="h-5 w-5 animate-spin" />Preparing download...</>
                          : <><Download className="h-5 w-5" />Download Free Templates</>
                        }
                      </motion.button>
                      <p className="text-xs text-center text-slate-400">Your download starts immediately after submission.</p>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </>
  );
};

export default Resources;
