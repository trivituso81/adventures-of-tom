// tools/b3-check-s12.js — Battle 3 rule tests for stage 12: the bestiary for chapters 5 to 7 (stage 12a: chapter 5, the school).
// Chapter 5: Pop Quiz, Tardy Bell, Glitter Glue, Dodgeball Dread (Elite), The Red Pen (boss) and Lab fights new28 to new32.
// New pieces it covers: the chapter 5 statuses, the act field `starts` (Strict Grading's repeat count), a counter act that only answers
// while a status stands (Points Off), Strict Grading ending on a Mix, a Break or a stance strip, Amy's Lights-Out Reset against Final Grade,
// and SEE ME (`foeTaunt`). Chapters 6 and 7 are added to this file by their own parts (b3s12b, b3s12).
// `node tools/b3-sim.js check` runs it after the file for stage 11.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),FOES=G('B3_FOES'),FORM=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),
    add=G('b3AddStatus'),foeTurn=G('b3FoeTurn'),pick=G('b3FoePick'),loseCharge=G('b3LoseCharge'),act=G('b3Act'),options=G('b3Options'),
    stat=G('b3Stat'),sum=G('b3Sum'),blank=G('b3CheckData'),J=x=>JSON.stringify(x);
  const bad=J(blank().filter(x=>!/\bt_/.test(x)));
  ok(bad==='[]','the data check is clean with the chapter 5 monsters in: '+bad);
  const P5=['tom','grace','rose','amy'];
  const mk=(foes,o)=>NF(Object.assign({party:P5,level:12,seed:11,foes},o||{}));
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  // The Attack a unit has with a status on, as a share of what it has with that status off.
  const ratio=(t,id)=>{ const a=stat(t,'atk'),st=t.st[id]; delete t.st[id]; const b=stat(t,'atk'); t.st[id]=st; return a/b; };
  // Test rows, in the sandbox only; taken out again at the end of this file.
  for(const [id,fl] of [['t12_clobber','clobber'],['t12_racket','racket'],['t12_sizzle','sizzle']])
    SK[id]={id,vibe:'tom_flier',slot:'s1',name:'Test '+id,pep:0,flavor:[fl],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t12_multi={id:'t12_multi',vibe:'tom_flier',slot:'s1',name:'Test multi',pep:0,flavor:['sizzle'],power:'standard',hits:3,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};

  // ---------- 1. The bestiary's numbers (chapter 5) ----------
  // [id, ch, role, row, hp, atk, def, spd, pips, peeves, resists]
  const ROWS=[
    ['popquiz',5,'swarmer','front',148,37,22,107,0,['racket','sizzle'],[]],['tardybell',5,'hexer','back',194,42,25,107,0,['drench','racket'],['clobber']],
    ['glitterglue',5,'hexer','back',194,42,25,107,0,['drench','clobber'],['razzle']],['dodgeball',5,'elite','front',410,51,35,92,4,['racket','drench'],['clobber']],
    ['redpen',5,'boss','front',900,55,32,104,6,['drench','razzle'],['clobber']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists]));
    ok(D.acts.filter(a=>!a.after&&a.hits!=='attacker').length>=3,id+' has its acts'); }
  ok(FOES.redpen.hp3===680&&FOES.redpen.noRun,'The Red Pen prints 680 for a party of 3 and cannot be run from');
  const hpFor=(party,id)=>NF({party,level:12,seed:3,foes:[{id,row:'front'}]}).foes[0].maxHp;
  ok(hpFor(P5,'redpen')===900&&hpFor(['tom','grace','rose'],'redpen')===680,'The Red Pen: 900 for 4, 680 for 3');
  const FM={popquiz:[5,12],tardybell:[5,12],glitterglue:[5,12],dodgeball:[5,12],redpen:[5,30]};
  for(const k of Object.keys(FM)) ok(FORM[k]&&FORM[k].ch===FM[k][0]&&FORM[k].vp===FM[k][1],'formation '+k+' is chapter '+FM[k][0]+' and pays '+FM[k][1]+' VP');
  ok(J(FORM.dodgeball.foes)===J([{id:'dodgeball',row:'front'},{id:'tardybell',row:'back'}])&&J(FORM.glitterglue.foes)===J([{id:'popquiz',row:'front'},{id:'glitterglue',row:'back'}]),'two of the formations match section 4');
  { const labs=LAB.filter(l=>/^new(2[89]|3[0-2])$/.test(l.id));
    ok(labs.length===5&&labs.every(l=>FORM[l.formation]&&FORM[l.formation].ch===5),'Lab fights new28 to new32 each run a real chapter 5 formation');
    ok(labs.every(l=>l.level===12&&J(l.party)===J(P5)&&(l.id==='new32'?l.bg==='cafe':l.bg==='classroom')),'each uses level 12, Tom, Grace, Rose and Amy, the classroom (the boss: the cafetorium)'); }

  // ---------- 2. New statuses ----------
  for(const id of ['gym_bounce','trick_question','picked_last','margin_note','see_me','strict_grading','points_off'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');
  { const F=mk([{id:'dodgeball',row:'front'}]); ok(!!F.foes[0].st.gym_bounce,'Dodgeball Dread starts bouncing');
    ok(near(sum(F.foes[0],'eva'),.20,1e-9),'and the bounce is +20% Evasion: '+sum(F.foes[0],'eva')); }

  // ---------- 3. The plain acts ----------
  const rider=(foe,actId,fn)=>noCrit(()=>{ const F=mk([{id:foe,row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id===actId);
    e.charge=A.tags.includes('charge_up')?A:null; e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e;
    const b=turn(F,e,2); fn(F,e,b); });
  rider('popquiz','trick_question',(F,e,b)=>{ const t=F.party.find(p=>p.st.trick_question);
    ok(t&&t.st.trick_question.n===1,'Trick Question puts -15% Attack for 1 turn on its target');
    ok(near(ratio(t,'trick_question'),.85,.005),'and the Attack really is 15% lower: '+ratio(t,'trick_question')); });
  rider('popquiz','pencils_down',(F,e,b)=>{ const t=F.party.find(p=>p.st.fatigue); ok(t&&b.some(x=>x.t==='pep'&&x.tgt===t.key&&x.n<0),'Pencils Down! takes 1 Pep and gives Fatigue'); });
  rider('popquiz','paper_cut',(F,e,b)=>ok(F.party.some(p=>p.st.bleed),'Paper Cut makes its target Bleed'));
  noCrit(()=>{ const F=mk([{id:'tardybell',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='youre_late'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    const b=turn(F,e,2),t=F.party.find(p=>p.st.slow); ok(t&&b.some(x=>x.t==='push'&&x.tgt===t.key&&x.n>0),'You’re Late! Slows its target and pushes it back on the turn bar'); });
  noCrit(()=>{ const F=mk([{id:'tardybell',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='first_bell_ring'); e.actIx=e.D.acts.indexOf(A); F.acting=e;
    const b=turn(F,e,2); ok(e.charge&&e.charge.id==='first_bell_ring'&&!F.party.some(p=>p.st.fatigue),'First-Bell Ring is announced first and does nothing yet');
    F.acting=e; const b2=turn(F,e,3); ok(F.party.every(p=>p.st.fatigue),'it rings on the next turn: Fatigue on all four'); });
  noCrit(()=>{ const F=mk([{id:'glitterglue',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='glitter_burst'); e.charge=A; F.acting=e; turn(F,e,2);
    ok(F.party.filter(p=>p.st.blind).length===1,'Glitter Burst blinds exactly 1 random ally'); });
  rider('glitterglue','paste_down',(F,e,b)=>ok(F.party.some(p=>p.st.slow),'Paste Down gives Slow'));
  rider('dodgeball','picked_last',(F,e,b)=>{ const t=F.party.find(p=>p.st.picked_last); ok(t&&t.st.picked_last.n===2&&near(ratio(t,'picked_last'),.8,.005),'Picked Last: -20% Attack for 2 turns'); });
  noCrit(()=>{ const F=mk([{id:'dodgeball',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='gym_wall_ricochet'); e.charge=A; F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2);
    ok(F.party.every((p,i)=>p.hp<hp0[i]),'Gym-Wall Ricochet hits every family member'); });

  // ---------- 4. The Red Pen: Strict Grading ----------
  const rp=o=>{ const F=mk([{id:'redpen',row:'front'}],o),e=F.foes[0]; for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,600); p.pep=8; } e.peeves=[]; e.resists=[]; return {F,e}; };
  noCrit(()=>{ const {F,e}=rp();
    e.actIx=3; ok(!/strict_grading/.test(pick(F,e,true).act.id),'above 55% HP there is no Strict Grading');
    e.hp=Math.floor(e.maxHp*.56); ok(!/strict_grading/.test(pick(F,e,true).act.id),'56% is still too high');
    e.hp=Math.floor(e.maxHp*.55); ok(pick(F,e,true).act.id==='strict_grading_first','at 55% HP Strict Grading comes first, before anything in its list');
    const b=turn(F,e,2); ok(e.st.strict_grading&&e.st.strict_grading.n===2,'it raises the stance for 2 turns');
    ok(ST.strict_grading.mods.some(m=>m.stat==='reduce'&&m.v===.30),'the stance is 30% less damage taken (not the usual 25)');
    ok(b.some(x=>x.t==='act'&&x.id==='strict_grading_first'),'the screen names it');
    ok(e.uses.strict_grading_first===1&&e.lastUse.strict_grading===2,'the first use started the repeat’s count at its own turn: '+e.lastUse.strict_grading);
    e.st={}; for(const n of [3,4]) { e.turns=n; const P=pick(F,e,true); ok(!P||P.act.id!=='strict_grading','not before the 3rd turn after (turn '+n+')'); }
    e.turns=5; const P5_=pick(F,e,true); ok(P5_&&P5_.act.id==='strict_grading','on the 3rd turn after it comes again: '+(P5_&&P5_.act.id));
    e.hp=Math.floor(e.maxHp*.6); ok(!pick(F,e,true)||pick(F,e,true).act.id!=='strict_grading','but never above 55% HP'); });
  noCrit(()=>{ // the stance really takes 30% off a hit
    const A=rp(),B=rp(); A.e.hp=B.e.hp=Math.floor(A.e.maxHp*.5); add(A.F,A.e,'strict_grading',{src:A.e}); const t=A.F.party[0],u=B.F.party[0];
    go(A.F,t,'t12_clobber',A.e.key); go(B.F,u,'t12_clobber',B.e.key); const la=Math.floor(A.e.maxHp*.5)-A.e.hp,lb=Math.floor(B.e.maxHp*.5)-B.e.hp;
    ok(la>0&&lb>0&&near(la/lb,.70,.04),'a hit on the stance does 70% of the damage: '+la+' vs '+lb); });
  noCrit(()=>{ // Points Off: answers a hit while the stance stands, once per action
    const {F,e}=rp(); const t=F.party.find(p=>p.id==='tom'); add(F,e,'strict_grading',{src:e});
    const b=go(F,t,'t12_clobber',e.key);
    ok(b.some(x=>x.t==='act'&&x.id==='points_off'||x.t==='counter')||t.st.points_off,'a hit on The Red Pen in its stance is answered with Points Off');
    ok(t.st.points_off&&t.st.points_off.n===1&&near(ratio(t,'points_off'),.85,.005),'-15% Attack for 1 turn on the attacker: '+(t.st.points_off&&ratio(t,'points_off')));
    ok(!F.party.filter(p=>p!==t).some(p=>p.st.points_off),'and on nobody else'); });
  noCrit(()=>{ const {F,e}=rp(); const t=F.party.find(p=>p.id==='tom'); add(F,e,'strict_grading',{src:e}); const hp0=t.hp;
    go(F,t,'t12_multi',e.key); const lost=hp0-t.hp; const {F:F2,e:e2}=rp(); const t2=F2.party.find(p=>p.id==='tom'); add(F2,e2,'strict_grading',{src:e2}); const h2=t2.hp;
    go(F2,t2,'t12_clobber',e2.key); const lost1=h2-t2.hp; ok(lost>0&&lost===lost1,'a 3-hit move is answered once, like a 1-hit move: '+lost+' vs '+lost1); });
  noCrit(()=>{ const {F,e}=rp(); const t=F.party.find(p=>p.id==='tom'),hp0=t.hp; go(F,t,'t12_clobber',e.key);
    ok(t.hp===hp0&&!t.st.points_off,'with no stance up there is no answer'); });
  noCrit(()=>{ // a Mix ends the stance at once
    const {F,e}=rp(); const tom=F.party.find(p=>p.id==='tom'),grace=F.party.find(p=>p.id==='grace'); add(F,e,'strict_grading',{src:e});
    go(F,tom,'t12_clobber',e.key); ok(!!e.st.strict_grading,'one hit is no Mix: the stance stands');
    const b=go(F,grace,'t12_racket',e.key); ok(b.some(x=>x.t==='mix')&&!e.st.strict_grading,'a second family member with another flavor makes a Mix and ends the stance'); });
  noCrit(()=>{ const {F,e}=rp(); const tom=F.party.find(p=>p.id==='tom'); add(F,e,'strict_grading',{src:e});
    go(F,tom,'t12_clobber',e.key); go(F,tom,'t12_racket',e.key); ok(!!e.st.strict_grading,'one family member with two flavors is no Mix'); });
  noCrit(()=>{ const {F,e}=rp(); add(F,e,'strict_grading',{src:e}); G('b3Break')(F,{F,actor:F.party[0],src:F.party[0],beats:[],g:'a',detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}},e);
    ok(!e.st.strict_grading,'a Break ends the stance'); });
  noCrit(()=>{ const {F,e}=rp(); add(F,e,'strict_grading',{src:e}); const op=G('B3_OPS'); const c={F,actor:F.party[0],src:F.party[0],beats:[],g:'a',targets:[e],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    op.strip(F,c,{kind:'stance',to:'target'}); ok(!e.st.strict_grading,'a stance strip (Panic Boil!, Nara, Rose’s trap) ends it'); });
  // Final Grade: below 50% HP, party-wide, winds up; Lights-Out Reset (noAoe) blocks it
  noCrit(()=>{ const {F,e}=rp(); e.hp=Math.floor(e.maxHp*.6); e.actIx=e.D.acts.findIndex(a=>a.id==='final_grade'); ok(pick(F,e,true).act.id!=='final_grade','above 50% HP there is no Final Grade');
    e.hp=Math.floor(e.maxHp*.45); e.st={}; e.uses.strict_grading_first=1; e.actIx=e.D.acts.findIndex(a=>a.id==='final_grade'); ok(pick(F,e,true).act.id==='final_grade','below 50% HP Final Grade is next in the list');
    add(F,e,'lights_out',{src:F.party.find(p=>p.id==='amy')}); const P=pick(F,e,true); ok(!P||P.act.id!=='final_grade','Amy’s Lights-Out Reset: Final Grade cannot fire while it lasts'); });
  noCrit(()=>{ const {F,e}=rp(); e.hp=Math.floor(e.maxHp*.45); e.uses.strict_grading_first=1; e.charge=e.D.acts.find(a=>a.id==='final_grade'); const hp0=F.party.map(p=>p.hp); turn(F,e,5);
    ok(F.party.every((p,i)=>p.hp<hp0[i]),'Final Grade slams every family member'); });
  noCrit(()=>{ const {F,e}=rp(); e.charge=e.D.acts.find(a=>a.id==='final_grade'); loseCharge(F,e); ok(!e.charge,'an interrupt cancels Final Grade'); });
  // SEE ME: a charged 1.5x hit with a Mental status that points single-target attacks at the speaker
  noCrit(()=>{ const {F,e}=rp(); const A=e.D.acts.find(a=>a.id==='see_me'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='see_me','SEE ME is announced one turn ahead'); F.acting=e; turn(F,e,3);
    const t=F.party.find(p=>p.st.see_me); ok(t&&t.st.fatigue&&ST.see_me.group==='mental','it puts SEE ME (Mental) and Fatigue on its target'); });
  noCrit(()=>{ const F=mk([{id:'redpen',row:'front'},{id:'popquiz',row:'front'}]),e=F.foes[0],q=F.foes[1],tom=F.party.find(p=>p.id==='tom'); const S=SK[tom.skills[0]]||SK[tom.basic];
    ok(options(F,tom,SK[tom.basic]).length===2,'with no SEE ME Tom can aim a single-target move at either monster');
    add(F,tom,'see_me',{src:e}); const O=options(F,tom,SK[tom.basic]); ok(O.length===1&&O[0].key===e.key,'with SEE ME his single-target moves can only aim at The Red Pen'); });
  ok(FOES.redpen.acts.filter(a=>a.hits==='attacker').length===1&&FOES.redpen.acts.find(a=>a.hits==='attacker').recovery===0,'Points Off is a counter act with Recovery 0');
  ok(J(FOES.redpen.acts.find(a=>a.id==='strict_grading_first').when)===J({once:true,hpBelow:.55})&&FOES.redpen.acts.find(a=>a.id==='strict_grading').when.everyTurn===3,'Strict Grading’s two rows: once at 55% HP, then every 3rd turn');

  for(const k of ['t12_clobber','t12_racket','t12_sizzle','t12_multi']) delete SK[k];
};
