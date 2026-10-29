'use strict';
// data/deedee-hires-battle.js — Battle half of the painted Deedee. Loaded after data/deedee-poses.js (last word on her frames) and engine/gear.js.
// Replaces her core frames (idle, strike, wind-up, run, leap, hurt, kneel, celebrate, defend, cast, knocked out) with painted ones.
// Her story-only poses (sit, toast, hug, carry, whisper...) keep their pixel rows. The painted palette is moved to unused keys so both coexist.
(function() {
  if(typeof DEEDEE_HIRES==='undefined'||!DEEDEE_OW.hires) return;
  const sp=BATTLE_SPRITES.deedee; if(!sp) return;
  const B=DEEDEE_HIRES.bt,M=DEEDEE_HIRES.meta.bt;
  // palette: painted keys -> private code points, merged into the sprite's palette
  const map={}; let n=0; const pal=sp.pal;
  for(const k in B.pal) { const c=String.fromCharCode(0x0300+n++); map[k]=c; pal[c]=B.pal[k]; }
  map['.']='.';
  const rk=rows=>rows.map(r=>{ let s=''; for(const ch of r) s+=map[ch]; return s; });
  const lum=c=>{ const h=pal[c]; if(!h) return 0; return parseInt(h.slice(1,3),16)*.3+parseInt(h.slice(3,5),16)*.59+parseInt(h.slice(5,7),16)*.11; };
  // eye: centroid of dark pixels in the face band; hands: outermost pixels in the arm band (logic reads these)
  const meta=rows=>{ const H=rows.length,W=rows[0].length; let sx=0,sy=0,c=0;
    for(let y=Math.floor(H*.08);y<Math.floor(H*.34);y++) for(let x=0;x<W;x++) { const ch=rows[y][x]; if(ch!=='.'&&lum(ch)<70) { sx+=x; sy+=y; c++; } }
    const eye=c?{col:Math.round(sx/c),row:Math.round(sy/c)}:{col:Math.round(W*.38),row:Math.round(H*.2)};
    let lx=W,ly=Math.round(H*.5),rx=0,ry=Math.round(H*.5);
    for(let y=Math.floor(H*.35);y<Math.floor(H*.72);y++) for(let x=0;x<W;x++) if(rows[y][x]!=='.') { if(x<lx) { lx=x; ly=y; } if(x>rx) { rx=x; ry=y; } }
    return {eye,hand:{n:[lx+1,ly],f:[rx-1,ry]}}; };
  const reg=(rows)=>{ const m=meta(rows); if(sp.eyeAt) sp.eyeAt.set(rows,m.eye); if(sp.handAt) sp.handAt.set(rows,m.hand); return rows; };
  const P=(k,name)=>reg(paintRows(rk(B[k]),'deedeeBattle',name||k,false));
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  sp.scale=1; sp.hires=true; sp.eye={col:M.eye[0],row:M.eye[1]};
  sp.idle=P('idle'); sp.act=P('act'); sp.celeb=P('celeb'); sp.windup=P('windup'); sp.leap=P('leap');
  sp.hurtPose=P('hurt'); sp.defend=P('defend'); sp.castPose=P('cast'); sp.kneel=P('kneel');
  sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=[P('run1'),P('run2')];
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.runFlip=sp.run.map(mir);
  // Knocked out: the KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.deedee={scale:.8,pal:DEEDEE_HIRES.ko.pal,rows:paintRows(DEEDEE_HIRES.ko.rows.slice(),'deedeeKo','ko',true)};
  // Extra painted poses (attack sheet x_* and story sheet), baked by tools/sprite-bake/bake_deedee_extra.py. Hand points come from the bake.
  if(typeof DEEDEE_EXTRA!=='undefined') {
    const EX=DEEDEE_EXTRA; paintedAtlas('deedeeExtra',EX.atlas.src,EX.atlas.rects,EX.atlas.k);
    const m2={}; let n2=0; for(const k in EX.pal) { const c=String.fromCharCode(0x0400+n2++); m2[k]=c; pal[c]=EX.pal[k]; } m2['.']='.';
    const X=k=>{ const rows=paintRows(EX.rows[k].map(r=>{ let q=''; for(const ch of r) q+=m2[ch]; return q; }),'deedeeExtra',k,false); reg(rows);
      const h=EX.hands[k]; if(h&&sp.handAt) { const cur=sp.handAt.get(rows)||{}; sp.handAt.set(rows,{n:h.n||cur.n,f:h.f||cur.f}); } return rows; };
    for(const k in EX.rows) sp['x_'+k]=X(k);
    sp.sit=sp.toast=sp.x_sitL; sp.sitR=sp.x_sitR; sp.whisper=sp.x_whisper; sp.point=sp.x_point; sp.spread=sp.x_gasp;
    sp.carry=sp.x_carry; sp.hug=sp.x_open; sp.shrug=sp.x_shrug; sp.hip=sp.x_hips; sp.clap=sp.x_clap;
  }
  // Brisk Walk set (tracksuit, separate palette), baked by tools/sprite-bake/bake_deedee_brisk.py
  if(typeof DEEDEE_BRISK!=='undefined') {
    const BR=DEEDEE_BRISK; paintedAtlas('deedeeBrisk',BR.atlas.src,BR.atlas.rects,BR.atlas.k);
    const m3={}; let n3=0; for(const k in BR.pal) { const c=String.fromCharCode(0x0500+n3++); m3[k]=c; pal[c]=BR.pal[k]; } m3['.']='.';
    for(const k in BR.rows) { const rows=paintRows(BR.rows[k].map(r=>{ let q=''; for(const ch of r) q+=m3[ch]; return q; }),'deedeeBrisk',k,false); reg(rows);
      const h=BR.hands[k]; if(h&&sp.handAt) { const cur=sp.handAt.get(rows)||{}; sp.handAt.set(rows,{n:h.n||cur.n,f:h.f||cur.f}); } sp['x_'+k]=rows; }
  }
  // Her cardigan is not a dark tee, so outfit recolouring does not apply to the painted Deedee.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.deedee; delete GARMENT.ow.deedee; }
})();
