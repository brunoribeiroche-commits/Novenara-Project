import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emberOpacity,emberShimmer,emberAnchor,paintEmber,EAST_IDLE_SPILL,SE_IDLE_EMBER} from '../dist/cinder-ember.mjs';
import {inkWalkFrame} from '../dist/courier-ink-walk.mjs';
test('ember stays lit for ten seconds from completion and fades only at the end',()=>{
 assert.equal(emberOpacity(1000,null),0);
 assert.equal(emberOpacity(999,1000),0);
 assert.equal(emberOpacity(1000,1000),1);
 assert.equal(emberOpacity(10500,1000),1);
 assert.equal(emberOpacity(10750,1000),.5);
 assert.equal(emberOpacity(11000,1000),0);
});
test('glow follows the chosen front walk cel and omits an occluded hand',()=>{
 const anchor=(face,ms=null)=>{const {sx,sy}=inkWalkFrame(face,ms);return emberAnchor(sx,sy);};
 assert.notDeepEqual(anchor('s'),anchor('s',0));
 assert.notDeepEqual(anchor('s',0),anchor('s',360));
 assert.deepEqual(anchor('s',0),anchor('s',540));
 assert.equal(anchor('n',270),null);
 assert.equal(anchor('e'),null);
 assert.equal(SE_IDLE_EMBER.visibility,1);
});
test('all eight walking rows have a left-hand overlay if that hand is visible',()=>{
 for(const dir of ['s','se','e','ne','n','nw','w','sw']){
  const visible=Array.from({length:7},(_,i)=>inkWalkFrame(dir,i===0?null:(i-1)*90)).map(({sx,sy})=>emberAnchor(sx,sy)).filter(Boolean);
  assert.ok(visible.length>0);
  assert.ok(visible.every(({u,v})=>u>0&&u<1&&v>0&&v<1));
 }
});
test('front idle draws the approved overlay pixel-aligned with the base and never after expiry',()=>{
 const traced=[];
 const ctx={save(){},restore(){},translate:(...p)=>traced.push(p),scale:(...p)=>traced.push(p),drawImage:(...p)=>traced.push(p)};
 const bounds={x:50,y:80,w:96,h:128},sprite={name:'approved overlay'};
 const a=emberAnchor(0,0);
 assert.equal(paintEmber(ctx,sprite,bounds,a,105,105,100),true);
 assert.equal(paintEmber(ctx,sprite,bounds,a,105,10100,100),false);
 assert.deepEqual(traced,[[114.5,156],[.5,.5],[sprite,-129,-152,192,256]]);
});

test('NE far hand and the second on-sheet West pose use the corrected anchors',()=>{
 const a=(dir,walk)=>{const {sx,sy}=inkWalkFrame(dir,(walk-1)*90);return emberAnchor(sx,sy);};
 for(const [walk,x] of [[1,55],[2,56],[3,61],[5,54],[6,132]])assert.equal(a('ne',walk).u*192,x);
 assert.equal(a('ne',4),null);
 assert.equal(a('w',1).u*192,136);
 assert.equal(a('w',2).u*192,71);
});

test('idle shimmer begins at the authored scale and varies subtly without moving the hand anchor',()=>{
 assert.deepEqual(emberShimmer(0,true),{alpha:1,height:1});
 assert.deepEqual(emberShimmer(127,false),{alpha:1,height:1});
 assert.notDeepEqual(emberShimmer(127,true),emberShimmer(0,true));
 for(let t=0;t<10000;t+=21){
  const {alpha,height}=emberShimmer(t,true);
  assert.ok(alpha>=.85&&alpha<=1.15&&height>=.925&&height<=1.075);
 }
 assert.ok(EAST_IDLE_SPILL.spill&&EAST_IDLE_SPILL.visibility<1);
});
