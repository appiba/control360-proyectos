import { formatCurrency } from "./utils.js";

const chartInstances = new Map();

function getChart() {
  return globalThis.Chart;
}

function destroyChart(id) {
  const current = chartInstances.get(id);
  if (current) {
    current.destroy();
    chartInstances.delete(id);
  }
}

export function renderChart(canvasId, config) {
  const Chart = getChart();
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyChart(canvasId);

  if (!Chart) {
    canvas.replaceWith(Object.assign(document.createElement("p"), {
      textContent: "Chart.js no está disponible todavía.",
      className: "metric-note",
    }));
    return;
  }

  const chart = new Chart(canvas, config);
  chartInstances.set(canvasId, chart);
}

export function renderDashboardCharts(summary) {
  renderChart("cashflow-chart", {
    type: "line",
    data: {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "Ingresos",
          data: [12000, 16000, 22000, 28000, 36000, 42000, summary.totalIncome],
          borderColor: "#d8ff35",
          backgroundColor: "rgba(216, 255, 53, 0.15)",
          fill: true,
          tension: 0.38,
        },
        {
          label: "Gastos",
          data: [9000, 12000, 16000, 21000, 26000, 31000, summary.totalExpenses],
          borderColor: "#ff6b7a",
          backgroundColor: "rgba(255, 107, 122, 0.12)",
          fill: true,
          tension: 0.38,
        },
      ],
    },
    options: baseOptions("Flujo estimado vs real", true),
  });

  renderChart("project-comparison-chart", {
    type: "bar",
    data: {
      labels: summary.projectLabels,
      datasets: [
        {
          label: "Presupuesto",
          data: summary.projectBudgets,
          backgroundColor: "rgba(125, 211, 252, 0.56)",
        },
        {
          label: "Resultado",
          data: summary.projectResults,
          backgroundColor: "rgba(216, 255, 53, 0.72)",
        },
      ],
    },
    options: baseOptions("Comparación entre proyectos", true),
  });

  renderChart("expense-distribution-chart", {
    type: "doughnut",
    data: {
      labels: summary.expenseLabels,
      datasets: [
        {
          data: summary.expenseValues,
          backgroundColor: ["#d8ff35", "#7dd3fc", "#a78bfa", "#f8d66d", "#ff6b7a", "#75f05c"],
          borderWidth: 0,
        },
      ],
    },
    options: baseOptions("Distribución de gastos", false),
  });

  renderChart("risk-chart", {
    type: "radar",
    data: {
      labels: ["Liquidez", "Riesgo", "ROI", "Cobros", "Desembolso"],
      datasets: [
        {
          label: "CONTROL360",
          data: [82, summary.riskScore, Math.max(summary.averageRoi, 5), 65, 72],
          borderColor: "#d8ff35",
          backgroundColor: "rgba(216, 255, 53, 0.15)",
        },
      ],
    },
    options: baseOptions("Medidor de riesgo general", false),
  });
}

export function renderPartnerChart(labels, values) {
  renderChart("partners-chart", {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#d8ff35", "#7dd3fc", "#a78bfa", "#f8d66d", "#ff6b7a"],
          borderWidth: 0,
        },
      ],
    },
    options: baseOptions("Distribución societaria", false),
  });
}

function baseOptions(title, moneyScale) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(245, 247, 238, 0.72)",
          usePointStyle: true,
        },
      },
      title: {
        display: Boolean(title),
        text: title,
        color: "#f5f7ee",
      },
      tooltip: {
        callbacks: moneyScale
          ? {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? context.parsed)}`,
            }
          : {},
      },
    },
    scales: moneyScale
      ? {
          x: {
            grid: { color: "rgba(245, 247, 238, 0.08)" },
            ticks: { color: "rgba(245, 247, 238, 0.5)" },
          },
          y: {
            grid: { color: "rgba(245, 247, 238, 0.08)" },
            ticks: {
              color: "rgba(245, 247, 238, 0.5)",
              callback: (value) => formatCurrency(value),
            },
          },
        }
      : undefined,
  };
}

