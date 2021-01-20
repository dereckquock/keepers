# 🏈 View keeper costs for our Yahoo Fantasy Football league

built with [Next.js](https://nextjs.org/)

## Get all players from team rosters

Go to `/starters` or `League` -> `Rosters`

```js
JSON.stringify(
  Array.from(document.querySelectorAll('.ysf-player-name .name')).map(
    (node) => node.innerHTML
  )
);
```

## Updating team costs and keeper statuses

```js
const teams = lastYearTeams.map(({ manager, team }) => {
  return {
    manager,
    team: team.map(({ player, cost, yearsPlayed }) => {
      return {
        player,
        cost: Math.round(cost + cost * 0.2),
        yearsPlayed: yearsPlayed + 1,
      };
    }),
  };
});
```
