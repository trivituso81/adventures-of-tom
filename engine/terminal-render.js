'use strict';
// engine/terminal-render.js — The look of chapter 10's Terminal Zero (ground 'term': cream 'termwall' with a blue stripe
// that shows its face when there is floor below it, dark 'termvoid', gray 'secfloor', blue-gray 'claimfloor', teal
// 'loungerug', the busy airport 'checkrug', cream 'terrazzo', the moving 'walkway', the 'curb' doors) and Gate Zero
// (ground 'gate': 'gatecarpet', the big 'gatewindow' onto the night tarmac; the plane is drawn by data/scenes.js).
// Props: gatedoors, gateclock, xray, scanner, stanchion, bins, carousel, bagcart, lostfound, fids, termplant, termbench,
// loungechair, loungebar, amenity, checkin, termsign, photobooth, gatepodium, jetdoor, gateseats.
// Also the minimap and the battle backdrops (wraps drawLEBattleBg). Wraps drawOutdoorTile, drawObject and
// buildMiniBase. Loaded after engine/club-render.js.
const LE_drawOutdoorTile_term=drawOutdoorTile,LE_drawObject_term=drawObject,LE_buildMiniBase_term=buildMiniBase,LE_drawLEBattleBg_term=drawLEBattleBg;
const TERM_GROUNDS=['term','gate'];
const termGround=map=>{ const g=map&&map.style&&map.style.ground; return TERM_GROUNDS.includes(g)?g:null; };
const termTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'termvoid';
const TERM_FLOOR={secfloor:['#a8acb4','#a4a8b0','#acb0b8'],claimfloor:['#5a6a80','#56667c','#5e6e84'],loungerug:['#1f5a5a','#1c5656','#225e5e'],
  checkrug:['#2a5a78','#285674','#2c5e7c'],terrazzo:['#e8e0cc','#e4dcc8','#ece4d0'],walkway:['#4a4a56','#46464f','#4e4e5a'],curb:['#9aa4b8','#96a0b4','#9ea8bc'],
  gatecarpet:['#2a4a78','#284674','#2c4e7c']};
// Story state the art reads (flags are set by data/scenes.js).
const termFull=()=>typeof STORY!=='undefined'&&STORY.mode==='full';
const termHand=h=>termFull()&&(STORY.chapter>10||flag(TERM_HANDS.find(k=>k.h===h).fight)===true);
const termDoorOpen=()=>termFull()&&(STORY.chapter>10||!!flag('ch10-door'));
const termClockGo=()=>termFull()&&(STORY.chapter>10||!!flag('ch10-clear'));

function termFace(px,py,n,gate) {   // cream panels, a blue stripe, a little exit sign now and then
  rect(px,py,T,T,gate?'#cfc8b8':'#e0d8c4'); rect(px,py,T,4,gate?'#8a8478':'#a8a090');
  rect(px+2,py+6,T-4,T-14,gate?'#d8d2c2':'#ebe4d2'); rect(px,py+T-9,T,4,'#2f5fb0'); rect(px,py+T-5,T,1,'#f2c75a');
  if(n%7===0&&!gate) { rect(px+10,py+7,12,6,'#1f6a3a'); label('EXIT',px+16,py+8,'#e8f4e8',1); }
}
// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=termGround(currentMap);
  if(!g) return LE_drawOutdoorTile_term(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(type==='termvoid') { rect(px,py,T,T,'#101016'); return; }
  if(type==='termwall') {
    if(TERM_FLOOR[termTile(x,y+1)]) { termFace(px,py,n,g==='gate'); return; }
    rect(px,py,T,T,'#3a3a46'); rect(px,py+T-3,T,3,'#56566a'); return;
  }
  if(type==='gatewindow') {   // night sky, runway lights; the mullions
    const go=termClockGo();
    rect(px,py,T,T,go?'#1a2848':'#121a34'); rect(px,py+T-10,T,10,'#2a2a36'); rect(px,py+T-6,T,1,'#f2c75a');
    if(n%3===0) rect(px+(n%24)+2,py+3+((n>>>4)%8),1,1,'#fff1cb');
    if((Math.floor(time*2)+x)%4===0) ellipse(px+16,py+T-4,2,2,'#e85a4a');
    rect(px+T-2,py,2,T,'#5a5a68'); rect(px,py,T,2,'#5a5a68'); return;
  }
  const pal=TERM_FLOOR[type]||TERM_FLOOR.terrazzo;
  rect(px,py,T,T,pal[n%3]);
  if(type==='terrazzo') { for(let k=0;k<4;k++) { const m=hash(x*7+k,y*3); rect(px+m%30,py+(m>>>5)%30,2,1,['#c9a27a','#8a9ab0','#b08a8a','#9ab08a'][k]); } }
  else if(type==='secfloor') { rect(px,py,T,1,'#9a9ea6'); rect(px,py,1,T,'#9a9ea6'); }
  else if(type==='claimfloor') { if(n%3===0) rect(px+4+(n%20),py+6+((n>>>3)%18),3,3,'#6a7a90'); }
  else if(type==='loungerug') { if((x+y)%2===0) rect(px+12,py+12,8,8,'#2a6a6a'); }
  else if(type==='checkrug') {   // the classic airport carpet: busy little shapes
    rect(px+3+(n%8),py+4,4,2,'#e8743b'); rect(px+18,py+14+(n%6),2,5,'#f2c75a'); rect(px+8,py+22,6,2,'#6ab0e8'); ellipse(px+24,py+6,2,2,'#c96aa8');
  }
  else if(type==='gatecarpet') { if((x+y)%3===0) rect(px+6,py+6,3,3,'#f2c75a40'); rect(px,py+T-1,T,1,'#22406a'); }
  else if(type==='walkway') {
    rect(px,py,T,3,'#2a2a30'); rect(px,py+T-3,T,3,'#2a2a30');
    const off=termClockGo()?Math.floor(time*12)%8:0;
    for(let k=-8;k<T;k+=8) rect(px+k+off,py+5,2,T-10,'#5e5e6a');
  }
  else if(type==='curb') { rect(px,py,T,T,'#9aa4b8'); rect(px+2,py+2,T-4,T-4,'#c9d8e8'); rect(px+T/2-1,py,2,T,'#5a6478'); }
};

// ---------- Props ----------
function termClock(cx,cy,time) {   // the gate clock: a face, its hands (once they are back), seven coin slots and the middle one
  ellipse(cx,cy,19,19,OUT); ellipse(cx,cy,17,17,'#f4f0e6'); ellipse(cx,cy,16,16,'#fffaf0');
  for(let k=0;k<12;k++) { const a=k/12*Math.PI*2; rect(cx+Math.sin(a)*14-1,cy-Math.cos(a)*14-1,2,2,'#2a2630'); }
  const coins=termDoorOpen();
  for(let k=0;k<7;k++) { const a=(k+1)/8*Math.PI*2,x=cx+Math.sin(a)*10,y=cy-Math.cos(a)*10; ellipse(x,y,2.5,2.5,coins?'#f2c75a':'#6a6470'); }
  ellipse(cx,cy,3,3,termClockGo()?'#f2c75a':'#6a6470');
  const go=termClockGo(),t=go?time:0;
  const hand=(len,w,ang,col)=>{ gfx.save(); gfx.translate(cx,cy); gfx.rotate(ang); rect(-w/2,-len,w,len,col); gfx.restore(); };
  if(termHand('hour')) hand(8,3,go?t*.05:0,'#2a2630');
  if(termHand('minute')) hand(12,2,go?t*.6:0,'#2a2630');
  if(termHand('second')) hand(13,1,go?t*6:0,'#e85a4a');
}
drawObject=function(o,time) {
  if(!termGround(currentMap)) return LE_drawObject_term(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'gatedoors': {
      rect(x,y-20,w,h+20,OUT); rect(x+2,y-18,w-4,h+17,'#8a90a8');
      for(const dx of [x+4,cx+2]) { rect(dx,y-14,w/2-6,h+10,'#b8c0d4'); rect(dx+3,y-10,w/2-12,16,'#2a3048'); }
      rect(cx-1,y-18,2,h+17,OUT); rect(x+8,y+14,w-16,6,'#f2c75a'); label('GATE 0',cx,y+15,'#2a2630',1);
      return;
    }
    case 'gateclock': termClock(cx,y+10,time); return;
    case 'xray': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x,y+8,w,14,OUT); rect(x+1,y+9,w-2,12,'#3a3a44');
      for(let k=0;k<w;k+=6) rect(x+k,y+10,3,10,'#4a4a56');
      rect(x+w/2-18,y-14,36,26,OUT); rect(x+w/2-17,y-13,34,24,'#c9ccd4'); rect(x+w/2-12,y-4,24,16,'#14141c');
      for(let k=0;k<4;k++) rect(x+w/2-10+k*5,y+2,2,8,'#2a2a30'); rect(x+w-20,y+6,14,8,'#8a8a98'); return;
    }
    case 'scanner': {
      rect(x+2,y-22,4,T+20,OUT); rect(x+T-6,y-22,4,T+20,OUT); rect(x+2,y-24,T-4,6,OUT);
      rect(x+3,y-21,2,T+18,'#c9ccd4'); rect(x+T-5,y-21,2,T+18,'#c9ccd4'); rect(x+3,y-23,T-6,4,'#dfe6f2');
      ellipse(cx,y-21,2,2,(Math.floor(time*2)%2)?'#e85a4a':'#6ac06a'); return;
    }
    case 'stanchion': {
      ellipse(cx,b-3,7,2,'#00000040'); rect(cx-5,b-5,10,3,OUT); rect(cx-1,y+4,3,h-8,'#c9ccd4'); ellipse(cx,y+4,4,4,'#dfe6f2'); return;
    }
    case 'bins': for(let k=0;k<4;k++) { rect(x+3,y+18-k*6,T-6,6,OUT); rect(x+4,y+19-k*6,T-8,4,'#8a8a98'); } return;
    case 'carousel': {
      ellipse(cx,b-2,w/2,6,'#00000030');
      rect(x,y,w,h,OUT); rect(x+2,y+2,w-4,h-4,'#3a3a44');
      const go=termClockGo()?time*20:time*6;
      for(let k=0;k<w;k+=10) { const xx=x+4+((k+go)%(w-8)); rect(xx,y+4,7,h-8,'#4e4e5a'); }
      rect(x+12,y+12,w-24,h-24,'#c9ccd4'); rect(x+12,y+12,w-24,2,'#dfe6f2');
      rect(cx-8,y-12,16,10,OUT); rect(cx-7,y-11,14,8,'#14141c'); label('0',cx,y-10,'#f2c75a',1); return;
    }
    case 'bagcart': {
      ellipse(cx,b-2,10,3,'#00000040'); rect(x+4,y+10,T-8,12,OUT); rect(x+5,y+11,T-10,10,'#9aa4b8');
      rect(x+4,y-6,2,18,'#5a5a68'); rect(x+4,y-8,10,2,'#5a5a68'); ellipse(x+8,b-4,3,3,OUT); ellipse(x+T-8,b-4,3,3,OUT);
      rect(x+8,y+2,14,10,'#8a6a42'); return;
    }
    case 'lostfound': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x,y+4,w,22,OUT); rect(x+1,y+5,w-2,20,'#6a5a48'); rect(x+1,y+5,w-2,4,'#c9a23a');
      rect(x+8,y-8,30,12,OUT); rect(x+9,y-7,28,10,'#f4f0e6'); label('LOST',x+23,y-6,'#2a2630',1);
      for(let k=0;k<3;k++) { rect(x+w-30+k*8,y-6,2,12,'#2a2630'); polygon([[x+w-33+k*8,y-6],[x+w-23+k*8,y-6],[x+w-28+k*8,y-12]],['#e85a4a','#2f5fb0','#f2c75a'][k]); }
      return;
    }
    case 'fids': {
      rect(cx-1,y+12,2,18,OUT); rect(x,y-18,w,32,OUT); rect(x+2,y-16,w-4,28,'#14141c');
      const go=termClockGo();
      for(let r=0;r<4;r++) for(let k=0;k<10;k++) { const fl=!go&&(Math.floor(time*6)+r*3+k)%17===0;
        rect(x+5+k*9,y-13+r*7,7,5,fl?'#ffffff':(r===0?'#f2c75a':'#d8d2c2')); rect(x+5+k*9,y-11+r*7,7,1,'#14141c'); }
      return;
    }
    case 'termplant': {
      ellipse(cx,b-3,9,3,'#00000040'); rect(cx-6,b-11,12,9,OUT); rect(cx-5,b-10,10,7,'#c9ccd4');
      for(let k=0;k<6;k++) { const a=-2.8+k*.55; ellipse(cx+Math.cos(a)*7,b-15+Math.sin(a)*7,5,3,k%2?'#3f8a5a':'#2f6a4a'); } ellipse(cx,b-20,4,4,'#4f9a6a'); return;
    }
    case 'termbench': case 'gateseats': {
      ellipse(cx,b-2,w/2,3,'#00000030'); rect(x+2,y+16,w-4,4,'#5a5a68');
      for(let k=0;k<o.w;k++) { const sx=x+k*T+3; rect(sx,y-4,T-6,14,OUT); rect(sx+1,y-3,T-8,12,o.kind==='gateseats'?'#2f5fb0':'#3a5a8a'); rect(sx,y+8,T-6,8,OUT); rect(sx+1,y+9,T-8,6,'#4a7ad0'); }
      for(let k=0;k<=o.w;k++) rect(x+k*T-1,y+4,3,10,'#8a8a98'); return;
    }
    case 'loungechair': ellipse(cx,b-2,11,3,'#00000040'); rect(x+4,y-8,T-8,22,OUT); rect(x+5,y-7,T-10,20,'#6a3a24'); rect(x+3,y+10,T-6,10,OUT); rect(x+4,y+11,T-8,8,'#8a4a2a'); rect(x+2,y+4,5,12,'#5a2a18'); rect(x+T-7,y+4,5,12,'#5a2a18'); return;
    case 'loungebar': {
      rect(x,y-16,w,10,'#2a3a3a'); for(let k=0;k<5;k++) rect(x+6+k*18,y-14,8,7,['#c9a23a','#8a6a42','#f4f0e6','#e85a4a','#c9a23a'][k]);
      rect(x,y+2,w,24,OUT); rect(x+1,y+3,w-2,22,'#2a4a4a'); rect(x+1,y+3,w-2,3,'#f2c75a'); return;
    }
    case 'amenity': rect(x+3,y-12,T-6,T+8,OUT); rect(x+4,y-11,T-8,T+6,'#e0d8c4'); rect(x+6,y-8,T-12,8,'#3a4a7a'); rect(x+6,y+2,T-12,8,'#3a4a7a'); label('0',cx,y-7,'#f2c75a',1); return;
    case 'checkin': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x,y+2,w,24,OUT); rect(x+1,y+3,w-2,22,'#e0d8c4'); rect(x+1,y+3,w-2,4,'#2f5fb0');
      for(let k=0;k<3;k++) { const sx=x+20+k*90; rect(sx,y-14,22,14,OUT); rect(sx+1,y-13,20,12,'#14141c'); label('0',sx+11,y-11,'#f2c75a',1); }
      return;
    }
    case 'termsign': rect(cx-1,y+6,2,22,OUT); rect(x+1,y-14,T-2,22,OUT); rect(x+2,y-13,T-4,20,'#2f5fb0'); rect(x+5,y-9,T-10,2,'#ffffff'); rect(x+5,y-4,T-12,2,'#ffffff'); rect(x+5,y+1,T-14,2,'#f2c75a'); return;
    case 'photobooth': {
      ellipse(cx,b-2,12,3,'#00000040'); rect(x+1,y-18,T-2,T+14,OUT); rect(x+2,y-17,T-4,T+12,'#c96aa8');
      rect(x+4,y-14,T-14,T+4,'#8a2a5a'); rect(x+T-9,y-12,5,18,'#f4f0e6'); label('PHOTO',cx,y-17,'#fff1cb',1);
      if(flag&&flag('ch10-photo')) rect(x+T-8,y-10,3,14,'#f2c75a'); return;
    }
    case 'gatepodium': {
      ellipse(cx,b-2,w/2,4,'#00000030'); rect(x+4,y+2,w-8,24,OUT); rect(x+5,y+3,w-10,22,'#2a3a5a'); rect(x+5,y+3,w-10,3,'#f2c75a');
      rect(x+10,y-12,22,14,OUT); rect(x+11,y-11,20,12,'#14141c'); label('0',x+21,y-9,'#f2c75a',1);
      if(termClockGo()) rect(x+w-20,y,10,6,'#f2c75a'); return;
    }
    case 'jetdoor': {
      rect(x,y-24,w,h+22,OUT); rect(x+2,y-22,w-4,h+19,'#8a90a8'); rect(x+6,y-16,w-12,14,termClockGo()?'#121a34':'#f2e6b0');
      rect(x+4,y+4,w-8,4,'#5a5a68'); label('JET BRIDGE',cx,y-22,'#2a2630',1); return;
    }
  }
  return LE_drawObject_term(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!termGround(map)) return LE_buildMiniBase_term(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={termwall:'#3a3a46',termvoid:'#101016',gatewindow:'#121a34'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(TERM_FLOOR[t]&&TERM_FLOOR[t][0])||'#6a6a80';
    b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.kind==='gatedoors'||o.kind==='photobooth') { b.fillStyle=o.kind==='gatedoors'?'#f2c75a':'#c96aa8'; b.fillRect(o.x*2,o.y*2,o.w*2,o.h*2); }
  return c;
};

// ---------- Battle backdrops ----------
// Terminal Zero: tall windows onto the night tarmac, a departure board, a row of seats, the busy carpet. Gate Zero: one
// huge window with Flight 0 parked at the jet bridge (gone once it has left), and the split-flap board.
drawLEBattleBg=function(t) {
  const g=termGround(currentMap),lab=B2.active&&B2.labTerm;
  if(!g&&!lab) return LE_drawLEBattleBg_term(t);
  const gate=g==='gate'||(lab&&B2.labGate),go=termClockGo();
  rect(0,0,192,108,'#e0d8c4');
  rect(0,4,192,54,go?'#1a2848':'#121a34');
  for(let k=0;k<24;k++) { const n=hash(k,13); rect(n%192,4+(n>>>8)%30,1,1,'#fff1cb'); }
  rect(0,46,192,12,'#2a2a36'); for(let k=0;k<12;k++) if((Math.floor(t*2)+k)%3===0) ellipse(8+k*16,52,1.5,1.5,k%2?'#e85a4a':'#f2c75a');
  if(gate) {
    if(!go||!termFull()||!flag('ch10-gone')) {   // Flight 0 at the jet bridge
      rect(30,26,120,14,'#e8eaf4'); ellipse(150,33,10,7,'#e8eaf4'); polygon([[40,26],[30,10],[44,10],[56,26]],'#2f5fb0');
      rect(60,38,60,4,'#c9ccd4'); polygon([[70,40],[110,40],[96,48],[80,48]],'#c9ccd4');
      for(let k=0;k<9;k++) rect(62+k*9,30,4,4,'#f2c75a'); rect(30,36,120,2,'#2f5fb0'); label('0',38,14,'#f2c75a',1);
      rect(150,30,42,10,'#5a5a68');
    }
  } else { for(let k=0;k<6;k++) { const bx=10+k*32; rect(bx,4,2,54,'#c9ccd4'); } }
  for(let i=0;i<192;i+=32) rect(i,4,2,54,'#c9ccd4'); rect(0,0,192,4,'#a8a090'); rect(0,56,192,2,'#2f5fb0');
  if(!gate) { rect(130,10,50,22,OUT); rect(131,11,48,20,'#14141c'); for(let r=0;r<3;r++) rect(134,14+r*6,42,3,r?'#d8d2c2':'#f2c75a'); }
  rect(0,58,192,8,'#cfc8b8');
  for(let k=0;k<8;k++) { const sx=6+k*24; rect(sx,56,18,8,'#2f5fb0'); rect(sx,54,18,3,'#4a7ad0'); }
  rect(0,66,192,42,gate?'#2a4a78':'#2a5a78'); rect(0,66,192,2,'#f2c75a');
  for(let k=0;k<40;k++) { const n=hash(k,31); rect(n%190,68+(n>>>8)%38,3,2,['#e8743b','#f2c75a','#6ab0e8','#c96aa8'][k%4]); }
  return true;
};
