// The 4 × 3 cast sheet is followed by the approved glowing south idle.
import {INK_CELL_WIDTH,INK_CELL_HEIGHT,INK_ANCHOR_X,INK_ANCHOR_Y,inkWalkBounds} from './courier-ink-walk.mjs';
export const CINDER_ASSET='assets/cinder-fist-front.webp';
export const CINDER_SIZE=Object.freeze({width:1448,height:1086});
export const CINDER_FACING='s';
export const CINDER_FINAL_IDLE='assets/cinder-fist-final-idle.png';
export const CINDER_IDLE_OVERLAY='assets/cinder-fist-idle-overlay.png';
const CELL=362;
const ground=[[183.5,349],[185,349],[184.5,348],[184,348],
 [184.5,348],[184.5,348],[185,348],[186,349],
 [185,348],[184,349],[184.5,349],[182.5,348]];
const durations=[90,85,85,105,100,85,80,90,100,100,110,675];
const castCels=durations.map((ms,i)=>{
 const row=Math.floor(i/4),col=i%4,[anchorX,anchorY]=ground[i];
 return Object.freeze({sx:col*CELL,sy:row*CELL,sw:CELL,sh:CELL,ms,anchorX,anchorY});
});
const glowingIdle=Object.freeze({sx:0,sy:0,sw:INK_CELL_WIDTH,sh:INK_CELL_HEIGHT,
 ms:150,anchorX:INK_ANCHOR_X,anchorY:INK_ANCHOR_Y,kind:'front-idle'});
export const CINDER_FRAMES=Object.freeze([...castCels,glowingIdle]);
export const CINDER_DURATION=CINDER_FRAMES.reduce((a,f)=>a+f.ms,0);
export function cinderCel(ms){
 if(!Number.isFinite(ms)||ms<0||ms>=CINDER_DURATION)return null;
 let k=0;
 for(const f of CINDER_FRAMES){if(ms<f.ms)return {index:k,...f};ms-=f.ms;k++;}
 return null;
}
// Frame 1 fitted by alpha silhouette against the GitHub hand-inked south idle
// (walk atlas, col 0 / row 0; 210 px body). Use this exact transform for every
// cel, including its effects. Per-cel boot anchors still keep the feet grounded.
const frontIdleFit=Object.freeze({xScale:0.5648/210,yScale:0.63255/210,xOffset:3.33/210});
export function cinderBounds(x,y,body,f){
 if(f.kind==='front-idle')return inkWalkBounds(x,y,body);
 const sx=body*frontIdleFit.xScale,sy=body*frontIdleFit.yScale;
 return {x:x+body*frontIdleFit.xOffset-f.anchorX*sx,y:y-f.anchorY*sy,w:f.sw*sx,h:f.sh*sy};
}
