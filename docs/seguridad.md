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

El acceso del superadministrador se valida en Apps Script. El frontend no contiene la clave.

La credencial inicial del propietario está preconfigurada en el backend mediante:

- hash del correo autorizado;
- sal de contraseña;
- hash iterado de contraseña;
- sesiones temporales con token guardado como hash.

La clave real no se guarda en texto en GitHub Pages ni en los archivos del frontend. Si se rota la clave en el futuro, puede usarse `PropertiesService` con `CONTROL360_SUPERADMIN_EMAIL` y `CONTROL360_SUPERADMIN_TEMP_PASSWORD`; al ejecutar `configurarSuperadminInicial()`, la propiedad temporal se elimina y queda solo el hash.

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

