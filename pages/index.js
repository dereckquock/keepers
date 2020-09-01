import Head from 'next/head';
import styles from '../styles/Home.module.css';
import teams from '../data/teams-2020';

// map managers to props
const managers = [
  'dereck',
  'myd',
  'marc',
  'dru',
  'lim',
  'ejay',
  'ray',
  'aaron',
  'kevin',
  'ry1t',
  'bikey mrown',
  'fatima',
].map((manager, index) => ({
  key: manager,
  manager,
  value: manager,
  players: teams[index + 1],
}));

function Team({ manager, players }) {
  return (
    <div>
      <h2 style={{ marginTop: '2.5rem' }}>{manager}</h2>
      {players.map(({ player, cost }) => (
        <div key={player} className={styles.player}>
          <div>{player}</div>
          <div>${cost}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [filter, setFilter] = React.useState('');

  return (
    <div className={styles.container}>
      <Head>
        <title>Keepers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>{`${new Date().getFullYear()} KEEPERS`}</h1>

        <select
          className={styles.dropdown}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">Filter manager</option>
          {managers.map(({ manager }) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>

        <section>
          {managers
            .filter(({ manager }) => (filter ? manager === filter : true))
            .map((props) => (
              <Team {...props} />
            ))}
        </section>
      </main>
    </div>
  );
}
