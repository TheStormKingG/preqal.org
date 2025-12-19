import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import emailjs from '@emailjs/browser';

const Resources: React.FC = () => {
  const jobTitles = [
    'Quality Manager',
    'Quality Assurance Manager',
    'Quality Control Manager',
    'Compliance Manager',
    'QHSE Manager',
    'HSE Manager',
    'Operations Manager',
    'Production Manager',
    'Quality Engineer',
    'Quality Assurance Engineer',
    'Compliance Officer',
    'Quality Analyst',
    'Quality Specialist',
    'Regulatory Affairs Manager',
    'Director of Quality',
    'VP of Quality',
    'Chief Quality Officer',
    'Other'
  ];

  const qualityProblems = [
    'Inconsistent process execution',
    'Poor document & change control',
    'Unsafe behaviors + weak supervision',
    'Inadequate risk assessments/controls',
    'Training/competency gaps',
    'Cash flow instability',
    'Weak financial controls',
    'Inventory and material flow issues',
    'Lack of strategic alignment',
    'Other'
  ];

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    job_title: '',
    custom_job_title: '',
    phone: '',
    country_iso: 'gy',
    dial_code: '+592',
    most_pressing_quality_problem: '',
    custom_quality_problem: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
  const [showCustomQualityProblem, setShowCustomQualityProblem] = useState(false);

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
    setError(''); // Clear error on input change
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Company is required');
      return false;
    }
    if (!formData.job_title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (formData.job_title === 'Other' && !formData.custom_job_title.trim()) {
      setError('Please enter your job title');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.most_pressing_quality_problem.trim()) {
      setError('Please select or describe your most pressing quality problem');
      return false;
    }
    if (formData.most_pressing_quality_problem === 'Other' && !formData.custom_quality_problem.trim()) {
      setError('Please describe your most pressing quality problem');
      return false;
    }
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('template_leads')
        .insert({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim(),
          job_title: formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim(),
          phone_number: formData.phone.trim(),
          country_iso: formData.country_iso,
          dial_code: formData.dial_code,
          most_pressing_quality_problem: formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim(),
          source_page: 'library_unlock',
        });

      if (insertError) {
        throw insertError;
      }

      // Send email notification via EmailJS
      try {
        const jobTitle = formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim();
        const qualityProblem = formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim();
        
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qziw5dg',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_t9m3dai',
          {
            subject: 'Preqal Lead',
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
            email: formData.email.trim().toLowerCase(),
            company: formData.company.trim(),
            job_title: jobTitle,
            phone_number: formData.phone.trim(),
            formatted_phone: `${formData.dial_code} ${formData.phone.trim()}`,
            dial_code: formData.dial_code,
            country_iso: formData.country_iso.toUpperCase(),
            most_pressing_quality_problem: qualityProblem,
            message: formData.message.trim() || 'N/A',
            source_page: 'library_unlock',
            submitted_at: new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'long',
              timeZone: 'UTC'
            }),
            formatted_data: `
New Lead Submission

Name: ${formData.first_name.trim()} ${formData.last_name.trim()}
Email: ${formData.email.trim().toLowerCase()}
Company: ${formData.company.trim()}
Job Title: ${jobTitle}
Phone: ${formData.dial_code} ${formData.phone.trim()} (${formData.country_iso.toUpperCase()})
Quality Problem: ${qualityProblem}
Message: ${formData.message.trim() || 'N/A'}
Source: Library Unlock Form
Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
            `.trim(),
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mijyAm1ocwE6qYCiq'
        );
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
        // Don't fail the form submission if email fails
      }

      // Success - trigger download and show success message
      triggerDownload();
      setSuccess(true);
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        job_title: '',
        custom_job_title: '',
        phone: '',
        country_iso: 'gy',
        dial_code: '+592',
        most_pressing_quality_problem: '',
        custom_quality_problem: '',
        message: '',
      });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error saving lead:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header with Seamless Fade and Pattern - Fades to Transparent */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 mb-16 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Resources & Tools</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Professional tools to kickstart your compliance journey. Free for the community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up delay-100">
          <div className="bg-gradient-to-r from-neutral-100 to-white p-10 text-center border-b border-neutral-100 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-6 ring-4 ring-neutral-50 shadow-sm">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="font-bold mb-2 text-neutral-900" style={{ fontSize: 'calc(1.5rem * 1.07)' }}>Unlock the Library</h2>
            <p className="text-neutral-500 mb-4" style={{ fontSize: 'calc(1rem * 1.07)' }}>Enter your details to access all 5 premium templates instantly.</p>
            <ol className="text-left text-neutral-600 space-y-2 max-w-md mx-auto list-decimal list-inside">
              <li>Document Masterlist</li>
              <li>QHSE Policy</li>
              <li>Document Control Procedure</li>
              <li>Risk Register</li>
              <li>Training & Competency Register</li>
            </ol>
          </div>
          <div className="p-10 md:p-12 bg-white">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Company *</label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                  placeholder="Company Name"
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
                  defaultCountry="gy"
                  value={formData.phone}
                  onChange={(phone, { country, dialCode }) => {
                    setFormData({
                      ...formData,
                      phone,
                      country_iso: country?.iso2?.toLowerCase() || 'us',
                      dial_code: dialCode || '+1',
                    });
                    setError('');
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Unlock Access'
                )}
              </button>
            </form>
            <p className="text-xs text-center text-neutral-500 mt-6">
              We respect your privacy. No spam, just value.
            </p>
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fade-in-up text-center">
                <span className="font-bold">Download started.</span> Check your downloads folder.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
