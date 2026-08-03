import { api } from "../api.js";
import { getState } from "../state.js";
import { calculateSavings, escapeHTML, formatCurrency, getFormData, toast } from "../utils.js";

export const EXPENSE_CATALOG = [
  {
    categoria: "Personal",
    subcategorias: [
      {
        nombre: "Operación y talento",
        conceptos: [
          "DJ",
          "Artista",
          "Presentador",
          "Animador",
          "Bartender",
          "Mesero",
          "Cajero",
          "Limpieza",
          "Seguridad",
          "Jefe de seguridad",
          "Control de accesos",
          "Boletería",
          "Técnico de sonido",
          "Técnico de iluminación",
          "Operador LED",
          "Productor",
          "Coordinador",
          "Fotógrafo",
          "Videógrafo",
          "Community manager",
          "Diseñador",
          "Otros",
        ],
      },
    ],
  },
  {
    categoria: "Producción",
    subcategorias: [
      {
        nombre: "Técnica",
        conceptos: [
          "Sonido",
          "Iluminación",
          "Pantallas LED",
          "Tarima",
          "Generador",
          "Cableado",
          "Consolas",
          "Micrófonos",
          "Backline",
          "Truss",
          "Vallas",
          "Montaje",
          "Desmontaje",
          "Transporte técnico",
        ],
      },
    ],
  },
  {
    categoria: "Alquileres y mobiliario",
    subcategorias: [
      {
        nombre: "Infraestructura temporal",
        conceptos: [
          "Carpas",
          "Sillas",
          "Mesas",
          "Mantelería",
          "Barras móviles",
          "Tarimas",
          "Podios",
          "Stands",
          "Camerinos móviles",
          "Baños portátiles",
          "Calefactores",
          "Ventiladores",
          "Refrigeración",
          "Sillones lounge",
          "Bancos altos",
        ],
      },
    ],
  },
  {
    categoria: "Bebidas e hidratación",
    subcategorias: [
      {
        nombre: "Consumo",
        conceptos: ["Agua", "Colas", "Jugos", "Energizantes", "Hielo", "Vasos", "Sorbetes", "Servilletas", "Cortesías"],
      },
    ],
  },
  {
    categoria: "Alimentación",
    subcategorias: [
      {
        nombre: "Catering y alimentación operativa",
        conceptos: [
          "Desayuno",
          "Almuerzo",
          "Cena",
          "Refrigerios",
          "Catering",
          "Snacks",
          "Coffee break",
          "Alimentación de artistas",
          "Alimentación de producción",
          "Alimentación de seguridad",
        ],
      },
    ],
  },
  {
    categoria: "Logística y viáticos",
    subcategorias: [
      {
        nombre: "Movilidad, viaje e investigación",
        conceptos: [
          "Combustible",
          "Taxi",
          "Transporte por aplicación",
          "Bus",
          "Avión",
          "Peajes",
          "Parqueadero",
          "Hotel",
          "Hostal",
          "Airbnb",
          "Desayuno",
          "Almuerzo",
          "Cena",
          "Reuniones comerciales",
          "Internet",
          "Papelería",
          "Mensajería",
          "Estudios",
          "Consultorías",
          "Investigación",
          "Levantamientos",
        ],
      },
    ],
  },
  {
    categoria: "Publicidad",
    subcategorias: [
      {
        nombre: "Marketing y ventas",
        conceptos: [
          "Meta Ads",
          "TikTok Ads",
          "Google Ads",
          "Radio",
          "Televisión",
          "Prensa",
          "Influencers",
          "Diseño",
          "Fotografía",
          "Video",
          "Impresión",
          "Flyers",
          "Vallas",
          "Relaciones públicas",
          "Comisión de ticketera",
          "Comisiones de venta",
        ],
      },
    ],
  },
  {
    categoria: "Administración",
    subcategorias: [
      {
        nombre: "Soporte administrativo",
        conceptos: [
          "Legal",
          "Contabilidad",
          "Notaría",
          "Contratos",
          "Seguros",
          "Impuestos",
          "Comisiones bancarias",
          "Plataforma de pagos",
          "Software",
          "Internet",
          "Telefonía",
          "Papelería",
        ],
      },
    ],
  },
  {
    categoria: "Infraestructura",
    subcategorias: [
      {
        nombre: "Adecuaciones",
        conceptos: [
          "Cerramientos",
          "Pisos temporales",
          "Rampas",
          "Escaleras",
          "Pasarelas",
          "Estructuras",
          "Techos",
          "Toldos",
          "Señalética",
          "Iluminación de emergencia",
        ],
      },
    ],
  },
  {
    categoria: "Otros",
    subcategorias: [
      {
        nombre: "Contingencias",
        conceptos: [
          "Propinas",
          "Movilización",
          "Recargas",
          "Reposición",
          "Daños",
          "Pérdidas",
          "Multas",
          "Garantías",
          "Depósitos",
          "Gastos bancarios",
          "Imprevistos",
        ],
      },
    ],
  },
];

const EXPENSE_STATUSES = [
  "Estimado",
  "Cotizado",
  "Negociado",
  "Aprobado",
  "Pagado parcialmente",
  "Pagado",
  "Pendiente",
  "Vencido",
  "Cancelado",
];

const EXPENSE_STAGES = ["Exploración", "Investigación", "Negociación", "Planificación", "Operación", "Cierre"];

const COVER_OPTIONS = [
  "Sociedad completa",
  "Propietario personalmente",
  "Socio específico",
  "Dividido por porcentajes",
  "Montos personalizados",
  "Recuperable",
  "Descontado de utilidad personal",
  "Descontado de utilidad general",
];

const UNIT_OPTIONS = ["servicio", "unidad", "dia", "hora", "mes", "noche", "persona", "km", "paquete"];

const PAYMENT_METHODS = [
  "Transferencia",
  "Efectivo",
  "Tarjeta",
  "Cheque",
  "Deposito",
  "Pasarela de pago",
  "Canje",
  "Pendiente por definir",
];

const DEFAULT_EXPENSE_OWNERS = ["Sociedad completa", "Administrador general", "Propietario principal", "Proveedor pendiente"];

export function renderExpenses(container) {
  const state = getState();

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Gastos y catálogo</p>
        <h2>Registro de gastos</h2>
        <p>Flujo: categoría → subcategoría → concepto → cantidad → valor unitario → total.</p>
      </div>
      <div class="toolbar">
        <select id="expense-filter-project" aria-label="Filtrar gastos por proyecto">
          <option value="">Todos los proyectos</option>
          ${state.projects.map((project) => `<option value="${project.id}">${escapeHTML(project.nombre)}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="detail-grid">
      <form class="form-card" id="expense-form">
        <h3>Registrar gasto</h3>
        <div class="form-grid">
          ${projectSelect(state.projects, "expense-project")}
          <label>Etapa
            <select name="etapa">${EXPENSE_STAGES.map((stage) => `<option>${stage}</option>`).join("")}</select>
          </label>
          <label>Categoría
            <select name="categoria" id="expense-category">${EXPENSE_CATALOG.map((item) => `<option>${item.categoria}</option>`).join("")}</select>
          </label>
          <label>Subcategoría
            <select name="subcategoria" id="expense-subcategory"></select>
          </label>
          <label>Concepto
            <select name="concepto" id="expense-concept"></select>
          </label>
          <label>Cantidad<input name="cantidad" type="number" min="0" step="0.01" value="1" /></label>
          <label>Unidad
            <select name="unidad">${UNIT_OPTIONS.map((unit) => `<option>${escapeHTML(unit)}</option>`).join("")}</select>
          </label>
          <label>Valor presupuestado<input name="valorPresupuestado" type="number" min="0" step="0.01" /></label>
          <label>Valor cotizado<input name="valorCotizado" type="number" min="0" step="0.01" /></label>
          <label>Valor negociado<input name="valorNegociado" type="number" min="0" step="0.01" /></label>
          <label>Valor real<input name="valorReal" type="number" min="0" step="0.01" /></label>
          <label>Valor pagado<input name="valorPagado" type="number" min="0" step="0.01" /></label>
          <label>Saldo pendiente<input name="saldoPendiente" type="number" min="0" step="0.01" /></label>
          <label>Proveedor
            <select name="proveedor">
              <option>Proveedor pendiente</option>
              ${(state.providers || []).map((provider) => `<option>${escapeHTML(provider.nombre || provider.empresa)}</option>`).join("")}
            </select>
          </label>
          <label>Fecha<input name="fecha" type="date" /></label>
          <label>Forma de pago
            <select name="formaPago">${PAYMENT_METHODS.map((method) => `<option>${escapeHTML(method)}</option>`).join("")}</select>
          </label>
          <label>Estado
            <select name="estado">${EXPENSE_STATUSES.map((status) => `<option>${status}</option>`).join("")}</select>
          </label>
          <label>Quién cubre
            <select name="quienCubre">${COVER_OPTIONS.map((option) => `<option>${option}</option>`).join("")}</select>
          </label>
          <label>Socio o responsable
            <select name="socioId" id="expense-partner"></select>
          </label>
          <label class="full">Observaciones<textarea name="observaciones"></textarea></label>
        </div>
        <div class="hero-actions">
          <button class="button" type="submit">Guardar gasto</button>
        </div>
      </form>

      <article class="table-card">
        <h3>Últimos gastos</h3>
        <div id="expense-table-root">${expenseTable(state.expenses, state.projects)}</div>
      </article>
    </section>

    <section class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Catálogo inicial</p>
          <h2>Conceptos reutilizables</h2>
        </div>
      </div>
      <div class="catalog-grid">
        ${EXPENSE_CATALOG.map(catalogCard).join("")}
      </div>
    </section>
  `;

  setupCatalogSelects(container);
  setupExpensePartnerSelect(container, state);

  container.querySelector("#expense-filter-project").addEventListener("change", (event) => {
    const projectId = event.target.value;
    const rows = projectId ? state.expenses.filter((expense) => expense.proyectoId === projectId) : state.expenses;
    container.querySelector("#expense-table-root").innerHTML = expenseTable(rows, state.projects);
  });

  container.querySelector("#expense-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData(event.currentTarget);
    if (!data.proyectoId) {
      toast("Selecciona un proyecto.", "error");
      return;
    }
    const partnerSelect = event.currentTarget.querySelector("#expense-partner");
    data.socioNombre = partnerSelect?.selectedOptions?.[0]?.textContent?.trim() || "";
    const result = await api.createExpense(data);
    if (!result.ok) {
      toast(result.message || "No fue posible guardar el gasto.", "error");
      return;
    }
    toast(result.message || "Gasto registrado.");
    renderExpenses(container);
  });
}

function setupCatalogSelects(container) {
  const categorySelect = container.querySelector("#expense-category");
  const subcategorySelect = container.querySelector("#expense-subcategory");
  const conceptSelect = container.querySelector("#expense-concept");

  const renderSubcategories = () => {
    const category = EXPENSE_CATALOG.find((item) => item.categoria === categorySelect.value);
    subcategorySelect.innerHTML = category.subcategorias
      .map((subcategory) => `<option>${escapeHTML(subcategory.nombre)}</option>`)
      .join("");
    renderConcepts();
  };

  const renderConcepts = () => {
    const category = EXPENSE_CATALOG.find((item) => item.categoria === categorySelect.value);
    const subcategory = category.subcategorias.find((item) => item.nombre === subcategorySelect.value);
    conceptSelect.innerHTML = subcategory.conceptos
      .map((concept) => `<option>${escapeHTML(concept)}</option>`)
      .join("");
  };

  categorySelect.addEventListener("change", renderSubcategories);
  subcategorySelect.addEventListener("change", renderConcepts);
  renderSubcategories();
}

function setupExpensePartnerSelect(container, state) {
  const projectSelectElement = container.querySelector("#expense-project");
  const partnerSelect = container.querySelector("#expense-partner");

  const renderPartners = () => {
    const projectPartners = (state.partners || [])
      .filter((partner) => partner.proyectoId === projectSelectElement.value)
      .map((partner) => ({ value: partner.id, label: partner.nombre }));
    const options = [
      ...DEFAULT_EXPENSE_OWNERS.map((label) => ({ value: label, label })),
      ...projectPartners,
    ];
    partnerSelect.innerHTML = options
      .map((option) => `<option value="${escapeHTML(option.value)}">${escapeHTML(option.label)}</option>`)
      .join("");
  };

  projectSelectElement.addEventListener("change", renderPartners);
  renderPartners();
}

function projectSelect(projects, id = "") {
  return `
    <label>Proyecto
      <select name="proyectoId" ${id ? `id="${id}"` : ""} required>
        <option value="">Seleccionar</option>
        ${projects.map((project) => `<option value="${project.id}">${escapeHTML(project.nombre)}</option>`).join("")}
      </select>
    </label>
  `;
}

function expenseTable(expenses, projects) {
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.nombre]));
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Concepto</th>
            <th>Cubre</th>
            <th>Estado</th>
            <th>Negociado</th>
            <th>Pagado</th>
            <th>Ahorro</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map((expense) => `
            <tr>
              <td>${escapeHTML(projectNames[expense.proyectoId] || "Sin proyecto")}</td>
              <td>${escapeHTML(expense.concepto)}</td>
              <td>${escapeHTML(expense.socioNombre || expense.quienCubre || "Pendiente")}</td>
              <td>${escapeHTML(expense.estado)}</td>
              <td>${formatCurrency(expense.valorNegociado)}</td>
              <td>${formatCurrency(expense.valorPagado)}</td>
              <td>${formatCurrency(calculateSavings(expense.valorCotizado, expense.valorNegociado))}</td>
            </tr>
          `).join("") || `<tr><td colspan="7">Sin gastos registrados.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function catalogCard(item) {
  const concepts = item.subcategorias.flatMap((subcategory) => subcategory.conceptos);
  return `
    <article class="catalog-card">
      <h3>${escapeHTML(item.categoria)}</h3>
      <p class="metric-note">${concepts.length} conceptos iniciales</p>
      <ul>
        ${concepts.slice(0, 8).map((concept) => `<li>${escapeHTML(concept)}</li>`).join("")}
        ${concepts.length > 8 ? `<li>+ ${concepts.length - 8} más</li>` : ""}
      </ul>
    </article>
  `;
}

