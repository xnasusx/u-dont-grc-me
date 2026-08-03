/**
 * Push server/governance-seed-snapshot.json into the hosted DynamoDB table.
 *
 * Why this exists: server/lambda.js seeds the table with
 * `ConditionExpression: attribute_not_exists(pk) AND attribute_not_exists(sk)`,
 * so it only ever writes the bundled snapshot when no item is there. Once an
 * item exists the Lambda returns it forever, and redeploying the function with a
 * newer bundle changes nothing. That is how the hosted snapshot drifted far
 * enough behind the schema to blank the deployed site. This script overwrites
 * unconditionally, which is the only way to move a table that already has a row.
 *
 * Credentials come from the standard AWS chain and are never read here. In CI
 * they arrive from a short-lived OIDC role assumption; nothing is stored.
 *
 * Run: npm run push:snapshot            (writes)
 *      npm run push:snapshot -- --dry-run   (compares only)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_FILE = join(ROOT, "server", "governance-seed-snapshot.json");

const tableName = process.env.GOVERNANCE_TABLE_NAME ?? "u-dont-grc-me-governance";
const region = process.env.AWS_REGION ?? "us-east-1";
const key = {
  pk: process.env.GOVERNANCE_SNAPSHOT_PK ?? "TENANT#tenant-acme-us",
  sk: process.env.GOVERNANCE_SNAPSHOT_SK ?? "SNAPSHOT#governance",
};
const dryRun = process.argv.includes("--dry-run");

/** DynamoDB rejects any item over 400KB, so fail loudly rather than at write time. */
const MAX_ITEM_BYTES = 400 * 1024;

function collectionSummary(snapshot) {
  return Object.entries(snapshot)
    .filter(([, value]) => Array.isArray(value))
    .map(([name, value]) => `${name}=${value.length}`)
    .sort()
    .join(" ");
}

async function main() {
  const raw = readFileSync(SNAPSHOT_FILE, "utf8");
  const snapshot = JSON.parse(raw);

  const bytes = Buffer.byteLength(raw, "utf8");
  console.log(`  local snapshot  ${(bytes / 1024).toFixed(1)}KB  ${collectionSummary(snapshot)}`);
  if (bytes > MAX_ITEM_BYTES) {
    throw new Error(
      `Snapshot is ${(bytes / 1024).toFixed(1)}KB, over the 400KB DynamoDB item limit. ` +
        "Split the snapshot across items before pushing.",
    );
  }

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

  const existing = await client.send(new GetCommand({ TableName: tableName, Key: key }));
  if (existing.Item?.snapshot) {
    console.log(
      `  remote snapshot ${String(existing.Item.updated_at ?? "unknown date")}  ` +
        collectionSummary(existing.Item.snapshot),
    );
  } else {
    console.log("  remote snapshot none - table has no item at this key yet");
  }

  if (dryRun) {
    console.log("  --dry-run: nothing written");
    return;
  }

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        ...key,
        entity_type: "governance_snapshot",
        version: snapshot.version ?? "0.10.0",
        updated_at: new Date().toISOString(),
        snapshot,
      },
    }),
  );

  console.log(`  wrote ${tableName} ${key.pk} / ${key.sk} in ${region}`);
}

main().catch((error) => {
  console.error(`  ! push:snapshot failed: ${error.message}`);
  process.exitCode = 1;
});
