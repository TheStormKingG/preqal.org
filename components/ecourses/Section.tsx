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
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl mb-10 sm:mb-14">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600/90 mb-3">{eyebrow}</p>
          ) : null}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight text-balance">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">{subtitle}</p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
};

export default Section;
