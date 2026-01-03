import { getPlayers } from '../../queries/getPlayers';
import { getUsers } from '../../queries/getUsers';
import { Team } from './Team';

export async function Rosters({
  currentLeagueId,
  previousLeagueId,
}: {
  currentLeagueId: string;
  previousLeagueId: string;
}) {
  const users = await getUsers({ leagueId: currentLeagueId });
  const players = await getPlayers();

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
          currentLeagueId={currentLeagueId}
          key={user.display_name}
          players={players}
          previousLeagueId={previousLeagueId}
          user={user}
        />
      ))}
    </section>
  );
}
