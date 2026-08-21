'use server';

import { cache } from 'react';

import { type Player } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

export const getPlayers = cache(async () => {
  const response = await fetch(
    'https://api.sleeper.app/v1/players/nfl',
    { next: { revalidate: ONE_DAY_IN_SECONDS } },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }

  return response.json() as unknown as Record<string, Player>;
});
