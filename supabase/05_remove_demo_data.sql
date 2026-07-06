-- ============================================================
-- NILE LINK — Remove demo/seed data (v1)
--
-- Run this WHENEVER you're ready to go all-real — e.g. once you have
-- real sellers posting and want Browse to show only genuine listings.
--
-- Safe by design:
--   - Only touches the 12 listings seeded by 03_seed.sql (ids 1-12)
--     AND only if they still belong to one of the 11 known seed seller
--     UUIDs below — a real listing can never match both conditions,
--     even if a real listing later reuses id 1-12 (it won't: the
--     sequence was advanced past 12 in 03_seed.sql).
--   - Deleting a seed profile cascades to delete that seller's seed
--     listings automatically (owner_id references profiles(id) on
--     delete cascade) — the explicit listings DELETE below is just a
--     belt-and-suspenders double-check, order doesn't matter.
--   - Everything else (real listings, real users, real messages,
--     real reports) is completely untouched.
--
-- This does NOT need to be run before you have real users — the demo
-- listings are harmless placeholders until then. Run it once your
-- Browse page has enough real listings that you'd rather not show
-- "TechHub SS" and friends anymore.
-- ============================================================

do $$
declare
  seed_ids uuid[] := array[
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  ]::uuid[];
begin
  -- 1. Remove the 12 seed listings (double-checked by id AND owner_id)
  delete from public.listings
   where id between 1 and 12
     and owner_id = any(seed_ids);

  -- 2. Remove the seed seller profiles (cascades to any of their
  --    remaining rows: drafts, favourites, conversations as seller, etc.)
  delete from public.profiles
   where id = any(seed_ids);

  -- 3. Remove the seed auth users themselves, so they no longer show
  --    up anywhere (Supabase Auth > Users, admin Sellers tab, etc.)
  delete from auth.users
   where id = any(seed_ids);

  raise notice 'Demo/seed data removed. Real listings, users, messages and reports were not touched.';
end $$;
