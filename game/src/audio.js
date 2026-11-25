// Every sound in Ember & Thyme is synthesized live with WebAudio: no audio files, no
// network, just oscillators and filtered noise. Music is a short looping arpeggio that
// only starts after the player's first input (browsers demand a gesture first).
const MELODY = [392, 523, 659, 784, 659, 523, 440, 587, 659, 880, 784, 659, 523, 659, 587, 440];
const BASS = [130, 130, 174, 196, 130, 130, 220, 196];

export function createSoundBank() {
  let ctx = null;
  let musicTimer = null;
  let musicOn = false;
  let step = 0;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function tone(freq, seconds, type, gain, when = 0) {
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  function noise(seconds, filterFreq, gain, when = 0) {
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const len = Math.max(1, Math.floor(ac.sampleRate * seconds));
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    src.connect(filter).connect(g).connect(ac.destination);
    src.start(t0);
  }

  return {
    unlock() {
      const ac = ensure();
      if (ac && ac.state === 'suspended') ac.resume();
    },
    pickup() { tone(660, 0.09, 'triangle', 0.12); tone(990, 0.07, 'triangle', 0.08, 0.05); },
    place() { tone(330, 0.08, 'triangle', 0.12); },
    chop() { noise(0.09, 1800, 0.22); tone(180, 0.06, 'square', 0.05); },
    chopped() { tone(520, 0.08, 'triangle', 0.12); tone(780, 0.1, 'triangle', 0.1, 0.06); },
    sizzleStart() { noise(0.5, 5200, 0.05); },
    grillDone() { tone(880, 0.12, 'sine', 0.12); tone(1174, 0.14, 'sine', 0.1, 0.1); },
    burnt() { tone(140, 0.3, 'sawtooth', 0.1); },
    serve() { tone(1046, 0.12, 'sine', 0.14); tone(1318, 0.16, 'sine', 0.14, 0.09); tone(1568, 0.22, 'sine', 0.12, 0.18); },
    wrong() { tone(220, 0.16, 'square', 0.08); tone(185, 0.2, 'square', 0.08, 0.1); },
    expired() { tone(311, 0.25, 'triangle', 0.12); tone(233, 0.35, 'triangle', 0.12, 0.18); },
    orderIn() { tone(784, 0.08, 'triangle', 0.09); tone(1046, 0.1, 'triangle', 0.09, 0.07); },
    rush() { tone(587, 0.12, 'square', 0.07); tone(587, 0.12, 'square', 0.07, 0.16); tone(880, 0.2, 'square', 0.07, 0.32); },
    startMusic() {
      if (musicOn || musicTimer) return;
      ensure();
      musicOn = true;
      musicTimer = window.setInterval(() => {
        if (!musicOn) return;
        const note = MELODY[step % MELODY.length];
        const bass = BASS[Math.floor(step / 2) % BASS.length];
        tone(note, 0.22, 'triangle', 0.045);
        if (step % 2 === 0) tone(bass, 0.4, 'sine', 0.05);
        step += 1;
      }, 210);
    },
    stopMusic() {
      musicOn = false;
      if (musicTimer) { window.clearInterval(musicTimer); musicTimer = null; }
    },
    toggleMusic() {
      if (musicOn) this.stopMusic();
      else this.startMusic();
      return musicOn;
    },
  };
}
