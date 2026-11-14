const https = require('https');
const crypto = require('crypto');

const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'DBQKBH3C77U6JJ8MCCKG';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '492cf0afdd40b146b8e2f8d9004c563416906fa2';

function sha256(str) {
  if (!str) return undefined;
  return crypto.createHash('sha256').update(String(str).trim().toLowerCase()).digest('hex');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const eventName = input.event || 'CompletePayment';
    const eventId = input.event_id || ('pur-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
    const value = Number(input.value || 69.90);
    const user = input.user || {};

    const userData = {};
    if (user.email) userData.email = sha256(user.email);
    if (user.phone) {
      let p = String(user.phone).replace(/\D/g, '');
      if (!p.startsWith('55') && p.length <= 11) p = '55' + p;
      userData.phone_number = sha256(p);
    }
    if (input.ttclid) userData.ttclid = input.ttclid;
    if (input.external_id) userData.external_id = sha256(input.external_id);

    const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';
    const userAgent = event.headers['user-agent'] || '';

    const payload = JSON.stringify({
      event_source: 'web',
      event_source_id: TIKTOK_PIXEL_ID,
      data: [{
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user: userData,
        properties: {
          currency: 'BRL',
          value: value,
          contents: [{
            content_id: input.content_id || 'JBLBOOMBOX4BLKBR',
            content_type: 'product',
            content_name: input.content_name || 'Caixa de Som Bluetooth JBL Boombox 4 Branca',
            price: value,
            quantity: input.quantity || 1
          }]
        },
        page: {
          url: input.page_url || ''
        }
      }]
    });

    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'business-api.tiktok.com',
        path: '/open_api/v1.3/event/track/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TIKTOK_ACCESS_TOKEN,
          'Content-Length': Buffer.byteLength(payload)
        }
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, tiktok: parsed })
            });
          } catch (_) {
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, raw: body })
            });
          }
        });
      });

      req.on('error', e => {
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: e.message })
        });
      });

      req.write(payload);
      req.end();
    });
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'JSON inválido' })
    };
  }
};
