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
    image: 'https://preqal.org/og/home.png',
    description: 'Preqal sets up ISO 9001 management systems for small and medium businesses in Guyana and the Caribbean, with two aims: process improvement across the operation and strategic direction for top management. It is a consultancy, not a certification body: Preqal builds the system with the client\'s team, and an accredited certification body audits and certifies it.',
    foundingDate: '2023',
    founder: {
      '@type': 'Person',
      name: 'Dr. Stefan Gravesande',
      jobTitle: 'Founder & CEO',
      url: 'https://preqal.org/contact'
    },
    // The address the verified Business Profile and the footer both carry.
    address: {
      '@type': 'PostalAddress',
      streetAddress: '90 Waiakabra, Soesdyke Linden Highway',
      addressLocality: 'East Bank Demerara',
      addressRegion: 'Demerara-Mahaica',
      addressCountry: 'GY'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+5926335874',
      url: 'https://preqal.org/contact',
      availableLanguage: 'English'
    },
    telephone: '+5926335874',
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
      'https://www.youtube.com/@Preqal',
      'https://g.page/r/CfdKTnSDkdYGEBM',
      'https://maps.google.com/maps?cid=492741203021679351'
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
    description: 'Preqal is an ISO system setup consultancy for small and medium businesses in Guyana, working on process improvement and strategic direction for top management. Preqal is not "prequel" — it is unrelated to movies, fiction, or entertainment.',
    sameAs: [
      'https://www.linkedin.com/company/preqal',
      'https://www.facebook.com/preqal',
      'https://www.youtube.com/@Preqal',
      'https://g.page/r/CfdKTnSDkdYGEBM'
    ]
  };
};

