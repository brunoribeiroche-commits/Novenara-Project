import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CINDER_ASSET,CINDER_FINAL_IDLE,CINDER_IDLE_OVERLAY,CINDER_SIZE,CINDER_FRAMES,CINDER_DURATION,cinderCel,cinderBounds} from '../dist/cinder-fist.mjs';
test('prepared replacement Cinder atlas is pinned; all thirteen frames retain foot contact',async()=>{
 const png=await readFile(new URL('../dist/'+CINDER_ASSET,import.meta.url));
 assert.equal(createHash('sha256').update(png).digest('hex'),'9598e3d337bdf750264ff96a51dc5194b8979a7686fe338e4a74db8b7f684683');
 assert.equal(png.toString('ascii',8,16),'WEBPVP8L');
 const packed=png.readUInt32LE(21);
 assert.equal((packed&0x3fff)+1,CINDER_SIZE.width);assert.equal(((packed>>>14)&0x3fff)+1,CINDER_SIZE.height);
 let t=0;
 for(const [i,frame] of CINDER_FRAMES.entries()){
  assert.equal(cinderCel(t).index,i);
  assert.equal(cinderCel(t+frame.ms-1).index,i);t+=frame.ms;
  const b=cinderBounds(300,400,83,frame);
  assert.ok(Math.abs(b.y+(b.h/frame.sh)*frame.anchorY-400)<1e-6);
 }
 assert.equal(CINDER_FRAMES.length,13);
 assert.equal(t,CINDER_DURATION);assert.equal(cinderCel(t),null);
});

test('frame 1 south-idle proportion fit is applied to the original twelve cels without changing foot height',()=>{
 for(const frame of CINDER_FRAMES.slice(0,12)){
  const b=cinderBounds(96,230,210,frame);
  const sx=b.w/frame.sw,sy=b.h/frame.sh;
  assert.ok(Math.abs(sx-0.5648)<1e-10);
  assert.ok(Math.abs(sy-0.63255)<1e-10);
  assert.ok(Math.abs(b.x+frame.anchorX*sx-99.33)<1e-10);
  assert.ok(Math.abs(b.y+frame.anchorY*sy-230)<1e-10);
 }
});

test('frame thirteen and its overlay use the exact approved artwork at native idle alignment',async()=>{
 const f=cinderCel(CINDER_DURATION-1);
 assert.equal(f.index,12);assert.equal(f.kind,'front-idle');
 assert.deepEqual(cinderBounds(96,230,210,f),{x:0,y:0,w:192,h:256});
 for(const [p,sha] of [
  [CINDER_FINAL_IDLE,'55dbcb2b1aa0ad93dfc8bafe835dc328456839c67d06f7daae804a8b6a56dc93'],
  [CINDER_IDLE_OVERLAY,'d3b7d2ee14f3dec1fd38f4d34b514b3ecf0c3bec204faf82168515721b8f372a']
 ]){
  const png=await readFile(new URL('../dist/'+p,import.meta.url));
  assert.equal(createHash('sha256').update(png).digest('hex'),sha);
  assert.equal(png.readUInt32BE(16),f.sw);assert.equal(png.readUInt32BE(20),f.sh);
 }
});
