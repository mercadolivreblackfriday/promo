const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ── Carrega variáveis do arquivo .env ─────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        env[k] = v;
      }
    }
  }
  return env;
}

const ENV = loadEnv();
const PINGUPAG_SECRET_KEY = process.env.PINGUPAG_SECRET_KEY || ENV.PINGUPAG_SECRET_KEY || 'pingupag_sk_185039b4a3f9c649956d48c5cfdeffdc70cb188711ef3a5d1d73c7c4f3a6dacd';
const PINGUPAG_STORE_ID = process.env.PINGUPAG_STORE_ID || ENV.PINGUPAG_STORE_ID || '274';
const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || ENV.TIKTOK_PIXEL_ID || 'DBQKBH3C77U6JJ8MCCKG';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || ENV.TIKTOK_ACCESS_TOKEN || '492cf0afdd40b146b8e2f8d9004c563416906fa2';
const PORT = process.env.PORT || ENV.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 48-50: sem simulador automático global
const SIMULATED_PAID_TXIDS = new Set();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Endpoint para criar PIX na PinguPag
  if (pathname.includes('/api/gerar-pix.php') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        console.log('[GERAR PIX] Body recebido:', body);
        const input = JSON.parse(body || '{}');
        const priceCents = Number(input.price_cents || 6990);
        const customer = input.customer || {};

        function isValidCpf(c) {
          if (!c || c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
          let s = 0, r;
          for (let i = 1; i <= 9; i++) s += parseInt(c.substring(i - 1, i), 10) * (11 - i);
          r = (s * 10) % 11;
          if (r === 10 || r === 11) r = 0;
          if (r !== parseInt(c.substring(9, 10), 10)) return false;
          s = 0;
          for (let i = 1; i <= 10; i++) s += parseInt(c.substring(i - 1, i), 10) * (12 - i);
          r = (s * 10) % 11;
          if (r === 10 || r === 11) r = 0;
          return r === parseInt(c.substring(10, 11), 10);
        }
        let rawCpf = (customer.cpf || customer.document || '').replace(/\D/g, '');
        const cpfDigits = isValidCpf(rawCpf) ? rawCpf : '05481744180';
        const phoneDigits = (customer.phone || '11999999999').replace(/\D/g, '');
        const refId = 'REF-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

        const tracking = input.tracking || {};
        const utmObj = {
          utm_source: input.utm_source || tracking.utm_source || '',
          utm_medium: input.utm_medium || tracking.utm_medium || '',
          utm_campaign: input.utm_campaign || tracking.utm_campaign || '',
          utm_content: input.utm_content || tracking.utm_content || '',
          utm_term: input.utm_term || tracking.utm_term || '',
          src: input.src || tracking.src || '',
          sck: input.sck || tracking.sck || ''
        };

        const pinguPayload = JSON.stringify({
          amount: priceCents,
          description: input.produto || input.description || 'Produto Mercado Livre',
          reference: refId,
          source: 'api_externa',
          customer: {
            name: customer.name || 'Cliente Mercado Livre',
            email: customer.email || 'contato@cliente.com',
            phone: phoneDigits,
            document: cpfDigits
          },
          tracking: utmObj
        });

        console.log('[GERAR PIX] Enviando para PinguPag:', pinguPayload);

        const pinguReq = https.request({
          hostname: 'app.pingupag.com',
          path: '/gateway/v1/transaction',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': PINGUPAG_SECRET_KEY,
            'Content-Length': Buffer.byteLength(pinguPayload)
          }
        }, pinguRes => {
          let pinguData = '';
          pinguRes.on('data', chunk => pinguData += chunk);
          pinguRes.on('end', () => {
            console.log('[GERAR PIX] Resposta PinguPag HTTP', pinguRes.statusCode, ':', pinguData);
            try {
              const parsed = JSON.parse(pinguData);
              if (pinguRes.statusCode >= 200 && pinguRes.statusCode < 300 && (parsed.status === 'success' || parsed.qr_code)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  pixCode: parsed.qr_code || '',
                  qrCode: parsed.qr_code || '',
                  qr_code: parsed.qr_code || '',
                  qr_code_base64: parsed.qr_code_base64 || '',
                  pix_copia_e_cola: parsed.qr_code || '',
                  transacao_id: String(parsed.transaction_id || parsed.id || refId),
                  id: String(parsed.transaction_id || parsed.id || refId),
                  status: 'PENDING'
                }));
              } else {
                const errMsg = parsed.message || parsed.error || 'Erro ao gerar Pix na PinguPag';
                console.error('[GERAR PIX] Falha na PinguPag:', errMsg, parsed);
                res.writeHead(pinguRes.statusCode || 400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: errMsg, raw: parsed }));
              }
            } catch (err) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Erro ao processar resposta da PinguPag' }));
            }
          });
        });

        pinguReq.on('error', e => {
          console.error('[GERAR PIX] Erro de rede com PinguPag:', e.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        });

        pinguReq.write(pinguPayload);
        pinguReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload JSON inválido' }));
      }
    });
    return;
  }

  // 2. Endpoint para verificar status do PIX na PinguPag
  if (pathname.includes('/api/status-pix.php') && req.method === 'GET') {
    const txid = parsedUrl.query.id;
    if (!txid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'ID obrigatório' }));
      return;
    }

    // Consulta real de status na PinguPag
    const queryPath = `/gateway/v1/query?action=get_transaction&id=${encodeURIComponent(txid)}`;

    const pinguReq = https.request({
      hostname: 'app.pingupag.com',
      path: queryPath,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': PINGUPAG_SECRET_KEY
      }
    }, pinguRes => {
      let pinguData = '';
      pinguRes.on('data', chunk => pinguData += chunk);
      pinguRes.on('end', () => {
        try {
          const parsed = JSON.parse(pinguData);
          const raw = String(parsed.status || (Array.isArray(parsed) && parsed[0] ? parsed[0].status : 'PENDING')).toUpperCase();
          console.log(`[STATUS PIX] PinguPag retorno para transação ${txid}: status='${raw}' (HTTP ${pinguRes.statusCode})`);
          const mapped = ['PAID', 'APPROVED', 'COMPLETED', 'SUCCEEDED', 'PAGO'].includes(raw) ? 'APPROVED' : 'PENDING';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, status: mapped, transacao_id: txid }));
        } catch (err) {
          console.warn(`[STATUS PIX] Falha no parse JSON de ${txid}, mantendo PENDING.`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid }));
        }
      });
    });

    pinguReq.on('error', e => {
      console.warn(`[STATUS PIX] Erro de rede na consulta de ${txid}: ${e.message}, mantendo PENDING.`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid }));
    });
    pinguReq.end();
    return;
  }

  // 2.1 Endpoint para SIMULAR Pagamento (Ambiente de Testes)
  if (pathname.includes('/api/simular-pagamento') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const input = JSON.parse(body || '{}');
        if (input.id) SIMULATED_PAID_TXIDS.add(String(input.id));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Status atualizado.' }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'OK' }));
      }
    });
    return;
  }

  // 2.2 Endpoint para Tracking / Rastreio (Salvar e Consultar)
  if (pathname.includes('/api/tracking') || pathname.includes('/.netlify/functions/tracking')) {
    const trackingFile = path.join(__dirname, 'tracking_db.json');
    function loadTrackingDb() {
      try {
        if (fs.existsSync(trackingFile)) return JSON.parse(fs.readFileSync(trackingFile, 'utf8') || '{}');
      } catch (_) {}
      return {};
    }
    function saveTrackingDb(db) {
      try { fs.writeFileSync(trackingFile, JSON.stringify(db, null, 2), 'utf8'); } catch (_) {}
    }

    if (req.method === 'GET') {
      const code = (parsedUrl.query.code || parsedUrl.query.c || '').split('?')[0].trim().toUpperCase();
      const cpf = (parsedUrl.query.cpf || '').replace(/\D/g, '');
      const listAll = parsedUrl.query.all === 'true' || parsedUrl.query.list === 'true' || parsedUrl.query.admin === 'true';
      const db = loadTrackingDb();

      // Suporte para o Painel Admin listar todos os pedidos
      if (listAll) {
        const records = Object.values(db).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, total: records.length, records }));
        return;
      }

      let record = null;
      if (code && db[code]) {
        record = db[code];
      } else if (cpf) {
        for (const k in db) {
          const doc = (db[k].customer && (db[k].customer.cpf || db[k].customer.document || '')).replace(/\D/g, '');
          if (doc === cpf) { record = db[k]; break; }
        }
      }
      if (record) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, record }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Não encontrado' }));
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const code = (data.code || '').trim().toUpperCase();
          if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Código obrigatório' }));
            return;
          }
          const db = loadTrackingDb();
          const existing = db[code] || {};
          const record = {
            code,
            createdAt: existing.createdAt || data.createdAt || Date.now(),
            updatedAt: Date.now(),
            customer: { ...(existing.customer || {}), ...(data.customer || {}) },
            cart: data.cart || existing.cart || [],
            prize: data.prize !== undefined ? data.prize : existing.prize,
            mainProduct: data.mainProduct || existing.mainProduct || null,
            shipping: data.shipping || existing.shipping || 'full'
          };
          db[code] = record;
          saveTrackingDb(db);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, record }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'JSON inválido' }));
        }
      });
      return;
    }
  }

  // 3. Endpoint para enviar eventos para a Events API do TikTok
  if (pathname.includes('/api/tiktok-event') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const input = JSON.parse(body || '{}');
        const crypto = require('crypto');
        const sha256 = s => s ? crypto.createHash('sha256').update(String(s).trim().toLowerCase()).digest('hex') : undefined;

        const userData = {};
        if (input.user && input.user.email) userData.email = sha256(input.user.email);
        if (input.user && input.user.phone) {
          let p = String(input.user.phone).replace(/\D/g, '');
          if (!p.startsWith('55') && p.length <= 11) p = '55' + p;
          userData.phone_number = sha256(p);
        }
        if (input.ttclid) userData.ttclid = input.ttclid;

        const ttkPayload = JSON.stringify({
          event_source: 'web',
          event_source_id: TIKTOK_PIXEL_ID,
          data: [{
            event: input.event || 'CompletePayment',
            event_time: Math.floor(Date.now() / 1000),
            event_id: input.event_id || ('pur-' + Date.now()),
            user: userData,
            properties: {
              currency: 'BRL',
              value: Number(input.value || 69.90),
              contents: [{
                content_id: input.content_id || 'JBLBOOMBOX4BLKBR',
                content_type: 'product',
                content_name: input.content_name || 'Caixa de Som Bluetooth JBL Boombox 4 Branca',
                price: Number(input.value || 69.90),
                quantity: input.quantity || 1
              }]
            }
          }]
        });

        const ttkReq = https.request({
          hostname: 'business-api.tiktok.com',
          path: '/open_api/v1.3/event/track/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': TIKTOK_ACCESS_TOKEN,
            'Content-Length': Buffer.byteLength(ttkPayload)
          }
        }, ttkRes => {
          let data = '';
          ttkRes.on('data', c => data += c);
          ttkRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
          });
        });
        ttkReq.on('error', e => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        });
        ttkReq.write(ttkPayload);
        ttkReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'JSON inválido' }));
      }
    });
    return;
  }

  // 4. Servidor de arquivos estáticos
  let filePath = path.join(__dirname, decodeURIComponent(pathname));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Suporte à rota amigável /rastreio/:codigo (ex: /rastreio/ML123456789BR)
  if (!fs.existsSync(filePath) && pathname.toLowerCase().startsWith('/rastreio/')) {
    filePath = path.join(__dirname, 'rastreio', 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Arquivo não encontrado: ' + pathname);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Servidor Funil + PinguPag Gateway ativo na porta ${PORT}`);
  console.log(`PinguPag Secret Key: ${PINGUPAG_SECRET_KEY ? PINGUPAG_SECRET_KEY.slice(0, 15) + '...' : 'NÃO DEFINIDA'}`);
});
