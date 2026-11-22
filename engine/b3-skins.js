'use strict';
// engine/b3-skins.js — Battle 3 stage 16: Tombo skins on the Full Family Ruckus. PLAY LAYER: it reads story flags, so the rules files
// (engine/b3-ruckus.js and the others the simulator loads) never see it. Table: data/b3-tombo-skins.js.
//
// Which skin is live for a pair of family members: among the skins whose `pairs` hold exactly these two ids and whose story flag is set
// (in a Battle Lab fight, cfg.lab, every skin counts as unlocked, as battle 2's Lab has every Tombo), the one with the highest `rank`;
// on a tie the later row (the newest unlocked in story order is the higher tier of that partner). No skin: the plain Full Family Ruckus.

function b3SkinUnlocked(s) {
  if(typeof B3!=='undefined'&&B3.cfg&&B3.cfg.lab) return true;
  return typeof flag==='function'&&!!flag(s.flag);
}
// idA, idB: character ids ('tom', 'grace'). Returns the live skin row or null.
function b3SkinFor(idA,idB) {
  let best=null;
  for(const s of B3_SKINS) {
    if(!s.pairs.some(p=>(p[0]===idA&&p[1]===idB)||(p[0]===idB&&p[1]===idA))||!b3SkinUnlocked(s)) continue;
    if(!best||s.rank>=best.rank) best=s;
  }
  return best;
}
// The same, for the two units of a Full Family Ruckus (unit keys).
function b3SkinForUnits(F,keyA,keyB) {
  const a=b3Unit(F,keyA),b=b3Unit(F,keyB);
  return a&&b?b3SkinFor(a.id,b.id):null;
}
// The recorded lines the pair says: [[who, key], ...] in the table's order, only for the two who fire it.
function b3SkinLines(s,idA,idB) { return s.lines.filter(l=>l[0]===idA||l[0]===idB); }
// Plays them, a beat apart (the partner first, then Tom, as battle 2's Tombos did). `say` is engine/speech.js: a baked clip when the words match
// one, speech synthesis otherwise; it does nothing while sound is off.
function b3SkinSay(s,idA,idB) {
  if(typeof say!=='function') return;
  b3SkinLines(s,idA,idB).forEach((l,i)=>say(l[0],l[1],.15+i*1.7));
}
// The name the deck shows for a Full Family Ruckus the pair can fire now (the tray's chip still says Family Ruckus).
function b3SkinName(F,u,partner,fallback) {
  const s=b3SkinFor(u.id,partner.id); return s?s.name:fallback;
}
