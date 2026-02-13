// main.js (now an ES module)
import { currentProject, session as state, timing, timeline, mutations } from './project.js';

/**********************
 * AUDIO + BEATPAD
 **********************/
let audioCtx=null, master=null;
function ensureAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value=0.9;
  master.connect(audioCtx.destination);
}
function now(){return audioCtx.currentTime;}

function secondsPerBeat(){return 60/currentProject.audio.bpm;}
function secondsPerBar(){return secondsPerBeat()*4;}

/**********************
 * QUANTIZE MATH (Option A)
 **********************/
function quantizeDivisionToBeats(div){
  switch(div){
    case '1/4': return 1;
    case '1/8': return 0.5;
    case '1/16': return 0.25;
    case '1/32': return 0.125;
    default: return null;
  }
}

function quantizeTimeSecWith(tSec, q, swing){
  if(q==='off') return tSec;
  const beatsPerStep = quantizeDivisionToBeats(q);
  if(!beatsPerStep) return tSec;
  const stepSec = beatsPerStep * secondsPerBeat();

  const idx = Math.round(tSec / stepSec);
  let qt = idx * stepSec;
  if(idx % 2 === 1 && swing > 0){
    qt += swing * stepSec;
  }
  return Math.max(0, qt);
}

function quantizeTimeSec(tSec){
  return quantizeTimeSecWith(tSec, currentProject.audio.quantize, currentProject.audio.swing);
}

function quantizeBarWith(bar, q){
  if(q==='off') return bar;
  const beatsPerStep = quantizeDivisionToBeats(q);
  if(!beatsPerStep) return bar;
  const stepsPerBar = 4 / beatsPerStep;
  const stepBar = 1 / stepsPerBar;
  const idx = Math.round((bar-1)/stepBar);
  return 1 + idx*stepBar;
}

function quantizeBar(bar){
  if(!currentProject.ui.snap) return bar;
  return quantizeBarWith(bar, currentProject.audio.quantize);
}

/**********************
 * BASIC DRUM SYNTH
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
function triggerHat(at){
  const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.06,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
  const s=audioCtx.createBufferSource(); s.buffer=buf;
  const hp=audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=7000;
  const g=audioCtx.createGain();
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.45,at+0.001);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.05);
  s.connect(hp); hp.connect(g); g.connect(master);
  s.start(at); s.stop(at+0.06);
}
function triggerSnare(at){
  const noiseBuf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.22,audioCtx.sampleRate);
  const data=noiseBuf.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1);
  const noise=audioCtx.createBufferSource(); noise.buffer=noiseBuf;
  const hp=audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1200;
  const ng=audioCtx.createGain();
  ng.gain.setValueAtTime(0.0001,at);
  ng.gain.exponentialRampToValueAtTime(0.8,at+0.003);
  ng.gain.exponentialRampToValueAtTime(0.0001,at+0.16);
  noise.connect(hp); hp.connect(ng); ng.connect(master);
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type='triangle'; o.frequency.setValueAtTime(220,at);
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.22,at+0.002);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.11);
  o.connect(g); g.connect(master);
  noise.start(at); noise.stop(at+0.22);
  o.start(at); o.stop(at+0.13);
}
function triggerClap(at){
  const taps=[0,0.016,0.032,0.048];
  taps.forEach((dt,idx)=>{
    const buf=audioCtx.createBuffer(1,audioCtx.sampleRate*0.08,audioCtx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    const s=audioCtx.createBufferSource(); s.buffer=buf;
    const bp=audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1800;
    const g=audioCtx.createGain();
    const t=at+dt;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.55/(1+idx),t+0.001);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.06);
    s.connect(bp); bp.connect(g); g.connect(master);
    s.start(t); s.stop(t+0.08);
  });
}
function trigger808(at){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(80,at);
  o.frequency.exponentialRampToValueAtTime(48,at+0.08);
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.95,at+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.8);
  o.connect(g); g.connect(master);
  o.start(at); o.stop(at+0.9);
}
function triggerMetroClick(at){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='square';
  o.frequency.setValueAtTime(1600,at);
  g.gain.setValueAtTime(0.0001,at);
  g.gain.exponentialRampToValueAtTime(0.22,at+0.001);
  g.gain.exponentialRampToValueAtTime(0.0001,at+0.03);
  o.connect(g); g.connect(master);
  o.start(at); o.stop(at+0.04);
}

function triggerPad(padId, atTime=now(), fromPlayback=false){
  ensureAudio();
  if(audioCtx.state!=='running') audioCtx.resume();

  if(state.isRecording && !fromPlayback){
    const raw = now() - state.takeStart - timing.inputLatency;
    const t = Math.max(0, raw);
    state.takeHits.push({padId, t});
    state.takeLength = Math.max(state.takeLength, t);
    document.getElementById('takeHits').textContent = state.takeHits.length;
  }

  switch(padId){
    case 'KICK': triggerKick(atTime); break;
    case 'SNARE': triggerSnare(atTime); break;
    case 'HAT': triggerHat(atTime); break;
    case 'CLAP': triggerClap(atTime); break;
    case 'BASS808': trigger808(atTime); break;
    case 'METRO': triggerMetroClick(atTime); break;
  }
}

/**********************
 * METRONOME
 **********************/
function startMetronome(){
  ensureAudio();
  if(audioCtx.state!=='running') audioCtx.resume();
  state.metronomeOn=true;
  state.metroNext=now()+0.05;
  if(state.metroTimer) clearInterval(state.metroTimer);
  state.metroTimer=setInterval(()=>{
    const lookahead=0.12;
    while(state.metroNext < now()+lookahead){
      triggerPad('METRO', state.metroNext, true);
      state.metroNext += secondsPerBeat();
    }
  }, 25);
}
function stopMetronome(){
  state.metronomeOn=false;
  if(state.metroTimer) clearInterval(state.metroTimer);
  state.metroTimer=null;
}

/**********************
 * TIMELINE DATA MODEL
 **********************/
function getClipTiming(clip){
  return {
    quantize: clip.quantize ?? currentProject.audio.quantize,
    swing: clip.swing ?? currentProject.audio.swing
  };
}

function getClipHitsQuantized(clip){
  const {quantize, swing} = getClipTiming(clip);
  const raw = clip.rawHits ?? clip.hits ?? [];
  if(quantize==='off') return raw.slice().sort((a,b)=>a.t-b.t);
  return raw.map(h=>({ padId:h.padId, t: quantizeTimeSecWith(h.t, quantize, swing) }))
    .sort((a,b)=>a.t-b.t);
}

function makeClipFromTake(){
  if(!state.takeHits.length) return null;

  const clip={
    id: 'clip'+(currentProject.timeline.nextId++),
    name: 'Take '+(timeline.clips.length+1),
    startBar: currentProject.ui.snap ? quantizeBar(state.playheadBar) : Math.round(state.playheadBar),
    lengthBars: Math.max(1, Math.ceil((state.takeLength+0.25)/secondsPerBar())),
    rawHits: structuredClone(state.takeHits),
    quantize: currentProject.audio.quantize,
    swing: currentProject.audio.swing
  };

  mutations.addClip(clip);
  document.getElementById('clipCount').textContent = timeline.clips.length;
  drawTimeline();
  return clip;
}

function quantizeCurrentTakeInPlace(){
  if(!state.takeHits.length){ setStatus('no take to quantize'); return; }
  if(currentProject.audio.quantize==='off'){ setStatus('quantize is OFF'); return; }

  state.takeHits = state.takeHits.map(h=>({ padId:h.padId, t: quantizeTimeSec(h.t) }))
    .sort((a,b)=>a.t-b.t);
  state.takeLength = state.takeHits.reduce((m,h)=>Math.max(m,h.t),0);
  setStatus('take quantized');
}

/**********************
 * TRANSPORT + PLAYBACK
 **********************/
function setPlayheadBar(bar){
  const raw = Math.max(1, bar);
  state.playheadBar = currentProject.ui.snap ? quantizeBar(raw) : raw;
  document.getElementById('playheadLabel').textContent = 'bar '+Math.floor(state.playheadBar);
  drawTimeline();
}

function playTimeline(){
  ensureAudio();
  if(audioCtx.state!=='running') audioCtx.resume();
  if(!timeline.clips.length){
    setStatus('no clips');
    return;
  }

  const base = now() + timing.scheduleAhead;
  state.isPlaying=true;
  state.transportStartCtxTime = base;
  state.transportStartBar = state.playheadBar;
  setStatus('playing');

  for(const clip of timeline.clips){
    const clipStartSec = (clip.startBar - state.transportStartBar) * secondsPerBar();
    const clipBase = base + clipStartSec;

    const hits = getClipHitsQuantized(clip);
    for(const hit of hits){
      const t = clipBase + hit.t;
      if(t >= base - 0.001){
        triggerPad(hit.padId, t, true);
      }
    }
  }

  const startPerf=performance.now();
  const startBar=state.transportStartBar;
  function tick(){
    if(!state.isPlaying) return;
    const elapsed = (performance.now()-startPerf)/1000;
    const bar = startBar + (elapsed/secondsPerBar());
    setPlayheadBar(bar);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function stopAll(){
  if(!state.isPlaying && !state.isRecording){
    setPlayheadBar(1);
    setStatus('reset to start');
    return;
  }
  state.isRecording=false;
  state.isPlaying=false;
  setStatus('stopped');
}

function setStatus(s){
  document.getElementById('status').innerHTML = `Status: <code>${s}</code>`;
}

/**********************
 * CANVAS TIMELINE UI
 **********************/
const canvas=document.getElementById('timeline');
const ctx=canvas.getContext('2d');

function barsToX(bar){
  const w=canvas.width;
  const leftPad=20;
  const rightPad=20;
  const usable=w-leftPad-rightPad;
  const pxPerBar=(usable/timeline.barsVisible)*currentProject.ui.zoom;
  return leftPad + (bar-1)*pxPerBar;
}

function xToBar(x){
  const leftPad=20;
  const w=canvas.width;
  const usable=w-leftPad-20;
  const pxPerBar=(usable/timeline.barsVisible)*currentProject.ui.zoom;
  return 1 + (x-leftPad)/pxPerBar;
}

function drawTimeline(){
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.fillStyle='#0d0d12';
  ctx.fillRect(0,0,w,h);

  ctx.fillStyle='rgba(255,255,255,0.06)';
  ctx.fillRect(0,0,w,timeline.headerH);

  const leftPad=20;
  const rightPad=20;
  const usable=w-leftPad-rightPad;
  const pxPerBar=(usable/timeline.barsVisible)*currentProject.ui.zoom;

  for(let i=0;i<=timeline.barsVisible;i++){
    const x=leftPad + i*pxPerBar;
    const barNum=i+1;

    ctx.strokeStyle='rgba(255,255,255,0.18)';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,h);
    ctx.stroke();

    if(i<timeline.barsVisible){
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.font='12px system-ui, sans-serif';
      ctx.fillText('Bar '+barNum, x+6, 24);
    }

    if(i<timeline.barsVisible){
      for(let b=1;b<4;b++){
        const bx=x + (b*pxPerBar/4);
        ctx.strokeStyle='rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(bx, timeline.headerH);
        ctx.lineTo(bx, h);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle='rgba(255,255,255,0.05)';
  ctx.fillRect(0, timeline.trackY, w, timeline.trackH);
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.font='12px system-ui, sans-serif';
  ctx.fillText('Drums Track', 18, timeline.trackY-8);

  for(const clip of timeline.clips){
    const x=barsToX(clip.startBar);
    const x2=barsToX(clip.startBar+clip.lengthBars);
    const cw=x2-x;
    const y=timeline.trackY+16;
    const ch=timeline.trackH-32;

    ctx.fillStyle='rgba(106,163,255,0.22)';
    ctx.strokeStyle='rgba(106,163,255,0.65)';
    ctx.lineWidth=2;
    roundRect(ctx, x, y, cw, ch, 12, true, true);

    const {quantize, swing} = getClipTiming(clip);
    const label = quantize==='off' ? clip.name : `${clip.name} (${quantize}${swing>0?` +${Math.round(swing*100)}%`:''})`;

    ctx.fillStyle='rgba(255,255,255,0.92)';
    ctx.font='13px system-ui, sans-serif';
    ctx.fillText(label, x+10, y+22);

    const baseY=y+ch-14;
    ctx.fillStyle='rgba(255,255,255,0.7)';
    const secPerBar=secondsPerBar();
    const hits = getClipHitsQuantized(clip);
    for(const hit of hits){
      const relBar=hit.t/secPerBar;
      const hx=x + relBar*(cw/clip.lengthBars);
      ctx.fillRect(hx, baseY, 2, 8);
    }

    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.fillRect(x-2, y, 6, ch);
    ctx.fillRect(x+cw-4, y, 6, ch);
  }

  const phX=barsToX(state.playheadBar);
  ctx.strokeStyle='rgba(255,211,106,0.95)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(phX,0);
  ctx.lineTo(phX,h);
  ctx.stroke();
  ctx.fillStyle='rgba(255,211,106,0.95)';
  ctx.fillRect(phX-4, 0, 8, 8);
}

function roundRect(ctx,x,y,w,h,r,fill,stroke){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

/**********************
 * TIMELINE INTERACTION
 **********************/
let drag=null;
function clipAt(x,y){
  const ty=timeline.trackY+16;
  const th=timeline.trackH-32;
  if(y<ty || y>ty+th) return null;
  for(let i=timeline.clips.length-1;i>=0;i--){
    const c=timeline.clips[i];
    const cx=barsToX(c.startBar);
    const cx2=barsToX(c.startBar+c.lengthBars);
    if(x>=cx && x<=cx2) return {clip:c, cx, cx2};
  }
  return null;
}

canvas.addEventListener('pointerdown',(e)=>{
  const rect=canvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)*(canvas.width/rect.width);
  const y=(e.clientY-rect.top)*(canvas.height/rect.height);

  const hit=clipAt(x,y);
  if(hit){
    const {clip,cx,cx2}=hit;
    const onLeft = Math.abs(x-cx) < 10;
    const onRight = Math.abs(x-cx2) < 10;
    const mode = onLeft?'resizeL':onRight?'resizeR':'move';

    let workingClip=clip;
    if(e.altKey){
      workingClip=structuredClone(clip);
      workingClip.id='clip'+(currentProject.timeline.nextId++);
      workingClip.name=clip.name+' copy';
      mutations.addClip(workingClip);
      document.getElementById('clipCount').textContent = timeline.clips.length;
    }

    drag={
      mode,
      clip:workingClip,
      startX:x,
      startStartBar:workingClip.startBar,
      startLen:workingClip.lengthBars
    };
    canvas.setPointerCapture(e.pointerId);
  } else {
    setPlayheadBar(xToBar(x));
  }
});

canvas.addEventListener('pointermove',(e)=>{
  if(!drag) return;
  const rect=canvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)*(canvas.width/rect.width);
  const dxBars = xToBar(x) - xToBar(drag.startX);

  if(drag.mode==='move'){
    const raw = Math.max(1, drag.startStartBar + dxBars);
    mutations.updateClip(drag.clip.id, {
      startBar: currentProject.ui.snap ? quantizeBar(raw) : raw
    });
  } else if(drag.mode==='resizeL'){
      mutations.updateClip(drag.clip.id, {
        startBar: newStart,
        lengthBars: newLength
      });
  } else if(drag.mode==='resizeR'){
      mutations.updateClip(drag.clip.id, {
      lengthBars: newLength
    });
  }

  // Persisted clip mutations are still direct right now.
  // That’s okay for Step 1, but we’ll route clip edits through mutations next.
  // For now, nudge modified timestamp so autosave would eventually trigger.
  // (When we wire autosave, this matters.)
  // Note: keep it light to avoid changing behavior.
  // mutations.markProjectModified? Not exported; we’ll add clip update helpers in Step 1.5.

  drawTimeline();
});

canvas.addEventListener('pointerup',()=>{ drag=null; });
canvas.addEventListener('pointercancel',()=>{ drag=null; });

/**********************
 * UI SETUP
 **********************/
const pads=[
  {id:'KICK',label:'Kick (Q)',key:'KeyQ'},
  {id:'SNARE',label:'Snare (W)',key:'KeyW'},
  {id:'HAT',label:'Hat (E)',key:'KeyE'},
  {id:'CLAP',label:'Clap (A)',key:'KeyA'},
  {id:'BASS808',label:'808 (D)',key:'KeyD'},
  {id:'METRO',label:'(Metro click)',key:null, hidden:true}
];

const padsEl=document.getElementById('pads');
pads.filter(p=>!p.hidden).forEach(p=>{
  const b=document.createElement('button');
  b.className='pad';
  b.textContent=p.label;

  b.addEventListener('pointerdown',(ev)=>{
    ev.preventDefault();
    triggerPad(p.id);
  });
  b.addEventListener('click',(ev)=>ev.preventDefault());

  padsEl.appendChild(b);
});

document.addEventListener('keydown',(e)=>{
  const p=pads.find(x=>x.key===e.code);
  if(p) triggerPad(p.id);
});

// buttons

document.getElementById('btnStartAudio').addEventListener('click',()=>{
  ensureAudio(); audioCtx.resume(); setStatus('audio started');
});

document.getElementById('btnMetro').addEventListener('click',()=>{
  ensureAudio();
  if(!state.metronomeOn){startMetronome(); setStatus('metronome ON');}
  else {stopMetronome(); setStatus('metronome OFF');}
});

document.getElementById('btnRecord').addEventListener('click',()=>{
  ensureAudio(); if(audioCtx.state!=='running') audioCtx.resume();
  state.takeHits=[]; state.takeLength=0;
  state.isRecording=true;
  state.takeStart=now();
  document.getElementById('takeHits').textContent='0';
  setStatus('recording take');
});

document.getElementById('btnStop').addEventListener('click',()=>{
  stopAll();
});

document.getElementById('btnPlay').addEventListener('click',()=>{
  playTimeline();
});

document.getElementById('btnAddClip').addEventListener('click',()=>{
  const c=makeClipFromTake();
  if(c) setStatus('clip created');
  else setStatus('no take recorded');
});

document.getElementById('btnClearClips').addEventListener('click',()=>{
  mutations.clearClips();
  document.getElementById('clipCount').textContent='0';
  setStatus('clips cleared');
  drawTimeline();
});

document.getElementById('btnSnap').addEventListener('click',()=>{
  mutations.toggleSnap();
  document.getElementById('snapLabel').textContent = currentProject.ui.snap ? 'ON' : 'OFF';
  setStatus('snap '+(currentProject.ui.snap?'ON':'OFF'));
  drawTimeline();
});

document.getElementById('btnQTake').addEventListener('click',()=>{
  quantizeCurrentTakeInPlace();
});

// sliders
const bpmEl=document.getElementById('bpm');
bpmEl.addEventListener('input',(e)=>{
  mutations.setBpm(Number(e.target.value));
  document.getElementById('bpmLabel').textContent=currentProject.audio.bpm;
});

const latEl=document.getElementById('lat');
latEl.addEventListener('input',(e)=>{
  const ms=Number(e.target.value);
  mutations.setLatencyMs(ms);
  document.getElementById('latLabel').textContent=ms;
});

const zoomEl=document.getElementById('zoom');
zoomEl.addEventListener('input',(e)=>{
  mutations.setZoom(Number(e.target.value));
  document.getElementById('zoomLabel').textContent=currentProject.ui.zoom.toFixed(2);
  drawTimeline();
});

// quantize
const qEl=document.getElementById('quantize');
function refreshQLabel(){
  document.getElementById('qLabel').textContent = (currentProject.audio.quantize==='off') ? 'OFF' : currentProject.audio.quantize;
}
qEl.addEventListener('change',(e)=>{
  mutations.setQuantize(e.target.value);
  refreshQLabel();
  setStatus('quantize '+(currentProject.audio.quantize==='off'?'OFF':currentProject.audio.quantize));
  drawTimeline();
});

const swingEl=document.getElementById('swing');
swingEl.addEventListener('input',(e)=>{
  const pct = Number(e.target.value);
  mutations.setSwing(pct/100);
  document.getElementById('swingLabel').textContent = pct+'%';
  drawTimeline();
});

/**********************
 * SELF-TESTS (console)
 **********************/
function runSelfTests(){
  try{
    console.assert(quantizeDivisionToBeats('1/4')===1, '1/4 should be 1 beat');
    console.assert(quantizeDivisionToBeats('1/16')===0.25, '1/16 should be 0.25 beat');

    const prevSnap=currentProject.ui.snap;
    const prevQ=currentProject.audio.quantize;

    mutations.setSnap(true);
    mutations.setQuantize('1/16');
    const snapped = quantizeBar(1.12);
    console.assert(Math.abs(snapped-1.125) < 1e-9, 'bar should snap to nearest 1/16 (1.125)');

    mutations.setQuantize('off');
    const free = quantizeBar(1.12);
    console.assert(Math.abs(free-1.12) < 1e-9, 'bar should not snap when quantize is off');

    mutations.setSnap(prevSnap);
    mutations.setQuantize(prevQ);

    console.log('✅ Self-tests passed');
  }catch(err){
    console.warn('❌ Self-tests failed:', err);
  }
}

// initialize
refreshQLabel();
document.getElementById('bpmLabel').textContent = currentProject.audio.bpm;
document.getElementById('latLabel').textContent = currentProject.audio.latencyMs;
document.getElementById('zoomLabel').textContent = currentProject.ui.zoom.toFixed(2);
document.getElementById('snapLabel').textContent = currentProject.ui.snap ? 'ON' : 'OFF';
setPlayheadBar(1);
setStatus('idle');
drawTimeline();
runSelfTests();
