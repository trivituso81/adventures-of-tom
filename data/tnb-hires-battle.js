'use strict';
// data/tnb-hires-battle.js — Battle half of the painted TNB. Loaded after data/tnb-poses.js (last word on his pixel frames) and data/battle-size.js.
// Replaces his core frames (idle, strike, wind-up, run, leap, hurt, kneel, celebrate, defend, cast, knocked out) with painted ones, and points the
// move-only frames his attacks use at painted poses so every frame in a move is the same size (the extra sheets supply point, aim, spread, hip, clap,
// carry, shrug, mugPull, mugWind, mugRel, heave, crouch, dodge and the story poses sit, toast, sitR, hug, whisper, wave, talk, laugh).
// The painted palette is moved to unused keys so both coexist. He is drawn at Tom's height: scale 1 times BATTLE_SIZE.tnb.
(function() {
  if(typeof TNB_HIRES==='undefined'||!TNB_OW.hires) return;
  const sp=BATTLE_SPRITES.tnb; if(!sp) return;
  const B=TNB_HIRES.bt,M=TNB_HIRES.meta.bt;
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
  const P=(k,name)=>reg(paintRows(rk(B[k]),'tnbBattle',name||k,false));
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt&&sp.eyeAt.get(rows),h=sp.handAt&&sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.tnb)||1;
  sp.scale=SZ; sp.hires=true; sp.eye={col:M.eye[0],row:M.eye[1]};
  sp.idle=P('idle'); sp.act=P('act'); sp.celeb=P('celeb'); sp.windup=P('windup'); sp.leap=P('leap');
  sp.hurtPose=P('hurt'); sp.defend=P('defend'); sp.castPose=P('cast'); sp.kneel=P('kneel');
  sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=[P('run1'),P('run2')]; sp.run1=sp.run[0]; sp.run2=sp.run[1];
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.runFlip=sp.run.map(mir); sp.cheer=[sp.celeb,sp.celebFlip];
  // Extra painted poses (art/chars/tnb-poses.webp, sheets of 2026-10-29): move frames and story poses, same size and palette as the core set.
  // Their hand points use a taller arm band than the core frames (pointing and mug-holding arms sit above the waist).
  const metaX=rows=>{ const H=rows.length,W=rows[0].length; let lx=W,ly=Math.round(H*.5),rx=0,ry=Math.round(H*.5);
    for(let y=Math.floor(H*.25);y<Math.floor(H*.75);y++) for(let x=0;x<W;x++) if(rows[y][x]!=='.') { if(x<lx) { lx=x; ly=y; } if(x>rx) { rx=x; ry=y; } }
    return {n:[lx+1,ly],f:[rx-1,ry]}; };
  const X=TNB_HIRES.pose,Q=k=>{ const r=paintRows(rk(X[k]),'tnbPose',k,false); if(sp.eyeAt) sp.eyeAt.set(r,sp.eyeAt.get(sp.idle)||{col:M.eye[0],row:M.eye[1]}); if(sp.handAt) sp.handAt.set(r,metaX(r)); return r; };
  // Move frames
  sp.idle2=sp.idle; sp.wind=sp.windup; sp.throw=sp.act;
  sp.point=Q('point'); sp.aim=sp.point; sp.spread=Q('present'); sp.hip=Q('hips'); sp.clap=Q('clap'); sp.carry=Q('carry'); sp.shrug=Q('shrug');
  sp.mugPull=Q('pull'); sp.mugWind=Q('tw_wind'); sp.mugRel=Q('tw_rel');   // Mug Toss: pull from the tote, wind up, release
  sp.heave=Q('heave'); sp.crouch=Q('crouch'); sp.dodge=Q('dodge');
  // Story and overworld-scene poses (battle size)
  sp.sit=Q('sit'); sp.toast=Q('sittoast'); sp.sitR=Q('sitR'); sp.sitToastR=Q('sittoastR'); sp.hug=Q('hug'); sp.whisper=Q('whisper');
  sp.wave=Q('wave'); sp.cheers=Q('toast'); sp.talk=Q('talk'); sp.talkR=Q('talkR'); sp.laugh=Q('laugh'); sp.lookDown=Q('crouchlook');
  // Longboard poses (art/chars/tnb-board.webp, sheet src/tnb-board-v1.png): he rides, so the painted board is part of each frame and its bottom row is the wheels.
  // Names: bRide (rolling), bPush, bCarveIn / bCarveOut (S-turn leans), bTuck (low and fast), bTop (one foot on the board at the top of a hill), bOllie, bKick
  // (board flipping under him), bLob (throwing a mug), bSlide (Bert slide), bWobble, bDrop (holding the board). Each has a mirrored twin ending in R (faces right).
  if(TNB_HIRES.board) {
    const Y=TNB_HIRES.board,BQ=(k)=>{ const r=paintRows(rk(Y[k]),'tnbBoard',k,false); if(sp.eyeAt) sp.eyeAt.set(r,meta(r).eye); if(sp.handAt) sp.handAt.set(r,metaX(r)); return r; };
    const BN={bRide:'ride_idle',bPush:'push',bCarveIn:'carve_in',bCarveOut:'carve_out',bTuck:'tuck',bTop:'top_of_hill',bOllie:'ollie',bKick:'kick',bLob:'lob',bSlide:'bert_slide',bWobble:'wobble',bDrop:'drop_board'};
    for(const n in BN) { sp[n]=BQ(BN[n]); sp[n+'R']=mir(sp[n]); }
  }
  // Knocked out: the KO table stores sprites facing right (the game mirrors them to face the enemy).
  if(typeof KO_SPRITES!=='undefined') KO_SPRITES.tnb={scale:.8*SZ,pal:TNB_HIRES.ko.pal,rows:paintRows(TNB_HIRES.ko.rows.slice(),'tnbKo','ko',true)};
  // His shirt is cream under an apron, not a dark tee, so outfit recolouring does not apply to the painted TNB.
  if(typeof GARMENT!=='undefined') { delete GARMENT.bt.tnb; delete GARMENT.ow.tnb; }
})();
