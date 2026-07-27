import { CONFIG } from "./config.js";
import { nowISO } from "./utils.js";

const DEFAULT_SESSION = {
  id: "superadmin-demo",
  nombre: "Superadministrador",
  correo: "superadmin@example.com",
  rol: "Superadmin",
  estado: "Activo",
  ultimoAcceso: nowISO(),
};

export function getSession() {
  try {
    const stored = localStorage.getItem(CONFIG.sessionKey);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(CONFIG.sessionKey, JSON.stringify(DEFAULT_SESSION));
  } catch {
    return DEFAULT_SESSION;
  }
  return DEFAULT_SESSION;
}

export function hasPermission(permission) {
  const session = getSession();
  if (session.rol === "Superadmin") return true;
  return Boolean(session.permisos?.includes(permission));
}

