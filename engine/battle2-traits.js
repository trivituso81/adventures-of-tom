'use strict';
// engine/battle2-traits.js — The eight character traits (F4b; claude/battle-design.md section 5, "Unique Mechanic").
// Every trait keeps its counter on the battle unit (or on B2 when the party shares it) and shows it as a badge
// on the party card (b2TraitBadge). Numbers live in B2_TRAIT and B2_RACK (data/battle2-data.js).
//   Tom    Diamond Medallion: DEFEND on an ally, or any Tombo, earns 1 Upgrade Mile (max 3). At 3 Miles his next
//          skill costs 0 VP and is instant (he goes again right away).
//   Grace  Trending Meter: a different move than her last one raises it (x1, x1.2, x1.5 on her heals and crits);
//          the same move twice in a row resets it.
//   Rose   Shoulder Ride: Lamby Launch, Piggyback Pounce and Double-Decker Boop end with her on Tom's shoulders for
//          3 turns. Tom takes single hits aimed at her (40% softer) and her skills hit a second time at 40%.
//   Amy    Pace Setter: every turn she acts without being knocked out adds a Cadence stack: +5% PEP for the whole
//          party, up to +25%. A knockout resets it.
//   Deedee Warm Crust Tokens: Rhubarb Crisp (1), Sunday Dinner (3) and Sourdough & Rhubarb (2) put crusts on the
//          shared tray (max 3). Anyone can eat one from Care & Bag as a free action, once per turn: heal 20%
//          (Nara loves homemade food: 40% and POW +30%).
//   Boppy  Heartburn: +1 pip when he is hit while guarding, or eats a pepper (Pepper Breath, Hot Pepper). At 3 pips
//          his next attack or GRUMBLE lets out the Warden's Counter-Roar: whoever last hit him is stunned.
//          Ghost Pepper burns the pips instead: +30% damage per pip.
//   TNB    Quick-Change Rack: WARDROBE and Quick Change dress the target in the next costume on the rack:
//          Action Hero (POW, GRIT +25%), Cozy Cardigan (WARMTH, COOL +25%), Final Girl (gets back up once), repeat.
//   Nara   Frantic (built in F4, b2Eff in engine/battle2.js): POW +50%, PEP +30% while Tom is knocked out.
// Also here: Glitter Nails reflect (b2Reflect) and stealing a monster's held item (Big Catch, Tug of War: b2Take).
// The hooks are calls in engine/battle2.js (b2Start, b2Advance, b2Do, b2BeginMove, b2FinishMove, b2AfterAction,
// b2Effect, b2HitParty, b2PartyDown, b2Eff, b2Damage, b2HealValue) and engine/battle2-ui.js.

const b2Partner=id=>B2.party.find(p=>p.id===id);

// ---------- Setup and turn start ----------
function b2TraitsStart() {
  B2.crust=0; B2.hot=0; B2.rack=0;
  for(const u of B2.party) Object.assign(u,{miles:0,trend:0,lastKey:null,cadence:0,burn:0,lastHitBy:null,ateCrust:false});
}
function b2TraitTurn(u) {
  u.ateCrust=false;
  if(u.st.shoulder&&!b2Alive(b2Tom())) delete u.st.shoulder;
}

// ---------- Tom: Diamond Medallion (Upgrade Miles) ----------
function b2AddMile(n=1) {
  const t=b2Tom(); if(!t||!b2Alive(t)) return;
  const was=t.miles||0; t.miles=Math.min(B2_TRAIT.miles,was+n);
  if(t.miles===was) return;
  b2PopParty(t,t.miles>=B2_TRAIT.miles?'DIAMOND':'MILE +1',t.miles>=B2_TRAIT.miles?'#9fe8ff':'#cfe6ff',-22);
  if(t.miles>=B2_TRAIT.miles&&sfx.ding) sfx.ding();
}
// A skill that Tom's Medallion pays for: free and instant.
const b2Diamond=(u,act)=>!!(u&&u.id==='tom'&&u.side==='party'&&(u.miles||0)>=B2_TRAIT.miles&&act&&u.kit.skills.includes(act));
const b2Cost=(u,act)=>b2Diamond(u,act)?0:(act.vp||0);

// ---------- Grace: Trending Meter ----------
const b2TrendMult=a=>a&&a.id==='grace'&&a.side==='party'?B2_TRAIT.trend[a.trend||0]:1;
function b2Trend(u,act) {
  if(u.id!=='grace') return;
  if(u.trendLock) { u.trend=B2_TRAIT.trend.length-1; u.lastKey=act.key; return; }   // trend lock (engine/battle2-effects.js)
  if(u.lastKey&&u.lastKey!==act.key) {
    if(u.trend<B2_TRAIT.trend.length-1) { u.trend++; b2PopParty(u,'TRENDING x'+B2_TRAIT.trend[u.trend],'#ff9ac0',-22); }
  } else if(u.lastKey===act.key&&u.trend) { u.trend=0; b2PopParty(u,'OLD NEWS','#cfd8d6',-22); }
  u.lastKey=act.key;
}

// ---------- Rose: Shoulder Ride ----------
const b2Riding=u=>!!(u&&u.id==='rose'&&u.st&&u.st.shoulder&&b2Alive(u)&&b2Alive(b2Tom()));
function b2Mount() {
  const r=b2Partner('rose'),t=b2Tom();
  if(!r||!t||!b2Alive(r)||!b2Alive(t)) return;
  const was=!!r.st.shoulder;
  r.st.shoulder={turns:B2_TRAIT.ride};
  battle.fx[r.idx].hop=.3;
  if(!was) { b2PopParty(r,'SHOULDER RIDE','#ffb3cf',-30); say('rose','intro3',.15); }
}
// Where Rose sits while riding: on Tom's shoulders, as Tom is drawn this frame. engine/battle-draw.js asks.
function b2RidePos(m,i) {
  if(!battle.v2||!b2Riding(m)) return null;
  const fx=battle.fx[i]; if(fx.path) return null;
  if(B2.move&&B2.move.u===m) return null;   // she jumps down to do her move
  const t=b2Tom(),d=battle.drawnAt&&battle.drawnAt[t.idx];
  const q=BATTLE_POS[t.idx],sp=BATTLE_SPRITES.tom;
  const a=d||{cx:q.x*3,base:q.base*3,h:sp.idle.length*sp.scale};
  return {cx:a.cx+2,base:a.base-a.h+20+Math.round(Math.abs(Math.sin(battle.time*3))*2)};
}
// Rose is drawn after Tom while she rides him.
function b2RideOrder(order,party) {
  const r=party.findIndex(p=>p.id==='rose');
  if(r<0||!b2Riding(party[r])) return;
  order.splice(order.indexOf(r),1); order.push(r);
}

// ---------- Amy: Pace Setter ----------
function b2Cadence() { const a=b2Partner('amy'); return a&&b2Alive(a)?(a.cadence||0)*B2_TRAIT.cadence:0; }
function b2PaceTick(u) {
  if(u.id!=='amy'||!b2Alive(u)||u.cadence>=B2_TRAIT.cadenceMax) return;
  u.cadence++;
  b2PopParty(u,'PACE +'+Math.round(u.cadence*B2_TRAIT.cadence*100)+'%','#9be39a',-22);
}

// ---------- Deedee: Warm Crust Tokens ----------
function b2AddCrust(n) {
  const was=B2.crust||0; B2.crust=Math.min(B2_TRAIT.crustMax,was+n);
  if(B2.crust>was) { const d=b2Partner('deedee')||B2.actor; if(d&&d.side==='party') b2PopParty(d,'+'+(B2.crust-was)+' CRUST','#f3c37a',-22); }
}
// A free action: eat one, then the same member keeps their turn.
function b2EatCrust(u) {
  if(!B2.crust||u.ateCrust||battle.state!=='command') { sfx.nope(); if(u.ateCrust) b2Msg(u.name+' already had a Warm Crust this turn. One each.'); return; }
  // A Hot Dish (the tray effect, engine/battle2-effects.js) goes first: more healing and one debuff cleared.
  const hot=(B2.hot||0)>0;
  B2.crust--; u.ateCrust=true; if(hot) B2.hot--; B2.hot=Math.min(B2.hot||0,B2.crust);
  const nara=u.id==='nara',h=Math.min(u.maxHp-u.hp,Math.round(u.maxHp*(hot?B8_FX.hotHeal:B2_TRAIT.crustHeal)*(nara?2:1)));
  u.hp+=h; b2PopParty(u,'+'+h,'#9be39a'); sfx.heal();
  let cured='';
  if(hot) { const k=Object.keys(u.st).find(k=>B2_STATUS[k]&&B2_STATUS[k].debuff); if(k) { cured=' '+B2_STATUS[k].name+' is gone.'; delete u.st[k]; b2PopParty(u,'CURED','#9be39a',-8); } }
  if(nara) b2AddStatus(u,'powup',3,{by:u,amt:.3});
  battle.fx[u.idx].hop=.3;
  const what=hot?'a Hot Dish':'a Warm Crust';
  b2Msg(nara?'Nara gobbles '+what+'. Homemade! Her tail is a blur. (+'+h+' HP, POW +30%)'+cured:u.name+' eats '+what+'. '+(hot?'Piping hot.':'Still warm.')+' (+'+h+' HP, free action)'+cured);
  b2Open('cross');
}

// ---------- Boppy: Heartburn and the Counter-Roar ----------
function b2Burn(u,n) {
  if(!u||u.id!=='boppy'||u.side!=='party'||!b2Alive(u)) return;
  const was=u.burn||0; u.burn=Math.min(B2_TRAIT.burnMax,was+n);
  if(u.burn===was) return;
  b2PopParty(u,u.burn>=B2_TRAIT.burnMax?'HEARTBURN!':'BURN +1','#ff8c3a',-22);
}
// Called with every hit on a party member.
function b2TraitHit(e,t) {
  if(t.id!=='boppy') return;
  t.lastHitBy=e;
  if(t.st.brace&&t.hp>0) b2Burn(t,1);
}
function b2Roar(M) {
  const u=M.u;
  const foe=b2Alive(u.lastHitBy)?u.lastHitBy:(M.primary&&M.primary.side==='foe'&&b2Alive(M.primary)?M.primary:b2LiveFoes()[0]);
  u.burn=0;
  if(!foe) return [];
  return [()=>{
    battle.fx[u.idx].grumble=1.1; say('boppy','roar');
    const p=b2FoePoint(foe); foe.shake=.6;
    battle.texts.push({txt:'COUNTER-ROAR',x:96,y:22,color:'#ff8c3a',sc:3,t:0,dur:1.3});
    if(b2Alive(foe)) { foe.st.stunned={turns:1,by:u}; battle.texts.push({txt:'STUN',x:p.x,y:p.y-16,color:'#ffe08a',sc:1,t:0,dur:1.2}); }
    sfx.thud&&sfx.thud(); sfx.stun();
    b2Msg('Heartburn! Boppy lets out the Warden’s Counter-Roar. '+cap(foe.name)+' is stunned and loses its next turn.');
    b2Render();
  },1400];
}

// ---------- TNB: Quick-Change Rack ----------
const b2NextCostume=()=>B2_RACK[(B2.rack||0)%B2_RACK.length];
function b2Rack(u,t) {
  if(!t||t.side!=='party'||t.hp<=0) return;
  const C=b2NextCostume(); B2.rack=(B2.rack||0)+1;
  for(const k of Object.keys(t.st)) if(B2_STATUS[k]&&B2_STATUS[k].costume) delete t.st[k];
  t.st[C.id]={turns:3,by:u};
  b2PopUnit(t,C.tag==='GIRL'?'FINAL GIRL':C.name.toUpperCase(),C.c,-24);
}

// ---------- Glitter Nails: WARMTH damage bounces back ----------
function b2Reflect(e,act,t,dmg) {
  const r=b2Sum(t,'reflect'); if(!r||act.stat!=='warmth'||!b2Alive(e)) return;
  const n=Math.max(1,Math.round(dmg*r));
  e.hp=Math.max(0,e.hp-n); e.flash=.16;
  const p=b2FoePoint(e); pop(String(n),p.x,p.y,'#ffe27a');
  battle.texts.push({txt:'REFLECT',x:p.x,y:p.y-12,color:'#ffe27a',sc:1,t:0,dur:1});
  if(e.hp<=0) b2FoeDown(e);
}

// ---------- Big Catch, Tug of War: steal what a monster is holding ----------
function b2Take(u,t) {
  if(!t||t.side!=='foe'||t.stolen||!b2Alive(t)) return;
  t.stolen=true;
  const dr=t.def.drop,it=dr&&items[dr.id],p=b2FoePoint(t);
  const owned=dr&&dr.once&&(B2.bag.includes(dr.id)||(typeof party!=='undefined'&&party.some(m=>m.equipment&&Object.values(m.equipment).includes(dr.id))));
  if(it&&!owned) {
    B2.bag.push(dr.id); (B2.stolen=B2.stolen||[]).push(t.id);
    battle.texts.push({txt:'STOLE '+it.name.toUpperCase(),x:p.x,y:p.y-24,color:'#ffe08a',sc:1,t:0,dur:1.6});
    sfx.pickup&&sfx.pickup();
  } else {
    const n=rand(3,8)+t.lvl; B2.coinsWon+=n;
    pop('+'+n,p.x+8,p.y-6,'#ffd24a'); battle.texts.push({txt:'STOLE COINS',x:p.x,y:p.y-24,color:'#ffd24a',sc:1,t:0,dur:1.4});
    sfx.coin&&sfx.coin();
  }
}

// ---------- Move hooks ----------
// At the start of a move, before the damage plan: trends, Ghost Pepper, the Counter-Roar and the ride bonus.
function b2TraitBegin(M) {
  const u=M.u,act=M.act; M.boost=1;
  if(u.side!=='party'||act.tombo) return;
  b2Trend(u,act);
  if(u.id==='boppy'&&act.key==='ghost'&&u.burn) { M.boost=1+B2_TRAIT.ghostPip*u.burn; battle.texts.push({txt:'+'+Math.round((M.boost-1)*100)+'% HEARTBURN',x:96,y:30,color:'#ff8c3a',sc:2,t:0,dur:1.4}); u.burn=0; }
  else if(u.id==='boppy'&&(u.burn||0)>=B2_TRAIT.burnMax&&(act.stat||act.key==='grumble')) M.roar=true;
  if(b2Riding(u)&&act.stat&&u.kit.skills.includes(act)) M.ride=true;
}
// After the plan exists: Rose's second hit from Tom's shoulders, at 40%.
function b2RideWave(M,entry) {
  if(!M.ride) return;
  const ts=[...new Set(M.waves.flat().map(e=>e.t))];
  M.bonus=ts.map(t=>entry(t,M.act.mult*(M.act.hits||1)*B2_TRAIT.rideHit));
}
// After the move's hits and effects: returns extra steps (ride hit, Counter-Roar) and mounts Rose after a jump.
function b2TraitFinish(M) {
  const steps=[],u=M.u;
  if(u.side!=='party'||M.act.tombo) return steps;
  if(M.bonus&&M.bonus.length) steps.push(()=>{
    const t=b2Tom(); if(t) battle.fx[t.idx].punch=.4;
    battle.texts.push({txt:'DOUBLE-DECKER!',x:96,y:26,color:'#ffb3cf',sc:2,t:0,dur:1});
    for(const e of M.bonus) b2ApplyEntry(e,e.dmg);
    b2Render();
  },700);
  if(M.roar) steps.push(...b2Roar(M));
  if(u.id==='rose'&&(M.act.key==='lamby'||M.act.key==='pounce')) steps.push(()=>{ b2Mount(); b2Render(); },350);
  return steps;
}

// ---------- On the party card ----------
// A small badge on the portrait: {txt, title, on (glows when the trait is ready)}.
function b2TraitBadge(u) {
  const T=B2_TRAIT;
  switch(u.id) {
    case 'tom': { const n=u.miles||0; return {txt:'◆'.repeat(n)+'◇'.repeat(T.miles-n),on:n>=T.miles,cls:'mi',title:'Diamond Medallion: '+n+' of '+T.miles+' Upgrade Miles (DEFEND an ally or Tombo). At '+T.miles+', the next skill is free and instant.'}; }
    case 'grace': { const m=T.trend[u.trend||0]; return {txt:'x'+m.toFixed(1),on:(u.trend||0)>0,title:'Trending Meter: x'+m+' on heals and crits. Use a different move each turn to climb; repeating resets it.'}; }
    case 'rose': return b2Riding(u)?{txt:'RIDE '+Math.min(T.ride-1,u.st.shoulder.turns),on:true,title:'Shoulder Ride: Tom takes hits for Rose, and her skills hit twice.'}:{txt:'',title:''};
    case 'amy': return {txt:'PACE '+(u.cadence||0),on:(u.cadence||0)>0,title:'Pace Setter: +'+Math.round((u.cadence||0)*T.cadence*100)+'% PEP for the whole party. Grows each turn Amy acts; resets if she is knocked out.'};
    case 'deedee': { const n=B2.crust||0,h=Math.min(n,B2.hot||0); return {txt:'◉'.repeat(h)+'●'.repeat(n-h)+'○'.repeat(T.crustMax-n),on:n>0,cls:'cr',title:'Warm Crust Tokens on the tray: '+n+(h?' ('+h+' Hot Dish)':'')+'. Anyone can eat one from Care & Bag (free, heals 20%; a Hot Dish heals 30% and cures one debuff).'}; }
    case 'boppy': { const n=u.burn||0; return {txt:'●'.repeat(n)+'○'.repeat(T.burnMax-n),on:n>=T.burnMax,cls:'hb',title:'Heartburn: '+n+' of '+T.burnMax+'. At '+T.burnMax+', his next attack or GRUMBLE lets out a Counter-Roar. Ghost Pepper burns it for damage.'}; }
    case 'tnb': { const C=b2NextCostume(); return {txt:C.tag,on:true,cls:'rk',title:'Quick-Change Rack: next costume is '+C.name+' ('+C.does+').'}; }
    case 'nara': { const t=b2Tom(),on=!!(t&&!b2Alive(t)); return {txt:on?'FRANTIC':'',on,title:'Frantic: POW +50% and PEP +30% while Tom is knocked out.'}; }
  }
  return {txt:'',title:''};
}
// A line for the command hint when a trait is ready to use.
function b2TraitHint(u) {
  if(u.id==='tom'&&(u.miles||0)>=B2_TRAIT.miles) return ' Diamond Medallion: the next skill is free and instant.';
  if(u.id==='boppy'&&(u.burn||0)>=B2_TRAIT.burnMax) return ' Heartburn is full: his next attack or GRUMBLE roars.';
  if(B2.crust&&!u.ateCrust) return (B2.hot?' Hot Dish':' Warm Crust')+' on the tray (▼).';
  return '';
}
