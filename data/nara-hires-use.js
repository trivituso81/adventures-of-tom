'use strict';
// data/nara-hires-use.js — The painted Nara (data/nara-hires.js, art/chars/nara-*.webp). Loaded right after data/nara.js, which builds her old pixel sprites;
// this file swaps in the painted frames (overworld, battle, knocked out). Set NARA_HIRES_OFF=true (before this file) to fall back to the pixel Nara.
// Her mouth point (HAND) is where she carries a ball, rope or jerky; both are set by hand in tools/sprite-bake/bake_nara.py (MARK).
const NARA_SIZE=1.15;   // Tom, 2026-10-29: Nara 15 percent larger everywhere (battle, knocked out, overworld, splash). One number.
(function() {
  if(typeof NARA_HIRES==='undefined'||(typeof NARA_HIRES_OFF!=='undefined'&&NARA_HIRES_OFF)) return;
  const AT=NARA_HIRES.atlas;
  paintedAtlas('naraBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  paintedAtlas('naraKo',AT.ko.src,AT.ko.rects,AT.ko.k);
  paintedAtlas('naraOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // Overworld: the sheet draws her facing LEFT; the game's 'side' set faces RIGHT (its 'left' is the mirror), so side = flipped left frames.
  const O=NARA_HIRES.ow,mk=(d,flip)=>['stand','step1','step2'].map(n=>{
    const rows=O[d+'_'+n]; return paintRows(flip?rows.map(r=>r.split('').reverse().join('')):rows.slice(),'naraOw',d+'_'+n,flip); });
  NARA_OW.hires=true; NARA_OW.pal=O.pal; NARA_OW.down=mk('down'); NARA_OW.up=mk('up'); NARA_OW.side=mk('left',true);
  Object.assign(OW.nara,prepOW(NARA_OW,1)); OW.nara.k=NARA_SIZE;   // overworld: engine/town-render.js multiplies by set.k
  // Battle
  const sp=BATTLE_SPRITES.nara; if(!sp) return;
  const B=NARA_HIRES.bt,MK=NARA_HIRES.meta.bt.marks;
  const map={}; let n=0; const pal=sp.pal;
  for(const k in B.pal) { const c=String.fromCharCode(0x0300+n++); map[k]=c; pal[c]=B.pal[k]; }
  map['.']='.';
  const rk=rows=>rows.map(r=>{ let s=''; for(const ch of r) s+=map[ch]; return s; });
  const reg=(rows,name)=>{ const m=MK[name],mx=Math.round(m.mouth[0]),my=Math.round(m.mouth[1]);
    if(sp.eyeAt) sp.eyeAt.set(rows,{col:Math.round(m.eye[0]),row:Math.round(m.eye[1])});
    if(sp.handAt) sp.handAt.set(rows,{n:[mx,my],f:[mx+1,my]}); return rows; };
  const P=name=>reg(paintRows(rk(B[name]),'naraBattle',name,false),name);
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  sp.scale=NARA_SIZE; sp.hires=true; sp.eye={col:Math.round(MK.idle.eye[0]),row:Math.round(MK.idle.eye[1])};
  const idle=P('idle'),act=P('act'),windup=P('windup'),celeb=P('celeb'),leap=P('leap'),hurt=P('hurt'),defend=P('defend'),cast=P('cast'),kneel=P('kneel');
  Object.assign(sp,{idle,idle2:idle,act,throw:act,windup,wind:windup,celeb,celeb2:celeb,spread:celeb,clap:celeb,leap,hurtPose:hurt,defend,
    castPose:cast,aim:cast,hip:cast,kneel,sit:kneel,expr:defend});
  sp.run=[P('run1'),P('run2')];
  sp.flip=mir(idle); sp.celebFlip=mir(celeb); sp.runFlip=sp.run.map(mir);
  // Knocked out: Nara's KO sprite is stored facing LEFT (engine/battle-draw.js mirrors every other character's, not hers), as the sheet draws her.
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.nara={scale:NARA_SIZE,pal:NARA_HIRES.ko.pal,rows:paintRows(NARA_HIRES.ko.rows.slice(),'naraKo','ko',false)};
})();
