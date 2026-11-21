'use strict';
// engine/b3-script.js — Battle 3 scripted fights (stage 18 bonus, build b3s18bonusa): the few things a story fight needs that a plain
// formation does not have. They are all DATA the fight carries in `cfg.setup` (the story's rows are B3_STORY.setup in data/b3-story.js,
// keyed by the scene step's `tut`); nothing here is written for one scene. RULES FILE: no drawing, no page, no timers.
//
//   setup.foeHp     {<foe id>: share}   that monster starts at this share of its Max HP (a boss whose second phase begins at half HP).
//   setup.start     {<member id>: [{id, n}]}   statuses a family member begins the fight with (Grace's Birthday Sash). The story layer
//                   decides who qualifies from the game's items; the rules only apply what they are given. n is turns.
//   setup.midpoint  {foe, at, hold, result, steps, word, line}   a scripted end. `at` is the share of Max HP; the first time that monster
//                   (`foe`) begins a turn at or below it, `steps` play, F.over becomes `result` ('flee' or 'shell', anything but win or
//                   lose) and the fight stops. `hold` is a floor under its HP for the whole fight (damage cannot take it lower), so the
//                   midpoint is reached and the monster is never knocked out first. `word` and `line` are what the end screen says.
//                   Steps: {say, word?, color?, sfx?}  a line on the message line (and a big word);
//                          {status:{id, to:<member id>, n}}  a status on a family member;
//                          {hurt:{to:'party', pct, leave, flavor}}  every live family member loses pct of Max HP, never below `leave`
//                          (a shield does not soak it: it is the cold, not a hit).
//   setup.adds      {foe, id, row, first, every, maxLive, hp?}   while `foe` is up, at the start of round `first` and every `every` rounds
//                   after it, monsters `id` skitter in (Brain Freeze's Sprinkle Gremlins out of the freezer), as many as bring the live
//                   ones of that id up to `maxLive`, at the adds' usual half HP and 0 pips. A full row takes none.
//
// Beats it writes: {t:'script', text, word, color, sfx, g}  (a line the play layer says), plus the ordinary status, hit and summon beats.

// ---------- As the fight is built ----------
// Called last by b3NewFight. HP shares, the monster's HP floor, and the statuses a family member begins with.
function b3SetupStart(F) {
  const S=F.cfg.setup; if(!S) return;
  for(const id in (S.foeHp||{})) { const f=F.foes.find(x=>x.id===id); if(f) f.hp=Math.max(1,Math.round(f.maxHp*S.foeHp[id])); }
  const M=S.midpoint;
  if(M&&M.hold!=null) { const f=F.foes.find(x=>x.id===M.foe); if(f) f.hpFloor=Math.round(f.maxHp*M.hold); }
  for(const id in (S.start||{})) { const u=F.party.find(p=>p.id===id); if(!u) continue;
    for(const s of S.start[id]) { b3AddStatus(F,u,s.id,{src:u,n:s.n}); (F.opening||(F.opening=[])).push({t:'status',tgt:u.key,id:s.id,g:'pre'}); } }
}

// ---------- A monster's turn begins: has the scripted end come? ----------
// Returns true when the fight ended here (the caller returns the beats and plays no act).
function b3ScriptTurn(F,e,beats) {
  const S=F.cfg.setup,M=S&&S.midpoint;
  if(!M||F.over||F.scriptDone||e.id!==M.foe||!b3Alive(e)||!(e.hp<=e.maxHp*M.at+1e-9)) return false;
  F.scriptDone=true;
  const c={F,actor:e,src:e,skill:null,tgt:null,targets:[],hit:[],beats,g:'pre',detonated:{},reacted:{},tags:['script'],outExtra:{},ledger:{}};
  for(const st of M.steps) {
    if(st.say) beats.push({t:'script',text:st.say,word:st.word||null,color:st.color||null,sfx:st.sfx||null,g:'pre'});
    if(st.status) { const u=F.party.find(p=>p.id===st.status.to); if(b3Alive(u)) { b3AddStatus(F,u,st.status.id,{src:e,n:st.status.n}); beats.push({t:'status',tgt:u.key,id:st.status.id,g:'pre'}); } }
    if(st.hurt) for(const u of b3Live(F,'party')) {
      const d=Math.min(Math.round(u.maxHp*st.hurt.pct),u.hp-(st.hurt.leave==null?1:st.hurt.leave)); if(d>0) b3Hurt(F,c,u,d,{src:e.key,flavor:st.hurt.flavor||'drench',pierce:true}); }
  }
  F.endWord=M.word||null; F.endLine=M.line||null;
  F.over=b3CheckOver(F)||M.result;   // the cold never knocks anyone out (`leave`), so this is the scripted result
  F.acting=null;
  b3OverBeats(F,beats,'pre');
  return true;
}

// ---------- A round begins: adds out of the freezer ----------
// Called by b3RoundStart after the round's own bookkeeping. `offset` is how far the divider is ahead of the clock: the newcomer waits from the divider, not from now.
function b3ScriptRound(F,beats) {
  const S=F.cfg.setup,A=S&&S.adds; if(!A||F.over||F.round<A.first||(F.round-A.first)%A.every!==0) return;
  const owner=F.foes.find(x=>x.id===A.foe&&b3Alive(x)); if(!owner) return;
  const live=()=>F.foes.filter(x=>x.id===A.id&&b3Alive(x)).length,offset=Math.max(0,(F.round-1)*B3_RULES.round-F.clock);
  while(live()<A.maxLive) { const u=b3Summon(F,A.id,A.row,A.hp); if(!u) break;
    u.addedBy=owner.key; u.addedTurn=owner.turns; u.wait+=offset;
    beats.push({t:'summon',src:owner.key,tgt:u.key,id:u.id,name:u.name,row:u.row,hp:u.hp,bar:b3BarSnap(F,null,0)}); }
}
