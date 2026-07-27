import { getState } from "../state.js";
import { escapeHTML } from "../utils.js";

export function renderDocuments(container, mode = "Documentos") {
  const { projects } = getState();
  const isReports = mode === "Informes";
  const isCalendar = mode === "Calendario";
  const isAlerts = mode === "Alertas";

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">${escapeHTML(mode)}</p>
        <h2>${heading(mode)}</h2>
        <p>${description(mode)}</p>
      </div>
    </section>

    <section class="module-grid">
      ${cards(mode).map((card) => `
        <article class="card">
          <span class="tag">${escapeHTML(mode)}</span>
          <h3>${escapeHTML(card.title)}</h3>
          <p>${escapeHTML(card.text)}</p>
        </article>
      `).join("")}
    </section>

    <section class="table-card">
      <h3>Proyectos relacionados</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Proyecto</th><th>Estado</th><th>Tipo</th><th>Uso previsto</th></tr></thead>
          <tbody>
            ${projects.map((project) => `
              <tr>
                <td>${escapeHTML(project.nombre)}</td>
                <td>${escapeHTML(project.estado)}</td>
                <td>${escapeHTML(project.tipo)}</td>
                <td>${escapeHTML(isReports ? "Informe financiero" : isCalendar ? "Hitos y vencimientos" : isAlerts ? "Cobros, pagos y riesgo" : "Contrato, comprobante o cotización")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function heading(mode) {
  return {
    Informes: "Informes parciales, finales y para socios",
    Calendario: "Calendario de hitos financieros",
    Alertas: "Alertas operativas y financieras",
    Documentos: "Documentos y metadata privada de Drive",
  }[mode] || mode;
}

function description(mode) {
  return {
    Informes: "Preparado para resumen ejecutivo, cortes financieros, liquidación e informe final.",
    Calendario: "Preparado para pagos próximos, cobros vencidos, cierres y vencimientos de invitaciones.",
    Alertas: "Preparado para aportes pendientes, cambios financieros relevantes y riesgos.",
    Documentos: "No expone archivos de Drive públicamente; la Fase 1 registra solo la estructura visual.",
  }[mode] || "Módulo preparado para próximas fases.";
}

function cards(mode) {
  if (mode === "Informes") {
    return [
      { title: "Resumen ejecutivo", text: "Datos generales, estado, presupuesto, ROI, margen y riesgos." },
      { title: "Corte financiero", text: "Ingresos, gastos, desembolsos, pendientes y desviaciones." },
      { title: "Informe final", text: "Liquidación, resultado personal, ahorros, cronología y lecciones aprendidas." },
    ];
  }

  if (mode === "Calendario") {
    return [
      { title: "Pagos próximos", text: "Fechas comprometidas por proyecto y proveedor." },
      { title: "Cobros vencidos", text: "Saldos pendientes por ingreso y pagador." },
      { title: "Cierres", text: "Hitos de operación, liquidación y archivo." },
    ];
  }

  if (mode === "Alertas") {
    return [
      { title: "Riesgo alto", text: "Proyectos que requieren revisión de presupuesto o caja." },
      { title: "Aporte pendiente", text: "Compromisos de socios no desembolsados." },
      { title: "Cambio relevante", text: "Movimientos financieros que ameritan notificación." },
    ];
  }

  return [
    { title: "Contratos", text: "Metadata para contratos y acuerdos especiales." },
    { title: "Facturas", text: "Comprobantes, pagos, cobros y versiones." },
    { title: "Cotizaciones", text: "Archivos privados enlazados a compras y proveedores." },
  ];
}

