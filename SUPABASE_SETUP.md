# Nile Link — Supabase setup (20 minutes)

This turns the site from a mock demo into a real multi-user marketplace.
The frontend already knows how to talk to Supabase — you just have to
create the project, paste three SQL files, and copy two keys.

Until you complete step 6, the site keeps running against the mock data
(nothing is broken, nothing is persisted).

---

## 1. Create a Supabase project (5 min)

1. Go to https://supabase.com and sign in.
2. **New project** → give it a name (e.g. `nile-link-prod`), pick a region **close to South Sudan** (Frankfurt `eu-central-1` is currently the closest reliable option), set a strong database password, click **Create**.
3. Wait ~2 minutes for provisioning.

## 2. Load the schema (3 min)

In the left sidebar, click **SQL Editor** → **New query**.

1. Open `supabase/01_schema.sql` from this repo, copy everything, paste, click **Run**.
2. Repeat with `supabase/02_policies.sql`.
3. Repeat with `supabase/03_seed.sql`.

You should now see the twelve demo listings if you go to **Table editor** → `listings`.

> If step 3 (`03_seed.sql`) fails with a permission error on the `auth.users` block, that just means your account can't insert directly into the auth schema (this varies by Supabase tier). Skip that block, create 11 users manually under **Auth → Users**, and re-run the rest.

## 3. Create the photo bucket (2 min)

1. Sidebar → **Storage** → **New bucket**.
2. Name: `listing-photos`. Public: **on**. Click **Create**.
3. Click the bucket → **Policies** → **New policy**.
4. Create these four policies (use the "Custom" template):
   - **Public read**: allowed operations = `SELECT`. Definition: `bucket_id = 'listing-photos'`
   - **Authed upload**: allowed operations = `INSERT`. Target roles: `authenticated`. Definition: `bucket_id = 'listing-photos'`
   - **Owner update**: allowed operations = `UPDATE`. Target roles: `authenticated`. Definition: `bucket_id = 'listing-photos' and (auth.uid()::text = (storage.foldername(name))[1])`
   - **Owner delete**: allowed operations = `DELETE`. Target roles: `authenticated`. Definition: `bucket_id = 'listing-photos' and (auth.uid()::text = (storage.foldername(name))[1])`

## 4. Turn on anonymous sign-ins (30 sec)

Sidebar → **Authentication** → **Sign in / Providers** → find **Anonymous sign-ins** → toggle **on** → **Save**.

_(This is what lets a first-time visitor get a Supabase user id without going through OTP — so their listings/messages actually persist. When you later wire real phone-OTP, the anon session upgrades to a real one automatically.)_

## 5. Turn on Realtime for messaging (30 sec)

Sidebar → **Database** → **Replication** → click the `supabase_realtime` publication.
Enable the toggles for `messages`, `conversations`, and `notifications`.

## 6. Paste your keys (1 min)

Sidebar → **Project settings** → **API**. Copy:
- **Project URL** (e.g. `https://abcdefg.supabase.co`)
- **anon / public** key (a very long JWT)

Open `assets/js/supabase-config.js` and paste them:

```js
window.NL_SUPABASE = {
  url: 'https://abcdefg.supabase.co',
  anonKey: 'eyJhbGciOi...',   // the long anon key
  storageBucket: 'listing-photos'
};
```

> Yes, both values are safe to ship to the browser. The anon key is designed for client-side use; it's Row-Level Security (already applied in `02_policies.sql`) that actually protects your data.

Commit and deploy. The site is now live-backed.

---

## What now works for real

- Every listing you post is stored in the database and visible to every user, on every device.
- Photo uploads go to `listing-photos` and get durable public URLs.
- Messages persist and arrive in real time (no refresh needed).
- Notifications persist and can be marked read.
- Favourites persist per user across devices.
- Row-Level Security enforces that users can only edit their own listings, read their own conversations, etc. — even if the frontend were replaced.

## What is still mocked (by choice)

- **Phone OTP:** the sign-in screen still accepts any 6-digit code (`assets/js/api.js` → `auth.verifyOtp`). This is the last piece to wire before public launch — see the OTP section below.
- **Payments:** no payments at launch, per project decision.
- **Requests/dashboard:** the "requests" panel on the dashboard still shows the seed list. It will be replaced when we build the buyer→seller order flow.

## Wiring real phone OTP later (when you're ready)

Africa's Talking or Twilio Verify are the two most common options for +211. When you're ready:

1. Set up the provider and confirm SMS delivery to a real South Sudan phone.
2. In `assets/js/api.js`, replace the three `auth` methods with:
   ```js
   auth: {
     requestOtp: (phone) => NL.sb.auth.signInWithOtp({ phone }),
     verifyOtp:  (phone, code) => NL.sb.auth.verifyOtp({ phone, token: code, type: 'sms' }),
     signUp:     (p) => NL.sb.auth.signInWithOtp({ phone: p.phone })  // same flow; profile gets written on first callback
   }
   ```
3. In Supabase Auth settings, plug in the provider credentials under **Phone Auth**.

The rest of the app needs no changes.

## Troubleshooting

- **"running against mock data" in browser console** — `supabase-config.js` still has empty keys. Paste them.
- **Uploads fail with "row-level security"** — the four Storage policies in step 3 aren't all created. Recheck.
- **New messages don't appear until refresh** — Realtime replication (step 5) wasn't enabled on `messages`.
- **Signed-in users see no listings** — RLS on `listings` blocks non-live listings for non-owners, which is intended. Check the `status` column is `live`.
- **Anonymous sign-in fails** — step 4 wasn't done. The site falls back to mock silently in that case.

## Backups

Supabase runs daily automated backups on paid tiers. On the free tier, run a weekly manual export: **Database → Backups → Backup now**. Keep at least 4 weeks of copies before launch.
