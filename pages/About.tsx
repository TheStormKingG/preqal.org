import React, { useState } from 'react';
import { Microscope, Activity, Globe, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const About: React.FC = () => {
  const [bioExpanded, setBioExpanded] = useState(false);

  return (
    <>
      <SEO pageKey="about" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Preqal — Clinic on Quality™</h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-4">
              You deserve more than a template. Preqal works with businesses of every size — from small shops to large corporations — to build quality and compliance systems that are designed specifically around you, your risks, and your goals.
            </p>
            <p className="text-sm text-slate-400 font-medium">
              Founded and led by Dr. Stefan Gravesande, MBBS.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Founder Side — flex column so hexagon fills remaining space */}
            <div className="md:col-span-4 flex flex-col min-w-0 overflow-hidden">
              <div className="neu-card rounded-2xl p-8 animate-fade-in-up delay-100">
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
                  <CollapsibleSection title="Background & Experience" headingLevel="h3" onToggle={(open) => setBioExpanded(open)}>
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                      <p>Transitioning from a strong medical foundation into industrial quality and systems engineering, Dr. Gravesande applies a diagnostic, evidence-based mindset to operational excellence.</p>
                      <p>He currently leads the development of Integrated Management Systems (IMS) from the ground up for multiple firms, aligning operations with ISO 9001, ISO 14001, and ISO 45001.</p>
                      <p>He is also the architect of national-scale quality frameworks across agriculture, food production, and environmental systems — building the kind of institutional infrastructure that doesn't just protect businesses, but safeguards communities, ecosystems, and the long-term health of an entire nation.</p>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>

              {/* Hexagon watermark — fills remaining space below card */}
              <div
                className={`hidden md:flex flex-1 items-center justify-center pointer-events-none transition-all duration-700 ease-in-out ${
                  bioExpanded ? 'opacity-0 -translate-y-12 scale-90' : 'opacity-100 translate-y-0 scale-100'
                }`}
                aria-hidden="true"
              >
                <img
                  src={`${import.meta.env.BASE_URL}favicon.png`}
                  alt=""
                  className="w-44 h-44 opacity-[0.07] select-none"
                  draggable="false"
                />
              </div>
            </div>

            {/* Philosophy + Clinic Content */}
            <div className="md:col-span-8 space-y-12 animate-fade-in-up delay-200">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-amber-500 pl-4">Our Philosophy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Microscope className="text-amber-600 h-6 w-6" />, title: "Evidence-Driven", desc: "You'll never be asked to act on guesswork. Every recommendation Preqal makes is grounded in data, risk assessments, and verifiable facts — so every decision you make is one you can stand behind with confidence." },
                    { icon: <Activity className="text-amber-600 h-6 w-6" />, title: "Systems Thinking", desc: "Your business isn't a collection of separate problems. It's a living system. Preqal looks at the whole picture — finding the root causes that others miss — so the solutions you get actually hold." },
                    { icon: <Globe className="text-amber-600 h-6 w-6" />, title: "Planetary Value", desc: "The standards you build today protect more than your bottom line. They protect your people, your community, and the world your business operates in. Compliance, done right, is an act of leadership." },
                    { icon: <Heart className="text-amber-600 h-6 w-6" />, title: "Risk-Based", desc: "Your time and resources are valuable. Preqal helps you focus them exactly where they matter most — on the risks that could affect the safety of your product and the future of everything you've built." },
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
                    <p>Just as the best doctors listen before they prescribe, Preqal examines your business before recommending a single solution. Your operational health — your processes, your patterns, your vulnerabilities — is assessed with clinical precision before anything is built.</p>
                    <p>Most consultants hand you a template and walk away. You get something different. You get a prescription written specifically for your business — targeted, restorative, and designed to make your organisation stronger from the inside out.</p>
                  </div>
                </CollapsibleSection>
                <p className="font-bold italic text-amber-700 text-right mt-4" style={{ fontSize: '1.0125rem' }}>
                  Because at Preqal, we don't just improve systems. We care for businesses.
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
