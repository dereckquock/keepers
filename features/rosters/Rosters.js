'use client';

import { useState } from 'react';
import styles from '../../styles/Home.module.css';
import { useUsers } from '../queries/useUsers';
import { Team } from './Team';

export function Rosters() {
  const { isLoadingUsers, users } = useUsers({
    leagueId: '784354698986725376',
  });
  const [filter, setFilter] = useState('');

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
