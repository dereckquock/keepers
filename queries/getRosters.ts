'use server';

import { cache } from 'react';

import { type Roster } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

export const getRosters = cache(async ({ leagueId }: { leagueId: string }) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
    { next: { revalidate: ONE_DAY_IN_SECONDS } },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rosters');
  }

  return response.json() as unknown as Roster[];
});
