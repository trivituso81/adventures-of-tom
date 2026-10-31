'use strict';
// data/justin-battle-use.js: Justin's painted battle sprite (data/justin-battle-hires.js JUSTIN_BT, art/chars/justin-*.webp).
// Builds BATTLE_SPRITES.justin from nothing (he has no pixel rig), his KO pose and his ability frames. Loads after data/battle-size.js
// and data/boppy-hires-battle.js. Set JUSTIN_BT_OFF=true (before this file) to leave him out of battle sprites.
//
// Stock stances (idle, act, celeb, run...) come from JUSTIN_BT.core. Every ability frame is also a sprite key, named as in the sheet
// ('lw_jab', 'wn_throwA', 'dw_set', ...), plus a mirrored copy with an R suffix ('lw_jabR') for moves that face the other way.
// engine/justin-moves.js drives them through RFX.ST.keys. All frames face left.
(function() {
  if(typeof JUSTIN_BT==='undefined'||(typeof JUSTIN_BT_OFF!=='undefined'&&JUSTIN_BT_OFF)) return;
  const BT=JUSTIN_BT;
  if(typeof BATTLE_SIZE!=='undefined') BATTLE_SIZE.justin=BATTLE_SIZE.justin||.823;   // Tom: 10% taller than Tom (idle figure 86 rows x 2 x .823 = 142 px vs Tom 129) with his head about Tom's size (bake enlarges it 45%)
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.justin)||.823;
  const pal={}; let n=0;
  const sp={pal,scale:2*SZ,hires:true,noShift:true,eyeAt:new Map(),handAt:new Map(),skin:'#e3a47c'};
  const lum=c=>{ const h=pal[c]; if(!h) return 0; return parseInt(h.slice(1,3),16)*.3+parseInt(h.slice(3,5),16)*.59+parseInt(h.slice(5,7),16)*.11; };
  // eye: centroid of dark pixels in the face band; hands: outermost pixels in the arm band (logic reads these)
  const meta=rows=>{ const H=rows.length,W=rows[0].length; let sx=0,sy=0,c=0;
    for(let y=Math.floor(H*.08);y<Math.floor(H*.34);y++) for(let x=0;x<W;x++) { const ch=rows[y][x]; if(ch!=='.'&&lum(ch)<70) { sx+=x; sy+=y; c++; } }
    const eye=c?{col:Math.round(sx/c),row:Math.round(sy/c)}:{col:Math.round(W*.38),row:Math.round(H*.2)};
    let lx=W,ly=Math.round(H*.5),rx=0,ry=Math.round(H*.5);
    for(let y=Math.floor(H*.35);y<Math.floor(H*.72);y++) for(let x=0;x<W;x++) if(rows[y][x]!=='.') { if(x<lx) { lx=x; ly=y; } if(x>rx) { rx=x; ry=y; } }
    return {eye,hand:{n:[lx+1,ly],f:[rx-1,ry]}}; };
  const reg=rows=>{ const m=meta(rows); sp.eyeAt.set(rows,m.eye); sp.handAt.set(rows,m.hand); return rows; };
  const mir=rows=>{ const r=mirrorRows(rows),W=rows[0].length,e=sp.eyeAt.get(rows),h=sp.handAt.get(rows);
    if(e) sp.eyeAt.set(r,{col:W-1-e.col,row:e.row}); if(h) sp.handAt.set(r,{n:[W-1-h.f[0],h.f[1]],f:[W-1-h.n[0],h.n[1]]}); return r; };
  // a set's palette moved to private code points so every set coexists in one palette
  const addPal=(p0)=>{ const m={'.':'.'}; for(const k in p0) { const c=String.fromCharCode(0x0900+n++); m[k]=c; pal[c]=p0[k]; } return m; };
  const mk=(rows,mp,atlas,name)=>reg(paintRows(rows.map(q=>{ let o=''; for(const ch of q) o+=mp[ch]; return o; }),atlas,name,false));

  // ---- core stances ----
  const AT=BT.atlas;
  paintedAtlas('justinBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  const mc=addPal(BT.core.pal),C=k=>mk(BT.core[k],mc,'justinBattle',k);
  sp.idle=C('idle'); sp.idle2=C('idle2'); sp.act=C('act'); sp.windup=C('windup'); sp.celeb=C('celeb'); sp.leap=C('leap');
  sp.hurtPose=C('hurt'); sp.defend=C('defend'); sp.castPose=C('cast'); sp.kneel=C('kneel');
  const run=[C('run1'),C('run2')];
  sp.hip=sp.idle; sp.wind=sp.windup; sp.throw=sp.act; sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=run;
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.cheer=[sp.celeb,sp.celebFlip]; sp.runFlip=run.map(mir);
  sp.eye=sp.eyeAt.get(sp.idle);

  // ---- ability frames ----
  for(const sk in BT.sets) {
    const S=BT.sets[sk],A=AT[sk]; paintedAtlas('justin_'+sk,A.src,A.rects,A.k);
    const m=addPal(S.pal);
    for(const nm in S.rows) { const r=sp[nm]=mk(S.rows[nm],m,'justin_'+sk,nm); sp[nm+'R']=mir(r); }
  }
  // stock stances that borrow an ability frame
  sp.aim=sp.bc_point; sp.spread=sp.bc_yellB; sp.clap=sp.wn_nod; sp.sit=sp.bc_sit;

  BATTLE_SPRITES.justin=sp;

  // ---- knocked out: authored head left, stored facing right (rows mirrored), like the rest of the family ----
  if(typeof KO_SPRITES!=='undefined') {
    const kr=BT.ko.rows,W=kr[0].length;
    KO_SPRITES.justin={scale:.8*2*SZ,pal:BT.ko.pal,rows:paintRows(kr.slice(),'justinKo','ko',true)};
    paintedAtlas('justinKo',AT.ko.src,AT.ko.rects,AT.ko.k);
    // head: the right-hand end of the stored rows. Column = centre of the head, row = its top.
    let xmax=0; for(const r of kr) for(let x=W-1;x>=0;x--) if(r[x]!=='.') { if(x>xmax) xmax=x; break; }
    let top=kr.length; for(let y=0;y<kr.length;y++) { for(let x=xmax-18;x<=xmax;x++) if(kr[y][x]&&kr[y][x]!=='.') { top=Math.min(top,y); break; } }
    if(typeof KO_HEAD!=='undefined') KO_HEAD.justin=[Math.max(0,xmax-9),Math.min(top,kr.length-1)];
  }
})();
