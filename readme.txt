Creative Dojo 🥋

Development Training Grounds
Local-first · Single-file · No backend

Creative Dojo is my ongoing practice environment where I build a flagship RPG alongside the dev tools that support it (pixel art, writing tools, audio experiments, etc). Everything is built with vanilla JavaScript to strengthen fundamentals and keep the workflow fast.

⭐ Main Game: Top-Down RPG + ATB / Paradigm Combat

A mobile-first top-down RPG prototype built in vanilla JavaScript. Explore a field scene with joystick controls and random encounters. Battles switch into an ATB-based “paradigm combat” system where party roles can be shifted under time pressure.

Game Modules

TopDown.html — exploration + encounters + scene switching

FF13 3v1.html — ATB combat prototype module

🛠️ Dev Tools

These tools support the flagship game and also serve as standalone practice projects.

List.html — Lists / notes / tracking tool

Journal.html — Daily writing + progress log

PixelSpriteEditor.html — Pixel sprite / spritesheet editor

Planned Tools

Web Audio Beatpad — sound effects + loop generation (Web Audio API)

Particle Engine — reusable FX system (hits, healing, UI polish)

🚀 Live Demo

If you’re viewing this on GitHub Pages / Netlify, the project hub is:

index.html — Creative Dojo launcher page

▶️ Run Locally

Because everything is local-first and single-file, you can run it with any static server.

Option A: VS Code Live Server

Install “Live Server”

Right click index.html → Open with Live Server

Option B: Python
python3 -m http.server 8000


Then open:
http://localhost:8000

✅ Current Status

Main RPG loop: exploration → random encounter → battle → return ✅

Dev tool suite active ✅

Beatpad + Particle Engine planned ⏳

📌 Milestones (Indexed Progress)

These are the major checkpoints (useful for reviewing progress without digging through daily commits).

✅ v0.1.0 — Narrowed scope to one main game + dev tools

✅ v0.1.1 — Homepage redesign (Dev Tools / Main Game / Lab sections)

⏳ v0.2.0 — Web Audio Beatpad tool

⏳ v0.3.0 — Particle Engine + FX presets

See GitHub Releases for version notes and snapshots.

🗺️ Roadmap (Next Up)

Short-term focus is always: make the main game more playable and make the tools reusable.

RPG

Paradigm presets (1 click shifts full party roles)

Target selection

Loot / XP / basic inventory loop

UI polish and transitions

Tools

Beatpad presets for RPG sound pack

Particle Engine presets for combat + field effects

Pixel editor export improvements (spritesheet + metadata)

✨ Design Rules

These are intentional constraints:

Local-first (no accounts, no backend)

Single-file projects when possible

Fast iteration

Mobile-friendly input

Built with vanilla JS to master fundamentals

📷 Screenshots / Media

(Coming soon)
