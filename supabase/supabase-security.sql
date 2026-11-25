-- KT Academy: security hardening. Run once in Supabase > SQL Editor (safe to run again).
-- Run it on BOTH projects: your real one and the demo one.
-- It adds rules inside the database, so they hold even if someone skips the website and calls the API directly.
-- NOT VALID means old rows are left alone; every new or changed row must follow the rule.

do $$ begin
  -- Links must be real web addresses (blocks javascript: and data: links) and not too long
  if not exists (select 1 from pg_constraint where conname = 'submissions_url_web') then
    alter table public.submissions add constraint submissions_url_web
      check (url ~* '^https?://[^[:space:]]+$' and char_length(url) <= 500) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'library_link_web') then
    alter table public.library add constraint library_link_web
      check ((link = '' or link ~* '^https?://[^[:space:]]+$') and char_length(link) <= 500) not valid;
  end if;

  -- Text size limits (stops someone from filling your free storage with huge text)
  if not exists (select 1 from pg_constraint where conname = 'submissions_text_size') then
    alter table public.submissions add constraint submissions_text_size
      check (char_length(coalesce(note, '')) <= 2000 and char_length(coalesce(feedback, '')) <= 2000) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'library_text_size') then
    alter table public.library add constraint library_text_size
      check (char_length(title) <= 200 and char_length(descr) <= 1000) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_name_size') then
    alter table public.profiles add constraint profiles_name_size
      check (char_length(name) <= 100 and char_length(email) <= 254) not valid;
  end if;
end $$;

-- Quick check: all policies in place and row level security switched on for every table
select c.relname as table_name, c.relrowsecurity as rls_on
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
