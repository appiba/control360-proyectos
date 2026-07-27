function routeRequest_(method, e) {
  var body = parseRequest_(e);
  var action = body.action || getParameter_(e, "action") || "healthCheck";
  var payload = body.payload || body.data || {};
  var context = buildContext_(method, e, body);

  try {
    var result = dispatchAction_(action, payload, context);
    return jsonResponse_(result);
  } catch (error) {
    return jsonResponse_(fail_("Error interno en CONTROL360.", [String(error && error.message ? error.message : error)]));
  }
}

function dispatchAction_(action, payload, context) {
  switch (action) {
    case "healthCheck":
      return healthCheck_(context);
    case "setupDatabase":
      return setupDatabase_(context);
    case "login":
      return login_(payload, context);
    case "validarSesion":
      return validarSesion_(payload, context);
    case "cerrarSesion":
      return cerrarSesion_(payload, context);
    case "confirmarCorreo":
      return confirmarCorreo_(payload, context);
    case "solicitarAcceso":
      return solicitarAcceso_(payload, context);
    case "aprobarSolicitud":
      return aprobarSolicitud_(payload, context);
    case "invitarUsuario":
      return invitarUsuario_(payload, context);
    case "listarProyectos":
      return listarProyectos_(payload, context);
    case "obtenerProyecto":
      return obtenerProyecto_(payload, context);
    case "crearProyecto":
      return crearProyecto_(payload, context);
    case "actualizarProyecto":
      return actualizarProyecto_(payload, context);
    case "archivarProyecto":
      return archivarProyecto_(payload, context);
    case "registrarIngreso":
      return registrarIngreso_(payload, context);
    case "listarIngresos":
      return listarIngresos_(payload, context);
    case "registrarGasto":
      return registrarGasto_(payload, context);
    case "listarGastos":
      return listarGastos_(payload, context);
    case "obtenerCatalogoGastos":
      return obtenerCatalogoGastos_(payload, context);
    case "crearConceptoGasto":
      return crearConceptoGasto_(payload, context);
    case "agregarSocio":
      return agregarSocio_(payload, context);
    case "actualizarParticipacion":
      return actualizarParticipacion_(payload, context);
    case "registrarDesembolso":
      return registrarDesembolso_(payload, context);
    case "crearEscenario":
      return crearEscenario_(payload, context);
    case "calcularIndicadores":
      return calcularIndicadores_(payload, context);
    case "obtenerDashboard":
      return obtenerDashboard_(payload, context);
    case "registrarProveedor":
      return registrarProveedor_(payload, context);
    case "crearCotizacion":
      return crearCotizacion_(payload, context);
    case "compararCotizaciones":
      return compararCotizaciones_(payload, context);
    case "registrarNegociacion":
      return registrarNegociacion_(payload, context);
    case "generarInforme":
      return generarInforme_(payload, context);
    case "enviarInforme":
      return enviarInforme_(payload, context);
    case "subirDocumentoMetadata":
      return subirDocumentoMetadata_(payload, context);
    case "obtenerHistorial":
      return obtenerHistorial_(payload, context);
    default:
      return fail_("Acción no reconocida.", ["UNKNOWN_ACTION: " + action]);
  }
}

function healthCheck_(context) {
  return ok_({
    app: CONTROL360_CONFIG.APP_NAME,
    version: CONTROL360_CONFIG.VERSION,
    spreadsheetId: CONTROL360_CONFIG.SPREADSHEET_ID,
    timezone: CONTROL360_CONFIG.TIMEZONE,
    user: context.userEmail || "no-identificado",
    timestamp: nowIso_()
  }, "CONTROL360 API activa.");
}

