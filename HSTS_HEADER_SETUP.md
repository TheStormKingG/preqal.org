# HSTS Header Configuration

## Current Hosting: GitHub Pages

GitHub Pages does **not** support custom HTTP headers directly. To add HSTS (Strict-Transport-Security) headers, you have these options:

### Option 1: Use Cloudflare (Recommended)
If you route your domain through Cloudflare:

1. Go to Cloudflare Dashboard → SSL/TLS → Edge Certificates
2. Enable "Always Use HTTPS"
3. Go to SSL/TLS → Edge Certificates → HSTS
4. Enable HSTS with:
   - Max Age: 31536000 (1 year)
   - Include Subdomains: Yes
   - Preload: No (only enable after thorough testing)

### Option 2: Use Cloudflare Pages
If you migrate to Cloudflare Pages, the `public/_headers` file will be automatically processed.

### Option 3: Use Netlify
If you migrate to Netlify, add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Option 4: Use Vercel
If you migrate to Vercel, add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## Current Status
- `public/_headers` file created (for Cloudflare Pages compatibility)
- For GitHub Pages, HSTS must be configured at CDN/proxy level (Cloudflare recommended)

