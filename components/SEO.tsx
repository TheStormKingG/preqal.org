import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOData, getSeoMeta } from '../seo/seo';
import { getOrganizationSchema } from '../seo/organizationSchema';

interface SEOProps {
  pageKey: string;
  customData?: Partial<SEOData>;
}

const SEO: React.FC<SEOProps> = ({ pageKey, customData }) => {
  const seoData = { ...getSeoMeta(pageKey), ...customData };
  const orgSchema = getOrganizationSchema();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <link rel="canonical" href={seoData.canonical} />
      
      {/* Noindex if specified */}
      {seoData.noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seoData.ogType || 'website'} />
      <meta property="og:url" content={seoData.canonical} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.ogImage || 'https://preqal.org/Preqal%20Logo%20Sep25-9.png'} />
      <meta property="og:site_name" content="Preqal" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoData.canonical} />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.ogImage || 'https://preqal.org/Preqal%20Logo%20Sep25-9.png'} />

      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;

