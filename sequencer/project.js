// project.js
// Owns: currentProject + mutation helpers + (stub) autosave scheduling.
// For Step 1 we keep runtime/session flags here too, so main.js can stay mostly intact.

const PROJECT_VERSION = 1;

function nowISO() {
  return new Date().toISOString();
}

function newId() {
  // Works in modern browsers. If you need legacy support later, we can swap.
  return (crypto?.randomUUID?.() ?? `proj_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

export function createDefaultProject() {
  const created = nowISO();

  return {
    id: newId(),
    version: PROJECT_VERSION,
    meta: {
      title: "Developer Default Project",
      created,
      modified: created,
    },
    audio: {
      bpm: 120,
      quantize: "1/16",
      swing: 0.0,
      latencyMs: 45,
    },
    patterns: [],

    timeline: {
      barsVisible: 16,
      tracks: [
        {
          id: "track1",
          name: "Track 1",
          instrument: "drumKit",
          placements: [] // { patternId, startBar }
        }
      ],
      nextPatternId: 1
    },

    ui: {
      // future: these become your 3-pane layout percentages
      performanceHeight: 50,
      arrangementHeight: 50,
      sidePanelOpen: true,

      // current MVP bits
      zoom: 1.0,
      snap: true,

      editors: {
        performance: {},
        arrangement: {},
      },
    },
  };
}

// Single active project at runtime (Step 1: in-memory only)
export let currentProject = createDefaultProject();

// Session-only runtime state. This is intentionally NOT persisted yet.
// (We’ll migrate pieces into project schema as we iterate.)
export const session = {
  metronomeOn: false,
  metroTimer: null,
  metroNext: 0,

  isRecording: false,
  takeStart: 0,
  takeHits: [], // {padId, t}
  takeLength: 0,

  // transport
  isPlaying: false,
  transportStartCtxTime: 0,
  transportStartBar: 1,
  playheadBar: 1,
};

// Timing is “engine config”. You might later persist some of this under project.audio.
export const timing = {
  scheduleAhead: 0.06,
  inputLatency: currentProject.audio.latencyMs / 1000,
};

// Timeline “view constants” live here for now (Step 1). We’ll split later.
export const timeline = {
  get barsVisible() { return currentProject.timeline.barsVisible; },
  set barsVisible(v) { mutateTimelineBarsVisible(v); },

  trackY: 70,
  trackH: 80,
  headerH: 40,

  get tracks() { return currentProject.timeline.tracks; },
  set clips(_) {
    throw new Error("Direct clip writes are blocked. Use mutations.* helpers.");
  },

  get nextId() { return currentProject.timeline.nextId; },
};

// ─────────────────────────────────────────────────────────────
// Mutation policy
// - Any persisted change goes through helpers below.
// - Helpers call markProjectModified() which triggers autosave scheduling.
// ─────────────────────────────────────────────────────────────

let autosaveTimer = null;
const AUTOSAVE_DEBOUNCE_MS = 500;

export function markProjectModified() {
  currentProject.meta.modified = nowISO();
  scheduleAutosave();
}

export function scheduleAutosave() {
  // Step 1: stubbed. In Step 2 we’ll wire this to storage.js (IndexedDB).
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    // Placeholder. We keep it quiet to avoid console spam.
    // console.log("(autosave stub) would persist project:", currentProject.id);
  }, AUTOSAVE_DEBOUNCE_MS);
}

export const mutations = {
  // Audio
  setBpm(bpm) {
    currentProject.audio.bpm = Number(bpm);
    markProjectModified();
  },
  setQuantize(q) {
    currentProject.audio.quantize = q;
    markProjectModified();
  },
  setSwing(swing0to1) {
    currentProject.audio.swing = Number(swing0to1);
    markProjectModified();
  },
  setLatencyMs(ms) {
    currentProject.audio.latencyMs = Number(ms);
    timing.inputLatency = currentProject.audio.latencyMs / 1000;
    markProjectModified();
  },

  // UI
  setZoom(z) {
    currentProject.ui.zoom = Number(z);
    markProjectModified();
  },
  toggleSnap() {
    currentProject.ui.snap = !currentProject.ui.snap;
    markProjectModified();
  },
  setSnap(on) {
    currentProject.ui.snap = !!on;
    markProjectModified();
  },

  // Timeline
  addClip(clip) {
    currentProject.timeline.clips.push(clip);
    markProjectModified();
  },
  clearClips() {
    currentProject.timeline.clips = [];
    markProjectModified();
  },
  bumpNextClipId() {
    currentProject.timeline.nextId += 1;
    markProjectModified();
  },

  //Clip Edits
  updateClip(id, patch) {
    const clip = currentProject.timeline.clips.find(c => c.id === id);
    if (!clip) return;

    Object.assign(clip, patch);
    markProjectModified();
  },

  removeClip(id) {
    currentProject.timeline.clips =
      currentProject.timeline.clips.filter(c => c.id !== id);

    markProjectModified();
  },

};

export function getProject() {
  return currentProject;
}

export function setCurrentProject(projectObj) {
  // Safety: shallow validation now, deeper later.
  if (!projectObj || typeof projectObj !== "object") {
    throw new Error("setCurrentProject: invalid project");
  }
  currentProject = projectObj;
  // Keep engine timing consistent
  timing.inputLatency = (currentProject.audio?.latencyMs ?? 45) / 1000;
}

function mutateTimelineBarsVisible(v) {
  currentProject.timeline.barsVisible = Number(v);
  markProjectModified();
}