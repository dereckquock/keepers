import Link from 'next/link';
import { Rosters } from '../../features/rosters/Rosters';
import styles from '../../styles/Home.module.css';

export default function Page() {
  return (
    <div className={styles.container}>
      <main>
        <header className={styles.header}>
          <h1>KEEPERS</h1>
          <Link
            className="button"
            href="/points"
          >
            🔥💯 Top Scorers 👉
          </Link>
        </header>
        <Rosters />
      </main>
    </div>
  );
}
