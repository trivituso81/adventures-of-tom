'use strict';
// engine/school-render.js — The look of chapter 5's Long Island Elementary: the schoolyard (ground 'schoolyard': sidewalk
// 'path', 'asphalt', 'hopscotch', the front 'entry'), the school (ground 'school': 'lino', 'artfloor', 'carpet',
// 'gymwood', 'staffrug', walls 'swall' that show a painted face when there is floor below them, dark 'void') and the
// Cafetorium (ground 'cafe': 'cafefloor', 'stagewood'). Props: schoolwing, flagpole, marquee, bikerack, swings, slide,
// tetherball, car, hallclock, cafdoors, bulletin, trophycase, waterfountain, signtable, lostfound, easel, arttable,
// dryrack, piano, drums, xylophone, musicstand, bleachers, hoop, gymmats, ballcart, climbrope, stafffridge,
// staffcounter, copier, stafftable, staffcouch, podium, lunchtable, milkcooler. Also the minimap and the battle
// backdrops (drawLEBattleBg, called by engine/battle-draw.js). Wraps drawOutdoorTile, drawObject and buildMiniBase.
// Loaded after engine/backlot-render.js.
const LE_drawOutdoorTile_school=drawOutdoorTile,LE_drawObject_school=drawObject,LE_buildMiniBase_school=buildMiniBase;
const SCHOOL_GROUNDS=['schoolyard','school','cafe'];
const schoolGround=map=>{ const g=map&&map.style&&map.style.ground; return SCHOOL_GROUNDS.includes(g)?g:null; };
const schTile=(x,y)=>within(currentMap,x,y)?currentMap.tiles[y][x]:'void';
const SCH_FLOOR={lino:['#c9c2ae','#c4bda9','#cec7b3'],artfloor:['#d8c9a8','#d3c4a3','#dcceae'],carpet:['#4a6a9a','#47669a','#4e6e9e'],
  gymwood:['#d9a86a','#d4a365','#ddad70'],staffrug:['#8a6a5a','#866656','#8e6e5e'],cafefloor:['#b8c4b8','#b2bfb2','#bcc8bc'],stagewood:['#a8743a','#a37036','#ad783f']};
// What the wall above a floor looks like: its paint and trim.
const SCH_WALL={lino:['#9fb0c0','#6a7a8a'],artfloor:['#f0e0b8','#c98a4a'],carpet:['#c9d6e8','#4a6a9a'],gymwood:['#a8b4a0','#5a6a52'],
  staffrug:['#e0d2b4','#8a6a5a'],cafefloor:['#d8c8a0','#8a6a48'],stagewood:['#7a2a32','#4a1a20']};

// ---------- Ground ----------
drawOutdoorTile=function(x,y,type,time) {
  const g=schoolGround(currentMap);
  if(!g) return LE_drawOutdoorTile_school(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(g==='schoolyard') {
    if(type==='asphalt'||type==='hopscotch') {
      rect(px,py,T,T,['#4a4c54','#474951','#4d4f57'][n%3]);
      if(n%5===0) rect(px+4+(n%20),py+6+((n>>>4)%20),2,1,'#5a5c64');
      if(type==='hopscotch') { rect(px+4,py+2,T-8,T-4,'#f4f0e6'); rect(px+6,py+4,T-12,T-8,'#4a4c54'); label(String(y-11),px+16,py+12,'#f4f0e6',2); }
      else if(currentMap.tiles[y][x]==='asphalt'&&x<=10&&y>=11&&x%4===1) rect(px,py+2,2,T-4,'#e8e2d0');   // parking lines
      return;
    }
    if(type==='path'||type==='entry'||type==='door') {
      rect(px,py,T,T,['#c9c4b6','#c4bfb1','#cec9bb'][n%3]);
      rect(px,py,T,1,'#a9a496'); rect(px,py,1,T,'#a9a496');
      if(type==='entry') { rect(px,py,T,T,'#8a6a52'); rect(px+2,py,T-4,T,'#9a7a62'); for(let k=4;k<T;k+=8) rect(px+2,py+k,T-4,1,'#7a5a42'); }
      if(n%7===0) rect(px+10,py+14,3,2,'#b4af9f');
      return;
    }
    return LE_drawOutdoorTile(x,y,type,time);   // grass, as in the rest of Long Island (engine/la-render.js keeps the original)
  }
  if(type==='void') { rect(px,py,T,T,'#141821'); return; }
  if(type==='swall') {
    const below=schTile(x,y+1),face=SCH_WALL[below];
    if(!face) {   // seen from above: the top of a wall
      rect(px,py,T,T,'#2e3440'); rect(px,py,T,2,'#3c4352'); if(schTile(x,y-1)!=='swall') rect(px,py,T,4,'#464e60');
      return;
    }
    const [paint,trim]=face;
    rect(px,py,T,6,'#2e3440'); rect(px,py+6,T,T-6,paint); rect(px,py+T-5,T,5,trim); rect(px,py+6,T,1,shadeHex(paint,20));
    if(below==='lino') {   // lockers
      rect(px+2,py+8,13,T-14,'#5a7aa0'); rect(px+17,py+8,13,T-14,'#5a7aa0');
      for(const lx of [px+2,px+17]) { rect(lx,py+8,13,1,'#7a9ac0'); rect(lx+3,py+11,7,1,'#3a5a80'); rect(lx+3,py+13,7,1,'#3a5a80'); rect(lx+10,py+18,2,3,'#c9ccd4'); }
    } else if(below==='stagewood'&&x>=4&&x<=15) {   // stage curtains
      rect(px,py+6,T,T-6,'#8a2a32'); for(let k=0;k<T;k+=6) rect(px+k,py+6,2,T-6,'#6a1a22');
      rect(px,py+6,T,4,'#c9a23a');
    } else if(below==='carpet'&&n%3===0) { rect(px+6,py+10,20,12,'#f4f0e6'); for(let k=0;k<4;k++) rect(px+8,py+12+k*3,16,1,'#2b2a26'); rect(px+12,py+13,2,2,'#2b2a26'); }
    else if(below==='artfloor'&&n%2===0) { rect(px+5,py+9,22,15,'#2b2a26'); rect(px+6,py+10,20,13,['#f2a05a','#9fd8ff','#ffe27a','#c9b3e6'][n%4]); ellipse(px+16,py+16,4,4,['#d94a3a','#4a78c2','#5aa05a'][n%3]); }
    else if(below==='gymwood') { for(let k=0;k<2;k++) rect(px+2+k*15,py+8,13,T-14,'#7a8a72'); }
    else if((below==='lino'||below==='staffrug')&&n%4===0) { rect(px+8,py+9,16,12,'#2b2a26'); rect(px+9,py+10,14,10,'#1a2350'); rect(px+16,py+12,1,1,'#ffffff'); rect(px+12,py+15,1,1,'#ffe08a'); }   // a night window
    return;
  }
  const pal=SCH_FLOOR[type]||SCH_FLOOR.lino;
  rect(px,py,T,T,pal[n%3]);
  if(type==='lino'||type==='cafefloor') {
    rect(px,py,T,1,shadeHex(pal[0],-18)); rect(px,py,1,T,shadeHex(pal[0],-18));
    if((x+y)%2===0) rect(px+1,py+1,T-1,T-1,shadeHex(pal[0],-8));
    if(type==='lino'&&n%11===0) rect(px+8+(n%12),py+12,6,2,'#e8e2d0');   // a scuff
  } else if(type==='gymwood') {
    for(let k=0;k<T;k+=8) rect(px,py+k,T,1,'#b8884a');
    if(y===4) rect(px,py+16,T,2,'#f4f0e6'); if(x===23&&y<7) rect(px+14,py,2,T,'#d94a3a');   // court lines
  } else if(type==='stagewood') {
    for(let k=0;k<T;k+=8) rect(px,py+k,T,1,'#8a5a2a');
    if(schTile(x,y+1)==='cafefloor') { rect(px,py+T-8,T,8,'#5a3a1a'); rect(px,py+T-8,T,2,'#c9a23a'); }   // the stage lip
  } else if(type==='carpet'||type==='staffrug') {
    if(n%5===0) rect(px+6+(n%16),py+8+((n>>>3)%14),2,2,shadeHex(pal[0],-14));
  } else if(type==='artfloor') {
    if(n%4===0) ellipse(px+8+(n%14),py+10+((n>>>4)%12),3,2,['#d94a3a','#4a78c2','#e8c84a','#5aa05a'][n%4]);   // paint drips
  }
};

// ---------- Props ----------
function schSign(text,cx,y,bg,ink,sc=1) {
  const w=(text.length*4-1)*sc+8;
  rect(cx-w/2-1,y-1,w+2,5*sc+6,OUT); rect(cx-w/2,y,w,5*sc+4,bg); label(text,cx,y+2,ink,sc);
}
function schClock(cx,cy,state,time) {
  ellipse(cx,cy,10,10,OUT); ellipse(cx,cy,9,9,'#f4f0e6'); ellipse(cx,cy,8,8,state==='set'?'#ffffff':'#f4f0e6');
  for(let k=0;k<12;k+=3) { const a=k/12*Math.PI*2; rect(Math.round(cx+Math.sin(a)*7)-1,Math.round(cy-Math.cos(a)*7)-1,2,2,OUT); }
  const spin=state==='spin'?time*9:0,h=state==='set'?Math.PI*2*7/12:spin*.3,m=state==='set'?0:spin;
  const hand=(a,len,c)=>{ for(let k=0;k<len;k++) rect(Math.round(cx+Math.sin(a)*k),Math.round(cy-Math.cos(a)*k),2,2,c); };
  hand(h,5,OUT); hand(m,7,state==='set'?OUT:'#d94a3a');
}
drawObject=function(o,time) {
  if(!schoolGround(currentMap)) return LE_drawObject_school(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'schoolwing': {
      // A tall brick wing with two rows of windows. The left wing's inner edge and the right wing's frame the doors.
      const top=y-58;
      ellipse(cx,b-1,w/2,5,'#00000030');
      rect(x,top,w,b-top,OUT); rect(x+1,top+1,w-2,b-top-2,'#a8503a');
      for(let yy=top+3;yy<b-4;yy+=5) for(let xx=x+2+((yy/5)%2?5:0);xx<x+w-4;xx+=10) rect(xx,yy,9,4,shadeHex('#a8503a',(hash(xx,yy)%3-1)*10));
      rect(x,top-4,w,6,OUT); rect(x+1,top-3,w-2,4,'#d9cbb0');
      for(let r=0;r<2;r++) for(let k=0;k<5;k++) { const wx=x+10+k*62,wy=top+10+r*28; if(wx+22>x+w) continue;
        const lit=hash(o.x+k,r)%3===0; rect(wx,wy,22,18,OUT); rect(wx+1,wy+1,20,16,lit?'#f6d27a':'#2a3a5a'); rect(wx+10,wy+1,2,16,OUT); rect(wx+1,wy+8,20,2,OUT);
        if(!lit) rect(wx+4,wy+3,3,2,'#4a5a7a');
        if(o.side==='right'&&r===0) { rect(wx+4,wy+3,4,4,'#f4f0e6'); rect(wx+14,wy+10,4,4,'#f4f0e6'); } }   // paper snowflakes
      if(o.side==='left') { rect(x+w-4,top,4,b-top,'#d9cbb0'); schSign('LONG ISLAND',x+w-38,top+2,'#d9cbb0','#5a2a1a',1); }
      else { rect(x,top,4,b-top,'#d9cbb0'); schSign('ELEMENTARY',x+40,top+2,'#d9cbb0','#5a2a1a',1); }
      return;
    }
    case 'flagpole': {
      ellipse(cx,b-3,8,3,'#00000030');
      rect(cx-2,b-90,4,88,OUT); rect(cx-1,b-89,2,86,'#c9ccd4'); ellipse(cx,b-91,3,3,'#e8c84a');
      const sw=Math.round(Math.sin(time*2)*2); rect(cx+2+sw,b-80,1,70,'#e8e2d0');
      rect(cx-6,b-6,12,4,OUT); rect(cx-5,b-5,10,2,'#8a8f98');
      return;
    }
    case 'marquee': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+8,y-4,4,h+2,OUT); rect(x+w-12,y-4,4,h+2,OUT);
      rect(x+2,y-30,w-4,28,OUT); rect(x+3,y-29,w-6,26,'#f4f0e6'); rect(x+3,y-29,w-6,6,'#2f5a8a');
      label('SNAILS',cx,y-28,'#fff1cb',1);
      const done=typeof flag==='function'&&flag('ch5-done');
      label(done?'THANK YOU':'TONIGHT',cx,y-20,'#2b2a26',1); label(done?'PARENTS':'CONF 7:00',cx,y-12,'#d94a3a',1);
      return;
    }
    case 'bikerack': {
      for(let k=0;k<4;k++) { rect(x+6+k*14,y+10,2,18,OUT); rect(x+6+k*14,y+10,12,2,OUT); }
      rect(x+2,y+26,w-4,3,OUT);
      ellipse(x+20,y+20,7,7,OUT); ellipse(x+20,y+20,5,5,'#c9ccd4'); rect(x+20,y+12,16,2,'#d94a3a');
      return;
    }
    case 'swings': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+2,y-36,4,h+34,OUT); rect(x+w-6,y-36,4,h+34,OUT); rect(x,y-38,w,5,OUT); rect(x+1,y-37,w-2,3,'#d94a3a');
      for(let k=0;k<3;k++) { const sx=x+18+k*30,sw=Math.round(Math.sin(time*(1.2+k*.3)+k)*(k===1?4:1));
        rect(sx+sw,y-33,1,40,'#8a8f98'); rect(sx+12+sw,y-33,1,40,'#8a8f98'); rect(sx-2+sw,y+7,17,4,OUT); rect(sx-1+sw,y+8,15,2,'#2b2a26'); }
      return;
    }
    case 'slide': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+4,y-30,4,h+28,OUT); rect(x+14,y-30,4,h+28,OUT); for(let k=0;k<5;k++) rect(x+4,y-24+k*8,14,2,OUT);
      polygon([[x+16,y-30],[x+24,y-30],[x+w-2,b-4],[x+w-12,b-4]],OUT); polygon([[x+17,y-29],[x+23,y-29],[x+w-4,b-5],[x+w-11,b-5]],'#c9ccd4');
      rect(x+2,y-34,18,5,OUT); rect(x+3,y-33,16,3,'#e8c84a');
      return;
    }
    case 'tetherball': {
      ellipse(cx,b-3,8,3,'#00000030');
      rect(cx-1,y-30,3,h+28,OUT); rect(cx,y-29,1,h+26,'#c9ccd4');
      ellipse(cx+3,y-10,6,6,OUT); ellipse(cx+3,y-10,5,5,'#e8c84a'); for(let k=0;k<5;k++) rect(cx-2+k,y-26+k*3,2,1,'#e8e2d0');
      return;
    }
    case 'car': {
      const col=o.col||'#b9483f';
      ellipse(cx,b-2,w/2,5,'#00000040');
      rect(x+2,y-6,w-4,26,OUT); rect(x+3,y-5,w-6,24,col); rect(x+3,y+8,w-6,3,shadeHex(col,-30));
      rect(x+12,y-18,w-24,14,OUT); rect(x+13,y-17,w-26,12,'#3a4a6a'); rect(x+15,y-15,8,3,'#5a6a8a');
      rect(x+4,y+12,6,4,'#ffe08a'); rect(x+w-10,y+12,6,4,'#ffe08a');
      for(const wx of [x+14,x+w-14]) { ellipse(wx,b-5,6,6,OUT); ellipse(wx,b-5,3,3,'#8a8f98'); }
      return;
    }
    case 'hallclock': {
      const st=typeof ch5ClockState==='function'?ch5ClockState(o.clock):'spin';
      schClock(cx,y+16,st,time);
      if(st==='ready'&&Math.floor(time*2)%2) { rect(cx+10,y+6,3,3,'#ffe08a'); }
      return;
    }
    case 'cafdoors': {
      rect(x,y,w,h,OUT); rect(x+2,y+2,w-4,h-4,'#8a5a3a'); rect(x+2,y+h/2-1,w-4,2,OUT);
      rect(x+6,y+12,w-12,14,'#9fd0e0'); rect(x+6,y+h-26,w-12,14,'#9fd0e0');
      rect(x+4,y+h/2-8,4,4,'#c9a23a'); rect(x+4,y+h/2+4,4,4,'#c9a23a');
      rect(x-2,y+h/2-10,8,20,'#c9ccd4'); rect(x+1,y+h/2-6,3,12,'#5a5a60');   // padlock and chain
      return;
    }
    case 'bulletin': {
      rect(x+2,y+8,T-4,20,OUT); rect(x+3,y+9,T-6,18,'#c98a4a');
      for(let k=0;k<4;k++) rect(x+5+(k%2)*12,y+11+Math.floor(k/2)*8,9,6,['#f4f0e6','#ffe27a','#9fd8ff','#ffb0d0'][k]);
      return;
    }
    case 'trophycase': {
      rect(x+2,y+7,w-4,22,OUT); rect(x+3,y+8,w-6,20,'#6a4a2a'); rect(x+5,y+10,w-10,16,'#9fd0e0');
      for(let k=0;k<5;k++) { const tx=x+10+k*11; rect(tx,y+18,6,6,'#e8c84a'); rect(tx+1,y+14,4,4,'#ffe08a'); }
      return;
    }
    case 'waterfountain': {
      ellipse(cx,b-2,8,3,'#00000030');
      rect(cx-8,y+6,16,22,OUT); rect(cx-7,y+7,14,20,'#c9ccd4'); rect(cx-6,y+8,12,5,'#8a8f98'); rect(cx-1,y+4,2,4,'#9fd8ff');
      return;
    }
    case 'signtable': {
      ellipse(cx,b-2,12,3,'#00000030');
      rect(x+2,y+8,T-4,10,OUT); rect(x+3,y+9,T-6,8,'#c98a4a'); rect(x+5,y+18,3,10,OUT); rect(x+T-8,y+18,3,10,OUT);
      if(typeof flag==='function'&&flag('ch5-clear')) { rect(x+8,y+2,16,10,OUT); rect(x+9,y+3,14,8,'#f4f0e6'); rect(x+11,y+5,3,3,'#e8c84a'); rect(x+16,y+5,3,3,'#e8c84a'); }
      for(let k=0;k<4;k++) rect(x+6+k*6,y+6,1,4,'#2b2a26');
      return;
    }
    case 'lostfound': {
      rect(x+4,y+8,T-8,20,OUT); rect(x+5,y+9,T-10,18,'#8a6a48'); rect(x+5,y+9,T-10,3,'#a8845a');
      rect(x+8,y+4,6,6,'#d94a3a'); rect(x+16,y+2,8,4,'#e8c84a'); label('LOST',cx,y+16,'#fff1cb',1);
      return;
    }
    case 'easel': {
      ellipse(cx,b-2,10,3,'#00000030');
      rect(cx-9,y-6,2,34,OUT); rect(cx+7,y-6,2,34,OUT); rect(cx-1,y-8,2,36,OUT);
      rect(cx-11,y-14,22,20,OUT); rect(cx-10,y-13,20,18,'#f4f0e6');
      if(o.x<4) { ellipse(cx,y-4,6,4,'#5aa05a'); rect(cx-6,y-9,8,3,'#d94a3a'); } else { ellipse(cx,y-6,5,5,'#efbc8e'); for(let k=0;k<4;k++) rect(cx-8+k*5,y,2,5,'#4a5a8a'); }
      return;
    }
    case 'arttable': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+2,y+6,w-4,14,OUT); rect(x+3,y+7,w-6,12,'#e8c06a'); rect(x+4,y+20,3,8,OUT); rect(x+w-7,y+20,3,8,OUT);
      for(let k=0;k<5;k++) ellipse(x+10+k*10,y+11,3,2,['#d94a3a','#4a78c2','#e8c84a','#5aa05a','#c9b3e6'][k]);
      rect(x+w-16,y,8,9,OUT); rect(x+w-15,y+1,6,7,'#f4f0e6');
      return;
    }
    case 'dryrack': {
      rect(x+4,y-14,T-8,40,OUT); rect(x+5,y-13,T-10,38,'#8a8f98');
      for(let k=0;k<5;k++) { rect(x+6,y-12+k*8,T-12,1,'#5a5a60'); rect(x+8+(k%2)*6,y-11+k*8,8,5,['#e8a43a','#d94a3a','#5aa05a'][k%3]); }
      return;
    }
    case 'piano': {
      ellipse(cx,b-2,w/2,4,'#00000040');
      rect(x+2,y-18,w-4,46,OUT); rect(x+3,y-17,w-6,44,'#4a2a1a'); rect(x+3,y-17,w-6,4,'#6a4a32');
      rect(x+4,y+8,w-8,8,'#f4f0e6'); for(let k=0;k<10;k++) rect(x+7+k*5,y+8,2,5,OUT);
      for(let k=0;k<4;k++) rect(x+10+k*9,y+9,2,2,'#ffe27a');   // glitter
      return;
    }
    case 'drums': {
      ellipse(cx,b-2,w/2,4,'#00000040');
      ellipse(cx,y+16,16,9,OUT); ellipse(cx,y+15,14,8,'#d94a3a'); ellipse(cx,y+12,13,5,'#f4f0e6');
      for(const dx of [-22,22]) { ellipse(cx+dx,y+4,9,5,OUT); ellipse(cx+dx,y+3,8,4,'#f4f0e6'); rect(cx+dx-1,y+7,2,20,OUT); }
      ellipse(cx+18,y-8,9,2,'#e8c84a');
      return;
    }
    case 'xylophone': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+4,y+18,3,10,OUT); rect(x+w-7,y+18,3,10,OUT);
      for(let k=0;k<8;k++) { const hh=18-k*1.5; rect(x+5+k*7,y+4+(18-hh)/2,6,hh,OUT); rect(x+6+k*7,y+5+(18-hh)/2,4,hh-2,['#d94a3a','#f08a3a','#e8c84a','#5aa05a','#4a78c2','#7a5aa8','#c9b3e6','#ff9ac0'][k]); }
      for(let k=0;k<6;k++) rect(x+6+((n>>>k)%50),y+6+(k*5)%14,2,2,'#ffe27a');
      return;
    }
    case 'musicstand': {
      rect(cx-1,y+4,2,24,OUT); rect(cx-8,b-4,16,2,OUT); rect(cx-10,y-6,20,12,OUT); rect(cx-9,y-5,18,10,'#f4f0e6');
      for(let k=0;k<3;k++) rect(cx-7,y-3+k*3,14,1,'#2b2a26');
      return;
    }
    case 'bleachers': {
      for(let r=0;r<3;r++) { rect(x,y-24+r*12,w,10,OUT); rect(x+1,y-23+r*12,w-2,8,'#c98a4a'); rect(x+1,y-23+r*12,w-2,2,'#e8b06a'); }
      return;
    }
    case 'hoop': {
      rect(x+16,y+6,32,20,OUT); rect(x+17,y+7,30,18,'#f4f0e6'); rect(x+26,y+14,12,8,'#d94a3a'); rect(x+27,y+15,10,6,'#f4f0e6');
      ellipse(x+32,y+28,10,3,'#d94a3a'); for(let k=0;k<4;k++) rect(x+24+k*5,y+29,1,6,'#f4f0e6');
      return;
    }
    case 'gymmats': {
      rect(x+2,y+8,w-4,18,OUT); rect(x+3,y+9,w-6,16,'#4a78c2'); for(let k=x+14;k<x+w-4;k+=14) rect(k,y+9,1,16,'#3a5a9a');
      return;
    }
    case 'ballcart': {
      ellipse(cx,b-2,12,3,'#00000030');
      rect(x+3,y+4,T-6,22,OUT); rect(x+4,y+5,T-8,20,'#8a8f98'); for(let k=0;k<4;k++) ellipse(x+9+(k%2)*12,y+6+Math.floor(k/2)*9,5,5,'#d94a3a');
      for(const wx of [x+7,x+T-7]) ellipse(wx,b-3,3,3,OUT);
      return;
    }
    case 'climbrope': {
      for(let k=0;k<12;k++) rect(cx-2+(k%2),y-30+k*5,4,5,k%2?'#c9a06a':'#a8804a');
      ellipse(cx,b-4,5,3,'#a8804a');
      return;
    }
    case 'stafffridge': {
      ellipse(cx,b-2,12,3,'#00000040');
      rect(x+3,y-26,T-6,52,OUT); rect(x+4,y-25,T-8,50,'#e8e8e0'); rect(x+4,y-6,T-8,1,OUT); rect(x+T-9,y-20,2,8,'#8a8f98'); rect(x+T-9,y,2,10,'#8a8f98');
      rect(x+7,y-22,6,6,'#ffe27a'); rect(x+15,y-16,6,5,'#ffb0d0'); rect(x+8,y+4,8,6,'#9fd8ff');
      return;
    }
    case 'staffcounter': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x,y+4,w,24,OUT); rect(x+1,y+5,w-2,22,'#c9a06a'); rect(x+1,y+5,w-2,4,'#e0c08a');
      rect(x+12,y-14,16,20,OUT); rect(x+13,y-13,14,18,'#2c2c33'); ellipse(x+20,y+2,5,4,'#5a3a1a');
      rect(x+40,y-4,8,9,OUT); rect(x+41,y-3,6,7,'#f4f0e6'); rect(x+58,y-2,14,6,'#ffe27a');
      return;
    }
    case 'copier': {
      ellipse(cx,b-2,12,3,'#00000040');
      rect(x+3,y-8,T-6,36,OUT); rect(x+4,y-7,T-8,34,'#c9ccd4'); rect(x+4,y-7,T-8,6,'#a9adb5'); rect(x+8,y+4,T-16,4,'#5a5a60');
      if(Math.floor(time*2)%2) rect(x+T-10,y-4,3,3,'#d94a3a');
      return;
    }
    case 'stafftable': {
      ellipse(cx,b-2,w/2,4,'#00000030');
      rect(x+2,y+6,w-4,12,OUT); rect(x+3,y+7,w-6,10,'#8a6a48'); rect(x+5,y+18,3,10,OUT); rect(x+w-8,y+18,3,10,OUT);
      for(let k=0;k<9;k++) rect(x+8+k*5,y+8+(k%2)*3,2,6,'#d93a3a');
      return;
    }
    case 'staffcouch': {
      ellipse(cx,b-2,w/2,5,'#00000040');
      rect(x+2,y-8,w-4,30,OUT); rect(x+3,y-7,w-6,12,'#5a6a52'); rect(x+3,y+5,w-6,14,'#6a7a62');
      rect(x,y-2,8,22,OUT); rect(x+w-8,y-2,8,22,OUT);
      return;
    }
    case 'podium': {
      ellipse(cx,b-2,12,3,'#00000040');
      polygon([[x+4,y-6],[x+T-4,y-6],[x+T-7,b-2],[x+7,b-2]],OUT); polygon([[x+5,y-5],[x+T-5,y-5],[x+T-8,b-3],[x+8,b-3]],'#8a5a2a');
      rect(x+2,y-10,T-4,6,OUT); rect(x+3,y-9,T-6,4,'#a8743a');
      if(!(typeof flag==='function'&&flag('ch5-clear'))) { rect(x+8,y-16,16,8,OUT); rect(x+9,y-15,14,6,'#f4f0e6'); for(let k=0;k<3;k++) rect(x+10+k*4,y-14,3,3,'#d93a3a'); }
      return;
    }
    case 'lunchtable': {
      ellipse(cx,b-2,w/2,5,'#00000030');
      rect(x+2,y+4,w-4,14,OUT); rect(x+3,y+5,w-6,12,'#c9c4b6'); rect(x+3,y+5,w-6,2,'#e8e2d0');
      for(let k=x+10;k<x+w-6;k+=22) { ellipse(k,b-4,5,3,OUT); ellipse(k,b-5,4,2,'#4a78c2'); }
      if(o.x>10&&o.y===11) for(let k=0;k<6;k++) ellipse(x+14+k*20,y+9,4,3,'#c98a4a');   // cookies
      return;
    }
    case 'milkcooler': {
      ellipse(cx,b-2,12,3,'#00000040');
      rect(x+3,y-4,T-6,32,OUT); rect(x+4,y-3,T-8,30,'#4a78c2'); rect(x+6,y,T-12,12,'#9fd0e0');
      for(let k=0;k<3;k++) rect(x+8+k*6,y+3,4,7,['#f4f0e6','#7a4a2a','#ff9ac0'][k]);
      return;
    }
  }
  return LE_drawObject(o,time);   // trees, signs, benches: the Long Island originals (engine/la-render.js keeps them)
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  if(!schoolGround(map)) return LE_buildMiniBase_school(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2; const b=c.getContext('2d');
  const col={swall:'#2e3440',void:'#141821',asphalt:'#4a4c54',hopscotch:'#4a4c54',entry:'#8a6a52',path:'#d8d2c2',door:'#d8d2c2'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=col[t]||(SCH_FLOOR[t]&&SCH_FLOOR[t][0])||(map.solid[y*map.w+x]?'#527657':'#8ca974');
    b.fillRect(x*2,y*2,2,2);
  }
  for(const o of map.objects) if(o.kind==='schoolwing'||o.kind==='car') { b.fillStyle=o.kind==='car'?'#b9483f':'#a8503a'; b.fillRect(o.x*2,o.y*2,o.w*2,o.h*2); }
  return c;
};

// ---------- Battle backdrops ----------
// A classroom at night (chalkboard, clock, little desks), or the Cafetorium stage (curtains, lights).
function drawLEBattleBg(t) {
  const g=schoolGround(currentMap),lab=B2.active&&B2.labSchool;
  if(!g&&!lab) return false;
  if(g==='cafe'||(lab&&B2.labCafe)) {
    rect(0,0,192,108,'#2a1418');
    for(let i=0;i<192;i+=8) { rect(i,0,5,66,'#8a2a32'); rect(i+5,0,3,66,'#6a1a22'); }
    rect(0,0,192,6,'#c9a23a'); rect(0,6,192,2,'#8a6a1a');
    for(let i=0;i<4;i++) { const lx=30+i*44; gfx.globalAlpha=.12+.04*Math.sin(t*1.4+i); polygon([[lx-3,8],[lx+3,8],[lx+20,70],[lx-20,70]],'#fff1cb'); gfx.globalAlpha=1; }
    rect(0,66,192,42,'#a8743a'); rect(0,66,192,3,'#c9a23a'); for(let i=70;i<108;i+=6) rect(0,i,192,1,'#8a5a2a');
    return true;
  }
  rect(0,0,192,108,'#9fb0c0'); rect(0,0,192,4,'#6a7a8a');
  rect(18,10,100,40,'#5a3a22'); rect(20,12,96,36,'#2f4a3a');
  label('A B C 1 2 3',52,18,'#e8e2d0',1); label('SEE ME',88,30,'#ff8a8a',1); for(let i=0;i<5;i++) rect(26+i*16,40,10,1,'#c9d6c0');
  ellipse(150,24,10,10,'#2b2a26'); ellipse(150,24,9,9,'#f4f0e6'); const a=t*6; rect(150,24,Math.round(Math.cos(a)*6),1,'#d94a3a'); rect(150,18,1,6,'#2b2a26');
  rect(128,10,40,4,'#d94a3a'); for(let i=0;i<5;i++) rect(130+i*8,6,6,6,['#ffe27a','#9fd8ff','#ffb0d0','#9be39a','#ffb070'][i]);
  rect(0,56,192,10,'#6a7a8a');
  rect(0,66,192,42,'#c9c2ae'); for(let i=0;i<192;i+=16) rect(i,66,1,42,'#b4ad99'); rect(0,66,192,2,'#e8e2d0');
  for(const [dx,dy] of [[8,72],[160,74],[22,92],[172,94]]) { rect(dx,dy,18,6,'#c98a4a'); rect(dx+2,dy+6,2,8,'#5a5a60'); rect(dx+14,dy+6,2,8,'#5a5a60'); }
  return true;
}
