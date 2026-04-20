import React, { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, SlidersHorizontal, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import Section from '../components/ecourses/Section';
import CourseCard from '../components/ecourses/CourseCard';
import Modal from '../components/ecourses/Modal';
import { COURSE_MODULES } from '../components/ecourses/courseModules';
import type { CourseModule } from '../components/ecourses/types';
import { useRevealOnScroll } from '../components/ecourses/useRevealOnScroll';

const MODAL_TITLE_ID = 'ecourse-module-dialog-title';

const CourseCardReveal: React.FC<{
  module: CourseModule;
  index: number;
  onSelect: (module: CourseModule, trigger: HTMLButtonElement) => void;
}> = ({ module, index, onSelect }) => {
  const [wrapRef, visible] = useRevealOnScroll();
  return (
    <div
      ref={wrapRef}
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionDelay: visible ? `${index * 55}ms` : '0ms' }}
    >
      <CourseCard module={module} onSelect={onSelect} />
    </div>
  );
};

const ECourses: React.FC = () => {
  const reactId = useId();
  const modalTitleId = `${MODAL_TITLE_ID}-${reactId}`;
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openModule = (module: CourseModule, trigger: HTMLButtonElement) => {
    returnFocusRef.current = trigger;
    setSelectedModule(module);
  };

  const closeModule = () => setSelectedModule(null);

  const pillars = [
    {
      title: 'See the system',
      icon: <Eye className="h-5 w-5 text-sky-600" strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Control the system',
      icon: <SlidersHorizontal className="h-5 w-5 text-sky-600" strokeWidth={1.75} aria-hidden />,
    },
    {
      title: 'Improve the system',
      icon: <TrendingUp className="h-5 w-5 text-sky-600" strokeWidth={1.75} aria-hidden />,
    },
  ];

  return (
    <>
      <SEO pageKey="eCourses" />

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-sky-50/90 to-[#e8eef5]"
          aria-hidden
        />

        <div className="relative">
          {/* Hero */}
          <section className="pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl shadow-lg shadow-sky-900/5 ring-1 ring-sky-100/40 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <span className="inline-flex w-fit items-center rounded-full bg-sky-500/10 text-sky-800 text-xs font-semibold px-3 py-1 ring-1 ring-sky-500/15">
                    Course progress · 0% complete
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight text-balance max-w-3xl">
                  E-Courses: Build Systems That Actually Work
                </h1>
                <p className="mt-5 text-lg sm:text-xl text-slate-700 font-medium max-w-2xl leading-snug text-pretty">
                  Learn how to design, control, and improve real-world operations using practical Quality Management Systems.
                </p>
                <p className="mt-5 text-base text-slate-600 max-w-2xl leading-relaxed text-pretty">
                  This is not theory. These are systems you can apply immediately to improve consistency, reduce errors, and scale your business with confidence.
                </p>
                <div className="mt-10">
                  <a
                    href="#modules"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-semibold px-8 py-3.5 shadow-md shadow-slate-900/15 transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
                  >
                    Start Learning
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Modules */}
          <Section
            id="modules"
            eyebrow="Course overview"
            title="Nine modules. One clear path."
            subtitle="Tap a module to see what you will be able to do—and how long it takes."
            className="pt-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {COURSE_MODULES.map((module, index) => (
                <CourseCardReveal key={module.id} module={module} index={index} onSelect={openModule} />
              ))}
            </div>
          </Section>

          {/* Philosophy */}
          <Section
            eyebrow="Approach"
            title="Why This Course Is Different"
            subtitle="Most training teaches theory. This course teaches how work actually functions. You will learn to see systems, identify gaps, and build structures that produce consistent, reliable results."
            className="pt-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/50 bg-white/50 backdrop-blur-md px-6 py-8 text-center shadow-md shadow-slate-900/5 transition-transform duration-200 ease-out hover:-translate-y-0.5"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-sky-100/60 shadow-sm">
                    {p.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                </div>
              ))}
            </div>
          </Section>

          {/* Final CTA */}
          <section className="pb-20 sm:pb-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-white/50 bg-gradient-to-br from-white/80 via-sky-50/50 to-blue-50/40 backdrop-blur-xl px-6 sm:px-10 lg:px-14 py-12 sm:py-16 text-center shadow-lg shadow-sky-900/5 ring-1 ring-sky-100/40">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight text-balance">
                  Start Building Better Systems Today
                </h2>
                <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto leading-relaxed text-pretty">
                  The difference between struggling operations and high-performing organizations is not effort—it is structure.
                </p>
                <div className="mt-10">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-semibold px-8 py-3.5 shadow-md shadow-slate-900/15 transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50/80"
                  >
                    Begin Course
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        module={selectedModule}
        onClose={closeModule}
        titleId={modalTitleId}
        returnFocusRef={returnFocusRef}
      />
    </>
  );
};

export default ECourses;
