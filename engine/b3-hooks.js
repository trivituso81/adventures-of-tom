'use strict';
// engine/b3-hooks.js — Battle 3 hooks: the fixed list of moments the rules announce, and running whatever data is
// attached to them (architecture section 2.3). RULES FILE: no drawing, no page, no timers.
// Stage 1: statuses can listen (their `on` field). Traits and Quirks plug into the same runner in stages 2 and 5.
const B3_HOOKS=['battleStart','roundStart','turnStart','actionDeclared','beforeHit','afterHit','crit','dodge','primeApplied','detonation',
  'pipsShaved','break','statusApplied','statusEnded','shieldBroken','shieldEnded','healed','cleansed','buffStripped','barMoved','intercept',
  'counter','foeTelegraph','foeDoubleTurn','allyBelowHp','ko','revive','actionEnd','turnEnd','battleEnd'];
// ev: who the moment is about ({src, tgt, ...}). A listener row:
//   carrier  'target' or 'source': the unit holding the status must be that side of the event (left out = anyone)
//   by       'otherAlly': the event's source must be a party member other than the one who put the status on
//   effects  ops to run (engine/b3-ops.js); `to:'attacker'` aims at the event's source
//   consume  the status is used up
function b3Fire(F,hook,ev,beats) {
  for(const u of F.units) {
    if(u.ko) continue;
    for(const id of Object.keys(u.st)) {
      const L=B3_STATUS[id].on&&B3_STATUS[id].on[hook]; if(!L||!u.st[id]) continue;
      if(L.carrier==='target'&&ev.tgt!==u) continue;
      if(L.carrier==='source'&&ev.src!==u) continue;
      if(L.by==='otherAlly'&&!(ev.src&&ev.src.side==='party'&&ev.src.key!==u.st[id].src)) continue;
      b3RunEffects(F,{F,actor:ev.src||u,src:ev.src||null,tgt:ev.tgt||u,carrier:u,targets:[ev.tgt||u],hit:[],beats,g:ev.g,detonated:{}},L.effects);
      if(L.consume&&b3EndStatus(F,u,id,'used')) beats.push({t:'statusEnd',tgt:u.key,id,g:ev.g});
    }
  }
}
