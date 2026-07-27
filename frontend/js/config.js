export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzDRErOe09jRa5vV4VUFmvr5a39BBPZoX-dC77-gcNzQbDVL9qEUBQgMPDFm2UXERsE/exec";

export const CONFIG = {
  appName: "CONTROL360",
  defaultCurrency: "USD",
  timezone: "America/Guayaquil",
  locale: "es-EC",
  appsScriptUrl: APPS_SCRIPT_URL,
  storageKey: "control360:v1:state",
  sessionKey: "control360:v1:session",
};

export function isBackendConfigured() {
  return Boolean(APPS_SCRIPT_URL && APPS_SCRIPT_URL.trim().endsWith("/exec"));
}
