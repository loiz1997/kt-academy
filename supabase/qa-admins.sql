-- KT Academy · extra admin accounts for MANUAL testers. Run ONLY in the QA Supabase project (or local Supabase).
-- Safe to run again: it replaces these three accounts. (qa-seed.sql also creates them, so a full reset keeps them.)
-- Login: tester.admin1@ktacademy.qa, tester.admin2@ktacademy.qa, tester.admin3@ktacademy.qa  ·  password TesterKT2026!
-- The automated tests use the qa.* accounts, so testers should not use those.
create extension if not exists pgcrypto;

delete from auth.users where email in ('tester.admin1@ktacademy.qa','tester.admin2@ktacademy.qa','tester.admin3@ktacademy.qa');

create or replace function pg_temp.mk(p_email text, p_name text, p_pw text) returns uuid language plpgsql as $$
declare uid uuid := gen_random_uuid();
begin
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_email,
    crypt(p_pw, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', p_name), now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true), 'email', now(), now(), now());
  return uid;
end $$;

do $$
declare u uuid; i int;
begin
  for i in 1..3 loop
    u := pg_temp.mk('tester.admin' || i || '@ktacademy.qa', 'Tester Admin ' || i, 'TesterKT2026!');
    update public.profiles set role = 'admin', track = 'Both',
      info = jsonb_build_object('title','Tester Admin','team','Enterprise Services','goal','Test the admin screens','bio','Admin account for manual testers.')
    where id = u;
  end loop;
end $$;
