export const getServiceSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'Service',
        name: 'Quality Risk Scan™',
        description: 'A rapid, on-site or virtual diagnostic to identify gaps in your current system compared to ISO, regulatory, or client requirements.',
        provider: {
          '@type': 'Organization',
          name: 'Preqal'
        },
        areaServed: {
          '@type': 'Country',
          name: 'Guyana'
        }
      },
      {
        '@type': 'Service',
        name: 'IMS Design & Setup',
        description: 'We architect your Integrated Management System (IMS) from the ground up, including policy formulation and process mapping.',
        provider: {
          '@type': 'Organization',
          name: 'Preqal'
        }
      },
      {
        '@type': 'Service',
        name: 'SOP & Procedure Development',
        description: 'We replace text-heavy manuals with visual SOPs, flowcharts, and checklists that frontline teams can actually use.',
        provider: {
          '@type': 'Organization',
          name: 'Preqal'
        }
      },
      {
        '@type': 'Service',
        name: 'Training & Competency',
        description: 'On-site workshops and digital modules focused on safe work practices, environmental care, and accurate data recording.',
        provider: {
          '@type': 'Organization',
          name: 'Preqal'
        }
      },
      {
        '@type': 'Service',
        name: 'Audit Readiness Support',
        description: 'Mock audits and coaching sessions to prepare your team for external certification (ISO 9001, ISO 14001, ISO 45001) or regulatory inspections.',
        provider: {
          '@type': 'Organization',
          name: 'Preqal'
        }
      }
    ]
  };
};

