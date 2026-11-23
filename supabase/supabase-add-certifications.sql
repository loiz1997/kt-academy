-- Run once in Supabase > SQL Editor (for a project that already has the profiles table).
-- Adds a place to store each trainee's certification progress and earned certificates.
alter table public.profiles add column if not exists certs jsonb not null default '{}'::jsonb;
