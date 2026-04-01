import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const webpageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://preqal.org/preqal-not-prequel/#webpage',
  headline: 'Preqal (Not Prequel) | Brand Clarification',
  url: 'https://preqal.org/preqal-not-prequel',
  description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is a quality, safety, ESG, and integrated management systems company.',
  about: {
    '@id': 'https://preqal.org/#organization'
  },
  isPartOf: {
    '@id': 'https://preqal.org/#website'
  }
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Preqal related to movies or entertainment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Preqal is not related to movies, entertainment, or any form of media. Preqal is a quality management and compliance consulting company based in Georgetown, Guyana.'
      }
    },
    {
      '@type': 'Question',
      name: 'What does Preqal do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Preqal helps businesses build quality, safety, and environmental management systems. We provide services such as risk assessments, ISO compliance support, documentation development, training, and audit preparation.'
      }
    },
    {
      '@type': 'Question',
      name: 'Where is Preqal located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Preqal operates primarily in Georgetown, Guyana and serves clients across the Caribbean region. We work with businesses of all sizes, from small shops to large corporations.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I contact Preqal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can contact Preqal through the contact page at https://preqal.org/contact, or learn more about our services at https://preqal.org/services.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is Preqal the same as "prequel"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Preqal is a brand name and company name for a quality, safety, and ESG management systems consultancy. "Prequel" is a common English word referring to a narrative work that precedes another. They are completely unrelated concepts.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Preqal and prequel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Preqal (preqal.org) is a professional consulting company specializing in ISO-aligned quality management systems, safety management systems, and ESG programs. "Prequel" is an English word meaning a story set before a previously existing work. Preqal has no connection to entertainment, movies, or fiction.'
      }
    }
  ]
};

const PreqalNotPrequel: React.FC = () => {
  return (
    <>
      <SEO pageKey="preqalNotPrequel" />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="py-20 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Preqal (Not Prequel)</h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Brand Clarification and Disambiguation
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <article className="neu-card rounded-2xl p-8 md:p-12 space-y-8 animate-fade-in-up delay-100">
            <section>
              <p className="text-lg text-slate-700 leading-relaxed mb-4">
                <strong>Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology.</strong> This page exists to clarify the distinction and help search engines and users understand that Preqal is a distinct brand name in the quality management and compliance industry.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                <strong>Preqal is a quality, safety, ESG, and integrated management systems company.</strong> We specialize in helping businesses across Guyana and the Caribbean build evidence-driven management systems that align with ISO standards, regulatory requirements, and industry best practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">What is Preqal?</h2>
              <CollapsibleSection title="Services & offerings" headingLevel="h3" defaultOpen={true}>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Preqal is a professional services company that provides quality, safety, and environmental compliance solutions. Founded with a mission to help organizations move from chaos to compliance, Preqal offers:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4 ml-4">
                  <li>Quality Risk Scans and diagnostic assessments</li>
                  <li>Integrated Management System (IMS) design and setup</li>
                  <li>Standard Operating Procedure (SOP) development</li>
                  <li>Training and competency programs</li>
                  <li>Audit readiness support</li>
                  <li>Custom web application development for operational workflows</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  Preqal serves clients across diverse sectors including poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations.
                </p>
              </CollapsibleSection>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">Why the Confusion?</h2>
              <CollapsibleSection title="Phonetic similarity explained" headingLevel="h3">
                <p className="text-slate-700 leading-relaxed mb-4">
                  The word "prequel" is a well-established term in literature and film, referring to a work that precedes another in narrative chronology. Because "Preqal" and "prequel" are phonetically similar, search engines and users may sometimes confuse the two terms.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  However, Preqal has no connection to entertainment, storytelling, or fictional narratives. Preqal is exclusively focused on real-world business operations, quality management, safety systems, and regulatory compliance.
                </p>
              </CollapsibleSection>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 border-l-4 border-amber-500 pl-4">Frequently Asked Questions</h2>
              <div className="space-y-2">
                <CollapsibleSection title="Is Preqal related to movies or entertainment?" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">No. Preqal is not related to movies, entertainment, or any form of media. Preqal is a quality management and compliance consulting company.</p>
                </CollapsibleSection>
                <CollapsibleSection title="What does Preqal do?" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">Preqal helps businesses build quality, safety, and environmental management systems. We provide services such as risk assessments, ISO compliance support, documentation development, training, and audit preparation.</p>
                </CollapsibleSection>
                <CollapsibleSection title="Where is Preqal located?" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">Preqal operates primarily in Guyana and serves clients across the Caribbean region. We work with businesses of all sizes, from small shops to large corporations.</p>
                </CollapsibleSection>
                <CollapsibleSection title="How do I contact Preqal?" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">You can contact Preqal through our <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline">contact page</Link>, or learn more about our services on our <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">services page</Link>.</p>
                </CollapsibleSection>
                <CollapsibleSection title='Is Preqal the same as "prequel"?' headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">No. Preqal is a brand name and company name, while "prequel" is a common English word referring to a narrative work that precedes another. They are completely unrelated concepts.</p>
                </CollapsibleSection>
                <CollapsibleSection title="What is the difference between Preqal and prequel?" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">Preqal (<a href="https://preqal.org" className="text-amber-600 hover:text-amber-500 font-semibold underline">preqal.org</a>) is a professional consulting company specializing in ISO-aligned quality management systems, safety management systems, and ESG programs. "Prequel" is an English word meaning a story set before a previously existing work. Preqal has no connection to entertainment, movies, or fiction.</p>
                </CollapsibleSection>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-200/50">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Learn More About Preqal</h2>
              <div className="flex flex-wrap gap-3">
                <Link to="/" className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-colors neu-raised-sm">Home</Link>
                <Link to="/about" className="inline-flex items-center px-6 py-3 text-slate-700 font-semibold rounded-xl transition-all neu-card hover:neu-raised">About Preqal</Link>
                <Link to="/services" className="inline-flex items-center px-6 py-3 text-slate-700 font-semibold rounded-xl transition-all neu-card hover:neu-raised">Our Services</Link>
                <Link to="/contact" className="inline-flex items-center px-6 py-3 text-slate-700 font-semibold rounded-xl transition-all neu-card hover:neu-raised">Contact Us</Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <Helmet>
        <script type="application/ld+json">{JSON.stringify(webpageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
    </>
  );
};

export default PreqalNotPrequel;
