// js/audio/tool.js
import { audioEngine, ensureAudio, secondsPerBar, playBeep } from "./engine.js";

export function mount({ sidebar, canvasArea, inspector, bottombar }) {
  bottombar.innerHTML = "";

  // ----- SIDEBAR: CLIP LIST -----
  sidebar.innerHTML = `<h3>Clips</h3>`;
  const clipList = document.createElement("div");
  sidebar.appendChild(clipList);

  function refreshClipList() {
    clipList.innerHTML = "";
    audioEngine.clips.forEach((clip, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.textContent = clip.name;
      div.onclick = () => selectClip(i);
      clipList.appendChild(div);
    });
  }

  function selectClip(i) {
    const clip = audioEngine.clips[i];
    inspector.innerHTML = `
      <h3>${clip.name}</h3>
      <div class="field"><label>Start Bar</label><input id="clipStart" type="number" value="${clip.startBar}"></div>
      <div class="field"><label>Length (bars)</label><input id="clipLen" type="number" value="${clip.lengthBars}"></div>
    `;
    clipStart.oninput = e => clip.startBar = +e.target.value;
    clipLen.oninput = e => clip.lengthBars = +e.target.value;
  }

  // ----- CANVAS: PADS + TIMELINE -----
  const pads = document.createElement("div");
  pads.style.display = "grid";
  pads.style.gridTemplateColumns = "repeat(3,1fr)";
  pads.style.gap = "10px";
  pads.style.marginBottom = "10px";

  ["KICK","SNARE","HAT","CLAP","BASS","METRO"].forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => triggerPad(name);
    pads.appendChild(btn);
  });

  const timeline = document.createElement("canvas");
  timeline.width = 900;
  timeline.height = 200;
  const tctx = timeline.getContext("2d");

  canvasArea.appendChild(pads);
  canvasArea.appendChild(timeline);

  function drawTimeline() {
    tctx.clearRect(0,0,timeline.width,timeline.height);
    audioEngine.clips.forEach(clip => {
      const x = clip.startBar * 60;
      const w = clip.lengthBars * 60;
      tctx.fillStyle = "#6c63ff";
      tctx.fillRect(x,80,w,40);
      tctx.fillStyle = "white";
      tctx.fillText(clip.name, x+4, 100);
    });
  }

  // ----- BOTTOMBAR: TRANSPORT -----
  bottombar.innerHTML = `
    <button id="playBtn">▶ Play</button>
    <button id="stopBtn">⏹ Stop</button>
    <button id="addClipBtn">➕ Add Clip</button>
    <label>BPM <input id="bpmInput" type="number" value="${audioEngine.bpm}" style="width:60px"></label>
  `;

  playBtn.onclick = () => {
    ensureAudio();
    audioEngine.isPlaying = true;
    audioEngine.startTime = audioEngine.ctx.currentTime;
  };

  stopBtn.onclick = () => audioEngine.isPlaying = false;
  bpmInput.oninput = e => audioEngine.bpm = +e.target.value;

  addClipBtn.onclick = () => {
    audioEngine.clips.push({
      id: audioEngine.nextClipId++,
      name: `Clip ${audioEngine.nextClipId}`,
      startBar: 1,
      lengthBars: 2
    });
    refreshClipList();
    drawTimeline();
  };

  function triggerPad(name) {
    if (name === "KICK") playBeep(120, 0.15);
    else if (name === "SNARE") playBeep(260, 0.12);
    else if (name === "HAT") playBeep(600, 0.05);
    else if (name === "CLAP") playBeep(320, 0.1);
    else if (name === "BASS") playBeep(80, 0.3);
    else if (name === "METRO") playBeep(1000, 0.03);
  }

  inspector.innerHTML = "<p>Select a clip.</p>";
  refreshClipList();
  drawTimeline();

  return {
    unmount() {
      // UI disappears, engine keeps playing
    }
  };
}
