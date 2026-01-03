'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from '../styles/Home.module.css';

export default function Page() {
  const router = useRouter();
  const [previousLeagueId, setPreviousLeagueId] = useState('');
  const [currentLeagueId, setCurrentLeagueId] = useState('');

  return (
    <div className={styles.container}>
      <main>
        <header className={styles.header}>
          <h1>Keepers</h1>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const previousId = previousLeagueId.trim();
            const currentId = currentLeagueId.trim();

            if (!currentId) {
              return;
            }

            const currentSegment = encodeURIComponent(currentId);
            const previousSegment = encodeURIComponent(previousId || 'none');
            router.push(`/${previousSegment}/${currentSegment}`);
          }}
          style={{ display: 'grid', gap: '2rem', maxWidth: 480 }}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label htmlFor="currentLeagueId">Current league ID</label>
            <input
              className={styles.formControl}
              id="currentLeagueId"
              inputMode="numeric"
              onChange={(event) => setCurrentLeagueId(event.target.value)}
              placeholder="Enter current league ID"
              required
              type="text"
              value={currentLeagueId}
            />
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label htmlFor="previousLeagueId">
              Previous league ID (optional)
            </label>
            <input
              className={styles.formControl}
              id="previousLeagueId"
              inputMode="numeric"
              onChange={(event) => setPreviousLeagueId(event.target.value)}
              placeholder="Enter previous league ID"
              type="text"
              value={previousLeagueId}
            />
          </div>
          <button
            className="button"
            style={{ justifySelf: 'start' }}
            type="submit"
          >
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
