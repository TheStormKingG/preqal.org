import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOData, getSeoMeta } from '../seo/seo';
import { getOrganizationSchema, getBrandSchema } from '../seo/organizationSchema';
import { getWebsiteSchema } from '../seo/websiteSchema';
import { getServicesSchema } from '../seo/servicesSchema';

interface SEOProps {
  pageKey: string;
  customData?: Partial<SEOData>;
  extraSchemas?: object[];
}

/* The build prerenders every route with a headless browser and snapshots the
   page when this event fires. Helmet writes the JSON-LD into <head> a beat
   after render, so a snapshot taken on a timer raced it — and lost on every
   page but the home page, leaving the guides and services with no structured
   data at all. Fire once the scripts are actually in the head, or after a
   deadline so the build can never hang. */
const PRERENDER_EVENT = 'prerender-ready';
const PRERENDER_DEADLINE_MS = 3000;
const signalPrerender = (expected: number) => {
  const started = performance.now();
  const tick = () => {
    const have = document.querySelectorAll('script[type="application/ld+json"][data-rh]').length;
    if (have >= expected || performance.now() - started > PRERENDER_DEADLINE_MS) {
      // The renderer listens on document; an event sent to window never
      // reaches it, and the build waits on every route until it is killed.
      document.dispatchEvent(new Event(PRERENDER_EVENT));
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const SEO: React.FC<SEOProps> = ({ pageKey, customData, extraSchemas }) => {
  useEffect(() => {
    signalPrerender(4 + (extraSchemas?.length ?? 0)); // the four site-wide blocks plus this page's
    // Re-armed on every route: the page key changes, the head is rewritten.
  }, [pageKey, extraSchemas?.length]);

  const seoData = { ...getSeoMeta(pageKey), ...customData };
  const orgSchema = getOrganizationSchema();
  const brandSchema = getBrandSchema();
  const websiteSchema = getWebsiteSchema();
  const servicesSchema = getServicesSchema();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <link rel="canonical" href={seoData.canonical} />
      
      {/* Noindex if specified */}
      {seoData.noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Brand identity reinforcement */}
      <meta name="author" content="Preqal Inc" />
      <meta name="application-name" content="Preqal" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seoData.ogType || 'website'} />
      <meta property="og:url" content={seoData.canonical} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.ogImage || 'https://preqal.org/Preqal%20Logo%20Sep25-9.webp'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Preqal: ISO system setup for SMEs in Guyana" />
      <meta property="og:site_name" content="Preqal" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Preqal" />
      <meta name="twitter:creator" content="@Preqal" />
      <meta name="twitter:url" content={seoData.canonical} />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.ogImage || 'https://preqal.org/Preqal%20Logo%20Sep25-9.webp'} />
      <meta name="twitter:image:alt" content="Preqal - Quality, Safety & ESG Systems" />

      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(orgSchema)}
      </script>

      {/* Brand Structured Data - Helps Google distinguish "Preqal" as a brand entity */}
      <script type="application/ld+json">
        {JSON.stringify(brandSchema)}
      </script>
      
      {/* WebSite Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* Services Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(servicesSchema)}
      </script>

      {/* Page-specific structured data */}
      {extraSchemas?.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

