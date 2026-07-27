import { CONFIG } from "./config.js";
import { nowISO, toast } from "./utils.js";

export function getSession() {
  try {
    const stored = localStorage.getItem(CONFIG.sessionKey);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(CONFIG.sessionKey, JSON.stringify({
    ...session,
    savedAt: nowISO(),
  }));
}

export function clearSession() {
  localStorage.removeItem(CONFIG.sessionKey);
}

export async function ensureAuthenticated(api) {
  const session = getSession();
  if (!session?.token) return false;

  const result = await api.validateSession(session.token);
  if (!result.ok) {
    clearSession();
    return false;
  }

  saveSession({
    token: session.token,
    expiresAt: result.data?.venceEn || session.expiresAt,
    usuario: result.data?.usuario || session.usuario,
  });
  return true;
}

export function renderLoginScreen(api, onAuthenticated) {
  document.body.classList.add("auth-locked");
  const modalRoot = document.querySelector("#modal-root");
  modalRoot.innerHTML = `
    <section class="login-screen" aria-label="Acceso privado CONTROL360">
      <div class="login-card">
        <div class="login-card__intro">
          <div class="brand">
            <div class="brand__mark" aria-hidden="true">C360</div>
            <div>
              <strong>CONTROL360</strong>
              <span>Acceso privado</span>
            </div>
          </div>
          <p class="eyebrow">Superadministrador único</p>
          <h1>Entra a tu centro patrimonial.</h1>
          <p>
            Este panel administra proyectos, ingresos, gastos, socios, documentos e informes.
            El acceso se valida en Google Apps Script antes de abrir el dashboard.
          </p>
          <ul class="login-security-list">
            <li>Clave validada fuera del frontend.</li>
            <li>Sesión temporal con token privado.</li>
            <li>Sin claves ni secretos en GitHub Pages.</li>
          </ul>
        </div>
        <div class="login-card__form">
          <p class="eyebrow">Iniciar sesión</p>
          <h2>Acceso administrador</h2>
          <form class="login-form" id="login-form">
            <label>Correo electrónico
              <input name="correo" type="email" autocomplete="username" required placeholder="tu correo administrador" />
            </label>
            <label>Clave
              <input name="password" type="password" autocomplete="current-password" required placeholder="Clave privada" />
            </label>
            <p class="login-message" id="login-message" role="alert"></p>
            <button class="button" type="submit">Entrar a CONTROL360</button>
          </form>
        </div>
      </div>
    </section>
  `;

  const form = modalRoot.querySelector("#login-form");
  const message = modalRoot.querySelector("#login-message");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const formData = Object.fromEntries(new FormData(form).entries());
    submitButton.disabled = true;
    submitButton.textContent = "Validando…";
    message.textContent = "";

    const result = await api.login({
      correo: String(formData.correo || "").trim(),
      password: String(formData.password || ""),
    });

    submitButton.disabled = false;
    submitButton.textContent = "Entrar a CONTROL360";

    if (!result.ok || !result.data?.token) {
      message.textContent = result.message || "No fue posible iniciar sesión.";
      return;
    }

    saveSession({
      token: result.data.token,
      expiresAt: result.data.venceEn,
      usuario: result.data.usuario,
    });
    modalRoot.innerHTML = "";
    document.body.classList.remove("auth-locked");
    toast("Sesión iniciada correctamente.");
    onAuthenticated();
  });
}

export function updateSessionBadge() {
  const session = getSession();
  const label = document.querySelector("#session-user-label");
  if (label) {
    label.textContent = session?.usuario?.correo
      ? session.usuario.correo
      : "Superadmin";
  }
}

export function hasPermission(permission) {
  const session = getSession();
  if (session?.usuario?.rol === "Superadmin") return true;
  return Boolean(session?.permisos?.includes(permission));
}

