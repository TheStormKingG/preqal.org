import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, SlidersHorizontal, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import Section from '../components/ecourses/Section';
import CourseCard from '../components/ecourses/CourseCard';
import { COURSE_MODULES } from '../components/ecourses/courseModules';
import { useRevealOnScroll } from '../components/ecourses/useRevealOnScroll';

const CourseCardReveal: React.FC<{
  module: (typeof COURSE_MODULES)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ module, index, isOpen, onToggle }) => {
  const [wrapRef, visible] = useRevealOnScroll();
  return (
    <div
      ref={wrapRef}
      className={`h-full transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionDelay: visible ? `${index * 55}ms` : '0ms' }}
    >
      <CourseCard module={module} isOpen={isOpen} onToggle={onToggle} />
    </div>
  );
};

const ECourses: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const pillars = [
    {
      title: 'See the system',
      icon: <Eye className="h-7 w-7 text-amber-600" strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Control the system',
      icon: <SlidersHorizontal className="h-7 w-7 text-amber-600" strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Improve the system',
      icon: <TrendingUp className="h-7 w-7 text-amber-600" strokeWidth={1.75} aria-hidden />,
    },
  ];

  return (
    <>
      <SEO pageKey="eCourses" />

      <div className="min-h-screen pb-20">
        <div className="py-16 sm:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3">E-Course</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <span className="inline-flex w-fit items-center neu-pressed-sm text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Course progress · 0% complete
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 text-balance">
              E-Course: Build Systems That Actually Work
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl leading-relaxed mb-4">
              Learn how to design, control, and improve real-world operations using practical Quality Management Systems.
            </p>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mb-8">
              This is not theory. These are systems you can apply immediately to improve consistency, reduce errors, and scale your business with confidence.
            </p>
            <a
              href="#modules"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-400 transition-all neu-raised-sm"
            >
              Start Learning
            </a>
          </div>
        </div>

        <Section
          id="modules"
          eyebrow="Course overview"
          title="Nine modules. One clear path."
          subtitle="Select a module to expand it and see learning outcomes, time, and skill level."
          className="pt-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {COURSE_MODULES.map((module, index) => (
              <CourseCardReveal
                key={module.id}
                module={module}
                index={index}
                isOpen={openId === module.id}
                onToggle={() => handleToggle(module.id)}
              />
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Approach"
          title="Why This Course Is Different"
          subtitle="Most training teaches theory. This course teaches how work actually functions. You will learn to see systems, identify gaps, and build structures that produce consistent, reliable results."
          className="pt-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="neu-card rounded-2xl p-8 text-center transition-all duration-300 hover:neu-raised"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl neu-pressed">{p.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
              </div>
            ))}
          </div>
        </Section>

        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="neu-card rounded-2xl p-10 sm:p-14 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-balance">Start Building Better Systems Today</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-pretty">
                The difference between struggling operations and high-performing organizations is not effort—it is structure.
              </p>
              <div className="mt-10">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-400 transition-all neu-raised-sm"
                >
                  Begin Course
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ECourses;
