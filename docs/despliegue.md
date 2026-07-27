# Despliegue

## GitHub Pages

El repositorio se publica desde la raíz. El archivo `index.html` de la raíz redirige a `/frontend/`, donde vive la aplicación real.

Pasos:

1. Fusionar el PR hacia `main`.
2. Entrar a `Settings → Pages`.
3. Elegir `Deploy from a branch`.
4. Seleccionar rama `main`.
5. Seleccionar carpeta `/(raíz)`.
6. Guardar.

Las rutas usan `./` y hash routing para funcionar bajo GitHub Pages sin servidor adicional.

## Apps Script

Datos conocidos:

- Google Sheets ID: `1zi4nLceMyUTRLdDftHF2hWWbCxAL42EnfcNu56u2d_Q`
- Apps Script Project ID: `1jB7jgd9fSB11jPhumZo-vwNbJyigUCYrim3BuKEI25PO3diWQPZhgkwZ`
- Apps Script Web App URL actual: `https://script.google.com/macros/s/AKfycbzDRErOe09jRa5vV4VUFmvr5a39BBPZoX-dC77-gcNzQbDVL9qEUBQgMPDFm2UXERsE/exec`

Pasos:

1. Abrir el proyecto de Apps Script indicado.
2. Copiar todos los archivos `.gs` y `appsscript.json` desde `apps-script/`.
3. Ejecutar `setupDatabase()` después de cargar Fase 2. Esto agrega columnas nuevas a `Usuarios` e `Invitaciones` sin borrar datos.
4. Revisar las hojas creadas en Google Sheets.
5. Desplegar como aplicación web.
6. Copiar la URL terminada en `/exec`.
7. Si cambia el despliegue, pegarla en:

```js
export const APPS_SCRIPT_URL = "";
```

ubicado en `frontend/js/config.js`. La URL actual ya está configurada.

La credencial inicial del propietario ya queda preconfigurada por hash en Apps Script. No se debe escribir la clave en el frontend.

Ejemplo del cambio esperado, sin inventar una URL:

```js
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
```

## Verificación

Antes de usar producción:

- Confirmar que `healthCheck` responde `ok: true`.
- Confirmar que `setupDatabase` creó todas las hojas.
- Confirmar que `Usuarios` tenga columnas `rol`, `passwordHash`, `passwordSalt`, `passwordRounds` e `invitacionId`.
- Confirmar que `Invitaciones` tenga `codigoHash`, `creadoPor`, `enviadoEn` y `aceptacionUrl`.
- Entrar como propietario y abrir el módulo `Usuarios`.
- Crear una invitación de prueba para un correo propio/secundario y activar el acceso con el código.
- Crear un proyecto de prueba no sensible.
- Registrar un ingreso y un gasto de prueba.
- Revisar que el historial tenga auditoría.
- Borrar manualmente datos de prueba si no se quieren conservar.
