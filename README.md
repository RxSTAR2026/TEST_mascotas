# 🐾 BaseMascotas — ANA Art 

Sistema de fichas de mascotas con QR, desplegado en Netlify.

## Estructura de archivos

```
/
├── index.html                        ← La web completa
├── _redirects                        ← URLs limpias tipo /10001
├── netlify.toml                      ← Configuración de Netlify
└── netlify/
    └── functions/
        ├── get-ficha.js              ← Leer ficha pública
        ├── save-ficha.js             ← Crear/editar/eliminar fichas
        └── admin-fichas.js           ← Panel de administrador
```

## Despliegue en Netlify (paso a paso)

### 1. Subir a GitHub
Crea un repositorio y sube todos estos archivos.

### 2. Conectar con Netlify
- Ve a https://netlify.com → "Add new site" → "Import from Git"
- Selecciona tu repositorio de GitHub
- **Build command:** dejar vacío
- **Publish directory:** `.` (punto, directorio raíz)
- Clic en "Deploy site"

### 3. Configurar variables de entorno
En Netlify → Site settings → Environment variables, añade:
```
ADM_PASS = tu_contraseña_admin_secreta
```
Si no la añades, el valor por defecto es `admin123` (¡cámbialo!).

### 4. Habilitar Netlify Blobs
Los Netlify Blobs (almacenamiento de datos) se activan automáticamente 
cuando despliegas Functions. No requiere configuración adicional.

## URLs y QR

Cada ficha tiene una URL limpia:
```
https://tu-dominio.netlify.app/10001
https://tu-dominio.com/10001          ← con dominio propio
```

Para generar un QR, usa cualquier generador gratuito (qr-code-generator.com, etc.)
con la URL de la ficha. Imprímelo y pégalo en el collar.

## Rango de fichas
- Fichas válidas: **10000 – 20000**
- Total: 10.001 fichas posibles

## Migración a otro dominio/hosting
Los datos están en Netlify Blobs (asociados al site). Para migrar:
1. Descarga los datos via el panel admin (próxima versión) o la API de Netlify
2. Crea el nuevo site y re-sube los datos

## Cambiar contraseña admin
En Netlify → Environment variables → cambia `ADM_PASS`.

## Notas sobre las fotos
Las fotos se guardan en base64 dentro de cada ficha.
Recomendación: fotos menores a 500KB para mejor rendimiento.
