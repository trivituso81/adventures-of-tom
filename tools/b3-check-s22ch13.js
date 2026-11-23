// tools/b3-check-s22ch13.js — Battle 3 checks for stage 22, chapter 13 (the tunnel under the dome, the Dual-Coast Drill Worm and The Gold Knight).
// Data: data/b3-foes-ch13.js, the chapter 13 statuses at the end of data/b3-status.js, data/b3-story.js (switch, level floor, tips), data/b3-lab.js (new71 to new73).
// New engine pieces it covers: the helper link (`helperLink` on a foe row, the mod condition `allyStands`: engine/b3-core.js), helper feedback aimed at the Boss
// on the helper's side (the target `allyBoss`: engine/b3-ops.js), and a foe row's `custom` (the Gold Knight's `boppySpeed`).
// The page side (the real scenes on screen, tips shown, victory card, Vibe Points) is tools/ch13_b3_test.py.
// `node tools/b3-sim.js check` runs it after the file for stage 22 (chapter 11).
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play,noCrit}=T;
  const S=G('B3_STORY'),FOES=G('B3_FOES'),FORMS=G('B3_FORMATIONS'),ST=G('B3_STATUS'),LAB=G('B3_LAB'),SK=G('B3_SKILLS'),J=x=>JSON.stringify(x);
  const NF=G('b3NewFight'),foeTurn=G('b3FoeTurn'),act=G('b3Act'),live=G('b3Live'),pick=G('b3FoePick'),stat=G('b3Stat'),taken=G('b3TakenMult');
  const ROOT=path.dirname(__dirname),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const P=['tom','amy','tnb','nara'];

  // 1. The switch, the floor, the numbers
  ok(S.chapters.includes(13)&&S.chapters.indexOf(13)<S.chapters.indexOf(21),'chapter 13 is on Battle 3 (found '+J(S.chapters)+')');
  ok(S.levelFloor[13]===32,'chapter 13 floors the Character Level at the bestiary baseline, 32 (found '+S.levelFloor[13]+')');
  const NUM={hushling:[587,104,50,119,'hexer','back'],signalfault:[1242,125,69,102,'elite','front'],turnstile:[1242,125,69,102,'elite','front'],relayhushling:[400,104,60,115,'helper','back'],
    drillworm:[2070,136,63,115,'boss','front'],goldknight:[2480,136,63,102,'boss','front']};
  for(const id in NUM) { const D=FOES[id],n=NUM[id];
    ok(D&&D.ch===13&&D.hp===n[0]&&D.atk===n[1]&&D.def===n[2]&&D.spd===n[3]&&D.role===n[4]&&D.row===n[5],id+' has the bestiary stat line (HP, Atk, Def, Spd, role, row)'); }
  ok(FOES.drillworm.hp3===1550&&FOES.drillworm.pips===7&&FOES.drillworm.noRun&&J(FOES.drillworm.peeves)==='["racket","clobber"]'&&J(FOES.drillworm.resists)==='["drench"]','the Drill Worm: HP 2070 (1550 for three), 7 pips, hates Racket and Clobber, shrugs off Drench');
  ok(FOES.goldknight.hp3===1860&&FOES.goldknight.pips===7&&FOES.goldknight.noRun&&J(FOES.goldknight.peeves)==='["sizzle","racket"]'&&J(FOES.goldknight.resists)==='["clobber"]','the Gold Knight: HP 2480 (1860 for three), 7 pips, hates Sizzle and Racket, shrugs off Clobber');
  ok(FOES.signalfault.pips===4&&FOES.turnstile.pips===4&&J(FOES.signalfault.start)==='["track_block_arm"]'&&J(FOES.turnstile.start)==='["locked_tripod"]','both Elites have 4 pips and start braced');
  ok(J(FOES.signalfault.peeves)==='["drench","clobber"]'&&J(FOES.turnstile.peeves)==='["clobber","racket"]'&&J(FOES.hushling.peeves)==='["racket","clobber"]','Pet Peeves of the three regulars');
  ok(FORMS.drillworm.vp===18&&FORMS.goldknight.vp===30&&FORMS.hushling.vp===7&&FORMS.turnstile.vp===7&&FORMS.signalfault.vp===7,'Vibe Points: 7 for each normal fight, 18 for the Drill Worm, 30 for the Gold Knight');
  ok(J(FORMS.hushling.foes)===J([{id:'turnstile',row:'front'},{id:'hushling',row:'back'}])&&J(FORMS.hushling.foes)===J(FORMS.turnstile.foes),'`hushling` and `turnstile` are one fight: Turnstile Grump in Front, Hushling in Back');
  ok(J(FORMS.signalfault.foes)===J([{id:'signalfault',row:'front'},{id:'hushling',row:'back'}]),'the Signal Fault fights with a Hushling in Back');
  ok(J(FORMS.drillworm.foes)===J([{id:'drillworm',row:'front'},{id:'relayhushling',row:'back'}])&&J(FORMS.goldknight.foes)===J([{id:'goldknight',row:'front'}]),'the Drill Worm starts with one Wired Relay Hushling; the Gold Knight stands alone');
  for(const id of ['track_block_arm','locked_tripod','tap_out','deep_bore','raised_palm','gold_guard']) ok(ST[id]&&ST[id].desc&&ST[id].short&&!/—/.test(ST[id].desc),id+' is a status row with words');
  ok(['track_block_arm','locked_tripod','gold_guard'].every(i=>ST[i].kind==='stance'&&ST[i].mods[0].stat==='reduce'&&ST[i].mods[0].v===.25)&&ST.tap_out.mods[0].v===-.2&&ST.deep_bore.mods[0].v===-.2&&ST.raised_palm.mods[0].v===-.15&&ST.raised_palm.dur.n===1,'the stances are 25% Guard Stances; Tap Out! and Deep Bore are -20% Defense; Raised Palm is -15% Attack for one turn');
  ok([['new71','signalfault'],['new72','drillworm'],['new73','goldknight']].every(([id,f])=>LAB.some(l=>l.id===id&&l.level===32&&l.formation===f&&J(l.party)===J(P)&&l.bg==='subtunnel')),'the Lab has the three chapter 13 fights at level 32 with Tom, Amy, TNB and Nara');

  // 2. The scenes: the Drill Worm fight has tips, every tunnel monster has a formation, and the chapter pays 90
  const sc=read('data/scenes-ch13.js'),steps=[...sc.matchAll(/\{battle:'([a-z0-9]+)',tut:'([a-z0-9]+)'/g)].map(m=>({id:m[1],tut:m[2]}));
  ok(J(steps.map(s=>s.id))===J(['drillworm']),'chapter 13 scenes start the Drill Worm fight (found '+J(steps.map(s=>s.id))+'); the Gold Knight has no scene yet');
  for(const k of ['ch13','goldknight']) { ok(Array.isArray(S.tips[k])&&S.tips[k].length>=3,'tips under the key '+k+' (at least three)');
    for(const t of S.tips[k]) ok(t.text.length<=240&&!/—/.test(t.text)&&!/WARMTH|HEART|Warmth|Kindness|TOMBO|Tombo|TAKE FIVE|▼ Bag|Chatter|Kinetic/.test(t.text),k+' tip '+t.id+' is short, has no dash and no Battle 2 word'); }
  const spots=(read('data/ch13-monsters.js').match(/const CH13_TUNNEL_SPOTS=\[(.*)\];/)||[])[1]||'',ids=[...spots.matchAll(/\['([a-z0-9]+)'/g)].map(m=>m[1]);
  ok(ids.length===6&&ids.every(i=>FOES[i]&&FORMS[i]),'every monster standing in the tunnel has a formation ('+J(ids)+')');
  ok(ids.reduce((a,i)=>a+FORMS[i].vp,0)+FORMS.drillworm.vp+FORMS.goldknight.vp===90,'six normal fights at 7, the Drill Worm at 18 and the Gold Knight at 30 pay the chapter\'s 90');
  ok(/B3_CH_ON\(13\)/.test(sc)&&!/—/.test(sc.match(/B3_CH_ON\(13\)[^\n]*/g).join('')),'chapter 13 has Battle 3 wording variants in its scenes');

  // 3. The helper link: the Drill Worm takes 25% less damage while a Wired Relay Hushling stands
  SK.t13_hit={id:'t13_hit',vibe:'tom_flier',slot:'s1',name:'Test hit',pep:0,flavor:['clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t13_racket={id:'t13_racket',vibe:'tom_flier',slot:'s1',name:'Test racket',pep:0,flavor:['racket'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  const go=(F,u,skill,key)=>{ F.acting=u; const r=act(F,u,skill,key); if(!r.ok) throw new Error('test move refused: '+skill+': '+r.why); return r.beats; };
  const mk=(formation,o)=>{ const F=NF(Object.assign({party:P,level:32,formation,seed:11},o||{})); for(const p of F.party) { p.hp=p.maxHp=Math.max(p.maxHp,9000); p.pep=4; }
    for(const f of F.foes) { f.hp=f.maxHp=99999; f.peeves=[]; f.resists=[]; } return F; };
  const boss=F=>F.foes.find(f=>f.D.role==='boss'),relays=F=>F.foes.filter(f=>f.id==='relayhushling'&&!f.ko),tomOf=F=>F.party.find(p=>p.id==='tom');
  { const F=mk('drillworm'),w=boss(F),r=relays(F)[0];
    ok(w.id==='drillworm'&&r&&r.row==='back','the fight starts with the Worm in Front and a Wired Relay Hushling in Back');
    ok(near(taken(w,0,{F}),.75,1e-9),'with the relay standing the Worm takes 25% less damage (x0.75)');
    ok(near(taken(w,0,{}),1,1e-9),'a number worked out with no fight in hand (no ctx.F) shows no helper reduction: the rule only counts inside a fight');
    w.st.guard_stance={n:2,src:w.key}; ok(near(taken(w,0,{F}),.5,1e-9),'the helper link adds to a Guard Stance: 25% and 25% make 50% less'); delete w.st.guard_stance;
    w.mods.push({stat:'reduce',kind:'test',v:.5}); ok(near(taken(w,0,{F}),.4,1e-9),'and it stays inside the 60% cap (x0.4)'); w.mods.pop();
    r.ko=true; r.hp=0; ok(near(taken(w,0,{F}),1,1e-9),'with the relay knocked out the reduction is gone'); }
  noCrit(()=>{ const hurt=withRelay=>{ const F=mk('drillworm'),w=boss(F),t=tomOf(F); if(!withRelay) { const r=relays(F)[0]; r.ko=true; r.hp=0; } const h0=w.hp; go(F,t,'t13_hit',w.key); return h0-w.hp; };
    const a=hurt(true),b=hurt(false); ok(a>0&&near(a/b,.75,.01),'the same hit does 75% as much with the relay standing ('+a+' against '+b+')'); });
  // helper feedback: knocked out, the relay takes 2 Composure pips off the Worm and leaves it Dazzled (2 turns); it does not touch the Worm's HP
  noCrit(()=>{ const F=mk('drillworm'),w=boss(F),r=relays(F)[0],t=tomOf(F); r.hp=1; const hp0=w.hp,pips0=w.pips; go(F,t,'t13_hit',r.key);
    ok(r.ko,'the family knocks the relay out');
    ok(w.pips===pips0-2,'the Drill Worm loses 2 Composure pips: '+pips0+' to '+w.pips);
    ok(w.st.dazzled&&w.st.dazzled.n===2,'and is left Dazzled for 2 turns');
    ok(w.hp===hp0,'no HP is lost to the feedback'); });
  noCrit(()=>{ const F=mk('drillworm'),w=boss(F),r=relays(F)[0],t=tomOf(F),c0={F,actor:t,src:t,beats:[],g:'a',targets:[w],hit:[],detonated:{},reacted:{},tags:[],outExtra:{},ledger:{}};
    G('b3Pips')(c0,w,2); r.hp=1; G('b3Pips')(c0,w,2); G('b3PayLedger')(F,c0); ok(w.pips===7-3,'the 3-pip cap holds when helper pips and hit pips land in one action ('+w.pips+')'); });
  // Relay Call: once, at 50% HP, a second relay with its own printed HP (400, not 200) in Back; the helper link is one reduction however many stand
  { const F=mk('drillworm'),w=boss(F); w.hp=Math.round(w.maxHp*.6); const q=pick(F,w,true); ok(q&&q.act.id!=='relay_call'&&q.act.id!=='full_bore_cave_in','above 50% HP it neither calls a relay nor winds up Full Bore Cave-In');
    w.hp=Math.round(w.maxHp*.45); const q2=pick(F,w,true); ok(q2.act.id==='relay_call','at 50% HP or below the call comes first');
    F.acting=w; const beats=foeTurn(F,w),called=beats.filter(b=>b.t==='summon');
    ok(called.length===1&&called[0].id==='relayhushling'&&called[0].row==='back'&&called[0].hp===400,'Relay Call calls one Wired Relay Hushling to the Back row with 400 HP');
    ok(relays(F).length===2&&near(taken(w,0,{F}),.75,1e-9),'two relays stand and the Worm still takes 25% less, not 50%');
    w.uses.relay_call=1; const q3=pick(F,w,true); ok(q3&&q3.act.id!=='relay_call','Relay Call is used once');
    { const r0=relays(F)[0]; r0.ko=true; r0.hp=0; } ok(near(taken(w,0,{F}),.75,1e-9),'with one relay down and one standing the reduction stays'); }
  // Tunnel Friction Spark: allies Toasty (2 turns), the Worm Toasty (1 turn), and a Racket hit on the Toasty Worm sets off Panic Boil!
  noCrit(()=>{ const F=mk('drillworm'),w=boss(F); w.force='tunnel_friction_spark'; F.acting=w; const beats=foeTurn(F,w),hit=[...new Set(beats.filter(b=>b.t==='hit').map(b=>b.tgt))].filter(k=>k[0]==='p');
    ok(hit.length===2&&hit.every(k=>F.party.find(p=>p.key===k).st.toasty&&F.party.find(p=>p.key===k).st.toasty.n===2),'Tunnel Friction Spark hits 2 allies and leaves each Toasty for 2 turns');
    ok(w.st.toasty&&w.st.toasty.n===1,'and leaves the Drill Worm itself Toasty for 1 turn');
    const b=go(F,tomOf(F),'t13_racket',w.key); ok(b.some(x=>x.t==='detonate'&&x.id==='panic_boil'),'a Racket hit on the Toasty Worm sets off Panic Boil!'); });
  { const F=mk('drillworm'),w=boss(F); w.hp=Math.round(w.maxHp*.45); w.actIx=w.D.acts.findIndex(a=>a.id==='full_bore_cave_in'); w.uses.relay_call=1;
    const q=pick(F,w,true); ok(q&&q.act.id==='full_bore_cave_in','below half HP Full Bore Cave-In is on the list'); F.acting=w; const b=foeTurn(F,w); ok(b.some(x=>x.t==='telegraph'),'and it is announced a turn ahead (a wind-up)'); }

  // 4. The Gold Knight
  { const F=mk('goldknight'),k=boss(F),push=G('b3Push');
    ok(k.custom.boppySpeed&&k.custom.boppySpeed.above===.5,'the Gold Knight carries Boppy Speed (above half HP)');
    ok(push(F,k,20)===0,'above half HP a push does nothing to him');
    k.hp=Math.round(k.maxHp*.45); ok(push(F,k,20)>0,'at half HP or below he can be pushed'); }
  { const F=mk('goldknight'),k=boss(F),spd=u=>stat(u,'spd'),fastest=F.party.slice().sort((a,b)=>spd(b)-spd(a)||a.slot-b.slot)[0];
    k.force='slow_walk'; F.acting=k; const w0=fastest.wait,beats=foeTurn(F,k),hit=beats.filter(b=>b.t==='hit').map(b=>b.tgt);
    ok(hit.length===1&&hit[0]===fastest.key,'Slow Walk blocks the fastest ally ('+fastest.name+')');
    ok(fastest.st.slow&&fastest.st.slow.n===2&&beats.some(b=>b.t==='push'&&b.tgt===fastest.key),'and leaves them Slow for 2 turns with a 20-tick push'); }
  { const F=mk('goldknight'),k=boss(F),n=[]; for(let i=0;i<4;i++) { k.force='wide_arms'; F.acting=k; const beats=foeTurn(F,k); n.push(new Set(beats.filter(b=>b.t==='hit').map(b=>b.tgt)).size); k.uses.wide_arms=(k.uses.wide_arms||0); }
    ok(n[0]===2&&n[1]===3&&n[2]===4&&n[3]===4,'Wide Arms hits 2 allies, then 3, then everyone ('+J(n)+')'); }
  { const F=mk('goldknight'),k=boss(F); k.force='visor_heat'; F.acting=k; const b0=foeTurn(F,k);
    ok(b0.some(x=>x.t==='telegraph')&&k.charge&&k.charge.id==='visor_heat'&&!F.party.some(p=>p.st.toasty),'Visor Heat is a wind-up: announced first, nobody Toasty yet');
    F.acting=k; foeTurn(F,k);
    ok(F.party.every(p=>p.st.toasty&&p.st.toasty.n===2)&&k.st.toasty&&k.st.toasty.n===2,'then it leaves every ally and the Knight himself Toasty for 2 turns');
    k.st.gold_guard={n:2,src:k.key}; const g=go(F,tomOf(F),'t13_racket',k.key);
    ok(g.some(x=>x.t==='detonate'&&x.id==='panic_boil')&&!k.st.gold_guard,'a Racket hit on the Toasty Knight sets off Panic Boil! and drops Gold Guard'); }
  noCrit(()=>{ const F=mk('goldknight'),k=boss(F); k.force='stand_still'; F.acting=k; foeTurn(F,k);
    ok(k.st.gold_guard&&k.st.mend&&near(taken(k,0,{F}),.75,1e-9),'Stand Still gives Gold Guard (25% less damage) and Mend');
    k.force='raised_palm'; F.acting=k; foeTurn(F,k); const hit=F.party.find(p=>p.st.raised_palm); ok(hit&&hit.st.raised_palm.n===1,'Raised Palm leaves its target with -15% Attack for 1 turn'); });
  { const F=mk('goldknight'),k=boss(F); k.hp=Math.round(k.maxHp*.6); k.actIx=k.D.acts.findIndex(a=>a.id==='helmet_hum'); const q=pick(F,k,true); ok(q&&q.act.id!=='helmet_hum','above 50% HP there is no Helmet Hum');
    k.hp=Math.round(k.maxHp*.45); const q2=pick(F,k,true); ok(q2&&q2.act.id==='helmet_hum'&&q2.act.tags.includes('charge_up'),'below 50% HP Helmet Hum is next, and it is a wind-up'); }

  delete SK.t13_hit; delete SK.t13_racket;   // the sandbox rows come out again, so the simple player never picks them

  // 5. Whole fights, the simple player with the bestiary's one action in four as support, Rank 2. The targets are bestiary 1.6: 5 to 7 rounds for a boss (the Worm brings
  // helpers: 5 aimed for, 6 to 7 for the whole fight; the Knight 6), and about 3 rounds for an Elite with a Hexer (chapter 11 sits at 2.7 and was left as printed).
  // The same loadouts the simulator command builds (every Vibe at the Lab's Rank, the first two Quirks), so the numbers match `node tools/b3-sim.js new73 20 --support=4`.
  const lab=id=>{ const L=LAB.find(x=>x.id===id),cfg={party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows,loadouts:{}};
    const newL=G('b3NewLoadout'),pool=G('b3QuirkPool'),V=G('B3_VIBES'),Q=G('B3_QUIRKS'),setQ=G('b3SetQuirk');
    for(const m of cfg.party) { const Ld=newL(m,G('B3_RULES').labRank),pl=pool(m,Ld);
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pl.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>setQ(m,Ld,i,q)); cfg.loadouts[m]=Ld; }
    return cfg; };
  const run=(id,n)=>{ const out=[]; for(let s=1;s<=n;s++) out.push(play(Object.assign(lab(id),{seed:s}),false,{support:4})); return out; };
  for(const [id,lo,hi,what] of [['new71',2,4.5,'the Elite with a Hexer'],['new72',5,7,'the Drill Worm'],['new73',5,7,'the Gold Knight']]) { const r=run(id,8),avg=r.reduce((a,x)=>a+x.rounds,0)/r.length;
    ok(r.every(x=>x.result==='win')&&avg>=lo&&avg<=hi,what+': won every time in '+avg.toFixed(2)+' rounds on average (target '+lo+' to '+hi+')'); }
};
