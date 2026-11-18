'use strict';
// engine/b3-hooks.js — Battle 3 hooks: the fixed list of moments the rules announce, and running whatever data is
// attached to them (architecture section 2.3). RULES FILE: no drawing, no page, no timers.
// Two things listen: a status (its `on` field in data/b3-status.js) and a passive (a Trait or Quirk row a unit carries in
// `passives`, with `on` naming the hook; the kit stages write those rows from stage 5 on).
const B3_HOOKS=['battleStart','roundStart','turnStart','actionDeclared','beforeHit','afterHit','crit','dodge','primeApplied','detonation',
  'pipsShaved','break','statusApplied','statusEnded','shieldBroken','shieldEnded','healed','cleansed','buffStripped','barMoved','intercept',
  'counter','foeTelegraph','foeDoubleTurn','allyBelowHp','ko','revive','actionEnd','turnEnd','battleEnd'];
// ev: who the moment is about ({src, tgt, tags (the act's tags), c (the action in progress), g ...}).
// A listener row (the same fields for a status's `on.<hook>` and for a passive):
//   carrier  'target' or 'source': the unit holding it must be that side of the event (left out = anyone)
//   by       'otherAlly': the event's source must be a party member other than the one who put the status on
//   from     'foe': the event's source must be on the other side from the holder
//   tags     the event's act must carry one of these tags (melee, projectile...)
//   limit    'action' (once per action), 'round' (once a round) or 'battle' (once a fight), per holder
//   react    true: the effects run as a REACTION after the action that set them off has finished (a ward's answer, a counter).
//            The holder is the attacker of the reaction and `to:'attacker'` aims at the unit that set it off.
//            A reaction shares the `reacted` record of the action that set it off, so an "once per action" answer cannot be
//            set off a second time by the answers to it (a ward against a counter act against a ward...).
//   effects  ops to run (engine/b3-ops.js)
//   consume  (statuses) the status is used up
function b3ListenOk(F,u,L,ev,putBy,useKey) {
  if(L.carrier==='target'&&ev.tgt!==u) return false;
  if(L.carrier==='source'&&ev.src!==u) return false;
  if(L.by==='otherAlly'&&!(ev.src&&ev.src.side==='party'&&ev.src.key!==putBy)) return false;
  if(L.from==='foe'&&!(ev.src&&ev.src.side!==u.side)) return false;
  if(L.tags&&!(ev.tags&&L.tags.some(t=>ev.tags.includes(t)))) return false;
  if(L.limit==='round'&&u.used[useKey]===F.round) return false;
  if(L.limit==='battle'&&u.used[useKey]) return false;
  if(L.limit==='action'&&ev.c&&ev.c.reacted&&ev.c.reacted[u.key+useKey]) return false;
  return true;
}
function b3Listen(F,u,L,ev,beats,useKey,statusId,name) {
  if(L.limit==='action') { if(ev.c) (ev.c.reacted=ev.c.reacted||{})[u.key+useKey]=true; } else if(L.limit) u.used[useKey]=F.round;
  if(L.react) { F.reactions.push({u,L,src:ev.src||null,status:statusId,name,root:ev.c&&ev.c.reacted}); return; }
  // A status's effects run with the event's source as the actor (Squished pays the attacker); a passive's run as its holder.
  // Composure they shave is written into the ledger of the action that set them off, inside its 3-pip cap (spec 2.7).
  b3RunEffects(F,{F,actor:statusId?(ev.src||u):u,src:ev.src||null,tgt:ev.tgt||u,carrier:u,targets:[ev.tgt||u],hit:[],beats,g:ev.g,detonated:{},ledger:(ev.c&&ev.c.ledger)||{}},L.effects);
  if(L.consume&&statusId&&b3EndStatus(F,u,statusId,'used')) beats.push({t:'statusEnd',tgt:u.key,id:statusId,g:ev.g});
}
function b3Fire(F,hook,ev,beats) {
  for(const u of F.units) {
    if(u.ko) continue;
    for(const id of Object.keys(u.st)) {
      const L=B3_STATUS[id].on&&B3_STATUS[id].on[hook]; if(!L||!u.st[id]) continue;
      if(b3ListenOk(F,u,L,ev,u.st[id].src,'st:'+id)) b3Listen(F,u,L,ev,beats,'st:'+id,id,L.name||B3_STATUS[id].name);
    }
    for(const P of u.passives) if(P.on===hook&&b3ListenOk(F,u,P,ev,null,'pv:'+P.id)) b3Listen(F,u,P,ev,beats,'pv:'+P.id,null,P.name||P.id);
  }
}
// The reactions an action set off, in the order they were set off (architecture 2.6, step 6: "counter acts answer").
// Each is its own small action: its beats carry their own `g` ('r0', 'r1'...) so the screen plays them after the move, and it
// has its own Composure ledger with its own 3-pip cap (my call: an answer is not part of the action it answers).
// An enemy's counter act (R.act, queued by b3QueueCounters in engine/b3-foe.js) does not answer while that enemy is Flustered:
// a Break takes its counter-auras away until its next turn begins (spec 2.7).
function b3RunReactions(F,beats) {
  for(let guard=0;F.reactions.length&&guard<20;guard++) {
    const R=F.reactions.shift(),u=R.u,a=R.src;
    if(!b3Alive(u)||!a||!b3Alive(a)||(R.status&&!u.st[R.status])||(R.act&&u.broken)) continue;
    const g='r'+(F.reactSeq++);
    beats.push({t:'react',src:u.key,tgt:a.key,id:R.status,name:R.name,g});
    const c={F,actor:u,src:a,tgt:a,carrier:u,targets:[a],hit:[],beats,g,detonated:{},reacted:R.root||{},tags:R.tags||['counter'],ledger:{}};
    b3RunEffects(F,c,R.L.effects);
    b3KoCheck(F,c);
    b3PayLedger(F,c);
    b3Fire(F,'counter',{src:u,tgt:a,g},beats);
  }
  F.reactions.length=0;
}
