import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation } from 'react-query';
import styles from '../styles/Home.module.css';

async function fetchHotBench({ leagueId, weekNumber, rosters }) {
  const matchups = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`
  ).then((res) => res.json());
  const users = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`
  ).then((res) => res.json());

  const results = matchups.reduce((rosterMap, roster) => {
    const { roster_id, starters, players_points } = roster;
    const userId = rosters.find((r) => r.roster_id === roster_id)?.owner_id;
    const { avatar, display_name } =
      users.find((user) => user.user_id === userId) || {};

    // filter out the starters to get the bench players
    const bench = Object.entries(players_points).filter(
      ([key]) => !starters.includes(key.toString())
    );

    // sum the bench players' points
    const benchPoints = bench.reduce((points, [, value]) => points + value, 0);

    rosterMap[roster_id] = {
      ...rosterMap[roster_id],
      avatar: `https://sleepercdn.com/avatars/thumbs/${avatar}`,
      displayName: display_name,
      benchPoints: Math.round(100 * benchPoints) / 100,
    };

    return rosterMap;
  }, {});

  const sortedResults = Object.entries(results)
    .sort(
      ([, { benchPoints: benchA }], [, { benchPoints: benchB }]) =>
        benchB - benchA
    )
    .map(([, { avatar, displayName, benchPoints }]) => ({
      avatar,
      displayName,
      points: benchPoints,
    }));

  return sortedResults;
}

function HotBench({ leagueId, weekNumber, rosters }) {
  const { isLoading, data } = useQuery(
    ['bench', { leagueId, weekNumber }],
    async () => {
      const bench = await fetchHotBench({ leagueId, weekNumber, rosters });

      return bench;
    },
    { enabled: !!leagueId && rosters.length > 0 }
  );

  if (!leagueId) {
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map(({ avatar, displayName, points }, index) => {
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
              src={avatar}
              alt="Avatar image"
              width={50}
              height={50}
              className={styles.avatar}
            />
            <span style={{ fontSize: '1.25rem' }}>{displayName}</span> —
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {points.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Benches() {
  const [leagueId, setLeagueId] = useState('721172044753993728');
  const [weekNumber, setWeekNumber] = useState(1);
  const { isLoading: isLoadingRosters, data: rosters } = useQuery(
    ['rosters', { leagueId }],
    async () => {
      const data = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`
      ).then((res) => res.json());

      return data;
    },
    { enabled: !!leagueId }
  );
  const { wins, ties, losses } = rosters?.[0]?.settings || {};
  const currentWeekNumber = Math.max(1, wins + ties + losses);

  // set the current week number once we fetch the rosters and can calculate the current week based on games played
  useEffect(() => {
    if (currentWeekNumber) {
      setWeekNumber(currentWeekNumber);
    }
  }, [currentWeekNumber]);

  return (
    <div className={styles.container}>
      <Head>
        <title>🔥 (╯°□°)╯︵ ┻━┻ 🔥</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>🔥 Hot Benches (╯°□°)╯︵ ┻━┻ 🔥</h1>
        <div>
          <label htmlFor="leagueId" style={{ marginRight: 10 }}>
            League ID
          </label>
          <input
            type="tel"
            id="leagueId"
            name="leagueId"
            className={styles.formControl}
            placeholder="Enter League ID"
            value={leagueId}
            onChange={({ currentTarget }) => setLeagueId(currentTarget.value)}
          />
        </div>

        <div style={{ margin: '1.5rem 0' }}>
          <label htmlFor="week" style={{ marginRight: 10 }}>
            Week number
          </label>
          <select
            id="week"
            name="week"
            className={styles.formControl}
            value={weekNumber}
            onChange={({ currentTarget }) => setWeekNumber(currentTarget.value)}
          >
            {isLoadingRosters ? (
              <option value="loading">Loading...</option>
            ) : (
              [...Array(17).keys()].map((index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))
            )}
          </select>
        </div>

        {isLoadingRosters ? (
          'Loading...'
        ) : (
          <HotBench
            leagueId={leagueId}
            weekNumber={weekNumber}
            rosters={rosters}
          />
        )}
      </main>
    </div>
  );
}
