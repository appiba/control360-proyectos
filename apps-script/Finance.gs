function calcularIndicadores_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var proyectoId = payload && payload.proyectoId ? payload.proyectoId : "";
  var incomes = readRecords_("Ingresos");
  var expenses = readRecords_("Gastos");
  var projects = readRecords_("Proyectos");

  if (proyectoId) {
    authError = requireProjectPermission_(context, proyectoId, "verResumen");
    if (authError) return authError;
    incomes = incomes.filter(function (item) { return String(item.proyectoId) === String(proyectoId); });
    expenses = expenses.filter(function (item) { return String(item.proyectoId) === String(proyectoId); });
    projects = projects.filter(function (item) { return String(item.id) === String(proyectoId); });
  } else {
    projects = filterByProjectAccess_(projects, context, "verResumen");
    incomes = filterByProjectAccess_(incomes, context, "verIngresos");
    expenses = filterByProjectAccess_(expenses, context, "verGastos");
  }

  var totalIncome = sumRecords_(incomes, "valorCobrado");
  var totalExpenses = sumRecords_(expenses, "valorPagado");
  var investment = sumRecords_(projects, "presupuestoActualizado") || totalExpenses;
  var netProfit = totalIncome - totalExpenses;

  return ok_({
    ingresosTotales: totalIncome,
    gastosTotales: totalExpenses,
    utilidadBruta: netProfit,
    utilidadNeta: netProfit,
    margen: calculateMargin_(netProfit, totalIncome),
    roi: calculateRoi_(netProfit, investment),
    capitalComprometido: investment,
    capitalRecuperado: totalIncome,
    saldoPorRecuperar: Math.max(investment - totalIncome, 0)
  }, "Indicadores calculados.");
}

function obtenerDashboard_(payload, context) {
  var authError = requireActiveSession_(context);
  if (authError) return authError;
  var projects = filterByProjectAccess_(readRecords_("Proyectos"), context, "verResumen");
  var projectIds = {};
  projects.forEach(function (project) { projectIds[String(project.id)] = true; });
  var incomes = filterByProjectAccess_(readRecords_("Ingresos"), context, "verIngresos");
  var expenses = filterByProjectAccess_(readRecords_("Gastos"), context, "verGastos");
  var partners = readRecords_("Socios").filter(function (partner) {
    return projectIds[String(partner.proyectoId)] && canAccessProject_(context, partner.proyectoId, "verSocios");
  });
  var indicators = calcularIndicadores_({}, context).data;
  return ok_({
    projects: projects,
    incomes: incomes,
    expenses: expenses,
    partners: partners,
    indicators: indicators,
    generatedAt: nowIso_()
  }, "Dashboard obtenido.");
}

function registrarDesembolso_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var missing = requireFields_(data, ["proyectoId"]);
  if (missing.length) return fail_("Faltan campos obligatorios.", missing);
  var authError = requireProjectPermission_(context, data.proyectoId, "modificarDatos");
  if (authError) return authError;
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId,
    socioId: data.socioId || "",
    montoComprometido: toNumber_(data.montoComprometido),
    montoDesembolsado: toNumber_(data.montoDesembolsado),
    saldoPendiente: calculateCapitalPending_(data.montoComprometido, data.montoDesembolsado),
    fecha: data.fecha || todayIso_(),
    estado: data.estado || "Pendiente",
    observaciones: data.observaciones || "",
    creadoEn: nowIso_()
  };
  appendRecord_("Desembolsos", record);
  audit_("Finanzas", "registrarDesembolso", record.proyectoId, "", record, context, "Desembolso registrado.");
  return ok_(record, "Desembolso registrado.");
}

function crearEscenario_(payload, context) {
  var data = sanitizeRecord_(payload || {});
  var missing = requireFields_(data, ["proyectoId", "nombre"]);
  if (missing.length) return fail_("Faltan campos obligatorios.", missing);
  var authError = requireProjectPermission_(context, data.proyectoId, "modificarDatos");
  if (authError) return authError;
  var ingresos = toNumber_(data.ingresos);
  var gastos = toNumber_(data.gastos);
  var utilidadTotal = ingresos - gastos;
  var record = {
    id: uuid_(),
    proyectoId: data.proyectoId,
    nombre: data.nombre,
    asistencia: toNumber_(data.asistencia),
    ingresos: ingresos,
    gastos: gastos,
    utilidadTotal: utilidadTotal,
    utilidadPersonal: toNumber_(data.utilidadPersonal || utilidadTotal),
    roi: calculateRoi_(utilidadTotal, gastos),
    margen: calculateMargin_(utilidadTotal, ingresos),
    puntoEquilibrio: toNumber_(data.puntoEquilibrio),
    creadoEn: nowIso_()
  };
  appendRecord_("Escenarios", record);
  audit_("Finanzas", "crearEscenario", record.proyectoId, "", record, context, record.nombre);
  return ok_(record, "Escenario creado.");
}

function calculateMargin_(netProfit, totalIncome) {
  totalIncome = toNumber_(totalIncome);
  return totalIncome === 0 ? 0 : (toNumber_(netProfit) / totalIncome) * 100;
}

function calculateRoi_(netProfit, investment) {
  investment = toNumber_(investment);
  return investment === 0 ? 0 : (toNumber_(netProfit) / investment) * 100;
}

function calculatePersonalInvestment_(totalBudget, personalPercent) {
  return toNumber_(totalBudget) * (toNumber_(personalPercent) / 100);
}

function calculateCapitalPending_(committed, disbursed) {
  return Math.max(toNumber_(committed) - toNumber_(disbursed), 0);
}

function calculateBreakEvenUnits_(fixedCosts, unitPrice, variableUnitCost) {
  var contribution = toNumber_(unitPrice) - toNumber_(variableUnitCost);
  if (contribution <= 0) return 0;
  return Math.ceil(toNumber_(fixedCosts) / contribution);
}

function sumRecords_(records, key) {
  return records.reduce(function (total, record) {
    return total + toNumber_(record[key]);
  }, 0);
}
