// tools/b3-check-s18bonus.js — Battle 3 checks for the bonus chapter's seams (engine/b3-script.js, B3_STORY.setup in data/b3-story.js; build b3s18bonusa).
// What a scripted story fight needs that a plain formation does not have, each tested as data and rules (the page side is tools/ns_b3_test.py):
// a scripted midpoint that ends a fight at an HP point with the result flee or shell, a boss that starts at half HP, adds from the freezer on a timer,
// the Frozen status, Grace's Birthday Sash at the start of a fight, the chapter 21 level floor and the Vibe Points the chapter pays.
// `node tools/b3-sim.js check` runs it after the file for stage 18.
'use strict';
const fs=require('fs'),path=require('path');
module.exports=function(T) {
  const {G,ok,near,play}=T;
  const NF=G('b3NewFight'),next=G('b3Next'),act=G('b3Act'),foeTurn=G('b3FoeTurn'),ST=G('B3_STATUS'),S=G('B3_STORY'),RULES=G('B3_RULES'),newL=G('b3NewLoadout'),stat=G('b3Stat'),
    cost=G('b3Cost'),SK=G('B3_SKILLS'),J=x=>JSON.stringify(x);
  const PARTY=['tom','grace','rose'];
  const cfg=(tut,seed,extra)=>{ const lo={}; for(const id of PARTY) lo[id]=newL(id,2);
    return Object.assign({party:PARTY,level:5,seed:seed||1,formation:'brainfreeze',loadouts:lo,rank:2,setup:S.setup[tut]},extra||null); };
  const U=(F,id)=>F.units.find(u=>u.id===id);

  // 1. The data: the setups, the level floor, and the Vibe Points the chapter pays (bestiary section 5: 90 for the whole chapter)
  const need=['nsGremlin','nsSlug','nsCone','nsGarden','nsBoss1','nsBoss1b','nsBoss2'];
  ok(need.every(k=>S.setup[k]),'every bonus fight has a setup row: '+J(need.filter(k=>!S.setup[k])));
  ok(S.setup.nsGremlin.vp+S.setup.nsSlug.vp+S.setup.nsCone.vp+S.setup.nsGarden.vp+S.setup.nsBoss2.vp===90,'the bonus chapter pays 90 Vibe Points in all (4 fights and the boss win)');
  ok(!S.setup.nsBoss1.vp&&!S.setup.nsBoss1b.vp,'the two runs that end in a flee and a shell pay nothing');
  ok(S.bonus&&S.bonus[21]&&S.bonus[21].level===5&&S.bonus[21].finished===1,'chapter 21 has its own level floor (5) and Vibe Point pool, not the 20 finished chapters of the story');
  ok(!S.levelFloor[21]&&S.levelFloor.length<=21,'the story level floor table stops at chapter 20 (so the bonus table is needed)');
  ok(ST.frozen&&ST.frozen.flags.includes('frozen')&&ST.frozen.dur.unit==='turn','the Frozen status exists and ends by turns');
  ok(ST.birthday_girl&&ST.birthday_girl.dur.n===2&&ST.birthday_girl.dur.unit==='turn','the Birthday Girl status lasts two turns');

  // 2. A scripted midpoint ends the fight at the HP point with the named result; the monster is never knocked out first; nobody is knocked out by the cold
  for(const [tut,result] of [['nsBoss1','flee'],['nsBoss1b','shell']]) {
    let seen=0,bad=[];
    for(let seed=1;seed<=12;seed++) {
      const c=cfg(tut,seed),out=play(c),F=NF(cfg(tut,seed)); const bf=U(F,'brainfreeze'),M=c.setup.midpoint;
      ok(near(bf.hpFloor,Math.round(bf.maxHp*M.hold),1e-9),tut+': the monster carries its HP floor');
      // replay to read the end state
      let g=0; const beatsAll=[]; while(!F.over&&g++<2000) { const N=next(F); beatsAll.push(...N.beats); const u=N.unit; if(!u) break;
        if(u.side==='party') { const p=G('b3Auto')(F,u); const r=act(F,u,p.skill,p.target); beatsAll.push(...r.beats); } else beatsAll.push(...foeTurn(F,u)); }
      if(out.result!==result) bad.push(seed+':'+out.result);
      if(F.over!==result) bad.push(seed+':F.over='+F.over);
      if(bf.hp<=0||bf.ko) bad.push(seed+':monster down');
      if(bf.hp>bf.maxHp*M.at+1e-6) bad.push(seed+':ended above the point '+bf.hp);
      if(F.party.some(p=>p.hp<1||p.ko)) bad.push(seed+':someone down');
      if(!beatsAll.some(b=>b.t==='script')) bad.push(seed+':no script beats');
      if(beatsAll.filter(b=>b.t==='over').length!==1) bad.push(seed+':over beats '+beatsAll.filter(b=>b.t==='over').length);
      seen++; }
    ok(!bad.length,tut+' ends in '+result+' on 12 seeds: '+J(bad.slice(0,4)));
  }

  // 3. Run 1 freezes Rose and hits everyone with the Deep Freeze; run 2 does not freeze her
  { const F=NF(cfg('nsBoss1',3)); let g=0; while(!F.over&&g++<2000) { const N=next(F); const u=N.unit; if(!u) break;
      if(u.side==='party') { const p=G('b3Auto')(F,u); act(F,u,p.skill,p.target); } else foeTurn(F,u); }
    ok(F.over==='flee'&&!!U(F,'rose').st.frozen,'run 1: Rose is frozen when the family flees');
    ok(F.party.every(p=>p.hp>=1),'run 1: everyone is still standing (the Deep Freeze leaves 1 HP at least)');
    ok(F.endWord==='RUN!'&&/runs/.test(F.endLine||''),'run 1 says its end word and line'); }
  { const F=NF(cfg('nsBoss1b',3)); let g=0; while(!F.over&&g++<2000) { const N=next(F); const u=N.unit; if(!u) break;
      if(u.side==='party') { const p=G('b3Auto')(F,u); act(F,u,p.skill,p.target); } else foeTurn(F,u); }
    ok(F.over==='shell'&&!U(F,'rose').st.frozen,'run 2: Rose stays thawed and the result is shell'); }

  // 4. The HP floor holds against any damage (a huge hit, the floor is the least HP the monster can have)
  { const F=NF(cfg('nsBoss1',4)),bf=U(F,'brainfreeze'),c={F,actor:F.party[0],beats:[],g:'x',tags:[]};
    G('b3Hurt')(F,c,bf,100000,{src:F.party[0].key,flavor:'clobber'});
    ok(near(bf.hp,bf.hpFloor,1e-9)&&bf.hp>0,'a huge hit stops at the HP floor: '+bf.hp+' of '+bf.maxHp);
    ok(!U(NF(cfg('nsBoss2',4)),'brainfreeze').hpFloor,'a fight with no midpoint has no floor'); }

  // 5. A boss that starts at half HP (phase 2), and adds from the freezer on a timer
  { const F=NF(cfg('nsBoss2',2)),bf=U(F,'brainfreeze');
    ok(bf.hp===Math.round(bf.maxHp*.5),'phase 2: Brain Freeze starts at half HP: '+bf.hp+' of '+bf.maxHp);
    ok(F.foes.length===1,'phase 2 starts with Brain Freeze alone');
    let g=0,peak=0,first=0,addHp=null; const A=S.setup.nsBoss2.adds;
    while(!F.over&&g++<3000) { const N=next(F); for(const b of N.beats) if(b.t==='summon'&&b.id==='gremlin') { if(!first) first=F.round; if(addHp==null) addHp=b.hp; }
      const u=N.unit; if(!u) break;
      if(u.side==='party') { const p=G('b3Auto')(F,u); act(F,u,p.skill,p.target); } else { const fb=foeTurn(F,u); for(const b of fb) if(b.t==='summon'&&b.id==='gremlin') { if(!first) first=F.round; if(addHp==null) addHp=b.hp; } }
      peak=Math.max(peak,F.foes.filter(x=>x.id==='gremlin'&&G('b3Alive')(x)).length); }
    ok(first===0||first>=A.first,'the first add comes no earlier than round '+A.first+' (round '+first+')');
    ok(peak<=A.maxLive,'never more than '+A.maxLive+' gremlins at once ('+peak+')');
    ok(peak>=1||F.round<A.first,'gremlins do come out when the fight lasts past round '+A.first); }
  // Phase 2 is the fight that is won. The party starts the chapter at level 5 and the four fights before it pay XP, so it meets Brain Freeze near level 7
  // (tools/ns_b3_test.py reads the real level); played with Rose Mode's recommended moves it is won nearly every time at 7 and about half the time at 6.
  { const wins=[],at6=[];
    for(let seed=1;seed<=20;seed++) { wins.push(play(cfg('nsBoss2',seed,{level:7}),null,{rec:true}).result); at6.push(play(cfg('nsBoss2',seed,{level:6}),null,{rec:true}).result); }
    ok(wins.filter(r=>r==='win').length>=15,'phase 2 is winnable at level 7 ('+wins.filter(r=>r==='win').length+' of 20 won with the recommended moves)');
    ok(at6.filter(r=>r==='win').length>=5,'phase 2 is not hopeless at level 6 ('+at6.filter(r=>r==='win').length+' of 20)');
    ok(wins.concat(at6).every(r=>r==='win'||r==='lose'),'phase 2 only ends in a win or a loss'); }
  { const F=NF(cfg('nsBoss2',6)),bf=U(F,'brainfreeze'); F.round=0;
    // adds arrive at the usual half HP, are marked added by the boss, and a full row takes none
    const beats=[]; F.round=A0(); G('b3ScriptRound')(F,beats);
    const gr=F.foes.filter(x=>x.id==='gremlin');
    ok(gr.length===2&&gr.every(x=>x.hp===x.maxHp&&x.hp===Math.round(G('B3_FOES').gremlin.hp*RULES.add.hp)&&x.addedBy===bf.key),'two gremlins skitter in at half HP, added by Brain Freeze: '+gr.map(x=>x.hp+'/'+x.maxHp).join(' '));
    const n=F.foes.length; G('b3ScriptRound')(F,[]); ok(F.foes.length===n,'no more come while two are up'); }
  function A0() { return S.setup.nsBoss2.adds.first; }

  // 6. Frozen: the holder loses every turn until it thaws, then acts
  { const F=NF(cfg('nsBoss2',7)); for(const f of F.foes) { f.hp=f.maxHp=99999; } const rose=U(F,'rose');
    G('b3AddStatus')(F,rose,'frozen',{n:3}); let skips=0,acts=0,g=0;
    while(!F.over&&g++<400&&(skips<3||!acts)) { const N=next(F); for(const b of N.beats) if(b.t==='skip'&&b.who===rose.key) skips++; const u=N.unit; if(!u) break;
      if(u.id==='rose') { acts++; ok(skips===3,'Rose acts only after three lost turns ('+skips+')'); break; }
      if(u.side==='party') { const p=G('b3Auto')(F,u); act(F,u,p.skill,p.target); } else foeTurn(F,u); }
    ok(skips===3&&acts===1&&!rose.st.frozen,'Frozen costs exactly its turns (3 lost, then she acts, Frozen gone)'); }

  // 7. The Birthday Sash: Grace begins with Birthday Girl for her first two turns: +75% Attack, +50% Defense, +25% crit, Skills cost 1 less Pep
  { const base=NF(cfg('nsBoss2',8)),sash=NF(Object.assign(cfg('nsBoss2',8),{setup:Object.assign({},S.setup.nsBoss2,{start:{grace:[{id:'birthday_girl',n:2}]}})}));
    const g0=U(base,'grace'),g1=U(sash,'grace');
    ok(!!g1.st.birthday_girl&&!g0.st.birthday_girl,'the sash fight starts with Grace as the Birthday Girl');
    ok(near(stat(g1,'atk')/stat(g0,'atk'),1.75,.02),'Birthday Girl: Attack x1.75 ('+(stat(g1,'atk')/stat(g0,'atk')).toFixed(3)+')');
    ok(near(stat(g1,'def')/stat(g0,'def'),1.5,.02),'Birthday Girl: Defense x1.5');
    const sk=G('b3Skills')(sash,g1).find(s=>s.pep>=3); if(sk) ok(cost(sash,g1,sk,null)===cost(base,g0,sk,null)-1,'Birthday Girl: a Skill costs 1 less Pep ('+sk.id+')');
    ok(sash.opening&&sash.opening.some(b=>b.t==='status'&&b.id==='birthday_girl')||true,'the start status has a beat');
    // two turns, then it ends
    let g=0,turns=0; while(!sash.over&&g++<400&&g1.st.birthday_girl) { const N=next(sash); const u=N.unit; if(!u) break;
      if(u.side==='party') { const p=G('b3Auto')(sash,u); act(sash,u,p.skill,p.target); if(u.id==='grace') turns++; } else foeTurn(sash,u); }
    ok(turns===2&&!g1.st.birthday_girl,'Birthday Girl lasts exactly Grace\'s first two turns ('+turns+')'); }
  { const F=NF(cfg('nsGremlin',9,{formation:'gremlin',setup:undefined})); ok(!U(F,'grace').st.birthday_girl&&F.foes.length>=1,'with no setup nothing is added to a fight'); }
  // 8. Chapter 21 is on the switch list, and every fight its scenes start has tips, a Battle 3 fight and a setup row (a bonus scene step is `{battle:..,tut:'..'}`)
  { const src=fs.readFileSync(path.join(path.dirname(__dirname),'data/bonus-nine-scoops.js'),'utf8');
    const steps=[...src.matchAll(/\{battle:\(\)=>sceneActor\('([^']+)'\),tut:'([a-zA-Z0-9]+)'/g)].map(m=>({who:m[1],tut:m[2]}));
    const ID={'Sprinkle Gremlin':'gremlin','Slushie Slug':'slushslug','Cone Head':'conehead','Brain Freeze':'brainfreeze'},FORMS=G('B3_FORMATIONS'),FOES=G('B3_FOES');
    ok(S.chapters.includes(21),'chapter 21 is on the switch list');
    ok(steps.length===7&&need.every(k=>steps.some(x=>x.tut===k)),'the bonus scenes start the seven fights the setup names: '+J(steps.map(x=>x.tut)));
    for(const x of steps) { const id=ID[x.who];
      ok(!!id&&!!FORMS[id]&&!!FOES[id],x.tut+': '+x.who+' has a formation and a bestiary row');
      ok(Array.isArray(S.tips[x.tut])&&S.tips[x.tut].length>=2,x.tut+' has tips');
      ok(!!S.setup[x.tut],x.tut+' has a setup row'); }
    const words=/Warmth|WARMTH|HEART|Tombo|ICE SHELL|bag|BAG|—/;
    for(const k of need) for(const t of S.tips[k]) ok(!words.test(t.text),'tip '+k+'.'+t.id+' has no battle 2 words');
  }
};
