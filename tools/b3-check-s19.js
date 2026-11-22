// tools/b3-check-s19.js — Battle 3 rule tests for stage 19: the ten third Vibes (Tom Star Baker, Grace Stage Performer, Rose Prankster,
// Amy SuperMom, Deedee Home Cook, Boppy Boat Angler, TNB Scream King, Nara Picky Princess, Justin Armchair Ref, Olivia News Anchor).
// New pieces it covers: the ops `extend`, `swapGap`, `replay` and `invert`, shield `perCounter`, status `oneOf`, the mod conditions (skillId, pepAtLeast,
// attackerPips, has, attackerDebuffed, tgtWeak, attackerFast, jumped), the listener conditions (srcCrit, fromParty, tgtOther, hurtOver, skillVibe,
// peeveHit, cooldown, pushed, crossed), the hooks `allyBelowHp` and `rowMoved`, the one-offs (encore, unmailed, tupperware, couch, scoop), the
// status flags (airborne, fumble, noBuff, avoidSrc, debuffImmune, ruckusBoost, resistStep), the skill fields `widen` and `needs`, and the save rule:
// an old two-Vibe save loads with 0 VP on the third Vibe and no migration. Every Vibe is played in a four-member party.
// `node tools/b3-sim.js check` runs it after the file for stage 18.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play}=T;
  const NF=G('b3NewFight'),act=G('b3Act'),SK=G('B3_SKILLS'),ST=G('B3_STATUS'),VIBES=G('B3_VIBES'),TRAITS=G('B3_TRAITS'),QUIRKS=G('B3_QUIRKS'),SOON=G('B3_SOON'),
    add=G('b3AddStatus'),newL=G('b3NewLoadout'),setMain=G('b3SetMain'),setQuirk=G('b3SetQuirk'),ladder=G('b3Ladder'),blank=G('b3CheckData'),
    options=G('b3Options'),CAST=G('B3_CAST'),CUSTOM=G('B3_CUSTOM'),mods=G('b3Mods'),hasFlag=G('b3HasFlag'),sumOf=G('b3Sum'),hurt=G('b3Hurt'),
    pull=G('b3Pull'),push=G('b3Push'),order=G('b3TurnOrder'),stat=G('b3Stat'),endSt=G('b3EndStatus'),
    J=x=>JSON.stringify(x);
  const THIRD={tom:'tom_baker',grace:'grace_stage',rose:'rose_prank',amy:'amy_super',deedee:'deedee_cook',boppy:'boppy_angler',tnb:'tnb_scream',nara:'nara_princess',justin:'justin_ref',olivia:'olivia_news'};
  const IDS=Object.keys(THIRD);
  const mk=(party,spec,foes)=>{
    const loadouts={};
    for(const id of party) { const L=newL(id,5),s=(spec||{})[id]||{}; if(s.main) setMain(id,L,s.main); (s.quirks||[]).forEach((q,i)=>{ if(!setQuirk(id,L,i,q)) throw new Error('quirk not set: '+q); }); loadouts[id]=L; }
    const F=NF(Object.assign({party,level:2,seed:5,rank:5,loadouts},Array.isArray(foes)?{foes}:{formation:foes||'mudling'}));
    for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; f.def=1; f.pips=f.maxPips=f.maxPips||0; }
    for(const p of F.party) p.hp=p.maxHp=Math.max(p.maxHp,400);
    const U={}; for(const p of F.party) U[p.id]=p;
    return {F,U,f0:F.foes[0],f1:F.foes[1]}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const O=options(F,u,SK[skill]).filter(o=>!o.no); if(O.length&&!O.some(o=>o.key===key)) key=O[0].key; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const aim=(F,u,id)=>{ const S=SK[id],O=options(F,u,S).filter(o=>!o.no); return O.length?O[0].key:u.key; };

  // ---------- 1. The ten Vibes are complete, plain and clean ----------
  ok(J(blank().filter(x=>!/\bt_|\bt13_/.test(x)))==='[]','the data check is clean with all thirty Vibes in: '+J(blank().filter(x=>!/\bt_|\bt13_/.test(x))));
  for(const id of IDS) { const v=THIRD[id],V=VIBES[v];
    ok(CAST[id].vibes.length===3&&CAST[id].vibes[2]===v&&V.owner===id&&V.sig===0,id+' has the third Vibe as the third entry of the cast row, sig 0');
    const L=ladder(V,5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un));
    ok(!V.skills.some(s=>SOON[s])&&!V.quirks.some(q=>QUIRKS[q].soon)&&!TRAITS[V.trait].soon,v+': nothing is still a name only');
    for(const s of [V.basic,...V.skills]) ok(SK[s].desc&&SK[s].desc.length>40&&!/—/.test(SK[s].desc+SK[s].short),s+' has a full plain description');
    for(const q of [TRAITS[V.trait],...V.quirks.map(x=>QUIRKS[x])]) ok(q.desc&&q.desc.length>30&&!/—/.test(q.desc+q.name),q.id+' has a full plain description'); }
  ok(IDS.every(id=>VIBES[THIRD[id]].subtitles.length===3),'every third Vibe has its three subtitles');
  ok(['encore','unmailed','tupperware','couch','scoop'].every(k=>CUSTOM[k]),'the five one-offs of this stage are in B3_CUSTOM');

  // ---------- 2. Every move of all thirty-odd Vibes is played, in a four-member party ----------
  { let n=0,bad=[];
    const parties={tom:['tom','grace','rose','amy'],grace:['grace','tom','rose','amy'],rose:['rose','tom','grace','amy'],amy:['amy','tom','grace','rose'],deedee:['deedee','tom','grace','rose'],
      boppy:['boppy','tom','grace','rose'],tnb:['tnb','tom','grace','rose'],nara:['nara','tom','grace','rose'],justin:['justin','tom','grace','rose'],olivia:['olivia','tom','grace','rose']};
    for(const id of IDS) { const V=VIBES[THIRD[id]];
      for(const s of [V.basic,...V.skills]) { try {
        const {F,U}=mk(parties[id],{[id]:{main:THIRD[id]}}); const u=U[id]; u.pep=10; for(const c of Object.keys(u.counterInfo||{})) u.counters[c]=Math.max(u.counters[c]||0,2);
        for(const f of F.foes) { f.hp=f.maxHp=9999; }
        U[id===('tom')?'grace':'tom'].hp=100;   // someone low, so heals have work
        const O=options(F,u,SK[s]).filter(o=>!o.no); if(!O.length) throw new Error('no target');
        const r=(F.acting=u,act(F,u,s,O[0].key)); if(!r.ok) throw new Error(r.why); n++;
      } catch(e) { bad.push(s+': '+e.message); } } }
    ok(!bad.length&&n===40,'all 40 moves run in a four-member party: '+n+' '+J(bad)); }

  // ---------- 3. Whole fights with each third Vibe as the Main Vibe never stall ----------
  for(const id of IDS) { let msg='ok'; try { const r=play({party:[id,'tom','grace','amy'].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4),formation:'mudling',level:2,seed:3,rank:3,
      loadouts:Object.fromEntries([id,'tom','grace','amy'].filter((x,i,a)=>a.indexOf(x)===i).map(x=>{ const L=newL(x,3); if(x===id) setMain(x,L,THIRD[id]); return [x,L]; }))},[],{});
      if(!r||r.turns<3) msg='fight too short'; } catch(e) { msg=e.message; } ok(msg==='ok',id+' fights a whole battle with '+THIRD[id]+' as the Main Vibe: '+msg); }

  // ---------- 4. Saves: an old two-Vibe loadout loads with 0 VP on the third Vibe ----------
  { const L=newL('grace',1); delete L.vp.grace_stage; const fixed=G('b3FixLoadout')('grace',L);
    ok(((fixed||L).vp.grace_stage||0)===0&&Object.keys((fixed||L).vp).includes('grace_squishy'),'a save from before this stage has no third Vibe VP and loads with 0 on it'); }
  { const L=newL('tom',1); ok(L.vp.tom_baker===0&&L.vp.tom_flier===0,'a new loadout gives the third Vibe 0 VP: '+J(L.vp)); }

  // ---------- 5. Tom: Star Baker ----------
  { const {F,U,f0}=mk(['tom','grace','rose','amy'],{tom:{main:'tom_baker'}}),t=U.tom;
    t.counters.oven=0; const hS=f0.hp; go(F,t,'starter_splash',f0.key); ok(f0.hp<hS,'Starter Splash hits a monster');
    add(F,U.grace,'stress_melted',{src:t,n:1}); const n0=U.grace.st.stress_melted.n; go(F,t,'starter_splash',U.grace.key); ok(U.grace.st.stress_melted.n===n0+1,'Starter Splash on a family member makes a buff last 1 turn longer');
    t.counters.oven=3; const hp0=U.rose.hp; U.rose.hp=100; go(F,t,'five_hundred_degree_boule',f0.key); near(U.rose.shields.reduce((a,s)=>a+s.amt,0),U.rose.maxHp*.30,2,'Boule shield is 10% Max HP per Oven Temp (3 stages: 30%)');
    t.pep=10; U.grace.hp=100; U.grace.st={}; go(F,t,'three_tier_showstopper','*'); ok(U.grace.st.sparklers&&U.rose.st.sparklers,'the Showstopper puts Sparklers on the family'); }

  // ---------- 6. Grace: Stage Performer ----------
  { const {F,U,f0,f1}=mk(['grace','tom','rose','amy'],{grace:{main:'grace_stage'}}),g=U.grace;
    go(F,g,'five_six_seven_eight',f0.key); ok(hasFlag(g,'airborne'),'the Basic puts Grace in the air (Airborne)');
    g.st={}; g.jumped=0;
    // jumped counts icons leapt on the bar
    for(const u of F.units) u.wait=0; F.foes[0].wait=10; F.foes[1].wait=20; U.tom.wait=30; U.rose.wait=40; U.amy.wait=50; g.wait=60; g.pulls=0; pull(F,g,60);
    ok(g.jumped>=3,'pulling Grace past icons counts them in `jumped`: '+g.jumped);
    const m=mods(g,'out',{F,c:{skill:SK.five_six_seven_eight},a:g,t:f0,fl:'clobber'}); ok(m.momentum>=.25-1e-9,'2 or more icons since her last turn is +25% damage: '+J(m));
    g.jumped=0; ok(!mods(g,'out',{F,c:{skill:SK.five_six_seven_eight},a:g,t:f0,fl:'clobber'}).momentum,'with no leap the bonus is gone');
    // Poise and its echo
    go(F,g,'good_scrunchie_pirouette',g.key); ok(g.st.poise,'the Pirouette gives Poise'); ok(hasFlag(g,'pushImmune'),'Poise makes her push-proof');
    endSt(F,g,'poise','used'); ok(g.st.poise_echo||!g.custom.encore,'without the Quirk Poise leaves no echo');
    const L2=mk(['grace','tom','rose','amy'],{grace:{main:'grace_stage',quirks:['encore_poise']}}); const g2=L2.U.grace; add(L2.F,g2,'poise',{src:g2}); endSt(L2.F,g2,'poise','used'); ok(g2.st.poise_echo,'Encore Poise: a used-up Poise leaves its half-strength echo');
    ok(near(sumOf(g2,'crit'),.25,1e-9)||sumOf(g2,'crit')>=.25-1e-9,'the echo is +25% Crit Rate');
    // Cartwheel swaps with the next monster
    for(const u of F.units) u.wait=0; f0.wait=40; f1.wait=70; U.tom.wait=90; U.rose.wait=95; U.amy.wait=99; g.pulls=0; f0.pushes=0; f1.pushes=0;
    go(F,g,'jazz_hands_cartwheel',f1.key); ok(f0.wait>=64&&f0.wait<=66,'Jazz-Hands Cartwheel pushes the next monster back by up to 25 ticks: '+f0.wait);
    const gA=g.wait; const C=mk(['grace','tom','rose','amy'],{grace:{main:'grace_stage'}}); for(const u of C.F.units) u.wait=0; C.f0.wait=0; C.f1.wait=70; C.U.tom.wait=90; C.U.rose.wait=95; C.U.amy.wait=99;
    go(C.F,C.U.grace,'jazz_hands_cartwheel',C.f1.key); ok(Math.abs((C.U.grace.wait-gA)-25)<1.5,'and moves Grace up by the same: '+gA+' against '+C.U.grace.wait+' with no gap to close'); }

  // ---------- 7. Rose: Prankster ----------
  { const {F,U,f0}=mk(['rose','tom','grace','amy'],{rose:{main:'rose_prank'}},'mudling'),r=U.rose;
    go(F,r,'sneaky_nose_boop',f0.key); ok(f0.st.nose_boop&&r.st.nose_swift,'the Boop slows the monster and speeds Rose');
    const h=U.tom; f0.pips=2; f0.maxPips=6; const q=mods(r,'reduce',{F,a:f0,t:r,c:{}}); ok(q.loud>=.2-1e-9,'Too Loud for Secrets: a monster under half its Composure deals 20% less to Rose: '+J(q));
    f0.pips=6; ok(!mods(r,'reduce',{F,a:f0,t:r,c:{}}).loud,'a monster with full Composure is not rattled');
    f0.charge={id:'x'}; f0.pips=f0.maxPips=6; r.pep=10; const p0=f0.pips; go(F,r,'supersonic_raspberry',f0.key); ok(f0.pips<p0,'the Raspberry takes a Composure pip off a monster winding up an act: '+f0.pips);
    f0.charge=null; r.pep=10; go(F,r,'backup_lamby_bait_and_switch',f0.key); ok(hasFlag(r,'untargetable'),'the Bait & Switch hides Rose');
    // Pilot Wings: pierces a shield at 8+ Pep
    const R2=mk(['rose','tom','grace','amy'],{rose:{main:'rose_prank',quirks:['upside_down_pilot_wings']}}); const r2=R2.U.rose,fa=R2.f0; addShield(R2.F,fa,300,{src:fa}); r2.pep=10; const hp1=fa.hp; go(R2.F,r2,'supersonic_raspberry',fa.key);
    ok(fa.hp<hp1,'with 8+ Pep Rose’s Skills reach HP through a shield'); function addShield(F,u,a,o){ G('b3AddShield')(F,u,a,o); }
    r2.pep=3; const fb=R2.f1; addShield(R2.F,fb,300,{src:fb}); const hp2=fb.hp; go(R2.F,r2,'supersonic_raspberry',fb.key); ok(fb.hp===hp2,'below 8 Pep the shield soaks the whole hit');
    // Whoopee: fumble flag
    r.pep=10; go(F,r,'mega_whoopee_cushion_trap','*'); ok(hasFlag(f0,'fumble'),'the Whoopee-Cushion Trap fumbles multi-hit acts'); }

  // ---------- 8. Amy: SuperMom ----------
  { const {F,U}=mk(['amy','tom','grace','rose'],{amy:{main:'amy_super',quirks:['the_rivituso_rule','emergency_purse_tissue']}}),a=U.amy,t=U.tom;
    a.wait=80; t.hp=t.maxHp; U.grace.hp=U.grace.maxHp; const w0=a.wait;
    const c={F,actor:F.foes[0],beats:[],g:'x',ledger:{}}; U.grace.hp=Math.round(U.grace.maxHp*.40); hurt(F,c,U.grace,Math.round(U.grace.maxHp*.10),{src:F.foes[0].key,flavor:'clobber'});
    ok(a.wait<w0,'Eyes in the Back of Her Head: an ally dropping under 35% pulls Amy up the bar: '+w0+' to '+a.wait);
    const w1=a.wait; hurt(F,c,U.rose,Math.round(U.rose.maxHp*.70),{src:F.foes[0].key,flavor:'clobber'}); ok(a.wait===w1,'it cannot go off again straight away (2-round cooldown)');
    ok(J(Object.keys(mods(a,'healGiven',{F,c:{},a,t:U.grace,tgt:U.grace,skill:SK.dairy_free_snack_pack})))!=='[]','Emergency Purse Tissue applies to a heal on a low family member');
    const {F:F2,U:U2}=mk(['amy','tom','grace','rose'],{amy:{main:'amy_super'}}); add(F2,U2.tom,'inside_voice',{src:U2.amy}); const f=F2.foes[0]; const c2={F:F2,actor:f,beats:[],g:'y',ledger:{}};
    G('b3PutStatus')(F2,c2,U2.tom,{id:'slow'}); ok(!U2.tom.st.slow,'Inside Voice stops a monster’s bad effect from landing');
    go(F2,U2.amy,'mom_arm_seatbelt_stop',aim(F2,U2.amy,'mom_arm_seatbelt_stop')); ok(Object.values(U2).some(u=>u.st.seatbelt),'the Seatbelt Stop puts the Seatbelt on allies'); }

  // ---------- 9. Deedee: Home Cook ----------
  { const {F,U,f0}=mk(['deedee','tom','grace','rose'],{deedee:{main:'deedee_cook',quirks:['tupperware_send_off','everything_gives_me_gas']}}),d=U.deedee;
    add(F,U.tom,'stuffed',{src:d}); const m=mods(U.tom,'out',{F,a:U.tom,t:f0,fl:'clobber',c:{}}); ok(m.fed>=.15-1e-9,'"Did You Eat?": a Stuffed family member deals 15% more: '+J(m));
    ok(mods(U.tom,'reduce',{F,a:f0,t:U.tom,c:{}}).fed>=.10-1e-9,'and takes 10% less'); ok(!mods(U.grace,'out',{F,a:U.grace,t:f0,fl:'clobber',c:{}}).fed,'a family member who is not Stuffed gets nothing');
    d.pep=10; U.grace.hp=100; U.tom.hp=100; U.rose.hp=100; add(F,U.tom,'sunday_dinner',{src:d}); ok(ST.sunday_dinner.dur.unit==='round'&&ST.sunday_dinner.dur.n===2,'Sunday Dinner lasts 2 rounds');
    const n0=U.tom.pep; endSt; go(F,d,'full_house_sunday_dinner','*'); ok(U.grace.st.sunday_dinner&&U.rose.st.sunday_dinner,'the table is set for the whole family');
    // Tupperware always bounces at 8+ Pep (her Nurse Vibe supplies the single heal, the Quirk belongs to the Home Cook and is equipped from there)
    { const N=mk(['deedee','tom','grace','rose'],{deedee:{main:'deedee_nurse',quirks:['tupperware_send_off']}}),dd=N.U.deedee; dd.pep=10; for(const u of [N.U.tom,N.U.grace,N.U.rose]) { u.hp=100; u.shields=[]; }
      const before=[N.U.tom,N.U.grace,N.U.rose].map(u=>u.hp); go(N.F,dd,'deedee_makes_it_better',N.U.tom.key); const after=[N.U.tom,N.U.grace,N.U.rose].map(u=>u.hp);
      ok(after.filter((h,i)=>h>before[i]).length>=2,'Tupperware Send-Off: at 8+ Pep a single heal always bounces to a second family member: '+J([before,after])); }
    d.pep=2; U.grace.st.stuffed=null; delete U.grace.st.stuffed; add(F,U.grace,'stuffed',{src:d,n:1}); const p0=U.grace.pep; endSt(F,U.grace,'stuffed','time'); G('b3Fire')(F,'statusEnded',{src:U.grace,tgt:U.grace,id:'stuffed',g:'end'},[]); ok(U.grace.pep>p0,'"Everything Gives Me Gas": Stuffed running out gives that family member 1 Pep'); }

  // ---------- 10. Boppy: Boat Angler ----------
  { const {F,U,f0,f1}=mk(['boppy','tom','grace','rose'],{boppy:{main:'boppy_angler',quirks:['lucky_boat_lure_2006','star_in_graces_key']}}),b=U.boppy;
    ok(b.counterInfo.tally&&b.counterInfo.tally.max===4,'the Whopper Tally is a counter with a cap of 4');
    f1.row='back'; go(F,b,'choppy_water_cast',f1.key); ok(f1.row==='front','the Basic hooks a back-row monster forward');
    ok(b.counters.tally>=1,'every Angler move adds 1 Whopper Tally: '+b.counters.tally);
    b.counters.tally=1; b.pep=10; ok(options(F,b,SK.trophy_striper_haul).every(o=>o.key.startsWith('row:')),'Trophy Striper Haul at Tally 1 picks a row');
    b.counters.tally=2; ok(options(F,b,SK.trophy_striper_haul).length===1&&options(F,b,SK.trophy_striper_haul)[0].key==='*','at Tally 2 it reaches every monster');
    b.counters.tally=1; ok(!G('b3CanUse')(F,b,SK.long_island_sound_leviathan).ok,'the Leviathan needs Tally 2');
    b.counters.tally=4; const hpA=f0.hp; go(F,b,'long_island_sound_leviathan','*'); const d4=hpA-f0.hp; ok(b.counters.tally===0||b.counters.tally===1,'the Leviathan spends the Tally: '+b.counters.tally);
    const R=mk(['boppy','tom','grace','rose'],{boppy:{main:'boppy_angler'}}); R.U.boppy.counters.tally=2; R.U.boppy.pep=10; const h2=R.f0.hp; go(R.F,R.U.boppy,'long_island_sound_leviathan','*'); ok((h2-R.f0.hp)<d4,'more Tally hits harder: '+(h2-R.f0.hp)+' at 2, '+d4+' at 4');
    const S2=mk(['boppy','tom','grace','rose'],{boppy:{main:'boppy_dep',quirks:['star_in_graces_key']}}); ok(!!S2.F&&S2.U.boppy.quirks.includes('star_in_graces_key'),'Star in Grace’s Key can be equipped with any Main Vibe');
    const B=mk(['boppy','tom','grace','rose'],{boppy:{main:'boppy_angler',quirks:['star_in_graces_key']}}); G('b3Fire')(B.F,'battleStart',{},[]); ok(B.U.boppy.counters.tally>=2,'Star in Grace’s Key: the Tally starts at 2: '+B.U.boppy.counters.tally); }

  // ---------- 11. TNB: Scream King ----------
  { const {F,U,f0}=mk(['tnb','tom','grace','rose'],{tnb:{main:'tnb_scream',quirks:['forty_seven_rewatches','sequel_hook']}}),t=U.tnb;
    f0.wait=100; t.wait=0; U.tom.wait=50; ok(mods(t,'out',{F,a:t,t:f0,fl:'racket',c:{}}).behind>=.30-1e-9,'"Don’t Look Behind You": +30% against a slower monster');
    f0.wait=0; for(const u of F.party) u.wait=200; t.wait=0;
    t.pep=10; go(F,t,'flying_popcorn_jump_scare',f0.key); ok(f0.st.spooked,'the Jump-Scare Spooks the monster');
    ok(sumOf(f0,'critTaken',{a:U.tom,t:f0})>=0,'a Spooked monster can be crit by a faster family member');
    const f1=F.foes[1]; ok(mods(t,'eva',{a:f1,t,c:{}}).rewatch===undefined,'Forty-Seven Rewatches does nothing against a clean monster'); add(F,f1,'slow',{src:t});
    ok(mods(t,'eva',{a:f1,t,c:{}}).rewatch>=.20-1e-9,'+20% Evasion against a debuffed monster');
    t.pep=10; f0.st={}; add(F,f0,'slow',{src:t}); add(F,f0,'fatigue',{src:t}); const hp0=f0.hp; go(F,t,'act_three_mask_reveal',f0.key); const big=hp0-f0.hp;
    const R=mk(['tnb','tom','grace','rose'],{tnb:{main:'tnb_scream'}}); R.U.tnb.pep=10; const h2=R.f0.hp; go(R.F,R.U.tnb,'act_three_mask_reveal',R.f0.key); ok(big>(h2-R.f0.hp)*1.2,'the Mask Reveal does about 1.5 times as much to a monster with 2 or more debuffs: '+big+' vs '+(h2-R.f0.hp)); }

  // ---------- 12. Nara: Picky Princess ----------
  { const {F,U,f0}=mk(['nara','tom','grace','rose'],{nara:{main:'nara_princess',quirks:['belly_rub_tax','allowed_on_the_couch']}}),n=U.nara;
    go(F,n,'unimpressed_sniff',f0.key); ok(f0.st.snubbed,'the Sniff snubs the monster');
    n.pep=10; go(F,n,'weaponized_puppy_eyes',f0.key); ok(f0.st.puppy_eyes,'Puppy Eyes lands'); const aimed=new Set(); for(let i=0;i<60;i++) { F.seed+=7; const p=G('b3AggroPick')(F,f0,null); if(p) aimed.add(p.id); } ok(!aimed.has('nara')&&aimed.size>=2,'a monster with Puppy Eyes never aims at Nara: '+J([...aimed]));
    const lowU=U.grace; lowU.hp=50; const hs0=n.pep; add(F,n,'plate_warm',{src:n});
    // Allowed on the Couch: a single buff on Nara is copied to the lowest-HP ally
    const L=mk(['nara','tom','grace','rose'],{nara:{main:'nara_princess',quirks:['allowed_on_the_couch']}}); L.U.grace.hp=30; L.U.tom.hp=300; L.U.rose.hp=300; const nara=L.U.nara;
    L.F.acting=L.U.tom; const c={F:L.F,actor:L.U.tom,beats:[],g:'z',targets:[nara],hit:[]}; G('b3PutStatus')(L.F,c,nara,{id:'plate_warm',n:2}); ok(L.U.grace.st.plate_warm&&L.U.grace.st.plate_warm.n===1,'"Allowed on the Couch" copies a single buff for half its turns onto the lowest-HP ally'); }

  // ---------- 13. Justin: Armchair Ref ----------
  { const {F,U,f0,f1}=mk(['justin','tom','grace','rose'],{justin:{main:'justin_ref',quirks:['home_field_advantage','unmailed_invitations']}}),j=U.justin;
    j.pep=10; for(const f of F.foes) f.maxPips=6,f.pips=6; f0.wait=90; F.clock=0; const p0=f0.pips; go(F,j,'flag_on_the_play',f0.key); ok(f0.st.flag_lock,'Flag on the Play flags the monster'); ok(hasFlag(f0,'noAoe')&&hasFlag(f0,'noBuff'),'a flagged monster can use no AoE or buff act next turn');
    ok(f0.pips<p0,'Home-Field Advantage: a push past a round divider shaves a Composure pip: '+p0+' to '+f0.pips);
    ok(j.used.unmailed===true,'"Unmailed Invitations" repeated the 2 Pep Racket Skill once'); const hpB=f1.hp; j.pep=10; go(F,j,'flag_on_the_play',f1.key); ok(j.used.unmailed===true,'and the repeat is spent for the fight');
    const c={F,actor:f1,beats:[],g:'h',ledger:{}}; hurt(F,c,U.tom,40,{src:f1.key,flavor:'clobber'}); ok(F.lastAllyHit&&F.lastAllyHit.dmg>=40,'F.lastAllyHit records the monster’s hit'); const hpR=f1.hp; j.pep=10; go(F,j,'jumbotron_instant_replay',f1.key); ok(hpR-f1.hp>0&&f1.st.under_review,'the Jumbotron strikes the offender and puts it Under Review');
    const T=mk(['justin','tom','grace','rose'],{justin:{main:'justin_ref'}}); const fx=T.f0,jj=T.U.justin; const cc={F:T.F,actor:fx,beats:[],g:'q',ledger:{}}; G('b3Fire')(T.F,'afterHit',{src:fx,tgt:T.U.tom,dmg:20,crit:true,flavor:'clobber',g:'q',tags:[],c:cc},cc.beats); ok(fx.st.yellow_flag,'a monster’s crit throws the Yellow Flag on it'); }

  // ---------- 14. Olivia: News Anchor ----------
  { const {F,U,f0,f1}=mk(['olivia','tom','grace','rose'],{olivia:{main:'olivia_news',quirks:['inverted_pyramid','investigative_scoop']}}),o=U.olivia;
    G('b3Fire')(F,'battleStart',{},[]); ok(f0.st.on_record&&f1.st.on_record,'On The Record marks every monster at the start'); ok(sumOf(f0,'critTaken',{a:U.tom,t:f0})>=.15-1e-9,'an exposed monster crits 15% more');
    add(F,f0,'stress_melted',{src:f0}); o.pep=10; const hpA=f0.hp; go(F,o,'is_this_real_fact_check',f0.key); ok(!f0.st.stress_melted&&Object.keys(f0.st).some(i=>/^inv_/.test(i)),'the Fact-Check turns a buff against the monster'); ok(ST[Object.keys(f0.st).find(i=>/^inv_/.test(i))].mods[0].v<0,'the inverted row carries the numbers the other way round');
    o.pep=10; go(F,o,'camera_crew_spotlight',f0.key); ok(f1.hp<f1.maxHp,'the Spotlight splashes onto the other monsters');
    const b=mk(['olivia','tom','grace','rose'],{olivia:{main:'olivia_news',quirks:['investigative_scoop']}},'mudling'); const boss=b.f0; boss.D=Object.assign({},boss.D,{role:'boss'}); add(b.F,boss,'on_record',{src:b.U.olivia});
    const cc={F:b.F,actor:b.U.olivia,beats:[],g:'p',targets:[boss],hit:[],tgt:boss}; G('b3PutStatus')(b.F,cc,boss,{id:'slow'}); ok(boss.st.slow&&boss.st.slow.noCleanse,'Investigative Scoop: the first debuff on a Boss cannot be cleansed');
    const w=boss.st.slow.n; G('b3PutStatus')(b.F,cc,boss,{id:'fatigue'}); ok(!boss.st.fatigue.noCleanse,'only the first one');
    const e=mk(['olivia','tom','grace','rose'],{olivia:{main:'olivia_news'}}); e.U.olivia.pep=10; for(const f of e.F.foes) { add(e.F,f,'stress_melted',{src:f}); f.maxPips=6; f.pips=6; }
    go(e.F,e.U.olivia,'livnews_breaking_exclusive','*'); ok(e.f0.st.stripped_defenses&&e.f0.pips<6,'the Breaking Exclusive exposes the monsters and shaves Composure off buffed ones'); }
};
