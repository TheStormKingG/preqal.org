import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
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
                    <a href="mailto:info@preqal.com" className="text-neutral-900 font-semibold hover:text-amber-600 transition-colors">info@preqal.com</a>
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
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Message</label>
                    <textarea
                      name="message"
                      required
                      className="w-full flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400 resize-none"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
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