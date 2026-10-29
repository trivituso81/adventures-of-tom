'use strict';
// data/amy-hires-battle.js — Battle half of the painted Amy. Loaded after data/amy-poses.js (last word on her frames) and after data/battle-size.js (it reads BATTLE_SIZE.amy itself).
// Replaces her core frames (idle, strike, wind-up, run, leap, hurt, kneel, celebrate, defend, cast, knocked out) with painted ones.
// Her story-only poses (sit, toast, hug, point, clap, whisper...) keep their pixel rows. The painted palette is moved to unused keys so both coexist.
(function() {
  if(typeof AMY_HIRES==='undefined'||!AMY_OW.hires) return;
  const sp=BATTLE_SPRITES.amy; if(!sp) return;
  const B=AMY_HIRES.bt,M=AMY_HIRES.meta.bt;
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
  const P=(k,name)=>reg(paintRows(rk(B[k]),'amyBattle',name||k,false));
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.amy)||1;   // data/battle-size.js loads earlier; this file replaces the sprite, so it applies the size itself
  sp.scale=SZ; sp.hires=true; sp.eye={col:M.eye[0],row:M.eye[1]};
  sp.idle=P('idle'); sp.act=P('act'); sp.celeb=P('celeb'); sp.windup=P('windup'); sp.leap=P('leap');
  sp.hurtPose=P('hurt'); sp.defend=P('defend'); sp.castPose=P('cast'); sp.kneel=P('kneel');
  sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=[P('run1'),P('run2')];
  sp.idle2=sp.idle;   // data/amy-poses.js left a pixel cheer pair and idle2; victory and level-up cheers now use the painted celebrate frames
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.runFlip=sp.run.map(mir); sp.cheer=[sp.celeb,sp.celebFlip];
  // Her moves (engine/amy-moves.js) name a few stock stances. Point them at the nearest painted pose so the pixel Amy never pops in mid-move.
  // Story-only poses (sit, toast, sitR, hug, carry, shrug, whisper) and the burpee frames keep their pixel rows.
  sp.hip=sp.idle; sp.clap=sp.celeb; sp.spread=sp.hurtPose; sp.point=sp.castPose; sp.aim=sp.windup; sp.wind=sp.windup; sp.throw=sp.act;
  sp.pump=sp.celeb; sp.flex=sp.celeb; sp.wave=sp.castPose;
  // Knocked out: the KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.amy={scale:.8*SZ,pal:AMY_HIRES.ko.pal,rows:paintRows(AMY_HIRES.ko.rows.slice(),'amyKo','ko',true)};
  // Her yellow top is not a dark tee, so outfit recolouring does not apply to the painted Amy.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.amy; delete GARMENT.ow.amy; }
})();
