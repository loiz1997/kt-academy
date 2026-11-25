-- KT Academy · QA data. Run ONLY in the separate QA Supabase project (or in local Supabase for test runs),
-- AFTER the normal setup scripts and supabase-security.sql. Safe to run again: it wipes the QA rows first,
-- so it is also the "reset" button for the test environment. Never run it in a real or demo project.
-- All QA accounts use the password QaKT2026!  (the test framework reads it from E2E_PASSWORD)
create extension if not exists pgcrypto;

-- 1. clean old QA rows (users ending in @ktacademy.qa, including accounts made by sign-up tests)
delete from auth.users where email like '%@ktacademy.qa';
delete from public.library where title like '[QA]%';

-- 2. helper that creates one confirmed email + password user (the profiles trigger fills public.profiles)
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
declare
  pw text := 'QaKT2026!';
  adm uuid; u uuid; i int;
  tribes text[] := array['Enterprise Services','GRCX','New Business','Trust and Security','Data','Customer Integration','TFC','B2C'];
  names text[]  := array['Lena Fischer','Marco Rossi','Aiko Tanaka','Sara Haddad','Jonas Weber','Priya Nair','Tom Becker','Mia Novak'];
  tracks text[] := array['Both','Local','TestOps','Both','Local','TestOps','Both','Local'];
  done_pool bigint[] := array[1,2,3,4,9005,9006,9007,9008,9009,9010,9011,9012,9013,9014,9015,9016];
  n int; mine bigint[];
  persona text[];
  personas text[][] := array[
    ['qa.trainee@ktacademy.qa', 'QA Trainee'],     -- read-mostly checks: dashboard, navigation
    ['qa.lesson@ktacademy.qa',  'QA Lesson'],      -- marks lessons done and undone
    ['qa.submit@ktacademy.qa',  'QA Submit'],      -- submission flow, no submissions at the start
    ['qa.cert@ktacademy.qa',    'QA Cert'],        -- certificate flow
    ['qa.profile@ktacademy.qa', 'QA Profile']      -- profile and theme edits
  ];
begin
  -- admin
  adm := pg_temp.mk('qa.admin@ktacademy.qa', 'QA Admin', pw);
  update public.profiles set role='admin', track='Both',
    info = '{"title":"QA Admin","team":"Enterprise Services","goal":"Review QA work","bio":"QA environment admin."}'
  where id = adm;

  -- personas used by the automated tests
  foreach persona slice 1 in array personas loop
    u := pg_temp.mk(persona[1], persona[2], pw);
    update public.profiles set track='Both', done = array[1,2,3],
      info = jsonb_build_object('title','QA Tester','team','B2C','goal','Test KT Academy','bio','QA account.')
    where id = u;
  end loop;

  -- a trainee with no tribe or track yet: the onboarding pop-up must appear
  u := pg_temp.mk('qa.fresh@ktacademy.qa', 'QA Fresh', pw);
  update public.profiles set done = '{}', info = '{}'::jsonb where id = u;

  -- 8 trainees, one per tribe, so the admin screens have data
  for i in 1..8 loop
    u := pg_temp.mk('trainee' || i || '@ktacademy.qa', names[i], pw);
    n := 2 + ((i * 5) % 14);
    mine := done_pool[1:n];
    update public.profiles set track = tracks[i], done = mine,
      info = jsonb_build_object('title','Tester','team', tribes[i], 'goal','Get certified in Katalon','bio','QA trainee.'),
      created_at = now() - ((40 - i * 3) || ' days')::interval
    where id = u;
    insert into public.submissions (user_id, lesson_id, lesson_title, url, note, status, feedback, score, reviewed_at, reviewed_by)
    values (u, 1, 'Getting started', 'https://drive.google.com/qa-a' || i, 'Done.',
            case when i % 3 = 0 then 'submitted' else 'approved' end,
            case when i % 3 = 0 then '' else 'Good job.' end,
            case when i % 3 = 0 then null else 70 + i * 3 end,
            case when i % 3 = 0 then null else now() - (i || ' days')::interval end,
            case when i % 3 = 0 then null else 'QA Admin' end);
  end loop;
end $$;

-- 3. admin accounts for manual testers (password TesterKT2026!). The same accounts are in qa-admins.sql.
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

insert into public.library (kind, title, descr, cat, link) values
 ('video', '[QA] Sample video', 'Video link for tests.', 'General', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('doc',   '[QA] Sample document', 'Document link for tests.', 'General', 'https://example.com/qa-document');

-- QA logins: qa.admin@ktacademy.qa, qa.trainee@ktacademy.qa and the others above, password QaKT2026!
-- Manual testers: tester.admin1..3@ktacademy.qa, password TesterKT2026!
