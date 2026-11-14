'use strict';
// engine/scene-props.js: small drawn props a scene can put on a map (ch7build stage 2, 2026-11-14). Classic script, loaded after engine/block-break.js.
// Everything here is a STAND-IN drawn in code until Tom approves the painted pictures from the Art Library (group "Chapter 7"); each kind says which
// entry replaces it. A scene uses three steps (registered at the bottom):
//   {prop:'chart',kind:'strip',set:{map:'town',...fields}}   makes or changes a prop and shows it ({show:false} hides it)
//   {propTo:'chart',field:'u',to:1,time:1.4}                 eases one number field (the chart opening, the ball flying)
//   {prop:'chart',hide:true}  /  {propsClear:true}           hides one prop / removes them all (also done when a new game starts)
// Positions are map tiles (x,y of the tile; the figure's feet are at the bottom of the tile). Drawn from plateLive (engine/plate.js), under the people.
const SCENE_PROPS={};
const SPK={};   // kind -> draw(P,time)
function scenePropSet(id,kind,o) { const P=SCENE_PROPS[id]||(SCENE_PROPS[id]={id,kind:kind||'strip',show:false,u:1}); if(kind) P.kind=kind; Object.assign(P,o||{}); return P; }
function scenePropsClear() { for(const k of Object.keys(SCENE_PROPS)) delete SCENE_PROPS[k]; }
function scenePropsDraw(map,time) {
  for(const P of Object.values(SCENE_PROPS)) { if(!P.show||P.map!==map.id) continue; const d=SPK[P.kind]; if(d) { ctx.save(); d(P,time); ctx.restore(); } }
}
const spTile=(a)=>{ const p=position(a); return {x:p.x,y:p.y}; };

// A strip of paper laid between two tiles: Grace's chart. u=0 is rolled up (a thin tube), u=1 is open flat: six sheets taped end to end.
// Fields: x0,y0 (Grace's end) and x1 (the far end, same row), or follow:[actorA,actorB] to hold both ends on two people. Replaced by Library entries
// ch7-chart-rolled and ch7-chart-unrolled.
SPK.strip=(P)=>{
  let x0=P.x0,y0=P.y0,x1=P.x1;
  if(P.follow) { const a=sceneActorOrNull(P.follow[0]),b=sceneActorOrNull(P.follow[1]); if(a&&b) { const pa=spTile(a),pb=spTile(b); x0=pa.x+.5; y0=pa.y+.78; x1=pb.x+.5; } }
  const xa=Math.min(x0,x1)*T,xb=Math.max(x0,x1)*T,len=xb-xa,u=P.u,hh=(.1+1.5*u)*T,yc=y0*T+T*.2;
  if(len<4) return;
  const top=yc-hh/2;
  ctx.fillStyle='#20202a30'; ctx.fillRect(xa+3,top+hh,len,5);
  // paper
  ctx.fillStyle='#f6f0dc'; ctx.fillRect(xa,top,len,hh);
  ctx.strokeStyle='#b9ae8a'; ctx.lineWidth=1.5; ctx.strokeRect(xa,top,len,hh);
  if(u>.25) {
    ctx.save(); ctx.beginPath(); ctx.rect(xa,top,len,hh); ctx.clip(); ctx.globalAlpha=Math.min(1,(u-.25)/.5);
    const sheets=6,sw=len/sheets;
    // grid lines in pencil, and the check marks
    ctx.strokeStyle='#8aa0b8'; ctx.lineWidth=1;
    for(let i=1;i<7;i++) { const y=top+hh*i/7; ctx.beginPath(); ctx.moveTo(xa,y); ctx.lineTo(xb,y); ctx.stroke(); }
    for(let s=1;s<sheets;s++) { const x=xa+sw*s; ctx.strokeStyle='#8aa0b8'; ctx.beginPath(); ctx.moveTo(x,top); ctx.lineTo(x,top+hh); ctx.stroke();
      ctx.fillStyle='#e8d890c0'; ctx.fillRect(x-5,top,10,hh); }   // the tape between sheets
    ctx.fillStyle='#3b5a8a'; ctx.font='bold '+Math.max(9,T*.34)+'px "Trebuchet MS",system-ui,sans-serif'; ctx.textBaseline='middle';
    for(let r=0;r<6;r++) for(let c=0;c<6;c++) { if(c%2===0||r<3) ctx.fillText('✓',xa+sw*c+sw*.12+(r%3)*sw*.1,top+hh*(r+1.5)/7); }
    ctx.fillStyle='#b8341c'; ctx.font='bold '+Math.max(10,T*.4)+'px "Trebuchet MS",system-ui,sans-serif'; ctx.textBaseline='top'; ctx.fillText('GRACE’S CHART',xa+10,top+4);
    ctx.restore();
  } else {   // rolled: a tube with a spiral end
    ctx.fillStyle='#e6dcb8'; ctx.beginPath(); ctx.ellipse(xa,yc,hh*.5,hh*.5+2,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#b9ae8a'; ctx.stroke();
  }
};

// Rose rolled up inside the end of the chart: a paper tube with a tuft of hair on top and two shoes at the bottom. Replaced by ch7-rose-poses (rolled up).
SPK.roseroll=(P)=>{
  const cx=(P.x+.5)*T,b=(P.y+1)*T,w=T*.9,h=T*1.7;
  ctx.fillStyle='#20202a40'; ctx.beginPath(); ctx.ellipse(cx,b,w*.55,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f6f0dc'; ctx.fillRect(cx-w/2,b-h,w,h-8); ctx.strokeStyle='#b9ae8a'; ctx.lineWidth=1.5; ctx.strokeRect(cx-w/2,b-h,w,h-8);
  for(let i=1;i<4;i++) { ctx.strokeStyle='#d9ceaa'; ctx.beginPath(); ctx.moveTo(cx-w/2,b-h+i*(h-8)/4); ctx.lineTo(cx+w/2,b-h+i*(h-8)/4+3); ctx.stroke(); }
  ctx.fillStyle='#e6dcb8'; ctx.beginPath(); ctx.ellipse(cx,b-h,w/2,6,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#5a3a24'; ctx.beginPath(); ctx.arc(cx-5,b-h-4,7,Math.PI,0); ctx.arc(cx+6,b-h-3,6,Math.PI,0); ctx.fill();   // hair
  ctx.fillStyle='#e0527a'; ctx.fillRect(cx-w*.3-3,b-9,10,9); ctx.fillRect(cx+w*.3-7,b-9,10,9);   // shoes
};

// Nara's gold ball (a gold-painted tennis ball). Fields x,y (tile), z (height in tiles). Replaced by ch6-gold-ball.
SPK.ball=(P)=>{
  const cx=(P.x+.5)*T,gy=(P.y+.9)*T,r=T*.13,cy=gy-(P.z||0)*T-r;
  ctx.fillStyle='#20202a40'; ctx.beginPath(); ctx.ellipse(cx,gy,r*1.2,r*.45,0,0,Math.PI*2); ctx.fill();
  const g=ctx.createRadialGradient(cx-r*.3,cy-r*.3,1,cx,cy,r); g.addColorStop(0,'#fff0a0'); g.addColorStop(.6,'#e8b830'); g.addColorStop(1,'#a8781c');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
};

// Burnt flashbulbs in a row (Deedee's table). Fields x,y (tile of the first), n, gap (tiles), lit (how many are shown). Replaced by ch7-bulbs-six.
SPK.bulbs=(P)=>{
  for(let i=0;i<Math.min(P.n,P.lit==null?P.n:P.lit);i++) {
    const cx=(P.x+.5+i*(P.gap||.42))*T,gy=(P.y+.8)*T,r=T*.13;
    ctx.fillStyle='#20202a40'; ctx.beginPath(); ctx.ellipse(cx,gy,r*1.1,r*.4,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a7e86'; ctx.fillRect(cx-r*.55,gy-r*1.1,r*1.1,r*1.1);   // base
    ctx.fillStyle='#4a4038'; ctx.beginPath(); ctx.ellipse(cx,gy-r*1.9,r*.95,r*1.25,0,0,Math.PI*2); ctx.fill();   // burnt glass
    ctx.fillStyle='#ffffff30'; ctx.beginPath(); ctx.ellipse(cx-r*.3,gy-r*2.2,r*.25,r*.5,0,0,Math.PI*2); ctx.fill();
  }
};

// The chart laid over Deedee's dining table, with Boppy's plate of crisp half under it. Fields x,y (top-left tile), w,h (tiles). Replaced by ch7-chart-table.
SPK.charttable=(P)=>{
  const x=P.x*T,y=P.y*T,w=P.w*T,h=P.h*T;
  ctx.fillStyle='#20202a30'; ctx.fillRect(x+3,y+h,w,5);
  ctx.fillStyle='#f6f0dc'; ctx.fillRect(x,y,w,h); ctx.strokeStyle='#b9ae8a'; ctx.lineWidth=1.5; ctx.strokeRect(x,y,w,h);
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  ctx.strokeStyle='#8aa0b8'; ctx.lineWidth=1;
  for(let i=1;i<8;i++) { ctx.beginPath(); ctx.moveTo(x,y+h*i/8); ctx.lineTo(x+w,y+h*i/8); ctx.stroke(); }
  for(let i=1;i<7;i++) { ctx.beginPath(); ctx.moveTo(x+w*i/7,y); ctx.lineTo(x+w*i/7,y+h); ctx.stroke(); }
  ctx.fillStyle='#3b5a8a'; ctx.font='bold '+Math.max(8,T*.3)+'px "Trebuchet MS",system-ui,sans-serif'; ctx.textBaseline='middle';
  for(let r=0;r<6;r++) for(let c=0;c<6;c++) ctx.fillText('✓',x+w*(c+.25)/7,y+h*(r+1.5)/8);
  if(P.pencil) { ctx.fillStyle='#9a9a9a'; for(let c=0;c<6;c++) ctx.fillText('✓',x+w*(c+.25)/7,y+h*7.5/8); }   // row seven, in pencil
  ctx.fillStyle='#b8341c'; ctx.font='bold '+Math.max(9,T*.34)+'px "Trebuchet MS",system-ui,sans-serif'; ctx.textBaseline='top'; ctx.fillText('GRACE’S CHART',x+6,y+3);
  ctx.restore();
  if(P.crisp) { const px=x+w*.78,py=y+h*.86; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(px,py,T*.5,T*.28,0,0,Math.PI*2); ctx.fill();   // the crisp, half under the paper
    ctx.save(); ctx.beginPath(); ctx.rect(x+w*.7,y+h*.8,T*2,T); ctx.clip(); ctx.restore(); ctx.fillStyle='#b8782e'; ctx.beginPath(); ctx.ellipse(px+4,py,T*.34,T*.18,0,0,Math.PI*2); ctx.fill(); }
};

function sceneActorOrNull(a) { try { return sceneActor(a); } catch(e) { return null; } }
SCENE_OPS.prop=o=>S.call(()=>{ const id=o.prop; if(o.hide) { if(SCENE_PROPS[id]) SCENE_PROPS[id].show=false; return; } scenePropSet(id,o.kind,Object.assign({show:true},o.set||{})); });
SCENE_OPS.propTo=o=>({t:0,start(){ this.t=0; this.P=SCENE_PROPS[o.propTo]; this.a=this.P?this.P[o.field]:0; this.b=this.P?this.P[o.field]:0; if(this.P) this.a=this.P[o.field]==null?0:this.P[o.field]; this.arc=o.arc||0; },
  update(dt){ const P=this.P; if(!P) return true; this.t+=dt; const u=Math.min(1,this.t/(o.time||.8)),e=o.linear?u:ease(u); P[o.field]=this.a+(o.to-this.a)*e;
    if(o.zField) P[o.zField]=Math.sin(Math.PI*u)*this.arc; return u>=1; }});
SCENE_OPS.propsClear=o=>S.call(()=>scenePropsClear());

// {note:['MY MEET.','TATA COMES.'],time:2.6}: a paper close-up over the game for a few seconds (the corner of Grace's chart). A STAND-IN, replaced by
// Library entry ch7-chart-corner. Nobody speaks while it shows.
SCENE_OPS.note=o=>({t:0,start(){ this.t=0; const host=document.getElementById('game'); if(!host) return;
    const el=document.createElement('div'); el.id='scenenote';
    el.style.cssText='position:absolute;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(10,8,6,0);display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background .35s';
    const w=Math.round(Math.min(host.clientWidth*.8,host.clientHeight*.7,460));
    const card=document.createElement('div'); card.style.cssText='width:'+w+'px;height:'+Math.round(w*.62)+'px;background:#f6f0dc;border:3px solid #b9ae8a;box-shadow:0 8px 30px #000a;transform:rotate(-2deg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:'+Math.round(w*.03)+'px;font:bold '+Math.round(w*.095)+'px "Comic Sans MS","Marker Felt","Trebuchet MS",system-ui,sans-serif;color:#2a4a8a;letter-spacing:1px;opacity:0;transition:opacity .35s;background-image:repeating-linear-gradient(0deg,transparent 0 '+Math.round(w*.085)+'px,#8aa0b844 '+Math.round(w*.085)+'px '+Math.round(w*.09)+'px)';
    for(const line of o.note) { const d=document.createElement('div'); d.textContent=line; card.appendChild(d); }
    el.appendChild(card); host.appendChild(el); this.el=el; this.card=card;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.background='rgba(10,8,6,.55)'; card.style.opacity='1'; })); },
  update(dt){ this.t+=dt; const T0=o.time||2.6; if(this.t>=T0-.4&&this.el&&!this.off) { this.off=1; this.el.style.background='rgba(10,8,6,0)'; this.card.style.opacity='0'; }
    if(this.t>=T0) { if(this.el) this.el.remove(); return true; } return false; }});
