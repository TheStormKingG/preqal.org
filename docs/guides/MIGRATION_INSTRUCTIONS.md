# Database Migration Instructions

## Issue
The `template_leads` table is missing the `country_iso` and `dial_code` columns, causing form submissions to fail with error:
```
Could not find the 'country_iso' column of 'template_leads' in the schema cache
```

## Solution

### Option 1: If table already exists (RECOMMENDED)
Run this SQL in your Supabase SQL Editor:

```sql
-- Add country_iso and dial_code columns to existing template_leads table
ALTER TABLE template_leads 
ADD COLUMN IF NOT EXISTS country_iso text;

ALTER TABLE template_leads 
ADD COLUMN IF NOT EXISTS dial_code text;
```

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Paste the SQL above
3. Click "Run" or press Ctrl+Enter
4. Verify the columns were added (check Table Editor)

### Option 2: If creating table from scratch
Use the updated `supabase_migration.sql` file which now includes these columns.

## Verification

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'template_leads'
ORDER BY ordinal_position;
```

You should see:
- `country_iso` (text, nullable)
- `dial_code` (text, nullable)

## Notes

- These columns are **optional** (nullable) to allow existing records without breaking
- The columns store:
  - `country_iso`: ISO 2-letter country code (e.g., "us", "gb", "jm")
  - `dial_code`: International dial code (e.g., "+1", "+44", "+592")
- The `phone_number` column stores the full E.164 formatted number




