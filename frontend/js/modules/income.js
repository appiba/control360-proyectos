import { api } from "../api.js";
import { getState } from "../state.js";
import { escapeHTML, formatCurrency, getFormData, toast } from "../utils.js";

const INCOME_CATALOG = [
  {
    categoria: "Boleteria",
    subcategorias: [
      { nombre: "Entradas", conceptos: ["Preventa", "General", "VIP", "Mesa", "Puerta"] },
      { nombre: "Reservas", conceptos: ["Reserva inicial", "Abono", "Saldo de reserva"] },
    ],
  },
  {
    categoria: "Auspicios",
    subcategorias: [
      { nombre: "Marca", conceptos: ["Auspicio principal", "Auspicio secundario", "Canje comercial"] },
      { nombre: "Activacion", conceptos: ["Stand", "Mencion en escenario", "Presencia digital"] },
    ],
  },
  {
    categoria: "Ventas",
    subcategorias: [
      { nombre: "Productos", conceptos: ["Venta directa", "Merchandising", "Inventario"] },
      { nombre: "Servicios", conceptos: ["Pauta mensual", "Comision", "Servicio operativo"] },
    ],
  },
  {
    categoria: "Aportes",
    subcategorias: [
      { nombre: "Socios", conceptos: ["Aporte de capital", "Aporte operativo", "Reembolso de socio"] },
      { nombre: "Propietario", conceptos: ["Aporte propietario", "Capital inicial", "Reposicion de caja"] },
    ],
  },
  {
    categoria: "Otros ingresos",
    subcategorias: [
      { nombre: "Financiero", conceptos: ["Interes", "Devolucion", "Ajuste positivo"] },
      { nombre: "Operativo", conceptos: ["Recuperacion", "Saldo a favor", "Ingreso extraordinario"] },
    ],
  },
];

const INCOME_STATUSES = [
  "Estimado",
  "Negociado",
  "Confirmado",
  "Facturado",
  "Cobrado parcialmente",
  "Cobrado",
  "Pendiente",
  "Vencido",
  "Cancelado",
];

const PAYMENT_METHODS = [
  "Transferencia",
  "Efectivo",
  "Tarjeta",
  "Cheque",
  "Deposito",
  "Pasarela de pago",
  "Canje",
  "Pendiente por definir",
];

const DEFAULT_PAYERS = [
  "Cliente externo",
  "Ticketera",
  "Marca auspiciante",
  "Administrador general",
  "Propietario principal",
  "Socio del proyecto",
];

export function renderIncome(container) {
  const state = getState();
  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Ingresos</p>
        <h2>Ingresos por proyecto</h2>
        <p>Diferencia estimado, confirmado, facturado, cobrado y pendiente. Ingreso no es utilidad.</p>
      </div>
      <div class="toolbar">
        <select id="income-filter-project" aria-label="Filtrar ingresos por proyecto">
          <option value="">Todos los proyectos</option>
          ${state.projects.map((project) => `<option value="${project.id}">${escapeHTML(project.nombre)}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="detail-grid">
      <form class="form-card" id="income-form">
        <h3>Registrar ingreso</h3>
        <div class="form-grid">
          ${projectSelect(state.projects, "income-project")}
          <label>Categoria
            <select name="categoria" id="income-category">${INCOME_CATALOG.map((item) => `<option>${escapeHTML(item.categoria)}</option>`).join("")}</select>
          </label>
          <label>Subcategoria
            <select name="subcategoria" id="income-subcategory"></select>
          </label>
          <label>Concepto
            <select name="concepto" id="income-concept"></select>
          </label>
          <label>Fecha<input name="fecha" type="date" /></label>
          <label>Valor estimado<input name="valorEstimado" type="number" min="0" step="0.01" /></label>
          <label>Valor confirmado<input name="valorConfirmado" type="number" min="0" step="0.01" /></label>
          <label>Valor facturado<input name="valorFacturado" type="number" min="0" step="0.01" /></label>
          <label>Valor cobrado<input name="valorCobrado" type="number" min="0" step="0.01" /></label>
          <label>Saldo pendiente<input name="saldoPendiente" type="number" min="0" step="0.01" /></label>
          <label>Pagador
            <select name="pagador" id="income-payer"></select>
          </label>
          <label>Forma de pago
            <select name="formaPago">${PAYMENT_METHODS.map((method) => `<option>${escapeHTML(method)}</option>`).join("")}</select>
          </label>
          <label>Estado
            <select name="estado">${INCOME_STATUSES.map((status) => `<option>${escapeHTML(status)}</option>`).join("")}</select>
          </label>
          <label class="full">Observaciones<textarea name="observaciones"></textarea></label>
        </div>
        <div class="hero-actions">
          <button class="button" type="submit">Guardar ingreso</button>
        </div>
      </form>

      <article class="table-card">
        <h3>Ultimos ingresos</h3>
        <div id="income-table-root">${incomeTable(state.incomes, state.projects)}</div>
      </article>
    </section>
  `;

  setupIncomeCatalogSelects(container);
  setupIncomePayerSelect(container, state);

  container.querySelector("#income-filter-project").addEventListener("change", (event) => {
    const projectId = event.target.value;
    const rows = projectId ? state.incomes.filter((income) => income.proyectoId === projectId) : state.incomes;
    container.querySelector("#income-table-root").innerHTML = incomeTable(rows, state.projects);
  });

  container.querySelector("#income-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData(event.currentTarget);
    if (!data.proyectoId) {
      toast("Selecciona un proyecto.", "error");
      return;
    }
    const result = await api.createIncome(data);
    if (!result.ok) {
      toast(result.message || "No fue posible guardar el ingreso.", "error");
      return;
    }
    toast(result.message || "Ingreso registrado.");
    renderIncome(container);
  });
}

function setupIncomeCatalogSelects(container) {
  const categorySelect = container.querySelector("#income-category");
  const subcategorySelect = container.querySelector("#income-subcategory");
  const conceptSelect = container.querySelector("#income-concept");

  const renderConcepts = () => {
    const category = INCOME_CATALOG.find((item) => item.categoria === categorySelect.value);
    const subcategory = category.subcategorias.find((item) => item.nombre === subcategorySelect.value);
    conceptSelect.innerHTML = subcategory.conceptos
      .map((concept) => `<option>${escapeHTML(concept)}</option>`)
      .join("");
  };

  const renderSubcategories = () => {
    const category = INCOME_CATALOG.find((item) => item.categoria === categorySelect.value);
    subcategorySelect.innerHTML = category.subcategorias
      .map((subcategory) => `<option>${escapeHTML(subcategory.nombre)}</option>`)
      .join("");
    renderConcepts();
  };

  categorySelect.addEventListener("change", renderSubcategories);
  subcategorySelect.addEventListener("change", renderConcepts);
  renderSubcategories();
}

function setupIncomePayerSelect(container, state) {
  const projectSelectElement = container.querySelector("#income-project");
  const payerSelect = container.querySelector("#income-payer");

  const renderPayers = () => {
    const projectPartners = (state.partners || [])
      .filter((partner) => partner.proyectoId === projectSelectElement.value)
      .map((partner) => partner.nombre);
    const options = [...new Set([...DEFAULT_PAYERS, ...projectPartners])];
    payerSelect.innerHTML = options.map((option) => `<option>${escapeHTML(option)}</option>`).join("");
  };

  projectSelectElement.addEventListener("change", renderPayers);
  renderPayers();
}

function projectSelect(projects, id) {
  return `
    <label>Proyecto
      <select name="proyectoId" id="${id}" required>
        <option value="">Seleccionar</option>
        ${projects.map((project) => `<option value="${project.id}">${escapeHTML(project.nombre)}</option>`).join("")}
      </select>
    </label>
  `;
}

function incomeTable(incomes, projects) {
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.nombre]));
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Categoria</th>
            <th>Concepto</th>
            <th>Estado</th>
            <th>Cobrado</th>
            <th>Pendiente</th>
          </tr>
        </thead>
        <tbody>
          ${incomes.map((income) => `
            <tr>
              <td>${escapeHTML(projectNames[income.proyectoId] || "Sin proyecto")}</td>
              <td>${escapeHTML(income.categoria)}</td>
              <td>${escapeHTML(income.concepto)}</td>
              <td>${escapeHTML(income.estado)}</td>
              <td>${formatCurrency(income.valorCobrado)}</td>
              <td>${formatCurrency(income.saldoPendiente)}</td>
            </tr>
          `).join("") || `<tr><td colspan="6">Sin ingresos registrados.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}
