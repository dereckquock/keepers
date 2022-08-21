import { useQuery } from 'react-query';

export const usePlayers = () => {
  const { isLoading, data } = useQuery(
    ['players'],
    async () => {
      return await fetch('https://api.sleeper.app/v1/players/nfl').then((res) =>
        res.json()
      );
    },
    {
      staleTime: 86400000, // set stale time to 1 day
    }
  );

  return {
    isLoadingPlayers: isLoading,
    players: data,
  };
};
