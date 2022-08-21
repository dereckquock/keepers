const fs = require('fs');
const { players } = require('../data/players-2021');

const nextYearsPlayers = players.reduce((playerMap, { player, cost }) => {
  playerMap[player] = Math.round(cost + cost * 0.4);
  return playerMap;
}, {});

const nextYear = '../data/players-2022.js';

fs.writeFile(nextYear, JSON.stringify(nextYearsPlayers, null, 2), (err) => {
  if (err) {
    console.log(err);
  }
});
