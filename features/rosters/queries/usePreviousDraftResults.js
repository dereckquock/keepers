import { useQuery } from '@tanstack/react-query';

export function usePreviousDraftResults({ leagueId, user_id }) {
  const { isLoading, data } = useQuery({
    queryKey: ['previousDraftResults', { leagueId }],
    queryFn: async () => {
      const drafts = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/drafts`,
      ).then((res) => res.json());
      const previousDraft = drafts.at(-1);
      const previousDraftPicks = await fetch(
        `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`,
      ).then((res) => res.json());

      return previousDraftPicks;
    },

    select: (picks) => {
      if (!user_id) {
        return picks;
      }
      return picks.filter(({ picked_by }) => picked_by === user_id);
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingPreviousDraftResults: isLoading,
    previousDraftResults: data,
  };
}
