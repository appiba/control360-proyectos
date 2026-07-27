# Modelo de datos inicial

La base inicial es Google Sheets. `setupDatabase()` crea las hojas cuando no existen, congela la primera fila y escribe encabezados consistentes.

## Hojas mínimas

- Configuracion.
- Usuarios.
- Invitaciones.
- SolicitudesAcceso.
- Proyectos.
- AccesosProyecto.
- Permisos.
- Socios.
- Participaciones.
- Acuerdos.
- Desembolsos.
- Ingresos.
- Gastos.
- CatalogoGastos.
- Proveedores.
- NecesidadesCompra.
- Cotizaciones.
- Negociaciones.
- Compras.
- Activos.
- Pasivos.
- Patrimonio.
- Escenarios.
- Metas.
- Alertas.
- Documentos.
- Informes.
- Historial.
- Sesiones.
- Notificaciones.

## Convenciones

- Todas las hojas usan columna `id` cuando representan entidades.
- Fechas en formato ISO cuando se escriben desde Apps Script.
- Montos numéricos separados por estado financiero.
- Campos de auditoría: `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`.
- Registros archivados usan estado `Archivado` o `activo = false`, según dominio.

## Hojas principales

### Proyectos

Campos base:

- id, nombre, tipo, subtipo, descripcion, ciudad, direccionLugar.
- fechaInicio, fechaEstimadaFin.
- estado, presupuestoInicial, presupuestoActualizado.
- responsable, propietario, moneda, imagenPortada.
- nivelRiesgo, etiquetas, notas.
- creadoEn, creadoPor, actualizadoEn, actualizadoPor.

### Ingresos

Campos base:

- id, proyectoId, categoria, subcategoria, concepto, fecha.
- valorEstimado, valorConfirmado, valorFacturado, valorCobrado, saldoPendiente.
- pagador, formaPago, comprobante, estado, observaciones.
- creadoPor, creadoEn, actualizadoEn.

### Gastos

Campos base:

- id, proyectoId, etapa, categoria, subcategoria, concepto.
- cantidad, unidad.
- valorPresupuestado, valorCotizado, valorNegociado, valorReal, valorPagado, saldoPendiente.
- proveedor, fecha, formaPago, estado, comprobante, observaciones.
- quienCubre, creadoPor, creadoEn, actualizadoEn.

### Socios

Campos base:

- id, proyectoId, nombre, correo, tipoSocio.
- participacionLegal, participacionEconomica, participacionUtilidades.
- aporteComprometido, aporteRealizado, aportePendiente.
- utilidadCalculada, utilidadPagada, utilidadPendiente.
- fechaIngreso, fechaSalida, estado, acuerdosEspeciales, documentos.

### Historial

Campos base:

- id, usuario, proyectoId, modulo, accion, campo.
- valorAnterior, valorNuevo.
- fecha, hora, sesionId, observacion.

