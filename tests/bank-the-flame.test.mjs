import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BANK_RADIUS,BANK_DURATION,bankCel,nearestBankSource,emberPath,bankHeat,lampDarkening} from '../dist/bank-the-flame.mjs';
test('selects exactly one nearest lit source, including the boundary',()=>{
 const lamp=(x,lit=true)=>({ground:{x,y:0},lit});
 const edge=lamp(BANK_RADIUS),away=lamp(BANK_RADIUS+.01),unlit=lamp(2,false),near=lamp(10);
 assert.equal(nearestBankSource({x:0,y:0},[edge,near,away,unlit]),near);
 assert.equal(nearestBankSource({x:0,y:0},[edge,away,unlit]),edge);
 assert.equal(nearestBankSource({x:0,y:0},[away,unlit]),null);
});
test('transfer reaches the same palm from either side, then heat ends before the exact idle',()=>{
 for(const x of [-120,170]){
  const origin={x,y:10},palm={x:20,y:55};
  assert.deepEqual(emberPath(origin,palm,0),origin);
  assert.deepEqual(emberPath(origin,palm,1),palm);
  assert.ok(emberPath(origin,palm,.5).y<32.5);
 }
 assert.equal(bankCel(0),0);
 assert.equal(bankCel(BANK_DURATION-1),11);
 assert.equal(bankCel(BANK_DURATION),null);
 assert.equal(lampDarkening(410),0);assert.equal(lampDarkening(590),1);
 assert.equal(bankHeat(1000),1);assert.equal(bankHeat(1230),0);
});
