'use strict';
// data/boppy-hires-battle.js — Battle half of the painted Boppy. Loaded after data/boppy-poses.js (last word on his frames) and data/battle-size.js.
// Replaces his core frames (idle, strike, wind-up, run, leap, hurt, kneel, celebrate, defend, cast, knocked out) with painted ones.
// His story-only poses (sit, toast, hug, carry, whisper...) keep their pixel rows. The painted palette is moved to unused keys so both coexist.
(function() {
  if(typeof BOPPY_HIRES==='undefined'||!BOPPY_OW.hires) return;
  const sp=BATTLE_SPRITES.boppy; if(!sp) return;
  const B=BOPPY_HIRES.bt,M=BOPPY_HIRES.meta.bt;
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
  const P=(k,name)=>reg(paintRows(rk(B[k]),'boppyBattle',name||k,false));
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.boppy)||1;
  sp.scale=2*SZ; sp.hires=true; sp.eye={col:M.eye[0],row:M.eye[1]};
  sp.idle=P('idle'); sp.act=P('act'); sp.celeb=P('celeb'); sp.windup=P('windup'); sp.leap=P('leap');
  sp.hurtPose=P('hurt'); sp.defend=P('defend'); sp.castPose=P('cast'); sp.kneel=P('kneel');
  sp.hip=sp.idle; sp.wind=sp.windup;   // stock stances with no painted pose of their own: nearest painted one (Sheet B poses will replace)
  sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=[P('run1'),P('run2')];
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.cheer=[sp.celeb,sp.celebFlip]; sp.runFlip=sp.run.map(mir);
  // Extra attack poses (Sheet A, data/boppy-extra.js): x_swat, x_follow (cap in hand), x_castb (faces right), x_castf, x_reel, x_pepper, x_fire, x_seed, x_jar, x_marks, x_sprint
  if(typeof BOPPY_EXTRA!=='undefined') {
    const EX=BOPPY_EXTRA; paintedAtlas('boppyExtra',EX.atlas.src,EX.atlas.rects,EX.atlas.k);
    const m2={}; let n2=0; for(const k in EX.pal) { const c=String.fromCharCode(0x0400+n2++); m2[k]=c; pal[c]=EX.pal[k]; }
    m2['.']='.';
    for(const k in EX.rows) sp['x_'+k]=reg(paintRows(EX.rows[k].map(r=>{ let q=''; for(const ch of r) q+=m2[ch]; return q; }),'boppyExtra',k,false));
  }
  // Fishing poses (Sheet C, data/boppy-extra.js): x_fish1..4, x_sit1, x_sit2. Their hand point is the rod tip, where the code draws the line.
  if(typeof BOPPY_FISH!=='undefined') {
    const FX=BOPPY_FISH; paintedAtlas('boppyFish',FX.atlas.src,FX.atlas.rects,FX.atlas.k);
    const m3={}; let n3=0; for(const k in FX.pal) { const c=String.fromCharCode(0x0500+n3++); m3[k]=c; pal[c]=FX.pal[k]; }
    m3['.']='.';
    for(const k in FX.rows) { const r=paintRows(FX.rows[k].map(q=>{ let o=''; for(const ch of q) o+=m3[ch]; return o; }),'boppyFish',k,false); reg(r);
      if(sp.handAt) sp.handAt.set(r,{n:FX.tip[k].slice(),f:FX.tip[k].slice()}); sp['x_'+k]=r; }
  }
  // Knocked out: the KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.boppy={scale:.8*2*SZ,pal:BOPPY_HIRES.ko.pal,rows:paintRows(BOPPY_HIRES.ko.rows.slice(),'boppyKo','ko',true)};
  // His cardigan is not a dark tee, so outfit recolouring does not apply to the painted Boppy.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.boppy; delete GARMENT.ow.boppy; }
})();
