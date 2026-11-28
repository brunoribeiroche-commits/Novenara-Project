export const INK_WALK_ASSET='assets/courier-ink-walk.webp';
export const INK_WALK_DIRECTIONS=Object.freeze(['s','se','e','ne','n','nw','w','sw']);
export const INK_CELL_WIDTH=192, INK_CELL_HEIGHT=256, INK_COLUMNS=7;
export const INK_WALK_FRAME_MS=90, INK_WALK_FRAMES=6;
export const INK_BODY_PIXELS=210, INK_ANCHOR_X=96, INK_ANCHOR_Y=230;
export function inkWalkFrame(direction,clock=null){
 const row=INK_WALK_DIRECTIONS.indexOf(direction);
 const i=clock===null?0:1+Math.floor(Math.max(0,clock)/INK_WALK_FRAME_MS)%INK_WALK_FRAMES;
 return {sx:i*INK_CELL_WIDTH,sy:Math.max(0,row)*INK_CELL_HEIGHT};
}
export function inkWalkBounds(x,y,body){
 const k=body/INK_BODY_PIXELS;
 return {x:x-INK_ANCHOR_X*k,y:y-INK_ANCHOR_Y*k,w:INK_CELL_WIDTH*k,h:INK_CELL_HEIGHT*k};
}

// Choose art from actual displacement; keep the direction when blocked or idle.
const clockwiseFromEast=['e','se','s','sw','w','nw','n','ne'];
export function inkWalkHeading(dx,dy,previous='s'){
 if(Math.hypot(dx,dy)<.01)return previous;
 return clockwiseFromEast[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
}

export const INK_SE_IDLE_ASSET='assets/courier-ink-idle-se.png';
export function inkSeIdleBounds(x,y,body,width,height){
 const w=body*width/height;
 return {x:x-w/2,y:y-body,w,h:body};
}
