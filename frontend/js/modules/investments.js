import { getState } from "../state.js";
import { escapeHTML, formatCurrency } from "../utils.js";

export function renderInvestments(container, forcedType = "") {
  const state = getState();
  const investmentTypes = forcedType === "Activo"
    ? ["Activo", "Inmueble"]
    : forcedType === "Patrimonio"
      ? ["Activo", "Inmueble", "Inversión", "Negocio"]
      : ["Inversión", "Compra de empresa", "Proyecto digital", "Inmueble", "Activo", "Oportunidad"];
  const items = state.projects.filter((project) => investmentTypes.includes(project.tipo));

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">${escapeHTML(forcedType || "Inversiones")}</p>
        <h2>${escapeHTML(forcedType || "Inversiones, activos y oportunidades")}</h2>
        <p>Vista preparada para capital comprometido, capital recuperado, saldo por recuperar, ROI y riesgo.</p>
      </div>
      <a class="button" href="#/proyectos">Registrar activo u oportunidad</a>
    </section>

    <section class="module-grid">
      ${items.map((item) => `
        <article class="card">
          <span class="tag">${escapeHTML(item.tipo)}</span>
          <h3>${escapeHTML(item.nombre)}</h3>
          <p>${escapeHTML(item.descripcion)}</p>
          <p><strong>${formatCurrency(item.presupuestoActualizado || item.presupuestoInicial)}</strong> comprometido</p>
          <p class="metric-note">Estado: ${escapeHTML(item.estado)} · Riesgo: ${escapeHTML(item.nivelRiesgo)}</p>
          <a class="button button--ghost" href="#/proyectos/${item.id}">Ver detalle</a>
        </article>
      `).join("") || `
        <div class="empty-state">
          <h3>No hay registros en esta vista</h3>
          <p>Cuando crees proyectos de estos tipos aparecerán aquí.</p>
        </div>
      `}
    </section>
  `;
}

