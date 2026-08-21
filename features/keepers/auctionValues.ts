import { type Player } from '../../types';

/**
 * Suffixes that Sleeper and FantasyPros disagree about. Only ever stripped
 * from the end of a name, and never when doing so would leave less than a
 * first and last name behind.
 */
const NAME_SUFFIXES = new Set(['ii', 'iii', 'iv', 'jr', 'sr', 'v']);

const DEFENSE_POSITIONS = new Set(['d/st', 'def', 'dst']);

const MINIMUM_AUCTION_VALUE = 1;

export type AuctionValueIndex = {
  byName: Record<string, number>;
  byTeamDefense: Record<string, number>;
};

export type AuctionValueRow = {
  name: string;
  position: string;
  team: string;
  value: number;
};

/**
 * Index the FantasyPros rows so they can be matched against Sleeper players.
 *
 * Team defenses never match by name (Sleeper says "San Francisco 49ers",
 * FantasyPros says "49ers"), so they also get indexed by team abbreviation.
 */
export function buildAuctionValueIndex(
  rows: AuctionValueRow[],
): AuctionValueIndex {
  const index: AuctionValueIndex = { byName: {}, byTeamDefense: {} };

  for (const row of rows) {
    if (!Number.isFinite(row.value)) {
      continue;
    }

    const value = Math.max(MINIMUM_AUCTION_VALUE, Math.trunc(row.value));
    const nameKey = normalizePlayerName(row.name);

    if (nameKey) {
      // two players can normalize to the same key, so keep the pricier one
      // rather than letting a bench player undercut a starter
      index.byName[nameKey] = Math.max(index.byName[nameKey] ?? 0, value);
    }

    if (row.team && isDefense(row.position)) {
      const teamKey = row.team.toLowerCase();

      index.byTeamDefense[teamKey] = Math.max(
        index.byTeamDefense[teamKey] ?? 0,
        value,
      );
    }
  }

  return index;
}

/** Look up a Sleeper player's average auction value, if FantasyPros lists one. */
export function findAuctionValue({
  index,
  player,
  playerId,
}: {
  index: AuctionValueIndex;
  player: Player | undefined;
  playerId: string;
}) {
  if (isDefense(player?.position)) {
    // Sleeper uses the team abbreviation as the player id for team defenses
    const teamKey = (player?.team || playerId).toLowerCase();
    const defenseValue = index.byTeamDefense[teamKey];

    if (defenseValue !== undefined) {
      return defenseValue;
    }
  }

  const nameKey = normalizePlayerName(getPlayerName(player));

  return nameKey ? index.byName[nameKey] : undefined;
}

export function getPlayerName(player: Player | undefined) {
  return `${player?.first_name || ''} ${player?.last_name || ''}`.trim();
}

/**
 * Build a match key that survives the formatting differences between data
 * sources: punctuation ("A.J." vs "AJ", "St. Brown" vs "St Brown"), accents,
 * and generational suffixes ("Marvin Harrison Jr." vs "Marvin Harrison").
 */
export function normalizePlayerName(name: string) {
  const parts = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  while (parts.length > 2 && NAME_SUFFIXES.has(parts.at(-1) ?? '')) {
    parts.pop();
  }

  return parts.join('');
}

function isDefense(position: string | undefined) {
  return DEFENSE_POSITIONS.has((position || '').toLowerCase());
}
