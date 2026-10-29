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
  const at=roseRide(pose,'back',cx,top,s,false,{flash:fx.flash>0});
  battle._seat={pose,cx,top,s,flash:fx.flash>0,hop}; battle._seatLast=true;
  battle.drawnAt[i]={cx:Math.round(cx-4),base:Math.round(top+5),h:Math.round(31*s)};
  if(hurt&&at) {   // black eye, as on her normal frame
    const P=ROSE_RIDE[pose],ey=sp.eye,bx=at.x+(ey.col+P.sx)*s-s,by=at.y+(ey.row+P.sy)*s-s;
    rect(bx,by,s*3,s*3,'rgba(96,52,130,.55)'); rect(bx+s*.5,by+s*.5,s*2,s*2,'rgba(40,20,64,.7)');
  }
  return true;
}
// A move's path that parks Rose where the old standing ride put her (Tom's centre +2, his top +20) means she is up on
// his shoulders: draw her sitting there too.
function roseSeatNear(cx,base) {
  const tom=b2Tom(),d=tom&&battle.drawnAt&&battle.drawnAt[tom.idx]; if(!d) return false;
  return Math.abs(cx-(d.cx+2))<=8&&Math.abs(base-(d.base-d.h+20))<=10;
}
// Right after Tom is drawn: her shoes on his shoulders.
function roseSeatFront(m) {
  const q=battle._seat; if(!q||m.id!=='tom') return;
  const keep=activeTint; activeTint=null;
  roseRide(q.pose,'front',q.cx,q.top,q.s,false,{flash:q.flash});
  activeTint=keep;
}

// ---------- Overworld ----------
// The follower sitting on Tom (a scene sets .seat once she has hopped up). Tom's facing picks her pose.
function roseRider() { return followers.find(f=>f.seat&&!f.hidden)||null; }
function owRidePose(facing) { return facing==='up'?['ow_up',false]:facing==='down'?['ow_down',false]:['ow_left',facing==='right']; }
// before=true: called just before Tom is drawn; false: just after.
function drawOwRider(r,facing,cx,top,before) {
  const [pose,flip]=owRidePose(facing),up=pose==='ow_up';
  const layer=before===!up?'back':'front';
  const keep=activeTint;
  activeTint=layer==='back'&&r.member?garmentTint('ow','rose',memberTopColor(r.member)):null;
  roseRide(pose,layer,cx,top,1,flip);
  activeTint=keep;
}
