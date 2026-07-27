var CONTROL360_ROLE_PERMISSIONS = {
  Superadmin: ["*"],
  AdministradorProyecto: [
    "verResumen",
    "verIngresos",
    "verGastos",
    "registrarIngresos",
    "registrarGastos",
    "verUtilidades",
    "verSocios",
    "verParticipaciones",
    "descargarInformes",
    "generarInformes",
    "subirDocumentos",
    "verDocumentos",
    "modificarDatos",
    "invitarUsuarios",
    "administrarPermisos",
    "cerrarProyecto"
  ],
  Editor: [
    "verResumen",
    "verIngresos",
    "verGastos",
    "registrarIngresos",
    "registrarGastos",
    "verSocios",
    "verDocumentos",
    "subirDocumentos",
    "modificarDatos"
  ],
  Socio: [
    "verResumen",
    "verIngresos",
    "verGastos",
    "verUtilidades",
    "verSocios",
    "verParticipaciones",
    "verDocumentos",
    "descargarInformes"
  ],
  Invitado: [
    "verResumen",
    "verDocumentos"
  ]
};

function aprobarSolicitud_(payload, context) {
  var authError = requireSystemPermission_(context, "administrarPermisos");
  if (authError) return authError;
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

function requireActiveSession_(context) {
  if (context && context.user && String(context.user.estado || "").toLowerCase() === "activo") return null;
  return fail_("Inicia sesion para continuar.", ["AUTH_REQUIRED"]);
}

function requireSystemPermission_(context, permission) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  if (isSuperadminUser_(context.user)) return null;
  if (hasAnyProjectPermission_(context, permission)) return null;
  return fail_("No tienes permiso para esta accion.", ["FORBIDDEN:" + permission]);
}

function requireProjectPermission_(context, proyectoId, permission) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  if (!proyectoId) return fail_("Falta id de proyecto.", ["REQUIRED:proyectoId"]);
  if (canAccessProject_(context, proyectoId, permission)) return null;
  return fail_("No tienes acceso a este proyecto.", ["PROJECT_FORBIDDEN:" + permission]);
}

function canAccessProject_(context, proyectoId, permission) {
  if (!context || !context.user) return false;
  if (isSuperadminUser_(context.user)) return true;

  var accesses = readRecords_("AccesosProyecto");
  for (var index = 0; index < accesses.length; index++) {
    var access = accesses[index];
    if (String(access.usuarioId) !== String(context.user.id)) continue;
    if (String(access.proyectoId) !== String(proyectoId)) continue;
    if (String(access.estado || "").toLowerCase() !== "activo") continue;
    if (isExpiredIso_(access.fechaVencimiento)) continue;
    if (!permission) return true;
    if (accessHasPermission_(access, permission)) return true;
  }

  return false;
}

function getAccessibleProjectIds_(context, permission) {
  if (!context || !context.user) return [];
  if (isSuperadminUser_(context.user)) return null;

  var ids = {};
  readRecords_("AccesosProyecto").forEach(function (access) {
    if (String(access.usuarioId) !== String(context.user.id)) return;
    if (String(access.estado || "").toLowerCase() !== "activo") return;
    if (isExpiredIso_(access.fechaVencimiento)) return;
    if (permission && !accessHasPermission_(access, permission)) return;
    ids[String(access.proyectoId)] = true;
  });
  return Object.keys(ids);
}

function filterByProjectAccess_(records, context, permission) {
  var ids = getAccessibleProjectIds_(context, permission);
  if (ids === null) return records;
  var allowed = {};
  ids.forEach(function (id) { allowed[id] = true; });
  return records.filter(function (record) {
    return allowed[String(record.proyectoId || record.id || "")];
  });
}

function hasAnyProjectPermission_(context, permission) {
  var ids = getAccessibleProjectIds_(context, permission);
  return ids === null || ids.length > 0;
}

function accessHasPermission_(access, permission) {
  var role = normalizeRole_(access.rol || "Invitado");
  var permissions = parsePermissions_(access.permisos || defaultPermissionsForRole_(role).join(","));
  if (permissions.indexOf("*") !== -1) return true;
  return permissions.indexOf(permission) !== -1;
}

function parsePermissions_(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || "")
    .split(/[,\n;]/)
    .map(function (item) { return String(item).trim(); })
    .filter(Boolean);
}

function normalizePermissionString_(value, role) {
  var defaults = defaultPermissionsForRole_(normalizeRole_(role || "Invitado"));
  var requested = parsePermissions_(value);
  if (!requested.length) requested = defaults;
  var allowed = {};
  defaults.concat(["*"]).forEach(function (permission) { allowed[permission] = true; });
  var finalList = [];
  requested.forEach(function (permission) {
    if (allowed[permission] && finalList.indexOf(permission) === -1) finalList.push(permission);
  });
  return finalList.join(",");
}

function defaultPermissionsForRole_(role) {
  role = normalizeRole_(role || "Invitado");
  return (CONTROL360_ROLE_PERMISSIONS[role] || CONTROL360_ROLE_PERMISSIONS.Invitado).slice();
}
