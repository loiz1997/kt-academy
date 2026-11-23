-- KT Academy: scores, cancel submission, and Top 5 by score. Run once in Supabase > SQL Editor.
-- (Run supabase-submissions.sql first if you have not yet.)

-- 1) Score given by the instructor when work is approved (0 to 100).
alter table public.submissions add column if not exists score integer check (score between 0 and 100);

-- 2) Trainees may cancel (delete) their own submission until it is approved.
drop policy if exists "subs delete own" on public.submissions;
create policy "subs delete own" on public.submissions for delete to authenticated
  using (user_id = auth.uid() and status <> 'approved');

-- 3) Trainees cannot add a score themselves when submitting.
drop policy if exists "subs insert own" on public.submissions;
create policy "subs insert own" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'submitted' and score is null);

-- 4) Only admins can change the review fields, including the score.
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

-- 5) Top 5 now uses the total score of approved work.
create or replace function public.top_learners()
returns setof jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id, 'name', p.name, 'role', p.role, 'track', p.track,
    'done', p.done, 'certs', p.certs,
    'score', coalesce((select sum(s.score) from public.submissions s
                       where s.user_id = p.id and s.status = 'approved'), 0),
    'info', jsonb_build_object('avatar', p.info->'avatar', 'team', p.info->'team')
  )
  from public.profiles p
  where p.role = 'user';
$$;
revoke all on function public.top_learners() from public;
grant execute on function public.top_learners() to authenticated;
