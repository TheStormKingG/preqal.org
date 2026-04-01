import React, { useState, useRef } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

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
    if (!recaptchaToken) { setError('Please complete the reCAPTCHA verification'); return false; }
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
    } catch (err: any) {
      console.error('Error saving lead:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 neu-pressed-sm focus:neu-pressed";

  return (
    <>
      <SEO pageKey="resources" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Free Resource Package</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Download 5 professional compliance templates to kickstart your quality journey — completely free.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto neu-card rounded-2xl overflow-hidden animate-fade-in-up delay-100">
            {/* Header card */}
            <div className="p-10 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="inline-flex items-center justify-center p-4 rounded-full mb-6 neu-pressed">
                <Download className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="font-bold mb-2 text-slate-900" style={{ fontSize: 'calc(1.5rem * 1.07)' }}>Download Your Templates</h2>
              <p className="text-slate-500 mb-6" style={{ fontSize: 'calc(1rem * 1.07)' }}>Fill in your details and your download starts instantly.</p>
              <div className="text-left max-w-sm mx-auto space-y-2">
                {['Document Masterlist', 'QHSE Policy', 'Document Control Procedure', 'Risk Register', 'Training & Competency Register'].map((t, i) => (
                  <div key={t} className="flex items-center space-x-3 neu-pressed-sm px-4 py-2.5 rounded-lg">
                    <span className="text-amber-600 font-bold text-sm">{i + 1}.</span>
                    <span className="text-slate-700 text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="p-10 md:p-12">
              {success ? (
                <div className="text-center py-8 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 neu-pressed">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Your download has started!</h3>
                  <p className="text-slate-600 mb-2">Check your downloads folder for <strong>premium-templates.zip</strong>.</p>
                  <p className="text-sm text-slate-500 mb-6">Didn't get it? <button onClick={triggerDownload} className="text-amber-600 font-semibold hover:text-amber-500 underline">Click here to download again</button>.</p>
                  <button onClick={() => setSuccess(false)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Back to form</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">First Name *</label>
                      <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Last Name *</label>
                      <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="name@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company *</label>
                    <input type="text" name="company" required value={formData.company} onChange={handleChange} className={inputClass} placeholder="Company Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Job Title *</label>
                    <select name="job_title" required value={formData.job_title} onChange={handleChange} className={inputClass}>
                      <option value="">Select a job title</option>
                      {jobTitles.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {showCustomJobTitle && <input type="text" name="custom_job_title" required value={formData.custom_job_title} onChange={handleChange} className={`${inputClass} mt-3`} placeholder="Enter your job title" />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number *</label>
                    <PhoneInput defaultCountry="gy" value={formData.phone} onChange={(phone, { country, dialCode }) => { setFormData({ ...formData, phone, country_iso: country?.iso2?.toLowerCase() || 'gy', dial_code: dialCode || '+592' }); setError(''); }} className="w-full" inputClassName={inputClass} countrySelectorStyleProps={{ buttonClassName: "px-3 py-3 rounded-l-xl neu-pressed-sm" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Most Pressing Quality Problem *</label>
                    <select name="most_pressing_quality_problem" required value={formData.most_pressing_quality_problem} onChange={handleChange} className={inputClass}>
                      <option value="">Select a quality problem</option>
                      {qualityProblems.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {showCustomQualityProblem && <textarea name="custom_quality_problem" required rows={4} value={formData.custom_quality_problem} onChange={handleChange} className={`${inputClass} mt-3 resize-none`} placeholder="Describe your most pressing quality or compliance challenge..." />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Message</label>
                    <textarea name="message" rows={4} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Tell us about your project or how we can help..." />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-1 h-4 w-4 rounded accent-amber-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        I have read and accept the <Link to="/privacy-policy" target="_blank" className="text-amber-600 hover:text-amber-500 underline font-medium">Privacy Policy</Link> *
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded accent-amber-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        I have read and accept the <Link to="/terms-of-service" target="_blank" className="text-amber-600 hover:text-amber-500 underline font-medium">Terms of Service</Link> *
                      </span>
                    </label>
                  </div>
                  {RECAPTCHA_SITE_KEY && (
                    <div className="flex justify-center">
                      <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setRecaptchaToken(token)} onExpired={() => setRecaptchaToken(null)} />
                    </div>
                  )}
                  {error && <div className="p-3 neu-pressed rounded-xl text-red-600 text-sm">{error}</div>}
                  <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all neu-raised-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                    {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Preparing download...</> : <><Download className="h-5 w-5 mr-2" />Download Free Templates</>}
                  </button>
                  <p className="text-xs text-center text-slate-400">Your download starts immediately after submission.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Resources;
