-- ============================================================
-- NILE LINK — Row-Level Security policies (v1)
-- Run AFTER 01_schema.sql.
-- ============================================================

-- ---------- PROFILES ----------
-- Anyone can read a profile (name + city + verified appear on public listings)
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (true);

-- Users can insert/update their own profile row
drop policy if exists profiles_upsert_self on public.profiles;
create policy profiles_upsert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- LISTINGS ----------
-- Anyone can read live listings; owners can read their own regardless of status
drop policy if exists listings_read_public on public.listings;
create policy listings_read_public on public.listings
  for select using (status = 'live' or owner_id = auth.uid());

-- Only auth'd users can insert, and only as themselves
drop policy if exists listings_insert_self on public.listings;
create policy listings_insert_self on public.listings
  for insert with check (auth.uid() = owner_id);

drop policy if exists listings_update_self on public.listings;
create policy listings_update_self on public.listings
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists listings_delete_self on public.listings;
create policy listings_delete_self on public.listings
  for delete using (auth.uid() = owner_id);

-- ---------- LISTING IMAGES ----------
drop policy if exists listing_images_read on public.listing_images;
create policy listing_images_read on public.listing_images
  for select using (
    exists (select 1 from public.listings l
             where l.id = listing_id and (l.status = 'live' or l.owner_id = auth.uid()))
  );

drop policy if exists listing_images_write_owner on public.listing_images;
create policy listing_images_write_owner on public.listing_images
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())
  );

-- ---------- CONVERSATIONS ----------
-- Only participants can read/write
drop policy if exists conv_participants on public.conversations;
create policy conv_participants on public.conversations
  for select using (auth.uid() in (buyer_id, seller_id));

drop policy if exists conv_insert_buyer on public.conversations;
create policy conv_insert_buyer on public.conversations
  for insert with check (auth.uid() = buyer_id);

drop policy if exists conv_update_participant on public.conversations;
create policy conv_update_participant on public.conversations
  for update using (auth.uid() in (buyer_id, seller_id))
             with check (auth.uid() in (buyer_id, seller_id));

-- ---------- MESSAGES ----------
drop policy if exists messages_read_participant on public.messages;
create policy messages_read_participant on public.messages
  for select using (
    exists (select 1 from public.conversations c
             where c.id = conversation_id
               and auth.uid() in (c.buyer_id, c.seller_id))
  );

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.conversations c
             where c.id = conversation_id
               and auth.uid() in (c.buyer_id, c.seller_id))
  );

-- ---------- NOTIFICATIONS ----------
drop policy if exists notifs_read_self on public.notifications;
create policy notifs_read_self on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists notifs_update_self on public.notifications;
create policy notifs_update_self on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- (Notifications are typically inserted server-side by triggers/edge functions.
--  Client can insert its own for demo purposes.)
drop policy if exists notifs_insert_self on public.notifications;
create policy notifs_insert_self on public.notifications
  for insert with check (user_id = auth.uid());

-- ---------- FAVOURITES ----------
drop policy if exists fav_self on public.favourites;
create policy fav_self on public.favourites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- DRAFTS ----------
drop policy if exists drafts_self on public.drafts;
create policy drafts_self on public.drafts
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------- REPORTS ----------
-- Any authed user can file a report; only the reporter can see their own reports (admin uses service role).
drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self on public.reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists reports_read_self on public.reports;
create policy reports_read_self on public.reports
  for select using (reporter_id = auth.uid());

-- ============================================================
-- STORAGE POLICIES (bucket: listing-photos)
-- Create the bucket first (in Storage > New bucket > Public):
--    Name: listing-photos   Public: yes
-- Then paste these policies in Storage > Policies for the bucket.
-- ============================================================
-- Public read:
--   bucket_id = 'listing-photos'
-- Authed insert (any authed user):
--   auth.role() = 'authenticated' and bucket_id = 'listing-photos'
-- (Object path convention: <owner_uid>/<listing_id>/<file>)
-- Authed update/delete only own path:
--   bucket_id = 'listing-photos' and (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================================
-- API ROLE GRANTS (required when "Automatically expose new
-- tables" is disabled at project creation — the recommended
-- setting). Without these, the Data API returns
-- "permission denied for table ..." even with correct RLS.
-- RLS policies above still control per-row access.
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on all tables in schema public
  to anon, authenticated;

grant usage, select
  on all sequences in schema public
  to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
