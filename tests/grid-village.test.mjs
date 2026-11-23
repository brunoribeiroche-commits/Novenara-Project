import assert from 'node:assert/strict';
import {test} from 'node:test';
import {START,PLACES} from '../dist/grid/terrain.mjs';
import {path,flood,key,canStep,manhattan} from '../dist/grid/tiles.mjs';
test('every landmark is reachable from every other landmark and the ferry',()=>{
 const points=[START,...PLACES];
 for(const a of points)for(const b of points){
   const route=path(a,b); assert.notEqual(route,null);
   let prev=a;for(const tile of route){assert.equal(manhattan(prev,tile),1);assert.ok(canStep(tile));prev=tile;}
   assert.equal(key(prev),key(b));
 }
});
test('blocked water, scenery and off-map cells are not walkable',()=>{
 for(const t of [{x:4,y:13},{x:13,y:9},{x:22,y:11},{x:-1,y:12}])assert.equal(canStep(t),false);
});
test('a limited movement pass cannot exceed five steps',()=>{
 const start={x:18,y:10};
 const reachable=flood(start,5);assert.ok(reachable.size>20);
 for(const x of reachable.values())assert.ok(x.steps<=5);
 assert.equal(path(start,{x:10,y:10},5),null);
});
