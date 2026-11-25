// Boot and the one loop: input is read every frame, the kitchen advances in fixed 1/60 s
// steps, and the renderer paints what is there. The game moves between four screens:
// title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=cover|assembly|serve|rush (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createKitchen, EVENT_CHOP_TICK, EVENT_CHOPPED, EVENT_GRILL_DONE, EVENT_BURNT, EVENT_SERVED, EVENT_WRONG, EVENT_EXPIRED, EVENT_ORDER_IN, EVENT_OVER, EVENT_RUSH, EVENT_PICKUP, EVENT_PLACE, EVENT_BIN } from './kitchen.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_MUTE, ACTION_INTERACT, createInput } from './input.js';
import { createSoundBank } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const kitchen = createKitchen(createRandom(seed));
const renderer = createRenderer(canvas);
const sounds = createSoundBank();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function playEvents(events) {
  if (events & EVENT_PICKUP) sounds.pickup();
  if (events & EVENT_PLACE) sounds.place();
  if (events & EVENT_CHOP_TICK) sounds.chop();
  if (events & EVENT_CHOPPED) sounds.chopped();
  if (events & EVENT_GRILL_DONE) sounds.grillDone();
  if (events & EVENT_BURNT) sounds.burnt();
  if (events & EVENT_SERVED) sounds.serve();
  if (events & EVENT_WRONG) sounds.wrong();
  if (events & EVENT_EXPIRED) sounds.expired();
  if (events & EVENT_ORDER_IN) sounds.orderIn();
  if (events & EVENT_RUSH) sounds.rush();
  if (events & EVENT_BIN) sounds.place();
}

function runShot(name) {
  const scene = stageShot(name, kitchen);
  let painted = 0;
  function paint() {
    renderer.draw(kitchen.state, scene.screen, 0);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    kitchen.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    sounds.unlock();
    sounds.startMusic();
    announce('Playing. Serve the orders before their tickets run out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    sounds.stopMusic();
    if (kitchen.state.coins > best) {
      best = kitchen.state.coins;
      saveBest(best);
    }
    announce(`Shift over. You earned $${kitchen.state.coins} and served ${kitchen.state.served} dishes.`);
  }

  function handleActions(actions) {
    if (actions & ACTION_MUTE) {
      const on = sounds.toggleMusic();
      announce(on ? 'Music on.' : 'Music off.');
    }
    if (actions & (ACTION_CONFIRM | ACTION_INTERACT) && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM | ACTION_INTERACT) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function step(actions) {
    if (screen === SCREEN_TITLE) return;
    const click = input.takeClick();
    const tap = (actions & ACTION_INTERACT) !== 0;
    const events = kitchen.step(input.direction(), input.interactHeld, tap, click);
    playEvents(events);
    if (events & EVENT_SERVED) {
      const serve = kitchen.state.lastServe;
      if (serve) announce(`Served ${serve.dish} for $${serve.earned}.`);
    } else if (events & EVENT_EXPIRED) {
      announce(`An order expired. ${kitchen.state.hearts} hearts left.`);
    }
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = input.takeActions();
    handleActions(actions);
    if (screen === SCREEN_PLAY) {
      let first = true;
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step(first ? actions : 0);
        first = false;
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(kitchen.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Ember and Thyme. Press Space or click to start your shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
