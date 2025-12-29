import React from 'react';
import { Map, Recycle, Truck, Factory, Droplet, Feather, ShieldAlert, Activity, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const caseStudies = [
  {
    sector: "Poultry Hatchery",
    icon: <Feather className="h-6 w-6 text-amber-600" />,
    challenge: "Limited traceability and repeated audit observations affecting both product quality and animal welfare.",
    solution: "Implemented structured SOPs, IMS documentation, traceability system, and staff competency programs.",
    result: "Traceability improved across all production stages, compliance readiness noticeably elevated, and repeat audit findings significantly reduced.",
    color: "border-l-amber-500"
  },
  {
    sector: "Logistics Distribution",
    icon: <Truck className="h-6 w-6 text-blue-600" />,
    challenge: "Inadequate documentation, safety gaps, and inconsistent use of temperature and delivery records.",
    solution: "Designed tailored documentation system, risk register, inspection checklists, and training module on operational controls.",
    result: "Better process consistency, improved worker safety compliance, and a marked reduction in customer escalations and delivery errors.",
    color: "border-l-blue-500"
  },
  {
    sector: "Development of Stashway™",
    icon: null, // Special case: will use logo image instead
    logo: "stashway-logo.png",
    challenge: "Managing personal finances in Guyana required tracking bank accounts, cash, receipts, and spending patterns without GYD-specific tools.",
    solution: "Developed Stashway™ with cash tracking, AI receipt scanning, analytics dashboards, exports, and conversational insights.",
    result: "Clear financial visibility, automated data capture, improved spending awareness, better decisions, and locally relevant personal finance control.",
    color: "border-l-purple-500",
    externalLink: "https://stashway.app/about"
  },
  {
    sector: "Oil & Gas Services Contractor",
    icon: <Droplet className="h-6 w-6 text-neutral-800" />,
    challenge: "Informal risk controls, weak safety culture, and absent PPE enforcement and corrective action tracking.",
    solution: "Developed QHSE mini-IMS, set up risk registers, PPE tracking system, safety induction checklist, and observation reporting.",
    result: "Stronger safety awareness, more consistent PPE usage, and a meaningful improvement in HSE audit readiness.",
    color: "border-l-neutral-800"
  },
  {
    sector: "Waste / Environmental Processing",
    icon: <Recycle className="h-6 w-6 text-green-600" />,
    challenge: "No structured compliance documentation, unclear waste segregation practices, and minimal monitoring.",
    solution: "Built ISO 14001-style waste management controls, legal compliance register, and internal audit process.",
    result: "Waste handling practices improved in consistency, regulatory compliance strengthened, and legal exposure noticeably reduced.",
    color: "border-l-green-500"
  }
];

const industries = [
  { name: "Logistics & Transport", icon: <Truck className="h-8 w-8 text-orange-500" /> },
  { name: "Oil & Gas Services", icon: <Droplet className="h-8 w-8 text-neutral-700" /> },
  { name: "Waste & Environmental", icon: <Recycle className="h-8 w-8 text-green-600" /> },
  { name: "Agri-Food Sector", icon: <Factory className="h-8 w-8 text-yellow-600" /> },
  { name: "Regional Poultry Group", icon: <Feather className="h-8 w-8 text-amber-600" /> },
  { name: "Hospitality & Eco-Tourism", icon: <Map className="h-8 w-8 text-teal-600" /> },
];

const CaseStudies: React.FC = () => {
  return (
    <>
      <SEO pageKey="caseStudies" />
      <div className="min-h-screen pb-20">
      {/* Header - Dark for Contrast with Seamless Fade and Pattern */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] text-white py-24 pb-32 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up relative z-10">
          <div className="inline-flex items-center space-x-2 bg-neutral-800 border border-neutral-700 text-amber-500 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
            <span className="tracking-wide">Client Confidentiality Intact</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Case Studies — Real Impact</h1>
          <p className="text-xl text-neutral-400 max-w-3xl leading-relaxed mb-8">
            We support poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations across Guyana and the Caribbean.
          </p>
          <div className="p-4 bg-neutral-800/50 border-l-4 border-amber-500 rounded-r-lg max-w-2xl">
            <p className="text-sm text-neutral-400 italic">
              To protect confidentiality and competitive advantage, we do not reveal client names. Instead, we share sector-based examples showing real challenges and measurable improvements.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        
        {/* Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
          {caseStudies.map((study, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg shadow-neutral-200/50 border border-neutral-200 hover:border-amber-500/30 hover:shadow-xl hover:shadow-neutral-200/60 transition-all duration-300 p-8 flex flex-col h-full animate-fade-in-up delay-${(index % 3) * 100} border-l-4 ${study.color}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {study.logo ? (
                    <a 
                      href={study.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 group"
                    >
                      <picture>
                        {study.logo === 'stashway-logo.png' && (
                          <>
                            <source 
                              type="image/avif" 
                              srcSet={`
                                ${import.meta.env.BASE_URL}stashway-logo-200.avif 200w,
                                ${import.meta.env.BASE_URL}stashway-logo-400.avif 400w
                              `}
                              sizes="(max-width: 640px) 200px, 400px"
                            />
                            <source 
                              type="image/webp" 
                              srcSet={`
                                ${import.meta.env.BASE_URL}stashway-logo-200.webp 200w,
                                ${import.meta.env.BASE_URL}stashway-logo-400.webp 400w
                              `}
                              sizes="(max-width: 640px) 200px, 400px"
                            />
                          </>
                        )}
                        <img 
                          src={study.logo === 'stashway-logo.png' 
                            ? `${import.meta.env.BASE_URL}stashway-logo-400.webp`
                            : `${import.meta.env.BASE_URL}${study.logo}`
                          }
                          alt="Stashway Logo" 
                          className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95"
                          width="24"
                          height="24"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </a>
                  ) : (
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">{study.icon}</div>
                  )}
                  {study.externalLink ? (
                    <a 
                      href={study.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-neutral-900 text-lg group/title transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 inline-block"
                    >
                      {study.sector}
                    </a>
                  ) : (
                    <h3 className="font-bold text-neutral-900 text-lg">{study.sector}</h3>
                  )}
                </div>
              </div>
              
              <div className="space-y-6 flex-grow">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">The Challenge</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">{study.challenge}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Our Solution</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {study.solution.split('Stashway™').map((part, idx, arr) => 
                      idx === arr.length - 1 ? part : (
                        <React.Fragment key={idx}>
                          {part}
                          <a 
                            href={study.externalLink || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block text-amber-600 hover:text-amber-500 font-semibold underline transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95"
                          >
                            Stashway<sup className="text-[0.6em]">™</sup>
                          </a>
                        </React.Fragment>
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">The Result</h4>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-neutral-900 font-medium text-sm leading-relaxed">
                    {study.result.split('Stashway™').map((part, idx, arr) => 
                      idx === arr.length - 1 ? part : (
                        <React.Fragment key={idx}>
                          {part}
                          <a 
                            href={study.externalLink || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block text-amber-600 hover:text-amber-500 font-semibold underline transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95"
                          >
                            Stashway<sup className="text-[0.6em]">™</sup>
                          </a>
                        </React.Fragment>
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Call to Action Card */}
          <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 p-8 flex flex-col justify-center items-center text-center h-full animate-fade-in-up delay-500">
             <h3 className="text-2xl font-bold text-white mb-4">Ready to be our next success story?</h3>
             <p className="text-neutral-400 mb-8">Let's audit your risks and build a roadmap to compliance.</p>
             <Link to="/book" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-full transition-colors w-full sm:w-auto">
               Start Your Risk Scan
             </Link>
          </div>
        </div>

        {/* Industry Logo Wall */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Industries We Serve</h2>
            <p className="text-neutral-500 text-sm">Deploying quality systems across diverse operational landscapes.</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-10 border border-neutral-200 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center items-center">
              {industries.map((ind, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-default">
                  <div className="w-16 h-16 bg-[#f6f8fb] rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-50 transition-colors duration-300">
                    {ind.icon}
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 text-center group-hover:text-amber-600 transition-colors">{ind.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CaseStudies;