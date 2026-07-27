# Seguridad

CONTROL360 manejará información patrimonial sensible. La seguridad se diseña desde el backend, no solo desde la interfaz.

## Reglas obligatorias

- Nunca guardar contraseñas, tokens, claves privadas ni secretos en GitHub.
- Nunca poner claves de OpenAI en el frontend.
- No exponer archivos de Drive públicamente sin autorización explícita.
- Validar permisos en Apps Script antes de devolver datos.
- Registrar auditoría de modificaciones, accesos, invitaciones, informes y descargas.
- Usar UUID para registros.
- Usar `LockService` para evitar escrituras simultáneas.
- Sanitizar entradas de usuario.
- Evitar duplicados por correo, proyecto activo y concepto de catálogo.

## Autenticación inicial

Fase 1 incluye una sesión demo visual para el superadministrador, pero no debe considerarse seguridad real.

Fase 2 debe implementar:

- Invitaciones por correo.
- Confirmación de correo.
- Vencimiento de invitaciones.
- Validación de sesión.
- Permisos por proyecto.
- Revocación de acceso.

## Apps Script

Usar:

- `PropertiesService` para configuraciones privadas y tokens temporales.
- `MailApp` o `GmailApp` para correos.
- `LockService` para escrituras.
- `Session.getActiveUser().getEmail()` cuando el contexto de despliegue lo permita.

## Frontend

El frontend puede ocultar elementos según permisos, pero eso es solo experiencia visual. Apps Script debe negar solicitudes no autorizadas.

## Auditoría

Cada modificación debe registrar:

- Usuario.
- Proyecto.
- Módulo.
- Acción.
- Campo.
- Valor anterior.
- Valor nuevo.
- Fecha.
- Hora.
- Identificador de sesión.
- Observación.

