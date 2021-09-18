const fs = require('fs');
const { teams } = require('../data/teams-2021');

const nextYearTeams = teams.map(({ manager, team }) => {
  return {
    manager,
    team: team.map(({ player, cost, yearsPlayed, isSelectedKeeper }) => {
      return {
        player,
        cost: Math.round(cost + cost * 0.2),
        yearsPlayed: yearsPlayed + 1,
        isSelectedKeeper,
      };
    }),
  };
});

const nextYear = new Date().getFullYear() + 1;
const newFile = `../data/teams-${nextYear}.js`;

fs.writeFile(newFile, JSON.stringify(nextYearTeams, null, 2), (err) => {
  if (err) {
    console.log(err);
  }
});
