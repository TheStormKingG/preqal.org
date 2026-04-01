import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, Calendar, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import SEO from '../components/SEO';

const BookScan: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const serviceName = searchParams.get('service');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', country_iso: 'gy', dial_code: '+592',
    company: '', businessType: '',
    concern: serviceName ? `I am interested in ${serviceName}` : '',
    sessionStyle: 'Virtual',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
        import.meta.env.VITE_EMAILJS_SERVICE_REQUEST_TEMPLATE_ID || 'template_c3b29pd',
        {
          subject: 'Service Request', service_name: serviceName || 'Quality Risk Scan™',
          name: formData.name.trim(), email: formData.email.trim().toLowerCase(),
          phone: `${formData.dial_code} ${formData.phone.trim()}`,
          company: formData.company.trim() || 'Not provided',
          business_type: formData.businessType || 'Not specified',
          message: formData.concern.trim(), session_style: formData.sessionStyle,
          submitted_at: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: 'UTC' }),
          formatted_data: `Service Request\n\nService: ${serviceName || 'Quality Risk Scan™'}\nName: ${formData.name.trim()}\nEmail: ${formData.email.trim().toLowerCase()}\nPhone: ${formData.dial_code} ${formData.phone.trim()}\nCompany: ${formData.company.trim() || 'Not provided'}\nCompany Type: ${formData.businessType || 'Not specified'}\nPreferred Session: ${formData.sessionStyle}\nMessage: ${formData.concern.trim()}\nSubmitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
      );
      setStatus('success');
    } catch (err) {
      console.error('Error sending service request:', err);
      setError('Something went wrong. Please try again or call us directly.');
      setStatus('idle');
    }
  };

  const serviceDescriptions: Record<string, string> = {
    'Quality Risk Scan™': 'Our Quality Risk Scan™ is a comprehensive seven-day diagnostic assessment that evaluates your current operational systems against ISO standards, regulatory requirements, and industry best practices. You receive a prioritized Red Flag Report highlighting immediate concerns, along with a strategic roadmap outlining actionable steps to strengthen your controls.',
    'IMS Design & Setup': 'Our IMS Design & Setup service creates a unified Integrated Management System that combines quality, environmental, and safety processes into one cohesive framework. We architect your system from the ground up, developing policies, mapping processes, and establishing digital infrastructure.',
    'SOP & Procedure Development': 'Our SOP & Procedure Development service transforms complex operational requirements into clear, actionable documentation. We replace text-heavy manuals with visual SOPs featuring flowcharts, checklists, and mobile-friendly formats.',
    'Training & Competency': 'Our Training & Competency programs build organizational capability through targeted workshops and digital modules that explain both the "why" and the "what" behind your quality systems.',
    'Audit Readiness Support': 'Our Audit Readiness Support prepares your organization for external certification audits and regulatory inspections through comprehensive mock audit sessions and strategic coaching.',
    'Preqal 360™ Transformation': 'Our Preqal 360™ Transformation is a complete turnkey solution that acts as your fractional Quality Department, executing the full lifecycle from assessment through certification.',
    'Operational Web App Development': 'Our Operational Web App Development service creates custom digital tools that streamline your workflows, automate reporting, and digitize quality management systems.',
    'Specialized Advisory & Crisis Support': 'Our Specialized Advisory & Crisis Support provides bespoke solutions for unique operational challenges — from operational failures to compliance disputes.',
  };

  const content = serviceName ? {
    title: `Book ${serviceName}`,
    subtitle: `Ready to move forward with ${serviceName}? Fill out the details below to schedule your kickoff or consultation.`,
    detailedDescription: serviceDescriptions[serviceName] || '',
    stepsTitle: "Next Steps",
    steps: [
      { num: 1, title: "Request Review", desc: "We analyze your submission within 24 hours." },
      { num: 2, title: "Consultation Call", desc: "A brief chat to align on scope and timeline." },
      { num: 3, title: "Proposal & Start", desc: "We send a tailored roadmap and get to work." }
    ],
    formTitle: "Project Inquiry"
  } : {
    title: "Book a Risk Scan",
    subtitle: "Stop guessing about your compliance status. Get a Preqal professional diagnostic of your current systems against regulatory standards.",
    detailedDescription: serviceDescriptions['Quality Risk Scan™'],
    stepsTitle: "What happens next?",
    steps: [
      { num: 1, title: "Initial Discovery", desc: "15-min call to understand your immediate pain points." },
      { num: 2, title: "Diagnostic Session", desc: "Virtual or on-site review of your key documents and flows." },
      { num: 3, title: "Action Plan", desc: "You receive a 'Red Flag Report' and a proposal for fixes." }
    ],
    formTitle: "Start Your Diagnostic"
  };

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 neu-pressed-sm focus:neu-pressed";

  if (status === 'success') {
    return (
      <>
        <SEO pageKey="book" />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="neu-card rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 neu-pressed">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Thank you, {formData.name}. Stefan will review your details regarding "{serviceName || 'Risk Scan'}" and contact you within 24 hours.
            </p>
            <button onClick={() => setStatus('idle')} className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">Submit another request</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageKey="book" />
      <div className="min-h-screen py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Content Side */}
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold text-slate-900 mb-6">{content.title}</h1>
              <p className="text-xl text-slate-500 mb-4 leading-relaxed">{content.subtitle}</p>
              {content.detailedDescription && (
                <p className="text-base text-slate-600 mb-8 leading-relaxed">{content.detailedDescription}</p>
              )}
              <div className="neu-card rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">{content.stepsTitle}</h3>
                <ul className="space-y-4">
                  {content.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full neu-pressed-sm flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-amber-600">{step.num}</span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-slate-900">{step.title}</p>
                        <p className="text-sm text-slate-500">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 text-sm">
                <Phone className="h-4 w-4" /><span>Direct: +592 633 5874</span>
              </div>
              <div className="mt-6">
                <picture>
                  <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-6-300.avif 300w, ${import.meta.env.BASE_URL}Stefan%20Signature-6-600.avif 600w`} sizes="(max-width: 768px) 300px, 600px" />
                  <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-6-300.webp 300w, ${import.meta.env.BASE_URL}Stefan%20Signature-6-600.webp 600w`} sizes="(max-width: 768px) 300px, 600px" />
                  <img src={`${import.meta.env.BASE_URL}Stefan%20Signature-6-600.webp`} alt="Dr. Gravesande Signature" className="h-auto" style={{ width: '30rem', maxWidth: '100%' }} width="600" height="200" loading="lazy" decoding="async" />
                </picture>
              </div>
            </div>

            {/* Form Side */}
            <div className="neu-card rounded-2xl p-8 animate-fade-in-up delay-100">
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl -mt-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{content.formTitle}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                    <input type="text" name="name" required className={inputClass} value={formData.name} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company Name</label>
                    <input type="text" name="company" className={inputClass} placeholder="Company Name" value={formData.company} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input type="email" name="email" required className={inputClass} value={formData.email} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Company Type</label>
                    <select name="businessType" className={inputClass} value={formData.businessType} onChange={handleChange}>
                      <option value="">Select...</option>
                      <option>Market/Retail Vendor</option>
                      <option>Wholesale & Distribution</option>
                      <option>Automotive & Transportation</option>
                      <option>Food & Beverage</option>
                      <option>Agriculture & Agri-Food Production</option>
                      <option>Construction & Engineering</option>
                      <option>Hospitality & Tourism</option>
                      <option>Education & Training</option>
                      <option>Entertainment & Creative Arts</option>
                      <option>Digital/Tech & Software</option>
                      <option>Health Care & Medical Services</option>
                      <option>Manufacturing & Industrial Production</option>
                      <option>Financial Services & Insurance</option>
                      <option>Real Estate & Property Management</option>
                      <option>Logistics, Shipping & Supply Chain</option>
                      <option>Energy, Utilities & Renewables</option>
                      <option>Professional Services (Legal, Accounting, Consulting)</option>
                      <option>Government, Public Administration & Defense</option>
                      <option>Mining, Oil & Gas</option>
                      <option>Environmental & Waste Management</option>
                      <option>Nonprofit, NGOs & Social Impact Services</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Phone / WhatsApp</label>
                  <PhoneInput
                    defaultCountry="gy"
                    value={formData.phone}
                    onChange={(phone, { country, dialCode }) => setFormData({ ...formData, phone, country_iso: country?.iso2?.toLowerCase() || 'gy', dial_code: dialCode || '+592' })}
                    className="w-full"
                    inputClassName={inputClass}
                    countrySelectorStyleProps={{ buttonClassName: "px-3 py-3 rounded-l-xl neu-pressed-sm" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Message</label>
                  <textarea name="concern" rows={4} className={`${inputClass} resize-none`} placeholder="Tell us about your project or how we can help..." value={formData.concern} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">Preferred Session Style</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Virtual', 'On-Site'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({ ...formData, sessionStyle: style })}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${
                          formData.sessionStyle === style
                            ? 'neu-pressed text-amber-700 font-bold'
                            : 'neu-raised-sm text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {style === 'Virtual' ? <Phone className="h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <div className="p-3 neu-pressed rounded-xl text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center items-center py-4 px-6 rounded-xl text-white bg-amber-500 hover:bg-amber-400 font-bold text-lg transition-all duration-300 neu-raised-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {status === 'submitting' ? <Loader2 className="h-6 w-6 animate-spin" /> : <>{content.formTitle} <Send className="ml-2 h-5 w-5" /></>}
                </button>
                <p className="text-xs text-center text-slate-500">Dr. Gravesande will contact you within 24 hours.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookScan;
