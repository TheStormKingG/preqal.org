import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, Calendar, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BookScan: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const serviceName = searchParams.get('service');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    concern: serviceName ? `I am interested in ${serviceName}` : '',
    sessionStyle: 'Virtual',
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  const content = serviceName ? {
    title: `Book ${serviceName}`,
    subtitle: `Ready to move forward with ${serviceName}? Fill out the details below to schedule your kickoff or consultation.`,
    stepsTitle: "Next Steps",
    steps: [
      { num: 1, title: "Request Review", desc: "We analyze your submission within 24 hours." },
      { num: 2, title: "Consultation Call", desc: "A brief chat to align on scope and timeline." },
      { num: 3, title: "Proposal & Start", desc: "We send a tailored roadmap and get to work." }
    ],
    formTitle: "Project Inquiry"
  } : {
    title: "Book a Risk Scan",
    subtitle: "Stop guessing about your compliance status. Get a professional diagnostic of your current systems against ISO, HACCP, or local regulatory standards.",
    stepsTitle: "What happens next?",
    steps: [
      { num: 1, title: "Initial Discovery", desc: "15-min call to understand your immediate pain points." },
      { num: 2, title: "Diagnostic Session", desc: "Virtual or on-site review of your key documents and flows." },
      { num: 3, title: "Action Plan", desc: "You receive a 'Red Flag Report' and a proposal for fixes." }
    ],
    formTitle: "Start Your Diagnostic"
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Request Received</h2>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Thank you, {formData.name}. Stefan will review your details regarding "{serviceName || 'Risk Scan'}" and contact you within 24 hours.
          </p>
          <button 
            onClick={() => setStatus('idle')}
            className="text-amber-600 font-semibold hover:text-amber-500 transition-colors"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Content Side */}
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold text-neutral-900 mb-6">{content.title}</h1>
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              {content.subtitle}
            </p>
            
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg shadow-neutral-200/50 border border-neutral-200 mb-8">
              <h3 className="font-bold text-neutral-900 mb-4">{content.stepsTitle}</h3>
              <ul className="space-y-4">
                {content.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-amber-600">{step.num}</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-neutral-900">{step.title}</p>
                      <p className="text-sm text-neutral-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center space-x-2 text-neutral-500 text-sm">
              <Phone className="h-4 w-4" />
              <span>Direct: +592 (555) 123-4567</span>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 animate-fade-in-up delay-100">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">{content.formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Company Type</label>
                  <select
                    name="businessType"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all appearance-none"
                    value={formData.businessType}
                    onChange={handleChange}
                  >
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Message</label>
                <textarea
                  name="concern"
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                  placeholder="Tell us about your project or how we can help..."
                  value={formData.concern}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-3">Preferred Session Style</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, sessionStyle: 'Virtual'})}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-all duration-300 ${
                      formData.sessionStyle === 'Virtual' 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold' 
                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                  >
                    <Phone className="h-4 w-4 mr-2" /> Virtual
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, sessionStyle: 'On-Site'})}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg transition-all duration-300 ${
                      formData.sessionStyle === 'On-Site' 
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold' 
                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> On-Site
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex justify-center items-center py-4 px-6 rounded-lg shadow-lg text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 font-bold text-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
              >
                {status === 'submitting' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {content.formTitle} <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-center text-neutral-500">
                Stefan will contact you within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookScan;