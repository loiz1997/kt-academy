# KT Academy

A learning and certification portal that helps manual testers move into test automation with Katalon. Trainees follow short lessons, submit work for review, earn certificates and track their progress. Admins review submissions and watch the academy grow.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?logo=netlify&logoColor=white)](docs/DEPLOY_NETLIFY.md)

**Live demo:** https://YOUR-DEMO-SITE.netlify.app (click **As a trainee** or **As an admin**, no sign-up needed)
**Run your own copy:** [docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md)

![Dashboard, light theme](docs/images/dashboard-light.png)
![Dashboard, dark theme](docs/images/dashboard-dark.png)

## Why I built this

I lead test automation and train manual testers to move into automation with Katalon. KT Academy is the portal I wished they had: short lessons, reviewed practice work, certificates and progress in one place. It is also a realistic **system under test** for web test automation (Katalon, Playwright and others), with stable locators, role-based access and real data flows.

## Skills this project shows

- **Test automation:** `data-testid` locators on every interactive element, a test case library ([XLSX](docs/KT_Academy_Test_Cases.xlsx)), predictable demo data you can reset in one script
- **Full stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres, auth, row-level security)
- **Security basics:** role-based access enforced in the database, no secret keys in the front end, shared demo accounts kept in a separate project
- **Product and UX:** light and dark themes, responsive layout, accessible forms, loading and sign-in states
- **Delivery:** zero-cost hosting on Netlify, environment-based demo mode, written deploy guide

## Features

**Trainees**
- 17 step-by-step lessons (Local Katalon, TestOps, Tools) and a video and document library
- 5 certification paths, clickable certificates
- Work submission with Google Drive links, review feedback and score
- Progress ring, score points, journey map and Top 5 leaderboard
- Profile with job title, team (tribe), goal and bio

**Admins**
- Dashboard: review queue, tribe progress chart, academy growth, training status
- Trainees list and trainee detail with progress and certificates
- Submissions: approve or return with feedback and a 0 to 100 score

**Everyone**
- Email and password, Google and GitHub sign-in, role-based redirect (admin or trainee)
- Light and dark themes, responsive on phone and desktop
- Stable `data-testid` locators on the page elements, ready for Katalon and Playwright

## Tech

| Part | Choice |
|---|---|
| Front end | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Back end | Supabase: Postgres, row-level security (RLS), auth, storage |
| Hosting | Netlify (free plan) |
| Cost | 0 EUR: every service above has a free plan |

## Architecture

```
Browser  ->  Next.js app on Netlify  ->  Supabase (Auth + Postgres + RLS)
```

- The browser talks to Supabase with the public anon key. Row-level security decides who can read or change each row, so a trainee only sees their own data and an admin sees everyone (`is_admin()`).
- Roles live in `profiles.role`. After sign-in the app reads the role and goes to `/admin` or `/dashboard`.
- Never put a `service_role` key in the front end or in Netlify variables that start with `NEXT_PUBLIC_`.

## Getting started

You need Node.js 22 and a free Supabase project.

```bash
git clone https://github.com/<your-user>/kt-academy.git
cd kt-academy
npm install
cp .env.example .env.local     # then fill in the two Supabase values
npm run dev                    # http://localhost:3000
```

### Environment variables

| Name | Needed | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL from Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | The public `anon` key from the same page |
| `NEXT_PUBLIC_DEMO_MODE` | demo only | `true` shows the one-click demo buttons and a demo banner |
| `NEXT_PUBLIC_DEMO_PASSWORD` | demo only | Password of the demo accounts (default `DemoKT2026!`) |

### Database setup

Open Supabase > SQL Editor and run the files in `supabase/` in this order:

1. `supabase-setup.sql`
2. `supabase-submissions.sql`, `supabase-submissions-score.sql`, `supabase-fix-submissions.sql`
3. `supabase-library.sql`, `supabase-top-learners.sql`
4. `supabase-add-profile-info.sql`, `supabase-add-certifications.sql`
5. `supabase-oauth.sql`, `supabase-rename-lesson.sql`
6. `supabase-certificate-images.sql`, `supabase-allow-pdf.sql`, `supabase-save-space.sql`

To make yourself an admin, sign up once, then run:
`update public.profiles set role = 'admin' where email = 'you@example.com';`

## Test automation

The app is built to be tested. Locators use `data-testid`, so tests do not break when styling changes.

- Demo logins: one click for a trainee or an admin, or sign in with the accounts below
- Reset the data any time with `supabase/demo-seed.sql`
- Suggested flows: login (trainee and admin), mark a lesson done, submit work, review and score a submission, earn a certificate, switch theme, log out
- Planned: Playwright end-to-end tests and a Katalon sample project, run in GitHub Actions

## Test locators

Every important element has a `data-testid`, for example `admin-greeting`, `admin-queue-*`, `subs-score-input-{id}`, `pw-save-button`, `loading-overlay`, `demo-trainee-button`. Test cases are in [docs/KT_Academy_Test_Cases.xlsx](docs/KT_Academy_Test_Cases.xlsx).

## Project structure

```
src/app/            pages (login, dashboard, lessons, certifications, profile, admin/*)
src/components/     shared UI (header, overlays, charts, admin widgets, demo banner)
src/lib/            Supabase clients, lesson, tribe and certificate data, demo settings
src/styles/         legacy look (light and dark)
supabase/           database scripts, plus demo-seed.sql for the demo project
docs/               deploy guide, project summary (PDF), test cases (XLSX), images
netlify.toml        Netlify build settings
```

## Deploy

Step by step, with the demo setup: [docs/DEPLOY_NETLIFY.md](docs/DEPLOY_NETLIFY.md).

## Demo accounts

The demo runs on its own Supabase project with sample data only.

| Role | Email | Password |
|---|---|---|
| Trainee | demo.trainee@ktacademy.demo | DemoKT2026! |
| Admin | demo.admin@ktacademy.demo | DemoKT2026! |

## Roadmap

- [x] Convert to Next.js + TypeScript + Tailwind
- [x] `data-testid` locators on every page element
- [x] Public demo mode with sample data
- [ ] Lesson detail and certification pages restyled
- [ ] Playwright end-to-end tests
- [ ] Dockerfile and GitHub Actions: lint, test, deploy
- [ ] Test results dashboard for the Katalon framework (web, API, mobile)

## Documentation

- [Deploy on Netlify](docs/DEPLOY_NETLIFY.md)
- [Project summary (PDF)](docs/KT_Academy_Project_Summary.pdf)
- [Automation test cases (XLSX)](docs/KT_Academy_Test_Cases.xlsx)
