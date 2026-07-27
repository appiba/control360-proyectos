function listarIngresos_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var records = readRecords_("Ingresos");
  if (payload && payload.proyectoId) {
    authError = requireProjectPermission_(context, payload.proyectoId, "verIngresos");
    if (authError) return authError;
    records = records.filter(function (record) {
      return String(record.proyectoId) === String(payload.proyectoId);
    });
  } else {
    records = filterByProjectAccess_(records, context, "verIngresos");
  }
  return ok_(records, "Ingresos obtenidos.");
}

function registrarIngreso_(payload, context) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = sanitizeRecord_(payload || {});
    var missing = requireFields_(data, ["proyectoId", "categoria", "concepto", "estado"]);
    if (missing.length) return fail_("Faltan campos obligatorios.", missing);
    if (!findRecordById_("Proyectos", data.proyectoId)) return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);
    var authError = requireProjectPermission_(context, data.proyectoId, "registrarIngresos");
    if (authError) return authError;

    var record = {
      id: uuid_(),
      proyectoId: data.proyectoId,
      categoria: data.categoria,
      subcategoria: data.subcategoria || "",
      concepto: data.concepto,
      fecha: data.fecha || todayIso_(),
      valorEstimado: toNumber_(data.valorEstimado),
      valorConfirmado: toNumber_(data.valorConfirmado),
      valorFacturado: toNumber_(data.valorFacturado),
      valorCobrado: toNumber_(data.valorCobrado),
      saldoPendiente: toNumber_(data.saldoPendiente),
      pagador: data.pagador || "",
      formaPago: data.formaPago || "",
      comprobante: data.comprobante || "",
      estado: data.estado,
      observaciones: data.observaciones || "",
      creadoPor: context.userEmail || "",
      creadoEn: nowIso_(),
      actualizadoEn: nowIso_()
    };
    appendRecord_("Ingresos", record);
    audit_("Ingresos", "registrarIngreso", record.proyectoId, "", record, context, record.concepto);
    return ok_(record, "Ingreso registrado.");
  } finally {
    lock.releaseLock();
  }
}

