const {test}=require('node:test');const assert=require('node:assert/strict');
const {limitedReader}=require('../scripts/limit-signing-reads.cjs');
test('signing binary detection bounds open reads and preserves results',async()=>{
 let active=0,peak=0;
 const read=limitedReader(async value=>{active++;peak=Math.max(peak,active);await new Promise(resolve=>setImmediate(resolve));active--;return value%2===0;},4);
 const results=await Promise.all(Array.from({length:1000},(_,i)=>read(i)));
 assert.equal(peak,4);assert.deepEqual(results,Array.from({length:1000},(_,i)=>i%2===0));
});
test('a failed binary read releases its slot for the remaining scan',async()=>{
 const read=limitedReader(async value=>{if(value===0)throw Error('read failed');return value;},1);
 const results=await Promise.allSettled([read(0),read(1),read(2)]);
 assert.equal(results[0].status,'rejected');assert.deepEqual(results.slice(1).map(x=>x.value),[1,2]);
});
