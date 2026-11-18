'use strict';
// engine/b3-play.js — Battle 3 play layer: turns beats into what the player sees (architecture section 2.7).
// The rules (engine/b3-core.js and the other rules files) have already worked out the whole result of an action when this
// file gets its beats. Nothing here changes the fight. It moves bodies, shows numbers, and keeps a VIEW of the fight
// (HP, Pep, statuses, the turn bar) that follows the beats as they are revealed, so nothing shows early.
//
// Drawing: Battle 3 has its own draw function (b3Draw) for the party and the enemies. It reuses the shared stage: the battle
// canvas and its 576 x 324 coordinates, the painted backdrops (BG_IMG), drawSprite and the painted sheets, the party's battle
// frames (BATTLE_SPRITES), the monsters' art (MONSTERS), the painted meter (b2Meter) and the pixel font (label).
// engine/battle.js calls b3Update and engine/battle-draw.js calls b3Draw while battle.v3 is set.
//
// Reactions (a ward's answer) play after the move that set them off, one at a time; what a turn's end writes comes last.
//
// Three animation kinds per move (anim.kind in the move's data row): 'default' is built here from the move's shape with
// frames every character already has. 'script' (a hand-made ST.play timeline) and 'clip' (a video clip) arrive in stage 8.
// Every kind ends by calling reveal(), which shows the next hit's beats.

const B3={active:false,F:null,cfg:null,view:null,ui:'busy',sel:0,opts:[],pending:null,actor:null,result:null,artWait:false,log:[]};
const B3P={t:0,q:[],body:{},foe:{},fa:{},pops:[],words:[],fx:[],flash:null,cheer:false};
// How an enemy stands that is not in its art: flyers hover this many pixels off the ground.
const B3_FOE_LOOK={skeeter:{hover:14}};
// How long the default move animations take, as a multiple of the first build's pace. Tom, 2026-11-18: they were about 2x too fast.
// One number: 1 is the old quick pace, 2 is twice as long. The battle speed button (1x / 2x) still halves it for the player.
const B3_TEMPO=2;
// Body states (architecture 2.7): which painted frame shows each state. Stage 8 finishes this table and lets a cell be a clip.
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
function b3PlayReset() { Object.assign(B3P,{t:0,q:[],body:{},foe:{},fa:{},pops:[],words:[],fx:[],flash:null,cheer:false}); }

// ---------- The view: what the screen shows right now ----------
function b3ViewSync() {
  const F=B3.F,V=B3.view||(B3.view={u:{},bar:[],charge:{},haz:[]});
  for(const u of F.units) V.u[u.key]=Object.assign(V.u[u.key]||{},{hp:u.hp,maxHp:u.maxHp,pep:u.pep,st:Object.keys(u.st),ko:u.ko,sh:b3ShieldTotal(u)});
  V.haz=F.hazards.map(h=>({id:h.id,side:h.side,uses:h.uses}));
  for(const f of F.foes) { if(f.charge) V.charge[f.key]=f.charge.name; else delete V.charge[f.key]; }
}
// The 3 icons for a unit in the view (spec 2.8): its Prime, its strongest debuff, its strongest buff.
function b3ViewIcons(key) {
  const ids=(B3.view.u[key]||{}).st||[],pick=kinds=>ids.filter(id=>B3_STATUS[id]&&kinds.includes(B3_STATUS[id].kind)).sort((a,b)=>B3_STATUS[b].weight-B3_STATUS[a].weight)[0];
  return [pick(['prime']),pick(['debuff','mark']),pick(['buff','stance'])].filter(Boolean);
}

// ---------- Where everyone stands (576 x 324) ----------
function b3PartyHome(u) { const T=[null,BATTLE_POS1,BATTLE_POS2,BATTLE_POS3][B3.F.party.length]||BATTLE_POS4,p=T[u.slot]; return {cx:p.x*3,base:p.base*3}; }
// Enemy slots: the front row stands around the old centre spot, the back row behind it further left. Slots stay put when someone falls.
function b3LayoutFoes() {
  const F=B3.F,fr=F.foes.filter(f=>f.row!=='back'),bk=F.foes.filter(f=>f.row==='back'),n=F.foes.length,want=[0,96,80,68,60][n]||60;
  const fy={1:[264],2:[224,302],3:[218,262,306]},fx={1:[168],2:[184,156],3:[188,158,188]},by={1:[236],2:[214,268]},bx={1:[84],2:[92,70]};
  const place=(f,px,py,k)=>{ const def=b2BattleDef(MONSTERS[f.id]),base=def.scale||3,w=def.sprite[0].length;
    B3P.foe[f.key]={def,px,py,sc:Math.max(base*.7,Math.min(base*1.3,want/w))*k*(def.shrink||1)}; B3P.fa[f.key]={lunge:null,hurtUntil:0,shakeUntil:0,flashUntil:0,die:null,hold:0}; };
  fr.forEach((f,k)=>place(f,(fx[fr.length]||fx[3])[k%3],(fy[fr.length]||fy[3])[k%3],1));
  bk.forEach((f,k)=>place(f,(bx[bk.length]||bx[2])[k%2],(by[bk.length]||by[2])[k%2],.9));
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
function b3Say(text) { const el=$('b3-msg'); if(el) el.textContent=text; B3.log.push(text); if(B3.log.length>60) B3.log.shift(); }
const b3Name=key=>b3Unit(B3.F,key).name;

// ---------- Showing one beat ----------
function b3Show(b) {
  const V=B3.view,vu=b.tgt?V.u[b.tgt]:null,now=B3P.t;
  if(b.t==='round') { b3Word('ROUND '+b.n,'#fff1cb'); }
  else if(b.t==='turn') { V.bar=b.bar; B3.turnOf=b.who; b3RenderBar(); }
  else if(b.t==='hit') {
    vu.hp=b.hp;
    const fl=B3_FLAVORS[b.flavor]||B3_FLAVORS.clobber;
    b3Pop(b.tgt,String(b.dmg)+(b.crit?'!':''),fl.color,{sc:b.crit?4:3});
    if(b.peeve) b3Pop(b.tgt,'PET PEEVE','#ffe27a',{sc:2}); else if(b.resist) b3Pop(b.tgt,'RESIST','#aeb6c6',{sc:2});
    if(b.tick) b3Pop(b.tgt,B3_STATUS[b.tick].short,B3_STATUS[b.tick].color,{sc:2});
    if(b.soak) { vu.sh=b.sh; b3Pop(b.tgt,'SHIELD TOOK '+b.soak,'#9fd0ff',{sc:2}); }
    if(b.tgt[0]==='f') { const a=B3P.fa[b.tgt]; a.hurtUntil=now+.7; a.shakeUntil=now+.28; a.flashUntil=now+.09; b3Sfx('hitEnemy'); }
    else { B3P.body[b.tgt]={kind:'hit',t0:now,dur:.45}; b3Sfx('hitParty'); }
    B3P.fx.push({kind:'burst',x:b3Spot(b.tgt).x,y:b3Spot(b.tgt).y,color:fl.color,t0:now,dur:.35});
  }
  else if(b.t==='miss') { b3Pop(b.tgt,b.why==='dodge'?'DODGE':'MISS','#e8ecf4'); b3Sfx('whoosh'); }
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
  else if(b.t==='shieldEnd') { vu.sh=b.sh; }
  else if(b.t==='soak') { b3Pop(b.tgt,'NO '+B3_STATUS[b.id].short,'#9fd0ff',{sc:2}); }
  else if(b.t==='revive') {
    vu.ko=false; vu.hp=b.hp; vu.st=[]; delete B3P.body[b.tgt]; V.bar=b.bar; b3RenderBar(b.tgt);
    b3Pop(b.tgt,'BACK UP!','#9be39a'); b3Sfx('heal'); b3Say(b3Name(b.tgt)+' is back in the fight with '+b.hp+' HP.');
  }
  else if(b.t==='standUp') { vu.ko=false; vu.hp=b.hp; delete B3P.body[b.tgt]; }
  else if(b.t==='skip') { b3Pop(b.who,'STUNNED','#f2d36b'); b3Say(b3Name(b.who)+' is stunned and loses the turn.'); }
  else if(b.t==='intercept') { b3Pop(b.src,'STEPS IN','#c9d8f0',{sc:2}); b3Say(b3Name(b.src)+' steps in for '+b3Name(b.tgt)+'.'); }
  else if(b.t==='react') {
    // A reaction begins: its owner strikes a pose and sends the answer across; the hit itself follows in the same group of beats.
    const S=B3_STATUS[b.id],a=b3Spot(b.src),z=b3Spot(b.tgt),K=B3_TEMPO;
    b3Say(b3Name(b.src)+': '+b.name+'!'); b3Pop(b.src,S?S.short:'ANSWER',S?S.color:'#fff1cb',{sc:2});
    if(b.src[0]==='f') B3P.fa[b.src].hold=now+.4*K; else B3P.body[b.src]={kind:'pose',f:B3_BODY.strike,t0:now,dur:.6*K};
    B3P.fx.push({kind:'proj',x0:a.x,y0:a.y,x1:z.x,y1:z.y,color:(S&&S.color)||'#fff1cb',t0:now+.05,dur:.28*K,arc:22}); b3Sfx('whoosh');
  }
  else if(b.t==='interrupt') { delete V.charge[b.tgt]; b3Pop(b.tgt,'INTERRUPTED','#ffe27a',{sc:2}); b3Sfx('combo'); b3Say(b3Name(b.tgt)+' loses '+b.name+'. It was cancelled.'); }
  else if(b.t==='hazardOn') { V.haz=V.haz.filter(h=>!(h.id===b.id&&h.side===b.side)); V.haz.push({id:b.id,side:b.side,uses:b.uses}); b3Word(B3_HAZARDS[b.id].name.toUpperCase(),B3_HAZARDS[b.id].color); }
  else if(b.t==='hazardTrip') { const h=V.haz.find(x=>x.id===b.id); if(h) h.uses=b.left; b3Pop(b.tgt,'SLIPPED!',B3_HAZARDS[b.id].color); b3Sfx('thud'); b3Say(b3Name(b.tgt)+' slips on the '+B3_HAZARDS[b.id].name.toLowerCase()+'.'); }
  else if(b.t==='hazardEnd') { V.haz=V.haz.filter(h=>!(h.id===b.id&&h.side===b.side)); }
  else if(b.t==='crack') { b3Pop(b.tgt,'CRACKED','#e6b08a',{sc:2}); }
  else if(b.t==='detonate') {
    const D=B3_DETONATIONS.find(d=>d.id===b.id),c=B3_FLAVORS[D.flavor].color;
    vu.st=vu.st.filter(id=>id!==b.prime);   // the Prime is used up
    b3Word(b.name,c); B3P.flash={color:c,t0:now,dur:.4}; b3Sfx('combo');
    b3Say(b.name+' '+b3Name(b.src)+' set off '+b3Name(b.tgt)+'’s '+B3_STATUS[b.prime].name+'.');
  }
  else if(b.t==='push') { V.bar=b.bar; b3RenderBar(b.tgt); b3Pop(b.tgt,'PUSHED BACK','#ffb070',{sc:2}); }
  else if(b.t==='pull') { V.bar=b.bar; b3RenderBar(b.tgt); b3Pop(b.tgt,b.placed?'UP NEXT':'PULLED UP','#9be39a',{sc:2}); b3Sfx('jumpWhistle'); }
  else if(b.t==='pep') { vu.pep=b.pep; if(b.g!=='pre') b3Pop(b.tgt,(b.n>0?'+':'')+b.n+' PEP',b.n>0?'#8dc4e6':'#ff9a8a',{sc:2}); }
  else if(b.t==='telegraph') { V.charge[b.src]=b.name; b3Pop(b.src,'!!','#ff8f80',{sc:4}); b3Sfx('charge'); b3Say(b3Name(b.src)+' is winding up '+b.name+'. It lands on its next turn.'); }
  else if(b.t==='act') { if(b.foe) delete V.charge[b.src]; }
  else if(b.t==='ko') {
    vu.ko=true; vu.st=[]; delete V.charge[b.tgt];
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
  let wait=0;
  for(const b of lead) { if(b.t==='over') continue; const w=wait; b3After(w,()=>b3Show(b)); if(b.t==='round') wait+=.55; else if(b.t==='hit'||b.t==='heal') wait+=.45; else if(b.t==='ko') wait+=.5; else if(b.t==='hazardTrip') wait+=.6; else if(b.t==='skip') wait+=.8; }
  if(!rest.length) { b3After(wait+.05,done); return; }
  b3After(wait,()=>b3PlayMove(rest,done));
}
function b3PlayMove(beats,done) {
  const head=beats[0];
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
  b3Say(who+(head.foe?' uses ':': ')+head.name+'.');
  let shown=0;
  // Every time below is written at the old quick pace and stretched by B3_TEMPO (K): at(), the body's keys and poses, things in flight.
  const K=B3_TEMPO,at=(s,fn)=>b3After(s*K,fn);
  const reveal=()=>{ const h=hits[shown++]; if(h) for(const b of h.beats) b3Show(b); };
  const wrap=()=>{ for(const b of tail) b3Show(b); b3ViewSync(); b3RenderParty(); b3After(.6,done); };
  const react=i=>{ const R=reacts[i]; if(!R) { wrap(); return; }
    b3Show(R.beats[0]); b3After(.34*K,()=>{ for(const b of R.beats.slice(1)) b3Show(b); b3After(.5*K,()=>react(i+1)); }); };
  const finish=s=>at(s,()=>{ while(shown<hits.length) reveal(); for(const b of post) b3Show(b); if(reacts.length) b3After(.3*K,()=>react(0)); else wrap(); });
  const shape=head.shape,foe=src[0]==='f',fl=B3_FLAVORS[head.flavor[0]]||B3_FLAVORS.support;
  // A move with no hits (a pass, a self buff): a pose, then the effects.
  if(!hits.length) {
    const tg=head.tgts[0];
    if(foe) B3P.fa[src].hold=B3P.t+.5*K; else B3P.body[src]={kind:'pose',f:shape==='give'?B3_BODY.give:B3_BODY.cast,t0:B3P.t,dur:.75*K};
    if(tg&&tg!==src) { const a=b3Spot(src),z=b3Spot(tg); B3P.fx.push({kind:'proj',x0:a.x,y0:a.y,x1:z.x,y1:z.y,color:fl.color,t0:B3P.t+.2*K,dur:.3*K,arc:40}); }
    at(.5,()=>{ for(const b of late) b3Show(b); });
    finish(.6); return;
  }
  let t=.05;
  if(shape==='strike') {
    // Wind up, dash to the target, strike (reveal), hop back for the next hit, then home.
    const keys=[],home=foe?null:b3PartyHome(b3Unit(B3.F,src));
    if(foe) {
      // An enemy leans back first (the hold), then lunges; the hit shows at the far point of the lunge.
      B3P.fa[src].hold=B3P.t+.22*K; t=.22;
      for(const h of hits) { const z=b3Spot(h.swing.tgts[0]); at(t,()=>{ B3P.fa[src].lunge={t0:B3P.t,dur:.55*K,tx:z.sx,ty:z.sb}; }); at(t+.27,reveal); t+=.6; }
      finish(t); return;
    }
    keys.push({t:0,x:home.cx,y:home.base,f:B3_BODY.windup},{t:.2,x:home.cx,y:home.base,f:B3_BODY.windup});
    t=.2;
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
  else B3P.body[src]={kind:'pose',f:shape==='give'?B3_BODY.give:shape==='throw'?B3_BODY.strike:B3_BODY.cast,t0:B3P.t,dur:(.35+hits.length*.34)*K};
  t=.2;
  for(const h of hits) {
    for(const k of h.swing.tgts) { const z=b3Spot(k); B3P.fx.push({kind:'proj',x0:a.x+(foe?20:-20),y0:a.y,x1:z.x,y1:z.y,color:fl.color,t0:B3P.t+t*K,dur:.26*K,arc:shape==='throw'?46:10}); }
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
  const bg=BG_IMG[(B3.cfg&&B3.cfg.bg)||'pond'];
  if(bg&&bg.complete&&bg.naturalWidth) { const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=true; gfx.imageSmoothingQuality='high'; gfx.drawImage(bg,0,0,576,324); gfx.imageSmoothingEnabled=sm; }
  else rect(0,0,576,324,'#14141c');
  if(!F||!V||B3.artWait) { gfx=ctx; return; }
  const picked=B3.ui==='target'&&B3.opts[B3.sel]?B3.opts[B3.sel].units.map(u=>u.key):[];
  // What lies on a side's floor (hazards): a sheen under that side's feet and a tag in the top corner on that side.
  for(const h of V.haz||[]) { const H=B3_HAZARDS[h.id],foe=h.side==='foe',L=foe?F.foes.filter(f=>!V.u[f.key].ko&&f.row!=='back'):[];
    gfx.globalAlpha=.3+.08*Math.sin(t*3);
    if(foe) for(const f of L) { const P=B3P.foe[f.key]; ellipse(P.px,P.py+1,P.def.sprite[0].length*P.sc*.62,7,H.color); }
    else for(const u of F.party) { const hm=b3PartyHome(u); ellipse(hm.cx,hm.base,34,6,H.color); }
    gfx.globalAlpha=1; b3Text(H.short+' x'+h.uses,foe?70:500,14,H.color,2); }
  // Enemies, back to front.
  for(const f of F.foes.slice().sort((a,b)=>B3P.foe[a.key].py-B3P.foe[b.key].py)) b3DrawFoe(f,t,picked.includes(f.key));
  // Party, back to front (slot order runs up-screen to down-screen).
  for(const u of F.party) b3DrawMember(u,t,picked.includes(u.key));
  // Things in flight and bursts.
  for(const e of B3P.fx) {
    const q=(t-e.t0)/e.dur; if(q<0) continue;
    if(e.kind==='proj') { const x=e.x0+(e.x1-e.x0)*q,y=e.y0+(e.y1-e.y0)*q-Math.sin(q*Math.PI)*(e.arc||0);
      for(let k=3;k>=1;k--) { gfx.globalAlpha=.18*k/3+.1; ellipse(x-(e.x1-e.x0)*.05*k,y-(e.y1-e.y0)*.05*k+Math.sin((q-.05*k)*Math.PI)*0,9-k*2,9-k*2,e.color); }
      gfx.globalAlpha=1; ellipse(x,y,8,8,'#141a22'); ellipse(x,y,6.5,6.5,e.color); ellipse(x-2,y-2,2.5,2.5,'#ffffff'); }
    else if(e.kind==='burst') { gfx.globalAlpha=Math.max(0,1-q); for(let k=0;k<8;k++) { const a=k*.785+.3,r=10+q*34; rect(e.x+Math.cos(a)*r-2,e.y+Math.sin(a)*r*.8-2,5,5,k%2?'#ffffff':e.color); } gfx.globalAlpha=1; }
  }
  if(B3P.flash) { const q=(t-B3P.flash.t0)/B3P.flash.dur; gfx.globalAlpha=.3*(1-q); rect(0,0,576,324,B3P.flash.color); gfx.globalAlpha=1; }
  // Numbers and tags.
  for(const p of B3P.pops) { const q=(t-p.t0)/p.dur,w=(String(p.text).length*4-1)*p.sc,x=Math.max(w/2+3,Math.min(573-w/2,p.x)),y=Math.max(4,p.y-q*22);
    gfx.globalAlpha=q>.75?(1-q)/.25:1; b3Text(p.text,x,y,p.color,p.sc); gfx.globalAlpha=1; }
  // Big words (round, Detonations), in the top band.
  B3P.words.forEach((w,i)=>{ const q=(t-w.t0)/w.dur,full=String(w.text).length>14?3:4,sc=q<.1?Math.max(1,Math.round(full*q/.1)):full;
    gfx.globalAlpha=q>.8?(1-q)/.2:1; b3Text(w.text,288,34+i*26,w.color,sc); gfx.globalAlpha=1; });
  gfx=ctx;
}
function b3DrawFoe(f,t,picked) {
  const L=B3P.foe[f.key],A=B3P.fa[f.key],vu=B3.view.u[f.key],def=L.def,R0=def.sprite,FR=def.frames,sc=L.sc;
  const dying=A.die!=null,dq=dying?Math.min(1,(t-A.die)/.9):0;
  if(dq>=1) return;
  const look=B3_FOE_LOOK[f.id]||{},hov=look.hover||0;
  let lq=0,lp=0; if(A.lunge) { lp=(t-A.lunge.t0)/A.lunge.dur; if(lp>=1) A.lunge=null; else lq=Math.sin(Math.PI*lp); }
  const hurt=dying||t<A.hurtUntil,holding=t<A.hold;
  let R=R0;
  if(FR) { if(A.lunge&&FR.attack.length) R=FR.attack[Math.min(FR.attack.length-1,Math.floor(lp*FR.attack.length))]; else if(hurt&&FR.hurt) R=FR.hurt; else if(holding&&FR.attack.length) R=FR.attack[0]; }
  const w=R[0].length*sc,h=R.length*sc,sw=R0[0].length*sc;
  const bob=hov&&!dying?Math.round(Math.sin(t*3+f.slot*1.7)*2)-hov:0,breath=dying||hov?0:(.5+.5*Math.sin(t*1.7+f.slot*1.7))*.008;
  const dx=A.lunge?(A.lunge.tx-L.px-sw*.5)*lq:0,dy=A.lunge?(A.lunge.ty-L.py)*lq-lq*10:0;
  const shake=t<A.shakeUntil?rand(-4,4):0,lean=holding&&!A.lunge?8:0;
  const x=Math.round(L.px-w/2+dx+shake-lean),y=Math.round(L.py-h+bob+dy-dq*30);
  if(!dying) ellipse(L.px+dx,L.py-1+(A.lunge?(A.lunge.ty-L.py)*lq:0),sw*.48*(hov?.8:1),Math.max(4,sc*2),hov?'rgba(30,50,40,.22)':'rgba(30,50,40,.3)');
  const flash=t<A.flashUntil||(dying&&dq>.1),alpha=1-dq;
  if(breath&&!A.lunge&&!shake&&!holding) { gfx.save(); gfx.translate(L.px,L.py); gfx.scale(1,1+breath); gfx.translate(-L.px,-L.py); drawSprite(R,def.pal,x,y,sc,{flash,alpha}); gfx.restore(); }
  else drawSprite(R,def.pal,x,y,sc,{flash,alpha});
  if(dying) return;
  // HP meter and letter under the feet; statuses and a wind-up badge over the head.
  const bw=Math.max(40,Math.min(64,sw*.7)),bx=Math.round(L.px-bw/2),byy=Math.min(L.py+9,324-12),r=vu.hp/vu.maxHp;
  b2Meter(bx,byy,bw,7,r,r<=.25?B2_METER.crit:r<=.5?B2_METER.low:B2_METER.hp);
  if(f.letter) b2MeterTag(bx-10,byy+5,f.letter);
  const top=L.py-R0.length*sc+bob;
  let sy=top-14;
  if(B3.view.charge[f.key]) { const yy=sy-Math.round(Math.abs(Math.sin(t*6))*3); b3Text('!! '+B3.view.charge[f.key],L.px,yy,'#ff8f80',2); sy-=14; }
  for(const id of b3ViewIcons(f.key)) { const S=B3_STATUS[id]; b3Text(S.short,L.px,sy,S.color,2); sy-=13; }
  if(picked) b3Arrow(L.px,sy-2-Math.round(Math.abs(Math.sin(t*6))*5),'#ffe27a');
}
function b3DrawMember(u,t,picked) {
  const sp=BATTLE_SPRITES[u.id],home=b3PartyHome(u),vu=B3.view.u[u.key],A=B3P.body[u.key];
  let cx=home.cx,base=home.base,fk=B3_BODY.idle,flash=false,hop=0;
  if(vu.ko) {
    const koE=A&&A.kind==='ko'?t-A.t0:9,frame=koE<.16?sp.idle:koFrame(sp),w=frame[0].length*sp.scale,h=frame.length*sp.scale;
    const sink=koE<.16?Math.round(koE/.16*8):-Math.round(Math.max(0,Math.sin(Math.min(1,(koE-.16)/.3)*Math.PI))*5);
    ellipse(cx,base-1,w*.3,5,'rgba(47,73,54,.34)');
    drawKnockedOut({id:u.id},u.slot,sp,frame,cx-w/2,base+sink-h,cx,base+sink,koE,t,{flash:0});
    return;
  }
  const low=vu.hp/vu.maxHp<=B3_RULES.lowHp;
  if(A&&A.kind!=='ko'&&t-A.t0>=A.dur) delete B3P.body[u.key];
  const B=B3P.body[u.key];
  if(B&&B.kind==='path') {
    const e=t-B.t0,K=B.keys; let i=0; while(i<K.length-2&&e>=K[i+1].t) i++;
    const a=K[i],b=K[i+1],q=Math.max(0,Math.min(1,(e-a.t)/Math.max(.001,b.t-a.t))),s=q*q*(3-2*q);
    cx=a.x+(b.x-a.x)*s; base=a.y+(b.y-a.y)*s; fk=q<1?a.f:b.f; if(b.hop) hop=Math.sin(q*Math.PI)*b.hop;
  } else if(B&&B.kind==='pose') fk=B.f;
  else if(B&&B.kind==='hit') { fk=B3_BODY.hit; const e=t-B.t0; if(e<.25) cx+=rand(-4,4); flash=e<.08; }
  else if(B3P.cheer) { fk=B3_BODY.victory; hop=Math.abs(Math.sin(t*6+u.slot))*16; }
  else if(low) fk=B3_BODY.low;
  const frame=sp[fk]||sp.idle,w=frame[0].length*sp.scale,h=frame.length*sp.scale,ft=feetOf(frame);
  ellipse(cx+ft.dx*sp.scale,base-1,Math.max(ft.w*sp.scale*.62,w*.3),5,'rgba(47,73,54,.34)');
  const x=Math.round(cx-w/2),y=Math.round(base-h-hop);
  const idle=fk===B3_BODY.idle,breath=idle?(.5+.5*Math.sin(t*1.7+u.slot*1.3))*.008:0;
  activeKneelCut=frame===sp.kneel&&!sp.noShift?Math.round(sp.idle.length*.62):0;
  if(breath) { gfx.save(); gfx.translate(cx,base); gfx.scale(1,1+breath); gfx.translate(-cx,-base); drawSprite(frame,sp.pal,x,y,sp.scale,{flash}); gfx.restore(); }
  else drawSprite(frame,sp.pal,x,y,sp.scale,{flash});
  activeKneelCut=0;
  // The turn marker and the target arrow. (A family member's statuses show on their card, not over the head.)
  const sy=y-10;
  if(picked) b3Arrow(cx,sy-2-Math.round(Math.abs(Math.sin(t*6))*5),'#9be39a');
  else if(B3.actor===u&&battle.state==='command'&&B3.ui!=='target') b3Arrow(cx,sy-2-Math.round(Math.abs(Math.sin(t*5))*4),'#fff1cb');
}
