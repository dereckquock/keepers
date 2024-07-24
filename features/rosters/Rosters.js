import { Team } from './Team';

async function getUsers({ leagueId }) {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`,
    { next: { revalidate: 172800000 } }, // 2 days
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
  const users = await getUsers({ leagueId: '784354698986725376' });
  const players = await getPlayers();

  return (
    <>
      <section>
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
