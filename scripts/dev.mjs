import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The editor is an internal Dpro application; there is no standalone product launcher.
const root = fileURLToPath(new URL('../', import.meta.url));
const app = process.env.DPRO_DESKTOP_APP || path.resolve(root, '../agent_player/.local-runtime/Dpro Agent.app');
if (process.platform !== 'darwin') { throw new Error('Open Code from Apps in your Dpro desktop application.'); }
await access(app);
await new Promise((resolve, reject) => {
 const child = spawn('/usr/bin/open', ['-a', app], { stdio: 'inherit' });
 child.once('error', reject);
 child.once('exit', code => code === 0 ? resolve() : reject(new Error('Dpro could not open.')));
});
