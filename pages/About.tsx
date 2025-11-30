import React from 'react';
import { Microscope, Activity, Globe, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header with Seamless Fade and Pattern - Fades to Transparent */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Preqal — Clinic on Quality™</h1>
          <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            We specialize in Quality, Food Safety, Animal Welfare, and Compliance Systems for the Poultry, Eco-Hospitality, and Agri-Food sectors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Founder Side */}
          <div className="md:col-span-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 sticky top-24 shadow-xl shadow-neutral-200/50 animate-fade-in-up delay-100">
              <div className="w-32 h-32 bg-neutral-100 rounded-full mx-auto mb-6 overflow-hidden border-4 border-amber-500/20 p-1">
                <img src="https://picsum.photos/seed/doctor/400/400" alt="Stefan - Founder" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-1 text-neutral-900">Stefan</h2>
              <p className="text-amber-600 text-center text-sm font-bold mb-6 uppercase tracking-widest">Medical -> Systems Engineer</p>
              
              <div className="space-y-4 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-6">
                <p>
                  Transitioning from a medical background to industrial quality systems, Stefan brings a diagnostic, evidence-based approach to operational management.
                </p>
                <p>
                  Former lead on building the Integrated Management System (IMS) from scratch at Bounty Farm.
                </p>
                <p>
                  Developer of ESGAIMS multi-agent reporting system.
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy Content */}
          <div className="md:col-span-8 space-y-12 animate-fade-in-up delay-200">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-8 border-l-4 border-amber-500 pl-4">Our Philosophy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-shrink-0 mt-1"><Microscope className="text-amber-600 h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Evidence-Driven</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">We don't guess. We measure. Decisions are based on data, risk assessments, and verifiable facts.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-shrink-0 mt-1"><Activity className="text-amber-600 h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">System Thinking</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">Problems aren't isolated. We look at the whole organism—your business—to find root causes.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-shrink-0 mt-1"><Globe className="text-amber-600 h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Planetary Value</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">Compliance isn't just paperwork; it's about sustainable, safe, and ethical production.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-shrink-0 mt-1"><Heart className="text-amber-600 h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Risk-Based</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">We prioritize what matters most to the safety of your product and the survival of your business.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-amber-700 mb-4">Why "Clinic on Quality"?</h3>
              <p className="text-neutral-700 mb-4 leading-relaxed">
                Just as a doctor diagnoses a patient before prescribing medication, we diagnose your operational health before prescribing a system. 
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Most consultants offer a "one-size-fits-all" template. We offer a prescription for your specific risks.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;