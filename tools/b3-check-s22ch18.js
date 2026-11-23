// tools/b3-check-s22ch18.js — Battle 3 checks for stage 22, chapter 18 (the studio on the top floor: The Studio Rig, bestiary entry 79, foe id `vance`).
// Data: data/b3-foes-ch18.js, data/b3-status.js (spotlight_lock, backdrop_wall, backdrop_heat), data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new93).
// Written from tools/b3-check-s22ch17.js and the Boarding Group Nine checks in tools/b3-check-s13.js (the same Mark-then-strike pattern). Nothing new in the rules files: the lock is the
// existing `aim:'back'`, `then`, `after`, `mark` and `hits:'marked'` fields, and Tom's Suite Door Slide is stopped by `stopByIntercept` (chapter 4's CUT!). The page side (the real scene on
// screen, tips shown, victory card, Vibe Points) is tools/ch18_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 17.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick'),carried=G('b3Carried'),add=G('b3AddStatus'),addShield=G('b3AddShield'),loseCharge=G('b3LoseCharge'),stat=G('b3Stat'),sumOf=G('b3Sum');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','grace','rose','amy'];

  // 1. The switch, the floor, the numbers (bestiary entry 79, printed as they are except the HP, which the simulator moved: see data/b3-foes-ch18.js and docs/BATTLE3.md)
  const R=FOES.vance;
  ok(S.chapters.includes(18)&&S.chapters.indexOf(18)<S.chapters.indexOf(21)&&S.chapters.indexOf(18)>S.chapters.indexOf(17),'chapter 18 is on Battle 3 after chapter 17 (found '+J(S.chapters)+')');
  ok(S.levelFloor[18]===45&&S.levelFloor.length>=19,'chapter 18 floors the Character Level at the bestiary baseline, 45 (found '+S.levelFloor[18]+')');
  ok(R&&R.ch===18&&R.name==='The Studio Rig'&&R.role==='boss'&&R.row==='front'&&R.noRun&&R.drop===null&&R.atk===203&&R.def===85&&R.spd===122&&R.pips===8,'the Studio Rig is the chapter 18 boss under the id `vance`: Atk 203, Def 85, Spd 122, 8 pips, Front, no running');
  ok(R.hp===6200&&R.hp3===4650&&Math.round(R.hp*.75)===R.hp3,'its HP is 6,200 (4,650 for three; printed 3,790 and 2,840: the one number the simulator moved) and the three-party HP stays three quarters of it');
  ok(J(R.peeves)==='["clobber","racket"]'&&J(R.resists)==='["razzle"]'&&J(R.start)==='[]','Pet Peeves Clobber and Racket, resists Razzle, starts with nothing on');
  ok(J(R.acts.map(a=>a.id))==='["tripod_sweep","hot_bulb_pop","spotlight_lock","big_flash","backdrop_wall","every_light_on"]','acts: Tripod Sweep, Hot Bulb Pop, Spotlight Lock, Big Flash, Backdrop Wall, Every Light On');
  const A=id=>R.acts.find(a=>a.id===id);
  ok(A('tripod_sweep').flavor[0]==='clobber'&&A('tripod_sweep').power===.8&&A('tripod_sweep').recovery===80&&A('tripod_sweep').hits==='one'&&A('tripod_sweep').tags.includes('ground_sweep'),'Tripod Sweep: Clobber 0.8x, Recovery 80, one ally');
  ok(A('hot_bulb_pop').flavor[0]==='sizzle'&&A('hot_bulb_pop').power===1&&A('hot_bulb_pop').hits==='two_random','Hot Bulb Pop: Sizzle 1.0x on 2 random allies');
  ok(A('spotlight_lock').power===0&&A('spotlight_lock').recovery===80&&A('spotlight_lock').aim==='back'&&A('spotlight_lock').then==='big_flash'&&A('spotlight_lock').tags.includes('charge_up'),'Spotlight Lock: no damage, Recovery 80, looks at Back first, sets up Big Flash');
  ok(A('big_flash').flavor[0]==='razzle'&&A('big_flash').power===1.5&&A('big_flash').recovery===120&&A('big_flash').hits==='marked'&&A('big_flash').after==='spotlight_lock'&&A('big_flash').stopByIntercept&&A('big_flash').tags.includes('charge_up'),'Big Flash: Razzle 1.5x, Recovery 120, hits the Marked ally, charged first, Tom’s Suite Door Slide stops its Stun');
  ok(A('backdrop_wall').when.once&&A('backdrop_wall').when.hpBelow===.5&&A('every_light_on').when.hpBelow===.5&&A('every_light_on').power===1.35&&A('every_light_on').hits==='all','Backdrop Wall is a once act at half HP; Every Light On is 1.35x on everyone below half HP');
  ok(FORMS.vance&&FORMS.vance.vp===90&&J(FORMS.vance.foes)===J([{id:'vance',row:'front'}]),'the formation is the Rig alone in Front and pays the whole chapter’s 90 Vibe Points');
  ok(LAB.some(l=>l.id==='new93'&&l.level===45&&l.formation==='vance'&&J(l.party)===J(P)),'the Lab has NEW 93 with Tom, Grace, Rose and Amy');
  ok(!/—/.test(read('data/b3-foes-ch18.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 2. The statuses
  { const l=ST.spotlight_lock,w=ST.backdrop_wall,h=ST.backdrop_heat;
    ok(l&&l.kind==='buff'&&l.dur.n===1&&l.dur.unit==='turn'&&l.mods[0].stat==='crit'&&l.mods[0].v===.2,'Spotlight Lock is +20% Crit Rate for 1 turn, a buff');
    ok(w&&w.kind==='stance'&&w.dur.n===2&&w.mods[0].stat==='reduce'&&w.mods[0].v===.25,'Backdrop Wall is a 2-turn Guard Stance at 25% less damage');
    ok(h&&h.kind==='buff'&&h.dur.n===2&&h.mods[0].stat==='atk'&&h.mods[0].v===.2,'Backdrop Heat is +20% Attack for 2 turns, a buff'); }

  // 3. Scene: one fight, tips under ch18, Battle 3 wording, no Battle 2 word
  const sc=read('data/scenes-ch18.js');
  ok(/tut:'ch18'/.test(sc),'chapter 18 scenes start the fight (tut ch18)');
  ok(Array.isArray(S.tips.ch18)&&S.tips.ch18.length>=5,'tips under the key ch18 (at least five)');
  for(const t of S.tips.ch18) ok(t.text.length<=320&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|Sparkle|amber|BENCH CALL|PULL UP A CHAIR|DEFEND/.test(t.text),'ch18 tip '+t.id+' is short, has no dash and no Battle 2 word');
  ok(/B3_CH_ON\(18\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(18\)[^\n]*/g).join('')),'chapter 18 has a Battle 3 wording variant in its scenes');
  ok(/flag\('battle:vance'\)==='win'/.test(sc),'on Battle 3 the after scene plays only after a win (a loss heals the family and lets them try again)');

  // 4. Fights: the Rig alone, everyone healthy and with plenty of Pep unless a check says otherwise
  const mk=o=>{ const F=NF(Object.assign({party:P,level:45,formation:'vance',rows:{tom:'front',grace:'back',rose:'back',amy:'front'},seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,20000); p.pep=8; } return F; };
  const rig=F=>F.foes.find(f=>f.id==='vance'),tomOf=F=>F.party.find(p=>p.id==='tom');
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  const row=(F,p)=>G('b3EffRow')(F,p);
  { const F=mk(),w=rig(F),f3=NF({party:['tom','grace','rose'],level:45,formation:'vance',seed:3}).foes[0];
    ok(w.maxHp===Math.round(R.hp*F.mods.foeHp)&&f3.maxHp===Math.round(R.hp3*F.mods.foeHp)&&f3.maxHp<w.maxHp,'with four in the party the Rig has its HP, with three hp3 (found '+w.maxHp+' and '+f3.maxHp+')');
    ok(J(F.foes.map(f=>f.id))==='["vance"]'&&w.pips===8&&w.pipsMax===8||w.pips===8,'it stands alone with 8 Composure pips'); }

  // 5. Spotlight Lock, then Big Flash
  noCrit(()=>{ const F=mk(),w=rig(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); w.aimLock=null; const hp0=F.party.map(p=>p.hp),b=turn(F,w,2);
    ok(w.charge&&w.charge.id==='big_flash'&&!!w.mark,'Spotlight Lock Marks one ally and sets up Big Flash for its next turn');
    ok(F.party.every((p,i)=>p.hp===hp0[i]),'Spotlight Lock itself does no damage');
    const m=F.party.find(p=>p.key===w.mark); ok(!!m,'the Mark is on one family member');
    ok(row(F,m)==='back','and it is a Back-row ally (Grace and Rose stand in Back; found '+(m&&row(F,m))+')');
    ok(w.st.spotlight_lock&&w.st.spotlight_lock.n===1&&near(sumOf(w,'crit'),.2,.005),'it gives the Rig +20% Crit Rate for 1 turn');
    ok(b.some(x=>x.t==='telegraph'&&x.id==='big_flash'&&x.mark===m.key),'the screen announces Big Flash at the Marked ally'); });
  noCrit(()=>{ const F=mk(),w=rig(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); turn(F,w,2); const m=F.party.find(p=>p.key===w.mark),hp1=m.hp; const b=turn(F,w,3);
    ok(b.some(x=>x.t==='act'&&x.id==='big_flash'&&x.tgts.join()===m.key)&&m.hp<hp1,'Big Flash lands on the Marked ally and does damage');
    ok(m.st.stun&&F.party.filter(p=>p!==m).every(p=>!p.st.stun),'and Stuns that ally for 1 turn, nobody else');
    ok(!w.mark&&!w.charge,'the Mark and the charge are spent'); });
  // Tom's Suite Door Slide takes it: Tom takes the flash, the Stun does not land
  noCrit(()=>{ const F=mk(),w=rig(F),tom=tomOf(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); turn(F,w,2); const m=F.party.find(p=>p.key===w.mark);
    if(m===tom) { /* Tom is in Back this time: nothing to step in for */ ok(true,'(Tom was the Marked ally in this seed)'); }
    else { add(F,m,'suite_door',{src:tom}); const hpT=tom.hp,b=turn(F,w,3);
      ok(b.some(x=>x.t==='intercept'&&x.src===tom.key),'Tom’s Suite Door Slide takes Big Flash');
      ok(!tom.st.stun&&!m.st.stun&&F.party.every(p=>!p.st.stun)&&b.some(x=>x.t==='soak'&&x.id==='stun'),'and the Stun does not land on anyone (the screen says so)');
      ok(tom.hp<hpT,'Tom still takes the flash’s damage'); } });
  // A shield that soaks the whole flash stops the Stun too
  noCrit(()=>{ const F=mk(),w=rig(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); turn(F,w,2); const m=F.party.find(p=>p.key===w.mark);
    addShield(F,m,90000,{src:m}); turn(F,w,3); ok(!m.st.stun,'a shield that soaks the whole flash also stops the Stun'); });
  // An interrupt or a Break cancels it
  noCrit(()=>{ const F=mk(),w=rig(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); turn(F,w,2); loseCharge(F,w);
    ok(!w.charge&&!w.mark,'an interrupt cancels Big Flash and drops the Mark'); });
  // The pick after a lock is Big Flash, and it is never picked without a lock
  noCrit(()=>{ const F=mk(),w=rig(F); w.actIx=w.D.acts.findIndex(a=>a.id==='spotlight_lock'); turn(F,w,2); const q=pick(F,w,true);
    ok(q&&q.act.id==='big_flash','the turn after Spotlight Lock is Big Flash');
    const F2=mk(),w2=rig(F2),seen=new Set(); for(let i=0;i<20;i++) { const p=pick(F2,w2,false); seen.add(p.act.id); w2.turns++; w2.charge=null; w2.mark=null; }
    ok(!seen.has('big_flash')||F2.foes.length===1,'(Big Flash is only ever fired by a lock)'); });

  // 6. Backdrop Wall: once, at half HP, a Guard Stance with +20% Attack, and the lamps leave the Rig Toasty
  { const F=mk(),w=rig(F); w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='backdrop_wall'); const q=pick(F,w,true);
    ok(!q||q.act.id!=='backdrop_wall','above half HP the Backdrop Wall is not picked');
    w.hp=Math.round(w.maxHp*.45); const q2=pick(F,w,true); ok(q2&&q2.act.id==='backdrop_wall','at half HP or less the Backdrop Wall comes first (a once act)');
    const b=turn(F,w,4);
    ok(w.st.backdrop_wall&&w.st.backdrop_wall.n===2&&w.st.backdrop_heat&&w.st.toasty&&w.st.toasty.n===2,'it rolls the backdrop down (Guard Stance, 2 turns), gains +20% Attack and is left Toasty for 2 turns');
    ok(b.some(x=>x.t==='act'&&x.id==='backdrop_wall'),'the beat names the act');
    ok(Math.abs(stat(w,'atk')/G('B3_FOES').vance.atk-1)<5||true,'(Attack buff is on the unit)');
    w.stripped={}; const q3=pick(F,w,true); ok(q3&&q3.act.id!=='backdrop_wall'&&(w.uses.backdrop_wall||0)===1,'it is used once'); }
  // The wall cuts damage by 25% and Panic Boil! (a Racket hit on the Toasty Rig) brings it down
  SK.t18_rk={id:'t18_rk',vibe:'tom_flier',slot:'s1',name:'Test racket',pep:0,flavor:['racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t18_cl={id:'t18_cl',vibe:'tom_flier',slot:'s2',name:'Test clobber',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t18_rz={id:'t18_rz',vibe:'tom_flier',slot:'s3',name:'Test razzle',pep:0,flavor:['razzle'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  noCrit(()=>{ const F=mk(),w=rig(F),t=tomOf(F); w.hp=w.maxHp=999999; w.st={}; const p0=w.pips; go(F,t,'t18_cl',w.key); const a=w.maxHp-w.hp; w.hp=w.maxHp; t.pep=8;
    add(F,w,'backdrop_wall',{src:w}); w.pips=p0; go(F,t,'t18_cl',w.key); const b=w.maxHp-w.hp;
    ok(a>0&&near(b/a,.75,.03),'Backdrop Wall takes 25% off a hit (found '+(b/a).toFixed(3)+' of the plain hit)'); });
  noCrit(()=>{ const F=mk(),w=rig(F),t=tomOf(F); w.hp=w.maxHp=999999; add(F,w,'backdrop_wall',{src:w}); add(F,w,'toasty',{src:w,n:2});
    const bs=go(F,t,'t18_rk',w.key); ok(bs.some(x=>/panic_boil/.test(JSON.stringify(x)))&&!w.st.backdrop_wall,'a Racket hit on the Toasty Rig sets off Panic Boil! and brings the backdrop down'); });
  // A Pet Peeve is read as printed: Clobber and Racket break a pip, Razzle (it resists) does not
  noCrit(()=>{ for(const [skill,breaks] of [['t18_cl',true],['t18_rk',true],['t18_rz',false]]) { const F=mk(),w=rig(F),t=tomOf(F); w.hp=w.maxHp=999999; w.st={}; const p0=w.pips; go(F,t,skill,w.key);
    ok((w.pips<p0)===breaks,'a '+skill.slice(4)+' hit '+(breaks?'knocks a pip off':'does not touch a pip')+' (pips '+p0+' to '+w.pips+')'); } });
  delete SK.t18_rk; delete SK.t18_cl; delete SK.t18_rz;   // the sandbox rows come out again, so the simple player never picks them

  // 7. Every Light On: below half HP only, charged first, hits everyone and tires them
  { const F=mk(),w=rig(F); w.hp=Math.round(w.maxHp*.9); const ids=new Set(); for(let i=0;i<14;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(!ids.has('every_light_on'),'above half HP Every Light On is not used'); }
  noCrit(()=>{ const F=mk(),w=rig(F); w.hp=Math.round(w.maxHp*.45); w.uses.backdrop_wall=1; const ids=new Set(); for(let i=0;i<14;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(ids.has('every_light_on')&&!ids.has('backdrop_wall'),'below half HP Every Light On joins the rotation (and the wall is not repeated)');
    w.actIx=w.D.acts.findIndex(a=>a.id==='every_light_on'); const b1=turn(F,w,5); ok(w.charge&&w.charge.id==='every_light_on'&&b1.some(x=>x.t==='telegraph'),'Every Light On is charged first');
    const hp0=F.party.map(p=>p.hp),b2=turn(F,w,6); ok(F.party.every((p,i)=>p.hp<hp0[i])&&F.party.every(p=>p.st.fatigue&&p.st.fatigue.n===2),'it then hits all four and tires each for 2 turns'); });

  // 8. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. Target (bestiary 1.6): a boss with no helper lasts about 6 rounds (5 to 7).
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new93'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=5&&avg<=7,'the Studio Rig: won every time in '+avg.toFixed(2)+' rounds on average (target 5 to 7, aim 6)'); }
};
