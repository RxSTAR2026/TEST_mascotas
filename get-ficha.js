// netlify/functions/get-ficha.js
// Lee una ficha del store (Netlify Blobs)
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const id = event.queryStringParameters?.id;
  if (!id || !/^\d{5}$/.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID inválido' }) };
  }

  try {
    const store = getStore('mascotas');
    const data = await store.get(id, { type: 'json' });
    if (!data) {
      return { statusCode: 404, headers, body: JSON.stringify({ exists: false }) };
    }
    // Devolver datos públicos (sin contraseña)
    const { password, email, direccion, ...publico } = data;
    const tieneEmail = !!email;
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ exists: true, data: publico, tieneEmail })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno' }) };
  }
};
