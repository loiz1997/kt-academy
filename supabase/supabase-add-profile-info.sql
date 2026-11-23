-- Run once in Supabase > SQL Editor: adds room for job title, team, learning goal and bio on each profile.
alter table public.profiles add column if not exists info jsonb not null default '{}'::jsonb;
