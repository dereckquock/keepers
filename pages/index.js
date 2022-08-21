import classNames from 'classnames';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import playerAuctionValues from '../data/players-2022';
import { usePlayers } from '../queries/usePlayers';
import { usePreviousDraftResults } from '../queries/usePreviousDraftResults';
import { useRosters } from '../queries/useRosters';
import { useUsers } from '../queries/useUsers';
import styles from '../styles/Home.module.css';

const leagueId = '721172044753993728';

function Team({ user_id, display_name, avatar, metadata }) {
  const { isLoadingPlayers, players } = usePlayers();
  const { isLoadingRosters, rosters } = useRosters();
  const { isLoadingPreviousDraftResults, previousDraftResults } =
    usePreviousDraftResults({ leagueId, user_id });

  if (isLoadingPlayers || isLoadingRosters || isLoadingPreviousDraftResults) {
    return <div>Loading...</div>;
  }

  const previousDraftResultsPlayerIds = previousDraftResults.map(
    (pick) => pick.player_id
  );
  const roster = rosters.find((roster) => roster.owner_id === user_id);

  return (
    <div>
      <h2
        style={{
          marginTop: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Image
          src={`https://sleepercdn.com/avatars/thumbs/${avatar}`}
          alt="Avatar image"
          width={50}
          height={50}
          className={styles.avatar}
        />
        <span>{display_name}</span>
        {metadata.team_name ? <span> | {metadata.team_name}</span> : null}
      </h2>
      {roster.players.map((playerId) => {
        const player = players[playerId];
        const playerName = `${player.first_name} ${player.last_name}`;
        const cost = previousDraftResultsPlayerIds.includes(playerId)
          ? `$${playerAuctionValues[playerName]}`
          : 'TBD';

        /**
         * calculate the auction value cost for the player
         *
         * 1. if the player was drafted (player was in previous draft results),
         *    use the calculated draft values from `data/players-<DRAFT_YEAR>.js`
         * 2. if the player was undrafted, use the current average auction value
         *    from fantasypros https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1
         */

        return (
          <div
            key={playerId}
            className={classNames(styles.player, {
              [styles.isSelected]: false, // set if player is selected in player config
            })}
          >
            <div>{playerName}</div>
            <div className={styles.cost}>{cost}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { isLoadingUsers, users } = useUsers({
    leagueId,
  });
  const [filter, setFilter] = React.useState('');

  if (isLoadingUsers) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Keepers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className={styles.header}>
          <h1>{`${new Date().getFullYear()} KEEPERS`}</h1>
          <Link href="/points">
            <a className="button">🔥💯 Top Scorers 👉</a>
          </Link>
        </header>

        <label htmlFor="filter" style={{ marginRight: 10 }}>
          Filter manager
        </label>
        <select
          id="filter"
          className={styles.formControl}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">All managers</option>
          {users.map(({ display_name }) => (
            <option key={display_name} value={display_name}>
              {display_name}
            </option>
          ))}
        </select>

        <section>
          {users
            .filter(({ display_name }) =>
              filter ? display_name === filter : true
            )
            .map((data) => (
              <Team key={data.display_name} {...data} />
            ))}
        </section>
      </main>
    </div>
  );
}
