'use strict';
// engine/b3-custom.js — Battle 3 one-offs: the few kit lines the ops, hooks and conditions cannot say as data (architecture
// section 2.1; the list of such lines is claude/battle-kit-ops.md). RULES FILE: no drawing, no page, no timers.
// A Trait or Quirk row switches one on with `custom:'<name>'` and keeps its numbers in the row's `n`; a unit carries them in
// `custom` ({name: numbers}). B3_CUSTOM lists every one-off this file knows, so the data check can catch a misspelt name.
const B3_CUSTOM={
  twinLambRelay:'Rose, Sugar Rush, Quirk A: riders are held for the later hits of a multi-hit move, at a share of their strength'
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
