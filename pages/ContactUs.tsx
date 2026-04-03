import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const ContactUs: React.FC = () => {
  const jobTitles = ['Quality Manager','Quality Assurance Manager','Quality Control Manager','Compliance Manager','QHSE Manager','HSE Manager','Operations Manager','Production Manager','Quality Engineer','Quality Assurance Engineer','Compliance Officer','Quality Analyst','Quality Specialist','Regulatory Affairs Manager','Director of Quality','VP of Quality','Chief Quality Officer','Other'];
  const qualityProblems = ['Inconsistent process execution','Poor document & change control','Unsafe behaviors + weak supervision','Inadequate risk assessments/controls','Training/competency gaps','Cash flow instability','Weak financial controls','Inventory and material flow issues','Lack of strategic alignment','Other'];

  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', company: '', job_title: '', custom_job_title: '', phone: '', country_iso: 'gy', dial_code: '+592', most_pressing_quality_problem: '', custom_quality_problem: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      setError('');
      if (!formData.first_name.trim()) { setError('First name is required'); setStatus('idle'); return; }
      if (!formData.last_name.trim()) { setError('Last name is required'); setStatus('idle'); return; }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email'); setStatus('idle'); return; }
      if (!formData.company.trim()) { setError('Company is required'); setStatus('idle'); return; }
      if (!formData.job_title.trim()) { setError('Job title is required'); setStatus('idle'); return; }
      if (formData.job_title === 'Other' && !formData.custom_job_title.trim()) { setError('Please enter your job title'); setStatus('idle'); return; }
      if (!formData.phone.trim()) { setError('Phone number is required'); setStatus('idle'); return; }
      if (!formData.most_pressing_quality_problem.trim()) { setError('Quality problem is required'); setStatus('idle'); return; }
      if (formData.most_pressing_quality_problem === 'Other' && !formData.custom_quality_problem.trim()) { setError('Please describe your quality problem'); setStatus('idle'); return; }
      if (!acceptPrivacy) { setError('Please accept the Privacy Policy to continue'); setStatus('idle'); return; }
      if (!acceptTerms) { setError('Please accept the Terms of Service to continue'); setStatus('idle'); return; }
      if (RECAPTCHA_SITE_KEY && !recaptchaToken) { setError('Please complete the reCAPTCHA verification'); setStatus('idle'); return; }

      const jobTitle = formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim();
      const qualityProblem = formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim();

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_t9m3dai',
        {
          subject: 'Preqal Lead', first_name: formData.first_name.trim(), last_name: formData.last_name.trim(),
          full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`, email: formData.email.trim().toLowerCase(),
          company: formData.company.trim(), job_title: jobTitle, phone_number: formData.phone.trim(),
          formatted_phone: `${formData.dial_code} ${formData.phone.trim()}`, dial_code: formData.dial_code,
          country_iso: formData.country_iso.toUpperCase(), most_pressing_quality_problem: qualityProblem,
          message: formData.message.trim() || 'N/A', source_page: 'contact_us',
          submitted_at: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC' }),
          formatted_data: `New Lead\n\nName: ${formData.first_name.trim()} ${formData.last_name.trim()}\nEmail: ${formData.email.trim().toLowerCase()}\nCompany: ${formData.company.trim()}\nJob Title: ${jobTitle}\nPhone: ${formData.dial_code} ${formData.phone.trim()} (${formData.country_iso.toUpperCase()})\nQuality Problem: ${qualityProblem}\nMessage: ${formData.message.trim() || 'N/A'}\nSource: Contact Us\nSubmitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
      );
      setStatus('success');
      setFormData({ first_name: '', last_name: '', email: '', company: '', job_title: '', custom_job_title: '', phone: '', country_iso: 'gy', dial_code: '+592', most_pressing_quality_problem: '', custom_quality_problem: '', message: '' });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);
      setRecaptchaToken(null);
      setAcceptPrivacy(false);
      setAcceptTerms(false);
      recaptchaRef.current?.reset();
    } catch (err) {
      console.error('Error sending contact form:', err);
      setError('Something went wrong. Please try again or email us directly.');
      setStatus('idle');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 neu-pressed-sm focus:neu-pressed";

  return (
    <>
      <SEO pageKey="contact" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
              You've got questions — and you deserve real answers. Whether you're curious about where to start, exploring a partnership, or ready to talk about something built specifically for your business, Preqal is here. Reach out and let's write the next chapter together.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="max-w-3xl mx-auto neu-card rounded-2xl overflow-hidden animate-fade-in-up delay-100">
            <div className="p-10 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact Us</h2>
              <p className="text-slate-500">Get in touch with us</p>
            </div>
            <div className="p-10 md:p-12">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 neu-pressed">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                  <button onClick={() => setStatus('idle')} className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">First Name *</label>
                      <input type="text" name="first_name" required className={inputClass} placeholder="John" value={formData.first_name} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Last Name *</label>
                      <input type="text" name="last_name" required className={inputClass} placeholder="Doe" value={formData.last_name} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email *</label>
                    <input type="email" name="email" required className={inputClass} placeholder="name@company.com" value={formData.email} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company *</label>
                    <input type="text" name="company" required className={inputClass} placeholder="Company Name" value={formData.company} onChange={handleChange} />
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
                    <PhoneInput defaultCountry="gy" value={formData.phone} onChange={(phone, { country, dialCode }) => setFormData({ ...formData, phone, country_iso: country?.iso2?.toLowerCase() || 'gy', dial_code: dialCode || '+592' })} className="w-full" inputClassName={inputClass} countrySelectorStyleProps={{ buttonClassName: "px-3 py-3 rounded-l-xl neu-pressed-sm" }} />
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
                  <button type="submit" disabled={status === 'submitting'} className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-xl transition-all neu-raised-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                    {status === 'submitting' ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</> : 'Submit'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
