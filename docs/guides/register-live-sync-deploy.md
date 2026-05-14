# Register Live Sync — Deployment

Triggers + Edge Function regenerate REG-XX Excel files automatically on every row change in `qms_documents`, `qualified_leads`, `crm_clients`. Files land in `storage://registers/preqal/` and the existing local sync (`scripts/sync-registers-local.cjs`, cron'd every 5 min) mirrors them into the QMS folder.

## Preconditions

- The `registers` bucket must already exist in Supabase Storage. Create it
  from Supabase Dashboard → Storage → New Bucket (public read is fine; writes
  are service-role-only) before pushing the migration.

## One-time setup

```bash
# 1. Push the migration
supabase db push

# 2. Deploy keeping JWT verification ON (default)
supabase functions deploy sync-register-excel

# 3. Set the URL + token so triggers know where to POST. Use the service-role
#    JWT (Supabase Dashboard → Project Settings → API → service_role secret).
psql "$DATABASE_URL" <<SQL
ALTER DATABASE postgres SET app.regen_url =
  'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-register-excel';
ALTER DATABASE postgres SET app.regen_auth_token =
  '<service-role JWT>';
SQL
```

> JWT verification stays ON; the migration's `app.regen_auth_token` GUC
> supplies the service-role token in the `Authorization` header on every
> trigger call.

> The migration leaves `regen_register_async` as a silent no-op when these
> settings are missing, so the migration is safe to push before completing
> step 3 — triggers just won't fire until the URL/token are configured.

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
  deploy time). The trigger therefore must POST a valid token — we use the
  **service-role JWT** stashed in `app.regen_auth_token`.
- If you prefer to disable JWT verification on the function (open POST),
  toggle it off in the Supabase Dashboard → Edge Functions → settings, and
  set `app.regen_auth_token` to the project's anon key. The function still
  requires an `Authorization` header to be present, so don't leave the
  setting blank.
- **Token storage / rotation.** The service-role JWT lives in a database
  GUC (`app.regen_auth_token`), not in Supabase Function Secrets. Rotate it
  with `ALTER DATABASE postgres SET app.regen_auth_token = '<new-jwt>';`
  after issuing a new service-role key from the dashboard. Existing
  connections may need to reconnect for the new value to take effect.

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
