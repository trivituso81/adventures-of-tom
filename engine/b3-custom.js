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
  tapCard:'TNB, Longboarder, Quirk A: the buffs he puts on last longer (engine/b3-ops.js b3PutStatus)'
};

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
  return n&&c&&c.actor===a&&c.skill&&(c.skill.hits||1)>1?n.share:0;
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
