alter table public.tasks
  add column if not exists planned_date date,
  add column if not exists due_at timestamptz,
  add column if not exists daily_order integer,
  add column if not exists daily_priority smallint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_daily_order_check'
  ) then
    alter table public.tasks
      add constraint tasks_daily_order_check
      check (
        daily_order is null
        or daily_order >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_daily_priority_check'
  ) then
    alter table public.tasks
      add constraint tasks_daily_priority_check
      check (
        daily_priority is null
        or daily_priority between 1 and 3
      );
  end if;
end
$$;

create index if not exists
  tasks_user_planned_date_order_idx
on public.tasks (
  user_id,
  planned_date,
  daily_order
)
where deleted_at is null;

create index if not exists
  tasks_user_due_at_idx
on public.tasks (
  user_id,
  due_at
)
where
  deleted_at is null
  and completed = false;

create unique index if not exists
  tasks_daily_priority_unique_idx
on public.tasks (
  user_id,
  planned_date,
  daily_priority
)
where
  deleted_at is null
  and daily_priority is not null;

comment on column public.tasks.planned_date is
  'Day on which the user intends to work on the task.';

comment on column public.tasks.due_at is
  'Actual task deadline, independent from its planned day.';

comment on column public.tasks.daily_order is
  'Task position within the plan for planned_date.';

comment on column public.tasks.daily_priority is
  'Optional daily priority position from 1 to 3.';
