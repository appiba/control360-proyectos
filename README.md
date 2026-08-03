# CONTROL360

CONTROL360 es una aplicación web privada para gestión patrimonial, financiera y operativa de proyectos personales: eventos, negocios, inversiones, activos, compras de empresas, oportunidades, socios, ingresos, gastos, documentos e informes.

Esta versión avanza a Fase 2: frontend estático compatible con GitHub Pages, backend Google Apps Script conectado a Google Sheets, login real del propietario, sesiones, invitaciones de socios y permisos por proyecto.

## Estado de la Fase 2

Funcional hoy:

- Dashboard oscuro responsive con KPIs financieros y gráficos demo.
- Pantalla de login para superadministrador único, validada por Apps Script.
- Activación de socios por invitación con código privado y clave propia.
- Roles y permisos iniciales: `Superadmin`, `AdministradorProyecto`, `Editor`, `Socio` e `Invitado`.
- Pantalla de Usuarios para crear invitaciones, revisar usuarios, ver accesos y revocar accesos por proyecto.
- Backend con validación de sesión/token en acciones privadas.
- Filtrado de proyectos, dashboard, ingresos, gastos, socios, documentos, informes, compras e historial según permisos.
- Formularios de proyectos, ingresos, gastos y socios con selectores de catálogo para evitar texto libre donde debe existir una opción controlada.
- Detalle de proyecto con socios, aportes, ingresos y gastos filtrados solo para ese proyecto.
- Navegación lateral para todos los módulos solicitados.
- Pantalla de proyectos con creación, listado, estados, tipos y detalle básico.
- Módulos visuales de ingresos, gastos, socios, compras, proveedores, documentos, historial y configuración.
- Catálogo inicial completo de gastos.
- Capa `api.js` preparada para llamar a Google Apps Script.
- Modo demo local cuando todavía no existe URL `/exec`.
- Backend Apps Script inicial con `doGet`, `doPost`, router central, `healthCheck`, `setupDatabase`, CRUD base de proyectos, ingresos y gastos, auditoría básica y catálogo.
- Pruebas unitarias de fórmulas financieras y validación.

Configuración actual:

- URL de Apps Script configurada en [frontend/js/config.js](frontend/js/config.js).
- Endpoint actual: `https://script.google.com/macros/s/AKfycbzDRErOe09jRa5vV4VUFmvr5a39BBPZoX-dC77-gcNzQbDVL9qEUBQgMPDFm2UXERsE/exec`
- El acceso del propietario queda preconfigurado en Apps Script con hash; no hay clave en texto ni en el frontend.
- Identidad visual actualizada con logo CONTROL360 y sistema tipografico ACCESS preparado en `frontend/assets/fonts/`.

Pendiente de configuración manual:

- Volver a cargar los archivos de [apps-script](apps-script) dentro del proyecto de Google Apps Script.
- Ejecutar `setupDatabase()` desde Apps Script para agregar columnas nuevas de Fase 2, incluyendo `Gastos`, sin borrar datos.
- Volver a probar `healthCheck` en el endpoint `/exec`.
- Activar GitHub Pages desde la carpeta `/frontend`.
- Conceder permisos de escritura al repo si se desea que Codex pueda empujar la rama y abrir el PR automáticamente.

## Tecnologías

- Frontend: HTML5, CSS3, JavaScript modular sin frameworks.
- Gráficos: Chart.js desde CDN.
- Exportación preliminar: jsPDF desde CDN, con fallback de impresión.
- Backend: Google Apps Script V8.
- Base inicial: Google Sheets.
- Documentos: Google Drive, mediante metadata inicial.

## Identidad visual

CONTROL360 usa una direccion visual tecnologica, premium y oscura con acentos verde neon/lima. La fuente principal configurada es ACCESS de designova para logotipo, titulos, encabezados, botones y paneles principales.

Para que el navegador use ACCESS real, coloca el archivo licenciado `ACCESS.woff2` en [frontend/assets/fonts](frontend/assets/fonts). El CSS ya intenta cargar `ACCESS.woff2`, `ACCESS.woff` y `ACCESS.ttf` desde esa carpeta.

No se usa Node.js en producción. El archivo `package.json` existe solo para ejecutar pruebas locales sin dependencias externas.

## Vista local

Puedes abrir directamente:

[frontend/index.html](frontend/index.html)

Si prefieres servirlo localmente para evitar restricciones del navegador con módulos ES:

```bash
npx serve frontend
```

## Pruebas

```bash
npm test
```

Las pruebas actuales verifican cálculos financieros críticos, validación de proyectos y consistencia mínima del catálogo de gastos.

## Configurar Apps Script

1. Abre el proyecto de Apps Script:
   `1jB7jgd9fSB11jPhumZo-vwNbJyigUCYrim3BuKEI25PO3diWQPZhgkwZ`
2. Copia los archivos de la carpeta [apps-script](apps-script) al proyecto.
3. Verifica que `CONTROL360_CONFIG.SPREADSHEET_ID` apunte a:
   `1zi4nLceMyUTRLdDftHF2hWWbCxAL42EnfcNu56u2d_Q`
4. Ejecuta manualmente `setupDatabase()` una vez y concede permisos. En Fase 2 esto agrega columnas nuevas a `Usuarios`, `Invitaciones` y `Gastos` sin eliminar información existente.
5. Despliega como aplicación web:
   - Ejecutar como: propietario.
   - Acceso: solo usuarios autorizados, o el alcance privado que definas.
6. Copia la URL terminada en `/exec`.
7. Si el despliegue cambia, actualiza `APPS_SCRIPT_URL` dentro de [frontend/js/config.js](frontend/js/config.js).

La credencial inicial del propietario ya queda validada por hash en Apps Script. Los socios no usan esa clave: se crean desde `Usuarios`, reciben un código de activación y luego definen su propia clave, que también se guarda como hash.

Mientras `APPS_SCRIPT_URL = ""`, la aplicación muestra un aviso claro y trabaja en modo demo local. En esta rama ya está configurada la URL enviada por el propietario.

## Activar GitHub Pages

1. Sube la rama al repo.
2. En GitHub, entra a `Settings → Pages`.
3. En `Build and deployment`, selecciona:
   - Source: `Deploy from a branch`.
   - Branch: `main`.
   - Folder: `/(raíz)`.
4. Guarda los cambios.

El archivo [index.html](index.html) de la raiz redirige automaticamente a [frontend/index.html](frontend/index.html), que contiene la aplicacion real.

## Seguridad

- No hay claves privadas ni secretos en el frontend.
- No se inventa URL de Apps Script.
- Los permisos reales deben validarse en Apps Script.
- Las operaciones del backend usan UUID, validación básica, LockService y auditoría.
- Los datos demo están separados del backend productivo.

Más detalle en [docs/seguridad.md](docs/seguridad.md).
