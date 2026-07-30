create schema if not exists private;

create table if not exists private.backend_app_keys (
  id text primary key,
  label text not null default 'Next.js backend',
  created_at timestamptz not null default now()
);

insert into private.backend_app_keys (id, label)
values (:'backend_app_key', 'Next.js backend')
on conflict (id) do update
set label = excluded.label;

create or replace function private.is_backend_request()
returns boolean
language sql
stable
security definer
set search_path = private, pg_temp
as $$
  select exists (
    select 1
    from private.backend_app_keys
    where id = coalesce(
      nullif(coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-backend-api-key', ''),
      nullif(coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'X-Backend-Api-Key', '')
    )
  );
$$;

revoke all on function private.is_backend_request() from public;
grant execute on function private.is_backend_request() to anon, authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.backend_records (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  collection text not null check (collection ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  slug text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  owner_email text,
  payload jsonb not null default '{}'::jsonb,
  file_count integer not null default 0 check (file_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists backend_records_collection_created_idx
  on public.backend_records (collection, created_at desc);

create index if not exists backend_records_visibility_created_idx
  on public.backend_records (visibility, created_at desc);

drop trigger if exists backend_records_set_updated_at on public.backend_records;
create trigger backend_records_set_updated_at
before update on public.backend_records
for each row execute function public.set_updated_at();

create table if not exists public.backend_files (
  id text primary key,
  record_id text references public.backend_records(id) on delete set null,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  bucket_id text not null,
  object_path text not null,
  original_name text,
  content_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists backend_files_record_created_idx
  on public.backend_files (record_id, created_at desc);

create unique index if not exists backend_files_bucket_path_idx
  on public.backend_files (bucket_id, object_path);

create or replace function public.increment_backend_record_file_count(target_record_id text)
returns void
language sql
security invoker
set search_path = public, pg_temp
as $$
  update public.backend_records
  set file_count = file_count + 1
  where id = target_record_id;
$$;

revoke all on function public.increment_backend_record_file_count(text) from public;
grant execute on function public.increment_backend_record_file_count(text) to anon, authenticated, service_role;

alter table public.backend_records enable row level security;
alter table public.backend_files enable row level security;

drop policy if exists backend_records_read on public.backend_records;
create policy backend_records_read
on public.backend_records
for select
to anon, authenticated
using (visibility = 'public' or private.is_backend_request());

drop policy if exists backend_records_insert on public.backend_records;
create policy backend_records_insert
on public.backend_records
for insert
to anon, authenticated
with check (private.is_backend_request());

drop policy if exists backend_records_update on public.backend_records;
create policy backend_records_update
on public.backend_records
for update
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists backend_records_delete on public.backend_records;
create policy backend_records_delete
on public.backend_records
for delete
to anon, authenticated
using (private.is_backend_request());

drop policy if exists backend_files_read on public.backend_files;
create policy backend_files_read
on public.backend_files
for select
to anon, authenticated
using (private.is_backend_request());

drop policy if exists backend_files_insert on public.backend_files;
create policy backend_files_insert
on public.backend_files
for insert
to anon, authenticated
with check (private.is_backend_request());

drop policy if exists backend_files_update on public.backend_files;
create policy backend_files_update
on public.backend_files
for update
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists backend_files_delete on public.backend_files;
create policy backend_files_delete
on public.backend_files
for delete
to anon, authenticated
using (private.is_backend_request());

grant select, insert, update, delete on table public.backend_records to anon, authenticated, service_role;
grant select, insert, update, delete on table public.backend_files to anon, authenticated, service_role;

create table if not exists public.blog_posts (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  tags text[] not null default '{}'::text[],
  cover_tone text not null default 'research',
  source_href text,
  read_time text not null default '4 min baca',
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  owner_email text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create index if not exists blog_posts_status_created_idx on public.blog_posts (status, created_at desc);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

create table if not exists public.chat_profiles (
  email text primary key,
  display_name text not null,
  avatar_url text,
  role text not null default 'visitor' check (role in ('owner', 'visitor', 'backend')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists chat_profiles_set_updated_at on public.chat_profiles;
create trigger chat_profiles_set_updated_at
before update on public.chat_profiles
for each row execute function public.set_updated_at();

create table if not exists public.chat_messages (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  actor_key text not null,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 280),
  status text not null default 'active' check (status in ('active', 'deleted')),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_created_idx on public.chat_messages (created_at desc);
create index if not exists chat_messages_actor_created_idx on public.chat_messages (actor_key, created_at desc);

create or replace function public.broadcast_chat_message_change()
returns trigger
language plpgsql
security definer
set search_path = public, realtime
as $$
declare
  event_name text;
  payload jsonb;
begin
  if (TG_OP = 'INSERT') then
    event_name := 'message_created';
    payload := jsonb_build_object(
      'id', NEW.id,
      'authorName', NEW.author_name,
      'body', NEW.body,
      'createdAt', NEW.created_at,
      'status', NEW.status,
      'storage', jsonb_build_object('shardId', NEW.shard_id)
    );
    perform realtime.send(payload, event_name, 'chat:public', false);
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    event_name := case when NEW.status = 'deleted' then 'message_deleted' else 'message_updated' end;
    payload := jsonb_build_object(
      'id', NEW.id,
      'authorName', NEW.author_name,
      'body', NEW.body,
      'createdAt', NEW.created_at,
      'status', NEW.status,
      'storage', jsonb_build_object('shardId', NEW.shard_id)
    );
    perform realtime.send(payload, event_name, 'chat:public', false);
    return NEW;
  elsif (TG_OP = 'DELETE') then
    event_name := 'message_deleted';
    payload := jsonb_build_object(
      'id', OLD.id,
      'storage', jsonb_build_object('shardId', OLD.shard_id)
    );
    perform realtime.send(payload, event_name, 'chat:public', false);
    return OLD;
  end if;

  return null;
end;
$$;

drop trigger if exists chat_messages_realtime_broadcast on public.chat_messages;
create trigger chat_messages_realtime_broadcast
after insert or update or delete on public.chat_messages
for each row execute function public.broadcast_chat_message_change();

create table if not exists public.inventory_items (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  source_id text,
  type text not null check (type in ('scroll', 'tool', 'artifact', 'medal', 'key')),
  name text not null,
  description text not null default '',
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic')),
  icon text not null default 'icon-artifact-vase',
  acquired_at_label text,
  link_to text,
  status text not null default 'unlocked' check (status in ('unlocked', 'hidden')),
  owner_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_status_created_idx on public.inventory_items (status, created_at desc);
create index if not exists inventory_items_type_created_idx on public.inventory_items (type, created_at desc);

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

create table if not exists public.about_entries (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  entry_key text not null,
  title text,
  body text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'public' check (status in ('public', 'private')),
  owner_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists about_entries_key_idx on public.about_entries (entry_key);
create index if not exists about_entries_status_idx on public.about_entries (status, created_at desc);

drop trigger if exists about_entries_set_updated_at on public.about_entries;
create trigger about_entries_set_updated_at
before update on public.about_entries
for each row execute function public.set_updated_at();

create table if not exists public.contact_channels (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  channel_key text not null,
  label text not null,
  sub text not null default '',
  cta text not null default 'Buka',
  href text not null,
  tone text not null default 'default',
  sort_order integer not null default 0,
  active boolean not null default true,
  owner_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contact_channels_key_idx on public.contact_channels (channel_key);
create index if not exists contact_channels_active_sort_idx on public.contact_channels (active, sort_order, created_at desc);

drop trigger if exists contact_channels_set_updated_at on public.contact_channels;
create trigger contact_channels_set_updated_at
before update on public.contact_channels
for each row execute function public.set_updated_at();

create table if not exists public.contact_events (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  channel_key text,
  event_name text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contact_events_channel_created_idx on public.contact_events (channel_key, created_at desc);

create table if not exists public.nala_conversations (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  session_key text not null,
  actor_key text,
  status text not null default 'active' check (status in ('active', 'archived')),
  source text not null default 'local-factual' check (source in ('openrouter', 'local-factual', 'error')),
  last_expression text not null default 'idle' check (last_expression in ('idle', 'thinking', 'happy', 'confused', 'greeting', 'pointing')),
  last_message_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nala_conversations_session_idx on public.nala_conversations (session_key, last_message_at desc);
create index if not exists nala_conversations_updated_idx on public.nala_conversations (updated_at desc);

drop trigger if exists nala_conversations_set_updated_at on public.nala_conversations;
create trigger nala_conversations_set_updated_at
before update on public.nala_conversations
for each row execute function public.set_updated_at();

create table if not exists public.nala_messages (
  id text primary key,
  shard_id text not null check (shard_id in ('s1', 's2', 's3')),
  conversation_id text not null references public.nala_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool', 'system')),
  body text not null check (char_length(body) between 1 and 4000),
  expression text check (expression in ('idle', 'thinking', 'happy', 'confused', 'greeting', 'pointing')),
  tool_name text,
  tool_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nala_messages_conversation_created_idx on public.nala_messages (conversation_id, created_at asc);
create index if not exists nala_messages_created_idx on public.nala_messages (created_at desc);

alter table public.blog_posts enable row level security;
alter table public.chat_profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.inventory_items enable row level security;
alter table public.about_entries enable row level security;
alter table public.contact_channels enable row level security;
alter table public.contact_events enable row level security;
alter table public.nala_conversations enable row level security;
alter table public.nala_messages enable row level security;

drop policy if exists blog_posts_read on public.blog_posts;
create policy blog_posts_read
on public.blog_posts
for select
to anon, authenticated
using (status = 'published' or private.is_backend_request());

drop policy if exists blog_posts_insert on public.blog_posts;
create policy blog_posts_insert
on public.blog_posts
for insert
to anon, authenticated
with check (private.is_backend_request());

drop policy if exists blog_posts_update on public.blog_posts;
create policy blog_posts_update
on public.blog_posts
for update
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists blog_posts_delete on public.blog_posts;
create policy blog_posts_delete
on public.blog_posts
for delete
to anon, authenticated
using (private.is_backend_request());

drop policy if exists chat_profiles_backend_only on public.chat_profiles;
create policy chat_profiles_backend_only
on public.chat_profiles
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists chat_messages_read on public.chat_messages;
create policy chat_messages_read
on public.chat_messages
for select
to anon, authenticated
using (status = 'active' or private.is_backend_request());

drop policy if exists chat_messages_insert on public.chat_messages;
create policy chat_messages_insert
on public.chat_messages
for insert
to anon, authenticated
with check (private.is_backend_request());

drop policy if exists chat_messages_update on public.chat_messages;
create policy chat_messages_update
on public.chat_messages
for update
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists inventory_items_read on public.inventory_items;
create policy inventory_items_read
on public.inventory_items
for select
to anon, authenticated
using (status = 'unlocked' or private.is_backend_request());

drop policy if exists inventory_items_write on public.inventory_items;
create policy inventory_items_write
on public.inventory_items
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists about_entries_read on public.about_entries;
create policy about_entries_read
on public.about_entries
for select
to anon, authenticated
using (status = 'public' or private.is_backend_request());

drop policy if exists about_entries_write on public.about_entries;
create policy about_entries_write
on public.about_entries
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists contact_channels_read on public.contact_channels;
create policy contact_channels_read
on public.contact_channels
for select
to anon, authenticated
using (active = true or private.is_backend_request());

drop policy if exists contact_channels_write on public.contact_channels;
create policy contact_channels_write
on public.contact_channels
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists contact_events_backend_only on public.contact_events;
create policy contact_events_backend_only
on public.contact_events
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists nala_conversations_backend_only on public.nala_conversations;
create policy nala_conversations_backend_only
on public.nala_conversations
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

drop policy if exists nala_messages_backend_only on public.nala_messages;
create policy nala_messages_backend_only
on public.nala_messages
for all
to anon, authenticated
using (private.is_backend_request())
with check (private.is_backend_request());

grant select, insert, update, delete on table public.blog_posts to anon, authenticated, service_role;
grant select, insert, update, delete on table public.chat_profiles to anon, authenticated, service_role;
grant select, insert, update, delete on table public.chat_messages to anon, authenticated, service_role;
grant select, insert, update, delete on table public.inventory_items to anon, authenticated, service_role;
grant select, insert, update, delete on table public.about_entries to anon, authenticated, service_role;
grant select, insert, update, delete on table public.contact_channels to anon, authenticated, service_role;
grant select, insert, update, delete on table public.contact_events to anon, authenticated, service_role;
grant select, insert, update, delete on table public.nala_conversations to anon, authenticated, service_role;
grant select, insert, update, delete on table public.nala_messages to anon, authenticated, service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'chat_messages'
    )
  then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (:'backend_bucket', :'backend_bucket', false, 52428800, null)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists backend_storage_read on storage.objects;
create policy backend_storage_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = :'backend_bucket' and private.is_backend_request());

drop policy if exists backend_storage_insert on storage.objects;
create policy backend_storage_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = :'backend_bucket' and private.is_backend_request());

drop policy if exists backend_storage_update on storage.objects;
create policy backend_storage_update
on storage.objects
for update
to anon, authenticated
using (bucket_id = :'backend_bucket' and private.is_backend_request())
with check (bucket_id = :'backend_bucket' and private.is_backend_request());

drop policy if exists backend_storage_delete on storage.objects;
create policy backend_storage_delete
on storage.objects
for delete
to anon, authenticated
using (bucket_id = :'backend_bucket' and private.is_backend_request());
