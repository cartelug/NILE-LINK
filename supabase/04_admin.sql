-- ============================================================
-- NILE LINK — Admin panel backend (v1)
-- Run AFTER 01_schema.sql, 02_policies.sql.
--
-- Access model: a single secret ADMIN KEY (not tied to user auth,
-- so it works today even before real phone-OTP). The key is stored
-- ONLY as a bcrypt hash. Every admin action re-verifies the key
-- server-side inside a SECURITY DEFINER function, so the browser
-- never holds standing privileges — just the secret you type in.
-- ============================================================

-- ---------- Admin key storage ----------
create table if not exists public.admin_config (
  id int primary key default 1,
  key_hash text not null,
  constraint admin_config_single_row check (id = 1)
);
-- RLS on, with NO policies → the table is invisible to the public API.
-- Only the SECURITY DEFINER function below (which runs as the owner)
-- can read it.
alter table public.admin_config enable row level security;

-- ============================================================
-- SET YOUR ADMIN KEY  (run this ONCE, with your own secret).
-- Pick a long, random passphrase — this is your admin password.
-- Example below uses 'CHANGE-ME-to-a-long-secret' — REPLACE IT.
-- ============================================================
insert into public.admin_config (id, key_hash)
values (1, crypt('CHANGE-ME-to-a-long-secret', gen_salt('bf')))
on conflict (id) do update set key_hash = excluded.key_hash;

-- ---------- The one admin RPC ----------
create or replace function public.nl_admin(
  p_key text,
  p_action text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ok boolean;
  v_result jsonb;
begin
  -- Verify the admin key against the stored bcrypt hash
  select (key_hash = crypt(p_key, key_hash)) into v_ok
    from public.admin_config where id = 1;

  if not coalesce(v_ok, false) then
    return jsonb_build_object('ok', false, 'error', 'Invalid admin key');
  end if;

  if p_action = 'stats' then
    v_result := jsonb_build_object(
      'listings_live',    (select count(*) from listings where status='live'),
      'listings_removed', (select count(*) from listings where status='removed'),
      'reports_open',     (select count(*) from reports where status='open'),
      'sellers',          (select count(*) from profiles),
      'sellers_verified', (select count(*) from profiles where verified)
    );

  elsif p_action = 'listings' then
    v_result := coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select l.id, l.title, l.cat, l.usd, l.loc, l.status, l.created_at,
               p.name as seller_name, p.verified as seller_verified
          from listings l
          left join profiles p on p.id = l.owner_id
         order by l.created_at desc
         limit 300
      ) t), '[]'::jsonb);

  elsif p_action = 'remove_listing' then
    update listings set status = 'removed'
      where id = (p_payload->>'id')::bigint;
    v_result := jsonb_build_object('id', p_payload->>'id', 'status', 'removed');

  elsif p_action = 'restore_listing' then
    update listings set status = 'live'
      where id = (p_payload->>'id')::bigint;
    v_result := jsonb_build_object('id', p_payload->>'id', 'status', 'live');

  elsif p_action = 'reports' then
    v_result := coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select r.id, r.listing_id, r.reason, r.details, r.status, r.created_at,
               l.title as listing_title
          from reports r
          left join listings l on l.id = r.listing_id
         order by (r.status = 'open') desc, r.created_at desc
         limit 300
      ) t), '[]'::jsonb);

  elsif p_action = 'resolve_report' then
    update reports set status = coalesce(p_payload->>'status', 'resolved')
      where id = (p_payload->>'id')::bigint;
    v_result := jsonb_build_object('id', p_payload->>'id', 'status', coalesce(p_payload->>'status','resolved'));

  elsif p_action = 'sellers' then
    v_result := coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select p.id, p.name, p.phone, p.city, p.verified, p.role, p.created_at,
               (select count(*) from listings l where l.owner_id = p.id) as listing_count
          from profiles p
         order by p.created_at desc
         limit 300
      ) t), '[]'::jsonb);

  elsif p_action = 'set_verified' then
    update profiles set verified = (p_payload->>'verified')::boolean
      where id = (p_payload->>'id')::uuid;
    v_result := jsonb_build_object('id', p_payload->>'id', 'verified', p_payload->>'verified');

  else
    return jsonb_build_object('ok', false, 'error', 'Unknown action: ' || p_action);
  end if;

  return jsonb_build_object('ok', true, 'data', v_result);
end $$;

-- The function runs as its owner (bypassing RLS); the public may only
-- CALL it, and it does nothing without the correct key.
grant execute on function public.nl_admin(text, text, jsonb) to anon, authenticated;

-- ============================================================
-- To change your admin key later, re-run just the INSERT ... ON CONFLICT
-- block above with a new secret.
-- ============================================================
