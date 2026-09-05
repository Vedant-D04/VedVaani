create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  audio_url text not null,
  book_title text not null,
  author_name text not null,
  genre text not null,
  caption text,
  duration_seconds integer not null check (duration_seconds between 1 and 60),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

insert into public.genres (name)
values
  ('Fiction'),
  ('Non-fiction'),
  ('Poetry'),
  ('Sci-Fi'),
  ('Fantasy'),
  ('Romance'),
  ('Mystery'),
  ('Biography'),
  ('Philosophy'),
  ('Classics')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public)
values ('post-audio', 'post-audio', true)
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.genres enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.reports enable row level security;

create policy "profiles are public readable" on public.users for select using (true);
create policy "users create own profile" on public.users for insert with check (auth.uid() = id);
create policy "users update own profile" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "genres are public readable" on public.genres for select using (true);

create policy "posts are public readable" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "users update own posts" on public.posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own posts" on public.posts for delete using (auth.uid() = user_id);

create policy "comments are public readable" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "users update own comments" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "likes are public readable" on public.likes for select using (true);
create policy "users create own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "users delete own likes" on public.likes for delete using (auth.uid() = user_id);

create policy "users create own reports" on public.reports for insert with check (auth.uid() = user_id);

create policy "audio files are public readable" on storage.objects
for select using (bucket_id = 'post-audio');

create policy "users upload own audio" on storage.objects
for insert with check (
  bucket_id = 'post-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
