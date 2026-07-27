import { CONFIG } from "./config.js";
import { nowISO, toast } from "./utils.js";

const OWNER_EMAIL_HASH = "iODOB2w09LQRJL80hoD8rwJfi9oOHhOtczm+bW81nOw=";
const OWNER_PASSWORD_SALT = "control360-owner-2026-07-27-km7xQ9wT6pR2";
const OWNER_PASSWORD_HASH = "FyPmwfffrS/aJtEY8PcNNUp8ceHUjJxkCUqZyAoNyRo=";
const OWNER_PASSWORD_ROUNDS = 2500;
const LOCAL_OWNER_SESSION_MODE = "owner-local";
const SESSION_DURATION_HOURS = 12;

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

  if (isLocalOwnerSession(session)) {
    return true;
  }

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
          <p class="eyebrow">Superadministrador unico</p>
          <h1>Entra a tu centro patrimonial.</h1>
          <p>
            Este panel administra proyectos, ingresos, gastos, socios, documentos e informes.
            El acceso se valida primero con la credencial del propietario y luego con Apps Script.
          </p>
          <ul class="login-security-list">
            <li>Clave validada por hash, no en texto visible.</li>
            <li>Sesion temporal privada.</li>
            <li>Sin clave escrita en GitHub Pages.</li>
          </ul>
        </div>
        <div class="login-card__form">
          <p class="eyebrow">Iniciar sesion</p>
          <h2>Acceso administrador</h2>
          <form class="login-form" id="login-form">
            <label>Correo electronico
              <input name="correo" type="email" autocomplete="username" required placeholder="tu correo administrador" />
            </label>
            <label>Clave
              <span class="password-field">
                <input id="password-input" name="password" type="password" autocomplete="current-password" inputmode="numeric" required placeholder="Clave privada" />
                <button class="password-toggle" id="password-toggle" type="button" aria-label="Mostrar clave" aria-pressed="false">👁</button>
              </span>
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
  const passwordInput = modalRoot.querySelector("#password-input");
  const passwordToggle = modalRoot.querySelector("#password-toggle");

  passwordToggle.addEventListener("click", () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    passwordToggle.setAttribute("aria-label", showing ? "Mostrar clave" : "Ocultar clave");
    passwordToggle.setAttribute("aria-pressed", String(!showing));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const formData = Object.fromEntries(new FormData(form).entries());
    const correo = String(formData.correo || "").trim();
    const password = normalizePassword(formData.password);

    submitButton.disabled = true;
    submitButton.textContent = "Validando...";
    message.textContent = "";

    const localOwnerSession = await createLocalOwnerSession(correo, password);
    if (localOwnerSession) {
      submitButton.disabled = false;
      submitButton.textContent = "Entrar a CONTROL360";
      openSession(localOwnerSession, modalRoot, onAuthenticated);
      return;
    }

    const result = await api.login({ correo, password });

    submitButton.disabled = false;
    submitButton.textContent = "Entrar a CONTROL360";

    if (result.ok && result.data?.token) {
      openSession({
        token: result.data.token,
        expiresAt: result.data.venceEn,
        usuario: result.data.usuario,
      }, modalRoot, onAuthenticated);
      return;
    }

    message.textContent = "Correo o clave incorrectos.";
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

function openSession(session, modalRoot, onAuthenticated) {
  saveSession(session);
  modalRoot.innerHTML = "";
  document.body.classList.remove("auth-locked");
  toast("Sesion iniciada correctamente.");
  onAuthenticated();
}

function isLocalOwnerSession(session) {
  return session?.mode === LOCAL_OWNER_SESSION_MODE &&
    String(session.token || "").startsWith("owner-local:");
}

async function createLocalOwnerSession(correo, password) {
  const valid = await credentialsMatchOwner(correo, password);
  if (!valid) return null;

  return {
    mode: LOCAL_OWNER_SESSION_MODE,
    token: `owner-local:${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    expiresAt: new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString(),
    usuario: {
      id: "owner",
      nombreCompleto: "Superadministrador",
      correo: normalizeEmail(correo),
      rol: "Superadmin",
      estado: "Activo",
    },
  };
}

async function credentialsMatchOwner(correo, password) {
  if (!window.crypto?.subtle || !correo || !password) return false;

  const emailHash = await sha256Base64(normalizeEmail(correo));
  if (!constantTimeEquals(emailHash, OWNER_EMAIL_HASH)) return false;

  const passwordHash = await hashOwnerPassword(password);
  return constantTimeEquals(passwordHash, OWNER_PASSWORD_HASH);
}

async function hashOwnerPassword(password) {
  let current = `${OWNER_PASSWORD_SALT}:${password}`;
  for (let index = 0; index < OWNER_PASSWORD_ROUNDS; index += 1) {
    current = await sha256Base64(current);
  }
  return current;
}

async function sha256Base64(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizePassword(value) {
  return String(value || "").trim();
}

function constantTimeEquals(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}
