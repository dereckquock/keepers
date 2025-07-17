'use server';

import { cache } from 'react';

import { type User } from '../types';

export const getUsers = cache(async ({ leagueId }: { leagueId: string }) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`,
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json() as unknown as User[];
});
