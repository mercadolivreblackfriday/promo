const https = require('https');

const PINGUPAG_SECRET_KEY = process.env.PINGUPAG_SECRET_KEY || 'pingupag_sk_185039b4a3f9c649956d48c5cfdeffdc70cb188711ef3a5d1d73c7c4f3a6dacd';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const txid = event.queryStringParameters && event.queryStringParameters.id;
  if (!txid) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'ID da transação obrigatório' }) };
  }

  // Tenta consulta direta por ID numérico/ofuscado
  const queryPath = `/gateway/v1/query?action=get_transaction&id=${encodeURIComponent(txid)}`;

  return new Promise((resolve) => {
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
          const mapped = ['PAID', 'APPROVED', 'COMPLETED', 'SUCCEEDED', 'PAGO'].includes(raw) ? 'APPROVED' : 'PENDING';
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              status: mapped,
              transacao_id: txid,
              raw_status: raw
            })
          });
        } catch (_) {
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid })
          });
        }
      });
    });

    pinguReq.on('error', err => {
      console.error('[STATUS PIX] Erro na consulta:', err);
      resolve({
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid })
      });
    });

    pinguReq.setTimeout(15000, () => {
      pinguReq.destroy();
      resolve({
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid })
      });
    });

    pinguReq.end();
  });
};
