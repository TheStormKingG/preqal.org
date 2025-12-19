# Environment Variables Setup Guide

## For GitHub Pages (Current Setup)

### Step 1: Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/TheStormKingG/preqal.org`
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - Click **Add secret**

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anonymous key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Click **Add secret**

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create one if needed)
3. Go to **Settings** → **API**
4. Find:
   - **Project URL** → Copy this as `VITE_SUPABASE_URL`
   - **Project API keys** → Under **anon** `public` → Copy this as `VITE_SUPABASE_ANON_KEY`

### Step 3: Verify Variables Are Accessible

#### Option A: Check Build Logs (After Next Push)

1. Push a commit to trigger the workflow
2. Go to your repository → **Actions** tab
3. Click on the latest workflow run
4. Click on the **build** job
5. Expand the **Build** step
6. Look for these messages:
   ```
   ::notice::Environment variables loaded successfully
   VITE_SUPABASE_URL is set: yes
   VITE_SUPABASE_ANON_KEY is set: yes
   ```
7. If you see errors like:
   ```
   ::error::VITE_SUPABASE_URL is not set
   ::error::VITE_SUPABASE_ANON_KEY is not set
   ```
   Then the secrets are not configured correctly.

#### Option B: Test Locally First

1. Create a `.env.local` file in the project root (this file is gitignored):
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

3. Open browser console and check:
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
   ```
   Should show your values (not `undefined`).

4. Test the form submission to verify Supabase connection works.

### Step 4: Verify in Production

After deployment:

1. Visit your site: `https://preqal.org` or `https://www.preqal.org`
2. Open browser DevTools (F12) → **Console** tab
3. Try to submit the form on the Resources page
4. If you see errors about missing Supabase variables, check:
   - Secrets are set correctly in GitHub
   - Workflow build logs show variables are loaded
   - Rebuild and redeploy

---

## For Vercel (Alternative Hosting)

If you're using Vercel instead:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

5. **Redeploy** your project (Vercel will automatically use the new env vars)

6. Verify in build logs:
   - Go to **Deployments** → Click latest deployment → **Build Logs**
   - Should show successful build

---

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Variables not set or not accessible during build.

**Fix**:
1. Verify secrets exist in GitHub Settings → Secrets and variables → Actions
2. Check secret names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Ensure secrets are not expired or deleted
4. Re-run the workflow after fixing

### Error: "Failed to fetch" or CORS errors

**Cause**: Supabase credentials are incorrect or RLS policy is blocking.

**Fix**:
1. Verify Supabase URL and key are correct
2. Check Supabase table RLS policy allows anonymous inserts
3. Test connection in Supabase Dashboard → SQL Editor

### Variables show as `undefined` in browser

**Cause**: Variables not prefixed with `VITE_` or not set during build.

**Fix**:
1. Ensure variable names start with `VITE_` (required for Vite)
2. Rebuild the project after setting variables
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Security Notes

- ✅ **Safe to expose**: `VITE_SUPABASE_ANON_KEY` is designed to be public (it's the "anon" key)
- ✅ **Safe to expose**: `VITE_SUPABASE_URL` is public
- ✅ **Protected by RLS**: Your Supabase Row Level Security policies protect your data
- ⚠️ **Never commit**: `.env.local` files (already in `.gitignore`)
- ⚠️ **Never expose**: Service role keys or other private keys

---

## Quick Verification Checklist

- [ ] Secrets added to GitHub (Settings → Secrets and variables → Actions)
- [ ] Secret names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase table created and RLS policy enabled
- [ ] Build logs show "Environment variables loaded successfully"
- [ ] Form submission works in production
- [ ] Data appears in Supabase `template_leads` table

