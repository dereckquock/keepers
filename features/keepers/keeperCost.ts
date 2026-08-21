import {
  type DraftPick,
  type Player,
  type Roster,
  type Transaction,
} from '../../types';
import {
  type AuctionValueIndex,
  findAuctionValue,
  getPlayerName,
} from './auctionValues';

/** Every keeper costs 40% more than the price the cost is based on. */
export const KEEPER_COST_INCREASE = 0.4;

/** Auction floor — nobody can be rostered for less than a dollar. */
export const MINIMUM_AUCTION_VALUE = 1;

export type KeeperCost = {
  baseCost: number;
  basis: KeeperCostBasis;
  cost: number;
};

/**
 * Where a keeper's base cost came from:
 * - `draft`: the manager drafted the player and held them all season
 * - `adp`: the manager added the player mid-season, so FantasyPros ADP applies
 * - `minimum`: FantasyPros doesn't list the player, so the auction floor applies
 */
export type KeeperCostBasis = 'adp' | 'draft' | 'minimum';

export type KeeperPlayer = KeeperCost & {
  name: string;
  playerId: string;
  position: string;
};

export function applyKeeperIncrease(baseCost: number) {
  return Math.ceil(baseCost * (1 + KEEPER_COST_INCREASE));
}

export function getKeeperCost({
  adpValue,
  draftedCost,
}: {
  adpValue: number | undefined;
  draftedCost: number | undefined;
}): KeeperCost {
  const [basis, baseCost] = ((): [KeeperCostBasis, number] => {
    if (draftedCost !== undefined) {
      return ['draft', draftedCost];
    }

    if (adpValue !== undefined) {
      return ['adp', adpValue];
    }

    return ['minimum', MINIMUM_AUCTION_VALUE];
  })();

  return { baseCost, basis, cost: applyKeeperIncrease(baseCost) };
}

/**
 * A player only keeps their draft price if the *same* manager drafted them and
 * never let them go. Any completed add or drop during the season — waiver
 * claim, free agent pickup, trade, or a drop-and-re-add — means the player
 * didn't sit on that roster the whole season, so they're priced off ADP.
 */
export function getPlayerIdsThatChangedRosters(transactions: Transaction[]) {
  const playerIds = new Set<string>();

  for (const transaction of transactions) {
    if (transaction.status !== 'complete') {
      continue;
    }

    for (const playerId of Object.keys(transaction.adds ?? {})) {
      playerIds.add(playerId);
    }

    for (const playerId of Object.keys(transaction.drops ?? {})) {
      playerIds.add(playerId);
    }
  }

  return playerIds;
}

/** Price every player on a manager's current roster, most expensive first. */
export function getTeamKeepers({
  auctionValueIndex,
  ownerId,
  playerIdsThatChangedRosters,
  players,
  previousDraftPicks,
  roster,
}: {
  auctionValueIndex: AuctionValueIndex;
  ownerId: string;
  playerIdsThatChangedRosters: Set<string>;
  players: Record<string, Player>;
  previousDraftPicks: DraftPick[];
  roster: Roster | undefined;
}): KeeperPlayer[] {
  const picksByThisManager = new Map(
    previousDraftPicks
      .filter((pick) => pick.picked_by === ownerId)
      .map((pick) => [pick.player_id, pick]),
  );

  return (roster?.players ?? [])
    .map((playerId) => {
      const player = players[playerId];
      const pick = picksByThisManager.get(playerId);
      const heldAllSeason =
        pick !== undefined && !playerIdsThatChangedRosters.has(playerId);

      return {
        ...getKeeperCost({
          adpValue: findAuctionValue({
            index: auctionValueIndex,
            player,
            playerId,
          }),
          draftedCost: heldAllSeason
            ? parseAuctionAmount(pick.metadata?.amount)
            : undefined,
        }),
        name: getPlayerName(player) || '🏈',
        playerId,
        position: player?.position || '',
      };
    })
    .sort((a, b) => b.cost - a.cost);
}

/**
 * Draft picks only carry an amount in auction drafts, and it arrives as a
 * string. Anything else means there's no draft price to keep the player at.
 */
function parseAuctionAmount(amount: null | string | undefined) {
  if (!amount) {
    return undefined;
  }

  const parsed = parseInt(amount.replace(/[^0-9]/g, ''), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
