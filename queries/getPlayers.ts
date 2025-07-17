'use server';

import { cache } from 'react';

import { type Player } from '../types';

export const getPlayers = cache(async () => {
  const response = await fetch(
    'https://api.sleeper.app/v1/players/nfl',
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }

  return response.json() as unknown as Record<string, Player>;
});
