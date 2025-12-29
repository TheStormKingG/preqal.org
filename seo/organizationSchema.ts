export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://preqal.org/#organization',
    name: 'Preqal',
    url: 'https://preqal.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://preqal.org/Preqal%20Logo%20Sep25-9.png',
      width: 1200,
      height: 630
    },
    description: 'Preqal is a quality, safety, ESG, and integrated management systems company. We build evidence-driven management systems for all types and sizes of businesses.',
    areaServed: [
      {
        '@type': 'Country',
        name: 'Guyana'
      },
      {
        '@type': 'Place',
        name: 'Caribbean'
      }
    ],
    knowsAbout: [
      'Quality Management',
      'Safety Management',
      'ESG',
      'Environmental, Social, and Governance',
      'Integrated Management Systems',
      'ISO Standards',
      'ISO 9001',
      'ISO 14001',
      'ISO 45001',
      'Compliance',
      'Risk Management',
      'Audit Readiness'
    ],
    sameAs: []
  };
};

