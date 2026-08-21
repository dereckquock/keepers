'use server';

import { cache } from 'react';

import { type User } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

export const getUsers = cache(async ({ leagueId }: { leagueId: string }) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`,
    { next: { revalidate: ONE_DAY_IN_SECONDS } },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json() as unknown as User[];
});
