# IP Canonicalization Implementation

## Issue
Search engines can index websites via their IP address, which can cause duplicate content issues if multiple domains share the same IP address.

## Solution Implemented

### 1. Client-Side IP Redirect
Added IP canonicalization check in `App.tsx` that:
- Detects if the site is accessed via IP address (IPv4 or IPv6)
- Redirects to the canonical domain (`https://preqal.org`)
- Preserves the current path, query parameters, and hash

**Code Location:** `App.tsx` - `useEffect` hook

### 2. Domain Canonicalization
The same check also redirects non-canonical domain variants (e.g., `www.preqal.org`) to the canonical domain.

### 3. Canonical Tags
All pages already have canonical tags pointing to `https://preqal.org`, which helps search engines understand the preferred URL.

## How It Works

1. **On Page Load:** The app checks if `window.location.hostname` is an IP address
2. **IP Detection:** Uses regex to detect IPv4 (`192.168.1.1`) or IPv6 (`2001:0db8::1`) addresses
3. **Redirect:** If IP is detected, performs a `window.location.replace()` to the canonical domain
4. **Path Preservation:** Maintains the current path, query string, and hash during redirect

## Limitations

### GitHub Pages Hosting
GitHub Pages doesn't allow server-level IP canonicalization configuration. The client-side redirect is the best available solution for this hosting platform.

### Alternative Solutions
For better IP canonicalization control, consider:
1. **Cloudflare Pages** - Can configure IP redirects at the edge
2. **Custom Server** - Full control over IP access handling
3. **CDN Configuration** - Some CDNs allow IP blocking/redirecting

## Testing

To test IP canonicalization:

1. **Find your site's IP address:**
   ```bash
   nslookup preqal.org
   ```

2. **Access via IP:**
   ```
   http://[IP_ADDRESS]
   ```

3. **Expected Behavior:**
   - Should automatically redirect to `https://preqal.org`
   - Path should be preserved if accessing a specific page

## SEO Benefits

✅ **Prevents duplicate content** - Search engines won't index IP address URLs  
✅ **Consolidates link equity** - All traffic goes to canonical domain  
✅ **Improves SEO signals** - Clear canonical preference for search engines  
✅ **Reduces crawl budget waste** - Search engines focus on canonical domain

## Verification

After deployment, verify:
1. Access site via IP address → Should redirect to `https://preqal.org`
2. Check Google Search Console → Should not show IP address URLs indexed
3. Run SEO audit tool → IP canonicalization should pass

