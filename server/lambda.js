import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedSnapshot = JSON.parse(readFileSync(join(__dirname, "governance-seed-snapshot.json"), "utf8"));

function response(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

async function createDynamoSnapshotStore() {
  const tableName = process.env.GOVERNANCE_TABLE_NAME;
  if (!tableName) {
    return {
      async getSnapshot() {
        return seedSnapshot;
      },
    };
  }

  const [{ DynamoDBClient }, { DynamoDBDocumentClient, GetCommand, PutCommand }] = await Promise.all([
    import("@aws-sdk/client-dynamodb"),
    import("@aws-sdk/lib-dynamodb"),
  ]);
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const key = {
    pk: process.env.GOVERNANCE_SNAPSHOT_PK ?? "TENANT#tenant-acme-us",
    sk: process.env.GOVERNANCE_SNAPSHOT_SK ?? "SNAPSHOT#governance",
  };

  return {
    async getSnapshot() {
      const result = await client.send(new GetCommand({ TableName: tableName, Key: key }));
      if (result.Item?.snapshot) return result.Item.snapshot;

      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            ...key,
            entity_type: "governance_snapshot",
            version: seedSnapshot.version ?? "0.5.0",
            updated_at: new Date().toISOString(),
            snapshot: seedSnapshot,
          },
          ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        }),
      );
      return seedSnapshot;
    },
  };
}

export async function handler(event, context, dependencies) {
  try {
    const method = event.requestContext?.http?.method ?? event.httpMethod ?? "GET";
    const path = event.rawPath ?? event.path ?? event.requestContext?.http?.path ?? "/";
    const store = dependencies?.getSnapshot ? dependencies : await createDynamoSnapshotStore();

    if (method === "OPTIONS") return response(204, {});
    if (method === "GET" && path === "/api/health") {
      return response(200, {
        ok: true,
        runtime: "lambda",
        database: process.env.GOVERNANCE_TABLE_NAME ? "dynamodb" : "seed-file",
        requestId: context?.awsRequestId,
      });
    }
    if (method === "GET" && path === "/api/governance") {
      return response(200, await store.getSnapshot());
    }
    if (method === "POST" && path === "/api/controls") {
      return response(405, { error: "Hosted writes are disabled until authenticated mutation workflows are enabled." });
    }
    return response(404, { error: "Not found" });
  } catch (error) {
    return response(500, { error: error instanceof Error ? error.message : "Unexpected hosted API error" });
  }
}
