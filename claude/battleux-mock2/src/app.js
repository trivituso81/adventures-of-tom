// The storybook battle screen, tappable mock (card c-b3story; plan claude/b3story-plan.md). NOT the game: no battle engine, fixed sample numbers.
// Real data: move names, prices, flavors, short lines, descriptions, statuses and monsters come from the game's data files (data/b3-*.js), loaded
// by the page; the words the screen adds come from data/b3-ux-words.js. The layout and the look are the spec; this code is not the implementation.
'use strict';
const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);
const HP0={grace:115,tom:132,rose:115,deedee:115,tnb:115,nara:115};       // level 2 (B3_LEVELS) with the Guard lean on Tom
const INCH={grace:50,tom:71,rose:40,deedee:65,tnb:70,nara:42};               // data/heights.json
const DMG={light:14,standard:22,heavy:34,capstone:48};                       // sample damage by the size word
const PCT={tiny:.05,small:.10,standard:.20,party:.15};
const EMO={clobber:'\u{1F44A}',sizzle:'\u{1F525}',drench:'\u{1F4A6}',razzle:'✨',racket:'\u{1F4E3}',support:'\u{1F917}'};  // Rose Mode pictures (engine/b3-pictures.js)
const BGS={pond:['bgs/01-pond-town.webp','Pond'],night:['bgs/08-moon-club-dome.webp','Night'],indoor:['bgs/06-library-reading-room.webp','Indoor, dark'],bright:['bgs/03-school-classroom.webp','Indoor, bright']};
const W=B3_FORECAST;
const T=ms=>new Promise(r=>setTimeout(r,ms/(S&&S.speed||1)));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const fill=(t,o)=>t.replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?o[k]:m);

// ---------------------------------------------------------------- kits and moves
function kit(id){const c=B3_CAST[id],vs=c.vibes.map(v=>B3_VIBES[v]);const pri=vs.find(v=>v.sig===1),sec=vs.find(v=>v.sig===2);
  return {id,name:c.name,pri,sec,basic:B3_SKILLS[pri.basic],priSk:pri.skills.map(s=>B3_SKILLS[s]).filter(Boolean),secSk:sec.skills.map(s=>B3_SKILLS[s]).filter(Boolean)};}
const KIT={};for(const id of Object.keys(HP0))KIT[id]=kit(id);
const RUCK={
  ruckus_double:{id:'ruckus_double',name:'Double Team',slot:'ruckus',pep:0,combo:50,power:'standard',hits:2,target:'foe',effects:[{op:'damage'}],short:B3_RUCKUS.double.short,desc:B3_RUCKUS.double.desc},
  ruckus_full:{id:'ruckus_full',name:'Family Ruckus',slot:'ruckus',pep:0,combo:100,power:'capstone',hits:2,target:'foe',composure:2,effects:[{op:'damage'}],short:B3_RUCKUS.full.short,desc:B3_RUCKUS.full.desc}};
const sk=id=>RUCK[id]||B3_SKILLS[id];
const partner=()=>{const t=S.turn.slice(1).find(x=>x[0]==='m'&&!S.mem[x.slice(2)].ko);return t?t.slice(2):S.actor;};
function flavs(s){if(s.slot==='ruckus'){const a=[].concat(KIT[S.actor].basic.flavor),b=[].concat(KIT[partner()].basic.flavor);return [...new Set(a.concat(b))];}return [].concat(s.flavor||[]);}
function aimKind(s){const t=s.target;
  if(t==='foe'||t==='foe_row'||t==='either')return 'foe'; if(t==='all_foes')return 'all'; if(t==='random_foes')return 'random';
  if(t==='ally'||t==='family'||t==='family_or_ko')return 'mem'; if(t==='ko_ally')return 'ko'; if(t==='field')return 'floor';
  if(t==='adjacent_allies')return 'near'; if(t==='ally_pair')return 'pair';
  if(t==='self')return (s.effects||[]).some(e=>e.to==='allies')?'family':'self'; return 'foe';}
const kindWord=s=>s.slot==='ruckus'?fill(W.withP,{p:B3_CAST[partner()].name}):(s.id==='pick_me_up'?B3_KIND.revive:B3_KIND[s.slot]||'');
const flavWord=s=>flavs(s).map(f=>B3_FLAVORS[f].name).join(' and ');

// ---------------------------------------------------------------- state
let S=null;
const PREF={det:Q.get('det')==='1',rose:Q.get('rose')==='1',bg:BGS[Q.get('bg')]?Q.get('bg'):'pond',speed:1};   // the switches survive a change of state
function mem(id,o){return Object.assign({id,hp:HP0[id],max:HP0[id],pep:4,ko:false,st:[],marked:false,next:false,shield:0},o||{});}
function foe(key,id,row,o){const F=B3_FOES[id];const hp=F.hp3||F.hp;return Object.assign({key,id,row,hp,max:hp,pips:F.pips||0,maxPips:F.pips||0,st:(F.start||[]).slice(),wind:null,flu:false},o||{});}
const ONE=()=>[foe('A','bigone','front',{hp:418})];
const FIVE=()=>[foe('A','mudling','front'),foe('B','grump','front'),foe('C','toad','front'),foe('D','skeeter','back'),foe('E','log','back')];
const FOUR=['grace','tom','rose','deedee'];                      // standing order, left to right (Deedee stands in the Back row)
const ORDER={grace:0,tom:1,deedee:2,rose:3,tnb:1,nara:2};       // turn order of the mock fight
function base(o){
  const party=o.party||FOUR,m={};for(const id of party)m[id]=mem(id);
  const s={party,mem:m,foes:o.foes||ONE(),turn:o.turn||null,actor:o.actor||party[0],round:2,roundAt:4,combo:30,hi:null,aim:null,lastFoe:null,free:null,
    det:PREF.det,rose:PREF.rose,bg:PREF.bg,phase:'turn',speed:PREF.speed,look:null,sheet:null,caption:'',cap2:'',
    pops:[],state:o.id||'start',keys:false,prev:null};
  if(!s.turn){const foes=s.foes.map(f=>'f:'+f.key),ms=party.map(id=>'m:'+id),out=[];
    // the order of a round: family and monsters interleaved, the acting member first
    ms.sort((x,y)=>ORDER[x.slice(2)]-ORDER[y.slice(2)]);const a=ms.indexOf('m:'+s.actor),rot=ms.slice(a).concat(ms.slice(0,a));
    let fi=0;rot.forEach((t,i)=>{out.push(t);if(i===1&&foes[fi])out.push(foes[fi++]);if(i===2&&foes[fi])out.push(foes[fi++]);});
    while(fi<foes.length)out.push(foes[fi++]);s.turn=out;}
  s.cycle=s.turn.slice();s.roundAt=s.turn.length;
  return s;
}
const STATES=[
  {id:'start',n:'One monster, Grace’s turn',d:'The Basic is highlighted when a turn opens; it is aimed already.',f(){S=base({id:'start'});}},
  {id:'tom',n:'Tom’s turn',d:'The bar has moved to Tom: he steps to the front spot and the bar opens on the monsters’ side.',f(){S=base({id:'tom',actor:'tom'});S.mem.grace.pep=6;}},
  {id:'deedee',n:'Deedee’s turn',d:'Deedee stands in the Back row; she steps to the same front spot, so the bar has one place.',f(){S=base({id:'deedee',actor:'deedee'});S.combo=42;}},
  {id:'five',n:'Five monsters (3 Front, 2 Back)',d:'Each monster has a strip under it; the aimed one’s full plate sits bottom left.',f(){S=base({id:'five',foes:FIVE()});}},
  {id:'aim_one',n:'Aimed at one monster',d:'Crunchy Sugar-Cube Pop on The Big One: the forecast is on the plate.',f(){S=base({id:'aim_one'});S.mem.grace.pep=5;S.hi='crunchy_sugar_cube_pop';}},
  {id:'aim_all',n:'Aimed at every monster',d:'Open-String Violin Screech: every strip shows its own damage; the plate sums it up.',f(){S=base({id:'aim_all',foes:FIVE()});S.hi='open_string_violin_screech';}},
  {id:'aim_mem',n:'Aimed at one family member',d:'Deedee Makes It Better on Tom: the forecast sits on his card.',f(){S=base({id:'aim_mem',actor:'deedee'});S.mem.tom.hp=71;S.mem.tom.st=['drenched'];S.hi='deedee_makes_it_better';S.aim={k:'mem',id:'tom'};}},
  {id:'aim_fam',n:'Aimed at the whole family',d:'Sofa-Cushion Citadel: every card shows the shield it gets.',f(){S=base({id:'aim_fam',actor:'rose'});S.mem.rose.pep=5;S.hi='sofa_cushion_citadel';}},
  {id:'aim_floor',n:'Aimed at the floor',d:'Wet-Floor Hazard: the monsters’ floor glows where it goes; no aim needed.',f(){S=base({id:'aim_floor',actor:'deedee',foes:FIVE()});S.hi='wet_floor_hazard';}},
  {id:'windup',n:'Winding up, Rose marked',d:'The Big One glared at Rose: Swamp Chomp comes next. Crunchy Sugar-Cube Pop cancels it.',f(){S=base({id:'windup'});const b=S.foes[0];b.wind={name:'Swamp Chomp',at:'rose'};S.mem.rose.marked=true;S.mem.grace.pep=5;S.hi='crunchy_sugar_cube_pop';}},
  {id:'status',n:'Statuses, and a Flustered monster',d:'Log Lump is out of Composure (Flustered); the others carry statuses.',f(){S=base({id:'status',actor:'tom',foes:FIVE()});const f=S.foes;
    f[0].st=['drenched','windexed'];f[1].st=['dazzled'];f[2].st=['off_key'];f[4].pips=0;f[4].flu=true;f[4].st=['mossy_brace'];S.aim={k:'foe',key:'E'};S.hi='controller_toss';S.mem.tom.st=['eyes_on_me'];}},
  {id:'combo65',n:'Combos 65%: Double Team',d:'At 50% a Double Team joins the top of the list, with the partner named.',f(){S=base({id:'combo65',actor:'tom'});S.combo=65;S.hi='ruckus_double';}},
  {id:'combo100',n:'Combos 100%: Family Ruckus',d:'At 100% the Family Ruckus is offered too.',f(){S=base({id:'combo100',actor:'deedee'});S.combo=100;S.hi='ruckus_full';}},
  {id:'ko',n:'Rose knocked out: Pick-Me-Up',d:'Pick-Me-Up appears for everyone; it aims at Rose’s card.',f(){S=base({id:'ko',actor:'tom'});S.mem.rose.ko=true;S.mem.rose.hp=0;S.mem.tom.pep=5;S.hi='pick_me_up';}},
  {id:'free',n:'A free Skill (from Grace)',d:'Grace’s Colossal Diamond-Gold Dumpling: Deedee may use one Skill of 4 Pep or less, free, now.',f(){S=base({id:'free',actor:'deedee'});S.free={from:'grace',max:4};S.mem.deedee.pep=5;S.hi='hand_me_my_glasses_scrub';}},
  {id:'playing',n:'A move playing, with the battle text',d:'The bar folds away while a move plays; one caption line says what happened.',f(){S=base({id:'playing'});S.phase='playing';S.caption='Grace uses Crunchy Sugar-Cube Pop!';S.cap2='Racket is a Pet Peeve: Composure down 1.';S.foes[0].hp=397;S.foes[0].pips=5;S.mem.grace.pep=1;S.combo=42;S.pops=[{at:'f:A',t:'-21'}];}},
  {id:'end',n:'End of the fight',d:'What the win paid, and Continue.',f(){S=base({id:'end'});S.foes[0].hp=0;S.foes[0].out=true;S.phase='end';}},
  {id:'nara',n:'A party of three with Nara',d:'Tom, TNB and Nara. Nara is short: the bar still sits beside her, its tail at her head.',f(){S=base({id:'nara',party:['tom','tnb','nara'],actor:'nara'});S.combo=20;}},
];
function setState(id){const st=STATES.find(x=>x.id===id)||STATES[0];st.f();S.state=st.id;
  if(!S.hi&&S.phase==='turn')S.hi=startHi();if(S.hi&&!S.aim)S.aim=defaultAim(sk(S.hi));
  render(true);}

// ---------------------------------------------------------------- the list of moves for the acting member
function list(){
  const k=KIT[S.actor],out=[];
  if(S.free){out.push({grp:fill(W.freeFrom,{who:B3_CAST[S.free.from].name}).replace(/\.$/,''),free:1});
    for(const s of k.priSk.concat(k.secSk))if(s.pep<=S.free.max)out.push({s,free:1});return out;}
  if(S.combo>=50){out.push({grp:W.group.ruckus});out.push({s:RUCK.ruckus_double});if(S.combo>=100)out.push({s:RUCK.ruckus_full});}
  if(S.party.some(id=>S.mem[id].ko)){out.push({grp:W.group.any});out.push({s:B3_SKILLS.pick_me_up});}
  out.push({s:k.basic,basic:1});for(const s of k.priSk)out.push({s});
  out.push({grp:W.group.pocket+': '+k.sec.name});for(const s of k.secSk)out.push({s});
  return out;
}
const moves=()=>list().filter(r=>r.s).map(r=>r.s);
function cost(s){return S.free||s.slot==='basic'||s.slot==='ruckus'?0:s.pep;}
function gain(s){return s.slot==='basic'?B3_RULES.pep.basic:0;}
function whyNot(s){if(s.slot==='ruckus')return S.combo>=s.combo?null:'needs '+s.combo+'% Combos';
  const p=S.mem[S.actor].pep;if(cost(s)>p)return fill(W.needMore,{n:cost(s)-p});return null;}
function startHi(){const ms=moves();if(S.rose){const r=rec();if(r)return r.id;}return (S.free?ms[0]:KIT[S.actor].basic).id;}
function rec(){let best=null,bd=-1;for(const s of moves()){if(whyNot(s))continue;const k=aimKind(s);if(k!=='foe'&&k!=='all')continue;
  const d=liveFoes().reduce((a,f)=>{const c=fcFoe(s,f);return Math.max(a,c.dmg*(c.peeve?1.4:1));},0);if(d>bd){bd=d;best=s;}}return best;}

// ---------------------------------------------------------------- forecasts (sample numbers; the game uses b3Preview)
const liveFoes=()=>S.foes.filter(f=>!f.out);
const foeBy=k=>S.foes.find(f=>f.key===k);
function basePower(s){let p=s.power&&DMG[s.power]?DMG[s.power]:0;if(!p){const d=(s.effects||[]).find(e=>e.op==='damage'&&e.power)||((s.effects||[]).find(e=>e.op==='later')||{effects:[]}).effects.find(e=>e.op==='damage'&&e.power);if(d)p=DMG[d.power]||0;}return p;}
function fcFoe(s,f){
  const F=B3_FOES[f.id],fl=flavs(s).filter(x=>x!=='support'),k=aimKind(s),o={dmg:0,peeve:false,resist:false,pips:0,brk:false,ko:false,push:0,cancel:false,leaves:[]};
  const b=basePower(s);
  if(b){o.peeve=fl.some(x=>(F.peeves||[]).includes(x));o.resist=!o.peeve&&fl.some(x=>(F.resists||[]).includes(x));
    let d=b*Math.max(1,s.hits||1);if(k==='all'||s.target==='foe_row')d*=B3_RULES.aoeShare;if(k==='random')d=b;
    if(o.peeve)d*=B3_RULES.peeve;if(o.resist)d*=B3_RULES.resist;if(f.flu)d*=1+B3_RULES.composure.flusteredTaken;
    if(f.row==='back'&&fl.includes('clobber')&&k==='foe')d*=1-B3_RULES.backRowClobber;if(s.slot==='ruckus'&&s.id==='ruckus_double')d*=1.5;
    o.dmg=Math.round(d);o.ko=o.dmg>=f.hp;}
  if(f.maxPips&&!f.flu){let p=(o.peeve?1:0)+(typeof s.composure==='number'?s.composure:0);for(const e of s.effects||[])if(e.op==='composure'&&!e.when)p+=e.n;
    p=Math.min(p,s.id==='ruckus_full'?4:3,f.pips);o.pips=p;o.brk=p>0&&p>=f.pips;}
  for(const e of s.effects||[]){if(e.op==='push'&&e.to==='target')o.push=e.n;if(e.op==='interrupt'&&f.wind)o.cancel=true;
    if(e.op==='status'&&e.to==='target'&&B3_STATUS[e.id])o.leaves.push(B3_STATUS[e.id].name);}
  return o;
}
function fcMem(s,m){const o=[];if(!s)return o;
  for(const e of s.effects||[]){const to=e.to||'target';if(!(to==='target'||to==='allies'))continue;
    if(e.op==='heal'&&!m.ko){const p=typeof e.pct==='number'?e.pct:(PCT[e.pct]||.1);const n=Math.min(m.max-m.hp,Math.round(m.max*p));o.push(['good',n>0?fill(W.heal,{n}):W.fullHp]);}
    if(e.op==='shield'&&!m.ko&&e.pct)o.push(['good',fill(W.shield,{n:Math.round(m.max*e.pct)})]);
    if(e.op==='revive'&&m.ko)o.push(['good',W.revive]);
    if(e.op==='cleanse'&&m.st.length)o.push(['good','Clears '+m.st.map(x=>B3_STATUS[x]?B3_STATUS[x].name:x).join(', ')]);
    if(e.op==='place')o.push(['gold','Goes right after '+B3_CAST[S.actor].name]);
    if(e.op==='grant')o.push(['gold','Uses a Skill now, free']);
    if(e.op==='pep'&&to==='target')o.push(['good','+'+e.n+' Pep']);
    if(e.op==='status'&&to==='allies'&&B3_STATUS[e.id]&&S.det)o.push(['good',B3_STATUS[e.id].name]);
  }
  return o;}
// where the acting member lands on the turn bar after this move: a Basic waits 80 ticks, a Skill 100, a Capstone 120 (B3_RULES.recovery), so a Basic comes back one place sooner
function landing(s){const n=S.turn.length;return s.slot==='basic'||s.slot==='ruckus'?n-1:s.slot==='cap'?n+1:n;}

// ---------------------------------------------------------------- aim
function defaultAim(s){const k=aimKind(s);
  if(k==='foe'){const live=liveFoes(),pf=live.find(f=>fcFoe(s,f).peeve),last=S.lastFoe&&live.find(f=>f.key===S.lastFoe);return {k:'foe',key:(pf||last||live.find(f=>f.row==='front')||live[0]).key};}
  if(k==='mem'||k==='pair'){const self=s.target==='family'||s.target==='family_or_ko',c=S.party.filter(id=>(s.target==='family_or_ko'||!S.mem[id].ko)&&(self||id!==S.actor));
    c.sort((a,b)=>S.mem[a].hp/S.mem[a].max-S.mem[b].hp/S.mem[b].max);return {k,id:c[0]};}
  if(k==='ko'){return {k:'mem',id:S.party.find(id=>S.mem[id].ko)};}
  return {k};}
function aimedFoes(){if(!S.hi||S.phase!=='turn')return [];const s=sk(S.hi),k=aimKind(s);
  if(k==='foe'&&S.aim&&S.aim.key)return [foeBy(S.aim.key)];if(k==='all'||k==='random')return liveFoes();return [];}
function aimedMems(){if(!S.hi||S.phase!=='turn')return [];const s=sk(S.hi),k=aimKind(s);
  if((k==='mem'||k==='ko')&&S.aim&&S.aim.id)return [S.aim.id];if(k==='family')return S.party.filter(id=>!S.mem[id].ko);if(k==='self')return [S.actor];
  if(k==='near'){const i=S.party.indexOf(S.actor);return [S.party[i-1],S.party[i+1]].filter(Boolean);}
  if(k==='pair'&&S.aim){const i=S.party.indexOf(S.aim.id);return [S.aim.id,S.party[i+1]||S.party[i-1]];}
  return [];}
function plateFoe(){if(S.look&&S.look.f)return foeBy(S.look.f);const a=aimedFoes();if(a.length===1)return a[0];
  if(S.lastFoe&&foeBy(S.lastFoe)&&!foeBy(S.lastFoe).out)return foeBy(S.lastFoe);return liveFoes()[0]||S.foes[0];}

// ---------------------------------------------------------------- geometry
const ratio={};
function safe(){const q=(Q.get('safe')||'').split(',').map(Number);const pr=$('probe'),cs=getComputedStyle(pr);
  const env=[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft].map(parseFloat);
  return q.length===4&&q.every(n=>!isNaN(n))?{t:q[0],r:q[1],b:q[2],l:q[3]}:{t:env[0]||0,r:env[1]||0,b:env[2]||0,l:env[3]||0};}
// Where everyone stands is the game's own battle screen (engine/b3-play.js, engine/battle-state.js): a 576 x 324 field. The family stands on
// BATTLE_POS (a diagonal, slot 0 up and left, the last slot down and right; a Back row member 14 further right), the monsters on b3LayoutFoes's
// spots (the Front row in a column near the middle, the Back row in a column behind it on the left, a boss drawn 2.5 times). The mock maps that
// field onto the screen as large as it fits above the party row, and lays the controls over it.
const POS={1:[[150,90]],2:[[140,84],[162,97]],3:[[142,84],[157,94],[172,104]],4:[[139,80],[150,89],[161,98],[172,106]]};   // BATTLE_POS1..4 (x3 = field units)
const FAM_H={grace:122,tom:134,rose:92,deedee:128,tnb:134,nara:94};   // standing height on the field, measured from the game's battle frames (Battle Lab NEW 6, NEW 8)
const FOE_FX={1:[168],2:[184,156],3:[188,158,188]},FOE_FY={1:[264],2:[224,302],3:[218,262,306]},FOE_BX={1:[84],2:[92,70]},FOE_BY={1:[236],2:[214,268]};
const FOE_WANT=[0,96,80,68,60,60],FOE_SIZE={bigone:2.5},FOE_HOVER={skeeter:14};
const STEP=16;   // the acting member takes one step toward the monsters (section 7 row 1); nobody else moves
function geo(){
  const Wd=innerWidth,H=innerHeight,sf=safe(),up=H>Wd,short=!up&&H<500,big=!up&&Wd>=1200&&H>=760,pad=8,gap=6;
  const g={W:Wd,H,up,short,big,pad,gap,sf,x0:sf.l+pad,x1:Wd-sf.r-pad,y0:sf.t+pad,y1:H-sf.b-pad};
  const field=(x,y,w,h)=>{const s=Math.min(w/576,h/324);g.cv={s,x:x+(w-576*s)/2,y:y+h-324*s};};
  if(up){
    g.scene={x:0,y:sf.t,w:Wd,h:Math.round(Wd/2)};g.TB=44;
    g.turns={x:g.x0,y:sf.t+6,w:Wd-2*pad-sf.l-sf.r-118,h:g.TB};g.tools={r:g.x1,y:sf.t+6};
    const below=g.scene.y+g.scene.h+gap;g.plate={x:g.x0,y:below,w:g.x1-g.x0,h:98};
    g.two=Wd<420;g.cards={x:g.x0,y:g.plate.y+g.plate.h+gap,w:g.x1-g.x0,h:g.two?110:54};g.combo={x:g.x0,y:g.cards.y+g.cards.h+gap,w:g.x1-g.x0,h:42};
    g.sheet={x:sf.l,y:g.combo.y+g.combo.h+gap,w:Wd-sf.l-sf.r,h:H-sf.b-(g.combo.y+g.combo.h+gap)};
    field(0,g.scene.y+g.TB,Wd,g.scene.h-g.TB-2);g.strips=false;return g;}
  const TB=short?44:big?58:52,PC=short?50:big?70:64,CB=short?50:big?50:46,PH=short?96:big?142:128;
  g.scene={x:0,y:0,w:Wd,h:H};g.TB=TB;g.turns={x:g.x0+8,y:g.y0+3,h:TB-6};g.tools={r:g.x1,y:g.y0};
  const PW=Math.min((g.x1-g.x0)*(short?.3:.38),short?260:big?420:350);
  g.plate={x:g.x0,y:g.y1-PH,w:PW,h:PH};g.MZ=g.x0+PW;
  if(short){const CW=Math.min(250,(g.x1-g.x0)*.33);g.combo={x:g.x0,y:g.y1-PC,w:CW,h:PC};g.cards={x:g.x0+CW+gap,y:g.y1-PC,w:g.x1-g.x0-CW-gap,h:PC};
    g.plate={x:g.x0,y:g.cards.y-gap-PH,w:PW,h:PH};g.comboTop=false;}
  else{g.cards={x:g.MZ+gap,y:g.y1-PC,w:g.x1-g.MZ-gap,h:PC};g.combo={x:0,y:g.y0,w:0,h:CB};g.comboTop=true;}   // Combos sits in the top line, between the turn bar and the tools
  field(g.x0,g.y0,g.x1-g.x0,g.cards.y-4-g.y0);   // the field stands on the party row: every foot stays in view
  g.lane={y:g.y0+TB+gap+6,b:g.cards.y-gap};g.strips=true;
  g.turns.w=g.x1-g.x0-16-(Q.has('bare')?250:400)*(big?1.1:short?.88:1);
  return g;}
function laneLeft(g){let lx=g.x0;const op=foePos(g);for(const f of S.foes){if(f.out)continue;const p=op[f.key];lx=Math.max(lx,p.x+p.w);}
  for(const e of document.querySelectorAll('.ms'))lx=Math.max(lx,e.getBoundingClientRect().right);return lx+10;}
const F2S=(g,x,y)=>({x:g.cv.x+x*g.cv.s,y:g.cv.y+y*g.cv.s});
function famPos(g){const out={},n=S.party.length,T=POS[Math.min(4,n)];
  S.party.forEach((id,i)=>{const back=B3_RULES.rowByLean[B3_VIBES[KIT[id].pri.id].lean]==='back';
    let fx=T[i][0]*3+(back?14:0);const fb=T[i][1]*3;if(id===S.actor&&S.phase==='turn')fx-=STEP;
    const h=FAM_H[id]*g.cv.s,w=h*(ratio[id]||.4),p=F2S(g,fx,fb);out[id]={x:p.x-w/2,y:p.y-h,w,h,cx:p.x,feet:p.y,back};});return out;}
function foePos(g){const out={},F=S.foes,fr=F.filter(f=>f.row!=='back'),bk=F.filter(f=>f.row==='back'),want=FOE_WANT[Math.min(5,F.length)];
  const put=(f,fx,fy,k)=>{const fw=want*k*(FOE_SIZE[f.id]||1),r=ratio[f.id]||1,w=fw*g.cv.s,h=w/r,hov=(FOE_HOVER[f.id]||0)*g.cv.s,p=F2S(g,fx,fy);
    out[f.key]={x:p.x-w/2,y:p.y-h-hov,w,h,cx:p.x,feet:p.y-hov,slot:w,ground:p.y};};
  fr.forEach((f,k)=>put(f,(FOE_FX[fr.length]||FOE_FX[3])[k%3],(FOE_FY[fr.length]||FOE_FY[3])[k%3],1));
  bk.forEach((f,k)=>put(f,(FOE_BX[bk.length]||FOE_BX[2])[k%2],(FOE_BY[bk.length]||FOE_BY[2])[k%2],.9));
  return out;}

// ---------------------------------------------------------------- drawing helpers
function flIcon(f){const c=B3_FLAVORS[f].color;
  const g={clobber:'<path d="M3 9l3-5 3 2 3-4 1 5 3 2-4 1-1 4-3-3z"/>',sizzle:'<path d="M9 2c1 3 5 4 5 8a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-4 1-7z"/>',
    drench:'<path d="M9 2c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/>',razzle:'<path d="M9 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    racket:'<path d="M2 7h3l4-4v12l-4-4H2z"/><path d="M11 6c2 2 2 4 0 6M13 4c4 3 4 7 0 10" stroke="#3b220f" fill="none" stroke-width="1.6"/>',
    support:'<path d="M9 15C2 10 2 4 6 4c2 0 3 1 3 2 0-1 1-2 3-2 4 0 4 6-3 11z"/>'}[f];
  return `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.4" fill="${c}" stroke="#3b220f" stroke-width="1.2"/><g transform="translate(2.5 2.5) scale(.72)" fill="#3b220f">${g}</g></svg>`;}
const flChip=f=>`<span class="fl" style="background:${B3_FLAVORS[f].color}66">${flIcon(f)}${B3_FLAVORS[f].name}</span>`;
const face=id=>`battle-story/face-${id}.webp`;
const stName=id=>B3_STATUS[id]?B3_STATUS[id].name:id;
function hpBar(u){const r=u.max?u.hp/u.max:0;return `<div class="hp${r<=B3_RULES.lowHp?' low':''}"><u style="width:${Math.max(0,100*r)}%"></u></div>`;}
function pipsHtml(f,go){let h='<span class="pips">';for(let i=0;i<f.maxPips;i++){const live=i<f.pips;h+=`<i class="pip${live?'':' gone'}${live&&go&&i>=f.pips-go?' go':''}"></i>`;}return h+'</span>';}
function stChip(id){const s=B3_STATUS[id];if(!s)return '';const bad=s.kind==='debuff'||s.kind==='mark';const t=S.det&&s.dur?`${s.name}, ${s.dur.n} ${s.dur.unit==='turn'?'turns':'rounds'}`:s.name;return `<span class="sc${bad?' bad':s.kind==='buff'||s.kind==='stance'?' good':''}">${esc(t)}</span>`;}

// ---------------------------------------------------------------- render
function render(full){
  const g=geo(),app=$('app');S.g=g;
  app.classList.toggle('up',g.up);app.classList.toggle('two',!!g.two);app.classList.toggle('short',g.short);app.classList.toggle('big',g.big);app.classList.toggle('det',S.det);app.classList.toggle('rose',S.rose);
  app.style.setProperty('--k',g.big?1.12:g.short?.94:1);
  const sc=$('scene');Object.assign(sc.style,{left:g.scene.x+'px',top:g.scene.y+'px',width:g.scene.w+'px',height:g.scene.h+'px'});
  if($('bg').dataset.bg!==S.bg){$('bg').src=BGS[S.bg][0];$('bg').dataset.bg=S.bg;}
  renderUnits(g);renderTurns(g);renderTools(g);renderStrips(g);renderPlate(g);renderCombo(g);renderCards(g);renderCaption(g);renderEnd(g);renderSheet(g);renderMock();
  if(S.phase==='turn')showBar(full?'none':null);else{$('bar').className='pn';$('shade').classList.remove('on');}
}
function place(el,r){Object.assign(el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});}
function renderUnits(g){
  const box=$('units'),fp=famPos(g),op=foePos(g),sc=g.scene;let h='';
  const am=aimedMems(),af=aimedFoes(),s=S.hi?sk(S.hi):null;
  for(const f of S.foes){if(f.out)continue;const p=op[f.key];
    h+=`<div class="u foe" data-foe="${f.key}" style="left:${p.x-sc.x}px;top:${p.y-sc.y}px;width:${p.w}px;height:${p.h}px;z-index:${Math.round(p.feet)}"><img src="battle-story/${f.id}.webp" alt="${esc(B3_FOES[f.id].name)}"></div>`;
    if(af.includes(f)){const rw=Math.min(p.w*.8,p.slot*.9);h+=`<div class="ring${af.length>1?' dash':''}" style="left:${p.cx-rw/2-sc.x}px;top:${p.feet-11-sc.y}px;width:${rw}px;height:22px;z-index:${Math.round(p.feet)-1}"></div>`;
      if(af.length===1)h+=`<div class="arrow" style="left:${p.cx-sc.x}px;top:${p.y-28-sc.y}px;z-index:900"></div>`;}
    if(f.flu)h+=`<div class="stars" style="left:${p.cx-sc.x}px;top:${p.y-6-sc.y}px;z-index:901"><i></i><i></i><i></i></div>`;
    if(f.wind&&S.phase!=='end'){h+=`<div class="wind" style="left:${p.x-sc.x}px;top:${p.y+4-sc.y}px;z-index:902">Winding up: <b>${esc(f.wind.name)}</b></div>`;}
    if(g.up||(g.short&&S.foes.length>1)){const c=af.length>1&&s?fcFoe(s,f):null;h+=`<span class="ulet" style="left:${p.x+2-sc.x}px;top:${p.y+p.h*.35-sc.y}px;z-index:903"><span class="lt">${f.key}</span>${c&&g.up&&c.dmg?`<span class="dm${c.peeve?' pv':''}">${c.dmg}</span>`:''}</span>`;}
  }
  if(s&&S.phase==='turn'&&aimKind(s)==='floor'){const ps=Object.values(op),l=Math.min(...ps.map(p=>p.x))-10,r=Math.max(...ps.map(p=>p.x+p.w))+10,fe=ps.map(p=>p.ground),top=Math.min(...fe)-18,bot=Math.max(...fe)+14;
    h+=`<div class="floor" style="left:${l-sc.x}px;top:${top-sc.y}px;width:${r-l}px;height:${Math.max(40,bot-top)}px;z-index:5"></div><span class="flab" style="left:${(l+r)/2-sc.x}px;top:${(top+bot)/2-sc.y}px">${esc(s.name)} goes here</span>`;}
  for(const id of S.party){const p=fp[id],m=S.mem[id];
    h+=`<div class="u mem${m.ko?' ko':''}" id="fig-${id}" data-mem="${id}" style="left:${p.x-sc.x}px;top:${p.y-sc.y}px;width:${p.w}px;height:${p.h}px;z-index:${Math.round(p.feet)+(id===S.actor?50:0)}"><img src="battle-story/${id}.webp" alt="${esc(B3_CAST[id].name)}"></div>`;
    if(id===S.actor&&S.phase==='turn'&&!am.includes(id)){const rw=p.w*.85;h+=`<div class="ring act" style="left:${p.cx-rw/2-sc.x}px;top:${p.feet-8-sc.y}px;width:${rw}px;height:16px;z-index:${Math.round(p.feet)-1}"></div>`;}
    if(am.includes(id)){const rw=p.w*.9;h+=`<div class="ring ally" style="left:${p.cx-rw/2-sc.x}px;top:${p.feet-9-sc.y}px;width:${rw}px;height:18px;z-index:${Math.round(p.feet)-1}"></div>`;
      if(am.length===1&&id!==S.actor)h+=`<div class="arrow" style="left:${p.cx-sc.x}px;top:${(m.ko?p.feet-50:p.y-26)-sc.y}px;z-index:900"></div>`;}}
  for(const pp of S.pops){const at=pp.at[0]==='f'?op[pp.at.slice(2)]:fp[pp.at.slice(2)];if(!at)continue;
    h+=`<div class="pop${pp.heal?' heal':''}${S.state==='playing'?' stay':''}" style="left:${at.cx-20-sc.x}px;top:${at.y+at.h*.25-sc.y}px;z-index:950">${esc(pp.t)}</div>`;}
  box.innerHTML=h;
}
function renderTurns(g){
  const el=$('turns');el.className='pn';el.style.display=S.phase==='end'?'none':'';const n=g.up?7:g.short?6:g.big?9:7;
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null;let toks=S.turn.concat(S.turn,S.turn).slice(0,n+2).map(t=>({t}));
  if(S.phase==='end')toks=[];
  if(s){const land=landing(s),again=toks.findIndex((x,j)=>j>0&&x.t==='m:'+S.actor);if(again>0)toks.splice(again,1);toks.splice(Math.min(land,toks.length),0,{t:'m:'+S.actor,ghost:1});
    const af=aimedFoes();for(const f of af){const c=fcFoe(s,f);if(c.push){const i=toks.findIndex((x,j)=>j>0&&!x.ghost&&x.t==='f:'+f.key);if(i>0){const [x]=toks.splice(i,1);x.pushed=1;toks.splice(Math.min(i+2,toks.length),0,x);}}}
    }
  toks=toks.slice(0,n);
  let h='<i class="roll l"></i>';
  toks.forEach((x,i)=>{if(i===S.roundAt&&!x.ghost)h+=`<span class="rnd">Round<b>${S.round+1}</b></span>`;
    const isF=x.t[0]==='f',id=x.t.slice(2),u=isF?foeBy(id):S.mem[id];if(!u)return;
    const img=isF?face(u.id):face(id),alt=isF?B3_FOES[u.id].name:B3_CAST[id].name;
    const bd=isF&&u.wind?'<span class="bd">!</span>':isF&&u.flu?'<span class="bd f">F</span>':'';
    h+=`<span class="tf${i===0?' now':''}${isF?' foe':''}${x.ghost?' ghost':''}${x.pushed?' pushed':''}${!isF&&u.ko?' ko':''}"><img src="${img}" alt="${esc(alt)}">${bd}</span>`;
    if(x.pushed)h+='<span class="tl">pushed back</span>';});
  if(!toks.length)h+=`<span class="rnd">Round<b>${S.round}</b></span>`;
  el.innerHTML=h+'<i class="roll r"></i>';
  el.style.left=g.turns.x+'px';el.style.top=g.turns.y+'px';el.style.height=g.turns.h+'px';el.style.width='auto';el.style.maxWidth=g.turns.w+'px';
}
function renderTools(g){
  const el=$('tools');el.style.right=(g.W-g.tools.r)+'px';el.style.top=g.tools.y+(g.up?0:-2)+'px';
  const mock=Q.has('bare')?'':`<button class="tb pn mock" type="button" data-mock="1">Mock states</button>`;
  el.innerHTML=mock+(g.up?'':`<button class="tb pn" type="button" data-det="1"><i class="str"></i>${W.details}<span class="tg${S.det?' on':''}"></span></button><button class="tb pn" type="button" data-speed="1"><i class="str"></i>${S.speed}x</button>`)
    +`<a class="tb pn" href="admin.html"><i class="str"></i>${W.exit}</a>`;
  if(g.up){el.innerHTML=mock+`<button class="tb pn" type="button" data-det="1">${W.details}<span class="tg${S.det?' on':''}"></span></button>`;}
}
function renderStrips(g){
  const box=$('strips');let h='';const op=foePos(g),s=S.hi&&S.phase==='turn'?sk(S.hi):null,k=s?aimKind(s):null,pf=plateFoe(),af=aimedFoes();
  if(g.strips&&S.foes.length>1&&S.phase!=='end')for(const f of S.foes){if(f.out)continue;const p=op[f.key];const main=pf===f&&af.length<=1;if(main)continue;
    const F=B3_FOES[f.id],tgt=af.includes(f),w=S.foes.length>=4?118:Math.max(124,Math.min(170,p.w*.8)),c=tgt&&s?fcFoe(s,f):null;
    const fc=c&&c.dmg?`<span class="dm${c.peeve?' pv':''}">${c.dmg}</span>`:'';
    const hpLine=`<div class="ln">${hpBar(f)}${fc}</div>`+(f.maxPips?`<div class="ln">${f.flu?'<span class="sc bad">Flustered</span>':pipsHtml(f,c?c.pips:0)}</div>`:'');
    const pe=g.short||S.foes.length>=4?'':`<div class="ln">${(F.peeves||[]).map(flChip).join('')}</div>`;
    h+=`<div class="ms pn${tgt?' tgt':''}" data-foe="${f.key}" style="left:${Math.max(g.x0,p.cx-w/2)}px;top:${p.ground+3}px;width:${w}px"><div class="nm"><span class="lt">${f.key}</span><span class="nt">${esc(F.name)}</span></div>${hpLine}${pe}${f.st.length&&S.det&&!g.short?`<div class="ln">${f.st.map(stChip).join('')}</div>`:''}</div>`;}
  box.innerHTML=h;
}
function renderPlate(g){
  const el=$('plate');if(S.phase==='end'){el.style.display='none';return;}el.style.display='';
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null,k=s?aimKind(s):null,af=aimedFoes();let h='';
  if(s&&(k==='all'||k==='random')&&af.length>1){
    const cs=af.map(f=>fcFoe(s,f)),ds=cs.map(c=>c.dmg),lo=Math.min(...ds),hi=Math.max(...ds),np=cs.filter(c=>c.peeve).length;
    h=`<div class="top"><span>${k==='all'?'Every monster':'Random monsters'}</span></div><div class="rw">${k==='random'?esc(s.hits+' hops, each on a random monster'):g.up?'Each monster shows its own damage.':'Each strip shows its own damage.'}</div>`
     +`<div class="rw">${np?`<span class="sc gold">Pet Peeve on ${np} of ${af.length}</span>`:''}</div>`
     +`<div class="fc"><div class="dring${lo===hi?'':' rng'}"><b>${lo===hi?lo:lo+'–'+hi}</b><span>each</span></div></div>`;
    el.className='pn orn pl';el.innerHTML=h;placePlate(el,g);return;}
  const f=plateFoe();if(!f){el.style.display='none';return;}const F=B3_FOES[f.id];
  const c=s&&af.length===1&&af[0]===f?fcFoe(s,f):null;
  const back=f.row==='back'&&S.foes.length>1?`<span class="sc">${W.backRow}</span>`:'',hpTxt=`${f.hp}${S.det?' / '+f.max:''} HP`;
  if(g.short)h+=`<div class="top tl1"><span class="lt">${f.key}</span><span>${esc(F.name)}</span>${hpBar(f)}<b class="hpt">${f.hp} HP</b></div>`;
  else h+=`<div class="top"><span class="lt">${f.key}</span><span>${esc(F.name)}</span>${back}</div><div class="hl">${hpBar(f)}<b>${hpTxt}</b></div>`;
  const pipRow=f.maxPips?(f.flu?`<span class="sc bad">Flustered: takes 35% more</span>`:`<span class="lab">Composure</span>${pipsHtml(f,c?c.pips:0)}`):'';
  h+=`<div class="rw">${pipRow}${f.st.map(stChip).join('')}</div>`;
  h+=`<div class="rw"><span class="lab">${(F.peeves||[]).length?W.peeves:W.noPeeves}</span>${(F.peeves||[]).map(flChip).join('')}${(F.resists||[]).map(r=>`<span class="sc bad">${fill(W.resist,{flavor:B3_FLAVORS[r].name})}</span>`).join('')}</div>`;
  if(g.short){const parts=h.split('<div class="rw">');if(parts.length===3)h=parts[0]+'<div class="rw">'+parts[1].replace(/<\/div>$/,'')+parts[2];}
  if(c&&(c.dmg||c.cancel||c.push)){
    h+=`<div class="fc"><div class="dring"><b>${c.dmg}</b><span>damage</span></div></div>`;
    const tags=[];if(c.peeve)tags.push(['gold','1.5x '+W.peeveTag]);if(c.resist)tags.push(['bad',fill(W.resist,{flavor:flavWord(s)})]);if(c.ko)tags.push(['gold',W.ko]);if(c.brk)tags.push(['gold',W.brk]);
    if(c.cancel)tags.push(['good',fill(W.cancels,{name:f.wind.name})]);if(c.pips&&S.det&&!c.brk)tags.push(['',fill(W.pips,{n:c.pips,left:f.pips-c.pips})]);
    if(S.det)for(const l of c.leaves)tags.push(['','Leaves '+l]);
    if(tags.length)h+=`<div class="fcl">${tags.map(t=>`<span class="sc ${t[0]}">${esc(t[1])}</span>`).join('')}</div>`;}
  if(S.look&&S.look.f===f.key&&s&&!af.includes(f))h+=`<div class="note">${W.noAim}. Tap here for ${W.fullList}.</div>`;
  else if(s&&S.phase==='turn'&&k==='foe'&&liveFoes().length>1&&!S.det)h+='';
  el.className='pn orn pl';el.dataset.foe=f.key;el.innerHTML=h;placePlate(el,g);
}
function plateRect(g){const r=g.plate;if(g.up||g.short)return r;const op=foePos(g),hit=Object.values(op).some(p=>p.x<r.x+r.w&&p.x+p.w>r.x&&p.y+p.h>r.y+12);
  return hit?Object.assign({},r,{y:g.y0+g.TB+g.gap+4,top:true}):r;}
function placePlate(el,g){const r=plateRect(g);el.style.left=r.x+'px';el.style.width=r.w+'px';el.style.height='auto';el.style.top='0px';
  const hh=el.offsetHeight;el.style.top=(g.up||r.top?r.y:Math.max(g.y0+g.TB+gap6(),r.y+r.h-hh))+'px';}
const gap6=()=>6;
function renderCombo(g){
  const el=$('combo');if(S.phase==='end'){el.style.display='none';return;}el.style.display='';el.className='pn'+(S.combo>=100?' full':'');
  const c=S.combo,trk=`<div class="trk"><u style="width:${c}%"></u><s style="left:50%"></s></div>`;el.classList.toggle('cmp',g.up||g.short);
  el.innerHTML=(g.up||g.short?`<div class="ct">${W.combos} ${c}%${trk}</div><div class="mk2"><span class="${c>=50?'on':''}">Double Team</span><span class="${c>=100?'on':''}">Family Ruckus</span></div>`
    :`<div class="ct">${W.combos} ${c}%</div>${trk}<div class="mk"><span class="r${c>=50?' on':''}" style="left:50%">50% Double Team</span><span class="r${c>=100?' on':''}" style="left:100%">100% Family Ruckus</span></div>`);
  if(g.comboTop){   // desktop: in the top line between the turn bar and the tools; the Duo: under the tools, over the sky above the family
    const tr=$('turns').getBoundingClientRect().right,tl=$('tools').getBoundingClientRect().left,w=tl-tr-20;
    el.classList.add('cmp');el.innerHTML=`<div class="ct">${W.combos} ${c}%${trk}</div><div class="mk2"><span class="${c>=50?'on':''}">50% Double Team</span><span class="${c>=100?'on':''}">100% Family Ruckus</span></div>`;
    if(g.big)place(el,{x:tr+10,y:g.y0,w:Math.min(w,420),h:g.combo.h});else{const fp=famPos(g),gl=Math.min(...Object.values(fp).map(p=>p.x+p.w*.12)),ww=Math.min(320,g.x1-gl);place(el,{x:g.x1-ww,y:g.y0+g.TB+g.gap,w:ww,h:g.combo.h});}
    return;}
  place(el,g.combo);
}
function renderCards(g){
  const el=$('cards');if(S.phase==='end'){el.style.display='none';return;}el.style.display='';
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null,am=aimedMems();let h='';
  for(const id of S.party){const m=S.mem[id],now=id===S.actor&&S.phase!=='end',aim=am.includes(id);
    let p='';if(now){const sp=s?cost(s):0,gn=s?gain(s):0,after=Math.max(0,Math.min(10,m.pep-sp+gn));let pp='<span class="pp2">';
      for(let i=0;i<10;i++){const cls=i<m.pep-sp?'on':i<m.pep?'spend':i<after?'gain':'';pp+=`<i class="${cls}"></i>`;}pp+='</span>';
      p=`<div class="p">${W.pepWord} ${pp}<span>${after!==m.pep?m.pep+' → '+after:m.pep}</span></div>`;}
    else if(S.det&&!m.ko)p=`<div class="p">${W.pepWord} ${m.pep}${m.st.length?' '+m.st.map(stChip).join(''):''}</div>`;
    const chips=[];if(m.marked)chips.push(`<span class="sc bad">${W.marked}</span>`);if(m.next)chips.push(`<span class="sc bad">${W.nextTarget}</span>`);if(m.ko)chips.push(`<span class="sc bad">${W.knockedOut}</span>`);
    const fc=aim&&s?fcMem(s,m):[];
    h+=`<div class="pc pn${now?' now':''}${aim?' aim':''}${m.ko?' ko':''}" data-mem="${id}"><div class="f"><img src="${face(id)}" alt=""></div>`
      +`<div class="n">${esc(B3_CAST[id].name)}${S.det&&!g.short?`<em>${B3_RULES.rowByLean[B3_VIBES[KIT[id].pri.id].lean]==='back'?W.back:''}</em>`:''}</div>`
      +`<div class="h">${hpBar(m)}<span>${m.hp}${S.det?'/'+m.max:''}</span></div>${p}`
      +(chips.length?`<div class="ch">${chips.join('')}</div>`:'')+(fc.length?`<div class="fc2">${fc.slice(0,2).map(t=>`<span class="sc ${t[0]}">${esc(t[1])}</span>`).join(' ')}</div>`:'')+'</div>';}
  el.innerHTML=h;place(el,g.cards);
}
function renderCaption(g){
  const el=$('caption');if(S.phase!=='playing'||!S.caption){el.className='pn';return;}
  el.className='pn on';el.innerHTML=esc(S.caption)+(S.cap2?`<small>${esc(S.cap2)}</small>`:'');
  if(g.up){el.style.left=g.x0+'px';el.style.width=(g.x1-g.x0)+'px';el.style.top='0px';el.style.top=(g.scene.y+g.scene.h-el.offsetHeight-8)+'px';return;}
  const fp=famPos(g),right=Math.min(...Object.values(fp).map(p=>p.x))-10,left=Math.max(g.MZ+g.gap,laneLeft(g)),w=Math.max(220,right-left);el.style.width=w+'px';el.style.left=left+'px';el.style.top='0px';
  el.style.top=(g.cards.y-g.gap-el.offsetHeight-6)+'px';
}
function renderEnd(g){
  const el=$('endp');if(S.phase!=='end'){el.className='pn orn';return;}
  const drops=S.foes.map(f=>B3_FOES[f.id].drop).filter(Boolean);
  el.className='pn orn on';el.innerHTML=`<h3>You win!</h3>`
    +`<div class="er"><span>Everyone</span><b>+48 XP</b></div>`
    +S.party.map(id=>`<div class="er"><span>${esc(B3_CAST[id].name)}, ${esc(KIT[id].pri.name)}</span><b>+18 Vibe points</b></div>`).join('')
    +`<div class="er"><span>Found</span><b>${drops.length?drops.map(d=>d[0].toUpperCase()+d.slice(1)).join(', '):'Nothing this time'}</b></div>`
    +`<button class="cont" type="button" data-cont="1">${W.cont}</button>`;
  const w=Math.min(380,g.W-2*g.pad-g.sf.l-g.sf.r);el.style.width=w+'px';el.style.left=(g.W/2-w/2)+'px';el.style.top='0px';
  el.style.top=Math.max(g.y0,(g.H-el.offsetHeight)/2)+'px';
}
function renderSheet(g){const el=$('sheet');if(!S.sheet){el.className='pn';return;}
  const x=S.sheet;let h='';
  if(x.f){const f=foeBy(x.f),F=B3_FOES[f.id];h=`<h4>${esc(F.name)}</h4><div class="er"><span>HP</span><b>${f.hp} / ${f.max}</b></div><div class="er"><span>Composure</span><b>${f.pips} of ${f.maxPips}</b></div>`
    +`<div class="er"><span>${W.peeves}</span><b>${(F.peeves||[]).map(p=>B3_FLAVORS[p].name).join(', ')||'None'}</b></div><div class="er"><span>Row</span><b>${f.row==='back'?'Back':'Front'}</b></div>`
    +f.st.map(id=>`<div class="er"><span>${esc(stName(id))}</span><b style="white-space:normal;font-weight:500">${esc((B3_STATUS[id]||{}).desc||'')}</b></div>`).join('');}
  else{const m=S.mem[x.m];h=`<h4>${esc(B3_CAST[x.m].name)}</h4><div class="er"><span>HP</span><b>${m.hp} / ${m.max}</b></div><div class="er"><span>Pep</span><b>${m.pep} of 10</b></div>`
    +`<div class="er"><span>Primary</span><b>${esc(KIT[x.m].pri.name)}</b></div><div class="er"><span>Secondary</span><b>${esc(KIT[x.m].sec.name)}</b></div>`
    +m.st.map(id=>`<div class="er"><span>${esc(stName(id))}</span><b style="white-space:normal;font-weight:500">${esc((B3_STATUS[id]||{}).desc||'')}</b></div>`).join('');}
  el.className='pn orn on';el.innerHTML=h+`<button class="cont" type="button" data-close="1">${W.close}</button>`;
  const w=Math.min(360,g.W-40);el.style.width=w+'px';el.style.left=(g.up?g.W/2-w/2:g.MZ+g.gap)+'px';el.style.top='0px';el.style.top=Math.max(g.y0+50,(g.H-el.offsetHeight)/2)+'px';
}

// ---------------------------------------------------------------- the bar
function rowHtml(r){
  const s=r.s,hi=S.hi===s.id,why=whyNot(s),k=aimKind(s),fl=flavs(s),af=aimedFoes();
  let peeve=false,resist=false;
  if(hi&&af.length){peeve=af.some(f=>fcFoe(s,f).peeve);resist=!peeve&&af.length===1&&fcFoe(s,af[0]).resist;}
  else if(basePower(s))peeve=liveFoes().some(f=>fcFoe(s,f).peeve);
  const price=r.free?`<span class="pp free">${W.free}</span>`:s.slot==='basic'?`<span class="pp gain">+${gain(s)} ${W.pepWord}</span>`:s.slot==='ruckus'?`<span class="pp combo">${s.combo}% ${W.combos}</span>`:`<span class="pp">${s.pep} ${W.pepWord}</span>`;
  const tags=(peeve?`<span class="tag">${W.peeveTag}</span>`:'')+(resist?`<span class="tag">${fill(W.resist,{flavor:''}).trim()}</span>`:'')+(S.rose&&rec()&&rec().id===s.id?`<span class="tag rec">${W.recTag}</span>`:'');
  const ic=S.rose?`<span class="em">${fl.map(f=>EMO[f]).join('')}</span>`:flIcon(fl[0]||'support');
  const line=hi?(S.det?s.desc:s.short):s.short;
  const use=hi?`<button class="use" type="button" data-use="${s.id}"${why&&S.phase==='turn'?' disabled':''}>${why?esc(why[0].toUpperCase()+why.slice(1)):`${W.use}<small>${S.keys?W.useKey:W.useTap}</small>`}</button>`:'';
  return `<div class="row${hi?' hi':''}${why?' poor':''}${r.basic?' basic':''}${s.slot==='ruckus'?' combo':''}${r.free?' free':''}" data-sk="${s.id}" role="button" aria-pressed="${hi}">`
    +(r.basic?'<span class="bt">Basic</span>':'')
    +`<span class="ic">${ic}</span><span class="nm">${esc(s.name)}</span>`
    +`<span class="l2"><span class="kd">${s.slot==='ruckus'?esc(kindWord(s)):esc(flavWord(s))+' '+esc(kindWord(s))}</span><span class="rt">${tags}${price}</span></span>`
    +(why&&!hi?`<span class="why">${esc(why)}</span>`:'')+`<span class="ln1">${esc(line||'')}</span>`+use+'</div>';
}
function barHtml(){const k=KIT[S.actor],L=list();let h='<i class="tail"></i>';
  h+=`<div class="ribbon">${esc(k.name)}${S.det?`<small>${esc(k.pri.name)}</small>`:''}</div><div class="scr">`;
  for(const r of L){if(r.grp)h+=`<div class="grp${r.free?' free':''}">${esc(r.grp)}</div>`;else h+=rowHtml(r);}
  return h+'</div>'+(S.keys&&!S.g.up?'<div class="keys">Up and down: move. Left and right: aim. Enter: use.</div>':'');}
function showBar(slide){
  const bar=$('bar'),g=S.g;const wasShown=bar.classList.contains('show');
  bar.innerHTML=barHtml();bar.className='pn orn';bar.style.display='flex';bar.style.visibility='hidden';
  const scr=bar.querySelector('.scr');
  if(g.up){const r=g.sheet;Object.assign(bar.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',maxHeight:''});bar.classList.add('up-sheet');
    scr.style.maxHeight=(r.h-bar.querySelector('.ribbon').offsetHeight-20)+'px';}
  else{const all=famPos(g),fp=all[S.actor],bw=g.short?250:g.big?340:290,minW=g.short?220:236;
    // the family stands in a diagonal with no gap, so the bar opens left of the whole group (never between two members), level with the acting member
    const right=Math.min(...Object.values(all).map(p=>p.x+p.w*.12))-14,lx=laneLeft(g);g.laneX=lx;
    let left,width,top,above=false;width=Math.max(minW,Math.min(bw,right-lx));left=right-width;
    bar.classList.toggle('narrow',width<262);Object.assign(bar.style,{left:left+'px',width:width+'px',height:'auto',top:'0px'});
    const laneH=g.lane.b-g.lane.y;scr.style.maxHeight='none';
    let bh=bar.offsetHeight;if(bh>laneH){scr.style.maxHeight=(laneH-(bh-scr.offsetHeight))+'px';bh=bar.offsetHeight;}
    const shoulder=fp.y+Math.min(fp.h*.2,60);
    top=Math.max(g.lane.y,Math.min(g.lane.b-bh,shoulder-46));bar.style.top=top+'px';
    bar.classList.toggle('up',above);bar.classList.toggle('narrow',width<262);
    if(above)bar.style.setProperty('--tailx',(fp.cx-left)+'px');else bar.style.setProperty('--tail',Math.max(22,Math.min(bh-22,shoulder-top))+'px');
    const sh=$('shade');Object.assign(sh.style,{left:(left-40)+'px',top:(top-40)+'px',width:(width+80)+'px',height:(bh+80)+'px'});sh.classList.add('on');
    if(slide&&slide!=='none'&&S.prev){const pp=famPos(g)[S.prev];if(pp)bar.style.setProperty('--from',Math.round(pp.cx-(left+width))+'px');}else bar.style.setProperty('--from','30px');}
  const hiEl=bar.querySelector('.row.hi');
  if(hiEl&&scr&&!g.up){let bh=bar.offsetHeight;const laneH=g.lane.b-g.lane.y;if(bh>laneH&&scr.style.maxHeight==='none'){scr.style.maxHeight=(laneH-(bh-scr.offsetHeight))+'px';}}
  if(hiEl&&scr){const top=hiEl.offsetTop-scr.offsetTop,bot=top+hiEl.offsetHeight;if(bot>scr.scrollTop+scr.clientHeight)scr.scrollTop=bot-scr.clientHeight+4;if(top<scr.scrollTop)scr.scrollTop=top-4;}
  if(scr){const upd=()=>{const m=bar.querySelector('.more');const left=scr.scrollHeight-scr.clientHeight-scr.scrollTop>4;if(left&&!m){const e=document.createElement('span');e.className='more';e.textContent='More below';bar.appendChild(e);}else if(!left&&m)m.remove();};upd();scr.onscroll=upd;}
  bar.style.visibility='';bar.style.display='';
  if(slide===null&&wasShown)bar.classList.add('show-still');
  bar.classList.add('show');if(slide===null&&wasShown)bar.style.animation='none';else bar.style.animation='';
}

// ---------------------------------------------------------------- playing a turn
async function useMove(id){
  if(S.phase!=='turn')return;const s=sk(id);if(!s||whyNot(s))return;
  const a=S.actor,m=S.mem[a],k=aimKind(s),af=aimedFoes(),am=aimedMems();
  S.phase='playing';const bar=$('bar');bar.classList.remove('show');bar.style.animation='';bar.classList.add('fold');$('shade').classList.remove('on');
  await T(150);bar.className='pn';
  S.caption=`${B3_CAST[a].name} uses ${s.name}!`;S.cap2='';render();
  const fig=$('fig-'+a);if(fig){if(af.length&&basePower(s)){const p=foePos(S.g)[af[0].key],fp=famPos(S.g)[a];fig.style.setProperty('--lx',Math.round((p.cx+p.w*.3)-fp.cx)+'px');fig.classList.add('lunge');}else fig.classList.add('cast');}
  await T(360);
  m.pep=Math.max(0,Math.min(10,m.pep-cost(s)+gain(s)));if(s.slot==='ruckus')S.combo-=s.combo;else S.combo=Math.min(100,S.combo+12);
  const notes=[];S.pops=[];
  for(const f of af){const c=fcFoe(s,f);if(c.dmg){f.hp=Math.max(0,f.hp-c.dmg);S.pops.push({at:'f:'+f.key,t:'-'+c.dmg});}
    if(c.pips){f.pips=Math.max(0,f.pips-c.pips);if(f.pips===0){f.flu=true;notes.push(W.brk+' '+B3_FOES[f.id].name+' is Flustered.');}}
    if(c.peeve&&af.length===1)notes.push(fill(W.peeveTag,{})+'!');if(c.cancel){notes.push(f.wind.name+' is cancelled.');f.wind=null;for(const id of S.party)S.mem[id].marked=false;}
    if(c.push)notes.push(B3_FOES[f.id].name+' is pushed back.');}
  for(const id of am){const mm=S.mem[id];for(const t of fcMem(s,mm)){const n=parseInt(t[1].replace(/\D/g,''));if(/HP/.test(t[1])&&n){mm.hp=Math.min(mm.max,mm.hp+n);S.pops.push({at:'m:'+id,t:'+'+n,heal:1});}
    if(t[1]===W.revive){mm.ko=false;mm.hp=Math.round(mm.max*.25);}if(/^Clears/.test(t[1]))mm.st=[];}}
  if(k==='floor')notes.push(s.name+' is on the floor.');
  S.cap2=notes.slice(0,2).join(' ');S.free=null;render();
  af.forEach(f=>{const u=document.querySelector(`.u.foe[data-foe="${f.key}"]`);if(u)u.classList.add('shake');});
  await T(1100);
  for(const f of S.foes){if(f.hp<f.max*.15){f.hp=f.max;f.pips=f.maxPips;f.flu=false;}}   // the mock fight never ends: a nearly beaten monster is topped up
  S.pops=[];next(s);
}
function next(s){
  const a=S.turn.shift();S.turn.push(a);S.roundAt--;if(S.roundAt<=0){S.round++;S.roundAt=S.turn.length;}
  const t=S.turn[0];
  if(t[0]==='f'){S.prev=S.actor;foeTurn(foeBy(t.slice(2)));return;}
  S.prev=S.actor;S.actor=t.slice(2);if(S.mem[S.actor].ko){next(null);return;}
  S.phase='turn';S.look=null;S.sheet=null;S.caption='';S.hi=startHi();S.aim=defaultAim(sk(S.hi));render();showBar('slide');
}
async function foeTurn(f){
  if(!f||f.out){next(null);return;}
  const F=B3_FOES[f.id];S.phase='playing';
  let act=(F.acts||[]).find(x=>x.power>0)||{name:'a swipe'},tgt=S.party.filter(id=>!S.mem[id].ko)[0];
  if(f.wind){act={name:f.wind.name};tgt=f.wind.at;f.wind=null;S.mem[tgt].marked=false;}
  const m=S.mem[tgt],d=18;m.hp=Math.max(1,m.hp-d);S.caption=`${F.name} uses ${act.name} on ${B3_CAST[tgt].name}.`;S.cap2='';S.pops=[{at:'m:'+tgt,t:'-'+d}];render();
  const u=$('fig-'+tgt);if(u)u.classList.add('shake');
  await T(1300);S.pops=[];next(null);
}

// ---------------------------------------------------------------- input
function pick(id){if(S.phase!=='turn')return;S.look=null;S.sheet=null;if(S.hi===id)return;S.hi=id;S.aim=defaultAim(sk(id));if(S.aim.key)S.lastFoe=S.aim.key;render();}
function tapFoe(key){if(S.phase!=='turn')return;const f=foeBy(key);if(!f||f.out)return;const s=S.hi&&sk(S.hi),k=s&&aimKind(s);S.sheet=null;
  if(k==='foe'||(s&&s.target==='either')){S.aim={k:'foe',key};S.lastFoe=key;S.look=null;}else S.look={f:key};render();}
function tapMem(id){if(S.phase!=='turn')return;const s=S.hi&&sk(S.hi),k=s&&aimKind(s),m=S.mem[id];S.look=null;
  const ok=(k==='mem'&&(s.target==='family_or_ko'||!m.ko)&&(s.target!=='ally'||id!==S.actor))||(k==='ko'&&m.ko)||(k==='pair'&&!m.ko)||(s&&s.target==='either'&&!m.ko);
  if(ok){S.aim={k:k==='pair'?'pair':'mem',id};S.sheet=null;}else S.sheet={m:id};render();}
function stepAim(d){const s=S.hi&&sk(S.hi);if(!s)return;const k=aimKind(s);
  if(k==='foe'){const l=liveFoes();let i=l.findIndex(f=>f.key===(S.aim&&S.aim.key));i=(i+d+l.length)%l.length;tapFoe(l[i].key);}
  else if(k==='mem'||k==='ko'||k==='pair'){const l=S.party;let i=l.indexOf(S.aim&&S.aim.id);for(let n=0;n<l.length;n++){i=(i+d+l.length)%l.length;const before=S.aim&&S.aim.id;tapMem(l[i]);if(S.aim&&S.aim.id!==before)break;S.sheet=null;}render();}}
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('#mockp')){const b=t.closest('[data-st],[data-sw]');if(!b)return;if(b.dataset.st){S=null;setState(b.dataset.st);}else{const [k,v]=b.dataset.sw.split(':');
    if(k==='det')S.det=PREF.det=v==='1';if(k==='rose'){S.rose=PREF.rose=v==='1';if(S.phase==='turn'){S.hi=startHi();S.aim=defaultAim(sk(S.hi));}}if(k==='bg')S.bg=PREF.bg=v;render(true);}return;}
  if(t.closest('[data-mock]')){$('mockp').classList.toggle('on');renderMock();return;}
  if(t.closest('[data-det]')){S.det=PREF.det=!S.det;render(true);return;}
  if(t.closest('[data-speed]')){S.speed=PREF.speed=S.speed===1?2:1;render(true);return;}
  if(t.closest('[data-close]')){S.sheet=null;render(true);return;}
  if(t.closest('[data-cont]')){S=null;setState('start');return;}
  const u=t.closest('[data-use]');if(u){if(!u.disabled)useMove(u.dataset.use);return;}
  const r=t.closest('.row');if(r){S.keys=false;pick(r.dataset.sk);return;}
  const pl=t.closest('#plate');if(pl&&pl.dataset.foe&&S.look&&S.look.f){S.sheet={f:S.look.f};render(true);return;}
  const f=t.closest('[data-foe]');if(f){tapFoe(f.dataset.foe);return;}
  const m=t.closest('[data-mem]');if(m){tapMem(m.dataset.mem);return;}
});
document.addEventListener('keydown',e=>{if(!S||S.phase!=='turn')return;const ms=moves(),i=ms.findIndex(s=>s.id===S.hi);S.keys=true;
  if(e.key==='ArrowDown'||e.key==='s'){pick(ms[Math.min(ms.length-1,i+1)].id);e.preventDefault();}
  else if(e.key==='ArrowUp'||e.key==='w'){pick(ms[Math.max(0,i-1)].id);e.preventDefault();}
  else if(e.key==='ArrowLeft'||e.key==='a')stepAim(-1);else if(e.key==='ArrowRight'||e.key==='d')stepAim(1);
  else if(e.key==='Enter'||e.key===' '){useMove(S.hi);e.preventDefault();}else return;render();});
function renderMock(){const el=$('mockp');if(!el.classList.contains('on'))return;
  const sw=(k,v,l,on)=>`<button type="button" data-sw="${k}:${v}" class="${on?'on':''}">${l}</button>`;
  el.innerHTML=`<h4>Mock: states</h4><div class="sg">${STATES.map(s=>`<button type="button" data-st="${s.id}" class="${S.state===s.id?'on':''}">${esc(s.n)}</button>`).join('')}</div>`
    +`<h4>Details</h4><div class="sg">${sw('det',0,'Off',!S.det)}${sw('det',1,'On',S.det)}</div><h4>Rose Mode</h4><div class="sg">${sw('rose',0,'Off',!S.rose)}${sw('rose',1,'On',S.rose)}</div>`
    +`<h4>Background</h4><div class="sg">${Object.entries(BGS).map(([k,v])=>sw('bg',k,v[1],S.bg===k)).join('')}</div>`;
  const g=S.g;el.style.right=(g.W-g.x1)+'px';el.style.top=(g.y0+52)+'px';}
function startApp(){
  const ids=Object.keys(HP0).concat(['bigone','mudling','skeeter','grump','toad','log']);
  Promise.all(ids.map(id=>new Promise(r=>{const i=new Image();i.onload=()=>{ratio[id]=i.naturalWidth/i.naturalHeight;r();};i.onerror=r;i.src=`battle-story/${id}.webp`;}))).then(()=>{
    setState(Q.get('st')||'start');document.body.classList.add('ready');});
  addEventListener('resize',()=>{if(S)render(true);});
}
window.__STORY={get S(){return S},STATES,setState,useMove,pick,tapFoe,tapMem,render,geo,moves,list,fcFoe,famPos,foePos};
