(function() {
  'use strict';

  // Identificador da sessão
  var sid = localStorage.getItem('ml_visitor_sid');
  if (!sid) {
    sid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    try { localStorage.setItem('ml_visitor_sid', sid); } catch(_) {}
  }

  // Identificação Bot / Crawler (Falsos) vs Humano (Real)
  var ua = navigator.userAgent || '';
  var isWebDriver = !!navigator.webdriver;
  var botRegex = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|meta-externalagent|tiktokbot|bytedance|bytespider|bingbot|yandex|duckduckbot|slurp|baiduspider|headlesschrome|phantomjs|lighthouse|ptst/i;
  var isBot = isWebDriver || botRegex.test(ua);

  // Parâmetros de Origem / Rastreio
  var sp = new URLSearchParams(window.location.search);
  var utms = {
    source: sp.get('utm_source') || sp.get('src') || '',
    medium: sp.get('utm_medium') || '',
    campaign: sp.get('utm_campaign') || '',
    content: sp.get('utm_content') || '',
    term: sp.get('utm_term') || '',
    sck: sp.get('sck') || ''
  };

  var page = window.location.pathname || '/';
  var now = Date.now();

  function getDB() {
    try {
      return JSON.parse(localStorage.getItem('ml_analytics_db') || '{"sessions":{},"events":[]}');
    } catch(_) {
      return { sessions: {}, events: [] };
    }
  }

  function saveDB(db) {
    try {
      if (db.events.length > 400) db.events = db.events.slice(-400);
      localStorage.setItem('ml_analytics_db', JSON.stringify(db));
    } catch(_) {}
  }

  var db = getDB();
  var sess = db.sessions[sid];
  if (!sess) {
    sess = {
      id: sid,
      firstSeen: now,
      lastSeen: now,
      isBot: isBot,
      device: /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop',
      page: page,
      initialPage: page,
      referrer: document.referrer || 'Direto',
      origin: utms.source ? (utms.source + (utms.campaign ? ' / ' + utms.campaign : '')) : (document.referrer ? document.referrer.split('/')[2] : 'Acesso Direto'),
      utms: utms,
      geo: { city: '', region: '', country: 'Brasil', ip: '' },
      cartAdded: false,
      pixAttempted: false,
      pixError: null,
      paid: false,
      engaged: false,      // mexeu na tela ou clicou
      bounced: true,       // so entrou e saiu sem mexer
      screenActivity: 0,   // toques, scrolls e interacoes na tela
      clicks: 0,
      durationSec: 0,
      actions: []
    };
    db.sessions[sid] = sess;

    // Busca IP e localização
    fetch('https://ipwho.is/').then(function(r) { return r.json(); }).then(function(d) {
      if (d && d.success) {
        var curDb = getDB();
        if (curDb.sessions[sid]) {
          curDb.sessions[sid].geo = {
            city: d.city || '',
            region: d.region_code || d.region || '',
            country: d.country || 'Brasil',
            ip: d.ip || ''
          };
          saveDB(curDb);
        }
      }
    }).catch(function() {});
  } else {
    sess.lastSeen = now;
    sess.page = page;
  }

  sess.actions.push({ type: 'pageview', page: page, time: now });
  db.events.push({ sid: sid, type: 'pageview', page: page, time: now, origin: sess.origin });
  saveDB(db);

  // Monitora toques, cliques e rolagem na tela (mexendo na tela estilo Pixel)
  function markScreenActivity(tipo) {
    var curDb = getDB();
    if (curDb.sessions[sid]) {
      curDb.sessions[sid].screenActivity = (curDb.sessions[sid].screenActivity || 0) + 1;
      curDb.sessions[sid].lastSeen = Date.now();
      curDb.sessions[sid].engaged = true;
      curDb.sessions[sid].bounced = false;
      if (tipo === 'click') {
        curDb.sessions[sid].clicks = (curDb.sessions[sid].clicks || 0) + 1;
      }
      saveDB(curDb);
    }
  }

  window.addEventListener('click', function() { markScreenActivity('click'); }, { passive: true });
  window.addEventListener('scroll', function() { markScreenActivity('scroll'); }, { passive: true });
  window.addEventListener('touchstart', function() { markScreenActivity('touch'); }, { passive: true });
  window.addEventListener('touchmove', function() { markScreenActivity('move'); }, { passive: true });

  setInterval(function() {
    var curDb = getDB();
    if (curDb.sessions[sid]) {
      curDb.sessions[sid].durationSec = (curDb.sessions[sid].durationSec || 0) + 5;
      curDb.sessions[sid].lastSeen = Date.now();
      saveDB(curDb);
    }
  }, 5000);

  // Eventos de funil (Carrinho, Pix, Erros, Pagamento)
  window.ML_ANALYTICS = {
    track: function(action, details) {
      try {
        var curDb = getDB();
        var s = curDb.sessions[sid] || {};
        s.lastSeen = Date.now();
        s.engaged = true;
        s.bounced = false;

        if (action === 'add_to_cart') {
          s.cartAdded = true;
        } else if (action === 'pix_attempt') {
          s.pixAttempted = true;
          s.cartAdded = true;
        } else if (action === 'pix_error') {
          s.pixError = details || 'Erro ao gerar Pix';
        } else if (action === 'pix_success') {
          s.pixAttempted = true;
          s.pixError = null;
        } else if (action === 'pix_paid') {
          s.paid = true;
          s.pixError = null;
        }

        s.actions = s.actions || [];
        s.actions.push({ type: action, details: details || null, time: Date.now(), page: location.pathname });
        curDb.events.push({ sid: sid, type: action, details: details || null, time: Date.now(), origin: s.origin });
        curDb.sessions[sid] = s;
        saveDB(curDb);
      } catch(_) {}
    }
  };

  if (page.indexOf('/roleta') !== -1 || page.indexOf('/rastreio') !== -1) {
    window.ML_ANALYTICS.track('pix_success', 'Avançou no funil pós-compra');
  }
})();
