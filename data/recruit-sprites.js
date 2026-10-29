'use strict';
// data/recruit-sprites.js — Prepared overworld sets and recruit battle sprites.
const OW={tom:prepOW(TOM_OW,TOM_OW.hires?1:1.07),grace:prepOW(GRACE_OW,GRACE_OW.hires?1:.88),rose:prepOW(ROSE_OW,.82),deedee:prepOW(DEEDEE_OW,DEEDEE_OW.hires?1:.85),boppy:prepOW(BOPPY_OW,.9),amy:prepOW(AMY_OW,.86),tnb:prepOW(TNB_OW,TNB_OW.hires?1:.92)};
OW.deedee.k=DEEDEE_OW.hires?43/39:1;   // painted Deedee is 39 rows tall, Tom 43: draw her at Tom's height
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
