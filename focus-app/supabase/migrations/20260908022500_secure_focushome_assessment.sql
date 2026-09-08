begin;

create or replace function public.award_focushome_server(
  p_user_id uuid,
  p_report_id uuid,
  p_assessment_type text,
  p_result jsonb,
  p_classifier_version integer,
  p_eligibility_version integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_report public.focusme_reports%rowtype;
  v_existing_profile
    public.focushome_profiles%rowtype;
  v_previous_period_start date;
  v_assessment_id uuid;
  v_traits text[];
  v_focus_home_key text;
  v_archetype text;
  v_secondary_archetype text;
  v_temporal_expression text;
  v_confidence integer;
  v_score_gap integer;
begin
  v_user_id := p_user_id;

  if v_user_id is null then
    raise exception
      'User identifier required';
  end if;

  if p_assessment_type not in (
    'initial',
    'retest'
  ) then
    raise exception
      'Invalid assessment type';
  end if;

  select *
  into v_report
  from public.focusme_reports
  where id = p_report_id
    and user_id = v_user_id
  for update;

  if not found then
    raise exception
      'FocusMe report not found';
  end if;

  if v_report.report_type <> 'monthly' then
    raise exception
      'FocushoMe requires a monthly report';
  end if;

  if v_report.period_end > current_date then
    raise exception
      'The monthly period is not closed';
  end if;

  if v_report.schema_version < 2 then
    raise exception
      'This report does not contain enough behavioral data';
  end if;

  if
    coalesce(
      (
        v_report.metrics
          -> 'current'
          ->> 'activeDays'
      )::integer,
      0
    ) < 8
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          ->> 'completedSessions'
      )::integer,
      0
    ) < 12
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          ->> 'focusMinutes'
      )::integer,
      0
    ) < 300
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          -> 'tasks'
          ->> 'completed'
      )::integer,
      0
    ) < 6
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          -> 'coverage'
          ->> 'meaningfulActions'
      )::integer,
      0
    ) < 18
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          -> 'coverage'
          ->> 'featureAreasUsed'
      )::integer,
      0
    ) < 2
    or
    coalesce(
      (
        v_report.metrics
          -> 'current'
          -> 'coverage'
          ->> 'activityEvents'
      )::integer,
      0
    ) < 12
  then
    raise exception
      'This report is not eligible for a FocushoMe assessment';
  end if;

  v_focus_home_key :=
    p_result ->> 'focusHome';

  v_archetype :=
    p_result ->> 'archetype';

  v_secondary_archetype :=
    p_result ->> 'secondaryArchetype';

  v_temporal_expression :=
    p_result ->> 'temporalExpression';

  v_confidence :=
    coalesce(
      (
        p_result ->> 'confidence'
      )::integer,
      -1
    );

  v_score_gap :=
    coalesce(
      (
        p_result ->> 'scoreGap'
      )::integer,
      -1
    );

  if v_focus_home_key not in (
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
  ) then
    raise exception
      'Invalid FocushoMe result';
  end if;

  if v_archetype not in (
    'visionary',
    'builder',
    'finisher',
    'executor',
    'organizer',
    'rhythmist',
    'restorer',
    'planner',
    'catalyst',
    'explorer',
    'strategist',
    'guardian'
  ) then
    raise exception
      'Invalid primary archetype';
  end if;

  if v_secondary_archetype not in (
    'visionary',
    'builder',
    'finisher',
    'executor',
    'organizer',
    'rhythmist',
    'restorer',
    'planner',
    'catalyst',
    'explorer',
    'strategist',
    'guardian'
  ) then
    raise exception
      'Invalid secondary archetype';
  end if;

  if v_temporal_expression not in (
    'aurora',
    'solaris',
    'vesper',
    'lunaris',
    'equinox'
  ) then
    raise exception
      'Invalid temporal expression';
  end if;

  if
    v_confidence < 0
    or v_confidence > 100
    or v_score_gap < 0
    or v_score_gap > 100
  then
    raise exception
      'Invalid classification confidence';
  end if;

  select coalesce(
    array_agg(value),
    '{}'::text[]
  )
  into v_traits
  from jsonb_array_elements_text(
    coalesce(
      p_result -> 'traits',
      '[]'::jsonb
    )
  ) as value;

  select *
  into v_existing_profile
  from public.focushome_profiles
  where user_id = v_user_id
  for update;

  if
    p_assessment_type = 'initial'
    and found
  then
    raise exception
      'The user already has a FocushoMe';
  end if;

  if
    p_assessment_type = 'retest'
    and not found
  then
    raise exception
      'A retest requires an existing FocushoMe';
  end if;

  if p_assessment_type = 'retest' then
    select reports.period_start
    into v_previous_period_start
    from public.focushome_assessments assessments
    join public.focusme_reports reports
      on reports.id =
        assessments.report_id
    where assessments.id =
      v_existing_profile
        .current_assessment_id;

    if
      v_previous_period_start is not null
      and v_report.period_start <=
        v_previous_period_start
    then
      raise exception
        'A retest requires a newer monthly report';
    end if;
  end if;

  insert into public.focushome_assessments (
    user_id,
    report_id,
    assessment_type,
    focushome_key,
    archetype,
    secondary_archetype,
    temporal_expression,
    traits,
    confidence,
    score_gap,
    scores,
    evidence,
    classifier_version,
    eligibility_version
  )
  values (
    v_user_id,
    p_report_id,
    p_assessment_type,
    v_focus_home_key,
    v_archetype,
    v_secondary_archetype,
    v_temporal_expression,
    v_traits,
    v_confidence,
    v_score_gap,
    coalesce(
      p_result -> 'scores',
      '[]'::jsonb
    ),
    coalesce(
      p_result -> 'evidence',
      '[]'::jsonb
    ),
    p_classifier_version,
    p_eligibility_version
  )
  returning id
  into v_assessment_id;

  insert into public.focushome_profiles (
    user_id,
    current_assessment_id,
    focushome_key,
    archetype,
    secondary_archetype,
    temporal_expression,
    traits,
    confidence,
    first_awarded_at,
    last_assessed_at,
    updated_at
  )
  values (
    v_user_id,
    v_assessment_id,
    v_focus_home_key,
    v_archetype,
    v_secondary_archetype,
    v_temporal_expression,
    v_traits,
    v_confidence,
    now(),
    now(),
    now()
  )
  on conflict (user_id)
  do update set
    current_assessment_id =
      excluded.current_assessment_id,
    focushome_key =
      excluded.focushome_key,
    archetype =
      excluded.archetype,
    secondary_archetype =
      excluded.secondary_archetype,
    temporal_expression =
      excluded.temporal_expression,
    traits =
      excluded.traits,
    confidence =
      excluded.confidence,
    last_assessed_at =
      now(),
    updated_at =
      now();

  update public.focusme_reports
  set
    focushome_key =
      v_focus_home_key,
    focushome_traits =
      v_traits,
    updated_at =
      now()
  where id = p_report_id
    and user_id = v_user_id;

  return v_assessment_id;
end;
$$;

revoke all
on function public.award_focushome(
  uuid,
  text,
  jsonb,
  integer,
  integer
)
from public, anon, authenticated;

revoke all
on function public.award_focushome_server(
  uuid,
  uuid,
  text,
  jsonb,
  integer,
  integer
)
from public, anon, authenticated;

grant execute
on function public.award_focushome_server(
  uuid,
  uuid,
  text,
  jsonb,
  integer,
  integer
)
to service_role;

comment on function
  public.award_focushome_server(
    uuid,
    uuid,
    text,
    jsonb,
    integer,
    integer
  )
is
  'Persists a server-calculated FocushoMe assessment. Executable only by the service role.';

commit;
