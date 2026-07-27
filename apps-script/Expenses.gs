var CATALOGO_GASTOS_BASE = [
  ["Personal", "Operación y talento", "DJ"],
  ["Personal", "Operación y talento", "Artista"],
  ["Personal", "Operación y talento", "Presentador"],
  ["Personal", "Operación y talento", "Animador"],
  ["Personal", "Operación y talento", "Bartender"],
  ["Personal", "Operación y talento", "Mesero"],
  ["Personal", "Operación y talento", "Cajero"],
  ["Personal", "Operación y talento", "Limpieza"],
  ["Personal", "Operación y talento", "Seguridad"],
  ["Personal", "Operación y talento", "Jefe de seguridad"],
  ["Personal", "Operación y talento", "Control de accesos"],
  ["Personal", "Operación y talento", "Boletería"],
  ["Personal", "Operación y talento", "Técnico de sonido"],
  ["Personal", "Operación y talento", "Técnico de iluminación"],
  ["Personal", "Operación y talento", "Operador LED"],
  ["Personal", "Operación y talento", "Productor"],
  ["Personal", "Operación y talento", "Coordinador"],
  ["Personal", "Operación y talento", "Fotógrafo"],
  ["Personal", "Operación y talento", "Videógrafo"],
  ["Personal", "Operación y talento", "Community manager"],
  ["Personal", "Operación y talento", "Diseñador"],
  ["Personal", "Operación y talento", "Otros"],
  ["Producción", "Técnica", "Sonido"],
  ["Producción", "Técnica", "Iluminación"],
  ["Producción", "Técnica", "Pantallas LED"],
  ["Producción", "Técnica", "Tarima"],
  ["Producción", "Técnica", "Generador"],
  ["Producción", "Técnica", "Cableado"],
  ["Producción", "Técnica", "Consolas"],
  ["Producción", "Técnica", "Micrófonos"],
  ["Producción", "Técnica", "Backline"],
  ["Producción", "Técnica", "Truss"],
  ["Producción", "Técnica", "Vallas"],
  ["Producción", "Técnica", "Montaje"],
  ["Producción", "Técnica", "Desmontaje"],
  ["Producción", "Técnica", "Transporte técnico"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Carpas"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Sillas"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Mesas"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Mantelería"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Barras móviles"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Tarimas"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Podios"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Stands"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Camerinos móviles"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Baños portátiles"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Calefactores"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Ventiladores"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Refrigeración"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Sillones lounge"],
  ["Alquileres y mobiliario", "Infraestructura temporal", "Bancos altos"],
  ["Bebidas e hidratación", "Consumo", "Agua"],
  ["Bebidas e hidratación", "Consumo", "Colas"],
  ["Bebidas e hidratación", "Consumo", "Jugos"],
  ["Bebidas e hidratación", "Consumo", "Energizantes"],
  ["Bebidas e hidratación", "Consumo", "Hielo"],
  ["Bebidas e hidratación", "Consumo", "Vasos"],
  ["Bebidas e hidratación", "Consumo", "Sorbetes"],
  ["Bebidas e hidratación", "Consumo", "Servilletas"],
  ["Bebidas e hidratación", "Consumo", "Cortesías"],
  ["Alimentación", "Catering y alimentación operativa", "Desayuno"],
  ["Alimentación", "Catering y alimentación operativa", "Almuerzo"],
  ["Alimentación", "Catering y alimentación operativa", "Cena"],
  ["Alimentación", "Catering y alimentación operativa", "Refrigerios"],
  ["Alimentación", "Catering y alimentación operativa", "Catering"],
  ["Alimentación", "Catering y alimentación operativa", "Snacks"],
  ["Alimentación", "Catering y alimentación operativa", "Coffee break"],
  ["Alimentación", "Catering y alimentación operativa", "Alimentación de artistas"],
  ["Alimentación", "Catering y alimentación operativa", "Alimentación de producción"],
  ["Alimentación", "Catering y alimentación operativa", "Alimentación de seguridad"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Combustible"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Taxi"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Transporte por aplicación"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Bus"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Avión"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Peajes"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Parqueadero"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Hotel"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Hostal"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Airbnb"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Desayuno"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Almuerzo"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Cena"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Reuniones comerciales"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Internet"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Papelería"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Mensajería"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Estudios"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Consultorías"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Investigación"],
  ["Logística y viáticos", "Movilidad, viaje e investigación", "Levantamientos"],
  ["Publicidad", "Marketing y ventas", "Meta Ads"],
  ["Publicidad", "Marketing y ventas", "TikTok Ads"],
  ["Publicidad", "Marketing y ventas", "Google Ads"],
  ["Publicidad", "Marketing y ventas", "Radio"],
  ["Publicidad", "Marketing y ventas", "Televisión"],
  ["Publicidad", "Marketing y ventas", "Prensa"],
  ["Publicidad", "Marketing y ventas", "Influencers"],
  ["Publicidad", "Marketing y ventas", "Diseño"],
  ["Publicidad", "Marketing y ventas", "Fotografía"],
  ["Publicidad", "Marketing y ventas", "Video"],
  ["Publicidad", "Marketing y ventas", "Impresión"],
  ["Publicidad", "Marketing y ventas", "Flyers"],
  ["Publicidad", "Marketing y ventas", "Vallas"],
  ["Publicidad", "Marketing y ventas", "Relaciones públicas"],
  ["Publicidad", "Marketing y ventas", "Comisión de ticketera"],
  ["Publicidad", "Marketing y ventas", "Comisiones de venta"],
  ["Administración", "Soporte administrativo", "Legal"],
  ["Administración", "Soporte administrativo", "Contabilidad"],
  ["Administración", "Soporte administrativo", "Notaría"],
  ["Administración", "Soporte administrativo", "Contratos"],
  ["Administración", "Soporte administrativo", "Seguros"],
  ["Administración", "Soporte administrativo", "Impuestos"],
  ["Administración", "Soporte administrativo", "Comisiones bancarias"],
  ["Administración", "Soporte administrativo", "Plataforma de pagos"],
  ["Administración", "Soporte administrativo", "Software"],
  ["Administración", "Soporte administrativo", "Internet"],
  ["Administración", "Soporte administrativo", "Telefonía"],
  ["Administración", "Soporte administrativo", "Papelería"],
  ["Infraestructura", "Adecuaciones", "Cerramientos"],
  ["Infraestructura", "Adecuaciones", "Pisos temporales"],
  ["Infraestructura", "Adecuaciones", "Rampas"],
  ["Infraestructura", "Adecuaciones", "Escaleras"],
  ["Infraestructura", "Adecuaciones", "Pasarelas"],
  ["Infraestructura", "Adecuaciones", "Estructuras"],
  ["Infraestructura", "Adecuaciones", "Techos"],
  ["Infraestructura", "Adecuaciones", "Toldos"],
  ["Infraestructura", "Adecuaciones", "Señalética"],
  ["Infraestructura", "Adecuaciones", "Iluminación de emergencia"],
  ["Otros", "Contingencias", "Propinas"],
  ["Otros", "Contingencias", "Movilización"],
  ["Otros", "Contingencias", "Recargas"],
  ["Otros", "Contingencias", "Reposición"],
  ["Otros", "Contingencias", "Daños"],
  ["Otros", "Contingencias", "Pérdidas"],
  ["Otros", "Contingencias", "Multas"],
  ["Otros", "Contingencias", "Garantías"],
  ["Otros", "Contingencias", "Depósitos"],
  ["Otros", "Contingencias", "Gastos bancarios"],
  ["Otros", "Contingencias", "Imprevistos"]
].map(function (row) {
  return {
    categoria: row[0],
    subcategoria: row[1],
    concepto: row[2],
    unidadSugerida: ""
  };
});

function listarGastos_(payload) {
  var records = readRecords_("Gastos");
  if (payload && payload.proyectoId) {
    records = records.filter(function (record) {
      return String(record.proyectoId) === String(payload.proyectoId);
    });
  }
  return ok_(records, "Gastos obtenidos.");
}

function registrarGasto_(payload, context) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = sanitizeRecord_(payload || {});
    var missing = requireFields_(data, ["proyectoId", "categoria", "subcategoria", "concepto", "estado"]);
    if (missing.length) return fail_("Faltan campos obligatorios.", missing);
    if (!findRecordById_("Proyectos", data.proyectoId)) return fail_("Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);

    var record = {
      id: uuid_(),
      proyectoId: data.proyectoId,
      etapa: data.etapa || "",
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      concepto: data.concepto,
      cantidad: toNumber_(data.cantidad || 1),
      unidad: data.unidad || "",
      valorPresupuestado: toNumber_(data.valorPresupuestado),
      valorCotizado: toNumber_(data.valorCotizado),
      valorNegociado: toNumber_(data.valorNegociado),
      valorReal: toNumber_(data.valorReal),
      valorPagado: toNumber_(data.valorPagado),
      saldoPendiente: toNumber_(data.saldoPendiente),
      proveedor: data.proveedor || "",
      fecha: data.fecha || todayIso_(),
      formaPago: data.formaPago || "",
      estado: data.estado,
      comprobante: data.comprobante || "",
      observaciones: data.observaciones || "",
      quienCubre: data.quienCubre || "",
      creadoPor: context.userEmail || "",
      creadoEn: nowIso_(),
      actualizadoEn: nowIso_()
    };
    appendRecord_("Gastos", record);
    audit_("Gastos", "registrarGasto", record.proyectoId, "", record, context, record.concepto);
    return ok_(record, "Gasto registrado.");
  } finally {
    lock.releaseLock();
  }
}

function obtenerCatalogoGastos_() {
  var records = readRecords_("CatalogoGastos");
  return ok_(records, "Catálogo de gastos obtenido.");
}

function crearConceptoGasto_(payload, context) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = sanitizeRecord_(payload || {});
    var missing = requireFields_(data, ["categoria", "subcategoria", "concepto"]);
    if (missing.length) return fail_("Faltan campos obligatorios.", missing);
    var duplicate = readRecords_("CatalogoGastos").some(function (item) {
      return normalize_(item.categoria) === normalize_(data.categoria) &&
        normalize_(item.subcategoria) === normalize_(data.subcategoria) &&
        normalize_(item.concepto) === normalize_(data.concepto);
    });
    if (duplicate) return fail_("El concepto ya existe en el catálogo.", ["DUPLICATE_EXPENSE_CONCEPT"]);
    var record = {
      id: uuid_(),
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      concepto: data.concepto,
      unidadSugerida: data.unidadSugerida || "",
      activo: true,
      creadoEn: nowIso_(),
      actualizadoEn: nowIso_()
    };
    appendRecord_("CatalogoGastos", record);
    audit_("Gastos", "crearConceptoGasto", "", "", record, context, record.concepto);
    return ok_(record, "Concepto agregado al catálogo.");
  } finally {
    lock.releaseLock();
  }
}

