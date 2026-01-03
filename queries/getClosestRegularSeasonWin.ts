'use server';

import { cache } from 'react';

import { getMatchups } from './getMatchups';
import { getRosters } from './getRosters';
import { getUsers } from './getUsers';

const REGULAR_SEASON_WEEKS = 14;

export type RegularSeasonClosestWin = {
  avatarUrl?: string;
  displayName: string;
  loserPoints: number;
  margin: number;
  teamName?: string;
  userId: string;
  weekNumber: number;
  winnerPoints: number;
};

export const getClosestRegularSeasonWin = cache(
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

    let smallestMargin = Infinity;
    let smallestWeekNumber = 0;
    let smallestWinnerRosterId: string | null = null;
    let smallestWinnerPoints = 0;
    let smallestLoserPoints = 0;

    weeklyMatchups.forEach((matchups, weekIndex) => {
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

        let maxPoints = -Infinity;
        let minPoints = Infinity;
        let winnerRosterId: string | null = null;
        let winnerCount = 0;

        group.forEach((matchup) => {
          const points = matchup.points ?? 0;
          const rosterId = String(matchup.roster_id);

          if (points > maxPoints) {
            maxPoints = points;
            winnerRosterId = rosterId;
            winnerCount = 1;
          } else if (points === maxPoints) {
            winnerCount += 1;
          }

          if (points < minPoints) {
            minPoints = points;
          }
        });

        if (winnerCount !== 1 || !winnerRosterId) {
          return;
        }

        const margin = maxPoints - minPoints;

        if (margin <= 0) {
          return;
        }

        if (margin < smallestMargin) {
          smallestMargin = margin;
          smallestWeekNumber = weekIndex + 1;
          smallestWinnerRosterId = winnerRosterId;
          smallestWinnerPoints = maxPoints;
          smallestLoserPoints = minPoints;
        }
      });
    });

    if (
      !smallestWinnerRosterId ||
      !Number.isFinite(smallestMargin) ||
      smallestMargin === Infinity
    ) {
      return null;
    }

    const winnerUserId = rosterToUserId.get(smallestWinnerRosterId);

    if (!winnerUserId) {
      return null;
    }

    const winnerUser = users.find((user) => user.user_id === winnerUserId);
    const avatar = winnerUser?.avatar;

    return {
      avatarUrl: avatar
        ? `https://sleepercdn.com/avatars/thumbs/${avatar}`
        : undefined,
      displayName: winnerUser?.display_name ?? 'Unknown user',
      loserPoints: Math.round(smallestLoserPoints * 100) / 100,
      margin: Math.round(smallestMargin * 100) / 100,
      teamName: winnerUser?.metadata?.team_name,
      userId: winnerUserId,
      weekNumber: smallestWeekNumber,
      winnerPoints: Math.round(smallestWinnerPoints * 100) / 100,
    } satisfies RegularSeasonClosestWin;
  },
);
