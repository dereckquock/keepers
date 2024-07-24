import classNames from 'classnames';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';
import { useAuctionDraftValues } from './queries/useAuctionDraftValues';
import { usePlayers } from './queries/usePlayers';
import { usePreviousDraftResults } from './queries/usePreviousDraftResults';
import { useRosters } from './queries/useRosters';

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

export function Team({ user_id, display_name, avatar, metadata }) {
  const { isLoadingPlayers, players } = usePlayers();
  const { isLoadingRosters, rosters } = useRosters();
  const { isLoadingPreviousDraftResults, previousDraftResults } =
    usePreviousDraftResults({ leagueId: '784354698986725376', user_id });
  const { isLoadingAuctionDraftValues, auctionDraftValues } =
    useAuctionDraftValues();

  if (
    isLoadingPlayers ||
    isLoadingRosters ||
    isLoadingPreviousDraftResults ||
    isLoadingAuctionDraftValues
  ) {
    return (
      <div>
        <Header
          avatar={avatar}
          displayName={display_name}
          teamName={metadata.team_name}
        />
        <p className={styles.player}>Loading players...</p>
      </div>
    );
  }

  const previousDraftResultsPlayerIds = (previousDraftResults || []).map(
    (pick) => pick.player_id,
  );
  const roster = rosters.find((roster) => roster.owner_id === user_id);

  return (
    <div>
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
