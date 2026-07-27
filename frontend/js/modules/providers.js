import { getState } from "../state.js";
import { escapeHTML, formatCurrency } from "../utils.js";

export function renderProviders(container) {
  const { providers } = getState();

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Proveedores</p>
        <h2>Base inicial de proveedores</h2>
        <p>Preparada para compras realizadas, monto acumulado, descuento promedio, documentos y evaluación.</p>
      </div>
    </section>

    <section class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Categoría</th>
              <th>Ciudad</th>
              <th>Calificación</th>
              <th>Monto acumulado</th>
              <th>Descuento prom.</th>
            </tr>
          </thead>
          <tbody>
            ${providers.map((provider) => `
              <tr>
                <td>${escapeHTML(provider.nombre)}<br /><span class="metric-note">${escapeHTML(provider.empresa)}</span></td>
                <td>${escapeHTML(provider.categoria)}</td>
                <td>${escapeHTML(provider.ciudad)}</td>
                <td>${escapeHTML(provider.calificacion)}</td>
                <td>${formatCurrency(provider.montoAcumulado)}</td>
                <td>${escapeHTML(provider.descuentoPromedio)} %</td>
              </tr>
            `).join("") || `<tr><td colspan="6">Sin proveedores registrados.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

