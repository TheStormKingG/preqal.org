# Search Console evidence

Snapshots of Google Search Console for `sc-domain:preqal.org`, read from the
Performance report and written here so topic and rewrite decisions rest on
data that is on disk and dated, not on figures carried in a prompt.

The weekly blog task reads the newest `search-console-*.csv` and must report
its topic evidence as `current`, `stale` or `absent` to match what is actually
here (see `docs/guides/blog-protocol.md`). Until 2026-11-12 this directory did
not exist, so two runs in a row reported `absent` and chose topics on aggregate
figures a month old.

## 2026-11-12 — last 3 months, Search type: Web

Totals: 25 clicks, 1.14k impressions, 2.2% CTR, average position 14.9.

- `search-console-2026-11-12.csv` — all 70 queries Google disclosed. They sum
  to 363 impressions; the other two thirds are anonymised low-volume queries
  that appear only in the page and country totals.
- `search-console-2026-11-12-pages.csv` — all 20 pages.
- `search-console-2026-11-12-countries.csv` — the top 18 countries.

How it was read: the report's table rows, taken from the page itself in the
owner's signed-in browser. No export was downloaded and no API was used.

## What it showed

1. **The cost guide answered a price question without a price.** Twenty-one
   phrasings of "how much does ISO 9001 cost" produced 168 impressions and no
   clicks. In Guyana the guide sat at position 3.8, which is page one, and
   still earned nothing from 22 impressions. The snippet promised "the three
   costs to separate"; the page contained no figure. Fixed the same day.
2. **Guyana is the market and it is small.** 363 impressions and 13 clicks in
   three months, most of them the brand name. The cost guide's other 158
   impressions are the United Kingdom and the United States at positions
   14 to 19, which is a different and much less valuable problem.
3. **Most service-page impressions are sitelinks.** `/services/business-plan/`
   shows 179 impressions, but the disclosed queries behind it are the brand
   name. Do not read those as demand for the service.
4. **`site preparation guyana` is noise.** 40 impressions at position 82 on
   the Systems Builder page. It is a construction query. Ignore it.
