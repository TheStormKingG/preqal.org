import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const webpageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  headline: 'Preqal (Not Prequel) | Brand Clarification',
  url: 'https://preqal.org/#/preqal-not-prequel',
  description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is a quality, safety, ESG, and integrated management systems company.',
};

const PreqalNotPrequel: React.FC = () => {
  return (
    <>
      <SEO pageKey="preqalNotPrequel" />
      <div className="min-h-screen pb-20">
        {/* Header - Dark with Seamless Fade and Pattern */}
        <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 relative overflow-hidden text-white">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Preqal (Not Prequel)</h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Brand Clarification and Disambiguation
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
          <article className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <section>
              <p className="text-lg text-neutral-700 leading-relaxed mb-4">
                <strong>Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology.</strong> This page exists to clarify the distinction and help search engines and users understand that Preqal is a distinct brand name in the quality management and compliance industry.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                <strong>Preqal is a quality, safety, ESG, and integrated management systems company.</strong> We specialize in helping businesses across Guyana and the Caribbean build evidence-driven management systems that align with ISO standards, regulatory requirements, and industry best practices.
              </p>
            </section>

            {/* What is Preqal */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 border-l-4 border-amber-500 pl-4">What is Preqal?</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Preqal is a professional services company that provides quality, safety, and environmental compliance solutions. Founded with a mission to help organizations move from chaos to compliance, Preqal offers a comprehensive suite of services including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-4 ml-4">
                <li>Quality Risk Scans and diagnostic assessments</li>
                <li>Integrated Management System (IMS) design and setup</li>
                <li>Standard Operating Procedure (SOP) development</li>
                <li>Training and competency programs</li>
                <li>Audit readiness support</li>
                <li>Custom web application development for operational workflows</li>
              </ul>
              <p className="text-neutral-700 leading-relaxed">
                Preqal serves clients across diverse sectors including poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations. Our approach is evidence-driven, risk-based, and tailored to each organization's specific needs.
              </p>
            </section>

            {/* Why the Confusion */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4 border-l-4 border-amber-500 pl-4">Why the Confusion?</h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                The word "prequel" is a well-established term in literature and film, referring to a work that precedes another in narrative chronology. Because "Preqal" and "prequel" are phonetically similar, search engines and users may sometimes confuse the two terms.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                However, Preqal has no connection to entertainment, storytelling, or fictional narratives. Preqal is exclusively focused on real-world business operations, quality management, safety systems, and regulatory compliance.
              </p>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 border-l-4 border-amber-500 pl-4">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Is Preqal related to movies or entertainment?</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    No. Preqal is not related to movies, entertainment, or any form of media. Preqal is a quality management and compliance consulting company.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">What does Preqal do?</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Preqal helps businesses build quality, safety, and environmental management systems. We provide services such as risk assessments, ISO compliance support, documentation development, training, and audit preparation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Where is Preqal located?</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Preqal operates primarily in Guyana and serves clients across the Caribbean region. We work with businesses of all sizes, from small shops to large corporations.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">How do I contact Preqal?</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    You can contact Preqal through our <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline">contact page</Link>, or learn more about our services on our <Link to="/services" className="text-amber-600 hover:text-amber-500 font-semibold underline">services page</Link>.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">Is Preqal the same as "prequel"?</h3>
                  <p className="text-neutral-700 leading-relaxed">
                    No. Preqal is a brand name and company name, while "prequel" is a common English word referring to a narrative work that precedes another. They are completely unrelated concepts.
                  </p>
                </div>
              </div>
            </section>

            {/* Navigation Links */}
            <section className="pt-8 border-t border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Learn More About Preqal</h2>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold rounded-lg border border-neutral-300 transition-colors"
                >
                  About Preqal
                </Link>
                <Link 
                  to="/services" 
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold rounded-lg border border-neutral-300 transition-colors"
                >
                  Our Services
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold rounded-lg border border-neutral-300 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </section>

          </article>
        </div>
      </div>
      
      {/* WebPage Schema */}
      <script type="application/ld+json">
        {JSON.stringify(webpageSchema)}
      </script>
    </>
  );
};

export default PreqalNotPrequel;

