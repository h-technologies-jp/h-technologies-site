(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu ---------- */
  const menuButton = document.querySelector('.hd-menu');
  const menu = document.querySelector('.mn');
  if (menuButton && menu) {
    const setMenu = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      menu.classList.toggle('open', open);
      menu.inert = !open;
      document.body.classList.toggle('menu-open', open);
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Header follows the section beneath it ---------- */
  const header = document.querySelector('.hd');
  if (header) {
    const blocks = Array.from(document.querySelectorAll('main > *, .ft'));
    let queued = false;
    const syncHeader = () => {
      queued = false;
      const probe = header.offsetHeight / 2;
      const under = blocks.find((block) => {
        const rect = block.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });
      header.classList.toggle('dark', Boolean(under && under.matches('.dark, .ft')));
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    const queueSync = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(syncHeader);
    };
    window.addEventListener('scroll', queueSync, { passive: true });
    window.addEventListener('resize', queueSync);
    syncHeader();
  }

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('in'));
  }

  /* ---------- Hero object: the rising bar of the H mark, set in motion ---------- */
  const canvas = document.querySelector('[data-h-object]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const host = canvas.parentElement;

  // Proportions follow the logo: two pillars and a bar that climbs to the right.
  // Everything is filled even-odd, so wherever a bar crosses a pillar (or another
  // bar) the overlap is cut out, the way the logo cuts its bar out of the left pillar.
  const TOP = 1.15;
  const PILLAR = [0.46, 0.94];
  const SLOPE = 0.353;
  const NORM = Math.hypot(1, SLOPE);
  const DIR = [1 / NORM, SLOPE / NORM];
  const CAMERA = 6;
  const CYCLE = 12;

  // The bar of the logo itself. It grows out to the right pillar, rests exactly
  // where the logo has it, then is drawn into that pillar.
  const MAIN = { half: 0.25 / NORM, tail: -1.42, dock: PILLAR[0] };

  // Streaks: thinner echoes of the bar on parallel lanes. They launch from the
  // lowest lane upward, so each wave climbs through the mark.
  const REACH = [-1.5, 1.7];
  const LIMIT = 1.42;
  const WAVE = 6;
  const HALVES = [0.006, 0.03, 0.006, 0.006, 0.07, 0.006, 0.014, 0.006, 0.045, 0.006, 0.006, 0.09, 0.006, 0.02, 0.006, 0.006];
  const DEPTHS = [0.3, -0.45, 0.15, -0.2, 0.5, -0.35, 0.25, -0.1, -0.5, 0.4, -0.25, 0.35, 0.1, -0.4, 0.45, -0.15];
  const LAGS = [0.36, 0.24, 0.3, 0.4, 0.2, 0.34, 0.28, 0.38, 0.22, 0.32, 0.4, 0.18, 0.36, 0.26, 0.3, 0.38];
  const STREAKS = HALVES.map((half, index) => {
    const along = index / (HALVES.length - 1);
    const lane = -1.08 + 2.16 * along;
    return {
      lane,
      half,
      z: DEPTHS[index],
      lag: LAGS[index],
      delay: along * 0.5,
      from: Math.max(REACH[0], (-LIMIT - lane) / SLOPE),
      to: Math.min(REACH[1], (LIMIT - lane) / SLOPE),
    };
  });

  let width = 0;
  let height = 0;
  let ratio = 1;
  let scale = 1;
  let centerX = 0;
  let centerY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollAmount = 0;
  let frame = 0;
  let running = false;
  let onScreen = true;
  const startedAt = performance.now();

  const clamp = (x) => Math.min(1, Math.max(0, x));
  const ease = (x) => {
    const t = clamp(x);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 4);
  const span = (x, a, b) => clamp((x - a) / (b - a));

  // Camera, set once per frame.
  let cosYaw = 1;
  let sinYaw = 0;
  let cosPitch = 1;
  let sinPitch = 0;
  let spread = 1;

  const lineToPoint = (x, y, z, first) => {
    const depthZ = z * spread;
    const rx = x * cosYaw + depthZ * sinYaw;
    const rz = -x * sinYaw + depthZ * cosYaw;
    const py = y * cosPitch - rz * sinPitch;
    const pz = y * sinPitch + rz * cosPitch;
    const depth = CAMERA / (CAMERA - pz);
    const sx = centerX + rx * depth * scale;
    const sy = centerY - py * depth * scale;
    if (first) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  };

  const polygon = (points, z) => {
    points.forEach((point, index) => lineToPoint(point[0], point[1], z, index === 0));
    ctx.closePath();
  };

  // A bar on a lane, from tail to head (both measured as x), square-ended like the logo's.
  const bar = (lane, half, tail, head) => {
    const nx = -DIR[1] * half;
    const ny = DIR[0] * half;
    const y0 = lane + SLOPE * tail;
    const y1 = lane + SLOPE * head;
    return [[tail + nx, y0 + ny], [head + nx, y1 + ny], [head - nx, y1 - ny], [tail - nx, y0 - ny]];
  };

  // Keep the part of a polygon left of x = limit.
  const clipRight = (points, limit) => {
    const out = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const aIn = a[0] <= limit;
      const bIn = b[0] <= limit;
      if (aIn) out.push(a);
      if (aIn !== bIn) {
        const t = (limit - a[0]) / (b[0] - a[0]);
        out.push([limit, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  };

  const layout = () => {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const wide = width > 860;
    scale = wide ? Math.min(height * 0.25, width * 0.158) : Math.min(height * 0.16, width * 0.25);
    centerX = wide ? width * 0.715 : width * 0.52;
    centerY = wide ? height * 0.47 : height * 0.3;
    draw(performance.now());
  };

  const draw = (now) => {
    if (!width || !height) return;
    // Without motion, hold the frame where the bar rests in the logo's position.
    const seconds = reducedMotion ? CYCLE * 0.42 : (now - startedAt) / 1000;
    pointerX += (targetX - pointerX) * 0.05;
    pointerY += (targetY - pointerY) * 0.05;

    const yaw = -0.2 + 0.1 * Math.sin(seconds * 0.23) + pointerX * 0.24 - scrollAmount * 0.5;
    const pitch = 0.03 + 0.025 * Math.sin(seconds * 0.17) + pointerY * 0.07;
    cosYaw = Math.cos(yaw);
    sinYaw = Math.sin(yaw);
    cosPitch = Math.cos(pitch);
    sinPitch = Math.sin(pitch);
    spread = 1 + scrollAmount * 1.6;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.beginPath();

    // Pillars rise from the ground on load.
    const riseLeft = reducedMotion ? 1 : easeOut(seconds / 1.3);
    const riseRight = reducedMotion ? 1 : easeOut((seconds - 0.18) / 1.3);
    if (riseLeft > 0.001) {
      const top = -TOP + 2 * TOP * riseLeft;
      polygon([[-PILLAR[1], -TOP], [-PILLAR[0], -TOP], [-PILLAR[0], top], [-PILLAR[1], top]], 0);
    }
    if (riseRight > 0.001) {
      const top = -TOP + 2 * TOP * riseRight;
      polygon([[PILLAR[0], -TOP], [PILLAR[1], -TOP], [PILLAR[1], top], [PILLAR[0], top]], 0);
    }

    // The logo's bar: grow, rest, and into the right pillar.
    const p = (seconds / CYCLE) % 1;
    const inside = MAIN.dock + 0.4;
    const head = MAIN.tail + (inside - MAIN.tail) * ease(span(p, 0.06, 0.24));
    const tail = MAIN.tail + (inside - MAIN.tail) * ease(span(p, 0.56, 0.76));
    if (head - tail > 0.004) {
      const shape = clipRight(bar(0, MAIN.half, tail, head), MAIN.dock);
      if (shape.length > 2) polygon(shape, 0);
    }

    // Each streak lives for half a wave: the head runs out, the tail follows.
    for (const streak of STREAKS) {
      const q = ((seconds / WAVE - streak.delay) % 1 + 1) % 1 * 2;
      if (q >= 1) continue;
      const reach = streak.to - streak.from;
      const front = streak.from + reach * ease(q / (1 - streak.lag));
      const back = streak.from + reach * ease((q - streak.lag) / (1 - streak.lag));
      // Thickness comes in with length, so a streak never pops in as a speck.
      const length = front - back;
      if (length < 0.06) continue;
      polygon(bar(streak.lane, streak.half * clamp((length - 0.06) / 0.3), back, front), streak.z);
    }

    ctx.fill('evenodd');
  };

  const tick = (now) => {
    frame = requestAnimationFrame(tick);
    draw(now);
  };
  const setRunning = () => {
    const shouldRun = !reducedMotion && onScreen && !document.hidden;
    if (shouldRun === running) return;
    running = shouldRun;
    cancelAnimationFrame(frame);
    if (running) frame = requestAnimationFrame(tick);
  };

  new ResizeObserver(layout).observe(host);
  if (!reducedMotion) {
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    const onScroll = () => {
      scrollAmount = Math.min(1, Math.max(0, window.scrollY / Math.max(1, height)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      setRunning();
    }).observe(host);
    document.addEventListener('visibilitychange', setRunning);
    setRunning();
  }
})();
