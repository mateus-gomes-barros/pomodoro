begin;

alter table public.projects
  add column if not exists status text;

update public.projects
set status = 'active'
where status is null;

alter table public.projects
  alter column status set default 'active',
  alter column status set not null;

alter table public.projects
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_status_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_status_check
      check (
        status in (
          'active',
          'completed'
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_completion_state_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_completion_state_check
      check (
        (
          status = 'active'
          and completed_at is null
        )
        or
        (
          status = 'completed'
          and completed_at is not null
        )
      );
  end if;
end
$$;

create index if not exists
  projects_user_status_created_idx
on public.projects (
  user_id,
  status,
  created_at
);

create index if not exists
  projects_user_completed_at_idx
on public.projects (
  user_id,
  completed_at desc
)
where completed_at is not null;

commit;
