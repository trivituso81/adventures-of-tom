'use strict';
// engine/gate-art.js: the gate layer (gatelayer1, Tom 2026-11-20: "a separate layer for door art and separate art for unlocked and locked doors ...
// they should never overlap the character"). data/gate-art.js lists the sites; a map gate (spec.gates[i].art) names its site.
// A site draws its locked picture while any gate that names it still matches (storyMatch on `cond`), its open picture once none does
// (when the site has one). The picture is an ordinary item in draw()'s depth sort, sitting at the top edge of its rectangle: every actor on
// or south of the rectangle is drawn after it, so Tom, the party and NPCs always stand in front of a gate and are never covered by it.
// The old code-drawn branch, school gate, barrier and doors (b7DrawMapFx in engine/story.js) are gone.
const GATE_IMG={};
function gateImage(site,state) {
  const k=site+'-'+state;
  let g=GATE_IMG[k];
  if(!g) {
    g=GATE_IMG[k]={img:new Image(),ready:false,fail:false};
    g.img.onload=()=>{ g.ready=true; };
    g.img.onerror=()=>{ g.fail=true; };
    g.img.src='art/gates/'+k+'.webp?v='+GATE_V;
  }
  return g.ready?g.img:null;
}
// 'locked', 'open' or null (nothing to draw: no such state, or its picture is not baked yet) for one site on the current map.
function gateState(site) {
  const S=GATE_ART[site]; if(!S) return null;
  let locked=false;
  if(STORY.mode==='full') for(const g of (currentMap.spec&&currentMap.spec.gates)||[]) if(g.art===site&&storyMatch(g.cond||{})) { locked=true; break; }
  const st=locked?'locked':'open';
  return S.states.includes(st)&&GATE_HAVE.includes(site+'-'+st)?st:null;
}
// The draw items of the current map's gates (draw.js adds them to its depth sort).
function gateArtItems(map) {
  const out=[];
  for(const site in GATE_ART) {
    const S=GATE_ART[site]; if(S.map!==map.id) continue;
    const state=gateState(site); if(!state) continue;
    out.push({kind:'gateart',value:{site,state},depth:S.rect[1]*T-1});
  }
  return out;
}
function drawGateArt(o) {
  const S=GATE_ART[o.site],img=gateImage(o.site,o.state); if(!img) return;
  const tune=Object.assign({fit:S.fit||1,dy:S.dy||0},(S.tune&&S.tune[o.state])||{});
  const [rx,ry,rw,rh]=S.rect;
  const w=rw*T*(S.fill?1:tune.fit),h=S.fill?rh*T:w*img.naturalHeight/img.naturalWidth;
  const cx=(rx+rw/2)*T,base=(ry+rh+tune.dy)*T;
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,Math.round(cx-w/2),Math.round(base-h),Math.round(w),Math.round(h));
  ctx.imageSmoothingEnabled=false;
}
