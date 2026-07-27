function validarSesion_(payload, context) {
  return ok_({
    usuario: {
      correo: context.userEmail || "",
      rol: "Superadmin",
      estado: "Activo"
    },
    permisos: ["superadmin"],
    temporal: true
  }, "Sesión validada de forma inicial. Endurecer en Fase 2.");
}

function confirmarCorreo_(payload, context) {
  return preparedAction_("confirmarCorreo", "Confirmación de correo preparada para Fase 2.", payload);
}

function solicitarAcceso_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  if (!data.correo || !isValidEmail_(data.correo)) return fail_("Correo inválido.", ["INVALID_EMAIL"]);
  var record = {
    id: uuid_(),
    usuarioId: data.usuarioId || "",
    correo: data.correo,
    proyectoId: data.proyectoId || "",
    estado: "Pendiente",
    mensaje: data.mensaje || "",
    creadoEn: nowIso_(),
    resueltoEn: "",
    resueltoPor: ""
  };
  appendRecord_("SolicitudesAcceso", record);
  audit_("Usuarios", "solicitarAcceso", record.proyectoId, "", record, context, record.correo);
  return ok_(record, "Solicitud de acceso registrada.");
}

function invitarUsuario_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  if (!data.correo || !isValidEmail_(data.correo)) return fail_("Correo inválido.", ["INVALID_EMAIL"]);
  var record = {
    id: uuid_(),
    usuarioId: data.usuarioId || "",
    correo: data.correo,
    codigo: uuid_(),
    estado: "Invitación pendiente",
    proyectoId: data.proyectoId || "",
    rol: data.rol || "Invitado",
    permisos: data.permisos || "",
    venceEn: data.venceEn || "",
    creadoEn: nowIso_(),
    confirmadoEn: ""
  };
  appendRecord_("Invitaciones", record);
  audit_("Usuarios", "invitarUsuario", record.proyectoId, "", record, context, record.correo);
  return ok_(record, "Invitación registrada. Envío de correo se completa en Fase 2.");
}

