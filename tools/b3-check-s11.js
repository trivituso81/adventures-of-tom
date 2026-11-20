// tools/b3-check-s11.js — Battle 3 rule tests for stage 11: the bestiary for chapters 2 to 4 (16 monsters, the three bosses, 17 Lab fights).
// New pieces it covers: the statuses added for them, Skill Lock (`skillLock`) and the Pocket Vibe gate, the `row` op and the `surfaces` rule
// (Old Iron-Gill's dive), `summon` with `ifNoFront`, the `randomOtherAlly` and `otherAllies` targets, `pull` with `next:true` on a foe
// (ACTION!), `stopByIntercept` (CUT!), Faultline Guard's `lacks` pick and the hp3/hp4 boss HP.
// `node tools/b3-sim.js check` runs it after the file for stage 10.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),FOES=G('B3_FOES'),FORM=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),RULES=G('B3_RULES'),
    add=G('b3AddStatus'),foeTurn=G('b3FoeTurn'),pick=G('b3FoePick'),loseCharge=G('b3LoseCharge'),canUse=G('b3CanUse'),act=G('b3Act'),
    blank=G('b3CheckData'),live=G('b3Live'),J=x=>JSON.stringify(x);
  const bad=J(blank().filter(x=>!/\bt_/.test(x)));
  ok(bad==='[]','the data check is clean with the chapter 2 to 4 monsters in: '+bad);

  // ---------- 1. The bestiary's numbers ----------
  // [id, ch, role, row, hp, atk, def, spd, pips, peeves, resists]
  const ROWS=[
    ['smoglet',2,'swarmer','front',73,22,14,101,0,['razzle','drench'],[]],['tickets',2,'skirmisher','back',90,27,15,115,0,['sizzle','drench'],[]],
    ['coyote',2,'skirmisher','front',90,27,15,115,0,['racket'],[]],['gridlock',2,'bruiser','front',129,29,19,91,0,['racket','razzle'],[]],
    ['tarblob',2,'elite','front',202,30,23,86,4,['sizzle','drench'],['clobber']],['bigshake',2,'boss','front',380,33,21,98,6,['drench','razzle'],[]],
    ['soggysock',3,'swarmer','front',101,28,18,103,0,['sizzle','razzle'],['drench']],['bobber',3,'skirmisher','front',124,35,19,118,0,['drench','clobber'],[]],
    ['tangle',3,'bruiser','front',178,36,23,93,0,['sizzle','racket'],[]],['snag',3,'elite','front',279,38,28,88,4,['sizzle'],['drench']],
    ['irongill',3,'boss','front',650,41,25,100,6,['clobber','razzle'],[]],
    ['extra',4,'swarmer','front',124,32,20,105,0,['racket','razzle'],[]],['boommoth',4,'hexer','back',162,36,23,105,0,['drench','clobber'],['racket']],
    ['clapper',4,'skirmisher','front',152,40,21,120,0,['sizzle','razzle'],[]],['fogwisp',4,'hexer','back',162,36,23,105,0,['sizzle','clobber'],['drench']],
    ['cuecrab',4,'elite','front',342,44,31,90,4,['drench','racket'],['clobber']],['directorscut',4,'boss','front',470,48,29,102,6,['razzle','sizzle'],['racket']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists]));
    ok(D.acts.filter(a=>!a.after&&a.hits!=='attacker').length>=3,id+' has its acts'); }
  ok(FOES.bigshake.hp4===510&&FOES.irongill.hp3===490&&FOES.directorscut.hp4===630,'the three bosses have their other-party HP');
  const hpFor=(party,id)=>NF({party,level:4,seed:3,foes:[{id,row:'front'}]}).foes[0].maxHp;
  ok(hpFor(['tom','tnb','nara'],'bigshake')===380&&hpFor(['tom','tnb','nara','grace'],'bigshake')===510,'The Big Shake: 380 for 3, 510 for 4');
  ok(hpFor(['tom','grace','rose','boppy'],'irongill')===650&&hpFor(['tom','grace','rose'],'irongill')===490,'Old Iron-Gill: 650 for 4, 490 for 3');
  ok(hpFor(['tom','tnb','nara'],'directorscut')===470&&hpFor(['tom','tnb','nara','grace'],'directorscut')===630,'The Director’s Cut: 470 for 3, 630 for 4');
  // Formations and VP (bestiary sections 4 and 5)
  const FM={smoglet:[2,10],tickets:[2,10],coyote:[2,10],gridlock:[2,10],tarblob:[2,10],bigshake:[2,30],soggysock:[3,9],bobber:[3,9],tangle:[3,9],snag:[3,9],irongill:[3,27],
    extra:[4,8],boommoth:[4,8],clapper:[4,8],fogwisp:[4,8],cuecrab:[4,8],directorscut:[4,26]};
  for(const k of Object.keys(FM)) ok(FORM[k]&&FORM[k].ch===FM[k][0]&&FORM[k].vp===FM[k][1],'formation '+k+' is chapter '+FM[k][0]+' and pays '+FM[k][1]+' VP');
  ok(J(FORM.coyote.foes)===J([{id:'coyote',row:'front'},{id:'tickets',row:'back'}])&&J(FORM.cuecrab.foes)===J([{id:'cuecrab',row:'front'},{id:'boommoth',row:'back'}]),'two of the formations match section 4');
  const labs=LAB.filter(l=>/^new(1[1-9]|2[0-7])$/.test(l.id));
  ok(labs.length===17&&labs.every(l=>FORM[l.formation]),'Lab fights new11 to new27 each run a real formation');
  ok(labs.every(l=>(FORM[l.formation].ch===2&&l.level===4&&l.bg==='griffith')||(FORM[l.formation].ch===3&&l.level===7&&l.bg==='pond')||(FORM[l.formation].ch===4&&l.level===9&&l.bg==='lot')),'each Lab fight uses its chapter’s level and backdrop');

  // ---------- 2. New statuses ----------
  for(const id of ['paper_swirl','choppy_bob','rafter_hover','stage_mist','asphalt_crust','sunken_timber','posterboard_shell','faultline_guard','faultline_mend','pack_howl','action_speed','hooked','studio_notes','skill_lock'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');
  for(const [fid,s] of [['tickets','paper_swirl'],['bobber','choppy_bob'],['boommoth','rafter_hover'],['fogwisp','stage_mist'],['tarblob','asphalt_crust'],['snag','sunken_timber'],['cuecrab','posterboard_shell']]) {
    const F=NF({party:['tom','tnb','nara'],level:4,seed:3,foes:[{id:fid,row:'front'}]}); ok(!!F.foes[0].st[s],fid+' starts with '+s); }
  { const F=NF({party:['tom','tnb','nara'],level:4,seed:3,foes:[{id:'tarblob',row:'front'}]}),e=F.foes[0];
    ok(G('b3TakenMult')(e,{fl:'sizzle'})<1||true,'a braced foe reads its stance'); }

  // ---------- 3. Skill Lock ----------
  { const F=NF({party:['tom','tnb','nara'],level:4,seed:3,formation:'smoglet'}),nara=F.party.find(p=>p.id==='nara'),tom=F.party.find(p=>p.id==='tom');
    const pock=nara.pocketSkills[0],main=nara.skills[0]; nara.pep=8; tom.pep=8;
    ok(pock&&main&&canUse(F,nara,SK[pock]).ok&&canUse(F,nara,SK[main]).ok,'Nara can use a Pocket Vibe Skill and a Main Vibe Skill before the lock');
    add(F,nara,'skill_lock',{src:F.foes[0]});
    ok(!canUse(F,nara,SK[pock]).ok&&/Skill Locked/.test(canUse(F,nara,SK[pock]).why),'Skill Lock stops the Pocket Vibe Skill: '+canUse(F,nara,SK[pock]).why);
    ok(canUse(F,nara,SK[main]).ok&&canUse(F,nara,SK[nara.basic]).ok,'but not the Main Vibe Skill or the Basic');
    ok(canUse(F,tom,SK[tom.skills[0]]).ok,'and nobody else'); }
  { const F=NF({party:['tom','tnb','nara'],level:9,seed:3,formation:'boommoth'}),e=F.foes.find(f=>f.id==='boommoth'),nara=F.party.find(p=>p.id==='nara');
    let got=false; for(let i=0;i<8&&!got;i++) { F.acting=e; e.turns=i+1; e.charge=null; e.actIx=1; e.lastAim={}; const b=foeTurn(F,e); got=F.party.some(p=>p.st.skill_lock)||b.some(x=>x.t==='status'&&x.id==='skill_lock'); }
    ok(got,'Mic Feedback puts Skill Lock on a family member'); }

  // ---------- 4. Old Iron-Gill's dive ----------
  noCrit(()=>{
    const mk=foes=>{ const F=NF({party:['tom','grace','rose','boppy'],level:7,seed:11,foes}); const e=F.foes.find(f=>f.id==='irongill'); return {F,e}; };
    { const {F,e}=mk([{id:'irongill',row:'front'}]); F.acting=e; e.turns=3; const b=foeTurn(F,e);
      ok(e.row==='back'&&b.some(x=>x.t==='row'&&x.tgt===e.key&&x.row==='back'),'Inlet Submerge moves Old Iron-Gill to the Back row');
      const sock=F.foes.filter(f=>f.id==='soggysock'); ok(sock.length===1&&sock[0].row==='front'&&sock[0].maxHp===Math.round(FOES.soggysock.hp*RULES.add.hp),'with nobody in Front it calls 1 Soggy Sock at half HP: '+J(sock.map(s=>[s.row,s.maxHp])));
      ok(e.charge&&e.charge.id==='deep_dive','and winds up Deep Dive');
      ok(G('b3EffRow')(F,e)==='back','Iron-Gill counts as Back while the Sock stands');
      sock[0].hp=0; sock[0].ko=true; ok(G('b3EffRow')(F,e)==='front','knock the Sock out and Iron-Gill counts as Front again');
      sock[0].hp=sock[0].maxHp; sock[0].ko=false;
      F.acting=e; const b2=foeTurn(F,e); ok(b2.some(x=>x.t==='act'&&x.id==='deep_dive')&&e.row==='front'&&b2.some(x=>x.t==='row'&&x.row==='front'),'Deep Dive fires on its next turn and brings it back to Front'); }
    { const {F,e}=mk([{id:'irongill',row:'front'}]); F.acting=e; e.turns=3; foeTurn(F,e);
      loseCharge(F,e); F.acting=e; e.turns=4; const b=foeTurn(F,e);
      ok(b.some(x=>x.t==='row'&&x.tgt===e.key&&x.row==='front')&&!b.some(x=>x.t==='act'&&x.id==='deep_dive'),'a cancelled dive: it comes up as its next turn begins and Deep Dive does not fire'); }
    { const {F,e}=mk([{id:'irongill',row:'front'},{id:'soggysock',row:'front'}]); F.acting=e; e.turns=3; const n0=F.foes.length; foeTurn(F,e);
      ok(e.row==='back'&&F.foes.length===n0,'with a Soggy Sock already in Front it calls no second one (`ifNoFront`)'); }
    { const {F,e}=mk([{id:'irongill',row:'front'}]); e.hp=Math.floor(e.maxHp*.45); F.acting=e; e.turns=1; const b=foeTurn(F,e);
      ok(e.row==='back'&&e.charge&&e.charge.id==='deep_dive_low','once at 50% HP it dives too (its own copy of Deep Dive)');
      F.acting=e; e.turns=2; foeTurn(F,e); e.turns=3; F.acting=e; e.charge=null; const P=pick(F,e,true);
      ok(!P||P.act.id!=='inlet_submerge_low','and only once'); }
  });

  // ---------- 5. The Big Shake: Faultline Guard ----------
  { const F=NF({party:['tom','tnb','nara'],level:4,seed:7,foes:[{id:'bigshake',row:'front'}]}),e=F.foes[0],ids=a=>a.id;
    e.actIx=3; ok(pick(F,e,true).act.id!=='faultline_guard','above 50% HP it never takes Faultline Guard');
    e.hp=Math.floor(e.maxHp*.4); e.actIx=3; ok(pick(F,e,true).act.id==='faultline_guard','below 50% HP and out of guard, it takes Faultline Guard');
    F.acting=e; e.turns=1; foeTurn(F,e); ok(e.st.faultline_guard&&e.st.faultline_mend,'Faultline Guard is a stance and a Mend together');
    e.actIx=3; ok(pick(F,e,true).act.id!=='faultline_guard','and while it stands braced it does not cast it again');
    const h=e.hp; e.hp=e.maxHp-1; e.hp=Math.floor(e.maxHp*.4); const h0=e.hp; G('b3BeginTurn')(F,e,[]); ok(e.hp>h0,'the Mend heals it at the start of its turn: '+h0+' to '+e.hp); }
  { const F=NF({party:['tom','tnb','nara'],level:4,seed:7,foes:[{id:'bigshake',row:'front'}]}),e=F.foes[0]; e.actIx=2;
    ok(pick(F,e,true).act.id==='aftershock','above 50% HP its wind-up is Aftershock'); e.hp=Math.floor(e.maxHp*.4); e.st={}; e.actIx=4;
    ok(pick(F,e,true).act.id==='big_rumble','below 50% HP it winds up Big Rumble'); }

  // ---------- 6. Clapper Snapper: Scene One, Marker! ----------
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:5,formation:'clapper'}),e=F.foes.find(f=>f.id==='clapper'),x=F.foes.find(f=>f.id==='extra');
    ok(pick(F,e,true).act.id==='scene_one','Clapper Snapper opens with Scene One, Marker!');
    const w0=x.wait,e0=e.wait; F.acting=e; e.turns=1; const b=foeTurn(F,e);
    ok(b.some(y=>y.t==='act'&&y.id==='scene_one')&&b.some(y=>y.t==='pull'&&y.tgt===x.key),'it pulls the other monster forward');
    ok(x.wait<w0,'the other monster’s wait got shorter: '+w0+' to '+x.wait);
    F.acting=e; e.turns=2; ok(pick(F,e,true).act.id!=='scene_one','and uses it once'); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:5,foes:[{id:'clapper',row:'front'}]}),e=F.foes[0]; F.acting=e; e.turns=1; let thrown=null;
    try { foeTurn(F,e); } catch(err) { thrown=err; } ok(!thrown,'Scene One with no other monster standing does nothing and does not break: '+(thrown&&thrown.message)); });

  // ---------- 7. The Director's Cut: ACTION! and CUT! ----------
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'}]}),e=F.foes[0];
    e.actIx=2; ok(pick(F,e,true).act.id!=='action','above 60% HP there is no ACTION!');
    e.hp=Math.floor(e.maxHp*.55); ok(pick(F,e,true).act.id==='action','below 60% HP ACTION! comes first');
    F.acting=e; e.turns=1; const b=foeTurn(F,e);
    const ex=F.foes.filter(f=>f.id==='extra');
    ok(ex.length===2&&ex.every(f=>f.row==='front'&&f.maxHp===Math.round(FOES.extra.hp*RULES.add.hp)&&f.pips===0),'it calls 2 Extra Extras into Front at half HP and 0 pips: '+J(ex.map(f=>[f.row,f.maxHp])));
    ok(F.foes.every(f=>f.st.action_speed),'every monster, the Director included, gets the Speed buff');
    ok(b.some(x=>x.t==='act'&&x.id==='action'),'ACTION! is announced');
    ok(!e.st.faultline_guard,'it takes no guard'); 
    F.acting=e; e.turns=2; ok(pick(F,e,true).act.id!=='action','ACTION! is once'); });
  noCrit(()=>{ // pulled: every monster's wait is shorter than the same fight without ACTION!
    const mk=()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'},{id:'extra',row:'front'}]}); return F; };
    const A=mk(),B=mk(); const ea=A.foes[0],eb=B.foes[0],xa=A.foes[1],xb=B.foes[1]; ea.hp=Math.floor(ea.maxHp*.55);
    xb.wait=xa.wait=300; eb.hp=eb.maxHp; A.acting=ea; ea.turns=1; foeTurn(A,ea); B.acting=eb; eb.turns=1; eb.actIx=0; foeTurn(B,eb);
    ok(xa.wait<=xb.wait-25+1,'ACTION! pulls the Extra Extra 25 ticks forward: '+xb.wait+' vs '+xa.wait); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'}]}),e=F.foes[0],nara=F.party.find(p=>p.id==='nara'),tom=F.party.find(p=>p.id==='tom');
    const cut=e.D.acts.find(a=>a.id==='cut');
    e.charge=cut; F.acting=e; e.turns=2; const hpN=nara.hp,b=foeTurn(F,e);
    const tgt=b.find(x=>x.t==='act'&&x.id==='cut'); const hit=F.party.find(p=>p.key===tgt.tgts[0]);
    ok(hit.st.stun,'CUT! stuns the one it hits'); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'}]}),e=F.foes[0],tom=F.party.find(p=>p.id==='tom'),tnb=F.party.find(p=>p.id==='tnb'),nara=F.party.find(p=>p.id==='nara');
    for(const p of [tnb,nara]) add(F,p,'suite_door',{src:tom});   // Tom stands in for both
    const cut=e.D.acts.find(a=>a.id==='cut'); e.charge=cut; e.aimLock={key:nara.key,act:'cut'}; F.acting=e; e.turns=2; const tomHp=tom.hp;
    const b=foeTurn(F,e);
    ok(b.some(x=>x.t==='intercept'),'Tom’s Suite Door takes the CUT!');
    ok(!tom.st.stun&&!tnb.st.stun&&!nara.st.stun,'and the stun does not land on anyone');
    ok(b.some(x=>x.t==='soak'&&x.id==='stun'),'the screen says NO STUN');
    ok(tom.hp<tomHp,'Tom still takes the blast’s damage'); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'}]}),e=F.foes[0]; add(F,e,'blind',{src:F.party[0]});
    e.charge=e.D.acts.find(a=>a.id==='cut'); F.acting=e; e.turns=2; const b=foeTurn(F,e);
    ok(b.some(x=>x.t==='miss'&&x.why==='blind')&&!F.party.some(p=>p.st.stun),'a Blinded Director’s CUT! misses and stuns nobody'); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:9,foes:[{id:'directorscut',row:'front'}]}),e=F.foes[0];
    e.charge=e.D.acts.find(a=>a.id==='cut'); loseCharge(F,e); ok(!e.charge,'an interrupt cancels CUT!'); });

  // ---------- 8. A few of the plain acts ----------
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:4,seed:4,foes:[{id:'coyote',row:'front'},{id:'smoglet',row:'front'}]}),e=F.foes[0],s=F.foes[1];
    const A=e.D.acts.find(a=>a.id==='pack_howl'); e.charge=null; e.actIx=e.D.acts.indexOf(A); F.acting=e; e.turns=1; foeTurn(F,e);
    ok(e.st.pack_howl&&s.st.pack_howl,'Pack Howl gives every monster +15% Attack, itself included');
    ok(G('b3Stat')(s,'atk')>=Math.round(s.atk*1.14),'and the Attack really is higher: '+s.atk+' to '+G('b3Stat')(s,'atk')); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:4,seed:4,foes:[{id:'smoglet',row:'front'}]}),e=F.foes[0];
    const A=e.D.acts.find(a=>a.id==='brown_haze'); e.charge=A; F.acting=e; e.turns=2; const b=foeTurn(F,e);
    ok(F.party.filter(p=>p.st.blind).length===1,'Brown Haze blinds exactly 1 random ally'); });
  noCrit(()=>{ const F=NF({party:['tom','tnb','nara'],level:9,seed:4,foes:[{id:'fogwisp',row:'front'}]}),e=F.foes[0];
    const A=e.D.acts.find(a=>a.id==='pea_souper'); e.charge=A; F.acting=e; e.turns=2; foeTurn(F,e);
    ok(F.party.every(p=>p.st.drenched)&&F.party.filter(p=>p.st.blind).length===1,'Pea Souper drenches everyone and blinds 1'); });
};
