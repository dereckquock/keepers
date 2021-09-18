import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useQuery, useMutation } from 'react-query';
import styles from '../styles/Home.module.css';

async function fetchHotBench({ leagueId, weekNumber }) {
  const matchups = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${weekNumber}`
  ).then((res) => res.json());
  const rosters = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`
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
      benchPoints,
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

function HotBench({ leagueId, weekNumber }) {
  const { isLoading, data } = useQuery(
    ['bench', { leagueId, weekNumber }],
    async () => {
      const bench = await fetchHotBench({ leagueId, weekNumber });

      return bench;
    },
    { enabled: !!leagueId }
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
              {points}
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
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
          </select>
        </div>

        <HotBench leagueId={leagueId} weekNumber={weekNumber} />
      </main>
    </div>
  );
}
