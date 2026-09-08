begin;

alter table public.focusme_reports
  drop constraint if exists
    focusme_reports_id_user_unique;

alter table public.focusme_reports
  add constraint
    focusme_reports_id_user_unique
  unique (
    id,
    user_id
  );

create table if not exists
  public.focusme_report_narratives (
    id uuid primary key
      default gen_random_uuid(),

    report_id uuid not null,
    user_id uuid not null,

    locale text not null,
    status text not null
      default 'pending',

    narrative text,

    provider text,
    model text,
    prompt_version integer not null
      default 1,
    facts_hash text,

    error_code text,

    generated_at timestamptz,
    created_at timestamptz not null
      default now(),
    updated_at timestamptz not null
      default now(),

    constraint
      focusme_report_narratives_report_fk
      foreign key (
        report_id,
        user_id
      )
      references public.focusme_reports (
        id,
        user_id
      )
      on delete cascade,

    constraint
      focusme_report_narratives_user_fk
      foreign key (
        user_id
      )
      references auth.users (
        id
      )
      on delete cascade,

    constraint
      focusme_report_narratives_locale_check
      check (
        locale in (
          'pt-BR',
          'en-US'
        )
      ),

    constraint
      focusme_report_narratives_status_check
      check (
        status in (
          'pending',
          'ready',
          'failed'
        )
      ),

    constraint
      focusme_report_narratives_content_check
      check (
        (
          status = 'ready'
          and narrative is not null
          and char_length(narrative)
            between 100 and 5000
          and provider is not null
          and model is not null
          and facts_hash is not null
          and generated_at is not null
        )
        or
        (
          status in (
            'pending',
            'failed'
          )
          and narrative is null
        )
      ),

    constraint
      focusme_report_narratives_unique
      unique (
        user_id,
        report_id,
        locale
      )
  );

alter table
  public.focusme_report_narratives
enable row level security;

drop policy if exists
  "Users can read their FocusMe narratives"
on public.focusme_report_narratives;

create policy
  "Users can read their FocusMe narratives"
on public.focusme_report_narratives
for select
to authenticated
using (
  auth.uid() = user_id
);

revoke insert, update, delete
on public.focusme_report_narratives
from authenticated;

create index if not exists
  focusme_narratives_user_locale_idx
on public.focusme_report_narratives (
  user_id,
  locale,
  generated_at desc
);

create index if not exists
  focusme_narratives_report_idx
on public.focusme_report_narratives (
  report_id
);

commit;
