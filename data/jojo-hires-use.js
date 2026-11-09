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
  set.k=.930;   // real height 5'6 next to Tom 5'11 (42.0 visible rows); the sheet's stand is 42.0 rows (11-05)
  OW.jojo=set;
  // Battle frames (art/chars/jojo-bt.webp, K=2, the approved stance sheets, tools/sprite-bake/bake_jojo_stance.py): feet on the bottom row, centred.
  // The lavender battle look is as painted. FACES says which way a frame looks as drawn (lunge, offer, wind and guard point screen-right).
  // JOJO_BT.draw(name,x,y,hs,faceLeft,alpha): feet at x,y; hs = the standing height in game pixels; mirrors the frame when it does not already face the wanted way.
  // Both return false until the image has loaded, so the caller can draw its stand-in instead.
  const B=AT.bt,img=new Image(); let ready=false; img.onload=()=>{ ready=true; }; img.src=B.src+'?v='+(typeof ART_V!=='undefined'?ART_V:'');
  const FACES={b_wind:'R',b_offer:'R',b_lunge:'R',b_guard:'R'};
  const BT_STAND=(JOJO_HIRES.meta.bt&&JOJO_HIRES.meta.bt.stand)||74;           // standing height of the battle set at 1x, in rows
  const blit=(im,R,k,x,y,sc,flip,alpha)=>{
    const w=R[2]/k*sc,h=R[3]/k*sc,prevA=gfx.globalAlpha,sm=gfx.imageSmoothingEnabled;
    gfx.globalAlpha=alpha; gfx.imageSmoothingEnabled=true;
    gfx.save(); gfx.translate(Math.round(x),Math.round(y)); if(flip) gfx.scale(-1,1);
    gfx.drawImage(im,R[0],R[1],R[2],R[3],-w/2,-h,w,h);
    gfx.restore(); gfx.globalAlpha=prevA; gfx.imageSmoothingEnabled=sm; return true; };
  window.JOJO_BT={meta:JOJO_HIRES.meta.bt,ready:()=>ready&&PAINTED.jojoOw&&PAINTED.jojoOw.ready,has:n=>!!B.rects[n],
    draw(name,x,y,hs,faceLeft=true,alpha=1) { const R=B.rects[name]; if(!ready||!R) return false;
      return blit(img,R,B.k,x,y,hs/BT_STAND,(FACES[name]==='L')!==!!faceLeft,alpha); }};
})();
