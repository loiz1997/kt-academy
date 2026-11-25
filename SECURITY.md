# Security

KT Academy is a portfolio project, built with security in mind. This page explains how the data is protected and how to report a problem.

## How it is protected

| Area | What is in place |
|---|---|
| **Access rules** | Row Level Security (RLS) is on for every table. Trainees see and change only their own profile and submissions. Only admins write docs and the library. |
| **No self-promotion** | A database trigger (`protect_role`) stops anyone except an admin from changing a role. |
| **Secrets** | No secret keys are in the code. `.env*` files are git-ignored. The website only uses the public anon key, which RLS limits. |
| **Injection** | The app uses the Supabase client (parameterized requests), so no SQL is built from user text. HTML is rendered only from our own lesson content, never from user input. |
| **Links** | Links must be `http(s)`. They are checked in the form, again before they are shown, and in the database (`supabase-security.sql`). |
| **Files** | Certificate files are private, limited to 5 MB and to JPG, PNG, WebP or PDF, and each trainee reaches only their own folder. |
| **Text size** | Database limits on notes, titles and names. |
| **Browser** | Security headers: no framing (clickjacking), no content sniffing, strict referrer policy, HTTPS only. |
| **Demo site** | A separate Supabase project with fake data only. Uploads are links, and deleting people or items and changing roles are switched off in demo mode. Sign-ups are turned off. |

## Before real people use it

1. Run `supabase/supabase-security.sql` in your real Supabase project.
2. In Supabase Authentication, turn on email confirmation and CAPTCHA, and set rate limits.
3. Keep the demo and the real project separate. Never use real keys on the demo site.

## Report a problem

Please open a private message to the repository owner (GitHub: loiz1997) instead of a public issue.
