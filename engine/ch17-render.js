'use strict';
// engine/ch17-render.js — The look of chapter 17 (Part 2): Julian Vance's Glass Tower, Downtown LA. It is always 4:59 PM outside the glass.
//   Ground 'glass': 'glwall' (a curtain wall: dark mullions and a golden-hour skyline you can see through), 'glfloor' (polished glass tile),
//   'glstair' (stair treads with a metal nosing), 'glcarpet' (the Archive: deep blue carpet with a gold pattern).
//   Props: gldesk, gldir, glframes, glclock, glvend, glplant, glbench, glelev, glsign, glsealdoor, glhatch, towershelf (smashable: flag shelf-0..5),
//   glcase, glplinth (the snow globe), and towerfront (the tower seen from the boulevard, on the Downtown map).
// Story state read here: flags ch17-smashed (how many shelves are broken), ch17-locks (all six: the seal is open), shelf-0 to shelf-5.
// Wraps drawOutdoorTile, drawObject, buildMiniBase, drawLEBattleBg, b7DrawMapFx and mcAreaTrack. Loaded after engine/ch13-render.js.
const LE_drawOutdoorTile_ch17=drawOutdoorTile,LE_drawObject_ch17=drawObject,LE_buildMiniBase_ch17=buildMiniBase,LE_drawLEBattleBg_ch17=drawLEBattleBg,
  LE_b7DrawMapFx_ch17=b7DrawMapFx;
let LE_mcAreaTrack_ch17=null;
const glGround=map=>!!(map&&map.style&&map.style.ground==='glass');
const glTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'glvoid';
const glFlag=k=>typeof STORY!=='undefined'&&STORY.mode==='full'&&flag(k);
const GL_FLOORS=['glfloor','glstair','glcarpet'];
addEventListener('DOMContentLoaded',()=>{
  if(typeof mcAreaTrack!=='function'||LE_mcAreaTrack_ch17) return;
  LE_mcAreaTrack_ch17=mcAreaTrack;
  mcAreaTrack=function(m) {
    if(m&&['towerlobby','towerstairs','towershelves','towervault'].includes(m.id)) return 'terminal';
    return LE_mcAreaTrack_ch17(m);
  };
});

// ---------- Ground ----------
const GL_SKY=['#ffe2b0','#ffd49a','#f8c088','#f0a878'];
function glWallFace(px,py,n,x) {   // a glass curtain wall: dark mullions, a golden-hour sky and a skyline, a bright streak
  rect(px,py,T,T,'#1a2338');
  rect(px+1,py+2,T-2,T-4,GL_SKY[0]); rect(px+1,py+10,T-2,T-12,GL_SKY[1]); rect(px+1,py+18,T-2,T-20,GL_SKY[2]); rect(px+1,py+T-8,T-2,6,GL_SKY[3]);
  for(let k=0;k<3;k++) { const m=hash(x*3+k,5),hh=6+(m%14),bx=px+2+k*9; rect(bx,py+T-2-hh,8,hh,k%2?'#6a4658':'#7a5468'); if(m%3===0) rect(bx+2,py+T-2-hh+3,2,2,'#ffe9a0'); }
  rect(px+4+(n%12),py+2,3,T-4,'#ffffff40'); rect(px+T-2,py,2,T,'#0e1424'); rect(px,py+T-3,T,3,'#2a3550');
}
drawOutdoorTile=function(x,y,type,time) {
  if(!glGround(currentMap)) return LE_drawOutdoorTile_ch17(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='glvoid') { rect(px,py,T,T,'#0c0e18'); return; }
  if(type==='glwall') {
    if(GL_FLOORS.includes(glTile(x,y+1))) { glWallFace(px,py,n,x); return; }
    rect(px,py,T,T,'#121a2c'); rect(px+T-2,py,2,T,'#0c1220'); rect(px,py+T-3,T,3,'#1c2640'); return;
  }
  if(type==='glfloor') {
    rect(px,py,T,T,['#c6d2e2','#c2cede','#cad6e6'][n%3]); rect(px,py,T,1,'#dfe8f4'); rect(px,py,1,T,'#dfe8f4'); rect(px,py+T-1,T,1,'#a4b2c8'); rect(px+T-1,py,1,T,'#a4b2c8');
    if(n%4===0) { rect(px+5,py+4,12,2,'#eef4fc'); rect(px+9,py+8,8,1,'#eef4fc'); }
    if(GL_FLOORS.every(t=>glTile(x,y-1)!==t)) rect(px,py,T,4,'#a9b8cf');   // the shadow under a wall
    return;
  }
  if(type==='glstair') {
    rect(px,py,T,T,'#8896ac');
    for(let k=0;k<4;k++) { rect(px,py+k*8,T,3,'#d6e0ee'); rect(px,py+k*8+3,T,4,'#a2b0c6'); rect(px,py+k*8+7,T,1,'#5a6880'); }
    rect(px,py,2,T,'#5a6880'); rect(px+T-2,py,2,T,'#5a6880'); return;
  }
  if(type==='glcarpet') {
    rect(px,py,T,T,'#26224a'); rect(px,py,T,1,'#1c1838'); rect(px,py+T-1,T,1,'#1c1838');
    const d=(x+y)%2; rect(px+14,py+6,4,4,d?'#b8963a':'#8a6e2a'); rect(px+12,py+8,8,1,d?'#b8963a':'#8a6e2a'); rect(px+14,py+22,4,4,d?'#8a6e2a':'#b8963a'); rect(px+12,py+24,8,1,d?'#8a6e2a':'#b8963a');
    rect(px+2,py+2,2,2,'#3a3468'); rect(px+T-4,py+T-4,2,2,'#3a3468'); return;
  }
  rect(px,py,T,T,'#8896ac');
};

// ---------- Props ----------
const glGold='#f2c75a';
function glShelfScene(i,x,y,w,h,time) {   // the tiny town under the dome (x,y,w,h is the dome's inside)
  rect(x,y+h-8,w,8,'#6aa05a'); rect(x,y+h-8,w,2,'#8ac07a');
  switch(i) {
    case 0: rect(x+8,y+h-24,22,16,'#b8b0a8'); rect(x+8,y+h-24,22,3,'#d8d0c8'); rect(x+17,y+h-14,5,6,'#6a4a3a'); rect(x+34,y+h-18,18,6,'#d9503f'); rect(x+42,y+h-12,2,4,'#3a2a22'); ellipse(x+58,y+h-12,3,3,'#e8c8a8'); break;
    case 1: for(let k=0;k<8;k++) rect(x+6+k*9,y+h-12,6,4,k%2?'#d9503f':'#4a78c2'); rect(x+w/2-1,y+6,2,2,'#fff0a0'); rect(x+w/2-4,y+4,8,1,'#ffd24a'); rect(x+w/2,y+2,1,8,'#ffd24a'); break;
    case 2: rect(x+4,y+h-14,w-8,6,'#4f8a4a'); rect(x+w-20,y+6,3,3,'#ffffff'); for(let k=0;k<5;k++) ellipse(x+8+k*10,y+h-14,2,2,k%2?'#d9503f':'#4a78c2'); break;
    case 3: rect(x,y+h-14,w,7,'#4a78c2'); rect(x+10,y+h-22,26,8,'#f4f0e6'); rect(x+10,y+h-22,26,2,'#d9503f'); rect(x+14,y+h-26,5,4,'#f4f0e6'); rect(x+w-14,y+h-18,10,8,'#8a6a4a'); ellipse(x+w-18,y+h-22,2,2,'#e8c8a8'); break;
    case 4: rect(x+6,y+h-22,32,14,'#f4f0e6'); for(let k=0;k<6;k++) rect(x+6+k*6,y+h-22,3,14,'#d9503f'); rect(x+6,y+h-24,32,3,'#d9503f'); for(let k=0;k<4;k++) ellipse(x+w-16+k*3,y+h-12,2,2,'#c88a4a'); break;
    default: rect(x+8,y+h-24,34,16,'#a8453a'); rect(x+8,y+h-26,34,3,'#6a2a22'); for(let k=0;k<5;k++) rect(x+10+k*7,y+h-28,2,2,'#ffe9a0'); rect(x+22,y+h-14,6,6,'#2a1a14'); ellipse(x+w-14,y+h-12,3,3,'#e8c8a8'); ellipse(x+w-9,y+h-12,3,3,'#f4a0c0');
  }
}
function glShelf(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,i=o.shelf,smashed=glFlag('shelf-'+i);
  rect(x+2,y+h-18,w-4,18,'#14182a'); rect(x+3,y+h-17,w-6,16,'#2a3252'); rect(x+3,y+h-17,w-6,3,'#4a5680');   // the plinth under the shelf
  rect(x+w/2-26,y+h-12,52,8,'#0c1020'); rect(x+w/2-24,y+h-11,48,6,glGold); label(CH17_TOWNS[i].town.toUpperCase().slice(0,12),x+w/2,y+h-10,'#3a2a0a',1);
  rect(x+4,y+h-20,w-8,3,'#b8963a');
  const dx=x+10,dy=y-14,dw=w-20,dh=h-4;   // the dome area (a glass case)
  if(!smashed) {
    rect(dx,dy,dw,dh+6,'#8ab4d8'); rect(dx+1,dy+1,dw-2,dh+4,'#bcdcf0'); rect(dx+2,dy+2,dw-4,dh+2,'#d8eefa');
    ellipse(x+w/2,dy+2,dw/2,5,'#e8f6ff'); rect(dx,dy+2,3,dh+2,'#ffffff80');
    glShelfScene(i,dx+4,dy+6,dw-8,dh-6,time);
    for(let k=0;k<6;k++) rect(dx+4+((k*17+Math.floor(time*10))%(dw-8)),dy+6+((k*11+Math.floor(time*8)+k*5)%(dh-10)),1,1,'#ffffffaa');   // a very small snowfall
    rect(dx,dy+dh+2,dw,3,'#6a96bc');
  } else {
    rect(dx,dy+dh-1,dw,4,'#6a96bc');
    for(let k=0;k<7;k++) { const m=hash(i*9+k,41); rect(dx+4+(m%(dw-10)),dy+dh-4-(m>>>4)%3,3+(m%3),2,k%2?'#d8eefa':'#8ab4d8'); }   // shards
    for(let k=0;k<5;k++) { const u=((time*.5)+k*.2+i*.13)%1; gfx.globalAlpha=1-u; rect(dx+8+k*((dw-16)/4),dy+dh-4-u*34,2,2,k%2?'#ffe27a':'#fff6c8'); gfx.globalAlpha=1; }   // glints: the town leaving
  }
}
function glSnowGlobe(cx,cy,R,time) {   // the snow globe on the plinth: the Square, tiny, with two stone figures
  ellipse(cx,cy,R+2,R+2,'#cfeeff66'); ellipse(cx,cy,R,R,'#1b2a38'); ellipse(cx,cy-R*.25,R*.82,R*.6,'#2d4258'); ellipse(cx,cy+R*.58,R*.88,R*.3,'#4d7a4a');
  const s=R/30;
  for(const [dx,dy,w,h,c] of [[-14,6,8,6,'#c7a06a'],[-6,9,7,5,'#b86a5a'],[10,8,7,6,'#7aa0c0'],[17,10,6,5,'#d9c07a']]) rect(cx+dx*s,cy+dy*s,Math.max(2,w*s),Math.max(2,h*s),c);
  ellipse(cx,cy+8*s,4*s,2*s,'#9ad0e8'); rect(cx-3.5*s,cy+4*s,Math.max(2,2.6*s),Math.max(3,5*s),'#9a9aa2'); rect(cx+1*s,cy+3.5*s,Math.max(2,2.6*s),Math.max(3,5.6*s),'#8d8d96');
  const gl=.5+.5*Math.sin(time*2); gfx.globalAlpha=.25+.15*gl; ellipse(cx,cy+7*s,6*s,3*s,'#f2a33a'); gfx.globalAlpha=1;
  for(let i=0;i<20;i++) { const px=cx+Math.sin(i*12.9+time*(.4+(i%3)*.2))*R*.8,py=cy+((i*37.7+time*14*(1+i%3))%(R*1.6))-R*.8; if((px-cx)*(px-cx)+(py-cy)*(py-cy)<R*R*.78) rect(px,py,1,1,'#ffffff'); }
  ellipse(cx-R*.42,cy-R*.5,R*.16,R*.1,'#ffffff55');
}
drawObject=function(o,time) {
  if(o.kind==='towerfront') return glTowerFront(o,time);
  if(!glGround(currentMap)) return LE_drawObject_ch17(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'gldesk': {   // reception: a long glass counter with a lit edge, three nameplates
      ellipse(cx,b-2,w/2,4,'#00000040'); rect(x,y+4,w,22,'#0e1424'); rect(x+1,y+5,w-2,20,'#7aa0c8'); rect(x+1,y+5,w-2,4,'#cfe6fa'); rect(x+1,y+21,w-2,4,'#4a6e98');
      for(let k=0;k<3;k++) { rect(x+10+k*58,y-3,40,9,'#14182a'); rect(x+11+k*58,y-2,38,7,glGold); }
      label('WELCOME',x+30,y-1,'#3a2a0a',1); label('WELCOME BACK',x+88,y-1,'#3a2a0a',1); label('NEVER HERE',x+146,y-1,'#3a2a0a',1); return;
    }
    case 'gldir': {
      rect(x,y-20,w,34,OUT); rect(x+2,y-18,w-4,30,'#1a2338'); rect(x+2,y-18,w-4,3,glGold);
      for(let k=0;k<4;k++) { rect(x+8,y-12+k*6,w-30,2,k%2?'#8aa4d8':'#cfe0f4'); rect(x+w-18,y-12+k*6,8,2,glGold); }
      label('DIRECTORY',cx,y-17,glGold,1); return;
    }
    case 'glframes': {   // a wall of framed afternoons, and a gap
      for(let k=0;k<o.w;k++) { const fx=x+k*T+4,m=hash(o.x+k,3),sky=GL_SKY[m%3];
        rect(fx,y-16,T-8,26,'#2a1c0e'); rect(fx+1,y-15,T-10,24,'#f4e6c8'); rect(fx+3,y-13,T-14,20,sky); rect(fx+3,y-1,T-14,8,'#6aa05a');
        ellipse(fx+8,y-6,2,2,'#2a1c0e'); ellipse(fx+13,y-6,2,2,'#2a1c0e'); rect(fx+7,y-4,8,1,'#6a3a2a'); }
      return;
    }
    case 'glclock': {
      ellipse(cx,y+4,16,16,'#14182a'); ellipse(cx,y+4,14.5,14.5,'#f4f0e6'); ellipse(cx,y+4,14,14,'#e8e0cc');
      for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; rect(cx+Math.cos(a)*12,y+4+Math.sin(a)*12,1,1,'#14182a'); }
      rect(cx,y-6,1,10,'#14182a'); rect(cx,y+4,6,1,'#14182a'); const ang=-Math.PI/2+Math.sin(time*50)*.03; rect(cx+Math.cos(ang)*8,y+4+Math.sin(ang)*8,1,1,'#d9503f'); return;
    }
    case 'glvend': {
      ellipse(cx,b-2,12,3,'#00000040'); rect(x+3,y-18,T-6,44,OUT); rect(x+4,y-17,T-8,42,'#3a4e7a'); rect(x+4,y-17,T-8,3,'#6a84b8');
      rect(x+7,y-12,T-14,18,'#0e1424'); rect(x+8,y-11,T-16,16,Math.floor(time*2)%2?'#ffd9a0':'#f2c780'); label('COFFEE',cx,y-8,'#6a3a1a',1);
      rect(x+9,y+9,T-18,4,'#f4f0e6'); rect(x+11,y+15,T-22,6,'#0e1424'); return;
    }
    case 'glplant': {
      ellipse(cx,b-3,10,3,'#00000040'); rect(cx-8,y+10,16,16,'#14182a'); rect(cx-7,y+11,14,14,'#9cc4e0'); rect(cx-7,y+11,14,3,'#d8eefa');
      for(const [dx,dy,r] of [[0,-4,9],[-7,2,7],[7,2,7],[0,-12,6]]) { ellipse(cx+dx,y+dy,r,r*.8,OUT); ellipse(cx+dx,y+dy,r-1,r*.8-1,'#3f8a4a'); }
      rect(cx-1,y-6,2,14,'#2a6a34'); return;
    }
    case 'glbench': {
      ellipse(cx,b-2,w/2,3,'#00000030'); rect(x+4,y+14,3,10,'#14182a'); rect(x+w-7,y+14,3,10,'#14182a');
      rect(x+2,y+8,w-4,9,'#14182a'); rect(x+3,y+9,w-6,7,'#9cc4e0'); rect(x+3,y+9,w-6,2,'#d8eefa'); return;
    }
    case 'glelev': {   // sliding lift doors (vertical on the west and east walls, horizontal on the north wall)
      const vert=o.h>o.w;
      rect(x,y-(vert?0:14),w,h+(vert?0:14),OUT);
      if(vert) { rect(x+1,y+1,w-2,h/2-1,'#c8d0dc'); rect(x+1,y+h/2+1,w-2,h/2-2,'#b8c0cc'); rect(x+1,y+1,w-2,2,'#e8eef8'); }
      else { rect(x+2,y-12,w/2-3,26,'#d8c07a'); rect(x+w/2+1,y-12,w/2-3,26,'#c8b06a'); rect(x+2,y-12,w-4,3,'#f2d98a'); rect(x+w/2-1,y-12,2,26,'#7a5a1a'); }
      ellipse(vert?cx:cx,vert?y+h+2:y+18,3,3,glFlag('ch17-locks')?'#6ac06a':'#d9503f'); return;
    }
    case 'glsign': {
      rect(x,y-20,w,28,OUT); rect(x+2,y-18,w-4,24,'#1a2a4a'); rect(x+2,y-18,w-4,3,glGold);
      label(String(o.sign||'TOWER'),cx,y-11,'#f4f0e6',1); label('GLASS TOWER',cx,y-3,'#8aa4d8',1); rect(x+6,y+8,2,6,OUT); rect(x+w-8,y+8,2,6,OUT); return;
    }
    case 'glsealdoor': {   // the seal: a heavy glass door, a gold lock, a counter of locks still engaged
      const open=glFlag('ch17-locks'),left=Math.max(0,6-(Number(glFlag('ch17-smashed'))||0));
      rect(x,y-16,w,h+16,OUT); rect(x+2,y-14,w-4,h+12,open?'#ffe9a0':'#9cc4e0'); rect(x+2,y-14,w-4,3,open?'#fff6c8':'#d8eefa');
      if(!open) { ellipse(cx,y+6,10,10,OUT); ellipse(cx,y+6,8.4,8.4,glGold); ellipse(cx,y+6,3,3,'#3a2a0a'); rect(cx-1,y+6,2,6,'#3a2a0a'); }
      rect(x+4,y-26,w-8,10,OUT); rect(x+5,y-25,w-10,8,'#0e1424'); label((open?'0':String(left))+' OF 6',cx,y-24,open?'#6ac06a':'#d9503f',1); return;
    }
    case 'glhatch': {   // a service hatch with a wheel
      rect(x,y-6,w,h+6,OUT); rect(x+1,y-5,w-2,h+4,'#8a94a8'); rect(x+1,y-5,w-2,2,'#c8d0dc');
      ellipse(cx,y+4,7,7,OUT); ellipse(cx,y+4,5.6,5.6,'#d8c07a'); rect(cx-5,y+3,10,2,OUT); rect(cx-1,y-1,2,10,OUT);
      rect(x+3,y+h-4,8,3,'#f2c75a'); return;
    }
    case 'towershelf': return glShelf(o,time);
    case 'glcase': {
      rect(x+2,y-4,w-4,h+4,OUT); rect(x+3,y-3,w-6,h+2,'#bcdcf0'); rect(x+4,y-2,w-8,h-2,'#14182a');
      const gl=.5+.5*Math.sin(time*1.4+n); gfx.globalAlpha=.4+.2*gl; rect(x+5,y-1,w-10,h-4,'#ffd9a0'); gfx.globalAlpha=1;
      for(let k=0;k<3;k++) rect(x+8+k*10,y+8+(k%2)*6,6,6,k%2?'#d9503f':'#4a78c2'); rect(x+3,y+h-3,w-6,3,'#6a84b8'); return;
    }
    case 'glplinth': {
      ellipse(cx,b-3,w/2,5,'#00000050'); rect(x+8,y+16,w-16,h-16,OUT); rect(x+10,y+18,w-20,h-18,'#9cc4e0'); rect(x+10,y+18,w-20,3,'#d8eefa');
      rect(x+w/2-3,y-70,6,24,'#c8a040'); gfx.globalAlpha=.55; rect(x+w/2-1,y-90,2,30,'#ffd36a'); gfx.globalAlpha=1;   // a cable up into the ceiling
      glSnowGlobe(cx,y-18,32,time); return;
    }
  }
  return LE_drawObject_ch17(o,time);
};
// The tower from the boulevard (a base on the Downtown map): a glass facade rising off the top of the screen, a gold awning, a glowing door.
function glTowerFront(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,b=y+o.h*T,cx=x+w/2,top=Math.max(0,y-T);
  const x0=x-T*.4,ww=w+T*.8;
  rect(x0-2,top,ww+4,b-top,'#0e1424'); rect(x0,top,ww,b-top,'#1a2338');
  for(let r=0;r<Math.ceil((b-top)/20);r++) for(let c=0;c<Math.floor(ww/14);c++) {
    const px=x0+3+c*14,py=top+3+r*20; if(py+14>b-26) continue;
    const m=hash(c,r+7); rect(px,py,11,15,m%7===0?'#ffe9a0':GL_SKY[(m+r)%3]); rect(px+8,py,2,15,'#ffffff40'); }
  rect(x0,b-34,ww,5,'#f2c75a'); rect(x0,b-29,ww,3,'#a8781a');   // a gold band
  rect(cx-T,b-26,T*2,26,OUT); rect(cx-T+2,b-24,T*2-4,24,'#cfeeff'); rect(cx-T+2,b-24,T*2-4,3,'#ffffff'); rect(cx-1,b-24,2,24,'#6a84b8');   // the glass doors
  const gl=.5+.5*Math.sin(time*1.6); gfx.globalAlpha=.18+.12*gl; rect(cx-T-6,b-34,T*2+12,34,'#ffe9a0'); gfx.globalAlpha=1;
  rect(cx-T-4,b-38,T*2+8,6,'#d9503f'); label('THE TOWER',cx,b-37,'#f4f0e6',1);
  ellipse(cx,b-2,w/2+6,4,'#00000040');
}

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!glGround(map)) return LE_buildMiniBase_ch17(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={glwall:'#1a2338',glfloor:'#c6d2e2',glstair:'#8896ac',glcarpet:'#26224a',glvoid:'#0c0e18'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) { b.fillStyle=col[map.tiles[y][x]]||'#6a6a80'; b.fillRect(x*2,y*2,2,2); }
  for(const o of map.objects) if(o.restore) { b.fillStyle='#f2c75a'; b.fillRect(o.x*2,o.y*2,2,2); }
  return c;
};

// ---------- Battle backdrops ----------
// The tower: a glass wall with the golden afternoon behind it, polished floor with reflections. The vault: the same wall with a dark ceiling and the plinth.
drawLEBattleBg=function(t) {
  if(!glGround(currentMap)) return LE_drawLEBattleBg_ch17(t);
  const vault=currentMap.id==='towervault',arch=currentMap.id==='towershelves';
  rect(0,0,192,108,'#1a2338');
  for(let k=0;k<4;k++) rect(0,4+k*11,192,11,GL_SKY[k]);
  for(let k=0;k<22;k++) { const n=hash(k,53),hh=8+(n%24); rect(k*9,48-hh,8,hh,k%2?'#6a4658':'#7a5468'); if(n%3===0) rect(k*9+2,48-hh+3,2,2,'#ffe9a0'); }
  for(let k=0;k<192;k+=24) rect(k,0,2,50,'#0e1424'); rect(0,0,192,3,'#0e1424'); rect(0,48,192,4,'#0e1424');
  gfx.globalAlpha=.16; rect(30,0,26,50,'#ffffff'); rect(110,0,14,50,'#ffffff'); gfx.globalAlpha=1;
  if(arch) { rect(0,52,192,56,'#26224a'); for(let k=0;k<192;k+=24) for(let j=0;j<3;j++) { rect(k+10,58+j*16,4,4,'#b8963a'); rect(k+8,60+j*16,8,1,'#b8963a'); } rect(0,52,192,2,'#1c1838'); return true; }
  rect(0,52,192,56,'#c6d2e2'); for(let k=0;k<192;k+=24) rect(k,52,1,56,'#a4b2c8'); for(let k=52;k<108;k+=14) rect(0,k,192,1,'#a4b2c8');
  gfx.globalAlpha=.3; rect(20,56,60,5,'#ffffff'); rect(120,70,40,4,'#ffffff'); gfx.globalAlpha=1;
  if(vault) { gfx.globalAlpha=.6; rect(0,0,192,16,'#0c0e18'); gfx.globalAlpha=1; rect(160,52,16,22,'#9cc4e0'); ellipse(168,48,9,9,'#1b2a38'); ellipse(168,48,8,8,'#2d4258'); }
  return true;
};

// ---------- Map effects ----------
// Shelf release: when a shelf breaks, a column of gold light rises from it for a moment (ch17Smash sets CH17_GLOW).
const CH17_GLOW={};
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch17(time);
  if(typeof STORY==='undefined'||STORY.mode!=='full') return;
  if(currentMap.id==='towershelves') {
    for(const k of Object.keys(CH17_GLOW)) { const g=CH17_GLOW[k],u=Math.min(1,(time-g.t0)/2.4); if(u>=1) { delete CH17_GLOW[k]; continue; }
      const [sx,sy]=CH17_SHELVES[k]; const cx=(sx+2)*T,by=sy*T+T;
      gfx.save(); gfx.globalAlpha=(1-u)*.5; rect(cx-18,by-40-u*100,36,40+u*100,'#ffe27a'); gfx.globalAlpha=(1-u)*.8; rect(cx-6,by-60-u*120,12,60+u*120,'#fff6c8'); gfx.restore(); }
  }
};
