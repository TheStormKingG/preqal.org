export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://preqal.org/#website',
    name: 'Preqal',
    alternateName: ['Preqal Inc', 'preqal.org'],
    url: 'https://preqal.org',
    description: 'Preqal sets up ISO 9001 management systems for small and medium businesses across Guyana and the Caribbean, built with the client\'s own team to deliver process improvement and strategic direction for top management.',
    inLanguage: 'en',
    publisher: {
      '@id': 'https://preqal.org/#organization'
    }
  };
};
