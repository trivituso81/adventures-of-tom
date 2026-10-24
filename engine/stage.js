'use strict';
// engine/stage.js: choreography helpers for the Option 3 set pieces (phase 4 on). Loaded after engine/recruit-fx.js,
// before the move files. Everything here works in real canvas coordinates (576 x 324):
//   RFX.ST.play(E2,[[ms,fn|'message'],...,['hf',ms],[ms,'end','last message']])  a move as an absolute timeline
//   RFX.ST.keys(fx,K)   the actor's body as keyframes in ms: {t,x,y,f,rot,hop,hn,sc,hide,ns}; x/y 'home' = own spot
//   RFX.ST.foe(f), RFX.ST.unit(u)  where a monster or party member stands; RFX.ST.unwarp(x,y) cancels the aim warp
//   RFX.ST.fly(draw,x0,y0,x1,y1,dur,arc,delay)  any drawn object along an arc (never warped)
// Scenes whose names start with a prefix passed to RFX.ST.nw() are drawn without the aim warp (registered at play
// time: B2_NOWARP loads after the move files).
(function(){
const SC=RFX.SC,{scene}=RFX;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const ST=RFX.ST={};
const prefixes=new Set(['st_']);
ST.nw=p=>prefixes.add(p);
function regNoWarp() { if(typeof B2_NOWARP==='undefined') return; for(const k in SC) for(const p of prefixes) if(k.startsWith(p)) B2_NOWARP.add(k); }
// Where a monster stands (real coordinates): middle x, feet y (base), width, height, top, middle y.
ST.foe=f=>{ const p=b2FoeCanvasPos(f); return {x:p.x,base:p.y,w:p.w,h:p.h,top:p.y-p.h,mid:p.y-p.h*.5}; };
// Where any unit stands: party members at their battle spot, monsters at theirs.
ST.unit=u=>{ if(!u) return {x:288,base:260,w:60,h:90,top:170,mid:215};
  if(u.side==='foe') return ST.foe(u);
  const q=BATTLE_POS[u.idx]||{x:150,base:90},sp=BATTLE_SPRITES[u.id],h=sp?sp.idle.length*sp.scale:90,w=sp?sp.idle[0].length*sp.scale:60;
  return {x:q.x*3,base:q.base*3,w,h,top:q.base*3-h,mid:q.base*3-h*.5}; };
// The middle of a group of monsters, plus the box around them.
ST.group=list=>{ const P=(list||[]).map(f=>ST.foe(f)); if(!P.length) return {x:168,base:264,x0:120,x1:216,top:180,w:96};
  const x0=Math.min(...P.map(p=>p.x-p.w/2)),x1=Math.max(...P.map(p=>p.x+p.w/2));
  return {x:(x0+x1)/2,base:Math.max(...P.map(p=>p.base)),x0,x1,top:Math.min(...P.map(p=>p.top)),w:x1-x0,list:P}; };
// The body is drawn through the aim warp; this finds the drawn point that lands on real (X,Y).
ST.unwarp=(X,Y)=>{ const A=typeof B2!=='undefined'&&B2.aim; if(!A) return [X,Y];
  let x=(X-A.dx*A.xp/A.L)/(1-A.dx/A.L),w=(A.xp-x)/A.L;
  if(w>1) { w=1; x=X-A.dx; } else if(w<0) { w=0; x=X; }
  return [x,Y-A.dy*w]; };
// Frames: a sprite key, 'run' (left-facing run cycle), 'runR' (right-facing), 'walk'/'walkR' (slower), or a function.
function frameOf(sp,f,u,t) {
  if(typeof f==='function') f=f(u,t);
  if(!f) return null;
  if(f==='run') return sp.run?sp.run[Math.floor(t*12)%2]:sp.idle;
  if(f==='runR') return sp.runFlip?sp.runFlip[Math.floor(t*12)%2]:sp.flip;
  if(f==='walk') return sp.run?sp.run[Math.floor(t*7)%2]:sp.idle;
  if(f==='walkR') return sp.runFlip?sp.runFlip[Math.floor(t*7)%2]:sp.flip;
  return sp[f]||sp.idle;
}
// Keyframed body path. K: [{t:ms, x, y, f, rot, hop, hn, dx, dy, sc, hide, ns, ease}] (dx/dy/rot/sc: may be (u,t)=>n), times from when keys() is called.
// x/y may be numbers, 'home', or functions (c)=>number. A segment uses the frame/rot/hop of the key that starts it.
// Returns a state object; st.x/st.y always hold the body's real position (scenes can follow it).
ST.keys=(fx,K)=>{
  const dur=K[K.length-1].t/1000,st={x:null,y:null,frame:null,fx};
  ST.cur=st;
  const val=(k,n,c)=>{ const v=k[n]; return v==='home'?(n==='x'?c.origX:c.origBase):(typeof v==='function'?v(c):v); };
  for(let i=1;i<K.length;i++) { if(K[i].x==null) K[i].x=K[i-1].x; if(K[i].y==null) K[i].y=K[i-1].y; }
  fx.path={t:0,dur,st:true,fn:(q,c)=>{
    const ms=q*dur*1000; let i=0; while(i<K.length-2&&ms>K[i+1].t) i++;
    const a=K[i],b=K[i+1]||a,span=Math.max(1,b.t-a.t),u=cl((ms-a.t)/span),e=a.ease==='lin'?u:(a.ease==='in'?u*u:(a.ease==='out'?1-(1-u)*(1-u):ez(u)));
    let x=lerp(val(a,'x',c)??c.origX,val(b,'x',c)??c.origX,e),y=lerp(val(a,'y',c)??c.origBase,val(b,'y',c)??c.origBase,e);
    if(a.hop) y-=Math.abs(Math.sin(u*Math.PI*(a.hn||1)))*a.hop;
    if(a.dx) x+=typeof a.dx==='function'?a.dx(u,c.t):a.dx;
    if(a.dy) y+=typeof a.dy==='function'?a.dy(u,c.t):a.dy;
    st.x=x; st.y=y; st.u=u; st.seg=i;
    const fr=frameOf(c.sp,a.f,u,c.t),rot=typeof a.rot==='function'?a.rot(u,c.t):(a.rot||0);
    const sc=typeof a.sc==='function'?a.sc(u,c.t):a.sc;
    st.frame=fr||c.sp.idle; st.sp=c.sp; st.sc=sc||1;
    const [wx,wy]=ST.unwarp(x,y);
    return {cx:wx,base:wy,frame:fr,rot,sc,hide:a.hide,noShadow:a.ns};
  }};
  return st;
};
// The actor's hand (real coordinates) while a keys() path runs; the drawn hand point otherwise.
// (The body is drawn rotated/scaled on a path, which skips the usual hand bookkeeping in battle-draw.js.)
ST.hand=(dx=0,dy=0)=>{ const st=ST.cur;
  if(st&&st.fx&&st.fx.path&&st.sp&&st.x!=null) { const fr=st.frame,sp=st.sp,h=sp.handAt&&sp.handAt.get(fr),sc=sp.scale*(st.sc||1),w=fr[0].length*sc,H=fr.length*sc;
    if(h) return {x:st.x-w/2+h.n[0]*sc+dx,y:st.y-H+h.n[1]*sc+dy}; return {x:st.x-w*.3+dx,y:st.y-H*.55+dy}; }
  const a=battle.actorHand; if(a) return {x:a.n[0]+dx,y:a.n[1]+dy}; const p=battle.actorPos||{cx:500,base:300,h:100}; return {x:p.cx-22+dx,y:p.base-p.h*.55+dy}; };
// A move as an absolute timeline in ms (1x speed). ['hf',ms] marks the impact: the High-Five window ends there.
// [ms,'end',msg] (msg may be a function) shows the closing message, then ends the move (checkEnemy) 800 ms later.
ST.play=(E2,list)=>{
  regNoWarp();
  const steps=[]; let now=0;
  const items=list.filter(x=>x[0]!=='hf').sort((a,b)=>a[0]-b[0]);
  const hf=list.find(x=>x[0]==='hf');
  if(hf&&typeof B7!=='undefined'&&B7.hfWin&&B7.hfWin.M===B2.move) { const W=B7.hfWin; W.open=Math.max(.2,hf[1]/1000-.55); W.close=W.open+B7_HF.len*B7.speed; }
  for(const it of items) {
    const [ms,a,b]=it; if(ms>now) { steps.push(ms-now); now=ms; }
    if(a==='end') { steps.push(()=>setMessage(typeof b==='function'?b():b)); steps.push(800); steps.push(()=>checkEnemy()); continue; }
    steps.push(typeof a==='string'?()=>setMessage(a):a);
  }
  enqueue(...steps);
};
// Any object along an arc, drawn without the warp. draw(x,y,u,s) is called each frame; s.spin rotates it.
SC.st_fly=(s,u)=>{ const e=s.ease==='lin'?u:ez(u),x=lerp(s.x0,s.x1,e),y=lerp(s.y0,s.y1,e)-Math.sin(u*Math.PI)*(s.arc||0);
  gfx.save(); gfx.translate(x,y); if(s.spin) gfx.rotate(u*Math.PI*2*s.spin); s.draw(0,0,u,s); gfx.restore(); };
ST.fly=(draw,x0,y0,x1,y1,dur,arc=40,delay=0,extra={})=>scene('st_fly',dur,Object.assign({draw,x0,y0,x1,y1,arc,delay},extra));
// A drawn thing that stays put for a while: draw(s,u) each frame (for props that follow a state object).
SC.st_draw=(s,u)=>{ s.draw(s,u); };
ST.draw=(draw,dur,extra={})=>scene('st_draw',dur,Object.assign({draw},extra));
// Hit one monster: shake and flash it.
ST.jolt=(f,k=.35)=>{ if(f&&f.side==='foe') { f.shake=Math.max(f.shake||0,k); f.flash=Math.max(f.flash||0,.18); } };
})();
