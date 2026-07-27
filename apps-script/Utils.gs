function ok_(data, message) {
  return {
    ok: true,
    data: data || {},
    message: message || "",
    errors: []
  };
}

function fail_(message, errors, data) {
  return {
    ok: false,
    data: data || {},
    message: message || "Solicitud inválida.",
    errors: errors || []
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function getParameter_(e, key) {
  return e && e.parameter ? e.parameter[key] : "";
}

function buildContext_(method, e, body) {
  var payload = body && (body.payload || body.data) ? (body.payload || body.data) : {};
  var token = String(
    body && body.sessionToken ? body.sessionToken :
      body && body.token ? body.token :
        payload && payload.token ? payload.token :
          getParameter_(e, "token") || ""
  ).trim();
  var context = {
    method: method,
    userEmail: getActiveUserEmail_(),
    token: token,
    session: null,
    user: null,
    sessionId: body.sessionId || getParameter_(e, "sessionId") || uuid_(),
    requestedAt: nowIso_()
  };

  if (!token) return context;

  try {
    var session = findActiveSessionByToken_(token);
    if (!session) return context;

    var expiresAt = new Date(session.venceEn);
    if (isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      updateRecordById_("Sesiones", session.id, {
        estado: "Vencida",
        ultimoAcceso: nowIso_()
      });
      return context;
    }

    var user = findUserByEmail_(session.correo);
    context.session = session;
    context.user = user || null;
    context.userEmail = session.correo || context.userEmail;
    context.sessionId = session.id || context.sessionId;
  } catch (error) {
    context.sessionError = String(error && error.message ? error.message : error);
  }

  return context;
}

function getActiveUserEmail_() {
  try {
    return Session.getActiveUser().getEmail() || "";
  } catch (error) {
    return "";
  }
}

function uuid_() {
  return Utilities.getUuid();
}

function nowIso_() {
  return new Date().toISOString();
}

function todayIso_() {
  return Utilities.formatDate(new Date(), CONTROL360_CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function toNumber_(value) {
  if (value === null || value === undefined || value === "") return 0;
  var parsed = Number(String(value).replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

function normalize_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sanitizeValue_(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value)
    .replace(/[<>]/g, "")
    .replace(/^[=+\-@]/, "'$&")
    .trim();
}

function sanitizeRecord_(record) {
  var sanitized = {};
  Object.keys(record || {}).forEach(function (key) {
    sanitized[key] = sanitizeValue_(record[key]);
  });
  return sanitized;
}

function requireFields_(record, fields) {
  var missing = [];
  fields.forEach(function (field) {
    if (record[field] === null || record[field] === undefined || String(record[field]).trim() === "") {
      missing.push(field);
    }
  });
  return missing;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function parseTags_(value) {
  if (Array.isArray(value)) return value.join(",");
  return String(value || "");
}

