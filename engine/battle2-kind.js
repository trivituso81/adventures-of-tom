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

// deedee1 (Wine and Gossip) and tnb1 (Popcorn Jump) are in the Task T section below.

// nara1 (Sit. Paw. Treat.) and boppy1 (You Hold the Net) are in the Task T section below.

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

// ================= Task T: tier-1 Primary Tombos (tombo-review.md, approved 24 Oct 2026) =================
// Hi Guys, Welcome Back! (grace1) and Double-Decker Airplane (rose1). Keys, HEART cost, multiplier and effects are
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

// ---------- Hi Guys, Welcome Back! (Tom + Grace, tier 1) ----------
// Grace films a pretend video on Tom's phone. Tom is the camera guy and his thumb keeps covering the lens. She squishes
// the gold dumpling for the camera; it slowly rises, keeps rising, grows, and lands on the monsters giant-sized.
// Effects unchanged: party heals 35% and loses its debuffs; every monster warms up.
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
  const T=ST.unit(tom),G=ST.unit(pt),list=b2LiveFoes(),GR=ST.group(list),dumpling=RFX.gDumpling;
  const gx=Math.max(GR.x1+60,T.x-118),gb=Math.min(316,T.base+16);
  const P={th0:900,th1:2250,pk0:2700,pk1:3150,off:5250,sq1:3000,sq2:3350,rise:3650,top:4650,land:4950,back:5300,end:6000};
  const D=P.end,sky={x:(GR.x0+GR.x1)/2,y:Math.max(70,GR.top-60)},land={x:(GR.x0+GR.x1)/2,y:GR.base-22};
  const st={gx:G.x,gb:G.base,gdir:-1};
  // Grace: runs to her mark, turns to the camera (right), hops on HI GUYS, squishes, then runs home.
  pathOf(fxP,D,(ms,c)=>{ const sp=c.sp; let x,y,f=sp.flip,dir=1;
    if(ms<650) { const k=ez(ms/650); x=lerp(c.origX,gx,k); y=lerp(c.origBase,gb,k); f=runFr(sp,c.t,-1); dir=-1; }
    else if(ms<P.back) { x=gx; y=gb; const hop=ms>700&&ms<1100?Math.sin(seg(ms,700,1100)*Math.PI)*16:0; y-=hop;
      f=(ms>700&&ms<1200)||(ms>P.land&&ms<P.back)?(sp.celebFlip||sp.flip):(ms>P.sq1-150&&ms<P.rise?(sp.act?mirrorRowsCached(sp,'act'):sp.flip):sp.flip); }
    else { const k=ez(seg(ms,P.back,P.back+600)); x=lerp(gx,c.origX,k); y=lerp(gb,c.origBase,k); f=k<1?runFr(sp,c.t,1):sp.idle; }
    st.gx=x; st.gb=y; st.gdir=dir; return {cx:x,base:y,frame:f}; });
  // Tom: the camera guy. Stays put, phone up, tiny shuffle when his thumb is called out.
  pathOf(fxT,D,(ms,c)=>{ const sp=c.sp,sh=ms>P.th1&&ms<P.th1+300?Math.sin(seg(ms,P.th1,P.th1+300)*Math.PI*2)*3:0;
    return {cx:c.origX+sh,base:c.origBase,frame:ms>P.land&&ms<P.land+700?sp.celeb:sp.idle}; });
  const hand=()=>({x:st.gx+14,y:st.gb-44});
  // The held dumpling, the squishes, then the slow rise and the giant landing.
  scene('tb_draw',D/1000,{back:false,draw:(s,u,ms)=>{
    const tp={x:T.x-30,y:T.base-80}; if(ms<P.back+200) phone(tp.x,tp.y,0);
    if(ms<P.sq1-300||ms>P.end-200) return;
    const h=hand(),sq=Math.max(Math.pow(Math.sin(seg(ms,P.sq1,P.sq1+260)*Math.PI),1.5),Math.pow(Math.sin(seg(ms,P.sq2,P.sq2+260)*Math.PI),1.5));
    if(ms<P.rise) { dumpling(h.x,h.y-6,sq,.55); return; }
    if(ms<P.top) { const k=seg(ms,P.rise,P.top),e=k*k*(3-2*k),x=lerp(h.x,sky.x,ez(k*1.2)),y=lerp(h.y-6,sky.y,e)+Math.sin(k*9)*4;
      gfx.globalAlpha=1; for(let j=0;j<4;j++) { const q=(ms/700+j/4)%1; gfx.globalAlpha=1-q; star(x+Math.sin(j*2.3)*30*k,y+20+q*40,3+k*3,j%2?'#aef0ff':'#fffbe6'); } gfx.globalAlpha=1;
      dumpling(x,y,0,lerp(.55,2.9,e)); return; }
    if(ms<P.land) { const k=seg(ms,P.top,P.land),e=k*k; dumpling(sky.x,lerp(sky.y,land.y-50,e),-.15*k,2.9); return; }
    const k=seg(ms,P.land,P.end-200),sq2=k<.15?lerp(.9,.7,k/.15):lerp(.7,0,ez((k-.15)/.85));
    gfx.globalAlpha=k>.8?(1-k)/.2:1; dumpling(land.x,land.y-50+sq2*28,sq2,3.1); gfx.globalAlpha=1; }});
  ST.play(E2,[
    [0,()=>{ setMessage('TOMBO! Grace is filming a video. Tom is the camera guy.'); B2.aim=null; S('click'); }],
    [300,()=>{ scene('tb_rec',P.off/1000+.3,{plan:P}); S('beep'); }],
    [700,()=>{ word('HI GUYS!',gx-10,gb-110,PINK,4,1.2); S('cheer'); }],
    [950,()=>{ say('grace','tombo'); S('bump'); }],
    [1500,'Tom’s thumb is in the shot. Again.'],
    [2250,()=>{ say('tom','tombograce'); }],
    [2300,'Tom says the thumb is a creative choice.'],
    [2900,()=>{ setMessage('Grace holds up the gold dumpling for the camera. Squish. SQUISH.'); }],
    [P.sq1,()=>{ S('squeak'); word('SQUISH',gx+20,gb-96,GOLD,3,.6); }],
    [P.sq2,()=>{ S('squeak'); word('SQUISH',gx+30,gb-104,GOLD,3,.6); }],
    [P.rise,()=>{ setMessage('The dumpling floats up. And up. And keeps going.'); S('slideWhistle'); }],
    [P.top-200,()=>{ S('whoosh'); }],
    [P.land,()=>{ S('splat'); S('thud'); battle.shakeEnemy=.6; for(const f of list) ST.jolt(f,.5); word('SQUISH!!',land.x,land.y-128,GOLD,6,1.3);
      scene('tb_rings',.8,{x:land.x,y:land.y,r:110,c:GOLD,w:4}); scene('confetti',1.6,{x0:GR.x0,x1:576,n:34});
      E2.apply(); for(const p of b2LiveParty()) glowOn(p); S('heal');
      list.forEach((f,k)=>{ const q=ST.foe(f); for(let j=0;j<2;j++) battle.props.push({kind:'dheart',x0:q.x,y0:q.mid,x1:q.x+(j?18:-18),y1:q.top-30,arc:20,spin:false,r:8,t:-(k*.1+j*.15),dur:.7}); }); }],
    ['hf',P.land],
    [P.land+300,()=>{ S('fanfare'); }],
    [P.end,'end','The party is healed and fresh. The monsters got squished, and they kind of loved it.']]);
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
    [P.tline,()=>{ say('tom','tombotnb'); setMessage('Tom says he was not scared. The popcorn was.'); }],
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
    [P.sit,()=>{ word('SIT.',T.x+60,T.top-20,CREAM,4,.9); S('bump'); setMessage('Sit. Nara sits. She is wiggling all over.'); }],
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
    [P.line,()=>{ say('boppy','tombo'); setMessage('Boppy wants the net held STILL. It is not still.'); }],
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
})();
