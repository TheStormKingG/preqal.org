import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ui/ScrollReveal';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import SlideDeck, { useBelowWidth, useDeck, type DeckSlide } from '../components/SlideDeck';
import { getFounderPersonSchema, getAboutPageSchema } from '../seo/pageSchemas';
import FounderSocials from '../components/FounderSocials';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';




/* ─── Page blocks ─── */

const Hero: React.FC = () => (
  <>
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

        {/* Right: hero image — a banner on phones, the tall frame from lg up */}
        <motion.div
          className="flex-shrink-0 w-full lg:w-[400px] mt-5 lg:mt-0"
          initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="contact-hero-media overflow-hidden rounded-3xl relative"
            style={{
              boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/contact-hero.png`}
              alt="Preqal — ready to help your business"
              className="w-full h-full object-cover"
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
  </>
);

const MainPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
    {children}
  </div>
);

const AboutFounder: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <>
  {/* ── ABOUT PREQAL — who you'll be talking to ── */}
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'mt-0' : 'mt-20'}`}>
    {/* Founder — portrait and a short bio, nothing else */}
    <div className={`grid grid-cols-1 md:grid-cols-12 md:gap-12 md:items-center ${compact ? 'gap-4' : 'gap-5'}`}>

      <div className="md:col-span-5">
        {/* The heading introduces the man, so it sits with his portrait rather
            than centred over the pair of columns. */}
        <ScrollReveal yFrom={14}>
          <div className={`text-center ${compact ? 'mb-3' : 'mb-5'}`}>
            <p className={`text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 ${compact ? 'hidden lg:block' : ''}`}>About Preqal</p>
            {/* The deck slide carries the socials under the bio as well, so its
                heading gives up a step to make room. */}
            <h2 className={`md:text-4xl font-bold text-slate-900 leading-tight ${compact ? 'text-2xl' : 'text-3xl'}`}>
              Who you'll be<br className="sm:hidden" />{' '}
              <span className="text-amber-600">talking to.</span>
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal yFrom={20}>
          <div
            className={`founder-portrait relative overflow-hidden rounded-3xl mx-auto max-w-[380px] md:max-w-none ${
              compact ? 'founder-portrait-compact' : ''
            }`}
            style={{
              boxShadow: '12px 14px 32px rgba(163,177,198,0.55), -6px -6px 20px rgba(255,255,255,0.9)',
            }}
          >
            <picture>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}images/dr-gravesande-560.avif 560w, ${import.meta.env.BASE_URL}images/dr-gravesande-1120.avif 1120w`}
                sizes="(max-width: 768px) 380px, 460px"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}images/dr-gravesande-560.webp 560w, ${import.meta.env.BASE_URL}images/dr-gravesande-1120.webp 1120w`}
                sizes="(max-width: 768px) 380px, 460px"
              />
              <img
                src={`${import.meta.env.BASE_URL}images/dr-gravesande-560.webp`}
                alt="Dr. Stefan Gravesande, founder of Preqal"
                className="absolute inset-0 w-full h-full object-cover"
                width="560"
                height="700"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(160deg, rgba(245,158,11,0.06) 0%, transparent 55%, rgba(15,23,42,0.10) 100%)' }}
            />
          </div>
        </ScrollReveal>
      </div>

      <div className="md:col-span-7">
        <ScrollReveal yFrom={20} delay={80}>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1">Dr. Stefan Gravesande</h3>
          <p className={`text-amber-600 text-xs font-bold sm:mb-6 uppercase tracking-wider ${compact ? 'mb-2' : 'mb-3'}`}>
            Medical Leadership &rarr; Systems Engineer
          </p>
          {/* The deck slide has to hold the bio and the socials on one screen,
              so the lines close up a little there. */}
          <p className={`text-sm sm:text-base text-slate-600 sm:leading-relaxed ${compact ? 'leading-snug' : 'leading-normal'}`}>
            Dr. Stefan Gravesande trained in medicine before turning that diagnostic discipline on businesses. Where most consultants hand over a template, he examines an operation first: its processes, its patterns, its vulnerabilities. Then he prescribes. He builds Integrated Management Systems from the ground up for firms across Guyana, aligning them with ISO 9001, ISO 14001, and ISO 45001, and has architected national-scale quality frameworks spanning agriculture, food production, and environmental systems. His work is evidence-led and risk-based: your time goes where it matters, and the standards you build protect your people, your community, and the world your business operates in.
          </p>
          <FounderSocials compact={compact} className={compact ? 'mt-1 lg:mt-6' : 'mt-6'} />
        </ScrollReveal>
      </div>

    </div>

  </div>
  </>
);

/* Left panel: contact details, what happens next, and the WhatsApp alternative */
/* The reCAPTCHA is a cross-origin iframe: a swipe that starts on it is
   swallowed before this page ever sees it, so the deck cannot read it. That
   band sits exactly where a thumb rests at the foot of the form, which left
   readers stranded on this slide. This is the guaranteed way onward. */
const ContinueCue: React.FC = () => {
  const deck = useDeck();
  if (!deck || deck.index >= deck.count - 1) return null;
  return (
    <div className="mt-5 flex justify-center lg:hidden">
      <button
        type="button"
        onClick={() => deck.goTo(deck.index + 1)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-amber-600 font-bold text-sm"
        style={{ background: '#e0e5ec', boxShadow: '4px 4px 10px #a3b1c6, -4px -4px 10px #ffffff', border: '1.5px solid rgba(245,158,11,0.35)' }}
      >
        Who you&apos;ll be talking to. <span aria-hidden="true">&darr;</span>
      </button>
    </div>
  );
};

/* One screenful of the contact form on the phone deck: a card sized to exactly
   one slide, so the form reads as two full views instead of a free scroll and
   neither view cuts a field. Off the deck it is a plain group and the page's
   own card supplies the frame. */
const FormHalf: React.FC<{ halved: boolean; last?: boolean; children: React.ReactNode }> = ({
  halved,
  last = false,
  children,
}) => {
  if (!halved) return <div className="space-y-4">{children}</div>;
  return (
    <div
      /* Pinned to exactly one slide, so the form is a whole number of views on
         every phone; a card too tall for a short screen scales instead of
         pushing the count to three. */
      className="flex items-center px-4 sm:px-6 py-4"
      style={{ height: 'var(--deck-slide)' }}
      data-deck-break={last ? '' : undefined}
    >
      <div className="w-full max-w-5xl mx-auto deck-fit">
        <MainPanel>
          <div className="p-6 sm:p-8 space-y-4">{children}</div>
        </MainPanel>
        {last ? <ContinueCue /> : null}
      </div>
    </div>
  );
};


const ContactUs: React.FC = () => {
  /* Only the form cares about width: below lg it is taller than the screen and
     reads in two halves, from lg up those halves are two columns. */
  const phone = useBelowWidth();
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

  /* The form needs this component's state, so it stays here and is handed
     to whichever layout is rendering. */
  /* `halved` lays the form out as two exact screenfuls for the phone deck. */
  const buildForm = (halved: boolean) => (
    <div className={halved ? '' : 'lg:col-span-3 p-8 lg:p-10'}>
    {status === 'success' ? (
      <FormHalf halved={halved}>
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
      </FormHalf>
    ) : (
      <form
        onSubmit={handleSubmit}
        className={halved ? '' : 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 items-start'}
      >
        {/* On a phone the deck reads this form as two views. Each half is sized
            to exactly one slide so neither one cuts a field, and the break tells
            the deck where the second view starts. */}
        <FormHalf halved={halved}>
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
        </FormHalf>

        <FormHalf halved={halved} last>
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
        </FormHalf>
      </form>
    )}
  </div>
  );
  const slides: DeckSlide[] = [
      {
        label: 'Get in touch',
        node: (
          <div className="h-full flex items-center px-4 sm:px-6">
            <div className="w-full deck-fit"><Hero /></div>
          </div>
        ),
      },
      {
        /* A phone cannot hold the form on one screen, so there it reads as two
           exact halves that scroll inside the slide. From lg up those same two
           halves stand side by side and the whole form is one slide. */
        label: 'Send a message',
        scrollable: phone,
        node: phone ? (
          <div className="min-h-full">{buildForm(true)}</div>
        ) : (
          <div className="h-full flex items-center px-4 sm:px-6">
            <div className="w-full max-w-5xl mx-auto deck-fit">
              <MainPanel>{buildForm(false)}</MainPanel>
            </div>
          </div>
        ),
      },
      {
        label: "Who you'll be talking to",
        node: (
          <div className="h-full flex items-center px-4 sm:px-6">
            <div className="w-full deck-fit"><AboutFounder compact /></div>
          </div>
        ),
      },
      {
        label: 'Contact & info',
        node: (
          <div className="h-full flex items-center overflow-hidden">
            <div className="w-full deck-fit"><Footer compact /></div>
          </div>
        ),
      },
    ];
  return (
    <>
      <SEO pageKey="contact" extraSchemas={[getFounderPersonSchema(), getAboutPageSchema()]} />
      <SlideDeck slides={slides} />
    </>
  );
};

export default ContactUs;
