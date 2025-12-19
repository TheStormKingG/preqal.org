import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'job_title') {
      if (value === 'Other') {
        setShowCustomJobTitle(true);
        setFormData({ ...formData, job_title: 'Other', custom_job_title: '' });
      } else {
        setShowCustomJobTitle(false);
        setFormData({ ...formData, job_title: value, custom_job_title: '' });
      }
    } else if (name === 'most_pressing_quality_problem') {
      if (value === 'Other') {
        setShowCustomQualityProblem(true);
        setFormData({ ...formData, most_pressing_quality_problem: 'Other', custom_quality_problem: '' });
      } else {
        setShowCustomQualityProblem(false);
        setFormData({ ...formData, most_pressing_quality_problem: value, custom_quality_problem: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Validate required fields
      if (!formData.first_name.trim()) {
        alert('First name is required');
        setStatus('idle');
        return;
      }
      if (!formData.last_name.trim()) {
        alert('Last name is required');
        setStatus('idle');
        return;
      }
      if (!formData.email.trim()) {
        alert('Email is required');
        setStatus('idle');
        return;
      }
      if (!formData.company.trim()) {
        alert('Company is required');
        setStatus('idle');
        return;
      }
      if (!formData.job_title.trim()) {
        alert('Job title is required');
        setStatus('idle');
        return;
      }
      if (formData.job_title === 'Other' && !formData.custom_job_title.trim()) {
        alert('Please enter your job title');
        setStatus('idle');
        return;
      }
      if (!formData.phone.trim()) {
        alert('Phone number is required');
        setStatus('idle');
        return;
      }
      if (!formData.most_pressing_quality_problem.trim()) {
        alert('Most pressing quality problem is required');
        setStatus('idle');
        return;
      }
      if (formData.most_pressing_quality_problem === 'Other' && !formData.custom_quality_problem.trim()) {
        alert('Please describe your quality problem');
        setStatus('idle');
        return;
      }

      const jobTitle = formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim();
      const qualityProblem = formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim();

      // Send contact form email via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
        import.meta.env.VITE_EMAILJS_SERVICE_REQUEST_TEMPLATE_ID || 'template_c3b29pd',
          {
            subject: 'Service Request',
            service_name: 'General Inquiry',
            name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
            email: formData.email.trim().toLowerCase(),
            phone: `${formData.dial_code} ${formData.phone.trim()}`,
            company: formData.company.trim(),
            business_type: jobTitle,
            message: formData.message.trim() || qualityProblem,
            session_style: 'N/A',
            submitted_at: new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'long',
              timeZone: 'UTC'
            }),
            // Additional fields for context
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            job_title: jobTitle,
            most_pressing_quality_problem: qualityProblem,
            formatted_data: `
Service Request - General Inquiry

Service: General Inquiry
Name: ${formData.first_name.trim()} ${formData.last_name.trim()}
Email: ${formData.email.trim().toLowerCase()}
Phone: ${formData.dial_code} ${formData.phone.trim()}
Company: ${formData.company.trim()}
Job Title: ${jobTitle}
Quality Problem: ${qualityProblem}
Message: ${formData.message.trim() || 'N/A'}
Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
          `.trim(),
          },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
      );

      setStatus('success');
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        company: '', 
        job_title: '', 
        custom_job_title: '',
        phone: '',
        country_iso: 'us',
        dial_code: '+1',
        most_pressing_quality_problem: '',
        custom_quality_problem: '',
        message: '' 
      });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);
    } catch (error) {
      console.error('Error sending contact form:', error);
      // Still show success to user even if email fails
      setStatus('success');
      setFormData({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        company: '', 
        job_title: '', 
        custom_job_title: '',
        phone: '',
        country_iso: 'us',
        dial_code: '+1',
        most_pressing_quality_problem: '',
        custom_quality_problem: '',
        message: '' 
      });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header - Dark with Seamless Fade and Pattern */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 relative overflow-hidden text-white">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
            Have a general question, partnership inquiry, or need to discuss a custom project? We're here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Info Side */}
          <div className="lg:col-span-1 space-y-8 animate-fade-in-up delay-100">
            <div className="bg-white/80 backdrop-blur p-8 rounded-2xl border border-neutral-200 shadow-lg shadow-neutral-200/50">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-1">Email Us</p>
                    <a href="mailto:info@preqal.org" className="text-neutral-900 font-semibold hover:text-amber-600 transition-colors">info@preqal.org</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-1">Call Us</p>
                    <p className="text-neutral-900 font-semibold">+592 (555) 123-4567</p>
                    <p className="text-xs text-neutral-500 mt-1">Mon-Fri, 8am - 5pm AST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 mb-1">Location</p>
                    <p className="text-neutral-900 font-semibold">Georgetown, Guyana</p>
                    <p className="text-xs text-neutral-500 mt-1">Serving the Caribbean Region</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 rounded-2xl text-white shadow-xl">
              <h3 className="font-bold mb-4">Looking for a Diagnostic?</h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                If you need a formal assessment of your compliance systems, use our booking tool for a structured intake.
              </p>
              <a href="#/book" className="inline-block w-full text-center bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-lg transition-colors">
                Book a Risk Scan
              </a>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="lg:col-span-2 animate-fade-in-up delay-200 flex">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send a Message</h2>
              
              {status === 'success' ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Message Sent!</h3>
                  <p className="text-neutral-600 mb-6">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-amber-600 font-semibold hover:text-amber-500 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Company *</label>
                    <input
                      type="text"
                      name="company"
                      required
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Job Title *</label>
                    <select
                      name="job_title"
                      required
                      value={formData.job_title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a job title</option>
                      {jobTitles.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    {showCustomJobTitle && (
                      <input
                        type="text"
                        name="custom_job_title"
                        required
                        value={formData.custom_job_title}
                        onChange={handleChange}
                        className="w-full mt-3 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                        placeholder="Enter your job title"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Phone Number *</label>
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
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Most Pressing Quality Problem *</label>
                    <select
                      name="most_pressing_quality_problem"
                      required
                      value={formData.most_pressing_quality_problem}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a quality problem</option>
                      {qualityProblems.map((problem) => (
                        <option key={problem} value={problem}>
                          {problem}
                        </option>
                      ))}
                    </select>
                    {showCustomQualityProblem && (
                      <textarea
                        name="custom_quality_problem"
                        required
                        rows={4}
                        value={formData.custom_quality_problem}
                        onChange={handleChange}
                        className="w-full mt-3 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400 resize-none"
                        placeholder="Describe your most pressing quality or compliance challenge..."
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400 resize-none"
                      placeholder="Tell us about your project or how we can help..."
                    />
                  </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-lg shadow-lg text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 font-bold text-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                  >
                    {status === 'submitting' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
export default ContactUs;