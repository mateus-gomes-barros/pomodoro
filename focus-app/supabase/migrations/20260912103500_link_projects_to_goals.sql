alter table public.projects
  add column if not exists goal_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_goal_id_fkey'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_goal_id_fkey
      foreign key (goal_id)
      references public.goals(id)
      on delete set null;
  end if;
end
$$;

create index if not exists
  projects_user_goal_id_idx
on public.projects (
  user_id,
  goal_id
)
where goal_id is not null;

create index if not exists
  projects_goal_id_idx
on public.projects (goal_id)
where goal_id is not null;

comment on column public.projects.goal_id is
  'Optional annual goal advanced by this project.';
