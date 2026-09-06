import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { flattenObjects, DISCOVERY_IDS } from '../../components/scenic-hero/sceneState.mjs';
const requested=process.argv.slice(2);
const pages=requested.length?requested:await readdir('docs/plans/scenic-heroes/assets');
for(const page of pages) {
 const module=await import(pathToFileURL(path.resolve(`components/scenic-hero/scenes/${page}.js`)));
 const scene=module[`${page}Scene`];
 assert.ok(scene&&DISCOVERY_IDS.includes(scene.discoveryId));
 const objects=scene.layers.flatMap(layer=>flattenObjects(layer.objects));
 const ids=new Set(objects.map(o=>o.id));assert.equal(ids.size,objects.length,'Duplicate object ID');
 assert.ok(objects.filter(o=>o.motion).length<=12,'Animation budget');
 for(const object of objects){
  assert.ok(object.src||object.primitive,`${object.id}: no visual`);
  if(object.src){assert.ok(object.src.startsWith(`/scenic-heroes/${page}/`));assert.ok(object.width>0&&object.height>0);}
  if(object.reveal)assert.ok(objects.some(o=>o.id===object.reveal.action&&o.action),`${object.id}: missing action source`);
  if(object.action?.depth)assert.ok(scene.focus?.options.some(f=>f.id===object.action.depth));
 }
 console.log(JSON.stringify({page,objects:objects.length,animations:objects.filter(o=>o.motion).length,uniqueIds:ids.size}));
}
