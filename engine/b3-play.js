'use strict';
// engine/b3-play.js — Battle 3 play layer: turns beats into what the player sees (architecture section 2.7).
// The rules (engine/b3-core.js and the other rules files) have already worked out the whole result of an action when this
// file gets its beats. Nothing here changes the fight. It moves bodies, shows numbers, and keeps a VIEW of the fight
// (HP, Pep, statuses, the turn bar) that follows the beats as they are revealed, so nothing shows early.
//
// Drawing: Battle 3 has its own draw function (b3Draw) for the party and the enemies. It reuses the shared stage: the battle
// canvas and its 576 x 324 coordinates, the painted backdrops (BG_IMG), drawSprite and the painted sheets, the party's battle
// frames (BATTLE_SPRITES), the monsters' art (MONSTERS), the painted meter (btMeter) and the pixel font (label).
// engine/battle.js calls b3Update and engine/battle-draw.js calls b3Draw while battle.v3 is set.
//
// Reactions (a ward's answer) play after the move that set them off, one at a time; what a turn's end writes comes last.
// Composure: an Elite or a Boss wears its pips under its HP meter. A Break shows BREAK!, the monster slumps with stars over its
// head and its face on the turn bar tips over; a Marked family member wears a red arrow and a MARKED chip on their card.
//
// Two animation kinds per move: the default is built here from the move's shape (its spec's body.motion) with frames every character already has.
// A video clip (engine/b3-clips.js) plays the move from the clip its spec names (body.clip, engine/b3-spec.js msAnimOf) and lands its hit on the clip's impact frame.
// Every kind ends by calling reveal(), which shows the next hit's beats.

const B3={active:false,F:null,cfg:null,view:null,ui:'busy',sel:0,opts:[],pending:null,actor:null,result:null,artWait:false,log:[]};
const B3P={t:0,q:[],body:{},foe:{},fa:{},pops:[],words:[],fx:[],at:{},flash:null,cheer:false,cheerAt:null,cheerKey:null};   // at: where each family member was last drawn (vfxfight1: library effects land there)
// How an enemy stands that is not in its art: flyers hover this many pixels off the ground.
const B3_BOSS_SIZE=2.5;   // every boss is drawn 2.5 times the usual fit (Tom 2026-11-21, report r-20261121-180138-yorh: "all bosses should be HUGE, at least 2.5x larger")
const B3_FOE_LOOK={skeeter:{hover:14},bigone:{size:2.5}};   // size: drawn this many times larger than the usual fit (Tom 2026-11-21: the Big One 2.5x)
// stage 22 chapter 14: a returning Part 1 monster (data/b3-foes-ch14.js, id with `_r`) is drawn with its Part 1 painting (`art`), so it takes that painting's look too, and `size` on its row (1.25: 25% larger) is its own.
const b3Look=f=>B3_FOE_LOOK[f.id]||B3_FOE_LOOK[f.D&&f.D.art]||{};
// How long the default move animations take, as a multiple of the first build's pace. Tom, 2026-11-18: they were about 2x too fast.
// One number: 1 is the old quick pace, 2 is twice as long. The battle speed button (1x / 2x) still halves it for the player.
const B3_TEMPO=2;
// Body states (architecture 2.7): which painted frame shows each state when no clip does. A state's clip is in its spec (body:<owner>:<state>, engine/b3-spec.js msStateClip).
const B3_BODY={idle:'idle',hit:'hurtPose',low:'kneel',windup:'windup',dash:'leap',strike:'act',cast:'castPose',give:'point',victory:'celeb'};

// ---------- Timing: everything runs on the battle clock, so 2x speed and the REPORT freeze both work ----------
function b3After(sec,fn) { B3P.q.push({at:B3P.t+sec,fn}); }
function b3Update(dt) {
  B3P.t+=dt;
  for(let guard=0;guard<200;guard++) {
    let k=-1; for(let i=0;i<B3P.q.length;i++) if(B3P.q[i].at<=B3P.t&&(k<0||B3P.q[i].at<B3P.q[k].at)) k=i;
    if(k<0) break;
    const s=B3P.q.splice(k,1)[0];
    try { s.fn(); } catch(err) { gameFault('battle step',err); }
  }
  B3P.pops=B3P.pops.filter(p=>B3P.t-p.t0<p.dur); B3P.words=B3P.words.filter(w=>B3P.t-w.t0<w.dur); B3P.fx=B3P.fx.filter(f=>B3P.t-f.t0<f.dur);
  if(B3P.flash&&B3P.t-B3P.flash.t0>=B3P.flash.dur) B3P.flash=null;
}
function b3PlayReset() { Object.assign(B3P,{t:0,q:[],body:{},foe:{},fa:{},pops:[],words:[],fx:[],at:{},flash:null,cheer:false,cheerAt:null,cheerKey:null}); if(typeof B3C!=='undefined') B3C.gs={}; if(typeof b3gReset==='function') b3gReset(); if(typeof b3vReset==='function') b3vReset(); }   // wanch1: guard clip state starts fresh with the fight's clock

// ---------- The view: what the screen shows right now ----------
function b3ViewSync() {
  const F=B3.F,V=B3.view||(B3.view={u:{},bar:[],charge:{},mark:{},aim:{},haz:[]});
  V.aim=V.aim||{};
  for(const u of F.units) V.u[u.key]=Object.assign(V.u[u.key]||{},{hp:u.hp,maxHp:u.maxHp,pep:u.pep,st:Object.keys(u.st),ko:u.ko,sh:b3ShieldTotal(u),pips:u.pips,maxPips:u.maxPips,ctr:b3CounterShown(u)});
  V.haz=F.hazards.map(h=>({id:h.id,side:h.side,uses:h.uses}));
  V.ruckus=F.ruckus;   // the Family Ruckus gauge (0 to 100)
  // The aim Cartridge Blow showed (a monster's `intent`): kept while it holds, gone when the monster's turn spends it.
  for(const f of F.foes) { if(f.intent&&f.intent.aim) V.aim[f.key]=f.intent.aim; else delete V.aim[f.key]; }
  for(const f of F.foes) { if(f.charge) V.charge[f.key]=f.charge.name; else delete V.charge[f.key]; if(f.mark) V.mark[f.key]=f.mark; else delete V.mark[f.key]; }
}
// The Portable Counter a portrait shows as a number (spec 2.8): the first one this unit is building, 0 when it has none.
function b3CounterShown(u) { const k=Object.keys(u.counterInfo||{})[0]; return k?u.counters[k]||0:0; }
// Is this family member Marked by a monster right now (in the view)?
const b3ViewMarked=key=>Object.keys(B3.view.mark).some(f=>B3.view.mark[f]===key);
// Is a monster about to aim its next attack here, as Cartridge Blow showed (in the view)?
const b3ViewAimed=key=>Object.keys(B3.view.aim||{}).some(f=>B3.view.aim[f]===key);
// The 3 icons for a unit in the view (spec 2.8): its Prime, its strongest debuff, its strongest buff.
function b3ViewIcons(key) {
  const ids=(B3.view.u[key]||{}).st||[],pick=kinds=>ids.filter(id=>B3_STATUS[id]&&kinds.includes(B3_STATUS[id].kind)).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight)[0];
  return [pick(['prime']),pick(['debuff','mark']),pick(['buff','stance'])].filter(Boolean);
}

// ---------- Where everyone stands (576 x 324) ----------
// Someone in the Back row stands a little further from the monsters.
function b3PartyHome(u) { const T=[null,BATTLE_POS1,BATTLE_POS2,BATTLE_POS3][B3.F.party.length]||BATTLE_POS4,p=T[u.slot]; return {cx:p.x*3+(u.row==='back'?14:0),base:p.base*3}; }
// Enemy slots: the front row stands around the old centre spot, the back row behind it further left. Slots stay put when someone falls.
function b3LayoutFoes() {
  const F=B3.F,fr=F.foes.filter(f=>f.row!=='back'),bk=F.foes.filter(f=>f.row==='back'),n=F.foes.length,want=[0,96,80,68,60][n]||60;
  const fy={1:[264],2:[224,302],3:[218,262,306]},fx={1:[168],2:[184,156],3:[188,158,188]},by={1:[236],2:[214,268]},bx={1:[84],2:[92,70]};
  const place=(f,px,py,k)=>{ const def=btBattleDef(MONSTERS[f.D.art||f.id]),base=def.scale||3,w=def.sprite[0].length;
    B3P.foe[f.key]={def,px,py,sc:Math.max(base*.7,Math.min(base*1.3,want/w))*k*(def.shrink||1)*(b3Look(f).size||(f.D&&f.D.size)||(f.D&&f.D.role==='boss'&&!f.add?B3_BOSS_SIZE:1))}; B3P.fa[f.key]={lunge:null,hurtUntil:0,shakeUntil:0,flashUntil:0,die:null,hold:0}; };
  fr.forEach((f,k)=>place(f,(fx[fr.length]||fx[3])[k%3],(fy[fr.length]||fy[3])[k%3],1));
  // A helper of a linked foe (data/b3-foes-ch13.js `helperLink`) stands in the gap between the boss and the family, not behind the boss: the boss is drawn 2.5 times large and would hide it,
  // and knocking the helper out is the point of the fight. Every other Back foe keeps its slot.
  let hk=0; bk.forEach((f,k)=>{ const g=b3HelperOf(F,f)?B3_GAP_SPOTS[hk++%2]:null; place(f,g?g[0]:(bx[bk.length]||bx[2])[k%2],g?g[1]:(by[bk.length]||by[2])[k%2],.9); });
}
// The spots of a linked helper (the Drill Worm's Wired Relay Hushling): right of the boss, in front of it (a lower y draws later), left of the family.
const B3_GAP_SPOTS=[[322,300],[312,236]];
// Stage 22 chapter 15: `helpers:[id]` on a boss row says the same thing for layout only (HUSH-9's speaker pods stand in the gap, no damage reduction comes with it).
function b3HelperOf(F,f) { return F.foes.some(o=>o!==f&&o.D&&((o.D.helperLink&&o.D.helperLink.id===f.id)||(o.D.helpers&&o.D.helpers.includes(f.id)))&&b3Alive(o)); }
// An add walks in mid-fight: it takes the free spot of its row that is furthest from everyone standing. Nobody else moves.
// Front adds stand between the caller and the family (they are its blockers); Back adds stand behind it.
const B3_ADD_SPOTS={front:[[246,230],[240,304],[262,267]],back:[[92,214],[70,268],[58,236]]};
function b3FreeSpot(f,back) {
  const taken=B3.F.foes.filter(o=>o!==f&&B3P.foe[o.key]&&b3Alive(o)).map(o=>B3P.foe[o.key]);
  let best=null,bd=-1;
  for(const s of (back&&b3HelperOf(B3.F,f)?B3_GAP_SPOTS:B3_ADD_SPOTS[back?'back':'front'])) { const d=taken.reduce((m,o)=>Math.min(m,Math.hypot((o.px-s[0])*.6,o.py-s[1])),1e9); if(d>bd) { bd=d; best=s; } }
  return best;
}
function b3LayoutAdd(key) {
  const F=B3.F,f=b3Unit(F,key),def=btBattleDef(MONSTERS[f.D.art||f.id]),base=def.scale||3,w=def.sprite[0].length,back=f.row==='back';
  const best=b3FreeSpot(f,back);
  B3P.foe[key]={def,px:best[0],py:best[1],sc:Math.max(base*.7,Math.min(base*1.3,58/w))*(back?.9:1)*(def.shrink||1)};   // an add is drawn small: 58 wide
  B3P.fa[key]={lunge:null,hurtUntil:0,shakeUntil:0,flashUntil:0,die:null,hold:0,born:B3P.t};
}
function b3FoeBox(key) { const L=B3P.foe[key],R=L.def.sprite,w=R[0].length*L.sc,h=R.length*L.sc,hov=(B3_FOE_LOOK[L.def.id]||{}).hover||0; return {x:L.px,y:L.py-hov,w,h}; }
// A point on a unit: its middle (aim here), the top of its head, and the spot an attacker stands at.
function b3Spot(key) {
  const u=b3Unit(B3.F,key);
  if(u.side==='foe') { const b=b3FoeBox(key); return {x:b.x,y:b.y-b.h*.5,top:b.y-b.h,base:b.y,sx:Math.min(430,b.x+b.w*.5+34),sb:Math.max(190,Math.min(312,B3P.foe[key].py+4))}; }
  const h=b3PartyHome(u),sp=BATTLE_SPRITES[u.id],H=sp.idle.length*sp.scale;
  return {x:h.cx,y:h.base-H*.5,top:h.base-H,base:h.base,sx:h.cx-58,sb:h.base};
}

// ---------- Small shows ----------
// A number or a tag over a unit. It starts above whatever the unit already carries over its head, and above earlier pops still rising.
function b3Pop(key,text,color,o) {
  const s=b3Spot(key),sc=(o&&o.sc)||3,tags=key[0]==='f'?b3ViewIcons(key).length+(B3.view.charge[key]?1:0):0;
  let y=s.top-16-tags*13-sc*5;
  for(const p of B3P.pops) if(p.key===key&&B3P.t-p.t0<.6) y=Math.min(y,p.y-sc*5-4);
  B3P.pops.push(Object.assign({key,text,color,x:s.x,y,t0:B3P.t,dur:1.1,sc:3},o||{}));
}
function b3Word(text,color) { B3P.words.push({text,color,t0:B3P.t,dur:1.35}); }
function b3Sfx(k) { try { if(typeof sfx!=='undefined'&&sfx[k]) sfx[k](); } catch(e) {} }
// A line for the battle log: the tray shows it while a move or a monster plays (engine/b3-deck.js); while the player picks, it is a note over the tray
// (a reason a move cannot be used, a story tip). #b3-msg is the same line for a screen reader.
function b3Say(text) {
  const el=$('b3-msg'); if(el) el.textContent=text; B3.log.push(text); if(B3.log.length>60) B3.log.shift();
  B3.say=text; if(B3.ui==='deck'&&battle.state==='command') B3.note=text;
  if(typeof b3RenderTray==='function'&&B3.F&&B3.view) b3RenderTray();
}
const b3Name=key=>b3Unit(B3.F,key).name;

// ---------- Showing one beat ----------
function b3Show(b) {
  const V=B3.view,vu=b.tgt?V.u[b.tgt]:null,now=B3P.t;
  if((b.t==='react'||b.t==='intercept')&&typeof b3gBeat==='function') b3gBeat(b);   // movestage2: a lasting stage element answers (engine/b3-stage.js)
  if(b.t==='round') { b3Word('ROUND '+b.n,'#fff1cb'); }
  else if(b.t==='turn') { V.bar=b.bar; B3.turnOf=b.who; b3RenderBar(); }
  else if(b.t==='hit') {
    vu.hp=b.hp;
    const fl=B3_FLAVORS[b.flavor]||B3_FLAVORS.clobber;
    b3Pop(b.tgt,String(b.dmg)+(b.crit?'!':''),fl.color,{sc:b.crit?4:3});
    if(b.peeve) b3Pop(b.tgt,'PET PEEVE','#ffe27a',{sc:2}); else if(b.resist) b3Pop(b.tgt,'RESIST','#aeb6c6',{sc:2});
    if(b.tick) b3Pop(b.tgt,B3_STATUS[b.tick].short,B3_STATUS[b.tick].color,{sc:2});
    if(b.soak) { vu.sh=b.sh; b3Pop(b.tgt,'SHIELD TOOK '+b.soak,'#9fd0ff',{sc:2}); }
    if(b.tgt[0]==='f') { const a=B3P.fa[b.tgt],hc=b3cFoeClip(b.tgt,'hit'); a.hurtUntil=now+.7; a.shakeUntil=now+(hc?0:.28); a.flashUntil=now+.09; b3Sfx('hitEnemy'); }
    else { if(b3GuardShown(b.tgt)) B3P.body[b.tgt]={kind:'hit',guard:true,t0:now,dur:.4};   // braced: the guard video takes the hit and slides back a little
      else if(!b3cBodyClip(b.tgt,'hit',true)) B3P.body[b.tgt]={kind:'hit',t0:now,dur:.45}; b3Sfx('hitParty'); }
    B3P.fx.push({kind:'burst',x:b3Spot(b.tgt).x,y:b3Spot(b.tgt).y,color:fl.color,t0:now,dur:.35});
  }
  else if(b.t==='miss') { b3Pop(b.tgt,b.why==='dodge'?'DODGE':'MISS','#e8ecf4'); b3Sfx('whoosh'); if(b.tgt[0]!=='f'&&!b3cBodyClip(b.tgt,'dodge')&&b3cVideoOnly(b3Unit(B3.F,b.tgt))) B3P.body[b.tgt]={kind:'dodge',t0:now,dur:B3_DODGE.dur}; if(b.why==='hidden') b3Say(b3Name(b.src)+' cannot find '+b3Name(b.tgt)+'. It misses.'); }
  else if(b.t==='status') {
    // An enemy wears its top 3 statuses over its head, so the new tag is the news; anything else gets a rising tag.
    const had=b.tgt[0]==='f'?b3ViewIcons(b.tgt).length:0;
    if(!vu.st.includes(b.id)) vu.st.push(b.id);
    const S=B3_STATUS[b.id],grew=b.tgt[0]==='f'&&b3ViewIcons(b.tgt).length>had;
    if(b.tgt[0]!=='f'||!b3ViewIcons(b.tgt).includes(b.id)) b3Pop(b.tgt,S.short,S.color,{sc:2});
    else if(grew) for(const p of B3P.pops) if(p.key===b.tgt&&now-p.t0<.7) p.y-=13;   // numbers still rising make room for the new tag
  }
  else if(b.t==='statusEnd') { vu.st=vu.st.filter(id=>id!==b.id); if(b.why==='strip') b3Pop(b.tgt,'LOST '+B3_STATUS[b.id].short,'#e8ecf4',{sc:2}); else if(b.why==='cleanse') b3Pop(b.tgt,'CLEARED '+B3_STATUS[b.id].short,'#9be39a',{sc:2}); }
  else if(b.t==='heal') { vu.hp=b.hp; b3Pop(b.tgt,'+'+b.n,'#8fe3a6'); b3Sfx('heal'); }
  else if(b.t==='shield') { vu.sh=b.sh; if(b.n) b3Pop(b.tgt,'SHIELD +'+b.n,'#9fd0ff',{sc:2}); }
  else if(b.t==='shieldBroken') { b3Pop(b.tgt,'SHIELD BROKE','#9fd0ff',{sc:2}); }
  else if(b.t==='survive') { b3Pop(b.tgt,'HELD ON!','#ffe08a',{sc:2}); }
  else if(b.t==='immune') { b3Pop(b.tgt,'NOT TODAY','#c8e6c9'); }
  else if(b.t==='shieldEnd') { vu.sh=b.sh; }
  else if(b.t==='soak') { b3Pop(b.tgt,'NO '+B3_STATUS[b.id].short,'#9fd0ff',{sc:2}); }
  else if(b.t==='revive') {
    vu.ko=false; vu.hp=b.hp; vu.st=[]; delete B3P.body[b.tgt]; V.bar=b.bar; b3RenderBar(b.tgt);
    b3Pop(b.tgt,'BACK UP!','#9be39a'); b3Sfx('heal'); b3Say(b3Name(b.tgt)+' is back in the fight with '+b.hp+' HP.');
  }
  else if(b.t==='standUp') { vu.ko=false; vu.hp=b.hp; delete B3P.body[b.tgt]; }
  else if(b.t==='skip') { const fz=B3.F&&b3HasFlag(b3Unit(B3.F,b.who),'frozen'); b3Pop(b.who,fz?'FROZEN':'STUNNED',fz?'#aee6ff':'#f2d36b'); b3Say(b3Name(b.who)+(fz?' is frozen solid and loses the turn.':' is stunned and loses the turn.')); }
  else if(b.t==='script') { if(b.word) b3Word(b.word,b.color||'#fff1cb'); if(b.sfx) b3Sfx(b.sfx); b3Say(b.text); }
  else if(b.t==='intercept') { b3Pop(b.src,'STEPS IN','#c9d8f0',{sc:2}); b3Say(b3Name(b.src)+' steps in for '+b3Name(b.tgt)+'.'); }
  else if(b.t==='react') {
    // A reaction begins: its owner strikes a pose and sends the answer across; the hit itself follows in the same group of beats.
    const S=B3_STATUS[b.id],a=b3Spot(b.src),z=b3Spot(b.tgt),K=B3_TEMPO;
    b3Say(b3Name(b.src)+': '+b.name+'!'); b3Pop(b.src,S?S.short:'ANSWER',S?S.color:'#fff1cb',{sc:2});
    if(b.src[0]==='f') B3P.fa[b.src].hold=now+.4*K; else B3P.body[b.src]={kind:'pose',f:B3_BODY.strike,t0:now,dur:.6*K};
    B3P.fx.push({kind:'proj',x0:a.x,y0:a.y,x1:z.x,y1:z.y,color:(S&&S.color)||'#fff1cb',t0:now+.05,dur:.28*K,arc:22}); b3Sfx('whoosh');
  }
  else if(b.t==='interrupt') { delete V.charge[b.tgt]; delete V.mark[b.tgt]; if(B3P.fa[b.tgt]) B3P.fa[b.tgt].windId=null; b3Pop(b.tgt,b.why==='break'?'LOST IT':'INTERRUPTED','#ffe27a',{sc:2}); b3Sfx('combo'); b3Say(b3Name(b.tgt)+' loses '+b.name+'. It was cancelled.'); }
  else if(b.t==='pips') {
    vu.pips=b.left; vu.maxPips=b.max;
    if(b.refill) b3Pop(b.tgt,'COMPOSURE BACK','#ffd27a',{sc:2});
    else { b3Pop(b.tgt,'-'+b.n+(b.n===1?' PIP':' PIPS'),'#ffd27a',{sc:2}); B3P.fa[b.tgt].pipAt=now; }
  }
  else if(b.t==='break') {
    V.bar=b.bar; b3RenderBar(b.tgt);
    b3Word('BREAK!','#ff9a8a'); B3P.flash={color:'#ff9a8a',t0:now,dur:.45}; b3Sfx('combo'); B3P.fa[b.tgt].shakeUntil=now+.5; B3P.fa[b.tgt].hurtUntil=now+.9; B3P.fa[b.tgt].flusT=now; B3P.fa[b.tgt].windId=null;
    b3Say('BREAK! '+b3Name(b.tgt)+' is Flustered: it takes 35% more damage until its next turn.');
  }
  else if(b.t==='summon') {
    V.u[b.tgt]={hp:b.hp,maxHp:b.hp,pep:undefined,st:[],ko:false,sh:0,pips:0,maxPips:0};
    b3LayoutAdd(b.tgt); V.bar=b.bar; b3RenderBar(b.tgt); b3Sfx('intro'); b3Say(b.name+' joins the fight!');
  }
  else if(b.t==='stance') {   // stage 22 (chapter 17): the Twin Lenses swap lens (the Pet Peeve chips under it change with it)
    b3Word(b.name.toUpperCase(),'#9ec9ff'); b3Sfx('intro'); b3Say(b3Name(b.tgt)+' swaps to its '+b.name+'.');
  }
  else if(b.t==='phase') {   // stage 22 (chapter 20): the Collector's HP reached a phase line; the next phase starts at once
    vu.hp=b.hp; const nm=b.phase===2?'PHASE 2':b.phase===3?'PHASE 3':'PHASE '+b.phase; b3Word(nm,'#ffd27a'); B3P.flash={color:'#ffd27a',t0:now,dur:.5}; b3Sfx('intro');
    b3Say(b3Name(b.tgt)+' starts '+nm.toLowerCase()+'. Damage past a phase line is lost.');
  }
  else if(b.t==='frame') {   // stage 22 (chapter 20): Still Frame snapshots the family
    b3Word('STILL FRAME','#9ec9ff'); b3Sfx('intro'); for(const k of b.tgts) b3Pop(k,'FRAMED','#9ec9ff',{sc:2});
    b3Say('Still Frame! Before or on your next turn, move on the turn bar or take part in a Mix or a Detonation.');
  }
  else if(b.t==='frameMiss') {
    if(vu) vu.pep=b.pep; b3Pop(b.tgt,'STILL: -'+b.lost+' PEP, SLOW','#ffd27a',{sc:2}); b3Say(b3Name(b.tgt)+' held still: -'+b.lost+' Pep and Slowed.');
  }
  else if(b.t==='repick') {   // the four are picked again (spec 2.1): the newcomers take the leavers' seats
    for(const k of b.inn.concat(b.out)) { delete B3P.body[k]; if(typeof B3C!=='undefined'&&B3C.gs) delete B3C.gs[k]; }
    b3ViewSync(); b3LayoutFoes(); for(const k of b.inn) b3Pop(k,'IN!','#9be39a',{sc:2}); b3Sfx('heal');
    b3Say('The family changes places: '+b.inn.map(k=>b3Name(k)).join(', ')+' step in.');
  }
  else if(b.t==='stamp') {   // stage 22 (chapter 19): the Censor stamps a flavor REDACTED
    b3Word('REDACTED','#d85a4a'); b3Sfx('intro'); b3Say(b3Name(b.tgt)+' stamps '+b.name+' REDACTED.');
  }
  else if(b.t==='row') {
    // A monster changes its own row (Old Iron-Gill dives to the Back and comes up again): it keeps its size (a Back-row monster is
    // drawn a tenth smaller) and walks to the free spot of that row furthest from everyone standing. Nobody else moves.
    const L=B3P.foe[b.tgt],u=b3Unit(B3.F,b.tgt);
    if(L&&u) { const spot=b3FreeSpot(u,b.row==='back'); L.px=spot[0]; L.py=spot[1]; L.sc*=b.row==='back'?.9:1/.9;
      b3Sfx('thud'); b3Say(u.name+(b.row==='back'?' dives under the surface.':' comes back up.')); }
  }
  else if(b.t==='rowTrade') {
    // Gate Change: two family members swap rows. Their spots follow `u.row` on the next frame (b3PartyHome); the cards say Back or not.
    b3Sfx('thud'); b3Pop(b.a,b.rowA==='back'?'TO THE BACK':'TO THE FRONT','#ffd27a',{sc:2}); b3Pop(b.b,b.rowB==='back'?'TO THE BACK':'TO THE FRONT','#ffd27a',{sc:2});
    b3Say(b3Name(b.a)+' and '+b3Name(b.b)+' trade rows.'); if(typeof b3RenderParty==='function') b3RenderParty();
  }
  else if(b.t==='hazardOn') { V.haz=V.haz.filter(h=>!(h.id===b.id&&h.side===b.side)); V.haz.push({id:b.id,side:b.side,uses:b.uses}); b3Word(B3_HAZARDS[b.id].name.toUpperCase(),B3_HAZARDS[b.id].color); }
  else if(b.t==='hazardTrip') { const h=V.haz.find(x=>x.id===b.id),H=B3_HAZARDS[b.id]; if(h) h.uses=b.left; b3Pop(b.tgt,H.pop||'SLIPPED!',H.color); b3Sfx('thud'); if(b.tgt[0]==='f') b3cFoeClip(b.tgt,'slip'); b3Say(b3Name(b.tgt)+' '+(H.verb||'slips on')+' the '+H.name.toLowerCase()+'.'); }
  else if(b.t==='foresee') {
    // Cartridge Blow: the monster's next act, and who it is aimed at when it is aimed at one family member.
    const who=b3Name(b.foe),at=b.tgt?b3Name(b.tgt):'';
    if(b.tgt) V.aim[b.foe]=b.tgt; else delete V.aim[b.foe];
    b3Pop(b.foe,b.tgt?'NEXT: '+at.toUpperCase():'FORESEEN','#ffe27a',{sc:2}); b3Sfx('combo');
    b3Say(!b.name?who+' has nothing planned.':b.kind==='strike'?who+' will use '+b.name+' on '+at+' next.':b.kind==='wind'?who+' is about to wind up '+b.name+'.':b.kind==='wide'?who+' will use '+b.name+' on the whole family next.':who+' will use '+b.name+' next.');
  }
  else if(b.t==='hazardEnd') { V.haz=V.haz.filter(h=>!(h.id===b.id&&h.side===b.side)); if(b.why==='strip') b3Say('The '+B3_HAZARDS[b.id].name.toLowerCase()+' is scrubbed away.'); else if(b.why==='burst') { b3Word(B3_HAZARDS[b.id].name.toUpperCase()+' BREAKS!',B3_HAZARDS[b.id].color); b3Sfx('combo'); } else if(b.why==='ko') b3Say('The '+B3_HAZARDS[b.id].name.toLowerCase()+' goes with its maker.'); }
  // TNB (stage 9b): the Grand Amphora takes a monster's attack whole; a clay shield is fired into Fired Glaze; Waymo Tailgate Rescue shares HP.
  else if(b.t==='vesselSoak') { const h=V.haz.find(x=>x.id===b.id); if(h) h.uses=b.left; for(const k of b.tgts) b3Pop(k,'AMPHORA TOOK IT','#ffcf9a',{sc:2}); b3Sfx('thud'); b3Say('The '+B3_HAZARDS[b.id].name+' soaks '+b3Name(b.src)+'’s attack whole.'+(b.left?' '+b.left+' '+(b.left===1?'hit':'hits')+' left.':'')); }
  else if(b.t==='vitrify') { b3Pop(b.tgt,'FIRED GLAZE','#ffb38a',{sc:2}); b3Sfx('combo'); b3Say(b3Name(b.tgt)+'’s clay shield is fired into Fired Glaze.'); }
  else if(b.t==='rebalance') { V.u[b.src].hp=b.hpSrc; vu.hp=b.hp; b3Pop(b.src,'-'+b.n,'#8fe3a6'); b3Pop(b.tgt,'+'+b.n,'#8fe3a6'); b3Sfx('heal'); b3Say(b3Name(b.src)+' shares '+b.n+' HP with '+b3Name(b.tgt)+'.'); }
  else if(b.t==='crack') { b3Pop(b.tgt,'CRACKED','#e6b08a',{sc:2}); }
  // A Trait or Quirk went off (only the ones whose row asks to be named: engine/b3-hooks.js `show`).
  else if(b.t==='passive') { b3Pop(b.src,b.name.toUpperCase(),'#c9e6a8',{sc:2}); b3Say(b3Name(b.src)+': '+b.name+'.'); }
  // A granted action: the family member who got it picks a free Skill as soon as this move has played (engine/b3-ui.js b3AfterAct).
  else if(b.t==='grant') { b3Pop(b.tgt,'FREE SKILL!','#ffe27a'); b3Sfx('combo'); b3Say(b3Name(b.tgt)+' gets a free Skill from '+b3Name(b.src)+'. It does not use up '+b3Name(b.tgt)+'’s turn.'); }
  else if(b.t==='grantEnd') { V.bar=b.bar; b3RenderBar(); }
  // The Family Ruckus (stage 6): the gauge moves (the RUCKUS button is its bar), a Mix is named, and a spend is announced.
  else if(b.t==='ruckus') { V.ruckus=b.v; if(b.n>0&&b.src) b3Pop(b.src,'RUCKUS +'+b.n+'%','#ffd36b'); b3RenderDeck(); }
  else if(b.t==='mix') { b3Pop(b.tgt,'MIX!','#ffe27a',{sc:2}); b3Sfx('combo'); b3Say('A Mix: '+b3Name(b.src)+' hit '+b3Name(b.tgt)+' with a different flavor than their teammate.'); }
  // A Full Family Ruckus with a live Tombo skin (engine/b3-skins.js) shows the skin's name and plays the pair's recorded lines; the result is the rule's.
  else if(b.t==='ruckusSpend') { const sk=b.kind==='full'?b3SkinForUnits(B3.F,b.src,b.partner):null,nm=sk?sk.name:b.name;
    b3Word(nm.toUpperCase()+'!','#ffd36b'); b3Sfx('combo'); b3Say(b3Name(b.src)+' and '+b3Name(b.partner)+': '+nm+'!');
    if(sk) b3SkinSay(sk,b3Unit(B3.F,b.src).id,b3Unit(B3.F,b.partner).id); }
  else if(b.t==='detonate') {
    const D=B3_DETONATIONS.find(d=>d.id===b.id),c=B3_FLAVORS[D.flavor].color;
    vu.st=vu.st.filter(id=>id!==b.prime);   // the Prime is used up
    b3Word(b.name,c); B3P.flash={color:c,t0:now,dur:.4}; b3Sfx('combo');
    b3Say(b.name+' '+b3Name(b.src)+' set off '+b3Name(b.tgt)+'’s '+B3_STATUS[b.prime].name+'.');
  }
  else if(b.t==='push') { V.bar=b.bar; b3RenderBar(b.tgt); b3Pop(b.tgt,'PUSHED BACK','#ffb070',{sc:2}); }
  else if(b.t==='pull') { V.bar=b.bar; b3RenderBar(b.tgt); b3Pop(b.tgt,b.placed?'UP NEXT':'PULLED UP','#9be39a',{sc:2}); b3Sfx('jumpWhistle'); }
  else if(b.t==='counter') { const cu=b3Unit(B3.F,b.tgt); if(cu&&Object.keys(cu.counterInfo||{})[0]===b.id) vu.ctr=b.v; }
  else if(b.t==='pep') { vu.pep=b.pep; if(b.g!=='pre') b3Pop(b.tgt,(b.n>0?'+':'')+b.n+' PEP',b.n>0?'#8dc4e6':'#ff9a8a',{sc:2}); }
  else if(b.t==='telegraph') {
    V.charge[b.src]=b.name; b3Pop(b.src,'!!','#ff8f80',{sc:4}); b3Sfx('charge');
    const WC=b.src[0]==='f'?b3cWindOf(b):null;
    if(WC) { B3P.fa[b.src].windId=WC; B3P.fa[b.src].windTrim=msTrimOf('wind:'+b3Unit(B3.F,b.src).id+':'+b.id); B3P.fa[b.src].windT0=null; b3cWant(WC,9000); }   // the monster holds its wound-up picture until the act fires
    if(b.mark) { V.mark[b.src]=b.mark; b3Pop(b.mark,'MARKED','#ff8f80',{sc:2}); b3Say(b3Name(b.src)+' has Marked '+b3Name(b.mark)+'. '+b.name+' lands on '+b3Name(b.mark)+' on its next turn.'); }
    else b3Say(b3Name(b.src)+' is winding up '+b.name+'. It lands on its next turn.');
  }
  else if(b.t==='act') { if(b.foe) { delete V.charge[b.src]; delete V.mark[b.src]; delete V.aim[b.src]; B3P.fa[b.src].windId=null; } }
  else if(b.t==='ko') {
    vu.ko=true; vu.st=[]; delete V.charge[b.tgt]; delete V.mark[b.tgt]; delete V.aim[b.tgt];
    if(b.tgt[0]==='f') { B3P.fa[b.tgt].die=now; b3Sfx('grumpDie'); }
    else { B3P.body[b.tgt]={kind:'ko',t0:now,dur:1e9}; b3Sfx('thud'); b3Say(b3Name(b.tgt)+' is knocked out.'); }
  }
  else if(b.t==='endTurn') { V.bar=b.bar; b3RenderBar(); }
  b3RenderParty();
}

// ---------- Playing a list of beats ----------
// Beats that come before a move (round dividers, the turn start, burns) are shown first. Then the move plays: its shape's
// default animation calls reveal() once per hit. The beats after the last hit follow, and then done() runs.
function b3Play(beats,done) {
  const i=beats.findIndex(b=>b.t==='act'||b.t==='telegraph'),lead=i<0?beats:beats.slice(0,i),rest=i<0?[]:beats.slice(i);
  let wait=0,link=null;
  for(const b of lead) { if(b.t==='over') continue; const w=wait; b3After(w,()=>b3Show(b)); if(b.t==='round') wait+=.55; else if(b.t==='stance'||b.t==='stamp'||b.t==='phase'||b.t==='frame') wait+=.7; else if(b.t==='repick') wait+=.6; else if(b.t==='hit'||b.t==='heal') wait+=.45; else if(b.t==='ko') wait+=.5; else if(b.t==='hazardTrip') wait+=.6; else if(b.t==='skip') wait+=.8; else if(b.t==='script') wait+=1.7; else if(b.t==='ruckusSpend') { wait+=.9; if(rest.length&&lead.filter(x=>x.t!=='over').pop()===b&&b3RuckusLinked(b)) link={b,w}; } }
  if(!rest.length) { b3After(wait+.05,done); return; }
  // A Family Ruckus spend is one action with two moves in it: the second move's `act` beat is marked part2 and plays after the first.
  const segs=[]; let cur=[]; for(const b of rest) { if(b.t==='act'&&b.part2&&cur.length) { segs.push(cur); cur=[]; } cur.push(b); } segs.push(cur);
  const run=k=>b3PlayMove(segs[k],k+1<segs.length?()=>run(k+1):done,k+1<segs.length);
  if(link) { b3gWarmLink(link.b); b3After(link.w,()=>b3RuckusLink(link.b,()=>run(0))); return; }   // movebench15: a Family Ruckus with a spec plays its link (stage, effects, sound) at the spend beat, then the two moves
  b3After(wait,()=>run(0));
}
// ---------- The Family Ruckus link (movebench15) ----------
// The beat that spends the gauge ('ruckusSpend') has a spec of its own ('ruckus:double', 'ruckus:full'; data/moves/ruckus-*.json): timing (the moment the link shows, the freeze of the two members, the shake),
// stage steps, effects and sound. They play where the two members link up, BEFORE their own moves, and the first move starts when the link has finished (never before the .9 s the beat always took).
// The caster is the member who spends, the target the partner whose turn goes with it. A spend with no spec (or an empty one) plays exactly as before. Nothing here changes the fight.
const b3RuckusHead=b=>({t:'ruckusSpend',kind:b.kind,src:b.src,partner:b.partner,tgts:[b.partner],id:'ruckus_'+b.kind,name:b.name});
function b3RuckusLinked(b) {
  try {
    const H=b3RuckusHead(b),id=msIdOf(H),s=id&&msLive(id); if(!s) return false;
    const T=msTiming(H); return !!(msEffects(H).length||s.stage&&(s.stage.steps||[]).length||T.hitStop>0||T.shake>0);
  } catch(e) { return false; }
}
function b3gWarmLink(b) { try { const R=b3gRowFor(b3RuckusHead(b)); if(R) b3gWarm(R); } catch(e) {} }
function b3RuckusLink(b,cont,waited) {
  const H=b3RuckusHead(b),t0=B3P.t; let over=false,need=.9;
  const end=()=>{ if(over) return; over=true; b3After(Math.max(0,need-(B3P.t-t0)),cont); };
  try {
    const SR=typeof b3gRowFor==='function'?b3gRowFor(H):null;
    if(SR&&!b3gReady(SR)&&(waited||0)<B3C.waitMax) { b3gWarm(SR); b3After(.1,()=>b3RuckusLink(b,cont,(waited||0)+.1)); return; }   // its pictures are still loading: wait for them like a move does, 2.5 s at most
    const cue=sec=>{ const r=b3vArm(H,null,sec,true); need=Math.max(need,sec+B3V.lastLen+.1); return r; };
    if(SR&&b3gReady(SR)) { b3gPlay(SR,{head:H,hits:[],late:[],reveal:()=>{},finishNow:end,cue}); return; }
    const s=msLive(msIdOf(H)),bud=s&&s.timing&&typeof s.timing.budget==='number'?s.timing.budget:1;
    cue(b3cLandAt({dur:bud*1000},msTiming(H))); end();   // no stage (or not baked): the effects, the freeze and the shake alone, the same moment the stage would have used
  } catch(err) { try { gameFault('ruckus link',err); } catch(e) {} end(); }
}
function b3PlayMove(beats,done,mid,waited) {   // mid: the first move of a Family Ruckus pair (the screen is synced when the pair has finished)
  const head=beats[0];
  // Clips (engine/b3-clips.js): ask for what this move will show. A move whose clip is still loading waits for it (2.5 s at most), then plays its default animation.
  b3cWarmBeats(beats);
  const SR=typeof b3gRowFor==='function'?b3gRowFor(head):null;   // movestage2: a staged move (its spec's stage section, engine/b3-spec.js msStageRow) waits for its body clip and stage assets like any clip, then plays its row
  if(SR) { b3gWarm(SR); if(!b3gReady(SR)&&(waited||0)<B3C.waitMax) { b3After(.1,()=>b3PlayMove(beats,done,mid,(waited||0)+.1)); return; } }
  let PR=b3cPair(head);   // pairmove1: a two-person video when the partner is standing (engine/b3-clips.js)
  const AN=head.t==='act'?msAnimOf(head):null,own=AN?AN.clip:null,cid=PR?PR.clip:own;   // movebench12: the spec's body (clip, pair, sound, trim)
  if(cid&&BCLIPS[cid]&&!b3cReady(cid)&&(waited||0)<B3C.waitMax) { b3After(.1,()=>b3PlayMove(beats,done,mid,(waited||0)+.1)); return; }
  if(head.t==='telegraph') { for(const b of beats) if(b.t!=='over') b3Show(b); B3P.fa[head.src].hold=B3P.t+.8; b3After(1.15,done); return; }
  const pre=beats.filter(b=>b.g==='pre'),post=beats.filter(b=>b.g==='post'&&b.t!=='over'),swings=beats.filter(b=>b.t==='swing');
  // Reactions, each a group of beats that share a `g` ('r0', 'r1'...), and what the turn's end wrote ('end').
  const reacts=[],tail=beats.filter(b=>b.g==='end'&&b.t!=='over');
  for(const b of beats) if(/^r\d+$/.test(b.g)) { let R=reacts.find(r=>r.g===b.g); if(!R) reacts.push(R={g:b.g,beats:[]}); R.beats.push(b); }
  const hits=[]; for(const s of swings) hits.push({swing:s,beats:beats.filter(b=>b.g===s.g&&b.t!=='swing')});
  // A move with no hits (a pass, a ward, a revive) shows its effects when the pose lands, not before: only the cost shows at once.
  const late=swings.length?[]:pre.filter(b=>b.t!=='act'&&!(b.t==='pep'&&b.n<0));
  for(const b of pre) if(!late.includes(b)) b3Show(b);
  const src=head.src,who=b3Name(src);
  b3Say(who+(head.foe?' uses ':': ')+head.name+(head.free?', for free.':'.'));
  let shown=0;
  // Every time below is written at the old quick pace and stretched by B3_TEMPO (K): at(), the body's keys and poses, things in flight.
  const K=B3_TEMPO,at=(s,fn)=>b3After(s*K,fn);
  const reveal=()=>{ const h=hits[shown++]; if(h) for(const b of h.beats) b3Show(b); };
  const wrap=()=>{ if(mid) { b3After(.25,done); return; } for(const b of tail) b3Show(b); b3ViewSync(); b3RenderParty(); b3After(.6,done); };
  const react=i=>{ const R=reacts[i]; if(!R) { wrap(); return; }
    b3Show(R.beats[0]); b3After(.34*K,()=>{ for(const b of R.beats.slice(1)) b3Show(b); b3After(.5*K,()=>react(i+1)); }); };
  const finishNow=()=>{ while(shown<hits.length) reveal(); for(const b of post) b3Show(b); if(reacts.length) b3After(.3*K,()=>react(0)); else wrap(); };
  const finish=s=>at(s,finishNow);
  const shape=head.shape,foe=src[0]==='f',fl=B3_FLAVORS[head.flavor[0]]||B3_FLAVORS.support;
  // vfxfight1 (engine/b3-vfx.js): the move's library effects play from the moment its first hit lands; vfx(sec) arms them for `sec` seconds from now and says whether a library projectile will fly (then no default ball).
  const vfx=sec=>typeof b3vArm==='function'?b3vArm(head,own,sec,hits.length>0):false;   // hitstop1: a move with a hit also arms its hit stop for that moment
  if(SR&&b3gReady(SR)) { b3gPlay(SR,{head,hits,late,reveal,finishNow,cue:vfx}); return; }   // movestage2: the row's body clip, stage steps and set piece (engine/b3-stage.js)
  // A video clip plays the move (the move's or act's row says which, engine/b3-clips.js). It plays at the clock's own pace, not B3_TEMPO's:
  // the hit shows on the clip's impact frame (a clip with no impact lands at `at` of its length). A family member crosses to the monster first.
  let CL=cid&&b3cReady(cid)?b3cTrimmed(BCLIPS[cid],cid===own?AN.trim:null):null;
  if(!CL&&PR) { PR=null; CL=own&&b3cReady(own)?b3cTrimmed(BCLIPS[own],AN.trim):null; }   // the two-person video did not load in time: the move's own video
  if(CL&&PR) {
    // pairmove1: the partner's body plays the video at the partner's spot, the mover is hidden; the hit lands as the mover springs off (impact frame),
    // carried to the monster by a short arc.
    const TM=msTiming(head),gap=TM.gap,land=b3cLandAt(CL,TM),dur=CL.dur/1000,ph=b3PartyHome(b3Unit(B3.F,PR.key)),fly=.3;
    vfx(hits.length?land+fly:land);
    B3P.body[PR.key]={kind:'cmove',t0:B3P.t,T0:0,jx:ph.cx,jy:ph.base,C:CL,back:0,dur:dur+.12};
    B3P.body[src]={kind:'away',t0:B3P.t,dur:dur+.12};
    const tg=hits.length&&hits[0].swing.tgts[0];
    if(tg) { const z=b3Spot(tg); B3P.fx.push({kind:'proj',x0:ph.cx-24,y0:ph.base-70,x1:z.x,y1:z.y,color:fl.color,t0:B3P.t+land,dur:fly,arc:50}); }
    if(hits.length) hits.forEach((h,k)=>b3After(land+fly+k*gap,reveal)); else b3After(land,()=>{ for(const b of late) b3Show(b); });
    b3After(Math.max(dur+.1,land+fly+Math.max(0,hits.length-1)*gap+.25),finishNow); return;
  }
  if(CL) {
    const TM=msTiming(head),gap=TM.gap,land=b3cLandAt(CL,TM),dur=CL.dur/1000;
    let T0=0,back0=0;
    if(foe) B3P.fa[src].cl={id:cid,C:CL,t0:B3P.t,dur};
    else {
      // movebench4: how he gets there is the spec's `approach`: auto runs to the monster when the hit is on one, stay never does, run does whenever the hit is on a monster; approachSec and returnSec are the two runs
      const home=b3PartyHome(b3Unit(B3.F,src)),tg=hits.length&&hits[0].swing.tgts[0],onFoe=!!tg&&tg[0]==='f',travel=onFoe&&TM.approach!=='stay';
      let jx=home.cx,jy=home.base; if(travel) { const st=b3cStand(src,CL,tg); jx=st.x; jy=st.y; T0=TM.approachSec; back0=TM.returnSec; }
      B3P.body[src]={kind:'cmove',t0:B3P.t,T0,jx,jy,C:CL,back:back0,dur:T0+dur+.12+back0};
    }
    vfx(T0+land);
    const SN=AN&&AN.sound; if(SN&&CL.ms[SN.at-(CL.trimmed?CL.trimmed.from:0)]!=null) b3After(T0+CL.ms[SN.at-(CL.trimmed?CL.trimmed.from:0)]/1000,()=>b3Sfx(SN.sfx));   // a sound on a given clip picture (data/b3-sfx.js)
    if(hits.length) hits.forEach((h,k)=>b3After(T0+land+k*gap,reveal)); else b3After(T0+land,()=>{ for(const b of late) b3Show(b); });
    b3After(Math.max(T0+dur+.1,T0+land+Math.max(0,hits.length-1)*gap+.25),finishNow); return;
  }
  // A move with no hits (a pass, a self buff): a pose, then the effects.
  if(!hits.length) {
    const tg=head.tgts[0];
    const lp=vfx(.5*K);
    if(foe) B3P.fa[src].hold=B3P.t+.5*K; else if(!b3cBodyClip(src,shape==='give'?'give':'cast')) B3P.body[src]={kind:'pose',f:shape==='give'?B3_BODY.give:B3_BODY.cast,t0:B3P.t,dur:.75*K};
    if(tg&&tg!==src&&!lp) { const a=b3Spot(src),z=b3Spot(tg); B3P.fx.push({kind:'proj',x0:a.x,y0:a.y,x1:z.x,y1:z.y,color:fl.color,t0:B3P.t+.2*K,dur:.3*K,arc:40}); }
    at(.5,()=>{ for(const b of late) b3Show(b); });
    finish(.6); return;
  }
  let t=.05;
  if(shape==='strike') {
    // Wind up, dash to the target, strike (reveal), hop back for the next hit, then home.
    const keys=[],home=foe?null:b3PartyHome(b3Unit(B3.F,src));
    if(foe) {
      // An enemy leans back first (the hold), then lunges; the hit shows at the far point of the lunge.
      B3P.fa[src].hold=B3P.t+.22*K; t=.22; vfx((.22+.27)*K);   // movebench14: the attack's effects, hit stop and shake come at the first hit (nothing is armed for an attack whose spec has none)
      for(const h of hits) { const z=b3Spot(h.swing.tgts[0]); at(t,()=>{ B3P.fa[src].lunge={t0:B3P.t,dur:.55*K,tx:z.sx,ty:z.sb}; }); at(t+.27,reveal); t+=.6; }
      finish(t); return;
    }
    keys.push({t:0,x:home.cx,y:home.base,f:B3_BODY.windup},{t:.2,x:home.cx,y:home.base,f:B3_BODY.windup});
    t=.2; vfx((.2+.16)*K);
    hits.forEach((h,k)=>{ const z=b3Spot(h.swing.tgts[0]);
      keys.push({t:t+.15,x:z.sx,y:z.sb,f:B3_BODY.dash},{t:t+.16,x:z.sx-8,y:z.sb,f:B3_BODY.strike},{t:t+.3,x:z.sx-8,y:z.sb,f:B3_BODY.strike});
      at(t+.16,reveal); t+=.3;
      if(k<hits.length-1) { keys.push({t:t+.1,x:z.sx+26,y:z.sb,f:B3_BODY.dash,hop:14}); t+=.1; } });
    keys.push({t:t+.24,x:home.cx,y:home.base,f:B3_BODY.idle});
    for(const q of keys) q.t*=K;
    B3P.body[src]={kind:'path',keys,t0:B3P.t,dur:(t+.24)*K};
    finish(t+.2); return;
  }
  // cast, throw, give: stay home, send something across, reveal when it arrives.
  const a=b3Spot(src);
  if(foe) B3P.fa[src].hold=B3P.t+(.25+hits.length*.34)*K;
  else if(shape==='throw'||!b3cBodyClip(src,shape==='give'?'give':'cast')) B3P.body[src]={kind:'pose',f:shape==='give'?B3_BODY.give:shape==='throw'?B3_BODY.strike:B3_BODY.cast,t0:B3P.t,dur:(.35+hits.length*.34)*K};
  t=.2; const lp=vfx((.2+.26)*K);
  for(const h of hits) {
    if(!lp) for(const k of h.swing.tgts) { const z=b3Spot(k); B3P.fx.push({kind:'proj',x0:a.x+(foe?20:-20),y0:a.y,x1:z.x,y1:z.y,color:fl.color,t0:B3P.t+t*K,dur:.26*K,arc:shape==='throw'?46:10}); }
    at(t+.26,reveal); t+=.34;
  }
  finish(t+.1);
}

// ---------- Drawing ----------
function b3Text(text,x,y,color,sc) { label(text,x+sc*.5,y+sc*.5,'#141a22',sc); label(text,x,y,color,sc); }
function b3Arrow(x,y,c) { rect(x-7,y-1,14,3,'#0b0d12'); rect(x-6,y,12,2,c); rect(x-4,y+2,8,2,c); rect(x-2,y+4,4,2,c); rect(x-1,y+6,2,1,c); }
function b3Draw() {
  battleFit();
  gfx=fightCtx; gfx.setTransform(BS,0,0,BS,0,0);
  const t=B3P.t,F=B3.F,V=B3.view;
  const skk=typeof b3gShakeAt==='function'?b3gShakeAt(t):null; if(skk) gfx.translate(skk.x,skk.y);   // movestage2: a stage shake moves the whole field
  const vsk=typeof b3vShakeAt==='function'?b3vShakeAt(t):null; if(vsk) gfx.translate(vsk.x,vsk.y);   // movebench4: a move's own screen shake (timing.shake, engine/b3-vfx.js)
  const bg=BG_IMG[(B3.cfg&&B3.cfg.bg)||'pond'];
  if(bg&&bg.complete&&bg.naturalWidth) { const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=true; gfx.imageSmoothingQuality='high'; gfx.drawImage(bg,0,0,576,324); gfx.imageSmoothingEnabled=sm; }
  else rect(0,0,576,324,'#14141c');
  if(!F||!V||B3.artWait) { gfx=ctx; return; }
  if(typeof b3gDrawBack==='function') b3gDrawBack(t);   // movestage2: the set piece's dim over the backdrop
  const picked=b3AimUnits();   // the units the highlighted move is aimed at (engine/b3-deck.js)
  // What lies on a side's floor (hazards): a sheen under that side's feet and a tag in the top corner on that side.
  for(const h of V.haz||[]) { const H=B3_HAZARDS[h.id],foe=h.side==='foe',L=foe?F.foes.filter(f=>!V.u[f.key].ko&&f.row!=='back'):[];
    gfx.globalAlpha=.3+.08*Math.sin(t*3);
    if(foe) for(const f of L) { const P=B3P.foe[f.key]; if(P) ellipse(P.px,P.py+1,P.def.sprite[0].length*P.sc*.62,7,H.color); }
    else for(const u of F.party) { const hm=b3PartyHome(u); ellipse(hm.cx,hm.base,34,6,H.color); }
    gfx.globalAlpha=1; b3Text(H.short+(h.uses<90?' x'+h.uses:''),foe?70:500,14,H.color,2); }
  // vfxfight1 (engine/b3-vfx.js): a library effect is drawn at its own layer's point: the ones on the floor and the ones standing behind the units come first.
  b3vDraw('ground_decal',t); b3vDraw('behind_units',t);
  // Enemies, back to front.
  for(const f of F.foes.filter(f=>B3P.foe[f.key]).sort((a,b)=>B3P.foe[a.key].py-B3P.foe[b.key].py)) b3vUnit(f.key,t,tt=>b3DrawFoe(f,tt,picked.includes(f.key)));   // hitstop1: b3vUnit holds a unit at the hit for its hit stop   // an add shows once its `summon` beat has played
  // Party, back to front (slot order runs up-screen to down-screen).
  for(const u of F.party) b3vUnit(u.key,t,tt=>b3DrawMember(u,tt,picked.includes(u.key)));
  b3vDraw('unit_overlay',t);   // vfxfight1: bursts, badges, shields and heals, over the units that stand behind them
  // Things in flight and bursts.
  for(const e of B3P.fx) {
    const q=(t-e.t0)/e.dur; if(q<0) continue;
    if(e.kind==='proj') { const x=e.x0+(e.x1-e.x0)*q,y=e.y0+(e.y1-e.y0)*q-Math.sin(q*Math.PI)*(e.arc||0);
      for(let k=3;k>=1;k--) { gfx.globalAlpha=.18*k/3+.1; ellipse(x-(e.x1-e.x0)*.05*k,y-(e.y1-e.y0)*.05*k+Math.sin((q-.05*k)*Math.PI)*0,9-k*2,9-k*2,e.color); }
      gfx.globalAlpha=1; ellipse(x,y,8,8,'#141a22'); ellipse(x,y,6.5,6.5,e.color); ellipse(x-2,y-2,2.5,2.5,'#ffffff'); }
    else if(e.kind==='burst') { gfx.globalAlpha=Math.max(0,1-q); for(let k=0;k<8;k++) { const a=k*.785+.3,r=10+q*34; rect(e.x+Math.cos(a)*r-2,e.y+Math.sin(a)*r*.8-2,5,5,k%2?'#ffffff':e.color); } gfx.globalAlpha=1; }
  }
  if(typeof b3gDrawFront==='function') b3gDrawFront(t);   // movestage2: props, flying things, glows and words of a stage row
  b3vDraw('foreground_sweep',t);   // vfxfight1: waves, beams, vehicles and projectiles that cross the whole field
  if(B3P.flash) { const q=(t-B3P.flash.t0)/B3P.flash.dur; gfx.globalAlpha=(B3P.flash.a||.3)*(1-q); rect(0,0,576,324,B3P.flash.color); gfx.globalAlpha=1; }
  b3vDraw('screen_lighting',t);   // vfxfight1: dims, spotlights and the moon: over the whole field, under the numbers and the big words
  // Numbers and tags.
  for(const p of B3P.pops) { const q=(t-p.t0)/p.dur,w=(String(p.text).length*4-1)*p.sc,x=Math.max(w/2+3,Math.min(573-w/2,p.x)),y=Math.max(4,p.y-q*22);
    gfx.globalAlpha=q>.75?(1-q)/.25:1; b3Text(p.text,x,y,p.color,p.sc); gfx.globalAlpha=1; }
  // Big words (round, Detonations), in the top band.
  B3P.words.forEach((w,i)=>{ const q=(t-w.t0)/w.dur,full=String(w.text).length>14?3:4,sc=q<.1?Math.max(1,Math.round(full*q/.1)):full;
    gfx.globalAlpha=q>.8?(1-q)/.2:1; b3Text(w.text,288,34+i*26,w.color,sc); gfx.globalAlpha=1; });
  gfx=ctx;
}
// battleux3: a monster's Pet Peeves as flavor badges under its HP bar and pips, in the menu's look (colors read from the shared variables of m2.css).
// Always shown (not a detail): the picture-and-word is the one place the scene says what a monster dislikes. Returns the words drawn (the layout test reads them).
let b3BadgeSt=null;
function b3BadgeStyle() { if(!b3BadgeSt) { const cs=getComputedStyle($('b3-app')||document.body),g=(k,d)=>(cs.getPropertyValue(k)||'').trim()||d; b3BadgeSt={ink:g('--ink','#2B1A33'),cream:g('--cream','#FFF1D6'),font:g('--disp',"system-ui,sans-serif")}; } return b3BadgeSt; }
function b3PeeveBadges(f,cx,y) {
  const pv=b3Peeves(f); if(!pv.length) return [];
  const St=b3BadgeStyle(),h=12,gap=3,words=pv.map(k=>B3_FLAVORS[k].name);
  gfx.save(); gfx.font='700 9px '+St.font; gfx.textAlign='left'; gfx.textBaseline='middle';
  const ws=words.map(w=>Math.ceil(gfx.measureText(w).width)+h+3),tot=ws.reduce((a,b)=>a+b,0)+gap*(pv.length-1);
  let x=Math.round(Math.max(2,Math.min(cx-tot/2,576-2-tot)));
  pv.forEach((k,i)=>{ const w=ws[i],r=h/2;
    gfx.beginPath(); gfx.moveTo(x+r,y); gfx.lineTo(x+w-r,y); gfx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2); gfx.lineTo(x+r,y+h); gfx.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5); gfx.closePath();
    gfx.fillStyle=St.cream; gfx.globalAlpha=.94; gfx.fill(); gfx.globalAlpha=1;
    gfx.beginPath(); gfx.arc(x+r,y+r,r-1.5,0,Math.PI*2); gfx.fillStyle=B3_FLAVORS[k].color; gfx.fill(); gfx.lineWidth=1; gfx.strokeStyle=St.ink; gfx.stroke();
    gfx.fillStyle=St.ink; gfx.fillText(words[i],x+h+1,y+r+.5); x+=w+gap; });
  gfx.restore(); return words;
}
function b3DrawFoe(f,t,picked) {
  const L=B3P.foe[f.key],A=B3P.fa[f.key],vu=B3.view.u[f.key],def=L.def,R0=def.sprite,FR=def.frames,sc=L.sc;
  const dying=A.die!=null,dc=dying?b3cGet(f.id,'die',9000):null;   // a defeated clip plays out, then the monster fades (engine/b3-clips.js)
  const dq=dying?(dc?Math.max(0,Math.min(1,(t-A.die-dc.dur/1000)/.4)):Math.min(1,(t-A.die)/.9)):0;
  if(dq>=1) return;
  const look=b3Look(f),hov=look.hover||0;
  let lq=0,lp=0; if(A.lunge) { lp=(t-A.lunge.t0)/A.lunge.dur; if(lp>=1) A.lunge=null; else lq=Math.sin(Math.PI*lp); }
  const fl=!dying&&vu.st.includes('flustered');
  const hurt=dying||fl||t<A.hurtUntil,holding=!fl&&t<A.hold;
  let R=R0;
  if(FR) { if(A.lunge&&FR.attack.length) R=FR.attack[Math.min(FR.attack.length-1,Math.floor(lp*FR.attack.length))]; else if(hurt&&FR.hurt) R=FR.hurt; else if(holding&&FR.attack.length) R=FR.attack[0]; }
  const cr=b3cFoeFrame(f,A,vu,t),CFr=cr?cr.fr:null;   // a clip picture, when this monster has one for what it is doing and it is loaded
  if(CFr) R=CFr;
  const w=R[0].length*sc,h=R.length*sc,sw=R0[0].length*sc;
  const bob=hov&&!dying?Math.round(Math.sin(t*3+f.slot*1.7)*2)-hov:0,breath=dying||hov||CFr||msStateClip(f.id,'idle')?0:(.5+.5*Math.sin(t*1.7+f.slot*1.7))*.008;   // wanch1: no code breath for a fighter with an idle video (its breathing is in the video)
  const dx=A.lunge?(A.lunge.tx-L.px-sw*.5)*lq:0,dy=A.lunge?(A.lunge.ty-L.py)*lq-lq*10:0;
  const shake=t<A.shakeUntil?rand(-4,4):0,lean=holding&&!A.lunge&&!CFr?8:0,sway=fl&&!shake&&!CFr?Math.round(Math.sin(t*4.5+f.slot)*2):0;
  const x=Math.round(L.px-w/2+dx+shake-lean+sway),y=Math.round(L.py-h+bob+dy-(dc?0:dq*30));
  if(!dying||dc) ellipse(L.px+dx,L.py-1+(A.lunge?(A.lunge.ty-L.py)*lq:0),sw*.48*(hov?.8:1),Math.max(4,sc*2),hov?'rgba(30,50,40,.22)':'rgba(30,50,40,.3)');
  const flash=t<A.flashUntil||(dying&&!dc&&dq>.1),alpha=(1-dq)*(A.born!=null?Math.min(1,(t-A.born)/.5):1);
  const SO=typeof b3gFoeOffset==='function'?b3gFoeOffset(f.key,t):null;   // movestage2: pushed back or squashed by a stage row
  if(SO) { gfx.save(); gfx.translate(L.px+SO.dx,L.py); gfx.scale(1,SO.sq); gfx.translate(-L.px,-L.py); drawSprite(R,def.pal,x,y,sc,{flash,alpha}); gfx.restore(); }
  else if(breath&&!A.lunge&&!shake&&!holding&&!fl&&!CFr) { gfx.save(); gfx.translate(L.px,L.py); gfx.scale(1,1+breath); gfx.translate(-L.px,-L.py); drawSprite(R,def.pal,x,y,sc,{flash,alpha}); gfx.restore(); }
  else drawSprite(R,def.pal,x,y,sc,{flash,alpha});
  if(dying) return;
  // HP meter and letter under the feet; the wind-up and (DETAILS on) statuses over the head.
  const np=vu.maxPips||0,bw=Math.max(40,Math.min(64,sw*.7)),bx=Math.round(L.px-bw/2),byy=Math.min(L.py+9,324-12-(np?9:0)-(b3Peeves(f).length?13:0)),r=vu.hp/vu.maxHp;
  btMeter(bx,byy,bw,7,r,r<=.25?BT_METER.crit:r<=.5?BT_METER.low:BT_METER.hp);
  if(f.letter) btMeterTag(bx-10,byy+5,f.letter);
  // Composure pips under the HP meter: gold while it holds, empty as they are knocked off, all red-rimmed while it is Flustered.
  if(np) { const pw=Math.max(5,Math.min(10,Math.floor((bw-(np-1)*2)/np))),x0=Math.round(L.px-(np*pw+(np-1)*2)/2),py=byy+10,pop=A.pipAt!=null&&t-A.pipAt<.35;
    for(let i=0;i<np;i++) { const on=i<vu.pips,px=x0+i*(pw+2);
      rect(px-1,py-1,pw+2,7,fl?'#a8443c':'#0b0d12'); rect(px,py,pw,5,on?(pop?'#ffffff':'#ffd27a'):'#3a3340'); if(on) rect(px,py,pw,1,'#fff1cb'); } }
  b3PeeveBadges(f,L.px,byy+(np?19:10));   // (the HP meter is lifted by 13 when a badge row must fit under the pips)
  const top=L.py-R0.length*sc+bob;
  // Stars circle a Flustered monster's head.
  if(fl) for(let k=0;k<3;k++) { const a=t*3.4+k*2.094,xx=L.px+Math.cos(a)*sw*.3,yy=top+2+Math.sin(a)*4; rect(Math.round(xx)-2,Math.round(yy)-2,5,5,'#141a22'); rect(Math.round(xx)-1,Math.round(yy)-1,3,3,k%2?'#fff1cb':'#ffe27a'); }
  let sy=top-14;
  if(B3.view.charge[f.key]) { const yy=sy-Math.round(Math.abs(Math.sin(t*6))*3); b3Text('!! '+B3.view.charge[f.key],L.px,yy,'#ff8f80',2); sy-=14; }
  // Its statuses are a detail (b3look: shown while DETAILS is on); Flustered is left off, the stars and the turn bar's badge show it.
  if(b3Details()) for(const id of b3ViewIcons(f.key).filter(x=>x!=='flustered')) { const S=B3_STATUS[id]; b3Text(S.short,L.px,sy,S.color,2); sy-=13; }
  if(picked) b3Arrow(L.px,sy-2-Math.round(Math.abs(Math.sin(t*6))*5),b3AimColor());
}
// ---------- The dodge slide (wanch2a: the painted body states are gone; Tom, Grace, Rose and Deedee are videos only, B3_VIDEO_ONLY) ----------
// A dodge with no video of its own slides the fighter's standing video out, holds and slides it home (b3cStandIn shows the video).
// Numbers are battle seconds and battle pixels; +x is away from the monsters.
const B3_DODGE={out:14,hop:6,t1:.14,hold:.1,back:.2,dur:.44};
const b3Ease=q=>{ q=Math.max(0,Math.min(1,q)); return q*q*(3-2*q); };
function b3Slide(P,e) { const o=e<P.t1?b3Ease(e/P.t1):e<P.t1+P.hold?1:1-b3Ease((e-P.t1-P.hold)/P.back); return {dx:P.out*o,hop:P.hop&&e<P.t1?P.hop*Math.sin(Math.PI*e/P.t1):0}; }
// Three stars circle a head (the look of a Flustered monster).
function b3Stars(cx,top,sw,t) { for(let k=0;k<3;k++) { const a=t*3.4+k*2.094,xx=cx+Math.cos(a)*sw*.3,yy=top+2+Math.sin(a)*4; rect(Math.round(xx)-2,Math.round(yy)-2,5,5,'#141a22'); rect(Math.round(xx)-1,Math.round(yy)-1,3,3,k%2?'#fff1cb':'#ffe27a'); } }
// A knocked-out fighter who is not video-only and has no knock-out video. koE is the time since the fall.
function b3KoDraw(u,sp,cx,base,t,koE) {
  const e=koE,frame=e<.16?sp.idle:koFrame(sp),w=frame[0].length*sp.scale,h=frame.length*sp.scale;
  const sink=e<.16?Math.round(e/.16*8):-Math.round(Math.max(0,Math.sin(Math.min(1,(e-.16)/.3)*Math.PI))*5);
  ellipse(cx,base-1,w*.3,5,'rgba(47,73,54,.34)');
  drawKnockedOut({id:u.id},u.slot,sp,frame,cx-w/2,base+sink-h,cx,base+sink,e,t,{flash:0});
}
// Is this family member (by key) standing in a guard video right now?
function b3GuardShown(key) { const u=b3Unit(B3.F,key); return !!(u&&b3cGuardClip(u)&&b3cGuarding(u)); }
function b3DrawMember(u,t,picked) {
  const sp=BATTLE_SPRITES[u.id],home=b3PartyHome(u),vu=B3.view.u[u.key],A=B3P.body[u.key];
  let cx=home.cx,base=home.base,fk=B3_BODY.idle,flash=false,hop=0,CF=null,gnd=null;
  if(vu.ko) {
    const KF=b3cMemberFrame(u,vu,t,A);   // a knock-out clip plays once and its last picture is held (engine/b3-clips.js)
    if(KF) { const w=KF[0].length*sp.scale,h=KF.length*sp.scale,ft=feetOf(KF);
      ellipse(cx+ft.dx*sp.scale,base-1,Math.max(ft.w*sp.scale*.62,w*.3),5,'rgba(47,73,54,.34)'); drawSprite(KF,sp.pal,Math.round(cx-w/2),Math.round(base-h),sp.scale,{flash:0}); return; }
    if(b3cVideoOnly(u)) {   // idea-tomgrace: no knock-out video yet, so the hit video's deepest wince, dimmed, with stars; nothing painted
      const KS=b3cKoStandIn(u,t,A&&A.kind==='ko'?t-A.t0:9); if(!KS) return;
      const w=KS[0].length*sp.scale,h=KS.length*sp.scale,ft=feetOf(KS);
      ellipse(cx+ft.dx*sp.scale,base-1,Math.max(ft.w*sp.scale*.62,w*.3),5,'rgba(47,73,54,.34)');
      gfx.globalAlpha=.6; drawSprite(KS,sp.pal,Math.round(cx-w/2),Math.round(base-h),sp.scale,{flash:0}); gfx.globalAlpha=1; b3Stars(cx,base-h,w,t); return; }
    b3KoDraw(u,sp,cx,base,t,A&&A.kind==='ko'?t-A.t0:9);
    return;
  }
  const low=vu.hp/vu.maxHp<=B3_RULES.lowHp,cheer=B3P.cheer||B3P.cheerKey===u.key;   // cheerKey: a test cheers one fighter
  if(A&&A.kind!=='ko'&&t-A.t0>=A.dur) delete B3P.body[u.key];
  const B=B3P.body[u.key];
  if(B&&B.kind==='away') return;   // pairmove1: drawn inside the partner's two-person video for now
  if(B&&B.kind==='path') {
    const e=t-B.t0,K=B.keys; let i=0; while(i<K.length-2&&e>=K[i+1].t) i++;
    const a=K[i],b=K[i+1],q=Math.max(0,Math.min(1,(e-a.t)/Math.max(.001,b.t-a.t))),s=q*q*(3-2*q);
    cx=a.x+(b.x-a.x)*s; base=a.y+(b.y-a.y)*s; fk=q<1?a.f:b.f; if(b.hop) hop=Math.sin(q*Math.PI)*b.hop;
    if(fk===B3_BODY.dash) { const R=b3cGet(u.id,'run'); if(R) { CF=bclipLoopFrame(R,e*1000); if(b.x>a.x+1) CF=b3cMirror(CF); } }   // crossing the field: the run clip (it faces the monsters)
  } else if(B&&B.kind==='cmove') {
    // A move played by a clip: run over to the monster, play the clip where they stand, run home.
    const e=t-B.t0,cd=B.C.dur/1000,ease=q=>{ q=Math.max(0,Math.min(1,q)); return q*q*(3-2*q); },R=b3cGet(u.id,'run');
    if(e<B.T0) { const s=ease(e/B.T0); cx=home.cx+(B.jx-home.cx)*s; base=home.base+(B.jy-home.base)*s; if(R) CF=bclipLoopFrame(R,e*1000); else fk=B3_BODY.dash; }
    else if(e<B.T0+cd+.12) { cx=B.jx; base=B.jy; CF=b3cOnce(B.C,(e-B.T0)*1000); if(B.C.ground) gnd=[B.C,(e-B.T0)*1000]; }
    else { const s=ease((e-B.T0-cd-.12)/Math.max(.01,B.back)); cx=B.jx+(home.cx-B.jx)*s; base=B.jy+(home.base-B.jy)*s; if(B.back&&s<1) { if(R) CF=b3cMirror(bclipLoopFrame(R,e*1000)); else fk=B3_BODY.dash; } }
  } else if(B&&B.kind==='pose') fk=B.f;
  else if(B&&B.kind==='hit'&&B.guard) { const e=t-B.t0; cx+=Math.round(7*Math.sin(Math.min(1,e/B.dur)*Math.PI)*(1-e/B.dur)*2); flash=e<.08; }   // braced in the guard video: pushed back half a step, feet sliding home
  else if(B&&B.kind==='hit') { fk=B3_BODY.hit; const e=t-B.t0; if(e<.25) cx+=rand(-4,4); flash=e<.08; }
  else if(B&&B.kind==='dodge') { const m=b3Slide(B3_DODGE,t-B.t0); fk=B3_BODY.windup; cx+=m.dx; hop=m.hop; }
  else if(cheer) { fk=B3_BODY.victory; hop=Math.abs(Math.sin(t*6+u.slot))*16; }
  else if(low) fk=B3_BODY.low;
  // A clip, when one shows this state and is loaded: idle and guard loops, a hit, a dodge, a give or cast, the victory (engine/b3-clips.js).
  if(!CF&&!(B&&(B.kind==='path'||B.kind==='cmove'||B.kind==='pose'||(B.kind==='hit'&&!(B.guard&&b3cGuardClip(u)))))&&!(low&&!cheer)) CF=b3cMemberFrame(u,vu,t,B);
  if(CF&&cheer&&!B) hop=0;
  // idea-tomgrace: a video-only member never shows a painted frame. A reaching pose or the strike of a move plays their give video from its
  // start, anything else (a dodge, low HP, a hit or a move whose video is not loaded) their idle, guard or victory video. None loaded: not drawn.
  const VO=b3cVideoOnly(u);
  if(VO&&!CF) { let reach=false,r0=B?B.t0:t;
    if(B&&B.kind==='pose') reach=B.f===B3_BODY.strike||B.f===B3_BODY.give||B.f===B3_BODY.cast;
    else if(B&&B.kind==='path'&&fk===B3_BODY.strike) { const K=B.keys,e=t-B.t0; let i=0; while(i<K.length-2&&e>=K[i+1].t) i++; while(i>0&&K[i-1].f===B3_BODY.strike) i--; reach=true; r0=B.t0+K[i].t; }
    CF=b3cStandIn(u,vu,t,reach,r0); fk=B3_BODY.idle; }
  if(VO&&!CF) { b3MemberMarks(u,t,picked,base-(sp.idle.length*sp.scale),cx); return; }
  const frame=CF||sp[fk]||sp.idle,w=frame[0].length*sp.scale,h=frame.length*sp.scale,ft=feetOf(frame),bl=(frame._below||0)*sp.scale;
  if(gnd) bclipGround(gfx,gnd[0],gnd[1],cx,base,sp.scale);   // rose-lava-xftr: the lava pool the game draws under her (engine/clip-ground.js)
  ellipse(cx+ft.dx*sp.scale,base-1,Math.max(ft.w*sp.scale*.62,w*.3),5,'rgba(47,73,54,.34)');
  const x=Math.round(cx-w/2),y=Math.round(base-h+bl-hop);
  B3P.at[u.key]={cx:Math.round(cx),base:Math.round(base),h:Math.round(h)};   // vfxfight1: where a library effect lands on this member
  const idle=fk===B3_BODY.idle&&!CF&&!msStateClip(u.id,'idle'),breath=idle?(.5+.5*Math.sin(t*1.7+u.slot*1.3))*.008:0;
  activeKneelCut=frame===sp.kneel&&!sp.noShift?Math.round(sp.idle.length*.62):0;
  if(breath) { gfx.save(); gfx.translate(cx,base); gfx.scale(1,1+breath); gfx.translate(-cx,-base); drawSprite(frame,sp.pal,x,y,sp.scale,{flash}); gfx.restore(); }
  else drawSprite(frame,sp.pal,x,y,sp.scale,{flash});
  activeKneelCut=0;
  b3MemberMarks(u,t,picked,y,cx);
}
// The aim arrow over a family member whose figure's top is y. Nothing else is drawn over a member (b3look): whose turn it is shows on the turn bar
// and their card, MARKED and NEXT TARGET on their card, statuses on their card.
function b3MemberMarks(u,t,picked,y,cx) {
  if(picked) b3Arrow(cx,y-12-Math.round(Math.abs(Math.sin(t*6))*5),b3AimColor());
}
// The aim arrow is the menu's lamplight, the screen's one color for "what you picked" (read from m2.css, so it is never copied here).
function b3AimColor() { if(!B3.aimC) B3.aimC=getComputedStyle($('b3-app')).getPropertyValue('--lamp').trim(); return B3.aimC; }
