// tools/b3-check-s22.js — Battle 3 checks for stage 22a, chapter 11 (the Endless Concourse of Terminal Infinity) on Battle 3.
// Data: data/b3-foes-ch11.js, the Stage 22 statuses at the end of data/b3-status.js, data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new67 to new69).
// New pieces it covers: the foe `hits:'front_back'` target mode and the `tradeRows` op (FINAL CALL's Gate Change), the once-at-60% Rebooking Stampede
// with its follow-up sweep, and Lost Luggage called to the Front. It also holds the guard for the 30 Traits and 60 Quirks (stage 22b): every one is data,
// none is a name only. The page side (the real scenes on screen, tips shown, victory card, Vibe Points) is tools/ch11_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for stage 21.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),effRow=G('b3EffRow'),live=G('b3Live'),VIBES=G('B3_VIBES'),TRAITS=G('B3_TRAITS'),QUIRKS=G('B3_QUIRKS'),SOON=G('B3_SOON');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

  // 1. The switch, the floor, the numbers
  ok(J(S.chapters)===J([1,2,3,4,5,6,7,8,9,10,11,21]),'chapter 11 is on Battle 3 in order after chapter 10 (found '+J(S.chapters)+')');
  ok(S.levelFloor[11]===27,'chapter 11 floors the Character Level at the bestiary baseline, 27 (found '+S.levelFloor[11]+')');
  const NUM={lostluggage:[638,101,51,105,'bruiser','front'],redeye:[472,87,44,116,'hexer','back'],standbysprite:[999,106,61,99,'elite','front'],finalcall:[1670,115,56,112,'boss','front']};
  for(const id in NUM) { const D=FOES[id],n=NUM[id];
    ok(D&&D.ch===11&&D.hp===n[0]&&D.atk===n[1]&&D.def===n[2]&&D.spd===n[3]&&D.role===n[4]&&D.row===n[5],id+' has the bestiary stat line (HP, Atk, Def, Spd, role, row)'); }
  ok(FOES.finalcall.hp3===1250&&FOES.finalcall.pips===7&&FOES.finalcall.noRun&&J(FOES.finalcall.peeves)==='["razzle","racket"]'&&J(FOES.finalcall.resists)==='["clobber"]','FINAL CALL: HP 1670 (1250 for three), 7 pips, no running, hates Razzle and Racket, shrugs off Clobber');
  ok(FOES.standbysprite.pips===4&&J(FOES.standbysprite.start)==='["podium_counter"]'&&J(FOES.standbysprite.peeves)==='["drench","clobber"]','the Standby Sprite: 4 pips, starts behind the podium, hates Drench and Clobber');
  ok(J(FOES.redeye.resists)==='["racket"]'&&J(FOES.lostluggage.peeves)==='["clobber","racket"]','Red-Eye shrugs off Racket; Lost Luggage hates Clobber and Racket');
  ok(FORMS.finalcall.vp===30&&FORMS.standbysprite.vp===10&&FORMS.lostluggage.vp===10&&FORMS.redeye.vp===10,'Vibe Points: 10 for each normal fight, 30 for FINAL CALL');
  ok(J(FORMS.lostluggage.foes)===J([{id:'lostluggage',row:'front'},{id:'redeye',row:'back'}])&&J(FORMS.redeye.foes)===J(FORMS.lostluggage.foes),'`lostluggage` and `redeye` are one fight: Lost Luggage in Front, Red-Eye in Back');
  ok(J(FORMS.standbysprite.foes)===J([{id:'standbysprite',row:'front'},{id:'redeye',row:'back'}]),'the Standby Sprite fights with a Red-Eye in Back');
  for(const id of ['rummaged','seat_seventeen','podium_counter','stampede']) ok(ST[id]&&ST[id].desc&&ST[id].short&&!/—/.test(ST[id].desc),id+' is a status row with words');
  ok(ST.podium_counter.kind==='stance'&&ST.stampede.kind==='buff'&&ST.stampede.mods[0].v===.2,'Podium Counter is a Guard Stance row and Rebooking Stampede is a +20% Speed buff');
  ok(['new67','new68','new69'].every(id=>LAB.some(l=>l.id===id&&l.level===27&&l.bg==='infinity')),'the Lab has the three chapter 11 fights at level 27 on the infinity background');

  // 2. The scenes: every fight chapter 11 starts has a Battle 3 fight and tips, every concourse monster has a formation, and the chapter pays 90
  const sc=read('data/scenes-p2.js'),steps=[...sc.matchAll(/\{battle:'([a-z0-9]+)',tut:'([a-z0-9]+)'/g)].map(m=>({id:m[1],tut:m[2]}));
  const mine=steps.filter(s=>FOES[s.id]&&FOES[s.id].ch===11);
  ok(J(mine.map(s=>s.id))===J(['standbysprite','finalcall']),'chapter 11 scenes start the Standby Sprite and FINAL CALL (found '+J(mine.map(s=>s.id))+')');
  for(const s of mine) { ok(Array.isArray(S.tips[s.tut])&&S.tips[s.tut].length>=2,s.id+' has at least two tips under the key '+s.tut);
    for(const t of S.tips[s.tut]) ok(t.text.length<=240&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|PEP TALK|LET IT FLY|BENCH CALL|▼ Bag|CANCELLED is coming/.test(t.text),s.tut+' tip '+t.id+' is short and has no Battle 2 word'); }
  const spots=(read('data/p2-monsters.js').match(/const P2_CONCOURSE_SPOTS=\[(.*)\];/)||[])[1]||'',ids=[...spots.matchAll(/\['([a-z0-9]+)'/g)].map(m=>m[1]);
  ok(ids.length===7&&ids.every(i=>FOES[i]&&FORMS[i]),'every monster standing in the concourse has a formation ('+J(ids)+')');
  const normal=ids.filter(i=>i!=='finalcall');
  ok(normal.length===6&&normal.reduce((a,i)=>a+FORMS[i].vp,0)+FORMS.finalcall.vp===90,'six normal fights at 10 and FINAL CALL at 30 pay the chapter\'s 90');

  // 3. Gate Change: 1 Front and 1 Back ally trade rows, both are pushed, FINAL CALL is Dazzled; with one row empty nobody changes row
  const mk=(rows)=>{ const F=NF({party:['tom','grace','rose','amy'],level:27,formation:'finalcall',seed:11});
    F.party.forEach((p,i)=>{ p.row=rows[i]; p.hp=p.maxHp=99999; }); F.foes[0].hp=F.foes[0].maxHp=999999; return F; };
  const act=(F,id)=>{ const e=F.foes[0]; e.force=id; F.acting=e; return foeTurn(F,e); };
  { const F=mk(['front','back','front','back']),before=F.party.map(p=>b3Row(F,p)),beats=act(F,'gate_change'),tr=beats.filter(b=>b.t==='rowTrade');
    ok(tr.length===1,'Gate Change trades rows once (one rowTrade beat)');
    const a=F.party.find(p=>p.key===tr[0].a),b=F.party.find(p=>p.key===tr[0].b);
    ok(a&&b&&before[F.party.indexOf(a)]!==before[F.party.indexOf(b)],'the two it traded stood in different rows before');
    ok(b3Row(F,a)===before[F.party.indexOf(b)]&&b3Row(F,b)===before[F.party.indexOf(a)],'the two rows were swapped');
    ok(F.party.some(p=>p.row!=='back'),'somebody still stands in Front');
    ok(beats.filter(x=>x.t==='push').length===2,'both allies were pushed (20 ticks each)');
    ok(F.foes[0].st.dazzled&&F.foes[0].st.dazzled.n===1,'FINAL CALL is left Dazzled (1 turn) by its own Gate Change'); }
  { const F=mk(['front','front','front','front']),rows=F.party.map(p=>p.row),beats=act(F,'gate_change');
    ok(!beats.some(b=>b.t==='rowTrade')&&J(F.party.map(p=>p.row))===J(rows),'with nobody in Back, Gate Change changes no row');
    ok(beats.filter(b=>b.t==='push').length===2&&F.foes[0].st.dazzled,'with nobody in Back it still pushes two allies and Dazzles itself'); }
  { let single=0; for(let s=1;s<=30;s++) { const F=mk(['front','back','back','front']); F.seed=s; F.rng=undefined; const beats=act(F,'gate_change');
      const hit=beats.filter(b=>b.t==='hit').map(b=>b.tgt); if(new Set(hit).size===2) single++; }
    ok(single>=1,'Gate Change hits two different allies'); }

  // 4. Rebooking Stampede: once at 60% HP, calls Lost Luggage to the Front, speeds every monster, and the sweep lands on the next turn
  { const F=mk(['front','back','front','back']),e=F.foes[0]; e.hp=Math.round(e.maxHp*.55);
    const beats=act(F,'rebooking_stampede'),called=beats.filter(b=>b.t==='summon');
    ok(called.length>=1&&called.length<=2&&called.every(b=>b.id==='lostluggage'&&b.row==='front'),'Rebooking Stampede calls 1 or 2 Lost Luggage to the Front ('+called.length+')');
    ok(live(F,'foe').filter(f=>f.row!=='back').length<=3,'the Front row holds three at most');
    ok(live(F,'foe').every(f=>f.st.stampede),'every monster has the +20% Speed buff');
    ok(e.charge&&e.charge.id==='stampede_sweep','its next turn is the party-wide floor sweep');
    const p=G('b3FoePick')(F,e); ok(p.act.id==='stampede_sweep'&&p.fire,'the sweep is picked next and fires');
    // the sweep and the once-only rule: after the sweep it does not call again
    e.force=null; e.charge=null; e.uses.rebooking_stampede=1; const q=G('b3FoePick')(F,e,true); ok(q&&q.act.id!=='rebooking_stampede'&&q.act.id!=='stampede_sweep','Rebooking Stampede is used once; the sweep is never picked from the list'); }
  { const F=mk(['front','back','front','back']),e=F.foes[0],q=G('b3FoePick')(F,e,true); ok(q.act.id!=='rebooking_stampede','above 60% HP it does not call Lost Luggage');
    e.hp=Math.round(e.maxHp*.58); const q2=G('b3FoePick')(F,e,true); ok(q2.act.id==='rebooking_stampede','at 60% HP or below the call comes first'); }
  { const F=mk(['front','back','front','back']),e=F.foes[0]; e.hp=Math.round(e.maxHp*.45); e.actIx=e.D.acts.findIndex(a=>a.id==='all_flights_cancelled');
    act(F,'all_flights_cancelled'); const beats=act(F,'all_flights_cancelled'); ok(beats.some(b=>b.t==='pep')&&F.party.every(p=>p.st.fatigue),'ALL FLIGHTS CANCELLED takes a Pep and tires everyone'); }

  // 5. Stage 22b: the 30 Traits and 60 Quirks are all data and all written (the rebuild of stages 5, 9, 10 and 19 to 21; battle2-traits.js is the old one, deleted in stage 23)
  ok(Object.keys(VIBES).length===30&&Object.keys(TRAITS).length===30&&Object.keys(QUIRKS).length===60,'30 Vibes, 30 Traits and 60 Quirks as data ('+Object.keys(VIBES).length+', '+Object.keys(TRAITS).length+', '+Object.keys(QUIRKS).length+')');
  ok(!Object.values(TRAITS).some(t=>t.soon)&&!Object.values(QUIRKS).some(q=>q.soon)&&!Object.keys(SOON).some(k=>Object.values(VIBES).some(v=>v.skills.includes(k))),'none of the 30 Traits, 60 Quirks or 90 Skills is still a name only');
  const RULE=['on','listen','mods','counter','custom','allyMods','effects','viaVibe','shieldMods'];
  const bare=[...Object.values(TRAITS),...Object.values(QUIRKS)].filter(r=>!RULE.some(k=>r[k])).map(r=>r.id);
  ok(!bare.length,'every Trait and Quirk carries a rule of some kind ('+J(bare)+')');
  ok(Object.values(VIBES).every(v=>TRAITS[v.trait]&&v.quirks.length===2&&v.quirks.every(q=>QUIRKS[q])),'every Vibe names one Trait row and two Quirk rows that exist');
  // Battle 3 does not read the old Traits file: no top-level name of engine/battle2-traits.js appears in any engine/b3-*.js or data/b3-*.js, so stage 23 can delete it.
  const oldNames=[...new Set([...read('engine/battle2-traits.js').matchAll(/^(?:function|const|let|var)\s+([A-Za-z0-9_$]+)/gm)].map(m=>m[1]))];
  const b3files=[...fs.readdirSync(path.join(ROOT,'engine')).filter(f=>/^b3-.*\.js$/.test(f)).map(f=>'engine/'+f),...fs.readdirSync(path.join(ROOT,'data')).filter(f=>/^b3-.*\.js$/.test(f)).map(f=>'data/'+f)];
  const leaks=[]; for(const f of b3files) { const t=read(f); for(const n of oldNames) if(new RegExp('(^|[^A-Za-z0-9_$])'+n.replace(/\$/g,'\\$')+'([^A-Za-z0-9_$]|$)').test(t)) leaks.push(f+':'+n); }
  ok(oldNames.length>=10&&!leaks.length,'no Battle 3 file uses a name from engine/battle2-traits.js ('+oldNames.length+' names looked for; found '+J(leaks)+')');
  function b3Row(F,u) { return effRow(F,u); }
};
