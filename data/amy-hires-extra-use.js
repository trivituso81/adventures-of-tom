'use strict';
// data/amy-hires-extra-use.js: Amy's extra painted poses (data/amy-hires-extra.js, art/chars/amy-ba|bs|bp|ox.webp), baked at Tom's exact size and head ratio.
// Loaded after data/amy-hires-battle.js. Her moves (engine/amy-moves.js) rebuild many stock stances from pixel art the first time any move runs
// (RECRUIT_POSES.add), so this file wraps RECRUIT_POSES.add: whenever a name below is (re)registered for Amy, the painted frame wins.
(function() {
  if(typeof AMY_HIRES_X==='undefined'||typeof AMY_HIRES==='undefined'||!AMY_OW.hires) return;
  const sp=BATTLE_SPRITES.amy; if(!sp||!sp.hires) return;
  const AT=AMY_HIRES_X.atlas;
  paintedAtlas('amyBa',AT.ba.src,AT.ba.rects,AT.ba.k); paintedAtlas('amyBs',AT.bs.src,AT.bs.rects,AT.bs.k);
  paintedAtlas('amyBp',AT.bp.src,AT.bp.rects,AT.bp.k); paintedAtlas('amyOx',AT.ox.src,AT.ox.rects,AT.ox.k);
  // palettes: private code points (U+0400 and up) so they coexist with the pixel and main painted keys
  let n=0; const pal=sp.pal, maps={};
  const lum=c=>{ const h=pal[c]; if(!h) return 0; return parseInt(h.slice(1,3),16)*.3+parseInt(h.slice(3,5),16)*.59+parseInt(h.slice(5,7),16)*.11; };
  for(const s of ['ba','bs','bp']) { const m=maps[s]={'.':'.'}; for(const k in AMY_HIRES_X[s].pal) { const c=String.fromCharCode(0x0400+n++); m[k]=c; pal[c]=AMY_HIRES_X[s].pal[k]; } }
  const rk=(s,rows)=>rows.map(r=>{ let o=''; for(const ch of r) o+=maps[s][ch]; return o; });
  // eye = centroid of dark pixels in the face band; hands = outermost pixels in the arm band (move logic reads these)
  const meta=rows=>{ const H=rows.length,W=rows[0].length; let sx=0,sy=0,c=0;
    for(let y=Math.floor(H*.08);y<Math.floor(H*.34);y++) for(let x=0;x<W;x++) { const ch=rows[y][x]; if(ch!=='.'&&lum(ch)<70) { sx+=x; sy+=y; c++; } }
    const eye=c?{col:Math.round(sx/c),row:Math.round(sy/c)}:{col:Math.round(W*.38),row:Math.round(H*.2)};
    let lx=W,ly=Math.round(H*.5),rx=0,ry=Math.round(H*.5);
    for(let y=Math.floor(H*.3);y<Math.floor(H*.8);y++) for(let x=0;x<W;x++) if(rows[y][x]!=='.') { if(x<lx) { lx=x; ly=y; } if(x>rx) { rx=x; ry=y; } }
    return {eye,hand:{n:[lx+1,ly],f:[rx-1,ry]}}; };
  const P=(s,id,name)=>{ const rows=paintRows(rk(s,AMY_HIRES_X[s][name]),id,name,false), m=meta(rows);
    if(sp.eyeAt) sp.eyeAt.set(rows,m.eye); if(sp.handAt) sp.handAt.set(rows,m.hand); return rows; };
  const ba=k=>P('ba','amyBa',k), bs=k=>P('bs','amyBs',k), bp=k=>P('bp','amyBp',k);
  // name -> painted frame (built once)
  const F={
    act:ba('t4_hit'), windup:ba('t3_windup'), sprint:ba('t2_sprint'), start:ba('t1_start'), recover:ba('t5_recover'),   // Sprint Tackle
    hike:ba('k1_hike'), swingup:ba('k2_swingup'), swingtop:ba('k3_top'), throw:ba('k5_throw'), wind:ba('k1_hike'), pump:ba('k2_swingup'), flex:ba('k2_swingup'),
    carry:ba('k4_carry'), hold:ba('k2_swingup'), grab:ba('k4_carry'), dazed:ba('k6_dazed'),                                // Kettlebell Swing and others
    hip:bs('s1_hips'), point:bs('s2_point'), clap:bs('s3_clap'), whistle:bs('s4_whistle'), shh:bs('s5_shh'), shrug:bs('s6_shrug'), spread:bs('s6_shrug'),
    write:bs('s7_write'), card:bs('s8_card'), pistol:bs('s8_card'), reach:bs('s8_card'), squat:bs('s9_squat'), plant:bs('s9_squat'), bend:bs('s9_squat'), tuck:bs('s9_squat'),
    jump:bs('s12_jump'), plank:bp('s10_plank'), plank2:bp('s10_plank'), pushup:bp('s11_pushup')
  };
  for(const nm of ['plank','plank2','pushup','squat','plant','tuck','bend']) F[nm].cut=1;   // engine/amy-moves.js burpeeFrames(): "already built", keeps these
  const keepExpr=sp.expr;                                                                    // portraits keep the old strike face
  const apply=()=>{ for(const nm in F) sp[nm]=F[nm]; sp.expr=keepExpr; sp.celeb2=sp.celeb; };
  apply();
  if(typeof RECRUIT_POSES!=='undefined'&&RECRUIT_POSES.add&&!RECRUIT_POSES._amyX) {
    const add0=RECRUIT_POSES.add; RECRUIT_POSES._amyX=true;
    RECRUIT_POSES.add=function(id,name,pose) { const r=add0.apply(this,arguments); if(id==='amy'&&F[name]) { sp[name]=F[name]; return F[name]; } return r; };
  }
  // Overworld extras (wave, point, hands on hips, laugh, jog, sit, crouch): painted frames for story scenes. No engine code reads them yet.
  const O=AMY_HIRES_X.ox; let m2={'.':'.'}; for(const k in O.pal) { const c=String.fromCharCode(0x0400+n++); m2[k]=c; }
  AMY_OW.extra={pal:Object.fromEntries(Object.entries(O.pal).map(([k,v])=>[m2[k],v]))};
  for(const nm in O) if(nm!=='pal') AMY_OW.extra[nm]=paintRows(O[nm].map(r=>{ let o=''; for(const ch of r) o+=m2[ch]; return o; }),'amyOx',nm,false);
})();
