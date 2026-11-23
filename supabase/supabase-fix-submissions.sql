-- KT Academy: ONE-STEP FIX for scores + cancel submission. Safe to run more than once.
-- In Supabase > SQL Editor: select ALL the text in the editor (Ctrl+A / Cmd+A), paste this, then Run.
-- Do not run only a highlighted part, or some changes will be skipped.

-- 1) Score column (0 to 100)
alter table public.submissions add column if not exists score integer;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'submissions_score_range') then
    alter table public.submissions add constraint submissions_score_range check (score is null or (score between 0 and 100));
  end if;
end $$;

-- 2) Permissions and access rules
grant select, insert, update, delete on public.submissions to authenticated;
alter table public.submissions enable row level security;
drop policy if exists "subs read" on public.submissions;
drop policy if exists "subs insert own" on public.submissions;
drop policy if exists "subs update own" on public.submissions;
drop policy if exists "subs delete own" on public.submissions;
drop policy if exists "subs admin update" on public.submissions;
drop policy if exists "subs admin delete" on public.submissions;
create policy "subs read" on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "subs insert own" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'submitted' and score is null);
create policy "subs update own" on public.submissions for update to authenticated
  using (user_id = auth.uid() and status <> 'approved')
  with check (user_id = auth.uid() and status = 'submitted');
create policy "subs delete own" on public.submissions for delete to authenticated
  using (user_id = auth.uid() and status <> 'approved');
create policy "subs admin update" on public.submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "subs admin delete" on public.submissions for delete to authenticated
  using (public.is_admin());

-- 3) Only admins can change review fields (including the score)
create or replace function public.submissions_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.user_id := old.user_id; new.lesson_id := old.lesson_id;
    new.feedback := old.feedback; new.score := old.score;
    new.reviewed_at := old.reviewed_at; new.reviewed_by := old.reviewed_by;
  end if;
  return new;
end $$;
drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard before update on public.submissions
  for each row execute function public.submissions_guard();

-- 4) Top 5 uses the total score of approved work
create or replace function public.top_learners()
returns setof jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id, 'name', p.name, 'role', p.role, 'track', p.track,
    'done', p.done, 'certs', p.certs,
    'score', coalesce((select sum(s.score) from public.submissions s
                       where s.user_id = p.id and s.status = 'approved'), 0),
    'info', jsonb_build_object('avatar', p.info->'avatar', 'team', p.info->'team'))
  from public.profiles p where p.role = 'user';
$$;
revoke all on function public.top_learners() from public;
grant execute on function public.top_learners() to authenticated;

-- 5) Make the API notice the new column right away
notify pgrst, 'reload schema';

-- 6) Check: you should see "score" in the columns and 6 policies (incl. "subs delete own")
select 'columns' as what, string_agg(column_name, ', ' order by ordinal_position) as info
  from information_schema.columns where table_schema = 'public' and table_name = 'submissions'
union all
select 'policies', string_agg(policyname || ' (' || cmd || ')', ', ' order by policyname)
  from pg_policies where schemaname = 'public' and tablename = 'submissions';
