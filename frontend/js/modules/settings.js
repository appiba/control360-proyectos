import { api, isBackendConfigured } from "../api.js";
import { CONFIG } from "../config.js";
import { toast } from "../utils.js";

export function renderSettings(container) {
  container.innerHTML = `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Configuración</p>
        <h2>Conexión y parámetros base</h2>
        <p>Moneda predeterminada, zona horaria y URL de Apps Script.</p>
      </div>
    </section>

    <section class="detail-grid">
      <article class="card">
        <h3>Estado de backend</h3>
        <table>
          <tbody>
            <tr><th>Apps Script URL</th><td>${isBackendConfigured() ? "Configurada" : "Pendiente"}</td></tr>
            <tr><th>Moneda</th><td>${CONFIG.defaultCurrency}</td></tr>
            <tr><th>Zona horaria</th><td>${CONFIG.timezone}</td></tr>
            <tr><th>Modo actual</th><td>${isBackendConfigured() ? "Apps Script" : "Demo local"}</td></tr>
          </tbody>
        </table>
        <div class="hero-actions">
          <button class="button button--ghost" id="health-check" type="button">Probar conexión</button>
          <button class="button button--danger" id="reset-demo" type="button">Reiniciar demo local</button>
        </div>
      </article>
      <article class="card">
        <h3>Dónde pegar la URL /exec</h3>
        <p>Edita <code>frontend/js/config.js</code> y reemplaza:</p>
        <p><code>export const APPS_SCRIPT_URL = "";</code></p>
        <p>por la URL desplegada de Apps Script terminada en <code>/exec</code>.</p>
      </article>
    </section>
  `;

  container.querySelector("#health-check").addEventListener("click", async () => {
    const result = await api.healthCheck();
    toast(result.message || (result.ok ? "Conexión correcta." : "Conexión fallida."));
  });

  container.querySelector("#reset-demo").addEventListener("click", async () => {
    if (!confirm("¿Reiniciar los datos demo guardados en este navegador?")) return;
    const result = await api.resetDemo();
    toast(result.message || "Demo reiniciado.");
  });
}

