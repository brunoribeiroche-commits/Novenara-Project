import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {INK_WALK_ASSET,INK_SE_IDLE_ASSET,INK_WALK_DIRECTIONS,INK_COLUMNS,INK_CELL_WIDTH,INK_CELL_HEIGHT,INK_ANCHOR_X,INK_ANCHOR_Y,INK_BODY_PIXELS,inkWalkHeading,inkWalkFrame,inkWalkBounds,inkSeIdleBounds} from '../dist/courier-ink-walk.mjs';

test('all eight travel directions map to their own art; blocked motion preserves facing',()=>{
 const vectors=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
 assert.deepEqual(vectors.map(v=>inkWalkHeading(...v)),INK_WALK_DIRECTIONS);
 assert.equal(inkWalkHeading(0,0,'sw'),'sw');
 assert.deepEqual(INK_WALK_DIRECTIONS.map(d=>inkWalkFrame(d).sy),vectors.map((_,i)=>i*INK_CELL_HEIGHT));
});
test('idle is separate and the six stride frames loop at 540 ms',()=>{
 assert.equal(inkWalkFrame('e').sx,0);
 assert.deepEqual([0,90,180,270,360,450,539,540].map(ms=>inkWalkFrame('e',ms).sx/INK_CELL_WIDTH),[1,2,3,4,5,6,6,1]);
});
test('both assets keep the same contact point and apparent standing height',()=>{
 const body=74*1.57,x=101.7,y=193.2,pos=inkWalkBounds(x,y,body),k=body/INK_BODY_PIXELS;
 const idle=inkSeIdleBounds(x,y,body,412,1048);
 for(const [value,expected] of [[pos.x+INK_ANCHOR_X*k,x],[pos.y+INK_ANCHOR_Y*k,y],[idle.x+idle.w/2,x],[idle.y+idle.h,y],[idle.h,body]]){
  assert.ok(Math.abs(value-expected)<1e-9);
 }
});
test('checked-in runtime atlas and approved idle have the expected transparent formats',()=>{
 const atlas=readFileSync(new URL('../dist/'+INK_WALK_ASSET,import.meta.url));
 const idle=readFileSync(new URL('../dist/'+INK_SE_IDLE_ASSET,import.meta.url));
 assert.equal(atlas.toString('ascii',8,16),'WEBPVP8L');
 const header=atlas.readUInt32LE(21);
 assert.equal((header&0x3fff)+1,INK_CELL_WIDTH*INK_COLUMNS);
 assert.equal(((header>>>14)&0x3fff)+1,INK_CELL_HEIGHT*INK_WALK_DIRECTIONS.length);
 assert.equal((header>>>28)&1,1);
 assert.equal(idle.readUInt32BE(16),412);assert.equal(idle.readUInt32BE(20),1048);assert.equal(idle[25],6);
});
