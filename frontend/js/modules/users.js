export function renderUsers(container) {
  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Usuarios invitados</p>
        <h2>Accesos por proyecto</h2>
        <p>Fase 1 deja la pantalla preparada; Fase 2 implementará invitaciones, confirmación, vencimientos y permisos reales en backend.</p>
      </div>
    </section>

    <section class="module-grid">
      ${[
        "Invitación pendiente",
        "Correo pendiente de confirmar",
        "Activo",
        "Suspendido",
        "Invitación vencida",
        "Acceso eliminado",
      ].map((status) => `
        <article class="card">
          <span class="tag">Estado</span>
          <h3>${status}</h3>
          <p>Disponible para flujos de usuario y auditoría de accesos.</p>
        </article>
      `).join("")}
    </section>
  `;
}

