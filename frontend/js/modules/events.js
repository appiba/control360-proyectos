import { getState } from "../state.js";
import { escapeHTML, formatCurrency, getProjectFinancials } from "../utils.js";

export function renderEvents(container) {
  const state = getState();
  const events = state.projects.filter((project) => project.tipo === "Evento");

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Eventos</p>
        <h2>Control de eventos</h2>
        <p>Preparado para participación personal o producción completa, con escenarios conservador, probable, optimista y real.</p>
      </div>
      <a class="button" href="#/proyectos">Registrar evento</a>
    </section>

    <section class="module-grid">
      ${events.map((event) => {
        const financials = getProjectFinancials(event, state);
        return `
          <article class="card">
            <span class="tag">${escapeHTML(event.estado)}</span>
            <h3>${escapeHTML(event.nombre)}</h3>
            <p>${escapeHTML(event.descripcion)}</p>
            <p><strong>${formatCurrency(financials.totalIncome)}</strong> ingresos cobrados</p>
            <p><strong>${formatCurrency(financials.totalExpenses)}</strong> gastos pagados</p>
            <a class="button button--ghost" href="#/proyectos/${event.id}">Ver detalle</a>
          </article>
        `;
      }).join("") || `
        <div class="empty-state">
          <h3>No hay eventos todavía</h3>
          <p>Crea un proyecto de tipo Evento para activar esta vista.</p>
        </div>
      `}
    </section>

    <section class="card">
      <h3>Campos específicos preparados</h3>
      <p>
        Capacidad, tipo de participación, porcentaje personal, inversión personal, capital comprometido,
        entradas, auspicios, punto de equilibrio, ROI, margen y riesgo.
      </p>
    </section>
  `;
}

