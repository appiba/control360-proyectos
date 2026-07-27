import { getState } from "../state.js";
import { escapeHTML } from "../utils.js";

export function renderHistory(container) {
  const { history, projects } = getState();
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.nombre]));

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Auditoría</p>
        <h2>Historial de modificaciones</h2>
        <p>La Fase 1 registra eventos demo; Apps Script guardará modificaciones reales en la hoja Historial.</p>
      </div>
    </section>

    <section class="card">
      <div class="timeline">
        ${history.map((entry) => `
          <div class="timeline-item">
            <strong>${escapeHTML(entry.modulo)} · ${escapeHTML(entry.accion)}</strong>
            <p>
              ${escapeHTML(entry.fecha)} · ${escapeHTML(entry.usuario || "Sistema")} ·
              ${escapeHTML(projectNames[entry.proyectoId] || "General")}
            </p>
            <p class="metric-note">${escapeHTML(entry.observacion || "")}</p>
          </div>
        `).join("") || `<p>Sin historial todavía.</p>`}
      </div>
    </section>
  `;
}

