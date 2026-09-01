import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const findings = [];
const patterns = [
  { label: "GA measurement ID", expression: /\bG-[A-Z0-9]{8,20}\b/g, allow: (value) => /^G-X+$/.test(value) },
  { label: "Google API key", expression: /\bAIza[0-9A-Za-z_-]{20,}\b/g },
  { label: "Google OAuth client ID", expression: /\b[0-9]+-[0-9A-Za-z_-]{20,}\.apps\.googleusercontent\.com\b/g },
  { label: "AWS access key", expression: /\bAKIA[0-9A-Z]{16}\b/g },
  { label: "GitHub token", expression: /\bgh[pousr]_[0-9A-Za-z]{20,}\b/g },
  { label: "OpenRouter key", expression: /\bsk-or-v1-[0-9A-Za-z]{20,}\b/g },
  { label: "private key", expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { label: "bearer token", expression: /\bBearer\s+[A-Za-z0-9._~-]{20,}\b/g },
];

for (const file of trackedFiles) {
  if (/^\.env(?:\.|$)/.test(file) && file !== ".env.example") {
    findings.push({ label: "tracked environment file", file, line: 1 });
    continue;
  }

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (content.includes("\0")) continue;

  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const pattern of patterns) {
      pattern.expression.lastIndex = 0;
      for (const match of line.matchAll(pattern.expression)) {
        if (pattern.allow?.(match[0])) continue;
        findings.push({ label: pattern.label, file, line: index + 1 });
      }
    }
  }
}

if (findings.length) {
  for (const finding of findings) {
    process.stderr.write(`${finding.label}: ${finding.file}:${finding.line}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(`Tracked credential audit passed (${trackedFiles.length} files, values redacted).\n`);
}
