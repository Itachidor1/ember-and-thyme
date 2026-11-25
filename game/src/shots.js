// The screenshot scenes behind ?shot=cover|assembly|serve|rush. Each one sets the real
// kitchen state directly — chef, hands, plate, grill, board and order tickets — and the
// real renderer paints it, so every shot is a genuine frame of the game itself, the same
// for a given seed.
import { RECIPES } from './config.js';
import { SCREEN_PLAY } from './render.js';

function order(id, recipeId, patience, maxPatience) {
  return {
    id,
    recipe: RECIPES.find((r) => r.id === recipeId),
    patience,
    maxPatience,
  };
}

/** Set `kitchen` to the named scene and return the screen to draw over it. */
export function stageShot(name, kitchen) {
  const s = kitchen.state;
  kitchen.reset();
  if (name === 'assembly') {
    s.chef.x = 560;
    s.chef.y = 260;
    s.hands = ['chopped tomato'];
    s.board.item = 'tomato';
    s.board.progress = 0.55;
    s.plate = ['bun', 'grilled patty'];
    s.orders = [order(7, 'ember-burger', 38, 52), order(8, 'garden-stack', 44, 52)];
    s.coins = 22;
    s.served = 2;
    s.timeLeft = 132;
    s.elapsed = 48;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'serve') {
    s.chef.x = 1140;
    s.chef.y = 740;
    s.hands = ['plate:ember-burger'];
    s.grill.item = 'patty';
    s.grill.progress = 0.6;
    s.orders = [order(11, 'ember-burger', 24, 52), order(12, 'melt-deluxe', 41, 48)];
    s.coins = 58;
    s.served = 5;
    s.timeLeft = 96;
    s.elapsed = 84;
    s.lastServe = { dish: 'Garden Stack', earned: 14, tip: 4 };
    return { screen: SCREEN_PLAY };
  }
  if (name === 'rush') {
    s.chef.x = 1150;
    s.chef.y = 260;
    s.hands = ['grilled patty', 'cheese'];
    s.grill.item = 'patty';
    s.grill.cooked = true;
    s.grill.progress = 0.8;
    s.plate = ['bun', 'chopped onion'];
    s.orders = [
      order(21, 'melt-deluxe', 9, 40),
      order(22, 'double-ember', 14, 40),
      order(23, 'garden-stack', 21, 44),
      order(24, 'crispy-green', 6, 36),
    ];
    s.coins = 96;
    s.served = 9;
    s.timeLeft = 24;
    s.elapsed = 156;
    s.rush = true;
    return { screen: SCREEN_PLAY };
  }
  // cover: the full kitchen in play — orders up, a dish mid-assembly, the grill going.
  s.chef.x = 640;
  s.chef.y = 580;
  s.hands = ['chopped tomato'];
  s.board.item = 'lettuce';
  s.board.progress = 0.4;
  s.grill.item = 'patty';
  s.grill.progress = 0.55;
  s.plate = ['bun', 'grilled patty'];
  s.orders = [
    order(3, 'ember-burger', 34, 52),
    order(4, 'garden-stack', 42, 52),
    order(5, 'melt-deluxe', 47, 48),
  ];
  s.coins = 34;
  s.served = 3;
  s.timeLeft = 135;
  s.elapsed = 45;
  return { screen: SCREEN_PLAY };
}
