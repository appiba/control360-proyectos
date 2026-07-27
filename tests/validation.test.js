import test from "node:test";
import assert from "node:assert/strict";
import { validateProject } from "../frontend/js/utils.js";
import { EXPENSE_CATALOG } from "../frontend/js/modules/expenses.js";

test("valida proyecto mínimo correcto", () => {
  const result = validateProject({
    nombre: "Festival Aurora",
    tipo: "Evento",
    estado: "Idea",
    moneda: "USD",
    presupuestoInicial: 1000,
    presupuestoActualizado: 1200,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rechaza tipo, estado, moneda y montos inválidos", () => {
  const result = validateProject({
    nombre: "X",
    tipo: "Cripto mágico",
    estado: "Invisible",
    moneda: "DOLARES",
    presupuestoInicial: -1,
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length >= 5, true);
});

test("catálogo de gastos incluye categorías mínimas y conceptos reutilizables", () => {
  const categories = EXPENSE_CATALOG.map((item) => item.categoria);
  [
    "Personal",
    "Producción",
    "Alquileres y mobiliario",
    "Bebidas e hidratación",
    "Alimentación",
    "Logística y viáticos",
    "Publicidad",
    "Administración",
    "Infraestructura",
    "Otros",
  ].forEach((category) => assert.equal(categories.includes(category), true));

  const concepts = EXPENSE_CATALOG.flatMap((category) =>
    category.subcategorias.flatMap((subcategory) => subcategory.conceptos),
  );
  assert.equal(concepts.includes("DJ"), true);
  assert.equal(concepts.includes("Sonido"), true);
  assert.equal(concepts.includes("Meta Ads"), true);
  assert.equal(concepts.includes("Imprevistos"), true);
  assert.equal(concepts.length > 120, true);
});

