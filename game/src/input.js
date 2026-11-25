// Keyboard and mouse: WASD or arrows to walk, E or Space (or a click on a nearby
// station) to use it, M to mute the music, P or Escape to pause.
export const ACTION_INTERACT = 1;
export const ACTION_CONFIRM = 2;
export const ACTION_PAUSE = 4;
export const ACTION_MUTE = 8;

const MOVE_KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export function createInput(canvas) {
  const held = new Set();
  let actions = 0;
  let interactHeld = false;
  let click = null;

  function onKeyDown(event) {
    if (MOVE_KEYS[event.code]) {
      held.add(event.code);
      event.preventDefault();
      return;
    }
    if (event.code === 'KeyE' || event.code === 'Space') {
      if (!event.repeat) actions |= ACTION_INTERACT;
      interactHeld = true;
      event.preventDefault();
    } else if (event.code === 'Enter') {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (event.code === 'KeyM') {
      if (!event.repeat) actions |= ACTION_MUTE;
    }
  }

  function onKeyUp(event) {
    held.delete(event.code);
    if (event.code === 'KeyE' || event.code === 'Space') interactHeld = false;
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    actions |= ACTION_INTERACT;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const d = MOVE_KEYS[code];
        if (d) { x += d[0]; y += d[1]; }
      }
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
    get interactHeld() { return interactHeld; },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
  };
}
