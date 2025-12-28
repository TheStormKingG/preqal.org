// WebSite schema for structured data
// Some SEO tools detect WebSite schema more reliably than Organization schema

export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Preqal',
    url: 'https://preqal.org',
    description: 'Preqal provides ISO-aligned quality management systems, safety management systems, and ESG programs for businesses across Guyana and the Caribbean.',
    publisher: {
      '@type': 'Organization',
      name: 'Preqal',
      url: 'https://preqal.org',
      logo: {
        '@type': 'ImageObject',
        url: 'https://preqal.org/Preqal%20Logo%20Sep25-9.png'
      }
    }
  };
};

