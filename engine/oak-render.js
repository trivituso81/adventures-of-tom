'use strict';
// engine/oak-render.js — The look of chapter 6's Old Oak Park (ground 'park', with 'sand', 'soil' and 'mulch'), the inside
// of the Old Oak ('oak', with 'branch' and 'pit' tiles) and its crown ('canopy'). Props: bigoak, oakdoor, slide, swings,
// climber, mound, gardenbed, scarecrow, picnic, grill, trashcan, dogbench, dogbowl, hoop, watchboard, drinkfountain,
// barkwall, warboard, nutshelf, mushroom, bucket, acornpile, firefly, leafwall, hoard, lookout. Also the minimap colors
// and the battle backdrops for these maps. Wraps drawOutdoorTile, drawObject, buildMiniBase and drawLABattleBg.
// Loaded after engine/school-render.js.
const LE_drawOutdoorTile_oak=drawOutdoorTile,LE_drawObject_oak=drawObject,LE_buildMiniBase_oak=buildMiniBase,LE_drawLABattleBg_oak=drawLABattleBg;
const OAK_GROUNDS=['park','oak','canopy'];
const oakGround=map=>{ const g=map&&map.style&&map.style.ground; return OAK_GROUNDS.includes(g)?g:null; };
const oakTile=(x,y,t)=>within(currentMap,x,y)&&currentMap.tiles[y][x]===t;
const OAK_KINDS=new Set(['bigoak','oakdoor','slide','swings','climber','mound','gardenbed','scarecrow','picnic','grill','trashcan','dogbench','dogbowl',
  'hoop','watchboard','drinkfountain','barkwall','warboard','nutshelf','mushroom','bucket','acornpile','firefly','leafwall','hoard','lookout']);

// ---------- Ground ----------
function oakBark(px,py,n) {
  rect(px,py,T,T,['#6a4a30','#654628','#6e4e32','#5f4226'][n%4]);
  for(let k=0;k<3;k++) rect(px+4+k*10+(n>>>k)%4,py,2,T,'#523820');
  if(n%5===0) rect(px+12,py+10,6,8,'#4a321c');
}
drawOutdoorTile=function(x,y,type,time) {
  const g=oakGround(currentMap);
  if(!g) return LE_drawOutdoorTile_oak(x,y,type,time);
  const px=x*T,py=y*T,n=hash(x,y);
  if(g==='park') {
    if(type==='path'||type==='door'||type==='road') {
      // Decomposed granite: warm tan, with little pebbles and a soft edge.
      rect(px,py,T,T,['#d8bf92','#d3ba8c','#dcc398','#cfb688'][n%4]);
      for(let k=0;k<4;k++) { const q=hash(x*5+k,y*3); rect(px+q%29,py+(q>>>6)%29,2,2,['#b89c6e','#efdcb4','#a88c60'][k%3]); }
      if(!['path','door','road'].includes(within(currentMap,x,y-1)?currentMap.tiles[y-1][x]:'path')) rect(px,py,T,2,'#9cb26c');
      return;
    }
    if(type==='sand') {
      rect(px,py,T,T,['#ecd9a8','#e8d4a2','#f0ddb0','#e4d09c'][n%4]);
      if(n%3===0) rect(px+6+(n%16),py+8+((n>>>4)%14),4,2,'#d8c08a');
      if(n%7===0) { rect(px+18,py+18,3,3,'#7a4a22'); rect(px+18,py+17,3,1,'#a8743a'); }   // a stray acorn
      return;
    }
    if(type==='soil') {
      rect(px,py,T,T,['#7a5a3e','#75563a','#7e5e42','#715236'][n%4]);
      for(let k=0;k<3;k++) rect(px+2,py+5+k*10,T-4,2,'#614530');
      if(n%4===0) { rect(px+10+(n%10),py+12,2,4,'#6fa04e'); rect(px+8+(n%10),py+11,6,2,'#8cc070'); }
      return;
    }
    if(type==='mulch') {
      rect(px,py,T,T,['#9a7048','#946a42','#a0764e','#8e643e'][n%4]);
      for(let k=0;k<6;k++) { const q=hash(x*7+k,y*11); rect(px+q%28,py+(q>>>6)%28,4,1,['#7a5232','#b88a5a','#6a4a2a'][k%3]); }
      return;
    }
    // Park lawn: greener than 2nd Ave (it gets watered), with clover.
    rect(px,py,T,T,['#8fb862','#94bd66','#8ab45e','#98c06a'][n%4]);
    const gx=px+4+(n%12),gy=py+6+((n>>>4)%12);
    rect(gx,gy,1,3,'#6f9a48'); rect(gx+2,gy+1,1,3,'#6f9a48'); rect(gx+1,gy-1,1,2,'#b4d488');
    if(n%11===0) { rect(px+20,py+8,2,2,'#f4f4f0'); rect(px+21,py+7,1,1,'#ffe27a'); }   // a clover flower
    if(n%17===0) { rect(px+8,py+20,3,3,'#7a4a22'); rect(px+8,py+19,3,1,'#a8743a'); }
    return;
  }
  if(g==='oak') {
    if(type==='pit') {
      // The hollow: a long drop down the inside of the trunk, a little light far below.
      rect(px,py,T,T,'#120c08');
      if(!oakTile(x,y-1,'pit')&&!oakTile(x,y-1,'branch')) { rect(px,py,T,4,'#3a2616'); rect(px,py+4,T,2,'#22160c'); }
      if(n%6===0) rect(px+6+(n%18),py+12+((n>>>5)%12),1,1,'#e8c84a');   // a firefly, far down
      return;
    }
    if(type==='ladder') {
      // The rope ladder, down the middle of the hollow once Nara rides the bucket.
      rect(px,py,T,T,'#120c08');
      const L=oakTile(x-1,y,'ladder');
      rect(px+(L?T-6:4),py,3,T,'#c9b48a');
      for(let k=4;k<T;k+=9) rect(px+(L?0:4),py+k,L?T-4:T-4,3,'#a8804e');
      return;
    }
    if(type==='branch') {
      rect(px,py,T,T,'#120c08');
      const L=oakTile(x-1,y,'branch'),R=oakTile(x+1,y,'branch');
      const x0=L?0:3,x1=R?T:T-3;
      rect(px+x0,py,x1-x0,T,'#8a6440'); rect(px+x0,py,x1-x0,2,'#a8804e');
      for(let k=3;k<T;k+=7) rect(px+x0+2,py+k,x1-x0-4,1,'#6a4a2a');
      if(!L) rect(px,py,3,T,'#4a321c'); if(!R) rect(px+T-3,py,3,T,'#4a321c');
      if(n%3===0) { rect(px+x0+4,py+14,4,4,'#6fa04e'); }   // a leaf
      return;
    }
    // The floor of the hollow: heartwood rings, worn smooth by a hundred years of tiny feet.
    rect(px,py,T,T,['#a8784a','#a4744a','#ac7c4e','#a07046'][n%4]);
    const cx=12*T,cy=14*T,d=Math.hypot(px+16-cx,py+16-cy);
    if(Math.floor(d/12)%2===0) rect(px+2,py+2,T-4,T-4,'#b0825a');
    rect(px,py,T,1,'#8a5e38'); rect(px,py,1,T,'#8a5e38');
    if(n%9===0) { rect(px+10,py+12,3,3,'#7a4a22'); rect(px+10,py+11,3,1,'#a8743a'); }
    return;
  }
  // canopy: thick limbs woven into a platform, with the sky and the leaves far below through the gaps.
  if(type==='pit') {
    rect(px,py,T,T,['#8fc6ec','#94caee','#8ac2ea'][n%3]);
    ellipse(px+8+(n%16),py+16,10,7,'#4f8a4a'); ellipse(px+20,py+24,9,6,'#6aa35a');
    return;
  }
  rect(px,py,T,T,['#8a6440','#86603c','#8e6844','#825c38'][n%4]);
  for(let k=0;k<4;k++) rect(px,py+3+k*8,T,2,'#6a4a2a');
  rect(px,py+1+(n%3)*8,T,1,'#a8804e');
  if(n%4===0) { ellipse(px+6+(n%20),py+10,5,3,'#5f9a52'); ellipse(px+8+(n%20),py+9,3,2,'#8cc070'); }
};

// ---------- Props ----------
function oakLeaves(cx,cy,rx,ry,time,seed) {
  const pal=['#4f7d3a','#5f9048','#3f6a30','#7aa858'];
  ellipse(cx,cy,rx+2,ry+2,OUT);
  ellipse(cx,cy,rx,ry,pal[0]);
  for(let k=0;k<9;k++) { const q=hash(seed+k,k*13),a=k/9*Math.PI*2,sw=Math.sin(time*1.1+k)*1.2;
    ellipse(cx+Math.cos(a)*rx*.55+sw,cy+Math.sin(a)*ry*.5,rx*.34,ry*.32,pal[1+q%3]); }
  ellipse(cx-rx*.3,cy-ry*.4,rx*.3,ry*.25,pal[3]);
}
drawObject=function(o,time) {
  if(!OAK_KINDS.has(o.kind)) return LE_drawObject_oak(o,time);
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,n=hash(o.x,o.y);
  switch(o.kind) {
    case 'bigoak': {
      // A huge coast live oak: a wide trunk with a hollow door (row 4 below it), roots, and a crown off the top.
      ellipse(cx,b+6,w/2,10,'#2b2a2640');
      rect(cx-70,b-T*3-6,140,T*3+8,OUT);
      rect(cx-68,b-T*3-4,136,T*3+4,'#6a4a30');
      for(let k=0;k<9;k++) rect(cx-60+k*15,b-T*3-2,4,T*3,'#523820');
      rect(cx-68,b-T*3-4,10,T*3+4,'#4a321c'); rect(cx+58,b-T*3-4,10,T*3+4,'#4a321c');
      // roots
      for(const [dx,s] of [[-80,-1],[-56,-1],[56,1],[80,1]]) polygon([[cx+dx-12*s,b+4],[cx+dx,b-10],[cx+dx+10*s,b+6]],'#5a3e26');
      // knotholes, one with eyes
      ellipse(cx-40,b-60,7,9,'#2b1d12'); ellipse(cx+44,b-34,6,7,'#2b1d12');
      if(Math.floor(time*.7+n)%4) { rect(cx-43,b-62,2,2,'#ffffff'); rect(cx-38,b-62,2,2,'#ffffff'); }
      // the hollow door frame: drawn down into row 4 (the door tiles)
      ellipse(cx,b+4,30,22,'#4a321c');
      const open=currentMap.doorOpen;
      ellipse(cx,b+6,25,18,open?'#120c08':'#3a2616');
      // crown, off the top of the map
      oakLeaves(cx,b-T*3-40,150,56,time,o.x);
      oakLeaves(cx-90,b-T*3-6,46,26,time,o.x+3); oakLeaves(cx+92,b-T*3-10,50,26,time,o.x+5);
      return;
    }
    case 'oakdoor': {
      // A little round door with an acorn knocker, set in the hollow.
      ellipse(cx,b-10,22,16,OUT); ellipse(cx,b-10,20,14,'#a8743a');
      for(let k=-12;k<=12;k+=6) rect(cx+k,b-24,2,26,'#7a4a22');
      rect(cx-20,b-12,40,2,'#5a3416');
      ellipse(cx+10,b-10,3,3,OUT); ellipse(cx+10,b-10,2,2,'#e8c84a');
      ellipse(cx,b-16,5,4,'#7a4a22'); rect(cx-5,b-20,10,3,'#a8743a'); rect(cx-1,b-22,2,2,'#5a3416');   // acorn knocker
      return;
    }
    case 'slide': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      rect(x+6,y-26,4,30,OUT); rect(x+10,y-26,2,30,'#c9ccd4');
      for(let k=0;k<5;k++) rect(x+4,y-22+k*6,10,2,'#8a8f98');
      rect(x+2,y-30,16,6,OUT); rect(x+3,y-29,14,4,'#e8584a');
      polygon([[x+16,y-28],[x+22,y-28],[x+w-2,b-4],[x+w-10,b-2]],OUT);
      polygon([[x+17,y-27],[x+21,y-27],[x+w-4,b-5],[x+w-10,b-4]],'#e8c84a');
      return;
    }
    case 'swings': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      rect(x+2,y-30,4,h+28,OUT); rect(x+w-6,y-30,4,h+28,OUT); rect(x+2,y-32,w-4,4,OUT); rect(x+3,y-31,w-6,2,'#3a9ca0');
      for(let k=0;k<3;k++) { const sx=x+18+k*26,sw=k===1?Math.sin(time*2.2)*6:0;
        rect(sx+sw,y-28,1,30,'#5a5a60'); rect(sx+12+sw,y-28,1,30,'#5a5a60'); rect(sx-1+sw,y+2,15,4,OUT); rect(sx+sw,y+3,13,2,'#2c2c33'); }
      return;
    }
    case 'climber': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      gfx.strokeStyle='#e8584a'; gfx.lineWidth=2;
      for(let k=0;k<4;k++) { gfx.beginPath(); gfx.ellipse(cx,b-4,28,24-k*6,0,Math.PI,0); gfx.stroke(); }
      gfx.strokeStyle='#3a9ca0'; for(let k=-2;k<=2;k++) { gfx.beginPath(); gfx.moveTo(cx+k*12,b-4); gfx.quadraticCurveTo(cx+k*7,b-26,cx,b-28); gfx.stroke(); }
      rect(cx-1,b-42,2,14,OUT); polygon([[cx+1,b-42],[cx+10,b-38],[cx+1,b-34]],'#e8c84a'); ellipse(cx+5,b-38,2,2,'#7a4a22');
      return;
    }
    case 'mound': {
      const dug=typeof ch6Dug==='function'&&ch6Dug(o.dig);
      if(dug) { ellipse(cx,b-12,12,6,'#3a2616'); ellipse(cx,b-13,9,4,'#1e140c'); ellipse(cx+12,b-8,7,4,'#8a6440'); return; }
      ellipse(cx,b-10,14,8,OUT); ellipse(cx,b-11,12,7,currentMap.tiles[o.y]&&currentMap.tiles[o.y][o.x]==='sand'?'#d8c08a':'#7a5a3e');
      ellipse(cx-3,b-14,6,3,'#b8986a'); rect(cx+6,b-18,3,3,'#7a4a22'); rect(cx+6,b-19,3,1,'#a8743a');
      if(typeof ch6CanDig==='function'&&ch6CanDig(o.dig)&&Math.floor(time*2)%2) { label('!',cx,b-34,'#ffe08a',2); }
      return;
    }
    case 'gardenbed': {
      rect(x+2,y+6,w-4,h-8,OUT); rect(x+3,y+7,w-6,h-10,'#8a5a32'); rect(x+5,y+9,w-10,h-14,'#5a3e26');
      for(let k=x+10;k<x+w-8;k+=14) { rect(k,y-4,2,14,'#4f7d3a'); ellipse(k-2,y-2,6,4,'#5f9048'); ellipse(k+4,y+2,5,4,'#6fa04e');
        if(o.w>2) { ellipse(k+2,y+4,3,3,OUT); ellipse(k+2,y+4,2,2,'#d94a3a'); rect(k+3,y+2,1,1,'#ffffff'); } }
      return;
    }
    case 'scarecrow': {
      ellipse(cx,b-2,8,3,'#2b2a2633');
      rect(cx-1,y-24,3,h+22,'#7a5a3a'); rect(cx-16,y-10,32,3,'#7a5a3a');
      rect(cx-9,y-12,18,16,OUT); rect(cx-8,y-11,16,14,'#c9463d'); for(let k=0;k<3;k++) rect(cx-8,y-8+k*4,16,1,'#2c2c33');
      ellipse(cx,y-20,7,7,OUT); ellipse(cx,y-20,6,6,'#e8d8a0'); rect(cx-3,y-21,2,2,OUT); rect(cx+2,y-21,2,2,OUT);
      rect(cx-8,y-28,16,5,OUT); rect(cx-7,y-27,14,3,'#2f5a9a'); rect(cx+4,y-25,7,2,'#2f5a9a');
      ellipse(cx+2,y-33,4,4,'#9a6a3a'); rect(cx+5,y-37,3,6,'#b8845a'); rect(cx,y-35,1,1,OUT);   // a squirrel on its head
      return;
    }
    case 'picnic': {
      ellipse(cx,b-2,w/2,5,'#2b2a2633');
      rect(x+2,y+8,w-4,8,OUT); rect(x+3,y+9,w-6,6,'#b8845a');
      for(let k=0;k<w-6;k+=8) rect(x+3+k,y+9,4,6,'#d94a3a');   // gingham cloth
      rect(x-2,y+20,w+4,4,OUT); rect(x-1,y+21,w+2,2,'#8a6440');
      rect(x+6,y+14,3,14,OUT); rect(x+w-9,y+14,3,14,OUT);
      ellipse(x+14,y+6,6,3,'#f4f0e6'); rect(x+30,y+2,8,6,'#e8c060'); rect(x+44,y+4,6,4,'#9fd8ff');
      return;
    }
    case 'grill': {
      ellipse(cx,b-2,8,3,'#2b2a2633');
      rect(cx-1,y+6,3,22,OUT); rect(cx-12,y,24,8,OUT); rect(cx-11,y+1,22,6,'#3a3f46');
      for(let k=0;k<3;k++) for(let j=0;j<=k;j++) { ellipse(cx-4+j*4-k*0+(2-k)*2,y-2-(2-k)*3,2,2,'#7a4a22'); }
      return;
    }
    case 'trashcan': {
      ellipse(cx,b-2,9,3,'#2b2a2633');
      rect(cx-9,y+4,18,24,OUT); rect(cx-8,y+5,16,22,'#2f6a4a'); for(let k=0;k<3;k++) rect(cx-6+k*5,y+8,2,16,'#245a3c');
      rect(cx-10,y,20,6,OUT); rect(cx-9,y+1,18,4,'#3f7a5a'); rect(cx+6,y-2,6,3,'#3f7a5a');
      return;
    }
    case 'dogbench': {
      ellipse(cx,b-3,w/2,4,'#2b2a2630');
      rect(x+4,y+6,w-8,6,OUT); rect(x+5,y+7,w-10,4,'#8a6440'); rect(x+4,y+14,w-8,5,OUT); rect(x+5,y+15,w-10,3,'#a8804e');
      rect(x+8,y+18,3,10,OUT); rect(x+w-11,y+18,3,10,OUT);
      label('DOGS',cx,y+8,'#fff1cb',1);
      return;
    }
    case 'dogbowl': {
      ellipse(cx,b-8,10,5,OUT); ellipse(cx,b-9,9,4,'#3a9ca0'); ellipse(cx,b-10,6,2,'#9fd8ff');
      if(Math.floor(time*1.3)%3===0) rect(cx-1,b-11,2,1,'#ffffff');
      return;
    }
    case 'hoop': {
      rect(cx-12,b-8,2,8,OUT); rect(cx+10,b-8,2,8,OUT);
      gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(cx,b-18,10,0,Math.PI*2); gfx.stroke();
      gfx.strokeStyle='#e8c84a'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(cx,b-18,10,0,Math.PI*2); gfx.stroke();
      return;
    }
    case 'watchboard': {
      ellipse(cx,b-2,10,3,'#2b2a2630');
      rect(cx-10,b-12,2,12,OUT); rect(cx+8,b-12,2,12,OUT);
      rect(cx-16,y-20,32,24,OUT); rect(cx-15,y-19,30,22,'#c9a06a');
      for(const [dx,dy,c] of [[-12,-16,'#f4f0e6'],[2,-17,'#f4f0e6'],[-8,-6,'#ffe27a'],[6,-6,'#f4f0e6']]) rect(cx+dx,y+dy,7,6,c);
      gfx.strokeStyle='#d94a3a'; gfx.lineWidth=1; gfx.beginPath(); gfx.moveTo(cx-9,y-13); gfx.lineTo(cx+5,y-14); gfx.lineTo(cx-5,y-3); gfx.lineTo(cx+9,y-3); gfx.stroke();
      return;
    }
    case 'drinkfountain': {
      ellipse(cx,b-2,8,3,'#2b2a2630');
      rect(cx-5,y+4,10,24,OUT); rect(cx-4,y+5,8,22,'#9aa3ab'); rect(cx-8,y,16,6,OUT); rect(cx-7,y+1,14,4,'#c9ccd4');
      ellipse(cx+9,b-4,5,3,OUT); ellipse(cx+9,b-4,4,2,'#9fd8ff');
      return;
    }
    case 'barkwall': {
      const top=y-14;
      rect(x,top,T,b-top,'#4a321c'); rect(x+1,top+1,T-2,b-top-2,['#6a4a30','#654628','#6e4e32'][n%3]);
      for(let k=0;k<3;k++) rect(x+4+k*10,top+2,2,b-top-4,'#523820');
      if(n%7===0) { rect(x+10,top+12,10,1,'#c9a06a'); rect(x+10,top+15,8,1,'#c9a06a'); }   // tally marks
      return;
    }
    case 'warboard': {
      rect(x+2,y-20,w-4,h+18,OUT); rect(x+3,y-19,w-6,h+16,'#c9a06a');
      const pins=[[10,-14],[34,-16],[60,-12],[90,-15],[110,-10],[22,0],[50,2],[76,-2],[100,4]];
      for(const [dx,dy] of pins) { rect(x+dx,y+dy,14,10,(dx+dy)%3?'#f4f0e6':'#ffe27a'); rect(x+dx+5,y+dy-1,3,3,'#d94a3a'); }
      // the jar in the middle, circled
      rect(x+w/2-6,y-6,12,14,OUT); rect(x+w/2-5,y-5,10,12,'#d8f0f4'); rect(x+w/2-5,y+1,10,6,'#f2e2b0');
      gfx.strokeStyle='#d94a3a'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.ellipse(x+w/2,y+1,14,12,0,0,Math.PI*2); gfx.stroke();
      gfx.beginPath(); for(const [dx,dy] of pins) { gfx.moveTo(x+w/2,y+1); gfx.lineTo(x+dx+7,y+dy+5); } gfx.stroke();
      label('BIG BREAD',x+w/2,y-24,'#2b2a26',1);
      return;
    }
    case 'nutshelf': {
      rect(x+2,y-12,w-4,h+10,OUT); rect(x+3,y-11,w-6,h+8,'#8a6440');
      for(let k=0;k<4;k++) { const yy=y-8+k*14; rect(x+3,yy+10,w-6,2,'#5a3e26');
        for(let j=0;j<3;j++) { ellipse(x+9+j*7,yy+7,3,3,'#7a4a22'); rect(x+7+j*7,yy+3,5,2,'#a8743a'); } }
      return;
    }
    case 'mushroom': {
      ellipse(cx,b-3,10,3,'#2b2a2630');
      rect(cx-4,b-14,8,12,OUT); rect(cx-3,b-13,6,11,'#f4ecd8');
      ellipse(cx,b-16,13,8,OUT); ellipse(cx,b-17,12,7,'#c9463d'); ellipse(cx-5,b-19,2,2,'#ffffff'); ellipse(cx+4,b-17,2,2,'#ffffff'); ellipse(cx,b-21,2,1,'#ffffff');
      return;
    }
    case 'bucket': {
      rect(cx-1,y-60,2,52,'#c9b48a');   // the rope, up into the dark
      const lift=currentMap.ladderDown?10:0;
      rect(cx-9,y-8+lift,18,16,OUT); rect(cx-8,y-7+lift,16,14,'#8a8f98'); rect(cx-8,y-7+lift,16,3,'#c9ccd4');
      gfx.strokeStyle=OUT; gfx.lineWidth=1; gfx.beginPath(); gfx.arc(cx,y-8+lift,8,Math.PI,0); gfx.stroke();
      return;
    }
    case 'acornpile': {
      ellipse(cx,b-3,12,4,'#2b2a2630');
      for(let r=0;r<4;r++) for(let k=0;k<4-r;k++) { const ax=cx-9+k*6+r*3,ay=b-6-r*5; ellipse(ax,ay,3,3,OUT); ellipse(ax,ay,2,2,'#c98a4a'); rect(ax-2,ay-3,4,1,'#7a4a22'); }
      return;
    }
    case 'firefly': {
      rect(cx-6,b-18,12,16,OUT); rect(cx-5,b-17,10,14,'#2a3a2a'); rect(cx-6,b-20,12,3,'#c9a06a');
      for(let k=0;k<3;k++) { const q=Math.sin(time*2+k*2.1); gfx.globalAlpha=.5+.5*q; rect(cx-3+k*3,b-14+((k*5)%9),2,2,'#ffe86a'); }
      gfx.globalAlpha=.18; ellipse(cx,b-10,18,14,'#ffe86a'); gfx.globalAlpha=1;
      return;
    }
    case 'leafwall': {
      oakLeaves(cx,b-16,20,18,time,o.x*31+o.y);
      return;
    }
    case 'hoard': {
      // A great pile of everything shiny on 2nd Ave, with the jar on top until the boss is beaten.
      ellipse(cx,b-2,w/2,8,'#2b2a2640');
      polygon([[x,b],[x+20,b-30],[cx-20,b-52],[cx+24,b-54],[x+w-20,b-28],[x+w,b]],OUT);
      polygon([[x+2,b-1],[x+22,b-29],[cx-19,b-50],[cx+23,b-52],[x+w-22,b-27],[x+w-2,b-1]],'#8a6440');
      for(let k=0;k<40;k++) { const q=hash(k,o.x*3),px=x+10+q%(w-20),py=b-6-((q>>>7)%42)*(1-Math.abs(px-cx)/(w*.6));
        const c=['#c98a4a','#c9ccd4','#e8c84a','#e8f46a','#d94a3a','#3a9ca0','#7a4a22'][k%7];
        if(k%7===3) { ellipse(px,py,4,4,OUT); ellipse(px,py,3,3,c); } else rect(px-2,py-2,5,4,c); }
      if(!(typeof flag==='function'&&flag('ch6-clear'))) {
        rect(cx-8,b-72,16,20,OUT); rect(cx-7,b-71,14,18,'#d8f0f4'); rect(cx-7,b-62,14,9,'#f2e2b0');
        for(let k=0;k<3;k++) ellipse(cx-3+k*3,b-62-((time*3+k)%4),1,1,'#ffffff');
        rect(cx-8,b-75,16,4,'#8a8f98'); label('BM',cx,b-60,'#7a5a3a',1);
      }
      return;
    }
    case 'lookout': {
      rect(cx-1,b-30,3,28,'#7a5a3a'); ellipse(cx,b-32,6,3,OUT); ellipse(cx,b-33,5,2,'#d94a3a');
      rect(cx+2,b-26,10,6,'#f4f0e6');
      return;
    }
  }
  return LE_drawObject_oak(o,time);
};

// ---------- Minimap ----------
buildMiniBase=function(map) {
  const g=oakGround(map);
  if(!g) return LE_buildMiniBase_oak(map);
  const c=document.createElement('canvas'); c.width=map.w*2; c.height=map.h*2;
  const b=c.getContext('2d');
  const col={park:{base:'#8fb862',path:'#d8bf92',solid:'#4f7d3a'},oak:{base:'#a8784a',path:'#8a6440',solid:'#4a321c'},canopy:{base:'#8a6440',path:'#8a6440',solid:'#4f7d3a'}}[g];
  const tc={ladder:'#c9b48a',sand:'#ecd9a8',soil:'#7a5a3e',mulch:'#9a7048',branch:'#c9a06a',pit:g==='canopy'?'#8fc6ec':'#120c08'};
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++) {
    const t=map.tiles[y][x];
    b.fillStyle=tc[t]||(t==='path'||t==='door'?col.path:(map.solid[y*map.w+x]?col.solid:col.base));
    b.fillRect(x*2,y*2,2,2);
  }
  return c;
};

// ---------- Battle backdrops ----------
// The park: a blue afternoon over the lawn and the oak. Inside the Oak: dark bark and fireflies. The crown: open sky.
function drawOakBattleBg(t,g) {
  if(g==='oak') {
    rect(0,0,192,108,'#24170c');
    for(let i=0;i<12;i++) rect(i*16+(i%3),0,3,66,'#3a2616');
    for(let i=0;i<10;i++) { const n=hash(i,61); gfx.globalAlpha=.5+.5*Math.sin(t*2+i); rect(n%192,(n>>>8)%60,1,1,'#ffe86a'); }
    gfx.globalAlpha=1;
    rect(0,66,192,42,'#a8784a'); rect(0,66,192,2,'#c9a06a');
    for(let i=0;i<6;i++) { gfx.strokeStyle='#8a5e38'; gfx.lineWidth=1; gfx.beginPath(); gfx.ellipse(96,92,30+i*18,8+i*4,0,0,Math.PI*2); gfx.stroke(); }
    return;
  }
  if(g==='canopy') {
    const sky=['#6fb4e8','#7bbcea','#88c4ec','#96ccee','#a6d4f0','#b6dcf2'];
    for(let i=0;i<6;i++) rect(0,i*11,192,11,sky[i]);
    ellipse(160,14,8,8,'#fff6c0');
    for(const [x,y,r] of [[10,20,22],[180,30,26],[40,60,30],[150,62,30],[96,70,40]]) { ellipse(x,y,r,r*.6,'#4f7d3a'); ellipse(x-4,y-4,r*.6,r*.4,'#6aa35a'); }
    rect(0,70,192,38,'#8a6440'); for(let k=0;k<5;k++) rect(0,74+k*7,192,2,'#6a4a2a');
    return;
  }
  const sky=['#7bbcea','#88c4ec','#96ccee','#a6d4f0','#b6dcf2','#c4e2f2'];
  for(let i=0;i<6;i++) rect(0,i*11,192,11,sky[i]);
  rect(122,20,22,46,'#5a3e26'); ellipse(133,18,44,22,'#4f7d3a'); ellipse(118,24,20,12,'#5f9048'); ellipse(150,22,20,12,'#3f6a30');
  for(const x of [10,40,176]) { rect(x-1,46,3,20,'#7d6552'); ellipse(x,42,10,9,x===40?'#8a6ac4':'#7d8a5a'); }
  rect(60,56,30,10,'#e8584a'); rect(62,50,4,6,'#c9ccd4'); rect(66,46,20,4,'#e8c84a');   // the playground
  rect(0,66,192,42,'#8fb862'); rect(0,66,192,2,'#b4d488');
  for(let i=0;i<36;i++) { const n=hash(i,17); rect(n%192,70+(n>>>8)%34,1,2,'#6f9a48'); }
  for(let i=0;i<6;i++) { const n=hash(i,23); ellipse(n%192,76+(n>>>8)%28,2,2,'#c98a4a'); }
}
drawLABattleBg=function(t) {
  const g=oakGround(currentMap),lab=B2.active&&B2.labOak;
  if(!g&&!lab) return LE_drawLABattleBg_oak(t);
  drawOakBattleBg(t,g||(B2.labCrown?'canopy':'park'));
};
