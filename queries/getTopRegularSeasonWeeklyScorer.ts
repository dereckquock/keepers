'use server';

import { cache } from 'react';

import { getMatchups } from './getMatchups';
import { getRosters } from './getRosters';
import { getUsers } from './getUsers';

const REGULAR_SEASON_WEEKS = 14;

export type RegularSeasonWeeklyTopScorer = {
  avatarUrl?: string;
  displayName: string;
  points: number;
  teamName?: string;
  userId: string;
  weekNumber: number;
};

export const getTopRegularSeasonWeeklyScorer = cache(
  async ({ leagueId }: { leagueId: string }) => {
    if (!leagueId) {
      return null;
    }

    const [users, rosters] = await Promise.all([
      getUsers({ leagueId }),
      getRosters({ leagueId }),
    ]);

    const rosterToUserId = new Map<string, string>();
    rosters.forEach((roster) => {
      if (roster.owner_id) {
        rosterToUserId.set(String(roster.roster_id), roster.owner_id);
      }
    });

    const weeklyMatchups = await Promise.all(
      Array.from({ length: REGULAR_SEASON_WEEKS }, (_, index) => {
        return getMatchups({ leagueId, weekNumber: `${index + 1}` });
      }),
    );

    let topUserId: null | string = null;
    let topPoints = -Infinity;
    let topWeekNumber = 0;

    weeklyMatchups.forEach((matchups, weekIndex) => {
      matchups.forEach((matchup) => {
        const userId = rosterToUserId.get(String(matchup.roster_id));

        if (!userId) {
          return;
        }

        if ((matchup.points ?? 0) > topPoints) {
          topPoints = matchup.points ?? 0;
          topUserId = userId;
          topWeekNumber = weekIndex + 1;
        }
      });
    });

    if (!topUserId || !Number.isFinite(topPoints)) {
      return null;
    }

    const topUser = users.find((user) => user.user_id === topUserId);
    const avatar = topUser?.avatar;

    return {
      avatarUrl: avatar
        ? `https://sleepercdn.com/avatars/thumbs/${avatar}`
        : undefined,
      displayName: topUser?.display_name ?? 'Unknown user',
      points: Math.round(topPoints * 100) / 100,
      teamName: topUser?.metadata?.team_name,
      userId: topUserId,
      weekNumber: topWeekNumber,
    } satisfies RegularSeasonWeeklyTopScorer;
  },
);
