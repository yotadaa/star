import { spawn } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const outputDir = path.join(import.meta.dirname, "benchmark");
const nextBin = path.join(root, "node_modules/next/dist/bin/next");
const node24 = String(process.env.NODE24_BINARY || "").trim();

const runtimes = [
  ...(node24 ? [{ label: "Configured Node 24 candidate", executable: node24, port: 4134 }] : []),
  { label: `Current runtime ${process.version}`, executable: process.execPath, port: 4136 },
];

function run(executable, args, options = {}) {
  return new Promise((resolve) => {
    const started = performance.now();
    const child = spawn(executable, args, {
      cwd: root,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let settled = false;
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk; });
    child.stderr?.on("data", (chunk) => { stderr += chunk; });
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      resolve({
        code: null,
        signal: null,
        elapsedMs: Math.round(performance.now() - started),
        stdout,
        stderr: `${stderr}${error.message}`,
      });
    });
    child.on("close", (code, signal) => {
      if (settled) return;
      settled = true;
      resolve({
        code,
        signal,
        elapsedMs: Math.round(performance.now() - started),
        stdout,
        stderr,
      });
    });
  });
}

async function serverProbe(executable, port) {
  const started = performance.now();
  const child = spawn(executable, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: root,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  let spawnError = null;
  child.stdout?.on("data", (chunk) => { stdout += chunk; });
  child.stderr?.on("data", (chunk) => { stderr += chunk; });
  child.once("error", (error) => { spawnError = error; });

  let response = null;
  let error = null;
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (spawnError || child.exitCode !== null) break;
    try {
      response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) break;
    } catch (caught) {
      error = caught.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const startupMs = response?.ok
    ? Math.round(performance.now() - started)
    : null;

  let rssKiB = null;
  try {
    const status = await readFile(`/proc/${child.pid}/status`, "utf8");
    const match = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
    rssKiB = match ? Number(match[1]) : null;
  } catch {}

  if (!spawnError) {
    child.kill("SIGTERM");
    await new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 5_000);
      child.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  return {
    ok: Boolean(response?.ok),
    status: response?.status ?? null,
    startupMs,
    rssKiB,
    lastError: response?.ok ? null : (spawnError?.message || error),
    stdout,
    stderr,
  };
}

await mkdir(outputDir, { recursive: true });
await access(nextBin);
for (const runtime of runtimes) {
  try {
    await access(runtime.executable);
  } catch {
    throw new Error(`Runtime executable is unavailable: ${runtime.executable}`);
  }
}
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const results = [];

for (const runtime of runtimes) {
  await rm(path.join(root, ".next"), { recursive: true, force: true });
  const version = await run(runtime.executable, ["--version"]);
  const build = await run(runtime.executable, [nextBin, "build"]);
  const server = build.code === 0
    ? await serverProbe(runtime.executable, runtime.port)
    : null;
  results.push({
    label: runtime.label,
    version: version.stdout.trim(),
    build: {
      exitCode: build.code,
      elapsedMs: build.elapsedMs,
      stdout: build.stdout,
      stderr: build.stderr,
    },
    server,
  });
}

const report = {
  capturedAt: new Date().toISOString(),
  platform: `${process.platform}-${process.arch}`,
  project: {
    next: packageJson.dependencies.next,
    react: packageJson.dependencies.react,
    convex: packageJson.dependencies.convex,
  },
  method: "One clean production build and one local production-server start per runtime; .next removed before each build. Startup is measured through the first successful GET /. RSS is a single Linux process snapshot. This is a compatibility probe, not a statistically stable performance benchmark.",
  results,
};

await writeFile(path.join(outputDir, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
for (const result of results) {
  const slug = result.version.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  await writeFile(path.join(outputDir, `${slug}.log`), `${result.build.stdout}\n${result.build.stderr}`);
}

console.log(JSON.stringify({
  capturedAt: report.capturedAt,
  results: results.map(({ label, version, build, server }) => ({
    label,
    version,
    buildExitCode: build.exitCode,
    buildElapsedMs: build.elapsedMs,
    serverOk: server?.ok ?? false,
    serverStatus: server?.status ?? null,
    startupMs: server?.startupMs ?? null,
    rssKiB: server?.rssKiB ?? null,
  })),
}, null, 2));
