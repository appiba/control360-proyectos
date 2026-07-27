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

function obtenerHistorial_(payload) {
  var records = readRecords_("Historial");
  if (payload && payload.proyectoId) {
    records = records.filter(function (record) {
      return String(record.proyectoId) === String(payload.proyectoId);
    });
  }
  return ok_(records, "Historial obtenido.");
}

