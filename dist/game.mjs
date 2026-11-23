import {WORLD,SPAWN,LANDMARKS,closestLandmark,pathTo,distance,moveWithin,faceFor,initialStory,objective,objectiveId,interact,isWalkable} from './world.mjs';

const $=s=>document.querySelector(s);
const canvas=$('#world'),stage=$('#stage'),ctx=canvas.getContext('2d');
const pins=$('#pins'),near=$('#near'),dialogue=$('#dialogue'),nextButton=$('#conversation-next'),restart=$('#restart');
const status=$('#status'),guide=$('#guide'),markerButton=$('#markers'),confirm=$('#restart-confirm');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(pointer: coarse)');
let art,atlas,meta,ready=false,markerMode=true;
let p={...SPAWN,facing:'north'}, camera={x:0,y:0,z:1}, width=0,height=0,pixelRatio=1,cameraReady=false;
let path=[], autoTarget=null, clickTarget=null, talked=null, story=initialStory();
let startedAt=0,walkTime=0,last=0, raf=0;
const keys=new Set(),buttonById=new Map();
const speed=205,diag=.7071067811865476;
function notify(s){status.textContent=s;}
function image(path){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Could not load '+path));i.src=path;});}
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
 if(!ready||talked||confirm.open){near.hidden=true;return;}
 const h=closestLandmark(p);near.hidden=!h;
 if(h){const action=h.id==='door'?(story.delivered?'Knock again':'Knock'):'Speak';near.lastElementChild.textContent=action+' · '+h.name;near.dataset.target=h.id;}
}
function cancelPath(){path=[];autoTarget=null;clickTarget=null;}
function walkTo(goal,id=null){
 if(!ready||talked||confirm.open)return;
 const h=id&&LANDMARKS.find(item=>item.id===id);
 if(h&&distance(p,h)<=h.range){openConversation(id);return;}
 const route=pathTo(p,goal,{maxSnap:id?18:4});
 if(!route.length){if(!id)return;notify('No clear path from here. Try walking onto the quay first.');return;}
 path=route;autoTarget=id;clickTarget=path.at(-1);if(id)notify('Walking to '+h.name+'.');
 if(!mobile.matches)canvas.focus({preventScroll:true});
}
function doNearest(){
 if(talked){advanceConversation();return;}
 const h=closestLandmark(p);
 if(h)openConversation(h.id);else notify('Walk closer to a landmark to interact.');
}
function openConversation(id){
 const h=LANDMARKS.find(target=>target.id===id);if(talked||!h||distance(p,h)>h.range+4)return;
 const found=interact(id,story);talked={lines:found.lines,state:found.state,index:0,h};
 keys.clear();cancelPath();dialogue.hidden=false;near.hidden=true;positionPins();
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
 if(clickTarget&&path.length&&markerMode){
  const [x,y]=project(clickTarget.x,clickTarget.y);
  ctx.save();ctx.strokeStyle='#fce5a4b5';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,6,3.5,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 const [x,y]=project(p.x,p.y),n=Math.min(1,Math.max(0,(p.y-245)/460)),scale=(1.57+n*.36)*z;
 ctx.save();ctx.fillStyle='#10140b72';ctx.beginPath();ctx.ellipse(x,y-1,20*z*(.82+.18*n),7*z,0,0,Math.PI*2);ctx.fill();ctx.restore();
 const column=walkTime>0?meta.walkColumns[Math.floor(walkTime/meta.frameMs)%meta.walkColumns.length]:meta.idleColumn;
 const row=meta.rows[p.facing];
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(atlas,column*meta.cell.width,row*meta.cell.height,meta.cell.width,meta.cell.height,Math.round(x-meta.anchor.x*scale),Math.round(y-meta.anchor.y*scale),Math.round(meta.cell.width*scale),Math.round(meta.cell.height*scale));
 positionPins();
}
function movement(dt){
 if(talked||confirm.open)return false;
 let deltaX=0,deltaY=0;
 const down=(...opts)=>opts.some(k=>keys.has(k));
 if(down('arrowleft','a'))deltaX--;
 if(down('arrowright','d'))deltaX++;
 if(down('arrowup','w'))deltaY--;
 if(down('arrowdown','s'))deltaY++;
 if(deltaX||deltaY){
  cancelPath();const factor=deltaX&&deltaY?diag:1;
  const ox=p.x,oy=p.y,next=moveWithin(p,deltaX*factor*speed*dt,deltaY*factor*speed*dt);
  Object.assign(p,next);p.facing=faceFor(p.x-ox,p.y-oy,faceFor(deltaX,deltaY,p.facing));
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
  p.facing=faceFor(dx,dy,p.facing);p.x=nx;p.y=ny;remaining-=amount;moved=true;
  if(d===amount)path.shift();
 }
 if(!path.length&&autoTarget){const chosen=autoTarget;autoTarget=null;openConversation(chosen);}
 return moved;
}
function frame(now){
 const dt=last?Math.min(.033,(now-last)/1000):0;last=now;
 if(movement(dt)){if(!startedAt)startedAt=now;walkTime=Math.max(1,now-startedAt);}else{startedAt=0;walkTime=0;}
 promptNear();draw(now);raf=requestAnimationFrame(frame);
}
canvas.addEventListener('click',e=>{
 if(!ready||talked)return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/camera.z+camera.x,y=(e.clientY-r.top)/camera.z+camera.y;
 walkTo({x,y});
});
near.addEventListener('click',()=>{if(!near.hidden)openConversation(near.dataset.target);});
guide.addEventListener('click',()=>{const h=LANDMARKS.find(x=>x.id===objectiveId(story));if(h)walkTo(h,h.id);});
markerButton.addEventListener('click',()=>toggleMarkers(!markerMode));
nextButton.addEventListener('click',advanceConversation);
const movementKeys=new Set(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d']);
window.addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if(!ready||confirm.open||e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('input, textarea, select, [contenteditable="true"]'))return;
 if(talked){
  if(key==='escape'){e.preventDefault();finishConversation();}
  else if(!e.repeat&&(key==='e'||((key==='enter'||key===' ')&&e.target!==nextButton))){e.preventDefault();advanceConversation();}
  return;
 }
 if(movementKeys.has(key)){e.preventDefault();keys.add(key);}
 if(key==='e'&&!e.repeat){e.preventDefault();doNearest();}
});
window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());});
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();cancelAnimationFrame(raf);}else if(ready){last=0;raf=requestAnimationFrame(frame);}});
restart.addEventListener('click',()=>{if(ready){keys.clear();confirm.showModal();}});
$('#cancel-restart').onclick=()=>confirm.close();
$('#yes-restart').onclick=()=>{
 confirm.close();story=initialStory();p={...SPAWN,facing:'north'};keys.clear();cancelPath();talked=null;dialogue.hidden=true;startedAt=walkTime=0;
 targetCamera(true);updateObjective();promptNear();canvas.focus({preventScroll:true});notify('Chapter restarted at the ferry.');
};
async function boot(){
 const loading=$('#loading');
 try{
  [art,atlas,meta]=await Promise.all([image('assets/ferry-landing.png'),image('assets/courier.png'),fetch('assets/courier.json',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw new Error('Courier sheet could not load.');return r.json();})]);
  if(art.width!==WORLD.w||art.height!==WORLD.h||meta.cell.width!==96||meta.cell.height!==96||atlas.width!==480||atlas.height!==384)throw new Error('The art or courier sheet is not the expected version.');
  createPins();ready=true;loading.hidden=true;guide.disabled=false;restart.disabled=false;resize();updateObjective();raf=requestAnimationFrame(frame);
 }catch(e){
  loading.querySelector('strong').textContent='The quay could not load.';
  const retry=document.createElement('button');retry.type='button';retry.className='light';retry.textContent='Reload';retry.onclick=()=>location.reload();loading.append(retry);console.error(e);
 }
}
if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);else addEventListener('resize',resize);
boot();
