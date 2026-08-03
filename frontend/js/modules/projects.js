import { api } from "../api.js";
import { navigate } from "../router.js";
import { getState } from "../state.js";
import {
  PROJECT_RISK_LEVELS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  escapeHTML,
  formatCurrency,
  formatDate,
  getFormData,
  getProjectFinancials,
  normalizeText,
  sumBy,
  toast,
  validateProject,
} from "../utils.js";

const PROJECT_SUBTYPES_BY_TYPE = {
  evento: ["Produccion completa", "Concierto", "Festival", "Activacion de marca", "Evento privado", "Evento corporativo"],
  negocio: ["Operacion mensual", "Medio digital", "Comercio", "Servicio profesional", "Franquicia", "Unidad de negocio"],
  inversion: ["Capital semilla", "Participacion", "Prestamo", "Portafolio", "Renta fija", "Renta variable"],
  "compra de empresa": ["Due diligence", "Negociacion", "Adquisicion parcial", "Adquisicion total", "Traspaso"],
  "proyecto digital": ["SaaS", "Marketplace", "Aplicacion web", "Contenido digital", "Automatizacion"],
  inmueble: ["Terreno", "Casa", "Departamento", "Local comercial", "Remodelacion", "Renta"],
  activo: ["Vehiculo", "Equipo", "Maquinaria", "Marca", "Licencia", "Inventario"],
  oportunidad: ["Idea", "Prospecto", "Alianza", "Compra futura", "Expansion"],
  "otro personalizado": ["General", "Operacion especial", "Patrimonial", "Financiero"],
};

const CURRENCY_OPTIONS = ["USD"];
const BASE_PEOPLE_OPTIONS = ["Administrador general", "Propietario principal", "Todos", "Sociedad completa"];

export function renderProjects(container) {
  const state = getState();
  const projects = state.projects.filter((project) => project.estado !== "Archivado");

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Portafolio</p>
        <h2>Proyectos</h2>
        <p>Registra eventos, negocios, inversiones, compras, activos y oportunidades desde la idea.</p>
      </div>
      <div class="toolbar">
        <select id="project-filter-type" aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          ${PROJECT_TYPES.map((type) => `<option>${type}</option>`).join("")}
        </select>
        <button class="button" id="open-project-modal" type="button">Nuevo proyecto</button>
      </div>
    </section>

    <section class="project-grid" id="project-list">
      ${projects.map((project) => projectCard(project, state)).join("") || emptyProjects()}
    </section>
  `;

  container.querySelector("#open-project-modal").addEventListener("click", () => openProjectModal(state));
  container.querySelector("#project-filter-type").addEventListener("change", (event) => {
    const selected = event.target.value;
    const filtered = selected ? projects.filter((project) => project.tipo === selected) : projects;
    container.querySelector("#project-list").innerHTML =
      filtered.map((project) => projectCard(project, state)).join("") || emptyProjects();
    attachProjectCardEvents(container);
  });
  attachProjectCardEvents(container);
}

export function renderProjectDetail(container, projectId) {
  const state = getState();
  const project = state.projects.find((item) => item.id === projectId);

  if (!project) {
    container.innerHTML = `
      <section class="empty-state">
        <h2>Proyecto no encontrado</h2>
        <p>Puede haber sido archivado o no existe en el modo actual.</p>
        <a class="button" href="#/proyectos">Volver a proyectos</a>
      </section>
    `;
    return;
  }

  const financials = getProjectFinancials(project, state);
  const incomes = state.incomes.filter((item) => item.proyectoId === project.id);
  const expenses = state.expenses.filter((item) => item.proyectoId === project.id);
  const partners = state.partners.filter((item) => item.proyectoId === project.id);
  const partnerSummary = getPartnerSummary(partners, expenses);

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">${escapeHTML(project.tipo)} · ${escapeHTML(project.estado)}</p>
        <h2>${escapeHTML(project.nombre)}</h2>
        <p>${escapeHTML(project.descripcion || "Sin descripción todavía.")}</p>
      </div>
      <div class="toolbar">
        <a class="button button--ghost" href="#/proyectos">Volver</a>
        <button class="button button--danger" id="archive-project" type="button">Archivar</button>
      </div>
    </section>

    <section class="kpi-grid">
      ${detailKpi("Presupuesto inicial", project.presupuestoInicial)}
      ${detailKpi("Presupuesto actualizado", project.presupuestoActualizado)}
      ${detailKpi("Ingresos cobrados", financials.totalIncome)}
      ${detailKpi("Gastos pagados", financials.totalExpenses)}
      ${detailKpi("Resultado", financials.netProfit)}
      ${detailKpi("ROI", financials.roi, "percent")}
    </section>

    <section class="detail-grid">
      <article class="card">
        <h3>Datos generales</h3>
        <table>
          <tbody>
            ${row("Ciudad", project.ciudad)}
            ${row("Dirección o lugar", project.direccionLugar)}
            ${row("Fecha de inicio", formatDate(project.fechaInicio))}
            ${row("Fecha estimada de finalización", formatDate(project.fechaEstimadaFin))}
            ${row("Responsable", project.responsable)}
            ${row("Propietario", project.propietario)}
            ${row("Moneda", project.moneda)}
            ${row("Riesgo", project.nivelRiesgo)}
            ${row("Etiquetas", project.etiquetas)}
            ${row("Notas", project.notas)}
          </tbody>
        </table>
      </article>

      <article class="card">
        <h3>Línea de tiempo</h3>
        <div class="timeline">
          <div class="timeline-item">
            <strong>Creación</strong>
            <p>${formatDate(project.creadoEn)} · Proyecto registrado.</p>
          </div>
          <div class="timeline-item">
            <strong>Última actualización</strong>
            <p>${formatDate(project.actualizadoEn)} · Estado actual: ${escapeHTML(project.estado)}.</p>
          </div>
          <div class="timeline-item">
            <strong>Próxima fase</strong>
            <p>Agregar permisos, documentos, escenarios e informes versionados.</p>
          </div>
        </div>
      </article>
    </section>

    <section class="detail-grid">
      ${compactTable("Socios de este proyecto", partners, ["nombre", "tipoSocio", "participacionLegal", "participacionEconomica", "participacionUtilidades"])}
      ${compactTable("Aportes y gastos por socio", partnerSummary, ["socio", "aporteRealizado", "gastosCubiertos", "saldo"]) }
    </section>

    <section class="chart-grid">
      ${compactTable("Ingresos del proyecto", incomes, ["categoria", "concepto", "estado", "valorCobrado"])}
      ${compactTable("Gastos del proyecto", expenses, ["categoria", "concepto", "estado", "valorPagado"])}
    </section>
  `;

  container.querySelector("#archive-project").addEventListener("click", async () => {
    const confirmed = confirm(`¿Archivar el proyecto "${project.nombre}"?`);
    if (!confirmed) return;
    const result = await api.archiveProject(project.id);
    toast(result.message || "Proyecto archivado.");
    navigate("/proyectos");
  });
}

function attachProjectCardEvents(container) {
  container.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => navigate(`/proyectos/${button.dataset.openProject}`));
  });
}

function projectCard(project, state) {
  const financials = getProjectFinancials(project, state);
  const budget = project.presupuestoActualizado || project.presupuestoInicial || 1;
  const progress = Math.min((financials.totalExpenses / budget) * 100, 100);
  const riskClass = project.nivelRiesgo === "Alto" ? "risk-high" : project.nivelRiesgo === "Bajo" ? "risk-low" : "risk-medium";

  return `
    <article class="card project-card">
      <div class="project-card__header">
        <div class="project-card__title">
          <span class="tag">${escapeHTML(project.tipo)}</span>
          <h3>${escapeHTML(project.nombre)}</h3>
          <small>${escapeHTML(project.ciudad || "Sin ciudad")} · ${escapeHTML(project.estado)}</small>
        </div>
        <strong class="${riskClass}">${escapeHTML(project.nivelRiesgo || "Medio")}</strong>
      </div>
      <p>${escapeHTML(project.descripcion || "Sin descripción.")}</p>
      <div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <p class="metric-note">${formatCurrency(financials.totalExpenses)} gastados de ${formatCurrency(budget)}</p>
      </div>
      <div class="toolbar">
        <span class="status-pill">ROI ${financials.roi.toFixed(1)} %</span>
        <button class="button button--ghost" data-open-project="${project.id}" type="button">Detalle</button>
      </div>
    </article>
  `;
}

function emptyProjects() {
  return `
    <div class="empty-state">
      <h3>No hay proyectos activos</h3>
      <p>Crea el primer proyecto para iniciar el control patrimonial.</p>
    </div>
  `;
}

function openProjectModal(state = getState()) {
  const modalRoot = document.querySelector("#modal-root");
  const peopleOptions = buildPeopleOptions(state);
  const subtypeOptions = getProjectSubtypeOptions(PROJECT_TYPES[0]);
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <form class="modal" id="project-form" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <div class="modal__header">
          <div>
            <p class="eyebrow">Nuevo registro</p>
            <h2 id="project-modal-title">Crear proyecto</h2>
          </div>
          <button class="icon-button button--ghost" id="close-project-modal" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="modal__body">
          <div class="form-grid">
            ${input("nombre", "Nombre", "text", true)}
            ${select("tipo", "¿Qué se va a registrar?", PROJECT_TYPES, PROJECT_TYPES[0], "project-type")}
            ${select("subtipo", "Subtipo", subtypeOptions, subtypeOptions[0], "project-subtype")}
            ${select("estado", "Estado", PROJECT_STATUSES, "Idea")}
            ${input("ciudad", "Ciudad", "text")}
            ${input("direccionLugar", "Dirección o lugar", "text")}
            ${input("fechaInicio", "Fecha de inicio", "date")}
            ${input("fechaEstimadaFin", "Fecha estimada de finalización", "date")}
            ${input("presupuestoInicial", "Presupuesto inicial", "number")}
            ${input("presupuestoActualizado", "Presupuesto actualizado", "number")}
            ${select("responsable", "Responsable", peopleOptions, peopleOptions[0])}
            ${select("propietario", "Propietario", peopleOptions, peopleOptions[1] || peopleOptions[0])}
            ${select("moneda", "Moneda", CURRENCY_OPTIONS, "USD")}
            ${select("nivelRiesgo", "Nivel de riesgo", PROJECT_RISK_LEVELS, "Medio")}
            ${input("etiquetas", "Etiquetas", "text")}
            <label class="full">Descripción
              <textarea name="descripcion" placeholder="Objetivo, alcance y notas operativas"></textarea>
            </label>
            <label class="full">Notas
              <textarea name="notas" placeholder="Riesgos, acuerdos o recordatorios iniciales"></textarea>
            </label>
          </div>
        </div>
        <div class="modal__footer">
          <button class="button button--ghost" id="cancel-project-modal" type="button">Cancelar</button>
          <button class="button" type="submit">Crear proyecto</button>
        </div>
      </form>
    </div>
  `;

  const close = () => {
    modalRoot.innerHTML = "";
  };
  modalRoot.querySelector("#close-project-modal").addEventListener("click", close);
  modalRoot.querySelector("#cancel-project-modal").addEventListener("click", close);
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) close();
  });
  const typeSelect = modalRoot.querySelector("#project-type");
  const subtypeSelect = modalRoot.querySelector("#project-subtype");
  typeSelect.addEventListener("change", () => {
    const options = getProjectSubtypeOptions(typeSelect.value);
    subtypeSelect.innerHTML = options.map((option) => `<option>${escapeHTML(option)}</option>`).join("");
  });
  modalRoot.querySelector("#project-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData(event.currentTarget);
    if (!data.presupuestoActualizado) data.presupuestoActualizado = data.presupuestoInicial;
    const validation = validateProject(data);
    if (!validation.valid) {
      toast(validation.errors[0], "error");
      return;
    }
    const result = await api.createProject(data);
    if (!result.ok) {
      toast(result.message || "No fue posible crear el proyecto.", "error");
      return;
    }
    close();
    toast(result.message || "Proyecto creado.");
    navigate(`/proyectos/${result.data.id}`);
  });
}

function input(name, label, type = "text", required = false, value = "") {
  return `
    <label>${label}
      <input name="${name}" type="${type}" value="${escapeHTML(value)}" ${required ? "required" : ""} />
    </label>
  `;
}

function select(name, label, options, selected = options[0], id = "") {
  return `
    <label>${label}
      <select name="${name}" ${id ? `id="${id}"` : ""}>
        ${options.map((option) => `<option ${option === selected ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}
      </select>
    </label>
  `;
}

function getProjectSubtypeOptions(type) {
  return PROJECT_SUBTYPES_BY_TYPE[normalizeText(type)] || PROJECT_SUBTYPES_BY_TYPE["otro personalizado"];
}

function buildPeopleOptions(state) {
  const partnerNames = (state.partners || [])
    .map((partner) => partner.nombre)
    .filter(Boolean);
  return [...new Set([...BASE_PEOPLE_OPTIONS, ...partnerNames])];
}

function getPartnerSummary(partners, expenses) {
  return partners.map((partner) => {
    const coveredExpenses = expenses.filter((expense) =>
      expense.socioId === partner.id ||
      normalizeText(expense.socioNombre) === normalizeText(partner.nombre),
    );
    const gastosCubiertos = sumBy(coveredExpenses, (expense) => expense.valorPagado || expense.valorReal || expense.valorNegociado);
    return {
      socio: partner.nombre,
      aporteRealizado: partner.aporteRealizado,
      gastosCubiertos,
      saldo: Number(partner.aporteRealizado || 0) - gastosCubiertos,
    };
  });
}

function detailKpi(label, value, type = "money") {
  return `
    <article class="card kpi-card">
      <span>${label}</span>
      <strong>${type === "percent" ? `${Number(value).toFixed(1)} %` : formatCurrency(value)}</strong>
      <p class="metric-note">Dato calculado automáticamente</p>
    </article>
  `;
}

function row(label, value) {
  return `<tr><th>${label}</th><td>${escapeHTML(value || "Pendiente")}</td></tr>`;
}

function compactTable(title, rows, keys) {
  return `
    <article class="table-card">
      <h3>${title}</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${keys.map((key) => `<th>${escapeHTML(labelForKey(key))}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((item) => `
              <tr>
                ${keys.map((key) => `<td>${formatCompactValue(key, item[key])}</td>`).join("")}
              </tr>
            `).join("") || `<tr><td colspan="${keys.length}">Sin registros todavía.</td></tr>`}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function formatCompactValue(key, value) {
  if (/valor|aporte|gasto|saldo/i.test(key)) return formatCurrency(value);
  if (/participacion/i.test(key)) return `${Number(value || 0).toFixed(1)} %`;
  return escapeHTML(value || "Pendiente");
}

function labelForKey(key) {
  const labels = {
    nombre: "Nombre",
    tipoSocio: "Tipo",
    participacionLegal: "Legal",
    participacionEconomica: "Economica",
    participacionUtilidades: "Utilidades",
    socio: "Socio",
    aporteRealizado: "Aporte realizado",
    gastosCubiertos: "Gastos cubiertos",
    saldo: "Saldo",
    categoria: "Categoria",
    concepto: "Concepto",
    estado: "Estado",
    valorCobrado: "Cobrado",
    valorPagado: "Pagado",
  };
  return labels[key] || key;
}

