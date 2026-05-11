// netlify/functions/save-ficha.js
// Crea o actualiza una ficha en Netlify Blobs
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { id, action, datos, password } = body;

  if (!id || !/^\d{5}$/.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID inválido' }) };
  }

  const store = getStore('mascotas');

  try {
    // ── CREAR nueva ficha ──────────────────────────────────────────────
    if (action === 'crear') {
      const existe = await store.get(id, { type: 'json' });
      if (existe) return { statusCode: 409, headers, body: JSON.stringify({ error: 'Ya existe' }) };

      if (!datos?.nombre || !datos?.propietario || !datos?.telefono || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Faltan campos obligatorios' }) };
      }
      if (password.length < 6) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Contraseña mínimo 6 caracteres' }) };
      }

      const ficha = {
        ...datos,
        password,
        estado: 'registrado',
        creado: new Date().toLocaleDateString('es-ES'),
      };
      await store.setJSON(id, ficha);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── ACTUALIZAR ficha (propietario autenticado) ─────────────────────
    if (action === 'actualizar') {
      const ficha = await store.get(id, { type: 'json' });
      if (!ficha) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No existe' }) };
      if (ficha.password !== password) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Contraseña incorrecta' }) };

      const actualizada = { ...ficha, ...datos, password: ficha.password };
      await store.setJSON(id, actualizada);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── CAMBIAR CONTRASEÑA ─────────────────────────────────────────────
    if (action === 'cambiar-password') {
      const { passwordActual, passwordNueva } = body;
      const ficha = await store.get(id, { type: 'json' });
      if (!ficha) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No existe' }) };
      if (ficha.password !== passwordActual) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Contraseña actual incorrecta' }) };
      if (!passwordNueva || passwordNueva.length < 6) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nueva contraseña mínimo 6 caracteres' }) };

      ficha.password = passwordNueva;
      await store.setJSON(id, ficha);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── ELIMINAR ficha ─────────────────────────────────────────────────
    if (action === 'eliminar') {
      const ficha = await store.get(id, { type: 'json' });
      if (!ficha) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No existe' }) };
      if (ficha.password !== password) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Contraseña incorrecta' }) };

      await store.delete(id);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── MARCAR ENCONTRADO (usuario que escaneó el QR) ──────────────────
    if (action === 'encontrado') {
      const ficha = await store.get(id, { type: 'json' });
      if (!ficha) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No existe' }) };

      ficha.estado = 'encontrado';
      await store.setJSON(id, ficha);
      // Devolver contacto para que el front pueda abrir WhatsApp/email
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, telefono: ficha.telefono, email: ficha.email, nombre: ficha.nombre }) };
    }

    // ── LOGIN propietario (verificar pass y devolver datos completos) ───
    if (action === 'login') {
      const ficha = await store.get(id, { type: 'json' });
      if (!ficha) return { statusCode: 404, headers, body: JSON.stringify({ error: 'No existe' }) };
      if (ficha.password !== password) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Contraseña incorrecta' }) };

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data: ficha }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Acción desconocida' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
