import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import emailjs from '@emailjs/browser';
import {
  Users, Layers, Settings, CheckCircle2, X, ChevronRight,
  Building2, Zap, TrendingUp, Award, BarChart3, Loader2,
  Target, Lightbulb, ArrowUpCircle,
} from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierData {
  number: number;
  name: string;
  staffLabel: string;
  description: string;
  complexity: string;
  complexityColor: string;
  // Internal classification fields — not displayed to users
  capacity: number;
  processes: number;
  Icon: React.ElementType;
}

interface FormState {
  companyName: string;
  contactPersonName: string;
  email: string;
  staffSize: string;
  numberOfServices: string;
  avgProcessesPerService: string;
  businessDescription: string; // optional
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

// ─── Tier Data (no pricing exposed) ──────────────────────────────────────────

const TIERS: TierData[] = [
  {
    number: 1,
    name: 'Solo Founder',
    staffLabel: '1 person',
    description: 'Best suited for one-person businesses beginning to structure their operations and build a solid management foundation.',
    complexity: 'Foundational',
    complexityColor: 'bg-slate-100 text-slate-600',
    capacity: 1,
    processes: 5,
    Icon: Users,
  },
  {
    number: 2,
    name: 'Micro Business',
    staffLabel: '2–5 people',
    description: 'For very small teams needing simple, practical systems that create clarity, reduce errors, and support early growth.',
    complexity: 'Basic',
    complexityColor: 'bg-blue-50 text-blue-600',
    capacity: 2,
    processes: 10,
    Icon: Building2,
  },
  {
    number: 3,
    name: 'Small Business',
    staffLabel: '6–15 people',
    description: 'For growing teams that need clearer roles, documented processes, and management systems that support consistent delivery.',
    complexity: 'Moderate',
    complexityColor: 'bg-amber-50 text-amber-700',
    capacity: 3,
    processes: 15,
    Icon: Zap,
  },
  {
    number: 4,
    name: 'Growing SME',
    staffLabel: '16–40 people',
    description: 'For businesses with multiple services, departments, or process flows that need structured integration and stronger oversight.',
    complexity: 'Intermediate',
    complexityColor: 'bg-orange-50 text-orange-700',
    capacity: 4,
    processes: 20,
    Icon: TrendingUp,
  },
  {
    number: 5,
    name: 'Medium Company',
    staffLabel: '41–100 people',
    description: 'For established organisations needing stronger management systems, cross-functional alignment, and full implementation support.',
    complexity: 'Advanced',
    complexityColor: 'bg-purple-50 text-purple-700',
    capacity: 5,
    processes: 25,
    Icon: Award,
  },
  {
    number: 6,
    name: 'Large / Complex Organization',
    staffLabel: '100+ people',
    description: 'For organisations with high operational complexity, multiple functions, or advanced system integration and governance needs.',
    complexity: 'Enterprise',
    complexityColor: 'bg-rose-50 text-rose-700',
    capacity: 6,
    processes: 30,
    Icon: BarChart3,
  },
];

// ─── Service Step Selector constants ────────────────────────────────────────

const STEP_NAMES: string[] = [
  'Compliance Baseline Scan',
  'IMS Architecture & Implementation Planning',
  'Document Development',
  'Training Programme Delivery',
  'Implementation & Observation Support',
  'Internal Audit Execution',
  'Management Review Facilitation',
  'Pre-Certification Readiness Audit',
];

// Monthly fee (GYD) for the 9-month programme, indexed by tier number 1–6
const STEP_RATES: Record<number, number> = {
  1: 50000,
  2: 70000,
  3: 90000,
  4: 120000,
  5: 180000,
  6: 233333,
};

// ─── Internal Classification Engine (not exposed in UI) ───────────────────────

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
    errors.staffSize = 'Please select your team size.';
  const n = parseInt(data.numberOfServices, 10);
  if (!data.numberOfServices || isNaN(n) || n < 1)
    errors.numberOfServices = 'Please enter at least 1 service.';
  if (!data.avgProcessesPerService)
    errors.avgProcessesPerService = 'Please select a process range.';
  return errors;
}

// ─── Shared input classes (match site style) ──────────────────────────────────

const INPUT_CLS =
  'w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 neu-pressed-sm focus:neu-pressed bg-[#e0e5ec]';
const INPUT_ERR_CLS =
  'w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 bg-red-50 border border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

// ─── Component ────────────────────────────────────────────────────────────────

const BusinessGrowthAssessment: React.FC = () => {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [formData, setFormData]         = useState<FormState>({
    companyName: '', contactPersonName: '', email: '',
    staffSize: '', numberOfServices: '', avgProcessesPerService: '',
    businessDescription: '',
  });
  const [errors, setErrors]             = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError]   = useState('');
  const [selectedSteps, setSelectedSteps] = useState<number | null>(null);

  const modalRef    = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // ── Modal open / close ──────────────────────────────────────────────────────

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setSubmitStatus('idle');
    setErrors({});
    setSubmitError('');
    setFormData({
      companyName: '', contactPersonName: '', email: '',
      staffSize: '', numberOfServices: '', avgProcessesPerService: '',
      businessDescription: '',
    });
    setSelectedSteps(null);
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Lock body scroll; auto-focus close button on open
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'staffSize') setSelectedSteps(null);
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
      const firstInvalid = modalRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError('');

    const numServices    = parseInt(formData.numberOfServices, 10);
    // Classification runs internally — result is logged and stored, not displayed to visitor
    const classification = classify(formData.staffSize, numServices, formData.avgProcessesPerService);
    const tier           = TIERS[classification.recommendedTier - 1];

    const submission = {
      companyName:            formData.companyName.trim(),
      contactPersonName:      formData.contactPersonName.trim(),
      email:                  formData.email.trim().toLowerCase(),
      staffSize:              formData.staffSize,
      numberOfServices:       numServices,
      avgProcessesPerService: formData.avgProcessesPerService,
      businessDescription:    formData.businessDescription.trim() || null,
      baseTier:               classification.baseTier,
      complexityScore:        classification.complexityScore,
      recommendedTier:        classification.recommendedTier,
      recommendedTierName:    tier.name,
      timestamp:              new Date().toISOString(),
    };

    console.warn('[Preqal Business Growth Assessment] Submission:', submission);

    // ── Save to Supabase qualified_leads ──────────────────────────────────
    const { error: dbError } = await supabase.from('qualified_leads').insert([{
      company_name:         submission.companyName,
      contact_person:       submission.contactPersonName,
      email:                submission.email,
      staff_size:           submission.staffSize,
      num_services:         submission.numberOfServices,
      avg_processes:        submission.avgProcessesPerService,
      base_tier:            submission.baseTier,
      complexity_score:     submission.complexityScore,
      recommended_tier:     submission.recommendedTier,
      business_description: submission.businessDescription,
      selected_steps:       selectedSteps,
      status:               'new',
    }]);
    if (dbError) console.error('[BusinessGrowthAssessment] DB error:', dbError.message);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
        import.meta.env.VITE_EMAILJS_BGA_TEMPLATE_ID || 'template_a4rhrbq',
        {
          subject:        'Business Growth Assessment',
          service_name:   'Business Growth Assessment',
          name:           submission.contactPersonName,
          email:          submission.email,
          phone:          'Not provided',
          company:        submission.companyName,
          business_type:  'Assessment submission',
          message:        submission.businessDescription ?? 'Not provided',
          session_style:  'Virtual',
          submitted_at:   new Date(submission.timestamp).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC' }),
          formatted_data: [
            'Business Growth Assessment',
            '',
            `Company:               ${submission.companyName}`,
            `Contact:               ${submission.contactPersonName}`,
            `Email:                 ${submission.email}`,
            '',
            '── Organisation Profile ──',
            `Staff Size:            ${submission.staffSize}`,
            `Number of Services:    ${submission.numberOfServices}`,
            `Avg Processes/Service: ${submission.avgProcessesPerService}`,
            `Business Description:  ${submission.businessDescription ?? 'Not provided'}`,
            '',
            '── Classification Result ──',
            `Base Tier:             ${submission.baseTier}`,
            `Complexity Score:      ${submission.complexityScore}`,
            `Recommended Tier:      Tier ${submission.recommendedTier} — ${submission.recommendedTierName}`,
            `Selected Steps:        ${selectedSteps ? `Steps 1–${selectedSteps} (${STEP_NAMES[selectedSteps - 1]})` : 'Not selected'}`,
            '',
            `Submitted:             ${new Date(submission.timestamp).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`,
          ].join('\n'),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq',
      );
      setSubmitStatus('success');
    } catch (err) {
      console.error('[BusinessGrowthAssessment] Submission error:', err);
      setSubmitError('Something went wrong. Please try again or contact us directly.');
      setSubmitStatus('idle');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <SEO pageKey="businessGrowthAssessment" />

      <div className="min-h-screen pb-20">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <p className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-3">
              Preqal Investment Assessment
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight">
              Business Growth
              <br className="hidden sm:block" />
              <span className="text-amber-500">Investment Assessment</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-10">
              Help us understand your organisation so we can recommend the right level of
              support to strengthen your systems, improve performance, and prepare your
              business for its next stage of growth.
            </p>

            <button
              onClick={openModal}
              aria-haspopup="dialog"
              aria-controls="bga-modal"
              type="button"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-all neu-raised-sm"
            >
              Start Assessment
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-6">
              {(
                [
                  { Icon: Target,         text: 'Tailored to your organisation'         },
                  { Icon: CheckCircle2,   text: 'No obligation, no commitment'          },
                  { Icon: Users,          text: 'Reviewed personally by Preqal'         },
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

        {/* ── How Classification Works ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-100">
          <div className="neu-card rounded-2xl overflow-hidden">
            <div className="relative p-8 md:p-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

              <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-3">
                How It Works
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                A Classification Built Around Your Organisation
              </h2>
              <p className="text-slate-600 max-w-3xl leading-relaxed mb-8">
                Preqal uses your responses to classify your organisation into one of six
                business support tiers. Each tier reflects the level of structure, documentation,
                process mapping, training, and implementation support likely required. This
                allows us to prepare a recommendation that matches your real operational
                context — not a one-size-fits-all approach.
              </p>

              {/* 3 assessment inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {(
                  [
                    {
                      Icon: Users,
                      title: 'Staff Size',
                      desc: 'The size of your team is the primary indicator of operational scale. Larger teams typically require more documented systems, defined roles, and formal oversight structures.',
                    },
                    {
                      Icon: Layers,
                      title: 'Number of Services',
                      desc: 'Each service your organisation delivers requires its own management framework, quality controls, and documented procedures to operate consistently.',
                    },
                    {
                      Icon: Settings,
                      title: 'Processes per Service',
                      desc: 'Each service is made up of processes. The more processes involved, the deeper the documentation, mapping, and implementation work required to build a reliable system.',
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

              {/* What this assessment is / is not */}
              <div className="neu-flat rounded-xl p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  What to Expect From This Assessment
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'This is not an instant price calculator — your context matters.',
                    'The form helps Preqal understand the size and complexity of your organisation.',
                    'Your classification determines the right level of support for your goals.',
                    'The final investment is confirmed after a personal review by Preqal.',
                    'All programmes are structured around your operational complexity and improvement goals.',
                    'Submitting the form begins a professional quote request process — not an automated quote.',
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

        {/* ── Six Support Tiers ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="mb-8 animate-fade-in-up delay-200">
            <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-2">
              Support Tiers
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Six Tiers of Business Support
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Preqal classifies every organisation into one of six tiers based on size,
              operational complexity, and the level of system support required. Each tier
              represents a distinct scope of work — not a fixed price.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up delay-300">
            {TIERS.map(tier => {
              const { Icon } = tier;
              return (
                <div
                  key={tier.number}
                  className="neu-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300" />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 mb-2">
                          Tier {tier.number}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {tier.name}
                        </h3>
                        <p className="text-sm text-slate-500">{tier.staffLabel}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl neu-pressed-sm flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      {tier.description}
                    </p>

                    {/* Complexity badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${tier.complexityColor}`}>
                        {tier.complexity} Complexity
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── What Determines the Investment ───────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-fade-in-up delay-100">
          <div className="neu-card rounded-2xl overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-8 md:p-10">
              <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-3">
                Investment Context
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                What Determines the Level of Investment
              </h2>
              <p className="text-slate-600 max-w-2xl leading-relaxed mb-8">
                The required investment is not determined by a single number. It reflects the
                scope of work needed to genuinely strengthen your organisation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {(
                  [
                    {
                      Icon: Target,
                      title: 'Organisational Context',
                      desc: 'The size of your team, the nature of your services, and your current level of structure all influence how much work is involved.',
                    },
                    {
                      Icon: Lightbulb,
                      title: 'Process Complexity',
                      desc: 'Businesses with many interconnected processes require more documentation, mapping, and implementation effort than simpler operations.',
                    },
                    {
                      Icon: ArrowUpCircle,
                      title: 'Improvement Goals',
                      desc: 'Whether you are building from scratch, improving what exists, or preparing for certification shapes the depth of engagement required.',
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
            </div>
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-fade-in-up delay-100">
          <div className="neu-card rounded-2xl overflow-hidden">
            <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to begin your assessment?
              </h2>
              <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
                It takes less than three minutes. Your responses are reviewed personally by
                Preqal — not processed by an automated system.
              </p>
              <button
                onClick={openModal}
                aria-haspopup="dialog"
                aria-controls="bga-modal"
                type="button"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-all neu-raised-sm"
              >
                Start Assessment
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      </div>{/* /min-h-screen */}

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 glass-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          role="presentation"
        >
          <div
            ref={modalRef}
            id="bga-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bga-modal-title"
            aria-describedby="bga-modal-subtitle"
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl neu-card animate-fade-in-up"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl z-10" />

            {/* Close button */}
            <button
              ref={closeBtnRef}
              onClick={closeModal}
              type="button"
              aria-label="Close assessment modal"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl neu-raised-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:neu-pressed-sm transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 pt-10">

              {/* ── Form view ─────────────────────────────────────────────── */}
              {submitStatus !== 'success' && (
                <>
                  <p className="text-xs font-bold text-amber-600 tracking-widest uppercase mb-2">
                    Business Growth Assessment
                  </p>
                  <h2
                    className="text-2xl font-bold text-slate-900 mb-1"
                    id="bga-modal-title"
                  >
                    Request Your Investment Quote
                  </h2>
                  <p
                    className="text-slate-500 text-sm mb-8 leading-relaxed"
                    id="bga-modal-subtitle"
                  >
                    Share some details about your organisation. Preqal will review your
                    context and prepare a recommendation suited to your needs.
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Your Organisation
                    </p>

                    {/* Company Name */}
                    <div>
                      <label
                        htmlFor="bga-companyName"
                        className="block text-sm font-medium text-slate-600 mb-1"
                      >
                        Company Name{' '}
                        <span className="text-amber-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="bga-companyName"
                        name="companyName"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.companyName || undefined}
                        aria-describedby={errors.companyName ? 'bga-companyName-err' : undefined}
                        placeholder="e.g. Greenfield Solutions Ltd."
                        value={formData.companyName}
                        onChange={handleChange}
                        className={errors.companyName ? INPUT_ERR_CLS : INPUT_CLS}
                      />
                      {errors.companyName && (
                        <p id="bga-companyName-err" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Contact Person */}
                      <div>
                        <label
                          htmlFor="bga-contactPersonName"
                          className="block text-sm font-medium text-slate-600 mb-1"
                        >
                          Contact Person{' '}
                          <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bga-contactPersonName"
                          name="contactPersonName"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.contactPersonName || undefined}
                          aria-describedby={errors.contactPersonName ? 'bga-contact-err' : undefined}
                          placeholder="Full name"
                          value={formData.contactPersonName}
                          onChange={handleChange}
                          className={errors.contactPersonName ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.contactPersonName && (
                          <p id="bga-contact-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.contactPersonName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="bga-email"
                          className="block text-sm font-medium text-slate-600 mb-1"
                        >
                          Email Address{' '}
                          <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bga-email"
                          name="email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email || undefined}
                          aria-describedby={errors.email ? 'bga-email-err' : undefined}
                          placeholder="you@company.com"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.email && (
                          <p id="bga-email-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Optional: Business description */}
                    <div>
                      <label
                        htmlFor="bga-businessDescription"
                        className="block text-sm font-medium text-slate-600 mb-1"
                      >
                        What does your business do?{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="bga-businessDescription"
                        name="businessDescription"
                        rows={3}
                        placeholder="Briefly describe your main services or what your organisation does day-to-day…"
                        value={formData.businessDescription}
                        onChange={handleChange}
                        className={`${INPUT_CLS} resize-none`}
                      />
                    </div>

                    <div className="h-px bg-slate-200 my-1" />
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Size &amp; Complexity
                    </p>

                    {/* Staff Size */}
                    <div>
                      <label
                        htmlFor="bga-staffSize"
                        className="block text-sm font-medium text-slate-600 mb-1"
                      >
                        Team Size{' '}
                        <span className="text-amber-500" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="bga-staffSize"
                        name="staffSize"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.staffSize || undefined}
                        aria-describedby={errors.staffSize ? 'bga-staff-err' : undefined}
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
                        <option value="100+">100+ — Large / Complex Organisation</option>
                      </select>
                      {errors.staffSize && (
                        <p id="bga-staff-err" role="alert" className="text-xs text-red-600 mt-1">
                          {errors.staffSize}
                        </p>
                      )}
                    </div>

                    {/* Service Step Selector */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Which service steps interest you?{' '}
                        <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        Each step builds on the previous. Selecting a step includes all prior steps.
                        {!formData.staffSize && ' Select your team size above to see pricing.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Service step selector">
                        {STEP_NAMES.map((stepName, idx) => {
                          const stepNum = idx + 1;
                          const isActive = selectedSteps !== null && stepNum <= selectedSteps;
                          const isDisabled = !formData.staffSize;
                          return (
                            <button
                              key={stepNum}
                              type="button"
                              disabled={isDisabled}
                              aria-pressed={isActive}
                              aria-label={`Step ${stepNum}: ${stepName}`}
                              title={stepName}
                              onClick={() => setSelectedSteps(prev => prev === stepNum ? null : stepNum)}
                              className={[
                                'w-9 h-9 rounded-lg font-bold text-sm transition-all',
                                isDisabled
                                  ? 'neu-raised-sm text-slate-300 cursor-not-allowed'
                                  : isActive
                                  ? 'text-white shadow-inner cursor-pointer'
                                  : 'neu-raised-sm text-slate-500 hover:text-amber-600 cursor-pointer',
                              ].join(' ')}
                              style={isActive ? {
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.15)',
                              } : undefined}
                            >
                              {stepNum}
                            </button>
                          );
                        })}
                      </div>
                      {selectedSteps && formData.staffSize && (
                        <div className="mt-3 px-4 py-2.5 rounded-xl bg-amber-50/60 neu-pressed-sm text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-amber-700">Steps 1–{selectedSteps}</span>
                          {' '}· {STEP_NAMES[selectedSteps - 1]}
                          {' '}· <span className="font-bold text-amber-600">
                            GYD {STEP_RATES[getBaseTier(formData.staffSize)].toLocaleString()}/month
                          </span>
                          <span className="text-slate-400"> (9-month programme)</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Number of Services */}
                      <div>
                        <label
                          htmlFor="bga-numberOfServices"
                          className="block text-sm font-medium text-slate-600 mb-1"
                        >
                          Number of Services{' '}
                          <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="bga-numberOfServices"
                          name="numberOfServices"
                          type="number"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.numberOfServices || undefined}
                          aria-describedby={
                            errors.numberOfServices ? 'bga-svc-err' : 'bga-svc-hint'
                          }
                          placeholder="e.g. 3"
                          min={1}
                          max={50}
                          value={formData.numberOfServices}
                          onChange={handleChange}
                          className={errors.numberOfServices ? INPUT_ERR_CLS : INPUT_CLS}
                        />
                        {errors.numberOfServices ? (
                          <p id="bga-svc-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.numberOfServices}
                          </p>
                        ) : (
                          <p id="bga-svc-hint" className="text-xs text-slate-400 mt-1">
                            How many distinct services does your business offer?
                          </p>
                        )}
                      </div>

                      {/* Avg Processes per Service */}
                      <div>
                        <label
                          htmlFor="bga-avgProcessesPerService"
                          className="block text-sm font-medium text-slate-600 mb-1"
                        >
                          Processes per Service{' '}
                          <span className="text-amber-500" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="bga-avgProcessesPerService"
                          name="avgProcessesPerService"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.avgProcessesPerService || undefined}
                          aria-describedby={
                            errors.avgProcessesPerService ? 'bga-proc-err' : 'bga-proc-hint'
                          }
                          value={formData.avgProcessesPerService}
                          onChange={handleChange}
                          className={errors.avgProcessesPerService ? INPUT_ERR_CLS : INPUT_CLS}
                        >
                          <option value="">Select a range…</option>
                          <option value="1-3">1–3 processes (simple)</option>
                          <option value="4-6">4–6 processes (moderate)</option>
                          <option value="7-10">7–10 processes (complex)</option>
                          <option value="10+">10+ processes (very complex)</option>
                        </select>
                        {errors.avgProcessesPerService ? (
                          <p id="bga-proc-err" role="alert" className="text-xs text-red-600 mt-1">
                            {errors.avgProcessesPerService}
                          </p>
                        ) : (
                          <p id="bga-proc-hint" className="text-xs text-slate-400 mt-1">
                            On average, per service
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit-level error */}
                    {submitError && (
                      <div
                        className="p-3 neu-pressed rounded-xl text-red-600 text-sm"
                        role="alert"
                      >
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitStatus === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all neu-raised-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitStatus === 'submitting' ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>
                      ) : (
                        <><CheckCircle2 className="h-5 w-5" /> Request Quote</>
                      )}
                    </button>

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      Your information is kept confidential and used solely to prepare your
                      assessment. A Preqal specialist will review your submission personally.
                    </p>
                  </form>
                </>
              )}

              {/* ── Success view ──────────────────────────────────────────── */}
              {submitStatus === 'success' && (
                <div
                  className="animate-fade-in-up py-4"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {/* Success icon */}
                  <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>

                  {/* Thank you message */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Assessment Received
                    </h3>
                    <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
                      Thank you. Your assessment has been received. Preqal will review your
                      organisation's context and prepare a suitable recommendation.
                    </p>
                  </div>

                  {/* What happens next */}
                  <div className="neu-flat rounded-xl p-5 mb-6">
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">
                      What Happens Next
                    </p>
                    <ul className="space-y-3">
                      {[
                        'A Preqal specialist will personally review your submission.',
                        'We will assess your organisation\'s context, complexity, and goals.',
                        'You will receive a tailored recommendation within 1–2 business days.',
                      ].map(step => (
                        <li key={step} className="flex items-start gap-3 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          {step}
                        </li>
                      ))}
                    </ul>
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
              )}

            </div>{/* /p-8 */}
          </div>{/* /modal */}
        </div>
      , document.body)}
    </>
  );
};

export default BusinessGrowthAssessment;
