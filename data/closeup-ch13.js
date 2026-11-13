'use strict';
// Chapter 13 close-up: the eleven coins melt the amber doorway (Tom 2026-11-12; plan claude/closeup-plan.md Row 1; engine/closeup.js WATCH mode).
// Art (Art Library closeup-ch13-amber and closeup-ch13-parts, baked by tools/art-library/bake_closeup_ch13.py):
//   art/closeup/ch13-amber.webp   the closed amber wall (square plate)
//   art/closeup/ch13-coin.webp, ch13-hot.webp, ch13-run.webp   one coin, the same coin glowing, one molten run (256 px, transparent)
//   art/closeup/ch13-door.webp    the molten arch with a dark tunnel inside (169 x 227)
// Scene op {closeupWatch:'ch13'} (below) plays it; the scene then sets the melt flags and the doorway tiles as before.
// Timeline (seconds): 0 to 1.2 the coins press to the glass, 1.3 to 2.6 they glow and the wall brightens, 2.3 to 4.4 they run down like honey,
// 3.8 to 5.4 the doorway melts open from the top, 5.6 end.
const CH13_COINS=[[.30,.22],[.42,.17],[.55,.17],[.68,.22],[.24,.34],[.37,.30],[.50,.28],[.63,.30],[.76,.34],[.43,.41],[.57,.41]];
const CH13_DOOR={cx:.5,bottom:.975,h:.66};      // share of the plate; width follows the door picture (169 x 227)
const CH13_DUR=5.6;
const ch13Ease=x=>x<0?0:x>1?1:x*x*(3-2*x), ch13Out=x=>{ x=x<0?0:x>1?1:x; return 1-(1-x)*(1-x); }, ch13Seg=(t,a,b)=>(t-a)/(b-a);
CLOSEUP_DEFS.ch13={
  id:'ch13', ready:true, v:'closeup3', bg:'art/closeup/ch13-amber.webp', dur:CH13_DUR,
  startLabel:'A  PRESS', startCaption:'ELEVEN COINS. ON THREE.', endCaption:'THE AMBER OPENS', skipLabel:'A  SKIP',
  cues:[{at:1.0,fn:()=>closeupTick()},{at:1.35,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.charge) sfx.charge(); }},{at:5.2,fn:()=>{ if(typeof sfx!=='undefined'&&sfx.ding) sfx.ding(); }}],
  build(plate) {
    const mk=(src,cls)=>{ const d=cuEl('div','cu-w '+(cls||''),plate); d.appendChild(cuImg(cuSrc(CLOSEUP_DEFS.ch13,'art/closeup/ch13-'+src+'.webp'))); return d; };
    const wash=cuEl('div','cu-wash',plate);
    const coins=CH13_COINS.map((p,i)=>({p,coin:mk('coin'),hot:mk('hot'),run:mk('run'),h:.30+.14*((i*7)%5)/4,d0:.09*i}));
    const door=mk('door');
    return {wash,coins,door};
  },
  frame(t,S,st) {
    const D=.088*S;                                         // coin diameter
    st.wash.style.opacity=(.55*ch13Seg(ch13Ease(ch13Seg(t,1.3,2.6)),0,1)*(1-ch13Ease(ch13Seg(t,4.2,5.4)))).toFixed(3);
    st.coins.forEach((c,i)=>{
      const x=c.p[0]*S,y=c.p[1]*S,side=c.p[0]<.5?-1:1;
      // fly in from the side, pressing to the glass
      const f=ch13Out(ch13Seg(t,c.d0*.6,c.d0*.6+.75)),sc=1.6-.6*f,ox=side*(1-f)*S*.45;
      const glow=ch13Ease(ch13Seg(t,1.3+c.d0*.3,2.3+c.d0*.3));
      const melt=ch13Ease(ch13Seg(t,2.3+c.d0*.8,3.9+c.d0*.8));
      const shrink=1-.45*melt, fade=1-ch13Ease(ch13Seg(melt,.5,1));
      const set=(e,w,h,left,top,op,tr)=>Object.assign(e.style,{width:w+'px',height:h+'px',left:left+'px',top:top+'px',opacity:op,transform:tr||''});
      const cs=D*sc*shrink;
      set(c.coin,cs,cs,x+ox-cs/2,y-cs/2,(f*(1-glow)*fade).toFixed(3));
      const hs=cs*1.15; set(c.hot,hs,hs,x+ox-hs/2,y-hs/2,(f*glow*fade).toFixed(3));
      // the run: a painted drip that is revealed downward from the coin
      const rw=D*1.5,rh=c.h*S; const k=1-ch13Ease(ch13Seg(t,4.2,5.0));
      set(c.run,rw,rh,x-rw/2,y-rh*.12,(melt>0?k:0).toFixed(3));
      c.run.style.webkitMaskImage=c.run.style.maskImage='linear-gradient(transparent 0,#000 30%)';   // the painted pool at the top fades into the coin
      c.run.style.clipPath='inset(0 0 '+((1-melt)*100).toFixed(1)+'% 0)';
    });
    const open=ch13Ease(ch13Seg(t,3.8,5.3)),dh=CH13_DOOR.h*S,dw=dh*169/227;
    Object.assign(st.door.style,{width:dw+'px',height:dh+'px',left:(CH13_DOOR.cx*S-dw/2)+'px',top:(CH13_DOOR.bottom*S-dh)+'px',opacity:open>0?1:0,
      clipPath:'inset(0 0 '+((1-open)*100).toFixed(1)+'% 0)',filter:'drop-shadow(0 0 '+(S*.025).toFixed(1)+'px #ffc94acc)'});
  }
};
SCENE_OPS.closeupWatch=o=>lazy(()=>{
  let done=false;
  return {start(){ done=false; if(!closeupWatch(o.closeupWatch,()=>{ done=true; })) done=true; }, update(){ return done; }};
});
