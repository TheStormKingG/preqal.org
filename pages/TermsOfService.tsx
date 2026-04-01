import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const TermsOfService: React.FC = () => {
  const lastUpdated = 'April 1, 2026';

  return (
    <>
      <SEO pageKey="termsOfService" />
      <div className="min-h-screen pb-20">
        <div className="py-20 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="neu-card rounded-2xl p-8 md:p-12 animate-fade-in-up delay-100">
            <div className="prose prose-slate max-w-none space-y-6">

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">1. Agreement to Terms</h2>
                <p className="text-slate-700 leading-relaxed">
                  By accessing or using the Preqal website (<strong>preqal.org</strong>) and any services offered by Preqal Inc ("Preqal", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use our website or services.
                </p>
                <p className="text-slate-700 leading-relaxed mt-3">
                  These Terms constitute a legally binding agreement between you ("you", "your", or "Client") and Preqal Inc. We encourage you to read these Terms carefully before using our website or engaging our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">2. About Our Services</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Preqal provides quality management, safety management, ESG compliance consulting, and related professional services. Our offerings include but are not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Quality Risk Scans and diagnostic assessments</li>
                  <li>Integrated Management System (IMS) design and implementation</li>
                  <li>Standard Operating Procedure (SOP) development</li>
                  <li>Training and competency programs</li>
                  <li>Audit readiness support and certification preparation</li>
                  <li>Operational web application development</li>
                  <li>Specialized advisory and crisis support</li>
                  <li>Free downloadable resource templates</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">3. Use of the Website</h2>
                <CollapsibleSection title="Permitted use" headingLevel="h3" defaultOpen={true}>
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    <p>You may use our website for lawful purposes only. You agree not to:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Use the website in any way that violates applicable laws or regulations of Guyana or any other applicable jurisdiction</li>
                      <li>Submit false, misleading, or fraudulent information through any form on the website</li>
                      <li>Attempt to gain unauthorized access to any part of the website, its servers, or any connected systems</li>
                      <li>Use the website to transmit any malicious software, spam, or harmful content</li>
                      <li>Scrape, copy, or reproduce the website's content for commercial purposes without our written consent</li>
                      <li>Interfere with the proper functioning of the website</li>
                    </ul>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="Account and form submissions" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">
                    When submitting information through our contact forms, service request forms, or resource download forms, you are responsible for providing accurate and complete information. You represent that all information submitted is truthful and that you have the authority to provide it, including any company-related information.
                  </p>
                </CollapsibleSection>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">4. Intellectual Property</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  All content on this website — including but not limited to text, graphics, logos (including the Preqal logo and Preqal 360™ mark), images, software, and downloadable materials — is the intellectual property of Preqal Inc or its licensors and is protected by the Copyright Act of Guyana (Chapter 51:03), international copyright treaties, and applicable intellectual property laws.
                </p>
                <CollapsibleSection title="Downloadable resources" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">
                    Free resource templates provided through our website are licensed for your personal and internal business use only. You may not redistribute, resell, or publicly share these templates without our prior written consent. You may modify them for your organization's internal use. All templates are provided "as-is" and remain the intellectual property of Preqal Inc.
                  </p>
                </CollapsibleSection>
                <CollapsibleSection title="Trademarks" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">
                    "Preqal", "Preqal 360™", "Quality Risk Scan™", "Clinic on Quality™", and the Preqal logo are trademarks of Preqal Inc. Use of these marks without our written permission is prohibited. All other trademarks referenced on this website are the property of their respective owners.
                  </p>
                </CollapsibleSection>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">5. Consulting Services</h2>
                <CollapsibleSection title="Engagement terms" headingLevel="h3" defaultOpen={true}>
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    <p>Specific consulting engagements are governed by separate service agreements or statements of work executed between Preqal and the Client. These Terms apply to your use of the website and initial inquiries. In the event of a conflict between these Terms and a specific service agreement, the service agreement shall prevail.</p>
                    <p>Preqal reserves the right to decline any engagement at our sole discretion.</p>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="Nature of advice" headingLevel="h3">
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    <p>Our consulting services provide professional guidance and recommendations based on our expertise in quality management, safety management, and ESG systems. Our recommendations are advisory in nature and do not constitute legal, financial, or regulatory advice.</p>
                    <p>While we design systems aligned with ISO standards and regulatory requirements, we do not guarantee that any specific certification, regulatory approval, or audit outcome will be achieved. Outcomes depend on factors including your organization's commitment, implementation fidelity, and the decisions of certifying bodies or regulatory authorities.</p>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="Client obligations" headingLevel="h3">
                  <p className="text-slate-700 leading-relaxed">
                    Clients are responsible for providing accurate and timely information, cooperating with our team during engagements, implementing agreed-upon recommendations, and maintaining the management systems after our engagement concludes. Preqal is not responsible for any non-conformances, audit failures, or regulatory actions that result from a Client's failure to implement our recommendations or maintain their systems.
                  </p>
                </CollapsibleSection>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">6. Confidentiality</h2>
                <p className="text-slate-700 leading-relaxed">
                  We treat all Client information received during engagements as confidential. We will not disclose Client-specific information to third parties without your consent, except as required by law or legal process. Our case studies and marketing materials use sector-based descriptions only and never reveal client identities without express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">7. Limitation of Liability</h2>
                <div className="neu-pressed-sm rounded-xl p-5 text-slate-700 leading-relaxed space-y-3">
                  <p>
                    To the maximum extent permitted by the laws of Guyana and applicable international law:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Preqal's total liability arising from or in connection with the use of this website shall not exceed the amount paid by you to Preqal in the twelve (12) months preceding the claim, or GYD 100,000 (approximately USD 480), whichever is greater</li>
                    <li>Preqal shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunity, or goodwill</li>
                    <li>Preqal shall not be liable for any damages resulting from your reliance on information provided on this website or through our free resources</li>
                  </ul>
                  <p>
                    Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any liability that cannot be excluded by law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">8. Disclaimer of Warranties</h2>
                <p className="text-slate-700 leading-relaxed">
                  This website and its content are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.
                </p>
                <p className="text-slate-700 leading-relaxed mt-3">
                  Free downloadable templates and resources are provided as general-purpose starting points and may require customization for your specific organizational context. They do not constitute professional advice and should not be used as a substitute for engaging qualified consultants.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">9. Indemnification</h2>
                <p className="text-slate-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Preqal Inc, its founder, employees, agents, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from your use of the website, violation of these Terms, or infringement of any third party's rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">10. External Links</h2>
                <p className="text-slate-700 leading-relaxed">
                  Our website may contain links to third-party websites (e.g., ISO.org, ASQ.org, YouTube). These links are provided for your convenience and informational purposes only. We do not control, endorse, or assume responsibility for the content, privacy policies, or practices of any third-party sites. Accessing external links is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">11. Modifications to Terms</h2>
                <p className="text-slate-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to this page with an updated "Last updated" date. Your continued use of the website after any changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">12. Termination</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may suspend or terminate your access to the website at any time, without prior notice, if we reasonably believe you have violated these Terms. Upon termination, your right to use the website ceases immediately. Sections relating to intellectual property, limitation of liability, indemnification, and governing law shall survive termination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">13. Governing Law & Dispute Resolution</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  These Terms are governed by and construed in accordance with the laws of the Co-operative Republic of Guyana. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Guyana.
                </p>
                <CollapsibleSection title="Dispute resolution process" headingLevel="h3">
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    <p>Before initiating any formal legal proceedings, the parties agree to attempt to resolve disputes through the following process:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li><strong>Direct negotiation:</strong> The parties shall first attempt to resolve the dispute through good-faith direct negotiation within thirty (30) days of written notice of the dispute</li>
                      <li><strong>Mediation:</strong> If direct negotiation fails, the parties shall attempt mediation through a mutually agreed mediator in Georgetown, Guyana</li>
                      <li><strong>Litigation:</strong> If mediation fails, either party may pursue resolution through the courts of Guyana</li>
                    </ol>
                  </div>
                </CollapsibleSection>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">14. Severability</h2>
                <p className="text-slate-700 leading-relaxed">
                  If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">15. Entire Agreement</h2>
                <p className="text-slate-700 leading-relaxed">
                  These Terms, together with our <Link to="/privacy-policy" className="text-amber-600 hover:text-amber-500 font-semibold underline">Privacy Policy</Link>, constitute the entire agreement between you and Preqal regarding the use of this website. Any separate consulting service agreement will supplement (not replace) these Terms for the duration of that engagement.
                </p>
              </section>

              <section className="pt-6 border-t border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Questions?</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="neu-pressed-sm rounded-xl p-4 text-sm text-slate-600 space-y-1">
                  <p><strong>Email:</strong> legal@preqal.org</p>
                  <p><strong>General Contact:</strong> <Link to="/contact" className="text-amber-600 hover:text-amber-500 font-semibold underline">Contact Form</Link></p>
                </div>
              </section>

            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
