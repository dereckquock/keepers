import Image from 'next/image';
import Link from 'next/link';

import { getBiggestRegularSeasonBlowoutWinner } from '../../../queries/getBiggestRegularSeasonBlowoutWinner';
import { getClosestRegularSeasonWin } from '../../../queries/getClosestRegularSeasonWin';
import { getEasiestRegularSeasonSchedule } from '../../../queries/getEasiestRegularSeasonSchedule';
import { getHardestRegularSeasonSchedule } from '../../../queries/getHardestRegularSeasonSchedule';
import { getLeague } from '../../../queries/getLeague';
import { getLongestRegularSeasonWinStreak } from '../../../queries/getLongestRegularSeasonWinStreak';
import { getTopRegularSeasonScorer } from '../../../queries/getTopRegularSeasonScorer';
import { getTopRegularSeasonWeeklyScorer } from '../../../queries/getTopRegularSeasonWeeklyScorer';
import styles from '../../../styles/Home.module.css';

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
  const keepersHref = normalizedPreviousLeagueId
    ? `/${normalizedPreviousLeagueId}/${currentLeagueId}/keepers`
    : '';
  const pointsHref = `/${previousLeagueId}/${currentLeagueId}/points`;
  const [
    league,
    topScorer,
    topWeeklyScorer,
    longestWinStreak,
    biggestBlowoutWinner,
    closestWin,
    hardestSchedule,
    easiestSchedule,
  ] = currentLeagueId
    ? await Promise.all([
        getLeague({ leagueId: currentLeagueId }),
        getTopRegularSeasonScorer({ leagueId: currentLeagueId }),
        getTopRegularSeasonWeeklyScorer({ leagueId: currentLeagueId }),
        getLongestRegularSeasonWinStreak({ leagueId: currentLeagueId }),
        getBiggestRegularSeasonBlowoutWinner({ leagueId: currentLeagueId }),
        getClosestRegularSeasonWin({ leagueId: currentLeagueId }),
        getHardestRegularSeasonSchedule({ leagueId: currentLeagueId }),
        getEasiestRegularSeasonSchedule({ leagueId: currentLeagueId }),
      ])
    : [null, null, null, null, null, null, null, null];
  const leagueAvatarUrl = league?.avatar
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : undefined;

  return (
    <div className={styles.container}>
      <main>
        <header className={styles.header}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            {leagueAvatarUrl ? (
              <Image
                alt={`${league?.name ?? 'League'} avatar`}
                className={styles.avatar}
                height={50}
                src={leagueAvatarUrl}
                width={50}
              />
            ) : (
              <div
                style={{
                  alignItems: 'center',
                  background: 'var(--black)',
                  borderRadius: '25px',
                  display: 'flex',
                  height: 50,
                  justifyContent: 'center',
                  width: 50,
                }}
              >
                🏈
              </div>
            )}
            <h1>{league?.name ?? 'League Home'}</h1>
          </div>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}
          >
            {keepersHref ? (
              <Link
                className="button"
                href={keepersHref}
              >
                🏈 Keepers
              </Link>
            ) : null}
            <Link
              className="button"
              href={pointsHref}
            >
              💯 Points
            </Link>
          </div>
        </header>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Regular Season Top Scorer (Weeks 1-14)
          </h2>
          {topScorer ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {topScorer.avatarUrl ? (
                <Image
                  alt={`${topScorer.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={topScorer.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {topScorer.displayName}
                </span>
                {topScorer.teamName ? (
                  <span style={{ color: 'var(--gold)' }}>
                    {topScorer.teamName}
                  </span>
                ) : null}
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                {topScorer.points.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No regular season scoring data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Longest Win Streak (Weeks 1-14)</h2>
          {longestWinStreak ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {longestWinStreak.avatarUrl ? (
                <Image
                  alt={`${longestWinStreak.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={longestWinStreak.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {longestWinStreak.displayName}
                </span>
                {longestWinStreak.teamName ? (
                  <span style={{ color: 'var(--gold)' }}>
                    {longestWinStreak.teamName}
                  </span>
                ) : null}
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                {longestWinStreak.streak} wins
              </span>
            </div>
          ) : (
            <p>No win streak data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Top Scorer in Any Single Week (Weeks 1-14)
          </h2>
          {topWeeklyScorer ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {topWeeklyScorer.avatarUrl ? (
                <Image
                  alt={`${topWeeklyScorer.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={topWeeklyScorer.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {topWeeklyScorer.displayName}
                </span>
                <span style={{ color: 'var(--gold)' }}>
                  {topWeeklyScorer.teamName
                    ? `${topWeeklyScorer.teamName} • `
                    : ''}
                  Week {topWeeklyScorer.weekNumber}
                </span>
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                {topWeeklyScorer.points.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No weekly scoring data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Biggest Blowout (Weeks 1-14)</h2>
          {biggestBlowoutWinner ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {biggestBlowoutWinner.avatarUrl ? (
                <Image
                  alt={`${biggestBlowoutWinner.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={biggestBlowoutWinner.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {biggestBlowoutWinner.displayName}
                </span>
                <span style={{ color: 'var(--gold)' }}>
                  {biggestBlowoutWinner.teamName
                    ? `${biggestBlowoutWinner.teamName} • `
                    : ''}
                  Week {biggestBlowoutWinner.weekNumber}
                </span>
                <span style={{ color: 'var(--light)' }}>
                  {biggestBlowoutWinner.winnerPoints.toFixed(2)}-
                  {biggestBlowoutWinner.loserPoints.toFixed(2)}
                </span>
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                +{biggestBlowoutWinner.margin.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No blowout data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Closest Win (Weeks 1-14)</h2>
          {closestWin ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {closestWin.avatarUrl ? (
                <Image
                  alt={`${closestWin.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={closestWin.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {closestWin.displayName}
                </span>
                <span style={{ color: 'var(--gold)' }}>
                  {closestWin.teamName ? `${closestWin.teamName} • ` : ''}
                  Week {closestWin.weekNumber}
                </span>
                <span style={{ color: 'var(--light)' }}>
                  {closestWin.winnerPoints.toFixed(2)}-
                  {closestWin.loserPoints.toFixed(2)}
                </span>
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                +{closestWin.margin.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No close-win data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Hardest Schedule (Most Points Against)
          </h2>
          {hardestSchedule ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {hardestSchedule.avatarUrl ? (
                <Image
                  alt={`${hardestSchedule.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={hardestSchedule.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {hardestSchedule.displayName}
                </span>
                {hardestSchedule.teamName ? (
                  <span style={{ color: 'var(--gold)' }}>
                    {hardestSchedule.teamName}
                  </span>
                ) : null}
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                {hardestSchedule.pointsAgainst.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No strength of schedule data found yet.</p>
          )}
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Easiest Schedule (Fewest Points Against)
          </h2>
          {easiestSchedule ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              {easiestSchedule.avatarUrl ? (
                <Image
                  alt={`${easiestSchedule.displayName} avatar`}
                  className={styles.avatar}
                  height={50}
                  src={easiestSchedule.avatarUrl}
                  width={50}
                />
              ) : (
                <div
                  style={{
                    alignItems: 'center',
                    background: 'var(--black)',
                    borderRadius: '25px',
                    display: 'flex',
                    height: 50,
                    justifyContent: 'center',
                    width: 50,
                  }}
                >
                  🏈
                </div>
              )}
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {easiestSchedule.displayName}
                </span>
                {easiestSchedule.teamName ? (
                  <span style={{ color: 'var(--gold)' }}>
                    {easiestSchedule.teamName}
                  </span>
                ) : null}
              </div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                {easiestSchedule.pointsAgainst.toFixed(2)}
              </span>
            </div>
          ) : (
            <p>No strength of schedule data found yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
