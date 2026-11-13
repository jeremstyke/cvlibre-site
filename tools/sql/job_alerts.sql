-- 14 nov 2026 (Jeremy): job alerts by web push (own notifications, not Adrenalead).
-- Paste into Supabase > SQL editor (project CVLibre) and run once. Only the CVLibre server uses it, with the secret.
create table if not exists public.job_alerts (
  id bigint generated always as identity primary key,
  tok text not null, endpoint text not null, p256dh text not null, auth text not null,
  q text not null default '', ville text not null default '', contrat text not null default '',
  lang text not null default 'fr', cc text not null default '', uip text not null default '',
  seen jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(),
  last_sent timestamptz, sent_count int not null default 0
);
create index if not exists job_alerts_endpoint on public.job_alerts(endpoint);
alter table public.job_alerts enable row level security;
create table if not exists public.job_alert_runs (day text primary key, at timestamptz not null default now());
alter table public.job_alert_runs enable row level security;
create or replace function public.jal_ok(s text) returns boolean language plpgsql security definer set search_path = public as $$
declare sec text;
begin
  select decrypted_secret into sec from vault.decrypted_secrets where name = 'cj_rpc_secret';
  return s is not null and sec is not null and s = sec;
end $$;
revoke all on function public.jal_ok(text) from public, anon, authenticated;
create or replace function public.job_alert_put(s text, a jsonb) returns bigint language plpgsql security definer set search_path = public as $$
declare nid bigint;
begin
  if not jal_ok(s) then raise exception 'forbidden'; end if;
  delete from job_alerts where endpoint = a->>'endpoint' and q = coalesce(a->>'q','') and ville = coalesce(a->>'ville','') and contrat = coalesce(a->>'contrat','');
  if (select count(*) from job_alerts where endpoint = a->>'endpoint') >= 5 then raise exception 'too_many'; end if;
  insert into job_alerts(tok, endpoint, p256dh, auth, q, ville, contrat, lang, cc, uip, seen)
  values (a->>'tok', a->>'endpoint', a->>'p256dh', a->>'auth', coalesce(a->>'q',''), coalesce(a->>'ville',''), coalesce(a->>'contrat',''), coalesce(a->>'lang','fr'), coalesce(a->>'cc',''), coalesce(a->>'uip',''), coalesce(a->'seen','[]'::jsonb))
  returning id into nid;
  return nid;
end $$;
create or replace function public.job_alert_del(s text, aid bigint, t text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not jal_ok(s) then raise exception 'forbidden'; end if;
  delete from job_alerts where id = aid and tok = t;
  return found;
end $$;
create or replace function public.job_alerts_all(s text) returns setof public.job_alerts language plpgsql security definer set search_path = public as $$
begin
  if not jal_ok(s) then raise exception 'forbidden'; end if;
  return query select * from job_alerts order by id;
end $$;
create or replace function public.job_alert_done(s text, aid bigint, sn jsonb, sent boolean, gone boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not jal_ok(s) then raise exception 'forbidden'; end if;
  if gone then delete from job_alerts where id = aid; return; end if;
  update job_alerts set seen = coalesce(sn, seen), last_sent = case when sent then now() else last_sent end,
    sent_count = sent_count + case when sent then 1 else 0 end where id = aid;
end $$;
create or replace function public.job_alert_claim(s text, d text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not jal_ok(s) then raise exception 'forbidden'; end if;
  insert into job_alert_runs(day) values (d) on conflict do nothing;
  return found;
end $$;
