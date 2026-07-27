function agregarSocio_(payload, context) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = sanitizeRecord_(payload || {});
    var missing = requireFields_(data, ["proyectoId", "nombre"]);
    if (missing.length) return fail_("Faltan campos obligatorios.", missing);
    if (!findRecordById_("Proyectos", data.proyectoId)) return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);

    var record = {
      id: uuid_(),
      proyectoId: data.proyectoId,
      nombre: data.nombre,
      correo: data.correo || "",
      tipoSocio: data.tipoSocio || "",
      participacionLegal: toNumber_(data.participacionLegal),
      participacionEconomica: toNumber_(data.participacionEconomica),
      participacionUtilidades: toNumber_(data.participacionUtilidades),
      aporteComprometido: toNumber_(data.aporteComprometido),
      aporteRealizado: toNumber_(data.aporteRealizado),
      aportePendiente: Math.max(toNumber_(data.aporteComprometido) - toNumber_(data.aporteRealizado), 0),
      utilidadCalculada: 0,
      utilidadPagada: 0,
      utilidadPendiente: 0,
      fechaIngreso: data.fechaIngreso || todayIso_(),
      fechaSalida: data.fechaSalida || "",
      estado: data.estado || "Activo",
      acuerdosEspeciales: data.acuerdosEspeciales || "",
      documentos: data.documentos || "",
      creadoEn: nowIso_(),
      actualizadoEn: nowIso_()
    };
    appendRecord_("Socios", record);
    audit_("Socios", "agregarSocio", record.proyectoId, "", record, context, record.nombre);
    return ok_(record, "Socio agregado.");
  } finally {
    lock.releaseLock();
  }
}

function actualizarParticipacion_(payload, context) {
  if (!payload || !payload.id) return fail_("Falta id de socio.", ["REQUIRED:id"]);
  var changes = {
    participacionLegal: toNumber_(payload.participacionLegal),
    participacionEconomica: toNumber_(payload.participacionEconomica),
    participacionUtilidades: toNumber_(payload.participacionUtilidades),
    actualizadoEn: nowIso_()
  };
  var result = updateRecordById_("Socios", payload.id, changes);
  if (!result) return fail_("Socio no encontrado.", ["PARTNER_NOT_FOUND"]);
  audit_("Socios", "actualizarParticipacion", result.next.proyectoId, result.previous, result.next, context, result.next.nombre);
  return ok_(result.next, "Participación actualizada.");
}

