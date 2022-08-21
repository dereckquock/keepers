import { useQuery } from 'react-query';

export const useUsers = ({ leagueId }) => {
  const { isLoading, data } = useQuery(
    ['users', { leagueId }],
    async () => {
      return await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/users`
      ).then((res) => res.json());
    },
    { enabled: !!leagueId }
  );

  return {
    isLoadingUsers: isLoading,
    users: data,
  };
};
