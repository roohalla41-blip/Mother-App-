-- Mother Hub initial schema.
-- Apply only to the dedicated Mother Hub Supabase project after reviewing this migration.
create extension if not exists pgcrypto;

do $$ begin create type public.app_price as enum ('free','paid'); exception when duplicate_object then null; end $$;
do $$ begin create type public.app_status as enum ('published','updating','coming_soon','inactive','draft'); exception when duplicate_object then null; end $$;
do $$ begin create type public.release_type as enum ('android_apk','android_aab','windows','macos','linux','web','zip','pdf','other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.release_status as enum ('active','inactive','outdated','updating'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_status as enum ('draft','published','updating','inactive'); exception when duplicate_object then null; end $$;
do $$ begin create type public.announcement_type as enum ('notice','update','news','maintenance'); exception when duplicate_object then null; end $$;
do $$ begin create type public.announcement_scope as enum ('site','app'); exception when duplicate_object then null; end $$;
do $$ begin create type public.announcement_status as enum ('draft','published','inactive'); exception when duplicate_object then null; end $$;
do $$ begin create type public.comment_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.support_status as enum ('open','in_progress','resolved','closed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.support_priority as enum ('low','medium','high'); exception when duplicate_object then null; end $$;
do $$ begin create type public.keepalive_status as enum ('active','needs_review'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.builders (
 id uuid primary key default gen_random_uuid(), display_name text not null, slug text not null unique,
 logo text, short_bio text, full_bio text, website_url text, is_public boolean not null default true,
 app_slugs text[] not null default '{}', display_order numeric not null default 0,
 user_id uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, icon text,
 is_active boolean not null default true, display_order numeric not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.apps (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 short_name text, tagline text, description text, full_description text, category text references public.categories(slug) on update cascade on delete set null,
 price public.app_price not null default 'free', price_label text, version text, release_date text, last_update text,
 downloads text, show_download_count boolean not null default false, rating numeric(2,1), review_count integer not null default 0,
 icon text, gradient text, status public.app_status not null default 'draft', is_new boolean not null default false,
 is_popular boolean not null default false, is_suggested boolean not null default false, features text[] not null default '{}',
 use_cases text[] not null default '{}', website_url text, web_app_url text, video_url text, cover_image text,
 download_url text, gallery text[] not null default '{}', related_slugs text[] not null default '{}',
 show_on_homepage boolean not null default false, display_order numeric not null default 0,
 builder_id uuid references public.builders(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.releases (
 id uuid primary key default gen_random_uuid(), app_id uuid not null references public.apps(id) on delete cascade,
 type public.release_type not null default 'android_apk', label text, version text, size text, file_name text,
 download_url text, release_date text, status public.release_status not null default 'active', is_latest boolean not null default false,
 compatibility text, note text, download_count integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tutorials (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, excerpt text, body text,
 cover_image text, video_url text, category text, author text, app_slug text references public.apps(slug) on update cascade on delete set null,
 duration text, status public.content_status not null default 'draft', publish_date text, last_update text,
 display_order numeric not null default 0, show_on_homepage boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.news (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, excerpt text, body text,
 cover_image text, category text, author text, app_slug text references public.apps(slug) on update cascade on delete set null,
 related_version text, status public.content_status not null default 'draft', publish_date text, last_update text,
 display_order numeric not null default 0, show_on_homepage boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.announcements (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, body text, excerpt text, image text,
 type public.announcement_type not null default 'notice', scope public.announcement_scope not null default 'site',
 app_slug text references public.apps(slug) on update cascade on delete set null,
 status public.announcement_status not null default 'draft', is_important boolean not null default false, publish_date text,
 display_order numeric not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(), app_id uuid references public.apps(id) on delete cascade,
 tutorial_id uuid references public.tutorials(id) on delete cascade, news_id uuid references public.news(id) on delete cascade,
 author_name text not null, author_email text, rating integer check (rating between 1 and 5), body text not null,
 status public.comment_status not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint comments_one_target check (num_nonnulls(app_id,tutorial_id,news_id)=1)
);
create table if not exists public.support_messages (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null, subject text, body text not null,
 app_slug text, status public.support_status not null default 'open', priority public.support_priority not null default 'medium',
 reply text, replied_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.settings (
 id uuid primary key default gen_random_uuid(), key text not null unique, value text, category text, description text,
 is_public boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.system_keep_alive (
 id uuid primary key default gen_random_uuid(), type text not null default 'system_keep_alive', date text not null unique,
 last_activity timestamptz, status public.keepalive_status not null default 'active',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Updated timestamps.
do $$ declare t text; begin
 foreach t in array array['builders','categories','apps','releases','tutorials','news','announcements','comments','support_messages','settings','system_keep_alive'] loop
  execute format('drop trigger if exists set_updated_at on public.%I',t);
  execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t);
 end loop;
end $$;

-- Builder access is granted only by trusted project administrators through auth.users.app_metadata.role.
create or replace function public.is_builder()
returns boolean language sql stable security definer set search_path = '' as $$
 select coalesce(auth.jwt()->'app_metadata'->>'role' in ('builder','admin'), false)
$$;

alter table public.builders enable row level security;
alter table public.categories enable row level security;
alter table public.apps enable row level security;
alter table public.releases enable row level security;
alter table public.tutorials enable row level security;
alter table public.news enable row level security;
alter table public.announcements enable row level security;
alter table public.comments enable row level security;
alter table public.support_messages enable row level security;
alter table public.settings enable row level security;
alter table public.system_keep_alive enable row level security;

-- Public users can only read published content. All management writes require builder/admin claims.
create policy "public read builders" on public.builders for select using (is_public or public.is_builder());
create policy "builder manage builders" on public.builders for all using (public.is_builder()) with check (public.is_builder());
create policy "public read active categories" on public.categories for select using (is_active or public.is_builder());
create policy "builder manage categories" on public.categories for all using (public.is_builder()) with check (public.is_builder());
create policy "public read published apps" on public.apps for select using (status='published' or public.is_builder());
create policy "builder manage apps" on public.apps for all using (public.is_builder()) with check (public.is_builder());
create policy "public read active releases" on public.releases for select using ((status='active' and exists(select 1 from public.apps a where a.id=app_id and a.status='published')) or public.is_builder());
create policy "builder manage releases" on public.releases for all using (public.is_builder()) with check (public.is_builder());
create policy "public read tutorials" on public.tutorials for select using (status='published' or public.is_builder());
create policy "builder manage tutorials" on public.tutorials for all using (public.is_builder()) with check (public.is_builder());
create policy "public read news" on public.news for select using (status='published' or public.is_builder());
create policy "builder manage news" on public.news for all using (public.is_builder()) with check (public.is_builder());
create policy "public read announcements" on public.announcements for select using (status='published' or public.is_builder());
create policy "builder manage announcements" on public.announcements for all using (public.is_builder()) with check (public.is_builder());
create policy "public read approved comments" on public.comments for select using (status='approved' or public.is_builder());
create policy "public submit comments" on public.comments for insert with check (status='pending');
create policy "builder manage comments" on public.comments for all using (public.is_builder()) with check (public.is_builder());
create policy "public submit support" on public.support_messages for insert with check (status='open');
create policy "builder read support" on public.support_messages for select using (public.is_builder());
create policy "builder update support" on public.support_messages for update using (public.is_builder()) with check (public.is_builder());
create policy "public read public settings" on public.settings for select using (is_public or public.is_builder());
create policy "builder manage settings" on public.settings for all using (public.is_builder()) with check (public.is_builder());
create policy "builder manage keepalive" on public.system_keep_alive for all using (public.is_builder()) with check (public.is_builder());

grant usage on schema public to anon, authenticated;
grant select on public.builders,public.categories,public.apps,public.releases,public.tutorials,public.news,public.announcements,public.comments,public.settings to anon,authenticated;
grant insert on public.comments,public.support_messages to anon,authenticated;
grant select,insert,update,delete on all tables in schema public to authenticated;

-- Optional private storage bucket for product binaries and images.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('madar-files','madar-files',false,52428800,array['image/png','image/jpeg','image/webp','application/pdf','application/vnd.android.package-archive','application/zip'])
on conflict (id) do nothing;
create policy "public can download published release assets" on storage.objects for select to anon,authenticated
using (bucket_id='madar-files' and exists (
 select 1 from public.releases r join public.apps a on a.id=r.app_id
 where r.status='active' and a.status='published' and (storage.objects.name=r.file_name or storage.objects.name like r.file_name || '/%')
));
create policy "builders manage product files" on storage.objects for all to authenticated
using (bucket_id='madar-files' and public.is_builder())
with check (bucket_id='madar-files' and public.is_builder());

create index if not exists apps_status_order_idx on public.apps(status,display_order);
create index if not exists releases_app_status_idx on public.releases(app_id,status);
create index if not exists tutorials_status_order_idx on public.tutorials(status,display_order);
create index if not exists news_status_order_idx on public.news(status,display_order);
create index if not exists announcements_status_order_idx on public.announcements(status,display_order);