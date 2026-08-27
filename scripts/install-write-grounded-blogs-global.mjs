import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const userHomeDirectory = os.homedir();
const skillName = "write-grounded-blogs";
const dryRun = process.argv.includes("--dry-run");

const canonicalDirectory = path.join(userHomeDirectory, ".agents", "skills", skillName);
const aliases = [
  { agent: "codex", path: path.join(userHomeDirectory, ".codex", "skills", skillName) },
  { agent: "claude", path: path.join(userHomeDirectory, ".claude", "skills", skillName) },
];
const bundledReferences = [
  {
    source: path.join(repositoryRoot, "docs", "blog-writing-automation-contract.md"),
    fileName: "blog-writing-automation-contract.md",
  },
  {
    source: path.join(repositoryRoot, "docs", "blog-agent-upload-runbook.md"),
    fileName: "blog-agent-upload-runbook.md",
  },
];

function pathExists(value) {
  try {
    fs.lstatSync(value);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function resolvedPath(value) {
  return pathExists(value) ? fs.realpathSync(value) : null;
}

function isCanonicalAlias(value) {
  return resolvedPath(value) === resolvedPath(canonicalDirectory);
}

function copySkill(source, destination) {
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: true,
    filter: (entry) => !entry.split(path.sep).includes("__pycache__"),
  });
}

function copyReferenceAtomically(source, destination) {
  const temporary = `${destination}.tmp-${process.pid}`;
  fs.copyFileSync(source, temporary);
  fs.renameSync(temporary, destination);
}

for (const reference of bundledReferences) {
  if (!pathExists(reference.source)) {
    throw new Error(`Required bundled reference is missing: ${reference.source}`);
  }
}

const initialSource = pathExists(canonicalDirectory)
  ? canonicalDirectory
  : aliases.map((entry) => entry.path).find((candidate) => pathExists(candidate));

if (!initialSource) {
  throw new Error("No existing write-grounded-blogs package was found to promote globally.");
}

const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupRoot = path.join(
  userHomeDirectory,
  ".local",
  "share",
  "agent-skill-backups",
  skillName,
  timestamp,
);
const actions = [];

if (!pathExists(canonicalDirectory)) {
  actions.push({ action: "create-canonical", from: initialSource, to: canonicalDirectory });
  if (!dryRun) {
    const canonicalParent = path.dirname(canonicalDirectory);
    fs.mkdirSync(canonicalParent, { recursive: true });
    const stagingRoot = fs.mkdtempSync(path.join(canonicalParent, `.${skillName}-stage-`));
    const stagedSkill = path.join(stagingRoot, skillName);
    copySkill(initialSource, stagedSkill);
    fs.mkdirSync(path.join(stagedSkill, "references"), { recursive: true });
    for (const reference of bundledReferences) {
      fs.copyFileSync(reference.source, path.join(stagedSkill, "references", reference.fileName));
    }
    fs.renameSync(stagedSkill, canonicalDirectory);
    fs.rmdirSync(stagingRoot);
  }
} else {
  actions.push({ action: "refresh-bundled-references", target: canonicalDirectory });
  if (!dryRun) {
    const referenceDirectory = path.join(canonicalDirectory, "references");
    fs.mkdirSync(referenceDirectory, { recursive: true });
    for (const reference of bundledReferences) {
      copyReferenceAtomically(reference.source, path.join(referenceDirectory, reference.fileName));
    }
  }
}

for (const alias of aliases) {
  if (pathExists(alias.path) && isCanonicalAlias(alias.path)) {
    actions.push({ action: "keep-alias", agent: alias.agent, path: alias.path });
    continue;
  }

  const backupPath = path.join(backupRoot, alias.agent);
  if (pathExists(alias.path)) {
    actions.push({ action: "backup", agent: alias.agent, from: alias.path, to: backupPath });
  }
  actions.push({ action: "link", agent: alias.agent, from: alias.path, to: canonicalDirectory });

  if (!dryRun) {
    fs.mkdirSync(path.dirname(alias.path), { recursive: true });
    if (pathExists(alias.path)) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.renameSync(alias.path, backupPath);
    }
    try {
      fs.symlinkSync(canonicalDirectory, alias.path, "dir");
    } catch (error) {
      if (pathExists(backupPath) && !pathExists(alias.path)) {
        fs.renameSync(backupPath, alias.path);
      }
      throw error;
    }
  }
}

console.log(JSON.stringify({
  dryRun,
  skill: skillName,
  canonicalDirectory,
  aliases: aliases.map((entry) => ({
    agent: entry.agent,
    path: entry.path,
    resolvesTo: resolvedPath(entry.path),
  })),
  actions,
}, null, 2));
