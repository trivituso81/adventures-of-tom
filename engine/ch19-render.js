'use strict';
// engine/ch19-render.js — The look of chapter 19 (Part 2): the Dead-Letter Office under Second Avenue, and the four memory rooms off it.
//   Ground 'dead': 'dlwall' (a wall of pigeonholes full of undelivered envelopes), 'dlfloor' (worn slate), 'dlrunner' (a dark-red runner with gold edges),
//   'dlmat' (Grace: blue gym mat), 'dlpink' (Rose: pink carpet), 'dltrack' (Amy: red track), 'dlbrick' (TNB: kiln-room brick), 'dldoor' (a numbered door).
//   Props: dlprop (sub: belt, sack, ledger, bench, stamp, lamp, beam, score, chalk, chair, trophy, rack, ribbon, stool, fort, bleacher, tape, clock, cone, hurdle,
//   kiln, wheel, shelf, clay, tools), dlmem (a memory fragment: a floating page, dim once read), dlkeep (a keepsake pedestal), dlaltar (the Claim Desk), dlmail (Tom's mailbox
//   on Second Avenue, the way down).
// Story state read here: flags mem-<id> (fragment read), ks-<who> (keepsake placed), ch19-open (the mailbox has opened).
// Wraps drawOutdoorTile, drawObject, buildMiniBase, drawLEBattleBg, b7DrawMapFx and mcAreaTrack. Loaded after engine/ch18-render.js.
const LE_drawOutdoorTile_ch19=drawOutdoorTile,LE_drawObject_ch19=drawObject,LE_buildMiniBase_ch19=buildMiniBase,LE_drawLEBattleBg_ch19=drawLEBattleBg,LE_b7DrawMapFx_ch19=b7DrawMapFx;
let LE_mcAreaTrack_ch19=null;
const dlGround=map=>!!(map&&map.style&&map.style.ground==='dead');
const dlTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'dlvoid';
const dlFlag=k=>typeof STORY!=='undefined'&&STORY.mode==='full'&&flag(k);
const DL_FLOORS=['dlfloor','dlrunner','dlmat','dlpink','dltrack','dlbrick','dldoor'];
const DL_MEM_COLOR={grace:'#7ad0e8',rose:'#f4a0c0',amy:'#ffb347',tnb:'#e0a070'};
addEventListener('DOMContentLoaded',()=>{
  if(typeof mcAreaTrack!=='function'||LE_mcAreaTrack_ch19) return;
  LE_mcAreaTrack_ch19=mcAreaTrack;
  mcAreaTrack=function(m) { return m&&['deadletter','memgrace','memrose','memamy','memtnb'].includes(m.id)?'terminal':LE_mcAreaTrack_ch19(m); };
});

// ---------- Ground ----------
const DL_ENV=['#e8dcb4','#d8c89a','#f0e6c8','#c8b888'];
function dlWallFace(px,py,n,x) {   // a wall of pigeonholes: three by three cubbies a tile, some with an envelope, one with a red stamp
  rect(px,py,T,T,'#141a1e'); rect(px,py,T,2,'#2a343a');
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) {
    const cx=px+2+c*10,cy=py+3+r*9; rect(cx,cy,9,8,'#0a0e10'); rect(cx,cy+7,9,1,'#2a343a');
    const m=hash(x*3+c,r*5+n%7);
    if(m%3!==0) { rect(cx+1,cy+2+(m%3),7,5-(m%3),DL_ENV[m%4]); rect(cx+1,cy+2+(m%3),7,1,'#fff8e0'); if(m%7===0) rect(cx+5,cy+3+(m%3),2,2,'#d9503f'); }
  }
  rect(px,py+T-3,T,3,'#2a343a');
}
drawOutdoorTile=function(x,y,type,time) {
  if(!dlGround(currentMap)) return LE_drawOutdoorTile_ch19(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='dlvoid') { rect(px,py,T,T,'#06080a'); return; }
  if(type==='dlwall') {
    if(DL_FLOORS.includes(dlTile(x,y+1))) { dlWallFace(px,py,n,x); return; }
    rect(px,py,T,T,'#10161a'); rect(px+T-2,py,2,T,'#0a0e10'); rect(px,py+T-3,T,3,'#1c2428'); return;
  }
  if(type==='dlfloor') {
    rect(px,py,T,T,['#3a4a52','#38484f','#3d4d55'][n%3]); rect(px,py,T,1,'#4a5c66'); rect(px,py,1,T,'#4a5c66'); rect(px,py+T-1,T,1,'#2a363c'); rect(px+T-1,py,1,T,'#2a363c');
    if(n%5===0) { rect(px+6,py+8,10,2,'#4a5c66'); rect(px+10,py+12,6,1,'#4a5c66'); }
    if(n%11===0) { rect(px+18,py+19,9,6,'#d8c89a'); rect(px+18,py+19,9,1,'#fff8e0'); }   // a dropped envelope
    if(!DL_FLOORS.includes(dlTile(x,y-1))) rect(px,py,T,4,'#2a363c');
    return;
  }
  if(type==='dlrunner') {
    rect(px,py,T,T,'#6a2a32'); rect(px+6,py,T-12,T,'#7a323c');
    const l=dlTile(x-1,y)!=='dlrunner',r=dlTile(x+1,y)!=='dlrunner';
    if(l) { rect(px,py,2,T,'#c8a040'); rect(px+3,py,1,T,'#a07a28'); } if(r) { rect(px+T-2,py,2,T,'#c8a040'); rect(px+T-4,py,1,T,'#a07a28'); }
    if((x+y)%2===0) { rect(px+14,py+14,4,4,'#a07a28'); }
    return;
  }
  if(type==='dlmat') {
    rect(px,py,T,T,['#3e66b0','#3a62ac','#4270b8'][n%3]); rect(px,py,T,1,'#6a90d0'); rect(px,py,1,T,'#2a4a88'); rect(px+T-1,py,1,T,'#2a4a88'); rect(px,py+T-1,T,1,'#2a4a88');
    if(n%4===0) { rect(px+7,py+10,12,2,'#e8f0ff'); rect(px+14,py+14,8,1,'#e8f0ff'); }   // chalk
    return;
  }
  if(type==='dlpink') {
    rect(px,py,T,T,'#d890a8'); rect(px,py,T,1,'#e8b0c4'); if((x+y)%2===0) { rect(px+10,py+10,4,4,'#e8b0c4'); rect(px+22,py+20,4,4,'#c07890'); } else { rect(px+22,py+8,4,4,'#c07890'); rect(px+8,py+22,4,4,'#e8b0c4'); }
    return;
  }
  if(type==='dltrack') {
    rect(px,py,T,T,['#b8553c','#b05038','#bc5a40'][n%3]); rect(px,py+T-2,T,2,'#f4ece0'); if(n%6===0) rect(px+8,py+8,10,2,'#9a4430');
    rect(px,py,T,1,'#c8684c'); return;
  }
  if(type==='dlbrick') {
    rect(px,py,T,T,'#7a4a38'); for(let k=0;k<4;k++) { rect(px,py+k*8+7,T,1,'#4a2a20'); const o=(k%2)*8; rect(px+((o+10)%T),py+k*8,1,8,'#4a2a20'); rect(px+((o+26)%T),py+k*8,1,8,'#4a2a20'); }
    if(n%5===0) rect(px+4,py+10,10,3,'#8a5a46');
    return;
  }
  if(type==='dldoor') {
    rect(px,py,T,T,'#2a1c14'); rect(px+3,py+2,T-6,T-2,'#5a3a26'); rect(px+5,py+4,T-10,T-6,'#6a4630'); rect(px+5,py+4,T-10,2,'#7a5238');
    rect(px+T-11,py+T/2,3,3,'#f2c75a'); rect(px+T/2-6,py+7,12,6,'#d8c89a'); label('ROOM',px+T/2,py+8,'#3a2a0a',1);
    gfx.globalAlpha=.18+.12*Math.sin(time*2+x); rect(px+3,py+2,T-6,T-2,'#f2c75a'); gfx.globalAlpha=1; return;
  }
  rect(px,py,T,T,'#3a4a52');
};

// ---------- Props ----------
const dlBrass='#c8a040';
// The four keepsakes, drawn centred on (cx,cy), s = scale (1 is about 18 px across).
function dlKeepsake(who,cx,cy,s,time) {
  if(who==='grace') {   // the Sparkling Diamond Gold Soup Dumpling squishy
    ellipse(cx,cy+3*s,9*s,6*s,'#b8861e'); ellipse(cx,cy+2*s,8.4*s,5.6*s,'#f2c75a'); ellipse(cx,cy+1*s,6*s,3.4*s,'#ffe08a');
    for(let k=-2;k<=2;k++) rect(cx+k*3*s-.5*s,cy-3*s,1*s+1,4*s,'#c89a2a');   // pleats
    ellipse(cx-2*s,cy-3*s,2.2*s,1.4*s,'#ffffffb0');
    const g=Math.sin(time*5)*.5+.5; gfx.globalAlpha=.4+.5*g; rect(cx+6*s,cy-5*s,2,2,'#ffffff'); rect(cx-7*s,cy-1*s,2,2,'#cfeeff'); gfx.globalAlpha=1;
  } else if(who==='rose') {   // the shoulder-ride ribbon: a pink bow
    ellipse(cx-5*s,cy,5*s,4*s,'#e87a9c'); ellipse(cx+5*s,cy,5*s,4*s,'#e87a9c'); ellipse(cx-5*s,cy,3*s,2.4*s,'#f4a0c0'); ellipse(cx+5*s,cy,3*s,2.4*s,'#f4a0c0');
    ellipse(cx,cy,2.6*s,2.6*s,'#c8507a'); rect(cx-3*s,cy+2*s,2*s,6*s,'#e87a9c'); rect(cx+1*s,cy+2*s,2*s,7*s,'#e87a9c');
  } else if(who==='amy') {   // the stopwatch
    ellipse(cx,cy+1*s,8*s,8*s,'#6a7078'); ellipse(cx,cy+1*s,7*s,7*s,'#e8ecf0'); rect(cx-1*s,cy-9*s,2*s,3*s,'#6a7078'); rect(cx+5*s,cy-6*s,2*s,2*s,'#6a7078');
    for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; rect(cx+Math.cos(a)*5.6*s,cy+1*s+Math.sin(a)*5.6*s,1,1,'#2a2e34'); }
    const a=-Math.PI/2+time*.8; rect(cx,cy+1*s,1,1,'#d9503f'); for(let k=1;k<=5;k++) rect(cx+Math.cos(a)*k*s,cy+1*s+Math.sin(a)*k*s,1,1,'#d9503f');
  } else {   // TNB's first hand-thrown cup: lopsided, with a handle that is a bit too big
    rect(cx-6*s,cy-5*s,12*s,11*s,'#7a4a32'); rect(cx-6*s,cy-5*s,12*s,2*s,'#a06a48'); rect(cx-5*s,cy+4*s,10*s,2*s,'#5a3622');
    ellipse(cx,cy-5*s,6*s,1.6*s,'#4a2a1a'); ellipse(cx+8*s,cy,4*s,4.4*s,'#7a4a32'); ellipse(cx+8*s,cy,2*s,2.6*s,'#2a1c14');
    rect(cx-4*s,cy-1*s,9*s,1,'#e8c070'); rect(cx-1*s,cy-4*s,1,7*s,'#e8c070');   // a gold repair seam
  }
}
function dlMemPage(o,time,ready) {
  const x=o.x*T,y=o.y*T,cx=x+T/2,col=DL_MEM_COLOR[(o.mem||'').replace(/\d/g,'')]||'#f4e6c8',done=dlFlag('mem-'+o.mem);
  const bob=Math.sin(time*2.2+o.x)*3;
  if(!done) { gfx.globalAlpha=.25+.15*Math.sin(time*3+o.y); ellipse(cx,y+16+bob,17,17,col); gfx.globalAlpha=1; }
  ellipse(cx,y+T-4,9,3,'#00000040');
  gfx.globalAlpha=done?.45:1;
  rect(cx-8,y+4+bob,16,20,'#00000040'); rect(cx-8,y+3+bob,16,20,done?'#8a8470':'#f4ecd0'); rect(cx-8,y+3+bob,16,3,done?col+'80':col);
  for(let k=0;k<4;k++) rect(cx-5,y+9+bob+k*3,10-(k%2)*3,1,'#8a7a50');
  gfx.globalAlpha=1;
  if(!done) for(let k=0;k<4;k++) { const u=(time*.5+k*.25)%1; gfx.globalAlpha=1-u; rect(cx-10+k*7,y+22+bob-u*22,2,2,col); gfx.globalAlpha=1; }
}
function dlKeepProp(o,time) {
  const x=o.x*T,y=o.y*T,cx=x+T/2,who=o.keep,placed=dlFlag('ks-'+who),ready=dlFlag('mem-'+who+'-done');
  ellipse(cx,y+T-3,13,4,'#00000050'); rect(cx-10,y+16,20,12,'#2a1c14'); rect(cx-9,y+17,18,10,'#5a3a26'); rect(cx-10,y+14,20,4,dlBrass); rect(cx-8,y+15,16,1,'#f2d27a');
  if(placed) { dlKeepsake(who,cx,y+7,.9,time); gfx.globalAlpha=.35+.2*Math.sin(time*3); ellipse(cx,y+7,13,13,DL_MEM_COLOR[who]); gfx.globalAlpha=1; }
  else if(ready) { gfx.globalAlpha=.4+.35*Math.sin(time*3); ellipse(cx,y+6,12,12,DL_MEM_COLOR[who]); gfx.globalAlpha=1; for(let k=0;k<3;k++) { const u=(time*.5+k*.33)%1; gfx.globalAlpha=1-u; rect(cx-8+k*8,y+10-u*18,2,2,DL_MEM_COLOR[who]); gfx.globalAlpha=1; } }
  else { ellipse(cx,y+13,8,2.6,'#1a1008'); }
}
function dlClaimDesk(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2;
  const ks=['grace','rose','amy','tnb'].filter(k=>dlFlag('ks-'+k)).length;
  ellipse(cx,b-3,w/2,6,'#00000050');
  // the empty chair behind the desk, with the thermos
  rect(cx-14,y+2,28,30,'#2a1c14'); rect(cx-12,y+4,24,26,'#6a4630'); rect(cx-12,y+4,24,3,'#8a5c3c'); rect(cx-10,y+28,20,10,'#4a2e1e');
  rect(cx+8,y+20,7,12,'#c8ccd2'); rect(cx+8,y+20,7,2,'#e8ecf0'); rect(cx+9,y+18,5,3,'#4a78c2');
  for(let k=0;k<3;k++) { const u=(time*.4+k*.33)%1; gfx.globalAlpha=(1-u)*.5; rect(cx+10+Math.sin(time*2+k)*2,y+16-u*14,2,2,'#ffffff'); gfx.globalAlpha=1; }
  if(ks>0) {   // Tom, in light, leaning toward the chair: stronger with every keepsake
    const a=Math.min(.75,.12+ks*.16); gfx.globalAlpha=a*(.7+.3*Math.sin(time*2)); ellipse(cx-2,y-6,14,22,'#fff3b0'); ellipse(cx-2,y-22,7,8,'#fff6d0'); gfx.globalAlpha=1;
    for(let k=0;k<ks*3;k++) { const u=(time*.35+k*.11)%1; gfx.globalAlpha=1-u; rect(cx-16+(k*13)%28,y+18-u*50,2,2,'#fff6c8'); gfx.globalAlpha=1; }
  }
  // the counter
  rect(x+4,y+h-34,w-8,28,'#2a1c14'); rect(x+5,y+h-33,w-10,26,'#7a5232'); rect(x+5,y+h-33,w-10,4,'#a07448'); rect(x+5,y+h-10,w-10,4,'#4a2e1e');
  rect(x+w/2-3,y+h-38,6,5,dlBrass); ellipse(x+w/2,y+h-38,4,2,'#f2d27a');   // the brass bell
  const nx=[w*.15,w*.38,w*.62,w*.85],who=['grace','rose','amy','tnb'];
  for(let k=0;k<4;k++) {   // four niches on the front, one for each keepsake
    const ncx=x+nx[k]; rect(ncx-12,y+h-30,24,20,'#14100a'); rect(ncx-11,y+h-29,22,18,'#1f160c'); rect(ncx-12,y+h-30,24,2,dlBrass);
    if(dlFlag('ks-'+who[k])) { dlKeepsake(who[k],ncx,y+h-20,.8,time); gfx.globalAlpha=.3; ellipse(ncx,y+h-20,11,9,DL_MEM_COLOR[who[k]]); gfx.globalAlpha=1; }
    else { gfx.globalAlpha=.2; rect(ncx-9,y+h-26,18,12,DL_MEM_COLOR[who[k]]); gfx.globalAlpha=1; }
  }
}
function dlProp(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.sub) {
    case 'belt': {
      ellipse(cx,b-2,w/2,4,'#00000040'); rect(x,y+10,w,16,'#1a2024'); rect(x+2,y+8,w-4,14,'#2a3238'); rect(x+2,y+8,w-4,2,'#3a444c');
      for(let k=0;k<Math.floor(w/14);k++) rect(x+2+((k*14+Math.floor(time*16))%(w-6)),y+10,1,12,'#1a2024');
      for(let k=0;k<4;k++) { const ex=x+4+((k*w/4+time*14)%(w-16)); rect(ex,y+2,10,8,DL_ENV[(k+n)%4]); rect(ex,y+2,10,1,'#fff8e0'); rect(ex+6,y+4,3,3,'#d9503f'); }
      rect(x+4,y+22,3,6,'#1a2024'); rect(x+w-7,y+22,3,6,'#1a2024'); return;
    }
    case 'sack': {
      ellipse(cx,b-3,12,4,'#00000040'); ellipse(cx,y+20,12,11,'#a8885a'); ellipse(cx,y+19,11,10,'#c8a874'); rect(cx-5,y+6,10,5,'#a8885a'); rect(cx-6,y+10,12,2,'#6a4a28');
      rect(cx-6,y+17,12,5,'#f4ecd0'); label('MAIL',cx,y+18,'#8a2a22',1); return;
    }
    case 'ledger': {
      ellipse(cx,b-2,w/2,4,'#00000040'); rect(x+8,y-4,6,28,'#4a2e1e'); rect(x+w-14,y-4,6,28,'#4a2e1e'); rect(x+2,y-8,w-4,8,'#2a1c14'); rect(x+3,y-7,w-6,6,'#6a4630');
      rect(x+4,y-18,w/2-5,12,'#f0e6c8'); rect(x+w/2+1,y-18,w/2-5,12,'#f0e6c8'); rect(x+w/2-1,y-19,2,14,'#8a7a50');
      for(let k=0;k<3;k++) { rect(x+8,y-16+k*3,w/2-14,1,'#8a7a50'); }
      const gl=.5+.5*Math.sin(time*2); gfx.globalAlpha=.55+.35*gl; rect(x+w/2+8,y-15,w/2-20,7,'#fff6d0'); gfx.globalAlpha=1; return;   // the blank rectangle where a name goes
    }
    case 'bench': {
      ellipse(cx,b-1,w/2,4,'#00000040'); rect(x+4,y+12,6,16,'#2a1c14'); rect(x+w-10,y+12,6,16,'#2a1c14'); rect(x,y+8,w,7,'#2a1c14'); rect(x+1,y+9,w-2,5,'#7a5232'); rect(x+1,y+9,w-2,1,'#a07448');
      if(o.x<10) { rect(x+w-20,y-8,14,18,'#8a2a22'); rect(x+w-18,y-6,10,5,'#f4ecd0'); rect(x+w-14,y,2,10,'#f4ecd0'); } else { ellipse(x+w-14,y+3,7,4,'#c89a5a'); rect(x+w-20,y+2,12,1,'#f4ecd0'); }
      return;
    }
    case 'stamp': {
      const u=(time/5.5)%1,drop=u<.12?Math.sin(u/.12*Math.PI)*.5+ (u<.06?u/.06*.5:.5):0,dy=drop*18;
      ellipse(cx,b-4,w*.45,6,'#00000050'); rect(cx-12,b-12,24,5,'#2a1c14'); ellipse(cx,b-8,20,4,'#8a2a22');
      rect(cx-6,y+2+dy,12,26,'#8a5a32'); rect(cx-6,y+2+dy,3,26,'#b88a52'); ellipse(cx,y+2+dy,10,6,'#8a5a32'); ellipse(cx,y+1+dy,7,3.6,'#b88a52');
      rect(cx-18,y+28+dy,36,12,'#8a5a32'); rect(cx-18,y+28+dy,36,3,'#b88a52'); rect(cx-18,y+40+dy,36,5,'#d9503f'); rect(cx-14,y+41+dy,28,1,'#8a2a22');
      if(drop>.8) { gfx.globalAlpha=.6; ellipse(cx,b-8,22,5,'#d9503f'); gfx.globalAlpha=1; } return;
    }
    case 'lamp': {
      const tall=o.h>1;
      if(tall) { ellipse(cx,b-2,8,3,'#00000040'); rect(cx-1,y+10,3,h-14,'#2a2e34'); rect(cx-6,b-6,12,4,'#2a2e34'); ellipse(cx,y+8,12,7,'#3a7a4a'); ellipse(cx,y+7,10,5,'#5aa06a'); }
      else { rect(cx,y-10,1,14,'#2a2e34'); ellipse(cx,y+8,12,7,'#3a7a4a'); ellipse(cx,y+7,10,5,'#5aa06a'); }
      const gl=.5+.5*Math.sin(time*2.1+o.x); gfx.globalAlpha=.16+.1*gl; ellipse(cx,y+(tall?h*.8:34),24,tall?22:20,'#ffe9a0'); gfx.globalAlpha=1; rect(cx-3,y+10,6,2,'#fff6c8'); return;
    }
    case 'beam': {
      ellipse(cx,b-2,w/2,4,'#00000040'); for(const lx of [x+6,x+w-12]) { rect(lx,y+8,5,18,'#8a8a96'); rect(lx-2,y+24,9,3,'#6a6a76'); }
      rect(x,y+4,w,8,'#2a1c14'); rect(x+1,y+5,w-2,6,'#c89a5a'); rect(x+1,y+5,w-2,2,'#e8c080');
      for(let k=0;k<w/16;k++) { rect(x+6+k*16,y+4,5,3,'#f4f4f0'); }
      return;
    }
    case 'score': {
      rect(x+2,y-2,w-4,26,'#0e1014'); rect(x+3,y-1,w-6,24,'#1c2028'); rect(x+3,y-1,w-6,2,'#4a5060');
      label('9.725',cx,y+3,'#ffd24a',2); label('HOME      GUEST',cx,y+16,'#8a90a0',1); rect(x+w-22,y+14,16,5,'#1c2028'); return;
    }
    case 'chalk': { ellipse(cx,b-3,10,3,'#00000040'); rect(cx-8,y+10,16,16,'#6a4a2a'); rect(cx-8,y+10,16,3,'#8a6a40'); ellipse(cx,y+9,8,3,'#f4f4f0'); ellipse(cx,y+8,6,2,'#ffffff'); return; }
    case 'chair': {
      ellipse(cx,b-3,10,3,'#00000040'); rect(cx-9,y+4,18,20,'#7a8090'); rect(cx-8,y+5,16,14,'#9aa0b0'); rect(cx-8,y+19,16,6,'#7a8090'); rect(cx-10,y+24,3,8,'#6a707e'); rect(cx+7,y+24,3,8,'#6a707e');
      rect(cx-4,y+8,6,12,'#c8ccd2'); rect(cx-4,y+8,6,2,'#e8ecf0'); rect(cx-3,y+6,4,3,'#4a78c2');
      for(let k=0;k<2;k++) { const u=(time*.4+k*.5)%1; gfx.globalAlpha=(1-u)*.5; rect(cx-1+Math.sin(time*2+k)*2,y+2-u*12,2,2,'#ffffff'); gfx.globalAlpha=1; } return;
    }
    case 'trophy': {
      rect(x,y+16,w,5,'#2a1c14'); rect(x+1,y+17,w-2,3,'#6a4630');
      for(let k=0;k<Math.floor(w/22);k++) { const tx=x+8+k*22; rect(tx+4,y+10,6,6,'#c8a040'); ellipse(tx+7,y+7,6,5,'#f2c75a'); rect(tx,y+4,2,4,'#c8a040'); rect(tx+12,y+4,2,4,'#c8a040'); rect(tx+3,y+16,8,2,'#8a6a20'); }
      return;
    }
    case 'rack': {
      ellipse(cx,b-2,9,3,'#00000040'); rect(cx-1,y+2,3,h-6,'#4a2e1e'); rect(cx-9,b-5,18,4,'#4a2e1e');
      rect(cx-8,y+2,16,3,'#4a2e1e'); rect(cx-8,y,3,5,'#f2c75a'); rect(cx+5,y,3,5,'#f2c75a');
      const hy=y+h-26; rect(cx-8,hy,5,2,'#f2c75a'); rect(cx-9,hy+2,12,14,'#f2c040'); rect(cx-9,hy+2,12,3,'#ffe27a'); rect(cx-5,hy+16,4,2,'#d8a020'); return;
    }
    case 'ribbon': {
      ellipse(cx,y+22,w/2-2,7,'#c8507a'); ellipse(cx,y+20,w/2-4,6,'#e87a9c'); ellipse(cx,y+19,w/2-12,3.6,'#f4a0c0'); ellipse(cx,y+19,w/2-20,2,'#c8507a');
      rect(x+w-8,y+20,10,2,'#e87a9c'); return;
    }
    case 'stool': {
      ellipse(cx,b-3,9,3,'#00000040'); rect(cx-8,y+10,16,4,'#c89a5a'); rect(cx-8,y+10,16,1,'#e8c080'); rect(cx-7,y+18,14,3,'#a07a44'); rect(cx-8,y+14,2,12,'#8a6a3a'); rect(cx+6,y+14,2,12,'#8a6a3a'); return;
    }
    case 'fort': {
      ellipse(cx,b-3,w/2,5,'#00000040');
      for(const [dx,dy,rx,ry,c] of [[.2,.55,20,13,'#f4a0c0'],[.5,.5,22,15,'#a8c8f0'],[.8,.55,20,13,'#f2e0a0'],[.35,.3,18,12,'#c8a8f0'],[.65,.3,18,12,'#f4c0a0']]) { ellipse(x+dx*w,y+dy*h,rx,ry,'#00000030'); ellipse(x+dx*w,y+dy*h-1,rx-1,ry-1,c); }
      rect(x+10,y+h-30,40,12,'#f4ecd0'); label('TATA + LAMBY',x+30,y+h-28,'#6a3a5a',1); return;
    }
    case 'bleacher': {
      ellipse(cx,b-2,w/2,4,'#00000040');
      for(let k=0;k<2;k++) { rect(x,y+k*h/2+4,w,h/2-2,'#8a909c'); rect(x,y+k*h/2+4,w,3,'#c8ccd6'); rect(x,y+k*h/2+h/2-3,w,2,'#5a606c'); }
      rect(x+w*.35,y+h/2+6,w*.3,10,'#f4ecd0'); label('RESERVED',x+w*.5,y+h/2+8,'#8a2a22',1); return;
    }
    case 'tape': {
      for(const py of [y,b-4]) { rect(cx-3,py,6,8,'#8a909c'); }
      for(let k=0;k<h/8;k++) { rect(cx-1,y+4+k*8,2,5,k%2?'#f4f4f0':'#d9503f'); }
      const s=Math.sin(time*3)*1.5; rect(cx-10+s,y+h/2,8,2,'#f4f4f0'); return;
    }
    case 'clock': {
      rect(x+2,y-2,w-4,26,'#0e1014'); rect(x+3,y-1,w-6,24,'#1c2028'); rect(x+3,y-1,w-6,2,'#4a5060');
      label('0:00.0',cx,y+3,'#ff5a4a',2); label('LAP 3   ...',cx,y+16,'#8a90a0',1); return;
    }
    case 'cone': {
      ellipse(cx,b-3,9,3,'#00000040'); rect(cx-9,b-8,18,4,'#d8742a'); rect(cx-6,y+8,12,16,'#f08a34'); rect(cx-4,y+4,8,6,'#f08a34'); rect(cx-5,y+14,10,3,'#f4f4f0'); rect(cx-4,y+2,3,6,'#f4f4f0'); return;
    }
    case 'hurdle': {
      ellipse(cx,b-2,w/2,3,'#00000040'); rect(x+4,y+8,3,18,'#d8d8e0'); rect(x+w-7,y+8,3,18,'#d8d8e0'); rect(x+2,y+8,w-4,5,'#f4f4f0'); rect(x+2,y+8,w-4,2,'#d9503f'); return;
    }
    case 'kiln': {
      ellipse(cx,b-3,w/2,6,'#00000050'); rect(x+3,y+14,w-6,h-16,'#5a3a2a'); rect(x+4,y+15,w-8,h-18,'#8a5a42');
      for(let k=0;k<5;k++) { rect(x+4,y+22+k*14,w-8,1,'#4a2a1e'); }
      rect(x+8,y+2,w-16,14,'#6a4632'); rect(x+8,y+2,w-16,3,'#9a6a4e'); rect(cx-7,y-4,14,8,'#4a4a52');
      rect(cx-10,y+h*.4,20,20,'#1a1008'); rect(cx-9,y+h*.4+1,18,18,'#ff8a2a'); const gl=.7+.3*Math.sin(time*3); gfx.globalAlpha=gl; rect(cx-6,y+h*.4+4,12,10,'#ffd060'); gfx.globalAlpha=1;
      ellipse(cx,y+h*.4+10,4,5,'#fff2b0'); return;
    }
    case 'wheel': {
      ellipse(cx,b-3,w/2-2,5,'#00000050'); rect(x+6,y+12,w-12,h-18,'#6a707c'); rect(x+6,y+12,w-12,3,'#9aa0ac');
      ellipse(cx,y+16,w/2-8,8,'#4a505c'); ellipse(cx,y+14,w/2-10,6,'#8a909c'); const sp=time*5;
      ellipse(cx,y+12,10,5,'#a07a5a'); rect(cx-3+Math.sin(sp)*2,y+4,6,8,'#b08a68'); rect(cx-2,y+4,2,3,'#c8a888'); return;
    }
    case 'shelf': {
      rect(x,y+16,w,4,'#2a1c14'); rect(x+1,y+17,w-2,2,'#7a5232');
      for(let k=0;k<Math.floor(w/20);k++) { const cx2=x+10+k*20,hh=hash(o.x+k,2)%3; rect(cx2-5,y+6+hh,10,10-hh,['#c8a070','#a8785a','#d8b888'][k%3]); rect(cx2-5,y+6+hh,10,2,'#e8d0a8'); ellipse(cx2+7,y+11,3,3,['#c8a070','#a8785a','#d8b888'][k%3]); ellipse(cx2+7,y+11,1.4,1.4,'#2a1c14'); }
      return;
    }
    case 'clay': {
      ellipse(cx,b-3,10,3,'#00000040'); for(const [dx,dy,c] of [[-6,10,'#d8cbb0'],[6,6,'#c8b898'],[-4,-8,'#d8cbb0']]) { rect(cx+dx-8,y+h/2+dy,16,18,c); rect(cx+dx-8,y+h/2+dy,16,3,'#f0e6d0'); rect(cx+dx-5,y+h/2+dy+7,10,4,'#8a2a22'); }
      return;
    }
    case 'tools': {
      ellipse(cx,b-3,w/2,3,'#00000030'); rect(x+2,y+6,w-4,4,'#4a2e1e'); for(let k=0;k<Math.floor(w/9);k++) { const tx=x+6+k*9,th=10+hash(o.x+k,4)%8; rect(tx,y+10,2,th,'#a8aeb8'); rect(tx-1,y+10+th,4,3,k%2?'#c8a040':'#8a909c'); }
      return;
    }
    default: rect(x+4,y+4,w-8,h-8,'#6a6a76');
  }
}
function dlMailbox(o,time) {   // Tom's mailbox on Second Avenue: a blue street box on a post, with a gold slot that has started to glow
  const x=o.x*T,y=o.y*T,cx=x+T/2,open=dlFlag('ch19-open')&&!dlFlag('ch19-hub');
  ellipse(cx,y+T-2,10,3,'#00000040'); rect(cx-2,y+14,4,18,'#5a4a3a');
  rect(cx-11,y+1,22,16,'#1a3a7a'); rect(cx-10,y+2,20,14,'#2f5fb3'); rect(cx-10,y+2,20,3,'#6a90d8'); ellipse(cx,y+2,10,3,'#3a6ac3');
  rect(cx-7,y+8,14,3,'#0c1830'); rect(cx-5,y+9,10,1,open?'#ffe27a':'#f2c75a'); rect(cx-3,y+12,6,3,'#f4ecd0');
  if(dlFlag('ch19-open')||STORY.chapter===19) { const g=.5+.5*Math.sin(time*3); gfx.globalAlpha=.25+.3*g; ellipse(cx,y+9,15,10,'#ffe27a'); gfx.globalAlpha=1; for(let k=0;k<3;k++) { const u=(time*.5+k*.33)%1; gfx.globalAlpha=1-u; rect(cx-5+k*5,y+8-u*18,2,2,'#fff6c8'); gfx.globalAlpha=1; } }
}
drawObject=function(o,time) {
  if(o.kind==='dlmail') return dlMailbox(o,time);
  if(!dlGround(currentMap)) return LE_drawObject_ch19(o,time);
  switch(o.kind) {
    case 'dlprop': return dlProp(o,time);
    case 'dlmem': return dlMemPage(o,time);
    case 'dlkeep': return dlKeepProp(o,time);
    case 'dlaltar': return dlClaimDesk(o,time);
  }
  return LE_drawObject_ch19(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!dlGround(map)) return LE_buildMiniBase_ch19(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={dlwall:'#141a1e',dlfloor:'#3a4a52',dlrunner:'#6a2a32',dlmat:'#3e66b0',dlpink:'#d890a8',dltrack:'#b8553c',dlbrick:'#7a4a38',dldoor:'#f2c75a',dlvoid:'#06080a'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) { b.fillStyle=col[map.tiles[y][x]]||'#6a6a80'; b.fillRect(x*2,y*2,2,2); }
  for(const o of map.objects) if(o.kind==='dlkeep'||o.kind==='dlaltar') { b.fillStyle='#f2c75a'; b.fillRect(o.x*2,o.y*2,2,2); }
  return c;
};

// ---------- Battle backdrop: the sorting hall, with the Claim Desk lamp on ----------
drawLEBattleBg=function(t) {
  if(!dlGround(currentMap)) return LE_drawLEBattleBg_ch19(t);
  rect(0,0,192,108,'#0c1216');
  for(let r=0;r<4;r++) for(let c=0;c<24;c++) {   // the pigeonhole wall
    const px=c*8,py=r*9+2; rect(px+1,py,6,7,'#05080a'); const m=hash(c,r+7);
    if(m%3!==0) { rect(px+1,py+2+(m%2),6,4,DL_ENV[m%4]); if(m%7===0) rect(px+4,py+3,2,2,'#d9503f'); }
  }
  rect(0,40,192,4,'#1c2428');
  rect(0,44,192,64,'#2e3c44'); for(let k=0;k<9;k++) rect(0,46+k*7,192,1,'#243036'); for(let k=0;k<13;k++) rect(k*15+((k%2)*7),44,1,64,'#243036');
  const now=typeof elapsedTime==='number'?elapsedTime:t||0;
  for(let k=0;k<5;k++) { const ex=((k*40+now*10)%200)-8; rect(ex,52,8,6,DL_ENV[k%4]); rect(ex,52,8,1,'#fff8e0'); }   // an envelope belt along the back
  for(const lx of [30,96,160]) { gfx.globalAlpha=.16+.06*Math.sin(now*2+lx); ellipse(lx,70,34,26,'#ffe9a0'); gfx.globalAlpha=1; rect(lx-5,30,10,4,'#3a7a4a'); rect(lx,0,1,30,'#2a2e34'); }
  gfx.globalAlpha=.1; rect(0,0,192,108,'#0a0810'); gfx.globalAlpha=1;
};

// ---------- Map effect: drifting paper dust, and a little warmth where Tom is being remembered ----------
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch19(time);
  if(!dlGround(currentMap)) return;
  gfx.save();
  for(let k=0;k<22;k++) { const px=((k*53+time*(6+k%5))%(currentMap.w*T)),py=((k*91+time*(3+k%4)*2)%(currentMap.h*T)); gfx.globalAlpha=.25+.2*Math.sin(time+k); rect(px,py,2,2,'#e8dcb4'); }
  gfx.restore();
};
