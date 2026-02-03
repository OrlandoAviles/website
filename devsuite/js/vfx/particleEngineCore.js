// Particle Engine Core
// Pure simulation + rendering. No DOM, no UI, no storage.

export function createParticleEngine(ctx) {
  const particles = [];

  const settings = {
    gravity: 240,
    blendMode: "source-over",
    maxParticles: 6000
  };

  let currentPreset = null;

  /* ------------------------- */
  /* Utilities                 */
  /* ------------------------- */

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  function wrap360(h) {
    h = h % 360;
    if (h < 0) h += 360;
    return h;
  }

  function randHue(hA, hB) {
    hA = wrap360(hA);
    hB = wrap360(hB);
    let delta = (hB - hA + 360) % 360;
    if (delta > 180) delta -= 360;
    return wrap360(hA + delta * Math.random());
  }

  function lerpHue(h0, h1, t) {
    h0 = wrap360(h0);
    h1 = wrap360(h1);
    let delta = (h1 - h0 + 360) % 360;
    if (delta > 180) delta -= 360;
    return wrap360(h0 + delta * t);
  }

  function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;

    const c = v * s;
    const hh = wrap360(h) / 60;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (hh < 1) [r, g, b] = [c, x, 0];
    else if (hh < 2) [r, g, b] = [x, c, 0];
    else if (hh < 3) [r, g, b] = [0, c, x];
    else if (hh < 4) [r, g, b] = [0, x, c];
    else if (hh < 5) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  function rgbToCss({ r, g, b }) {
    return `rgb(${r},${g},${b})`;
  }

  function randomHSV(p) {
    return {
      h: randHue(p.hueA, p.hueB),
      s: rand(p.satMin, p.satMax),
      v: rand(p.valMin, p.valMax)
    };
  }

  /* ------------------------- */
  /* Shapes                    */
  /* ------------------------- */

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();
  }

  function drawPlus(ctx, cx, cy, size) {
    const arm = size * 0.75;
    const thick = Math.max(2, size * 0.55);
    ctx.beginPath();
    ctx.rect(cx - thick / 2, cy - arm, thick, arm * 2);
    ctx.rect(cx - arm, cy - thick / 2, arm * 2, thick);
  }

  function renderParticle(ctx, p) {
    if (p.shape === "square") {
      const s = p.size * 2;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      return;
    }
    if (p.shape === "star") {
      drawStar(ctx, p.x, p.y, 5, p.size * 1.6, p.size * 0.75);
      ctx.fill();
      return;
    }
    if (p.shape === "plus") {
      drawPlus(ctx, p.x, p.y, p.size * 1.8);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ------------------------- */
  /* Public API                */
  /* ------------------------- */

  function setPreset(preset) {
    currentPreset = preset;
  }

  function setSettings(newSettings) {
    Object.assign(settings, newSettings);
  }

  function clear() {
    particles.length = 0;
  }

  function emit(x, y, strength = 60) {
    if (!currentPreset) return;

    const p = currentPreset;
    const count = Math.floor(clamp(strength, 1, 400) * p.mult);

    for (let i = 0; i < count; i++) {
      if (particles.length >= settings.maxParticles) break;

      const angle = rand(degToRad(p.spreadA), degToRad(p.spreadB));
      const speed = rand(p.speedMin, p.speedMax);
      const size = rand(p.sizeMin, p.sizeMax);
      const life = rand(p.lifeMin, p.lifeMax);
      const drag = rand(p.dragMin, p.dragMax);

      const hsv0 = randomHSV(p);
      const hsv1 = p.hueAnim ? randomHSV(p) : hsv0;

      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        age: 0,
        drag,
        gravityScale: p.gravityScale,
        hsv0,
        hsv1,
        alpha: 1,
        fade: p.fade,
        shape: p.shape
      });
    }
  }

  function update(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }

      p.vy += settings.gravity * p.gravityScale * dt;
      p.vx -= p.vx * p.drag * dt;
      p.vy -= p.vy * p.drag * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const t = p.age / p.life;
      p.alpha = Math.max(0, 1 - t * p.fade);
    }
  }

  function render(width, height) {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = settings.blendMode;

    for (const p of particles) {
      if (p.alpha <= 0) continue;

      const t = p.age / p.life;
      const h = lerpHue(p.hsv0.h, p.hsv1.h, t);
      const s = p.hsv0.s + (p.hsv1.s - p.hsv0.s) * t;
      const v = p.hsv0.v + (p.hsv1.v - p.hsv0.v) * t;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = rgbToCss(hsvToRgb(h, s, v));
      renderParticle(ctx, p);
      ctx.restore();
    }

    ctx.restore();
  }

  return {
    setPreset,
    setSettings,
    emit,
    update,
    render,
    clear
  };
}
