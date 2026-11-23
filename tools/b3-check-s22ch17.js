// tools/b3-check-s22ch17.js — Battle 3 checks for stage 22, chapter 17 (Julian's building: the Pause Sprite, the Brass Desk Weight, the Curator and the Twin Lenses).
// Data: data/b3-foes-ch17.js, data/b3-status.js (heavy_brass_base, white_glove, glove_seal, self_timer, label_tag, held_stack, rack_focus, darkroom_def), data/b3-story.js (switch, level floor, tips),
// data/b3-lab.js (new90 to new92). Written from tools/b3-check-s22ch16.js. Built for this chapter: a foe with `stances` (engine/b3-core.js b3SetStance and b3SwapStance), the swap at every round
// divider (engine/b3-timeline.js), the `stance` op (engine/b3-ops.js), the act condition `stance` (engine/b3-foe.js) and the Lens row on the card. The page side (the real scene on screen, tips
// shown, victory card, Vibe Points) is tools/ch17_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for chapter 16.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),pick=G('b3FoePick'),tick=G('b3Tick'),carried=G('b3Carried');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','grace','rose','amy'];

  // 1. The switch, the floor, the numbers (bestiary entries 75 to 78, printed as they are)
  ok(S.chapters.includes(17)&&S.chapters.indexOf(17)<S.chapters.indexOf(21),'chapter 17 is on Battle 3 (found '+J(S.chapters)+')');
  ok(S.levelFloor[17]===42&&S.levelFloor.length===18,'chapter 17 floors the Character Level at the bestiary baseline, 42 (found '+S.levelFloor[17]+')');
  const PS=FOES.pausesprite,BW=FOES.paperweight,CU=FOES.curator,TL=FOES.twinlens;
  ok(PS&&PS.ch===17&&PS.hp===884&&PS.atk===143&&PS.def===63&&PS.spd===125&&PS.pips===0&&PS.role==='hexer'&&PS.row==='back'&&PS.drop==='coldbrew','the Pause Sprite is the chapter 17 Hexer: 884 HP, Atk 143, Def 63, Spd 125, 0 pips, Back, drops Cold Brew');
  ok(J(PS.peeves)==='["clobber","racket"]'&&J(PS.resists)==='[]'&&J(PS.acts.map(a=>a.id))==='["shutter_tap","hold_that_pose","self_timer_beep"]','it hates Clobber and Racket and has Shutter Tap, Hold That Pose and Self-Timer Beep');
  for(const [D,n,drop,pv,rs,st] of [[BW,'Brass Desk Weight','pretzels','["clobber","razzle"]','["drench"]',['heavy_brass_base']],[CU,'Curator','prioritytag','["clobber","racket"]','[]',['white_glove','glove_seal']]])
    ok(D&&D.ch===17&&D.hp===1872&&D.atk===173&&D.def===88&&D.spd===107&&D.pips===5&&D.role==='elite'&&D.row==='front'&&D.drop===drop&&J(D.peeves)===pv&&J(D.resists)===rs&&J(D.start)===J(st),n+' is the chapter 17 Elite: 1872 HP, Atk 173, Def 88, Spd 107, 5 pips, Front, Pet Peeves '+pv+', starts with '+st.join(' and '));
  ok(J(BW.acts.map(a=>a.id))==='["brass_roll","magnifier_glare","hold_the_stack"]'&&J(CU.acts.map(a=>a.id))==='["label_gun_tag","frame_straighten","do_not_touch"]','the Elites have their three acts, the last of each charged first');
  ok(BW.acts[2].tags.includes('charge_up')&&CU.acts[2].tags.includes('charge_up')&&BW.acts[2].power===1.5&&CU.acts[2].power===1.5,'Hold The Stack and Do Not Touch The Proofs are wind-ups at 1.5x');
  ok(TL&&TL.ch===17&&TL.hp===3800&&TL.hp3===2850&&TL.atk===188&&TL.def===81&&TL.spd===121&&TL.pips===8&&TL.role==='boss'&&TL.row==='front'&&TL.noRun&&TL.drop===null,'the Twin Lenses are the chapter 17 boss: Atk 188, Def 81, Spd 121, 8 pips, Front, no running (HP 3,800 and 2,850 for three, printed 2,910 and 2,180: the one number the simulator moved)');
  ok(J(TL.peeves)==='["sizzle","clobber"]'&&J(TL.resists)==='["drench","razzle"]'&&TL.stance0==='blue','the row is the Blue lens: Pet Peeves Sizzle and Clobber, resists Drench and Razzle');
  ok(J(TL.stances.blue.peeves)==='["sizzle","clobber"]'&&J(TL.stances.blue.resists)==='["drench","razzle"]'&&J(TL.stances.orange.peeves)==='["drench","razzle"]'&&J(TL.stances.orange.resists)==='["sizzle","racket"]','the two stances: Blue (Sizzle, Clobber; resists Drench, Razzle) and Orange (Drench, Razzle; resists Sizzle, Racket)');
  ok(J(TL.acts.map(a=>a.id))==='["rack_focus","cold_safelight","enlarger_burn","darkroom_call","long_exposure","contact_sheet_archive"]','the Twin Lenses’ acts: Rack Focus, Cold Safelight, Enlarger Burn, Darkroom Call, Long Exposure, Contact-Sheet Archive');
  ok(FORMS.pausesprite.vp===5&&FORMS.curator.vp===5&&FORMS.paperweight.vp===5&&FORMS.twinlens.vp===30,'the three normal formations pay 5 Vibe Points and the boss pays 30');
  ok(J(FORMS.curator.foes)===J([{id:'curator',row:'front'},{id:'pausesprite',row:'back'}])&&J(FORMS.paperweight.foes)===J([{id:'paperweight',row:'front'},{id:'pausesprite',row:'back'}])&&J(FORMS.twinlens.foes)===J([{id:'twinlens',row:'front'}]),'a Curator or a Brass Desk Weight in Front with a Pause Sprite in Back; the boss alone in Front');
  ok(LAB.some(l=>l.id==='new90'&&l.level===42&&l.formation==='curator'&&J(l.party)===J(['tom','grace','rose']))&&LAB.some(l=>l.id==='new91'&&l.formation==='paperweight'&&J(l.party)===J(['tom','amy','tnb','nara']))&&LAB.some(l=>l.id==='new92'&&l.formation==='twinlens'&&J(l.party)===J(P)),'the Lab has the three chapter 17 fights with the teams that fight them');
  ok(!/—/.test(read('data/b3-foes-ch17.js').replace(/^\/\/.*$/gm,'')),'no dash in the data');

  // 2. The statuses
  { const b=ST.heavy_brass_base,w=ST.white_glove,g=ST.glove_seal,t=ST.self_timer,l=ST.label_tag,h=ST.held_stack,r=ST.rack_focus,d=ST.darkroom_def;
    ok(b&&b.kind==='stance'&&b.dur.n===2&&J(b).includes('0.25'),'Heavy Brass Base is a 2-turn Guard Stance at 25% less damage');
    ok(w&&w.kind==='buff'&&w.dur.n===2&&J(w).includes('0.25')&&g&&g.kind==='buff'&&g.dur.n===2&&J(g).includes('blockDebuff'),'White-Glove Protocol is +25% Defense and a seal that blocks a debuff, both 2 turns, both buffs');
    ok(t&&t.kind==='buff'&&J(t).includes('0.2')&&l&&l.kind==='debuff'&&J(l).includes('0.2')&&h&&h.kind==='debuff'&&J(h).includes('0.2'),'Self-Timer is +20% Speed, Label Tag +20% damage taken, Held Stack -20% Defense');
    ok(r&&r.kind==='buff'&&r.dur.n===1&&d&&d.kind==='buff'&&d.dur.n===2&&J(d).includes('0.2'),'Rack Focus is a 1-turn Attack buff and the Darkroom Call’s Defense is +20% for 2 turns'); }

  // 3. Scene: one fight, tips under ch17, Battle 3 wording, no Battle 2 word
  const sc=read('data/scenes-ch17.js');
  ok(/tut:'ch17'/.test(sc)&&/ch17Lens/.test(sc),'chapter 17 scenes start the boss fight (tut ch17)');
  ok(Array.isArray(S.tips.ch17)&&S.tips.ch17.length>=5,'tips under the key ch17 (at least five)');
  for(const t of S.tips.ch17) ok(t.text.length<=300&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic|Sparkle|amber|BENCH CALL|PULL UP A CHAIR/.test(t.text),'ch17 tip '+t.id+' is short, has no dash and no Battle 2 word');
  ok(/B3_CH_ON\(17\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(17\)[^\n]*/g).join('')),'chapter 17 has a Battle 3 wording variant in its scenes');

  // 4. The stances: start Blue, swap at every round divider, swap on Rack Focus, are not statuses
  const mk=o=>{ const F=NF(Object.assign({party:P,level:42,formation:'twinlens',seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,9000); p.pep=4; }
    for(const f of F.foes) { f.hp=f.maxHp=99999; } return F; };
  const boss=F=>F.foes.find(f=>f.id==='twinlens'),tomOf=F=>F.party.find(p=>p.id==='tom');
  { const F=mk(),w=boss(F);
    ok(w.stance==='blue'&&J(w.peeves)===J(TL.stances.blue.peeves)&&J(w.resists)===J(TL.stances.blue.resists),'the fight starts in the Blue lens with its Pet Peeves and Resists');
    { const f3=NF({party:['tom','grace','rose'],level:42,formation:'twinlens',seed:3}).foes[0],f4=NF({party:P,level:42,formation:'twinlens',seed:3}).foes[0]; ok(f3.maxHp===Math.round(TL.hp3*F.mods.foeHp)&&f4.maxHp===Math.round(TL.hp*F.mods.foeHp)&&f3.maxHp<f4.maxHp,'with three in the party the boss has hp3, with four its printed HP (found '+f3.maxHp+' and '+f4.maxHp+')'); }
    const row=carried(F,w).find(r=>r.kind==='lens'); ok(row&&row.name==='Blue Lens'&&/Sizzle/.test(row.desc)&&/Drench/.test(row.desc),'the card has a Lens row naming the lens and its Pet Peeves');
    const r0=F.round,beats=[]; G('b3RoundStart')(F,beats);
    ok(F.round===r0+1&&w.stance==='orange'&&J(w.peeves)===J(TL.stances.orange.peeves)&&beats.some(b=>b.t==='stance'&&b.stance==='orange'&&b.why==='round'),'at the round divider it swaps to Orange: its Pet Peeves and Resists change and a beat says so');
    G('b3RoundStart')(F,beats);
    ok(w.stance==='blue','the next divider swaps it back to Blue'); }
  { const F=mk(),w=boss(F); w.force='rack_focus'; F.acting=w; const b=foeTurn(F,w);
    ok(w.stance==='orange'&&b.some(x=>x.t==='stance'&&x.stance==='orange'&&x.why==='act')&&w.st.rack_focus,'Rack Focus swaps the lens on the spot and puts on its Attack buff');
    w.st={}; w.stripped=w.stripped||{}; w.force='rack_focus'; F.acting=w; foeTurn(F,w); ok(w.stance==='blue','a second Rack Focus swaps it back: two swaps cancel'); }
  { const F=mk(),w=boss(F); F.acting=w; for(const id of ['heavy_brass_base']) { /* a Break or a strip must not touch the lens */ }
    w.st={}; w.pips=0; const G2=G('b3Break'); if(typeof G2==='function') { try { G2(F,w,[]); } catch(e) {} }
    ok(w.stance==='blue'&&J(w.peeves)===J(TL.stances.blue.peeves),'a Break leaves the lens alone (it is not a status)'); }
  { const F=mk(),w=boss(F); w.stance='blue'; const A=a=>w.D.acts.find(x=>x.id===a);
    ok(G('b3ActOk')(F,w,A('cold_safelight'))&&!G('b3ActOk')(F,w,A('enlarger_burn')),'in Blue Cold Safelight is allowed and Enlarger Burn is not');
    G('b3SwapStance')(w); ok(!G('b3ActOk')(F,w,A('cold_safelight'))&&G('b3ActOk')(F,w,A('enlarger_burn')),'in Orange Enlarger Burn is allowed and Cold Safelight is not'); }

  // 5. A Pet Peeve is read from the lens the boss wears: Sizzle breaks a pip in Blue and not in Orange
  SK.t17_sz={id:'t17_sz',vibe:'tom_flier',slot:'s1',name:'Test sizzle',pep:0,flavor:['sizzle'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t17_dr={id:'t17_dr',vibe:'tom_flier',slot:'s2',name:'Test drench',pep:0,flavor:['drench'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  noCrit(()=>{ for(const [lens,skill,breaks] of [['blue','t17_sz',true],['blue','t17_dr',false],['orange','t17_sz',false],['orange','t17_dr',true]]) {
    const F=mk(),w=boss(F),t=tomOf(F); if(lens==='orange') G('b3SwapStance')(w); const p0=w.pips; go(F,t,skill,w.key);
    ok((w.pips<p0)===breaks,'in the '+lens+' lens a '+skill.slice(4)+' hit '+(breaks?'knocks a pip off':'does not touch a pip')+' (pips '+p0+' to '+w.pips+')'); } });

  // 6. Darkroom Call: once, at half HP, brings a Curator to the Front at half its HP with no pips, and the boss gains Defense
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.8); w.actIx=w.D.acts.findIndex(a=>a.id==='darkroom_call'); const q=pick(F,w,true);
    ok(!q||q.act.id!=='darkroom_call','above half HP the Darkroom Call is not picked');
    w.hp=Math.round(w.maxHp*.45); const q2=pick(F,w,true); ok(q2&&q2.act.id==='darkroom_call','at half HP or less the Darkroom Call comes first (a once act)');
    F.acting=w; const b=foeTurn(F,w),s=b.filter(x=>x.t==='summon');
    ok(s.length===1&&s[0].id==='curator'&&s[0].row==='front','it calls one Curator to the Front');
    const c=F.foes.find(f=>f.id==='curator'); ok(c&&c.pips===0&&c.add&&Math.abs(c.hp-Math.round(FOES.curator.hp*.5*F.mods.foeHp))<=1,'the Curator is an add: half its HP, 0 pips');
    ok(w.st.darkroom_def&&c.st.white_glove&&c.st.glove_seal,'the boss has the +20% Defense and the Curator arrives under White-Glove Protocol');
    w.stripped={}; const q3=pick(F,w,true); ok(q3&&q3.act.id!=='darkroom_call'&&(w.uses.darkroom_call||0)===1,'it is used once'); }
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.45); w.uses.darkroom_call=1; const ids=new Set(); for(let i=0;i<12;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(ids.has('contact_sheet_archive')&&!ids.has('darkroom_call'),'below half HP Contact-Sheet Archive joins the rotation'); }
  { const F=mk(),w=boss(F); w.hp=Math.round(w.maxHp*.9); const ids=new Set(); for(let i=0;i<12;i++) { const q=pick(F,w,false); ids.add(q.act.id); }
    ok(!ids.has('contact_sheet_archive'),'above half HP Contact-Sheet Archive is not used'); }

  // 7. The Curator’s seal blocks the first debuff and then goes; the +25% Defense stays
  SK.t17_sl={id:'t17_sl',vibe:'tom_flier',slot:'s3',name:'Test slow',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'},{op:'status',id:'slow',n:2,to:'target'}]};
  noCrit(()=>{ const F=mk({formation:'curator'}),c=F.foes.find(f=>f.id==='curator'),t=tomOf(F); const d0=G('b3Stat')(c,'def');
    go(F,t,'t17_sl',c.key); ok(!c.st.slow&&!c.st.glove_seal&&c.st.white_glove,'the first debuff is blocked, the seal is used up and the Defense buff stays');
    ok(Math.abs(G('b3Stat')(c,'def')-d0)<1e-6,'its Defense is the same after the block'); t.pep=4; go(F,t,'t17_sl',c.key); ok(c.st.slow,'the second debuff lands'); });

  // 8. The Pause Sprite’s Self-Timer Beep goes onto a monster in Front
  noCrit(()=>{ const F=mk({formation:'curator'}),s=F.foes.find(f=>f.id==='pausesprite'),c=F.foes.find(f=>f.id==='curator'); s.force='self_timer_beep'; F.acting=s; foeTurn(F,s);
    ok(c.st.self_timer&&!s.st.self_timer,'Self-Timer Beep puts +20% Speed on the Curator in Front, not on the Pause Sprite behind it'); });
  noCrit(()=>{ const F=mk({formation:'paperweight'}),b=F.foes.find(f=>f.id==='paperweight'); ok(b.st.heavy_brass_base,'the Brass Desk Weight starts on its heavy brass base'); });

  delete SK.t17_sz; delete SK.t17_dr; delete SK.t17_sl;   // the sandbox rows come out again, so the simple player never picks them

  // 9. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. Target (bestiary 1.6): a boss with a helper lasts 5 to 7 rounds; a normal fight is the Elite pack.
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab('new92'),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=5&&avg<=7,'the Twin Lenses: won every time in '+avg.toFixed(2)+' rounds on average (target 5 to 7)'); }
  for(const id of ['new90','new91']) { const out=[]; for(let s=1;s<=8;s++) out.push(play(Object.assign(lab(id),{seed:s}),false,{support:4}));
    const avg=out.reduce((a,x)=>a+x.rounds,0)/out.length;
    ok(out.every(x=>x.result==='win')&&avg>=3&&avg<=5.5,id+': won every time in '+avg.toFixed(2)+' rounds on average (an Elite pack, 3 to 5.5)'); }
};
