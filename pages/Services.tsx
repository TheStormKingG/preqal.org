import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Settings, FileText, Users, ShieldCheck, CheckSquare, ArrowRight, Award, Lightbulb, Code, ChevronDown } from 'lucide-react';
import { ServiceItem } from '../types';
import SEO from '../components/SEO';

const services: (ServiceItem & { features: string[] })[] = [
  { id: 'risk-scan', title: 'Quality Risk Scan™', tagline: 'Find your top compliance risks in 7 days', description: 'You can\'t fix what you can\'t see. The Quality Risk Scan™ gives you a clear, honest picture of exactly where your business stands — measuring your systems against ISO, regulatory, and client requirements. Within seven days, you\'ll have a prioritised Red Flag Report and a practical roadmap in your hands, so you know precisely what to fix and exactly where to start.', icon: <AlertTriangle className="h-8 w-8 text-amber-600" />, features: ['Gap Analysis & Risk Identification', 'Prioritized Red Flag Report', 'Compliance Roadmap', '7-Day Rapid Assessment'] },
  { id: 'ims-design', title: 'IMS Design & Setup', tagline: 'Build an ISO-aligned management system', description: 'You deserve a system built around your business — not borrowed from someone else\'s. Preqal designs your entire Integrated Management System from the ground up — policy, process mapping, and the digital backbone that keeps your quality, safety, and environmental data working together as one. No gaps. No guesswork. Just a foundation you can trust completely.', icon: <Settings className="h-8 w-8 text-amber-600" />, features: ['System Architecture Design', 'Policy Formulation', 'Process Mapping & Integration', 'Digital Infrastructure Setup'] },
  { id: 'sop-dev', title: 'SOP & Procedure Development', tagline: 'Structured, visual, frontline-friendly documents', description: 'Your team works hard. They deserve instructions that actually make sense. Preqal replaces heavy, confusing manuals with clear, visual SOPs, flowcharts, and checklists — in plain language, mobile-friendly formats that make doing things right feel natural. When your people know what to do, they do it with pride.', icon: <FileText className="h-8 w-8 text-amber-600" />, features: ['Visual SOP Development', 'Flowchart & Checklist Creation', 'Mobile-Friendly Formats', 'Frontline Usability Testing'] },
  { id: 'training', title: 'Training & Competency', tagline: 'Tailored for frontline teams at all skill levels', description: 'Your people are your greatest strength — and the right training unlocks everything they\'re capable of. Through on-site workshops and digital modules, your team will understand not just what to do, but why it matters. Safe work. Environmental care. Incident prevention. Accurate records. Your team will own it — and your business will show it.', icon: <Users className="h-8 w-8 text-amber-600" />, features: ['On-Site Workshops', 'Digital Training Modules', 'Competency Assessment', 'Skill-Level Customization'] },
  { id: 'audit-prep', title: 'Audit Readiness Support', tagline: 'Prepare confidently for regulators', description: 'You\'ll walk into every audit knowing you\'re ready. Through mock inspections, coaching sessions, and evidence trail strengthening, Preqal prepares your team — and your system — to perform under pressure. When the day comes, you won\'t just meet the standard. You\'ll demonstrate exactly the kind of organisation you\'ve worked so hard to build.', icon: <ShieldCheck className="h-8 w-8 text-amber-600" />, features: ['Mock Audit Sessions', 'Evidence Trail Strengthening', 'Staff Confidence Building', 'Performance Under Pressure'] },
  { id: 'complete-system', title: 'Preqal 360™ Transformation', tagline: 'The complete "Chaos to Certification" package', description: 'You don\'t have to manage this alone. The Preqal 360™ is your complete transformation — from where you are today to full ISO certification. Preqal steps in as your dedicated quality partner and guides you through every phase: Assessment, Design, Documentation, Implementation, Training, and Certification Audit support. One journey. One trusted guide. Every step covered.', icon: <Award className="h-8 w-8 text-amber-600" />, features: ['Full Lifecycle Execution', 'Fractional Quality Department', 'End-to-End Support', 'Certification Audit Preparation'] },
  { id: 'webapp-dev', title: 'Operational Web App Development', tagline: 'Custom digital tools for your operations', description: 'You shouldn\'t be running a world-class system on paperwork and spreadsheets. Preqal builds custom web applications designed around the way your business actually operates — automating your reporting, digitising your quality processes, and giving you real-time dashboards that keep you in control. Tools built for you, working quietly so you don\'t have to.', icon: <Code className="h-8 w-8 text-amber-600" />, features: ['Custom Web Application Development', 'Workflow Automation', 'Real-Time Dashboards', 'System Integration & API Development'] },
  { id: 'custom-advisory', title: 'Specialized Advisory & Crisis Support', tagline: 'Bespoke solutions for unique constraints', description: 'Some challenges don\'t come with a standard solution — and that\'s exactly what Preqal is here for. Whether you\'re recovering from an operational setback, navigating a compliance dispute, or building something entirely new, Preqal designs a custom intervention built around your specific situation. Whatever the challenge, you won\'t be facing it alone.', icon: <Lightbulb className="h-8 w-8 text-amber-600" />, features: ['Custom Intervention Design', 'Crisis Recovery Planning', 'Compliance Dispute Resolution', 'Bespoke Solution Architecture'] },
];

const ServiceAccordionItem: React.FC<{
  service: (typeof services)[number];
  isOpen: boolean;
  onToggle: () => void;
}> = ({ service, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMaxHeight(`${el.scrollHeight}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div className={`neu-card rounded-2xl transition-all duration-300 animate-fade-in-up ${isOpen ? 'neu-raised' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full p-8 flex flex-col md:flex-row gap-6 items-start md:items-center cursor-pointer text-left"
      >
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-xl flex items-center justify-center neu-pressed">
            {service.icon}
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
            <span className="inline-block neu-pressed-sm text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              {service.tagline}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-6 w-6 text-amber-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight, opacity: isOpen ? 1 : 0, transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease-in-out' }}
      >
        <div className="px-8 pb-8 md:pl-[7.5rem]">
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">{service.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {service.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-sm text-slate-500 neu-pressed-sm px-3 py-2 rounded-lg">
                <CheckSquare className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <Link to={`/book?service=${encodeURIComponent(service.title)}`} className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-400 transition-all neu-raised-sm">
              Book This Service <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/case-studies" className="ml-6 text-amber-600 font-medium hover:text-amber-500 transition-colors">
              See Success Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <>
      <SEO pageKey="services" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Services & Solutions</h1>
            <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
              You've already built something worth protecting. Now it's time to make it unbreakable. Every service Preqal offers exists for one reason — to give you the systems, the confidence, and the clarity to lead your business at the highest level. Your story doesn't stop at compliance. It starts there.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {services.map((service) => (
            <ServiceAccordionItem
              key={service.id}
              service={service}
              isOpen={openId === service.id}
              onToggle={() => handleToggle(service.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Services;
