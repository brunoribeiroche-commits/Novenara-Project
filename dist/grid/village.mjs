import {CELL,COLS,ROWS,ORIGIN,MAP,START,PLACES} from './terrain.mjs';
import {canStep,canTraverse,center,coords,flood,routeFrom,path,facing,same,manhattan,cardinal,key} from './tiles.mjs';
import {initialStory,interact,objective,objectiveId} from '../world.mjs';

const $=s=>document.querySelector(s), canvas=$('#village'), stage=$('#village-stage'), ctx=canvas.getContext('2d');
const guide=$('#guide'), resetPass=$('#new-pass'), gridButton=$('#grid'), rangeButton=$('#range'), activeSoundlessMotion=matchMedia('(prefers-reduced-motion: reduce)');
const dialogue=$('#dialogue'), nearButton=$('#near'), nextButton=$('#next');
let ready=false,art,sprites,meta,width=0,height=0,dpr=1,cam={x:0,y:0,z:1},last=0,raf=0;
let tile={...START},face='east', tween=null,route=[], destination=null,pending=null,routeMark=null,story=initialStory(),talk=null;
let showGrid=false,range=false,budget=5,reachable=null,walkClock=0,hover=null;
const pinMap=new Map(),keys=new Map(),STEP_MS=185,BASE_BUDGET=5;
const moves={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]};
const getImage=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(Error('Could not load '+src));im.src=src;});
const announce=text=>{$('#status').textContent=text;};
const stand=()=>tween?.to??tile;
const currentFeet=()=>{if(!tween)return center(tile);const a=center(tween.from),b=center(tween.to),t=tween.elapsed/STEP_MS;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};};
function scaleWorld(){
 const cover=Math.max(width/MAP.width,height/MAP.height);
 return width<650?Math.max(cover,.56):cover;
}
function follow(snap=false){
 cam.z=scaleWorld();const feet=currentFeet();
 const x=Math.max(0,Math.min(MAP.width-width/cam.z,feet.x-width/cam.z*.47));
 const y=Math.max(0,Math.min(MAP.height-height/cam.z,feet.y-height/cam.z*.56));
 if(snap||activeSoundlessMotion.matches){cam.x=x;cam.y=y;}else{cam.x+=(x-cam.x)*.19;cam.y+=(y-cam.y)*.19;}
}
function resize(){
 width=canvas.clientWidth;height=canvas.clientHeight;if(!width||!height)return;
 dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
 const w=Math.round(width*dpr),h=Math.round(height*dpr);if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
 follow(true);if(ready)draw();
}
const project=(x,y)=>[(x-cam.x)*cam.z,(y-cam.y)*cam.z];
function getNear(p=tile){return PLACES.find(h=>manhattan(p,h)<=1)??null;}
function promptNearby(){
 const h=ready&&!tween&&!talk&&!range?getNear():null;
 nearButton.hidden=!h;if(h){nearButton.dataset.id=h.id;nearButton.lastElementChild.textContent=(h.id==='door'?'Knock':'Speak')+' · '+h.name;}
}
function shiftRange(v){
 route=[];destination=null;routeMark=null;keys.clear();
 if(tween){pending=()=>shiftRange(v);return;}
 range=v;budget=BASE_BUDGET;rebuildRange();showState();
 announce(v?'Movement range active. Five orthogonal steps available.':'Explore mode restored.');
}
function rebuildRange(){reachable=range?flood(stand(),budget):null;}
function showState(){
 const id=objectiveId(story),next=PLACES.find(h=>h.id===id);
 stage.classList.toggle('ranging',range);
 rangeButton.setAttribute('aria-pressed',String(range));rangeButton.lastElementChild.textContent=range?'Exit range':'Movement range';
 $('#map-card span').textContent=range?'◇':'01';
 $('#map-card strong').textContent=range?'Movement test':'Harbour district';
 $('#label').textContent=range?'TACTICAL MOVEMENT TEST':story.delivered?'DELIVERY COMPLETE':'COURIER’S NOTE';
 $('#goal').textContent=range?budget+' of '+BASE_BUDGET+' steps left':objective(story);
 $('#hint').textContent=range?(budget?'Tap a teal tile. Crates, railings and water stop the route.':'Start a new pass to try another route.'):story.delivered?'Keep exploring, or return to the house if you need a rest.':next?.hint??'';
 guide.hidden=range||!next;guide.disabled=!ready;resetPass.hidden=!range;
 for(const h of PLACES){
  const b=pinMap.get(h.id);if(!b)continue;
  b.classList.toggle('current',id===h.id);const done=({ticket:story.recorded,guard:story.cleared,vendor:story.vendor,door:story.delivered})[h.id];
  b.classList.toggle('done',done);b.querySelector('i').textContent=done?'✓':'◇';
 }
 promptNearby();placePins();
}
function makePins(){
 for(const h of PLACES){
  const b=document.createElement('button');b.type='button';b.className='pin';b.title=h.name;b.setAttribute('aria-label',h.name+': walk there then interact');
  const icon=document.createElement('i');icon.textContent='◇';icon.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='pin-label';label.textContent=h.name;
  b.append(icon,label);b.addEventListener('click',()=>walkTo(h,h.id));$('#pins').append(b);pinMap.set(h.id,b);
 }
}
function placePins(){
 for(const h of PLACES){
  const b=pinMap.get(h.id);if(!b)continue;
  const q=center({x:h.signX,y:h.signY}),[x,y]=project(q.x,q.y);b.hidden=Boolean(talk)||range||x<8||x>width-8||y<38||y>height;
  if(!b.hidden){const cap=h.id===objectiveId(story)?62:12;b.style.left=Math.max(cap,Math.min(width-cap,x))+'px';b.style.top=y+'px';}
 }
}
function startTalk(id){
 if(tween||talk||range)return;
 const h=PLACES.find(x=>x.id===id);if(!h||manhattan(tile,h)>1)return;
 const result=interact(id,story);talk={h,state:result.state,lines:result.lines,n:0};
 destination=null;route=[];routeMark=null;keys.clear();dialogue.hidden=false;
 $('#speaker').textContent=h.role;paintSpeech();promptNearby();placePins();nextButton.focus({preventScroll:true});
}
function paintSpeech(){
 $('#speech-step').textContent=(talk.n+1)+' / '+talk.lines.length;
 $('#speech-text').textContent=talk.lines[talk.n];nextButton.firstChild.nodeValue=talk.n+1===talk.lines.length?'Done ':'Continue ';
}
function finishTalk(){
 story=talk.state;talk=null;dialogue.hidden=true;showState();canvas.focus({preventScroll:true});
}
function advance(){if(!talk)return;if(++talk.n>=talk.lines.length)finishTalk();else paintSpeech();}
function walkTo(p,id=null){
 if(!ready||talk||pending)return;
 if(!canStep(p)){announce('That tile is blocked. Try the natural paving or dock.');
  return;}
 const from=stand(),r=range?routeFrom(flood(from,budget),p):path(from,p);
 if(r===null){announce(range?'That tile is beyond this movement pass.':'There is no walkable route to that tile.');return;}
 if(!r.length){if(id&&!tween)startTalk(id);return;}
 keys.clear();route=r;destination=range?null:id;routeMark=p;
}
function beginStep(to){
 if(!canTraverse(tile,to)||range&&!budget)return false;
 face=facing(tile,to,face);tween={from:tile,to,elapsed:0};if(range){budget--;rebuildRange();showState();}else promptNearby();return true;
}
function step(ms){
 if(talk)return;
 if(tween){
  tween.elapsed=Math.min(STEP_MS,tween.elapsed+ms);walkClock+=ms;
  if(tween.elapsed<STEP_MS)return;
  tile=tween.to;tween=null;rebuildRange();
  if(pending){const perform=pending;pending=null;perform();return;}
 }
 if(keys.size){
  const [dx,dy]=[...keys.values()].at(-1);route=[];destination=null;routeMark=null;const to={x:tile.x+dx,y:tile.y+dy};face=facing(tile,to,face);
  if(beginStep(to))return;
 }else if(route.length){if(beginStep(route.shift()))return;route=[];}
 if(destination){const id=destination;destination=null;startTalk(id);}
 routeMark=null;walkClock=0;promptNearby();
}
function paintTile(t,fill,stroke){
 const z=cam.z,[x,y]=project(ORIGIN.x+t.x*CELL,ORIGIN.y+t.y*CELL),n=CELL*z;if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,n,n);}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(n),Math.round(n));}
}
function draw(){
 if(!ready||!width||!height)return;
 follow();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);const z=cam.z;
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(art,-cam.x*z,-cam.y*z,MAP.width*z,MAP.height*z);
 if(showGrid||range){
  const x0=Math.max(0,Math.floor((cam.x-ORIGIN.x)/CELL)),y0=Math.max(0,Math.floor((cam.y-ORIGIN.y)/CELL));
  const x1=Math.min(COLS-1,Math.floor((cam.x+width/z-ORIGIN.x)/CELL)),y1=Math.min(ROWS-1,Math.floor((cam.y+height/z-ORIGIN.y)/CELL));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const t={x,y},pass=canStep(t),ok=reachable?.has(key(t));
   if(range&&ok)paintTile(t,'#75e6c457','#c5fbe0b0');
   else if(showGrid&&pass)paintTile(t,null,'#fff7dc52');
  }
 }
 if(routeMark)paintTile(routeMark,'#f4dc7c2e','#ffeb96ca');
 if(hover&&!talk&&canStep(hover)&&(!range||reachable?.has(key(hover))))paintTile(hover,null,range?'#dafdedcf':'#ffedbb8c');
 const f=currentFeet(),[x,y]=project(f.x,f.y),pixel=1.36*z,bob=tween?Math.sin(Math.PI*tween.elapsed/STEP_MS)*1.5*z:0;
 ctx.fillStyle='#18201485';ctx.beginPath();ctx.ellipse(x,y,14*z,5*z,0,0,Math.PI*2);ctx.fill();
 const c=tween&&!activeSoundlessMotion.matches?meta.walkColumns[Math.floor(walkClock/meta.frameMs)%meta.walkColumns.length]:meta.idleColumn,r=meta.rows[face];ctx.imageSmoothingEnabled=false;
 ctx.drawImage(sprites,c*meta.cell.width,r*meta.cell.height,meta.cell.width,meta.cell.height,Math.round(x-meta.anchor.x*pixel),Math.round(y-meta.anchor.y*pixel-bob),Math.round(meta.cell.width*pixel),Math.round(meta.cell.height*pixel));
 placePins();
}
function run(now){const dt=last?Math.min(34,now-last):0;last=now;step(dt);draw();raf=requestAnimationFrame(run);}
function tileAt(e){const c=canvas.getBoundingClientRect();return coords((e.clientX-c.left)/cam.z+cam.x,(e.clientY-c.top)/cam.z+cam.y);}
canvas.addEventListener('click',e=>walkTo(tileAt(e)));
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')hover=tileAt(e);});
canvas.addEventListener('pointerleave',()=>{hover=null;});
guide.addEventListener('click',()=>{const p=PLACES.find(x=>x.id===objectiveId(story));if(p)walkTo(p,p.id);});
nearButton.addEventListener('click',()=>startTalk(nearButton.dataset.id));nextButton.addEventListener('click',advance);
gridButton.addEventListener('click',()=>{showGrid=!showGrid;gridButton.setAttribute('aria-pressed',String(showGrid));gridButton.lastElementChild.textContent=showGrid?'Grid on':'Grid off';announce(showGrid?'Tile grid shown.':'Tile grid hidden.');});
rangeButton.addEventListener('click',()=>{if(ready&&!talk)shiftRange(!range);});
resetPass.addEventListener('click',()=>{if(ready&&!talk)shiftRange(true);});
$('#restart').addEventListener('click',()=>{
 if(!ready)return;
 story=initialStory();talk=null;dialogue.hidden=true;route=[];destination=null;pending=null;routeMark=null;keys.clear();tile={...START};face='east';tween=null;walkClock=0;range=false;budget=BASE_BUDGET;rebuildRange();follow(true);showState();
 announce('You’re back at the ferry dock.');
});
window.addEventListener('keydown',e=>{
 if(!ready||e.metaKey||e.altKey||e.ctrlKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(talk){
  if(k==='Escape'){e.preventDefault();finishTalk();}
  else if(!e.repeat&&(k==='e'||((k==='Enter'||k===' ')&&e.target!==nextButton))){e.preventDefault();advance();}
  return;
 }
 if(k==='e'&&!e.repeat){e.preventDefault();const h=getNear();if(h)startTalk(h.id);else announce('Walk next to a landmark to speak.');return;}
 if(Object.hasOwn(moves,k)){e.preventDefault();if(!keys.has(k)){keys.set(k,moves[k]);route=[];destination=null;routeMark=null;if(!tween)step(0);}}
});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();cancelAnimationFrame(raf);}else if(ready){last=0;raf=requestAnimationFrame(run);}});
async function boot(){
 try{
  [art,sprites,meta]=await Promise.all([getImage('village.png'),getImage('../assets/courier.png'),fetch('../assets/courier.json').then(r=>{if(!r.ok)throw Error('Could not load courier data');return r.json();})]);
  if(art.width!==MAP.width||art.height!==MAP.height||sprites.width!==480||sprites.height!==384||meta.cell.width!==96||meta.cell.height!==96)throw Error('The art and collision grid do not match.');
  makePins();ready=true;$('#loading').hidden=true;resize();showState();raf=requestAnimationFrame(run);
 }catch(err){$('#loading strong').textContent='The village could not load.';const retry=document.createElement('button');retry.type='button';retry.textContent='Reload';retry.className='light';retry.onclick=()=>location.reload();$('#loading').append(retry);console.error(err);}
}
if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);else addEventListener('resize',resize);
boot();
