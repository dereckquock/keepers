'use server';

import { cache } from 'react';

import { previousLeagueId } from '../features/rosters/constants';
import { type DraftPick, type DraftResults } from '../types';

export const getPreviousDraftResults = cache(
  async ({ user_id }: { user_id: string }) => {
    const draftsResponse = await fetch(
      `https://api.sleeper.app/v1/league/${previousLeagueId}/drafts`,
      { next: { revalidate: 86400000 } }, // 1 day
    );

    if (!draftsResponse.ok) {
      throw new Error('Failed to fetch drafts');
    }

    const drafts = (await draftsResponse.json()) as DraftResults[];
    const previousDraft = drafts.at(-1);

    if (!previousDraft) {
      return [];
    }

    const previousDraftPicksResponse = await fetch(
      `https://api.sleeper.app/v1/draft/${previousDraft.draft_id}/picks`,
      { next: { revalidate: 86400000 } }, // 1 day
    );

    if (!previousDraftPicksResponse.ok) {
      throw new Error('Failed to fetch picks');
    }

    const previousDraftPicks =
      (await previousDraftPicksResponse.json()) as DraftPick[];

    if (!user_id) return previousDraftPicks;

    return previousDraftPicks.filter(({ picked_by }) => picked_by === user_id);
  },
);
