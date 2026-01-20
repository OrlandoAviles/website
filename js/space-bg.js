export function initSpaceBackground() {
  const canvas = document.getElementById("space");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let W = 0,
    H = 0,
    DPR = 1;
  const layers = [];

  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    build();
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function build() {
    layers.length = 0;

    const config = [
      { count: 130, speed: 6, sizeMin: 0.6, sizeMax: 1.6, alpha: 0.55 },
      { count: 95, speed: 14, sizeMin: 0.8, sizeMax: 2.1, alpha: 0.35 },
      { count: 65, speed: 26, sizeMin: 1.2, sizeMax: 2.8, alpha: 0.22 },
    ];

    for (const c of config) {
      const stars = [];
      for (let i = 0; i < c.count; i++) {
        const huePick = Math.random();
        let tint = "255,255,255";
        if (huePick < 0.18) tint = "76,175,239";
        else if (huePick < 0.26) tint = "76,239,161";
        else if (huePick < 0.29) tint = "175,76,239";

        stars.push({
          x: rand(0, W),
          y: rand(0, H),
          r: rand(c.sizeMin, c.sizeMax),
          v: rand(c.speed * 0.6, c.speed * 1.4),
          a: rand(c.alpha * 0.6, c.alpha * 1.0),
          tint,
        });
      }
      layers.push(stars);
    }
  }

  function drawBg() {
    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(
      W * 0.2,
      H * 0.12,
      0,
      W * 0.2,
      H * 0.12,
      640,
    );
    g1.addColorStop(0, "rgba(76,175,239,0.14)");
    g1.addColorStop(1, "rgba(0,0,0,0)");

    const g2 = ctx.createRadialGradient(
      W * 0.78,
      H * 0.3,
      0,
      W * 0.78,
      H * 0.3,
      520,
    );
    g2.addColorStop(0, "rgba(76,239,161,0.09)");
    g2.addColorStop(1, "rgba(0,0,0,0)");

    const g3 = ctx.createRadialGradient(
      W * 0.55,
      H * 0.95,
      0,
      W * 0.55,
      H * 0.95,
      600,
    );
    g3.addColorStop(0, "rgba(175,76,239,0.07)");
    g3.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    drawBg();

    for (let li = 0; li < layers.length; li++) {
      const stars = layers[li];
      for (const s of stars) {
        s.y += s.v * dt;
        if (s.y > H + 10) {
          s.y = -10;
          s.x = rand(0, W);
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.tint},${s.a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(tick);
}
