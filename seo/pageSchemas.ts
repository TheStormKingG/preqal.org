const BASE_URL = 'https://preqal.org';

export const getFounderPersonSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE_URL}/#founder`,
  name: 'Dr. Stefan Gravesande',
  honorificPrefix: 'Dr.',
  jobTitle: 'Founder & CEO',
  worksFor: {
    '@id': `${BASE_URL}/#organization`
  },
  url: `${BASE_URL}/about`,
  description:
    'Dr. Stefan Gravesande is the Founder and CEO of Preqal Inc., a quality, safety, and ESG management systems company serving businesses across Guyana and the Caribbean.',
  knowsAbout: [
    'Quality Management Systems',
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'Integrated Management Systems',
    'Occupational Health and Safety',
    'ESG',
    'Risk Management',
    'Audit Readiness'
  ],
  sameAs: [
    'https://www.linkedin.com/company/preqal'
  ]
});

export const getAboutPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${BASE_URL}/about#webpage`,
  url: `${BASE_URL}/about`,
  name: 'About Preqal | Quality & Compliance Systems',
  description:
    'Learn about Preqal Inc., a quality, safety, and ESG management systems company founded by Dr. Stefan Gravesande and serving businesses across Guyana and the Caribbean.',
  isPartOf: {
    '@id': `${BASE_URL}/#website`
  },
  about: {
    '@id': `${BASE_URL}/#organization`
  },
  mainEntity: {
    '@id': `${BASE_URL}/#founder`
  }
});

export const getRiskScanServiceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${BASE_URL}/#service-risk-scan`,
  name: 'Quality Risk Scan™',
  serviceType: 'Quality Management Diagnostic',
  description:
    'A rapid seven-day diagnostic assessment that evaluates operational systems against ISO standards, regulatory requirements, and industry best practices. Delivers a prioritized Red Flag Report and strategic roadmap.',
  provider: {
    '@id': `${BASE_URL}/#organization`
  },
  areaServed: [
    { '@type': 'Country', name: 'Guyana' },
    { '@type': 'Place', name: 'Caribbean' }
  ],
  offers: {
    '@type': 'Offer',
    name: 'Quality Risk Scan™',
    description:
      'Seven-day quality risk scan delivering a prioritized Red Flag Report and compliance roadmap.',
    url: `${BASE_URL}/book`
  }
});

export const getBookPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${BASE_URL}/book#webpage`,
  url: `${BASE_URL}/book`,
  name: 'Book a Risk Scan | Preqal',
  description:
    'Book a Quality Risk Scan with Preqal. Find your top compliance risks in 7 days with our rapid diagnostic service.',
  isPartOf: {
    '@id': `${BASE_URL}/#website`
  },
  mainEntity: {
    '@id': `${BASE_URL}/#service-risk-scan`
  }
});
