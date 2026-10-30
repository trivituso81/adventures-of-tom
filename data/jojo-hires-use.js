'use strict';
// data/jojo-hires-use.js: Jojo, TNB's sister (data/jojo-hires.js, art/chars/jojo-ow.webp). Overworld set OW.jojo (maps-la.js loft NPC) plus the
// painted battle frames Round with Jojo draws (JOJO_BT, engine/tnb-moves.js). Loads right after data/justin-hires-use.js.
(function() {
  if(typeof JOJO_HIRES==='undefined') return;
  const AT=JOJO_HIRES.atlas;
  paintedAtlas('jojoOw',AT.ow.src,AT.ow.rects,AT.ow.k);
  // The sheet has a real right-facing row, which is the game's 'side' (it faces right); 'left' is its mirror.
  const O=JOJO_HIRES.ow,mk=d=>['stand','step1','step2'].map(n=>paintRows(O[d+'_'+n].slice(),'jojoOw',d+'_'+n,false));
  const set={pal:O.pal,down:mk('down'),up:mk('up'),side:mk('right')};
  set.left=set.side.map(mirrorRows);
  OW.jojo=set;
  // Battle frames (art/chars/jojo-bt.webp, K=2): feet on the bottom row, horizontally centred on the feet. The sheet draws the throw poses (x-step, reach,
  // release, follow) and the high-five facing RIGHT, run and the cheers facing LEFT; FACES says which way each one looks as drawn.
  // JOJO_BT.draw(name,x,y,hs,faceLeft,alpha): feet at x,y; hs = the standing height in game pixels; mirrors the frame when it does not already face the wanted way.
  // JOJO_BT.drawOw(name,x,y,hs,faceLeft,alpha) does the same with a walk frame (name like 'right_step1'; the walk row faces right).
  // Both return false until the image has loaded, so the caller can draw its stand-in instead.
  const B=AT.bt,img=new Image(); let ready=false; img.onload=()=>{ ready=true; }; img.src=B.src;
  const FACES={b_run:'L',b_xstep:'R',b_reach:'R',b_release:'R',b_follow:'R',b_celeb1:'L',b_celeb2:'L',b_high:'L'};
  const BT_STAND=74, OW_STAND=JOJO_HIRES.meta.ow.h;           // standing heights of the two sets at 1x, in rows or pixels
  const blit=(im,R,k,x,y,sc,flip,alpha)=>{
    const w=R[2]/k*sc,h=R[3]/k*sc,prevA=gfx.globalAlpha,sm=gfx.imageSmoothingEnabled;
    gfx.globalAlpha=alpha; gfx.imageSmoothingEnabled=true;
    gfx.save(); gfx.translate(Math.round(x),Math.round(y)); if(flip) gfx.scale(-1,1);
    gfx.drawImage(im,R[0],R[1],R[2],R[3],-w/2,-h,w,h);
    gfx.restore(); gfx.globalAlpha=prevA; gfx.imageSmoothingEnabled=sm; return true; };
  window.JOJO_BT={meta:JOJO_HIRES.meta.bt,ready:()=>ready&&PAINTED.jojoOw&&PAINTED.jojoOw.ready,has:n=>!!B.rects[n],
    draw(name,x,y,hs,faceLeft=true,alpha=1) { const R=B.rects[name]; if(!ready||!R) return false;
      return blit(img,R,B.k,x,y,hs/BT_STAND,(FACES[name]==='L')!==!!faceLeft,alpha); },
    drawOw(name,x,y,hs,faceLeft=true,alpha=1) { const A=PAINTED.jojoOw; if(!A||!A.ready||!A.rects[name]) return false;
      return blit(A.img,A.rects[name],A.k,x,y,hs/OW_STAND,!!faceLeft,alpha); }};
})();
