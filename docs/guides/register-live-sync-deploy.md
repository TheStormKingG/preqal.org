# Register Live Sync — Deployment

Triggers + Edge Function regenerate REG-XX Excel files automatically on every row change in `qms_documents`, `qualified_leads`, `crm_clients`. Files land in `storage://registers/preqal/` and the existing local sync (`scripts/sync-registers-local.cjs`, cron'd every 5 min) mirrors them into the QMS folder.

## Preconditions

- The `registers` bucket must already exist in Supabase Storage. Create it
  from Supabase Dashboard → Storage → New Bucket (public read is fine; writes
  are service-role-only) before pushing the migration.

## One-time setup

```bash
# 1. Apply the migration (via Supabase MCP or SQL editor — db push diverges
#    from remote history in worktrees; use apply_migration instead)
#    The migration creates regen_register_async() with the URL + token
#    hardcoded as DECLARE constants, and wires the three triggers.

# 2. Deploy keeping JWT verification ON (default)
supabase functions deploy sync-register-excel \
  --project-ref gndcjmxxgtnoidxgcdnx \
  --workdir /path/to/preqal.org
```

> **Token storage.** The service-role JWT is stored directly in the
> `regen_register_async` function body (DECLARE constants). `ALTER DATABASE`
> is not used because the Supabase API connection doesn't have the superuser
> privilege that command requires. To rotate: update the constant in
> `supabase/migrations/20260514_register_triggers.sql` and re-apply the
> function via `apply_migration` or the Supabase SQL Editor.

## Verify

```bash
# Insert a test row
psql "$DATABASE_URL" -c \
  "INSERT INTO qualified_leads (company_name, contact_person, email)
   VALUES ('Test Co','Test Person','test@example.com');"

# Wait ~5s, then check storage
curl -fsSL "https://gndcjmxxgtnoidxgcdnx.supabase.co/storage/v1/object/public/registers/preqal/REG-02-Lead-Register.xlsx" \
  -o /tmp/reg02.xlsx
qlmanage -t -s 1400 -o /tmp/ /tmp/reg02.xlsx
open /tmp/reg02.xlsx.png
```

The big-number panel should reflect the new row count.

## Trigger pause / unpause

```sql
ALTER TABLE qualified_leads DISABLE TRIGGER tr_qualified_leads_regen;
-- ... do bulk operations ...
ALTER TABLE qualified_leads ENABLE TRIGGER tr_qualified_leads_regen;
SELECT regen_register_async('REG-02');  -- catch up
```

## Authentication notes

- Edge Function JWT verification stays ON (the default — no flag needed at
  deploy time). The trigger therefore must POST a valid token — the service-role
  JWT is embedded in the `regen_register_async` function's DECLARE block.
- **Token rotation.** Update the `auth_token` constant in
  `supabase/migrations/20260514_register_triggers.sql` and re-apply via
  `apply_migration` or the Supabase SQL Editor. No server restart needed.

## Known limitations

Tracked as follow-ups; document here so operators know what to watch for:

- **Trigger storm.** Each row-level INSERT/UPDATE/DELETE on `qms_documents`
  fires a fresh function invocation. Bulk loads (>~50 rows/sec) will queue
  many regenerations. Disable triggers around bulk ops (see Trigger pause /
  unpause below); a future task will add debouncing.
- **No retry / log table.** `pg_net.http_post` is fire-and-forget; failures
  surface only in Edge Function logs. A future task will add a small
  `register_sync_log` table to record `(register_key, attempted_at, status)`.
- **ExcelJS type shim.** The Deno `@ts-expect-error` import suppresses type
  checking for the `npm:exceljs@4` specifier; a proper `.d.ts` shim is a
  future cleanup.

## Front-end caller compatibility

`public/qms.html` still calls the function with legacy short keys
(`docs`, `context`, `employees`, …). The Edge Function's `REGISTERS` map
keeps those keys and adds `REG-01` / `REG-02` / `REG-10` aliases for the
DB triggers — no QMS-portal changes are required for this rollout.
