'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Link from 'next/link';
import { useState } from 'react';
import { Rosters } from '../../features/rosters/Rosters';
import styles from '../../styles/Home.module.css';

export default function Page() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 20 * 1000, // 20 seconds
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
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
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
