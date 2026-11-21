// tools/b3-check-s13.js — Battle 3 rule tests for stage 13: the bestiary for chapters 8 to 10 and the bonus chapter.
// Stage 13b: chapter 9, the Rose Dome Ballroom: Velvet Rope, Stuffed Shirt, The Hanger-On, The Sore Loser, The Wallflower (Elite), The Mirrorball (boss), Lab fights new51 to new56.
// Stage 13a: chapter 8, Division Nine Car Barn: Lukewarm, Leftover, Wet Blanket, The Draft, The Picky Eater (Elite), Old Ironbelly (boss),
// Lab fights new45 to new50. New piece: the strip kind `shieldOrBuff` (Pilot-Light Gust). Old Ironbelly's heat against TNB's clay shields.
// `node tools/b3-sim.js check` runs it after the file for stage 12.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),FOES=G('B3_FOES'),FORM=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),
    add=G('b3AddStatus'),foeTurn=G('b3FoeTurn'),pick=G('b3FoePick'),loseCharge=G('b3LoseCharge'),act=G('b3Act'),
    stat=G('b3Stat'),sum=G('b3Sum'),addShield=G('b3AddShield'),blank=G('b3CheckData'),J=x=>JSON.stringify(x);
  const bad=J(blank().filter(x=>!/\bt_/.test(x)));
  ok(bad==='[]','the data check is clean with the chapter 8 monsters in: '+bad);
  // Test rows, in the sandbox only.
  for(const [id,fl] of [['t13_clobber','clobber'],['t13_racket','racket'],['t13_sizzle','sizzle'],['t13_drench','drench'],['t13_razzle','razzle']])
    SK[id]={id,vibe:'tom_flier',slot:'s1',name:'Test '+id,pep:0,flavor:[fl],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  const off=(t,id,k)=>{ const a=stat(t,k),s=t.st[id]; delete t.st[id]; const b=stat(t,k); t.st[id]=s; return a/b; };   // a stat with a status on, as a share of the stat with it off

  // ====================== Chapter 8: Division Nine Car Barn (stage 13a) ======================
  const P8=['tom','tnb','nara'];
  const mk=(foes,o)=>NF(Object.assign({party:P8,level:19,seed:11,foes},o||{}));
  // [id, ch, role, row, hp, atk, def, spd, pips, peeves, resists]
  const ROWS=[
    ['lukewarm',8,'swarmer','front',244,56,31,111,0,['sizzle','razzle'],['drench']],['leftover',8,'swarmer','front',244,56,31,111,0,['sizzle','clobber'],['racket']],
    ['wetblanket',8,'bruiser','front',431,73,41,101,0,['sizzle','clobber'],['drench']],['thedraft',8,'skirmisher','back',300,69,33,127,0,['sizzle','razzle'],['racket']],
    ['pickyeater',8,'elite','front',675,76,49,95,4,['racket','drench'],['clobber']],['ironbelly',8,'boss','front',1040,83,45,108,7,['drench'],['sizzle']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists]));
    ok(D.acts.filter(a=>!a.after&&a.hits!=='attacker').length>=3,id+' has its acts'); }
  ok(FOES.ironbelly.hp4===1390&&FOES.ironbelly.noRun,'Old Ironbelly prints 1,390 for a party of 4 and cannot be run from');
  { const hpOf=party=>NF({party,level:19,seed:3,foes:[{id:'ironbelly',row:'front'}]}).foes[0].maxHp;
    ok(hpOf(P8)===1040&&hpOf([...P8,'grace'])===1390,'Old Ironbelly: 1,040 for 3, 1,390 for 4'); }
  const FM={lukewarm:9,leftover:9,wetblanket:9,thedraft:9,pickyeater:9,ironbelly:27};
  for(const k of Object.keys(FM)) ok(FORM[k]&&FORM[k].ch===8&&FORM[k].vp===FM[k],'formation '+k+' is chapter 8 and pays '+FM[k]+' VP');
  ok(J(FORM.thedraft.foes)===J([{id:'leftover',row:'front'},{id:'thedraft',row:'back'}])&&J(FORM.pickyeater.foes)===J([{id:'pickyeater',row:'front'},{id:'thedraft',row:'back'}]),'two of the formations match section 4');
  { const labs=LAB.filter(l=>/^new(4[5-9]|50)$/.test(l.id));
    ok(labs.length===6&&labs.every(l=>FORM[l.formation]&&FORM[l.formation].ch===8),'Lab fights new45 to new50 each run a real chapter 8 formation');
    ok(labs.every(l=>l.level===19&&J(l.party)===J(P8)&&(l.id==='new50'?l.bg==='boiler':l.bg==='barn')),'each uses level 19, Tom, TNB and Nara, the car barn (the boss: the boiler room)'); }
  for(const id of ['crosswind','tin_lid','why_bother','it_touched','full_furnace'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');

  // ---------- Starting statuses ----------
  { const F=mk([{id:'thedraft',row:'back'},{id:'leftover',row:'front'}]),d=F.foes.find(f=>f.id==='thedraft'); ok(!!d.st.crosswind&&near(sum(d,'eva'),.20,1e-9),'The Draft starts in a Crosswind (+20% Evasion)'); }
  { const F=mk([{id:'pickyeater',row:'front'}]),e=F.foes[0]; ok(!!e.st.tin_lid&&near(sum(e,'reduce'),.25,1e-9),'The Picky Eater starts behind its Tin Lunchbox Lid (25% less damage taken)'); }

  // ---------- The plain acts ----------
  const rider=(foe,actId,fn,row)=>noCrit(()=>{ const F=mk([{id:foe,row:row||'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id===actId);
    e.charge=A.tags.includes('charge_up')?A:null; e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; const b=turn(F,e,2); fn(F,e,b); });
  rider('lukewarm','tepid_slosh',(F)=>ok(F.party.some(p=>p.st.drenched),'Tepid Slosh Drenches its target'));
  rider('lukewarm','cold_shoulder',(F)=>{ const t=F.party.find(p=>p.st.slow); ok(t&&t.st.slow.n===2,'Cold Shoulder gives Slow for 2 turns'); });
  rider('lukewarm','room_temperature',(F)=>ok(F.party.every(p=>p.st.drenched),'Room Temperature Drenches all three'));
  rider('leftover','snap_lid_flip',(F,e,b)=>ok(b.some(x=>x.t==='hit'),'Snap-Lid Flip is a plain hit'));
  rider('leftover','mystery_tupperware',(F)=>{ const t=F.party.find(p=>p.st.blind); ok(t&&t.st.blind.n===1,'Mystery Tupperware gives Blind for 1 turn'); });
  rider('leftover','freezer_burn',(F)=>ok(F.party.every(p=>p.st.slow&&p.st.slow.n===1),'Freezer Burn Slows all three for 1 turn'));
  rider('wetblanket','why_bother',(F)=>{ const t=F.party.find(p=>p.st.why_bother); ok(t&&t.st.why_bother.n===2&&near(off(t,'why_bother','atk'),.8,.005),'“Why Bother?”: -20% Attack for 2 turns'); });
  rider('wetblanket','damp_smother',(F)=>ok(F.party.some(p=>p.st.drenched),'Damp Smother Drenches its target'));
  noCrit(()=>{ const F=mk([{id:'wetblanket',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='dampen_spirits'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    turn(F,e,2); ok(e.charge&&e.charge.id==='dampen_spirits'&&!F.party.some(p=>p.st.fatigue),'Dampen Spirits is announced first and does nothing yet');
    F.acting=e; turn(F,e,3); ok(F.party.every(p=>p.st.fatigue&&p.st.drenched),'it lands on the next turn: Fatigue and Drenched on all three');
    const f2=mk([{id:'wetblanket',row:'front'}]),e2=f2.foes[0]; e2.charge=A; loseCharge(f2,e2); ok(!e2.charge,'an interrupt cancels it'); });
  rider('thedraft','hallway_chill',(F)=>{ const t=F.party.find(p=>p.st.slow); ok(t&&t.st.slow.n===2,'Hallway Chill gives Slow for 2 turns'); },'back');
  noCrit(()=>{ const F=mk([{id:'thedraft',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='slam_the_door'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    const hp0=F.party.map(p=>p.hp); turn(F,e,2); ok(F.party.every((p,i)=>p.hp<hp0[i]),'Slam the Door! hits all three'); });
  rider('pickyeater','ew_it_touched',(F)=>{ const t=F.party.find(p=>p.st.it_touched); ok(t&&t.st.it_touched.n===2&&near(off(t,'it_touched','def'),.85,.005),'“EW, It Touched!”: -15% Defense for 2 turns'); });
  noCrit(()=>{ const F=mk([{id:'pickyeater',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='push_it_away'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    turn(F,e,2); ok(e.charge&&e.charge.id==='push_it_away','Push It Away is announced one turn ahead');
    const pep0=F.party.map(p=>p.pep); F.acting=e; const b=turn(F,e,3); const t=F.party.find(p=>p.st.fatigue);
    ok(t&&b.some(x=>x.t==='pep'&&x.tgt===t.key&&x.n<0)&&b.some(x=>x.t==='push'&&x.tgt===t.key&&x.n>0),'it takes 1 Pep, gives Fatigue and pushes its target back on the turn bar'); });

  // ---------- Pilot-Light Gust: strips one shield or buff ----------
  noCrit(()=>{ const F=mk([{id:'thedraft',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='pilot_light_gust'),tom=F.party.find(p=>p.id==='tom');
    for(const p of F.party) if(p!==tom) p.ko=true;
    addShield(F,tom,300,{src:tom}); add(F,tom,'giddyup',{src:tom}); e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e;
    const b=turn(F,e,2);
    ok(tom.shields.length===0&&!!tom.st.giddyup,'with a shield and a buff on, it takes the shield and leaves the buff'); });
  noCrit(()=>{ const F=mk([{id:'thedraft',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='pilot_light_gust'),tom=F.party.find(p=>p.id==='tom');
    for(const p of F.party) if(p!==tom) p.ko=true;
    add(F,tom,'giddyup',{src:tom}); e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; turn(F,e,2);
    ok(!tom.st.giddyup,'with no shield it takes one buff'); });
  noCrit(()=>{ const F=mk([{id:'thedraft',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='pilot_light_gust'),tom=F.party.find(p=>p.id==='tom');
    for(const p of F.party) if(p!==tom) p.ko=true;
    addShield(F,tom,100,{src:tom}); addShield(F,tom,300,{src:tom}); e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; turn(F,e,2);
    ok(tom.shields.length===1,'with two shields on it takes only one (the biggest): '+tom.shields.length); });

  // ---------- Old Ironbelly ----------
  const boss=o=>{ const F=mk([{id:'ironbelly',row:'front'}],o),e=F.foes[0]; for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,900); p.pep=8; } return {F,e}; };
  noCrit(()=>{ const {F,e}=boss(); e.hp=Math.floor(e.maxHp*.6);
    const order=[]; for(let i=0;i<8;i++) { const P=pick(F,e); order.push(P.act.id); if(P.act.tags.includes('charge_up')) { order.push(P.act.id+'!'); } }
    ok(!order.includes('full_furnace'),'above half HP there is no Full Furnace'); });
  noCrit(()=>{ const {F,e}=boss(); e.actIx=e.D.acts.findIndex(a=>a.id==='broil'); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='broil'&&!e.st.toasty,'BROIL is announced one turn ahead and does nothing yet');
    const hp0=F.party.map(p=>p.hp); F.acting=e; const b=turn(F,e,3);
    ok(F.party.every((p,i)=>p.hp<hp0[i]&&p.st.toasty),'it hits all three and leaves each Toasty');
    ok(e.st.toasty&&e.st.toasty.n===2,'and leaves Old Ironbelly itself Toasty (2 turns)'); });
  noCrit(()=>{ const {F,e}=boss(); e.actIx=e.D.acts.findIndex(a=>a.id==='broil'); F.acting=e; turn(F,e,2); F.acting=e; turn(F,e,3);
    const tom=F.party.find(p=>p.id==='tom'); e.peeves=['drench']; const pips0=e.pips; const b=go(F,tom,'t13_drench',e.key);
    ok(b.some(x=>x.t==='detonate'&&x.id==='steam_cloud'),'a Drench hit on the Toasty boss sets off Steam Cloud!');
    ok(pips0-e.pips===3,'which takes 3 pips (Steam Cloud! 2 plus 1 for the Drench Pet Peeve): '+pips0+' to '+e.pips); });
  noCrit(()=>{ const {F,e}=boss(); e.actIx=e.D.acts.findIndex(a=>a.id==='belly_bump'); F.acting=e; turn(F,e,2);
    ok(!e.st.toasty,'Belly Bump, Soot Puff and the rest leave it cool: the opening is only BROIL and Full Furnace'); });
  noCrit(()=>{ const {F,e}=boss(); e.hp=Math.floor(e.maxHp*.5); e.actIx=e.D.acts.findIndex(a=>a.id==='full_furnace');
    ok(pick(F,e,true).act.id==='full_furnace','at 50% HP Full Furnace is next in the list');
    F.acting=e; turn(F,e,2); ok(e.charge&&e.charge.id==='full_furnace','it is announced one turn ahead');
    F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,3);
    ok(F.party.every((p,i)=>p.hp<hp0[i]&&p.st.toasty)&&e.st.toasty&&e.st.full_furnace&&e.st.full_furnace.n===2,'it hits all three, leaves them Toasty, and leaves Old Ironbelly Toasty with Full Furnace on');
    ok(near(off(e,'full_furnace','atk'),1.2,.005),'Full Furnace is +20% Attack: '+off(e,'full_furnace','atk'));
    ok(ST.full_furnace.kind==='buff','and it is a buff (it can be stripped)'); });
  noCrit(()=>{ const {F,e}=boss(); e.charge=e.D.acts.find(a=>a.id==='broil'); loseCharge(F,e); ok(!e.charge,'an interrupt cancels BROIL'); });
  // Its heat against TNB's clay: Hot Coal and BROIL are Sizzle and fire a stone clay shield into Fired Glaze.
  noCrit(()=>{ const {F,e}=boss(); const tnb=F.party.find(p=>p.id==='tnb'); e.peeves=[]; e.resists=[];
    for(const p of F.party) { addShield(F,p,300,{src:tnb,clay:true}); for(const sh of p.shields) sh.stone=.2; }
    e.actIx=e.D.acts.findIndex(a=>a.id==='hot_coal'); e.aimLock=null; F.acting=e; const hp0=e.hp; turn(F,e,2);
    const fired=F.party.filter(p=>p.shields.some(s=>s.glaze)); ok(fired.length===1,'Hot Coal fires the stone clay shield of the one it hit into Fired Glaze: '+fired.length);
    ok(e.hp<hp0,'and Fired Glaze throws part of what it soaked back at Old Ironbelly: '+(hp0-e.hp)); });
  noCrit(()=>{ const {F,e}=boss(); const tnb=F.party.find(p=>p.id==='tnb'); e.peeves=[]; e.resists=[];
    for(const p of F.party) { addShield(F,p,300,{src:tnb,clay:true}); for(const sh of p.shields) sh.stone=.2; }
    e.actIx=e.D.acts.findIndex(a=>a.id==='broil'); F.acting=e; turn(F,e,2); F.acting=e; turn(F,e,3);
    ok(F.party.every(p=>p.shields.some(s=>s.glaze)),'BROIL fires every clay shield the family has into Fired Glaze'); });

  // ====================== Chapter 9: the Rose Dome Ballroom (stage 13b) ======================
  const P9=['tom','grace','rose','deedee'];
  const mk9=(foes,o)=>NF(Object.assign({party:P9,level:22,seed:11,foes},o||{}));
  const ROWS9=[
    ['velvetrope',9,'swarmer','front',273,63,34,112,0,['clobber','racket'],[]],['stuffedshirt',9,'bruiser','front',483,81,44,102,0,['racket','drench'],['razzle']],
    ['coathanger',9,'bruiser','front',483,81,44,102,0,['clobber','drench'],['sizzle']],['soreloser',9,'hexer','back',357,70,38,112,0,['sizzle','razzle'],['racket']],
    ['wallflower',9,'elite','front',756,85,53,96,4,['razzle','sizzle'],['clobber']],['mirrorball',9,'boss','front',1590,93,48,109,7,['racket','clobber'],['razzle']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS9) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists]));
    ok(D.acts.filter(a=>!a.after&&a.hits!=='attacker').length>=3,id+' has its acts'); }
  ok(FOES.mirrorball.hp3===1190&&FOES.mirrorball.noRun,'The Mirrorball prints 1,190 for a party of 3 and cannot be run from');
  { const hpOf=party=>NF({party,level:22,seed:3,foes:[{id:'mirrorball',row:'front'}]}).foes[0].maxHp;
    ok(hpOf(P9)===1590&&hpOf(P9.slice(0,3))===1190,'The Mirrorball: 1,590 for 4, 1,190 for 3'); }
  const FM9={velvetrope:9,stuffedshirt:9,coathanger:9,soreloser:9,wallflower:9,mirrorball:27};
  for(const k of Object.keys(FM9)) ok(FORM[k]&&FORM[k].ch===9&&FORM[k].vp===FM9[k],'formation '+k+' is chapter 9 and pays '+FM9[k]+' VP');
  ok(J(FORM.soreloser.foes)===J([{id:'stuffedshirt',row:'front'},{id:'soreloser',row:'back'}])&&J(FORM.wallflower.foes)===J([{id:'wallflower',row:'front'},{id:'soreloser',row:'back'}]),'the two formations with The Sore Loser match section 4');
  { const labs=LAB.filter(l=>/^new5[1-6]$/.test(l.id));
    ok(labs.length===6&&labs.every(l=>FORM[l.formation]&&FORM[l.formation].ch===9),'Lab fights new51 to new56 each run a real chapter 9 formation');
    ok(labs.every(l=>l.level===22&&J(l.party)===J(P9)&&l.bg==='dome'),'each uses level 22, Tom, Grace, Rose and Deedee, the dome'); }
  for(const id of ['members_only','hmph','gauche','cheater','wall_hug','facet_spin'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');
  ok(ST.cheater.group==='mental'&&ST.cheater.flags.includes('foeTaunt')&&ST.facet_spin.kind==='buff'&&ST.wall_hug.kind==='buff'&&ST.members_only.kind==='buff','Cheater! is Mental and a foe-taunt; Facet Spin, Wall Hug and Members Only are buffs (they can be stripped)');
  { const F=mk9([{id:'wallflower',row:'front'}]),e=F.foes[0]; ok(!!e.st.wall_hug&&near(sum(e,'eva'),.20,1e-9),'The Wallflower starts hugging the wall (+20% Evasion)'); }
  { const F=mk9([{id:'mirrorball',row:'front'}]),e=F.foes[0]; ok(!!e.st.facet_spin&&near(sum(e,'eva'),.25,1e-9),'The Mirrorball starts in a Facet Spin (+25% Evasion)'); }

  const rider9=(foe,actId,fn,row,extra)=>noCrit(()=>{ const F=mk9([{id:foe,row:row||'front'}].concat(extra||[])),e=F.foes[0],A=e.D.acts.find(a=>a.id===actId);
    e.charge=A.tags.includes('charge_up')?A:null; e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; const b=turn(F,e,2); fn(F,e,b); });
  rider9('velvetrope','rope_lash',(F,e,b)=>ok(b.some(x=>x.t==='hit'),'Rope Lash is a plain hit'));
  rider9('velvetrope','not_on_the_list',(F,e,b)=>ok(b.some(x=>x.t==='push'&&x.n>0&&x.n<=15),'“Not On The List” pushes its target back on the turn bar'));
  // Members Only: +15% Defense for the Front monsters, the actor included, and not the Back ones
  noCrit(()=>{ const F=mk9([{id:'velvetrope',row:'front'},{id:'stuffedshirt',row:'front'},{id:'soreloser',row:'back'}]),e=F.foes.find(f=>f.id==='velvetrope'),A=e.D.acts.find(a=>a.id==='members_only'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    const vr=F.foes.find(f=>f.id==='velvetrope'),ss=F.foes.find(f=>f.id==='stuffedshirt'),sl=F.foes.find(f=>f.id==='soreloser'); ok(vr.st.members_only&&ss.st.members_only&&!sl.st.members_only,'Members Only gives the monsters in Front Members Only (itself too) and leaves the Back row alone');
    ok(near(off(ss,'members_only','def'),1.15,.005),'it is +15% Defense: '+off(ss,'members_only','def')); });
  rider9('stuffedshirt','hmph',(F)=>{ const t=F.party.find(p=>p.st.hmph); ok(t&&t.st.hmph.n===2&&near(off(t,'hmph','def'),.85,.005),'“Hmph.”: -15% Defense for 2 turns'); });
  noCrit(()=>{ const F=mk9([{id:'stuffedshirt',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='how_gauche'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='how_gauche'&&!F.party.some(p=>p.st.gauche),'How Gauche! is announced first and does nothing yet');
    F.acting=e; turn(F,e,3); ok(F.party.every(p=>p.st.gauche&&p.st.gauche.n===2&&near(off(p,'gauche','atk'),.85,.005)),'it lands next turn: -15% Attack for 2 turns on all four'); });
  rider9('coathanger','coat_cling',(F)=>{ const t=F.party.find(p=>p.st.slow); ok(t&&t.st.slow.n===2,'1971 Coat Cling gives Slow for 2 turns'); });
  noCrit(()=>{ const F=mk9([{id:'coathanger',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='hang_on_tight'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='hang_on_tight','Hang On Tight is announced first');
    F.acting=e; turn(F,e,3); ok(F.party.every(p=>p.st.slow&&p.st.slow.n===1),'then it Slows all four for 1 turn'); });
  rider9('soreloser','card_flick',(F)=>ok(F.party.some(p=>p.st.bleed),'Card Flick gives Bleed'),'back');
  // Cheater!: Mental, 1 turn, points single-target moves at the Sore Loser
  noCrit(()=>{ const F=mk9([{id:'soreloser',row:'back'},{id:'stuffedshirt',row:'front'}]),e=F.foes.find(f=>f.id==='soreloser'),A=e.D.acts.find(a=>a.id==='cheater'); e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; turn(F,e,2);
    const t=F.party.find(p=>p.st.cheater); ok(t&&t.st.cheater.n===1,'“Cheater!” puts Cheater! on its target for 1 turn');
    const O=G('b3Options')(F,t,SK[t.basic]); ok(O.length===1&&O[0].key===e.key,'the one it names can only aim single-target moves at The Sore Loser'); });
  // Fifty-Two Pickup: hits everyone, the Pep drain and Fatigue land on one
  noCrit(()=>{ const F=mk9([{id:'soreloser',row:'back'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='fifty_two_pickup'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    const hp0=F.party.map(p=>p.hp),pep0=F.party.map(p=>p.pep); for(const p of F.party) p.pep=5; const pe=F.party.map(p=>p.pep); const b=turn(F,e,2);
    ok(F.party.every((p,i)=>p.hp<hp0[i]),'Fifty-Two Pickup hits all four');
    const hit=F.party.filter(p=>p.st.fatigue); ok(hit.length===1&&F.party.filter((p,i)=>p.pep<pe[i]).length===1&&hit[0].pep===5-1,'only the first target loses 1 Pep and gets Fatigue: '+hit.length); });
  // The Wallflower
  rider9('wallflower','sorry',(F,e,b)=>ok(b.some(x=>x.t==='hit'),'“Sorry!” is a plain hit'));
  noCrit(()=>{ const F=mk9([{id:'wallflower',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='do_not_look'); e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; delete e.st.wall_hug; turn(F,e,2);
    const t=F.party.find(p=>p.st.blind); ok(t&&t.st.blind.n===1,'“Do Not Look At Me” blinds its target for 1 turn'); ok(e.st.wall_hug&&e.st.wall_hug.n===2,'and Wall Hug goes up again on The Wallflower (2 turns)'); });
  noCrit(()=>{ const F=mk9([{id:'wallflower',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='petal_storm'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='petal_storm','Petal Storm is announced first'); F.acting=e; turn(F,e,3); ok(F.party.every(p=>p.st.dazzled&&p.st.dazzled.n===2),'then it Dazzles all four for 2 turns'); });

  // ---------- The Mirrorball ----------
  const mb=()=>{ const F=mk9([{id:'mirrorball',row:'front'}]),e=F.foes[0]; for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,900); p.pep=8; } return {F,e}; };
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='facet_dazzle'); e.aimLock=null; F.acting=e; delete e.st.facet_spin; turn(F,e,2);
    const t=F.party.find(p=>p.st.blind); ok(t&&t.st.blind.n===1,'Facet Dazzle blinds its target for 1 turn');
    ok(e.st.facet_spin&&e.st.facet_spin.n===2,'puts Facet Spin up again on her'); ok(e.st.dazzled&&e.st.dazzled.n===2,'and leaves The Mirrorball herself Dazzled for 2 turns'); });
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='facet_dazzle'); F.acting=e; turn(F,e,2);
    const g=F.party.find(p=>p.id==='grace'); e.peeves=['clobber']; const pips0=e.pips; const b=go(F,g,'t13_clobber',e.key);
    ok(b.some(x=>x.t==='detonate'&&x.id==='shatter_glitz'),'a Clobber hit on her Dazzled sets off Shatter Glitz!'); ok(!e.st.facet_spin,'which strips her Facet Spin');
    ok(pips0-e.pips===2,'and takes 2 pips (1 for the Detonation, 1 for the Clobber Pet Peeve): '+pips0+' to '+e.pips); });
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='facet_dazzle'); F.acting=e; turn(F,e,2);
    const g=F.party.find(p=>p.id==='tom'); e.peeves=['racket']; const pips0=e.pips; const b=go(F,g,'t13_racket',e.key);
    ok(b.some(x=>x.t==='detonate'&&x.id==='sensory_overload'),'a Racket hit on her Dazzled sets off Sensory Overload!'); ok(pips0-e.pips===2,'and takes 2 pips with the Racket Pet Peeve: '+pips0+' to '+e.pips); });
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='chain_swing'); F.acting=e; turn(F,e,2); ok(!e.st.dazzled,'Chain Swing and Glitter Beam leave her cool: the opening is only Facet Dazzle and Spotlight Solo'); });
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='glitter_beam'); F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2);
    ok(F.party.every((p,i)=>p.hp<hp0[i])&&!e.st.dazzled,'Glitter Beam hits all four and does nothing else'); });
  noCrit(()=>{ const {F,e}=mb(); e.actIx=e.D.acts.findIndex(a=>a.id==='spotlight_solo'); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='spotlight_solo'&&!e.st.dazzled,'Spotlight Solo is announced one turn ahead and does nothing yet');
    F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,3); ok(F.party.filter((p,i)=>p.hp<hp0[i]).length===1&&e.st.dazzled&&e.st.dazzled.n===2,'then it hits one and leaves her Dazzled (2 turns)'); });
  noCrit(()=>{ const {F,e}=mb(); e.hp=Math.floor(e.maxHp*.6); const seen=new Set(); for(let i=0;i<10;i++) { const P=pick(F,e); seen.add(P.act.id); }
    ok(!seen.has('last_dance'),'above half HP there is no LAST DANCE'); });
  noCrit(()=>{ const {F,e}=mb(); e.hp=Math.floor(e.maxHp*.5); e.actIx=e.D.acts.findIndex(a=>a.id==='last_dance'); ok(pick(F,e,true).act.id==='last_dance','at 50% HP LAST DANCE is next in the list');
    F.acting=e; turn(F,e,2); ok(e.charge&&e.charge.id==='last_dance','it is announced one turn ahead'); F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,3);
    ok(F.party.every((p,i)=>p.hp<hp0[i]),'then it hits all four'); });
  noCrit(()=>{ const {F,e}=mb(); e.charge=e.D.acts.find(a=>a.id==='spotlight_solo'); loseCharge(F,e); ok(!e.charge,'an interrupt cancels Spotlight Solo'); });
};
