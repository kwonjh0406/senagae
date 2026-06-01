create extension if not exists pgcrypto;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 24),
  title text not null check (char_length(title) between 2 and 80),
  content text not null check (char_length(content) between 5 and 2000),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  content text not null check (char_length(content) between 2 and 700),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts(created_at desc);

create index if not exists community_comments_post_id_created_at_idx
  on public.community_comments(post_id, created_at asc);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

drop policy if exists "Anyone can read community posts" on public.community_posts;
create policy "Anyone can read community posts"
  on public.community_posts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can read community comments" on public.community_comments;
create policy "Anyone can read community comments"
  on public.community_comments
  for select
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select on public.community_posts to anon, authenticated;
grant select on public.community_comments to anon, authenticated;
