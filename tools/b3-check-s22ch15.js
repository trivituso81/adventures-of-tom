// tools/b3-check-s22ch15.js — Battle 3 checks for stage 22, chapter 15 (the family dinner: HUSH-9 Final Form, the bestiary's Windowsill Radio, and its Hushling pods).
// Data: data/b3-foes-ch15.js, data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new87). Written from tools/b3-check-s22ch13.js.
// Rules it leans on, all built earlier: helper feedback aimed at the Boss on the helper's side (the target `allyBoss`, chapter 13), the act conditions `once`, `hpBelow`, `waitRounds`
// and `notSameAllyTurns`, and the `summon` op. New in this chapter: only the layout field `helpers` (engine/b3-play.js), which changes no number.
// The page side (the real scene on screen, tips shown, victory card, Vibe Points) is tools/ch15_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 14.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick'),taken=G('b3TakenMult');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','grace','rose','amy'];

  // 1. The switch, the floor, the numbers
  ok(S.chapters.includes(15)&&S.chapters.indexOf(15)<S.chapters.indexOf(21),'chapter 15 is on Battle 3 (found '+J(S.chapters)+')');
  ok(S.levelFloor[15]===37&&S.levelFloor.length>=16,'chapter 15 floors the Character Level at the bestiary baseline, 37 (found '+S.levelFloor[15]+')');
  const R=FOES.hush9final,D=FOES.hushpod;
  // Bestiary entry 72: Atk 163, Def 71, Spd 118, 7 pips, Front, no running, Racket and Clobber hated, Razzle resisted. HP is the one number the simulator moved (3,300 and 2,478 for three, printed 2,490 and 1,870).
  ok(R&&R.ch===15&&R.hp===3300&&R.hp3===2478&&R.atk===163&&R.def===71&&R.spd===118&&R.pips===7&&R.role==='boss'&&R.row==='front'&&R.noRun,'HUSH-9 has the bestiary stat line: Atk 163, Def 71, Spd 118, 7 pips, Front, no running (HP 3300, 2478 for three: raised from the printed 2490 and 1870 by the simulator)');
  ok(J(R.peeves)==='["racket","clobber"]'&&J(R.resists)==='["razzle"]','HUSH-9 hates Racket and Clobber and shrugs off Razzle');
  ok(D&&D.ch===15&&D.hp===366&&D.atk===124&&D.def===56&&D.spd===122&&D.pips===0&&D.role==='helper'&&D.row==='back'&&!D.drop,'a Hushling Pod is the chapter 15 helper line: 366 HP, Atk 124, Def 56, Spd 122, 0 pips, Back, no drop');
  ok(J(D.peeves)==='["racket","clobber"]'&&J(D.acts.map(a=>a.id))==='["static_drift","tinny_shush","dead_channel_hum"]','a pod hates Racket and Clobber and uses the Hushling’s three acts');
  ok(J(D.onKo)===J([{op:'composure',n:1,to:'allyBoss'},{op:'status',id:'dazzled',n:2,to:'allyBoss'}]),'a pod’s feedback is 1 pip and Dazzled (2 turns)');
  ok(J(R.acts.map(a=>a.id))==='["squelch_knob","cabinet_thump","mute_button","dead_air","dead_air_calls","total_silence"]','HUSH-9’s acts: Squelch Knob, Cabinet Thump, Mute Button, Dead Air (and its once-only calling twin), Total Silence');
  ok(FORMS.hush9final.vp===90&&J(FORMS.hush9final.foes)===J([{id:'hush9final',row:'front'},{id:'hushpod',row:'back'},{id:'hushpod',row:'back'}]),'the formation is HUSH-9 in Front with two pods in Back and pays the chapter’s 90 Vibe Points');
  ok(LAB.some(l=>l.id==='new87'&&l.level===37&&l.formation==='hush9final'&&J(l.party)===J(P)&&l.bg==='dinner'),'the Lab has the chapter 15 fight at level 37 with Tom, Grace, Rose and Amy');
  ok(!/—/.test(read('data/b3-foes-ch15.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 2. The scene: one fight, tips under ch15, Battle 3 wording, no Battle 2 word
  const sc=read('data/scenes-ch15.js');
  ok(/tut:'ch15'/.test(sc)&&/monster:'hush9final'/.test(sc)&&(sc.match(/\{battle:/g)||[]).length===1,'chapter 15 scenes start one fight, HUSH-9 (tut ch15)');
  ok(Array.isArray(S.tips.ch15)&&S.tips.ch15.length>=5,'tips under the key ch15 (at least five)');
  for(const t of S.tips.ch15) ok(t.text.length<=240&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|BENCH CALL|PULL UP A CHAIR/.test(t.text),'ch15 tip '+t.id+' is short, has no dash and no Battle 2 word');
  ok(/B3_CH_ON\(15\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(15\)[^\n]*/g).join('')),'chapter 15 has Battle 3 wording variants in its scenes');

  // 3. The pods: feedback when one falls, and no damage reduction from them (the bestiary prints none)
  SK.t15_hit={id:'t15_hit',vibe:'tom_flier',slot:'s1',name:'Test hit',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mk=o=>{ const F=NF(Object.assign({party:P,level:37,formation:'hush9final',seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,9000); p.pep=4; }
    for(const f of F.foes) { f.hp=f.maxHp=99999; f.peeves=[]; f.resists=[]; } return F; };
  const boss=F=>F.foes.find(f=>f.D.role==='boss'),pods=F=>F.foes.filter(f=>f.id==='hushpod'&&!f.ko&&f.hp>0),tomOf=F=>F.party.find(p=>p.id==='tom');
  { const F=mk(),w=boss(F);
    ok(w.id==='hush9final'&&pods(F).length===2&&pods(F).every(p=>p.row==='back'),'the fight starts with HUSH-9 in Front and two pods in Back');
    ok(pods(F).every(p=>p.name.startsWith('Hushling Pod')),'the two pods are told apart by a letter (A, B)');
    ok(near(taken(w,0,{F}),1,1e-9),'with both pods standing HUSH-9 takes full damage: no helper reduction');
    const P3=NF({party:['tom','grace','rose'],level:37,formation:'hush9final',seed:3}); ok(boss(P3).maxHp===2478&&pods(P3).every(p=>p.maxHp===366),'with three in the party HUSH-9 has 2478 HP and a pod still has 366'); }
  noCrit(()=>{ const F=mk(),w=boss(F),r=pods(F)[0],t=tomOf(F); r.hp=1; const hp0=w.hp,pips0=w.pips; go(F,t,'t15_hit',r.key);
    ok(r.ko,'the family knocks a pod out');
    ok(w.pips===pips0-1,'HUSH-9 loses 1 Composure pip: '+pips0+' to '+w.pips);
    ok(w.st.dazzled&&w.st.dazzled.n===2,'and is left Dazzled for 2 turns');
    ok(w.hp===hp0,'no HP is lost to the feedback');
    ok(pods(F).length===1,'the other pod still stands'); });
  noCrit(()=>{ const F=mk(),w=boss(F),[a,b]=pods(F),t=tomOf(F),c0={F,actor:t,src:t,beats:[],g:'a',targets:[w],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    G('b3Pips')(c0,w,2); a.hp=1; G('b3Pips')(c0,w,2); G('b3PayLedger')(F,c0); ok(w.pips===7-3,'the 3-pip cap holds when feedback pips and hit pips land in one action ('+w.pips+')'); });

  // 4. Calling the pods back: once, at 50% HP, up to the two places of the Back row
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.6); w.actIx=w.D.acts.findIndex(a=>a.id==='dead_air');
    const q=pick(F,w,true); ok(q&&q.act.id!=='dead_air_calls'&&q.act.id!=='total_silence','above 50% HP HUSH-9 neither calls the pods back nor winds up Total Silence');
    for(const p of pods(F)) { p.ko=true; p.hp=0; }
    w.hp=Math.round(w.maxHp*.45); const q2=pick(F,w,true); ok(q2.act.id==='dead_air_calls'&&q2.act.tags.includes('charge_up'),'at 50% HP or below the calling Dead Air comes first, and it is a wind-up');
    F.acting=w; const b0=foeTurn(F,w); ok(b0.some(b=>b.t==='telegraph')&&w.charge&&w.charge.id==='dead_air_calls'&&pods(F).length===0,'announced a turn ahead: nobody is called yet');
    F.acting=w; const b1=foeTurn(F,w),called=b1.filter(b=>b.t==='summon');
    ok(called.length===2&&called.every(b=>b.id==='hushpod'&&b.row==='back'&&b.hp===366),'on its next turn two pods are called to the Back row with 366 HP each');
    ok(pods(F).length===2&&F.party.every(p=>p.st.fatigue),'Dead Air still tires everyone, and two pods stand');
    ok(w.uses.dead_air_calls===1,'the calling Dead Air has been used once');
    const q3=pick(F,w,true); ok(q3&&q3.act.id!=='dead_air_calls','it is used once, so the next pick is another act'); }
  { const F=mk(),w=boss(F),p0=pods(F)[0]; p0.ko=true; p0.hp=0; w.hp=Math.round(w.maxHp*.45); w.actIx=w.D.acts.findIndex(a=>a.id==='dead_air_calls'); F.acting=w; foeTurn(F,w); F.acting=w; const b=foeTurn(F,w);
    ok(b.filter(x=>x.t==='summon').length===1&&pods(F).length===2,'with one pod still standing only one is called: the Back row holds two, so a standing pod is not doubled'); }

  // 5. Mute Button: Skill Lock (2 turns) and -1 Pep, a 2-round wait
  noCrit(()=>{ const F=mk(),w=boss(F); w.force='mute_button'; F.acting=w; const p0=F.party.map(p=>p.pep),beats=foeTurn(F,w),hit=beats.filter(b=>b.t==='hit').map(b=>b.tgt),tgt=F.party.find(p=>p.key===hit[0]);
    ok(hit.length===1&&tgt.st.skill_lock&&tgt.st.skill_lock.n===2,'Mute Button hits one ally and leaves them Skill Locked for 2 turns');
    ok(tgt.pep===p0[F.party.indexOf(tgt)]-1,'and takes 1 Pep from them (a Pep gained by the hit aside)');
    ok(w.lastRound.mute_button!=null,'the round it was used is noted'); });
  { const F=mk(),w=boss(F),M=w.D.acts.find(a=>a.id==='mute_button'); ok(M.when.waitRounds===2,'Mute Button has a 2-round wait');
    w.lastRound.mute_button=F.round; w.actIx=w.D.acts.findIndex(a=>a.id==='mute_button'); const q=pick(F,w,true); ok(q&&q.act.id!=='mute_button','the round after it is used it is not picked again');
    F.round+=2; const q2=pick(F,w,true); ok(q2&&q2.act.id==='mute_button','two rounds later it is ready again'); }
  // the pods' Tinny Shush does not go back to the same ally within 2 of the pod's turns (the Hushling’s own rule, in the data)
  ok(D.acts.find(a=>a.id==='tinny_shush').when.notSameAllyTurns===2&&D.acts.find(a=>a.id==='tinny_shush').effects[0].id==='skill_lock','a pod’s Tinny Shush is Skill Lock and skips the ally it hit within 2 turns');

  // 6. Total Silence and Dead Air
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.45); w.uses.dead_air_calls=1; w.actIx=w.D.acts.findIndex(a=>a.id==='total_silence'); const q=pick(F,w,true);
    ok(q&&q.act.id==='total_silence'&&q.act.tags.includes('charge_up')&&q.act.hits==='all'&&q.act.power===1.35,'below 50% HP Total Silence is next, party-wide, a wind-up at 1.35x'); }
  { const F=mk(),w=boss(F); w.actIx=w.D.acts.findIndex(a=>a.id==='dead_air'); const q=pick(F,w,true);
    ok(q&&q.act.id==='dead_air'&&q.act.power===1.15&&q.act.hits==='all'&&q.act.tags.includes('aoe')&&q.act.tags.includes('charge_up'),'above 50% HP Dead Air is party-wide at 1.15x and a wind-up'); }

  delete SK.t15_hit;   // the sandbox row comes out again, so the simple player never picks it

  // 7. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. The target is bestiary 1.6: 5 for a boss that brings helpers (held to 5 to 7).
  // The same loadouts the simulator command builds, so the numbers match `node tools/b3-sim.js new87 20 --support=4`.
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new87'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=5&&avg<=7,'HUSH-9: won every time in '+avg.toFixed(2)+' rounds on average (target 5 to 7)'); }
};
