'use strict';
// engine/rose-ride.js: draws Rose SITTING on Tom's shoulders (data/rose-ride.js): her upper body behind his head, her legs
// down the sides of his head and her shoes on his shoulders. Used by the battle (Shoulder Ride), the overworld (a scene
// actor with .seat set) and the splash screen.
const RIDE_FLIP={};
function rideRows(pose,layer,flip) {
  const R=ROSE_RIDE[pose][layer]; if(!R||!flip) return R;
  const k=pose+':'+layer; return RIDE_FLIP[k]||(RIDE_FLIP[k]=mirrorRows(R));
}
// Draw one layer of a pose with Tom's anchor (his centre column, top of his sprite) at (cx,top), pixel size s.
function roseRide(pose,layer,cx,top,s,flip,opts) {
  const P=ROSE_RIDE[pose],R=rideRows(pose,layer,flip); if(!R) return null;
  const ax=flip?R[0].length-P.ax:P.ax,x=Math.round(cx-ax*s),y=Math.round(top-P.ay*s);
  drawSprite(R,typeof ROSE_RIDE_PAL!=='undefined'?ROSE_RIDE_PAL:OW.rose.pal,x,y,s,opts||{});
  return {x,y};
}

// ---------- Battle ----------
// Rose's turn in the party loop (engine/battle-draw.js), drawn just before Tom: the back layer. Returns true when she rides.
// force: a move's own path has put her on the riding spot (roseSeatNear), before or after Shoulder Ride itself.
function roseSeatBattle(m,i,frame,sp,fx,hurt,t,force) {
  if(!force&&!b2RidePos(m,i)) return false;
  const tom=b2Tom(),d=tom&&b2Alive(tom)&&battle.drawnAt&&battle.drawnAt[tom.idx]; if(!d) return false;
  const pose=(frame===sp.celeb||frame===sp.celebFlip)?'bt_celeb':'bt_idle',s=BATTLE_SPRITES.tom.scale;   // the ride art is sized to Tom, so she rides at his scale
  const cx=d.x!=null?d.x+d.w/2:d.cx;
  // Her own bounce is carried by Tom (hop below, added to his lift in engine/battle-draw.js), so the pair hops as one: her
  // legs keep their length and her shoes stay on his shoulders instead of stretching and floating off.
  const bob=Math.round(Math.abs(Math.sin(t*3))*2);
  const hop=fx.hop>0?Math.round(Math.abs(Math.sin(t*9))*12):0;
  const top=d.base-d.h-bob;
  // The painted ride (Tom and Rose as one figure) is drawn by Tom's own draw (rideBodyDraw). Her old layered art is only drawn
  // when Tom's pose has no painted ride frame (rideBodyDraw / rideFlush draw it then).
  battle._seat={pose,cx,top,s,flash:fx.flash>0,hop,tint:activeTint,hurt,eye:sp.eye,ridden:false,backDone:false}; battle._seatLast=true;
  battle.drawnAt[i]={cx:Math.round(cx-4),base:Math.round(top+5),h:Math.round(31*s)};
  return true;
}
// A move's path that parks Rose where the old standing ride put her (Tom's centre +2, his top +20) means she is up on
// his shoulders: draw her sitting there too.
function roseSeatNear(cx,base) {
  const tom=b2Tom(),d=tom&&battle.drawnAt&&battle.drawnAt[tom.idx]; if(!d) return false;
  return Math.abs(cx-(d.cx+2))<=8&&Math.abs(base-(d.base-d.h+20))<=10;
}
// The old layered Rose behind Tom's head (only when Tom has no painted ride frame for his pose).
function rideBackFallback(q) {
  if(q.backDone) return; q.backDone=true;
  const keep=activeTint; activeTint=q.tint;
  const at=roseRide(q.pose,'back',q.cx,q.top,q.s,false,{flash:q.flash});
  activeTint=keep;
  if(q.hurt&&at) {   // black eye, as on her normal frame
    const P=ROSE_RIDE[q.pose],ey=q.eye,bx=at.x+(ey.col+P.sx)*q.s-q.s,by=at.y+(ey.row+P.sy)*q.s-q.s;
    rect(bx,by,q.s*3,q.s*3,'rgba(96,52,130,.55)'); rect(bx+q.s*.5,by+q.s*.5,q.s*2,q.s*2,'rgba(40,20,64,.7)');
  }
}
// Tom's frame -> the same pose of Tom carrying Rose (painted, data/tomride-use.js). Built once from his sprite table.
let _rideMap=null,_rideMapFor=null;
function rideFrameOf(fr) {
  if(typeof TOMRIDE==='undefined'||!TOMRIDE.ok) return null;
  const T=BATTLE_SPRITES.tom;
  if(!_rideMap||_rideMapFor!==T) {
    _rideMapFor=T; _rideMap=new Map(); const R=TOMRIDE.bt;
    for(const k of ['idle','act','celeb','windup','leap','hurtPose','defend','castPose','kneel','expr','flip','celebFlip']) if(T[k]&&R[k]) _rideMap.set(T[k],R[k]);
    for(const k of ['run','runFlip']) if(T[k]&&R[k]) T[k].forEach((f,i)=>R[k][i]&&_rideMap.set(f,R[k][i]));
  }
  return _rideMap.get(fr)||null;
}
// Draw Tom's body. While Rose rides and Tom's pose has a painted ride frame, draw that frame instead (bottom centre stays put,
// so his feet do not move); otherwise draw the old layered Rose behind him and Tom as usual.
function rideBodyDraw(m,fr,pal,x,y,s,opts) {
  if(m.id==='tom') battle._tomDrawnAt=battle.time;
  const q=m.id==='tom'&&battle._seat;
  if(q) {
    const R=rideFrameOf(fr);
    if(R) {
      q.ridden=true;
      const keep=activeTint; activeTint=null;
      drawSprite(R,TOMRIDE.bt.pal,x+(fr[0].length-R[0].length)*s/2,y+(fr.length-R.length)*s,s,opts);
      activeTint=keep; return;
    }
    rideBackFallback(q);
  }
  drawSprite(fr,pal,x,y,s,opts);
}
// After the party is drawn: if Tom never drew this frame (hidden mid-move), still show Rose the old way.
function rideFlush() {
  const q=battle._seat; if(!q||q.ridden||q.backDone) return;
  if(battle._tomDrawnAt===battle.time) return;   // she hopped up after Tom was drawn this frame: skip the one-frame blip, the painted ride starts next frame
  rideBackFallback(q);
  const keep=activeTint; activeTint=null; roseRide(q.pose,'front',q.cx,q.top,q.s,false,{flash:q.flash}); activeTint=keep;
}
// Right after Tom is drawn: her shoes on his shoulders (not needed when the painted ride frame was used).
function roseSeatFront(m) {
  const q=battle._seat; if(!q||m.id!=='tom'||q.ridden) return;
  const keep=activeTint; activeTint=null;
  roseRide(q.pose,'front',q.cx,q.top,q.s,false,{flash:q.flash});
  activeTint=keep;
}

// ---------- Overworld ----------
// The follower sitting on Tom (a scene sets .seat once she has hopped up). Tom's facing picks her pose.
function roseRider() { return followers.find(f=>f.seat&&!f.hidden)||null; }
function owRidePose(facing) { return facing==='up'?['ow_up',false]:facing==='down'?['ow_down',false]:['ow_left',facing==='right']; }
// before=true: called just before Tom is drawn; false: just after.
function drawOwRider(r,facing,cx,top,before,k=1) {
  const [pose,flip]=owRidePose(facing),up=pose==='ow_up';
  const layer=before===!up?'back':'front';
  const keep=activeTint;
  activeTint=layer==='back'&&r.member?garmentTint('ow','rose',memberTopColor(r.member)):null;
  roseRide(pose,layer,cx,top,k,flip);
  activeTint=keep;
}
