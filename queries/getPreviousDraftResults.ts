'use server';

import { cache } from 'react';

import { type DraftPick, type DraftResults } from '../types';
import { ONE_DAY_IN_SECONDS } from './constants';

export const getPreviousDraftResults = cache(
  async ({ previousLeagueId }: { previousLeagueId: string }) => {
    const draftsResponse = await fetch(
      `https://api.sleeper.app/v1/league/${previousLeagueId}/drafts`,
      { next: { revalidate: ONE_DAY_IN_SECONDS } },
    );

    if (!draftsResponse.ok) {
      throw new Error('Failed to fetch drafts');
    }

    const drafts = (await draftsResponse.json()) as DraftResults[];
    const previousDraft = findMostRecentDraft(drafts);

    if (!previousDraft) {
      return [];
    }

    const previousDraftPicksResponse = await fetch(
      `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`,
      { next: { revalidate: ONE_DAY_IN_SECONDS } },
    );

    if (!previousDraftPicksResponse.ok) {
      throw new Error('Failed to fetch picks');
    }

    return (await previousDraftPicksResponse.json()) as DraftPick[];
  },
);

/**
 * A league can hold more than one draft, and Sleeper doesn't promise an order,
 * so pick the latest completed one instead of trusting the array position.
 */
function findMostRecentDraft(drafts: DraftResults[]) {
  const completedDrafts = drafts.filter(({ status }) => status === 'complete');
  const candidates = completedDrafts.length > 0 ? completedDrafts : drafts;

  return candidates
    .toSorted(
      (a, b) => (b.start_time || b.created) - (a.start_time || a.created),
    )
    .at(0);
}
