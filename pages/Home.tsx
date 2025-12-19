import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2, AlertTriangle, FileText, BarChart3, Users, Settings, Leaf, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

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
  const jobTitles = [
    'Quality Manager',
    'Quality Assurance Manager',
    'Quality Control Manager',
    'Compliance Manager',
    'QHSE Manager',
    'HSE Manager',
    'Operations Manager',
    'Production Manager',
    'Quality Engineer',
    'Quality Assurance Engineer',
    'Compliance Officer',
    'Quality Analyst',
    'Quality Specialist',
    'Regulatory Affairs Manager',
    'Director of Quality',
    'VP of Quality',
    'Chief Quality Officer',
    'Other'
  ];

  const qualityProblems = [
    'Inconsistent process execution',
    'Poor document & change control',
    'Unsafe behaviors + weak supervision',
    'Inadequate risk assessments/controls',
    'Training/competency gaps',
    'Cash flow instability',
    'Weak financial controls',
    'Inventory and material flow issues',
    'Lack of strategic alignment',
    'Other'
  ];

  const countryCodes = [
    { code: '+1', country: 'AG', flag: '🇦🇬', name: 'Antigua & Barbuda' },
    { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+1', country: 'BS', flag: '🇧🇸', name: 'Bahamas' },
    { code: '+1', country: 'BB', flag: '🇧🇧', name: 'Barbados' },
    { code: '+591', country: 'BO', flag: '🇧🇴', name: 'Bolivia' },
    { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: '+1', country: 'KY', flag: '🇰🇾', name: 'Cayman Islands' },
    { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia' },
    { code: '+53', country: 'CU', flag: '🇨🇺', name: 'Cuba' },
    { code: '+1', country: 'DM', flag: '🇩🇲', name: 'Dominica' },
    { code: '+1', country: 'DO', flag: '🇩🇴', name: 'Dominican Republic' },
    { code: '+593', country: 'EC', flag: '🇪🇨', name: 'Ecuador' },
    { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
    { code: '+251', country: 'ET', flag: '🇪🇹', name: 'Ethiopia' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+233', country: 'GH', flag: '🇬🇭', name: 'Ghana' },
    { code: '+1', country: 'GD', flag: '🇬🇩', name: 'Grenada' },
    { code: '+592', country: 'GY', flag: '🇬🇾', name: 'Guyana' },
    { code: '+509', country: 'HT', flag: '🇭🇹', name: 'Haiti' },
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+1', country: 'JM', flag: '🇯🇲', name: 'Jamaica' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
    { code: '+212', country: 'MA', flag: '🇲🇦', name: 'Morocco' },
    { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+595', country: 'PY', flag: '🇵🇾', name: 'Paraguay' },
    { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Peru' },
    { code: '+1', country: 'KN', flag: '🇰🇳', name: 'Saint Kitts & Nevis' },
    { code: '+1', country: 'LC', flag: '🇱🇨', name: 'Saint Lucia' },
    { code: '+1', country: 'VC', flag: '🇻🇨', name: 'Saint Vincent & the Grenadines' },
    { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+597', country: 'SR', flag: '🇸🇷', name: 'Suriname' },
    { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
    { code: '+1', country: 'TT', flag: '🇹🇹', name: 'Trinidad & Tobago' },
    { code: '+1', country: 'TC', flag: '🇹🇨', name: 'Turks & Caicos' },
    { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
    { code: '+971', country: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+598', country: 'UY', flag: '🇺🇾', name: 'Uruguay' },
    { code: '+58', country: 'VE', flag: '🇻🇪', name: 'Venezuela' },
    { code: '+260', country: 'ZM', flag: '🇿🇲', name: 'Zambia' },
  ];

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    job_title: '',
    custom_job_title: '',
    country_code: '+1',
    phone_number: '',
    most_pressing_quality_problem: '',
    custom_quality_problem: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
  const [showCustomQualityProblem, setShowCustomQualityProblem] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'job_title') {
      if (value === 'Other') {
        setShowCustomJobTitle(true);
        setFormData({ ...formData, job_title: 'Other', custom_job_title: '' });
      } else {
        setShowCustomJobTitle(false);
        setFormData({ ...formData, job_title: value, custom_job_title: '' });
      }
    } else if (name === 'most_pressing_quality_problem') {
      if (value === 'Other') {
        setShowCustomQualityProblem(true);
        setFormData({ ...formData, most_pressing_quality_problem: 'Other', custom_quality_problem: '' });
      } else {
        setShowCustomQualityProblem(false);
        setFormData({ ...formData, most_pressing_quality_problem: value, custom_quality_problem: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Company is required');
      return false;
    }
    if (!formData.job_title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (formData.job_title === 'Other' && !formData.custom_job_title.trim()) {
      setError('Please enter your job title');
      return false;
    }
    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.most_pressing_quality_problem.trim()) {
      setError('Please select or describe your most pressing quality problem');
      return false;
    }
    if (formData.most_pressing_quality_problem === 'Other' && !formData.custom_quality_problem.trim()) {
      setError('Please describe your most pressing quality problem');
      return false;
    }
    return true;
  };

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = '/premium-templates.zip';
    link.download = 'premium-templates.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('template_leads')
        .insert({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim(),
          job_title: formData.job_title === 'Other' ? formData.custom_job_title.trim() : formData.job_title.trim(),
          phone_number: `${formData.country_code} ${formData.phone_number.trim()}`,
          most_pressing_quality_problem: formData.most_pressing_quality_problem === 'Other' ? formData.custom_quality_problem.trim() : formData.most_pressing_quality_problem.trim(),
          source_page: 'library_unlock',
        });

      if (insertError) {
        throw insertError;
      }

      // Success - trigger download and show success message
      triggerDownload();
      setSuccess(true);
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        job_title: '',
        custom_job_title: '',
        country_code: '+1',
        phone_number: '',
        most_pressing_quality_problem: '',
        custom_quality_problem: '',
      });
      setShowCustomJobTitle(false);
      setShowCustomQualityProblem(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error saving lead:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                Quality, Safety & Compliance <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Integrated.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl leading-relaxed">
                We build evidence-driven management systems for all types and sizes of businesses. Move from chaos to compliance.
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
      <section className="relative py-8 bg-[linear-gradient(to_bottom,transparent_0%,#171717_20%,#171717_80%,transparent_100%)]">
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
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">The Preqal System</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our proven methodology transforms operational data into strategic authority.</p>
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

      {/* Lead Magnet Section - Unlock Premium Templates */}
      <section className="py-12 relative text-neutral-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-neutral-100 to-white p-10 text-center border-b border-neutral-100 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-6 ring-4 ring-neutral-50 shadow-sm">
                <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-bold mb-2 text-neutral-900" style={{ fontSize: 'calc(1.5rem * 1.07)' }}>Unlock the Library</h2>
              <p className="text-neutral-500 mb-4" style={{ fontSize: 'calc(1rem * 1.07)' }}>Enter your details to access all 5 premium templates instantly.</p>
              <ol className="text-left text-neutral-600 space-y-2 max-w-md mx-auto list-decimal list-inside">
                <li>Document Masterlist</li>
                <li>QHSE Policy</li>
                <li>Document Control Procedure</li>
                <li>Risk Register</li>
                <li>Training & Competency Register</li>
              </ol>
            </div>
            <div className="p-10 md:p-12 bg-white">
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Company *</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                    placeholder="Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Job Title *</label>
                  <select
                    name="job_title"
                    required
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a job title</option>
                    {jobTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  {showCustomJobTitle && (
                    <input
                      type="text"
                      name="custom_job_title"
                      required
                      value={formData.custom_job_title}
                      onChange={handleChange}
                      className="w-full mt-3 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="Enter your job title"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0 w-32">
                      <select
                        name="country_code"
                        value={formData.country_code}
                        onChange={handleChange}
                        className="w-full px-3 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all appearance-none pr-8"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.country} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="phone_number"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                      placeholder="440-555-1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Most Pressing Quality Problem *</label>
                  <select
                    name="most_pressing_quality_problem"
                    required
                    value={formData.most_pressing_quality_problem}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a quality problem</option>
                    {qualityProblems.map((problem) => (
                      <option key={problem} value={problem}>
                        {problem}
                      </option>
                    ))}
                  </select>
                  {showCustomQualityProblem && (
                    <textarea
                      name="custom_quality_problem"
                      required
                      rows={4}
                      value={formData.custom_quality_problem}
                      onChange={handleChange}
                      className="w-full mt-3 px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400 resize-none"
                      placeholder="Describe your most pressing quality or compliance challenge..."
                    />
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Unlock Access'
                  )}
                </button>
              </form>
              <p className="text-xs text-center text-neutral-500 mt-6">
                We respect your privacy. No spam, just value.
              </p>
              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fade-in-up text-center">
                  <span className="font-bold">Download started.</span> Check your downloads folder.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;