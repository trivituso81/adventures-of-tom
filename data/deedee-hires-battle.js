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
  // Her cardigan is not a dark tee, so outfit recolouring does not apply to the painted Deedee.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.deedee; delete GARMENT.ow.deedee; }
})();
