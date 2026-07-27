import { renderPartnerChart } from "../charts.js";
import { getState } from "../state.js";
import { addPartner } from "../state.js";
import { escapeHTML, formatCurrency, getFormData, toast, toNumber } from "../utils.js";

export function renderPartners(container) {
  const state = getState();
  const labels = state.partners.map((partner) => partner.nombre);
  const values = state.partners.map((partner) => partner.participacionUtilidades);
  const totalUtility = state.partners.reduce((total, partner) => total + toNumber(partner.participacionUtilidades), 0);

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Socios y participaciones</p>
        <h2>Distribución legal, económica y de utilidades</h2>
        <p>Permite representar beneficiarios de utilidad sin cambiar la participación legal.</p>
      </div>
    </section>

    <section class="detail-grid">
      <article class="chart-card">
        <canvas id="partners-chart" height="320" aria-label="Distribución de socios"></canvas>
      </article>
      <form class="form-card" id="partner-form">
        <h3>Agregar socio visual</h3>
        <div class="form-grid">
          <label>Proyecto
            <select name="proyectoId" required>
              <option value="">Seleccionar</option>
              ${state.projects.map((project) => `<option value="${project.id}">${escapeHTML(project.nombre)}</option>`).join("")}
            </select>
          </label>
          <label>Nombre<input name="nombre" required /></label>
          <label>Correo<input name="correo" type="email" /></label>
          <label>Tipo de socio<input name="tipoSocio" placeholder="Legal, operador, beneficiario..." /></label>
          <label>Participación legal %<input name="participacionLegal" type="number" min="0" max="100" step="0.01" /></label>
          <label>Participación económica %<input name="participacionEconomica" type="number" min="0" max="100" step="0.01" /></label>
          <label>Participación utilidades %<input name="participacionUtilidades" type="number" min="0" max="100" step="0.01" /></label>
          <label>Aporte comprometido<input name="aporteComprometido" type="number" min="0" step="0.01" /></label>
          <label>Aporte realizado<input name="aporteRealizado" type="number" min="0" step="0.01" /></label>
          <label>Estado<input name="estado" value="Activo" /></label>
        </div>
        <div class="hero-actions">
          <button class="button" type="submit">Agregar socio</button>
        </div>
      </form>
    </section>

    <section class="table-card">
      <div class="section-heading">
        <div>
          <h3>Árbol societario inicial</h3>
          <p>Total de participación en utilidades registrada: ${totalUtility.toFixed(2)} %</p>
        </div>
      </div>
      <div class="timeline">
        ${state.partners.map((partner) => `
          <div class="timeline-item">
            <strong>${escapeHTML(partner.nombre)} · ${escapeHTML(partner.tipoSocio)}</strong>
            <p>
              Legal ${partner.participacionLegal}% · Económica ${partner.participacionEconomica}% ·
              Utilidades ${partner.participacionUtilidades}% · Aporte ${formatCurrency(partner.aporteRealizado)} /
              ${formatCurrency(partner.aporteComprometido)}
            </p>
          </div>
        `).join("")}
      </div>
    </section>
  `;

  renderPartnerChart(labels, values);

  container.querySelector("#partner-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getFormData(event.currentTarget);
    addPartner(data);
    toast("Socio agregado en modo demo.");
  });
}

