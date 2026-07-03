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
