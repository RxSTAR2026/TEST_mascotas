// netlify/functions/admin-fichas.js
// Panel admin: lista todas las fichas (protegido por contraseña de admin)
const { getStore } = require('@netlify/blobs');

const ADM_PASS = process.env.ADM_PASS || 'admin123';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const pass = event.queryStringParameters?.pass;
  if (pass !== ADM_PASS) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  try {
    const store = getStore('mascotas');
    const { blobs } = await store.list();

    const fichas = await Promise.all(
      blobs.map(async ({ key }) => {
        const data = await store.get(key, { type: 'json' });
        return {
          id: key,
          nombre: data?.nombre || '–',
          propietario: data?.propietario || '–',
          telefono: data?.telefono || '–',
          estado: data?.estado || 'registrado',
          creado: data?.creado || '–',
          tieneFoto: !!data?.foto,
        };
      })
    );

    const total = fichas.length;
    const encontrados = fichas.filter(f => f.estado === 'encontrado').length;

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ total, encontrados, fichas })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno' }) };
  }
};
