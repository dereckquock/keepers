import { useState } from 'react';
import { useQuery } from 'react-query';

export const initialLeagueId = '784354698986725376';

export const useRosters = () => {
  const [leagueId, setLeagueId] = useState(initialLeagueId);
  const { isLoading: isLoadingRosters, data: rosters } = useQuery(
    ['rosters', { leagueId }],
    async () => {
      const data = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`
      ).then((res) => res.json());

      return data;
    },
    { enabled: !!leagueId }
  );

  return {
    isLoadingRosters,
    leagueId,
    rosters,
    setLeagueId,
  };
};
