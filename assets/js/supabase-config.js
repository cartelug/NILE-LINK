/* ============================================================
   NILE LINK — supabase-config.js
   Paste your Supabase project URL and public anon key below.
   These are safe to ship to the browser (they are the public
   API keys designed for client-side use). Row-Level Security
   in 02_policies.sql is what actually protects the data.
   ============================================================ */
window.NL_SUPABASE = {
  // From: Supabase Dashboard → Project Settings → API
  url: '',                // e.g. 'https://xxxxxxxxxxxx.supabase.co'
  anonKey: '',            // long JWT starting with 'eyJhbGciOi...'
  storageBucket: 'listing-photos'
};
