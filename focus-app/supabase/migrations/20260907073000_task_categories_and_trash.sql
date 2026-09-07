begin;

alter table public.tasks
  add column if not exists category text;

update public.tasks
set category = 'planned'
where category is null;

alter table public.tasks
  alter column category set default 'planned',
  alter column category set not null;

alter table public.tasks
  add column if not exists deleted_at timestamptz;

alter table public.tasks
  add column if not exists scheduled_deletion_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_category_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_category_check
      check (
        category in (
          'quick',
          'planned',
          'urgent',
          'long_term'
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
    where conname = 'tasks_deletion_dates_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_deletion_dates_check
      check (
        (
          deleted_at is null
          and scheduled_deletion_at is null
        )
        or
        (
          deleted_at is not null
          and scheduled_deletion_at is not null
          and scheduled_deletion_at >= deleted_at
        )
      );
  end if;
end
$$;

create index if not exists
  tasks_active_user_order_idx
on public.tasks (
  user_id,
  task_order
)
where deleted_at is null;

create index if not exists
  tasks_deleted_user_date_idx
on public.tasks (
  user_id,
  deleted_at desc
)
where deleted_at is not null;

create index if not exists
  tasks_scheduled_deletion_idx
on public.tasks (
  scheduled_deletion_at
)
where scheduled_deletion_at is not null;

commit;
