import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const SEOHealth: React.FC = () => {
  const [seoData, setSeoData] = useState<{
    title: string | null;
    description: string | null;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    schema: boolean;
  }>({
    title: null,
    description: null,
    canonical: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    schema: false,
  });

  useEffect(() => {
    // Extract SEO data from the page
    const title = document.querySelector('title')?.textContent || null;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || null;
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null;
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null;
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
    const schema = !!document.querySelector('script[type="application/ld+json"]');

    setSeoData({
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      schema,
    });
  }, []);

  const checkStatus = (value: string | boolean | null) => {
    if (typeof value === 'boolean') {
      return value;
    }
    return value !== null && value.trim() !== '';
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <>
      <SEO pageKey="seoHealth" />
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                <strong>Development Only:</strong> This page is excluded from production builds and should not be indexed by search engines.
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-8">SEO Health Check</h1>

          <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Current Page Metadata</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.title)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Title Tag</p>
                    <p className="text-sm text-neutral-600">{seoData.title || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.description)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Meta Description</p>
                    <p className="text-sm text-neutral-600">{seoData.description || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.canonical)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Canonical URL</p>
                    <p className="text-sm text-neutral-600">{seoData.canonical || 'Not found'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Open Graph Tags</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.ogTitle)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">OG: Title</p>
                    <p className="text-sm text-neutral-600">{seoData.ogTitle || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.ogDescription)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">OG: Description</p>
                    <p className="text-sm text-neutral-600">{seoData.ogDescription || 'Not found'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <StatusIcon status={checkStatus(seoData.ogImage)} />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">OG: Image</p>
                    <p className="text-sm text-neutral-600">{seoData.ogImage || 'Not found'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Structured Data</h2>
              <div className="flex items-start space-x-3">
                <StatusIcon status={seoData.schema} />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">JSON-LD Schema</p>
                  <p className="text-sm text-neutral-600">
                    {seoData.schema ? 'Organization schema found' : 'No schema found'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Site Files</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-500 underline"
                  >
                    robots.txt
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-500 underline"
                  >
                    sitemap.xml
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SEOHealth;

