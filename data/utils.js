export function getTeams(players) {
  let team = 1;
  let number = -1;

  const teams = players.reduce((map, player) => {
    number++;

    if (number === 14) {
      team += 1;
      number = 0;
    }

    if (map[team]) {
      map[team].push(player);
    } else {
      map[team] = [player];
    }

    return map;
  }, {});

  return teams;
}
