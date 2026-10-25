import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdtemp, mkdir, readFile, stat, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createEditorHost } from '../nabu/dpro/editor-runtime.mjs';

async function fixture(t, output = 'valid') {
 const root = await mkdtemp(path.join(os.tmpdir(), 'dpro-editor-runtime-'));
 t.after(() => rm(root, { recursive: true, force: true }));
 await mkdir(path.join(root, 'editor/out'), { recursive: true });
 await mkdir(path.join(root, 'editor/remote/node_modules'), { recursive: true });
 await (await import('node:fs/promises')).writeFile(path.join(root, 'editor/out/server-main.js'), '');
 let child, launches = 0, kills = 0, args, env;
 const logs = [], exits = [];
 const spawn = (_node, argv, options) => {
  launches++; args = argv; env = options.env;
  child = new EventEmitter(); Object.assign(child, { stdout: new PassThrough(), stderr: new PassThrough(), exitCode: null, signalCode: null });
  child.kill = signal => { kills++; child.signalCode = signal; child.emit('exit', null, signal); child.emit('close', null, signal); };
  setImmediate(async () => {
   if (output === 'error') { child.emit('error', new Error('spawn failed')); child.emit('close', -2, null); return; }
   if (output === 'silent') return;
   const token = await readFile(argv[argv.indexOf('--connection-token-file') + 1], 'utf8');
   child.stdout.write(`Web UI available at http://${output === 'valid' ? 'localhost' : 'external.invalid'}:42630/?tkn=${token}\n`);
  });
  return child;
 };
 const host = createEditorHost({ node: process.execPath, runtimeRoot: root, dataDir: path.join(root, 'profile'), spawn, readyTimeoutMs: 500, onLog: line => logs.push(line), onExit: value => exits.push(value) });
 return { root, host, logs, exits, child: () => child, launches: () => launches, kills: () => kills, args: () => args, env: () => env };
}

test('runtime paths must be absolute', () => {
 assert.throws(() => createEditorHost({ node: 'node', dataDir: '/tmp/profile' }));
 assert.throws(() => createEditorHost({ node: process.execPath, dataDir: '/tmp/profile', runtimeRoot: 'relative' }));
});
test('startup is shared, loopback authenticated and secrets stay out of logs', async t => {
 const f = await fixture(t); const pending = f.host.start(); assert.equal(f.host.start(), pending);
 const result = await pending; assert.equal(result.origin, 'http://127.0.0.1:42630');
 const token = await readFile(path.join(f.root, 'profile/connection-token'), 'utf8');
 assert.equal(new URL(result.url).searchParams.get('tkn'), token);
 assert.equal(f.logs.some(line => line.includes(token)), false); assert.ok(f.logs.some(line => line.includes('[redacted]')));
 if (process.platform !== 'win32') assert.equal((await stat(path.join(f.root, 'profile/connection-token'))).mode & 0o777, 0o600);
 assert.equal(f.launches(), 1); assert.equal(f.args().includes('--disable-workspace-trust'), false);
 assert.equal(f.env().DPRO_NABU_ROOT, undefined); assert.equal(f.env().ELECTRON_RUN_AS_NODE, undefined);
 await f.host.stop(); await f.host.stop(); assert.equal(f.kills(), 1); assert.equal(f.exits.length, 0);
});
test('a matching token on an external host never satisfies readiness', async t => {
 const f = await fixture(t, 'external'); await assert.rejects(f.host.start()); await f.host.stop(); assert.equal(f.kills(), 1);
});
test('spawn errors followed by close without exit reject and terminate cleanly', async t => {
 const f = await fixture(t, 'error'); await assert.rejects(f.host.start()); await f.host.stop(); assert.equal(f.exits.length, 0);
});
test('stopping during startup rejects readiness and cannot be restarted', async t => {
 const f = await fixture(t, 'silent'); const pending = f.host.start();
 while (!f.child()) await new Promise(resolve => setImmediate(resolve));
 const rejected = assert.rejects(pending); await f.host.stop(); await rejected; await assert.rejects(f.host.start());
 assert.equal(f.kills(), 1);
});
test('unexpected exit reports once after successful readiness', async t => {
 const f = await fixture(t); await f.host.start(); const child = f.child(); child.exitCode = 1;
 child.emit('exit', 1, null); child.emit('close', 1, null); await new Promise(resolve => setImmediate(resolve));
 assert.equal(f.exits.length, 1); await f.host.stop(); assert.equal(f.kills(), 0);
});
