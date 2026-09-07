begin;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  event_type text not null,
  entity_type text not null,
  entity_id uuid,

  occurred_at timestamptz not null default now(),
  local_date date not null,
  local_hour smallint not null,
  local_weekday smallint not null,
  timezone text not null,
  utc_offset_minutes smallint not null,
  platform text not null,

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint activity_events_entity_type_check
    check (
      entity_type in (
        'task',
        'project',
        'goal',
        'pomodoro'
      )
    ),

  constraint activity_events_local_hour_check
    check (local_hour between 0 and 23),

  constraint activity_events_local_weekday_check
    check (local_weekday between 0 and 6),

  constraint activity_events_utc_offset_check
    check (
      utc_offset_minutes between -840 and 840
    ),

  constraint activity_events_platform_check
    check (
      platform in (
        'web',
        'ios',
        'android'
      )
    )
);

alter table public.activity_events
  enable row level security;

drop policy if exists
  "Users can read their activity events"
on public.activity_events;

create policy
  "Users can read their activity events"
on public.activity_events
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists
  "Users can create their activity events"
on public.activity_events;

create policy
  "Users can create their activity events"
on public.activity_events
for insert
to authenticated
with check (
  auth.uid() = user_id
);

create index if not exists
  activity_events_user_occurred_idx
on public.activity_events (
  user_id,
  occurred_at desc
);

create index if not exists
  activity_events_user_local_date_idx
on public.activity_events (
  user_id,
  local_date desc
);

create index if not exists
  activity_events_user_type_idx
on public.activity_events (
  user_id,
  event_type,
  occurred_at desc
);

commit;
