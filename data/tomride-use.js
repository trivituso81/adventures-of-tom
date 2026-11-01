'use strict';
// data/tomride-use.js: Tom carrying Rose on his shoulders as ONE painted figure (data/tomride-hires.js, art/chars/tomride-*.webp).
// Loaded after data/recruit-sprites.js (it adds OW.tomRide). Used whenever Rose rides: the welcome screen, the overworld
// (engine/town-render.js) and battle (engine/rose-ride.js rideBodyDraw). Set TOMRIDE_OFF=true before this file for the old layered pixel Rose.
// TOMRIDE.bt has the same pose names as Tom's battle sprite, so a Tom frame maps to its ride frame (rideFrameOf in engine/rose-ride.js).
const TOMRIDE={ok:false,bt:null};
(function() {
  if(typeof TOMRIDE_HIRES==='undefined'||(typeof TOMRIDE_OFF!=='undefined'&&TOMRIDE_OFF)) return;
  const AT=TOMRIDE_HIRES.atlas;
  paintedAtlas('tomrideBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('tomrideRose',AT.rz.src,AT.rz.rects,AT.rz.k);
  paintedAtlas('tomrideOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  const rev=rows=>rows.map(r=>r.split('').reverse().join('')),tag=(rows,a,f,flip)=>paintRows(rows,a,f,flip);
  const mirror=rows=>{ const m=rev(rows); if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip}; return m; };
  // Overworld: the sheet draws him facing LEFT; the game's 'side' set faces RIGHT, so side = flipped left frames (as for Tom).
  const O=TOMRIDE_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return tag(flip?rev(rows):rows.slice(),'tomrideOw',d+'_'+n,flip); });
  OW.tomRide=prepOW({pal:O.pal,down:mk('down'),up:mk('up'),side:mk('left',true)},1);
  // Battle: faces left like Tom. Same row resolution as his own sprite, so the same scale applies.
  const B=TOMRIDE_HIRES.bt,P=(k,n)=>tag(B[k].slice(),'tomrideBattle',n||k,false);
  // The 2026-11-01 sheets have no separate windup / strike / cast ride frames: those poses use the standing ride frame.
  const sp={pal:B.pal,idle:P('idle'),act:P('idle'),celeb:P('celeb'),windup:P('idle'),leap:P('leap'),hurtPose:P('hurt'),
    defend:P('defend'),castPose:P('idle'),kneel:P('kneel'),run:[P('run1'),P('run2')]};
  sp.expr=sp.idle; sp.flip=mirror(sp.idle); sp.celebFlip=mirror(sp.celeb); sp.runFlip=sp.run.map(mirror);
  // Tom's custom poses that keep Rose up (Press Start, DEFEND): same names as his own pose table.
  for(const k of ['proud','hold','annoyed','tw_windup','tw_follow']) sp[k]=P(k);
  // Skins: Tom carrying Rose in the pose a Tombo move needs (airplane, cloud gazing, headphones, night-light) and the toss
  // (grab, lift, toss). Moves ask for one with rideSkin(key,fallbackFrame) (engine/rose-ride.js). _skin: drawn as is.
  const alias={biplane:'biplane',biplane2:'biplane2',cloud:'cloud',cloud2:'cloud',phones:'phones',night:'night',hoist:'hoist',boop:'boop',grab:'grab',lift:'rlift',toss:'toss'};
  sp.sk={}; for(const k in alias) if(B[alias[k]]) { const f=P(alias[k]); f._skin=true; sp.sk[k]=f; }
  // Rose alone after the toss: in the air, then landing on her feet (painted, own atlas).
  const Z=TOMRIDE_HIRES.rz; sp.rz={air:tag(Z.air.slice(),'tomrideRose','air',false),land:tag(Z.land.slice(),'tomrideRose','land',false)};
  TOMRIDE.bt=sp; TOMRIDE.ok=true;
})();
