function crearCotizacion_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var missing = requireFields_(data, ["proyectoId", "proveedorId"]);
  if (missing.length) return fail_("Faltan campos obligatorios.", missing);
  var authError = requireProjectPermission_(context, data.proyectoId, "modificarDatos");
  if (authError) return authError;
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId,
    necesidadId: data.necesidadId || "",
    proveedorId: data.proveedorId,
    precioInicial: toNumber_(data.precioInicial),
    precioCotizado: toNumber_(data.precioCotizado),
    precioNegociado: toNumber_(data.precioNegociado),
    gastosAdquisicion: toNumber_(data.gastosAdquisicion),
    transporte: toNumber_(data.transporte),
    hospedaje: toNumber_(data.hospedaje),
    alimentacion: toNumber_(data.alimentacion),
    valorFinal: toNumber_(data.valorFinal || data.precioNegociado),
    fecha: data.fecha || todayIso_(),
    vencimiento: data.vencimiento || "",
    archivo: data.archivo || "",
    estado: data.estado || "Cotizado",
    creadoEn: nowIso_()
  };
  appendRecord_("Cotizaciones", record);
  audit_("Compras", "crearCotizacion", record.proyectoId, "", record, context, record.id);
  return ok_(record, "Cotización creada.");
}

function compararCotizaciones_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var records = readRecords_("Cotizaciones");
  if (payload && payload.necesidadId) {
    records = records.filter(function (item) { return String(item.necesidadId) === String(payload.necesidadId); });
  }
  records = filterByProjectAccess_(records, context, "verGastos");
  records.sort(function (a, b) {
    return toNumber_(a.valorFinal) - toNumber_(b.valorFinal);
  });
  return ok_({
    opciones: records,
    mejorOpcion: records[0] || null,
    opcionMasCara: records[records.length - 1] || null
  }, "Cotizaciones comparadas.");
}

function registrarNegociacion_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var authError = requireProjectPermission_(context, data.proyectoId || "", "modificarDatos");
  if (authError) return authError;
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId || "",
    cotizacionId: data.cotizacionId || "",
    precioInicial: toNumber_(data.precioInicial),
    precioFinal: toNumber_(data.precioFinal),
    ahorro: Math.max(toNumber_(data.precioInicial) - toNumber_(data.precioFinal), 0),
    porcentajeDescuento: toNumber_(data.precioInicial) === 0 ? 0 : (Math.max(toNumber_(data.precioInicial) - toNumber_(data.precioFinal), 0) / toNumber_(data.precioInicial)) * 100,
    observaciones: data.observaciones || "",
    fecha: data.fecha || todayIso_(),
    creadoPor: context.userEmail || ""
  };
  appendRecord_("Negociaciones", record);
  audit_("Compras", "registrarNegociacion", record.proyectoId, "", record, context, "Ahorro calculado.");
  return ok_(record, "Negociación registrada.");
}

