-- Run once in Supabase > SQL Editor: makes new Google / GitHub sign-ups get a proper name and profile.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
declare nm text;
begin
  nm := coalesce(
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'user_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    ''
  );
  insert into public.profiles (id, email, name, track)
  values (new.id, coalesce(new.email, ''), nm, coalesce(new.raw_user_meta_data->>'track', 'Both'))
  on conflict (id) do nothing;
  return new;
end $$;
