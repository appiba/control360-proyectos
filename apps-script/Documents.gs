function subirDocumentoMetadata_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var missing = requireFields_(data, ["proyectoId", "categoria", "nombre"]);
  if (missing.length) return fail_("Faltan campos obligatorios.", missing);
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId,
    categoria: data.categoria,
    nombre: data.nombre,
    urlPrivadaDrive: data.urlPrivadaDrive || "",
    usuarioSubio: context.userEmail || "",
    fecha: data.fecha || todayIso_(),
    version: data.version || "1",
    permisos: data.permisos || "",
    estado: data.estado || "Activo",
    creadoEn: nowIso_()
  };
  appendRecord_("Documentos", record);
  audit_("Documentos", "subirDocumentoMetadata", record.proyectoId, "", record, context, record.nombre);
  return ok_(record, "Metadata de documento registrada.");
}

