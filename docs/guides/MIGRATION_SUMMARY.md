# Migration Summary: Email-Based Unlock → Supabase Lead Capture

## Overview
Replaced the email-based unlock flow (Resend API, Vercel serverless functions) with a Supabase-based lead capture system that saves leads to PostgreSQL and triggers immediate ZIP file downloads.

---

## Files Changed

### Created Files
1. **`lib/supabaseClient.ts`**
   - Supabase client initialization
   - Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
   - Throws error if env vars are missing

2. **`supabase_migration.sql`**
   - SQL script to create `template_leads` table
   - Includes RLS policy for anonymous inserts
   - Indexes for performance

3. **`public/premium-templates.zip`**
   - Renamed from `YOUR-Premium Templates.zip`
   - Used for programmatic download after successful lead capture

### Modified Files
1. **`pages/Resources.tsx`**
   - Replaced single email field with full form (7 fields)
   - Added client-side validation
   - Integrated Supabase insert
   - Triggers ZIP download on success
   - Shows loading state and error handling

2. **`pages/Home.tsx`**
   - Same changes as Resources.tsx
   - Updated lead magnet section with new form

3. **`package.json`**
   - Removed: `resend` dependency
   - Added: `@supabase/supabase-js@^2.45.4`

### Deleted Files
1. **`api/send-templates.js`** - Old Vercel serverless function
2. **`README_API.md`** - Email API documentation
3. **`SETUP_INSTRUCTIONS.md`** - Old setup docs
4. **`vercel.json`** - Vercel configuration (no longer needed)
5. **`.github/workflows/sync-api-to-preqal.yml`** - API sync workflow (no longer needed)

---

## Database Setup

### SQL Migration
Run the SQL in `supabase_migration.sql` in your Supabase SQL Editor:

```sql
-- Creates table with all required fields
-- Enables RLS
-- Creates policy for anonymous inserts
-- Adds performance indexes
```

### Table Schema: `template_leads`
- `id` (uuid, primary key, auto-generated)
- `created_at` (timestamptz, default now())
- `first_name` (text, required)
- `last_name` (text, required)
- `email` (text, required)
- `company` (text, required)
- `job_title` (text, required)
- `phone_number` (text, required)
- `most_pressing_quality_problem` (text, required)
- `source_page` (text, default 'library_unlock')

### RLS Policy
- Policy name: `allow anonymous insert`
- Allows: `anon` role to INSERT
- Check: `email IS NOT NULL`

---

## Environment Variables

### Required (set in GitHub Pages / Vercel / your hosting platform)

1. **`VITE_SUPABASE_URL`**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Found in: Supabase Dashboard → Settings → API → Project URL

2. **`VITE_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Removed (no longer needed)
- `VITE_API_URL`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ZIP_FILE_URL`
- `VERCEL_DEPLOY_HOOK_URL` (if only used for API)

---

## Implementation Details

### Form Fields (All Required)
1. First Name
2. Last Name
3. Email (validated with regex)
4. Company
5. Job Title
6. Phone Number
7. Most Pressing Quality Problem (textarea)

### Validation
- Client-side validation for all required fields
- Email format validation
- Error messages displayed inline
- Form submission disabled during processing

### Download Flow
1. User submits form
2. Data validated client-side
3. Insert to Supabase `template_leads` table
4. If successful:
   - Programmatically create `<a>` tag with `href="/premium-templates.zip"` and `download` attribute
   - Trigger click to start download
   - Show success message: "Download started. Check your downloads folder."
   - Reset form
5. If failed:
   - Show error message
   - Do NOT trigger download
   - Keep form data for retry

### Success Message
- Green alert box
- Text: "Download started. Check your downloads folder."
- Auto-dismisses after 5 seconds
- Centered text alignment

---

## Testing Steps

### 1. Database Setup
- [ ] Create Supabase project (if not exists)
- [ ] Run `supabase_migration.sql` in SQL Editor
- [ ] Verify table `template_leads` exists
- [ ] Verify RLS is enabled
- [ ] Verify policy `allow anonymous insert` exists

### 2. Environment Variables
- [ ] Set `VITE_SUPABASE_URL` in hosting platform
- [ ] Set `VITE_SUPABASE_ANON_KEY` in hosting platform
- [ ] Verify variables are accessible in build (check build logs)

### 3. File Verification
- [ ] Verify `public/premium-templates.zip` exists
- [ ] Verify file is accessible at `/premium-templates.zip` in production

### 4. Form Testing
- [ ] Navigate to Home page (`/`)
- [ ] Navigate to Resources page (`/resources`)
- [ ] Test form validation (submit empty form)
- [ ] Test email format validation (invalid email)
- [ ] Fill all fields and submit
- [ ] Verify:
  - Loading state shows during submission
  - Success message appears
  - ZIP download starts automatically
  - Form resets after success
  - Data appears in Supabase `template_leads` table

### 5. Error Handling
- [ ] Test with invalid Supabase credentials (should show error)
- [ ] Test with network offline (should show error)
- [ ] Verify no download triggers on error

### 6. Production Build
- [ ] Run `npm run build` locally (should succeed)
- [ ] Verify no references to old API/Resend code
- [ ] Deploy to GitHub Pages / Vercel
- [ ] Test end-to-end in production

---

## Notes

- **No email sending**: The system no longer sends emails. Downloads are triggered directly in the browser.
- **No serverless functions**: All logic is client-side. Supabase handles the database operations.
- **RLS Security**: Row Level Security is enabled. Only anonymous inserts are allowed (no reads/updates/deletes for anon users).
- **Multiple submissions**: The system allows multiple entries from the same email (no unique constraint on email). This can be added later if needed.
- **Source tracking**: All entries are tagged with `source_page: 'library_unlock'` for analytics.

---

## Rollback Plan

If you need to revert:
1. Restore deleted files from git history
2. Re-add `resend` dependency
3. Restore old form code in `pages/Resources.tsx` and `pages/Home.tsx`
4. Remove Supabase client code
5. Re-deploy

---

## Next Steps (Optional Enhancements)

1. Add unique constraint on email if you want to prevent duplicate entries
2. Add email verification step before download
3. Add analytics tracking (e.g., Google Analytics event on successful submission)
4. Add rate limiting (Supabase can handle this via RLS policies)
5. Add CAPTCHA for additional spam protection
6. Add thank you page redirect after successful submission




