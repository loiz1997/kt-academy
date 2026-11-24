-- KT Academy · DEMO data. Run ONLY in the separate demo Supabase project,
-- AFTER the normal setup scripts (see docs/DEPLOY_NETLIFY.md). Safe to run again: it wipes the demo rows first.
create extension if not exists pgcrypto;

-- 1. clean old demo rows
delete from auth.users where email like '%@ktacademy.demo';
delete from public.library where title like '[Demo]%';

-- 2. helper that creates one confirmed email+password user (the profiles trigger fills public.profiles)
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
  pw text := 'DemoKT2026!';          -- must match NEXT_PUBLIC_DEMO_PASSWORD (default is this one)
  adm uuid; me uuid; u uuid; i int;
  tribes text[] := array['Enterprise Services','GRCX','New Business','Trust and Security','Data','Customer Integration','TFC','B2C'];
  names text[]  := array['Lena Fischer','Marco Rossi','Aiko Tanaka','Sara Haddad','Jonas Weber','Priya Nair','Tom Becker','Mia Novak'];
  roles text[]  := array['QA Engineer','Manual Tester','Test Analyst','QA Engineer','Junior Tester','Test Analyst','QA Engineer','Manual Tester'];
  tracks text[] := array['Both','Local','TestOps','Both','Local','TestOps','Both','Local'];
  done_pool bigint[] := array[1,2,3,4,9005,9006,9007,9008,9009,9010,9011,9012,9013,9014,9015,9016];
  n int; mine bigint[]; certs jsonb;
begin
  -- admin
  adm := pg_temp.mk('demo.admin@ktacademy.demo', 'Demo Admin', pw);
  update public.profiles set role='admin', track='Both',
    info = '{"title":"Automation Lead","team":"Enterprise Services","goal":"Grow the team''s Katalon skills","bio":"Demo admin account. Look around, nothing here is real."}'
  where id = adm;

  -- demo trainee (the one-click button)
  me := pg_temp.mk('demo.trainee@ktacademy.demo', 'Demo Trainee', pw);
  update public.profiles set track='Both', done = array[1,2,3,9005,9006,9007,9008],
    certs = '{"prac":{"earned":true,"date":"2026-09-12","url":"","cid":"DEMO-PRAC-001"}}'::jsonb,
    info = '{"title":"Manual Tester","team":"B2C","goal":"Automate my regression suite","bio":"Learning Katalon one lesson at a time."}'
  where id = me;
  insert into public.submissions (user_id, lesson_id, lesson_title, url, note, status, feedback, score, reviewed_at, reviewed_by)
  values
   (me, 1, 'Getting started', 'https://drive.google.com/demo-1', 'My first test case.', 'approved', 'Clean and clear. Nice work!', 90, now() - interval '5 days', 'Demo Admin'),
   (me, 9005, 'Object spy basics', 'https://drive.google.com/demo-2', 'Please check my locators.', 'submitted', '', null, null, null);

  -- 8 fake trainees, one per tribe, with different progress
  for i in 1..8 loop
    u := pg_temp.mk('trainee' || i || '@ktacademy.demo', names[i], pw);
    n := 2 + ((i * 5) % 14);                       -- 2..15 lessons done
    mine := done_pool[1:n];
    certs := '{}'::jsonb;
    if n >= 6  then certs := certs || jsonb_build_object('prac', jsonb_build_object('earned', true, 'date', to_char(now() - (i||' days')::interval,'YYYY-MM-DD'), 'url','', 'cid','DEMO-PRAC-0' || i)); end if;
    if n >= 10 then certs := certs || jsonb_build_object('tt',   jsonb_build_object('earned', true, 'date', to_char(now() - (i||' days')::interval,'YYYY-MM-DD'), 'url','', 'cid','DEMO-TT-0'   || i)); end if;
    update public.profiles set track = tracks[i], done = mine, certs = certs,
      info = jsonb_build_object('title', roles[i], 'team', tribes[i], 'goal', 'Get certified in Katalon', 'bio', 'Demo trainee.'),
      created_at = now() - ((40 - i * 3) || ' days')::interval
    where id = u;
    insert into public.submissions (user_id, lesson_id, lesson_title, url, note, status, feedback, score, reviewed_at, reviewed_by)
    values (u, 1, 'Getting started', 'https://drive.google.com/demo-a' || i, 'Done.',
            case when i % 3 = 0 then 'submitted' else 'approved' end,
            case when i % 3 = 0 then '' else 'Good job.' end,
            case when i % 3 = 0 then null else 70 + i * 3 end,
            case when i % 3 = 0 then null else now() - (i || ' days')::interval end,
            case when i % 3 = 0 then null else 'Demo Admin' end);
    if n > 6 then
      insert into public.submissions (user_id, lesson_id, lesson_title, url, note, status, feedback, score, reviewed_at, reviewed_by)
      values (u, 9005, 'Object spy basics', 'https://drive.google.com/demo-b' || i, 'Second one.',
              case when i % 4 = 0 then 'revise' else 'approved' end,
              case when i % 4 = 0 then 'Please add assertions and send it again.' else 'Solid.' end,
              case when i % 4 = 0 then null else 80 + i end,
              now() - (i || ' days')::interval, 'Demo Admin');
    end if;
  end loop;
end $$;

-- 3. a few library items
insert into public.library (kind, title, descr, cat, link) values
 ('video', '[Demo] Katalon in 10 minutes', 'A quick tour of the Katalon Studio window.', 'Getting started', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('video', '[Demo] Recording your first test', 'Record, replay and clean up a web test.', 'Local', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('doc',   '[Demo] KT checklist', 'A one-page checklist before you submit a lesson.', 'General', 'https://example.com/kt-checklist');

-- Demo logins (public on purpose): demo.trainee@ktacademy.demo and demo.admin@ktacademy.demo, password DemoKT2026!
