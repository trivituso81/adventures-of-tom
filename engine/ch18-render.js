'use strict';
// engine/ch18-render.js — The look of chapter 18 (Part 2): the Chronos Loom Chamber at the top of the Glass Tower.
//   Prop: glloom (the Chronos Loom: a tall gold-and-dark-wood frame, hundreds of humming threads rising into the ceiling, and a cloth woven from tiny paused afternoons).
//   Battle backdrop: the tower's glass wall and floor (engine/ch17-render.js) with the Loom's gold threads hanging in front of the sky.
//   Map effect: CH18FX.light (data/scenes-ch18.js), a column of light rising from the tile where Tom stood.
// Reads the glass helpers from engine/ch17-render.js. Wraps drawObject, drawLEBattleBg and mcAreaTrack. Loaded after engine/ch17-render.js.
const LE_drawObject_ch18=drawObject,LE_drawLEBattleBg_ch18=drawLEBattleBg,LE_b7DrawMapFx_ch18=b7DrawMapFx;
let LE_mcAreaTrack_ch18=null;
addEventListener('DOMContentLoaded',()=>{
  if(typeof mcAreaTrack!=='function'||LE_mcAreaTrack_ch18) return;
  LE_mcAreaTrack_ch18=mcAreaTrack;
  mcAreaTrack=function(m) { return m&&m.id==='towerpinnacle'?'terminal':LE_mcAreaTrack_ch18(m); };
});
const GL_LOOM_CLOTH=['#d9503f','#4a78c2','#f2c75a','#6aa05a','#f4f0e6','#a8453a','#7a5ab0','#e8a0a0'];
function glLoom(o,time) {
  const x=o.x*T,y=o.y*T,w=o.w*T,h=o.h*T,b=y+h,cx=x+w/2,top=y-118;
  ellipse(cx,b-3,w/2,6,'#00000050');
  // the frame: two tall posts and a top beam, dark wood with gold caps
  for(const px of [x+4,x+w-16]) { rect(px,top,12,b-top-6,OUT); rect(px+1,top+1,10,b-top-8,'#4a3422'); rect(px+1,top+1,3,b-top-8,'#6a4c32'); rect(px-2,top-4,16,6,glGold); rect(px-2,b-14,16,8,glGold); }
  rect(x+4,top,w-8,10,OUT); rect(x+5,top+1,w-10,8,'#4a3422'); rect(x+5,top+1,w-10,2,'#6a4c32'); rect(x+4,top+8,w-8,3,glGold);
  // the threads: hundreds of gold lines from the beam down to the cloth, shimmering in turn
  const N=Math.floor((w-48)/5),y0=top+12,y1=y+22;
  for(let k=0;k<N;k++) {
    const tx=x+24+k*5,s=.5+.5*Math.sin(time*2.2+k*.55+hash(k,2)%7);
    gfx.globalAlpha=.35+.45*s; rect(tx,y0,1,y1-y0,k%7===0?'#fff6c8':'#e8b84a'); gfx.globalAlpha=1;
    if(k%5===0) { const py=y0+((time*34+k*21)%(y1-y0)); gfx.globalAlpha=.9; rect(tx-1,py,3,3,'#ffffff'); gfx.globalAlpha=1; }   // a spark running down a thread
  }
  // the cloth: a patchwork of tiny afternoons, still being woven
  const cx0=x+20,cw=w-40,cy0=y+22,ch=h-34;
  rect(cx0-2,cy0-2,cw+4,ch+4,OUT); rect(cx0,cy0,cw,ch,'#2a2236');
  const cell=8,cols=Math.floor(cw/cell),rows=Math.floor(ch/cell);
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    const m=hash(c,r+11); if(m%9===0) continue;
    const col=GL_LOOM_CLOTH[(m+c+r)%GL_LOOM_CLOTH.length];
    rect(cx0+c*cell+1,cy0+r*cell+1,cell-2,cell-2,col);
    if(m%5===0) rect(cx0+c*cell+3,cy0+r*cell+3,2,2,'#ffe9a0');
  }
  const gl=.5+.5*Math.sin(time*1.3); gfx.globalAlpha=.12+.1*gl; rect(cx0,cy0,cw,ch,'#ffe9a0'); gfx.globalAlpha=1;
  rect(cx0,cy0+ch,cw,4,glGold);   // the cloth beam
  // the brass lens at the front of the Loom: where the Unwriting Ray comes from
  ellipse(cx,b-6,13,13,OUT); ellipse(cx,b-6,11,11,glGold); ellipse(cx,b-6,8,8,'#2a6a88'); ellipse(cx,b-6,6,6,'#7ad0e8'); ellipse(cx-2,b-8,2,2,'#ffffff');
}
drawObject=function(o,time) {
  if(o.kind==='glloom'&&glGround(currentMap)) return glLoom(o,time);
  return LE_drawObject_ch18(o,time);
};
drawLEBattleBg=function(t) {
  const r=LE_drawLEBattleBg_ch18(t);
  if(!glGround(currentMap)||currentMap.id!=='towerpinnacle') return r;
  // the Loom's gold threads hang in front of the glass, and the whole room is a little warmer
  const now=typeof elapsedTime==='number'?elapsedTime:0;
  for(let k=0;k<64;k++) { const tx=4+k*3,s=.5+.5*Math.sin(now*2+k*.6); gfx.globalAlpha=.18+.3*s; rect(tx,0,1,50+(hash(k,9)%10),k%6===0?'#fff6c8':'#e8b84a'); }
  gfx.globalAlpha=.1; rect(0,0,192,108,'#ffd36a'); gfx.globalAlpha=1;
  return r;
};
// The column of light where Tom stood: it climbs for a few seconds and thins out, with glints leaving it.
b7DrawMapFx=function(time) {
  LE_b7DrawMapFx_ch18(time);
  const L=typeof CH18FX!=='undefined'&&CH18FX.light; if(!L||currentMap.id!=='towerpinnacle') return;
  if(L.t0===null) L.t0=time;
  const u=Math.min(1,(time-L.t0)/3.2),cx=(L.x+.5)*T,by=(L.y+1)*T;
  gfx.save();
  gfx.globalAlpha=(1-u)*.55; rect(cx-14,by-60-u*160,28,60+u*160,'#ffe27a');
  gfx.globalAlpha=(1-u)*.9; rect(cx-5,by-90-u*200,10,90+u*200,'#fff6c8');
  for(let k=0;k<10;k++) { const v=((time*.6)+k*.1)%1; gfx.globalAlpha=(1-u)*(1-v); rect(cx-12+((k*37)%24),by-v*150,2,2,k%2?'#fff6c8':'#ffd36a'); }
  gfx.restore();
};
