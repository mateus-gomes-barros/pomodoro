create table if not exists public.focus_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  template_key text,
  icon text not null default 'timer',
  color text not null default '#34d399',
  work_duration integer not null default 25,
  short_break_duration integer not null default 5,
  long_break_duration integer not null default 15,
  sessions_until_long_break smallint not null default 4,
  default_project_id uuid references public.projects(id) on delete set null,
  sound_enabled boolean not null default true,
  auto_start_breaks boolean not null default false,
  auto_start_work boolean not null default false,
  do_not_disturb boolean not null default false,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint focus_routines_name_check
    check (char_length(btrim(name)) between 1 and 60),
  constraint focus_routines_template_key_check
    check (
      template_key is null
      or template_key in ('work', 'study', 'reading')
    ),
  constraint focus_routines_work_duration_check
    check (work_duration between 1 and 180),
  constraint focus_routines_short_break_duration_check
    check (short_break_duration between 1 and 60),
  constraint focus_routines_long_break_duration_check
    check (long_break_duration between 1 and 60),
  constraint focus_routines_sessions_check
    check (sessions_until_long_break between 1 and 12),
  constraint focus_routines_sort_order_check
    check (sort_order >= 0)
);

alter table public.focus_routines
  add constraint focus_routines_user_template_key_key
  unique (user_id, template_key);

create unique index if not exists
  focus_routines_one_default_per_user_idx
on public.focus_routines (user_id)
where is_default = true;

create index if not exists
  focus_routines_user_sort_order_idx
on public.focus_routines (user_id, sort_order, created_at);

alter table public.focus_routines enable row level security;

drop policy if exists
  "Users can read their focus routines"
on public.focus_routines;

create policy
  "Users can read their focus routines"
on public.focus_routines
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists
  "Users can create their focus routines"
on public.focus_routines;

create policy
  "Users can create their focus routines"
on public.focus_routines
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    default_project_id is null
    or exists (
      select 1
      from public.projects
      where projects.id = default_project_id
        and projects.user_id = (select auth.uid())
    )
  )
);

drop policy if exists
  "Users can update their focus routines"
on public.focus_routines;

create policy
  "Users can update their focus routines"
on public.focus_routines
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    default_project_id is null
    or exists (
      select 1
      from public.projects
      where projects.id = default_project_id
        and projects.user_id = (select auth.uid())
    )
  )
);

drop policy if exists
  "Users can delete their focus routines"
on public.focus_routines;

create policy
  "Users can delete their focus routines"
on public.focus_routines
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete
on public.focus_routines
to authenticated;

comment on table public.focus_routines is
  'Reusable per-user timer configurations for Focus routines.';

comment on column public.focus_routines.template_key is
  'Stable key for built-in routines. Null identifies a custom routine.';

comment on column public.focus_routines.do_not_disturb is
  'User preference applied by supported native platforms when the routine starts.';
