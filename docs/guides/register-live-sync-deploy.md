# Register Live Sync — Deployment

Triggers + Edge Function regenerate REG-XX Excel files automatically on every row change in `qms_documents`, `qualified_leads`, `crm_clients`. Files land in `storage://registers/preqal/` and the existing local sync (`scripts/sync-registers-local.cjs`, cron'd every 5 min) mirrors them into the QMS folder.

## One-time setup

```bash
# 1. Push the migration
supabase db push

# 2. Deploy the (updated) Edge Function
supabase functions deploy sync-register-excel --no-verify-jwt=false

# 3. Set the URL + token so triggers know where to POST. Use the service-role
#    JWT (Supabase Dashboard → Project Settings → API → service_role secret).
psql "$DATABASE_URL" <<SQL
ALTER DATABASE postgres SET app.regen_url =
  'https://gndcjmxxgtnoidxgcdnx.supabase.co/functions/v1/sync-register-excel';
ALTER DATABASE postgres SET app.regen_auth_token =
  '<service-role JWT>';
SQL
```

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

- `--no-verify-jwt=false` keeps Edge Function JWT verification ON. The
  trigger therefore must POST a valid token — we use the **service-role JWT**
  stashed in `app.regen_auth_token`.
- If you prefer to flip the function to `--no-verify-jwt=true` (open POST),
  you can set `app.regen_auth_token` to the project's anon key. The function
  still requires an `Authorization` header to be present, so don't leave the
  setting blank.

## Front-end caller compatibility

`public/qms.html` still calls the function with legacy short keys
(`docs`, `context`, `employees`, …). The Edge Function's `REGISTERS` map
keeps those keys and adds `REG-01` / `REG-02` / `REG-10` aliases for the
DB triggers — no QMS-portal changes are required for this rollout.
