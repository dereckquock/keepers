import Link from 'next/link';

import { Rosters } from '../../../../features/rosters/Rosters';
import styles from '../../../../styles/Home.module.css';

export default async function Page({
  params,
}: {
  params: Promise<{ currentLeagueId: string; previousLeagueId: string }>;
}) {
  const { currentLeagueId, previousLeagueId } = await params;
  const normalizedPreviousLeagueId =
    previousLeagueId && previousLeagueId !== 'none'
      ? previousLeagueId
      : undefined;
  const leagueHomeHref = `/${previousLeagueId}/${currentLeagueId}`;

  return (
    <div className={styles.container}>
      <main>
        <header>
          <Link
            className="button"
            href={leagueHomeHref}
          >
            🏠 League Home
          </Link>
          <h1>Keepers</h1>
        </header>
        {normalizedPreviousLeagueId ? (
          <Rosters
            currentLeagueId={currentLeagueId}
            previousLeagueId={normalizedPreviousLeagueId}
          />
        ) : (
          <p>Previous league ID required to view keepers.</p>
        )}
      </main>
    </div>
  );
}
