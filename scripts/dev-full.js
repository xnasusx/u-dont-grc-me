import { spawn } from "node:child_process";

const processes = [
  spawn("node", ["server/api.js"], { stdio: "inherit", shell: true }),
  spawn("npm", ["run", "dev", "--", "--port", "5173"], { stdio: "inherit", shell: true }),
];

function stopAll(signal) {
  for (const child of processes) child.kill(signal);
  process.exit(signal === "SIGINT" ? 0 : 1);
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) stopAll("SIGTERM");
  });
}
