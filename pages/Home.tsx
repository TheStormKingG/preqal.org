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
                <strong className="text-slate-800">You built something worth protecting.</strong><br /><br />
                Every business in Guyana and the Caribbean that stands strong today got there because someone — someone like you — decided to do things right. At <Link to="/about" className="text-amber-600 hover:text-amber-500 font-semibold underline">Preqal</Link>, we walk beside you on that journey. We bring the systems, the standards, and the expertise that turn your vision into something real and lasting — so your people stay safe, your clients stay confident, and your organisation keeps growing. Ready to see what that looks like for your business?
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
                <strong className="text-slate-800">And doing things right starts with the right foundation.</strong><br /><br />
                Preqal brings together quality, safety, and environmental responsibility into one unified structure — built around the way your business actually works. No confusion. No overwhelm. Just a clear, steady path forward, shaped by the same world-class standards that leading organisations across the globe rely on — including principles recognised by the <a href="https://asq.org/quality-resources/quality-management-system" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">American Society for Quality</a>. Because when your foundation is strong, everything you build on top of it lasts.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="ISO-ready documentation" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Every hero needs a map.</strong><br /><br />
                  Preqal writes the policies, procedures, and registers that guide your team — clearly, visually, and in language everyone understands. From the office to the frontline, your people will know exactly what to do, feel confident doing it, and take pride in doing it right.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Risk-based controls & legal compliance" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">And every great journey needs protection.</strong><br /><br />
                  The businesses that endure are the ones that see risk coming before it arrives. Preqal identifies every threat to your quality, safety, and environment — then builds the controls that keep you covered and compliant. So instead of worrying about what could go wrong, you stay free to focus on everything going right.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Audits, CAPA, and continual improvement" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">The best stories never stop improving.</strong><br /><br />
                  Preqal's audit and improvement systems make sure your business keeps moving forward. We find the gaps, fix the problems, and build the habits that carry your organisation further — stronger every year, sharper every season. Because this chapter isn't just about where you are today. It's about who you're becoming.
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
                <strong className="text-slate-800">Every transformation has a moment when it all clicks.</strong><br /><br />
                The Preqal System is that moment for your business. Our six-phase approach takes what you already have and turns it into something powerful — a quality, safety, and environmental programme that doesn't just meet the standard. It sets it. And you'll feel the difference from day one.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-2">
              <CollapsibleSection title="Rapid diagnostic" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Your journey begins with clarity.</strong><br /><br />
                  Preqal takes an honest, expert look at where your business stands today — what's working, what's missing, and where the risk is hiding. Within seven days, you receive a simple, prioritised <Link to="/book" className="text-amber-600 hover:text-amber-500 font-semibold underline">Red Flag Report</Link> that shows you exactly where to focus. No jargon. No guesswork. Just a clear picture — and the confidence to move forward.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Build and implement in phases" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Then we build it together.</strong><br /><br />
                  Preqal designs your entire system and puts it in place — step by step, at a pace that works for your team. The right structures. The right documents. The right training. Nothing rushed, nothing skipped. Just steady, guided progress that leaves your people feeling capable, and your business feeling ready for anything.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Verify effectiveness" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">And we make sure it holds.</strong><br /><br />
                  Once your system is in place, Preqal stays with you — tracking your progress, running audits, and reviewing results so you always know it's working. Because the goal was never just to pass an inspection. The goal was for you to run a business you're genuinely proud of — and to keep getting better, long after the work is done.
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
                You shouldn't have to piece together your compliance journey alone. Preqal offers every service a growing business needs — from your first diagnostic to full system certification — so you always have an expert in your corner.
              </p>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="max-w-3xl space-y-2 mb-8">
            <CollapsibleSection title="Integrated management system design" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                Preqal architects a unified framework that brings your quality, safety, and environmental processes together — removing duplication, closing gaps, and giving your organisation one clear standard to operate by.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Training for frontline teams" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                Preqal delivers practical, role-specific training that builds real confidence at every level of your organisation — so your team doesn't just understand the system. They own it.
              </p>
            </CollapsibleSection>
            <CollapsibleSection title="Audit readiness and certification support" headingLevel="h3">
              <p className="text-base text-slate-600 leading-relaxed">
                Preqal prepares you thoroughly — mock inspections, evidence trails, performance tracking — so that when the moment comes, you don't just pass. You demonstrate exactly the kind of organisation you've worked so hard to become.
              </p>
            </CollapsibleSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Quality Risk Scan™", icon: <AlertTriangle />, desc: "Not sure where the gaps are? The Quality Risk Scan™ gives you a prioritised Red Flag Report and a clear roadmap — all within seven days. It's the fastest way to see exactly where you stand and exactly what to do next.", link: "/book", linkText: "Book Scan" },
              { title: "IMS Design & Setup", icon: <Settings />, desc: "Preqal architects your entire Integrated Management System from the ground up — policy, process, and digital infrastructure — so your business runs on a foundation you can trust.", link: "/services", linkText: "Learn More" },
              { title: "SOP & Procedure Development", icon: <FileText />, desc: "Preqal develops visual SOPs, flowcharts, and checklists your frontline teams can actually use — in plain language, mobile-friendly formats that make doing things right feel natural.", link: "/services", linkText: "Learn More" }
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
                  Businesses across Guyana and the Caribbean — in every sector — have chosen to build something better. Preqal helps them get there: audit-ready in as little as 12 weeks, with stronger systems, safer teams, and the kind of operational confidence that opens doors.
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
              <strong className="text-slate-800">This is where your story changes.</strong><br /><br />
              If you've ever wondered whether your systems are truly protecting your business — this is how you find out. The Quality Risk Scan™ gives you a clear, expert assessment of your quality, safety, and ESG gaps within seven days. No pressure. No jargon. Just honest answers and a practical path forward — tailored to you.
            </p>

            <div className="max-w-3xl mx-auto space-y-2 text-left mb-8">
              <CollapsibleSection title="What you receive" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  A prioritised Red Flag Report highlighting your critical gaps, a strategic roadmap for your next steps, and actionable recommendations shaped around your specific risks. For teams new to systems thinking, a short <a href="https://www.youtube.com/watch?v=O5T4H8K_rwQ" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">explainer video</a> helps bring it all to life.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="Who it's for" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Any organisation preparing for ISO certification, a regulatory inspection, or a client audit — whether you're starting fresh or strengthening what you already have. If you want to run a tighter, safer, more confident business, this is for you.
                </p>
              </CollapsibleSection>
              <CollapsibleSection title="How to start" headingLevel="h3">
                <p className="text-base text-slate-600 leading-relaxed">
                  Book your Risk Scan today. We'll deliver your diagnostic within seven days — on-site or virtually, wherever you are across Guyana and the Caribbean.
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
