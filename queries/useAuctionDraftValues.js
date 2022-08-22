import { useQuery } from 'react-query';

export const useAuctionDraftValues = () => {
  const { isLoading, data } = useQuery(['auctionDraftValues'], async () => {
    const response = await fetch('/api/get-auction-draft-values').then((res) =>
      res.json()
    );

    return response.playerValues;
  });

  return {
    isLoadingAuctionDraftValues: isLoading,
    auctionDraftValues: data,
  };
};
