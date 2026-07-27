import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBreakEvenUnits,
  calculateCapitalPending,
  calculateFinancialSummary,
  calculateInvestment,
  calculateMargin,
  calculateROI,
  calculateSavings,
  calculateWeightedAverage,
} from "../frontend/js/utils.js";

test("calcula inversión personal y capital pendiente", () => {
  assert.equal(calculateInvestment(100000, 37.5), 37500);
  assert.equal(calculateCapitalPending(42000, 18000), 24000);
  assert.equal(calculateCapitalPending(42000, 50000), 0);
});

test("calcula margen y ROI sin dividir para cero", () => {
  assert.equal(calculateMargin(2500, 10000), 25);
  assert.equal(calculateMargin(2500, 0), 0);
  assert.equal(calculateROI(5000, 20000), 25);
  assert.equal(calculateROI(5000, 0), 0);
});

test("calcula punto de equilibrio en unidades", () => {
  assert.equal(calculateBreakEvenUnits(10000, 50, 30), 500);
  assert.equal(calculateBreakEvenUnits(10000, 30, 30), 0);
});

test("calcula precio promedio ponderado y ahorro", () => {
  const tickets = [
    { precio: 20, cantidad: 100 },
    { precio: 50, cantidad: 50 },
  ];
  assert.equal(calculateWeightedAverage(tickets), 30);
  assert.equal(calculateSavings(12500, 11000), 1500);
  assert.equal(calculateSavings(10000, 12000), 0);
});

test("no confunde ingresos con utilidad", () => {
  const summary = calculateFinancialSummary({
    incomes: [{ valorCobrado: 30000 }, { valorConfirmado: 10000 }],
    expenses: [{ valorPagado: 18000 }, { valorReal: 2000 }],
    investment: 20000,
  });

  assert.equal(summary.totalIncome, 40000);
  assert.equal(summary.totalExpenses, 20000);
  assert.equal(summary.netProfit, 20000);
  assert.equal(summary.margin, 50);
  assert.equal(summary.roi, 100);
});

