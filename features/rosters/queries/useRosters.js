import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function useRosters() {
  const [leagueId, setLeagueId] = useState('784354698986725376');
  const { isLoading: isLoadingRosters, data: rosters } = useQuery({
    queryKey: ['rosters', { leagueId }],
    queryFn: async () => {
      const data = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
      ).then((res) => res.json());

      return data;
    },

    enabled: !!leagueId,

    // set stale time to 1 day
    staleTime: 86400000,
  });

  return {
    isLoadingRosters,
    leagueId,
    rosters,
    setLeagueId,
  };
}
