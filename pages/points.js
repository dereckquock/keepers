import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation } from 'react-query';
import styles from '../styles/Home.module.css';

async function fetchScores({ leagueId, weekNumber, rosters, users }) {
  const matchups = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`
  ).then((res) => res.json());

  const results = matchups.map((roster) => {
    const { roster_id, starters, players_points, points } = roster;
    const userId = rosters.find((r) => r.roster_id === roster_id)?.owner_id;
    const { avatar, display_name } =
      users.find((user) => user.user_id === userId) || {};
    const fullRosterPoints = Object.values(players_points).reduce(
      (total, points) => total + points,
      0
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

function Scores({ leagueId, weekNumber, rosters, users }) {
  const { isLoading, data } = useQuery(
    ['points', { leagueId, weekNumber }],
    async () => {
      return fetchScores({
        leagueId,
        weekNumber,
        rosters,
        users,
      });
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
    <div
      style={{
        display: 'flex',
        gap: '4rem',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h2>Starters</h2>
        {data.starters.map(({ avatar, displayName, points }, index) => {
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
      <div>
        <h2>Benches</h2>
        {data.benches.map(({ avatar, displayName, benchPoints }, index) => {
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
                {benchPoints.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TopPoints() {
  const [leagueId, setLeagueId] = useState('721172044753993728');
  const { isLoading: isLoadingUsers, data: users } = useQuery(
    ['users', { leagueId }],
    async () => {
      const users = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/users`
      ).then((res) => res.json());

      return users;
    },
    { enabled: !!leagueId }
  );
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
  const [weekNumber, setWeekNumber] = useState(1);
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
        <h1 className={styles.title}>
          🔥 Points &amp; Benches (╯°□°)╯︵ ┻━┻ 🔥
        </h1>
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
              [...Array(14).keys()].map((index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))
            )}
          </select>
        </div>

        {isLoadingUsers || isLoadingRosters ? (
          'Loading...'
        ) : (
          <Scores
            leagueId={leagueId}
            weekNumber={weekNumber}
            rosters={rosters}
            users={users}
          />
        )}
      </main>
    </div>
  );
}
