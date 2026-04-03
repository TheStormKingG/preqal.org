import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Settings, FileText, Users, ShieldCheck, CheckSquare, ArrowRight, Award, Lightbulb, Code, ChevronDown } from 'lucide-react';
import { ServiceItem } from '../types';
import SEO from '../components/SEO';

const services: (ServiceItem & { features: string[] })[] = [
  { id: 'risk-scan', title: 'Quality Risk Scan™', tagline: 'Find your top compliance risks in 7 days', description: 'A rapid, on-site or virtual diagnostic to identify gaps in your current system compared to ISO, regulatory, or client requirements. You receive a prioritized "Red Flag Report" and a roadmap for strengthening controls across quality, safety, and environmental processes.', icon: <AlertTriangle className="h-8 w-8 text-amber-600" />, features: ['Gap Analysis & Risk Identification', 'Prioritized Red Flag Report', 'Compliance Roadmap', '7-Day Rapid Assessment'] },
  { id: 'ims-design', title: 'IMS Design & Setup', tagline: 'Build an ISO-aligned management system', description: 'We architect your Integrated Management System (IMS) from the ground up. This includes policy formulation, process mapping, and establishing the digital backbone needed for your quality, safety, and environmental data to function as a unified system.', icon: <Settings className="h-8 w-8 text-amber-600" />, features: ['System Architecture Design', 'Policy Formulation', 'Process Mapping & Integration', 'Digital Infrastructure Setup'] },
  { id: 'sop-dev', title: 'SOP & Procedure Development', tagline: 'Structured, visual, frontline-friendly documents', description: 'We replace text-heavy manuals with visual SOPs, flowcharts, and checklists that frontline teams can actually use. Includes mobile-friendly formats designed to support consistent execution of quality, environmental, and safety controls.', icon: <FileText className="h-8 w-8 text-amber-600" />, features: ['Visual SOP Development', 'Flowchart & Checklist Creation', 'Mobile-Friendly Formats', 'Frontline Usability Testing'] },
  { id: 'training', title: 'Training & Competency', tagline: 'Tailored for frontline teams at all skill levels', description: 'On-site workshops and digital modules focused on the "Why" behind the "What". We cover safe work practices, environmental care, incident prevention, and accurate data recording so teams understand their role in maintaining system discipline.', icon: <Users className="h-8 w-8 text-amber-600" />, features: ['On-Site Workshops', 'Digital Training Modules', 'Competency Assessment', 'Skill-Level Customization'] },
  { id: 'audit-prep', title: 'Audit Readiness Support', tagline: 'Prepare confidently for regulators', description: 'Mock audits and coaching sessions to prepare your team for external certification (ISO 9001, ISO 14001, ISO 45001) or regulatory inspections. We strengthen evidence trails, staff confidence, and system performance under audit pressure.', icon: <ShieldCheck className="h-8 w-8 text-amber-600" />, features: ['Mock Audit Sessions', 'Evidence Trail Strengthening', 'Staff Confidence Building', 'Performance Under Pressure'] },
  { id: 'complete-system', title: 'Preqal 360™ Transformation', tagline: 'The complete "Chaos to Certification" package', description: 'Our flagship turnkey solution. We act as your fractional Quality Department to execute the full lifecycle: Assessment, Design, Documentation, Implementation, Training, and Certification Audit support. Ideal for organizations seeking formal ISO compliance.', icon: <Award className="h-8 w-8 text-amber-600" />, features: ['Full Lifecycle Execution', 'Fractional Quality Department', 'End-to-End Support', 'Certification Audit Preparation'] },
  { id: 'webapp-dev', title: 'Operational Web App Development', tagline: 'Custom digital tools for your operations', description: 'We build tailored web applications to streamline your operational workflows, automate reporting, and digitize quality management processes. From data collection interfaces to real-time dashboards, we create tools that integrate seamlessly with your existing systems.', icon: <Code className="h-8 w-8 text-amber-600" />, features: ['Custom Web Application Development', 'Workflow Automation', 'Real-Time Dashboards', 'System Integration & API Development'] },
  { id: 'custom-advisory', title: 'Specialized Advisory & Crisis Support', tagline: 'Bespoke solutions for unique constraints', description: 'For challenges that don\'t fit a standard mold. Whether it\'s recovering from operational failures, navigating compliance disputes, or standing up new processes, we design a custom intervention plan that aligns with ISO principles and your organizational reality.', icon: <Lightbulb className="h-8 w-8 text-amber-600" />, features: ['Custom Intervention Design', 'Crisis Recovery Planning', 'Compliance Dispute Resolution', 'Bespoke Solution Architecture'] },
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
              Preqal doesn't sell generic consulting hours. We sell operational outcomes. Choose a solution designed to solve your specific compliance bottleneck.
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
