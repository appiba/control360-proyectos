function aprobarSolicitud_(payload, context) {
  if (!payload || !payload.id) return fail_("Falta id de solicitud.", ["REQUIRED:id"]);
  var result = updateRecordById_("SolicitudesAcceso", payload.id, {
    estado: payload.aprobada === false ? "Rechazada" : "Aprobada",
    resueltoEn: nowIso_(),
    resueltoPor: context.userEmail || ""
  });
  if (!result) return fail_("Solicitud no encontrada.", ["REQUEST_NOT_FOUND"]);
  audit_("Usuarios", "aprobarSolicitud", result.next.proyectoId, result.previous, result.next, context, result.next.correo);
  return ok_(result.next, "Solicitud resuelta.");
}

function canAccessProject_(context, proyectoId, permission) {
  return true;
}

