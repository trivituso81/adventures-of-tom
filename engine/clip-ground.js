'use strict';
// engine/clip-ground.js (rose-lava-xftr, 2026-11-21): something the game draws on the ground under a fighter while a clip plays.
// Video models would not keep Rose's lava inside the frame (Wan rev 1 to 4, Kling r1: it ran to both side edges), so her
// The Floor Is Lava! video has no lava and the game draws the pool here, UNDER her and her cushion. An effect, not a pose.
// The clip file carries D.ground {kind:'lava', from, full, to} in clip ms (tools/clip-bake/bake_clip.py --ground).
// Shared by the game (engine/b3-play.js) and the Battle Guide player (battle-guide.html), so both show the same pool.
// bclipGround(g, D, ms, cx, feetY, u): g a 2D context, cx and feetY the fighter's middle and feet line, u pixels per sprite row.
const CLIP_GROUND={lava:{w:52,h:10,dy:4,fade:200}};   // pool size in sprite rows (Rose stands 83 rows), its middle dy rows under the feet line
function bclipGround(g,D,ms,cx,feetY,u) {
  const G=D&&D.ground,P=G&&CLIP_GROUND[G.kind]; if(!P||ms<G.from||ms>G.to) return;
  const q=Math.min(1,(ms-G.from)/Math.max(1,G.full-G.from)),grow=1-(1-q)*(1-q),fade=Math.min(1,(G.to-ms)/P.fade);
  const rx=P.w*u*.5*(.25+.75*grow),ry=P.h*u*.5*(.25+.75*grow),cy=feetY+P.dy*u;
  g.save(); g.globalAlpha*=Math.max(0,fade);
  const blob=(sx,sy,col)=>{ g.beginPath(); g.ellipse(cx,cy,rx*sx,ry*sy,0,0,Math.PI*2); g.fillStyle=col; g.fill(); };
  blob(1,1,'#6e1c0a'); blob(.94,.86,'#c8360c'); blob(.8,.68,'#f0641a');
  const gr=g.createRadialGradient(cx,cy,0,cx,cy,rx*.62); gr.addColorStop(0,'#ffe07a'); gr.addColorStop(.55,'#ffa22e'); gr.addColorStop(1,'rgba(255,140,40,0)');
  g.fillStyle=gr; g.beginPath(); g.ellipse(cx,cy,rx*.62,ry*.5,0,0,Math.PI*2); g.fill();
  // bubbles: each swells and pops on its own beat, at fixed spots across the pool
  const B=[[-.62,.1,0],[-.3,-.35,170],[.05,.3,330],[.38,-.2,90],[.66,.15,250],[-.05,-.05,420]];
  for(const [bx,by,o] of B) { const c=((ms+o)%640)/640; if(c>.85) continue;
    const r=u*(.8+1.6*c),x=cx+bx*rx*.85,y=cy+by*ry*.8;
    g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fillStyle='#ffb43a'; g.fill();
    g.beginPath(); g.arc(x-r*.35,y-r*.35,r*.35,0,Math.PI*2); g.fillStyle='#fff3b0'; g.fill(); }
  g.restore();
}
