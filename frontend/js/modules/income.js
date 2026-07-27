import { api } from "../api.js";
import { getState } from "../state.js";
import { escapeHTML, formatCurrency, getFormData, toast } from "../utils.js";

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

export function renderIncome(container) {
  const state = getState();
  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Ingresos</p>
        <h2>Ingresos por proyecto</h2>
        <p>Diferencia estimado, confirmado, facturado, cobrado y pendiente. Ingreso no es utilidad.</p>
      </div>
    </section>

    <section class="detail-grid">
      <form class="form-card" id="income-form">
        <h3>Registrar ingreso</h3>
        <div class="form-grid">
          ${projectSelect(state.projects)}
          <label>Categoría<input name="categoria" required placeholder="Boletería, auspicios, ventas..." /></label>
          <label>Subcategoría<input name="subcategoria" placeholder="General, VIP, pauta..." /></label>
          <label>Concepto<input name="concepto" required placeholder="Entradas preventa" /></label>
          <label>Fecha<input name="fecha" type="date" /></label>
          <label>Valor estimado<input name="valorEstimado" type="number" min="0" step="0.01" /></label>
          <label>Valor confirmado<input name="valorConfirmado" type="number" min="0" step="0.01" /></label>
          <label>Valor facturado<input name="valorFacturado" type="number" min="0" step="0.01" /></label>
          <label>Valor cobrado<input name="valorCobrado" type="number" min="0" step="0.01" /></label>
          <label>Saldo pendiente<input name="saldoPendiente" type="number" min="0" step="0.01" /></label>
          <label>Pagador<input name="pagador" /></label>
          <label>Forma de pago<input name="formaPago" /></label>
          <label>Estado
            <select name="estado">${INCOME_STATUSES.map((status) => `<option>${status}</option>`).join("")}</select>
          </label>
          <label class="full">Observaciones<textarea name="observaciones"></textarea></label>
        </div>
        <div class="hero-actions">
          <button class="button" type="submit">Guardar ingreso</button>
        </div>
      </form>

      <article class="table-card">
        <h3>Últimos ingresos</h3>
        ${incomeTable(state.incomes, state.projects)}
      </article>
    </section>
  `;

  container.querySelector("#income-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData(event.currentTarget);
    if (!data.proyectoId) {
      toast("Selecciona un proyecto.", "error");
      return;
    }
    const result = await api.createIncome(data);
    toast(result.message || "Ingreso registrado.");
  });
}

function projectSelect(projects) {
  return `
    <label>Proyecto
      <select name="proyectoId" required>
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
              <td>${escapeHTML(income.concepto)}</td>
              <td>${escapeHTML(income.estado)}</td>
              <td>${formatCurrency(income.valorCobrado)}</td>
              <td>${formatCurrency(income.saldoPendiente)}</td>
            </tr>
          `).join("") || `<tr><td colspan="5">Sin ingresos registrados.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

