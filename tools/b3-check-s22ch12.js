// tools/b3-check-s22ch12.js — Battle 3 checks for stage 22, chapter 12 (Tom's street, Los Angeles) on Battle 3: Gridlock Prime and the Gridlock it calls.
// Data: data/b3-foes-ch12.js, the Four-Way Red Light statuses at the end of data/b3-status.js, data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new70).
// The page side (the real scenes on screen, tips shown, victory card) is tools/ch12_b3_test.py.
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),live=G('b3Live'),pick=G('b3FoePick');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

  // 1. The switch, the floor, the numbers
  ok(S.chapters.includes(12)&&J(S.chapters.slice(0,12))===J([1,2,3,4,5,6,7,8,9,10,11,12]),'chapter 12 is on Battle 3 in order after chapter 11 (found '+J(S.chapters)+')');
  ok(S.levelFloor[12]===30,'chapter 12 floors the Character Level at the bestiary baseline, 30 (found '+S.levelFloor[12]+')');
  const NUM={gridlockprime:[1860,125,60,113,'boss','front'],gridlockhelper:[713,110,55,105,'bruiser','front']};
  for(const id in NUM) { const D=FOES[id],n=NUM[id];
    ok(D&&D.ch===12&&D.hp===n[0]&&D.atk===n[1]&&D.def===n[2]&&D.spd===n[3]&&D.role===n[4]&&D.row===n[5],id+' has the bestiary stat line (HP, Atk, Def, Spd, role, row)'); }
  const P=FOES.gridlockprime;
  ok(P.hp3===1400&&P.pips===7&&P.noRun&&J(P.peeves)==='["drench","racket"]'&&!P.resists.length,'Gridlock Prime: HP 1860 (1400 for three), 7 pips, no running, Pet Peeves Drench and Racket, resists nothing');
  ok(FOES.gridlockhelper.hp3===357,'the Gridlock it calls: HP 713 with four, 357 with three');
  ok(FORMS.gridlockprime.vp===45&&J(FORMS.gridlockprime.foes)===J([{id:'gridlockprime',row:'front'}]),'Gridlock Prime is one fight alone in Front, paying 45 Vibe Points');
  ok(LAB.some(l=>l.id==='new70'&&l.level===30&&l.formation==='gridlockprime'),'the Lab has the chapter 12 boss (new70) at level 30');
  // 2. The scene: the fight chapter 12 starts has a formation and tips
  const steps=[...read('data/scenes-ch12.js').matchAll(/battle:'([a-z]+)',tut:'([a-zA-Z0-9]+)'/g)].map(m=>({id:m[1],tut:m[2]}));
  ok(J(steps.map(s=>s.id))===J(['gridlockprime'])&&steps.every(s=>FORMS[s.id]&&S.tips[s.tut]),'chapter 12 scenes start Gridlock Prime, which has a formation and tips (found '+J(steps)+')');
  ok(read('data/scenes-ch12.js').includes('B3_CH_ON(12)'),'the chapter 12 scenes have Battle 3 wording behind B3_CH_ON(12)');
  // 3. Four-Way Red Light: a 30% Guard Stance plus +30% Def and +25% Atk; the Def buff is the heaviest, so Fact-Check turns that one
  ok(ST.four_way_red_light.kind==='stance'&&ST.four_way_red_light.mods[0].v===.30&&ST.four_way_red_light.dur.n===2,'Four-Way Red Light is a 2 turn Guard Stance at 30% less damage');
  ok(ST.red_light_def.kind==='buff'&&ST.red_light_def.mods[0].stat==='def'&&ST.red_light_def.mods[0].v===.30&&ST.red_light_atk.kind==='buff'&&ST.red_light_atk.mods[0].stat==='atk'&&ST.red_light_atk.mods[0].v===.25,'+30% Defense and +25% Attack buffs');
  ok(ST.red_light_def.weight>ST.red_light_atk.weight&&ST.red_light_def.weight>ST.four_way_red_light.weight,'the Defense buff is the heaviest, so the Fact-Check turns that one');
  const mk=(party)=>{ const F=NF({party:party||['tom','grace','rose','amy'],level:30,formation:'gridlockprime',seed:11});
    F.party.forEach(p=>{ p.hp=p.maxHp=99999; }); F.foes[0].hp=F.foes[0].maxHp=1000000; return F; };
  const act=(F,id)=>{ const e=F.foes[0]; e.force=id; F.acting=e; return foeTurn(F,e); };
  { const F=mk(),e=F.foes[0]; ok(live(F,'foe').length===1,'Gridlock Prime starts alone (it calls the Gridlock itself)');
    const p=pick(F,e,true); ok(p&&p.act.id==='gridlocked_first','above half HP its first turn is the Four-Way Red Light');
    const beats=act(F,'gridlocked_first');
    ok(e.st.four_way_red_light&&e.st.red_light_def&&e.st.red_light_atk,'Four-Way Red Light puts the stance, the Defense buff and the Attack buff on it');
    const called=beats.filter(b=>b.t==='summon'); ok(called.length===1&&called[0].id==='gridlockhelper'&&called[0].hp===713,'the first Four-Way Red Light calls 1 Gridlock at 713 HP');
    const q=pick(F,e,true); ok(!q||q.act.id!=='gridlocked_first','the above-half call is used once'); }
  { const F=mk(),e=F.foes[0]; e.uses.gridlocked_first=1; e.hp=Math.round(e.maxHp*.45); const q=pick(F,e,true);
    ok(q&&q.act.id==='gridlocked_second','below half HP it puts the light up again');
    const beats=act(F,'gridlocked_second'); ok(beats.filter(b=>b.t==='summon').length===1,'the second one calls 1 Gridlock too');
    e.uses.gridlocked_second=1; const q2=pick(F,e,true); ok(!q2||!/gridlocked/.test(q2.act.id)||q2.act.id==='gridlocked_intersection','it calls nobody a third time'); }
  { const F=mk(['tom','grace','rose']),beats=act(F,'gridlocked_first'),c=beats.filter(b=>b.t==='summon'); ok(c.length===1&&c[0].hp===357,'with three in the party the called Gridlock has 357 HP'); }
  { const F=mk(),e=F.foes[0],beats=act(F,'gridlocked_intersection'); ok(!beats.some(b=>b.t==='summon')&&e.st.four_way_red_light,'the repeat Four-Way Red Light calls nobody'); }
  // 4. Exhaust Heatwave leaves it Toasty too; No-Signal Merge slows; Total Gridlock is a charged sweep below half HP
  { const F=mk(),e=F.foes[0]; act(F,'exhaust_heatwave'); ok(e.st.toasty&&F.party.every(p=>p.st.toasty),'Exhaust Heatwave leaves the family and Gridlock Prime Toasty'); }
  { const F=mk(); act(F,'no_signal_merge'); ok(F.party.some(p=>p.st.slow&&p.st.slow.n===2),'No-Signal Merge slows its target for 2 turns'); }
  { const F=mk(),e=F.foes[0]; e.uses.gridlocked_first=1; e.uses.gridlocked_second=1; e.hp=Math.round(e.maxHp*.45); const A=P.acts.find(a=>a.id==='total_gridlock');
    ok(A.power===1.35&&A.recovery===120&&A.hits==='all'&&A.tags.includes('charge_up')&&A.when.hpBelow===.5,'Total Gridlock: 1.35x party-wide charged sweep below half HP');
    act(F,'total_gridlock'); ok(e.charge&&e.charge.id==='total_gridlock','Total Gridlock is wound up (charged) before it lands'); }
};
