-- KT Academy: lets trainees see the Top 5 learners (names, photos and progress only, no emails).
-- Run once in Supabase > SQL Editor.
create or replace function public.top_learners()
returns setof jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id, 'name', p.name, 'role', p.role, 'track', p.track,
    'done', p.done, 'certs', p.certs,
    'info', jsonb_build_object('avatar', p.info->'avatar', 'team', p.info->'team')
  )
  from public.profiles p
  where p.role = 'user';
$$;
revoke all on function public.top_learners() from public;
grant execute on function public.top_learners() to authenticated;
