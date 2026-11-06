'use strict';
// data/recruit-sprites.js — Prepared overworld sets and recruit battle sprites.
const OW={tom:prepOW(TOM_OW,TOM_OW.hires?1:1.07),grace:prepOW(GRACE_OW,GRACE_OW.hires?1:.88),rose:prepOW(ROSE_OW,ROSE_OW.hires?1:.82),deedee:prepOW(DEEDEE_OW,DEEDEE_OW.hires?1:.85),boppy:prepOW(BOPPY_OW,BOPPY_OW.hires?1:.9),amy:prepOW(AMY_OW,AMY_OW.hires?1:.86),tnb:prepOW(TNB_OW,TNB_OW.hires?1:.92)};
OW.amy.k=1;   // painted Amy is baked at Tom's exact height (43 rows) and head ratio, so no extra scaling
OW.boppy.k=1;   // painted Boppy is baked at Deedee's and Tom's height (41.7 rows) and head ratio
OW.deedee.k=1;   // painted Deedee is baked at Tom's exact height (41.7 rows) and head ratio, so no extra scaling
// Real heights (Tom 11-04: "adult and child sizes are not properly applied"). Every sheet is baked to roughly the same height in rows, so each
// painted set is drawn at its real height next to Tom (5'11 = 71 in): TNB 5'10, Amy and Deedee 5'5, Boppy 5'7, Grace 4'2, Rose 3'4 (Justin 6'4: data/justin-hires-use.js).
// k = (real inches / 71) x Tom's visible rows / the set's own visible rows, measured on each stand frame.
// 2026-11-05 (Tom: "using Tom as a baseline given each character's height"): re-measured against Tom's whole-figure walk (42.0 visible rows, tomwhole1).
if(TOM_OW.hires) OW.tom.k=1;
if(typeof TNB_OW!=='undefined'&&TNB_OW.hires) OW.tnb.k=.920;
if(GRACE_OW.hires) OW.grace.k=.758;
if(ROSE_OW.hires) OW.rose.k=.672;
OW.amy.k=.925; OW.deedee.k=.922; OW.boppy.k=.950;
// Recruit battle sprites come from data/recruit-rig.js: left-facing, same outline and shading as Tom, Grace and Rose.
const RECRUIT_EXPR={amy:'clap',deedee:'spread',boppy:'hip',tnb:'hip'};
for(const id of ['amy','deedee','boppy','tnb']) {
  const R=RECRUIT_BT[id],F=R.frames,sp={pal:R.pal,scale:2,noShift:true,eye:R.eye.idle,eyeAt:new Map()};
  for(const k in F) sp[k]=F[k];
  sp.celebFlip=F.celeb2; sp.expr=F[RECRUIT_EXPR[id]]; sp.flip=mirrorRows(F.idle);
  sp.run=[F.run1,F.run2]; sp.runFlip=[mirrorRows(F.run1),mirrorRows(F.run2)];
  for(const k in F) sp.eyeAt.set(F[k],R.eye[k]);
  sp.eyeAt.set(sp.expr,R.eye[RECRUIT_EXPR[id]]); sp.eyeAt.set(sp.celebFlip,R.eye.celeb2);
  sp.skin=R.skin; sp.handAt=new Map(); const Wd=R.w;
  for(const k in F) sp.handAt.set(F[k],R.hand[k]);
  sp.handAt.set(sp.expr,R.hand[RECRUIT_EXPR[id]]); sp.handAt.set(sp.celebFlip,R.hand.celeb2);
  const mh=h=>({n:[Wd-1-h.n[0],h.n[1]],f:[Wd-1-h.f[0],h.f[1]]});
  sp.handAt.set(sp.flip,mh(R.hand.idle)); sp.runFlip.forEach((fr,k)=>sp.handAt.set(fr,mh(R.hand['run'+(k+1)])));
  BATTLE_SPRITES[id]=sp;
}
