import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getSeoMeta } from '../../seo/seo';
import { getOrganizationSchema, getBrandSchema } from '../../seo/organizationSchema';
import { getWebsiteSchema } from '../../seo/websiteSchema';
import { getProfessionalServiceSchema } from '../../seo/pageSchemas';
import { routeMeta } from '../../scripts/route-meta.mjs';

/* Preqal sets up ISO management systems for small and medium businesses. It
   certifies nobody — an accredited body does that — yet the home page was
   titled "ISO Certification & Quality Experts", which is what a certifier
   would call itself. And the structured data placed the office in Georgetown
   while the verified Google Business Profile and the footer both put it at
   Waiakabra on the Soesdyke–Linden Highway. These hold the site's account of
   itself to what the company is and where it is, in every copy of that
   account, because the copies had already drifted from one another once. */

const root = path.resolve(__dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const unescape = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const tag = (html: string, re: RegExp) => {
  const m = html.match(re);
  if (!m) throw new Error(`index.html has no ${re}`);
  return unescape(m[1]);
};

/* The home title and description exist three times: index.html (the shell
   Vite serves), seo.ts (what Helmet writes at runtime) and route-meta.mjs
   (what the build stamps into the prerendered pages). */
const index = read('index.html');
const shell = {
  title: tag(index, /<title>([^<]*)<\/title>/),
  ogTitle: tag(index, /property="og:title" content="([^"]*)"/),
  twitterTitle: tag(index, /name="twitter:title" content="([^"]*)"/),
  description: tag(index, /name="description" content="([^"]*)"/),
  ogDescription: tag(index, /property="og:description" content="([^"]*)"/),
  twitterDescription: tag(index, /name="twitter:description" content="([^"]*)"/),
};
const helmet = getSeoMeta('home');
const prerender = routeMeta['/'];

describe('the home title', () => {
  it('is the same in the shell, at runtime, and in the prerender', () => {
    for (const copy of [shell.ogTitle, shell.twitterTitle, helmet.title, prerender.title]) {
      expect(copy).toBe(shell.title);
    }
  });

  it('names the niche: ISO systems, set up, for SMEs', () => {
    expect(shell.title).toMatch(/ISO/);
    expect(shell.title).toMatch(/system setup/i);
    expect(shell.title).toMatch(/SMEs/);
  });

  it('does not read as a certification body', () => {
    expect(shell.title).not.toMatch(/certif/i);
  });

  it('fits a search result', () => {
    expect(shell.title.length).toBeLessThanOrEqual(60);
  });
});

describe('the home description', () => {
  it('is the same in the shell, at runtime, and in the prerender', () => {
    for (const copy of [shell.ogDescription, shell.twitterDescription, helmet.description, prerender.description]) {
      expect(copy).toBe(shell.description);
    }
  });

  it('fits a search snippet', () => {
    expect(shell.description.length).toBeLessThanOrEqual(158);
  });
});

/* Every sentence that says what Preqal is. */
const opener = (file: string) => read(file).split('\n').find((l) => l.startsWith('> ')) ?? '';
const identity: Record<string, string> = {
  'home description': shell.description,
  'Organization schema': getOrganizationSchema().description,
  'Brand schema': getBrandSchema().description,
  'WebSite schema': getWebsiteSchema().description,
  'ProfessionalService schema': getProfessionalServiceSchema().description,
  'llms.txt': opener('public/llms.txt'),
  'llms-full.txt': opener('public/llms-full.txt'),
};

describe('what the site says Preqal is', () => {
  for (const [where, text] of Object.entries(identity)) {
    it(`${where}: a consultancy for small and medium businesses`, () => {
      expect(text).toMatch(/small and medium businesses|SMEs/);
      // "all types and sizes of businesses" was the line before the niche was chosen.
      expect(text).not.toMatch(/all (types and )?sizes/i);
    });
  }

  it('llms.txt and llms-full.txt open with the same account', () => {
    expect(identity['llms-full.txt']).toBe(identity['llms.txt']);
  });
});

/* Where it is. The verified Business Profile (Google cid 492741203021679351)
   is pinned at 90 Waiakabra on the Soesdyke–Linden Highway, and that is the
   address the footer prints. The schema has to say the same, or Google cannot
   tie the site to the profile. */
const PROFILE_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '90 Waiakabra, Soesdyke Linden Highway',
  addressLocality: 'East Bank Demerara',
  addressRegion: 'Demerara-Mahaica',
  addressCountry: 'GY',
};
const PROFILE_PIN = { '@type': 'GeoCoordinates', latitude: 6.5261522, longitude: -58.2185775 };

describe('where the site says Preqal is', () => {
  it('the footer prints the profile address', () => {
    const footer = read('components/Footer.tsx');
    expect(footer).toContain('90 Waiakabra');
    expect(footer).toContain('Soesdyke Linden Highway');
    expect(footer).toContain('East Bank Demerara');
  });

  it('the Organization schema carries the profile address', () => {
    expect(getOrganizationSchema().address).toEqual(PROFILE_ADDRESS);
  });

  it('the ProfessionalService schema carries the profile address and its map pin', () => {
    const business = getProfessionalServiceSchema();
    expect(business.address).toEqual(PROFILE_ADDRESS);
    expect(business.geo).toEqual(PROFILE_PIN);
  });

  it('nothing still places the office in Georgetown', () => {
    // Each of these once did. The Terms of Service is not here: naming
    // Georgetown as the mediation venue is a legal choice, not an address.
    const stale: [string, RegExp][] = [
      ['index.html', /Georgetown/],
      ['seo/seo.ts', /Georgetown/],
      ['scripts/route-meta.mjs', /Georgetown/],
      ['seo/organizationSchema.ts', /Georgetown/],
      ['seo/pageSchemas.ts', /Georgetown/],
      ['public/llms.txt', /Georgetown/],
      ['public/llms-full.txt', /Georgetown/],
      ['pages/PreqalNotPrequel.tsx', /in Georgetown/],
      ['pages/PrivacyPolicy.tsx', /Location:<\/strong> Georgetown/],
      ['pages/ServiceLanding.tsx', /written in Georgetown/],
    ];
    for (const [file, claim] of stale) {
      expect(read(file), file).not.toMatch(claim);
    }
  });
});
