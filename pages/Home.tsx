import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, AlertTriangle, FileText, BarChart3, Users, Settings, Leaf } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SEO from '../components/SEO';
import { getServiceSchema } from '../seo/serviceSchema';

const data = [
  { name: 'Month 1', score: 45 },
  { name: 'Month 2', score: 55 },
  { name: 'Month 3', score: 70 },
  { name: 'Month 4', score: 85 },
  { name: 'Month 5', score: 92 },
  { name: 'Month 6', score: 98 },
];

const ProcessStep: React.FC<{ title: string; desc: string; longDesc: string; icon: React.ReactNode; delay: string }> = ({ title, desc, longDesc, icon, delay }) => (
  <div className={`flex flex-col items-center text-center p-4 group cursor-pointer hover:bg-white/80 rounded-xl transition-all duration-300 animate-fade-in-up ${delay} hover:shadow-xl hover:shadow-neutral-200/50`}>
    <div className="p-4 bg-white border border-neutral-200 text-amber-600 rounded-full mb-4 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-300 shadow-sm">
      {icon}
    </div>
    <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
    <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors mb-2">{desc}</p>
    <p className="text-xs text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors">{longDesc}</p>
  </div>
);

const Home: React.FC = () => {

  const serviceSchema = getServiceSchema();

  return (
    <>
      <SEO pageKey="home" />
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
      <div className="w-full overflow-x-hidden">
      {/* Hero Section - Transparent to show App background */}
      <section className="relative text-neutral-900 pt-7 pb-12 lg:pt-10 lg:pb-16 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-amber-500/30 text-amber-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="tracking-wide">ISO-Aligned & Risk-Based</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-neutral-900">
                Preqal: Evidence-Driven Quality, Safety & ESG Systems <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Integrated.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl leading-relaxed">
                Preqal builds ISO-aligned quality management systems, safety management systems, and ESG programs for businesses across Guyana and the Caribbean. Our integrated management system (IMS) approach combines ISO 9001 quality management, ISO 45001 safety management, and ISO 14001 environmental management standards to help organizations move from chaos to compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book" className="inline-flex justify-center items-center px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1">
                  Get a Risk Scan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/case-studies" className="inline-flex justify-center items-center px-8 py-4 bg-white/80 backdrop-blur hover:bg-white text-neutral-800 hover:text-black font-semibold rounded-lg border border-neutral-300 hover:border-amber-500 transition-all duration-300 shadow-sm">
                  View Case Studies
                </Link>
              </div>
            </div>
            
            {/* Right Side - Clock Tower Image */}
            <div className="relative hidden lg:block">
              <picture>
                <source 
                  type="image/webp" 
                  srcSet={`
                    ${import.meta.env.BASE_URL}Image1-640.webp 640w,
                    ${import.meta.env.BASE_URL}Image1-1200.webp 1200w,
                    ${import.meta.env.BASE_URL}Image1-1920.webp 1920w
                  `}
                  sizes="(max-width: 1024px) 640px, (max-width: 1920px) 1200px, 1920px"
                />
                <img 
                  src={`${import.meta.env.BASE_URL}Image1.png`}
                  alt="Stabroek Market Clock Tower in Georgetown, Guyana - representing Preqal's local presence and commitment to quality systems in the Caribbean"
                  width="600"
                  height="400"
                  className="w-full h-full object-contain object-right"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* What Preqal Builds - New Content Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <picture>
              <source 
                type="image/webp" 
                srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.webp`}
              />
              <img 
                src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9.png`}
                alt="Preqal logo - Quality, Safety & ESG Systems"
                width="200"
                height="80"
                className="mx-auto mb-6 h-20 w-auto"
                loading="eager"
                decoding="async"
              />
            </picture>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Quality, Safety & ESG Management Systems</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Preqal specializes in developing comprehensive ISO-aligned quality management systems, safety management systems, and ESG programs for businesses across Guyana and the Caribbean. Our integrated management system (IMS) framework combines quality, safety, and ESG reporting into a unified operational structure that reduces duplication, improves efficiency, and ensures regulatory compliance.
            </p>
            
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">ISO-ready documentation</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  We develop policies, Standard Operating Procedures (SOPs), and registers that align with ISO 9001, ISO 14001, and ISO 45001 requirements. Our documentation is practical, visual, and designed for frontline teams to use effectively.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Risk-based controls & legal compliance</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Our integrated management systems prioritize critical risks and ensure your organization meets regulatory requirements. We help you identify, assess, and control risks across quality, safety, and environmental processes.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Audits, CAPA, and continual improvement</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  We establish audit programs, Corrective and Preventive Action (CAPA) processes, and management review systems that drive continuous improvement. Our approach ensures your management system evolves with your business needs.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">Explore Our Services</Link>
              <span className="text-neutral-400">•</span>
              <Link to="/about" className="text-amber-600 hover:text-amber-500 font-semibold underline">Learn About Preqal</Link>
              <span className="text-neutral-400">•</span>
              <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline">Contact Us</Link>
              <span className="text-neutral-400">•</span>
              <Link to="/preqal-not-prequel" className="text-amber-600 hover:text-amber-500 font-semibold underline">Preqal (Not Prequel)</Link>
              <span className="text-neutral-400">•</span>
              <a href="https://www.iso.org/iso-9001-quality-management.html" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 font-semibold underline">ISO 9001 Standards</a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Text on Black with Gradients Above and Below */}
      <section className="relative py-0">
        {/* Top Gradient - fades from white to black */}
        <div className="h-16 bg-[linear-gradient(to_bottom,#f6f8fb_0%,transparent_0%,#171717_100%)]"></div>
        
        {/* Middle Section - Solid Black Background with Text */}
        <div className="relative bg-[#171717] py-8">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-10">Aligned with Global Standards & Trusted by Industry Leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-90 hover:opacity-100 transition-all duration-500">
               <div className="flex items-center space-x-2 text-xl font-bold text-neutral-300 hover:text-amber-500 transition-colors cursor-default"><CheckCircle2 className="text-amber-500"/><span>ISO 9001</span></div>
               <div className="flex items-center space-x-2 text-xl font-bold text-neutral-300 hover:text-amber-500 transition-colors cursor-default"><CheckCircle2 className="text-amber-500"/><span>ISO 45001</span></div>
               <div className="flex items-center space-x-2 text-xl font-bold text-neutral-300 hover:text-amber-500 transition-colors cursor-default"><CheckCircle2 className="text-amber-500"/><span>ISO 14001</span></div>
               <div className="flex items-center space-x-2 text-xl font-bold text-neutral-300 hover:text-amber-500 transition-colors cursor-default"><CheckCircle2 className="text-amber-500"/><span>HACCP</span></div>
               <div className="flex items-center space-x-2 text-xl font-bold text-neutral-300 hover:text-amber-500 transition-colors cursor-default"><Leaf className="text-amber-500"/><span>Climate-Friendliness</span></div>
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient - fades from black to white */}
        <div className="h-16 bg-[linear-gradient(to_bottom,#171717_0%,transparent_0%,#f6f8fb_100%)]"></div>
      </section>

      {/* Methodology Diagram - Transparent for Global Pattern */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">How We Work</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-8">
              The Preqal System is a proven methodology that transforms operational data into strategic authority. Our six-phase approach ensures your quality management system, safety management system, and ESG program are not just compliant, but drive measurable business results. From initial risk scan to continuous improvement, we guide organizations through every step of building an integrated management system that aligns with ISO 9001, ISO 14001, and ISO 45001 requirements.
            </p>
            
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Rapid diagnostic</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  We start with a comprehensive risk scan that identifies critical gaps in your current systems. This rapid diagnostic assessment evaluates your operations against ISO standards and regulatory requirements, delivering a prioritized Red Flag Report within seven days.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Build and implement in phases</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  We architect your Integrated Management System and implement it in manageable phases. This includes designing system architecture, developing documentation, establishing processes, and training your team to ensure smooth adoption.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Verify effectiveness</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  We establish Key Performance Indicators (KPIs), conduct internal audits, and prepare management reviews to verify your system's effectiveness. Our approach ensures continuous monitoring and improvement of your quality, safety, and ESG performance.
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[4.5rem] left-0 w-full h-0.5 bg-neutral-200 -z-10"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <ProcessStep 
                title="Assess" 
                desc="Risk Scan" 
                longDesc="We conduct comprehensive diagnostic assessments to identify critical gaps in your quality, safety, and compliance systems."
                icon={<AlertTriangle size={40} />} 
                delay="delay-0" 
              />
              <ProcessStep 
                title="Design" 
                desc="IMS Architecture" 
                longDesc="We architect your Integrated Management System from the ground up, creating a unified framework that aligns quality, environmental, and safety processes."
                icon={<Settings size={40} />} 
                delay="delay-100" 
              />
              <ProcessStep 
                title="Implement" 
                desc="SOPs & Docs" 
                longDesc="We develop clear, actionable Standard Operating Procedures and documentation that frontline teams can actually use effectively."
                icon={<FileText size={40} />} 
                delay="delay-200" 
              />
              <ProcessStep 
                title="Train" 
                desc="Competency" 
                longDesc="We deliver targeted training programs designed to build competency across all levels of your organization effectively."
                icon={<Users size={40} />} 
                delay="delay-300" 
              />
              <ProcessStep 
                title="Monitor" 
                desc="Audit Prep" 
                longDesc="We establish continuous monitoring systems and prepare your organization for external audits through mock inspections and performance tracking."
                icon={<BarChart3 size={40} />} 
                delay="delay-400" 
              />
              <ProcessStep 
                title="Improve" 
                desc="Optimization" 
                longDesc="We analyze performance data and implement continuous improvement initiatives that drive measurable enhancements in compliance and efficiency."
                icon={<ArrowRight size={40} />} 
                delay="delay-500" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Service Tiles - Transparent to show Global Pattern */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Our Core Services</h2>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                Preqal offers a comprehensive suite of quality management, safety management, and compliance services designed for operational excellence. Our services help organizations build robust integrated management systems (IMS) that meet ISO standards, regulatory requirements, and industry best practices. From rapid risk assessments to full system implementation, we provide the expertise and tools needed to achieve and maintain compliance.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Integrated management system design</h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    We architect unified management systems that combine quality, safety, and environmental processes into a single, efficient framework. Our IMS design reduces duplication and ensures consistent compliance across all standards.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Training for frontline teams</h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    We deliver targeted training programs that build competency at all organizational levels. Our training is practical, role-specific, and designed to ensure your team can effectively execute quality, safety, and environmental controls.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Audit readiness and certification support</h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    We prepare your organization for external audits through mock inspections, evidence trail strengthening, and performance tracking. Our support helps you achieve ISO certification and maintain continuous compliance.
                  </p>
                </div>
              </div>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cards */}
            {[
              { title: "Quality Risk Scan™", icon: <AlertTriangle />, desc: "A rapid, on-site or virtual diagnostic to identify gaps in your current system compared to ISO, regulatory, or client requirements. You receive a prioritized \"Red Flag Report\" and a roadmap for strengthening controls across quality, safety, and environmental processes.", link: "/book", linkText: "Book Scan" },
              { title: "IMS Design & Setup", icon: <Settings />, desc: "We architect your Integrated Management System (IMS) from the ground up. This includes policy formulation, process mapping, and establishing the digital backbone needed for your quality, safety, and environmental data to function as a unified system.", link: "/services", linkText: "Learn More" },
              { title: "SOP & Procedure Development", icon: <FileText />, desc: "We replace text-heavy manuals with visual SOPs, flowcharts, and checklists that frontline teams can actually use. Includes mobile-friendly formats designed to support consistent execution of quality, environmental, and safety controls.", link: "/services", linkText: "Learn More" }
            ].map((card, i) => (
              <div key={i} className="bg-white/80 backdrop-blur rounded-2xl p-8 border border-neutral-200 hover:border-amber-500/50 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300 group">
                <div className="h-12 w-12 bg-neutral-50 rounded-lg shadow-sm border border-neutral-200 flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-amber-600 transition-colors">{card.title}</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">{card.desc}</p>
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

      {/* Portfolio/Metrics Teaser - Seamless Dark Gradient with Pattern */}
      <section className="py-12 bg-[linear-gradient(to_bottom,transparent_0%,#171717_15%,#171717_85%,transparent_100%)] text-white overflow-hidden relative">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-neutral-800 border border-neutral-700 text-amber-400 rounded-full text-xs font-semibold mb-4 tracking-wider">PROVEN OUTCOMES</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Who We Help</h2>
              <p className="text-neutral-400 text-lg mb-6 leading-relaxed">
                Preqal serves businesses across diverse sectors in Guyana and the Caribbean, from small shops to large corporations. We help organizations in poultry production, logistics and distribution, food handling and processing, eco-hospitality, oil and gas services, and waste management build quality management systems, safety management systems, and ESG programs that drive real operational improvements.
              </p>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                Our evidence-driven approach means we don't just write reports—we transform operational reality. Our integrated management systems are designed to deliver measurable improvements in compliance, safety, and efficiency. Whether you're preparing for ISO certification, regulatory inspection, or client audits, Preqal provides the expertise and support needed to achieve audit-readiness and maintain continuous compliance.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3 text-neutral-300">
                  <CheckCircle2 className="text-amber-500 h-5 w-5" />
                  <span>Audit-readiness typically achieved in 12 weeks</span>
                </li>
                <li className="flex items-center space-x-3 text-neutral-300">
                  <CheckCircle2 className="text-amber-500 h-5 w-5" />
                  <span>Sustainable reduction in non-conformances</span>
                </li>
                <li className="flex items-center space-x-3 text-neutral-300">
                  <CheckCircle2 className="text-amber-500 h-5 w-5" />
                  <span>Enhanced traceability & risk visibility</span>
                </li>
              </ul>
              <Link to="/case-studies" className="inline-flex items-center bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-white/5">
                See Industry Examples
              </Link>
            </div>
            <div className="bg-neutral-900/80 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm shadow-2xl">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold text-neutral-200">Average Maturity Growth</h3>
                <span className="text-amber-500 font-mono text-xs animate-pulse">● Live Projection</span>
              </div>
              <div className="h-64 w-full min-h-[256px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#f5f5f5', borderRadius: '8px' }}
                      itemStyle={{ color: '#fbbf24' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Section - Document Templates CTA */}
      <section className="py-16 relative text-neutral-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-visible animate-fade-in-up p-6 md:p-12">
            {/* Document Animation */}
            <div className="relative h-48 mb-4 flex items-center justify-center">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes floatReverse {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-15px) rotate(-5deg); }
                }
                @keyframes floatSlow {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-25px) rotate(3deg); }
                }
                .doc-float-1 { animation: float 3s ease-in-out infinite; animation-delay: 0s; }
                .doc-float-2 { animation: floatReverse 3.5s ease-in-out infinite; animation-delay: 0.5s; }
                .doc-float-3 { animation: floatSlow 4s ease-in-out infinite; animation-delay: 1s; }
                .doc-float-4 { animation: float 3.2s ease-in-out infinite; animation-delay: 1.5s; }
                .doc-float-5 { animation: floatReverse 3.8s ease-in-out infinite; animation-delay: 2s; }
              `}</style>
              <FileText className="absolute h-14 w-14 text-amber-500/40 doc-float-1" style={{ left: '5%', top: '30%' }} />
              <FileText className="absolute h-16 w-16 text-amber-500/50 doc-float-2" style={{ left: '20%', top: '20%' }} />
              <FileText className="absolute h-20 w-20 text-amber-600/60 doc-float-3" style={{ left: '50%', top: '15%', transform: 'translateX(-50%)' }} />
              <FileText className="absolute h-16 w-16 text-amber-500/45 doc-float-4" style={{ right: '20%', top: '25%' }} />
              <FileText className="absolute h-14 w-14 text-amber-500/40 doc-float-5" style={{ right: '5%', top: '35%' }} />
            </div>
            
            {/* Button */}
            <Link 
              to="/resources" 
              className="inline-flex items-center justify-center px-4 py-3 md:px-8 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm md:text-lg rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 whitespace-nowrap w-full md:w-auto"
            >
              Get Free Document Templates
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* Get a Risk Scan Section */}
      <section className="py-12 relative bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Get a Risk Scan</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Ready to identify gaps in your quality management system, safety management system, or ESG program? Our Quality Risk Scan™ provides a rapid seven-day diagnostic assessment that evaluates your current systems against ISO 9001, ISO 14001, ISO 45001, and regulatory requirements.
            </p>
            
            <div className="max-w-3xl mx-auto space-y-6 text-left mb-8">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">What you receive</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  You'll receive a prioritized Red Flag Report that highlights critical gaps in your systems, plus a strategic roadmap for strengthening your integrated management system. The report includes actionable recommendations tailored to your specific risks and compliance requirements.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Who it's for</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Our Risk Scan is ideal for organizations of any size preparing for ISO certification, regulatory inspections, or client audits. Whether you're starting from scratch or improving existing systems, we help you identify what matters most.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">How to start</h3>
                <p className="text-base text-neutral-600 leading-relaxed">
                  Book your Risk Scan today and receive your diagnostic assessment within seven days. Our rapid assessment can be conducted on-site or virtually, making it accessible to businesses across Guyana and the Caribbean.
                </p>
              </div>
            </div>
            
            <Link 
              to="/book" 
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1"
            >
              Book Your Risk Scan Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-neutral-500 mt-4">
              Learn more about our <Link to="/services" className="text-amber-600 hover:text-amber-500 underline">comprehensive services</Link> or explore <Link to="/case-studies" className="text-amber-600 hover:text-amber-500 underline">real success stories</Link> from organizations we've helped achieve ISO certification and regulatory compliance.
            </p>
          </div>
        </div>
      </section>
      
      {/* Disambiguation Text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-xs text-neutral-400">
          Preqal is a brand name and not the word "prequel".
        </p>
      </div>
    </div>
    </>
  );
};

export default Home;