// Walkable tiles traced against village.png (1672×941). Each tile is 48px square.
// Rectangles include both corners; widen or trim them here when replacing art.
export const CELL=48,COLS=34,ROWS=19;
export const ORIGIN={x:20,y:14};
export const MAP={width:1672,height:941};
export const FLOOR=[
 [0,12,8,12], // exposed wood bridge beside the ferry
 [4,6,29,7],  // stone plaza skirt in front of ticket office
 [5,8,29,9],
 [5,10,30,11],
 [8,12,31,13],
 [10,14,30,14],
 [20,15,29,15], // lower walkway behind the railing
 [23,4,25,6], // house doorstep and broad central stair
 [29,5,30,6],[30,4,31,5],[31,3,32,4],[31,2,32,3], // hillside lane
];
export const SOLIDS=[
 [8,6,8,6], // harbour guard
 [10,6,10,6], // ticket planter pot
 [12,8,14,9],[14,7,14,7], // crates and the upper crate’s corner
 [5,10,5,10], // quay-side lamp
 [20,11,24,12], // large raised planter
 [30,11,30,11], // market shopper
 [31,12,31,12], // end pot/market frontage
];
// [aX,aY,bX,bY] on tile indices; no crossing the dock's north railing.
// Both directions are blocked; the bridge meets stone only at its east mouth.
export const BLOCKED_EDGES=Array.from({length:8},(_,x)=>[x,11,x,12]);
export const START={x:6,y:12};
export const PLACES=[
 {id:'ticket',name:'Ticket office',role:'Ticket clerk',hint:'Have the clerk record your arrival.',x:12,y:6,signX:12,signY:4},
 {id:'guard',name:'Harbour guard',role:'Harbour guard',hint:'Show the guard your landing slip.',x:8,y:7,signX:8,signY:5},
 {id:'vendor',name:'Market stall',role:'Market vendor',hint:'See what the market takes for payment.',x:29,y:11,signX:32,signY:10},
 {id:'door',name:'Recipient’s door',role:'Recipient',hint:'Take the central stone stairs and deliver the parcel.',x:24,y:4,signX:24,signY:3}
];
