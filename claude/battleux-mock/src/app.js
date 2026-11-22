// Battle screen redesign mock (battleux-plan). Not the game: sample numbers, real move names and words from data/b3-kit-*.js.
'use strict';
const IC={
  clobber:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0l1.7 4.2L13.7 2.3 11.8 6.3 16 8l-4.2 1.7 1.9 4-4-1.9L8 16l-1.7-4.2-4 1.9 1.9-4L0 8l4.2-1.7-1.9-4 4 1.9z"/></svg>',
  sizzle:'<svg class="ic" viewBox="0 0 16 16"><path d="M8.6 0c.5 2.6-.7 3.9-2 5.3C5.200 6.800 4 8.200 4 10.400 4 13.500 6 16 8 16s4-2.300 4-5.400c0-1.700-.7-2.900-1.400-3.900-.300 1.200-.9 1.800-1.700 2.100C9.600 6 10.300 2.500 8.600 0z"/></svg>',
  drench:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0C6 3.400 3 6.600 3 10.200 3 13.400 5.200 16 8 16s5-2.600 5-5.800C13 6.600 10 3.400 8 0z"/></svg>',
  razzle:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0l1.900 6.100L16 8l-6.100 1.900L8 16l-1.900-6.100L0 8l6.100-1.900z"/></svg>',
  racket:'<svg class="ic" viewBox="0 0 16 16"><path d="M1 5.500h2.800L9 2v12L3.800 10.500H1z"/><path d="M11 5.200c1.300 1.500 1.300 4.100 0 5.600M12.900 3.300c2.300 2.600 2.300 6.800 0 9.400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  support:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 14.700C3.300 11.200 1 8.600 1 5.700 1 3.600 2.600 2 4.600 2c1.300 0 2.600.7 3.400 1.900C8.800 2.700 10.100 2 11.400 2 13.400 2 15 3.600 15 5.700c0 2.900-2.300 5.500-7 9z"/></svg>',
  bolt:'<svg class="ic" viewBox="0 0 16 16"><path d="M9.500 0L2.500 9h4l-1 7 8-10h-4.300z"/></svg>'
};
const FL={clobber:'Clobber',sizzle:'Sizzle',drench:'Drench',razzle:'Razzle',racket:'Racket',support:'Support'};
const REACH={foe:'One monster',all:'Every monster',rand:'Random monsters',ally:'One family member',fam:'One family member',self:'Tom himself',team:'The whole family',field:'The monsters’ floor'};
const PW={light:'Light hit',standard:'Hit',heavy:'Heavy hit',cap:'Huge hit'};
const BASE={light:16,standard:30,heavy:48,cap:22};
// k: basic | s | cap.  pk: from the Pocket Vibe.  tg: who it reaches.  s: the one line shown when Details is on.  d: the game's own description.  x: extra forecast lines.
const CAST={
 grace:{name:'Grace',main:'Squishy Collector',pocket:'Craft Artist',hp:115,max:115,pep:4,st:[],moves:[
  {n:'Soup-Dumpling Squeeze',k:'basic',c:0,f:['clobber'],pw:'light',tg:'foe',s:'Light hit. The next family hit on it earns 1 Pep.',d:'Light Clobber hit. The next other family member to hit that monster gains 1 Pep.',x:['Squished: next family hit +1 Pep']},
  {n:'NeeDoh Stretch Pass',k:'s',c:3,f:['support'],tg:'ally',s:'Pulls one family member up to act right after Grace.',d:'Pulls one family member up the turn bar to act right after Grace, with 20% more Speed for 2 turns. Once a round for each person.',x:['Acts right after Grace','+20% Speed, 2 turns'],pull:1},
  {n:'Crunchy Sugar-Cube Pop',k:'s',c:4,f:['racket'],pw:'light',tg:'foe',s:'Light hit. Cancels a wind-up and pushes it back.',d:'Light Racket hit. Cancels the attack a monster is winding up and pushes it 30 ticks back on the turn bar.',x:['Falls back 30 on the turn bar'],cancel:1,push:1},
  {n:'Colossal Diamond-Gold Dumpling',k:'cap',c:6,f:['support'],tg:'ally',s:'One family member uses a Skill right now, free.',d:'One family member uses a Skill of 4 Pep or less right now, for free, without losing their place on the turn bar. Grace and that family member each gain 1 Pep. Once a round for each person.',x:['Free Skill right now','+1 Pep each']},
  {n:'Open-String Violin Screech',k:'s',pk:1,c:3,f:['racket'],pw:'standard',tg:'all',s:'Hits every monster. 20% less Attack for 2 turns.',d:'Racket hit on every monster. Each one it hits has 20% less Attack for 2 turns. It sets off Dazzled.',x:['Attack down 20%, 2 turns']},
  {n:'Bedazzle-Gun Glue Trap',k:'s',pk:1,c:4,f:['sizzle'],tg:'field',s:'2 rounds: monsters that act get burned and slowed.',d:'Covers the monsters’ floor in hot glue and rhinestones for 2 rounds. Every monster that acts takes a light Sizzle and Razzle hit and waits 20% longer after its move.',x:['Lasts 2 rounds','Each monster that acts: light hit, waits 20% longer']},
  {n:'Masterpiece Portrait Makeover',k:'cap',pk:1,c:5,f:['razzle'],pw:'heavy',tg:'foe',s:'Heavy hit. Razzle becomes its Pet Peeve.',d:'Heavy Razzle hit. For 2 of its turns Razzle is one of that monster’s Pet Peeves: Razzle hits do 50% more and knock a Composure pip off.',x:['Razzle becomes a Pet Peeve, 2 turns']}]},
 deedee:{name:'Deedee',main:'Neat Freak',pocket:'Registered Nut',hp:115,max:115,pep:6,st:[],moves:[
  {n:'Windex Spritz',k:'basic',c:0,f:['drench'],pw:'light',tg:'foe',s:'Light hit. Leaves it Drenched; it misses more.',d:'Light Drench hit. Leaves the monster Drenched, and its attacks miss 15% of the time for 2 turns.',x:['Drenched: 15% slower, misses 15%']},
  {n:'Wet-Floor Hazard',k:'s',c:3,f:['drench'],tg:'field',s:'The next 2 melee attackers slip and hit weaker.',d:'Mops the monsters’ floor. The next 2 monsters to use a melee attack slip: a light Clobber fall, and that attack does 25% less damage.',x:['Next 2 melee attacks slip','Those attacks do 25% less']},
  {n:'“Hand Me My Glasses” Scrub',k:'s',c:4,f:['clobber'],pw:'standard',tg:'foe',s:'Scrubs its buffs off, then hits harder for each.',d:'Scrubs every buff off one monster, then a Clobber hit that is 25% stronger for each buff scrubbed away.',x:[],scrub:1},
  {n:'Fifty-Year Dust Tsunami',k:'cap',c:5,f:['drench'],pw:'heavy',tg:'all',s:'Scrubs every buff. Heavy wave Drenches them all.',d:'Scrubs every buff off every monster and clears anything they left on the family’s floor. Then a heavy Drench wave hits them all and leaves them Drenched.',x:['Buffs scrubbed off','Left Drenched']},
  {n:'Deedee Makes It Better',k:'s',pk:1,c:2,f:['support'],tg:'fam',s:'Heals one 20% and clears their debuffs.',d:'Heals one family member for 20% of their HP and clears every debuff on them. If something was cleared, they get 20% more Attack for 2 turns.',x:[],heal:.2},
  {n:'“Bring a Jacket!” Ward',k:'s',pk:1,c:4,f:['support'],tg:'fam',s:'Two family heal each turn and survive a knock-out.',d:'Deedee bundles two family members in extra jackets: the one you pick and whoever is hurt most. They heal a little each turn for 3 turns, and the first hit that would knock them out leaves them on 1 HP. Deedee needs 3 rounds before she can do it again.',x:['Also on whoever is hurt most','Heals each turn, 3 turns','Survives one knock-out on 1 HP']},
  {n:'To the Moon & Back',k:'cap',pk:1,c:6,f:['sizzle'],tg:'fam',s:'Revives or fully heals one, then burns every monster.',d:'A full moon rises. A knocked-out family member gets back up with 80% of their HP; anyone else heals all the way. Then a heavy wave of Sizzle warmth hits every monster and knocks 2 Composure off each.',x:['Then a heavy Sizzle wave on every monster'],heal:1}]},
 tom:{name:'Tom',main:'Frequent Flier',pocket:'Gamer Geek',hp:96,max:132,pep:3,st:['GUARD'],moves:[
  {n:'Lounge Pass Flex',k:'basic',c:0,f:['racket'],pw:'light',tg:'foe',s:'Light hit. Monsters aim at Tom more.',d:'Light Racket hit. Eyes On Me: monsters aim at Tom more until his next turn ends.',x:['Eyes On Me: monsters aim at Tom more']},
  {n:'Zone One Blockade',k:'s',c:2,f:['clobber'],tg:'self',s:'2 turns: hip-checks any monster that hits Tom.',d:'For 2 turns, any monster that hits Tom with a melee or thrown attack gets a Clobber hip-check back.',x:['Lasts 2 turns','Hits back when Tom is hit']},
  {n:'Suite Door Slide',k:'s',c:3,f:['support'],tg:'self',s:'2 turns: Tom takes hits for those beside him.',d:'For 2 turns, a hit aimed only at the family next to Tom lands on Tom instead, 35% weaker. Each one he takes gives him 1 Pep.',x:['Lasts 2 turns','Covers Grace and Rose','Each hit taken: +1 Pep']},
  {n:'Tarmac Porsche Transfer',k:'cap',c:5,f:['racket'],pw:'heavy',tg:'all',s:'Heavy hit on all. Strips a buff. All aim at Tom.',d:'Heavy Racket hit on every monster. Each one it hits loses 1 buff. For 2 turns, any attack aimed at one family member has to aim at Tom.',x:['Each loses 1 buff','ALL EYES on Tom, 2 turns']},
  {n:'Controller Toss',k:'s',pk:1,c:2,f:['clobber'],pw:'standard',tg:'foe',s:'Hit. 40% stronger if Tom was just hit.',d:'Clobber hit. 40% stronger if Tom took or blocked a hit since his last turn.',x:[]},
  {n:'Winged Shell Lock-On',k:'s',pk:1,c:4,f:['clobber'],pw:'standard',tg:'foe',s:'Hit. If it attacks before Tom’s turn, the shell explodes.',d:'Clobber hit. A blue winged shell hovers over the monster until Tom’s next turn. If it attacks before then, the shell slams down in a free Razzle explosion.',x:['Shell hovers until Tom’s next turn']},
  {n:'Konami Code',k:'cap',pk:1,c:6,f:['razzle'],pw:'heavy',tg:'all',s:'Heavy hit on all. Knocks 2 pips off each.',d:'Heavy Razzle hit on every monster, knocking 2 Composure pips off each. Each monster is 15% more likely to crit for every Prime on it.',x:[],pips:2}]},
 rose:{name:'Rose',main:'Sugar Rush',pocket:'Cozy Rosie',hp:61,max:115,pep:5,st:[],moves:[
  {n:'Lamb-Tuck Ankle Tackle',k:'basic',c:0,f:['clobber'],pw:'light',hits:2,tg:'foe',s:'Two quick hits on one monster.',d:'Two quick Clobber hits on one monster.',x:[]},
  {n:'The Floor Is Lava!',k:'s',c:3,f:['clobber'],pw:'standard',hits:3,tg:'rand',s:'Three hops onto random monsters.',d:'Three Clobber hops onto random monsters. Each hop hits 25% harder on a Toasty or Dazzled monster.',x:['3 hops, monsters picked at random']},
  {n:'“Giddyup, Tata!” Launch',k:'s',c:4,f:['sizzle','clobber'],pw:'heavy',tg:'foe',s:'Heavy hit. The next family member gets +20% Attack.',d:'Rose climbs the next family member in line: they get 20% more Attack for 2 turns. Then she cannonballs one monster for a heavy Sizzle and Clobber hit.',x:['Grace: +20% Attack, 2 turns']},
  {n:'Double-Lamby Return-Cart Blitz',k:'cap',c:6,f:['clobber'],pw:'cap',hits:6,tg:'rand',s:'Six ricochets onto random monsters.',d:'Six Clobber ricochets onto random monsters. On a Flustered monster each one hits harder than the last: 10% more for the 1st, up to 60% more for the 6th.',x:['6 ricochets, monsters picked at random']},
  {n:'Tattered Lamby Boomerang',k:'s',pk:1,c:2,f:['clobber'],pw:'light',tg:'foe',s:'Light hit now, two more next turn, a small shield.',d:'Rose throws scruffy Lamby at a monster: a light Clobber hit. When her next turn begins she tackles it to get him back: two quick Clobber hits, and a small shield on her.',x:['Next turn: 2 more hits, small shield on Rose']},
  {n:'Sofa-Cushion Citadel',k:'s',pk:1,c:3,f:['support'],tg:'team',s:'Shields the whole family for 3 turns.',d:'Cushions and blankets make a fort: every family member gets a shield of 25% of their HP and cannot be pushed back on the turn bar for 3 turns. Rose needs 3 rounds before she can build it again.',x:['Shield of 25% HP on everyone','Cannot be pushed back, 3 turns']},
  {n:'Kingdom of Ten-Thousand Blankets',k:'cap',pk:1,c:5,f:['sizzle'],tg:'fam',s:'Heals one 60%, then burns every monster.',d:'A star-lit blanket castle: one family member heals 60% of their HP and every debuff on them clears. When Rose’s next turn begins, a wave of Sizzle warmth hits every monster.',x:['Debuffs cleared','Next turn: Sizzle wave on every monster'],heal:.6}]}
};
const FOES={
 log:{name:'Log Lump',hp:166,max:166,pips:4,maxPips:4,peeve:['sizzle'],st:[['MOSSY BRACE','Takes 25% less damage. A Break ends it.']],wind:['Timber!','Rose'],braced:1,rect:[21,56,17,26],plate:[23.2,83.4,12],img:'log'},
 skeeter:{name:'Skeeter Swarm',hp:78,max:78,pips:0,maxPips:0,peeve:['drench','racket'],st:[['JITTERFLIGHT','Dodges 20% of attacks.']],wind:null,back:1,rect:[5.5,42,15,29],plate:[9.2,74.8,10.8],img:'skeeter'}
};
const ALLY_RECT={grace:[67.2,34,9,41],tom:[74.6,40,8.4,43],rose:[80.4,60,6.6,31],deedee:[85.4,56,8.6,43]};
const ORDER=['grace','deedee','tom','rose'];
const S={actor:'grace',sel:0,aim:'log',aimAlly:null,look:null,details:false,ruckus:35,busy:null,all:true,ko:false,keys:false,last:{}};
try{ const d=localStorage.getItem('aot-ux-details'); if(d!=null) S.details=d==='1'; else S.details=innerWidth>=1100; }catch(e){}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chip=(t,c,solid)=>'<span class="chip'+(solid?' solid':'')+(c?'':' plain')+'"'+(c?' style="--c:'+c+'"':'')+'>'+t+'</span>';
const fchip=f=>chip(IC[f]+FL[f],'var(--'+f+')');
const img=n=>IMG[n];

function movesOf(id){
  const C=CAST[id]; let m=C.moves.filter(x=>S.all||x.k!=='cap').map(x=>Object.assign({},x));
  const out=[];
  if(S.ruckus>=50){ const p=CAST[ORDER[(ORDER.indexOf(id)+1)%4]].name;
    out.push({n:'Double Team',ruck:50,k:'ruck',c:0,f:[],tg:'foe',s:'With '+p+': both Basics on one monster, +50% power.',d:C.name+' and '+p+', who is next on the turn bar, both use their Basic on one monster at +50% power. No Pep, and '+p+' still gets their own turn.',x:['With '+p,'Both Basics, +50% power']});
    if(S.ruckus>=100) out.push({n:'Full Family Ruckus',ruck:100,k:'ruck',c:0,f:[],tg:'all',s:'With '+p+': both fire their best Skill, free.',d:C.name+' and '+p+' both fire their best Main Vibe Skill, free, as one action. It can knock up to 4 Composure pips off.',x:['With '+p,'Best Skills, free','Up to 4 pips']}); }
  out.push(...m);
  if(S.ko&&id!=='rose') out.push({n:'Pick-Me-Up',k:'s',c:4,f:['support'],tg:'ko',s:'Gets Rose back up with a quarter of her HP.',d:'Gets a knocked-out family member back on their feet with a quarter of their HP.',x:['Back up with 29 HP'],pm:1});
  return out;
}
const actor=()=>CAST[S.actor];
const canUse=m=>m.ruck?true:actor().pep>=m.c;
function defaultAim(m){
  S.look=null;
  if(m.tg==='foe'){ if(!FOES[S.aim]) S.aim='log'; const best=Object.keys(FOES).find(k=>m.f.some(f=>FOES[k].peeve.includes(f))); S.aim=S.last[S.actor+'|'+m.n]||best||S.aim; S.aimAlly=null; }
  else if(m.tg==='ally'||m.tg==='fam'){ const others=ORDER.filter(i=>i!==S.actor||m.tg==='fam'); S.aimAlly=m.heal?others.slice().sort((a,b)=>CAST[a].hp/CAST[a].max-CAST[b].hp/CAST[b].max)[0]:others.find(i=>i!==S.actor); }
  else if(m.tg==='ko'){ S.aimAlly='rose'; }
  else S.aimAlly=null;
}
// What the move would do. Sample maths only.
function forecast(m,foeKey){
  const F=FOES[foeKey],out=[]; if(!F) return out;
  const pv=m.f.some(f=>F.peeve.includes(f)),dmgy=!!m.pw||m.ruck;
  if(dmgy){
    if(pv) out.push(chip('Pet Peeve +50%','var(--good)',1));
    let n=m.ruck?(m.ruck===100?150:58):BASE[m.pw]*(m.hits&&m.tg==='foe'?m.hits:1)*(pv?1.5:1)*(F.braced?.75:1); n=Math.round(n);
    out.push(chip(n>=F.hp?'Knocks it out':'About '+n+' damage',n>=F.hp?'var(--gold)':''));
    const pp=m.ruck===100?4:(m.pips||0)+(pv&&F.maxPips?1:0);
    if(pp&&F.maxPips){ const left=Math.max(0,F.pips-pp); out.push(chip(left?'Composure -'+pp+' ('+left+' of '+F.maxPips+' left)':'BREAK!', 'var(--gold)',!left)); }
    if(F.back&&m.f.includes('clobber')&&m.tg==='foe') out.push(chip('Back row: 20% less','var(--bad)'));
  }
  if(m.cancel&&F.wind) out.push(chip('Cancels '+F.wind[0],'var(--good)',1));
  if(m.scrub) out.push(chip(F.st.length?'Scrubs off '+F.st[0][0]:'No buff to scrub',F.st.length?'var(--good)':''));
  return out;
}
function nextTurnText(m){ const n=m.k==='basic'?3:m.k==='cap'?5:4; return actor().name+'’s next turn: after '+n+' others'; }

function renderBar(){
  const m=movesOf(S.actor)[S.sel],i0=ORDER.indexOf(S.actor),fam=ORDER.slice(i0).concat(ORDER.slice(0,i0));
  let seq=[fam[0],fam[1],'skeeter',fam[2],fam[3],'log'];
  const tk=(k,cls,extra)=>'<span class="tk '+(FOES[k]?'foe ':'')+cls+'" style="background-image:url('+img(FOES[k]?FOES[k].img:k)+')">'+(extra||'')+'</span>';
  let h='<span class="lbl">TURN</span>';
  const pushed=m&&m.push&&S.aim, pulled=m&&m.pull&&S.aimAlly;
  if(pulled&&!S.busy){ seq=seq.filter(k=>k!==S.aimAlly); seq.splice(1,0,S.aimAlly); }
  if(pushed&&!S.busy){ const ix=seq.indexOf(S.aim); seq.splice(ix,1); seq.splice(Math.min(seq.length,ix+2),0,S.aim); }
  seq.forEach((k,i)=>{ h+=tk(k,i===0&&!S.busy?'now':'',(pushed&&k===S.aim&&!S.busy)?'<i class="mvb">+30</i>':(pulled&&k===S.aimAlly&&!S.busy)?'<i class="mvb" style="background:#8fe3a6">NEXT</i>':''); });
  h+='<span class="rd"><b>2</b></span>';
  const r2=fam.slice(1).concat(['skeeter']); const gi=m?(m.k==='basic'?0:m.k==='cap'?2:1):1;
  r2.forEach((k,i)=>{ if(i===gi&&!S.busy) h+=tk(S.actor,'ghost'+(i>1?' far':i>0?' mid':'')); h+=tk(k,i>1?'far':i>0?'mid':''); });
  h+='<span class="sp"></span><button class="tool sw'+(S.details?' on':'')+'" data-tool="details">DETAILS<i></i></button><button class="tool" data-tool="speed">1x</button><button class="tool demo" data-tool="demo">MOCK</button>';
  $('bar').innerHTML=h;
}
function pepPips(n,cls){ let h=''; for(let i=0;i<10;i++) h+='<i class="'+(i<n?'on':'')+'"></i>'; return h; }
function renderParty(){
  const m=movesOf(S.actor)[S.sel];
  $('party').innerHTML=ORDER.map(id=>{ const C=CAST[id],ko=S.ko&&id==='rose',hp=ko?0:C.hp;
    return '<button class="pc'+(id===S.actor?' up':'')+(S.aimAlly===id&&!S.busy?' aim':'')+(ko?' ko':'')+'" data-ally="'+id+'"><img alt="" src="'+img(id)+'"><span class="l1"><b class="nm">'+C.name+'</b>'+C.st.map(s=>'<i class="st">'+s+'</i>').join('')+'<i class="hpn">'+(ko?'KO':hp+'<span style="opacity:.6">/'+C.max+'</span>')+'</i></span><span class="l2"><span class="hp'+(hp/C.max<=.25?' low':'')+'"><i style="width:'+(100*hp/C.max)+'%"></i></span><span class="pp">'+pepPips(C.pep)+'<b>'+C.pep+'</b></span></span></button>'; }).join('');
}
function renderScene(){
  const m=movesOf(S.actor)[S.sel]; let h='';
  for(const k of Object.keys(FOES)){ const F=FOES[k],r=F.rect,p=F.plate;
    const aimed=!S.busy&&m&&((m.tg==='foe'&&S.aim===k)||m.tg==='all');
    const fc=aimed&&m.f.some(f=>F.peeve.includes(f))?'<span class="fc">'+chip('Pet Peeve','var(--good)',1)+'</span>':'';
    h+='<div class="hot foe'+(aimed?' aim':'')+'" data-foe="'+k+'" style="left:'+r[0]+'%;top:'+r[1]+'%;width:'+r[2]+'%;height:'+r[3]+'%">'+fc+'</div>';
    h+='<div class="plate" style="left:'+p[0]+'%;top:'+p[1]+'%;width:'+p[2]+'%"><span class="hpb"><i style="width:'+(100*F.hp/F.max)+'%"></i></span>'+
      (F.maxPips?'<span class="pips">'+Array.from({length:F.maxPips},(_,i)=>'<i class="'+(i<F.pips?'':'off')+'"></i>').join('')+'</span>':'')+
      '<span class="pv">'+F.peeve.map(f=>'<span class="bdg" style="--c:var(--'+f+')">'+IC[f]+'</span>').join('')+'</span></div>'; }
  for(const id of ORDER){ const r=ALLY_RECT[id],aimed=!S.busy&&(S.aimAlly===id||(m&&m.tg==='team'));
    h+='<div class="hot ally'+(aimed?' aim':'')+'" data-ally="'+id+'" style="left:'+r[0]+'%;top:'+r[1]+'%;width:'+r[2]+'%;height:'+r[3]+'%">'+(id===S.actor&&!S.busy?'<span class="who">'+CAST[id].name.toUpperCase()+'</span>':'')+'</div>'; }
  $('scene').innerHTML=h;
}
function renderDeck(){
  const C=actor(),ms=movesOf(S.actor),m=ms[S.sel]; let spend=0,gain=0;
  if(m&&!S.busy){ if(m.k==='basic') gain=2; else if(!m.ruck&&canUse(m)) spend=m.c; }
  let pips=''; for(let i=0;i<10;i++) pips+='<i class="'+(i<C.pep-spend?'on':i<C.pep?'spend':i<C.pep+gain?'gain':'')+'"></i>';
  const sw='<button class="sw'+(S.details?' on':'')+'" data-tool="details" aria-pressed="'+S.details+'">DETAILS<i></i></button>';
  $('dh').innerHTML='<div class="meter">'+IC.bolt+'<span class="pips">'+pips+'</span><b>'+(spend?C.pep+' → '+(C.pep-spend):gain?C.pep+' → '+Math.min(10,C.pep+gain):C.pep+' Pep')+'</b></div>'+
    '<div class="meter rk"><span>RUCKUS</span><span class="track"><i style="width:'+S.ruckus+'%"></i></span><b>'+S.ruckus+'%</b></div>'+sw;
  let h='',grp='';
  ms.forEach((x,i)=>{
    const g=x.ruck?'Family Ruckus':x.pm?'Anyone':x.k==='basic'?'Basic':x.pk?'Pocket · '+C.pocket:'Main · '+C.main;
    if(g!==grp&&x.k!=='basic'&&!(grp==='Basic'&&!x.pk&&!x.ruck&&!x.pm)){ h+='<div class="grp">'+esc(g)+'</div>'; } grp=g;
    const ok=canUse(x)||!!S.busy,F=FOES[S.aim];
    const tag=x.tg==='foe'&&F&&x.f.some(f=>F.peeve.includes(f))?'<i class="tag pv">Pet Peeve</i>':x.tg==='all'&&Object.values(FOES).some(Fo=>x.f.some(f=>Fo.peeve.includes(f)))?'<i class="tag pv">Pet Peeve</i>':'';
    h+='<button class="mv'+(i===S.sel&&!S.busy?' sel':'')+(ok?'':' no')+(x.ruck?' ruck':'')+'" data-i="'+i+'">'+
      '<span class="fl">'+(x.ruck?'<span style="--c:var(--gold)">'+IC.razzle+'</span>':x.f.map(f=>'<span style="--c:var(--'+f+')">'+IC[f]+'</span>').join(''))+'</span>'+
      '<span class="nm"><i class="kb">'+(i+1)+'</i>'+(x.k==='cap'?'<span style="color:var(--gold)">\u2605 </span>':'')+esc(x.n)+'</span>'+
      (x.ruck?'<span class="cost rk">'+x.ruck+'%</span>':x.k==='basic'?'<span class="cost gain">+2'+IC.bolt+'</span>':'<span class="cost">'+x.c+IC.bolt+'</span>')+
      '<span class="sub">'+(x.ruck?'<b class="fw" style="--c:var(--gold)">Ruckus</b>':x.f.map(f=>'<b class="fw" style="--c:var(--'+f+')">'+FL[f]+'</b>').join('<span style="opacity:.5">+</span>'))+(x.k==='basic'?'<span style="color:var(--dim)">Basic</span>':'')+(ok?tag:'<span class="need">needs '+(x.c-C.pep)+' more Pep</span>')+'</span>'+
      '<span class="short">'+esc(x.s)+'</span>'+
      '<span class="use">'+(ok?'USE<small>'+(S.keys?'Enter':'tap again')+'</small>':'Needs '+(x.c-C.pep)+' more Pep')+'</span></button>';
  });
  const box=$('rows'); box.innerHTML=h; $('deck').classList.toggle('det',S.details); $('deck').classList.toggle('busy',!!S.busy); document.body.classList.toggle('keys',S.keys);
  const sel=box.querySelector('.mv.sel'); if(sel){ const r=sel.getBoundingClientRect(),b=box.getBoundingClientRect(); if(r.bottom>b.bottom) box.scrollTop+=r.bottom-b.bottom+6; else if(r.top<b.top) box.scrollTop-=b.top-r.top+6; }
}
function renderTray(){
  const T=$('tray');
  if(S.busy){ T.className='log'; T.innerHTML='<div class="logline">'+S.busy.t+(S.busy.s?'<small>'+S.busy.s+'</small>':'')+'</div>'; return; }
  T.className=T.classList.contains('open')&&T.dataset.m===S.actor+S.sel?'open':''; T.dataset.m=S.actor+S.sel;
  const C=actor(),m=movesOf(S.actor)[S.sel],ok=canUse(m);
  const kind=m.ruck?'Family Ruckus':m.k==='basic'?'Basic':m.k==='cap'?'Capstone':m.pm?'Revive':'Skill';
  let a='<div class="act"><div class="k">'+(m.ruck?chip('Ruckus','var(--gold)'):m.f.map(fchip).join(''))+(m.ruck?'':chip(m.pw?(m.hits?m.hits+' hits':PW[m.pw]):kind))+chip(m.tg==='self'?C.name+' only':m.tg==='ko'?'A knocked-out family member':REACH[m.tg]||'')+(m.pk?chip('Pocket Vibe'):'')+'</div>'+
    '<h3>'+esc(m.n)+'<em'+(m.k==='basic'?' class="gain"':'')+'>'+(m.ruck?m.ruck+'% RUCKUS':m.k==='basic'?'FREE, +2 PEP':m.c+' PEP')+'</em></h3>'+
    (ok?'':'<p class="why">'+C.name+' has '+C.pep+' Pep. This needs '+m.c+'. A Basic gives 2.</p>')+'<p class="full">'+esc(m.d)+'</p><p class="brief">'+esc(m.s)+'</p></div>';
  let t='';
  if(S.look){ const L=S.look;
    if(L.foe){ const F=FOES[L.foe]; t=unitHead(F.img,F.name,F.hp,F.max,'Not a target for this move')+'<div class="k info">'+F.st.map(s=>chip(s[0],'#e6c988')).join('')+'</div><div class="note">'+F.st.map(s=>'<b>'+s[0]+':</b> '+s[1]).join(' ')+'</div>'; }
    else { const A=CAST[L.ally]; t=unitHead(L.ally,A.name,A.hp,A.max,'Not a target for this move')+'<div class="k info">'+chip('Main: '+A.main)+chip('Pocket: '+A.pocket)+A.st.map(s=>chip(s,'#e6c988')).join('')+'</div>'+(A.st.length?'<div class="note"><b>GUARD:</b> takes 25% less damage.</div>':'<div class="note">Nothing on '+A.name+' right now.</div>'); } }
  else if(m.tg==='foe'){ const F=FOES[S.aim]; t=unitHead(F.img,F.name,F.hp,F.max,(F.maxPips?F.pips+' of '+F.maxPips+' Composure':'No Composure')+(F.back?' · Back row':''))+
      '<div class="k info"><span class="lab">Pet Peeves</span>'+F.peeve.map(f=>chip(IC[f]+FL[f],'var(--'+f+')')).join('')+F.st.map(s=>chip(s[0],'#e6c988')).join('')+(F.wind?chip('Winding up '+F.wind[0]+' at '+F.wind[1],'var(--bad)'):'')+'</div>'+
      '<div class="k">'+forecast(m,S.aim).join('')+m.x.map(x=>chip(x)).join('')+'</div><div class="note">'+nextTurnText(m)+'. <b>Tap a monster to aim at it.</b></div>'; }
  else if(m.tg==='all'||m.tg==='rand'){ t='<div class="h"><b>'+(m.tg==='all'?'Every monster':'Random monsters')+'</b></div>'+Object.keys(FOES).map(k=>'<div class="k"><span class="chip plain" style="border-color:transparent;padding-left:0">'+FOES[k].name+'</span>'+forecast(Object.assign({},m,{tg:'foe',hits:m.tg==='rand'?1:m.hits}),k).join('')+'</div>').join('')+'<div class="k">'+m.x.map(x=>chip(x)).join('')+'</div><div class="note">'+nextTurnText(m)+'</div>'; }
  else if(m.tg==='ally'||m.tg==='fam'||m.tg==='ko'){ const A=CAST[S.aimAlly]; const hl=m.heal?Math.min(A.max-A.hp,Math.round(A.max*m.heal)):0;
      t=unitHead(S.aimAlly,A.name,m.tg==='ko'?0:A.hp,A.max,m.tg==='ko'?'Knocked out':'Tap a family member to change')+'<div class="k">'+(m.heal?chip(hl?'+'+hl+' HP':'Already at full HP',hl?'var(--good)':'',!!hl):'')+m.x.map((x,i)=>chip(x,i===0&&!m.heal?'var(--good)':'',i===0&&!m.heal)).join('')+'</div><div class="note">'+nextTurnText(m)+'</div>'; }
  else { t='<div class="h"><b>'+(m.tg==='self'?C.name:m.tg==='team'?'The whole family':'The monsters’ floor')+'</b><span>No target to pick</span></div><div class="k">'+m.x.map(x=>chip(x)).join('')+'</div><div class="note">'+nextTurnText(m)+'</div>'; }
  T.innerHTML=a+'<div class="arr">▸</div><div class="tgt">'+t+'</div>';
}
function unitHead(im,name,hp,max,sub){ return '<div class="h"><img alt="" src="'+img(im)+'"><div><b>'+esc(name)+'</b><span>HP '+hp+'/'+max+(sub?' · '+sub:'')+'</span></div><span class="hp'+(hp/max<=.25?' low':'')+'"><i style="width:'+(100*hp/max)+'%"></i></span></div>'; }
function render(){ renderBar(); renderParty(); renderScene(); renderDeck(); renderTray(); }

function select(i){ const ms=movesOf(S.actor); if(!ms[i]) return; S.sel=i; defaultAim(ms[i]); render(); }
function use(){
  if(S.busy) return; const C=actor(),m=movesOf(S.actor)[S.sel]; if(!canUse(m)) return;
  let line=C.name+' uses '+m.n,sub='';
  if(m.tg==='foe'){ const F=FOES[S.aim]; S.last[S.actor+'|'+m.n]=S.aim; line+=' on '+F.name+'.'; const pv=m.f.some(f=>F.peeve.includes(f));
    let n=Math.round((m.ruck?58:BASE[m.pw||'light']*(m.hits||1))*(pv?1.5:1)*(F.braced?.75:1)); if(!m.pw&&!m.ruck) n=0;
    F.hp=Math.max(9,F.hp-n); if(pv&&F.maxPips) F.pips=Math.max(0,F.pips-1); if(m.cancel) F.wind=null; if(m.scrub){ F.st=[]; F.braced=0; }
    sub=(pv?'Pet Peeve! ':'')+(n?n+' damage. ':'')+(m.cancel?'Its wind-up is cancelled. ':''); }
  else if(m.tg==='all'||m.tg==='rand'){ line+='.'; for(const k of Object.keys(FOES)){ const F=FOES[k],pv=m.f.some(f=>F.peeve.includes(f)); F.hp=Math.max(9,F.hp-Math.round((m.ruck?75:BASE[m.pw]*(m.tg==='rand'?(m.hits||1)/2:1))*(pv?1.5:1)*(F.braced?.75:1))); if(F.maxPips) F.pips=Math.max(0,F.pips-((m.pips||0)+(pv?1:0)+(m.ruck?2:0))); } sub='Sample numbers. The monsters in this mock never fall.'; }
  else if(S.aimAlly){ const A=CAST[S.aimAlly]; line+=' on '+A.name+'.'; if(m.heal){ A.hp=Math.min(A.max,A.hp+Math.round(A.max*m.heal)); } if(m.pm) S.ko=false; }
  else line+='.';
  if(m.ruck) S.ruckus-=m.ruck; else { if(m.k==='basic') C.pep=Math.min(10,C.pep+2); else C.pep-=m.c; S.ruckus=Math.min(100,S.ruckus+(m.hits||1)*4+6); }
  S.busy={t:esc(line),s:sub}; render();
  setTimeout(()=>{ const i=ORDER.indexOf(S.actor);
    if(i===1||i===3){ const F=i===1?FOES.skeeter:FOES.log,who=i===1?'Tom':'Rose'; S.busy={t:F.name+(i===1?' uses Darting Bite on Tom.':FOES.log.wind?' winds up Timber! It lands on its next turn.':' uses Branch Jab on Rose.'),s:'While monsters act, this strip is the battle log.'}; if(i===1) CAST.tom.hp=Math.max(20,CAST.tom.hp-11); if(i===3&&!FOES.log.wind) FOES.log.wind=['Timber!','Rose']; render(); setTimeout(()=>next(i),1500); }
    else next(i); },1250);
}
function next(i){ S.actor=ORDER[(i+1)%4]; if(S.ko&&S.actor==='rose') S.actor=ORDER[0]; S.busy=null; S.sel=movesOf(S.actor).findIndex(m=>m.k==='basic'); defaultAim(movesOf(S.actor)[S.sel]); render(); }
function tapFoe(k){ if(S.busy) return; const m=movesOf(S.actor)[S.sel]; if(m.tg==='foe'){ S.look=null; if(S.aim===k&&!S.keys){ /* a second tap on the aimed monster does not fire: only the move does */ } S.aim=k; } else S.look=(S.look&&S.look.foe===k)?null:{foe:k}; render(); }
function tapAlly(id){ if(S.busy) return; const m=movesOf(S.actor)[S.sel];
  if((m.tg==='ally'&&id!==S.actor)||m.tg==='fam'){ if(!(S.ko&&id==='rose')){ S.aimAlly=id; S.look=null; } } else S.look=(S.look&&S.look.ally===id)?null:{ally:id}; render(); }
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-i],[data-foe],[data-ally],[data-tool],[data-demo]'); if(!t){ if(!e.target.closest('#demo')) $('demo').classList.remove('open'); if(e.target.closest('#tray')) $('tray').classList.toggle('open'); return; }
  if(t.dataset.demo){ demo(t.dataset.demo); return; }
  if(t.dataset.tool==='demo'){ $('demo').classList.toggle('open'); return; }
  if(t.dataset.tool==='details'){ S.details=!S.details; try{ localStorage.setItem('aot-ux-details',S.details?'1':'0'); }catch(e){} render(); return; }
  if(t.dataset.tool) return;
  if(S.keys){ S.keys=false; }
  if(t.dataset.i!=null){ const i=+t.dataset.i; if(S.busy) return; if(i===S.sel) use(); else select(i); return; }
  if(t.dataset.foe) return tapFoe(t.dataset.foe);
  if(t.dataset.ally) return tapAlly(t.dataset.ally);
});
document.addEventListener('keydown',e=>{
  if(S.busy) return; const ms=movesOf(S.actor),m=ms[S.sel]; let hit=true;
  if(e.key==='ArrowDown'||e.key==='s') { S.keys=true; select((S.sel+1)%ms.length); }
  else if(e.key==='ArrowUp'||e.key==='w') { S.keys=true; select((S.sel+ms.length-1)%ms.length); }
  else if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='a'||e.key==='d'){ S.keys=true; if(m.tg==='foe'){ const ks=Object.keys(FOES); S.aim=ks[(ks.indexOf(S.aim)+1)%ks.length]; } else if(m.tg==='ally'||m.tg==='fam'){ const os=ORDER.filter(i=>m.tg==='fam'||i!==S.actor); S.aimAlly=os[(os.indexOf(S.aimAlly)+(e.key==='ArrowLeft'||e.key==='a'?os.length-1:1))%os.length]; } render(); }
  else if(e.key==='Enter'||e.key===' ') { S.keys=true; use(); }
  else if(e.key==='i'||e.key==='I'){ S.details=!S.details; render(); }
  else if(/^[1-9]$/.test(e.key)&&ms[+e.key-1]) { S.keys=true; select(+e.key-1); }
  else hit=false;
  if(hit) e.preventDefault();
});
function demo(k){
  if(k.startsWith('rk')) S.ruckus=+k.slice(2);
  else if(k==='moves') S.all=!S.all;
  else if(k==='ko') S.ko=!S.ko;
  else if(k==='pep') actor().pep=actor().pep>=8?1:actor().pep+3;
  else if(k==='notes'){ (window.top||window).location.href=location.pathname+'?notes=1'; return; }
  else if(k==='admin'){ (window.top||window).location.href='admin.html'; return; }
  S.sel=Math.min(S.sel,movesOf(S.actor).length-1); if(S.ko&&S.actor==='rose') S.actor='grace';
  S.sel=movesOf(S.actor).findIndex(m=>m.k==='basic'); defaultAim(movesOf(S.actor)[S.sel]); renderDemo(); render();
}
function renderDemo(){
  $('demo').innerHTML='<h4>MOCK CONTROLS</h4><p>These are not part of the design. They change the sample fight so you can see each state.</p>'+
    '<div class="r">'+[0,35,50,100].map(n=>'<button data-demo="rk'+n+'" class="'+(S.ruckus===n?'on':'')+'">Ruckus '+n+'%</button>').join('')+'</div>'+
    '<div class="r"><button data-demo="moves" class="'+(S.all?'on':'')+'">'+(S.all?'All 7 moves (Rank 4+)':'5 moves (chapter 1)')+'</button><button data-demo="ko" class="'+(S.ko?'on':'')+'">Rose knocked out</button><button data-demo="pep">More Pep</button></div>'+
    '<div class="r"><button data-demo="notes">Open the proposal notes</button><button data-demo="admin">Back to Admin</button></div>';
}
function startApp(){
  const q=new URLSearchParams(location.search),sf=(q.get('safe')||'').split(',').map(Number);
  if(sf.length===4) ['st','sr','sb','sl'].forEach((k,i)=>$('app').style.setProperty('--'+k,(sf[i]||0)+'px'));
  $('scene').style.backgroundImage='url('+IMG.scene+')';
  S.sel=movesOf(S.actor).findIndex(m=>m.k==='basic'); defaultAim(movesOf(S.actor)[S.sel]); renderDemo(); render();
  window.__UX={S,select,use,render,movesOf};
}
