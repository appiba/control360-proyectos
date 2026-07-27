import { api } from "../api.js";
import { escapeHTML, formatDate, getFormData, setLoading, toast } from "../utils.js";

const ROLE_OPTIONS = ["Socio", "Editor", "AdministradorProyecto", "Invitado"];

const PERMISSIONS = [
  ["verResumen", "Resumen"],
  ["verIngresos", "Ingresos"],
  ["verGastos", "Gastos"],
  ["registrarIngresos", "Crear ingresos"],
  ["registrarGastos", "Crear gastos"],
  ["verUtilidades", "Utilidades"],
  ["verSocios", "Socios"],
  ["verParticipaciones", "Participaciones"],
  ["verDocumentos", "Documentos"],
  ["descargarInformes", "Informes"],
  ["subirDocumentos", "Subir documentos"],
  ["modificarDatos", "Modificar datos"],
  ["invitarUsuarios", "Invitar usuarios"],
  ["administrarPermisos", "Permisos"],
  ["cerrarProyecto", "Cerrar proyecto"],
];

const ROLE_DEFAULTS = {
  AdministradorProyecto: PERMISSIONS.map(([key]) => key),
  Editor: [
    "verResumen",
    "verIngresos",
    "verGastos",
    "registrarIngresos",
    "registrarGastos",
    "verSocios",
    "verDocumentos",
    "subirDocumentos",
    "modificarDatos",
  ],
  Socio: [
    "verResumen",
    "verIngresos",
    "verGastos",
    "verUtilidades",
    "verSocios",
    "verParticipaciones",
    "verDocumentos",
    "descargarInformes",
  ],
  Invitado: ["verResumen", "verDocumentos"],
};

export function renderUsers(container) {
  renderUsersAsync(container);
}

async function renderUsersAsync(container) {
  setLoading(container, "Cargando usuarios, invitaciones y permisos...");

  const [projectsResult, usersResult, invitationsResult, accessesResult] = await Promise.all([
    api.listProjects(),
    api.listUsers(),
    api.listInvitations(),
    api.listProjectAccesses(),
  ]);

  if (![projectsResult, usersResult, invitationsResult, accessesResult].every((result) => result.ok)) {
    const failed = [projectsResult, usersResult, invitationsResult, accessesResult].find((result) => !result.ok);
    container.innerHTML = `
      <section class="empty-state">
        <h2>No se pudo cargar Usuarios</h2>
        <p>${escapeHTML(failed?.message || "Revisa tu sesion o vuelve a cargar la pagina.")}</p>
      </section>
    `;
    return;
  }

  const projects = projectsResult.data || [];
  const users = usersResult.data || [];
  const invitations = invitationsResult.data || [];
  const accesses = accessesResult.data || [];
  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.nombre]));
  const userNames = Object.fromEntries(users.map((user) => [user.id, user.nombreCompleto || user.correo]));

  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Fase 2 activa</p>
        <h2>Usuarios, socios y permisos</h2>
        <p>El administrador general invita socios por proyecto. Cada socio activa su acceso con codigo privado y clave propia.</p>
      </div>
    </section>

    <section class="kpi-grid users-summary">
      ${summaryCard("Usuarios activos", users.filter((user) => user.estado === "Activo").length)}
      ${summaryCard("Invitaciones pendientes", invitations.filter((item) => item.estado === "Invitacion pendiente").length)}
      ${summaryCard("Accesos activos", accesses.filter((item) => item.estado === "Activo").length)}
      ${summaryCard("Proyectos disponibles", projects.length)}
    </section>

    <section class="detail-grid users-admin-grid">
      <form class="form-card" id="invite-user-form">
        <h3>Invitar socio</h3>
        <p class="metric-note">Crea el acceso y entrega el codigo solo a la persona correcta. La clave la crea el socio al activar.</p>
        <div class="form-grid">
          <label>Nombre completo
            <input name="nombreCompleto" placeholder="Nombre del socio" />
          </label>
          <label>Correo del usuario
            <input name="correo" type="email" required placeholder="socio@correo.com" />
          </label>
          <label>Telefono
            <input name="telefono" placeholder="Opcional" />
          </label>
          <label>Proyecto
            <select name="proyectoId" required>
              <option value="">Seleccionar proyecto</option>
              ${projects.map((project) => `<option value="${escapeHTML(project.id)}">${escapeHTML(project.nombre)}</option>`).join("")}
            </select>
          </label>
          <label>Rol
            <select name="rol" id="invite-role">
              ${ROLE_OPTIONS.map((role) => `<option value="${role}" ${role === "Socio" ? "selected" : ""}>${roleLabel(role)}</option>`).join("")}
            </select>
          </label>
          <label>Vence en
            <input name="venceEn" type="datetime-local" />
          </label>
          <label class="full checkbox-line">
            <input name="enviarCorreo" type="checkbox" value="true" checked />
            Enviar correo si Apps Script tiene permisos de email
          </label>
          <fieldset class="full permissions-fieldset">
            <legend>Permisos del proyecto</legend>
            <div class="permissions-grid" id="permissions-grid">
              ${permissionCheckboxes("Socio")}
            </div>
          </fieldset>
        </div>
        <div class="hero-actions">
          <button class="button" type="submit">Crear invitacion</button>
        </div>
        <div class="invitation-result" id="invitation-result" hidden></div>
      </form>

      <article class="table-card">
        <h3>Accesos por proyecto</h3>
        ${accessTable(accesses, projectNames, userNames)}
      </article>
    </section>

    <section class="chart-grid">
      <article class="table-card">
        <h3>Usuarios</h3>
        ${usersTable(users)}
      </article>
      <article class="table-card">
        <h3>Invitaciones</h3>
        ${invitationsTable(invitations, projectNames)}
      </article>
    </section>
  `;

  const form = container.querySelector("#invite-user-form");
  const roleSelect = container.querySelector("#invite-role");
  const permissionsGrid = container.querySelector("#permissions-grid");
  const resultBox = container.querySelector("#invitation-result");

  roleSelect.addEventListener("change", () => {
    permissionsGrid.innerHTML = permissionCheckboxes(roleSelect.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = getFormData(form);
    const permissions = [...form.querySelectorAll("input[name='permisos']:checked")]
      .map((item) => item.value);

    if (!data.proyectoId) {
      toast("Selecciona un proyecto para el socio.", "error");
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "...";
    const result = await api.inviteUser({
      ...data,
      permisos: permissions.join(","),
      enviarCorreo: Boolean(data.enviarCorreo),
      appUrl: window.location.href.split("#")[0],
    });
    submitButton.disabled = false;
    submitButton.textContent = "Crear invitacion";

    if (!result.ok) {
      toast(result.message || "No fue posible crear la invitacion.", "error");
      return;
    }

    const code = result.data?.activationCode || result.data?.invitacion?.activationCode || "";
    const url = result.data?.activationUrl || result.data?.invitacion?.aceptacionUrl || "";
    resultBox.hidden = false;
    resultBox.innerHTML = `
      <strong>Invitacion creada</strong>
      <p>Entrega este codigo solo al socio. No queda visible como clave en el frontend.</p>
      <code>${escapeHTML(code)}</code>
      ${url ? `<p><a href="${escapeHTML(url)}" target="_blank" rel="noreferrer">Abrir enlace de activacion</a></p>` : ""}
      <p class="metric-note">${escapeHTML(result.data?.email?.sent ? "Correo enviado." : "Si el correo no sale, copia el codigo manualmente.")}</p>
    `;
    toast(result.message || "Invitacion creada.");
  });

  container.querySelectorAll("[data-revoke-access]").forEach((button) => {
    button.addEventListener("click", async () => {
      const confirmed = confirm("Revocar este acceso al proyecto?");
      if (!confirmed) return;
      const result = await api.revokeAccess(button.dataset.revokeAccess);
      toast(result.message || "Acceso revocado.");
      renderUsersAsync(container);
    });
  });
}

function summaryCard(label, value) {
  return `
    <article class="card kpi-card">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
      <p class="metric-note">Actualizado con Apps Script</p>
    </article>
  `;
}

function permissionCheckboxes(role) {
  const defaults = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.Invitado;
  return PERMISSIONS.map(([key, label]) => `
    <label class="permission-chip">
      <input name="permisos" type="checkbox" value="${key}" ${defaults.includes(key) ? "checked" : ""} />
      <span>${escapeHTML(label)}</span>
    </label>
  `).join("");
}

function usersTable(users) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Ultimo acceso</th>
          </tr>
        </thead>
        <tbody>
          ${users.map((user) => `
            <tr>
              <td>
                <strong>${escapeHTML(user.nombreCompleto || user.correo)}</strong>
                <p class="metric-note">${escapeHTML(user.correo)}</p>
              </td>
              <td>${escapeHTML(roleLabel(user.rol))}</td>
              <td>${escapeHTML(user.estado || "Activo")}</td>
              <td>${formatDate(user.ultimoAcceso)}</td>
            </tr>
          `).join("") || `<tr><td colspan="4">Sin usuarios todavia.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function invitationsTable(invitations, projectNames) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Correo</th>
            <th>Proyecto</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Vence</th>
          </tr>
        </thead>
        <tbody>
          ${invitations.map((invitation) => `
            <tr>
              <td>${escapeHTML(invitation.correo)}</td>
              <td>${escapeHTML(projectNames[invitation.proyectoId] || "Sin proyecto")}</td>
              <td>${escapeHTML(roleLabel(invitation.rol))}</td>
              <td>${escapeHTML(invitation.estado)}</td>
              <td>${formatDate(invitation.venceEn)}</td>
            </tr>
          `).join("") || `<tr><td colspan="5">Sin invitaciones todavia.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function accessTable(accesses, projectNames, userNames) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Proyecto</th>
            <th>Rol</th>
            <th>Permisos</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${accesses.map((access) => `
            <tr>
              <td>${escapeHTML(userNames[access.usuarioId] || access.usuarioId)}</td>
              <td>${escapeHTML(projectNames[access.proyectoId] || access.proyectoId)}</td>
              <td>${escapeHTML(roleLabel(access.rol))}</td>
              <td><span class="metric-note">${escapeHTML(compactPermissions(access.permisos))}</span></td>
              <td>${escapeHTML(access.estado || "Activo")}</td>
              <td>
                ${access.estado === "Activo"
                  ? `<button class="button button--ghost" data-revoke-access="${escapeHTML(access.id)}" type="button">Revocar</button>`
                  : ""}
              </td>
            </tr>
          `).join("") || `<tr><td colspan="6">Sin accesos por proyecto todavia.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function compactPermissions(value) {
  const list = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!list.length) return "Permisos base del rol";
  if (list.includes("*")) return "Todos";
  return list.length > 4 ? `${list.slice(0, 4).join(", ")} +${list.length - 4}` : list.join(", ");
}

function roleLabel(role) {
  if (role === "AdministradorProyecto") return "Administrador de proyecto";
  if (role === "Superadmin") return "Superadmin";
  if (role === "Editor") return "Editor";
  if (role === "Socio") return "Socio";
  return "Invitado";
}
