// Ember & Thyme — everything the player sees, painted on one canvas: the tiled kitchen
// floor, the counters and stations, the order board, the chef, and every plate and
// ingredient. All art is drawn here in code; the game loads no image files.
import { VIEW, STATIONS, INGREDIENTS, RUSH_AT } from './config.js';
import { recipeById } from './kitchen.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const FLOOR_A = '#8a5a33';
const FLOOR_B = '#7d4f2c';
const WALL = '#5d3a22';
const COUNTER_TOP = '#d9c9a8';
const COUNTER_SIDE = '#9c7b4f';
const BOARD_BG = '#2b2118';
const PAPER = '#fdf3d8';
const INK = '#3a2a18';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function itemLabel(item) {
  if (item.startsWith('plate:')) return recipeById(item.slice(6))?.name ?? 'Plate';
  return item[0].toUpperCase() + item.slice(1);
}

/** Draw one ingredient (or a finished plate) as a little vector icon. */
export function drawIngredient(ctx, item, x, y, size) {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (item.startsWith('plate:')) {
    ctx.fillStyle = '#f4f1e6';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b9b39a';
    ctx.lineWidth = 2;
    ctx.stroke();
    const recipe = recipeById(item.slice(6));
    if (recipe) {
      const n = recipe.needs.length;
      recipe.needs.forEach((need, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        drawIngredient(ctx, need, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.3, size * 0.42);
      });
    }
    ctx.restore();
    return;
  }
  if (item === 'burnt patty') {
    ctx.fillStyle = '#241a12';
    roundRect(ctx, -r, -r * 0.55, size, size * 0.7, 6);
    ctx.fill();
    ctx.restore();
    return;
  }
  switch (item) {
    case 'bun':
      ctx.fillStyle = '#e8b06a';
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.92, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#c98f4e';
      ctx.fillRect(-r * 0.92, r * 0.1, size * 0.92, r * 0.3);
      ctx.fillStyle = '#fff2cf';
      [[-0.45, -0.35], [0, -0.55], [0.45, -0.35]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.ellipse(dx * r, dy * r, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case 'patty':
      ctx.fillStyle = '#a0663a';
      roundRect(ctx, -r, -r * 0.5, size, size * 0.62, 7);
      ctx.fill();
      ctx.fillStyle = '#7c4a26';
      ctx.fillRect(-r * 0.7, -r * 0.28, size * 0.7, 3);
      break;
    case 'grilled patty':
      ctx.fillStyle = '#5e3a1e';
      roundRect(ctx, -r, -r * 0.5, size, size * 0.62, 7);
      ctx.fill();
      ctx.strokeStyle = '#2e1c0e';
      ctx.lineWidth = 3;
      [-0.5, 0, 0.5].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(dx * r, -r * 0.45);
        ctx.lineTo(dx * r, r * 0.12);
        ctx.stroke();
      });
      break;
    case 'tomato':
      ctx.fillStyle = '#e84a3f';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a8a2c';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.75, r * 0.3, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'chopped tomato':
      ctx.fillStyle = '#e84a3f';
      [[-0.4, -0.2], [0.35, -0.35], [0, 0.35]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#f2a49e';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'lettuce':
      ctx.fillStyle = '#5fbf4a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a8a2c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'chopped lettuce':
      ctx.strokeStyle = '#5fbf4a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      [[-0.5, -0.3, 0.4, 0.3], [0.1, -0.5, -0.3, 0.4], [-0.2, 0.5, 0.5, -0.1]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1 * r, y1 * r);
        ctx.quadraticCurveTo(0, 0, x2 * r, y2 * r);
        ctx.stroke();
      });
      break;
    case 'cheese':
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, r * 0.55);
      ctx.lineTo(r * 0.85, r * 0.55);
      ctx.lineTo(0, -r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c99a1e';
      [[-0.3, 0.15], [0.25, 0.3]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case 'onion':
      ctx.fillStyle = '#c9a0e0';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a5fb0';
      ctx.lineWidth = 2;
      [0.55, 0.3].forEach((rr) => {
        ctx.beginPath();
        ctx.arc(0, 0, r * rr, 0, Math.PI * 2);
        ctx.stroke();
      });
      break;
    case 'chopped onion':
      ctx.fillStyle = '#dcc3ee';
      [[-0.45, 0], [0, -0.4], [0.45, 0.1], [0, 0.45]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    default:
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, VIEW.width, 138);
  ctx.fillStyle = '#6b4630';
  for (let x = 0; x < VIEW.width; x += 64) ctx.fillRect(x, 128, 64, 10);
  for (let y = 138; y < VIEW.height; y += 64) {
    for (let x = 0; x < VIEW.width; x += 64) {
      ctx.fillStyle = ((x + y) / 64) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(x, y, 64, 64);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 138; y < VIEW.height; y += 64) ctx.fillRect(0, y, VIEW.width, 2);
  for (let x = 0; x < VIEW.width; x += 64) ctx.fillRect(x, 138, 2, VIEW.height - 138);
  // A rug in front of the serving window, a mat by the grill.
  ctx.fillStyle = '#7a2e2e';
  roundRect(ctx, 1040, 716, 240, 66, 10);
  ctx.fill();
  ctx.fillStyle = '#a8442f';
  roundRect(ctx, 1052, 726, 216, 46, 8);
  ctx.fill();
  ctx.fillStyle = '#3d5a3a';
  roundRect(ctx, 1060, 210, 220, 40, 8);
  ctx.fill();
}

function drawHeader(ctx, state) {
  ctx.fillStyle = '#1d140d';
  ctx.fillRect(0, 0, VIEW.width, 62);
  text(ctx, 'EMBER & THYME', 24, 32, 26, '#f7c948', '800');
  text(ctx, 'rush-hour kitchen', 268, 34, 14, '#d9c9a8', '600');
  // Shift timer: a bar you can feel, with the seconds in it.
  const total = 180;
  const frac = Math.max(0, state.timeLeft / total);
  const bx = 470;
  const bw = 340;
  ctx.fillStyle = '#3a2a18';
  roundRect(ctx, bx, 18, bw, 26, 13);
  ctx.fill();
  const urgent = state.timeLeft <= RUSH_AT;
  ctx.fillStyle = urgent ? '#e84a3f' : '#5fbf4a';
  if (frac > 0) {
    roundRect(ctx, bx, 18, bw * frac, 26, 13);
    ctx.fill();
  }
  const mm = Math.floor(state.timeLeft / 60);
  const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
  text(ctx, `${mm}:${ss}`, bx + bw / 2, 32, 17, '#ffffff', '800', 'center');
  text(ctx, state.rush ? 'RUSH HOUR!' : 'SHIFT', bx + bw / 2, 56, 11, urgent ? '#ff8a7a' : '#9a8a6a', '800', 'center');
  // Coins and hearts.
  text(ctx, `🪙 ${state.coins}`, 900, 32, 22, '#f7c948', '800');
  let hx = 1060;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < state.hearts ? '#e84a3f' : '#4a3a2a';
    ctx.beginPath();
    ctx.arc(hx, 28, 11, 0, Math.PI * 2);
    ctx.arc(hx + 11, 28, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 8, 30);
    ctx.lineTo(hx + 19, 30);
    ctx.lineTo(hx + 5.5, 48);
    ctx.closePath();
    ctx.fill();
    hx += 34;
  }
  text(ctx, `served ${state.served}`, 1180, 32, 15, '#d9c9a8', '700');
}

function drawTicket(ctx, order, x, y, w, h) {
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.35;
  ctx.fillStyle = PAPER;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#e84a3f' : '#c9b98a';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id}  ${order.recipe.name}`, x + 10, y + 16, 14, INK, '800');
  text(ctx, `$${order.recipe.price}`, x + w - 10, y + 16, 14, '#8a6d1f', '800', 'right');
  order.recipe.needs.forEach((need, i) => {
    drawIngredient(ctx, need, x + 24 + i * 34, y + 42, 26);
  });
  // Patience bar.
  ctx.fillStyle = '#e0d3ae';
  roundRect(ctx, x + 10, y + h - 14, w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = urgent ? '#e84a3f' : frac < 0.65 ? '#f7a948' : '#5fbf4a';
  if (frac > 0) {
    roundRect(ctx, x + 10, y + h - 14, (w - 20) * frac, 8, 4);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 10, y + h - 24, 11, urgent ? '#e84a3f' : '#8a7a5a', '800', 'right');
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = BOARD_BG;
  ctx.fillRect(0, 62, VIEW.width, 76);
  text(ctx, 'ORDER BOARD', 24, 100, 15, '#d9c9a8', '800');
  text(ctx, state.orders.length === 0 ? 'no orders — breathe!' : `${state.orders.length} ticket${state.orders.length > 1 ? 's' : ''} up`, 24, 122, 12, '#9a8a6a', '600');
  const w = 268;
  const gap = 12;
  for (let i = 0; i < 4; i += 1) {
    const x = 210 + i * (w + gap);
    if (state.orders[i]) drawTicket(ctx, state.orders[i], x, 70, w, 60);
    else {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, x, 70, w, 60, 8);
      ctx.fill();
    }
  }
}

function drawStation(ctx, station, state, highlight) {
  const { x, y, w, h } = station;
  ctx.save();
  if (highlight) {
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 6, y - 6, w + 12, h + 12, 10);
    ctx.stroke();
  }
  switch (station.kind) {
    case 'pantry':
      ctx.fillStyle = '#6b4a2a';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#8a6a42';
      ctx.fillRect(x + 8, y + 8, w - 16, h - 34);
      drawIngredient(ctx, station.gives, x + w / 2, y + 30, 34);
      text(ctx, station.label, x + w / 2, y + h - 12, 11, '#f3e6c8', '800', 'center');
      break;
    case 'board':
      ctx.fillStyle = COUNTER_SIDE;
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#c9a06a';
      roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 6);
      ctx.fill();
      if (state.board.item) {
        drawIngredient(ctx, state.board.item, x + w / 2, y + h / 2 - 4, 36);
        if (state.board.progress > 0) {
          ctx.fillStyle = '#3a2a18';
          ctx.fillRect(x + 30, y + h - 12, w - 60, 6);
          ctx.fillStyle = '#f7c948';
          ctx.fillRect(x + 30, y + h - 12, (w - 60) * state.board.progress, 6);
        }
      }
      text(ctx, station.label, x + w / 2, y - 12, 12, '#f3e6c8', '800', 'center');
      break;
    case 'grill': {
      ctx.fillStyle = '#3a3a3a';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#222';
      for (let i = 0; i < 5; i += 1) ctx.fillRect(x + 14 + i * 32, y + 10, 8, h - 20);
      if (state.grill.item) {
        const item = state.grill.burnt ? 'burnt patty' : state.grill.cooked ? 'grilled patty' : 'patty';
        drawIngredient(ctx, item, x + w / 2, y + h / 2, 40);
        if (state.grill.cooked && !state.grill.burnt) {
          ctx.fillStyle = '#3a2a18';
          ctx.fillRect(x + 30, y + h - 12, w - 60, 6);
          ctx.fillStyle = '#e84a3f';
          ctx.fillRect(x + 30, y + h - 12, (w - 60) * state.grill.progress, 6);
        }
      }
      if (state.grill.item && !state.grill.cooked) {
        ctx.fillStyle = 'rgba(247,201,72,0.85)';
        text(ctx, 'sizzle…', x + w / 2, y - 12, 12, '#f7c948', '800', 'center');
      } else {
        text(ctx, station.label, x + w / 2, y - 12, 12, '#f3e6c8', '800', 'center');
      }
      break;
    }
    case 'counter':
      ctx.fillStyle = COUNTER_SIDE;
      roundRect(ctx, x, y, w, h, 10);
      ctx.fill();
      ctx.fillStyle = COUNTER_TOP;
      roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 8);
      ctx.fill();
      text(ctx, station.label, x + w / 2, y - 12, 12, '#f3e6c8', '800', 'center');
      if (state.plate.length > 0) {
        ctx.fillStyle = '#f4f1e6';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2 + 6, 74, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b9b39a';
        ctx.lineWidth = 2;
        ctx.stroke();
        state.plate.forEach((item, i) => {
          const n = state.plate.length;
          const px = x + w / 2 + (i - (n - 1) / 2) * 40;
          drawIngredient(ctx, item, px, y + h / 2 + 2, 30);
        });
      } else {
        text(ctx, 'plate your dish here', x + w / 2, y + h / 2 + 4, 13, '#8a7a5a', '600', 'center');
      }
      break;
    case 'window':
      ctx.fillStyle = '#7a2e2e';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#f3e6c8';
      ctx.fillRect(x + 10, y + 10, w - 20, 18);
      text(ctx, '★ SERVE ★', x + w / 2, y + 19, 12, '#7a2e2e', '800', 'center');
      text(ctx, station.label, x + w / 2, y + h - 12, 11, '#f3e6c8', '800', 'center');
      break;
    case 'bin':
      ctx.fillStyle = '#4a4a4a';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 12, y + 8, w - 24, h - 20);
      text(ctx, station.label, x + w / 2, y + h - 12, 11, '#ddd', '800', 'center');
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawChef(ctx, chef, hands) {
  const { x, y } = chef;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body and apron.
  ctx.fillStyle = '#f4f1e6';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a2e2e';
  ctx.beginPath();
  ctx.arc(0, 4, 14, 0, Math.PI);
  ctx.fill();
  // Face.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(chef.facing * 3, -6, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(chef.facing * 3 - 5, -8, 1.8, 0, Math.PI * 2);
  ctx.arc(chef.facing * 3 + 5, -8, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Chef's hat.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -20, 8, 0, Math.PI * 2);
  ctx.arc(0, -24, 9, 0, Math.PI * 2);
  ctx.arc(6, -20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-12, -20, 24, 6);
  // Carried items float above the hat.
  hands.forEach((item, i) => {
    const ix = (i - (hands.length - 1) / 2) * 34;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(ix, -44, 15, 0, Math.PI * 2);
    ctx.fill();
    drawIngredient(ctx, item, ix, -44, 24);
  });
  ctx.restore();
}

function drawHandsTray(ctx, hands) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, 140, 742, 380, 44, 10);
  ctx.fill();
  text(ctx, 'HANDS', 152, 764, 12, '#d9c9a8', '800');
  if (hands.length === 0) {
    text(ctx, 'empty — grab ingredients!', 208, 764, 13, '#9a8a6a', '600');
  } else {
    hands.forEach((item, i) => {
      drawIngredient(ctx, item, 224 + i * 130, 764, 30);
      text(ctx, itemLabel(item), 244 + i * 130, 764, 11, '#f3e6c8', '700');
    });
  }
  text(ctx, 'WASD / arrows to move · E or click to use a station · hold E to chop · M music · P pause', 880, 764, 13, '#cbb98f', '600', 'center');
}

function drawTitleScreen(ctx, best) {
  ctx.fillStyle = 'rgba(20,12,6,0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'EMBER & THYME', 640, 170, 64, '#f7c948', '800', 'center');
  text(ctx, 'a rush-hour kitchen game', 640, 220, 22, '#f3e6c8', '600', 'center');
  text(ctx, 'Orders fly in. Chop, grill, plate, serve — before the ticket runs out.', 640, 272, 18, '#d9c9a8', '600', 'center');
  const recipes = [
    'Ember Burger — bun + grilled patty + chopped tomato · $12',
    'Garden Stack — bun + chopped lettuce + chopped tomato + chopped onion · $10',
    'Melt Deluxe — bun + grilled patty + cheese + chopped onion · $14',
    'Crispy Green — chopped lettuce + chopped tomato + cheese · $9',
    'Double Ember — bun + 2 grilled patties + cheese · $18',
  ];
  text(ctx, 'THE MENU', 640, 330, 16, '#f7c948', '800', 'center');
  recipes.forEach((line, i) => text(ctx, line, 640, 360 + i * 28, 15, '#f3e6c8', '600', 'center'));
  text(ctx, 'WASD / arrows move · E or click uses a station · hold E to chop · serve at the red window', 640, 540, 16, '#d9c9a8', '700', 'center');
  text(ctx, 'Press SPACE or click to start your 3-minute shift', 640, 590, 20, '#ffffff', '800', 'center');
  if (best > 0) text(ctx, `Best shift so far: $${best}`, 640, 640, 16, '#f7c948', '700', 'center');
}

function drawGameOverScreen(ctx, state, best) {
  ctx.fillStyle = 'rgba(20,12,6,0.85)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'SHIFT OVER', 640, 220, 56, '#f7c948', '800', 'center');
  text(ctx, `You earned $${state.coins} · served ${state.served} dish${state.served === 1 ? '' : 'es'} · ${state.lost} order${state.lost === 1 ? '' : 's'} lost`, 640, 290, 20, '#f3e6c8', '600', 'center');
  const stars = state.coins >= 120 ? 3 : state.coins >= 80 ? 2 : state.coins >= 40 ? 1 : 0;
  let sx = 640 - (stars * 44) / 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < stars ? '#f7c948' : '#4a3a2a';
    ctx.font = '44px Trebuchet MS, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', sx + 22, 360);
    sx += 44;
  }
  text(ctx, stars === 3 ? 'Three stars — the kitchen is yours!' : stars === 2 ? 'Two stars — a solid shift!' : stars === 1 ? 'One star — the lunch crowd survived you.' : 'No stars yet — the tickets got away. Try again!', 640, 420, 18, '#d9c9a8', '600', 'center');
  text(ctx, `Best shift: $${Math.max(best, state.coins)}`, 640, 470, 16, '#f7c948', '700', 'center');
  text(ctx, 'Press SPACE or click to cook again', 640, 540, 20, '#ffffff', '800', 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const scale = window.devicePixelRatio || 1;
  canvas.width = VIEW.width * scale;
  canvas.height = VIEW.height * scale;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  ctx.scale(scale, scale);

  function nearestStation(state) {
    let best = null;
    let bestDist = Infinity;
    for (const station of STATIONS) {
      const cx = Math.max(station.x, Math.min(state.chef.x, station.x + station.w));
      const cy = Math.max(station.y, Math.min(state.chef.y, station.y + station.h));
      const d = Math.hypot(state.chef.x - cx, state.chef.y - cy);
      if (d < bestDist) { bestDist = d; best = station; }
    }
    return bestDist <= 78 ? best : null;
  }

  return {
    draw(state, screen, best) {
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      drawFloor(ctx);
      const highlight = screen === SCREEN_PLAY ? nearestStation(state) : null;
      for (const station of STATIONS) drawStation(ctx, station, state, highlight === station);
      drawHeader(ctx, state);
      drawOrderBoard(ctx, state);
      drawChef(ctx, state.chef, state.hands);
      drawHandsTray(ctx, state.hands);
      if (state.lastServe && screen === SCREEN_PLAY) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        roundRect(ctx, 470, 560, 340, 40, 10);
        ctx.fill();
        text(ctx, `Served ${state.lastServe.dish} — +$${state.lastServe.earned} (tip $${state.lastServe.tip})`, 640, 580, 15, '#f7c948', '800', 'center');
      }
      if (highlight && screen === SCREEN_PLAY) {
        text(ctx, `E — ${highlight.label}`, state.chef.x, state.chef.y + 48, 13, '#ffffff', '800', 'center');
      }
      if (screen === SCREEN_TITLE) drawTitleScreen(ctx, best);
      else if (screen === SCREEN_PAUSED) {
        ctx.fillStyle = 'rgba(20,12,6,0.7)';
        ctx.fillRect(0, 0, VIEW.width, VIEW.height);
        text(ctx, 'PAUSED', 640, 380, 48, '#ffffff', '800', 'center');
        text(ctx, 'Press P or Space to keep cooking', 640, 440, 18, '#d9c9a8', '600', 'center');
      } else if (screen === SCREEN_OVER) drawGameOverScreen(ctx, state, best);
    },
  };
}
