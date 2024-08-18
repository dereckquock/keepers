import { currentLeagueId } from './constants';
import { Team } from './Team';

async function getUsers({ leagueId }) {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`,
    { next: { revalidate: 86400000 } }, // 1 day
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

async function getPlayers() {
  const response = await fetch('https://api.sleeper.app/v1/players/nfl');

  if (!response.ok) {
    throw new Error('Failed to fetch players');
  }

  return response.json();
}

export async function Rosters() {
  const users = await getUsers({ leagueId: currentLeagueId });
  const players = await getPlayers();

  return (
    <>
      <section>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {users.map(({ user_id, display_name }) => {
            return (
              <a
                key={user_id}
                href={`#${user_id}`}
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
        {users.map((data) => (
          <Team
            key={data.display_name}
            players={players}
            {...data}
          />
        ))}
      </section>
    </>
  );
}
