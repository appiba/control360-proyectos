import { getState } from "../state.js";
import { renderDashboardCharts } from "../charts.js";
import { formatCurrency, formatPercent, getProjectFinancials, groupBy, sumBy } from "../utils.js";

export function renderDashboard(container) {
  const state = getState();
  const summary = buildDashboardSummary(state);

  container.innerHTML = `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Fase 1 funcional</p>
        <h2>Control patrimonial sin perder de vista caja, riesgo y socios.</h2>
        <p>
          CONTROL360 separa presupuesto, desembolsos, ingresos cobrados, gastos pagados y resultado.
          Los datos visibles son demo locales hasta conectar Apps Script.
        </p>
        <div class="hero-actions">
          <a class="button" href="#/proyectos">Crear o revisar proyectos</a>
          <a class="button button--ghost" href="#/gastos">Ver catálogo de gastos</a>
        </div>
      </div>
      <div class="card">
        <span class="tag">Riesgo general: ${summary.riskLabel}</span>
        <h3>${formatCurrency(summary.netWorth)}</h3>
        <p>Patrimonio controlado estimado entre proyectos activos y oportunidades registradas.</p>
        <div class="progress" aria-label="Liquidez estimada">
          <span style="width:${summary.liquidityPercent}%"></span>
        </div>
        <p class="metric-note">Liquidez estimada: ${formatPercent(summary.liquidityPercent)}</p>
      </div>
    </section>

    <section class="kpi-grid" aria-label="Indicadores principales">
      ${kpi("Patrimonio total", summary.netWorth)}
      ${kpi("Capital invertido", summary.invested)}
      ${kpi("Comprometido", summary.committed)}
      ${kpi("Recuperado", summary.recovered)}
      ${kpi("Utilidad acumulada", summary.netProfit, summary.netProfit >= 0 ? "positive" : "negative")}
      ${kpi("Pendiente por cobrar", summary.pendingIncome)}
      ${kpi("Liquidez", summary.liquidity)}
      ${kpi("Proyectos activos", summary.activeProjects, "count")}
      ${kpi("ROI promedio", summary.averageRoi, "percent")}
      ${kpi("Riesgo", summary.riskScore, "percent")}
    </section>

    <section class="chart-grid">
      <article class="chart-card">
        <canvas id="cashflow-chart" height="320" aria-label="Gráfico de flujo de caja"></canvas>
      </article>
      <article class="chart-card">
        <canvas id="project-comparison-chart" height="320" aria-label="Comparación entre proyectos"></canvas>
      </article>
      <article class="chart-card">
        <canvas id="expense-distribution-chart" height="320" aria-label="Distribución de gastos"></canvas>
      </article>
      <article class="chart-card">
        <canvas id="risk-chart" height="320" aria-label="Medidor de riesgo general"></canvas>
      </article>
    </section>

    <section class="module-grid">
      ${moduleCard("Proyectos", "Activos, oportunidades, estados y presupuestos.", "/proyectos")}
      ${moduleCard("Ingresos", "Estimados, confirmados, facturados, cobrados y pendientes.", "/ingresos")}
      ${moduleCard("Gastos", "Presupuesto, cotización, negociación, pago y saldo.", "/gastos")}
      ${moduleCard("Socios", "Participación legal, económica y en utilidades.", "/socios")}
    </section>
  `;

  renderDashboardCharts(summary);
}

function kpi(label, value, mode = "money") {
  const formatted = mode === "count"
    ? value
    : mode === "percent"
      ? formatPercent(value)
      : formatCurrency(value);
  const note = mode === "positive"
    ? "Resultado preliminar positivo"
    : mode === "negative"
      ? "Revisar desviaciones"
      : "Actualizado con datos disponibles";

  return `
    <article class="card kpi-card">
      <span>${label}</span>
      <strong>${formatted}</strong>
      <p class="metric-note">${note}</p>
    </article>
  `;
}

function moduleCard(title, text, path) {
  return `
    <article class="card">
      <span class="tag">${title}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <a class="button button--ghost" href="#${path}">Abrir módulo</a>
    </article>
  `;
}

function buildDashboardSummary(state) {
  const projectSummaries = state.projects.map((project) => ({
    project,
    financials: getProjectFinancials(project, state),
  }));
  const totalIncome = sumBy(state.incomes, (item) => item.valorCobrado);
  const pendingIncome = sumBy(state.incomes, (item) => item.saldoPendiente);
  const totalExpenses = sumBy(state.expenses, (item) => item.valorPagado);
  const committed = sumBy(state.projects, (item) => item.presupuestoActualizado || item.presupuestoInicial);
  const recovered = totalIncome;
  const netProfit = totalIncome - totalExpenses;
  const activeProjects = state.projects.filter((item) => !["Archivado", "Cancelado", "Cerrado"].includes(item.estado)).length;
  const averageRoi = projectSummaries.length
    ? sumBy(projectSummaries, (item) => item.financials.roi) / projectSummaries.length
    : 0;
  const riskScore = calculateRiskScore(state.projects);
  const expenseGroups = groupBy(state.expenses, (item) => item.categoria);

  return {
    totalIncome,
    totalExpenses,
    pendingIncome,
    invested: totalExpenses,
    committed,
    recovered,
    netProfit,
    activeProjects,
    averageRoi,
    riskScore,
    riskLabel: riskScore > 70 ? "Alto" : riskScore > 40 ? "Medio" : "Bajo",
    liquidity: Math.max(totalIncome - totalExpenses, 0),
    liquidityPercent: Math.min(Math.max(((totalIncome - totalExpenses) / Math.max(committed, 1)) * 100 + 50, 8), 100),
    netWorth: committed + netProfit,
    projectLabels: state.projects.map((project) => project.nombre),
    projectBudgets: state.projects.map((project) => project.presupuestoActualizado || project.presupuestoInicial),
    projectResults: projectSummaries.map((item) => item.financials.netProfit),
    expenseLabels: Object.keys(expenseGroups),
    expenseValues: Object.values(expenseGroups).map((rows) => sumBy(rows, (item) => item.valorPagado || item.valorReal)),
  };
}

function calculateRiskScore(projects) {
  if (!projects.length) return 0;
  const weights = { Bajo: 25, Medio: 55, Alto: 85 };
  return sumBy(projects, (project) => weights[project.nivelRiesgo] ?? 50) / projects.length;
}

