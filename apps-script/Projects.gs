function listarProyectos_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var records = readRecords_("Proyectos");
  records = filterByProjectAccess_(records, context, "verResumen");
  if (payload && payload.estado) {
    records = records.filter(function (record) {
      return String(record.estado) === String(payload.estado);
    });
  }
  if (payload && payload.tipo) {
    records = records.filter(function (record) {
      return String(record.tipo) === String(payload.tipo);
    });
  }
  return ok_(records, "Proyectos obtenidos.");
}

function obtenerProyecto_(payload, context) {
  if (!payload || !payload.id) return fail_("Falta id de proyecto.", ["REQUIRED:id"]);
  var project = findRecordById_("Proyectos", payload.id);
  if (!project) return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);
  var authError = requireProjectPermission_(context, project.id, "verResumen");
  if (authError) return authError;
  return ok_(project, "Proyecto obtenido.");
}

function crearProyecto_(payload, context) {
  var authError = requireSystemPermission_(context, "modificarDatos");
  if (authError) return authError;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = sanitizeRecord_(payload || {});
    var missing = requireFields_(data, ["nombre", "tipo", "estado", "moneda"]);
    if (missing.length) return fail_("Faltan campos obligatorios.", missing);
    if (PROJECT_TYPES.indexOf(data.tipo) === -1) return fail_("Tipo de proyecto inválido.", ["INVALID_PROJECT_TYPE"]);
    if (PROJECT_STATUSES.indexOf(data.estado) === -1) return fail_("Estado de proyecto inválido.", ["INVALID_PROJECT_STATUS"]);

    var existing = readRecords_("Proyectos").some(function (project) {
      return normalize_(project.nombre) === normalize_(data.nombre) && String(project.estado) !== "Archivado";
    });
    if (existing) return fail_("Ya existe un proyecto activo con ese nombre.", ["DUPLICATE_PROJECT"]);

    var record = {
      id: uuid_(),
      nombre: data.nombre,
      tipo: data.tipo,
      subtipo: data.subtipo || "",
      descripcion: data.descripcion || "",
      ciudad: data.ciudad || "",
      direccionLugar: data.direccionLugar || "",
      fechaInicio: data.fechaInicio || "",
      fechaEstimadaFin: data.fechaEstimadaFin || "",
      estado: data.estado || "Idea",
      presupuestoInicial: toNumber_(data.presupuestoInicial),
      presupuestoActualizado: toNumber_(data.presupuestoActualizado || data.presupuestoInicial),
      responsable: data.responsable || "",
      propietario: data.propietario || "",
      moneda: data.moneda || CONTROL360_CONFIG.DEFAULT_CURRENCY,
      imagenPortada: data.imagenPortada || "",
      nivelRiesgo: data.nivelRiesgo || "Medio",
      etiquetas: parseTags_(data.etiquetas),
      notas: data.notas || "",
      creadoEn: nowIso_(),
      creadoPor: context.userEmail || "",
      actualizadoEn: nowIso_(),
      actualizadoPor: context.userEmail || ""
    };

    appendRecord_("Proyectos", record);
    audit_("Proyectos", "crearProyecto", record.id, "", record, context, record.nombre);
    return ok_(record, "Proyecto creado.");
  } finally {
    lock.releaseLock();
  }
}

function actualizarProyecto_(payload, context) {
  if (!payload || !payload.id) return fail_("Falta id de proyecto.", ["REQUIRED:id"]);
  var authError = requireProjectPermission_(context, payload.id, "modificarDatos");
  if (authError) return authError;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var changes = sanitizeRecord_(payload);
    changes.actualizadoEn = nowIso_();
    changes.actualizadoPor = context.userEmail || "";
    if (changes.tipo && PROJECT_TYPES.indexOf(changes.tipo) === -1) return fail_("Tipo inválido.", ["INVALID_PROJECT_TYPE"]);
    if (changes.estado && PROJECT_STATUSES.indexOf(changes.estado) === -1) return fail_("Estado inválido.", ["INVALID_PROJECT_STATUS"]);
    if (changes.presupuestoInicial !== undefined) changes.presupuestoInicial = toNumber_(changes.presupuestoInicial);
    if (changes.presupuestoActualizado !== undefined) changes.presupuestoActualizado = toNumber_(changes.presupuestoActualizado);

    var result = updateRecordById_("Proyectos", payload.id, changes);
    if (!result) return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);
    audit_("Proyectos", "actualizarProyecto", payload.id, result.previous, result.next, context, result.next.nombre);
    return ok_(result.next, "Proyecto actualizado.");
  } finally {
    lock.releaseLock();
  }
}

function archivarProyecto_(payload, context) {
  if (!payload || !payload.id) return fail_("Falta id de proyecto.", ["REQUIRED:id"]);
  var authError = requireProjectPermission_(context, payload.id, "cerrarProyecto");
  if (authError) return authError;
  return actualizarProyecto_({ id: payload.id, estado: "Archivado" }, context);
}

