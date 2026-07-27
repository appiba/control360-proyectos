function generarInforme_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var authError = data.proyectoId
    ? requireProjectPermission_(context, data.proyectoId, "generarInformes")
    : requireSystemPermission_(context, "generarInformes");
  if (authError) return authError;
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId || "",
    tipo: data.tipo || "Resumen ejecutivo",
    version: data.version || "0.1",
    urlPrivadaDrive: "",
    estado: "Generado preliminar",
    generadoPor: context.userEmail || "",
    generadoEn: nowIso_(),
    enviadoA: "",
    descargadoPor: "",
    descargadoEn: "",
    lecturaConfirmadaEn: ""
  };
  appendRecord_("Informes", record);
  audit_("Informes", "generarInforme", record.proyectoId, "", record, context, record.tipo);
  return ok_(record, "Informe preliminar registrado. PDF final se completa en fases posteriores.");
}

