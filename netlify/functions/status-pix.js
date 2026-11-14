const https = require('https');

const LULAPAY_TOKEN = process.env.LULAPAY_TOKEN || 'gwk_c25fff532aaa9ca37b2187ea884c991a2b6114d7ca6b3125';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const txid = (event.queryStringParameters && event.queryStringParameters.id) || '';
  if (!txid) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'ID da transação obrigatório' }) };
  }

  // Consulta cobrança na LulaPay por ID ou external_id
  const param = txid.startsWith('ord_') ? `id=${encodeURIComponent(txid)}` : `external_id=${encodeURIComponent(txid)}`;
  const queryPath = `/api/v1/cobranca.php?${param}`;

  return new Promise((resolve) => {
    const lulaReq = https.request({
      hostname: 'lulapay.onrender.com',
      path: queryPath,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LULAPAY_TOKEN}`
      }
    }, lulaRes => {
      let lulaData = '';
      lulaRes.on('data', chunk => lulaData += chunk);
      lulaRes.on('end', () => {
        try {
          const parsed = JSON.parse(lulaData);
          const raw = String(parsed.status || 'pending').toLowerCase();
          const mapped = (raw === 'paid' || raw === 'approved' || raw === 'completed' || raw === 'pago') ? 'APPROVED' : (raw === 'canceled' || raw === 'refunded' ? 'CANCELED' : 'PENDING');

          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              status: mapped,
              transacao_id: txid,
              raw_status: raw,
              charge: parsed
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

    lulaReq.on('error', err => {
      console.error('[STATUS PIX] Erro na consulta LulaPay:', err);
      resolve({
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid })
      });
    });

    lulaReq.setTimeout(15000, () => {
      lulaReq.destroy();
      resolve({
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, status: 'PENDING', transacao_id: txid })
      });
    });

    lulaReq.end();
  });
};
