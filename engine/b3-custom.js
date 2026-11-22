'use strict';
// engine/b3-custom.js — Battle 3 one-offs: the few kit lines the ops, hooks and conditions cannot say as data (architecture
// section 2.1; the list of such lines is claude/battle-kit-ops.md). RULES FILE: no drawing, no page, no timers.
// A Trait or Quirk row switches one on with `custom:'<name>'` and keeps its numbers in the row's `n`; a unit carries them in
// `custom` ({name: numbers}). B3_CUSTOM lists every one-off this file knows, so the data check can catch a misspelt name.
const B3_CUSTOM={
  twinLambRelay:'Rose, Sugar Rush, Quirk A: riders are held for the later hits of a multi-hit move, at a share of their strength',
  cleanBill:'Deedee, Registered Nut, Trait: half of any healing past full HP becomes a Clean Bill Shield (a share of the overheal, capped at a share of Max HP)',
  doubleCoat:'Grace, Craft Artist, Quirk B: a Razzle move after a Racket move (or the other way round) takes a free Composure pip off',
  wetClay:'TNB, Ceramicist, Trait: his clay shields soak extra Clobber damage, and a Sizzle hit fires one into Fired Glaze that reflects part of what it soaks',
  tapCard:'TNB, Longboarder, Quirk A: the buffs he puts on last longer (engine/b3-ops.js b3PutStatus)',
  boppySpeed:'Boppy, The Dep, Trait: while above half HP a push on the turn bar does nothing to him (engine/b3-timeline.js b3Push)',
  goldTeeth:'Boppy, The Dep, Quirk A: once a battle a lethal hit leaves him on 1 HP and gives him Pep (engine/b3-resolve.js b3Hurt)',
  mailbox:'Boppy, The Dep, Quirk B: his counterattacks copy the flavor and the status riders of his last Skill (b3MailboxEffects below)',
  hoseFlinched:'Boppy, Pepper Boss, Quirk A: the damage-over-time ticks of statuses he put on can crit (engine/b3-resolve.js b3TickHit)',
  nervous:'Nara, Attached Pup, Trait: Evasion from the Pep she is holding, half against a party-wide act (engine/b3-core.js b3Evasion)',
  shins:'Nara, Attached Pup, Quirk B: her Attack grows by a share of her Speed bonuses (engine/b3-core.js b3Stat)',
  muscleMemory:'Olivia, Rope Champ, Quirk A: a Support turn no longer resets her Cadence (the reset in her Vibe row has `lacksCustom:\'muscleMemory\'`, engine/b3-hooks.js)',
  encore:'Grace, Stage Performer, Quirk B: a one-attack buff that fires leaves half its bonus for one more turn (engine/b3-core.js b3EndStatus, the status row\'s `echo`)',
  scoop:'Olivia, News Anchor, Quirk B: the first debuff she puts on a Boss lasts a turn longer and cannot be cleansed (engine/b3-ops.js b3PutStatus)',
  couch:'Nara, Picky Princess, Quirk B: a single buff on her is copied for half its turns onto the family member with the lowest HP (engine/b3-ops.js b3PutStatus)',
  tupperware:'Deedee, Home Cook, Quirk A: a single heal or buff bounces at half size to a second family member, sometimes (b3Tupperware)',
  unmailed:'Justin, Armchair Ref, Quirk B: once a fight a 2 or 3 Pep Racket Skill is repeated free at half power (b3Unmailed)'
};

// ---------- Boppy Speed (spec 3.6: "timeline pushback immune >50% HP") ----------
// True while Boppy stands above `above` of his Max HP: b3Push then does nothing to him. (A status's `pushImmune` flag is the same thing for a while.)
function b3SpeedHold(u) { const n=u.custom&&u.custom.boppySpeed; return !!n&&u.hp>u.maxHp*n.above; }

// ---------- "The Mailbox Moved" (spec 3.6: "counters inherit element & riders of Boppy's last Active Skill") ----------
// An answer Boppy gives (the grumpy counter of "Nobody Gets Past Me!", the Iron Gate's thorns) takes the flavor of his last Skill (Skill 1,
// Skill 2 or Capstone; a Basic is not an Active Skill, my call) in place of its own, and carries that Skill's status riders: every status
// the Skill puts on its target or on the monsters, put on whoever Boppy answers. A Skill with no damage flavor (a Support one) changes
// nothing. An answer with no damage in it gets no riders. Before he has used a Skill his answers are the plain ones.
function b3MailboxEffects(u,effects) {
  const S=u.lastSkill&&B3_SKILLS[u.lastSkill]; if(!S||!effects.some(e=>e.op==='damage'&&e.power!=null)) return effects;
  const fl=(S.flavor||[]).filter(f=>f!=='support'&&B3_FLAVORS[f]); if(!fl.length) return effects;
  const riders=S.effects.filter(e=>e.op==='status'&&(e.to==='target'||e.to==null||e.to==='foes')).map(e=>Object.assign({},e,{to:'attacker'}));
  return effects.map(e=>e.op==='damage'&&e.power!=null?Object.assign({},e,{flavor:fl}):e).concat(riders);
}

// ---------- Sandbox Clue Digger (spec 3.8: "Digs up buried neighborhood treasures (Pep Bone, Squeaky Toy, Chicken Strip) at battle start & on boss Break") ----------
// The Quirk's two listeners (battleStart, and break with a Boss) each run the `treasure` op: one of the three, picked by the fight's dice.
// The effects are my calls: a Pep Bone gives 2 Pep to whoever in the family has the least; a Squeaky Toy is a light Racket squeak on a
// random monster; a Chicken Strip heals whoever has the smallest share of HP left by 15%.
const B3_TREASURE=[
  {id:'pep_bone',name:'Pep Bone',effects:[{op:'pep',n:2,to:'lowestPepAlly'}]},
  {id:'squeaky_toy',name:'Squeaky Toy',effects:[{op:'damage',flavor:['racket'],power:'light',to:'randomFoe'}]},
  {id:'chicken_strip',name:'Chicken Strip',effects:[{op:'heal',pct:.15,to:'lowestAlly'}]}];
function b3Treasure(F,c) {
  const T=B3_TREASURE[Math.min(B3_TREASURE.length-1,Math.floor(b3Rand(F)*B3_TREASURE.length))];
  c.beats.push({t:'passive',src:c.actor.key,id:'sandbox_clue_digger',name:'Dug up a '+T.name,g:c.g});
  b3RunEffects(F,c,T.effects); b3KoCheck(F,c);
}

// ---------- Locked On the Gold Ball (spec 3.8: "Hitting same foe twice marks My Toy") ----------
// After each action of Nara's, she remembers the monsters it hit (`lastHit`). A monster her action hits that was also hit by her action
// before it is given My Toy. My calls: "twice" is two of her own actions in a row; an action that hits nothing leaves the memory as it was;
// a monster that already wears My Toy keeps it as it is.
function b3GoldBall(F,c) {
  const a=c.actor,act=c.act; if(!act||act.actor!==a) return;
  const hit=(act.hit||[]).filter(t=>t.side==='foe'&&b3Alive(t)); if(!hit.length) return;
  const last=a.lastHit||[];
  for(const t of hit) if(last.includes(t.key)&&!t.st.my_toy) b3PutStatus(F,c,t,{id:'my_toy'});
  a.lastHit=hit.map(t=>t.key);
}

// ---------- Twin-Lamb Relay (spec 3.3: "multi-hit skills trigger weapon/elemental enchantments on every hit at 40% power") ----------
// An "enchantment" here is a RIDER: something another family member left on a monster that the next hit uses up. In data that
// is a status whose afterHit listener says consume:true (Grace's Squished, Deedee's Spit Shine), with its effects and any mods
// that carry a `when`.
// Without this Quirk the first hit that meets a rider uses it up. With it, on a move of Rose's that hits more than once:
//   the first hit sets the rider off at full strength, as always;
//   the rider then stays for the rest of that move, and every later hit sets it off again at `share` (40%): its damage, splash,
//   heal and shield effects are cut to that share, and so is a damage mod it carries (Spit Shine's +30% becomes +12%);
//   an effect that cannot be split (1 Pep, a status) does not repeat;
//   the rider comes off when the move ends.
// The seams: b3Listen (engine/b3-hooks.js) asks b3RelayUse before it uses a rider up; b3Mods (engine/b3-core.js) asks b3RelayMod
// for a rider's mod; b3Act (engine/b3-resolve.js) calls b3RelayEnd when the move's effects are done.
function b3RelayShare(c,a) {
  const n=a&&a.custom&&a.custom.twinLambRelay;
  return n&&c&&c.actor===a&&c.skill&&b3HitsOf(a,c.skill)>1?n.share:0;
}
// A hit by ev.src is about to use up the rider `id` on u. Returns null (use it up as usual) or {scale}: keep it, and run its
// effects at that scale (1 the first time this move meets it, the share after that).
function b3RelayUse(F,ev,u,id) {
  const c=ev.c,share=b3RelayShare(c,ev.src); if(!share) return null;
  const k=u.key+':'+id,used=(c.relay=c.relay||{})[k]||0; c.relay[k]=used+1;
  return {scale:used?share:1};
}
// The size of a rider's mod for this hit: full until this move has set the rider off once, the share after that.
function b3RelayMod(c,u,id) {
  const share=c&&c.relay&&c.relay[u.key+':'+id]?b3RelayShare(c,c.actor):0;
  return share||1;
}
// The move is over: every rider it held comes off.
function b3RelayEnd(F,c) {
  for(const k of Object.keys(c.relay||{})) { const i=k.indexOf(':'),t=b3Unit(F,k.slice(0,i)),id=k.slice(i+1);
    if(t&&b3EndStatus(F,t,id,'used')) c.beats.push({t:'statusEnd',tgt:t.key,id,g:'post'}); }
  c.relay=null;
}

// ---------- Double Coat (spec 3.2: "Razzle->Racket or Racket->Razzle sequences knock 1 free Composure pip") ----------
// Grace remembers the flavor of her last move (`lastFlavor`, set on every party unit, read only here). When this move is
// Razzle and the last was Racket, or this is Racket and the last was Razzle, every monster this move hit loses `pips` Composure
// pip(s), free, inside the action's 3-pip cap. My calls: her Basic counts as a move; a move of two flavors, or of any other
// flavor (Sizzle: Glue Trap), is neither and starts the count again; a Support move she makes (no flavor) also starts it again.
// Called from b3Act after the move's effects, before the ledger is paid.
function b3DoubleCoat(F,c) {
  const a=c.actor,S=c.skill; if(!S||a.side!=='party') return;
  const fl=S.flavor&&S.flavor.length===1?S.flavor[0]:null,n=a.custom&&a.custom.doubleCoat,last=a.lastFlavor;
  if(n&&fl&&last&&last!==fl&&['razzle','racket'].includes(fl)&&['razzle','racket'].includes(last)&&c.hit.length) {
    for(const t of c.hit) b3Pips(c,t,n.pips);
    c.beats.push({t:'passive',src:a.key,id:'double_coat',name:B3_QUIRKS.double_coat.name,g:c.g});
  }
  a.lastFlavor=fl;
}

// ---------- "Unmailed Invitations" (Justin, Armchair Ref, Quirk B, stage 19) ----------
// Once a fight, a Racket Skill that costs 2 or 3 Pep is delivered again for free at half power (my calls: the repeat is the Skill's damage
// and heals at `scale` .5, as a rider-held repeat is; a rider such as a push or a status does not repeat; "or Break" is not built, the
// repeat is once a fight). Called from b3Act after the move's effects, before the ledger is paid.
function b3Unmailed(F,c) {
  const a=c.actor,S=c.skill,n=a.custom&&a.custom.unmailed; if(!n||!S||a.side!=='party'||a.used.unmailed||!c.hit.length) return;
  if(S.slot==='basic'||!(S.flavor||[]).includes('racket')||!(S.pep>=2&&S.pep<=3)) return;
  a.used.unmailed=true;
  c.beats.push({t:'passive',src:a.key,id:'unmailed_invitations',name:B3_QUIRKS.unmailed_invitations.name,g:c.g});
  b3RunEffects(F,Object.assign({},c,{scale:.5}),S.effects);
}

// ---------- "Tupperware Send-Off" (Deedee, Home Cook, Quirk A, stage 19) ----------
// A single-target heal or buff Deedee gives an ally can bounce to a second family member (any other than the first, picked by the fight's dice) at
// half size (a heal or a shield; a buff goes on whole, my call). 35% of the time, always at 8 or more Pep. Called from b3Act after the move's effects.
function b3Tupperware(F,c) {
  const a=c.actor,S=c.skill,n=a.custom&&a.custom.tupperware; if(!n||F.preview||!S||a.side!=='party'||!['ally','family'].includes(S.target)||c.targets.length!==1) return;
  if(!(S.effects||[]).some(e=>e.op==='heal'||e.op==='shield'||(e.op==='status'&&B3_STATUS[e.id]&&B3_STATUS[e.id].kind==='buff'))) return;
  const first=c.targets[0],L=b3Live(F,a.side).filter(o=>o!==first); if(!L.length) return;
  if(!(a.pep>=n.pep?true:b3Rand(F)<n.chance)) return;
  const to=L[Math.floor(b3Rand(F)*L.length)];
  c.beats.push({t:'passive',src:a.key,id:'tupperware_send_off',name:B3_QUIRKS.tupperware_send_off.name,g:c.g});
  b3RunEffects(F,Object.assign({},c,{targets:[to],tgt:to,hit:[],scale:.5,bounce:true}),S.effects);
}

// ---------- Wet Clay to Stoneware, clay shields and Fired Glaze (spec 3.7, Ceramicist) ----------
// A CLAY shield is one TNB's Ceramicist Skills made (the shield op's `clay:true`). It is an ordinary shield with three extra fields:
//   clay   it is a clay shield (Three-AM Kiln Firing fires every one of these, Trait or not)
//   stone  (Trait on when it was made) the share by which it soaks extra Clobber damage: 20% more than its size
//   glaze  it has been fired into Fired Glaze: it throws `glaze` of every point it soaks back at the monster that hit
// A Sizzle hit on whoever wears a stone clay shield fires it too (b3ClaySizzle). My calls: the firing happens before the shield soaks,
// so that very hit is reflected; the reflection is plain Sizzle damage with none of the attacker's mods in it (like a splash), and it
// never reflects again; a shield made with the Trait off gets no extra soak, and when it is fired by Kiln Firing it reflects the
// Trait's 30% as well (the number is the Trait's, so it is kept in B3_CLAY).
const B3_CLAY={soak:.20,reflect:.30};
function b3ClayBorn(sh,src) {
  sh.clay=true;
  const n=src&&src.custom&&src.custom.wetClay; if(n) sh.stone=n.soak;
}
function b3Vitrify(F,t,sh,c) {
  if(!sh.clay||sh.glaze) return false;
  const src=b3Unit(F,sh.src),n=src&&src.custom&&src.custom.wetClay;
  sh.glaze=n?n.reflect:B3_CLAY.reflect; if(c) c.beats.push({t:'vitrify',tgt:t.key,g:c.g}); return true;
}
// A Sizzle hit aimed at t: its stone clay shields are fired into Fired Glaze before they soak.
function b3ClaySizzle(F,c,t,info) {
  if(!info||info.flavor!=='sizzle') return;
  for(const sh of t.shields) if(sh.clay&&sh.stone!=null) b3Vitrify(F,t,sh,c);
}
// How much damage this shield can soak of this hit: its own size, a stone clay shield soaks Clobber at 1.2 times its size.
const b3ShieldPower=(sh,info)=>sh.clay&&sh.stone&&info&&info.flavor==='clobber'?1+sh.stone:1;
// What a Fired Glaze shield throws back: a share of what it soaked from a monster's hit.
function b3GlazeReflect(F,c,t,sh,soaked,info) {
  const a=c&&c.actor;
  if(!sh.glaze||soaked<=0||(info&&info.reflect)||!a||a.side===t.side||!b3Alive(a)) return;
  const dmg=Math.max(1,Math.round(soaked*sh.glaze));
  b3Hurt(F,c,a,dmg,{src:t.key,flavor:'sizzle',reflect:true});
}
// The row a shield shows in the full list.
function b3ShieldRow(sh,left) {
  const row={name:'Shield',short:'SHIELD',color:'#9fd0ff',kind:'buff',left,desc:'Soaks the next '+Math.round(sh.amt)+' damage before HP.'};
  if(sh.glaze) Object.assign(row,{name:'Fired Glaze',short:'GLAZE',color:'#ffb38a',desc:'A fired clay shield: soaks the next '+Math.round(sh.amt)+' damage, and throws '+Math.round(sh.glaze*100)+'% of what it soaks back at the monster.'});
  else if(sh.clay) Object.assign(row,{name:'Clay Shield',short:'CLAY',color:'#d9a47a',desc:'A clay shield: soaks the next '+Math.round(sh.amt)+' damage'+(sh.stone?', and 20% more of any Clobber hit':'')+'. A Sizzle hit or Three-AM Kiln Firing fires it into Fired Glaze.'});
  return row;
}

// ---------- Grand Amphora Masterpiece (spec 3.7: "a vessel absorbing 2 hits before shattering") ----------
// The vessel is a hazard on the family's floor (B3_HAZARDS.amphora, `vessel:true`). A monster's damaging act that would hit the
// family is soaked whole when a vessel with hits left stands there: no damage, no rider status (the act's `c.soak` is marked so
// b3Soaked is true), one hit used up. My calls: an act is one hit however many family members it was aimed at or times it strikes;
// the burst comes when the last hit is soaked (after the monster's act, as a reaction) or at the start of the round the vessel
// runs out; if its maker is knocked out first, it goes away without bursting.
const B3_VESSEL_BURST=[
  {op:'damage',flavor:['clobber','razzle'],power:'heavy',aoe:true,to:'foes'},
  {op:'composure',n:2,to:'foes'}
];
// Called from b3DamageOp as a monster's damaging act begins. True when the vessel took it.
function b3VesselTake(F,c) {
  const a=c.actor; if(a.side!=='foe') return false;
  const hz=F.hazards.find(h=>h.side==='party'&&B3_HAZARDS[h.id].vessel&&h.uses>0); if(!hz) return false;
  const tg=c.targets.filter(b3Alive); if(!tg.length) return false;
  hz.uses--;
  c.soak=c.soak||{}; for(const t of tg) c.soak[t.key]=(c.soak[t.key]||0)+1;
  // These beats belong to the part of the act after its swing (`post`): the act has no hits to hang them on, and the screen shows `post` as it finishes.
  c.beats.push({t:'vesselSoak',id:hz.id,src:a.key,tgts:tg.map(t=>t.key),left:hz.uses,g:'post'});
  if(hz.uses<=0) { F.hazards.splice(F.hazards.indexOf(hz),1); c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,why:'burst',g:'post'}); b3VesselBurst(F,hz,a); }
  return true;
}
// The vessel breaks: its maker answers as a reaction against `a` (a live monster), which runs after the act that broke it.
function b3VesselBurst(F,hz,a) {
  const u=b3Unit(F,hz.src); if(!u||!b3Alive(u)||!a||!b3Alive(a)) return;
  F.reactions.push({u,L:{effects:B3_VESSEL_BURST,quiet:true},src:a,status:null,name:B3_HAZARDS[hz.id].name,tags:['vessel'],root:{}});
}
// A vessel runs out of rounds (engine/b3-timeline.js b3RoundStart): it breaks the same way, aimed at the first live monster.
function b3VesselExpire(F,hz,beats) {
  const a=b3Live(F,b3Other(b3Unit(F,hz.src)?b3Unit(F,hz.src).side:'party'))[0];
  b3VesselBurst(F,hz,a); b3RunReactions(F,beats);
}
// A maker who is knocked out takes the vessel with them.
function b3VesselOwnerKo(F,c,u) {
  for(const hz of F.hazards.slice()) if(hz.src===u.key&&B3_HAZARDS[hz.id].vessel) { F.hazards.splice(F.hazards.indexOf(hz),1); c.beats.push({t:'hazardEnd',id:hz.id,side:hz.side,why:'ko',g:c.g}); }
}

// ---------- Waymo Tailgate Rescue: the HP rebalance (spec 3.7) ----------
// On a family member who is not knocked out: the family member with the biggest share of their HP left (not the target) gives HP
// until both have the same share of their own Max HP. Nothing happens if nobody has more than the target. The donor keeps 1 HP at least.
function b3Rebalance(F,c,e) {
  for(const t of b3Who(F,c,e.to)) { if(!b3Alive(t)||t.side!==c.actor.side) continue;
    const donors=b3Live(F,t.side).filter(o=>o!==t).sort((x,y)=>y.hp/y.maxHp-x.hp/x.maxHp||x.slot-y.slot),d=donors[0];
    if(!d||d.hp/d.maxHp<=t.hp/t.maxHp) continue;
    const x=Math.min(d.hp-1,Math.round((d.hp*t.maxHp-t.hp*d.maxHp)/(d.maxHp+t.maxHp)));
    if(x<=0) continue;
    d.hp-=x; t.hp=Math.min(t.maxHp,t.hp+x);
    c.beats.push({t:'rebalance',src:d.key,tgt:t.key,n:x,hpSrc:d.hp,hp:t.hp,g:c.g}); }
}

// ---------- Baxter Hill Longboard Express: doubling the E-Bike (spec 3.7) ----------
// Every carrier of the status `e.id` on the chosen side has its numbers doubled (`mult` 2, read by b3Mods) and its length set to
// at least e.n turns. Doubling twice does not double it again.
function b3DoubleBuff(F,c,e) {
  for(const t of b3Who(F,c,e.to)) { const s=t.st[e.id]; if(!s||!b3Alive(t)) continue;
    s.mult=2; s.n=Math.max(s.n,e.n||s.n); c.beats.push({t:'status',tgt:t.key,id:e.id,g:c.g}); }
}

// ---------- Demo-Day Prybar (spec 3.9: "Rips through shields/guards, blasting broken barrier value as splash damage") ----------
// Justin's standard Clobber hit on one monster, in three steps (my calls where the spec is silent):
//   1. Every shield and every stance on the monster is ripped off BEFORE the hit, so nothing soaks or softens it. Each shield that goes
//      is a broken shield for anything that listens ('shieldBroken': the Store-Bought Bread quirk).
//   2. The hit lands.
//   3. The barrier's value blasts into the monsters standing next to it as Clobber splash: a shield is worth what it had left, a stance
//      is worth 25% of the damage the hit did. No barrier, no blast.
function b3Prybar(F,c,e) {
  const t=c.targets[0]; if(!t||!b3Alive(t)) return;
  let barrier=0,stances=0;
  const shields=t.shields.slice();
  for(const x of shields) barrier+=x.amt;
  t.shields=[];
  for(const id of Object.keys(t.st)) if(B3_STATUS[id].kind==='stance') { stances++; b3EndStatus(F,t,id,'strip'); c.beats.push({t:'statusEnd',tgt:t.key,id,why:'strip',g:c.g}); }
  for(const x of shields) { c.beats.push({t:'shieldBroken',tgt:t.key,g:c.g}); b3Fire(F,'shieldBroken',{src:c.actor,tgt:t,by:x.src,g:c.g,c},c.beats); }
  b3DamageOp(F,c,{});
  c.lost=c.lost||{}; c.soak=c.soak||{};
  const dealt=(c.lost[t.key]||0)+(c.soak[t.key]||0),value=barrier+stances*.25*dealt;
  if(!(value>0)||!b3Alive(t)&&!b3Adjacent(F,t).length) return;
  B3_OPS.splash(F,Object.assign({},c,{partDmg:value,tgt:t}),{flavor:'clobber',share:1,to:'adjacent'});
}
