import { CONFIG } from "./config.js";
import { downloadText, formatCurrency, todayISO } from "./utils.js";

export function exportCurrentView(title, state) {
  const pdfApi = globalThis.jspdf?.jsPDF;
  const lines = buildSummaryLines(title, state);

  if (!pdfApi) {
    window.print();
    return;
  }

  const doc = new pdfApi();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CONTROL360", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Informe preliminar: ${title}`, 14, 28);
  doc.text(`Fecha: ${todayISO()} · Moneda: ${CONFIG.defaultCurrency}`, 14, 36);

  lines.forEach((line, index) => {
    doc.text(line, 14, 50 + index * 8);
  });

  doc.save(`control360-${title.toLowerCase().replace(/\s+/g, "-")}-${todayISO()}.pdf`);
}

export function exportProjectsCsv(projects) {
  const header = ["id", "nombre", "tipo", "estado", "presupuestoInicial", "presupuestoActualizado"];
  const rows = projects.map((project) => header.map((key) => JSON.stringify(project[key] ?? "")).join(","));
  downloadText(`control360-proyectos-${todayISO()}.csv`, [header.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
}

function buildSummaryLines(title, state) {
  const totalBudget = state.projects.reduce(
    (total, project) => total + Number(project.presupuestoActualizado || project.presupuestoInicial || 0),
    0,
  );
  const totalIncome = state.incomes.reduce((total, income) => total + Number(income.valorCobrado || 0), 0);
  const totalExpenses = state.expenses.reduce((total, expense) => total + Number(expense.valorPagado || 0), 0);

  return [
    `Vista: ${title}`,
    `Proyectos registrados: ${state.projects.length}`,
    `Capital presupuestado: ${formatCurrency(totalBudget)}`,
    `Ingresos cobrados: ${formatCurrency(totalIncome)}`,
    `Gastos pagados: ${formatCurrency(totalExpenses)}`,
    `Resultado preliminar: ${formatCurrency(totalIncome - totalExpenses)}`,
    "Este reporte es preliminar y no reemplaza los informes finales versionados.",
  ];
}

