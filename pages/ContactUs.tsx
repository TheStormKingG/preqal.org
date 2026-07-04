import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle2, MapPin, Clock, Mail, ArrowRight, Microscope, Activity, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';
import { getFounderPersonSchema, getAboutPageSchema } from '../seo/pageSchemas';
import { useWhatsApp } from '../components/WhatsAppContact';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const CONTACT_INFO = [
  { icon: <MapPin className="h-4 w-4 text-amber-600" />, label: 'Location', value: 'Georgetown, Guyana · Caribbean region' },
  { icon: <Clock className="h-4 w-4 text-amber-600" />, label: 'Response time', value: 'Within 1 business day' },
  { icon: <Mail className="h-4 w-4 text-amber-600" />, label: 'Email', value: 'info@preqal.org' },
];

const PHILOSOPHY = [
  {
    icon: <Microscope className="text-amber-600 h-5 w-5" />,
    title: 'Evidence-Driven',
    desc: 'Every recommendation is grounded in data, risk assessments, and verifiable facts — so every decision you make is one you can stand behind.',
  },
  {
    icon: <Activity className="text-amber-600 h-5 w-5" />,
    title: 'Systems Thinking',
    desc: "Your business is a living system, not a collection of separate problems. We find the root causes others miss — so solutions actually hold.",
  },
  {
    icon: <Globe className="text-amber-600 h-5 w-5" />,
    title: 'Planetary Value',
    desc: 'The standards you build protect your people, your community, and the world your business operates in. Compliance, done right, is leadership.',
  },
  {
    icon: <Heart className="text-amber-600 h-5 w-5" />,
    title: 'Risk-Based',
    desc: 'Your time and resources go exactly where they matter most — on the risks that could affect your product and everything you\'ve built.',
  },
];

const glassCard = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '7px 8px 20px rgba(163,177,198,0.45), -4px -4px 14px rgba(255,255,255,0.9)',
  border: '1.5px solid rgba(255,255,255,0.92)',
} as React.CSSProperties;

const WHAT_NEXT = [
  'We review your message and your quality challenge',
  'A brief discovery call is scheduled at your convenience',
  'You receive a clear recommendation — no obligation',
];

const ContactUs: React.FC = () => {
  const { openWhatsApp } = useWhatsApp();
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

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 text-sm"
    + " bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]"
    + " focus:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff]";

  return (
    <>
      <SEO pageKey="contact" extraSchemas={[getFounderPersonSchema(), getAboutPageSchema()]} />
      <div className="min-h-screen pb-20">

        {/* ── HERO ── */}
        <section className="pt-20 pb-14 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14">

              {/* Left: text */}
              <div className="flex-1 lg:max-w-[560px] mb-10 lg:mb-0">
                <motion.p
                  className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
                >
                  Get in touch
                </motion.p>
                <motion.h1
                  className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.08] mb-5"
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  Let's write the next<br />
                  <em style={{ color: '#d97706' }}>chapter together.</em>
                </motion.h1>
                <motion.p
                  className="text-lg text-slate-500 leading-relaxed"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.28 }}
                >
                  Whether you're curious about where to start, exploring a partnership, or ready to talk about something built specifically for your business — Preqal is here. <strong className="text-slate-700">Clinic on Quality™ — we care for businesses.</strong>
                </motion.p>
              </div>

              {/* Right: hero image — desktop only */}
              <motion.div
                className="hidden lg:block flex-shrink-0 w-[400px]"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="overflow-hidden rounded-3xl relative"
                  style={{
                    aspectRatio: '4 / 5',
                    boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
                  }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/contact-hero.png`}
                    alt="Preqal — ready to help your business"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center top' }}
                    width="400"
                    height="500"
                  />
                  {/* Amber + dark gradient wash */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.15) 0%, transparent 45%, rgba(15,23,42,0.28) 100%)' }}
                  />
                </div>
              </motion.div>

            </div>
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

                {/* ── Left panel: info ── */}
                <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col gap-8">

                  {/* Contact details */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Contact details</p>
                    <div className="flex flex-col gap-3">
                      {CONTACT_INFO.map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: '#e0e5ec', boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.45), inset -2px -2px 5px rgba(255,255,255,0.8)' }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">{item.label}</p>
                            <p className="text-sm text-slate-700 font-medium leading-snug">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What happens next */}
                  <div style={{ borderTop: '1px solid rgba(163,177,198,0.25)', paddingTop: '1.5rem' }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">What happens next</p>
                    <div className="flex flex-col gap-3">
                      {WHAT_NEXT.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '2px 2px 6px rgba(217,119,6,0.3)' }}
                          >
                            <span className="text-white text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alt CTA */}
                  <div style={{ borderTop: '1px solid rgba(163,177,198,0.25)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">Prefer to jump straight in?</p>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors"
                    >
                      Message Dr. Gravesande on WhatsApp <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Right panel: form ── */}
                <div className="lg:col-span-3 p-8 lg:p-10">
                  {status === 'success' ? (
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
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                      <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-xs">
                        Thank you for reaching out. We'll review your message and get back to you within 1 business day.
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="text-sm text-amber-600 font-semibold hover:text-amber-500 transition-colors"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">First Name *</label>
                          <input type="text" name="first_name" required className={inputClass} placeholder="John" value={formData.first_name} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Last Name *</label>
                          <input type="text" name="last_name" required className={inputClass} placeholder="Doe" value={formData.last_name} onChange={handleChange} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email *</label>
                        <input type="email" name="email" required className={inputClass} placeholder="name@company.com" value={formData.email} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Company *</label>
                        <input type="text" name="company" required className={inputClass} placeholder="Company Name" value={formData.company} onChange={handleChange} />
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
                          onChange={(phone, { country, dialCode }) => setFormData({ ...formData, phone, country_iso: country?.iso2?.toLowerCase() || 'gy', dial_code: dialCode || '+592' })}
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

                      {RECAPTCHA_SITE_KEY && (
                        <div className="flex justify-center pt-1">
                          <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setRecaptchaToken(token)} onExpired={() => setRecaptchaToken(null)} />
                        </div>
                      )}

                      {error && (
                        <div
                          className="px-4 py-3 rounded-xl text-red-600 text-sm"
                          style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)' }}
                        >
                          {error}
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={status === 'submitting'}
                        whileHover={{ scale: status === 'submitting' ? 1 : 1.02, y: status === 'submitting' ? 0 : -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '5px 5px 14px rgba(217,119,6,0.38), -2px -2px 8px rgba(255,255,255,0.6)' }}
                      >
                        {status === 'submitting'
                          ? <><Loader2 className="h-5 w-5 animate-spin" />Sending...</>
                          : <>Send Message <ArrowRight className="h-5 w-5" /></>
                        }
                      </motion.button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── ABOUT PREQAL — who you'll be talking to ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <ScrollReveal yFrom={14}>
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">About Preqal</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Who you'll be<br className="sm:hidden" />{' '}
                <span className="text-amber-600">talking to.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Founder card */}
            <div className="md:col-span-4">
              <ScrollReveal yFrom={20}>
                <div className="rounded-2xl p-8" style={glassCard}>
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden p-1"
                    style={{ boxShadow: 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -3px -3px 8px rgba(255,255,255,0.85), 0 0 0 3px rgba(245,158,11,0.2)' }}
                  >
                    <picture>
                      <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.avif 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.avif 256w`} sizes="128px" />
                      <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.webp 256w`} sizes="128px" />
                      <img src={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp`} alt="Preqal founder Dr. Gravesande" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" decoding="async" width="128" height="128" />
                    </picture>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-1 text-slate-900">Dr. Gravesande</h3>
                  <p className="text-amber-600 text-center text-xs font-bold mb-6 uppercase tracking-wider whitespace-nowrap">
                    Medical Leadership → Systems Engineer
                  </p>
                  <div style={{ borderTop: '1px solid rgba(163,177,198,0.25)' }} className="pt-6">
                    <CollapsibleSection title="Background & Experience" headingLevel="h3">
                      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p>Transitioning from a strong medical foundation into industrial quality and systems engineering, Dr. Gravesande applies a diagnostic, evidence-based mindset to operational excellence.</p>
                        <p>He currently leads the development of Integrated Management Systems (IMS) from the ground up for multiple firms, aligning operations with ISO 9001, ISO 14001, and ISO 45001.</p>
                        <p>He is also the architect of national-scale quality frameworks across agriculture, food production, and environmental systems — building institutional infrastructure that protects businesses, communities, ecosystems, and the long-term health of an entire nation.</p>
                      </div>
                    </CollapsibleSection>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Philosophy + Clinic on Quality */}
            <div className="md:col-span-8 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PHILOSOPHY.map((item, i) => (
                  <ScrollReveal key={item.title} delay={i * 80} yFrom={16}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '10px 12px 28px rgba(163,177,198,0.52), -5px -5px 18px rgba(255,255,255,0.95)' }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className="flex gap-4 p-5 rounded-2xl h-full"
                      style={glassCard}
                    >
                      <div
                        className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: '#e0e5ec', boxShadow: 'inset 3px 3px 7px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.85), 0 0 14px rgba(245,158,11,0.12)' }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Clinic on Quality — dark navy band */}
              <ScrollReveal yFrom={16}>
                <div
                  className="rounded-2xl overflow-hidden relative"
                  style={{ background: '#0f172a', boxShadow: '8px 10px 24px rgba(15,23,42,0.35), -4px -4px 14px rgba(255,255,255,0.7)' }}
                >
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 80px)',
                  }} />
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse at 10% 50%, rgba(217,119,6,0.12) 0%, transparent 55%)',
                  }} />
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(to bottom, #f59e0b, #d97706)' }} />
                  <div className="relative z-10 p-8">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">Our name explained</p>
                    <h3 className="text-xl font-bold text-white mb-5">Why "Clinic on Quality"?</h3>
                    <div className="space-y-4 text-white/65 leading-relaxed text-sm">
                      <p>Just as the best doctors listen before they prescribe, Preqal examines your business before recommending a single solution. Your operational health — your processes, your patterns, your vulnerabilities — is assessed with clinical precision before anything is built.</p>
                      <p>Most consultants hand you a template and walk away. You get a prescription written specifically for your business — targeted, restorative, and designed to make your organisation stronger from the inside out.</p>
                    </div>
                    <p className="font-bold italic text-amber-400 text-right mt-5 text-sm">
                      Because at Preqal, we don't just improve systems. We care for businesses.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default ContactUs;
