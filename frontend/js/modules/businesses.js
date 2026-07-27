import { getState } from "../state.js";
import { escapeHTML, formatCurrency, getProjectFinancials } from "../utils.js";

export function renderBusinesses(container) {
  const state = getState();
  const businesses = state.projects.filter((project) => project.tipo === "Negocio");

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Negocios</p>
        <h2>Negocios y operación mensual</h2>
        <p>Diferencia participación legal, económica, utilidades, decisión, porcentajes privados y acuerdos especiales.</p>
      </div>
      <a class="button" href="#/proyectos">Registrar negocio</a>
    </section>

    <section class="project-grid">
      ${businesses.map((business) => {
        const financials = getProjectFinancials(business, state);
        return `
          <article class="card project-card">
            <span class="tag">${escapeHTML(business.subtipo || "Negocio")}</span>
            <h3>${escapeHTML(business.nombre)}</h3>
            <p>${escapeHTML(business.descripcion)}</p>
            <div class="kpi-grid">
              <div>
                <span class="metric-note">Presupuesto</span>
                <strong>${formatCurrency(business.presupuestoActualizado)}</strong>
              </div>
              <div>
                <span class="metric-note">Resultado</span>
                <strong>${formatCurrency(financials.netProfit)}</strong>
              </div>
            </div>
            <a class="button button--ghost" href="#/proyectos/${business.id}">Ver negocio</a>
          </article>
        `;
      }).join("") || `
        <div class="empty-state">
          <h3>No hay negocios registrados</h3>
          <p>Registra bares, radios, comercios, servicios o empresas desde Proyectos.</p>
        </div>
      `}
    </section>
  `;
}

