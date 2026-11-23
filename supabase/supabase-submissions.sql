-- KT Academy: lesson submissions. Run once in Supabase > SQL Editor.
-- Only the Google Drive LINK is stored here (no files), so it uses almost no space.
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id integer not null,
  lesson_title text,
  url text not null,
  note text default '',
  status text not null default 'submitted' check (status in ('submitted','approved','revise')),
  feedback text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  unique (user_id, lesson_id)
);
create index if not exists submissions_user_idx on public.submissions(user_id);

alter table public.submissions enable row level security;
drop policy if exists "subs read" on public.submissions;
drop policy if exists "subs insert own" on public.submissions;
drop policy if exists "subs update own" on public.submissions;
drop policy if exists "subs admin update" on public.submissions;
drop policy if exists "subs admin delete" on public.submissions;

create policy "subs read" on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "subs insert own" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'submitted');
create policy "subs update own" on public.submissions for update to authenticated
  using (user_id = auth.uid() and status <> 'approved')
  with check (user_id = auth.uid() and status = 'submitted');
create policy "subs admin update" on public.submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "subs admin delete" on public.submissions for delete to authenticated
  using (public.is_admin());

-- Trainees can never change the review fields, even by editing requests by hand.
create or replace function public.submissions_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.user_id := old.user_id; new.lesson_id := old.lesson_id;
    new.feedback := old.feedback; new.reviewed_at := old.reviewed_at; new.reviewed_by := old.reviewed_by;
  end if;
  return new;
end $$;
drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard before update on public.submissions
  for each row execute function public.submissions_guard();
