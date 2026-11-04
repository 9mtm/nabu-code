import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));const editor=path.join(root,'editor');
function install(dir,scripts=false){
 const args=['ci','--no-audit','--no-fund',...(!scripts?['--ignore-scripts']:[])];
 const env={...process.env,...(process.platform==='darwin'&&scripts?{npm_config_force_process_config:'true'}:{})};
 if(process.platform==='win32')execFileSync('cmd.exe',['/d','/s','/c','npm '+args.join(' ')],{cwd:path.join(editor,dir),env,stdio:'inherit'});
 else execFileSync('npm',args,{cwd:path.join(editor,dir),env,stdio:'inherit'});
}
install('');install('build');
const {dirs}=await import('../editor/build/npm/dirs.ts');
// Extensions keep their install scripts: the git extension's @vscode/fs-copyfile builds its native
// vscode_fs.node there, and without it Source Control fails to start (Code 1.0.0, 2026-11-04).
for(const dir of dirs.filter(d=>d.startsWith('extensions')&&!d.startsWith('extensions/copilot')&&fs.existsSync(path.join(editor,d,'package-lock.json'))))install(dir,true);
install('remote',true);
const {ensureElectronTypes}=await import('../editor/build/npm/electronTypes.ts');await ensureElectronTypes();
console.log('Locked editor build and Node server dependencies installed.');
