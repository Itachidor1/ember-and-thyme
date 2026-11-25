// Ember & Thyme — the numbers and names that define the kitchen: canvas size, the
// stations and where they stand, every ingredient and every dish on the menu.
export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const BEST_KEY = 'ember-and-thyme-best';
export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const HAND_SLOTS = 2;
export const MAX_ORDERS = 4;
export const CHEF_SPEED = 265;
export const INTERACT_RANGE = 78;

export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',     color: '#e8b06a', dark: '#b97f3a', chop: false, grill: false },
  patty:   { id: 'patty',   name: 'Patty',   color: '#a0663a', dark: '#6e4426', chop: false, grill: true },
  tomato:  { id: 'tomato',  name: 'Tomato',  color: '#e84a3f', dark: '#a92c24', chop: true,  grill: false },
  lettuce: { id: 'lettuce', name: 'Lettuce', color: '#5fbf4a', dark: '#3a8a2c', chop: true,  grill: false },
  cheese:  { id: 'cheese',  name: 'Cheese',  color: '#f7c948', dark: '#c99a1e', chop: false, grill: false },
  onion:   { id: 'onion',   name: 'Onion',   color: '#b678d6', dark: '#7d4a9e', chop: true,  grill: false },
};

// A dish is a list of prepared items. "chopped tomato" and "grilled patty" are the same
// ingredient after the board or the grill has worked on it.
export const RECIPES = [
  {
    id: 'ember-burger', name: 'Ember Burger', price: 12,
    needs: ['bun', 'grilled patty', 'chopped tomato'],
    blurb: 'The house classic',
  },
  {
    id: 'garden-stack', name: 'Garden Stack', price: 10,
    needs: ['bun', 'chopped lettuce', 'chopped tomato', 'chopped onion'],
    blurb: 'Crunch in every layer',
  },
  {
    id: 'melt-deluxe', name: 'Melt Deluxe', price: 14,
    needs: ['bun', 'grilled patty', 'cheese', 'chopped onion'],
    blurb: 'Cheese over open flame',
  },
  {
    id: 'crispy-green', name: 'Crispy Green', price: 9,
    needs: ['chopped lettuce', 'chopped tomato', 'cheese'],
    blurb: 'Light, bright, fast',
  },
  {
    id: 'double-ember', name: 'Double Ember', price: 18,
    needs: ['bun', 'grilled patty', 'grilled patty', 'cheese'],
    blurb: 'Two patties, no mercy',
  },
];

// Stations: rectangles on the floor plan. `kind` decides what E does there.
export const STATIONS = [
  { id: 'pantry-bun',     kind: 'pantry', gives: 'bun',     x: 24,  y: 150, w: 96, h: 76, label: 'BUNS' },
  { id: 'pantry-patty',   kind: 'pantry', gives: 'patty',   x: 24,  y: 238, w: 96, h: 76, label: 'PATTIES' },
  { id: 'pantry-tomato',  kind: 'pantry', gives: 'tomato',  x: 24,  y: 326, w: 96, h: 76, label: 'TOMATO' },
  { id: 'pantry-lettuce', kind: 'pantry', gives: 'lettuce', x: 24,  y: 414, w: 96, h: 76, label: 'LETTUCE' },
  { id: 'pantry-cheese',  kind: 'pantry', gives: 'cheese',  x: 24,  y: 502, w: 96, h: 76, label: 'CHEESE' },
  { id: 'pantry-onion',   kind: 'pantry', gives: 'onion',   x: 24,  y: 590, w: 96, h: 76, label: 'ONION' },
  { id: 'board',          kind: 'board',   x: 470, y: 132, w: 200, h: 62, label: 'CHOPPING BOARD' },
  { id: 'grill',          kind: 'grill',   x: 1080, y: 132, w: 176, h: 62, label: 'GRILL' },
  { id: 'counter',        kind: 'counter', x: 470, y: 430, w: 340, h: 84, label: 'ASSEMBLY COUNTER' },
  { id: 'window',         kind: 'window',  x: 1080, y: 640, w: 176, h: 62, label: 'SERVE HERE' },
  { id: 'bin',            kind: 'bin',     x: 24,  y: 700, w: 96, h: 62, label: 'BIN' },
];

export const GRILL_SECONDS = 3.2;
export const GRILL_BURN_AFTER = 5.0;
export const CHOP_SECONDS = 1.1;
export const ORDER_PATIENCE_START = 52;
export const ORDER_PATIENCE_MIN = 32;
export const SPAWN_START = 15;
export const SPAWN_MIN = 8.5;
export const RUSH_AT = 30;
export const TIP_MAX = 0.5;
