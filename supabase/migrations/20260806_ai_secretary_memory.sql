-- Muscle Mummy AI Secretary: private, persistent conversation memory.

create table if not exists public.ai_secretary_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 12000),
  created_at timestamptz not null default now()
);

create index if not exists ai_secretary_messages_user_created_at_idx
  on public.ai_secretary_messages (user_id, created_at);

alter table public.ai_secretary_messages enable row level security;

drop policy if exists "Users manage their AI Secretary conversation" on public.ai_secretary_messages;
create policy "Users manage their AI Secretary conversation"
on public.ai_secretary_messages
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
