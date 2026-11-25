# Ember & Thyme — Rush-Hour Kitchen

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-orange)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![make.fun entry](https://img.shields.io/badge/make.fun-entry-blue)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete, original cooking game built for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). It runs offline in a desktop browser from static files — no build step, no network requests, no copied art, music or names.

## The game

You are the only chef in a small kitchen on the busiest night of the year. Orders fly onto the board with a countdown on every ticket. Run the kitchen:

- **Grab** ingredients from the pantry — buns, patties, tomato, lettuce, cheese, onion.
- **Chop** tomato, lettuce and onion on the chopping board (hold E).
- **Grill** patties — pull them off in time or they burn.
- **Plate** dishes on the assembly counter from five recipes on the menu.
- **Serve** finished plates at the red window before the ticket runs out. Fast serves earn tips.

A 3-minute shift, 3 hearts, and a rush hour in the last 30 seconds when orders come faster and patience runs thinner. Earn $40 for one star, $80 for two, $120 for three.

## Controls

- **WASD / arrow keys** — move the chef
- **E / Space / click** — use the nearest station (hold E to chop)
- **P / Esc** — pause · **M** — toggle music

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `game/` — the playable game (static files, `index.html` + `src/`)
  - `src/config.js` — constants, ingredients, recipes, station layout
  - `src/kitchen.js` — the kitchen: orders, chopping, grilling, plating, serving, scoring
  - `src/render.js` — everything drawn on the canvas
  - `src/input.js` — keyboard + mouse
  - `src/audio.js` — synthesized sounds and music (WebAudio, no audio files)
  - `src/shots.js` — staged screenshot scenes
  - `src/random.js` — seeded random
- `main.ts` — the make.fun hand-in program (Node 22)
- `screenshots/` — real renders of the game in a browser
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
