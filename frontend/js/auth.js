import { CONFIG, isBackendConfigured } from "./config.js";
import { nowISO, toast } from "./utils.js";

const OWNER_EMAIL_HASH = "iODOB2w09LQRJL80hoD8rwJfi9oOHhOtczm+bW81nOw=";
const OWNER_PASSWORD_SALT = "control360-owner-2026-07-27-km7xQ9wT6pR2";
const OWNER_PASSWORD_HASH = "FyPmwfffrS/aJtEY8PcNNUp8ceHUjJxkCUqZyAoNyRo=";
const OWNER_PASSWORD_ROUNDS = 2500;
const LOCAL_OWNER_SESSION_MODE = "owner-local";
const SESSION_DURATION_HOURS = 12;
const OWNER_CONTACT_EMAIL = ["pdavidnieto", "gmail.com"].join("@");
let pendingLoginRoute = "/dashboard";

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
      <div class="login-landing">
        <header class="login-nav" aria-label="Accesos CONTROL360">
          <div class="login-brand">
            <div class="brand__mark" aria-hidden="true">C360</div>
            <strong>CONTROL360</strong>
          </div>
          <label class="login-search">
            <span class="sr-only">Buscar</span>
            <input type="search" placeholder="Buscar proyectos, eventos o socios..." aria-label="Buscar proyectos, eventos o socios" />
            <span aria-hidden="true">&#128269;</span>
          </label>
          <nav class="login-links" aria-label="Modulos privados">
            <button type="button" data-login-route="/proyectos">Proyectos</button>
            <button type="button" data-login-route="/eventos">Eventos</button>
            <button type="button" data-login-route="/socios">Socios</button>
            <button type="button" data-show-contact="true">Contacto</button>
            <button class="login-join" type="button" data-login-route="/dashboard">Entrar</button>
          </nav>
        </header>

        <div class="login-hero">
          <p class="eyebrow">Centro privado patrimonial</p>
          <h1 class="brand-hero-title">BIENVENIDO</h1>
          <p class="brand-tagline">CONTROL360 · ERP inteligente</p>
          <p>
            Centraliza proyectos, eventos, socios, ingresos, gastos, compras y documentos
            en una experiencia ejecutiva, segura y preparada para analisis inteligente.
          </p>
          <div class="login-meta-pills" aria-label="Informacion privada">
            <span>Administrador general</span>
            <span id="login-contact-pill">Contacto: ${OWNER_CONTACT_EMAIL}</span>
            <span>Socios por invitacion</span>
          </div>
        </div>

        <aside class="login-access-card" aria-label="Acceso administrador">
          <form class="login-form" id="login-form">
            <label>Usuario
              <input name="correo" type="email" autocomplete="username" required placeholder="usuario administrador" />
            </label>
            <label>Clave
              <span class="password-field">
                <input id="password-input" name="password" type="password" autocomplete="current-password" inputmode="numeric" required placeholder="Clave privada" />
                <button class="password-toggle" id="password-toggle" type="button" aria-label="Mostrar clave" aria-pressed="false">&#128065;</button>
              </span>
            </label>
            <button class="button login-submit" type="submit">Login</button>
            <p class="login-message" id="login-message" role="alert"></p>
            <p class="login-access-note">Acceso privado · administrador general · socios por invitacion · sesion protegida.</p>
          </form>
          <details class="login-invitation-panel" id="login-invitation-panel">
            <summary>Activar socio invitado</summary>
            <form class="invitation-form" id="invitation-form">
              <label>Usuario
                <input name="correo" type="email" autocomplete="username" required placeholder="correo invitado" />
              </label>
              <label>Codigo
                <input name="codigo" autocomplete="one-time-code" required placeholder="codigo privado" />
              </label>
              <label>Clave nueva
                <span class="password-field">
                  <input id="invitation-password-input" name="password" type="password" autocomplete="new-password" required placeholder="crea tu clave" />
                  <button class="password-toggle" id="invitation-password-toggle" type="button" aria-label="Mostrar clave" aria-pressed="false">&#128065;</button>
                </span>
              </label>
              <label>Nombre
                <input name="nombreCompleto" autocomplete="name" placeholder="nombre del socio" />
              </label>
              <button class="button button--ghost" type="submit">Activar</button>
              <p class="login-message" id="invitation-message" role="alert"></p>
            </form>
          </details>
        </aside>
      </div>
    </section>
  `;

  const form = modalRoot.querySelector("#login-form");
  const message = modalRoot.querySelector("#login-message");
  const passwordInput = modalRoot.querySelector("#password-input");
  const passwordToggle = modalRoot.querySelector("#password-toggle");
  const invitationPanel = modalRoot.querySelector("#login-invitation-panel");
  const invitationForm = modalRoot.querySelector("#invitation-form");
  const invitationMessage = modalRoot.querySelector("#invitation-message");
  const invitationPasswordInput = modalRoot.querySelector("#invitation-password-input");
  const invitationPasswordToggle = modalRoot.querySelector("#invitation-password-toggle");
  const routeButtons = modalRoot.querySelectorAll("[data-login-route]");
  const contactButtons = modalRoot.querySelectorAll("[data-show-contact]");
  const inviteFromUrl = getInviteFromLocation();

  passwordToggle.addEventListener("click", () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    passwordToggle.setAttribute("aria-label", showing ? "Mostrar clave" : "Ocultar clave");
    passwordToggle.setAttribute("aria-pressed", String(!showing));
  });

  invitationPasswordToggle.addEventListener("click", () => {
    const showing = invitationPasswordInput.type === "text";
    invitationPasswordInput.type = showing ? "password" : "text";
    invitationPasswordToggle.setAttribute("aria-label", showing ? "Mostrar clave" : "Ocultar clave");
    invitationPasswordToggle.setAttribute("aria-pressed", String(!showing));
  });

  if (inviteFromUrl.codigo || inviteFromUrl.usuario) {
    invitationPanel.open = true;
    invitationForm.querySelector("input[name='codigo']").value = inviteFromUrl.codigo || "";
    invitationForm.querySelector("input[name='correo']").value = inviteFromUrl.usuario || "";
  }

  routeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      pendingLoginRoute = button.dataset.loginRoute || "/dashboard";
      form.querySelector("input[name='correo']")?.focus();
    });
  });

  contactButtons.forEach((button) => {
    button.addEventListener("click", () => {
      message.textContent = `Contacto: ${OWNER_CONTACT_EMAIL}`;
      modalRoot.querySelector("#login-contact-pill")?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const formData = Object.fromEntries(new FormData(form).entries());
    const correo = String(formData.correo || "").trim();
    const password = normalizePassword(formData.password);

    submitButton.disabled = true;
    submitButton.textContent = "...";
    message.textContent = "";

    let result = null;
    if (isBackendConfigured()) {
      result = await api.login({ correo, password });
      if (result.ok && result.data?.token) {
        submitButton.disabled = false;
        submitButton.textContent = "Login";
        openSession({
          token: result.data.token,
          expiresAt: result.data.venceEn,
          usuario: result.data.usuario,
        }, modalRoot, onAuthenticated);
        return;
      }
    }

    const localOwnerSession = await createLocalOwnerSession(correo, password);

    submitButton.disabled = false;
    submitButton.textContent = "Login";

    if (localOwnerSession) {
      openSession({
        ...localOwnerSession,
        backendFallback: isBackendConfigured(),
        backendMessage: result?.message || "",
      }, modalRoot, onAuthenticated);
      return;
    }

    message.textContent = result?.message || "Correo o clave incorrectos.";
  });

  invitationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = invitationForm.querySelector("button[type='submit']");
    const formData = Object.fromEntries(new FormData(invitationForm).entries());
    submitButton.disabled = true;
    submitButton.textContent = "...";
    invitationMessage.textContent = "";

    const result = await api.confirmInvitation({
      correo: String(formData.correo || "").trim(),
      codigo: String(formData.codigo || "").trim(),
      password: normalizePassword(formData.password),
      nombreCompleto: String(formData.nombreCompleto || "").trim(),
    });

    submitButton.disabled = false;
    submitButton.textContent = "Activar";

    if (result.ok && result.data?.token) {
      openSession({
        token: result.data.token,
        expiresAt: result.data.venceEn,
        usuario: result.data.usuario,
      }, modalRoot, onAuthenticated);
      return;
    }

    invitationMessage.textContent = result.message || "No fue posible activar la invitacion.";
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
  if (session?.usuario?.permisos?.includes("*")) return true;
  if (session?.usuario?.permisos?.includes(permission)) return true;
  return Boolean(session?.usuario?.accesos?.some((access) => {
    const permissions = String(access.permisos || "").split(",").map((item) => item.trim());
    return permissions.includes("*") || permissions.includes(permission);
  }));
}

function openSession(session, modalRoot, onAuthenticated) {
  saveSession(session);
  modalRoot.innerHTML = "";
  document.body.classList.remove("auth-locked");
  if (pendingLoginRoute) window.location.hash = `#${pendingLoginRoute}`;
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

function getInviteFromLocation() {
  const rawHash = window.location.hash || "";
  const query = rawHash.includes("?") ? rawHash.slice(rawHash.indexOf("?") + 1) : window.location.search.slice(1);
  const params = new URLSearchParams(query);
  return {
    codigo: params.get("codigo") || params.get("invite") || "",
    usuario: params.get("usuario") || params.get("correo") || "",
  };
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
