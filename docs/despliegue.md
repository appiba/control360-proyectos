# Despliegue

## GitHub Pages

El frontend está diseñado para publicarse desde `/frontend`.

Pasos:

1. Fusionar el PR hacia `main`.
2. Entrar a `Settings → Pages`.
3. Elegir `Deploy from a branch`.
4. Seleccionar rama `main`.
5. Seleccionar carpeta `/frontend`.
6. Guardar.

Las rutas usan `./` y hash routing para funcionar bajo GitHub Pages sin servidor adicional.

## Apps Script

Datos conocidos:

- Google Sheets ID: `1zi4nLceMyUTRLdDftHF2hWWbCxAL42EnfcNu56u2d_Q`
- Apps Script Project ID: `1jB7jgd9fSB11jPhumZo-vwNbJyigUCYrim3BuKEI25PO3diWQPZhgkwZ`

Pasos:

1. Abrir el proyecto de Apps Script indicado.
2. Copiar todos los archivos `.gs` y `appsscript.json` desde `apps-script/`.
3. Ejecutar `setupDatabase()`.
4. Revisar las hojas creadas en Google Sheets.
5. Desplegar como aplicación web.
6. Copiar la URL terminada en `/exec`.
7. Pegarla en:

```js
export const APPS_SCRIPT_URL = "";
```

ubicado en `frontend/js/config.js`.

Ejemplo del cambio esperado, sin inventar una URL:

```js
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
```

## Verificación

Antes de usar producción:

- Confirmar que `healthCheck` responde `ok: true`.
- Confirmar que `setupDatabase` creó todas las hojas.
- Crear un proyecto de prueba no sensible.
- Registrar un ingreso y un gasto de prueba.
- Revisar que el historial tenga auditoría.
- Borrar manualmente datos de prueba si no se quieren conservar.

