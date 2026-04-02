export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://preqal.org/#organization',
    name: 'Preqal',
    legalName: 'Preqal Inc',
    alternateName: ['Preqal Inc', 'Preqal Inc.'],
    url: 'https://preqal.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://preqal.org/Preqal%20Logo%20Sep25-9.webp',
      width: 1200,
      height: 630
    },
    image: 'https://preqal.org/Preqal%20Logo%20Sep25-9.webp',
    description: 'Preqal is a quality, safety, ESG, and integrated management systems company. We build evidence-driven management systems for all types and sizes of businesses.',
    foundingDate: '2023',
    founder: {
      '@type': 'Person',
      name: 'Dr. Stefan Gravesande',
      jobTitle: 'Founder & CEO',
      url: 'https://preqal.org/about'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Georgetown',
      addressRegion: 'Demerara',
      addressCountry: 'GY'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: 'https://preqal.org/contact',
      availableLanguage: 'English'
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 2,
      maxValue: 10
    },
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
    sameAs: [
      'https://www.linkedin.com/company/preqal',
      'https://www.facebook.com/preqal',
      'https://www.youtube.com/@Preqal'
    ]
  };
};

export const getBrandSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': 'https://preqal.org/#brand',
    name: 'Preqal',
    alternateName: ['Preqal Inc', 'Preqal Inc.'],
    url: 'https://preqal.org',
    logo: 'https://preqal.org/Preqal%20Logo%20Sep25-9.webp',
    description: 'Preqal is a quality, safety, ESG, and integrated management systems brand. Preqal is not "prequel" — it is unrelated to movies, fiction, or entertainment.',
    sameAs: [
      'https://www.linkedin.com/company/preqal',
      'https://www.facebook.com/preqal',
      'https://www.youtube.com/@Preqal'
    ]
  };
};

