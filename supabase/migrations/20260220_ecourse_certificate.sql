-- Preqal QMS E-Course: registrations, certificates, verification RPC.
-- Run in Supabase SQL Editor (or supabase db push) AFTER enabling Auth > Providers > Google
-- and adding Site URL + Redirect URLs: https://preqal.org/e-courses/register (and http://localhost:3000/... for dev).
--
-- Integrity note: issue_ecourse_certificate() records completion time at issuance and ties the
-- row to auth.uid(). It does NOT yet read per-module progress from the database (the player
-- still uses localStorage). Phase 2: sync module milestones to ecourse_module_progress and
-- gate issuance in this function or an Edge Function.

begin;

create table if not exists public.ecourse_course_registrations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  course_slug text not null default 'preqal-qms-e-course',
  holder_legal_name text not null,
  terms_version text,
  terms_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.ecourse_certificates (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  holder_name text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create index if not exists ecourse_certificates_public_id_idx on public.ecourse_certificates (public_id);

alter table public.ecourse_course_registrations enable row level security;
alter table public.ecourse_certificates enable row level security;

drop policy if exists "ecourse_reg_select_own" on public.ecourse_course_registrations;
create policy "ecourse_reg_select_own" on public.ecourse_course_registrations
  for select using (auth.uid() = user_id);

drop policy if exists "ecourse_reg_insert_own" on public.ecourse_course_registrations;
create policy "ecourse_reg_insert_own" on public.ecourse_course_registrations
  for insert with check (auth.uid() = user_id);

drop policy if exists "ecourse_reg_update_own" on public.ecourse_course_registrations;
create policy "ecourse_reg_update_own" on public.ecourse_course_registrations
  for update using (auth.uid() = user_id);

drop policy if exists "ecourse_cert_select_own" on public.ecourse_certificates;
create policy "ecourse_cert_select_own" on public.ecourse_certificates
  for select using (auth.uid() = user_id);

create or replace function public.verify_ecourse_certificate(p_public_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r record;
begin
  if p_public_id is null or length(trim(p_public_id)) < 8 then
    return jsonb_build_object('valid', false, 'reason', 'invalid_id');
  end if;
  select c.public_id, c.holder_name, c.course_slug, c.completed_at, c.created_at
    into r
  from public.ecourse_certificates c
  where c.public_id = trim(p_public_id)
  limit 1;
  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;
  return jsonb_build_object(
    'valid', true,
    'public_id', r.public_id,
    'holder_name', r.holder_name,
    'course_slug', r.course_slug,
    'completed_at', r.completed_at,
    'issued_at', r.created_at
  );
end;
$$;

grant execute on function public.verify_ecourse_certificate(text) to anon, authenticated;

create or replace function public.issue_ecourse_certificate(p_course_slug text default 'preqal-qms-e-course')
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_holder text;
  v_public_id text;
  r ecourse_certificates%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  select reg.holder_legal_name
    into v_holder
  from public.ecourse_course_registrations reg
  where reg.user_id = v_uid and reg.course_slug = p_course_slug
  limit 1;
  if v_holder is null or length(trim(v_holder)) < 2 then
    raise exception 'not_registered';
  end if;
  select * into r
  from public.ecourse_certificates c
  where c.user_id = v_uid and c.course_slug = p_course_slug
  limit 1;
  if found then
    return jsonb_build_object(
      'already_issued', true,
      'public_id', r.public_id,
      'holder_name', r.holder_name,
      'course_slug', r.course_slug,
      'completed_at', r.completed_at,
      'issued_at', r.created_at
    );
  end if;
  v_public_id := lower(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 16));
  insert into public.ecourse_certificates (public_id, user_id, course_slug, holder_name, completed_at)
  values (v_public_id, v_uid, p_course_slug, trim(v_holder), now())
  returning * into r;
  return jsonb_build_object(
    'already_issued', false,
    'public_id', r.public_id,
    'holder_name', r.holder_name,
    'course_slug', r.course_slug,
    'completed_at', r.completed_at,
    'issued_at', r.created_at
  );
end;
$$;

grant execute on function public.issue_ecourse_certificate(text) to authenticated;

commit;
