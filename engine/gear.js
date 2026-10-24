'use strict';
// engine/gear.js — Equipment colors on sprites. A worn Outfit with a `color` recolors that
// character's top (shirt, tee, dress, vest) on the battle sprite, the overworld sprite and the portrait.
// GARMENT says which palette keys make up the top and which rows it sits on, per sprite set.
// Rows are for the raw sheet; prepped overworld sets are scaled by their resample factor.
const GARMENT={
  bt:{tom:{keys:'dc',rows:[16,29]},grace:{keys:'yxvsnj',rows:[16,28]},rose:{keys:'tvwyz',rows:[17,32]}},
  ow:{tom:{keys:'dc',rows:[17,32],f:1.07},grace:{keys:'yxvsnj',rows:[17,31],f:.88},rose:{keys:'tvwyz',rows:[19,35],f:.82},
      amy:{keys:'ef',rows:[23,48],f:.86},deedee:{keys:'m',rows:[25,43],f:.85},boppy:{keys:'b',rows:[24,40],f:.9},tnb:{keys:'p',rows:[25,37],f:.92}}
};
// Rigged recruits reuse the overworld body (data/recruit-rig.js), padded by 12 rows at the top.
for(const id of ['amy','deedee','boppy','tnb']) { const o=GARMENT.ow[id]; GARMENT.bt[id]={keys:o.keys,rows:[o.rows[0]+9,o.rows[1]+15]}; }

function hexToHsl(hex) {
  const n=parseInt(hex.slice(1),16),r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;
  let h=0,s=0;
  if(max!==min) {
    const d=max-min; s=l>.5?d/(2-max-min):d/(max+min);
    if(max===r) h=(g-b)/d+(g<b?6:0); else if(max===g) h=(b-r)/d+2; else h=(r-g)/d+4;
    h/=6;
  }
  return {h,s,l};
}
function hslToHex(h,s,l) {
  const f=(p,q,t)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
  let r,g,b;
  if(s===0) r=g=b=l; else { const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q; r=f(p,q,h+1/3); g=f(p,q,h); b=f(p,q,h-1/3); }
  return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(1,v))*255).toString(16).padStart(2,'0')).join('');
}
// Shift a garment's shades onto a new color: the base key takes the item color, the others keep their relative lightness.
const tintCache=new Map();
function garmentTint(kind,id,color,raw=false) {
  const g=GARMENT[kind][id]; if(!g||!color) return null;
  const ck=kind+':'+id+':'+color+(raw?':raw':'');
  if(tintCache.has(ck)) return tintCache.get(ck);
  const pal=kind==='bt'?BATTLE_SPRITES[id].pal:OW[id].pal;
  const base=hexToHsl(pal[g.keys[0]]),tint=hexToHsl(color);
  const map={};
  for(const k of g.keys) { if(!pal[k]) continue; const c=hexToHsl(pal[k]); map[k]=hslToHex(tint.h,tint.s,Math.max(.06,Math.min(.94,tint.l+(c.l-base.l)))); }
  const f=raw?1:(g.f||1),rows=[Math.floor(g.rows[0]*f),Math.ceil(g.rows[1]*f)];
  const t={map,rows};
  tintCache.set(ck,t);
  return t;
}
function memberTopColor(m) {
  const id=m&&m.equipment&&m.equipment.Outfit;
  return id&&items[id]&&items[id].color||null;
}
// Set while a party member's sprite is being drawn; drawSprite reads it.
let activeTint=null;
// Kneeling frames (kneelRows) fold the lower rows, so a drawn row maps back to a taller source row.
let activeKneelCut=0;
function tintColor(ch,r) {
  const t=activeTint; if(!t) return null;
  const sr=activeKneelCut&&r>=activeKneelCut?activeKneelCut+(r-activeKneelCut)*2:r;
  if(sr<t.rows[0]||sr>t.rows[1]) return null;
  return t.map[ch]||null;
}
