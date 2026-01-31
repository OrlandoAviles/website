// js/audio/engine.js

export const audioEngine = {
  ctx: null,
  master: null,
  bpm: 120,
  isPlaying: false,
  startTime: 0,
  clips: [],
  nextClipId: 1
};

export function ensureAudio() {
  if (audioEngine.ctx) return;
  audioEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
  audioEngine.master = audioEngine.ctx.createGain();
  audioEngine.master.gain.value = 0.9;
  audioEngine.master.connect(audioEngine.ctx.destination);
}

export function secondsPerBeat() {
  return 60 / audioEngine.bpm;
}

export function secondsPerBar() {
  return secondsPerBeat() * 4;
}

export function playBeep(freq = 220, dur = 0.1, when = 0) {
  ensureAudio();
  const ctx = audioEngine.ctx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = 0.25;
  o.connect(g).connect(audioEngine.master);
  o.start(ctx.currentTime + when);
  o.stop(ctx.currentTime + when + dur);
}
