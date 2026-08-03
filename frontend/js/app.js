import { api, isBackendConfigured } from "./api.js?v=phase2-login-clear-v3-20260803";
import {
  clearSession,
  ensureAuthenticated,
  getSession,
  renderLoginScreen,
  updateSessionBadge,
} from "./auth.js?v=phase2-login-clear-v3-20260803";
import { exportCurrentView } from "./reports.js";
import { getCurrentPath, refreshRoute, registerRoute, startRouter } from "./router.js";
import { getState, setState, subscribe } from "./state.js";
import { toast } from "./utils.js";
import { renderDashboard } from "./modules/dashboard.js?v=phase2-login-clear-v3-20260803";
import { renderProjects, renderProjectDetail } from "./modules/projects.js";
import { renderEvents } from "./modules/events.js";
import { renderBusinesses } from "./modules/businesses.js";
import { renderInvestments } from "./modules/investments.js";
import { renderIncome } from "./modules/income.js";
import { renderExpenses } from "./modules/expenses.js";
import { renderPartners } from "./modules/partners.js";
import { renderProviders } from "./modules/providers.js";
import { renderPurchases } from "./modules/purchases.js";
import { renderUsers } from "./modules/users.js";
import { renderDocuments } from "./modules/documents.js";
import { renderHistory } from "./modules/history.js";
import { renderSettings } from "./modules/settings.js";

const viewRoot = document.querySelector("#view-root");
let chromeReady = false;
let routesReady = false;
let routerReady = false;
let subscriptionReady = false;

function mount(renderer) {
  renderer(viewRoot);
  viewRoot.focus({ preventScroll: true });
}

function registerRoutes() {
  if (routesReady) return;
  registerRoute("/dashboard", () => mount(renderDashboard), "Dashboard");
  registerRoute("/proyectos", () => mount(renderProjects), "Proyectos");
  registerRoute("/proyectos/:id", (params) => mount((container) => renderProjectDetail(container, params.id)), "Detalle de proyecto");
  registerRoute("/eventos", () => mount(renderEvents), "Eventos");
  registerRoute("/negocios", () => mount(renderBusinesses), "Negocios");
  registerRoute("/inversiones", () => mount(renderInvestments), "Inversiones");
  registerRoute("/activos", () => mount((container) => renderInvestments(container, "Activo")), "Activos");
  registerRoute("/patrimonio", () => mount((container) => renderInvestments(container, "Patrimonio")), "Patrimonio");
  registerRoute("/ingresos", () => mount(renderIncome), "Ingresos");
  registerRoute("/gastos", () => mount(renderExpenses), "Gastos");
  registerRoute("/compras", () => mount(renderPurchases), "Compras");
  registerRoute("/proveedores", () => mount(renderProviders), "Proveedores");
  registerRoute("/socios", () => mount(renderPartners), "Socios");
  registerRoute("/usuarios", () => mount(renderUsers), "Usuarios");
  registerRoute("/informes", () => mount((container) => renderDocuments(container, "Informes")), "Informes");
  registerRoute("/documentos", () => mount(renderDocuments), "Documentos");
  registerRoute("/calendario", () => mount((container) => renderDocuments(container, "Calendario")), "Calendario");
  registerRoute("/alertas", () => mount((container) => renderDocuments(container, "Alertas")), "Alertas");
  registerRoute("/historial", () => mount(renderHistory), "Historial");
  registerRoute("/configuracion", () => mount(renderSettings), "Configuración");
  routesReady = true;
}

function setupChrome() {
  if (chromeReady) {
    updateSessionBadge();
    return;
  }
  getSession();

  const shell = document.querySelector(".app-shell");
  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const configWarning = document.querySelector("#config-warning");
  const exportButton = document.querySelector("#export-current-view");
  const logoutButton = document.querySelector("#logout-button");

  configWarning.hidden = isBackendConfigured();
  updateSessionBadge();

  sidebarToggle.addEventListener("click", () => {
    const next = shell.dataset.sidebarState === "open" ? "closed" : "open";
    shell.dataset.sidebarState = next;
    sidebarToggle.setAttribute("aria-label", next === "open" ? "Cerrar menú" : "Abrir menú");
  });

  document.querySelector("#main-nav").addEventListener("click", (event) => {
    if (event.target.matches(".nav-link")) {
      shell.dataset.sidebarState = "closed";
    }
  });

  exportButton.addEventListener("click", () => {
    const title = document.querySelector("#page-title")?.textContent || "Dashboard";
    exportCurrentView(title, getState());
    toast("Exportación preliminar generada.");
  });

  logoutButton.addEventListener("click", async () => {
    const session = getSession();
    if (session?.token && session.mode !== "owner-local") await api.logout(session.token);
    clearSession();
    toast("Sesión cerrada.");
    renderLoginScreen(api, startAuthenticatedApp);
  });

  chromeReady = true;
}

function startAuthenticatedApp() {
  setupChrome();
  registerRoutes();
  syncBackendState();
  if (!routerReady) {
    startRouter();
    routerReady = true;
  } else {
    refreshRoute();
  }

  if (subscriptionReady) {
    refreshRoute();
    return;
  }

  let lastPath = getCurrentPath();
  subscribe(() => {
    const nextPath = getCurrentPath();
    if (nextPath === lastPath) {
      refreshRoute();
    }
    lastPath = nextPath;
  });
  subscriptionReady = true;
}

async function syncBackendState() {
  if (!isBackendConfigured()) return;
  const result = await api.getDashboard();
  if (!result.ok) {
    toast(result.message || "No fue posible cargar datos reales de Apps Script.", "error");
    return;
  }
  setState({
    projects: result.data?.projects || [],
    incomes: result.data?.incomes || [],
    expenses: result.data?.expenses || [],
    partners: result.data?.partners || [],
  });
  if (routerReady) refreshRoute();
}

document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("auth-locked");
  const authenticated = await ensureAuthenticated(api);
  if (authenticated) {
    document.body.classList.remove("auth-locked");
    startAuthenticatedApp();
    return;
  }
  renderLoginScreen(api, startAuthenticatedApp);
});
