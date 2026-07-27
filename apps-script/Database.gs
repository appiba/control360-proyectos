var SHEET_SCHEMAS = {
  Configuracion: ["id", "clave", "valor", "descripcion", "actualizadoEn"],
  Usuarios: ["id", "nombreCompleto", "correo", "telefono", "estado", "correoConfirmado", "creadoEn", "ultimoAcceso", "fechaVencimiento", "notas"],
  Invitaciones: ["id", "usuarioId", "correo", "codigo", "estado", "proyectoId", "rol", "permisos", "venceEn", "creadoEn", "confirmadoEn"],
  SolicitudesAcceso: ["id", "usuarioId", "correo", "proyectoId", "estado", "mensaje", "creadoEn", "resueltoEn", "resueltoPor"],
  Proyectos: ["id", "nombre", "tipo", "subtipo", "descripcion", "ciudad", "direccionLugar", "fechaInicio", "fechaEstimadaFin", "estado", "presupuestoInicial", "presupuestoActualizado", "responsable", "propietario", "moneda", "imagenPortada", "nivelRiesgo", "etiquetas", "notas", "creadoEn", "creadoPor", "actualizadoEn", "actualizadoPor"],
  AccesosProyecto: ["id", "usuarioId", "proyectoId", "rol", "permisos", "estado", "fechaInicio", "fechaVencimiento", "creadoEn", "actualizadoEn"],
  Permisos: ["id", "clave", "nombre", "descripcion", "activo"],
  Socios: ["id", "proyectoId", "nombre", "correo", "tipoSocio", "participacionLegal", "participacionEconomica", "participacionUtilidades", "aporteComprometido", "aporteRealizado", "aportePendiente", "utilidadCalculada", "utilidadPagada", "utilidadPendiente", "fechaIngreso", "fechaSalida", "estado", "acuerdosEspeciales", "documentos", "creadoEn", "actualizadoEn"],
  Participaciones: ["id", "proyectoId", "socioId", "tipoParticipacion", "porcentaje", "fechaInicio", "fechaFin", "estado", "notas", "creadoEn"],
  Acuerdos: ["id", "proyectoId", "socioId", "tipo", "descripcion", "valor", "fechaInicio", "fechaFin", "estado", "documentoId", "creadoEn"],
  Desembolsos: ["id", "proyectoId", "socioId", "montoComprometido", "montoDesembolsado", "saldoPendiente", "fecha", "estado", "observaciones", "creadoEn"],
  Ingresos: ["id", "proyectoId", "categoria", "subcategoria", "concepto", "fecha", "valorEstimado", "valorConfirmado", "valorFacturado", "valorCobrado", "saldoPendiente", "pagador", "formaPago", "comprobante", "estado", "observaciones", "creadoPor", "creadoEn", "actualizadoEn"],
  Gastos: ["id", "proyectoId", "etapa", "categoria", "subcategoria", "concepto", "cantidad", "unidad", "valorPresupuestado", "valorCotizado", "valorNegociado", "valorReal", "valorPagado", "saldoPendiente", "proveedor", "fecha", "formaPago", "estado", "comprobante", "observaciones", "quienCubre", "creadoPor", "creadoEn", "actualizadoEn"],
  CatalogoGastos: ["id", "categoria", "subcategoria", "concepto", "unidadSugerida", "activo", "creadoEn", "actualizadoEn"],
  Proveedores: ["id", "nombre", "empresa", "categoria", "telefono", "correo", "ciudad", "productosServicios", "calificacion", "tiempoPromedioEntrega", "comprasRealizadas", "montoAcumulado", "descuentoPromedio", "documentos", "estado", "creadoEn", "actualizadoEn"],
  NecesidadesCompra: ["id", "proyectoId", "categoria", "descripcion", "cantidad", "unidad", "presupuesto", "estado", "creadoEn", "actualizadoEn"],
  Cotizaciones: ["id", "proyectoId", "necesidadId", "proveedorId", "precioInicial", "precioCotizado", "precioNegociado", "gastosAdquisicion", "transporte", "hospedaje", "alimentacion", "valorFinal", "fecha", "vencimiento", "archivo", "estado", "creadoEn"],
  Negociaciones: ["id", "proyectoId", "cotizacionId", "precioInicial", "precioFinal", "ahorro", "porcentajeDescuento", "observaciones", "fecha", "creadoPor"],
  Compras: ["id", "proyectoId", "necesidadId", "proveedorId", "cotizacionId", "valorCompra", "valorFinalAdquisicion", "estado", "fechaCompra", "fechaEntrega", "garantia", "factura", "evaluacion", "creadoEn"],
  Activos: ["id", "proyectoId", "nombre", "tipo", "valorCompra", "valorActual", "estado", "ubicacion", "documentos", "creadoEn", "actualizadoEn"],
  Pasivos: ["id", "proyectoId", "nombre", "tipo", "valorInicial", "saldoActual", "tasa", "estado", "fechaInicio", "fechaVencimiento", "creadoEn"],
  Patrimonio: ["id", "fecha", "valorActivos", "valorPasivos", "patrimonioNeto", "liquidez", "observaciones", "creadoEn"],
  Escenarios: ["id", "proyectoId", "nombre", "asistencia", "ingresos", "gastos", "utilidadTotal", "utilidadPersonal", "roi", "margen", "puntoEquilibrio", "creadoEn"],
  Metas: ["id", "proyectoId", "nombre", "descripcion", "valorObjetivo", "fechaObjetivo", "estado", "creadoEn"],
  Alertas: ["id", "proyectoId", "tipo", "mensaje", "fecha", "estado", "prioridad", "creadoEn", "resueltoEn"],
  Documentos: ["id", "proyectoId", "categoria", "nombre", "urlPrivadaDrive", "usuarioSubio", "fecha", "version", "permisos", "estado", "creadoEn"],
  Informes: ["id", "proyectoId", "tipo", "version", "urlPrivadaDrive", "estado", "generadoPor", "generadoEn", "enviadoA", "descargadoPor", "descargadoEn", "lecturaConfirmadaEn"],
  Historial: ["id", "usuario", "proyectoId", "modulo", "accion", "campo", "valorAnterior", "valorNuevo", "fecha", "hora", "sesionId", "observacion"],
  Sesiones: ["id", "usuarioId", "correo", "estado", "creadoEn", "ultimoAcceso", "venceEn"],
  Notificaciones: ["id", "usuarioId", "proyectoId", "tipo", "mensaje", "canal", "estado", "enviadoEn", "leidoEn", "metadata"]
};

function setupDatabase() {
  return setupDatabase_({ userEmail: getActiveUserEmail_(), sessionId: uuid_() });
}

function setupDatabase_(context) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var spreadsheet = getSpreadsheet_();
    var created = [];
    Object.keys(SHEET_SCHEMAS).forEach(function (sheetName) {
      var result = ensureSheet_(spreadsheet, sheetName, SHEET_SCHEMAS[sheetName]);
      if (result.created) created.push(sheetName);
    });
    seedPermissionCatalog_();
    seedExpenseCatalog_();
    ensureConfigurationDefaults_();
    audit_("Sistema", "setupDatabase", "", "", "Hojas verificadas: " + Object.keys(SHEET_SCHEMAS).length, context, "Inicialización o verificación de estructura.");
    return ok_({
      spreadsheetId: CONTROL360_CONFIG.SPREADSHEET_ID,
      sheets: Object.keys(SHEET_SCHEMAS),
      created: created
    }, "Base de datos verificada correctamente.");
  } finally {
    lock.releaseLock();
  }
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONTROL360_CONFIG.SPREADSHEET_ID);
}

function ensureSheet_(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  var created = false;
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    created = true;
  }

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(String);
  var finalHeaders = currentHeaders.length ? currentHeaders.slice() : headers.slice();
  headers.forEach(function (header) {
    if (finalHeaders.indexOf(header) === -1) finalHeaders.push(header);
  });

  sheet.getRange(1, 1, 1, finalHeaders.length).setValues([finalHeaders]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, finalHeaders.length).setFontWeight("bold");
  return { sheet: sheet, created: created };
}

function ensureConfigurationDefaults_() {
  var existing = readRecords_("Configuracion");
  var keys = {};
  existing.forEach(function (row) {
    keys[row.clave] = true;
  });
  [
    ["timezone", CONTROL360_CONFIG.TIMEZONE, "Zona horaria operativa"],
    ["defaultCurrency", CONTROL360_CONFIG.DEFAULT_CURRENCY, "Moneda predeterminada"],
    ["appsScriptVersion", CONTROL360_CONFIG.VERSION, "Versión inicial del backend"]
  ].forEach(function (item) {
    if (!keys[item[0]]) {
      appendRecord_("Configuracion", {
        id: uuid_(),
        clave: item[0],
        valor: item[1],
        descripcion: item[2],
        actualizadoEn: nowIso_()
      });
    }
  });
}

function seedPermissionCatalog_() {
  var existing = readRecords_("Permisos");
  if (existing.length > 0) return;
  [
    "verResumen",
    "verIngresos",
    "verGastos",
    "registrarIngresos",
    "registrarGastos",
    "verUtilidades",
    "verSocios",
    "verParticipaciones",
    "descargarInformes",
    "generarInformes",
    "subirDocumentos",
    "verDocumentos",
    "modificarDatos",
    "invitarUsuarios",
    "administrarPermisos",
    "cerrarProyecto"
  ].forEach(function (permission) {
    appendRecord_("Permisos", {
      id: uuid_(),
      clave: permission,
      nombre: permission,
      descripcion: "Permiso configurable por proyecto.",
      activo: true
    });
  });
}

function seedExpenseCatalog_() {
  var existing = readRecords_("CatalogoGastos");
  if (existing.length > 0) return;
  CATALOGO_GASTOS_BASE.forEach(function (item) {
    appendRecord_("CatalogoGastos", {
      id: uuid_(),
      categoria: item.categoria,
      subcategoria: item.subcategoria,
      concepto: item.concepto,
      unidadSugerida: item.unidadSugerida || "",
      activo: true,
      creadoEn: nowIso_(),
      actualizadoEn: nowIso_()
    });
  });
}

function readRecords_(sheetName) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  return values
    .filter(function (row) {
      return row.some(function (cell) { return cell !== ""; });
    })
    .map(function (row) {
      var record = {};
      headers.forEach(function (header, index) {
        record[header] = row[index];
      });
      return record;
    });
}

function appendRecord_(sheetName, record) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("No existe la hoja " + sheetName + ". Ejecuta setupDatabase().");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var sanitized = sanitizeRecord_(record);
  var row = headers.map(function (header) {
    return sanitized[header] !== undefined ? sanitized[header] : "";
  });
  sheet.appendRow(row);
  return sanitized;
}

function updateRecordById_(sheetName, id, changes) {
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("No existe la hoja " + sheetName + ". Ejecuta setupDatabase().");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  if (idIndex === -1) throw new Error("La hoja " + sheetName + " no tiene columna id.");

  for (var rowIndex = 1; rowIndex < values.length; rowIndex++) {
    if (String(values[rowIndex][idIndex]) === String(id)) {
      var previous = {};
      headers.forEach(function (header, colIndex) {
        previous[header] = values[rowIndex][colIndex];
      });
      var next = Object.assign({}, previous, sanitizeRecord_(changes));
      headers.forEach(function (header, colIndex) {
        sheet.getRange(rowIndex + 1, colIndex + 1).setValue(next[header] !== undefined ? next[header] : "");
      });
      return { previous: previous, next: next };
    }
  }

  return null;
}

function findRecordById_(sheetName, id) {
  var records = readRecords_(sheetName);
  for (var index = 0; index < records.length; index++) {
    if (String(records[index].id) === String(id)) return records[index];
  }
  return null;
}

function seedDemoData() {
  var context = { userEmail: getActiveUserEmail_(), sessionId: uuid_() };
  setupDatabase_(context);
  var project = crearProyecto_({
    nombre: "Proyecto demo CONTROL360",
    tipo: "Evento",
    estado: "Idea",
    moneda: "USD",
    presupuestoInicial: 1000,
    presupuestoActualizado: 1000,
    descripcion: "Dato demo opcional creado manualmente.",
    ciudad: "Quito",
    nivelRiesgo: "Medio"
  }, context);
  return ok_({ project: project.data }, "Datos demo opcionales creados.");
}

