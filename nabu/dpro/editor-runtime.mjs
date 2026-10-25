import { spawn as nodeSpawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, access, writeFile, chmod } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const protocolVersion = 1;
const defaultRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Runs the internal editor used by the Dpro desktop Code application. */
export function createEditorHost({ node, dataDir, onLog = () => {}, onExit = () => {}, spawn = nodeSpawn, readyTimeoutMs = 60000, runtimeRoot = defaultRoot }) {
	if (!path.isAbsolute(node || '') || !path.isAbsolute(dataDir || '') || !path.isAbsolute(runtimeRoot || '')) { throw new Error('Absolute runtime and data paths are required.'); }
	let child;
	let startPromise;
	let stopPromise;
	let stopping = false;
	let exited;
	const start = () => {
		if (stopping) { return Promise.reject(new Error('Editor host has stopped.')); }
		if (startPromise) { return startPromise; }
		startPromise = (async () => {
			const editor = path.join(runtimeRoot, 'editor');
			await access(path.join(editor, 'out/server-main.js'));
			await access(path.join(editor, 'remote/node_modules'));
			await mkdir(dataDir, { recursive: true, mode: 0o700 });
			const token = randomBytes(32).toString('base64url');
			const tokenFile = path.join(dataDir, 'connection-token');
			await writeFile(tokenFile, token, { mode: 0o600 });
			await chmod(tokenFile, 0o600);
			if (stopping) { throw new Error('Editor startup cancelled.'); }
			const env = {};
			for (const key of ['PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'LANG', 'LC_ALL', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot', 'SYSTEMROOT', 'ComSpec', 'PATHEXT', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA']) {
				if (typeof process.env[key] === 'string') { env[key] = process.env[key]; }
			}
			Object.assign(env, { NODE_ENV: 'development', VSCODE_DEV: '1', VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH: path.join(editor, 'remote/node_modules') });
			child = spawn(node, [path.join(editor, 'out/server-main.js'), '--host', '127.0.0.1', '--port', '0', '--connection-token-file', tokenFile, '--server-data-dir', path.join(dataDir, 'data'), '--disable-telemetry'], { cwd: editor, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
			exited = new Promise(resolve => {
				const complete = (code, signal) => resolve({ code, signal });
				child.once('exit', complete); child.once('close', complete);
			});
			return await new Promise((resolve, reject) => {
				let ready = false;
				let settled = false;
				const fail = () => {
					if (settled) { return; }
					settled = true; clearTimeout(timer);
					reject(new Error('The shared editor could not start.'));
				};
				const timer = setTimeout(() => { fail(); void stop(); }, readyTimeoutMs);
				child.once('error', fail);
				exited.then(result => { clearTimeout(timer); if (ready && !stopping) { onExit(result); } else if (!ready) { fail(); } });
				for (const stream of [child.stdout, child.stderr]) {
					let pending = '';
					stream.setEncoding('utf8');
					stream.on('data', chunk => {
						const lines = (pending + chunk).split(/\r?\n/); pending = lines.pop();
						for (const line of lines) {
							onLog(line.split(token).join('[redacted]'));
							const match = line.match(/Web UI available at (http:\/\/[^\s]+)/);
							if (!match || settled || stopping) { continue; }
							try {
								const address = new URL(match[1]);
								if (address.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(address.hostname) || !address.port || address.searchParams.get('tkn') !== token) { continue; }
								address.hostname = '127.0.0.1';
								ready = true; settled = true; clearTimeout(timer);
								resolve({ origin: address.origin, url: address.href });
							} catch { /* Ignore unrelated output. */ }
						}
					});
				}
			});
		})();
		return startPromise;
	};
	const stop = () => {
		if (stopPromise) { return stopPromise; }
		stopping = true;
		stopPromise = (async () => {
			if (!child || child.exitCode !== null || child.signalCode !== null) { return; }
			child.kill('SIGTERM');
			let timer;
			const graceful = await Promise.race([exited.then(() => true), new Promise(resolve => { timer = setTimeout(() => resolve(false), 5000); })]);
			clearTimeout(timer);
			if (!graceful) { child.kill('SIGKILL'); await exited; }
		})();
		return stopPromise;
	};
	return { start, stop, get pid() { return child?.pid; } };
}
