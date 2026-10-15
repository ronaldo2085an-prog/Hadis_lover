/* انیمیشن قلب بزرگ ساخته‌شده از قلب‌های کوچک (منحنی پارامتریک قلب) */
(function (global) {
  'use strict';
  const PINKS = ['#FF36B9', '#FF1493', '#FF6AD5', '#FF8ACB', '#C026D3', '#A855F7'];
  const unit = new Path2D(); // یک قلب کوچک در مختصات واحد
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3) / 17;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
    i ? unit.lineTo(x, y) : unit.moveTo(x, y);
  }
  unit.closePath();

  function buildPoints() { // لایه‌های هم‌مرکز روی منحنی قلب
    const pts = [];
    [[1, 46], [.78, 34], [.56, 22], [.34, 12], [.14, 4]].forEach(([s, n], li) => {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2 + li * 0.15;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({ nx: x * s / 17, ny: y * s / 17, size: 0.07 - li * 0.006, layer: li });
      }
    });
    pts.sort((a, b) => a.layer - b.layer || b.ny - a.ny);
    pts.forEach((p, i) => { p.delay = i * 22; p.color = PINKS[(i * 7) % PINKS.length]; });
    return pts;
  }

  let raf = 0, offResize = null;
  function start(canvas, onDone) {
    stop();
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pts = buildPoints();
    const total = pts[pts.length - 1].delay + 500;
    const floaters = Array.from({ length: 14 }, () => ({
      a: Math.random() * 6.28, r: 0.62 + Math.random() * 0.3, sp: 0.2 + Math.random() * 0.4,
      s: 0.025 + Math.random() * 0.03, c: PINKS[(Math.random() * PINKS.length) | 0], ph: Math.random() * 6.28
    }));
    let W = 0, H = 0, done = false;
    const t0 = performance.now();

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (done) frame(performance.now(), true);
    }
    function heart(x, y, s, color, alpha) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill(unit); ctx.restore();
    }
    function frame(now, once) {
      const el = reduce ? total + 1000 : now - t0;
      const R = Math.min(W, H) * 0.44, cx = W / 2, cy = H * 0.5;
      ctx.clearRect(0, 0, W, H);
      const beat = done && !reduce ? 1 + 0.035 * Math.pow(Math.sin(el / 260), 8) : 1;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
      g.addColorStop(0, `rgba(255,54,185,${0.38 * Math.min(1, el / total)})`); g.addColorStop(1, 'rgba(255,54,185,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.shadowColor = '#FF36B9'; ctx.shadowBlur = 8;
      for (const p of pts) {
        const k = Math.min(1, Math.max(0, (el - p.delay) / 380));
        if (!k) continue;
        const e = 1 - Math.pow(1 - k, 3), over = e + Math.sin(k * Math.PI) * 0.25;
        heart(cx + p.nx * R * beat, cy + p.ny * R * beat, p.size * R * 2 * over * beat, p.color, e);
      }
      ctx.shadowBlur = 0;
      if (el > total * 0.5 && !reduce) {
        for (const f of floaters) {
          const a = f.a + el / 1000 * f.sp, yy = Math.sin(el / 700 + f.ph) * 6;
          heart(cx + Math.cos(a) * R * f.r * 1.35, cy + Math.sin(a) * R * f.r * 1.1 + yy, f.s * R * 2, f.c, 0.7);
        }
      }
      if (!done && el >= total) { done = true; onDone && onDone(); }
      if (!once && (!reduce || !done)) raf = requestAnimationFrame(frame);
    }
    resize();
    const ro = new ResizeObserver(resize); // با تغییر اندازه بوم، دوباره رسم می‌شود
    ro.observe(canvas);
    offResize = () => ro.disconnect();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; offResize && offResize(); offResize = null; }

  global.HeartAnimation = { start, stop };
})(window);
