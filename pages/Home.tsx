import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, AlertTriangle, FileText, BarChart3, Users, Settings, Leaf, Download } from 'lucide-react';
const MaturityChart = React.lazy(() => import('../components/MaturityChart').then(module => ({ default: module.default })));
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const data = [
  { name: 'Month 1', score: 45 },
  { name: 'Month 2', score: 55 },
  { name: 'Month 3', score: 70 },
  { name: 'Month 4', score: 85 },
  { name: 'Month 5', score: 92 },
  { name: 'Month 6', score: 98 },
];

const ProcessStep: React.FC<{ title: string; desc: string; longDesc: string; icon: React.ReactNode; delay: string }> = ({ title, desc, longDesc, icon, delay }) => (
  <div className={`flex flex-col items-center text-center p-5 group cursor-pointer rounded-2xl transition-all duration-300 animate-fade-in-up ${delay} neu-card hover:neu-raised`}>
    <div className="p-4 rounded-full mb-4 text-amber-600 neu-pressed">
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
    <p className="text-xs text-slate-500 mb-2">{desc}</p>
    <p className="text-xs text-slate-600 leading-relaxed">{longDesc}</p>
  </div>
);

const Home: React.FC = () => {
  return (
    <>
      <SEO pageKey="home" />
      <div className="w-full overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-7 pb-12 lg:pt-10 lg:pb-16 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center mb-6">
                <span className="inline-flex items-center space-x-2 neu-pressed-sm px-4 py-1.5 rounded-full text-xs font-semibold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="tracking-wide">ISO-Aligned & Risk-Based</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-slate-900">
                Preqal: Evidence-Driven Quality, Safety & ESG Systems <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Integrated.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Preqal builds ISO-aligned <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">quality management systems</Link>, <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">safety management systems</Link>, and <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">ESG programs</Link> for businesses across Guyana and the Caribbean. Our <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">integrated management system (IMS)</Link> approach combines ISO 9001 quality management, ISO 45001 safety management, and ISO 14001 environmental management standards to help organizations move from chaos to compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book" className="inline-flex justify-center items-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all duration-300 neu-raised-sm">
                  Get a Risk Scan <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/case-studies" className="inline-flex justify-center items-center px-8 py-4 text-slate-700 font-semibold rounded-xl transition-all duration-300 neu-card hover:neu-raised">
                  View Case Studies
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="neu-raised-lg rounded-3xl overflow-hidden">
                <picture>
                  <source type="image/avif" srcSet={`${import.meta.env.BASE_URL}Image1-480.avif 480w, ${import.meta.env.BASE_URL}Image1-768.avif 768w, ${import.meta.env.BASE_URL}Image1-1024.avif 1024w, ${import.meta.env.BASE_URL}Image1-1280.avif 1280w`} sizes="(max-width: 1024px) 768px, 1200px" />
                  <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Image1-480.webp 480w, ${import.meta.env.BASE_URL}Image1-768.webp 768w, ${import.meta.env.BASE_URL}Image1-1024.webp 1024w, ${import.meta.env.BASE_URL}Image1-1280.webp 1280w`} sizes="(max-width: 1024px) 768px, 1200px" />
                  <img src={`${import.meta.env.BASE_URL}Image1-1280.webp`} alt="Stabroek Market Clock Tower in Georgetown, Guyana - representing Preqal's local presence and commitment to quality systems in the Caribbean" width="1200" height="800" className="w-full h-full object-contain" loading="eager" fetchpriority="high" decoding="async" />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quality, Safety & ESG ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fade-in-up">
            <picture>
              <source type="image/webp" srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w`} sizes="(max-width: 640px) 200px, 400px" />
              <img src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp`} alt="Preqal logo - Quality, Safety & ESG Systems" width="400" height="160" className="mx-auto mb-6 h-20 w-auto" loading="eager" decoding="async" />
            </picture>
            <div className="max-w-3xl mx-auto text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Quality, Safety & ESG Management Systems</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Preqal specializes in developing comprehensive ISO-aligned <strong>quality management systems</strong>, <strong>safety management systems</strong>, and <strong>ESG programs</strong> for businesses across Guyana and the Caribbean. Our <strong>integrated management system (IMS)</strong> framework combines quality, safety, and ESG reporting into a unified operational structure. Our approach aligns with internationally recognized quality management principles, such as those outlined by the <a href="https://asq.org/quality-resources/quality-management-system" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">American Society for Quality (ASQ)</a>.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="ISO-ready documentation" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  We develop policies, Standard Operating Procedures (SOPs), and registers that align with ISO 9001, ISO 14001, and ISO 45001 requirements. Our documentation is practical, visual, and designed for frontline teams to use effectively.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Risk-based controls & legal compliance" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Our integrated management systems prioritize critical risks and ensure your organization meets regulatory requirements. We help you identify, assess, and control risks across quality, safety, and environmental processes.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Audits, CAPA, and continual improvement" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  We establish audit programs, Corrective and Preventive Action (CAPA) processes, and management review systems that drive continuous improvement. Our approach ensures your management system evolves with your business needs.
                </p>
              </CollapsibleSection>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Explore Our Services</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/about" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Learn About Preqal</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Contact Us</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <Link to="/preqal-not-prequel" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">Preqal (Not Prequel)</Link>
              <span className="hidden sm:inline text-slate-400">•</span>
              <a href="https://www.iso.org/iso-9001-quality-management.html" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline py-2 px-2">ISO 9001 Standards</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Indicators ── */}
      <section className="py-10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neu-raised rounded-3xl py-8 px-6">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8 text-center">Aligned with Global Standards</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6">
              {[
                { icon: <CheckCircle2 className="text-amber-500" />, label: 'ISO 9001' },
                { icon: <CheckCircle2 className="text-amber-500" />, label: 'ISO 45001' },
                { icon: <CheckCircle2 className="text-amber-500" />, label: 'ISO 14001' },
                { icon: <CheckCircle2 className="text-amber-500" />, label: 'HACCP' },
                { icon: <Leaf className="text-amber-500" />, label: 'Climate-Friendliness' },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-2 text-lg font-bold text-slate-700 neu-pressed-sm px-4 py-2 rounded-xl">
                  {item.icon}<span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 animate-fade-in-up">
            <div className="max-w-3xl mx-auto text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How We Work</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                The Preqal System is a proven methodology that transforms operational data into strategic authority. Our six-phase approach ensures your <strong>quality management system</strong>, <strong>safety management system</strong>, and <strong>ESG program</strong> are not just compliant, but drive measurable business results.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="Rapid diagnostic" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  We start with a comprehensive <Link to="/book" className="text-amber-600 hover:text-amber-500 font-semibold underline">risk scan</Link> that identifies critical gaps in your current systems. This rapid diagnostic assessment evaluates your operations against ISO standards and regulatory requirements, delivering a prioritized Red Flag Report within seven days.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Build and implement in phases" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  We architect your Integrated Management System and implement it in manageable phases. This includes designing system architecture, developing documentation, establishing processes, and training your team to ensure smooth adoption.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Verify effectiveness" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  We establish Key Performance Indicators (KPIs), conduct internal audits, and prepare management reviews to verify your system's effectiveness. Our approach ensures continuous monitoring and improvement of your quality, safety, and ESG performance.
                </p>
              </CollapsibleSection>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <ProcessStep title="Assess" desc="Risk Scan" longDesc="Comprehensive diagnostic to identify critical gaps." icon={<AlertTriangle size={36} />} delay="delay-0" />
            <ProcessStep title="Design" desc="IMS Architecture" longDesc="Unified framework for quality, safety, and environmental processes." icon={<Settings size={36} />} delay="delay-100" />
            <ProcessStep title="Implement" desc="SOPs & Docs" longDesc="Clear, actionable documentation for frontline teams." icon={<FileText size={36} />} delay="delay-200" />
            <ProcessStep title="Train" desc="Competency" longDesc="Targeted training at all organizational levels." icon={<Users size={36} />} delay="delay-300" />
            <ProcessStep title="Monitor" desc="Audit Prep" longDesc="Continuous monitoring and external audit preparation." icon={<BarChart3 size={36} />} delay="delay-300" />
            <ProcessStep title="Improve" desc="Optimization" longDesc="Data-driven continuous improvement initiatives." icon={<ArrowRight size={36} />} delay="delay-500" />
          </div>
        </div>
      </section>

      {/* ── Core Services ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Our Core Services</h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                Comprehensive quality management, safety management, and compliance services designed for operational excellence.
              </p>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="max-w-3xl space-y-2 mb-8">
            <CollapsibleSection title="Integrated management system design" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                We architect unified management systems that combine quality, safety, and environmental processes into a single, efficient framework. Our IMS design reduces duplication and ensures consistent compliance across all standards.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Training for frontline teams" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                We deliver targeted training programs that build competency at all organizational levels. Our training is practical, role-specific, and designed to ensure your team can effectively execute quality, safety, and environmental controls.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Audit readiness and certification support" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                We prepare your organization for external audits through mock inspections, evidence trail strengthening, and performance tracking. Our support helps you achieve ISO certification and maintain continuous compliance.
              </p>
            </CollapsibleSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Quality Risk Scan™", icon: <AlertTriangle />, desc: "Rapid diagnostic to identify gaps in your current system. You receive a prioritized \"Red Flag Report\" and a roadmap for strengthening controls.", link: "/book", linkText: "Book Scan" },
              { title: "IMS Design & Setup", icon: <Settings />, desc: "We architect your Integrated Management System from the ground up, including policy formulation, process mapping, and digital infrastructure.", link: "/services", linkText: "Learn More" },
              { title: "SOP & Procedure Development", icon: <FileText />, desc: "Visual SOPs, flowcharts, and checklists that frontline teams can actually use, in mobile-friendly formats.", link: "/services", linkText: "Learn More" }
            ].map((card, i) => (
              <div key={i} className="neu-card rounded-2xl p-8 group hover:neu-raised transition-all duration-300">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-6 text-amber-600 neu-pressed">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{card.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{card.desc}</p>
                <Link to={card.link} className="text-amber-600 font-bold hover:text-amber-500 flex items-center text-sm uppercase tracking-wide">{card.linkText} <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/services" className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-500">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who We Help / Maturity ── */}
      <section className="py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neu-raised-lg rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1 neu-pressed-sm text-amber-600 rounded-full text-xs font-semibold mb-4 tracking-wider">PROVEN OUTCOMES</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">Who We Help</h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  Preqal serves businesses across diverse sectors in Guyana and the Caribbean. We help organizations build quality management systems, safety management systems, and ESG programs that drive real operational improvements.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Audit-readiness typically achieved in 12 weeks', 'Sustainable reduction in non-conformances', 'Enhanced traceability & risk visibility'].map((item) => (
                    <li key={item} className="flex items-center space-x-3 text-slate-700">
                      <CheckCircle2 className="text-amber-500 h-5 w-5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/case-studies" className="inline-flex items-center bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors neu-raised-sm">
                  See Industry Examples
                </Link>
              </div>
              <div className="neu-pressed rounded-2xl p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">Average Maturity Growth</h3>
                  <span className="text-amber-500 font-mono text-xs animate-pulse">● Live Projection</span>
                </div>
                <div className="h-64 w-full min-h-[256px]">
                  <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-400">Loading chart...</div>}>
                    <MaturityChart data={data} />
                  </React.Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Free Resource Package ── */}
      <section className="py-16 relative text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto neu-raised-lg rounded-3xl overflow-visible animate-fade-in-up p-6 md:p-12">
            <div className="inline-flex items-center justify-center p-4 rounded-full mb-6 neu-pressed">
              <Download className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Free Resource Package</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">5 ready-to-use compliance templates — download instantly after a quick form.</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs mb-8">
              {['Document Masterlist', 'QHSE Policy', 'Document Control', 'Risk Register', 'Training Register'].map((t) => (
                <span key={t} className="neu-pressed-sm px-3 py-1.5 rounded-lg text-slate-600">{t}</span>
              ))}
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center justify-center px-4 py-3 md:px-8 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm md:text-lg rounded-xl transition-all duration-300 neu-raised-sm w-full md:w-auto"
            >
              Download Free Templates <Download className="ml-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Get a Risk Scan ── */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get a Risk Scan</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Ready to identify gaps in your quality management system, safety management system, or ESG program? Our Quality Risk Scan™ provides a rapid seven-day diagnostic assessment.
            </p>

            <div className="max-w-3xl mx-auto space-y-2 text-left mb-8">
              <CollapsibleSection title="What you receive" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  You'll receive a prioritized Red Flag Report that highlights critical gaps in your systems, plus a strategic roadmap for strengthening your integrated management system. The report includes actionable recommendations tailored to your specific risks. For teams new to systems-based thinking, this <a href="https://www.youtube.com/watch?v=O5T4H8K_rwQ" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">short explainer video on systems-based management</a> helps illustrate how structured management systems reduce operational chaos.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Who it's for" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Our Risk Scan is ideal for organizations of any size preparing for ISO certification, regulatory inspections, or client audits. Whether you're starting from scratch or improving existing systems, we help you identify what matters most.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="How to start" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Book your Risk Scan today and receive your diagnostic assessment within seven days. Our rapid assessment can be conducted on-site or virtually, making it accessible to businesses across Guyana and the Caribbean.
                </p>
              </CollapsibleSection>
            </div>

            <Link to="/book" className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all duration-300 neu-raised-sm">
              Book Your Risk Scan Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              Learn more about our <Link to="/services" className="text-amber-600 hover:text-amber-500 underline">comprehensive services</Link> or explore <Link to="/case-studies" className="text-amber-600 hover:text-amber-500 underline">real success stories</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Disambiguation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-xs text-slate-400">Preqal is a brand name and not the word "prequel".</p>
      </div>
    </div>
    </>
  );
};

export default Home;
