export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

const BASE_URL = 'https://preqal.org';
const DEFAULT_OG_IMAGE = `${BASE_URL}/Preqal%20Logo%20Sep25-9.webp`;

export const getSeoMeta = (pageKey: string): SEOData => {
  const seoMap: Record<string, SEOData> = {
    home: {
      title: 'Preqal | ISO Quality, Safety & ESG Management Systems',
      description: 'Preqal delivers quality, safety & ESG management systems—audits, SOPs, risk tools and training—so teams stay compliant, capable, and always ready now.',
      canonical: `${BASE_URL}/`,
      ogImage: `${BASE_URL}/og/home.webp`,
      ogType: 'website'
    },
    about: {
      title: 'About Preqal | Quality & Compliance Systems',
      description: 'Preqal builds quality, safety & ESG management systems for all sectors—from small shops to large corporations. Evidence-driven compliance for every scale.',
      canonical: `${BASE_URL}/about/`,
      ogImage: `${BASE_URL}/og/about.webp`,
      ogType: 'website'
    },
    services: {
      title: 'Services | Preqal Quality & Compliance Solutions',
      description: 'Quality, safety & ESG compliance services: Quality Risk Scans, IMS Design, Documentation Systems, Training, and Audit Support from Preqal.',
      canonical: `${BASE_URL}/services/`,
      ogImage: `${BASE_URL}/og/services.webp`,
      ogType: 'website'
    },
    contact: {
      title: 'Contact Preqal | Get in Touch',
      description: 'Contact Preqal to discuss your quality, safety, and compliance needs. We help businesses move from chaos to compliance with evidence-driven management systems.',
      canonical: `${BASE_URL}/contact/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    caseStudies: {
      title: 'Case Studies | Preqal Success Stories',
      description: 'Explore real case studies from Preqal clients across poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations.',
      canonical: `${BASE_URL}/case-studies/`,
      ogImage: `${BASE_URL}/og/case-studies.webp`,
      ogType: 'website'
    },
    resources: {
      title: 'Resources | Preqal Quality Templates & Tools',
      description: 'Access Preqal\'s library of quality management templates, tools, and resources to support your compliance journey.',
      canonical: `${BASE_URL}/resources/`,
      ogImage: `${BASE_URL}/og/resources.webp`,
      ogType: 'website'
    },
    eCourses: {
      title: 'E-Course | Preqal — Practical QMS Learning',
      description: 'Nine-module QMS e-course covering process thinking, risk, documentation, audits, CAPA, and improvement—practical and built for real operations.',
      canonical: `${BASE_URL}/e-courses/`,
      ogImage: `${BASE_URL}/og/e-courses.webp`,
      ogType: 'website'
    },
    eCourseLearn: {
      title: 'E-Course Player | Preqal — QMS Modules',
      description: "Work through Preqal's practical QMS e-course: nine modules with clear outcomes, pacing, and navigation—built for real operations.",
      canonical: `${BASE_URL}/e-courses/learn/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      noindex: true
    },
    book: {
      title: 'Book a Risk Scan | Preqal',
      description: 'Book a Quality Risk Scan with Preqal. Our rapid diagnostic service finds your top compliance risks in 7 days—so you know exactly where to focus first.',
      canonical: `${BASE_URL}/book/`,
      ogImage: `${BASE_URL}/og/book.webp`,
      ogType: 'website'
    },
    businessGrowthAssessment: {
      title: 'Business Growth Investment Assessment | Preqal',
      description: 'Help Preqal understand your organisation to get the right level of support. Request a tailored quote via our Business Growth Investment Assessment.',
      canonical: `${BASE_URL}/business-growth-assessment/`,
      ogImage: `${BASE_URL}/og/bga.webp`,
      ogType: 'website'
    },
    // Legacy key — kept so any existing SEO component references don't break
    quoteClassifier: {
      title: 'Business Growth Investment Assessment | Preqal',
      description: 'Help Preqal understand your organisation so we can recommend the right level of support. Complete our Business Growth Investment Assessment to request a tailored quote.',
      canonical: `${BASE_URL}/business-growth-assessment/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    eCourseRegister: {
      title: 'Register for QMS E-Course | Preqal',
      description: "Register for Preqal's practical QMS e-course — Build Systems That Actually Work. Nine modules, real operations focus, and a certificate on completion.",
      canonical: `${BASE_URL}/e-courses/register/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    verifyCertificate: {
      title: 'Verify Certificate | Preqal',
      description: 'Verify the authenticity of a Preqal course certificate. Enter your certificate key to confirm completion of a Preqal QMS e-course.',
      canonical: `${BASE_URL}/verify/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website',
      noindex: true
    },
    preqalNotPrequel: {
      title: 'Preqal (Not Prequel) | Brand Clarification',
      description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is a quality, safety, ESG, and integrated management systems company.',
      canonical: `${BASE_URL}/preqal-not-prequel/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'article'
    },
    privacyPolicy: {
      title: 'Privacy Policy | Preqal',
      description: 'Read Preqal\'s GDPR-compliant Privacy Policy. We collect and protect your personal data under the Guyana Data Protection Act 2023 and international standards.',
      canonical: `${BASE_URL}/privacy-policy/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'article'
    },
    termsOfService: {
      title: 'Terms of Service | Preqal',
      description: 'Terms of Service for Preqal Inc. Read our terms governing use of preqal.org and our quality, safety, and ESG consulting services.',
      canonical: `${BASE_URL}/terms-of-service/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'article'
    },
    seoHealth: {
      title: 'SEO Health Check | Preqal',
      description: 'SEO health check page for development purposes.',
      canonical: `${BASE_URL}/seo-health/`,
      noindex: true
    }
  };

  return seoMap[pageKey] || seoMap.home;
};
