// tools/b3-check-s5c.js — Battle 3 rule tests for stage 5c: everything of Rose's Cozy Rosie and Deedee's Registered Nut that stage 4
// left as a name: Tattered Lamby Boomerang, Sofa-Cushion Citadel, Kingdom of Ten-Thousand Blankets, "Bring a Jacket!" Ward, To the
// Moon & Back, Well-Loved Original, Forty Years a Nurse, Mint-Condition Backup, Emergency Stuffy Swap, First-Ring Pickup and
// "Warm Beats Cold". The pieces they needed: the `later` op (effects that run when the actor's next turn begins), a Skill
// `cooldown`, immunity (`immune`), a shield from overheal (the `cleanBill` switch in the heal op), survive-at-1-HP (the `survive`
// status flag), mods carried by a unit's shields (`shieldMods`), a cost that depends on the target (`tgtBelow`), the listener fields
// `every` and `shieldBy`, the target kinds `ally_pair` and `family_or_ko`, and the simple player's scores for shields and ally buffs.
// `node tools/b3-sim.js check` runs it after the file for stage 5b. Real loadouts (no cfg.plain): Rose and Deedee play their
// second Sig Vibe as Main here.
'use strict';
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const [NF,next,act,foeTurn,SK,ST,VIBES,TRAITS,QUIRKS,SOON,add,stat,mult,newL,setQuirk,setMain,ladder,carried,roundStart,beginTurn,cost,critChance,koCheck,sumOf,hurt,runReactions,addShield,push,canUse,options,shieldTotal]=
    ['b3NewFight','b3Next','b3Act','b3FoeTurn','B3_SKILLS','B3_STATUS','B3_VIBES','B3_TRAITS','B3_QUIRKS','B3_SOON','b3AddStatus','b3Stat','b3Mult',
     'b3NewLoadout','b3SetQuirk','b3SetMain','b3Ladder','b3Carried','b3RoundStart','b3BeginTurn','b3Cost','b3CritChance','b3KoCheck','b3Sum','b3Hurt','b3RunReactions','b3AddShield','b3Push','b3CanUse','b3Options','b3ShieldTotal'].map(G);
  const LAB=['grace','tom','rose','deedee'],J=x=>JSON.stringify(x),RULES=G('B3_RULES'),PW=RULES.power;
  const bad0=J(G('b3CheckData')());
  // Loadouts at Rank 5, Rose and Deedee playing their second Sig Vibe as Main and the Quirks named per member.
  const book=(q,swap)=>{ const B={}; for(const id of LAB) { B[id]=newL(id,5); if((swap||['rose','deedee']).includes(id)) setMain(id,B[id],B[id].pocket);
    ((q||{})[id]||[]).forEach((x,i)=>{ if(!setQuirk(id,B[id],i,x)) throw new Error('test could not equip '+x); }); } return B; };
  const fight=(q,formation,cfg)=>{ const F=NF(Object.assign({party:LAB,level:2,seed:5,formation:formation||'mudling',loadouts:book(q)},cfg||{}));
    const P={}; for(const p of F.party) P[p.id]=p; for(const f of F.foes) { f.hp=f.maxHp=9999; f.st={}; f.peeves=[]; f.resists=[]; }
    for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,400); }
    return {F,P,f0:F.foes[0],f1:F.foes[1],grace:P.grace,tom:P.tom,rose:P.rose,deedee:P.deedee}; };
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const hits=(beats,key)=>beats.filter(b=>b.t==='hit'&&(!key||b.tgt===key));
  const has=(beats,t,f)=>beats.some(b=>b.t===t&&(!f||f(b)));
  const def=u=>stat(u,'def');
  const dmgOf=(u,f,m)=>Math.round(stat(u,'atk')*m*100/(100+def(f)));
  // Test rows, in the sandbox only; taken out again at the end of this file.
  SK.t_heal_all={id:'t_heal_all',vibe:'deedee_nurse',slot:'s1',name:'Test heal',pep:0,flavor:['support'],power:0,hits:0,target:'family',tags:[],composure:0,effects:[{op:'heal',pct:1,to:'target'}]};
  SK.t_slow_ally={id:'t_slow_ally',vibe:'tom_gamer',slot:'s1',name:'Test slow ally',pep:0,flavor:['support'],power:0,hits:0,target:'ally',tags:[],composure:0,effects:[{op:'status',id:'slow',to:'target'},{op:'status',id:'stun',to:'target'}]};
  SK.t_hit_foe={id:'t_hit_foe',vibe:'rose_cozy',slot:'s1',name:'Test foe hit',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};

  // 114. Both second Sig Vibes are complete: nothing is a name only any more
  for(const v of ['rose_cozy','deedee_nurse']) { const L=ladder(VIBES[v],5),un=L.filter(x=>!x.built||!x.open).map(x=>x.id);
    ok(L.length===7&&!un.length,v+' is complete at Rank 5: '+J(un)); ok(!VIBES[v].skills.some(s=>SOON[s])&&!(VIBES[v].quirks||[]).some(q=>QUIRKS[q].soon)&&!TRAITS[VIBES[v].trait].soon,v+': no Skill, Trait or Quirk is still only a name'); }
  ok(Object.keys(SOON).length===0||!['tattered_lamby_boomerang','sofa_cushion_citadel','kingdom_of_ten_thousand_blankets','bring_a_jacket_ward','to_the_moon_and_back'].some(s=>SOON[s]),'B3_SOON no longer names the five Skills');

  // 115. Well-Loved Original: Rose gets 1 Pep at the start of every 2nd round
  noCrit(()=>{ const {F,rose}=fight(); rose.pep=3; roundStart(F,[]); ok(F.round===2&&rose.pep===4,'round 2: +1 Pep: '+rose.pep);
    roundStart(F,[]); ok(F.round===3&&rose.pep===4,'round 3: nothing: '+rose.pep); const b=[]; roundStart(F,b); ok(F.round===4&&rose.pep===5&&has(b,'passive',x=>x.id==='well_loved_original'),'round 4: +1 again and the screen says so: '+rose.pep); });
  noCrit(()=>{ const {F,grace}=fight(); grace.pep=3; roundStart(F,[]); ok(grace.pep===3,'only Rose, and only when it is her Main Vibe\'s Trait: Grace '+grace.pep); });
  noCrit(()=>{ const F=NF({party:LAB,level:2,seed:5,formation:'mudling',loadouts:book({},[])}),rose=F.party.find(p=>p.id==='rose'); rose.pep=3; roundStart(F,[]); ok(rose.pep===3,'Sugar Rush as Main: nothing'); });

  // 116. Tattered Lamby Boomerang: a light Clobber throw, Lamby stuck on the monster, and the tackle when Rose's next turn begins
  noCrit(()=>{ const {F,rose,f0,f1}=fight(); rose.pep=5; const b=go(F,rose,'tattered_lamby_boomerang','f0'),h=hits(b,'f0');
    ok(h.length===1&&h[0].flavor==='clobber'&&h[0].dmg===dmgOf(rose,f0,PW.light)&&rose.pep===3,'the throw: one light Clobber hit '+J(h.map(x=>x.dmg))+', 2 Pep: '+rose.pep);
    ok(!!f0.st.lamby_stuck&&f0.st.lamby_stuck.unit==='srcBegin'&&!f1.st.lamby_stuck&&F.later.length===1,'Lamby is stuck on that monster only, and the tackle waits: '+F.later.length);
    ok(carried(F,f0).some(r=>r.short==='LAMBY OUT'&&/Rose/.test(r.left)),'the list says it ends at Rose\'s next turn');
    ok(!has(b,'shield')&&rose.shields.length===0,'no shield yet');
    const t=[]; beginTurn(F,rose,t); const th=hits(t,'f0');
    ok(has(t,'react',x=>x.name==='Give Lamby Back!'&&x.src===rose.key&&x.tgt==='f0')&&th.length===2&&th.every(x=>x.flavor==='clobber'&&x.dmg===Math.round(dmgOf(rose,f0,PW.standard/2)))&&!f0.st.lamby_stuck,
      'her next turn begins: Give Lamby Back! is two Clobber hits, a standard hit between them '+J(th.map(x=>x.dmg))+', and the mark is gone');
    const want=Math.round(rose.maxHp*.10*mult(rose,'healGiven'));
    ok(rose.shields.length===1&&rose.shields[0].amt===want&&F.later.length===0,'and a self-shield of 10% of her Max HP: '+shieldTotal(rose)+' want '+want); });
  noCrit(()=>{ const {F,rose,f0,f1}=fight(); rose.pep=5; go(F,rose,'tattered_lamby_boomerang','f0'); f0.hp=0; koCheck(F,{beats:[],g:0}); const t=[]; beginTurn(F,rose,t);
    ok(hits(t,'f1').length===2&&!hits(t,'f0').length,'if the monster is gone by then, the tackle goes to one that is left: '+J(hits(t).map(x=>x.tgt))); });
  noCrit(()=>{ const {F,rose,f0}=fight(); rose.pep=5; go(F,rose,'tattered_lamby_boomerang','f0'); rose.hp=0; koCheck(F,{beats:[],g:0}); F.later=F.later.filter(()=>true); const t=[]; beginTurn(F,rose,t);
    ok(!hits(t).length,'a Rose who is knocked out does not tackle'); });

  // 117. Sofa-Cushion Citadel: a 25% shield on the whole family, nobody can be pushed back, 3-round cooldown
  noCrit(()=>{ const {F,rose,grace,tom,deedee}=fight(); rose.pep=10; const b=go(F,rose,'sofa_cushion_citadel',rose.key);
    ok(rose.pep===7,'3 Pep: '+rose.pep);
    for(const m of [rose,grace,tom,deedee]) { const want=Math.round(m.maxHp*.25*mult(rose,'healGiven')); ok(m.shields.length===1&&m.shields[0].amt===want&&m.shields[0].src===rose.key&&!!m.st.pillow_fort,m.name+' has a shield of 25% ('+want+') from Rose and the fort: '+shieldTotal(m)); }
    grace.wait=50; ok(push(F,grace,30)===0&&grace.wait===50,'nobody in the family can be pushed back on the turn bar: '+grace.wait);
    ok(!canUse(F,rose,SK.sofa_cushion_citadel).ok&&/rest/.test(canUse(F,rose,SK.sofa_cushion_citadel).why),'she cannot build it again at once: '+canUse(F,rose,SK.sofa_cushion_citadel).why);
    rose.pep=10; roundStart(F,[]); roundStart(F,[]); ok(!canUse(F,rose,SK.sofa_cushion_citadel).ok,'two rounds later: still resting'); roundStart(F,[]); ok(canUse(F,rose,SK.sofa_cushion_citadel).ok,'three rounds later: ready (round '+F.round+')'); });
  noCrit(()=>{ const {F,rose}=fight(); rose.pep=3; ok(!!rose.cd&&canUse(F,rose,SK.sofa_cushion_citadel).ok,'with enough Pep it is ready at the start'); rose.pep=2; ok(!canUse(F,rose,SK.sofa_cushion_citadel).ok,'and still needs its 3 Pep'); });

  // 118. Mint-Condition Backup: whoever holds one of Rose's shields is crit 20% less often
  noCrit(()=>{ const {F,rose,grace,tom,deedee,f0}=fight({rose:['mint_condition_backup']}); rose.pep=10; ok(sumOf(grace,'critTaken')===0,'no shield: nothing');
    go(F,rose,'sofa_cushion_citadel',rose.key); ok(near(sumOf(grace,'critTaken'),-.20)&&near(sumOf(rose,'critTaken'),-.20),'Rose\'s shield: 20% less crit on Grace and on Rose: '+sumOf(grace,'critTaken'));
    addShield(F,tom,40,{src:deedee}); tom.shields=tom.shields.filter(s=>s.src===deedee.key); ok(sumOf(tom,'critTaken')===0,'a shield from someone else gives nothing: '+sumOf(tom,'critTaken'));
    grace.shields=[]; ok(sumOf(grace,'critTaken')===0,'and it goes when the shield does'); });
  noCrit(()=>{ const {F,rose,grace}=fight({}); rose.pep=10; go(F,rose,'sofa_cushion_citadel',rose.key); ok(sumOf(grace,'critTaken')===0,'without the Quirk equipped: nothing'); });

  // 119. Emergency Stuffy Swap: when a shield of Rose's breaks, Backup Lamby bonks the monster that broke it, once a round
  noCrit(()=>{ const {F,rose,grace,deedee,f0,f1}=fight({rose:['emergency_stuffy_swap']}); const mk=(u,by,amt)=>{ addShield(F,u,amt,{src:by}); };
    const brk=(foe,u,dmg)=>{ const c={F,actor:foe,src:foe,targets:[u],hit:[],beats:[],g:0,detonated:{},reacted:{},tags:['melee'],ledger:{}}; hurt(F,c,u,dmg,{src:foe.key}); runReactions(F,c.beats); return c.beats; };
    mk(grace,rose,20); let b=brk(f0,grace,60);
    ok(has(b,'shieldBroken')&&has(b,'react',x=>x.src===rose.key&&x.tgt==='f0'),'Rose\'s shield on Grace breaks: Rose answers the monster that broke it '+J(b.filter(x=>x.t==='react').map(x=>x.name)));
    const h=hits(b,'f0').filter(x=>x.src===rose.key); ok(h.length===1&&h[0].flavor==='clobber'&&h[0].dmg===dmgOf(rose,f0,PW.light),'a light Clobber hit: '+J(h.map(x=>x.dmg)));
    mk(grace,rose,20); b=brk(f1,grace,60); ok(!has(b,'react'),'a second break in the same round: nothing');
    roundStart(F,[]); mk(grace,rose,20); b=brk(f1,grace,60); ok(has(b,'react',x=>x.tgt==='f1'),'a new round: it answers again, and it goes to the monster that broke this shield');
    roundStart(F,[]); mk(grace,deedee,20); b=brk(f0,grace,60); ok(!has(b,'react'),'a shield from someone else: nothing');
    roundStart(F,[]); mk(rose,rose,20); b=brk(f0,rose,60); ok(has(b,'react',x=>x.src===rose.key),'a shield on Rose herself counts'); });
  noCrit(()=>{ const {F,rose,grace,f0}=fight({}); addShield(F,grace,20,{src:rose}); const c={F,actor:f0,src:f0,targets:[grace],hit:[],beats:[],g:0,detonated:{},reacted:{},tags:['melee'],ledger:{}}; hurt(F,c,grace,60,{src:f0.key}); runReactions(F,c.beats); ok(!has(c.beats,'react'),'without the Quirk: nothing'); });

  // 120. Kingdom of Ten-Thousand Blankets: heals 60% and cleanses now, a Sizzle wave on every monster when Rose's next turn begins
  noCrit(()=>{ const {F,rose,grace,f0,f1}=fight(); rose.pep=10; grace.hp=Math.round(grace.maxHp*.2); add(F,grace,'slow',{src:f0}); const hp0=grace.hp;
    const b=go(F,rose,'kingdom_of_ten_thousand_blankets',grace.key),want=Math.round(grace.maxHp*.6*mult(rose,'healGiven'));
    ok(grace.hp===Math.min(grace.maxHp,hp0+want)&&!grace.st.slow&&rose.pep===5,'Grace heals 60% ('+want+') and the debuff clears, 5 Pep: '+grace.hp);
    ok(!!rose.st.blanket_castle&&F.later.length===1&&!hits(b).length,'the castle stands on Rose and the wave waits: no damage yet');
    const t=[]; beginTurn(F,rose,t); const w=hits(t);
    ok(has(t,'react',x=>x.name==='Warmth Wave')&&w.length===2&&w.every(x=>x.flavor==='sizzle'),'her next turn begins: a Sizzle wave hits both monsters '+J(w.map(x=>x.dmg)));
    ok(w.find(x=>x.tgt==='f0').dmg===Math.round(stat(rose,'atk')*PW.heavy*RULES.aoeShare*100/(100+def(f0))),'heavy at the all-monsters share: '+w[0].dmg+' (the Toasty it leaves is a Prime, not extra damage)');
    ok(!rose.st.blanket_castle&&F.later.length===0,'and the castle is gone'); });
  noCrit(()=>{ const {F,rose,grace,f0,f1}=fight(); rose.pep=10; go(F,rose,'kingdom_of_ten_thousand_blankets',grace.key); f0.hp=0; koCheck(F,{beats:[],g:0}); const t=[]; beginTurn(F,rose,t);
    ok(hits(t).length===1&&hits(t)[0].tgt==='f1','the wave hits the monsters that are still there'); });

  // 121. Forty Years a Nurse: half of the healing that goes past full HP becomes a shield, 25% of Max HP at most
  noCrit(()=>{ const {F,deedee,grace,tom}=fight(); deedee.pep=10; grace.hp=grace.maxHp-10; const want=Math.round(grace.maxHp*.2*mult(deedee,'healGiven'));
    go(F,deedee,'deedee_makes_it_better',grace.key); ok(grace.hp===grace.maxHp&&grace.shields.length===1&&grace.shields[0].amt===Math.round((want-10)*.5),'a heal that overshoots by '+(want-10)+': half becomes a shield '+shieldTotal(grace));
    ok(grace.shields[0].src===deedee.key,'and it is Deedee\'s');
    go(F,deedee,'t_heal_all',tom.key); ok(tom.shields.length===1&&tom.shields[0].amt===Math.round(tom.maxHp*.25),'a 100% heal on someone at full HP: the shield stops at 25% of Max HP: '+shieldTotal(tom)+' of '+tom.maxHp); });
  noCrit(()=>{ const {F,deedee,grace}=fight(); grace.hp=grace.maxHp-10; go(F,deedee,'t_heal_all',grace.key); ok(grace.hp===grace.maxHp&&grace.shields.length===1&&grace.shields[0].amt===Math.round(grace.maxHp*.25),'a huge heal that overshoots by almost its whole size: the shield is held at 25%: '+shieldTotal(grace)); });
  noCrit(()=>{ const {F,deedee,grace}=fight(); grace.hp=Math.round(grace.maxHp*.5); go(F,deedee,'deedee_makes_it_better',grace.key); ok(grace.shields.length===0,'a heal that fits inside the missing HP makes no shield: '+shieldTotal(grace)); });
  noCrit(()=>{ const {F,rose,grace}=fight(); grace.hp=grace.maxHp; go(F,rose,'t_heal_all',grace.key); ok(grace.shields.length===0,'only Deedee\'s heals do it: Rose\'s full-HP heal makes no shield'); });
  noCrit(()=>{ const {F,deedee,tom}=fight(); tom.hp=0; koCheck(F,{beats:[],g:0}); ok(tom.ko&&!options(F,deedee,SK.t_heal_all).some(o=>o.key===tom.key),'a knocked-out family member is not offered a heal, so no shield either'); });
  noCrit(()=>{ const F2=NF({party:LAB,level:2,seed:5,formation:'mudling',loadouts:book({},[])}),d2=F2.party.find(p=>p.id==='deedee'); const g2=F2.party.find(p=>p.id==='grace'); g2.hp=g2.maxHp; F2.acting=d2; act(F2,d2,'t_heal_all',g2.key); ok(!g2.shields.length,'Neat Freak as Main: no Clean Bill Shield'); });

  // 122. First-Ring Pickup: -1 Pep on a Skill aimed at one family member who is up and under half HP, never below 1
  noCrit(()=>{ const {F,deedee,grace,tom,f0}=fight({deedee:['first_ring_pickup']}); const S=SK.deedee_makes_it_better,opt=u=>options(F,deedee,S).find(o=>o.key===u.key);
    ok(cost(F,deedee,S)===2,'everyone healthy: 2 Pep'); ok(cost(F,deedee,S,opt(grace))===2,'aimed at Grace at full HP: 2');
    grace.hp=Math.round(grace.maxHp*.4); ok(cost(F,deedee,S,opt(grace))===1&&cost(F,deedee,S,opt(tom))===2,'Grace under half: 1 for her, still 2 for Tom: '+cost(F,deedee,S,opt(grace))+', '+cost(F,deedee,S,opt(tom)));
    ok(cost(F,deedee,S)===1,'the menu shows the cheapest she can pay now: 1');
    grace.hp=Math.round(grace.maxHp*.5); ok(cost(F,deedee,S,opt(grace))===2,'exactly half is not under half');
    grace.hp=Math.round(grace.maxHp*.3); deedee.pep=4; go(F,deedee,'deedee_makes_it_better',grace.key); ok(deedee.pep===3,'the Pep paid is 1: '+deedee.pep);
    ok(cost(F,deedee,SK.little_pinch_syringe_poke)===0,'a Basic is still free'); ok(cost(F,deedee,SK.bring_a_jacket_ward,options(F,deedee,SK.bring_a_jacket_ward).find(o=>o.key===grace.key))===4,'a Skill aimed at two family members is not discounted (one target only): '+cost(F,deedee,SK.bring_a_jacket_ward,options(F,deedee,SK.bring_a_jacket_ward).find(o=>o.key===grace.key)));
    deedee.pep=1; grace.hp=Math.round(grace.maxHp*.3); ok(canUse(F,deedee,S).ok,'1 Pep is enough when someone is under half'); grace.hp=grace.maxHp; ok(!canUse(F,deedee,S).ok,'but not when everyone is well: '+canUse(F,deedee,S).why);
    ok(cost(F,deedee,SK.t_hit_foe)===0,'(a Skill row with no Pep cost stays free)'); });
  noCrit(()=>{ const {F,deedee,grace}=fight({}); grace.hp=Math.round(grace.maxHp*.3); ok(cost(F,deedee,SK.deedee_makes_it_better)===2,'without the Quirk: 2'); });

  // 123. "Warm Beats Cold": Stun and Slow never land on Deedee; a cleanse of hers heals her 10% of her own HP
  noCrit(()=>{ const {F,deedee,tom,grace}=fight({deedee:['warm_beats_cold']}); const b=go(F,tom,'t_slow_ally',deedee.key);
    ok(!deedee.st.slow&&!deedee.st.stun&&has(b,'immune',x=>x.id==='slow')&&has(b,'immune',x=>x.id==='stun'),'Slow and Stun do not land on Deedee, and the beat says so');
    go(F,tom,'t_slow_ally',grace.key); ok(!!grace.st.slow&&!!grace.st.stun,'they land on Grace as usual');
  });
  noCrit(()=>{ const {F,deedee,tom,grace}=fight({deedee:['warm_beats_cold']}); deedee.pep=10; deedee.hp=Math.round(deedee.maxHp*.5); add(F,grace,'slow',{src:tom}); const hp0=deedee.hp,b=go(F,deedee,'deedee_makes_it_better',grace.key);
    const heal=Math.round(deedee.maxHp*.10*mult(deedee,'healGiven')); ok(deedee.hp===hp0+heal&&has(b,'passive',x=>x.id==='warm_beats_cold'),'she cleared Grace\'s Slow and healed herself 10% of her HP: '+(deedee.hp-hp0)+' want '+heal);
    deedee.hp=Math.round(deedee.maxHp*.5); const h1=deedee.hp; go(F,deedee,'deedee_makes_it_better',grace.key); ok(deedee.hp===h1,'nothing to cleanse, nothing healed: '+(deedee.hp-h1));
    deedee.hp=Math.round(deedee.maxHp*.5); add(F,deedee,'bleed',{src:tom}); const h2=deedee.hp; go(F,deedee,'deedee_makes_it_better',deedee.key); ok(deedee.hp>h2+Math.round(deedee.maxHp*.2),'she can cleanse herself too: '+(deedee.hp-h2)); });
  noCrit(()=>{ const {F,deedee,tom}=fight({}); go(F,tom,'t_slow_ally',deedee.key); ok(!!deedee.st.slow&&!!deedee.st.stun,'without the Quirk both land'); });

  // 124. "Bring a Jacket!" Ward: two family members, regen over 3 turns, the first knock-out held at 1 HP, 3-round cooldown
  noCrit(()=>{ const {F,deedee,grace,tom,rose}=fight(); deedee.pep=10; tom.hp=Math.round(tom.maxHp*.3); const os=options(F,deedee,SK.bring_a_jacket_ward);
    ok(os.length===4&&os.find(o=>o.key===grace.key).units.map(u=>u.id).join()==='grace,tom','the choices: each family member, paired with whoever is hurt most: '+os.map(o=>o.label).join(' | '));
    const b=go(F,deedee,'bring_a_jacket_ward',grace.key); ok(deedee.pep===6,'4 Pep: '+deedee.pep);
    ok(!!grace.st.jacket&&!!tom.st.jacket&&!rose.st.jacket&&!deedee.st.jacket,'Grace and the hurt Tom have jackets, nobody else');
    const hp=tom.hp; beginTurn(F,tom,[]); ok(tom.hp===hp+Math.round(tom.maxHp*.07),'regen at the start of the turn: +7% (20% over the 3 turns): '+(tom.hp-hp));
    ok(!canUse(F,deedee,SK.bring_a_jacket_ward).ok,'3-round cooldown'); });
  noCrit(()=>{ const {F,deedee,grace,f0}=fight(); deedee.pep=10; go(F,deedee,'bring_a_jacket_ward',grace.key); grace.hp=40; const c={F,actor:f0,src:f0,targets:[grace],hit:[],beats:[],g:0,detonated:{},reacted:{},tags:[],ledger:{}};
    hurt(F,c,grace,500,{src:f0.key}); koCheck(F,c); ok(grace.hp===1&&!grace.ko&&has(c.beats,'survive',x=>x.tgt===grace.key),'a hit that would knock Grace out leaves her on 1 HP, and the screen says so: '+grace.hp);
    ok(!!grace.st.jacket&&grace.st.jacket.spent,'the protection is used up, the jacket (the regen) stays');
    const h0=grace.hp; beginTurn(F,grace,[]); ok(grace.hp>h0,'she still regens: '+grace.hp);
    hurt(F,c,grace,500,{src:f0.key}); koCheck(F,c); ok(grace.ko,'the next knock-out hit does knock her out'); });
  noCrit(()=>{ const {F,deedee,grace,f0}=fight(); deedee.pep=10; go(F,deedee,'bring_a_jacket_ward',grace.key); const c={F,actor:f0,src:f0,targets:[grace],hit:[],beats:[],g:0,detonated:{},reacted:{},tags:[],ledger:{}};
    grace.hp=500; grace.maxHp=500; hurt(F,c,grace,100,{src:f0.key}); ok(grace.hp===400&&!grace.st.jacket.spent,'a hit that does not knock her out leaves the protection alone'); });
  noCrit(()=>{ const {F,deedee,grace}=fight(); deedee.pep=10; go(F,deedee,'bring_a_jacket_ward',grace.key); for(let i=0;i<3;i++) { grace.st.jacket&&beginTurn(F,grace,[]); G('b3EndTurn')(F,grace,100,[]); }
    ok(!grace.st.jacket,'after 3 of her turns the jacket is gone'); });

  // 125. To the Moon & Back: revives a knocked-out family member at 80% or heals anyone else to full, then a heavy Sizzle wave and 2 pips
  noCrit(()=>{ const {F,deedee,tom,grace,f0,f1}=fight(); for(const f of [f0,f1]) { f.maxPips=f.pips=6; } deedee.pep=10; tom.hp=0; koCheck(F,{beats:[],g:0}); ok(tom.ko,'(Tom is down)');
    const os=options(F,deedee,SK.to_the_moon_and_back); ok(os.length===4&&os.some(o=>/knocked out/.test(o.label)),'every family member can be picked, the knocked out one too: '+os.map(o=>o.label).join(' | '));
    const b=go(F,deedee,'to_the_moon_and_back',tom.key); ok(!tom.ko&&tom.hp===Math.round(tom.maxHp*.8)&&has(b,'revive',x=>x.tgt===tom.key)&&deedee.pep===4,'Tom is back at 80% and it cost 6 Pep: '+tom.hp+' of '+tom.maxHp+', Pep '+deedee.pep);
    const h=hits(b); ok(h.filter(x=>x.tgt==='f0'||x.tgt==='f1').length===2&&h.every(x=>x.flavor==='sizzle'),'a Sizzle wave on both monsters '+J(h.map(x=>x.dmg)));
    ok(h.find(x=>x.tgt==='f0').dmg===Math.round(stat(deedee,'atk')*PW.heavy*RULES.aoeShare*100/(100+def(f0))),'heavy at the all-monsters share: '+h[0].dmg);
    ok(f0.pips===4&&f1.pips===4,'and 2 Composure pips off each: '+f0.pips+', '+f1.pips); });
  noCrit(()=>{ const {F,deedee,grace,f0}=fight(); deedee.pep=10; grace.hp=Math.round(grace.maxHp*.3); const b=go(F,deedee,'to_the_moon_and_back',grace.key); ok(grace.hp===grace.maxHp&&!has(b,'revive'),'a living family member heals all the way and nothing is revived: '+grace.hp); });
  noCrit(()=>{ const {F,deedee,tom,f0}=fight(); deedee.pep=10; tom.hp=0; koCheck(F,{beats:[],g:0}); go(F,deedee,'to_the_moon_and_back',tom.key); ok(tom.hp===Math.round(tom.maxHp*.8)&&tom.hp<tom.maxHp,'a revived member is NOT also healed to full (heal waits for "no revive")'); });

  // 126. The simple player takes both Vibes through whole fights without breaking a rule, and uses the new moves
  { const used={},q={rose:['mint_condition_backup','emergency_stuffy_swap'],deedee:['first_ring_pickup','warm_beats_cold']};
    let err='',wins=0,n=0; for(const f of ['toad','log','grump']) for(let s=1;s<=30;s++) { try { const r=play({party:LAB,level:2,formation:f,seed:s,loadouts:book(q),mods:{foeHp:3}},false,{support:3}); for(const k in r.moves) used[k]=(used[k]||0)+r.moves[k]; if(r.result==='win') wins++; n++; } catch(e) { err=err||(f+' seed '+s+': '+e.message); } }
    ok(!err,'90 Rank 5 fights with Rose and Deedee on their second Vibes run clean: '+err); ok(wins===90,'and are won: '+wins);
    ok((used.tattered_lamby_boomerang||0)+(used.sofa_cushion_citadel||0)+(used.kingdom_of_ten_thousand_blankets||0)>0,'the simple player used at least one of Rose\'s new moves: '+[used.tattered_lamby_boomerang,used.sofa_cushion_citadel,used.kingdom_of_ten_thousand_blankets]);
    ok((used.bring_a_jacket_ward||0)+(used.to_the_moon_and_back||0)>0,'and one of Deedee\'s: '+[used.bring_a_jacket_ward,used.to_the_moon_and_back]); }

  // The test rows come out again, and the data check says what it said before this file ran.
  delete SK.t_heal_all; delete SK.t_slow_ally; delete SK.t_hit_foe;
  ok(J(G('b3CheckData')())===bad0,'data check after this file\'s test rows are gone: '+J(G('b3CheckData')()));
};
