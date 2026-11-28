import {BANK_RADIUS,BANK_ART,BANK_DARK_LAMP,BANK_W,BANK_H,BANK_CELS,BANK_DURATION,nearestBankSource,bankCel,bankPalm,bankHeat,lampDarkening,paintBankTransfer} from './bank-the-flame.mjs';
import {EMBER_MS,emberAnchor,SE_IDLE_EMBER,EAST_IDLE_SPILL,paintEmber} from './cinder-ember.mjs';
import {CINDER_ASSET,CINDER_SIZE,CINDER_DURATION,CINDER_FINAL_IDLE,CINDER_IDLE_OVERLAY,cinderCel,cinderBounds} from './cinder-fist.mjs';
import {INK_WALK_ASSET,INK_SE_IDLE_ASSET,INK_CELL_WIDTH,INK_CELL_HEIGHT,INK_COLUMNS,INK_WALK_DIRECTIONS,inkWalkFrame,inkWalkBounds,inkSeIdleBounds,inkWalkHeading} from './courier-ink-walk.mjs';
import {WORLD,SPAWN,LANDMARKS,closestLandmark,pathTo,distance,moveWithin,initialStory,objective,objectiveId,interact,isWalkable} from './world.mjs';

const $=s=>document.querySelector(s);
const canvas=$('#world'),stage=$('#stage'),ctx=canvas.getContext('2d');
const pins=$('#pins'),near=$('#near'),dialogue=$('#dialogue'),nextButton=$('#conversation-next'),restart=$('#restart');
const status=$('#status'),guide=$('#guide'),markerButton=$('#markers'),confirm=$('#restart-confirm');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(pointer: coarse)');
const cinderButton=$('#cinder'),bankButton=$('#bank');
const flameSources=[
 {id:'ticket-lantern',ground:{x:590,y:510},wick:{x:589,y:282},glass:{x:558,y:238,col:0},lit:true},
 {id:'market-lantern',ground:{x:1320,y:535},wick:{x:1330,y:371},glass:{x:1290,y:315,col:1},lit:true}
];
let bankArt=null,bankGlass=null,bankCast=null,rangeUntil=0;
let cinderArt=null,cinderFinal=null,cinderOverlay=null,cinderTime=null,emberStarted=null;
const castingSkill=()=>cinderTime!==null||bankCast!==null;
let art,atlas,inkIdle,ready=false,markerMode=true;
let p={...SPAWN,facing:'n'}, camera={x:0,y:0,z:1}, width=0,height=0,pixelRatio=1,cameraReady=false;
let path=[], autoTarget=null, clickTarget=null, talked=null, story=initialStory();
let startedAt=0,walkTime=0,last=0, raf=0;
const keys=new Set(),buttonById=new Map();
const speed=205,diag=.7071067811865476;
function notify(s){status.textContent=s;}
function image(path){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Could not load '+path));i.src=path;});}
function castCinder(){
 if(castingSkill()||!ready||!cinderArt||talked||confirm.open)return;
 keys.clear();cancelPath();cinderTime=0;emberStarted=null;
 refreshSkills();
 notify('Casting Cinder Fist.');
}
function refreshSkills(){
 cinderButton.disabled=!cinderArt||castingSkill();
 bankButton.disabled=!bankArt||castingSkill();
}
function castBank(){
 if(!ready||!bankArt||!bankGlass||talked||confirm.open||castingSkill())return;
 const source=nearestBankSource(p,flameSources);
 if(!source){
  rangeUntil=last+1350;
  notify(flameSources.some(f=>f.lit)?'No lit flame in range. Move closer to a lantern.':'Both lanterns are out. Restart the scene to try again.');
  return;
 }
 rangeUntil=0;keys.clear();cancelPath();bankCast={source,time:0};refreshSkills();
 notify('Bank the Flame: drawing from the nearest lit source.');
}
function pixelScale(){
 const fit=Math.max(width/WORLD.w,height/WORLD.h);
 return Math.max(fit,width<640?Math.min(.78, Math.max(.52,height/760)):fit);
}
function targetCamera(force=false){
 camera.z=pixelScale();
 const x=Math.max(0,Math.min(WORLD.w-width/camera.z,p.x-width/camera.z*.48));
 const y=Math.max(0,Math.min(WORLD.h-height/camera.z,p.y-height/camera.z*.61));
 if(force||!cameraReady||reduced.matches){camera.x=x;camera.y=y;cameraReady=true;return;}
 camera.x+=(x-camera.x)*.14;camera.y+=(y-camera.y)*.14;
}
function resize(){
 width=canvas.clientWidth;height=canvas.clientHeight;if(!width||!height)return;
 pixelRatio=Math.min(2, Math.max(1,window.devicePixelRatio||1));
 const w=Math.round(width*pixelRatio),h=Math.round(height*pixelRatio);
 if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
 targetCamera(true);if(ready)draw(performance.now());
}
const project=(x,y)=>[(x-camera.x)*camera.z,(y-camera.y)*camera.z];
function toggleMarkers(v){
 markerMode=v;markerButton.setAttribute('aria-pressed',String(v));$('#marker-caption').textContent=v?'Markers on':'Markers off';positionPins();
}
function doneFor(id){return ({ticket:story.recorded,guard:story.cleared,vendor:story.vendor,door:story.delivered})[id];}
function updateObjective(){
 $('#objective').textContent=objective(story);
 $('#journal-label').textContent=story.delivered?'DELIVERY COMPLETE':'COURIER’S NOTE';
 const id=objectiveId(story);
 $('#hint').textContent=story.delivered?'You can keep exploring, or go back to the house if you need a rest.':LANDMARKS.find(h=>h.id===id)?.hint??'';
 guide.hidden=!id;guide.disabled=!ready;
 for(const h of LANDMARKS){
  const b=buttonById.get(h.id);if(!b)continue;b.classList.toggle('current',h.id===id);b.classList.toggle('done',doneFor(h.id));b.querySelector('i').textContent=doneFor(h.id)?'✓':'◇';
 }
 positionPins();
}
function positionPins(){
 for(const h of LANDMARKS){
  const b=buttonById.get(h.id);if(!b)continue;const [x,y]=project(h.signX,h.signY);
  b.hidden=!markerMode||Boolean(talked)||x<17||x>width-17||y<38||y>height;
  if(!b.hidden){b.style.left=Math.max(h.id===objectiveId(story)?62:18,Math.min(width-(h.id===objectiveId(story)?62:18),x))+'px';b.style.top=y+'px';}
 }
}
function createPins(){
 for(const h of LANDMARKS){
  const b=document.createElement('button');b.className='pin';b.type='button';b.setAttribute('aria-label',h.name+': walk there and interact');b.title=h.name;
  const icon=document.createElement('i');icon.textContent='◇';icon.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='pin-label';label.textContent=h.name;b.append(icon,label);
  b.addEventListener('click',()=>walkTo(h,h.id));pins.append(b);buttonById.set(h.id,b);
 }
}
function promptNear(){
 if(castingSkill()||!ready||talked||confirm.open){near.hidden=true;return;}
 const h=closestLandmark(p);near.hidden=!h;
 if(h){const action=h.id==='door'?(story.delivered?'Knock again':'Knock'):'Speak';near.lastElementChild.textContent=action+' · '+h.name;near.dataset.target=h.id;}
}
function cancelPath(){path=[];autoTarget=null;clickTarget=null;}
function walkTo(goal,id=null){
 if(castingSkill()||!ready||talked||confirm.open)return;
 const h=id&&LANDMARKS.find(item=>item.id===id);
 if(h&&distance(p,h)<=h.range){openConversation(id);return;}
 const route=pathTo(p,goal,{maxSnap:id?18:4});
 if(!route.length){if(!id)return;notify('No clear path from here. Try walking onto the quay first.');return;}
 cinderTime=null;path=route;autoTarget=id;clickTarget=path.at(-1);if(id)notify('Walking to '+h.name+'.');
 if(!mobile.matches)canvas.focus({preventScroll:true});
}
function doNearest(){
 if(talked){advanceConversation();return;}
 const h=closestLandmark(p);
 if(h)openConversation(h.id);else notify('Walk closer to a landmark to interact.');
}
function openConversation(id){
 const h=LANDMARKS.find(target=>target.id===id);if(castingSkill()||talked||!h||distance(p,h)>h.range+4)return;
 const found=interact(id,story);talked={lines:found.lines,state:found.state,index:0,h};
 cinderTime=null;keys.clear();cancelPath();dialogue.hidden=false;near.hidden=true;positionPins();
 $('#speaker').textContent=h.role;paintSpeech();nextButton.focus({preventScroll:true});
}
function paintSpeech(){
 $('#speech-step').textContent=(talked.index+1)+' / '+talked.lines.length;
 $('#speech-text').textContent=talked.lines[talked.index];
 nextButton.firstChild.nodeValue=(talked.index===talked.lines.length-1?'Done ':'Continue ');
}
function finishConversation(){
 if(!talked)return;
 story=talked.state;talked=null;dialogue.hidden=true;updateObjective();promptNear();canvas.focus({preventScroll:true});
}
function advanceConversation(){if(!talked)return;talked.index++;if(talked.index>=talked.lines.length)finishConversation();else paintSpeech();}
function draw(now){
 if(!ready||!width||!height)return;
 targetCamera();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.clearRect(0,0,width,height);
 const z=camera.z;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(art,0,0,art.width,art.height,-camera.x*z,-camera.y*z,WORLD.w*z,WORLD.h*z);
 if(bankGlass)for(const source of flameSources){
  const darkness=!source.lit?1:bankCast?.source===source?lampDarkening(bankCast.time):0;
  if(darkness<=0)continue;
  const {x,y,col}=source.glass,pos=project(x,y);
  ctx.save();ctx.globalAlpha=darkness;ctx.drawImage(bankGlass,col*64,0,64,72,pos[0],pos[1],64*z,72*z);ctx.restore();
 }
 if(rangeUntil>now){
  const [x,y]=project(p.x,p.y);
  ctx.save();ctx.globalAlpha=Math.min(1,(rangeUntil-now)/350)*.6;
  ctx.strokeStyle='#FCC75F';ctx.lineWidth=2;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.arc(x,y,BANK_RADIUS*z,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 if(clickTarget&&path.length&&markerMode){
  const [x,y]=project(clickTarget.x,clickTarget.y);
  ctx.save();ctx.strokeStyle='#fce5a4b5';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,6,3.5,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 const [x,y]=project(p.x,p.y),n=Math.min(1,Math.max(0,(p.y-245)/460)),scale=(1.57+n*.36)*z;
 ctx.save();ctx.fillStyle='#10140b72';ctx.beginPath();ctx.ellipse(x,y-1,20*z*(.82+.18*n),7*z,0,0,Math.PI*2);ctx.fill();ctx.restore();
 // Keep the V4 standing height on this map. The dock playtest has its own scale.
 const body=74*scale,clock=walkTime>0&&!reduced.matches?walkTime:null;
 // The cast is front-facing artwork, not a change to locomotion facing.
 if(!bankCast)delete canvas.dataset.bankFrame;
 const cast=cinderTime===null?null:cinderCel(reduced.matches?CINDER_DURATION-1:cinderTime);
 if(cast)canvas.dataset.cinderFrame=String(cast.index+1);
 else delete canvas.dataset.cinderFrame;
 if(bankCast&&bankArt){
  const i=bankCel(bankCast.time),pos=inkWalkBounds(x,y,body);
  canvas.dataset.bankFrame=String(i+1);
  const heat=bankHeat(bankCast.time);
  ctx.save();if(heat&&!reduced.matches){ctx.shadowBlur=14*z;ctx.shadowColor='rgba(208,62,26,'+(.78*heat)+')';}
  ctx.drawImage(bankArt,i*BANK_W,0,BANK_W,BANK_H,pos.x,pos.y,pos.w,pos.h);ctx.restore();
  const [wx,wy]=project(bankCast.source.wick.x,bankCast.source.wick.y);
  paintBankTransfer(ctx,{x:wx,y:wy},bankPalm(pos,6),bankPalm(pos,i),bankCast.time,body,reduced.matches);
 }else if(cast&&cinderArt){
  const pos=cinderBounds(x,y,body,cast);
  ctx.drawImage(cast.kind==='front-idle'?cinderFinal:cinderArt,cast.sx,cast.sy,cast.sw,cast.sh,pos.x,pos.y,pos.w,pos.h);
 }else if(clock===null&&p.facing==='se'){
  const pos=inkSeIdleBounds(x,y,body,inkIdle.naturalWidth,inkIdle.naturalHeight);
  ctx.drawImage(inkIdle,pos.x,pos.y,pos.w,pos.h);
  if(!talked)paintEmber(ctx,cinderOverlay,pos,SE_IDLE_EMBER,body,now,emberStarted);
 }else{
  const {sx,sy}=inkWalkFrame(p.facing,clock),pos=inkWalkBounds(x,y,body);
  const a=talked?null:p.facing==='e'&&clock===null?EAST_IDLE_SPILL:emberAnchor(sx,sy);
  const shimmer=clock===null&&!reduced.matches&&['s','e','n','w'].includes(p.facing);
  if(a&&a.visibility<1)paintEmber(ctx,cinderOverlay,pos,a,body,now,emberStarted,shimmer);
  ctx.drawImage(atlas,sx,sy,INK_CELL_WIDTH,INK_CELL_HEIGHT,pos.x,pos.y,pos.w,pos.h);
  if(a?.visibility===1)paintEmber(ctx,cinderOverlay,pos,a,body,now,emberStarted,shimmer);
 }
 positionPins();
}
function movement(dt){
 if(castingSkill()||talked||confirm.open)return false;
 let deltaX=0,deltaY=0;
 const down=(...opts)=>opts.some(k=>keys.has(k));
 if(down('arrowleft','a'))deltaX--;
 if(down('arrowright','d'))deltaX++;
 if(down('arrowup','w'))deltaY--;
 if(down('arrowdown','s'))deltaY++;
 if(deltaX||deltaY){
  cancelPath();const factor=deltaX&&deltaY?diag:1;
  const ox=p.x,oy=p.y,next=moveWithin(p,deltaX*factor*speed*dt,deltaY*factor*speed*dt);
  Object.assign(p,next);p.facing=inkWalkHeading(p.x-ox,p.y-oy,p.facing);
  return Math.hypot(p.x-ox,p.y-oy)>.01;
 }
 if(!path.length)return false;
 let remaining=speed*dt,moved=false;
 while(path.length&&remaining>0){
  const q=path[0],d=distance(p,q);
  if(d<.1){path.shift();continue;}
  const dx=q.x-p.x,dy=q.y-p.y,amount=Math.min(remaining,d);
  const nx=p.x+dx*amount/d,ny=p.y+dy*amount/d;
  if(!isWalkable(nx,ny)){cancelPath();break;}
  p.facing=inkWalkHeading(dx,dy,p.facing);p.x=nx;p.y=ny;remaining-=amount;moved=true;
  if(d===amount)path.shift();
 }
 if(!path.length&&autoTarget){const chosen=autoTarget;autoTarget=null;openConversation(chosen);}
 return moved;
}
function frame(now){
 const dt=last?Math.min(.033,(now-last)/1000):0;last=now;
 if(cinderTime!==null){
  cinderTime+=dt*1000;
  if(cinderTime>=CINDER_DURATION){
   cinderTime=null;emberStarted=now;refreshSkills();
   notify('Cinder Fist is lit for 10 seconds.');
  }
 }
 if(bankCast){
  bankCast.time+=dt*1000;
  if(bankCast.time>=BANK_DURATION){
   bankCast.source.lit=false;bankCast=null;refreshSkills();
   notify('Flame banked. The source has gone dark.');
  }
 }
 if(emberStarted!==null&&now-emberStarted>=EMBER_MS)emberStarted=null;
 if(movement(dt)){if(!startedAt)startedAt=now;walkTime=Math.max(1,now-startedAt);}else{startedAt=0;walkTime=0;}
 promptNear();draw(now);raf=requestAnimationFrame(frame);
}
canvas.addEventListener('click',e=>{
 if(castingSkill()||!ready||talked)return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/camera.z+camera.x,y=(e.clientY-r.top)/camera.z+camera.y;
 walkTo({x,y});
});
cinderButton.addEventListener('click',castCinder);
bankButton.addEventListener('click',castBank);
near.addEventListener('click',()=>{if(!near.hidden)openConversation(near.dataset.target);});
guide.addEventListener('click',()=>{const h=LANDMARKS.find(x=>x.id===objectiveId(story));if(h)walkTo(h,h.id);});
markerButton.addEventListener('click',()=>toggleMarkers(!markerMode));
nextButton.addEventListener('click',advanceConversation);
const movementKeys=new Set(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d']);
window.addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if(!ready||confirm.open||e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('input, textarea, select, [contenteditable="true"]'))return;
 if(castingSkill()&&(movementKeys.has(key)||key==='f'||key==='e'||key==='b')){e.preventDefault();return;}
 if(talked){
  if(key==='escape'){e.preventDefault();finishConversation();}
  else if(!e.repeat&&(key==='e'||((key==='enter'||key===' ')&&e.target!==nextButton))){e.preventDefault();advanceConversation();}
  return;
 }
 if(key==='b'&&!e.repeat){e.preventDefault();castBank();return;}
 if(key==='f'&&!e.repeat){e.preventDefault();castCinder();return;}
 if(movementKeys.has(key)){e.preventDefault();keys.add(key);}
 if(key==='e'&&!e.repeat){e.preventDefault();doNearest();}
});
window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());});
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();cancelAnimationFrame(raf);}else if(ready){last=0;raf=requestAnimationFrame(frame);}});
restart.addEventListener('click',()=>{if(ready&&!castingSkill()){keys.clear();confirm.showModal();}});
$('#cancel-restart').onclick=()=>confirm.close();
$('#yes-restart').onclick=()=>{
 confirm.close();emberStarted=null;bankCast=null;rangeUntil=0;for(const source of flameSources)source.lit=true;refreshSkills();story=initialStory();p={...SPAWN,facing:'n'};keys.clear();cancelPath();talked=null;dialogue.hidden=true;startedAt=walkTime=0;
 targetCamera(true);updateObjective();promptNear();canvas.focus({preventScroll:true});notify('Chapter restarted at the ferry.');
};
async function boot(){
 const loading=$('#loading');
 try{
  [art,atlas,inkIdle]=await Promise.all([image('assets/ferry-landing.png'),image(INK_WALK_ASSET),image(INK_SE_IDLE_ASSET)]);
  if(art.width!==WORLD.w||art.height!==WORLD.h||atlas.width!==INK_CELL_WIDTH*INK_COLUMNS||atlas.height!==INK_CELL_HEIGHT*INK_WALK_DIRECTIONS.length||inkIdle.width!==412||inkIdle.height!==1048)throw new Error('The art or courier sheet is not the expected version.');
  Promise.all([image(CINDER_ASSET),image(CINDER_FINAL_IDLE),image(CINDER_IDLE_OVERLAY)]).then(([sprite,finalIdle,overlay])=>{
   if(sprite.naturalWidth!==CINDER_SIZE.width||sprite.naturalHeight!==CINDER_SIZE.height||
    [finalIdle,overlay].some(img=>img.naturalWidth!==INK_CELL_WIDTH||img.naturalHeight!==INK_CELL_HEIGHT))throw new Error('Unexpected Cinder Fist sheet size.');
   cinderArt=sprite;cinderFinal=finalIdle;cinderOverlay=overlay;refreshSkills();
  }).catch(console.warn);
  Promise.all([image(BANK_ART),image(BANK_DARK_LAMP)]).then(([courier,glass])=>{
   if(courier.naturalWidth!==BANK_W*BANK_CELS||courier.naturalHeight!==BANK_H||
    glass.naturalWidth!==128||glass.naturalHeight!==72)throw new Error('Unexpected Bank the Flame artwork size.');
   bankArt=courier;bankGlass=glass;refreshSkills();
  }).catch(console.warn);
  createPins();ready=true;loading.hidden=true;guide.disabled=false;restart.disabled=false;resize();updateObjective();raf=requestAnimationFrame(frame);
 }catch(e){
  loading.querySelector('strong').textContent='The quay could not load.';
  const retry=document.createElement('button');retry.type='button';retry.className='light';retry.textContent='Reload';retry.onclick=()=>location.reload();loading.append(retry);console.error(e);
 }
}
if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);else addEventListener('resize',resize);
boot();
