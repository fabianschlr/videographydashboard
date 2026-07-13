create type task_priority as enum ('A', 'B', 'C');
create type task_status as enum ('open', 'in_progress', 'done', 'skipped');
create type session_fail_reason as enum ('handy', 'youtube', 'gruebeln', 'perfektionismus', 'muedigkeit', 'unterbrochen', 'keine_ahnung');
create type milestone_type as enum ('erste_mail', 'erste_antwort', 'erstes_telefonat', 'erstes_angebot', 'erster_kunde', 'umsatz_500', 'umsatz_1000', 'umsatz_5000', 'custom');

create table public.tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, priority_tier task_priority not null default 'B', deadline date, estimated_minutes integer not null check (estimated_minutes > 0), status task_status not null default 'open', created_at timestamptz not null default now(), completed_at timestamptz);
create table public.shifts (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, date date not null, start_time time not null, end_time time not null, shift_type text not null);
create table public.sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, task_id uuid references public.tasks(id) on delete set null, planned_minutes integer not null, actual_minutes integer, completed boolean not null default false, fail_reason session_fail_reason, started_at timestamptz not null default now(), ended_at timestamptz);
create table public.weekly_reviews (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, week_start_date date not null, answers jsonb not null, ai_analysis text, created_at timestamptz not null default now());
create table public.decisions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, reasoning text, fear text, review_date date, status text not null default 'active', created_at timestamptz not null default now());
create table public.milestones (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, type milestone_type not null, achieved_at timestamptz, note text);
create table public.brain_dumps (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, content text not null, created_at timestamptz not null default now(), processed boolean not null default false);
create table public.coach_context (id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade, summary_text text not null check (char_length(summary_text) <= 1200), updated_at timestamptz not null default now());
create table public.settings (user_id uuid primary key references auth.users(id) on delete cascade, energy_default text not null default 'mittel', accent_color text not null default '#6f9ed8', theme text not null default 'dark', working_hours_per_week integer not null default 20);

alter table public.tasks enable row level security; alter table public.shifts enable row level security; alter table public.sessions enable row level security; alter table public.weekly_reviews enable row level security; alter table public.decisions enable row level security; alter table public.milestones enable row level security; alter table public.brain_dumps enable row level security; alter table public.coach_context enable row level security; alter table public.settings enable row level security;
create policy "own rows" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.shifts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.weekly_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.decisions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.brain_dumps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.coach_context for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
