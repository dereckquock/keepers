'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

const queryClient = new QueryClient();

function useAuctionDraftValues() {
  const { isLoading, data } = useQuery({
    queryKey: ['auctionDraftValues'],
    queryFn: async () => {
      const response = await fetch('/api/auction-draft-values').then((res) =>
        res.json(),
      );

      return response.playerValues;
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingAuctionDraftValues: isLoading,
    auctionDraftValues: data,
  };
}

function usePlayers() {
  const { isLoading, data } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      return await fetch('https://api.sleeper.app/v1/players/nfl').then((res) =>
        res.json(),
      );
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingPlayers: isLoading,
    players: data,
  };
}

function usePreviousDraftResults({ leagueId, user_id }) {
  const { isLoading, data } = useQuery({
    queryKey: ['previousDraftResults', { leagueId }],
    queryFn: async () => {
      const drafts = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/drafts`,
      ).then((res) => res.json());
      const previousDraft = drafts.at(-1);
      const previousDraftPicks = await fetch(
        `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`,
      ).then((res) => res.json());

      return previousDraftPicks;
    },

    select: (picks) => {
      if (!user_id) {
        return picks;
      }
      return picks.filter(({ picked_by }) => picked_by === user_id);
    },

    staleTime: 86400000, // set stale time to 1 day
  });

  return {
    isLoadingPreviousDraftResults: isLoading,
    previousDraftResults: data,
  };
}

function useUsers({ leagueId }) {
  const { isLoading, data } = useQuery({
    queryKey: ['users', { leagueId }],
    queryFn: async () => {
      return await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/users`,
      ).then((res) => res.json());
    },

    enabled: !!leagueId,

    // set stale time to 2 days
    staleTime: 172800000,
  });

  return {
    isLoadingUsers: isLoading,
    users: data,
  };
}

function useRosters() {
  const [leagueId, setLeagueId] = useState('784354698986725376');
  const { isLoading: isLoadingRosters, data: rosters } = useQuery({
    queryKey: ['rosters', { leagueId }],
    queryFn: async () => {
      const data = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
      ).then((res) => res.json());

      return data;
    },

    enabled: !!leagueId,

    // set stale time to 2 days
    staleTime: 172800000,
  });

  return {
    isLoadingRosters,
    leagueId,
    rosters,
    setLeagueId,
  };
}

function Team({ user_id, display_name, avatar, metadata }) {
  const { isLoadingPlayers, players } = usePlayers();
  const { isLoadingRosters, rosters } = useRosters();
  const { isLoadingPreviousDraftResults, previousDraftResults } =
    usePreviousDraftResults({ leagueId: '784354698986725376', user_id });
  const { isLoadingAuctionDraftValues, auctionDraftValues } =
    useAuctionDraftValues();

  const Header = () => (
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
      <span>{display_name}</span>
      {metadata.team_name ? <span> | {metadata.team_name}</span> : null}
    </h2>
  );

  if (
    isLoadingPlayers ||
    isLoadingRosters ||
    isLoadingPreviousDraftResults ||
    isLoadingAuctionDraftValues
  ) {
    return (
      <div>
        <Header />
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
      <Header />
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

function Main() {
  const { isLoadingUsers, users } = useUsers({
    leagueId: '784354698986725376',
  });
  const [filter, setFilter] = React.useState('');

  if (isLoadingUsers) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <label
        htmlFor="filter"
        style={{ marginRight: 10 }}
      >
        Filter manager
      </label>
      <select
        className={styles.formControl}
        id="filter"
        onChange={(event) => setFilter(event.target.value)}
        value={filter}
      >
        <option value="">All managers</option>
        {users.map(({ display_name }) => (
          <option
            key={display_name}
            value={display_name}
          >
            {display_name}
          </option>
        ))}
      </select>

      <section>
        {users
          .filter(({ display_name }) =>
            filter ? display_name === filter : true,
          )
          .map((data) => (
            <Team
              key={data.display_name}
              {...data}
            />
          ))}
      </section>
    </>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.container}>
        <main>
          <header className={styles.header}>
            <h1>KEEPERS</h1>
            <Link
              className="button"
              href="/points"
            >
              🔥💯 Top Scorers 👉
            </Link>
          </header>
          <Main />
        </main>
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
