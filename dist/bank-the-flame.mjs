// The cast animation, flame source and effect path are independent. A source
// needs a stable id, a range-check position, a wick position, and a lit state.
export const BANK_RADIUS=140;
export const BANK_ART='assets/bank-the-flame-courier.png';
export const BANK_DARK_LAMP='assets/bank-lantern-glass.png';
export const BANK_W=192, BANK_H=256, BANK_CELS=12;
export const BANK_RELEASE=430, BANK_CATCH=805, BANK_ABSORB=900;
const starts=[0,140,235,320,410,500,670,805,900,1015,1120,1230,1460];
export const BANK_DURATION=starts.at(-1);
const hands=[[128,152],[152,139],[156,126],[166,119],[173,116],[173,116],[173,116],[151,123],[129,111],[126,111],[130,140],[128,152]];
const clamp=x=>Math.max(0,Math.min(1,x));
export function nearestBankSource(p,sources,radius=BANK_RADIUS){
 let best=null,bestDist=radius;
 for(const source of sources){
  if(!source.lit)continue;
  const d=Math.hypot(source.ground.x-p.x,source.ground.y-p.y);
  if(d<=bestDist&&(best===null||d<bestDist)){best=source;bestDist=d;}
 }
 return best;
}
export function bankCel(ms){
 if(!Number.isFinite(ms)||ms<0||ms>=BANK_DURATION)return null;
 return starts.findIndex((t,i)=>i>0&&ms<t)-1;
}
export function bankPalm(rect,cel){
 const [x,y]=hands[cel];
 return {x:rect.x+x/BANK_W*rect.w,y:rect.y+y/BANK_H*rect.h};
}
export function bankHeat(ms){return ms>840&&ms<1210?clamp(1-Math.abs(ms-1000)/205):0;}
export function lampDarkening(ms){return clamp((ms-410)/180);}
export function emberPath(origin,dest,u){
 u=clamp(u);const q=1-u,arc=Math.min(45,18+Math.abs(origin.x-dest.x)*.15);
 return {x:origin.x*q+dest.x*u,y:origin.y*q+dest.y*u-4*q*u*arc};
}
export function paintBankTransfer(c,origin,holdHand,hand,ms,body,reduced=false){
 if(ms<BANK_RELEASE||ms>=BANK_ABSORB)return;
 const t=clamp((ms-BANK_RELEASE)/(BANK_CATCH-BANK_RELEASE));
 const p=t<1?emberPath(origin,holdHand,t):hand;
 const k=body/210*(1-clamp((ms-BANK_CATCH)/(BANK_ABSORB-BANK_CATCH)));
 c.save();
 if(!reduced&&t<1){
  for(let i=10;i>0;i--){
   const q=emberPath(origin,holdHand,Math.max(0,t-i*.019));
   c.globalAlpha=.59*(1-i/11);c.fillStyle='#F17C30';c.beginPath();
   c.arc(q.x,q.y,k*(1+3*(1-i/11)),0,2*Math.PI);c.fill();
  }
 }
 c.globalAlpha=1;c.translate(p.x,p.y);c.scale(k,k);
 c.shadowColor='#F17C30';c.shadowBlur=6;c.fillStyle='#F17C30';
 c.beginPath();c.moveTo(-5,4);c.quadraticCurveTo(-8,-3,0,-7);c.lineTo(3,-11);
 c.quadraticCurveTo(3,-4,7,0);c.quadraticCurveTo(8,7,-5,4);c.fill();
 c.shadowBlur=0;c.fillStyle='#FCC75F';c.beginPath();c.ellipse(.6,.3,4,4.4,0,0,2*Math.PI);c.fill();
 c.fillStyle='#FDEA92';c.beginPath();c.ellipse(.7,.8,2,2.8,0,0,2*Math.PI);c.fill();c.restore();
}
