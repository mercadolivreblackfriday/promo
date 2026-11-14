const https = require('https');

const LULAPAY_TOKEN = process.env.LULAPAY_TOKEN || 'gwk_c25fff532aaa9ca37b2187ea884c991a2b6114d7ca6b3125';

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const amountBrl = Number((priceCents / 100).toFixed(2));
    const customer = input.customer || {};

    let rawCpf = (customer.cpf || customer.document || input.cpf_pagador || '').replace(/\D/g, '');
    const cpfDigits = isValidCpf(rawCpf) ? rawCpf : '52998224725';
    let phoneDigits = (customer.phone || input.telefone_pagador || '11999998888').replace(/\D/g, '');
    if (phoneDigits.length < 10) phoneDigits = '11999998888';

    const customerName = (customer.name || input.nome_pagador || 'Cliente Mercado Livre').trim() || 'Cliente Mercado Livre';
    const customerEmail = (customer.email || input.email_pagador || 'contato@cliente.com').trim() || 'contato@cliente.com';
    const description = (input.produto || input.description || 'Pedido Mercado Livre').substring(0, 140);
    const externalId = 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    const lulaPayload = JSON.stringify({
      amount: amountBrl,
      description: description,
      external_id: externalId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: phoneDigits,
      customer_document: cpfDigits
    });

    console.log('[LULAPAY] Enviando cobrança:', lulaPayload);

    return new Promise((resolve) => {
      const lulaReq = https.request({
        hostname: 'lulapay.onrender.com',
        path: '/api/v1/cobranca.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LULAPAY_TOKEN}`,
          'Content-Length': Buffer.byteLength(lulaPayload)
        }
      }, (lulaRes) => {
        let lulaData = '';
        lulaRes.on('data', chunk => lulaData += chunk);
        lulaRes.on('end', () => {
          console.log('[LULAPAY] Resposta HTTP ' + lulaRes.statusCode + ':', lulaData);
          try {
            const parsed = JSON.parse(lulaData);
            if ((lulaRes.statusCode === 200 || lulaRes.statusCode === 201) && (parsed.pix_code || parsed.id)) {
              const pixCodeStr = parsed.pix_code || '';
              const txid = String(parsed.id || externalId);
              const qrBase64 = parsed.qr_image || '';
              const qrUrl = pixCodeStr ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCodeStr)}` : '';

              resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  transacao_id: txid,
                  id: txid,
                  txid: txid,
                  external_id: parsed.external_id || externalId,
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
                  valor: amountBrl.toFixed(2),
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
                  error: parsed.error || parsed.message || 'Erro ao gerar Pix na LulaPay',
                  detalhes: parsed
                })
              });
            }
          } catch (e) {
            resolve({
              statusCode: 502,
              headers,
              body: JSON.stringify({ success: false, error: 'Resposta inválida da LulaPay', raw: lulaData })
            });
          }
        });
      });

      lulaReq.on('error', (err) => {
        console.error('[LULAPAY] Erro de rede:', err);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: 'Falha de conexão com a LulaPay: ' + err.message })
        });
      });

      lulaReq.setTimeout(20000, () => {
        lulaReq.destroy();
        resolve({
          statusCode: 504,
          headers,
          body: JSON.stringify({ success: false, error: 'Timeout ao conectar com a LulaPay' })
        });
      });

      lulaReq.write(lulaPayload);
      lulaReq.end();
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
