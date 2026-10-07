-- Run once with the Supabase SQL editor or `supabase db push`.
-- Supabase supplies auth.users, auth.uid(), auth.jwt(), and the authenticated role.
-- Application requests use the public key + learner JWT, never a service-role key.
begin;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  email text not null check (length(email) between 3 and 254),
  current_band numeric(2,1) check (current_band between 0 and 9 and mod(current_band, 0.5) = 0),
  target_band numeric(2,1) not null default 7 check (target_band between 3 and 7 and mod(target_band, 0.5) = 0),
  cefr text check (cefr in ('A2', 'B1', 'B2', 'C1')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learner_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_json jsonb not null check (jsonb_typeof(state_json) = 'object'),
  updated_at timestamptz not null default now()
);

create table public.test_history (
  id text not null check (length(id) between 1 and 200),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_type text not null check (skill_type in ('listening', 'reading', 'writing', 'speaking', 'placement')),
  score numeric(2,1) check (score between 0 and 9 and mod(score, 0.5) = 0),
  ai_feedback_json jsonb not null check (jsonb_typeof(ai_feedback_json) = 'object'),
  "timestamp" timestamptz not null,
  title text not null check (length(title) <= 500),
  source text not null check (source in ('sample', 'ai')),
  primary key (user_id, id)
);

create table public.fsrs_cards (
  id text not null check (length(id) between 1 and 200),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null check (length(front) between 1 and 500),
  back text not null check (length(back) <= 2000),
  example text not null default '' check (length(example) <= 5000),
  cefr text not null check (cefr in ('A2', 'B1', 'B2', 'C1')),
  -- New cards have difficulty/stability 0 until the first FSRS review.
  difficulty double precision not null check (difficulty between 0 and 10),
  stability double precision not null check (stability >= 0 and stability < 'Infinity'::double precision),
  retrievability double precision not null check (retrievability between 0 and 1),
  due_date timestamptz not null,
  reps integer not null check (reps >= 0),
  scheduler_json jsonb not null check (jsonb_typeof(scheduler_json) = 'object'),
  reviews_json jsonb not null default '[]' check (jsonb_typeof(reviews_json) = 'array'),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index test_history_learner_time on public.test_history(user_id, "timestamp" desc);
create index test_history_learner_skill on public.test_history(user_id, skill_type, "timestamp" desc);
create index fsrs_cards_learner_due on public.fsrs_cards(user_id, due_date);

alter table public.user_profiles enable row level security;
alter table public.user_profiles force row level security;
alter table public.learner_state enable row level security;
alter table public.learner_state force row level security;
alter table public.test_history enable row level security;
alter table public.test_history force row level security;
alter table public.fsrs_cards enable row level security;
alter table public.fsrs_cards force row level security;

create policy user_profiles_owner on public.user_profiles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy learner_state_owner on public.learner_state for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy test_history_owner on public.test_history for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy fsrs_cards_owner on public.fsrs_cards for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.user_profiles, public.learner_state, public.test_history, public.fsrs_cards from public, anon;
grant select, insert, update, delete on public.user_profiles, public.learner_state, public.test_history, public.fsrs_cards to authenticated;

-- Serialize registrations at the database so concurrent signups cannot exceed 2.
-- This private installation intentionally limits all Supabase Auth accounts to 2.
-- Configure email confirmations and registration/invitations in Supabase Auth too.
create function public.enforce_ielts_account_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  learner_name text;
  target numeric;
begin
  perform pg_advisory_xact_lock(743421907126001::bigint);
  if (select count(*) from auth.users) >= 2 then
    raise exception 'IELTS_ACCOUNT_LIMIT: this private group supports two learners' using errcode = 'P0001';
  end if;
  learner_name := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
  if learner_name is null or length(learner_name) not between 1 and 80 or new.email is null or length(new.email) not between 3 and 254 then
    raise exception 'Invalid learner metadata' using errcode = '22023';
  end if;
  if new.raw_user_meta_data ? 'target_band' and jsonb_typeof(new.raw_user_meta_data -> 'target_band') is distinct from 'number' then
    raise exception 'Invalid target band metadata' using errcode = '22023';
  end if;
  target := coalesce((new.raw_user_meta_data ->> 'target_band')::numeric, 7);
  if target < 3 or target > 7 or mod(target, 0.5) <> 0 then
    raise exception 'Target band must be 3.0 to 7.0 in half-band steps' using errcode = '22023';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_ielts_account_limit() from public, anon, authenticated;
create trigger ielts_account_limit before insert on auth.users
  for each row execute function public.enforce_ielts_account_limit();

create function public.create_ielts_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles (user_id, name, email, target_band, created_at)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)), new.email,
    coalesce((new.raw_user_meta_data ->> 'target_band')::numeric, 7), coalesce(new.created_at, now()));
  return new;
end;
$$;
revoke all on function public.create_ielts_profile() from public, anon, authenticated;
create trigger ielts_profile_created after insert on auth.users
  for each row execute function public.create_ielts_profile();

-- One transaction persists the resumable application state and its queryable mirrors.
-- SECURITY INVOKER deliberately preserves the caller's RLS restrictions.
create function public.save_learner_state(state jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  learner_id uuid := auth.uid();
  profile jsonb := state -> 'profile';
  item jsonb;
  schedule jsonb;
begin
  if learner_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(state) is distinct from 'object' or pg_column_size(state) > 8000000
    or jsonb_typeof(profile) is distinct from 'object' then
    raise exception 'Invalid learner state' using errcode = '22023';
  end if;
  if profile ->> 'id' is distinct from learner_id::text then
    raise exception 'Learner identity mismatch' using errcode = '42501';
  end if;
  if lower(profile ->> 'email') is distinct from lower(auth.jwt() ->> 'email') then
    raise exception 'Learner email mismatch' using errcode = '22023';
  end if;
  if jsonb_typeof(state -> 'history') is distinct from 'array'
    or jsonb_typeof(state -> 'cards') is distinct from 'array'
    or jsonb_typeof(state -> 'exercises') is distinct from 'array'
    or jsonb_typeof(state -> 'placements') is distinct from 'array' then
    raise exception 'Learner collections must be arrays' using errcode = '22023';
  end if;
  if jsonb_array_length(state -> 'history') > 10000 or jsonb_array_length(state -> 'cards') > 10000
    or jsonb_array_length(state -> 'exercises') > 500 or jsonb_array_length(state -> 'placements') > 500 then
    raise exception 'Learner collections exceed limits' using errcode = '22023';
  end if;
  if (select count(distinct value ->> 'id') from jsonb_array_elements(state -> 'history')) <> jsonb_array_length(state -> 'history')
    or (select count(distinct value ->> 'id') from jsonb_array_elements(state -> 'cards')) <> jsonb_array_length(state -> 'cards') then
    raise exception 'Collection identifiers must be present and unique' using errcode = '22023';
  end if;

  insert into public.user_profiles (user_id, name, email, current_band, target_band, cefr, created_at, updated_at)
  values (learner_id, profile ->> 'name', profile ->> 'email', (profile ->> 'currentBand')::numeric,
    (profile ->> 'targetBand')::numeric, profile ->> 'cefr', (profile ->> 'createdAt')::timestamptz, now())
  on conflict (user_id) do update set name = excluded.name, email = excluded.email,
    current_band = excluded.current_band, target_band = excluded.target_band, cefr = excluded.cefr, updated_at = now();

  insert into public.learner_state (user_id, state_json, updated_at)
  values (learner_id, state, now())
  on conflict (user_id) do update set state_json = excluded.state_json, updated_at = now();

  for item in select value from jsonb_array_elements(state -> 'history') loop
    insert into public.test_history (id, user_id, skill_type, score, ai_feedback_json, "timestamp", title, source)
    values (item ->> 'id', learner_id, item ->> 'skill', (item ->> 'score')::numeric,
      item -> 'feedback', (item ->> 'createdAt')::timestamptz, item ->> 'title', item ->> 'source')
    on conflict (user_id, id) do update set skill_type = excluded.skill_type, score = excluded.score,
      ai_feedback_json = excluded.ai_feedback_json, "timestamp" = excluded."timestamp", title = excluded.title, source = excluded.source;
  end loop;
  delete from public.test_history where user_id = learner_id
    and id not in (select value ->> 'id' from jsonb_array_elements(state -> 'history'));

  for item in select value from jsonb_array_elements(state -> 'cards') loop
    schedule := (item ->> 'scheduler')::jsonb;
    if jsonb_typeof(schedule) is distinct from 'object' or jsonb_typeof(item -> 'reviews') is distinct from 'array' then
      raise exception 'Invalid FSRS data' using errcode = '22023';
    end if;
    insert into public.fsrs_cards (id, user_id, front, back, example, cefr, difficulty, stability,
      retrievability, due_date, reps, scheduler_json, reviews_json, updated_at)
    values (item ->> 'id', learner_id, item ->> 'front', item ->> 'back', item ->> 'example', item ->> 'cefr',
      (schedule ->> 'difficulty')::double precision, (schedule ->> 'stability')::double precision,
      (item ->> 'retrievability')::double precision, (schedule ->> 'due')::timestamptz,
      (schedule ->> 'reps')::integer, schedule, item -> 'reviews', now())
    on conflict (user_id, id) do update set front = excluded.front, back = excluded.back, example = excluded.example,
      cefr = excluded.cefr, difficulty = excluded.difficulty, stability = excluded.stability,
      retrievability = excluded.retrievability, due_date = excluded.due_date, reps = excluded.reps,
      scheduler_json = excluded.scheduler_json, reviews_json = excluded.reviews_json, updated_at = now();
  end loop;
  delete from public.fsrs_cards where user_id = learner_id
    and id not in (select value ->> 'id' from jsonb_array_elements(state -> 'cards'));
end;
$$;
revoke all on function public.save_learner_state(jsonb) from public, anon;
grant execute on function public.save_learner_state(jsonb) to authenticated;

alter table public.user_profiles replica identity full;
alter table public.test_history replica identity full;
alter table public.fsrs_cards replica identity full;

-- Optional: enable Realtime for these tables in the Supabase dashboard.
-- If not already published, an administrator can run:
-- alter publication supabase_realtime add table public.user_profiles, public.test_history, public.fsrs_cards;
-- learner_state contains full exercise answer keys; do not publish it.

commit;
