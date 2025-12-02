import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, AlertTriangle, FileText, BarChart3, Users, Settings, Leaf } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Month 1', score: 45 },
  { name: 'Month 2', score: 55 },
  { name: 'Month 3', score: 70 },
  { name: 'Month 4', score: 85 },
  { name: 'Month 5', score: 92 },
  { name: 'Month 6', score: 98 },
];

const ProcessStep: React.FC<{ title: string; desc: string; icon: React.ReactNode; delay: string }> = ({ title, desc, icon, delay }) => (
  <div className={`flex flex-col items-center text-center p-4 group cursor-pointer hover:bg-white/80 rounded-xl transition-all duration-300 animate-fade-in-up ${delay} hover:shadow-xl hover:shadow-neutral-200/50`}>
    <div className="p-3 bg-white border border-neutral-200 text-amber-600 rounded-full mb-3 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-300 shadow-sm">
      {icon}
    </div>
    <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
    <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors">{desc}</p>
  </div>
);

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section - Transparent to show App background */}
      <section className="relative text-neutral-900 py-24 lg:py-32 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-amber-500/30 text-amber-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="tracking-wide">ISO-Aligned & Risk-Based</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-neutral-900">
                Quality, Safety & Compliance <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Integrated.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl leading-relaxed">
                We build evidence-driven management systems for Poultry, Agri-Food, and Eco-Hospitality businesses. Move from chaos to compliance.
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
              <img 
                src={`${import.meta.env.BASE_URL}Image1.png`}
                alt="Stabroek Market Clock Tower"
                className="w-full h-full object-contain object-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Seamless Transparent Gradient Background with Pattern */}
      <section className="relative py-16 bg-[linear-gradient(to_bottom,transparent_0%,#171717_20%,#171717_80%,transparent_100%)]">
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
      </section>

      {/* Methodology Diagram - Transparent for Global Pattern */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">The Preqal System</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our proven methodology transforms operational data into strategic authority.</p>
          </div>
          
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[3.25rem] left-0 w-full h-0.5 bg-neutral-200 -z-10"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <ProcessStep title="Assess" desc="Risk Scan" icon={<AlertTriangle size={20} />} delay="delay-0" />
              <ProcessStep title="Design" desc="IMS Architecture" icon={<Settings size={20} />} delay="delay-100" />
              <ProcessStep title="Implement" desc="SOPs & Docs" icon={<FileText size={20} />} delay="delay-200" />
              <ProcessStep title="Train" desc="Competency" icon={<Users size={20} />} delay="delay-300" />
              <ProcessStep title="Monitor" desc="Audit Prep" icon={<BarChart3 size={20} />} delay="delay-400" />
              <ProcessStep title="Improve" desc="Optimization" icon={<ArrowRight size={20} />} delay="delay-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Service Tiles - Transparent to show Global Pattern */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">Signature Solutions</h2>
              <p className="text-neutral-600">Designed for operational excellence.</p>
            </div>
            <Link to="/services" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              View all solutions <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cards */}
            {[
              { title: "Quality Risk Scan™", icon: <AlertTriangle />, desc: "Find your top compliance risks in 7 days. A rapid diagnostic to identify gaps before the auditors do.", link: "/book", linkText: "Book Scan" },
              { title: "IMS Design & Setup", icon: <Settings />, desc: "Build an ISO-aligned management system from scratch. Tailored for poultry and eco-tourism workflows.", link: "/services", linkText: "Learn More" },
              { title: "SOP Architecture", icon: <FileText />, desc: "Visual, low-literacy-friendly documentation that frontline workers actually understand and follow.", link: "/services", linkText: "Learn More" }
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
      <section className="py-24 bg-[linear-gradient(to_bottom,transparent_0%,#171717_15%,#171717_85%,transparent_100%)] text-white overflow-hidden relative">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-neutral-800 border border-neutral-700 text-amber-400 rounded-full text-xs font-semibold mb-4 tracking-wider">PROVEN OUTCOMES</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Evidence-Driven <br/><span className="text-amber-500">Results</span></h2>
              <p className="text-neutral-400 text-lg mb-8">
                We don't just write reports. We transform operational reality. Our systems are designed to deliver measurable improvements in compliance, safety, and efficiency across your organization.
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

      {/* Lead Magnet Section - Transparent */}
      <section className="py-24 relative text-neutral-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-neutral-900">Start Improving Today</h2>
          <p className="text-neutral-600 mb-8 text-lg">Download our "Management Essentials Toolkit for Businesses" — a free PDF guide including a self-assessment checklist.</p>
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your work email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
            />
            <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/20">
              Download Free PDF
            </button>
          </form>
          {subscribed && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fade-in-up">
              <span className="font-bold">Success!</span> Check your inbox for the download link.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;