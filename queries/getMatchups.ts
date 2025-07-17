'use server';

import { cache } from 'react';

import { type Matchup } from '../types';

export const getMatchups = cache(
  async ({
    leagueId,
    weekNumber,
  }: {
    leagueId: string;
    weekNumber: string;
  }) => {
    const response = await fetch(
      `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`,
      { next: { revalidate: 86400000 } }, // 1 day
    );

    if (!response.ok) {
      throw new Error('Failed to fetch matchups');
    }

    return response.json() as unknown as Matchup[];
  },
);
