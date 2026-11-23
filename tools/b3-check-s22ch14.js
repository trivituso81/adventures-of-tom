// tools/b3-check-s22ch14.js — Battle 3 checks for stage 22, chapter 14 (Long Island under the dome: Boppy's Gold Armor and the Part 1 monsters that come back).
// Data: data/b3-foes-ch14.js, the two Gold Armor statuses at the end of data/b3-status.js, data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new74 to new86),
// data/scenes-ch14.js (the Battle 3 wording). New engine pieces: none in the rules (the armor is the Gold Knight's rules under real names, the returning rows are Part 1 rows with a
// new stat line); the page draws a foe with its `art` painting and its `size` (engine/b3-play.js, engine/painted.js).
// The page side (the real scenes on screen, tips shown, victory card, Vibe Points) is tools/ch14_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for stage 22 (chapter 13).
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick'),stat=G('b3Stat'),taken=G('b3TakenMult');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','grace','rose','amy'];

  // 1. The switch, the floor, the armor's numbers
  ok(S.chapters.includes(14)&&S.chapters.indexOf(14)<S.chapters.indexOf(21),'chapter 14 is on Battle 3 (found '+J(S.chapters)+')');
  ok(S.levelFloor[14]===35&&S.levelFloor.length===15,'chapter 14 floors the Character Level at the bestiary baseline, 35 (found '+S.levelFloor[14]+')');
  const W=FOES.warden;
  ok(W&&W.ch===14&&W.hp===3160&&W.hp3===2370&&W.atk===148&&W.def===67&&W.spd===103&&W.pips===8&&W.role==='boss'&&W.row==='front'&&W.noRun,'Boppy’s Gold Armor has the bestiary stat line: HP 3160 (2370 for three), Atk 148, Def 67, Spd 103, 8 pips, Front, no running');
  ok(J(W.peeves)==='["sizzle","racket"]'&&J(W.resists)==='["clobber"]'&&W.custom.boppySpeed.above===.5,'it can’t stand Sizzle or Racket, shrugs off Clobber, and nothing pushes it back above half HP (Boppy Speed)');
  ok(/Gold Armor/.test(W.name)&&/Boppy/.test(W.name),'its name says it is the armor (the family hits the armor, never Boppy): '+W.name);
  ok(J(W.acts.map(a=>a.id))===J(['back_behind_the_line','walk_slower','it_was_this_big','pepper_breath','resting_my_eyes','great_big_gold_hug','cross_country_story']),'its seven acts, in the bestiary’s order');
  const KN=FOES.goldknight;
  ok(W.acts.every((a,i)=>a.power===KN.acts[i].power&&a.recovery===KN.acts[i].recovery&&a.hits===KN.acts[i].hits&&J(a.grow||null)===J(KN.acts[i].grow||null)&&J(a.when||null)===J(KN.acts[i].when||null)&&a.tags.includes('charge_up')===KN.acts[i].tags.includes('charge_up')&&a.tags.includes('aoe')===KN.acts[i].tags.includes('aoe')),'every act has its Gold Knight twin\u2019s power, recovery, targets, growth, HP gate and wind-up (the same seven motions under their real names and flavors)');
  ok(FORMS.warden.vp===30&&J(FORMS.warden.foes)===J([{id:'warden',row:'front'}]),'`warden` is the armor alone, worth 30 Vibe Points');
  for(const id of ['back_behind','resting_eyes']) ok(ST[id]&&ST[id].desc&&ST[id].short&&!/—/.test(ST[id].desc),id+' is a status row with words');
  ok(ST.back_behind.mods[0].v===-.15&&ST.back_behind.dur.n===1&&ST.resting_eyes.kind==='stance'&&ST.resting_eyes.mods[0].v===.25&&ST.resting_eyes.mods[0].stat==='reduce','Back Behind the Line! is -15% Attack for 1 turn; Resting My Eyes is a 25% Guard Stance');
  ok([['new74','warden']].every(([id,f])=>LAB.some(l=>l.id===id&&l.level===35&&l.formation===f&&J(l.party)===J(P)&&l.bg==='pond')),'the Lab has the armor at level 35 with Tom, Grace, Rose and Amy');

  // 2. The scenes: its tips, its Battle 3 wording, the fight is the only story fight
  const sc=read('data/scenes-ch14.js');
  ok(/tut:'ch14'/.test(sc)&&/monster:'warden'/.test(sc)&&(sc.match(/\{battle:/g)||[]).length===1,'chapter 14 scenes start one fight, the Warden (tut ch14)');
  ok(Array.isArray(S.tips.ch14)&&S.tips.ch14.length>=5,'tips under the key ch14 (at least five)');
  for(const t of S.tips.ch14) ok(t.text.length<=240&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|MAKE HIM LAUGH|Chatter|Kinetic|DEFEND/.test(t.text),'ch14 tip '+t.id+' is short, has no dash and no Battle 2 word');
  const vars=sc.match(/B3_CH_ON\(14\)[^\n]*/g)||[];
  ok(vars.length>=6&&!/—/.test(vars.join('')),'chapter 14 has Battle 3 wording variants in its scenes ('+vars.length+' lines)');
  ok(!/Do not hit Boppy|Do not hit him|hitting him heals/.test(vars.join('').split('B3_CH_ON(14)').map(x=>x).filter(x=>/^\)\?/.test(x)).join('')),'the Battle 3 branches never tell the player not to hit');
  ok(FORMS.warden.vp===30,'the armor pays the chapter’s 30 (the bestiary’s 90 is 4 packs at 5, 4 bosses at 10 and the armor, and the built scenes place only the armor)');

  // 3. The returning Part 1 monsters: 34 rows made from the Part 1 rows, on the chapter 14 stat lines
  const STAT={swarmer:[491,100,46,120,0],skirmisher:[604,124,49,137,0],hexer:[642,112,52,120,0],bruiser:[868,130,61,108,0],elite:[1359,136,73,103,4],boss:[1810,148,67,116,4]};
  const FORMS14={1:['mudling','skeeter','grump','toad','log','bigone'],3:['soggysock','bobber','tangle','snag','irongill'],5:['popquiz','tardybell','glitterglue','dodgeball','redpen'],
    7:['shusher','dogear','cliffhanger','knowitall','popup','unread'],9:['velvetrope','stuffedshirt','coathanger','soreloser','wallflower','mirrorball'],10:['carryon','jetlag','longline','unclaimed','armresthog','lastcall']};
  const allForms=[].concat(...Object.values(FORMS14));
  const ids=[...new Set([].concat(...allForms.map(f=>FORMS[f].foes.map(x=>x.id))))];
  ok(ids.length===34&&Object.keys(FOES).filter(k=>/_r$/.test(k)).length===34,'34 Part 1 monsters return and each has a row ('+ids.length+')');
  ok(read('claude/bestiary-v11.md').includes('| Returning boss | 1,810 | 148 | 67 | 116 | 4 |'),'the stat table this file checks against is the bestiary’s printed one');
  let sameActs=0,statOk=0,looks=0;
  for(const id of ids) { const A=FOES[id],R=FOES[id+'_r'],s=STAT[A.role];
    if(J(R.acts)===J(A.acts).split('"soggysock"').join('"soggysock_r"')&&J(R.peeves)===J(A.peeves)&&J(R.resists)===J(A.resists)&&J(R.start)===J(A.start)&&R.name===A.name&&R.row===A.row&&R.role===A.role) sameActs++;
    if(R.hp===s[0]&&R.atk===s[1]&&R.def===s[2]&&R.spd===s[3]&&R.pips===s[4]&&R.ch===14&&R.drop===null&&R.id===id+'_r') statOk++;
    if(R.art===id&&(A.role==='boss'?(R.hp3===Math.round(s[0]*.75)&&R.noRun===true&&!R.size):(R.size===1.25&&!R.hp3))) looks++; }
  ok(sameActs===34,'every returning row keeps its Part 1 entry’s name, row, acts, Pet Peeves, Resists and starting statuses ('+sameActs+' of 34)');
  ok(statOk===34,'every returning row has its role’s chapter 14 stat line, no drop and its `_r` id ('+statOk+' of 34)');
  ok(looks===34,'regular returners are drawn 25% larger on their Part 1 painting; the six returning bosses keep the boss size, run no, and carry three-in-the-party HP 1358 ('+looks+' of 34)');
  ok(allForms.every(f=>{ const R=FORMS[f+'_r'],A=FORMS[f],boss=A.foes.some(x=>FOES[x.id].role==='boss'); return R&&R.ch===14&&J(R.foes)===J(A.foes.map(x=>({id:x.id+'_r',row:x.row})))&&R.vp===(boss?10:5); }),'every Part 1 formation of those six chapters has its returning twin: the same foes in the same rows, 5 Vibe Points a pack and 10 a boss');
  ok(allForms.filter(f=>FOES[f].role==='boss').length===6&&['bigone','irongill','redpen','unread','mirrorball','lastcall'].every(f=>FORMS[f+'_r']&&FORMS[f+'_r'].foes.length===1),'the six returning bosses stand alone');
  ok(J(FOES.irongill_r.acts.filter(a=>a.effects.some(e=>e.op==='summon')).map(a=>a.effects.find(e=>e.op==='summon').id))==='["soggysock_r","soggysock_r"]'&&!J(FOES.irongill_r).includes('"soggysock"'),'Old Iron-Gill calls a returning Soggy Sock, never a Part 1 one');
  ok(allForms.every(f=>f.indexOf('_r')<0)&&Object.keys(FORMS).filter(k=>/_r$/.test(k)).length===34,'34 returning formations, and the Part 1 formations are untouched');
  ok([['new75','toad_r'],['new76','tangle_r'],['new77','dodgeball_r'],['new78','popup_r'],['new79','wallflower_r'],['new80','armresthog_r'],['new81','bigone_r'],['new82','irongill_r'],['new83','redpen_r'],['new84','unread_r'],['new85','mirrorball_r'],['new86','lastcall_r']].every(([id,f])=>LAB.some(l=>l.id===id&&l.level===35&&l.formation===f&&J(l.party)===J(P)&&FORMS[f])),'the Lab has a returning pack for each Long Island chapter and the six returning bosses at level 35');
  ok(!/—/.test(read('data/b3-foes-ch14.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 4. The armor in play
  SK.t14_hit={id:'t14_hit',vibe:'tom_flier',slot:'s1',name:'Test hit',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t14_racket={id:'t14_racket',vibe:'tom_flier',slot:'s1',name:'Test racket',pep:0,flavor:['racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mk=(formation,o)=>{ const F=NF(Object.assign({party:P,level:35,formation,seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,9000); p.pep=4; }
    for(const f of F.foes) { f.hp=f.maxHp=99999; f.peeves=[]; f.resists=[]; } return F; };
  const boss=F=>F.foes.find(f=>f.D.role==='boss'),tomOf=F=>F.party.find(p=>p.id==='tom');
  { const F=mk('warden'),k=boss(F),push=G('b3Push');
    ok(F.foes.length===1&&k.id==='warden'&&k.pips===8&&k.name===W.name,'the fight is the armor alone, 8 pips, under its own name');
    ok(push(F,k,20)===0,'above half HP a push does nothing to it');
    k.hp=Math.round(k.maxHp*.45); ok(push(F,k,20)>0,'at half HP or below it can be pushed'); }
  noCrit(()=>{ const F=mk('warden'),k=boss(F),h0=k.hp; go(F,tomOf(F),'t14_hit',k.key); ok(k.hp<h0,'the family’s hit lands on the armor and takes its HP'); });
  { const F=mk('warden'),k=boss(F),spd=u=>stat(u,'spd'),fastest=F.party.slice().sort((a,b)=>spd(b)-spd(a)||a.slot-b.slot)[0];
    k.force='walk_slower'; F.acting=k; const beats=foeTurn(F,k),hit=beats.filter(b=>b.t==='hit').map(b=>b.tgt);
    ok(hit.length===1&&hit[0]===fastest.key&&fastest.st.slow&&fastest.st.slow.n===2&&beats.some(b=>b.t==='push'&&b.tgt===fastest.key),'"Walk Slower!" hits the fastest ally ('+fastest.name+'), Slow for 2 turns, and a 20-tick push'); }
  { const F=mk('warden'),k=boss(F),n=[]; for(let i=0;i<4;i++) { k.force='it_was_this_big'; F.acting=k; const beats=foeTurn(F,k); n.push(new Set(beats.filter(b=>b.t==='hit').map(b=>b.tgt)).size); }
    ok(n[0]===2&&n[1]===3&&n[2]===4&&n[3]===4,'"It Was THIS Big!" hits 2 allies, then 3, then everyone ('+J(n)+')'); }
  { const F=mk('warden'),k=boss(F); k.force='pepper_breath'; F.acting=k; const b0=foeTurn(F,k);
    ok(b0.some(x=>x.t==='telegraph')&&k.charge&&k.charge.id==='pepper_breath'&&!F.party.some(p=>p.st.toasty),'Pepper Breath is a wind-up: announced first, nobody Toasty yet');
    F.acting=k; foeTurn(F,k);
    ok(F.party.every(p=>p.st.toasty&&p.st.toasty.n===2)&&k.st.toasty&&k.st.toasty.n===2,'then every ally and the armor are Toasty for 2 turns');
    k.st.resting_eyes={n:2,src:k.key}; const g=go(F,tomOf(F),'t14_racket',k.key);
    ok(g.some(x=>x.t==='detonate'&&x.id==='panic_boil')&&!k.st.resting_eyes,'a Racket hit on the Toasty armor sets off Panic Boil! and wakes him out of Resting My Eyes'); }
  noCrit(()=>{ const F=mk('warden'),k=boss(F); k.force='resting_my_eyes'; F.acting=k; foeTurn(F,k);
    ok(k.st.resting_eyes&&k.st.mend&&near(taken(k,0,{F}),.75,1e-9),'Resting My Eyes gives the Guard Stance (25% less damage) and Mend');
    k.force='back_behind_the_line'; F.acting=k; foeTurn(F,k); const hit=F.party.find(p=>p.st.back_behind); ok(hit&&hit.st.back_behind.n===1,'"Back Behind the Line!" leaves its target with -15% Attack for 1 turn'); });
  { const F=mk('warden'),k=boss(F); k.force='great_big_gold_hug'; F.acting=k; const b0=foeTurn(F,k); ok(b0.some(x=>x.t==='telegraph')&&k.charge&&k.charge.id==='great_big_gold_hug','Great Big Gold Hug is a wind-up on one ally'); }
  { const F=mk('warden'),k=boss(F); k.hp=Math.round(k.maxHp*.6); const q=pick(F,k,true); ok(q&&q.act.id!=='cross_country_story','above 50% HP there is no 1970 Cross-Country Story');
    k.hp=Math.round(k.maxHp*.45); k.actIx=k.D.acts.findIndex(a=>a.id==='cross_country_story'); const q2=pick(F,k,true); ok(q2&&q2.act.id==='cross_country_story'&&q2.act.tags.includes('charge_up'),'below 50% HP the 1970 Cross-Country Story is next, and it is a wind-up');
    k.force='cross_country_story'; F.acting=k; foeTurn(F,k); F.acting=k; foeTurn(F,k); ok(F.party.every(p=>p.st.slow&&p.st.fatigue),'and it slows and tires everyone'); }
  // The old draft's two rules are gone: the girls can be hit and can go down, and the armor aims at all four of the family
  noCrit(()=>{ const F=mk('warden'),k=boss(F); for(const p of F.party) { if(p.id==='tom'||p.id==='amy') { p.ko=true; p.hp=0; } else p.hp=1; }
    k.force='back_behind_the_line'; F.acting=k; foeTurn(F,k); const gr=F.party.filter(p=>(p.id==='grace'||p.id==='rose')&&p.hp<=0);
    ok(gr.length===1,'with only Grace and Rose standing, a hit takes one of them down (no rule keeps the girls above 1 HP, and nothing aims only at the adults)'); });

  // 5. The returning Part 1 fights in play: Iron-Gill's dive calls a returning Soggy Sock
  noCrit(()=>{ const F=mk('irongill_r'),k=boss(F); k.force='inlet_submerge'; F.acting=k; const beats=foeTurn(F,k),called=beats.filter(b=>b.t==='summon');
    ok(called.length===1&&called[0].id==='soggysock_r','Old Iron-Gill’s Inlet Submerge calls one returning Soggy Sock to Front'); });

  delete SK.t14_hit; delete SK.t14_racket;   // the sandbox rows come out again, so the simple player never picks them

  // 6. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. The targets: the armor 7 rounds (bestiary 1.6: "7 for Boppy's Gold Armor"; held to 6 to 8),
  // a returning boss about 4 (held to 2.5 to 5: all six share ONE printed stat line, so the spread comes from their Part 1 acts), a pair about 3 (2 to 4) and an Elite pack about 3.5 to 4.5 (3 to 5.5).
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  const run=(id,n)=>{ const out=[]; for(let s=1;s<=n;s++) out.push(play(Object.assign(lab(id),{seed:s}),false,{support:4})); return out; };
  for(const [id,lo,hi,what] of [['new74',6,8,'Boppy’s Gold Armor'],['new75',2,4,'the returning pond pack'],['new76',2,4,'the returning pier pack'],['new77',3,5.5,'the returning school Elite pack'],
      ['new78',2.5,5.5,'the returning library Elite pack'],['new79',3,5.5,'the returning Moon Club Elite pack'],['new80',3,5.5,'the returning airport Elite pack'],
      ['new81',2.5,5,'the returning Big One'],['new82',2.5,5,'the returning Old Iron-Gill'],['new83',2.5,5,'the returning Red Pen'],['new84',2.5,5,'the returning Unread'],['new85',2.5,5,'the returning Mirrorball'],['new86',2.5,5,'the returning Last Call']]) {
    const r=run(id,8),avg=r.reduce((a,x)=>a+x.rounds,0)/r.length;
    ok(r.every(x=>x.result==='win')&&avg>=lo&&avg<=hi,what+': won every time in '+avg.toFixed(2)+' rounds on average (target '+lo+' to '+hi+')'); }
};
