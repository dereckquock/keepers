'use server';

import { cache } from 'react';

import { getMatchups } from './getMatchups';
import { getRosters } from './getRosters';
import { getUsers } from './getUsers';

const REGULAR_SEASON_WEEKS = 14;

export type RegularSeasonLongestWinStreak = {
  avatarUrl?: string;
  displayName: string;
  streak: number;
  teamName?: string;
  userId: string;
};

export const getLongestRegularSeasonWinStreak = cache(
  async ({ leagueId }: { leagueId: string }) => {
    if (!leagueId) {
      return null;
    }

    const [users, rosters] = await Promise.all([
      getUsers({ leagueId }),
      getRosters({ leagueId }),
    ]);

    const rosterIds = rosters.map((roster) => String(roster.roster_id));
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

    const currentStreaks = new Map<string, number>();
    const maxStreaks = new Map<string, number>();

    rosterIds.forEach((rosterId) => {
      currentStreaks.set(rosterId, 0);
      maxStreaks.set(rosterId, 0);
    });

    weeklyMatchups.forEach((matchups) => {
      const winners = new Set<string>();
      const matchupsById = new Map<string, typeof matchups>();

      matchups.forEach((matchup) => {
        const matchupKey = String(matchup.matchup_id);
        const group = matchupsById.get(matchupKey);

        if (group) {
          group.push(matchup);
        } else {
          matchupsById.set(matchupKey, [matchup]);
        }
      });

      matchupsById.forEach((group) => {
        if (group.length < 2) {
          return;
        }

        let topPoints = -Infinity;
        group.forEach((matchup) => {
          topPoints = Math.max(topPoints, matchup.points ?? 0);
        });

        const topMatchups = group.filter(
          (matchup) => (matchup.points ?? 0) === topPoints,
        );

        if (topMatchups.length !== 1) {
          return;
        }

        if (topMatchups[0]) {
          winners.add(String(topMatchups[0].roster_id));
        }
      });

      rosterIds.forEach((rosterId) => {
        const currentStreak = currentStreaks.get(rosterId) ?? 0;
        const nextStreak = winners.has(rosterId) ? currentStreak + 1 : 0;

        currentStreaks.set(rosterId, nextStreak);
        maxStreaks.set(
          rosterId,
          Math.max(maxStreaks.get(rosterId) ?? 0, nextStreak),
        );
      });
    });

    let topRosterId: null | string = null;
    let topStreak = -Infinity;

    maxStreaks.forEach((streak, rosterId) => {
      if (!rosterToUserId.get(rosterId)) {
        return;
      }

      if (streak > topStreak) {
        topStreak = streak;
        topRosterId = rosterId;
      }
    });

    if (!topRosterId || topStreak < 1 || !Number.isFinite(topStreak)) {
      return null;
    }

    const topUserId = rosterToUserId.get(topRosterId);

    if (!topUserId) {
      return null;
    }

    const topUser = users.find((user) => user.user_id === topUserId);
    const avatar = topUser?.avatar;

    return {
      avatarUrl: avatar
        ? `https://sleepercdn.com/avatars/thumbs/${avatar}`
        : undefined,
      displayName: topUser?.display_name ?? 'Unknown user',
      streak: topStreak,
      teamName: topUser?.metadata?.team_name,
      userId: topUserId,
    } satisfies RegularSeasonLongestWinStreak;
  },
);
