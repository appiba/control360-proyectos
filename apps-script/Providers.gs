function registrarProveedor_(payload, context) {
  var authError = requireSystemPermission_(context, "modificarDatos");
  if (authError) return authError;
  var data = sanitizeRecord_(payload || {});
  var missing = requireFields_(data, ["nombre"]);
  if (missing.length) return fail_("Faltan campos obligatorios.", missing);
  var record = {
    id: uuid_(),
    nombre: data.nombre,
    empresa: data.empresa || "",
    categoria: data.categoria || "",
    telefono: data.telefono || "",
    correo: data.correo || "",
    ciudad: data.ciudad || "",
    productosServicios: data.productosServicios || "",
    calificacion: toNumber_(data.calificacion),
    tiempoPromedioEntrega: data.tiempoPromedioEntrega || "",
    comprasRealizadas: 0,
    montoAcumulado: 0,
    descuentoPromedio: 0,
    documentos: data.documentos || "",
    estado: data.estado || "Activo",
    creadoEn: nowIso_(),
    actualizadoEn: nowIso_()
  };
  appendRecord_("Proveedores", record);
  audit_("Proveedores", "registrarProveedor", "", "", record, context, record.nombre);
  return ok_(record, "Proveedor registrado.");
}

