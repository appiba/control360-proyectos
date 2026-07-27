import { CONFIG, isBackendConfigured } from "./config.js";
import {
  addExpense,
  addIncome,
  addProject,
  archiveProject,
  getState,
  resetDemoState,
  updateProject,
} from "./state.js";
import { normalizeText } from "./utils.js";
import { EXPENSE_CATALOG } from "./modules/expenses.js";

function response(ok, data = {}, message = "", errors = []) {
  return { ok, data, message, errors };
}

async function request(action, payload = {}) {
  if (!isBackendConfigured()) {
    return handleLocalAction(action, payload);
  }

  try {
    const result = await fetch(CONFIG.appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!result.ok) {
      return response(false, {}, "No fue posible comunicarse con Apps Script.", [
        `HTTP ${result.status}`,
      ]);
    }

    return await result.json();
  } catch (error) {
    return response(false, {}, "Error de conexión con Apps Script.", [error.message]);
  }
}

function handleLocalAction(action, payload) {
  const state = getState();

  switch (action) {
    case "healthCheck":
      return response(true, {
        backendConfigured: false,
        mode: "demo-local",
        timezone: CONFIG.timezone,
      }, "Modo demo local activo.");

    case "setupDatabase":
      return response(true, {}, "setupDatabase se ejecuta en Apps Script, no en modo demo.");

    case "login":
      return response(false, {}, "Configura Apps Script para usar el acceso seguro.", [
        "BACKEND_REQUIRED",
      ]);

    case "validarSesion":
      return response(false, {}, "No hay sesión de backend en modo demo.", [
        "BACKEND_REQUIRED",
      ]);

    case "cerrarSesion":
      return response(true, {}, "Sesión local cerrada.");

    case "listarProyectos":
      return response(true, state.projects);

    case "obtenerProyecto": {
      const project = state.projects.find((item) => item.id === payload.id);
      return project
        ? response(true, project)
        : response(false, {}, "Proyecto no encontrado.", ["PROJECT_NOT_FOUND"]);
    }

    case "crearProyecto": {
      const exists = state.projects.some(
        (project) =>
          normalizeText(project.nombre) === normalizeText(payload.nombre) &&
          project.estado !== "Archivado",
      );
      if (exists) {
        return response(false, {}, "Ya existe un proyecto activo con ese nombre.", [
          "DUPLICATE_PROJECT",
        ]);
      }
      return response(true, addProject(payload), "Proyecto creado en modo demo.");
    }

    case "actualizarProyecto":
      return response(true, updateProject(payload.id, payload), "Proyecto actualizado.");

    case "archivarProyecto":
      return response(true, archiveProject(payload.id), "Proyecto archivado.");

    case "listarIngresos":
      return response(true, payload.proyectoId
        ? state.incomes.filter((item) => item.proyectoId === payload.proyectoId)
        : state.incomes);

    case "registrarIngreso":
      return response(true, addIncome(payload), "Ingreso registrado en modo demo.");

    case "listarGastos":
      return response(true, payload.proyectoId
        ? state.expenses.filter((item) => item.proyectoId === payload.proyectoId)
        : state.expenses);

    case "registrarGasto":
      return response(true, addExpense(payload), "Gasto registrado en modo demo.");

    case "obtenerCatalogoGastos":
      return response(true, EXPENSE_CATALOG);

    case "obtenerDashboard":
      return response(true, state);

    case "obtenerHistorial":
      return response(true, state.history);

    case "resetDemo":
      resetDemoState();
      return response(true, getState(), "Modo demo reiniciado.");

    default:
      return response(true, {}, `Acción ${action} preparada para Apps Script.`);
  }
}

export const api = {
  request,
  healthCheck: () => request("healthCheck"),
  setupDatabase: () => request("setupDatabase"),
  login: (credentials) => request("login", credentials),
  validateSession: (token) => request("validarSesion", { token }),
  logout: (token) => request("cerrarSesion", { token }),
  listProjects: () => request("listarProyectos"),
  getProject: (id) => request("obtenerProyecto", { id }),
  createProject: (project) => request("crearProyecto", project),
  updateProject: (project) => request("actualizarProyecto", project),
  archiveProject: (id) => request("archivarProyecto", { id }),
  listIncomes: (filters = {}) => request("listarIngresos", filters),
  createIncome: (income) => request("registrarIngreso", income),
  listExpenses: (filters = {}) => request("listarGastos", filters),
  createExpense: (expense) => request("registrarGasto", expense),
  getExpenseCatalog: () => request("obtenerCatalogoGastos"),
  getDashboard: () => request("obtenerDashboard"),
  getHistory: () => request("obtenerHistorial"),
  resetDemo: () => request("resetDemo"),
};

export { isBackendConfigured };

