# Nile Link — Sign-in setup (email/password + Google)

The site now uses **real accounts**: email + password, and Google. Phone/SMS
is deferred to later. Email/password needs **zero external setup** and works
the moment this deploys. Google needs a short one-time setup (below).

---

## Part 1 — Email + password (works immediately)

Supabase's Email provider is already on by default, so email sign-up/sign-in
work as soon as the site deploys. There's just **one choice** to make:

### Should new accounts require email confirmation?

Supabase → **Authentication → Sign In / Providers → Email** → "**Confirm email**".

- **ON (default):** after sign-up, users get a confirmation email and must click
  the link before they can sign in. Safer, but Supabase's built-in email is
  rate-limited and can land in spam — fine for real launch once you add your own
  email service (SMTP), but annoying for testing.
- **OFF:** accounts work instantly, no email step. **Recommended while you're
  testing and onboarding your first sellers.** Turn it back ON (with a real SMTP)
  before wide public launch.

**Recommendation for now:** turn **Confirm email OFF** so you and your first
users can sign up and use the app instantly.

> The site handles both: if confirmation is ON, sign-up shows a "check your
> email" screen; if OFF, it signs the user straight in.

### Set your Site URL (do this once)

Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://cartelug.github.io/NILE-LINK/`
- **Redirect URLs:** add `https://cartelug.github.io/NILE-LINK/**`

This makes password-reset links and Google sign-in return to your site correctly.

---

## Part 2 — Google sign-in (one-time, ~10 min)

Google requires OAuth credentials from Google Cloud, then pasting them into
Supabase. Do it once and the "Continue with Google" button just works.

### Step A — Create Google OAuth credentials
1. Go to **https://console.cloud.google.com** → create a project (or pick one).
2. **APIs & Services → OAuth consent screen** → choose **External** → fill in
   app name "Nile Link", your email, save. (You can leave it in "Testing" while
   you trial it, then "Publish" before public launch.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**. Name it "Nile Link Web".
5. Under **Authorized redirect URIs**, add the Supabase callback (copy the exact
   one from Supabase → Authentication → Providers → Google — it looks like):
   `https://eztxmvkwkgjlqkcwhqqv.supabase.co/auth/v1/callback`
6. Create → copy the **Client ID** and **Client secret**.

### Step B — Paste into Supabase
1. Supabase → **Authentication → Sign In / Providers → Google**.
2. Toggle **Enable**, paste the **Client ID** and **Client secret**, save.

That's it — the Google button now works.

> Until you finish Part 2, the Google button will show a friendly "warming up /
> not configured" message instead of breaking. Email/password works regardless.

---

## What the code does (for reference)

- `assets/js/api.js` → `NL.api.auth` now calls Supabase:
  `signUpEmail`, `signInEmail`, `signInGoogle`, `resetPassword`, `signOut`.
- `assets/js/supabase-client.js` mirrors the real Supabase session into the
  site's `nl_user` state on every auth change, so the nav, route guards and
  "signed-in only" UI keep working unchanged. Sign-out now ends the Supabase
  session too.
- `pages/signin.html` / `pages/signup.html` now collect email + password (+ name,
  role, city on sign-up) and offer Google. Phone/OTP UI was removed.

## Later: phone/SMS

When you want phone sign-in too, it's added alongside these — it needs an SMS
provider that reaches +211 (Africa's Talking or Twilio) plugged into Supabase
Phone Auth. Deferred for now by design.
