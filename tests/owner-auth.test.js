import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const config = readFileSync(new URL("../apps-script/Config.gs", import.meta.url), "utf8");
const frontendAuth = readFileSync(new URL("../frontend/js/auth.js", import.meta.url), "utf8");

function getConfigValue(key) {
  const match = config.match(new RegExp(`${key}:\\s*(?:"([^"]+)"|(\\d+))`));
  return match?.[1] ?? match?.[2] ?? "";
}

test("mantiene fija la credencial propietaria por hash", () => {
  assert.equal(getConfigValue("OWNER_EMAIL_HASH"), "iODOB2w09LQRJL80hoD8rwJfi9oOHhOtczm+bW81nOw=");
  assert.equal(getConfigValue("OWNER_PASSWORD_SALT"), "control360-owner-2026-07-27-km7xQ9wT6pR2");
  assert.equal(getConfigValue("OWNER_PASSWORD_HASH"), "FyPmwfffrS/aJtEY8PcNNUp8ceHUjJxkCUqZyAoNyRo=");
  assert.equal(Number(getConfigValue("OWNER_PASSWORD_ROUNDS")), 2500);
});

test("no usa campos de propietario en texto visible", () => {
  assert.equal(/OWNER_EMAIL\s*:/.test(config), false);
  assert.equal(/OWNER_PASSWORD\s*:/.test(config), false);
});

test("frontend mantiene los mismos hashes fijos del propietario", () => {
  assert.match(frontendAuth, /OWNER_EMAIL_HASH = "iODOB2w09LQRJL80hoD8rwJfi9oOHhOtczm\+bW81nOw="/);
  assert.match(frontendAuth, /OWNER_PASSWORD_SALT = "control360-owner-2026-07-27-km7xQ9wT6pR2"/);
  assert.match(frontendAuth, /OWNER_PASSWORD_HASH = "FyPmwfffrS\/aJtEY8PcNNUp8ceHUjJxkCUqZyAoNyRo="/);
  assert.match(frontendAuth, /OWNER_PASSWORD_ROUNDS = 2500/);
});
