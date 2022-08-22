import { useQuery } from 'react-query';

export const usePreviousDraftResults = ({ leagueId, user_id }) => {
  const { isLoading, data } = useQuery(
    ['previousDraftResults', { leagueId }],
    async () => {
      const drafts = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/drafts`
      ).then((res) => res.json());
      const previousDraft = drafts.find(
        ({ season }) => season === `${new Date().getFullYear() - 1}`
      );
      const previousDraftPicks = await fetch(
        `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`
      ).then((res) => res.json());

      return previousDraftPicks;
    },
    {
      select: (picks) => {
        if (!user_id) return picks;
        return picks.filter(({ picked_by }) => picked_by === user_id);
      },
      staleTime: 86400000, // set stale time to 1 day
    }
  );

  return {
    isLoadingPreviousDraftResults: isLoading,
    previousDraftResults: data,
  };
};
