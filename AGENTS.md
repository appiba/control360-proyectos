# Instrucciones permanentes para Codex en CONTROL360

Este repositorio contiene CONTROL360, una aplicación web privada de gestión patrimonial y financiera personal.

## Principios

- Mantener la interfaz en español.
- Mantener moneda predeterminada `USD`.
- Mantener zona horaria operativa `America/Guayaquil`.
- No guardar secretos, contraseñas, tokens ni claves privadas en el repo.
- No incluir claves de OpenAI ni llamadas a OpenAI API hasta que se solicite explícitamente en una fase futura.
- No inventar la URL de Apps Script. Mientras no exista, dejar `APPS_SCRIPT_URL = ""`.
- No convertir el frontend en una app con framework pesado. Debe seguir siendo HTML, CSS y JavaScript modular compatible con GitHub Pages.
- No exigir un servidor adicional en producción.

## Arquitectura

- Frontend estático en `frontend/`.
- Backend Google Apps Script en `apps-script/`.
- Documentación funcional y técnica en `docs/`.
- Pruebas locales en `tests/`.

## Reglas de implementación

- Toda función financiera crítica debe implementarse como código determinístico, no como texto generado.
- Separar siempre valores estimados, negociados, confirmados, facturados, pagados, cobrados, pendientes, vencidos y cancelados.
- Validar permisos en Apps Script, no solo en la interfaz.
- Registrar auditoría para altas, cambios, archivados, accesos, informes y documentos.
- Usar UUID para registros.
- Usar `LockService` en Apps Script para escrituras.
- Evitar duplicados por claves naturales cuando corresponda: correo, nombre de proyecto activo, concepto de catálogo.
- Mantener datos demo separados mediante `seedDemoData()` o almacenamiento local del frontend.

## Trabajo con Git

- Usar ramas con prefijo `codex/` salvo instrucción contraria.
- No fusionar PRs automáticamente.
- Si el repo remoto no tiene permisos de escritura, dejar el trabajo listo localmente y explicar el bloqueo.

## Criterios antes de entregar

- Revisar rutas relativas para GitHub Pages.
- Ejecutar `npm test` si Node está disponible.
- Revisar errores evidentes de JavaScript.
- Actualizar documentación si se cambia estructura, API, hojas o flujo de despliegue.

