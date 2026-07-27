import { getState } from "../state.js";
import { calculateSavings, formatCurrency, sumBy } from "../utils.js";

export function renderPurchases(container) {
  const { expenses } = getState();
  const quoted = sumBy(expenses, (expense) => expense.valorCotizado);
  const negotiated = sumBy(expenses, (expense) => expense.valorNegociado);
  const savings = calculateSavings(quoted, negotiated);

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Centro de compras</p>
        <h2>Necesidades, cotizaciones y negociación</h2>
        <p>Fase 1 muestra ahorro preliminar con gastos cotizados y negociados. Fases siguientes tendrán flujo completo.</p>
      </div>
    </section>

    <section class="kpi-grid">
      <article class="card kpi-card">
        <span>Valor cotizado</span>
        <strong>${formatCurrency(quoted)}</strong>
        <p class="metric-note">Base demo desde gastos</p>
      </article>
      <article class="card kpi-card">
        <span>Valor negociado</span>
        <strong>${formatCurrency(negotiated)}</strong>
        <p class="metric-note">Costo antes de compra final</p>
      </article>
      <article class="card kpi-card">
        <span>Ahorro por negociación</span>
        <strong>${formatCurrency(savings)}</strong>
        <p class="metric-note">Cotizado menos negociado</p>
      </article>
    </section>

    <section class="module-grid">
      ${["Necesidades", "Proveedores", "Cotizaciones", "Comparación", "Negociación", "Compra", "Entrega", "Garantía", "Factura", "Evaluación"].map((step) => `
        <article class="card">
          <span class="tag">Centro de compras</span>
          <h3>${step}</h3>
          <p>Módulo preparado para la Fase 4.</p>
        </article>
      `).join("")}
    </section>
  `;
}

