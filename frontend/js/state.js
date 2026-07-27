import { CONFIG } from "./config.js";
import { createUUID, nowISO, todayISO, toNumber } from "./utils.js";

function createDemoState() {
  const projectA = createUUID();
  const projectB = createUUID();
  const projectC = createUUID();

  return {
    projects: [
      {
        id: projectA,
        nombre: "Festival Aurora 2026",
        tipo: "Evento",
        subtipo: "Producción completa",
        descripcion: "Evento musical con boletería, auspicios y operación completa.",
        ciudad: "Quito",
        direccionLugar: "Centro de Convenciones",
        fechaInicio: "2026-09-12",
        fechaEstimadaFin: "2026-09-14",
        estado: "Planificación",
        presupuestoInicial: 85000,
        presupuestoActualizado: 92000,
        responsable: "Superadmin",
        propietario: "Propietario principal",
        moneda: "USD",
        nivelRiesgo: "Medio",
        etiquetas: "evento,música,auspicios",
        notas: "Datos demo locales. No son datos productivos.",
        creadoEn: nowISO(),
        actualizadoEn: nowISO(),
      },
      {
        id: projectB,
        nombre: "Radio Urbana Digital",
        tipo: "Negocio",
        subtipo: "Medio digital",
        descripcion: "Negocio de pauta, contenido y operación comercial mensual.",
        ciudad: "Guayaquil",
        direccionLugar: "Oficina central",
        fechaInicio: "2026-06-01",
        fechaEstimadaFin: "2027-06-01",
        estado: "Activo",
        presupuestoInicial: 36000,
        presupuestoActualizado: 42000,
        responsable: "Superadmin",
        propietario: "Propietario principal",
        moneda: "USD",
        nivelRiesgo: "Bajo",
        etiquetas: "negocio,radio,digital",
        notas: "Incluye gastos fijos y pauta estimada.",
        creadoEn: nowISO(),
        actualizadoEn: nowISO(),
      },
      {
        id: projectC,
        nombre: "Compra Hostal Baños",
        tipo: "Compra de empresa",
        subtipo: "Due diligence",
        descripcion: "Evaluación de adquisición con negociación y gastos de investigación.",
        ciudad: "Baños",
        direccionLugar: "Zona turística",
        fechaInicio: "2026-07-01",
        fechaEstimadaFin: "2026-11-30",
        estado: "Investigación",
        presupuestoInicial: 180000,
        presupuestoActualizado: 175000,
        responsable: "Superadmin",
        propietario: "Propietario principal",
        moneda: "USD",
        nivelRiesgo: "Alto",
        etiquetas: "compra,hostal,investigación",
        notas: "Incluye viáticos y revisión legal.",
        creadoEn: nowISO(),
        actualizadoEn: nowISO(),
      },
    ],
    incomes: [
      {
        id: createUUID(),
        proyectoId: projectA,
        categoria: "Boletería",
        subcategoria: "General",
        concepto: "Entradas preventa",
        fecha: todayISO(),
        valorEstimado: 62000,
        valorConfirmado: 48000,
        valorFacturado: 0,
        valorCobrado: 26500,
        saldoPendiente: 21500,
        pagador: "Ticketera",
        formaPago: "Transferencia",
        estado: "Cobrado parcialmente",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
      {
        id: createUUID(),
        proyectoId: projectB,
        categoria: "Ventas",
        subcategoria: "Pauta",
        concepto: "Pauta mensual",
        fecha: todayISO(),
        valorEstimado: 9800,
        valorConfirmado: 7600,
        valorFacturado: 7600,
        valorCobrado: 5200,
        saldoPendiente: 2400,
        pagador: "Clientes comerciales",
        formaPago: "Transferencia",
        estado: "Facturado",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
      {
        id: createUUID(),
        proyectoId: projectA,
        categoria: "Auspicios",
        subcategoria: "Marca principal",
        concepto: "Auspicio confirmado",
        fecha: todayISO(),
        valorEstimado: 18000,
        valorConfirmado: 15000,
        valorFacturado: 15000,
        valorCobrado: 15000,
        saldoPendiente: 0,
        pagador: "Marca demo",
        formaPago: "Transferencia",
        estado: "Cobrado",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
    ],
    expenses: [
      {
        id: createUUID(),
        proyectoId: projectA,
        etapa: "Planificación",
        categoria: "Producción",
        subcategoria: "Sonido e iluminación",
        concepto: "Sonido",
        cantidad: 1,
        unidad: "servicio",
        valorPresupuestado: 18000,
        valorCotizado: 17500,
        valorNegociado: 15800,
        valorReal: 15800,
        valorPagado: 9000,
        saldoPendiente: 6800,
        proveedor: "Proveedor demo",
        fecha: todayISO(),
        formaPago: "Transferencia",
        estado: "Pagado parcialmente",
        quienCubre: "Sociedad completa",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
      {
        id: createUUID(),
        proyectoId: projectB,
        etapa: "Operación",
        categoria: "Administración",
        subcategoria: "Software",
        concepto: "Software",
        cantidad: 1,
        unidad: "mes",
        valorPresupuestado: 550,
        valorCotizado: 520,
        valorNegociado: 480,
        valorReal: 480,
        valorPagado: 480,
        saldoPendiente: 0,
        proveedor: "SaaS demo",
        fecha: todayISO(),
        formaPago: "Tarjeta",
        estado: "Pagado",
        quienCubre: "Propietario personalmente",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
      {
        id: createUUID(),
        proyectoId: projectC,
        etapa: "Investigación",
        categoria: "Logística y viáticos",
        subcategoria: "Hospedaje",
        concepto: "Hotel",
        cantidad: 3,
        unidad: "noche",
        valorPresupuestado: 420,
        valorCotizado: 390,
        valorNegociado: 360,
        valorReal: 360,
        valorPagado: 360,
        saldoPendiente: 0,
        proveedor: "Hostería demo",
        fecha: todayISO(),
        formaPago: "Efectivo",
        estado: "Pagado",
        quienCubre: "Recuperable",
        observaciones: "Demo local",
        creadoEn: nowISO(),
      },
    ],
    partners: [
      {
        id: createUUID(),
        proyectoId: projectA,
        nombre: "Propietario principal",
        correo: "superadmin@example.com",
        tipoSocio: "Propietario",
        participacionLegal: 60,
        participacionEconomica: 60,
        participacionUtilidades: 60,
        aporteComprometido: 55200,
        aporteRealizado: 28000,
        utilidadCalculada: 0,
        utilidadPagada: 0,
        estado: "Activo",
      },
      {
        id: createUUID(),
        proyectoId: projectA,
        nombre: "Socio operador demo",
        correo: "operador@example.com",
        tipoSocio: "Operador",
        participacionLegal: 40,
        participacionEconomica: 40,
        participacionUtilidades: 40,
        aporteComprometido: 36800,
        aporteRealizado: 16000,
        utilidadCalculada: 0,
        utilidadPagada: 0,
        estado: "Activo",
      },
    ],
    providers: [
      {
        id: createUUID(),
        nombre: "Proveedor demo sonido",
        empresa: "AudioPro",
        categoria: "Producción",
        ciudad: "Quito",
        calificacion: 4.7,
        montoAcumulado: 15800,
        descuentoPromedio: 9.7,
        estado: "Activo",
      },
    ],
    history: [
      {
        id: createUUID(),
        modulo: "Sistema",
        accion: "Modo demo inicializado",
        proyectoId: "",
        usuario: "Superadmin",
        fecha: todayISO(),
        observacion: "Datos cargados en el navegador, no en Google Sheets.",
      },
    ],
  };
}

function canUseLocalStorage() {
  try {
    const testKey = "control360:test";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadState() {
  if (!canUseLocalStorage()) return createDemoState();
  const stored = localStorage.getItem(CONFIG.storageKey);
  if (!stored) {
    const demo = createDemoState();
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(demo));
    return demo;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return createDemoState();
  }
}

let state = loadState();
const listeners = new Set();

function persist() {
  if (canUseLocalStorage()) {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  }
}

function notify() {
  persist();
  listeners.forEach((listener) => listener(getState()));
}

export function getState() {
  return typeof structuredClone === "function" ? structuredClone(state) : JSON.parse(JSON.stringify(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(nextState) {
  state = { ...state, ...nextState };
  notify();
}

export function resetDemoState() {
  state = createDemoState();
  notify();
}

export function addHistory(entry) {
  state.history.unshift({
    id: createUUID(),
    usuario: "Superadmin",
    fecha: todayISO(),
    ...entry,
  });
}

export function addProject(project) {
  const record = {
    id: createUUID(),
    moneda: CONFIG.defaultCurrency,
    estado: "Idea",
    nivelRiesgo: "Medio",
    creadoEn: nowISO(),
    actualizadoEn: nowISO(),
    ...project,
    presupuestoInicial: toNumber(project.presupuestoInicial),
    presupuestoActualizado: toNumber(project.presupuestoActualizado || project.presupuestoInicial),
  };
  state.projects.unshift(record);
  addHistory({
    modulo: "Proyectos",
    accion: "Crear proyecto",
    proyectoId: record.id,
    observacion: record.nombre,
  });
  notify();
  return record;
}

export function updateProject(id, changes) {
  let updated = null;
  state.projects = state.projects.map((project) => {
    if (project.id !== id) return project;
    updated = {
      ...project,
      ...changes,
      presupuestoInicial: toNumber(changes.presupuestoInicial ?? project.presupuestoInicial),
      presupuestoActualizado: toNumber(changes.presupuestoActualizado ?? project.presupuestoActualizado),
      actualizadoEn: nowISO(),
    };
    return updated;
  });
  if (updated) {
    addHistory({
      modulo: "Proyectos",
      accion: "Actualizar proyecto",
      proyectoId: id,
      observacion: updated.nombre,
    });
    notify();
  }
  return updated;
}

export function archiveProject(id) {
  return updateProject(id, { estado: "Archivado" });
}

export function addIncome(income) {
  const record = {
    id: createUUID(),
    creadoEn: nowISO(),
    fecha: todayISO(),
    valorEstimado: 0,
    valorConfirmado: 0,
    valorFacturado: 0,
    valorCobrado: 0,
    saldoPendiente: 0,
    estado: "Estimado",
    ...income,
  };
  ["valorEstimado", "valorConfirmado", "valorFacturado", "valorCobrado", "saldoPendiente"].forEach((key) => {
    record[key] = toNumber(record[key]);
  });
  state.incomes.unshift(record);
  addHistory({
    modulo: "Ingresos",
    accion: "Registrar ingreso",
    proyectoId: record.proyectoId,
    observacion: record.concepto,
  });
  notify();
  return record;
}

export function addExpense(expense) {
  const record = {
    id: createUUID(),
    creadoEn: nowISO(),
    fecha: todayISO(),
    cantidad: 1,
    valorPresupuestado: 0,
    valorCotizado: 0,
    valorNegociado: 0,
    valorReal: 0,
    valorPagado: 0,
    saldoPendiente: 0,
    estado: "Estimado",
    ...expense,
  };
  [
    "cantidad",
    "valorPresupuestado",
    "valorCotizado",
    "valorNegociado",
    "valorReal",
    "valorPagado",
    "saldoPendiente",
  ].forEach((key) => {
    record[key] = toNumber(record[key]);
  });
  state.expenses.unshift(record);
  addHistory({
    modulo: "Gastos",
    accion: "Registrar gasto",
    proyectoId: record.proyectoId,
    observacion: record.concepto,
  });
  notify();
  return record;
}

export function addPartner(partner) {
  const record = {
    id: createUUID(),
    estado: "Activo",
    participacionLegal: 0,
    participacionEconomica: 0,
    participacionUtilidades: 0,
    aporteComprometido: 0,
    aporteRealizado: 0,
    utilidadCalculada: 0,
    utilidadPagada: 0,
    ...partner,
  };
  state.partners.unshift(record);
  addHistory({
    modulo: "Socios",
    accion: "Agregar socio",
    proyectoId: record.proyectoId,
    observacion: record.nombre,
  });
  notify();
  return record;
}
