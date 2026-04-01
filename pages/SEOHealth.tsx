import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const SEOHealth: React.FC = () => {
  const [seoData, setSeoData] = useState<{
    title: string | null; description: string | null; canonical: string | null;
    ogTitle: string | null; ogDescription: string | null; ogImage: string | null; schema: boolean;
  }>({ title: null, description: null, canonical: null, ogTitle: null, ogDescription: null, ogImage: null, schema: false });

  useEffect(() => {
    setSeoData({
      title: document.querySelector('title')?.textContent || null,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
      schema: !!document.querySelector('script[type="application/ld+json"]'),
    });
  }, []);

  const checkStatus = (value: string | boolean | null) => typeof value === 'boolean' ? value : value !== null && value.trim() !== '';
  const StatusIcon = ({ status }: { status: boolean }) => status ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />;

  return (
    <>
      <SEO pageKey="seoHealth" />
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="neu-pressed rounded-xl p-4 mb-6 border-l-4 border-yellow-400">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-slate-600"><strong>Development Only:</strong> This page is excluded from production builds and should not be indexed by search engines.</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-8">SEO Health Check</h1>

          <div className="neu-card rounded-2xl p-6 space-y-6">
            {[
              { heading: "Current Page Metadata", items: [
                { label: "Title Tag", value: seoData.title },
                { label: "Meta Description", value: seoData.description },
                { label: "Canonical URL", value: seoData.canonical },
              ]},
              { heading: "Open Graph Tags", items: [
                { label: "OG: Title", value: seoData.ogTitle },
                { label: "OG: Description", value: seoData.ogDescription },
                { label: "OG: Image", value: seoData.ogImage },
              ]},
            ].map((section) => (
              <div key={section.heading}>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.heading}</h2>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-start space-x-3">
                      <StatusIcon status={checkStatus(item.value)} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.value || 'Not found'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Structured Data</h2>
              <div className="flex items-start space-x-3">
                <StatusIcon status={seoData.schema} />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">JSON-LD Schema</p>
                  <p className="text-sm text-slate-500">{seoData.schema ? 'Organization schema found' : 'No schema found'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Site Files</h2>
              <div className="space-y-2">
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 underline block">robots.txt</a>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500 underline block">sitemap.xml</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SEOHealth;
