export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://preqal.org/#website',
    name: 'Preqal',
    alternateName: ['Preqal Inc', 'preqal.org'],
    url: 'https://preqal.org',
    description: 'Preqal provides ISO-aligned quality management systems, safety management systems, and ESG programs for businesses across Guyana and the Caribbean.',
    inLanguage: 'en',
    publisher: {
      '@id': 'https://preqal.org/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://preqal.org/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
};

