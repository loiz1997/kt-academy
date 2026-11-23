-- Run once in Supabase > SQL Editor: let the certificates storage accept PDF files too.
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'],
    file_size_limit = 5242880
where id = 'certificates';
