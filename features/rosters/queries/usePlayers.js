import { useQuery } from '@tanstack/react-query';

export function usePlayers() {
  const { isLoading, data } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      return await fetch('https://api.sleeper.app/v1/players/nfl').then((res) =>
        res.json(),
      );
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingPlayers: isLoading,
    players: data,
  };
}
