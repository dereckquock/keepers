'use server';

import * as cheerio from 'cheerio';
import { cache } from 'react';

import {
  type AuctionValueRow,
  buildAuctionValueIndex,
} from '../features/keepers/auctionValues';
import { ONE_DAY_IN_SECONDS } from './constants';

export const getAuctionDraftValues = cache(async () => {
  const response = await fetch(
    'https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1',
    { next: { revalidate: ONE_DAY_IN_SECONDS } },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch auction draft values');
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const rows = Array.from($('#OverallTable > tbody > tr')).map<AuctionValueRow>(
    (item) => {
      // the cell reads like "Ja'Marr Chase (CIN - WR)"
      const nameCell = $(item).find('td:nth-child(2)').text() || '';
      const [, details = ''] = /\(([^)]*)\)/.exec(nameCell) ?? [];
      const [team = '', position = ''] = details
        .split('-')
        .map((part) => part.trim());

      return {
        name: nameCell.replace(/\(.*/, '').trim(),
        position,
        team,
        value: parseInt(
          $(item).find('.RealValue').text().replace(/[^0-9]/g, ''),
          10,
        ),
      };
    },
  );

  return buildAuctionValueIndex(rows);
});
