# Deploy KT Academy on Netlify (free)

Two parts: **A)** put the code on GitHub, **B)** run a public **demo** (its own Supabase project with fake data). Your real site stays untouched.

## A. Push the code to GitHub

1. In Terminal, open the project: `cd ~/MyProjects/KT-Academy/kt-academy`
2. Check that `.env.local` is **not** listed by `git status` (it must stay private).
3. Commit and push:
   ```bash
   git add .
   git commit -m "Add README, demo mode and Netlify config"
   git push origin nextjs
   ```
   If the push fails with HTTP 400: `git config --global http.postBuffer 524288000`, then push again.
4. To make this the main branch: on GitHub open a Pull Request from `nextjs` to `main` and merge it. Then `main` shows the new README.

## B. Create the demo Supabase project

1. Go to https://supabase.com > **New project**. Name it `kt-academy-demo`. Save the database password. Wait until it is ready.
2. Open **SQL Editor** and run the files in `supabase/` in the order listed in the README ("Database setup"). Paste each file, press **Run**.
3. Run `supabase/demo-seed.sql` last. It creates the demo admin, the demo trainee, 8 fake trainees (one per tribe), submissions and library items.
4. Open **Authentication > Providers > Email** and turn **Confirm email** off (optional, the demo accounts are already confirmed).
5. Open **Project Settings > API** and copy the **Project URL** and the **anon public** key.

## C. Create the Netlify demo site

1. Go to https://app.netlify.com > **Add new site > Import an existing project > GitHub**. Pick the repo and the branch (`main`, or `nextjs` while testing).
2. Netlify reads `netlify.toml`, so the build command is already `npm run build`. Do not change it.
3. Before you press Deploy, open **Environment variables** and add:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | demo project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | demo anon key |
   | `NEXT_PUBLIC_DEMO_MODE` | `true` |
   | `NEXT_PUBLIC_DEMO_PASSWORD` | `DemoKT2026!` |

4. Press **Deploy**. Wait about 2 minutes.
5. Optional: **Site configuration > Change site name** to something like `kt-academy-demo`.

## D. Tell Supabase the demo address

In the demo Supabase project: **Authentication > URL Configuration**
- **Site URL:** `https://kt-academy-demo.netlify.app` (your Netlify address)
- **Redirect URLs:** add the same address with `/**` at the end, and keep `http://localhost:3000/**`

## E. Test it

Open the demo address. You should see the **Try the live demo** box. Click **As a trainee** (goes to the dashboard) and **As an admin** (goes to the admin dashboard).

## Your real site

Keep the existing Netlify site (`autotechteam-kt-academy`) with your real Supabase values and **without** `NEXT_PUBLIC_DEMO_MODE`. Two Netlify sites can use the same repo. After changing an environment variable press **Deploys > Trigger deploy > Clear cache and deploy site**, because `NEXT_PUBLIC_` values are baked in at build time.

## Reset the demo data

In the demo project SQL Editor, run `supabase/demo-seed.sql` again. It deletes the old demo rows and recreates them.

## Troubleshooting

- **"The demo is not ready yet"**: the seed was not run, or the password differs from `NEXT_PUBLIC_DEMO_PASSWORD`.
- **Build fails**: Site configuration > Environment: make sure Node is 22 (set by `netlify.toml`) and the two Supabase keys exist.
- **Google/GitHub buttons missing in the demo**: intended, only email demo logins are shown.
- **Redirect back to localhost after sign-in**: fix Site URL in step D.
