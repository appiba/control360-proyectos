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
          borderColor: "#36d7b7",
          backgroundColor: "rgba(54, 215, 183, 0.16)",
          fill: true,
          tension: 0.38,
        },
        {
          label: "Gastos",
          data: [9000, 12000, 16000, 21000, 26000, 31000, summary.totalExpenses],
          borderColor: "#fb7185",
          backgroundColor: "rgba(251, 113, 133, 0.12)",
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
          backgroundColor: "rgba(128, 184, 255, 0.65)",
        },
        {
          label: "Resultado",
          data: summary.projectResults,
          backgroundColor: "rgba(54, 215, 183, 0.72)",
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
          backgroundColor: ["#36d7b7", "#80b8ff", "#a78bfa", "#fbbf24", "#fb7185", "#22c55e"],
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
          borderColor: "#36d7b7",
          backgroundColor: "rgba(54, 215, 183, 0.16)",
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
          backgroundColor: ["#36d7b7", "#80b8ff", "#a78bfa", "#fbbf24", "#fb7185"],
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
          color: "#cbd5e1",
          usePointStyle: true,
        },
      },
      title: {
        display: Boolean(title),
        text: title,
        color: "#ecf4ff",
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
            grid: { color: "rgba(148, 163, 184, 0.1)" },
            ticks: { color: "#94a3b8" },
          },
          y: {
            grid: { color: "rgba(148, 163, 184, 0.1)" },
            ticks: {
              color: "#94a3b8",
              callback: (value) => formatCurrency(value),
            },
          },
        }
      : undefined,
  };
}

