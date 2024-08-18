'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { currentLeagueId } from '../../features/rosters/constants';
import styles from '../../styles/Home.module.css';

const queryClient = new QueryClient();

async function fetchScores({ leagueId, weekNumber, rosters }) {
  const users = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`,
  ).then((res) => res.json());

  const matchups = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`,
  ).then((res) => res.json());

  const results = matchups.map((roster) => {
    const { roster_id, players_points, points } = roster;
    const userId = rosters.find((r) => r.roster_id === roster_id)?.owner_id;
    const { avatar, display_name } =
      users.find((user) => user.user_id === userId) || {};
    const fullRosterPoints = Object.values(players_points).reduce(
      (total, points) => total + points,
      0,
    );

    // sum the bench players' points
    const benchPoints = fullRosterPoints - points;

    return {
      avatar: `https://sleepercdn.com/avatars/thumbs/${avatar}`,
      displayName: display_name,
      points,
      benchPoints: Math.round(100 * benchPoints) / 100,
    };
  });

  return {
    starters: [...results].sort((a, b) => b.points - a.points),
    benches: [...results].sort((a, b) => b.benchPoints - a.benchPoints),
  };
}

function useRosterPoints({ leagueId, weekNumber, rosters }) {
  const { isLoading, data } = useQuery({
    queryKey: ['points', { leagueId, weekNumber }],
    queryFn: async () => {
      return fetchScores({
        leagueId,
        weekNumber,
        rosters,
      });
    },

    enabled: !!leagueId && rosters?.length > 0,

    // set stale time to 5 minutes
    staleTime: 300000,
  });

  return {
    isLoadingRosterPoints: isLoading,
    rosterPoints: data,
  };
}

function useRosters() {
  const [leagueId, setLeagueId] = useState(currentLeagueId);
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

function Scores({ isLoadingRosters, leagueId, weekNumber, rosters }) {
  const { isLoadingRosterPoints, rosterPoints } = useRosterPoints({
    leagueId,
    weekNumber,
    rosters,
  });

  if (!leagueId) {
    return null;
  }

  const isLoading = isLoadingRosters || isLoadingRosterPoints;

  if (!isLoading && !rosterPoints) {
    return <h2>🤔 No data for League ID provided 🤷‍♂️</h2>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '4rem',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <div>
        <h2>Starters</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          rosterPoints.starters.map(
            ({ avatar, displayName, points }, index) => {
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    alt="Avatar image"
                    className={styles.avatar}
                    height={50}
                    src={avatar}
                    width={50}
                  />
                  <span style={{ fontSize: '1.25rem' }}>{displayName}</span> —
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {points.toFixed(2)}
                  </span>
                </div>
              );
            },
          )
        )}
      </div>
      <div>
        <h2>Benches</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          rosterPoints.benches.map(
            ({ avatar, displayName, benchPoints }, index) => {
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    alt="Avatar image"
                    className={styles.avatar}
                    height={50}
                    src={avatar}
                    width={50}
                  />
                  <span style={{ fontSize: '1.25rem' }}>{displayName}</span> —
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {benchPoints.toFixed(2)}
                  </span>
                </div>
              );
            },
          )
        )}
      </div>
    </div>
  );
}

function Main() {
  const { isLoadingRosters, leagueId, rosters, setLeagueId } = useRosters();
  const [weekNumber, setWeekNumber] = useState('1');
  const { wins, ties, losses } = rosters?.[0]?.settings || {};
  const currentWeekNumber = Math.max(1, wins + ties + losses);

  // set the current week number once we fetch the rosters and can calculate the current week based on games played
  useEffect(() => {
    if (currentWeekNumber) {
      setWeekNumber(currentWeekNumber.toString());
    }
  }, [currentWeekNumber]);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLeagueId(event.currentTarget.elements.leagueId.value);
        }}
        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <label
          htmlFor="leagueId"
          style={{ marginRight: 10 }}
        >
          League ID
        </label>
        <input
          className={styles.formControl}
          defaultValue={currentLeagueId}
          id="leagueId"
          name="leagueId"
          placeholder="Enter League ID"
          style={{ textAlign: 'center' }}
          type="tel"
        />
        <input
          aria-label="Submit"
          className="button"
          type="submit"
          value="Submit"
        />
      </form>

      <div
        style={{
          margin: '1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <label htmlFor="week">Week number</label>
        <select
          className={styles.formControl}
          id="week"
          name="week"
          onChange={({ currentTarget }) => setWeekNumber(currentTarget.value)}
          value={weekNumber}
        >
          {isLoadingRosters ? (
            <option value="loading">Loading...</option>
          ) : (
            [...Array(14).keys()].map((index) => (
              <option
                key={index}
                value={index + 1}
              >
                {index + 1}
              </option>
            ))
          )}
        </select>
      </div>

      <Scores
        isLoadingRosters={isLoadingRosters}
        leagueId={leagueId}
        rosters={rosters}
        weekNumber={weekNumber}
      />
    </>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.container}>
        <main>
          <h1 className={styles.title}>
            🔥💰 Points &amp; Benches (╯°□°)╯︵ ┻━┻ 💰🔥
          </h1>
          <Main />
        </main>
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
