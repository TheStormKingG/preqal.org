import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Settings, FileText, Users, ShieldCheck, CheckSquare, ArrowRight, Award, Lightbulb } from 'lucide-react';
import { ServiceItem } from '../types';

const services: ServiceItem[] = [
  {
    id: 'risk-scan',
    title: 'Quality Risk Scan™',
    tagline: 'Find your top compliance risks in 7 days',
    description: 'A rapid, on-site or virtual diagnostic to identify gaps in your current system compared to ISO, regulatory, or client requirements. You receive a prioritized "Red Flag Report" and a roadmap for strengthening controls across quality, safety, and environmental processes.',
    icon: <AlertTriangle className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'ims-design',
    title: 'IMS Design & Setup',
    tagline: 'Build an ISO-aligned management system',
    description: 'We architect your Integrated Management System (IMS) from the ground up. This includes policy formulation, process mapping, and establishing the digital backbone needed for your quality, safety, and environmental data to function as a unified system.',
    icon: <Settings className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'sop-dev',
    title: 'SOP & Procedure Development',
    tagline: 'Structured, visual, frontline-friendly documents',
    description: 'We replace text-heavy manuals with visual SOPs, flowcharts, and checklists that frontline teams can actually use. Includes mobile-friendly formats designed to support consistent execution of quality, environmental, and safety controls.',
    icon: <FileText className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'training',
    title: 'Training & Competency',
    tagline: 'Tailored for frontline teams at all skill levels',
    description: 'On-site workshops and digital modules focused on the "Why" behind the "What". We cover safe work practices, environmental care, incident prevention, and accurate data recording so teams understand their role in maintaining system discipline.',
    icon: <Users className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'audit-prep',
    title: 'Audit Readiness Support',
    tagline: 'Prepare confidently for regulators',
    description: 'Mock audits and coaching sessions to prepare your team for external certification (ISO 9001, ISO 14001, ISO 45001) or regulatory inspections. We strengthen evidence trails, staff confidence, and system performance under audit pressure.',
    icon: <ShieldCheck className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'complete-system',
    title: 'Preqal 360™ Transformation',
    tagline: 'The complete "Chaos to Certification" package',
    description: 'Our flagship turnkey solution. We act as your fractional Quality Department to execute the full lifecycle: Assessment, Design, Documentation, Implementation, Training, and Certification Audit support. Ideal for organizations seeking formal ISO compliance.',
    icon: <Award className="h-8 w-8 text-amber-600" />
  },
  {
    id: 'custom-advisory',
    title: 'Specialized Advisory & Crisis Support',
    tagline: 'Bespoke solutions for unique constraints',
    description: 'For challenges that don\'t fit a standard mold. Whether it\'s recovering from operational failures, navigating compliance disputes, or standing up new processes, we design a custom intervention plan that aligns with ISO principles and your organizational reality.',
    icon: <Lightbulb className="h-8 w-8 text-amber-600" />
  },
];

const Services: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Header with Seamless Fade and Pattern - Fades to Transparent */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 relative overflow-hidden text-white">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Services & Solutions</h1>
          <p className="text-xl text-neutral-400 max-w-3xl leading-relaxed">
            We don't sell generic consulting hours. We sell operational outcomes. 
            Choose a solution designed to solve your specific compliance bottleneck.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8 relative z-20">
        {services.map((service, index) => (
          <div key={service.id} className={`bg-white/80 backdrop-blur rounded-2xl p-8 border border-neutral-200 hover:border-amber-500/30 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 flex flex-col md:flex-row gap-8 items-start animate-fade-in-up delay-${(index % 5) * 100}`}>
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-[#f6f8fb] rounded-xl flex items-center justify-center shadow-inner border border-neutral-100">
                {service.icon}
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">{service.title}</h3>
                <span className="inline-block bg-neutral-100 border border-neutral-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mt-2 md:mt-0">
                  {service.tagline}
                </span>
              </div>
              <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                {service.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3 text-sm text-neutral-500">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                  <span>Problem Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-500">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                  <span>Evidence-Based Strategy</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-500">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                  <span>Implementation Roadmap</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-500">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                  <span>Success Metrics</span>
                </div>
              </div>

              <div className="flex items-center">
                <Link 
                  to={`/book?service=${encodeURIComponent(service.title)}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-lg text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-md shadow-orange-600/20"
                >
                  Book This Service
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  to="/case-studies" 
                  className="ml-6 text-amber-600 font-medium hover:text-amber-500 transition-colors border-b border-transparent hover:border-amber-600"
                >
                  See Success Stories
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;