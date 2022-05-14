import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRosterPoints } from '../queries/useRosterPoints';
import { useRosters } from '../queries/useRosters';
import styles from '../styles/Home.module.css';

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
            }
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
            }
          )
        )}
      </div>
    </div>
  );
}

export default function TopPoints() {
  const { initialLeagueId, isLoadingRosters, leagueId, rosters, setLeagueId } =
    useRosters();
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
          🔥💰 Points &amp; Benches (╯°□°)╯︵ ┻━┻ 💰🔥
        </h1>
        <form
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          onSubmit={(event) => {
            event.preventDefault();
            setLeagueId(event.currentTarget.elements.leagueId.value);
          }}
        >
          <label htmlFor="leagueId" style={{ marginRight: 10 }}>
            League ID
          </label>
          <input
            className={styles.formControl}
            defaultValue={initialLeagueId}
            id="leagueId"
            name="leagueId"
            placeholder="Enter League ID"
            style={{ textAlign: 'center' }}
            type="tel"
          />
          <input
            className="button"
            type="submit"
            value="Submit"
            aria-label="Submit"
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

        <Scores
          isLoadingRosters={isLoadingRosters}
          leagueId={leagueId}
          weekNumber={weekNumber}
          rosters={rosters}
        />
      </main>
    </div>
  );
}
