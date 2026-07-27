function configurarSuperadminInicial() {
  return configurarSuperadminInicial_({
    userEmail: getActiveUserEmail_(),
    sessionId: uuid_()
  });
}

function configurarSuperadminInicial_(context) {
  var props = PropertiesService.getScriptProperties();
  var email = String(props.getProperty(CONTROL360_CONFIG.SUPERADMIN_EMAIL_PROPERTY) || "").trim().toLowerCase();
  var tempPassword = props.getProperty(CONTROL360_CONFIG.SUPERADMIN_TEMP_PASSWORD_PROPERTY);

  if (!email || !isValidEmail_(email)) {
    return fail_("Configura primero la propiedad CONTROL360_SUPERADMIN_EMAIL con un correo valido.", [
      "MISSING_SUPERADMIN_EMAIL"
    ]);
  }

  if (!tempPassword) {
    return fail_("Configura primero la propiedad temporal CONTROL360_SUPERADMIN_TEMP_PASSWORD.", [
      "MISSING_TEMP_PASSWORD"
    ]);
  }

  var salt = uuid_() + uuid_();
  var passwordHash = hashSecret_(salt + ":" + tempPassword);
  props.setProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_SALT_PROPERTY, salt);
  props.setProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_HASH_PROPERTY, passwordHash);
  props.deleteProperty(CONTROL360_CONFIG.SUPERADMIN_TEMP_PASSWORD_PROPERTY);

  var user = ensureSuperadminUser_(email);
  audit_("Usuarios", "configurarSuperadminInicial", "", "", "Superadmin configurado", context, email);

  return ok_({
    usuario: publicUser_(user),
    tempPasswordDeleted: true
  }, "Superadministrador configurado. La clave temporal fue eliminada y quedo guardado solo el hash.");
}

function login_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var email = String(data.correo || "").trim().toLowerCase();
  var password = String(payload && payload.password ? payload.password : "");

  if (!email || !password) {
    return fail_("Ingresa correo y clave.", ["REQUIRED:correo", "REQUIRED:password"]);
  }

  var authConfig = getAuthConfig_();
  if (!authConfig.ready) {
    return fail_("El superadministrador todavia no esta configurado en Apps Script.", [
      "SUPERADMIN_NOT_CONFIGURED"
    ]);
  }

  if (normalize_(email) !== normalize_(authConfig.email) || !verifyPassword_(password, authConfig)) {
    audit_("Usuarios", "loginFallido", "", "", "Intento invalido", context, email);
    return fail_("Correo o clave incorrectos.", ["INVALID_CREDENTIALS"]);
  }

  var user = ensureSuperadminUser_(authConfig.email);
  var session = createAuthSession_(user);
  audit_("Usuarios", "login", "", "", "Sesion iniciada", context, authConfig.email);

  return ok_({
    usuario: publicUser_(user),
    token: session.token,
    venceEn: session.venceEn
  }, "Sesion iniciada correctamente.");
}

function validarSesion_(payload, context) {
  var token = String(payload && payload.token ? payload.token : "");
  if (!token) return fail_("Sesion requerida.", ["REQUIRED:token"]);

  var session = findActiveSessionByToken_(token);
  if (!session) return fail_("Sesion invalida o vencida.", ["INVALID_SESSION"]);

  var expiresAt = new Date(session.venceEn);
  if (isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    updateRecordById_("Sesiones", session.id, {
      estado: "Vencida",
      ultimoAcceso: nowIso_()
    });
    return fail_("Sesion vencida.", ["SESSION_EXPIRED"]);
  }

  updateRecordById_("Sesiones", session.id, {
    ultimoAcceso: nowIso_()
  });

  var user = findUserByEmail_(session.correo) || {
    id: session.usuarioId,
    correo: session.correo,
    nombreCompleto: "Superadministrador",
    estado: "Activo"
  };

  return ok_({
    usuario: publicUser_(user),
    venceEn: session.venceEn
  }, "Sesion validada.");
}

function cerrarSesion_(payload, context) {
  var token = String(payload && payload.token ? payload.token : "");
  if (!token) return ok_({}, "Sesion cerrada.");
  var session = findActiveSessionByToken_(token);
  if (session) {
    updateRecordById_("Sesiones", session.id, {
      estado: "Cerrada",
      ultimoAcceso: nowIso_()
    });
    audit_("Usuarios", "cerrarSesion", "", "", "Sesion cerrada", context, session.correo);
  }
  return ok_({}, "Sesion cerrada.");
}

function confirmarCorreo_(payload, context) {
  return preparedAction_("confirmarCorreo", "Confirmacion de correo preparada para Fase 2.", payload);
}

function solicitarAcceso_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  if (!data.correo || !isValidEmail_(data.correo)) return fail_("Correo invalido.", ["INVALID_EMAIL"]);
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
  if (!data.correo || !isValidEmail_(data.correo)) return fail_("Correo invalido.", ["INVALID_EMAIL"]);
  var record = {
    id: uuid_(),
    usuarioId: data.usuarioId || "",
    correo: data.correo,
    codigo: uuid_(),
    estado: "Invitacion pendiente",
    proyectoId: data.proyectoId || "",
    rol: data.rol || "Invitado",
    permisos: data.permisos || "",
    venceEn: data.venceEn || "",
    creadoEn: nowIso_(),
    confirmadoEn: ""
  };
  appendRecord_("Invitaciones", record);
  audit_("Usuarios", "invitarUsuario", record.proyectoId, "", record, context, record.correo);
  return ok_(record, "Invitacion registrada. Envio de correo se completa en Fase 2.");
}

function getAuthConfig_() {
  var props = PropertiesService.getScriptProperties();
  var email = String(props.getProperty(CONTROL360_CONFIG.SUPERADMIN_EMAIL_PROPERTY) || "").trim().toLowerCase();
  var salt = props.getProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_SALT_PROPERTY);
  var passwordHash = props.getProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_HASH_PROPERTY);
  return {
    email: email,
    salt: salt,
    passwordHash: passwordHash,
    ready: Boolean(email && salt && passwordHash)
  };
}

function verifyPassword_(password, authConfig) {
  var candidate = hashSecret_(authConfig.salt + ":" + password);
  return constantTimeEquals_(candidate, authConfig.passwordHash);
}

function createAuthSession_(user) {
  var token = uuid_() + "-" + uuid_();
  var expiresAt = new Date(Date.now() + CONTROL360_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000);
  appendRecord_("Sesiones", {
    id: uuid_(),
    tokenHash: hashSecret_(token),
    usuarioId: user.id,
    correo: user.correo,
    estado: "Activo",
    creadoEn: nowIso_(),
    ultimoAcceso: nowIso_(),
    venceEn: expiresAt.toISOString()
  });
  return {
    token: token,
    venceEn: expiresAt.toISOString()
  };
}

function findActiveSessionByToken_(token) {
  var tokenHash = hashSecret_(token);
  var sessions = readRecords_("Sesiones");
  for (var index = 0; index < sessions.length; index++) {
    if (String(sessions[index].tokenHash) === tokenHash && String(sessions[index].estado) === "Activo") {
      return sessions[index];
    }
  }
  return null;
}

function ensureSuperadminUser_(email) {
  var existing = findUserByEmail_(email);
  if (existing) {
    updateRecordById_("Usuarios", existing.id, {
      nombreCompleto: existing.nombreCompleto || "Superadministrador",
      correo: email,
      estado: "Activo",
      correoConfirmado: true,
      ultimoAcceso: nowIso_()
    });
    return findUserByEmail_(email);
  }

  var user = {
    id: uuid_(),
    nombreCompleto: "Superadministrador",
    correo: email,
    telefono: "",
    estado: "Activo",
    correoConfirmado: true,
    creadoEn: nowIso_(),
    ultimoAcceso: nowIso_(),
    fechaVencimiento: "",
    notas: "Superadministrador general unico"
  };
  appendRecord_("Usuarios", user);
  return user;
}

function findUserByEmail_(email) {
  var users = readRecords_("Usuarios");
  for (var index = 0; index < users.length; index++) {
    if (normalize_(users[index].correo) === normalize_(email)) return users[index];
  }
  return null;
}

function publicUser_(user) {
  return {
    id: user.id,
    nombreCompleto: user.nombreCompleto || "Superadministrador",
    correo: user.correo,
    rol: "Superadmin",
    estado: user.estado || "Activo"
  };
}

function hashSecret_(value) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(bytes);
}

function constantTimeEquals_(a, b) {
  a = String(a || "");
  b = String(b || "");
  if (a.length !== b.length) return false;
  var mismatch = 0;
  for (var index = 0; index < a.length; index++) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}
