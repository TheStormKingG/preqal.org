export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

const BASE_URL = 'https://preqal.org';
const DEFAULT_OG_IMAGE = `${BASE_URL}/Preqal%20Logo%20Sep25-9.png`;

export const getSeoMeta = (pageKey: string): SEOData => {
  const seoMap: Record<string, SEOData> = {
    home: {
      title: 'Preqal | ISO Quality, Safety & ESG Management Systems',
      description: 'Preqal delivers quality, safety & ESG management systems—audits, SOPs, risk tools and training—so teams stay compliant, capable, and always ready now.',
      canonical: `${BASE_URL}/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    about: {
      title: 'About Preqal | Quality & Compliance Systems',
      description: 'Preqal is a quality, safety, ESG, and integrated management systems company specializing in Quality and Compliance Systems for all sectors, from small shops to large corporations.',
      canonical: `${BASE_URL}/#/about`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    services: {
      title: 'Services | Preqal Quality & Compliance Solutions',
      description: 'Preqal offers comprehensive quality, safety, and compliance services including Quality Risk Scans, IMS Design, Documentation Systems, Training, and Audit Support.',
      canonical: `${BASE_URL}/#/services`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    contact: {
      title: 'Contact Preqal | Get in Touch',
      description: 'Contact Preqal to discuss your quality, safety, and compliance needs. We help businesses move from chaos to compliance with evidence-driven management systems.',
      canonical: `${BASE_URL}/#/contact`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    caseStudies: {
      title: 'Case Studies | Preqal Success Stories',
      description: 'Explore real case studies from Preqal clients across poultry, logistics, food-handling, eco-hospitality, oil & gas services, and waste/environmental operations.',
      canonical: `${BASE_URL}/#/case-studies`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    resources: {
      title: 'Resources | Preqal Quality Templates & Tools',
      description: 'Access Preqal\'s library of quality management templates, tools, and resources to support your compliance journey.',
      canonical: `${BASE_URL}/#/resources`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    book: {
      title: 'Book a Risk Scan | Preqal',
      description: 'Book a Quality Risk Scan with Preqal. Find your top compliance risks in 7 days with our rapid diagnostic service.',
      canonical: `${BASE_URL}/#/book`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'website'
    },
    preqalNotPrequel: {
      title: 'Preqal (Not Prequel) | Brand Clarification',
      description: 'Preqal is not "prequel" and is unrelated to movies, fiction, or film terminology. Preqal is a quality, safety, ESG, and integrated management systems company.',
      canonical: `${BASE_URL}/#/preqal-not-prequel`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: 'article'
    },
    seoHealth: {
      title: 'SEO Health Check | Preqal',
      description: 'SEO health check page for development purposes.',
      canonical: `${BASE_URL}/#/seo-health`,
      noindex: true
    }
  };

  return seoMap[pageKey] || seoMap.home;
};

