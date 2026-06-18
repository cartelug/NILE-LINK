# Nile Link — Backend Connection Guide

This site is a complete, mobile-first **front end**. All data flows through a
single facade so you can plug in a real backend without touching the UI.

## 1. File structure

```
index.html                ← Home
pages/*.html              ← Browse, Listing, Post, Messages, Notifications,
                            Saved, Dashboard, Sign in, Sign up, Pricing,
                            About, Help
assets/
  css/  tokens · main · home · pages · auth
  js/
    data.js   ← MOCK DATA  (replace with your DB)
    api.js    ← NL.api facade  ← *** wire your backend here ***
    core.js   ← auth state, nav/footer/drawer, favourites, toast, cards
    <page>.js ← per-page logic (calls NL.api only)
  images/
sw.js                     ← service-worker kill switch (leave as is)
```

The shared header, footer, drawer and mobile bottom-nav are injected by
`core.js` into `[data-nl-nav]`, `[data-nl-footer]`, `[data-nl-mobnav]`
mount points — edit them **once** in `core.js`.

## 2. Authentication (sign in / sign up)

State lives in `localStorage` under `nl_user` and is reflected on `<html>` as
`is-authed` / `is-guest` (CSS shows/hides `.auth-only` / `.guest-only`).

Helpers in `core.js`:
- `NL.getUser()` → user object or `null`
- `NL.setUser(user)` → save + re-render auth UI
- `NL.signOut()`
- `NL.isAuthed()`
- Protected links carry `data-auth-required`; guests are bounced to
  `signin.html?next=<page>` automatically.

### To wire real phone-OTP auth (e.g. Firebase Auth / Twilio Verify)

Open `assets/js/api.js` → `NL.api.auth` and replace the three methods:

```js
auth:{
  requestOtp:(phone)=> fetch('/api/auth/otp',{method:'POST',body:JSON.stringify({phone})}).then(r=>r.json()),
  verifyOtp:(phone,code)=> fetch('/api/auth/verify',{method:'POST',body:JSON.stringify({phone,code})}).then(r=>r.json()),
  signUp:(p)=> fetch('/api/auth/signup',{method:'POST',body:JSON.stringify(p)}).then(r=>r.json())
}
```

Each must resolve to `{ ok:true, data:{ token, user:{ name, phone, initials, role, city } } }`.
On success `auth.js` calls `NL.setUser(user)` — store the `token` too if you
use bearer auth. For Google sign-in, hook `#siGoogle` / the Google button to
your OAuth flow and call `NL.setUser()` with the result.

## 3. Data API — replace mock with real endpoints

Everything reads/writes through `NL.api` (in `api.js`). Today each method
wraps the arrays in `data.js`. Swap the body for a `fetch`; **call sites never
change.** Methods already return Promises of `{ ok, data }`.

| Facade method | Suggested endpoint |
|---|---|
| `NL.api.listings.list(opts)` | `GET /api/listings?cat=&group=&search=&max=&sort=` |
| `NL.api.listings.get(id)` | `GET /api/listings/:id` |
| `NL.api.listings.related(id)` | `GET /api/listings/:id/related` |
| `NL.api.listings.mine()` | `GET /api/me/listings` |
| `NL.api.listings.create(p)` | `POST /api/listings` |
| `NL.api.listings.saveDraft(p)` | `POST /api/listings?draft=1` |
| `NL.api.messages.conversations()` | `GET /api/conversations` |
| `NL.api.messages.thread(id)` | `GET /api/conversations/:id/messages` |
| `NL.api.messages.send(id,text)` | `POST /api/conversations/:id/messages` |
| `NL.api.notifications.list()` | `GET /api/notifications` |
| `NL.api.notifications.markRead(id)` | `POST /api/notifications/:id/read` |
| `NL.api.notifications.markAllRead()` | `POST /api/notifications/read-all` |

`NL.api.rate.get()` / the live FX ticker already hit public exchange-rate APIs
— keep or proxy through your server.

## 4. Photo uploads

The Post wizard reads photos as base64 (`FileReader`) for instant preview.
For production, in `post.js` `publish()` upload the `File` objects to your
storage (S3 / Cloudinary / Firebase Storage) and send the returned URLs to
`NL.api.listings.create`.

## 5. What's real vs. mock today

- **Real:** all UI, routing, auth state machine, favourites & recently-viewed
  (localStorage), live USD→SSP rate, search, filters, wizard, chat UI.
- **Mock:** listings, conversations, notifications, requests, OTP verification
  (any 6 digits pass — see the note on the sign-in screen).

## 6. Suggested next steps

1. Stand up the API endpoints above (Node/Express, Supabase, or Firebase).
2. Replace `NL.api.auth.*` and add token storage.
3. Replace `NL.api.listings.*` and `messages.*`.
4. Move image upload server-side.
5. Add real-time messaging (WebSocket / Firebase) inside `messages.js`.
6. Re-enable a caching service worker once content is stable.
