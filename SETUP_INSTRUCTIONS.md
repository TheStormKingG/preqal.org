# Production Setup Instructions

## Vercel Environment Variables

In Vercel → Settings → Environment Variables, add:

1. **RESEND_API_KEY**
   - Value: Your Resend API key (starts with `re_`)
   - Scope: Production (and Preview if you want to test)

2. **FROM_EMAIL**
   - Value: `donotreply@preqal.com`
   - Scope: Production

3. **ALLOWED_ORIGIN** (Optional)
   - Value: `https://preqal.org` (or `https://www.preqal.org` if using www)
   - Scope: Production
   - Default: `https://preqal.org` if not set

4. **ZIP_FILE_URL** (Optional)
   - Only needed if zip file is not bundled with deployment
   - Value: URL to fetch zip file from (e.g., CDN URL)

## Resend Setup

1. Sign up at https://resend.com
2. Verify domain `preqal.com` in Resend dashboard
3. Add DNS records (SPF, DKIM) as instructed by Resend
4. Get your API key from Resend dashboard
5. Add API key to Vercel environment variables

## Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Or connect GitHub repo in Vercel dashboard
4. Vercel will automatically detect `api/send-templates.js` and deploy it

## Testing

After deployment, test the endpoint:

```bash
curl -X POST https://api.preqal.org/api/send-templates \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
- 200: Success
- 400: Invalid email
- 429: Rate limited
- 500: Server error

## Security Features

✅ CORS protection (locked to preqal.org)
✅ Rate limiting (3 requests per 15 minutes per IP/email)
✅ Honeypot spam protection
✅ Email validation
✅ Audit logging (hashed emails + timestamps)
✅ Error handling

## Monitoring

Check Vercel Function Logs for:
- Audit entries (hashed emails, IPs, status)
- Error messages
- Rate limit hits
- Resend API responses

