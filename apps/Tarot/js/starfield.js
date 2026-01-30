window.Starfield = (() => {
  const canvas = document.getElementById("space");
  const ctx = canvas.getContext("2d");

  let W = 0,
    H = 0,
    DPR = 1;
  let layers = [];
  let streaks = [];
  let running = true;

  let hueA = FX.hueA;
  let hueB = FX.hueB;

  let morphActive = false;
  let morphStart = 0;
  let morphDuration = 1000;
  let hueAFrom = hueA,
    hueBFrom = hueB;
  let hueATo = hueA,
    hueBTo = hueB;

  const baseConfig = [
    { count: 170, speed: 6, sizeMin: 0.6, sizeMax: 1.5, alpha: 0.65, tw: 1.0 },
    { count: 120, speed: 14, sizeMin: 0.8, sizeMax: 2.0, alpha: 0.4, tw: 1.2 },
    { count: 80, speed: 26, sizeMin: 1.1, sizeMax: 2.6, alpha: 0.24, tw: 1.4 },
  ];

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function normalizeHue(h) {
    return ((h % 360) + 360) % 360;
  }

  function lerpHue(a, b, t) {
    a = normalizeHue(a);
    b = normalizeHue(b);
    let d = b - a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return normalizeHue(a + d * t);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setHues(a, b) {
    hueA = normalizeHue(a);
    hueB = normalizeHue(b);
  }

  function morphTo(a, b, durationMs = 1000) {
    hueAFrom = hueA;
    hueBFrom = hueB;
    hueATo = normalizeHue(a);
    hueBTo = normalizeHue(b);
    morphDuration = Math.max(150, durationMs | 0);
    morphStart = performance.now();
    morphActive = true;
  }

  function setIntensity(v01) {
    FX.intensity = clamp(v01, 0, 1);
    rebuild();
  }

  function tintForStar() {
    const roll = Math.random();
    if (roll < 0.7) return "white";
    const pickHue =
      roll < 0.86 ? hueA : roll < 0.97 ? hueB : (hueA + 180) % 360;
    return `hsl(${pickHue} 95% 72%)`;
  }

  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    rebuild();
  }

  function rebuild() {
    layers = [];
    streaks = [];

    const density = FX.intensity <= 0 ? 0 : 0.35 + FX.intensity * 0.65;

    for (const c of baseConfig) {
      const stars = [];
      const count = Math.floor(c.count * density);

      for (let i = 0; i < count; i++) {
        stars.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(c.sizeMin, c.sizeMax),
          v: rand(c.speed * 0.6, c.speed * 1.4),

          baseA: rand(c.alpha * 0.6, c.alpha * 1.0),
          twSpeed: rand(0.8, 2.0) * c.tw,
          twPhase: rand(0, Math.PI * 2),

          tint: tintForStar(),
        });
      }
      layers.push(stars);
    }
  }

  function updateMorph(now) {
    if (!morphActive) return;

    const tRaw = (now - morphStart) / morphDuration;
    const t = clamp(tRaw, 0, 1);
    const e = easeInOutCubic(t);

    hueA = lerpHue(hueAFrom, hueATo, e);
    hueB = lerpHue(hueBFrom, hueBTo, e);

    for (const layer of layers) {
      for (let i = 0; i < layer.length; i += 7) {
        if (Math.random() < 0.5) layer[i].tint = tintForStar();
      }
    }

    if (t >= 1) {
      morphActive = false;
      hueA = hueATo;
      hueB = hueBTo;
    }
  }

  function drawBg() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, W, H);

    const R = Math.max(W, H);

    const g1 = ctx.createRadialGradient(
      W * 0.22,
      H * 0.14,
      0,
      W * 0.22,
      H * 0.14,
      R * 0.72,
    );
    g1.addColorStop(0, `hsla(${hueA} 92% 62% / 0.18)`);
    g1.addColorStop(0.42, `hsla(${hueA} 92% 62% / 0.06)`);
    g1.addColorStop(1, `rgba(0,0,0,0)`);

    const g2 = ctx.createRadialGradient(
      W * 0.8,
      H * 0.32,
      0,
      W * 0.8,
      H * 0.32,
      R * 0.62,
    );
    g2.addColorStop(0, `hsla(${hueB} 92% 62% / 0.14)`);
    g2.addColorStop(0.44, `hsla(${hueB} 92% 62% / 0.05)`);
    g2.addColorStop(1, `rgba(0,0,0,0)`);

    const hueC = normalizeHue((hueA + hueB) * 0.5);
    const g3 = ctx.createRadialGradient(
      W * 0.56,
      H * 0.94,
      0,
      W * 0.56,
      H * 0.94,
      R * 0.7,
    );
    g3.addColorStop(0, `hsla(${hueC} 90% 60% / 0.08)`);
    g3.addColorStop(0.5, `hsla(${hueC} 90% 60% / 0.03)`);
    g3.addColorStop(1, `rgba(0,0,0,0)`);

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  function spawnShootingStar() {
    const fromLeft = Math.random() < 0.5;

    const x = fromLeft ? rand(-80, W * 0.3) : rand(W * 0.7, W + 80);
    const y = rand(0, H * 0.35);

    const dirX = fromLeft ? rand(0.8, 1.2) : rand(-1.2, -0.8);
    const dirY = rand(0.9, 1.4);

    streaks.push({
      x,
      y,
      dx: dirX,
      dy: dirY,
      speed: rand(850, 1400),
      length: rand(120, 240),
      tint: tintForStar(),
      t: 0,
      life: rand(0.6, 1.1),
    });
  }

  function updateShootingStars(dt) {
    if (FX.intensity <= 0) return;

    const baseSeconds = rand(12, 20);
    const scaledSeconds = baseSeconds / Math.max(0.18, FX.intensity);
    const p = 1 / scaledSeconds;

    if (Math.random() < p * dt) spawnShootingStar();

    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      s.t += dt;
      s.x += s.dx * s.speed * dt;
      s.y += s.dy * s.speed * dt;
      if (s.t >= s.life) streaks.splice(i, 1);
    }
  }

  function renderShootingStars() {
    const mult = FX.intensity;

    for (const s of streaks) {
      const k = Math.min(1, s.t / s.life);
      const fade = Math.sin(Math.PI * k) * mult;

      const x2 = s.x - s.dx * s.length;
      const y2 = s.y - s.dy * s.length;

      ctx.save();
      ctx.lineCap = "round";

      const grad = ctx.createLinearGradient(x2, y2, s.x, s.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.25, `rgba(255,255,255,${0.08 * fade})`);
      grad.addColorStop(1, `rgba(255,255,255,${0.4 * fade})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      ctx.strokeStyle = s.tint;
      ctx.globalAlpha = 0.14 * fade;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      ctx.globalAlpha = 0.85 * fade;
      ctx.fillStyle = s.tint;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  let last = performance.now();
  function tick(now) {
    if (!running) return;

    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    updateMorph(now);
    drawBg();

    const alphaMult = FX.intensity;

    for (const stars of layers) {
      for (const s of stars) {
        s.y += s.v * dt;

        if (s.y > H + 10) {
          s.y = -10;
          s.x = rand(0, W);
          s.tint = tintForStar();
          s.twPhase = rand(0, Math.PI * 2);
        }

        const twStrength = 0.35 * FX.intensity;
        const tw =
          0.65 +
          twStrength +
          twStrength * Math.sin((now / 1000) * s.twSpeed + s.twPhase);

        const a = clamp(s.baseA * tw * alphaMult, 0, 1);
        if (a <= 0.001) continue;

        ctx.beginPath();
        ctx.globalAlpha = a;
        ctx.fillStyle = s.tint;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    updateShootingStars(dt);
    renderShootingStars();

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(tick);

  return { setIntensity, setHues, morphTo };
})();
