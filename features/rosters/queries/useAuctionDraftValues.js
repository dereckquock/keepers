import { useQuery } from '@tanstack/react-query';

export function useAuctionDraftValues() {
  const { isLoading, data } = useQuery({
    queryKey: ['auctionDraftValues'],
    queryFn: async () => {
      const response = await fetch('/api/auction-draft-values').then((res) =>
        res.json(),
      );

      return response.playerValues;
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingAuctionDraftValues: isLoading,
    auctionDraftValues: data,
  };
}
