'use strict';
// engine/block-break.js: breaking an orange block (ch6build stage 2, 2026-11-14). The reusable work every chapter from 6 on ends with, built first on
// the Old Oak Park picnic table (claude/story-ch06.md scene 14, beats 3 to 12). Classic script, loaded after engine/amber-spots.js.
//
// What the player watches, in order (nobody speaks in any of it; the scene that calls it speaks before and after):
//   1. the coin rolls along the table groove (tick, tick, tick) and hops into the round hole, CLICK
//   2. coin close-up: the stamped coin sits exactly in the hole like the last piece of a puzzle
//   3. everything stops for one second
//   4. gold cracks spread out from the hole across the whole block
//   5. the block falls apart into pieces that fade before they land
//   6. a ring of colour runs out from the block across the whole map: the grey circle turns back to colour, and as the ring passes each monster
//      it shrinks back to an ordinary thing (squirrel, peanut shell, stick)
//   7. the area is free: its monsters are gone from the map, so nothing starts a fight there any more
//
// Use: {blockbreak:'oakpark'} as a scene step (waits until the colour has finished), or bbPlay(id,{onPhase,onDone}). A spot is a BB_SPOTS entry:
//   map    the map id the block is on
//   on     the flag that shows the block and the grey circle (the story sets it when the family first sees the block)
//   done   the flag the break sets: block and grey circle gone, monsters turned ordinary, encounters off (one flag per area)
//   grey   the grey circle {cx,cy,r} in plate art px (64 per tile). Until a Library picture of the grey area is approved it is a STAND-IN: the
//          plate itself, turned grey inside the circle (the same way as SUNDIAL_GREY in engine/plate.js)
//   block  the block picture and where it hangs: id (art/props/<id>.webp), centre x,y and width, all in plate art px; hole = where the round dent is
//          as shares of the picture; roll = [x,y] where the coin starts on the table and [x,y] of the table top under the hole
//   keep   what the block held and leaves behind: the basket stays on the table; the squirrel finishes its dive into it, pops out with a sandwich and
//          sits beside it (art/props/oakpark/agent_*.webp from the approved ch6-squirrel-ordinary sheet)
//   ordinary  monster id -> picture and width of what it turns back into
// The monsters (map.monsters) are taken off the map when the ring passes them and kept in BB.stash; a new game puts them back (bbSync).
const BB_SPOTS={
  oakpark:{map:'oakpark',on:'ch6-oak-block',done:'bb-oakpark',
    grey:{cx:330,cy:1010,r:330},
    block:{id:'oakpark/ch6_block',x:292,y:932,w:190,hole:[.51,.9],roll:[[120,1074],[292,1058]]},
    coin:{r:11},
    keep:{basket:{x:292,y:1052,w:84},dive:[302,920],diveW:58,sitW:46,sit:[356,1054]},   // what is left on the table: the basket, and the squirrel that was frozen in it (art px)
    ordinary:{acornagent:['oakpark/ord_squirrel',52],cheekstuffer:['oakpark/ord_cheeks',56],peanutgallery:['oakpark/ord_peanut',74],twigspy:['oakpark/ord_twig',74],chairman:['oakpark/ord_squirrel',60]}}
};
const BB_T={roll:2.4,close0:2.55,close1:4.45,still1:5.45,crack1:7.1,fall1:8.7,ringStart:8.7,shrink:.9,settle:.7,ringSpeed:330};
const BB={run:null,t:0,stash:{},decor:{},shards:{}};
const bbFlag=k=>typeof flag==='function'&&!!flag(k);
const bbClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const bbEase=u=>u*u*(3-2*u);
const bbHash=(a,b)=>{ let h=(a*374761393+b*668265263)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };

// ---------- the block's pieces: a Voronoi cut of the block's own picture (the cracks follow the same lines) ----------
function bbClip(poly,nx,ny,c) {   // keep the side where nx*x+ny*y <= c
  const out=[]; for(let i=0;i<poly.length;i++) { const a=poly[i],b=poly[(i+1)%poly.length],da=nx*a[0]+ny*a[1]-c,db=nx*b[0]+ny*b[1]-c;
    if(da<=0) out.push(a);
    if((da<0&&db>0)||(da>0&&db<0)) { const t=da/(da-db); out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]); } }
  return out;
}
function bbShards(spot) {
  const B=spot.block,w=B.w,h=B.w*1.23,n=17,seeds=[];
  for(let i=0;i<n;i++) seeds.push([(bbHash(i,3)-.5)*w*.92,(bbHash(i,7)-.5)*h*.92]);
  const hole=[(B.hole[0]-.5)*w,(B.hole[1]-.5)*h],cells=[];
  seeds.forEach((s,i)=>{ let poly=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
    seeds.forEach((q,j)=>{ if(i!==j&&poly.length) poly=bbClip(poly,q[0]-s[0],q[1]-s[1],(q[0]*q[0]+q[1]*q[1]-s[0]*s[0]-s[1]*s[1])/2); });
    if(poly.length<3) return;
    const cx=poly.reduce((a,p)=>a+p[0],0)/poly.length,cy=poly.reduce((a,p)=>a+p[1],0)/poly.length,dx=cx-hole[0],dy=cy-hole[1],d=Math.hypot(dx,dy)||1;
    cells.push({poly,cx,cy,vx:dx/d*(40+bbHash(i,11)*50),vy:dy/d*(30+bbHash(i,13)*40)-20,rot:(bbHash(i,17)-.5)*1.4,d}); });
  const maxD=Math.max(...cells.map(c=>c.d))+60,edges=[];
  for(const c of cells) for(let i=0;i<c.poly.length;i++) { const a=c.poly[i],b=c.poly[(i+1)%c.poly.length];
    if(Math.abs(a[0])>=w/2-.5&&Math.abs(b[0])>=w/2-.5||Math.abs(a[1])>=h/2-.5&&Math.abs(b[1])>=h/2-.5) continue;   // the block's own outline is not a crack
    edges.push({a,b,d:Math.hypot((a[0]+b[0])/2-hole[0],(a[1]+b[1])/2-hole[1])}); }
  return {cells,edges,maxD,hole,w,h};
}
const bbShardsFor=(id,spot)=>BB.shards[id]||(BB.shards[id]=bbShards(spot));

// ---------- sound ----------
const bbTone=o=>{ if(typeof tone==='function') tone(o); };
function bbTick() { bbTone({type:'square',f0:1900,f1:1500,dur:.04,vol:.1}); bbTone({type:'triangle',f0:1250,dur:.14,vol:.07,delay:.03}); }
function bbClick() { bbTone({type:'square',f0:1100,f1:520,dur:.07,vol:.26}); bbTone({type:'triangle',f0:2400,f1:1800,dur:.3,vol:.12,delay:.02}); if(typeof noise==='function') noise({dur:.08,vol:.16,f0:3000,f1:900,type:'highpass'}); }
function bbCrackSnd() { if(typeof noise==='function') noise({dur:.5,vol:.12,f0:4000,f1:1200,type:'highpass'}); bbTone({type:'sawtooth',f0:300,f1:90,dur:.45,vol:.08}); }
function bbShatterSnd() { if(typeof noise==='function') { noise({dur:.7,vol:.2,f0:2500,f1:300,type:'lowpass'}); noise({dur:.5,vol:.1,f0:6000,f1:2000,type:'highpass'}); } [1500,1900,2300,1700].forEach((f,i)=>bbTone({type:'triangle',f0:f,f1:f*.7,dur:.35,vol:.08,delay:i*.07})); }
function bbRingSnd() { if(typeof sfx!=='undefined'&&sfx.whoosh) sfx.whoosh(); [523,659,784,1047].forEach((f,i)=>bbTone({type:'triangle',f0:f,dur:.9,vol:.09,delay:i*.18})); }

// ---------- the coin close-up (auto: a panel over the game, no button) ----------
function bbCloseupOn(spot) {
  const host=document.getElementById('game'); if(!host) return;
  bbCloseupOff();
  const el=document.createElement('div'); el.id='bbclose';
  el.style.cssText='position:absolute;left:0;top:0;right:0;bottom:0;z-index:60;background:rgba(10,8,6,.0);display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background .35s';
  const d=Math.round(Math.min(host.clientWidth*.72,host.clientHeight*.46,420));
  const box=document.createElement('div'); box.style.cssText='position:relative;width:'+d+'px;height:'+d+'px';
  const sock=document.createElement('div'); sock.style.cssText='position:absolute;left:12%;top:12%;width:76%;height:76%;border-radius:50%;background:radial-gradient(circle at 50% 42%,#6a2c08 0%,#a24a0e 55%,#e8841c 78%,#ffb050 92%,#ffd890 100%);box-shadow:0 0 '+Math.round(d*.12)+'px rgba(255,170,60,.55),inset 0 '+Math.round(d*.04)+'px '+Math.round(d*.08)+'px rgba(0,0,0,.55)';
  const img=new Image(); img.src='art/closeup/ch6-coin.webp?v=ch6s2a'; img.alt='';
  img.style.cssText='position:absolute;left:19%;top:19%;width:62%;height:62%;transform:translate(60%,-52%) rotate(24deg) scale(1.55);opacity:0;transition:transform 1.15s cubic-bezier(.3,.9,.3,1.05),opacity .3s';
  box.appendChild(sock); box.appendChild(img); el.appendChild(box); host.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.background='rgba(10,8,6,.62)'; img.style.opacity='1'; setTimeout(()=>{ img.style.transform='translate(0,0) rotate(0deg) scale(1)'; },260); }));
  BB.close=el;
}
function bbCloseupOff() { const e=BB.close||document.getElementById('bbclose'); if(e) { e.style.background='rgba(0,0,0,0)'; const x=e; setTimeout(()=>x.remove(),380); } BB.close=null; }

// ---------- drawing (called from plateLive in engine/plate.js, in plate art px: 64 per tile, scale s=T/64) ----------
function bbOrdinaryDraw(map,s) {
  const L=BB.decor[map.id]; if(!L) return;
  for(const d of L.values()) { if(!PROPART.ready(d.id)) continue;
    const im=PROPART.get(d.id),h=d.w*im.naturalHeight/im.naturalWidth,a=bbClamp((BB.t-d.t0)/.5,0,1);
    ctx.save(); ctx.globalAlpha=d.fade?a:1; ellipse(d.x*s,d.base*s,d.w*.42*s,5*s,'#20202a38'); ctx.restore();
    ctx.save(); ctx.globalAlpha=d.fade?a:1; PROPART.draw(d.id,d.x*s,(d.base-h/2)*s,{w:d.w*s}); ctx.restore();
    if(d.fade&&BB.t-d.t0<.45) { const u=(BB.t-d.t0)/.45; ctx.save(); ctx.globalAlpha=(1-u)*.7; ellipse(d.x*s,(d.base-h*.45)*s,(h*.55+u*h*.5)*s,(h*.45+u*h*.4)*s,'#fff8e0'); ctx.restore(); } }
}
// What the block held, left behind on the table.
function bbBasket(k,s) {
  const b=k.basket,id='oakpark/ch6_basket';
  if(!PROPART.ready(id)) return;
  { const im=PROPART.get(id),h=b.w*im.naturalHeight/im.naturalWidth; PROPART.draw(id,b.x*s,(b.y-h/2)*s,{w:b.w*s}); }
}
function bbKeepDraw(sp,t,s) {   // t < 0: the break is over and stays over
  const k=sp.keep; if(!k) return; const b=k.basket,F=BB_T.crack1,P=F+1.0,Q=P+.8;
  bbBasket(k,s);
  const frame=(id,w,x,y,rot)=>{ if(!PROPART.ready(id)) return; const im=PROPART.get(id),h=w*im.naturalHeight/im.naturalWidth; ctx.save(); ctx.translate(x*s,(y-h/2)*s); if(rot) ctx.rotate(rot); PROPART.draw(id,0,0,{w:w*s}); ctx.restore(); return h; };
  const top=b.y-b.w*.5;
  if(t>=0&&t<F) return;
  if(t>=0&&t<P) { const u=(t-F)/(P-F),x=k.dive[0]+(b.x-k.dive[0])*u*u,y=k.dive[1]+(top-18-k.dive[1])*u-Math.sin(u*Math.PI)*12*(1-u); frame('oakpark/agent_dive',k.diveW,x,y,(u-.4)*.5); return; }
  let u=t<0?1:bbClamp((t-P)/(Q-P),0,1);   // pops out of the basket with a sandwich and sits beside it
  const x=b.x+(k.sit[0]-b.x)*bbEase(u),by=top+8+(k.sit[1]-top-8)*bbEase(u)-Math.sin(u*Math.PI)*26;
  const im=PROPART.get('oakpark/agent_sandwich'); if(!PROPART.ready('oakpark/agent_sandwich')) return;
  const h=k.sitW*im.naturalHeight/im.naturalWidth; if(u>=1) ellipse(x*s,(k.sit[1]+1)*s,k.sitW*.38*s,4*s,'#20202a38');
  frame('oakpark/agent_sandwich',k.sitW,x,by+(u<1?0:0),0);
}
function bbDraw(map) {
  const s=T/64;
  bbOrdinaryDraw(map,s);
  for(const id in BB_SPOTS) {
    const sp=BB_SPOTS[id]; if(sp.map!==map.id) continue;
    const run=BB.run&&BB.run.id===id?BB.run:null;
    if(!run&&bbFlag(sp.done)) { bbKeepDraw(sp,-1,s); continue; }
    if(!run&&!bbFlag(sp.on)) continue;
    const t=run?BB.t:-1,B=sp.block,G=sp.grey,sh=bbShardsFor(id,sp);
    const ringR=run&&t>=BB_T.ringStart?(t-BB_T.ringStart)*BB_T.ringSpeed:-1;
    // the grey circle (a stand-in: the plate turned grey), and the colour coming back from the block outward
    const pl=typeof plateFor==='function'?plateFor(map):null,gc=pl&&pl.img&&pl.img.naturalWidth&&typeof sundialGreyCanvas==='function'?sundialGreyCanvas(pl.img):null;
    if(gc&&!(ringR>=G.r+B.w)) { const k=map.w*T/gc.width; ctx.save(); ctx.beginPath(); ctx.arc(G.cx*s,G.cy*s,G.r*s,0,Math.PI*2);
      if(ringR>0) { ctx.moveTo((B.x+ringR)*s,B.y*s); ctx.arc(B.x*s,B.y*s,ringR*s,0,Math.PI*2,true); }
      ctx.clip('evenodd'); ctx.imageSmoothingEnabled=true; ctx.drawImage(gc,0,0,gc.width*k,gc.height*k); ctx.imageSmoothingEnabled=false; ctx.restore(); }
    // the block: whole, then cracked, then in pieces
    const img=PROPART.ready(B.id)?PROPART.get(B.id):null,bh=sh.h;
    if(img&&t<BB_T.fall1+.05) {
      const falling=t>=BB_T.crack1;
      if(!falling) {
        ellipse(B.x*s,(B.y+bh/2+4)*s,B.w*.55*s,9*s,'#20202a40');
        ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(img,(B.x-B.w/2)*s,(B.y-bh/2)*s,B.w*s,bh*s); ctx.restore();
      }
      // gold cracks growing out of the hole
      if(t>=BB_T.still1-.05&&!falling) {
        const p=bbClamp((t-BB_T.still1)/(BB_T.crack1-BB_T.still1),0,1),reach=p*sh.maxD;
        ctx.save(); ctx.translate(B.x*s,B.y*s); ctx.scale(s,s); ctx.lineCap='round'; ctx.globalCompositeOperation='lighter';
        for(const e of sh.edges) { if(e.d>reach) continue; const a=bbClamp((reach-e.d)/50,0,1);
          ctx.strokeStyle='rgba(255,170,40,'+(.5*a)+')'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(e.a[0],e.a[1]); ctx.lineTo(e.b[0],e.b[1]); ctx.stroke();
          ctx.strokeStyle='rgba(255,236,150,'+a+')'; ctx.lineWidth=1.8; ctx.stroke(); }
        ctx.globalCompositeOperation='source-over'; ctx.restore(); }
      if(falling) {
        const u=bbClamp((t-BB_T.crack1)/(BB_T.fall1-BB_T.crack1),0,1);
        ctx.save(); ctx.translate(B.x*s,B.y*s); ctx.scale(s,s); ctx.imageSmoothingEnabled=true;
        for(const c of sh.cells) { const e=u*u,dx=c.vx*u*1.6,dy=c.vy*u*1.6+170*e,al=bbClamp(1-Math.pow(u,1.6),0,1);   // the pieces fade before they land
          ctx.save(); ctx.globalAlpha=al; ctx.translate(c.cx+dx,c.cy+dy); ctx.rotate(c.rot*u); ctx.translate(-c.cx,-c.cy);
          ctx.beginPath(); c.poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.clip();
          ctx.drawImage(img,-B.w/2,-bh/2,B.w,bh);
          ctx.strokeStyle='rgba(255,220,110,.9)'; ctx.lineWidth=2; ctx.stroke(); ctx.restore(); }
        ctx.restore();
        ctx.save(); ctx.globalAlpha=bbClamp(1-u*1.4,0,1)*.6; ellipse(B.x*s,(B.y+bh/2)*s,B.w*.5*s*(1+u),10*s,'#fff2c0'); ctx.restore(); }
    }
    if(run&&t>=BB_T.crack1) bbKeepDraw(sp,t,s);   // the basket and the squirrel that was in it, from the moment the block falls apart
    // the coin rolling along the groove and hopping into the hole
    if(run&&t<BB_T.roll) {
      const [x0,y0]=B.roll[0],[x1,y1]=B.roll[1],hx=B.x+(B.hole[0]-.5)*B.w,hy=B.y+(B.hole[1]-.5)*bh,tr=BB_T.roll-.32,r=sp.coin.r;
      let x,y,sq,sc=1;
      if(t<tr) { const u=t/tr,e=u*(2-u*.4)/1.6; x=x0+(x1-x0)*e; y=y0+(y1-y0)*e; sq=.18+.82*Math.abs(Math.cos(e*Math.PI*7)); }
      else { const u=(t-tr)/(BB_T.roll-tr),e=bbEase(u); x=x1+(hx-x1)*e; y=y1+(hy-y1)*e-Math.sin(u*Math.PI)*16; sq=.45+.55*u; sc=1-.35*u; }
      ellipse(x*s,(y1+r*.9)*s,r*.9*s,3.5*s,'#20202a40');
      ctx.save(); ctx.translate(x*s,y*s); ctx.scale(sq*sc,sc); const g=ctx.createRadialGradient(-r*.3*s,-r*.3*s,1,0,0,r*s);
      g.addColorStop(0,'#fff2a8'); g.addColorStop(.6,'#f0b830'); g.addColorStop(1,'#a8721a'); ctx.fillStyle=g; ctx.strokeStyle='#6a4410'; ctx.lineWidth=1.5*s;
      ctx.beginPath(); ctx.arc(0,0,r*s,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
    // the flash at the click
    if(run&&t>=BB_T.roll&&t<BB_T.roll+.5) { const u=(t-BB_T.roll)/.5,hx=B.x+(B.hole[0]-.5)*B.w,hy=B.y+(B.hole[1]-.5)*bh;
      ctx.save(); ctx.globalCompositeOperation='lighter'; const g=ctx.createRadialGradient(hx*s,hy*s,0,hx*s,hy*s,(14+u*50)*s);
      g.addColorStop(0,'rgba(255,255,220,'+(1-u)+')'); g.addColorStop(1,'rgba(255,190,60,0)'); ctx.fillStyle=g; ctx.fillRect((hx-80)*s,(hy-80)*s,160*s,160*s); ctx.restore(); }
    // the ring of colour: a bright edge running out across the whole map
    if(ringR>0) { const far=sh.maxD+Math.hypot(map.w*64,map.h*64),a=bbClamp(1-ringR/(far*.9),0,1)*.9+.1;
      ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
      ctx.strokeStyle='rgba(255,230,140,'+(.22*a)+')'; ctx.lineWidth=46*s; ctx.beginPath(); ctx.arc(B.x*s,B.y*s,ringR*s,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(255,252,220,'+(.85*a)+')'; ctx.lineWidth=7*s; ctx.stroke(); ctx.restore(); }
  }
}

// ---------- the sequence ----------
function bbPlay(id,opts={}) {
  const sp=BB_SPOTS[id]; if(!sp||BB.run) { if(opts.onDone) opts.onDone(); return false; }
  const sh=bbShardsFor(id,sp),map=typeof currentMap!=='undefined'?currentMap:null;
  if(!map||map.id!==sp.map) { if(opts.onDone) opts.onDone(); return false; }
  const far=Math.hypot(map.w*64,map.h*64)+sp.block.w;
  PROPART.preload(['oakpark/agent_dive','oakpark/agent_sandwich','oakpark/ch6_basket',sp.block.id,...Object.values(sp.ordinary).map(v=>v[0])]);
  BB.t=0; BB.run={id,spot:sp,opts,seen:{},end:BB_T.ringStart+far/BB_T.ringSpeed+BB_T.settle,far,tick:0};
  return true;
}
function bbPhase(name) { const r=BB.run; if(!r||r.seen[name]) return; r.seen[name]=true; if(r.opts.onPhase) r.opts.onPhase(name); }
// A monster passed by the ring shrinks about its feet; when it is small it is taken off the map and an ordinary thing stands where it was.
function bbMonsters(r) {
  const sp=r.spot,map=currentMap,B=sp.block,ringR=(BB.t-BB_T.ringStart)*BB_T.ringSpeed,hy=B.y;
  for(const n of map.npcs.slice()) {
    if(!n.monster||!sp.ordinary[n.monster]) continue;
    const d=Math.hypot((n.x+.5)*64-B.x,(n.y+1)*64-hy);
    if(n.bbT0==null&&ringR>=d) { n.bbT0=BB.t; n.bbShrink=1; }
    if(n.bbT0==null) continue;
    const u=bbClamp((BB.t-n.bbT0)/BB_T.shrink,0,1); n.bbShrink=1-bbEase(u)*.8;
    if(u>=1) bbFree(map,n,sp,true);
  }
}
function bbFree(map,n,sp,fade) {
  const [pic,w]=sp.ordinary[n.monster],L=BB.decor[map.id]||(BB.decor[map.id]=new Map());
  L.set(n.spot||n.name,{id:pic,w,x:(n.x+.5)*64,base:(n.y+1)*64-6,t0:BB.t,fade:!!fade});
  const i=map.npcs.indexOf(n); if(i>=0) map.npcs.splice(i,1);
  (BB.stash[map.id]=BB.stash[map.id]||[]).push(n); n.bbShrink=null; n.bbT0=null;
}
// Every frame: run the sequence, and keep the freed areas freed (a loaded save has the flag but a fresh map) or restored (a new game has no flag).
function bbSync(dt) {
  if(typeof currentMap==='undefined'||!currentMap||typeof flag!=='function'||typeof STORY==='undefined') return;
  const r=BB.run;
  if(r) {
    BB.t+=Math.min(dt||0,.1); const t=BB.t,sp=r.spot;
    if(t>=0) bbPhase('roll');
    if(!r.seen.tick) { const tr=BB_T.roll-.32; const k=Math.floor(Math.min(t,tr)/tr*7*2); while(r.tick<k) { r.tick++; bbTick(); } }
    if(t>=BB_T.roll) { if(!r.seen.click) { bbClick(); } bbPhase('click'); }
    if(t>=BB_T.close0&&!r.seen.close) { bbCloseupOn(sp); bbPhase('close'); }
    if(t>=BB_T.close1&&!r.seen.closeOff) { bbCloseupOff(); r.seen.closeOff=true; bbPhase('still'); }
    if(t>=BB_T.still1&&!r.seen.crack) { bbCrackSnd(); bbPhase('crack'); }
    if(t>=BB_T.crack1&&!r.seen.fall) { bbShatterSnd(); bbPhase('fall'); }
    if(t>=BB_T.ringStart&&!r.seen.ring) { bbRingSnd(); bbPhase('ring'); }
    if(t>=BB_T.ringStart) bbMonsters(r);
    if(t>=r.end) { BB.run=null; for(const n of currentMap.npcs.slice()) if(n.monster&&sp.ordinary[n.monster]) bbFree(currentMap,n,sp,false);
      setFlag(sp.done); bbCloseupOff(); if(r.opts.onPhase) r.opts.onPhase('done'); if(r.opts.onDone) r.opts.onDone(); }
    return;
  }
  for(const id in BB_SPOTS) { const sp=BB_SPOTS[id]; if(sp.map!==currentMap.id) continue;
    if(bbFlag(sp.done)) { for(const n of currentMap.npcs.slice()) if(n.monster&&sp.ordinary[n.monster]) bbFree(currentMap,n,sp,false); }
    else { const st=BB.stash[sp.map]; if(st&&st.length) { for(const n of st) currentMap.npcs.push(n); BB.stash[sp.map]=[]; BB.decor[sp.map]=null; } } }
}
const LE_update_bb=update;
update=function(dt) { bbSync(dt); return LE_update_bb.apply(this,arguments); };
// Draw: a monster the ring has passed is scaled down about its feet.
const LE_drawActor_bb=drawActor;
drawActor=function(a) {
  if(a&&a.monster&&a.bbShrink!=null&&a.bbShrink<1) { const p=position(a),cx=Math.round((p.x+.5)*T),base=Math.round((p.y+1)*T-2),k=a.bbShrink;
    gfx.save(); gfx.translate(cx,base); gfx.scale(k,k); gfx.translate(-cx,-base); try { LE_drawActor_bb.apply(this,arguments); } finally { gfx.restore(); } return; }
  return LE_drawActor_bb.apply(this,arguments);
};
// Scene step {blockbreak:'oakpark',onPhase:fn}: plays the whole sequence and waits for it.
SCENE_OPS.blockbreak=o=>lazy(()=>{ let fin=false; return {start(){ if(!bbPlay(o.blockbreak,{onPhase:o.onPhase,onDone:()=>{ fin=true; }})) fin=true; },update(){ return fin; }}; });

// ---------- ADMIN > BLOCK BREAK LAB: Old Oak Park on the day of the discovery, the break plays by itself, then Tom can walk the freed park ----------
function bbLabStart() {
  endIntro(); resetStory('full',6);
  const st=chselStateBefore(6); Object.assign(STORY.flags,st.flags);
  for(const f of ['ch6-nara','ch6-park','ch6-play','ch6-garden','ch6-picnic','ch6-oak-block']) setFlag(f);
  b6Prep(CHSEL_LEVEL[6]||7);
  for(const m of extras()) recruitLeave(m,true);
  if(typeof girlsAway==='function'&&!girlsAway()) setGirlsAway(true);
  forceJoin(tnb,true); forceJoin(nara,true);
  currentMap=worlds.oakpark; player.x=6; player.y=17; player.facing='left'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true;
  playScene([{wait:1.2},{cam:[4.5,15.2]},{zoom:1.5,time:.8},{wait:.4},{blockbreak:'oakpark'},{wait:.8},{cam:null},{zoom:1,time:.8},
    {toast:'Old Oak Park is free. Walk around: no monsters, no fights. Admin > Block Break Lab plays it again.',time:6}],{fade:.7});
}
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{bbPlay,bbLabStart,BB,BB_SPOTS}); });
