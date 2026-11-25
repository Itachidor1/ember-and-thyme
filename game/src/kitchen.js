// Ember & Thyme — the kitchen itself: the chef, the stations, the orders on the board,
// and every rule that turns raw ingredients into served dishes and coins.
// Pure logic: no DOM, no canvas, no sound here — it returns event flags and the caller
// decides what to play and what to announce.
import {
  VIEW, STEP, SHIFT_SECONDS, MAX_HEARTS, HAND_SLOTS, MAX_ORDERS, CHEF_SPEED,
  INTERACT_RANGE, INGREDIENTS, RECIPES, STATIONS, GRILL_SECONDS, GRILL_BURN_AFTER,
  CHOP_SECONDS, ORDER_PATIENCE_START, ORDER_PATIENCE_MIN, SPAWN_START, SPAWN_MIN,
  RUSH_AT, TIP_MAX,
} from './config.js';

export const EVENT_PICKUP = 1;
export const EVENT_PLACE = 2;
export const EVENT_CHOP_TICK = 4;
export const EVENT_CHOPPED = 8;
export const EVENT_GRILL_DONE = 16;
export const EVENT_BURNT = 32;
export const EVENT_SERVED = 64;
export const EVENT_WRONG = 128;
export const EVENT_EXPIRED = 256;
export const EVENT_ORDER_IN = 512;
export const EVENT_OVER = 1024;
export const EVENT_RUSH = 2048;
export const EVENT_BIN = 4096;

let orderId = 0;

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

/** True when the plate's items are exactly the recipe's needs, in any order. */
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.needs.length) return false;
  const remaining = [...recipe.needs];
  for (const item of plateItems) {
    const at = remaining.indexOf(item);
    if (at === -1) return false;
    remaining.splice(at, 1);
  }
  return true;
}

/** The open order this plate completes, or null. */
export function matchingOrder(plateItems, orders) {
  for (const order of orders) {
    if (plateMatchesRecipe(plateItems, order.recipe)) return order;
  }
  return null;
}

function stationRect(station) {
  return { x: station.x, y: station.y, w: station.w, h: station.h };
}

function distanceToRect(px, py, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  return Math.hypot(px - cx, py - cy);
}

export function createKitchen(random) {
  const state = {
    chef: { x: 640, y: 640, facing: 1 },
    hands: [],
    board: { item: null, progress: 0 },
    grill: { item: null, progress: 0, cooked: false, burnt: false },
    plate: [],
    orders: [],
    coins: 0,
    served: 0,
    lost: 0,
    hearts: MAX_HEARTS,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    spawnTimer: 6,
    rush: false,
    over: false,
    lastServe: null,
    chopTick: 0,
  };

  function spawnOrder() {
    const late = state.elapsed > 60;
    const pool = late ? RECIPES : RECIPES.slice(0, 4);
    const recipe = random.pick(pool);
    const progress = state.elapsed / SHIFT_SECONDS;
    const patience = ORDER_PATIENCE_START - progress * (ORDER_PATIENCE_START - ORDER_PATIENCE_MIN);
    state.orders.push({
      id: orderId += 1,
      recipe,
      patience,
      maxPatience: patience,
    });
    return EVENT_ORDER_IN;
  }

  function nearestStation() {
    let best = null;
    let bestDist = Infinity;
    for (const station of STATIONS) {
      const d = distanceToRect(state.chef.x, state.chef.y, stationRect(station));
      if (d < bestDist) { bestDist = d; best = station; }
    }
    return bestDist <= INTERACT_RANGE ? best : null;
  }

  function stationAtPoint(px, py) {
    for (const station of STATIONS) {
      const r = stationRect(station);
      if (px >= r.x - 26 && px <= r.x + r.w + 26 && py >= r.y - 26 && py <= r.y + r.h + 26) return station;
    }
    return null;
  }

  function takeFromHands(item) {
    const at = state.hands.indexOf(item);
    if (at === -1) return false;
    state.hands.splice(at, 1);
    return true;
  }

  function interact(station) {
    if (!station) return 0;
    switch (station.kind) {
      case 'pantry': {
        if (state.hands.length >= HAND_SLOTS) return EVENT_WRONG;
        state.hands.push(station.gives);
        return EVENT_PICKUP;
      }
      case 'board': {
        if (state.board.item) {
          if (state.hands.length >= HAND_SLOTS) return EVENT_WRONG;
          state.hands.push(state.board.item);
          state.board.item = null;
          state.board.progress = 0;
          return EVENT_PICKUP;
        }
        const raw = state.hands.find((item) => INGREDIENTS[item] && INGREDIENTS[item].chop);
        if (!raw) return EVENT_WRONG;
        takeFromHands(raw);
        state.board.item = raw;
        state.board.progress = 0;
        return EVENT_PLACE;
      }
      case 'grill': {
        if (state.grill.item) {
          if (state.grill.burnt) {
            if (state.hands.length >= HAND_SLOTS) return EVENT_WRONG;
            state.hands.push('burnt patty');
            state.grill.item = null;
            state.grill.progress = 0;
            state.grill.cooked = false;
            state.grill.burnt = false;
            return EVENT_PICKUP;
          }
          if (!state.grill.cooked) return EVENT_WRONG;
          if (state.hands.length >= HAND_SLOTS) return EVENT_WRONG;
          state.hands.push('grilled patty');
          state.grill.item = null;
          state.grill.progress = 0;
          state.grill.cooked = false;
          return EVENT_PICKUP;
        }
        if (!state.hands.includes('patty')) return EVENT_WRONG;
        takeFromHands('patty');
        state.grill.item = 'patty';
        state.grill.progress = 0;
        state.grill.cooked = false;
        state.grill.burnt = false;
        return EVENT_PLACE;
      }
      case 'counter': {
        const plateItem = state.hands.find((item) => item.startsWith('plate:'));
        if (plateItem) return EVENT_WRONG;
        const complete = matchingOrder(state.plate, state.orders);
        if (complete && state.plate.length > 0) {
          if (state.hands.length >= HAND_SLOTS) return EVENT_WRONG;
          state.hands.push(`plate:${complete.recipe.id}`);
          state.plate = [];
          return EVENT_PICKUP;
        }
        if (state.hands.length === 0) {
          if (state.plate.length === 0) return EVENT_WRONG;
          state.hands.push(state.plate.pop());
          return EVENT_PICKUP;
        }
        const item = state.hands[state.hands.length - 1];
        if (item.startsWith('plate:') || item === 'burnt patty') return EVENT_WRONG;
        state.hands.pop();
        state.plate.push(item);
        return EVENT_PLACE;
      }
      case 'window': {
        const at = state.hands.findIndex((item) => item.startsWith('plate:'));
        if (at === -1) return EVENT_WRONG;
        const recipeId = state.hands[at].slice('plate:'.length);
        const order = state.orders.find((o) => o.recipe.id === recipeId);
        if (!order) return EVENT_WRONG;
        state.hands.splice(at, 1);
        state.orders.splice(state.orders.indexOf(order), 1);
        const tip = Math.round(order.recipe.price * TIP_MAX * (order.patience / order.maxPatience));
        const earned = order.recipe.price + tip;
        state.coins += earned;
        state.served += 1;
        state.lastServe = { dish: order.recipe.name, earned, tip };
        return EVENT_SERVED;
      }
      case 'bin': {
        if (state.hands.length === 0) return EVENT_WRONG;
        state.hands.pop();
        return EVENT_BIN;
      }
      default:
        return 0;
    }
  }

  function collideChef() {
    const chef = state.chef;
    const r = 20;
    chef.x = Math.max(150, Math.min(VIEW.width - 24, chef.x));
    chef.y = Math.max(216, Math.min(VIEW.height - 24, chef.y));
    for (const station of STATIONS) {
      const rect = stationRect(station);
      if (chef.x + r > rect.x && chef.x - r < rect.x + rect.w && chef.y + r > rect.y && chef.y - r < rect.y + rect.h) {
        const pushLeft = chef.x + r - rect.x;
        const pushRight = rect.x + rect.w - (chef.x - r);
        const pushUp = chef.y + r - rect.y;
        const pushDown = rect.y + rect.h - (chef.y - r);
        const min = Math.min(pushLeft, pushRight, pushUp, pushDown);
        if (min === pushLeft) chef.x = rect.x - r;
        else if (min === pushRight) chef.x = rect.x + rect.w + r;
        else if (min === pushUp) chef.y = rect.y - r;
        else chef.y = rect.y + rect.h + r;
      }
    }
  }

  return {
    state,
    reset() {
      state.chef.x = 640;
      state.chef.y = 640;
      state.chef.facing = 1;
      state.hands = [];
      state.board = { item: null, progress: 0 };
      state.grill = { item: null, progress: 0, cooked: false, burnt: false };
      state.plate = [];
      state.orders = [];
      state.coins = 0;
      state.served = 0;
      state.lost = 0;
      state.hearts = MAX_HEARTS;
      state.timeLeft = SHIFT_SECONDS;
      state.elapsed = 0;
      state.spawnTimer = 6;
      state.rush = false;
      state.over = false;
      state.lastServe = null;
      state.chopTick = 0;
    },

    /** Advance the kitchen one fixed step. `move` is {x, y}, `held` is the interact key
     * held down (chopping), `tap` is a fresh interact press, `click` a mouse point. */
    step(move, held, tap, click) {
      if (state.over) return 0;
      let events = 0;
      state.elapsed += STEP;
      state.timeLeft -= STEP;

      const chef = state.chef;
      chef.x += move.x * CHEF_SPEED * STEP;
      chef.y += move.y * CHEF_SPEED * STEP;
      if (move.x !== 0) chef.facing = move.x > 0 ? 1 : -1;
      collideChef();

      // Chopping: hold E at the board while something raw and choppable sits on it.
      const near = nearestStation();
      const boardItem = state.board.item;
      const choppable = boardItem && INGREDIENTS[boardItem] && INGREDIENTS[boardItem].chop;
      if (held && near && near.kind === 'board' && choppable) {
        state.board.progress += STEP / CHOP_SECONDS;
        state.chopTick += STEP;
        if (state.chopTick >= 0.28) {
          state.chopTick = 0;
          events |= EVENT_CHOP_TICK;
        }
        if (state.board.progress >= 1) {
          state.board.item = `chopped ${state.board.item}`;
          state.board.progress = 0;
          events |= EVENT_CHOPPED;
        }
      } else {
        state.chopTick = 0;
      }

      // The grill cooks on its own; leave a patty too long and it burns.
      if (state.grill.item && !state.grill.cooked) {
        state.grill.progress += STEP / GRILL_SECONDS;
        if (state.grill.progress >= 1) {
          state.grill.cooked = true;
          state.grill.progress = 0;
          events |= EVENT_GRILL_DONE;
        }
      } else if (state.grill.item && state.grill.cooked && !state.grill.burnt) {
        state.grill.progress += STEP / GRILL_BURN_AFTER;
        if (state.grill.progress >= 1) {
          state.grill.burnt = true;
          events |= EVENT_BURNT;
        }
      }

      if (tap) {
        let target = near;
        if (click) {
          const clicked = stationAtPoint(click.x, click.y);
          if (clicked && distanceToRect(chef.x, chef.y, stationRect(clicked)) <= INTERACT_RANGE) target = clicked;
        }
        events |= interact(target);
      }

      // Orders arrive faster as the shift wears on; the last 30 seconds are rush hour.
      if (!state.rush && state.timeLeft <= RUSH_AT) {
        state.rush = true;
        events |= EVENT_RUSH;
      }
      const progress = state.elapsed / SHIFT_SECONDS;
      const spawnEvery = SPAWN_START - progress * (SPAWN_START - SPAWN_MIN);
      state.spawnTimer -= STEP;
      if (state.spawnTimer <= 0 && state.orders.length < MAX_ORDERS) {
        events |= spawnOrder();
        state.spawnTimer = spawnEvery * (state.rush ? 0.75 : 1);
      }

      for (let i = state.orders.length - 1; i >= 0; i -= 1) {
        const order = state.orders[i];
        order.patience -= STEP;
        if (order.patience <= 0) {
          state.orders.splice(i, 1);
          state.lost += 1;
          state.hearts -= 1;
          state.coins = Math.max(0, state.coins - 5);
          events |= EVENT_EXPIRED;
        }
      }

      if (state.timeLeft <= 0 || state.hearts <= 0) {
        state.timeLeft = Math.max(0, state.timeLeft);
        state.over = true;
        events |= EVENT_OVER;
      }
      return events;
    },

    stars() {
      if (state.coins >= 120) return 3;
      if (state.coins >= 80) return 2;
      if (state.coins >= 40) return 1;
      return 0;
    },
  };
}
