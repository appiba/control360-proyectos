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
  var rounds = CONTROL360_CONFIG.OWNER_PASSWORD_ROUNDS;
  var passwordHash = hashPassword_(tempPassword, salt, rounds);
  props.setProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_SALT_PROPERTY, salt);
  props.setProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_HASH_PROPERTY, passwordHash);
  props.setProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_ROUNDS_PROPERTY, String(rounds));
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
    return fail_("Ingresa usuario y clave.", ["REQUIRED:correo", "REQUIRED:password"]);
  }

  var authConfig = getAuthConfig_();
  if (authConfig.ready && emailMatchesAuthConfig_(email, authConfig) && verifyPassword_(password, authConfig)) {
    var owner = ensureSuperadminUser_(authConfig.email || email);
    var ownerSession = createAuthSession_(owner);
    updateRecordById_("Usuarios", owner.id, { ultimoAcceso: nowIso_() });
    audit_("Usuarios", "login", "", "", "Sesion superadmin iniciada", context, owner.correo);
    return ok_({
      usuario: publicUser_(owner),
      token: ownerSession.token,
      venceEn: ownerSession.venceEn
    }, "Sesion iniciada correctamente.");
  }

  var user = findUserByEmail_(email);
  if (!user || String(user.estado || "").toLowerCase() !== "activo" || !isTruthy_(user.correoConfirmado)) {
    audit_("Usuarios", "loginFallido", "", "", "Usuario inactivo o no confirmado", context, email);
    return fail_("Usuario o clave incorrectos.", ["INVALID_CREDENTIALS"]);
  }

  if (!user.passwordHash || !user.passwordSalt || !verifyUserPassword_(password, user)) {
    audit_("Usuarios", "loginFallido", "", "", "Clave invalida", context, email);
    return fail_("Usuario o clave incorrectos.", ["INVALID_CREDENTIALS"]);
  }

  var session = createAuthSession_(user);
  updateRecordById_("Usuarios", user.id, { ultimoAcceso: nowIso_() });
  audit_("Usuarios", "login", "", "", "Sesion usuario iniciada", context, user.correo);

  return ok_({
    usuario: publicUser_(user),
    token: session.token,
    venceEn: session.venceEn
  }, "Sesion iniciada correctamente.");
}

function validarSesion_(payload, context) {
  var token = String(payload && payload.token ? payload.token : context && context.token ? context.token : "");
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

  var user = findUserByEmail_(session.correo);
  if (!user || String(user.estado || "").toLowerCase() !== "activo") {
    return fail_("Usuario inactivo o no encontrado.", ["USER_INACTIVE"]);
  }

  return ok_({
    usuario: publicUser_(user),
    venceEn: session.venceEn
  }, "Sesion validada.");
}

function cerrarSesion_(payload, context) {
  var token = String(payload && payload.token ? payload.token : context && context.token ? context.token : "");
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
  var data = sanitizeRecord_(payload || {});
  var email = String(data.correo || "").trim().toLowerCase();
  var code = String(payload && payload.codigo ? payload.codigo : "").trim();
  var password = String(payload && payload.password ? payload.password : "");

  if (!email || !isValidEmail_(email)) return fail_("Usuario invalido.", ["INVALID_EMAIL"]);
  if (!code) return fail_("Codigo de invitacion requerido.", ["REQUIRED:codigo"]);
  if (!password || password.length < 6) return fail_("La clave nueva debe tener minimo 6 caracteres.", ["WEAK_PASSWORD"]);

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var invitation = findInvitationByCode_(code);
    if (!invitation) return fail_("Invitacion no encontrada.", ["INVITATION_NOT_FOUND"]);
    if (normalize_(invitation.correo) !== normalize_(email)) {
      audit_("Usuarios", "confirmarCorreoFallido", invitation.proyectoId, "", "Correo no coincide", context, email);
      return fail_("La invitacion no corresponde a ese usuario.", ["INVITATION_EMAIL_MISMATCH"]);
    }
    if (!isPendingInvitation_(invitation)) {
      return fail_("La invitacion ya fue usada o no esta activa.", ["INVITATION_NOT_PENDING"]);
    }
    if (isExpiredIso_(invitation.venceEn)) {
      updateRecordById_("Invitaciones", invitation.id, { estado: "Invitacion vencida" });
      return fail_("La invitacion esta vencida.", ["INVITATION_EXPIRED"]);
    }

    var user = ensureInvitedUser_(invitation, {
      nombreCompleto: data.nombreCompleto || invitation.nombreCompleto || email,
      telefono: data.telefono || invitation.telefono || "",
      password: password
    });

    var access = null;
    if (invitation.proyectoId) {
      access = ensureProjectAccess_(user, invitation.proyectoId, invitation.rol, invitation.permisos, invitation.venceEn);
    }

    updateRecordById_("Invitaciones", invitation.id, {
      usuarioId: user.id,
      codigo: "",
      estado: "Confirmada",
      confirmadoEn: nowIso_()
    });

    var session = createAuthSession_(user);
    audit_("Usuarios", "confirmarCorreo", invitation.proyectoId, "", "Invitacion confirmada", context, user.correo);

    return ok_({
      usuario: publicUser_(findUserByEmail_(user.correo) || user),
      token: session.token,
      venceEn: session.venceEn,
      acceso: access ? publicAccess_(access) : null
    }, "Invitacion activada. Sesion iniciada.");
  } finally {
    lock.releaseLock();
  }
}

function solicitarAcceso_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  if (!data.correo || !isValidEmail_(data.correo)) return fail_("Correo invalido.", ["INVALID_EMAIL"]);
  var record = {
    id: uuid_(),
    usuarioId: data.usuarioId || "",
    correo: String(data.correo).trim().toLowerCase(),
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
  var authError = requireSystemPermission_(context, "invitarUsuarios");
  if (authError) return authError;

  var data = sanitizeRecord_(payload || {});
  var email = String(data.correo || "").trim().toLowerCase();
  if (!email || !isValidEmail_(email)) return fail_("Correo invalido.", ["INVALID_EMAIL"]);

  var role = normalizeRole_(data.rol || "Socio");
  var projectId = data.proyectoId || "";
  if (projectId && !findRecordById_("Proyectos", projectId)) {
    return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);
  }

  var rawPermissions = data.permisos || defaultPermissionsForRole_(role).join(",");
  var permissions = normalizePermissionString_(rawPermissions, role);
  var code = uuid_();
  var expiresAt = data.venceEn || invitationExpirationIso_();
  var appUrl = String(data.appUrl || "").replace(/#.*$/, "").replace(/\?$/, "");
  var acceptUrl = appUrl
    ? appUrl + "#/login?codigo=" + encodeURIComponent(code) + "&usuario=" + encodeURIComponent(email)
    : "";

  var existingUser = findUserByEmail_(email);
  var record = {
    id: uuid_(),
    usuarioId: existingUser ? existingUser.id : "",
    nombreCompleto: data.nombreCompleto || "",
    telefono: data.telefono || "",
    correo: email,
    codigo: "",
    codigoHash: hashSecret_(code),
    estado: "Invitacion pendiente",
    proyectoId: projectId,
    rol: role,
    permisos: permissions,
    venceEn: expiresAt,
    creadoEn: nowIso_(),
    creadoPor: context.userEmail || "",
    enviadoEn: "",
    confirmadoEn: "",
    aceptacionUrl: acceptUrl
  };

  appendRecord_("Invitaciones", record);
  var notification = maybeSendInvitationEmail_(record, code, data.enviarCorreo !== "false" && data.enviarCorreo !== false);
  if (notification.sent) {
    updateRecordById_("Invitaciones", record.id, { enviadoEn: nowIso_() });
    record.enviadoEn = nowIso_();
  }
  audit_("Usuarios", "invitarUsuario", record.proyectoId, "", publicInvitation_(record), context, record.correo);

  return ok_({
    invitacion: publicInvitation_(record),
    activationCode: code,
    activationUrl: acceptUrl,
    email: notification
  }, "Invitacion creada. Copia el codigo y entregalo solo al socio correcto.");
}

function listarUsuarios_(payload, context) {
  var authError = requireSystemPermission_(context, "administrarPermisos");
  if (authError) return authError;
  return ok_(readRecords_("Usuarios").map(publicUser_), "Usuarios obtenidos.");
}

function listarInvitaciones_(payload, context) {
  var authError = requireSystemPermission_(context, "invitarUsuarios");
  if (authError) return authError;
  return ok_(readRecords_("Invitaciones").map(publicInvitation_), "Invitaciones obtenidas.");
}

function listarAccesosProyecto_(payload, context) {
  var authError = requireSystemPermission_(context, "administrarPermisos");
  if (authError) return authError;
  return ok_(readRecords_("AccesosProyecto").map(publicAccess_), "Accesos obtenidos.");
}

function listarPermisos_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  return ok_(readRecords_("Permisos").filter(function (item) {
    return String(item.activo) !== "false";
  }), "Permisos obtenidos.");
}

function revocarAcceso_(payload, context) {
  var authError = requireSystemPermission_(context, "administrarPermisos");
  if (authError) return authError;
  if (!payload || !payload.id) return fail_("Falta id de acceso.", ["REQUIRED:id"]);

  var result = updateRecordById_("AccesosProyecto", payload.id, {
    estado: "Revocado",
    actualizadoEn: nowIso_()
  });
  if (!result) return fail_("Acceso no encontrado.", ["ACCESS_NOT_FOUND"]);
  audit_("Usuarios", "revocarAcceso", result.next.proyectoId, result.previous, result.next, context, result.next.usuarioId);
  return ok_(publicAccess_(result.next), "Acceso revocado.");
}

function getAuthConfig_() {
  var ownerConfig = getOwnerAuthConfig_();
  if (ownerConfig.ready) return ownerConfig;

  var props = PropertiesService.getScriptProperties();
  var email = String(props.getProperty(CONTROL360_CONFIG.SUPERADMIN_EMAIL_PROPERTY) || "").trim().toLowerCase();
  var salt = props.getProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_SALT_PROPERTY);
  var passwordHash = props.getProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_HASH_PROPERTY);
  var rounds = Number(props.getProperty(CONTROL360_CONFIG.SUPERADMIN_PASSWORD_ROUNDS_PROPERTY) || 1);
  return {
    email: email,
    salt: salt,
    passwordHash: passwordHash,
    rounds: rounds,
    ready: Boolean(email && salt && passwordHash)
  };
}

function getOwnerAuthConfig_() {
  return {
    emailHash: CONTROL360_CONFIG.OWNER_EMAIL_HASH,
    salt: CONTROL360_CONFIG.OWNER_PASSWORD_SALT,
    passwordHash: CONTROL360_CONFIG.OWNER_PASSWORD_HASH,
    rounds: CONTROL360_CONFIG.OWNER_PASSWORD_ROUNDS,
    ready: Boolean(
      CONTROL360_CONFIG.OWNER_EMAIL_HASH &&
      CONTROL360_CONFIG.OWNER_PASSWORD_SALT &&
      CONTROL360_CONFIG.OWNER_PASSWORD_HASH
    )
  };
}

function emailMatchesAuthConfig_(email, authConfig) {
  if (authConfig.emailHash) {
    return constantTimeEquals_(hashSecret_(normalize_(email)), authConfig.emailHash);
  }
  return normalize_(email) === normalize_(authConfig.email);
}

function verifyPassword_(password, authConfig) {
  var candidate = hashPassword_(password, authConfig.salt, authConfig.rounds);
  return constantTimeEquals_(candidate, authConfig.passwordHash);
}

function verifyUserPassword_(password, user) {
  var rounds = Number(user.passwordRounds || CONTROL360_CONFIG.OWNER_PASSWORD_ROUNDS || 1);
  var candidate = hashPassword_(password, user.passwordSalt, rounds);
  return constantTimeEquals_(candidate, user.passwordHash);
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
      rol: "Superadmin",
      estado: "Activo",
      correoConfirmado: true,
      ultimoAcceso: nowIso_(),
      notas: existing.notas || "Superadministrador general unico"
    });
    return findUserByEmail_(email);
  }

  var user = {
    id: uuid_(),
    nombreCompleto: "Superadministrador",
    correo: email,
    telefono: "",
    rol: "Superadmin",
    estado: "Activo",
    correoConfirmado: true,
    passwordHash: "",
    passwordSalt: "",
    passwordRounds: "",
    invitacionId: "",
    creadoEn: nowIso_(),
    ultimoAcceso: nowIso_(),
    fechaVencimiento: "",
    notas: "Superadministrador general unico"
  };
  appendRecord_("Usuarios", user);
  return user;
}

function ensureInvitedUser_(invitation, profile) {
  var email = String(invitation.correo || "").trim().toLowerCase();
  var existing = findUserByEmail_(email);
  var passwordData = buildPasswordData_(profile.password);
  var changes = {
    nombreCompleto: profile.nombreCompleto || email,
    correo: email,
    telefono: profile.telefono || "",
    rol: normalizeRole_(invitation.rol || "Socio"),
    estado: "Activo",
    correoConfirmado: true,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    passwordRounds: passwordData.rounds,
    invitacionId: invitation.id,
    ultimoAcceso: nowIso_(),
    fechaVencimiento: invitation.venceEn || "",
    notas: "Usuario creado por invitacion CONTROL360"
  };

  if (existing) {
    updateRecordById_("Usuarios", existing.id, changes);
    return findUserByEmail_(email);
  }

  var user = Object.assign({
    id: uuid_(),
    creadoEn: nowIso_()
  }, changes);
  appendRecord_("Usuarios", user);
  return user;
}

function ensureProjectAccess_(user, projectId, role, permissions, expiresAt) {
  var accesses = readRecords_("AccesosProyecto");
  for (var index = 0; index < accesses.length; index++) {
    if (String(accesses[index].usuarioId) === String(user.id) && String(accesses[index].proyectoId) === String(projectId)) {
      var result = updateRecordById_("AccesosProyecto", accesses[index].id, {
        rol: normalizeRole_(role || accesses[index].rol || "Socio"),
        permisos: normalizePermissionString_(permissions, role),
        estado: "Activo",
        fechaVencimiento: expiresAt || "",
        actualizadoEn: nowIso_()
      });
      return result ? result.next : accesses[index];
    }
  }

  var record = {
    id: uuid_(),
    usuarioId: user.id,
    proyectoId: projectId,
    rol: normalizeRole_(role || "Socio"),
    permisos: normalizePermissionString_(permissions, role),
    estado: "Activo",
    fechaInicio: todayIso_(),
    fechaVencimiento: expiresAt || "",
    creadoEn: nowIso_(),
    actualizadoEn: nowIso_()
  };
  appendRecord_("AccesosProyecto", record);
  return record;
}

function buildPasswordData_(password) {
  var salt = uuid_() + uuid_();
  var rounds = CONTROL360_CONFIG.OWNER_PASSWORD_ROUNDS || 2500;
  return {
    salt: salt,
    rounds: rounds,
    hash: hashPassword_(password, salt, rounds)
  };
}

function findUserByEmail_(email) {
  var users = readRecords_("Usuarios");
  for (var index = 0; index < users.length; index++) {
    if (normalize_(users[index].correo) === normalize_(email)) return users[index];
  }
  return null;
}

function findUserById_(id) {
  var users = readRecords_("Usuarios");
  for (var index = 0; index < users.length; index++) {
    if (String(users[index].id) === String(id)) return users[index];
  }
  return null;
}

function findInvitationByCode_(code) {
  var plain = String(code || "").trim();
  var hashed = hashSecret_(plain);
  var invitations = readRecords_("Invitaciones");
  for (var index = 0; index < invitations.length; index++) {
    if (String(invitations[index].codigoHash || "") === hashed) return invitations[index];
    if (invitations[index].codigo && String(invitations[index].codigo) === plain) return invitations[index];
  }
  return null;
}

function getUserProjectAccesses_(userId) {
  if (!userId) return [];
  return readRecords_("AccesosProyecto")
    .filter(function (access) {
      return String(access.usuarioId) === String(userId) &&
        String(access.estado || "").toLowerCase() === "activo" &&
        !isExpiredIso_(access.fechaVencimiento);
    })
    .map(publicAccess_);
}

function publicUser_(user) {
  var superadmin = isSuperadminUser_(user);
  var role = superadmin ? "Superadmin" : normalizeRole_(user.rol || "Invitado");
  return {
    id: user.id,
    nombreCompleto: user.nombreCompleto || (superadmin ? "Superadministrador" : user.correo),
    correo: user.correo,
    telefono: user.telefono || "",
    rol: role,
    estado: user.estado || "Activo",
    correoConfirmado: isTruthy_(user.correoConfirmado),
    ultimoAcceso: user.ultimoAcceso || "",
    fechaVencimiento: user.fechaVencimiento || "",
    permisos: superadmin ? ["*"] : [],
    accesos: superadmin ? [] : getUserProjectAccesses_(user.id)
  };
}

function publicInvitation_(invitation) {
  return {
    id: invitation.id,
    usuarioId: invitation.usuarioId || "",
    nombreCompleto: invitation.nombreCompleto || "",
    telefono: invitation.telefono || "",
    correo: invitation.correo || "",
    estado: invitation.estado || "",
    proyectoId: invitation.proyectoId || "",
    rol: normalizeRole_(invitation.rol || "Socio"),
    permisos: invitation.permisos || "",
    venceEn: invitation.venceEn || "",
    creadoEn: invitation.creadoEn || "",
    creadoPor: invitation.creadoPor || "",
    enviadoEn: invitation.enviadoEn || "",
    confirmadoEn: invitation.confirmadoEn || "",
    aceptacionUrl: invitation.aceptacionUrl || ""
  };
}

function publicAccess_(access) {
  return {
    id: access.id,
    usuarioId: access.usuarioId || "",
    proyectoId: access.proyectoId || "",
    rol: normalizeRole_(access.rol || "Invitado"),
    permisos: access.permisos || "",
    estado: access.estado || "",
    fechaInicio: access.fechaInicio || "",
    fechaVencimiento: access.fechaVencimiento || "",
    creadoEn: access.creadoEn || "",
    actualizadoEn: access.actualizadoEn || ""
  };
}

function maybeSendInvitationEmail_(invitation, code, shouldSend) {
  var metadata = {
    to: invitation.correo,
    subject: "Invitacion privada CONTROL360",
    sent: false,
    reason: shouldSend ? "" : "Envio desactivado por el administrador."
  };

  if (!shouldSend) {
    appendNotification_(invitation, metadata);
    return metadata;
  }

  try {
    var lines = [
      "Has recibido una invitacion privada a CONTROL360.",
      "",
      "Usuario: " + invitation.correo,
      "Codigo de activacion: " + code,
      invitation.aceptacionUrl ? "Enlace: " + invitation.aceptacionUrl : "",
      "",
      "Crea tu clave desde la pantalla de activacion. No compartas este codigo."
    ].filter(String);
    MailApp.sendEmail(invitation.correo, metadata.subject, lines.join("\n"));
    metadata.sent = true;
    metadata.reason = "Correo enviado.";
  } catch (error) {
    metadata.reason = String(error && error.message ? error.message : error);
  }

  appendNotification_(invitation, metadata);
  return metadata;
}

function appendNotification_(invitation, metadata) {
  try {
    appendRecord_("Notificaciones", {
      id: uuid_(),
      usuarioId: invitation.usuarioId || "",
      proyectoId: invitation.proyectoId || "",
      tipo: "Invitacion",
      mensaje: "Invitacion a CONTROL360 para " + invitation.correo,
      canal: "Email",
      estado: metadata.sent ? "Enviada" : "Pendiente",
      enviadoEn: metadata.sent ? nowIso_() : "",
      leidoEn: "",
      metadata: JSON.stringify(metadata)
    });
  } catch (error) {
    return;
  }
}

function normalizeRole_(role) {
  var value = normalize_(role).replace(/\s+/g, "");
  if (value === "superadmin" || value === "superadministrador") return "Superadmin";
  if (value === "administradorproyecto" || value === "administradordeproyecto" || value === "adminproyecto") return "AdministradorProyecto";
  if (value === "editor") return "Editor";
  if (value === "socio") return "Socio";
  return "Invitado";
}

function isSuperadminUser_(user) {
  if (!user) return false;
  if (normalizeRole_(user.rol || "") === "Superadmin") return true;
  var authConfig = getAuthConfig_();
  return authConfig.ready && emailMatchesAuthConfig_(user.correo || "", authConfig);
}

function isPendingInvitation_(invitation) {
  var state = normalize_(invitation.estado || "");
  return state === "invitacion pendiente" || state === "pendiente";
}

function isTruthy_(value) {
  if (value === true) return true;
  var text = normalize_(value);
  return text === "true" || text === "si" || text === "sí" || text === "1" || text === "activo";
}

function isExpiredIso_(value) {
  if (!value) return false;
  var expiresAt = new Date(value);
  return !isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

function invitationExpirationIso_() {
  var days = Number(CONTROL360_CONFIG.INVITATION_DURATION_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function hashSecret_(value) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return Utilities.base64Encode(bytes);
}

function hashPassword_(password, salt, rounds) {
  var current = String(salt) + ":" + String(password);
  var count = Math.max(Number(rounds || 1), 1);
  for (var index = 0; index < count; index++) {
    current = hashSecret_(current);
  }
  return current;
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
