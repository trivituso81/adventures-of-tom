'use strict';
// engine/ch20-render.js — The look of chapter 20 (the finale): the Stillness Core and the Forever Engine inside the Clockwork Moon.
//   Ground is 'glass' (engine/ch17-render.js draws the floors and walls); this file adds the props:
//     cedoor   one of the eight sealed doors of the Core (o.who): a round brass door with a lamp in that member's colour; flag door-<who> opens it
//     celift   the Engine lift in the middle of the Core: eight lamps along the frame, one lit per open door, and the doors slide open at flag ch20-core
//     cegear   a big gear on the wall, turning (it pauses for a beat on the minute)
//     ceengine the Forever Engine: a tower of meshing gears with a brass hand that points at 4:59; it runs warm once Julian is calm (flag ch20-calm)
//   Also: the battle backdrop for the Engine room, the Resentment Barrier ring and the four Relay set pieces (B2.relayFx, drawn over the enemies in battle),
//   and a little drifting dust on the Core maps. Wraps drawObject, drawLEBattleBg, b7DrawMapFx and b2DrawEnemies. Loaded after engine/ch19-render.js.
const LE_drawObject_ch20=drawObject,LE_drawLEBattleBg_ch20=drawLEBattleBg,LE_b7DrawMapFx_ch20=b7DrawMapFx,LE_b2DrawEnemies_ch20=typeof b2DrawEnemies==='function'?b2DrawEnemies:null;
const ceMap=m=>!!(m&&(m.id==='stillcore'||m.id==='foreverheart'));
const ceFlag=k=>typeof STORY!=='undefined'&&STORY.mode==='full'&&flag(k);
const CE_COL={tom:'#7ab0ff',grace:'#7ad0e8',rose:'#f4a0c0',amy:'#ffb347',deedee:'#9be8a0',boppy:'#e07a50',tnb:'#e0a070',nara:'#e8d8a8'};
const CE_WORD={tom:'CODE',grace:'BEAM',rose:'CRAWL',amy:'SPRINT',deedee:'BRIDGE',boppy:'LEVER',tnb:'SPLICE',nara:'SCENT'};
const CE_BRASS='#c8a040',CE_BRASS_D='#7a5a1a',CE_BRASS_L='#f2d27a';

// A gear, drawn centred on (cx,cy): radius r, n teeth, turning at `spin`.
function ceGear(cx,cy,r,n,spin,col,hole) {
  ellipse(cx,cy,r,r,col);
  for(let k=0;k<n;k++) { const a=spin+k*Math.PI*2/n; rect(Math.round(cx+Math.cos(a)*(r+1))-2,Math.round(cy+Math.sin(a)*(r+1))-2,4,4,col); }
  ellipse(cx,cy,r*.55,r*.55,CE_BRASS_D); ellipse(cx,cy,r*.4,r*.4,hole||'#0c0a12'); rect(cx-1,cy-1,3,3,CE_BRASS_L);
  for(let k=0;k<3;k++) { const a=spin+k*Math.PI*2/3; rect(Math.round(cx+Math.cos(a)*r*.3)-1,Math.round(cy+Math.sin(a)*r*.3)-1,2,2,col); }
}
function ceDoor(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,cx=x+w/2,cy=y+h/2+2,open=ceFlag('door-'+o.who),col=CE_COL[o.who]||'#fff';
  rect(x+2,y+h-4,w-4,4,'#00000040');
  ellipse(cx,cy,w/2-2,h/2+2,CE_BRASS_D); ellipse(cx,cy,w/2-4,h/2,CE_BRASS); ellipse(cx,cy,w/2-8,h/2-4,open?'#fff6d0':'#2a2012');
  if(open) { gfx.globalAlpha=.35+.2*Math.sin(time*3+o.x); ellipse(cx,cy,w/2+4,h/2+6,col); gfx.globalAlpha=1; ellipse(cx,cy,w/2-12,h/2-8,col); }
  else { for(let k=0;k<8;k++) { const a=k*Math.PI/4+time*.2; rect(Math.round(cx+Math.cos(a)*(w/2-11))-1,Math.round(cy+Math.sin(a)*(h/2-6))-1,3,3,CE_BRASS_L); } rect(cx-4,cy-3,8,7,CE_BRASS_L); rect(cx-1,cy-1,2,4,'#2a2012'); }
  rect(cx-10,y-1,20,7,'#0c0a12'); rect(cx-9,y,18,5,open?col:'#3a3220'); label(CE_WORD[o.who]||'',cx,y+1,open?'#0c0a12':'#c8b88a',1);
  rect(cx-3,y+h+1,6,2,col);
}
function ceLift(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,open=ceFlag('ch20-core'),n=['tom','grace','rose','amy','deedee','boppy','tnb','nara'].filter(k=>ceFlag('door-'+k)).length;
  rect(x,y+4,w,h-4,'#0c0a12'); rect(x+2,y+6,w-4,h-10,CE_BRASS_D); rect(x+4,y+8,w-8,h-14,open?'#fff6d0':CE_BRASS);
  if(open) { gfx.globalAlpha=.4+.2*Math.sin(time*4); rect(x+w/2-10,y+8,20,h-14,'#ffe9a0'); gfx.globalAlpha=1; }
  else { rect(x+w/2-1,y+8,2,h-14,'#2a2012'); rect(x+4,y+8,w-8,2,CE_BRASS_L); }
  const names=['tom','grace','rose','amy','deedee','boppy','tnb','nara'];
  for(let k=0;k<8;k++) { const lx=x+8+k*Math.floor((w-16)/7),on=ceFlag('door-'+names[k]); rect(lx-3,y-2,7,7,'#0c0a12'); rect(lx-2,y-1,5,5,on?CE_COL[names[k]]:'#2a2418'); if(on) { gfx.globalAlpha=.3; ellipse(lx,y+1,7,7,CE_COL[names[k]]); gfx.globalAlpha=1; } }
  label(open?'OPEN':n+'/8',x+w/2,y+h-9,open?'#0c0a12':'#f2d27a',1);
}
function ceBigGear(o,time) {
  const cx=o.x*T+o.w*T/2,cy=o.y*T+o.h*T/2,r=Math.min(o.w,o.h)*T/2-2,pause=Math.floor(time)%60===59?0:1;
  ceGear(cx,cy,r,12,(o.x%2?-1:1)*time*.5*pause,CE_BRASS,'#0c0a12');
}
function ceEngine(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,cx=x+w/2,calm=ceFlag('ch20-calm'),run=calm?1:.2;
  gfx.globalAlpha=.16+.08*Math.sin(time*2); ellipse(cx,y+h/2,w*.62,h*.6,calm?'#ffe9a0':'#ffb347'); gfx.globalAlpha=1;
  rect(cx-6,y,12,h,CE_BRASS_D); rect(cx-4,y,8,h,CE_BRASS); rect(cx-4,y,2,h,CE_BRASS_L);
  const rows=[[cx-44,y+h-26,22,12],[cx+40,y+h-24,20,-12],[cx-34,y+h-58,16,-14],[cx+30,y+h-60,18,14],[cx-18,y+h-84,12,16],[cx+16,y+h-90,14,-16],[cx,y+h-14,26,10]];
  for(const [gx,gy,gr,n] of rows) ceGear(gx,gy,gr,Math.abs(n),time*run*(n>0?1:-1)*.6,CE_BRASS,'#0c0a12');
  ellipse(cx,y+10,15,15,CE_BRASS_D); ellipse(cx,y+10,13,13,'#f4f0e6'); ellipse(cx,y+10,11,11,'#e0dccc');
  for(let k=0;k<12;k++) { const a=k*Math.PI/6; rect(Math.round(cx+Math.cos(a)*10),Math.round(y+10+Math.sin(a)*10),1,1,'#08060c'); }
  const ha=calm?time*.8:0; rect(cx,y+3,1,8,'#08060c'); gfx.save(); gfx.translate(cx,y+10); gfx.rotate(calm?ha:2.3); gfx.fillStyle='#08060c'; gfx.fillRect(0,-1,7,2); gfx.restore();
}
drawObject=function(o,time) {
  switch(o.kind) {
    case 'cedoor': return ceDoor(o,time);
    case 'celift': return ceLift(o,time);
    case 'cegear': return ceBigGear(o,time);
    case 'ceengine': return ceEngine(o,time);
  }
  return LE_drawObject_ch20(o,time);
};

// ---------- Battle backdrop: the Forever Engine's gear hall, amber behind the barrier ----------
drawLEBattleBg=function(t) {
  if(!ceMap(currentMap)) return LE_drawLEBattleBg_ch20(t);
  const now=typeof elapsedTime==='number'?elapsedTime:t||0,calm=ceFlag('ch20-julian');
  rect(0,0,192,108,calm?'#1c1824':'#120e18');
  gfx.globalAlpha=.3; ellipse(96,50,92,52,calm?'#ffd8a0':'#b8742a'); gfx.globalAlpha=1;
  for(const [gx,gy,gr,s] of [[20,26,18,1],[168,30,20,-1],[52,60,12,-1],[142,64,14,1],[96,16,14,1]]) { gfx.save(); gfx.globalAlpha=.8; ceGear(gx,gy,gr/2+3,10,now*.3*s,'#6a4a1a','#120e18'); gfx.restore(); }
  rect(0,66,192,42,'#2a2230'); for(let k=0;k<7;k++) rect(0,68+k*6,192,1,'#1c1824'); for(let k=0;k<14;k++) rect(k*14+((k%2)*7),66,1,42,'#1c1824');
  if(calm) { rect(60,56,72,3,'#6a4a2a'); rect(76,40,40,18,'#4a3626'); rect(80,36,32,6,'#6a4a3a'); ellipse(96,34,10,6,'#ffe9a0'); }   // a lamp and an armchair, in glass
  for(let k=0;k<14;k++) { const px=(k*37+now*(5+k%4))%192,py=(k*53+now*(3+k%3)*2)%108; gfx.globalAlpha=.3+.2*Math.sin(now+k); rect(px,py,2,2,'#f2d27a'); gfx.globalAlpha=1; }
  return true;
};
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch20(time);
  if(!ceMap(currentMap)) return;
  gfx.save();
  for(let k=0;k<20;k++) { const px=((k*47+time*(5+k%4))%(currentMap.w*T)),py=((k*83+time*(2+k%3)*2)%(currentMap.h*T)); gfx.globalAlpha=.25+.2*Math.sin(time+k); rect(px,py,2,2,'#f2d27a'); }
  gfx.restore();
};

// ---------- Battle: the Resentment Barrier ring, and the four Relay set pieces ----------
// B2.relayFx={kind,t0} (seconds, set by data/ch20-battle.js): 'distance' a flaming kiln-pot off a longboard, 'aging' a pepper-rhubarb pie behind a recliner,
// 'exhaustion' a tornado of pep with two girls on top, 'fear' a golden boule and a dog.
const CE_BAR_COL={distance:'#6ab0ff',aging:'#c8a0ff',exhaustion:'#ff9a6a',fear:'#7a8ad0'};
const CE_BAR_NAME={distance:'DISTANCE',aging:'AGING',exhaustion:'EXHAUSTION',fear:'FEAR'};
function ceRelayFx(f,t) {
  const R=B2.relayFx; if(!R||R.t0==null) return;
  const now=performance.now()/1000,u=(now-R.t0)/2.6; if(u<0||u>1.05) return;
  const sx=22,sy=76,ex=f.px,ey=f.py-30,q=Math.min(1,u/.85),col=CE_BAR_COL[R.kind]||'#fff';
  const ax=sx+(ex-sx)*q,ay=sy+(ey-sy)*q-Math.sin(Math.PI*q)*(R.kind==='aging'?12:30);
  gfx.save();
  for(let k=0;k<7;k++) { const qq=Math.max(0,q-k*.04),px=sx+(ex-sx)*qq,py=sy+(ey-sy)*qq-Math.sin(Math.PI*qq)*(R.kind==='aging'?12:30); gfx.globalAlpha=.4-k*.05; rect(Math.round(px)-1,Math.round(py)-1,3,3,col); }
  gfx.globalAlpha=1;
  if(q<1) {
    if(R.kind==='distance') { ellipse(ax,ay,6,5,'#8a4a2a'); rect(ax-4,ay-6,8,2,'#d9503f'); const k=Math.floor(now*20)%2; rect(ax-2,ay-10-k,4,4,'#ffb347'); rect(ax-14,ay+8,28,3,'#e8dcb4'); }   // pot with flame, riding a tray
    else if(R.kind==='aging') { ellipse(ax,ay,8,5,'#d9a06a'); ellipse(ax,ay-1,6,3,'#c8503a'); rect(ax-8,ay+6,16,6,'#7a4a8a'); rect(ax-8,ay+4,16,2,'#9a6aaa'); for(let k=0;k<3;k++) rect(ax-4+k*4,ay-10-Math.floor(now*10+k)%3,2,3,'#f4f0e6'); }   // a pie, steaming, behind a recliner
    else if(R.kind==='exhaustion') { for(let k=0;k<5;k++) { const a=now*10+k*1.26; rect(Math.round(ax+Math.cos(a)*(5+k*2)),Math.round(ay+Math.sin(a)*(3+k)),3,3,k%2?'#ffb347':'#fff6c8'); } rect(ax-3,ay-10,6,8,'#7ad0e8'); rect(ax-2,ay-16,4,6,'#f4a0c0'); }   // a spinning tornado with Grace and Rose on top
    else { ellipse(ax,ay,6,6,'#f2c75a'); ellipse(ax-1,ay-1,3,3,'#fff0a0'); rect(ax-14,ay+2,8,5,'#e8d8a8'); rect(ax-16,ay,4,3,'#e8d8a8'); rect(ax-8,ay+6,3,3,'#e8d8a8'); rect(ax-14,ay+6,3,3,'#e8d8a8'); }   // a golden boule, and a dog behind it
  } else { gfx.globalAlpha=Math.max(0,1.05-u)*3; ellipse(ex,ey,40*(u-.8)*5,34*(u-.8)*5,col); gfx.globalAlpha=1; }
  gfx.restore();
}
if(LE_b2DrawEnemies_ch20) b2DrawEnemies=function(t) {
  LE_b2DrawEnemies_ch20(t);
  for(const f of (B2.foes||[])) {
    if(f.boss!=='leviathan'||f.dead||f.dying>0) continue;
    if(f.barUp) {   // a ring of the barrier's colour, four pips for the four barriers
      const k=.5+.5*Math.sin(t*4),cx=f.px,cy=f.py-34,r=54,col=CE_BAR_COL[f.barKey]||'#fff';
      gfx.save(); gfx.globalAlpha=.18+.12*k; ellipse(cx,cy,r,r*.85,col); gfx.globalAlpha=.9; gfx.strokeStyle=col; gfx.lineWidth=3; gfx.beginPath(); gfx.ellipse(cx,cy,r,r*.85,0,0,Math.PI*2); gfx.stroke(); gfx.restore();
      label(CE_BAR_NAME[f.barKey]||'',cx,cy-r*.85-14,col,2);
    }
    for(let i=0;i<4;i++) { const broken=i<(f.barrier||0); rect(f.px-24+i*13,f.py+20,10,5,'#0b0d12'); rect(f.px-23+i*13,f.py+21,8,3,broken?'#3a3a3a':CE_BAR_COL[['distance','aging','exhaustion','fear'][i]]); }
    ceRelayFx(f,t);
  }
};
