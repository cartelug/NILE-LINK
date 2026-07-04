-- ============================================================
-- NILE LINK — Supabase schema (v1)
-- Run this AFTER creating the Supabase project, in the SQL editor.
-- Then run 02_policies.sql, then 03_seed.sql.
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------- ENUMS ----------
do $$ begin
  create type listing_status as enum ('draft','pending','live','sold','removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_group as enum ('products','vehprop','services');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_type as enum ('order','contact','quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('request','message','system','boost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('buyer','seller','both');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES ----------
-- Extends auth.users. One row per Supabase auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Guest',
  phone text,
  initials text generated always as (
    upper(substring(regexp_replace(coalesce(name,'G'),'[^A-Za-z ]','','g') from 1 for 1)) ||
    coalesce(
      upper(substring(split_part(regexp_replace(coalesce(name,''),'[^A-Za-z ]','','g'),' ',2) from 1 for 1)),
      ''
    )
  ) stored,
  role user_role not null default 'buyer',
  city text default 'Juba',
  verified boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name','Guest'), new.phone)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- LISTINGS ----------
create table if not exists public.listings (
  id bigserial primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  cat text not null,
  key text not null,                 -- 'electronics' | 'fashion' | 'cars' | 'property' | 'services'
  "group" listing_group not null,
  type listing_type not null,
  usd numeric(12,2) not null check (usd >= 0),
  "from" boolean not null default false,
  note text default '',
  loc text not null,
  city text default 'Juba',
  descr text default '',
  badges text[] not null default '{}'::text[],   -- e.g. {boost,verified,feat}
  img text default '',                            -- primary image (mirrors mock)
  imgs text[] not null default '{}'::text[],      -- extra images
  status listing_status not null default 'live',
  views integer not null default 0,
  requests integer not null default 0,
  search tsvector generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(cat,'') || ' ' || coalesce(loc,'') || ' ' || coalesce(descr,''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_key_idx on public.listings(key);
create index if not exists listings_group_idx on public.listings("group");
create index if not exists listings_owner_idx on public.listings(owner_id);
create index if not exists listings_search_idx on public.listings using gin(search);
create index if not exists listings_created_idx on public.listings(created_at desc);

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- ---------- LISTING IMAGES (optional detail) ----------
create table if not exists public.listing_images (
  id bigserial primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists listing_images_listing_idx on public.listing_images(listing_id);

-- ---------- CONVERSATIONS ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id bigint references public.listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_msg text default '',
  last_time timestamptz,
  unread_for_buyer integer not null default 0,
  unread_for_seller integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);
create index if not exists conv_buyer_idx on public.conversations(buyer_id);
create index if not exists conv_seller_idx on public.conversations(seller_id);
create index if not exists conv_updated_idx on public.conversations(updated_at desc);

drop trigger if exists conv_touch on public.conversations;
create trigger conv_touch before update on public.conversations
  for each row execute function public.touch_updated_at();

-- ---------- MESSAGES ----------
create table if not exists public.messages (
  id bigserial primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  image_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists msg_conv_idx on public.messages(conversation_id, created_at);

-- After insert: update conversation's last_msg/last_time/unread counter
create or replace function public.on_message_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare c record;
begin
  select * into c from public.conversations where id = new.conversation_id;
  update public.conversations
     set last_msg = new.body,
         last_time = new.created_at,
         updated_at = now(),
         unread_for_buyer  = case when new.sender_id = c.seller_id then unread_for_buyer + 1 else unread_for_buyer end,
         unread_for_seller = case when new.sender_id = c.buyer_id  then unread_for_seller + 1 else unread_for_seller end
   where id = new.conversation_id;
  return new;
end $$;

drop trigger if exists messages_bump_conv on public.messages;
create trigger messages_bump_conv after insert on public.messages
  for each row execute function public.on_message_insert();

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  link text,
  icon text default 'spark',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notif_user_idx on public.notifications(user_id, created_at desc);
create index if not exists notif_unread_idx on public.notifications(user_id) where read = false;

-- ---------- FAVOURITES ----------
create table if not exists public.favourites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id bigint not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------- DRAFTS ----------
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  payload jsonb not null,
  pct integer not null default 0,
  missing text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists drafts_owner_idx on public.drafts(owner_id);

drop trigger if exists drafts_touch on public.drafts;
create trigger drafts_touch before update on public.drafts
  for each row execute function public.touch_updated_at();

-- ---------- REPORTS (moderation queue) ----------
create table if not exists public.reports (
  id bigserial primary key,
  listing_id bigint references public.listings(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  details text default '',
  status text not null default 'open',   -- open | reviewing | resolved | dismissed
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports(status);

-- ---------- HELPFUL VIEWS ----------
-- Conversations enriched with the "other" party info + listing title.
create or replace view public.v_conversations as
  select
    c.id,
    c.listing_id,
    l.title as listing_title,
    c.buyer_id,
    bp.name as buyer_name,
    bp.initials as buyer_initials,
    bp.verified as buyer_verified,
    c.seller_id,
    sp.name as seller_name,
    sp.initials as seller_initials,
    sp.verified as seller_verified,
    c.last_msg,
    c.last_time,
    c.unread_for_buyer,
    c.unread_for_seller,
    c.updated_at
  from public.conversations c
  left join public.listings l on l.id = c.listing_id
  left join public.profiles bp on bp.id = c.buyer_id
  left join public.profiles sp on sp.id = c.seller_id;

-- Listings enriched with seller name.
create or replace view public.v_listings as
  select l.*, p.name as seller_name, p.verified as seller_verified
    from public.listings l
    join public.profiles p on p.id = l.owner_id;

-- ---------- RLS ENABLE (policies live in 02_policies.sql) ----------
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_images enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;
alter table public.notifications  enable row level security;
alter table public.favourites     enable row level security;
alter table public.drafts         enable row level security;
alter table public.reports        enable row level security;
