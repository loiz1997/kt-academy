-- Run once in Supabase > SQL Editor. Frees storage and stops uploads (links only now).
-- 1) Remove old certificate file references from trainee profiles (links and dates are kept).
update public.profiles
set certs = coalesce((select jsonb_object_agg(k, v - 'img') from jsonb_each(certs) as e(k, v)), '{}'::jsonb)
where certs is not null and certs <> '{}'::jsonb;

-- 2) Block any new file uploads to both buckets.
drop policy if exists "certificates upload own" on storage.objects;
drop policy if exists "kt-library insert" on storage.objects;
drop policy if exists "kt-library update" on storage.objects;

-- 3) Old uploaded files: delete them in Dashboard > Storage > certificates / kt-library
--    (open the bucket, select all, Delete). Deleting there removes the real files.
