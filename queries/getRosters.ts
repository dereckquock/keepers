'use server';

import { cache } from 'react';

import { type Roster } from '../types';

export const getRosters = cache(async ({ leagueId }: { leagueId: string }) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rosters');
  }

  return response.json() as unknown as Roster[];
});
