import React from 'react';
import { Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const services = [
    { name: 'Quality Risk Scan™', query: 'Quality Risk Scan™' },
    { name: 'IMS Design & Setup', query: 'IMS Design & Setup' },
    { name: 'SOP Development', query: 'SOP & Procedure Development' },
    { name: 'Training Programs', query: 'Training & Competency' },
    { name: 'Audit Readiness', query: 'Audit Readiness Support' },
    { name: 'Preqal 360™ System', query: 'Preqal 360™ Transformation' },
    { name: 'Specialized Advisory', query: 'Specialized Advisory & Crisis Support' },
  ];

  return (
    <footer className="bg-[linear-gradient(to_bottom,transparent_0%,#171717_25%,#000000_100%)] text-neutral-400 pt-32 pb-12 relative overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <img 
                src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-10.png`}
                alt="PREQAL Logo"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed mb-6 text-neutral-500">
              Integrated Quality, Safety & Compliance Systems for Poultry, Agri-Food & Eco-Hospitality Businesses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-amber-400 transition-colors duration-300"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-amber-400 transition-colors duration-300"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Services</h3>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.name}>
                  <Link 
                    to={`/book?service=${encodeURIComponent(service.query)}`}
                    className="hover:text-amber-400 transition-colors duration-200 block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-amber-400 transition-colors duration-200">About Preqal</Link></li>
              <li><Link to="/case-studies" className="hover:text-amber-400 transition-colors duration-200">Case Studies</Link></li>
              <li><Link to="/resources" className="hover:text-amber-400 transition-colors duration-200">Resources</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Compliance</h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-500">
              <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 rounded hover:border-amber-900 hover:text-amber-500 transition-colors cursor-default">ISO 9001</span>
              <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 rounded hover:border-amber-900 hover:text-amber-500 transition-colors cursor-default">ISO 45001</span>
              <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 rounded hover:border-amber-900 hover:text-amber-500 transition-colors cursor-default">ISO 14001</span>
              <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 rounded hover:border-amber-900 hover:text-amber-500 transition-colors cursor-default">HACCP</span>
              <span className="border border-neutral-800 bg-neutral-900 px-2 py-1 rounded hover:border-amber-900 hover:text-amber-500 transition-colors cursor-default">Climate-Friendliness</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600">
          <p>&copy; {new Date().getFullYear()} Preqal Consulting. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;