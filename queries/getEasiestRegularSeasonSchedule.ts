'use server';

import { cache } from 'react';

import { getMatchups } from './getMatchups';
import { getRosters } from './getRosters';
import { getUsers } from './getUsers';

const REGULAR_SEASON_WEEKS = 14;

export type RegularSeasonEasiestSchedule = {
  avatarUrl?: string;
  displayName: string;
  pointsAgainst: number;
  teamName?: string;
  userId: string;
};

export const getEasiestRegularSeasonSchedule = cache(
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

    const pointsAgainstByRosterId = new Map<string, number>();

    weeklyMatchups.forEach((matchups) => {
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
        const totalPoints = group.reduce(
          (sum, matchup) => sum + (matchup.points ?? 0),
          0,
        );

        group.forEach((matchup) => {
          const rosterId = String(matchup.roster_id);
          const pointsAgainst = totalPoints - (matchup.points ?? 0);

          pointsAgainstByRosterId.set(
            rosterId,
            (pointsAgainstByRosterId.get(rosterId) ?? 0) + pointsAgainst,
          );
        });
      });
    });

    let topRosterId: string | null = null;
    let lowestPointsAgainst = Infinity;

    pointsAgainstByRosterId.forEach((pointsAgainst, rosterId) => {
      if (!rosterToUserId.get(rosterId)) {
        return;
      }

      if (pointsAgainst < lowestPointsAgainst) {
        lowestPointsAgainst = pointsAgainst;
        topRosterId = rosterId;
      }
    });

    if (!topRosterId || !Number.isFinite(lowestPointsAgainst)) {
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
      pointsAgainst: Math.round(lowestPointsAgainst * 100) / 100,
      teamName: topUser?.metadata?.team_name,
      userId: topUserId,
    } satisfies RegularSeasonEasiestSchedule;
  },
);
