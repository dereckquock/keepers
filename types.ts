export type DraftPick = {
  draft_id: string;
  draft_slot: number;
  is_keeper: null;
  metadata: {
    amount: null | string;
    first_name: string;
    injury_status: string;
    last_name: string;
    news_updated: string;
    number: string;
    player_id: string;
    position: string;
    sport: string;
    status: string;
    team: string;
    years_exp: string;
  };
  pick_no: number;
  picked_by: string;
  player_id: string;
  roster_id: string;
  round: number;
};

export type DraftResults = {
  created: number;
  creators: null;
  draft_id: string;
  draft_order: null;
  last_message_id: string;
  last_message_time: number;
  last_picked: number;
  league_id: string;
  metadata: {
    description: string;
    name: string;
    scoring_type: string;
  };
  season: string;
  season_type: string;
  settings: DraftSettings;
  sport: string;
  start_time: number;
  status: string;
  type: string;
};

export type DraftSettings = {
  pick_timer: number;
  rounds: number;
  slots_bn: number;
  slots_def: number;
  slots_flex: number;
  slots_k: number;
  slots_qb: number;
  slots_rb: number;
  slots_te: number;
  slots_wr: number;
  teams: number;
};

export type League = {
  avatar?: null | string;
  name: string;
};

export type Matchup = {
  custom_points: null;
  matchup_id: number;
  players: string[];
  players_points: Record<number | string, number>;
  points: number;
  roster_id: number | string;
  starters: string[];
  starters_points: number[];
};

export type Player = {
  age: number;
  birth_country: string;
  college: string;
  depth_chart_order: number;
  depth_chart_position: number;
  espn_id: string;
  fantasy_data_id: number;
  fantasy_positions: string[];
  first_name: string;
  hashtag: string;
  height: string;
  injury_start_date: null;
  injury_status: null;
  last_name: string;
  number: number;
  player_id: string;
  position: string;
  practice_participation: null;
  rotowire_id: null;
  rotoworld_id: number;
  search_first_name: string;
  search_full_name: string;
  search_last_name: string;
  search_rank: number;
  sport: string;
  sportradar_id: string;
  stats_id: string;
  status: string;
  team: string;
  weight: string;
  yahoo_id: null;
  years_exp: number;
};

export type Roster = {
  co_owners: null;
  keepers: string[];
  league_id: string;
  metadata: {
    p_nick_2374: string;
    p_nick_7600: string;
    record: string;
    streak: string;
  };
  owner_id: string;
  player_map: null;
  players: string[];
  reserve: null;
  roster_id: number;
  settings: RosterSettings;
  starters: string[];
  taxi: null;
};

export type RosterSettings = {
  fpts: number;
  fpts_against: number;
  fpts_against_decimal: number;
  fpts_decimal: number;
  losses: number;
  ppts: number;
  ppts_decimal: number;
  ties: number;
  total_moves: number;
  waiver_budget_used: number;
  waiver_position: number;
  wins: number;
};

export type User = {
  avatar: string;
  display_name: string;
  is_owner: boolean;
  league_id: string;
  metadata: { team_name: string };
  user_id: string;
};
