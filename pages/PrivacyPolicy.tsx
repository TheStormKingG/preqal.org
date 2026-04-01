import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import CollapsibleSection from '../components/CollapsibleSection';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'April 1, 2026';

  return (
    <>
      <SEO pageKey="privacyPolicy" />
      <div className="min-h-screen pb-20">
        <div className="py-20 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="neu-card rounded-2xl p-8 md:p-12 animate-fade-in-up delay-100">
            <div className="prose prose-slate max-w-none space-y-6">

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">1. Who We Are</h2>
                <p className="text-slate-700 leading-relaxed">
                  Preqal Inc ("Preqal", "we", "us", or "our") is a quality, safety, and ESG management systems consultancy. We are the data controller responsible for your personal data collected through this website (<strong>preqal.org</strong>).
                </p>
                <div className="neu-pressed-sm rounded-xl p-4 mt-4 text-sm text-slate-600 space-y-1">
                  <p><strong>Business Name:</strong> Preqal Inc</p>
                  <p><strong>Founded by:</strong> Dr. Stefan Gravesande, MBBS</p>
                  <p><strong>Contact Email:</strong> privacy@preqal.org</p>
                  <p><strong>Location:</strong> Georgetown, Guyana</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">2. Data We Collect</h2>
                <p className="text-slate-700 leading-relaxed mb-4">We collect the following categories of personal data:</p>
                <CollapsibleSection title="Information you provide directly" headingLevel="h3" defaultOpen={true}>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Contact forms & service requests:</strong> First name, last name, email address, phone number (including country code and dial code), company name, job title</li>
                    <li><strong>Resource downloads:</strong> Same as above, plus your most pressing quality problem and optional message</li>
                    <li><strong>Service bookings:</strong> Name, email, phone, company, business type, preferred session style, and project details</li>
                  </ul>
                </CollapsibleSection>
                <CollapsibleSection title="Information collected automatically" headingLevel="h3">
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Analytics data:</strong> Via Google Analytics 4 — page views, session duration, referral source, device type, browser, and approximate geographic location (city-level)</li>
                    <li><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies (Google Analytics). No advertising or tracking cookies are used</li>
                    <li><strong>IP addresses:</strong> Collected by our hosting provider (GitHub Pages) and analytics service. Used for IP canonicalization and security purposes only</li>
                  </ul>
                </CollapsibleSection>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">3. How We Use Your Data</h2>
                <p className="text-slate-700 leading-relaxed mb-4">We process your personal data for the following purposes and on the following legal bases:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-700 border-collapse">
                    <thead>
                      <tr className="neu-pressed-sm">
                        <th className="text-left p-3 font-semibold text-slate-800">Purpose</th>
                        <th className="text-left p-3 font-semibold text-slate-800">Legal Basis (GDPR Art. 6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      <tr><td className="p-3">Responding to contact form inquiries</td><td className="p-3">Legitimate interest / Pre-contractual measures</td></tr>
                      <tr><td className="p-3">Processing service bookings</td><td className="p-3">Contract performance</td></tr>
                      <tr><td className="p-3">Delivering downloadable resources</td><td className="p-3">Consent (form submission)</td></tr>
                      <tr><td className="p-3">Sending email notifications to our team</td><td className="p-3">Legitimate interest</td></tr>
                      <tr><td className="p-3">Website analytics and improvement</td><td className="p-3">Legitimate interest</td></tr>
                      <tr><td className="p-3">Security and fraud prevention</td><td className="p-3">Legitimate interest</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-600 text-sm mt-4">We do not use your data for automated decision-making, profiling, or marketing communications unless you explicitly opt in.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">4. Third-Party Data Processors</h2>
                <p className="text-slate-700 leading-relaxed mb-4">Your personal data may be shared with the following trusted third-party services:</p>
                <CollapsibleSection title="Service providers" headingLevel="h3" defaultOpen={true}>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Supabase</strong> (database hosting) — stores form submissions securely. Supabase maintains SOC 2 Type II compliance. Data may be processed in the United States under Standard Contractual Clauses</li>
                    <li><strong>EmailJS</strong> (email delivery) — transmits form data to our team email. Data processed in accordance with EmailJS privacy policy</li>
                    <li><strong>Google Analytics 4</strong> (analytics) — collects anonymized usage data. Google is certified under the EU-US Data Privacy Framework</li>
                    <li><strong>GitHub Pages</strong> (hosting) — serves the website. GitHub/Microsoft maintains compliance with GDPR requirements</li>
                  </ul>
                </CollapsibleSection>
                <p className="text-slate-600 text-sm mt-4">We do not sell, rent, or trade your personal data to any third party for marketing or any other purpose.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">5. International Data Transfers</h2>
                <p className="text-slate-700 leading-relaxed">
                  Preqal operates from Guyana. Some of our third-party processors are located outside of Guyana and the European Economic Area (EEA). Where personal data is transferred internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) as approved by the European Commission and compliance with the EU-US Data Privacy Framework where applicable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">6. Data Retention</h2>
                <p className="text-slate-700 leading-relaxed mb-4">We retain personal data only for as long as necessary to fulfil the purposes for which it was collected:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Contact form and service request data:</strong> Retained for 24 months from the date of submission, then deleted unless an ongoing business relationship exists</li>
                  <li><strong>Resource download leads:</strong> Retained for 24 months from submission</li>
                  <li><strong>Analytics data:</strong> Google Analytics data is retained for 14 months (Google's default)</li>
                  <li><strong>Email records:</strong> Retained in accordance with our email provider's standard retention policies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">7. Your Rights</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Under the GDPR (for EU/EEA residents), the Guyana Data Protection Act 2023, and other applicable data protection laws, you have the following rights:
                </p>
                <CollapsibleSection title="Your data protection rights" headingLevel="h3" defaultOpen={true}>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                    <li><strong>Right to Restrict Processing:</strong> Request that we limit how we use your data</li>
                    <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                    <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw at any time without affecting the lawfulness of prior processing</li>
                    <li><strong>Right to Lodge a Complaint:</strong> You may file a complaint with the Guyana Data Protection Commission or, for EU residents, your local supervisory authority</li>
                  </ul>
                </CollapsibleSection>
                <p className="text-slate-700 leading-relaxed mt-4">
                  To exercise any of these rights, contact us at <strong>privacy@preqal.org</strong>. We will respond within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">8. Cookies</h2>
                <p className="text-slate-700 leading-relaxed mb-4">Our website uses the following cookies:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Essential cookies:</strong> Required for basic site functionality (session management, security)</li>
                  <li><strong>Analytics cookies:</strong> Google Analytics 4 cookies (_ga, _ga_*) to help us understand how visitors use our site. These cookies collect anonymized data and do not personally identify you</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-4">We do not use advertising cookies, social media tracking cookies, or any third-party marketing cookies.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">9. Children's Privacy</h2>
                <p className="text-slate-700 leading-relaxed">
                  Our services are not directed at individuals under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">10. Security</h2>
                <p className="text-slate-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encrypted data transmission (HTTPS/TLS), secure third-party processors with their own compliance certifications, and access controls limiting data access to authorized personnel only.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">11. Changes to This Policy</h2>
                <p className="text-slate-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will post the revised policy on this page with an updated "Last updated" date. We encourage you to review this page periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-amber-500 pl-4">12. Governing Law</h2>
                <p className="text-slate-700 leading-relaxed">
                  This Privacy Policy is governed by the laws of the Co-operative Republic of Guyana, including the Data Protection Act 2023. For EU/EEA residents, the provisions of the General Data Protection Regulation (GDPR) apply in addition to local law.
                </p>
              </section>

              <section className="pt-6 border-t border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us About Privacy</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="neu-pressed-sm rounded-xl p-4 text-sm text-slate-600 space-y-1">
                  <p><strong>Email:</strong> privacy@preqal.org</p>
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

export default PrivacyPolicy;
