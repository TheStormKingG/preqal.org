-- Conversion events — first-party analytics for the private funnel dashboard.
--
-- Why this exists alongside Google Analytics: the GA Data API needs a service
-- account and a server-side call, and preqal.org is static files on GitHub
-- Pages. There is nowhere to run that call. So the events are written twice —
-- once to GA for its own reporting, once here so a page we control can read
-- them back.
--
-- SECURITY MODEL — read this before changing any policy below.
-- The browser must be able to INSERT, so inserts are open to anon. That is not
-- a mistake and it cannot be avoided in a static site: the publishable key is
-- in the page source by design. The consequence is that this table is
-- spammable, so it must never hold anything confidential — no names, no
-- emails, no message bodies. It holds event names and small parameter blobs.
-- The actual secret is the READ side, which is restricted to the admin
-- addresses. Obscuring the dashboard URL is convenience, not security; these
-- policies are the security.

create table if not exists public.conversion_events (
  id          bigint generated always as identity primary key,
  event_name  text        not null,
  params      jsonb       not null default '{}'::jsonb,
  page_path   text,
  -- Rotates per browser tab session. Anonymous: never derived from a user,
  -- an email, or an IP, so it cannot re-identify anyone.
  session_id  text,
  -- 'prod' | 'dev'. Local development writes here too, so the pipeline can be
  -- verified end to end before deploying; the dashboard filters to prod by
  -- default so dev traffic never silently inflates a real number.
  env         text        not null default 'prod',
  created_at  timestamptz not null default now(),

  -- Bounds, not a whitelist. A whitelist of event names would silently reject
  -- any event added later and the loss would look like "nobody clicked".
  constraint conversion_events_name_len  check (char_length(event_name) between 1 and 64),
  constraint conversion_events_path_len  check (page_path is null or char_length(page_path) <= 512),
  constraint conversion_events_sess_len  check (session_id is null or char_length(session_id) <= 64),
  constraint conversion_events_env_valid check (env in ('prod','dev')),
  constraint conversion_events_params_sz check (pg_column_size(params) <= 4096)
);

create index if not exists conversion_events_created_idx on public.conversion_events (created_at desc);
create index if not exists conversion_events_name_idx    on public.conversion_events (event_name, created_at desc);
create index if not exists conversion_events_session_idx on public.conversion_events (session_id);

alter table public.conversion_events enable row level security;

-- Write: open, and deliberately so (see the security note above).
drop policy if exists "conversion_events_insert_anon" on public.conversion_events;
create policy "conversion_events_insert_anon"
  on public.conversion_events
  for insert
  to anon, authenticated
  with check (true);

-- Read: the admin addresses only. This is the boundary that actually holds.
drop policy if exists "conversion_events_select_admin" on public.conversion_events;
create policy "conversion_events_select_admin"
  on public.conversion_events
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'stefan.gravesande@gmail.com',
      'stefan.gravesande@preqal.org'
    )
  );

-- No UPDATE or DELETE policy is defined, so neither is possible through the
-- API for any role RLS applies to. The log is append-only by omission.

comment on table public.conversion_events is
  'First-party conversion analytics. Anon-writable by necessity, admin-readable only. Never store personal data here.';
