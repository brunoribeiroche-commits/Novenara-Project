import {INK_BODY_PIXELS,INK_ANCHOR_Y} from './courier-ink-walk.mjs';

const di=Math.SQRT1_2;
export const DIRECTIONS=Object.freeze({s:[0,1],n:[0,-1],e:[1,0],w:[-1,0],ne:[di,-di],nw:[-di,-di],se:[di,di],sw:[-di,di]});
export const CASTS=Object.freeze({
 // South includes Bruno's approved displacement (8,23) from the original palm (146,95).
 s:{asset:'assets/gust/cast-s.png',w:192,palm:[154,118]},
 n:{asset:'assets/gust/cast-n.png',w:256,palm:[93,65]},
 e:{asset:'assets/gust/cast-e.png',w:256,palm:[225,102]},
 w:{asset:'assets/gust/cast-w.png',w:192,palm:[24,111]}
});
export const ART=Object.freeze(Object.fromEntries(Object.keys(DIRECTIONS).map(d=>[d,
 d==='s'?{asset:'assets/gust/wind-s-straight.png',size:320,cols:4,rows:3,pivot:[160,48]}:
 {asset:'assets/gust/wind-'+d+'.png',size:320,cols:6,rows:1,pivot:[160,160]}])));
const CAST_MS=[260,80,70,60,50,300,65,70,75,80,95,300];
const SOUTH_FX_MS=[30,20,30,20,30,20,30,20,30,20,30,20], WIND_MS=[45,45,50,55,55,50];
export const RELEASE=520, RECOVER=820, DURATION=1505, PUSH_MS=320;
export const castFacing=d=>Object.hasOwn(CASTS,d)?d:d?.endsWith('w')?'w':'e';
function pose(ms,durations){
 for(let i=0;i<durations.length;i++){if(ms<durations[i])return i;ms-=durations[i];}
 return durations.length-1;
}
export const castFrame=(ms,reduced=false)=>reduced?(ms>=RELEASE&&ms<RECOVER?5:ms<RELEASE?0:11):pose(ms,CAST_MS);
export function windFrame(d,t,reduced=false){
 if(t<RELEASE||t>=RECOVER)return null;
 const a=ART[d], i=reduced?(d==='s'?5:3):pose(t-RELEASE,d==='s'?SOUTH_FX_MS:WIND_MS);
 return {i,sx:(i%a.cols)*a.size,sy:Math.floor(i/a.cols)*a.size,
  opacity:(d==='s'?[.90,.65,.36][i-9]:[.82,.48][i-4])??1};
}
export function castBounds(feet,body,d){
 const a=CASTS[castFacing(d)], k=body/INK_BODY_PIXELS;
 return {x:feet.x-a.w/2*k,y:feet.y-INK_ANCHOR_Y*k,k,w:a.w*k,h:256*k};
}
export function gustWindBounds(feet,body,d){
 const a=ART[d], p=CASTS[castFacing(d)].palm,b=castBounds(feet,body,d);
 return {x:b.x+(p[0]-a.pivot[0])*b.k,y:b.y+(p[1]-a.pivot[1])*b.k,w:a.size*b.k,h:a.size*b.k};
}
// Visible leading edge, in world units, sampled from each directional sprite at dock scale.
const FRONT={
 n:[20,38,46,46],e:[15,37,46,49],w:[19,42,46,46],
 ne:[14,34,44,50],se:[16,37,45,50],sw:[13,35,44,48],nw:[15,39,46,50],
 s:[12,29,47,54]
};
export function planBarrelHit(feet,barrel,d,body=83,halfW=16.5,halfD=11){
 const [vx,vy]=DIRECTIONS[d], dx=barrel.x-feet.x, dy=barrel.y-feet.y;
 const forward=dx*vx+dy*vy, across=Math.abs(dx*vy-dy*vx);
 const halfDepth=Math.abs(vx)*halfW+Math.abs(vy)*halfD;
 const halfSide=Math.abs(vy)*halfW+Math.abs(vx)*halfD;
 if(forward<=0)return null;
 const palm=CASTS[castFacing(d)], reach=Math.max(0,(palm.palm[0]-palm.w/2)*vx*body/INK_BODY_PIXELS);
 const gap=Math.max(0,forward-halfDepth-reach);
 if(across>halfSide+8+gap*.25)return null;
 const samples=FRONT[d], i=samples.findIndex(x=>gap<=x*body/83);
 if(i<0)return null;
 const timing=d==='s'?SOUTH_FX_MS:WIND_MS;
 return {at:RELEASE+timing.slice(0,i).reduce((a,b)=>a+b,0),gap,vx,vy};
}
export function barrelSlide(from,hit,allows,max=42){
 // Test the full footprint along the path so the barrel cannot cross water, walls or props.
 let to={...from};
 for(let d=2;d<=max;d+=2){
  const next={x:from.x+d*hit.vx,y:from.y+d*hit.vy};
  if(!allows(next))break;to=next;
 }
 return to;
}
export function barrelAt(from,to,ms){
 const t=1-(1-Math.max(0,Math.min(1,ms/PUSH_MS)))**3;
 return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};
}
