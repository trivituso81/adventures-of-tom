// tools/b3-sim.js — Battle 3 simulator: plays fights with no screen, and checks the rules.
// It loads the Battle 3 data files and the rules files (and nothing else) into an empty sandbox with no page, no canvas
// and no timers, so a rules file that reaches for any of those fails here.
//
// Usage (repo root):
//   node tools/b3-sim.js check                 data check plus the rule tests (prints FAILS: [] when all pass)
//   node tools/b3-sim.js new1 200              play Lab fight new1 200 times with the simple player
//   node tools/b3-sim.js new2 1 --seed=7 --log one fight, print every turn (who, clock, round, move, target)
//   options: --seed=N (first seed; fight k uses N+k), --hp=0.05 (party starts at that share of HP), --json (machine output)
//   --support=4: every 4th action of each family member is a move that deals no damage (a ward, a pass, a hazard), when they
//                have one they can pay for. The bestiary's boss HP model assumes about one action in four is support (section
//                1.6); without this option the simple player attacks whenever attacking scores higher, which is nearly always.
// <fight> is a B3_LAB id (data/b3-lab.js) or a B3_FORMATIONS id (then --party=tom,grace,rose,deedee --level=2).
//   --rec: the family plays with Rose Mode's recommended move (b3Recommend) instead of the simple player.
//   --foehp=20 multiplies monster HP (with --hp it makes a fight the party loses, for the lose screen test).
//   --rank=3: every Vibe at that Rank (left out: 2, the Rank the Battle Lab starts at). --swap=tom,rose (or --swap=all): those
//   family members fight with their second Sig Vibe as Main and their first as Pocket.
//   Quirks: each member's two slots are filled with the Quirks their Rank has unlocked whose rules are written, the Main Vibe's
//   first, then the Pocket Vibe's (Rank 3 unlocks Quirk A, Rank 5 Quirk B). --quirks=none leaves the slots empty.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.dirname(__dirname);
const DATA=['data/b3-rules.js','data/b3-gear.js','data/b3-status.js',
  ...fs.readdirSync(path.join(ROOT,'data')).filter(f=>/^b3-kit-.*\.js$/.test(f)).sort().map(f=>'data/'+f),
  ...fs.readdirSync(path.join(ROOT,'data')).filter(f=>/^b3-foes-.*\.js$/.test(f)).sort().map(f=>'data/'+f),
  'data/b3-lab.js','data/b3-story.js'];
const RULES=['data/move-specs.js','engine/b3-spec.js','engine/b3-core.js','engine/b3-progress.js','engine/b3-timeline.js','engine/b3-hooks.js','engine/b3-ops.js','engine/b3-last.js','engine/b3-custom.js','engine/b3-resolve.js','engine/b3-ruckus.js','engine/b3-preview.js','engine/b3-foe.js','engine/b3-script.js'];
function load() {
  const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,console:{log(){},error(){}}});
  for(const f of [...DATA,...RULES]) vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
  return name=>vm.runInContext(name,ctx);
}
const G=load();
const args=process.argv.slice(2),flag=k=>{ const a=args.find(x=>x.startsWith('--'+k+'=')); return a?a.split('=')[1]:null; },has=k=>args.includes('--'+k);
const pos=args.filter(a=>!a.startsWith('--'));

// One whole fight with the simple player. Returns what happened.
function play(cfg,log,opt) {
  const F=G('b3NewFight')(cfg),b3Next=G('b3Next'),b3Auto=G('b3Auto'),b3Act=G('b3Act'),b3FoeTurn=G('b3FoeTurn'),SK=G('B3_SKILLS'),PW=G('B3_RULES').power;
  const out={seed:F.seed,turns:0,dets:{},kos:0,moves:{},breaks:0,pips:0,support:0},every=(opt&&opt.support)||0,acted={};
  const quiet=S=>!((typeof S.power==='number'?S.power:PW[S.power])>0);
  let guard=0;
  while(!F.over) {
    if(++guard>2000) throw new Error('fight did not end after 2000 turns');
    if(F.repick) { const rp=G('b3RepickAuto')(F); if(!rp.ok) throw new Error('auto repick refused: '+rp.why); out.repicks=(out.repicks||0)+1; }   // chapter 20: the four are picked again at a phase change
    const N=b3Next(F); let beats=N.beats; const u=N.unit;
    if(u) {
      out.turns++;
      if(u.side==='party') {
        const n=acted[u.key]=(acted[u.key]||0)+1;
        // Stage 6: with opt.ruckus the player also spends the Family Ruckus (engine/b3-ruckus.js b3AutoRuckus); the older groups leave it off.
        // Stage 7: with opt.rec the player is Rose Mode's recommended move (engine/b3-preview.js b3Recommend) instead of the simple player.
        const recP=opt&&opt.rec?G('b3Recommend')(F,u):null;
        const rk=recP?(recP.kind==='ruckus'?{kind:recP.skill.slice(7),target:recP.target}:null):opt&&opt.ruckus?G('b3AutoRuckus')(F,u):null;
        let pick=rk?{skill:'ruckus_'+rk.kind}:recP?recP:every&&(n+u.slot)%every===0?b3Auto(F,u,quiet):null;
        if(pick&&!rk&&!recP&&pick.sc<-50) pick=null;   // nothing useful to set up (the ward is already up, the floor is already wet)
        if(pick&&!rk&&!recP) out.support++; else if(!pick) pick=b3Auto(F,u);
        if(!pick) throw new Error(u.name+' has nothing to do');
        const r=rk?G('b3Ruckus')(F,u,rk.kind,rk.target):b3Act(F,u,pick.skill,pick.target); if(!r.ok) throw new Error('simple player picked an illegal move: '+r.why);
        beats=beats.concat(r.beats); out.moves[pick.skill]=(out.moves[pick.skill]||0)+1;
        // A granted action (Colossal Diamond-Gold Dumpling): that family member picks a free Skill at once, before the clock moves.
        while(F.grant&&!F.over) { const g=F.units.find(x=>x.key===F.grant.key),gp=(opt&&opt.rec&&G('b3Recommend')(F,g))||b3Auto(F,g); if(!gp) { F.grant=null; break; }
          const gr=b3Act(F,g,gp.skill,gp.target); if(!gr.ok) throw new Error('simple player picked an illegal free Skill: '+gr.why);
          beats=beats.concat(gr.beats); out.moves[gp.skill]=(out.moves[gp.skill]||0)+1; out.free=(out.free||0)+1;
          if(log) console.log(`           free: ${g.name.padEnd(8)} ${SK[gp.skill].name}`); }
        if(log) console.log(`  r${F.round} t${N.beats.find(b=>b.t==='turn').clock.toFixed(1).padStart(6)}  ${u.name.padEnd(14)} ${(SK[pick.skill]||{name:pick.skill.toUpperCase()}).name}${!pick.target||pick.target==='*'?'':' -> '+F.units.find(x=>x.key===pick.target).name}`);
      } else {
        const fb=b3FoeTurn(F,u); beats=beats.concat(fb);
        const a=fb.find(b=>b.t==='act'),tg=fb.find(b=>b.t==='telegraph');
        const nm=k=>F.units.find(x=>x.key===k).name;
        if(log) console.log(`  r${F.round} t${N.beats.find(b=>b.t==='turn').clock.toFixed(1).padStart(6)}  ${u.name.padEnd(14)} ${a?a.name+(a.tgts.length===1&&a.tgts[0]!==u.key?' -> '+nm(a.tgts[0]):''):''}${a&&tg?', then ':''}${tg?'winds up '+tg.name+(tg.mark?' at '+nm(tg.mark):''):''}${a||tg?'':'loses the turn'}`);
      }
    }
    for(const b of beats) { if(b.t==='detonate') out.dets[b.id]=(out.dets[b.id]||0)+1; if(b.t==='ko'&&b.tgt[0]==='p') out.kos++;
      if(b.t==='break') out.breaks++; if(b.t==='pips'&&!b.refill) out.pips+=b.n; if(b.t==='ruckus') out.ruckus=b.v;
      if(log&&['detonate','push','pull','ko','miss','pips','break','interrupt','intercept','summon','passive','grant','counter'].includes(b.t)) console.log('        '+b.t+' '+JSON.stringify(Object.assign({},b,{bar:undefined,t:undefined,g:undefined}))); }
  }
  out.result=F.over; out.rounds=F.clock/100; out.order=F.turnLog; out.hpLeft=F.party.map(p=>p.hp);
  out.hpShare=F.party.reduce((s,p)=>s+p.hp,0)/F.party.reduce((s,p)=>s+p.maxHp,0);
  return out;
}
function cfgFor(id) {
  const L=G('B3_LAB').find(x=>x.id===id);
  const cfg=L?{party:L.party.slice(),level:L.level,formation:L.formation,rows:L.rows}:{party:(flag('party')||'tom,grace,rose,deedee').split(','),level:Number(flag('level')||2),formation:id};
  // Loadouts: every Vibe at --rank (the Lab's starting Rank when left out); --swap=tom,rose trades Main and Pocket for those members.
  const rank=Number(flag('rank')||G('B3_RULES').labRank),swap=(flag('swap')||'').split(',').filter(Boolean);
  cfg.loadouts={};
  for(const m of cfg.party) { const Ld=G('b3NewLoadout')(m,rank); if(swap.includes(m)||swap.includes('all')) G('b3SetMain')(m,Ld,Ld.pocket);
    if(flag('quirks')!=='none') { const pool=G('b3QuirkPool')(m,Ld),V=G('B3_VIBES'),Q=G('B3_QUIRKS');
      [...V[Ld.main].quirks,...(Ld.pocket?V[Ld.pocket].quirks:[])].filter(q=>pool.includes(q)&&!Q[q].soon).slice(0,2).forEach((q,i)=>G('b3SetQuirk')(m,Ld,i,q)); }
    cfg.loadouts[m]=Ld; }
  if(flag('gear')) cfg.gear=require('./b3-check-gear.js').typicalGear(G,cfg.party,Number(flag('gear')));   // --gear=N: the gear a family typically wears by chapter N (tools/b3-check-gear.js)
  if(flag('hp')) cfg.hpPct=Number(flag('hp'));
  if(flag('foehp')) cfg.mods={foeHp:Number(flag('foehp'))};
  return cfg;
}

// ---------- Rule tests ----------
function check() {
  let checks=0; const fails=[],ok=(cond,what)=>{ checks++; if(!cond) fails.push(what); },near=(a,b,eps)=>Math.abs(a-b)<=(eps==null?1e-6:eps);
  const [next,act,foeTurn,U,RULES_,SK,ST,FOES]=['b3Next','b3Act','b3FoeTurn','b3Unit','B3_RULES','B3_SKILLS','B3_STATUS','B3_FOES'].map(G);
  // The groups of stages 1 to 3 were written against the bare unit: first Vibe only, Skill 1 and Skill 2, no Lean, no Pocket Vibe,
  // no Trait (cfg.plain in engine/b3-core.js). They keep it, so their numbers stay what they were. Stage 4's file tests real loadouts.
  const NF=cfg=>G('b3NewFight')(Object.assign({plain:true},cfg)),playPlain=(cfg,log,opt)=>play(Object.assign({plain:true},cfg),log,opt);
  const base={party:['tom','grace','rose','deedee'],level:2};
  // 1. Data (before any test row is added)
  const bad=G('b3CheckData')(); ok(bad.length===0,'data check: '+bad.join('; '));
  // battleux2: every family move (and Pick-Me-Up) has its one plain line for the battle screen, 60 characters at most, no em dash.
  { const V=G('B3_VIBES'),C=G('B3_CAST'),badS=Object.values(SK).filter(S=>(S.common||(V[S.vibe]&&C[V[S.vibe].owner]))&&(typeof S.short!=='string'||!S.short.trim()||S.short.length>60||/—/.test(S.short)));
    ok(badS.length===0,'every family move has a short line of 60 characters at most: '+badS.map(S=>S.id+' ('+(typeof S.short==='string'?S.short.length:'none')+')').join(', ')); }
  // Test moves (one per flavor) and test statuses, added to the sandbox only.
  for(const fl of ['clobber','sizzle','drench','razzle','racket'])
    SK['t_'+fl]={id:'t_'+fl,vibe:'tom_flier',slot:'s1',name:'Test '+fl,pep:0,flavor:[fl],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_two={id:'t_two',vibe:'tom_flier',slot:'s1',name:'Test two',pep:0,flavor:['drench','clobber'],power:'standard',hits:1,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_all={id:'t_all',vibe:'tom_flier',slot:'s1',name:'Test all',pep:0,flavor:['racket'],power:'standard',hits:1,target:'all_foes',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_multi={id:'t_multi',vibe:'tom_flier',slot:'s1',name:'Test multi',pep:0,flavor:['clobber'],power:'standard',hits:3,target:'foe',tags:[],composure:0,effects:[{op:'damage'}]};
  SK.t_unbuilt={id:'t_unbuilt',vibe:'tom_flier',slot:'s1',name:'Test unbuilt',pep:0,flavor:['support'],power:0,hits:0,target:'self',tags:[],composure:0,effects:[{op:'ward'}]};
  ST.t_out_a={id:'t_out_a',name:'A',kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[{stat:'out',kind:'a',v:.8}],flags:[],weight:1};
  ST.t_out_b={id:'t_out_b',name:'B',kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[{stat:'out',kind:'b',v:.8}],flags:[],weight:1};
  ST.t_red_a={id:'t_red_a',name:'RA',kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[{stat:'reduce',kind:'a',v:.5}],flags:[],weight:1};
  ST.t_red_b={id:'t_red_b',name:'RB',kind:'buff',group:null,dur:{n:9,unit:'turn'},mods:[{stat:'reduce',kind:'b',v:.5}],flags:[],weight:1};
  ST.t_spd_a={id:'t_spd_a',name:'SA',kind:'debuff',group:null,dur:{n:9,unit:'turn'},mods:[{stat:'spd',kind:'slow',v:-.10}],flags:[],weight:1};
  // A fight where it is this party member's turn, with crits out of the way (they are tested on their own).
  const fresh=(formation,who,seed)=>{ const F=NF(Object.assign({},base,{formation,seed:seed==null?11:seed})); let N; do { N=next(F); if(N.unit&&N.unit.id!==who) { if(N.unit.side==='party') act(F,N.unit,N.unit.basic,G('b3Options')(F,N.unit,SK[N.unit.basic])[0].key); else foeTurn(F,N.unit); } } while(N.unit&&N.unit.id!==who); return {F,u:N.unit}; };
  const tom0=()=>{ const F=NF(Object.assign({},base,{formation:'mudling',seed:5})); const N=next(F); return {F,u:N.unit}; };   // Tom's first turn, nothing has happened yet
  const noCrit=fn=>{ const r=RULES_.crit.rate; RULES_.crit.rate=-9; try { return fn(); } finally { RULES_.crit.rate=r; } };

  // 2. Level table
  const LS=G('b3LevelStats'); ok(JSON.stringify(LS(2))===JSON.stringify({hp:115,atk:26,def:16,spd:100}),'level 2 stats '+JSON.stringify(LS(2)));
  ok(LS(1).hp===100&&LS(50).hp===1150&&LS(50).spd===120&&LS(3).hp===130,'level 1, 3 or 50 stats');
  // 3. Opening order: party (slot order) then foes
  { const F=NF(Object.assign({},base,{formation:'mudling',seed:1})); const seq=[]; for(let i=0;i<6;i++) { const N=next(F); seq.push(N.unit.key); if(N.unit.side==='party') act(F,N.unit,N.unit.basic,G('b3Options')(F,N.unit,SK[N.unit.basic])[0].key); else foeTurn(F,N.unit); }
    ok(seq.join()==='p0,p1,p2,p3,f0,f1','opening order '+seq); ok(near(F.party[0].wait+F.clock,130,1e-6)||F.party[0].wait>0,'Tom waits after a Basic'); }
  // 4. Damage formula and Pet Peeve; Pep: start 4, Basic +2
  noCrit(()=>{ const {F,u}=tom0(); ok(u.pep===4,'start Pep '+u.pep);
    const r=act(F,u,'lounge_pass_flex','f0'),h=r.beats.find(b=>b.t==='hit');
    ok(h&&h.dmg===Math.round(26*.5*100/112*1.5)&&h.peeve,'Lounge Pass Flex damage '+(h&&h.dmg)); ok(u.pep===6,'Basic gives +2 Pep: '+u.pep);
    ok(near(u.wait,80),'Basic Recovery 80 at Speed 100: '+u.wait); ok(!!u.st.eyes_on_me,'Eyes On Me is on Tom'); });
  // 5. Primes from flavors
  noCrit(()=>{ for(const [fl,p] of [['sizzle','toasty'],['drench','drenched'],['razzle','dazzled'],['clobber',null],['racket',null]]) { const {F,u}=tom0(); act(F,u,'t_'+fl,'f0'); const f=U(F,'f0'),got=Object.keys(f.st).filter(id=>ST[id].kind==='prime'); ok(p?got.join()===p:got.length===0,fl+' leaves '+(got.join()||'no Prime')); } });
  // 6. The Detonations: [first flavor, detonating flavor, id]
  noCrit(()=>{ for(const [f1,f2,id] of [['sizzle','drench','steam_cloud'],['drench','sizzle','steam_cloud'],['sizzle','racket','panic_boil'],['drench','clobber','hydro_slip'],['drench','razzle','short_circuit'],['razzle','clobber','shatter_glitz'],['razzle','racket','sensory_overload']]) {
    const {F,u}=tom0(),f=U(F,'f0'),f1u=U(F,'f1'); act(F,u,'t_'+f1,'f0');
    const g=F.party[1]; F.acting=g; const pep0=g.pep,w0=f.wait,hp1=f1u.hp;
    if(id==='panic_boil') G('b3AddStatus')(F,f,'guard_stance',{src:f}); if(id==='shatter_glitz') G('b3AddStatus')(F,f,'jitterflight',{src:f});
    const r=act(F,g,'t_'+f2,'f0'),d=r.beats.find(b=>b.t==='detonate');
    ok(d&&d.id===id,f1+' then '+f2+' should be '+id+', got '+(d&&d.id)); ok(g.pep===pep0+1,id+': attacker +1 Pep');
    ok(!Object.keys(f.st).some(k=>ST[k].kind==='prime'),id+': the Prime is used up and the hit leaves none');
    if(id==='hydro_slip') ok(near(f.wait,w0+25),'Hydro-Slip! pushes 25 ticks: '+(f.wait-w0));
    if(id==='steam_cloud') ok(!!f.st.blind,'Steam Cloud! blinds');
    if(id==='panic_boil') ok(!f.st.guard_stance,'Panic Boil! drops the stance');
    if(id==='short_circuit') ok(f1u.hp<hp1&&r.beats.some(b=>b.t==='hit'&&b.splash&&b.tgt==='f1'),'Short Circuit! splashes the neighbour');
    if(id==='shatter_glitz') ok(!f.st.jitterflight&&f.stripped.jitterflight,'Shatter Glitz! strips a buff');
    if(id==='sensory_overload') ok(!!f.st.overloaded&&near(G('b3OutMult')(f),.75),'Sensory Overload! cuts its damage 25%'); } });
  // 7. One Detonation per target per action; a two-flavor move splits its power and applies no Prime after a Detonation
  noCrit(()=>{ const {F,u}=tom0(),f=U(F,'f0'); f.hp=f.maxHp=9999; act(F,u,'t_drench','f0'); const g=F.party[1]; F.acting=g;
    const r=act(F,g,'t_multi','f0'); ok(r.beats.filter(b=>b.t==='detonate').length===1,'three Clobber hits detonate once'); ok(r.beats.filter(b=>b.t==='hit').length===3,'three hits land');
    const hit=r.beats.find(b=>b.t==='hit'); ok(hit.dmg===Math.round(26/3*100/112),'a 3-hit move shares its power: '+hit.dmg); });
  noCrit(()=>{ const {F,u}=tom0(),f=U(F,'f0'); f.hp=f.maxHp=9999; act(F,u,'t_sizzle','f0'); const g=F.party[1]; F.acting=g;
    const r=act(F,g,'t_two','f0'),hits=r.beats.filter(b=>b.t==='hit'); ok(hits.length===2&&hits[0].flavor==='drench'&&hits[1].flavor==='clobber','two-flavor move lands Drench then Clobber');
    ok(r.beats.filter(b=>b.t==='detonate').length===1&&!f.st.drenched,'two-flavor move: one Detonation, no Drenched after it'); });
  // 8. A party Skill on all foes uses 70% of its tier
  noCrit(()=>{ const {F,u}=tom0(); const r=act(F,u,'t_all','*'),hits=r.beats.filter(b=>b.t==='hit'); ok(hits.length===2&&hits[0].dmg===Math.round(26*.7*100/112*1.5),'all-foes share: '+(hits[0]&&hits[0].dmg)); });
  // 9. Toasty burns at the start of the foe's turns, for 2 of its turns
  noCrit(()=>{ const {F,u}=tom0(),f=U(F,'f0'); f.hp=f.maxHp=9999; act(F,u,'t_sizzle','f0'); let burns=0,turns=0;
    while(turns<4) { const N=next(F); if(N.unit.key==='f0') { turns++; burns+=N.beats.filter(b=>b.t==='hit'&&b.tick==='toasty').length; foeTurn(F,N.unit); } else if(N.unit.side==='party') { F.acting=N.unit; G('b3EndTurn')(F,N.unit,100,[]); } else foeTurn(F,N.unit); }
    ok(burns===2,'Toasty burns twice: '+burns); });
  // 10. Drenched slows the next Recovery; Fatigue lengthens it
  { const {F}=tom0(),f=U(F,'f0'); G('b3AddStatus')(F,f,'drenched',{src:F.party[0]}); ok(near(G('b3WaitFor')(F,f,100),100*100/(99*.85)),'Drenched: -15% Speed');
    G('b3AddStatus')(F,f,'fatigue',{src:f}); ok(near(G('b3WaitFor')(F,f,100),100*100/(99*.85)*1.2),'Fatigue: +20% Recovery Ticks');
    G('b3AddStatus')(F,f,'slow',{src:f}); ok(near(G('b3Stat')(f,'spd'),99*.85*.8),'different kinds multiply');
    G('b3AddStatus')(F,f,'t_spd_a',{src:f}); ok(near(G('b3Stat')(f,'spd'),99*.85*.7),'same kind adds'); }
  // 11. Caps: damage bonus +100%, damage reduction 60%
  { const {F,u}=tom0(); G('b3AddStatus')(F,u,'t_out_a',{}); G('b3AddStatus')(F,u,'t_out_b',{}); ok(near(G('b3OutMult')(u),2),'damage bonus cap');
    G('b3AddStatus')(F,u,'t_red_a',{}); G('b3AddStatus')(F,u,'t_red_b',{}); ok(near(G('b3TakenMult')(u),.4),'damage reduction cap'); }
  // 12. Push and pull halve inside a round and reset at the divider; a pull never goes below 0
  { const {F}=tom0(),f=U(F,'f0'),w=f.wait; G('b3Push')(F,f,35); G('b3Push')(F,f,35); G('b3Push')(F,f,35); ok(near(f.wait,w+35+17.5+8.75),'push halving');
    const p=F.party[1]; p.wait=30; ok(near(G('b3Pull')(F,p,20),20)&&near(G('b3Pull')(F,p,20),10)&&near(p.wait,0),'pull halving');
    p.wait=5; p.pulls=0; ok(near(G('b3Pull')(F,p,50),5)&&near(p.wait,0),'a pull stops at 0');
    G('b3RoundStart')(F,[]); ok(f.pushes===0&&p.pulls===0&&F.round===2,'the divider resets halving'); }
  // 13. Refund cap: at most +3 Pep a round from anything but your own Basic
  { const {F,u}=tom0(); u.pep=0; const P=G('b3Pep'); P(F,u,2,'detonation'); P(F,u,2,'gift'); P(F,u,2,'quirk'); ok(u.pep===3,'refund cap: '+u.pep); P(F,u,2,'basic'); ok(u.pep===5,'own Basic is outside the cap'); P(F,u,99,'basic'); ok(u.pep===10,'Pep max 10'); P(F,u,-99,'cost'); ok(u.pep===0,'Pep min 0'); }
  // 14. NeeDoh Stretch Pass: the ally acts right after Grace, +20% Speed, once a round each
  noCrit(()=>{ const {F,u}=fresh('mudling','grace'); const rose=F.party[2]; ok(u.id==='grace','Grace is up');
    const r=act(F,u,'needoh_stretch_pass','p2'); ok(r.ok&&u.pep===1,'NeeDoh costs 3 Pep'); ok(near(rose.wait,0)&&!!rose.st.stress_melted,'Rose is at the front with the Speed buff');
    ok(G('b3Options')(F,u,SK.needoh_stretch_pass).find(o=>o.key==='p2').no,'Rose cannot be moved again this round');
    const N=next(F); ok(N.unit===rose,'Rose acts next, got '+N.unit.name); ok(near(G('b3Stat')(rose,'spd'),120),'Rose Speed 120'); });
  // 15. Squished: the next OTHER family member to hit gains 1 Pep
  noCrit(()=>{ const {F,u}=fresh('mudling','grace'); const f=U(F,'f0'); f.hp=f.maxHp=9999; act(F,u,'soup_dumpling_squeeze','f0'); ok(!!f.st.squished,'Squished is on');
    F.acting=u; const p=u.pep; act(F,u,'t_racket','f0'); ok(!!f.st.squished&&u.pep===p,'Grace herself does not cash it');
    const rose=F.party[2]; F.acting=rose; const rp=rose.pep; act(F,rose,'t_racket','f0'); ok(!f.st.squished&&rose.pep===rp+1,'Rose gains 1 Pep and the mark is used up'); });
  // 16. Rose: two hits, and The Floor Is Lava! bonus on a Toasty monster
  noCrit(()=>{ const {F,u}=fresh('mudling','rose'); const f0=U(F,'f0'),f1=U(F,'f1'); f0.hp=f0.maxHp=f1.hp=f1.maxHp=9999;
    let r=act(F,u,'lamb_tuck_ankle_tackle','f0'); ok(r.beats.filter(b=>b.t==='hit').length===2,'Ankle Tackle hits twice');
    G('b3AddStatus')(F,f0,'toasty',{src:u}); F.acting=u; u.pep=10; r=act(F,u,'the_floor_is_lava','*');
    const hs=r.beats.filter(b=>b.t==='hit'); ok(hs.length===3,'Lava hits three times'); ok(u.pep===7,'Lava costs 3');
    const plain=Math.round(26/3*100/112),hot=Math.round(26/3*100/112*1.25);
    ok(hs.every(h=>h.dmg===(h.tgt==='f0'?hot:plain)),'Lava +25% on Toasty: '+hs.map(h=>h.tgt+':'+h.dmg)); });
  // 17. Back row: 20% less single-target Clobber, until nobody stands in Front
  noCrit(()=>{ const {F,u}=(()=>{ const F=NF(Object.assign({},base,{formation:'skeeter',seed:5})); return {F,u:next(F).unit}; })(); const sk=F.foes.find(f=>f.id==='skeeter'),mud=F.foes.find(f=>f.id==='mudling');
    delete sk.st.jitterflight; sk.hp=sk.maxHp=9999;
    let h=act(F,u,'t_clobber',sk.key).beats.find(b=>b.t==='hit'); ok(h.dmg===Math.round(26*100/114*.8),'Back row Clobber: '+h.dmg);
    mud.hp=0; mud.ko=true; F.acting=u; h=act(F,u,'t_clobber',sk.key).beats.find(b=>b.t==='hit'); ok(h.dmg===Math.round(26*100/114),'Back counts as Front when Front is empty: '+h.dmg); });
  // 18. Odds: Jitterflight dodges about 20%, Windex makes about 15% miss, Eyes On Me draws about a third, crits about 5%
  { let dodge=0,n=3000,crit=0; const F=NF(Object.assign({},base,{formation:'skeeter',seed:99})),u=next(F).unit,sk=F.foes.find(f=>f.id==='skeeter'); sk.hp=sk.maxHp=1e9;
    for(let i=0;i<n;i++) { F.acting=u; const r=act(F,u,'t_racket',sk.key); if(r.beats.some(b=>b.t==='miss'&&b.why==='dodge')) dodge++; if(r.beats.some(b=>b.t==='hit'&&b.crit)) crit++; G('b3AddStatus')(F,sk,'jitterflight',{src:sk}); }
    ok(dodge/n>.17&&dodge/n<.23,'Jitterflight dodge rate '+(dodge/n).toFixed(3)); ok(crit/(n-dodge)>.035&&crit/(n-dodge)<.065,'crit rate '+(crit/(n-dodge)).toFixed(3)); }
  { let miss=0,tomHit=0,n=3000; const F=NF(Object.assign({},base,{formation:'mudling',seed:42})),m=F.foes[0]; for(const p of F.party) p.hp=p.maxHp=1e9;
    for(let i=0;i<n;i++) { G('b3AddStatus')(F,m,'windexed',{src:F.party[3]}); G('b3AddStatus')(F,F.party[0],'eyes_on_me',{src:F.party[0]}); F.acting=m; m.turns=1; m.actIx=0; m.charge=null; const b=foeTurn(F,m); if(b.some(x=>x.t==='miss'&&x.why==='acc')) miss++; if(b.some(x=>x.t==='act'&&x.tgts[0]==='p0')) tomHit++; }
    ok(miss/n>.12&&miss/n<.18,'Windex miss rate '+(miss/n).toFixed(3)); ok(tomHit/n>.30&&tomHit/n<.37,'Eyes On Me share '+(tomHit/n).toFixed(3)); }
  // 19. Mudling's act cycle: Wobble, Mud Flick, wind up Mud Pie, Mud Pie, Wobble...
  { const F=NF(Object.assign({},base,{formation:'mudling',seed:3})),m=F.foes[0],seq=[]; for(const p of F.party) p.hp=p.maxHp=1e9;
    for(let i=0;i<8;i++) { F.acting=m; m.turns++; const b=foeTurn(F,m),a=b.find(x=>x.t==='act'),tg=b.find(x=>x.t==='telegraph'); seq.push(tg?'!'+tg.id:a.id); }
    ok(seq.join()==='wobble,mud_flick,!mud_pie,mud_pie,wobble,mud_flick,!mud_pie,mud_pie','Mudling cycle '+seq); }
  // 20. Skeeter: Buzz Cloud only after Jitterflight was stripped; Mosquito Whine drains 1 Pep and tires
  noCrit(()=>{ const F=NF(Object.assign({},base,{formation:'skeeter',seed:3})),s=F.foes.find(f=>f.id==='skeeter'),seq=[]; for(const p of F.party) p.hp=p.maxHp=1e9;
    const turn=()=>{ F.acting=s; s.turns++; const b=foeTurn(F,s); seq.push(b.find(x=>x.t==='act').id); return b; };
    turn(); const b=turn(); const pb=b.find(x=>x.t==='pep'); ok(seq.join()==='darting_bite,mosquito_whine','Skeeter cycle '+seq);
    if(b.some(x=>x.t==='hit')) { ok(pb&&pb.n===-1,'Mosquito Whine drains 1 Pep'); ok(F.party.some(p=>p.st.fatigue),'Mosquito Whine tires'); }
    ok(!s.st.jitterflight&&!s.stripped.jitterflight,'Jitterflight runs out after 2 turns, and running out is not a strip');
    turn(); turn(); ok(seq.slice(2).join()==='darting_bite,mosquito_whine','no Buzz Cloud when it only ran out: '+seq.slice(2)); });
  noCrit(()=>{ const F=NF(Object.assign({},base,{formation:'skeeter',seed:3})),s=F.foes.find(f=>f.id==='skeeter'),seq=[]; for(const p of F.party) p.hp=p.maxHp=1e9;
    const turn=()=>{ F.acting=s; s.turns++; const b=foeTurn(F,s); seq.push(b.find(x=>x.t==='act').id); };
    turn(); G('b3EndStatus')(F,s,'jitterflight','strip'); turn(); ok(seq.join()==='darting_bite,buzz_cloud'&&!!s.st.jitterflight&&!s.stripped.jitterflight,'Buzz Cloud after a strip: '+seq); });
  // 21. Blind: the next single-target attack misses, then it is gone
  { const {F}=tom0(),m=F.foes[0]; G('b3AddStatus')(F,m,'blind',{src:F.party[0]}); F.acting=m; m.turns=1; const b=foeTurn(F,m); ok(b.some(x=>x.t==='miss'&&x.why==='blind')&&!m.st.blind,'Blind misses once'); }
  // 22. Durations: a 2-turn status on a foe lasts through 2 of its turns; "1t" on yourself lasts until your next turn ends
  noCrit(()=>{ const {F,u}=tom0(),m=F.foes[0]; for(const p of F.party) p.hp=p.maxHp=1e9; act(F,u,'lounge_pass_flex','f0'); G('b3AddStatus')(F,m,'windexed',{src:u});
    F.acting=m; m.turns=1; foeTurn(F,m); ok(!!m.st.windexed,'still on after 1 turn'); F.acting=m; m.turns=2; foeTurn(F,m); ok(!m.st.windexed,'gone after 2 turns');
    ok(!!u.st.eyes_on_me,'Eyes On Me holds between Tom\'s turns'); F.acting=u; G('b3EndTurn')(F,u,80,[]); ok(!u.st.eyes_on_me,'Eyes On Me ends when his next turn ends'); });
  // 23. Rounds: a divider at every 100 ticks
  { const F=NF(Object.assign({},base,{formation:'mudling',seed:8})); for(const f of F.foes) f.hp=f.maxHp=1e9; for(const p of F.party) p.hp=p.maxHp=1e9; let rounds=[];
    for(let i=0;i<40;i++) { const N=next(F); rounds.push(...N.beats.filter(b=>b.t==='round').map(b=>b.n)); ok(F.round===Math.floor(F.clock/100+1e-9)+1,'round matches the clock at '+F.clock); if(N.unit.side==='party') act(F,N.unit,N.unit.basic,'f0'); else foeTurn(F,N.unit); }
    ok(rounds.join()===rounds.map((_,i)=>i+2).join()&&rounds.length>=4,'dividers in order: '+rounds); }
  // 24. Forecast: the bar's next entry is who really acts next, and a highlighted move moves the actor's ghost
  noCrit(()=>{ const F=NF(Object.assign({},base,{formation:'mudling',seed:21})); for(const f of F.foes) f.hp=f.maxHp=1e9; for(const p of F.party) p.hp=p.maxHp=1e9; let wrong=0;
    let N=next(F);
    for(let i=0;i<30;i++) { const u=N.unit,rec=u.side==='party'?80:null; let fc=null;
      if(u.side==='party') { fc=G('b3Forecast')(F,3,{actor:u,recovery:80}); act(F,u,'lounge_pass_flex','f0'); } else foeTurn(F,u);
      N=next(F); if(fc&&fc[1].u!==N.unit) wrong++; }
    ok(wrong===0,'forecast was wrong '+wrong+' times');
    const u=N.unit.side==='party'?N.unit:null; if(u) { const a=G('b3Forecast')(F,9,{actor:u,recovery:80,ghost:true}),b=G('b3Forecast')(F,9,{actor:u,recovery:120,ghost:true});
      ok(a.filter(e=>e.ghost).length===1&&a.findIndex(e=>e.ghost)<=b.findIndex(e=>e.ghost),'ghost moves later for a slower move'); ok(a.some(e=>e.div),'the forecast marks a round divider'); } });
  // 25. An op that is not built says so
  { const {F,u}=tom0(); let msg=''; try { act(F,u,'t_unbuilt',u.key); } catch(e) { msg=e.message; } ok(/not built yet: ward/.test(msg),'unbuilt op error: '+msg); }
  // 26. Win and lose
  { const w=playPlain({party:base.party,level:2,formation:'mudling',seed:1}); ok(w.result==='win','new1 can be won'); const l=playPlain({party:base.party,level:2,formation:'mudling',seed:1,hpPct:.02,mods:{foeHp:20}}); ok(l.result==='lose'&&l.kos===4,'a party at 2% HP against 20x monsters loses: '+l.result); }
  // 27. Same seed, same fight
  { const a=playPlain({party:base.party,level:2,formation:'skeeter',seed:77}),b=playPlain({party:base.party,level:2,formation:'skeeter',seed:77}); ok(a.order.join()===b.order.join()&&a.rounds===b.rounds,'a seed replays exactly'); }
  // Stage 2's groups (28 on) live in their own file.
  require('./b3-check-s2.js')({G,ok,near,play:playPlain,noCrit});
  // Stage 3's groups (46 on): Composure, Break, Marks, the act runner, adds.
  require('./b3-check-s3.js')({G,ok,near,play:playPlain,noCrit});
  // Stage 4's groups (67 on): Ranks, Vibe Points, overflow, loadouts, Leans, Portable Counters, the second Sig Vibes' first moves.
  require('./b3-check-s4.js')({G,ok,near,play,noCrit});
  // Stage 5a's groups (82 on): the Traits, Quirks and Capstones of the four first Sig Vibes, and the general pieces they needed.
  require('./b3-check-s5.js')({G,ok,near,play,noCrit});
  // Stage 5b's groups (101 on): the second Sig Vibes of Tom and Grace complete (Gamer Geek, Craft Artist).
  require('./b3-check-s5b.js')({G,ok,near,play,noCrit});
  // Stage 5c's groups (114 on): Rose's Cozy Rosie and Deedee's Registered Nut complete.
  require('./b3-check-s5c.js')({G,ok,near,play,noCrit});
  // Stage 6's groups (127 on): the Family Ruckus gauge, its gains, Double Team and Full Family Ruckus.
  require('./b3-check-s6.js')({G,ok,near,play,noCrit});
  // Stage 7's groups (135 on): the preview on a copy of the fight, and the recommended move.
  require('./b3-check-s7.js')({G,ok,near,play,noCrit});
  // Stage 9b's groups: TNB complete (Ceramicist and Longboarder).
  require('./b3-check-s9b.js')({G,ok,near,play,noCrit});
  require('./b3-check-s9c.js')({G,ok,near,play,noCrit});
  // Stage 10's groups: Amy, Justin and Olivia complete (Fitness Queen, Classroom Boss, Basement Boss, Live Wire, Rope Champ, Working Mom).
  require('./b3-check-s10.js')({G,ok,near,play,noCrit});
  // Stage 11's groups: the chapter 2 to 4 bestiary (16 monsters, three bosses), the dive, Skill Lock, ACTION! and CUT!.
  require('./b3-check-s11.js')({G,ok,near,play,noCrit});
  // Stage 12's groups: the chapter 5 to 7 bestiary (stage 12a: the school, The Red Pen).
  require('./b3-check-s12.js')({G,ok,near,play,noCrit});
  // Stage 13's groups: the chapter 8 to 10 and bonus bestiary (stage 13a: the car barn, Old Ironbelly).
  require('./b3-check-s13.js')({G,ok,near,play,noCrit});
  // Stage 15's groups: the chapter 1 story switch (data/b3-story.js; the page side is tested by tools/b3_test.py s15).
  require('./b3-check-s15.js')({G,ok,near,play,noCrit});
  require('./b3-check-gear.js')({G,ok,near,play,noCrit});
  // Stage 17's groups: chapters 2 to 5 on Battle 3 (data/b3-story.js; the page side is tested by tools/ch2_b3_test.py to ch5_b3_test.py).
  require('./b3-check-s17.js')({G,ok,near,play,noCrit});
  require('./b3-check-s18.js')({G,ok,near,play,noCrit});
  require('./b3-check-s18bonus.js')({G,ok,near,play,noCrit});
  // Stage 16's groups: the Tombo skins on the Full Family Ruckus (data/b3-tombo-skins.js, engine/b3-skins.js; the page side is tested by tools/b3_test.py s16).
  require('./b3-check-s16.js')({G,ok,near,play,noCrit});
  // Stage 19's groups: the ten third Vibes (Star Baker, Stage Performer, Prankster, SuperMom, Home Cook, Boat Angler, Scream King, Picky Princess, Armchair Ref, News Anchor).
  require('./b3-check-s19.js')({G,ok,near,play,noCrit});
  // Stage 21's groups: Casual Mode ("Freelancer", the fourth Vibe) and the Stampcard, Polish Points and Remix Tickets gone from Battle 3.
  require('./b3-check-s21.js')({G,ok,near,play,noCrit});
  // Stage 22's groups: chapter 11 (the Endless Concourse) on Battle 3: the Standby Sprite and FINAL CALL, Gate Change's row trade, Rebooking Stampede; and the 30 Traits and 60 Quirks guard.
  require('./b3-check-s22.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 12 (Tom's street): Gridlock Prime, the Gridlock it calls and the Four-Way Red Light.
  require('./b3-check-s22ch12.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 13 (the tunnel and the dent in the dome wall): the Drill Worm's helper link and feedback, the Gold Knight.
  require('./b3-check-s22ch13.js')({G,ok,near,play,noCrit});
  require('./b3-check-s22ch14.js')({G,ok,near,play,noCrit});
  require('./b3-check-s22ch15.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 16 (the town square): Marlowe, the Grey Notes and the Eclipse wall that bounces.
  require('./b3-check-s22ch16.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 17 (Julian's building): the Pause Sprite, the Brass Desk Weight, the Curator and the Twin Lenses' two stances.
  require('./b3-check-s22ch17.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 18 (the studio on the top floor): The Studio Rig, Spotlight Lock then Big Flash, the backdrop that Panic Boil! brings down.
  require('./b3-check-s22ch18.js')({G,ok,near,play,noCrit});
  // Stage 22, chapter 19 (the lost-mail office): the Dead-Letter Censor's REDACTED stamp, the Wax-Seal Ward that bounces, the Courier's Wall Perch.
  require('./b3-check-s22ch19.js')({G,ok,near,play,noCrit});
  require('./b3-check-s22ch20.js')({G,ok,near,play,noCrit});
  console.log('CHECKS:',checks);
  console.log('FAILS:',JSON.stringify(fails,null,1));
  process.exit(fails.length?1:0);
}

if(pos[0]==='check') check();
else if(!pos[0]) { console.log('usage: node tools/b3-sim.js check | <fight> [times] [--seed=N] [--log] [--hp=0.05] [--json]'); process.exit(2); }
else {
  const n=Number(pos[1]||200),seed0=Number(flag('seed')||1),cfg0=cfgFor(pos[0]);
  const errs=[],R=[];
  for(let i=0;i<n;i++) {
    const cfg=Object.assign({},cfg0,{seed:seed0+i});
    try { if(has('log')) console.log('fight '+(i+1)+', seed '+cfg.seed); R.push(play(cfg,has('log'),{support:Number(flag('support')||0),ruckus:has('ruckus'),rec:has('rec')})); }
    catch(e) { errs.push('seed '+cfg.seed+': '+e.message+(process.env.B3_STACK?' '+e.stack:'')); }
  }
  const wins=R.filter(r=>r.result==='win'),W=wins.map(r=>r.rounds).sort((a,b)=>a-b),avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const dets={},moves={}; for(const r of R) { for(const k in r.dets) dets[k]=(dets[k]||0)+r.dets[k]; for(const k in r.moves) moves[k]=(moves[k]||0)+r.moves[k]; }
  const sum={fight:pos[0],fights:n,wins:wins.length,losses:R.length-wins.length,errors:errs,
    roundsToWin:W.length?{avg:+avg(W).toFixed(2),min:+W[0].toFixed(2),median:+W[Math.floor(W.length/2)].toFixed(2),max:+W[W.length-1].toFixed(2)}:null,
    knockOutsPerFight:+avg(R.map(r=>r.kos)).toFixed(2),turnsPerFight:+avg(R.map(r=>r.turns)).toFixed(1),supportMovesPerFight:+avg(R.map(r=>r.support)).toFixed(1),hpLeftShare:+avg(R.map(r=>r.hpShare)).toFixed(2),breaksPerFight:+avg(R.map(r=>r.breaks)).toFixed(2),pipsPerFight:+avg(R.map(r=>r.pips)).toFixed(1),detonations:dets,moves};
  if(has('json')) console.log(JSON.stringify(Object.assign(sum,has('order')?{order:R[0]&&R[0].order}:{})));
  else {
    console.log(`${sum.fight}: ${sum.fights} fights, ${sum.wins} won, ${sum.losses} lost, ${errs.length} errors`);
    if(sum.roundsToWin) console.log(`rounds to win: average ${sum.roundsToWin.avg}, shortest ${sum.roundsToWin.min}, middle ${sum.roundsToWin.median}, longest ${sum.roundsToWin.max}`);
    console.log(`knock-outs per fight: ${sum.knockOutsPerFight}   turns per fight: ${sum.turnsPerFight}   Breaks per fight: ${sum.breaksPerFight}   pips shaved per fight: ${sum.pipsPerFight}`);
    console.log(`support moves per fight: ${sum.supportMovesPerFight}   party HP left at the end: ${Math.round(sum.hpLeftShare*100)}%`);
    console.log('detonations: '+(Object.keys(dets).map(k=>k+' '+dets[k]).join(', ')||'none'));
    console.log('moves used: '+Object.keys(moves).map(k=>k+' '+moves[k]).join(', '));
    for(const e of errs.slice(0,10)) console.log('ERROR '+e);
  }
  process.exit(errs.length?1:0);
}
