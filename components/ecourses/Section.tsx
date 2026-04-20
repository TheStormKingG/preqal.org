import React from 'react';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, eyebrow, title, subtitle, children, className = '' }) => {
  return (
    <section id={id} className={`py-12 sm:py-16 lg:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl mb-8 sm:mb-12">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">{eyebrow}</p>
          ) : null}
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-lg text-slate-600 leading-relaxed text-pretty">{subtitle}</p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
};

export default Section;
