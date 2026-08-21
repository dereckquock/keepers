'use server';

import { cache } from 'react';

import { type Matchup } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

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
      { next: { revalidate: ONE_DAY_IN_SECONDS } },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch matchups');
    }

    return response.json() as unknown as Matchup[];
  },
);
