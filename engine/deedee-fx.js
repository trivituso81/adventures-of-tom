// Deedee's painted objects and effects (art/props/deedee/*.webp, cut from her approved fx sheets by tools/sprite-bake/bake_deedee_fx.py).
// Classic script. Load after engine/prop-art.js and before engine/deedee-moves.js. Every helper returns false until the picture has
// loaded, so the move code can fall through to what it drew before (same convention as PROPART).
const DFX=(()=>{
  const P=(s,x,y,o)=>PROPART.draw('deedee/'+s,x,y,o);
  const A=a=>{ const g=gfx.globalAlpha; gfx.globalAlpha=g*a; return g; };
  // warm round glow (also the soft halo behind a moon); rx, ry in stage units, a = strength 0..1
  const glow=(x,y,rx,ry,a)=>{ const g=A(a); const ok=P('warm_glow',x,y,{w:rx*2.6,h:ry*2.6}); gfx.globalAlpha=g; return ok; };
  const heart=(x,y,r,rot)=>P('heart_big',x,y,{h:r*2.4,rot:rot||0});
  const spark=(x,y,r,a)=>{ const g=A(a==null?1:a); const ok=P('sparkle_cluster',x,y,{h:r*2}); gfx.globalAlpha=g; return ok; };
  // n curls of steam rising from (x,y); t = seconds, h = rise in stage units
  const steam=(x,y,t,n,h,slug)=>{ let ok=false; const g0=gfx.globalAlpha; for(let k=0;k<n;k++) { const q=(t*.9+k*.31)%1; gfx.globalAlpha=g0*Math.sin(q*Math.PI)*.9; ok=P(slug||'steam_curl',x+(k-(n-1)/2)*(h*.28)+Math.sin(q*5+k)*3,y-q*h,{h:h*.55*(.7+q*.5)})||ok; } gfx.globalAlpha=g0; return ok; };
  // a burst that pops in and fades over u 0..1
  const burst=(slug,x,y,h,u,rot)=>{ const pop=u<.18?u/.18*1.25:1.25-.25*Math.min(1,(u-.18)/.2); const g=A(u>.55?(1-u)/.45:1); const ok=P(slug,x,y,{h:h*pop,rot:rot||0}); gfx.globalAlpha=g; return ok; };
  return {P,glow,heart,spark,steam,burst};
})();
