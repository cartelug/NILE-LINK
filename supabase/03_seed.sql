-- ============================================================
-- NILE LINK — Seed data (v1)
-- Loads a set of demo sellers and the 12 listings from the current
-- mock so the marketplace is populated on day 1.
-- Run AFTER 01_schema.sql + 02_policies.sql.
-- ============================================================

-- We need placeholder auth.users to own the seed listings. In a real
-- Supabase project, create these users via Auth > Users first, or use
-- the SQL below (requires service-role) to insert them directly.
-- The UUIDs are stable so seeds are idempotent.

-- Fake seller identities. Insert into auth.users (SUPABASE INTERNAL - only works with service role).
-- If this errors ("permission denied"), skip this block and instead
-- create 6 users manually in Dashboard > Auth > Users, then edit the
-- IDs below to match, or use the SQL editor as postgres.

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111','authenticated','authenticated','techhub@demo.nilelink','',now(),now(),now()),
  ('22222222-2222-2222-2222-222222222222','authenticated','authenticated','nilemotors@demo.nilelink','',now(),now(),now()),
  ('33333333-3333-3333-3333-333333333333','authenticated','authenticated','jubahomes@demo.nilelink','',now(),now(),now()),
  ('44444444-4444-4444-4444-444444444444','authenticated','authenticated','lensia@demo.nilelink','',now(),now(),now()),
  ('55555555-5555-5555-5555-555555555555','authenticated','authenticated','achol@demo.nilelink','',now(),now(),now()),
  ('66666666-6666-6666-6666-666666666666','authenticated','authenticated','powerline@demo.nilelink','',now(),now(),now()),
  ('77777777-7777-7777-7777-777777777777','authenticated','authenticated','equity@demo.nilelink','',now(),now(),now()),
  ('88888888-8888-8888-8888-888888888888','authenticated','authenticated','ridemart@demo.nilelink','',now(),now(),now()),
  ('99999999-9999-9999-9999-999999999999','authenticated','authenticated','sparkle@demo.nilelink','',now(),now(),now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','authenticated','authenticated','sweetnile@demo.nilelink','',now(),now(),now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','authenticated','authenticated','stepup@demo.nilelink','',now(),now(),now())
on conflict (id) do nothing;

-- Profiles (trigger will have created stubs; upsert names)
insert into public.profiles (id, name, phone, role, city, verified) values
  ('11111111-1111-1111-1111-111111111111','TechHub SS','+211900000001','seller','Juba', true),
  ('22222222-2222-2222-2222-222222222222','Nile Motors','+211900000002','seller','Juba', true),
  ('33333333-3333-3333-3333-333333333333','Juba Homes','+211900000003','seller','Juba', true),
  ('44444444-4444-4444-4444-444444444444','Lensia Studio','+211900000004','seller','Juba', false),
  ('55555555-5555-5555-5555-555555555555','Achol Styles','+211900000005','seller','Juba', false),
  ('66666666-6666-6666-6666-666666666666','PowerLine','+211900000006','seller','Juba', false),
  ('77777777-7777-7777-7777-777777777777','Equity Lands','+211900000007','seller','Juba', true),
  ('88888888-8888-8888-8888-888888888888','RideMart','+211900000008','seller','Juba', false),
  ('99999999-9999-9999-9999-999999999999','SparkleCo','+211900000009','seller','Juba', false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Sweet Nile','+211900000010','seller','Juba', false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Step Up','+211900000011','seller','Juba', false)
on conflict (id) do update set name = excluded.name, phone = excluded.phone, role = excluded.role, city = excluded.city, verified = excluded.verified;

-- ---------- LISTINGS (mirrors current data.js LISTINGS) ----------
insert into public.listings (id, owner_id, title, cat, key, "group", type, usd, "from", note, loc, descr, badges, img, status)
values
  (1,'11111111-1111-1111-1111-111111111111','iPhone 13 Pro · 256GB · Clean','Phones & Electronics','electronics','products','order',720,false,'','Juba, Hai Cinema','iPhone 13 Pro in clean condition, 256GB, battery health 92%. Comes with charger and protective case. Serious buyers only.','{boost,verified}','https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (2,'22222222-2222-2222-2222-222222222222','Toyota Land Cruiser V8 (2016)','Cars & Motorbikes','cars','vehprop','contact',42000,false,'','Juba, Tongping','2016 Toyota Land Cruiser V8, full option, leather seats, low mileage, well maintained. Inspection welcome at our Tongping yard.','{feat,verified}','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (3,'33333333-3333-3333-3333-333333333333','3-Bedroom House · Thongpiny','Property & Land','property','vehprop','contact',850,false,'/mo','Juba, Thongpiny','Spacious 3-bedroom house in a secure compound. Self-contained, parking for 2 cars, water tank, standby generator.','{verified}','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (4,'44444444-4444-4444-4444-444444444444','Wedding & Event Photography','Services','services','services','quote',150,true,'','Juba','Professional photography and videography for weddings, graduations and corporate events. Packages from half-day to full coverage with edited album.','{boost}','https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (5,'55555555-5555-5555-5555-555555555555','Ankara Two-Piece Set · Custom','Fashion & Beauty','fashion','products','order',35,false,'','Juba, Konyokonyo','Custom-tailored Ankara two-piece set. Choose your fabric and size. Made to order within 3 days.','{boost}','https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (6,'66666666-6666-6666-6666-666666666666','Hisense 3.5KVA Generator','Phones & Electronics','electronics','products','order',410,false,'','Juba, Gudele','Hisense 3.5KVA petrol generator, brand new, fuel efficient with key start. Ideal for home or small shop.','{}','https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (7,'77777777-7777-7777-7777-777777777777','Plot of Land 50x100 · Gudele','Property & Land','property','vehprop','contact',12000,false,'','Juba, Gudele','Residential plot 50x100 in a fast-developing area of Gudele. Clean documents, ready for transfer.','{verified}','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (8,'88888888-8888-8888-8888-888888888888','Bajaj Boxer Motorbike (2022)','Cars & Motorbikes','cars','vehprop','contact',1250,false,'','Juba, Munuki','2022 Bajaj Boxer, single owner, excellent condition, ideal for boda business or personal use.','{boost}','https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (9,'99999999-9999-9999-9999-999999999999','Home & Office Deep Cleaning','Services','services','services','quote',25,true,'','Juba','Reliable home and office cleaning team. One-off or weekly. We bring our own supplies and equipment.','{}','https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (10,'11111111-1111-1111-1111-111111111111','Samsung Galaxy A54 · 128GB','Phones & Electronics','electronics','products','order',310,false,'','Juba, Custom','New Samsung Galaxy A54, 128GB, sealed in box with one year warranty. Multiple colours available.','{verified}','https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (11,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Custom Cakes & Pastries','Services','services','services','quote',20,true,'','Juba','Custom cakes for birthdays, weddings and events. Order 48 hours ahead. Delivery available in Juba.','{boost}','https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=460&fit=crop&auto=format&q=80','live'),
  (12,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Men''s Leather Shoes · Italian','Fashion & Beauty','fashion','products','order',45,false,'','Juba, Jebel','Genuine leather formal shoes, sizes 40-45. Comfortable and durable. Bulk orders welcome.','{}','https://images.unsplash.com/photo-1614253429340-98120bd6d753?w=600&h=460&fit=crop&auto=format&q=80','live')
on conflict (id) do nothing;

-- Advance the sequence past the seeded ids
select setval('public.listings_id_seq', greatest((select max(id) from public.listings), 12));
