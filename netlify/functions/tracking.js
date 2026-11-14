// Netlify Function para salvar, consultar e listar pedidos no Admin
const memoryStore = global._trackingStore || (global._trackingStore = new Map());

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // GET: Consultar por código, CPF, ou listar tudo (para admin)
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const code = (params.code || params.c || '').split('?')[0].trim().toUpperCase();
    const cpf = (params.cpf || '').replace(/\D/g, '');
    const listAll = params.all === 'true' || params.list === 'true' || params.admin === 'true';

    // 1. Listagem completa para o Painel Admin
    if (listAll) {
      const records = Array.from(memoryStore.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          total: records.length,
          records
        })
      };
    }

    // 2. Consulta de rastreio individual por código ou CPF
    if (!code && !cpf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Código ou CPF obrigatório' })
      };
    }

    let record = null;
    if (code && memoryStore.has(code)) {
      record = memoryStore.get(code);
    } else if (cpf) {
      for (const val of memoryStore.values()) {
        const doc = (val.customer && (val.customer.cpf || val.customer.document || '')).replace(/\D/g, '');
        if (doc === cpf) {
          record = val;
          break;
        }
      }
    }

    if (record) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, record })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Rastreio não encontrado no servidor' })
    };
  }

  // POST: Salvar ou atualizar rastreamento
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      const code = (data.code || '').split('?')[0].trim().toUpperCase();

      if (!code) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Código obrigatório' })
        };
      }

      const existing = memoryStore.get(code) || {};
      const record = {
        code,
        createdAt: existing.createdAt || data.createdAt || Date.now(),
        updatedAt: Date.now(),
        status: data.status || existing.status || 'PAID',
        customer: { ...(existing.customer || {}), ...(data.customer || {}) },
        cart: data.cart || existing.cart || [],
        prize: data.prize !== undefined ? data.prize : existing.prize,
        mainProduct: data.mainProduct || existing.mainProduct || null,
        shipping: data.shipping || existing.shipping || 'full',
        payment: { ...(existing.payment || {}), ...(data.payment || {}) }
      };

      memoryStore.set(code, record);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, record })
      };
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'JSON inválido' })
      };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
};
