begin;

create table if not exists public.focusme_reports (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  report_type text not null,
  period_start date not null,
  period_end date not null,

  metrics jsonb not null,
  schema_version integer not null
    default 1,

  narrative text,
  narrative_locale text,

  focushome_key text,
  focushome_traits text[] not null
    default '{}',

  generated_at timestamptz not null
    default now(),
  updated_at timestamptz not null
    default now(),

  constraint focusme_reports_type_check
    check (
      report_type in (
        'weekly',
        'monthly'
      )
    ),

  constraint focusme_reports_period_check
    check (
      period_end > period_start
    ),

  constraint focusme_reports_narrative_check
    check (
      (
        narrative is null
        and narrative_locale is null
      )
      or
      (
        narrative is not null
        and narrative_locale is not null
      )
    ),

  constraint focusme_reports_unique_period
    unique (
      user_id,
      report_type,
      period_start,
      period_end
    )
);

alter table public.focusme_reports
  enable row level security;

drop policy if exists
  "Users can read their FocusMe reports"
on public.focusme_reports;

create policy
  "Users can read their FocusMe reports"
on public.focusme_reports
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists
  "Users can create their FocusMe reports"
on public.focusme_reports;

create policy
  "Users can create their FocusMe reports"
on public.focusme_reports
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists
  "Users can update their FocusMe reports"
on public.focusme_reports;

create policy
  "Users can update their FocusMe reports"
on public.focusme_reports
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create index if not exists
  focusme_reports_user_period_idx
on public.focusme_reports (
  user_id,
  period_start desc
);

create index if not exists
  focusme_reports_user_type_idx
on public.focusme_reports (
  user_id,
  report_type,
  period_start desc
);

commit;
