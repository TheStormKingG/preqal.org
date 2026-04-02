import React from 'react';
import { Linkedin, Facebook, MapPin, Phone, User } from 'lucide-react';
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
    <footer className="bg-[#e0e5ec] pt-16 pb-12 relative">
      {/* Top divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="h-px neu-pressed-sm rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <picture>
                <source
                  type="image/avif"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.avif 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.avif 400w`}
                  sizes="(max-width: 640px) 200px, 400px"
                />
                <source
                  type="image/webp"
                  srcSet={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-200.webp 200w, ${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp 400w`}
                  sizes="(max-width: 640px) 200px, 400px"
                />
                <img
                  src={`${import.meta.env.BASE_URL}Preqal%20Logo%20Sep25-9-400.webp`}
                  alt="Preqal logo"
                  className="w-full object-cover object-center"
                  style={{ height: '2.25rem' }}
                  width="400"
                  height="160"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-slate-500 italic">
                  Founded and led by Dr. Stefan Gravesande, MBBS.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-slate-500">
                  90 Waiakabra Soesdyke Linden Highway<br />
                  East Bank Demerara, Guyana
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <a href="tel:+5926335873" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
                  +592 633 5873
                </a>
              </div>
            </div>
            <div className="flex space-x-3">
              <a href="https://linkedin.com/company/preqal" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl flex items-center justify-center neu-raised-sm text-slate-500 hover:text-amber-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/preqal" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl flex items-center justify-center neu-raised-sm text-slate-500 hover:text-amber-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">SERVICES</h3>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={`/book?service=${encodeURIComponent(service.query)}`}
                    className="text-slate-500 hover:text-amber-600 transition-colors duration-200 block"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">COMPANY</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">About Preqal</Link></li>
              <li><Link to="/case-studies" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Case Studies</Link></li>
              <li><Link to="/resources" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Resources</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Contact Us</Link></li>
              <li><Link to="/preqal-not-prequel" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Preqal (Not Prequel)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">COMPLIANCE</h3>
            <p className="text-sm leading-relaxed mb-4 text-slate-500">
              Integrated Quality, Safety & Compliance Systems for any business.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500">
              {['ISO 9001', 'ISO 45001', 'ISO 14001', 'HACCP', 'Climate-Friendliness'].map((badge) => (
                <span key={badge} className="neu-pressed-sm px-3 py-1.5 rounded-lg hover:text-amber-600 transition-colors cursor-default">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <div className="h-px w-full neu-pressed-sm rounded-full mb-8" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Preqal Inc. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
