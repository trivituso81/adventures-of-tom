'use strict';
// engine/bt-shell.js: what the Battle 3 screen shares with the rest of the game. Loads before the battle files.
// Everything Battle 3 used to borrow from the first battle engine (engine/battle2*.js) lives here under bt names, moved and not copied; the
// battle files that are still loaded call these names too.
//   BT.result   how the last fight ended ('win', 'lose', 'flee', 'shell', 'run'): the story's {battle} step and the boss flag read it.
//   BT.lab      the Battle Lab scenery flags the backdrop reads (set while the old Lab fights play).
//   BT.oldFight the fight door's second choice, set by the old path while it is still loaded.
//   startBattle the ONE fight door: map monsters (engine/overworld.js) and the story's {battle} step (engine/story.js) both call it.
//   bt...       painted meters, escape, thumbnails, portraits, screen to canvas, flipped monsters, the purse.
const BT={result:null,lab:null,oldFight:null};

// ---------- The fight door ----------
// Battle 3 takes the fight when it has a plan for it (engine/b3-story.js b3sStart: the ADMIN switch, the party, a formation). Anything else
// goes to the old path.
function startBattle(npc,opts={}) {
  if(typeof b3sStart==='function'&&b3sStart(npc,opts)) return;
  if(BT.oldFight) BT.oldFight(npc,opts);
}

// ---------- Painted meters (Tom, 2026-11-05) ----------
// One look for every battle meter, on the canvas (enemies) and in the party window: a rounded well with the
// window frame's bronze rim, and a fill shaded like the paintings (lit from the top left, deeper underneath, a soft sheen).
// Colors are taken from the painted areas: meadow green, honey, terracotta, rose. Each entry is [light, mid, deep].
const BT_METER={hp:['#cfe89a','#8cc063','#4f8a48'],low:['#ffe6a0','#eeb651','#bd7f2a'],crit:['#ffc0a2','#e57f62','#ad4636'],
  warm:['#ffd3e0','#f58fb0','#c9537c'],warmFlash:['#ffffff','#ffe3ee','#f7a6c2'],rim:'#b8914a',rimLo:'#6d5629',ink:'#0a0e18',well:['#080a14','#1d2132']};
function btMeterPath(x,y,w,h) { const r=h/2; gfx.beginPath(); gfx.moveTo(x+r,y); gfx.lineTo(x+w-r,y); gfx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2); gfx.lineTo(x+r,y+h); gfx.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5); gfx.closePath(); }
function btMeter(x,y,w,h,q,C) {
  q=Math.max(0,Math.min(1,q)); gfx.save();
  // Soft shadow on the ground, dark ring, bronze rim, then the well.
  gfx.globalAlpha*=.35; btMeterPath(x-1.5,y-.5,w+3,h+3); gfx.fillStyle='#1b140c'; gfx.fill(); gfx.globalAlpha/=.35;
  btMeterPath(x-2,y-2,w+4,h+4); gfx.fillStyle=BT_METER.ink; gfx.fill();
  const rg=gfx.createLinearGradient(0,y-1.2,0,y+h+1.2); rg.addColorStop(0,'#e6c988'); rg.addColorStop(.5,BT_METER.rim); rg.addColorStop(1,BT_METER.rimLo);
  btMeterPath(x-1.2,y-1.2,w+2.4,h+2.4); gfx.fillStyle=rg; gfx.fill();
  const wg=gfx.createLinearGradient(0,y,0,y+h); wg.addColorStop(0,BT_METER.well[0]); wg.addColorStop(1,BT_METER.well[1]);
  btMeterPath(x,y,w,h); gfx.fillStyle=wg; gfx.fill();
  if(q>0) {
    const fw=Math.max(h,w*q);
    btMeterPath(x,y,w,h); gfx.clip();
    const fg=gfx.createLinearGradient(0,y,0,y+h); fg.addColorStop(0,C[0]); fg.addColorStop(.42,C[1]); fg.addColorStop(1,C[2]);
    btMeterPath(x,y,fw,h); gfx.fillStyle=fg; gfx.fill();
    // Sheen along the top and a lit leading edge.
    gfx.globalAlpha*=.5; btMeterPath(x+h*.35,y+h*.14,Math.max(1,fw-h*.7),h*.26); gfx.fillStyle='#fffaf0'; gfx.fill();
  }
  gfx.restore();
}

// The enemy's letter (A, B, C): a small bronze-rimmed medallion in the window type.
function btMeterTag(cx,cy,ch) {
  gfx.save();
  gfx.beginPath(); gfx.arc(cx,cy,8.5,0,Math.PI*2); gfx.fillStyle=BT_METER.ink; gfx.fill();
  const rg=gfx.createLinearGradient(0,cy-7.5,0,cy+7.5); rg.addColorStop(0,'#e6c988'); rg.addColorStop(.5,BT_METER.rim); rg.addColorStop(1,BT_METER.rimLo);
  gfx.beginPath(); gfx.arc(cx,cy,7.5,0,Math.PI*2); gfx.fillStyle=rg; gfx.fill();
  const wg=gfx.createLinearGradient(0,cy-6,0,cy+6); wg.addColorStop(0,'#232a3b'); wg.addColorStop(1,'#141924');
  gfx.beginPath(); gfx.arc(cx,cy,6.2,0,Math.PI*2); gfx.fillStyle=wg; gfx.fill();
  gfx.font="bold 10px Georgia,'Palatino Linotype',Palatino,serif"; gfx.textAlign='center'; gfx.textBaseline='middle'; gfx.fillStyle='#f2e6cc'; gfx.fillText(ch,cx,cy+.6);
  gfx.restore();
}

const btThumbs={};
function btThumb(id) {
  if(btThumbs[id]) return btThumbs[id];
  const d=MONSTERS[id],R=d.sprite,c=document.createElement('canvas'),n=Math.max(R.length,R[0].length);
  c.width=c.height=n; const g=c.getContext('2d');
  const ox=Math.floor((n-R[0].length)/2),oy=n-R.length;
  for(let r=0;r<R.length;r++) for(let k=0;k<R[r].length;k++) { const ch=R[r][k]; if(ch==='.') continue; g.fillStyle=d.pal[ch]; g.fillRect(ox+k,oy+r,1,1); }
  return btThumbs[id]=c.toDataURL();
}
const btEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function btPortrait(id) { return (typeof PORTRAITS!=='undefined'&&PORTRAITS[id])||''; }

// A screen point to canvas pixels (576x324). The forced-landscape layout turns the whole stage a quarter turn,
// so the canvas' x runs down the screen and its y runs toward the left (same swap as the D-pad in engine/draw.js).
function btCanvasPt(cx,cy) {
  const cv=$('battle-canvas'); if(!cv) return null;
  const r=cv.getBoundingClientRect(); if(!r.width||!r.height) return null;
  const rot=typeof layout!=='undefined'&&layout.rotated;
  const u=rot?(cy-r.top)/r.height:(cx-r.left)/r.width,v=rot?(r.right-cx)/r.width:(cy-r.top)/r.height;
  return {x:u*576,y:v*324,inside:u>=0&&u<=1&&v>=0&&v<=1};
}

// A monster drawn facing the wrong way in battle sets flipBattle on its def: the battle gets a cached mirrored copy
// (sprite rows reversed, eye and mouth x mirrored) so every move that aims at eyes or mouth still lands. The town keeps the original.
const BT_FLIPPED={};
function btBattleDef(d) {
  if(!d||!d.flipBattle) return d;
  if(!BT_FLIPPED[d.id]) { const W=d.sprite[0].length; BT_FLIPPED[d.id]=Object.assign({},d,{sprite:d.sprite.map(r=>Array.from(r).reverse().join('')),
    eyes:d.eyes&&d.eyes.map(e=>[W-1-e[0],e[1]]),mouth:d.mouth&&[W-1-d.mouth[0],d.mouth[1]]}); }
  return BT_FLIPPED[d.id];
}

// A fight's purse: each monster's coins (the one Tom walked into, or the boss, in full; the rest of its formation and
// summoned adds half), +50% for each one Un-Grumped, then charm coin perks. foes: [{id, boss, calm}].
function btPurse(foes,npc,coinPerk) {
  const d=monsterDef(npc),tier=npc.tier||0;
  let purse=0,lead=false;
  for(const f of foes) { const md=MONSTERS[f.id]||d,main=!!f.boss||(!lead&&f.id===npc.monster); if(main) lead=true;
    purse+=((md.coins||5)+tier*(md.coinStep||2))*(main?1:.5)*(f.calm?1.5:1); }
  return Math.round(purse*(1+(coinPerk||0)));
}

// ---------- Picture helpers (Rose Mode pictures, data/battle-emoji.js and data/battle-icons.js) ----------
const bpOn=()=>{ try { return !!b7Diff().pictures; } catch(e) { return false; } };
const bpIcon=(id,px,cls,grey)=>{
  // Big, sharp pictures (data/battle-emoji.js) first; the old 16x16 pixel pictures (data/battle-icons.js) only for ids without one.
  const be=typeof BE_MAP!=='undefined'&&BE_MAP[id];
  if(be) return '<img class="bi be '+(cls||'')+(grey?' grey':'')+'" alt="" src="'+BE_SVG[be]+'" width="'+px+'" height="'+px+'">';
  const u=biIcon(id,grey?'grey':''); return u?'<img class="bi '+(cls||'')+'" alt="" src="'+u+'" width="'+px+'" height="'+px+'">':''; };
const bpWord=s=>{ const w=String(s||'').replace(/[^A-Za-z0-9' ]/g,' ').trim().split(/\s+/)[0].slice(0,9); return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase(); };
