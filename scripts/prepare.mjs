import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const editor = path.join(root, 'editor');
const patch = async (file, marker, from, to) => {
 const target = path.join(editor, file);
 const source = await readFile(target, 'utf8');
 if (source.includes(marker)) return;
 if (!source.includes(from)) throw new Error(`Editor source no longer matches ${file}`);
 await writeFile(target, source.replace(from, to));
};
// Keep imported editor paths relative to their nested source checkout.
await patch('build/next/build-fast.ts', "['diff', '--relative', '--name-only'", "['diff', '--name-only', '-z', '--no-renames', 'HEAD', '--', ...BUILD_SCOPES]", "['diff', '--relative', '--name-only', '-z', '--no-renames', 'HEAD', '--', ...BUILD_SCOPES]");
await patch('build/next/build-fast.ts', "'--no-renames', '--relative', savedHead", "'--no-renames', savedHead, currentHead", "'--no-renames', '--relative', savedHead, currentHead");
await patch('src/vs/server/node/webClientServer.ts', "'chat.disableAIFeatures': true", '\t\tconst workbenchWebConfiguration = {', `\t\tconst workbenchWebConfiguration = {
   configurationDefaults: {
    'chat.disableAIFeatures': true,
    'workbench.secondarySideBar.defaultVisibility': 'hidden',
    'workbench.startupEditor': 'none',
    'telemetry.telemetryLevel': 'off'
   },`);
const defaults = { nameShort: 'Nabu Code', nameLong: 'Nabu Code', applicationName: 'nabu-code', enableTelemetry: false };
await writeFile(path.join(editor, 'product.overrides.json'), JSON.stringify(defaults, null, '\t')+'\n');
console.log('Prepared the internal Dpro editor web runtime.');
