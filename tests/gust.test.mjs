import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ART,CASTS,DIRECTIONS,DURATION,RELEASE,RECOVER,castFacing,castFrame,castBounds,gustWindBounds,windFrame,planBarrelHit,barrelSlide,barrelAt} from '../dist/gust.mjs';
import {GUST_BARREL_START,setGustBarrel,isWalkable,barrelCanOccupy,pathTo} from '../dist/world.mjs';

test('four cast atlases and all eight wind assets have the expected native dimensions',()=>{
 const dims=src=>{const b=readFileSync(new URL('../dist/'+src,import.meta.url));return [b.readUInt32BE(16),b.readUInt32BE(20)]};
 for(const a of Object.values(CASTS))assert.deepEqual(dims(a.asset),[a.w*12,256]);
 for(const a of Object.values(ART))assert.deepEqual(dims(a.asset),[a.size*a.cols,a.size*a.rows]);
 assert.deepEqual(Object.keys(ART),Object.keys(DIRECTIONS));
 assert.deepEqual(['ne','nw','se','sw'].map(castFacing),['e','w','e','w']);
});
test('held release and exact wind interval keep the palm locked',()=>{
 assert.equal(castFrame(0),0);assert.equal(castFrame(RELEASE-1),4);
 assert.equal(castFrame(RELEASE),5);assert.equal(castFrame(RECOVER-1),5);
 assert.equal(castFrame(RECOVER),6);assert.equal(castFrame(DURATION-1),11);
 for(const d of Object.keys(DIRECTIONS)){
  assert.equal(windFrame(d,RELEASE-1),null);assert.equal(windFrame(d,RELEASE).i,0);
  assert.equal(windFrame(d,RECOVER-1).i,d==='s'?11:5);assert.equal(windFrame(d,RECOVER),null);
 }
});
test('approved South alignment persists at any sprite scale',()=>{
 const feet={x:300,y:290};
 for(const body of [83,166]){
  const bounds=castBounds(feet,body,'s'), wind=gustWindBounds(feet,body,'s');
  assert.ok(Math.abs(wind.x+ART.s.pivot[0]*bounds.k-(bounds.x+154*bounds.k))<1e-8);
  assert.ok(Math.abs(wind.y+ART.s.pivot[1]*bounds.k-(bounds.y+118*bounds.k))<1e-8);
 }
});
test('near barrel is contacted sooner than far barrel; misses do not shove',()=>{
 for(const d of Object.keys(DIRECTIONS)){
  const [vx,vy]=DIRECTIONS[d], feet={x:270,y:270};
  const target=n=>({x:feet.x+vx*n,y:feet.y+vy*n});
  const close=planBarrelHit(feet,target(27),d), far=planBarrelHit(feet,target(d==='e'||d==='w'?90:d.length===2?75:55),d);
  assert.ok(close&&far,d);assert.ok(close.gap<far.gap&&close.at<far.at,d);
  assert.equal(planBarrelHit(feet,target(200),d),null);
  assert.equal(planBarrelHit(feet,target(-40),d),null);
  assert.equal(planBarrelHit(feet,{x:feet.x+35*vx+80*vy,y:feet.y+35*vy-80*vx},d),null);
 }
});
test('barrel lands on the last clear point and its footprint moves with it',()=>{
 const from={x:270,y:270},hit={vx:1,vy:0},stopAt=barrelSlide(from,hit,p=>p.x<300);
 assert.deepEqual(stopAt,{x:298,y:270});
 assert.deepEqual(barrelAt(from,stopAt,0),from);
 assert.deepEqual(barrelAt(from,stopAt,320),stopAt);
 assert.ok(barrelAt(from,stopAt,160).x<stopAt.x);
 const a={...GUST_BARREL_START}, b={x:a.x+62,y:a.y};
 assert.ok(barrelCanOccupy(a));assert.ok(barrelCanOccupy(b));assert.equal(isWalkable(a.x,a.y),false);
 try{
  setGustBarrel(b);
  assert.equal(isWalkable(a.x,a.y),true);
  assert.equal(isWalkable(b.x,b.y),false);
  assert.ok(pathTo({x:a.x-30,y:a.y},a).length);
 }finally{setGustBarrel(a);}
});
