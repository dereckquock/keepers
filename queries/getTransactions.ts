'use server';

import { cache } from 'react';

import { type Transaction } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

/** Sleeper exposes transactions one week at a time, through week 18. */
const SEASON_WEEKS = 18;

export const getTransactions = cache(
  async ({ leagueId }: { leagueId: string }) => {
    const weeks = Array.from(
      { length: SEASON_WEEKS },
      (_, index) => index + 1,
    );
    const weeklyTransactions = await Promise.all(
      weeks.map(async (week) => {
        const response = await fetch(
          `https://api.sleeper.app/v1/league/${leagueId}/transactions/${week}`,
          { next: { revalidate: ONE_DAY_IN_SECONDS } },
        );

        if (!response.ok) {
          return null;
        }

        return ((await response.json()) ?? []) as Transaction[];
      }),
    );

    // one bad week shouldn't take the page down, but every week failing means
    // we'd silently treat every player as never having moved
    if (weeklyTransactions.every((transactions) => transactions === null)) {
      throw new Error('Failed to fetch transactions');
    }

    return weeklyTransactions.filter((transactions) => transactions !== null).flat();
  },
);
