'use strict';
const {createRequire}=require('node:module');
function limitedReader(read,limit=16){
 let active=0;const waiting=[];
 return async function(...args){
  await new Promise(resolve=>{const enter=()=>{active++;resolve();};if(active<limit)enter();else waiting.push(enter);});
  try{return await read.apply(this,args);}finally{active--;waiting.shift()?.();}
 };
}
// Packaging-only preload: retain the signer's full binary scan with bounded open files.
if(process.env.GIRRU_DESKTOP_PACKAGE){
 const desktop=createRequire(process.env.GIRRU_DESKTOP_PACKAGE);
 const signer=createRequire(desktop.resolve('@electron/osx-sign'));
 const detector=signer('isbinaryfile');
 detector.isBinaryFile=limitedReader(detector.isBinaryFile);
}
module.exports={limitedReader};
