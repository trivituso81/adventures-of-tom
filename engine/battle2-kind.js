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
const b2TomboOpen=T=>B2.tombos==='all'||(typeof STORY!=='undefined'&&!!STORY.flags[T.flag]);
// What the current actor could pick: unlocked Tombos whose partner is in this fight.
function b2TomboRows(u) {
  const tom=b2Tom(),rows=[];
  for(const T of B2_TOMBOS) {
    if(!b2TomboOpen(T)) continue;
    const pt=B2.party.find(p=>p.id===T.partner); if(!pt||!tom) continue;
    let why='';
    if(u!==tom&&u!==pt) why='Only Tom or '+pt.name+' can start it.';
    else if(!b2Alive(tom)) why='Tom is knocked out.';
    else if(!b2Alive(pt)) why=pt.name+' is knocked out.';
    else if(tom.st.shushed||pt.st.shushed) why='Shushed. No Tombos for now.';
    else if(B2.heart<T.cost) why='Needs '+T.cost+'% HEART. The meter is at '+Math.floor(B2.heart)+'%.';
    rows.push({T,pt,why});
  }
  return rows;
}
const b2TomboReady=u=>b2TomboRows(u).some(r=>!r.why);
function b2RunTombo(u,act,opt) {
  const tom=b2Tom(),pt=B2.party.find(p=>p.id===act.partner);
  b2Heart(-act.cost); b2AddMile(1); b2Render();   // every Tombo earns Tom an Upgrade Mile
  // The pair hits with their average strength.
  const combo={side:'party',id:'tombo',name:'Tom and '+pt.name,st:{},kit:{},idx:tom.idx,lvl:tom.lvl};
  for(const k of B2_STAT_KEYS) combo[k]=(b2Eff(tom,k)+b2Eff(pt,k))/2;
  battle.actor=tom.idx;
  const M=b2BeginMove(combo,act,opt||{targets:[]});
  M.tom=tom; M.pt=pt; M.miles=1;   // its Upgrade Mile counts toward the one-per-action cap
  const E={tom,pt,fxT:battle.fx[tom.idx],fxP:battle.fx[pt.idx],M,act,targets:M.targets,result:M.result,apply:()=>b2ApplyFx()};
  b2Fx({kind:'banner',name:act.name,t:0,dur:1.8});
  sfx.levelUp();
  const fn=B2_TOMBO_ANIM[act.id];
  try { if(fn) fn(E); else b2TomboPlain(E); }
  catch(err) { console.error('tombo '+act.id,err); clearBattleQueue(); b2TomboPlain(E); }
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

// Tom + Grace, tier 1: Dumpling Unboxed. Tom unboxes a package; the gold dumpling squishy flies out to Grace, she
// squeezes it and dances. The party heals, debuffs clear, and every enemy gets a little warmer.
B2_TOMBO_ANIM.grace1=E=>{ const {tom,pt,fxT,fxP}=E;
  enqueue(()=>{ setMessage('TOMBO! Tom unboxes something very special for Grace.'); say('tom','tombograce'); scene('box',4.2,{}); sfx.slideWhistle(); fxT.punch=.5; },
    600,()=>{ sfx.thud(); },
    700,()=>{ fxT.punch=1; sfx.whoosh(); fxP.hop=.5; },
    900,()=>{ sfx.ding(); const g=home(pt); toss('squishy',320,150,g.x-6,g.base-g.h*.62,0,.6,80); say('grace','tombo',.2); },
    700,()=>{ fxP.twirl=1.5; sfx.dance(); scene('confetti',1.6,{x0:280,x1:560,n:30}); bt('SQUEEZE',96,24,'#ffe08a',3,1.1); },
    700,()=>{ E.apply(); for(const p of b2LiveParty()) glowOn(p,'#ffe08a'); heartsToFoes(pt); sfx.heal(); },
    1000,'The party is healed and fresh. The monsters can’t help smiling a little.',()=>checkEnemy());
};

// Tom + Rose, tier 1: Double-Decker Boop. Rose climbs onto Tom's shoulders, Tom charges, Rose leaps onto the
// enemy's head, bounces twice and boops it on the nose. It sees stars.
B2_TOMBO_ANIM.rose1=E=>{ const {tom,pt,fxT,fxP}=E,D=4.6;
  const shoulder=()=>{ const a=battle.actorPos||{cx:home(tom).x,base:home(tom).base,h:home(tom).h}; return b2WarpPt(a.cx+2,a.base-a.h+20); };
  const head=()=>b2WarpPt(battle.enemyX||GX,(battle.enemyTop||177)+16);
  const hits=[30,30,40];
  enqueue(()=>{ setMessage('TOMBO! Rose climbs up. Tom is now a double-decker.'); say('rose','tombo',.1); sfx.jumpWhistle();
      const tsp=BATTLE_SPRITES.tom,run=tsp.run||null;
      path(fxT,D,(q,c)=>{ const rf=run?run[Math.floor(c.t*12)%run.length]:c.sp.idle;
        if(q<.17) return {frame:c.sp.idle};
        if(q<.42) { const k=ez((q-.17)/.25); return {cx:lerp(c.origX,262,k),base:c.origBase-Math.round(Math.abs(Math.sin(c.t*14))*5),frame:rf}; }
        if(q<.82) return {cx:262,frame:q<.5?c.sp.act:c.sp.idle};
        const k=ez((q-.82)/.18); return {cx:lerp(262,c.origX,k),frame:rf}; });
      path(fxP,D,(q,c)=>{
        const sh=shoulder();
        if(q<.15) { const k=ez(q/.15); return {cx:lerp(c.origX,sh[0],k),base:lerp(c.origBase,sh[1],k)-Math.sin(k*Math.PI)*80,frame:c.sp.celeb,noShadow:true}; }
        if(q<.46) return {cx:sh[0],base:sh[1]-Math.round(Math.abs(Math.sin(c.t*14))*3),frame:Math.floor(c.t*6)%2?c.sp.celeb:c.sp.idle,noShadow:true};
        const hd=head();
        if(q<.56) { const k=ez((q-.46)/.1); return {cx:lerp(sh[0],hd[0],k),base:lerp(sh[1],hd[1],k)-Math.sin(k*Math.PI)*130,frame:c.sp.celeb,noShadow:true,rot:-k*.3}; }
        if(q<.8) { const b=Math.abs(Math.sin((q-.56)/.24*Math.PI*2)); return {cx:hd[0],base:hd[1]-Math.round(b*28),frame:b>.4?c.sp.celeb:c.sp.idle,noShadow:true}; }
        const k=ez((q-.8)/.2); return {cx:lerp(hd[0],c.origX,k),base:lerp(hd[1],c.origBase,k)-Math.sin(k*Math.PI)*120,frame:c.sp.celeb,noShadow:k<.9,rot:k*.25}; }); },
    700,()=>{ say('tom','tombodecker'); bt('GIDDYUP',96,48,'#ffe08a',3,1); sfx.boing(); },
    500,()=>{ sfx.run(); scene('dust',.7,{x:300,y:270,n:6,sp:18,up:12}); },
    900,()=>{ sfx.jumpWhistle(); },
    480,()=>{ sfx.bonk(); battle.shakeEnemy=.4; bt('BOP',60,38,'#ffb3cf',3,.8); landHit(hits[0]); },
    560,()=>{ sfx.bonk(); battle.shakeEnemy=.4; battle.enemyWobble=.4; bt('BOP',70,34,'#ffb3cf',3,.8); landHit(hits[1]); },
    360,()=>{ fxP.poke=.7; battle.boop={t:0,dur:1.1}; sfx.boop?sfx.boop():sfx.bonk(); },
    200,()=>{ battle.shakeEnemy=.6; battle.flashEnemy=.3; landHit(hits[2]); E.apply(); sfx.stun(); },
    1100,E.result+' It sees stars.',()=>checkEnemy());
};

// Tom + Deedee, tier 1: Sourdough & Rhubarb. Tom's Dutch oven bakes a loaf in the middle of the field, then Deedee
// hands out rhubarb crisp and a group hug. Big party heal; Amber melts.
B2_TOMBO_ANIM.deedee1=E=>{ const {tom,pt,fxT,fxP}=E;
  enqueue(()=>{ setMessage('TOMBO! Tom preheats the Dutch oven. Deedee brings the rhubarb.'); say('tom','tombodeedee');
      // The pot is drawn for the Grump's spot; shift it out to the middle of the field.
      const xp=home(tom).x; B2.aim={dx:118,dy:24,xp,L:Math.max(120,xp-B2_REF.x),targets:[]};
      scene('dutch',3.4,{}); sfx.charge(); fxT.punch=.6; },
    880,()=>{ sfx.thud(); scene('dust',.7,{x:GX,y:262,n:8,sp:22,up:20}); },
    1300,()=>{ sfx.ding(); bt('FRESH LOAF',96,30,'#f3c37a',3,1.1); say('deedee','tombo'); },
    1000,()=>{ B2.aim=null; fxP.hug=2.6; scene('dcrescent',3.2,{back:true}); const h=home(pt);
      b2LiveParty().forEach((p,k)=>{ if(p===pt) return; const t=home(p); toss('dcrisp',h.x-10,h.base-80,t.x,t.base-70,k*.1,.55,50,{spin:false}); }); sfx.whoosh(); },
    800,()=>{ E.apply(); for(const p of b2LiveParty()) glowOn(p,'#ff9ac0'); sfx.fountain?sfx.fountain():sfx.heal(); bt('TO THE MOON AND BACK',96,22,'#ffe08a',2,1.4); },
    1100,'Warm bread, warm crisp, warm hugs. Everyone feels much better.',()=>checkEnemy());
};

// A golden sourdough boule (Boule Fetch) and a longboard under whoever is riding it (Glaze & Bake).
PROP2.boule=(q,u)=>{ ellipse(0,0,17,12,OUT); ellipse(0,0,15,10,'#c98a4b'); ellipse(-3,-3,10,5,'#e3b47a');
  rect(-9,-4,18,2,'#f1d9a8'); rect(-6,-1,12,1,'#8a5a30'); rect(-2,-8,4,2,'#f6e2b0'); };
RFX.SC.gbBoard=(s,u)=>{ const a=battle.drawnAt&&battle.drawnAt[s.i]; if(!a) return; gfx.globalAlpha=u>.95?(1-u)/.05:1;
  rect(a.cx-34,a.base-2,68,8,OUT); rect(a.cx-32,a.base,64,4,'#c48a4a'); rect(a.cx-32,a.base,64,1,'#2b2a26');
  ellipse(a.cx-30,a.base+6,4,4,OUT); ellipse(a.cx+30,a.base+6,4,4,OUT); ellipse(a.cx-30,a.base+6,2.4,2.4,'#7fd0a0'); ellipse(a.cx+30,a.base+6,2.4,2.4,'#7fd0a0'); };

// Tom + TNB, tier 1: Glaze & Bake. Tom preheats the Dutch oven on the enemy line; TNB carves in on his longboard,
// rolls out the kiln and fires the whole formation. Big Cozy hit on every enemy; the party glows (WARMTH and COOL up).
B2_TOMBO_ANIM.tnb1=E=>{ const {tom,pt,fxT,fxP}=E,D=3.2;
  enqueue(()=>{ setMessage('TOMBO! Tom preheats the Dutch oven. TNB grabs his longboard.'); say('tom','tombotnb'); scene('dutch',3.0,{}); sfx.charge(); fxT.punch=.6; },
    900,()=>{ sfx.thud(); scene('dust',.7,{x:GX,y:262,n:8,sp:22,up:20}); bt('PREHEAT',96,30,'#ffb070',3,1); },
    700,()=>{ scene('gbBoard',D,{i:pt.idx}); sfx.whoosh();
      const ri=BATTLE_SPRITES[pt.id]&&BATTLE_SPRITES[pt.id].run;
      path(fxP,D,(q,c)=>{ const rf=ri?ri[Math.floor(c.t*10)%ri.length]:c.sp.idle;
        if(q<.35) { const k=ez(q/.35),w=Math.sin(k*Math.PI*3); return {cx:lerp(c.origX,300,k),base:c.origBase-10+w*10,rot:w*.1,frame:rf,noShadow:true}; }
        if(q<.75) return {cx:300,base:c.origBase-10,frame:q<.5?c.sp.act||c.sp.idle:c.sp.idle,noShadow:true};
        const k=ez((q-.75)/.25); return {cx:lerp(300,c.origX,k),base:c.origBase-10*(1-k),frame:rf,noShadow:k<.9}; }); },
    1100,()=>{ say('tnb','tombo'); scene('kiln',2.2,{}); sfx.slideWhistle(); },
    900,()=>{ sfx.fireball(); scene('flames',1.4,{x:GX,y:262,w:120,h:130,cs:['#ff8c3a','#ffd166','#fff6c8','#ffffff']}); scene('flash',.45,{c:'#fff2c8',a:.5}); },
    600,()=>{ battle.flashEnemy=.5; battle.shakeEnemy=.7; landHit(100); scene('shards',1.0,{x:GX,y:222,n:14,cs:['#b4573d','#d98f3f','#f4efe0']}); bt('GLAZED',96,34,'#ffb070',3,1); },
    700,()=>{ E.apply(); for(const p of b2LiveParty()) glowOn(p,'#ffb070'); sfx.heal(); },
    1000,(E.result||'')+' Fresh out of the kiln. The whole party is glowing.',()=>checkEnemy());
};

// Tom + Nara, tier 1: Boule Fetch. Tom throws a golden sourdough boule over the enemy; Nara chases it straight through,
// snatches whatever the monster was holding, and comes back with the bread. Always a critical hit.
B2_TOMBO_ANIM.nara1=E=>{ const {tom,pt,fxT,fxP}=E,D=3.4;
  enqueue(()=>{ setMessage('TOMBO! Tom holds up a golden sourdough boule. Nara sits. Perfectly.'); say('tom','tombofetch'); fxT.punch=.5;
      const sp=BATTLE_SPRITES.nara;
      path(fxP,D,(q,c)=>{ const run=sp.run||[c.sp.idle],back=sp.runFlip||run,rf=run[Math.floor(c.t*12)%run.length],bf=back[Math.floor(c.t*12)%back.length];
        if(q<.3) return {frame:c.sp.sit||c.sp.idle};
        if(q<.55) { const k=ez((q-.3)/.25); return {cx:lerp(c.origX,200,k),base:c.origBase-Math.round(Math.abs(Math.sin(c.t*16))*6),frame:rf}; }
        if(q<.66) { const k=(q-.55)/.11; return {cx:lerp(200,170,k),base:c.origBase-Math.sin(k*Math.PI)*60,frame:c.sp.celeb,noShadow:true}; }
        const k=ez((q-.66)/.34); return {cx:lerp(170,c.origX,k),base:c.origBase-Math.round(Math.abs(Math.sin(c.t*16))*5),frame:bf}; }); },
    800,()=>{ const h=battle.drawnAt&&battle.drawnAt[tom.idx]||{cx:420,base:270,h:100}; toss('boule',h.cx-10,h.base-h.h*.7,GX-30,190,0,.8,120); sfx.whoosh(); bt('FETCH!',96,30,'#ffe08a',3,1); },
    300,()=>{ say('nara','tombo'); sfx.bark&&sfx.bark(); sfx.bark&&sfx.bark(.14); sfx.run(); },
    600,()=>{ battle.slash=.22; sfx.thud(); battle.enemyKnock=.5; battle.shakeEnemy=.5; scene('paws',1.2,{n:4}); scene('burst',.45,{x:GX,y:214,c:'#f3c37a'}); landHit(100); },
    700,()=>{ E.apply(); glowOn(pt,'#9be39a'); sfx.squeak&&sfx.squeak(); },
    1000,(E.result||'')+' Nara brings back the bread. And something of theirs.',()=>checkEnemy());
};

// Tom + Boppy, tier 1: Quiet on the Pier (chapter 3). Tom holds the tackle box and shushes the whole formation; Boppy
// casts over all of them, reels the back row in with one big splash, then grumbles until they feel bad about it.
B2_TOMBO_ANIM.boppy1=E=>{ const {tom,pt,fxT,fxP}=E;
  enqueue(()=>{ setMessage('TOMBO! Tom holds the tackle box. Boppy gets his fishing face on.'); say('tom','tombopier'); fxT.punch=.5;
      bt('SHHH...',96,30,'#cfe8dc',3,1.4); scene('ring',1,{x:GX,y:264,r:100,c:'#cfe8dc'}); scene('ring',1,{x:GX,y:264,r:70,c:'#cfe8dc',delay:.3}); sfx.whoosh(); },
    900,()=>{ RFX.hold(pt.idx,'rod',2.8,{ang:.9,angTo:2.1,len:124}); fxP.poseK='wind'; fxP.pose=.7; say('boppy','tombo',.1); },
    650,()=>{ const h=battle.held; if(h) h.angTo=.25; fxP.poseK='throw'; fxP.pose=.6; sfx.whoosh(); scene('castline',1.6,{ex:GX+6,ey:206}); },
    650,()=>{ const h=battle.held; if(h) { h.angTo=1.7; h.bend=.8; } fxP.poseK='wind'; fxP.pose=.8; sfx.thud(); battle.shakeEnemy=.6;
      scene('splashw',.9,{x:GX,y:226,n:14,sp:110}); bt('REEL IN',96,36,'#9fe8ff',3,1); landHit(100); },
    700,()=>{ fxP.grumble=1.6; if(sfx.sulk) sfx.sulk(); bt('...',52,34,'#fff1cb',3,1); E.apply(); },
    1000,(E.result||'')+' Everybody on the pier is very, very quiet now.',()=>checkEnemy());
};
// Tom + Amy, tier 1: On Your Marks (chapter 5). Tom holds up his stopwatch and counts her in; Amy runs straight
// through every enemy and breaks the tape. A hit on all of them, and the whole party picks up the pace.
B2_TOMBO_ANIM.amy1=E=>{ const {tom,pt,fxT,fxP}=E,n=Math.max(1,b2LiveFoes().length);
  enqueue(()=>{ setMessage('TOMBO! Tom holds up his stopwatch. Amy is already in the blocks.'); say('tom','tomboamy'); fxT.punch=.5; scene('stopwatch',3.4,{x:GX,y:58}); sfx.charge(); },
    700,()=>{ bt('ON YOUR MARKS',96,26,'#fff1cb',2,.7); sfx.ding(); },
    700,()=>{ bt('GET SET',96,26,'#ffe08a',3,.7); sfx.ding(); },
    700,()=>{ bt('GO!',96,26,'#9be39a',4,.8); sfx.jumpWhistle&&sfx.jumpWhistle(); say('amy','tombo',.1);
      fxP.run=1.8; fxP.runDur=1.8; fxP.runPasses=Math.min(3,n); sfx.run(); scene('finishline',2.2,{snap:.6}); },
    ...Array.from({length:Math.min(3,n)},(_,k)=>[k===0?420:520,()=>{ battle.slash=.2; sfx.slash(); battle.shakeEnemy=.4; scene('dust',.5,{x:GX,y:262,n:5}); landHit(Math.round(100/Math.min(3,n))); }]).flat(),
    600,()=>{ sfx.fanfare(); scene('confetti',1.5,{x0:80,x1:290,n:36}); E.apply(); for(const p of b2LiveParty()) glowOn(p,'#9be39a'); bt('NEW RECORD',96,36,'#ffe08a',3,1.1); },
    1000,(E.result||'')+' Tom stops the clock. A new family record. The whole party feels faster.',()=>checkEnemy());
};
})();
