// Service schemas for structured data
// Defines the core services Preqal offers

export const getServicesSchema = () => {
  const organizationId = 'https://preqal.org/#organization';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://preqal.org/#services',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          '@id': 'https://preqal.org/#service-quality-management',
          name: 'Quality Management Systems',
          serviceType: 'Quality Management System',
          description: 'ISO 9001-aligned quality management systems that ensure consistent product and service quality, customer satisfaction, and continuous improvement.',
          provider: {
            '@id': organizationId
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
          offers: {
            '@type': 'Offer',
            description: 'End-to-end quality management system design, implementation, and certification support'
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          '@id': 'https://preqal.org/#service-safety-management',
          name: 'Safety Management Systems',
          serviceType: 'Safety Management System',
          description: 'ISO 45001-aligned occupational health and safety management systems that protect workers and ensure workplace safety compliance.',
          provider: {
            '@id': organizationId
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
          offers: {
            '@type': 'Offer',
            description: 'Comprehensive safety management system development, training, and audit readiness support'
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          '@id': 'https://preqal.org/#service-esg',
          name: 'ESG Systems',
          serviceType: 'Environmental, Social, and Governance Management',
          description: 'ESG programs and ISO 14001-aligned environmental management systems that support sustainable operations and regulatory compliance.',
          provider: {
            '@id': organizationId
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
          offers: {
            '@type': 'Offer',
            description: 'ESG program development, environmental management systems, and sustainability reporting'
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Service',
          '@id': 'https://preqal.org/#service-ims',
          name: 'Integrated Management Systems',
          serviceType: 'Integrated Management System',
          description: 'Unified management systems that combine quality, safety, and environmental processes into a single, efficient framework aligned with ISO 9001, ISO 14001, and ISO 45001.',
          provider: {
            '@id': organizationId
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
          offers: {
            '@type': 'Offer',
            description: 'Complete integrated management system design, implementation, training, and certification support'
          }
        }
      }
    ]
  };
};

