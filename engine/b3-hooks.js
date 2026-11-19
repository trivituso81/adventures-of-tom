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
//   limit    'action' (once per action), 'actionTarget' (once per action for each monster it is about: Creative Mess), 'round'
//            (once a round) or 'battle' (once a fight), per holder
//   limitKey a name two listeners share, so one `limit` counts both of them (Creative Mess, New Game Plus)
//   answer   'putter' (a status's reaction): the answer is the one who put the status on, aimed at the one carrying it
//            (Winged Shell Lock-On: Tom's shell slams the monster, the monster does not answer itself)
//   react    true: the effects run as a REACTION after the action that set them off has finished (a ward's answer, a counter).
//            The holder is the attacker of the reaction and `to:'attacker'` aims at the unit that set it off.
//            A reaction shares the `reacted` record of the action that set it off, so an "once per action" answer cannot be
//            set off a second time by the answers to it (a ward against a counter act against a ward...).
//   quiet    true: a reaction that is not a counterattack (the `counter` hook does not fire for it)
//   effects  ops to run (engine/b3-ops.js)
//   consume  (statuses) the status is used up
//   show     (passives) true: the screen names the Trait or Quirk over its holder when it goes off
// What the moment must look like (every one listed must hold; B3_LISTEN_IF is the list the data check knows):
//   ids          the event's id is one of these (a Prime's or a status's id)
//   flavor       the hit's flavor is this one
//   multiHit     the hit belongs to a move that hits more than once (it counts once per hit, not per flavor part)
//   landed       the action has landed at least this many hits
//   targetPrime  the event's target carries this Prime, or this action set that Prime off on it
//   pepAtLeast   the holder has at least this much Pep (Elixir Hoarder, read as its turn starts)
//   kinds        the event's id is a status of one of these kinds (Creative Mess: 'debuff')
//   tgtFoe       the event's target is on the other side from the holder
//   attacks      the act in progress deals damage (a foe's wind-up or buff does not)
// A Trait or Quirk row (data/b3-kit-*.js) is one listener (`on` and the fields above on the row itself) or several
// (`listen:[{on, ...}, ...]`); engine/b3-progress.js b3KitPassives lays them out as the flat rows a unit carries in `passives`.
// The events: afterHit {src, tgt, dmg, flavor, crit, part (which flavor part of a two-flavor hit), tags, c};
// intercept {src: the attacker, tgt: the one who stepped in, for: the one they stepped in for, c}; counter {src: who answered,
// tgt: who they answered, c: the answer's own small action}; the ops' events carry c too (engine/b3-ops.js).
//   every        the round number is a multiple of this (Well-Loved Original: every 2nd round)
//   shieldBy     'holder': the shield that broke or ended was put on by the holder (Emergency Stuffy Swap)
const B3_LISTEN_IF=['ids','flavor','multiHit','landed','targetPrime','pepAtLeast','kinds','tgtFoe','attacks','every','shieldBy'];
function b3ListenOk(F,u,L,ev,putBy,useKey) {
  if(L.limitKey) useKey='lk:'+L.limitKey;
  if(L.carrier==='target'&&ev.tgt!==u) return false;
  if(L.carrier==='source'&&ev.src!==u) return false;
  if(L.by==='otherAlly'&&!(ev.src&&ev.src.side==='party'&&ev.src.key!==putBy)) return false;
  if(L.from==='foe'&&!(ev.src&&ev.src.side!==u.side)) return false;
  if(L.tags&&!(ev.tags&&L.tags.some(t=>ev.tags.includes(t)))) return false;
  if(L.ids&&!L.ids.includes(ev.id)) return false;
  if(L.flavor&&ev.flavor!==L.flavor) return false;
  if(L.multiHit&&!(ev.c&&ev.c.skill&&(ev.c.skill.hits||1)>1&&!ev.part)) return false;
  if(L.landed&&!(ev.c&&(ev.c.landed||0)>=L.landed)) return false;
  if(L.targetPrime&&!(ev.tgt&&(ev.tgt.st[L.targetPrime]||(ev.c&&ev.c.detPrime&&ev.c.detPrime[ev.tgt.key]===L.targetPrime)))) return false;
  if(L.pepAtLeast!=null&&!(u.pep>=L.pepAtLeast)) return false;
  if(L.kinds&&!(ev.id&&B3_STATUS[ev.id]&&L.kinds.includes(B3_STATUS[ev.id].kind))) return false;
  if(L.tgtFoe&&!(ev.tgt&&ev.tgt.side!==u.side)) return false;
  if(L.attacks&&!(ev.c&&ev.c.skill&&ev.c.skill.power)) return false;
  if(L.every&&F.round%L.every) return false;
  if(L.shieldBy==='holder'&&ev.by!==u.key) return false;
  if(L.limit==='round'&&u.used[useKey]===F.round) return false;
  if(L.limit==='battle'&&u.used[useKey]) return false;
  if(L.limit==='action'&&ev.c&&ev.c.reacted&&ev.c.reacted[u.key+useKey]) return false;
  if(L.limit==='actionTarget'&&ev.c&&ev.tgt&&ev.c.reacted&&ev.c.reacted[u.key+useKey+'@'+ev.tgt.key]) return false;
  return true;
}
function b3Listen(F,u,L,ev,beats,useKey,statusId,name) {
  if(L.limitKey) useKey='lk:'+L.limitKey;
  if(L.limit==='action') { if(ev.c) (ev.c.reacted=ev.c.reacted||{})[u.key+useKey]=true; }
  else if(L.limit==='actionTarget') { if(ev.c&&ev.tgt) (ev.c.reacted=ev.c.reacted||{})[u.key+useKey+'@'+ev.tgt.key]=true; }
  else if(L.limit) u.used[useKey]=F.round;
  if(L.react) {
    // The status's own answer is the holder's. `answer:'putter'` makes it the answer of whoever put the status on, aimed at the holder.
    const putter=L.answer==='putter'&&statusId?b3Unit(F,u.st[statusId].src):null;
    if(L.answer==='putter'&&!putter) return;
    // A status that is used up by the answer is gone the moment it is set off, so a monster that acts twice sets it off once.
    const used=!!(L.consume&&statusId&&b3EndStatus(F,u,statusId,'used'));
    if(used) beats.push({t:'statusEnd',tgt:u.key,id:statusId,g:ev.g});
    F.reactions.push({u:putter||u,L,src:putter?u:(ev.src||null),status:statusId,holder:u,used,name,root:ev.c&&ev.c.reacted});
    return;
  }
  if(!statusId&&L.show) beats.push({t:'passive',src:u.key,id:L.pid||L.id,name,g:ev.g});
  // A status the hit uses up may be held for the rest of a multi-hit move (Twin-Lamb Relay, engine/b3-custom.js): its
  // effects then run at a share of their strength on the later hits, and it comes off when the move ends.
  const relay=statusId&&L.consume?b3RelayUse(F,ev,u,statusId):null;
  // A status's effects run with the event's source as the actor (Squished pays the attacker); a passive's run as its holder.
  // Composure they shave is written into the ledger of the action that set them off, inside its 3-pip cap (spec 2.7).
  // `dealt` is what the action has taken off the event's target so far, soaked or not (Creative Mess splashes a share of it).
  const dealt=ev.c&&ev.tgt&&ev.c.lost?(ev.c.lost[ev.tgt.key]||0)+((ev.c.soak&&ev.c.soak[ev.tgt.key])||0):0;
  b3RunEffects(F,{F,actor:statusId?(ev.src||u):u,src:ev.src||null,tgt:ev.tgt||u,carrier:u,targets:[ev.tgt||u],hit:[],beats,g:ev.g,detonated:{},dealt,
    reacted:(ev.c&&ev.c.reacted)||{},ledger:(ev.c&&ev.c.ledger)||{},scale:relay?relay.scale:1},L.effects);
  if(L.consume&&statusId&&!relay&&b3EndStatus(F,u,statusId,'used')) beats.push({t:'statusEnd',tgt:u.key,id:statusId,g:ev.g});
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
    if(!u||!b3Alive(u)||!a||!b3Alive(a)||(R.status&&!R.used&&!(R.holder||u).st[R.status])||(R.act&&u.broken)) continue;
    const g='r'+(F.reactSeq++);
    beats.push({t:'react',src:u.key,tgt:a.key,id:R.status,name:R.name,g});
    const c={F,actor:u,src:a,tgt:a,carrier:u,targets:[a],hit:[],beats,g,detonated:{},reacted:R.root||{},tags:R.tags||['counter'],ledger:{}};
    b3RunEffects(F,c,R.L.effects);
    b3SpendCounters(F,c);
    b3KoCheck(F,c);
    // The `counter` hook fires before the answer's Composure is paid, so a pip a Quirk adds to a counterattack (Million-Miler
    // Status) lands inside the answer's own cap.
    if(!R.L.quiet) b3Fire(F,'counter',{src:u,tgt:a,g,c},beats);
    b3PayLedger(F,c);
  }
  F.reactions.length=0;
}
