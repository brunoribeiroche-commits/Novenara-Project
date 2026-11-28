import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WORLD} from '../dist/world.mjs';
import {CINDER_ASSET,CINDER_FINAL_IDLE,CINDER_IDLE_OVERLAY,CINDER_SIZE,CINDER_DURATION} from '../dist/cinder-fist.mjs';
import {INK_WALK_ASSET,INK_SE_IDLE_ASSET,INK_CELL_WIDTH,INK_CELL_HEIGHT,INK_COLUMNS} from '../dist/courier-ink-walk.mjs';

test('the free-movement entry point ignores attempted movement and recasting until frame 13 ends',async()=>{
 const queue=[],events={},els=new Map(),draw=[];
 const ctx=new Proxy({drawImage:(img)=>draw.push(img.src)},{get:(o,p)=>o[p]??(()=>({addColorStop(){}}))});
 const make=()=>({events:{},dataset:{},style:{},clientWidth:950,clientHeight:640,tagName:'CANVAS',classList:{toggle(){}},
  addEventListener(n,f){this.events[n]=f;},setAttribute(){},append(){},querySelector(){return make();},focus(){},getContext(){return ctx;},
  getBoundingClientRect(){return{left:0,top:0,width:950,height:640};}});
 const get=id=>{if(!els.has(id))els.set(id,make());return els.get(id);};
 const dims={'assets/ferry-landing.png':[WORLD.w,WORLD.h],
  [INK_WALK_ASSET]:[INK_CELL_WIDTH*INK_COLUMNS,INK_CELL_HEIGHT*8],[INK_SE_IDLE_ASSET]:[412,1048],
  [CINDER_ASSET]:[CINDER_SIZE.width,CINDER_SIZE.height],[CINDER_FINAL_IDLE]:[192,256],[CINDER_IDLE_OVERLAY]:[192,256]};
 Object.assign(globalThis,{document:{querySelector:get,createElement:make,addEventListener(){}},
  window:{ResizeObserver:class{},devicePixelRatio:1,addEventListener:(n,f)=>events[n]=f},ResizeObserver:class{observe(){}},
  matchMedia:()=>({matches:false}),requestAnimationFrame:f=>queue.push(f),
  Image:class{set src(url){this.url=url;[this.width,this.height]=dims[url];this.naturalWidth=this.width;this.naturalHeight=this.height;queueMicrotask(()=>this.onload());}get src(){return this.url;}}});
 await import('../dist/game.mjs');await new Promise(resolve=>setImmediate(resolve));
 const scene=get('#world'),button=get('#cinder'),step=t=>queue.shift()(t);
 const key=k=>events.keydown({target:scene,key:k,preventDefault(){}});
 assert.equal(button.disabled,false);button.events.click();assert.equal(button.disabled,true);
 step(100);key('ArrowDown');scene.events.click({clientX:400,clientY:400});key('f');step(130);
 assert.equal(scene.dataset.cinderFrame,'1');
 for(let t=160;t<100+CINDER_DURATION;t+=30){key('ArrowLeft');step(t);}
 assert.equal(scene.dataset.cinderFrame,'13');
 assert.ok(draw.includes(CINDER_FINAL_IDLE));
 step(100+CINDER_DURATION+1);
 assert.equal(scene.dataset.cinderFrame,undefined);
 assert.equal(button.disabled,false);
 assert.equal(draw.at(-1),CINDER_IDLE_OVERLAY);
});
