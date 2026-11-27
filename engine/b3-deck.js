'use strict';
// engine/b3-deck.js: Battle 3's screen (build battleux1, plan claude/battleux-plan.md section 3).
// One list of moves, "the deck", at the right (upright: under the party). The first tap on a move highlights it, a tap on the highlighted
// move (its USE bar) uses it, on every device. A tap on a monster or a family member aims the highlighted move; it never uses it.
// The tray under the scene reads as one sentence: what the move does, an arrow, the target and what the move would do there. While a move or a
// monster plays, the tray is the battle log. The words this screen adds live in data/b3-ux-words.js (B3_KIND, B3_SIZE,
// B3_FORECAST, B3_RUCKUS); a move's one plain line is its `short` field in data/b3-kit-*.js. Layout: b3-deck.css, scoped to #battle.v3.
// State: B3.deck (the entries), B3.sel (the highlighted entry), B3.aimK (the aimed option's key), B3.look (a unit shown in the tray that
// is not the target), B3.sheet (a unit whose full list is open), B3.note (a line over the tray: a reason or a story tip), B3.say (the log line).
// B3.ui is 'busy' (a move or monster plays), 'deck' (the player picks) or 'done' (CONTINUE).
// b3look (claude/b3look-plan.md): the menu's look, and every fact in one place. A part marked class "dx" is a detail: b3-deck.css shows it only
// while DETAILS is on (#b3-app.det); a part marked "nd" shows only while it is off. Tones on chips: good (green), bad (coral), gold; flavor colors
// on the flavor circles; nothing else is colored.

const BX_IC={
  clobber:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0l1.7 4.2L13.7 2.3 11.8 6.3 16 8l-4.2 1.7 1.9 4-4-1.9L8 16l-1.7-4.2-4 1.9 1.9-4L0 8l4.2-1.7-1.9-4 4 1.9z"/></svg>',
  sizzle:'<svg class="ic" viewBox="0 0 16 16"><path d="M8.6 0c.5 2.6-.7 3.9-2 5.3C5.200 6.800 4 8.200 4 10.400 4 13.500 6 16 8 16s4-2.300 4-5.400c0-1.700-.7-2.900-1.400-3.900-.300 1.200-.9 1.800-1.700 2.100C9.600 6 10.300 2.500 8.600 0z"/></svg>',
  drench:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0C6 3.400 3 6.600 3 10.200 3 13.400 5.200 16 8 16s5-2.600 5-5.800C13 6.600 10 3.400 8 0z"/></svg>',
  razzle:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 0l1.900 6.100L16 8l-6.100 1.900L8 16l-1.900-6.100L0 8l6.100-1.900z"/></svg>',
  racket:'<svg class="ic" viewBox="0 0 16 16"><path d="M1 5.500h2.800L9 2v12L3.800 10.500H1z"/><path d="M11 5.200c1.300 1.500 1.300 4.100 0 5.600M12.900 3.300c2.300 2.600 2.300 6.800 0 9.400" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  support:'<svg class="ic" viewBox="0 0 16 16"><path d="M8 14.700C3.300 11.200 1 8.600 1 5.700 1 3.600 2.600 2 4.600 2c1.300 0 2.600.7 3.400 1.900C8.800 2.700 10.100 2 11.400 2 13.400 2 15 3.600 15 5.700c0 2.900-2.300 5.500-7 9z"/></svg>',
  bolt:'<svg class="ic" viewBox="0 0 16 16"><path d="M9.500 0L2.500 9h4l-1 7 8-10h-4.300z"/></svg>'
};
const bxW=(s,o)=>String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:'');
// A chip: tone '' (plain), 'good', 'bad' or 'gold'; dx true marks it a detail. A flavor chip is its circle and its word.
const bxChip=(t,tone,dx)=>'<span class="bx-chip'+(tone?' '+tone:'')+(dx?' dx':'')+'">'+t+'</span>';
const bxFlIcon=f=>'<span class="fc" style="--c:'+B3_FLAVORS[f].color+'">'+BX_IC[f]+'</span>';
const bxFl=f=>'<span class="bx-chip fl">'+bxFlIcon(f)+btEsc(B3_FLAVORS[f].name)+'</span>';
const bxFace=u=>{ const im=u.side==='foe'?btThumb(u.D&&u.D.art||u.id):btPortrait(u.id); return im?'<img alt="" src="'+im+'">':'<b class="bx-ph">'+btEsc(u.name.charAt(0))+'</b>'; };
const bxShare=u=>{ const v=B3.view&&B3.view.u[u.key]; return v?Math.max(0,v.hp)/v.maxHp:u.hp/u.maxHp; };

// ---------- The DETAILS switch (plan 3.2): kept on the device, on for a wide desktop window, off elsewhere ----------
// One saved setting with the menu's "Show skill descriptions" (M2_DET_KEY in engine/m2-vibes.js, 'on' or 'off'). Nothing saved: on for a wide desktop window.
function b3Details() {
  try { const d=localStorage.getItem(M2_DET_KEY); if(d!=null) return d==='on'; } catch(e) {}
  const b=$('battle'); return !!b&&b.clientWidth>=1100&&b.clientHeight>=640;
}
function b3SetDetails(on) { try { localStorage.setItem(M2_DET_KEY,on?'on':'off'); } catch(e) {} b3Render(); }

// ---------- Building the deck ----------
// Entries: {id, S, ruckus, P, name, grp, can:{ok,why}, cost, opts, rec}. opts are the choices of who it reaches (b3Options; for a Ruckus move, the monsters).
function b3DeckBuild() {
  const F=B3.F,u=B3.actor,out=[]; if(!u) return out;
  const free=b3Granted()===u,rc=b3Rec();
  if(!free) for(const k of ['double','full']) {
    const P=b3RuckusPlan(F,u,k); if(!P.ok) continue;
    out.push({id:'ruckus:'+k,ruckus:k,P,S:null,name:k==='full'?b3SkinName(F,u,P.partner,b3RuckusName(k)):b3RuckusName(k),grp:'ruckus',can:{ok:true,why:''},cost:0,opts:P.foeOpts,rec:!!(rc&&rc.skill==='ruckus:'+k)});
  }
  for(const S of b3Skills(F,u)) {
    const opts=b3Options(F,u,S),can=b3CanUse(F,u,S);
    out.push({id:S.id,S,name:S.name,grp:S.slot==='basic'?'basic':S.id==='pick_me_up'?'any':u.pocketSkills&&u.pocketSkills.includes(S.id)?'pocket':'main',
      can:can.ok&&!opts.length?{ok:false,why:B3_FORECAST.noTarget}:can,cost:b3Cost(F,u,S),opts,rec:!!(rc&&rc.skill===S.id)});
  }
  return out;
}
// Where the highlight starts: the recommended move (Rose Mode), else the Basic, else the first row (a free Skill's list has no Basic).
function b3DeckStart() {
  let i=B3.deck.findIndex(e=>e.rec); if(i<0) i=B3.deck.findIndex(e=>e.grp==='basic'); if(i<0) i=B3.deck.findIndex(e=>e.can.ok);
  return Math.max(0,i);
}
const b3Entry=()=>B3.deck&&B3.deck[B3.sel]||null;
// Every render asks the rules again what each move can do now (Pep, a Skill locked, the RUCKUS gauge full), keeping the highlight on the same move.
function b3DeckRefresh() {
  if(B3.ui!=='deck'||!B3.actor||battle.state!=='command') return;
  const id=B3.deck[B3.sel]&&B3.deck[B3.sel].id; B3.deck=b3DeckBuild();
  let i=B3.deck.findIndex(e=>e.id===id); if(i<0) { i=b3DeckStart(); b3AimDefault(B3.deck[i]); } B3.sel=i;
}
// The recommended move (difficulties with `recommend`: Rose Mode), asked once per turn.
const b3RecOn=()=>{ try { return !!b7Diff().recommend; } catch(e) { return false; } };
function b3Rec() {
  if(!B3.actor||!B3.F||battle.state!=='command'||!b3RecOn()) return null;
  const k=B3.actor.key+'|'+B3.F.clock+'|'+B3.F.turnLog.length+'|'+(B3.F.grant?1:0)+'|'+B3.F.ruckus;
  if(!B3.recC||B3.recC.k!==k) B3.recC={k,r:b3Recommend(B3.F,B3.actor)};
  return B3.recC.r;
}
// The Base Recovery of the highlighted move, for the ghost on the turn bar (b3MoveRec: a Quirk can shorten some moves).
function b3PreviewRecovery() {
  const u=B3.actor,e=b3Entry(); if(!u||battle.state!=='command') return null;
  if(!e) return b3MoveRec(B3.F,u,B3_SKILLS[u.basic]);
  if(e.ruckus) return e.P.ok?b3MoveRec(B3.F,u,e.P.parts[0].S):B3_RULES.recovery.basic;
  return b3MoveRec(B3.F,u,e.S);
}

// ---------- Aim (plan rule 3) ----------
// The options of the highlighted move that can be aimed at.
const b3AimOpts=e=>e?e.opts.filter(o=>!o.no):[];
// Where a move is aimed when it is highlighted: the monster with a Pet Peeve to it, else where this person last aimed this move, else the front
// monster; a heal at whoever is hurt most; anything else at the first family member.
function b3AimDefault(e) {
  B3.aimK=null; if(!e) return;
  const F=B3.F,u=B3.actor,os=b3AimOpts(e);
  if(!os.length) { B3.aimK=e.opts[0]?e.opts[0].key:null; return; }
  if(e.opts.length===1) { B3.aimK=e.opts[0].key; return; }
  if(os.some(o=>!o.ally)) {
    const fl=e.S?e.S.flavor:[],foes=os.filter(o=>!o.ally);
    let o=foes.find(x=>x.units.length===1&&fl.some(f=>b3Peeves(x.units[0]).includes(f)));
    if(!o) { const last=B3.last[u.key+'|'+e.id]; o=foes.find(x=>x.key===last); }
    if(!o) o=foes.find(x=>x.units[0].side==='foe'&&b3EffRow(F,x.units[0])==='front')||foes[0];
    B3.aimK=o.key; return;
  }
  const heals=e.S&&e.S.effects.some(x=>x.op==='heal'||x.op==='revive');
  B3.aimK=(heals?os.slice().sort((a,b)=>bxShare(a.units[0])-bxShare(b.units[0]))[0]:os[0]).key;
}
const b3AimOpt=()=>{ const e=b3Entry(); return e?(e.opts.find(o=>o.key===B3.aimK)||null):null; };
// Everyone the aim is on, for the picture's marker (engine/b3-play.js b3Draw): the keys of the aimed option's units.
function b3AimUnits() {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck'||B3.look) return [];
  const o=b3AimOpt(); return o?o.units.map(u=>u.key):[];
}
function b3AimStep(d) {
  const e=b3Entry(),os=b3AimOpts(e); if(!e||os.length<2) { b3Nope(); return; }
  const i=Math.max(0,os.findIndex(o=>o.key===B3.aimK));
  B3.aimK=os[(i+(d==='left'||d==='up'?os.length-1:1))%os.length].key; B3.look=null; B3.note=''; b3Sfx('move'); b3Render();
}

// ---------- What the highlighted move would do (engine/b3-preview.js, cached) ----------
// B3.pvNow: {ok, why, P, moved}. The turn bar reads P.bar and moved (engine/b3-ui.js b3RenderBar).
function b3PvCompute() {
  B3.pvNow=null;
  const u=B3.actor,F=B3.F,e=b3Entry(); if(!u||!F||battle.state!=='command'||B3.ui!=='deck'||!e) return;
  if(!e.can.ok) { B3.pvNow={ok:false,why:e.can.why,P:null,moved:{}}; return; }
  const o=b3AimOpt(),key=e.ruckus?(e.opts.length?B3.aimK:null):(o&&!o.no?o.key:undefined);
  if(key===undefined) { B3.pvNow={ok:false,why:o&&o.no?o.no:B3_FORECAST.noTarget,P:null,moved:{}}; return; }
  const ck=[e.id,key,u.key,F.clock,F.turnLog.length,F.ruckus,F.round,F.grant?1:0,u.pep].join('|');
  if(B3.pvC&&B3.pvC.k===ck) { B3.pvNow=B3.pvC.v; return; }
  const P=b3Preview(F,u,e.id,key),v={ok:P.ok,why:P.why||'',P:P.ok?P:null,moved:{}};
  if(P.ok) for(const m of P.moves) if(!v.moved[m.tgt]) v.moved[m.tgt]={kind:m.kind,n:m.n}; else v.moved[m.tgt].n+=m.n;
  B3.pvC={k:ck,v}; B3.pvNow=v;
}
// What the highlighted move does to one unit it reaches. Kept: damage, knocks it out, BREAK, sets off, cancels, heals, shields, revives.
// Details (DETAILS on): Composure lost and the statuses it leaves. Not here: Pet Peeve (the move's tag says it), pushes and pulls (the turn bar).
function b3FcChips(P,t) {
  const k=t.key,T=P.tgts[k],W=B3_FORECAST,c=[],foe=t.side==='foe';
  if(T&&T.resist) c.push(bxChip(bxW(W.resist,{flavor:P.flavor.map(f=>B3_FLAVORS[f].name).join('/')}),'bad'));
  if(T&&foe&&(T.dmg>0||T.ko)) c.push(T.ko?bxChip(W.ko,'gold'):bxChip(bxW(W.dmg,{n:Math.round(T.dmg)})));
  const pp=P.pips.filter(x=>x.tgt===k);
  if(pp.length) { const n=pp.reduce((a,x)=>a+x.n,0),last=pp[pp.length-1];
    if(P.breaks.includes(k)) c.push(bxChip(W.brk,'gold')); else if(n>0) c.push(bxChip(bxW(W.pips,{n,left:last.left,max:last.max}),'',1)); }
  for(const d of P.dets.filter(x=>x.tgt===k)) c.push(bxChip(bxW(W.det,{name:btEsc(d.name)}),'gold'));
  if(P.interrupts.includes(k)) c.push(bxChip(bxW(W.cancels,{name:btEsc((B3.view.charge[k])||'its wind-up')}),'good'));
  for(const h of P.heals.filter(x=>x.tgt===k)) c.push(h.n>0?bxChip(bxW(W.heal,{n:h.n}),'good'):bxChip(W.fullHp));
  for(const s of P.shields.filter(x=>x.tgt===k)) c.push(bxChip(bxW(W.shield,{n:s.n}),'good'));
  if(P.revives.includes(k)) c.push(bxChip(W.revive,'good'));
  const seen={}; for(const a of P.adds.filter(x=>x.tgt===k)) { const S=B3_STATUS[a.id]; if(S&&!seen[a.id]) { seen[a.id]=1; c.push(bxChip(btEsc(S.name),'',1)); } }
  return c;
}
// Does the highlighted move hit a Pet Peeve where it is aimed? Other rows: does any monster have it as a Pet Peeve (b3Matchups).
function bxPeeve(x,sel,u) {
  if(!x.S) return false;
  if(sel&&B3.pvNow&&B3.pvNow.P) { const o=b3AimOpt(),P=B3.pvNow.P; return !!o&&o.units.some(t=>P.tgts[t.key]&&P.tgts[t.key].peeve); }
  return b3Matchups(B3.F,u,x.S).some(m=>m.peeve);
}
// The kind words beside the flavor circle, the menu's way: "Racket basic", "Clobber skill"; a Combo says who it is with.
function bxKind(x) {
  if(x.ruckus) { const base=b3RuckusName(x.ruckus); return x.name!==base?bxW(B3_FORECAST.skinWith,{name:base,p:x.P.partner.name}):bxW(B3_FORECAST.withP,{p:x.P.partner.name}); }   // a Tombo skin (b3s16) keeps saying what it is
  const S=x.S,k=B3_KIND[S.slot==='cap'?'cap':S.id==='pick_me_up'?'revive':S.slot]||B3_KIND.s1;
  return S.flavor.map(f=>B3_FLAVORS[f].name).join(' and ')+' '+k;
}

// ---------- The deck, drawn ----------
function b3RenderDeck() {
  const box=$('b3-rows'),head=$('b3-dh'); if(!box||!head||!B3.F) return;
  const u=B3.actor||B3.F.party.find(p=>p.key===B3.turnOf)||B3.F.party[0],cmd=B3.active&&battle.state==='command'&&B3.ui==='deck',e=cmd?b3Entry():null,W=B3_FORECAST;
  const v=B3.view.u[u.key],pep=v?v.pep:u.pep,det=b3Details();
  // The deck header: the Pep of whoever is up, with what the highlighted move would spend or give, and the Combos gauge.
  let spend=0,gain=0; if(e&&e.can.ok) { if(e.S&&e.S.slot==='basic') gain=B3_RULES.pep.basic; else if(e.S) spend=e.cost; }
  let pips=''; for(let i=0;i<B3_RULES.pep.max;i++) pips+='<i class="'+(i<pep-spend?'on':i<pep?'spend':i<pep+gain?'gain':'')+'"></i>';
  const rk=Math.round(B3.view.ruckus||0);
  head.innerHTML='<div class="bx-meter" id="b3-pepm"><span class="lab">'+W.pepWord+'</span><span class="pips">'+pips+'</span><b>'+(spend?pep+' → '+(pep-spend):gain?pep+' → '+Math.min(B3_RULES.pep.max,pep+gain):pep)+'</b></div>'+
    '<div class="bx-meter rk" id="b3-rkm"><span class="lab">'+W.combos+'</span><span class="track"><i style="width:'+Math.min(100,rk)+'%"></i></span><b>'+rk+'%</b></div>'+bxSwitch(det);
  const free=b3Granted()===u;
  let h=free?'<div class="bx-grp bx-free">'+bxW(W.freeFor,{who:btEsc(u.name)})+'</div>':'',grp='';
  const has=g=>B3.deck.some(x=>x.grp===g),vn=id=>B3_VIBES[id]?'<span class="dx">· '+btEsc(B3_VIBES[id].name)+'</span>':'';
  const gname={ruckus:W.group.ruckus,main:W.group.main+vn(u.vibe),pocket:W.group.pocket+vn(u.pocket)+vn(u.pocket2),any:W.group.any};
  (B3.ui==='done'?[]:B3.deck).forEach((x,i)=>{   // the fight is over: no moves, only Continue in the tray
    if(x.grp!==grp) { grp=x.grp; if(x.grp!=='basic'&&!free&&(x.grp!=='main'||has('pocket')||has('ruckus')||has('any'))) h+='<div class="bx-grp">'+gname[x.grp]+'</div>'; }
    const S=x.S,sel=cmd&&i===B3.sel,lack=!x.can.ok&&S&&x.cost>pep&&B3.actor,need=S?x.cost-pep:0,why=btEsc(lack?bxW(W.needMore,{n:need}):x.can.why);
    const rose=b3pOn();   // Rose Mode (engine/b3-pictures.js): the flavor is its emoji picture, the price is drops, the recommended move says so with a star
    const fl=x.ruckus?(rose?bpIcon('b3_ruckus',28):'<span class="fc gold">'+BX_IC.razzle+'</span>'):rose?S.flavor.map(f=>bpIcon(B3P_FLAV[f],28)).join(''):S.flavor.map(bxFlIcon).join('');
    const pv=x.can.ok&&bxPeeve(x,sel,u)?'<i class="tag pv">'+W.peeveTag+'</i>':'';
    const dr=rose&&!x.ruckus?'<span class="dr">'+b3pDrops(S.slot==='basic'?0:x.cost,13)+'</span>':'';
    const cost=x.ruckus?'<span class="cost rk">'+x.P.cost+'%</span>':S.slot==='basic'?'<span class="cost gain">'+'+'+B3_RULES.pep.basic+' <small>'+W.pepWord+'</small></span>':x.cost?'<span class="cost">'+x.cost+' <small>'+W.pepWord+'</small></span>':'<span class="cost free">'+W.free+'</span>';
    const rt=rose&&x.rec?'<i class="tag rt">'+bpIcon('b3_star',14)+W.recTag+'</i>':'';
    const short=x.ruckus?B3_RUCKUS[x.ruckus].short:(S.short||'');
    const useTxt=x.can.ok?W.use+'<small>'+(B3.keys?W.useKey:W.useTap)+'</small>':why;
    h+='<button type="button" class="bx-mv'+(sel?' sel':'')+(x.can.ok?'':' no')+(x.ruckus?' ruck':'')+(x.rec?' rec':'')+'" data-i="'+i+'" data-id="'+btEsc(x.id)+'">'+
      '<span class="fl">'+fl+'</span><span class="nm"><i class="kb">'+(i+1)+'</i>'+btEsc(x.name)+'</span>'+cost+
      '<span class="sub"><span class="kd">'+btEsc(bxKind(x))+'</span>'+dr+pv+rt+(x.can.ok?'':'<span class="need">'+why+'</span>')+'</span>'+
      (det&&short?'<span class="short dx">'+btEsc(short)+'</span>':'')+'<span class="use">'+useTxt+'</span></button>';
  });
  box.innerHTML=h; $('b3-deck').classList.toggle('busy',!cmd);
  $('b3-app').classList.toggle('keys',!!B3.keys); $('b3-app').classList.toggle('det',det);
  b3DeckScroll();
}
// The DETAILS switch, the menu's switch (.m2-tog's look): one in the turn bar on wide screens, one in the deck header when held upright.
const bxSwitch=on=>'<button type="button" class="bx-sw'+(on?' on':'')+'" data-tool="details" role="switch" aria-checked="'+on+'" aria-pressed="'+on+'"><span>'+B3_FORECAST.details+'</span><i></i></button>';
// Keep the highlighted move inside the deck's box. Called again at the end of b3Render, because the tray (drawn after the deck) can change the deck's height.
function b3DeckScroll() {
  const box=$('b3-rows'),sel=box&&box.querySelector('.bx-mv.sel'); if(!sel) return;
  // Layout offsets, not screen rectangles: on the rotated stage the screen rectangles are turned a quarter, the scroll is not.
  if(box.clientHeight<=0||sel.offsetParent!==box) return;
  const top=sel.offsetTop,bot=top+sel.offsetHeight;
  if(bot>box.scrollTop+box.clientHeight) box.scrollTop=bot-box.clientHeight+6; else if(top<box.scrollTop) box.scrollTop=Math.max(0,top-6);
}

// ---------- Party cards: face, name, HP bar and HP; MARKED or NEXT TARGET. Details: Pep (not for whoever is up: the deck header has it),
// status chips (3 at most), BACK, the Portable Counter, the shield and the "/max" of HP ----------
function b3RenderParty() {
  const box=$('b3-party'); if(!box||!B3.F||!B3.view) return;
  const aimed=b3AimUnits(),W=B3_FORECAST;
  box.innerHTML=B3.F.party.map((u,i)=>{
    const v=B3.view.u[u.key],r=Math.max(0,v.hp)/v.maxHp,ko=v.ko,up=u===B3.actor&&battle.state==='command'&&B3.ui==='deck';
    const cls='bx-pc'+(up?' up':'')+(ko?' ko':'')+(aimed.includes(u.key)?' aim':'')+(B3.look===u.key?' look':'');
    const pips=up?'':'<span class="pp dx" aria-label="Pep '+v.pep+' of 10">'+Array.from({length:B3_RULES.pep.max},(_,k)=>'<i'+(k<v.pep?' class="on"':'')+'></i>').join('')+'<b>'+v.pep+'</b></span>';
    // A Mark is not a status, but the card says it first, always: it is a threat to act on. It takes the third icon's place so a card never shows more than 3.
    const mk=b3ViewMarked(u.key)&&!ko,nx=!mk&&b3ViewAimed(u.key)&&!ko;
    const st=(mk?'<i class="st mk" title="A monster’s wound-up attack is aimed here">'+W.marked+'</i>':nx?'<i class="st nx" title="A monster’s next attack is aimed here (Cartridge Blow)">'+W.nextTarget+'</i>':'')+
      b3ViewIcons(u.key).slice(0,mk||nx?2:3).map(id=>'<i class="st dx" title="'+btEsc(B3_STATUS[id].name)+'">'+B3_STATUS[id].short+'</i>').join('');
    const ctr=v.ctr?'<b class="ctr dx" title="'+btEsc(Object.values(u.counterInfo)[0].name)+' '+v.ctr+'">'+v.ctr+'</b>':'';
    return '<button type="button" class="'+cls+'" data-i="'+i+'" data-key="'+u.key+'"><span class="pt">'+bxFace(u)+ctr+'</span>'+
      '<span class="l1"><b class="nm">'+btEsc(u.name)+'</b>'+(u.row==='back'?'<i class="rt dx" title="'+W.backRow+'">'+W.back+'</i>':'')+st+
      '<i class="hpn">'+(ko?W.ko0:Math.max(0,v.hp)+'<span class="dx">/'+v.maxHp+'</span>')+(v.sh&&!ko?'<em class="dx" title="Shield '+v.sh+'">+'+v.sh+'</em>':'')+'</i></span>'+
      '<span class="l2"><span class="bx-hp'+(r<=.25?' low':'')+'"><i style="width:'+Math.round(r*100)+'%"></i></span>'+pips+'</span></button>';
  }).join('');
}

// ---------- The tray: what the highlighted move does (left), who it is aimed at and what it does there (right) ----------
// The move's name, price, flavor and kind are on its row, the target's HP, Composure, statuses and wind-up on the scene, a member's on their card,
// the turn order on the bar: none of them is said again here (claude/b3look-plan.md, inventory).
const bxWho=t=>'<div class="h">'+bxFace(t)+'<b>'+btEsc(t.name)+'</b></div>';
// What a unit carries, as chips (a monster's Pet Peeves first, then each status, a wind-up and a Mark), for a unit the player tapped to look at.
function bxCarry(t) {
  const W=B3_FORECAST,rows=b3Carried(B3.F,t).filter(r=>!['pips','vibe','trait','quirk'].includes(r.kind)&&r.kind!=='charge'&&r.kind!=='marked'),c=[];
  if(t.side==='foe') { const pv=b3Peeves(t); c.push('<span class="lab">'+W.peeves+'</span>'+(pv.length?pv.map(bxFl).join(''):bxChip(W.noPeeves))); }
  for(const r of rows) c.push(bxChip(btEsc(r.name)));
  return c.join('');
}
function bxLookHtml(t,why) {
  const rows=b3Carried(B3.F,t).filter(r=>['debuff','buff','stance','prime','mark','shield','hazard','counter','marked','charge','lens'].includes(r.kind)||r.kind==='pips'),W=B3_FORECAST;
  return bxWho(t)+(why?'<div class="note"><b>'+btEsc(why)+'</b></div>':'')+'<div class="k info">'+bxCarry(t)+'</div>'+
    '<div class="note">'+(rows.length?rows.slice(0,2).map(r=>'<b>'+btEsc(r.name)+':</b> '+btEsc(r.desc)).join(' '):bxW(W.nothingOn,{name:btEsc(t.name)}))+'</div>'+
    '<div class="k"><button type="button" class="bx-chip btn" data-sheet="'+t.key+'">'+W.fullList+'</button></div>';
}
function b3RenderTray() {
  const T=$('b3-tray'); if(!T||!B3.F||!B3.view) return;
  const W=B3_FORECAST,u=B3.actor;
  if(B3.ui==='done') {
    // The scene already says YOU WIN! or KNOCKED OUT: the tray adds only what the win paid, or a scripted end's line, and Continue.
    const over=B3.F.over,line=over==='win'?B3.won:over==='lose'?'':(B3.F.endLine||'');
    T.className='log done'; T.innerHTML='<div class="logline">'+(line?'<small>'+btEsc(line)+'</small>':'')+'</div><button type="button" class="bx-go" data-done="1">'+W.cont+'</button>'; return;
  }
  const e=b3Entry();
  if(battle.state!=='command'||B3.ui!=='deck'||!u||!e) { T.className='log'; T.innerHTML='<div class="logline">'+btEsc(B3.say||'')+'</div>'; return; }
  const open=T.classList.contains('open')&&T.dataset.m===B3.sel+'|'+B3.aimK;
  T.className=open?'open':''; T.dataset.m=B3.sel+'|'+B3.aimK;
  const S=e.S,pv=B3.pvNow,P=pv&&pv.P,o=b3AimOpt();
  const size=!S||!S.power?'':S.hits>1?bxW(B3_SIZE.hits,{n:S.hits}):B3_SIZE[S.power];
  const desc=e.ruckus?bxW(B3_RUCKUS[e.ruckus].desc,{a:btEsc(u.name),p:btEsc(e.P.partner.name)}):(S.desc||'');
  const brief=e.ruckus?B3_RUCKUS[e.ruckus].short:(S.short||desc);
  const a='<div class="act">'+(B3.note?'<p class="top">'+btEsc(B3.note)+'</p>':'')+(size?'<p class="size dx">'+btEsc(size)+'</p>':'')+
    '<p class="full dx">'+btEsc(desc)+'</p><p class="brief nd">'+btEsc(brief)+'</p></div>';
  const hint=b3AimOpts(e).length>1?'<div class="note">'+(o&&o.units[0]&&o.units[0].side!=='foe'?W.aimAlly:W.aimHint)+'</div>':'';
  const bad=pv&&!pv.ok?bxChip(btEsc(pv.why),'bad'):'';
  let t='';
  const lookU=B3.look&&b3Unit(B3.F,B3.look);
  if(lookU) t=bxLookHtml(lookU,B3.lookNo||W.noAim);
  else if(!o||!o.units.length) t='<div class="h"><b>'+btEsc(e.ruckus?W.family:u.name)+'</b></div>'+(bad?'<div class="k">'+bad+'</div>':'');
  else if(o.units.length===1) {
    const x=o.units[0];
    t=bxWho(x)+'<div class="k">'+(P?b3FcChips(P,x).join(''):'')+bad+'</div>'+hint;   // a monster's Pet Peeves are badges under it on the scene (battleux3), not said again here

  } else {
    t='<div class="h"><b>'+btEsc(o.label)+'</b></div>'+o.units.map(x=>'<div class="k"><span class="bx-chip nm">'+btEsc(x.name)+'</span>'+(P?b3FcChips(P,x).join(''):'')+'</div>').join('')+(bad?'<div class="k">'+bad+'</div>':'')+hint;
  }
  T.innerHTML=a+'<div class="arr" aria-hidden="true">→</div><div class="tgt'+(lookU?' look':'')+'">'+t+'</div>';
}

// ---------- The full list for one unit, a sheet over the tray ----------
function b3RenderSheet() {
  const box=$('b3-sheet'); if(!box) return;
  const t=B3.sheet&&B3.F&&b3Unit(B3.F,B3.sheet);
  box.hidden=!t; if(!t) { box.innerHTML=''; return; }
  const v=B3.view.u[t.key],rows=b3Carried(B3.F,t),W=B3_FORECAST;
  box.innerHTML='<div class="bx-sheet-in"><div class="sh-h"><b>'+btEsc(t.name)+'</b><span>'+(v.ko?W.knockedOut:'HP '+Math.max(0,v.hp)+' of '+v.maxHp+(v.sh?', shield '+v.sh:''))+'</span><button type="button" class="bx-chip btn" data-close="1">'+W.close+'</button></div>'+
    (rows.length?rows.map(r=>'<div class="sh-r"><div class="sh-t"><span class="bx-chip">'+btEsc(r.short)+'</span><b>'+btEsc(r.name)+'</b>'+(r.left?'<i>'+btEsc(r.left)+'</i>':'')+'</div><p>'+btEsc(r.desc)+'</p></div>').join(''):'<div class="sh-r"><p>'+bxW(W.nothingOn,{name:btEsc(t.name)})+'</p></div>')+'</div>';
}
function b3OpenSheet(key) {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck'||!b3Unit(B3.F,key)) return false;
  B3.sheet=key; b3Sfx('move'); b3Render(); return true;
}
const b3SheetKeys=()=>[...B3.F.party,...b3Live(B3.F,'foe')].map(u=>u.key);

// ---------- Choosing ----------
function b3Nope(text) { b3Sfx('nope'); if(text) { B3.note=text; b3Say(text); b3RenderTray(); } }
// Highlight a move (the first tap). It starts aimed (rule 3) and any unit shown in the tray is put away.
function b3Select(i) {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck'||!B3.deck[i]) return;
  const e=B3.deck[i]; B3.sel=i; B3.look=null; B3.note=''; B3.sheet=null; b3AimDefault(e); b3Sfx('move');
  const MC=e.S?msClipOf('move:'+e.S.id):null; if(MC) { b3cWant(MC,12000); b3cWant(b3cOf(B3.actor.id,'run'),12000); }   // start loading the move's clip while the player reads it
  b3Render();
}
// The second tap, Enter or A: use the highlighted move on its aim.
function b3Use() {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck') return false;
  const e=b3Entry(),u=B3.actor; if(!e) return false;
  if(!e.can.ok) { b3Nope(e.can.why); return false; }
  const o=b3AimOpt(),key=e.ruckus?(e.opts.length?B3.aimK:null):(o&&!o.no?o.key:undefined);
  if(key===undefined) { b3Nope(o&&o.no?o.no:B3_FORECAST.noTarget); return false; }
  if(e.opts.length>1&&key) B3.last[u.key+'|'+e.id]=key;
  b3Sfx('select'); B3.say=u.name+' uses '+e.name+'.';
  return b3Commit(e.id,key);
}
// A tap on a move: highlight it, or use it when it is the highlighted one. Also the Battle Lab's hook (window.__LE.b3Pick).
function b3Pick(i) {
  if(B3.ui==='done') { b3Continue(); return; }
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck') return;
  if(i===B3.sel) b3Use(); else b3Select(i);
}
function b3Continue() {
  if(!B3.active||B3.ui!=='done') return;
  b3Sfx('select'); const over=B3.F.over;
  if(B3.cfg.beforeEnd&&over==='win'&&!B3.leaving) { B3.leaving=true; B3.cfg.beforeEnd(over,()=>{ B3.leaving=false; b3End(over); }); } else b3End(over);   // beforeEnd: the story's victory card, shown over the fight before it closes
}
// A tap on a monster or a family member (the picture, a party card): aim the highlighted move there when it can be aimed there, else show that unit in the tray.
function b3TapUnit(t) {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck'||!t) return;
  if(B3.sheet) { B3.sheet=t.key; b3Sfx('move'); b3Render(); return; }
  const e=b3Entry(),os=e?e.opts:[]; let k=-1;
  if(os.length>1) { k=os.findIndex(o=>o.units[0]===t); if(k<0) k=os.findIndex(o=>o.units.includes(t)); }
  if(k>=0&&!os[k].no) { B3.aimK=os[k].key; B3.look=null; B3.note=''; b3Sfx('move'); b3Render(); return; }
  const why=k>=0?os[k].no:'';
  B3.look=(B3.look===t.key&&!why)?null:t.key; B3.lookNo=why; B3.note=''; b3Sfx('move'); b3Render();
}
// Esc, B, X: close the sheet, else put away the unit shown in the tray. A free Skill's deck has no way out.
function b3Back() {
  if(B3.ui!=='deck'||battle.state!=='command') return;
  if(B3.sheet) { B3.sheet=null; b3Sfx('move'); b3Render(); }
  else if(B3.look) { B3.look=null; b3Sfx('move'); b3Render(); }
}
// I and the pad's Y: the full list for the unit in the tray, else for the member whose turn it is.
function b3IKey() {
  if(B3.sheet) { b3Back(); return; }
  if(B3.ui==='deck'&&B3.actor) b3OpenSheet(B3.look||B3.actor.key);
}

// ---------- Input: touch and mouse, keyboard, gamepad ----------
// Up and down (W, S) move the highlight, left and right (A, D) the aim, Enter or Space uses, 1 to 9 highlight a move, I the full list, Esc closes it.
// A gamepad's D-pad does the same, A uses, Y is the list and B closes. A sheet that is open takes the arrows to step through everyone.
function b3Dir(d) {
  if(!B3.active||battle.state!=='command'||B3.ui!=='deck') return;
  if(B3.sheet) { const K=b3SheetKeys(),i=Math.max(0,K.indexOf(B3.sheet)); B3.sheet=K[(i+(d==='up'||d==='left'?K.length-1:1))%K.length]; b3Sfx('move'); b3Render(); return; }
  if(d==='up'||d==='down') { const n=B3.deck.length; if(n) b3Select((B3.sel+(d==='up'?n-1:1))%n); }
  else b3AimStep(d);
}
function b3A() {
  if(!B3.active) return;
  if(B3.ui==='done') { b3Continue(); return; }
  if(battle.state!=='command'||B3.ui!=='deck') return;
  if(B3.sheet) b3Back(); else b3Use();
}
function b3Key(e) {
  const c=e.code,dirs={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyS:'down',KeyA:'left',KeyD:'right'};
  if(c==='KeyL') { if(!e.repeat) toggleLayout(); return; }
  if(c==='KeyF') { if(!e.repeat) b3Speed(); return; }
  B3.keys=true;
  if(c==='KeyI') { if(!e.repeat) { b3IKey(); b3RenderDeck(); } return; }
  const dg=/^(Digit|Numpad)([1-9])$/.exec(c);
  if(dg) { e.preventDefault(); if(!e.repeat&&B3.ui==='deck'&&battle.state==='command'&&!B3.sheet) b3Select(Number(dg[2])-1); return; }
  if(dirs[c]) { e.preventDefault(); b3Dir(dirs[c]); }
  else if((c==='Enter'||c==='Space')&&!e.repeat) { e.preventDefault(); b3A(); }
  else if((c==='Escape'||c==='Backspace'||c==='KeyX')&&!e.repeat) { e.preventDefault(); b3Back(); }
}
function b3Pad(dir,dirEdge,A,B,Y) {
  if(Y) { B3.keys=true; b3IKey(); return; }
  if(dirEdge&&dir) { B3.keys=true; b3Dir(dir); }
  if(A) { B3.keys=true; b3A(); } else if(B) b3Back();
}
// The living enemy under a canvas point (its picture plus a little slack, and the HP bar under its feet).
function b3FoeAt(x,y) {
  let best=null,bd=1e9;
  for(const f of b3Live(B3.F,'foe')) {
    if(!B3P.foe[f.key]) continue;   // an add that has not walked in yet
    const p=b3FoeBox(f.key),pad=8;
    if(x<p.x-p.w/2-pad||x>p.x+p.w/2+pad||y<p.y-p.h-pad||y>p.y+22) continue;
    const d=Math.hypot(x-p.x,y-(p.y-p.h/2)); if(d<bd) { bd=d; best=f; }
  }
  return best;
}
// The family member standing under a canvas point (their body, a little wider than they are).
function b3MemberAt(x,y) {
  let best=null,bd=1e9;
  for(const u of B3.F.party) {
    const s=b3Spot(u.key),dx=Math.abs(x-s.x),w=22;
    if(dx>w||y<s.top-8||y>s.base+8) continue;
    if(dx<bd) { bd=dx; best=u; }
  }
  return best;
}
const b3UnitAt=(cx,cy)=>{ const q=btCanvasPt(cx,cy); if(!q||!q.inside) return null; return b3FoeAt(q.x,q.y)||b3MemberAt(q.x,q.y); };

(function b3Wire() {
  const app=$('b3-app'),cv=$('battle-canvas'); if(!app||!cv) return;
  // A pointer takes over from the keys. Patch the hint in place: rebuilding the rows here would replace the row under the finger before the click lands on it.
  app.addEventListener('pointerdown',()=>{ if(!B3.keys) return; B3.keys=false; if(!B3.active) return; app.classList.remove('keys'); document.querySelectorAll('#b3-rows .bx-mv .use small').forEach(n=>{ n.textContent=B3_FORECAST.useTap; }); },true);
  app.addEventListener('click',e=>{
    if(!B3.active) return;
    const tool=e.target.closest('[data-tool]');
    if(tool) { e.stopPropagation(); const k=tool.dataset.tool; if(k==='details') b3SetDetails(!b3Details()); else if(k==='speed') b3Speed(); else if(k==='exit') b3Exit(); else if(k==='skip') b3SkipFight(); return; }
    if(e.target.closest('[data-done]')) { b3Continue(); return; }
    if(battle.state!=='command'||B3.ui!=='deck') return;
    if(e.target.closest('[data-close]')) { b3Back(); return; }
    const sh=e.target.closest('[data-sheet]'); if(sh) { b3OpenSheet(sh.dataset.sheet); return; }
    if(e.target.closest('#b3-sheet')) return;
    const mv=e.target.closest('.bx-mv[data-i]'); if(mv) { b3Pick(Number(mv.dataset.i)); return; }
    const pc=e.target.closest('.bx-pc[data-i]'); if(pc) { b3TapUnit(B3.F.party[Number(pc.dataset.i)]); return; }
    if(e.target.closest('#b3-tray')) { const T=$('b3-tray'); T.classList.toggle('open'); return; }
  });
  // A tap on the picture: a monster or a family member.
  cv.addEventListener('click',e=>{ if(!B3.active) return; const t=b3UnitAt(e.clientX,e.clientY); if(t) b3TapUnit(t); });
  cv.addEventListener('pointermove',e=>{
    if(!B3.active||e.pointerType!=='mouse') return;
    cv.style.cursor=battle.state==='command'&&B3.ui==='deck'&&b3UnitAt(e.clientX,e.clientY)?'pointer':'';
  });
})();
