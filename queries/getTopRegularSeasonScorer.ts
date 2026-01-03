'use server';

import { cache } from 'react';

import { getMatchups } from './getMatchups';
import { getRosters } from './getRosters';
import { getUsers } from './getUsers';

const REGULAR_SEASON_WEEKS = 14;

export type RegularSeasonTopScorer = {
  avatarUrl?: string;
  displayName: string;
  points: number;
  teamName?: string;
  userId: string;
};

export const getTopRegularSeasonScorer = cache(
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

    const pointsByUserId = new Map<string, number>();
    weeklyMatchups.forEach((matchups) => {
      matchups.forEach((matchup) => {
        const userId = rosterToUserId.get(String(matchup.roster_id));

        if (!userId) {
          return;
        }

        pointsByUserId.set(
          userId,
          (pointsByUserId.get(userId) ?? 0) + (matchup.points ?? 0),
        );
      });
    });

    if (pointsByUserId.size === 0) {
      return null;
    }

    let topUserId: null | string = null;
    let topPoints = -Infinity;

    pointsByUserId.forEach((points, userId) => {
      if (points > topPoints) {
        topPoints = points;
        topUserId = userId;
      }
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
    } satisfies RegularSeasonTopScorer;
  },
);
