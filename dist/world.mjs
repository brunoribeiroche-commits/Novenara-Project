export const WORLD={w:1672,h:941};
export const SPAWN={x:438,y:753};
export const WALK_ZONES=[
 // The exposed ferry deck passes onto the stone steps at the left of the quay.
 [[381,770],[420,747],[442,714],[435,678],[464,644],[498,653],[517,682],[478,721],[477,756],[442,782],[392,801]],
 // Main quay: stay behind the front bollards and in front of the building wall.
 [[426,530],[499,505],[580,500],[665,483],[733,461],[802,459],[867,443],[933,424],[1012,393],[1072,365],[1124,343],[1177,324],[1243,307],[1290,307],[1302,342],[1285,382],[1243,412],[1200,438],[1186,460],[1211,478],[1237,508],[1282,536],[1346,545],[1449,553],[1494,563],[1530,580],[1504,608],[1413,628],[1318,639],[1203,654],[1099,654],[994,635],[883,644],[761,630],[713,652],[670,678],[609,697],[532,693],[463,681],[414,663],[438,600],[453,559]],
 // Steps, landing, and front door above the quay.
 [[1109,365],[1092,343],[1129,323],[1139,303],[1123,271],[1109,250],[1118,235],[1173,230],[1205,242],[1223,268],[1249,300],[1258,321],[1221,346],[1161,365]],
 // The shallow strip in front of the vendor. Counter and awning remain solid.
 [[1220,519],[1280,523],[1336,531],[1412,540],[1493,552],[1519,574],[1479,613],[1370,630],[1276,621],[1221,581],[1206,552]]
];
export const GUST_BARREL_START=Object.freeze({x:805,y:566});
export const GUST_BARREL_FOOTPRINT=Object.freeze({halfW:23,halfD:15});
let gustBarrel={...GUST_BARREL_START};
// Refresh the click-to-walk mesh only when the push finishes or the scene resets.
export function setGustBarrel(p){gustBarrel={...p};mesh=null;}
const BLOCKERS=[
 {x:482,y:504,rx:22,ry:11}, // uniformed guard
 {x:853,y:450,rx:24,ry:12}, // ticket office customer
 {x:1146,y:607,rx:27,ry:13}, // shopper with wide basket
 {x:1266,y:527,rx:20,ry:10}, // customer beside the stall
 {x:712,y:637,rx:17,ry:12},{x:853,y:644,rx:17,ry:11}, // bollards
 {x:910,y:417,rx:18,ry:13}, // pot at foot of stone wall
];
export const LANDMARKS=[
 {id:'ticket',name:'Ticket office',hint:'Check in with the ticket clerk after coming ashore.',x:751,y:479,signX:747,signY:389,range:64,role:'Ticket clerk'},
 {id:'guard',name:'Harbour guard',hint:'Show the landing slip.',x:485,y:534,signX:491,signY:403,range:59,role:'Harbour guard'},
 {id:'vendor',name:'Market stall',hint:'Find out what the change means for the market.',x:1380,y:568,signX:1415,signY:499,range:82,role:'Market vendor'},
 {id:'door',name:'Recipient’s door',hint:'Take the stairs and deliver the parcel.',x:1138,y:249,signX:1136,signY:209,range:51,role:'Recipient'}
];
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function pointInPolygon(x,y,vertices){
 let inside=false;
 for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
  const [xi,yi]=vertices[i],[xj,yj]=vertices[j];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}
function pointAllowed(x,y){
 return WALK_ZONES.some(p=>pointInPolygon(x,y,p))&&!BLOCKERS.some(o=>((x-o.x)/o.rx)**2+((y-o.y)/o.ry)**2<1);
}
export function barrelCanOccupy(p){
 const {halfW:w,halfD:d}=GUST_BARREL_FOOTPRINT;
 return [-w,0,w].every(dx=>[-d,0,d].every(dy=>pointAllowed(p.x+dx,p.y+dy)));
}
export function isWalkable(x,y,r=5){
 const {halfW:w,halfD:d}=GUST_BARREL_FOOTPRINT;
 if(Math.abs(x-gustBarrel.x)<w+r&&Math.abs(y-gustBarrel.y)<d+r)return false;
 return Number.isFinite(x)&&Number.isFinite(y)&&pointAllowed(x,y)&&pointAllowed(x-r,y)&&pointAllowed(x+r,y)&&pointAllowed(x,y-r)&&pointAllowed(x,y+r);
}
export function moveWithin(p,dx,dy){
 if(isWalkable(p.x+dx,p.y+dy))return {x:p.x+dx,y:p.y+dy};
 let x=p.x,y=p.y;if(isWalkable(x+dx,y))x+=dx;if(isWalkable(x,y+dy))y+=dy;
 return {x,y};
}
export const DIRECTIONS=['south','west','east','north'];
export function faceFor(dx,dy,previous='south'){
 if(Math.hypot(dx,dy)<.001)return previous;
 return Math.abs(dx)>Math.abs(dy)*1.12?(dx<0?'west':'east'):(dy<0?'north':'south');
}
const GRID=10, COLS=Math.ceil(WORLD.w/GRID), ROWS=Math.ceil(WORLD.h/GRID);
const gridPoint=i=>({x:(i%COLS)*GRID+GRID/2,y:Math.floor(i/COLS)*GRID+GRID/2});
let mesh;
function getMesh(){
 if(!mesh)mesh=Uint8Array.from({length:COLS*ROWS},(_,i)=>{const p=gridPoint(i);return isWalkable(p.x,p.y)?1:0;});
 return mesh;
}
export function clearSegment(a,b){
 const steps=Math.max(1,Math.ceil(distance(a,b)/3.5));
 for(let i=1;i<=steps;i++){const t=i/steps;if(!isWalkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}
 return true;
}
function closest(p,mustConnect){
 const ok=getMesh(),cx=Math.floor(p.x/GRID),cy=Math.floor(p.y/GRID);let best=-1,bd=Infinity;
 for(let d=0;d<COLS+ROWS&&best<0;d++){
  for(let y=Math.max(0,cy-d);y<=Math.min(ROWS-1,cy+d);y++)for(let x=Math.max(0,cx-d);x<=Math.min(COLS-1,cx+d);x++){
   if(d&&Math.max(Math.abs(x-cx),Math.abs(y-cy))!==d)continue;
   const i=y*COLS+x;if(!ok[i])continue;
   const q=gridPoint(i),v=distance(p,q);
   if(v<bd&&(!mustConnect||clearSegment(p,q))){best=i;bd=v;}
  }
  if(d>9)break; // Distant taps are scenery, not implicit teleports.
 }
 return {i:best,d:bd};
}
function push(heap,n){
 let i=heap.length;heap.push(n);while(i){const j=(i-1)>>1;if(heap[j][1]<=n[1])break;heap[i]=heap[j];i=j;}heap[i]=n;
}
function pop(heap){
 const first=heap[0],last=heap.pop();if(!heap.length)return first;
 let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1][1]<heap[j][1])j++;if(last[1]<=heap[j][1])break;heap[i]=heap[j];i=j;}heap[i]=last;return first;
}
export function pathTo(start,goal,{maxSnap=25}={}){
 const actualGoal=isWalkable(goal.x,goal.y)?goal:null;if(actualGoal&&clearSegment(start,actualGoal))return [actualGoal];
 const a=closest(start,true).i,near=closest(goal,Boolean(actualGoal)),b=near.i;
 if(a<0||b<0||(!actualGoal&&near.d>maxSnap))return [];
 const end=gridPoint(b);const ok=getMesh();
 const came=new Int32Array(ok.length).fill(-1),cost=new Float64Array(ok.length).fill(Infinity),closed=new Uint8Array(ok.length),heap=[];
 const h=(i)=>distance(gridPoint(i),end);
 cost[a]=0;push(heap,[a,h(a)]);
 while(heap.length){
  const [u]=pop(heap);if(closed[u])continue;if(u===b)break;closed[u]=1;
  const x=u%COLS,y=Math.floor(u/COLS);const p=gridPoint(u);
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){
   const nx=x+dx,ny=y+dy;if(nx<0||nx>=COLS||ny<0||ny>=ROWS)continue;
   const v=ny*COLS+nx;if(!ok[v]||closed[v]||(dx&&dy&&(!ok[y*COLS+nx]||!ok[ny*COLS+x])))continue;
   const nc=cost[u]+(dx&&dy?GRID*Math.SQRT2:GRID);
   if(nc<cost[v]&&clearSegment(p,gridPoint(v))){cost[v]=nc;came[v]=u;push(heap,[v,nc+h(v)]);}
  }
 }
 if(!Number.isFinite(cost[b]))return [];
 const raw=[];for(let i=b;;i=came[i]){raw.push(gridPoint(i));if(i===a)break;}
 raw.reverse();if(actualGoal)raw.push(actualGoal);const route=[];let origin=start;
 while(raw.length){let i=0;while(i+1<raw.length&&clearSegment(origin,raw[i+1]))i++;origin=raw[i];route.push(origin);raw.splice(0,i+1);}
 return route;
}
export function closestLandmark(p){
 return LANDMARKS.filter(x=>distance(p,x)<=x.range).sort((a,b)=>distance(p,a)-distance(p,b))[0]??null;
}
export const initialStory=()=>({recorded:false,cleared:false,vendor:false,delivered:false,rest:false});
export function objective(s){return s.delivered?'Parcel delivered':s.cleared?'Deliver the parcel uphill':s.recorded?'Show your slip to the harbour guard':'Check in at the ticket office';}
export function objectiveId(s){return s.delivered?null:s.cleared?'door':s.recorded?'guard':'ticket';}
export function interact(id,s){
 const next={...s};let lines=[];
 switch(id){
  case 'ticket':
   if(s.recorded){lines=['You’re in the book. The guard just needs to see that slip.'];break;}
   next.recorded=true;lines=['A courier, then. Keep the parcel tied. I’m recording arrivals, not what you’re carrying.','There’s no charge for a courier stamp. If you buy anything, though, the new harbour coins are all we can take at this window.','Here’s your landing slip. Show it to the guard by the ferry.'];break;
  case 'guard':
   if(s.cleared){lines=['You’re cleared. The house with the square lantern is up the stone steps.'];break;}
   if(!s.recorded){lines=['Deliveries go in the landing book first. The clerk can give you a slip.'];break;}
   next.cleared=true;lines=['That’s the slip. I’ll mark you as cleared.','I’ll have to report anything that isn’t on the new forms. Take the stone steps to the house with the square lantern.'];break;
  case 'vendor':
   next.vendor=true;lines=s.vendor?['The boatmen still take old copper. Try one of them if you need change.']:['That’ll be two harbour coins. No, the old copper’s worth the same to me as yesterday.','The harbour office won’t take it when I pay for the stall. They’ve been keeping the old copper brought to the office for exchange.'];break;
  case 'door':
   if(s.delivered){next.rest=true;lines=['You’re welcome back here when you need a rest. I’ll leave the lantern on.'];break;}
   if(!s.cleared){lines=['Are you the courier? The guard will want to mark your slip before I sign for that.'];break;}
   next.delivered=true;lines=['From the country road? Thank you. Set the parcel inside and keep it quiet. If the harbour office hears, they’ll levy a tax on it.','They kept my local coins when I went to change them. What they gave me wouldn’t even cover the ferry fare.','If you need a bed, come back later. I’ll leave the lantern on.'];break;
  default:throw new RangeError('Unknown landmark');
 }
 return {state:next,lines};
}
