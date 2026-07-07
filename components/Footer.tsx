import React, { useState, useRef, useEffect } from 'react';
import { Linkedin, Facebook, Youtube, MapPin, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GLOBAL_STANDARDS_DATA } from '../data/globalStandards';
import { useWhatsApp, WhatsAppIcon } from './WhatsAppContact';

const FOOTER_COMPLIANCE_PANEL_ID = 'footer-compliance-standards-panel';

const FooterComplianceStandards: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const [panelMaxHeight, setPanelMaxHeight] = useState<string>('0px');
  const expandedItem = expandedId ? GLOBAL_STANDARDS_DATA.find((i) => i.id === expandedId) : undefined;

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const el = panelContentRef.current;
    let raf = 0;
    let ro: ResizeObserver | null = null;

    if (!expandedItem || !el) {
      // Collapsed — schedule height reset outside the synchronous effect body
      raf = requestAnimationFrame(() => setPanelMaxHeight('0px'));
    } else {
      // Initial measurement + live resize tracking via ResizeObserver
      ro = new ResizeObserver(() => {
        setPanelMaxHeight(`${el.scrollHeight}px`);
      });
      ro.observe(el);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [expandedItem]);

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500">
        {GLOBAL_STANDARDS_DATA.map((item) => (
          <button
            key={item.id}
            type="button"
            id={`footer-standard-btn-${item.id}`}
            aria-expanded={expandedId === item.id}
            aria-controls={FOOTER_COMPLIANCE_PANEL_ID}
            onClick={() => toggle(item.id)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg font-mono text-xs transition-colors hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
              expandedId === item.id ? 'neu-raised-sm text-slate-600' : 'neu-pressed-sm text-slate-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id={FOOTER_COMPLIANCE_PANEL_ID}
        role="region"
        aria-label={expandedItem ? `Definition: ${expandedItem.label}` : undefined}
        className="collapsible-content overflow-hidden"
        data-open={expandedItem ? 'true' : 'false'}
        style={{ maxHeight: expandedItem ? panelMaxHeight : '0px' }}
      >
        <div ref={panelContentRef} className="mt-2 w-full min-w-0">
          {expandedItem ? (
            <div className="neu-pressed-sm rounded-xl px-3 py-3 text-left text-sm leading-relaxed text-slate-600 w-full font-sans">
              {expandedItem.definition}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const { openWhatsApp } = useWhatsApp();
  const journey = [
    { name: '01 · Business Plan', to: '/services/business-plan' },
    { name: '02 · Risk Scan™', to: '/services/risk-scan' },
    { name: '03 · Systems Builder™', to: '/services/systems-builder' },
    { name: '04 · Certified Care™', to: '/services/certified-care' },
    { name: '05 · Export-Ready™', to: '/services/export-ready' },
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
            <div className="mb-4 overflow-hidden" style={{ height: '3.25rem' }}>
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
                  className="w-auto object-contain"
                  style={{ height: '7.5rem', marginTop: '-1.75rem', marginLeft: '-0.75rem' }}
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
                  90 Waiakabra<br />
                  Soesdyke Linden Highway<br />
                  East Bank Demerara, Guyana
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <a href="tel:+5926335874" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
                  +592 633 5874
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
              <a href="https://www.youtube.com/@Preqal" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl flex items-center justify-center neu-raised-sm text-slate-500 hover:text-amber-600 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
          <div className="md:pt-7">
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">THE JOURNEY</h3>
            <ul className="space-y-2 text-sm">
              {journey.map((phase) => (
                <li key={phase.name}>
                  <Link
                    to={phase.to}
                    className="text-slate-500 hover:text-amber-600 transition-colors duration-200 block"
                  >
                    {phase.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-amber-600 font-semibold hover:text-amber-500 transition-colors duration-200"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" /> WhatsApp Dr. Gravesande
                </button>
              </li>
            </ul>
          </div>

          <div className="md:pt-7">
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">COMPANY</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/e-courses" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">E-Course</Link></li>
              <li><Link to="/resources" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Templates</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Contact</Link></li>
              <li><Link to="/preqal-not-prequel" className="text-slate-500 hover:text-amber-600 transition-colors duration-200">Preqal (Not Prequel)</Link></li>
            </ul>
          </div>
          </div>{/* end mobile 2-col wrapper */}

          <div className="md:pt-7">
            <h3 className="text-slate-800 font-semibold mb-4 tracking-wider uppercase text-sm">COMPLIANCE</h3>
            <p className="text-sm leading-relaxed mb-4 text-slate-500">
              Integrated Quality, Safety & Compliance Systems — built around you, wherever you're growing.
            </p>
            <FooterComplianceStandards />
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
