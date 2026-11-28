// The cast lights the courier's left hand (screen right when facing south).
// Coordinates are measured in the approved 192 × 256 walk cels, idle first.
// 0.5 = partially behind the coat/other arm; null = off-camera or occluded.
import {INK_WALK_DIRECTIONS,INK_CELL_WIDTH,INK_CELL_HEIGHT,INK_BODY_PIXELS} from './courier-ink-walk.mjs';
export const EMBER_MS=10_000;
export const EMBER_FADE_MS=500;
const anchors=[
 [[129,152],[137,141],[134,141],[135,145],[128,141],[124,132],[128,145]],
 [[128,156],[140,138],[137,138],[122,135,.5],[126,136,.5],null,null],
 [null,[60,143,.5],null,[57,141,.5],[129,126],[128,132,.5],[121,132]],
 [[73,153,.5],[55,139,1,true],[56,145,1,true],[61,138,1,true],null,[54,155,1,true],[132,116,1,false]],
 [[63,154],[61,150],[59,151],[60,133],null,null,null],
 [[68,156],[69,136,.5],[58,118],[55,119],[67,138],[55,119],[69,139]],
 [[91,155],[136,153,1,false],[71,149],[66,141],[62,143],[60,140],[62,142]],
 [[121,156],[133,143,.5],[85,147],[129,144,.5],[75,139],[130,149],[131,148]]
];
export function emberOpacity(now,started){
 if(started===null||!Number.isFinite(now))return 0;
 const left=EMBER_MS-(now-started);
 return now<started?0:Math.max(0,Math.min(1,left/EMBER_FADE_MS));
}
export function emberAnchor(sx,sy){
 const row=sy/INK_CELL_HEIGHT,col=sx/INK_CELL_WIDTH;
 if(!Number.isInteger(row)||!Number.isInteger(col)||!INK_WALK_DIRECTIONS[row])return null;
 const a=anchors[row]?.[col];
 return a?{u:a[0]/INK_CELL_WIDTH,v:a[1]/INK_CELL_HEIGHT,visibility:a[2]??1,mirror:a[3]??(row>=4)}:null;
}
// The separate, high-resolution three-quarter standing sprite used in Cove Way.
export const SE_IDLE_EMBER=Object.freeze({u:.897,v:.648,visibility:1});
// The authored front-idle texture is already mostly transparent. Use exactly
// that artwork for the visible fist in each cel, never recolor the base sprite.
const FRONT_OVERLAY_ANCHOR={x:129,y:152};
// The east idle conceals the left hand: let only a soft flicker leak around
// the far silhouette. Never paint the effect over the visible right hand.
export const EAST_IDLE_SPILL=Object.freeze({u:119/192,v:153/256,visibility:.58,spill:true});

export function emberShimmer(age,enabled){
 if(!enabled)return {alpha:1,height:1};
 const a=Math.sin(age*.012),b=Math.sin(age*.028);
 return {alpha:1+.11*a+.04*b,height:1+.055*a+.02*b};
}
export function paintEmber(ctx,overlay,bounds,anchor,body,now,start,shimmer=false){
 const opacity=emberOpacity(now,start);
 if(!opacity||!anchor||!overlay)return false;
 const s=body/INK_BODY_PIXELS;
 const x=bounds.x+anchor.u*bounds.w,y=bounds.y+anchor.v*bounds.h;
 const {alpha,height}=emberShimmer(now-start,shimmer);
 ctx.save();ctx.translate(x,y);ctx.scale(anchor.mirror?-s:s,s*height);
 ctx.globalAlpha=Math.min(1,opacity*anchor.visibility*alpha);
 if(anchor.spill){
  const shade=ctx.createRadialGradient(0,0,1,0,0,16);
  shade.addColorStop(0,'#FCC75FB8');shade.addColorStop(.48,'#F17C306D');
  shade.addColorStop(1,'#B6470F00');
  ctx.fillStyle=shade;ctx.fillRect(-16,-16,32,32);ctx.restore();return true;
 }
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(overlay,-FRONT_OVERLAY_ANCHOR.x,-FRONT_OVERLAY_ANCHOR.y,INK_CELL_WIDTH,INK_CELL_HEIGHT);
 ctx.restore();
 return true;
}
