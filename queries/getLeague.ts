'use server';

import { cache } from 'react';

import { type League } from '../types';

export const getLeague = cache(async ({ leagueId }: { leagueId: string }) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}`,
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch league');
  }

  return response.json() as unknown as League;
});
