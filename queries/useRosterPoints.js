import { useQuery } from 'react-query';

async function fetchScores({ leagueId, weekNumber, rosters }) {
  const users = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`
  ).then((res) => res.json());

  const matchups = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`
  ).then((res) => res.json());

  const results = matchups.map((roster) => {
    const { roster_id, players_points, points } = roster;
    const userId = rosters.find((r) => r.roster_id === roster_id)?.owner_id;
    const { avatar, display_name } =
      users.find((user) => user.user_id === userId) || {};
    const fullRosterPoints = Object.values(players_points).reduce(
      (total, points) => total + points,
      0
    );

    // sum the bench players' points
    const benchPoints = fullRosterPoints - points;

    return {
      avatar: `https://sleepercdn.com/avatars/thumbs/${avatar}`,
      displayName: display_name,
      points,
      benchPoints: Math.round(100 * benchPoints) / 100,
    };
  });

  return {
    starters: [...results].sort((a, b) => b.points - a.points),
    benches: [...results].sort((a, b) => b.benchPoints - a.benchPoints),
  };
}

export const useRosterPoints = ({ leagueId, weekNumber, rosters }) => {
  const { isLoading, data } = useQuery(
    ['points', { leagueId, weekNumber }],
    async () => {
      return fetchScores({
        leagueId,
        weekNumber,
        rosters,
      });
    },
    { enabled: !!leagueId && rosters?.length > 0 }
  );

  return {
    isLoadingRosterPoints: isLoading,
    rosterPoints: data,
  };
};
