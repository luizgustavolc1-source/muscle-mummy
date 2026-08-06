-- Muscle Mummy: private history for AI-generated workouts and nutrition plans.

create table if not exists public.ai_client_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_type text not null check (plan_type in ('workout', 'nutrition')),
  adjustments jsonb not null default '[]'::jsonb,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_client_plans_client_created_at_idx
  on public.ai_client_plans (client_id, created_at desc);

alter table public.ai_client_plans enable row level security;

drop policy if exists "Coach manages own AI client plans" on public.ai_client_plans;
create policy "Coach manages own AI client plans"
on public.ai_client_plans
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
