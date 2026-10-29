'use strict';
// engine/tiles.js — Shared outline color and small drawing helpers for the town renderer.
// ================= High-resolution town rendering (32px tiles) =================
const OUT='#2b2a26';

function resample(rows,f) {
  const h=rows.length,w=rows[0].length,nh=Math.round(h*f),nw=Math.round(w*f),out=[];
  for(let y=0;y<nh;y++) {
    const sy=Math.min(h-1,Math.floor((y+.5)/f));
    let s='';
    for(let x=0;x<nw;x++) s+=rows[sy][Math.min(w-1,Math.floor((x+.5)/f))];
    out.push(s);
  }
  return out;
}
function mirrorRows(rows) {
  const m=rows.map(r=>r.split('').reverse().join(''));
  if(rows._paint) m._paint={a:rows._paint.a,f:rows._paint.f,flip:!rows._paint.flip};
  return m;
}
function prepOW(src,f) {
  const o={pal:src.pal};
  for(const k of ['down','up','side']) o[k]=src[k].map(fr=>f===1?fr:resample(fr,f));
  o.left=o.side.map(mirrorRows);
  return o;
}

// Villager bases: role-tagged frames (O outline, H/h/K hair, S/s skin, T/t top, P/p bottom, F shoes, R rim light, W eye white, A accent).
