'use strict';
// data/olivia-battle-use.js: Olivia's painted battle sprite (data/olivia-battle-hires.js OLIVIA_BT, art/chars/olivia-*.webp).
// Builds BATTLE_SPRITES.olivia and KO_SPRITES.olivia the way data/justin-battle-use.js does. Loads after data/battle-size.js.
// Set OLIVIA_BT_OFF=true (before this file) to leave her out of battle sprites.
// Every ability frame is also a sprite key, 'ab_<move>_<n>' ('ab_fc_4', 'ab_du_5', ...), plus a mirrored copy with an R suffix ('ab_fc_4R'),
// loaded from data/olivia-ab.js. engine/olivia-moves.js drives them.
(function() {
  if(typeof OLIVIA_BT==='undefined'||(typeof OLIVIA_BT_OFF!=='undefined'&&OLIVIA_BT_OFF)) return;
  const BT=OLIVIA_BT;
  if(typeof BATTLE_SIZE!=='undefined') BATTLE_SIZE.olivia=BATTLE_SIZE.olivia||.62;   // idle figure 97 rows x 2 x .62 = about 120 px (Amy 125, Deedee 130, Tom 130): a grown woman a touch under Tom
  const SZ=(typeof BATTLE_SIZE!=='undefined'&&BATTLE_SIZE.olivia)||.62;
  const pal={}; let n=0;
  const sp={pal,scale:2*SZ,hires:true,noShift:true,eyeAt:new Map(),handAt:new Map(),skin:'#e8b894'};
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
  // palette moved to private code points so every set coexists in one palette
  const addPal=(p0)=>{ const m={'.':'.'}; for(const k in p0) { const c=String.fromCharCode(0x0b00+n++); m[k]=c; pal[c]=p0[k]; } return m; };
  const mk=(rows,mp,atlas,name)=>reg(paintRows(rows.map(q=>{ let o=''; for(const ch of q) o+=mp[ch]; return o; }),atlas,name,false));

  // ---- core stances ----
  const AT=BT.atlas;
  paintedAtlas('oliviaBattle',AT.bt.src,AT.bt.rects,AT.bt.k);
  const mc=addPal(BT.core.pal),C=k=>mk(BT.core[k],mc,'oliviaBattle',k);
  sp.idle=C('idle'); sp.idle2=C('idle2'); sp.act=C('act'); sp.windup=C('windup'); sp.celeb=C('celeb'); sp.leap=C('leap');
  sp.hurtPose=C('hurt'); sp.defend=C('defend'); sp.castPose=C('cast'); sp.kneel=C('kneel');
  const run=[C('run1'),C('run2')];
  sp.hip=C('hip'); sp.spread=C('spread'); sp.point=C('point');
  sp.wind=sp.windup; sp.throw=sp.act; sp.expr=sp.act; sp.celeb2=sp.celeb; sp.run=run;
  sp.flip=mir(sp.idle); sp.celebFlip=mir(sp.celeb); sp.cheer=[sp.celeb,sp.celebFlip]; sp.runFlip=run.map(mir);
  sp.eye=sp.eyeAt.get(sp.idle);

  // ---- ability frames ----
  // data/olivia-ab.js (tools/sprite-bake/bake_olivia_ab.py): 'ab_<move>_<n>' per painted cell of her eleven approved Art Library sheets, plus an R copy facing the other way.
  if(typeof OLIVIA_AB!=='undefined') {
    const A=OLIVIA_AB; paintedAtlas('olivia_ab',A.atlas.src,A.atlas.rects,A.atlas.k);
    const m=addPal(A.pal);
    for(const nm in A.ab) { const r=sp[nm]=mk(A.ab[nm],m,'olivia_ab',nm); sp[nm+'R']=mir(r); }
  }

  BATTLE_SPRITES.olivia=sp;

  // ---- knocked out: authored head left, stored facing right (rows mirrored), like the rest of the family ----
  if(typeof KO_SPRITES!=='undefined') {
    const kr=BT.ko.rows,W=kr[0].length;
    KO_SPRITES.olivia={scale:.8*2*SZ,pal:BT.ko.pal,rows:paintRows(kr.slice(),'oliviaKo','ko',true)};
    paintedAtlas('oliviaKo',AT.ko.src,AT.ko.rects,AT.ko.k);
    // head: the right-hand end of the stored rows. Column = centre of the head, row = its top.
    let xmax=0; for(const r of kr) for(let x=W-1;x>=0;x--) if(r[x]!=='.') { if(x>xmax) xmax=x; break; }
    let top=kr.length; for(let y=0;y<kr.length;y++) { for(let x=xmax-18;x<=xmax;x++) if(kr[y][x]&&kr[y][x]!=='.') { top=Math.min(top,y); break; } }
    if(typeof KO_HEAD!=='undefined') KO_HEAD.olivia=[Math.max(0,xmax-9),Math.min(top,kr.length-1)];
  }
})();
