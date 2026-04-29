import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Users, Layers, Settings, CheckCircle2, X, ChevronRight,
  Building2, Zap, TrendingUp, Award, BarChart3, Loader2, Info, Shield,
} from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierData {
  number: number;
  name: string;
  staffLabel: string;
  capacity: number;
  processes: number;
  monthly: string;
  total: string;
  Icon: React.ElementType;
}

interface FormState {
  companyName: string;
  contactPersonName: string;
  email: string;
  staffSize: string;
  numberOfServices: string;
  avgProcessesPerService: string;
}

interface FormErrors {
  companyName?: string;
  contactPersonName?: string;
  email?: string;
  staffSize?: string;
  numberOfServices?: string;
  avgProcessesPerService?: string;
}

interface ClassificationResult {
  baseTier: number;
  complexityScore: number;
  recommendedTier: number;
}

// ─── Tier Data ────────────────────────────────────────────────────────────────

const TIERS: TierData[] = [
  { number: 1, name: 'Solo Founder',     staffLabel: '1 staff member',       capacity: 1, processes: 5,  monthly: 'GYD 50,000',  total: 'GYD 450,000',   Icon: Users      },
  { number: 2, name: 'Micro Business',   staffLabel: '2–5 staff members',    capacity: 2, processes: 10, monthly: 'GYD 70,000',  total: 'GYD 630,000',   Icon: Building2  },
  { number: 3, name: 'Small Business',   staffLabel: '6–15 staff members',   capacity: 3, processes: 15, monthly: 'GYD 90,000',  total: 'GYD 810,000',   Icon: Zap        },
  { number: 4, name: 'Growing SME',      staffLabel: '16–40 staff members',  capacity: 4, processes: 20, monthly: 'GYD 120,000', total: 'GYD 1,080,000', Icon: TrendingUp },
  { number: 5, name: 'Medium Company',   staffLabel: '41–100 staff members', capacity: 5, processes: 25, monthly: 'GYD 180,000', total: 'GYD 1,620,000', Icon: Award      },
  { number: 6, name: 'Large Enterprise', staffLabel: '100+ staff members',   capacity: 6, processes: 30, monthly: 'GYD 233,333', total: 'GYD 2,099,997', Icon: BarChart3  },
];

// ─── Classification Engine ────────────────────────────────────────────────────

function getBaseTier(staffSize: string): number {
  const map: Record<string, number> = {
    '1': 1, '2-5': 2, '6-15': 3, '16-40': 4, '41-100': 5, '100+': 6,
  };
  return map[staffSize] ?? 1;
}

function getProcessMultiplier(avg: string): number {
  const map: Record<string, number> = {
    '1-3': 1.0, '4-6': 1.5, '7-10': 2.0, '10+': 2.5,
  };
  return map[avg] ?? 1.0;
}

function classify(
  staffSize: string,
  numServices: number,
  avgProcesses: string,
): ClassificationResult {
  const baseTier        = getBaseTier(staffSize);
  const multiplier      = getProcessMultiplier(avgProcesses);
  const complexityScore = numServices * multiplier;
  const tierCapacity    = TIERS[baseTier - 1].capacity;
  const recommendedTier = complexityScore > tierCapacity * 1.2
    ? Math.min(baseTier + 1, 6)
    : baseTier;
  return {
    baseTier,
    complexityScore: Math.round(complexityScore * 100) / 100,
    recommendedTier,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(data: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!data.companyName.trim())
    errors.companyName = 'Company name is required.';
  if (!data.contactPersonName.trim())
    errors.contactPersonName = 'Contact name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (!data.staffSize)
    errors.staffSize = 'Please select a staff size.';
  const n = parseInt(data.numberOfServices, 10);
  if (!data.numberOfServices || isNaN(n) || n < 1)
    errors.numberOfServices = 'Please enter at least 1 service.';
  if (!data.avgProcessesPerService)
    errors.avgProcessesPerService = 'Please select a process range.';
  return errors;
}

// ─── Shared input class (matches ContactUs.tsx style) ─────────────────────────

const INPUT_CLS =
  'w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 neu-pressed-sm focus:neu-pressed bg-[#e0e5ec]';
const INPUT_ERR_CLS =
  'w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 bg-red-50 border border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

// ─── Component ────────────────────────────────────────────────────────────────

const QuoteClassifier: React.FC = () => {
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [formData, setFormData]           = useState<FormState>({
    companyName: '', contactPersonName: '', email: '',
    staffSize: '', numberOfServices: '', avgProcessesPerService: '',
  });
  const [errors, setErrors]               = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus]   = useState<'idle' | 'submitting' | 'success'>('idle');
  const [result, setResult]               = useState<ClassificationResult | null>(null);
  const [submitError, setSubmitError]     = useState('');

  const modalRef    = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // ── Modal open / close ──────────────────────────────────────────────────────

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setSubmitStatus('idle');
    setResult(null);
    setErrors({});
    setSubmitError('');
    setFormData({
      companyName: '', contactPersonName: '', email: '',
      staffSize: '', numberOfServices: '', avgProcessesPerService: '',
    });
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Lock body scroll while modal is open; auto-focus close button
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // Escape key + focus trap
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isModalOpen, closeModal]);

  // ── Form change handler ─────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first invalid field for accessibility
      const firstInvalid = modalRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError('');

    const numServices    = parseInt(formData.numberOfServices, 10);
    const classification = classify(formData.staffSize, numServices, formData.avgProcessesPerService);
    const tier           = TIERS[classification.recommendedTier - 1];

    const submission = {
      companyName:            formData.companyName.trim(),
      contactPersonName:      formData.contactPersonName.trim(),
      email:                  formData.email.trim().toLowerCase(),
      staffSize:              formData.staffSize,
      numberOfServices:       numServices,
      avgProcessesPerService: formData.avgProcessesPerService,
      baseTier:               classification.baseTier,
      complexityScore:        classification.complexityScore,
      recommendedTier:        classification.recommendedTier,
      recommendedTierName:    tier.name,
      timestamp:              new Date().toISOString(),
    };

    // Log for development / debugging
    console.log('[Preqal Quote Classifier] Submission:', submission);

    try {
      // ─── Save to Supabase ─────────────────────────────────────────────────
      const { error: dbError } = await supabase
        .from('quote_submissions')
        .insert([{
          company_name:     submission.companyName,
          contact_person:   submission.contactPersonName,
          email:            submission.email,
          staff_size:       submission.staffSize,
          num_services:     submission.numberOfServices,
          avg_processes:    submission.avgProcessesPerService,
          base_tier:        submission.baseTier,
          complexity_score: submission.complexityScore,
          recommended_tier: submission.recommendedTier,
        }]);
      if (dbError) console.error('[QuoteClassifier] Supabase insert error:', dbError);
      // ─────────────────────────────────────────────────────────────────────

      // ─── TODO: Email notification (EmailJS) ───────────────────────────────
      // import emailjs from '@emailjs/browser';
      // Create a template named 'template_quote_classifier' in your EmailJS
      // dashboard, then send:
      //
      // await emailjs.send(
      //   import.meta.env.VITE_EMAILJS_SERVICE_ID,
      //   'template_quote_classifier',
      //   {
      //     to_email:         'quotes@preqal.org',
      //     company_name:     submission.companyName,
      //     contact_name:     submission.contactPersonName,
      //     reply_to:         submission.email,
      //     staff_size:       submission.staffSize,
      //     num_services:     submission.numberOfServices,
      //     avg_processes:    submission.avgProcessesPerService,
      //     recommended_tier: `Tier ${submission.recommendedTier} — ${submission.recommendedTierName}`,
      //     monthly_price:    tier.monthly,
      //     total_price:      tier.total,
      //     submitted_at:     submission.timestamp,
      //   },
      //   import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      // );
      // ─────────────────────────────────────────────────────────────────────

      // ─── TODO: CRM / Contact database ────────────────────────────────────
      // Push to HubSpot, Pipedrive, or your CRM of choice:
      //
      // await fetch('/api/crm-contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email:   submission.email,
      //     name:    submission.contactPersonName,
      //     company: submission.companyName,
      //     tier:    submission.recommendedTier,
      //   }),
      // });
      // ─────────────────────────────────────────────────────────────────────


      setResult(classification);
      setSubmitStatus('success');
    } catch (err) {
      console.error('[QuoteClassifier] Submission error:', err);
      setSubmitError('Something went wrong. Please try again or contact us directly.');
      setSubmitStatus('idle');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <SEO pageKey="quoteClassifier" />

      <div className="min-h-screen pb-20">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <p className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-3">
              ISO Management System Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
              Find Your ISO Management
              <br className="hidden sm:block" />
              System{' '}
              <span className="text-amber-500">Tier</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-10">
              Answer a few simple questions and we'll classify your business based on
              staff size, services, and process complexity — instantly.
            </p>

            <button
              onClick={openModal}
              aria-haspopup="dialog"
              aria-controls="quote-classifier-modal"
              type="button"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-all neu-raised-sm"
            >
              Start Classification
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-6">
              {(
                [
                  { Icon: Shield,        text: 'Fair, transparent pricing'           },
                  { Icon: CheckCircle2,  text: 'No commitment required'              },
                  { Icon: Users,         text: 'Reviewed by a Preqal specialist'     },
                ] as const
              ).map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Explanation ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-100">
          <div className="neu-card rounded-2xl overflow-hidden">
            <div className="relative p-8 md:p-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

              <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-3">
                How It Works
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Our Fair Classification Model
              </h2>
              <p className="text-slate-500 max-w-2xl mb-8">
                Preqal prices based on what your business actually needs — not a one-size-fits-all
                rate. We look at three key inputs to determine your tier.
              </p>

              {/* 3 input pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {(
                  [
                    {
                      Icon: Users,
                      title: 'Staff Size',
                      desc:  'The number of people in your organisation forms the foundation of your tier. Larger teams have more complex management needs.',
                    },
                    {
                      Icon: Layers,
                      title: 'Number of Services',
                      desc:  'Each service your company provides requires its own documented management system, policies, and quality controls.',
                    },
                    {
                      Icon: Settings,
                      title: 'Processes per Service',
                      desc:  'Each service is broken into processes. We use approximately 5 processes per service as a baseline — more processes means a deeper documentation scope.',
                    },
                  ] as const
                ).map(({ Icon, title, desc }) => (
                  <div key={title} className="neu-flat rounded-xl p-6">
                    <div className="w-11 h-11 rounded-xl neu-pressed-sm flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Pricing principles */}
              <div className="neu-flat rounded-xl p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">Our Pricing Principles</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    '1 service is approximately 5 processes — we keep this straightforward.',
                    'Smaller companies should never pay more than larger companies for equivalent scope.',
                    'Pricing reflects company size first, with a complexity adjustment for scope.',
                    'All quotes are reviewed and confirmed by a Preqal specialist — this is an estimate only.',
                    'All programmes run for 9 months — enough time to implement and achieve certification.',
                    'High process complexity may upgrade your tier to ensure the right level of support.',
                  ].map(text => (
                    <li key={text} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tier Cards ───────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="mb-8 animate-fade-in-up delay-200">
            <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-2">
              Pricing Tiers
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Six Tiers, One Fair System</h2>
            <p className="text-slate-500 mt-1">
              Every tier includes a full 9-month ISO management system programme. All prices in GYD.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up delay-300">
            {TIERS.map(tier => {
              const { Icon } = tier;
              const isFeatured = tier.number === 3;
              return (
                <div
                  key={tier.number}
                  className={`neu-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    isFeatured ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  {/* Top accent bar */}
                  <div
                    className={`w-full h-1 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-slate-200 to-slate-300'
                    }`}
                  />

                  <div className="p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isFeatured
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            T{tier.number}
                          </span>
                          {isFeatured && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                        <p className="text-sm text-slate-500">{tier.staffLabel}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl neu-pressed-sm flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-0 mb-5">
                      {[
                        { label: 'Included services',   value: `${tier.capacity} service${tier.capacity > 1 ? 's' : ''}` },
                        { label: 'Processes covered',   value: `~${tier.processes} processes` },
                        { label: 'Programme duration',  value: '9 months' },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0"
                        >
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price block */}
                    <div className="neu-flat rounded-xl p-4">
                      <p className="text-2xl font-bold text-slate-900">{tier.monthly}</p>
                      <p className="text-xs text-slate-500 mt-0.5">per month</p>
                      <p className="text-sm text-green-600 font-semibold mt-2 pt-2 border-t border-slate-200">
                        Total: {tier.total}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-fade-in-up delay-100">
          <div className="neu-card rounded-2xl overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to find your tier?</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                It takes less than two minutes. You'll get an instant classification with no commitment required.
              </p>
              <button
                onClick={openModal}
                aria-haspopup="dialog"
                aria-controls="quote-classifier-modal"
                type="button"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-all neu-raised-sm"
              >
                Start Classification
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      </div>{/* /min-h-screen */}

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 glass-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          role="presentation"
        >
          <div
            ref={modalRef}
            id="quote-classifier-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qc-modal-title"
            aria-describedby="qc-modal-subtitle"
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl neu-card animate-fade-in-up"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl z-10" />

            {/* Close button */}
            <button
              ref={closeBtnRef}
              onClick={closeModal}
              type="button"
              aria-label="Close quote modal"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl neu-raised-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:neu-pressed-sm transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 pt-10">

              {/* ── Form view ─────────────────────────────────────────────── */}
              {submitStatus !== 'success' && (
                <>
                  <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-2">
                    ISO System Classification
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1" id="qc-modal-title">
                    Request Your ISO System Quote
                  </h2>
                  <p className="text-slate-500 text-sm mb-8" id="qc-modal-subtitle">
                    Fill in the details below and we'll calculate your recommended tier instantly.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Company Information
                    </p>

                    {/* Company Name */}
                    <div>
                      <label htmlFor="qc-companyName" className="block text-sm font-medium text-slate-600 mb-1">
                        Company Name <span className="text-amber-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="qc-companyName"
                        name="companyName"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.companyName || undefined}
                        aria-describedby={errors.companyName ? 'qc-companyName-err' : undefined}
                        placeholder="e.g. Greenfield Solutions Ltd."
                        value={formData.companyName}
                        onChange={handleChange}
                        className={errors.companyName ? INPUT_ERR_CLS : INPUT_CLS}
                      />
                      {errors.companyName && (
                        <p id="qc-companyName-err" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contact Person */}
                      <div>
                        <label htmlFor="qc-contactPersonName" className="block text-sm font-medium text-slate-600 mb-1">
                          Contact Person <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="qc-contactPersonName"
                          name="contactPersonName"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.contactPersonName || undefined}
                          aria-describedby={errors.contactPersonName ? 'qc-contact-err' : undefined}
                          placeholder="Full name"
                          value={formData.contactPersonName}
                          onChange={handleChange}
                          className={errors.contactPersonName ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.contactPersonName && (
                          <p id="qc-contact-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.contactPersonName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="qc-email" className="block text-sm font-medium text-slate-600 mb-1">
                          Email Address <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="qc-email"
                          name="email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email || undefined}
                          aria-describedby={errors.email ? 'qc-email-err' : undefined}
                          placeholder="you@company.com"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.email && (
                          <p id="qc-email-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-slate-200 my-1" />
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Size &amp; Complexity
                    </p>

                    {/* Staff Size */}
                    <div>
                      <label htmlFor="qc-staffSize" className="block text-sm font-medium text-slate-600 mb-1">
                        Staff Size <span className="text-amber-500" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="qc-staffSize"
                        name="staffSize"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.staffSize || undefined}
                        aria-describedby={errors.staffSize ? 'qc-staff-err' : undefined}
                        value={formData.staffSize}
                        onChange={handleChange}
                        className={errors.staffSize ? INPUT_ERR_CLS : INPUT_CLS}
                      >
                        <option value="">Select your team size…</option>
                        <option value="1">1 — Solo Founder</option>
                        <option value="2-5">2–5 — Micro Business</option>
                        <option value="6-15">6–15 — Small Business</option>
                        <option value="16-40">16–40 — Growing SME</option>
                        <option value="41-100">41–100 — Medium Company</option>
                        <option value="100+">100+ — Large Enterprise</option>
                      </select>
                      {errors.staffSize && (
                        <p id="qc-staff-err" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.staffSize}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Number of Services */}
                      <div>
                        <label htmlFor="qc-numberOfServices" className="block text-sm font-medium text-slate-600 mb-1">
                          Number of Services <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="qc-numberOfServices"
                          name="numberOfServices"
                          type="number"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.numberOfServices || undefined}
                          aria-describedby={errors.numberOfServices ? 'qc-svc-err' : 'qc-svc-hint'}
                          placeholder="e.g. 3"
                          min={1}
                          max={50}
                          value={formData.numberOfServices}
                          onChange={handleChange}
                          className={errors.numberOfServices ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.numberOfServices
                          ? <p id="qc-svc-err" role="alert" className="text-xs text-red-600 mt-1">{errors.numberOfServices}</p>
                          : <p id="qc-svc-hint" className="text-xs text-slate-400 mt-1">Minimum 1 service</p>
                        }
                      </div>

                      {/* Avg Processes per Service */}
                      <div>
                        <label htmlFor="qc-avgProcessesPerService" className="block text-sm font-medium text-slate-600 mb-1">
                          Avg. Processes / Service <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="qc-avgProcessesPerService"
                          name="avgProcessesPerService"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.avgProcessesPerService || undefined}
                          aria-describedby={errors.avgProcessesPerService ? 'qc-proc-err' : undefined}
                          value={formData.avgProcessesPerService}
                          onChange={handleChange}
                          className={errors.avgProcessesPerService ? INPUT_ERR_CLS : INPUT_CLS}
                        >
                          <option value="">Select a range…</option>
                          <option value="1-3">1–3 processes (low)</option>
                          <option value="4-6">4–6 processes (moderate)</option>
                          <option value="7-10">7–10 processes (high)</option>
                          <option value="10+">10+ processes (very high)</option>
                        </select>
                        {errors.avgProcessesPerService && (
                          <p id="qc-proc-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.avgProcessesPerService}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit-level error */}
                    {submitError && (
                      <div className="p-3 neu-pressed rounded-xl text-red-600 text-sm" role="alert">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitStatus === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all neu-raised-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitStatus === 'submitting' ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Calculating…</>
                      ) : (
                        <><CheckCircle2 className="h-5 w-5" /> Request Quote</>
                      )}
                    </button>

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      Your information is kept confidential and only used to prepare your quote.
                      A Preqal specialist will be in touch within 1–2 business days.
                    </p>
                  </form>
                </>
              )}

              {/* ── Result view ───────────────────────────────────────────── */}
              {submitStatus === 'success' && result && (() => {
                const tier = TIERS[result.recommendedTier - 1];
                return (
                  <div className="animate-fade-in-up" aria-live="polite" aria-atomic="true">
                    {/* Success icon */}
                    <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>

                    {/* Tier result card */}
                    <div className="neu-flat rounded-xl p-6 text-center mb-5">
                      <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 mb-3">
                        Your Recommended Classification
                      </span>
                      <p className="text-3xl font-bold text-slate-900 mb-1">
                        Tier {result.recommendedTier} — {tier.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tier.staffLabel}&nbsp;·&nbsp;
                        {tier.capacity} included service{tier.capacity > 1 ? 's' : ''}&nbsp;·&nbsp;
                        ~{tier.processes} processes
                      </p>
                      {result.recommendedTier !== result.baseTier && (
                        <p className="mt-2 text-xs text-amber-600 font-semibold">
                          ↑ Upgraded from Tier {result.baseTier} due to operational complexity
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="neu-flat rounded-xl p-4 text-center">
                        <p className="text-xl font-bold text-slate-900">{tier.monthly}</p>
                        <p className="text-xs text-slate-500 mt-0.5">per month (est.)</p>
                      </div>
                      <div className="neu-flat rounded-xl p-4 text-center">
                        <p className="text-xl font-bold text-green-600">{tier.total}</p>
                        <p className="text-xs text-slate-500 mt-0.5">total over 9 months (est.)</p>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                      <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 leading-relaxed">
                        <strong>This is an estimate only.</strong> A Preqal representative will review
                        your submission and confirm your official quote. You'll hear from us within
                        1–2 business days.
                      </p>
                    </div>

                    <button
                      onClick={closeModal}
                      type="button"
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-slate-700 neu-raised-sm hover:neu-pressed-sm transition-all"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                );
              })()}

            </div>{/* /p-8 */}
          </div>{/* /modal */}
        </div>
      )}
    </>
  );
};

export default QuoteClassifier;
