import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createDatabase, createControl, getControl, getGovernanceSnapshot, initializeDatabase, seedDatabase } from "./database.js";

const port = Number(process.env.PORT ?? 8787);
const dbPath = process.env.GRC_DB_PATH ?? join(process.cwd(), "data", "grc.db");
mkdirSync(dirname(dbPath), { recursive: true });

const db = createDatabase(dbPath);
initializeDatabase(db);
seedDatabase(db);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
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

function route(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  if (request.method === "OPTIONS") return sendJson(response, 204, {});
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, database: dbPath });
  }
  if (request.method === "GET" && url.pathname === "/api/governance") {
    return sendJson(response, 200, getGovernanceSnapshot(db));
  }
  const controlMatch = url.pathname.match(/^\/api\/controls\/([^/]+)$/);
  if (request.method === "GET" && controlMatch) {
    const control = getControl(db, decodeURIComponent(controlMatch[1]));
    return control ? sendJson(response, 200, control) : sendJson(response, 404, { error: "Control not found" });
  }
  if (request.method === "POST" && url.pathname === "/api/controls") {
    return readBody(request)
      .then((body) => sendJson(response, 201, createControl(db, body)))
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
