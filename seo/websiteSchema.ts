// WebSite schema for structured data
// Some SEO tools detect WebSite schema more reliably than Organization schema

export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://preqal.org/#website',
    name: 'Preqal',
    url: 'https://preqal.org',
    description: 'Preqal provides ISO-aligned quality management systems, safety management systems, and ESG programs for businesses across Guyana and the Caribbean.',
    publisher: {
      '@id': 'https://preqal.org/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://preqal.org/#/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

