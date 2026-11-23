-- Run once in Supabase > SQL Editor: renames the first lesson everywhere in your database.
update public.docs
set t = 'Katalon Studio: Install & Setup'
where t = 'Katalon Studio: Install & First Project';
