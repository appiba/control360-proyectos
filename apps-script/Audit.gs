function audit_(modulo, accion, proyectoId, valorAnterior, valorNuevo, context, observacion, campo) {
  try {
    var now = new Date();
    appendRecord_("Historial", {
      id: uuid_(),
      usuario: context && context.userEmail ? context.userEmail : "Sistema",
      proyectoId: proyectoId || "",
      modulo: modulo || "",
      accion: accion || "",
      campo: campo || "",
      valorAnterior: typeof valorAnterior === "string" ? valorAnterior : JSON.stringify(valorAnterior || ""),
      valorNuevo: typeof valorNuevo === "string" ? valorNuevo : JSON.stringify(valorNuevo || ""),
      fecha: Utilities.formatDate(now, CONTROL360_CONFIG.TIMEZONE, "yyyy-MM-dd"),
      hora: Utilities.formatDate(now, CONTROL360_CONFIG.TIMEZONE, "HH:mm:ss"),
      sesionId: context && context.sessionId ? context.sessionId : "",
      observacion: observacion || ""
    });
  } catch (error) {
    console.error("No se pudo registrar auditoría", error);
  }
}

function obtenerHistorial_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var records = readRecords_("Historial");
  if (payload && payload.proyectoId) {
    authError = requireProjectPermission_(context, payload.proyectoId, "verResumen");
    if (authError) return authError;
    records = records.filter(function (record) {
      return String(record.proyectoId) === String(payload.proyectoId);
    });
  } else if (!isSuperadminUser_(context.user)) {
    var allowedIds = getAccessibleProjectIds_(context, "verResumen") || [];
    var allowed = {};
    allowedIds.forEach(function (id) { allowed[id] = true; });
    records = records.filter(function (record) {
      return !record.proyectoId || allowed[String(record.proyectoId)];
    });
  }
  return ok_(records, "Historial obtenido.");
}

