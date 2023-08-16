import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

export async function GET() {
  const html = await fetch(
    'https://draftwizard.fantasypros.com/editor/createFromProjections.jsp?sport=nfl&scoringSystem=HALF&showAuction=Y&teams=12&tb=200&QB=1&RB=2&WR=2&TE=1&DST=1&K=1&BN=5&WR/RB/TE=1',
  ).then((res) => res.text());
  const $ = cheerio.load(html);
  const tableItems = $('#OverallTable > tbody > tr');

  const playerValues = Array.from(tableItems).reduce((playerMap, item) => {
    const nameWithInfo = $(item).find('td:nth-child(2)').text() || '';
    const nameWithoutExtras = nameWithInfo
      .replace('Jr.', '')
      .replace('Sr.', '')
      .replace(/I/g, '');
    const name = nameWithoutExtras.replace(/\(.+/, '').trim();
    const value = $(item).find('.RealValue').text();

    return {
      ...playerMap,
      [name]: parseInt(value, 10),
    };
  }, {});

  return NextResponse.json({ playerValues });
}
