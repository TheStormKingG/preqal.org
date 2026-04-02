import React from 'react';
import { Microscope, Activity, Globe, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const About: React.FC = () => {
  return (
    <>
      <SEO pageKey="about" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Preqal — Clinic on Quality™</h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-4">
              Preqal specializes in Quality and Compliance Systems for all sectors,<br />from small shops to large corporations.
            </p>
            <p className="text-sm text-slate-400 font-medium">
              Founded and led by Dr. Stefan Gravesande, MBBS.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Founder Side */}
            <div className="md:col-span-4">
              <div className="neu-card rounded-2xl p-8 sticky top-24 animate-fade-in-up delay-100">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-amber-500/20 p-1 neu-pressed">
                  <picture>
                    <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.avif 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.avif 256w`} sizes="128px" />
                    <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp 128w, ${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-256.webp 256w`} sizes="128px" />
                    <img src={`${import.meta.env.BASE_URL}Stefan%20Signature-3%20(5)-128.webp`} alt="Preqal founder Dr. Gravesande" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" decoding="async" width="128" height="128" />
                  </picture>
                </div>
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-900">Dr. Gravesande</h2>
                <p className="text-amber-600 text-center text-xs font-bold mb-6 uppercase tracking-wider whitespace-nowrap">Medical Leadership → Systems Engineer</p>

                <div className="border-t border-slate-200/50 pt-6">
                  <CollapsibleSection title="Background & Experience" headingLevel="h3">
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                      <p>Transitioning from a strong medical foundation into industrial quality and systems engineering, Dr. Gravesande applies a diagnostic, evidence-based mindset to operational excellence.</p>
                      <p>He currently leads the development of Integrated Management Systems (IMS) from the ground up for multiple firms, aligning operations with ISO 9001, ISO 14001, and ISO 45001.</p>
                      <p>He is also the architect of national-scale quality frameworks across agriculture, food production, and environmental systems — building the kind of institutional infrastructure that doesn't just protect businesses, but safeguards communities, ecosystems, and the long-term health of an entire nation.</p>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            </div>

            {/* Philosophy Content */}
            <div className="md:col-span-8 space-y-12 animate-fade-in-up delay-200">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-amber-500 pl-4">Our Philosophy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Microscope className="text-amber-600 h-6 w-6" />, title: "Evidence-Driven", desc: "We don't guess. We measure. Decisions are based on data, risk assessments, and verifiable facts." },
                    { icon: <Activity className="text-amber-600 h-6 w-6" />, title: "System Thinking", desc: "Problems aren't isolated. We look at the whole organism—your business—to find root causes." },
                    { icon: <Globe className="text-amber-600 h-6 w-6" />, title: "Planetary Value", desc: "Compliance isn't just paperwork; it's about sustainable, safe, and ethical production." },
                    { icon: <Heart className="text-amber-600 h-6 w-6" />, title: "Risk-Based", desc: "We prioritize what matters most to the safety of your product and the survival of your business." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 p-5 rounded-2xl neu-card hover:neu-raised transition-all duration-300">
                      <div className="flex-shrink-0 mt-1 p-2 rounded-lg neu-pressed-sm">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="neu-raised rounded-2xl p-8 border-l-4 border-amber-500">
                <h3 className="text-xl font-bold text-amber-700 mb-4">Why "Clinic on Quality"?</h3>
                <CollapsibleSection title="Our diagnostic approach" headingLevel="h3" defaultOpen={true}>
                  <div className="space-y-4 text-slate-700 leading-relaxed">
                    <p>Just as a doctor diagnoses a patient before prescribing medication, we diagnose your operational health before prescribing a system.</p>
                    <p>Most consultants offer a one-size-fits-all template. We offer a prescription tailored to your specific risks.</p>
                    <p>We examine your processes with the same precision used in clinical assessment—symptoms, patterns, and underlying causes. This approach ensures solutions are targeted, restorative, and designed to strengthen long-term organizational resilience.</p>
                  </div>
                </CollapsibleSection>
                <p className="font-bold italic text-amber-700 text-right mt-4" style={{ fontSize: '1.0125rem' }}>
                  ...we care for Businesses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
