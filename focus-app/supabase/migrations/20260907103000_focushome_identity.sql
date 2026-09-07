begin;

create table if not exists public.focushome_assessments (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  report_id uuid not null
    references public.focusme_reports(id)
    on delete restrict,

  assessment_type text not null,

  focushome_key text not null,
  archetype text not null,
  secondary_archetype text not null,
  temporal_expression text not null,

  traits text[] not null
    default '{}',

  confidence smallint not null,
  score_gap smallint not null,

  scores jsonb not null,
  evidence jsonb not null,

  classifier_version integer not null,
  eligibility_version integer not null,

  created_at timestamptz not null
    default now(),

  constraint focushome_assessments_type_check
    check (
      assessment_type in (
        'initial',
        'retest'
      )
    ),

  constraint focushome_assessments_key_check
    check (
      focushome_key in (
        'aster',
        'atlas',
        'forge',
        'pulse',
        'loom',
        'orbit',
        'tide',
        'ember',
        'nova',
        'prism',
        'vanguard',
        'verdant'
      )
    ),

  constraint focushome_assessments_temporal_check
    check (
      temporal_expression in (
        'aurora',
        'solaris',
        'vesper',
        'lunaris',
        'equinox'
      )
    ),

  constraint focushome_assessments_confidence_check
    check (
      confidence between 0 and 100
    ),

  constraint focushome_assessments_gap_check
    check (
      score_gap between 0 and 100
    ),

  constraint focushome_assessments_unique_report
    unique (
      user_id,
      report_id
    )
);

create table if not exists public.focushome_profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  current_assessment_id uuid not null
    references public.focushome_assessments(id)
    on delete restrict,

  focushome_key text not null,
  archetype text not null,
  secondary_archetype text not null,
  temporal_expression text not null,

  traits text[] not null
    default '{}',

  confidence smallint not null,

  first_awarded_at timestamptz not null
    default now(),
  last_assessed_at timestamptz not null
    default now(),
  updated_at timestamptz not null
    default now(),

  constraint focushome_profiles_key_check
    check (
      focushome_key in (
        'aster',
        'atlas',
        'forge',
        'pulse',
        'loom',
        'orbit',
        'tide',
        'ember',
        'nova',
        'prism',
        'vanguard',
        'verdant'
      )
    ),

  constraint focushome_profiles_temporal_check
    check (
      temporal_expression in (
        'aurora',
        'solaris',
        'vesper',
        'lunaris',
        'equinox'
      )
    ),

  constraint focushome_profiles_confidence_check
    check (
      confidence between 0 and 100
    )
);

alter table public.focushome_assessments
  enable row level security;

alter table public.focushome_profiles
  enable row level security;

drop policy if exists
  "Users can read their FocushoMe assessments"
on public.focushome_assessments;

create policy
  "Users can read their FocushoMe assessments"
on public.focushome_assessments
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists
  "Users can create their FocushoMe assessments"
on public.focushome_assessments;

create policy
  "Users can create their FocushoMe assessments"
on public.focushome_assessments
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists
  "Users can read their FocushoMe profile"
on public.focushome_profiles;

create policy
  "Users can read their FocushoMe profile"
on public.focushome_profiles
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists
  "Users can create their FocushoMe profile"
on public.focushome_profiles;

create policy
  "Users can create their FocushoMe profile"
on public.focushome_profiles
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists
  "Users can update their FocushoMe profile"
on public.focushome_profiles;

create policy
  "Users can update their FocushoMe profile"
on public.focushome_profiles
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create index if not exists
  focushome_assessments_user_date_idx
on public.focushome_assessments (
  user_id,
  created_at desc
);

create index if not exists
  focushome_assessments_report_idx
on public.focushome_assessments (
  report_id
);

commit;
