import { getAuctionDraftValues } from '../../queries/getAuctionDraftValues';
import { getPlayers } from '../../queries/getPlayers';
import { getPreviousDraftResults } from '../../queries/getPreviousDraftResults';
import { getRosters } from '../../queries/getRosters';
import { getTransactions } from '../../queries/getTransactions';
import { getUsers } from '../../queries/getUsers';
import {
  getPlayerIdsThatChangedRosters,
  getTeamKeepers,
} from '../keepers/keeperCost';
import { Team } from './Team';

export async function Rosters({
  currentLeagueId,
  previousLeagueId,
}: {
  currentLeagueId: string;
  previousLeagueId: string;
}) {
  const [
    users,
    players,
    rosters,
    previousDraftPicks,
    auctionValueIndex,
    previousSeasonTransactions,
  ] = await Promise.all([
    getUsers({ leagueId: currentLeagueId }),
    getPlayers(),
    getRosters({ leagueId: currentLeagueId }),
    getPreviousDraftResults({ previousLeagueId }),
    getAuctionDraftValues(),
    getTransactions({ leagueId: previousLeagueId }),
  ]);
  const playerIdsThatChangedRosters = getPlayerIdsThatChangedRosters(
    previousSeasonTransactions,
  );

  return (
    <section>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {users.map(({ display_name, user_id }) => {
          return (
            <a
              href={`#${user_id}`}
              key={user_id}
              style={{
                color: 'var(--gold)',
                textDecoration: 'underline',
              }}
            >
              {display_name}
            </a>
          );
        })}
      </div>
      {users.map((user) => (
        <Team
          keepers={getTeamKeepers({
            auctionValueIndex,
            ownerId: user.user_id,
            playerIdsThatChangedRosters,
            players,
            previousDraftPicks,
            roster: rosters.find(({ owner_id }) => owner_id === user.user_id),
          })}
          key={user.user_id}
          user={user}
        />
      ))}
    </section>
  );
}
