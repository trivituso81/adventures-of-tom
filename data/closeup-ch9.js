'use strict';
// Chapter 9 close-up: the moonbeam reaches the Dome lock (Tom 2026-11-12; plan claude/closeup-plan.md Row 5; engine/closeup.js WATCH mode).
// Art: art/closeup/ch9-lock.webp (Art Library closeup-ch9-lock, baked by tools/art-library/bake_closeup_ch9.py). The beam, glow and turn are drawn in code.
// Scene op {closeupWatch:'ch9'} runs at the start of SCENES.ch9Door. Timeline (s): 0 to 2.2 the beam bounces in, 2.0 to 3.0 the lock fills with light,
// 3.0 to 4.3 the moon disc turns, 4.0 end flash, 4.6 end.
const CH9_LOCK={x:.5,y:.48,r:.37};
const CH9_PATH=[[-.02,.04],[.86,.14],[.12,.36],[.5,.5]];   // the beam: in from the corner, off three mirrors, onto the keyhole
const CH9_DUR=4.6;
{
const ease=x=>x<0?0:x>1?1:x*x*(3-2*x), seg=(t,a,b)=>(t-a)/(b-a);
CLOSEUP_DEFS.ch9={
  id:'ch9', ready:true, v:'closeup7', bg:'art/closeup/ch9-lock.webp', dur:CH9_DUR,
  startLabel:'A  LET IT IN', startCaption:'MEMBERS ARE ADMITTED BY MOONLIGHT.', endCaption:'THE MOON LOCK TURNS', skipLabel:'A  SKIP',
  cues:[{at:.1,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.whoosh) sfx.whoosh(); }},{at:2.2,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.charge) sfx.charge(); }},{at:3.2,fn:()=>closeupTick()},{at:4.0,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.ding) sfx.ding(); }}],
  build(plate) {
    const dark=cuEl('div','cu-w',plate); dark.style.cssText+='inset:0;left:0;top:0;width:100%;height:100%;background:#050b22;';
    const disc=cuEl('div','cu-w',plate); disc.style.borderRadius='50%'; disc.style.backgroundImage='url('+cuSrc(CLOSEUP_DEFS.ch9,CLOSEUP_DEFS.ch9.bg)+')';
    const glow=cuEl('div','cu-w',plate); glow.style.borderRadius='50%'; glow.style.mixBlendMode='screen'; glow.style.background='radial-gradient(circle,#ffffffee 0,#cfe3ffaa 30%,#8fb4ff00 70%)';
    const svg=cuEl('div','cu-w',plate); svg.style.cssText+='left:0;top:0;width:100%;height:100%;mix-blend-mode:screen;';
    svg.innerHTML='<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible"><polyline points="'+CH9_PATH.map(p=>(p[0]*100)+','+(p[1]*100)).join(' ')+'" fill="none" stroke="#e8f1ff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1.01" stroke-dashoffset="1" style="filter:drop-shadow(0 0 1.6px #9fc4ff) drop-shadow(0 0 3.5px #6f9cff)"/></svg>';
    const flash=cuEl('div','cu-w',plate); flash.style.cssText+='left:0;top:0;width:100%;height:100%;background:#fff;mix-blend-mode:screen;';
    return {dark,disc,glow,svg,flash,line:svg.querySelector('polyline')};
  },
  frame(t,S,st) {
    const L=CH9_LOCK,d=L.r*2*S,cx=L.x*S,cy=L.y*S;
    // the plate is shown at once (the room is dark); before the beam arrives a night wash dims it a little
    st.dark.style.opacity=(.32*(1-ease(seg(t,1.8,3.0)))).toFixed(3);
    st.line.style.strokeDashoffset=(1-ease(seg(t,.2,2.2))).toFixed(4);
    st.svg.style.opacity=(1-ease(seg(t,3.2,4.2))).toFixed(3);
    const g=ease(seg(t,2.0,3.0)), pulse=1+.05*Math.sin(t*14)*g;
    const gd=d*(.55+.8*g)*pulse; Object.assign(st.glow.style,{width:gd+'px',height:gd+'px',left:(cx-gd/2)+'px',top:(cy-gd/2)+'px',opacity:(.9*g*(1-.4*ease(seg(t,4.0,4.6)))).toFixed(3)});
    // the moon disc turns a third of a turn about its centre
    const turn=ease(seg(t,3.0,4.3));
    Object.assign(st.disc.style,{width:d+'px',height:d+'px',left:(cx-d/2)+'px',top:(cy-d/2)+'px',backgroundSize:S+'px '+S+'px',backgroundPosition:(-(cx-d/2))+'px '+(-(cy-d/2))+'px',
      transform:'rotate('+(-42*turn).toFixed(2)+'deg)',opacity:turn>0?1:0,filter:'brightness('+(1+.5*g).toFixed(2)+') saturate('+(1-.3*g).toFixed(2)+')'});
    st.flash.style.opacity=(.55*Math.sin(Math.PI*ease(seg(t,3.9,4.6)))).toFixed(3);
  }
};
}
