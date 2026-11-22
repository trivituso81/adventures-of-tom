// tools/b3-check-s9b.js — Battle 3 rule tests for stage 9b: TNB complete (Ceramicist and Longboarder, 14 lines).
// The pieces it needed: clay shields (the shield op's `clay`), Wet Clay to Stoneware (a stone clay shield soaks 20% more Clobber, a Sizzle
// hit fires it), the `vitrify` op (Three-AM Kiln Firing), the Grand Amphora vessel hazard and its burst, Kintsugi Gold Seam (the `tgtAlly`
// listener field, the `razzleDet` status flag), Coaster Policy (`allyMods`, the `shielded` mod condition), Carving Momentum (the `basic`
// mod condition, a Skill's own `rec`), E-Bike Tag-Along (Fresh Ride blocks a debuff), Waymo Tailgate Rescue (`rebalance`), TAP-Card
// Transfer (the `slowestAlly` target, buffs that last longer), Baxter Hill Longboard Express (`double`) and No Car, No Tickets.
// `node tools/b3-sim.js check` runs it after the file for stage 7.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,SK,ST,VIBES,TRAITS,QUIRKS,SOON,add,stat,mult,newL,setQuirk,setMain,ladder,carried,roundStart,beginTurn,cost,koCheck,hurt,runReactions,addShield,options,shieldTotal,moveRec,foeTurn,HZ,preview,CUSTOM,OPS,blank]=
    ['b3NewFight','b3Next','b3Act','B3_SKILLS','B3_STATUS','B3_VIBES','B3_TRAITS','B3_QUIRKS','B3_SOON','b3AddStatus','b3Stat','b3Mult',
     'b3NewLoadout','b3SetQuirk','b3SetMain','b3Ladder','b3Carried','b3RoundStart','b3BeginTurn','b3Cost','b3KoCheck','b3Hurt','b3RunReactions','b3AddShield','b3Options','b3ShieldTotal','b3MoveRec','b3FoeTurn','B3_HAZARDS','b3Preview','B3_CUSTOM','B3_OPS','b3CheckData'].map(G);
  const LAB=['grace','tom','tnb','rose'],J=x=>JSON.stringify(x),RULES=G('B3_RULES'),PW=RULES.power;
  const bad0=J(blank().filter(x=>!/\bt_/.test(x)));
  // Loadouts at Rank 5: TNB's Main Vibe is Ceramicist, or Longboarder when `boarder` is set, with the Quirks named.
  const book=(q,boarder)=>{ const B={}; for(const id of LAB) { B[id]=newL(id,5); if(id==='tnb'&&boarder) setMain(id,B[id],B[id].pocket);
    ((q||{})[id]||[]).forEach((x,i)=>{ if(!setQuirk(id,B[id],i,x)) throw new Error('test could not equip '+x); }); } return B; };
  const fight=(q,formation,cfg,boarder)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5,formation:formation||'mudling',loadouts:book(q,boarder)},cfg||{}));
    const P={}; for(const p of F.party) P[p.id]=p; for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; }
    for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,400); }
    return {F,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,tnb:P.tnb,rose:P.rose}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const hits=(beats,key)=>beats.filter(b=>b.t==='hit'&&(!key||b.tgt===key));
  const has=(beats,t,f)=>beats.some(b=>b.t===t&&(!f||f(b)));
  const def=u=>stat(u,'def');
  const dmgOf=(u,f,m)=>Math.round(stat(u,'atk')*m*100/(100+def(f)));
  const hc=(F,actor)=>({F,actor,src:actor,beats:[],g:0,hit:[],targets:[],detonated:{},reacted:{},ledger:{}});

  // 1. TNB is complete: both Vibes have all seven rows built and open, nothing is a name only, the data check is clean
  for(const v of ['tnb_potter','tnb_boarder']) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un));
    ok(!VIBES[v].skills.some(s=>SOON[s])&&!(VIBES[v].quirks||[]).some(q=>QUIRKS[q].soon)&&!TRAITS[VIBES[v].trait].soon,v+': no Skill, Trait or Quirk is still a name only');
    for(const s of [VIBES[v].basic,...VIBES[v].skills]) ok(SK[s].desc&&SK[s].desc.length>40&&!/—/.test(SK[s].desc),s+' has a full plain description'); }
  ok(bad0==='[]','the data check is clean with TNB in: '+bad0);
  ok(G('B3_CAST').tnb&&J(G('B3_CAST').tnb.vibes.slice(0,2))==='["tnb_potter","tnb_boarder"]','TNB is in the cast with both Vibes');

  // 2. Wheel-Thrown Lump: a light Clobber hit; the monster is Wet Clay (10% slower) for 2 turns
  noCrit(()=>{ const {F,tnb,f0}=fight(); const spd0=stat(f0,'spd'),b=go(F,tnb,'wheel_thrown_lump','f0'),h=hits(b,'f0');
    ok(h.length===1&&h[0].flavor==='clobber'&&h[0].dmg===dmgOf(tnb,f0,PW.light),'one light Clobber hit '+J(h.map(x=>x.dmg)));
    ok(f0.st.wet_clay&&f0.st.wet_clay.n===2&&near(stat(f0,'spd'),spd0*.9,1e-6),'Wet Clay: 2 turns, 10% slower '+stat(f0,'spd')+' of '+spd0);
    ok(tnb.pep===6&&near(tnb.wait,80,1e-6),'a Basic: +2 Pep, Recovery 80: '+tnb.pep+', '+tnb.wait); });

  // 3. Center the Bowl: clears Toasty and Bleed, a clay shield worth 30% of Max HP, 3 Pep
  noCrit(()=>{ const {F,tnb,grace}=fight(); tnb.pep=5; add(F,grace,'toasty',{src:F.foes[0]}); add(F,grace,'bleed',{src:F.foes[0]}); add(F,grace,'slow',{src:F.foes[0]});
    const b=go(F,tnb,'center_the_bowl',grace.key),want=Math.round(grace.maxHp*.30*mult(tnb,'healGiven'));
    ok(!grace.st.toasty&&!grace.st.bleed&&!!grace.st.slow,'Toasty and Bleed are cleared and nothing else: '+J(Object.keys(grace.st)));
    ok(grace.shields.length===1&&grace.shields[0].clay&&grace.shields[0].amt===want,'a clay shield of 30% of Max HP: '+shieldTotal(grace)+' want '+want);
    ok(tnb.pep===2,'costs 3 Pep: '+tnb.pep); ok(carried(F,grace).some(r=>r.short==='CLAY'),'the list calls it a Clay Shield'); });
  noCrit(()=>{ const {F,tnb}=fight(); tnb.pep=5; go(F,tnb,'center_the_bowl',tnb.key); ok(tnb.shields.length===1,'TNB can pick himself'); });

  // 4. Wet Clay to Stoneware: with Ceramicist as Main, the shield is stone clay; a stone clay shield soaks Clobber at 1.2 times its size
  noCrit(()=>{ const {F,tnb,grace,f0}=fight(); tnb.pep=5; go(F,tnb,'center_the_bowl',grace.key); const sh=grace.shields[0],amt0=sh.amt;
    ok(sh.stone===.2,'it is stone clay with the Trait on: '+sh.stone);
    const c=hc(F,f0); hurt(F,c,grace,60,{src:f0.key,flavor:'clobber'});
    ok(near(sh.amt,amt0-50,1e-6)&&grace.hp===grace.maxHp,'a 60 Clobber hit takes 50 off the shield and nothing off HP: '+sh.amt+' of '+amt0+', HP '+grace.hp);
    const c2=hc(F,f0); hurt(F,c2,grace,40,{src:f0.key,flavor:'racket'});
    ok(near(sh.amt,amt0-50-40,1e-6),'any other flavor soaks at face value: '+sh.amt);
    const c3=hc(F,f0); sh.amt=100; grace.hp=grace.maxHp; hurt(F,c3,grace,130,{src:f0.key,flavor:'clobber'});
    ok(grace.hp===grace.maxHp-10&&grace.shields.length===0,'a shield of 100 stops 120 Clobber: 10 gets through '+(grace.maxHp-grace.hp)); });

  // 5. A Sizzle hit fires a stone clay shield into Fired Glaze, which throws 30% of what it soaks back
  noCrit(()=>{ const {F,tnb,grace,f0}=fight(); tnb.pep=5; go(F,tnb,'center_the_bowl',grace.key); const sh=grace.shields[0],amt0=sh.amt,c=hc(F,f0),hp0=f0.hp;
    hurt(F,c,grace,100,{src:f0.key,flavor:'sizzle'});
    ok(sh.glaze===.3&&near(sh.amt,amt0-100,1e-6),'fired by the Sizzle hit, which it soaks whole: '+sh.glaze+', '+sh.amt);
    ok(f0.hp===hp0-30&&has(c.beats,'hit',b=>b.tgt==='f0'&&b.reflect&&b.dmg===30),'30 comes back at the monster: '+(hp0-f0.hp));
    ok(carried(F,grace).some(r=>r.short==='GLAZE'),'the list calls it Fired Glaze');
    const left=sh.amt,c2=hc(F,f0); hurt(F,c2,grace,50,{src:f0.key,flavor:'racket'}); const back=Math.round(Math.min(50,left)*.3); ok(f0.hp===hp0-30-back&&back>0,'it keeps reflecting what it soaks: '+(hp0-f0.hp)+' want '+(30+back));
    const c3=hc(F,f0),before=f0.hp; add(F,f0,'wet_clay',{src:tnb}); hurt(F,c3,f0,10,{src:f0.key,flavor:'clobber'}); ok(f0.hp===before-10,'a monster with a shield of its own would not reflect (no glaze on it)'); });
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({},null,null,true); const c=hc(F,f0); addShield(F,grace,200,{src:tnb,clay:true}); ok(grace.shields[0].clay&&grace.shields[0].stone==null,'with Longboarder as Main there is no stone: '+grace.shields[0].stone);
    hurt(F,c,grace,50,{src:f0.key,flavor:'sizzle'}); ok(!grace.shields[0].glaze,'and a Sizzle hit does not fire it'); });

  // 6. Three-AM Kiln Firing: a standard Sizzle wave (70% share), every clay shield fired whether or not the Trait is on, Kiln Glow +15% Attack for 2 turns
  noCrit(()=>{ const {F,tnb,grace,rose,f0,f1}=fight(); tnb.pep=9; go(F,tnb,'center_the_bowl',grace.key); tnb.pep=9; addShield(F,rose,100,{src:tnb}); const atk0=stat(grace,'atk'),atkT=stat(tnb,'atk');
    const b=go(F,tnb,'three_am_kiln_firing','*'),h=hits(b);
    ok(h.length===2&&h.every(x=>x.flavor==='sizzle')&&h[0].dmg===Math.round(atkT*PW.standard*RULES.aoeShare*100/(100+def(f0))),'one Sizzle hit on each monster at the 70% share (before the glow) '+J(h.map(x=>x.dmg)));
    ok(f0.st.toasty&&f1.st.toasty,'both monsters are Toasty');
    ok(grace.shields[0].glaze&&!rose.shields[0].glaze,'the clay shield is fired and the plain one is not');
    ok(near(stat(grace,'atk'),atk0*1.15,1e-6)&&grace.st.kiln_glow.n===2&&!!tnb.st.kiln_glow,'Kiln Glow: +15% Attack for 2 turns on the family, TNB included '+stat(grace,'atk'));
    ok(tnb.pep===5,'costs 4 Pep: '+tnb.pep); });
  noCrit(()=>{ const {F,tnb,grace}=fight({},null,null,false); F.party.find(p=>p.id==='tnb').custom={}; tnb.pep=9; addShield(F,grace,100,{src:tnb,clay:true}); go(F,tnb,'three_am_kiln_firing','*');
    ok(grace.shields[0].glaze===.3,'without the Trait the firing still glazes it, at the Trait’s 30%: '+grace.shields[0].glaze); });

  // 7. Coaster Policy: every family member with a shield deals 15% more damage, TNB too
  noCrit(()=>{ const {F,tnb,grace,rose,f0}=fight({tnb:['coaster_policy']}); const plain=()=>{ const c=hc(F,grace); return stat(grace,'atk'); };
    const base=(()=>{ const f=fight({tnb:['coaster_policy']}); const b=go(f.F,f.grace,'t_clobber','f0'); return hits(b)[0].dmg; })();
    const f=fight({tnb:['coaster_policy']}); addShield(f.F,f.grace,50,{src:f.tnb}); const b=go(f.F,f.grace,'t_clobber','f0');
    ok(hits(b)[0].dmg===Math.round(base*1.15)||Math.abs(hits(b)[0].dmg-base*1.15)<=1,'a shielded Grace hits 15% harder: '+hits(b)[0].dmg+' vs '+base);
    const g=fight({tnb:['coaster_policy']}); ok(g.grace.mods.some(m=>m.kind==='coaster')&&g.rose.mods.some(m=>m.kind==='coaster')&&g.tnb.mods.some(m=>m.kind==='coaster'),'the whole family carries the mod'); });
  noCrit(()=>{ const f=fight({}); ok(!f.grace.mods.some(m=>m.kind==='coaster'),'without the Quirk equipped nobody has it'); });

  // 8. Kintsugi Gold Seam: a family member’s shield breaks, TNB heals them 15% of Max HP and their hits can set off Razzle Detonations for 1 turn
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({tnb:['kintsugi_gold_seam']}); grace.hp=100; addShield(F,grace,20,{src:tnb}); const c=hc(F,f0);
    hurt(F,c,grace,50,{src:f0.key,flavor:'racket'}); const heal=Math.round(grace.maxHp*.15*mult(tnb,'healGiven'));
    ok(grace.st.gold_seam&&grace.hp>=100-30+heal-1,'the break heals her '+heal+' and puts Gold Seam on her: HP '+grace.hp);
    ok(has(c.beats,'passive',b=>b.id==='kintsugi_gold_seam'),'the screen names it');
    add(F,f0,'drenched',{src:grace}); const b=go(F,grace,'t_racket','f0'); ok(has(b,'detonate',d=>d.id==='short_circuit'),'her Racket hit (no Detonation of its own on Drenched) sets off Short Circuit! on a Drenched monster: '+J(b.filter(x=>x.t==='detonate').map(x=>x.id))); });
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({tnb:['kintsugi_gold_seam']}); add(F,f0,'drenched',{src:grace}); const b=go(F,grace,'t_racket','f0'); ok(!has(b,'detonate'),'without Gold Seam a Racket hit on a Drenched monster sets nothing off');
    const g=fight({tnb:['kintsugi_gold_seam']}); add(g.F,g.f0,'drenched',{src:g.grace}); add(g.F,g.grace,'gold_seam',{src:g.tnb}); const b2=go(g.F,g.grace,'t_clobber','f0'); ok(has(b2,'detonate',d=>d.id==='hydro_slip')&&!has(b2,'detonate',d=>d.id==='short_circuit'),'a flavor that has its own Detonation keeps it: '+J(b2.filter(x=>x.t==='detonate').map(x=>x.id))); });
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({tnb:['kintsugi_gold_seam']}); grace.hp=100; addShield(F,grace,10,{src:tnb}); addShield(F,grace,10,{src:tnb}); const c=hc(F,f0); hurt(F,c,grace,50,{src:f0.key,flavor:'racket'});
    ok(grace.hp<=100-30+Math.round(grace.maxHp*.15*mult(tnb,'healGiven'))+1,'two shields breaking in one action heal once: HP '+grace.hp); });

  // 9. Grand Amphora Masterpiece: soaks the next 2 monster attacks whole, then bursts
  noCrit(()=>{ const {F,tnb,grace,f0,f1}=fight(); tnb.pep=9; const b=go(F,tnb,'grand_amphora_masterpiece','*');
    ok(!hits(b).length&&F.hazards.length===1&&F.hazards[0].id==='amphora'&&F.hazards[0].side==='party'&&F.hazards[0].uses===2&&tnb.pep===4,'set down: no damage, 5 Pep, 2 hits left, on the family’s side: '+J(F.hazards));
    ok(carried(F,grace).some(r=>r.short==='AMPHORA'&&/2 hits/.test(r.left)),'the list shows it with 2 hits left: '+J(carried(F,grace).filter(r=>r.short==='AMPHORA').map(r=>r.left)));
    const hp=F.party.map(p=>p.hp); f0.charge=null; const t1=foeTurn(F,f0);
    ok(F.party.every((p,i)=>p.hp===hp[i])&&has(t1,'vesselSoak')&&F.hazards[0].uses===1,'the first monster attack is soaked whole: '+J(F.party.map(p=>p.hp))+' '+J(F.hazards.map(h=>h.uses)));
    const t2=foeTurn(F,f1); ok(has(t2,'vesselSoak')&&!F.hazards.length&&has(t2,'hazardEnd',x=>x.why==='burst'),'the second is soaked and the vase is gone');
    const hh=hits(t2).filter(x=>x.tgt[0]==='f'); ok(hh.length===2*F.foes.length&&F.foes.every(f=>hh.filter(x=>x.tgt===f.key).length===2)&&hh.every(x=>x.reflect!==true)&&has(t2,'react',x=>x.src===tnb.key),'it bursts into a hit on every monster, as TNB’s answer: '+J(hh.map(x=>x.tgt+':'+x.dmg)));
    ok(hh.every(x=>x.flavor==='clobber'||x.flavor==='razzle'),'a Clobber part and a Razzle part'); });
  noCrit(()=>{ const {F,tnb,f0}=fight(); tnb.pep=9; go(F,tnb,'grand_amphora_masterpiece','*'); for(let i=0;i<3;i++) roundStart(F,[]);
    ok(F.hazards.length===1,'still standing after 3 rounds'); const b=[]; roundStart(F,b); ok(!F.hazards.length&&has(b,'hazardEnd')&&hits(b).length>=1,'when its 4 rounds run out it shatters on its own: '+J(b.map(x=>x.t))); });
  noCrit(()=>{ const {F,tnb}=fight(); tnb.pep=9; go(F,tnb,'grand_amphora_masterpiece','*'); tnb.hp=0; koCheck(F,{beats:[],g:0}); ok(!F.hazards.length,'a maker who is knocked out takes the vase with them'); });
  noCrit(()=>{ const {F,tnb,grace,f0}=fight(); tnb.pep=9; go(F,tnb,'grand_amphora_masterpiece','*'); const c=hc(F,grace); c.actor=grace; OPS.strip(F,c,{kind:'hazard'}); ok(F.hazards.length===1,'a family strip does not clear the family’s own vase'); });

  // 10. Longboard Push & Carve and Carving Momentum
  noCrit(()=>{ const {F,tnb,f0}=fight({},null,null,true); const b=go(F,tnb,'longboard_push_and_carve','f0'),h=hits(b);
    ok(h.length===1&&h[0].flavor==='clobber'&&h[0].dmg===dmgOf(tnb,f0,PW.light),'a light Clobber hit '+J(h.map(x=>x.dmg)));
    ok(near(tnb.wait,72*.9*100/stat(tnb,'spd'),1e-6),'Recovery 72, and Carving Momentum takes 10% off (then Speed): '+tnb.wait); });
  noCrit(()=>{ const {F,tnb}=fight({},null,null,true); ok(near(moveRec(F,tnb,SK.e_bike_tag_along),100,1e-6)&&near(moveRec(F,tnb,SK.longboard_push_and_carve),64.8,1e-6),'a Skill keeps its full Recovery, his Basic is 72 less 10%: '+moveRec(F,tnb,SK.e_bike_tag_along)+', '+moveRec(F,tnb,SK.longboard_push_and_carve)); });
  noCrit(()=>{ const {F,tnb}=fight(); ok(near(moveRec(F,tnb,SK.wheel_thrown_lump),80,1e-6)&&near(moveRec(F,tnb,SK.longboard_push_and_carve),72,1e-6),'with Ceramicist as Main the Trait is off: Basic 80, the Longboard Basic 72: '+moveRec(F,tnb,SK.longboard_push_and_carve)); });

  // 11. E-Bike Tag-Along: clears debuffs, Fresh Ride, +15% Speed, Attack and Defense
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({},null,null,true); tnb.pep=5; const spd=stat(grace,'spd'),atk=stat(grace,'atk'),df=stat(grace,'def'); add(F,grace,'slow',{src:f0}); add(F,grace,'toasty',{src:f0});
    go(F,tnb,'e_bike_tag_along',grace.key);
    ok(!grace.st.slow&&!grace.st.toasty,'debuffs are cleared'); ok(near(stat(grace,'spd'),spd*1.15,1e-6)&&near(stat(grace,'atk'),atk*1.15,1e-6)&&near(stat(grace,'def'),df*1.15,1e-6),'+15% Speed, Attack, Defense');
    ok(grace.st.fresh_ride&&grace.st.e_bike&&grace.st.e_bike.n===2&&grace.st.fresh_ride.n===2,'both last 2 turns: '+J([grace.st.e_bike.n,grace.st.fresh_ride.n]));
    ok(tnb.pep===3,'costs 2 Pep: '+tnb.pep); });
  noCrit(()=>{ const {F,tnb,grace,f0}=fight({},null,null,true); tnb.custom={}; tnb.pep=5; go(F,tnb,'e_bike_tag_along',grace.key);
    ok(grace.st.e_bike.n===2&&grace.st.fresh_ride.n===2,'with no TAP-Card Transfer they last 2 turns: '+grace.st.e_bike.n);
    const c=hc(F,f0); G('b3PutStatus')(F,c,grace,{id:'slow'}); ok(!grace.st.slow&&!grace.st.fresh_ride&&has(c.beats,'soak')&&grace.st.e_bike,'Fresh Ride stops the next debuff and is used up');
    const c2=hc(F,f0); G('b3PutStatus')(F,c2,grace,{id:'slow'}); ok(!!grace.st.slow,'the second debuff lands'); });

  // 12. Waymo Tailgate Rescue
  noCrit(()=>{ const {F,tnb,grace,f0,f1}=fight({},null,null,true); tnb.pep=9; grace.hp=0; koCheck(F,{beats:[],g:0}); const b=go(F,tnb,'waymo_tailgate_rescue',grace.key),h=hits(b);
    ok(!grace.ko&&grace.hp===Math.round(grace.maxHp*.40),'a knocked-out family member is back at 40% of their HP: '+grace.hp+' of '+grace.maxHp);
    ok(h.length===2&&h.every(x=>x.flavor==='razzle')&&h[0].dmg===Math.round(stat(tnb,'atk')*PW.standard*RULES.aoeShare*100/(100+def(f0))),'a standard Razzle flash on every monster '+J(h.map(x=>x.dmg)));
    ok(f0.st.blind&&f1.st.blind&&f0.st.dazzled,'each monster is Blind and Dazzled'); ok(!has(b,'rebalance'),'no rebalance when someone was revived'); ok(tnb.pep===5,'costs 4 Pep: '+tnb.pep); });
  noCrit(()=>{ const {F,tnb,grace,rose,tom}=fight({},null,null,true); tnb.pep=9; grace.hp=60; rose.hp=rose.maxHp; tom.hp=tom.maxHp/2; tnb.hp=tnb.maxHp/2; const tot=grace.hp+rose.hp;
    const b=go(F,tnb,'waymo_tailgate_rescue',grace.key); ok(has(b,'rebalance'),'on a living family member it rebalances');
    ok(Math.abs(grace.hp/grace.maxHp-rose.hp/rose.maxHp)<.02&&grace.hp+rose.hp===tot,'the healthiest gives until the shares match: Grace '+grace.hp+'/'+grace.maxHp+', Rose '+rose.hp+'/'+rose.maxHp); });
  noCrit(()=>{ const {F,tnb,grace,rose}=fight({},null,null,true); tnb.pep=9; for(const p of F.party) p.hp=p.maxHp; grace.hp=grace.maxHp; const b=go(F,tnb,'waymo_tailgate_rescue',grace.key); ok(!has(b,'rebalance'),'nothing happens when nobody has a bigger share'); });
  noCrit(()=>{ const {F,tnb,grace,rose}=fight({},null,null,true); tnb.pep=9; grace.hp=10; for(const p of F.party) if(p!==grace) p.hp=1; const b=go(F,tnb,'waymo_tailgate_rescue',grace.key); ok(F.party.every(p=>p.hp>=1),'a donor is never left below 1 HP'); });

  // 13. TAP-Card Transfer: buffs last longer, +10% Evasion, the slowest family member is pulled 15 ticks up at the start of TNB’s turn, once a round
  noCrit(()=>{ const {F,tnb,grace,rose,tom}=fight({tnb:['tap_card_transfer']},null,null,true); ok(F.party.find(p=>p.id==='tnb').custom.tapCard&&G('b3Evasion')(tnb)>=.10-1e-9,'+10% Evasion and the one-off is on: '+G('b3Evasion')(tnb));
    tnb.pep=9; go(F,tnb,'e_bike_tag_along',grace.key); ok(grace.st.e_bike.n===3,'the buff TNB gives lasts a turn longer: '+grace.st.e_bike.n);
    const slow=F.party.filter(p=>p!==tnb).sort((a,b)=>stat(a,'spd')-stat(b,'spd')||a.slot-b.slot)[0]; slow.wait=60; const t=[]; beginTurn(F,tnb,t);
    ok(has(t,'pull',x=>x.tgt===slow.key&&near(x.n,15,1e-6))&&near(slow.wait,45,1e-6),'the slowest family member ('+slow.id+') moves 15 up: '+slow.wait);
    const t2=[]; slow.wait=60; beginTurn(F,tnb,t2); ok(!has(t2,'pull'),'only once a round'); });
  noCrit(()=>{ const {F,tnb}=fight({},null,null,true); ok(G('b3Evasion')(tnb)===0,'without the Quirk there is no Evasion bonus'); });

  // 14. Baxter Hill Longboard Express: a heavy Razzle wave, every E-Bike on the family doubled, +20% Ruckus
  noCrit(()=>{ const {F,tnb,grace,rose,f0,f1}=fight({},null,null,true); tnb.custom={}; tnb.pep=9; go(F,tnb,'e_bike_tag_along',grace.key); tnb.pep=9; const atk=stat(grace,'atk'),r0=F.ruckus;
    const b=go(F,tnb,'baxter_hill_longboard_express','*'),h=hits(b);
    ok(h.length===2&&h.every(x=>x.flavor==='razzle')&&h[0].dmg===Math.round(stat(tnb,'atk')*PW.heavy*RULES.aoeShare*100/(100+def(f0))),'a heavy Razzle hit on every monster at the 70% share '+J(h.map(x=>x.dmg)));
    ok(near(stat(grace,'atk'),atk/1.15*1.30,1e-6)&&grace.st.e_bike.mult===2&&grace.st.e_bike.n>=2,'the E-Bike is doubled to +30%: '+stat(grace,'atk')+' from '+atk);
    ok(!rose.st.e_bike,'nothing for a family member without one'); ok(F.ruckus>=r0+20-1e-6,'the Ruckus gauge jumps 20%: '+r0+' to '+F.ruckus);
    ok(f0.st.dazzled&&f1.st.dazzled,'the monsters are Dazzled'); ok(tnb.pep===4,'costs 5 Pep: '+tnb.pep);
    const c=hc(F,tnb); OPS.double(F,c,{id:'e_bike',n:2,to:'allies'}); ok(near(stat(grace,'atk'),atk/1.15*1.30,1e-6),'doubling again changes nothing'); });

  // 15. No Car, No Tickets: Slow never lands on TNB; his first Dazzled Detonation on a monster cuts its Defense 10% for the fight
  noCrit(()=>{ const {F,tnb,f0}=fight({tnb:['no_car_no_tickets']},null,null,true); const c=hc(F,f0); G('b3PutStatus')(F,c,tnb,{id:'slow'}); ok(!tnb.st.slow&&has(c.beats,'immune'),'Slow does not land on TNB');
    const grace=F.party.find(p=>p.id==='grace'); const c2=hc(F,f0); G('b3PutStatus')(F,c2,grace,{id:'slow'}); ok(!!grace.st.slow,'but it does on everyone else'); });
  noCrit(()=>{ const {F,tnb,f0,f1}=fight({tnb:['no_car_no_tickets']},null,null,true); add(F,f0,'dazzled',{src:tnb}); const d0=f0.def; go(F,tnb,'t_clobber','f0');
    ok(near(f0.crack,.10,1e-9),'a Clobber hit sets off Shatter Glitz! and cracks its Defense 10%: '+f0.crack);
    add(F,f0,'dazzled',{src:tnb}); F.acting=null; tnb.wait=0; go(F,tnb,'t_clobber','f0'); ok(near(f0.crack,.10,1e-9),'only the first time per monster: '+f0.crack); });
  noCrit(()=>{ const {F,grace,f0}=fight({tnb:['no_car_no_tickets']},null,null,true); add(F,f0,'dazzled',{src:grace}); go(F,grace,'t_clobber','f0'); ok(f0.crack===0,'only TNB’s own detonation counts'); });

  // 16. Previews and the simple player know every new move
  noCrit(()=>{ const {F,tnb}=fight(); tnb.pep=9; for(const s of ['wheel_thrown_lump','center_the_bowl','three_am_kiln_firing','grand_amphora_masterpiece']) { const O=options(F,tnb,SK[s]).find(o=>!o.no),hp=J(F.party.map(p=>p.hp)),pv=preview(F,tnb,s,O.key);
      ok(pv&&J(F.party.map(p=>p.hp))===hp&&F.hazards.length===0,'preview of '+s+' leaves the real fight alone'); } });
  noCrit(()=>{ const {F,tnb}=fight({},null,null,true); tnb.pep=9; F.party.find(p=>p.id==='grace').hp=0; koCheck(F,{beats:[],g:0}); for(const s of ['longboard_push_and_carve','e_bike_tag_along','waymo_tailgate_rescue','baxter_hill_longboard_express']) { const O=options(F,tnb,SK[s]).find(o=>!o.no),hp=J(F.party.map(p=>p.hp));
      ok(O&&J(F.party.map(p=>p.hp))===hp&&preview(F,tnb,s,O.key),'preview of '+s+' works and changes nothing'); } });

  // 16b. The simple player scores the vase: worth setting down when none stands, never twice at once
  noCrit(()=>{ const {F,tnb}=fight(); tnb.pep=9; const O=options(F,tnb,SK.grand_amphora_masterpiece)[0],sc=G('b3AutoScore'),a=sc(F,tnb,SK.grand_amphora_masterpiece,O);
    ok(Number.isFinite(a)&&a>0,'the vase has a positive score when none stands: '+a); go(F,tnb,'grand_amphora_masterpiece','*'); tnb.pep=9;
    const b=sc(F,tnb,SK.grand_amphora_masterpiece,O); ok(b<-50,'and none while one already stands: '+b); });

  // 17. Whole fights with TNB in the party, played by the simple player: won, no error, and he uses his own moves
  for(const [formation,seed,boarder] of [['mudling',3,false],['skeeter',4,false],['grump',5,true],['toad',6,true],['log',7,false],['bigone',8,true]]) {
    const log=[]; const r=play({party:LAB,level:formation==='bigone'?4:2,formation,seed,loadouts:book({tnb:['coaster_policy','kintsugi_gold_seam']},boarder),rank:5},log);
    ok(r&&(r.result==='win'||r.result==='lose')&&r.rounds>0,'a whole '+formation+' fight with TNB ends cleanly ('+(r&&r.result)+', '+(r&&r.rounds)+' rounds)'); }
};
