import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CINDER_ASSET,CINDER_SIZE,CINDER_FRAMES,CINDER_DURATION,cinderCel,cinderBounds} from '../dist/cinder-fist.mjs';
test('prepared replacement Cinder atlas is pinned; all twelve cels retain scale and foot contact',async()=>{
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
 assert.equal(CINDER_FRAMES.length,12);
 assert.equal(t,CINDER_DURATION);assert.equal(cinderCel(t),null);
});

test('frame 1 south-idle proportion fit is applied to every cel without changing foot height',()=>{
 for(const frame of CINDER_FRAMES){
  const b=cinderBounds(96,230,210,frame);
  const sx=b.w/frame.sw,sy=b.h/frame.sh;
  assert.ok(Math.abs(sx-0.5648)<1e-10);
  assert.ok(Math.abs(sy-0.63255)<1e-10);
  assert.ok(Math.abs(b.x+frame.anchorX*sx-99.33)<1e-10);
  assert.ok(Math.abs(b.y+frame.anchorY*sy-230)<1e-10);
 }
});
