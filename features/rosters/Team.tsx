import classNames from 'classnames';
import Image from 'next/image';

import { getAuctionDraftValues } from '../../queries/getAuctionDraftValues';
import { getPreviousDraftResults } from '../../queries/getPreviousDraftResults';
import { getRosters } from '../../queries/getRosters';
import styles from '../../styles/Home.module.css';
import { type Player, type User } from '../../types';

export async function Team({
  currentLeagueId,
  players,
  previousLeagueId,
  user,
}: {
  currentLeagueId: string;
  players: Record<string, Player>;
  previousLeagueId: string;
  user: User;
}) {
  const rosters = await getRosters({ leagueId: currentLeagueId });
  const previousDraftResults = await getPreviousDraftResults({
    previousLeagueId,
    user_id: user.user_id,
  });
  const auctionDraftValues = await getAuctionDraftValues();
  const previousDraftResultsPlayerIds = (previousDraftResults || []).map(
    (pick) => pick.player_id,
  );
  const roster = rosters.find((roster) => roster.owner_id === user.user_id);

  return (
    <div id={user.user_id}>
      <Header
        avatar={user.avatar}
        displayName={user.display_name}
        teamName={user.metadata.team_name}
      />
      {roster?.players.map((playerId) => {
        /**
         * calculate the auction value cost for the player
         *
         * 1. if the player was drafted (player was in previous draft results),
         *    use the calculated draft values from the previous draft results
         * 2. if the player was undrafted, use the current average auction value
         *    from fantasypros https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1
         */
        const player = players[playerId];
        const playerName =
          `${player?.first_name || ''} ${player?.last_name || ''}`.trim() ||
          '🏈';
        const previousDraftResultsPlayer = previousDraftResults.find(
          (pick) => pick.player_id === playerId,
        );
        const auctionValue = parseInt(
          previousDraftResultsPlayer?.metadata?.amount || '0',
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
              [styles.isSelected || '']: false, // set if player is selected in player config
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

function Header({
  avatar,
  displayName,
  teamName,
}: {
  avatar: string;
  displayName: string;
  teamName?: string;
}) {
  return (
    <h2
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '1rem',
        marginTop: '2.5rem',
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
