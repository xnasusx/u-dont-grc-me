import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  createDatabase,
  createControl,
  createFairSimulationRun,
  decideFairSimulationRun,
  getControl,
  getFairSettings,
  getGovernanceSnapshot,
  getScfControl,
  getScfCoverage,
  initializeDatabase,
  seedDatabase,
  updateControl,
  updateFairSetting,
} from "./database.js";

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = valueParts.join("=");
  }
}

loadLocalEnv();

const port = Number(process.env.PORT ?? 8787);
const dbPath = process.env.GRC_DB_PATH ?? join(process.cwd(), "data", "grc.db");
const allowedOrigin = process.env.GRC_ALLOWED_ORIGIN ?? "http://127.0.0.1:5173";
const defaultTenantId = process.env.GRC_TENANT_ID ?? "tenant-acme-us";
const writeToken = process.env.GRC_WRITE_TOKEN ?? process.env.VITE_GRC_WRITE_TOKEN ?? "";
mkdirSync(dirname(dbPath), { recursive: true });

const db = createDatabase(dbPath);
initializeDatabase(db);
seedDatabase(db);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,x-grc-actor,x-grc-tenant-id,x-grc-write-token",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function header(request, name) {
  return request.headers[name.toLowerCase()];
}

function writeContext(request) {
  const actor = header(request, "x-grc-actor") || "local-admin";
  const tenantId = header(request, "x-grc-tenant-id") || defaultTenantId;
  if (!writeToken) return { actor, tenantId, authMode: "local-dev-no-token" };

  const authorization = header(request, "authorization") ?? "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const headerToken = header(request, "x-grc-write-token") ?? "";
  if (bearer !== writeToken && headerToken !== writeToken) {
    const error = new Error("Write token is missing or invalid");
    error.statusCode = 401;
    throw error;
  }
  return { actor, tenantId, authMode: "bearer-token" };
}

function route(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  if (request.method === "OPTIONS") return sendJson(response, 204, {});
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, database: dbPath });
  }
  if (request.method === "GET" && url.pathname === "/api/governance") {
    return sendJson(response, 200, getGovernanceSnapshot(db));
  }
  if (request.method === "GET" && url.pathname === "/api/fair-settings") {
    return sendJson(response, 200, getFairSettings(db));
  }
  if (request.method === "GET" && url.pathname === "/api/scf/coverage") {
    return sendJson(response, 200, getScfCoverage(db));
  }
  const scfControlMatch = url.pathname.match(/^\/api\/scf\/controls\/([^/]+)$/);
  if (request.method === "GET" && scfControlMatch) {
    const control = getScfControl(db, decodeURIComponent(scfControlMatch[1]));
    return control
      ? sendJson(response, 200, control)
      : sendJson(response, 404, { error: "SCF control not found" });
  }
  const controlMatch = url.pathname.match(/^\/api\/controls\/([^/]+)$/);
  if (request.method === "GET" && controlMatch) {
    const control = getControl(db, decodeURIComponent(controlMatch[1]));
    return control ? sendJson(response, 200, control) : sendJson(response, 404, { error: "Control not found" });
  }
  if (request.method === "PATCH" && controlMatch) {
    const context = writeContext(request);
    return readBody(request)
      .then((body) => sendJson(response, 200, updateControl(db, decodeURIComponent(controlMatch[1]), body, context)))
      .catch((error) => sendJson(response, error.statusCode ?? 400, { error: error.message }));
  }
  const fairMatch = url.pathname.match(/^\/api\/fair-settings\/([^/]+)$/);
  if (request.method === "PUT" && fairMatch) {
    const context = writeContext(request);
    return readBody(request)
      .then((body) => sendJson(response, 200, updateFairSetting(db, decodeURIComponent(fairMatch[1]), body, context)))
      .catch((error) => sendJson(response, error.statusCode ?? 400, { error: error.message }));
  }
  const fairRunMatch = url.pathname.match(/^\/api\/fair-simulation-runs\/([^/]+)$/);
  if (request.method === "POST" && fairRunMatch) {
    const context = writeContext(request);
    return readBody(request)
      .then((body) => sendJson(response, 201, createFairSimulationRun(db, decodeURIComponent(fairRunMatch[1]), body, context)))
      .catch((error) => sendJson(response, error.statusCode ?? 400, { error: error.message }));
  }
  const fairRunDecisionMatch = url.pathname.match(/^\/api\/fair-simulation-runs\/([^/]+)\/decision$/);
  if (request.method === "PATCH" && fairRunDecisionMatch) {
    const context = writeContext(request);
    return readBody(request)
      .then((body) => sendJson(response, 200, decideFairSimulationRun(db, decodeURIComponent(fairRunDecisionMatch[1]), body, context)))
      .catch((error) => sendJson(response, error.statusCode ?? 400, { error: error.message }));
  }
  if (request.method === "POST" && url.pathname === "/api/controls") {
    const context = writeContext(request);
    return readBody(request)
      .then((body) => sendJson(response, 201, createControl(db, body, context)))
      .catch((error) => sendJson(response, error.statusCode ?? 400, { error: error.message }));
  }
  return sendJson(response, 404, { error: "Not found" });
}

const server = createServer((request, response) => {
  try {
    route(request, response);
  } catch (error) {
    sendJson(response, error.statusCode ?? 500, { error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`u dont GRC me API listening on http://127.0.0.1:${port}`);
});
