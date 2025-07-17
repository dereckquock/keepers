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
import { getMatchups } from '../../queries/getMatchups';
import { getRosters } from '../../queries/getRosters';
import { getUsers } from '../../queries/getUsers';
import styles from '../../styles/Home.module.css';
import { type Roster } from '../../types';

const queryClient = new QueryClient();

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

async function fetchScores({
  leagueId,
  rosters,
  weekNumber,
}: {
  leagueId: string;
  rosters: Roster[] | undefined;
  weekNumber: string;
}) {
  const users = await getUsers({ leagueId });
  const matchups = await getMatchups({ leagueId, weekNumber });

  const results = matchups.map((roster) => {
    const { players_points, points, roster_id } = roster;
    const userId = rosters?.find((r) => r.roster_id === roster_id)?.owner_id;
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
      benchPoints: Math.round(100 * benchPoints) / 100,
      displayName: display_name,
      points,
    };
  });

  return {
    benches: [...results].sort((a, b) => b.benchPoints - a.benchPoints),
    starters: [...results].sort((a, b) => b.points - a.points),
  };
}

function Main() {
  const { isLoadingRosters, leagueId, rosters, setLeagueId } = useRosters();
  const [weekNumber, setWeekNumber] = useState('1');
  const { losses, ties, wins } = rosters?.[0]?.settings || {};
  const currentWeekNumber = Math.min(
    Math.max(1, (wins || 0) + (ties || 0) + (losses || 0)), // calculate the current week based on games played
    14, // max number of weeks, so we don't go out of bounds
  );

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

          const formControlsCollection = event.currentTarget.elements;
          const leagueId = formControlsCollection.namedItem(
            'leagueId',
          ) as HTMLInputElement;

          setLeagueId(leagueId.value);
        }}
        style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}
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
          alignItems: 'center',
          display: 'flex',
          gap: '1rem',
          margin: '1.5rem 0',
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

function Scores({
  isLoadingRosters,
  leagueId,
  rosters,
  weekNumber,
}: {
  isLoadingRosters: boolean;
  leagueId: string;
  rosters: Roster[] | undefined;
  weekNumber: string;
}) {
  const { isLoadingRosterPoints, rosterPoints } = useRosterPoints({
    leagueId,
    rosters,
    weekNumber,
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
          rosterPoints?.starters.map(
            ({ avatar, displayName, points }, index) => {
              return (
                <div
                  key={index}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
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
          ) || <div>Data not found...</div>
        )}
      </div>
      <div>
        <h2>Benches</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          rosterPoints?.benches.map(
            ({ avatar, benchPoints, displayName }, index) => {
              return (
                <div
                  key={index}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
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
          ) || <div>Data not found...</div>
        )}
      </div>
    </div>
  );
}

function useRosterPoints({
  leagueId,
  rosters,
  weekNumber,
}: {
  leagueId: string;
  rosters: Roster[] | undefined;
  weekNumber: string;
}) {
  const { data, isLoading } = useQuery({
    enabled: !!leagueId && !!rosters?.length,
    queryFn: async () => {
      return fetchScores({ leagueId, rosters, weekNumber });
    },

    queryKey: ['points', { leagueId, rosters, weekNumber }],

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
  const { data: rosters, isLoading: isLoadingRosters } = useQuery<Roster[]>({
    enabled: !!leagueId,
    queryFn: () => getRosters({ leagueId }),
    queryKey: ['rosters', { leagueId }],

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
