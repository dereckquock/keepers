import { useQuery } from '@tanstack/react-query';

export function useUsers({ leagueId }) {
  const { isLoading, data } = useQuery({
    queryKey: ['users', { leagueId }],
    queryFn: async () => {
      return await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/users`,
      ).then((res) => res.json());
    },

    enabled: !!leagueId,

    // set stale time to 2 days
    staleTime: 172800000,
  });

  return {
    isLoadingUsers: isLoading,
    users: data,
  };
}
