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
  // HR = head (cap to chin) share of the idle height set by the bake (was .40; bigger since 2026-11-01). Bands keep their place relative to head and body:
  // eye band .2 to .85 of the head, arm band from just above the chin to just over half the body (both give the old .08-.34 and .35-.72 at HR .40).
  // The young runner (yg_) keeps realistic proportions, so he passes .40 (the old bands).
  const meta=(rows,HR=0.26)=>{ const EY0=.2*HR,EY1=.85*HR,AR0=HR-.08*(1-HR),AR1=HR+.53*(1-HR); const H=rows.length,W=rows[0].length; let sx=0,sy=0,c=0;
    for(let y=Math.floor(H*EY0);y<Math.floor(H*EY1);y++) for(let x=0;x<W;x++) { const ch=rows[y][x]; if(ch!=='.'&&lum(ch)<70) { sx+=x; sy+=y; c++; } }
    const eye=c?{col:Math.round(sx/c),row:Math.round(sy/c)}:{col:Math.round(W*.38),row:Math.round(H*.2)};
    let lx=W,ly=Math.round(H*.5),rx=0,ry=Math.round(H*.5);
    for(let y=Math.floor(H*AR0);y<Math.floor(H*AR1);y++) for(let x=0;x<W;x++) if(rows[y][x]!=='.') { if(x<lx) { lx=x; ly=y; } if(x>rx) { rx=x; ry=y; } }
    return {eye,hand:{n:[lx+1,ly],f:[rx-1,ry]}}; };
  const reg=(rows,hr)=>{ const m=meta(rows,hr); if(sp.eyeAt) sp.eyeAt.set(rows,m.eye); if(sp.handAt) sp.handAt.set(rows,m.hand); return rows; };
  const P=(k,name)=>reg(paintRows(rk(B[k]),'boppyBattle',name||k,false));
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  const P2=(rows,atlas,name,mp,hr)=>reg(paintRows(rows.map(q=>{ let o=''; for(const ch of q) o+=mp[ch]; return o; }),atlas,name,false),hr);
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.boppy)||1;
  sp.scale=2*SZ; sp.hires=true; sp.eye={col:M.eye[0],row:M.eye[1]};
  sp.idle=P('idle'); sp.act=P('act'); sp.celeb=P('celeb'); sp.windup=P('windup'); sp.leap=P('leap');
  sp.hurtPose=P('hurt'); sp.defend=P('defend'); sp.castPose=P('cast'); sp.kneel=P('kneel');
  sp.idle2=P('idle2'); sp.hip=P('hip'); sp.wind=sp.windup;   // breathing in and hands on hips: painted battle sheet 1 (aim, throw, spread, point come from his stock sheet below)
  sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=[P('run1'),P('run2')];
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.cheer=[sp.celeb,sp.celebFlip]; sp.runFlip=sp.run.map(mir);
  // Stock poses (Sheet B): aim, throw, spread, toast, point, clap, shrug replace his pixel stances. (sitc, the armchair pose, is not used: moves draw their own chair.)
  if(typeof BOPPY_STOCK!=='undefined') {
    const SX=BOPPY_STOCK; paintedAtlas('boppyStock',SX.atlas.src,SX.atlas.rects,SX.atlas.k);
    const m4={}; let n4=0; for(const k in SX.pal) { const c=String.fromCharCode(0x0600+n4++); m4[k]=c; pal[c]=SX.pal[k]; }
    m4['.']='.';
    for(const k in SX.rows) if(k!=='sitc') sp[k]=P2(SX.rows[k],'boppyStock',k,m4);
  }
  // Young runner (XC Ult flashback): yg_ready, yg_run1, yg_run2, yg_wind, yg_strike, yg_celebr (+ yg_run1R, yg_run2R mirrored). engine/boppy-moves.js youngOn() swaps them in.
  if(typeof BOPPY_YOUNG!=='undefined') {
    const YX=BOPPY_YOUNG; paintedAtlas('boppyYoung',YX.atlas.src,YX.atlas.rects,YX.atlas.k);
    const m5={}; let n5=0; for(const k in YX.pal) { const c=String.fromCharCode(0x0700+n5++); m5[k]=c; pal[c]=YX.pal[k]; }
    m5['.']='.';
    for(const k in YX.rows) sp['yg_'+k]=P2(YX.rows[k],'boppyYoung',k,m5,.40);
    sp.yg_run1R=mir(sp.yg_run1); sp.yg_run2R=mir(sp.yg_run2);
  }
  // Ability frames (tools/sprite-bake/bake_boppy_ab.py, data/boppy-ab.js): f:'ab_cap_2' etc. in a move's keys; a trailing 'F' is the same frame facing right.
  // Eye and hand points are found as for the poses above. sp.mouthAt (a little below the eye, where the fire cone and the red-face glow are drawn) and
  // sp.tipAt (the fishing rod tip, where the line starts) are looked up by frame rows.
  if(typeof BOPPY_AB!=='undefined') { const A=BOPPY_AB; paintedAtlas('boppyAb',A.atlas.src,A.atlas.rects,A.atlas.k);
    sp.mouthAt=new Map(); sp.tipAt=new Map();
    for(const k in A.ab) { const r=P2(A.ab[k],'boppyAb',k,map),W=r[0].length,e=sp.eyeAt&&sp.eyeAt.get(r); sp[k]=r; const q=sp[k+'F']=mir(r);
      if(e) { sp.mouthAt.set(r,{col:e.col-1,row:e.row+Math.round(r.length*.085)}); sp.mouthAt.set(q,{col:W-1-(e.col-1),row:e.row+Math.round(r.length*.085)}); }
      const t=A.tip&&A.tip[k]; if(t) { sp.tipAt.set(r,{col:t[0],row:t[1]}); sp.tipAt.set(q,{col:W-1-t[0],row:t[1]}); } } }
  // Knocked out: the KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.boppy={scale:.8*2*SZ,pal:BOPPY_HIRES.ko.pal,rows:paintRows(BOPPY_HIRES.ko.rows.slice(),'boppyKo','ko',true)};
  // His cardigan is not a dark tee, so outfit recolouring does not apply to the painted Boppy.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.boppy; delete GARMENT.ow.boppy; }
})();
