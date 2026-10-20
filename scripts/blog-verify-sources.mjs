#!/usr/bin/env node
/* The source gate the protocol has specified since day one and which, until
   now, did not exist — so nothing ever checked a citation. A post shipped
   with ten claims resting on three organisation landing pages.

   Three outcomes, deliberately, not two:
     OK          the quote is present on the page cited
     MISSING     the page loaded and the quote is not in it  -> a real failure
     UNVERIFIED  the page refused us (403/429/timeout)       -> not a pass

   The third is the one that matters. ISO returns 403 to a scripted fetch, so
   a two-state checker either fails six legitimate sources or gets relaxed
   until it passes everything. Conflating "the quote is not there" with "the
   site will not talk to a script" is how a gate becomes decorative. */

import { readFileSync } from 'node:fs';

const slug = process.argv[2];
if (!slug) { console.error('usage: blog-verify-sources.mjs <slug>'); process.exit(2); }

const post = JSON.parse(readFileSync(`content/blog/posts/${slug}.json`, 'utf8'));
const sources = post.sources ?? [];
if (sources.length === 0) { console.error('NO SOURCES — a post making factual claims with none is a failure'); process.exit(1); }

const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
                      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
                      .replace(/\s+/g, ' ');

const pages = new Map();
for (const s of sources) {
  if (pages.has(s.url)) continue;
  try {
    const r = await fetch(s.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36' },
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) { pages.set(s.url, { refused: `HTTP ${r.status}` }); continue; }
    const body = strip(await r.text());
    /* A 200 carrying almost nothing is a bot-block shell, not a page. iso.org
       serves 403 to fetch and a 257-character shell to a headless browser; a
       checker that treats that as readable reports every quote MISSING and
       sends someone to delete correct citations. Too-short is UNVERIFIED. */
    pages.set(s.url, body.length < 1200 ? { refused: `thin body (${body.length} chars) — looks like a bot block` } : body);
  } catch (e) {
    pages.set(s.url, { refused: String(e.name || e).slice(0, 40) });
  }
}

let ok = 0, missing = 0, unverified = 0;
const rows = [];
for (const [i, s] of sources.entries()) {
  const page = pages.get(s.url);
  const probe = (s.quote || '').trim().replace(/\s+/g, ' ').split(' ').slice(0, 8).join(' ');
  let verdict;
  if (!probe) verdict = 'MISSING';                       // a source with no quote proves nothing
  else if (page && page.refused) { verdict = 'UNVERIFIED'; unverified++; }
  else if (page.toLowerCase().includes(probe.toLowerCase())) { verdict = 'OK'; ok++; }
  else { verdict = 'MISSING'; missing++; }
  rows.push(`  ${String(i + 1).padStart(2)}. ${verdict.padEnd(11)} ${s.claimId ?? '-'}  ${s.url.slice(0, 54)}`);
}
console.log(rows.join('\n'));

/* A landing page cited for many distinct claims is the shape this post had,
   and every individual check can pass while the citation trail is worthless. */
const perUrl = sources.reduce((m, s) => m.set(s.url, (m.get(s.url) ?? 0) + 1), new Map());
const overloaded = [...perUrl].filter(([, n]) => n >= 4);

console.log(`\n  OK ${ok}  MISSING ${missing}  UNVERIFIED ${unverified}  of ${sources.length}`);
console.log(`  distinct URLs: ${perUrl.size} for ${sources.length} claims`);
if (overloaded.length) {
  console.log('  OVERLOADED (one page carrying 4+ distinct claims — cite the specific page):');
  for (const [u, n] of overloaded) console.log(`    ${n}x  ${u}`);
}
if (missing > 0 || overloaded.length) process.exit(1);
if (unverified > 0) { console.log('  PASS WITH UNVERIFIED — report these, do not call the post clean'); process.exit(0); }
process.exit(0);
