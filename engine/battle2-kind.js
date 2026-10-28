'use strict';
// engine/battle2-kind.js — Kindness, the HEART meter and Tombos (F5; claude/battle-design.md sections 2, 6 and 9).
//   Kindness: every enemy has a pink Warmth bar (u.warm / u.warmGoal, set in b2FoeUnit). Kind moves fill it (B2_KIND,
//     scaled by the actor's WARMTH); favorites (B2_GRUMP likes) count in full, others half; repeats on the same enemy
//     halve. A full bar Un-Grumps it: a heart pops, it hops home and counts as beaten (b2Calm). Bosses take their adds home.
//   HEART: shared party meter 0 to 100 (B2.heart). Basic moves +5, heals/buffs/DEFEND +15, hitting a weakness or a
//     favorite kind move +15 (once per move), an enemy action that hurts the party +10, Un-Grumping +20.
//   Tombos: Tom plus a partner (B2_TOMBOS), paid from HEART, chosen with D-pad Left on either one's turn. The partner
//     keeps their own turn. Damage uses the pair's average stats. Every Tombo breaks a boss shield (b2ApplyFx).
// Data lives in data/battle2-data.js; the hooks are in engine/battle2.js; the screen in engine/battle2-ui.js.

// ---------- HEART meter ----------
function b2HeartStart(cfg) {
  const saved=typeof STORY!=='undefined'&&typeof STORY.flags.heart==='number'?STORY.flags.heart:0;
  B2.heart=cfg.heart!=null?cfg.heart:(B2.foes.some(f=>f.boss)?B2_HEART.boss:saved);
  B2.tombos=cfg.tombos||null;
}
function b2HeartSave() {
  if(B2.cfg&&B2.cfg.npc&&typeof STORY!=='undefined') STORY.flags.heart=Math.round(B2.heart);
}
function b2Heart(n) {
  if(!n) return;
  const was=B2.heart;
  B2.heart=Math.max(0,Math.min(B2_HEART.cap,B2.heart+n));
  // A new heart filled: a little chime.
  if(n>0&&Math.floor(B2.heart/25)>Math.floor(was/25)&&sfx.ding) sfx.ding();
}
const b2IsCare=act=>!!(act.support||(act.fx||[]).some(f=>f[0]==='heal'||f[0]==='revive'||f[0]==='cure'||(f[0]==='st'&&B2_STATUS[f[1]]&&B2_STATUS[f[1]].buff)));
// HEART earned by a finished move (Tombos spend HEART, they never earn it).
function b2MoveHeart(M) {
  if(M.act.tombo) return;
  let g=0;
  if(M.act===M.u.kit.basic) g+=B2_HEART.basic;
  if(b2IsCare(M.act)&&!M.kindOnFoe) g+=B2_HEART.care;
  if(M.weakHit||M.kindWeak) g+=B2_HEART.weak;
  b2Heart(g);
}

// ---------- Kindness ----------
function b2MoveName(key) {
  const [id,k]=key.split('.'),kit=B2_SKILLS[id]; if(!kit) return key;
  const s=[kit.basic,kit.special,...kit.skills,...(kit.o3||[])].find(x=>x&&x.key===k);
  return s?s.name:key;
}
// Option 3 signatures whose doc key differs from the legacy key: kindness values and liked lists use the legacy key.
const B8_SIG_LEGACY={'deedee.moon_back':'deedee.hug','nara.puppy_eyes':'nara.puppy','amy.pep_talk':'amy.pep'};
function b2Kindness(M) {
  const key0=M.act.tombo?'tombo.'+M.act.id:M.u.id+'.'+M.act.key,key=B8_SIG_LEGACY[key0]||key0;
  const V=M.act.tombo?M.act.kindV:B2_KIND[key]; if(!V) return;
  const foeT=M.targets.filter(t=>t.side==='foe'&&b2Alive(t));
  const ally=['ally','allyko','party','self'].includes(M.act.target);
  const list=foeT.length?foeT:(ally?b2LiveFoes():[]);
  if(!list.length) return;
  const scale=Math.max(.2,b2Eff(M.u,'warmth')/B2_KIND_SCALE)*(1+((M.u.perk&&M.u.perk.kind)||0))*(M.act.polish||1);   // Tiny Clay Taco perk; Polish rank 2+
  for(const t of list) {
    const fav=!!M.act.tombo||t.likes.includes(key),n=t.kindLog[key]||0;
    t.kindLog[key]=n+1;
    const amt=Math.max(1,Math.round(V*(fav?1:B2_KIND_OTHER)*Math.pow(B2_KIND_REPEAT,n)*scale));
    t.warm=Math.min(t.warmGoal,t.warm+amt); t.warmFlash=.6;
    const p=b2FoePoint(t),c=b2FoeCanvasPos(t);
    pop('+'+amt,p.x+7,p.y-3,'#ff9ac0');
    b2Fx({kind:'heart',x:c.x+18,y:c.y-c.h,small:true,t:0,dur:.9});
    if(fav&&!M.act.tombo) { M.kindWeak=true; if(n===0) battle.texts.push({txt:'SOOTHED',x:p.x,y:p.y-16,color:'#ff9ac0',sc:1,t:0,dur:1.1}); }
    if(t.warm>=t.warmGoal) b2Calm(t,M);
  }
  if(sfx.ding) sfx.ding();
}
// Un-Grumped: a big heart, sparkles, and it hops home. Counts as beaten.
function b2Calm(t,M) {
  if(t.calm||t.dead||t.hp<=0) return;
  t.calm=true; t.calmT=0; t.intent=null; t.shield=null; t.st={};
  const c=b2FoeCanvasPos(t),p=b2FoePoint(t);
  b2Fx({kind:'heart',x:c.x,y:c.y-c.h-6,t:0,dur:1.7});
  b2Burst(t,'sparkle');
  battle.texts.push({txt:'UN-GRUMPED',x:p.x,y:p.y-26,color:'#ff9ac0',sc:1,t:0,dur:1.5});
  sfx.levelChime();
  b2Heart(B2_HEART.calm);
  if(M) M.calmed.push(t); else B2.calmLate=(B2.calmLate||[]).concat([t]);
  // A happy boss takes its helpers home with it.
  if(t.boss) for(const f of b2LiveFoes()) b2Calm(f,M);
}
function b2CalmText(list) {
  const boss=list.find(f=>f.boss);
  if(boss) return cap(boss.def.the)+' feels better. It waves and hops home happy.'+(list.length>1?' Its friends follow.':'');
  if(list.length>1&&list.every(f=>f.id===list[0].id)) return 'The '+list[0].def.name+'s feel better. They wave and hop home.';
  if(list.length>1) return list.map(f=>f.name).join(' and ')+' feel better. They wave and hop home.';
  return list[0].name+' feels better. It waves and hops home.';
}
// The Inspect hint for one enemy (B on the command cross).
function b2InspectText(f) {
  const here=new Set(B2.party.filter(b2Alive).map(p=>p.id));
  // A move and its Option 3 stand-in (B8_LIKE_ALIAS) show once, by the name of whichever one is in that member's kit.
  const likes=[...new Set(f.likes.filter(k=>here.has(k.split('.')[0])).map(b8LikeShown).filter(Boolean))].map(b2MoveName);
  const weak=f.revealed?(f.weak.length?f.weak.map(e=>B2_ELEMS[e].name).join(', '):'nothing'):'??? (Flashcard Flurry or Red Pen)';
  return f.name+': '+f.grumpy+' Cheer it up with '+(likes.length?likes.join(', '):'nobody here, sadly')+'. Weak to '+weak+'.'+(f.mirror?' MIRROR SIDE: '+B2_ELEMS[f.mirror].name+' (those hits bounce back).':'');
}

// ---------- Tombos ----------
for(const T of B2_TOMBOS) T.tombo=true;
// A Director's Cut (T.dc) also needs every participant at level 30 (b8DcOpen, engine/progress.js).
const b2TomboOpen=T=>B2.tombos==='all'||(typeof STORY!=='undefined'&&!!STORY.flags[T.flag]&&
  (!T.dc||(typeof b8DcOpen==='function'&&b8DcOpen(B8_COMBOS.find(c=>c.id===T.dc)))));
// What the current actor could pick: unlocked Tombos whose partner is in this fight.
// Family Finishes (rows with `who`): the members taking part, or null when one of them is not in this fight.
function b2FinishMembers(T) {
  if(T.who==='all') return B2.party.length>=3?B2.party.slice():null;
  const m=T.who.map(id=>B2.party.find(p=>p.id===id));
  return m.every(Boolean)?m:null;
}
// The menu (all falsy) hides rows the HEART meter cannot pay for yet; all=true keeps them (to tell NONE YET from
// not enough HEART). Rows the actor is not part of are left out. Each row's `with` is who to show portraits of: the
// actor's partner(s) in that Tombo.
function b2TomboRows(u,all) {
  const tom=b2Tom(),rows=[];
  for(const T of B2_TOMBOS) {
    if(!b2TomboOpen(T)) continue;
    if(!all&&B2.heart<T.cost) continue;
    if(T.who) {
      const mem=b2FinishMembers(T); if(!mem) continue;
      if(!mem.includes(u)) continue;   // only the members see a Family Finish
      const down=mem.find(p=>!b2Alive(p));
      let why='';
      if(down) why=down.name+' is knocked out.';
      else if(mem.some(p=>p.st.shushed)) why='Shushed. No Tombos for now.';
      else if(B2.heart<T.cost) why='Needs '+T.cost+'% HEART. The meter is at '+Math.floor(B2.heart)+'%.';
      rows.push({T,mem,with:mem.filter(p=>p!==u),label:(T.dc?'DIRECTOR’S CUT · ':'')+'FAMILY · '+mem.map(p=>p.name.toUpperCase()).join(' + '),why});
      continue;
    }
    const pt=B2.party.find(p=>p.id===T.partner); if(!pt||!tom) continue;
    if(u!==tom&&u!==pt) continue;   // only Tom and the partner see their Tombo
    let why='';
    if(!b2Alive(tom)) why='Tom is knocked out.';
    else if(!b2Alive(pt)) why=pt.name+' is knocked out.';
    else if(tom.st.shushed||pt.st.shushed) why='Shushed. No Tombos for now.';
    else if(B2.heart<T.cost) why='Needs '+T.cost+'% HEART. The meter is at '+Math.floor(B2.heart)+'%.';
    rows.push({T,pt,with:[u===tom?pt:tom],label:(T.dc?'DIRECTOR’S CUT · ':'')+'TOM + '+pt.name.toUpperCase(),why});
  }
  return rows;
}
const b2TomboReady=u=>b2TomboRows(u).some(r=>!r.why);
function b2RunTombo(u,act,opt) {
  if(act.who) { b2RunFinish(u,act,opt); return; }
  const tom=b2Tom(),pt=B2.party.find(p=>p.id===act.partner);
  b2Heart(-act.cost); b2AddMile(1); b2Render();   // every Tombo earns Tom an Upgrade Mile
  // The pair hits with their average strength.
  const combo={side:'party',id:'tombo',name:'Tom and '+pt.name,st:{},kit:{},idx:tom.idx,lvl:tom.lvl};
  for(const k of B2_STAT_KEYS) combo[k]=(b2Eff(tom,k)+b2Eff(pt,k))/2;
  battle.actor=tom.idx;
  const M=b2BeginMove(combo,act,opt||{targets:[]});
  M.tom=tom; M.pt=pt; M.miles=1;   // its Upgrade Mile counts toward the one-per-action cap
  const E={tom,pt,fxT:battle.fx[tom.idx],fxP:battle.fx[pt.idx],M,act,targets:M.targets,result:M.result,apply:()=>b2ApplyFx()};
  b2Fx({kind:'banner',name:act.name,head:act.dc?"DIRECTOR'S CUT!":'TOMBO!',t:0,dur:1.8});
  sfx.levelUp();
  const fn=B2_TOMBO_ANIM[act.id];
  // Both step out in front of the party first (b2StageOut), so neither crosses or overlaps Grace and Rose; the scene
  // then starts from those spots, and b2Unstage walks them home when the move finishes.
  b2StageOut(tom,pt);
  enqueue(B2_STAGE.ms,()=>{
    try { if(fn) fn(E); else b2TomboPlain(E); }
    catch(err) { console.error('tombo '+act.id,err); clearBattleQueue(); b2TomboPlain(E); }
  });
}
// Tombo staging spots (stage units): Tom on the near side, the partner a step back, side by side with no overlap.
const B2_STAGE={tom:{x:92,base:86},pt:{x:117,base:100},ms:460};
function b2StageOut(tom,pt) {
  if(B2.staged) b2Unstage(true);
  B2.staged=[];
  const go=(u,to)=>{ const from=BATTLE_POS[u.idx],fx=battle.fx[u.idx],sp=BATTLE_SPRITES[u.id];
    B2.staged.push({i:u.idx,id:u.id,old:from});
    BATTLE_POS[u.idx]={x:to.x,base:to.base};
    const x0=from.x*3,b0=from.base*3,x1=to.x*3,b1=to.base*3;
    fx.path={t:0,dur:B2_STAGE.ms/1000,fn:(q,c)=>{ const e=q*q*(3-2*q); return {cx:x0+(x1-x0)*e,base:b0+(b1-b0)*e,frame:q<.97?(sp.run?sp.run[Math.floor(c.t*12)%2]:sp.idle):sp.idle}; }}; };
  go(tom,B2_STAGE.tom); go(pt,B2_STAGE.pt);
}
function b2Unstage(instant) {
  const list=B2.staged; B2.staged=null; if(!list) return 0;
  for(const s of list) { const u=B2.party.find(p=>p.idx===s.i); const cur=BATTLE_POS[s.i],fx=battle.fx[s.i],sp=BATTLE_SPRITES[s.id];
    BATTLE_POS[s.i]=s.old;
    if(instant||!u||!b2Alive(u)) { fx.path=null; continue; }
    const x0=cur.x*3,b0=cur.base*3,x1=s.old.x*3,b1=s.old.base*3;
    fx.path={t:0,dur:B2_STAGE.ms/1000,fn:(q,c)=>{ const e=q*q*(3-2*q); return {cx:x0+(x1-x0)*e,base:b0+(b1-b0)*e,frame:q<.97?(sp.runFlip?sp.runFlip[Math.floor(c.t*12)%2]:sp.flip):sp.idle}; }}; }
  return B2_STAGE.ms;
}
// A Family Finish: everyone taking part hits with the group's average strength. Its animation gets
// E={tom (or null),mem,fx (each member's battle.fx, same order),M,act,targets,result,apply}.
function b2RunFinish(u,act,opt) {
  const mem=b2FinishMembers(act)||[u],tom=mem.find(p=>p.id==='tom')||null,lead=tom||u;
  b2Heart(-act.cost); if(tom) b2AddMile(1); b2Render();   // the Upgrade Mile only when Tom takes part
  const names=mem.map(p=>p.name),combo={side:'party',id:'tombo',name:names.slice(0,-1).join(', ')+' and '+names[names.length-1],st:{},kit:{},idx:lead.idx,lvl:lead.lvl};
  for(const k of B2_STAT_KEYS) combo[k]=mem.reduce((a,p)=>a+b2Eff(p,k),0)/mem.length;
  battle.actor=lead.idx;
  const M=b2BeginMove(combo,act,opt||{targets:[]});
  M.members=mem; M.tom=lead; M.pt=null; if(tom) M.miles=1;
  const E={tom,mem,fx:mem.map(p=>battle.fx[p.idx]),M,act,targets:M.targets,result:M.result,apply:()=>b2ApplyFx()};
  b2Fx({kind:'banner',name:act.name,head:act.dc?"DIRECTOR'S CUT!":'FAMILY FINISH!',t:0,dur:1.8});
  sfx.levelUp();
  const fn=B2_TOMBO_ANIM[act.id];
  try { if(fn) fn(E); else b2FinishPlain(E); }
  catch(err) { console.error('finish '+act.id,err); clearBattleQueue(); for(const f of E.fx) f.path=null; b2FinishPlain(E); }
}
function b2FinishPlain(E) {
  enqueue(()=>{ setMessage((E.act.dc?"DIRECTOR'S CUT! ":'FAMILY FINISH! ')+E.act.name+'!'); for(const f of E.fx) f.hop=.4; },700,()=>{ landHit(100); E.apply(); },700,E.result||E.act.desc,()=>checkEnemy());
}
function b2TomboPlain(E) {
  enqueue(()=>{ setMessage('TOMBO! '+E.act.name+'!'); E.fxT.hop=.4; E.fxP.hop=.4; },700,()=>{ landHit(100); E.apply(); },700,E.result||E.act.desc,()=>checkEnemy());
}

// ---------- Tombo animations: made from the existing scenes, props and body moves ----------
const B2_TOMBO_ANIM={};
(function(){
const {scene,GX}=RFX;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const home=u=>{ const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const glowOn=(u,c)=>{ const h=home(u); scene('glow',.9,{x:h.x,y:h.base-h.h*.45,rx:38,ry:52,c,a:.35}); };
const path=(fx,dur,fn)=>{ fx.path={t:0,dur,fn}; return fx.path; };
const heartsToFoes=from=>{ const h=home(from); b2LiveFoes().forEach((f,k)=>{ const c=b2FoeCanvasPos(f); toss('dheart',h.x-10,h.base-h.h*.7,c.x,c.y-c.h*.6,k*.08,.6,50,{spin:false,r:9}); }); };

// deedee1 (Wine and Gossip) and tnb1 (Popcorn Jump) are in the Task T section below.

// nara1 (Sit. Paw. Treat.) and boppy1 (You Hold the Net) are in the Task T section below.

// amy1 (I Called It!) is in the Task T section below.
})();

// ================= Task T: tier-1 Primary Tombos (tombo-review.md, approved 24 Oct 2026) =================
// Squishy Delivery (grace1, was Hi Guys, Welcome Back!) and Double-Decker Airplane (rose1). Keys, HEART cost, multiplier and effects are
// unchanged; the scene, lines and animation are new. Each pair is posed from one timeline function that both bodies
// read, so they stay in step. Scenes prefix tb_ (drawn without the aim warp; the aim is cleared while they play).
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const seg=(ms,a,b)=>cl((ms-a)/(b-a));
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const star=(x,y,r,c)=>{ if(RFX.gStar) RFX.gStar(x,y,r,c); else E(x,y,r,r,c); };
const heart=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y+r*.9); gfx.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.7,y-r*1.4,x,y-r*.45); gfx.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.6,y-r*.2,x,y+r*.9); gfx.closePath();
  gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const S=(k,...a)=>{ try { if(sfx[k]) sfx[k](...a); } catch(e){} };
const CREAM='#fff6dc',GOLD='#ffe08a',PINK='#ff9ac0',RED='#e0402e',SKIN='#f0b892',SKIN2='#d8946e';
ST.nw('tb_');
// A big outlined word that pops in, holds and fades (canvas coordinates, kept on screen).
SC.tb_word=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  const x=Math.max(w/2+8,Math.min(568-w/2,s.x)),y=Math.max(sc*5+14,s.y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; };
const word=(txt,x,y,c,sc=4,dur=1,rot=0)=>scene('tb_word',dur,{txt,x,y,c,sc,rot});
SC.tb_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.6,s.w||3,s.c||CREAM); } gfx.globalAlpha=1; };
// The whole set piece's drawing, every frame, from the shared state P (filled by the bodies' paths).
SC.tb_draw=(s,u)=>{ s.draw(s,u,s.t*1000); gfx.globalAlpha=1; };
const runFr=(sp,t,dir)=>dir>0?(sp.runFlip?sp.runFlip[Math.floor(t*12)%2]:sp.flip):(sp.run?sp.run[Math.floor(t*12)%2]:sp.idle);
const pathOf=(fx,dur,fn)=>{ fx.path={t:0,dur:dur/1000,fn:(q,c)=>fn(q*dur,c)}; };
const glowOn=u=>{ const h=ST.unit(u); scene('glow',.9,{x:h.x,y:h.mid,rx:38,ry:52,c:GOLD,a:.35}); };

// ---------- Squishy Delivery (Tom + Grace, tier 1; key grace1) ----------
// Grace begs Tom for a new squishy (clasped hands, hops, puppy eyes). Tom sighs and says fine. A gift box floats down from
// the sky and pops open, and a big pink sparkly dice squishy tumbles out and lands on the front monster with a squish-bounce.
// Effects unchanged: party heals 35% and loses its debuffs; every monster warms up. phone(), thumb() and tb_rec are still
// used by the Director's Cut Smash That Like Button (grace1_dc) below.
const phone=(x,y,lift)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(-.12);
  RO(-8,-14,16,28,'#1e1c26'); R(-6,-12,12,24,'#2c2a36'); EO(-2,-8,2.6,2.6,'#5a6a8a'); E(-2.6,-8.6,.9,.9,'#dfe8ff');
  if(Math.floor(performance.now()/400)%2) E(4,-10,1.6,1.6,RED); gfx.restore(); };
// Tom's thumb in front of the lens: a huge soft pink blob from the right edge, with a nail.
const thumb=(k,wig)=>{ if(k<.01) return; const x=lerp(640,440,k),y=212+Math.sin(wig)*4;
  gfx.save(); gfx.translate(x,y); gfx.rotate(-.5);
  E(0,0,92,64,OUT); E(0,0,88,60,SKIN); E(-18,-14,52,30,'#f7caa8'); E(26,22,56,28,SKIN2);
  E(-52,-6,30,24,OUT); E(-52,-6,27,21,'#ffd9c4'); E(-58,-12,10,7,'#fff0e6');
  for(let j=0;j<3;j++) Ln(10+j*12,-36,4+j*12,-24,2,SKIN2);
  gfx.restore(); };
SC.tb_rec=(s,u)=>{ const ms=s.t*1000,P=s.plan,k=ez(ms/250)*(ms>P.off?1-ez((ms-P.off)/250):1); if(k<=0) return;
  gfx.globalAlpha=k; const m=14,L=30;
  for(const [x,y,dx,dy] of [[m,m+8,1,1],[576-m,m+8,-1,1],[m,316-m,1,-1],[576-m,316-m,-1,-1]]) { Ln(x,y,x+dx*L,y,6,OUT); Ln(x,y,x,y+dy*L,6,OUT); Ln(x,y,x+dx*L,y,3,CREAM); Ln(x,y,x,y+dy*L,3,CREAM); }
  if(Math.floor(ms/450)%2===0) EO(38,46,5,5,RED); label('REC',62,43,'#ffffff',2);
  const sec=Math.floor(ms/1000),tc='00:0'+Math.min(9,sec); label(tc,536,43,'#ffffff',2);
  // Thumb over the lens: in at th0, out at th1, a cheeky peek back at pk0..pk1.
  const th=ms<P.th1?ez(seg(ms,P.th0,P.th0+300)):1-ez(seg(ms,P.th1,P.th1+260)),pk=Math.sin(seg(ms,P.pk0,P.pk1)*Math.PI)*.55;
  gfx.globalAlpha=1; thumb(Math.max(th,pk),s.t*5); };
B2_TOMBO_ANIM.grace1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),G=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const tgt=(E2.targets||[]).find(t=>t.side==='foe')||list.find(f=>f.row==='front')||list[0],F=ST.foe(tgt);
  const tsp=BATTLE_SPRITES.tom,gsp=BATTLE_SPRITES.grace,TH=tsp.idle.length*tsp.scale,TW=tsp.idle[0].length*tsp.scale,GH=gsp.idle.length*gsp.scale;
  const gx=Math.max(GR.x1+60,T.x-118),gb=Math.min(316,T.base+16);
  const P={plead0:750,plead1:2050,sigh:2150,fine:2450,yes:3150,box:3250,rattle:3900,open:4500,out:4650,land:5500,settle:6500,pop:6900,back:6200,end:7500};
  const D=P.end,sky={x:F.x,y:Math.max(64,F.top-120)};
  const st={gx:G.x,gb:G.base};
  // squishy die: pink glittery cube, four pips and a squishy little face in the middle
  const rrp=(x,y,w,h,r)=>{ gfx.beginPath(); gfx.moveTo(x+r,y); gfx.arcTo(x+w,y,x+w,y+h,r); gfx.arcTo(x+w,y+h,x,y+h,r); gfx.arcTo(x,y+h,x,y,r); gfx.arcTo(x,y,x+w,y,r); gfx.closePath(); };
  const dieSq=(x,y,s,rot,sq,ms)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s*(1+sq*.3),s*(1-sq*.36));
    rrp(-22,-22,44,44,11); gfx.fillStyle='#ff7fb8'; gfx.fill(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke();
    gfx.save(); rrp(-22,-22,44,44,11); gfx.clip(); gfx.fillStyle='#ffb3d6'; gfx.fillRect(-22,-22,44,14); gfx.fillRect(-22,-22,12,44); gfx.fillStyle='#e0568f'; gfx.fillRect(-22,14,44,8); gfx.fillRect(14,-22,8,44); gfx.restore();
    for(const [px,py] of [[-11,-11],[11,-11],[-11,11],[11,11]]) { E(px,py,4.8,4.8,'#b8386f'); E(px,py,3.6,3.6,'#fff6fb'); }
    E(-5,-2,2.2,2.8,OUT); E(5,-2,2.2,2.8,OUT); E(-4.4,-3,.8,.8,'#ffffff'); E(5.6,-3,.8,.8,'#ffffff'); E(-9,4,3,1.8,'#ff4f8f'); E(9,4,3,1.8,'#ff4f8f');
    gfx.strokeStyle=OUT; gfx.lineWidth=1.6; gfx.beginPath(); gfx.arc(0,3,3.2,.15*Math.PI,.85*Math.PI); gfx.stroke();
    gfx.restore();
    for(let j=0;j<9;j++) { const a=ms/420+j*.7,r=(30+(j%3)*7)*s,tw=(Math.sin(ms/90+j*2.1)+1)/2; gfx.globalAlpha=.35+.65*tw;
      star(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,1.8+tw*2.4,j%3===0?'#aef0ff':(j%3===1?'#fffbe6':'#ffd0ea')); }
    gfx.globalAlpha=1; };
  const giftBox=(x,y,s,open,wob)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(wob); gfx.scale(s,s);
    RO(-22,-8,44,30,'#4fc3d8'); R(-4,-8,8,30,'#ffd166'); R(-22,4,44,5,'#3aa0b5');
    gfx.save(); gfx.translate(open*28,-8-open*36); gfx.rotate(-open*1.1); RO(-26,-12,52,12,'#6fd8ea'); R(-4,-12,8,12,'#ffd166');
    EO(-8,-17,7,5,'#ffd166'); EO(8,-17,7,5,'#ffd166'); EO(0,-14,4,4,'#ffb43a'); gfx.restore(); gfx.restore(); };
  const rays=(x,y,k)=>{ gfx.globalAlpha=.55*k; for(let j=-3;j<=3;j++) { const a=-Math.PI/2+j*.24; gfx.fillStyle=j%2?'#fff3b0':'#ffe08a'; gfx.beginPath(); gfx.moveTo(x,y);
    gfx.lineTo(x+Math.cos(a-.07)*130,y+Math.sin(a-.07)*130); gfx.lineTo(x+Math.cos(a+.07)*130,y+Math.sin(a+.07)*130); gfx.closePath(); gfx.fill(); } gfx.globalAlpha=1; };
  const clasp=(x,y)=>{ EO(x-2,y,5.5,4.5,SKIN); EO(x+4,y-1,5,4.2,'#f7caa8'); Ln(x-1,y-3,x+3,y+1,1.2,SKIN2); };
  const puff=(x,y,k)=>{ for(let j=0;j<4;j++) { const q=cl(k*1.2-j*.12); if(q<=0||q>=1) continue; gfx.globalAlpha=(1-q)*.85; E(x-q*34-j*7,y-q*18-j*3,5+q*7,3.5+q*5,'#e8eef5'); } gfx.globalAlpha=1; };
  // Grace: runs to her mark facing Tom, begs with clasped hands and hops, cheers, then runs home.
  pathOf(fxP,D,(ms,c)=>{ const sp=c.sp; let x,y,f=sp.flip;
    if(ms<650) { const k=ez(ms/650); x=lerp(c.origX,gx,k); y=lerp(c.origBase,gb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.back) { x=gx; y=gb;
      if(ms>P.plead0&&ms<P.plead1) y-=Math.abs(Math.sin(seg(ms,P.plead0,P.plead1)*Math.PI*3))*12;
      if(ms>P.yes&&ms<P.yes+900) { y-=Math.abs(Math.sin(seg(ms,P.yes,P.yes+900)*Math.PI*2))*18; f=sp.celebFlip||sp.flip; }
      if(ms>P.land&&ms<P.land+1200) { y-=Math.abs(Math.sin(seg(ms,P.land,P.land+1200)*Math.PI*3))*14; f=sp.celebFlip||sp.flip; } }
    else { const k=ez(seg(ms,P.back,P.back+600)); x=lerp(gx,c.origX,k); y=lerp(gb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    st.gx=x; st.gb=y; return {cx:x,base:y,frame:f}; });
  // Tom: stays put, sighs, shrugs and says fine, then celebrates the landing.
  pathOf(fxT,D,(ms,c)=>{ const sp=c.sp; let y=c.origBase,f=sp.idle;
    if(ms>P.sigh&&ms<P.fine+800) { f=sp.expr||sp.idle; y+=Math.sin(seg(ms,P.sigh,P.sigh+500)*Math.PI)*2; if(ms>P.fine-100&&ms<P.fine+500) y-=Math.sin(seg(ms,P.fine-100,P.fine+500)*Math.PI*2)*4; }
    if(ms>P.land&&ms<P.land+900) f=sp.celeb;
    return {cx:c.origX,base:y,frame:f}; });
  scene('tb_draw',D/1000,{back:false,draw:(s,u,ms)=>{
    const gy=st.gb-GH,mx=T.x-TW/2+10*tsp.scale,my=T.base-TH+17*tsp.scale;
    // begging: clasped hands in front of her chest, shiny puppy-eye twinkles and a tear
    if(ms>P.plead0-100&&ms<P.yes) { const tw=(Math.sin(ms/110)+1)/2; clasp(st.gx+14,st.gb-GH*.42);
      gfx.globalAlpha=.5+.5*tw; star(st.gx+9,gy+GH*.2,3+tw*2,'#ffffff'); star(st.gx+20,gy+GH*.2,2.4+(1-tw)*2,'#ffffff'); gfx.globalAlpha=1;
      if(ms>P.plead0+400) E(st.gx+21,gy+GH*.3+((ms/40)%10),1.6,2.4,'#9fd8ff'); }
    // Tom's sigh
    if(ms>P.sigh&&ms<P.sigh+900) puff(mx,my,seg(ms,P.sigh,P.sigh+900));
    // the gift box floats down from the sky, rattles, then pops open
    if(ms>P.box&&ms<P.out+500) { const k=ez(seg(ms,P.box,P.box+500)),op=ez(seg(ms,P.open,P.open+260)),wob=ms>P.rattle&&ms<P.open?Math.sin(ms/28)*(.12+seg(ms,P.rattle,P.open)*.1):0,fl=Math.sin(ms/260)*3;
      gfx.globalAlpha=k*(1-ez(seg(ms,P.out+250,P.out+500))); if(op>0) rays(sky.x,sky.y-4,op*(1-seg(ms,P.out+100,P.out+500)));
      giftBox(sky.x,lerp(sky.y-90,sky.y,k)+fl,lerp(.2,1.4,k),op,wob); gfx.globalAlpha=1; }
    // the dice squishy tumbles out and drops onto the front monster
    if(ms>P.out&&ms<P.pop) { let x,y,rot=0,sq=0,sc=1.5;
      if(ms<P.land) { const k=seg(ms,P.out,P.land),e=k*k*(3-2*k),q=ez(k); x=lerp(sky.x,F.x,q)+Math.sin(k*Math.PI*3)*10*(1-k); y=lerp(sky.y,F.top-8,e)-Math.sin(Math.min(1,k*3)*Math.PI)*30; rot=k*Math.PI*4; sc=lerp(.6,1.6,Math.min(1,k*2)); sq=k<.12?-.5:-.15*(1-k); }
      else { const k=seg(ms,P.land,P.settle),b=Math.exp(-3.2*k); x=F.x; y=F.top-8-Math.abs(Math.sin(k*Math.PI*2.2))*38*(1-k)+(1-b)*0; sq=Math.cos(k*Math.PI*7)*.55*b+.1*b; sc=1.6; }
      if(ms>P.settle) { const k=seg(ms,P.settle,P.pop); gfx.globalAlpha=1-k; sc*=1+k*.5; }
      dieSq(x,y,sc,rot,sq,ms); gfx.globalAlpha=1; } }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Grace needs a new squishy.'); B2.aim=null; S('click'); }],
    [700,()=>{ word('PLEEASE!',gx+10,gb-GH-14,PINK,4,1.2); S('squeak'); }],
    [900,()=>{ say('grace','tombo'); S('bump'); }],
    [1500,'Her puppy eyes are on full power.'],
    [P.sigh,()=>{ S('whoosh'); setMessage('Tom sighs. He knows how this ends.'); }],
    [P.fine,()=>{ say('tom','tombograce'); word('FINE.',T.x-20,T.base-TH-14,CREAM,4,1); }],
    [P.yes,()=>{ word('YAY!',gx+10,gb-GH-14,GOLD,4,1); S('cheer'); }],
    [P.box,()=>{ setMessage('A gift box floats down from the sky.'); S('whoosh'); }],
    [P.rattle,()=>{ S('squeak'); }],
    [P.open,()=>{ S('ding'); S('chime2'); setMessage('The box pops open!'); scene('tb_rings',.7,{x:sky.x,y:sky.y,r:70,c:GOLD,w:3}); }],
    [P.out,()=>{ S('slideWhistle'); setMessage('A big sparkly dice squishy tumbles out.'); }],
    [P.land-250,()=>{ S('whoosh'); }],
    [P.land,()=>{ S('splat'); S('thud'); battle.shakeEnemy=.6; for(const f of list) ST.jolt(f,f===tgt?.8:.4); word('SQUISH!',F.x,F.top-50,PINK,6,1.3);
      scene('tb_rings',.8,{x:F.x,y:F.mid,r:100,c:PINK,w:4}); scene('confetti',1.6,{x0:GR.x0,x1:576,n:34});
      E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal');
      list.forEach((f,k)=>{ const q=ST.foe(f); for(let j=0;j<2;j++) battle.props.push({kind:'dheart',x0:q.x,y0:q.mid,x1:q.x+(j?18:-18),y1:q.top-30,arc:20,spin:false,r:8,t:-(k*.1+j*.15),dur:.7}); }); }],
    ['hf',P.land],
    [P.land+350,()=>{ S('fanfare'); setMessage('Warm, pink and glittery. Everybody feels it.'); }],
    [P.end,'end','The party is healed and fresh. The monsters got a squishy to the face, and they kind of loved it.']]);
};
// Right-facing copy of a frame, made once per sprite.
const mirCache=new Map();
function mirrorRowsCached(sp,k) { const key=sp[k]; if(!mirCache.has(key)) mirCache.set(key,mirrorRows(key)); return mirCache.get(key); }

// ---------- Double-Decker Airplane (Tom + Rose, tier 1) ----------
// Tom hoists Rose onto his shoulders. Goggles on. They are a biplane: Tom is the bottom wing, Rose the top wing. Tom
// sprints a loop through the monsters, banking, contrails streaming; the wings clip the target twice. Then he stops in
// front of it, Rose leans all the way down and BOOPS its nose. Effects unchanged: big Kinetic hit, it loses its next
// turn, and Rose stays up on Tom's shoulders (Shoulder Ride).
const goggles=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a);
  Ln(-16,0,16,0,4,OUT); Ln(-16,0,16,0,2,'#6a4a2a');
  for(const dx of [-7,6]) { EO(dx,0,6.5,5.5,'#c9a23a'); E(dx,0,4.6,3.8,'#9fe0ff'); E(dx-1.6,-1.4,1.6,1.2,'#ffffff'); }
  gfx.restore(); };
// One biplane wing: a long red plank with cream stripes and round ends.
const wing=(x,y,w,h)=>{ RO(x-w/2,y-h/2,w,h,RED); for(let j=-2;j<=2;j++) R(x+j*w/5-3,y-h/2,6,h,CREAM); R(x-w/2,y-h/2,w,2,'#ff8a6a');
  EO(x-w/2,y,h/2,h/2,RED); EO(x+w/2,y,h/2,h/2,RED); };
B2_TOMBO_ANIM.rose1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,TH=tsp.idle.length*tsp.scale,rsp=BATTLE_SPRITES.rose,RH=rsp.idle.length*rsp.scale;
  const yUp=cl(Math.min(...GR.list.map(p=>p.base))-14,200,290),yLo=cl(GR.base+26,yUp+30,318),yMid=(yUp+yLo)/2;
  // The boop: where its nose is, how far Rose must lean, and where Tom stops so her face meets it.
  const nose={x:F.x+F.w*.18,y:F.top+F.h*.45};
  const seatAt=(tx,ty,trot)=>{ const ox=2,oy=-(TH/2-20); return {x:tx+ox*Math.cos(trot)-oy*Math.sin(trot),y:ty-TH/2+ox*Math.sin(trot)+oy*Math.cos(trot)}; };
  const lean=-.22,seat0=seatAt(0,0,lean),HD=RH*.3,stopY=cl(F.base+6,200,318);
  const headOff=t=>({x:(RH/2+HD)*Math.sin(t),y:-(RH/2+HD)*Math.cos(t)});
  let th=-.5; while(th>-2.9&&stopY+seat0.y+headOff(th).y<nose.y-4) th-=.05;
  const ho=headOff(th),stopX=Math.min(T.x,nose.x-(seat0.x+ho.x)+4);
  // Timeline (ms) and Tom's route: a loop through the monsters, then the stop.
  const P={hop:600,wingIn:700,go:1300,hit1:1900,hit2:2850,arrive:3700,wingOut:3600,lean0:3850,boop:4250,lean1:4700,home0:4950,end:5600};
  const K=[[0,T.x,T.base],[P.go,T.x,T.base],[1950,Math.max(GR.x0+10,104),yUp],[2400,Math.max(GR.x0-36,80),yMid],[3000,Math.min(GR.x1+46,T.x-40),yLo],[3350,Math.min(GR.x1+80,T.x-20),yMid],[P.arrive,stopX,stopY],[P.home0,stopX,stopY],[P.end-80,T.x,T.base],[P.end,T.x,T.base]];
  const S0={x:T.x,y:T.base,rot:0,dir:-1,bank:0,rx:0,rb:0,rrot:0};
  const at=ms=>{ let i=0; while(i<K.length-2&&ms>K[i+1][0]) i++; const a=K[i],b=K[i+1],k=cl((ms-a[0])/Math.max(1,b[0]-a[0])),e=i>=1&&i<=4?k:ez(k);
    return [lerp(a[1],b[1],e),lerp(a[2],b[2],e),i]; };
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp,[x,y,i]=at(ms),[x2]=at(ms+40),dir=x2>x+.3?1:(x2<x-.3?-1:S0.dir);
    let rot=0,f=sp.idle,bob=0;
    if(ms<P.go) { f=ms>P.wingIn+100?sp.celeb:sp.idle; bob=ms>P.wingIn?Math.abs(Math.sin(ms/90))*2:0; }
    else if(ms<P.arrive) { f=runFr(sp,c.t,dir); bob=Math.abs(Math.sin(c.t*14))*5; const [,y2]=at(ms+60); rot=cl((y2-y)*.02,-.18,.18)*(dir>0?-1:1); }
    else if(ms<P.home0) { const k=Math.sin(seg(ms,P.arrive,P.home0)*Math.PI); rot=lean*ez(seg(ms,P.arrive,P.lean0))*(ms<P.lean1?1:1-ez(seg(ms,P.lean1,P.home0))); f=sp.idle; }
    else { f=ms<P.end-80?(dir>0?(sp.runFlip?sp.runFlip[Math.floor(c.t*7)%2]:sp.flip):sp.idle):sp.idle; }
    S0.x=x; S0.y=y-bob; S0.rot=rot; S0.dir=dir; S0.bank=ms>P.go&&ms<P.arrive?rot*1.8+Math.sin(ms/240)*.06:0;
    return {cx:x,base:y-bob,frame:f,rot,noShadow:false}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.hop) { const k=ez(ms/P.hop),s=seatAt(S0.x,S0.y,S0.rot); return {cx:lerp(c.origX,s.x,k),base:lerp(c.origBase,s.y,k)-Math.sin(k*Math.PI)*90,frame:sp.celeb,noShadow:true}; }
    const s=seatAt(S0.x,S0.y,S0.rot);
    let t=S0.rot*.6;
    if(ms>P.lean0&&ms<P.home0) t=lerp(t,th,ez(seg(ms,P.lean0,P.lean0+380))*(1-ez(seg(ms,P.lean1,P.lean1+260))));
    const px=s.x+(RH/2)*Math.sin(t),py=s.y-(RH/2)*Math.cos(t);
    const f=S0.dir>0&&ms>P.go?(sp.celebFlip||sp.flip):(ms>P.wingIn&&ms<P.arrive?sp.celeb:sp.idle);
    S0.rx=px; S0.rb=py+RH/2; S0.rrot=t; S0.rf=f;
    return {cx:px,base:py+RH/2,frame:f,rot:t,noShadow:true}; });
  // Wings, contrails and goggles, drawn over the two of them.
  const trail=[];
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    const wk=ms<P.wingOut?ez(seg(ms,P.wingIn,P.wingIn+300)):1-ez(seg(ms,P.wingOut,P.wingOut+250));
    const cx=S0.x,lowY=S0.y-TH*.62,upY=S0.rb-RH*.5,b=S0.bank;
    const tip=(dx,dy)=>[cx+dx*Math.cos(b)-dy*Math.sin(b),lowY+dx*Math.sin(b)+dy*Math.cos(b)];
    if(ms>P.go&&ms<P.arrive+400) { if(ms<P.arrive) trail.push({t:ms,pts:[tip(-86,0),tip(86,0),tip(-70,upY-lowY),tip(74,upY-lowY)]});
      while(trail.length&&ms-trail[0].t>650) trail.shift();
      for(let j=0;j<4;j++) for(let i=1;i<trail.length;i++) { const a=trail[i-1],c2=trail[i],q=1-(ms-c2.t)/650; gfx.globalAlpha=Math.max(0,q)*.8; Ln(a.pts[j][0],a.pts[j][1],c2.pts[j][0],c2.pts[j][1],2+q*4,'#ffffff'); }
      gfx.globalAlpha=1; }
    if(wk>0) { gfx.save(); gfx.translate(cx,lowY); gfx.rotate(b); gfx.scale(wk,1);
      const up=upY-lowY; for(const sx of [-38,38]) { Ln(sx,up,sx,0,6,OUT); Ln(sx,up,sx,0,3,'#8a5a30'); }
      wing(0,0,160,14); wing(2,up,132,12);
      if(ms>P.go&&ms<P.arrive) { const pr=Math.floor(ms/40)%2; E(-86,0,3,pr?11:4,'#dddddd'); }
      gfx.restore(); }
    // goggles on Rose's head, rotating with her
    { const t=S0.rrot,f=S0.dir>0&&ms>P.go?-1:1,px=S0.rx,py=S0.rb-RH/2; goggles(px-3*f*Math.cos(t)+HD*Math.sin(t),py-3*f*Math.sin(t)-HD*Math.cos(t),t); }
  }});
  const hit=(n,dmg,txt)=>{ S('bonk'); ST.jolt(tgt,.4); battle.shakeEnemy=.35; word(txt,F.x,F.top-14,PINK,3,.7,n?.15:-.15); landHit(dmg); };
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Rose climbs onto Tom’s shoulders. Goggles on.'); B2.aim=null; say('rose','tombo',.1); S('jumpWhistle'); }],
    [P.hop,()=>{ S('boing'); }],
    [P.wingIn,()=>{ S('whoosh'); word('DOUBLE-DECKER!',T.x-150,Math.max(96,T.top-36),GOLD,3,1.1); }],
    [1050,()=>{ say('tom','tombodecker'); setMessage('Tom is the bottom wing. Rose is the top wing.'); }],
    [P.go,()=>{ S('jet'); S('run'); setMessage('Cleared for takeoff! They bank through the monsters.'); }],
    [P.hit1,()=>hit(0,30,'BONK')],
    [P.hit2,()=>hit(1,30,'BONK')],
    [P.arrive,()=>{ S('thud'); scene('dust',.6,{x:stopX,y:stopY+2,n:6,sp:16,up:10}); }],
    [P.lean0,()=>{ setMessage('Rose leans all the way down...'); }],
    [P.boop,()=>{ S('boop'); battle.flashEnemy=.3; ST.jolt(tgt,.6); battle.shakeEnemy=.6; scene('tb_rings',.7,{x:nose.x,y:nose.y,r:46,c:PINK,w:3});
      word('BOOP!',nose.x-40,nose.y-96,PINK,6,1.3); for(let k=0;k<6;k++) { const a=k/6*Math.PI*2; battle.props.push({kind:'dheart',x0:nose.x,y0:nose.y,x1:nose.x+Math.cos(a)*44,y1:nose.y+Math.sin(a)*30,arc:8,spin:false,r:5,t:0,dur:.5}); }
      landHit(40); }],
    ['hf',P.boop],
    [P.boop+500,()=>{ E2.apply(); S('stun'); }],
    [P.end,'end',(E2.result||'')+' It sees stars.']]);
};

// ---------- Shared bits for Wine and Gossip and Popcorn Jump ----------
// A body's near hand, from the pose its path just returned (Tom has no hand map, so his is estimated).
const handPt=(sp,fr,x,base,dir)=>{ const sc=sp.scale,w=fr[0].length*sc,H=fr.length*sc,h=sp.handAt&&sp.handAt.get(fr);
  return h?{x:x-w/2+h.n[0]*sc,y:base-H+h.n[1]*sc}:{x:x+(dir>0?1:-1)*w*.28,y:base-H*.5}; };
// A speech bubble that pops in with k (0..1), its tail pointing at (tx,ty); body(w,h) draws the inside.
const bubble=(x,y,w,h,tx,ty,k,body)=>{ if(k<=0) return; const s=k<1?ez(k)*(1+.1*Math.sin(k*Math.PI)):1;
  gfx.save(); gfx.translate(x,y); gfx.scale(s,s);
  const bx=cl((tx-x)*.35,-w/2+24,w/2-24),ex=(tx-x)/s,ey=(ty-y)/s;
  const tail=()=>{ gfx.beginPath(); gfx.moveTo(bx-12,h/2-10); gfx.lineTo(ex,ey); gfx.lineTo(bx+12,h/2-10); gfx.closePath(); };
  tail(); gfx.lineWidth=6; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke();
  E(0,0,w/2+3,h/2+3,OUT); tail(); gfx.fillStyle=CREAM; gfx.fill(); E(0,0,w/2,h/2,CREAM); E(-w*.18,-h*.22,w*.22,h*.12,'#ffffff');
  if(body) body(w,h); gfx.restore(); };
// Frizzy bad hair: orange zigzags sticking out of the top of a head at (x,y), size s.
const badHair=(x,y,s,t)=>{ for(const [c,lw] of [[OUT,5],['#f08a3a',2.6]]) for(let j=-4;j<=4;j++) {
    const a=j*.32+Math.sin(t*6+j)*.08,L=(14+(j%2?7:0)+Math.abs(j))*s,mx=x+j*4*s;
    gfx.strokeStyle=c; gfx.lineWidth=lw*s; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(mx,y);
    gfx.lineTo(mx+Math.sin(a)*L*.5+3*s,y-Math.cos(a)*L*.5); gfx.lineTo(mx+Math.sin(a)*L-2*s,y-Math.cos(a)*L); gfx.stroke(); } };
// A wine glass, about twice life size, tilted a.
const glass=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a);
  Ln(0,-2,0,12,5,OUT); Ln(0,-2,0,12,2,'#e8f0f4'); EO(0,13,7,2.4,'#e8f0f4');
  EO(0,-10,8,9,'#e8f0f4'); E(0,-6,6.4,5.4,'#a01e3c'); E(0,-9,6.4,1.8,'#c4344f'); E(-3.6,-13,1.6,3,'#ffffff'); gfx.restore(); };

// ---------- Wine and Gossip (Tom + Deedee, tier 1) ----------
// Deedee and Tom on the porch with a glass of wine each, gossiping loudly about the monster right in front of it.
// Giant gossip bubbles show its bad hair; it gets so embarrassed it shrinks. Deedee brings out the crisp for everyone.
// Effects unchanged except the cap: party heals 60% (was 65%), Amber melts, 2 Warm Crusts go on the tray.
B2_TOMBO_ANIM.deedee1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const PX=cl((GR.x1+T.x)/2+12,GR.x1+70,T.x-40),F=cl(GR.base-20,262,296),tx=PX-34,dx=PX+36;
  const P={walk:700,clink:1050,b1:1500,hair:1900,b1off:2500,b2:2550,b2off:3900,blush:3150,shrink:3350,small:3800,crisp:4300,heal:4750,grow:5500,home:5300,end:6100};
  const sT={x:T.x,b:T.base,f:null,dir:-1},sD={x:D.x,b:D.base,f:null,dir:-1};
  // Tom: walks to the porch, faces Deedee (right), glances at the monster while she gossips, faces it for his notes.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=F,f=sp.flip,dir=1;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,F,k); f=runFr(sp,c.t,-1); dir=-1; }
    else if(ms<P.home) { if((ms>2000&&ms<2350)||(ms>P.b2&&ms<P.b2+700)) { f=sp.idle; dir=-1; }
      else if(ms>P.clink-120&&ms<P.clink+250) f=sp.celebFlip||sp.flip;
      else if(ms>P.heal&&ms<P.heal+500) f=sp.celebFlip||sp.flip; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(F,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; dir=k<1?1:-1; }
    sT.x=x; sT.b=y; sT.f=f; sT.dir=dir; return {cx:x,base:y,frame:f}; });
  // Deedee: to the porch (facing Tom and the monster), leans in to gossip, turns round to hand out the crisp.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dx,y=F,f=sp.idle,dir=-1;
    if(ms<P.walk+80) { const k=ez(ms/(P.walk+80)); x=lerp(c.origX,dx,k); y=lerp(c.origBase,F,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { const lean=ms>P.b1&&ms<P.b1+500?Math.sin(seg(ms,P.b1,P.b1+500)*Math.PI)*-6:0; x+=lean;
      if(ms>P.b1&&ms<P.b1+700) f=sp.spread||sp.idle;
      else if(ms>P.crisp-150&&ms<P.heal+300) { f=sp.celebFlip||sp.flip; dir=1; }
      else if(ms>P.clink-120&&ms<P.clink+250) f=sp.celeb||sp.idle; }
    else { const k=ez(seg(ms,P.home+60,P.home+700)); x=lerp(dx,c.origX,k); y=lerp(F,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; dir=1; }
    sD.x=x; sD.b=y; sD.f=f; sD.dir=dir; return {cx:x,base:y,frame:f}; });
  // The monsters' shrink: 1 down to .6 and back, about their feet.
  const shrinkAt=ms=>ms<P.shrink?1:(ms<P.small?lerp(1,.6,ez(seg(ms,P.shrink,P.small))):(ms<P.grow?.6+Math.sin(ms/90)*.015:lerp(.6,1,ez(seg(ms,P.grow,P.grow+400)))));
  const foeAt=(f,s)=>{ const q=ST.foe(f),R=f.def.sprite,top=q.base-(q.h-(f.def._top||0)*f.sc)*s;
    const ey=f.def.eyes?q.top+f.def.eyes[0][1]*f.sc:q.top+q.h*.42,eyY=q.base+(ey-q.base)*s;
    const exs=f.def.eyes?f.def.eyes.map(e=>q.x+(q.x-q.w/2+e[0]*f.sc-q.x)*s):[q.x-q.w*.2*s,q.x+q.w*.2*s];
    return {q,top,eyY,exs}; };
  // The porch (behind everyone): planks, a railing and a little table with the bottle.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=ms<P.walk?ez(seg(ms,100,P.walk)):1-ez(seg(ms,P.home+200,P.home+700)); if(k<=0) return;
    gfx.globalAlpha=k; const x0=PX-96,x1=PX+96;
    for(let px=x0;px<=x1;px+=32) { RO(px-3,F-62,6,52,'#d8b07a'); }
    RO(x0-3,F-66,x1-x0+6,7,'#e2c08a'); RO(x0-3,F-40,x1-x0+6,5,'#d8b07a');
    RO(x0-12,F-12,x1-x0+24,16,'#b07a4a'); for(let px=x0;px<x1;px+=24) R(px,F-12,2,16,'#8a5a30'); R(x0-12,F-12,x1-x0+24,3,'#d29a64');
    const tx2=PX+2; RO(tx2-3,F-38,6,30,'#6a4a2a'); EO(tx2,F-40,18,5,'#8a5a30'); E(tx2,F-42,15,3,'#a8743e');
    RO(tx2+4,F-70,8,26,'#2f5a3a'); R(tx2+5,F-62,6,8,'#f4e6c8'); RO(tx2+6,F-78,4,8,'#2f5a3a'); R(tx2+6,F-80,4,3,'#a01e3c');
    gfx.globalAlpha=1; }});
  // In front: the glasses, the bubbles, the bad hair and the blushing, shrinking monsters.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>300&&ms<P.home+200) { const ht=handPt(BATTLE_SPRITES.tom,sT.f||BATTLE_SPRITES.tom.idle,sT.x,sT.b,sT.dir),hd=handPt(BATTLE_SPRITES[pt.id],sD.f||BATTLE_SPRITES[pt.id].idle,sD.x,sD.b,sD.dir);
      const cq=Math.sin(seg(ms,P.clink-200,P.clink+150)*Math.PI);
      if(!(ms>P.crisp-150&&ms<P.heal+300)) glass(hd.x-cq*8,hd.y-6-cq*10,.25*cq+(ms>P.b1&&ms<P.b1+700?-.4:0));
      glass(ht.x+cq*8,ht.y-6-cq*10,-.25*cq); }
    const s=shrinkAt(ms),live=ms<P.grow+420;
    for(const f of list) { const A=foeAt(f,s);
      if(live&&ms>P.shrink-20) { f.spin=0; f.ox=0; f.fsc=s; f.oy=A.q.h/2*(1-s); f.spinAt=performance.now(); }
      else if(ms>=P.grow+420&&f.fsc) { f.fsc=0; f.oy=0; }
      if(ms>P.hair&&ms<P.grow+400) { const k=ez(seg(ms,P.hair,P.hair+250)); gfx.globalAlpha=ms>P.grow?1-seg(ms,P.grow,P.grow+400):1; badHair(A.q.x,A.top+4*s,k*s*1.2,ms/1000); gfx.globalAlpha=1; }
      if(ms>P.blush&&ms<P.grow+300) { gfx.globalAlpha=.75*ez(seg(ms,P.blush,P.blush+300))*(ms>P.grow?1-seg(ms,P.grow,P.grow+300):1);
        for(const ex of A.exs) E(ex+(ex<A.q.x?-4:4)*s,A.eyY+9*s,7*s,4*s,'#ff5a7a'); gfx.globalAlpha=1;
        if(ms>P.small) for(let j=0;j<2;j++) { const ph=(ms/700+j*.5)%1; gfx.globalAlpha=1-ph; E(A.q.x+(j?1:-1)*A.q.w*.32*s,A.top+8+ph*16,2.4,3.4,'#9fe0ff'); gfx.globalAlpha=1; } } }
    // Bubble 1 (Deedee): a drawing of the monster's hair. Bubble 2 (Tom): his notes.
    const bk1=ms<P.b1off?seg(ms,P.b1,P.b1+260):1-seg(ms,P.b1off,P.b1off+200),bx1=cl(PX+20,120,456),by1=cl(F-170,58,140);
    bubble(bx1,by1,200,92,sD.x-14,sD.b-120,bk1,(w,h)=>{ const t=ms/1000; EO(-46,10,24,16,'#8a5a3a'); E(-52,12,4,4,'#ffffff'); E(-38,12,4,4,'#ffffff'); E(-52,13,2,2,OUT); E(-38,13,2,2,OUT);
      badHair(-46,-4,1.05,t); label('THAT',36,-14,'#3a2a22',3); label('HAIR!',38,6,RED,4); });
    const bk2=ms<P.b2off?seg(ms,P.b2,P.b2+260):1-seg(ms,P.b2off,P.b2off+200),bx2=cl(PX-60,110,456),by2=cl(F-150,70,150);
    bubble(bx2,by2,196,96,sT.x-6,sT.b-112,bk2,(w,h)=>{ gfx.save(); gfx.rotate(-.08); RO(-86,-30,46,58,'#fff8c8'); for(let j=0;j<4;j++) Ln(-80,-18+j*12,-46,-18+j*12,2,'#9ac0e0'); R(-84,-32,42,6,RED); gfx.restore();
      label('NOTES:',20,-30,'#3a2a22',2); label('1. HAIR',20,-12,'#3a2a22',2); label('2. ALSO HAIR',22,6,'#3a2a22',2); label('3. HAIR',20,24,RED,2); });
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Deedee and Tom pour a glass of wine on the porch.'); B2.aim=null; S('click'); }],
    [P.clink,()=>{ S('ting'); word('CLINK!',PX,F-128,GOLD,3,.45); scene('tb_rings',.6,{x:PX,y:F-74,r:30,c:CREAM,w:2}); }],
    [P.b1,()=>{ say('deedee','tombo'); S('pickup'); setMessage('They gossip about the monster. Loudly. Right in front of it.'); }],
    [P.hair,()=>{ S('boing'); }],
    [P.b2,()=>{ say('tom','tombodeedee'); S('pickup'); setMessage('Tom has notes.'); }],
    [P.blush,()=>{ setMessage('The monster heard EVERY word. It turns red and shrinks.'); S('whine'); }],
    [P.shrink,()=>{ S('slideWhistle'); word('BLUSH',GR.x,GR.top-30,PINK,3,1.1); }],
    [P.crisp,()=>{ setMessage('Deedee brings out the rhubarb crisp. For everyone.'); S('whoosh'); const h=handPt(BATTLE_SPRITES[pt.id],sD.f||BATTLE_SPRITES[pt.id].idle,sD.x,sD.b,sD.dir);
      b2LiveParty().forEach((p,k)=>{ if(p===pt) return; let x1,y1; if(p===tom) { x1=sT.x+20; y1=sT.b-60; } else { const q=ST.unit(p); x1=q.x-10; y1=q.mid-12; }
        battle.props.push({kind:'dcrisp',x0:h.x,y0:h.y-10,x1,y1,arc:56,spin:false,t:-k*.1,dur:.55}); }); }],
    [P.heal,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); word('RHUBARB CRISP!',PX,F-140,GOLD,3,1.2); }],
    ['hf',P.heal],
    [P.grow,()=>{ S('boing'); }],
    [P.end,'end',()=>{ for(const f of list) { f.fsc=0; f.oy=0; } return 'Wine, gossip and warm crisp. Everyone feels much better.'; }]]);
};

// ---------- Popcorn Jump (Tom + TNB, tier 1) ----------
// Movie night. The scary part hits: a slasher fills the screen. Tom jumps and throws the whole giant popcorn bowl;
// popcorn rains over every enemy. TNB laughs and kisses him. Effects unchanged: big Cozy hit on every enemy, and the
// party glows (Kiln Glow: WARMTH and COOL +25% for 3 turns).
const popcorn=(x,y,r)=>{ E(x,y,r+1.6,r+1.6,OUT); E(x-r*.5,y+r*.1,r*.75,r*.75,CREAM); E(x+r*.45,y,r*.7,r*.7,'#fff0c8'); E(x,y-r*.45,r*.7,r*.7,'#ffffff'); E(x+r*.2,y+r*.4,r*.35,r*.3,'#ffd060'); };
const popBowl=(x,y,a,full)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a);
  if(full) for(let j=0;j<9;j++) popcorn(-28+j*7,-18-Math.abs(Math.sin(j*1.7))*8-(j>2&&j<7?6:0),6);
  const pth=()=>{ gfx.beginPath(); gfx.moveTo(-36,-16); gfx.lineTo(36,-16); gfx.lineTo(24,18); gfx.lineTo(-24,18); gfx.closePath(); };
  pth(); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle='#ffffff'; gfx.fill();
  gfx.save(); pth(); gfx.clip(); for(let j=-3;j<=3;j+=2) { gfx.beginPath(); gfx.moveTo(j*11-5,-16); gfx.lineTo(j*11+5,-16); gfx.lineTo(j*7.5+3.5,18); gfx.lineTo(j*7.5-3.5,18); gfx.closePath(); gfx.fillStyle=RED; gfx.fill(); } gfx.restore();
  R(-37,-19,74,5,OUT); R(-36,-18,72,3,'#ffe08a'); gfx.restore(); };
// The slasher: a hooded silhouette with a pale mask, arms up.
const slasher=(x,y,k)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(k,k);
  E(0,40,46,60,'#06060c'); E(0,-14,26,30,'#06060c'); for(const sx of [-1,1]) { gfx.beginPath(); gfx.moveTo(sx*30,10); gfx.lineTo(sx*58,-40); gfx.lineTo(sx*48,-46); gfx.lineTo(sx*20,0); gfx.closePath(); gfx.fillStyle='#06060c'; gfx.fill(); E(sx*54,-46,8,8,'#06060c'); }
  E(0,-10,15,19,'#e8e4dc'); E(-6,-14,4,5,'#06060c'); E(6,-14,4,5,'#06060c'); E(0,-2,2,4,'#06060c'); for(let j=-2;j<=2;j++) E(j*4,6,1,1,'#7a766c'); gfx.restore(); };
B2_TOMBO_ANIM.tnb1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),N=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgt=list[0];
  const CX=cl((GR.x1+T.x)/2+14,GR.x1+84,T.x-30),F=296,tsx=CX-36,nsx=CX+40;
  const SX=16,SY=12,SW=cl(GR.x1+40,220,268)-16,SH=136;
  const P={walk:700,line:900,quiet:1700,scare:2250,jumpEnd:2750,over:2950,rain0:2950,hit:3080,rain1:3600,cap:3650,tline:3700,laugh:3200,kiss0:4300,kiss:4600,glow:4800,home:5300,end:6200};
  const sT={x:T.x,b:T.base,f:null},sN={x:N.x,b:N.base};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tsx,y=F+10,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tsx,k); y=lerp(c.origBase,F+10,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { if(ms>P.scare&&ms<P.jumpEnd) { const k=seg(ms,P.scare,P.jumpEnd); y-=Math.sin(k*Math.PI)*84; f=sp.celeb; x+=Math.sin(k*Math.PI)*-6; }
      else if(ms>P.jumpEnd&&ms<P.jumpEnd+120) y+=4;
      else if(ms>P.kiss0&&ms<P.home) f=sp.flip;
      else if(ms>P.line&&ms<P.scare) x-=ez(seg(ms,P.quiet,P.scare))*4; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tsx,c.origX,k); y=lerp(F+10,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f,noShadow:ms>P.walk&&ms<P.home}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nsx,y=F-8,f=sp.sit||sp.idle;
    if(ms<P.walk+100) { const k=ez(ms/(P.walk+100)); x=lerp(c.origX,nsx,k); y=lerp(c.origBase,F-8,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { if(ms>P.laugh&&ms<P.laugh+700) { y-=Math.abs(Math.sin(seg(ms,P.laugh,P.laugh+700)*Math.PI*4))*5; f=sp.celeb||f; }
      else if(ms>P.kiss0&&ms<P.home) { x-=ez(seg(ms,P.kiss0,P.kiss))*10*(1-ez(seg(ms,P.kiss+350,P.kiss+700))); f=sp.idle; } }
    else { const k=ez(seg(ms,P.home+60,P.home+700)); x=lerp(nsx,c.origX,k); y=lerp(F-8,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; return {cx:x,base:y,frame:f,noShadow:ms>P.walk&&ms<P.home}; });
  const dimK=ms=>ms<P.walk?ez(seg(ms,0,P.walk)):1-ez(seg(ms,P.home,P.home+600));
  // Behind everyone: the room goes dark, the screen glows, the couch back.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=dimK(ms); if(k<=0) return;
    const fl=ms>P.scare&&ms<P.scare+160?1:0;
    gfx.globalAlpha=k*(.62-fl*.4); R(0,0,576,324,'#0a0c1c'); gfx.globalAlpha=k;
    // the screen
    RO(SX-6,SY-6,SW+12,SH+12,'#1a1a22'); R(SX,SY,SW,SH,'#141c34');
    gfx.save(); gfx.beginPath(); gfx.rect(SX,SY,SW,SH); gfx.clip();
    const mx=SX+SW/2,my=SY+SH/2;
    if(ms<1100) { R(SX,SY,SW,SH,'#0c0c14'); gfx.globalAlpha=k*fin(seg(ms,250,600),.5)*(1-seg(ms,900,1100)); bigWord('MIDNIGHT',mx,my-16,'#e0402e',3); bigWord('HOUSE',mx,my+8,'#e0402e',3); gfx.globalAlpha=k; }
    else if(ms<P.scare) { const z=1+seg(ms,1100,P.scare)*.5,fk=.8+Math.sin(ms/37)*.1*(ms>P.quiet?1:0);
      R(SX,SY,SW,SH,'#16203a'); gfx.save(); gfx.translate(mx,my); gfx.scale(z,z);
      gfx.beginPath(); gfx.moveTo(-SW,SH/2); gfx.lineTo(-24,24); gfx.lineTo(24,24); gfx.lineTo(SW,SH/2); gfx.closePath(); gfx.fillStyle='#24304e'; gfx.fill();
      R(-22,-40,44,64,'#3a2a22'); const op=seg(ms,1400,P.scare)*16; gfx.globalAlpha=k*fk; R(-22,-40,op,64,'#ffe8a8'); gfx.globalAlpha=k; R(-22+op,-40,44-op,64,'#5a3a2a'); E(14,-6,2,2,'#c9a23a'); gfx.restore(); }
    else if(ms<P.scare+1100) { const q=seg(ms,P.scare,P.scare+180); R(SX,SY,SW,SH,fl?'#ffffff':'#7a0f1a'); slasher(mx,my+30,lerp(.5,1.7,ez(q))+Math.sin(ms/30)*.02); }
    else { R(SX,SY,SW,SH,'#0c0c14'); gfx.globalAlpha=k*fin(seg(ms,P.scare+1200,P.scare+1600),.5); bigWord('THE END?',mx,my-4,'#cfd8d6',3); gfx.globalAlpha=k; }
    gfx.restore();
    // the light from the screen
    gfx.globalAlpha=k*.10; gfx.beginPath(); gfx.moveTo(SX+SW,SY+20); gfx.lineTo(CX+110,F-80); gfx.lineTo(CX+110,F+10); gfx.lineTo(SX+SW,SY+SH); gfx.closePath(); gfx.fillStyle=fl?'#ffffff':'#9ab8ff'; gfx.fill(); gfx.globalAlpha=k;
    // couch back
    RO(CX-84,F-104,168,70,'#5a3c7a'); for(const ox of [-40,40]) { RO(CX+ox-38,F-98,76,58,'#6e4c94'); R(CX+ox-32,F-94,64,6,'#8a68b0'); }
    gfx.globalAlpha=1; }});
  // Kernels: each monster gets a shower from the upturned bowl.
  const rnd=(i,j)=>{ const v=Math.sin(i*127.1+j*311.7)*43758.5453; return v-Math.floor(v); };
  const bowlAt={x:cl(GR.x,90,260),y:cl(GR.top-74,36,120)};
  const kern=[]; list.forEach((f,i)=>{ const q=ST.foe(f); for(let j=0;j<14;j++) kern.push({d:P.rain0+rnd(i,j)*600,x0:bowlAt.x+(rnd(j,i)-.5)*48,y0:bowlAt.y+6,x1:q.x+(rnd(i+5,j)-.5)*q.w*1.1,y1:q.base-rnd(i,j+9)*q.h*.7,rest:q.base-2-rnd(i+2,j)*6,r:5+rnd(j,i+3)*2.2}); });
  for(let j=0;j<10;j++) kern.push({d:P.rain0+rnd(99,j)*700,x0:bowlAt.x+(rnd(j,99)-.5)*48,y0:bowlAt.y+6,x1:GR.x0-20+rnd(j,7)*(GR.w+40),y1:GR.base+4-rnd(7,j)*40,rest:GR.base+6-rnd(7,j)*30,r:5});
  // In front: the couch seat (over their legs), the bowl, the popcorn, the kiss.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=dimK(ms);
    if(k>0) { gfx.globalAlpha=k; RO(CX-80,F-30,160,30,'#6e4c94'); R(CX-76,F-28,152,6,'#8a68b0'); R(CX-1,F-30,2,30,'#4a3066');
      for(const sx of [-1,1]) { RO(CX+sx*84-12,F-54,24,54,'#5a3c7a'); R(CX+sx*84-10,F-52,20,6,'#8a68b0'); RO(CX+sx*76-4,F,8,8,'#3a2a22'); } gfx.globalAlpha=1; }
    // the bowl: in Tom's lap, then thrown and flipped over the monsters, then dropped on the first one like a hat
    if(ms>P.walk-150&&ms<P.scare) popBowl(sT.x-6,sT.b-44,0,true);
    else if(ms>=P.scare&&ms<P.over) { const q=seg(ms,P.scare,P.over),x=lerp(sT.x-6,bowlAt.x,ez(q)),y=lerp(sT.b-44,bowlAt.y,q)-Math.sin(q*Math.PI)*70; popBowl(x,y,-q*Math.PI,q<.4); }
    else if(ms>=P.over&&ms<P.cap) popBowl(bowlAt.x+Math.sin(ms/30)*3,bowlAt.y,Math.PI,false);
    else if(ms>=P.cap&&ms<P.end-150&&tgt) { const q=ST.foe(tgt),a=seg(ms,P.cap,P.cap+300),hy=q.top+(tgt.def._top||0)*tgt.sc+4;
      gfx.globalAlpha=ms>P.end-500?(P.end-150-ms)/350:1; popBowl(lerp(bowlAt.x,q.x,ez(a)),lerp(bowlAt.y,hy-10,a*a),Math.PI,false); gfx.globalAlpha=1; }
    for(const c of kern) { if(ms<c.d) continue; const q=seg(ms,c.d,c.d+420),x=lerp(c.x0,c.x1,q),y=q<1?lerp(c.y0,c.y1,q*q):Math.min(c.rest,c.y1+(ms-c.d-420)*.25);
      gfx.globalAlpha=ms>P.end-600?Math.max(0,(P.end-150-ms)/450):1; popcorn(x,y,c.r); gfx.globalAlpha=1; }
    if(ms>P.kiss&&ms<P.kiss+1100) { const q=seg(ms,P.kiss,P.kiss+1100),hx=(sT.x+sN.x)/2+4,hy=Math.min(sT.b-112,sN.b-112)-q*30;
      gfx.globalAlpha=fade(q,.7); heart(hx,hy,lerp(8,20,ez(q*3)),PINK); gfx.globalAlpha=1; }
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Movie night. One couch, one giant bowl of popcorn.'); B2.aim=null; S('click'); }],
    [P.line,()=>{ say('tnb','tombo'); setMessage('TNB loves the scary part.'); }],
    [P.quiet,()=>{ setMessage('The music goes very quiet...'); S('heartbeat'); }],
    [P.scare,()=>{ S('scream'); S('crash'); word('AAAAH!',CX-40,F-170,'#ffffff',5,.9,-.1); setMessage('AAAAH! Tom jumps. The popcorn goes EVERYWHERE.'); }],
    [P.over,()=>{ S('whoosh'); }],
    [P.hit,()=>{ S('crunch'); S('bonk'); battle.shakeEnemy=.7; for(const f of list) ST.jolt(f,.5); word('POPCORN!',bowlAt.x,bowlAt.y-30,GOLD,5,1.2); landHit(100); }],
    ['hf',P.hit],
    [P.laugh,()=>{ word('HA HA HA',sN.x,sN.b-150,CREAM,3,.9); }],
    [P.cap,()=>{ S('clang'); }],
    [P.tline,()=>{ say('tom','tombotnb'); setMessage('Tom says he wasn\'t scared. The popcorn was.'); }],
    [P.kiss0,()=>{ setMessage('TNB laughs and kisses him. Very brave.'); }],
    [P.kiss,()=>{ S('kiss'); }],
    [P.glow,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [P.end,'end',(E2.result||'')+' Popcorn everywhere. The whole party is glowing.']]);
};
// ---------- Sit. Paw. Treat. (Tom + Nara, tier 1) ----------
// Tom holds up a treat. "Sit." Nara sits, wiggling all over. "Paw." She gives him her paw, then gives it so hard a
// GIANT paw slams down on the enemy. She gets the treat, and Tom gets a lick. Effect: a sure critical Kinetic hit,
// Tracked Scent for 3 turns, and Tom and Nara each heal 20%. Nara stands beside Tom (her black fur reads badly in
// front of his dark shirt), facing him.
const treat=(x,y,s,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a||0); gfx.scale(s,s);
  for(const [c,g] of [[OUT,2],['#d9a35a',0]]) { E(-11,-4,5+g,5+g,c); E(-11,4,5+g,5+g,c); E(11,-4,5+g,5+g,c); E(11,4,5+g,5+g,c); R(-11-g,-4-g,22+g*2,8+g*2,c); }
  R(-11,-4,22,3,'#f0c47e'); E(-12,-5,2,1.5,'#f6dcac'); E(10,-5,2,1.5,'#f6dcac'); gfx.restore(); };
// The giant paw, pads toward us, coming down out of the sky on a long furry leg. (x,y) = bottom of the palm.
const FUR='#2c2a33',FUR2='#4a4656',RIM='#7a768a',PAD='#f4a0b4',PAD2='#ffc8d4';
const bigPaw=(x,y,w)=>{ const r=w/2,ry=w*.36,top=-40;
  R(x-r*.62-3,top,r*1.24+6,y-ry*.4-top,'#6a6676'); R(x-r*.62,top,r*1.24,y-ry*.4-top,FUR); R(x-r*.62,top,r*.22,y-ry*.4-top,FUR2);
  for(let j=0;j<5;j++) Ln(x-r*.4+j*r*.2,y-ry*1.4-j*9,x-r*.34+j*r*.2,y-ry*1.4-j*9-14,2,FUR2);
  const toes=[[-.62,-.55],[-.22,-.82],[.22,-.82],[.62,-.55]];
  for(const [tx,ty] of toes) { E(x+tx*r,y+ty*ry,r*.3+3,r*.27+3,RIM); E(x+tx*r,y+ty*ry,r*.3,r*.27,FUR); }
  E(x,y,r+3,ry+3,RIM); E(x,y,r,ry,FUR); E(x-r*.3,y-ry*.35,r*.35,ry*.25,FUR2);
  E(x,y+ry*.12,r*.5,ry*.5,PAD); E(x-r*.14,y-ry*.08,r*.18,ry*.16,PAD2);
  for(const [tx,ty] of toes) { E(x+tx*r,y+ty*ry+2,r*.17,r*.15,PAD); E(x+tx*r-2,y+ty*ry,r*.06,r*.05,PAD2); } };
const pawPrint=(x,y,s,c)=>{ E(x,y+2*s,4*s,3.4*s,c); for(const [dx,dy] of [[-4.4,-2.6],[-1.6,-5],[1.6,-5],[4.4,-2.6]]) E(x+dx*s,y+dy*s,1.6*s,1.8*s,c); };
B2_TOMBO_ANIM.nara1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),N=ST.unit(pt),list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt);
  const nx=Math.max(F.x+F.w/2+N.w/2+8,T.x-86),nb=Math.min(318,T.base+24);
  const P={walk:650,hold:500,sit:1150,wig0:1250,paw:2250,shadow:2350,slam:2700,lift:3300,gone:3800,apply:3450,toss:4000,catch:4350,lick0:4600,lick:4800,lick1:5150,home:5250,end:6000};
  const nsp=BATTLE_SPRITES.nara,tsp=BATTLE_SPRITES.tom,sitR=nsp.sit?mirrorRowsCached(nsp,'sit'):nsp.flip;
  const sT={x:T.x,b:T.base,f:tsp.idle},sN={x:N.x,b:N.base,f:nsp.idle};
  // Tom: steps a little in, holds the treat up high (celeb), lowers it, takes the lick, steps home.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=c.origX-6,y=c.origBase,f=sp.idle;
    if(ms<P.walk) x=lerp(c.origX,c.origX-6,ez(ms/P.walk));
    if(ms>P.hold&&ms<P.toss) f=sp.celeb;
    if(ms>P.lick&&ms<P.lick1) { x+=Math.sin(seg(ms,P.lick,P.lick1)*Math.PI)*5; f=sp.celeb; }
    else if(ms>P.home) { const k=ez(seg(ms,P.home,P.home+500)); x=lerp(c.origX-6,c.origX,k); }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  // Nara: trots to her spot facing Tom, sits and wiggles, paw up, waits, catches the treat, hops up for the lick, home.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nx,y=nb,f=sp.flip,rot=0;
    if(ms<P.walk+150) { const k=ez(ms/(P.walk+150)); x=lerp(c.origX,nx,k); y=lerp(c.origBase,nb,k)-Math.abs(Math.sin(c.t*16))*4; f=runFr(sp,c.t,-1); }
    else if(ms<P.sit) f=sp.flip;
    else if(ms<P.paw) { f=sitR; if(ms>P.wig0) { const w=Math.sin(ms/45); x+=w*2.5; rot=w*.05; } }
    else if(ms<P.lift) { f=sp.celebFlip||sp.flip; if(ms>P.slam&&ms<P.slam+200) y-=Math.sin(seg(ms,P.slam,P.slam+200)*Math.PI)*6; }
    else if(ms<P.catch) f=sitR;
    else if(ms<P.lick0) { f=sp.celebFlip||sp.flip; y-=Math.sin(seg(ms,P.catch,P.catch+220)*Math.PI)*14; }
    else if(ms<P.lick1) { const k=Math.sin(seg(ms,P.lick0,P.lick1)*Math.PI); x=lerp(nx,sT.x-42,k); y=nb-k*46; f=sp.celebFlip||sp.flip; rot=-k*.15; }
    else if(ms<P.home) f=sp.flip;
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(nx,c.origX,k); y=lerp(nb,c.origBase,k)-(k<1?Math.abs(Math.sin(c.t*16))*4:0); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.lick0&&ms<P.lick1}; });
  // Where the treat is: up in Tom's hand, then tossed to Nara's mouth.
  const tomHand=()=>{ const up=sT.f===tsp.celeb; return up?{x:sT.x-20,y:sT.b-tsp.idle.length*tsp.scale-14}:handPt(tsp,sT.f,sT.x,sT.b,-1); };
  const mouth=()=>{ const h=handPt(nsp,sN.f,sN.x,sN.b,1); return {x:h.x,y:h.y-2}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the treat
    if(ms>P.hold-150&&ms<P.toss) { const h=tomHand(),pop=fin(seg(ms,P.hold-150,P.hold+100),1); treat(h.x,h.y-6,1.9*pop,-.3);
      if(ms<P.paw) for(let j=0;j<3;j++) { const q=(ms/600+j/3)%1; gfx.globalAlpha=1-q; star(h.x+Math.cos(j*2.1)*20,h.y-8-q*18,3,'#fffbe6'); gfx.globalAlpha=1; } }
    else if(ms>=P.toss&&ms<P.catch) { const a=tomHand(),m=mouth(),q=seg(ms,P.toss,P.catch); treat(lerp(a.x,m.x,q),lerp(a.y,m.y,q)-Math.sin(q*Math.PI)*50,1.9,-.3+q*6); }
    else if(ms>=P.catch&&ms<P.lick0) { const m=mouth(); treat(m.x-4,m.y,1.6,0); }
    // wiggle lines while she sits
    if(ms>P.wig0&&ms<P.paw) { gfx.globalAlpha=.9; for(const sx of [-1,1]) for(let j=0;j<2;j++) { const ox=sN.x+sx*(N.w*.5+6+j*7),oy=sN.b-30+Math.sin(ms/60+j)*3; Ln(ox,oy-8,ox+sx*3,oy,2.5,CREAM); Ln(ox+sx*3,oy,ox,oy+8,2.5,CREAM); } gfx.globalAlpha=1; }
    // the shadow, then the paw
    const pw=Math.max(160,F.w*2.2),py=F.base-F.h*.32;
    if(ms>P.shadow&&ms<P.gone) { const k=ms<P.slam?ez(seg(ms,P.shadow,P.slam)):1-ez(seg(ms,P.lift,P.gone)); gfx.globalAlpha=.4*k; E(F.x,F.base+2,pw*.55*k,12*k,'#000000'); gfx.globalAlpha=1; }
    if(ms>P.shadow&&ms<P.gone) { const y=ms<P.slam?lerp(-120,py,Math.pow(seg(ms,P.shadow,P.slam),2.2)):(ms<P.lift?py+Math.sin(seg(ms,P.slam,P.slam+160)*Math.PI)*6:lerp(py,-160,ez(seg(ms,P.lift,P.gone)))); bigPaw(F.x,y,pw); }
    // squashed under it, then marked with her scent: little green paw prints
    if(ms>P.slam&&ms<P.lift+120) { tgt.spin=0; tgt.ox=0; tgt.fsc=.8; tgt.oy=F.h/2*.2; tgt.spinAt=performance.now(); }
    else if(tgt.fsc) { tgt.fsc=0; tgt.oy=0; }
    if(ms>P.apply&&ms<P.end-100) { const k=fin(seg(ms,P.apply,P.apply+300),1)*fade(seg(ms,P.apply,P.end-100),.75); gfx.globalAlpha=k;
      for(let j=0;j<4;j++) pawPrint(F.x-F.w*.3+j*F.w*.2,F.top+F.h*.35+(j%2)*10,1.3,'#7ac36a'); gfx.globalAlpha=1; }
    if(ms>P.lick&&ms<P.lick+1000) { const q=seg(ms,P.lick,P.lick+1000); gfx.globalAlpha=fade(q,.7); heart(sT.x-24,sT.b-tsp.idle.length*tsp.scale-10-q*28,lerp(7,16,ez(q*3)),PINK); gfx.globalAlpha=1; }
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Tom holds up a treat. Nara knows this one.'); B2.aim=null; S('click'); }],
    [P.hold,()=>{ S('ting'); say('tom','tombofetch'); }],
    [P.sit,()=>{ word('SIT.',T.x+60,T.top-20,CREAM,4,.9); S('bump'); setMessage('Sit. Nara sits. She\'s wiggling all over.'); }],
    [P.wig0+200,()=>{ word('WIGGLE!',nx,nb-104,GOLD,3,1); }],
    [P.paw,()=>{ word('PAW.',T.x+60,T.top-20,CREAM,4,.9); S('boing'); setMessage('Paw. She gives him her paw. VERY hard.'); }],
    [P.shadow,()=>{ S('slideWhistle'); }],
    [P.slam,()=>{ S('thud'); S('bonk'); battle.shakeEnemy=.8; ST.jolt(tgt,.7); battle.flashEnemy=.25; scene('tb_rings',.8,{x:F.x,y:F.base,r:90,c:CREAM,w:4});
      scene('dust',.7,{x:F.x,y:F.base+2,n:10,sp:40,up:14}); word('PAW!!',F.x,Math.max(60,F.top-112),PINK,6,1.2); landHit(100); }],
    ['hf',P.slam],
    [P.slam+250,()=>{ say('nara','tombo'); S('bark'); }],
    [P.apply,()=>{ E2.apply(); glowOn(tom); glowOn(pt); S('heal'); setMessage('Nara has marked it with her scent.'); }],
    [P.toss,()=>{ S('whoosh'); word('TREAT!',nx,nb-110,GOLD,3,.9); }],
    [P.catch,()=>{ S('crunch'); }],
    [P.lick0,()=>{ setMessage('She gets the treat. Tom gets a lick.'); }],
    [P.lick,()=>{ S('kiss'); word('LICK!',T.x-30,T.top-40,PINK,3,.8); }],
    [P.end,'end',()=>{ if(tgt.fsc) { tgt.fsc=0; tgt.oy=0; } return (E2.result||'')+' Good girl. Very gentle paw.'; }]]);
};

// ---------- You Hold the Net (Tom + Boppy, tier 1) ----------
// Boppy fishes from his spot; Tom holds the net out over the water and cannot keep it still. Something bites. Something
// BIG. They scoop every monster out of the water in one huge net, flopping, and dump the lot on the pier. Effects
// unchanged: Splash hit on every enemy, the back row lands in front, Grumbled for 3 turns.
const ROD='#6a4a2a',WATER='#3f7fb0',WATER2='#5e9ccc',FOAM='#d8eef8',PLANK='#b98a56',PLANK2='#8f6538';
B2_TOMBO_ANIM.boppy1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),Bp=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const PL=cl(GR.x1+14,150,300),tomX=Math.min(T.x,PL+90),tomB=Math.min(300,T.base+12),wTop=cl(GR.top+GR.list.reduce((m,q)=>Math.min(m,q.h),99)*.3,120,230);
  const P={walk:650,water:500,cast:900,plop:1250,line:1300,wob:1500,bite:2200,reel:2450,tline:2700,dive:2950,scoop:3300,up:3900,swing:4150,dump:4550,thud:4700,apply:4850,grum:5200,home:5450,back:5600,end:6400};
  const bsp=BATTLE_SPRITES[pt.id],tsp=BATTLE_SPRITES.tom,TH=tsp.idle.length*tsp.scale;
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:Bp.x,b:Bp.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tomX,y=tomB,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tomX,k); y=lerp(c.origBase,tomB,k); f=k<1?runFr(sp,c.t,-1):sp.idle; }
    else if(ms<P.home) { if(ms>P.wob&&ms<P.bite) x+=Math.sin(ms/50)*1.5;
      if(ms>P.scoop&&ms<P.dump) { f=sp.celeb; x+=Math.sin(ms/35)*2; } }
    else { const k=ez(seg(ms,P.home,P.home+600)); x=lerp(tomX,c.origX,k); y=lerp(tomB,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let f=sp.idle;
    if(ms>P.cast-150&&ms<P.plop) f=sp.throw||sp.act||sp.idle;
    else if(ms>P.reel&&ms<P.up) f=sp.wind||sp.idle;
    else if(ms>P.up&&ms<P.dump) f=sp.celeb||sp.idle;
    sB.x=c.origX; sB.b=c.origBase; sB.f=f; return {cx:c.origX,base:c.origBase,frame:f}; });
  const waterK=ms=>ms<P.back?ez(seg(ms,0,P.water)):1-ez(seg(ms,P.back,P.end-150));
  // Behind everyone: the pond under the monsters and the pier under the party.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=waterK(ms); if(k<=0) return; gfx.globalAlpha=k;
    gfx.fillStyle=WATER; gfx.beginPath(); gfx.moveTo(0,wTop); for(let x=0;x<=PL;x+=12) gfx.lineTo(x,wTop+Math.sin(x/20+ms/300)*3); gfx.lineTo(PL,324); gfx.lineTo(0,324); gfx.closePath(); gfx.fill();
    for(let j=0;j<7;j++) { const yy=wTop+18+j*16,xx=((j*53+ms/22)%(PL+40))-20; Ln(xx,yy,xx+26,yy,2,WATER2); }
    Ln(0,wTop+1,PL,wTop+1,2,FOAM);
    const pt0=Math.max(wTop+14,T.top+TH*.84);
    R(PL-2,pt0,580-PL,330-pt0,OUT); R(PL,pt0+2,580-PL,330-pt0,PLANK);
    for(let yy=pt0+16;yy<324;yy+=16) R(PL,yy,580-PL,2,PLANK2);
    for(let xx=PL+40;xx<576;xx+=70) R(xx,pt0+2,2,330-pt0,'#a0764a');
    for(const yy of [pt0+30,pt0+86]) { RO(PL-12,yy,12,330-yy,'#6a4a2a'); }
    gfx.globalAlpha=1; }});
  // The catch: each monster's spot in the net, and where it lands on the pier (a little pile).
  const S0=list.map(f=>({f,q:ST.foe(f)})),liftH=Math.min(130,Math.max(80,GR.top-30));
  const pileX=PL+24,pileB=tomB+6;
  S0.forEach((o,k)=>{ const s=.9,dx=pileX+(k===1?-18:k===2?16:0)+(k>2?(k-2)*8:0),db=pileB-(k===1?14:k===2?26:0)-(k>2?k*6:0);
    o.dox=dx-o.q.x; o.doy=(db-o.q.h*s/2)-(o.q.base-o.q.h/2); o.s=s; });
  const hoopRest=()=>({x:sT.x-128,y:sT.b-TH*.82,rx:26,ry:9});
  // Where every monster is, ms by ms (ox, oy, scale, spin), and where the net is.
  const catchAt=(o,ms)=>{ const flop=(ph,a)=>Math.sin(ms/70+ph)*a;
    if(ms<P.scoop) return null;
    if(ms<P.up) { const k=ez(seg(ms,P.scoop,P.up)); return {ox:0,oy:-liftH*k,s:1,spin:flop(o.q.x,.25*k)}; }
    if(ms<P.swing) return {ox:0,oy:-liftH,s:1,spin:flop(o.q.x,.3)};
    if(ms<P.dump) { const k=ez(seg(ms,P.swing,P.dump)); return {ox:o.dox*k*.6,oy:-liftH+(o.doy+liftH)*0-k*20,s:lerp(1,o.s,k),spin:flop(o.q.x,.3)}; }
    if(ms<P.thud) { const k=seg(ms,P.dump,P.thud); return {ox:lerp(o.dox*.6,o.dox,k),oy:lerp(-liftH-20,o.doy,k*k),s:o.s,spin:k*1.2}; }
    if(ms<P.back) { const k=seg(ms,P.thud,P.back); return {ox:o.dox,oy:o.doy-Math.abs(Math.sin(k*Math.PI*5))*8*(1-k),s:o.s,spin:Math.PI*.5+flop(o.q.x,.12)}; }
    const k=ez(seg(ms,P.back,P.end-150)); return {ox:lerp(o.dox,0,k),oy:lerp(o.doy,0,k),s:lerp(o.s,1,k),spin:lerp(Math.PI*.5,0,k)}; };
  const netAt=ms=>{ const r=hoopRest();
    if(ms<P.walk) return null;
    if(ms<P.dive) { const w=ms>P.wob?Math.sin(ms/60)*(ms<P.bite?8:4)+Math.sin(ms/23)*3:0; return {x:r.x+w,y:r.y+w*.4,rx:r.rx,ry:r.ry,bag:0}; }
    const big={x:GR.x,rx:GR.w/2+34,ry:16};
    if(ms<P.scoop) { const k=ez(seg(ms,P.dive,P.scoop)); return {x:lerp(r.x,big.x,k),y:lerp(r.y,GR.base+8,k),rx:lerp(r.rx,big.rx,k),ry:lerp(r.ry,big.ry,k),bag:0}; }
    const topY=GR.top-liftH-18;
    if(ms<P.up) { const k=ez(seg(ms,P.scoop,P.up)); return {x:big.x,y:lerp(GR.top-12,topY,k),rx:big.rx,ry:big.ry,bag:1}; }
    if(ms<P.dump) { const k=ez(seg(ms,P.swing,P.dump)); const dx=S0.reduce((a,o)=>a+o.dox,0)/Math.max(1,S0.length)*.6*k; return {x:big.x+dx,y:topY-k*20,rx:big.rx,ry:big.ry,bag:1}; }
    if(ms<P.home) { const k=ez(seg(ms,P.dump,P.home)); const dx=S0.reduce((a,o)=>a+o.dox,0)/Math.max(1,S0.length)*.6; return {x:lerp(big.x+dx,r.x,k),y:lerp(topY-20,r.y,k),rx:lerp(big.rx,r.rx,k),ry:lerp(big.ry,r.ry,k),bag:0,tilt:1-k}; }
    return null; };
  const bob={x:GR.x+Math.min(30,GR.w*.2),y:cl(GR.base-26,wTop+24,300)};
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=waterK(ms);
    // wading ripples at every monster's feet while they are in the water
    if(k>0&&ms<P.scoop+150) { gfx.globalAlpha=k*.9; for(const o of S0) { const r=o.q.w*.42+Math.sin(ms/200+o.q.x)*2; ring(o.q.x,o.q.base-3,r,6,3,FOAM); ring(o.q.x,o.q.base-3,r*.7,4,2,WATER2); } gfx.globalAlpha=1; }
    // the monsters, in the net and then on the pier
    for(const o of S0) { const c=catchAt(o,ms); if(!c) continue; const cur=ST.foe(o.f),kb=1-ez(seg(ms,P.back,P.end-150));   // the back row moves to the front on apply
      o.f.ox=c.ox+(o.q.x-cur.x)*kb; o.f.oy=c.oy+(o.q.base-cur.base)*kb; o.f.fsc=c.s===1?0:c.s; o.f.spin=c.spin; o.f.spinAt=performance.now(); }
    // drips under the lifted catch
    if(ms>P.scoop&&ms<P.thud) for(let j=0;j<10;j++) { const q=(ms/500+j/10)%1,o=S0[j%S0.length],c=catchAt(o,ms); if(!c) continue;
      gfx.globalAlpha=1-q; E(o.q.x+c.ox+Math.sin(j*3.1)*o.q.w*.35,o.q.base+c.oy+4+q*50,2,3.4,FOAM); gfx.globalAlpha=1; }
    // the rod, the line and the bobber
    if(ms>P.walk-100&&ms<P.home+300) { const h=handPt(bsp,sB.f,sB.x,sB.b,-1),bend=ms>P.bite&&ms<P.up?.5:0,ang=ms<P.cast?2.1:(ms<P.plop?lerp(2.1,.55,ez(seg(ms,P.cast,P.plop))):.55+bend*.6);
      const L=128,tx=h.x-Math.cos(ang*.6)*L*.85,ty=h.y-Math.sin(ang)*L*.75-10;
      gfx.globalAlpha=fade(seg(ms,P.walk-100,P.home+300),.9);
      gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(h.x,h.y); gfx.quadraticCurveTo((h.x+tx)/2+bend*14,(h.y+ty)/2-bend*24,tx,ty); gfx.stroke();
      gfx.strokeStyle=ROD; gfx.lineWidth=3; gfx.stroke(); EO(h.x+4,h.y-4,4,4,'#9aa0a8');
      if(ms>P.cast&&ms<P.scoop+100) { const q=seg(ms,P.cast,P.plop),bx=lerp(tx,bob.x,q),by=ms<P.plop?lerp(ty,bob.y,q)-Math.sin(q*Math.PI)*80:bob.y+(ms>P.bite?Math.sin(ms/40)*5+6:Math.sin(ms/300)*1.5);
        gfx.strokeStyle='#eef4f6'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(tx,ty); gfx.quadraticCurveTo((tx+bx)/2,Math.max(ty,by)+(ms>P.bite?0:30),bx,by); gfx.stroke();
        EO(bx,by-4,5,5,RED); E(bx,by-6,5,2.4,'#ffffff'); }
      gfx.globalAlpha=1; }
    // the net: pole from Tom's hands, the hoop, and the bag full of monsters
    const n=netAt(ms); if(n) { const h=sT.f===tsp.celeb?{x:sT.x-18,y:sT.b-TH-6}:handPt(tsp,sT.f,sT.x,sT.b,-1);
      Ln(h.x,h.y,n.x+n.rx,n.y,7,OUT); Ln(h.x,h.y,n.x+n.rx,n.y,4,'#c9a23a');
      if(n.bag) { let bot=n.y+40; for(const o of S0) { const c=catchAt(o,ms); if(c) bot=Math.max(bot,o.q.base+c.oy+12); }
        gfx.save(); gfx.beginPath(); gfx.moveTo(n.x-n.rx,n.y); gfx.quadraticCurveTo(n.x-n.rx-10,bot,n.x,bot+10); gfx.quadraticCurveTo(n.x+n.rx+10,bot,n.x+n.rx,n.y); gfx.closePath();
        gfx.lineWidth=3; gfx.strokeStyle='#e8e0c8'; gfx.stroke(); gfx.clip(); gfx.globalAlpha=.7;
        for(let x=n.x-n.rx-20;x<n.x+n.rx+20;x+=13) { Ln(x,n.y,x+40,bot+12,1.5,'#f4ecd4'); Ln(x+40,n.y,x,bot+12,1.5,'#f4ecd4'); }
        gfx.globalAlpha=1; gfx.restore(); }
      ring(n.x,n.y,n.rx+1,n.ry+1,6,OUT); ring(n.x,n.y,n.rx,n.ry,3.5,'#9aa0a8');
      if(!n.bag&&ms<P.dive) { gfx.save(); gfx.beginPath(); gfx.ellipse(n.x,n.y,n.rx,n.ry,0,0,Math.PI); gfx.lineTo(n.x+n.rx*.4,n.y+30); gfx.lineTo(n.x-n.rx*.4,n.y+30); gfx.closePath(); gfx.globalAlpha=.65; gfx.strokeStyle='#f4ecd4'; gfx.lineWidth=1.5; gfx.stroke(); gfx.restore(); gfx.globalAlpha=1; } }
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Boppy is fishing. Tom has one job: hold the net.'); B2.aim=null; S('click'); }],
    [P.cast,()=>{ S('whoosh'); word('CAST!',GR.x+40,GR.top-40,CREAM,3,.7); }],
    [P.plop,()=>{ S('splash'); scene('tb_rings',.7,{x:bob.x,y:bob.y,r:26,c:FOAM,w:2}); }],
    [P.line,()=>{ say('boppy','tombo'); setMessage('Boppy wants the net held STILL. It\'s not still.'); }],
    [P.bite,()=>{ S('ding'); word('!',bob.x,bob.y-50,GOLD,7,.8); for(const o of S0) ST.jolt(o.f,.4); setMessage('Something bites. Something BIG.'); }],
    [P.reel,()=>{ S('charge'); word('REEL!',Bp.x-60,Bp.top-20,'#9fe8ff',3,.8); }],
    [P.tline,()=>{ say('tom','tombopier'); }],
    [P.dive,()=>{ S('whoosh'); }],
    [P.scoop,()=>{ S('splash'); S('splat'); scene('splashw',.9,{x:GR.x,y:GR.base,n:16,sp:120}); word('SCOOP!',GR.x,GR.top-50,'#9fe8ff',5,1); setMessage('They scoop up EVERY monster in one net.'); }],
    [P.up,()=>{ S('fanfare'); word('BIG CATCH!',GR.x+20,Math.max(70,GR.top-liftH-60),GOLD,4,1.2); }],
    [P.dump,()=>{ S('whoosh'); setMessage('And dump the lot on the pier.'); }],
    [P.thud,()=>{ S('thud'); S('bonk'); battle.shakeEnemy=.8; scene('dust',.7,{x:pileX,y:pileB,n:10,sp:40,up:12}); scene('tb_rings',.7,{x:pileX,y:pileB,r:70,c:CREAM,w:3}); word('FLOP!',pileX,pileB-110,CREAM,5,1); landHit(100); }],
    ['hf',P.thud],
    [P.apply,()=>{ E2.apply(); }],
    [P.grum,()=>{ fxP.grumble=1.6; S('sulk'); word('HMPH.',Bp.x-30,Bp.top-24,CREAM,3,.9); }],
    [P.end,'end',()=>{ for(const o of S0) { o.f.fsc=0; o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Boppy says it was bigger in the water.'; }]]);
};

// ---------- I Called It! (Tom + Amy, tier 1) ----------
// Brother and sister both lunge for the same monster and bicker like kids. They shove each other back and forth, and
// every shove sends the other one stumbling into a monster (one bump per live monster). Amy declares herself the
// winner. Effects unchanged: Kinetic and Sparkle hit on every enemy, PEP Up for the party (3 turns).
B2_TOMBO_ANIM.amy1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),A=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const by=Math.min(312,Math.max(T.base,GR.base)+8),Lx=cl(GR.x1+48,150,400),Rx=Lx+88;
  const B0=1300,BP=700,E0=B0+n*BP,P={run:650,mine:700,mine2:950,jos:1050,win:E0+100,apply:E0+450,tline:E0+1800,home:E0+2400,end:E0+3100};
  const share=Array.from({length:n},(_,k)=>Math.floor(100/n)+(k<100%n?1:0));
  // where the shoved one lands against monster k
  const hitAt=k=>{ const f=tgts[k]; if(!f) return {x:Lx-60,y:by}; const q=ST.foe(f); return {x:q.x+q.w*.32+18,y:Math.min(by,q.base+6)}; };
  const amyEnd=n%2?'L':'R';
  const sT={x:T.x,b:T.base,f:tsp.idle},sA={x:A.x,b:A.base,f:asp.idle};
  // One body's pose at ms. who: 'tom' or 'amy'. Slots: L (left, shoved) and R (right, shoving).
  const body=(who,ms,c)=>{ const sp=c.sp,isA=who==='amy',start=isA?Rx:Lx; let x=start,y=by,f=sp.idle,rot=0;
    if(ms<P.run) { const k=ez(ms/P.run); return {x:lerp(c.origX,start,k),y:lerp(c.origBase,by,k),f:runFr(sp,c.t,-1),rot:0}; }
    if(ms<B0) { f=isA?(ms<P.jos?sp.aim:sp.hip):(ms<P.jos?sp.act:sp.idle);
      if(ms>P.jos) { const w=Math.abs(Math.sin((ms-P.jos)/45)); x+=isA?-w*7:w*7; }
      return {x,y,f,rot}; }
    if(ms<E0) { const k=Math.floor((ms-B0)/BP),q=ms-B0-k*BP,shover=(k%2===0)===isA;
      if(shover) { // on the right: wind up, shove, follow through into the left slot
        if(q<150) { x=Rx+ez(q/150)*5; f=isA?sp.wind:sp.idle; }
        else if(q<420) { x=lerp(Rx+5,Lx,ez(seg(q,150,420))); f=sp.act; }
        else { x=Lx; f=isA?sp.hip:sp.idle; }
      } else { const h=hitAt(k); // on the left: shoved into monster k, bounce, hop back to the right slot
        if(q<150) { x=Lx; f=isA?sp.idle:sp.idle; }
        else if(q<360) { const u=seg(q,150,360); x=lerp(Lx,h.x,ez(u)); y=lerp(by,h.y,u)-Math.sin(u*Math.PI)*18; f=isA?sp.spread:sp.expr; rot=.3*u; }
        else if(q<440) { x=h.x+Math.sin(seg(q,360,440)*Math.PI)*6; y=h.y; f=isA?sp.spread:sp.expr; rot=.3; }
        else if(q<680) { const u=ez(seg(q,440,680)); x=lerp(h.x,Rx,u); y=lerp(h.y,by,u)-Math.sin(u*Math.PI)*26; f=runFr(sp,c.t,1); rot=.3*(1-u); }
        else { x=Rx; f=sp.idle; } }
      return {x,y,f,rot}; }
    const slot=(isA?amyEnd:(amyEnd==='L'?'R':'L'))==='L'?Lx:Rx;
    if(ms<P.home) { x=slot;
      if(isA) { f=ms>P.win?sp.celeb:sp.idle; if(ms>P.win&&ms<P.win+700) y-=Math.abs(Math.sin(seg(ms,P.win,P.win+700)*Math.PI*2))*16; }
      else f=slot===Lx?(ms>P.tline&&ms<P.tline+900?mirrorRowsCached(sp,'act'):sp.flip):sp.idle;   // faces Amy, deadpan
      return {x,y,f,rot}; }
    const k=ez(seg(ms,P.home,P.home+600)); return {x:lerp(slot,c.origX,k),y:lerp(by,c.origBase,k),f:k<1?runFr(sp,c.t,1):sp.idle,rot:0}; };
  pathOf(fxT,P.end,(ms,c)=>{ const o=body('tom',ms,c); sT.x=o.x; sT.b=o.y; sT.f=o.f; return {cx:o.x,base:o.y,frame:o.f,rot:o.rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const o=body('amy',ms,c); sA.x=o.x; sA.b=o.y; sA.f=o.f; return {cx:o.x,base:o.y,frame:o.f,rot:o.rot}; });
  // Anger veins over both heads while they bicker, and the dibs finger on the first monster.
  const vein=(x,y,s)=>{ for(const [dx,dy,r] of [[-1,-1,0],[1,-1,1.57],[1,1,3.14],[-1,1,4.71]]) { gfx.save(); gfx.translate(x+dx*s*1.6,y+dy*s*1.6); gfx.rotate(r);
    gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(-s,-s,s,0,Math.PI/2); gfx.stroke(); gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.stroke(); gfx.restore(); } };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.jos&&ms<E0+200) { const pulse=1+Math.sin(ms/70)*.15;
      vein(sT.x+14,sT.b-TH-6,4*pulse); vein(sA.x+12,sA.b-AH+10,4*pulse); }
  }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom and Amy both lunge for the same monster.'); B2.aim=null; S('whoosh'); }],
    [P.mine,()=>{ word('MINE!',Lx-10,by-TH-26,CREAM,4,.55); S('bump'); }],
    [P.mine2,()=>{ word('MINE!!',Rx+16,by-AH-30,PINK,4,.55); S('bump'); }],
    [P.jos,()=>{ setMessage('They bicker like they\'re kids again.'); S('squeak'); }],
    ['hf',B0+360]];
  for(let k=0;k<n;k++) { const t0=B0+k*BP,amyShoves=k%2===0,h=hitAt(k),f=tgts[k],q=f?ST.foe(f):{x:h.x-30,top:h.y-90,base:h.y};
    steps.push([t0+150,()=>{ S('whoosh'); word(amyShoves?'MOVE!':'QUIT IT!',Rx+6,by-(amyShoves?AH:TH)-24,amyShoves?PINK:CREAM,3,.6);
      if(k===0) setMessage('Amy shoves Tom. Tom bumps a monster.'); else if(k===1) setMessage('Tom shoves back. Amy bumps another one.'); }]);
    steps.push([t0+360,()=>{ S('bonk'); S('thud'); if(f) ST.jolt(f,.4); battle.shakeEnemy=.4; scene('dust',.5,{x:h.x-14,y:h.y,n:6,sp:30,up:10});
      scene('tb_rings',.6,{x:q.x,y:q.base-q.h*.5,r:46,c:CREAM,w:3}); word(['BONK!','OOF!','BUMP!','THUD!'][k],q.x+16,Math.max(60,q.top-82),GOLD,4,.7); landHit(share[k]); }]); }
  steps.push(
    [P.win,()=>{ word('I CALLED IT!',(Lx+Rx)/2-20,Math.max(70,by-AH-60),GOLD,6,1.7); S('fanfare'); scene('confetti',1.5,{x0:Lx-120,x1:Rx+80,n:36});
      say('amy','tombo'); setMessage('Amy declares herself the winner. Nobody voted.'); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [P.tline,()=>{ say('tom','tomboamy'); setMessage('Tom has heard this before.'); }],
    [P.end,'end',()=>(E2.result||'')+' Amy is counting it as a win. The whole party picks up the pace.']);
  ST.play(E2,steps);
};

// ================= Task T: tier-2 Primary Tombos =================
// ---------- Uncle Spotter Toss (Tom + Grace, tier 2) ----------
// A blue gym mat rolls out. Coach Tom chalks up and laces his fingers into a stirrup. Grace counts it in, two steps,
// onto his hands, and he heaves her straight out of the top of the screen. A twinkle way up high, then she drops like a
// shooting star, two flips, feet first onto the monster. She bounces back to Tom for a high five and sticks the landing.
// Effects: a sure critical Kinetic hit that splashes the neighbors; Tom gets Choreographed (1 VP, a quicker next turn).
SC.tb_mat=(s,u)=>{ const ms=s.t*1000,k=ez(ms/450)*(ms>s.off?1-ez((ms-s.off)/300):1); if(k<=0) return;
  const w=s.w*k,x=s.x1-w,y=s.y,h=16;
  RO(x,y-h/2,w,h,'#3c6cc8'); R(x,y-h/2,w,3,'#6a96e8'); for(let j=1;j<5;j++) R(x+w*j/5-1,y-h/2,2,h,'#2a4c96');
  if(k<1) EO(x,y,9,10,'#3c6cc8'); };
B2_TOMBO_ANIM.grace2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),G=ST.unit(pt),list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,gsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,GH=gsp.idle.length*gsp.scale;
  const sx=cl(F.x+F.w/2+78,170,T.x),sb=cl(Math.max(T.base,F.base)+4,200,312),ux=sx+112;   // Tom's spot, Grace's run-up
  const hands={x:sx-30,y:sb-TH*.34},onTop={x:F.x+4,y:F.top+10},meet={x:sx-40,y:sb};
  const P={walk:650,clap:700,cup:950,go1:1150,go2:1350,step:1550,up:1750,gone:2250,drop:2800,hit:3300,back:3800,five:3850,apply:3950,
    tline:4350,home:5050,end:5750};
  const sT={x:T.x,b:T.base},sG={x:G.x,b:G.base,rot:0,trail:false};
  // Tom: walks to his spot, claps chalk, makes the stirrup, heaves (arms up), high fives, walks home.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=sx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,sx,k); y=lerp(c.origBase,sb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.up) { f=ms>P.clap&&ms<P.clap+160?sp.celeb:(ms>P.cup?sp.act:sp.idle); if(ms>P.step&&ms<P.up) y+=Math.sin(seg(ms,P.step,P.up)*Math.PI)*4; }
    else if(ms<P.gone+200) { f=sp.celeb; y-=Math.sin(seg(ms,P.up,P.up+260)*Math.PI)*8; }
    else if(ms<P.home) { f=ms>P.five-80&&ms<P.five+500?sp.celeb:(ms>P.drop-200&&ms<P.hit+200?sp.expr:sp.idle); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(sx,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  // Grace: run-up spot, two steps, onto the hands, launched, gone, the drop (two flips), the bounce, the high five.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=ux,y=sb,f=sp.idle,rot=0,hide=false; sG.trail=false;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,ux,k); y=lerp(c.origBase,sb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.go1) { f=sp.idle; }
    else if(ms<P.step) { const k=seg(ms,P.go1,P.step),n=k<.5?k*2:(k-.5)*2,leg=k<.5?0:1;
      x=lerp(ux,sx+34,ez(k)); y=sb-Math.sin(n*Math.PI)*(leg?30:14); f=sp.act; }
    else if(ms<P.up) { const k=ez(seg(ms,P.step,P.step+120)); x=lerp(sx+34,hands.x+4,k); y=lerp(sb,hands.y+6,k)-Math.sin(k*Math.PI)*20; f=sp.celeb; }
    else if(ms<P.gone) { const k=seg(ms,P.up,P.gone),e=1-(1-k)*(1-k); x=lerp(hands.x+4,onTop.x+30,e); y=lerp(hands.y+6,-GH-40,e); rot=-k*Math.PI*2; f=sp.celeb; sG.trail=true; }
    else if(ms<P.drop) { hide=true; x=onTop.x; y=-GH-40; }
    else if(ms<P.hit) { const k=seg(ms,P.drop,P.hit),e=k*k; x=lerp(onTop.x+18,onTop.x,k); y=lerp(-GH-30,onTop.y,e); rot=-ez(k)*Math.PI*4; f=sp.celeb; sG.trail=true; }
    else if(ms<P.hit+140) { x=onTop.x; y=onTop.y+Math.sin(seg(ms,P.hit,P.hit+140)*Math.PI)*6; f=sp.celebFlip||sp.celeb; }
    else if(ms<P.back) { const k=seg(ms,P.hit+140,P.back); x=lerp(onTop.x,meet.x,ez(k)); y=lerp(onTop.y,meet.y,k)-Math.sin(k*Math.PI)*70; rot=k*Math.PI*2; f=sp.celeb; }
    else if(ms<P.home) { x=meet.x; y=meet.y; f=sp.celebFlip||sp.flip; if(ms>P.five+400) f=ms>P.tline?sp.flip:(sp.celebFlip||sp.flip); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(meet.x,c.origX,k); y=lerp(meet.y,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sG.x=x; sG.b=y; sG.rot=rot; return {cx:x,base:y,frame:f,rot,hide,noShadow:ms>P.step&&ms<P.back}; });
  scene('tb_mat',P.end/1000,{back:true,x1:sx+150,w:Math.max(200,sx+150-F.x+F.w/2+20),y:sb+4,off:P.home});
  // Front layer: chalk puffs, the stirrup hands, the star trail, the twinkle up high.
  const trail=[];
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    const chalk=(t0,x,y,r)=>{ const k=seg(ms,t0,t0+600); if(k<=0||k>=1) return; gfx.globalAlpha=(1-k)*.85;
      for(let j=0;j<6;j++) { const a=j/6*Math.PI*2+k; E(x+Math.cos(a)*r*k,y+Math.sin(a)*r*.6*k-k*10,6+k*8,5+k*6,'#f4f4f0'); } gfx.globalAlpha=1; };
    chalk(P.clap,sT.x-6,sT.b-TH*.62,26); chalk(P.up,hands.x,hands.y,40);
    if(ms>P.cup&&ms<P.up+120) { const h={x:sT.x-26,y:sT.b-TH*.34};
      EO(h.x,h.y,11,6,SKIN); for(let j=-1;j<=1;j++) Ln(h.x+j*5,h.y-5,h.x+j*5,h.y+2,1.5,SKIN2); }
    if(sG.trail) trail.push({t:ms,x:sG.x,y:sG.b-GH*.5});
    while(trail.length&&ms-trail[0].t>420) trail.shift();
    for(let i=1;i<trail.length;i++) { const a=trail[i-1],b=trail[i]; if(Math.abs(a.y-b.y)>200) continue; const q=1-(ms-b.t)/420;
      gfx.globalAlpha=Math.max(0,q)*.85; Ln(a.x,a.y,b.x,b.y,4+q*10,GOLD); Ln(a.x,a.y,b.x,b.y,2+q*4,'#ffffff'); }
    gfx.globalAlpha=1;
    if(ms>P.gone&&ms<P.drop) { const k=seg(ms,P.gone,P.drop),tw=1+Math.sin(ms/60)*.35; star(onTop.x+18,26,7*tw*Math.sin(k*Math.PI)+2,'#fffbe6'); }
  }});
  const hit=()=>{ S('thud'); S('bonk'); battle.shakeEnemy=.8; battle.flashEnemy=.3;
    for(const f of list) ST.jolt(f,f===tgt?.7:.35);
    scene('tb_rings',.8,{x:F.x,y:F.mid,r:90,c:GOLD,w:4}); scene('dust',.6,{x:F.x,y:F.base,n:8,sp:30,up:10});
    word('BAM!',F.x,Math.max(70,F.top-60),GOLD,6,1); for(let k=0;k<6;k++) { const a=k/6*Math.PI*2; battle.props.push({kind:'dheart',x0:F.x,y0:F.top,x1:F.x+Math.cos(a)*60,y1:F.top+Math.sin(a)*36,arc:10,spin:false,r:5,t:0,dur:.5}); }
    landHit(100); };
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Coach Tom is spotting Grace.'); B2.aim=null; S('whoosh'); }],
    [P.clap,()=>{ S(sfx.clap?'clap':'bump'); word('CHALK UP',sx-20,Math.max(80,sb-TH-24),CREAM,3,.7); }],
    [P.cup,()=>{ say('grace','tombo2'); setMessage('Grace counts it in. Two steps and UP.'); }],
    [P.go1,()=>{ S('step'); word('ONE!',ux-10,sb-GH-30,PINK,3,.45); }],
    [P.go2,()=>{ S('step'); word('TWO!',sx+50,sb-GH-34,PINK,3,.45); }],
    [P.step,()=>{ S('bump'); }],
    [P.up,()=>{ S('jumpWhistle'); S('whoosh'); word('UP!',sx-30,Math.max(70,sb-TH-50),GOLD,6,.9); setMessage('Tom heaves her straight up. Way up.'); }],
    [P.gone+200,'Higher than the gym ceiling...'],
    [P.drop,()=>{ S('slideWhistle'); setMessage('...and here she comes. Two flips. Feet first.'); }],
    [P.hit,hit],
    ['hf',P.hit],
    [P.five,()=>{ S(sfx.clap?'clap':'bonk'); S('ding'); word('HIGH FIVE!',meet.x-14,Math.max(70,sb-TH-40),CREAM,4,1);
      scene('tb_rings',.6,{x:meet.x+20,y:sb-TH*.95,r:40,c:CREAM,w:3}); scene('confetti',1.4,{x0:meet.x-120,x1:meet.x+120,n:26}); }],
    [P.apply,()=>{ E2.apply(); scene('glow',.9,{x:sT.x,y:sT.b-TH*.5,rx:38,ry:52,c:GOLD,a:.35}); }],
    [P.tline,()=>{ say('tom','tombograce2'); word('STUCK IT',meet.x-10,Math.max(70,sb-GH-60),GOLD,4,1.1); setMessage('She stuck it. Tom takes full credit.'); }],
    [P.end,'end',()=>(E2.result||'')+' Grace stuck the landing.']]);
};
// ---------- Red Line Transfer (Tom + TNB, tier 2) ----------
// The stage goes underground: subway tiles, rails and a red METRO sign. A silver Red Line train pulls in behind the
// party. Tom climbs into the front cab (conductor sunglasses), TNB hops up and surfs the roof on his longboard, tossing
// gold transfer cards to everyone. Tom blows the horn and the train barrels through every monster. Effects: a Kinetic
// hit on every enemy (Staggered), the party jumps to the front of the line and is Evasive for 2 turns.
// The train is drawn twice: whole in the back layer, and again in the front layer clipped left of the gap between the
// monsters and the party, so it passes in front of the monsters and behind the party without a visible seam.
const SILVER='#c9ced8',SILVER2='#9aa1ae',METRO_RED='#d8323a';
const transferCard=(x,y,a,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(s,s);
  RO(-13,-8,26,16,GOLD); R(-11,-6,22,3,'#fff4c0'); R(-13,2,26,3,'#c9a23a'); label('TAP',0,-3,'#7a4a10',1); gfx.restore(); };
const longboard=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a);
  RO(-34,-4,68,6,'#c9783a'); R(-30,-4,60,2,'#e8a060'); for(const wx of [-22,22]) { EO(wx,5,3.5,3.5,'#f4e04a'); } gfx.restore(); };
B2_TOMBO_ANIM.tnb2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),N=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,TW=tsp.idle[0].length*tsp.scale;
  const px0=Math.min(...party.map(p=>{ const q=ST.unit(p); return q.x-q.w*.32; }));
  const gapX=cl((GR.x1+px0)/2,GR.x1+6,px0-6);                  // the seam between the two layers
  const yR=306,carH=136,roof=yR-carH,L=470;                    // rails, car height, roof line, train length
  const xS=gapX-8,boardX=xS+212;                               // where the nose stops; TNB's spot on the roof
  const P={arrive0:350,arrive:1350,board:1450,aboard:1900,card:2050,tline:2650,honk:2950,go:3250,out:4250,dark:4300,back:4500,glow:5000,end:5900};
  const goDur=P.out-P.go,travel=xS+L+60;
  const noseAt=ms=>ms<P.arrive0?640:(ms<P.arrive?lerp(640,xS,1-Math.pow(1-seg(ms,P.arrive0,P.arrive),2)):(ms<P.go?xS:xS-travel*Math.pow(seg(ms,P.go,P.out),2)));
  // When the nose reaches each monster (right edge first).
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  for(const o of order) { const need=cl((xS-(o.q.x+o.q.w*.3))/travel,0,1); o.t=Math.round(P.go+Math.sqrt(need)*goDur); }
  const sT={hide:false};
  // Tom: walks to the cab door and climbs in (hidden: the cab draws him), back home with a hop at the end.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp,dx=xS+70;
    if(ms<P.board) return {cx:c.origX,base:c.origBase,frame:ms>P.arrive0&&ms<P.arrive?sp.expr:sp.idle};
    if(ms<P.aboard) { const k=ez(seg(ms,P.board,P.aboard)); return {cx:lerp(c.origX,dx,k),base:lerp(c.origBase,yR-20,k)-Math.sin(k*Math.PI)*30,frame:k<1?runFr(sp,c.t,-1):sp.idle}; }
    if(ms<P.back) { sT.hide=true; return {cx:dx,base:yR,frame:sp.idle,hide:true}; }
    sT.hide=false; const k=seg(ms,P.back,P.back+300); return {cx:c.origX,base:c.origBase-Math.sin(k*Math.PI)*22,frame:k<1?sp.celeb:sp.idle}; });
  // TNB: hops onto the roof, faces the party to toss the transfers, then surfs (facing left) as the train leaves.
  const sN={x:N.x,b:N.base,f:nsp.idle};
  const throwR=nsp.throw?mirrorRowsCached(nsp,'throw'):nsp.flip;
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=boardX,y=roof-8,f=sp.flip,rot=0;
    if(ms<P.board) { x=c.origX; y=c.origBase; f=sp.idle; }
    else if(ms<P.aboard) { const k=ez(seg(ms,P.board,P.aboard)); x=lerp(c.origX,boardX,k); y=lerp(c.origBase,roof-8,k)-Math.sin(k*Math.PI)*70; f=sp.celeb; }
    else if(ms<P.honk) { const k=(ms-P.card)/180; f=ms>P.card&&ms<P.card+party.length*180?(Math.floor(k)%2?throwR:sp.flip):sp.flip; }
    else if(ms<P.back) { const n=noseAt(ms); x=boardX+(n-xS); f=sp.act||sp.idle; rot=ms>P.go?.08+Math.sin(ms/70)*.04:0; y=roof-8-(ms>P.go?Math.abs(Math.sin(ms/90))*3:0); }
    else { const k=seg(ms,P.back,P.back+300); x=c.origX; y=c.origBase-Math.sin(k*Math.PI)*22; f=k<1?sp.celeb:sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.board&&ms<P.back}; });
  const tunK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.dark,P.dark+450)));
  // The tunnel: dark overlay, a band of white subway tiles, the METRO sign, the rails, light streaks when moving.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=tunK(ms); if(k<=0) return;
    gfx.globalAlpha=k*.78; R(0,0,576,324,'#14121c'); gfx.globalAlpha=k;
    const ty0=roof-40,ty1=yR-28; R(0,ty0,576,ty1-ty0,'#d8dcd4');
    for(let y=ty0;y<ty1;y+=10) R(0,y,576,1,'#a8aca4'); for(let y=ty0,r=0;y<ty1;y+=10,r++) for(let x=(r%2)*10;x<576;x+=20) R(x,y,1,10,'#a8aca4');
    R(0,ty0,576,4,'#5a5e66'); R(0,ty0+40,576,8,METRO_RED); R(0,ty1-4,576,4,'#5a5e66');
    const sx=cl(gapX-50,70,360),sy=Math.max(18,ty0-58); RO(sx-62,sy,124,34,METRO_RED); R(sx-60,sy+2,120,4,'#f06a70');
    EO(sx-44,sy+17,11,11,'#ffffff'); label('M',sx-44,sy+12,METRO_RED,2); bigWord('METRO',sx+12,sy+10,'#ffffff',3);
    for(let x=sx-40;x<=sx+40;x+=80) Ln(x,sy,x,Math.max(0,sy-20),2,'#5a5e66');
    R(0,yR-2,576,22,'#2a2830'); for(let x=-((ms*.6)%28);x<576;x+=28) R(x,yR+2,14,10,'#4a3a2e');
    for(const ry of [yR+2,yR+12]) { R(0,ry-2,576,4,OUT); R(0,ry-2,576,2,'#b8bcc4'); }
    if(ms>P.go&&ms<P.out+100) { const q=seg(ms,P.go,P.out); for(let j=0;j<7;j++) { const y=ty0+12+j*((ty1-ty0-20)/6),x=(j*137+ms*(.4+q*1.6))%700-60;
      gfx.globalAlpha=k*.7; Ln(x,y,x+60+q*90,y,3,'#fff6dc'); } gfx.globalAlpha=k; }
    gfx.globalAlpha=1; }});
  // The train itself, nose at xn (facing left). Tom rides in the cab window.
  const train=(xn,ms)=>{ const top=roof,bot=yR-4;
    // headlight beams ahead of the nose
    if(ms<P.out) { gfx.globalAlpha=.16; gfx.beginPath(); gfx.moveTo(xn+4,bot-30); gfx.lineTo(xn-220,bot-70); gfx.lineTo(xn-220,bot+14); gfx.lineTo(xn+4,bot-16); gfx.closePath(); gfx.fillStyle='#fff6c0'; gfx.fill(); gfx.globalAlpha=1; }
    // body
    gfx.beginPath(); gfx.moveTo(xn+30,top); gfx.lineTo(xn+L,top); gfx.lineTo(xn+L,bot); gfx.lineTo(xn,bot); gfx.lineTo(xn,top+46); gfx.quadraticCurveTo(xn+2,top+4,xn+30,top); gfx.closePath();
    gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=SILVER; gfx.fill();
    gfx.save(); gfx.clip();
    R(xn,top,L,10,'#e4e8ee'); R(xn,bot-34,L,26,SILVER2); R(xn,bot-46,L,10,METRO_RED); R(xn,bot-36,L,2,'#f06a70');
    for(let x=xn+150;x<xn+L;x+=120) R(x,top,2,bot-top,'#7a808c');
    gfx.restore();
    // cab window with Tom (sunglasses), the horn cord
    const wx=xn+16,wy=top+14,ww=78,wh=60;
    RO(wx,wy,ww,wh,'#7ab4d8'); gfx.save(); gfx.beginPath(); gfx.rect(wx,wy,ww,wh); gfx.clip();
    if(sT.hide) { const fr=ms>P.honk-60&&ms<P.honk+500?tsp.celeb:tsp.idle,tx=wx+ww/2-TW/2+6,ty=wy+8; drawSprite(fr,tsp.pal,tx,ty,tsp.scale);
      const sc=tsp.scale,ey=ty+12*sc; R(tx+7*sc,ey-1.2*sc,11*sc,2.6*sc,'#14141a'); R(tx+8*sc,ey-1*sc,3*sc,.8*sc,'#6a7a9a'); R(tx+14*sc,ey-1*sc,3*sc,.8*sc,'#6a7a9a'); }
    const pull=ms>P.honk&&ms<P.honk+400?Math.abs(Math.sin(seg(ms,P.honk,P.honk+400)*Math.PI*2))*10:0;
    Ln(wx+ww-14,wy,wx+ww-14,wy+20+pull,2,'#e8e4d8'); EO(wx+ww-14,wy+22+pull,2.5,2.5,'#e8e4d8');
    gfx.globalAlpha=.35; R(wx,wy,ww,8,'#ffffff'); gfx.globalAlpha=1; gfx.restore();
    // side windows and doors
    for(let x=xn+130,j=0;x<xn+L-40;x+=120,j++) { RO(x-44,top+18,40,38,'#5a7a9a'); R(x-42,top+20,36,6,'#8ab0d0');
      RO(x+6,top+16,34,bot-top-52,'#b8bec8'); Ln(x+23,top+16,x+23,bot-36,2,OUT); R(x+6,top+16,34,3,'#f4e04a'); }
    label('RED LINE',xn+L-80,bot-44,'#ffffff',1);
    EO(xn+10,bot-22,5,5,'#fff6c0'); EO(xn+26,bot-22,5,5,'#fff6c0'); RO(xn+46,bot-14,26,6,'#3a3e46');
    // bogies
    for(const bx of [xn+70,xn+L-80]) { RO(bx-34,bot-4,68,10,'#2a2c32'); for(const wx2 of [bx-20,bx+20]) { EO(wx2,bot+6,8,8,'#3a3c44'); E(wx2,bot+6,3,3,'#8a8e98'); } }
    // roof vents and a pantograph-free subway roof
    for(let x=xn+120;x<xn+L-30;x+=120) RO(x,top-6,40,6,'#8a909c');
    // braking sparks
    if(ms>P.arrive-500&&ms<P.arrive) for(let j=0;j<6;j++) { const q=(ms/90+j/6)%1; gfx.globalAlpha=1-q; E(xn+70+(j%2?20:-20)+q*30,bot+12-q*10,2,2,j%2?'#ffe08a':'#ffffff'); }
    gfx.globalAlpha=1; };
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const n=noseAt(ms); if(n>600||n<-L-20) return; train(n,ms); }});
  // Front layer: the train again, left of the gap only; the longboard; the cards; speed lines.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const n=noseAt(ms);
    if(n<=600&&n>=-L-20&&n<gapX) { gfx.save(); gfx.beginPath(); gfx.rect(-10,0,gapX+10,324); gfx.clip(); train(n,ms); gfx.restore(); }
    if(ms>P.aboard-80&&ms<P.back) longboard(sN.x,sN.b+5,ms>P.go?.08+Math.sin(ms/70)*.04:0);
    if(ms>P.go&&ms<P.out) { gfx.globalAlpha=.8; for(let j=0;j<5;j++) { const y=roof-10+j*28,x=n+L+20+((ms*.9+j*53)%120); Ln(x,y,x+70,y,3,'#ffffff'); } gfx.globalAlpha=1; }
    // monsters flung after the hit
    for(const o of order) { const f=o.f,k=seg(ms,o.t,o.t+800);
      if(k>0&&k<1) { f.oy=-Math.sin(k*Math.PI)*70; f.ox=-k*24*(1-k); f.spin=k*Math.PI*2; f.spinAt=performance.now(); }
      else if(k>=1&&o.t&&!o.done) { o.done=true; f.oy=0; f.ox=0; f.spin=0; } }
  }});
  // The transfer cards: one per party member, out of TNB's hand.
  const cards=()=>party.forEach((p,i)=>{ const q=p===tom?{x:xS+60,mid:roof+40}:ST.unit(p),h={x:sN.x+18,y:sN.b-100};
    ST.fly((x,y,uu)=>transferCard(x,y,uu*Math.PI*4,1.6),h.x,h.y,q.x,q.mid,.45,50,i*.18);
  });
  const steps=[
    [0,()=>{ setMessage('TOMBO! TNB and Tom take the subway. Red Line, express.'); B2.aim=null; S('rumble'); }],
    [P.arrive-600,()=>{ S('brakes'); }],
    [P.arrive,()=>{ S('chime2'); word('DING DONG',xS+330,roof-30,CREAM,3,.8); }],
    [P.board,()=>{ setMessage('Tom climbs into the front cab. TNB climbs onto the roof.'); S('jumpWhistle'); }],
    [P.aboard,()=>{ S('bump'); }],
    [P.card-150,()=>{ say('tnb','tombo2'); }],
    [P.card,()=>{ setMessage('TNB hands everyone a gold transfer.'); cards(); }],
    [P.card+450,()=>{ S('ting'); for(const p of party) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.tline,()=>{ say('tom','tombotnb2'); setMessage('Tom puts on his conductor sunglasses.'); }],
    [P.honk,()=>{ S('toot'); word('HONK HONK!',xS+50,roof-26,GOLD,4,.9); }],
    [P.honk+220,()=>{ S('toot'); }],
    [P.go,()=>{ S('jet'); S('rumble'); setMessage('Express service. No stops. Right through the monsters.'); }],
  ];
  order.forEach((o,i)=>steps.push([o.t,()=>{ S('crash'); S('bonk'); battle.shakeEnemy=.7; battle.flashEnemy=.25; ST.jolt(o.f,.7);
    scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:70,c:CREAM,w:4}); if(i===0) word('WHAM!',o.q.x,Math.max(70,roof-30),GOLD,6,1); landHit(100/order.length); }]));
  steps.push(['hf',order.length?order[0].t:P.go+300]);
  steps.push([P.dark,()=>{ word('NEXT STOP: HOME',288,72,CREAM,4,.95); }]);
  steps.push([P.back,()=>{ S('ding'); for(const p of party) glowOn(p); }]);
  steps.push([P.glow,()=>{ E2.apply(); S('heal'); }]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.oy=0; o.f.ox=0; o.f.spin=0; } return (E2.result||'')+' Everybody has a transfer. Next train is theirs.'; }]);
  ST.play(E2,steps);
};

// ---------- Tug of War (Tom + Nara, tier 2) ----------
// Tom and Nara tug a big knotted rope toy, growling and shaking. Tom pulls back politely; Nara pulls back with all
// forty pounds, wins, and Tom flies right over her into the monster, still holding the rope. Effects: a big Kinetic hit
// on one enemy that steals its buffs and lowers its GRIT for 3 turns. Nara stands between the monster and Tom, facing him.
// A braided rope from a to b with a sag; red, white and blue stripes, knots at both ends.
const rope=(ax,ay,bx,by,sag,t)=>{ const mx=(ax+bx)/2,my=(ay+by)/2+sag;
  const pth=()=>{ gfx.beginPath(); gfx.moveTo(ax,ay); gfx.quadraticCurveTo(mx,my,bx,by); };
  gfx.lineCap='round'; pth(); gfx.lineWidth=10; gfx.strokeStyle=OUT; gfx.stroke();
  pth(); gfx.lineWidth=6; gfx.strokeStyle='#f4f0e6'; gfx.stroke();
  gfx.setLineDash([7,7]); gfx.lineDashOffset=-t*20; pth(); gfx.strokeStyle='#d8323a'; gfx.stroke();
  gfx.lineDashOffset=-t*20+7; gfx.setLineDash([7,21]); pth(); gfx.strokeStyle='#3c6cc8'; gfx.stroke(); gfx.setLineDash([]);
  for(const [x,y] of [[ax,ay],[bx,by]]) { EO(x,y,7,7,'#d8323a'); E(x-2,y-2,3,2,'#f4f0e6'); } };
B2_TOMBO_ANIM.nara2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),N=ST.unit(pt),list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt);
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const fr=F.x+F.w/2,nb=cl(F.base+8,220,312),nx=cl(fr+110,140,450),tx=Math.min(nx+115,552);
  const land={x:fr-12,b:F.base-F.h*.18};   // Tom's cx at the hit is land.x+30: smacked into its right side
  const P={walk:650,grab:750,tug:900,tline:1500,yank:2350,fly:2550,hit:3000,slide:3150,stand:3600,steal:3300,apply:3700,win:3750,home:4450,end:5200};
  const tug=ms=>ms>P.tug&&ms<P.yank?Math.sin((ms-P.tug)/170)*6:0;          // the back-and-forth
  const sT={x:T.x,b:T.base,f:tsp.idle,rot:0},sN={x:N.x,b:N.base,f:nsp.idle,rot:0};
  const nR=k=>nsp[k]?mirrorRowsCached(nsp,k):nsp.flip;
  // Tom: to his end of the rope (facing left), leans back politely, gets yanked over Nara into the monster, slides down.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=nb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,nb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.yank) { x=tx+4+tug(ms); rot=.1; f=sp.act; }
    else if(ms<P.fly) { const k=seg(ms,P.yank,P.fly); x=tx-k*14; rot=lerp(.1,-.25,k); f=sp.expr; }
    else if(ms<P.hit) { const k=seg(ms,P.fly,P.hit); x=lerp(tx-14,land.x+30,k); y=lerp(nb,land.b,k)-Math.sin(k*Math.PI)*95; rot=-k*Math.PI*2-.4*k; f=sp.celeb; }
    else if(ms<P.stand) { const k=seg(ms,P.slide,P.stand); x=land.x+30+k*8; y=lerp(land.b,nb,ez(k)); rot=lerp(-.4,0,k); f=sp.kneel||sp.idle; }
    else if(ms<P.home) { x=land.x+38; y=nb; f=ms>P.win+200?sp.flip:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(land.x+38,c.origX,k); y=lerp(nb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; sT.rot=rot; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.fly&&ms<P.stand}; });
  // Nara: trots to her spot, turns to face Tom, chomps the rope, shakes and growls, the big yank, then the victory prance.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nx,y=nb,f=sp.flip,rot=0;
    if(ms<P.walk+100) { const k=ez(ms/(P.walk+100)); x=lerp(c.origX,nx,k); y=lerp(c.origBase,nb,k)-Math.abs(Math.sin(c.t*16))*4; f=runFr(sp,c.t,-1); }
    else if(ms<P.yank) { x=nx-2+tug(ms)*.5; rot=ms>P.tug?Math.sin(ms/45)*.09:0; f=nR('aim'); }
    else if(ms<P.hit) { const k=seg(ms,P.yank,P.yank+200); const back=1-ez(seg(ms,P.fly+100,P.hit)); x=nx-ez(k)*16*back; y=nb+ez(k)*3*back; rot=-.14*ez(k)*back; f=nR('wind'); }
    else if(ms<P.win) { f=sp.flip; }
    else if(ms<P.home) { const k=seg(ms,P.win,P.home); x=nx; y=nb-Math.abs(Math.sin(k*Math.PI*3))*14; f=sp.celebFlip||sp.flip; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(nx,c.origX,k); y=lerp(nb,c.origBase,k)-(k<1?Math.abs(Math.sin(c.t*16))*4:0); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; sN.rot=rot; return {cx:x,base:y,frame:f,rot}; });
  const mouth=()=>{ const h=handPt(nsp,sN.f,sN.x,sN.b,1); return {x:h.x+4,y:h.y-4}; };
  const tomHand=()=>{ const H=TH,r=sT.rot,dx=-TH*.22,dy=-H*.52; return {x:sT.x+dx*Math.cos(r)-dy*Math.sin(r),y:sT.b+dx*Math.sin(r)+dy*Math.cos(r)}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the rope: taut while they tug, trailing behind Tom in flight, dropped at Nara's feet after
    if(ms>P.grab&&ms<P.win) { const m=mouth(),h=tomHand(),taut=ms>P.tug&&ms<P.hit;
      rope(m.x,m.y,h.x,h.y,taut?6+Math.sin(ms/60)*2:28,ms/1000); }
    else if(ms>=P.win&&ms<P.home) { const m=mouth(); rope(m.x,m.y,m.x+30,nb-4,10,0); }
    if(ms>P.grab&&ms<P.grab+300) { const m=mouth(),k=seg(ms,P.grab,P.grab+300); gfx.globalAlpha=1-k; ring(m.x,m.y,10+k*20,8+k*14,3,CREAM); gfx.globalAlpha=1; }
    // strain lines while tugging
    if(ms>P.tug&&ms<P.yank) { gfx.globalAlpha=.85; for(let j=0;j<3;j++) { const ox=sN.x-NH*.42-4-j*7,oy=sN.b-NH*.55+j*9+Math.sin(ms/50+j)*2; Ln(ox,oy,ox-10,oy,3,CREAM); } gfx.globalAlpha=1; }
    // squash the monster for a moment on the hit
    if(ms>P.hit&&ms<P.hit+260) { tgt.spin=0; tgt.ox=-10*Math.sin(seg(ms,P.hit,P.hit+260)*Math.PI); tgt.fsc=.86; tgt.oy=F.h/2*.14; tgt.spinAt=performance.now(); }
    else if(tgt.fsc) { tgt.fsc=0; tgt.oy=0; tgt.ox=0; }
    // a speed trail behind Tom in flight
    if(ms>P.fly&&ms<P.hit) { const k=seg(ms,P.fly,P.hit); for(let j=1;j<5;j++) { gfx.globalAlpha=.5-j*.1; const kk=Math.max(0,k-j*.05),x=lerp(tx-14,land.x+30,kk),y=lerp(nb,land.b,kk)-Math.sin(kk*Math.PI)*95-TH*.5; E(x,y,10-j,10-j,CREAM); } gfx.globalAlpha=1; }
  }});
  // Its buffs: three sparkles fly from the monster to Nara.
  const steal=()=>{ for(let j=0;j<3;j++) ST.fly((x,y)=>{ star(x,y,7,j%2?'#aef0ff':GOLD); },F.x-10+j*10,F.top+10,nx,nb-NH-6,.5,40,j*.12); };
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Tug of war. Tom versus Nara.'); B2.aim=null; S('click'); }],
    [P.grab,()=>{ S('crunch'); word('CHOMP',nx,nb-NH-30,CREAM,3,.6); }],
    [P.tug,()=>{ say('nara','tombo2'); S('bark'); word('GRRRR!',nx-10,nb-NH-40,PINK,4,1); setMessage('Nara growls and shakes. Tom pulls back politely.'); }],
    [P.tline,()=>{ say('tom','tombonara2'); }],
    [P.yank,()=>{ S('whoosh'); word('YANK!',(nx+tx)/2,nb-NH-60,GOLD,5,.8); setMessage('Nara pulls with all forty pounds.'); }],
    [P.fly,()=>{ S('slideWhistle'); }],
    [P.hit,()=>{ S('thud'); S('bonk'); battle.shakeEnemy=.8; battle.flashEnemy=.3; ST.jolt(tgt,.8);
      scene('tb_rings',.7,{x:land.x,y:land.b-TH*.5,r:80,c:CREAM,w:4}); scene('dust',.6,{x:F.x,y:F.base,n:8,sp:30,up:10});
      word('THWUMP!',F.x,Math.max(64,F.top-90),GOLD,6,.75); landHit(100); }],
    ['hf',P.hit],
    [P.hit+400,'Tom is still holding the rope.'],
    [P.steal,()=>{ steal(); S('pickup'); }],
    [P.apply,()=>{ E2.apply(); }],
    [P.win,()=>{ S('bark'); S('cheer'); word('WINNER!',nx+30,Math.max(64,nb-NH-70),GOLD,4,1); setMessage('Nara wins. She takes its buffs, too.'); }],
    [P.end,'end',()=>{ if(tgt.fsc) { tgt.fsc=0; tgt.oy=0; tgt.ox=0; } return (E2.result||'')+' Nara is very proud. Tom says he let her win.'; }]]);
};

// ---------- Pick the Rhubarb (Tom + Deedee, tier 2) ----------
// Deedee puts Tom to work in her garden. He pulls a giant rhubarb stalk; it will not come out. Deedee grabs him from
// behind and they both pull, tug-of-war style. The ROOT is the monster: a giant rhubarb root bursts out of the ground
// under them and every monster pops up, roots and all. Tom and Deedee land on their bottoms; Deedee bakes the stalk
// into Warm Crusts and two crust tins land on the tray. Effects: a Sparkle hit on every enemy (Shushed 2), the party
// loses its debuffs and gets COOL +25% for 3 turns, 2 Warm Crusts.
const LEAF='#4f9a3a',LEAF2='#2f6a2a',STALK='#d8325a',STALK2='#ff7a9a',DIRT='#7a5232',DIRT2='#5a3a22',ROOT='#a8784a',ROOT2='#7a5232';
// A rhubarb stalk from its base (bx,by) through the hand (hx,hy) to a big leaf past it. s: leaf size.
const rhubarb=(bx,by,hx,hy,s=1,t=0)=>{ const dx=hx-bx,dy=hy-by,L=Math.hypot(dx,dy)||1,tx=hx+dx/L*30*s,ty=hy+dy/L*30*s;
  const pth=()=>{ gfx.beginPath(); gfx.moveTo(bx,by); gfx.quadraticCurveTo(hx,hy,tx,ty); };
  gfx.lineCap='round'; pth(); gfx.lineWidth=13*s; gfx.strokeStyle=OUT; gfx.stroke(); pth(); gfx.lineWidth=9*s; gfx.strokeStyle=STALK; gfx.stroke();
  gfx.save(); gfx.translate(2*s,-1*s); pth(); gfx.lineWidth=3*s; gfx.strokeStyle=STALK2; gfx.stroke(); gfx.restore();
  const a=Math.atan2(ty-hy,tx-hx); gfx.save(); gfx.translate(tx,ty); gfx.rotate(a+Math.sin(t*7)*.08);
  for(const [ox,oy,rx,ry] of [[18,0,26,20],[8,-14,16,12],[8,14,16,12],[34,-8,12,10],[34,8,12,10]]) E(ox*s,oy*s,(rx+2)*s,(ry+2)*s,OUT);
  for(const [ox,oy,rx,ry] of [[18,0,26,20],[8,-14,16,12],[8,14,16,12],[34,-8,12,10],[34,8,12,10]]) E(ox*s,oy*s,rx*s,ry*s,LEAF);
  E(14*s,-6*s,12*s,6*s,'#7ac45a'); Ln(0,0,42*s,0,2*s,LEAF2); for(const k of [-1,1]) { Ln(12*s,0,24*s,k*12*s,1.5*s,LEAF2); Ln(26*s,0,36*s,k*10*s,1.5*s,LEAF2); }
  gfx.restore(); };
// A few dangling root hairs from (x,y), length l, swaying with t.
const rootHairs=(x,y,w,l,t)=>{ for(let j=0;j<5;j++) { const ox=x+(j-2)*w*.2,sw=Math.sin(t*8+j)*4,len=l*(.6+(j%3)*.25);
  for(const [c,lw] of [[OUT,5],[ROOT,2.6]]) { gfx.strokeStyle=c; gfx.lineWidth=lw; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(ox,y); gfx.quadraticCurveTo(ox+sw+(j-2)*3,y+len*.5,ox+sw*1.6+(j-2)*5,y+len); gfx.stroke(); } } };
// A pie tin with a golden lattice crust.
const crustTin=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); EO(0,4,16,6,'#b8bec8'); E(0,4,13,4.4,'#8a909c');
  EO(0,0,14,6,'#e8b060'); for(let j=-1;j<=1;j++) { Ln(j*7,-4,j*7,4,2,'#c07a30'); Ln(-11,j*2.6,11,j*2.6,1.6,'#c07a30'); } E(-5,-2,4,1.4,'#ffe0a0'); gfx.restore(); };
B2_TOMBO_ANIM.deedee2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const gb=cl(GR.base+10,250,306),sx=cl(GR.x1+64,150,T.x-110),tx=sx+24,dx=tx+44,dsup=Math.min(tx+84,546);   // stalk, Tom, Deedee
  const tray={x:tx+70,y:Math.min(gb+12,314)};
  const P={walk:700,point:800,grab:1000,stuck:1400,tline:1500,step:1900,behind:2200,dline:2250,heave:2500,ho:2950,rumble:2700,yank:3400,sit:3700,
    up:4300,bake:4450,tin1:4800,tin2:4950,apply:5200,home:5500,end:6300};
  const tug=ms=>ms>P.grab&&ms<P.yank?(ms<P.behind?Math.sin((ms-P.grab)/90)*2:Math.sin((ms-P.behind)/150)*6):0;
  const lean=ms=>ms>P.grab&&ms<P.yank?(ms<P.behind?.1:.16):0;
  const sT={x:T.x,b:T.base,rot:0},sD={x:D.x,b:D.base,f:dsp.idle};
  // Tom: walks to the stalk (facing left), grabs it and pulls, Deedee joins, the yank throws him back onto his bottom.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=gb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,gb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.yank) { f=ms>P.grab?sp.act:sp.idle; x=tx+tug(ms); rot=lean(ms); if(ms>P.stuck&&ms<P.stuck+300) f=sp.expr; }
    else if(ms<P.sit) { const k=seg(ms,P.yank,P.sit); x=tx+ez(k)*34; y=gb-Math.sin(k*Math.PI)*22; rot=lerp(.16,.5,k); f=sp.expr; }
    else if(ms<P.up) { x=tx+34; y=gb+4; rot=ms<P.sit+120?.5*(1-seg(ms,P.sit,P.sit+120)):0; f=sp.kneel||sp.idle; }
    else if(ms<P.home) { x=tx+34; f=ms>P.tin2&&ms<P.apply+300?sp.celeb:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx+34,c.origX,k); y=lerp(gb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.rot=rot; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.yank&&ms<P.sit}; });
  // Deedee: walks in, points at the garden, hands on hips, steps in behind Tom, pulls, lands sitting, bakes, tosses tins.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dsup,y=gb,f=sp.idle,rot=0;
    if(ms<P.walk+100) { const k=ez(ms/(P.walk+100)); x=lerp(c.origX,dsup,k); y=lerp(c.origBase,gb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.step) { f=ms<P.point+500?(sp.spread||sp.idle):(sp.hip||sp.idle); }
    else if(ms<P.behind) { const k=ez(seg(ms,P.step,P.behind)); x=lerp(dsup,dx,k); y=gb-Math.sin(k*Math.PI)*6; f=runFr(sp,c.t,-1); }
    else if(ms<P.yank) { x=dx+tug(ms)*1.1; rot=lean(ms); f=sp.act||sp.idle; }
    else if(ms<P.sit) { const k=seg(ms,P.yank,P.sit); x=dx+ez(k)*58; y=gb-Math.sin(k*Math.PI)*18; rot=lerp(.16,.4,k); f=sp.act||sp.idle; }
    else if(ms<P.up) { x=dx+58; y=gb+2; f=sp.sit||sp.kneel||sp.idle; }
    else if(ms<P.home) { x=dx+58; f=ms<P.bake+250?(sp.celeb||sp.idle):(ms>P.tin1-200&&ms<P.tin2+150?(Math.floor((ms-P.tin1+200)/150)%2?sp.throw:sp.wind)||sp.idle:(ms>P.apply?(sp.celeb||sp.idle):(sp.clap||sp.idle))); }
    else { const k=ez(seg(ms,P.home+60,P.home+700)); x=lerp(dx+58,c.origX,k); y=lerp(gb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sD.x=x; sD.b=y; sD.f=f; return {cx:x,base:y,frame:f,rot}; });
  const tomHand=()=>{ const r=sT.rot,ddx=-TH*.27,ddy=-TH*.5; return {x:sT.x+ddx*Math.cos(r)-ddy*Math.sin(r),y:sT.b+ddx*Math.sin(r)+ddy*Math.cos(r)}; };
  // When each monster pops (nearest the stalk first) and comes back down.
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  order.forEach((o,i)=>{ o.t=P.yank+60+i*110; });
  const popK=(o,ms)=>seg(ms,o.t,o.t+900),popY=k=>-Math.sin(k*Math.PI)*58;
  const gardenK=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.home+500)));
  const rootX0=Math.max(8,GR.x0-50),rootY=Math.max(gb,GR.base)+6;
  // Back layer: the garden bed (soil, furrows, little sprouts) and, after the yank, the giant root humping up under them.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=gardenK(ms); if(k<=0) return; gfx.globalAlpha=k;
    const x0=rootX0-20,x1=Math.min(dsup+40,576),y0=gb-8;
    R(x0,y0,x1-x0,22,DIRT); R(x0,y0,x1-x0,3,'#9a6a42'); for(let x=x0+6;x<x1;x+=18) { R(x,y0+8,10,2,DIRT2); R(x+8,y0+15,8,2,DIRT2); }
    for(let x=x0+30;x<x1-20;x+=58) if(Math.abs(x-sx)>30) { const sw=Math.sin(ms/400+x)*.1; gfx.save(); gfx.translate(x,y0); gfx.rotate(sw); EO(-5,-6,6,4,LEAF); EO(5,-8,6,4,LEAF); Ln(0,0,0,-6,2,LEAF2); gfx.restore(); }
    // the stalk in the ground before the yank
    if(ms<P.yank) { const h=ms>P.grab?tomHand():{x:sx+4,y:gb-58}; rhubarb(sx,gb,h.x,h.y,1.15,ms/1000);
      if(ms>P.rumble) for(let j=0;j<6;j++) { const q=(ms/220+j/6)%1; gfx.globalAlpha=k*(1-q); E(rootX0+30+j*((sx-rootX0)/6),rootY-6-q*14,2.5,2,DIRT2); } gfx.globalAlpha=k; }
    // the root: a fat gnarled tuber running from the stalk's hole under every monster, humping up out of the dirt
    if(ms>P.yank-40&&ms<P.up+400) { const kk=ez(seg(ms,P.yank-40,P.yank+260)),hump=kk*(1-ez(seg(ms,P.up,P.up+400))*.8);
      gfx.globalAlpha=k*Math.min(1,kk*3); const cx=(sx+rootX0)/2,cy=rootY+30-hump*86;
      const pth=()=>{ gfx.beginPath(); gfx.moveTo(sx,gb+2); gfx.quadraticCurveTo(cx,cy,rootX0,rootY+4); };
      gfx.lineCap='round'; pth(); gfx.lineWidth=26; gfx.strokeStyle=OUT; gfx.stroke(); pth(); gfx.lineWidth=20; gfx.strokeStyle=ROOT; gfx.stroke();
      gfx.save(); gfx.translate(0,-5); pth(); gfx.lineWidth=5; gfx.strokeStyle='#c89a62'; gfx.stroke(); gfx.restore();
      for(let j=1;j<7;j++) { const q=j/7,bx=(1-q)*(1-q)*sx+2*(1-q)*q*cx+q*q*rootX0,by=(1-q)*(1-q)*(gb+2)+2*(1-q)*q*cy+q*q*(rootY+4);
        Ln(bx-4,by-2,bx+4,by+2,2,ROOT2); rootHairs(bx,by+8,20,14+(j%2)*8,ms/1000+j); }
      gfx.globalAlpha=k; }
    gfx.globalAlpha=1; }});
  // Front layer: the stalk in Tom's hands after the yank (roots dangling), the oven puff, the tray and the tins,
  // the dangling roots under every popped monster.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>=P.yank&&ms<P.bake) { const h=tomHand(); rhubarb(h.x+20,h.y+30,h.x,h.y,1.15,ms/1000); rootHairs(h.x+20,h.y+32,14,14,ms/1000); }
    for(const o of order) { const k=popK(o,ms),f=o.f;
      if(k>0&&k<1) { f.oy=popY(k); f.ox=0; f.spin=Math.sin(k*Math.PI*3)*.12; f.spinAt=performance.now(); rootHairs(o.q.x,o.q.base+f.oy-2,o.q.w*.7,22,ms/1000); }
      else if(k>=1&&!o.done) { o.done=true; f.oy=0; f.ox=0; f.spin=0; } }
    if(ms>P.bake&&ms<P.bake+700) { const k=seg(ms,P.bake,P.bake+700),bx=sD.x-6,by=sD.b-DH*.9;
      gfx.globalAlpha=1-k; for(let j=0;j<7;j++) { const a=j/7*Math.PI*2; E(bx+Math.cos(a)*30*k,by+Math.sin(a)*18*k-k*16,10+k*8,8+k*6,j%2?'#f4f0e6':'#e8dcc8'); } gfx.globalAlpha=1; }
    const tk=ms<P.home?ez(seg(ms,P.tin1-300,P.tin1)):1-ez(seg(ms,P.home,P.home+400));
    if(tk>0) { gfx.globalAlpha=tk; RO(tray.x-32,tray.y-4,64,8,'#c9ced8'); R(tray.x-30,tray.y-4,60,2,'#eef0f4');
      if(ms>P.tin1+450) crustTin(tray.x-14,tray.y-8,1); if(ms>P.tin2+450) crustTin(tray.x+14,tray.y-8,1);
      if(ms>P.tin2+450) for(let j=0;j<3;j++) { const q=(ms/700+j/3)%1; gfx.globalAlpha=tk*(1-q)*.7; Ln(tray.x-20+j*20,tray.y-18-q*16,tray.x-18+j*20+Math.sin(q*6)*3,tray.y-26-q*16,2,'#ffffff'); }
      gfx.globalAlpha=1; }
  }});
  const pop=(o,i)=>{ S('pop'); S('bonk'); ST.jolt(o.f,.6); battle.shakeEnemy=.6;
    scene('dust',.7,{x:o.q.x,y:o.q.base,n:9,sp:34,up:16});
    for(let j=0;j<3;j++) ST.fly((x,y)=>{ EO(x,y,4,3,DIRT); },o.q.x+(j-1)*10,o.q.base,o.q.x+(j-1)*46,o.q.base+6,.55,50+j*14);
    landHit(100/order.length); };
  const tin=(x1)=>{ const h=handPt(dsp,dsp.throw||dsp.idle,sD.x,sD.b,-1); ST.fly((x,y)=>crustTin(x,y,1.2),h.x,h.y,x1,tray.y-8,.45,46,0,{spin:.5}); S('whoosh'); };
  const steps=[
    [0,()=>{ setMessage('TOMBO! Deedee puts Tom to work in her garden.'); B2.aim=null; S('click'); }],
    [P.point,()=>{ word('THAT ONE',sx+10,gb-110,CREAM,3,.8); S('pickup'); }],
    [P.grab,()=>{ S('creak'); setMessage('Tom grabs the rhubarb and pulls. Nothing.'); }],
    [P.stuck,()=>{ word('STUCK!',sx+6,gb-118,RED,4,.8); S('boing'); }],
    [P.tline,()=>{ say('tom','tombodeedee2'); }],
    [P.dline,()=>{ say('deedee','tombo2'); setMessage('Deedee grabs Tom from behind. They BOTH pull.'); }],
    [P.heave,()=>{ word('HEAVE!',dx-10,gb-DH-36,GOLD,4,.6); S('squeak'); }],
    [P.rumble,()=>{ S('rumble'); battle.shakeEnemy=.3; for(const f of list) ST.jolt(f,.2); }],
    [P.ho,()=>{ word('HO!!',dx+10,gb-DH-40,GOLD,5,.6); S('squeak'); battle.shakeEnemy=.45; }],
    [P.yank,()=>{ S('crash'); S('whoosh'); word('ROOTS AND ALL!',cl((sx+rootX0)/2,150,420),Math.max(70,GR.top-70),GOLD,4,1.2);
      setMessage('The root is the monster! A giant rhubarb root bursts out of the ground.'); }],
    [P.sit,()=>{ S('thud'); scene('dust',.5,{x:tx+34,y:gb+4,n:6,sp:18,up:8}); scene('dust',.5,{x:dx+58,y:gb+2,n:6,sp:18,up:8}); }],
    [P.up,()=>{ setMessage('Deedee takes the stalk. She knows exactly what to do with it.'); }],
    [P.bake,()=>{ S('flame'); word('BAKE!',sD.x-10,Math.max(70,gb-DH-46),CREAM,4,.8); }],
    [P.tin1,()=>tin(tray.x-14)],
    [P.tin1+450,()=>{ S('ting'); }],
    [P.tin2,()=>tin(tray.x+14)],
    [P.tin2+450,()=>{ S('ting'); scene('tb_rings',.6,{x:tray.x,y:tray.y-8,r:40,c:GOLD,w:3}); }],
    [P.apply,()=>{ E2.apply(); S('heal');
      for(const p of party) { if(p===tom) scene('glow',.9,{x:sT.x,y:sT.b-TH*.5,rx:38,ry:52,c:'#aef0ff',a:.35}); else if(p===pt) scene('glow',.9,{x:sD.x,y:sD.b-DH*.5,rx:38,ry:52,c:'#aef0ff',a:.35}); else glowOn(p); } }],
  ];
  order.forEach((o,i)=>steps.push([o.t+150,()=>pop(o,i)]));
  steps.push(['hf',order.length?order[0].t+150:P.yank+200]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.oy=0; o.f.ox=0; o.f.spin=0; } return (E2.result||'')+' Rhubarb crust for everybody. Tom did most of the pulling, he says.'; }]);
  ST.play(E2,steps);
};

// ---------- Seat 1A Stowaway (Tom + Rose, tier 2) ----------
// Rose dives into Tom's carry-on. He wheels it right up to the monsters, very casually, a blanket over a lump with two
// little sneakers sticking out. The monsters lean in. BOO!! Rose pops out with Lamby held high and blows a giant
// raspberry; every monster jumps out of its skin and goofs. She snatches their buffs, then rides the carry-on home.
// Effects: a Cozy hit on every enemy; they are Goofed and lose a buff each; Tom and Rose are Evasive for 2 turns.
const CASE='#2f5a8a',CASE2='#4a7cb0',CASE3='#1f3e64',BLANK='#ff9ac0',BLANK2='#e86a9a',SHOE='#ff6aa0';
// The carry-on: body bottom-centre at (x,by); the handle runs from its top right corner to (hx,hy). lump: 0..1 blanket
// and sneakers on top; wig: the lump's wiggle.
const carryOn=(x,by,hx,hy,lump,wig,t)=>{ const w=64,h=46,b=by-6,top=b-h;
  if(hx!=null) { Ln(x+w/2-6,top+4,hx,hy,6,OUT); Ln(x+w/2-6,top+4,hx,hy,3,'#9aa1ae'); RO(hx-5,hy-3,10,6,'#3a3e46'); }
  for(const wx of [x-w/2+10,x+w/2-10]) { const sp=t*14; EO(wx,b+2,5,5,'#2a2c32'); Ln(wx,b+2,wx+Math.cos(sp)*3,b+2+Math.sin(sp)*3,1.5,'#8a8e98'); }
  RO(x-w/2,top,w,h,CASE); R(x-w/2,top,w,4,CASE2); for(const dx of [-16,0,16]) R(x+dx-1,top+6,2,h-10,CASE3);
  RO(x-12,top-6,24,5,'#3a3e46'); RO(x+w/2-20,top+12,10,14,'#f4e6c8'); label('1A',x+w/2-15,top+16,'#d8323a',1);
  if(lump<=0) return;
  gfx.save(); gfx.globalAlpha=lump; const ly=top-2,s=1+Math.sin(wig)*.06;
  // two sneakers sticking out of the left end (toward the monsters)
  for(const [dx,dy] of [[0,-6],[-6,6]]) { const sx=x-w/2-8+dx+Math.sin(wig*1.3)*3,sy=ly-8+dy; EO(sx,sy,10,6,SHOE); R(sx-9,sy+3,18,3,'#ffffff'); E(sx-4,sy-2,3,2,'#ffffff'); }
  gfx.save(); gfx.translate(x,ly); gfx.scale(1,s); EO(0,-14,w/2+2,18,BLANK); for(let j=-2;j<=2;j++) { R(j*12-1,-30,2,18,BLANK2); }
  R(-w/2,-6,w+4,4,BLANK2); E(-10,-22,12,5,'#ffc8dc'); gfx.restore(); gfx.restore(); };
B2_TOMBO_ANIM.rose2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),Ro=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,rsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,RH=rsp.idle.length*rsp.scale,RW=rsp.idle[0].length*rsp.scale;
  const gb=cl(GR.base+8,240,310),cx=cl(GR.x1+70,140,T.x-120),cx0=T.x-58,top=b=>b-52;   // the case stops at cx; starts left of Tom
  const P={run:550,hop:800,roll0:950,roll1:2050,tline:2150,lean0:2450,lean1:3250,wig:2900,boo:3350,apex:3580,land:3820,rasp:3950,rasp1:4450,
    steal:4500,apply:4850,home0:5100,home1:5900,end:6500};
  const caseAt=ms=>ms<P.roll0?{x:cx0,b:T.base}:(ms<P.roll1?(k=>({x:lerp(cx0,cx,k),b:lerp(T.base,gb,k)}))(ez(seg(ms,P.roll0,P.roll1))):
    (ms<P.home0?{x:cx,b:gb}:(k=>({x:lerp(cx,cx0,k),b:lerp(gb,T.base,k)}))(ez(seg(ms,P.home0,P.home1)))));
  const rolling=ms=>(ms>P.roll0&&ms<P.roll1)||(ms>P.home0&&ms<P.home1);
  const sT={x:T.x,b:T.base},sR={x:Ro.x,b:Ro.base,f:rsp.idle,hide:false};
  // Tom: holds the handle; wheels the case to the monsters (whistling, very casual), and back home with Rose on top.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp,C=caseAt(ms); let x=C.x+58,y=C.b,f=sp.idle;
    if(ms<P.roll0) { x=c.origX; y=c.origBase; }
    else if(ms<P.roll1) f=runFr(sp,c.t*.7,-1);
    else if(ms<P.home0) f=ms>P.boo&&ms<P.boo+500?sp.expr:(ms>P.land+200?sp.celeb:sp.idle);
    else if(ms<P.home1) { f=runFr(sp,c.t*.7,1); }
    else { x=c.origX; y=c.origBase; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  const hand=()=>({x:sT.x-TH*.27,y:sT.b-TH*.5});
  // Rose: runs to the case, dives in (hidden), BOO!! pops out sky-high with Lamby, lands on the case, raspberry, rides home.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,C=caseAt(ms); let x=C.x,y=top(C.b),f=sp.celeb,hide=false;
    if(ms<P.run) { const k=ez(ms/P.run); x=lerp(c.origX,cx0+30,k); y=lerp(c.origBase,T.base,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.hop) { const k=seg(ms,P.run,P.hop); x=lerp(cx0+30,cx0,k); y=lerp(T.base,top(T.base),k)-Math.sin(k*Math.PI)*50; f=sp.celeb; }
    else if(ms<P.boo) { hide=true; }
    else if(ms<P.land) { const k=seg(ms,P.boo,P.land); y=top(C.b)-Math.sin(k*Math.PI)*100; f=sp.celeb; }
    else if(ms<P.home0) { f=ms>P.rasp&&ms<P.rasp1?(sp.expr||sp.act):(ms>P.steal?sp.celeb:sp.idle); }
    else if(ms<P.home1) { y-=Math.abs(Math.sin(ms/110))*4; f=sp.celebFlip||sp.flip; }
    else { const k=ez(seg(ms,P.home1,P.home1+500)); x=lerp(C.x,c.origX,k); y=lerp(top(C.b),c.origBase,k)-Math.sin(k*Math.PI)*40; f=k<1?sp.celeb:sp.idle; }
    sR.x=x; sR.b=y; sR.f=f; sR.hide=hide; return {cx:x,base:y,frame:f,hide,noShadow:ms>P.run&&ms<P.home1+400}; });
  const mouth=()=>{ const sc=rsp.scale,m=rsp.mouth||{col:9,row:16}; return {x:sR.x-RW/2+m.col*sc,y:sR.b-RH+m.row*sc}; };
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  order.forEach((o,i)=>{ o.t=P.boo+90+i*70; });
  const caseK=ms=>ez(seg(ms,0,300))*(1-ez(seg(ms,P.home1,P.home1+400)));
  // The carry-on (behind the bodies, so Rose stands on it) ...
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=caseK(ms); if(k<=0) return; const C=caseAt(ms),h=hand();
    const lump=ms<P.hop?0:(ms<P.boo?1:0),wig=ms>P.wig&&ms<P.boo?ms/45:(ms>P.lean0?ms/300:0);
    gfx.globalAlpha=k; carryOn(C.x,C.b,ms>P.roll0-100&&ms<P.home1?h.x:null,h.y,lump,wig,rolling(ms)?ms/1000:0); gfx.globalAlpha=1; }});
  // ... and in front: Lamby, the raspberry, the leaning and goofing monsters, the dizzy stars.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the hop in: a little puff where she vanished
    if(ms>P.hop&&ms<P.hop+400) { const k=seg(ms,P.hop,P.hop+400); gfx.globalAlpha=1-k; for(let j=0;j<5;j++) { const a=j/5*Math.PI*2; E(cx0+Math.cos(a)*20*k,top(T.base)-14+Math.sin(a)*10*k,6,5,CREAM); } gfx.globalAlpha=1; }
    // Lamby, held high once she pops out
    if(ms>P.boo&&ms<P.home1+400) { const lx=sR.x-RW*.42,ly=sR.b-RH-6,w=Math.sin(ms/120)*.12;
      gfx.save(); gfx.translate(lx,ly); gfx.rotate(-.2+w); gfx.scale(.85,.85); PROP2.lamby({flip:false},0); gfx.restore(); }
    // the raspberry: a fat tongue and a spray of pink droplets across to the monsters
    if(ms>P.rasp&&ms<P.rasp1) { const m=mouth(),k=seg(ms,P.rasp,P.rasp1),wob=Math.sin(ms/30)*2;
      EO(m.x-5,m.y+2+wob*.5,6,4,'#ff6a8a'); Ln(m.x-8,m.y+2,m.x-2,m.y+2,1.2,'#d64a74');
      for(let j=0;j<14;j++) { const q=(k*1.6+j/14)%1,yy=m.y-6+Math.sin(j*2.1)*30*q+wob,xx=lerp(m.x-10,GR.x0+20,q); gfx.globalAlpha=1-q*.6; EO(xx,yy,3+q*4,2+q*3,j%3?'#ff8aa8':'#ffd0dc'); }
      gfx.globalAlpha=1; }
    for(const o of order) { const f=o.f,q=o.q;
      if(ms>P.lean0&&ms<o.t) { const k=ez(seg(ms,P.lean0,P.lean1)); f.ox=k*14; f.oy=k*2; f.spin=0; f.spinAt=performance.now(); }
      else if(ms>=o.t&&ms<P.end-100) { const k=seg(ms,o.t,o.t+600); f.ox=lerp(14,-16,ez(k)); f.oy=-Math.sin(k*Math.PI)*46; f.spin=k<1?-Math.sin(k*Math.PI)*.4:Math.sin(ms/160)*.08; f.spinAt=performance.now();
        if(k>=1) for(let j=0;j<3;j++) { const a=ms/300+j*2.1; star(q.x+f.ox+Math.cos(a)*q.w*.35,q.top+4+Math.sin(a)*6,4,j%2?GOLD:'#fffbe6'); } } }
  }});
  const steal=()=>order.forEach((o,i)=>{ ST.fly((x,y)=>{ star(x,y,7,i%2?'#aef0ff':GOLD); },o.q.x,o.q.top+10,sR.x,sR.b-RH*.6,.5,50,i*.1); });
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom packs his carry-on. Rose has a plan.'); B2.aim=null; S('click'); }],
    [P.hop,()=>{ S('pop'); }],
    [P.roll0,()=>{ S('creak'); setMessage('Tom wheels his carry-on right up to the monsters. There\'s a lump under the blanket.'); }],
    [P.tline,()=>{ say('tom','tomborose2'); }],
    [P.lean0,()=>{ order.forEach((o,i)=>word('?',o.q.x+10,o.q.top-16,CREAM,4,.9)); setMessage('The monsters lean in. Two little sneakers wiggle.'); S('squeak'); }],
    [P.wig,()=>{ S('giggle'); }],
    [P.boo,()=>{ say('rose','tombo2'); S('boo'); S('boing'); battle.shakeEnemy=.6;
      word('BOO!!',cl(cx,80,500),Math.max(66,top(gb)-RH-110),PINK,7,.95); setMessage('BOO!! Rose pops out with Lamby!');
      ST.fly((x,y,uu)=>{ gfx.globalAlpha=1-uu; EO(x,y,26,10,BLANK); R(x-20,y-2,40,3,BLANK2); gfx.globalAlpha=1; },cx,top(gb)-14,cx+90,-30,.7,30,0,{spin:.6}); }],
    [P.rasp,()=>{ S('raspberry'); word('PBBBT!',cl((GR.x0+GR.x1)/2,90,480),Math.max(66,GR.top-40),PINK,5,.9); setMessage('...and a GIANT raspberry.'); }],
    [P.rasp+420,()=>{ S('raspberry'); }],
    [P.steal,()=>{ steal(); S('pickup'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); scene('glow',.9,{x:sT.x,y:sT.b-TH*.5,rx:38,ry:52,c:'#d8f0ff',a:.35}); scene('glow',.9,{x:sR.x,y:sR.b-RH*.5,rx:28,ry:40,c:'#d8f0ff',a:.35}); }],
    [P.home0,()=>{ S('creak'); }],
  ];
  order.forEach((o,i)=>steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.6); scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:50,c:PINK,w:3}); landHit(100/order.length); }]));
  steps.push(['hf',order.length?order[0].t:P.boo+100]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.oy=0; o.f.ox=0; o.f.spin=0; } return (E2.result||'')+' Rose was under there the whole time.'; }]);
  ST.play(E2,steps);
};
// ---------- Wing Walk (Tom + Amy, tier 2) ----------
// The stage turns into the top of a plane over the clouds. Tom stays in his lie-flat Seat 1A, eye mask on, and holds
// Amy's safety rope out the window. Amy sprints down the wing into the wind calling split times and kicks every monster
// off the end. At the wingtip the rope goes taut and Tom reels her back in without sitting up. The monsters blow back in
// at the back of the line. Effects unchanged: Kinetic hit on every enemy, back row, they lose time, PEP Up for the party.
const SKY='#8fd0f4',SKY2='#d6efff',HULL='#eef2f6',HULL2='#c9d2e0',NAVY2='#1d3a8a',WINGC='#b8bec8',WINGC2='#8e96a4',SKINT='#e9b48a';
B2_TOMBO_ANIM.amy2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),A=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const others=party.filter(p=>p!==tom&&p!==pt).map(p=>ST.unit(p));
  const fx0=cl(Math.min(T.x,A.x,...others.map(o=>o.x))-48,GR.x1+70,470);   // where the fuselage starts (the wing root)
  const wBack=cl(Math.min(...(GR.list||[{base:200}]).map(q=>q.base))-10,120,280),wY=cl(GR.base+6,230,312),tipX=Math.max(14,Math.min(GR.x0-24,60)),rootX=fx0-14;
  const podX=Math.min(fx0+84,500),podY=cl(Math.min(...party.map(p=>ST.unit(p).top))-6,128,190),lieSc=.72,lieB=podY-22+TH*lieSc/2;
  // Amy's run: root, then a kick at each monster from nearest to farthest, then the wingtip.
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  const GO=1900,SPD=.42,KICK=260; let t=GO,x=rootX; const legs=[];
  order.forEach(o=>{ const kx=Math.max(tipX+30,o.q.x+o.q.w*.42+12),d=Math.max(0,x-kx),dur=Math.max(220,d/SPD); legs.push({t0:t,t1:t+dur,x0:x,x1:kx}); t+=dur; o.t=t; o.kx=kx; legs.push({t0:t,t1:t+KICK,x0:kx,x1:kx,kick:true}); t+=KICK; x=kx; });
  { const d=Math.max(0,x-tipX-8),dur=Math.max(200,d/SPD); legs.push({t0:t,t1:t+dur,x0:x,x1:tipX+8}); t+=dur; }
  const P={lie:520,aline:1000,tline:1450,go:GO,tip:t,yank:t+450,land:t+1150,pr:t+1250,apply:t+300,ret:t+600,home:t+1900,end:t+2700,skyOff:t+2200};
  P.ret1=P.ret+800;
  const sT={x:T.x,b:T.base},sA={x:A.x,b:A.base,f:asp.idle,rot:0};
  // Tom: walks into his pod and lies flat (head toward home), then gets up at the end.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.lie) { const k=ez(seg(ms,0,P.lie-40)); return {cx:lerp(c.origX,podX+8,k),base:lerp(c.origBase,podY,k)-Math.sin(k*Math.PI)*40,frame:sp.celeb,noShadow:k>.3}; }
    if(ms<P.home) return {cx:podX+8,base:lieB,frame:sp.idle,rot:Math.PI/2,sc:lieSc,noShadow:true};
    const k=ez(seg(ms,P.home,P.home+500)); return {cx:lerp(podX+8,c.origX,k),base:lerp(podY,c.origBase,k)-Math.sin(k*Math.PI)*40,frame:k<1?sp.celeb:sp.idle,noShadow:k<.7}; });
  // Amy: jogs to the wing root, stretches, sprints and kicks, teeters at the tip, gets reeled back, celebrates, home.
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=rootX,y=wY,f=sp.flip||sp.idle,rot=0;
    if(ms<700) { const k=ez(ms/700); x=lerp(c.origX,rootX,k); y=lerp(c.origBase,wY,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.go) { f=ms<1300?sp.aim:(ms<1650?sp.hip:sp.wind); if(ms>1650) x+=Math.sin(ms/40)*1.5; }
    else if(ms<P.tip) { const L=legs.find(l=>ms<l.t1)||legs[legs.length-1],k=seg(ms,L.t0,L.t1);
      if(L.kick) { x=L.x0; f=k<.7?sp.act:sp.wind; y-=Math.sin(k*Math.PI)*10; rot=-.08*Math.sin(k*Math.PI); }
      else { x=lerp(L.x0,L.x1,k); f=runFr(sp,c.t*1.3,-1); y-=Math.abs(Math.sin(c.t*18))*4; rot=-.12; } }
    else if(ms<P.yank) { x=tipX+8; f=sp.spread; rot=Math.sin(ms/55)*.22; }
    else if(ms<P.land) { const k=seg(ms,P.yank,P.land); x=lerp(tipX+8,rootX,ez(k)); y=wY-Math.sin(k*Math.PI)*90; f=sp.spread; rot=-k*Math.PI*2; }
    else if(ms<P.home) { x=rootX; f=sp.celeb; if(ms<P.land+600) y-=Math.abs(Math.sin(seg(ms,P.land,P.land+600)*Math.PI*2))*14; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(rootX,c.origX,k); y=lerp(wY,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sA.x=x; sA.b=y; sA.f=f; sA.rot=rot; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.yank&&ms<P.land}; });
  const skyK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.skyOff,P.end-80)));
  // Behind everyone: sky, streaming clouds, the fuselage with its windows, the wing under the monsters, the pod's bed.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=skyK(ms); if(k<=0) return; gfx.globalAlpha=k;
    const g=gfx.createLinearGradient(0,0,0,324); g.addColorStop(0,SKY); g.addColorStop(1,SKY2); gfx.fillStyle=g; gfx.fillRect(0,0,576,324);
    for(let j=0;j<9;j++) { const yy=30+j*31,sp=.5+(j%3)*.35,xx=((j*97+ms*sp)%760)-120; E(xx,yy,34+(j%2)*18,9+(j%3)*3,'#ffffff'); E(xx-24,yy+3,20,7,'#ffffff'); }
    gfx.globalAlpha=k*.6; for(let j=0;j<12;j++) { const yy=20+j*25,xx=((j*61+ms*1.4)%700)-80; Ln(xx,yy,xx+36,yy,2,'#ffffff'); } gfx.globalAlpha=k;
    // fuselage
    R(fx0-4,52,600-fx0,272,OUT); R(fx0,56,600-fx0,268,HULL); E(fx0+2,190,10,134,HULL); R(fx0,214,600-fx0,8,NAVY2); R(fx0,226,600-fx0,3,'#d8323a');
    for(let wx=fx0+26;wx<576;wx+=42) { if(wx>podX-90&&wx<podX+70) continue; RO(wx,96,22,30,'#3a5a8a'); R(wx+3,99,7,24,'#9fd0f0'); }
    // the big window of Seat 1A, the cabin behind it
    RO(podX-66,podY-82,132,90,'#3a5a8a'); R(podX-62,podY-78,124,82,'#f4ecd8'); R(podX-62,podY-78,124,10,'#e2d6bc'); R(podX-62,podY-4,124,8,'#c9b896');
    if(podY-82>84) label('GROUP ZERO',Math.min(520,fx0+120),70,NAVY2,2);
    // the wing: a wide grey deck under every monster, root at the fuselage, winglet at the tip
    const wB=wBack,F0=wY+16;
    gfx.fillStyle=OUT; gfx.beginPath(); gfx.moveTo(tipX-4,wY+10); gfx.lineTo(tipX+46,wB-4); gfx.lineTo(fx0+4,wB-14); gfx.lineTo(fx0+4,F0+4); gfx.closePath(); gfx.fill();
    gfx.fillStyle=WINGC; gfx.beginPath(); gfx.moveTo(tipX,wY+7); gfx.lineTo(tipX+48,wB); gfx.lineTo(fx0,wB-10); gfx.lineTo(fx0,F0); gfx.closePath(); gfx.fill();
    gfx.fillStyle=WINGC2; gfx.beginPath(); gfx.moveTo(tipX,wY+7); gfx.lineTo(fx0,F0); gfx.lineTo(fx0,F0-5); gfx.lineTo(tipX+6,wY+3); gfx.closePath(); gfx.fill();
    for(let j=1;j<4;j++) { const q=j/4; Ln(lerp(tipX+48,fx0,q),lerp(wB,wB-10,q),lerp(tipX,fx0,q),lerp(wY+7,F0,q),1.5,'#a2a9b4'); }
    RO(tipX+40,wB-40,8,40,WINGC); R(tipX+41,wB-39,3,12,'#d8323a');
    label('NO STEP',lerp(tipX+48,fx0,.82),lerp(lerp(wB,wB-10,.82),F0,.55)-6,'#8a2a2a',2);
    // the pod by the window
    RO(podX-54,podY-14,108,12,NAVY2); R(podX-52,podY-2,104,10,'#14204a'); R(podX-50,podY-12,100,4,'#3a5aa8'); RO(podX+40,podY-40,12,28,NAVY2);
    gfx.globalAlpha=1; }});
  // Where each monster is: kicked off the wingtip, gone, then blown back in at the back of the line.
  const foeAt=(o,ms)=>{ if(ms<o.t) return null;
    if(ms<o.t+800) { const k=seg(ms,o.t,o.t+800); return {x:lerp(o.q.x,-90,ez(k)),b:o.q.base-Math.sin(k*Math.PI)*90-k*30,spin:-k*Math.PI*3}; }
    if(ms<P.ret) return {x:-200,b:o.q.base,spin:0};
    const cur=ST.foe(o.f),k=ez(seg(ms,P.ret,P.ret1)); return {x:lerp(-90,cur.x,k),b:lerp(cur.base-60,cur.base,k)-Math.sin(k*Math.PI)*20,spin:(1-k)*Math.PI*2,done:k>=1}; };
  const rope=(x0,y0,x1,y1,taut)=>{ const mx=(x0+x1)/2,my=Math.max(y0,y1)+(taut?0:36); gfx.lineCap='round';
    for(const [w,c] of [[5,OUT],[2.5,'#e8d27a']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.quadraticCurveTo(mx,my,x1,y1); gfx.stroke(); } };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    for(const o of order) { const p=foeAt(o,ms); if(!p) continue; const cur=ST.foe(o.f);
      if(p.done) { o.f.ox=0; o.f.oy=0; o.f.spin=0; continue; }
      o.f.ox=p.x-cur.x; o.f.oy=p.b-cur.base; o.f.spin=p.spin; o.f.spinAt=performance.now(); }
    if(ms>P.lie&&ms<P.home) { const x=podX,y=podY;
      RO(x-52,y-50,70,36,'#eef2f6'); R(x-52,y-50,70,4,'#c9d2e0'); for(let j=0;j<3;j++) R(x-44+j*20,y-30,8,2,'#c9d2e0');
      R(x-52,y-18,104,16,NAVY2); R(x-52,y-6,104,4,'#3a5aa8'); RO(x+18,y-31,16,6,NAVY2);
      // his arm out of the duvet, holding the rope, and the rope out to Amy
      const reel=ms>P.yank&&ms<P.land?Math.sin(seg(ms,P.yank,P.land)*Math.PI*6)*5:0,hx=x-20-reel,hy=y-64;
      if(ms>900) { const ax=sA.x+4,ay=sA.b-AH*.5; rope(hx,hy,ax,ay,ms>P.tip-200&&ms<P.land); EO(ax,ay,3,3,'#e8d27a'); }
      Ln(x-6,y-44,hx,hy,7,OUT); Ln(x-6,y-44,hx,hy,4,SKINT); EO(hx,hy,4,4,SKINT);
      for(let j=0;j<3;j++) { const q=((ms/1250+j/3)%1); gfx.globalAlpha=1-q; label('Z',x+30+q*24+j*2,y-56-q*30,CREAM,1+(j===2?1:0)); } gfx.globalAlpha=1; }
    // wind lines off Amy while she sprints
    if(ms>P.go&&ms<P.tip) { gfx.globalAlpha=.85; for(let j=0;j<3;j++) { const yy=sA.b-AH*(.3+j*.22),xx=sA.x+16+((ms/3+j*17)%30); Ln(xx,yy,xx+22,yy,2.5,'#ffffff'); } gfx.globalAlpha=1; }
  }});
  const split=ms=>{ const s=(ms-P.go)/1000; return '0:'+(s<10?'0':'')+s.toFixed(1); };
  const steps=[
    [0,()=>{ setMessage('TOMBO! Wing Walk. Somewhere above the clouds.'); B2.aim=null; S('jet'); }],
    [P.lie,()=>{ S('ding'); setMessage('Tom takes Seat 1A. Lie flat. Eye mask on.'); }],
    [800,()=>{ word('LIE FLAT',podX,podY+22,CREAM,2,1); }],
    [P.aline,()=>{ say('amy','tombo2'); setMessage('Amy ties the safety rope on and hands Tom the other end.'); }],
    [P.tline,()=>{ say('tom','tomboamy2'); }],
    [P.go,()=>{ S('whoosh'); word('GO!',rootX-20,wY-AH-30,GOLD,5,.8); setMessage('Amy sprints down the wing. Into the wind.'); }],
    [P.tip,()=>{ S('squeak'); word('!!',tipX+20,wY-AH-26,RED,5,.6); setMessage('End of the wing. The rope goes tight.'); }],
    [P.apply,()=>{ E2.apply(); }],
    [P.yank,()=>{ S('reel'); S('whoosh'); setMessage('Tom reels her in. He doesn\'t sit up.'); }],
    [P.land,()=>{ S('thud'); scene('dust',.5,{x:rootX,y:wY,n:6,sp:20,up:8}); }],
    [P.pr,()=>{ word('NEW PR!',cl(rootX-40,90,480),Math.max(70,wY-AH-50),GOLD,5,1.3); S('fanfare'); for(const p of party) glowOn(p); }],
    [P.ret,()=>{ S('whoosh'); setMessage('The monsters blow back in. At the back of the line.'); }],
    [P.home,()=>{ S('creak'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); S('thud'); ST.jolt(o.f,.6); battle.shakeEnemy=.5; scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:50,c:CREAM,w:3});
      word(['KICK!','WHAM!','BOOT!','KICK!!'][i%4],o.q.x,Math.max(60,o.q.top-40),GOLD,4,.7); word('SPLIT '+split(o.t),cl(o.kx+30,80,500),Math.min(316,wY+34),'#ffffff',2,.9);
      landHit(Math.floor(100/order.length)+(i<100%order.length?1:0)); }]); });
  steps.push(['hf',order.length?order[0].t:P.go+300]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Amy says the wind was against her. She still set a record.'; }]);
  ST.play(E2,steps);
};

// ---------- Nobody Gets Past Us (Tom + Boppy, tier 2) ----------
// Father and son walk to the front and stand shoulder to shoulder. Boppy jangles a ring of keys and a jail-cell door
// with bars slams down in front of the family, Rikers style. Every monster charges and bonks into the bars. Boppy's
// back hurts. Effects unchanged: Chatter hit on every enemy that stops their wind-ups; the party is Shielded 3 turns.
const STEEL='#7a828e',STEEL2='#a8b0bc',STEEL3='#4f5660';
B2_TOMBO_ANIM.boppy2=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),Bp=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const dW=74,dL=cl(GR.x1+16,110,Math.min(T.x,Bp.x)-170),dR=dL+dW,by=cl(Math.max(GR.base,T.base-10)+6,240,312),dTop=Math.max(26,Math.min(GR.top,by-TH)-70);
  const bx=dR+32,tx=dR+84;
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  const B0=2500,BP=480;
  order.forEach((o,i)=>{ o.c0=B0+i*BP; o.t=o.c0+320; o.dx=Math.max(0,dL-6-(o.q.x+o.q.w/2)); });
  const E0=order.length?order[order.length-1].t+300:B0+300;
  const P={walk:700,bline:950,keys:1500,drop:1750,slam:2000,back:E0+150,apply:E0+500,tline:E0+1100,lift:E0+1900,home:E0+2300,end:E0+3000};
  const sT={x:T.x,b:T.base},sB={x:Bp.x,b:Bp.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { f=ms>P.slam&&ms<P.slam+300?sp.expr:(ms>P.tline&&ms<P.tline+900?sp.act:sp.idle); if(ms>P.slam&&ms<P.slam+200) y-=Math.sin(seg(ms,P.slam,P.slam+200)*Math.PI)*8; }
    else { const k=ez(seg(ms,P.home,P.home+600)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=bx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,bx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) {
      if(ms<P.keys) f=sp.hip; else if(ms<P.slam+200) f=sp.throw||sp.act; else if(ms<P.back) f=ms>B0?sp.expr:sp.idle;
      else if(ms<P.back+700) f=sp.kneel||sp.idle; else f=sp.hip; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(bx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sB.x=x; sB.b=y; sB.f=f; return {cx:x,base:y,frame:f}; });
  // The door: drops from the top, slams, rattles on each bonk, lifts away at the end.
  let rattle=0;
  const doorY=ms=>{ if(ms<P.drop) return null; const H=by-dTop;
    if(ms<P.slam) return dTop-H+H*Math.pow(seg(ms,P.drop,P.slam),2.2);
    if(ms<P.lift) return dTop+(ms<P.slam+180?-Math.sin(seg(ms,P.slam,P.slam+180)*Math.PI)*8:0);
    return dTop-(by-dTop+40)*ez(seg(ms,P.lift,P.lift+400)); };
  const door=(top,ms)=>{ const h=by-dTop,wob=rattle>0?Math.sin(ms/18)*rattle*3:0,x0=dL+wob;
    gfx.globalAlpha=.35*cl(1-(dTop-top)/80); E(dL+dW/2,by+3,dW*.7,6,'#000000'); gfx.globalAlpha=1;
    RO(x0,top,dW,8,STEEL); RO(x0,top+h-10,dW,8,STEEL); RO(x0,top+h*.45,dW,6,STEEL);
    for(let j=0;j<6;j++) { const bx2=x0+4+j*(dW-8)/5; R(bx2-3,top,6,h,OUT); R(bx2-2,top,4,h,STEEL2); R(bx2-2,top,1.5,h,'#d8dee6'); }
    RO(x0-6,top-4,8,h+4,STEEL3); RO(x0+dW-2,top-4,8,h+4,STEEL3);
    RO(x0+dW-22,top+h*.45-14,18,24,STEEL3); E(x0+dW-13,top+h*.45-4,3,3,OUT); R(x0+dW-14,top+h*.45-3,2,6,OUT);
    RO(x0+6,top+12,dW-12,12,'#e8e0c8'); label('CELL R',x0+dW/2,top+15,'#3a2a22',1); };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(rattle>0) rattle=Math.max(0,rattle-.04);
    // the monsters charge and bonk into the bars, then sit there seeing stars
    for(const o of order) { const f=o.f; if(ms<o.c0||ms>P.end-80) continue;
      if(ms<o.t) { const k=seg(ms,o.c0,o.t); f.ox=o.dx*k*k; f.oy=-Math.abs(Math.sin(k*Math.PI*3))*6; f.spin=-.15; }
      else if(ms<o.t+400) { const k=seg(ms,o.t,o.t+400); f.ox=lerp(o.dx,o.dx*.4,ez(k)); f.oy=-Math.sin(k*Math.PI)*24; f.spin=.4*Math.sin(k*Math.PI); }
      else if(ms<P.lift) { f.ox=o.dx*.4; f.oy=0; f.spin=Math.sin(ms/150)*.08;
        for(let j=0;j<3;j++) { const a=ms/280+j*2.1; star(o.q.x+f.ox+Math.cos(a)*o.q.w*.32,o.q.top+6+Math.sin(a)*6,4,j%2?GOLD:'#fffbe6'); } }
      else { const k=ez(seg(ms,P.lift,P.home)); f.ox=o.dx*.4*(1-k); f.oy=0; f.spin=0; }
      f.spinAt=performance.now(); }
    const y=doorY(ms); if(y!=null&&y>-400) door(y,ms);
    // Boppy's key ring
    if(ms>P.keys-200&&ms<P.slam+400) { const h=handPt(bsp,sB.f,sB.x,sB.b,-1),sw=Math.sin(ms/50)*.5;
      gfx.save(); gfx.translate(h.x,h.y); gfx.rotate(sw); ring(0,6,6,6,3,OUT); ring(0,6,6,6,1.5,'#c9a23a');
      for(let j=0;j<3;j++) { const a=-.6+j*.6; gfx.save(); gfx.translate(Math.sin(a)*6,12+Math.cos(a)*4); gfx.rotate(a); RO(-1.5,0,3,10,'#d8c06a'); gfx.restore(); } gfx.restore(); }
  }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Boppy and Tom walk up front. Shoulder to shoulder.'); B2.aim=null; S('step'); }],
    [P.bline,()=>{ say('boppy','tombo2'); }],
    [P.keys,()=>{ S('jangle'); word('JANGLE',bx-6,by-BH-28,CREAM,2,.7); setMessage('Boppy pulls out his keys. He knows exactly which one.'); }],
    [P.drop,()=>{ S('whoosh'); }],
    [P.slam,()=>{ S('clang'); S('thud'); battle.shakeEnemy=.6; rattle=1; scene('dust',.6,{x:dL+dW/2,y:by+2,n:10,sp:40,up:10});
      word('CLANG!',dL+dW/2,Math.max(60,dTop-14),'#ffffff',6,1.1); setMessage('A jail-cell door slams down in front of the family.'); }],
    [B0-150,()=>{ setMessage('The monsters charge. They don\'t read the sign.'); }],
    [P.back,()=>{ S('sulk'); word('MY BACK.',bx-10,by-BH-24,CREAM,3,1); setMessage('Boppy’s back is acting up. The door is fine.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); scene('glow',.9,{x:sT.x,y:sT.b-TH*.5,rx:38,ry:52,c:'#aef0ff',a:.35}); scene('glow',.9,{x:sB.x,y:sB.b-BH*.5,rx:38,ry:52,c:'#aef0ff',a:.35});
      for(const p of party) if(p!==tom&&p!==pt) scene('glow',.9,{x:ST.unit(p).x,y:ST.unit(p).mid,rx:38,ry:52,c:'#aef0ff',a:.35}); }],
    [P.tline,()=>{ say('tom','tomboboppy2'); }],
    [P.lift,()=>{ S('jangle'); S('creak'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('clang'); S('bonk'); ST.jolt(o.f,.6); rattle=1; battle.shakeEnemy=.4;
      scene('tb_rings',.5,{x:dL,y:o.q.mid,r:36,c:'#ffffff',w:3}); word(['BONK!','CLANK!','DOINK!','BONK!!'][i%4],o.q.x+o.dx,Math.max(60,o.q.top-40),GOLD,4,.7);
      landHit(Math.floor(100/order.length)+(i<100%order.length?1:0)); }]); });
  steps.push(['hf',order.length?order[0].t:P.slam]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Nobody got past them.'; }]);
  ST.play(E2,steps);
};

// ================= Task T: tier-3 Primary Tombos =================
// 75% HEART, the biggest team-ups. Letterbox bars (front layer, alpha reset first: the letterbox gotcha) and a dimmed
// stage behind everyone set them apart from tiers 1 and 2.
const BARH=22;
const bars=k=>{ if(k<=0) return; gfx.globalAlpha=1; const h=BARH*k; R(0,0,576,h,'#05060a'); R(0,324-h,576,h,'#05060a'); };
const dim=(k,c,a)=>{ if(k<=0) return; gfx.globalAlpha=k*a; R(0,0,576,324,c); gfx.globalAlpha=1; };
// The gold dumpling as a see-through memory: the squishy's pixel art (SQUISHY, engine/intro.js), washed pale gold, drawn
// once to its own canvas so it can fade as one piece.
let ghostImg=null;
const ghostDumpling=()=>{ if(ghostImg) return ghostImg; const rows=SQUISHY,w=rows[0].length,h=rows.length,P=3,c=document.createElement('canvas');
  c.width=w*P; c.height=h*P; const g=c.getContext('2d'),mix=(a,b,t)=>{ const p=x=>parseInt(x,16),A=a.slice(1),B=b.slice(1),o=[0,2,4].map(i=>Math.round(lerp(p(A.substr(i,2)),p(B.substr(i,2)),t)));
    return 'rgb('+o.join(',')+')'; };
  for(let r=0;r<h;r++) for(let q=0;q<w;q++) { const ch=rows[r][q]; if(ch==='.') continue; g.fillStyle=mix(SQUISHY_PAL[ch],'#fff4c0',ch==='o'?.2:.35); g.fillRect(q*P,r*P,P,P); }
  return ghostImg=c; };
// x,y: its middle. a: opacity. sq: squash (0 round, + flat). Glints and a soft halo are drawn live.
const memory=(x,y,sc,a,sq=0)=>{ if(a<=0) return; const img=ghostDumpling(),sx=sc*(1+sq*.5),sy=sc*(1-sq*.45),w=img.width*sx,h=img.height*sy,t=performance.now()/1000;
  gfx.globalAlpha=a*.28; E(x,y,w*.7,h*.75,GOLD); gfx.globalAlpha=a*.18; E(x,y,w*.95,h,'#fff4c0');
  gfx.globalAlpha=a*(.78+.08*Math.sin(t*4)); const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=false; gfx.drawImage(img,x-w/2,y-h/2,w,h); gfx.imageSmoothingEnabled=sm;
  for(let k=0;k<4;k++) { const ph=(t*1.2+k/4)%1; gfx.globalAlpha=a*(1-Math.abs(ph-.5)*2); star(x+[-.32,.3,.05,-.1][k]*w,y+[-.2,-.1,-.42,.25][k]*h,2+ph*4*Math.min(2,sc),k%2?'#aef0ff':'#fffbe6'); }
  gfx.globalAlpha=1; };

// ---------- The Golden Dumpling Wish (Tom + Grace, tier 3) ----------
// Grace holds up the golden wish dumpling. It wakes like a grumpy genie (eyes, mouth, a tiny voice), Tom wishes far too loudly
// and gets squished flat, then the dumpling bursts into mini dumplings that rain on everyone: they bonk every monster, and
// one lands in a fallen friend's mouth. Group hug.
// Effects: Sparkle hit on every enemy (warms them), fallen friends up at 50%, party heals 60% and loses its debuffs, Trending locks for 3 turns.
B2_TOMBO_ANIM.grace3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,gsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,GH=gsp.idle.length*gsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+34,gx=mx-34;
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  const B0=4900,BP=300;
  order.forEach((o,i)=>{ o.t=B0+i*BP; });
  const last=order.length?order[order.length-1].t:B0;
  const P={walk:650,gline:800,rise:1700,wake:2200,gren:2900,tline:3300,squash:3700,flat:4000,burst:4400,apply:last+250,hug:last+600,home:last+1500,end:last+2200};
  const sky={x:GR.x,y:Math.max(64,GR.top-60)},hold={x:mx,y:by-GH-44};
  const sT={x:T.x,b:T.base,f:tsp.idle},sG={x:gx,b:by,f:gsp.flip};
  const flatK=ms=>ez(seg(ms,P.squash,P.squash+140))*(1-ez(seg(ms,P.flat+500,P.flat+800)));
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { f=ms>P.tline-100&&ms<P.squash?sp.act:(ms>P.hug?sp.celeb:sp.idle); if(ms>P.hug&&ms<P.hug+500) y-=Math.abs(Math.sin(seg(ms,P.hug,P.hug+500)*Math.PI*2))*8; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f,hide:flatK(ms)>.02}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,actR=sp.act?mirrorRowsCached(sp,'act'):sp.flip; let x=gx,y=by,f=sp.flip;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,gx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.hug) { f=ms>P.gline&&ms<P.wake?actR:sp.flip; if(ms>P.burst&&ms<P.burst+900) f=sp.celebFlip||sp.flip; }
    else if(ms<P.home) { const k=ez(seg(ms,P.hug,P.hug+300)); x=lerp(gx,tx-20,k); f=sp.celebFlip||sp.flip; if(ms<P.hug+600) y-=Math.abs(Math.sin(seg(ms,P.hug,P.hug+600)*Math.PI*2))*10; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx-20,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sG.x=x; sG.b=y; sG.f=f; return {cx:x,base:y,frame:f}; });
  const shade=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=shade(ms); if(k<=0) return; dim(k,'#3a2a10',.35); gfx.globalAlpha=1; }});
  const GEMC=['#ffe27a','#fffbe6','#ffd0ec','#aef0ff','#ffb347'];
  // The dumpling's position, size, squash and whether its face shows.
  const dumAt=ms=>{ if(ms<P.walk+100||ms>=P.burst) return null;
    const a=ez(seg(ms,P.walk+100,P.walk+500));
    if(ms<P.rise) return {x:hold.x,y:hold.y+20-ez(seg(ms,P.walk+100,P.rise))*20,sc:.8,a,sq:0,face:0};
    if(ms<P.gren) { const k=ez(seg(ms,P.rise,P.wake)); const w=ms>P.wake?Math.sin((ms-P.wake)/70)*(1-seg(ms,P.wake,P.gren)*.5):0;
      return {x:hold.x+w*5,y:lerp(hold.y+8,hold.y-20,k),sc:lerp(.8,1.7,k),a:1,sq:w*.12,face:ms>P.wake?1:0}; }
    if(ms<P.squash) { const k=seg(ms,P.gren,P.squash); return {x:hold.x,y:hold.y-20-Math.sin(k*Math.PI)*4,sc:1.7+k*.5,a:1,sq:0,face:1,shout:ms>P.tline}; }
    if(ms<P.flat+300) { const k=ez(seg(ms,P.squash,P.squash+140)); return {x:lerp(hold.x,sT.x,k),y:lerp(hold.y-20,sT.b-TH*.55,k),sc:1.9,a:1,sq:k*.45,face:1,shout:1}; }
    const k=seg(ms,P.flat+300,P.burst); return {x:sT.x,y:sT.b-TH*.55-ez(k)*(TH*.9),sc:1.9+k*.7,a:1,sq:(1-k)*.45,face:1,shout:1}; };
  const dumpling=(d,ms)=>{ const img=ghostDumpling(),sx=d.sc*(1+d.sq*.5),sy=d.sc*(1-d.sq*.45),w=img.width*sx,h=img.height*sy;
    gfx.globalAlpha=d.a*.35; E(d.x,d.y,w*.75,h*.8,GOLD); gfx.globalAlpha=d.a;
    const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=false; gfx.drawImage(img,d.x-w/2,d.y-h/2,w,h); gfx.imageSmoothingEnabled=sm;
    if(d.face) { const ex=w*.17,ey=d.y-h*.05,blink=Math.sin(ms/400)>.93; // grumpy genie: heavy brows, small mouth
      R(Math.round(d.x-ex-2),Math.round(ey-1),4,blink?1:3,'#3a2210'); R(Math.round(d.x+ex-2),Math.round(ey-1),4,blink?1:3,'#3a2210');
      R(Math.round(d.x-ex-3),Math.round(ey-4),6,2,'#3a2210'); R(Math.round(d.x+ex-3),Math.round(ey-4),6,2,'#3a2210');
      if(d.shout) { R(Math.round(d.x-4),Math.round(ey+h*.2),8,5,'#3a2210'); R(Math.round(d.x-2),Math.round(ey+h*.2+3),4,2,'#e0707a'); }
      else R(Math.round(d.x-4),Math.round(ey+h*.2),8,2,'#3a2210'); }
    for(let k=0;k<4;k++) { const ph=(ms/800+k/4)%1; gfx.globalAlpha=d.a*(1-Math.abs(ph-.5)*2); star(d.x+[-.36,.34,.05,-.1][k]*w,d.y+[-.3,-.1,-.5,.35][k]*h,2+ph*3,k%2?'#aef0ff':'#fffbe6'); }
    gfx.globalAlpha=1; };
  // mini dumplings: a shower from the sky; the first few land on the monsters, the last one in Rose's (or the first fallen friend's) mouth
  const fallen=B2.party.filter(p=>p.hp<=0);
  const minis=[]; for(let j=0;j<22;j++) { const a=(j*0.618)%1; minis.push({x:lerp(GR.x0-20,tx+40,a),t0:P.burst+((j*37)%10)*40,dur:520+(j%5)*70,sz:2+j%3}); }
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // Tom, flat as a pancake
    const fk=flatK(ms); if(fk>.02) { gfx.save(); gfx.translate(sT.x,sT.b); gfx.scale(1+fk*.7,1-fk*.82); const w=sT.f[0].length*tsp.scale; drawSprite(sT.f,tsp.pal,-w/2,-sT.f.length*tsp.scale,tsp.scale); gfx.restore(); }
    const d=dumAt(ms); if(d) dumpling(d,ms);
    // genie lines as tiny pixel text next to the dumpling
    if(d&&ms>P.gren-100&&ms<P.tline) { gfx.globalAlpha=ez(seg(ms,P.gren-100,P.gren+100)); star(d.x+30,d.y-30,2,GOLD); gfx.globalAlpha=1; }
    // ground puff when the squash lands
    if(ms>P.squash+100&&ms<P.squash+500) { const k=seg(ms,P.squash+100,P.squash+500); gfx.globalAlpha=1-k; E(sT.x-24-k*14,sT.b-4,6+k*5,3+k*3,'#fffbe6'); E(sT.x+24+k*14,sT.b-4,6+k*5,3+k*3,'#fffbe6'); gfx.globalAlpha=1; }
    // mini dumplings falling
    if(ms>P.burst&&ms<P.home) for(const m of minis) { const k=(ms-m.t0)/m.dur; if(k<=0||k>=1.15) continue; const y=lerp(sky.y-30,GR.base-10,k*k),a=k>1?1-(k-1)/.15:1; gfx.globalAlpha=a;
      E(m.x,y,m.sz*2.4,m.sz*1.8,'#ffd45a'); E(m.x,y-m.sz*.5,m.sz*1.6,m.sz,'#fff1b0'); } gfx.globalAlpha=1;
    // bonk stars on each monster
    for(const o of order) if(ms>o.t&&ms<o.t+500) { const k=seg(ms,o.t,o.t+500); gfx.globalAlpha=1-k; for(let j=0;j<4;j++) star(o.q.x+Math.cos(j*1.57+k*3)*(10+k*14),o.q.top+4+Math.sin(j*1.57+k*3)*5-k*10,3,GEMC[j]); } gfx.globalAlpha=1;
    // the mouth catch: a mini dumpling drops into a fallen friend
    if(ms>P.apply&&ms<P.apply+700) { const k=seg(ms,P.apply,P.apply+700); const tgtp=fallen[0]; if(tgtp) { const q=ST.unit(tgtp); gfx.globalAlpha=1-k*k; E(q.x,lerp(q.mid-90,q.mid-8,ez(k)),5,4,'#ffd45a'); gfx.globalAlpha=1; } }
    if(ms>P.hug+200&&ms<P.home) for(let j=0;j<3;j++) { const q=((ms-P.hug)/900+j/3)%1; gfx.globalAlpha=1-q; heart(sT.x-12+j*10,sT.b-TH-8-q*30,4+j%2*2,PINK); }
    gfx.globalAlpha=1; bars(ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.end-100)))); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! The Golden Dumpling Wish.'); B2.aim=null; S('levelChime'); }],
    [P.walk+100,()=>{ S('heal'); setMessage('Grace is holding the golden dumpling. It is sleeping.'); }],
    [P.gline,()=>{ say('grace','tombo3'); }],
    [P.rise,()=>{ S('slideWhistle'); setMessage('It floats up. It glows.'); }],
    [P.wake,()=>{ S('chime2'); word('...HM?',hold.x,Math.max(56,hold.y-60),GOLD,3,.9); setMessage('The dumpling opens one eye. It is grumpy.'); }],
    [P.gren,()=>{ S('boing'); word('WISH GRANTED... PROBABLY',hold.x,Math.max(40,hold.y-84),'#fffbe6',2,1.2); }],
    [P.tline,()=>{ say('tom','tombograce3'); }],
    [P.squash,()=>{ S('bonk'); S('boing'); battle.shakeEnemy=.2; word('TOO LOUD!',tx,Math.max(60,by-TH-30),'#ff8fd0',4,.9); setMessage('Tom wished too loudly. The dumpling sits on him.'); }],
    [P.burst,()=>{ S('levelChime'); S('fanfare'); scene('tb_rings',.9,{x:tx,y:by-TH,r:110,c:GOLD,w:4}); word('WISH!',GR.x,Math.max(56,sky.y-30),GOLD,5,1.2); setMessage('Pop! Tiny dumplings everywhere.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); S('chime2'); word('NOM!',(gx+tx)/2,by-GH-20,'#fffbe6',3,.8); for(const p of party) { const q=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sG.x,mid:sG.b-GH*.5}:ST.unit(p)); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
    [P.hug,()=>{ S('kiss'); setMessage('Group hug. Tom is still a little flat.'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.6); battle.shakeEnemy=.4; S('chime2'); scene('tb_rings',.5,{x:o.q.x,y:o.q.top,r:40,c:GOLD,w:3});
      word(['BONK!','DOINK!','PLOP!','BONK!!'][i%4],o.q.x,i%2?66:40,'#fffbe6',4,.4);
      landHit(Math.floor(100/order.length)+(i<100%order.length?1:0)); }]); });
  steps.push(['hf',order.length?order[0].t:P.burst]);
  steps.push([P.end,'end',()=>(E2.result||'')+' There are crumbs everywhere. Nobody minds.']);
  ST.play(E2,steps);
};

// ---------- Headphones in the Dark (Tom + Rose, tier 3) ----------
// The stage goes dark except for Rose, wearing Tom's big silver headphones; little notes float out of them. A gold sound
// ribbon reaches across the dark to Tom, who follows it to her and lifts her onto his shoulders. They press PLAY: the
// dark lifts as a gold sound wave sweeps the stage, and giant 8-bit notes rain down and pin every monster in place.
// Effects: Chatter hit on every enemy (they lose time and warm up), party heals 50%, Rose rides on Tom's shoulders.
let darkC=null;
const NOTE=['...##.','...#.#','...#..','...#..','...#..','.###..','####..','.##...'];
const note8=(x,y,u,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
  for(const pass of [0,1]) for(let r=0;r<NOTE.length;r++) for(let q=0;q<6;q++) if(NOTE[r][q]==='#') {
    const X=(q-3)*u,Y=(r-8)*u; if(pass===0) R(X-1.5,Y-1.5,u+3,u+3,OUT); else R(X,Y,u,u,(r>=5&&q===1&&r===6)?'#ffffff':c); }
  gfx.restore(); };
B2_TOMBO_ANIM.rose3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,rsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,RH=rsp.idle.length*rsp.scale;
  const pMin=Math.min(...party.map(p=>ST.unit(p).x));
  const rx=cl((GR.x1+pMin)/2-10,GR.x1+44,Math.max(GR.x1+44,pMin-70)),rb=cl(GR.base+4,236,304),tx=rx+30;
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  const N0=4300,NP=280;
  order.forEach((o,i)=>{ o.t=N0+i*NP; });
  const last=order.length?order[order.length-1].t:N0;
  const P={walk:700,rline:900,ribbon:1800,go:2100,arrive:2800,lift:3000,seat:3400,tline:3500,play:3900,light:4400,apply:last+250,clear:last+450,home:last+1300,end:last+2000};
  const sT={x:T.x,b:T.base,f:tsp.idle},sR={x:rx,b:rb,f:rsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=c.origX,y=c.origBase,f=sp.idle;
    if(ms<P.go) { f=ms>P.ribbon+150?sp.expr:sp.idle; }
    else if(ms<P.arrive) { const k=ez(seg(ms,P.go,P.arrive)); x=lerp(c.origX,tx,k); y=lerp(c.origBase,rb,k); f=k<1?runFr(sp,c.t*.8,-1):sp.idle; }
    else if(ms<P.home) { x=tx; y=rb; f=ms<P.seat?sp.act:(ms>P.play&&ms<P.play+500?sp.celeb:(ms>P.clear&&ms<P.clear+700?sp.celeb:sp.idle)); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(rb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  // Rose: walks into the middle of the dark, listens, then hops up onto Tom's shoulders and stays there (she sits: a path
  // parked on the riding spot is drawn seated, engine/rose-ride.js roseSeatNear).
  const seatPt=()=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx]; return d?{x:d.cx+2,y:d.base-d.h+20}:{x:sT.x+2,y:sT.b-TH+20}; };
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=rx,y=rb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,rx,k); y=lerp(c.origBase,rb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.lift) { f=ms>P.ribbon&&ms<P.arrive?sp.flip:sp.idle; if(ms>P.rline&&ms<P.rline+400) y-=Math.abs(Math.sin(seg(ms,P.rline,P.rline+400)*Math.PI*2))*6; }
    else if(ms<P.seat) { const k=seg(ms,P.lift,P.seat),s=seatPt(); x=lerp(rx,s.x,ez(k)); y=lerp(rb,s.y,ez(k))-Math.sin(k*Math.PI)*40; f=sp.celeb; }
    else { const s=seatPt(); x=s.x; y=s.y; f=sp.idle; }
    sR.x=x; sR.b=y; sR.f=f; return {cx:x,base:y,frame:f}; });
  const darkK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.play,P.light)));
  // Rose's headphones: a silver band over her head and two glowing cups (drawn on her seat once she is up).
  // cx,cy: the middle of her head at ear height; r: half the head's width.
  const phones=(cx,cy,r,a)=>{ if(a<=0) return; gfx.globalAlpha=a; gfx.lineCap='round';
    for(const [w,c] of [[6,OUT],[3,'#c9d2e0']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.arc(cx,cy,r,Math.PI*1.08,Math.PI*1.92); gfx.stroke(); }
    const pulse=.5+.5*Math.sin(performance.now()/140);
    for(const [dx,c] of [[-r,'#ff9ac0'],[r,'#8fd0ff']]) { gfx.globalAlpha=a; EO(cx+dx,cy+2,4.5,6,'#5a6270'); gfx.globalAlpha=a*(.6+.4*pulse); E(cx+dx,cy+2,2.6,3.8,c); } gfx.globalAlpha=1; };
  const RS=rsp.scale,RIDE=ROSE_RIDE.bt_idle;
  // The dark (front layer): drawn on its own canvas with soft holes for the light around Rose and, later, Tom.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    const seated=ms>=P.seat,rTop=seated?sR.b-20-RIDE.ay*RS:sR.b-RH;
    // little notes floating out of the headphones
    if(ms>P.walk&&ms<P.light+300) for(let j=0;j<4;j++) { const q=((ms-P.walk)/1100+j/4)%1; gfx.globalAlpha=(1-q)*(ms>P.play?1-seg(ms,P.play,P.light+300):1);
      note8(sR.x+(j%2?18:-18)+Math.sin(q*6+j)*8,rTop-q*50,2,j%2?'#8fd0ff':PINK,Math.sin(q*4)*.3); }
    gfx.globalAlpha=1;
    const k=darkK(ms);
    if(k>0) { if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const g=darkC.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,576,324); g.fillStyle='#050610'; g.fillRect(0,0,576,324);
      g.globalCompositeOperation='destination-out';
      const hole=(x,y,r)=>{ const gr=g.createRadialGradient(x,y,r*.35,x,y,r); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); };
      hole(sR.x,sR.b-RH*.5,62);
      if(ms>P.ribbon) { const r=62*ez(seg(ms,P.ribbon,P.ribbon+500)); hole(sT.x,sT.b-TH*.5,r+8); }
      g.globalCompositeOperation='source-over';
      gfx.globalAlpha=.9*k; gfx.drawImage(darkC,0,0); gfx.globalAlpha=1; }
    // the gold sound ribbon from her headphones to Tom, over the dark
    if(ms>P.ribbon&&ms<P.light) { const a=ez(seg(ms,P.ribbon,P.ribbon+400))*(1-seg(ms,P.play,P.light)),x0=sR.x,y0=rTop+8,x1=sT.x,y1=sT.b-TH*.6,n=24;
      for(const [w,c,al] of [[7,'#ffe9a0',.35],[3,GOLD,1]]) { gfx.globalAlpha=a*al; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath();
        for(let j=0;j<=n;j++) { const q=j/n,x=lerp(x0,x1,q),y=lerp(y0,y1,q)+Math.sin(q*Math.PI*6-ms/90)*6*Math.sin(q*Math.PI); j?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); }
      gfx.globalAlpha=1; }
    if(seated) phones(sR.x-4,rTop+9*RS,8.5*RS,1-seg(ms,P.home+300,P.end-150)); else phones(sR.x+1,rTop+RH*.2,RH*.17,1);
    // PLAY: a gold stereo wave sweeps left across the stage
    if(ms>P.play&&ms<P.light+500) { const q=seg(ms,P.play,P.light+500);
      for(let j=0;j<4;j++) { const p=cl(q*1.3-j*.12); if(p<=0||p>=1) continue; gfx.globalAlpha=(1-p)*.8; gfx.strokeStyle=j%2?'#ffe9a0':GOLD; gfx.lineWidth=5;
        gfx.beginPath(); gfx.ellipse(sT.x,sT.b-TH*.6,20+p*520,40+p*160,0,Math.PI*.55,Math.PI*1.45); gfx.stroke(); } gfx.globalAlpha=1; }
    // giant 8-bit notes rain on every monster and pin it, then fade at the end
    for(const o of order) for(let j=0;j<3;j++) { const t0=o.t+[-180,0,-90][j]; if(ms<t0-500) continue;
      const lx=o.q.x+[-.42,0,.42][j]*o.q.w,ly=j===1?o.q.top-4:o.q.base+2,k2=seg(ms,t0-500,t0),y=lerp(-40,ly,k2*k2),out=1-ez(seg(ms,P.home,P.end-100));
      if(out<=0) continue; gfx.globalAlpha=out; note8(lx,y,j===1?6:5,[PINK,GOLD,'#8fd0ff'][(j+o.t/NP)%3|0],k2<1?Math.sin(ms/80+j)*.2:(j-1)*.25); gfx.globalAlpha=1;
      if(k2>=1&&ms<t0+250) { gfx.globalAlpha=1-seg(ms,t0,t0+250); ring(lx,ly,8+seg(ms,t0,t0+250)*20,4+seg(ms,t0,t0+250)*8,3,CREAM); gfx.globalAlpha=1; } }
    bars(ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.end-100)))); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Headphones in the Dark.'); B2.aim=null; S('stun'); }],
    [P.walk,()=>{ setMessage('Rose wears Tom’s big headphones. She can hear his song.'); }],
    [P.rline,()=>{ say('rose','tombo3'); S('giggle'); }],
    [P.ribbon,()=>{ S('levelChime'); setMessage('The song reaches across the dark, all the way to Tom.'); }],
    [P.go,()=>{ S('step'); }],
    [P.lift,()=>{ S('boing'); setMessage('Tom follows it to her and lifts her up.'); }],
    [P.tline,()=>{ say('tom','tomborose3'); }],
    [P.play,()=>{ S('chime2'); S('fanfare'); word('PLAY',(rx+tx)/2,Math.max(60,rb-TH-60),GOLD,5,.9); setMessage('They press PLAY. Together.'); }],
    [P.light,()=>{ S('whoosh'); setMessage('Giant notes rain down and pin every monster in place.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sT.x,mid:sT.b-TH}:ST.unit(p)); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
    [P.clear,()=>{ word('LEVEL CLEAR!',GR.x,40,GOLD,4,1.3); S('fanfare'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); S('thud'); ST.jolt(o.f,.6); battle.shakeEnemy=.4;
      landHit(Math.floor(100/order.length)+(i<100%order.length?1:0)); }]); });
  steps.push(['hf',order.length?order[0].t:P.light]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Best co-op partner in the world. Level clear.']);
  ST.play(E2,steps);
};
// ---------- Sixty-Story Sibling Pace (Tom + Amy, tier 3) ----------
// A blue glass tower rises behind the monster. Tom and Amy start their watches in the same second and race straight up
// its face, side by side; every ten floors one of them punches out a glass pane that rockets down onto the monster
// (10F, 30F, 50F Tom; 20F, 40F Amy). At 60F ROOFTOP they fist-bump against the sun and dive off together for the sixth
// hit. Effects: six sure critical Kinetic hits on one enemy (5 x 12 + 40 = 100), Personal Best for the party.
const glassPane=(x,y,s,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  RO(-9,-6,18,12,'#5aa8d8'); R(-9,-6,18,4,'#9ed8f6'); Ln(-5,4,3,-4,2,'#e8f8ff'); gfx.restore(); };
const shards=(x,y,k,n=8)=>{ if(k<=0||k>=1) return; gfx.globalAlpha=1-k;
  for(let j=0;j<n;j++) { const a=j/n*Math.PI*2+j,r=6+k*38; gfx.save(); gfx.translate(x+Math.cos(a)*r,y+Math.sin(a)*r*.7+k*k*16); gfx.rotate(a+k*6);
    gfx.fillStyle=j%2?'#bfe8ff':'#ffffff'; gfx.beginPath(); gfx.moveTo(0,-4); gfx.lineTo(3,3); gfx.lineTo(-3,2); gfx.closePath(); gfx.fill(); gfx.restore(); }
  gfx.globalAlpha=1; };
B2_TOMBO_ANIM.amy3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const tgt=(E2.targets||[]).find(t=>t&&t.side==='foe')||b2LiveFoes()[0];
  const q=ST.foe(tgt),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const gb=cl(q.base,230,300),laneA=cl(q.x+q.w/2+30,140,450),laneT=laneA+46,roofY=112;
  const tx0=q.x-q.w/2-18,tx1=laneT+30,mid=(laneA+laneT)/2;
  const HIT=[2600,2950,3300,3650,4000],FL=['10F!','20F!','30F!','40F!','50F!'],WHO=['t','a','t','a','t'];
  const P={walk:700,aline:1000,click:1700,go:2200,tline:2450,top:4300,bump:4550,dive:4950,hit:5400,land:5900,home:6400,end:7100};
  const climbK=ms=>seg(ms,P.go,P.top),scAt=ms=>ms<P.go?1:(ms<P.dive?lerp(1,.62,ez(climbK(ms))):lerp(.62,1,ez(seg(ms,P.dive,P.hit))));
  // the climbers' feet height on the wall, with a surge for whoever is punching out a pane
  const wallY=(ms,who)=>{ let y=lerp(gb,roofY,ez(climbK(ms)));
    HIT.forEach((h,i)=>{ if(WHO[i]===who) y-=Math.sin(seg(ms,h-180,h+260)*Math.PI)*14; }); return y; };
  const punching=(ms,who)=>HIT.some((h,i)=>WHO[i]===who&&ms>h-120&&ms<h+160);
  const sT={x:ST.unit(tom).x,b:gb,s:1},sA={x:laneA,b:gb,s:1};
  const dive=(ms,x0,x1)=>{ const k=seg(ms,P.dive,P.hit),e=k*k; return {x:lerp(x0,x1,e),y:lerp(roofY,q.top+30,e)-Math.sin(k*Math.PI)*30,rot:-ez(k*1.4)*Math.PI*.75}; };
  const after=(ms,xs)=>{ const k=seg(ms,P.hit,P.land); return {x:lerp(q.x+xs*.3,xs,ez(k)),y:lerp(q.top+30,gb,k)-Math.sin(k*Math.PI)*60}; };
  const body=(fx,who,lane,sp,S0)=>pathOf(fx,P.end,(ms,c)=>{ let x=lane,y=gb,f=sp.idle,rot=0,sc=scAt(ms);
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,lane,k); y=lerp(c.origBase,gb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.go) { f=ms>P.click-150&&ms<P.click+300?(sp.aim||sp.act):sp.idle; if(who==='a'&&ms>P.aline&&ms<P.aline+500) y-=Math.abs(Math.sin(seg(ms,P.aline,P.aline+500)*Math.PI*2))*6; }
    else if(ms<P.top) { y=wallY(ms,who); x=lane+Math.sin(ms/90+(who==='a'?1.5:0))*2; f=punching(ms,who)?sp.act:runFr(sp,c.t*1.3,-1); }
    else if(ms<P.dive) { const k=ez(seg(ms,P.top,P.bump)); y=roofY; x=lerp(lane,mid+(who==='a'?-13:13),k);
      f=ms>P.bump-100&&ms<P.dive-80?(who==='a'?mirrorRowsCached(sp,'act'):sp.act):(who==='a'?(sp.celebFlip||sp.flip):sp.celeb); }
    else if(ms<P.hit) { const d=dive(ms,mid+(who==='a'?-13:13),q.x+(who==='a'?-14:14)); x=d.x; y=d.y; rot=d.rot; f=sp.act; }
    else if(ms<P.land) { const a2=after(ms,lane); x=a2.x; y=a2.y; f=sp.celeb; rot=0; sc=1; }
    else if(ms<P.home) { f=ms<P.land+500?sp.celeb:sp.idle; if(ms<P.land+500) y-=Math.abs(Math.sin(seg(ms,P.land,P.land+500)*Math.PI*2))*7; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(lane,c.origX,k); y=lerp(gb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    S0.x=x; S0.b=y; S0.s=sc; S0.f=f; return {cx:x,base:y,frame:f,rot,sc,noShadow:ms>P.go&&ms<P.land}; });
  body(fxT,'t',laneT,tsp,sT); body(fxP,'a',laneA,asp,sA);
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const towerK=ms=>ez(seg(ms,150,1000))*(1-ez(seg(ms,P.hit+200,P.home+300)));
  // Behind everyone: dusk, the sun over the roof, the tower (its windows stream down while they climb).
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#1c2a4a',.55);
    const tk=towerK(ms); if(tk<=0) return;
    if(ms>P.top-300) { const sk=ez(seg(ms,P.top-300,P.top+300))*tk; gfx.globalAlpha=sk*.35; E(mid,roofY-26,70,70,'#ffd27a'); gfx.globalAlpha=sk; EO(mid,roofY-26,26,26,'#ffcf5a'); E(mid-6,roofY-32,10,8,'#fff2b0'); gfx.globalAlpha=1; }
    const top=lerp(gb+4,roofY,tk),w=tx1-tx0;
    gfx.save(); gfx.beginPath(); gfx.rect(tx0-4,top-4,w+8,gb+8-top); gfx.clip();
    R(tx0-3,top-3,w+6,gb+7-top,OUT); R(tx0,top,w,gb+4-top,'#2c5f8a');
    const scroll=ms>P.go&&ms<P.top+200?((ms-P.go)*.22)%18:0;
    for(let y=top+4-18+scroll;y<gb+4;y+=18) { if(y<top) continue; for(let x=tx0+5;x<tx1-8;x+=14) { R(x,y,10,12,'#4f90c0'); R(x,y,10,3,'#8fd0f2'); } }
    gfx.globalAlpha=.25; R(tx0+w*.18,top,8,gb+4-top,'#ffffff'); gfx.globalAlpha=1;
    R(tx0-5,top-2,w+10,5,'#1b3a58');
    gfx.restore();
    // the floor counter on the roof edge
    const fl=ms<P.go?1:Math.min(60,Math.round(lerp(1,60,ez(climbK(ms)))));
    if(tk>.6) label((fl<10?'0':'')+fl+'F',tx0+18,Math.max(top+6,roofY+6),'#fff6dc',2);
    gfx.globalAlpha=1; }});
  const paneAt=(i,ms)=>{ const h=HIT[i],k=seg(ms,h-40,h+220); if(k<=0||k>=1) return null; const S0=WHO[i]==='t'?sT:sA,x0=S0.x-14*S0.s,y0=S0.b-(WHO[i]==='t'?TH:AH)*S0.s*.55;
    return {x:lerp(x0,q.x,k*k),y:lerp(y0,q.mid,k*k),s:1.3-k*.3,rot:k*9}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // stopwatches clicking
    if(ms>P.click-100&&ms<P.click+500) { const a=1-seg(ms,P.click+200,P.click+500); gfx.globalAlpha=a;
      for(const S0 of [sT,sA]) { const x=S0.x,y=S0.b-(S0===sT?TH:AH)-14; EO(x,y,7,7,'#e8e4dc'); Ln(x,y,x+Math.cos(ms/60)*5,y+Math.sin(ms/60)*5,2,RED); R(x-2,y-11,4,3,OUT); } gfx.globalAlpha=1; }
    // speed lines under the climbers
    if(ms>P.go&&ms<P.top) for(const S0 of [sT,sA]) for(let j=0;j<4;j++) { const q2=((ms/160)+j/4)%1; gfx.globalAlpha=.7*(1-q2); Ln(S0.x-8+j*5,S0.b+8+q2*30,S0.x-8+j*5,S0.b+20+q2*30,2,'#dff0fa'); }
    gfx.globalAlpha=1;
    for(let i=0;i<5;i++) { const p=paneAt(i,ms); if(p) glassPane(p.x,p.y,p.s,p.rot); shards(q.x,q.mid,seg(ms,HIT[i]+220,HIT[i]+700)); }
    // cloud puffs bursting at the roof
    if(ms>P.top-100&&ms<P.top+700) { const k2=seg(ms,P.top-100,P.top+700); gfx.globalAlpha=1-k2; for(let j=0;j<6;j++) { const a=j/6*Math.PI*2; EO(mid+Math.cos(a)*(20+k2*60),roofY-10+Math.sin(a)*(8+k2*16),10+k2*6,7+k2*4,'#f4f6fa'); } gfx.globalAlpha=1; }
    // the fist bump: a burst of light where the fists meet
    if(ms>P.bump&&ms<P.bump+500) { const k2=seg(ms,P.bump,P.bump+500),y=roofY-AH*.62*.6; gfx.globalAlpha=1-k2; ring(mid,y,6+k2*30,4+k2*20,3,GOLD); star(mid,y,4+k2*6,'#fffbe6'); gfx.globalAlpha=1; }
    // dive streaks
    if(ms>P.dive&&ms<P.hit) for(const S0 of [sT,sA]) { gfx.globalAlpha=.6; Ln(S0.x,S0.b-40,S0.x+18,S0.b-110,4,'#dff0fa'); gfx.globalAlpha=1; }
    // the landing: a big shatter
    if(ms>P.hit) shards(q.x,q.mid,seg(ms,P.hit,P.hit+900),16);
    if(ms>P.hit&&ms<P.hit+320) { tgt.spin=0; tgt.ox=0; tgt.fsc=.78; tgt.oy=q.h/2*.22; tgt.spinAt=performance.now(); }
    else if(ms>P.hit&&tgt.fsc) { tgt.fsc=0; tgt.oy=0; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Sixty-Story Sibling Pace.'); B2.aim=null; S('levelChime'); }],
    [300,()=>{ S('rumble'); setMessage('A glass tower rises behind '+(tgt.the||tgt.name)+'. Sixty floors.'); }],
    [P.aline,()=>{ say('amy','tombo3'); }],
    [P.click,()=>{ S('ding'); setMessage('They start their watches. Same second.'); }],
    [P.go,()=>{ S('whoosh'); word('GO!',mid,40,GOLD,4,.6); setMessage('They race straight up the glass.'); }],
    [P.tline,()=>{ say('tom','tomboamy3'); }],
    [P.top,()=>{ S('fanfare'); setMessage('Sixtieth floor. Neck and neck.'); }],
    [P.top+300,()=>{ word('60F ROOFTOP!',q.x,40,GOLD,3,1); }],
    [P.bump,()=>{ S(sfx.clap?'clap':'bump'); S('chime2'); }],
    [P.dive,()=>{ S('slideWhistle'); setMessage('They dive off the roof. Together.'); }],
    [P.hit,()=>{ S('crash'); S('bang'); ST.jolt(tgt,.9); battle.shakeEnemy=.7; scene('tb_rings',.8,{x:q.x,y:q.mid,r:90,c:'#dff0fa',w:4});
      word('CRASH!',q.x,Math.max(56,q.top-70),'#dff0fa',6,1); landHit(40); }],
    [P.land,()=>{ S('step'); }],
  ];
  HIT.forEach((h,i)=>{ steps.push([h,()=>{ S('whoosh'); }]); steps.push([h+220,()=>{ S('crash'); S('bonk'); ST.jolt(tgt,.5); battle.shakeEnemy=.35; word(FL[i],q.x,i%2?66:40,i%2?'#ffb0a0':'#dff0fa',4,i===4?.3:.4); landHit(12); }]); });
  steps.push(['hf',P.hit]);
  steps.push([P.end,'end',()=>{ tgt.ox=0; tgt.oy=0; tgt.fsc=0; tgt.spin=0; return (E2.result||'')+' A dead heat. They\'ll argue about it for years.'; }]);
  ST.play(E2,steps);
};

// ---------- Tom Cooks for Mom (Tom + Deedee, tier 3) ----------
// For once Tom cooks for his mom. Deedee has gone stone grey; Tom waves his best sourdough under her nose and the smell
// cracks her free. She takes a bite, says it needs salt, and starts cleaning his kitchen so hard she sweeps every monster
// off the stage. Effects: Cozy hit on every enemy (warms them), party heals 60%, Tucked In 3, crust 3, tray 3.
const stonePal=new Map();
const stoneOf=sp=>{ if(stonePal.has(sp.pal)) return stonePal.get(sp.pal); const o={};
  for(const k in sp.pal) { const c=sp.pal[k]; if(typeof c!=='string'||c[0]!=='#'||c.length<7) { o[k]=c; continue; }
    const r=parseInt(c.substr(1,2),16),g=parseInt(c.substr(3,2),16),b=parseInt(c.substr(5,2),16),l=Math.round(60+(r*.3+g*.59+b*.11)*.62);
    o[k]='rgb('+l+','+l+','+(l+6)+')'; }
  stonePal.set(sp.pal,o); return o; };
const boule=(x,y,s,bite)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s);
  if(bite) { gfx.beginPath(); gfx.rect(-20,-20,40,40); gfx.arc(-12,-7,6.5,0,Math.PI*2); gfx.clip('evenodd'); }
  EO(0,0,13,9.5,'#b8742e'); E(-2,-2.5,9,5.5,'#d89a52'); E(-4,-4,4,2,'#f0c88a');
  gfx.strokeStyle='#7a4418'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(-1,9,10,-Math.PI*.82,-Math.PI*.5); gfx.stroke(); gfx.beginPath(); gfx.arc(3,8,10,-Math.PI*.6,-Math.PI*.3); gfx.stroke();
  gfx.fillStyle='#fff6e8'; for(const [a,b2] of [[-6,-5],[4,-6],[7,-2]]) gfx.fillRect(a,b2,1.5,1.5);
  gfx.restore(); };
const towel=(x,y,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-4,-3,22,10,'#f4f0e6'); R(-4,0,22,2,'#5a8ad0'); R(-4,4,22,2,'#5a8ad0'); gfx.restore(); };
B2_TOMBO_ANIM.deedee3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale,DW=dsp.idle[0].length*dsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+18,dx=mx-42;
  const SW0=4600,SPD=.6;
  const order=list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  order.forEach((o,i)=>{ o.t=Math.round(SW0+Math.max(120,dx-o.q.x)/SPD+i*20); });
  const swEnd=SW0+(dx+70)/SPD,last=order.length?order[order.length-1].t:SW0+300;
  const P={walk:650,stone0:750,stone1:1250,loaf:1500,tline:1700,crack:2900,burst:3400,bite:3750,dline:4050,sw0:SW0,swEnd,back:swEnd+150,backIn:swEnd+650,
    apply:Math.max(last+150,swEnd+750),ret:swEnd+450,retIn:swEnd+1000,home:swEnd+1350,end:swEnd+2050};
  const stoneK=ms=>ez(seg(ms,P.stone0,P.stone1))*(ms<P.burst?1:0);
  const sT={x:T.x,b:by,f:tsp.idle},sD={x:dx,b:by,f:dsp.flip};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { f=ms>P.loaf&&ms<P.bite+150?sp.act:(ms>P.sw0&&ms<P.backIn?sp.expr:(ms>=P.backIn&&ms<P.backIn+700?sp.celeb:sp.idle));
      if(ms>P.backIn&&ms<P.backIn+500) y-=Math.abs(Math.sin(seg(ms,P.backIn,P.backIn+500)*Math.PI*2))*7; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dx,y=by,f=sp.flip,hide=false;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,dx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.burst) { f=sp.flip; hide=ms>P.stone0; }
    else if(ms<P.sw0) { if(ms<P.burst+400) { f=sp.celebFlip||sp.flip; y-=Math.sin(seg(ms,P.burst,P.burst+400)*Math.PI)*16; }
      else f=ms>P.dline-100?mirrorRowsCached(sp,'hip'):(ms>P.bite-100?mirrorRowsCached(sp,'act'):sp.flip); }
    else if(ms<P.swEnd) { x=lerp(dx,-70,seg(ms,P.sw0,P.swEnd)); f=runFr(sp,c.t*1.6,-1); y=by-Math.abs(Math.sin(ms/70))*4; }
    else if(ms<P.back) { x=-70; hide=true; }
    else if(ms<P.backIn) { const k=ez(seg(ms,P.back,P.backIn)); x=lerp(-70,dx,k); f=runFr(sp,c.t*1.6,1); }
    else if(ms<P.home) { f=ms<P.backIn+600?(sp.celebFlip||sp.flip):sp.flip; if(ms<P.backIn+600) y-=Math.abs(Math.sin(seg(ms,P.backIn,P.backIn+600)*Math.PI*2))*8; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(dx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sD.x=x; sD.b=y; sD.f=f; return {cx:x,base:y,frame:f,hide}; });
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  // Behind everyone: Tom's kitchen in warm evening light, a counter behind the pair.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#2a1408',.62);
    gfx.globalAlpha=k; const cy=by-TH-6,cx0=dx-60,cw=tx-dx+120; RO(cx0,cy,cw,TH*.55,'#8a5a3a'); R(cx0,cy,cw,6,'#e8dcc4'); R(cx0+10,cy+14,cw-20,3,'#6a4028');
    gfx.globalAlpha=1; }});
  const nose=()=>({x:sD.x+DW*.18,y:sD.b-DH*.72});
  const loafAt=ms=>{ if(ms<P.loaf||ms>P.dline+300) return null; const h=handPt(tsp,sT.f,sT.x,sT.b,-1),n=nose();
    if(ms<P.tline+200) { const k=ez(seg(ms,P.loaf,P.loaf+250)); return {x:h.x-4,y:h.y-4-(1-k)*20,s:k,b:false}; }
    if(ms<P.bite) { const k=ez(seg(ms,P.tline+200,P.tline+700)); return {x:lerp(h.x-4,n.x+16,k)+Math.sin(ms/110)*6*k,y:lerp(h.y-4,n.y+4,k)+Math.cos(ms/150)*3*k,s:1,b:false}; }
    const k=seg(ms,P.dline,P.dline+300); return {x:n.x+16,y:n.y+4+k*30,s:1-k,b:true}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // Deedee as stone (her real body is hidden while she is grey)
    if(ms>P.stone0&&ms<P.burst) { const k=stoneK(ms),fr=dsp.flip,x=sD.x-DW/2,y=sD.b-DH;
      drawSprite(fr,dsp.pal,x,y,dsp.scale,{alpha:1}); drawSprite(fr,stoneOf(dsp),x,y,dsp.scale,{alpha:k});
      if(ms>P.crack) { const c2=ez(seg(ms,P.crack,P.burst-80)); gfx.strokeStyle='#2a2a30'; gfx.lineWidth=2; gfx.lineCap='round';
        const cx=sD.x,top=y; gfx.beginPath(); gfx.moveTo(cx-4,top+6); gfx.lineTo(cx-4+6*c2,top+6+22*c2); gfx.lineTo(cx-6*c2,top+6+44*c2); gfx.lineTo(cx+8*c2,top+6+70*c2);
        gfx.moveTo(cx+10,top+30); gfx.lineTo(cx+10-12*c2,top+30+18*c2); gfx.stroke(); } }
    if(ms>P.burst&&ms<P.burst+700) { const k=seg(ms,P.burst,P.burst+700); gfx.globalAlpha=1-k;
      for(let j=0;j<10;j++) { const a=j*.63+.4,r=10+k*60; R(sD.x+Math.cos(a)*r,sD.b-DH*.5+Math.sin(a)*r*.8+k*k*30,5,4,j%2?'#9a9aa2':'#c4c4cc'); } gfx.globalAlpha=1; }
    // the sourdough, its smell drifting to her nose
    const L=loafAt(ms); if(L&&L.s>0) { boule(L.x,L.y,L.s,L.b);
      if(ms>P.tline+300&&ms<P.burst+200) for(let j=0;j<3;j++) { const q2=((ms/700)+j/3)%1,n=nose(); gfx.globalAlpha=(1-q2)*.8; gfx.strokeStyle='#fff6dc'; gfx.lineWidth=2; gfx.beginPath();
        for(let s=0;s<=8;s++) { const t2=s/8,x=lerp(L.x,n.x,q2*t2+0.1)+Math.sin(t2*6+ms/120+j)*4,y=lerp(L.y-10,n.y,q2*t2+.1)-t2*6; s?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); } gfx.globalAlpha=1; }
    if(ms>P.bite&&ms<P.bite+500) { const k=seg(ms,P.bite,P.bite+500),n=nose(); gfx.globalAlpha=1-k; for(let j=0;j<5;j++) R(n.x+8+j*3,n.y+8+k*24+j%2*4,2,2,'#d89a52'); gfx.globalAlpha=1; }
    // the cleaning frenzy: towel flicking, soap bubbles and shine in her wake
    if(ms>P.sw0&&ms<P.backIn+300) { towel(sD.x-12,sD.b-DH*.55,Math.sin(ms/45)*.9);
      for(let j=0;j<12;j++) { const age=((ms-P.sw0)/1000-j*.06); if(age<0) continue; const bx=lerp(dx,-70,cl((ms-P.sw0-j*60)/(P.swEnd-P.sw0)));
        const a=1-cl((ms-P.sw0)/1000-j*.08); if(a<=0) continue; gfx.globalAlpha=a*.85; ring(bx+(j%3-1)*8,sD.b-10-(j%4)*14-age*10,3+j%3,3+j%3,1.5,'#cfeeff'); }
      gfx.globalAlpha=1; }
    // the monsters get swept off the left edge, then slide back in after the hit
    for(const o of order) { if(o.f.dead) continue; const f=o.f,out=-(o.q.x+o.q.w/2+40);
      if(ms>o.t&&ms<P.retIn+50) { let ox;
        if(ms<P.ret) { const k=ez(seg(ms,o.t,o.t+420)); ox=out*k; f.spin=-seg(ms,o.t,o.t+420)*Math.PI*1.5; f.oy=-Math.sin(seg(ms,o.t,o.t+420)*Math.PI)*24; }
        else { const k=ez(seg(ms,P.ret,P.retIn)); ox=out*(1-k); f.spin=0; f.oy=0; }
        f.ox=ox; f.spinAt=performance.now(); } }
    // sparkle shine across the clean floor when she comes back
    if(ms>P.backIn-200&&ms<P.backIn+800) { const k=seg(ms,P.backIn-200,P.backIn+800); for(let j=0;j<8;j++) { const q2=cl(k*1.4-j*.06); gfx.globalAlpha=Math.sin(q2*Math.PI); star(40+j*70,by+4-(j%3)*30,3+j%3*2,j%2?'#fffbe6':'#cfeeff'); } gfx.globalAlpha=1; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom Cooks for Mom.'); B2.aim=null; S('levelChime'); }],
    [P.stone0,()=>{ S('stun'); setMessage('Deedee has gone stone grey.'); }],
    [P.loaf,()=>{ S('chime2'); setMessage('For once, Tom cooks for his mom. His best sourdough.'); }],
    [P.tline,()=>{ say('tom','tombodeedee3'); }],
    [P.crack,()=>{ S('creak'); }],
    [P.burst,()=>{ S('bang'); S('heal'); word('CRACK!',sD.x,Math.max(56,by-DH-60),'#fff6dc',5,.5); scene('tb_rings',.7,{x:sD.x,y:by-DH*.5,r:60,c:GOLD,w:3}); setMessage('The smell cracks her free!'); }],
    [P.bite,()=>{ S('bonk'); word('CHOMP',nose().x+10,Math.max(56,nose().y-40),'#ffd27a',3,.6); }],
    [P.dline,()=>{ say('deedee','tombo3'); }],
    [P.sw0,()=>{ S('whoosh'); setMessage('She cleans his whole kitchen. The monsters too.'); }],
    [P.back,()=>{ S('whoosh'); }],
    [P.backIn,()=>{ S('fanfare'); word('SPARKLING!',Math.max(110,GR.x),66,'#cfeeff',4,1.1); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sD.x,mid:sD.b-DH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
    [P.ret,()=>{ S('step'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('slideWhistle'); o.f.shake=Math.max(o.f.shake||0,.4); battle.shakeEnemy=.35;
      word(['SCRUB!','WIPE!','POLISH!','SCOUR!'][i%4],Math.max(60,o.q.x),i%2?66:40,'#cfeeff',4,.4);
      landHit(Math.floor(100/order.length)+(i<100%order.length?1:0)); }]); });
  steps.push(['hf',order.length?order[0].t:P.sw0]);
  steps.push([P.end,'end',()=>{ for(const o of order) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' It did need salt. A little.'; }]);
  ST.play(E2,steps);
};
// ---------- shared by boppy3, tnb3, nara3 ----------
// Draw one frame of a sprite by hand at a body spot (cx, feet at b), any palette, alpha and scale.
const drawAt=(sp,fr,x,b,pal,a=1,sc)=>{ const s=sc||sp.scale,w=fr[0].length*s,h=fr.length*s; drawSprite(fr,pal||sp.pal,x-w/2,b-h,s,{alpha:a}); };
const tintPal=new Map();
const tintOf=(sp,hex,amt)=>{ let m=tintPal.get(sp.pal); if(!m) tintPal.set(sp.pal,m=new Map()); const key=hex+'|'+amt; if(m.has(key)) return m.get(key); const o={},T2=[1,3,5].map(i=>parseInt(hex.substr(i,2),16));
  for(const k in sp.pal) { const c=sp.pal[k]; if(typeof c!=='string'||c[0]!=='#'||c.length<7) { o[k]=c; continue; }
    const v=[1,3,5].map((i,j)=>Math.round(lerp(parseInt(c.substr(i,2),16),T2[j],amt))); o[k]='rgb('+v.join(',')+')'; }
  m.set(key,o); return o; };   // keyed per palette object (a string key made every palette '[object Object]')
const order3=list=>list.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
const split100=(i,n)=>Math.floor(100/n)+(i<100%n?1:0);

// ---------- The Pepper-Broth Sneeze (Tom + Boppy, tier 3) ----------
// Boppy has gone stone grey. Tom wafts a bowl of extra-cayenne broth under his nose; the stone glows orange from his
// stomach up and cracks off. Boppy goes red, inhales (AH... AHHH...), Tom opens an umbrella and ducks behind it, and
// Boppy sneezes a cone of pepper fire across every monster. Effects: biggest Cozy hit on every enemy, they see stars
// (Stunned 1), Amber melts off the party, Boppy's Heartburn +3.
const brothBowl=(x,y,s)=>{ if(s<=0) return; gfx.save(); gfx.translate(x,y); gfx.scale(s,s);
  gfx.beginPath(); gfx.ellipse(0,0,15,13,0,0,Math.PI); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#f0e6d4'; gfx.fill();
  R(-9,6,18,3,'#3a7ac0'); EO(0,0,15,4,'#c8381a'); E(-4,-1,6,1.6,'#ff7a3a'); E(5,0,1.6,1.2,'#3a8a3a'); E(-8,1,1.4,1,'#ffd040'); gfx.restore(); };
const umbrella=(x,y,k,rot)=>{ if(k<=0) return; gfx.save(); gfx.translate(x,y); gfx.rotate(rot); const r=30*k;
  Ln(0,0,0,26,4,OUT); Ln(0,0,0,26,2,'#6a4a2a'); Ln(0,26,-5,30,4,OUT);
  for(let j=0;j<6;j++) { const a0=Math.PI+j*Math.PI/6,a1=a0+Math.PI/6; gfx.beginPath(); gfx.moveTo(0,0); gfx.arc(0,0,r,a0,a1); gfx.closePath();
    gfx.fillStyle=j%2?CREAM:RED; gfx.fill(); gfx.lineWidth=2; gfx.strokeStyle=OUT; gfx.stroke(); }
  gfx.restore(); };
B2_TOMBO_ANIM.boppy3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale,BW=bsp.idle[0].length*bsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+36,bx=mx-40;
  const SN=4500,order=order3(list);
  order.forEach((o,i)=>{ o.t=SN+160+Math.max(0,bx-o.q.x)*.5+i*40; });
  const last=order.length?order[order.length-1].t:SN+300;
  const P={walk:650,stone0:750,stone1:1150,bowl:1300,tline:1450,crack:2500,burst:3100,bline:3250,ah1:3400,ah2:3900,umb:3650,sneeze:SN,fireEnd:last+450,
    apply:last+300,relief:last+600,home:last+1300,end:last+2000};
  const stoneK=ms=>ez(seg(ms,P.stone0,P.stone1));
  const sT={x:T.x,b:by,f:tsp.idle},sB={x:bx,b:by,f:bsp.flip,rot:0};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { f=ms>P.bowl&&ms<P.umb?sp.act:(ms>=P.umb&&ms<P.fireEnd?sp.kneel:(ms>=P.fireEnd&&ms<P.fireEnd+600?sp.celeb:sp.idle)); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=bx,y=by,f=sp.flip,hide=false,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,bx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.burst) { hide=ms>P.stone0; }
    else if(ms<P.sneeze) { if(ms<P.burst+350) { f=sp.celebFlip||sp.flip; y-=Math.sin(seg(ms,P.burst,P.burst+350)*Math.PI)*14; }
      else { f=sp.flip; rot=-.2*ez(seg(ms,P.ah1,P.sneeze-80)); } }
    else if(ms<P.fireEnd) { f=sp.act; rot=-.14+Math.sin(ms/30)*.03; x=bx+Math.min(8,(ms-P.sneeze)*.08); }
    else if(ms<P.home) { x=bx+8; f=ms<P.home-150?sp.hip:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(bx+8,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sB.x=x; sB.b=y; sB.f=f; sB.rot=rot; return {cx:x,base:y,frame:f,hide,rot}; });
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  // Behind everyone: Boppy's kitchen in the evening, the window red with pepper light once he sneezes.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#24100a',.6);
    if(ms>P.sneeze&&ms<P.fireEnd+400) { const f2=Math.sin(seg(ms,P.sneeze,P.fireEnd+400)*Math.PI); gfx.globalAlpha=f2*.35; R(0,0,576,324,'#ff5a1a'); gfx.globalAlpha=1; } }});
  const noseR=()=>({x:sB.x+BW*.2,y:sB.b-BH*.72}),noseL=()=>({x:sB.x-BW*.24,y:sB.b-BH*.7});
  const bowlAt=ms=>{ if(ms<P.bowl||ms>P.umb+200) return null; const h=handPt(tsp,sT.f,sT.x,sT.b,-1),n=noseR();
    if(ms<P.tline+300) { const k=ez(seg(ms,P.bowl,P.bowl+250)); return {x:h.x-6,y:h.y-(1-k)*16,s:k}; }
    if(ms<P.umb) { const k=ez(seg(ms,P.tline+300,P.tline+800)); return {x:lerp(h.x-6,n.x+18,k)+Math.sin(ms/120)*7*k,y:lerp(h.y,n.y+10,k)+Math.cos(ms/160)*3*k,s:1}; }
    const k=seg(ms,P.umb,P.umb+200); return {x:n.x+18+k*30,y:n.y+10+k*40,s:1-k}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // Boppy as stone, then glowing orange cracks climbing from his stomach to his head
    if(ms>P.stone0&&ms<P.burst) { const fr=bsp.flip; drawAt(bsp,fr,sB.x,sB.b,bsp.pal,1); drawAt(bsp,fr,sB.x,sB.b,stoneOf(bsp),stoneK(ms));
      if(ms>P.crack) { const c2=ez(seg(ms,P.crack,P.burst-60)),top=sB.b-BH,cx=sB.x,yb=top+BH*.62;
        for(const [w,c,a] of [[7,'#ff7a1a',.35],[3,'#ffb84a',1]]) { gfx.globalAlpha=a; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath();
          gfx.moveTo(cx-2,yb); gfx.lineTo(cx+6,yb-BH*.18*c2); gfx.lineTo(cx-4,yb-BH*.36*c2); gfx.lineTo(cx+4,yb-BH*.52*c2);
          gfx.moveTo(cx-10,yb+4); gfx.lineTo(cx-14,yb-BH*.14*c2); gfx.moveTo(cx+12,yb+2); gfx.lineTo(cx+16,yb-BH*.2*c2); gfx.stroke(); }
        gfx.globalAlpha=.3*c2; E(cx,yb,BW*.35,BH*.2,'#ff8a2a'); gfx.globalAlpha=1; } }
    if(ms>P.burst&&ms<P.burst+700) { const k=seg(ms,P.burst,P.burst+700); gfx.globalAlpha=1-k;
      for(let j=0;j<10;j++) { const a=j*.63+.4,r=10+k*60; R(sB.x+Math.cos(a)*r,sB.b-BH*.5+Math.sin(a)*r*.8+k*k*30,5,4,j%2?'#9a9aa2':'#ffb84a'); } gfx.globalAlpha=1; }
    // his face goes red from the chin up while he winds up the sneeze
    if(ms>P.burst+200&&ms<P.fireEnd+300) { const k=ez(seg(ms,P.burst+200,P.sneeze-200))*(1-seg(ms,P.fireEnd-100,P.fireEnd+300)),top=sB.b-BH;
      if(k>0) { gfx.save(); gfx.beginPath(); gfx.rect(0,top,576,BH*.36); gfx.clip(); gfx.translate(sB.x,sB.b-BH/2); gfx.rotate(sB.rot); gfx.translate(-sB.x,-(sB.b-BH/2));
        drawAt(bsp,sB.f,sB.x,sB.b,tintOf(bsp,'#ff2a1a',.55),k); gfx.restore(); }
      // steam out of his ears
      if(ms<P.sneeze) for(let j=0;j<4;j++) { const q2=((ms/400)+j/4)%1; gfx.globalAlpha=(1-q2)*.8; E(sB.x+(j%2?BW*.28:-BW*.28)+(j%2?q2*10:-q2*10),top+BH*.22-q2*26,3+q2*4,3+q2*4,'#f4f0e6'); } gfx.globalAlpha=1; }
    // the broth and its spicy steam drifting to his nose
    const bw=bowlAt(ms); if(bw&&bw.s>0) { brothBowl(bw.x,bw.y,bw.s);
      if(ms>P.tline+400&&ms<P.burst+300) for(let j=0;j<3;j++) { const q2=((ms/650)+j/3)%1,n=noseR(); gfx.globalAlpha=(1-q2)*.85; gfx.strokeStyle=j%2?'#ff9a4a':'#ffd0a0'; gfx.lineWidth=2.5; gfx.beginPath();
        for(let s=0;s<=8;s++) { const t2=s/8,x=lerp(bw.x,n.x,q2*t2+.1)+Math.sin(t2*6+ms/110+j)*4,y=lerp(bw.y-8,n.y,q2*t2+.1)-t2*8; s?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); } gfx.globalAlpha=1; }
    // Tom's umbrella, held out toward his dad
    umbrella(sT.x-20,sT.b-TH*.55,ez(seg(ms,P.umb,P.umb+250))*(1-ez(seg(ms,P.fireEnd,P.fireEnd+250))),-Math.PI/2-.15+Math.sin(ms/40)*(ms>P.sneeze&&ms<P.fireEnd?.05:0));
    // THE SNEEZE: a cone of pepper fire from his nose across the whole monster side
    if(ms>P.sneeze&&ms<P.fireEnd) { const n=noseL(),gr=ez(seg(ms,P.sneeze,P.sneeze+260)),fo=1-seg(ms,P.fireEnd-250,P.fireEnd),len=(n.x+30)*gr,fl=Math.sin(ms/25);
      for(const [sp2,c,a] of [[1,'#ff4a12',.75],[.7,'#ff9a2a',.9],[.38,'#fff2a0',1]]) { gfx.globalAlpha=a*fo; gfx.fillStyle=c; gfx.beginPath(); gfx.moveTo(n.x,n.y);
        const hw=(110+fl*8)*sp2*gr; gfx.quadraticCurveTo(n.x-len*.5,n.y-hw*.9,n.x-len,n.y-hw); gfx.lineTo(n.x-len,n.y+hw*.8); gfx.quadraticCurveTo(n.x-len*.5,n.y+hw*.7,n.x,n.y); gfx.fill(); }
      for(let j=0;j<10;j++) { const q2=((ms-P.sneeze)/500+j/10)%1; gfx.globalAlpha=fo*(1-q2); EO(n.x-q2*len,n.y+Math.sin(j*2.4)*q2*80,4+q2*9,4+q2*7,j%2?'#ffb02a':'#ff6a1a'); }
      gfx.globalAlpha=1; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! The Pepper-Broth Sneeze.'); B2.aim=null; S('levelChime'); }],
    [P.stone0,()=>{ S('stun'); setMessage('Boppy has gone stone grey.'); }],
    [P.bowl,()=>{ S('chime2'); setMessage('Tom brings a bowl of broth. Extra cayenne.'); }],
    [P.tline,()=>{ say('tom','tomboboppy3'); }],
    [P.crack,()=>{ S('creak'); S('flame'); setMessage('The stone glows orange. From the stomach up.'); }],
    [P.burst,()=>{ S('bang'); word('CRACK!',sB.x,Math.max(56,by-BH-60),'#ffb84a',5,.5); scene('tb_rings',.7,{x:sB.x,y:by-BH*.5,r:60,c:'#ffb84a',w:3}); }],
    [P.bline,()=>{ say('boppy','tombo3'); }],
    [P.ah1,()=>{ word('AH...',GR.x,40,'#ffd0a0',3,.5); }],
    [P.umb,()=>{ S('whoosh'); setMessage('Tom opens an umbrella and ducks.'); }],
    [P.ah2,()=>{ word('AHHH...',GR.x,66,'#ffb07a',4,.5); }],
    [P.sneeze,()=>{ S('flame'); S('crash'); S('rumble'); battle.shakeEnemy=.8; word('ACHOOO!',GR.x,52,'#ff7a2a',6,1.1); setMessage('ACHOOOO!! Pepper fire across the whole stage!'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sB.x,mid:sB.b-BH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:'#ffb84a',a:.35}); } }],
    [P.relief,()=>{ S('fanfare'); setMessage('Boppy pats his stomach. Cleared right out.'); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.6); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:46,c:'#ffb02a',w:3}); landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.sneeze]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Good for the sinuses.']);
  ST.play(E2,steps);
};

// ---------- Cone Six Across the Miles (Tom + TNB, tier 3) ----------
// The stage splits: LA on TNB's side, New York on Tom's, a cold blue wall between them that reads 2475 MILES. TNB holds
// the first cup he ever threw, glowing from the kiln; Tom holds the matching one with his coffee. A gold thread runs
// between the cups, through the wall. They walk toward each other, the miles count down to zero as the map folds,
// the wall shatters, the cups CLINK and they kiss. A Cone Six heat wave rolls over every monster. Effects: Cozy hit
// on every enemy; the party heals 60%, everyone gets a fresh costume, continuity 2.
const mug=(x,y,glow,steam,ms)=>{ if(glow>0) { gfx.globalAlpha=glow*(.35+.15*Math.sin(ms/90)); E(x,y,16,16,'#ff8a2a'); gfx.globalAlpha=1; }
  RO(x-6,y-7,12,13,'#c8b49a'); R(x-6,y-7,12,3,'#7aa8b8'); for(const [a,b2] of [[-3,0],[2,2],[-1,4],[3,-2]]) R(x+a,y+b2,1.5,1.5,'#6a5a48');
  ring(x+8,y-1,3.5,4,3,OUT); ring(x+8,y-1,3.5,4,1.5,'#c8b49a');
  if(steam) for(let j=0;j<2;j++) { const q2=((ms/700)+j/2)%1; gfx.globalAlpha=(1-q2)*.8; E(x-2+j*4+Math.sin(q2*6)*2,y-10-q2*14,2+q2*2,2+q2*2,'#f4f0e6'); } gfx.globalAlpha=1; };
B2_TOMBO_ANIM.tnb3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),lx=mx-52,rx=mx+52,ml=mx-15,mr=mx+15;
  const FL=4700,order=order3(list);
  order.forEach((o,i)=>{ o.t=FL+200+Math.max(0,mx-o.q.x)*.6+i*40; });
  const last=order.length?order[order.length-1].t:FL+300;
  const P={walk:700,mugs:1100,nline:1300,thread:2000,tline:2600,step0:3300,step1:3950,fold0:3300,fold1:3950,clink:3950,kiss:4250,flare:FL,
    apply:last+250,home:last+1200,end:last+1900};
  const sT={x:T.x,b:by,f:tsp.idle},sN={x:lx,b:by,f:nsp.flip};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=rx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,rx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.step0) { f=ms>P.tline-200&&ms<P.step0?sp.act:sp.idle; }
    else if(ms<P.home) { const k=ez(seg(ms,P.step0,P.step1)); x=lerp(rx,mr,k); f=k<1?runFr(sp,c.t*.7,-1):(ms>P.flare&&ms<P.flare+700?sp.celeb:sp.idle); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(mr,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,actR=mirrorRowsCached(sp,'act'); let x=lx,y=by,f=sp.flip;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,lx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.step0) { f=ms>P.nline-100&&ms<P.step0?actR:sp.flip; }
    else if(ms<P.home) { const k=ez(seg(ms,P.step0,P.step1)); x=lerp(lx,ml,k); f=k<1?runFr(sp,c.t*.7,1):(ms>P.flare&&ms<P.flare+700?(sp.celebFlip||sp.flip):sp.flip); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(ml,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f}; });
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const fold=ms=>ez(seg(ms,P.fold0,P.fold1));
  // Behind everyone: night, LA warm on the left, New York cool on the right; a palm and a skyline that slide together
  // as the map folds, with a crease shadow down the middle.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#0e1426',.6);
    const fk=fold(ms),wk=ms<P.clink?1:0;
    gfx.globalAlpha=k*.22*(1-fk); R(0,0,mx,324,'#ff9a5a'); R(mx,0,576-mx,324,'#6aa8ff'); gfx.globalAlpha=1;
    gfx.globalAlpha=k*ez(seg(ms,300,900))*(1-seg(ms,P.clink,P.clink+400)); const pX=lerp(lx-40,mx-26,fk),sX=lerp(rx+34,mx+20,fk),gy=by-TH-8;
    // palm
    Ln(pX,gy+70,pX+4,gy,4,OUT); Ln(pX,gy+70,pX+4,gy,2,'#8a5a30');
    for(let j=0;j<5;j++) { const a=-Math.PI*.95+j*Math.PI*.22; Ln(pX+4,gy,pX+4+Math.cos(a)*18,gy+Math.sin(a)*10+6,4,'#2a6a3a'); }
    // skyline
    for(const [dx,w,h] of [[-8,10,46],[4,12,62],[18,9,38]]) { RO(sX+dx,gy+70-h,w,h,'#3a4a6a'); for(let yy=gy+74-h;yy<gy+66;yy+=8) R(sX+dx+3,yy,3,3,'#ffe08a'); }
    gfx.globalAlpha=1;
    if(fk>0&&fk<1) { gfx.globalAlpha=Math.sin(fk*Math.PI)*.5*k; R(mx-6-fk*20,0,12+fk*40,324,'#000000'); gfx.globalAlpha=1; } }});
  const mugT=()=>{ const h=handPt(tsp,sT.f,sT.x,sT.b,-1); return {x:h.x-4,y:h.y-6}; },mugN=()=>{ const h=handPt(nsp,sN.f,sN.x,sN.b,1); return {x:h.x+2,y:h.y-6}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms);
    // labels: LA and NY at the top, the miles count over the wall
    if(k>0&&ms>1600&&ms<P.clink+300) { const fk=fold(ms),a=k*ez(seg(ms,1600,2000))*(1-seg(ms,P.clink,P.clink+300)); gfx.globalAlpha=a;
      bigWord('LA',lerp(lx,mx-24,fk),46,'#ffb07a',3); bigWord('NY',lerp(rx,mx+24,fk),46,'#9fd0ff',3);
      const miles=Math.round(2475*(1-fk)); bigWord(miles+' MILES',mx,72,'#dff0fa',2); gfx.globalAlpha=1; }
    // the cold wall between them
    if(ms<P.clink) { const a=ez(seg(ms,300,900))*k; gfx.globalAlpha=a*.35; R(mx-9,BARH,18,by+6-BARH,'#6ac8ff'); gfx.globalAlpha=a*.85; R(mx-2,BARH,4,by+6-BARH,'#dff6ff');
      for(let j=0;j<6;j++) { const yy=BARH+((ms/8+j*47)%(by-BARH)); gfx.globalAlpha=a*.6; R(mx-8,yy,16,2,'#bfeaff'); } gfx.globalAlpha=1; }
    // the wall shatters into gold
    if(ms>P.clink&&ms<P.clink+900) { const q2=seg(ms,P.clink,P.clink+900); gfx.globalAlpha=1-q2;
      for(let j=0;j<22;j++) { const yy=BARH+j/22*(by-BARH),dir=j%2?1:-1,dx=dir*(10+q2*(60+j*4)); gfx.save(); gfx.translate(mx+dx,yy+q2*q2*60); gfx.rotate(q2*8+j);
        gfx.fillStyle=j%3?GOLD:'#bfeaff'; gfx.beginPath(); gfx.moveTo(0,-5); gfx.lineTo(4,4); gfx.lineTo(-4,3); gfx.closePath(); gfx.fill(); gfx.restore(); } gfx.globalAlpha=1; }
    // the cups
    if(ms>P.mugs&&ms<P.home+200) { const a=ez(seg(ms,P.mugs,P.mugs+250))*(1-seg(ms,P.home-100,P.home+200)); gfx.globalAlpha=a;
      const mT=mugT(),mN=mugN(); mug(mN.x,mN.y,ms<P.flare+600?1:0,false,ms); mug(mT.x,mT.y,0,true,ms); gfx.globalAlpha=1;
      // the gold thread between them, straight through the wall
      if(ms>P.thread&&ms<P.clink) { const ta=ez(seg(ms,P.thread,P.thread+400)),n=24;
        for(const [w,c,al] of [[6,'#ffe9a0',.35],[2.5,GOLD,1]]) { gfx.globalAlpha=ta*al; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath();
          for(let j=0;j<=n;j++) { const q2=j/n,x=lerp(mN.x,mT.x,q2),y=lerp(mN.y-6,mT.y-6,q2)+Math.sin(q2*Math.PI*5-ms/100)*4*Math.sin(q2*Math.PI); j?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); } gfx.globalAlpha=1; } }
    // clink sparkle and the kiss heart
    if(ms>P.clink&&ms<P.clink+500) { const q2=seg(ms,P.clink,P.clink+500),y=(mugT().y+mugN().y)/2-6; gfx.globalAlpha=1-q2; ring(mx,y,6+q2*26,4+q2*18,3,GOLD); star(mx,y,4+q2*6,'#fffbe6'); gfx.globalAlpha=1; }
    if(ms>P.kiss&&ms<P.kiss+1100) { const q2=seg(ms,P.kiss,P.kiss+1100); gfx.globalAlpha=q2>.8?(1-q2)/.2:1; heart(mx,by-Math.max(TH,NH)-12-q2*30,7+Math.sin(q2*Math.PI)*4,PINK); gfx.globalAlpha=1; }
    // the Cone Six heat wave rolling left over the monsters
    if(ms>P.flare&&ms<last+600) { const q=seg(ms,P.flare,last+600);
      for(let j=0;j<4;j++) { const p=cl(q*1.25-j*.1); if(p<=0||p>=1) continue; gfx.globalAlpha=(1-p)*.85; gfx.strokeStyle=['#fff2c0','#ffb84a','#ff7a2a','#ffd88a'][j]; gfx.lineWidth=6;
        gfx.beginPath(); gfx.ellipse(mx,by-50,20+p*mx,40+p*150,0,Math.PI*.55,Math.PI*1.45); gfx.stroke(); }
      gfx.globalAlpha=.18*Math.sin(q*Math.PI); R(0,0,mx,324,'#ff9a3a'); gfx.globalAlpha=1; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Cone Six Across the Miles.'); B2.aim=null; S('levelChime'); }],
    [400,()=>{ S('stun'); setMessage('LA on one side. New York on the other. 2475 miles between.'); }],
    [P.mugs,()=>{ S('ding'); setMessage('TNB holds the first cup he ever threw. Tom holds its match.'); }],
    [P.nline,()=>{ say('tnb','tombo3'); }],
    [P.thread,()=>{ S('chime2'); setMessage('A gold thread runs between the cups, right through the wall.'); }],
    [P.tline,()=>{ say('tom','tombotnb3'); }],
    [P.step0,()=>{ S('step'); setMessage('They walk toward each other. The map folds in half.'); }],
    [P.clink,()=>{ S('ding'); S('crash'); word('CLINK!',mx,Math.max(56,by-Math.max(TH,NH)-50),GOLD,4,.7); }],
    [P.kiss,()=>{ S('kiss'); }],
    [P.flare,()=>{ S('flame'); S('whoosh'); word('CONE SIX!',GR.x,40,'#ffb84a',4,1); setMessage('A Cone Six heat wave rolls over every monster.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sN.x,mid:sN.b-NH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('thud'); ST.jolt(o.f,.55); battle.shakeEnemy=.35; landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.flare]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Zero miles. Right here.']);
  ST.play(E2,steps);
};

// ---------- Cuddle (Tom + Nara, tier 3) ----------
// The dark closes in. Tom kneels in it, alone, grey and flickering. Far off, Nara puts her nose down and follows his
// scent along a gold trail, finds him, and climbs into his lap. He wraps his arms around her; his color comes back,
// the warmth spreads, gold cracks run through the dark, and it shatters into color across every monster.
// Effects: Sparkle hit on every enemy (warms them), the party loses its debuffs and is Fearless for 2 turns.
B2_TOMBO_ANIM.nara3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),N0=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),tx=cl(GR.x1+130,GR.x1+100,450),lapX=tx-24,LS=.8;
  const SH=4900,order=order3(list);
  order.forEach((o,i)=>{ o.t=SH+200+Math.max(0,tx-o.q.x)*.5+i*40; });
  const last=order.length?order[order.length-1].t:SH+300;
  const P={walk:800,ghost0:900,ghost1:1500,sniff:1700,run:2000,arrive:3000,climb:3000,seat:3350,nline:3250,warm0:3350,warm1:3900,tline:3600,crack0:4300,shatter:SH,
    apply:last+250,hop:SH+100,home:last+1300,end:last+2000};
  const sT={x:T.x,b:by},sN={x:N0.x,b:N0.base,f:nsp.idle};
  const hideT=ms=>ms>P.ghost0&&ms<P.shatter,hideN=ms=>ms>P.seat-20&&ms<P.shatter;
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.kneel;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t*.6,-1); }
    else if(ms<P.home) { f=ms<P.shatter+200?sp.kneel:(ms<P.shatter+900?sp.celeb:sp.idle); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f,hide:hideT(ms)}; });
  const beside=tx-56;
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=c.origX,y=c.origBase,f=sp.idle;
    if(ms<P.run) { f=ms>P.sniff?(Math.floor(ms/180)%2?sp.idle:sp.idle2||sp.idle):sp.idle; if(ms>P.sniff) y+=2; }
    else if(ms<P.climb) { const k=seg(ms,P.run,P.arrive); x=lerp(c.origX,lapX+6,k); y=lerp(c.origBase,by,k)+2; f=runFr(sp,c.t*.9,-1); }
    else if(ms<P.seat) { const k=seg(ms,P.climb,P.seat); x=lerp(lapX+6,lapX,k); y=by-Math.sin(k*Math.PI)*22; f=sp.celeb; }
    else if(ms<P.shatter) { x=lapX; y=by; f=sp.sit; }
    else if(ms<P.home) { const k=ez(seg(ms,P.hop,P.hop+450)); x=lerp(lapX,beside,k); y=by-Math.sin(k*Math.PI)*30; f=ms<P.hop+900?sp.celeb:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(beside,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f,hide:hideN(ms)}; });
  const darkK=ms=>ez(seg(ms,0,500));
  const warm=ms=>ez(seg(ms,P.warm0,P.crack0+400));
  const lap=()=>({x:sT.x-8,y:sT.b-TH*.35});
  const rays=[...Array(9)].map((_,j)=>{ const a=j/9*Math.PI*2+.3; return [0,1,2,3].map(s2=>({a:a+(s2%2?.18:-.14)*(s2?1:0),r:s2})); });
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    const L=lap();
    // the gold scent trail along the floor, from Nara's spot to Tom
    if(ms>P.sniff&&ms<P.seat+400) { const a=ez(seg(ms,P.sniff,P.sniff+400))*(1-seg(ms,P.seat,P.seat+400)),n=20,x0=N0.x,x1=sT.x;
      for(const [w,c,al] of [[6,'#ffe9a0',.3],[2.5,GOLD,.9]]) { gfx.globalAlpha=a*al; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath();
        for(let j=0;j<=n;j++) { const q2=j/n,x=lerp(x0,x1,q2),y=lerp(N0.base-6,by-6,q2)+Math.sin(q2*Math.PI*4+ms/150)*3; j?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); }
      gfx.globalAlpha=1; }
    // the dark (with violet static) and its holes of light
    const dk=darkK(ms)*(ms<P.shatter?1:1-ez(seg(ms,P.shatter,P.shatter+450)));
    if(dk>0) { if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const g=darkC.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,576,324); g.fillStyle='#0a0616'; g.fillRect(0,0,576,324);
      for(let j=0;j<40;j++) { const r=Math.sin(j*91.7+Math.floor(ms/70)*13.3)*.5+.5,r2=Math.sin(j*37.1+Math.floor(ms/70)*7.9)*.5+.5; g.fillStyle=j%3?'#2a1a4a':'#4a2a7a'; g.fillRect(r*576,r2*324,8+j%5*4,2); }
      g.globalCompositeOperation='destination-out';
      const hole=(x,y,r,a)=>{ const gr=g.createRadialGradient(x,y,r*.3,x,y,r); gr.addColorStop(0,'rgba(0,0,0,'+a+')'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill(); };
      hole(sT.x,sT.b-TH*.45,lerp(46,190,warm(ms)),lerp(.45,1,warm(ms)));
      if(ms<P.seat) hole(sN.x,sN.b-NH*.45,58,ms>P.sniff?1:.6);
      g.globalCompositeOperation='source-over';
      gfx.globalAlpha=.94*dk; gfx.drawImage(darkC,0,0); gfx.globalAlpha=1; }
    // the warm glow around the two of them
    const wk=warm(ms)*(1-ez(seg(ms,P.shatter+200,P.home)));
    if(wk>0) { gfx.globalAlpha=wk*.35; E(L.x,L.y,60+wk*30,50+wk*24,'#ffcf7a'); gfx.globalAlpha=wk*.25; E(L.x,L.y,30+wk*20,26+wk*16,'#fff2c0'); gfx.globalAlpha=1; }
    // Tom, drawn over the dark: grey and flickering, then his color coming back
    if(hideT(ms)) { const fr=tsp.kneel,gk=ez(seg(ms,P.ghost0,P.ghost1)),ck=ez(seg(ms,P.warm0,P.warm1)),fl=.5+.2*Math.sin(ms/55)+.12*Math.sin(ms/23);
      drawAt(tsp,fr,sT.x,sT.b,tsp.pal,ck+(1-gk)*(1-ck));
      drawAt(tsp,fr,sT.x,sT.b,tintOf(tsp,'#4a4270',.55),gk*(1-ck)*fl); }
    // Nara in his lap, smaller and in front, with his arms around her
    if(hideN(ms)) { const fr=nsp.sit,nh=fr.length*nsp.scale*LS,nw=fr[0].length*nsp.scale*LS,nb=sT.b+2;
      gfx.globalAlpha=.55; E(lapX,nb-nh*.5,nw*.62,nh*.6,'#ffe2a0'); gfx.globalAlpha=1;
      const rim=tintOf(nsp,'#fff2c8',1); for(const [ox,oy] of [[-2,0],[2,0],[0,-2],[0,2]]) drawAt(nsp,fr,lapX+ox,nb+oy,rim,.9,nsp.scale*LS);
      drawAt(nsp,fr,lapX,nb,nsp.pal,1,nsp.scale*LS);
      // hearts and a little huff of breath
      if(ms>P.seat+300) for(let j=0;j<3;j++) { const q2=((ms-P.seat)/1000+j/3)%1; gfx.globalAlpha=(1-q2)*Math.min(1,wk+.3); heart(lapX-10+j*12,nb-nh-14-q2*30,4+j%2*2,PINK); } gfx.globalAlpha=1; }
    // gold cracks running out through the dark from the two of them
    if(ms>P.crack0&&ms<P.shatter) { const ck=ez(seg(ms,P.crack0,P.shatter-60));
      for(const [w,c,al] of [[6,'#ffe9a0',.35],[2.5,GOLD,1]]) { gfx.globalAlpha=al; gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round';
        for(const ray of rays) { gfx.beginPath(); gfx.moveTo(L.x+Math.cos(ray[0].a)*44,L.y+Math.sin(ray[0].a)*26); let px=L.x,py=L.y;
          for(const pt2 of ray) { const len=(70+pt2.r*90)*ck; const nx=L.x+Math.cos(pt2.a)*len*1.4,ny=L.y+Math.sin(pt2.a)*len*.75; gfx.lineTo(nx,ny); px=nx; py=ny; } gfx.stroke(); } }
      gfx.globalAlpha=1; }
    // the shatter: dark shards fly out and rainbow rings of color sweep across the stage
    if(ms>P.shatter&&ms<P.shatter+1100) { const q2=seg(ms,P.shatter,P.shatter+1100);
      gfx.globalAlpha=1-q2; for(let j=0;j<26;j++) { const a=j/26*Math.PI*2+j*.4,r=20+q2*(260+j%5*40); gfx.save(); gfx.translate(L.x+Math.cos(a)*r*1.3,L.y+Math.sin(a)*r*.7+q2*q2*40); gfx.rotate(a+q2*7);
        gfx.fillStyle=j%3?'#1a1030':'#4a2a7a'; gfx.beginPath(); gfx.moveTo(0,-9); gfx.lineTo(8,6); gfx.lineTo(-7,5); gfx.closePath(); gfx.fill(); gfx.restore(); }
      ['#ff7a8a','#ffd04a','#7ae08a','#6ac8ff','#c08aff'].forEach((c,j)=>{ const p=cl(q2*1.3-j*.08); if(p<=0||p>=1) return; gfx.globalAlpha=(1-p)*.9; ring(L.x,L.y,20+p*520,14+p*300,6,c); });
      gfx.globalAlpha=1; }
    bars(ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.end-100)))); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Cuddle.'); B2.aim=null; S('stun'); }],
    [P.ghost0,()=>{ S('creak'); setMessage('The dark closes in. Tom is alone in it, and fading.'); }],
    [P.sniff,()=>{ S('sniff'); setMessage('Far away, Nara puts her nose down. She knows that smell.'); word('SNFF SNFF',N0.x,Math.max(56,N0.base-NH-40),GOLD,3,.7); }],
    [P.run,()=>{ S('bark'); }],
    [P.climb,()=>{ S('boing'); setMessage('She finds him, and climbs right into his lap.'); }],
    [P.nline,()=>{ say('nara','tombo3'); }],
    [P.tline,()=>{ say('tom','tombonara3'); }],
    [P.warm0+200,()=>{ S('heal'); }],
    [P.crack0,()=>{ S('creak'); S('levelChime'); setMessage('The warmth spreads. The dark starts to crack.'); }],
    [P.shatter,()=>{ S('crash'); S('fanfare'); battle.shakeEnemy=.6; word('COLOR!',GR.x,52,'#fffbe6',6,1.1); setMessage('The dark shatters into color!'); }],
    [P.hop,()=>{ S('bark'); }],
    [P.apply,()=>{ E2.apply(); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sN.x,mid:sN.b-NH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.55); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:['#ff7a8a','#ffd04a','#7ae08a','#6ac8ff'][i%4],w:3}); landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.shatter]);
  steps.push([P.end,'end',()=>(E2.result||'')+' She found him. She always will.']);
  ST.play(E2,steps);
};

// ================= Family Finishes (tombo-review.md "Family Finishes"; 3 or 4 members, 75% HEART) =================
// E2.mem is everyone taking part, E2.fx their battle.fx in the same order. Every body starts from where it was last
// drawn (Rose may be on Tom's shoulders) and walks home at the end.
const startOf=u=>{ const d=battle.drawnAt&&battle.drawnAt[u.idx],h=ST.unit(u); return d?{x:d.cx,b:d.base}:{x:h.x,b:h.base}; };
const ffHop=(ms,a,b)=>ms>a&&ms<b?-Math.abs(Math.sin(ms/75))*6:0;   // a little bounce while gliding (Tom, Grace, Rose have no run frames)

// ---------- Sleepover at Tom's (Family Finish 1: Tom, TNB, Grace, Rose) ----------
// The girls' first night at Tom and TNB's. Rose builds a blanket fort, Grace starts a dance party in it, Tom hands
// out snacks, TNB tells a scary story with a flashlight. The fort grows into a castle and topples onto the monsters.
// Effects: Sparkle hit on every enemy (warms them), party heals 60%, fresh costumes, Rose rides Tom, Trending locks 2.
const snackBag=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); RO(-6,-6,12,13,'#e0402e'); R(-3,-6,3,13,CREAM); R(3,-6,2,13,CREAM);
  for(const [a,b2] of [[-4,-8],[1,-10],[4,-8],[-1,-7]]) popcorn(a,b2,2.6); gfx.restore(); };
// The fort: a quilt wall over two chairs with a lit doorway. k 0..1 grows it into a castle (crenellations, three
// turrets with flags, H tall). Drawn about its left bottom corner (px,by), rotated by rot, squashed across by sq.
const fortCastle=(px,by,W,H,o)=>{ const k=o.k||0,ms=o.ms||0,sq=o.sq==null?1:o.sq,wh=lerp(100,H*.7,k),th=lerp(100,H,k);
  gfx.save(); gfx.translate(px,by); gfx.rotate(o.rot||0); gfx.scale(sq,1);
  if(k<.6) { gfx.globalAlpha*=1; for(const x of [8,W-8]) { RO(x-3,-wh-26,6,wh+26,'#8a5a30'); R(x-9,-wh*.55,18,4,'#6a4220'); } }
  gfx.beginPath(); gfx.moveTo(0,0); gfx.lineTo(0,-wh);
  if(k<.3) gfx.quadraticCurveTo(W/2,-wh+22*(1-k/.3),W,-wh);
  else { const n=11,cw=W/n,ck=cl((k-.3)/.3); for(let j=0;j<n;j++) { const up=j%2?-wh:-wh-12*ck; gfx.lineTo(j*cw,up); gfx.lineTo((j+1)*cw,up); } }
  gfx.lineTo(W,0); gfx.closePath(); gfx.fillStyle='#5a7ac8'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  gfx.save(); gfx.clip(); for(let r=0;r<14;r++) for(let q=0;q<10;q++) { if((r+q)%3) continue; R(q*W/10+3,-r*28-24,W/10-6,20,['#e88aa8','#ffd27a','#8ad0a8'][(r*2+q)%3]); } gfx.restore();
  // the lit doorway (everyone stands in front of it, so they read as inside)
  const dw=W-56,dh=96; gfx.beginPath(); gfx.moveTo(28,0); gfx.lineTo(28,-dh+20); gfx.quadraticCurveTo(28,-dh,48,-dh); gfx.lineTo(28+dw-20,-dh); gfx.quadraticCurveTo(28+dw,-dh,28+dw,-dh+20); gfx.lineTo(28+dw,0); gfx.closePath();
  gfx.fillStyle='#3a2a50'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  if(o.disco>0) { gfx.save(); gfx.clip(); for(let j=0;j<6;j++) { const a=ms/400+j*1.05; gfx.globalAlpha=o.disco*.5; E(28+dw/2+Math.cos(a)*dw*.4,-dh/2+Math.sin(a*1.3)*dh*.35,16,10,['#ff7a8a','#ffd04a','#7ae08a','#6ac8ff','#c08aff','#ff9ac0'][j]); } gfx.restore(); gfx.globalAlpha=1; }
  // fairy lights along the top
  for(let j=0;j<=14;j++) { const on=(Math.floor(ms/300)+j)%3; E(j*W/14,-wh-3+Math.sin(j*1.7)*3,2.6,2.6,on?['#ffd04a','#ff9ac0','#9fd8ff'][j%3]:'#7a6a5a'); }
  // Rose's sign
  RO(W/2-30,-dh-22,60,14,'#c89a5a'); label('NO GROWN-UPS',W/2,-dh-18,'#3a2a1a',1);
  // turrets with pennants
  if(k>.25) { const tk=ez(cl((k-.25)/.55));
    for(const [tx,c,f] of [[16,'#e88aa8',.88],[W/2,'#ffd27a',1],[W-16,'#8ad0a8',.88]]) { const tt=lerp(wh,th,tk)*f;
      RO(tx-16,-tt,32,tt,'#6a8ad8'); for(let y=-tt+16;y<-dh-30;y+=30) R(tx-4,y,8,11,'#2a2244');
      gfx.beginPath(); gfx.moveTo(tx-20,-tt); gfx.lineTo(tx,-tt-30*tk); gfx.lineTo(tx+20,-tt); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
      const fy=-tt-30*tk; Ln(tx,fy,tx,fy-16*tk,2,OUT); gfx.fillStyle=c; gfx.beginPath(); gfx.moveTo(tx,fy-16*tk); gfx.lineTo(tx+13*tk+Math.sin(ms/110)*2,fy-12*tk); gfx.lineTo(tx,fy-8*tk); gfx.closePath(); gfx.fill(); } }
  gfx.restore(); };
B2_TOMBO_ANIM.ff1=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),tom=by0('tom'),tnb=by0('tnb'),gr=by0('grace'),ro=by0('rose');
  const fxOf=u=>E2.fx[mem.indexOf(u)],list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty(),T=ST.unit(tom);
  const SP=id=>BATTLE_SPRITES[id],Hof=id=>SP(id).idle.length*SP(id).scale;
  const by=cl(Math.max(GR.base,T.base-12),236,296),fc=cl(GR.x1+170,GR.x1+140,450),W=220,px=fc-104,H=cl(px-GR.x0+10,170,300);
  const spot={rose:{x:fc-62,b:by+8},grace:{x:fc-18,b:by+4},tnb:{x:fc+30,b:by},tom:{x:fc+80,b:by-4}};
  const T0=5400,T1=6000,TH0=Math.PI/2;
  // each monster is hit when the falling castle reaches its head
  const order=order3(list).map(o=>{ const d=Math.max(4,px-o.q.x),th=Math.atan(d/Math.max(30,o.q.h*.8)); o.t=T0+Math.sqrt(th/TH0)*(T1-T0); return o; }).sort((a,b)=>a.t-b.t);
  const last=order.length?order[order.length-1].t:T1;
  const P={walk:800,build0:850,build1:1750,rline:1450,dance0:2000,dance1:2950,snack0:2200,story0:3050,nline:3200,eek:4150,story1:4350,grow0:4400,grow1:5100,wob:5100,
    top0:T0,top1:T1,apply:last+250,fade:last+500,home:last+1000,end:last+1800};
  const st={};
  const body=(u,fn)=>{ const s0=startOf(u),s2=st[u.id]={x:s0.x,b:s0.b,f:SP(u.id).idle};
    pathOf(fxOf(u),P.end,(ms,c)=>{ const sp=c.sp,o=spot[u.id]; let x=o.x,y=o.b,f=sp.idle;
      if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(s0.x,o.x,k); y=lerp(s0.b,o.b,k)+ffHop(ms,0,P.walk); f=runFr(sp,c.t,-1); }
      else if(ms<P.home) { const r=fn(ms,sp); if(r) { f=r.f||f; y+=r.dy||0; } }
      else { const H2=u===ro&&b2Alive(tom)&&battle.drawnAt[tom.idx]?(d=>({x:d.cx+2,b:d.base-d.h+20}))(battle.drawnAt[tom.idx]):{x:c.origX,b:c.origBase};
        const k=ez(seg(ms,P.home,P.home+700)); x=lerp(o.x,H2.x,k); y=lerp(o.b,H2.b,k)+ffHop(ms,P.home,P.home+700); f=k<1?runFr(sp,c.t,1):sp.idle; }
      s2.x=x; s2.b=y; s2.f=f; return {cx:x,base:y,frame:f}; }); };
  const scared=ms=>ms>P.eek&&ms<P.eek+500?-Math.sin(seg(ms,P.eek,P.eek+500)*Math.PI)*26:0;
  const cheer=ms=>ms>T1&&ms<P.home;
  body(ro,(ms,sp)=>{ if(ms>P.build0&&ms<P.build1) return {f:Math.floor(ms/200)%2?sp.act:sp.celeb,dy:-Math.abs(Math.sin(ms/110))*8};
    if(ms>P.dance0&&ms<P.dance1) return {f:sp.celeb,dy:-Math.abs(Math.sin(ms/140))*12};
    if(ms>P.eek&&ms<P.eek+500) return {f:sp.celeb,dy:scared(ms)}; if(cheer(ms)) return {f:sp.celeb}; return null; });
  body(gr,(ms,sp)=>{ if(ms>P.dance0&&ms<P.dance1) return {f:Math.floor(ms/220)%2?(sp.celebFlip||sp.celeb):sp.celeb,dy:-Math.abs(Math.sin(ms/110))*14};
    if(ms>P.eek&&ms<P.eek+500) return {f:sp.celeb,dy:scared(ms)*.8}; if(cheer(ms)) return {f:sp.celebFlip||sp.celeb}; return null; });
  body(tnb,(ms,sp)=>{ if(ms>P.story0&&ms<P.story1) return {f:sp.clap||sp.idle}; if(cheer(ms)) return {f:sp.celeb}; return null; });
  body(tom,(ms,sp)=>{ if(ms>P.snack0&&ms<P.snack0+900) return {f:sp.act}; if(ms>P.eek&&ms<P.eek+500) return {f:sp.celeb}; if(cheer(ms)) return {f:sp.celeb}; return null; });
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const grow=ms=>ez(seg(ms,P.grow0,P.grow1)),build=ms=>ez(seg(ms,P.build0,P.build1));
  const wob=ms=>ms>P.wob&&ms<T0?Math.sin(ms/45)*.025*seg(ms,P.wob,T0):0;
  const fall=ms=>TH0*Math.pow(seg(ms,T0,T1),2);
  const disco=ms=>ms>P.dance0&&ms<P.dance1+300?Math.min(1,seg(ms,P.dance0,P.dance0+200))*(1-seg(ms,P.dance1,P.dance1+300)):0;
  const fortA=ms=>1-seg(ms,P.fade,P.home);
  // Behind everyone: a cozy living room at night, and the fort while it stands.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#1a1430',.55);
    if(ms<T0) { const b=build(ms); if(b<=0) return;
      // pieces fly in: the fort fades and drops into place while it is being built
      gfx.globalAlpha=b; gfx.save(); gfx.translate(0,-(1-b)*40); fortCastle(px,by,W,H,{k:grow(ms),rot:wob(ms),ms,disco:disco(ms)}); gfx.restore(); gfx.globalAlpha=1; } }});
  const tnbChin=()=>{ const s2=st.tnb; return {x:s2.x-4,y:s2.b-Hof(tnb.id)*.66}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // pillows and cushions flying into place while Rose builds
    if(ms>P.build0&&ms<P.build1) for(let j=0;j<5;j++) { const q2=seg(ms,P.build0+j*150,P.build0+j*150+450); if(q2<=0||q2>=1) continue;
      const x=lerp(px+W+40,px+20+j*45,q2),y=lerp(by-160,by-110,q2)-Math.sin(q2*Math.PI)*40; gfx.save(); gfx.translate(x,y); gfx.rotate(q2*6);
      RO(-14,-9,28,18,['#e88aa8','#ffd27a','#8ad0a8','#9fb8ff','#ffb07a'][j]); E(-8,-3,3,2,CREAM); gfx.restore(); }
    // the story: lights out, one flashlight under TNB's chin
    if(ms>P.story0&&ms<P.story1+200) { const dk=Math.min(1,seg(ms,P.story0,P.story0+250))*(1-seg(ms,P.story1,P.story1+200)),c=tnbChin();
      if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const g=darkC.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,576,324); g.fillStyle='#07040e'; g.fillRect(0,0,576,324);
      g.globalCompositeOperation='destination-out'; const fl=.85+.15*Math.sin(ms/37);
      g.fillStyle='rgba(0,0,0,'+(.8*fl)+')'; g.beginPath(); g.moveTo(c.x,c.y+4); g.lineTo(c.x-24,c.y-58); g.lineTo(c.x+24,c.y-58); g.closePath(); g.fill();
      const gr2=g.createRadialGradient(c.x,c.y-22,6,c.x,c.y-22,40); gr2.addColorStop(0,'rgba(0,0,0,1)'); gr2.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr2; g.beginPath(); g.arc(c.x,c.y-22,40,0,Math.PI*2); g.fill();
      g.globalCompositeOperation='source-over'; gfx.globalAlpha=.9*dk; gfx.drawImage(darkC,0,0);
      gfx.globalAlpha=dk*.25*fl; gfx.fillStyle='#ffe9a0'; gfx.beginPath(); gfx.moveTo(c.x,c.y+4); gfx.lineTo(c.x-24,c.y-58); gfx.lineTo(c.x+24,c.y-58); gfx.closePath(); gfx.fill();
      gfx.globalAlpha=dk; RO(c.x-3,c.y,6,12,'#3a3a44'); E(c.x,c.y,4,2,'#fff2a0'); gfx.globalAlpha=1; }
    // the castle topples onto the monsters, squashing flat like a big soft heap
    if(ms>=T0&&ms<P.home) { const th=fall(ms),sq=lerp(1,.38,seg(ms,T0,T1)),bounce=ms>T1?Math.sin(seg(ms,T1,T1+260)*Math.PI)*.04:0;
      gfx.globalAlpha=fortA(ms); fortCastle(px,by,W,H,{k:1,rot:-th+bounce,sq,ms}); gfx.globalAlpha=1;
      if(ms>T1&&ms<T1+900) { const q2=seg(ms,T1,T1+900); gfx.globalAlpha=1-q2;
        for(let j=0;j<16;j++) { const x=lerp(px-H,px,j/15),y=by-60-q2*(40+(j%4)*20); gfx.save(); gfx.translate(x+Math.sin(j*3+q2*6)*8,y); gfx.rotate(j+q2*3); E(0,0,5,2,'#fffaf0'); gfx.restore(); } gfx.globalAlpha=1; } }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('FAMILY FINISH! Sleepover at Tom’s.'); B2.aim=null; S('levelChime'); }],
    [P.build0,()=>{ S('whoosh'); setMessage('Rose builds a blanket fort. Every pillow in the house.'); }],
    [P.rline,()=>{ say('rose','ff1'); }],
    [P.dance0,()=>{ S('fanfare'); word('DANCE PARTY!',fc,40,'#ff9ac0',4,.9); setMessage('Grace starts a dance party in the fort.'); }],
    [P.snack0,()=>{ S('whoosh'); setMessage('Tom hands out snacks. Popcorn for everyone.');
      const h=handPt(SP('tom'),SP('tom').act,spot.tom.x,spot.tom.b,-1);
      [ro,gr,tnb].forEach((m,j)=>{ const o=spot[m.id]; ST.fly((x,y)=>snackBag(x,y,1),h.x,h.y,o.x+4,o.b-Hof(m.id)*.5,.45,40,j*.18); }); }],
    [P.story0,()=>{ S('stun'); setMessage('TNB turns off the lights and clicks on a flashlight.'); }],
    [P.nline,()=>{ say('tnb','ff1'); }],
    [P.eek-150,()=>{ S('creak'); }],
    [P.eek,()=>{ S('boo'); word('EEK!',spot.grace.x,66,'#fffbe6',4,.5); }],
    [P.grow0,()=>{ S('rumble'); setMessage('The fort keeps growing. It\'s a castle now.'); }],
    [P.wob,()=>{ S('creak'); }],
    [T0,()=>{ S('slideWhistle'); setMessage('And it topples right onto the monsters!'); }],
    [T1,()=>{ S('crash'); battle.shakeEnemy=.7; word('FLUMP!',GR.x,52,'#fffbe6',6,1); }],
    [P.apply,()=>{ E2.apply(); for(const p of party) { const s2=st[p.id]&&mem.includes(p)?{x:st[p.id].x,mid:st[p.id].b-Hof(p.id)*.5}:ST.unit(p); scene('glow',1,{x:s2.x,y:s2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('thud'); ST.jolt(o.f,.55); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:CREAM,w:3}); landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:T1]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Lights out at nine. Maybe ten.']);
  ST.play(E2,steps);
};

// ---------- Run With Us, Mommy! (Family Finish 2: Amy, Grace, Rose; no Tom) ----------
// A grey wall of ticking clocks rises; its chains and a stack of ungraded papers force Amy to one knee. Grace runs in,
// sticks a gold star on her and counts her in (5 6 7 8); Rose ties her pink ribbon on Mom's wrist and hands her Lamby.
// The girls take Mom's hands and pull her up, and the three of them sprint right through the wall (the chains turn into
// yellow finish tape) and on through every monster. Effects: Kinetic hit on every enemy; the party loses its debuffs,
// gets 3 VP and Personal Best for 3 turns, and moves up the line.
const chainLine=(x0,y0,x1,y1,sag,c,k=1)=>{ const n=Math.max(3,Math.floor(Math.hypot(x1-x0,y1-y0)/7*k));
  for(let j=0;j<n;j++) { const q=j/(Math.max(1,Math.hypot(x1-x0,y1-y0)/7)),x=lerp(x0,x1,q),y=lerp(y0,y1,q)+Math.sin(q*Math.PI)*sag; if(q>1) break;
    E(x,y,j%2?4.5:3.2,j%2?2.6:3.6,OUT); E(x,y,j%2?3.2:2,j%2?1.4:2.4,c); } };
const clockFace=(x,y,r,ms,sp)=>{ EO(x,y,r,r,'#f4f0e6'); const a=ms/sp,b=ms/(sp*12); Ln(x,y,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,2,OUT); Ln(x,y,x+Math.cos(b)*r*.5,y+Math.sin(b)*r*.5,3,OUT); E(x,y,1.6,1.6,RED); };
const paperStack=(x,y,n,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); for(let j=0;j<n;j++) { RO(-13+j%2*2,-j*4,26,4,'#fbf8ee'); } R(-8,-n*4+1,10,1.5,RED); gfx.restore(); };
B2_TOMBO_ANIM.ff2=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),amy=by0('amy'),gr=by0('grace'),ro=by0('rose');
  const fxOf=u=>E2.fx[mem.indexOf(u)],list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty(),A=ST.unit(amy);
  const SP=id=>BATTLE_SPRITES[id],Hof=id=>SP(id).idle.length*SP(id).scale,asp=SP(amy.id);
  const by=cl(Math.max(GR.base,A.base-12),236,296),ax=cl(GR.x1+150,GR.x1+120,460),wx=ax-78,WH=170,gx=ax+40,rx=ax-34;
  const SPR=5000,V=.42,xL=Math.max(30,GR.x0-24),smash=SPR+(ax-(wx+22))/V,TL=SPR+(ax-xL)/V;
  const order=order3(list).map(o=>{ o.t=SPR+Math.max(0,ax-o.q.x)/V; return o; }).sort((a,b)=>a.t-b.t);
  const last=order.length?order[order.length-1].t:smash+200;
  const P={walk:700,wall0:250,wall1:750,chain0:850,chain1:1150,paper0:1050,paper1:1350,kneel:1250,girls0:1800,girls1:2300,star0:2400,star1:2650,
    count:2700,rib0:2700,rib1:3050,rline:3300,pull:3900,stand:4150,aline:4250,sprint:SPR,smash,turn:TL,home:TL+80};
  const st={};
  const retDur=u=>Math.max(500,Math.abs(ST.unit(u).x-xL)/.62);
  P.apply=P.home+Math.max(...[amy,gr,ro].map(retDur))+60; P.end=P.apply+800;   // effects land once everyone is home
  const runBack=(ms,c,u,dx,dy)=>{ const k=ez(seg(ms,P.home,P.home+retDur(u))); return {x:lerp(xL+dx,c.origX,k),y:lerp(by+dy,c.origBase,k)+ffHop(ms,P.home,P.home+retDur(u)),f:k<1?runFr(c.sp,c.t,1):c.sp.idle}; };
  const sprintX=ms=>Math.max(xL,ax-(ms-SPR)*V);
  // Amy
  { const s0=startOf(amy),s2=st.amy={x:s0.x,b:s0.b,f:asp.idle};
    pathOf(fxOf(amy),P.end,(ms,c)=>{ const sp=c.sp; let x=ax,y=by,f=sp.idle;
      if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(s0.x,ax,k); y=lerp(s0.b,by,k); f=runFr(sp,c.t,-1); }
      else if(ms<P.kneel) f=sp.idle;
      else if(ms<P.stand) f=sp.kneel;
      else if(ms<SPR) f=ms<P.stand+400?sp.celeb:sp.idle;
      else if(ms<P.home) { x=sprintX(ms); f=runFr(sp,c.t*1.3,-1); y=by-Math.abs(Math.sin(ms/60))*3; }
      else { const r=runBack(ms,c,amy,0,0); x=r.x; y=r.y; f=r.f; }
      s2.x=x; s2.b=y; s2.f=f; return {cx:x,base:y,frame:f}; }); }
  // the girls: run in, help, then sprint at Mom's sides (Grace a little behind, Rose a little in front)
  const girl=(u,spot,face,dx,dy,actK)=>{ const s0=startOf(u),s2=st[u.id]={x:s0.x,b:s0.b,f:SP(u.id).idle};
    pathOf(fxOf(u),P.end,(ms,c)=>{ const sp=c.sp,fr=face>0?sp.flip:sp.idle; let x=s0.x,y=s0.b,f=sp.idle;
      if(ms<P.girls0) {}
      else if(ms<P.girls1) { const k=ez(seg(ms,P.girls0,P.girls1)); x=lerp(s0.x,spot.x,k); y=lerp(s0.b,spot.b,k)+ffHop(ms,P.girls0,P.girls1); f=runFr(sp,c.t,spot.x>s0.x?1:-1); }
      else if(ms<SPR) { x=spot.x; y=spot.b; f=fr;
        if(ms>actK[0]&&ms<actK[1]) f=face>0?mirrorRowsCached(sp,'act'):sp.act;
        if(ms>P.pull&&ms<P.stand+200) { f=face>0?mirrorRowsCached(sp,'act'):sp.act; x+=face>0?-Math.sin(seg(ms,P.pull,P.stand)*Math.PI)*4:Math.sin(seg(ms,P.pull,P.stand)*Math.PI)*4; }
        if(ms>P.stand&&ms<P.stand+400) { f=sp.celeb; y-=Math.sin(seg(ms,P.stand,P.stand+400)*Math.PI)*14; } }
      else if(ms<P.home) { const k=ez(seg(ms,SPR,SPR+220)); x=lerp(spot.x,sprintX(ms)+dx,k); y=lerp(spot.b,by+dy,k)-Math.abs(Math.sin(ms/55))*5; f=sp.run?runFr(sp,c.t*1.3,-1):sp.act; }
      else { const r=runBack(ms,c,u,dx,dy); x=r.x; y=r.y; f=r.f; }
      s2.x=x; s2.b=y; s2.f=f; return {cx:x,base:y,frame:f}; }); };
  girl(gr,{x:gx,b:by-6},-1,14,-9,[P.star0,P.star1]);
  girl(ro,{x:rx,b:by+6},1,-12,8,[P.rib0,P.rib1]);
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const aTop=()=>st.amy.b-st.amy.f.length*asp.scale,aH=()=>st.amy.f.length*asp.scale;
  const shoulder=s=>({x:st.amy.x+s*9,y:aTop()+aH()*.36});
  const head=()=>({x:st.amy.x-3,y:aTop()+aH()*.12});
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#1a1e26',.55);
    // dawn light once the wall breaks
    if(ms>P.smash) { gfx.globalAlpha=.22*Math.sin(seg(ms,P.smash,P.end)*Math.PI)*k; R(0,0,576,324,'#ffd27a'); gfx.globalAlpha=1; } }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the wall of clocks: rises from the floor, shatters when they run through it
    if(ms>P.wall0&&ms<P.smash) { const rk=ez(seg(ms,P.wall0,P.wall1)),top=by-WH*rk; gfx.save(); gfx.beginPath(); gfx.rect(wx-40,0,80,by+4); gfx.clip();
      RO(wx-22,top,44,WH,'#6a6e78'); for(let y=top+10;y<by-6;y+=22) { R(wx-20,y,40,2,'#585c66'); E(wx-16,y+6,1.6,1.6,'#8a8e98'); E(wx+16,y+6,1.6,1.6,'#8a8e98'); }
      clockFace(wx,top+28,11,ms,120); clockFace(wx-4,top+78,9,ms,90); clockFace(wx+3,top+124,10,ms,150);
      gfx.save(); gfx.translate(wx+8,top+52); gfx.rotate(.2); RO(-8,-6,16,12,'#fbf8ee'); R(-5,-2,10,1.2,RED); gfx.restore();
      if(ms>P.pull) { const ck=seg(ms,P.pull,P.smash); gfx.strokeStyle='#2a2c32'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(wx+4,top+20); gfx.lineTo(wx-6,top+60*ck+20); gfx.lineTo(wx+8,top+120*ck+30); gfx.stroke(); }
      gfx.restore(); }
    if(ms>P.smash&&ms<P.smash+900) { const q2=seg(ms,P.smash,P.smash+900); gfx.globalAlpha=1-q2;
      for(let j=0;j<16;j++) { const yy=by-WH+j/16*WH,dir=j%2?-1:1,dx=dir*(8+q2*(40+j*5))-q2*60; gfx.save(); gfx.translate(wx+dx,yy+q2*q2*70); gfx.rotate(q2*7+j); R(-7,-5,14,10,j%4?'#6a6e78':'#f4f0e6'); gfx.restore(); } gfx.globalAlpha=1; }
    // chains from the wall over Amy's shoulders until the smash; then the two ends turn into yellow finish tape
    if(ms>P.chain0&&ms<P.smash) { const ck=ez(seg(ms,P.chain0,P.chain1)),top=by-WH,lift=ms>P.stand?-6:0;
      for(const [y0,s] of [[top+58,-1],[top+104,1]]) { const e=shoulder(s); chainLine(wx+20,y0,lerp(wx+20,e.x,ck),lerp(y0,e.y+lift,ck),10,'#9aa0aa',ck); } }
    if(ms>P.smash&&ms<P.home+400) { const a=1-seg(ms,P.home,P.home+400),c=shoulder(0);
      for(const s of [-1,1]) { gfx.globalAlpha=a; gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath();
        for(let j=0;j<=12;j++) { const q=j/12,x=c.x+8+q*70,y=c.y+s*6+Math.sin(q*9-ms/50+s)*6*q; j?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke();
        gfx.strokeStyle='#ffe04a'; gfx.lineWidth=3.5; gfx.stroke(); } gfx.globalAlpha=1; }
    // the stack of ungraded papers on her back; it slides off when she stands
    if(ms>P.paper0&&ms<P.stand+500) { const fk=ez(seg(ms,P.paper0,P.paper1)),off=seg(ms,P.stand,P.stand+500),s=shoulder(1);
      gfx.globalAlpha=1-off; paperStack(s.x+off*30,lerp(s.y-90,s.y-2,fk)+off*off*40,7,off*1.2); gfx.globalAlpha=1; }
    // Grace's gold star: flies to Mom's forehead and stays
    if(ms>P.star0) { const h=head(); let x=h.x,y=h.y,a=1-seg(ms,P.home,P.home+500);
      if(ms<P.star1) { const g=handPt(SP(gr.id),SP(gr.id).act,gx,by-6,-1),q=ez(seg(ms,P.star0,P.star1)); x=lerp(g.x,h.x,q); y=lerp(g.y,h.y,q)-Math.sin(q*Math.PI)*30; }
      if(a>0) { gfx.globalAlpha=a; star(x,y,7,GOLD); gfx.globalAlpha=1; } }
    // Rose's ribbon on Mom's wrist, and Lamby in her hand
    if(ms>P.rib0&&ms<P.home+400) { const hA=handPt(asp,st.amy.f,st.amy.x,st.amy.b,-1),a=1-seg(ms,P.home,P.home+400),q=ez(seg(ms,P.rib0,P.rib1));
      gfx.globalAlpha=a;
      if(ms<P.rib1) { const hR=handPt(SP(ro.id),mirrorRowsCached(SP(ro.id),'act'),rx,by+6,1); gfx.strokeStyle='#ff7ab0'; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(hR.x,hR.y);
        gfx.quadraticCurveTo((hR.x+hA.x)/2,Math.min(hR.y,hA.y)-16+Math.sin(ms/60)*4,lerp(hR.x,hA.x,q),lerp(hR.y,hA.y,q)); gfx.stroke(); }
      else { EO(hA.x-4,hA.y,3,2.4,'#ff7ab0'); EO(hA.x+4,hA.y,3,2.4,'#ff7ab0'); E(hA.x,hA.y,1.6,1.6,'#d84a8a');
        gfx.save(); gfx.translate(hA.x-6,hA.y-10); gfx.scale(.45,.45); PROP2.lamby({flip:false},0); gfx.restore(); }
      gfx.globalAlpha=1; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('FAMILY FINISH! Run With Us, Mommy!'); B2.aim=null; S('levelChime'); }],
    [P.wall0,()=>{ S('rumble'); }],
    [P.chain0,()=>{ S('jangle'); setMessage('A grey wall of clocks rises. Everything lands on Amy at once.'); }],
    [P.kneel,()=>{ S('thud'); }],
    [1700,()=>{ word('EXHAUSTION',wx,40,'#b8bcc8',3,1.2); }],
    [P.girls0,()=>{ S('step'); setMessage('Grace and Rose run to their mom.'); }],
    [P.star1,()=>{ S('ding'); setMessage('Grace sticks a gold star on her and counts her in.'); }],
    ...['5','6','7','8!'].map((t,i)=>[P.count+i*160,()=>{ S('clap'); word(t,ax-60+i*40,46,'#ffe08a',4,.45); }]),
    [P.rib1,()=>{ S('chime2'); setMessage('Rose ties her ribbon on Mom’s wrist and hands her Lamby.'); }],
    [P.rline,()=>{ say('rose','ff2'); }],
    [P.pull,()=>{ S('whoosh'); setMessage('They each take one of Mom’s hands, and pull.'); }],
    [P.stand,()=>{ S('levelChime'); }],
    [P.aline,()=>{ say('amy','ff2'); }],
    [SPR,()=>{ S('whoosh'); setMessage('Three across. Nobody stops them.'); }],
    [P.smash,()=>{ S('crash'); S('fanfare'); battle.shakeEnemy=.6; word('FINISH LINE!',Math.max(120,GR.x),52,'#ffe04a',5,1.1); }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.6); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:'#ffe04a',w:3}); landHit(split100(i,order.length)); }]); });
  steps.push([P.apply,()=>{ E2.apply(); for(const p of party) { const s2=st[p.id]&&mem.includes(p)?{x:st[p.id].x,mid:st[p.id].b-Hof(p.id)*.5}:ST.unit(p); scene('glow',1,{x:s2.x,y:s2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }]);
  steps.push(['hf',order.length?order[0].t:P.smash]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Personal best. All three of them.']);
  ST.play(E2,steps);
};
// ---------- Fifty-One Years & Counting (Family Finish 3: Deedee, Boppy, Tom) ----------
// A cold amber hourglass rises and the sand starts turning Deedee and Boppy to stone. Boppy takes her hand and the grey
// falls away. A golden film reel spins around them: young Boppy and Nurse Deedee dancing, who turn into today's selves.
// Tom frames their picture behind them. They swing their joined hands forward and a gold wedding-ring shockwave
// shatters the hourglass into roses and hot peppers over the monsters. Effects: Cozy hit on every enemy (warms them);
// fallen friends get up at 50%, the party heals 60% and is Tucked In and Shielded for 3 turns.
const flower=(x,y,s,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  E(5,4,4,2,'#3a8a3a'); EO(0,0,5,5,'#d8304a'); E(0,0,3.2,3.2,'#a81e36'); E(-1,-1,1.4,1.4,'#f05a6a'); gfx.restore(); };
const pepper=(x,y,s,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  gfx.beginPath(); gfx.moveTo(-8,0); gfx.quadraticCurveTo(-2,-5,6,-3); gfx.quadraticCurveTo(9,0,6,2); gfx.quadraticCurveTo(-2,4,-8,0); gfx.closePath();
  gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#e0302a'; gfx.fill(); E(-2,-1.6,3,.9,'#ff8a6a');
  Ln(6,-1,10,-5,2.6,'#3a8a3a'); gfx.restore(); };
// A burst of roses and peppers from (x,y) toward dx, k 0..1 (seeded, so every frame draws the same flight).
const bloom=(x,y,k,n,dx,spread)=>{ if(k<=0||k>=1) return; gfx.globalAlpha=k>.8?(1-k)/.2:1;
  for(let j=0;j<n;j++) { const a=(j*2.399)%(Math.PI*2),sp2=.5+((j*37)%10)/10,vx=dx+Math.cos(a)*spread*sp2,vy=-70-((j*53)%40)+Math.sin(a)*20;
    const px=x+vx*k,py=y+vy*k+150*k*k,r=j*1.3+k*8*(j%2?1:-1);
    (j%2?pepper:flower)(px,py,1.1,r); } gfx.globalAlpha=1; };
// The amber hourglass wall: wooden caps, two glass bulbs, sand running from the top into a pile.
const hourglass=(x,b,H,ms,sand)=>{ const w=50,top=b-H,mid=b-H/2;
  gfx.save(); gfx.globalAlpha*=.92;
  const shape=()=>{ gfx.beginPath(); gfx.moveTo(x-w/2+4,top+12); gfx.lineTo(x+w/2-4,top+12); gfx.quadraticCurveTo(x+w/2-2,mid-24,x+4,mid); gfx.quadraticCurveTo(x+w/2-2,mid+24,x+w/2-4,b-12);
    gfx.lineTo(x-w/2+4,b-12); gfx.quadraticCurveTo(x-w/2+2,mid+24,x-4,mid); gfx.quadraticCurveTo(x-w/2+2,mid-24,x-w/2+4,top+12); gfx.closePath(); };
  E(x,mid,w*.9,H*.55,'rgba(255,170,60,.12)');
  shape(); gfx.fillStyle='rgba(255,196,110,.5)'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  gfx.save(); shape(); gfx.clip();
  const tl=lerp(H/2-26,6,sand); R(x-w/2,mid-tl-2,w,tl,'#d88a2a');   // the top sand going down
  const bl=lerp(4,H/2-30,sand); gfx.fillStyle='#d88a2a'; gfx.beginPath(); gfx.moveTo(x-w/2,b-12); gfx.lineTo(x,b-12-bl); gfx.lineTo(x+w/2,b-12); gfx.closePath(); gfx.fill();
  if(sand<1) { R(x-1,mid,2,H/2-12-bl,'#f0a84a'); for(let j=0;j<4;j++) E(x+Math.sin(ms/40+j)*1.5,mid+((ms/3+j*17)%(H/2-14-bl)),1.2,1.2,'#ffd08a'); }
  R(x-w/2+8,top+16,4,H-36,'rgba(255,255,255,.35)'); gfx.restore();
  for(const y of [top,b-12]) { RO(x-w/2-4,y,w+8,12,'#8a5a30'); R(x-w/2-4,y+2,w+8,3,'#a8743e'); }
  for(const s of [-1,1]) RO(x+s*(w/2+1)-3,top+12,6,H-24,'#6a4220');
  gfx.restore(); };
B2_TOMBO_ANIM.ff3=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),dee=by0('deedee'),bop=by0('boppy'),tom=by0('tom');
  const fxOf=u=>E2.fx[mem.indexOf(u)],list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty(),D=ST.unit(dee);
  const SP=id=>BATTLE_SPRITES[id],Hof=id=>SP(id).idle.length*SP(id).scale,dsp=SP('deedee'),bsp=SP('boppy');
  const by=cl(Math.max(GR.base,D.base-12),236,296),fc=cl(GR.x1+175,GR.x1+145,450),wx=Math.max(GR.x1+28,fc-100),WH=170;
  const spot={boppy:{x:fc-30,b:by+4},deedee:{x:fc+16,b:by+4},tom:{x:fc+72,b:by-8}};
  const sepia=sp=>tintOf(sp,'#a8804a',.72);
  const V=.55,launchX=fc-44,LA=5450,wallHit=LA+(launchX-wx)/V;
  const order=order3(list).map(o=>{ o.t=LA+Math.max(0,launchX-o.q.x)/V; return o; }).sort((a,b)=>a.t-b.t);
  const last=order.length?order[order.length-1].t:wallHit+200;
  const P={walk:800,wall0:300,wall1:900,grey0:950,grey1:1750,clasp:1950,hands:2150,dline:2300,reel0:2700,reel1:3000,dance1:4300,bline:3900,
    morph1:4900,reelOut:5000,frame0:4500,frame1:4800,swing:5250,launch:LA,wallHit,apply:last+300,home:last+700,end:last+1500};
  const st={};
  const body=(u,fn)=>{ const s0=startOf(u),s2=st[u.id]={x:s0.x,b:s0.b,f:SP(u.id).idle};
    pathOf(fxOf(u),P.end,(ms,c)=>{ const sp=c.sp,o=spot[u.id]; let x=o.x,y=o.b,f=sp.idle;
      if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(s0.x,o.x,k); y=lerp(s0.b,o.b,k)+ffHop(ms,0,P.walk); f=runFr(sp,c.t,o.x>s0.x?1:-1); if(o.x>s0.x&&!sp.runFlip) f=sp.flip; }
      else if(ms<P.home) { const r=fn(ms,sp); if(r) { f=r.f||f; y+=r.dy||0; x+=r.dx||0; } }
      else { const H2={x:c.origX,b:c.origBase},k=ez(seg(ms,P.home,P.home+700)); x=lerp(o.x,H2.x,k); y=lerp(o.b,H2.b,k)+ffHop(ms,P.home,P.home+700); f=k<1?runFr(sp,c.t,H2.x>o.x?1:-1):sp.idle; }
      s2.x=x; s2.b=y; s2.f=f; return {cx:x,base:y,frame:f}; }); };
  const cheer=ms=>ms>last+100&&ms<P.home;
  const lean=ms=>ms>P.clasp&&ms<P.swing?ez(seg(ms,P.clasp,P.hands))*4:0;
  body(bop,(ms,sp)=>{ if(ms>P.swing&&ms<P.swing+900) return {f:sp.act,dx:-3}; if(cheer(ms)) return {f:sp.celeb};
    if(ms>P.clasp&&ms<P.swing) return {f:sp.flip,dx:lean(ms)}; return null; });
  body(dee,(ms,sp)=>{ if(ms>P.swing&&ms<P.swing+900) return {f:sp.act,dx:-3}; if(cheer(ms)) return {f:sp.celeb2||sp.celeb};
    if(ms>P.clasp&&ms<P.swing) return {f:sp.idle,dx:-lean(ms)}; return null; });
  if(tom) body(tom,(ms,sp)=>{ if(ms>P.frame0&&ms<last+100) return {f:sp.act}; if(cheer(ms)) return {f:sp.celeb}; return null; });
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const stoneK=ms=>.8*ez(seg(ms,P.grey0,P.grey1))*(1-ez(seg(ms,P.hands,P.hands+550)));
  const sandK=ms=>seg(ms,P.wall1,P.wallHit);
  const reelA=ms=>Math.min(1,seg(ms,P.reel0,P.reel1))*(1-seg(ms,P.reelOut,P.reelOut+300));
  const morph=ms=>ez(seg(ms,P.dance1,P.morph1));
  const frameK=ms=>ms<P.frame0?0:(ms<P.frame1?ez(seg(ms,P.frame0,P.frame1)):1)*(1-seg(ms,P.home,P.home+400));
  const Hmax=Math.max(Hof('deedee'),Hof('boppy')),fx0=spot.boppy.x-36,fx1=spot.deedee.x+32,fy0=by-Hmax-18,fy1=by+10;
  const cx=(spot.boppy.x+spot.deedee.x)/2;
  // Behind everyone: warm evening, the picture frame, the back half of the film ring.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#2a1a10',.45);
    if(ms>P.hands) { gfx.globalAlpha=.18*k*(1-seg(ms,P.home,P.end)); E(cx,by-50,130,90,'#ffcf7a'); gfx.globalAlpha=1; }
    const fk=frameK(ms); if(fk>0) { const mx=(fx0+fx1)/2,my=(fy0+fy1)/2,w=(fx1-fx0)*lerp(.6,1,fk),h=(fy1-fy0)*lerp(.6,1,fk);
      gfx.globalAlpha=fk; gfx.lineJoin='miter';
      gfx.strokeStyle=OUT; gfx.lineWidth=14; gfx.strokeRect(mx-w/2,my-h/2,w,h);
      gfx.strokeStyle='#d8a838'; gfx.lineWidth=9; gfx.strokeRect(mx-w/2,my-h/2,w,h);
      gfx.strokeStyle='#ffe08a'; gfx.lineWidth=2; gfx.strokeRect(mx-w/2-2,my-h/2-2,w+4,h+4);
      for(const [px2,py2] of [[mx-w/2,my-h/2],[mx+w/2,my-h/2],[mx-w/2,my+h/2],[mx+w/2,my+h/2]]) EO(px2,py2,6,6,'#ffd04a');
      gfx.globalAlpha=1; }
  }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the hourglass rises, its sand runs, and the ring shatters it
    if(ms>P.wall0&&ms<P.wallHit) { const rk=ez(seg(ms,P.wall0,P.wall1)); gfx.save(); gfx.beginPath(); gfx.rect(wx-50,0,100,by+6); gfx.clip();
      gfx.translate(0,(1-rk)*WH); hourglass(wx,by+4,WH,ms,sandK(ms)); gfx.restore(); }
    if(ms>P.wallHit&&ms<P.wallHit+900) { const q2=seg(ms,P.wallHit,P.wallHit+900); gfx.globalAlpha=1-q2;
      for(let j=0;j<18;j++) { const yy=by-WH+j/18*WH,dir=j%2?-1:1,dx=dir*(6+q2*(30+j*4))-q2*70; gfx.save(); gfx.translate(wx+dx,yy+q2*q2*80); gfx.rotate(q2*8+j);
        gfx.fillStyle=j%3?'rgba(255,190,100,.9)':'#8a5a30'; gfx.beginPath(); gfx.moveTo(0,-6); gfx.lineTo(5,4); gfx.lineTo(-5,3); gfx.closePath(); gfx.fill(); gfx.restore(); } gfx.globalAlpha=1; }
    bloom(wx,by-WH*.6,seg(ms,P.wallHit,P.wallHit+1400),22,-150,60);
    for(const o of order) bloom(o.q.x,o.q.top,seg(ms,o.t,o.t+1100),8,-20,50);
    // the sand turns them to stone, until Boppy takes her hand
    const sk=stoneK(ms); if(sk>0) for(const [id,sp] of [['boppy',bsp],['deedee',dsp]]) { const s3=st[id]; if(s3) drawAt(sp,s3.f,s3.x,s3.b,stoneOf(sp),sk); }
    // their joined hands, with a little heart
    if(ms>P.hands&&ms<P.swing) { const hx=(st.boppy.x+st.deedee.x)/2,hy=st.boppy.b-Hof('boppy')*.42; EO(hx-3,hy,4.5,3.6,SKIN); EO(hx+3,hy+1,4.5,3.6,SKIN2); E(hx+1,hy-2,1.6,1.2,GOLD);
      const q=seg(ms,P.hands,P.hands+1000); if(q<1) { gfx.globalAlpha=fade(q,.6); heart(hx,hy-20-q*30,lerp(5,12,ez(q*3)),PINK); gfx.globalAlpha=1; } }
    // the front half of the film ring, and the picture inside the reel: young Boppy and Nurse Deedee dancing
    const ra=reelA(ms);
    if(ra>0) { const W2=132,H2=104,sx=cl(cx,W2/2+26,550-W2/2),sy=36,m=morph(ms),gk=ez(seg(ms,P.reel0,P.reel1));
      gfx.save(); gfx.globalAlpha=ra; gfx.translate(sx,sy+H2/2); gfx.scale(gk,gk); gfx.translate(-sx,-(sy+H2/2));
      RO(sx-W2/2-6,sy-10,W2+12,H2+20,'#2a1e14');
      for(const s4 of [-1,1]) { const rx2=sx+s4*(W2/2+4),ry2=sy+H2/2; EO(rx2,ry2,15,15,'#3a2a1a'); E(rx2,ry2,11,11,'#c9a23a'); E(rx2,ry2,3,3,'#3a2a1a');
        for(let j=0;j<3;j++) { const a2=ms/(s4>0?160:-160)+j*2.09; E(rx2+Math.cos(a2)*6.5,ry2+Math.sin(a2)*6.5,3,3,'#3a2a1a'); } }
      for(let j=0;j<10;j++) { const hx=sx-W2/2+((j*16-ms/12)%(W2+8)+W2+8)%(W2+8)-2; R(hx,sy-7,6,4,'#e8c27a'); R(hx,sy+H2+3,6,4,'#e8c27a'); }
      gfx.save(); gfx.beginPath(); gfx.rect(sx-W2/2,sy,W2,H2); gfx.clip();
      R(sx-W2/2,sy,W2,H2,m<1?'#c89a62':'#c89a62'); if(m>0) { gfx.globalAlpha=ra*m; R(sx-W2/2,sy,W2,H2,'#6a8ac8'); R(sx-W2/2,sy+H2-16,W2,16,'#5aa05a'); gfx.globalAlpha=ra; }
      const a=ms/420,sc=1.05,fb=sy+H2-6,bx=sx+Math.cos(a)*26,dx2=sx-Math.cos(a)*26,beat=Math.floor(ms/260)%2;
      const pair=[[bsp,beat?bsp.celeb:bsp.flip,bx,Math.sin(a)],[dsp,beat?(dsp.celeb2||dsp.celeb):dsp.celeb,dx2,-Math.sin(a)]].sort((p,q)=>p[3]-q[3]);
      for(const [sp,fr,x,z] of pair) { const yb=fb-Math.abs(Math.sin(ms/130+x))*3+z*3;
        drawAt(sp,fr,x,yb,sp.pal,ra,sc); if(m<1) drawAt(sp,fr,x,yb,sepia(sp),ra*(1-m),sc);
        if(sp===dsp&&m<1) { const top=yb-fr.length*sc; gfx.globalAlpha=ra*(1-m); RO(x-6,top+1,11,5,'#fbf8ee'); R(x-1,top+1,2,5,RED); R(x-3,top+2.5,6,2,RED); gfx.globalAlpha=ra; } }
      if(m<1) for(let j=0;j<14;j++) { gfx.globalAlpha=ra*(1-m)*.35; R(sx-W2/2+((j*53+ms*.7)%W2),sy+((j*31+ms*.3)%H2),1.5,1.5,'#3a2a1a'); }
      gfx.restore(); gfx.restore(); gfx.globalAlpha=1; }
    // Tom's camera flash when the picture is framed
    if(ms>P.frame1&&ms<P.frame1+260) { gfx.globalAlpha=.55*(1-seg(ms,P.frame1,P.frame1+260)); R(fx0,fy0,fx1-fx0,fy1-fy0,'#ffffff'); gfx.globalAlpha=1; }
    // the gold wedding-ring shockwave
    if(ms>P.launch&&ms<last+500) { const x=launchX-(ms-P.launch)*V,y=by-56; if(x>-40) {
      for(let j=3;j>=1;j--) { gfx.globalAlpha=.25/j; ring(x+j*26,y,10+j*3,52+j*6,4,GOLD); }
      gfx.globalAlpha=.3; E(x,y,30,70,'#ffd04a'); gfx.globalAlpha=1;
      ring(x,y,16,62,12,OUT); ring(x,y,16,62,8,'#e8b830'); ring(x-2,y,14,60,2,'#fff2b0');
      const dy=y-64; gfx.save(); gfx.translate(x,dy); gfx.rotate(Math.PI/4); RO(-6,-6,12,12,'#cfefff'); R(-6,-6,6,6,'#ffffff'); gfx.restore();
      star(x+Math.sin(ms/60)*4,dy-12,5,'#ffffff'); } }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('FAMILY FINISH! Fifty-One Years & Counting.'); B2.aim=null; S('levelChime'); }],
    [P.wall0,()=>{ S('rumble'); setMessage('A cold amber hourglass rises. The sand starts to fall.'); }],
    [P.grey0,()=>{ S('creak'); setMessage('Deedee and Boppy start turning to stone.'); }],
    [1750,()=>{ word('AGING',wx,40,'#e8a848',3,1.2); }],
    [P.clasp,()=>{ S('chime2'); setMessage('Boppy reaches over and takes Deedee’s hand.'); }],
    [P.hands,()=>{ S('ding'); }],
    [P.dline,()=>{ say('deedee','ff3'); }],
    [P.reel0,()=>{ S('reel'); setMessage('A golden film reel spins around them. Young Boppy and Nurse Deedee, dancing.'); }],
    [P.bline,()=>{ say('boppy','ff3'); }],
    [P.dance1,()=>{ S('levelChime'); }],
    [P.frame0,()=>{ if(tom) setMessage('Tom frames their picture.'); }],
    [P.frame1,()=>{ S('ding'); word('51 YEARS!',cx,40,GOLD,4,1); }],
    [P.swing,()=>{ S('whoosh'); setMessage('They swing their joined hands forward.'); }],
    [P.launch,()=>{ S('fanfare'); }],
    [P.wallHit,()=>{ S('crash'); battle.shakeEnemy=.6; word('ROSES & PEPPERS!',Math.max(140,GR.x),66,'#ff8a8a',4,1.1); }],
    [P.apply,()=>{ E2.apply(); for(const p of party) { const s2=st[p.id]&&mem.includes(p)?{x:st[p.id].x,mid:st[p.id].b-Hof(p.id)*.5}:ST.unit(p); scene('glow',1,{x:s2.x,y:s2.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
  ];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('thud'); ST.jolt(o.f,.55); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:GOLD,w:3}); landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.wallHit]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Fifty-one years. Still counting.']);
  ST.play(E2,steps);
};

// ---------- The Extra Place (Family Finish 4: the whole party, 3 or more) ----------
// Everyone sits down at one long family table under string lights. Tom sets one extra place at the end, and the
// nearest monster shuffles over and sits down. Everyone raises a glass (the monster too); the CLINK is a shockwave
// across the whole stage. Nara, if she is here, begs under the table. Effects: Sparkle and Cozy hit on every enemy
// (warms them); fallen friends get up at 50%, the party heals 60%, loses its debuffs and refills its VP.
B2_TOMBO_ANIM.ff4=E2=>{ B2.aim=null;
  const mem=E2.mem,tom=mem.find(p=>p.id==='tom'),gr=mem.find(p=>p.id==='grace'),nara=mem.find(p=>p.id==='nara'&&b2Alive(p));
  const list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty(),SP=id=>BATTLE_SPRITES[id],Hof=id=>SP(id).idle.length*SP(id).scale;
  const seated=mem.filter(p=>p.id!=='nara'&&b2Alive(p)).sort((a,b)=>(a.id==='tom'?-1:0)-(b.id==='tom'?-1:0));
  const n=seated.length,by=cl(Math.max(GR.base,ST.unit(seated[0]).base-12),236,296),tR=560;
  const tL=Math.min(GR.x1+26,tR-110-Math.max(0,n-1)*60),tTop=by-36,tBot=by+10;
  const seatX=i=>n<2?(tL+tR)/2+30:lerp(tL+92,tR-34,i/(n-1)),spot={};
  seated.forEach((p,i)=>{ spot[p.id]={x:seatX(i),b:by-6}; });
  const gx=tL+30,ord=order3(list),guest=ord.length?ord[0]:null;
  const ux=n>1?(seatX(0)+seatX(1))/2:tL+70;   // Nara's spot under the table, between the first two chairs
  const P={walk:900,table0:650,table1:1150,place:1350,tline:1550,sit0:2250,sit1:3000,raise:3350,gline:3450,clink:4650};
  const cx=(tL+tR)/2,cy=tTop-30,RV=.8;
  const hits=ord.map(o=>{ const q=o===guest?{x:gx,y:tTop+2-guest.q.h*.5}:{x:o.q.x,y:o.q.mid}; o.t=P.clink+Math.hypot(q.x-cx,q.y-cy)/RV; o.hx=q.x; o.hy=q.y; return o; }).sort((a,b)=>a.t-b.t);
  const last=hits.length?hits[hits.length-1].t:P.clink+300;
  P.apply=last+300; P.home=Math.max(last+650,P.clink+1300); P.end=P.home+1000;
  const st={};
  const kidCup=p=>p.id==='grace'||p.id==='rose';
  for(const p of seated.concat(nara?[nara]:[])) { const s0=startOf(p),isN=p===nara,o=isN?{x:ux,b:by+12}:spot[p.id],s2=st[p.id]={x:s0.x,b:s0.b,f:SP(p.id).idle,hide:false};
    pathOf(E2.fx[mem.indexOf(p)],P.end,(ms,c)=>{ const sp=c.sp; let x=o.x,y=o.b,f=sp.idle,hide=false;
      if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(s0.x,o.x,k); y=lerp(s0.b,o.b,k)+ffHop(ms,0,P.walk); f=runFr(sp,c.t,o.x>s0.x?1:-1); }
      else if(ms<P.home) { if(isN) { hide=true; }
        else if(p===tom&&ms>P.place-150&&ms<P.place+450) f=sp.act;
        else if(ms>P.raise&&ms<P.clink+700) { f=sp.celeb; if(ms>P.clink-120&&ms<P.clink+120) y-=4; }
        else if(ms>P.clink+700) { f=sp.celeb; y-=Math.abs(Math.sin(ms/140+o.x))*6; } }
      else { const k=ez(seg(ms,P.home,P.home+700)); x=lerp(o.x,c.origX,k); y=lerp(o.b,c.origBase,k)+ffHop(ms,P.home,P.home+700); f=k<1?runFr(sp,c.t,c.origX>o.x?1:-1):sp.idle; }
      s2.x=x; s2.b=y; s2.f=f; s2.hide=hide; return {cx:x,base:y,frame:f,hide}; }); }
  const show=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.home,P.end-100)));
  const tableK=ms=>ez(seg(ms,P.table0,P.table1))*(1-ez(seg(ms,P.home,P.home+500)));
  const placeK=ms=>ez(seg(ms,P.place,P.place+300));
  const sitK=ms=>ez(seg(ms,P.sit0,P.sit1));
  // Behind everyone: evening, string lights, chair backs.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#1e1428',.5);
    gfx.globalAlpha=k; for(let j=0;j<3;j++) { const x0=j*200-20,x1=x0+230; gfx.strokeStyle='#3a3020'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(x0,30); gfx.quadraticCurveTo((x0+x1)/2,62,x1,30); gfx.stroke();
      for(let q=1;q<8;q++) { const t=q/8,x=lerp(x0,x1,t),y=30+64*t*(1-t)*.5*2; E(x,y+3,3,3.4,(Math.floor(ms/350)+q+j)%4?['#ffd04a','#ff9ac0','#9fd8ff','#ffb07a'][(q+j)%4]:'#7a6a5a'); } }
    const tk=tableK(ms); if(tk>0) { gfx.globalAlpha=tk;
      const chair=x=>{ RO(x-14,tTop-50,4,52,'#7a4a24'); RO(x+10,tTop-50,4,52,'#7a4a24'); RO(x-14,tTop-50,28,8,'#8a5a30'); RO(x-14,tTop-34,28,5,'#8a5a30'); };
      for(const p of seated) chair(spot[p.id].x); if(placeK(ms)>0) { gfx.globalAlpha=tk*placeK(ms); chair(gx); } }
    gfx.globalAlpha=1; }});
  // In front: the table and everything on it, Nara under it, the glasses, the CLINK.
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the guest monster shuffles over and sits at the extra place
    if(guest&&!guest.f.dead) { const f=guest.f,q=guest.q; let ox=0,oy=0;
      if(ms>P.sit0&&ms<P.home+600) { const k=ms<P.home?sitK(ms):1-ez(seg(ms,P.home,P.home+600)); ox=(gx-q.x)*k; oy=(tTop+2-q.base)*k-(ms<P.sit1&&ms>P.sit0?Math.abs(Math.sin(ms/90))*8:0); }
      f.ox=ox; f.oy=oy; f.spin=0; f.spinAt=performance.now(); }
    const tk=tableK(ms); if(tk>0) { gfx.save(); gfx.globalAlpha=tk; gfx.translate(0,(1-tk)*-60);
      // tabletop and cloth, with a lifted hem in the middle for Nara
      RO(tL,tTop-6,tR-tL,10,'#f4ecd8'); R(tL,tTop-4,tR-tL,3,'#fffaf0');
      gfx.beginPath(); gfx.moveTo(tL,tTop+4); gfx.lineTo(tR,tTop+4); gfx.lineTo(tR,tBot); 
      if(nara) { gfx.lineTo(ux+30,tBot); gfx.quadraticCurveTo(ux+30,tTop+14,ux,tTop+14); gfx.quadraticCurveTo(ux-30,tTop+14,ux-30,tBot); }
      gfx.lineTo(tL,tBot); gfx.closePath(); gfx.fillStyle='#c84a4a'; gfx.fill(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
      gfx.save(); gfx.clip(); for(let x=tL;x<tR;x+=18) R(x,tTop+4,9,tBot-tTop,'#e8e0cc'); for(let y=tTop+10;y<tBot;y+=14) { gfx.globalAlpha=tk*.35; R(tL,y,tR-tL,6,'#ffffff'); gfx.globalAlpha=tk; } gfx.restore();
      if(nara) { gfx.fillStyle='#1a1420'; gfx.beginPath(); gfx.moveTo(ux+27,tBot); gfx.quadraticCurveTo(ux+27,tTop+17,ux,tTop+17); gfx.quadraticCurveTo(ux-27,tTop+17,ux-27,tBot); gfx.closePath(); gfx.fill(); }
      // plates, the bread and the crisp, a candle
      for(const p of seated) { const x=spot[p.id].x; EO(x-14,tTop-3,9,2.6,'#ffffff'); E(x-14,tTop-3,5,1.4,'#e8e0cc'); }
      boule(cx-10,tTop-10,.8,false); crustTin(cx+40,tTop-8,.7); RO(cx+14,tTop-26,4,20,'#fbf8ee'); E(cx+16,tTop-30+Math.sin(ms/80),2.4,4,'#ffb04a'); E(cx+16,tTop-29,1.2,2,'#fff2a0');
      // the extra place: a plate, a cup and a little card
      const pk=placeK(ms); if(pk>0) { gfx.globalAlpha=tk*pk; EO(gx+14,tTop-3,9,2.6,'#ffffff'); E(gx+14,tTop-3,5,1.4,'#e8e0cc'); RO(gx+28,tTop-18,10,10,'#fbf8ee'); label('GUEST',gx+33,tTop-16,'#8a3a3a',1);
        if(ms<P.place+700) { const q=seg(ms,P.place,P.place+700); gfx.globalAlpha=tk*(1-q); for(let j=0;j<5;j++) star(gx+14+Math.cos(j*1.26)*q*24,tTop-10+Math.sin(j*1.26)*q*16,4,GOLD); }
        gfx.globalAlpha=tk; }
      gfx.restore(); gfx.globalAlpha=1; }
    // Nara under the table, begging (a cream rim so her black fur reads on the dark)
    if(nara&&st.nara&&st.nara.hide) { const sp=SP('nara'),fr=sp.sit||sp.idle,x=ux,b=tBot+2+Math.sin(ms/160)*1.5,cream=tintOf(sp,'#fff2c8',1);
      for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]]) drawAt(sp,fr,x+ox,b+oy,cream,1,sp.scale*.8); drawAt(sp,fr,x,b,sp.pal,1,sp.scale*.8);
      if(ms>P.sit1&&ms<P.home) { const q=((ms-P.sit1)%1400)/1400; gfx.globalAlpha=fade(q,.6); heart(x+12,b-fr.length*sp.scale*.8-6-q*20,5,PINK); gfx.globalAlpha=1; } }
    // the glasses, raised from the raise to the clink
    if(ms>P.raise&&ms<P.home) { const lift=ez(seg(ms,P.raise,P.raise+300)),tilt=ms>P.clink-200&&ms<P.clink+150?.35:0;
      for(const p of seated) { const s3=st[p.id]; if(!s3||!s3.f) continue; const h=handPt(SP(p.id),s3.f,s3.x,s3.b,-1);
        gfx.globalAlpha=lift; if(kidCup(p)) { gfx.save(); gfx.translate(h.x,h.y-6); gfx.rotate(-tilt); RO(-5,-6,10,11,'#fbf8ee'); R(-4,-5,8,3,'#f4f0e6'); gfx.restore(); } else glass(h.x,h.y-6,-tilt); }
      if(guest&&!guest.f.dead) { glass(gx-22,tTop+2-guest.q.h*.5,-tilt); }
      gfx.globalAlpha=1;
      if(ms>P.clink-60&&ms<P.clink+300) for(const p of seated) { const s3=st[p.id],h=handPt(SP(p.id),s3.f,s3.x,s3.b,-1); star(h.x,h.y-14,lerp(10,2,seg(ms,P.clink-60,P.clink+300)),'#ffffff'); } }
    // the CLINK: a flash and a shockwave that rolls across the whole stage
    if(ms>P.clink&&ms<P.clink+1500) { const q=ms-P.clink,r=q*RV;
      if(q<220) { gfx.globalAlpha=.6*(1-q/220); R(0,0,576,324,'#fffbe6'); }
      for(let j=0;j<3;j++) { const rr=r-j*50; if(rr<=0) continue; gfx.globalAlpha=Math.max(0,1-rr/720)*(j?.5:.9); ring(cx,cy,rr,rr*.62,j?3:6,j?GOLD:'#fffbe6'); }
      gfx.globalAlpha=1; }
    // hearts drift up over the monsters once they are warmed
    if(ms>P.clink+300&&ms<P.home) for(const o of hits) { const q=((ms-o.t)%1600)/1600; if(ms<o.t) continue; gfx.globalAlpha=fade(q,.6); heart(o.hx+Math.sin(ms/300+o.hx)*6,o.hy-30-q*30,6,PINK); gfx.globalAlpha=1; }
    gfx.globalAlpha=1; bars(show(ms)); }});
  const steps=[
    [0,()=>{ setMessage('FAMILY FINISH! The Extra Place.'); B2.aim=null; S('levelChime'); }],
    [P.table0,()=>{ S('whoosh'); setMessage('Everybody pulls up a chair at one long family table.'); }],
    [P.place,()=>{ S('ding'); setMessage((tom?'Tom':seated[0].name)+' sets one extra place at the end.'); }],
    [P.tline,()=>{ if(tom) say('tom','ff4'); }],
    [P.sit0,()=>{ S('step'); setMessage(guest?'The monster looks around... and sits down.':'Nobody is left to sit down.'); }],
    [P.sit1,()=>{ S('boing'); }],
    [P.raise,()=>{ S('chime2'); setMessage('Everyone raises a glass. The monster too.'+(nara?' Nara begs under the table.':'')); if(nara) S('whine'); }],
    [P.gline,()=>{ if(gr&&b2Alive(gr)) say('grace','ff4'); }],
    [P.clink,()=>{ S('ding'); S('crash'); S('fanfare'); battle.shakeEnemy=.8; word('CLINK!',cx,52,'#fffbe6',7,1.1); }],
    [P.apply,()=>{ E2.apply(); for(const p of party) { const s3=st[p.id]&&!st[p.id].hide?{x:st[p.id].x,mid:st[p.id].b-Hof(p.id)*.5}:ST.unit(p); scene('glow',1,{x:s3.x,y:s3.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
  ];
  hits.forEach((o,i)=>{ steps.push([o.t,()=>{ S('thud'); ST.jolt(o.f,.5); scene('tb_rings',.5,{x:o.hx,y:o.hy,r:44,c:GOLD,w:3}); landHit(split100(i,hits.length)); }]); });
  steps.push(['hf',hits.length?hits[0].t:P.clink]);
  steps.push([P.end,'end',()=>{ if(guest) { guest.f.ox=0; guest.f.oy=0; guest.f.spin=0; } return (E2.result||'')+' There\'s always room for one more.'; }]);
  ST.play(E2,steps);
};
// ================= Director's Cuts (tombo-review.md DC column) =================
// A Director's Cut is its own row in the Tombo menu, right under its Primary (B2_TOMBOS id+'_dc', label DIRECTOR'S CUT,
// banner DIRECTOR'S CUT!). It opens with the Primary's story flag once Tom and the partner are level 30 (b8DcOpen).
// ---------- Smash That Like Button (Tom + Grace, Director's Cut of tier 1) ----------
// Grace makes Tom say the outro with her. A giant red LIKE button drops out of the sky in front of Tom; he raises both
// hands and smashes it like a boss button. A giant thumbs-up shoots out of it and slams flat onto the target row.
// Effects: Sparkle hit on one row (warms it, shows weak spots), Glitter Nails for the party, Grace's Trending +1.
const rr=(x,y,w,h,r,c,o=2)=>{ const p=(x0,y0,w0,h0,r0)=>{ gfx.beginPath(); gfx.moveTo(x0+r0,y0); gfx.arcTo(x0+w0,y0,x0+w0,y0+h0,r0); gfx.arcTo(x0+w0,y0+h0,x0,y0+h0,r0); gfx.arcTo(x0,y0+h0,x0,y0,r0); gfx.arcTo(x0,y0,x0+w0,y0,r0); gfx.closePath(); };
  if(o) { p(x-o,y-o,w+o*2,h+o*2,r+o); gfx.fillStyle=OUT; gfx.fill(); } p(x,y,w,h,r); gfx.fillStyle=c; gfx.fill(); };
// A thumbs-up on a round red badge, about 56 px across at s=1, centred on x,y. sq squashes it flat (0..1).
const thumbsUp=(x,y,s,rot=0,sq=0,badge=true)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s*(1+sq*.4),s*(1-sq*.55));
  if(badge) { E(0,0,28,28,OUT); E(0,0,26,26,RED); E(-8,-10,12,8,'#ff7a5e'); }
  rr(-19,-2,7,20,2,'#3c6cc8',1.5);                                  // cuff
  rr(-12,-4,24,22,6,'#fffbf2',1.5);                                 // fist
  for(const y2 of [3,9,14]) Ln(4,y2,12,y2,1.6,'#c9b8a0');            // finger creases
  gfx.save(); gfx.translate(-6,-4); gfx.rotate(-.12); rr(-4,-17,9,19,4.5,'#fffbf2',1.5); gfx.restore();   // thumb up
  E(-3,-1,5,3,'#ffffff'); gfx.restore(); };
// The arcade-style LIKE button: base bottom at by. press 0..1 squashes the dome; glow pulses a ring when it is ready.
const likeBtn=(x,by,press,glow)=>{ const h=26*(1-press*.62);
  if(glow>0) { gfx.globalAlpha=glow*(.35+.25*Math.sin(performance.now()/120)); E(x,by-20,48,30,GOLD); gfx.globalAlpha=1; }
  EO(x,by-18,31,h,RED); E(x-10,by-18-h*.55,10,Math.max(1,h*.22),'#ff8a6a');
  thumbsUp(x+1,by-18-h*.55,.32*(1-press*.4),0,press*.5,false);
  RO(x-37,by-19,74,19,'#2c2a36'); R(x-37,by-19,74,3,'#4a4656'); label('LIKE',x,by-13,CREAM,2); };
B2_TOMBO_ANIM.grace1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),row=(E2.targets||[]).filter(t=>t.side==='foe'&&b2Alive(t)),tg=row.length?row:list,GR=ST.group(list),RW=ST.group(tg);
  const tsp=BATTLE_SPRITES.tom,TH=tsp.idle.length*tsp.scale;
  const tx=cl(GR.x1+190,GR.x1+150,520),sb=cl(GR.base+6,236,300),bx=tx-40,gx=bx-34;
  const P={walk:650,gline:850,drop:1900,land:2250,up:2500,tline:2600,smash:3450,launch:3500,peak:3950,slam:4300,apply:4650,home:5350,end:6050};
  const SL=2.3,BR=28*SL,land={x:cl(RW.x,BR+8,568-BR),y:cl(Math.max((RW.top+RW.base)/2,RW.base-BR*1.1),BR+30,300)},peak={x:lerp(bx,land.x,.45),y:44};
  const sT={x:0,b:0},sG={x:0,b:0};
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=gx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,gx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { const hop=ms>P.gline-50&&ms<P.gline+350?Math.sin(seg(ms,P.gline-50,P.gline+350)*Math.PI)*14:(ms>P.slam&&ms<P.slam+400?Math.sin(seg(ms,P.slam,P.slam+400)*Math.PI)*12:(ms>P.slam+520&&ms<P.slam+900?Math.sin(seg(ms,P.slam+520,P.slam+900)*Math.PI)*14:(ms>P.up-350&&ms<P.up-50?Math.sin(seg(ms,P.up-350,P.up-50)*Math.PI)*8:0)));
      y-=hop; f=hop>0?sp.celeb:(ms>P.drop&&ms<P.smash?(sp.flip):sp.idle); if(ms>P.smash&&ms<P.smash+650) f=sp.celeb; }
    else { const k=ez(seg(ms,P.home,P.home+600)); x=lerp(gx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+600); f=k<1?sp.flip:sp.idle; }
    sG.x=x; sG.b=y; return {cx:x,base:y,frame:f}; });
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms>P.up&&ms<P.smash) { f=sp.celeb; y-=Math.min(1,seg(ms,P.up,P.up+200))*6+Math.abs(Math.sin(ms/160))*2; }
      else if(ms>=P.smash&&ms<P.smash+650) { f=sp.act; y+=6*(1-seg(ms,P.smash+250,P.smash+650)); }
      else if(ms>P.slam+100&&ms<P.slam+1000) { f=sp.celeb; if(ms>P.slam+520&&ms<P.slam+900) y-=Math.sin(seg(ms,P.slam+520,P.slam+900)*Math.PI)*14; } }
    else { const k=ez(seg(ms,P.home,P.home+600)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+600); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  const flat=(ms,f,q)=>{ const k=ms<P.slam+120?seg(ms,P.slam,P.slam+120):1-ez(seg(ms,P.slam+450,P.slam+900)),s=1-.24*k;
    f.spin=0; f.ox=0; f.fsc=s; f.oy=q.h/2*(1-s); f.spinAt=performance.now(); };
  scene('tb_rec',P.home/1000+.2,{plan:{th0:1e9,th1:1e9+300,pk0:1e9,pk1:1e9+100,off:P.home-300}});
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    // the button: falls, sits glowing, gets smashed, sinks away at the end
    if(ms>P.drop&&ms<P.home+400) { const k=seg(ms,P.drop,P.land),by=ms<P.land?lerp(-60,sb,k*k):sb+(ms>P.home?ez(seg(ms,P.home,P.home+400))*40:0);
      const press=ms>P.smash?Math.pow(Math.sin(seg(ms,P.smash,P.smash+500)*Math.PI),.6)*(ms<P.smash+250?1:1):0;
      const a=ms>P.home?1-seg(ms,P.home,P.home+400):1; gfx.globalAlpha=a;
      likeBtn(bx,by,ms>P.smash&&ms<P.smash+250?seg(ms,P.smash,P.smash+120):press,ms>P.land+100&&ms<P.smash?1:0);
      // both fists on the dome for the smash
      if(ms>P.smash&&ms<P.smash+420) { const dy=sb-18-26*(1-.62*seg(ms,P.smash,P.smash+120)); for(const dx of [-17,-8,7,16]) EO(bx+dx,dy-3,6,5,dx<0?'#f6c8a0':'#f0b892'); }
    // countdown and the high five
    if(ms>P.up+200&&ms<P.smash) { const n=ms<P.up+600?3:(ms<P.up+1000?2:1),ph=((ms-P.up-200)%400)/400; if(ms<P.up+1400) { gfx.globalAlpha=1-ph*.5; label(String(n),bx,sb-TH-24-ph*8,GOLD,5); gfx.globalAlpha=1; } }
    if(ms>P.slam+560&&ms<P.slam+1100) { const k=seg(ms,P.slam+560,P.slam+1100); gfx.globalAlpha=1-k; star(bx,sb-TH*.78,4+k*10,'#fffbe6'); for(let j=0;j<4;j++) star(bx+Math.cos(j*1.57+.5)*(8+k*18),sb-TH*.78+Math.sin(j*1.57+.5)*(6+k*14),2,GOLD); gfx.globalAlpha=1; }
      gfx.globalAlpha=1; }
    // the giant thumbs-up: out of the button, up over the stage, down flat on the row
    if(ms>P.launch&&ms<P.end-100) {
      if(ms<P.peak) { const k=seg(ms,P.launch,P.peak),e=1-(1-k)*(1-k); thumbsUp(lerp(bx,peak.x,e),lerp(sb-40,peak.y,e),lerp(.4,SL*.85,e),-.4+k*.4); }
      else if(ms<P.slam) { const k=seg(ms,P.peak,P.slam),e=k*k; thumbsUp(lerp(peak.x,land.x,e),lerp(peak.y,land.y,e),lerp(SL*.85,SL,e),.1*(1-k)); }
      else { const q=seg(ms,P.slam,P.end-100),sq=ms<P.slam+120?seg(ms,P.slam,P.slam+120):1-ez(seg(ms,P.slam+300,P.slam+700));
        gfx.globalAlpha=q>.75?(1-q)/.25:1; thumbsUp(land.x,land.y+sq*BR*.45,SL,0,sq*.9); gfx.globalAlpha=1; } }
    // the row gets flattened, then pops back
    if(ms>P.slam&&ms<P.slam+900) for(const f of tg) flat(ms,f,ST.foe(f));
    // a like counter under the REC frame once it lands
    if(ms>P.slam&&ms<P.home) { const k=ez(seg(ms,P.slam,P.slam+600)),n=Math.round(k*1000); gfx.globalAlpha=1-seg(ms,P.home-300,P.home);
      thumbsUp(472,74,.3,0,0,true); label((n>=1000?'1M':n+'K')+' LIKES',520,70,'#ffffff',2); gfx.globalAlpha=1; }
  }});
  const hits=tg.map(f=>({f,q:ST.foe(f)}));
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Grace is finishing her video. Tom has to do the outro with her.'); B2.aim=null; S('click'); }],
    [400,()=>{ S('beep'); }],
    [P.gline,()=>{ say('grace','dc1'); word('OUTRO!',gx,Math.max(96,sb-TH-46),PINK,4,1.1); S('cheer'); }],
    [1500,'Grace points at the camera. Tom looks up.'],
    [P.drop,()=>{ setMessage('A giant LIKE button drops out of the sky.'); S('whoosh'); }],
    [P.land,()=>{ S('thud'); S('clang'); scene('dust',.6,{x:bx,y:sb+2,n:7,sp:18,up:10}); }],
    [P.up,()=>{ S('levelChime'); setMessage('Tom copies Grace, a beat late. Then he nails it. Both of them raise their hands.'); }],
    [P.up+200,()=>S('click')],[P.up+600,()=>S('click')],[P.up+1000,()=>S('click')],
    [P.tline,()=>{ say('tom','dcgrace1'); }],
    [P.smash,()=>{ S('bang'); S('ding'); battle.flashEnemy=.2; scene('tb_rings',.6,{x:bx,y:sb-24,r:60,c:GOLD,w:4}); word('SMASH!',bx,Math.max(90,sb-TH-40),GOLD,5,.8); setMessage('They smash it together.'); }],
    [P.slam+540,()=>{ S('chime2'); S('cheer'); word('HIGH FIVE!',bx,Math.max(70,sb-TH-52),'#fffbe6',3,.9); }],
    [P.launch,()=>{ S('slideWhistle'); }],
    [P.slam,()=>{ S('crash'); S('thud'); battle.shakeEnemy=.7; word('LIKED!',land.x,40,'#fffbe6',5,1.1); scene('tb_rings',.8,{x:land.x,y:RW.base,r:120,c:'#ffffff',w:4});
      hits.forEach(({f,q},k)=>{ ST.jolt(f,.6); for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:q.x,y0:q.mid,x1:q.x+(j-1)*26,y1:q.top-34,arc:20,spin:false,r:7,t:-(k*.08+j*.1),dur:.7}); });
      landHit(100); }],
    ['hf',P.slam],
    [P.slam+250,()=>{ S('fanfare'); scene('confetti',1.4,{x0:GR.x0,x1:576,n:30}); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sG.x,y:sG.b-50}]) scene('glow',.9,{x:q.x,y:q.y,rx:38,ry:52,c:GOLD,a:.35});
      for(const p of b2LiveParty()) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.end,'end',()=>{ for(const f of tg) { f.fsc=0; f.oy=0; f.ox=0; f.spin=0; } return (E2.result||'')+' Like and subscribe.'; }]];
  ST.play(E2,steps);
};

// ---------- That Cloud Is Lamby (Tom + Rose, Director's Cut of tier 1) ----------
// Rose rides Tom's shoulders and they look at the clouds. Tom says the big one is clearly a sourdough loaf; Rose says it is
// Lamby with Tom's hair. The cloud agrees with Rose: it puffs into a giant fluffy Lamby, hair and all, floats down and
// sits on the monster. Effects (no damage): it warms up, its wind-up is cancelled, its next turn comes later, and Rose
// stays up on Tom's shoulders.
const TOMHAIR='#3b2618';
// Tom's hair on Lamby: a dark brown cap and a front swoop, in plush coordinates (plush faces left, head at -12,-6).
const lambyHair=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  E(-11,-12.5,11.6,6.4,OUT); E(-11,-12.5,10.2,5.2,TOMHAIR);
  gfx.beginPath(); gfx.moveTo(-21.5,-12); gfx.quadraticCurveTo(-25.5,-4.5,-18.5,-5.5); gfx.lineTo(-14,-11); gfx.closePath(); gfx.lineWidth=1.4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=TOMHAIR; gfx.fill();
  E(-8,-15,4.5,1.5,'#6a4a32'); gfx.restore(); };
const CLOUDP=[[-56,10,20],[-30,-4,28],[0,-14,32],[34,-4,27],[58,10,19],[-12,12,26],[24,13,24],[-42,17,18],[46,17,16]];
const LAMBP=[[-17,-9,9],[-4,-6,10],[8,-4,9],[14,4,8],[2,8,9],[-10,6,8],[-22,-1,7],[18,-6,6],[-13,-17,6]];
B2_TOMBO_ANIM.rose1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,TH=tsp.idle.length*tsp.scale,RS=BATTLE_SPRITES.rose.scale,RIDE=ROSE_RIDE.bt_idle;
  const tx=cl(GR.x1+140,GR.x1+110,500),sb=cl(GR.base+4,236,300);
  const P={hop:500,walk:520,arrive:1150,cloud:1100,still:1800,tline:1650,tb0:1650,tb1:2800,rline:2850,rb0:2850,rb1:3950,morph:3900,morphEnd:4550,word:4400,fall:4650,sit:5050,apply:5200,puff:5750,puffEnd:6250,home:5850,end:6650};
  const LS=3.3,sky={x:cl(F.x,90,480),y:Math.max(78,F.top-82)},seat={x:F.x+4,y:Math.max(70,F.top+F.h*.38-17*LS)};
  const sT={x:0,b:0},seatPt=()=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx]; return d?{x:d.cx+2,y:d.base-d.h+20}:{x:sT.x+2,y:sT.b-TH+20}; };
  const st0=startOf(pt);
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle;
    if(ms<P.walk) { x=c.origX; y=c.origBase; }
    else if(ms<P.arrive) { const k=ez(seg(ms,P.walk,P.arrive)); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,P.walk,P.arrive); }
    else if(ms<P.home) { f=ms>P.tline-80&&ms<P.tb1?sp.act:(ms>P.sit&&ms<P.sit+600?sp.celeb:(ms>P.rline&&ms<P.morph?sp.expr:sp.idle)); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  // Rose hops up from wherever she is and sits on his shoulders for the rest (a path parked on the riding spot is seated).
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,s=seatPt();
    if(ms<P.hop) { const k=seg(ms,0,P.hop); return {cx:lerp(st0.x,s.x,ez(k)),base:lerp(st0.b,s.y,ez(k))-Math.sin(k*Math.PI)*50,frame:sp.celeb,noShadow:true}; }
    const bob=ms>P.rline&&ms<P.rline+500?-Math.abs(Math.sin(seg(ms,P.rline,P.rline+500)*Math.PI*2))*5:(ms>P.sit&&ms<P.sit+500?-Math.abs(Math.sin(seg(ms,P.sit,P.sit+500)*Math.PI*2))*5:0);
    return {cx:s.x,base:s.y+bob,frame:sp.idle,noShadow:true}; });
  const puff=(x,y,r,a)=>{ if(a<=0||r<=0) return; gfx.globalAlpha=a; E(x,y+3,r+2,r*.82+2,'#b8c6dc'); E(x,y,r,r*.82,'#ffffff'); E(x-r*.25,y-r*.3,r*.45,r*.28,'#ffffff'); gfx.globalAlpha=1; };
  const cloudAt=(cx,cy,m,a)=>{ // m: 0 = cloud, 1 = puffs hugging Lamby's outline
    for(const [i,[px,py,r]] of CLOUDP.entries()) { const L=LAMBP[i],x=lerp(px,L[0]*LS,ez(m)),y=lerp(py,L[1]*LS,ez(m)),rad=lerp(r,L[2]*LS*.75,ez(m));
      E(cx+x,cy+y+6,rad*.9,rad*.5,'rgba(150,170,200,'+(a*.18*(1-m))+')'); puff(cx+x,cy+y,rad,a*(1-m*.7)); } };
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    // soft sky tint so the cloud reads
    const sk=ez(seg(ms,P.cloud-200,P.cloud+400))*(1-ez(seg(ms,P.puff,P.puffEnd)));
    if(sk>0) { const gr=gfx.createLinearGradient(0,0,0,190); gr.addColorStop(0,'rgba(143,208,255,.3)'); gr.addColorStop(1,'rgba(143,208,255,0)'); gfx.globalAlpha=sk; gfx.fillStyle=gr; gfx.fillRect(0,0,576,190); gfx.globalAlpha=1; }
    // where the cloud / Lamby is
    let cx=sky.x,cy=sky.y,m=0,la=0,lsc=LS,pose='held',rot=0,a=1;
    if(ms<P.still) { const k=ez(seg(ms,P.cloud,P.still)); cx=lerp(sky.x+280,sky.x,k); a=seg(ms,P.cloud,P.cloud+300); cy+=Math.sin(ms/500)*3; }
    else if(ms<P.morph) cy+=Math.sin(ms/500)*3;
    else if(ms<P.fall) { m=seg(ms,P.morph,P.morphEnd); la=ez(seg(ms,P.morph+150,P.morphEnd)); rot=Math.sin(ms/260)*.05; }
    else if(ms<P.sit) { const k=seg(ms,P.fall,P.sit); m=1; la=1; cx=lerp(sky.x,seat.x,ez(k)); cy=lerp(sky.y,seat.y,k*k); rot=-.08*Math.sin(k*Math.PI); }
    else { m=1; la=1; cx=seat.x; cy=seat.y; const q=seg(ms,P.sit,P.sit+300); lsc=LS*(1+(q<1?Math.sin(q*Math.PI)*.08:0)); rot=Math.sin(ms/300)*.04;
      if(ms>P.puff) { const k=seg(ms,P.puff,P.puffEnd); la=1-k; m=1-k; cy-=k*50; a=1-k; } }
    if(ms>P.cloud&&ms<P.puffEnd) {
      if(la<1||ms>P.puff) cloudAt(cx,cy,m,a*(ms>P.puff?1:1));
      if(la>0) { gfx.globalAlpha=la; RFX.plush(cx,cy,lsc,{pose,rot}); gfx.save(); gfx.translate(cx,cy); gfx.rotate(rot); lambyHair(0,0,lsc); gfx.restore(); gfx.globalAlpha=1;
        // a fluffy cloud rim still hugging it
        if(ms<P.puff) for(const [i,L] of LAMBP.entries()) if(i%3===0) puff(cx+L[0]*lsc,cy+L[1]*lsc+4,L[2]*lsc*.45,la*.35); }
      // the monster squashes a little while Lamby sits on it
      if(ms>P.sit&&ms<P.puff+250) { const k=ms<P.sit+120?seg(ms,P.sit,P.sit+120):1-ez(seg(ms,P.puff,P.puff+250)),sc2=1-.16*k;
        tgt.spin=0; tgt.ox=0; tgt.fsc=sc2; tgt.oy=F.h/2*(1-sc2); tgt.spinAt=performance.now(); } }
    // the two thought bubbles
    const s0=seatPt(),rHead={x:s0.x-2,y:s0.y-20-RIDE.ay*RS};
    if(ms>P.tb0&&ms<P.tb1) { const k=ms<P.tb1-200?seg(ms,P.tb0,P.tb0+250):1-seg(ms,P.tb1-200,P.tb1);
      bubble(cl(tx-120,84,470),cl(sb-TH-58,92,250),126,82,sT.x-16,sb-TH+14,k,()=>{ boule(0,4,3.1,false); }); }
    if(ms>P.rb0&&ms<P.rb1) { const k=ms<P.rb1-200?seg(ms,P.rb0,P.rb0+250):1-seg(ms,P.rb1-200,P.rb1);
      bubble(cl(rHead.x+30,90,500),cl(rHead.y-72,62,200),130,92,rHead.x+4,rHead.y+6,k,()=>{ RFX.plush(4,8,1.75,{pose:'held'}); lambyHair(4,8,1.75); }); }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Rose climbs up on Tom’s shoulders. Cloud safari.'); B2.aim=null; S('boing'); }],
    [P.walk,()=>{ S('step'); }],
    [P.cloud,()=>{ setMessage('A big fluffy cloud drifts over the monsters.'); S('whoosh'); }],
    [P.tline,()=>{ say('tom','dcrose1'); }],
    [P.tline+400,'Tom has an opinion about the cloud.'],
    [P.rline,()=>{ say('rose','dc1'); S('giggle'); }],
    [P.rline+400,'Rose has a different opinion.'],
    [P.morph,()=>{ setMessage('The cloud agrees with Rose.'); S('chime2'); }],
    [P.word,()=>{ word("IT'S LAMBY!",sky.x,40,PINK,4,.7); S('levelChime'); }],
    [P.fall,()=>{ S('slideWhistle'); setMessage('Giant cloud Lamby floats down... and sits on the monster.'); }],
    [P.sit,()=>{ S('thud'); S('squeak'); ST.jolt(tgt,.5); battle.shakeEnemy=.4; word('FLUMP!',sky.x,66,'#fffbe6',4,.8); scene('tb_rings',.6,{x:F.x,y:F.base,r:70,c:'#ffffff',w:3});
      for(let k=0;k<6;k++) { const an=k/6*Math.PI*2; battle.props.push({kind:'dheart',x0:F.x,y0:F.mid,x1:F.x+Math.cos(an)*54,y1:F.mid+Math.sin(an)*34-20,arc:10,spin:false,r:6,t:-k*.04,dur:.7}); }
      landHit(100); }],
    ['hf',P.sit],
    [P.apply,()=>{ E2.apply(); S('heal'); }],
    [P.sit+500,()=>{ S('giggle'); }],
    [P.puff,()=>{ S('whoosh'); }],
    [P.end,'end',()=>{ tgt.fsc=0; tgt.oy=0; tgt.ox=0; tgt.spin=0; return (E2.result||'')+' Rose was right. Rose is always right about clouds.'; }]];
  ST.play(E2,steps);
};
// ---------- Field Day (Tom + Amy, Director's Cut of tier 1) ----------
// Amy blows the whistle for field day. Chalk lanes on the grass. Tom gets the egg-and-spoon race and walks it very, very
// carefully. Amy sprints past in the next lane, bumps him, and the egg flies off the spoon into the monster's face.
// Effects (no damage): every enemy warms up, the party gets 2 VP, Amy shakes off one debuff.
const egg=(x,y,s,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); E(0,0,6.5*s+1.6,8.5*s+1.6,OUT); E(0,0,6.5*s,8.5*s,'#fffaf0'); E(-2*s,-3*s,2*s,2.6*s,'#ffffff'); gfx.restore(); };
const spoon=(x,y,rot,full)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
  Ln(0,0,30,0,4.5,OUT); Ln(0,0,30,0,2.2,'#c8ccd4'); E(-9,-1,11,5.5,OUT); E(-9,-1,9,4,'#dfe3ea'); E(-11,-2.5,4,1.6,'#ffffff');
  if(full) egg(-9,-9,1,0); gfx.restore(); };
const whistle=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); RO(-9,-3,12,7,'#c8ccd4'); EO(4,1,5,5,'#c8ccd4'); E(4,1,2,2,'#5a5e68'); R(-9,-3,12,2,'#ffffff'); gfx.restore(); };
const splat=(x,y,k,a)=>{ if(k<=0||a<=0) return; gfx.globalAlpha=a; const r=22*ez(k);
  for(const [dx,dy,rr2] of [[0,0,1],[-14,-6,.55],[13,-8,.5],[-10,11,.5],[15,9,.45],[0,-15,.4]]) E(x+dx*k,y+dy*k,r*rr2+2,r*rr2*.85+2,OUT);
  for(const [dx,dy,rr2] of [[0,0,1],[-14,-6,.55],[13,-8,.5],[-10,11,.5],[15,9,.45],[0,-15,.4]]) E(x+dx*k,y+dy*k,r*rr2,r*rr2*.85,'#fffaf0');
  EO(x+2,y+1,r*.42,r*.38,'#ffc23a'); E(x-1,y-2,r*.14,r*.11,'#fff3c0');
  for(const [dx,len] of [[-9,18],[6,26],[14,12]]) { const l=len*cl(k*1.4-.4); if(l>0) { Ln(x+dx,y+r*.5,x+dx,y+r*.5+l,4.5,OUT); Ln(x+dx,y+r*.5,x+dx,y+r*.5+l,2.5,'#fffaf0'); } }
  gfx.globalAlpha=1; };
B2_TOMBO_ANIM.amy1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),o3=order3(list),tgt=o3.length?o3[0].f:list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const sb=cl(GR.base+2,232,292),ab=sb+14,tx0=cl(GR.x1+210,GR.x1+170,520),tx1=tx0-46,ax0=tx0+60,fin=cl(GR.x1+72,150,480);
  const P={walk:650,tweet:800,aline:950,go:1900,tline:2500,run:3350,bump:3700,fly:3700,splat:4150,tape:4250,apply:4900,home:5600,end:6300};
  const bumpX=tx0-((P.bump-P.go)/(P.run+1400-P.go))*46;
  const face={x:F.x,y:F.top+F.h*.32};
  const sT={x:tx0,b:sb,f:tsp.idle},sA={x:ax0,b:ab};
  const tomX=ms=>ms<P.go?tx0:lerp(tx0,tx1,seg(ms,P.go,P.home));
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx0,y=sb,f=sp.act,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx0,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); f=sp.idle; }
    else if(ms<P.home) { x=tomX(ms);
      if(ms>P.go&&ms<P.bump) y-=Math.abs(Math.sin((ms-P.go)/260))*2;   // tiny, careful steps
      if(ms>=P.bump&&ms<P.bump+500) { const k=seg(ms,P.bump,P.bump+500); f=sp.expr; rot=-.25*Math.sin(k*Math.PI); x-=Math.sin(k*Math.PI)*10; }
      else if(ms>=P.bump+500) f=ms>P.splat+200&&ms<P.apply?sp.kneel:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx1,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=ax0,y=ab,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,ax0,k); y=lerp(c.origBase,ab,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.run) { f=ms>P.tweet&&ms<P.go+300?sp.celeb2:(ms>P.go+300?sp.wind:sp.idle); }
    else if(ms<P.tape) { const k=seg(ms,P.run,P.tape); x=lerp(ax0,fin,k); f=runFr(sp,c.t*1.6,-1); y-=Math.abs(Math.sin(ms/70))*3; }
    else if(ms<P.home) { x=fin-Math.min(1,seg(ms,P.tape,P.tape+250))*8; f=sp.celeb; if(ms<P.tape+700) y-=Math.abs(Math.sin(seg(ms,P.tape,P.tape+700)*Math.PI*2))*14; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(fin-8,c.origX,k); y=lerp(ab,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sA.x=x; sA.b=y; return {cx:x,base:y,frame:f}; });
  const hand=()=>handPt(tsp,tsp.act,sT.x,sT.b,-1);
  // field-day lanes, bunting and the finish tape (back layer, behind everyone)
  scene('tb_draw',P.end/1000,{back:true,draw:(s,u,ms)=>{ const k=ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.home+500))); if(k<=0) return;
    gfx.globalAlpha=k*.28; R(0,sb-26,576,ab-sb+40,'#7ac85a'); gfx.globalAlpha=k*.85;
    for(const y of [sb-22,sb+5,ab+12]) { R(0,y,576,3,'#fffaf0'); }
    R(tx0+18,sb-22,4,ab+15-(sb-22),'#fffaf0'); label('START',tx0+20,sb-34,'#fffaf0',2);
    for(let i=0;i<14;i++) { const x=i*44+((ms/40)%44),y=30+Math.sin(i*1.3)*3; gfx.beginPath(); gfx.moveTo(x,y); gfx.lineTo(x+22,y+2); gfx.lineTo(x+11,y+18); gfx.closePath(); gfx.fillStyle=['#e0402e','#ffe08a','#5a8ad0','#7ac85a'][i%4]; gfx.fill(); }
    Ln(0,30,576,32,2,OUT);
    gfx.globalAlpha=1; }});
  // the tape at the finish, the spoon and egg, the whistle, the splat (front layer)
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    // finish tape: two posts, a tape that snaps when Amy breaks it
    const fk=ez(seg(ms,P.walk,P.walk+300))*(1-ez(seg(ms,P.home,P.home+400)));
    if(fk>0) { gfx.globalAlpha=fk; const px=fin-16; RO(px-2,ab-62,4,62,'#fffaf0'); RO(px-2,sb-74,4,40,'#fffaf0');
      if(ms<P.tape) { Ln(px,sb-60,px,ab-38,4,RED); }
      else { const q=ez(seg(ms,P.tape,P.tape+400)); Ln(px,sb-60,px-20*q,sb-40+q*20,4,RED); Ln(px,ab-38,px-24*q,ab-52+q*10,4,RED); }
      label('FINISH',px,sb-86,'#fffaf0',2); gfx.globalAlpha=1; }
    // the whistle at Amy's mouth while she blows it
    if(ms>P.tweet-100&&ms<P.go+250) { const q=Math.sin(ms/40)*1; whistle(sA.x-AH*.22+q,sA.b-AH*.73,1.1); }
    // spoon in Tom's hand, the egg wobbling on it
    if(ms>P.walk&&ms<P.home) { const h=hand(),wob=ms<P.bump?Math.sin(ms/110)*.12+Math.sin(ms/47)*.05:0,rot=ms>=P.bump&&ms<P.bump+500?-.6*Math.sin(seg(ms,P.bump,P.bump+500)*Math.PI):wob;
      spoon(h.x+2,h.y+2,rot,ms<P.fly);
      if(ms>P.go&&ms<P.bump) { const sw=(Math.floor(ms/300)%2)?1:0; E(sT.x+14,sT.b-TH+16+sw*3,2.4,3.6,'#9fd8ff'); }   // a sweat drop
    }
    // the egg flies in an arc into the monster's face, and splats
    if(ms>=P.fly&&ms<P.splat) { const h=hand(),k=seg(ms,P.fly,P.splat); egg(lerp(h.x-7,face.x,k),lerp(h.y-7,face.y,k)-Math.sin(k*Math.PI)*90,1.6,k*Math.PI*5); }
    if(ms>=P.splat&&ms<P.end-50) { splat(face.x,face.y,seg(ms,P.splat,P.splat+180),1-seg(ms,P.end-500,P.end-50));
      if(ms<P.splat+500) for(let j=0;j<5;j++) { const q=seg(ms,P.splat,P.splat+500),an=-.6-j*.5; E(face.x+Math.cos(an)*q*50,face.y+Math.sin(an)*q*40+q*q*30,3,2,'#fffaf0'); } }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Coach Amy has a whistle. It\'s field day.'); B2.aim=null; S('click'); }],
    [P.tweet,()=>{ S('toot'); word('TWEET!',ax0+10,Math.max(80,ab-AH-40),CREAM,4,.7); }],
    [P.aline,()=>{ say('amy','dc1'); }],
    [P.go-200,'Tom draws the egg-and-spoon race.'],
    [P.go,()=>{ word('GO!',ax0-40,40,GOLD,5,.8); S('ding'); }],
    [P.tline,()=>{ say('tom','dcamy1'); setMessage('Tom walks it very, very carefully.'); }],
    [P.run,()=>{ S('whoosh'); setMessage('Amy isn\'t walking. Amy is sprinting.'); }],
    [P.bump,()=>{ S('bump'); S('boing'); word('BUMP!',bumpX,Math.max(90,sb-TH-40),PINK,4,.6); }],
    [P.fly+150,()=>{ S('slideWhistle'); }],
    [P.splat,()=>{ S('squeak'); S('thud'); ST.jolt(tgt,.5); battle.shakeEnemy=.4; word('SPLAT!',face.x,40,'#ffd24a',5,.9);
      for(let k=0;k<5;k++) battle.props.push({kind:'dheart',x0:F.x,y0:F.mid,x1:F.x+(k-2)*24,y1:F.top-30,arc:14,spin:false,r:6,t:-k*.06,dur:.7});
      landHit(100); }],
    ['hf',P.splat],
    [P.tape,()=>{ S('fanfare'); word('1ST!',fin,Math.max(96,ab-AH-44),GOLD,5,1.1); scene('confetti',1.3,{x0:fin-90,x1:fin+90,n:26}); }],
    [P.tape+300,'Amy wins. The egg doesn\'t.'],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sA.x,y:sA.b-AH*.45}]) scene('glow',.9,{x:q.x,y:q.y,rx:38,ry:52,c:GOLD,a:.35});
      for(const p of b2LiveParty()) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.end,'end',()=>(E2.result||'')+' Amy is still doing a victory lap.']];
  ST.play(E2,steps);
};

// ---------- Clean As You Go (Tom + Deedee, Director's Cut of tier 1) ----------
// Deedee washes at the sink and hands each clean plate to Tom, who dries and stacks. She goes faster and faster; he cannot
// keep up, and the tower of clean plates in his arms grows to the ceiling, sways and topples onto the monster.
// Effects (no damage): every enemy warms up, the party heals 25%, every friend shakes off one debuff.
const plateEdge=(x,y,s=1)=>{ E(x,y,17*s+1.5,4*s+1.5,OUT); E(x,y,17*s,4*s,'#fbfbf6'); E(x,y-1,13*s,2*s,'#dfe8f4'); R(x-17*s,y,34*s,1,'#5a8ad0'); };
const plateFace=(x,y,rot,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); E(0,0,12*s+1.5,12*s+1.5,OUT); E(0,0,12*s,12*s,'#fbfbf6'); ring(0,0,8*s,8*s,1.5,'#5a8ad0'); E(-4*s,-4*s,2.5*s,1.6*s,'#ffffff'); gfx.restore(); };
B2_TOMBO_ANIM.deedee1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),o3=order3(list),tgt=o3.length?o3[0].f:list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const sb=cl(GR.base+6,236,300),tx=cl(GR.x1+92,GR.x1+80,440),dx=tx+80;
  const P={walk:650,wash:800,dline:1700,tline:3000,top:4100,sway:4100,fall:4650,crash:5050,apply:5450,home:5950,end:6700};
  // plate hand-off times: the gap shrinks from 420 ms to 90 ms
  const hand=[]; for(let t=P.wash+100,g=420;t<P.top-250;t+=g,g=Math.max(90,g*.84)) hand.push(t);
  const FLY=260,N=hand.length,PL=6,chest={x:tx-6,y:sb-TH*.42};
  const nOn=ms=>{ let n=0; for(const t of hand) if(ms>=t+FLY) n++; return n; };
  const sT={x:tx,b:sb},sD={x:dx,b:sb};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.flip,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); f=sp.idle; }
    else if(ms<P.home) { const n=nOn(ms);
      if(ms<P.fall) { rot=Math.min(.12,n*.004)*(ms>P.sway?1+Math.sin(ms/90)*.6:1); x+=Math.sin(ms/(ms>P.sway?90:170))*(n>12?2:1); f=n>6?sp.expr:sp.flip; }
      else if(ms<P.crash+300) f=sp.act;
      else f=ms<P.apply?sp.kneel:sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,dx,k); y=lerp(c.origBase,sb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.top) { const g=hand.find(t=>t>ms-160&&t<=ms+60); f=g!=null?sp.throw:(Math.floor(ms/(ms>P.dline?70:140))%2?sp.act:sp.wind); }
    else if(ms<P.home) f=ms<P.crash?sp.spread:sp.hip;
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(dx,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sD.x=x; sD.b=y; return {cx:x,base:y,frame:f}; });
  // the counter behind them
  scene('tb_draw',P.end/1000,{back:true,draw:(s,u,ms)=>{ const k=ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.home+500))); if(k<=0) return;
    gfx.globalAlpha=k*.9; const top=sb-DH*.5;
    for(let i=0;i<7;i++) for(let j=0;j<3;j++) RO(dx-90+i*30+(j%2)*15,top-74+j*18,26,14,'#e8f0f4');   // tile splashback
    gfx.globalAlpha=1; }});
  // the sink, the stack, the flying plates, the toppling tower
  scene('tb_draw',P.end/1000,{draw:(s,u,ms)=>{
    const k=ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.home+500)));
    if(k>0) { gfx.globalAlpha=k; const y0=sb-DH*.3,sx=dx-34; RO(sx-24,y0,48,22,'#c8ccd4'); R(sx-20,y0+4,40,4,'#5a5e68');
      for(let i=0;i<4;i++) { const bx=sx-16+i*10+Math.sin(ms/200+i)*2,by2=y0-2-Math.abs(Math.sin(ms/260+i*1.7))*(ms>P.dline?10:5); EO(bx,by2,4+(i%2),4+(i%2),'#ffffff'); }
      RO(sx+16,y0-24,4,22,'#c8ccd4'); RO(sx+4,y0-26,16,4,'#c8ccd4');   // tap
      gfx.globalAlpha=1; }
    const n=nOn(ms),base={x:sT.x+12,y:sT.b-TH*.36};
    if(ms<P.fall) { // the stack in Tom's arms, swaying more as it grows
      const sway=ms>P.sway?Math.sin(ms/110)*.09*seg(ms,P.sway,P.sway+300):Math.sin(ms/300)*.01*n;
      gfx.save(); gfx.translate(base.x,base.y); gfx.rotate(sway); for(let i=0;i<n;i++) plateEdge(Math.sin(i*1.7)*1.5,-i*PL); gfx.restore();
      if(ms>P.walk&&ms<P.top) towel(sT.x-4+Math.sin(ms/60)*4,sT.b-TH*.3,-.3); }
    else { // it topples left about its foot and lands on the monster
      const q=seg(ms,P.fall,P.crash),ang=-q*q*1.45;
      if(ms<P.crash) { gfx.save(); gfx.translate(base.x,base.y); gfx.rotate(ang); for(let i=0;i<n;i++) plateEdge(Math.sin(i*1.7)*1.5*(1+q*4)-i*q*q*1.2,-i*PL*(1+q*.05)); gfx.restore(); }
      else if(ms<P.crash+900) { const w=seg(ms,P.crash,P.crash+900); // plates scatter off the monster and spin away
        for(let i=0;i<Math.min(n,18);i++) { const a=i*2.39,sp2=60+(i%5)*22; plateFace(F.x+Math.cos(a)*sp2*w,F.mid-30+Math.sin(a)*sp2*w*.6-Math.sin(w*Math.PI)*40+w*w*60,w*8+i,.85); }
        gfx.globalAlpha=1-w; for(let i=0;i<6;i++) plateEdge(F.x-20+i*8,F.top-6-i*5,.9); gfx.globalAlpha=1; } }
    // plates in flight from Deedee's hands to the top of the stack
    for(const t of hand) if(ms>=t&&ms<t+FLY) { const q=(ms-t)/FLY,ty2=base.y-nOn(t)*PL; plateFace(lerp(sD.x-26,base.x,q),lerp(sD.b-DH*.55,ty2,q)-Math.sin(q*Math.PI)*40,q*Math.PI*3,.8); }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Deedee is at the sink. Tom has a dish towel.'); B2.aim=null; S('click'); }],
    [P.wash,()=>{ S('reel'); setMessage('She washes. He dries. She washes faster.'); }],
    [P.dline,()=>{ say('deedee','dc1'); word('FASTER!',dx,Math.max(90,sb-DH-40),PINK,4,.8); }],
    [P.tline,()=>{ say('tom','dcdeedee1'); setMessage('The stack is taller than Tom.'); }],
    [P.sway,()=>{ word('UH OH.',tx,40,CREAM,4,.8); S('creak'); }],
    [P.fall,()=>{ S('slideWhistle'); setMessage('TIMBER. The tower of clean plates tips over.'); }],
    [P.crash,()=>{ S('crash'); S('clang'); ST.jolt(tgt,.6); battle.shakeEnemy=.7; word('CRASH!',F.x,66,'#fffbe6',5,.9); scene('tb_rings',.6,{x:F.x,y:F.base,r:90,c:'#ffffff',w:3});
      for(let k=0;k<5;k++) battle.props.push({kind:'dheart',x0:F.x,y0:F.mid,x1:F.x+(k-2)*26,y1:F.top-34,arc:14,spin:false,r:6,t:-k*.06,dur:.7});
      landHit(100); }],
    ['hf',P.crash],
    [P.crash+400,()=>{ S('ding'); word('SPOTLESS!',dx,40,GOLD,4,1); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sD.x,y:sD.b-DH*.45}]) scene('glow',.9,{x:q.x,y:q.y,rx:38,ry:52,c:GOLD,a:.35});
      for(const p of b2LiveParty()) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.end,'end',()=>(E2.result||'')+' Every plate is clean. Most of them are on the monster.']];
  ST.play(E2,steps);
};
// ---------- Quiet on Cattail Pier (Tom + Boppy, Director's Cut of tier 1) ----------
// Father and son on Cattail Pier: Boppy in his folding camp chair, Tom beside him with the green tackle box. Tom baits the
// hook with a glowing bit of sourdough crust; Boppy shushes him. Tom points at the ripples behind the reeds. Boppy stands
// and whips one huge cast over every monster; the line drapes across all of them; Tom grabs the rod too and they heave
// backward together: YANK! The back row is reeled into the front. Boppy's back has a few words to say about it.
// Effects: Splash hit on every enemy, back row to the front, Hooked for 2 turns, Boppy +2 Heartburn.
const CANVAS='#3f7a4a',CANVAS2='#5a9a62',ALU='#b8c0c8';
// A folding camp chair seen from the side, facing left: seat at b-sh, back on the right.
// legs:false draws only the seat and back (back layer); legs:'front' only the near X of legs (front layer).
const campChair=(x,b,sh,bh,part)=>{ const X=(c,w)=>{ Ln(x-20,b,x+20,b-sh,w,c); Ln(x+20,b,x-20,b-sh,w,c); };
  if(part!=='front') { Ln(x+18,b-sh,x+30,b-bh,5,OUT); Ln(x+18,b-sh,x+30,b-bh,2.5,ALU);
    gfx.beginPath(); gfx.moveTo(x+15,b-sh-4); gfx.lineTo(x+25,b-bh+2); gfx.lineTo(x+35,b-bh+6); gfx.lineTo(x+26,b-sh-4); gfx.closePath(); gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=CANVAS; gfx.fill();
    X(OUT,5); X('#8a929a',2.5); RO(x-22,b-sh-4,44,6,CANVAS); R(x-22,b-sh-4,44,2,CANVAS2); }
  if(part==='front') { X(OUT,4.5); X(ALU,2.2); } };
const tackleBox=(x,b,open)=>{ RO(x-16,b-14,32,14,'#3a8a4a'); R(x-16,b-14,32,3,'#5aaa62'); RO(x-4,b-18,8,3,'#2a5a32');
  if(open) { gfx.save(); gfx.translate(x+16,b-14); gfx.rotate(1.2); RO(-32,-4,32,4,'#3a8a4a'); gfx.restore();
    for(const [dx,c] of [[-10,'#e0402e'],[-3,'#ffe08a'],[4,'#5ac8ff'],[11,'#ff9ac0']]) E(x+dx,b-15,2.6,2,c); } };
const cattail=(x,b,h,sw)=>{ const tx=x+sw; gfx.lineCap='round'; Ln(x,b,tx,b-h,3.5,OUT); Ln(x,b,tx,b-h,1.8,'#5a8a3a');
  EO(tx,b-h+8,3,9,'#7a4a24'); Ln(tx,b-h-1,tx+sw*.2,b-h-8,1.5,'#5a8a3a');
  gfx.strokeStyle='#4a7a32'; gfx.lineWidth=2; gfx.beginPath(); gfx.moveTo(x,b); gfx.quadraticCurveTo(x-8,b-h*.4,x-14+sw,b-h*.55); gfx.stroke(); };
B2_TOMBO_ANIM.boppy1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const PL=cl(GR.x1+14,150,300),bx=cl(GR.x1+112,GR.x1+92,452),tx=bx+88,gx=bx+36,sb=cl(GR.base+4,236,300);
  const wTop=cl(GR.top+GR.list.reduce((m,q)=>Math.min(m,q.h),99)*.3,120,230);
  const P={walk:700,lure0:1000,lure1:1450,bline:1150,rip:1950,tline:2150,stand:3000,back:3150,fwd:3320,rel:3420,land:3850,taut:4050,grab:4050,grip:4350,yank:4500,slack:5150,ache:5000,home:5700,end:6400};
  const S0=list.map(f=>({f,q:ST.foe(f)}));
  const sT={x:tx,b:sb,f:tsp.idle},sB={x:bx,b:sb,f:bsp.idle,rot:0};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms>P.lure0&&ms<P.lure1) f=sp.act;
      else if(ms>P.tline-60&&ms<P.stand-100) { f=sp.act; y-=Math.abs(Math.sin((ms-P.tline)/140))*2; }
      if(ms>=P.grab) { const k=ez(seg(ms,P.grab,P.grip)); x=lerp(tx,gx,k); y+=ffHop(ms,P.grab,P.grip); f=sp.act;
        if(ms>P.yank&&ms<P.yank+420) { const q=seg(ms,P.yank,P.yank+420); rot=.22*Math.sin(q*Math.PI); x+=Math.sin(q*Math.PI)*8; }
        if(ms>P.yank+420) f=ms<P.slack?sp.celeb:sp.idle; } }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(gx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=bx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,bx,k); y=lerp(c.origBase,sb,k); f=k<1?runFr(sp,c.t,-1):sp.idle; }
    else if(ms<P.home) {
      if(ms<P.stand) f=sp.sit||sp.idle;
      else if(ms<P.back) f=sp.idle;
      else if(ms<P.fwd) f=sp.wind||sp.idle;
      else if(ms<P.land) f=sp.throw||sp.act;
      else if(ms<P.yank) f=ms>P.taut?(sp.wind||sp.act):sp.act;
      else if(ms<P.yank+420) { const q=seg(ms,P.yank,P.yank+420); f=sp.wind||sp.act; rot=.2*Math.sin(q*Math.PI); x+=Math.sin(q*Math.PI)*8; }
      else if(ms<P.ache) f=sp.celeb||sp.idle;
      else f=ms<P.ache+600?(sp.kneel||sp.idle):(sp.hip||sp.idle); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(bx,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sB.x=x; sB.b=y; sB.f=f; sB.rot=rot; return {cx:x,base:y,frame:f,rot}; });
  const setK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-150)));
  // Behind everyone: the lake under the monsters, reeds behind them, the pier and the camp chair under the pair.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=setK(ms); if(k<=0) return; gfx.globalAlpha=k;
    gfx.fillStyle=WATER; gfx.beginPath(); gfx.moveTo(0,wTop); for(let x=0;x<=PL;x+=12) gfx.lineTo(x,wTop+Math.sin(x/20+ms/300)*3); gfx.lineTo(PL,324); gfx.lineTo(0,324); gfx.closePath(); gfx.fill();
    for(let j=0;j<7;j++) { const yy=wTop+18+j*16,xx=((j*53+ms/26)%(PL+40))-20; Ln(xx,yy,xx+26,yy,2,WATER2); }
    Ln(0,wTop+1,PL,wTop+1,2,FOAM);
    for(let i=0;i<9;i++) { const x=12+i*((PL-30)/8),h=46+((i*37)%30); cattail(x,wTop+6+(i%3)*4,h,Math.sin(ms/600+i)*3); }
    const pt0=Math.min(sb-26,Math.max(wTop+14,sb-60));
    R(PL-2,pt0,580-PL,330-pt0,OUT); R(PL,pt0+2,580-PL,330-pt0,PLANK);
    for(let yy=pt0+16;yy<324;yy+=16) R(PL,yy,580-PL,2,PLANK2);
    for(const yy of [pt0+30,pt0+86]) RO(PL-12,yy,12,330-yy,'#6a4a2a');
    // the chair: Boppy sits in it, then stands up in front of it
    campChair(bx+12,sb,Math.round(BH*.3),Math.round(BH*.7));
    gfx.globalAlpha=1; }});
  const tipOf=ms=>{ const h=handPt(bsp,sB.f,sB.x,sB.b,-1);
    let a=1.15;
    if(ms>P.back&&ms<P.fwd) a=lerp(1.15,2.35,ez(seg(ms,P.back,P.fwd)));
    else if(ms>=P.fwd&&ms<P.land) a=lerp(2.35,.32,ez(seg(ms,P.fwd,P.fwd+180)));
    else if(ms>=P.land&&ms<P.yank) a=lerp(.32,.55,seg(ms,P.taut,P.yank));
    else if(ms>=P.yank&&ms<P.slack) a=lerp(.55,1.05,ez(seg(ms,P.yank,P.yank+300)));
    else if(ms>=P.slack) a=1.15;
    a+=sB.rot; const L=112; return {h,x:h.x-Math.cos(a)*L,y:h.y-Math.sin(a)*L,a}; };
  const hookAt=()=>{ const o=S0.reduce((m,o2)=>o2.q.x<m.q.x?o2:m,S0[0]); return {x:o.q.x-o.q.w/2-16+(o.f.ox||0),y:o.q.base-4+(o.f.oy||0)}; };
  let rel=null;
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=setK(ms);
    // reeds in front of the water's edge (the monsters really are behind them) and wading ripples
    if(k>0) { gfx.globalAlpha=k; for(let i=0;i<4;i++) cattail(PL-40+i*9,Math.min(324,GR.base+20)+(i%2)*3,64+i*7,Math.sin(ms/500+i*1.3)*3);
      for(const o of S0) { const q=ST.foe(o.f),x=q.x+(o.f.ox||0),r=q.w*.42+Math.sin(ms/200+q.x)*2; ring(x,q.base-3,r,6,3,FOAM); }
      gfx.globalAlpha=1; }
    // ripples behind the reeds where Tom points
    if(ms>P.rip&&ms<P.stand) { const back=S0.slice().sort((a,b)=>a.q.x-b.q.x).slice(0,Math.max(1,Math.ceil(S0.length/2)));
      for(const o of back) for(let j=0;j<2;j++) { const q=((ms-P.rip)/900+j*.5)%1; gfx.globalAlpha=(1-q)*.9; ring(o.q.x,o.q.base-2,10+q*40,4+q*12,2.5,'#ffffff'); } gfx.globalAlpha=1; }
    // the near legs of the camp chair (while Boppy sits) and the tackle box between them
    if(k>0&&ms<P.stand+200) { gfx.globalAlpha=k*(1-seg(ms,P.stand,P.stand+200)*.6); campChair(bx+12,sb,Math.round(BH*.3),Math.round(BH*.7),'front'); gfx.globalAlpha=1; }
    if(ms>P.walk-100&&ms<P.home) { gfx.globalAlpha=fin(seg(ms,P.walk-100,P.walk+100),.5); tackleBox(tx-42,sb+4,ms>P.lure0-200); gfx.globalAlpha=1; }
    // the rod (only between the walk and home)
    if(ms>P.walk&&ms<P.home) { const t=tipOf(ms),h=t.h,bend=ms>P.taut&&ms<P.slack?(ms<P.yank?.5:.9):0;
      gfx.lineCap='round'; gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.moveTo(h.x,h.y);
      gfx.quadraticCurveTo((h.x+t.x)/2+bend*10,(h.y+t.y)/2-bend*20,t.x,t.y+bend*16); gfx.stroke(); gfx.strokeStyle=ROD; gfx.lineWidth=3; gfx.stroke();
      EO(h.x+4,h.y-3,4,4,'#9aa0a8');
      const tip={x:t.x,y:t.y+bend*16};
      // Tom's fists on the rod for the heave
      if(ms>P.grip-80&&ms<P.slack) { const g=seg(ms,P.grip-80,P.grip); for(const f2 of [.32,.5]) EO(lerp(h.x,tip.x,f2)+(1-g)*30,lerp(h.y,tip.y,f2)-bend*8,5.5,5,SKIN); }
      // the lure: Tom clips it on, it hangs at the tip until the cast
      if(ms>P.lure0&&ms<P.rel) { const th=handPt(tsp,tsp.act,sT.x,sT.b,-1),q=ez(seg(ms,P.lure0,P.lure1));
        const lx=ms<P.lure1?lerp(th.x,tip.x,q):tip.x+Math.sin(ms/260)*2,ly=ms<P.lure1?lerp(th.y,tip.y+14,q)-Math.sin(q*Math.PI)*20:tip.y+16;
        if(ms>P.lure1) { Ln(tip.x,tip.y,lx,ly-5,1.5,'#eef4f6'); }
        gfx.globalAlpha=.35+.2*Math.sin(ms/120); E(lx,ly,12,12,GOLD); gfx.globalAlpha=1; boule(lx,ly,.55,true); }
      // the cast: the hook flies in one big arc over every monster
      if(ms>=P.rel&&ms<P.land) { if(!rel) rel={x:tip.x,y:tip.y}; const hk=hookAt(),q=seg(ms,P.rel,P.land),hx=lerp(rel.x,hk.x,q),hy=lerp(rel.y,hk.y,q)-Math.sin(q*Math.PI)*150;
        gfx.strokeStyle='#eef4f6'; gfx.lineWidth=1.8; gfx.beginPath(); gfx.moveTo(tip.x,tip.y); gfx.quadraticCurveTo((tip.x+hx)/2,Math.min(tip.y,hy)-30,hx,hy); gfx.stroke();
        gfx.globalAlpha=.4; E(hx,hy,10,10,GOLD); gfx.globalAlpha=1; boule(hx,hy,.55,true); }
      // the line lies over every monster's head, from the tip to the hook beyond the back row
      if(ms>=P.land&&ms<P.slack+300) { const pts=[tip].concat(o3.map(o=>{ const q=ST.foe(o.f); return {x:q.x+(o.f.ox||0),y:q.top+(o.f.oy||0)+4}; })),hk=hookAt(); pts.push(hk);
        const sag=ms<P.taut?20:(ms<P.slack?3:30*seg(ms,P.slack,P.slack+300)),a=ms>P.slack?1-seg(ms,P.slack,P.slack+300):1;
        gfx.globalAlpha=a; for(const [w,c] of [[3.5,'#2a3a4a'],[1.8,'#eef4f6']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(pts[0].x,pts[0].y);
          for(let i=1;i<pts.length;i++) { const p0=pts[i-1],p1=pts[i]; gfx.quadraticCurveTo((p0.x+p1.x)/2,Math.max(p0.y,p1.y)+sag,p1.x,p1.y); } gfx.stroke(); }
        boule(hk.x,hk.y,.55,true); gfx.globalAlpha=1; } }
    // the monsters: tugged while the line is taut, then reeled forward into their new spots
    for(const o of S0) { const cur=ST.foe(o.f);
      if(ms>P.taut&&ms<P.yank) { o.f.ox=3+Math.sin(ms/45+o.q.x)*2; o.f.oy=0; o.f.fsc=0; o.f.spin=Math.sin(ms/60+o.q.x)*.06; o.f.spinAt=performance.now(); }
      else if(ms>=P.yank&&ms<P.yank+700) { const q=ez(seg(ms,P.yank,P.yank+520)); o.f.ox=(o.q.x-cur.x)*(1-q)+Math.sin(seg(ms,P.yank,P.yank+700)*Math.PI)*10; o.f.oy=(o.q.base-cur.base)*(1-q)-Math.sin(q*Math.PI)*14;
        o.f.fsc=0; o.f.spin=.25*Math.sin(q*Math.PI); o.f.spinAt=performance.now(); } }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Cattail Pier. Two camp chairs. One very serious fisherman.'); B2.aim=null; S('click'); }],
    [P.walk,()=>{ S('creak'); }],
    [P.lure0,()=>{ S('click'); setMessage('Tom baits the hook with a piece of sourdough crust.'); }],
    [P.bline,()=>{ say('boppy','dc1'); word('SHHH!',bx-6,Math.max(80,sb-BH-34),CREAM,3,.9); }],
    [P.rip,()=>{ S('splash'); setMessage('Ripples. Behind the reeds.'); }],
    [P.tline,()=>{ say('tom','dcboppy1'); }],
    [P.stand,()=>{ S('creak'); setMessage('Boppy stands up. He mutters. He winds up.'); }],
    [P.fwd,()=>{ S('whoosh'); S('reel'); word('ZIIIP!',GR.x+20,40,'#eef4f6',4,.8); }],
    [P.land,()=>{ S('splash'); scene('splashw',.9,{x:GR.x,y:GR.base,n:16,sp:110}); for(const o of S0) ST.jolt(o.f,.3); word('SPLASH!',GR.x,66,'#9fe8ff',4,.5); setMessage('One cast. The line lands over EVERY monster.'); }],
    [P.taut,()=>{ S('charge'); }],
    [P.grab,()=>{ setMessage('Tom grabs the rod too.'); }],
    [P.yank,()=>{ S('crash'); S('splash'); battle.shakeEnemy=.8; scene('splashw',.9,{x:GR.x,y:GR.base,n:18,sp:130}); word('YANK!',GR.x,40,GOLD,5,1);
      scene('tb_rings',.7,{x:GR.x,y:GR.base,r:110,c:FOAM,w:3}); setMessage('They heave together. The whole school comes forward.'); landHit(100); E2.apply(); }],
    ['hf',P.yank],
    [P.ache,()=>{ S('sulk'); word('MY BACK.',bx-10,Math.max(80,sb-BH-30),CREAM,3,1); }],
    [P.slack,()=>{ S('reel'); }],
    [P.end,'end',()=>{ for(const o of S0) { o.f.fsc=0; o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Boppy says nobody talked, so it worked.'; }]];
  ST.play(E2,steps);
};

// ---------- 2nd Ave Window Wash (Tom + TNB, Director's Cut of tier 1) ----------
// Grey smog rolls down 2nd Ave. Tom unboxes a sleek white turbo fan and blows the haze onto the monsters. TNB carves a
// half-circle around him on his longboard with the garden hose, spraying a rainbow over the party (washing the debuffs off),
// kisses Tom on the pass-by (a fresh outfit from the rack), then turns the hose on the monsters: a soapy wave rolls over
// every one of them. Effects: Splash hit on every enemy (kind: they warm up), COOL Down 2 turns, party cured, rack Tom.
const HOSE='#3fa04a',HOSE2='#6ac86a',RAIN=['#ff6a6a','#ffb84a','#ffe84a','#6ae07a','#5ac8ff','#a88aff'];
const turboFan=(x,b,spin,rise=1)=>{ const cy=b-44*rise,r=20;
  RO(x-14,b-4,28,4,'#e8ecf0'); RO(x-2,cy+r-2,4,b-4-(cy+r-2),'#dfe3ea');
  E(x,cy,r+3,r+3,OUT); E(x,cy,r+1,r+1,'#f4f6f8'); E(x,cy,r-3,r-3,'#c9d6e2');
  for(let k=0;k<3;k++) { gfx.save(); gfx.translate(x,cy); gfx.rotate(spin+k*2.094); E(0,-8,5.5,9.5,OUT); E(0,-8,4,8,'#ffffff'); gfx.restore(); }
  EO(x,cy,3.5,3.5,'#5a6a7a'); ring(x,cy,r-3,r-3,1,'#9aa8b8'); for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(x+Math.cos(a)*6,cy+Math.sin(a)*6,x+Math.cos(a)*(r-1),cy+Math.sin(a)*(r-1),1,'#9aa8b8'); } };
const fanBox=(x,b,open)=>{ RO(x-20,b-26,40,26,'#c9a06a'); R(x-20,b-26,40,4,'#dfb880'); R(x-3,b-26,6,26,'#e8d8b0'); label('TURBO',x,b-14,'#7a5a30',1);
  if(open>0) for(const s of [-1,1]) { gfx.save(); gfx.translate(x+s*20,b-26); gfx.rotate(s*open*1.9); RO(s>0?-20:0,-3,20,3,'#c9a06a'); gfx.restore(); } };
const smog=(x,y,r,a)=>{ if(a<=0) return; gfx.globalAlpha=a; E(x,y+2,r+2,r*.7+2,'#5a5e66'); E(x,y,r,r*.7,'#8a8f98'); E(x-r*.3,y-r*.25,r*.45,r*.3,'#a4a9b2'); gfx.globalAlpha=1; };
B2_TOMBO_ANIM.tnb1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),order=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const tx=cl(GR.x1+160,GR.x1+136,460),sb=cl(GR.base+4,236,296),fx=tx-50,fb=sb-14,nx0=tx+84,nb=sb+6,kx=tx-52,x0=tx-100,wb=Math.min(320,GR.base+18);
  const P={walk:650,box:500,boxLand:780,open:900,rise:900,fan:1150,nline:1700,carve:2350,carveEnd:3550,kiss:3850,blast:4150,wave:4300,waveEnd:5000,shine:5050,tline:5150,home:5700,end:6450};
  const wf=ms=>lerp(x0,-180,seg(ms,P.wave,P.waveEnd));
  order.forEach(o=>{ o.t=Math.round(P.wave+cl((x0-(o.q.x+o.q.w*.3))/(x0+180))*(P.waveEnd-P.wave)); });
  const sT={x:tx,b:sb,f:tsp.idle},sN={x:nx0,b:nb,f:nsp.idle,board:false,tilt:0};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { if(ms>P.boxLand&&ms<P.fan+100) f=sp.kneel; else if(ms>P.tline-80&&ms<P.home-100) f=sp.celeb; else if(ms>P.kiss-150&&ms<P.kiss+300) y-=3; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nx0,y=nb,f=sp.idle,rot=0,board=false;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,nx0,k); y=lerp(c.origBase,nb,k); f=k<1?runFr(sp,c.t,-1):sp.idle; }
    else if(ms<P.carve) { f=ms>P.nline-60&&ms<P.nline+900?sp.act:sp.idle; if(ms>P.carve-200) { board=true; y-=6*seg(ms,P.carve-200,P.carve); } }
    else if(ms<P.carveEnd) { const q=ez(seg(ms,P.carve,P.carveEnd)),th=q*Math.PI; x=tx+(Math.cos(th)>0?84:66)*Math.cos(th); y=nb+28*Math.sin(th)-6; f=sp.aim||sp.act; rot=-.12*Math.sin(th); board=true; }
    else if(ms<P.kiss) { const q=ez(seg(ms,P.carveEnd,P.kiss-60)); x=lerp(tx-66,kx,q); y=lerp(nb-6,sb+4,q); f=sp.flip; board=q<1; }
    else if(ms<P.blast) { x=kx; y=sb+4; f=sp.flip; if(ms<P.kiss+250) x+=Math.sin(seg(ms,P.kiss,P.kiss+250)*Math.PI)*8; }
    else if(ms<P.home) { x=kx; y=sb+4; f=ms<P.waveEnd?(sp.act):(ms>P.shine?sp.celeb2||sp.celeb:sp.idle); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(kx,c.origX,k); y=lerp(sb+4,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; sN.board=board; sN.tilt=rot; return {cx:x,base:y,frame:f,rot,noShadow:board}; });
  const setK=ms=>ez(seg(ms,0,400))*(1-ez(seg(ms,P.home,P.home+500)));
  // Behind everyone: a dull grey 2nd Ave sky that brightens after the wash, and the fan.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=setK(ms); if(k<=0) return;
    const grey=1-ez(seg(ms,P.wave+300,P.shine+300));
    gfx.globalAlpha=k*.32*grey; R(0,0,576,324,'#5a5e66'); gfx.globalAlpha=1;
    if(ms>P.rise) { const r=ez(seg(ms,P.rise,P.fan)),spin=ms>P.fan?Math.pow((ms-P.fan)/1000,1.4)*40:0; gfx.globalAlpha=k; turboFan(fx,fb,spin,.4+.6*r); gfx.globalAlpha=1; }
  }});
  const rnd=(i,j)=>{ const v=Math.sin(i*127.1+j*311.7)*43758.5453; return v-Math.floor(v); };
  const puffs=[]; for(let i=0;i<16;i++) puffs.push({x0:20+rnd(i,1)*540,y0:70+rnd(i,2)*190,r:20+rnd(i,3)*16,tx:GR.x0+rnd(i,4)*GR.w,ty:GR.top+rnd(i,5)*(GR.base-GR.top),ph:rnd(i,6)*6});
  const nozzle=()=>handPt(nsp,sN.f,sN.x,sN.b,sN.f===nsp.flip?1:-1);
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=setK(ms);
    // the box drops in front of Tom, opens, the fan rises out of it (the fan itself is in the back layer)
    if(ms>P.box&&ms<P.fan+500) { const q=seg(ms,P.box,P.boxLand),by=ms<P.boxLand?lerp(-40,fb+4,q*q):fb+4+ez(seg(ms,P.fan,P.fan+500))*40;
      gfx.globalAlpha=ms>P.fan?1-seg(ms,P.fan,P.fan+500):1; fanBox(fx,by,ez(seg(ms,P.open,P.open+200))); gfx.globalAlpha=1; }
    // wind from the fan
    if(ms>P.fan&&ms<P.waveEnd) { const a=ez(seg(ms,P.fan,P.fan+300))*(1-seg(ms,P.wave,P.waveEnd));
      gfx.globalAlpha=a*.55; for(let j=0;j<7;j++) { const yy=fb-44+(j-3)*11,d=((ms*.45+j*41)%240); Ln(fx-26-d,yy,fx-50-d,yy,2,'#ffffff'); } gfx.globalAlpha=1; }
    // the hose: from TNB's hand down to the street and off to the right
    if(ms>P.walk-200&&ms<P.home+200) { const h=nozzle(),a=fin(seg(ms,P.walk-200,P.walk),.5)*(ms>P.home?1-seg(ms,P.home,P.home+200):1); gfx.globalAlpha=a;
      for(const [w,c] of [[6,OUT],[3.5,HOSE]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(h.x,h.y); gfx.quadraticCurveTo(h.x+24,sN.b+8,h.x+70,sN.b+4); gfx.quadraticCurveTo(h.x+150,sN.b,600,sb+18); gfx.stroke(); }
      EO(h.x,h.y,3.5,3,'#c9a23a'); gfx.globalAlpha=1; }
    // TNB's longboard under his feet
    if(sN.board) longboard(sN.x,sN.b+4,sN.tilt);
    // the rainbow spray over the party while he carves
    if(ms>P.carve&&ms<P.carveEnd+150) { const h=nozzle(),others=party.filter(p=>p!==pt),a=fin(seg(ms,P.carve,P.carve+200),.5)*(1-seg(ms,P.carveEnd,P.carveEnd+150));
      const PX=others.reduce((m,p)=>m+(p===tom?sT.x:ST.unit(p).x),0)/Math.max(1,others.length),PT=Math.min(...others.map(p=>p===tom?sT.b-TH:ST.unit(p).top))-12;
      gfx.globalAlpha=a*.32; RAIN.forEach((c,i)=>{ gfx.strokeStyle=c; gfx.lineWidth=4; gfx.beginPath(); gfx.moveTo(h.x,h.y); gfx.quadraticCurveTo((h.x+PX)/2,Math.min(h.y,PT)-110+i*5,PX+40-i*8,PT+i*4); gfx.stroke(); });
      gfx.globalAlpha=a; for(let j=0;j<14;j++) { const q=((ms/520)+j/14)%1,cx2=(h.x+PX)/2,cy2=Math.min(h.y,PT)-110,bx=lerp(lerp(h.x,cx2,q),lerp(cx2,PX+20,q),q),by=lerp(lerp(h.y,cy2,q),lerp(cy2,PT,q),q); E(bx,by,2.2,3,'#9fe8ff'); }
      for(const p of others) { const q2=p===tom?{x:sT.x,top:sT.b-TH,base:sT.b}:ST.unit(p); for(let j=0;j<5;j++) { const qq=((ms/400)+j/5+p.idx*.13)%1; E(q2.x-18+j*9,lerp(q2.top-6,q2.base-30,qq),1.8,3,'#bfefff'); } }
      gfx.globalAlpha=1; }
    // smog: everywhere, then blown onto the monsters, then washed away by the wave
    if(k>0&&ms<P.waveEnd+400) { const kF=ez(seg(ms,P.fan,P.fan+1100));
      for(const p of puffs) { let x=lerp(p.x0+Math.sin(ms/900+p.ph)*10,p.tx,kF),y=lerp(p.y0,p.ty,kF)+Math.sin(ms/700+p.ph)*4,a=.5*k;
        if(ms>P.wave) { const w=wf(ms); if(w<x+30) { const q=cl((x+30-w)/120); x-=q*60; y-=q*20; a*=1-q; } }
        smog(x,y,p.r,a); } }
    // the water jet from the nozzle that starts the wave
    if(ms>P.blast&&ms<P.wave+250) { const h=nozzle(),q=ez(seg(ms,P.blast,P.wave)),ex=lerp(h.x,x0,q),ey=lerp(h.y,wb-30,q),a=1-seg(ms,P.wave,P.wave+250);
      gfx.globalAlpha=a; for(const [w,c] of [[9,'#3a8ac0'],[5,'#9fe8ff'],[2,'#ffffff']]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(h.x,h.y); gfx.quadraticCurveTo((h.x+ex)/2,Math.min(h.y,ey)-26,ex,ey); gfx.stroke(); } gfx.globalAlpha=1; }
    // the soapy wave rolling left over every monster (clipped so it never covers the party)
    if(ms>P.wave&&ms<P.waveEnd+300) { const w=wf(ms),H=165*ez(seg(ms,P.wave,P.wave+220))*(ms>P.waveEnd?1-seg(ms,P.waveEnd,P.waveEnd+300):1);
      gfx.save(); gfx.beginPath(); gfx.rect(0,0,x0+8,324); gfx.clip();
      gfx.beginPath(); gfx.moveTo(w,wb); gfx.quadraticCurveTo(w-6,wb-H*.6,w+8,wb-H); gfx.quadraticCurveTo(w-18,wb-H+4,w-22,wb-H+24); gfx.quadraticCurveTo(w+10,wb-H-10,w+46,wb-H*.9);
      gfx.quadraticCurveTo(w+150,wb-H*.55,w+240,wb-H*.1); gfx.lineTo(w+260,wb+6); gfx.lineTo(w,wb+6); gfx.closePath();
      gfx.globalAlpha=.78; gfx.fillStyle='#5ec8ff'; gfx.fill(); gfx.globalAlpha=1; gfx.lineWidth=3; gfx.strokeStyle='#2a7ab0'; gfx.stroke();
      gfx.strokeStyle='#ffffff'; gfx.lineWidth=5; gfx.beginPath(); gfx.moveTo(w-20,wb-H+22); gfx.quadraticCurveTo(w-16,wb-H,w+8,wb-H); gfx.quadraticCurveTo(w+40,wb-H-4,w+60,wb-H*.88); gfx.stroke();
      for(let j=0;j<16;j++) { const bx2=w+8+((j*29+ms*.05)%200),by2=wb-H*.2-rnd(j,9)*H*.7*(1-(bx2-w)/260); EO(bx2,by2,2.5+rnd(j,3)*3,2.5+rnd(j,3)*3,'#eaf8ff'); }
      gfx.restore();
      // foam where the jet feeds the wave, hiding the clip edge
      if(ms<P.waveEnd) for(let j=0;j<6;j++) { const fy=wb-8-j*Math.min(H,90)/6,r=7+Math.sin(ms/60+j)*2; EO(x0+4,fy,r,r*.8,'#f4fbff'); } }
    // the kiss
    if(ms>P.kiss&&ms<P.kiss+1100) { const q=seg(ms,P.kiss,P.kiss+1100),hx=(sT.x+sN.x)/2,hy=Math.min(sT.b-TH,sN.b-NH)-12-q*30; gfx.globalAlpha=fade(q,.7); heart(hx,hy,lerp(8,18,ez(q*3)),PINK); gfx.globalAlpha=1; }
    // squeaky clean: a shine sweeps across the glass and the street glints
    if(ms>P.shine&&ms<P.shine+900) { const q=seg(ms,P.shine,P.shine+700),sx=lerp(-120,700,q); gfx.globalAlpha=.28*(1-seg(ms,P.shine+600,P.shine+900));
      gfx.fillStyle='#ffffff'; gfx.beginPath(); gfx.moveTo(sx,0); gfx.lineTo(sx+60,0); gfx.lineTo(sx-40,324); gfx.lineTo(sx-100,324); gfx.closePath(); gfx.fill(); gfx.globalAlpha=1;
      for(let j=0;j<7;j++) { const t0=j*90,qq=seg(ms,P.shine+t0,P.shine+t0+400); if(qq>0&&qq<1) { gfx.globalAlpha=Math.sin(qq*Math.PI); star(30+rnd(j,7)*(x0-20),60+rnd(j,8)*170,4+Math.sin(qq*Math.PI)*6,'#ffffff'); gfx.globalAlpha=1; } } }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Smog rolls down 2nd Ave. Nobody can see a thing.'); B2.aim=null; S('whoosh'); }],
    [P.boxLand,()=>{ S('thud'); }],
    [P.open,()=>{ S('click'); setMessage('Tom unboxes a turbo fan. Of course he does.'); }],
    [P.fan,()=>{ S('whoosh'); word('WHIRRR!',fx,Math.max(80,fb-90),CREAM,3,.9); setMessage('He blows the smog right onto the monsters.'); }],
    [P.nline,()=>{ say('tnb','dc1'); }],
    [P.carve,()=>{ S('whoosh'); setMessage('TNB carves around him on his longboard, garden hose in hand.'); }],
    [P.carve+500,()=>{ S('splash'); }],
    [P.carve+700,'A rainbow washes the whole party clean.'],
    [P.kiss,()=>{ S('kiss'); E2.apply(); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sN.x,mid:sN.b-NH*.5}:ST.unit(p)); scene('glow',.9,{x:q2.x,y:q2.mid,rx:38,ry:52,c:'#9fe8ff',a:.35}); }
      setMessage('A kiss on the pass-by. And a fresh outfit from the rack.'); }],
    [P.blast,()=>{ S('splash'); setMessage('Then TNB turns the hose on the monsters.'); }],
    [P.wave,()=>{ S('crash'); S('splash'); battle.shakeEnemy=.6; word('SPLOOSH!',GR.x,40,'#9fe8ff',5,.7); }],
    [P.shine,()=>{ S('ding'); S('squeak'); word('SQUEAKY CLEAN!',288,66,'#ffffff',3,1.1); }],
    [P.tline,()=>{ say('tom','dctnb1'); }]];
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('splat'); ST.jolt(o.f,.55); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:'#bfefff',w:3});
    for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(j-1)*24,y1:o.q.top-30,arc:14,spin:false,r:6,t:-j*.06,dur:.7});
    landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.wave]);
  steps.push([P.end,'end',()=>(E2.result||'')+' 2nd Ave has never looked cleaner.']);
  ST.play(E2,steps);
};
// ---------- Puzzle Toy (Tom + Nara, Director's Cut of tier 1) ----------
// Tom kneels and slides a wooden puzzle toy over to Nara. She sniffs each lid, flips it and eats the treat (on the second
// she tries her paw first: BONK). The last hole is empty. She sniffs the air, follows a gold scent trail to the monster,
// noses under it and flips it right over: the last treat was under it. Effect: a Kinetic hit on one enemy and she grabs
// what it holds (b2Take: its drop item, or coins).
const WOOD='#c98a4a',WOOD2='#9a6232',WOOD3='#e8b07a',LIDC=['#3fb8a8','#f08a3a','#e86a9a'];
// The toy: a rounded wooden board, base at b, three holes with colored lids. lids[i] = {open 0..1, treat, pop 0..1}.
const puzzleToy=(cx,b,lids,sh=0)=>{ const x=cx+sh,W=136,H=24,y=b-H;
  rr(x-W/2,y,W,H,8,WOOD,2); R(x-W/2+8,y+3,W-16,3,WOOD3); R(x-W/2+6,b-7,W-12,3,WOOD2);
  for(const dx of [-60,60]) EO(x+dx,b-12,3,3,WOOD2);
  lids.forEach((l,i)=>{ const lx=x-44+i*44,ly=y+9,o=ez(l.open);
    E(lx,ly,15,6.5,OUT); E(lx,ly,13,5,'#4a2a12');
    if(o>0) { EO(lx,ly-6-o*10,13,lerp(5,12,o),LIDC[i]); E(lx-4,ly-9-o*12,4,lerp(1.5,4,o),'#ffffff'); }
    if(l.treat) treat(lx,ly-2-l.pop*16,.9,0);
    if(o<=0) { EO(lx,ly-3,14,6,LIDC[i]); E(lx-5,ly-5,5,2,'#ffffff'); } }); };
B2_TOMBO_ANIM.nara1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt);
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES.nara,TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const tx=cl(GR.x1+200,GR.x1+170,512),sb=cl(GR.base+4,236,300),px=tx-122,tb=sb+10,nb=sb+2;
  const AIM=nsp.aim||nsp.idle,mo=handPt(nsp,AIM,0,0,-1),lidX=i=>px-44+i*44,atLid=i=>lidX(i)-mo.x;
  const nf=F.x+F.w/2+4-mo.x,back=tx-58;
  const P={walk:800,kneel:650,slide:760,slid:1060,tline:1150,
    s2:1150,o2:1500,e2:1760,m1:1820,paw:2000,bonk:2200,s1:2380,o1:2600,e1:2860,m0:2920,s0:3120,o0:3360,huh:3520,
    nline:3620,trail:3700,trailEnd:4100,run:4120,arrive:4520,nose:4560,flip:4760,flipEnd:5060,grab:5180,carry:5320,sat:5880,
    upright:5700,uprightEnd:6000,home:6200,end:6900};
  const lids=[0,1,2].map(i=>({open:0,treat:i>0,pop:0})),opens={2:[P.o2,P.e2],1:[P.o1,P.e1],0:[P.o0,null]};
  const sT={x:tx,b:sb,f:tsp.idle},sN={x:atLid(2),b:nb,f:AIM,dir:-1,mouthTreat:false};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle;
    if(ms<P.walk&&ms<P.kneel) { const k=ez(ms/P.kneel); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.kneel); }
    else if(ms<P.home) { if(ms<P.slid+60) f=sp.kneel; else if(ms<P.e1&&ms>P.tline-60) f=ms>P.bonk&&ms<P.bonk+500?sp.expr:sp.act; else if(ms>P.grab&&ms<P.home-80) f=sp.celeb; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=atLid(2),y=nb,f=AIM,dir=-1,rot=0;
    const glide=(a,b,x0,x1)=>{ const k=ez(seg(ms,a,b)); x=lerp(x0,x1,k); y=nb-Math.abs(Math.sin(seg(ms,a,b)*Math.PI))*5; f=k<1?runFr(sp,c.t,x1>x0?1:-1):AIM; dir=x1>x0?1:-1; };
    const sniff=a=>{ f=AIM; y=nb+Math.abs(Math.sin((ms-a)/70))*2; };
    if(ms<P.walk) { const k=ez(ms/P.walk),d=atLid(2)>c.origX?1:-1; x=lerp(c.origX,atLid(2),k); y=lerp(c.origBase,nb,k)-Math.abs(Math.sin(c.t*16))*4; f=k<1?runFr(sp,c.t,d):AIM; }
    else if(ms<P.m1) sniff(P.s2);
    else if(ms<P.paw) glide(P.m1,P.paw-20,atLid(2),atLid(1));
    else if(ms<P.s1) { x=atLid(1); f=sp.act; if(ms>P.bonk-120&&ms<P.bonk) y=nb-4; }
    else if(ms<P.m0) { x=atLid(1); sniff(P.s1); }
    else if(ms<P.s0) glide(P.m0,P.s0-20,atLid(1),atLid(0));
    else if(ms<P.nline) { x=atLid(0); if(ms<P.huh) sniff(P.s0); else f=sp.idle; }
    else if(ms<P.run) { x=atLid(0); f=AIM; y=nb-Math.abs(Math.sin((ms-P.nline)/90))*3; }
    else if(ms<P.arrive) { const k=ez(seg(ms,P.run,P.arrive)); x=lerp(atLid(0),nf,k); y=lerp(nb,F.base,k)-Math.abs(Math.sin(c.t*16))*4; f=k<1?runFr(sp,c.t,-1):AIM; }
    else if(ms<P.grab) { x=nf; y=F.base; f=AIM; if(ms>P.nose&&ms<P.flip+80) x-=6*Math.sin(seg(ms,P.nose,P.flip+80)*Math.PI); if(ms>P.flip&&ms<P.flip+260) y-=Math.sin(seg(ms,P.flip,P.flip+260)*Math.PI)*10; }
    else if(ms<P.carry) { x=nf-4; y=F.base; f=AIM; }
    else if(ms<P.sat) { const k=ez(seg(ms,P.carry,P.sat)); x=lerp(nf-4,back,k); y=lerp(F.base,nb,k)-Math.abs(Math.sin(c.t*16))*4; f=k<1?runFr(sp,c.t,1):(sp.flip); dir=1; }
    else if(ms<P.home) { x=back; y=nb; f=ms<P.home-300?(sp.celebFlip||sp.flip):sp.flip; dir=1; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(back,c.origX,k); y=lerp(nb,c.origBase,k)-(k<1?Math.abs(Math.sin(c.t*16))*4:0); f=k<1?runFr(sp,c.t,c.origX>back?1:-1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; sN.dir=dir; return {cx:x,base:y,frame:f,rot}; });
  const mouth=()=>{ const h=handPt(nsp,sN.f,sN.x,sN.b,sN.dir); return {x:h.x,y:h.y}; };
  const rnd=(i,j)=>{ const v=Math.sin(i*127.1+j*311.7)*43758.5453; return v-Math.floor(v); };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    const k=ez(seg(ms,P.slide-100,P.slide+100))*(1-ez(seg(ms,P.home,P.home+400)));
    // the toy slides from Tom's hands across the floor to Nara, then she works the lids
    for(const i of [2,1,0]) { const [o,e]=opens[i],l=lids[i]; l.open=ms>o?seg(ms,o,o+150):0;
      if(l.treat!==false&&i>0) { l.pop=ms>o+100?seg(ms,o+100,o+250):0; l.treat=!(e&&ms>e); } }
    if(k>0) { const x=ms<P.slid?lerp(tx-36,px,ez(seg(ms,P.slide,P.slid))):px,sh=ms>P.bonk&&ms<P.bonk+260?Math.sin((ms-P.bonk)/22)*4*(1-seg(ms,P.bonk,P.bonk+260)):0;
      gfx.globalAlpha=k; puzzleToy(x,tb,lids.map(l=>({open:l.open,treat:l.treat,pop:l.pop})),sh); gfx.globalAlpha=1; }
    // crumbs and a gold sparkle each time she finds one
    for(const [i,e] of [[2,P.e2],[1,P.e1]]) { const q=seg(ms,e,e+500); if(q>0&&q<1) { gfx.globalAlpha=1-q; for(let j=0;j<5;j++) E(lidX(i)+(j-2)*7,tb-30-q*20+rnd(i,j)*8,2,2,'#d9a35a'); star(lidX(i),tb-44-q*16,5,'#fffbe6'); gfx.globalAlpha=1; } }
    // the scent trail: a gold wisp along the floor from the empty hole to under the monster, with a glint there
    if(ms>P.trail&&ms<P.flip+200) { const q=ez(seg(ms,P.trail,P.trailEnd)),a=ms>P.flip?1-seg(ms,P.flip,P.flip+200):1,x0=lidX(0),y0=tb-14,x1=F.x,y1=F.base-6;
      gfx.globalAlpha=a*.85; gfx.strokeStyle=GOLD; gfx.lineWidth=4; gfx.lineCap='round'; gfx.beginPath();
      for(let j=0;j<=40*q;j++) { const t=j/40,xx=lerp(x0,x1,t),yy=lerp(y0,y1,t)-Math.sin(t*Math.PI)*24+Math.sin(t*18-ms/120)*5; j?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke();
      for(let j=0;j<4;j++) { const t=((ms/700)+j/4)%1; if(t<q) { gfx.globalAlpha=a*(1-t)*.9; star(lerp(x0,x1,t),lerp(y0,y1,t)-Math.sin(t*Math.PI)*24-6,3,'#fffbe6'); } }
      gfx.globalAlpha=a; if(q>.9) star(F.x,F.base-6,4+Math.sin(ms/70)*2.5,'#fffbe6'); gfx.globalAlpha=1; }
    // the monster: nosed, then flipped right over (spin to upside down, a hop), then it rolls back up
    if(ms>P.flip&&ms<P.uprightEnd) { let sp2=Math.PI,oy=0;
      if(ms<P.flipEnd) { const q=seg(ms,P.flip,P.flipEnd); sp2=ez(q)*Math.PI; oy=-Math.sin(q*Math.PI)*58; }
      else if(ms>P.upright) { const q=seg(ms,P.upright,P.uprightEnd); sp2=Math.PI+ez(q)*Math.PI; oy=-Math.sin(q*Math.PI)*16; }
      else oy=Math.sin((ms-P.flipEnd)/90)*1.5;
      tgt.spin=sp2; tgt.oy=oy; tgt.ox=0; tgt.fsc=0; tgt.spinAt=performance.now(); }
    // the last treat, found where the monster stood; she picks it up and carries it back
    if(ms>P.flip+120&&ms<P.grab) { const q=seg(ms,P.flip+120,P.flip+320); gfx.globalAlpha=.35+.2*Math.sin(ms/90); E(F.x,F.base-8,22,14,GOLD); gfx.globalAlpha=1; treat(F.x,F.base-8-Math.sin(q*Math.PI)*20,1.7,0); }
    else if(ms>=P.grab&&ms<P.home) { const m=mouth(); treat(m.x+sN.dir*2,m.y+2,1.3,-.2*sN.dir); }
    if(ms>P.sat&&ms<P.sat+1000) { const q=seg(ms,P.sat,P.sat+1000); gfx.globalAlpha=fade(q,.7); heart((sT.x+sN.x)/2,Math.min(sT.b-TH,sN.b-NH)-10-q*26,lerp(7,15,ez(q*3)),PINK); gfx.globalAlpha=1; }
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Tom brings out the puzzle toy. Nara knows this one too.'); B2.aim=null; S('click'); }],
    [P.slide,()=>{ S('step'); }],
    [P.tline,()=>{ say('tom','dcnara1'); }],
    [P.s2,()=>{ S('sniff'); word('SNFF',atLid(2),Math.max(80,nb-NH-26),CREAM,3,.6); }],
    [P.o2,()=>{ S('click'); }],
    [P.e2,()=>{ S('crunch'); setMessage('One lid. One treat. Very good.'); }],
    [P.bonk,()=>{ S('bonk'); word('BONK',lidX(1),Math.max(80,tb-70),'#ffd2a0',3,.6); setMessage('She tries the paw. Tom said not the paw.'); }],
    [P.o1,()=>{ S('click'); }],
    [P.e1,()=>{ S('crunch'); }],
    [P.o0,()=>{ S('click'); }],
    [P.huh,()=>{ S('whine'); word('?',sN.x,Math.max(80,nb-NH-24),GOLD,5,.9); setMessage('The last hole is empty.'); }],
    [P.nline,()=>{ say('nara','dc1'); S('sniff'); }],
    [P.trail,()=>{ setMessage('She has caught the scent. It goes right under the monster.'); }],
    [P.run,()=>{ S('whoosh'); }],
    [P.flip,()=>{ S('boing'); S('thud'); battle.shakeEnemy=.7; battle.flashEnemy=.25; scene('tb_rings',.8,{x:F.x,y:F.base,r:80,c:GOLD,w:4});
      scene('dust',.6,{x:F.x,y:F.base+2,n:8,sp:34,up:12}); word('FLIP!',F.x,40,GOLD,5,1); landHit(100); E2.apply(); setMessage('She flips the monster right over. The last treat was under it.'); }],
    ['hf',P.flip],
    [P.grab,()=>{ S('bark'); }],
    [P.grab+600,()=>{ S('crunch'); }],
    [P.upright,()=>{ S('bump'); }],
    [P.end,'end',()=>{ tgt.spin=0; tgt.oy=0; tgt.ox=0; tgt.fsc=0; return (E2.result||'')+' Nose: 4. Puzzle toy: 0.'; }]]);
};

// ---------- Judge Grace (Tom + Grace, Director's Cut of tier 2) ----------
// On a blue gym mat Grace sits at a little judges' desk and makes Tom try a cartwheel. It is terrible: he wobbles, pitches
// forward like a tree and lands flat on his face (OW!). She holds up a scorecard: 2. The monsters laugh so hard they forget
// to defend. Tom demands a recount; Grace hops over the desk and runs ONE flowing pass (round-off, back handspring, back
// tuck, aerial, twisting flip kick on the row), sticks the landing and holds up a 10. Effects: a Kinetic hit on one row
// (crit +25%), Hooked (cannot dodge) for 2 turns.
const scoreCard=(x,y,num,s=1,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  RO(-1.5,0,3,26,'#c9a06a'); rr(-17,-30,34,32,4,'#fffbf2',2); R(-15,-28,30,4,num==='10'?'#ffd84a':'#e8e0d0');
  bigWord(num,0,-20,num==='10'?'#e8a020':RED,num==='10'?3:4); gfx.restore(); };
const judgeDesk=(x,b,w=60,h=30)=>{ RO(x-w/2,b-h,w,h,'#5a6ab8'); R(x-w/2,b-h,w,4,'#8a9ae0'); RO(x-w/2-4,b-h-5,w+8,6,'#f4f0e6'); label('JUDGE',x,b-h+12,CREAM,1); };
B2_TOMBO_ANIM.grace2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),tl=(E2.targets||[]).filter(t=>t.side==='foe'),row=tl.length?tl:[list[0]];
  const front=row.reduce((m,f)=>ST.foe(f).x>ST.foe(m).x?f:m,row[0]),F=ST.foe(front);
  const tsp=BATTLE_SPRITES.tom,gsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,GH=gsp.idle.length*gsp.scale;
  const W=GRACE_WHEEL,WS=W.scale,WHC=W.C*WS,DEG=Math.PI/180,WP=W.P,TAU=Math.PI*2;
  if(!WP.tuck) WP.tuck={lA:-78,lB:-56,lean:0,bA:.95,bB:.95,side:1};   // knees to chest for the back tuck
  const tx=cl(GR.x1+150,GR.x1+124,448),sb=cl(GR.base+4,236,300),gx=Math.min(548,tx+104),lie=tx-48,c2=F.x+F.w/2+44,lx=tx+16;
  const GY=Math.min(314,F.base+3),reach=-Math.min(...W.tips(WP.kick,WP.kick.lean*DEG).map(v=>v[0]))*WS,kx=Math.min(c2-10,F.x+F.w*.5-2+reach);
  const P={walk:650,try0:800,tip:1000,fall:1550,flop:1800,ow:2250,card:2650,gline:2750,laugh:3350,tline:3900,hop:4550,cw0:4800,ro0:5050,hs0:5550,tk0:5950,ae0:6350,kk0:6850,hit:7350,reb:7470,land:7950,ten:8000,up:7800,clap:8250,home:8650,end:9300};
  const xa=gx-22,xs=[xa,lerp(xa,c2,.22),lerp(xa,c2,.46),lerp(xa,c2,.7),c2];
  const hipBase=W.low(WP.stand,0)*WS;
  const sT={x:tx,b:sb,f:tsp.idle,rot:0},sG={x:gx,b:sb,f:gsp.idle},st={x:null,gy:sb,foot:sb};
  // Tom: tries a cartwheel, wobbles, then pitches forward like a tree, lands flat on his face, bounces, and lies there.
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms<P.tip) { f=ms>P.try0?sp.celeb:sp.idle; if(ms>P.try0) y-=Math.sin(seg(ms,P.try0,P.tip)*Math.PI)*4; }
      else if(ms<P.fall) { const q=seg(ms,P.tip,P.fall); f=sp.act; rot=-ez(q)*1.15+Math.sin(ms/55)*.12*q; x=lerp(tx,tx-30,ez(q)); y-=Math.sin(q*Math.PI)*8; }
      else if(ms<P.flop) { const q=seg(ms,P.fall,P.flop),e=Math.pow(q,2.4); f=sp.act; rot=lerp(-1.15,-Math.PI/2,e); x=lerp(tx-30,lie,e); y=sb+(TH/2-16)*e; }
      else if(ms<P.tline-100) { const u=ms-P.flop,b=Math.exp(-u/170),bo=Math.abs(Math.sin(u/95))*b; f=sp.act; x=lie; y=sb+(TH/2-16)-bo*10;
        rot=-Math.PI/2-bo*.12; if(u>240) rot+=Math.sin((u-240)/60)*.07*Math.exp(-(u-240)/320); }   // the legs flop down last
      else if(ms<P.up) { f=sp.kneel; x=lie; }
      else { x=lie; f=ms>P.clap?(Math.floor((ms-P.clap)/160)%2?sp.celeb:sp.idle):sp.idle; if(ms>P.clap+640) f=sp.celeb; } }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(lie,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; sT.rot=rot; return {cx:x,base:y,frame:f,rot}; });
  // Grace: judges from her desk, hops over it, then ONE flowing pass: round-off, back handspring, back tuck, aerial,
  // twisting flip kick onto the monster, a back flip home and a stuck landing. Poses are hip-centred frames (data/grace-wheel.js).
  const starB=q=>q<.16?W.blend('lunge','star',q/.16,3):(q>.84?W.blend('star','land',(q-.84)/.16,3):{q:WP.star,key:'star'});
  const combo=ms=>{ let x,h=0,th=0,fr,gy=sb;
    if(ms<P.ro0) { const q=seg(ms,P.cw0,P.ro0),b=W.blend('stand','lunge',q,2); x=lerp(xa,xa-8,q); th=b.q.lean*DEG; fr=W.frame(b.q,b.key); }
    else if(ms<P.hs0) { const q=seg(ms,P.ro0,P.hs0),b=starB(q); x=lerp(xa-8,xs[1],q); h=34*Math.sin(q*Math.PI); th=-TAU*ez(q); fr=W.frame(b.q,b.key); }
    else if(ms<P.tk0) { const q=seg(ms,P.hs0,P.tk0),b=q<.5?W.blend('sstand','chamber',q/.5,3):W.blend('chamber','sstand',(q-.5)/.5,3); x=lerp(xs[1],xs[2],q); h=40*Math.sin(q*Math.PI); th=-TAU*ez(q); fr=W.mirror(b.q,b.key); }
    else if(ms<P.ae0) { const q=seg(ms,P.tk0,P.ae0),b=q<.3?W.blend('sstand','tuck',q/.3,3):(q>.74?W.blend('tuck','sstand',(q-.74)/.26,3):{q:WP.tuck,key:'tuck'}); x=lerp(xs[2],xs[3],q); h=56*Math.sin(q*Math.PI); th=-TAU*ez(q); fr=W.mirror(b.q,b.key); }
    else if(ms<P.kk0) { const q=seg(ms,P.ae0,P.kk0),b=starB(q); x=lerp(xs[3],xs[4],q); h=68*Math.sin(q*Math.PI); th=-TAU*ez(q); fr=W.frame(b.q,b.key); }
    else if(ms<P.hit) { const q=seg(ms,P.kk0,P.hit); gy=lerp(sb,GY,ez(q)); x=lerp(xs[4],kx,ez(q)); h=Math.sin(Math.min(1,q*1.1)*Math.PI)*54*(1-q*.45)+q*22;
      th=q<.78?-TAU*ez(q/.78):WP.kick.lean*DEG*ez((q-.78)/.22);
      if(q<.28) { const b=W.blend('sstand','chamber',q/.28,3); fr=W.mirror(b.q,b.key); }
      else if(q<.5) fr=W.frame('star');   // the twist: she turns face-on in mid-air
      else if(q<.82) { const b=W.blend('sstand','chamber',(q-.5)/.32,3); fr=W.frame(b.q,b.key); }
      else { const b=W.blend('chamber','kick',(q-.82)/.18,3); fr=W.frame(b.q,b.key); } }
    else if(ms<P.reb) { gy=GY; x=kx; h=22; th=WP.kick.lean*DEG; fr=W.frame('kick'); }
    else if(ms<P.land) { const q=seg(ms,P.reb,P.land); gy=lerp(GY,sb,ez(q)); x=lerp(kx,lx,ez(q)); h=Math.sin(q*Math.PI)*60+(1-q)*22; th=TAU*ez(q);
      const b=q<.3?W.blend('kick','chamber',q/.3,3):(q>.8?W.blend('chamber','land',(q-.8)/.2,3):{q:WP.chamber,key:'chamber'}); fr=W.frame(b.q,b.key); }
    else { gy=sb; x=lx; h=ms<P.land+140?-Math.sin(seg(ms,P.land,P.land+140)*Math.PI)*4:0; fr=W.frame('land'); }
    if(ms<P.hit||(ms>=P.reb&&ms<P.land)) h+=Math.max(0,1-Math.abs(x-lie)/54)*40;   // she hurdles Tom, who is kneeling on the mat
    return {x,h,th,fr,gy}; };
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=gx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,gx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.hop) { f=ms>P.card&&ms<P.hop-150?sp.celeb:(ms>P.laugh+300?sp.expr:sp.idle); }
    else if(ms<P.cw0) { const q=seg(ms,P.hop,P.cw0); x=lerp(gx,xa,q); y=sb-Math.sin(q*Math.PI)*40; f=sp.celeb; }
    else if(ms<P.home) { const s=combo(ms),hy=s.gy-hipBase-s.h;
      st.x=s.x; st.gy=s.gy; st.foot=s.gy-Math.max(0,s.h); sG.x=s.x; sG.b=s.gy-Math.max(0,s.h); sG.f=s.fr;
      return {cx:s.x,base:hy+WHC,frame:s.fr,rot:s.th,noShadow:true}; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(lx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    st.x=null; sG.x=x; sG.b=y; sG.f=f; return {cx:x,base:y,frame:f,rot,noShadow:ms>P.hop&&ms<P.home}; });
  scene('gv_shadow',P.end/1000,{st});
  scene('tb_mat',P.end/1000,{back:true,x1:Math.min(572,gx+48),w:Math.max(220,Math.min(572,gx+48)-(F.x+F.w/2)+10),y:sb+4,off:P.home});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // the judges' desk in front of Grace's legs, until she hops over it (it tips away)
    const dk=ez(seg(ms,P.walk-250,P.walk+50)); if(dk>0&&ms<P.ro0) { const a=ms>P.hop?1-seg(ms,P.hop,P.ro0):1; gfx.globalAlpha=a; judgeDesk(gx,sb+8); gfx.globalAlpha=1; }
    // the scorecard: 2 held high over her head, then 10 after the landing
    const card=(num,t0,t1)=>{ const q=seg(ms,t0,t0+200),out=1-seg(ms,t1-200,t1); if(q<=0||out<=0) return;
      gfx.globalAlpha=out; scoreCard(sG.x+4,sG.b-GH-6-ez(q)*14,num,1.25*(.6+.4*ez(q)),Math.sin(ms/150)*.06); gfx.globalAlpha=1; };
    card('2',P.card,P.hop-120); card('10',P.ten,P.home);
    // Tom's face-plant: dust where his face lands, stars circling his head while he lies there
    if(ms>P.flop&&ms<P.tline) { for(let j=0;j<3;j++) { const a=ms/300+j*2.1; star(lie-TH*.32+Math.cos(a)*14,sb-26+Math.sin(a)*5,3.5,'#fffbe6'); } }
    // the combo: a faint trail of sparkles behind her in the air
    if(ms>P.ro0&&ms<P.hit&&st.x!=null) for(let j=1;j<=4;j++) { const a=ms-j*45; if(a<P.ro0) break; const s=combo(a); gfx.globalAlpha=.55-j*.11; star(s.x+Math.sin(a/50)*4,s.gy-hipBase-s.h+WHC*.55,3.2-j*.4,j%2?'#fff1b0':'#ffb3d6'); gfx.globalAlpha=1; }
    // the monsters laugh: little shakes and tears
    if(ms>P.laugh&&ms<P.hop+300) { for(const f of list) { const q=ST.foe(f); f.spin=Math.sin(ms/50+q.x)*.07; f.oy=-Math.abs(Math.sin(ms/70+q.x))*3; f.spinAt=performance.now();
        const t2=((ms-P.laugh)/500+q.x*.01)%1; gfx.globalAlpha=1-t2; E(q.x-q.w*.25-t2*10,q.top+q.h*.35+t2*20,2.2,3,'#9fe8ff'); E(q.x+q.w*.25+t2*10,q.top+q.h*.35+t2*20,2.2,3,'#9fe8ff'); gfx.globalAlpha=1; } }
    else if(ms>=P.hop+300&&ms<P.hop+400) for(const f of list) { f.spin=0; f.oy=0; }
  }});
  const here=()=>({x:cl(st.x==null?gx:st.x,60,520),y:Math.max(58,sb-GH-46)});
  ST.play(E2,[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Judge Grace is in session. Tom is up first.'); B2.aim=null; S('whoosh'); }],
    [P.try0,()=>{ setMessage('Tom attempts a cartwheel.'); }],
    [P.tip,()=>{ S('creak'); }],
    [P.fall-80,()=>{ S('slideWhistle'); setMessage('He is going over. Like a tree.'); }],
    [P.flop,()=>{ S('thud'); S('bonk'); scene('gv_dust',.6,{x:lie-TH*.45,y:sb+6}); scene('gv_dust',.6,{x:lie+TH*.1,y:sb+6}); scene('tb_rings',.5,{x:lie-TH*.4,y:sb,r:36,c:CREAM,w:3}); battle.shakeEnemy=.35; }],
    [P.flop+170,()=>{ S('thud'); }],
    [P.ow,()=>{ say('tom','dcgrace2ow'); word('OUCH!',lie,Math.max(70,sb-TH-14),RED,5,1.1); setMessage('Face first. His pride took most of it.'); }],
    [P.card,()=>{ S('ding'); }],
    [P.gline,()=>{ say('grace','dc2'); }],
    [P.laugh,()=>{ S('giggle'); word('HA HA HA!',GR.x,40,'#ffffff',4,1); setMessage('The monsters laugh so hard they forget to defend.'); }],
    [P.laugh+700,()=>{ word('LOL',GR.x,66,'#ffd2a0',3,.7); }],
    [P.tline,()=>{ say('tom','dcgrace2'); }],
    [P.hop,()=>{ S('boing'); setMessage('Grace shows him how it\'s done.'); }],
    [P.ro0,()=>{ S('whoosh'); const h=here(); word('ROUND-OFF!',h.x,h.y,PINK,3,.5); setMessage('ONE pass. Round-off, back handspring, back tuck, aerial...'); }],
    [P.hs0,()=>{ S('whoosh'); S('step'); const h=here(); word('HANDSPRING!',h.x,h.y-18,GOLD,3,.5); scene('gv_burst',.5,{x:st.x||gx,y:sb-60,n:8,r:44,sz:7,c:GOLD,c2:CREAM}); }],
    [P.tk0,()=>{ S('whoosh'); const h=here(); word('BACK TUCK!',h.x,h.y,'#9fd8ff',3,.5); scene('gv_burst',.5,{x:st.x||gx,y:sb-70,n:8,r:44,sz:7,c:PINK,c2:CREAM}); }],
    [P.ae0,()=>{ S('whoosh'); const h=here(); word('AERIAL!',h.x,h.y-18,CREAM,3,.5); scene('gv_burst',.5,{x:st.x||gx,y:sb-84,n:10,r:50,sz:7,c:GOLD,c2:CREAM}); }],
    [P.kk0,()=>{ S('slideWhistle'); setMessage('...and a twisting flip kick at the monster.'); }],
    [P.hit,()=>{ S('thud'); S('bonk'); battle.shakeEnemy=.8; battle.flashEnemy=.3; for(const f of row) ST.jolt(f,f===front?.7:.45);
      scene('tb_rings',.8,{x:F.x+F.w*.3,y:F.top+F.h*.45,r:80,c:GOLD,w:4}); word('FLIP KICK!',F.x,40,GOLD,4,1); landHit(100); E2.apply(); }],
    ['hf',P.hit],
    [P.land,()=>{ S('thud'); scene('gv_dust',.4,{x:lx-10,y:sb+4}); scene('gv_dust',.4,{x:lx+10,y:sb+4}); word('STUCK IT!',lx,Math.max(70,sb-GH-50),PINK,3,.8); }],
    [P.ten,()=>{ S('fanfare'); scene('confetti',1.4,{x0:lx-120,x1:lx+120,n:26}); setMessage('A perfect 10. Judge Grace scores herself, obviously.'); }],
    [P.clap,()=>{ S(sfx.clap?'clap':'bump'); }],
    [P.end,'end',()=>{ for(const f of list) { f.spin=0; f.oy=0; } return (E2.result||'')+' Tom is appealing the score.'; }]]);
};
// ---------- Princess and Her Bodyguard (Tom + Rose, Director's Cut of tier 2) ----------
// Rose in full princess dress-up (tiara, Lamby as her scepter); Tom in sunglasses and an earpiece as her royal bodyguard.
// A red carpet rolls out toward the monsters. He steps in front of her and holds them back (DEFEND); she processes down
// the carpet and knights each monster with Lamby, tap tap, and each one bows and backs out of her way. Then she climbs
// up on his shoulders. Effects (no damage): every enemy warms up, the party turns Evasive for 2 turns, Rose shakes off
// mind troubles, and she rides home on Tom's shoulders.
// Tom's sunglasses and earpiece, drawn over his drawn body. Sprite pixel spots (scale 2.6): facing left (idle, act, expr)
// lens cols 8.6-16.6 rows 10.6-13.4, ear col 21.5 row 11.6; front (celeb) two lenses; facing right (flip) mirrored.
const shades=(sp,fk,x,b)=>{ const sc=sp.scale,W=sp.idle[0].length*sc,H=sp.idle.length*sc,px=c=>x-W/2+c*sc,py=r=>b-H+r*sc;
  const lens=(c0,c1,r0,r1)=>{ rr(px(c0),py(r0),(c1-c0)*sc,(r1-r0)*sc,3,'#14161c',1.5); R(px(c0)+3,py(r0)+2,Math.max(2,(c1-c0)*sc*.3),2,'#6a7488'); };
  const bud=(c,r,dir)=>{ EO(px(c),py(r),2.6,2.6,'#2a2c34'); gfx.lineWidth=1.4; gfx.strokeStyle='#d8dce4'; gfx.beginPath(); gfx.moveTo(px(c),py(r)+2);
    for(let k=1;k<=5;k++) gfx.lineTo(px(c)+dir*(k%2?2.4:-.6),py(r)+2+k*3.4); gfx.stroke(); };
  if(fk==='celeb') { lens(12.4,16.8,9.4,12.2); lens(19.3,23.6,9.4,12.2); R(px(16.8),py(10.2),px(19.3)-px(16.8),2,'#14161c'); return; }
  if(fk==='flip') { lens(12.4,20.4,10.6,13.4); Ln(px(12.4),py(11.4),px(7.8),py(11.4),2,'#14161c'); bud(7.5,11.8,1); return; }
  if(fk==='kneel') return;
  lens(8.6,16.6,10.6,13.4); Ln(px(16.6),py(11.4),px(21.2),py(11.4),2,'#14161c'); bud(21.5,11.8,-1); };
const carpet=(x0,x1,y,k)=>{ if(k<=0) return; const xa=lerp(x1,x0,ez(k)); R(xa,y-9,x1-xa,18,'#a8203a'); R(xa,y-9,x1-xa,3,'#ffd166'); R(xa,y+6,x1-xa,3,'#ffd166');
  if(k<1) { EO(xa,y,7,11,'#a8203a'); E(xa,y,3,6,'#7a1428'); } };
B2_TOMBO_ANIM.rose2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list);
  const tsp=BATTLE_SPRITES.tom,rsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,RH=rsp.idle.length*rsp.scale,RW=rsp.idle[0].length*rsp.scale;
  const sb=cl(GR.base+8,240,300),tx=cl(GR.x1+120,GR.x1+96,440),rx=Math.min(548,tx+62),gx=tx-46;
  const K=640,n=o3.length;
  const P={walk:650,tiara:700,rug0:750,rug1:1350,rline:1450,lean:2150,tline:2350,guard:2550,back:3000,kn:3400};
  P.done=P.kn+n*K; P.turn=P.done+150; P.apply=P.done+450; P.hop=P.done+650; P.seat=P.hop+500; P.home=P.seat+150; P.end=P.home+700;
  // each monster: Rose stops at its right edge, taps it twice with Lamby, it bows and backs off
  o3.forEach((o,i)=>{ o.t=P.kn+i*K; o.stop={x:Math.min(rx,o.q.x+o.q.w/2+RW*.42),b:cl(o.q.base+4,sb-40,sb+10)}; });
  const sT={x:tx,b:sb,f:tsp.idle,fk:'idle'},sR={x:rx,b:sb,f:rsp.idle,fk:'idle',swing:0};
  const seatPt=()=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx]; return d?{x:d.cx+2,y:d.base-d.h+20}:{x:sT.x+2,y:sT.b-TH+20}; };
  const roseAt=ms=>{ // where Rose walks during the knighting
    let x=rx,b=sb; for(const o of o3) { if(ms<o.t) break; const q=ez(seg(ms,o.t,o.t+260)); const p0={x,b}; x=lerp(p0.x,o.stop.x,q); b=lerp(p0.b,o.stop.b,q); }
    if(ms>P.done) { const q=ez(seg(ms,P.done,P.done+300)); x=lerp(x,gx-34,q); b=lerp(b,sb,q); } return {x,b}; };
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,fk='idle';
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms<P.guard) { fk=ms>P.tline-150&&ms<P.tline+500?'act':'idle'; }
      else if(ms<P.kn) { const q=ez(seg(ms,P.guard,P.guard+350)); x=lerp(tx,gx,q); fk=ms<P.back+250?'act':'idle'; }
      else if(ms<P.done+300) { const r=roseAt(ms); x=Math.max(gx-20,Math.min(gx,r.x+58)); fk=(Math.floor(ms/700)%2)?'idle':'act'; }
      else x=gx; if(ms>P.done+300&&ms<P.hop) fk='kneel'; if(ms>P.seat) fk='celeb'; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(gx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); fk=k<1?'flip':'idle'; }
    const f=sp[fk]; sT.x=x; sT.b=y; sT.f=f; sT.fk=fk; return {cx:x,base:y,frame:f}; });
  const st0=startOf(pt);
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=rx,y=sb,fk='idle',ns=false;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(st0.x,rx,k); y=lerp(st0.b,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.kn) { if(ms>P.rline-80&&ms<P.rline+600) { fk='celeb'; y-=Math.abs(Math.sin(seg(ms,P.rline,P.rline+600)*Math.PI*2))*10; } }
    else if(ms<P.hop) { const r=roseAt(ms); x=r.x; y=r.b; let moving=false; for(const o of o3) if(ms>o.t&&ms<o.t+260) moving=true; if(ms>P.done&&ms<P.done+300) moving=true;
      y+=moving?-Math.abs(Math.sin(ms/75))*5:0; fk=ms>P.turn?'flip':(moving?'idle':'act'); }
    else { const s=seatPt(),k=seg(ms,P.hop,P.seat);
      if(k<1) { x=lerp(gx-34,s.x,ez(k)); y=lerp(sb,s.y,ez(k))-Math.sin(k*Math.PI)*60; fk='celeb'; ns=true; }
      else { x=s.x; y=s.y; fk='idle'; ns=true; } }
    const f=sp[fk]; sR.x=x; sR.b=y; sR.f=f; sR.fk=fk; return {cx:x,base:y,frame:f,noShadow:ns}; });
  // Lamby's swing: 0 held up, 1 tapping down onto the monster
  const swing=ms=>{ for(const o of o3) { const a=o.t+300; if(ms>a&&ms<a+300) { const q=seg(ms,a,a+300); return Math.abs(Math.sin(q*Math.PI*2)); } } return 0; };
  const bowK=(o,ms)=>{ const a=o.t+560; return ez(seg(ms,a,a+260))*(1-ez(seg(ms,P.home,P.end-80))); };
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=seg(ms,P.rug0,P.rug1)*(1-ez(seg(ms,P.home,P.home+500)));
    gfx.globalAlpha=Math.min(1,k*3)*(ms>P.home?1-seg(ms,P.home,P.home+500):1); carpet(Math.max(8,GR.x0-30),Math.min(576,rx+40),sb+2,Math.min(1,seg(ms,P.rug0,P.rug1)));
    gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    const d=battle.drawnAt&&battle.drawnAt[tom.idx];
    // Tom's sunglasses and earpiece
    if(ms>200&&d) { gfx.globalAlpha=ez(seg(ms,200,450)); shades(tsp,sT.fk,d.cx,d.base); gfx.globalAlpha=1; }
    // the earpiece crackle while he talks into it
    if(ms>P.tline-150&&ms<P.tline+500&&d) { const q=seg(ms,P.tline-150,P.tline+500); for(let j=0;j<3;j++) { gfx.globalAlpha=(1-q)*.8; ring(d.cx+24,d.base-TH*.68,5+j*5+q*6,4+j*4+q*5,1.5,'#9fd8ff'); } gfx.globalAlpha=1; }
    // Rose's tiara (drops onto her head) and Lamby the scepter
    const rd=battle.drawnAt&&battle.drawnAt[pt.idx],rX=rd?rd.cx:sR.x,rB=rd?rd.base:sR.b,flip=sR.fk==='flip';
    if(ms>P.tiara-300) { const fr=sR.f,fh=fr.length,fw=fr[0].length,dsc=rd&&rd.h?rd.h/fh:rsp.scale;   // head top from the pixels of the frame being drawn: arms-up frames are taller than idle, and a fixed offset put the tiara over her eyes
      let r0=0; scan:for(;r0<fh;r0++) for(let c=Math.floor(fw*.36);c<=Math.ceil(fw*.64);c++) if(fr[r0][c]!=='.'&&fr[r0][c]!==' ') break scan;
      const q=ez(seg(ms,P.tiara-300,P.tiara)),top=rB-fh*dsc+r0*dsc,hx=rX+(flip?2:-2),hy=top+9-(1-q)*40;
      gfx.globalAlpha=q; gfx.save(); gfx.translate(hx,hy); gfx.scale(.42,.42); PROP2.tiara({},0); gfx.restore(); gfx.globalAlpha=1;
      if(ms>P.tiara&&ms<P.tiara+500) { const g=seg(ms,P.tiara,P.tiara+500); for(let j=0;j<4;j++) { const a=j*1.57+g*2; star(hx+Math.cos(a)*16*g,hy-4+Math.sin(a)*10*g,3.5*(1-g)+1,GOLD); } } }
    if(ms>P.walk&&ms<P.hop) { const sw=swing(ms),dir=flip?1:-1,hx=rX+dir*RW*.34,hy=rB-RH*.55,ang=lerp(-.5,1.25,sw)*dir,L=22+sw*10;
      const lx=hx+Math.sin(ang)*L*.2+dir*sw*16,ly=hy-L*Math.cos(ang*.6)+sw*14;
      Ln(hx,hy,lx,ly+6,3,OUT); Ln(hx,hy,lx,ly+6,1.6,'#ffd166');
      gfx.save(); gfx.translate(lx,ly); gfx.rotate(dir*sw*.6+(flip?0:0)); gfx.scale(.42,.42); PROP2.lamby({flip:flip},0); gfx.restore(); }
    // the monsters: lean in curious, lean back when Tom steps in, then bow and back out of her way
    for(const o of o3) { const f=o.f,q=o.q; let ox=0,oy=0,sp=0;
      if(ms>P.lean&&ms<P.back) { const k=ez(seg(ms,P.lean,P.lean+400)); ox=k*12; }
      else if(ms>=P.back&&ms<o.t+560) { const k=ez(seg(ms,P.back,P.back+300)); ox=lerp(12,-8,k); }
      const b=bowK(o,ms); if(ms>=o.t+560) { ox=-8-b*22; sp=b*.45; oy=b*6; }
      if(ms>P.lean&&ms<P.end-80) { f.ox=ox; f.oy=oy; f.spin=sp; f.spinAt=performance.now(); }
      if(ms>o.t+560&&ms<o.t+560+900) { const g=seg(ms,o.t+560,o.t+1460); for(let j=0;j<5;j++) { const a=j/5*Math.PI*2+g*3; star(q.x+ox+Math.cos(a)*q.w*.45*g+4,q.top+q.h*.3+Math.sin(a)*q.h*.35*g,3.5*(1-g)+1,j%2?GOLD:'#fffbe6'); } } }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Princess Rose is out for a royal walk.'); B2.aim=null; S('click'); }],
    [P.tiara,()=>{ S('ding'); S('chime2'); }],
    [P.rug0,()=>{ S('whoosh'); setMessage('A red carpet rolls out. Her royal bodyguard is in sunglasses.'); }],
    [P.rline,()=>{ say('rose','dc2'); }],
    [P.lean,()=>{ o3.forEach(o=>word('?',o.q.x+10,o.q.top-16,CREAM,4,.8)); S('squeak'); setMessage('The monsters lean in for a closer look.'); }],
    [P.tline,()=>{ say('tom','dcrose2'); S('click'); }],
    [P.guard,()=>{ S('step'); word('DEFEND',gx,40,'#9fd8ff',4,.9); setMessage('Tom steps in front of the princess. The monsters back up.'); }],
    [P.kn-150,'She knights every monster with Lamby.'],
    [P.done+200,()=>{ setMessage('Every monster bows out of her way.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sR.x,y:sR.b-RH*.45}]) scene('glow',.9,{x:q.x,y:q.y,rx:36,ry:50,c:'#d8f0ff',a:.35});
      for(const p of b2LiveParty()) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.hop,()=>{ S('boing'); }],
    [P.end,'end',()=>{ for(const o of o3) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' The princess rides home.'; }]];
  o3.forEach((o,i)=>{ steps.push([o.t+300,()=>{ S('boop'); }],[o.t+450,()=>{ S('boop'); }],
    [o.t+560,()=>{ S('chime2'); ST.jolt(o.f,.3); scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:46,c:GOLD,w:3}); if(i===0) word('KNIGHTED!',o.q.x,40,GOLD,4,.9); else word('BOW!',o.q.x,i%2?66:40,PINK,4,.6);
      for(let k=0;k<4;k++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(k-1.5)*20,y1:o.q.top-26,arc:12,spin:false,r:6,t:-k*.05,dur:.7});
      if(i===n-1) landHit(100); }]); });   // a kind Tombo's first landHit lands everything: only the last knighting calls it
  steps.push(['hf',o3.length?o3[0].t+560:P.kn]);
  ST.play(E2,steps);
};

// ---------- Spot Me, Tom (Tom + Amy, Director's Cut of tier 2) ----------
// Gym floor. Amy rolls Tom her big kettlebell and yells the reps. Swing one is fine, swing two is wobbly, swing three goes
// all the way up... and Tom lets go. Gravity takes it in a long arc onto the front monster. CLANG. Amy stares; then it is a
// water break. Effects (no damage): Tom and Amy refill their VP, and the party Guards (half damage) for 1 turn.
const kbell=(x,y,s=1,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  ring(0,-17,9.5,9,8,OUT); ring(0,-17,9.5,9,4.5,'#4a505c'); EO(0,0,16,15,'#3a3f4a'); E(-6,-6,5,4,'#6a7280'); E(5,8,8,3,'#2a2e36');
  label('50',1,-2,CREAM,1); gfx.restore(); };
B2_TOMBO_ANIM.amy2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),o3=order3(list),tgt=o3.length?o3[0].f:list[0],F=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const sb=cl(GR.base+6,236,300),tx=cl(GR.x1+150,GR.x1+124,448),ax=Math.min(548,tx+92);
  const P={walk:650,roll:700,rolled:1150,grab:1250,aline:1350,r1:2000,r2:2650,r3:3350,top:3850,tline:3900,let:4400,peak:4750,land:5150,stare:5350,apply:5800,home:6300,end:7000};
  const sT={x:tx,b:sb,fk:'idle'},sA={x:ax,b:sb};
  const piv=()=>({x:sT.x-6,y:sT.b-TH*.5});
  // the swing angle: 0 hangs down between his knees, PI/2 straight out in front, PI straight up
  const ang=ms=>{ const rep=(a,b,top)=>{ const q=seg(ms,a,b); return Math.sin(q*Math.PI)*top; };
    if(ms<P.grab) return 0; if(ms<P.r1) return .15*Math.sin((ms-P.grab)/200);
    if(ms<P.r2) return rep(P.r1,P.r2,1.5); if(ms<P.r3) return rep(P.r2,P.r3,1.25)+Math.sin(ms/45)*.06;
    if(ms<P.top) return ez(seg(ms,P.r3,P.top))*2.95; return 2.95+Math.sin(ms/40)*.12*seg(ms,P.top,P.let); };
  const low=ms=>ms>=P.grab&&ms<P.let&&ang(ms)<.55;
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,fk='idle',rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms>=P.grab&&ms<P.let) { fk=low(ms)?'kneel':(ms>P.top?'celeb':'act'); if(ms>P.top) rot=Math.sin(ms/50)*.06; }
      else if(ms>=P.let&&ms<P.land+200) fk='celeb';
      else if(ms>=P.land+200&&ms<P.apply) fk='kneel';
      else if(ms>=P.apply) fk='idle'; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); fk=k<1?'flip':'idle'; }
    sT.x=x; sT.b=y; sT.fk=fk; return {cx:x,base:y,frame:sp[fk],rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=ax,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,ax,k); y=lerp(c.origBase,sb,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) {
      if(ms<P.rolled) f=sp.throw;
      else if(ms<P.aline+900) f=(Math.floor(ms/260)%2)?sp.act:sp.clap;
      else if(ms<P.tline) { const r=[P.r1,P.r2,P.r3].some(t=>ms>t+250&&ms<t+600); f=r?sp.act:sp.clap; }
      else if(ms<P.stare) f=sp.hip;
      else if(ms<P.apply) f=sp.expr;
      else f=sp.celeb2; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(ax,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sA.x=x; sA.b=y; return {cx:x,base:y,frame:f}; });
  // the kettlebell's spot: rolled from Amy, swung on Tom's arm, then flying, then on the monster's head
  const head={x:F.x,y:F.top+4};
  const bell=ms=>{ if(ms<P.roll) return null;
    if(ms<P.rolled) { const q=ez(seg(ms,P.roll,P.rolled)); return {x:lerp(ax-30,tx-14,q),y:sb-14,rot:-q*6}; }
    if(ms<P.grab) return {x:tx-14,y:sb-14,rot:0};
    const p=piv();
    if(ms<P.let) { const a=ang(ms),L=TH*.34; return {x:p.x-Math.sin(a)*L,y:p.y+Math.cos(a)*L,rot:-a,arm:p}; }
    const p0={x:p.x-Math.sin(2.95)*TH*.34,y:p.y+Math.cos(2.95)*TH*.34};
    if(ms<P.land) { const q=seg(ms,P.let,P.land),top=Math.min(40,p0.y-60); const x=lerp(p0.x,head.x,q),y=q<.4?lerp(p0.y,top,ez(q/.4)):lerp(top,head.y-14,Math.pow((q-.4)/.6,2));
      return {x,y,rot:q*Math.PI*3}; }
    return {x:head.x,y:head.y-14,rot:.25}; };
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=ez(seg(ms,0,350))*(1-ez(seg(ms,P.home,P.home+500))); if(k<=0) return;
    const x0=tx-70,x1=Math.min(576,ax+50); gfx.globalAlpha=k*.9; R(x0,sb-16,x1-x0,26,'#3a3e46'); R(x0,sb-16,x1-x0,3,'#ffd166'); R(x0,sb+7,x1-x0,3,'#ffd166');
    for(let x=x0+30;x<x1;x+=44) R(x,sb-13,2,20,'#4a4f58'); gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const B=bell(ms); if(!B) return;
    kbell(B.x,B.y,1.3,ms<P.let?0:B.rot);
    // sweat while he swings
    if(ms>P.r2&&ms<P.land) { const d=battle.drawnAt&&battle.drawnAt[tom.idx]; if(d) for(let j=0;j<2;j++) { const q=((ms/420)+j*.5)%1; gfx.globalAlpha=1-q; E(d.cx+16+j*8,d.base-TH*.8+q*24,2.4,3.4,'#9fd8ff'); } gfx.globalAlpha=1; }
    // the monster squashed under it, stars going round
    if(ms>P.land) { const q=seg(ms,P.land,P.land+140),sc2=ms<P.land+140?1-.28*q:(ms<P.home?.72+.04*Math.sin(ms/90):lerp(.72,1,ez(seg(ms,P.home,P.end-80))));
      tgt.fsc=sc2; tgt.oy=F.h/2*(1-sc2); tgt.spin=0; tgt.spinAt=performance.now();
      for(let j=0;j<3;j++) { const a=ms/260+j*2.1; star(head.x+Math.cos(a)*F.w*.4,F.top+F.h*(1-sc2)-24+Math.sin(a)*6,4,j%2?GOLD:'#fffbe6'); } }
  }});
  const repWord=(txt,c)=>word(txt,ax-6,Math.max(80,sb-AH-30),c,4,.6);
  ST.play(E2,[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Coach Amy has a workout. Tom is doing it.'); B2.aim=null; S('click'); }],
    [P.roll,()=>{ S('rumble'); }],
    [P.rolled,()=>{ S('thud'); setMessage('Amy rolls him her big kettlebell. Fifty pounds.'); }],
    [P.aline,()=>{ say('amy','dc2'); }],
    [P.r1+300,()=>{ S('whoosh'); repWord('ONE!',GOLD); }],
    [P.r2+300,()=>{ S('whoosh'); repWord('TWO!',GOLD); setMessage('Rep two. Less good.'); }],
    [P.r3+300,()=>{ S('whoosh'); repWord('THREE!',PINK); setMessage('Rep three goes all the way up. And it stays up.'); }],
    [P.tline,()=>{ say('tom','dcamy2'); }],
    [P.let,()=>{ S('slideWhistle'); word('NOPE.',tx,40,CREAM,4,.8); }],
    [P.land,()=>{ S('clang'); S('thud'); ST.jolt(tgt,.5); battle.shakeEnemy=.6; word('CLANG!',F.x,66,'#dfe6f2',5,.9); scene('tb_rings',.6,{x:F.x,y:F.top+10,r:60,c:'#dfe6f2',w:3});   // no landHit: no damage, no kindness; effects wait for the water break
      setMessage('Gravity drops it right on the monster. It\'s too busy holding a kettlebell to attack.'); }],
    ['hf',P.land],
    [P.stare,()=>{ S('creak'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('Fine. Water break. Everybody hydrate.'); for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sA.x,y:sA.b-AH*.45}]) scene('glow',.9,{x:q.x,y:q.y,rx:38,ry:52,c:'#86a9ff',a:.35});
      for(const p of b2LiveParty()) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.end,'end',()=>{ tgt.fsc=0; tgt.oy=0; tgt.ox=0; tgt.spin=0; return (E2.result||'')+' Amy is logging it as two reps.'; }]]);
};
// ---------- Library Vault Lantern (Tom + Deedee, Director's Cut of tier 2) ----------
// The library vault, dark and dusty. Tom holds up an old brass lantern; Deedee pulls out her hankie and polishes it, faster
// and faster, until it shines, blazes, and turns into a whole lighthouse. Tom just holds it. The beam turns once across the
// monsters (they warm up in the light) and once across the family (Tucked In; two Warm Crusts come out warm). Then it shrinks
// back to a lantern and the vault lights up. Effects (no damage): every enemy warms up, the party is Tucked In for 3 turns,
// 2 Warm Crusts.
const BRASS='#e0b040',BRASS2='#a8782a',TARN='#7a7458',TARN2='#4a4636';
// An old brass lantern hanging from its handle at (x,y); s scale; shine 0..1 (tarnish to gleam); lit 0..1 (the flame).
const lantern=(x,y,s,shine,lit)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s);
  if(lit>0) { gfx.globalAlpha=Math.min(1,lit)*.45; E(0,26,20+lit*14,20+lit*14,GOLD); gfx.globalAlpha=1; }
  const metal=(c,c2)=>{ ring(0,4,6,5,2.2,c); R(-10,8,20,4,c); R(-11,34,22,7,c); R(-9,12,2,22,c2); R(7,12,2,22,c2); R(-1,12,2,22,c2); };
  ring(0,4,6,5,4.5,OUT); RO(-10,8,20,4,TARN); RO(-11,34,22,7,TARN);
  RO(-8,12,16,22,lit>0?'#fff2c0':'#4a5656');
  if(lit>0) { E(0,25,3+lit*2,5+lit*3,'#ffa83a'); E(0,26,1.6,3+lit,'#fffbe6'); } else E(0,26,1.6,2.4,'#c86a2a');
  metal(TARN,TARN2); if(shine>0) { gfx.globalAlpha=Math.min(1,shine); metal(BRASS,BRASS2); gfx.globalAlpha=1; }
  if(shine>.3) { gfx.globalAlpha=shine; R(-8,35,4,2,'#fff6c0'); R(-7,9,3,2,'#fff6c0'); gfx.globalAlpha=1; }
  gfx.restore(); };
// A red and white lighthouse standing on b, lamp room at the top yT (lamp centre yT-17). lit 0..1.
const lighthouse=(x,b,yT,lit)=>{ const wb=42,wt=26,H=b-yT; if(H<8) return;
  gfx.beginPath(); gfx.moveTo(x-wb/2-2,b); gfx.lineTo(x-wt/2-2,yT-2); gfx.lineTo(x+wt/2+2,yT-2); gfx.lineTo(x+wb/2+2,b); gfx.closePath(); gfx.fillStyle=OUT; gfx.fill();
  const n=Math.max(2,Math.round(H/28)),wAt=y=>lerp(wb,wt,(b-y)/H);
  for(let i=0;i<n;i++) { const y0=b-H*i/n,y1=b-H*(i+1)/n,w0=wAt(y0),w1=wAt(y1);
    gfx.beginPath(); gfx.moveTo(x-w0/2,y0); gfx.lineTo(x-w1/2,y1); gfx.lineTo(x+w1/2,y1); gfx.lineTo(x+w0/2,y0); gfx.closePath(); gfx.fillStyle=i%2?'#f4f0e6':'#c8323a'; gfx.fill(); }
  gfx.globalAlpha=.25; gfx.beginPath(); gfx.moveTo(x+4,b); gfx.lineTo(x+3,yT); gfx.lineTo(x+wt/2,yT); gfx.lineTo(x+wb/2,b); gfx.closePath(); gfx.fillStyle='#000'; gfx.fill(); gfx.globalAlpha=1;
  if(H>40) RO(x-5,b-16,10,16,'#3a2a22');
  RO(x-wt/2-8,yT-5,wt+16,5,'#2a2c34');
  if(lit>0) { gfx.globalAlpha=Math.min(1,lit)*.5; E(x,yT-17,30+lit*16,26+lit*14,GOLD); gfx.globalAlpha=1; }
  RO(x-wt/2+2,yT-30,wt-4,25,lit>0?'#fff2c0':'#4a5656'); for(const dx of [-5,5]) R(x+dx-1,yT-30,2,25,'#2a2c34');
  if(lit>0) { E(x,yT-17,8,8,'#fffbe6'); }
  gfx.beginPath(); gfx.moveTo(x-wt/2-3,yT-29); gfx.lineTo(x,yT-48); gfx.lineTo(x+wt/2+3,yT-29); gfx.closePath(); gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#c8323a'; gfx.fill();
  EO(x,yT-50,3,3,'#2a2c34'); };
B2_TOMBO_ANIM.deedee2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale,actR=mirrorRowsCached(tsp,'act');
  const sb=cl(GR.base+6,236,300),tx=cl(GR.x1+120,GR.x1+96,430);
  const th=handPt(tsp,actR,tx,sb,1),dh=handPt(dsp,dsp.act,0,sb,-1),hy=Math.round((th.y+dh.y)/2);
  const lx=th.x+6,dx=Math.min(548,lx+18-dh.x),yT=84;
  const P={walk:650,lift:700,hank:950,pol0:1050,dline:1250,flare:2900,grow1:3350,tline:3500,beam0:4100,beam1:4900,beam2:4950,beam3:5750,apply:5250,shrink:5800,lift2:5950,home:6300,end:7000};
  // polish: 0..1, how far along the polishing is; the rub gets faster as it goes
  const polK=ms=>ez(seg(ms,P.pol0,P.flare));
  const rubPh=ms=>{ if(ms<P.pol0||ms>P.flare) return 0; const t=ms-P.pol0; return t/lerp(230,70,polK(ms))*Math.PI; };
  const growK=ms=>ez(seg(ms,P.flare,P.grow1))*(1-ez(seg(ms,P.shrink,P.shrink+400)));
  const sT={x:tx,b:sb},sD={x:dx,b:sb};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); f=sp.flip; }
    else if(ms<P.home) { f=ms>P.lift&&ms<P.shrink+400?actR:sp.flip;
      if(ms>P.flare&&ms<P.grow1+300) rot=Math.sin(ms/45)*.05*(1-seg(ms,P.grow1,P.grow1+300));
      if(ms>P.tline&&ms<P.tline+500) y-=Math.abs(Math.sin((ms-P.tline)/120))*3; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,dx,k); y=lerp(c.origBase,sb,k); f=k<1?runFr(sp,c.t,-1):sp.idle; }
    else if(ms<P.home) {
      if(ms<P.hank) f=sp.idle; else if(ms<P.pol0) f=sp.hip||sp.idle;
      else if(ms<P.flare) f=Math.sin(rubPh(ms))>0?sp.act:(sp.aim||sp.act);
      else if(ms<P.tline) f=sp.celeb||sp.idle;
      else if(ms<P.apply) f=sp.hip||sp.idle;
      else f=sp.celeb2||sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(dx,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sD.x=x; sD.b=y; return {cx:x,base:y,frame:f}; });
  const darkK=ms=>ez(seg(ms,0,500))*(1-ez(seg(ms,P.lift2,P.lift2+450)));
  const lampAt=ms=>{ const g=growK(ms); return {x:lx,y:lerp(hy+26,yT-17,g)}; };
  // the beam: dir -1 sweeps the monsters, +1 the family; q 0..1..0 its reach
  const beamOf=ms=>{ if(ms>P.beam0&&ms<P.beam1) return {dir:-1,q:Math.sin(seg(ms,P.beam0,P.beam1)*Math.PI)};
    if(ms>P.beam2&&ms<P.beam3) return {dir:1,q:Math.sin(seg(ms,P.beam2,P.beam3)*Math.PI)}; return null; };
  const beamPoly=(ms,L)=>{ const B=beamOf(ms); if(!B||B.q<=0) return null; const far=B.dir<0?L.x-B.q*(L.x+60):L.x+B.q*(640-L.x);
    const top=B.dir<0?Math.min(GR.top-30,L.y):Math.min(sb-TH-30,L.y),bot=B.dir<0?GR.base+30:330; return {pts:[[L.x,L.y-5],[far,top],[far,bot],[L.x,L.y+5]],far,q:B.q}; };
  // the vault: stone wall with arches full of books, flagstone floor (back layer, fades with the dark)
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=darkK(ms); if(k<=0) return; gfx.globalAlpha=k;
    R(0,0,576,324,'#2e2a36'); const fy=Math.min(GR.top+30,200);
    for(let i=0;i<5;i++) { const ax=20+i*120,aw=96,top=36;
      R(ax-6,top-6,aw+12,fy-top+6,'#3c3846'); R(ax,top+24,aw,fy-top-24,'#1e1a24'); E(ax+aw/2,top+26,aw/2,28,'#1e1a24');
      for(let r=0;r<4;r++) { const yy=top+34+r*((fy-top-40)/4); R(ax+4,yy+((fy-top-40)/4)-4,aw-8,4,'#5a4636');
        for(let b=0;b<11;b++) { const bw=6+((i*7+r*3+b*5)%4),bh=12+((i+r+b)%3)*3; R(ax+6+b*8,yy+((fy-top-40)/4)-4-bh,bw,bh,['#7a3a3a','#3a5a7a','#5a6a3a','#8a6a3a','#5a3a6a'][(i+r*2+b)%5]); } } }
    R(0,fy,576,324-fy,'#2a2630'); for(let yy=fy+18;yy<324;yy+=22) R(0,yy,576,2,'#221e28');
    for(let yy=fy,j=0;yy<324;yy+=22,j++) for(let xx=(j%2)*30;xx<576;xx+=60) R(xx,yy,2,22,'#221e28');
    // the lighthouse stands behind Tom's hand
    const g=growK(ms); gfx.globalAlpha=1;
    if(g>0) { const L=lampAt(ms); lighthouse(lx,sb+2,L.y+17,ms>P.flare?1:0); }
    gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=darkK(ms),pk=polK(ms),g=growK(ms),L=lampAt(ms),bp=beamPoly(ms,L);
    // the dark, with soft holes: the lantern's light, the tower, and the beam
    if(k>0) { if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const c2=darkC.getContext('2d'); c2.globalCompositeOperation='source-over'; c2.clearRect(0,0,576,324); c2.fillStyle='#06050c'; c2.fillRect(0,0,576,324);
      c2.globalCompositeOperation='destination-out';
      const hole=(x,y,r,a=1)=>{ const gr=c2.createRadialGradient(x,y,r*.3,x,y,r); gr.addColorStop(0,'rgba(0,0,0,'+a+')'); gr.addColorStop(1,'rgba(0,0,0,0)'); c2.fillStyle=gr; c2.beginPath(); c2.arc(x,y,r,0,Math.PI*2); c2.fill(); };
      if(ms>P.lift-200) hole(L.x,L.y,lerp(40,110,pk)+g*40+Math.sin(ms/90)*3*pk);
      if(g>0) { hole(L.x,(L.y+sb)/2,60+g*30,.8); hole(L.x,L.y,90*g+30); }
      if(bp) { c2.fillStyle='rgba(0,0,0,'+(.85*bp.q)+')'; c2.beginPath(); c2.moveTo(bp.pts[0][0],bp.pts[0][1]); for(const q of bp.pts.slice(1)) c2.lineTo(q[0],q[1]); c2.closePath(); c2.fill(); }
      c2.globalCompositeOperation='source-over'; gfx.globalAlpha=.88*k; gfx.drawImage(darkC,0,0); gfx.globalAlpha=1; }
    // the beam itself, over the dark
    if(bp) { const gr=gfx.createLinearGradient(L.x,L.y,bp.far,L.y); gr.addColorStop(0,'rgba(255,240,180,.75)'); gr.addColorStop(1,'rgba(255,224,138,0)');
      gfx.globalAlpha=bp.q; gfx.fillStyle=gr; gfx.beginPath(); gfx.moveTo(bp.pts[0][0],bp.pts[0][1]); for(const q of bp.pts.slice(1)) gfx.lineTo(q[0],q[1]); gfx.closePath(); gfx.fill(); gfx.globalAlpha=1; }
    // the lamp room glows over the dark once it is a lighthouse; before that, the lantern in Tom's hand
    if(g>0&&ms>P.flare) { gfx.save(); gfx.beginPath(); gfx.rect(0,0,576,L.y+6); gfx.clip(); gfx.globalAlpha=Math.min(1,g*1.5); lighthouse(lx,sb+2,L.y+17,1); gfx.restore(); gfx.globalAlpha=1; }   // only the lamp room over the dark
    const ls=1+pk*.45; if(ms>P.lift-150&&ms<P.home+250&&g<.6) { gfx.globalAlpha=(1-g/.6)*(1-seg(ms,P.home,P.home+250)); const lift=ez(seg(ms,P.lift-150,P.lift+150));
      lantern(L.x+(sT.x-tx),L.y+(sT.b-sb)-26*ls-(1-lift)*6,ls,pk*1.4,ms<P.pol0?.15:Math.max(.2,pk)); gfx.globalAlpha=1; }
    // the hankie going round and round, and the sparkles it leaves
    if(ms>P.hank&&ms<P.flare) { const a=rubPh(ms),hx=L.x+Math.cos(a)*9*ls,hy2=L.y-10*ls+Math.sin(a)*6*ls;
      gfx.save(); gfx.translate(hx,hy2); gfx.rotate(Math.sin(a)*.5); RO(-5,-4,10,8,'#fff6f4'); R(-5,-1,10,2,PINK); gfx.restore();
      for(let j=0;j<Math.round(2+pk*5);j++) { const q=((ms/300)+j*.37)%1,an=j*2.4+ms/500; gfx.globalAlpha=(1-q)*pk; star(L.x+Math.cos(an)*(14+q*30)*ls,L.y-14*ls+Math.sin(an)*(10+q*24)*ls,2+q*3,j%2?GOLD:'#fffbe6'); }
      gfx.globalAlpha=1; }
    // the flare as it turns into a lighthouse
    if(ms>P.flare-80&&ms<P.flare+400) { const q=seg(ms,P.flare-80,P.flare+400); gfx.globalAlpha=(1-q)*.8; R(0,0,576,324,'#fffbe6'); gfx.globalAlpha=1; }
    // two Warm Crusts, warm from the light, at Deedee's feet
    if(ms>P.apply&&ms<P.home+300) { const q=ez(seg(ms,P.apply,P.apply+300)),a=1-seg(ms,P.home,P.home+300);
      for(const [ox,j] of [[-28,0],[26,1]]) { const cx=sD.x+ox,cy=sb+4-q*8-Math.sin(ms/200+j)*2; gfx.globalAlpha=a*.4; E(cx,cy,18,10,GOLD); gfx.globalAlpha=a; crustTin(cx,cy,1.1);
        for(let w=0;w<2;w++) { const sq=((ms/700)+w*.5+j*.25)%1; gfx.globalAlpha=a*(1-sq)*.7; E(cx-4+w*8+Math.sin(sq*6)*3,cy-10-sq*18,2.5,3.5,'#fffbe6'); } }
      gfx.globalAlpha=1; }
  }});
  const passAt=(x,dir)=>{ const Lx=lx; if(dir<0) { const q=cl((Lx-x)/(Lx+60),0,1); return P.beam0+Math.asin(q)/Math.PI*(P.beam1-P.beam0); }
    const q=cl((x-Lx)/(640-Lx),0,1); return P.beam2+Math.asin(q)/Math.PI*(P.beam3-P.beam2); };
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! The library vault. Dark, dusty, and one old brass lantern.'); B2.aim=null; S('creak'); }],
    [P.lift,()=>{ S('click'); setMessage('Tom holds it up. It barely glows.'); }],
    [P.hank,()=>{ S('whoosh'); setMessage('Deedee pulls out her hankie.'); }],
    [P.dline,()=>{ say('deedee','dc2'); }],
    [1700,()=>{ S('squeak'); word('SQUEAK!',lx,Math.max(70,hy-70),CREAM,3,.6); }],
    [2200,()=>{ S('squeak'); setMessage('Faster. FASTER.'); }],
    [2500,()=>{ S('squeak'); S('chime2'); word('SHINE!',lx,Math.max(70,hy-80),GOLD,4,.6); }],
    [P.flare,()=>{ S('chime2'); S('rumble'); battle.shakeEnemy=.4; setMessage('It shines so bright it turns into a lighthouse.'); }],
    [P.grow1,()=>{ S('ding'); word('LIGHTHOUSE!',Math.min(GR.x,lx-140),40,GOLD,4,1); }],
    [P.tline,()=>{ say('tom','dcdeedee2'); }],
    [P.beam0,()=>{ S('whoosh'); setMessage('The beam turns. Every monster warms up in the light.'); }],
    [P.beam2,()=>{ S('whoosh'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('The light lands on the family. Everybody feels tucked in. Two crusts come out warm.');
      for(const q of [{x:sT.x,y:sT.b-TH*.45},{x:sD.x,y:sD.b-DH*.45}]) scene('glow',.9,{x:q.x,y:q.y,rx:38,ry:52,c:'#ffd6a0',a:.35});
      for(const p of party) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.shrink,()=>{ S('slideWhistle'); }],
    [P.lift2,()=>{ setMessage('Back to a lantern. A very, very shiny lantern.'); }],
    [P.end,'end',()=>(E2.result||'')+' Deedee says now it\'s clean.']];
  o3.slice().sort((a,b)=>b.q.x-a.q.x).forEach((o,i,arr)=>{ const t=passAt(o.q.x,-1);
    steps.push([t,()=>{ S('chime2'); ST.jolt(o.f,.2); scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:40,c:GOLD,w:3});
      for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(j-1)*18,y1:o.q.top-24,arc:10,spin:false,r:6,t:-j*.05,dur:.7});
      if(i===arr.length-1) landHit(100); }]); });   // kind Tombo: the first landHit lands everything, so only the last one calls it
  steps.push(['hf',o3.length?passAt(Math.min(...o3.map(o=>o.q.x)),-1):P.beam0+300]);
  ST.play(E2,steps);
};

// ---------- Bird's Nest (Tom + Boppy, Director's Cut of tier 2) ----------
// Cattail Pier. Tom casts Boppy's rod and the reel explodes into a giant bird's nest of tangled line. Boppy grumbles and
// tries to fix it; every tug makes it worse and bigger, and he has to back off further each time. Tom says he improved it.
// The giant tangle rolls off the rod and wraps the monster up like a net. Effects: a big Splash hit on one enemy (shield
// break, automatic for every Tombo) that steals a buff.
// A tangle of fishing line: loops around (x,y), radii rx,ry; seeded so it keeps its shape while it grows.
const nest=(x,y,rx,ry,t,seed=1,a=1)=>{ const n=Math.round(7+Math.min(rx,ry)/3.2); gfx.globalAlpha=a;
  const rnd=i=>{ const v=Math.sin(i*12.9898+seed*78.233)*43758.5453; return v-Math.floor(v); };
  for(const [w,c] of [[3.4,'#2a3a4a'],[1.6,'#eef4f6']]) { gfx.strokeStyle=c; gfx.lineWidth=w;
    for(let i=0;i<n;i++) { const ox=(rnd(i)-.5)*rx*.5,oy=(rnd(i+50)-.5)*ry*.5,r1=rx*(.45+rnd(i+100)*.55),r2=ry*(.3+rnd(i+150)*.6),rot=rnd(i+200)*Math.PI+Math.sin(t*3+i)*.06;
      gfx.beginPath(); gfx.ellipse(x+ox,y+oy,Math.max(.5,r1),Math.max(.5,r2),rot,0,Math.PI*2); gfx.stroke(); } }
  gfx.globalAlpha=1; };
B2_TOMBO_ANIM.boppy2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),tgt=(E2.targets||[]).find(t=>t.side==='foe'&&b2Alive(t))||list[0],F=ST.foe(tgt);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale,BW=bsp.idle[0].length*bsp.scale,actB=mirrorRowsCached(bsp,'act');
  const sb=cl(GR.base+4,236,300),tx=cl(GR.x1+190,GR.x1+150,530),PL=cl(GR.x1+20,150,320);
  const th=handPt(tsp,tsp.act,tx,sb,-1),wTop=cl(GR.top+20,120,230);
  const P={walk:650,back:800,cast:1000,boom:1150,bline:1600,tug1:2250,tug2:2850,tug3:3450,tline:4000,roll:4550,wrap:5050,hit:5250,home:6000,end:6700};
  // the tangle's size: pops out at the cast, grows with every tug
  const rOf=ms=>{ let r=0; if(ms>P.boom) r=16*ez(seg(ms,P.boom,P.boom+200));
    for(const [t,r2] of [[P.tug1,26],[P.tug2,38],[P.tug3,52]]) if(ms>t) r=lerp(r,r2,ez(seg(ms,t,t+220))); return r; };
  const hold=ms=>{ const r=rOf(ms); return {x:th.x-8-r*.55,y:th.y+6-r*.25}; };
  const bMin=PL+BW*.5+4,bxAt=ms=>{ const h=hold(ms),r=rOf(ms); return Math.max(bMin,h.x-r-BW*.42); };
  const sT={x:tx,b:sb,f:tsp.idle},sB={x:tx-110,b:sb};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms<P.back) f=sp.act; else if(ms<P.cast) { f=sp.flip; rot=.12; } else if(ms<P.boom+150) f=sp.act;
      else if(ms<P.bline+700) f=sp.expr; else if(ms<P.tline) f=sp.act;
      else if(ms<P.roll) { f=sp.celeb; y-=Math.abs(Math.sin((ms-P.tline)/130))*3; } else if(ms<P.hit+300) f=sp.act; else f=sp.celeb; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=sB.x,y=sb,f=sp.idle,rot=0;
    const bx0=Math.max(bMin,tx-110);
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,bx0,k); y=lerp(c.origBase,sb,k); f=k<1?runFr(sp,c.t,-1):sp.flip; }
    else if(ms<P.home) {
      if(ms<P.boom) { x=bx0; f=sp.flip; }
      else if(ms<P.bline+800) { x=bx0; f=ms<P.bline?(sp.expr||sp.flip):(sp.hip||sp.flip); }
      else if(ms<P.tline) { const want=Math.min(bx0,bxAt(ms)); const k=ez(seg(ms,P.bline+800,P.tug1)); x=lerp(bx0,want,ms<P.tug1?k:1); f=actB;
        for(const t of [P.tug1,P.tug2,P.tug3]) if(ms>t-120&&ms<t+260) { const q=seg(ms,t-120,t+260); x-=Math.sin(q*Math.PI)*10; rot=-.18*Math.sin(q*Math.PI); }
        if(ms>P.tug1+260) for(const t of [P.tug2,P.tug3]) if(ms>t+260&&ms<t+420) f=sp.flip; }
      else if(ms<P.roll) { x=Math.min(bx0,bxAt(P.tline))-6; f=sp.hip||sp.flip; }
      else { x=Math.min(bx0,bxAt(P.tline))-6; f=ms<P.hit?(sp.flip):(ms<P.hit+500?(sp.celebFlip||sp.flip):(sp.hip||sp.flip)); } }
    else { const x0=Math.min(bx0,bxAt(P.tline))-6,k=ez(seg(ms,P.home,P.home+650)); x=lerp(x0,c.origX,k); y=lerp(sb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sB.x=x; sB.b=y; return {cx:x,base:y,frame:f,rot}; });
  const setK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-150)));
  // the lake under the monsters, reeds, the pier under the pair
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=setK(ms); if(k<=0) return; gfx.globalAlpha=k;
    gfx.fillStyle=WATER; gfx.beginPath(); gfx.moveTo(0,wTop); for(let x=0;x<=PL;x+=12) gfx.lineTo(x,wTop+Math.sin(x/20+ms/300)*3); gfx.lineTo(PL,324); gfx.lineTo(0,324); gfx.closePath(); gfx.fill();
    for(let j=0;j<7;j++) { const yy=wTop+18+j*16,xx=((j*53+ms/26)%(PL+40))-20; Ln(xx,yy,xx+26,yy,2,WATER2); }
    Ln(0,wTop+1,PL,wTop+1,2,FOAM);
    for(let i=0;i<8;i++) { const x=12+i*((PL-30)/7),h=44+((i*37)%30); cattail(x,wTop+6+(i%3)*4,h,Math.sin(ms/600+i)*3); }
    const p0=Math.min(sb-26,Math.max(wTop+14,sb-60));
    R(PL-2,p0,580-PL,330-p0,OUT); R(PL,p0+2,580-PL,330-p0,PLANK); for(let yy=p0+16;yy<324;yy+=16) R(PL,yy,580-PL,2,PLANK2);
    for(const yy of [p0+30,p0+86]) RO(PL-12,yy,12,330-yy,'#6a4a2a');
    gfx.globalAlpha=1; }});
  // the tangle's path once it rolls off the rod: arcs over to the monster and wraps it
  const wrapAt=ms=>{ const h=hold(P.roll),q=seg(ms,P.roll,P.wrap),c={x:F.x,y:F.top+F.h*.5};
    return {x:lerp(h.x,c.x,ez(q)),y:lerp(h.y,c.y,q)-Math.sin(q*Math.PI)*90,r:lerp(52,Math.max(F.w,F.h)*.62,ez(q)),rot:q*Math.PI*4}; };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=setK(ms);
    if(k>0) { gfx.globalAlpha=k; for(const f of list) { const q=ST.foe(f),x=q.x+(f.ox||0); ring(x,q.base-3,q.w*.42+Math.sin(ms/200+q.x)*2,6,3,FOAM); } gfx.globalAlpha=1; }
    // the rod in Tom's hand (until the tangle rolls off)
    const d=battle.drawnAt&&battle.drawnAt[tom.idx];
    if(ms>P.walk-100&&ms<P.home) { const h=d?handPt(tsp,sT.f,d.cx,d.base,-1):th;
      let a=1.05; if(ms>P.walk&&ms<P.back) a=lerp(1.05,2.2,ez(seg(ms,P.walk,P.back))); else if(ms>=P.back&&ms<P.cast) a=2.2; else if(ms>=P.cast&&ms<P.boom) a=lerp(2.2,.5,ez(seg(ms,P.cast,P.boom)));
      else if(ms>=P.boom&&ms<P.roll) a=.75+[P.tug1,P.tug2,P.tug3].reduce((m,t)=>m+(ms>t-120&&ms<t+260?-.25*Math.sin(seg(ms,t-120,t+260)*Math.PI):0),0);
      const Lr=96,tip={x:h.x-Math.cos(a)*Lr,y:h.y-Math.sin(a)*Lr};
      gfx.lineCap='round'; for(const [w,c] of [[6,OUT],[3,ROD]]) Ln(h.x,h.y,tip.x,tip.y,w,c); EO(h.x-6,h.y+2,4,4,'#9aa0a8');
      // the line: out to the water on the cast; a mess into the tangle after the boom
      const r=rOf(ms),T=ms<P.roll?hold(ms):wrapAt(ms);
      if(ms>P.cast&&ms<P.boom) { const q=seg(ms,P.cast,P.boom); Ln(tip.x,tip.y,lerp(tip.x,PL-60,q),lerp(tip.y,wTop+10,q)-Math.sin(q*Math.PI)*40,1.6,'#eef4f6'); }
      if(ms>=P.boom&&ms<P.wrap) { gfx.strokeStyle='#eef4f6'; gfx.lineWidth=1.6; gfx.beginPath(); gfx.moveTo(tip.x,tip.y); gfx.quadraticCurveTo(tip.x-20,tip.y+30,T.x,T.y-(ms<P.roll?r*.6:0)); gfx.stroke();
        gfx.beginPath(); gfx.moveTo(h.x-6,h.y+2); gfx.quadraticCurveTo(h.x-10,h.y+20,T.x+(ms<P.roll?r*.5:0),T.y); gfx.stroke(); } }
    // the bird's nest
    if(ms>P.boom&&ms<P.roll) { const H=hold(ms),r=rOf(ms),jig=[P.tug1,P.tug2,P.tug3].some(t=>ms>t&&ms<t+260)?Math.sin(ms/30)*3:0; nest(H.x+jig,H.y,r,r*.82,ms/1000,3); }
    if(ms>=P.roll&&ms<P.wrap) { const W=wrapAt(ms); gfx.save(); gfx.translate(W.x,W.y); gfx.rotate(W.rot); nest(0,0,W.r,W.r*.82,ms/1000,3); gfx.restore(); }
    // wrapped: the net of line over the monster, tight, wriggling
    if(ms>=P.wrap&&ms<P.end-80) { const a=1-seg(ms,P.home+200,P.end-80),sq=ms<P.hit?1:1-.08*Math.abs(Math.sin((ms-P.hit)/90))*(1-seg(ms,P.hit,P.home));
      tgt.fsc=ms<P.home?.9+.02*Math.sin(ms/70):lerp(.9,1,seg(ms,P.home,P.end-80)); tgt.oy=F.h/2*(1-tgt.fsc); tgt.spin=ms<P.home?Math.sin(ms/80)*.05:0; tgt.spinAt=performance.now();
      nest(F.x,F.top+F.h*.52+tgt.oy,F.w*.6*sq,F.h*.58*sq,ms/1000,3,a); }
  }});
  ST.play(E2,[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Cattail Pier. Boppy lets Tom use his good rod. Once.'); B2.aim=null; S('click'); }],
    [P.cast,()=>{ S('whoosh'); S('reel'); }],
    [P.boom,()=>{ S('boing'); S('crash'); word('SPROING!',th.x-30,40,'#eef4f6',4,.8); setMessage('The reel explodes into a giant bird’s nest.'); }],
    [P.bline,()=>{ say('boppy','dc2'); }],
    [P.tug1,()=>{ S('squeak'); setMessage('Boppy tries to fix it. It gets worse.'); }],
    [P.tug2,()=>{ S('squeak'); S('sulk'); word('WORSE.',bxAt(P.tug2),Math.max(80,sb-BH-30),CREAM,3,.6); setMessage('Bigger. Much worse.'); }],
    [P.tug3,()=>{ S('squeak'); word('WORSER.',bxAt(P.tug3),Math.max(80,sb-BH-30),CREAM,3,.6); setMessage('It\'s the size of a beach ball now.'); }],
    [P.tline,()=>{ say('tom','dcboppy2'); }],
    [P.roll,()=>{ S('whoosh'); setMessage('The whole tangle rolls off the rod.'); }],
    [P.wrap,()=>{ S('reel'); S('thud'); ST.jolt(tgt,.4); }],
    [P.hit,()=>{ S('splash'); S('bonk'); battle.shakeEnemy=.6; word('WRAPPED!',F.x,40,GOLD,4,.9); scene('tb_rings',.6,{x:F.x,y:F.mid,r:56,c:FOAM,w:3});
      setMessage('It wraps the monster up like a net.'); landHit(100); E2.apply(); }],
    ['hf',P.hit],
    [P.hit+700,()=>{ S('sulk'); }],
    [P.end,'end',()=>{ tgt.fsc=0; tgt.oy=0; tgt.ox=0; tgt.spin=0; return (E2.result||'')+' Boppy says that was his good reel.'; }]]);
};
// ---------- Last Train Home (Tom + TNB, Director's Cut of tier 2) ----------
// A subway platform. The last train home is in, and the doors are closing. Tom and TNB sprint for it; TNB gets there
// first and jams his longboard in the doors, then crouches so Tom can dive over him and through. TNB yanks the board and
// hops in, and the doors slam shut on the monsters trying to squeeze on after them. The train pulls out with the two of
// them waving in the windows (a kiss and a heart), and they are home. Effects (no damage): every enemy warms up, the
// party loses its debuffs, and Tom and TNB get a quicker next turn.
const DOORC='#b8bec8';
B2_TOMBO_ANIM.tnb2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,TW=tsp.idle[0].length*tsp.scale,NW=nsp.idle[0].length*nsp.scale;
  const sb=cl(GR.base+4,236,300),fl=sb-6,top=fl-160,dX=cl(GR.x1+56,GR.x1+44,460);
  const L=660,xS=dX-(L-90),travel=dX+130,nX=dX+34,tTo=dX+88;
  const P={close0:1300,run0:1200,jam:1900,nline:2000,tline:2500,crouch:2850,tarr:3000,dive:3150,inn:3500,pull:3750,hop:3800,hopEnd:4000,slam:4150,
    lunge:3800,kiss:4450,go:4700,out:5600,dark:5450,home:5800,apply:6000,end:6700};
  // the doors: open, closing, stopped by the board (shoving at it), bounced open by Tom's dive, then SLAM
  const gapOf=ms=>{ if(ms<P.close0) return 50; if(ms<P.jam) return lerp(50,14,ez(seg(ms,P.close0,P.jam)));
    if(ms<P.hopEnd) { let g=14; if(ms<P.dive) g-=2*Math.abs(Math.sin((ms-P.jam)/140)); if(ms>P.dive&&ms<P.dive+500) g+=18*Math.sin(seg(ms,P.dive,P.dive+500)*Math.PI); return g; }
    return lerp(14,0,Math.pow(seg(ms,P.hopEnd,P.slam),2)); };
  const offOf=ms=>ms<P.go?0:-travel*Math.pow(seg(ms,P.go,P.out),2);
  const sT={x:tTo,b:sb,f:tsp.idle,hide:false},sN={x:nX,b:sb+4,f:nsp.idle,hide:false};
  // Tom: jogs over (slowly, sweating), pants, dives head first through the doors, and is inside until he is home
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=c.origX,y=c.origBase,f=sp.idle,rot=0,hide=false;
    if(ms<P.run0) f=ms>P.close0-200?sp.expr:sp.idle;
    else if(ms<P.tarr) { const k=seg(ms,P.run0,P.tarr); x=lerp(c.origX,tTo,k); y=lerp(c.origBase,sb,k)+ffHop(ms,P.run0,P.tarr)*1.4; f=sp.act; }
    else if(ms<P.dive) { x=tTo; y=sb+Math.abs(Math.sin((ms-P.tarr)/110))*2; f=sp.expr; }
    else if(ms<P.inn) { const k=seg(ms,P.dive,P.inn); x=lerp(tTo,dX-6,ez(k)); y=lerp(sb,fl-20,k)-Math.sin(k*Math.PI)*56; rot=-Math.PI/2*ez(Math.min(1,k*1.7)); f=sp.celeb; }
    else if(ms<P.home) hide=true;
    else { const k=seg(ms,P.home,P.home+320); y=c.origBase-Math.sin(k*Math.PI)*22; f=k<1?sp.celeb:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; sT.hide=hide; return {cx:x,base:y,frame:f,rot,hide,noShadow:hide||(ms>P.dive&&ms<P.inn)}; });
  // TNB: sprints to the doors, jams the board, crouches for Tom, yanks the board and hops in after him
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nX,y=sb+4,f=sp.act||sp.idle,hide=false;
    if(ms<P.run0) { x=c.origX; y=c.origBase; f=ms>P.close0-200?(sp.expr||sp.idle):sp.idle; }
    else if(ms<P.jam-150) { const k=ez(seg(ms,P.run0,P.jam-150)); x=lerp(c.origX,nX,k); y=lerp(c.origBase,sb+4,k); f=k<1?runFr(sp,c.t,-1):sp.idle; }
    else if(ms<P.crouch) f=ms<P.jam?(sp.throw||sp.act):sp.act;
    else if(ms<P.pull) f=sp.kneel||sp.act;
    else if(ms<P.hop) f=sp.act;
    else if(ms<P.hopEnd) { const k=seg(ms,P.hop,P.hopEnd); x=lerp(nX,dX+2,k); y=sb+4-Math.sin(k*Math.PI)*30; f=sp.celeb||sp.idle; }
    else if(ms<P.home) hide=true;
    else { const k=seg(ms,P.home,P.home+320); x=c.origX; y=c.origBase-Math.sin(k*Math.PI)*22; f=k<1?(sp.celeb||sp.idle):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; sN.hide=hide; return {cx:x,base:y,frame:f,hide,noShadow:hide}; });
  const tunK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.dark,P.dark+450)));
  // a window on the car with someone looking out of it (sprite clipped to the glass)
  const win=(x,y,w,h,who,ms)=>{ RO(x,y,w,h,'#5a7a9a'); R(x+2,y+2,w-4,6,'#8ab0d0');
    if(who) { const sp=who==='tom'?tsp:nsp,fr=(Math.floor(ms/260)%2)?(sp.celeb||sp.idle):sp.idle,sw=fr[0].length*sp.scale;
      gfx.save(); gfx.beginPath(); gfx.rect(x,y,w,h); gfx.clip(); drawSprite(fr,sp.pal,x+w/2-sw/2,y+6,sp.scale); gfx.restore(); }
    gfx.globalAlpha=.3; R(x,y,w,7,'#ffffff'); gfx.globalAlpha=1; };
  // the car (side view, facing left), door centre at dX+off
  const car=(off,ms)=>{ const x0=xS+off,x1=x0+L,dx=dX+off,bot=fl+16,g=gapOf(ms);
    gfx.beginPath(); gfx.moveTo(x0+30,top); gfx.lineTo(x1,top); gfx.lineTo(x1,bot); gfx.lineTo(x0,bot); gfx.lineTo(x0,top+46); gfx.quadraticCurveTo(x0+2,top+4,x0+30,top); gfx.closePath();
    gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.lineJoin='round'; gfx.stroke(); gfx.fillStyle=SILVER; gfx.fill();
    gfx.save(); gfx.clip(); R(x0,top,L,10,'#e4e8ee'); R(x0,fl-40,L,10,METRO_RED); R(x0,fl-30,L,2,'#f06a70'); R(x0,fl-28,L,44,SILVER2);
    for(let x=dx-210;x>x0;x-=190) R(x,top,2,bot-top,'#7a808c'); gfx.restore();
    for(let x=x0+120;x<x1-30;x+=120) RO(x,top-6,40,6,'#8a909c');
    // windows: TNB and Tom wave from the two nearest the door once they are on
    const on=ms>P.slam;
    win(dx-176,top+22,54,46,on?'tnb':null,ms); win(dx-110,top+22,54,46,on?'tom':null,ms);
    for(let x=dx-260;x>x0+20;x-=80) win(x,top+22,54,46,null,ms);
    label('LAST TRAIN',dx-140,fl-38,'#ffffff',1);
    // the doorway: lit inside, then the two panels
    RO(dx-27,top+14,54,fl-top-14,'#e8dcae'); R(dx-25,top+16,50,12,'#fff4c8'); Ln(dx-14,top+30,dx-14,fl-6,2,'#9aa1ae'); Ln(dx+14,top+30,dx+14,fl-6,2,'#9aa1ae');
    for(const s of [-1,1]) { const inner=dx+s*g/2,outer=dx+s*25,a=Math.min(inner,outer),w=Math.abs(outer-inner); if(w<1) continue;
      R(a,top+14,w,fl-top-14,DOORC); R(a,top+14,w,3,'#f4e04a');
      const wx=s<0?a+3:a+w-17; if(w>18) { RO(wx,top+28,14,40,'#5a7a9a'); R(wx,top+28,14,5,'#8ab0d0'); } }
    Ln(dx-g/2,top+14,dx-g/2,fl,2,OUT); Ln(dx+g/2,top+14,dx+g/2,fl,2,OUT);
    gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.strokeRect(dx-27,top+14,54,fl-top-14);
    // a door light: red while closing
    const blink=ms>P.close0&&ms<P.slam+200&&Math.floor(ms/180)%2; EO(dx,top+6,4,4,blink?'#ff4a4a':'#7a2a2a'); };
  // back layer: tunnel wall with subway tiles and the METRO sign, the car, then the platform in front of it
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=tunK(ms); if(k<=0) return;
    gfx.globalAlpha=k*.8; R(0,0,576,324,'#14121c'); gfx.globalAlpha=k;
    const ty0=Math.max(8,top-40),ty1=fl; R(0,ty0,576,ty1-ty0,'#d8dcd4');
    for(let y=ty0;y<ty1;y+=10) R(0,y,576,1,'#a8aca4'); for(let y=ty0,r=0;y<ty1;y+=10,r++) for(let x=(r%2)*10;x<576;x+=20) R(x,y,1,10,'#a8aca4');
    R(0,ty0,576,4,'#5a5e66'); R(0,ty0+30,576,8,METRO_RED);
    const sx=cl(GR.x0+40,80,300),sy=Math.max(10,ty0-44); RO(sx-62,sy,124,30,METRO_RED); R(sx-60,sy+2,120,4,'#f06a70');
    EO(sx-44,sy+15,10,10,'#ffffff'); label('M',sx-44,sy+11,METRO_RED,2); label('METRO',sx+12,sy+10,'#ffffff',2);
    const off=offOf(ms); if(xS+off+L>-10) car(off,ms);
    R(0,fl,576,324-fl,'#8a8e96'); for(let x=0;x<576;x+=48) R(x,fl+10,2,324-fl,'#7a7e86');
    R(0,fl,576,7,'#f4d03a'); for(let x=3;x<576;x+=8) R(x,fl+2,3,3,'#c8a42a'); R(0,fl+7,576,2,OUT);
    gfx.globalAlpha=1; }});
  // front layer: the longboard in the doors, Tom's sweat, the kiss heart, the monsters' lunge and bonk, speed lines
  const shift=o3.map(o=>cl(dX-30-(o.q.x+o.q.w*.42),0,80));
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.jam-150&&ms<P.pull) { const k=ez(seg(ms,P.jam-150,P.jam)),h=handPt(nsp,nsp.throw||nsp.act,nX,sb+4,-1);
      longboard(lerp(h.x,dX,k),lerp(h.y,fl-64,k),lerp(.2,Math.PI/2,k)+(ms>P.jam&&ms<P.dive?Math.sin(ms/45)*.03:0)); }
    else if(ms>=P.pull&&ms<P.hopEnd&&!sN.hide) { const h=handPt(nsp,sN.f,sN.x,sN.b,-1); longboard(h.x+6,h.y-4,-.3); }
    if(ms>P.run0+300&&ms<P.dive) for(let j=0;j<2;j++) { const q=((ms/380)+j*.5)%1; gfx.globalAlpha=1-q; E(sT.x+14+j*9,sT.b-TH*.82+q*26,2.4,3.4,'#9fd8ff'); }
    gfx.globalAlpha=1;
    if(ms>P.kiss&&ms<P.kiss+1100) { const q=seg(ms,P.kiss,P.kiss+1100),hx=dX-115+offOf(ms); gfx.globalAlpha=fade(q,.7); heart(hx,top+10-q*30,lerp(6,13,ez(q*3)),PINK); gfx.globalAlpha=1; }
    if(ms>P.go&&ms<P.out) { gfx.globalAlpha=.7; for(let j=0;j<5;j++) { const y=top+14+j*26,x=xS+offOf(ms)+L+20+((ms*.9+j*53)%110); Ln(x,y,x+60,y,3,'#ffffff'); } gfx.globalAlpha=1; }
    // the monsters rush the doors, get the doors slammed in their faces, and bounce back
    o3.forEach((o,i)=>{ const f=o.f,L2=ez(seg(ms,P.lunge+i*60,P.slam)),B=ez(seg(ms,P.slam+250,P.slam+750)); if(ms<P.lunge||ms>P.end-60) return;
      const sq=ms>P.slam&&ms<P.slam+220?1-.14*Math.sin(seg(ms,P.slam,P.slam+220)*Math.PI):1;
      f.ox=shift[i]*L2*(1-B)-(ms>P.slam&&ms<P.slam+250?6*Math.sin(seg(ms,P.slam,P.slam+250)*Math.PI):0);
      f.oy=-Math.abs(Math.sin(L2*Math.PI*2))*8*(1-B)+o.q.h/2*(1-sq); f.fsc=sq<1?sq:0; f.spin=0; f.spinAt=performance.now();
      if(ms>P.slam&&ms<P.slam+1000) for(let j=0;j<3;j++) { const a=ms/240+j*2.1; star(o.q.x+f.ox+Math.cos(a)*o.q.w*.36,o.q.top-10+Math.sin(a)*5,4,j%2?GOLD:'#fffbe6'); } });
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! The last train home. It\'s already here.'); B2.aim=null; S('rumble'); }],
    [1150,()=>{ S('chime2'); word('DING DONG',dX-40,Math.max(80,top-16),CREAM,3,.8); }],
    [P.close0,()=>{ S('creak'); setMessage('Stand clear of the closing doors.'); }],
    [P.run0+100,()=>{ S('whoosh'); }],
    [P.jam,()=>{ S('clang'); S('bump'); word('CLUNK!',dX,Math.max(80,top-16),'#dfe6f2',4,.6); setMessage('TNB jams his longboard in the doors.'); }],
    [P.nline,()=>{ say('tnb','dc2'); }],
    [P.jam+500,()=>{ S('bump'); }],[P.jam+900,()=>{ S('bump'); }],
    [P.tline,()=>{ say('tom','dctnb2'); setMessage('Tom is coming. At his own pace.'); }],
    [P.crouch,()=>{ setMessage('TNB ducks. Tom goes for it.'); }],
    [P.dive,()=>{ S('slideWhistle'); word('DIVE!',dX+40,40,GOLD,5,.8); }],
    [P.inn,()=>{ S('thud'); }],
    [P.pull,()=>{ S('whoosh'); }],
    [P.hopEnd,()=>{ S('jumpWhistle'); }]];
  steps.push([P.slam,()=>{ S('crash'); S('clang'); battle.shakeEnemy=.6; word('SLAM!',dX,66,'#dfe6f2',5,.9); scene('tb_rings',.6,{x:dX,y:fl-70,r:60,c:'#dfe6f2',w:3});
    setMessage('The doors slam shut on the monsters. They wanted that train too.');
    for(const o of o3) { ST.jolt(o.f,.3); for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(j-1)*18,y1:o.q.top-24,arc:10,spin:false,r:6,t:-j*.05,dur:.7}); }
  }]);   // the warmth and the fx land together once the pair is home (a kind Tombo's first landHit lands everything)
  steps.push(['hf',P.slam]);
  steps.push([P.kiss,()=>{ S('kiss'); setMessage('They made it. A kiss in the window.'); }]);
  steps.push([P.go,()=>{ S('toot'); S('rumble'); }]);
  steps.push([P.dark,()=>{ word('NEXT STOP: HOME',288,72,CREAM,3,.95); }]);
  steps.push([P.home,()=>{ S('ding'); }]);
  steps.push([P.apply,()=>{ landHit(100); E2.apply(); S('heal'); S('chime2'); setMessage('Home. The monsters cool right off, and everybody shakes off the day.');
    for(const o of o3) scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:40,c:PINK,w:3});
    for(const p of party) { const q2=ST.unit(p); scene('glow',.9,{x:q2.x,y:q2.mid,rx:38,ry:52,c:'#ffd6a0',a:.35}); } }]);
  steps.push([P.end,'end',()=>{ for(const o of o3) { o.f.ox=0; o.f.oy=0; o.f.fsc=0; o.f.spin=0; } return (E2.result||'')+' Tom says he didn\'t run. He hurried.'; }]);
  ST.play(E2,steps);
};
// ---------- Nara, No! (Tom + Nara, Director's Cut of tier 2) ----------
// Zoomies. Nara play-bows, then tears around the room in two big laps, bowling through every monster, while Tom stands
// in the middle saying "Nara, no" each time she goes by. She stops, sits at his feet, and looks extremely proud. Effects:
// a Kinetic hit on every enemy (the first lap does the damage) that stops their wind-ups.
B2_TOMBO_ANIM.nara2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list);
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const sb=cl(GR.base+4,236,300),tx=cl(GR.x1+150,GR.x1+120,470);
  const bases=o3.map(o=>o.q.base),yB=cl(Math.max(sb,...bases)+12,240,316),yT=cl(Math.min(...bases)-8,150,yB-50);
  const xL=Math.max(28,GR.x0-40),xR=Math.min(556,tx+74),cx=(xL+xR)/2,rx=(xR-xL)/2,cy=(yT+yB)/2,ry=(yB-yT)/2;
  const P={walk:650,bow:750,nline:900,z0:1700,tline:1900,z1:4700,sit:5050,pet:5350,good:5450,home:5950,end:6650};
  const th0=Math.PI/2-.55,LAPS=2,thOf=ms=>th0+LAPS*Math.PI*2*ez(seg(ms,P.z0,P.z1));
  const ptOf=th=>({x:cx+rx*Math.cos(th),y:cy+ry*Math.sin(th)});
  const start=ptOf(th0),sitX=tx-46;
  // when she runs past each monster (on the leg nearest its feet) and past Tom, sampled along the laps
  const hits=[],toms=[]; { let prev=ptOf(thOf(P.z0));
    for(let ms=P.z0+5;ms<=P.z1;ms+=5) { const th=thOf(ms),p=ptOf(th),down=Math.sin(th)>0;
      o3.forEach((o,i)=>{ const low=o.q.base>=cy; if(low!==down) return; if((prev.x-o.q.x)*(p.x-o.q.x)<=0&&prev.x!==p.x) hits.push({t:ms,o,i,dir:p.x<prev.x?-1:1}); });
      if((prev.x-tx)*(p.x-tx)<=0&&prev.x!==p.x&&ms>P.z0+200) toms.push({t:ms,down});
      prev=p; } }
  const lapEnd=P.z0+(P.z1-P.z0)/2,first=hits.filter(h=>h.t<lapEnd);
  const sT={x:tx,b:sb},sN={x:start.x,b:start.y,dir:-1};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=sb,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,sb,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      const nearPass=toms.some(p=>ms>p.t-150&&ms<p.t+450);
      if(ms<P.z0) f=sp.idle;
      else if(ms<P.z1) { f=sN.x>tx+4?sp.flip:sp.idle; if(nearPass) f=sp.act; }
      else if(ms<P.sit) f=sp.expr;
      else if(ms<P.pet) f=sp.idle;
      else if(ms<P.home-200) f=sp.kneel; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(sb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=start.x,y=start.y,f=sp.idle,rot=0,dir=-1;
    if(ms<P.walk) { const k=ez(ms/P.walk),d=start.x>c.origX?1:-1; x=lerp(c.origX,start.x,k); y=lerp(c.origBase,start.y,k)-Math.abs(Math.sin(c.t*16))*4; f=k<1?runFr(sp,c.t,d):sp.idle; dir=d; }
    else if(ms<P.z0) { f=ms>P.bow?(sp.wind||sp.aim||sp.idle):sp.idle; rot=ms>P.bow?Math.sin(ms/55)*.08:0; y=start.y+(ms>P.bow?Math.abs(Math.sin(ms/110))*2:0); }
    else if(ms<P.z1) { const th=thOf(ms),p=ptOf(th),dx=-Math.sin(th); dir=dx<0?-1:1; x=p.x; y=p.y-Math.abs(Math.sin(c.t*20))*5; f=runFr(sp,c.t*1.6,dir); rot=dir*.08; }
    else if(ms<P.sit) { const k=ez(seg(ms,P.z1,P.sit)); x=lerp(start.x,sitX,k); y=lerp(start.y,sb+4,k)-Math.abs(Math.sin(c.t*16))*3; dir=sitX>start.x?1:-1; f=k<1?runFr(sp,c.t,dir):(sp.sit||sp.idle); }
    else if(ms<P.home) { x=sitX; y=sb+4-(ms<P.sit+500?Math.abs(Math.sin((ms-P.sit)/90))*4:0); f=sp.sit||sp.idle; }
    else { const k=ez(seg(ms,P.home,P.home+650)),d=c.origX>sitX?1:-1; x=lerp(sitX,c.origX,k); y=lerp(sb+4,c.origBase,k)-(k<1?Math.abs(Math.sin(c.t*16))*4:0); f=k<1?runFr(sp,c.t,d):sp.idle; dir=d; }
    sN.x=x; sN.b=y; sN.dir=dir; return {cx:x,base:y,frame:f,rot}; });
  // dust, speed lines, the bowled monsters, the proud little sparkle
  const trail=[];
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.z0&&ms<P.z1+100) { trail.push({x:sN.x,y:sN.b,t:ms}); while(trail.length&&ms-trail[0].t>380) trail.shift();
      for(const d of trail) { const q=(ms-d.t)/380; gfx.globalAlpha=(1-q)*.55; E(d.x-sN.dir*6,d.y-3-q*8,4+q*8,3+q*5,'#d8cbb0'); }
      gfx.globalAlpha=.75; for(let j=0;j<3;j++) { const yy=sN.b-NH*.3-j*10,xx=sN.x-sN.dir*(NH*.45+8+j*5); Ln(xx,yy,xx-sN.dir*(18+j*6),yy,3,CREAM); } gfx.globalAlpha=1; }
    for(const o of o3) { const f=o.f,h=hits.filter(h=>h.o===o&&ms>=h.t&&ms<h.t+640).pop();
      if(h) { const k=seg(ms,h.t,h.t+640); f.oy=-Math.sin(k*Math.PI)*46; f.ox=h.dir*Math.sin(k*Math.PI)*18; f.spin=h.dir*-k*Math.PI*2; f.spinAt=performance.now(); }
      else if(f.spin||f.oy||f.ox) { f.spin=0; f.oy=0; f.ox=0; } }
    if(ms>P.sit&&ms<P.home) { const q=((ms-P.sit)/600)%1; gfx.globalAlpha=1-q; star(sitX+18,sb+4-NH-4-q*10,3+q*2,GOLD); star(sitX-16,sb+4-NH+4-q*12,2.5+q*2,'#fffbe6'); gfx.globalAlpha=1; }
    if(ms>P.pet&&ms<P.pet+1100) { const q=seg(ms,P.pet,P.pet+1100); gfx.globalAlpha=fade(q,.7); heart((sT.x+sitX)/2,Math.min(sT.b-TH*.7,sb+4-NH)-10-q*26,lerp(7,14,ez(q*3)),PINK); gfx.globalAlpha=1; }
  }});
  const NO=['NARA, NO.','NARA.','NO.','NARA!'];
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Nara has a look in her eye.'); B2.aim=null; S('click'); }],
    [P.bow,()=>{ S('bark'); setMessage('Butt up. Tail going. Uh oh.'); }],
    [P.nline,()=>{ say('nara','dc2'); }],
    [P.z0,()=>{ S('whoosh'); S('bark'); word('ZOOMIES!',GR.x,40,GOLD,5,1); setMessage('ZOOMIES. She tears around the room.'); }],
    [P.tline,()=>{ say('tom','dcnara2'); }],
    [P.z1,()=>{ S('brakes'); }],
    [P.sit,()=>{ S('bark'); E2.apply(); setMessage('She stops. She sits. She\'s extremely proud of herself.'); }],
    [P.good,()=>{ S('chime2'); word('GOOD GIRL.',(sT.x+sitX)/2,Math.max(80,sb-TH-34),PINK,3,.9); }],
    [P.end,'end',()=>{ for(const o of o3) { o.f.spin=0; o.f.oy=0; o.f.ox=0; } return (E2.result||'')+' Tom says that was a no. Nara heard a yes.'; }]];
  toms.slice(0,NO.length).forEach((p,i)=>steps.push([p.t,()=>{ word(NO[i],tx,i%2?Math.max(80,sb-TH-40):Math.max(96,sb-TH-24),CREAM,3,.55); }]));
  hits.forEach(h=>steps.push([h.t,()=>{ S('bonk'); S('whoosh'); ST.jolt(h.o.f,.5); scene('dust',.5,{x:h.o.q.x,y:h.o.q.base,n:6,sp:30,up:10});
    if(first.includes(h)) { battle.shakeEnemy=.5; landHit(split100(first.indexOf(h),first.length)); } }]));
  steps.push(['hf',first.length?first[0].t:P.z0+300]);
  ST.play(E2,steps);
};
// ---------- Shadow Squishy (Tom + Grace, Director's Cut of tier 3) ----------
// Lights out. Tom clicks on a little reading lamp and makes a shadow bunny on the wall above the monsters: floppy ears,
// one of them bent, very modern. Grace says no, like THIS, and fixes it into a perfect shadow dumpling (its eyes and smile
// are light shining through). The lamp light spreads across the whole wall and the shadow dumpling grows with it; the
// monster under it panics and ducks, and the giant shadow squishes down on it. Effects: a Sparkle hit on one enemy (it
// warms up) and a Close-Up on it (the next damaging hit counts double).
let shadowImg=null;
const shadowSq=()=>{ if(shadowImg) return shadowImg; const rows=SQUISHY,w=rows[0].length,h=rows.length,P=4,c=document.createElement('canvas');
  c.width=w*P; c.height=h*P; const g=c.getContext('2d');
  for(let r=0;r<h;r++) for(let q=0;q<w;q++) { const ch=rows[r][q]; if(ch==='.'||ch==='e'||ch==='m') continue; g.fillStyle='#1c1428'; g.fillRect(q*P,r*P,P,P); }
  return shadowImg=c; };
const SHADE='#1c1428',LAMPLIT='#fff1cb';
// Tom's shadow bunny, facing left, head at x,y. wob: ear flop. Wrist and arm trail off to the lower right.
const shBunny=(x,y,s,wob,a)=>{ if(a<=0) return; gfx.save(); gfx.translate(x,y); gfx.scale(s,s); gfx.globalAlpha=a; gfx.fillStyle=SHADE;
  gfx.beginPath(); gfx.moveTo(6,8); gfx.lineTo(18,0); gfx.lineTo(110,92); gfx.lineTo(70,110); gfx.closePath(); gfx.fill();
  E(0,0,21,15,SHADE); E(-17,4,10,7.5,SHADE);
  gfx.save(); gfx.translate(2,-10); gfx.rotate(-.32+wob*.25); E(0,-15,6,17,SHADE); gfx.restore();
  gfx.save(); gfx.translate(12,-9); gfx.rotate(.4); E(0,-8,5.5,10,SHADE); gfx.translate(0,-16); gfx.rotate(1.25+wob); E(0,-6,5,8,SHADE); gfx.restore();
  E(-8,-3,2.2,2,LAMPLIT); gfx.restore(); gfx.globalAlpha=1; };
// the reading lamp on the floor, its shade tipped up and to the left. Returns where the light comes out.
const readLamp=(x0,b0,on)=>{ gfx.save(); gfx.translate(x0,b0); gfx.scale(1.35,1.35); const x=0,b=0; E(x,b-2,14,4,OUT); E(x,b-3,12,3,'#5a6270'); Ln(x,b-4,x+4,b-30,5,OUT); Ln(x,b-4,x+4,b-30,2.5,'#8a92a0');
  gfx.save(); gfx.translate(x+4,b-32); gfx.rotate(-.7); gfx.beginPath(); gfx.moveTo(-4,-6); gfx.lineTo(-18,-12); gfx.lineTo(-18,12); gfx.lineTo(-4,6); gfx.closePath();
  gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#3c7a6a'; gfx.fill(); if(on) { gfx.globalAlpha=.9; E(-18,0,3,11,LAMPLIT); gfx.globalAlpha=1; } gfx.restore(); gfx.restore();
  return {x:x0+(4-18*Math.cos(.7))*1.35,y:b0+(-32+18*Math.sin(.7))*1.35}; };
B2_TOMBO_ANIM.grace3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],F=ST.foe(tgt),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,gsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,GH=gsp.idle.length*gsp.scale;
  const by=cl(Math.max(GR.base,ST.unit(tom).base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+30,gx=mx-30,lx=tx+44;
  const P={walk:650,lamp:800,bunny:1200,bunnyUp:1500,ghop:1950,gline:2100,fix:2600,morph:2700,morphEnd:3150,tline:3300,grow:3900,grown:4700,panic:4300,hide:4850,
    boo:5250,apply:5450,lights:5650,home:6050,end:6750};
  // the lit patch on the wall: small over the monsters, then the whole wall
  const W0={x:cl(GR.x,110,430),y:cl(GR.top-34,70,150)},W1={x:288,y:150};
  const patch=ms=>{ const on=ez(seg(ms,P.lamp,P.lamp+250)),k=ez(seg(ms,P.grow,P.grown)); return {x:lerp(W0.x,W1.x,k),y:lerp(W0.y,W1.y,k),rx:lerp(84,460,k)*on,ry:lerp(60,300,k)*on}; };
  // the shadow dumpling: centre, scale, squash
  const D0={x:W0.x-8,y:W0.y+4,s:1.3},D1={x:cl(F.x,150,430),y:cl(F.top-46,100,160),s:3.4};
  const dumpAt=ms=>{ const k=ez(seg(ms,P.grow,P.grown)); let x=lerp(D0.x,D1.x,k),y=lerp(D0.y,D1.y,k),s=lerp(D0.s,D1.s,k),sq=0;
    if(ms<P.morphEnd) { const q=seg(ms,P.morph,P.morphEnd); s*=lerp(.6,1,ez(q)); sq=.35*Math.sin(q*Math.PI); }
    if(ms>P.panic&&ms<P.boo) y-=Math.sin(seg(ms,P.panic,P.boo)*Math.PI)*10;   // it rears up a little
    if(ms>P.boo&&ms<P.boo+500) { const q=seg(ms,P.boo,P.boo+500); sq=.45*Math.sin(q*Math.PI)*(1-q*.5); y+=18*Math.sin(q*Math.PI); s*=1+.1*Math.sin(q*Math.PI); }
    if(ms>P.lights) { const q=ez(seg(ms,P.lights,P.home)); s*=1-q*.4; }
    return {x,y,s,sq}; };
  const sT={x:tx,b:by},sG={x:gx,b:by};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { f=ms>P.bunny&&ms<P.fix?sp.act:(ms>=P.fix&&ms<P.tline+700?sp.expr:(ms>P.boo&&ms<P.boo+700?sp.celeb:sp.idle));
      if(ms>P.boo&&ms<P.boo+700) y-=Math.abs(Math.sin(seg(ms,P.boo,P.boo+700)*Math.PI*2))*6; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=gx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,gx,k); y=lerp(c.origBase,by,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) {
      if(ms>P.bunnyUp&&ms<P.ghop) f=sp.flip;                                     // she turns to look at Tom's bunny
      else if(ms>=P.ghop&&ms<P.fix) { f=sp.celeb; y-=Math.sin(seg(ms,P.ghop,P.fix)*Math.PI)*12; }
      else if(ms>=P.fix&&ms<P.grown) f=sp.act;
      else if(ms>P.boo&&ms<P.boo+800) { f=sp.celeb; y-=Math.abs(Math.sin(seg(ms,P.boo,P.boo+800)*Math.PI*2))*10; } }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(gx,c.origX,k); y=lerp(by,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sG.x=x; sG.b=y; return {cx:x,base:y,frame:f}; });
  const darkK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.lights,P.home)));
  // back layer: a dim wall, the warm lamp patch, and the shadows (clipped to the light: no light, no shadow)
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=darkK(ms); if(k<=0) return; dim(k,'#241c34',.6);
    const p=patch(ms); if(p.rx<=1) return;
    gfx.save(); gfx.translate(p.x,p.y); gfx.scale(1,p.ry/p.rx); const gr=gfx.createRadialGradient(0,0,p.rx*.55,0,0,p.rx);
    gr.addColorStop(0,'rgba(255,241,203,'+(.92*k)+')'); gr.addColorStop(1,'rgba(255,241,203,0)'); gfx.fillStyle=gr; gfx.beginPath(); gfx.arc(0,0,p.rx,0,Math.PI*2); gfx.fill(); gfx.restore();
    gfx.save(); gfx.beginPath(); gfx.ellipse(p.x,p.y,p.rx*.98,p.ry*.98,0,0,Math.PI*2); gfx.clip();
    // Tom's bunny: wobbly, then it fades as Grace's dumpling takes over
    if(ms>P.bunny&&ms<P.morphEnd) { const a=ez(seg(ms,P.bunny,P.bunny+250))*(1-seg(ms,P.morph,P.morphEnd))*k,bob=Math.sin(ms/160)*2;
      shBunny(W0.x+10,W0.y+6+bob,1.25,Math.sin(ms/220)*.5,a*.92); }
    if(ms>P.morph) { const d=dumpAt(ms),img=shadowSq(),w=img.width*d.s*(1+d.sq*.5),h=img.height*d.s*(1-d.sq*.45),a=ez(seg(ms,P.morph,P.morph+250))*k*(ms>P.lights?1-seg(ms,P.lights,P.home):1);
      gfx.globalAlpha=a*.92; const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=false; gfx.drawImage(img,d.x-w/2,d.y-h/2,w,h); gfx.imageSmoothingEnabled=sm;
      // two hand shapes under it (Grace's fingers made it), trailing to the lower right like the bunny's wrist
      const wa=1-ez(seg(ms,P.grow,P.grow+500)); if(wa>0) { gfx.globalAlpha=a*.92*wa; gfx.fillStyle=SHADE; gfx.beginPath(); gfx.moveTo(d.x+w*.2,d.y+h*.4); gfx.lineTo(d.x+w*.34,d.y+h*.34); gfx.lineTo(d.x+w*.34+300,d.y+h*.34+250); gfx.lineTo(d.x+w*.2+250,d.y+h*.4+300); gfx.closePath(); gfx.fill(); }
      gfx.globalAlpha=1; }
    gfx.restore(); }});
  // front layer: the dark with soft holes, the lamp, its beam, sparkles, the monster panicking
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=darkK(ms),p=patch(ms);
    if(k>0) { if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const g=darkC.getContext('2d'); g.globalCompositeOperation='source-over'; g.clearRect(0,0,576,324); g.fillStyle='#07060f'; g.fillRect(0,0,576,324);
      g.globalCompositeOperation='destination-out';
      const hole=(x,y,rx,ry)=>{ if(rx<=1) return; g.save(); g.translate(x,y); g.scale(1,ry/rx); const gr=g.createRadialGradient(0,0,rx*.4,0,0,rx); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.beginPath(); g.arc(0,0,rx,0,Math.PI*2); g.fill(); g.restore(); };
      hole(p.x,p.y,p.rx*1.15,p.ry*1.2); hole((sT.x+sG.x)/2+10,by-40,92*ez(seg(ms,0,300))+Math.max(0,p.rx-84)*.2,70);
      if(ms>P.lamp) hole(lx,by-30,40,34);
      g.globalCompositeOperation='source-over'; gfx.globalAlpha=.88*k; gfx.drawImage(darkC,0,0); gfx.globalAlpha=1; }
    if(ms<P.home+300) { const a=ms>P.home?1-seg(ms,P.home,P.home+300):1; gfx.globalAlpha=a*ez(seg(ms,P.walk-100,P.walk+200));
      const head=readLamp(lx,by,ms>P.lamp&&ms<P.lights);
      // the beam: from the lamp head to the lit patch
      if(ms>P.lamp&&ms<P.lights&&p.rx>1) { gfx.globalAlpha=a*.13*k; gfx.fillStyle=LAMPLIT; gfx.beginPath(); gfx.moveTo(head.x,head.y-5); gfx.lineTo(p.x+p.rx*.15,p.y-p.ry*.9); gfx.lineTo(p.x+p.rx*.15,p.y+p.ry*.9); gfx.lineTo(head.x,head.y+5); gfx.closePath(); gfx.fill(); }
      gfx.globalAlpha=1; }
    // sparkles when the dumpling comes out perfect
    if(ms>P.morphEnd-100&&ms<P.morphEnd+700) { const q=seg(ms,P.morphEnd-100,P.morphEnd+700),d=dumpAt(ms);
      for(let j=0;j<6;j++) { const an=j/6*Math.PI*2+q; gfx.globalAlpha=1-q; star(d.x+Math.cos(an)*(30+q*30),d.y+Math.sin(an)*(22+q*22),2+(j%3),j%2?GOLD:'#fffbe6'); } gfx.globalAlpha=1; }
    // the monster: shakes, sweats, ducks and scoots away from the shadow, then pulls itself together
    if(ms>P.panic&&ms<P.home+300) { let ox=0,s=1,spin=0;
      if(ms<P.hide) { ox=Math.sin(ms/22)*3*seg(ms,P.panic,P.panic+150);
        for(let j=0;j<2;j++) { const q=((ms-P.panic)/420+j*.5)%1; gfx.globalAlpha=1-q; E(F.x+(j?F.w*.32:-F.w*.3),F.top+6+q*18,2.6,3.8,'#9fd8ff'); } gfx.globalAlpha=1; }
      else if(ms<P.lights) { const q=ez(seg(ms,P.hide,P.hide+180)); s=1-.3*q; ox=-16*q+Math.sin(ms/30)*1.5; spin=-.12*q; }
      else { const q=ez(seg(ms,P.lights,P.home+300)); s=.7+.3*q; ox=-16*(1-q); spin=-.12*(1-q); }
      tgt.ox=ox; tgt.fsc=s<1?s:0; tgt.oy=F.h/2*(1-s); tgt.spin=spin; tgt.spinAt=performance.now(); }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Lights out. Tom has a lamp and an idea.'); B2.aim=null; S('click'); }],
    [P.lamp,()=>{ S('click'); S('chime2'); }],
    [P.bunny,()=>{ setMessage('Tom makes a shadow bunny on the wall. It is... a bunny.'); }],
    [P.bunnyUp,()=>{ S('boing'); word('BUNNY?',sT.x,Math.max(84,by-TH-30),CREAM,3,.8); }],
    [P.gline,()=>{ say('grace','dc3'); }],
    [P.fix,()=>{ setMessage('Grace takes over. Fingers here. Thumbs there.'); S('whoosh'); }],
    [P.morphEnd,()=>{ S('levelChime'); word('PERFECT!',D0.x,40,GOLD,4,.9); setMessage('A perfect shadow dumpling.'); }],
    [P.tline,()=>{ say('tom','dcgrace3'); }],
    [P.grow,()=>{ S('slideWhistle'); setMessage('The light spreads. The squishy grows across the whole wall.'); }],
    [P.panic,()=>{ S('stun'); word('!',F.x,Math.max(60,F.top-20),'#ffffff',5,.6); }],
    [P.hide,()=>{ S('squeak'); word('EEK!',F.x,66,'#fffbe6',4,.35); setMessage('The monster panics and hides. From a squishy.'); }],
    [P.boo,()=>{ S('boing'); S('ding'); battle.shakeEnemy=.5; ST.jolt(tgt,.5); word('SQUISH!',D1.x,40,GOLD,5,.9); scene('tb_rings',.7,{x:F.x,y:F.mid,r:70,c:GOLD,w:4});
      for(let j=0;j<5;j++) battle.props.push({kind:'dheart',x0:F.x,y0:F.mid,x1:F.x+(j-2)*22,y1:F.top-30,arc:14,spin:false,r:6,t:-j*.06,dur:.7});
      landHit(100); }],
    ['hf',P.boo],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('Close-up on the monster. The next big hit counts double.'); }],
    [P.lights,()=>{ S('click'); }],
    [P.end,'end',()=>{ tgt.ox=0; tgt.fsc=0; tgt.oy=0; tgt.spin=0; return (E2.result||'')+' Tom says his bunny was ahead of its time.'; }]];
  ST.play(E2,steps);
};
// ---------- Lamby Night-Light (Tom + Rose, Director's Cut of tier 3) ----------
// Bedtime, and the lights are out. Rose huddles with Lamby in the only patch of light; glowing monster eyes blink in the
// dark. She says Lamby is not scared. Tom comes over, lifts her onto his shoulders, and holds Lamby up like a night-light.
// Lamby glows brighter and brighter until the dark runs away, and every monster runs with it as the light reaches it.
// They creep back in, all warm and sheepish. Effects (no damage): every enemy warms up, loses its wind-up and its next
// turn comes later; the party's mental debuffs clear; Rose stays on Tom's shoulders.
B2_TOMBO_ANIM.rose3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty(),o3=order3(list);
  const tsp=BATTLE_SPRITES.tom,rsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,RH=rsp.idle.length*rsp.scale;
  const pMin=Math.min(...party.map(p=>ST.unit(p).x));
  const rx=cl((GR.x1+pMin)/2-10,GR.x1+44,Math.max(GR.x1+44,pMin-70)),rb=cl(GR.base+4,236,304),tx=rx+30;
  const hand=handPt(tsp,tsp.act,tx,rb,-1),LF={x:hand.x-4,y:hand.y-20};     // where Tom holds Lamby up
  const G0=3600,G1=4900,lr=ms=>50+700*Math.pow(seg(ms,G0,G1),2);
  // each monster runs off when the light reaches it
  o3.forEach(o=>{ const d=Math.hypot(o.q.x-LF.x,o.q.mid-LF.y); o.t=Math.round(G0+Math.sqrt(cl((d-50)/700))*(G1-G0)); });
  const lastFlee=Math.max(G0+600,...o3.map(o=>o.t));
  const P={walk:700,eyes:950,rline:1200,tgo:2000,tarr:2700,lift:2850,seat:3250,hold:3350,tline:3500,glow:4150,back:lastFlee+650,backEnd:lastFlee+1250,
    apply:lastFlee+1450,home:lastFlee+2150,end:lastFlee+2850};
  const sT={x:T.x,b:T.base},sR={x:rx,b:rb};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=c.origX,y=c.origBase,f=sp.idle;
    if(ms<P.tgo) f=ms>P.rline+300?sp.expr:sp.idle;
    else if(ms<P.tarr) { const k=ez(seg(ms,P.tgo,P.tarr)); x=lerp(c.origX,tx,k); y=lerp(c.origBase,rb,k)+ffHop(ms,P.tgo,P.tarr); }
    else if(ms<P.home) { x=tx; y=rb; f=ms<P.lift+150?sp.kneel:(ms<P.hold?sp.idle:(ms<P.backEnd?sp.act:(ms<P.backEnd+500?sp.celeb:sp.idle))); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(rb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:f}; });
  // Rose: walks into the dark, huddles (shivering), then hops onto Tom's shoulders and stays seated (riding spot)
  const seatPt=()=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx]; return d?{x:d.cx+2,y:d.base-d.h+20}:{x:sT.x+2,y:sT.b-TH+20}; };
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=rx,y=rb,f=sp.kneel;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,rx,k); y=lerp(c.origBase,rb,k)+ffHop(ms,0,P.walk); f=k<1?sp.idle:sp.kneel; }
    else if(ms<P.lift) { x=rx+Math.sin(ms/28)*1.2*(ms<P.tarr?1:.3); f=ms>P.rline&&ms<P.rline+900?sp.act:sp.kneel; }
    else if(ms<P.seat) { const k=seg(ms,P.lift,P.seat),s=seatPt(); x=lerp(rx,s.x,ez(k)); y=lerp(rb,s.y,ez(k))-Math.sin(k*Math.PI)*40; f=sp.celeb; }
    else { const s=seatPt(); x=s.x; y=s.y; f=sp.idle; }
    sR.x=x; sR.b=y; return {cx:x,base:y,frame:f,noShadow:ms>=P.lift}; });
  const darkK=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,G1-250,G1+350)));
  const warmK=ms=>ez(seg(ms,G0+400,G1))*(1-ez(seg(ms,P.apply,P.end-100)));
  // Lamby: in Rose's arms, handed up to Tom, held high and glowing, then back to Rose on his shoulders
  const glowK=ms=>ez(seg(ms,G0,G1))*(1-ez(seg(ms,P.backEnd,P.home)));
  const lamAt=ms=>{ const chest={x:sR.x-9,y:sR.b-RH*.4};
    if(ms<P.lift) return {x:chest.x,y:chest.y,sc:.7};
    if(ms<P.hold+250) { const k=seg(ms,P.lift,P.hold+250); return {x:lerp(rx-9,LF.x,ez(k)),y:lerp(rb-RH*.4,LF.y,ez(k))-Math.sin(k*Math.PI)*30,sc:lerp(.7,.95,k)}; }
    const g=ez(seg(ms,G0,G1));
    if(ms<P.backEnd) return {x:LF.x,y:LF.y-g*10+Math.sin(ms/300)*2,sc:.95+g*.55};
    const s=seatPt(),k=ez(seg(ms,P.backEnd,P.home)); return {x:lerp(LF.x,s.x-12,k),y:lerp(LF.y-10,s.y-6,k),sc:lerp(1.5,.6,k)}; };
  // back layer: bedtime sky (moon and stars) under the dark, then a warm lamp-glow wash
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=darkK(ms);
    if(k>0) { dim(k,'#0a1030',.55); gfx.globalAlpha=k; E(520,56,16,16,'#fff4c8'); E(527,51,14,14,'#0a1030'); 
      for(let j=0;j<12;j++) { const tw=.5+.5*Math.sin(ms/350+j*1.9); gfx.globalAlpha=k*tw; star((j*97+23)%540+12,30+(j*53)%90,1.5+(j%3),'#fffbe6'); } gfx.globalAlpha=1; }
    const w=warmK(ms); if(w>0) dim(w,'#ffd98a',.18); }});
  // front layer: the dark with soft holes, glowing eyes in it, Lamby and its light, the fleeing shadow wisps
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=darkK(ms),L=lamAt(ms),g=glowK(ms),R0=lr(ms);
    if(k>0) { if(!darkC) { darkC=document.createElement('canvas'); darkC.width=576; darkC.height=324; }
      const c=darkC.getContext('2d'); c.globalCompositeOperation='source-over'; c.clearRect(0,0,576,324); c.fillStyle='#04050d'; c.fillRect(0,0,576,324);
      c.globalCompositeOperation='destination-out';
      const hole=(x,y,r)=>{ if(r<=1) return; const gr=c.createRadialGradient(x,y,r*.35,x,y,r); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=gr; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); };
      hole(sR.x,Math.min(sR.b-RH*.4,rb-RH*.4),ms<P.lift?48:30);                         // the little patch of light Rose is in
      if(ms>P.tgo-300) hole(sT.x,sT.b-TH*.5,46*ez(seg(ms,P.tgo-300,P.tgo+200)));
      if(ms>G0-200) hole(L.x,L.y,R0);
      c.globalCompositeOperation='source-over'; gfx.globalAlpha=.93*k; gfx.drawImage(darkC,0,0); gfx.globalAlpha=1; }
    // monster eyes in the dark: blinking, until the light finds them (then wide, then gone with the monster)
    if(ms>P.eyes&&ms<G1+200) for(const o of o3) { const ex=o.q.x,ey=o.q.top+o.q.h*.32,dw=o.q.w*.15,d=Math.hypot(ex-L.x,ey-L.y);
      if(ms>G0-200&&d<R0*.7) continue; const blink=((ms+o.q.x*7)%2300)<120,a=ez(seg(ms,P.eyes,P.eyes+300))*k;
      if(a<=0) continue; gfx.globalAlpha=a; for(const s of [-1,1]) { if(blink) Ln(ex+s*dw-3,ey,ex+s*dw+3,ey,2,'#ffe36a'); else { E(ex+s*dw,ey,4,3,'#ffe36a'); E(ex+s*dw-1,ey,1.5,1.8,'#04050d'); } } gfx.globalAlpha=1; }
    // Lamby and its light
    if(ms<P.end-100) { const a=ms>P.end-300?seg(P.end-100-ms,0,200):1;
      if(g>0) { const r=18+g*70; gfx.save(); gfx.translate(L.x,L.y); const gr=gfx.createRadialGradient(0,0,0,0,0,r); gr.addColorStop(0,'rgba(255,240,180,'+(.75*g*a)+')'); gr.addColorStop(1,'rgba(255,240,180,0)'); gfx.fillStyle=gr; gfx.beginPath(); gfx.arc(0,0,r,0,Math.PI*2); gfx.fill();
        gfx.globalAlpha=g*.55*a; for(let j=0;j<10;j++) { const an=j/10*Math.PI*2+ms/900,r0=20+g*10,r1=r0+16+g*42+Math.sin(ms/120+j)*5; Ln(Math.cos(an)*r0,Math.sin(an)*r0,Math.cos(an)*r1,Math.sin(an)*r1,2.5,GOLD); } gfx.restore(); gfx.globalAlpha=1; }
      gfx.globalAlpha=a; RFX.plush(L.x,L.y,L.sc,{pose:'held',glow:g>.2,rot:ms<P.lift?Math.sin(ms/28)*.04:0}); gfx.globalAlpha=1; }
    // the dark runs away: a few shadow wisps with eyes scurry off to the left once the light grows
    if(ms>G0+300&&ms<G1+700) for(let j=0;j<5;j++) { const q=seg(ms,G0+300+j*120,G1+300+j*80); if(q<=0||q>=1) continue;
      const y=90+j*38,x=lerp(Math.min(560,L.x-80-j*10),-60,ez(q)); gfx.globalAlpha=(1-q)*.9; E(x,y,22,13,'#0c0d1a'); E(x+16,y+4,10,7,'#0c0d1a');
      E(x-8,y-3,3,2.2,'#ffe36a'); E(x+2,y-3,3,2.2,'#ffe36a'); gfx.globalAlpha=1; }
    // the monsters run left when the light reaches them, then creep back in
    for(const o of o3) { const f=o.f; if(ms<o.t||ms>P.end-60) continue;
      let ox=0,oy=0,spin=0;
      if(ms<P.back) { const q=seg(ms,o.t,o.t+500); ox=-140*ez(q); oy=-Math.abs(Math.sin(q*Math.PI*3))*14*(1-q*.5); spin=.15*Math.sin(q*Math.PI*3); }
      else { const q=ez(seg(ms,P.back,P.backEnd)); ox=-140*(1-q); oy=-Math.abs(Math.sin(q*Math.PI*4))*5*(1-q); spin=-.06*(1-q); }
      f.ox=ox; f.oy=oy; f.spin=spin; f.spinAt=performance.now(); }
  }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Bedtime. The lights go out.'); B2.aim=null; S('click'); }],
    [P.eyes,()=>{ S('creak'); setMessage('Something blinks in the dark. Several somethings.'); }],
    [P.rline,()=>{ say('rose','dc3'); }],
    [P.tgo,()=>{ S('step'); setMessage('Tom comes over and scoops her up.'); }],
    [P.lift,()=>{ S('boing'); }],
    [P.hold,()=>{ S('chime2'); setMessage('Tom holds Lamby up like a night-light.'); }],
    [P.tline,()=>{ say('tom','dcrose3'); }],
    [G0,()=>{ S('levelChime'); }],
    [P.glow,()=>{ S('fanfare'); word('GLOW!',LF.x,40,GOLD,5,.9); setMessage('Lamby glows brighter. And brighter.'); }],
    [G1-150,()=>{ word('SHOO!',GR.x,66,'#fffbe6',4,.7); setMessage('The dark runs away, and the monsters run with it.'); }],
    [P.back,()=>{ S('step'); setMessage('They creep back in. It\'s much less scary with the light on.'); }],
    [P.backEnd,()=>{ S('chime2'); for(const o of o3) { scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:40,c:PINK,w:3}); for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(j-1)*18,y1:o.q.top-26,arc:10,spin:false,r:6,t:-j*.06,dur:.7}); }
      landHit(100); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sT.x,mid:sT.b-TH}:ST.unit(p)); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
    ['hf',o3.length?Math.min(...o3.map(o=>o.t)):G1],
    [P.end,'end',()=>{ for(const o of o3) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Lamby is very brave. Lamby says goodnight.'; }]];
  o3.forEach(o=>steps.push([o.t,()=>{ S('whoosh'); S('squeak'); }]));
  ST.play(E2,steps);
};
// ---------- Elevator Cheat (Tom + Amy, Director's Cut of tier 3) ----------
// Same glass tower, inside this time: a cutaway with a zigzag stairwell on the left and a glass elevator on the right. Both
// walk toward it (shrinking into the distance). Amy starts her stopwatch and sprints up the stairs; Tom presses the button
// and rides up calmly with elevator music. Amy is on the roof first. DING: the doors open and Tom steps out, rested. Amy
// holds up the stopwatch, yells, and stomps three times; a crack runs along the roof ledge over the monsters and it caves in
// on them. Effects (no damage, no kindness, like Spot Me): the party's next turns come sooner, PEP +30% for 2 turns, Amber melts.
const stopwatch=(x,y,s,txt)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s);
  R(-2,-12,4,3,OUT); R(-1,-10,2,3,'#c8ccd4'); R(5,-9,3,3,OUT); EO(0,0,9,9,'#e8e4dc'); E(0,0,7,7,'#fbfaf4');
  if(txt) { R(-7,-2,14,6,'#1c2430'); label(txt,0,0,'#9be39a',1); } else Ln(0,0,4,-4,1.5,RED);
  gfx.restore(); };
const angerVein=(x,y,s)=>{ gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.lineCap='round';
  for(const [dx,dy,a0] of [[-1,-1,0],[1,-1,Math.PI*.5],[1,1,Math.PI],[-1,1,Math.PI*1.5]]) { gfx.beginPath(); gfx.arc(x+dx*s,y+dy*s,s*.9,a0,a0+Math.PI*.5); gfx.stroke(); } };
B2_TOMBO_ANIM.amy3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale,K=.5;
  const wx=cl(GR.x1+84,GR.x1+70,400),gb=cl(GR.base-34,236,284),roofY=118,ex0=wx-52,ex1=wx+52,fh=(gb-roofY)/3;
  const xL=Math.max(10,GR.x0-18),cw=40,ch=Math.round(TH*K+12),carX=wx+27,ax=wx-30,txR=wx+12;
  const P={walk:800,click:900,btn:950,tline:1000,open0:1100,go:1300,inn:1350,close0:1650,ride0:1950,atop:3300,ride1:4000,open1:4050,out:4250,
    aline:4500,s1:5150,s2:5400,s3:5650,cave:5700,apply:6500,home:6900,end:7600};
  const land=o3.map((o,i)=>P.cave+i*70+330);
  const fy=i=>gb-i*fh;                                     // stairwell floor i (0 ground .. 3 roof)
  const climbK=ms=>seg(ms,P.go,P.atop);
  const carY=ms=>lerp(gb,roofY,ez(seg(ms,P.ride0,P.ride1)));
  const doorK=ms=>ms<P.close0?ez(seg(ms,P.open0,P.open0+220)):(ms<P.open1?1-ez(seg(ms,P.close0,P.close0+250)):ez(seg(ms,P.open1,P.open1+220)));
  const sT={x:0,b:gb,s:1},sA={x:0,b:gb,s:1};
  // Amy: walks to the stair door (shrinking), sprints the three flights, waits on the roof, yells and stomps, hops home
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=ax,y=gb,f=sp.idle,sc=K;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,wx-40,k); y=lerp(c.origBase,gb,k); sc=lerp(1,K,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.go) { x=wx-40; f=ms>P.click-60?sp.aim:sp.idle; }
    else if(ms<P.atop) { const q=climbK(ms)*3,i=Math.min(2,Math.floor(q)),u=q-i,l=wx-44,r=wx-12,dir=i%2?-1:1;
      x=i%2?lerp(r,l,u):lerp(l,r,u); y=lerp(fy(i),fy(i+1),u); f=runFr(sp,c.t*1.4,dir); }
    else if(ms<P.home) { const k=ez(seg(ms,P.atop,P.atop+300)); x=lerp(wx-12,ax,k); y=roofY;
      const st=[P.s1,P.s2,P.s3].find(t=>ms>t-170&&ms<t+120);
      if(st) { const u=seg(ms,st-170,st); y=roofY-(ms<st?Math.sin(u*Math.PI*.5)*10:0); f=ms<st?mirrorRowsCached(sp,'act'):(sp.kneel); }
      else if(ms<P.out) { f=mirrorRowsCached(sp,'hip'); y-=ms>P.atop+400&&(Math.floor(ms/180)%2)?1.5:0; }
      else if(ms<P.aline) f=mirrorRowsCached(sp,'aim');
      else if(ms<P.cave+300) f=(Math.floor((ms-P.aline)/320)%2)?mirrorRowsCached(sp,'expr'):mirrorRowsCached(sp,'act');
      else f=mirrorRowsCached(sp,'hip'); }
    else { const k=ez(seg(ms,P.home,P.home+700)); x=lerp(ax,c.origX,k); y=lerp(roofY,c.origBase,k)-Math.sin(k*Math.PI)*30; sc=lerp(K,1,k); f=k<1?sp.celeb:sp.idle; }
    sA.x=x; sA.b=y; sA.s=sc; return {cx:x,base:y,frame:f,sc,noShadow:ms>P.walk-200&&ms<P.home+600}; });
  // Tom: walks to the elevator (shrinking), presses the button, rides up in the glass car, steps out onto the roof
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=carX,y=gb,fk='idle',sc=K;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,wx+46,k); y=lerp(c.origBase,gb,k)+ffHop(ms,0,P.walk); sc=lerp(1,K,k); }
    else if(ms<P.inn) { x=wx+46; fk=ms>P.btn-60&&ms<P.btn+250?'act':'idle'; }
    else if(ms<P.out) { x=lerp(wx+46,carX,ez(seg(ms,P.inn,P.inn+250))); y=ms<P.ride0?gb:carY(ms); if(ms>P.ride0&&ms<P.ride1) y-=Math.abs(Math.sin(ms/260))*1.2; fk=ms>P.open1?'celeb':'idle'; }
    else if(ms<P.home) { x=lerp(carX,txR,ez(seg(ms,P.out,P.out+300))); y=roofY; fk=ms<P.aline?'celeb':(ms<P.apply?'expr':'idle'); }
    else { const k=ez(seg(ms,P.home,P.home+700)); x=lerp(txR,c.origX,k); y=lerp(roofY,c.origBase,k)-Math.sin(k*Math.PI)*30; sc=lerp(K,1,k); fk=k<1?'celeb':'idle'; }
    sT.x=x; sT.b=y; sT.s=sc; return {cx:x,base:y,frame:sp[fk],sc,noShadow:ms>P.walk-200&&ms<P.home+600}; });
  const show=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
  const towerK=ms=>ez(seg(ms,150,850))*(1-ez(seg(ms,P.home,P.home+600)));
  const intact=ms=>ms<P.cave;
  // Behind everyone: dusk; the tower cutaway (stairwell, glass shaft, the elevator car), the roof and its ledge over the monsters
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#1c2a4a',.5);
    const tk=towerK(ms); if(tk<=0) return; const top=lerp(gb+6,roofY-ch-8,tk);
    gfx.save(); gfx.beginPath(); gfx.rect(0,top-10,576,gb+16-top); gfx.clip();
    R(ex0-3,roofY-3,ex1-ex0+6,gb+7-roofY,OUT); R(ex0,roofY,50,gb+4-roofY,'#33597d'); R(wx+2,roofY,ex1-wx-2,gb+4-roofY,'#24486a'); R(wx-2,roofY,4,gb+4-roofY,'#1b3a58');
    for(let i=1;i<3;i++) R(ex0,fy(i)-2,50,4,'#1b3a58');
    for(let i=0;i<3;i++) { const l=wx-46,r=wx-8,y0=fy(i),y1=fy(i+1),a={x:i%2?r:l,y:y0},b={x:i%2?l:r,y:y1};
      Ln(a.x,a.y,b.x,b.y,4,'#c8b07a'); for(let j=1;j<6;j++) { const q=j/6; R(lerp(a.x,b.x,q)-2,lerp(a.y,b.y,q)-3,4,2,'#e8d4a0'); } }
    for(const xr of [wx+6,ex1-4]) R(xr-1,roofY-ch-6,2,gb+10-roofY+ch,'#8aa4bc');
    // the machine hut on the roof over the shaft
    R(wx+2,roofY-ch-8,ex1-wx,ch+8,'#1b3a58'); R(wx+5,roofY-ch-5,ex1-wx-6,ch+5,'#2a4e70');
    // the roof, and the ledge that reaches out over the monsters until it caves in
    RO(ex0-4,roofY-4,ex1-ex0+8,6,'#5a6a7a');
    if(intact(ms)&&tk>.95) { RO(xL,roofY-4,ex0-4-xL,8,'#6c7a88'); R(xL,roofY-4,ex0-4-xL,2,'#9aa8b6'); for(let x=xL+16;x<ex0-8;x+=34) R(x,roofY+4,4,8,'#5a6a7a'); }
    // the car (cable up to the hut), lit inside
    const cy=ms<P.ride0?gb:(ms<P.out?carY(ms):roofY); Ln(carX,roofY-ch-6,carX,cy-ch,1.5,'#cfd8e2');
    RO(carX-cw/2,cy-ch,cw,ch,'#cfd6de'); R(carX-cw/2+3,cy-ch+3,cw-6,ch-5,'#f6f0dc'); R(carX-cw/2+3,cy-ch+3,cw-6,3,'#fffbe6');
    gfx.restore();
    // floor counters: Amy's over the stairwell, Tom's over the hut
    if(tk>.6) { const fa=ms<P.go?1:Math.min(60,Math.round(lerp(1,60,climbK(ms)))),ft=ms<P.ride0?1:Math.min(60,Math.round(lerp(1,60,ez(seg(ms,P.ride0,P.ride1)))));
      label((fa<10?'0':'')+fa+'F',wx-27,Math.min(gb-12,roofY+10),fa>=60?GOLD:'#fff6dc',2); label((ft<10?'0':'')+ft+'F',carX,roofY-ch-1,ft>=60?GOLD:'#fff6dc',1); }
    gfx.globalAlpha=1; }});
  // In front: the glass doors, the call button, music notes, the stopwatch, the crack, the falling roof and the squashed monsters
  const slabs=o3.map((o,i)=>({o,w:Math.min(54,o.q.w*.85),x:o.q.x,t:P.cave+i*70,land:land[i],rot:(i%2?.12:-.1)}));
  const bits=[0,1,2,3,4].map(j=>({x:lerp(xL+10,ex0-12,j/4),t:P.cave+30+j*45,w:10+j%3*5,sp:(j%2?1:-1)*(3+j)}));
  const floorY=Math.max(GR.base,gb)+2;
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    // the glass doors on the car
    if(ms>P.walk-100&&ms<P.home+200) { const cy=ms<P.ride0?gb:(ms<P.out?carY(ms):roofY),d=doorK(ms)*(cw/2-3),a=towerK(ms);
      gfx.save(); gfx.beginPath(); gfx.rect(carX-cw/2,cy-ch,cw,ch); gfx.clip(); gfx.globalAlpha=a;
      for(const s of [-1,1]) { const x0=s<0?carX-cw/2-d:carX+d; gfx.globalAlpha=a*.32; R(x0,cy-ch,cw/2,ch,'#9fd8ff'); gfx.globalAlpha=a; R(x0+(s<0?cw/2-2:0),cy-ch,2,ch,'#8a96a4'); R(x0+4,cy-ch+6,2,ch-14,'#e8f8ff'); }
      gfx.restore(); gfx.globalAlpha=1; }
    // the call button by the elevator
    if(ms>P.walk-100&&ms<P.ride0) { const lit=ms>P.btn; RO(ex1+4,gb-34,8,12,'#2a2e36'); E(ex1+8,gb-28,2.5,2.5,lit?'#ffd166':'#6a707a'); }
    // elevator music from the car while it rides
    if(ms>P.ride0&&ms<P.ride1+300) for(let j=0;j<3;j++) { const q=((ms-P.ride0)/900+j/3)%1,cy=carY(ms); gfx.globalAlpha=Math.sin(q*Math.PI)*.95;
      note8(carX+18+Math.sin(q*6+j)*6,cy-ch-6-q*30,2,[PINK,GOLD,'#8fd0ff'][j],Math.sin(ms/200+j)*.3); } gfx.globalAlpha=1;
    // speed lines under Amy on the stairs
    if(ms>P.go&&ms<P.atop) for(let j=0;j<3;j++) { const q2=((ms/140)+j/3)%1; gfx.globalAlpha=.7*(1-q2); Ln(sA.x-6+j*5,sA.b+2+q2*12,sA.x-6+j*5,sA.b+8+q2*12,2,'#dff0fa'); } gfx.globalAlpha=1;
    // the stopwatch: clicked at the start, held up on the roof
    if(ms>P.click&&ms<P.go+200) stopwatch(sA.x-14,sA.b-AH*K*.6,.9,null);
    if(ms>P.out+350&&ms<P.cave+500) { const s=ez(seg(ms,P.out+350,P.out+600)); stopwatch(sA.x+14,sA.b-AH*K*.95-6,1.5*s,'0:58'); }
    // her anger vein while she yells and stomps
    if(ms>P.aline+200&&ms<P.cave+500) { gfx.globalAlpha=.6+.4*Math.sin(ms/90); angerVein(sA.x+4,sA.b-AH*K-6,3.2); gfx.globalAlpha=1; }
    // the crack runs from her feet along the ledge, a third of the way per stomp
    if(ms>P.s1&&intact(ms)) { const n=ms>P.s3?3:(ms>P.s2?2:1),len=(ax-xL)*n/3,x1=ax-len; gfx.strokeStyle='#1a1e24'; gfx.lineWidth=2.5; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(ax,roofY-3);
      for(let x=ax-8,j=0;x>=x1;x-=10,j++) gfx.lineTo(x,roofY-2+(j%2?4:-1)); gfx.stroke(); }
    // the ledge caves in: one slab per monster lands on its head (they stay there, squashed, until home); small bits fall past
    for(const sl of slabs) { if(ms<sl.t||sl.o.f.dead) continue; const q=sl.o.q,top=q.top-6;
      let y,rot; if(ms<sl.land) { const p=seg(ms,sl.t,sl.land); y=lerp(roofY,top,p*p); rot=sl.rot*p*2; } else { y=top+(1-cl((ms-sl.land)/120))*-4; rot=sl.rot; }
      const a=1-ez(seg(ms,P.home,P.home+400)); if(a<=0) continue; gfx.globalAlpha=a; gfx.save(); gfx.translate(sl.x,y); gfx.rotate(rot); RO(-sl.w/2,-6,sl.w,10,'#6c7a88'); R(-sl.w/2,-6,sl.w,2,'#9aa8b6'); R(-sl.w/2+6,-2,sl.w*.3,1.5,'#4a5664'); gfx.restore();
      if(ms>sl.land) { const sc2=ms<P.home?.8+.03*Math.sin(ms/90):lerp(.8,1,ez(seg(ms,P.home,P.home+400))); sl.o.f.fsc=sc2; sl.o.f.oy=q.h/2*(1-sc2); sl.o.f.spin=0; sl.o.f.spinAt=performance.now();
        if(ms<P.home) for(let j=0;j<3;j++) { const an=ms/260+j*2.1; star(sl.x+Math.cos(an)*q.w*.4,top-14+Math.sin(an)*5,3.5,j%2?GOLD:'#fffbe6'); }
        if(ms<sl.land+500) { const d=seg(ms,sl.land,sl.land+500); gfx.globalAlpha=(1-d)*.6; for(let j=0;j<5;j++) E(sl.x+(j-2)*sl.w*.28*(1+d),top+2-d*8,3+d*4,2.5+d*2,'#9aa2ac'); } }
      gfx.globalAlpha=1; }
    for(const b of bits) { if(ms<b.t||ms>b.t+700) continue; const p=seg(ms,b.t,b.t+500),y=lerp(roofY,floorY,p*p); gfx.globalAlpha=1-seg(ms,b.t+450,b.t+700);
      gfx.save(); gfx.translate(b.x+b.sp*p*6,y); gfx.rotate(p*b.sp); RO(-b.w/2,-3,b.w,6,'#6c7a88'); gfx.restore(); gfx.globalAlpha=1; }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Same tower. Inside, this time.'); B2.aim=null; S('click'); }],
    [300,()=>{ S('rumble'); }],
    [P.click,()=>{ S('click'); setMessage('Amy takes the stairs. Tom finds a button.'); }],
    [P.btn,()=>{ S('ding'); }],
    [P.tline,()=>{ say('tom','dcamy3'); }],
    [P.go,()=>{ S('whoosh'); word('GO!',wx-27,gb-AH*K-24,GOLD,4,.6); }],
    [P.close0,()=>{ S('step'); }],
    [P.ride0,()=>{ S('chime2'); setMessage('Sixty floors of stairs. Sixty floors of elevator music.'); }],
    [P.atop,()=>{ S('fanfare'); word('1ST!',ax,40,GOLD,4,.8); setMessage('Amy is on the roof first. Of course she is.'); }],
    [P.ride1,()=>{ S('ding'); word('DING!',carX+6,66,'#fff6dc',4,.45); }],
    [P.out,()=>{ setMessage('Tom steps out. Rested. Amy holds up her stopwatch.'); S('click'); }],
    [P.aline,()=>{ say('amy','dc3'); }],
    [P.cave,()=>{ S('crash'); S('rumble'); battle.shakeEnemy=.5; word('CRUNCH!',Math.max(80,GR.x),40,'#dfe6f2',5,.9); setMessage('She stomps so hard the roof caves in. Right on the monsters.'); }],
    ['hf',land.length?land[0]:P.cave],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('Everyone hurries up. Amy is still timing them.');
      for(const S0 of [sT,sA]) scene('glow',.9,{x:S0.x,y:S0.b-(S0===sT?TH:AH)*S0.s*.45,rx:38*S0.s+8,ry:52*S0.s+8,c:'#9be39a',a:.35});
      for(const p of party) if(p!==tom&&p!==pt) glowOn(p); }],
    [P.home,()=>{ S('boing'); }],
    [P.end,'end',()=>{ for(const o of o3) { o.f.fsc=0; o.f.oy=0; o.f.ox=0; o.f.spin=0; } return (E2.result||'')+' Amy is filing a complaint with the building.'; }]];
  [P.s1,P.s2,P.s3].forEach((t,i)=>steps.push([t,()=>{ S('thud'); battle.shakeEnemy=.2+i*.1; if(i<2) word('STOMP!',lerp(ax,xL,(i+.5)/3),i?66:40,CREAM,4,.35); }]));   // the third stomp is the CRUNCH
  slabs.forEach(sl=>steps.push([sl.land,()=>{ S('thud'); S('bonk'); ST.jolt(sl.o.f,.4); scene('tb_rings',.6,{x:sl.x,y:sl.o.q.top,r:46,c:'#dfe6f2',w:3}); }]));
  ST.play(E2,steps);
};

// ---------- Feast on Jefferson Park (Tom + Deedee, Director's Cut of tier 3) ----------
// Block party on Jefferson Park at dusk. String lights blink on across the sky, a long party table drops in, and the
// neighbors' dishes fly in one after another (sourdough, gumbo, pupusas, rhubarb crisp). Tom sets each one down neatly;
// Deedee immediately moves every dish somewhere else, then wipes the table so hard the plates jump. Tom tells her to sit;
// she sits for exactly one beat, pops up and straightens the gumbo again. Then the smell of the feast rolls left over every
// monster (they warm right up, hearts). Effects (no damage): fallen friends up at 35%, party heals 60% and loses its
// debuffs, 3 Warm Crusts.
const gumboPot=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); R(-16,-9,5,3,OUT); R(11,-9,5,3,OUT);
  gfx.beginPath(); gfx.ellipse(0,-6,13,12,0,0,Math.PI); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#3a3f4a'; gfx.fill();
  EO(0,-6,13,3.5,'#8a4a1e'); E(-4,-7,3,1.2,'#c87a3a'); E(4,-6,2,1,'#3a8a3a'); E(-1,-5,1.6,1,'#f0d070'); gfx.restore(); };
const pupusaPlate=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); EO(0,-2,14,4,'#f4f0e6');
  for(const [dx,dy] of [[-5,-4],[5,-4],[0,-7]]) { EO(dx,dy,5.5,2.4,'#e8c48a'); R(dx-2,dy-1,1.5,1.5,'#9a6a3a'); R(dx+2,dy,1.5,1.5,'#9a6a3a'); }
  E(9,-4,3,1.5,'#9ad06a'); gfx.restore(); };
const crispPan=(x,y,s=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); RO(-13,-9,26,9,'#b8bec8');
  R(-11,-8,22,6,'#c84a5a'); for(let j=0;j<7;j++) R(-10+j*3,-9+(j%2),2.5,2,'#e8c070'); R(-6,-6,2,2,'#ff8a9a'); gfx.restore(); };
const breadDish=(x,y,s=1)=>boule(x,y-8*s,.85*s,false);
const DISHES=[breadDish,gumboPot,pupusaPlate,crispPan];
const stringLights=(ms,t0,k)=>{ if(k<=0) return; const W=596;
  for(const [y0,sag,ph] of [[26,26,0],[30,40,.5]]) { gfx.globalAlpha=k; gfx.strokeStyle='#2a2430'; gfx.lineWidth=1.5; gfx.beginPath();
    for(let x=-10;x<=W;x+=12) { const y=y0+sag*Math.sin(Math.PI*cl((x+10)/W)); x>-10?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke();
    for(let j=0;j<16;j++) { const x=-10+(j+ph)*W/16,y=y0+sag*Math.sin(Math.PI*cl((x+10)/W))+3,on=ms>t0+j*55;
      if(on) { gfx.globalAlpha=k*(.28+.08*Math.sin(ms/200+j)); E(x,y+2,8,8,'#ffd27a'); gfx.globalAlpha=k; }
      E(x,y+2,2.6,3.2,on?['#ffd27a','#ffb0a0','#fff2c0','#9fe0c0'][j%4]:'#5a5060'); } }
  gfx.globalAlpha=1; };
B2_TOMBO_ANIM.deedee3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const fc=cl(GR.x1+110,GR.x1+90,420),by=cl(Math.max(GR.base-16,T.base+20),236,292),dx=fc-40,tx=fc+40;
  const tL=fc-78,tR=fc+70,tY=Math.round(by-TH*.42),SL=[fc-52,fc-18,fc+16,fc+50];
  const W0=5500,W1=6200;                                    // the smell of the feast rolls left from the table
  o3.forEach(o=>{ o.t=Math.round(W0+cl((tL-o.q.x)/(tL-10))*(W1-W0)); });
  const lastW=o3.length?Math.max(...o3.map(o=>o.t)):W0+400;
  const P={lights:250,table:450,walk:700,d0:800,dGap:220,rear0:1700,dline:1600,wipe0:2800,wipe1:3700,tline:3900,sit:4500,pop:5000,fix:5150,
    w0:W0,apply:Math.max(lastW+400,W1+250),home:Math.max(lastW+800,W1+650),end:Math.max(lastW+1500,W1+1350)};
  // dish i: thrown in from the upper right into slot i; then Deedee moves it to slot PERM[i] (hop); the wipe lifts each in turn
  const PERM=[2,0,3,1],REAR=[0,1,2,3].map(i=>P.rear0+i*200);
  const dishAt=(i,ms)=>{ const t0=P.d0+i*P.dGap; if(ms<t0) return null;
    if(ms<t0+380) { const q=seg(ms,t0,t0+380); return {x:lerp(600,SL[i],q),y:lerp(70,tY,q*q)-Math.sin(q*Math.PI)*40,s:1}; }
    let x=SL[i],y=tY; const r=REAR[i];
    if(ms>r) { const q=ez(seg(ms,r,r+260)); x=lerp(SL[i],SL[PERM[i]],q); y-=Math.sin(seg(ms,r,r+260)*Math.PI)*22; }
    if(i===1&&ms>P.fix) { const q=ez(seg(ms,P.fix,P.fix+260)); x=lerp(SL[PERM[i]],(SL[1]+SL[2])/2,q); y-=Math.sin(seg(ms,P.fix,P.fix+260)*Math.PI)*16; }
    if(ms>P.wipe0&&ms<P.wipe1) { const tw=towelX(ms); if(Math.abs(tw-x)<16) y-=(16-Math.abs(tw-x))*.8; }
    return {x,y,s:1}; };
  // the towel sweeps along the table, back and forth
  const towelX=ms=>{ const q=seg(ms,P.wipe0,P.wipe1)*3; return lerp(tL+12,tR-10,q%2<1?q%1:1-q%1); };
  const sT={x:T.x,b:T.base},sD={x:dx,b:by};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,fk='idle';
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { fk=ms>P.d0+100&&ms<P.d0+4*P.dGap+250?'act':(ms>P.rear0&&ms<P.wipe1?'expr':(ms>P.tline&&ms<P.tline+700?'act':(ms>P.pop&&ms<W0?'expr':(ms>=W0&&ms<P.apply+400?'celeb':'idle')))); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k)+ffHop(ms,P.home,P.home+650); fk=k<1?'flip':'idle'; }
    sT.x=x; sT.b=y; return {cx:x,base:y,frame:sp[fk]}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=dx,y=by,f=sp.flip;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,dx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) {
      if(ms>P.rear0-100&&ms<P.rear0+900) f=(Math.floor(ms/200)%2)?mirrorRowsCached(sp,'act'):sp.flip;
      else if(ms>P.wipe0&&ms<P.wipe1) { f=mirrorRowsCached(sp,'act'); x=dx+Math.sin(ms/70)*3; }
      else if(ms>P.sit&&ms<P.pop) f=sp.sit||sp.kneel;
      else if(ms>=P.pop&&ms<P.pop+300) { f=sp.celebFlip||sp.flip; y-=Math.sin(seg(ms,P.pop,P.pop+300)*Math.PI)*16; }
      else if(ms>=P.fix-50&&ms<P.fix+350) f=mirrorRowsCached(sp,'act');
      else if(ms>=W0&&ms<P.apply+400) f=sp.celebFlip||sp.flip;
      else f=ms>P.tline?mirrorRowsCached(sp,'hip'):sp.flip; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(dx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sD.x=x; sD.b=y; return {cx:x,base:y,frame:f}; });
  const show=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
  const tableK=ms=>ez(seg(ms,P.table,P.table+350))*(1-ez(seg(ms,P.home,P.home+500)));
  // Behind everyone: dusk over the park, a warm horizon, string lights blinking on one by one
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#2a1840',.5);
    gfx.globalAlpha=k*.35; R(0,by-70,576,90,'#ff9a5a'); gfx.globalAlpha=1;
    const w=ez(seg(ms,W0,W1))*(1-ez(seg(ms,P.apply,P.end-100))); if(w>0) dim(w,'#ffd98a',.16);
    stringLights(ms,P.lights,k); }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    // the party table: a sunny cloth with white dots, dropped in from above; the cloth hides the pair's legs
    const tk=tableK(ms); if(tk>0) { const yo=(1-tk)*-60; gfx.globalAlpha=Math.min(1,tk*1.5);
      RO(tL,tY+yo,tR-tL,by-2-tY,'#f2c94c'); R(tL,tY+yo,tR-tL,4,'#fff2c0');
      for(let x=tL+8,j=0;x<tR-4;x+=14,j++) for(let y=tY+yo+12+(j%2)*7;y<by-6+yo;y+=14) E(x,y,1.8,1.8,'#fff6dc');
      for(let x=tL;x<tR;x+=10) E(x+5,by-2+yo,5,2.5,'#f2c94c');
      gfx.globalAlpha=1; }
    // the dishes, with steam
    for(let i=0;i<4;i++) { const d=dishAt(i,ms); if(!d||ms>P.home+500) continue; gfx.globalAlpha=1-seg(ms,P.home,P.home+500); DISHES[i](d.x,d.y,d.s*1.2);
      if(ms>P.d0+i*P.dGap+380) for(let j=0;j<2;j++) { const q=((ms/800)+j/2+i*.3)%1; gfx.globalAlpha=(1-q)*.7*(1-seg(ms,P.home,P.home+500)); gfx.strokeStyle='#fff6dc'; gfx.lineWidth=1.5; gfx.beginPath();
        for(let s=0;s<=5;s++) { const yy=d.y-14-q*26-s*3,xx=d.x+(j?4:-4)+Math.sin(s+ms/150+i)*2.5; s?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke(); }
      gfx.globalAlpha=1; }
    // the towel: in her hand, sweeping the table; sparkles where it has been
    if(ms>P.wipe0-150&&ms<P.wipe1+150) { const x=ms<P.wipe0?sD.x+18:(ms>P.wipe1?sD.x+18:towelX(ms)); towel(x-9,tY-6,Math.sin(ms/60)*.35);
      if(ms>P.wipe0) for(let j=0;j<4;j++) { const q=((ms/300)+j/4)%1; gfx.globalAlpha=Math.sin(q*Math.PI); star(lerp(tL+10,tR-10,(j*.27+ms/2400)%1),tY-3,2.5,'#fffbe6'); } gfx.globalAlpha=1; }
    // the smell of the feast: warm golden ribbons rolling left over the monsters, with little food bits riding them
    if(ms>W0-150&&ms<P.apply+300) { const q=seg(ms,W0-150,W1),fade=1-seg(ms,W1,P.apply+300);
      for(let j=0;j<4;j++) { const yb=tY-20-j*26+Math.sin(j*1.7)*6,xr=tL-4,xl=lerp(xr,-20,ez(q));
        gfx.globalAlpha=fade*.75; for(const [w,c] of [[7,'#ffe9a0'],[3,GOLD]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath();
          for(let x=xr,s=0;x>=xl;x-=8,s++) { const y=yb+Math.sin(x/26+ms/160+j)*7; s?gfx.lineTo(x,y):gfx.moveTo(x,y); } gfx.stroke(); }
        gfx.globalAlpha=fade; const fx2=xl+10,fy2=yb+Math.sin(fx2/26+ms/160+j)*7; if(j===0) breadDish(fx2,fy2+8,.5); else if(j===2) E(fx2,fy2,4,2,'#e8c48a'); else star(fx2,fy2,3,'#fffbe6'); }
      gfx.globalAlpha=1; }
    // the monsters lean toward the smell as it reaches them
    for(const o of o3) { const f=o.f; if(ms<o.t-200||ms>P.end-60) continue; const lean=ez(seg(ms,o.t-200,o.t+200))*(1-ez(seg(ms,P.apply,P.home)));
      f.ox=lean*10; f.oy=-Math.abs(Math.sin(seg(ms,o.t,o.t+600)*Math.PI*2))*6; f.spin=-lean*.08; f.spinAt=performance.now(); }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Block party on Jefferson Park.'); B2.aim=null; S('click'); }],
    [P.lights,()=>{ S('chime2'); }],
    [P.table,()=>{ S('thud'); setMessage('The string lights come on. The neighbors bring everything.'); }],
    [P.dline,()=>{ say('deedee','dc3'); }],
    [P.rear0,()=>{ S('whoosh'); setMessage('Tom sets every dish down just so. Deedee moves every dish.'); }],
    [P.wipe0,()=>{ S('squeak'); word('WIPE!',(tL+tR)/2,Math.max(60,tY-DH-30),'#cfeeff',4,.6); }],
    [P.tline,()=>{ say('tom','dcdeedee3'); }],
    [P.sit,()=>{ S('creak'); setMessage('Deedee sits down. For one second.'); }],
    [P.pop,()=>{ S('boing'); word('NOPE.',sD.x,Math.max(60,by-DH-40),CREAM,4,.6); }],
    [P.fix,()=>{ S('ding'); }],
    [W0,()=>{ S('levelChime'); word('FEAST!',(tL+tR)/2,40,GOLD,5,1); setMessage('The smell of the feast rolls over every monster.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('Everybody eats. Deedee does the dishes.'); for(const p of party) { const q=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sD.x,mid:sD.b-DH*.5}:ST.unit(p)); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c:GOLD,a:.4}); } }],
    ['hf',o3.length?Math.min(...o3.map(o=>o.t)):W0],
    [P.end,'end',()=>{ for(const o of o3) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Deedee is already doing the dishes.'; }]];
  for(let i=0;i<4;i++) steps.push([P.d0+i*P.dGap+380,()=>{ S('thud'); }]);
  REAR.forEach(t=>steps.push([t,()=>{ S('step'); }]));
  o3.forEach((o,i)=>steps.push([o.t,()=>{ S('chime2'); ST.jolt(o.f,.25); scene('tb_rings',.6,{x:o.q.x,y:o.q.mid,r:40,c:PINK,w:3}); word('YUM!',o.q.x,i%2?66:40,PINK,4,.4);
    for(let j=0;j<3;j++) battle.props.push({kind:'dheart',x0:o.q.x,y0:o.q.mid,x1:o.q.x+(j-1)*18,y1:o.q.top-26,arc:10,spin:false,r:6,t:-j*.06,dur:.7});
    if(o.t===lastW&&o3.indexOf(o)===o3.findIndex(x=>x.t===lastW)) landHit(100); }]));   // a kind Tombo's first landHit lands everything: only the last one calls it
  if(!o3.length) steps.push([W1,()=>landHit(100)]);
  ST.play(E2,steps);
};
// ---------- Pepper Contest (Tom + Boppy, Director's Cut of tier 3) ----------
// Father and son face off over a little table and a bowl of hot peppers, one round after another: red, orange, green,
// then a glowing black one. Tom goes redder every round and sweats a puddle; Boppy stays calm and says that one was mild.
// Then Boppy's stomach rumbles. Tom hops in behind him, both lean back, and they breathe fire at the same time across the
// row. Effects: big Cozy hit on a row (GRIT down 3 turns, one buff stolen from each), Boppy's Heartburn +1.
const PEPC=[['#e0302a','#ff8a6a'],['#f08a1a','#ffc070'],['#3aa040','#9ae07a'],['#2a1830','#b07ae0']];
const hotPepper=(x,y,s,rot,i)=>{ const [c,h]=PEPC[i]; gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  if(i===3) { const a0=gfx.globalAlpha; gfx.globalAlpha=a0*(.35+.15*Math.sin(performance.now()/90)); E(0,0,13,9,'#c08aff'); gfx.globalAlpha=a0; }
  gfx.beginPath(); gfx.moveTo(-8,0); gfx.quadraticCurveTo(-2,-5,6,-3); gfx.quadraticCurveTo(9,0,6,2); gfx.quadraticCurveTo(-2,4,-8,0); gfx.closePath();
  gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); E(-2,-1.6,3,.9,h);
  Ln(6,-1,10,-5,2.6,'#3a8a3a'); gfx.restore(); };
// pepper j in the bowl (j 0 at the bottom); it belongs to round floor((7-j)/2), so the top two go first
const FLUSH=new Map();   // per palette: only the skin colors, pushed to red (everything else transparent)
const PEPB=[[-6,-5,-.5],[5,-5,.6],[0,-7,.2],[-8,-9,-.2],[7,-9,.8],[-2,-11,-.6],[4,-13,.3],[-5,-14,.1]];
B2_TOMBO_ANIM.boppy3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),row=(E2.targets||[]).filter(t=>t.side==='foe'&&b2Alive(t)),tg=row.length?row:list,RW=ST.group(tg),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,TW=tsp.idle[0].length*tsp.scale,BH=bsp.idle.length*bsp.scale,BW=bsp.idle[0].length*bsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+44,bx=mx-44,tY=Math.round(by-TH*.4);
  const fbx=bx-10,ftx=bx+10,fty=by-12;                     // the fire: Boppy steps left, Tom hops in just behind him
  const R0=900,RG=560,FI=5250,order=tg.map(f=>({f,q:ST.foe(f)})).sort((a,b)=>b.q.x-a.q.x);
  order.forEach((o,i)=>{ o.t=Math.round(FI+160+Math.max(0,fbx-o.q.x)*.45+i*40); });
  const last=order.length?order[order.length-1].t:FI+300;
  const rT=i=>R0+i*RG;                                       // round i: Boppy bites at rT(i), Tom 160 ms later
  const P={walk:650,bline:R0+RG+300,tline:R0+3*RG+560,rumb:4300,hop0:4550,hop1:4900,inh:4900,fire:FI,fireEnd:last+450,
    apply:last+300,relief:last+650,home:last+1300,end:last+2000};
  const taken=ms=>{ let n=0; for(let i=0;i<4;i++) if(ms>rT(i)-40) n++; return n; };
  const redT=ms=>{ let k=0; for(let i=0;i<4;i++) k+=ez(seg(ms,rT(i)+380,rT(i)+620))*.25; return k*(1-seg(ms,P.fireEnd,P.fireEnd+600)); };
  const redB=ms=>ez(seg(ms,P.rumb,P.inh))*(1-seg(ms,P.fireEnd,P.fireEnd+600));
  const sT={x:T.x,b:by,f:tsp.idle,rot:0},sB={x:bx,b:by,f:bsp.flip,rot:0};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { const bite=[0,1,2,3].some(i=>ms>rT(i)+120&&ms<rT(i)+420),eat=taken(ms-160);
      if(ms<P.hop0) { f=bite||(ms>P.tline-80&&ms<P.tline+500)?sp.act:(eat>=2?sp.expr:sp.idle); if(eat>=3&&!bite) x=tx+Math.sin(ms/45)*1.2; }
      else if(ms<P.hop1) { const k=ez(seg(ms,P.hop0,P.hop1)); x=lerp(tx,ftx,k); y=lerp(by,fty,k)-Math.sin(k*Math.PI)*30; f=sp.celeb; }
      else { x=ftx; y=fty; if(ms<P.fire) { rot=.2*ez(seg(ms,P.inh,P.fire-60)); } else if(ms<P.fireEnd) { f=sp.act; rot=-.1+Math.sin(ms/30)*.02; } else f=ms<P.relief+600?sp.expr:sp.idle; } }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(ftx,c.origX,k); y=lerp(fty,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; sT.rot=rot; return {cx:x,base:y,frame:f,rot}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,actR=mirrorRowsCached(sp,'act'),hipR=mirrorRowsCached(sp,'hip'); let x=bx,y=by,f=sp.flip,rot=0;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,bx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { const bite=[0,1,2,3].some(i=>ms>rT(i)-40&&ms<rT(i)+260);
      if(ms<P.rumb) f=bite?actR:(ms>P.bline-60&&ms<P.bline+900?hipR:sp.flip);
      else if(ms<P.hop0) { f=hipR; x=bx+Math.sin(ms/28)*1.6; }
      else if(ms<P.inh) { const k=ez(seg(ms,P.hop0,P.hop0+250)); x=lerp(bx,fbx,k); f=sp.idle; }
      else { x=fbx; if(ms<P.fire) { f=sp.idle; rot=.18*ez(seg(ms,P.inh,P.fire-60)); } else if(ms<P.fireEnd) { f=sp.act; rot=-.12+Math.sin(ms/30)*.03; } else f=ms<P.relief+600?sp.hip:sp.idle; } }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(fbx,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sB.x=x; sB.b=y; sB.f=f; sB.rot=rot; return {cx:x,base:y,frame:f,rot}; });
  const show=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
  const tabIn=ms=>ez(seg(ms,P.walk-250,P.walk+120)),tabK=ms=>tabIn(ms)*(1-ez(seg(ms,P.hop0,P.hop0+300)));
  const bowlTop=()=>({x:mx,y:tY-16});
  const mouthBR=()=>({x:sB.x+BW*.2,y:sB.b-BH*.72}),mouthBL=()=>({x:sB.x-BW*.24,y:sB.b-BH*.7}),mouthT=()=>({x:sT.x-TW*.22,y:sT.b-TH*.7});
  const sweatK=ms=>ez(seg(ms,rT(1)+380,P.tline+300))*(1-ez(seg(ms,P.home,P.home+500)));
  // Behind everyone: a warm kitchen evening, a lamp over the table, Tom's sweat puddle; the room flushes orange at the fire.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#24100a',.55);
    gfx.globalAlpha=k*.16*tabK(ms); E(mx,tY-26,90,56,'#ffb060'); gfx.globalAlpha=1;
    const pk=sweatK(ms); if(pk>0) { const r=6+30*pk; gfx.globalAlpha=.8; E(tx,by+3,r,r*.22,'#5aa8d8'); E(tx-r*.2,by+2,r*.5,r*.08,'#bfe8ff'); gfx.globalAlpha=1; }
    if(ms>P.fire&&ms<P.fireEnd+400) { gfx.globalAlpha=Math.sin(seg(ms,P.fire,P.fireEnd+400)*Math.PI)*.35; R(0,0,576,324,'#ff5a1a'); gfx.globalAlpha=1; } }});
  const faceRed=(sp,S0,H,k)=>{ if(k<=0.01) return;
    let fl=FLUSH.get(sp.pal); if(!fl) { fl={}; for(const q in sp.pal) { const c=sp.pal[q]; fl[q]='rgba(0,0,0,0)'; if(typeof c!=='string'||c[0]!=='#'||c.length<7) continue;
      const [r,g,b]=[1,3,5].map(i=>parseInt(c.substr(i,2),16)); if(r>=150&&g/r>.45&&g/r<.88&&b/r>.3&&b<g) fl[q]='rgb('+Math.round(lerp(r,255,.35))+','+Math.round(g*.42)+','+Math.round(b*.38)+')'; } FLUSH.set(sp.pal,fl); } gfx.save(); gfx.translate(S0.x,S0.b-H/2); gfx.rotate(S0.rot||0); gfx.translate(-S0.x,-(S0.b-H/2));
    gfx.beginPath(); gfx.rect(0,S0.b-H-4,576,H*.4+4); gfx.clip(); drawAt(sp,S0.f,S0.x,S0.b,fl,k); gfx.restore(); };
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    // the little round table and the bowl of peppers (slides away when they get up for the fire)
    const tk=tabK(ms); if(tk>0) { const yo=(1-tabIn(ms))*-50; gfx.globalAlpha=Math.min(1,tk*1.4);
      RO(mx-3,tY+yo+2,6,by-tY-6,'#6a4428'); EO(mx,by-3+yo,15,3,'#6a4428'); EO(mx,tY+yo,30,6,'#8a5a30'); E(mx,tY+yo-1.5,26,3.5,'#a8723e');
      const n=8-2*taken(ms); for(let j=0;j<n;j++) { const [px,py,pr]=PEPB[j]; hotPepper(mx+px,tY+yo-6+py,.85,pr,Math.floor((7-j)/2)); }
      gfx.beginPath(); gfx.ellipse(mx,tY+yo-6,14,11,0,0,Math.PI); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#f4f0e6'; gfx.fill();
      R(mx-10,tY+yo-1,20,2.5,'#3a7ac0'); gfx.globalAlpha=1; }
    // each round: two peppers fly from the bowl to two mouths, crunch
    for(let i=0;i<4;i++) for(const [t0,who] of [[rT(i),'b'],[rT(i)+160,'t']]) {
      const m=who==='b'?mouthBR():mouthT(),b0=bowlTop();
      if(ms>t0&&ms<t0+220) { const q=seg(ms,t0,t0+220); hotPepper(lerp(b0.x,m.x,q),lerp(b0.y,m.y,q)-Math.sin(q*Math.PI)*22,1.1,(who==='b'?1:-1)*q*2.5,i); }
      else if(ms>t0+220&&ms<t0+520) { const q=seg(ms,t0+220,t0+520); gfx.globalAlpha=1-q;
        for(let j=0;j<4;j++) R(m.x+(j-1.5)*4+(j%2?q*6:-q*6),m.y+q*q*18-j%2*3,2,2,PEPC[i][j%2]); gfx.globalAlpha=1; } }
    // Tom goes redder every round (and Boppy when his stomach turns)
    faceRed(tsp,sT,TH,redT(ms)); faceRed(bsp,sB,BH,redB(ms));
    // sweat flying off Tom's head, more every round
    const sk=sweatK(ms); if(sk>0&&ms<P.hop0) { const n=2+Math.floor(sk*5),top=sT.b-TH;
      for(let j=0;j<n;j++) { const q=((ms/520)+j/n)%1,side=j%2?1:-1; gfx.globalAlpha=(1-q)*.95;
        const x=sT.x+side*(6+q*34),y=top+10-Math.sin(q*Math.PI)*16+q*q*26; E(x,y,2.6,3.4,'#7ac8f0'); E(x-.8,y-1,1,1.2,'#ffffff'); } gfx.globalAlpha=1; }
    // steam from his ears once he is very red
    if(redT(ms)>.6&&ms<P.fire) { const top=sT.b-TH; for(let j=0;j<4;j++) { const q=((ms/400)+j/4)%1; gfx.globalAlpha=(1-q)*.8;
      E(sT.x+(j%2?TW*.26:-TW*.26)+(j%2?q*10:-q*10),top+TH*.24-q*24,3+q*4,3+q*4,'#f4f0e6'); } gfx.globalAlpha=1; }
    // Boppy's stomach rumbling
    if(ms>P.rumb&&ms<P.inh) { const a=1-seg(ms,P.inh-200,P.inh),cy=sB.b-BH*.42; gfx.globalAlpha=a; gfx.strokeStyle='#ffd0a0'; gfx.lineWidth=2;
      for(let j=0;j<3;j++) { const r=12+j*7+((ms/60)%7); gfx.beginPath(); gfx.arc(sB.x+4,cy,r,-.5,.5); gfx.stroke(); gfx.beginPath(); gfx.arc(sB.x+4,cy,r,Math.PI-.5,Math.PI+.5); gfx.stroke(); } gfx.globalAlpha=1; }
    // THE FIRE: two cones of pepper breath, one from each of them, across the row
    if(ms>P.fire&&ms<P.fireEnd) { const gr=ez(seg(ms,P.fire,P.fire+240)),fo=1-seg(ms,P.fireEnd-250,P.fireEnd),fl=Math.sin(ms/25);
      for(const [m,sz] of [[mouthT(),.8],[mouthBL(),1]]) { const len=Math.max(40,m.x-(RW.x0-36))*gr;
        for(const [sp2,c,a] of [[1,'#ff4a12',.7],[.68,'#ff9a2a',.9],[.36,'#fff2a0',1]]) { gfx.globalAlpha=a*fo; gfx.fillStyle=c; gfx.beginPath(); gfx.moveTo(m.x,m.y);
          const hw=(64+fl*6)*sp2*gr*sz; gfx.quadraticCurveTo(m.x-len*.5,m.y-hw*.8,m.x-len,m.y-hw); gfx.lineTo(m.x-len,m.y+hw*.8); gfx.quadraticCurveTo(m.x-len*.5,m.y+hw*.6,m.x,m.y); gfx.fill(); }
        for(let j=0;j<7;j++) { const q=((ms-P.fire)/480+j/7)%1; gfx.globalAlpha=fo*(1-q); EO(m.x-q*len,m.y+Math.sin(j*2.4)*q*46*sz,3+q*7,3+q*5,j%2?'#ffb02a':'#ff6a1a'); } }
      gfx.globalAlpha=1; }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Father and son. One bowl of hot peppers.'); B2.aim=null; S('click'); }],
    [R0,()=>{ setMessage('Round after round. Nobody blinks.'); }],
    [P.bline,()=>{ say('boppy','dc3'); }],
    [P.tline,()=>{ say('tom','dcboppy3'); }],
    [P.rumb,()=>{ S('rumble'); word('RUMBLE...',sB.x,Math.max(60,by-BH-40),'#ffd0a0',3,.8); setMessage('Then Boppy’s stomach rumbles.'); }],
    [P.hop0,()=>{ S('boing'); }],
    [P.inh,()=>{ S('whoosh'); setMessage('They both lean back...'); }],
    [P.fire,()=>{ S('flame'); S('crash'); S('rumble'); battle.shakeEnemy=.7; word('FWOOOSH!',Math.max(90,RW.x),52,'#ff7a2a',5,1.1); setMessage('Double pepper breath! Right across the row!'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sB.x,mid:sB.b-BH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:'#ffb84a',a:.35}); } }],
    [P.relief,()=>{ S('fanfare'); setMessage('Boppy calls it a tie. Tom calls for milk.'); }],
    [P.relief+500,()=>{ word('TIE.',(sT.x+sB.x)/2,Math.max(56,by-Math.max(TH,BH)-60),CREAM,4,.8); }],
  ];
  for(let i=0;i<4;i++) { steps.push([rT(i)+20,()=>{ S('bonk'); }]); steps.push([rT(i)+180,()=>{ S('bonk'); if(i>0) S('flame'); }]);
    steps.push([rT(i)+420,()=>{ word(['HOT.','HOTTER.','HOTTEST.','HELP.'][i],tx,Math.max(60,by-TH-34),['#ffd04a','#ffb03a','#ff7a2a','#ff4a3a'][i],3,.45); }]); }
  order.forEach((o,i)=>{ steps.push([o.t,()=>{ S('bonk'); ST.jolt(o.f,.6); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:46,c:'#ffb02a',w:3}); landHit(split100(i,order.length)); }]); });
  steps.push(['hf',order.length?order[0].t:P.fire]);
  steps.push([P.end,'end',()=>(E2.result||'')+' Tom still can\'t feel his face.']);
  ST.play(E2,steps);
};

// ---------- Golden Repair (Tom + TNB, Director's Cut of tier 3) ----------
// The pottery studio after hours. TNB hands Tom a cup; it slips and breaks on the floor in three pieces. Tom kneels, gathers
// them and holds them out. TNB says broken is fine and mends it with gold, the Japanese way (kintsugi), brushing gold into
// every crack. The mended cup rises and grows, its gold seams blaze, and three gold beams shoot from the seams into the
// monster, leaving gold seams on it too. A gold glow settles over the family, and TNB kisses Tom.
// Effects: big Sparkle hit on one enemy; the party Guards (half damage) for 2 turns and Amber melts off.
const CUPC='#c8b49a',CUPG='#7aa8b8',KGOLD='#f2b81a';
const CRK_A=[[-1,-11],[1,-5],[-2,-1],[1,3],[0,10]],CRK_B=[[-2,-1],[3,0],[6,-3],[14,-1]];
const polyPart=(pts,k)=>{ if(k<=0) return null; let L=0; const seg2=[]; for(let i=1;i<pts.length;i++) { const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); seg2.push(d); L+=d; }
  let left=L*k; gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); let end=pts[0];
  for(let i=1;i<pts.length&&left>0;i++) { const d=seg2[i-1],u=Math.min(1,left/d); end=[lerp(pts[i-1][0],pts[i][0],u),lerp(pts[i-1][1],pts[i][1],u)]; gfx.lineTo(end[0],end[1]); left-=d; }
  return end; };
// The cup at x,y (its middle), scale s, turned rot. split pushes the three pieces apart (0 = whole); seam 0..1 paints the
// gold along the cracks (A first, then B); glow 0..1 makes the gold blaze. Returns the brush tip spot (local coords).
const kCup=(x,y,s,rot,split,seam,glow)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  const body=()=>{ const sh=()=>{ gfx.beginPath(); gfx.moveTo(-11,-7); gfx.bezierCurveTo(-11,2,-7,6,-4,6); gfx.lineTo(4,6); gfx.bezierCurveTo(7,6,11,2,11,-7); gfx.closePath(); };
    RO(-5,5,10,3,'#a8927a'); sh(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=CUPC; gfx.fill();
    gfx.save(); sh(); gfx.clip(); R(-12,-8,24,6,CUPG); for(const [dx,h2] of [[-7,3],[-2,4.5],[4,3.5],[8,2.5]]) E(dx,-2,1.4,h2,CUPG); for(const [a,b2] of [[-6,2],[3,3],[-2,4],[6,0]]) R(a,b2,1.2,1.2,'#8a7258'); gfx.restore();
    E(0,-7,11.5,3.4,OUT); E(0,-7,10,2.2,'#4a3a2e'); E(-3,-7.5,4,.8,'#6a5a48'); };
  const A=CRK_A,B=CRK_B;
  const piece=(path,dx,dy,r)=>{ gfx.save(); gfx.translate(dx*split,dy*split); gfx.rotate(r*split); gfx.beginPath(); path(); gfx.clip(); body(); gfx.restore(); };
  piece(()=>{ gfx.moveTo(-16,-12); for(const p of A) gfx.lineTo(p[0],p[1]); gfx.lineTo(-16,12); gfx.closePath(); },-6,2,-.35);
  piece(()=>{ gfx.moveTo(A[0][0],A[0][1]); gfx.lineTo(18,-12); gfx.lineTo(18,0); for(let i=B.length-2;i>=0;i--) gfx.lineTo(B[i][0],B[i][1]); gfx.lineTo(A[1][0],A[1][1]); gfx.closePath(); },6,-5,.45);
  piece(()=>{ gfx.moveTo(B[0][0],B[0][1]); for(let i=1;i<B.length;i++) gfx.lineTo(B[i][0],B[i][1]); gfx.lineTo(18,12); gfx.lineTo(A[4][0],A[4][1]); gfx.lineTo(A[3][0],A[3][1]); gfx.closePath(); },5,4,.2);
  let tip=null;
  if(seam>0&&split<.05) { gfx.save(); gfx.beginPath(); gfx.rect(-12,-10,27,20); gfx.clip(); gfx.lineCap='round'; gfx.lineJoin='round';
    const ka=cl(seam/.6),kb=cl((seam-.6)/.4);
    for(const [w,c,al] of [[3.6,'#ffe9a0',.2+glow*.4],[1.5,KGOLD,1],[.6,'#fff6c0',.9]]) { const a0=gfx.globalAlpha; gfx.globalAlpha=a0*al; gfx.strokeStyle=c; gfx.lineWidth=w*(1+glow*.2);
      const ea=polyPart(A,ka); if(ea) gfx.stroke(); if(ea) tip=ea; const eb=polyPart(B,kb); if(eb) { gfx.stroke(); tip=eb; } gfx.globalAlpha=a0; }
    gfx.restore(); }
  gfx.restore(); return tip; };
B2_TOMBO_ANIM.tnb3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),tgt=(E2.targets||[]).find(t=>t.side==='foe'&&b2Alive(t))||list[0],F=ST.foe(tgt),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale;
  const by=cl(Math.max(GR.base,T.base-12),236,300),mx=cl(GR.x1+150,GR.x1+110,470),tx=mx+40,nx=mx-40,nx2=mx-20;
  const P={walk:700,hand:900,slip:1300,crack:1500,kneel:1800,lift:2150,held:2400,nline:2450,step:2800,join:2950,joined:3300,seam1:3900,tline:3700,
    rise:4500,big:5000,beam:5200,hit:5450,apply:5950,back:5900,kiss:6350,home:6800,end:7500};
  const sT={x:T.x,b:by,f:tsp.idle},sN={x:nx,b:by,f:nsp.flip};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=by,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,by,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { f=ms>P.crack&&ms<P.crack+250?sp.expr:(ms>P.kneel&&ms<P.lift+150?sp.kneel:(ms>P.lift+150&&ms<P.rise?sp.act:(ms>P.hit&&ms<P.hit+800?sp.celeb:sp.idle))); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(by,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp,actR=mirrorRowsCached(sp,'act'),aimR=mirrorRowsCached(sp,'aim'); let x=nx,y=by,f=sp.flip;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,nx,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.home) { x=ms<P.step?nx:lerp(nx,nx2,ez(seg(ms,P.step,P.join)));
      if(ms>P.hand-150&&ms<P.slip) f=actR;
      else if(ms>P.crack&&ms<P.crack+300) f=sp.expr?mirrorRowsCached(sp,'expr'):sp.flip;
      else if(ms>P.join&&ms<P.seam1+100) f=Math.floor(ms/180)%2?aimR:actR;
      else if(ms>P.beam-100&&ms<P.hit+800) f=ms<P.hit?sp.act:sp.celeb;
      else f=sp.flip; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(nx2,c.origX,k); y=lerp(by,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f}; });
  const show=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
  const floorP={x:mx,y:by-12},high={x:mx,y:112},HS=2.2,BS=5.2;
  // where the cup is, how big, how broken: {x,y,s,rot,split,seam,glow}
  const cupAt=ms=>{ if(ms<P.hand) return null;
    const hN=()=>{ const h=handPt(nsp,sN.f,sN.x,sN.b,1); return {x:h.x+8,y:h.y}; },hT=()=>{ const h=handPt(tsp,tsp.act,sT.x,sT.b,-1); return {x:h.x-10,y:h.y+2}; };
    if(ms<P.slip) { const h=hN(),k=ez(seg(ms,P.hand,P.hand+200)); return {x:h.x,y:h.y,s:HS*k,rot:0,split:0,seam:0,glow:0}; }
    if(ms<P.crack) { const q=seg(ms,P.slip,P.crack),h=hN(); return {x:lerp(h.x,floorP.x,q),y:lerp(h.y,floorP.y,q*q),s:HS,rot:q*2.2,split:0,seam:0,glow:0}; }
    if(ms<P.lift) { const q=ez(seg(ms,P.crack,P.crack+250)); return {x:floorP.x,y:floorP.y+2*q,s:HS,rot:Math.PI*.7+q*.3,split:1.8*q,seam:0,glow:0}; }
    if(ms<P.held) { const q=ez(seg(ms,P.lift,P.held)),h=hT(); return {x:lerp(floorP.x,h.x,q),y:lerp(floorP.y+2,h.y,q),s:HS,rot:lerp(Math.PI,Math.PI*2,q),split:lerp(1.8,.6,q),seam:0,glow:0}; }
    if(ms<P.rise) { const h=hT(),sp2=.6*(1-ez(seg(ms,P.join,P.joined))),sm=seg(ms,P.joined-100,P.seam1); return {x:h.x,y:h.y,s:HS,rot:0,split:sp2,seam:sm,glow:ms>P.seam1?.25+.15*Math.sin(ms/120):0}; }
    if(ms<P.back) { const q=ez(seg(ms,P.rise,P.big)),h=hT(); return {x:lerp(h.x,high.x,q),y:lerp(h.y,high.y,q)+Math.sin(ms/220)*3*q,s:lerp(HS,BS,q),rot:Math.sin(ms/300)*.06*q,split:0,seam:1,glow:ms<P.hit?q:1-seg(ms,P.hit,P.back)*.6}; }
    const q=ez(seg(ms,P.back,P.back+450)),h=hN(); if(q>=1) return null; return {x:lerp(high.x,h.x,q),y:lerp(high.y,h.y,q),s:lerp(BS,1.4,q),rot:0,split:0,seam:1,glow:.4*(1-q)}; };
  // the seams in world space (for the beams): the cup's local crack points, scaled and moved
  const seamPts=c=>[[1,-5],[1,3],[6,-3]].map(([a,b2])=>({x:c.x+a*c.s,y:c.y+b2*c.s}));
  const beamEnd=[{x:F.x+F.w*.15,y:F.mid-F.h*.2},{x:F.x-F.w*.15,y:F.mid+F.h*.15},{x:F.x+F.w*.05,y:F.mid}];
  // Behind everyone: the studio at night under a warm work lamp, a shelf of pots behind the pair.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#10141e',.55);
    gfx.globalAlpha=k*.22; E(mx,by-60,110,80,'#ffcf8a'); gfx.globalAlpha=k;
    const sy=Math.round(by-TH-20); RO(mx-70,sy,140,5,'#7a5a3a');
    for(const [dx,h,c] of [[-58,16,'#b85a3a'],[-36,22,'#7aa8b8'],[-12,13,'#e8dcc4'],[12,20,'#5a6a4a'],[38,15,'#c8b49a'],[58,18,'#a85a7a']]) { RO(mx+dx-6,sy-h,12,h,c); R(mx+dx-6,sy-h,12,2,'#ffffff40'); }
    gfx.globalAlpha=1;
    if(ms>P.hit&&ms<P.hit+700) { gfx.globalAlpha=Math.sin(seg(ms,P.hit,P.hit+700)*Math.PI)*.25; R(0,0,576,324,GOLD); gfx.globalAlpha=1; } }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    const c=cupAt(ms); let tip=null;
    if(c&&c.s>0) { gfx.globalAlpha=Math.min(1,k*1.5);
      if(c.glow>.05) { gfx.globalAlpha=c.glow*(.3+.1*Math.sin(ms/90)); E(c.x,c.y,c.s*15,c.s*11,'#ffd86a'); gfx.globalAlpha=1; }
      const t0=kCup(c.x,c.y,c.s,c.rot,c.split,c.seam,c.glow); if(t0) tip={x:c.x+t0[0]*c.s,y:c.y+t0[1]*c.s};
      gfx.globalAlpha=1; }
    // a tiny dust puff where it broke
    if(ms>P.crack&&ms<P.crack+500) { const q=seg(ms,P.crack,P.crack+500); gfx.globalAlpha=(1-q)*.6; for(let j=0;j<5;j++) E(floorP.x+(j-2)*8*(1+q),floorP.y+6-q*8,3+q*3,2+q*2,'#c8beb0'); gfx.globalAlpha=1; }
    // TNB's brush: from his hand to the seam he is painting, a gold drop on the tip
    if(ms>P.join&&ms<P.seam1+150) { const h=handPt(nsp,sN.f,sN.x,sN.b,1),to=tip||(c?{x:c.x-4,y:c.y-6}:h),a=ez(seg(ms,P.join,P.join+150))*(1-seg(ms,P.seam1,P.seam1+150));
      gfx.globalAlpha=a; Ln(h.x,h.y,to.x-3,to.y+1,4,OUT); Ln(h.x,h.y,to.x-3,to.y+1,2,'#a8723e'); E(to.x-1,to.y,2.6,2.2,KGOLD); E(to.x-1.6,to.y-.6,.9,.8,'#fff6c0');
      if(tip) for(let j=0;j<3;j++) { const q=((ms/260)+j/3)%1; gfx.globalAlpha=a*(1-q); star(tip.x+Math.cos(j*2.1)*q*10,tip.y-q*10,2+q,'#fffbe6'); } gfx.globalAlpha=1; }
    // three gold beams from the seams into the monster
    if(c&&ms>P.beam&&ms<P.hit+350) { const q=ez(seg(ms,P.beam,P.hit)),fo=1-seg(ms,P.hit+100,P.hit+350),sp3=seamPts(c);
      sp3.forEach((s0,j)=>{ const e=beamEnd[j],n=10;
        for(const [w,col,al] of [[9,'#ffe9a0',.35],[3.5,KGOLD,1],[1.4,'#fffbe6',1]]) { gfx.globalAlpha=al*fo; gfx.strokeStyle=col; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(s0.x,s0.y);
          for(let i=1;i<=n;i++) { const u2=i/n; if(u2>q) break; const zz=(i%2?1:-1)*(i<n?9:0)*Math.sin(u2*Math.PI); gfx.lineTo(lerp(s0.x,e.x,u2)+zz*.4,lerp(s0.y,e.y,u2)+zz); } gfx.stroke(); } });
      gfx.globalAlpha=1; }
    // the monster gets mended too: gold seams across it that glow, then fade
    if(ms>P.hit&&ms<P.hit+1300) { const q=seg(ms,P.hit,P.hit+1300),a=q<.15?q/.15:1-seg(q,.6,1); gfx.save(); gfx.globalAlpha=a; gfx.lineCap='round'; gfx.lineJoin='round';
      for(const [w,col] of [[5,'#ffe9a0'],[2,KGOLD]]) { gfx.strokeStyle=col; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(F.x-F.w*.35,F.top+F.h*.25); gfx.lineTo(F.x-F.w*.1,F.mid-4); gfx.lineTo(F.x+F.w*.05,F.mid+2); gfx.lineTo(F.x+F.w*.3,F.mid+F.h*.3);
        gfx.moveTo(F.x+F.w*.05,F.mid+2); gfx.lineTo(F.x+F.w*.2,F.top+F.h*.2); gfx.stroke(); } gfx.restore();
      if(q<.5) { const r=q*2; gfx.globalAlpha=1-r; for(let j=0;j<10;j++) { const an=j*.63; star(F.x+Math.cos(an)*r*70,F.mid+Math.sin(an)*r*46,3+r*3,j%2?GOLD:'#fffbe6'); } ring(F.x,F.mid,10+r*80,8+r*52,4,GOLD); gfx.globalAlpha=1; } }
    // the kiss
    if(ms>P.kiss&&ms<P.kiss+1100) { const q=seg(ms,P.kiss,P.kiss+1100); gfx.globalAlpha=q>.8?(1-q)/.2:1; heart((sT.x+sN.x)/2,by-Math.max(TH,NH)-12-q*30,7+Math.sin(q*Math.PI)*4,PINK); gfx.globalAlpha=1; }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! The pottery studio, after hours.'); B2.aim=null; S('click'); }],
    [P.hand,()=>{ S('ding'); setMessage('TNB hands Tom his favorite cup.'); }],
    [P.slip,()=>{ S('whoosh'); }],
    [P.crack,()=>{ S('crash'); word('CRACK!',mx,Math.max(60,by-Math.max(TH,NH)-40),CREAM,4,.6); setMessage('It slips. Three pieces.'); }],
    [P.kneel,()=>{ S('step'); setMessage('Tom gathers every piece.'); }],
    [P.nline,()=>{ say('tnb','dc3'); }],
    [P.join,()=>{ S('chime2'); setMessage('TNB mends it with gold, the Japanese way: kintsugi.'); }],
    [P.tline,()=>{ say('tom','dctnb3'); }],
    [P.rise,()=>{ S('levelChime'); setMessage('The gold seams start to glow.'); }],
    [P.big,()=>{ word('GOLDEN!',mx,40,GOLD,5,.9); }],
    [P.beam,()=>{ S('whoosh'); S('chime2'); }],
    [P.hit,()=>{ S('crash'); S('bang'); battle.shakeEnemy=.6; ST.jolt(tgt,.7); scene('tb_rings',.7,{x:F.x,y:F.mid,r:70,c:GOLD,w:4}); word('MENDED!',F.x,66,'#fffbe6',4,.9); landHit(100); }],
    ['hf',P.hit],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('A gold glow settles over the family.');
      for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sN.x,mid:sN.b-NH*.5}:ST.unit(p)); scene('glow',1.1,{x:q2.x,y:q2.mid,rx:40,ry:54,c:GOLD,a:.45}); } }],
    [P.kiss,()=>{ S('kiss'); }],
    [P.end,'end',()=>(E2.result||'')+' Now it\'s theirs.']];
  ST.play(E2,steps);
};

// ---------- Under the Table (Tom + Nara, Director's Cut of tier 3) ----------
// Family dinner. Nara is under the table. Tom tells her to keep it quiet and sneaks her three bits of his sourdough; her
// head pops out from under the tablecloth for each one. She gets so excited the whole table jiggles, then she pops straight
// up under the cloth: it flies off the table (the plates do not move), sails over the room and lands on every monster like
// a net. Nara lands beside the table and sits, very proud; Tom slips her one more bit.
// Effects: huge Sparkle hit on every enemy; they are Hooked (no dodging) for 2 turns.
const clothPath=(c,ms)=>{ const {x0,x1,yT,yB,peak,flare,wave}=c; gfx.beginPath(); gfx.moveTo(x0,yT); gfx.quadraticCurveTo((x0+x1)/2,yT-peak,x1,yT);
  gfx.lineTo(x1+flare,yB); const n=Math.max(4,Math.round((x1-x0+flare*2)/10));
  for(let i=1;i<=n;i++) { const u2=i/n,x=lerp(x1+flare,x0-flare,u2),y=yB+Math.sin(u2*Math.PI*n*.5+ms/(wave>2?60:140))*wave; gfx.lineTo(x,y); }
  gfx.closePath(); };
const cloth=(c,ms,a=1)=>{ if(a<=0) return; gfx.save(); gfx.globalAlpha=a; clothPath(c,ms); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#fffaf0'; gfx.fill(); gfx.clip();
  gfx.globalAlpha=a*.42; gfx.fillStyle='#d83a3a'; const L=Math.min(c.x0,c.x0-c.flare)-2,Rr=c.x1+c.flare+2,T0=c.yT-c.peak-2;
  for(let x=L+4;x<Rr;x+=12) gfx.fillRect(x,T0,5,c.yB+c.wave+4-T0); for(let y=T0+4;y<c.yB+c.wave+4;y+=12) gfx.fillRect(L,y,Rr-L,5);
  gfx.restore(); };
const lerpC=(a,b,q)=>{ const o={}; for(const k in a) o[k]=lerp(a[k],b[k],q); return o; };
B2_TOMBO_ANIM.nara3_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,nsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,NH=nsp.idle.length*nsp.scale,NW=nsp.idle[0].length*nsp.scale;
  const fc=cl(GR.x1+120,GR.x1+100,430),by=cl(Math.max(GR.base-16,T.base+20),236,292),tL=fc-50,tR=fc+80,tY=Math.round(by-TH*.42);
  const tx=tL+30,tby=by-6,nUnder=tL+NW*.62,nPeek=tL+NW*.08,nOut=tL-NW*.55,nMid=fc+18,nLand=tL-NW*.5;
  const BITS=[1900,2500,3100];
  const P={table:300,walk:700,run:900,tline:1000,nline:3500,wig0:3550,pop:4100,apex:4380,land:4700,fly:4380,drape:4950,hit:5100,apply:5750,treat:6050,
    home:6700,end:7400};
  const hitT=o3.map((o,i)=>P.hit+i*70);
  const sT={x:T.x,b:tby,f:tsp.idle},sN={x:0,b:by,f:nsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp; let x=tx,y=tby,f=sp.idle;
    if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(c.origX,tx,k); y=lerp(c.origBase,tby,k)+ffHop(ms,0,P.walk); }
    else if(ms<P.home) { const give=BITS.some(t=>ms>t-150&&ms<t+260)||(ms>P.treat-150&&ms<P.treat+260);
      f=give||(ms>P.tline-50&&ms<P.tline+700)?sp.act:(ms>P.wig0&&ms<P.drape?sp.expr:(ms>P.hit&&ms<P.hit+800?sp.celeb:sp.idle)); }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(tx,c.origX,k); y=lerp(tby,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?sp.flip:sp.idle; }
    sT.x=x; sT.b=y; sT.f=f; return {cx:x,base:y,frame:f}; });
  const peekK=ms=>{ let k=0; for(const t of BITS) k=Math.max(k,ez(seg(ms,t-200,t-50))*(1-ez(seg(ms,t+400,t+600)))); return k; };
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp; let x=nUnder,y=by,f=sp.idle,rot=0;
    if(ms<P.run) { const k=ez(seg(ms,0,P.run)); x=lerp(c.origX,nOut,k); y=lerp(c.origBase,by,k); f=runFr(sp,c.t,-1); }
    else if(ms<P.wig0) { const pk=peekK(ms); x=lerp(lerp(nOut,nUnder,ez(seg(ms,P.run,P.run+300))),nPeek,pk); if(ms<P.run+300) f=runFr(sp,c.t,1); f=pk>.5&&BITS.some(t=>ms>t+150&&ms<t+400)?sp.celeb:(pk>.1?sp.aim:sp.idle); }
    else if(ms<P.pop) { const k=ez(seg(ms,P.wig0,P.wig0+300)); x=lerp(nUnder,nMid,k)+Math.sin(ms/40)*2; f=runFr(sp,c.t,-1); }
    else if(ms<P.apex) { const q=seg(ms,P.pop,P.apex); x=nMid; y=by-(by-tY+46)*(1-(1-q)*(1-q)); f=sp.celeb; }
    else if(ms<P.land) { const q=seg(ms,P.apex,P.land); x=lerp(nMid,nLand,q); y=lerp(tY-46,by+4,q*q); f=sp.celeb; }
    else if(ms<P.home) { x=nLand; y=by+4; f=sp.sit||sp.idle; if(ms>P.treat+150&&ms<P.treat+500) y-=Math.sin(seg(ms,P.treat+150,P.treat+500)*Math.PI)*12; }
    else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(nLand,c.origX,k); y=lerp(by+4,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    sN.x=x; sN.b=y; sN.f=f; return {cx:x,base:y,frame:f,rot,hide:(ms>P.run&&ms<P.pop)||(ms>=P.land&&ms<P.home)}; });
  const show=ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
  const tIn=ms=>ez(seg(ms,P.table,P.table+350)),tOut=ms=>1-ez(seg(ms,P.home,P.home+450));
  const jig=ms=>ms>P.wig0&&ms<P.pop?Math.sin(ms/34)*2.2*seg(ms,P.wig0,P.wig0+250):0;
  const C_TABLE=ms=>({x0:tL-4,x1:tR+4,yT:tY-1,yB:by+3,peak:0,flare:3,wave:ms>P.wig0&&ms<P.pop?2.2:.6});
  const C_SHEET=()=>({x0:sN.x-24,x1:sN.x+24,yT:sN.b-NH*.85,yB:sN.b-4,peak:18,flare:12,wave:2.5});
  const W=Math.max(120,GR.x1-GR.x0+44),gx=(GR.x0+GR.x1)/2;
  const C_FLAT=q=>{ const cx=lerp(nMid,gx,q),w=lerp(52,W,ez(q)),yT=lerp(tY-60,GR.top-16,q)-Math.sin(q*Math.PI)*46; return {x0:cx-w/2,x1:cx+w/2,yT,yB:yT+lerp(30,22,Math.sin(q*Math.PI)),peak:lerp(18,6,q),flare:lerp(12,4,q),wave:4}; };
  const C_DRAPE=ms=>{ const yT=GR.top-14+Math.sin(seg(ms,P.drape,P.drape+400)*Math.PI*2)*(1-seg(ms,P.drape,P.drape+400))*6; return {x0:gx-W/2,x1:gx+W/2,yT,yB:GR.base+6,peak:10,flare:8,wave:1.5}; };
  let sheet0=null;
  const clothAt=ms=>{
    if(ms<P.pop) return C_TABLE(ms);
    if(ms>=P.apex&&!sheet0) sheet0=C_SHEET();
    if(ms<P.apex) return lerpC(C_TABLE(ms),C_SHEET(),ez(seg(ms,P.pop,P.pop+180)));
    if(ms<P.drape) return lerpC(sheet0||C_SHEET(),C_FLAT(seg(ms,P.fly,P.drape)),ez(seg(ms,P.apex,P.apex+200)));
    const D=C_DRAPE(ms); if(ms<P.drape+200) { const F0=C_FLAT(1); return lerpC(F0,D,ez(seg(ms,P.drape,P.drape+200))); } return D; };
  // bit i: from Tom's hand down to Nara's mouth as she peeks out
  const bitAt=(t,ms,toX,toY)=>{ if(ms<t||ms>t+260) return null; const h=handPt(tsp,tsp.act,sT.x,sT.b,-1),q=seg(ms,t,t+260); return {x:lerp(h.x,toX,q),y:lerp(h.y,toY,q)-Math.sin(q*Math.PI)*14,r:q*5}; };
  const mouth=()=>({x:sN.x-NW*.4,y:sN.b-NH*.55});
  // Behind everyone: a warm dining room, a hanging lamp over the table.
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#2a1a10',.5);
    gfx.globalAlpha=k*.2; E(fc+12,tY-30,120,70,'#ffcf8a'); gfx.globalAlpha=k; Ln(fc+12,BARH,fc+12,tY-TH*.9,2,'#2a2018'); EO(fc+12,tY-TH*.9,12,6,'#c88a3a'); E(fc+12,tY-TH*.9+5,8,3,'#fff2c0'); gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    const ti=tIn(ms),to=tOut(ms),yo=(1-ti)*-70,a=Math.min(ti*1.5,to),jy=jig(ms);
    // the bare table (seen once the cloth is gone): wooden top and legs
    if(a>0) { gfx.globalAlpha=a; RO(tL+4,tY+yo+4,6,by-tY-6,'#6a4428'); RO(tR-10,tY+yo+4,6,by-tY-6,'#6a4428'); RO(tL,tY+yo-2+jy*.3,tR-tL,7,'#8a5a30'); R(tL,tY+yo-2+jy*.3,tR-tL,2,'#a8723e'); gfx.globalAlpha=1; }
    // Nara under the table: only the part of her sticking out past the left end shows (the rest is under the cloth)
    if(ms>P.run&&ms<P.pop) { gfx.save(); gfx.beginPath(); gfx.rect(0,0,tL-2,324); gfx.clip(); drawAt(nsp,sN.f,sN.x,sN.b,nsp.pal,1); gfx.restore(); }
    // the tablecloth: on the table, then lifted by Nara, flying, and draped over every monster
    const c=clothAt(ms); if(ms<P.pop) { c.yT+=yo+jy*.3; c.yB+=yo; }
    const ca=ms<P.drape?a:1-ez(seg(ms,P.home-200,P.home+300)); cloth(c,ms,ca);
    if(ms>=P.land&&ms<P.home) drawAt(nsp,sN.f,sN.x,sN.b,nsp.pal,1);   // sitting proud, in front of the draped cloth
    // dishes on the table (they stay put when the cloth flies, of course)
    if(a>0) { gfx.globalAlpha=a; const top=tY+yo-1+(ms<P.pop?jy*.3:0),hop=i=>ms>P.wig0&&ms<P.pop?-Math.abs(Math.sin(ms/50+i*1.7))*3:0;
      EO(fc-6,top-2+hop(0),15,3.5,'#f4f0e6'); boule(fc-6,top-9+hop(0),.8,false);
      EO(tL+18,top-2+hop(1),11,3,'#f4f0e6'); boule(tL+18,top-6+hop(1),.45,true);
      RO(fc+40,top-16+hop(2),4,14,'#fff6dc'); E(fc+42,top-21+hop(2)+Math.sin(ms/70),2.4,4,'#ffb030'); E(fc+42,top-20+hop(2),1,2,'#fff2a0');
      RO(fc+60,top-12+hop(3),7,10,'#bfe0ef'); R(fc+60,top-8+hop(3),7,5,'#d84a5a'); gfx.globalAlpha=1; }
    // the sourdough bits, down to Nara
    for(const t of BITS) { const m=mouth(),b=bitAt(t,ms,m.x,m.y); if(b) { gfx.save(); gfx.translate(b.x,b.y); gfx.rotate(b.r); EO(0,0,3.5,2.6,'#d89a52'); E(-1,-1,1.6,1,'#f0c88a'); gfx.restore(); }
      if(ms>t+260&&ms<t+900) { const q=seg(ms,t+260,t+900); gfx.globalAlpha=1-q; heart(m.x+4,m.y-14-q*22,4,PINK); gfx.globalAlpha=1; } }
    { const m=mouth(),b=bitAt(P.treat,ms,m.x+2,m.y); if(b) { gfx.save(); gfx.translate(b.x,b.y); gfx.rotate(b.r); EO(0,0,3.5,2.6,'#d89a52'); gfx.restore(); }
      if(ms>P.treat+260&&ms<P.treat+1100) { const q=seg(ms,P.treat+260,P.treat+1100); gfx.globalAlpha=q>.8?(1-q)/.2:1; heart(sN.x,sN.b-NH-10-q*26,6,PINK); gfx.globalAlpha=1; } }
    // monsters wriggle under the cloth
    if(ms>P.drape&&ms<P.end-60) for(const o of o3) { const f=o.f,wk=ms<P.home?1:1-seg(ms,P.home,P.home+300); f.ox=Math.sin(ms/55+o.q.x)*2.5*wk; f.spin=Math.sin(ms/90+o.q.x)*.05*wk; f.spinAt=performance.now(); }
    // sparkles when she sits, proud
    if(ms>P.land&&ms<P.land+800) { const q=seg(ms,P.land,P.land+800); gfx.globalAlpha=1-q; for(let j=0;j<6;j++) { const an=j*1.05+q; star(sN.x+Math.cos(an)*(16+q*16),sN.b-NH*.5+Math.sin(an)*(14+q*10),2.5,GOLD); } gfx.globalAlpha=1; }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! Family dinner. Nara is under the table.'); B2.aim=null; S('click'); }],
    [P.table,()=>{ S('thud'); }],
    [P.tline,()=>{ say('tom','dcnara3'); }],
    [BITS[0]-300,()=>{ setMessage('Tom sneaks her bits of his sourdough.'); }],
    [P.nline,()=>{ say('nara','dc3'); }],
    [P.wig0,()=>{ S('jangle'); word('WAG WAG',fc,Math.max(60,tY-TH*.7-20),CREAM,3,.6); setMessage('Nara gets VERY excited.'); }],
    [P.pop,()=>{ S('boing'); S('bark'); word('POP!',nMid,Math.max(56,tY-90),GOLD,5,.6); }],
    [P.fly,()=>{ S('whoosh'); setMessage('The tablecloth flies off. The plates don\'t move.'); }],
    [P.land,()=>{ S('step'); }],
    [P.drape,()=>{ S('thud'); battle.shakeEnemy=.5; word('FLUMP!',Math.max(90,gx),40,CREAM,5,.9); setMessage('It lands over every monster like a net.'); }],
    ['hf',P.hit],
    [P.apply,()=>{ E2.apply(); S('chime2'); for(const p of party) { const q2=p===tom?{x:sT.x,mid:sT.b-TH*.5}:(p===pt?{x:sN.x,mid:sN.b-NH*.5}:ST.unit(p)); scene('glow',1,{x:q2.x,y:q2.mid,rx:38,ry:52,c:GOLD,a:.35}); } }],
    [P.treat,()=>{ setMessage('Tom slips her one more bit. Good girl.'); }],
    [P.treat+260,()=>{ S('bonk'); }],
    [P.end,'end',()=>{ for(const o of o3) { o.f.ox=0; o.f.oy=0; o.f.spin=0; } return (E2.result||'')+' Nobody tell Olivia.'; }]];
  BITS.forEach(t=>{ steps.push([t-120,()=>{ S('sniff'); }]); steps.push([t+260,()=>{ S('bonk'); }]); });
  o3.forEach((o,i)=>steps.push([hitT[i],()=>{ S('bonk'); ST.jolt(o.f,.5); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:'#ff8a8a',w:3}); landHit(split100(i,o3.length)); }]));
  ST.play(E2,steps);
};

// ================= Family Finish Director's Cuts (ff1_dc to ff4_dc): no damage, all warmth =================
// Shared: dcRun poses every member from one function. Each row's pose(u,ms,sp,spot,s2) returns {x,y,f,rot,hide} or
// null (stand at the spot); the walk in and the run home are done here. s2 keeps each body's drawn x, b and frame.
const dcFr=(sp,k,right)=>right?mirrorRowsCached(sp,sp[k]?k:'idle'):(sp[k]||sp.idle);
const dcRun=(E2,spot,P,pose)=>{ const st={};
  for(const u of E2.mem){ const s0=startOf(u),sp0=BATTLE_SPRITES[u.id],S0=spot[u.id],s2=st[u.id]={x:s0.x,b:s0.b,f:sp0.idle,ex:S0.x,eb:S0.b};
    pathOf(E2.fx[E2.mem.indexOf(u)],P.end,(ms,c)=>{ const spr=c.sp; let x=S0.x,y=S0.b,f=spr.idle,rot=0,hide=false;
      if(ms<P.walk) { const k=ez(ms/P.walk); x=lerp(s0.x,S0.x,k); y=lerp(s0.b,S0.b,k)+ffHop(ms,0,P.walk); f=runFr(spr,c.t,S0.x>s0.x?1:-1); }
      else if(ms<P.home) { const r=pose(u,ms,spr,S0,s2); if(r) { if(r.x!=null) x=r.x; if(r.y!=null) y=r.y; if(r.f) f=r.f; rot=r.rot||0; hide=!!r.hide; } s2.ex=x; s2.eb=y; }
      else { const k=ez(seg(ms,P.home,P.home+650)); x=lerp(s2.ex,c.origX,k); y=lerp(s2.eb,c.origBase,k)+ffHop(ms,P.home,P.home+650); f=k<1?runFr(spr,c.t,1):spr.idle; }
      s2.x=x; s2.b=y; s2.f=f; return {cx:x,base:y,frame:f,rot,hide}; }); }
  return st; };
const dcShow=P=>ms=>ez(seg(ms,0,450))*(1-ez(seg(ms,P.home,P.end-100)));
const dcHeights=E2=>{ const h={}; for(const u of E2.mem) { const sp=BATTLE_SPRITES[u.id]; h[u.id]=sp.idle.length*sp.scale; } return h; };
const dcGlow=(E2,st,H,c)=>{ for(const p of b2LiveParty()) { const m=st[p.id],q=m?{x:m.x,mid:m.b-H[p.id]*.5}:ST.unit(p); scene('glow',1,{x:q.x,y:q.mid,rx:38,ry:52,c,a:.35}); } };
const dcFoeBurst=(steps,o3,t0,gap,sfxName,col,first)=>o3.forEach((o,i)=>steps.push([t0+i*gap,()=>{ S(sfxName); ST.jolt(o.f,.45); scene('tb_rings',.5,{x:o.q.x,y:o.q.mid,r:44,c:col,w:3}); if(i===0) first(); }]));
const dcHeartPath=(g,cx,cy,r)=>{ gfx.beginPath(); gfx.moveTo(cx,cy+r*.95); gfx.bezierCurveTo(cx-r*1.7,cy-r*.1,cx-r*.8,cy-r*1.5,cx,cy-r*.5); gfx.bezierCurveTo(cx+r*.8,cy-r*1.5,cx+r*1.7,cy-r*.1,cx,cy+r*.95); gfx.closePath(); };

// A pot: stacked rows with a profile. h 0..1 grows it, bulge shapes the belly, squash flattens it.
const dcPot=(x,b,H,W,col,bulge,wob)=>{ if(H<=1) return; for(const pass of [0,1]) for(let y=0;y<H;y+=2) { const q=y/H,w=W*(.55+bulge*Math.sin(Math.PI*Math.min(1,q*.9+.05))+(q>.85?.18:0))+Math.sin(q*6+wob)*(wob?1.2:0),
      yy=b-y-2; if(pass===0) R(x-w/2-2,yy-1,w+4,4,OUT); else R(x-w/2,yy,w,2,q>.9?'#ffffff66'.slice(0,7):col); }
  gfx.globalAlpha*=.35; R(x-W*.3,b-H+2,3,Math.max(0,H-6),'#ffffff'); gfx.globalAlpha=1; };

// ---------- ff1_dc: Pottery Lesson ----------
B2_TOMBO_ANIM.ff1_dc=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),tom=by0('tom'),gr=by0('grace'),ro=by0('rose'),tn=by0('tnb');
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),H=dcHeights(E2),T=ST.unit(tom);
  const fc=cl(GR.x1+150,GR.x1+120,420),by=cl(Math.max(GR.base-10,T.base),236,292),kx=Math.min(fc+156,548);
  const X={rose:fc-92,grace:fc-34,tom:fc+24,tnb:fc+84},spot={};
  for(const id in X) spot[id]={x:X[id],b:by};
  const P={walk:800,tline:1100,grow0:1200,grow1:2300,fly:2400,rline:2900,sq:3200,col:3900,carry:4500,fire:5300,rock:5550,burst:5900,apply:6500,home:7000,end:7700};
  const st=dcRun(E2,spot,P,(u,ms,sp,S0,s2)=>{ let f=sp.idle,y=S0.b,x=S0.x;
    const work=ms>P.grow0&&ms<P.carry;
    if(u===ro) { if(ms>P.fly-100&&ms<P.fly+500) f=sp.celeb; else if(work) f=sp.act; if(ms>P.fly&&ms<P.fly+400) y-=Math.sin(seg(ms,P.fly,P.fly+400)*Math.PI)*10; }
    else if(u===gr) { if(ms>P.sq-150&&ms<P.sq+700) f=sp.celeb; else if(work) f=sp.act; }
    else if(u===tom) { if(ms>P.col&&ms<P.col+900) f=sp.kneel||sp.expr||sp.idle; else if(work) f=sp.act; }
    else { if(ms>P.tline-80&&ms<P.tline+800) f=sp.act; else if(ms>P.sq&&ms<P.col+900) f=sp.expr||sp.idle; }
    if(ms>P.burst&&ms<P.apply) f=sp.celeb; if(ms>=P.apply) f=sp.celeb; return {x,y,f}; });
  const show=dcShow(P),PO={rose:'#e07a5a',grace:'#f0a0d0',tom:'#6aa0d8',tnb:'#e8d8a8'};
  const wx=id=>X[id]-30, wy=by-8;
  const grow=(ms,a)=>ez(seg(ms,P.grow0+a,P.grow1+a*.5));
  // pot heights: Rose's launches, Grace's squishes, Tom's collapses, TNB's is perfect and goes first to the kiln
  const potH=(id,ms)=>{ const g=grow(ms,id==='tnb'?-100:(id==='tom'?150:0)),mx=id==='tnb'?34:28; return g*mx; };
  const carryK=(i,ms)=>ez(seg(ms,P.carry+i*150,P.carry+i*150+650));
  const kd=[kx-8,by-28];
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#2a2018',.45);
    gfx.globalAlpha=k*.25; E(fc+20,by-60,150,70,'#ffd9a0'); gfx.globalAlpha=1; }});
  const spin=ms=>ms*.02;
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    // kiln: brick dome with a glowing door and a chimney
    const ki=ez(seg(ms,500,1000)),fireK=ms>P.fire?ez(seg(ms,P.fire,P.fire+300))*(1-ez(seg(ms,P.apply,P.home))):0;
    if(ki>0) { gfx.globalAlpha=ki; E(kx,by-14,26,26,OUT); E(kx,by-14,24,24,'#a8553a'); R(kx-24,by-14,48,18,OUT); R(kx-22,by-14,44,16,'#a8553a');
      for(let j=0;j<4;j++) R(kx-22,by-12+j*4,44,1,'#7a3a28'); RO(kx+10,by-48,8,16,'#6a3a2a');
      RO(kx-9,by-14,18,13,'#241410'); gfx.globalAlpha=ki*(.25+fireK*.75); R(kx-7,by-12,14,9,'#ffb030'); R(kx-4,by-10,8,6,'#fff2a0'); gfx.globalAlpha=1;
      if(fireK>0) { gfx.globalAlpha=fireK*.3; E(kx,by-16,50,40,'#ffb030'); gfx.globalAlpha=1; } }
    // wheels and pots
    for(const id of ['rose','grace','tom','tnb']) { const w=ez(seg(ms,500+['rose','grace','tom','tnb'].indexOf(id)*90,1000)); if(w<=0) continue;
      const x=wx(id),y=wy; gfx.globalAlpha=w; RO(x-3,y,6,by-y,'#6a4a2a'); EO(x,y,16,4,'#7a828e');
      const sp2=ms>P.grow0&&ms<P.carry?spin(ms):0; for(let j=0;j<5;j++) R(x-14+((j*7+sp2)%28),y-1,2,2,'#a8b0bc'); gfx.globalAlpha=1;
      if(ms<P.grow0) continue;
      let h=potH(id,ms),sq=0,px=x,py=y-1,col=PO[id],bulge=.28,wob=0;
      if(id==='rose') { if(ms>P.fly) h=0; else wob=ms*.01; }
      if(id==='grace') { if(ms>P.sq) { const q=seg(ms,P.sq,P.sq+500); col=lerp(0,1,q)>.5?'#ff9ac0':col; bulge=.28+q*.25; h*=(1-.25*q)*(1+Math.sin(ms/110)*.08*q); wob=ms*.02*q; } }
      if(id==='tom') { if(ms>P.col) { const q=ez(seg(ms,P.col,P.col+500)); h*=1-.75*q; bulge=.28+q*.45; wob=q*3; } else wob=ms*.012*grow(ms,150); }
      if(ms>=P.carry) { const i=['grace','tom','tnb'].indexOf(id); if(i<0) continue; const c=carryK(i,ms); if(c>0) { px=lerp(x,kd[0],c); py=lerp(y-1,kd[1],c)-Math.sin(c*Math.PI)*34; h=lerp(h,10,c); if(c>=1) continue; } }
      gfx.globalAlpha=w; dcPot(px,py,h,26,col,bulge,wob); gfx.globalAlpha=1; }
    // Rose's pot flies to the first monster: a thrown vase on an arc
    const rf=seg(ms,P.fly,P.fly+520); if(rf>0&&rf<1) { const t0=o3[0].q,x=lerp(wx('rose'),t0.x,rf),y=lerp(wy-24,t0.mid,rf)-Math.sin(rf*Math.PI)*60; gfx.save(); gfx.translate(x,y); gfx.rotate(rf*9); dcPot(0,14,26,26,PO.rose,.28,0); gfx.restore(); }
    // fireworks over the monsters
    o3.forEach((o,i)=>{ const t0=P.rock+i*90,tb=P.burst+i*90,q=seg(ms,t0,tb),top=Math.max(50,o.q.top-24);
      if(q>0&&q<1) { const x=lerp(kx+14,o.q.x,ez(q)),y=lerp(by-48,top,q)-Math.sin(q*Math.PI)*30; R(x-1,y-1,3,3,'#fff2a0'); for(let j=1;j<5;j++) { gfx.globalAlpha=.5-j*.1; R(x-1+j*2,y+j*3,2,2,'#ffb030'); } gfx.globalAlpha=1; }
      const b=seg(ms,tb,tb+900); if(b>0&&b<1) { gfx.globalAlpha=1-b*b; for(let j=0;j<14;j++) { const an=j/14*Math.PI*2,r=b*(44+(j%2)*18); star(o.q.x+Math.cos(an)*r,top+Math.sin(an)*r+b*b*14,3.4-b,['#ff7a7a','#ffe08a','#8affc0','#8ac8ff','#ff9ac0'][j%5]); } gfx.globalAlpha=1; } });
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! TNB teaches the family pottery.'); B2.aim=null; S('click'); }],
    [P.tline,()=>{ say('tnb','dcff1'); }],
    [P.grow0,()=>{ S('whoosh'); setMessage('Four wheels, four lumps of clay. Gentle hands.'); }],
    [P.fly,()=>{ S('whoosh'); word('FLING!',fc-30,50,CREAM,4,.6); setMessage('Rose’s pot takes off.'); }],
    [P.fly+520,()=>{ S('bonk'); ST.jolt(o3[0].f,.4); scene('tb_rings',.4,{x:o3[0].q.x,y:o3[0].q.mid,r:30,c:'#ffd9a0',w:3}); }],
    [P.rline,()=>{ say('rose','dcff1'); }],
    [P.sq,()=>{ S('boing'); word('SQUISH',wx('grace'),by-90,'#ff9ac0',3,.7); setMessage('Grace’s pot turns into a squishy.'); }],
    [P.col,()=>{ S('thud'); word('plop',wx('tom'),by-70,CREAM,3,.6); setMessage('Tom’s pot gives up.'); }],
    [P.carry,()=>{ S('step'); setMessage('Into the kiln they all go.'); }],
    [P.fire,()=>{ S('rumble'); word('FWOOOM',kx,by-80,'#ffb030',4,.8); setMessage('The kiln fires up.'); }],
    [P.rock,()=>{ S('whoosh'); }],
    [P.apply,()=>{ E2.apply(); S('chime2'); dcGlow(E2,st,H,GOLD); }],
    [P.end,'end',()=>(E2.result||'')+' Tom’s pot is still a puddle. TNB says it has character.']];
  dcFoeBurst(steps,o3,P.burst,90,'chime2','#ffe08a',()=>landHit(100));
  ST.play(E2,steps);
};

// ---------- ff2_dc: Breakfast in Bed ----------
B2_TOMBO_ANIM.ff2_dc=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),amy=by0('amy'),gr=by0('grace'),ro=by0('rose');
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),H=dcHeights(E2),A=ST.unit(amy);
  const ax=cl(GR.x1+160,GR.x1+130,460),by=cl(Math.max(GR.base-10,A.base),236,292),gx=ax-62,rx=ax-102;
  const spot={amy:{x:ax+8,b:by},grace:{x:gx,b:by+4},rose:{x:rx,b:by+8}};
  const P={walk:800,gline:1150,flip0:1200,flip1:2500,syr0:2700,syr1:3500,rline:3200,wake:3700,aline:3900,tip:4300,fly:4700,hit:5200,apply:5900,home:6400,end:7100};
  const NP=8,stk=ms=>Math.floor(ez(seg(ms,P.flip0,P.flip1))*NP+.001);
  const st=dcRun(E2,spot,P,(u,ms,sp,S0)=>{ let f=sp.idle,y=S0.b;
    if(u===amy) { f=ms<P.wake?(sp.kneel||sp.idle):(ms<P.apply?sp.celeb:sp.idle); if(ms>P.wake&&ms<P.wake+300) y-=Math.sin(seg(ms,P.wake,P.wake+300)*Math.PI)*8; }
    else if(u===gr) { f=ms>P.flip0&&ms<P.tip?(Math.floor(ms/260)%2?sp.act:sp.idle):(ms>=P.tip&&ms<P.fly?sp.expr||sp.idle:sp.idle); if(ms>=P.fly) f=sp.celeb; }
    else { f=ms>P.syr0&&ms<P.syr1?sp.act:(ms>=P.tip&&ms<P.fly?sp.expr||sp.idle:sp.idle); if(ms>=P.fly) f=sp.celeb; }
    return {y,f}; });
  const show=dcShow(P),tx=ax-40,ty=by-30;   // tray stands on the bed's foot
  const stackTop=ms=>ty-4-stk(ms)*3.2;
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#3a2230',.4);
    // morning light through a window
    gfx.globalAlpha=k*(.2+.2*ez(seg(ms,P.wake-300,P.wake+400))); R(ax-30,40,60,80,'#ffe9a8'); gfx.globalAlpha=k; RO(ax-20,48,40,50,'#bfe0ef'); R(ax-1,48,2,50,OUT); R(ax-20,72,40,2,OUT); gfx.globalAlpha=1;
    const bi=ez(seg(ms,300,800)); gfx.globalAlpha=bi*k; RO(ax-10,by-48,48,14,'#fff6dc'); R(ax-6,by-46,40,3,'#ffffff'); gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; const bi=ez(seg(ms,300,800));
    // the bed: frame, blanket, tray
    if(bi>0) { gfx.globalAlpha=bi; RO(ax-34,by-22,90,26,'#8a5a30'); R(ax-34,by-22,90,3,'#a8723e'); RO(ax-30,by-30,80,16,'#ff9ac0'); R(ax-30,by-30,80,3,'#ffc4dc');
      for(let j=0;j<5;j++) { R(ax-24+j*16,by-26,5,5,'#ffdbe9'); } RO(ax+54,by-36,6,38,'#8a5a30'); gfx.globalAlpha=1; }
    // the Zs, then a heart when Mom wakes
    if(ms>P.walk&&ms<P.wake) { const z=Math.floor(ms/450)%3; for(let j=0;j<=z;j++) label('Z',ax+22+j*7,by-88-j*10-((ms/90)%6),'#cfe0ff',1+j%2); }
    if(ms>P.wake&&ms<P.wake+900) { const q=seg(ms,P.wake,P.wake+900); gfx.globalAlpha=1-q; heart(ax+8,by-100-q*22,6,PINK); gfx.globalAlpha=1; }
    // the tray and the pancake stack
    if(bi>0) { const lift=ms>P.tip?0:0,tiltQ=ms>P.tip&&ms<P.fly?ez(seg(ms,P.tip,P.fly)):0,w=Math.sin(ms/70)*tiltQ*2;
      gfx.save(); gfx.translate(tx,ty); gfx.rotate(tiltQ*-.5+w*.01); RO(-26,0,52,5,'#c8a060');
      if(ms<P.fly+600) { for(let j=0;j<stk(ms);j++) { const jy=-4-j*3.2,sh=Math.sin(ms/60+j)*tiltQ*3; EO(sh,jy,17-j%2,3.2,j%2?'#e8b868':'#f0c878'); }
        const sy=seg(ms,P.syr0,P.syr1); if(sy>0&&stk(ms)>0) { const topY=-4-(stk(ms)-1)*3.2; gfx.globalAlpha=.9; E(0,topY-1,15*sy,2.6,'#8a4a1a'); for(let j=0;j<5;j++) { const dx=-12+j*6,dl=Math.min(1,sy*1.2)*(6+((j*5)%7)); R(dx,topY,2,dl,'#8a4a1a'); } gfx.globalAlpha=1; }
        if(stk(ms)>=NP-1) { EO(0,-4-(NP)*3.2,4,3,'#fff2a0'); } }
      gfx.restore();
      // the syrup bottle in Rose's hand
      const sy=seg(ms,P.syr0,P.syr1); if(sy>0&&sy<1) { gfx.save(); gfx.translate(tx+14,ty-40-stk(ms)*3); gfx.rotate(-2.2); RO(-4,-8,8,14,'#a8561e'); R(-2,-12,4,4,'#f6f0dc'); gfx.restore(); } }
    // pancakes fly over the monsters
    o3.forEach((o,i)=>{ const q=seg(ms,P.fly+i*80,P.hit+i*70-0); if(q>0&&q<1) { const x=lerp(tx,o.q.x,ez(q)),y=lerp(ty-20,o.q.mid,q)-Math.sin(q*Math.PI)*56; gfx.save(); gfx.translate(x,y); gfx.rotate(q*14); EO(0,0,14,4,'#f0c878'); E(0,-1,9,2,'#8a4a1a'); gfx.restore(); }
      const sp=seg(ms,P.hit+i*70,P.hit+i*70+1300); if(sp>0&&sp<1) { gfx.globalAlpha=1-sp*sp; for(let j=0;j<6;j++) E(o.q.x+Math.cos(j*1.05)*(10+sp*18),o.q.mid-4+Math.sin(j*1.05)*(8+sp*12)+sp*sp*20,3.2,2.6,j%2?'#8a4a1a':'#f0c878'); gfx.globalAlpha=1; } });
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! The girls make Mom breakfast in bed.'); B2.aim=null; S('click'); }],
    [P.gline,()=>{ }],
    [P.flip0,()=>{ S('sizzle'); setMessage('Grace flips. Dairy-free pancakes, one by one.'); }],
    [P.syr0,()=>{ S('splash'); setMessage('Rose is on syrup.'); }],
    [P.rline,()=>{ say('rose','dcff2'); }],
    [P.wake,()=>{ S('chime2'); word('MOM!',ax+8,60,GOLD,4,.7); setMessage('Mom wakes up. The stack is a little tall.'); }],
    [P.aline,()=>{ say('grace','dcff2'); }],
    [P.tip,()=>{ S('rumble'); setMessage('The tower leans.'); }],
    [P.fly,()=>{ S('whoosh'); word('TIMBER!',tx,50,CREAM,4,.8); setMessage('It tips onto the monsters.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); dcGlow(E2,st,H,GOLD); }],
    [P.end,'end',()=>(E2.result||'')+' Mom says it\'s the best breakfast ever. The monsters agree.']];
  dcFoeBurst(steps,o3,P.hit,70,'splat','#ffd9a0',()=>landHit(100));
  ST.play(E2,steps);
};

// ---------- ff3_dc: The Family Walk ----------
B2_TOMBO_ANIM.ff3_dc=E2=>{ B2.aim=null;
  const mem=E2.mem,by0=id=>mem.find(p=>p.id===id),dd=by0('deedee'),bp=by0('boppy'),tom=by0('tom');
  const list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),H=dcHeights(E2),T=ST.unit(tom);
  const by=cl(Math.max(GR.base-8,T.base),236,292),x0=cl(GR.x1+200,GR.x1+170,500),dist=80;
  const off={deedee:-34,tom:0,boppy:36},spot={};
  for(const id in off) spot[id]={x:x0+off[id],b:by};
  const P={walk:800,go:1000,stop:4300,bline:1900,dline:3000,burst:4500,apply:5300,home:5800,end:6500};
  const wk=ms=>ez(seg(ms,P.go,P.stop));
  const slow=(sp,t)=>sp.run?sp.run[Math.floor(t*5)%2]:sp.idle;
  const st=dcRun(E2,spot,P,(u,ms,sp,S0)=>{ const k=wk(ms),moving=ms>P.go&&ms<P.stop; let x=S0.x-dist*k+(u===dd?-10*k:(u===bp?10*k:0)),y=S0.b,f=sp.idle;
    if(moving) { f=slow(sp,ms/1000+(u===bp?.2:0)); y-=Math.abs(Math.sin(ms/190+(u===bp?1:0)))*(u===bp?1.2:2.4); }
    else if(ms>=P.stop) f=u===tom?sp.celeb:(sp.expr||sp.idle);
    if(u===bp&&ms>P.bline-100&&ms<P.bline+1200) f=sp.hip||sp.act||sp.idle;
    if(u===dd&&ms>P.dline-100&&ms<P.dline+1000) f=sp.act||sp.idle;
    return {x,y,f}; });
  const show=dcShow(P),lamps=[0,1,2,3,4,5].map(i=>({x:60+i*110,i}));
  const fl=Array.from({length:14},(_,j)=>({a:j*1.7,r:20+(j*13)%50,y:by-70-(j*17)%60,sp:.6+(j%4)*.2}));
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#14183a',.6);
    gfx.globalAlpha=k*.7; for(let j=0;j<26;j++) R((j*61)%576,(j*37)%110,2,2,j%3?'#cfd8ff':'#fff6dc'); gfx.globalAlpha=1;
    E(480,56,16,16,'#fff6dc'); E(488,52,15,15,'#14183a'.length?'#1c2250':'#1c2250');
    const sc=ms>P.go?(ms-P.go)*.016:0;   // street lamps drift past as they walk
    for(const L of lamps) { const lx=((L.x-sc)%660+660)%660-40,lit=ez(seg(ms,600+L.i*350,1000+L.i*350));
      RO(lx-2,by-96,4,98,'#3a3a46'); RO(lx-8,by-100,16,6,'#3a3a46'); if(lit>0) { gfx.globalAlpha=k*lit*.25; E(lx,by-90,40,44,'#ffd27a'); gfx.globalAlpha=k*lit; E(lx,by-95,5,3,'#fff2b0'); gfx.globalAlpha=1; } } }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    // the path
    gfx.globalAlpha=k*.5; R(0,by+2,576,6,'#4a3c30'); for(let x=-((ms-P.go)*.016*1.0)%40;x<576;x+=40) R(x,by+4,14,2,'#6a5a48'); gfx.globalAlpha=1;
    // fireflies drift, then swirl: some to the monsters (warm), some to the walkers (heal)
    const mid=(st.tom.x),my=by-H.tom*.6;
    fl.forEach((F,j)=>{ const q=seg(ms,P.burst,P.apply),fo=o3[j%o3.length].q;
      let x=mid+Math.cos(ms/900*F.sp+F.a)*(30+F.r),y=F.y+Math.sin(ms/700+F.a)*8;
      if(ms>P.stop-400&&ms<=P.burst) { const a=ez(seg(ms,P.stop-400,P.burst)); x=lerp(x,mid+Math.cos(ms/200+F.a)*30,a); y=lerp(y,my+Math.sin(ms/200+F.a)*22,a); }
      if(ms>P.burst) { if(j%2===0) { x=lerp(mid+Math.cos(ms/200+F.a)*30,fo.x,ez(q)); y=lerp(my+Math.sin(ms/200+F.a)*22,fo.mid,ez(q))-Math.sin(q*Math.PI)*30; } else { const p=b2LiveParty()[j%b2LiveParty().length],pu=st[p.id]; if(pu) { x=lerp(mid+Math.cos(ms/200+F.a)*30,pu.x,ez(q)); y=lerp(my,pu.b-H[p.id]*.5,ez(q)); } } }
      if(ms>P.apply+300) return; const al=ez(seg(ms,400,1400))*(1-ez(seg(ms,P.apply,P.apply+300)));
      gfx.globalAlpha=al*k*.35; E(x,y,5,5,'#fff2a0'); gfx.globalAlpha=al*k; R(x-1,y-1,2,2,'#fffbe6'); gfx.globalAlpha=1; });
    // a heart over Tom when they stop; the group holds hands (a small arc between)
    if(ms>P.stop&&ms<P.apply+600) { const q=seg(ms,P.stop,P.apply+600); gfx.globalAlpha=Math.min(1,q*4)*(1-q*q); heart(mid,my-H.tom*.5-16-q*14,8,PINK); gfx.globalAlpha=1; }
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! An evening walk. Tom in the middle.'); B2.aim=null; S('click'); }],
    [P.go,()=>{ S('step'); setMessage('Deedee sets the pace. Boppy has opinions about it.'); }],
    [P.bline,()=>{ say('boppy','dcff3'); }],
    [P.dline,()=>{ say('deedee','dcff3'); }],
    [P.stop,()=>{ S('chime'); setMessage('They stop. Fireflies come out.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); dcGlow(E2,st,H,GOLD); }],
    [P.end,'end',()=>(E2.result||'')+' Boppy’s feet hurt. He\'ll say it was worth it.']];
  dcFoeBurst(steps,o3,P.burst+500,90,'chime2','#fff2a0',()=>landHit(100));
  ST.play(E2,steps);
};

// ---------- ff4_dc: The Eight-Seat Dinner Table ----------
B2_TOMBO_ANIM.ff4_dc=E2=>{ B2.aim=null;
  const mem=E2.mem,list=b2LiveFoes(),GR=ST.group(list),o3=order3(list),H=dcHeights(E2),T=ST.unit(mem.find(p=>p.id==='tom')||mem[0]);
  const by=cl(Math.max(GR.base-6,T.base),240,292),x1=546,x0=Math.max(GR.x1+60,x1-300),sp8=(x1-x0)/8;
  const seatX=i=>x0+sp8*(i+.5),tcx=(x0+x1)/2,ring=by-120;
  // the party sit at seats chosen from the eight (spread out); the other seats light up on their own
  const pick=mem.length>=4?[1,3,5,7]:[1,4,6],spot={};
  mem.forEach((u,i)=>{ spot[u.id]={x:seatX(pick[i]),b:by-10}; });
  const P={walk:800,table:300,light0:1100,tline:2400,rise:3300,rline:3900,heart:4700,beam:5200,hit:5600,apply:6200,home:6700,end:7400};
  const st=dcRun(E2,spot,P,(u,ms,sp,S0)=>{ let f=ms>P.light0+1800?(ms<P.apply?sp.celeb:sp.celeb):sp.idle; if(u.id==='tom'&&ms>P.tline-100&&ms<P.tline+900) f=sp.act; return {y:S0.b-(f===sp.celeb?Math.abs(Math.sin(ms/160))*2:0),f}; });
  const COL=['#ff7a7a','#ffb04a','#ffe08a','#8affc0','#8ac8ff','#9a8aff','#ff9ac0','#ffffff'];
  const show=dcShow(P),taken=new Set(pick.slice(0,mem.length));
  const orb=(i,ms)=>{ const t0=P.light0+i*220,a=ez(seg(ms,t0,t0+300)); const x=seatX(i),y=by-62;
    const rs=ez(seg(ms,P.rise,P.heart)),an=ms/900+i/8*Math.PI*2,rx=lerp(x,tcx+Math.cos(an)*62,rs),ry=lerp(y,ring+Math.sin(an)*18,rs);
    const hs=ez(seg(ms,P.heart,P.beam)); const j=i/8*Math.PI*2,hx=tcx+16*Math.pow(Math.sin(j),3)*1.6,hy=ring-(13*Math.cos(j)-5*Math.cos(2*j)-2*Math.cos(3*j)-Math.cos(4*j))*1.6;
    return {a,x:lerp(rx,hx,hs),y:lerp(ry,hy,hs)}; };
  scene('tb_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return; dim(k,'#241810',.5);
    gfx.globalAlpha=k*.22; E(tcx,by-40,180,80,'#ffcf8a'); gfx.globalAlpha=1; }});
  scene('tb_draw',P.end/1000,{draw:(s2,u,ms)=>{ const k=show(ms); if(k<=0) return;
    const ti=ez(seg(ms,P.table,P.table+500)),yo=(1-ti)*-60; gfx.globalAlpha=ti;
    // the long table: cloth, legs, plates and candles
    RO(x0,by-36+yo,x1-x0,6,'#8a5a30'); R(x0,by-36+yo,x1-x0,2,'#a8723e'); RO(x0+2,by-30+yo,x1-x0-4,32,'#f4efe2'); for(let x=x0+6;x<x1-6;x+=12) R(x,by-30+yo,2,30,'#e6ddc8');
    for(let i=0;i<8;i++) { EO(seatX(i),by-34+yo,9,2.6,'#fffbe6'); }
    gfx.globalAlpha=1;
    // the orbs: seat lights, rise into a rainbow ring, then fold into a heart
    for(let i=0;i<8;i++) { const o=orb(i,ms); if(o.a<=0) continue; const al=o.a*(ms>P.beam?1-ez(seg(ms,P.beam,P.beam+500)):1);
      gfx.globalAlpha=al*.3; E(o.x,o.y,9,9,COL[i]); gfx.globalAlpha=al; EO(o.x,o.y,3.4,3.4,COL[i]); R(o.x-1,o.y-2,1,1,'#ffffff');
      if(ms>P.rise&&ms<P.beam) { gfx.globalAlpha=al*.4; E(o.x-Math.sin(ms/900+i)*5,o.y+3,2,2,COL[i]); } gfx.globalAlpha=1; }
    // the heart that forms, then fires a beam at the monsters
    if(ms>P.heart&&ms<P.beam+500) { const q=ez(seg(ms,P.heart,P.beam)),pul=1+Math.sin(ms/80)*.05; gfx.globalAlpha=q*(1-ez(seg(ms,P.beam,P.beam+500))); dcHeartPath(0,tcx,ring,26*q*pul); gfx.fillStyle='#ff9ac0'; gfx.fill(); gfx.globalAlpha*=.6; dcHeartPath(0,tcx-4,ring-4,12*q); gfx.fillStyle='#ffe0ee'; gfx.fill(); gfx.globalAlpha=1; }
    o3.forEach((o,i)=>{ const q=seg(ms,P.beam+i*60,P.hit+i*70); if(q>0&&q<1) { const x=lerp(tcx,o.q.x,ez(q)),y=lerp(ring,o.q.mid,ez(q))-Math.sin(q*Math.PI)*34; gfx.save(); gfx.translate(x,y); dcHeartPath(0,0,0,9); gfx.fillStyle='#ff9ac0'; gfx.fill(); gfx.restore(); for(let j=1;j<5;j++) { gfx.globalAlpha=.5-j*.1; E(x+j*5,y+j*2,3,3,COL[(i+j)%8]); } gfx.globalAlpha=1; }
      const sp=seg(ms,P.hit+i*70,P.hit+i*70+900); if(sp>0&&sp<1) { gfx.globalAlpha=1-sp; for(let j=0;j<8;j++) { const an=j*.78+sp; star(o.q.x+Math.cos(an)*(14+sp*22),o.q.mid+Math.sin(an)*(14+sp*18),2.6,COL[j]); } gfx.globalAlpha=1; } });
    bars(k); }});
  const steps=[
    [0,()=>{ setMessage('DIRECTOR’S CUT! One long table, eight seats.'); B2.aim=null; S('click'); }],
    [P.table,()=>{ S('thud'); }],
    [P.light0,()=>{ setMessage('Every seat gets a little light.'); }],
    [P.tline,()=>{ say('tom','dcff4'); }],
    [P.rise,()=>{ S('whoosh'); setMessage('The lights rise and start to circle.'); }],
    [P.rline,()=>{ say('rose','dcff4'); }],
    [P.heart,()=>{ S('levelUp'); word('HEART',tcx,Math.max(48,ring-60),'#ff9ac0',4,.9); setMessage('They fold into one big heart.'); }],
    [P.beam,()=>{ S('whoosh'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); dcGlow(E2,st,H,GOLD); }],
    [P.end,'end',()=>(E2.result||'')+' There was a seat for the monsters too. Nobody minded.']];
  for(let i=0;i<8;i++) steps.push([P.light0+i*220,()=>{ S('chime'); }]);
  dcFoeBurst(steps,o3,P.hit,70,'chime2','#ff9ac0',()=>landHit(100));
  ST.play(E2,steps);
};
})();
// ================= Task U: Family Move Lab Tombo rebuilds (27 Oct 2026, claude/family-lab-feedback.md) =================
// Tom + Amy, Tom + Deedee and Tom + Boppy Tombos rebuilt as custom scenes. Keys, costs, multipliers and effects are
// unchanged; names, descriptions and lines for the replaced ones live in data/battle2-data.js and data/lines.js.
// Both bodies start from the staging spots (b2StageOut) and read one timeline, so they never cross or overlap.
// Flashbacks hide the grown-ups and draw child versions of Tom and Amy (kid(), below). Scenes prefix tu_ (no warp).
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const seg=(ms,a,b)=>cl((ms-a)/(b-a));
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const PO=(pts,c,o=2)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); if(o) { gfx.strokeStyle=OUT; gfx.lineWidth=o; gfx.lineJoin='round'; gfx.stroke(); } };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const heart=(x,y,r,c)=>{ gfx.beginPath(); gfx.moveTo(x,y+r*.9); gfx.bezierCurveTo(x-r*1.6,y-r*.2,x-r*.7,y-r*1.4,x,y-r*.45); gfx.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.6,y-r*.2,x,y+r*.9); gfx.closePath(); gfx.lineWidth=2.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); };
const S=(k,...a)=>{ try { if(sfx[k]) sfx[k](...a); } catch(e){} };
const CREAM='#fff6dc',GOLD='#ffe08a',GOLD2='#ffc23a',PINK='#ff9ac0',RED='#e0402e',SKY='#9fd8ff',MINT='#8ef0a0',BLUE='#1f4fae',WOOD='#9a6a3a',WOOD2='#c48a4a',WOOD3='#6e4824',GREEN='#6fae5a',GREEN2='#3f8a4a';
const CONF=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff','#ffffff'];
ST.nw('tu_');
const word=(txt,x,y,c,sc=4,dur=1,rot=0)=>scene('tu_word',dur,{txt,x,y,c,sc,rot});
SC.tu_word=(s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  const x=Math.max(w/2+8,Math.min(568-w/2,s.x)),y=Math.max(sc*5+14,s.y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||GOLD,sc); gfx.restore(); gfx.globalAlpha=1; };
SC.tu_draw=(s,u)=>{ s.draw(s,u,s.t*1000); gfx.globalAlpha=1; };
SC.tu_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.3-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; ring(s.x,s.y,6+q*(s.r||40),4+q*(s.r||40)*.6,s.w||3,s.c||CREAM); } gfx.globalAlpha=1; };
SC.tu_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.tu_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5); star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?GOLD:CREAM,u*4+k); } gfx.globalAlpha=1; };
SC.tu_dust=(s,u)=>{ for(let k=0;k<(s.n||10);k++) { const a=Math.PI+k/((s.n||10)-1)*Math.PI,d=ez(u)*(s.r||34); gfx.globalAlpha=(1-u)*.85; E(s.x+Math.cos(a)*d*1.4,s.y+Math.sin(a)*d*.5,5*(1-u)+2,4*(1-u)+2,'#e8dcc4'); } gfx.globalAlpha=1; };
SC.tu_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||40,s.ry||56,s.c||GOLD); gfx.globalAlpha=1; };
SC.tu_notes=(s,u)=>{ for(let k=0;k<(s.n||6);k++) { const q=cl(u*1.5-k*.1); if(q<=0||q>=1) continue; const x=s.x-24+k*12+Math.sin(q*7+k)*10,y=s.y-q*70; gfx.globalAlpha=1-q; EO(x,y,4,3,k%2?PINK:CREAM); LnO(x+4,y,x+4,y-14,2,k%2?PINK:CREAM); } gfx.globalAlpha=1; };
SC.tu_confetti=(s,u)=>{ for(let k=0;k<(s.n||30);k++) { const x=s.x0+((k*61)%100)/100*(s.x1-s.x0),y=lerp(-20,300,cl(u*1.2-k*.01)),a=u*8+k; gfx.globalAlpha=fade(u,.7); gfx.save(); gfx.translate(x+Math.sin(u*6+k)*8,y); gfx.rotate(a); R(-3,-2,6,4,CONF[k%7]); gfx.restore(); } gfx.globalAlpha=1; };
// Letterbox and a warm sepia tint for flashbacks.
// BACK IN 1989: the past plays as an old home movie, like Boppy's 1970 ultimate. The projector clicks on, the screen goes sepia
// with flicker, grain, scratches and a vignette, sprocket holes run along the letterbox bars, and a title card counts down 3, 2, 1
// then reads BACK IN 1989 (s.txt is the line under it).
SC.tu_flashback=(s,u)=>{ const k=ez(u/.06)*(u>.95?(1-u)/.05:1); if(k<=0) return; const ms=s.t*1000,BARH=24;
  gfx.save(); gfx.globalCompositeOperation='color'; gfx.globalAlpha=k*.9; R(0,0,576,324,'#a07a48'); gfx.restore();
  gfx.save(); gfx.globalCompositeOperation='multiply'; gfx.globalAlpha=k*.32; R(0,0,576,324,'#f0d8a8'); gfx.restore();
  gfx.globalAlpha=k*(.04+.04*Math.sin(s.t*47)); R(0,0,576,324,'#fff4dc');
  const sd=Math.floor(s.t*24); for(let j=0;j<60;j++) { const r=((sd*131+j*977)%10007)/10007,r2=((sd*71+j*331)%9973)/9973; gfx.globalAlpha=k*.35; R(r*576,BARH+r2*(324-BARH*2),1.5,1.5,j%2?'#3a2a1a':'#fff4dc'); }
  for(let j=0;j<2;j++) { const r=((sd*53+j*211)%997)/997; if(r<.55) { gfx.globalAlpha=k*.3; R(r*1000%576,BARH,1,324-BARH*2,'#2a1a0a'); } }
  const g=gfx.createRadialGradient(288,162,120,288,162,330); g.addColorStop(0,'rgba(40,24,8,0)'); g.addColorStop(1,'rgba(40,24,8,0.55)'); gfx.globalAlpha=k; gfx.fillStyle=g; gfx.fillRect(0,0,576,324);
  gfx.globalAlpha=1; R(0,0,576,BARH*k,'#000'); R(0,324-BARH*k,576,BARH*k,'#000');
  if(k>.9) { const o=(ms/8)%28; for(let x=-28+o;x<590;x+=28) { R(x,7,14,10,'#e8dcc4'); R(x,307,14,10,'#e8dcc4'); } }
  if(s.t<1.6) { const a=cl(s.t/.1)*cl((1.6-s.t)/.3); gfx.globalAlpha=a*.92; RO(128,40,320,108,'#f4ead4'); R(134,46,308,96,'#2a2016'); gfx.globalAlpha=a;
    const q=cl(s.t/.5);
    if(q<1) { gfx.strokeStyle='#f4ead4'; gfx.lineWidth=3; gfx.beginPath(); gfx.arc(288,94,34,0,Math.PI*2); gfx.stroke(); gfx.beginPath(); gfx.moveTo(288,94); gfx.lineTo(288+Math.cos(q*Math.PI*2-Math.PI/2)*34,94+Math.sin(q*Math.PI*2-Math.PI/2)*34); gfx.stroke(); bigWord(String(3-Math.floor(q*3)),288,86,'#f4ead4',3); }
    else { bigWord('BACK IN 1989',288,66,'#f4ead4',4); label(s.txt||'',288,108,'#c8b090',2); }
    gfx.globalAlpha=1; } };
const runFr=(sp,t,dir)=>dir>0?(sp.runFlip?sp.runFlip[Math.floor(t*12)%2]:sp.flip):(sp.run?sp.run[Math.floor(t*12)%2]:sp.idle);
const pathOf=(fx,dur,fn)=>{ fx.path={t:0,dur:dur/1000,fn:(q,c)=>fn(q*dur,c)}; };
const glowOn=u=>{ const h=ST.unit(u); scene('glow',.9,{x:h.x,y:h.mid,rx:38,ry:52,c:GOLD,a:.35}); };
if(typeof amyLabPoses==='function') { const _p=amyLabPoses; var amyPoses=()=>_p(); } else var amyPoses=()=>{};
const mirC=new Map(); const mir=(sp,k)=>{ const r=sp[k]; if(!r) return sp.flip; if(!mirC.has(r)) mirC.set(r,mirrorRows(r)); return mirC.get(r); };
const F=(sp,k)=>sp[k]||sp.idle;
const mirT=(()=>{ const m=new Map(); return (sp,k)=>{ const key=sp[k]; if(!m.has(key)) m.set(key,mirrorRows(key)); return m.get(key); }; })();
// A body at a spot with a frame; the function form keeps the move's own state up to date for the drawing scene.
const stand=(st,x,y,f,rot=0,hide=false)=>{ st.x=x; st.b=y; st.f=f; return {cx:x,base:y,frame:f,rot,hide}; };
const shares=(n,total=100)=>Array.from({length:n},(_,k)=>Math.floor(total/n)+(k<total%n?1:0));
const hitFoes=(tgts,share,word1)=>tgts.forEach((f,k)=>{ const q=ST.foe(f); ST.jolt(f,.45); scene('tu_rings',.6,{x:q.x,y:q.mid,r:46}); landHit(share[k]); });

// ---------- Child Tom and child Amy (flashbacks) ----------
// Drawn by data/kid-sprites.js (KIDS): shaded, outlined pixel children about half the grown-ups' height, with their own
// outfits (Tom: full head of hair, yellow striped tee, denim shorts, red sneakers. Amy: pigtails with bows, teal dress).
// who: 'tom' or 'amy'. pose: idle, run, up, cheer, stir, throw, swing, sit, point, cry, hold. dir -1 faces left.
function kid(x,y,who,pose,t=0,dir=-1,o={}) { KIDS.draw(x,y,who,pose,t,dir,o); }

// ---------- I Called It! (Tom + Amy, tier 1): sibling dibs, settled badly ----------
// Both lunge, point, and bicker (MINE / I SAW IT FIRST / YOU'RE SLOW / I'M OLDER). A best-of-three rock paper scissors
// that ties twice. They give up and charge together, shoulder to shoulder, straight through every monster. Amy calls it.
// Effects: Kinetic and Sparkle hit on all, party PEP +30% for 3 turns.
const rps=(x,y,k,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); if(k===0) { EO(0,0,11,9,'#f0b892'); E(-3,-3,3,2,'#f7caa8'); } else if(k===1) { RO(-10,-9,20,18,'#f0b892'); for(let j=0;j<4;j++) R(-8+j*5,-14,3,7,'#f0b892'); R(-9,-16,19,2,OUT); } else { EO(0,2,9,7,'#f0b892'); LnO(-4,-2,-14,-16,4,'#f0b892'); LnO(4,-2,6,-18,4,'#f0b892'); } gfx.restore(); };
B2_TOMBO_ANIM.amy1=E2=>{ amyPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),A=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const by=Math.min(312,Math.max(T.base,A.base)),Lx=cl(GR.x1+60,160,286),Rx=Lx+92;
  const P={run:600,bick:[800,1150,1500,1850],rps:2300,rpsN:3,rpsEach:700,chargeAt:0,end:0};
  P.chargeAt=P.rps+P.rpsN*P.rpsEach+400; const CH=P.chargeAt,SW=CH+700,CALL=SW+600; P.end=CALL+2600;
  const sT={x:T.x,b:T.base,f:tsp.idle},sA={x:A.x,b:A.base,f:asp.idle},hands={t:0,a:0,show:false};
  const xAt=k=>{ const f=tgts[k]; const q=f?ST.foe(f):{x:GR.x0+20}; return q.x+8; };
  const body=(who,ms,c)=>{ const sp=c.sp,isA=who==='amy',st=isA?sA:sT,home={x:isA?Rx:Lx,y:isA?by+8:by};
    if(ms<P.run) { const k=ez(ms/P.run); return stand(st,lerp(c.origX,home.x,k),lerp(c.origBase,home.y,k),runFr(sp,c.t,-1)); }
    if(ms<P.rps) { const j=P.bick.findIndex((b,i)=>ms>=b&&ms<(P.bick[i+1]||P.rps)),mine=j>=0&&(j%2===0)===!isA,lean=mine?-6:0; return stand(st,home.x+lean,home.y,mine?(isA?F(sp,'point'):sp.act):(isA?sp.hip:sp.idle)); }
    if(ms<CH) { const q=ms-P.rps,r=Math.floor(q/P.rpsEach),w=q-r*P.rpsEach,sh=w<420?Math.abs(Math.sin(w/70))*4:0; return stand(st,home.x,home.y-sh,isA?F(sp,'pump'):sp.act); }
    if(ms<SW) { const u=ez(seg(ms,CH,SW)); const x=lerp(home.x,GR.x0-10,u),y=home.y; return stand(st,x,y,runFr(sp,c.t,-1)); }
    if(ms<CALL) { const u=seg(ms,SW,CALL); return stand(st,lerp(GR.x0-10,home.x,ez(u)),home.y-Math.sin(u*Math.PI)*16,runFr(sp,c.t,1)); }
    if(ms<P.end-600) { return stand(st,home.x,home.y,isA?(ms<CALL+1500?sp.celeb:F(sp,'celeb2')):(ms<CALL+1200?sp.flip:sp.idle)); }
    const k=ez(seg(ms,P.end-600,P.end)); return stand(st,lerp(home.x,c.origX,k),lerp(home.y,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); };
  pathOf(fxT,P.end,(ms,c)=>body('tom',ms,c)); pathOf(fxP,P.end,(ms,c)=>body('amy',ms,c));
  const PICK=[[0,0],[1,1],[2,0]];   // rock-rock, paper-paper, scissors beats paper? no: tie, tie, then they quit
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.bick[0]&&ms<P.rps) { const pulse=1+Math.sin(ms/70)*.15; for(const [x,y] of [[sT.x+14,sT.b-TH-6],[sA.x+12,sA.b-AH+10]]) for(const [dx,dy,r] of [[-1,-1,0],[1,-1,1.57],[1,1,3.14],[-1,1,4.71]]) { gfx.save(); gfx.translate(x+dx*6,y+dy*6); gfx.rotate(r); gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(-4*pulse,-4*pulse,4*pulse,0,Math.PI/2); gfx.stroke(); gfx.strokeStyle=RED; gfx.lineWidth=2; gfx.stroke(); gfx.restore(); } }
    if(ms>P.rps&&ms<CH) { const q=ms-P.rps,r=Math.min(P.rpsN-1,Math.floor(q/P.rpsEach)),w=q-r*P.rpsEach,shake=w<420,sc=1+(shake?Math.abs(Math.sin(w/70))*.1:0);
      const hy=by-TH-24; rps(sT.x+10,hy+Math.sin(w/70)*(shake?6:0),shake?0:PICK[r][0],sc); rps(sA.x-6,by+8-AH-16+Math.sin(w/70)*(shake?6:0),shake?0:PICK[r][1],sc);
      if(!shake&&r<2) bigWord('TIE!',(sT.x+sA.x)/2,hy-30,CREAM,3); } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom and Amy both lunge for the same monster.'); S('whoosh'); }],
    [P.bick[0],()=>{ word('MINE!',Lx-10,by-TH-26,CREAM,4,.5); S('bump'); }],
    [P.bick[1],()=>{ word('I SAW IT FIRST!',Rx+10,by-AH-26,PINK,3,.5); S('bump'); setMessage('They bicker like they\'re kids again.'); }],
    [P.bick[2],()=>{ word('I WON AT MARIO!',Lx-30,by-TH-26,CREAM,3,.5); S('squeak'); }],
    [P.bick[3],()=>{ word('I RAN EIGHT MILES!',Rx-10,by-AH-26,PINK,3,.5); S('squeak'); }],
    [P.rps,()=>{ setMessage('Rock, paper, scissors. Best of three.'); S('select'); }],
    [P.rps+420,()=>{ S('bonk'); }],[P.rps+P.rpsEach+420,()=>{ S('bonk'); setMessage('Tie. Again. Tie. AGAIN.'); }],
    [P.rps+2*P.rpsEach+420,()=>{ S('nope'); word('FORGET IT!',(Lx+Rx)/2,by-TH-50,GOLD,4,.7); setMessage('They give up and both go at once.'); }],
    [CH,()=>{ S('whoosh'); S('run'); }],
    ['hf',CH+500]];
  tgts.forEach((f,k)=>{ const q=ST.foe(f),at=CH+Math.round(seg(q.x+q.w*.3,Lx,GR.x0-10)*700);   // when the pair reaches it
    steps.push([at,()=>{ S('bonk'); S('thud'); ST.jolt(f,.5); battle.shakeEnemy=.4; scene('tu_dust',.5,{x:q.x,y:q.base,r:30,n:8}); scene('tu_rings',.6,{x:q.x,y:q.mid,r:46}); word(['BONK!','OOF!','BUMP!','THUD!'][k],q.x+10,Math.max(60,q.top-82),GOLD,4,.7); landHit(share[k]); }]); });
  steps.push(
    [CALL,()=>{ word('I CALLED IT!',(Lx+Rx)/2-20,Math.max(70,by-AH-60),GOLD,6,1.7); S('fanfare'); scene('tu_confetti',1.5,{x0:Lx-120,x1:Rx+80,n:36}); say('amy','tombo'); setMessage('Amy declares herself the winner. Nobody voted.'); }],
    [CALL+400,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [CALL+1300,()=>{ say('tom','tomboamy'); setMessage('Tom has heard this before.'); }],
    [P.end,'end',()=>(E2.result||'')+' Amy is counting it as a win. The whole party picks up the pace.']);
  ST.play(E2,steps); };

// ---------- Opening Night (Tom + Amy, Director's Cut 1): a musical for the party ----------
// A spotlight finds Amy. Tom sits in a DIRECTOR chair with a megaphone and calls the cues. Amy sings (notes), jazz hands,
// high kicks, a spin. Tom cannot help himself and joins for the big finale in a top hat with a cane. Bows, red curtain.
// Effects unchanged: every enemy warms up, party +2 VP, Amy shakes off one debuff.
const megaphone=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); PO([[-6,-4],[-6,4],[16,10],[16,-10]],'#e04040'); R(-10,-3,6,6,OUT); gfx.restore(); };
const tophat=(x,y)=>{ RO(x-12,y-2,24,4,'#111'); RO(x-8,y-18,16,16,'#111'); R(x-8,y-6,16,3,RED); };
const cane=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); LnO(0,0,0,38,3,'#111'); gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.beginPath(); gfx.arc(-5,0,5,0,Math.PI,true); gfx.stroke(); gfx.strokeStyle='#e0b040'; gfx.lineWidth=3; gfx.stroke(); gfx.restore(); };
B2_TOMBO_ANIM.amy1_dc=E2=>{ amyPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),A=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const by=Math.min(312,Math.max(T.base,A.base)),sx=cl(GR.x1+90,170,258),dx=sx+120;   // stage mark and the director's chair
  const P={run:600,cue:900,sing:1300,jazz:2600,kick:3300,spin:4300,fin:5000,bow:6500,curt:7300,end:8300};
  const sT={x:T.x,b:T.base,f:tsp.idle},sA={x:A.x,b:A.base,f:asp.idle};
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sA,lerp(c.origX,sx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.sing) return stand(sA,sx,by,sp.flip);
    if(ms<P.jazz) return stand(sA,sx,by-Math.abs(Math.sin(c.t*6))*4,Math.floor(c.t*4)%2?F(sp,'cheer'):F(sp,'celeb2'));
    if(ms<P.kick) return stand(sA,sx+Math.sin(c.t*12)*3,by,F(sp,'spread'));
    if(ms<P.spin) { const q=(ms-P.kick)/250,k=Math.floor(q)%2; return stand(sA,sx,by-(q%1<.5?Math.sin((q%1)*Math.PI*2)*14:0),k?F(sp,'pump'):F(sp,'point'),k?-.3:0); }
    if(ms<P.fin) { const q=seg(ms,P.spin,P.fin); return stand(sA,sx,by,Math.floor(q*8)%2?sp.flip:sp.idle); }
    if(ms<P.bow) return stand(sA,sx+10,by-Math.abs(Math.sin(c.t*8))*8,F(sp,'cheer'));
    if(ms<P.curt) return stand(sA,sx+10,by,F(sp,'hug'),.35);
    const k=ez(seg(ms,P.curt+300,P.end)); return stand(sA,lerp(sx+10,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,dx,k),lerp(c.origBase,by,k),runFr(sp,c.t,1)); }
    if(ms<P.fin) { const call=(ms>P.cue&&ms<P.cue+400)||(ms>P.jazz&&ms<P.jazz+400)||(ms>P.kick&&ms<P.kick+400); return stand(sT,dx,by,call?sp.act:sp.idle); }
    if(ms<P.fin+400) { const k=ez(seg(ms,P.fin,P.fin+400)); return stand(sT,lerp(dx,sx-60,k),by-Math.sin(k*Math.PI)*20,runFr(sp,c.t,-1)); }
    if(ms<P.bow) return stand(sT,sx-60,by-Math.abs(Math.sin(c.t*8+1))*8,sp.celeb);
    if(ms<P.curt) return stand(sT,sx-60,by,sp.idle,.35);
    const k=ez(seg(ms,P.curt+300,P.end)); return stand(sT,lerp(sx-60,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ // director chair, spotlight
    const g=ez(ms/400); if(g<=0) return; gfx.globalAlpha=g;
    RO(dx-18,by-2,36,6,WOOD3); RO(dx-16,by-30,32,8,'#2b2a26'); R(dx-14,by-28,28,4,'#3a3a44'); label('DIRECTOR',dx,by-27,CREAM,1); R(dx-16,by-24,3,22,OUT); R(dx+13,by-24,3,22,OUT);
    if(ms>P.cue) { gfx.globalAlpha=.3*g; PO([[sx-14,0],[sx+14,0],[sx+70,by+6],[sx-70,by+6]],'#fff6c0',0); gfx.globalAlpha=.5*g; E(sx,by+4,66,10,'#fff2a0'); }
    gfx.globalAlpha=1; }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ // megaphone, hat and cane, curtain
    if(ms>P.run&&ms<P.fin) megaphone(sT.x-22,sT.b-TH*.55,(ms>P.cue&&ms<P.cue+400)||(ms>P.jazz&&ms<P.jazz+400)||(ms>P.kick&&ms<P.kick+400)?-.3+Math.sin(ms/40)*.08:-.1);
    if(ms>P.fin) { tophat(sT.x-2,sT.b-TH-2); if(ms<P.bow) cane(sT.x+16,sT.b-TH*.5,Math.sin(ms/150)*.4); }
    if(ms>P.sing&&ms<P.jazz&&Math.floor(ms/300)%3===0) scene('tu_notes',.9,{x:sA.x,y:sA.b-AH,n:3});
    if(ms>P.curt) { const q=ez(seg(ms,P.curt,P.curt+500)); for(const sd of [-1,1]) { const w=300*q,x=sd<0?0:576-w; R(x,0,w,324,'#8a1a1a'); for(let k=0;k<w;k+=20) R(x+k,0,6,324,'#a82a2a'); R(x,0,w,8,'#e0b040'); } if(q>=1) bigWord('THE END',288,150,GOLD,4); } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! Tom pulls up a chair. Amy takes the stage."); S('whoosh'); }],
    [P.cue,()=>{ S('select'); word('AND... CUE!',dx,by-TH-40,CREAM,3,.8); say('tom','dcamy1'); setMessage('Tom has a megaphone. Nobody gave him a megaphone.'); }],
    [P.sing,()=>{ S('harp'); word('LAAAAA!',sx,by-AH-50,PINK,4,1); say('amy','dc1'); setMessage('Amy sings. Loudly. On key. Mostly.'); }],
    [P.jazz,()=>{ S('select'); word('JAZZ HANDS!',dx,by-TH-40,CREAM,3,.8); }],
    [P.kick,()=>{ S('select'); word('KICK LINE!',dx,by-TH-40,CREAM,3,.8); setMessage('Kick line. It is a line of one.'); }],
    [P.spin,()=>{ S('whoosh'); word('SPIN!',sx,by-AH-50,PINK,3,.6); }],
    ['hf',P.fin],
    [P.fin,()=>{ S('fanfare'); S('jumpWhistle'); word('BIG FINISH!',(sx+dx)/2,Math.max(60,by-TH-70),GOLD,5,1.4); scene('tu_confetti',1.8,{x0:sx-120,x1:dx+60,n:40}); setMessage('Tom cannot help it. Top hat. Cane. He is IN the show now.'); }],
    [P.fin+600,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); for(const f of list) { const q=ST.foe(f); scene('tu_glow',1,{x:q.x,y:q.mid,c:'#ffb45a'}); } S('heal'); }],
    [P.bow,()=>{ S('cheer'); setMessage('They bow. The monsters clap. They cannot help it either.'); }],
    [P.curt,()=>{ S('whoosh'); }],
    [P.end,'end',()=>(E2.result||'')+' Opening night. Two shows a day, no refunds.']];
  ST.play(E2,steps); };

// ---------- Ymamot Creation (Tom + Amy, tier 2): the kitchen flashback ----------
// Years ago. Little Tom and little Amy at the kitchen counter with a huge mixing bowl. In go ketchup, pickles, cereal,
// mustard, a whole lemon and one sock. It bubbles green. They name it, carry the bowl between them, and sling the whole
// thing across every monster. Effects unchanged: Kinetic hit on all, all to the back row and lose time, party PEP +30%.
const bottle=(x,y,c,t)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(t); RO(-6,-16,12,30,c); R(-4,-22,8,6,'#e8e4dc'); R(-4,-6,8,10,'#ffffff'); gfx.restore(); };
const ING=[['KETCHUP',(x,y,t)=>bottle(x,y,'#d8302e',t)],['PICKLES',(x,y,t)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(t); RO(-9,-12,18,26,'#9fd090'); R(-9,-16,18,5,'#5a5a60'); for(const [a,b] of [[-5,-6],[2,-2],[-2,6]]) EO(a,b,3,6,'#5a9a3a'); gfx.restore(); }],
  ['CEREAL',(x,y,t)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(t); RO(-10,-16,20,32,'#f0a030'); R(-8,-12,16,10,'#fff'); label('O',0,-9,'#d83a3a',1); gfx.restore(); }],['MUSTARD',(x,y,t)=>bottle(x,y,'#e8c020',t)],
  ['A WHOLE LEMON',(x,y,t)=>{ EO(x,y,9,7,'#f8e040'); R(x-10,y-1,3,2,'#6fae5a'); }],['ONE SOCK',(x,y,t)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(t); RO(-5,-14,10,20,'#f4f0e6'); RO(-5,2,16,8,'#f4f0e6'); R(-5,-14,10,3,'#4f86d8'); gfx.restore(); }]];
const bowl=(x,y,fill,t,sc=1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); PO([[-40,-20],[40,-20],[32,16],[-32,16]],'#d8dce8'); R(-42,-24,84,6,OUT); R(-40,-23,80,4,'#eef0f8');
  if(fill>0) { gfx.globalAlpha*=1; E(0,-20,36*fill+4,7,'#5fc04a'); for(let k=0;k<5;k++) { const q=(t*1.5+k/5)%1; E(-26+k*13+Math.sin(k*3+t*4)*4,-20-q*22,3+(k%2),3+(k%2),'#9ef07a'); } } gfx.restore(); };
B2_TOMBO_ANIM.amy2=E2=>{ amyPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const by=300,cx=cl(GR.x1+110,220,330),kT={x:cx+52,y:by},kA={x:cx-52,y:by};   // the counter sits between the kids
  const P={fb:300,in:1800,each:430,name:0,lift:0,sling:0,hit:0,back:0,end:0};
  P.name=P.in+ING.length*P.each+200; P.lift=P.name+900; P.sling=P.lift+700; P.hit=P.sling+380; P.back=P.hit+1500; P.end=P.back+1400;
  // grown-ups hide for the flashback (they stay at the staging spots)
  const hideAt=ms=>ms>P.fb&&ms<P.back;
  pathOf(fxT,P.end,(ms,c)=>({cx:hideAt(ms)?-400:c.origX,base:c.origBase,frame:ms>=P.back?c.sp.celeb:c.sp.idle,hide:hideAt(ms),noShadow:hideAt(ms)}));
  pathOf(fxP,P.end,(ms,c)=>({cx:hideAt(ms)?-400:c.origX,base:c.origBase,frame:ms>=P.back?c.sp.celeb:c.sp.idle,hide:hideAt(ms),noShadow:hideAt(ms)}));
  const thrown=[];
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.fb||ms>P.back) return; const t=s2.t;
    // the counter
    RO(cx-70,by-36,140,10,WOOD2); R(cx-68,by-35,136,3,'#e0a860'); R(cx-64,by-26,10,26,WOOD3); R(cx+54,by-26,10,26,WOOD3);
    const fill=cl((ms-P.in)/(ING.length*P.each));
    let bx=cx,bY=by-36,bs=1;
    if(ms>P.lift&&ms<P.sling) { const q=ez(seg(ms,P.lift,P.sling)); bx=cx; bY=by-36-q*40; }
    else if(ms>=P.sling&&ms<P.hit) { const q=seg(ms,P.sling,P.hit); bx=cx; bY=by-76; bs=1; }
    // ingredients flying in from the kids' hands
    ING.forEach(([nm,draw],k)=>{ const t0=P.in+k*P.each; if(ms<t0||ms>t0+380) return; const q=ez((ms-t0)/380),fromA=k%2===0,x0=fromA?kA.x-20:kT.x+20,y0=by-60; draw(lerp(x0,cx,q),lerp(y0,by-62,q)-Math.sin(q*Math.PI)*40,q*6*(fromA?1:-1)); });
    // the slung goop
    if(ms>=P.sling) { const q=seg(ms,P.sling,P.hit); for(let k=0;k<12;k++) { const a=k/12,x=lerp(cx,GR.x0+a*(GR.x1-GR.x0),q),y=lerp(by-80,GR.base-30-(k%3)*20,q)-Math.sin(q*Math.PI)*60*(1-a*.5); if(q<1) E(x,y,8+(k%3)*3,7+(k%3)*2,'#5fc04a'); else if(ms<P.hit+900) { gfx.globalAlpha=1-seg(ms,P.hit,P.hit+900); E(x,y+seg(ms,P.hit,P.hit+900)*30,10,8,'#5fc04a'); gfx.globalAlpha=1; } } }
    if(ms<P.sling) bowl(bx,bY,fill,t,bs); else if(ms<P.hit+600) bowl(bx,bY,0,t,bs);
    // the kids
    const posT=ms<P.in?'idle':(ms<P.name?(ING.findIndex((_,k)=>ms>=P.in+k*P.each&&ms<P.in+k*P.each+380)%2===1?'throw':'idle'):(ms<P.lift?'cheer':(ms<P.hit?'hold':'cheer')));
    const posA=ms<P.in?'stir':(ms<P.name?(ING.findIndex((_,k)=>ms>=P.in+k*P.each&&ms<P.in+k*P.each+380)%2===0?'throw':'stir'):(ms<P.lift?'cheer':(ms<P.hit?'hold':'cheer')));
    const lift=ms>P.lift&&ms<P.hit?-ez(seg(ms,P.lift,P.sling))*6:0;
    kid(kT.x,by+lift,'tom',posT,t,-1,{mouth:ms>P.name&&ms<P.lift?'o':null}); kid(kA.x,by+lift,'amy',posA,t,1,{mouth:ms>P.name&&ms<P.lift?'o':null});
    if(ms>P.name&&ms<P.lift) { gfx.save(); gfx.translate(cx,by-120); gfx.rotate(-.06); RO(-70,-12,140,24,CREAM); label('YMAMOT CREATION',0,-6,'#2b2a26',2); gfx.restore(); } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom and Amy look at each other. They remember something.'); S('harp'); }],
    [P.fb,()=>{ scene('tu_flashback',(P.back-P.fb)/1000,{txt:'MOM WAS OUT'}); if(sfx.projector) sfx.projector(0,30); S('whoosh'); setMessage('The kitchen. A bowl. No supervision.'); }],
    ...ING.map(([nm],k)=>[P.in+k*P.each,()=>{ S(k%2?'thud':'splat'); word(nm,cx,by-170,k%2?CREAM:MINT,3,.5); if(k===ING.length-1) setMessage('And one sock. For body.'); }]),
    [P.name,()=>{ S('ding'); word('A YMAMOT CREATION!',cx,Math.max(56,by-200),GOLD,4,1.3); say('amy','tombo2'); setMessage('Tom spelled backwards. Pronounced Yama-Mott. They were six.'); }],
    [P.lift,()=>{ S('whoosh'); setMessage('They carry it together. Very carefully. Then not carefully.'); }],
    [P.sling,()=>{ S('whoosh'); S('splat'); }],
    ['hf',P.hit],
    [P.hit,()=>{ S('splat'); S('bonk'); scene('tu_flash',.2,{a:.4,c:'#9ef07a'}); hitFoes(tgts,share); for(const f of tgts) { const q=ST.foe(f); scene('tu_dust',.5,{x:q.x,y:q.base,r:30,n:8}); } word('SPLAT!',GR.x,Math.max(56,GR.top-70),MINT,6,1); setMessage('It goes everywhere. The monsters are not the same after.'); }],
    [P.hit+600,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [P.back,()=>{ scene('tu_flash',.3,{a:.5}); say('tom','tomboamy2'); setMessage('Back to now. Tom can still taste it.'); }],
    [P.end,'end',()=>(E2.result||'')+' The monsters crawl to the back row. The family moves faster, mostly away from the smell.']];
  ST.play(E2,steps); };

// ---------- Party Decorators (Tom + Amy, Director's Cut 2): decorating for the girls' birthday ----------
// A HAPPY BIRTHDAY banner goes up between them: Tom on a wobbly stepladder with the streamers, Amy on the balloons.
// Her balloon grows, and grows, and pops. The stepladder goes. The cake arrives anyway. Effects unchanged: Tom and Amy
// refill VP, party Guards for 1 turn.
B2_TOMBO_ANIM.amy2_dc=E2=>{ amyPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),A=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,asp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,AH=asp.idle.length*asp.scale;
  const by=Math.min(312,Math.max(T.base,A.base)),lx=cl(GR.x1+90,170,268),ax=lx+110;   // ladder (Tom) and Amy's spot
  const P={run:600,climb:900,banner:1500,blow:1900,pop:4100,fall:4300,down:4700,cake:5400,apply:5900,end:7400};
  const sT={x:T.x,b:T.base,f:tsp.idle},sA={x:A.x,b:A.base,f:asp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,lx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.climb) return stand(sT,lx,by,sp.flip);
    if(ms<P.pop) { const k=ez(seg(ms,P.climb,P.climb+500)),wob=ms>P.banner?Math.sin(ms/160)*2:0; return stand(sT,lx+wob,by-54*k,ms<P.banner?sp.flip:(ms<P.banner+700?mir(sp,'act'):sp.flip),wob*.01); }
    if(ms<P.down) { const q=seg(ms,P.pop,P.down); return stand(sT,lx+q*30,by-54+q*q*54-Math.sin(q*Math.PI)*20,sp.expr||sp.idle,q*1.4); }
    if(ms<P.cake) return stand(sT,lx+30,by,sp.kneel||sp.idle);
    if(ms<P.end-700) return stand(sT,lx+30,by,ms<P.apply?sp.idle:sp.celeb);
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(lx+30,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sA,lerp(c.origX,ax,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.blow) return stand(sA,ax,by,sp.idle);
    if(ms<P.pop) { const puff=Math.abs(Math.sin((ms-P.blow)/180)); return stand(sA,ax,by,puff>.5?F(sp,'whistle')||sp.idle:F(sp,'hold')); }
    if(ms<P.down) return stand(sA,ax+4,by,F(sp,'shrug'));
    if(ms<P.cake) return stand(sA,ax,by,F(sp,'carry'));
    if(ms<P.end-700) return stand(sA,ax-20,by,ms<P.apply?F(sp,'carry'):sp.celeb);
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sA,lerp(ax-20,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ if(ms<P.run) return;
    // stepladder (falls over at pop)
    const fall=ms>P.pop?ez(seg(ms,P.pop,P.down)):0; gfx.save(); gfx.translate(lx,by); gfx.rotate(fall*1.2); for(const sd of [-1,1]) { LnO(sd*14,0,sd*6,-60,3,'#c9c2b8'); } for(let k=1;k<5;k++) { const y=-k*12,w=14-k*1.6; LnO(-w,y,w,y,3,'#c9c2b8'); } gfx.restore();
    // banner between the ladder top and a pole by Amy
    if(ms>P.banner) { const q=ez(seg(ms,P.banner,P.banner+500)),x0=lx-6,y0=by-66,x1=ax-30,y1=by-70+(1-q)*40; LnO(x1+2,by,x1+2,y1,3,'#c9c2b8');
      const sag=18; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.quadraticCurveTo((x0+x1)/2,y0+sag+fall*60,x1,y1); gfx.stroke();
      const txt='HAPPY BIRTHDAY',n=txt.length; for(let k=0;k<n;k++) { const a=(k+.5)/n,x=lerp(x0,x1,a),y=lerp(y0,y1,a)+4*a*(1-a)*(sag+fall*60)+6; RO(x-6,y-1,12,14,CONF[k%7]); label(txt[k],x+1,y+3,OUT,1); }
      // streamers from the ladder top
      for(let k=0;k<4;k++) { const x=x0+k*10-15,wave=Math.sin(ms/200+k)*4; gfx.strokeStyle=CONF[(k+2)%7]; gfx.lineWidth=3; gfx.beginPath(); gfx.moveTo(x,y0); gfx.quadraticCurveTo(x+wave,y0+30,x-wave,y0+60*q); gfx.stroke(); } }
    gfx.globalAlpha=1; }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{
    // balloon from Amy's mouth, growing
    if(ms>P.blow&&ms<P.pop) { const q=seg(ms,P.blow,P.pop),r=6+q*q*70,x=sA.x-18-r*.6,y=sA.b-AH*.7-r*.2; EO(x,y,r,r*1.1,'#ff5a8a'); E(x-r*.3,y-r*.4,r*.3,r*.25,'#ffb0c8'); R(x-2,y+r*1.1,4,5,'#ff5a8a'); if(q>.75) bigWord('...',x,y-r-20,CREAM,2); }
    if(ms>P.pop&&ms<P.pop+450) { const q=seg(ms,P.pop,P.pop+450); gfx.globalAlpha=1-q; for(let k=0;k<10;k++) { const a=k/10*Math.PI*2,d=q*90; E(sA.x-60+Math.cos(a)*d,sA.b-AH*.7+Math.sin(a)*d*.7,8*(1-q)+2,4,'#ff5a8a'); } gfx.globalAlpha=1; }
    // the cake, carried in by Amy, then set down; balloons behind it
    if(ms>P.cake) { const q=ez(seg(ms,P.cake,P.cake+500)),x=lerp(ax+80,sA.x-40,q),y=sA.b-20; for(let k=0;k<3;k++) { const bx=x-20+k*20,byy=y-60-(k%2)*10+Math.sin(ms/300+k)*3; LnO(bx,y-10,bx,byy+12,2,'#555'); EO(bx,byy,10,12,CONF[k*2]); }
      RO(x-28,y-10,56,12,'#f8d8e8'); RO(x-22,y-22,44,12,'#fff'); R(x-28,y-10,56,3,'#ff9ac0'); R(x-22,y-22,44,3,'#ff9ac0'); for(let k=0;k<5;k++) { R(x-18+k*9,y-32,2,10,CONF[k]); E(x-17+k*9,y-34,2,3,'#ffd23a'); } } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! The girls' birthday is tomorrow. Tom and Amy decorate."); S('whoosh'); }],
    [P.climb,()=>{ S('creak'); setMessage('Tom climbs the stepladder with the streamers. It wobbles.'); }],
    [P.banner,()=>{ S('select'); say('amy','dc2'); setMessage('Amy strings the banner. Higher. HIGHER.'); }],
    [P.blow,()=>{ S('whoosh'); say('tom','dcamy2'); setMessage('Amy blows up a balloon. One breath. Two. Many.'); }],
    [P.pop-800,'It keeps going.'],
    ['hf',P.pop],
    [P.pop,()=>{ S('bang'); S('shatter'); scene('tu_flash',.2,{a:.5}); word('POP!',sA.x-60,sA.b-AH-40,PINK,6,1); setMessage('POP. Tom falls off the ladder. The banner holds.'); }],
    [P.down,()=>{ S('thud'); scene('tu_dust',.5,{x:lx+30,y:by,r:34,n:10}); }],
    [P.cake,()=>{ S('ding'); setMessage('The cake arrives anyway. Five candles. Nobody is six yet.'); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); S('fanfare'); word('READY FOR TOMORROW!',(lx+ax)/2,Math.max(60,by-TH-80),GOLD,3,1.4); scene('tu_confetti',1.5,{x0:lx-60,x1:ax+60,n:30}); }],
    [P.end,'end',()=>(E2.result||'')+' Decorated. Guarded. The balloon is not discussed.']];
  ST.play(E2,steps); };

// ---------- Knock It Off! (Tom + Amy, tier 3): the living-room flashback ----------
// Years ago. The couch. Little Amy and little Tom bicker over who sits where; a pillow fight. Every swing misses the
// other one and hits the monster instead: pillow, slipper, cushion, remote, pillow, both at once. Mom's voice from the
// next room: KNOCK IT OFF. Both freeze. Effects unchanged: six sure critical Kinetic hits on one enemy, party Personal Best.
const pillow=(x,y,a,c='#f0d8b0')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-14,-9,28,18,c); for(const [px,py] of [[-14,-9],[14,-9],[-14,9],[14,9]]) E(px,py,3,3,OUT); gfx.restore(); };
const SWINGS=[['PILLOW',(x,y,a)=>pillow(x,y,a)],['SLIPPER',(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-14,-5,28,10,'#c88a9a'); E(-8,-5,7,5,'#e8a8b8'); gfx.restore(); }],['CUSHION',(x,y,a)=>pillow(x,y,a,'#7aa0c8')],
  ['THE REMOTE',(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-5,-16,10,32,'#2b2a26'); for(let k=0;k<5;k++) R(-3,-13+k*6,6,3,k?'#8a857c':RED); gfx.restore(); }],['PILLOW',(x,y,a)=>pillow(x,y,a)],['BOTH!',(x,y,a)=>{ pillow(x-10,y,a); pillow(x+10,y+6,-a,'#7aa0c8'); }]];
B2_TOMBO_ANIM.amy3=E2=>{ amyPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],Q=ST.foe(tgt);
  const by=300,cx=cl(Q.x+Q.w*.5+130,230,330),kT={x:cx+40,y:by},kA={x:cx-40,y:by};
  const P={fb:300,sit:1700,bick:[2200,2600,3000],sw0:3600,each:520,mom:0,back:0,end:0};
  P.mom=P.sw0+SWINGS.length*P.each+200; P.back=P.mom+1600; P.end=P.back+1500;
  const hideAt=ms=>ms>P.fb&&ms<P.back;
  pathOf(fxT,P.end,(ms,c)=>({cx:hideAt(ms)?-400:c.origX,base:c.origBase,frame:ms>=P.back?c.sp.celeb:c.sp.idle,hide:hideAt(ms),noShadow:hideAt(ms)}));
  pathOf(fxP,P.end,(ms,c)=>({cx:hideAt(ms)?-400:c.origX,base:c.origBase,frame:ms>=P.back?c.sp.celeb:c.sp.idle,hide:hideAt(ms),noShadow:hideAt(ms)}));
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ if(ms<P.fb||ms>P.back) return; // couch, lamp, TV
    RO(cx-80,by-44,160,36,'#7a4a8a'); R(cx-78,by-42,156,6,'#9a6aaa'); RO(cx-84,by-50,16,46,'#6a3a7a'); RO(cx+68,by-50,16,46,'#6a3a7a'); R(cx-60,by-30,56,14,'#8a5a9a'); R(cx+4,by-30,56,14,'#8a5a9a');
    RO(cx+120,by-90,4,88,'#c9c2b8'); PO([[cx+104,by-90],[cx+140,by-90],[cx+146,by-118],[cx+98,by-118]],'#f6e6a0');
    if(ms>P.mom) { gfx.save(); gfx.translate(cx-150,by-110); RO(-6,-10,12,20,'#c9c2b8'); R(-14,-30,28,22,'#e8e4dc'); label('MOM',0,-26,OUT,1); gfx.restore(); } }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.fb||ms>P.back) return; const t=s2.t;
    const k=Math.floor((ms-P.sw0)/P.each),w=ms-P.sw0-k*P.each,swinging=ms>=P.sw0&&k<SWINGS.length;
    const posT=ms<P.sit?'run':(ms<P.sw0?(ms>P.bick[0]&&ms<P.bick[1]?'point':'sit'):(ms<P.mom?(swinging&&k%2===1?'swing':'idle'):'cry'));
    const posA=ms<P.sit?'run':(ms<P.sw0?(ms>P.bick[1]&&ms<P.bick[2]?'point':'sit'):(ms<P.mom?(swinging&&k%2===0?'swing':'idle'):'idle'));
    const freeze=ms>P.mom; const kx=ms<P.sit?lerp(cx+140,kT.x,ez(seg(ms,P.fb,P.sit))):kT.x,kax=ms<P.sit?lerp(cx-140,kA.x,ez(seg(ms,P.fb,P.sit))):kA.x;
    kid(kx,by-(ms<P.sw0&&ms>=P.sit?8:0),'tom',posT,freeze?0:t,-1,{mouth:freeze?'o':(ms>P.bick[0]&&ms<P.sw0?'grr':null)});
    kid(kax,by-(ms<P.sw0&&ms>=P.sit?8:0),'amy',posA,freeze?0:t,1,{mouth:freeze?'o':(ms>P.bick[0]&&ms<P.sw0?'grr':null)});
    // the flying object of this swing: from the swinger's hand, past the sibling, into the monster
    if(swinging&&w>120) { const q=seg(w,120,400),from=k%2?kT:kA,x=lerp(from.x,Q.x+Q.w*.2,ez(q)),y=lerp(by-50,Q.mid,q)-Math.sin(q*Math.PI)*50; if(q<1) SWINGS[k][1](x,y,q*8); }
    if(freeze) { const q=seg(ms,P.mom,P.mom+400); gfx.globalAlpha=1; bigWord('KNOCK IT OFF!',Math.max(120,cx-120),Math.max(40,by-180-q*10),RED,4); } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! The look on Amy\'s face says 1990-something.'); S('harp'); }],
    [P.fb,()=>{ scene('tu_flashback',(P.back-P.fb)/1000,{txt:'THE COUCH'}); if(sfx.projector) sfx.projector(0,30); S('whoosh'); }],
    [P.sit,()=>{ S('thud'); setMessage('One couch. Two kids. One good spot.'); }],
    [P.bick[0],()=>{ word('MY SPOT!',cx+40,by-120,CREAM,3,.5); S('squeak'); say('tom','tomboamy3'); }],
    [P.bick[1],()=>{ word('I WAS HERE!',cx-40,by-120,PINK,3,.5); S('squeak'); say('amy','tombo3'); }],
    [P.bick[2],()=>{ word('WAS NOT!',cx+40,by-120,CREAM,3,.5); S('squeak'); setMessage('It escalates. It always escalates.'); }],
    ['hf',P.sw0+400]];
  SWINGS.forEach(([nm],k)=>{ const t0=P.sw0+k*P.each; steps.push([t0,()=>{ S('whoosh'); word(nm,k%2?cx+40:cx-40,by-130,k%2?CREAM:PINK,3,.45); }]);
    steps.push([t0+400,()=>{ S('bonk'); S('thud'); ST.jolt(tgt,.5); battle.shakeEnemy=.35; scene('tu_rings',.5,{x:Q.x,y:Q.mid,r:40}); word(['WHAP!','SMACK!','POOF!','CLACK!','WHUMP!','DOUBLE!'][k],Q.x+10,Math.max(50,Q.top-70-(k%2)*20),GOLD,4,.5); landHit(k<5?16:20); if(k===0) setMessage('Every swing misses the sibling. Every swing hits the monster.'); }]); });
  steps.push(
    [P.mom,()=>{ S('stun'); setMessage('From the next room: KNOCK IT OFF. Both of them freeze.'); }],
    [P.mom+700,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [P.back,()=>{ scene('tu_flash',.3,{a:.5}); setMessage('Back to now. They still sit on opposite ends.'); }],
    [P.end,'end',()=>(E2.result||'')+' Six hits, no witnesses, one mom. Personal Best for everybody.']);
  ST.play(E2,steps); };

// ================= Tom + Deedee =================
const shrinkFoe=(f,s)=>{ const q=ST.foe(f); f.spin=0; f.ox=0; f.fsc=s; f.oy=q.h/2*(1-s)/Math.max(s,.01); f.spinAt=performance.now(); };
const unshrink=f=>{ f.fsc=0; f.oy=0; };
const glass=(x,y,fill,tilt=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); LnO(0,0,0,-14,2,'#e8e4dc'); LnO(-6,0,6,0,2,'#e8e4dc'); PO([[-9,-30],[9,-30],[7,-14],[-7,-14]],'#f4f6ffcc',2); if(fill>0) PO([[-8,-22-fill*6],[8,-22-fill*6],[7,-15],[-7,-15]],'#8a2a4a',0); gfx.restore(); };
const bubble=(x,y,txt,sc=1,c=CREAM)=>{ const w=(txt.length*4-1)*sc+14; RO(x-w/2,y-8*sc-6,w,10*sc+10,c); label(txt,x,y-7*sc,'#2b2a26',sc); PO([[x-6,y+sc*3+4],[x+6,y+sc*3+4],[x,y+sc*3+12]],c,0); };
const crisp=(x,y)=>{ RO(x-18,y-6,36,12,'#c8703a'); R(x-16,y-10,32,5,'#e8c06a'); for(let k=0;k<4;k++) R(x-14+k*8,y-12,4,3,'#f0d890'); };
// ---------- Wine and Gossip (Tom + Deedee, tier 1) ----------
// A bistro table pops up. They sit, clink, lean in and whisper. Both glance at the monster. Gasp. DID YOU SEE WHAT IT
// WAS WEARING? Every monster shrinks with embarrassment. Deedee brings out the crisp. Effects unchanged.
B2_TOMBO_ANIM.deedee1=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const by=Math.min(312,Math.max(T.base,D.base)),tx=cl(GR.x1+120,200,334),lx=tx-44,rx=tx+44;
  const P={run:600,sit:900,clink:1500,lean:2100,look:3200,gasp:3900,shrink:4300,crisp:5300,apply:5700,end:7400};
  const sT={x:T.x,b:T.base,f:tsp.idle},sD={x:D.x,b:D.base,f:dsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,rx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) { const lean=ms>P.lean&&ms<P.look?-4:0,look=ms>P.look&&ms<P.gasp; return stand(sT,rx+lean,by,look?sp.act:(ms>P.gasp&&ms<P.gasp+800?(sp.expr||sp.idle):(ms>P.crisp?sp.celeb:sp.kneel||sp.idle)),ms>P.lean&&ms<P.look?.08:0); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(rx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sD,lerp(c.origX,lx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) { const lean=ms>P.lean&&ms<P.look?4:0,look=ms>P.look&&ms<P.gasp; return stand(sD,lx+lean,by,look?F(sp,'point'):(ms>P.gasp&&ms<P.gasp+800?F(sp,'spread'):(ms>P.crisp?F(sp,'carry'):(ms>P.lean&&ms<P.look&&sp.whisper?sp.whisper:(sp.sitR||F(sp,'sit'))))),ms>P.lean&&ms<P.look?-.08:0); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sD,lerp(lx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.sit)); if(g<=0) return;
    RO(tx-26*g,by-34,52*g,6,WOOD2); R(tx-2,by-30,4,30,WOOD3); RO(tx-10,by-2,20,4,WOOD3); if(ms>P.sit) { R(tx-20,by-44,40,10,'#f4f0e6'); R(tx-24,by-38,48,4,'#ffffff'); } }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.sit) return;
    const cl1=ms>P.clink&&ms<P.clink+300?ez(seg(ms,P.clink,P.clink+150))*(1-ez(seg(ms,P.clink+150,P.clink+300))):0;
    const dHeld=sp0=>sp0.sitR&&!((ms>P.lean&&ms<P.gasp+800)||ms>P.crisp);   // Deedee's glass is in her hand while she sits
    if(!dHeld(dsp)) glass(tx-12+cl1*8,by-36,ms<P.crisp?1:.4,cl1*.3); glass(tx+12-cl1*8,by-36,ms<P.crisp?1:.3,-cl1*.3);
    if(ms>P.lean&&ms<P.look) { const k=Math.floor(ms/350)%2; bubble(k?sT.x-30:sD.x+30,by-(k?TH:DH)-14,k?'PSST':'NO!',2); }
    if(ms>P.gasp&&ms<P.shrink+1200) for(const f of list) { const q=ST.foe(f); E(q.x-q.w*.2,q.mid,5,3,'#ff6a60'); E(q.x+q.w*.2,q.mid,5,3,'#ff6a60'); if(ms<P.gasp+900) bigWord('!!',q.x,q.top-30,RED,3); }
    if(ms>P.crisp) { const k=ez(seg(ms,P.crisp,P.crisp+400)); crisp(sD.x-22,sD.b-DH*.55+(1-k)*20); if(ms<P.crisp+1500) for(let j=0;j<3;j++) { const q=(s2.t*1.2+j/3)%1; gfx.globalAlpha=1-q; LnO(sD.x-30+j*8,sD.b-DH*.6-q*24,sD.x-28+j*8+Math.sin(q*6)*3,sD.b-DH*.6-q*24-10,2,'#fff'); gfx.globalAlpha=1; } } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! A bistro table pops up. Tom and Deedee sit down.'); S('whoosh'); }],
    [P.sit,()=>{ S('thud'); }],
    [P.clink,()=>{ S('ting'); word('CLINK',tx,by-70,CREAM,3,.6); setMessage('Wine o\'clock. They clink.'); }],
    [P.lean,()=>{ S('select'); say('deedee','tombo'); setMessage('They lean in. Whispering. About the monster.'); }],
    [P.look,()=>{ S('select'); setMessage('They both look at it. Slowly.'); }],
    [P.gasp,()=>{ S('stun'); word('DID YOU SEE WHAT IT WAS WEARING?',tx,Math.max(40,by-TH-74),PINK,2,1.4); setMessage('A gasp. A hand on the chest.'); }],
    ['hf',P.shrink],
    [P.shrink,()=>{ S('nope'); for(const f of list) { shrinkFoe(f,.72); ST.jolt(f,.3); } word('SO EMBARRASSED',GR.x,Math.max(50,GR.top-60),CREAM,3,1.1); setMessage('Every monster shrinks a little with embarrassment.'); say('tom','tombodeedee'); }],
    [P.crisp,()=>{ S('ding'); setMessage('Deedee brings out the rhubarb crisp. From nowhere. Still warm.'); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); word('WARM CRISP',sD.x,Math.max(50,by-DH-60),GOLD,3,1.2); }],
    [P.end,'end',()=>{ for(const f of list) unshrink(f); return 'Wine, gossip and warm crisp. Everyone feels much better.'; }]];
  ST.play(E2,steps); };

// ---------- Clean As You Go (Tom + Deedee, Director's Cut 1) ----------
// A sink. Deedee washes faster and faster; every clean plate flies to Tom, whose stack grows past the top of the screen
// while he wobbles. It topples onto a monster. Effects unchanged: enemies warm up, party heals 25%, one debuff each.
const plateDraw=(x,y)=>{ EO(x,y,16,5,'#f4f0e6'); E(x,y-1,10,2,'#dfe2ea'); };
B2_TOMBO_ANIM.deedee1_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgt=list[0],Q=ST.foe(tgt);
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const by=Math.min(312,Math.max(T.base,D.base)),sx=cl(GR.x1+150,220,360),tx=sx-70;   // sink (Deedee) and Tom beside it, nearer the monsters
  const N=14,P={run:600,wash0:900,topple:0,crash:0,apply:0,end:0}; const gap=k=>Math.max(90,260-k*14); let t=P.wash0; const fly=[]; for(let k=0;k<N;k++) { fly.push(t); t+=gap(k); }
  P.topple=t+300; P.crash=P.topple+500; P.apply=P.crash+600; P.end=P.apply+1800;
  const sT={x:T.x,b:T.base,f:tsp.idle},sD={x:D.x,b:D.base,f:dsp.idle};
  const stack=ms=>fly.filter(f=>ms>f+260).length;
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sD,lerp(c.origX,sx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.topple) { const k=fly.findIndex(f=>ms<f),sp2=Math.min(30,8+k*2); return stand(sD,sx+Math.sin(c.t*sp2)*(2+k*.2),by,Math.floor(c.t*sp2/3)%2?sp.act:F(sp,'aim')); }
    if(ms<P.end-700) return stand(sD,sx,by,ms<P.crash?F(sp,'hip'):F(sp,'shrug'));
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sD,lerp(sx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.topple) { const n=stack(ms),wob=Math.sin(ms/(220-n*8))*Math.min(10,n*.9); return stand(sT,tx+wob*.4,by,sp.wind,wob*.012); }
    if(ms<P.crash) { const q=seg(ms,P.topple,P.crash); return stand(sT,tx-q*20,by,sp.wind,-.25*q); }
    if(ms<P.end-700) return stand(sT,tx-20,by,ms<P.apply?sp.kneel||sp.idle:sp.celeb);
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx-20,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+300)); if(g<=0) return;
    RO(sx-30,by-40*g,60,40*g,'#e8e4dc'); R(sx-26,by-36*g,52,8,'#9fd8ff'); R(sx-2,by-62*g,4,24*g,'#9aa3a8'); LnO(sx-2,by-62*g,sx-14,by-62*g,4,'#9aa3a8');
    if(ms>P.wash0&&ms<P.topple) for(let k=0;k<6;k++) { const q=(s2.t*2+k/6)%1; gfx.globalAlpha=1-q; EO(sx-20+k*8,by-40-q*30,3+(k%2),3+(k%2),'#eef6ff'); } gfx.globalAlpha=1; }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ // flying plates and the stack in Tom's arms
    fly.forEach((f,k)=>{ if(ms<f||ms>f+260) return; const q=ez((ms-f)/260); plateDraw(lerp(sx-10,sT.x,q),lerp(by-44,sT.b-TH*.5-k*7,q)-Math.sin(q*Math.PI)*30); });
    const n=stack(ms); if(n&&ms<P.crash) { const tip=ms>P.topple?ez(seg(ms,P.topple,P.crash)):0,wob=Math.sin(ms/(220-n*8))*Math.min(10,n*.9);
      gfx.save(); gfx.translate(sT.x-14,sT.b-TH*.5); gfx.rotate(wob*.012-tip*1.3); for(let k=0;k<n;k++) plateDraw(k%2?2:-2,-k*7); gfx.restore(); if(n>=8&&ms<P.topple) bigWord('TOO HIGH',sT.x-40,Math.max(30,sT.b-TH*.5-n*7-30),CREAM,2); }
    if(ms>=P.crash&&ms<P.crash+800) { const q=seg(ms,P.crash,P.crash+800); gfx.globalAlpha=1-q; for(let k=0;k<12;k++) { const a=k/12*Math.PI*2,d=q*70; PO([[Q.x+Math.cos(a)*d-5,Q.mid+Math.sin(a)*d*.6],[Q.x+Math.cos(a)*d+5,Q.mid+Math.sin(a)*d*.6-2],[Q.x+Math.cos(a)*d+1,Q.mid+Math.sin(a)*d*.6+5]],'#f4f0e6'); } gfx.globalAlpha=1; } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! Deedee runs the sink. Tom dries. Allegedly."); S('whoosh'); }],
    [P.wash0,()=>{ S('splash'); say('deedee','dc1'); setMessage('Clean as you go. Plate. Plate. Plate plate plate.'); }],
    ...fly.filter((f,k)=>k%3===0).map(f=>[f,()=>S('select')]),
    [fly[7],()=>{ say('tom','dcdeedee1'); setMessage('Tom cannot keep up. The stack can.'); }],
    [P.topple-200,()=>{ S('creak'); word('UH OH',sT.x-30,Math.max(40,by-TH-100),RED,3,.6); }],
    ['hf',P.crash],
    [P.crash,()=>{ S('shatter'); S('crash'); ST.jolt(tgt,.35); battle.shakeEnemy=.3; word('CRASH!',Q.x,Math.max(56,Q.top-70),'#dff0fa',6,1); for(const f of list) { const q=ST.foe(f); scene('tu_glow',1,{x:q.x,y:q.mid,c:'#ffb45a'}); } setMessage('The whole tower goes. The monster is wearing it.'); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); setMessage('Deedee shrugs. The kitchen is clean. That was the point.'); }],
    [P.end,'end',()=>'Clean kitchen, warm monsters, one less plate.']];
  ST.play(E2,steps); };

// ---------- Trip to Italy (Tom + Deedee, Director's Cut 2; replaces Library Vault Lantern) ----------
// Deedee produces the binder. Three rings, tabs. A map of Italy unrolls behind them and pins pop in: ROME, FLORENCE,
// THE COAST. Espresso, gelato, a tiny Vespa crosses the stage. The whole family (and the monsters) get a brochure.
// Effects unchanged: enemies warm up, party Tucked In 3 turns, 2 Warm Crusts.
const italy=(x,y,sc)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); PO([[-30,-60],[0,-62],[14,-52],[8,-36],[2,-20],[18,-2],[30,14],[24,26],[10,20],[-4,2],[-14,-14],[-26,-30],[-36,-44]],'#6fae5a'); PO([[-6,18],[14,24],[10,36],[-10,30]],'#6fae5a'); gfx.restore(); };
B2_TOMBO_ANIM.deedee2_dc=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),party=b2LiveParty();
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const by=Math.min(312,Math.max(T.base,D.base)),dx=cl(GR.x1+100,190,300),tx=dx+78,mx=Math.max(120,GR.x+10),my=Math.max(60,GR.top-110);
  const PINS=[['ROME',0,-6],['FLORENCE',-10,-34],['THE COAST',10,-20]];
  const P={run:600,binder:900,map:1500,pin0:2100,each:650,espresso:0,vespa:0,broch:0,apply:0,end:0};
  P.espresso=P.pin0+PINS.length*P.each+200; P.vespa=P.espresso+700; P.broch=P.vespa+900; P.apply=P.broch+600; P.end=P.apply+1900;
  const sT={x:T.x,b:T.base,f:tsp.idle},sD={x:D.x,b:D.base,f:dsp.idle};
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sD,lerp(c.origX,dx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.map) return stand(sD,dx,by,F(sp,'carry'));
    if(ms<P.espresso) { const k=PINS.findIndex((p,i)=>ms>=P.pin0+i*P.each&&ms<P.pin0+i*P.each+300); return stand(sD,dx,by-(k>=0?4:0),k>=0?F(sp,'point'):F(sp,'aim')); }
    if(ms<P.broch) return stand(sD,dx,by,ms<P.vespa?F(sp,'hold'):F(sp,'cheer'));
    if(ms<P.end-700) return stand(sD,dx,by-Math.abs(Math.sin(c.t*8))*(ms>P.apply?6:0),ms>P.apply?sp.celeb:F(sp,'spread'));
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sD,lerp(dx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) return stand(sT,tx,by,ms>P.binder&&ms<P.broch?sp.wind:(ms>P.apply?sp.celeb:sp.idle));
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ if(ms<P.map) return; const g=ez(seg(ms,P.map,P.map+500)); // the map unrolls down
    const w=170,h=150*g; RO(mx-w/2,my-10,w,h,'#f6e8c0'); R(mx-w/2-4,my-14,w+8,6,WOOD3); R(mx-w/2-4,my-10+h,w+8,6,WOOD3); if(g>.9) { gfx.save(); gfx.beginPath(); gfx.rect(mx-w/2,my-10,w,h); gfx.clip(); R(mx-w/2,my-10,w,h,'#9fd8ff'); italy(mx+4,my+74,1.2); gfx.restore(); label('ITALIA',mx,my-4,'#2b2a26',1); }
    PINS.forEach(([nm,px,py],k)=>{ const t0=P.pin0+k*P.each; if(ms<t0) return; const q=ez((ms-t0)/250),x=mx+4+px*1.2,y=my+74+py*1.2-(1-q)*30; LnO(x,y,x,y+8,2,'#555'); EO(x,y-2,4,4,RED); if(q>=1) { RO(x-24,y-20,48,10,CREAM); label(nm,x,y-17,'#2b2a26',1); } }); }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.binder&&ms<P.broch) { const x=sT.x-28,y=sT.b-TH*.55; gfx.save(); gfx.translate(x,y); gfx.rotate(-.1); RO(-16,-22,32,44,'#3a5aa8'); R(-14,-20,28,40,'#4a6ac0'); for(let k=0;k<3;k++) R(16,-16+k*12,8,8,CONF[k+1]); for(let k=0;k<3;k++) EO(-14,-14+k*12,2,2,'#c9c2b8'); label('ITALY',0,-4,CREAM,1); gfx.restore();
      if(ms>P.binder&&ms<P.map) for(let k=0;k<4;k++) { const q=((ms-P.binder)/200+k/4)%1; gfx.globalAlpha=1-q; RO(x-6+q*24,y-20-q*30,14,18,CREAM); gfx.globalAlpha=1; } }
    if(ms>P.espresso&&ms<P.broch) { const x=sD.x-26,y=sD.b-DH*.55; RO(x-7,y-6,14,12,'#f4f0e6'); R(x-6,y-6,12,3,'#5a3a2a'); ring(x+9,y,3,4,2,'#f4f0e6'); for(let j=0;j<2;j++) { const q=(s2.t*1.3+j/2)%1; gfx.globalAlpha=1-q; LnO(x-2+j*4,y-8-q*18,x+j*4+Math.sin(q*5)*2,y-16-q*18,2,'#fff'); gfx.globalAlpha=1; }
      PO([[x-30,y+10],[x-22,y+10],[x-26,y+24]],'#f0c070'); EO(x-26,y+6,5,5,'#ff9ac0'); EO(x-26,y+1,4,4,'#9fd090'); }
    if(ms>P.vespa&&ms<P.vespa+900) { const q=seg(ms,P.vespa,P.vespa+900),x=lerp(600,-60,q),y=by-6; EO(x-12,y,7,7,'#333'); EO(x+12,y,7,7,'#333'); PO([[x-14,y-6],[x+16,y-6],[x+12,y-22],[x-4,y-22]],'#e8445a'); LnO(x+10,y-22,x+16,y-34,3,'#333'); EO(x,y-30,5,5,'#f6c39c'); R(x-5,y-36,10,4,RED); if(Math.floor(ms/100)%2) bigWord('BEEP BEEP',x,y-56,CREAM,2); }
    if(ms>P.broch) { const q=ez(seg(ms,P.broch,P.broch+500)); for(const [k,p] of party.concat(list).entries()) { const h=ST.unit(p),x=lerp(sD.x,h.x,q),y=lerp(sD.b-DH*.5,h.top-18,q)-Math.sin(q*Math.PI)*40; gfx.save(); gfx.translate(x,y); gfx.rotate(q*(k%2?1:-1)*.5); RO(-9,-12,18,24,'#f6e8c0'); italy(0,4,.3); gfx.restore(); } } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! Deedee has been planning something. For everybody."); S('whoosh'); }],
    [P.binder,()=>{ S('thud'); say('deedee','dc2'); word('THE BINDER',sT.x-20,Math.max(40,by-TH-80),GOLD,3,.9); setMessage('A three-ring binder. With tabs. Tom holds it.'); }],
    [P.map,()=>{ S('whoosh'); setMessage('A map of Italy unrolls out of nowhere.'); }],
    ...PINS.map(([nm],k)=>[P.pin0+k*P.each,()=>{ S('ding'); word(nm+'!',sD.x,Math.max(40,by-DH-60),PINK,3,.6); if(k===2) setMessage('Rome, then Florence, then the coast. Four days each. It is decided.'); }]),
    [P.espresso,()=>{ S('ting'); say('tom','dcdeedee2'); setMessage('Espresso. Gelato. Three flavors, no choosing.'); }],
    [P.vespa,()=>{ S('toot'); S('beep'); }],
    [P.broch,()=>{ S('whoosh'); setMessage('Everybody gets a brochure. The monsters get a brochure.'); }],
    ['hf',P.apply],
    [P.apply,()=>{ E2.apply(); for(const p of party) glowOn(p); for(const f of list) { const q=ST.foe(f); scene('tu_glow',1,{x:q.x,y:q.mid,c:'#ffb45a'}); ST.jolt(f,.15); } S('heal'); S('fanfare'); word('ANDIAMO!',mx+60,Math.max(50,my+40),GOLD,5,1.4); scene('tu_confetti',1.4,{x0:dx-80,x1:tx+80,n:26}); }],
    [P.end,'end',()=>'Tucked in and dreaming of the coast. Two Warm Crusts on the tray, with a side of gelato.']];
  ST.play(E2,steps); };

// ---------- Tom Cooks for Mom (Tom + Deedee, tier 3) ----------
// Tom's counter. He lifts the cloth: his best sourdough. He waves it under her nose. She bites. NEEDS SALT. Then she
// spots the counter, grabs a broom, and sweeps the whole stage with it, monsters included, in one long pass.
// Effects unchanged: huge Cozy hit on all, party heals 60% and Tucked In, 3 Hot Dishes.
const loaf=(x,y,sc=1,bite=false)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); EO(0,0,22,12,'#c8884a'); E(-4,-4,12,5,'#e0a860'); for(const [a,b] of [[-12,-6],[-2,-8],[8,-6]]) Ln(a,b,a+6,b+4,2,'#8a5a30'); if(bite) { E(16,-4,8,7,'#3a6a4a'); E(16,-4,6,5,'#f0d8a0'); } gfx.restore(); };
const broom=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); LnO(0,0,0,-70,4,WOOD2); PO([[-12,0],[12,0],[16,22],[-16,22]],'#e0b060'); for(let k=-12;k<=12;k+=4) R(k,2,2,18,'#c89040'); R(-13,0,26,4,RED); gfx.restore(); };
B2_TOMBO_ANIM.deedee3=E2=>{ const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),D=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,dsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,DH=dsp.idle.length*dsp.scale;
  const by=Math.min(312,Math.max(T.base,D.base)),cx=cl(GR.x1+130,210,328),tx=cx-40,dx=cx+50;
  const P={run:600,cloth:1000,wave:1500,bite:2500,salt:3100,spot:3900,broom:4400,sweep0:5000,sweep1:6000,back:6600,apply:7000,end:8800};
  const sT={x:T.x,b:T.base,f:tsp.idle},sD={x:D.x,b:D.base,f:dsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,1)); }
    if(ms<P.end-700) { const wave=ms>P.wave&&ms<P.bite; return stand(sT,tx+(wave?Math.sin(c.t*10)*4:0),by,ms<P.cloth?sp.flip:(wave?mir(sp,'act'):(ms>P.salt&&ms<P.spot?(sp.expr||sp.flip):(ms>P.apply?sp.celeb:sp.flip)))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sD,lerp(c.origX,dx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.sweep0) return stand(sD,dx,by,ms<P.bite?sp.idle:(ms<P.salt?F(sp,'hold'):(ms<P.spot?F(sp,'point'):(ms<P.broom?F(sp,'act'):F(sp,'carry')))));
    if(ms<P.sweep1) { const q=seg(ms,P.sweep0,P.sweep1); return stand(sD,lerp(dx,GR.x0-30,q),by+Math.sin(c.t*18)*1.5,runFr(sp,c.t,-1)); }
    if(ms<P.back) return stand(sD,GR.x0-30,by,F(sp,'hip'));
    if(ms<P.end-700) { const k=ez(seg(ms,P.back,P.back+600)); return stand(sD,lerp(GR.x0-30,dx,k),by,k<1?runFr(sp,c.t,1):(ms>P.apply?sp.celeb:F(sp,'spread'))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sD,lerp(dx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+300)); if(g<=0) return; // counter with crumbs
    RO(cx-60,by-36*g,120,10,'#e8e4dc'); R(cx-58,by-35*g,116,3,'#ffffff'); R(cx-54,by-26*g,8,26*g,'#c9c2b8'); R(cx+46,by-26*g,8,26*g,'#c9c2b8'); if(ms<P.sweep1) for(let k=0;k<8;k++) R(cx-50+k*13,by-30+(k%3)*2,3,2,'#c8884a'); }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms<P.cloth) { RO(cx-32,by-56,64,20,'#d8e4f0'); } 
    else if(ms<P.sweep0) { const h={x:ms<P.bite?sT.x-20+(ms>P.wave?Math.sin(s2.t*10)*8:0):sD.x-22,y:(ms<P.bite?sT.b-TH*.55:sD.b-DH*.55)}; loaf(h.x,h.y,1.1,ms>P.bite+200);
      if(ms>P.wave&&ms<P.bite) for(let j=0;j<3;j++) { const q=(s2.t*1.3+j/3)%1; gfx.globalAlpha=1-q; LnO(h.x-10+j*10,h.y-12-q*26,h.x-8+j*10+Math.sin(q*6)*3,h.y-24-q*26,2,'#fff'); gfx.globalAlpha=1; } }
    if(ms>P.broom&&ms<P.back+200) { const sw=ms>P.sweep0?Math.sin(ms/90)*.5:0; broom(sD.x-18,sD.b-10,-.5+sw); if(ms>P.sweep0&&ms<P.sweep1) for(let k=0;k<6;k++) { const q=(s2.t*2+k/6)%1; gfx.globalAlpha=(1-q)*.8; E(sD.x-30+k*8,sD.b-4-q*20,5,3,'#e8dcc4'); } gfx.globalAlpha=1; } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! For once, Tom cooks for his mom.'); S('whoosh'); }],
    [P.cloth,()=>{ S('whoosh'); say('tom','tombodeedee3'); setMessage('He lifts the cloth. Forty-eight hours of sourdough.'); }],
    [P.wave,()=>{ S('select'); word('SMELL THAT',tx,Math.max(40,by-TH-70),GOLD,3,.9); setMessage('He waves it under her nose.'); }],
    [P.bite,()=>{ S('crunch'); setMessage('She takes a bite. Chews. Thinks.'); }],
    [P.salt,()=>{ S('nope'); say('deedee','tombo3'); word('NEEDS SALT.',dx,Math.max(40,by-DH-70),PINK,4,1.1); setMessage('Needs salt. Tom\'s face.'); }],
    [P.spot,()=>{ S('stun'); setMessage('Then she sees the counter. The crumbs.'); }],
    [P.broom,()=>{ S('whoosh'); word('WHO CLEANED THIS?',dx,Math.max(40,by-DH-70),PINK,3,.9); setMessage('A broom appears. Nobody is safe.'); }],
    [P.sweep0,()=>{ S('run'); S('whoosh'); }],
    ['hf',P.sweep0+500]];
  tgts.forEach((f,k)=>{ const q=ST.foe(f),at=P.sweep0+Math.round(seg(q.x+q.w*.3,dx,GR.x0-30)*(P.sweep1-P.sweep0));
    steps.push([at,()=>{ S('bonk'); S('whoosh'); ST.jolt(f,.5); battle.shakeEnemy=.4; scene('tu_dust',.6,{x:q.x,y:q.base,r:40,n:10}); word('SWEPT!',q.x+10,Math.max(56,q.top-70),GOLD,4,.6); landHit(share[k]); }]); });
  steps.push(
    [P.back,()=>{ setMessage('Swept clean. Monsters, crumbs, everything.'); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); S('fanfare'); word('SUNDAY DINNER',cx,Math.max(50,by-DH-80),GOLD,4,1.3); }],
    [P.end,'end',()=>(E2.result||'')+' Three hot dishes on the tray. The bread still needed salt.']);
  ST.play(E2,steps); };

// ================= Tom + Boppy =================
// Boppy's own frames for these scenes (IK arms on his body, crouch ones on the kneel body: no rig warp).
let bopPosed=false; const bopPoses=()=>{ if(bopPosed||typeof RECRUIT_POSES==='undefined') return; bopPosed=true;
  for(const [k,P] of Object.entries({crouchnet:{nh:[-12,5],fh:[-10,5],crouch:1,lean:-7},crouchsit:{nh:[-4,8],fh:[4,8],crouch:1,lean:2},shh:{nh:[-3,-9],fh:[2,8],lean:-2},rod:{nh:[-10,-4],fh:[-6,2],lean:-3},heave:{nh:[-13,-2],fh:[-11,-1],lean:-8},keys:{nh:[-9,-10],fh:[2,8]},wrench:{nh:[-12,4],fh:[-8,6],lean:-6},eat:{nh:[-4,-7],fh:[2,8]},plant:{nh:[-10,6],fh:[-8,7],crouch:1,lean:-5},fire:{nh:[-6,-4],fh:[6,-4],lean:-4}})) RECRUIT_POSES.add('boppy',k,P); };
const rodDraw=(x,y,a,bend=0,len=120)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); LnO(16,0,-len*.55,0,4,'#8a5a30'); gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.beginPath(); gfx.moveTo(-len*.55,0); gfx.quadraticCurveTo(-len*.8,bend*30,-len*.97,bend*48); gfx.stroke(); gfx.strokeStyle='#c99a62'; gfx.lineWidth=3; gfx.stroke(); LnO(16,0,-24,0,7,'#d9b27a'); EO(-10,7,5,5,'#aeb3ba'); gfx.restore(); };
const netDraw=(x,y,w,h,sag)=>{ gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath(); gfx.ellipse(x,y,w,h,0,0,Math.PI*2); gfx.stroke(); gfx.strokeStyle='#c9c2b8'; gfx.lineWidth=2.5; gfx.stroke();
  gfx.save(); gfx.beginPath(); gfx.ellipse(x,y,w,h,0,0,Math.PI*2); gfx.clip(); gfx.strokeStyle='#e8e4dc'; gfx.lineWidth=1.5; for(let k=-w;k<=w;k+=12) { gfx.beginPath(); gfx.moveTo(x+k,y-h); gfx.lineTo(x+k+sag*10,y+h); gfx.stroke(); } for(let k=-h;k<=h;k+=10) { gfx.beginPath(); gfx.moveTo(x-w,y+k); gfx.lineTo(x+w,y+k+sag*6); gfx.stroke(); } gfx.restore(); };
const pierDraw=(x0,x1,y)=>{ for(let x=x0;x<x1;x+=28) { RO(x,y-4,26,8,WOOD2); R(x+2,y-3,22,2,'#e0a860'); } for(let x=x0+8;x<x1;x+=84) { RO(x,y+4,8,22,WOOD3); } };
const reeds=(x,y,n)=>{ for(let k=0;k<n;k++) { const rx=x+k*14,h=40+(k%3)*10; LnO(rx,y,rx+Math.sin(k)*4,y-h,3,'#6a8a3a'); EO(rx+Math.sin(k)*4,y-h-6,3,8,'#6e4824'); } };
const hookFoes=(list,t0,dur,P,up)=>{ for(const f of list) { const q=ST.foe(f); f.spin=0; f.ox=0; f.oy=-up; f.spinAt=performance.now(); } };

// ---------- You Hold the Net (Tom + Boppy, tier 1) ----------
// Cattail Pier. Tom holds the big net and will not stop moving it. Boppy casts one huge line right over the monsters,
// hooks all of them, and reels; Tom runs the net under the lot and they heave together. Everything lands on the pier
// and Boppy crouches to inspect the catch (custom crouch). Effects unchanged: Splash hit on all, back row forward, Grumbled.
B2_TOMBO_ANIM.boppy1=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),bx=cl(GR.x1+160,230,380),tx=bx-70;
  const P={run:600,wobble:900,cast:1900,land:2400,hook:2900,reel:3300,heave:4200,dump:4800,crouch:5500,apply:6000,end:7800};
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.reel) { const wob=ms>P.wobble&&ms<P.cast?Math.sin(c.t*9)*6:0; return stand(sT,tx+wob,by,sp.aim,wob*.01); }
    if(ms<P.heave) { const q=ez(seg(ms,P.reel,P.reel+500)); return stand(sT,lerp(tx,GR.x0-26,q),by,q<1?runFr(sp,c.t,-1):sp.aim); }
    if(ms<P.dump) { const q=seg(ms,P.heave,P.dump); return stand(sT,GR.x0-26+q*26,by-Math.sin(q*Math.PI)*6,sp.wind,-.2*Math.sin(q*Math.PI)); }
    if(ms<P.end-700) { const k=ez(seg(ms,P.dump,P.dump+500)); return stand(sT,lerp(GR.x0,tx,k),by,k<1?runFr(sp,c.t,1):(ms>P.apply?sp.celeb:sp.idle)); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.cast) return stand(sB,bx,by,ms>P.wobble+400?F(sp,'point'):F(sp,'rod'));
    if(ms<P.land) { const q=seg(ms,P.cast,P.land); return stand(sB,bx-q*8,by,F(sp,'throw'),-.1*Math.sin(q*Math.PI)); }
    if(ms<P.heave) return stand(sB,bx+(ms>P.reel?Math.sin(c.t*20)*2:0),by,ms>P.reel?F(sp,'heave'):F(sp,'rod'));
    if(ms<P.dump) { const q=seg(ms,P.heave,P.dump); return stand(sB,bx+q*10,by,F(sp,'heave'),-.15*Math.sin(q*Math.PI)); }
    if(ms<P.crouch) return stand(sB,bx,by,F(sp,'hip'));
    if(ms<P.end-700) { const k=ez(seg(ms,P.crouch,P.crouch+300)); return stand(sB,lerp(bx,GR.x1+40,k),by,k<1?runFr(sp,c.t,-1):(ms>P.apply+800?F(sp,'crouchsit'):F(sp,'crouchnet'))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(GR.x1+40,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+400)); if(g<=0) return; gfx.globalAlpha=g; pierDraw(Math.max(0,GR.x0-40),576,by+6); reeds(Math.max(10,GR.x0-70),by+2,3); gfx.globalAlpha=1;
    // water under the monsters, splashing when they are hauled
    gfx.globalAlpha=.35*g; E(GR.x,GR.base+6,GR.w*.7+40,14,'#5fa8d8'); gfx.globalAlpha=1; }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.run) return;
    // the net on Tom's pole
    const nx=sT.x-40-(ms>P.reel?20:0),ny=sT.b-TH*.5-(ms>P.heave&&ms<P.dump?Math.sin(seg(ms,P.heave,P.dump)*Math.PI)*40:0),wob=ms>P.wobble&&ms<P.cast?Math.sin(s2.t*9)*.2:0; gfx.save(); gfx.translate(sT.x-12,sT.b-TH*.5); gfx.rotate(-.9+wob); LnO(0,0,-60,0,4,WOOD2); gfx.restore(); netDraw(nx,ny+10,30,18,wob*2);
    // the rod and line
    if(ms<P.crouch) { const ang=ms<P.cast?.9:(ms<P.land?lerp(.9,-.6,ez(seg(ms,P.cast,P.land))):(ms<P.reel?-.4:lerp(-.4,.6,ez(seg(ms,P.reel,P.heave))))),bend=ms>P.reel&&ms<P.dump?1:0; rodDraw(sB.x-16,sB.b-BH*.52,ang,bend);
      if(ms>P.cast) { const q=ms<P.land?ez(seg(ms,P.cast,P.land)):1,tx1=lerp(sB.x-100,GR.x-20,q),ty=ms<P.land?sB.b-BH-60*Math.sin(q*Math.PI):GR.top-10+(ms>P.reel?-ez(seg(ms,P.reel,P.heave))*40:0); gfx.strokeStyle='#ffffffaa'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(sB.x-110,sB.b-BH*.6); gfx.quadraticCurveTo((sB.x+tx1)/2,Math.min(ty,sB.b-BH)-40,tx1,ty); gfx.stroke(); EO(tx1,ty+4,4,5,'#c9c2b8'); } }
    if(ms>P.dump&&ms<P.dump+600) { const q=seg(ms,P.dump,P.dump+600); gfx.globalAlpha=1-q; for(let k=0;k<10;k++) { const a=k/10*Math.PI*2,d=q*60; E(GR.x+Math.cos(a)*d*1.5,GR.base+Math.sin(a)*d*.4-q*20,6,4,'#9fd8ff'); } gfx.globalAlpha=1; } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Cattail Pier. Tom has the net. Boppy has the rod.'); S('whoosh'); }],
    [P.wobble,()=>{ say('boppy','tombo'); setMessage('Hold the net STILL. Why is it moving?'); }],
    [P.wobble+500,()=>{ S('bump'); word('IT\'S HEAVY',tx,Math.max(40,by-TH-70),CREAM,3,.7); }],
    [P.cast,()=>{ S('whoosh'); setMessage('One cast. Over all of them.'); }],
    [P.land,()=>{ S('splash'); scene('tu_rings',.5,{x:GR.x,y:GR.base,r:40,c:'#9fd8ff'}); }],
    [P.hook,()=>{ S('ting'); word('HOOKED!',GR.x,Math.max(50,GR.top-60),GOLD,4,.8); for(const f of list) ST.jolt(f,.2); }],
    [P.reel,()=>{ S('reel'); setMessage('He reels. Tom runs the net under the lot of them.'); hookFoes(list,0,0,P,12); }],
    [P.heave,()=>{ S('whoosh'); word('HEAVE!',(tx+bx)/2,Math.max(40,by-BH-80),CREAM,5,.6); hookFoes(list,0,0,P,46); }],
    ['hf',P.dump],
    [P.dump,()=>{ S('splash'); S('thud'); S('bonk'); for(const f of list) { f.oy=0; f.spinAt=performance.now(); } hitFoes(tgts,share); battle.shakeEnemy=.5; word('ON THE PIER!',GR.x,Math.max(56,GR.top-80),GOLD,4,1); setMessage('Every one of them lands on the pier. Flopping.'); }],
    [P.crouch,()=>{ setMessage('Boppy crouches to look at the catch. His knees have opinions.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); say('tom','tombodeedee'); }],
    [P.apply+900,()=>{ S('creak'); word('OOF. MY KNEES.',GR.x1+40,Math.max(40,by-BH-30),CREAM,3,1); }],
    [P.end,'end',()=>(E2.result||'')+' Keepers, all of them. Boppy says they all hit softer now.']];
  ST.play(E2,steps); };

// ---------- Quiet on Cattail Pier (Tom + Boppy, Director's Cut 1) ----------
// Same pier, dusk. Tom baits the hook with sourdough crust, loudly. Boppy shushes him (finger up) twice. One enormous cast
// over every monster, they both grab the rod and heave; the lot comes in Hooked. Boppy crouches to unhook (custom crouch).
B2_TOMBO_ANIM.boppy1_dc=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),bx=cl(GR.x1+150,230,318),tx=bx+60;
  const P={run:600,bait:900,shh1:1500,bait2:1900,shh2:2300,cast:2900,land:3400,hook:3800,heave:4300,pull:5000,crouch:5700,apply:6200,end:8000};
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.cast) { const b=(ms>P.bait&&ms<P.shh1)||(ms>P.bait2&&ms<P.shh2); return stand(sT,tx,by,b?sp.act:(sp.expr||sp.idle)); }
    if(ms<P.heave) return stand(sT,tx,by,sp.aim);
    if(ms<P.pull) { const q=seg(ms,P.heave,P.pull); return stand(sT,tx-20+Math.sin(c.t*20)*2,by,sp.wind,-.15*Math.sin(q*Math.PI)); }
    if(ms<P.end-700) return stand(sT,tx,by,ms>P.apply?sp.celeb:sp.idle);
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.cast) { const sh=(ms>P.shh1&&ms<P.shh1+400)||(ms>P.shh2&&ms<P.shh2+400); return stand(sB,bx,by,sh?F(sp,'shh'):F(sp,'rod')); }
    if(ms<P.land) { const q=seg(ms,P.cast,P.land); return stand(sB,bx-q*8,by,F(sp,'throw'),-.15*Math.sin(q*Math.PI)); }
    if(ms<P.heave) return stand(sB,bx,by,F(sp,'rod'));
    if(ms<P.pull) { const q=seg(ms,P.heave,P.pull); return stand(sB,bx+Math.sin(c.t*20)*2,by,F(sp,'heave'),-.2*Math.sin(q*Math.PI)); }
    if(ms<P.crouch) return stand(sB,bx,by,F(sp,'hip'));
    if(ms<P.end-700) { const k=ez(seg(ms,P.crouch,P.crouch+300)); return stand(sB,lerp(bx,GR.x1+40,k),by,k<1?runFr(sp,c.t,-1):F(sp,'crouchnet')); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(GR.x1+40,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+400)); if(g<=0) return; gfx.globalAlpha=.22*g; R(0,0,576,324,'#2a2a6a'); gfx.globalAlpha=g; pierDraw(Math.max(0,GR.x0-40),576,by+6); reeds(Math.max(10,GR.x0-80),by+2,4); gfx.globalAlpha=.35*g; E(GR.x,GR.base+6,GR.w*.7+40,14,'#3f78b8'); gfx.globalAlpha=1; }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.run) return;
    if(ms>P.bait&&ms<P.cast) { const h={x:sT.x-22,y:sT.b-TH*.55}; RO(h.x-8,h.y-5,16,10,'#c8884a'); R(h.x-6,h.y-7,12,3,'#e0a860'); if((ms>P.bait&&ms<P.shh1)||(ms>P.bait2&&ms<P.shh2)) for(let k=0;k<3;k++) { const q=(s2.t*2+k/3)%1; gfx.globalAlpha=1-q; bigWord(['CRUMB','CRUMB','CRUST'][k],h.x-10+k*10,h.y-30-q*20,CREAM,1); gfx.globalAlpha=1; } }
    if((ms>P.shh1&&ms<P.shh1+500)||(ms>P.shh2&&ms<P.shh2+500)) bigWord('SHHH!',sB.x-10,Math.max(30,sB.b-BH-30),CREAM,3);
    if(ms<P.crouch) { const two=ms>P.heave&&ms<P.pull,ang=ms<P.cast?.9:(ms<P.land?lerp(.9,-.7,ez(seg(ms,P.cast,P.land))):(ms<P.heave?-.5:lerp(-.5,.5,ez(seg(ms,P.heave,P.pull))))); rodDraw(sB.x-16,sB.b-BH*.52,ang,two?1:0,two?150:120);
      if(ms>P.cast) { const q=ms<P.land?ez(seg(ms,P.cast,P.land)):1,tx1=lerp(sB.x-100,GR.x,q),ty=ms<P.land?sB.b-BH-80*Math.sin(q*Math.PI):GR.top-6+(two?-ez(seg(ms,P.heave,P.pull))*30:0); gfx.strokeStyle='#ffffffaa'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(sB.x-110,sB.b-BH*.6); gfx.quadraticCurveTo((sB.x+tx1)/2,Math.min(ty,sB.b-BH)-60,tx1,ty); gfx.stroke(); EO(tx1,ty+4,5,6,'#c9c2b8'); if(ms>P.hook) for(const f of list) { const q2=ST.foe(f); gfx.strokeStyle='#ffffffaa'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.moveTo(tx1,ty); gfx.lineTo(q2.x,q2.top+6); gfx.stroke(); } } } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! Dusk on Cattail Pier. Quiet, please."); S('whoosh'); }],
    [P.bait,()=>{ S('crunch'); say('tom','dcboppy1'); setMessage('Tom baits the hook with sourdough crust. Loudly.'); }],
    [P.shh1,()=>{ S('hiss'); say('boppy','dc1'); }],
    [P.bait2,()=>{ S('crunch'); setMessage('Tom keeps crumbling. Boppy keeps shushing.'); }],
    [P.shh2,()=>{ S('hiss'); }],
    [P.cast,()=>{ S('whoosh'); setMessage('One enormous cast over every single monster.'); }],
    [P.land,()=>{ S('splash'); scene('tu_rings',.5,{x:GR.x,y:GR.base,r:50,c:'#9fd8ff'}); }],
    [P.hook,()=>{ S('ting'); word('ALL HOOKED!',GR.x,Math.max(50,GR.top-60),GOLD,4,.8); for(const f of list) ST.jolt(f,.25); }],
    [P.heave,()=>{ S('reel'); word('HEAVE!',(tx+bx)/2,Math.max(40,by-BH-80),CREAM,5,.6); setMessage('Both hands on the rod. Father and son. One pull.'); hookFoes(list,0,0,P,30); }],
    ['hf',P.pull],
    [P.pull,()=>{ S('splash'); S('bonk'); S('thud'); for(const f of list) { f.oy=0; f.spinAt=performance.now(); } hitFoes(tgts,share); battle.shakeEnemy=.5; word('REELED IN!',GR.x,Math.max(56,GR.top-80),GOLD,4,1); setMessage('The whole row comes in at once. Hooked. Front and center.'); }],
    [P.crouch,()=>{ setMessage('Boppy crouches to unhook them. Slowly. With commentary.'); }],
    [P.apply,()=>{ E2.apply(); S('heal'); word('HEARTBURN +2',bx,Math.max(40,by-BH-40),'#ff8a60',2,1); }],
    [P.end,'end',()=>(E2.result||'')+' Quiet on the pier. Finally. Boppy will be up all night with the crust.']];
  ST.play(E2,steps); };

// ---------- Nobody Gets Past Us (Tom + Boppy, tier 2): The Dep ----------
// Tom tosses Boppy the warden's cap and the keyring. Boppy snaps the cap on: THE DEP. A spotlight sweeps the stage,
// then the cell door drops bar by bar in front of the family with sparks, and he spins the keys and locks it. CLACK.
// Effects unchanged: Chatter hit on all that interrupts, party shield 3 turns.
const capDraw=(x,y,a=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); RO(-14,-4,28,8,'#1f2a4a'); RO(-11,-16,22,14,'#1f2a4a'); R(-10,-8,20,3,'#e0b040'); EO(0,-10,4,4,'#e0b040'); gfx.restore(); };
const keyring=(x,y,a)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(a); ring(0,0,8,8,3,'#e0b040'); for(let k=0;k<3;k++) { const b=k*1.1+.5; LnO(Math.cos(b)*8,Math.sin(b)*8,Math.cos(b)*22,Math.sin(b)*22,3,'#c9c2b8'); R(Math.cos(b)*20-2,Math.sin(b)*20-2,5,5,'#c9c2b8'); } gfx.restore(); };
B2_TOMBO_ANIM.boppy2=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),bx=cl(GR.x1+120,210,298),tx=bx+80,gx=cl(GR.x1+40,150,280);   // the door drops at gx
  const BARS=7,P={run:600,toss:900,cap:1300,dep:1700,light:2300,bar0:3200,each:140,keys:0,lock:0,apply:0,end:0};
  P.keys=P.bar0+BARS*P.each+300; P.lock=P.keys+700; P.apply=P.lock+500; P.end=P.apply+2000;
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) return stand(sT,tx,by,ms>P.toss&&ms<P.toss+400?sp.throw:(ms>P.dep&&ms<P.dep+600?sp.act:(ms>P.lock?sp.celeb:sp.idle)));
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.cap) return stand(sB,bx,by,ms>P.toss+200?F(sp,'spread'):sp.idle);
    if(ms<P.dep) return stand(sB,bx,by,F(sp,'wave'));
    if(ms<P.bar0) return stand(sB,bx,by,ms>P.dep&&ms<P.dep+700?F(sp,'flex'):F(sp,'hip'));
    if(ms<P.keys) return stand(sB,bx,by,F(sp,'point'));
    if(ms<P.lock) { const q=seg(ms,P.keys,P.lock); return stand(sB,lerp(bx,gx+40,q),by,q<1?runFr(sp,c.t,-1):F(sp,'keys')); }
    if(ms<P.end-700) { const k=ez(seg(ms,P.lock+400,P.lock+900)); return stand(sB,lerp(gx+40,bx,k),by,ms<P.lock+400?F(sp,'keys'):(k<1?runFr(sp,c.t,1):F(sp,'flex'))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(bx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{
    if(ms>P.toss&&ms<P.cap) { const q=ez(seg(ms,P.toss,P.cap)); capDraw(lerp(sT.x-20,sB.x,q),lerp(sT.b-TH*.6,sB.b-BH*.96,q)-Math.sin(q*Math.PI)*50,q*6); keyring(lerp(sT.x-20,sB.x-20,q),lerp(sT.b-TH*.5,sB.b-BH*.5,q)-Math.sin(q*Math.PI)*30,q*8); }
    if(ms>=P.cap) capDraw(sB.x+2,sB.b-BH*.96-2,0);
    if(ms>=P.cap&&ms<P.keys) keyring(sB.x-20,sB.b-BH*.45,Math.sin(ms/200)*.3);
    if(ms>P.light&&ms<P.bar0) { const q=seg(ms,P.light,P.bar0),x=lerp(60,520,q); gfx.globalAlpha=.3; PO([[x-10,0],[x+10,0],[x+70,324],[x-70,324]],'#fff6c0',0); gfx.globalAlpha=1; }
    // the cell door: bars drop one by one with sparks, then the frame and the lock
    const dropped=cl(Math.floor((ms-P.bar0)/P.each),0,BARS); for(let k=0;k<dropped;k++) { const t0=P.bar0+k*P.each,q=ez((ms-t0)/120),x=gx-36+k*12,top=lerp(-200,40,q); RO(x-2,top,4,by+10-top,'#6a7080'); R(x-1,top,2,by+10-top,'#9aa3b0'); if(ms<t0+260) { gfx.globalAlpha=1-(ms-t0)/260; for(let j=0;j<4;j++) star(x+(j-1.5)*8,by+8-(ms-t0)*.15,3+(j%2)*2,GOLD2,j); gfx.globalAlpha=1; } }
    if(dropped>=BARS) { RO(gx-44,36,88,8,'#6a7080'); RO(gx-44,by+2,88,8,'#6a7080'); RO(gx-44,by-60,88,6,'#6a7080'); RO(gx+34,by-30,14,18,'#2b2a26'); EO(gx+41,by-21,3,3,'#e0b040'); }
    if(ms>P.lock&&ms<P.lock+400) keyring(gx+41,by-21,ez(seg(ms,P.lock,P.lock+400))*Math.PI*2);
    if(ms>P.lock+150&&ms<P.lock+1200) bigWord('CLACK',gx+41,by-100,CREAM,3); }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Father and son, shoulder to shoulder.'); S('whoosh'); }],
    [P.toss,()=>{ S('whoosh'); say('tom','tomboboppy2'); setMessage('Tom tosses him the cap and the keys. Lock \'em up, Dep.'); }],
    [P.cap,()=>{ S('thud'); }],
    [P.dep,()=>{ S('fanfare'); say('boppy','tombo2'); word('THE DEP',bx,Math.max(40,by-BH-70),GOLD,6,1.4); setMessage('Short for Deputy. He flexes. The cap stays on.'); }],
    [P.light,()=>{ S('siren'); setMessage('A spotlight sweeps the stage. Nobody moves.'); }],
    ...Array.from({length:BARS},(_,k)=>[P.bar0+k*P.each,()=>{ S('clang'); if(k===0) setMessage('The cell door comes down. Bar. By. Bar.'); }]),
    ['hf',P.lock],
    [P.keys,()=>{ S('jangle'); setMessage('He spins the keys once and locks it.'); }],
    [P.lock,()=>{ S('clang'); S('thud'); scene('tu_flash',.2,{a:.35}); hitFoes(tgts,share); battle.shakeEnemy=.45; word('NOBODY GETS PAST THE DEP',gx+40,Math.max(56,GR.top-90),GOLD,3,1.4); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); }],
    [P.end,'end',()=>(E2.result||'')+' Locked down. Family rule. The Dep keeps the keys.']];
  ST.play(E2,steps); };

// ---------- Measure Twice (Tom + Boppy, Director's Cut 2; replaces Bird's Nest) ----------
// Tom's kitchen sink drips. Boppy arrives with the wrench. One turn: a spray. Another: three sprays. A third: the pipe
// becomes a geyser and Tom cries. The geyser blasts the monster. Effects unchanged: big Splash hit on one, breaks its
// shield, steals a buff.
B2_TOMBO_ANIM.boppy2_dc=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),tgt=(E2.targets||[]).find(t=>t.side==='foe')||list[0],Q=ST.foe(tgt),GR=ST.group(list);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),cx=cl(GR.x1+120,200,278),bx=cx+36,tx=cx+100;   // cabinet at cx, Boppy kneels at it, Tom behind
  const P={run:600,drip:900,turn1:1600,turn2:2500,turn3:3400,geyser:4000,cry:4400,blast:5000,apply:5600,end:7400};
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) { const wet=ms>P.turn2; return stand(sT,tx+(ms>P.cry&&ms<P.blast?Math.sin(c.t*24)*1.5:0),by,ms>P.cry?(sp.expr||sp.idle):(wet?sp.aim:(ms>P.apply?sp.celeb:sp.idle))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.geyser) { const turning=[P.turn1,P.turn2,P.turn3].some(t=>ms>t&&ms<t+400); return stand(sB,bx+(turning?Math.sin(c.t*30)*2:0),by,turning?F(sp,'wrench'):F(sp,'plant')); }
    if(ms<P.end-700) return stand(sB,bx+(ms<P.blast?Math.sin(c.t*20)*1:0),by,ms<P.blast?F(sp,'shrug'):(ms>P.apply?F(sp,'flex'):F(sp,'hip')));
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(bx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+300)); if(g<=0) return;
    RO(cx-40,by-50*g,80,50*g,'#e8e4dc'); R(cx-36,by-46*g,72,6,'#9fd8ff'); R(cx-38,by-36*g,36,34*g,WOOD2); R(cx+2,by-36*g,36,34*g,WOOD2); EO(cx-6,by-18,2,2,OUT); EO(cx+6,by-18,2,2,OUT); R(cx-2,by-60*g,4,20*g,'#9aa3a8'); }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.run) return; const t=s2.t;
    // the pipe under the sink (cabinet doors open), a drip, then sprays
    RO(cx-30,by-30,60,6,'#9aa3a8'); RO(cx-8,by-34,16,10,'#c9c2b8');
    if(ms>P.drip&&ms<P.turn1) { const q=(t*1.5)%1; E(cx,by-26+q*22,2.5,4,'#9fd8ff'); }
    const level=ms<P.turn1+200?0:(ms<P.turn2+200?1:(ms<P.turn3+200?2:3));
    if(level>=1&&ms<P.blast+400) for(let k=0;k<(level===1?1:(level===2?3:6));k++) { const a=-1.2-k*.45+Math.sin(t*9+k)*.1,L=20+level*14+k*4; for(let j=0;j<6;j++) { const q=(t*3+j/6+k*.2)%1; E(cx-6+k*6+Math.cos(a)*q*L,by-30+Math.sin(a)*q*L,3,2,'#9fd8ff'); } }
    if(ms>P.geyser&&ms<P.blast+500) { const q=ms<P.blast?ez(seg(ms,P.geyser,P.geyser+400)):1,h=160*q; gfx.globalAlpha=.9; PO([[cx-8,by-30],[cx+8,by-30],[cx+22,by-30-h],[cx-22,by-30-h]],'#9fd8ff',0); for(let j=0;j<10;j++) { const qq=(t*2+j/10)%1; E(cx-20+j*4+Math.sin(j)*6,by-30-qq*h,4,3,'#eef8ff'); } gfx.globalAlpha=1; }
    if(ms>P.blast&&ms<P.blast+700) { const q=seg(ms,P.blast,P.blast+700),x=lerp(cx,Q.x+Q.w*.3,q),y=lerp(by-170,Q.mid,q); if(q<1) { PO([[x-14,y-10],[x+14,y-10],[x+8,y+10],[x-8,y+10]],'#9fd8ff'); } }
    if(ms>P.cry) { const x=sT.x+2,y=sT.b-TH*.78; for(let k=0;k<2;k++) { const q=(t*2+k/2)%1; E(x-8+k*16,y+q*26,2.5,4,'#9fd8ff'); } if(ms<P.cry+1800) bigWord('WAAAH',sT.x,Math.max(30,sT.b-TH-30),SKY,3); } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! Tom's sink has a drip. Boppy has a wrench."); S('whoosh'); }],
    [P.drip,()=>{ S('splash'); setMessage('Drip. Drip. Boppy sighs and gets down on the floor.'); }],
    [P.turn1,()=>{ S('squeak'); say('boppy','dc2'); word('ONE TURN',bx,Math.max(40,by-BH-40),CREAM,3,.6); setMessage('One turn of the wrench. A spray.'); }],
    [P.turn2,()=>{ S('squeak'); S('spray'); word('ANOTHER',bx,Math.max(40,by-BH-40),CREAM,3,.6); setMessage('Another turn. Three sprays. Tom is getting wet.'); }],
    [P.turn3,()=>{ S('squeak'); S('spray'); word('THIS SHOULD DO IT',bx,Math.max(40,by-BH-40),CREAM,2,.6); }],
    [P.geyser,()=>{ S('crash'); S('splash'); scene('tu_flash',.2,{a:.3,c:'#9fd8ff'}); word('GEYSER!',cx,Math.max(40,by-240),SKY,6,1); setMessage('The pipe becomes a fountain. Water on the ceiling.'); }],
    [P.cry,()=>{ S('whine'); say('tom','dcboppy2'); setMessage('Tom cries. Actual tears. They add to the water.'); }],
    ['hf',P.blast+600],
    [P.blast,()=>{ S('whoosh'); setMessage('The geyser bends. Aims. Fires.'); }],
    [P.blast+600,()=>{ S('splash'); S('bonk'); ST.jolt(tgt,.6); battle.shakeEnemy=.45; scene('tu_rings',.6,{x:Q.x,y:Q.mid,r:50,c:'#9fd8ff'}); word('SPLOOSH!',Q.x,Math.max(56,Q.top-70),SKY,5,1); landHit(100); }],
    [P.apply,()=>{ E2.apply(); S('heal'); setMessage('Boppy: fixed. Technically the drip has stopped.'); }],
    [P.end,'end',()=>(E2.result||'')+' Measure twice, cut once, flood the kitchen anyway.']];
  ST.play(E2,steps); };

// ---------- Garden Lesson (Tom + Boppy, tier 3; replaces The Pepper-Broth Sneeze) ----------
// A raised bed. Boppy teaches: stake, hole, seedling, water. Tom plants his upside down. Boppy fixes it. Then the
// tomatoes grow, and grow, and the vines fling giant tomatoes at every monster. Boppy eats a pepper off his own vine.
// Effects unchanged: biggest Cozy hit on all, they lose a turn, Amber melts off the party, Boppy's Heartburn fills.
const seedling=(x,y,sc,upside)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,upside?-sc:sc); LnO(0,0,0,-16,2,'#6fae5a'); EO(-6,-12,6,3,'#6fae5a'); EO(6,-8,6,3,'#6fae5a'); gfx.restore(); };
const tomato=(x,y,r)=>{ EO(x,y,r,r*.9,'#e03a2e'); E(x-r*.3,y-r*.35,r*.3,r*.2,'#ff8a80'); R(x-1,y-r*.9-4,2,5,'#4a8a3a'); E(x,y-r*.9,4,2,'#6fae5a'); };
B2_TOMBO_ANIM.boppy3=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),tgts=list.slice(0,4),n=Math.max(1,tgts.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),gx=cl(GR.x1+120,200,324),bx=gx+54,tx=gx-54;   // the bed at gx, Boppy on the right, Tom on the left
  const P={run:600,lesson:900,steps:[1200,1700,2200,2700],tomplant:3400,fix:4000,grow:4800,fling:5800,pepper:6900,apply:7400,end:9200};
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,1)); }
    if(ms<P.end-700) { if(ms>P.tomplant&&ms<P.fix) return stand(sT,tx,by,sp.kneel||sp.flip); if(ms>P.fix&&ms<P.grow) return stand(sT,tx,by,sp.expr||sp.flip); if(ms>P.grow&&ms<P.fling) return stand(sT,tx,by,mir(sp,'act')); return stand(sT,tx,by,ms>P.apply?sp.celeb:sp.flip); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) { const st=P.steps.findIndex(t=>ms>=t&&ms<t+350); if(st>=0) return stand(sB,bx,by,st<2?F(sp,'point'):F(sp,'plant')); if(ms>P.fix&&ms<P.fix+600) return stand(sB,bx-20,by,F(sp,'plant')); if(ms>P.pepper&&ms<P.pepper+500) return stand(sB,bx,by,F(sp,'eat')); if(ms>P.pepper+500&&ms<P.apply+600) return stand(sB,bx,by-Math.abs(Math.sin(c.t*16))*3,F(sp,'spread')); return stand(sB,bx,by,ms<P.lesson?sp.idle:(ms>P.apply?F(sp,'flex'):F(sp,'hip'))); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(bx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+300)); if(g<=0) return;
    RO(gx-50,by-16*g,100,16*g,WOOD2); R(gx-46,by-14*g,92,10*g,'#5a3a24'); R(gx-46,by-14*g,92,3,'#7a5a3a'); }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.lesson) return; const t=s2.t;
    // the lesson: stake, hole, seedling, watering can
    if(ms>P.steps[0]) LnO(gx+30,by-10,gx+30,by-60,3,WOOD3); if(ms>P.steps[1]) E(gx,by-12,8,3,'#2a1a10'); if(ms>P.steps[2]&&ms<P.grow) seedling(gx,by-12,1,false);
    if(ms>P.steps[3]&&ms<P.steps[3]+500) { const h={x:sB.x-24,y:sB.b-BH*.5}; RO(h.x-8,h.y-6,16,14,'#5f8ad8'); LnO(h.x-8,h.y-2,h.x-22,h.y-10,3,'#5f8ad8'); for(let k=0;k<4;k++) { const q=(t*3+k/4)%1; E(h.x-22-q*8,h.y-10+q*20,2,3,'#9fd8ff'); } }
    // Tom's seedling, upside down, then fixed
    if(ms>P.tomplant&&ms<P.grow) seedling(gx-26,by-12+(ms<P.fix+300?16:0),1,ms<P.fix+300);
    // the vines grow and the tomatoes fling
    if(ms>P.grow) { const q=ez(seg(ms,P.grow,P.fling)),H=170*q; for(const vx of [gx-26,gx]) { gfx.strokeStyle=OUT; gfx.lineWidth=6; gfx.beginPath(); gfx.moveTo(vx,by-12); for(let y=0;y<=H;y+=10) gfx.lineTo(vx+Math.sin(y/22+vx)*8,by-12-y); gfx.stroke(); gfx.strokeStyle='#4a8a3a'; gfx.lineWidth=3; gfx.stroke(); for(let y=20;y<H;y+=36) EO(vx+Math.sin(y/22+vx)*8+10,by-12-y,8,4,'#6fae5a'); }
      if(ms<P.fling) for(let k=0;k<5;k++) { const y=30+k*30; if(y<H) tomato(gx-26+(k%2)*26+Math.sin(y/22)*8,by-12-y,6+q*8); }
      if(ms>=P.fling) tgts.forEach((f,k)=>{ const Q2=ST.foe(f),t0=P.fling+k*120,q2=seg(ms,t0,t0+420); if(q2>0&&q2<1) tomato(lerp(gx-14,Q2.x,q2),lerp(by-80,Q2.mid,q2)-Math.sin(q2*Math.PI)*70,16); }); 
      if(ms>P.pepper) { const vx=gx+Math.sin(70/22+gx)*8; if(ms<P.pepper+300) { EO(vx+12,by-80,4,9,'#e03a2e'); } } }
    if(ms>P.pepper+500&&ms<P.apply+900) { const x=sB.x,y=sB.b-BH*.72; for(let k=0;k<4;k++) { const q=(t*2.5+k/4)%1; gfx.globalAlpha=1-q; E(x-16+k*10,y-q*30,4,3,'#ff6a20'); } gfx.globalAlpha=1; E(x-10,y+4,5,3,'#ff6a60'); E(x+10,y+4,5,3,'#ff6a60'); } }});
  const steps=[
    [0,()=>{ setMessage('TOMBO! Tom finally asked for help with the garden.'); S('whoosh'); }],
    [P.lesson,()=>{ say('boppy','tombo3'); setMessage('Boppy: a tomato needs a cage. Like an inmate.'); }],
    [P.steps[0],()=>{ S('thud'); word('STAKE',bx,Math.max(40,by-BH-40),CREAM,3,.5); }],
    [P.steps[1],()=>{ S('select'); word('HOLE',bx,Math.max(40,by-BH-40),CREAM,3,.5); }],
    [P.steps[2],()=>{ S('select'); word('SEEDLING',bx,Math.max(40,by-BH-40),CREAM,3,.5); }],
    [P.steps[3],()=>{ S('splash'); word('WATER',bx,Math.max(40,by-BH-40),CREAM,3,.5); setMessage('Stake. Hole. Seedling. Water. Your turn.'); }],
    [P.tomplant,()=>{ S('thud'); say('tom','tomboboppy3'); setMessage('Tom plants his. Roots up. Leaves down.'); }],
    [P.fix,()=>{ S('nope'); word('OTHER WAY.',bx,Math.max(40,by-BH-40),CREAM,3,.8); setMessage('Boppy turns it over without a word. Then several words.'); }],
    [P.grow,()=>{ S('harp'); setMessage('Then the vines grow. Fast. Too fast.'); }],
    ['hf',P.fling+300],
    ...tgts.map((f,k)=>[P.fling+k*120,()=>S('whoosh')]),
    ...tgts.map((f,k)=>[P.fling+k*120+420,()=>{ const Q2=ST.foe(f); S('splat'); S('bonk'); ST.jolt(f,.55); battle.shakeEnemy=.4; scene('tu_rings',.6,{x:Q2.x,y:Q2.mid,r:46,c:'#ff9a8a'}); word('SPLAT!',Q2.x+8,Math.max(56,Q2.top-70),'#ff6a60',4,.7); landHit(share[k]); if(k===0) setMessage('Giant tomatoes. Every monster gets one. Seeing stars.'); }]),
    [P.pepper,()=>{ S('crunch'); setMessage('Boppy picks a pepper off his own vine and eats it. Mild, he says.'); }],
    [P.pepper+500,()=>{ S('sizzle'); word('HEARTBURN +3',bx,Math.max(40,by-BH-70),'#ff8a60',3,1); }],
    [P.apply,()=>{ E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal'); S('fanfare'); }],
    [P.end,'end',()=>(E2.result||'')+' Garden lesson over. The tomatoes are doing great. Tom is not allowed near them.']];
  ST.play(E2,steps); };

// ---------- Pepper Contest (Tom + Boppy, Director's Cut 3) ----------
// A card table with a plate of peppers and a Scoville meter. Round one: Tom turns pink. Round two: Tom sweats, fans
// himself, grabs the milk; Boppy reads the paper. Round three: Boppy's stomach rumbles. They both breathe fire down the
// row. Effects unchanged: big Cozy hit on a row, GRIT down, steals a buff each, Boppy Heartburn +1.
const pepperDraw=(x,y,c='#e03a2e')=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(.4); EO(0,0,4,10,c); R(-1,-14,2,5,'#4a8a3a'); gfx.restore(); };
B2_TOMBO_ANIM.boppy3_dc=E2=>{ bopPoses(); const {tom,pt,fxT,fxP}=E2; B2.aim=null;
  const T=ST.unit(tom),B=ST.unit(pt),list=b2LiveFoes(),tgts=(E2.targets||[]).filter(t=>t.side==='foe'),row=tgts.length?tgts:list.slice(0,3),GR=ST.group(row),n=Math.max(1,row.length),share=shares(n);
  const tsp=BATTLE_SPRITES.tom,bsp=BATTLE_SPRITES[pt.id],TH=tsp.idle.length*tsp.scale,BH=bsp.idle.length*bsp.scale;
  const by=Math.min(312,Math.max(T.base,B.base)),cx=cl(GR.x1+150,220,332),tx=cx-46,bx=cx+46;
  const P={run:600,r1:1100,r2:2300,fan:2900,milk:3400,r3:4300,rumble:5000,fire:5700,apply:6600,end:8400};
  const sT={x:T.x,b:T.base,f:tsp.idle},sB={x:B.x,b:B.base,f:bsp.idle};
  pathOf(fxT,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sT,lerp(c.origX,tx,k),lerp(c.origBase,by,k),runFr(sp,c.t,1)); }
    if(ms<P.end-700) { const eat=[P.r1,P.r2,P.r3].some(t=>ms>t&&ms<t+450); if(eat) return stand(sT,tx,by,mir(sp,'act')); if(ms>P.fan&&ms<P.milk) return stand(sT,tx+Math.sin(c.t*20)*2,by,sp.expr||sp.flip); if(ms>P.milk&&ms<P.r3) return stand(sT,tx,by,sp.wind); if(ms>P.fire&&ms<P.fire+900) return stand(sT,tx-6,by,mir(sp,'act'),-.1); return stand(sT,tx,by,ms>P.apply?sp.celeb:sp.flip); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sT,lerp(tx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  pathOf(fxP,P.end,(ms,c)=>{ const sp=c.sp;
    if(ms<P.run) { const k=ez(ms/P.run); return stand(sB,lerp(c.origX,bx,k),lerp(c.origBase,by,k),runFr(sp,c.t,-1)); }
    if(ms<P.end-700) { const eat=[P.r1,P.r2,P.r3].some(t=>ms>t&&ms<t+450); if(eat) return stand(sB,bx,by,F(sp,'eat')); if(ms>P.rumble&&ms<P.fire) return stand(sB,bx+Math.sin(c.t*26)*2,by,F(sp,'hip')); if(ms>P.fire&&ms<P.fire+900) return stand(sB,bx-6,by,F(sp,'fire'),-.1); if(ms>P.r1+450&&ms<P.rumble) return stand(sB,bx,by,F(sp,'hold')); return stand(sB,bx,by,ms>P.apply?F(sp,'flex'):sp.idle); }
    const k=ez(seg(ms,P.end-700,P.end)); return stand(sB,lerp(bx,c.origX,k),lerp(by,c.origBase,k),k<1?runFr(sp,c.t,1):sp.idle); });
  scene('tu_draw',P.end/1000,{back:true,draw:(s2,u,ms)=>{ const g=ez(seg(ms,P.run,P.run+300)); if(g<=0) return;
    RO(cx-30*g,by-34,60*g,6,'#2b6a3a'); R(cx-24,by-28,4,28,'#8a857c'); R(cx+20,by-28,4,28,'#8a857c'); if(g>.9) { EO(cx,by-36,16,6,'#f4f0e6'); for(let k=0;k<4;k++) pepperDraw(cx-10+k*7,by-40,k%2?'#e03a2e':'#ff7a30'); }
    // the Scoville meter
    const lvl=ms<P.r1?0:(ms<P.r2?.3:(ms<P.r3?.6:(ms<P.fire?.9:1))),mx=cx,my=Math.max(44,by-TH-60); RO(mx-40,my-10,80,20,'#1c2230'); label('SCOVILLE',mx,my-6,'#9db1cc',1); R(mx-36,my+2,72,5,'#333'); R(mx-36,my+2,72*ez(lvl),5,lvl>.8?RED:'#ff9a30'); }});
  scene('tu_draw',P.end/1000,{draw:(s2,u,ms)=>{ if(ms<P.run) return; const t=s2.t;
    // Tom turns pink, sweats, fans himself, drinks milk
    const heat=ms<P.r1?0:cl((ms-P.r1)/2500); if(heat>0&&ms<P.fire) { gfx.globalAlpha=heat*.45; E(sT.x,sT.b-TH*.78,12,14,'#ff4a4a'); gfx.globalAlpha=1; for(let k=0;k<Math.floor(heat*4);k++) { const q=(t*2+k/4)%1; E(sT.x-14+k*9,sT.b-TH*.9+q*30,2.5,4,'#9fd8ff'); } }
    if(ms>P.fan&&ms<P.milk) { gfx.save(); gfx.translate(sT.x-22,sT.b-TH*.6); gfx.rotate(Math.sin(t*24)*.6); PO([[0,0],[-10,-26],[12,-26]],'#f6e6a0'); gfx.restore(); }
    if(ms>P.milk&&ms<P.r3) { const x=sT.x-22,y=sT.b-TH*.62; RO(x-6,y-10,12,20,'#fff'); R(x-6,y-4,12,6,'#4f86d8'); label('MILK',x,y-2,'#fff',1); if(Math.floor(ms/180)%2) bigWord('GLUG',x,y-30,CREAM,2); }
    if(ms>P.r1+450&&ms<P.rumble) { const x=sB.x-26,y=sB.b-BH*.55; RO(x-14,y-18,28,36,'#f4f0e6'); for(let k=0;k<5;k++) R(x-11,y-13+k*6,22,2,'#9aa3a8'); label('NEWS',x,y-16,OUT,1); }
    if(ms>P.rumble&&ms<P.fire) { bigWord('GRRRRMBL',sB.x,sB.b-BH*.4,CREAM,2); ring(sB.x,sB.b-BH*.45,14+(t*8%1)*18,8+(t*8%1)*10,2,CREAM); }
    if(ms>P.fire&&ms<P.fire+900) { const q=seg(ms,P.fire,P.fire+900),L=lerp(0,cx-GR.x0,ez(q/.4)); for(const [x,y] of [[sT.x-14,sT.b-TH*.7],[sB.x-14,sB.b-BH*.7]]) { gfx.globalAlpha=.9; PO([[x,y-6],[x,y+6],[x-L,y+22+Math.sin(t*20)*4],[x-L,y-22+Math.sin(t*20)*4]],'#ff8a20',0); PO([[x,y-3],[x,y+3],[x-L*.9,y+10],[x-L*.9,y-10]],'#ffe060',0); gfx.globalAlpha=1; } } }});
  const steps=[
    [0,()=>{ setMessage("DIRECTOR'S CUT! A card table. A plate of peppers. No talking."); S('whoosh'); }],
    [P.r1,()=>{ S('crunch'); say('boppy','dc3'); word('ROUND 1',cx,Math.max(40,by-TH-90),GOLD,3,.7); setMessage('Round one. Tom turns pink. Boppy turns the page.'); }],
    [P.r2,()=>{ S('crunch'); word('ROUND 2',cx,Math.max(40,by-TH-90),GOLD,3,.7); setMessage('Round two. Tom is sweating. Tom is fanning.'); }],
    [P.milk,()=>{ S('splash'); say('tom','dcboppy3'); setMessage('Tom grabs the milk. The whole carton.'); }],
    [P.r3,()=>{ S('crunch'); word('ROUND 3',cx,Math.max(40,by-TH-90),RED,3,.7); setMessage('Round three. The red ones. Boppy folds the paper.'); }],
    [P.rumble,()=>{ S('rumble'); setMessage('Boppy\'s stomach rumbles. He is not calm. He was never calm.'); }],
    ['hf',P.fire+300],
    [P.fire,()=>{ S('flame'); S('whoosh'); scene('tu_flash',.25,{a:.4,c:'#ff8a20'}); word('FIRE BREATH!',cx,Math.max(40,by-TH-110),'#ff8a20',5,1); setMessage('They both breathe fire. Straight down the row.'); }],
    ...row.map((f,k)=>[P.fire+300+k*120,()=>{ const Q2=ST.foe(f); S('bonk'); S('sizzle'); ST.jolt(f,.55); battle.shakeEnemy=.4; scene('tu_burst',.6,{x:Q2.x,y:Q2.mid,n:8,r:40}); landHit(share[k]); }]),
    [P.apply,()=>{ E2.apply(); S('heal'); word('HEARTBURN +1',bx,Math.max(40,by-BH-50),'#ff8a60',2,1); setMessage('A draw. Boppy says the red ones were mild.'); }],
    [P.end,'end',()=>(E2.result||'')+' Nobody can feel their face. Boppy wants a rematch.']];
  ST.play(E2,steps); };
})();
