import React from 'react';
import { Map, Recycle, Truck, Factory, Droplet, Feather, ShieldAlert, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const caseStudies = [
  { sector: "Poultry Hatchery", icon: <Feather className="h-6 w-6 text-amber-600" />, challenge: "Limited traceability and repeated audit observations affecting both product quality and animal welfare.", solution: "Implemented structured SOPs, IMS documentation, traceability system, and staff competency programs.", result: "Traceability improved across all production stages, compliance readiness noticeably elevated, and repeat audit findings significantly reduced." },
  { sector: "Logistics Distribution", icon: <Truck className="h-6 w-6 text-blue-600" />, challenge: "Inadequate documentation, safety gaps, and inconsistent use of temperature and delivery records.", solution: "Designed tailored documentation system, risk register, inspection checklists, and training module on operational controls.", result: "Better process consistency, improved worker safety compliance, and a marked reduction in customer escalations and delivery errors." },
  { sector: "Development of Stashway™", icon: null, logo: "stashway-logo-400.webp", challenge: "Managing personal finances in Guyana required tracking bank accounts, cash, receipts, and spending patterns without GYD-specific tools.", solution: "Developed Stashway™ with cash tracking, AI receipt scanning, analytics dashboards, exports, and conversational insights.", result: "Clear financial visibility, automated data capture, improved spending awareness, better decisions, and locally relevant personal finance control.", externalLink: "https://stashway.app/about" },
  { sector: "Oil & Gas Services Contractor", icon: <Droplet className="h-6 w-6 text-slate-800" />, challenge: "Informal risk controls, weak safety culture, and absent PPE enforcement and corrective action tracking.", solution: "Developed QHSE mini-IMS, set up risk registers, PPE tracking system, safety induction checklist, and observation reporting.", result: "Stronger safety awareness, more consistent PPE usage, and a meaningful improvement in HSE audit readiness." },
  { sector: "Waste / Environmental Processing", icon: <Recycle className="h-6 w-6 text-green-600" />, challenge: "No structured compliance documentation, unclear waste segregation practices, and minimal monitoring.", solution: "Built ISO 14001-style waste management controls, legal compliance register, and internal audit process.", result: "Waste handling practices improved in consistency, regulatory compliance strengthened, and legal exposure noticeably reduced." }
];

const industries = [
  { name: "Logistics & Transport", icon: <Truck className="h-8 w-8 text-orange-500" /> },
  { name: "Oil & Gas Services", icon: <Droplet className="h-8 w-8 text-slate-700" /> },
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
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 neu-pressed-sm text-amber-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              <ShieldAlert className="h-4 w-4" />
              <span className="tracking-wide">Client Confidentiality Intact</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Case Studies — Real Impact</h1>
            <p className="text-xl text-slate-500 max-w-3xl leading-relaxed mb-8">
              You're not alone in this journey. Business owners across poultry, logistics, food-handling, eco-hospitality, oil & gas, and waste management operations in Guyana and the Caribbean have already taken the step you're considering — and their businesses are stronger for it. These are their stories.
            </p>
            <div className="p-4 neu-pressed rounded-xl max-w-2xl border-l-4 border-amber-500">
              <p className="text-sm text-slate-500 italic">
                To protect confidentiality, we share sector-based examples showing real challenges and measurable improvements.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-24">
            {caseStudies.map((study, index) => (
              <div key={index} className="neu-card rounded-2xl p-8 flex flex-col h-full animate-fade-in-up hover:neu-raised transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  {study.logo ? (
                    <a href={study.externalLink} target="_blank" rel="noopener noreferrer" className="p-2 neu-pressed-sm rounded-lg">
                      <picture>
                        <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}stashway-logo-200.webp 200w, ${import.meta.env.BASE_URL}stashway-logo-400.webp 400w`} sizes="24px" />
                        <img src={`${import.meta.env.BASE_URL}stashway-logo-400.webp`} alt="Stashway Logo" className="h-6 w-6" width="24" height="24" loading="lazy" decoding="async" />
                      </picture>
                    </a>
                  ) : (
                    <div className="p-2 neu-pressed-sm rounded-lg">{study.icon}</div>
                  )}
                  {study.externalLink ? (
                    <a href={study.externalLink} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 text-lg hover:text-amber-600 transition-colors">{study.sector}</a>
                  ) : (
                    <h3 className="font-bold text-slate-900 text-lg">{study.sector}</h3>
                  )}
                </div>

                <CollapsibleSection title="Challenge & Solution" headingLevel="h3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">The Challenge</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Our Solution</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{study.solution}</p>
                    </div>
                  </div>
                </CollapsibleSection>

                <div className="mt-auto pt-6">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">The Result</h4>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-800 font-medium text-sm leading-relaxed">{study.result}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div className="neu-raised-lg rounded-2xl p-8 flex flex-col justify-center items-center text-center h-full animate-fade-in-up">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to be our next success story?</h3>
              <p className="text-slate-500 mb-8">Let's audit your risks and build a roadmap to compliance.</p>
              <Link to="/book" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors neu-raised-sm w-full sm:w-auto text-center">
                Start Your Risk Scan
              </Link>
            </div>
          </div>

          {/* Industries */}
          <div className="mb-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Industries We Serve</h2>
              <p className="text-slate-500 text-sm">Deploying quality systems across diverse operational landscapes.</p>
            </div>
            <div className="neu-raised rounded-2xl p-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center items-center">
                {industries.map((ind, idx) => (
                  <div key={idx} className="flex flex-col items-center group cursor-default">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 neu-pressed group-hover:neu-raised-sm transition-all duration-300">
                      {ind.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 text-center group-hover:text-amber-600 transition-colors">{ind.name}</span>
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
