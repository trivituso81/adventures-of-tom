'use strict';
// engine/barn-render.js — The look of chapter 8's Division Nine Car Barn (ground 'barn': red 'brickwall' that shows its
// face when there is floor below it, 'barnfloor' concrete, 'rails' streetcar track, 'paintfloor', 'steelfloor',
// 'lunchfloor', the turntable 'ttpit' and its 'ttbridge') and the Boiler Room (ground 'boiler': 'boilerfloor',
// 'hearth'). Props: streetcar, paintcans, sawhorse, paintrack, workbench, toolboard, bogie, lathe, oilcans, timeclock,
// dispatch, barnbench, lockers, menuboard, vending, lunchtable, ttmotor, ttlever, tracksign, coalcart, lunchpail,
// boilertank, coalpile, breadrack, ashbin, peelrack. Also the minimap and the battle backdrops (wraps drawLABattleBg).
// Wraps drawOutdoorTile, drawObject and buildMiniBase. Loaded after engine/library-render.js.
const LE_drawOutdoorTile_barn=drawOutdoorTile,LE_drawObject_barn=drawObject,LE_buildMiniBase_barn=buildMiniBase,LE_drawLABattleBg_barn=drawLABattleBg;
const BARN_GROUNDS=['barn','boiler'];
const barnGround=map=>{ const g=map&&map.style&&map.style.ground; return BARN_GROUNDS.includes(g)?g:null; };
const barnTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'brickwall';
const BARN_FLOOR={barnfloor:['#8a8780','#86837c','#8e8b84'],rails:['#8a8780','#86837c','#8e8b84'],paintfloor:['#8f8a7e','#8b867a','#938e82'],
  steelfloor:['#6f767c','#6b7278','#737a80'],lunchfloor:['#e8e0cc','#2f5a4a','#e8e0cc'],boilerfloor:['#6a3a2a','#663626','#6e3e2e'],
  hearth:['#8a4a30','#86462c','#8e4e34'],ttbridge:['#7a5a3a','#76563a','#7e5e3e'],ttpit:['#1e1a18','#1e1a18','#1e1a18']};
const BARN_KINDS=new Set(['streetcar','paintcans','sawhorse','paintrack','workbench','toolboard','bogie','lathe','oilcans','timeclock','dispatch',
  'barnbench','lockers','menuboard','vending','lunchtable','ttmotor','ttlever','tracksign','coalcart','lunchpail','boilertank','coalpile',
  'breadrack','ashbin','peelrack']);
const barnWarm=()=>typeof flag==='function'&&STORY.mode==='full'&&(STORY.chapter>8||!!flag('ch8-wrap'));

function barnBrickFace(px,py,n,boiler) {
  rect(px,py,T,T,boiler?'#3a1a12':'#8a3a2a');
  for(let r=0;r<4;r++) { const yy=py+4+r*7; rect(px,yy,T,1,boiler?'#6a3a28':'#c9b8a0');
    const off=(r%2)*8; for(let k=off;k<T;k+=16) rect(px+k,yy,1,7,boiler?'#6a3a28':'#c9b8a0'); }
  if(n%5===0) rect(px+6+(n%16),py+12,6,3,boiler?'#2a120c':'#9a4a36');
  rect(px,py,T,4,boiler?'#2a140e':'#4a2a20');
}
// A streetcar track across one tile (ties and two rails), vertical or horizontal.
function barnTrack(px,py,vert,horz) {
  if(vert) { for(let k=2;k<T;k+=8) rect(px+5,py+k,T-10,3,'#5a4632'); rect(px+9,py,2,T,'#c9ccd4'); rect(px+T-11,py,2,T,'#c9ccd4'); rect(px+9,py,1,T,'#ffffff60'); }
  if(horz) { for(let k=2;k<T;k+=8) rect(px+k,py+5,3,T-10,'#5a4632'); rect(px,py+9,T,2,'#c9ccd4'); rect(px,py+T-11,T,2,'#c9ccd4'); rect(px,py+9,T,1,'#ffffff60'); }
}
// The turntable pit: concrete outside the circle, dark inside, with the ring rail. Clipped to one tile.
function barnPit(px,py) {
  const c=gfx,cx=BARN_TT.cx*T,cy=BARN_TT.cy*T,r=BARN_TT.r*T;
  rect(px,py,T,T,'#86837c');
  c.save(); c.beginPath(); c.rect(px,py,T,T); c.clip();
  ellipse(cx,cy,r,r,'#4a4440'); ellipse(cx,cy,r-4,r-4,'#1e1a18');
  c.strokeStyle='#8a8f98'; c.lineWidth=2; c.beginPath(); c.arc(cx,cy,r-12,0,Math.PI*2); c.stroke();
  c.restore();
}

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=barnGround(currentMap);
  if(!g) return LE_drawOutdoorTile_barn(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='brickwall') {
    const below=barnTile(x,y+1);
    if(BARN_FLOOR[below]&&below!=='ttpit') { barnBrickFace(px,py,n,g==='boiler'); return; }
    rect(px,py,T,T,g==='boiler'?'#24120c':'#2e1a14'); rect(px,py+T-3,T,3,'#4a2a20');
    return;
  }
  if(type==='ttpit') { barnPit(px,py); return; }
  if(type==='ttbridge') {
    barnPit(px,py);
    const M=currentMap,east=!!M.ttEast;
    rect(px,py,T,T,'#00000000');
    if(east) { rect(px,py+3,T,T-6,'#7a5a3a'); for(let k=0;k<T;k+=6) rect(px+k,py+3,1,T-6,'#5a4026'); rect(px,py+3,T,2,'#9a7a52');
      const ry=y===BARN_TT.cy-1?py+T-10:py+8; rect(px,ry,T,2,'#c9ccd4'); }
    else { rect(px+3,py,T-6,T,'#7a5a3a'); for(let k=0;k<T;k+=6) rect(px+3,py+k,T-6,1,'#5a4026'); rect(px+3,py,2,T,'#9a7a52');
      const rx=x===BARN_TT.cx-1?px+T-10:px+8; rect(rx,py,2,T,'#c9ccd4'); }
    return;
  }
  const pal=BARN_FLOOR[type]||BARN_FLOOR.barnfloor;
  if(type==='lunchfloor') { rect(px,py,T,T,'#e8e0cc'); rect(px,py,T/2,T/2,'#2f5a4a'); rect(px+T/2,py+T/2,T/2,T/2,'#2f5a4a'); return; }
  rect(px,py,T,T,pal[n%3]);
  if(type==='steelfloor') { for(let k=4;k<T;k+=8) for(let j=4;j<T;j+=8) rect(px+k+((j/8)%2)*3,py+j,3,1,'#8a9298'); rect(px,py,T,1,'#5a6268'); rect(px,py,1,T,'#5a6268'); }
  else if(type==='boilerfloor'||type==='hearth') {
    for(let r=0;r<4;r++) { rect(px,py+r*8,T,1,shadeHex(pal[0],-24)); for(let k=(r%2)*8;k<T;k+=16) rect(px+k,py+r*8,1,8,shadeHex(pal[0],-24)); }
    if(type==='hearth'&&barnTile(x,y+1)!=='hearth') { rect(px,py+T-6,T,6,'#4a2216'); rect(px,py+T-6,T,2,'#c9a23a'); }
    if(n%6===0) ellipse(px+8+(n%16),py+10+((n>>>4)%14),3,2,'#2a1a14');
  } else {
    if(n%4===0) rect(px+6+(n%18),py+8+((n>>>3)%16),3,2,shadeHex(pal[0],-16));
    if(n%11===0) rect(px+((n>>>5)%24),py+((n>>>9)%24),8,1,'#6a6760');
    if(type==='paintfloor'&&n%3===0) ellipse(px+6+(n%20),py+6+((n>>>4)%20),3+(n%3),2,['#e8b830','#3f7a4a','#c8463a'][n%3]);
  }
  if(type==='rails') {
    const R=(a,b)=>['rails'].includes(barnTile(a,b));
    barnTrack(px,py,R(x,y-1)||R(x,y+1),R(x-1,y)||R(x+1,y));
  }
};

// ---------- Props ----------
drawObject=function(o,time) {
  if(!BARN_KINDS.has(o.kind)||!barnGround(currentMap)) return LE_drawObject_barn(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y),warm=barnWarm();
  const shadow=(rw=w/2)=>ellipse(cx,b-2,rw,4,'#00000040');
  switch(o.kind) {
    case 'streetcar': {
      // Car 9, nose toward us: a long roof going up, the front with a big window, a headlamp and the route sign.
      const done=typeof flag==='function'&&!!flag('ch8-done');
      shadow(w/2+4);
      rect(x-2,y-8,w+4,h+4,OUT); rect(x,y-6,w,h,done?'#e8b830':'#d9cfb8');
      rect(x,y-6,w/2,h,'#e8b830'); rect(x,y-6,w,4,'#3f7a4a'); rect(x+w/2-1,y-14,2,8,OUT);   // trolley pole
      for(let k=0;k<4;k++) rect(x+4,y+4+k*14,w-8,8,'#2a3440');                        // side windows from above
      rect(x-2,b-34,w+4,32,OUT); rect(x,b-32,w,28,done?'#e8b830':'#e8b830');
      rect(x+6,b-28,w-12,12,'#9fc8e0'); rect(x+8,b-26,8,4,'#ffffff80');
      rect(x+10,b-40,w-20,7,OUT); rect(x+11,b-39,w-22,5,'#f4f0e6'); label('7',cx,b-38,'#2a3440',1);
      ellipse(cx,b-10,4,4,OUT); ellipse(cx,b-10,3,3,warm?'#fff1a8':'#8a8f98');
      rect(x+2,b-5,w-4,3,'#3f7a4a'); label('9',x+8,b-14,'#2a3440',1);
      return;
    }
    case 'paintcans': {
      shadow(10);
      for(const [dx,c] of [[-7,'#e8b830'],[3,'#3f7a4a']]) { rect(cx+dx-1,b-17,10,15,OUT); rect(cx+dx,b-16,8,13,c); rect(cx+dx,b-16,8,3,'#c9ccd4'); }
      if(!warm) rect(cx-7,b-17,18,2,'#dff0fa');
      return;
    }
    case 'sawhorse': {
      shadow();
      rect(x+2,y+10,w-4,6,OUT); rect(x+3,y+11,w-6,4,'#b8845a');
      for(const lx of [x+6,x+w-10]) { rect(lx,y+14,3,16,OUT); rect(lx+5,y+14,3,16,OUT); }
      rect(x+6,y+2,w-12,9,OUT); rect(x+7,y+3,w-14,7,'#e8b830'); rect(x+7,y+3,(w-14)/2,7,'#d9cfb8');
      return;
    }
    case 'paintrack': {
      shadow();
      rect(x+4,y-14,3,h+12,OUT); rect(x+w-7,y-14,3,h+12,OUT); rect(x+4,y-14,w-8,3,OUT);
      for(let k=0;k<3;k++) rect(x+10+k*14,y-11,10,22,['#c9c0a8','#b8ad94','#c9c0a8'][k]);
      if(!warm&&Math.floor(time*2+n)%3===0) rect(x+15,b-6,2,3,'#6cc4f0');
      return;
    }
    case 'workbench': {
      shadow();
      rect(x,y+4,w,12,OUT); rect(x+1,y+5,w-2,10,'#8a6440'); rect(x+1,y+5,w-2,3,'#a88058');
      rect(x+4,y+16,3,14,OUT); rect(x+w-7,y+16,3,14,OUT);
      rect(x+10,y-4,10,9,OUT); rect(x+11,y-3,8,7,'#8a8f98');                            // vise
      rect(x+w-20,y-4,8,9,OUT); rect(x+w-19,y-3,6,7,'#f4f0e6'); if(!warm) rect(x+w-19,y-3,6,2,'#dff0fa');   // the mug
      return;
    }
    case 'toolboard': {
      rect(x+2,y-20,w-4,30,OUT); rect(x+3,y-19,w-6,28,'#c9a06a');
      for(let k=0;k<5;k++) rect(x+8+k*10,y-14,2,14,'#4a4440');
      gfx.globalAlpha=.6; rect(x+w-18,y-6,10,10,'#4a2a20'); gfx.globalAlpha=1;            // the little stove's outline
      return;
    }
    case 'bogie': {
      shadow(w/2);
      for(const jx of [x+4,x+w-10]) { rect(jx,y+14,6,16,OUT); rect(jx+1,y+15,4,14,'#d9a43a'); }
      rect(x+2,y+2,w-4,12,OUT); rect(x+3,y+3,w-6,10,'#4a4440');
      for(const wx of [x+14,x+w-14]) { ellipse(wx,y+16,9,9,OUT); ellipse(wx,y+16,7,7,'#6a6460'); ellipse(wx,y+16,2,2,'#c9ccd4'); }
      return;
    }
    case 'lathe': {
      shadow();
      rect(x+2,y+2,w-4,14,OUT); rect(x+3,y+3,w-6,12,'#3f6a5a'); rect(x+8,y-6,12,10,OUT); rect(x+9,y-5,10,8,'#4f7a6a');
      rect(x+w-16,y+4,10,6,'#c9ccd4'); rect(x+4,y+16,4,14,OUT); rect(x+w-8,y+16,4,14,OUT);
      rect(x+18,y+6,16,3,OUT); rect(x+19,y+7,14,1,'#f4f0e6');
      return;
    }
    case 'oilcans': {
      shadow(10);
      for(let k=0;k<3;k++) { const ox=x+4+k*8; rect(ox,b-14,7,12,OUT); rect(ox+1,b-13,5,10,'#c8463a'); rect(ox+3,b-22,1,9,OUT); }
      return;
    }
    case 'timeclock': {
      rect(x+6,y-18,T-12,28,OUT); rect(x+7,y-17,T-14,26,'#8a6440');
      ellipse(cx,y-8,7,7,OUT); ellipse(cx,y-8,6,6,'#f4f0e6'); rect(cx,y-12,1,4,OUT); rect(cx,y-8,3,1,OUT);
      for(let k=0;k<4;k++) rect(x+9+k*4,y+2,2,6,'#e8e0cc');
      return;
    }
    case 'dispatch': {
      rect(x+2,y-22,w-4,30,OUT); rect(x+3,y-21,w-6,28,'#2a3a32');
      label('DIVISION 9',cx,y-18,'#fff1cb',1);
      for(let k=0;k<4;k++) { rect(x+8,y-10+k*4,w-16,2,'#3f5a4a'); label(String(k+1),x+10,y-11+k*4,'#e8c84a',1); }
      rect(x+w-14,y+1,6,2,'#e8c84a');
      return;
    }
    case 'barnbench': {
      shadow();
      rect(x+2,y+8,w-4,6,OUT); rect(x+3,y+9,w-6,4,'#a88058'); rect(x+2,y-2,w-4,4,OUT); rect(x+3,y-1,w-6,2,'#a88058');
      for(const lx of [x+6,x+w-9]) rect(lx,y+14,3,14,OUT);
      return;
    }
    case 'lockers': {
      rect(x,y-24,w,h+22,OUT);
      for(let k=0;k<o.w*2;k++) { const lx=x+1+k*(w-2)/(o.w*2); rect(lx,y-23,(w-2)/(o.w*2)-1,h+20,'#4a6a8a'); rect(lx+3,y-18,8,1,'#2a3a4a'); rect(lx+3,y-15,8,1,'#2a3a4a'); rect(lx+10,y-4,2,4,'#c9ccd4'); }
      return;
    }
    case 'menuboard': {
      rect(x+2,y-22,w-4,28,OUT); rect(x+4,y-20,w-8,24,'#2a3a32'); rect(x+2,y-22,w-4,3,'#8a6440');
      label('TONIGHT',cx,y-17,'#fff1cb',1); rect(x+8,y-8,w-16,1,'#e8e0cc'); rect(x+8,y-4,w-22,1,'#e8e0cc'); rect(x+8,y,w-18,1,'#e8e0cc');
      return;
    }
    case 'vending': {
      shadow(12);
      rect(x+2,y-24,T-4,h+22,OUT); rect(x+3,y-23,T-6,h+20,'#c8463a');
      rect(x+6,y-19,T-14,24,'#2a3440'); for(let r=0;r<4;r++) for(let k=0;k<3;k++) rect(x+8+k*5,y-17+r*6,3,4,['#e8c84a','#6ac06a','#e86a3a'][(r+k)%3]);
      rect(x+T-8,y-16,3,10,'#c9ccd4');
      return;
    }
    case 'lunchtable': {
      shadow();
      rect(x,y+4,w,12,OUT); rect(x+1,y+5,w-2,10,'#c9b48a'); rect(x+1,y+5,w-2,2,'#e0cca0');
      for(const lx of [x+6,x+w-9]) rect(lx,y+16,3,14,OUT);
      if(o.plate) { ellipse(cx,y+9,8,4,'#f4f0e6'); ellipse(cx,y+9,5,2,'#e8e0cc');
        if(typeof flag==='function'&&flag('ch8-plate')) { rect(cx-4,y+7,8,3,'#c98a4a'); } }
      if(o.plate&&typeof ch8CanPlate==='function'&&ch8CanPlate()&&Math.floor(time*2)%2) label('!',cx,y-12,'#ffe08a',2);
      return;
    }
    case 'ttmotor': {
      shadow();
      const on=typeof flag==='function'&&(!!flag('ch8-motor')||STORY.chapter>8);
      rect(x+2,y-12,w-4,26,OUT); rect(x+3,y-11,w-6,24,'#3a5a4a'); rect(x+3,y-11,w-6,3,'#5a7a6a');
      for(let k=0;k<3;k++) { const bx=x+12+k*16; ellipse(bx,y+6,5,3,OUT); if(on) { const f=Math.sin(time*9+k)*1.5; ellipse(bx,y+3,4,5+f,'#6cb0ff'); ellipse(bx,y+3,2,3,'#dff0ff'); } else ellipse(bx,y+6,4,2,'#1e1a18'); }
      ellipse(x+w-14,y-14,7,7,OUT); ellipse(x+w-14,y-14,6,6,'#f4f0e6'); rect(x+w-14,y-17,1,4,on?'#c8463a':OUT);   // pressure gauge
      if(on) { gfx.globalAlpha=.5; ellipse(x+12+Math.sin(time*2)*3,y-22-(time*12%14),5,4,'#ffffff'); gfx.globalAlpha=1; }
      if(typeof ch8MotorReady==='function'&&ch8MotorReady()&&Math.floor(time*2)%2) label('!',cx,y-34,'#ffe08a',2);
      return;
    }
    case 'ttlever': {
      const east=!!currentMap.ttEast,a=east?.5:-.5;
      rect(x+8,b-8,T-16,6,OUT); rect(x+9,b-7,T-18,4,'#6a6460');
      gfx.save(); gfx.translate(cx,b-6); gfx.rotate(a); rect(-2,-26,4,24,OUT); rect(-1,-25,2,22,'#8a8f98'); ellipse(0,-27,4,4,'#c8463a'); gfx.restore();
      label(east?'4':'1',cx,b-4,'#ffe08a',1);
      return;
    }
    case 'tracksign': {
      rect(cx-1,y+4,2,24,OUT); rect(x+4,y-8,T-8,13,OUT); rect(x+5,y-7,T-10,11,'#f4f0e6');
      label(o.y>16?'1':'4',cx,y-4,'#2a3440',1);
      return;
    }
    case 'coalcart': {
      shadow();
      rect(x+4,y+2,w-8,16,OUT); rect(x+5,y+3,w-10,14,'#4a4440');
      for(let k=0;k<7;k++) ellipse(x+10+k*7,y+2+(k%2)*2,5,4,'#1e1a18');
      for(const wx of [x+12,x+w-12]) { ellipse(wx,b-8,5,5,OUT); ellipse(wx,b-8,3,3,'#8a8f98'); }
      return;
    }
    case 'lunchpail': {
      shadow(10);
      rect(x+6,y+10,T-12,14,OUT); rect(x+7,y+11,T-14,12,'#8a8f98'); rect(x+7,y+11,T-14,3,'#c9ccd4');
      gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(cx,y+11,7,Math.PI,0); gfx.stroke();
      if(typeof flag==='function'&&!flag('ch8-pail')&&STORY.mode==='full'&&STORY.chapter===8&&Math.floor(time*2)%2) label('!',cx,y-10,'#ffe08a',2);
      return;
    }
    case 'boilertank': {
      shadow(w/2);
      rect(x+2,y-14,w-4,h+10,OUT); rect(x+3,y-13,w-6,h+8,'#4a4440'); rect(x+3,y-13,w-6,6,'#5e5650');
      for(let k=0;k<5;k++) for(let j=0;j<3;j++) rect(x+10+k*16,y-4+j*14,2,2,'#8a8f98');
      ellipse(x+w-18,y+10,8,8,OUT); ellipse(x+w-18,y+10,7,7,'#f4f0e6'); rect(x+w-18,y+5,1,5,OUT);
      rect(x+w-12,y-30,6,18,OUT); rect(x+w-11,y-29,4,16,'#6a6460');
      return;
    }
    case 'coalpile': {
      shadow(w/2);
      polygon([[x+2,b-2],[cx,y-(o.h>1?18:6)],[x+w-2,b-2]],OUT); polygon([[x+4,b-3],[cx,y-(o.h>1?16:4)],[x+w-4,b-3]],'#2a2624');
      for(let k=0;k<8;k++) { const q=hash(o.x+k,o.y); ellipse(x+8+q%(w-16),b-6-((q>>>4)%Math.max(4,h-10)),3,2,'#4a4440'); }
      return;
    }
    case 'breadrack': {
      shadow();
      rect(x+4,y-30,3,h+28,OUT); rect(x+w-7,y-30,3,h+28,OUT);
      const full=typeof flag==='function'&&!!flag('ch8-clear');
      for(let r=0;r<4;r++) { rect(x+4,y-26+r*12,w-8,2,'#8a8f98');
        if(full) for(let k=0;k<4;k++) { ellipse(x+14+k*12,y-29+r*12,5,3,'#c98a4a'); rect(x+12+k*12,y-30+r*12,4,1,'#e8c088'); } }
      return;
    }
    case 'ashbin': {
      shadow(10);
      rect(x+5,y+10,T-10,14,OUT); rect(x+6,y+11,T-12,12,'#4a4440'); rect(x+6,y+11,T-12,4,'#8a8780');
      if(typeof flag==='function'&&flag('ch8-clear')) { gfx.globalAlpha=.4+.2*Math.sin(time*3); ellipse(cx,y+13,6,2,'#ffb04a'); gfx.globalAlpha=1; }
      return;
    }
    case 'peelrack': {
      rect(x+4,y-20,T-8,4,OUT); rect(x+5,y-19,T-10,2,'#8a6440');
      for(let k=0;k<3;k++) rect(x+8+k*7,y-16,1,4,'#c9ccd4');
      if(!(typeof flag==='function'&&flag('ch8-clear'))) { rect(x+21,y-16,3,30,'#b8845a'); ellipse(x+22,y+16,6,8,'#c9a06a'); }
      return;
    }
  }
  return LE_drawObject_barn(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!barnGround(map)) return LE_buildMiniBase_barn(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={brickwall:'#4a2a20',ttpit:'#1e1a18',rails:'#a8a49c'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(BARN_FLOOR[t]&&BARN_FLOOR[t][t==='lunchfloor'?1:0])||'#8a8780';
    b.fillRect(x*2,y*2,2,2);
  }
  return c;
};

// ---------- Battle backdrops ----------
// The Car Barn: brick, tall arched windows, a yellow streetcar on the rails. The Boiler Room: dark brick, pipes, glow.
function drawBarnBattleBg(t,g) {
  const warm=barnWarm();
  if(g==='boiler') {
    rect(0,0,192,108,'#24120c');
    for(let r=0;r<11;r++) { rect(0,r*6,192,1,'#3a1a12'); for(let k=(r%2)*8;k<192;k+=16) rect(k,r*6,1,6,'#3a1a12'); }
    for(const px of [20,60,140,176]) { rect(px,0,6,66,'#4a4440'); rect(px,0,2,66,'#6a6460'); }
    rect(0,14,192,5,'#4a4440'); rect(0,14,192,1,'#6a6460');
    const f=.18+.08*Math.sin(t*4); gfx.globalAlpha=f; ellipse(96,60,70,30,'#ff8a3a'); gfx.globalAlpha=1;
    rect(0,66,192,42,'#5a2a1e'); for(let i=70;i<108;i+=6) rect(0,i,192,1,'#3a1a12'); rect(0,66,192,2,'#c9a23a');
    for(let k=0;k<6;k++) { const p=(t*.3+k*.17)%1; gfx.globalAlpha=1-p; rect(30+((k*37)%140),64-p*50,2,2,'#ffb04a'); } gfx.globalAlpha=1;
    return;
  }
  rect(0,0,192,108,'#5a2a1e');
  for(let r=0;r<11;r++) { rect(0,r*6,192,1,'#7a3a2a'); for(let k=(r%2)*8;k<192;k+=16) rect(k,r*6,1,6,'#7a3a2a'); }
  for(const wx of [14,62,110,158]) { rect(wx,8,22,40,'#2a1a14'); ellipse(wx+11,10,11,8,'#2a1a14'); rect(wx+2,10,18,36,warm?'#e8c088':'#6a8aa8'); ellipse(wx+11,11,9,6,warm?'#e8c088':'#6a8aa8');
    rect(wx+10,8,2,40,'#2a1a14'); rect(wx,26,22,2,'#2a1a14'); }
  rect(118,42,64,24,OUT); rect(120,44,60,20,'#e8b830'); rect(120,44,60,3,'#3f7a4a'); for(let k=0;k<4;k++) rect(124+k*14,48,10,8,'#2a3440');
  rect(0,66,192,42,'#86837c'); rect(0,66,192,2,'#a8a49c');
  for(let k=0;k<192;k+=8) rect(k,82,3,14,'#5a4632'); rect(0,84,192,2,'#c9ccd4'); rect(0,93,192,2,'#c9ccd4');
  if(!warm) { gfx.globalAlpha=.16; rect(0,0,192,108,'#9fd8ff'); gfx.globalAlpha=1; }
}
drawLABattleBg=function(t) {
  const g=barnGround(currentMap),lab=B2.active&&B2.labBarn;
  if(!g&&!lab) return LE_drawLABattleBg_barn(t);
  drawBarnBattleBg(t,g||(B2.labBoiler?'boiler':'barn'));
};
