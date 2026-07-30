import test from "node:test";
import assert from "node:assert/strict";
import { handler } from "./lambda.js";

function event(method, path, body) {
  return {
    requestContext: { http: { method, path } },
    rawPath: path,
    headers: { origin: "https://d1oxsqx3ua8bb7.cloudfront.net" },
    body: body ? JSON.stringify(body) : undefined,
  };
}

test("lambda health route returns hosted API metadata", async () => {
  const response = await handler(event("GET", "/api/health"), {}, { getSnapshot: async () => ({ stats: { controls: 0 } }) });
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(body.runtime, "lambda");
});

test("lambda governance route returns the persisted snapshot", async () => {
  const snapshot = { stats: { controls: 12 }, controls: [{ id: "CTRL-PAM-001" }] };
  const response = await handler(event("GET", "/api/governance"), {}, { getSnapshot: async () => snapshot });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), snapshot);
});

test("lambda rejects public control writes unless enabled server-side", async () => {
  const response = await handler(event("POST", "/api/controls", { id: "CTRL-NEW-001" }), {}, { getSnapshot: async () => ({}) });

  assert.equal(response.statusCode, 405);
  assert.match(JSON.parse(response.body).error, /Hosted writes are disabled/);
});
