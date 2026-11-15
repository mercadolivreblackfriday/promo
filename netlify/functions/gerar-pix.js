const https = require('https');

const PINGUPAG_SECRET_KEY = process.env.PINGUPAG_SECRET_KEY || 'pingupag_sk_185039b4a3f9c649956d48c5cfdeffdc70cb188711ef3a5d1d73c7c4f3a6dacd';
const PINGUPAG_STORE_ID = process.env.PINGUPAG_STORE_ID || '274';

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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Método não permitido' }) };
  }

  try {
    const input = JSON.parse(event.body || '{}');
    const priceCents = Number(input.price_cents || 6990);
    const customer = input.customer || {};

    let rawCpf = (customer.cpf || customer.document || input.cpf_pagador || '').replace(/\D/g, '');
    const cpfDigits = isValidCpf(rawCpf) ? rawCpf : '52998224725';
    let phoneDigits = (customer.phone || input.telefone_pagador || '11999998888').replace(/\D/g, '');
    if (phoneDigits.length < 10) phoneDigits = '11999998888';

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
      description: (input.produto || input.description || 'Produto Mercado Livre').substring(0, 140),
      reference: refId,
      source: 'api_externa',
      customer: {
        name: (customer.name || input.nome_pagador || 'Cliente Mercado Livre').trim() || 'Cliente Mercado Livre',
        email: (customer.email || input.email_pagador || 'contato@cliente.com').trim() || 'contato@cliente.com',
        phone: phoneDigits,
        document: cpfDigits
      },
      tracking: utmObj
    });

    console.log('[PINGUPAG] Enviando payload:', pinguPayload);

    return new Promise((resolve) => {
      const pinguReq = https.request({
        hostname: 'app.pingupag.com',
        path: '/gateway/v1/transaction',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PINGUPAG_SECRET_KEY,
          'Content-Length': Buffer.byteLength(pinguPayload)
        }
      }, (pinguRes) => {
        let pinguData = '';
        pinguRes.on('data', chunk => pinguData += chunk);
        pinguRes.on('end', () => {
          console.log('[PINGUPAG] Resposta HTTP ' + pinguRes.statusCode + ':', pinguData);
          try {
            const parsed = JSON.parse(pinguData);
            if (pinguRes.statusCode >= 200 && pinguRes.statusCode < 300 && (parsed.status === 'success' || parsed.qr_code)) {
              const pixCodeStr = parsed.qr_code || '';
              const txid = String(parsed.transaction_id || parsed.id || refId);
              const qrBase64 = parsed.qr_code_base64 || '';
              const qrUrl = pixCodeStr ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCodeStr)}` : '';

              resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  transacao_id: txid,
                  id: txid,
                  txid: txid,
                  pixCode: pixCodeStr,
                  qrCode: pixCodeStr,
                  pix_code: pixCodeStr,
                  qr_code: pixCodeStr,
                  copia_e_cola: pixCodeStr,
                  pix_copia_e_cola: pixCodeStr,
                  qrcode: pixCodeStr,
                  base64QrCode: qrBase64,
                  qr_code_base64: qrBase64,
                  qr_code_url: qrUrl,
                  valor: (priceCents / 100).toFixed(2),
                  valor_centavos: priceCents,
                  status: 'PENDING'
                })
              });
            } else {
              resolve({
                statusCode: 400,
                headers,
                body: JSON.stringify({
                  success: false,
                  error: parsed.message || parsed.error || 'Erro ao gerar Pix na PinguPag',
                  detalhes: parsed
                })
              });
            }
          } catch (e) {
            resolve({
              statusCode: 502,
              headers,
              body: JSON.stringify({ success: false, error: 'Resposta inválida da PinguPag', raw: pinguData })
            });
          }
        });
      });

      pinguReq.on('error', (err) => {
        console.error('[PINGUPAG] Erro de rede:', err);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: 'Falha de conexão com a PinguPag: ' + err.message })
        });
      });

      pinguReq.setTimeout(25000, () => {
        pinguReq.destroy();
        resolve({
          statusCode: 504,
          headers,
          body: JSON.stringify({ success: false, error: 'Timeout ao conectar com a PinguPag' })
        });
      });

      pinguReq.write(pinguPayload);
      pinguReq.end();
    });

  } catch (err) {
    console.error('[GERAR PIX] Erro interno:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Erro interno ao processar requisição: ' + err.message })
    };
  }
};
