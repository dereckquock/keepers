import * as cheerio from 'cheerio';
import classNames from 'classnames';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';
import { currentLeagueId, previousLeagueId } from './constants';

async function getRosters() {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${currentLeagueId}/rosters`,
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rosters');
  }

  return response.json();
}

async function getPreviousDraftResults({ user_id }) {
  const drafts = await fetch(
    `https://api.sleeper.app/v1/league/${previousLeagueId}/drafts`,
    { next: { revalidate: 86400000 } }, // 1 day
  ).then((res) => res.json());
  const previousDraft = drafts.at(-1);
  const previousDraftPicks = await fetch(
    `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`,
    { next: { revalidate: 86400000 } }, // 1 day
  ).then((res) => res.json());

  if (!user_id) return previousDraftPicks;
  return previousDraftPicks.filter(({ picked_by }) => picked_by === user_id);
}

async function getAuctionDraftValues() {
  const html = await fetch(
    'https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1',
    { next: { revalidate: 86400000 } }, // 1 day
  ).then((res) => res.text());
  const $ = cheerio.load(html);
  const tableItems = $('#OverallTable > tbody > tr');

  const playerValues = Array.from(tableItems).reduce((playerMap, item) => {
    const nameWithInfo = $(item).find('td:nth-child(2)').text() || '';
    const nameWithoutExtras = nameWithInfo
      .replace('Jr.', '')
      .replace('Sr.', '')
      .replace(/I/g, '');
    const name = nameWithoutExtras.replace(/\(.+/, '').trim();
    const value = $(item).find('.RealValue').text();

    return {
      ...playerMap,
      [name]: parseInt(value, 10),
    };
  }, {});

  return playerValues;
}

function Header({ avatar, displayName, teamName }) {
  return (
    <h2
      style={{
        marginTop: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <Image
        alt="Avatar image"
        className={styles.avatar}
        height={50}
        src={`https://sleepercdn.com/avatars/thumbs/${avatar}`}
        width={50}
      />
      <span>{displayName}</span>
      {teamName ? <span> | {teamName}</span> : null}
    </h2>
  );
}

export async function Team({
  user_id,
  display_name,
  avatar,
  metadata,
  players,
}) {
  const rosters = await getRosters();
  const previousDraftResults = await getPreviousDraftResults({ user_id });
  const auctionDraftValues = await getAuctionDraftValues();
  const previousDraftResultsPlayerIds = (previousDraftResults || []).map(
    (pick) => pick.player_id,
  );
  const roster = rosters.find((roster) => roster.owner_id === user_id);

  return (
    <div id={user_id}>
      <Header
        avatar={avatar}
        displayName={display_name}
        teamName={metadata.team_name}
      />
      {roster.players.map((playerId) => {
        /**
         * calculate the auction value cost for the player
         *
         * 1. if the player was drafted (player was in previous draft results),
         *    use the calculated draft values from the previous draft results
         * 2. if the player was undrafted, use the current average auction value
         *    from fantasypros https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1
         */
        const player = players[playerId];
        const playerName = `${player.first_name} ${player.last_name}`;
        const auctionValue = parseInt(
          previousDraftResults.find((pick) => pick.player_id === playerId)
            ?.metadata?.amount,
          10,
        );
        const cost =
          previousDraftResultsPlayerIds.includes(playerId) && auctionValue
            ? auctionValue
            : auctionDraftValues[playerName] || 1;
        const positiveCost = cost < 0 ? 1 : cost;
        const costWithInterest = Math.ceil(positiveCost + positiveCost * 0.4);

        return (
          <div
            className={classNames(styles.player, {
              [styles.isSelected]: false, // set if player is selected in player config
            })}
            key={playerId}
          >
            <div>{playerName}</div>
            <div className={styles.cost}>${costWithInterest}</div>
          </div>
        );
      })}
    </div>
  );
}
