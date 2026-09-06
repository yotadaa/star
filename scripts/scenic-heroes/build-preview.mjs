import { cp, mkdir, readdir, symlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
const root = process.cwd();
const destination = process.env.SCENIC_BUILD_DIR || path.join(os.tmpdir(), 'star-scenic-build');
const excluded = new Set(['.git', '.next', 'node_modules', 'validation', '.gitnexus', '.agents', '.claude']);
await mkdir(destination, { recursive: true });
for (const entry of await readdir(root)) {
 if (!excluded.has(entry)) await cp(path.join(root, entry), path.join(destination, entry), { recursive: true, force: true });
}
try { await symlink(path.join(root, 'node_modules'), path.join(destination, 'node_modules'), 'dir'); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
const build = spawn('npm', ['run', 'build'], { cwd: destination, stdio: 'inherit' });
process.exitCode = await new Promise((resolve, reject) => { build.on('error', reject); build.on('exit', code => resolve(code ?? 1)); });
if (!process.exitCode) console.log(`Validated production build: ${destination}`);
