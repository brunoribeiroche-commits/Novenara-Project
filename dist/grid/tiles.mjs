import {CELL,COLS,ROWS,ORIGIN,FLOOR,SOLIDS,BLOCKED_EDGES} from './terrain.mjs';
export const cardinal=[{dx:0,dy:-1,facing:'north'},{dx:-1,dy:0,facing:'west'},{dx:1,dy:0,facing:'east'},{dx:0,dy:1,facing:'south'}];
export const same=(a,b)=>a?.x===b?.x&&a?.y===b?.y;
export const key=p=>p.y*COLS+p.x;
export const center=p=>({x:ORIGIN.x+(p.x+.5)*CELL,y:ORIGIN.y+(p.y+.57)*CELL});
export const coords=(x,y)=>({x:Math.floor((x-ORIGIN.x)/CELL),y:Math.floor((y-ORIGIN.y)/CELL)});
export const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const inside=(p,r)=>p.x>=r[0]&&p.x<=r[2]&&p.y>=r[1]&&p.y<=r[3];
export function canStep(p){return Number.isInteger(p?.x)&&Number.isInteger(p?.y)&&p.x>=0&&p.x<COLS&&p.y>=0&&p.y<ROWS&&FLOOR.some(r=>inside(p,r))&&!SOLIDS.some(r=>inside(p,r));}
export function canTraverse(a,b){
 if(!canStep(a)||!canStep(b)||manhattan(a,b)!==1)return false;
 return !BLOCKED_EDGES.some(([ax,ay,bx,by])=>(a.x===ax&&a.y===ay&&b.x===bx&&b.y===by)||(a.x===bx&&a.y===by&&b.x===ax&&b.y===ay));
}
export function flood(begin,max=Infinity){
 const options=new Map();if(!canStep(begin))return options;
 options.set(key(begin),{tile:begin,steps:0,parent:null});const queue=[begin];
 for(let i=0;i<queue.length;i++){
  const tile=queue[i],prev=options.get(key(tile));if(prev.steps>=max)continue;
  for(const {dx,dy} of cardinal){const next={x:tile.x+dx,y:tile.y+dy},id=key(next);if(!canTraverse(tile,next)||options.has(id))continue;options.set(id,{tile:next,steps:prev.steps+1,parent:tile});queue.push(next);}
 }
 return options;
}
export function routeFrom(options,to){
 if(!canStep(to))return null;
 const result=[];let p=options.get(key(to));if(!p)return null;
 while(p.parent){result.push(p.tile);p=options.get(key(p.parent));}
 return result.reverse();
}
export function path(begin,to,max=Infinity){return routeFrom(flood(begin,max),to);}
export function facing(a,b,prior='south'){return cardinal.find(n=>n.dx===b.x-a.x&&n.dy===b.y-a.y)?.facing??prior;}
