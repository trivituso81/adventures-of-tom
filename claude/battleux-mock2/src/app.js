// The storybook battle screen, tappable mock (cards c-b3story and c-b3story-exact; plan claude/b3story-plan.md, "Exact to the mockup"). NOT the game: no battle engine, fixed sample numbers.
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
  const s={party,mem:m,foes:o.foes||ONE(),turn:o.turn||null,actor:o.actor||party[0],round:1,roundAt:4,combo:30,hi:null,aim:null,lastFoe:null,free:null,
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
  {id:'start',n:'One monster, Grace’s turn',d:'The Basic is highlighted when a turn opens; it is aimed already, so one tap uses it.',f(){S=base({id:'start'});}},
  {id:'tom',n:'Tom’s turn',d:'Tom’s turn: his name heads the list, his card is raised and his face leads the turn bar.',f(){S=base({id:'tom',actor:'tom'});S.mem.grace.pep=6;}},
  {id:'deedee',n:'Deedee’s turn',d:'Deedee’s turn: the list keeps its place beside the family.',f(){S=base({id:'deedee',actor:'deedee'});S.combo=42;}},
  {id:'five',n:'Five monsters (3 Front, 2 Back)',d:'Each monster has a small plate under it; the aimed one’s full plate sits bottom left.',f(){S=base({id:'five',foes:FIVE()});}},
  {id:'aim_one',n:'As in Tom’s mockup: aimed at one monster',d:'The state of Tom’s picture: Crunchy Sugar-Cube Pop highlighted, aimed at The Big One, Combos at 65%. Tap the gold banner again to use it.',f(){S=base({id:'aim_one'});S.combo=65;S.hi='crunchy_sugar_cube_pop';}},
  {id:'aim_all',n:'Aimed at every monster',d:'Open-String Violin Screech: every strip shows its own damage; the plate sums it up.',f(){S=base({id:'aim_all',foes:FIVE()});S.hi='open_string_violin_screech';}},
  {id:'aim_mem',n:'Aimed at one family member',d:'Deedee Makes It Better on Tom: the forecast sits on his card.',f(){S=base({id:'aim_mem',actor:'deedee'});S.mem.tom.hp=71;S.mem.tom.st=['drenched'];S.hi='deedee_makes_it_better';S.aim={k:'mem',id:'tom'};}},
  {id:'aim_fam',n:'Aimed at the whole family',d:'Sofa-Cushion Citadel: every card shows the shield it gets.',f(){S=base({id:'aim_fam',actor:'rose'});S.mem.rose.pep=5;S.hi='sofa_cushion_citadel';}},
  {id:'aim_floor',n:'Aimed at the floor',d:'Wet-Floor Hazard: the monsters’ floor glows where it goes; no aim needed.',f(){S=base({id:'aim_floor',actor:'deedee',foes:FIVE()});S.hi='wet_floor_hazard';}},
  {id:'windup',n:'Winding up, Rose marked',d:'The Big One glared at Rose: Swamp Chomp comes next. Crunchy Sugar-Cube Pop cancels it.',f(){S=base({id:'windup'});const b=S.foes[0];b.wind={name:'Swamp Chomp',at:'rose'};S.mem.rose.marked=true;S.mem.grace.pep=5;S.hi='crunchy_sugar_cube_pop';}},
  {id:'status',n:'Statuses, and a Flustered monster',d:'Log Lump is out of Composure (Flustered); the others carry statuses.',f(){S=base({id:'status',actor:'tom',foes:FIVE()});const f=S.foes;
    f[0].st=['drenched','windexed'];f[1].st=['dazzled'];f[2].st=['off_key'];f[4].pips=0;f[4].flu=true;f[4].st=['mossy_brace'];S.aim={k:'foe',key:'E'};S.hi='controller_toss';S.mem.tom.st=['eyes_on_me'];}},
  {id:'combo65',n:'Combos 65%: Double Team',d:'At 50% the Double Team mark under the Combo bar lights up: tap it to highlight it, tap again to use it.',f(){S=base({id:'combo65',actor:'tom'});S.combo=65;S.hi='ruckus_double';}},
  {id:'combo100',n:'Combos 100%: Family Ruckus',d:'At 100% the Family Ruckus mark lights up too.',f(){S=base({id:'combo100',actor:'deedee'});S.combo=100;S.hi='ruckus_full';}},
  {id:'ko',n:'Rose knocked out: Pick-Me-Up',d:'Pick-Me-Up appears for everyone; it aims at Rose’s card.',f(){S=base({id:'ko',actor:'tom'});S.mem.rose.ko=true;S.mem.rose.hp=0;S.mem.tom.pep=5;S.hi='pick_me_up';}},
  {id:'free',n:'A free Skill (from Grace)',d:'Grace’s Colossal Diamond-Gold Dumpling: Deedee may use one Skill of 4 Pep or less, free, now.',f(){S=base({id:'free',actor:'deedee'});S.free={from:'grace',max:4};S.mem.deedee.pep=5;S.hi='hand_me_my_glasses_scrub';}},
  {id:'playing',n:'A move playing, with the battle text',d:'The list folds away while a move plays; one caption line says what happened.',f(){S=base({id:'playing'});S.phase='playing';S.caption='Grace uses Crunchy Sugar-Cube Pop!';S.cap2='Racket is a Pet Peeve: Composure down 1.';S.foes[0].hp=397;S.foes[0].pips=5;S.mem.grace.pep=1;S.combo=42;S.pops=[{at:'f:A',t:'-21'}];}},
  {id:'end',n:'End of the fight',d:'What the win paid, and Continue.',f(){S=base({id:'end'});S.foes[0].hp=0;S.foes[0].out=true;S.phase='end';}},
  {id:'nara',n:'A party of three with Nara',d:'Tom, TNB and Nara: three family members on the picture’s first three spots.',f(){S=base({id:'nara',party:['tom','tnb','nara'],actor:'nara'});S.combo=20;}},
];
function setState(id){const st=STATES.find(x=>x.id===id)||STATES[0];st.f();S.state=st.id;
  if(!S.hi&&S.phase==='turn')S.hi=startHi();if(S.hi&&!S.aim)S.aim=defaultAim(sk(S.hi));
  render(true);}

// ---------------------------------------------------------------- the list of moves for the acting member
function list(){
  const k=KIT[S.actor],out=[];
  if(S.free){out.push({grp:fill(W.freeFrom,{who:B3_CAST[S.free.from].name}).replace(/\.$/,''),free:1});
    for(const s of k.priSk.concat(k.secSk))if(s.pep<=S.free.max)out.push({s,free:1});return out;}
  if(RUCK[S.hi]){out.push({grp:W.group.ruckus});out.push({s:RUCK[S.hi]});}   // a Combo lives on the Combo bar's marks; while one is highlighted it shows here as the banner
  if(S.party.some(id=>S.mem[id].ko)){out.push({grp:W.group.any});out.push({s:B3_SKILLS.pick_me_up});}
  out.push({s:k.basic,basic:1});for(const s of k.priSk)out.push({s});
  out.push({grp:W.group.pocket+': '+k.sec.name});for(const s of k.secSk)out.push({s});
  return out;
}
const ruckOn=()=>S.free?[]:[RUCK.ruckus_double,RUCK.ruckus_full].filter(s=>S.combo>=s.combo);
const moves=()=>ruckOn().concat(list().filter(r=>r.s&&!RUCK[r.s.id]).map(r=>r.s));
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
// Where everything stands comes from Tom's mockup picture (claude/battleux-mock2/tom-mockup-2026-11-27.jpg), measured at 951 px wide and
// written down in the plan's table "Exact to the mockup". The picture is 951 x 713; the Duo is 951 x 648, so the 65 px that go are sky:
// the turn bar and the tools keep their distance from the top, everything else keeps its distance from the bottom.
// The numbers below are that 951 x 648 design. A wider or taller screen keeps the left group (turn bar, monsters, plate) on the left and the
// right group (tools, list, family, Combo bar, party cards) on the right; a screen bigger both ways shows the design scaled up as one piece.
const ratio={};
function safe(){const q=(Q.get('safe')||'').split(',').map(Number);const pr=$('probe'),cs=getComputedStyle(pr);
  const env=[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft].map(parseFloat);
  return q.length===4&&q.every(n=>!isNaN(n))?{t:q[0],r:q[1],b:q[2],l:q[3]}:{t:env[0]||0,r:env[1]||0,b:env[2]||0,l:env[3]||0};}
const D={turns:{x:12,y:13,w:513,h:64},toolsR:22,bar:{x:396,w:284,top:130,bottom:481},plate:{x:96,y:466,w:255},combo:{x:440,y:483,w:420,h:88},cards:{x:430,y:571,w:434,h:66}};
// the family's spots (centre x, feet y) and heights, from the picture; three members take the first, second and a spot between the third and fourth
const SLOT={4:[[715,432],[768,460],[830,475],[879,501]],3:[[715,432],[770,460],[852,492]],2:[[715,432],[768,460]],1:[[715,432]]};
const FAM_H={grace:169,tom:182,rose:126,deedee:169,tnb:182,nara:104};
// the monsters: one stands where The Big One stands in the picture; more than one share that ground, Front row nearer the family
const FOE_W={bigone:324},FOE_ONE=[214,447],FOE_F={1:[[300,400]],2:[[320,300],[262,430]],3:[[330,245],[228,330],[330,415]]},FOE_B={1:[[118,340]],2:[[112,270],[118,400]]};
const FOE_HOVER={skeeter:14},RING_AT={bigone:[.52,.587]};
function geo(){
  const RW=innerWidth,RH=innerHeight,sf=safe(),up=RH>RW,short=!up&&RH<500,pad=8,gap=6;
  const g={up,short,sf,pad,gap,z:1,W:RW,H:RH};
  if(!up&&!short){
    const z=Math.min(RW/951,RH/648),W=RW/z,H=RH/z,dx=W-951,dy=H-648;   // the design shown whole: scaled up on a bigger screen, down on a slightly smaller one (867 px wide in Firefox on the Duo)
    Object.assign(g,{mode:'wide',z,W,H,dx,dy,ks:1,LX:40,RX:920+dx,BY:505+dy,x0:8,x1:W-8,y0:8,y1:H-8,TB:77});
    g.scene={x:0,y:0,w:W,h:H};g.turns=Object.assign({},D.turns);g.tools={r:W-D.toolsR,y:0};
    g.bar={x:D.bar.x+dx,w:D.bar.w,top:D.bar.top+dy,bottom:D.bar.bottom+dy};
    g.plate={x:D.plate.x,y:D.plate.y+dy,w:D.plate.w};g.combo={x:D.combo.x+dx,y:D.combo.y+dy,w:D.combo.w,h:D.combo.h};
    g.cards={x:D.cards.x+dx,y:D.cards.y+dy,w:D.cards.w,h:D.cards.h};g.strips=true;return g;}
  const x0=sf.l+pad,x1=RW-sf.r-pad,y0=sf.t+pad,y1=RH-sf.b-pad;Object.assign(g,{x0,x1,y0,y1,TB:44});
  if(up){
    g.mode='up';g.scene={x:0,y:sf.t,w:RW,h:Math.round(RW/2)};
    g.turns={x:x0+2,y:sf.t+5,w:RW-2*pad-sf.l-sf.r-(Q.has('bare')?98:214),h:40};g.tools={r:x1,y:sf.t};
    const below=g.scene.y+g.scene.h+gap;g.plate={x:x0,y:below,w:x1-x0,h:88};
    g.two=RW<420;g.cards={x:x0,y:g.plate.y+g.plate.h+gap,w:x1-x0,h:g.two?108:52};g.combo={x:x0,y:g.cards.y+g.cards.h+gap,w:x1-x0,h:52};
    g.sheet={x:sf.l,y:g.combo.y+g.combo.h+gap,w:RW-sf.l-sf.r,h:RH-sf.b-(g.combo.y+g.combo.h+gap)};
    g.ks=Math.min((g.scene.h-g.TB-14)/387,(RW-16)/600);g.LX=6;g.RX=RW-6;g.BY=g.scene.y+g.scene.h-5;g.strips=false;return g;}
  g.mode='short';const PC=52,CH=64,CW=Math.min(250,(x1-x0)*.36);
  g.scene={x:0,y:0,w:RW,h:RH};g.turns={x:x0+2,y:y0,w:x1-x0-(Q.has('bare')?200:310),h:40};g.tools={r:x1,y:sf.t};
  g.combo={x:x0,y:y1-CH,w:CW,h:CH};g.cards={x:x0+CW+gap,y:y1-PC,w:x1-x0-CW-gap,h:PC};
  g.plate={x:x0,w:Math.min(270,(x1-x0)*.36),bottom:g.combo.y-gap};
  g.BY=g.cards.y-5;g.ks=Math.min((g.BY-(y0+g.TB+2))/387,((x1-x0)-246)/574);g.LX=x0;g.RX=x1;
  const r=g.RX-238*g.ks-5,l=g.LX+336*g.ks+5,w=Math.max(236,Math.min(280,r-l));
  g.bar={x:r-w,w,top:y0+g.TB+2,bottom:g.cards.y-gap};g.strips=true;return g;}
const sxL=(g,X)=>g.LX+(X-40)*g.ks,sxR=(g,X)=>g.RX-(920-X)*g.ks,syB=(g,Y)=>g.BY-(505-Y)*g.ks;
function famPos(g){const out={},n=S.party.length,T=SLOT[Math.min(4,n)];
  S.party.forEach((id,i)=>{const back=B3_RULES.rowByLean[B3_VIBES[KIT[id].pri.id].lean]==='back';
    const h=FAM_H[id]*g.ks,w=h*(ratio[id]||.4),cx=sxR(g,T[i][0]),feet=syB(g,T[i][1]);out[id]={x:cx-w/2,y:feet-h,w,h,cx,feet,back};});return out;}
function foePos(g){const out={},F=S.foes,fr=F.filter(f=>f.row!=='back'),bk=F.filter(f=>f.row==='back');
  const put=(f,at,want)=>{const r=ratio[f.id]||1,w=(FOE_W[f.id]&&F.length===1?FOE_W[f.id]:want)*g.ks,h=w/r,hov=(FOE_HOVER[f.id]||0)*g.ks,cx=sxL(g,at[0]),gy=syB(g,at[1]);
    out[f.key]={x:cx-w/2,y:gy-h-hov,w,h,cx,feet:gy-hov,slot:w,ground:gy};};
  if(F.length===1){put(F[0],FOE_ONE,150);return out;}
  fr.forEach((f,k)=>put(f,(FOE_F[Math.min(3,fr.length)])[k%3],104));
  bk.forEach((f,k)=>put(f,(FOE_B[Math.min(2,bk.length)])[k%2],96));
  return out;}

// ---------------------------------------------------------------- drawing helpers
function flIcon(f){const c=B3_FLAVORS[f].color;
  const g={clobber:'<path d="M3 9l3-5 3 2 3-4 1 5 3 2-4 1-1 4-3-3z"/>',sizzle:'<path d="M9 2c1 3 5 4 5 8a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-4 1-7z"/>',
    drench:'<path d="M9 2c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/>',razzle:'<path d="M9 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    racket:'<path d="M2 7h3l4-4v12l-4-4H2z"/><path d="M11 6c2 2 2 4 0 6M13 4c4 3 4 7 0 10" stroke="#3b220f" fill="none" stroke-width="1.6"/>',
    support:'<path d="M9 15C2 10 2 4 6 4c2 0 3 1 3 2 0-1 1-2 3-2 4 0 4 6-3 11z"/>'}[f];
  return `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.4" fill="${c}" stroke="#3b220f" stroke-width="1.2"/><g transform="translate(2.5 2.5) scale(.72)" fill="#3b220f">${g}</g></svg>`;}
const flChip=f=>`<span class="fl">${flIcon(f)}${B3_FLAVORS[f].name}</span>`;
const face=id=>`battle-story/face-${id}.webp`;
const stName=id=>B3_STATUS[id]?B3_STATUS[id].name:id;
const FR=c=>`<i class="fr ${c}"></i>`;   // a painted frame cut from the mockup, laid behind its box (nine-slice, ui.css)
function hpBar(u){const r=u.max?u.hp/u.max:0;return `<div class="hp${r<=B3_RULES.lowHp?' low':''}"><u style="width:${Math.max(0,100*r)}%"></u></div>`;}
function pipsHtml(f,go){let h='<span class="pips">';for(let i=0;i<f.maxPips;i++){const live=i<f.pips;h+=`<i class="pip${live?'':' gone'}${live&&go&&i>=f.pips-go?' go':''}"></i>`;}return h+'</span>';}
function stChip(id){const s=B3_STATUS[id];if(!s)return '';const bad=s.kind==='debuff'||s.kind==='mark';const t=S.det&&s.dur?`${s.name}, ${s.dur.n} ${s.dur.unit==='turn'?'turns':'rounds'}`:s.name;return `<span class="sc${bad?' bad':s.kind==='buff'||s.kind==='stance'?' good':''}">${esc(t)}</span>`;}
// the damage ring of the picture: a dark disc in two gold rings with four gold points (drawn, not cut: the picture's ring is half under its chips)
const RING_SVG=(()=>{const sp=(a,l)=>`<path transform="rotate(${a})" d="M0,${-l} L3.3,-36 L0,-27.5 L-3.3,-36Z" fill="#f6dc93" stroke="#8d6a22" stroke-width=".7"/>`;
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="36" fill="#5d4a36"/><circle r="36" fill="none" stroke="#3a2815" stroke-width="5.2"/><circle r="36" fill="none" stroke="#dcb65c" stroke-width="3.2"/><circle r="30.5" fill="none" stroke="#cfa651" stroke-width="1.5"/>${sp(0,49)}${sp(90,49)}${sp(180,49)}${sp(270,49)}${sp(45,45)}</svg>`;})();
const ringHtml=(n,word,cls)=>`<div class="dring${cls||''}">${RING_SVG}<b>${n}</b><span>${word}</span></div>`;
const CREST='<svg viewBox="0 0 28 32" aria-hidden="true"><path d="M2 3h24v13c0 8-6 12-12 14C8 28 2 24 2 16z" fill="#c9a24e" stroke="#4a3013" stroke-width="1.6"/><path d="M5.2 6h17.6v10c0 6-4.6 9.200-8.800 10.800C9.800 25.200 5.200 22 5.200 16z" fill="#e4c477" stroke="#8d6a22" stroke-width=".8"/></svg>';
function fcTags(s,f,c){const tags=[];if(c.peeve)tags.push(['gold','1.5x '+W.peeveTag]);if(c.resist)tags.push(['bad',fill(W.resist,{flavor:flavWord(s)})]);if(c.ko)tags.push(['gold',W.ko]);if(c.brk)tags.push(['gold',W.brk]);
  if(c.push)tags.push(['','Pushed back']);if(c.cancel)tags.push(['good',fill(W.cancels,{name:f.wind.name})]);
  if(c.pips&&S.det&&!c.brk)tags.push(['',fill(W.pips,{n:c.pips,left:f.pips-c.pips})]);if(S.det)for(const l of c.leaves)tags.push(['','Leaves '+l]);return tags;}
// the forecast sits on the monster itself when the monster is big enough to carry it (the picture); a small monster's forecast stays on its plate
const onBody=(g,p)=>p.h>=190&&p.w>=190;

// ---------------------------------------------------------------- render
function render(full){
  const g=geo(),app=$('app');S.g=g;
  for(const c of ['up','short','wide'])app.classList.toggle(c,g.mode===c);
  app.classList.toggle('two',!!g.two);app.classList.toggle('det',S.det);app.classList.toggle('rose',S.rose);
  Object.assign(app.style,{width:g.W+'px',height:g.H+'px',transform:g.z===1?'':'scale('+g.z+')'});
  const sc=$('scene');Object.assign(sc.style,{left:g.scene.x+'px',top:g.scene.y+'px',width:g.scene.w+'px',height:g.scene.h+'px'});
  if($('bg').dataset.bg!==S.bg){$('bg').src=BGS[S.bg][0];$('bg').dataset.bg=S.bg;}
  renderUnits(g);renderTurns(g);renderTools(g);renderStrips(g);renderPlate(g);renderCombo(g);renderCards(g);renderCaption(g);renderEnd(g);renderSheet(g);renderMock();
  if(S.phase==='turn')showBar(full?'none':null);else $('bar').className='';
}
function place(el,r){Object.assign(el.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'});}
function renderUnits(g){
  const box=$('units'),fp=famPos(g),op=foePos(g),sc=g.scene;let h='';
  const am=aimedMems(),af=aimedFoes(),s=S.hi?sk(S.hi):null,many=liveFoes().length>1;
  for(const f of S.foes){if(f.out)continue;const p=op[f.key];
    h+=`<div class="u foe" data-foe="${f.key}" style="left:${p.x-sc.x}px;top:${p.y-sc.y}px;width:${p.w}px;height:${p.h}px;z-index:${Math.round(p.feet)}"><img src="battle-story/${f.id}.webp" alt="${esc(B3_FOES[f.id].name)}"></div>`;
    if(af.includes(f)&&many){const rw=Math.min(p.w*.8,p.slot*.9);h+=`<div class="ring${af.length>1?' dash':''}" style="left:${p.cx-rw/2-sc.x}px;top:${p.feet-11-sc.y}px;width:${rw}px;height:22px;z-index:${Math.round(p.feet)-1}"></div>`;
      if(af.length===1)h+=`<div class="arrow" style="left:${p.cx-sc.x}px;top:${p.y-28-sc.y}px;z-index:900"></div>`;}
    if(af.length===1&&af[0]===f&&s&&S.phase==='turn'&&onBody(g,p)){const c=fcFoe(s,f);
      if(c.dmg||c.cancel||c.push){const at=RING_AT[f.id]||[.5,.55],tags=fcTags(s,f,c);
        h+=`<div class="fcx" style="left:${p.x+p.w*at[0]-sc.x}px;top:${p.y+p.h*at[1]-sc.y}px">${ringHtml(c.dmg,'damage')}<div class="chs">${tags.map(t=>`<span class="cp ${t[0]}">${esc(t[1])}</span>`).join('')}</div></div>`;}}
    if(f.flu)h+=`<div class="stars" style="left:${p.cx-sc.x}px;top:${p.y-6-sc.y}px;z-index:901"><i></i><i></i><i></i></div>`;
    if(f.wind&&S.phase!=='end'){h+=`<div class="wind" style="left:${p.x+p.w*.12-sc.x}px;top:${p.y+4-sc.y}px;z-index:902">Winding up: <b>${esc(f.wind.name)}</b></div>`;}
    if(g.up||(g.short&&S.foes.length>1)){const c=af.length>1&&s?fcFoe(s,f):null;h+=`<span class="ulet" style="left:${p.x+2-sc.x}px;top:${p.y+p.h*.35-sc.y}px;z-index:903"><span class="lt">${f.key}</span>${c&&g.up&&c.dmg?`<span class="dm${c.peeve?' pv':''}">${c.dmg}</span>`:''}</span>`;}
  }
  if(s&&S.phase==='turn'&&aimKind(s)==='floor'){const ps=Object.values(op),l=Math.min(...ps.map(p=>p.x))-10,r=Math.max(...ps.map(p=>p.x+p.w))+10,fe=ps.map(p=>p.ground),top=Math.min(...fe)-18,bot=Math.max(...fe)+14;
    h+=`<div class="floor" style="left:${l-sc.x}px;top:${top-sc.y}px;width:${r-l}px;height:${Math.max(40,bot-top)}px;z-index:5"></div><span class="flab" style="left:${(l+r)/2-sc.x}px;top:${(top+bot)/2-sc.y}px">${esc(s.name)} goes here</span>`;}
  for(const id of S.party){const p=fp[id],m=S.mem[id];
    h+=`<div class="u mem${m.ko?' ko':''}" id="fig-${id}" data-mem="${id}" style="left:${p.x-sc.x}px;top:${p.y-sc.y}px;width:${p.w}px;height:${p.h}px;z-index:${Math.round(p.feet)}"><img src="battle-story/${id}.webp" alt="${esc(B3_CAST[id].name)}"></div>`;
    if(am.includes(id)){const rw=p.w*.9;h+=`<div class="ring ally" style="left:${p.cx-rw/2-sc.x}px;top:${p.feet-9-sc.y}px;width:${rw}px;height:18px;z-index:${Math.round(p.feet)-1}"></div>`;
      if(am.length===1&&id!==S.actor)h+=`<div class="arrow" style="left:${p.cx-sc.x}px;top:${(m.ko?p.feet-50:p.y-26)-sc.y}px;z-index:900"></div>`;}}
  for(const pp of S.pops){const at=pp.at[0]==='f'?op[pp.at.slice(2)]:fp[pp.at.slice(2)];if(!at)continue;
    h+=`<div class="pop${pp.heal?' heal':''}${S.state==='playing'?' stay':''}" style="left:${at.cx-20-sc.x}px;top:${at.y+at.h*.25-sc.y}px;z-index:950">${esc(pp.t)}</div>`;}
  box.innerHTML=h;
}
// The turn bar, as the picture draws it: whose turn it is as a big face, the faces that follow, the red Round ribbon where the next round
// starts, and a dashed arrow to the big face that shows where the acting member lands after the highlighted move.
function renderTurns(g){
  const el=$('turns');el.className='';el.style.display=S.phase==='end'?'none':'';const max=g.mode==='wide'?7:g.short?6:5;
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null;
  let toks=S.turn.slice(0,S.roundAt).map(t=>({t})).concat([{r:S.round+1}],S.turn.map(t=>({t})),[{r:S.round+2}],S.turn.map(t=>({t})));
  if(s){const again=toks.findIndex((x,j)=>j>0&&x.t==='m:'+S.actor);if(again>0)toks.splice(again,1);
    let seen=0,at=toks.length;for(let j=0;j<toks.length;j++){if(seen===landing(s)){at=j;break;}if(toks[j].t)seen++;}
    if(toks[at]&&toks[at].r)at++;toks.splice(at,0,{t:'m:'+S.actor,ghost:1});
    for(const f of aimedFoes()){const c=fcFoe(s,f);if(c.push){const i=toks.findIndex((x,j)=>j>0&&!x.ghost&&x.t==='f:'+f.key);if(i>0){const [x]=toks.splice(i,1);x.pushed=1;toks.splice(Math.min(i+2,toks.length),0,x);}}}}
  let n=0,cut=toks.length;for(let j=0;j<toks.length;j++){if(toks[j].t)n++;if(n===max){cut=j+1;break;}}
  const gi=toks.findIndex(x=>x.ghost),ri=toks.findIndex(x=>x.r);
  if(gi>=cut)toks=toks.slice(0,cut-1).concat([toks[gi]]);else if(gi>ri)toks=toks.slice(0,gi+1);else toks=toks.slice(0,cut);   // as the picture: the bar ends at the landing face when it lies past the ribbon
  while(toks.length&&toks[toks.length-1].r)toks.pop();
  let h=FR('f-scroll');
  toks.forEach((x,i)=>{if(x.r){h+=`<span class="rnd">Round<b>${x.r}</b></span>`;return;}
    const isF=x.t[0]==='f',id=x.t.slice(2),u=isF?foeBy(id):S.mem[id];if(!u)return;
    const img=isF?face(u.id):face(id),alt=isF?B3_FOES[u.id].name:B3_CAST[id].name;
    const bd=isF&&u.wind?'<span class="bd">!</span>':isF&&u.flu?'<span class="bd f">F</span>':'';
    if(x.ghost)h+='<i class="dash"></i>';
    h+=`<span class="tf${i===0?' now':''}${isF?' foe':''}${x.ghost?' ghost':''}${x.pushed?' pushed':''}${!isF&&u.ko?' ko':''}"><img src="${img}" alt="${esc(alt)}">${bd}</span>`;});
  if(S.phase==='end')h=FR('f-scroll')+`<span class="rnd">Round<b>${S.round}</b></span>`;
  el.innerHTML=h;
  Object.assign(el.style,{left:g.turns.x+'px',top:g.turns.y+'px',height:g.turns.h+'px',width:g.mode==='wide'?g.turns.w+'px':'auto',maxWidth:g.turns.w+'px'});
}
function renderTools(g){
  const el=$('tools');el.style.right=(g.W-g.tools.r)+'px';el.style.top=g.tools.y+'px';
  const tb=(attr,inner,href)=>href?`<a class="tb" href="${href}"><i class="str"></i><span class="tgf">${FR('f-tag')}<b>${inner}</b></span></a>`:`<button class="tb" type="button" ${attr}><i class="str"></i><span class="tgf">${FR('f-tag')}<b>${inner}</b></span></button>`;
  const mock=Q.has('bare')?'':`<button class="tb mock" type="button" data-mock="1"><span class="tgf"><b>Mock states</b></span></button>`;
  const det=tb('data-det="1"',`${W.details}<span class="tg${S.det?' on':''}"></span>`);
  el.innerHTML=mock+(g.up?det:tb('data-speed="1"',S.speed+'x')+det+tb('',W.exit,'admin.html'));
}
function renderStrips(g){
  const box=$('strips');let h='';const op=foePos(g),s=S.hi&&S.phase==='turn'?sk(S.hi):null,pf=plateFoe(),af=aimedFoes();
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
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null,k=s?aimKind(s):null,af=aimedFoes();let h=FR('f-plate');
  if(s&&(k==='all'||k==='random')&&af.length>1){
    const cs=af.map(f=>fcFoe(s,f)),ds=cs.map(c=>c.dmg),lo=Math.min(...ds),hi=Math.max(...ds),np=cs.filter(c=>c.peeve).length;
    h+=`<div class="top wide2"><span>${k==='all'?'Every monster':'Random monsters'}</span></div><div class="rw">${k==='random'?esc(s.hits+' hops, each on a random monster'):g.up?'Each monster shows its own damage.':'Each small plate shows its own damage.'}</div>`
     +`<div class="rw">${np?`<span class="sc gold">Pet Peeve on ${np} of ${af.length}</span>`:''}</div>`
     +`<div class="fc">${ringHtml(lo===hi?lo:lo+'–'+hi,'each',lo===hi?'':' rng')}</div>`;
    el.className='pl';delete el.dataset.foe;el.innerHTML=h;placePlate(el,g);return;}
  const f=plateFoe();if(!f){el.style.display='none';return;}const F=B3_FOES[f.id],p=foePos(g)[f.key];
  const c=s&&af.length===1&&af[0]===f?fcFoe(s,f):null,body=c&&onBody(g,p);
  const back=f.row==='back'&&S.foes.length>1?`<span class="sc">${W.backRow}</span>`:'',hpTxt=`${f.hp}${S.det?' / '+f.max:''} HP`;
  h+=`<span class="crest">${CREST}<b>${f.key}</b></span><div class="top"><span>${esc(F.name)}</span>${back}</div><div class="hl">${hpBar(f)}<b>${hpTxt}</b></div>`;
  const pipRow=f.maxPips?(f.flu?`<span class="sc bad">Flustered: takes 35% more</span>`:`<span class="lab">Composure</span>${pipsHtml(f,c?c.pips:0)}`):'';
  if(g.mode==='wide'){h+=`<div class="rw">${pipRow}</div>`;if(f.st.length)h+=`<div class="rw">${f.st.map(stChip).join('')}</div>`;}
  else h+=`<div class="rw">${pipRow}${f.st.map(stChip).join('')}</div>`;
  h+=`<div class="rw"><span class="lab">${(F.peeves||[]).length?W.peeves+':':W.noPeeves}</span>${(F.peeves||[]).map(flChip).join('')}${(F.resists||[]).map(r=>`<span class="sc bad">${fill(W.resist,{flavor:B3_FLAVORS[r].name})}</span>`).join('')}</div>`;
  if(c&&!body&&(c.dmg||c.cancel||c.push)){
    h+=`<div class="fc">${ringHtml(c.dmg,'damage')}</div>`;const tags=fcTags(s,f,c);
    if(tags.length)h+=`<div class="fcl">${tags.map(t=>`<span class="sc ${t[0]}">${esc(t[1])}</span>`).join('')}</div>`;}
  if(S.look&&S.look.f===f.key&&s&&!af.includes(f))h+=`<div class="note">${W.noAim}. Tap here for ${W.fullList}.</div>`;
  el.className='pl'+(c&&!body?' hasfc':'');el.dataset.foe=f.key;el.innerHTML=h;placePlate(el,g);
}
function placePlate(el,g){const r=g.plate;el.style.left=r.x+'px';el.style.width=r.w+'px';el.style.height='auto';el.style.top='0px';const hh=el.offsetHeight;
  if(g.short){el.style.top=Math.max(g.y0+g.TB+4,r.bottom-hh)+'px';return;}
  if(g.up){el.style.top=r.y+'px';el.style.height=r.h+'px';return;}
  // the picture's home is under the monster; when several monsters stand there, the plate moves under the turn bar
  const hit=Object.values(foePos(g)).some(p=>p.x<r.x+r.w&&p.x+p.w>r.x&&p.ground+50>r.y)&&liveFoes().length>1;
  el.style.top=(hit?g.turns.y+g.turns.h+10:Math.min(r.y,g.H-6-hh))+'px';}
function comboChip(s,cls,small){const on=S.combo>=s.combo&&!S.free,hi=S.hi===s.id;   // small screens: the name only (the gauge beside it shows the mark)
  return `<button class="cchip${on?' on':''}${hi?' hi':''} ${cls}" type="button" ${on?`data-sk="${s.id}"`:'disabled'}><span class="cv">${small?'':s.combo+'% · '}${esc(s.name)}</span></button>`;}
function renderCombo(g){
  const el=$('combo');if(S.phase==='end'){el.style.display='none';return;}el.style.display='';
  const c=S.combo;
  if(g.mode==='wide'){el.className='wd'+(c>=100?' full':'');
    el.innerHTML=`<div class="gz">${FR('f-gauge')}<div class="ch"><u style="width:${c}%"></u><s></s></div></div><div class="cpl">${FR('f-cplaque')}<b>Combo ${c}%</b></div>`+comboChip(RUCK.ruckus_double,'c1')+comboChip(RUCK.ruckus_full,'c2');}
  else{el.className='pn cmp'+(c>=100?' full':'');
    el.innerHTML=`<div class="ct">Combo ${c}%<div class="trk"><u style="width:${c}%"></u><s style="left:50%"></s></div></div>`+comboChip(RUCK.ruckus_double,'c1',1)+comboChip(RUCK.ruckus_full,'c2',1);}
  place(el,g.combo);
}
function renderCards(g){
  const el=$('cards');if(S.phase==='end'){el.style.display='none';return;}el.style.display='';
  const s=S.hi&&S.phase==='turn'?sk(S.hi):null,am=aimedMems(),wide=g.mode==='wide';let h='';
  for(const id of S.party){const m=S.mem[id],now=id===S.actor&&S.phase!=='end',aim=am.includes(id);
    let p='',pf='';const sp=now&&s?cost(s):0,gn=now&&s?gain(s):0,after=Math.max(0,Math.min(10,m.pep-sp+gn));
    if((now||wide)&&!m.ko){let pp='<span class="pp2">';for(let i=0;i<10;i++){const cls=i<m.pep-sp?'on':i<m.pep?'spend':i<after?'gain':'';pp+=`<i class="${cls}"></i>`;}pp+='</span>';
      p=`<div class="p">${W.pepWord} ${pp}${wide?'':`<span>${after!==m.pep?m.pep+'→'+after:m.pep}</span>`}</div>`;
      if(now&&wide)pf=`<span class="pf${after<m.pep?' dn':''}">${after!==m.pep?m.pep+' → '+after+' '+W.pepWord:m.pep+' '+W.pepWord}</span>`;}
    else if(S.det&&!m.ko)p=`<div class="p">${W.pepWord} ${m.pep}</div>`;
    const chips=[];if(m.marked)chips.push(`<span class="sc bad">${W.marked}</span>`);if(m.next)chips.push(`<span class="sc bad">${W.nextTarget}</span>`);if(m.ko)chips.push(`<span class="sc bad">${W.knockedOut}</span>`);
    const fc=aim&&s?fcMem(s,m):[],back=S.det&&!g.short&&B3_RULES.rowByLean[B3_VIBES[KIT[id].pri.id].lean]==='back';
    h+=`<div class="pc${now?' now':''}${aim?' aim':''}${m.ko?' ko':''}" data-mem="${id}"><div class="f"><img src="${face(id)}" alt=""></div>`
      +`<div class="n">${esc(B3_CAST[id].name)}${back?`<em>${W.back}</em>`:''}</div>`
      +`<div class="ht">${S.det?m.hp+'/'+m.max:m.hp+' HP'}</div>${hpBar(m)}${p}`
      +(S.det&&m.st.length&&!m.ko?`<div class="st">${m.st.map(stChip).join('')}</div>`:'')
      +(chips.length?`<div class="ch">${chips.join('')}</div>`:'')+(fc.length?`<div class="fc2">${fc.slice(0,2).map(t=>`<span class="sc ${t[0]}">${esc(t[1])}</span>`).join(' ')}</div>`:'')+pf+'</div>';}
  el.innerHTML=h;place(el,g.cards);if(wide){el.style.height='auto';el.style.top='auto';el.style.bottom=(g.H-g.cards.y-g.cards.h)+'px';}else el.style.bottom='auto';
}
function renderCaption(g){
  const el=$('caption');if(S.phase!=='playing'||!S.caption){el.className='pn';return;}
  el.className='pn on';el.innerHTML=esc(S.caption)+(S.cap2?`<small>${esc(S.cap2)}</small>`:'');
  if(g.up){el.style.left=g.x0+'px';el.style.width=(g.x1-g.x0)+'px';el.style.top='0px';el.style.top=(g.scene.y+g.scene.h-el.offsetHeight-8)+'px';return;}
  const w=Math.max(250,g.bar.w);el.style.width=w+'px';el.style.left=(g.bar.x+g.bar.w-w)+'px';el.style.top='0px';   // where the list was, low, above the Combo bar
  el.style.top=(g.bar.bottom-el.offsetHeight-8)+'px';
}
function renderEnd(g){
  const el=$('endp');if(S.phase!=='end'){el.className='';return;}
  const drops=S.foes.map(f=>B3_FOES[f.id].drop).filter(Boolean);
  el.className='on';el.innerHTML=FR('f-panel')+`<h3>You win!</h3>`
    +`<div class="er"><span>Everyone</span><b>+48 XP</b></div>`
    +S.party.map(id=>`<div class="er"><span>${esc(B3_CAST[id].name)}, ${esc(KIT[id].pri.name)}</span><b>+18 Vibe points</b></div>`).join('')
    +`<div class="er"><span>Found</span><b>${drops.length?drops.map(d=>d[0].toUpperCase()+d.slice(1)).join(', '):'Nothing this time'}</b></div>`
    +`<button class="cont" type="button" data-cont="1">${W.cont}</button>`;
  const w=Math.min(390,g.W-2*g.pad-g.sf.l-g.sf.r);el.style.width=w+'px';el.style.left=(g.W/2-w/2)+'px';el.style.top='0px';
  el.style.top=Math.max(g.y0,(g.H-el.offsetHeight)/2)+'px';
}
function renderSheet(g){const el=$('sheet');if(!S.sheet){el.className='';return;}
  const x=S.sheet;let h='';
  if(x.f){const f=foeBy(x.f),F=B3_FOES[f.id];h=`<h4>${esc(F.name)}</h4><div class="er"><span>HP</span><b>${f.hp} / ${f.max}</b></div><div class="er"><span>Composure</span><b>${f.pips} of ${f.maxPips}</b></div>`
    +`<div class="er"><span>${W.peeves}</span><b>${(F.peeves||[]).map(p=>B3_FLAVORS[p].name).join(', ')||'None'}</b></div><div class="er"><span>Row</span><b>${f.row==='back'?'Back':'Front'}</b></div>`
    +f.st.map(id=>`<div class="er"><span>${esc(stName(id))}</span><b style="white-space:normal;font-weight:500">${esc((B3_STATUS[id]||{}).desc||'')}</b></div>`).join('');}
  else{const m=S.mem[x.m];h=`<h4>${esc(B3_CAST[x.m].name)}</h4><div class="er"><span>HP</span><b>${m.hp} / ${m.max}</b></div><div class="er"><span>Pep</span><b>${m.pep} of 10</b></div>`
    +`<div class="er"><span>Primary</span><b>${esc(KIT[x.m].pri.name)}</b></div><div class="er"><span>Secondary</span><b>${esc(KIT[x.m].sec.name)}</b></div>`
    +m.st.map(id=>`<div class="er"><span>${esc(stName(id))}</span><b style="white-space:normal;font-weight:500">${esc((B3_STATUS[id]||{}).desc||'')}</b></div>`).join('');}
  el.className='on';el.innerHTML=FR('f-panel')+h+`<button class="cont" type="button" data-close="1">${W.close}</button>`;
  const w=Math.min(360,g.W-40);el.style.width=w+'px';el.style.left=(g.up?g.W/2-w/2:Math.max(g.x0,Math.min(g.W-w-8,g.bar.x-70)))+'px';el.style.top='0px';el.style.top=Math.max(g.y0+50,(g.H-el.offsetHeight)/2)+'px';
}

// ---------------------------------------------------------------- the list of moves (the picture's middle: the name, the Basic card, the tab, the framed list)
function rowHtml(r){
  const s=r.s,hi=S.hi===s.id,why=whyNot(s),fl=flavs(s),af=aimedFoes();
  let peeve=false,resist=false;
  if(hi&&af.length){peeve=af.some(f=>fcFoe(s,f).peeve);resist=!peeve&&af.length===1&&fcFoe(s,af[0]).resist;}
  else if(basePower(s))peeve=liveFoes().some(f=>fcFoe(s,f).peeve);
  const price=r.free?`<span class="pp free">${W.free}</span>`:s.slot==='basic'?`<span class="pp gain">+${gain(s)} ${W.pepWord}</span>`:s.slot==='ruckus'?`<span class="pp combo">${s.combo}%</span>`:`<span class="pp${why?' no':''}">${s.pep} ${W.pepWord}</span>`;
  const tags=(peeve?`<span class="tag">${W.peeveTag}</span>`:'')+(resist?`<span class="tag">${fill(W.resist,{flavor:''}).trim()}</span>`:'')+(S.rose&&rec()&&rec().id===s.id?`<span class="tag rec">${W.recTag}</span>`:'');
  const ic=S.rose?`<span class="em">${fl.map(f=>EMO[f]).join('')}</span>`:flIcon(fl[0]||'support');
  const kind=s.slot==='ruckus'?esc(kindWord(s)):esc(flavWord(s))+' '+esc(kindWord(s));
  const kd=why&&!hi?`<span class="why">${esc(why)}</span>`:`${kind}${tags}`;
  const line=hi||S.det?`<div class="dsc${hi?' open':''}" data-for="${s.id}">${esc((hi&&S.det?s.desc:s.short)||'')}${hi&&why?` <b class="why">${esc(why[0].toUpperCase()+why.slice(1))}.</b>`:''}</div>`:'';
  return `<div class="row${hi?' hi':''}${why?' poor':''}${r.basic?' basic':''}${s.slot==='ruckus'?' combo':''}${r.free?' free':''}" data-sk="${s.id}" role="button" aria-pressed="${hi}">`
    +FR(hi?'f-banner':r.basic?'f-basic':'f-row')+(r.basic?`<span class="plq">${FR('f-plaque')}<b>Basic attack</b></span>`:'')
    +`<span class="ic">${ic}</span><span class="nm">${esc(s.name)}</span>${price}<span class="kd">${kd}</span></div>`+line;
}
function barHtml(){const k=KIT[S.actor],L=list();let top='',rows='';
  for(const r of L){if(r.basic)top+=rowHtml(r);else if(r.grp){if(!r.free)rows+=`<div class="grp">${esc(r.grp)}</div>`;}else rows+=rowHtml(r);}
  const tab=S.free?`<span class="vtab free">${esc(L[0].grp)}</span>`:`<span class="vtab"><i>★</i>${esc(k.pri.name)}</span>`;
  return `<div class="ttl" data-t="${esc(k.name)}">${esc(k.name)}</div>${top}<div class="vt">${tab}</div><div class="pnl">${FR('f-panel')}<div class="scr">${rows}</div></div>`
    +(S.keys&&!S.g.up?'<div class="keys">Up and down: move. Left and right: aim. Enter: use.</div>':'');}
function showBar(slide){
  const bar=$('bar'),g=S.g;const wasShown=bar.classList.contains('show');
  bar.innerHTML=barHtml();bar.className='';bar.style.display='flex';bar.style.visibility='hidden';
  const scr=bar.querySelector('.scr'),r=g.up?{x:g.sheet.x+6,w:g.sheet.w-12,top:g.sheet.y,bottom:g.sheet.y+g.sheet.h}:g.bar;
  Object.assign(bar.style,{left:r.x+'px',width:r.w+'px',top:r.top+'px',maxHeight:(r.bottom-r.top)+'px',height:g.up?(r.bottom-r.top)+'px':'auto'});
  const hiEl=scr.querySelector('.row.hi'),ds=scr.querySelector('.dsc.open');
  if(hiEl){const top=hiEl.offsetTop-6,bot=(ds||hiEl).offsetTop+(ds||hiEl).offsetHeight+8;if(bot>scr.scrollTop+scr.clientHeight)scr.scrollTop=bot-scr.clientHeight;if(top<scr.scrollTop)scr.scrollTop=top;}
  const upd=()=>{const m=bar.querySelector('.more');const left=scr.scrollHeight-scr.clientHeight-scr.scrollTop>6;if(left&&!m){const e=document.createElement('span');e.className='more';e.textContent='More below';bar.querySelector('.pnl').appendChild(e);}else if(!left&&m)m.remove();};upd();scr.onscroll=upd;
  bar.style.visibility='';bar.style.display='';
  bar.classList.add('show');if(slide===null&&wasShown)bar.style.animation='none';else bar.style.animation='';
}

// ---------------------------------------------------------------- playing a turn
async function useMove(id){
  if(S.phase!=='turn')return;const s=sk(id);if(!s||whyNot(s))return;
  const a=S.actor,m=S.mem[a],k=aimKind(s),af=aimedFoes(),am=aimedMems();
  S.phase='playing';const bar=$('bar');bar.classList.remove('show');bar.style.animation='';bar.classList.add('fold');
  await T(150);bar.className='';
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
  S.cap2=notes.slice(0,2).join(' ');S.free=null;S.hi=null;render();
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
  const F=B3_FOES[f.id];S.phase='playing';S.hi=null;
  let act=(F.acts||[]).find(x=>x.power>0)||{name:'a swipe'},tgt=S.party.filter(id=>!S.mem[id].ko)[0];
  if(f.wind){act={name:f.wind.name};tgt=f.wind.at;f.wind=null;S.mem[tgt].marked=false;}
  const m=S.mem[tgt],d=18;m.hp=Math.max(1,m.hp-d);S.caption=`${F.name} uses ${act.name} on ${B3_CAST[tgt].name}.`;S.cap2='';S.pops=[{at:'m:'+tgt,t:'-'+d}];render();
  const u=$('fig-'+tgt);if(u)u.classList.add('shake');
  await T(1300);S.pops=[];next(null);
}

// ---------------------------------------------------------------- input: a tap on a move highlights it (the gold banner); a tap on the highlighted move uses it
function pick(id){if(S.phase!=='turn')return;S.look=null;S.sheet=null;if(S.hi===id)return;S.hi=id;S.aim=defaultAim(sk(id));if(S.aim.key)S.lastFoe=S.aim.key;render();}
function tapMove(id){if(S.phase!=='turn'||!sk(id))return;if(S.hi===id){if(!whyNot(sk(id)))useMove(id);return;}pick(id);}
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
  const r=t.closest('[data-sk]')||(t.closest('.dsc.open')&&{dataset:{sk:t.closest('.dsc.open').dataset.for}});if(r){S.keys=false;tapMove(r.dataset.sk);return;}
  const pl=t.closest('#plate');if(pl&&pl.dataset.foe&&S.look&&S.look.f){S.sheet={f:S.look.f};render(true);return;}
  const f=t.closest('[data-foe]');if(f){tapFoe(f.dataset.foe);return;}
  const m=t.closest('[data-mem]');if(m){tapMem(m.dataset.mem);return;}
});
document.addEventListener('keydown',e=>{if(!S||S.phase!=='turn')return;const ms=moves(),i=ms.findIndex(s=>s.id===S.hi);S.keys=true;
  if(e.key==='ArrowDown'||e.key==='s'){pick(ms[Math.min(ms.length-1,i+1)].id);e.preventDefault();}
  else if(e.key==='ArrowUp'||e.key==='w'){pick(ms[Math.max(0,i-1)].id);e.preventDefault();}
  else if(e.key==='ArrowLeft'||e.key==='a')stepAim(-1);else if(e.key==='ArrowRight'||e.key==='d')stepAim(1);
  else if(e.key==='Enter'||e.key===' '){useMove(S.hi);e.preventDefault();return;}else return;render();});
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
window.__STORY={get S(){return S},STATES,setState,useMove,tapMove,pick,tapFoe,tapMem,render,geo,moves,list,fcFoe,famPos,foePos,D};
