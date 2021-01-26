import React from 'react';
import Head from 'next/head';
import classNames from 'classnames';
import styles from '../styles/Home.module.css';
import { teams } from '../data/teams-2021';

function Team({ manager, team }) {
  return (
    <div>
      <h2 style={{ marginTop: '2.5rem' }}>{manager}</h2>
      {team.map(({ player, cost, yearsPlayed }) => {
        const cantKeep = yearsPlayed > 2;
        const keepsLeft = 3 - yearsPlayed;

        return (
          <div
            key={player}
            className={classNames(styles.player, {
              [styles.cantKeep]: cantKeep,
            })}
          >
            <div>{player}</div>
            <div className={styles.keeps}>
              {cantKeep
                ? 'no keeping!'
                : `${keepsLeft} mo' ${keepsLeft > 1 ? 'keeps' : 'keep'}`}
            </div>
            <div className={styles.cost}>${cost ?? 'TBD'}</div>
          </div>
        );
      })}
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

        <label htmlFor="filter" style={{ marginRight: 10 }}>
          Filter manager
        </label>
        <select
          id="filter"
          className={styles.dropdown}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">All managers</option>
          {teams.map(({ manager }) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>

        <section>
          {teams
            .filter(({ manager }) => (filter ? manager === filter : true))
            .map((data) => (
              <Team key={data.manager} {...data} />
            ))}
        </section>
      </main>
    </div>
  );
}
