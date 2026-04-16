begin;

create or replace function public.get_rankings_competitive(
  p_top_limit integer default 5,
  p_window integer default 2
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_top_limit integer := greatest(3, least(coalesce(p_top_limit, 5), 10));
  v_window integer := greatest(1, least(coalesce(p_window, 2), 4));
  v_total integer := 0;
  v_user_rank integer := null;
  v_user_score integer := null;
  v_user_name text := null;
  v_user_skin text := null;
  v_next_better_rank integer := null;
  v_next_better_score integer := null;
  v_next_better_name text := null;
  v_to_next integer := null;
  v_top_cutoff integer := null;
  v_to_top integer := null;
  v_percentile numeric := null;
  v_top jsonb := '[]'::jsonb;
  v_around jsonb := '[]'::jsonb;
begin
  v_uid := auth.uid();

  with ranked as (
    select
      r.user_id,
      r.name,
      r.score,
      r.skin,
      row_number() over(order by r.score desc, r.user_id asc) as pos
    from public.rankings r
    where r.score is not null
  )
  select count(*) into v_total from ranked;

  with ranked as (
    select
      r.user_id,
      r.name,
      r.score,
      r.skin,
      row_number() over(order by r.score desc, r.user_id asc) as pos
    from public.rankings r
    where r.score is not null
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank', pos,
    'user_id', user_id,
    'name', name,
    'score', score,
    'skin', skin
  ) order by pos), '[]'::jsonb)
  into v_top
  from ranked
  where pos <= v_top_limit;

  if v_total >= v_top_limit then
    with ranked as (
      select
        r.user_id,
        r.name,
        r.score,
        r.skin,
        row_number() over(order by r.score desc, r.user_id asc) as pos
      from public.rankings r
      where r.score is not null
    )
    select score into v_top_cutoff
    from ranked
    where pos = v_top_limit;
  end if;

  if v_uid is not null then
    with ranked as (
      select
        r.user_id,
        r.name,
        r.score,
        r.skin,
        row_number() over(order by r.score desc, r.user_id asc) as pos
      from public.rankings r
      where r.score is not null
    )
    select pos, score, name, skin
      into v_user_rank, v_user_score, v_user_name, v_user_skin
    from ranked
    where user_id = v_uid
    limit 1;

    if v_user_rank is not null then
      with ranked as (
        select
          r.user_id,
          r.name,
          r.score,
          r.skin,
          row_number() over(order by r.score desc, r.user_id asc) as pos
        from public.rankings r
        where r.score is not null
      )
      select coalesce(jsonb_agg(jsonb_build_object(
        'rank', pos,
        'user_id', user_id,
        'name', name,
        'score', score,
        'skin', skin
      ) order by pos), '[]'::jsonb)
      into v_around
      from ranked
      where pos between greatest(1, v_user_rank - v_window) and least(v_total, v_user_rank + v_window);

      with ranked as (
        select
          r.user_id,
          r.name,
          r.score,
          r.skin,
          row_number() over(order by r.score desc, r.user_id asc) as pos
        from public.rankings r
        where r.score is not null
      )
      select pos, score, name
        into v_next_better_rank, v_next_better_score, v_next_better_name
      from ranked
      where pos = v_user_rank - 1
      limit 1;

      if v_next_better_score is not null then
        v_to_next := greatest(0, v_next_better_score - coalesce(v_user_score, 0) + 1);
      end if;

      if v_top_cutoff is not null and v_user_rank > v_top_limit then
        v_to_top := greatest(0, v_top_cutoff - coalesce(v_user_score, 0) + 1);
      else
        v_to_top := 0;
      end if;

      if v_total > 0 then
        v_percentile := round((100.0 * (v_total - v_user_rank + 1) / v_total)::numeric, 1);
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'top', v_top,
    'around_me', v_around,
    'summary', jsonb_build_object(
      'total_players', coalesce(v_total, 0),
      'user_rank', v_user_rank,
      'user_score', v_user_score,
      'user_name', v_user_name,
      'user_skin', v_user_skin,
      'percentile', v_percentile,
      'next_better_rank', v_next_better_rank,
      'next_better_score', v_next_better_score,
      'next_better_name', v_next_better_name,
      'points_to_next', v_to_next,
      'points_to_top', v_to_top,
      'top_cutoff_score', v_top_cutoff,
      'top_limit', v_top_limit,
      'window', v_window
    )
  );
end;
$$;

revoke all on function public.get_rankings_competitive(integer, integer) from public;
grant execute on function public.get_rankings_competitive(integer, integer) to anon, authenticated;

commit;
