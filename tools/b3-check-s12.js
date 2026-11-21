// tools/b3-check-s12.js — Battle 3 rule tests for stage 12: the bestiary for chapters 5 to 7 (stage 12a: chapter 5, the school).
// Chapter 5: Pop Quiz, Tardy Bell, Glitter Glue, Dodgeball Dread (Elite), The Red Pen (boss) and Lab fights new28 to new32.
// New pieces it covers: the chapter 5 statuses, the act field `starts` (Strict Grading's repeat count), a counter act that only answers
// while a status stands (Points Off), Strict Grading ending on a Mix, a Break or a stance strip, Amy's Lights-Out Reset against Final Grade,
// and SEE ME (`foeTaunt`). Chapter 6 (stage 12b): Old Oak Park, Chairman Cheeks and the Acorn Cache: `randomFrontAlly`, `summon` with printed HP,
// the conditions `noAllyId` and `allyAge`, the ops `eat` and `hpLoss`, helper feedback (`onKo`), Executive Monocle. Chapter 7 (stage 12c): the library, The Unread, THE END (`unshielded`), Bookmark Ribbon.
// `node tools/b3-sim.js check` runs it after the file for stage 11.
'use strict';
module.exports=function(T) {
  const {G,ok,near,noCrit}=T;
  const NF=G('b3NewFight'),FOES=G('B3_FOES'),FORM=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),
    add=G('b3AddStatus'),foeTurn=G('b3FoeTurn'),pick=G('b3FoePick'),loseCharge=G('b3LoseCharge'),act=G('b3Act'),options=G('b3Options'),
    stat=G('b3Stat'),sum=G('b3Sum'),crit=G('b3CritChance'),blank=G('b3CheckData'),J=x=>JSON.stringify(x);
  const bad=J(blank().filter(x=>!/\bt_/.test(x)));
  ok(bad==='[]','the data check is clean with the chapter 5 monsters in: '+bad);
  const P5=['tom','grace','rose','amy'];
  const mk=(foes,o)=>NF(Object.assign({party:P5,level:12,seed:11,foes},o||{}));
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const turn=(F,e,n)=>{ F.acting=e; if(n!=null) e.turns=n; return foeTurn(F,e); };
  // The Attack a unit has with a status on, as a share of what it has with that status off.
  const ratio=(t,id,st2)=>{ const k=st2===true?'def':'atk',a=stat(t,k),st=t.st[id]; delete t.st[id]; const b=stat(t,k); t.st[id]=st; return a/b; };
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


  // ====================== Chapter 6: Old Oak Park (stage 12b) ======================
  const P6=['tom','tnb','nara'];
  const mk6=(foes,o)=>NF(Object.assign({party:P6,level:14,seed:11,foes},o||{}));
  const ROWS6=[
    ['acornagent',6,'swarmer','front',185,44,26,109,0,['racket','drench'],[]],['stickysap',6,'bruiser','front',328,57,34,99,0,['sizzle','clobber'],['drench']],
    ['peanutgallery',6,'hexer','back',242,49,29,109,0,['racket','sizzle'],['clobber']],['twigspy',6,'skirmisher','back',228,55,27,125,0,['sizzle','razzle'],['racket']],
    ['cheekstuffer',6,'elite','front',513,60,40,94,4,['drench','racket'],['clobber']],['acorncache',6,'helper','back',150,0,26,109,0,['clobber','sizzle'],[]],
    ['chairman',6,'boss','front',660,65,37,106,6,['drench','sizzle'],['racket']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS6) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists])); }
  ok(FOES.acorncache.acts.length===0,'the Acorn Cache never attacks (no acts)');
  ok(FOES.chairman.hp4===880&&FOES.chairman.noRun,'Chairman Cheeks prints 880 for a party of 4 and cannot be run from');
  { const hp6=(party)=>NF({party,level:14,seed:3,foes:[{id:'chairman',row:'front'}]}).foes[0].maxHp; ok(hp6(P6)===660&&hp6([...P6,'grace'])===880,'Chairman Cheeks: 660 for 3, 880 for 4'); }
  const FM6={acornagent:[6,6],stickysap:[6,6],peanutgallery:[6,6],twigspy:[6,6],cheekstuffer:[6,6],chairman:[6,30]};
  for(const k of Object.keys(FM6)) ok(FORM[k]&&FORM[k].ch===FM6[k][0]&&FORM[k].vp===FM6[k][1],'formation '+k+' is chapter 6 and pays '+FM6[k][1]+' VP');
  ok(J(FORM.stickysap.foes)===J([{id:'stickysap',row:'front'},{id:'acornagent',row:'front'}])&&J(FORM.cheekstuffer.foes)===J([{id:'cheekstuffer',row:'front'},{id:'peanutgallery',row:'back'}]),'two of the formations match section 4');
  { const labs=LAB.filter(l=>/^new3[3-8]$/.test(l.id));
    ok(labs.length===6&&labs.every(l=>FORM[l.formation]&&FORM[l.formation].ch===6),'Lab fights new33 to new38 each run a real chapter 6 formation');
    ok(labs.every(l=>l.level===14&&J(l.party)===J(P6)&&(l.id==='new38'?l.bg==='canopy':l.bg==='park')),'each uses level 14, Tom, TNB and Nara, the park (the boss: the oak crown)'); }
  for(const id of ['leaf_camo','code_red','cheap_seat','stakeout_mark','snack_stash','executive_monocle','winter_hoard'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');

  // ---------- Starting statuses ----------
  { const F=mk6([{id:'twigspy',row:'front'}]); ok(!!F.foes[0].st.leaf_camo&&near(sum(F.foes[0],'eva'),.20,1e-9),'Twig Spy starts in Leaf Camo (+20% Evasion)'); }
  { const F=mk6([{id:'chairman',row:'front'}]),e=F.foes[0]; ok(e.st.executive_monocle&&e.st.executive_monocle.n===3,'Chairman Cheeks starts with the Executive Monocle for 3 turns');
    ok(near(sum(e,'crit'),.20,1e-9)&&near(stat(e,'atk')/(delete e.st.executive_monocle,stat(e,'atk')),1.2,.005),'it is +20% Crit Rate and +20% Attack'); }

  // ---------- The plain acts ----------
  const rider6=(foe,actId,fn,row)=>noCrit(()=>{ const F=mk6([{id:foe,row:row||'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id===actId);
    e.charge=A.tags.includes('charge_up')?A:null; e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; const b=turn(F,e,2); fn(F,e,b); });
  noCrit(()=>{ const F=mk6([{id:'acornagent',row:'front'},{id:'acornagent',row:'front'}]),a=F.foes[0],b2=F.foes[1],A=a.D.acts.find(x=>x.id==='code_red'); a.actIx=2; F.acting=a;
    const hp0=F.party.map(p=>p.hp); const b=turn(F,a,2);
    ok(F.party.every((p,i)=>p.hp<hp0[i]),'Code Red! hits the whole family');
    const got=F.foes.filter(f=>f.st.code_red); ok(got.length===1&&got[0].st.code_red.n===1,'and exactly one Front monster gets +15% Speed for 1 turn');
    ok(near(stat(got[0],'spd')/(()=>{ const s=got[0].st.code_red; delete got[0].st.code_red; const v=stat(got[0],'spd'); got[0].st.code_red=s; return v; })(),1.15,.005),'a real +15%'); });
  noCrit(()=>{ const F=mk6([{id:'acornagent',row:'back'},{id:'stickysap',row:'front'}]); const a=F.foes[0]; F.acting=a;
    const o=G('B3_OPS'),c={F,actor:a,src:a,beats:[],g:'a',targets:[],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    const seen={}; for(let i=0;i<30;i++) for(const u of G('b3Who')(F,c,'randomFrontAlly')) seen[u.id]=true;
    ok(J(Object.keys(seen))===J(['stickysap']),'randomFrontAlly picks only monsters standing in Front: '+J(Object.keys(seen))); });
  rider6('acornagent','pebble_toss',(F,e,b)=>ok(F.party.some(p=>p.st.blind),'Pebble Toss blinds its target'));
  rider6('stickysap','resin_drip',(F,e,b)=>ok(F.party.some(p=>p.st.drenched),'Resin Drip Drenches'));
  rider6('stickysap','bark_glue',(F,e,b)=>ok(F.party.some(p=>p.st.slow),'Bark Glue Slows'));
  noCrit(()=>{ const F=mk6([{id:'stickysap',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='sap_flow'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='sap_flow'&&!F.party.some(p=>p.st.slow),'Sap Flow is announced first'); F.acting=e; turn(F,e,3); ok(F.party.every(p=>p.st.slow),'then slows all three'); });
  rider6('peanutgallery','cheap_seat_heckle',(F,e,b)=>{ const t=F.party.find(p=>p.st.cheap_seat); ok(t&&t.st.cheap_seat.n===2&&near(ratio(t,'cheap_seat'),.85,.005),'Cheap Seat Heckle: -15% Attack for 2 turns'); },'back');
  noCrit(()=>{ const F=mk6([{id:'peanutgallery',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='standing_boovation'); e.charge=A; F.acting=e; turn(F,e,2); ok(F.party.every(p=>p.st.fatigue),'Standing Boo-vation: Fatigue on all three'); });
  rider6('twigspy','stakeout_mark',(F,e,b)=>{ const t=F.party.find(p=>p.st.stakeout_mark); ok(t&&near(sum(t,'critTaken'),.20,1e-9),'Stakeout Mark: +20% Crit Rate on attacks against the target');
    ok(crit(e,t,{})>crit(e,F.party.find(p=>p!==t),{}),'and an attack on it really crits more often'); },'back');
  noCrit(()=>{ const F=mk6([{id:'twigspy',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='leaf_storm'); e.actIx=e.D.acts.indexOf(A); F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2); ok(F.party.every((p,i)=>p.hp<hp0[i]),'Leaf Storm hits all three'); });
  rider6('cheekstuffer','crumb_spray',(F,e,b)=>ok(F.party.some(p=>p.st.blind),'Crumb Spray blinds'));
  noCrit(()=>{ const F=mk6([{id:'cheekstuffer',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='snack_snatch'); e.charge=A; e.aimLock=null; F.acting=e; F.party.forEach(p=>p.pep=5);
    const b=turn(F,e,2); const t=b.find(x=>x.t==='pep'&&x.n<0);
    ok(t&&F.party.find(p=>p.key===t.tgt).pep===4,'Snack Snatch takes 1 Pep'); ok(e.st.snack_stash&&near(stat(e,'def')/(()=>{ const s=e.st.snack_stash; delete e.st.snack_stash; const v=stat(e,'def'); e.st.snack_stash=s; return v; })(),1.2,.005),'and the Cheek Stuffer gets +20% Defense'); });

  // ---------- The Acorn Cache and Stash for Winter ----------
  const chair=o=>{ const F=mk6([{id:'chairman',row:'front'}],o),e=F.foes[0]; e.hp=e.maxHp=9999; e.peeves=[]; e.resists=[]; for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,900); p.pep=3; } return {F,e}; };
  const cache=F=>F.foes.find(f=>f.id==='acorncache'&&!f.ko);
  noCrit(()=>{ const {F,e}=chair(); F.round=3; e.turns=3; e.actIx=3; ok(!pick(F,e,true)||pick(F,e,true).act.id!=='stash_for_winter','not before the 4th round (every 3 rounds)');
    F.round=4; ok(pick(F,e,true).act.id==='stash_for_winter','at the 4th round it calls a cache first');
    F.acting=e; const b=turn(F,e,4); const c=cache(F);
    ok(c&&c.row==='back'&&c.maxHp===150&&c.hp===150&&c.pips===0,'the cache arrives in Back with its own printed 150 HP (not half), and 0 pips: '+J(c&&[c.row,c.maxHp,c.pips]));
    ok(c.add&&c.addedBy===e.key&&c.addedTurn===4,'it knows who called it and when');
    ok(b.some(x=>x.t==='summon'&&x.id==='acorncache'),'the screen sees it arrive');
    F.round=7; e.actIx=0; for(const t of [5,6]) { e.turns=t; const P=pick(F,e,true); ok(!P||P.act.id!=='stash_for_winter','while a cache stands he calls no second one (turn '+t+')'); } });
  noCrit(()=>{ const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F);
    ok(c&&F.foes.every(f=>f.id!=='acorncache'||!f.ko),'the cache stands'); e.turns=5; let P=pick(F,e,true); ok(!P||P.act.id!=='stash_eat','one turn after the call he does not eat it yet');
    e.turns=6; P=pick(F,e,true); ok(P&&P.act.id==='stash_eat','on his 2nd turn after the call he eats it, ahead of his other acts');
    e.hp=Math.floor(e.maxHp*.5); const pips0=e.pips,pep0=F.party.map(p=>p.pep),hp0=e.hp; F.acting=e; const b=turn(F,e,6);
    ok(c.ko&&c.eaten&&!cache(F),'the cache is gone, eaten');
    ok(e.hp>hp0&&near(e.hp-hp0,Math.round(e.maxHp*.15),2),'he heals 15% of his Max HP: '+hp0+' to '+e.hp);
    ok(e.st.winter_hoard&&e.st.winter_hoard.n===2&&near(sum(e,'atk'),.45,1e-9)||near(stat(e,'atk')/(()=>{ const s=e.st.winter_hoard; delete e.st.winter_hoard; const v=stat(e,'atk'); e.st.winter_hoard=s; return v; })(),1.25,.01),'and gets Winter Hoard (+25% Attack and Defense, 2 turns)');
    ok(e.pips===pips0&&F.party.every((p,i)=>p.pep===pep0[i]),'an eaten cache pays no feedback: no pip lost, no Pep given'); });
  // knocked out first: +1 Pep for the family, 10% of Max HP flat, 1 pip
  SK.t12_kill={id:'t12_kill',vibe:'tom_flier',slot:'s1',name:'Test kill',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage',bonus:{add:50}}]};
  noCrit(()=>{ const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F),tom=F.party.find(p=>p.id==='tom');
    c.hp=1; const pep0=F.party.map(p=>p.pep),hp0=e.hp,pips0=e.pips; go(F,tom,'t12_clobber',c.key);
    ok(c.ko&&!c.eaten,'the family knocks the cache out');
    ok(F.party.every((p,i)=>p.pep===pep0[i]+1||(p===tom&&p.pep>=pep0[i])),'every family member gains +1 Pep: '+J(F.party.map(p=>p.pep))+' from '+J(pep0));
    ok(e.hp===hp0-Math.round(e.maxHp*.10),'Chairman Cheeks takes 10% of his Max HP as flat damage: '+hp0+' to '+e.hp);
    ok(e.pips===pips0-1,'and loses 1 Composure pip: '+pips0+' to '+e.pips); });
  noCrit(()=>{ // the pip counts inside the 3-pip cap of the action: a Pet Peeve and a Detonation already took 3
    const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F),tom=F.party.find(p=>p.id==='tom'); c.hp=1; e.peeves=[]; const c0={F,actor:tom,src:tom,beats:[],g:'a',targets:[e],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    G('b3Pips')(c0,e,3); G('b3Pips')(c0,e,1); // 4 would be paid... the cap is 3
    G('b3PayLedger')(F,c0); ok(e.pips===6-3,'the 3-pip cap holds for one action: '+e.pips); });
  noCrit(()=>{ const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F),tom=F.party.find(p=>p.id==='tom'); c.hp=1; e.hp=5; go(F,tom,'t12_clobber',c.key);
    ok(e.hp>=1&&!e.ko,'the feedback never knocks the boss out: it stops at 1 HP ('+e.hp+')'); });
  noCrit(()=>{ const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F); F.acting=c; c.turns=1; let thrown=null,b=null;
    try { b=foeTurn(F,c); } catch(err) { thrown=err; } ok(!thrown&&!b.some(x=>x.t==='act'),'a cache that gets a turn does nothing and does not break: '+(thrown&&thrown.message)); });
  noCrit(()=>{ // knocked out, then the next round he may call a fresh one
    const {F,e}=chair(); F.round=4; e.turns=4; F.acting=e; turn(F,e,4); const c=cache(F),tom=F.party.find(p=>p.id==='tom'); c.hp=1; go(F,tom,'t12_clobber',c.key);
    F.round=7; e.turns=5; e.actIx=0; ok(pick(F,e,true).act.id==='stash_for_winter','with the first cache gone, he calls another at the next 3rd round'); });
  // The Big Stash: below 50% HP, a party-wide wind-up
  noCrit(()=>{ const {F,e}=chair(); e.hp=Math.floor(e.maxHp*.6); e.actIx=e.D.acts.findIndex(a=>a.id==='the_big_stash'); ok(pick(F,e,true).act.id!=='the_big_stash','above 50% HP there is no Big Stash');
    e.hp=Math.floor(e.maxHp*.45); ok(pick(F,e,true).act.id==='the_big_stash','below 50% HP it is next in the list');
    e.charge=e.D.acts.find(a=>a.id==='the_big_stash'); const hp0=F.party.map(p=>p.hp); turn(F,e,5); ok(F.party.every((p,i)=>p.hp<hp0[i]),'The Big Stash hits all three'); });
  noCrit(()=>{ const {F,e}=chair(); const A=e.D.acts.find(a=>a.id==='acorn_volley'); e.actIx=e.D.acts.indexOf(A); F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2);
    ok(F.party.filter((p,i)=>p.hp<hp0[i]).length>=1,'Acorn Volley hits (two random allies; the same one may take both)'); });
  noCrit(()=>{ // the Monocle is a buff the party can strip
    const {F,e}=chair(); const o=G('B3_OPS'),tom=F.party[0]; const c={F,actor:tom,src:tom,beats:[],g:'a',targets:[e],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    o.strip(F,c,{kind:'buff',all:true,to:'target'}); ok(!e.st.executive_monocle,'a buff strip takes the Executive Monocle off'); });
  delete SK.t12_kill;

  // ====================== Chapter 7: the Library (stage 12c) ======================
  const P7=['tom','grace','rose','boppy'];
  const mk7=(foes,o)=>NF(Object.assign({party:P7,level:17,seed:13,foes},o||{}));
  const ROWS7=[
    ['shusher',7,'hexer','back',281,56,32,110,0,['razzle','sizzle'],[]],['dogear',7,'swarmer','front',215,50,28,110,0,['drench','sizzle'],['racket']],
    ['cliffhanger',7,'bruiser','front',379,65,37,100,0,['sizzle','racket'],['clobber']],['knowitall',7,'hexer','back',281,56,32,110,0,['racket','razzle'],['sizzle']],
    ['popup',7,'elite','front',594,68,44,95,4,['clobber','razzle'],['racket']],['unread',7,'boss','front',1230,74,40,107,7,['racket','sizzle'],['clobber']]];
  for(const [id,ch,role,row,hp,atk,def,spd,pips,peeves,resists] of ROWS7) { const D=FOES[id];
    ok(D&&D.ch===ch&&D.role===role&&D.row===row&&D.hp===hp&&D.atk===atk&&D.def===def&&D.spd===spd&&D.pips===pips&&J(D.peeves)===J(peeves)&&J(D.resists)===J(resists),id+' has the bestiary row: '+J(D&&[D.ch,D.role,D.row,D.hp,D.atk,D.def,D.spd,D.pips,D.peeves,D.resists])); }
  ok(FOES.unread.hp3===920&&FOES.unread.noRun,'The Unread prints 920 for a party of 3 and cannot be run from');
  { const hp7=(party)=>NF({party,level:17,seed:3,foes:[{id:'unread',row:'front'}]}).foes[0].maxHp; ok(hp7(P7)===1230&&hp7(['tom','grace','rose'])===920,'The Unread: 1230 for 4, 920 for 3'); }
  const FM7={shusher:9,dogear:9,cliffhanger:9,knowitall:9,popup:9,unread:27};
  for(const k of Object.keys(FM7)) ok(FORM[k]&&FORM[k].ch===7&&FORM[k].vp===FM7[k],'formation '+k+' is chapter 7 and pays '+FM7[k]+' VP');
  ok(J(FORM.shusher.foes)===J([{id:'dogear',row:'front'},{id:'shusher',row:'back'}])&&J(FORM.knowitall.foes)===J([{id:'dogear',row:'front'},{id:'knowitall',row:'back'}]),'two of the formations match section 4');
  { const labs=LAB.filter(l=>/^new(39|4[0-4])$/.test(l.id));
    ok(labs.length===6&&labs.every(l=>FORM[l.formation]&&FORM[l.formation].ch===7),'Lab fights new39 to new44 each run a real chapter 7 formation');
    ok(labs.every(l=>l.level===17&&J(l.party)===J(P7)&&(l.id==='new44'?l.bg==='readroom':l.bg==='stacks')),'each uses level 17, Tom, Grace, Rose and Boppy, the stacks (the boss: the reading room)'); }
  for(const id of ['coiled_spring','corner_fold','actually','well_technically','hush_hour','jump_scare','bookmark_guard','bookmark_mend'])
    ok(ST[id]&&ST[id].desc&&ST[id].short&&ST[id].color&&!/—/.test(ST[id].desc),id+' is a complete status row');
  ok(ST.bookmark_guard.kind==='stance'&&near(ST.bookmark_guard.mods[0].v,.25,1e-9)&&near(ST.bookmark_mend.regen,.05,1e-9),'Bookmark Guard is a 25% stance and Bookmark Mend heals 5%');
  { const F=mk7([{id:'popup',row:'front'}]),e=F.foes[0]; ok(e.st.coiled_spring&&near(sum(e,'eva'),.20,1e-9),'Pop-Up Panic starts wound tight (+20% Evasion)'); }

  // ---------- The plain acts ----------
  const rider7=(foe,actId,fn,row)=>noCrit(()=>{ const F=mk7([{id:foe,row:row||'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id===actId);
    e.charge=A.tags.includes('charge_up')?A:null; e.actIx=e.D.acts.indexOf(A); e.aimLock=null; F.acting=e; const b=turn(F,e,2); fn(F,e,b); });
  rider7('shusher','shhh',(F,e,b)=>{ const t=F.party.find(p=>p.st.skill_lock); ok(t&&t.st.skill_lock.n===1,'SHHH! puts Skill Lock on its target for 1 turn'); },'back');
  noCrit(()=>{ const F=mk7([{id:'shusher',row:'back'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='hush_hour'); e.actIx=e.D.acts.indexOf(A); F.acting=e; turn(F,e,2);
    ok(e.charge&&e.charge.id==='hush_hour'&&!F.party.some(p=>p.st.hush_hour),'Hush Hour is announced first'); F.acting=e; turn(F,e,3);
    ok(F.party.every(p=>p.st.hush_hour&&near(ratio(p,'hush_hour'),.85,.005)),'then every family member is 15% weaker for 2 turns'); });
  rider7('dogear','page_nip',(F,e,b)=>ok(F.party.some(p=>p.st.bleed),'Page Nip makes its target Bleed'));
  rider7('dogear','corner_fold',(F,e,b)=>{ const t=F.party.find(p=>p.st.corner_fold); ok(t&&near(ratio(t,'corner_fold',true),.85,.005),'Corner Fold: -15% Defense for 2 turns'); });
  noCrit(()=>{ const F=mk7([{id:'dogear',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='hard_crease'); e.actIx=e.D.acts.indexOf(A); F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2); ok(F.party.every((p,i)=>p.hp<hp0[i]),'Hard Crease hits the whole family'); });
  rider7('cliffhanger','plot_twist',(F,e,b)=>ok(b.some(x=>x.t==='push'||x.t==='pull'||x.t==='bar'),'Plot Twist! moves its target on the turn bar: '+J(b.map(x=>x.t))));
  noCrit(()=>{ const F=mk7([{id:'cliffhanger',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='to_be_continued'); e.charge=A; F.acting=e; turn(F,e,2); ok(F.party.every(p=>p.st.slow&&p.st.slow.n===2),'To Be Continued... slows all four for 2 turns'); });
  rider7('knowitall','actually',(F,e,b)=>{ const t=F.party.find(p=>p.st.actually); ok(t&&near(ratio(t,'actually',true),.80,.005),'"Actually..." takes 20% off the target’s Defense'); },'back');
  noCrit(()=>{ const F=mk7([{id:'knowitall',row:'back'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='well_technically'); e.charge=A; F.acting=e; turn(F,e,2);
    ok(F.party.every(p=>p.st.fatigue)&&e.st.well_technically&&near(stat(e,'def')/(()=>{ const s=e.st.well_technically; delete e.st.well_technically; const v=stat(e,'def'); e.st.well_technically=s; return v; })(),1.2,.005),'"Well, Technically": Fatigue on all four and +20% Defense on itself'); });
  rider7('popup','jump_out_scare',(F,e,b)=>{ const t=F.party.find(p=>p.st.jump_scare); ok(t&&near(ratio(t,'jump_scare'),.80,.005),'Jump-Out Scare: -20% Attack for 2 turns'); });
  noCrit(()=>{ const F=mk7([{id:'popup',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='big_reveal'); e.charge=A; F.acting=e; const hp0=F.party.map(p=>p.hp); turn(F,e,2); ok(F.party.every((p,i)=>p.hp<hp0[i]),'Big Reveal hits all four'); });
  rider7('unread','dust_cloud',(F,e,b)=>ok(F.party.some(p=>p.st.blind),'Dust Cloud blinds'));
  noCrit(()=>{ const F=mk7([{id:'unread',row:'front'}]),e=F.foes[0],A=e.D.acts.find(a=>a.id==='dead_quiet_reading_room'); e.actIx=e.D.acts.indexOf(A); e.hp=e.maxHp; F.acting=e; turn(F,e,2);
    ok(F.party.every(p=>p.st.fatigue&&p.st.fatigue.n===2)&&true,'Dead-Quiet Reading Room: Fatigue for 2 turns on all four'); });

  // ---------- The Unread ----------
  const unread=hpFrac=>{ const F=mk7([{id:'unread',row:'front'}]),e=F.foes[0]; e.peeves=[]; e.resists=[]; e.hp=Math.floor(e.maxHp*hpFrac); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,2000); } return {F,e}; };
  noCrit(()=>{ const {F,e}=unread(.9); e.actIx=3; F.acting=e; const P=pick(F,e,true); ok(P&&!['bookmark_ribbon','the_end'].includes(P.act.id),'above half HP the boss uses neither the Bookmark Ribbon nor THE END: '+(P&&P.act.id)); });
  noCrit(()=>{ const {F,e}=unread(.45); e.actIx=3; let P=pick(F,e,true); ok(P&&P.act.id==='bookmark_ribbon','below half HP it marks its place first (Bookmark Ribbon)');
    F.acting=e; turn(F,e,2); ok(e.st.bookmark_guard&&e.st.bookmark_guard.n===2&&e.st.bookmark_mend,'it puts up Bookmark Guard and Bookmark Mend on itself');
    e.actIx=3; P=pick(F,e,true); ok(P&&P.act.id!=='bookmark_ribbon','with the guard up it does not use the Ribbon again'); });
  noCrit(()=>{ const {F,e}=unread(.45); const ids=[]; for(const ix of [3,5]) { e.actIx=ix; ids.push(pick(F,e,true).act.id); } ok(J(ids)===J(['bookmark_ribbon','the_end']),'below half HP the Ribbon comes before THE END in the rotation: '+J(ids)); });
  const immune=p=>G('b3HasFlag')(p,'pushImmune')||G('b3SpeedHold')(p);   // Boppy at high HP cannot be pushed (Speed Hold)
  noCrit(()=>{ const {F,e}=unread(.45); const A=e.D.acts.find(a=>a.id==='the_end'); e.charge=A; F.acting=e;
    const grace=F.party.find(p=>p.id==='grace'); G('b3AddShield')(F,grace,5000,{n:3});
    ok(G('b3ShieldTotal')(grace)>0,'test setup: Grace holds a shield');
    const b=turn(F,e,2); const hurt=b.filter(x=>x.t==='hit').map(x=>x.tgt);
    ok(F.party.every(p=>hurt.includes(p.key)),'THE END hits the whole family');
    ok(F.party.filter(p=>p!==grace).every(p=>p.st.slow&&p.st.slow.n===2)&&!grace.st.slow,'and slows everyone whose shield did not hold for 2 turns (a shield blocks the rider)');
    const pushed=b.filter(x=>x.t==='push').map(x=>x.tgt);
    const want=F.party.filter(p=>!immune(p)&&G('b3ShieldTotal')(p)===0&&p!==grace).map(p=>p.key);
    ok(pushed.length>=1&&!pushed.includes(grace.key)&&want.length===pushed.length&&want.every(k=>pushed.includes(k)),'a family member whose shield held is not pushed, the rest are: pushed '+J(pushed)+', shielded '+grace.key); });
  noCrit(()=>{ const {F,e}=unread(.45); const A=e.D.acts.find(a=>a.id==='the_end'); e.charge=A; F.acting=e; const want0=F.party.filter(p=>!immune(p)).length; const b=turn(F,e,2);
    const want=want0,n=b.filter(x=>x.t==='push').length; ok(n===want&&want>=3,'with no shields up, every family member that can be pushed is ('+n+' of '+want+')'); });
  noCrit(()=>{ const {F,e}=unread(.9); const A=e.D.acts.find(a=>a.id==='turn_back_the_page'); e.charge=A; F.acting=e; const b=turn(F,e,2);
    ok(b.some(x=>x.t==='push'||x.t==='bar'||x.t==='pull'),'Turn Back the Page pushes its target back'); });
  noCrit(()=>{ const {F,e}=unread(.9); const o=G('B3_OPS'),tom=F.party[0]; const c={F,actor:tom,src:tom,beats:[],g:'a',targets:[e],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    e.hp=Math.floor(e.maxHp*.45); e.st.bookmark_guard={id:'bookmark_guard',n:2,src:e.key}; o.strip(F,c,{kind:'stance',all:true,to:'target'}); ok(!e.st.bookmark_guard,'a Break or a stance strip ends Bookmark Guard'); });
  for(const k of ['t12_clobber','t12_racket','t12_sizzle','t12_multi']) delete SK[k];
};
