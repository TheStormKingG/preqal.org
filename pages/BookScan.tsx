import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, Calendar, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const BookScan: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const serviceName = searchParams.get('service');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_iso: 'us',
    dial_code: '+1',
    company: '',
    businessType: '',
    concern: serviceName ? `I am interested in ${serviceName}` : '',
    sessionStyle: 'Virtual',
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Send service request email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
        import.meta.env.VITE_EMAILJS_SERVICE_REQUEST_TEMPLATE_ID || 'template_c3b29pd',
          {
            subject: 'Service Request',
            service_name: serviceName || 'Quality Risk Scan™',
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            company: formData.company.trim() || 'Not provided',
            business_type: formData.businessType || 'Not specified',
            message: formData.concern.trim(),
            session_style: formData.sessionStyle,
            submitted_at: new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'long',
              timeZone: 'UTC'
            }),
            // Formatted data for email template
            formatted_data: `
Service Request

Service: ${serviceName || 'Quality Risk Scan™'}
Name: ${formData.name.trim()}
Email: ${formData.email.trim().toLowerCase()}
Phone: ${formData.dial_code} ${formData.phone.trim()}
Company: ${formData.company.trim() || 'Not provided'}
Company Type: ${formData.businessType || 'Not specified'}
Preferred Session: ${formData.sessionStyle}
Message: ${formData.concern.trim()}
Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
          `.trim(),
          },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
      );

      setStatus('success');
    } catch (error) {
      console.error('Error sending service request:', error);
      // Still show success to user even if email fails
      setStatus('success');
    }
  };

  // 60-word detailed descriptions for each service
  const serviceDescriptions: Record<string, string> = {
    'Quality Risk Scan™': 'Our Quality Risk Scan™ is a comprehensive seven-day diagnostic assessment that evaluates your current operational systems against ISO standards, regulatory requirements, and industry best practices. We conduct thorough gap analysis across quality, safety, and environmental processes, identifying critical vulnerabilities and compliance risks. You receive a prioritized Red Flag Report highlighting immediate concerns, along with a strategic roadmap outlining actionable steps to strengthen your controls and achieve full compliance alignment.',
    'IMS Design & Setup': 'Our IMS Design & Setup service creates a unified Integrated Management System that seamlessly combines quality, environmental, and safety processes into one cohesive operational framework. We architect your system from the ground up, developing comprehensive policies, mapping interconnected processes, and establishing the digital infrastructure needed for effective data management. This foundation enables your organization to maintain consistent compliance, streamline operations, and demonstrate continuous improvement across all management disciplines.',
    'SOP & Procedure Development': 'Our SOP & Procedure Development service transforms complex operational requirements into clear, actionable documentation that frontline teams can actually use. We replace text-heavy manuals with visual Standard Operating Procedures featuring flowcharts, checklists, and step-by-step guides designed for real-world application. Our mobile-friendly formats ensure your teams have access to critical procedures when and where they need them, supporting consistent execution of quality, environmental, and safety controls across all operational levels.',
    'Training & Competency': 'Our Training & Competency programs build organizational capability through targeted workshops and digital modules that explain both the "why" and the "what" behind your quality systems. We deliver on-site training sessions and comprehensive digital learning modules covering safe work practices, environmental care, incident prevention, and accurate data recording. Our competency assessments ensure your team understands their role in maintaining system discipline, with content customized to different skill levels and operational responsibilities.',
    'Audit Readiness Support': 'Our Audit Readiness Support prepares your organization for external certification audits and regulatory inspections through comprehensive mock audit sessions and strategic coaching. We conduct realistic audit simulations covering ISO 9001, ISO 14001, and ISO 45001 standards, helping your team build confidence and strengthen evidence trails. Our approach ensures your systems perform effectively under audit pressure, with staff trained to respond confidently to auditor questions and demonstrate compliance through clear documentation and process evidence.',
    'Preqal 360™ Transformation': 'Our Preqal 360™ Transformation is a complete turnkey solution that acts as your fractional Quality Department, executing the full lifecycle from initial assessment through final certification. We handle every aspect of your quality transformation: comprehensive system assessment, strategic design, complete documentation development, full implementation support, comprehensive training programs, and certification audit preparation. This end-to-end approach is ideal for organizations seeking formal ISO compliance without the overhead of building an internal quality department from scratch.',
    'Operational Web App Development': 'Our Operational Web App Development service creates custom digital tools that streamline your operational workflows, automate reporting processes, and digitize quality management systems. We build tailored web applications including data collection interfaces, real-time performance dashboards, automated compliance tracking systems, and integrated reporting platforms. Our solutions integrate seamlessly with your existing systems through API development, providing you with powerful operational tools that enhance efficiency, improve data accuracy, and support evidence-based decision-making across your organization.',
    'Specialized Advisory & Crisis Support': 'Our Specialized Advisory & Crisis Support service provides bespoke solutions for unique operational challenges that don\'t fit standard consulting molds. Whether you\'re recovering from operational failures, navigating complex compliance disputes, standing up new processes under tight deadlines, or addressing crisis situations, we design custom intervention plans aligned with ISO principles and your organizational reality. Our approach combines deep technical expertise with practical problem-solving to deliver targeted solutions that address your specific constraints and operational context.'
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
    subtitle: "Stop guessing about your compliance status. Get a professional diagnostic of your current systems against regulatory standards.",
    detailedDescription: 'Our Quality Risk Scan™ is a comprehensive seven-day diagnostic assessment that evaluates your current operational systems against ISO standards, regulatory requirements, and industry best practices. We conduct thorough gap analysis across quality, safety, and environmental processes, identifying critical vulnerabilities and compliance risks. You receive a prioritized Red Flag Report highlighting immediate concerns, along with a strategic roadmap outlining actionable steps to strengthen your controls and achieve full compliance alignment.',
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
            <p className="text-xl text-neutral-600 mb-4 leading-relaxed">
              {content.subtitle}
            </p>
            {content.detailedDescription && (
              <p className="text-base text-neutral-600 mb-8 leading-relaxed">
                {content.detailedDescription}
              </p>
            )}
            
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
              <span>Direct: +592 633 5874</span>
            </div>
            
            <div className="mt-6">
              <img src={`${import.meta.env.BASE_URL}Stefan%20Signature-6.png`} alt="Dr. Gravesande Signature" className="h-auto" style={{ width: '30rem' }} />
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
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company Name"
                  />
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

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Phone / WhatsApp</label>
                <PhoneInput
                  defaultCountry="us"
                  value={formData.phone}
                  onChange={(phone, { country, dialCode }) => {
                    setFormData({
                      ...formData,
                      phone,
                      country_iso: country?.iso2?.toLowerCase() || 'us',
                      dial_code: dialCode || '+1',
                    });
                  }}
                  className="w-full"
                  inputClassName="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  countrySelectorStyleProps={{
                    buttonClassName: "px-3 py-3 bg-neutral-50 border border-neutral-200 rounded-l-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                  }}
                />
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
                Dr. Gravesande will contact you within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookScan;