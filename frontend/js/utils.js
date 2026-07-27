import { CONFIG } from "./config.js";

export const PROJECT_TYPES = [
  "Evento",
  "Negocio",
  "Inversión",
  "Compra de empresa",
  "Proyecto digital",
  "Inmueble",
  "Activo",
  "Oportunidad",
  "Otro personalizado",
];

export const PROJECT_STATUSES = [
  "Idea",
  "Exploración",
  "Investigación",
  "Negociación",
  "Planificación",
  "En ejecución",
  "Activo",
  "Finalizado operativamente",
  "Pendiente de cobros",
  "Pendiente de pagos",
  "En liquidación",
  "Liquidado",
  "Cerrado",
  "Archivado",
  "Cancelado",
];

export const PROJECT_RISK_LEVELS = ["Bajo", "Medio", "Alto"];

export function createUUID() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function nowISO() {
  return new Date().toISOString();
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(toNumber(value), min), max);
}

export function formatCurrency(value, currency = CONFIG.defaultCurrency) {
  return new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatPercent(value) {
  return `${toNumber(value).toFixed(1)} %`;
}

export function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(CONFIG.locale, {
    timeZone: CONFIG.timezone,
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function sumBy(items, selector) {
  return items.reduce((total, item) => total + toNumber(selector(item)), 0);
}

export function groupBy(items, selector) {
  return items.reduce((groups, item) => {
    const key = selector(item) || "Sin clasificar";
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

export function calculateInvestment(totalBudget, personalPercent) {
  return toNumber(totalBudget) * (toNumber(personalPercent) / 100);
}

export function calculateCapitalPending(committed, disbursed) {
  return Math.max(toNumber(committed) - toNumber(disbursed), 0);
}

export function calculateMargin(netProfit, totalIncome) {
  const income = toNumber(totalIncome);
  return income === 0 ? 0 : (toNumber(netProfit) / income) * 100;
}

export function calculateROI(netProfit, investment) {
  const base = toNumber(investment);
  return base === 0 ? 0 : (toNumber(netProfit) / base) * 100;
}

export function calculateBreakEvenUnits(fixedCosts, unitPrice, variableUnitCost) {
  const contribution = toNumber(unitPrice) - toNumber(variableUnitCost);
  if (contribution <= 0) return 0;
  return Math.ceil(toNumber(fixedCosts) / contribution);
}

export function calculateWeightedAverage(rows, valueKey = "precio", weightKey = "cantidad") {
  const weightTotal = sumBy(rows, (row) => row[weightKey]);
  if (weightTotal === 0) return 0;
  return sumBy(rows, (row) => toNumber(row[valueKey]) * toNumber(row[weightKey])) / weightTotal;
}

export function calculateSavings(quoted, negotiated) {
  return Math.max(toNumber(quoted) - toNumber(negotiated), 0);
}

export function calculateFinancialSummary({ incomes = [], expenses = [], investment = 0 } = {}) {
  const totalIncome = sumBy(incomes, (item) => item.valorCobrado ?? item.valorConfirmado ?? item.valorEstimado);
  const totalExpenses = sumBy(expenses, (item) => item.valorPagado ?? item.valorReal ?? item.valorPresupuestado);
  const grossProfit = totalIncome - totalExpenses;
  const netProfit = grossProfit;

  return {
    totalIncome,
    totalExpenses,
    grossProfit,
    netProfit,
    margin: calculateMargin(netProfit, totalIncome),
    roi: calculateROI(netProfit, investment || totalExpenses),
  };
}

export function validateProject(project) {
  const errors = [];
  const name = String(project?.nombre ?? "").trim();
  const type = String(project?.tipo ?? "").trim();
  const status = String(project?.estado ?? "").trim();
  const currency = String(project?.moneda ?? "").trim();

  if (name.length < 3) errors.push("El nombre debe tener al menos 3 caracteres.");
  if (!PROJECT_TYPES.includes(type)) errors.push("Selecciona un tipo de proyecto válido.");
  if (!PROJECT_STATUSES.includes(status)) errors.push("Selecciona un estado válido.");
  if (!/^[A-Z]{3}$/.test(currency)) errors.push("La moneda debe usar código ISO de 3 letras, por ejemplo USD.");
  if (toNumber(project?.presupuestoInicial) < 0) errors.push("El presupuesto inicial no puede ser negativo.");
  if (toNumber(project?.presupuestoActualizado) < 0) errors.push("El presupuesto actualizado no puede ser negativo.");

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getProjectFinancials(project, state) {
  const incomes = state.incomes.filter((item) => item.proyectoId === project.id);
  const expenses = state.expenses.filter((item) => item.proyectoId === project.id);
  return calculateFinancialSummary({
    incomes,
    expenses,
    investment: project.presupuestoActualizado || project.presupuestoInicial,
  });
}

export function downloadText(filename, text, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getFormData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") data[key] = value.trim();
  }
  return data;
}

export function toast(message, type = "info") {
  const root = document.querySelector("#toast-root");
  if (!root) return;
  const item = document.createElement("div");
  item.className = `toast toast--${type}`;
  item.textContent = message;
  root.appendChild(item);
  setTimeout(() => item.remove(), 4600);
}

export function setLoading(container, message = "Cargando información…") {
  container.innerHTML = `<div class="empty-state"><p>${escapeHTML(message)}</p></div>`;
}

