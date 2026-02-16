import {
  currentProject,
  timeline,
  session as state,
  timing,
  mutations
} from "./project.js";

/**********************
 * AUDIO ENGINE
 **********************/
let audioCtx = null;
let master = null;

function ensureAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0.9;
  master.connect(audioCtx.destination);
}

function now(){ return audioCtx.currentTime; }

function secondsPerBeat(){
  return 60 / currentProject.audio.bpm;
}

function secondsPerBar(){
  return secondsPerBeat() * 4;
}

/**********************
 * DRUM SYNTH (UNCHANGED)
 **********************/
function triggerKick(at){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(170,at);
  o.frequency.exponentialRampToValueAtTime(45,at+0.09);
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(1.0,at+0.005);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.24);
  o.connect(g); g.connect(master);
  o.start(at); o.stop(at+0.3);
}

function triggerSnare(at){
  const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.22,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const s=audioCtx.createBufferSource(); s.buffer=buf;
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.8,at+0.003);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.16);
  s.connect(g); g.connect(master);
  s.start(at); s.stop(at+0.22);
}

function triggerHat(at){
  const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.06,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const s=audioCtx.createBufferSource(); s.buffer=buf;
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.45,at+0.001);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.05);
  s.connect(g); g.connect(master);
  s.start(at); s.stop(at+0.06);
}

function triggerPad(padId, atTime=now(), fromPlayback=false){
  ensureAudio();
  if(audioCtx.state!=='running') audioCtx.resume();

  if(state.isRecording && !fromPlayback){
    const raw = now() - state.takeStart - timing.inputLatency;
    const t = Math.max(0, raw);
    state.takeHits.push({padId, t});
    state.takeLength = Math.max(state.takeLength, t);
  }

  switch(padId){
    case 'KICK': triggerKick(atTime); break;
    case 'SNARE': triggerSnare(atTime); break;
    case 'HAT': triggerHat(atTime); break;
  }
}

/**********************
 * PATTERN CREATION
 **********************/
function makePatternFromTake(){
  if(!state.takeHits.length) return null;

  const patternId = "pattern" + currentProject.timeline.nextPatternId++;
  const lengthBars = Math.max(1,
    Math.ceil((state.takeLength + 0.25) / secondsPerBar())
  );

  const pattern = {
    id: patternId,
    name: "Pattern " + currentProject.timeline.nextPatternId,
    lengthBars,
    rawHits: structuredClone(state.takeHits)
  };

  currentProject.patterns.push(pattern);

  const placement = {
    patternId,
    startBar: state.playheadBar
  };

  currentProject.timeline.tracks[0].placements.push(placement);

  drawTimeline();
  return pattern;
}

/**********************
 * PLAYBACK
 **********************/
function playTimeline(){
  ensureAudio();
  if(audioCtx.state!=='running') audioCtx.resume();

  const base = now() + timing.scheduleAhead;
  state.isPlaying = true;
  state.transportStartCtxTime = base;
  state.transportStartBar = state.playheadBar;

  for(const track of currentProject.timeline.tracks){
    for(const placement of track.placements){

      const pattern = currentProject.patterns.find(
        p => p.id === placement.patternId
      );
      if(!pattern) continue;

      const clipStartSec =
        (placement.startBar - state.transportStartBar) * secondsPerBar();
      const clipBase = base + clipStartSec;

      for(const hit of pattern.rawHits){
        const t = clipBase + hit.t;
        if(t >= base - 0.001){
          triggerPad(hit.padId, t, true);
        }
      }
    }
  }
}

/**********************
 * TIMELINE CANVAS
 **********************/
const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");

function barsToX(bar){
  const w=canvas.width;
  const pad=20;
  const usable=w-pad*2;
  const pxPerBar=usable/currentProject.timeline.barsVisible;
  return pad + (bar-1)*pxPerBar;
}

function drawTimeline(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#0d0d12";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(const track of currentProject.timeline.tracks){
    for(const placement of track.placements){

      const pattern = currentProject.patterns.find(
        p => p.id === placement.patternId
      );
      if(!pattern) continue;

      const x = barsToX(placement.startBar);
      const x2 = barsToX(placement.startBar + pattern.lengthBars);
      const w = x2 - x;

      ctx.fillStyle="rgba(106,163,255,0.25)";
      ctx.fillRect(x, 80, w, 60);

      ctx.fillStyle="#fff";
      ctx.fillText(pattern.name, x+8, 100);
    }
  }
}

/**********************
 * RECORDING
 **********************/
document.getElementById("btnRecord").addEventListener("click",()=>{
  ensureAudio();
  state.takeHits=[];
  state.takeLength=0;
  state.isRecording=true;
  state.takeStart=now();
});

document.getElementById("btnAddClip").addEventListener("click",()=>{
  makePatternFromTake();
});

document.getElementById("btnPlay").addEventListener("click",()=>{
  playTimeline();
});
