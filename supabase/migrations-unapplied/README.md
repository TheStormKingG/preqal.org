# Migrations that were never applied

These are out of `supabase/migrations/` on purpose. The CLI only scans that
directory, so nothing here can be replayed by `supabase db push`.

They are parked, not discarded. None appears in the remote
`supabase_migrations.schema_migrations` history, so as far as the database is
concerned they never ran — and two of them would change live business data if
they ever did:

| File | Why it is parked |
|---|---|
| `20260704_security_lockdown.sql` | Contains `UPDATE` against `qualified_leads` and `UPDATE`/`INSERT` against `crm_clients`. Replaying it rewrites real lead and client rows. **Needs a decision** — the RLS policies in it may well be wanted; the data statements are the risk. |
| `20260704_ecourse_hardening.sql` | Contains `DROP TABLE IF EXISTS`. CLAUDE.md still says to apply it, but every e-course route now redirects to `/`, so the product it hardens is switched off. |
| `20260704_ecourse_test_tools.sql` | E-course only; product switched off. |
| `20260425_ecourse_auth.sql` | E-course only; product switched off. |
| `20260425_ecourse_cert_unique.sql` | E-course only; product switched off. |

To apply one, review it against current schema first, run it deliberately,
then move it back and record it in the history so the two stay in step.
