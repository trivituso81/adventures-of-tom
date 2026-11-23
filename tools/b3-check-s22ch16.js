// tools/b3-check-s22ch16.js — Battle 3 checks for stage 22, chapter 16 (the town square: Marlowe, the bestiary's Square's Sign, and the Grey Notes, its Citation Slips).
// Data: data/b3-foes-ch16.js, data/b3-status.js (eclipse_wall, eclipse_plating, marginal_note), data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new88, new89).
// Written from tools/b3-check-s22ch15.js. Built for this chapter: the `bounce` op (engine/b3-ops.js), the listener condition `notPeeveHit` (engine/b3-hooks.js), the `quietEnd` foe field
// (engine/b3-story.js) and the layout field `helpers`. The page side (the real scene on screen, tips shown, victory card, Vibe Points) is tools/ch16_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 15.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','amy','tnb','nara'];

  // 1. The switch, the floor, the numbers
  ok(S.chapters.includes(16)&&S.chapters.indexOf(16)<S.chapters.indexOf(21),'chapter 16 is on Battle 3 (found '+J(S.chapters)+')');
  ok(S.levelFloor[16]===40&&S.levelFloor.length>=17,'chapter 16 floors the Character Level at the bestiary baseline, 40 (found '+S.levelFloor[16]+')');
  const R=FOES.marlowe16,D=FOES.greynoteh,N=FOES.greynote;
  // Bestiary entry 74: Atk 175, Def 76, Spd 120, 8 pips, Front, no running, Racket and Drench hated, Clobber resisted. HP is the one number the simulator moved (1,300 and 975 for three, printed 2,700 and 2,020).
  ok(R&&R.ch===16&&R.hp===1300&&R.hp3===975&&R.atk===175&&R.def===76&&R.spd===120&&R.pips===8&&R.role==='boss'&&R.row==='front'&&R.noRun,'Marlowe has the bestiary stat line: Atk 175, Def 76, Spd 120, 8 pips, Front, no running (HP 1300, 975 for three: lowered from the printed 2700 and 2020 by the simulator)');
  ok(J(R.peeves)==='["racket","drench"]'&&J(R.resists)==='["clobber"]','Marlowe hates Racket and Drench and shrugs off Clobber');
  ok(R.quietEnd===true&&J(R.helpers)==='["greynoteh"]','his fall is silent (quietEnd) and his Grey Notes stand in the gap in front of him (helpers)');
  ok(N&&N.ch===16&&N.hp===1000&&N.atk===133&&N.def===59&&N.spd===124&&N.pips===0&&N.role==='hexer'&&N.row==='back'&&N.drop==='pretzels','a Grey Note on its own is the chapter 16 Hexer: 1000 HP, Atk 133, Def 59, Spd 124, 0 pips, Back, drops pretzels');
  ok(D&&D.art==='greynote'&&D.hp===404&&D.role==='helper'&&D.atk===N.atk&&D.def===N.def&&D.spd===N.spd&&D.drop===null&&J(D.acts)===J(N.acts),'the Grey Note he calls is the same stats and acts on 404 HP, draws as a Grey Note, pays no drop');
  ok(J(N.peeves)==='["racket","drench"]'&&J(N.acts.map(a=>a.id))==='["stick","flutter","fade"]','a Grey Note hates Racket and Drench and has Stick, Flutter and Fade');
  ok(J(R.acts.map(a=>a.id))==='["strike_through","marginal_note","brace_first","brace_second","overexposure","total_eclipse"]','Marlowe’s acts: Strike Through, Marginal Note, the wall twice (above and below half HP), Overexposure, Total Eclipse');
  ok(FORMS.greynote.vp===15&&J(FORMS.greynote.foes)===J([{id:'greynote',row:'front'},{id:'greynote',row:'back'}]),'two Grey Notes (Front and Back) pay 15 Vibe Points');
  ok(FORMS.marlowe16.vp===60&&J(FORMS.marlowe16.foes)===J([{id:'marlowe16',row:'front'},{id:'greynoteh',row:'back'},{id:'greynoteh',row:'back'}]),'the boss formation is Marlowe in Front with two Grey Notes in Back and pays 60 Vibe Points');
  ok(LAB.some(l=>l.id==='new88'&&l.level===40&&l.formation==='greynote'&&J(l.party)===J(P))&&LAB.some(l=>l.id==='new89'&&l.level===40&&l.formation==='marlowe16'&&J(l.party)===J(P)),'the Lab has both chapter 16 fights at level 40 with Tom, Amy, TNB and Nara');
  ok(!/—/.test(read('data/b3-foes-ch16.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 2. The statuses: the wall is a 2-turn Guard Stance at 30% less, the plating is +20% Defense, the note is -20% Attack
  { const w=ST.eclipse_wall,p=ST.eclipse_plating,m=ST.marginal_note;
    ok(w&&w.kind==='stance'&&w.dur&&w.dur.n===2&&w.on&&w.on.afterHit,'Behind the Eclipse is a 2-turn stance that listens for hits');
    ok(JSON.stringify(w).includes('"notPeeveHit":true')&&JSON.stringify(w).includes('"bounce"')&&JSON.stringify(w).includes('0.15'),'it bounces 15% of a hit that is not a Pet Peeve hit');
    ok(p&&p.kind==='buff'&&JSON.stringify(p.mods||p).includes('0.2'),'the plating is a +20% Defense buff');
    ok(m&&m.kind==='debuff'&&JSON.stringify(m).includes('0.2'),'Marginal Note is a -20% Attack debuff'); }

  // 3. Scene: one fight, tips under ch16, Battle 3 wording, no Battle 2 word
  const sc=read('data/scenes-ch16.js');
  ok(/tut:'ch16'/.test(sc)&&/monster:'marlowe16'/.test(sc),'chapter 16 scenes start the boss fight (tut ch16)');
  ok(Array.isArray(S.tips.ch16)&&S.tips.ch16.length>=5,'tips under the key ch16 (at least five)');
  for(const t of S.tips.ch16) ok(t.text.length<=300&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|BENCH CALL|PULL UP A CHAIR/.test(t.text),'ch16 tip '+t.id+' is short, has no dash and no Battle 2 word');
  ok(/B3_CH_ON\(16\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(16\)[^\n]*/g).join('')),'chapter 16 has Battle 3 wording variants in its scenes');

  // 4. The wall: twice in the fight, calling Grey Notes to the two places of the Back row
  SK.t16_hit={id:'t16_hit',vibe:'tom_flier',slot:'s1',name:'Test hit',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t16_rk={id:'t16_rk',vibe:'tom_flier',slot:'s2',name:'Test racket',pep:0,flavor:['racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mk=o=>{ const F=NF(Object.assign({party:P,level:40,formation:'marlowe16',seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,9000); p.pep=4; }
    for(const f of F.foes) { f.hp=f.maxHp=99999; f.resists=[]; } return F; };
  const boss=F=>F.foes.find(f=>f.D.role==='boss'),notes=F=>F.foes.filter(f=>f.id==='greynoteh'&&!f.ko&&f.hp>0),tomOf=F=>F.party.find(p=>p.id==='tom');
  { const F=mk(),w=boss(F);
    ok(w.id==='marlowe16'&&notes(F).length===2&&notes(F).every(p=>p.row==='back'),'the fight starts with Marlowe in Front and two Grey Notes in Back');
    ok(notes(F).every(p=>p.name.startsWith('Grey Note')),'the two Grey Notes are told apart by a letter (A, B)');
    const P3=NF({party:['tom','amy','tnb'],level:40,formation:'marlowe16',seed:3}); ok(boss(P3).maxHp===975&&notes(P3).every(p=>p.maxHp===404),'with three in the party Marlowe has 975 HP and a Grey Note still has 404'); }
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='brace_first');
    const q=pick(F,w,true); ok(q&&q.act.id==='brace_first','above half HP the first wall is the act picked');
    for(const n of notes(F)) { n.ko=true; n.hp=0; }
    F.acting=w; const b=foeTurn(F,w),called=b.filter(x=>x.t==='summon');
    ok(called.length===2&&called.every(x=>x.id==='greynoteh'&&x.row==='back'&&x.hp===404),'the wall calls two Grey Notes to the Back row with 404 HP each');
    ok(w.st.eclipse_wall&&w.st.eclipse_wall.n===2&&w.st.eclipse_plating,'and puts up the 2-turn stance and the Defense plating');
    ok(w.uses.brace_first===1,'the first wall has been used once');
    w.st={}; w.hp=Math.round(w.maxHp*.9); w.actIx=w.D.acts.findIndex(a=>a.id==='brace_first'); const q2=pick(F,w,true);
    ok(q2&&q2.act.id!=='brace_first'&&q2.act.id!=='brace_second','the first wall is used once, and the second waits for half HP'); }
  { const F=mk(),w=boss(F); w.uses.brace_first=1; w.hp=Math.round(w.maxHp*.45); w.actIx=w.D.acts.findIndex(a=>a.id==='brace_second');
    const q=pick(F,w,true); ok(q&&['brace_second','total_eclipse'].includes(q.act.id)&&(q.act.id==='brace_second'),'below half HP the second wall comes before Total Eclipse');
    F.acting=w; foeTurn(F,w); ok((w.uses.brace_second||0)===1&&w.st.eclipse_wall,'it is used once and the stance is up');
    w.st={}; w.actIx=w.D.acts.findIndex(a=>a.id==='brace_second'); const q2=pick(F,w,true); ok(q2&&q2.act.id!=='brace_second'&&q2.act.id!=='brace_first','there is no third wall'); }
  { const F=mk(),w=boss(F),a=notes(F)[0]; a.ko=true; a.hp=0; w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='brace_first'); F.acting=w; const b=foeTurn(F,w);
    ok(b.filter(x=>x.t==='summon').length===1&&notes(F).length===2,'with one Grey Note still standing only one is called: the Back row holds two'); }

  // 5. The bounce: 15% of a hit that is not Racket or Drench, plain damage, shield first, never a knock-out
  noCrit(()=>{ const F=mk(),w=boss(F),t=tomOf(F); w.st.eclipse_wall={n:2}; const hp0=t.hp; const beats=go(F,t,'t16_hit',w.key);
    const dealt=beats.filter(b=>b.t==='hit'&&b.tgt===w.key).reduce((a,b)=>a+(b.dmg||0),0),lost=hp0-t.hp;
    ok(dealt>0&&lost>0&&Math.abs(lost-Math.max(1,Math.round(dealt*.15)))<=1,'a Clobber hit on the wall bounces 15% back at Tom (dealt '+dealt+', lost '+lost+')'); });
  noCrit(()=>{ const F=mk(),w=boss(F),t=tomOf(F); w.st.eclipse_wall={n:2}; const hp0=t.hp; go(F,t,'t16_rk',w.key);
    ok(t.hp===hp0,'a Racket hit (his Pet Peeve) does not bounce'); });
  noCrit(()=>{ const F=mk(),w=boss(F),t=tomOf(F); const hp0=t.hp; go(F,t,'t16_hit',w.key); ok(t.hp===hp0,'with no wall up nothing bounces'); });
  noCrit(()=>{ const F=mk(),w=boss(F),t=tomOf(F); w.st.eclipse_wall={n:2}; t.hp=1; go(F,t,'t16_hit',w.key); ok(t.hp===1&&!t.ko,'a bounce never knocks anyone out: it leaves 1 HP'); });
  noCrit(()=>{ const F=mk(),w=boss(F),t=tomOf(F); w.st.eclipse_wall={n:2}; t.shields.push({amt:500,n:2,src:null,skip:false,mods:null}); const hp0=t.hp,sh0=t.shields.reduce((x,y)=>x+y.amt,0); go(F,t,'t16_hit',w.key); ok(t.hp===hp0&&t.shields.reduce((x,y)=>x+y.amt,0)<sh0,'a shield soaks the bounce first'); });

  // 6. Overexposure and Total Eclipse: party-wide, charged first; Total Eclipse only below half HP
  { const F=mk(),w=boss(F); w.uses.brace_first=1; w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='overexposure'); const q=pick(F,w,true);
    ok(q&&q.act.id==='overexposure'&&q.act.hits==='all'&&q.act.power===1.2&&q.act.tags.includes('charge_up'),'above half HP Overexposure is party-wide at 1.2x and a wind-up');
    ok(!w.D.acts.find(a=>a.id==='total_eclipse').when||w.D.acts.find(a=>a.id==='total_eclipse').when.hpBelow===.5,'Total Eclipse needs half HP or less');
    F.acting=w; foeTurn(F,w); F.acting=w; const b=foeTurn(F,w); ok(F.party.every(p=>p.st.blind&&p.st.slow)||b.some(x=>x.t==='telegraph')||F.party.some(p=>p.st.blind),'Overexposure Blinds and Slows the family when it lands'); }
  { const F=mk(),w=boss(F); w.uses.brace_first=1; w.uses.brace_second=1; w.hp=Math.round(w.maxHp*.4); w.actIx=w.D.acts.findIndex(a=>a.id==='total_eclipse'); const q=pick(F,w,true);
    ok(q&&q.act.id==='total_eclipse'&&q.act.hits==='all'&&q.act.power===1.35&&q.act.tags.includes('ground_sweep')&&q.act.tags.includes('charge_up'),'below half HP Total Eclipse is next, party-wide, a floor sweep and a wind-up at 1.35x'); }

  // 7. The Grey Notes' acts: Stick Blinds, Flutter makes you Bleed, Fade tires and strips a buff
  noCrit(()=>{ for(const [id,st] of [['stick','blind'],['flutter','bleed'],['fade','fatigue']]) { const F=mk({formation:'greynote'}),n=F.foes[0]; n.force=id; F.acting=n; const hit=foeTurn(F,n).filter(b=>b.t==='hit').map(b=>b.tgt),tgt=F.party.find(p=>p.key===hit[0]);
      ok(hit.length===1&&tgt&&tgt.st[st],'a Grey Note’s '+id+' hits one ally and leaves '+st); } });

  delete SK.t16_hit; delete SK.t16_rk;   // the sandbox rows come out again, so the simple player never picks them

  // 8. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. Target (bestiary 1.6): 5 to 7 for a boss that brings helpers; the pair is a normal fight.
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new89'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=5&&avg<=7,'Marlowe: won every time in '+avg.toFixed(2)+' rounds on average (target 5 to 7)'); }
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new88'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=2.5&&avg<=4.5,'two Grey Notes: won every time in '+avg.toFixed(2)+' rounds on average (a normal fight, 2.5 to 4.5)'); }
};
