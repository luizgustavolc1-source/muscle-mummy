-- Muscle Mummy: private coach MVP
-- Run this file in Supabase SQL Editor before using check-ins and photos.

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  weight numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

alter table public.checkins enable row level security;
alter table public.client_photos enable row level security;

drop policy if exists "Coach manages own client checkins" on public.checkins;
create policy "Coach manages own client checkins"
on public.checkins for all to authenticated
using (
  exists (
    select 1 from public.clients
    where clients.id = checkins.client_id
      and clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clients
    where clients.id = checkins.client_id
      and clients.user_id = auth.uid()
  )
);

drop policy if exists "Coach manages own client photos" on public.client_photos;
create policy "Coach manages own client photos"
on public.client_photos for all to authenticated
using (
  exists (
    select 1 from public.clients
    where clients.id = client_photos.client_id
      and clients.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clients
    where clients.id = client_photos.client_id
      and clients.user_id = auth.uid()
  )
);
